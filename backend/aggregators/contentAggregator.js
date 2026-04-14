const cloudinary = require('cloudinary').v2;
const Content = require('../models/contentModel');
const { getDriveFileMetadata } = require('../utils/googleDrive');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Aggregator Pattern: Unifies data from MongoDB, Google Drive, and Cloudinary.
 * Robust and efficient by using parallel fetching.
 */
class ContentAggregator {
    /**
     * Enrich a content piece with live data from external providers.
     * @param {Object} content - The Mongoose document or plain object.
     * @returns {Promise<Object>} The aggregated content object.
     */
    static async aggregate(content) {
        if (!content) return null;

        const result = {
            ...content.toObject ? content.toObject() : content,
            externalMetadata: {
                googleDrive: null,
                cloudinary: null
            }
        };

        const promises = [];

        if (result.googleDriveId) {
            promises.push(
                getDriveFileMetadata(result.googleDriveId)
                    .then(meta => { result.externalMetadata.googleDrive = meta; })
                    .catch(err => console.error("Aggregator: Drive fetch failed", err.message))
            );
        }

        if (result.url && result.url.includes('cloudinary.com')) {
            const publicId = this.getPublicIdFromUrl(result.url);
            if (publicId) {
                promises.push(
                    cloudinary.api.resource(publicId, { colors: true, ocr: true })
                        .then(res => { result.externalMetadata.cloudinary = res; })
                        .catch(err => console.error("Aggregator: Cloudinary fetch failed", err.message))
                );
            }
        }

        // Parallel Fetch for "instant" feel
        await Promise.allSettled(promises);

        return result;
    }

    /**
     * Helper to extract Cloudinary public ID from URL
     */
    static getPublicIdFromUrl(url) {
        if (!url) return null;
        try {
            const parts = url.split('/');
            const uploadIndex = parts.findIndex(part => part === 'upload');
            if (uploadIndex === -1) return null;

            // Typically version is at uploadIndex + 1, public_id starts after that
            // Format: .../upload/v12345/folder/public_id.ext
            const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
            return publicIdWithExt.split('.').slice(0, -1).join('.');
        } catch (e) {
            return null;
        }
    }
}

module.exports = ContentAggregator;
