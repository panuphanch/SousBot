import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import RegisterForm from '../components/RegisterForm';

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

  if (!liff) {
    return <div>Loading...</div>;
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