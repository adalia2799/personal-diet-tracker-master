import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Center } from '@chakra-ui/react';
import AppCon from '../App';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="accent.500" />
      </Box>
    );
  }

  if (!user) {
    return null; // will redirect in useEffect
  }

  return <AppCon />;
} 