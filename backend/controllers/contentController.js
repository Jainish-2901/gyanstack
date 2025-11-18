// Cloudinary ko import karein (file delete karne ke liye)
const cloudinary = require('cloudinary').v2;
const Content = require('../models/contentModel');

// --- HELPER FUNCTION ---
// Ye function Cloudinary URL se Public ID nikalta hai (delete karne ke liye)
const getPublicIdFromUrl = (url) => {
  try {
    // Example URL: http://res.cloudinary.com/cloud_name/resource_type/upload/v12345/gyanstack_uploads/file_id.pdf
    // Humein 'gyanstack_uploads/file_id' chahiye
    const parts = url.split('/');
    const folderIndex = parts.findIndex(part => part === 'gyanstack_uploads');
    if (folderIndex === -1) return null;
    
    const publicIdWithExtension = parts.slice(folderIndex).join('/');
    const publicId = publicIdWithExtension.split('.').slice(0, -1).join('.');
    return publicId;
  } catch (e) {
    console.error("Error parsing public_id from URL:", url, e);
    return null;
  }
};
// -----------------------

// 1. Naya Content Upload Karna (Admin Only) - (FINALIZED for Batch/Single)
exports.uploadContent = async (req, res) => {
  try {
    // Note: req.body ke data (title, categoryId, tags) sabhi files ke liye same rahenge
    const { title, type, link, textNote, categoryId, tags } = req.body;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const uploadedItems = [];
    
    // --- BATCH UPLOAD LOGIC ---
    if (req.files && req.files.length > 0) {
      // Scenario 1: Multiple Files (Batch Upload)
      const batchTitleBase = title || 'Batch Upload';

      for (const file of req.files) {
        // Har file ke liye naya document banayein
        const newContent = new Content({
          // Har file ko unique title dein (e.g., Title - File-Name-Without-Ext)
          title: `${batchTitleBase} - ${file.originalname.split('.').slice(0, -1).join('.')}`,
          type: file.mimetype,
          url: file.path,
          fileResourceType: file.resource_type, 
          categoryId,
          tags: tagsArray,
          uploadedBy: req.user.id, 
        });
        uploadedItems.push(await newContent.save());
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
        return res.status(400).json({ message: 'No valid content or file received for upload.' });
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
    if (req.query.categoryId) { query.categoryId = req.query.categoryId; }
    if (req.query.uploadedBy) { query.uploadedBy = req.query.uploadedBy; }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }, 
      ];
    }
    const content = await Content.find(query).sort({ createdAt: -1 });
    res.json({ content });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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

    // --- CHANGE: FILE REPLACE LOGIC ---
    // Check karein agar nayi file upload hui hai
    if (req.file) {
      // 1. Purani file ko Cloudinary se delete karein (agar wo link/note nahi tha)
      if (content.url && content.fileResourceType !== 'auto') {
        const publicId = getPublicIdFromUrl(content.url);
        if (publicId) {
          // 'content.fileResourceType' ka use karein (e.g., 'raw', 'video')
          await cloudinary.uploader.destroy(publicId, { 
            resource_type: content.fileResourceType || 'raw' 
          });
          console.log("Deleted old file from Cloudinary:", publicId);
        }
      }
      
      // 2. Nayi file ki details ko updateData me daalein
      updateData.url = req.file.path;
      updateData.type = req.file.mimetype;
      updateData.fileResourceType = req.file.resource_type;
    }
    // --- END OF FILE REPLACE LOGIC ---

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
    
    // --- CHANGE: CLOUDINARY SE DELETE KAREIN ---
    if (content.url && content.fileResourceType !== 'auto') { // 'auto' matlab link/note
      const publicId = getPublicIdFromUrl(content.url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { 
          resource_type: content.fileResourceType || 'raw' 
        });
        console.log("Deleted from Cloudinary:", publicId);
      }
    }
    // --- END OF CLOUDINARY DELETE ---
    
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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