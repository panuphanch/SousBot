import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isLIFFEnvironment, setIsLIFFEnvironment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if running in LIFF environment (URL contains LIFF parameters)
    const isInLIFF = window.location.href.includes("liff.state");
    setIsLIFFEnvironment(isInLIFF);
    setIsLoading(false);
  }, []);

  // Show loading when in LIFF environment
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

  // If in LIFF environment, show only loading (redirect will happen in _app.js)
  if (isLIFFEnvironment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // Normal landing page for non-LIFF visitors
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to SousBot</h1>
        <p className="mb-6">Your bakery management assistant</p>
        
        <a 
          href="https://liff.line.me/2006903370-Md4Xknmy"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded"
        >
          Open in LINE
        </a>
      </div>
    </div>
  );
}