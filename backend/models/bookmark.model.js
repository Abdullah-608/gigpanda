import mongoose from 'mongoose';
const { Schema } = mongoose;

const BookmarkSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {  // Changed from post to job
    type: Schema.Types.ObjectId,
    ref: 'Job',  // Changed to reference Job model
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only bookmark a job once
BookmarkSchema.index({ user: 1, job: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', BookmarkSchema);
export default Bookmark;