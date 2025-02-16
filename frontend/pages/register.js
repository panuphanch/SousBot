import { useEffect } from 'react';
import { useRouter } from 'next/router';
import RegisterForm from '../components/RegisterForm';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Register({ liff, liffError }) {
  const router = useRouter();
  const { redirect } = router.query;

  // Handle successful registration
  const handleRegistrationSuccess = (userData) => {
    if (redirect) {
      router.push(redirect);
    } else {
      router.push('/'); // Default redirect to home
    }
  };

  // Redirect if LIFF error
  useEffect(() => {
    if (liffError) {
      router.push('/error');
    }
  }, [liffError, router]);

  // Add loading state check
  if (!liff) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <LoadingSpinner size="large" text="กำลังโหลด..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <RegisterForm 
        liff={liff} 
        onSuccess={handleRegistrationSuccess} 
      />
    </div>
  );
}