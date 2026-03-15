const cloudinary = require('cloudinary').v2;
const Content = require('../models/contentModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel'); 
const { uploadToDrive, deleteFromDrive, updateDriveFile, findFolderIdByPath, isDriveFolderEmpty } = require('../utils/googleDrive');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- HELPER FUNCTIONS ---
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const folderIndex = parts.findIndex(part => part === 'gyanstack_uploads');
    if (folderIndex === -1) return null;
    
    const publicIdWithExtension = parts.slice(folderIndex).join('/');
    const publicId = publicIdWithExtension.split('.').slice(0, -1).join('.');
    return publicId;
  } catch (e) {
    return null;
  }
};

// Recursive path finder for Categories
// Recursive path finder for Categories (Returns { names, folderId })
const getCategoryPath = async (categoryId) => {
  const mongoose = require('mongoose');

  // Default to Root Drive Folder ID
  if (!categoryId || categoryId === 'root') {
      return { names: [], folderId: process.env.GOOGLE_DRIVE_FOLDER_ID };
  }

  // VALIDATION: Ensure categoryId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    console.warn(`Invalid Category ID provided: ${categoryId}. Falling back to root.`);
    return { names: [], folderId: process.env.GOOGLE_DRIVE_FOLDER_ID };
  }

  const pathNames = [];
  const hierarchyOfCats = [];
  let currentId = categoryId;
  
  // Build hierarchy from leaf to root
  while (currentId && currentId !== 'root') {
    if (!mongoose.Types.ObjectId.isValid(currentId)) break;

    const cat = await Category.findById(currentId);
    if (!cat) break;
    pathNames.unshift(cat.name);
    hierarchyOfCats.unshift(cat);
    currentId = cat.parentId;
  }

  // The actual category we are uploading to
  const leafCategory = hierarchyOfCats.length > 0 ? hierarchyOfCats[hierarchyOfCats.length - 1] : null;

  // If the leaf category ALREADY has a Drive ID, we can use it directly!
  if (leafCategory && leafCategory.googleDriveFolderId) {
    return { names: pathNames, folderId: leafCategory.googleDriveFolderId };
  }

  // If leaf has no ID, we MUST resolve/ensure path and then cache it
  if (leafCategory && hierarchyOfCats.length > 0) {
    try {
      const { ensureFolderPath } = require('../utils/googleDrive');
      
      const folderId = await ensureFolderPath(pathNames);
      
      // Cache this ID
      leafCategory.googleDriveFolderId = folderId;
      await leafCategory.save();
      
      return { names: pathNames, folderId: folderId };
    } catch (err) {
      console.error("Critical Category Path Error:", err.message);
    }
  }

  return { names: pathNames, folderId: null };
};

// Automaticaly delete empty category folder from Drive
const cleanupEmptyCategoryFolder = async (categoryId) => {
  try {
    if (!categoryId || categoryId === 'root') return;
    
    console.log(`Checking cleanup for category: ${categoryId}`);

    // 1. Check if any content exists for this category
    const contentCount = await Content.countDocuments({ categoryId });
    console.log(`Content count for ${categoryId}: ${contentCount}`);
    if (contentCount > 0) return;

    // 2. Check if any child categories exist
    const childCategories = await Category.countDocuments({ parentId: categoryId });
    console.log(`Child categories count for ${categoryId}: ${childCategories}`);
    if (childCategories > 0) return;

    // 3. Get folder path names and ID
    const { names: folderPath, folderId } = await getCategoryPath(categoryId);
    console.log(`Folder path/ID for cleanup of ${categoryId}:`, folderPath, folderId);
    
    if (!folderId || folderId === process.env.GOOGLE_DRIVE_FOLDER_ID) {
        console.log("Root folder or missing ID, skipping Drive deletion.");
        return;
    }

    // 4. Final verify: Is the folder actually empty on Drive too?
    try {
      const physicallyEmpty = await isDriveFolderEmpty(folderId);
      if (physicallyEmpty) {
        await deleteFromDrive(folderId);
        console.log(`Successfully deleted empty category folder [${folderPath.join('/')}] ID: ${folderId}`);
      } else {
        console.log(`Folder [${folderPath.join('/')}] not deleted because it still contains files or subfolders.`);
      }
    } catch (err) {
      console.warn("Drive cleanup verification failed:", err.message);
    }
  } catch (err) {
    console.error("Cleanup Folder Error:", err.message);
  }
};
// -----------------------

