const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'], default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Closed'], default: 'Open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);