import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled Note',
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      enum: ['indigo', 'amber', 'emerald', 'rose', 'sky'],
      default: 'indigo',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Keep isPinned and pinned synchronized
noteSchema.pre('save', function (next) {
  if (this.isModified('isPinned')) {
    this.pinned = this.isPinned;
  } else if (this.isModified('pinned')) {
    this.isPinned = this.pinned;
  }
  next();
});

const Note = mongoose.model('Note', noteSchema);

export default Note;