// 1. Naya Content Upload Karna (Google Drive)
exports.uploadContent = async (req, res) => {
  console.log("--- START UPLOAD REQUEST ---");
  console.log("Body:", req.body);
  console.log("Files:", req.files ? req.files.map(f => f.originalname) : "No files");
  
  try {
    let { title, type, link, textNote, categoryId, tags } = req.body;
    
    // Sanitize title: Handle arrays or repeated strings (e.g., "Title, Title")
    if (title) {
      if (Array.isArray(title)) title = title[0];
      if (typeof title === 'string') {
        // Remove repeated parts if they are identical (handles "Title, Title" or "Title, Title - Title")
        const cleanParts = title.split(/[,\-]+/).map(p => p.trim()).filter(p => p);
        const uniqueParts = [...new Set(cleanParts)];
        if (uniqueParts.length === 1) {
          title = uniqueParts[0];
        }
      }
    }
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const uploadedItems = [];
    let lastError = null;
    
    // --- BATCH UPLOAD (Google Drive) ---
    if (req.files && req.files.length > 0) {
      const { names: folderPath, folderId: directFolderId } = await getCategoryPath(categoryId);
      
      // Sequential processing is MUCH more stable for server resources (FFmpeg/Sharp)
      // and avoids Google Drive rate limit issues.
      for (const file of req.files) {
        let currentFilePath = file.path;

        try {
          // --- IMAGE OPTIMIZATION ---
          if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
            try {
              const optName = `opt-${Date.now()}-${path.parse(file.originalname).name}.webp`;
              const compressedPath = path.join(path.dirname(file.path), optName);
              
              await sharp(file.path)
                .resize({ width: 1200, withoutEnlargement: true })
                .webp({ quality: 80, effort: 6 }) 
                .toFile(compressedPath);
              
              if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
              currentFilePath = compressedPath;
              file.originalname = optName;
              file.mimetype = 'image/webp';
            } catch (sharpErr) {
              console.warn("Sharp optimization failed:", sharpErr.message);
            }
          } 
          // --- VIDEO OPTIMIZATION ---
          else if (file.mimetype.startsWith('video/') && file.size > 15 * 1024 * 1024) { 
            try {
              const optName = `opt-${Date.now()}-${path.parse(file.originalname).name}.mp4`;
              const compressedPath = path.join(path.dirname(file.path), optName);
              
              await new Promise((resolve, reject) => {
                ffmpeg(file.path)
                  .outputOptions(['-vf scale=-1:720', '-vcodec libx264', '-crf 28', '-preset fast'])
                  .toFormat('mp4')
                  .on('error', reject)
                  .on('end', resolve)
                  .save(compressedPath);
              });

              if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
              currentFilePath = compressedPath;
              file.originalname = optName;
              file.mimetype = 'video/mp4';
            } catch (ffmpegErr) {
              console.warn("FFmpeg compression failed:", ffmpegErr.message);
            }
          }

          // Upload to Drive
          console.log(`Uploading file ${file.originalname} to Drive...`);
          const driveData = await uploadToDrive({ ...file, path: currentFilePath }, folderPath, directFolderId);
          console.log(`Drive upload success: ${driveData.id}`);
          
          const filename = file.originalname;
          const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename;
          
          const newContent = new Content({
            title: (req.files.length === 1 && title) ? title : nameWithoutExt,
            type: file.mimetype,
            url: driveData.webViewLink,
            googleDriveId: driveData.id,
            fileResourceType: 'raw', 
            categoryId,
            tags: tagsArray,
            uploadedBy: req.user.id, 
          });
          
          const savedItem = await newContent.save();
          console.log(`Database entry created for: ${savedItem.title}`);
          uploadedItems.push(savedItem);
          
          // Cleanup
          if (fs.existsSync(currentFilePath)) fs.unlinkSync(currentFilePath);
          
        } catch (uploadErr) {
          console.error(`ERROR uploading file ${file.originalname}:`, uploadErr);
          if (fs.existsSync(file.path)) try { fs.unlinkSync(file.path); } catch(e) {}
          lastError = uploadErr.message || 'File upload failed during processing';
        }
      }
      
      if (uploadedItems.length === 0 && lastError) {
        return res.status(400).json({ message: `Upload failed: ${lastError}` });
      }
    } else {
      // Scenario 2: Single Item (Link or Note)
      let fileUrl = '';
      let finalFileType = type; // Default type 'note' ya 'link'
      let fileResourceType = 'auto'; // Default type (link/note)

      // Agar single file aayi hai (jo theoretically upload.array me nahi honi chahiye, but safety ke liye)
      // Note: Hum maan rahe hain ki agar files nahi hain, to yeh link ya note hai.

      if (type === 'link') { 
        fileUrl = link; 
      } else if (type === 'note') {
         // textNote field ko blank chodenge agar link/file type ho
      }
      
      const newContent = new Content({
        title: title || "Untitled Note/Link",
        type: finalFileType,
        url: fileUrl,
        fileResourceType: fileResourceType, 
        textNote: type === 'note' ? textNote : '', 
        categoryId,
        tags: tagsArray,
        uploadedBy: req.user.id, 
      });
      console.log("Saving individual item to DB...");
      const saved = await newContent.save();
      console.log("Save success:", saved._id);
      uploadedItems.push(saved);
    }
    // --- END BATCH UPLOAD LOGIC ---

    if (uploadedItems.length === 0) {
        console.error("CRITICAL: No items uploaded. lastError:", lastError);
        return res.status(400).json({ 
          success: false,
          message: lastError ? `Upload Failed: ${lastError}` : 'No valid files received or all files failed.' 
        });
    }

    // Success reporting
    const message = uploadedItems.length > 1 
                    ? `${uploadedItems.length} files processed and uploaded successfully!` 
                    : `Content uploaded and optimized successfully!`;
    
    res.status(201).json({ success: true, message, content: uploadedItems }); 

  } catch (err) {
    console.error("FATAL Upload Error:", err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error during upload processing',
        error: process.env.NODE_ENV === 'production' ? 'Upload Worker Failure' : err.message
    });
  }
};

