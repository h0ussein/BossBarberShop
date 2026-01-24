import HomepageSection from '../models/HomepageSection.js';
import imagekit from '../utils/imagekit.js';

// @desc    Get all homepage sections
// @route   GET /api/homepage-sections
// @access  Public
export const getHomepageSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    
    res.json({
      success: true,
      count: sections.length,
      data: { sections },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all homepage sections (admin - includes inactive)
// @route   GET /api/admin/homepage-sections
// @access  Private/Admin
export const getAllHomepageSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find()
      .sort({ order: 1, createdAt: 1 });
    
    res.json({
      success: true,
      count: sections.length,
      data: { sections },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create homepage section
// @route   POST /api/admin/homepage-sections
// @access  Private/Admin
export const createHomepageSection = async (req, res) => {
  try {
    const { image, description, order } = req.body;

    if (!image || !image.url || !image.fileId) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const section = await HomepageSection.create({
      image: {
        url: image.url,
        fileId: image.fileId,
      },
      description: description || '',
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Homepage section created successfully',
      data: { section },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update homepage section
// @route   PUT /api/admin/homepage-sections/:id
// @access  Private/Admin
export const updateHomepageSection = async (req, res) => {
  try {
    const { image, description, order, isActive } = req.body;

    const section = await HomepageSection.findById(req.params.id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found',
      });
    }

    // If updating image, delete old one from ImageKit
    if (image && image.url && image.fileId) {
      if (section.image.fileId && section.image.fileId !== image.fileId) {
        try {
          await imagekit.deleteFile(section.image.fileId);
        } catch (error) {
          console.error('Failed to delete old image from ImageKit:', error);
        }
      }
      section.image = {
        url: image.url,
        fileId: image.fileId,
      };
    }

    if (description !== undefined) section.description = description;
    if (order !== undefined) section.order = order;
    if (isActive !== undefined) section.isActive = isActive;

    await section.save();

    res.json({
      success: true,
      message: 'Homepage section updated successfully',
      data: { section },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete homepage section
// @route   DELETE /api/admin/homepage-sections/:id
// @access  Private/Admin
export const deleteHomepageSection = async (req, res) => {
  try {
    const section = await HomepageSection.findById(req.params.id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found',
      });
    }

    // Delete image from ImageKit
    if (section.image.fileId) {
      try {
        await imagekit.deleteFile(section.image.fileId);
      } catch (error) {
        console.error('Failed to delete image from ImageKit:', error);
      }
    }

    await HomepageSection.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Homepage section deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reorder homepage sections
// @route   PUT /api/admin/homepage-sections/reorder
// @access  Private/Admin
export const reorderHomepageSections = async (req, res) => {
  try {
    const { sections } = req.body; // Array of { id, order }

    if (!Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        message: 'Sections array is required',
      });
    }

    // Update order for each section
    const updatePromises = sections.map(({ id, order }) =>
      HomepageSection.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Sections reordered successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
