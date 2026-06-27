import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const getDashboardStats = asyncHandler(async (req, res) => {
  
  // 1. Total revenue from delivered orders
  const revenueResult = await Order.aggregate([
    { $match: { orderStatus: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // 2. Orders count by status
  const orderStats = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);
  const ordersByStatus = {};
  orderStats.forEach(({ _id, count }) => {
    ordersByStatus[_id] = count;
  });
  const totalOrders = Object.values(ordersByStatus).reduce((a, b) => a + b, 0);

  // 3. Total users (non-admin)
  const totalUsers = await User.countDocuments({ role: 'user' });

  // 4. Total products
  const totalProducts = await Product.countDocuments();

  // 5. Recent 5 orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  // 6. Top 5 selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        name: '$product.name',
        totalSold: 1,
        price: '$product.price',
        image: { $arrayElemAt: ['$product.images', 0] }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      ordersByStatus,
      totalUsers,
      totalProducts,
      recentOrders,
      topProducts,
    }
  });
});

export { getDashboardStats };