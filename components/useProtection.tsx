// hooks/useProtection.js
'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import useUserStore from '@/state/user';

const useProtection = () => {
  const router = useRouter();

  useEffect(() => {
    // Define your condition here.
    // For this example, we'll check if an 'userToken' exists in localStorage.
    const user = useUserStore.getState().user;

    // If the condition is NOT satisfied, redirect to the login page.
    if (!user) {
      router.push('/');
    }
  }, [router]);
};

export default useProtection;