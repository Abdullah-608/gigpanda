import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for file storage
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Generate a unique filename
const generateUniqueFilename = (originalFilename) => {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalFilename);
    const safeName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9]/g, '_');
    return `${safeName}-${timestamp}-${random}${ext}`;
};

// Validate file before saving
const validateFile = async (file) => {
    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
        throw new Error('Invalid file data');
    }

    if (!file.originalname || !file.mimetype) {
        throw new Error('Missing file metadata');
    }

    // Additional validation can be added here
    return true;
};

export const getFileFromStorage = async (fileUrl) => {
    try {
        // Extract the filename from the URL and clean it
        const filename = decodeURIComponent(fileUrl.split('/').pop());
        const filePath = path.join(UPLOAD_DIR, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found in storage');
        }

        // Get file stats to verify it's a file and get size
        const stats = await fs.promises.stat(filePath);
        if (!stats.isFile()) {
            throw new Error('Not a valid file');
        }

        // Create read stream with proper options
        const stream = fs.createReadStream(filePath, {
            highWaterMark: 64 * 1024, // 64KB chunks
            autoClose: true,
            emitClose: true
        });

        // Add error handler to the stream itself
        stream.on('error', (error) => {
            console.error('Error in file stream:', error);
            if (!stream.destroyed) {
                stream.destroy(error);
            }
        });

        return stream;
    } catch (error) {
        console.error('Error getting file from storage:', error);
        throw error;
    }
};

export const saveFileToStorage = async (file) => {
    try {
        // Validate file
        await validateFile(file);

        // Generate unique filename
        const filename = generateUniqueFilename(file.originalname);
        const filePath = path.join(UPLOAD_DIR, filename);

        // Ensure the file data is a Buffer
        const fileData = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

        // Save file to disk
        await fs.promises.writeFile(filePath, fileData);

        // Return the relative URL
        return `/uploads/${filename}`;
    } catch (error) {
        console.error('Error saving file to storage:', error);
        throw error;
    }
};

export const deleteFileFromStorage = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        const filename = decodeURIComponent(fileUrl.split('/').pop());
        const filePath = path.join(UPLOAD_DIR, filename);

        if (fs.existsSync(filePath)) {
            const stats = await fs.promises.stat(filePath);
            if (stats.isFile()) {
                await fs.promises.unlink(filePath);
            }
        }
    } catch (error) {
        console.error('Error deleting file from storage:', error);
        throw error;
    }
};

// Cleanup old files that are no longer referenced (can be run periodically)
export const cleanupUnreferencedFiles = async (referencedUrls) => {
    try {
        const files = await fs.promises.readdir(UPLOAD_DIR);
        
        for (const file of files) {
            const fileUrl = `/uploads/${file}`;
            if (!referencedUrls.includes(fileUrl)) {
                try {
                    await deleteFileFromStorage(fileUrl);
                    console.log(`Cleaned up unreferenced file: ${file}`);
                } catch (error) {
                    console.error(`Error cleaning up file ${file}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error during file cleanup:', error);
        throw error;
    }
}; 