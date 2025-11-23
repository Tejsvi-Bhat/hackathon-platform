'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page where the modal will be triggered in register mode
    router.push('/?register=true');
  }, [router]);

  return null;
}
