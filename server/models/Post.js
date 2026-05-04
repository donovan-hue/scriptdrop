const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: 5000
    },
    image: String,
    video: String,
    music: String,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    shares: {
      type: Number,
      default: 0
    },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    }
  },
  { timestamps: true }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 }); // feed queries per user sorted by date
postSchema.index({ createdAt: -1 });             // global feed sorted by date

module.exports = mongoose.model('Post', postSchema);
