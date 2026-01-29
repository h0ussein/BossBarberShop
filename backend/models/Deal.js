import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Promo code is required'],
      trim: true,
      uppercase: true,
    },
    validUntil: {
      type: String,
      required: [true, 'Valid until is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

dealSchema.index({ createdAt: -1 });

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;
