import { useState } from 'react';
import { registerShop } from '../utils/api';

export default function RegisterForm({ liff, onSuccess }) {
  const [shopName, setShopName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const profile = await liff.getProfile();
      const userData = {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        shopName: shopName,
      };

      const result = await registerShop(userData);
      onSuccess(result);
    } catch (err) {
      setError('การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">ลงทะเบียนร้านค้า</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="shopName" className="block text-gray-700 mb-2">
            ชื่อร้าน
          </label>
          <input
            type="text"
            id="shopName"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium 
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
        </button>
      </form>
    </div>
  );
}