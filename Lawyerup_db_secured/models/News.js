const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
});

const newsSchema = new mongoose.Schema({
    title: String,
    author: String,
    summary: String,
    date: String,
    image: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    dislikedBy: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
