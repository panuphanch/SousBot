import express from 'express';
import { middleware } from '@line/bot-sdk';
import { LineService } from './services/line';
import * as dotenv from 'dotenv';
import { ProductRepository, UserRepository } from './repositories/firebase';
import { initializeFirebase } from './config/firebase';

dotenv.config();

initializeFirebase();

const app = express();
const port = process.env.PORT || 3000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
};

const lineService = new LineService(lineConfig);

app.get('/api/products/:userId', async (req, res) => {
  try {
    const productRepo = new ProductRepository();
    const products = await productRepo.getByOwner(req.params.userId);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.patch('/api/products/:productId/availability', async (req, res) => {
  try {
    const productRepo = new ProductRepository();
    const product = await productRepo.getById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await productRepo.update(req.params.productId, {
      isAvailable: !product.isAvailable
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const userRepo = new UserRepository();
    const { lineUserId, shopName, displayName } = req.body;

    // Validate required fields
    if (!lineUserId || !shopName || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user already exists
    const existingUser = await userRepo.getByLineUserId(lineUserId);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already registered'
      });
    }

    // Create new user
    const user = await userRepo.create({
      lineUserId,
      shopName: shopName.trim(),
      displayName
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/webhook', middleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(lineService.handleWebhook))
    .then(() => res.json({ status: 'ok' }))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});