'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page where the modal will be triggered
    router.push('/?login=true');
  }, [router]);

  return null;
}
