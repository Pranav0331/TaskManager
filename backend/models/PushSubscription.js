import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint is required'],
      unique: true,
      trim: true,
    },
    expirationTime: {
      type: Number,
      default: null,
    },
    keys: {
      p256dh: {
        type: String,
        required: [true, 'p256dh key is required'],
        trim: true,
      },
      auth: {
        type: String,
        required: [true, 'auth key is required'],
        trim: true,
      },
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding user subscriptions quickly
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 });

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);

export default PushSubscription;
