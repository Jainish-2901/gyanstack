const cloudinary = require('cloudinary').v2;
const Content = require('../models/contentModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel'); 
const { uploadToDrive, deleteFromDrive } = require('../utils/googleDrive');
const fs = require('fs');

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
const getCategoryPath = async (categoryId) => {
  if (!categoryId || categoryId === 'root') return [];
  const path = [];
  let currentId = categoryId;
  
  while (currentId && currentId !== 'root') {
    const cat = await Category.findById(currentId);
    if (!cat) break;
    path.unshift(cat.name); // Add to beginning
    currentId = cat.parentId;
  }
  return path;
};
// -----------------------

// 1. Naya Content Upload Karna (Google Drive)
exports.uploadContent = async (req, res) => {
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
      // Get category path for Drive organization
      const folderPath = await getCategoryPath(categoryId);
      
      for (const file of req.files) {
        try {
          const driveData = await uploadToDrive(file, folderPath);
          const newContent = new Content({
            title: title || file.originalname,
            type: file.mimetype,
            url: driveData.webViewLink,
            googleDriveId: driveData.id,
            fileResourceType: 'raw', 
            categoryId,
            tags: tagsArray,
            uploadedBy: req.user.id, 
          });
          const savedItem = await newContent.save();
          uploadedItems.push(savedItem);
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (uploadErr) {
          console.error("Upload failed for file:", file.originalname, uploadErr);
          lastError = uploadErr.message;
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
        title,
        type: finalFileType,
        url: fileUrl,
        fileResourceType: fileResourceType, 
        textNote: type === 'note' ? textNote : '', 
        categoryId,
        tags: tagsArray,
        uploadedBy: req.user.id, 
      });
      uploadedItems.push(await newContent.save());
    }
    // --- END BATCH UPLOAD LOGIC ---

    if (uploadedItems.length === 0) {
        console.error("No items uploaded. lastError:", lastError);
        return res.status(400).json({ 
          message: lastError ? `Upload failed: ${lastError}` : 'No valid content or file received for upload.' 
        });
    }

    // FIX: Batch upload ke liye saaf success message
    const message = uploadedItems.length > 1 
                    ? `${uploadedItems.length} files uploaded successfully!` 
                    : `Content uploaded successfully!`;
    
    res.status(201).json({ message, content: uploadedItems }); 

  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).send('Server error (Controller)');
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

// 6. Content Update Karna (Admin Only) - (CHANGED)
exports.updateContent = async (req, res) => {
  const { title, categoryId, tags } = req.body;
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
    if (tags) {
        updateData.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    }

    // --- FILE REPLACE LOGIC (Cloudinary or Drive) ---
    if (req.file) {
      if (content.googleDriveId) {
        await deleteFromDrive(content.googleDriveId);
      } else if (content.url && content.fileResourceType !== 'auto') {
        const publicId = getPublicIdFromUrl(content.url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: content.fileResourceType || 'raw' });
        }
      }
      
      const folderPath = await getCategoryPath(categoryId || content.categoryId);
      const driveData = await uploadToDrive(req.file, folderPath);
      updateData.url = driveData.webViewLink;
      updateData.googleDriveId = driveData.id;
      updateData.type = req.file.mimetype;
      updateData.fileResourceType = 'raw';

      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    content = await Content.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // Sirf updateData object ko set karein
      { new: true } 
    );
    res.json(content);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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