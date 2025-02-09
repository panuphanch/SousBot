import { Client } from '@line/bot-sdk';
import { ProductRepository, OrderRepository } from '../../repositories/firebase';
import { Product, Order } from '../../types';

export class LineService {
  private client: Client;
  private productRepo: ProductRepository;
  private orderRepo: OrderRepository;

  constructor(config: any) {
    this.client = new Client(config);
    this.productRepo = new ProductRepository();
    this.orderRepo = new OrderRepository();
  }

  async handleMessage(event: any): Promise<void> {
    // Handle incoming LINE messages using repos
  }
}