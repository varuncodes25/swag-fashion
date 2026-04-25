const Banner = require('../models/banner');
const { uploadBuffer, deleteImage } = require('../config/cloudinary');

// Get all active banners
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .select('title subtitle image tag link')
      .limit(10);
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
};

// Create Banner with Image Upload
exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, tag, link, priority, isActive } = req.body;
    let imageUrl = "";
    let publicId = "";

    // Priority 1: Check for uploaded file
    if (req.file) {
      try {
        const uploadResult = await uploadBuffer(req.file.buffer, {
          folder: "banners",
          transformation: [
            { width: 1200, height: 500, crop: "fill" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        });
        
        imageUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        
        console.log('✅ Banner image uploaded:', publicId);
        
      } catch (cloudinaryError) {
        console.error('Cloudinary Error:', cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary",
          error: cloudinaryError.message
        });
      }
    } 
    // Priority 2: Check if image URL is provided in form
    else if (req.body.image && req.body.image.startsWith('http')) {
      imageUrl = req.body.image;
    } 
    else {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    // // Validate required fields
    // if (!title || !title.trim()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Title is required"
    //   });
    // }

    // Create banner in database
    const banner = new Banner({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      image: imageUrl,
      cloudinaryId: publicId,
      tag: tag || "FEATURED",
      link: link || '/',
      priority: parseInt(priority) || 5,
      isActive: isActive === 'true' || isActive === true || isActive === '1'
    });

    await banner.save();
    
    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner
    });
    
  } catch (error) {
    console.error("Create banner error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating banner",
      error: error.message
    });
  }
};

// Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, tag, link, priority, isActive } = req.body;
    let updateData = { 
      title, 
      subtitle, 
      tag, 
      link, 
      priority: parseInt(priority) || 5,
      isActive: isActive === 'true' || isActive === true || isActive === '1'
    };

    if (req.file) {
      try {
        // Delete old image if exists
        const oldBanner = await Banner.findById(id);
        if (oldBanner && oldBanner.cloudinaryId) {
          await deleteImage(oldBanner.cloudinaryId);
        }
        
        // Upload new image
        const uploadResult = await uploadBuffer(req.file.buffer, {
          folder: "banners",
          transformation: [
            { width: 1200, height: 500, crop: "fill" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        });
        
        updateData.image = uploadResult.secure_url;
        updateData.cloudinaryId = uploadResult.public_id;
        
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Error uploading image to Cloudinary",
          error: uploadError.message
        });
      }
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating banner',
      error: error.message
    });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Delete image from Cloudinary if cloudinaryId exists
    if (banner.cloudinaryId) {
      try {
        await deleteImage(banner.cloudinaryId);
      } catch (cloudinaryError) {
        console.error("Error deleting image:", cloudinaryError);
      }
    }

    await Banner.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message
    });
  }
};

// Get all banners (Admin panel)
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
};
