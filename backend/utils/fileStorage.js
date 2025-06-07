import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for file storage
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const getFileFromStorage = async (fileUrl) => {
    try {
        // Extract the filename from the URL
        const filename = decodeURIComponent(fileUrl.split('/').pop());
        const filePath = path.join(UPLOAD_DIR, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found in storage');
        }

        // Create and return a read stream
        return fs.createReadStream(filePath);
    } catch (error) {
        console.error('Error getting file from storage:', error);
        throw error;
    }
};

export const saveFileToStorage = async (file) => {
    try {
        const filename = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(UPLOAD_DIR, filename);

        // Save file to disk
        await fs.promises.writeFile(filePath, file.buffer);

        // Return the relative URL
        return `/uploads/${filename}`;
    } catch (error) {
        console.error('Error saving file to storage:', error);
        throw error;
    }
};

export const deleteFileFromStorage = async (fileUrl) => {
    try {
        const filename = decodeURIComponent(fileUrl.split('/').pop());
        const filePath = path.join(UPLOAD_DIR, filename);

        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        console.error('Error deleting file from storage:', error);
        throw error;
    }
}; 