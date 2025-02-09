import express from 'express';
import { middleware } from '@line/bot-sdk';
import { LineService } from './services/line';
import * as dotenv from 'dotenv';
import { ProductRepository } from './repositories/firebase';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
};

const lineService = new LineService(lineConfig);

// Add product routes
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

app.post('/webhook', middleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(lineService.handleMessage))
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