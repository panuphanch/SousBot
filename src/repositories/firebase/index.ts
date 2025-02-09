import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Product, Order, User, OrderStatus } from '../../types';

// Initialize Firebase
function initializeFirebase() {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    const serviceAccount = require('../../../serviceAccountKey.json');
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  const db = getFirestore();
  
  if (process.env.NODE_ENV === 'development') {
    db.settings({
      host: 'localhost:8080',
      ssl: false
    });
  }

  return db;
}

// User Repository
export class UserRepository {
  private db = getFirestore();
  private collection = this.db.collection('users');

  constructor() {
    initializeFirebase();
  }

  async getById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    
    const data = doc.data() as Omit<User, 'id'>;
    return { ...data, id: doc.id };
  }

  async getByLineUserId(lineUserId: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('lineUserId', '==', lineUserId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data() as Omit<User, 'id'>;
    return { ...data, id: doc.id };
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const data = {
      ...user,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.collection.add(data);
    return { ...data, id: docRef.id } as User;
  }
}

// Product Repository
export class ProductRepository {
  private db = getFirestore();
  private collection = this.db.collection('products');

  constructor() {
    initializeFirebase();
  }

  async getById(id: string): Promise<Product | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    
    const data = doc.data() as Omit<Product, 'id'>;
    return { ...data, id: doc.id };
  }

  async getByOwner(ownerId: string): Promise<Product[]> {
    const snapshot = await this.collection
      .where('ownerId', '==', ownerId)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Product, 'id'>;
      return { ...data, id: doc.id };
    });
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = new Date();
    const data = {
      ...product,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.collection.add(data);
    return { ...data, id: docRef.id } as Product;
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date()
    });
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    const docRef = this.collection.doc(id);
    await this.db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) {
        throw new Error('Product not found');
      }

      const data = doc.data() as Product;
      const newQuantity = data.stockQuantity + quantity;
      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }

      transaction.update(docRef, { 
        stockQuantity: newQuantity,
        updatedAt: new Date()
      });
    });
  }
}

// Order Repository
export class OrderRepository {
  private db = getFirestore();
  private collection = this.db.collection('orders');

  constructor() {
    initializeFirebase();
  }

  async getById(id: string): Promise<Order | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    
    const data = doc.data() as Omit<Order, 'id'>;
    return { ...data, id: doc.id };
  }

  async getByOwner(ownerId: string): Promise<Order[]> {
    const snapshot = await this.collection
      .where('ownerId', '==', ownerId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Order, 'id'>;
      return { ...data, id: doc.id };
    });
  }

  async getTodayOrders(ownerId: string): Promise<Order[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const snapshot = await this.collection
      .where('ownerId', '==', ownerId)
      .where('createdAt', '>=', startOfDay)
      .where('createdAt', '<=', endOfDay)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Order, 'id'>;
      return { ...data, id: doc.id };
    });
  }

  async getWeeklyOrders(ownerId: string): Promise<Order[]> {
    // Get the current date
    const now = new Date();
    // Get the start of the week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    // Get the end of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const snapshot = await this.collection
      .where('ownerId', '==', ownerId)
      .where('createdAt', '>=', startOfWeek)
      .where('createdAt', '<=', endOfWeek)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Order, 'id'>;
      return { ...data, id: doc.id };
    });
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Order> {
    const now = new Date();
    const data = {
      ...order,
      status: OrderStatus.Pending,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.collection.add(data);
    return { ...data, id: docRef.id } as Order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    await this.collection.doc(id).update({
      status,
      updatedAt: new Date()
    });
  }
}