// 2. Sabhi Content Lena (Filtering ke saath) (Public)
// ... (Ye function pehle jaisa hi sahi hai, koi change nahi) ...
exports.getContent = async (req, res) => {
  try {
    const query = {};
    
    // Recursive Category Fetch Logic
    if (req.query.categoryId) { 
      // Helper function to get all sub-category IDs
      const getAllChildIds = async (pId) => {
        let childIds = [pId];
        const subCategories = await Category.find({ parentId: pId });
        for (const sub of subCategories) {
          const nestedIds = await getAllChildIds(sub._id.toString());
          childIds = childIds.concat(nestedIds);
        }
        return childIds;
      };

      const allCatIds = await getAllChildIds(req.query.categoryId);
      query.categoryId = { $in: allCatIds }; 
    }

    if (req.query.uploadedBy) { query.uploadedBy = req.query.uploadedBy; }
    
    // Add logic to search by uploader name if requested
    if (req.query.uploader) {
      const uploaderUser = await User.findOne({ 
        username: { $regex: req.query.uploader, $options: 'i' } 
      });
      if (uploaderUser) {
        query.uploadedBy = uploaderUser._id;
      }
    }

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    let sortObj = { createdAt: -1 };
    let projectObj = {};
    if (req.query.search) {
      sortObj = { score: { $meta: "textScore" } };
      projectObj = { score: { $meta: "textScore" } };
    }

    const content = await Content.find(query, projectObj).sort(sortObj);
    res.json({ content });
  } catch (err) {
    console.error("getContent error:", err.message);
    res.status(500).json({ message: 'Server error (getContent): ' + err.message });
  }
};

// 3. Ek Single Content Piece Lena (Aur View Count badhana)
// ... (Ye function pehle jaisa hi sahi hai, koi change nahi) ...
exports.getSingleContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } }, 
      { new: true } 
    ).populate('uploadedBy', 'username email'); 

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 4. Content ko Like/Unlike Karna (Toggle)
// ... (Ye function pehle jaisa hi sahi hai, koi change nahi) ...
exports.likeContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const userIndex = content.likedBy.findIndex(userId => userId.equals(req.user.id));

    if (userIndex > -1) {
      content.likedBy.splice(userIndex, 1);
      content.likesCount -= 1;
    } else {
      content.likedBy.push(req.user.id);
      content.likesCount += 1;
    }

    await content.save();
    res.json({ likesCount: content.likesCount, isLiked: userIndex === -1 });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 5. Admin ka Apna Content Fetch Karna (Admin Only)
