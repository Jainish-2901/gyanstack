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

const getDriveInstance = async () => {
    try {
        return google.drive({ version: 'v3', auth: oauth2Client });
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
        // Check if folder exists under current parent
        const response = await drive.files.list({
            q: `name = '${folderName}' and '${currentParentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
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
        }
    }
    return currentParentId;
};

/**
 * Google Drive par file upload karne ke liye
 * @param {Object} file - Multer file object
 * @param {Array} folderNames - Path segments for folders
 */
const uploadToDrive = async (file, folderNames = []) => {
    try {
        const drive = await getDriveInstance();
        if (!FOLDER_ID || FOLDER_ID === 'your-folder-id-here') {
            throw new Error("GOOGLE_DRIVE_FOLDER_ID is missing in .env or not configured.");
        }

        // Target folder ID resolve karein (Recursive logic)
        const targetFolderId = folderNames.length > 0 
            ? await ensureFolderPath(folderNames) 
            : FOLDER_ID;

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
        });

        const fileId = response.data.id;

        // Permissions: Publicly readable
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return {
            id: fileId,
            webViewLink: response.data.webViewLink,
            webContentLink: response.data.webContentLink,
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

module.exports = { uploadToDrive, deleteFromDrive };
