import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  emails: [
    {
      type: String
    }
  ],

  totalEmails: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'scheduled', 'sending', 'sent', 'partial', 'failed'],
    default: 'pending'
  },

  scheduledAt: {
    type: Date
  },

  sentAt: {
    type: Date
  },

  results: [{
    email: String,
    status: String,
    error: String
  }],

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for dashboard queries
campaignSchema.index({ user: 1, deletedAt: 1 });
campaignSchema.index({ user: 1, status: 1 });
campaignSchema.index({ user: 1, sentAt: 1 });

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;

