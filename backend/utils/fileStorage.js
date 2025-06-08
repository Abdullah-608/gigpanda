import mongoose from 'mongoose';

// Create a schema for storing files
const fileSchema = new mongoose.Schema({
    filename: String,
    data: Buffer,
    mimetype: String,
    size: Number
}, { timestamps: true });

// Create a model for files
const File = mongoose.model('File', fileSchema);

// Save file to MongoDB
export const saveFileToStorage = async (file) => {
    try {
        // Validate file
        if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
            throw new Error('Invalid file data');
        }

        if (!file.originalname || !file.mimetype) {
            throw new Error('Missing file metadata');
        }

        // Log original file details
        console.log('Saving file to MongoDB:', {
            filename: file.originalname,
            mimetype: file.mimetype,
            originalSize: file.size,
            bufferSize: file.buffer.length,
        });

        // Ensure we have a proper Buffer
        const fileData = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

        // Log buffer details
        console.log('Converted buffer details:', {
            isBuffer: Buffer.isBuffer(fileData),
            bufferLength: fileData.length,
            bufferByteLength: fileData.byteLength
        });

        // Create new file document
        const newFile = new File({
            filename: file.originalname,
            data: fileData,
            mimetype: file.mimetype,
            size: file.size || fileData.length
        });

        // Save to MongoDB
        const savedFile = await newFile.save();

        // Log saved file details
        console.log('File saved to MongoDB:', {
            id: savedFile._id,
            filename: savedFile.filename,
            savedSize: savedFile.size,
            actualDataSize: savedFile.data.length
        });

        // Return the MongoDB document ID as the URL
        return savedFile._id.toString();
    } catch (error) {
        console.error('Error saving file to MongoDB:', error);
        throw error;
    }
};

// Get file from MongoDB
export const getFileFromStorage = async (fileId) => {
    try {
        // Find file by ID
        const file = await File.findById(fileId);
        if (!file) {
            throw new Error('File not found in storage');
        }

        // Log retrieved file details
        console.log('Retrieved file from MongoDB:', {
            id: file._id,
            filename: file.filename,
            storedSize: file.size,
            actualDataSize: file.data.length,
            isBuffer: Buffer.isBuffer(file.data),
            mimeType: file.mimetype
        });

        // Ensure we return a proper Buffer
        const fileData = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);

        // Log buffer details before sending
        console.log('Sending file buffer details:', {
            isBuffer: Buffer.isBuffer(fileData),
            bufferLength: fileData.length,
            bufferByteLength: fileData.byteLength
        });

        return {
            data: fileData,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size || fileData.length
        };
    } catch (error) {
        console.error('Error getting file from MongoDB:', error);
        throw error;
    }
};

// Delete file from MongoDB
export const deleteFileFromStorage = async (fileId) => {
    try {
        await File.findByIdAndDelete(fileId);
    } catch (error) {
        console.error('Error deleting file from MongoDB:', error);
        throw error;
    }
};

// Cleanup unreferenced files (can be run periodically)
export const cleanupUnreferencedFiles = async (referencedIds) => {
    try {
        // Delete files that are not in the referencedIds array
        await File.deleteMany({
            _id: { $nin: referencedIds.map(id => mongoose.Types.ObjectId(id)) }
        });
    } catch (error) {
        console.error('Error during file cleanup:', error);
        throw error;
    }
}; 