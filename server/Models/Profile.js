const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },

  location: {
    type: String,
    required: false
  },
  skill: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: false
  },
  experience: [
    {
      company: {
        type: String,
        required: false
      }
    }
  ]
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