// ... (Ye function pehle jaisa hi sahi hai, koi change nahi) ...
exports.getMyContent = async (req, res) => {
  try {
    const content = await Content.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ content });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 6. Content Update Karna (Admin Only) - (CHANGED with Drive Sync)
exports.updateContent = async (req, res) => {
    const { title, categoryId, tags, url, textNote } = req.body;
    try {
      let content = await Content.findById(req.params.id);
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      if (content.uploadedBy.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
      }
      
      // Update karne ke liye data object
      const updateData = {};
      if (title) updateData.title = title;
      if (categoryId) updateData.categoryId = categoryId;
      if (url) updateData.url = url;
      if (textNote !== undefined) updateData.textNote = textNote;
      if (typeof tags === 'string') {
          updateData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }

    // --- FILE REPLACE LOGIC ---
    if (req.file) {
      // Purana file delete karein
      if (content.googleDriveId) {
        await deleteFromDrive(content.googleDriveId);
      } else if (content.url && content.fileResourceType !== 'auto') {
        const publicId = getPublicIdFromUrl(content.url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: content.fileResourceType || 'raw' });
        }
      }
      
      // Naya file upload karein
      const { names: folderPath, folderId: directFolderId } = await getCategoryPath(categoryId || content.categoryId);
      
      let currentFilePath = req.file.path;
      // Image Optimization (WebP)
      if (req.file.mimetype.startsWith('image/') && !req.file.mimetype.includes('svg')) {
        try {
          const optName = `opt-upd-${path.parse(req.file.originalname).name}.webp`;
          const optPath = path.join(path.dirname(req.file.path), optName);
          await sharp(req.file.path)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 75, effort: 6 })
            .toFile(optPath);
          
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          currentFilePath = optPath;
          req.file.originalname = optName;
          req.file.mimetype = 'image/webp';
        } catch (err) {
          console.warn("Update optimization failed:", err.message);
        }
      }
      // Video Optimization (FFmpeg)
      else if (req.file.mimetype.startsWith('video/') && req.file.size > 10 * 1024 * 1024) {
        try {
          const optName = `opt-upd-${path.parse(req.file.originalname).name}.mp4`;
          const optPath = path.join(path.dirname(req.file.path), optName);
          await new Promise((resolve, reject) => {
            ffmpeg(req.file.path)
              .outputOptions(['-vf scale=-1:720', '-vcodec libx264', '-crf 28', '-preset fast'])
              .toFormat('mp4')
              .on('error', reject)
              .on('end', resolve)
              .save(optPath);
          });
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          currentFilePath = optPath;
          req.file.originalname = optName;
          req.file.mimetype = 'video/mp4';
        } catch (err) {
          console.warn("Update video optimization failed:", err.message);
        }
      }

      const driveData = await uploadToDrive({ ...req.file, path: currentFilePath }, folderPath, directFolderId);
      
      // Drive file ko naya name dena agar title specified hai (warna original)
      if (title && title !== req.file.originalname) {
        await updateDriveFile(driveData.id, title);
      }

      updateData.url = driveData.webViewLink;
      updateData.googleDriveId = driveData.id;
      updateData.type = req.file.mimetype;
      updateData.fileResourceType = 'raw';

      if (fs.existsSync(currentFilePath)) fs.unlinkSync(currentFilePath);
    } 
    // --- SYNC WITH DRIVE (Title ya Category change hone par) ---
    else if (content.googleDriveId) {
      let syncName = null;
      let syncPathNames = null;
      
      if (title && title !== content.title) syncName = title;
      if (categoryId && categoryId !== content.categoryId.toString()) {
        const { names } = await getCategoryPath(categoryId);
        syncPathNames = names;
      }
      
      if (syncName || syncPathNames) {
        // Note: updateDriveFile takes path names to resolve ID if needed
        await updateDriveFile(content.googleDriveId, syncName, syncPathNames);
      }
    }

    const oldCategoryId = content.categoryId;

    content = await Content.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, 
      { new: true } 
    );

    // Cleanup old category if it changed
    if (categoryId && categoryId !== oldCategoryId.toString()) {
      await cleanupEmptyCategoryFolder(oldCategoryId);
    }

    res.json(content);

  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).send('Server error while updating content');
  }
};

// 7. Content Delete Karna (Admin Only) - (CHANGED)
exports.deleteContent = async (req, res) => {
  try {
    let content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    if (content.uploadedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // --- DELETE LOGIC (Cloudinary or Drive) ---
    if (content.googleDriveId) {
      await deleteFromDrive(content.googleDriveId);
    } else if (content.url && content.fileResourceType !== 'auto') {
      const publicId = getPublicIdFromUrl(content.url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: content.fileResourceType || 'raw' });
      }
    }
    
    await Content.findByIdAndDelete(req.params.id);
    
    // Cleanup empty folder after deletion
    if (content.categoryId) {
      await cleanupEmptyCategoryFolder(content.categoryId);
    }

    res.json({ message: 'Content removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 7.1 Bulk Delete Content (Admin Only)
exports.bulkDeleteContent = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided for bulk delete.' });
    }

    const contents = await Content.find({ _id: { $in: ids } });
    
    for (const content of contents) {
      // Check authorization
      if (content.uploadedBy.toString() !== req.user.id) continue;

      // DELETE LOGIC (Same as single delete)
      if (content.googleDriveId) {
        await deleteFromDrive(content.googleDriveId);
      } else if (content.url && content.fileResourceType !== 'auto') {
        const publicId = getPublicIdFromUrl(content.url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: content.fileResourceType || 'raw' });
        }
      }
    }

    // Delete from DB
    await Content.deleteMany({ _id: { $in: ids }, uploadedBy: req.user.id });
    
    // Cleanup folders for all affected categories
    const affectedCategoryIds = [...new Set(contents.map(c => c.categoryId))];
    for (const catId of affectedCategoryIds) {
      await cleanupEmptyCategoryFolder(catId);
    }
    
    res.json({ message: `${ids.length} items deleted successfully.` });
  } catch (err) {
    console.error("Bulk Delete Error:", err.message);
    res.status(500).json({ message: 'Server error during bulk delete.' });
  }
};

// --- NAYA FUNCTION (SAVE/BOOKMARK) ---
// 8. Content ko Save/Unsave Karna (Toggle)
exports.saveContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // 'savedBy' array me check karein
    const userIndex = content.savedBy.findIndex(userId => userId.equals(req.user.id));

    if (userIndex > -1) {
      // Agar mil gaya, to unsave karein
      content.savedBy.splice(userIndex, 1);
      content.savesCount = Math.max(0, content.savesCount - 1); // Niche -1 na jaaye
    } else {
      // Agar nahi mila, to save karein
      content.savedBy.push(req.user.id);
      content.savesCount += 1;
    }

    await content.save();
    
    // Naya count aur status return karein
    res.json({ savesCount: content.savesCount, isSaved: userIndex === -1 });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error (saveContent)');
  }
};

// 9. User ke sabhi saved items ko fetch karna
exports.getSavedContent = async (req, res) => {
  try {
    // Aisa content dhoondein jiske 'savedBy' array me current user ki ID ho
    const savedContent = await Content.find({ 
      savedBy: req.user.id 
    }).sort({ createdAt: -1 }); // Naye save kiye hue upar

    res.json({ content: savedContent });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error (getSavedContent)');
  }
};

// 10. Download count ko track karna
exports.trackDownload = async (req, res) => {
  try {
    // Sirf $inc (increment) operation ka istemaal karein
    // Ye 'getSingleContent' se tez hai kyunki ye poora document fetch nahi karta
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadsCount: 1 } }, // downloadsCount ko 1 se badhayein
      { new: true } // Taaki hum naya count (optional) return kar sakein
    );

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Naya count return karein (taaki future me analytics me use kar sakein)
    res.json({ downloadsCount: content.downloadsCount });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error (trackDownload)');
  }
};
// --- END OF NAYA FUNCTION ---