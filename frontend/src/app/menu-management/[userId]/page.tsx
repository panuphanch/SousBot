import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import liff from '@line/liff';
import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MenuManagement = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Initialize LIFF
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setProfile(profile);
        
        // Fetch products after successful LIFF initialization
        fetchProducts();
      } catch (err: any) {
        setError('Failed to initialize LIFF: ' + err.message);
        setLoading(false);
      }
    };

    initLiff();
  }, [userId]);

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

  const handleEdit = async (productId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', productId);
    // You might want to open a modal or navigate to an edit page
  };

  const handleToggleAvailability = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to toggle product availability');
      
      // Refresh products after update
      await fetchProducts();
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
          <CardTitle>จัดการเมนู</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600">฿{product.price}</p>
                  <p className="text-sm text-gray-500">
                    คงเหลือ: {product.stockQuantity} ชิ้น
                  </p>
                  <div className="mt-4 flex justify-between">
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={() => handleEdit(product.id)}
                    >
                      แก้ไข
                    </button>
                    <button 
                      className={`px-4 py-2 rounded ${
                        product.isAvailable 
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}
                      onClick={() => handleToggleAvailability(product.id)}
                    >
                      {product.isAvailable ? 'ปิดการขาย' : 'เปิดการขาย'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManagement;