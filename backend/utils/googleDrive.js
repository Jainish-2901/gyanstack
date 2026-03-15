const { google } = require('googleapis');
const fs = require('fs');
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Default redirect
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Utility to escape single quotes for Drive API queries
const escapeQuery = (val) => val.replace(/'/g, "\\'");

let driveInstance = null;
const getDriveInstance = async () => {
    if (driveInstance) return driveInstance;
    try {
        driveInstance = google.drive({ version: 'v3', auth: oauth2Client });
        return driveInstance;
    } catch (err) {
        console.error("Google Drive Auth Error (OAuth2):", err.message);
        throw err;
    }
};

/**
 * Google Drive mein folder path ensure karne ke liye (Nahi hai to create karega)
 * @param {Array} folderNames - Folder names ka path (e.g. ['BCA', 'Sem 4'])
 * @returns {String} Target folder ki ID
 */
const ensureFolderPath = async (folderNames) => {
    const drive = await getDriveInstance();
    let currentParentId = FOLDER_ID;

    for (const folderName of folderNames) {
        // Check if folder exists under current parent (with escaping)
        const escapedName = escapeQuery(folderName);
        const response = await drive.files.list({
            q: `name = '${escapedName}' and '${currentParentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (response.data.files && response.data.files.length > 0) {
            // Already exists
            currentParentId = response.data.files[0].id;
        } else {
            // Create new folder
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [currentParentId],
            };
            const folder = await drive.files.create({
                requestBody: folderMetadata,
                fields: 'id',
            });
            currentParentId = folder.data.id;

            // --- OPTIMIZATION: Make folder public so files inherit permissions ---
            try {
                await drive.permissions.create({
                    fileId: currentParentId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                });
            } catch (pErr) {
                console.warn(`Failed to set folder permissions for ${folderName}:`, pErr.message);
            }
        }
    }
    return currentParentId;
};

/**
 * Google Drive par file upload karne ke liye
 * @param {Object} file - Multer file object
 * @param {Array} folderNames - Path segments for folders (optional if id provided)
 * @param {string} folderId - Direct target folder ID (optional)
 */
const uploadToDrive = async (file, folderNames = [], folderId = null) => {
    try {
        const drive = await getDriveInstance();
        if (!FOLDER_ID || FOLDER_ID === 'your-folder-id-here') {
            throw new Error("GOOGLE_DRIVE_FOLDER_ID is missing in .env or not configured.");
        }

        // Target folder ID resolve karein (Use provided ID or resolve from path)
        let targetFolderId = folderId;
        
        // --- NAYA: Folder ID Validation ---
        // Agar folder ID diya gaya hai, to check karein ki woh abhi bhi Drive par hai
        if (targetFolderId) {
            try {
                await drive.files.get({ 
                    fileId: targetFolderId, 
                    fields: 'id, trashed',
                    supportsAllDrives: true 
                });
            } catch (err) {
                // Agar folder nahi mil raha (404), to use null kar dein taake recalibrate ho sake
                if (err.status === 404 || (err.response && err.response.status === 404)) {
                    console.warn(`Folder ID ${targetFolderId} not found on Drive. Falling back to path assurance...`);
                    targetFolderId = null;
                } else {
                    throw err; // Koi aur error hai to aage bhej dein
                }
            }
        }
        
        if (!targetFolderId) {
            targetFolderId = folderNames.length > 0 
                ? await ensureFolderPath(folderNames) 
                : FOLDER_ID;
        }

        const fileMetadata = {
            name: file.originalname,
            parents: [targetFolderId],
        };

        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
            supportsAllDrives: true,
            uploadType: 'resumable', // Optimized for 5MB+ files
        });

        const fileId = response.data.id;

        // Note: No longer calling drive.permissions.create per file here 
        // to save time, as we handle it at the folder level now.

        return {
            id: fileId,
            webViewLink: response.data.webViewLink,
            webContentLink: response.data.webContentLink,
            parentFolderId: targetFolderId // Return the ID used
        };
    } catch (error) {
        console.error('Google Drive Upload Error:', error);
        throw error;
    }
};

/**
 * Google Drive se file delete karne ke liye
 * @param {string} fileId - Google Drive file ID
 */
const deleteFromDrive = async (fileId) => {
    try {
        const drive = await getDriveInstance();
        await drive.files.delete({ fileId });
        return true;
    } catch (error) {
        console.error('Google Drive Delete Error:', error);
        return false;
    }
};

/**
 * Google Drive par file rename ya move karne ke liye
 * @param {string} fileId - Google Drive ID
 * @param {string} newName - Naya title (optional)
 * @param {Array} newFolderNames - Naya path (optional)
 */
const updateDriveFile = async (fileId, newName = null, newFolderNames = null) => {
    try {
        const drive = await getDriveInstance();
        const updateBody = {};
        if (newName) updateBody.name = newName;

        let moveOptions = {};
        if (newFolderNames) {
            // Get current parents to remove them
            const file = await drive.files.get({ fileId, fields: 'parents' });
            const previousParents = file.data.parents ? file.data.parents.join(',') : '';
            
            const targetFolderId = newFolderNames.length > 0 
                ? await ensureFolderPath(newFolderNames) 
                : FOLDER_ID;

            moveOptions = {
                addParents: targetFolderId,
                removeParents: previousParents
            };
        }

        const response = await drive.files.update({
            fileId: fileId,
            requestBody: updateBody,
            ...moveOptions,
            fields: 'id, name, parents',
            supportsAllDrives: true,
        });

        return response.data;
    } catch (error) {
        console.error('Google Drive Sync Update Error:', error);
        throw error;
    }
};

/**
 * Google Drive par folder ID dhoondhne ke liye (Nahi hai to null return karega)
 */
const findFolderIdByPath = async (folderNames) => {
    try {
        const drive = await getDriveInstance();
        let currentParentId = FOLDER_ID;

        for (const folderName of folderNames) {
            const escapedName = escapeQuery(folderName);
            const response = await drive.files.list({
                q: `name = '${escapedName}' and '${currentParentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id)',
                spaces: 'drive',
            });

            if (response.data.files && response.data.files.length > 0) {
                currentParentId = response.data.files[0].id;
            } else {
                return null;
            }
        }
        return currentParentId;
    } catch (error) {
        console.error('Find Folder ID Error:', error);
        return null;
    }
};

/**
 * Check if a folder on Drive is empty
 */
const isDriveFolderEmpty = async (folderId) => {
    try {
        const drive = await getDriveInstance();
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id)',
            pageSize: 1
        });
        return !response.data.files || response.data.files.length === 0;
    } catch (error) {
        console.error('Check Empty Folder Error:', error);
        return false;
    }
};

module.exports = { 
    uploadToDrive, 
    deleteFromDrive, 
    updateDriveFile, 
    findFolderIdByPath,
    isDriveFolderEmpty,
    ensureFolderPath
};
