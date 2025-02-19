import { useState } from 'react';
import { registerShop } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { logError, logInfo } from '../utils/logger';

export default function RegisterForm({ liff, onSuccess }) {
  const [shopName, setShopName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    await logInfo('Registering shop', {
      shopName: shopName,
    });
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

      await logInfo('Get Profile', {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        shopName: shopName,
      });

      const result = await registerShop(userData);
      onSuccess(result);
    } catch (err) {
      setError('การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
      await logError('Shop registration failed', {
        lineUserId: profile.userId,
        shopName: shopName,
        error: err,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">ลงทะเบียนร้านค้า</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="shopName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อร้าน
              </label>
              <input
                type="text"
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="กรุณากรอกชื่อร้านของคุณ"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner />
                  <span>กำลังลงทะเบียน...</span>
                </div>
              ) : (
                'ลงทะเบียน'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}