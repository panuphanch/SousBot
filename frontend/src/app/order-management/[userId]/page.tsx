import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import liff from '@line/liff';
import { Order, OrderStatus, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OrderManagement = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setProfile(profile);
        
        // Fetch data after successful LIFF initialization
        await Promise.all([
          fetchOrders(),
          fetchProducts()
        ]);
      } catch (err: any) {
        setError('Failed to initialize LIFF: ' + err.message);
        setLoading(false);
      }
    };

    initLiff();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');
      
      // Refresh orders after status update
      await fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>จัดการออเดอร์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      คุณ {order.customerName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      วันที่: {new Date(order.createdAt).toLocaleString('th-TH')}
                    </p>
                    <div className="mt-2">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex justify-between">
                          <span>{item.productName} x{item.quantity}</span>
                          <span>฿{item.subtotal}</span>
                        </div>
                      ))}
                      {order.deliveryFee && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>ค่าส่ง</span>
                          <span>฿{order.deliveryFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold mt-2">
                        <span>รวม</span>
                        <span>฿{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="p-2 border rounded"
                    >
                      {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>
                          {status === 'pending' && 'รอดำเนินการ'}
                          {status === 'confirmed' && 'ยืนยันแล้ว'}
                          {status === 'completed' && 'เสร็จสิ้น'}
                          {status === 'cancelled' && 'ยกเลิก'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;