const mongoose = require('mongoose');

const videoAdSchema = new mongoose.Schema({
  title: { type: String, required: true },
  revenue: { type: Number, required: true },
  completed: { type: Boolean, default: false }
});
const VideoAd = mongoose.models.VideoAd || mongoose.model('VideoAd', videoAdSchema);
module.exports = VideoAd;

