const RepairLog = require('../models/RepairLog');
const Warranty = require('../models/Warranty');

exports.createRepairLog = async (req, res) => {
  try {
    const {
      tokenId,
      serialNumber,
      technicianName,
      repairDate,
      repairContent,
      partsReplaced,
      cost,
      notes,
      images
    } = req.body;

    const warranty = await Warranty.findOne({ tokenId });
    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bảo hành với tokenId: ${tokenId}`,
        error: 'Warranty not found'
      });
    }

    const newRepairLog = new RepairLog({
      tokenId,
      serialNumber: serialNumber || warranty.serialNumber,
      warrantyId: warranty._id,
      technicianName,
      repairDate: repairDate || new Date(),
      repairContent,
      partsReplaced: partsReplaced || [],
      cost: cost || 0,
      notes: notes || '',
      images: images || [],
      createdBy: req.user.walletAddress
    });

    await newRepairLog.save();

    res.status(201).json({
      success: true,
      message: 'Thêm lịch sử sửa chữa thành công',
      data: newRepairLog
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm lịch sử sửa chữa',
      error: error.message
    });
  }
};

exports.getRepairLogsByTokenId = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const warranty = await Warranty.findOne({ tokenId });
    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bảo hành với tokenId: ${tokenId}`,
        error: 'Warranty not found'
      });
    }

    const repairLogs = await RepairLog.find({ tokenId })
      .sort({ repairDate: sort })
      .skip(skip)
      .limit(limit);

    const total = await RepairLog.countDocuments({ tokenId });

    const totalCost = await RepairLog.aggregate([
      { $match: { tokenId } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        tokenId,
        serialNumber: warranty.serialNumber,
        totalRepairs: total,
        totalCost: totalCost[0]?.total || 0,
        repairs: repairLogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử sửa chữa',
      error: error.message
    });
  }
};

exports.getRepairLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const repairLog = await RepairLog.findById(id);
    if (!repairLog) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy lịch sử sửa chữa với ID: ${id}`,
        error: 'Repair log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: repairLog
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết lịch sử sửa chữa',
      error: error.message
    });
  }
};

exports.updateRepairLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa lịch sử sửa chữa. Chỉ Admin mới có quyền này.',
        error: 'Permission denied'
      });
    }

    const repairLog = await RepairLog.findById(id);
    if (!repairLog) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy lịch sử sửa chữa với ID: ${id}`,
        error: 'Repair log not found'
      });
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        repairLog[key] = updateData[key];
      }
    });
    repairLog.updatedBy = req.user.walletAddress;

    await repairLog.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật lịch sử sửa chữa thành công',
      data: repairLog
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lịch sử sửa chữa',
      error: error.message
    });
  }
};

exports.deleteRepairLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa lịch sử sửa chữa. Chỉ Admin mới có quyền này.',
        error: 'Permission denied'
      });
    }

    const repairLog = await RepairLog.findById(id);
    if (!repairLog) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy lịch sử sửa chữa với ID: ${id}`,
        error: 'Repair log not found'
      });
    }

    await RepairLog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa lịch sử sửa chữa thành công',
      data: {
        _id: id,
        tokenId: repairLog.tokenId,
        serialNumber: repairLog.serialNumber,
        repairContent: repairLog.repairContent,
        deletedAt: new Date(),
        deletedBy: req.user.walletAddress
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch sử sửa chữa',
      error: error.message
    });
  }
};
