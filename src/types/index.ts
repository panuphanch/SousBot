// User/Owner of a bakery shop
export interface User {
  id: string;
  lineUserId: string;  // LINE user ID for authentication
  displayName: string;
  shopName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product (bakery item)
export interface Product {
  id: string;
  ownerId: string;      // Reference to User.id
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  isAvailable: boolean;  // Quick toggle for availability
  createdAt: Date;
  updatedAt: Date;
}

// Order item within an order
export interface OrderItem {
  productId: string;    // Reference to Product.id
  productName: string;  // Denormalized for historical record
  quantity: number;
  price: number;       // Price at time of order
  subtotal: number;    // price * quantity
}

// Full order
export interface Order {
  id: string;
  ownerId: string;        // Reference to User.id (baker)
  customerId: string;     // LINE user ID of customer
  customerName: string;   // LINE display name
  items: OrderItem[];
  totalAmount: number;    // Sum of all items + delivery fee
  deliveryFee?: number;   // Separate from totalAmount
  status: OrderStatus;
  notes?: string;        // Special instructions
  createdAt: Date;
  updatedAt?: Date;
}

// Order status enum
export enum OrderStatus {
  Pending = 'pending',       // Just created
  Confirmed = 'confirmed',   // Accepted by baker
  Completed = 'completed',   // Delivered/Picked up
  Cancelled = 'cancelled'    // Cancelled by either party
}