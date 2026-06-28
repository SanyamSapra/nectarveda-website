import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js'
import categoryRoutes from './routes/category.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import userRoutes from './routes/user.routes.js'
import addressRoutes from './routes/address.routes.js';
import './config/cloudinary.js'
import adminDashboardRoutes from './routes/admin.dashboard.routes.js';
import adminUserRoutes from './routes/admin.user.routes.js';

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  ...(process.env.CLIENT_URL || '').split(',').map(origin => origin.trim()),
  'https://nectarveda-website.vercel.app',
  'http://localhost:3000',
]
  .filter(Boolean)
  .map(origin => origin.replace(/\/$/, ''));

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/$/, '');

    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);

app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUserRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NectarVeda API Running",
  });
});

app.use(errorMiddleware);

export default app;
