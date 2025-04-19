import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function UserHomePage() {
  const router = useRouter();
  const { userId } = router.query;
  
  useEffect(() => {
    if (userId) {
      // Redirect to dashboard/home while preserving the userId
      router.replace(`/dashboard?userId=${userId}`);
    }
  }, [userId, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  );
}