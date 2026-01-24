import mongoose from 'mongoose';

const homepageSectionSchema = new mongoose.Schema(
  {
    image: {
      url: {
        type: String,
        required: true,
      },
      fileId: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Sort by order, then by creation date
homepageSectionSchema.index({ order: 1, createdAt: 1 });

const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema);

export default HomepageSection;
