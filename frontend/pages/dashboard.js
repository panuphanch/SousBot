import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import liff from '@line/liff';

export default function IndexPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupVConsole = async () => {
      const VConsole = (await import('vconsole')).default
      new VConsole()
    }
    setupVConsole();
    // Initialize LIFF app
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '' });
        
        // Check if user is logged in
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
        
        // Get user profile
        const userProfile = await liff.getProfile();
        setProfile({
          userId: userProfile.userId,
          displayName: userProfile.displayName,
          pictureUrl: userProfile.pictureUrl
        });
        setIsLoading(false);
      } catch (err) {
        console.error('LIFF initialization failed', err);
        setError('LIFF initialization failed. Please try again.');
        setIsLoading(false);
      }
    };

    initializeLiff();
  }, []);

  const handleButtonClick = (path) => {
    if (!profile?.userId) return;
    
    // If the path requires a userId parameter
    if (path.includes('[userId]')) {
      const formattedPath = path.replace('[userId]', profile.userId);
      router.push(formattedPath);
    } else {
      router.push(path);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-center mb-4">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { 
      icon: '🍰', 
      text: 'จัดการเมนู', 
      path: '/menu-management/[userId]',
      bgColor: 'bg-pink-50',
      description: 'เพิ่ม ลบ แก้ไขเมนูและราคา'
    },
    { 
      icon: '📝', 
      text: 'จัดการออเดอร์', 
      path: '/order-management/[userId]',
      bgColor: 'bg-blue-50',
      description: 'บันทึกออเดอร์ใหม่และติดตาม'
    },
    { 
      icon: '📊', 
      text: 'สรุปยอดวันนี้', 
      path: '/daily-summary/[userId]',
      bgColor: 'bg-green-50',
      description: 'ดูสรุปยอดขายประจำวัน'
    },
    { 
      icon: '📦', 
      text: 'ดูสต็อกคงเหลือ', 
      path: '/stock/[userId]',
      bgColor: 'bg-yellow-50',
      description: 'ตรวจสอบสินค้าคงเหลือ'
    },
    { 
      icon: '📅', 
      text: 'ดูออเดอร์วันนี้', 
      path: '/todays-orders/[userId]',
      bgColor: 'bg-purple-50',
      description: 'ดูรายการออเดอร์ทั้งหมดวันนี้'
    },
    { 
      icon: '📈', 
      text: 'สรุปยอดสัปดาห์นี้', 
      path: '/weekly-summary/[userId]',
      bgColor: 'bg-indigo-50',
      description: 'ดูสรุปยอดขายรายสัปดาห์'
    },
    { 
      icon: '📋', 
      text: 'สรุปยอดเดือนนี้', 
      path: '/monthly-summary/[userId]',
      bgColor: 'bg-red-50',
      description: 'ดูสรุปยอดขายรายเดือน'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8 text-center">
          <div className="relative">
            {profile?.pictureUrl ? (
              <Image 
                src={profile.pictureUrl} 
                alt={profile.displayName}
                className="h-20 w-20 rounded-full mx-auto border-2 border-white shadow-md" 
              />
            ) : (
              <div className="h-20 w-20 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-3xl">👩‍🍳</span>
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-800 mt-3">สมพร (Somporn)</h1>
          <p className="text-gray-600 text-sm">ยินดีช่วยจัดการร้านเบเกอรี่เน้อเจ้า</p>
        </header>

        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(item.path)}
              className={`w-full ${item.bgColor} hover:bg-white border border-gray-200 rounded-lg shadow-sm p-4 transition-all duration-200 ease-in-out flex items-center`}
            >
              <div className="flex-1 flex items-center">
                <span className="text-3xl mr-4">{item.icon}</span>
                <div className="text-left">
                  <span className="block text-lg font-medium text-gray-800">{item.text}</span>
                  {item.description && (
                    <span className="text-sm text-gray-500">{item.description}</span>
                  )}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          ))}
        </div>

        <footer className="mt-10 text-center text-gray-500 text-xs">
          <p>Sous-Bot © 2025 - ผู้ช่วยจัดการร้านเบเกอรี่</p>
          {profile?.displayName && <p className="mt-1">ผู้ใช้: {profile.displayName}</p>}
        </footer>
      </div>
    </div>
  );
}