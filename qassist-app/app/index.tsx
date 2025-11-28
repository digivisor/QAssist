import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Check if user is logged in
    // If logged in, redirect to tasks
    // If not, redirect to login
    router.replace('/login');
  }, []);

  return null;
}




