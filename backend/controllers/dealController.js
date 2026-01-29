import Deal from '../models/Deal.js';
import { isValidObjectId, pickFields } from '../utils/validation.js';

// @desc    Get all deals (public - for Deals page)
// @route   GET /api/deals
// @access  Public
export const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: deals.length,
      data: { deals },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create deal
// @route   POST /api/deals
// @access  Private/Admin
export const createDeal = async (req, res) => {
  try {
    const allowedFields = ['title', 'description', 'code', 'validUntil'];
    const dealData = pickFields(req.body, allowedFields);

    if (!dealData.title || !dealData.description || !dealData.code || !dealData.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, code, and valid until are required',
      });
    }

    const deal = await Deal.create(dealData);

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: { deal },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private/Admin
export const updateDeal = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID',
      });
    }

    const allowedFields = ['title', 'description', 'code', 'validUntil'];
    const updates = pickFields(req.body, allowedFields);

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found',
      });
    }

    res.json({
      success: true,
      message: 'Deal updated successfully',
      data: { deal },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private/Admin
export const deleteDeal = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID',
      });
    }

    const deal = await Deal.findByIdAndDelete(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found',
      });
    }

    res.json({
      success: true,
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
