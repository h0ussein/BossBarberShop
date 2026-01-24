import imagekit from '../utils/imagekit.js';

// @desc    Get ImageKit authentication parameters
// @route   GET /api/upload/auth
// @access  Private (Admin/Barber)
export const getAuthParams = async (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json({
      success: true,
      data: authenticationParameters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete image from ImageKit
// @route   DELETE /api/upload/:fileId
// @access  Private (Admin/Barber)
export const deleteImage = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required',
      });
    }

    await imagekit.deleteFile(fileId);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
