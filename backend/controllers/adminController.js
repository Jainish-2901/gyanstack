const User = require('../models/userModel');
const Content = require('../models/contentModel');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error (getAllUsers): ' + err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });
    res.json({ message: 'User role updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // Default to 'month'
    let dateFilter = {};
    
    // Date Filtering Logic
    if (period !== 'all') {
        const now = new Date();
        let startDate;

        switch (period) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          case 'month':
          default:
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        }
        
        dateFilter = { createdAt: { $gte: startDate } };
    }
    
    // Aggregation pipeline:
    const pipeline = [];
    if (Object.keys(dateFilter).length > 0) {
        pipeline.push({ $match: dateFilter });
    }
    
    // Stage 2: Group and Sum (Stats calculation)
    pipeline.push({
        $group: {
            _id: null,
            totalUploads: { $sum: 1 }, 
            totalViews: { $sum: '$viewsCount' },
            totalLikes: { $sum: '$likesCount' },
            totalSaves: { $sum: '$savesCount' },
            totalDownloads: { $sum: '$downloadsCount' }
        }
    });

    const contentStats = await Content.aggregate(pipeline);

    const totalUsers = await User.countDocuments();
    const googleUsersCount = await User.countDocuments({ googleId: { $exists: true, $ne: null } });
    const manualUsersCount = totalUsers - googleUsersCount;
    
    let stats = {};
    if (contentStats.length > 0) {
      stats = contentStats[0];
      delete stats._id;
    } else {
      stats = {
        totalUploads: 0,
        totalViews: 0,
        totalLikes: 0,
        totalSaves: 0,
        totalDownloads: 0
      };
    }
    
    const dashboardData = {
      ...stats,
      totalUsers,
      googleUsersCount,
      manualUsersCount
    };

    res.json(dashboardData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error (getDashboardStats)');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate yourself!' });
    }

    user.isDeleted = true;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'User deactivated successfully. Content and profile are preserved.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error (deleteUser)');
  }
};

exports.reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isDeleted = false;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'User reactivated successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error (reactivateUser)');
  }
};
