import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Center,
  useToast
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import DailyOverview from './DailyOverview';
import NutritionChart from './NutritionChart';
import ProgressTracker from './ProgressTracker';
import RecommendationCard from './RecommendationCard';

interface DashboardData {
  profile: {
    full_name: string;
    weight_kg: number;
    target_weight: number;
    goal_type: string;
  };
  goals: {
    target_calories: number;
    target_protein_ratio: number;
    target_carbs_ratio: number;
    target_fat_ratio: number;
    target_weight_kg: number;
  };
  mealLogs: Array<{
    total_calories: number;
    protein: number;
    carbs: number;
    fat: number;
    created_at: string;
  }>;
  nutritionLogs: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) return;

      try {
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        // Check if all required fields are filled
        const requiredFields = ['full_name', 'weight_kg', 'height_cm', 'goal_type'];
        const isComplete = requiredFields.every(field => profile[field]);

        setIsOnboardingComplete(isComplete);

        if (isComplete) {
          // Fetch all necessary data for the dashboard
          const [goalsResponse, mealLogsResponse, nutritionLogsResponse] = await Promise.all([
            supabase
              .from('user_goals')
              .select('*')
              .eq('user_id', user.id)
              .single(),
            supabase
              .from('meal_logs')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(30),
            supabase
              .from('nutrition_logs')
              .select('*')
              .eq('user_id', user.id)
              .order('date', { ascending: false })
              .limit(30)
          ]);

          if (goalsResponse.error) throw goalsResponse.error;
          if (mealLogsResponse.error) throw mealLogsResponse.error;
          if (nutritionLogsResponse.error) throw nutritionLogsResponse.error;

          setDashboardData({
            profile,
            goals: goalsResponse.data,
            mealLogs: mealLogsResponse.data,
            nutritionLogs: nutritionLogsResponse.data
          });
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user?.id, toast]);

  const handleNavigate = (view: string) => {
    router.push(`/${view}`);
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (!isOnboardingComplete) {
    return (
      <Box p={8}>
        <VStack spacing={8} align="stretch">
          <Box
            p={8}
            bg="white"
            borderRadius="lg"
            boxShadow="lg"
            borderWidth={1}
            borderColor="brand.200"
          >
            <VStack spacing={6} align="stretch">
              <Heading size="xl" textAlign="center" color="brand.500">
                Welcome to Your Diet Tracker!
              </Heading>
              <Text fontSize="lg" color="gray.600" textAlign="center">
                To get started with personalized tracking and recommendations, please complete your profile setup.
              </Text>
              
              <Box bg="brand.50" p={6} borderRadius="md">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color="brand.700">
                    Complete Your Profile
                  </Heading>
                  <Text color="gray.600">
                    Your profile helps us provide personalized recommendations for:
                  </Text>
                  <VStack align="start" spacing={2} pl={4}>
                    <Text>• Daily nutrition goals and tracking</Text>
                    <Text>• Personalized meal recommendations</Text>
                    <Text>• Progress tracking and insights</Text>
                    <Text>• Customized workout suggestions</Text>
                  </VStack>
                </VStack>
              </Box>

              <VStack spacing={4} pt={4}>
                <Button
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  onClick={() => router.push('/onboarding')}
                >
                  Start Onboarding
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  width="full"
                  onClick={() => router.push('/profile')}
                >
                  Go to Profile
                </Button>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={8}>
        <VStack spacing={8} align="stretch">
          <Box
            p={8}
            bg="white"
            borderRadius="lg"
            boxShadow="lg"
            borderWidth={1}
            borderColor="brand.200"
          >
            <VStack spacing={6} align="stretch">
              <Heading size="xl" textAlign="center" color="brand.500">
                Welcome to Your Dashboard!
              </Heading>
              <Text fontSize="lg" color="gray.600" textAlign="center">
                Start tracking your nutrition and fitness journey.
              </Text>
              
              <Box bg="brand.50" p={6} borderRadius="md">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color="brand.700">
                    Get Started
                  </Heading>
                  <Text color="gray.600">
                    Begin your journey by:
                  </Text>
                  <VStack align="start" spacing={2} pl={4}>
                    <Text>• Logging your first meal</Text>
                    <Text>• Setting up your nutrition goals</Text>
                    <Text>• Tracking your daily progress</Text>
                    <Text>• Exploring personalized recommendations</Text>
                  </VStack>
                </VStack>
              </Box>

              <VStack spacing={4} pt={4}>
                <Button
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  onClick={() => router.push('/log-meal')}
                >
                  Log Your First Meal
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  width="full"
                  onClick={() => router.push('/goals')}
                >
                  Set Your Goals
                </Button>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2}>
            Welcome back, {dashboardData.profile.full_name}!
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Here's your nutrition overview for today.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          <VStack spacing={8} align="stretch">
            <DailyOverview
              data={dashboardData.nutritionLogs[0]}
              goals={dashboardData.goals}
              mealLogs={dashboardData.mealLogs}
              onNavigate={handleNavigate}
            />
            <NutritionChart
              data={dashboardData.nutritionLogs}
              goals={dashboardData.goals}
              onNavigate={handleNavigate}
            />
          </VStack>

          <VStack spacing={8} align="stretch">
            <ProgressTracker
              profile={dashboardData.profile}
              goals={dashboardData.goals}
              mealLogs={dashboardData.mealLogs}
            />
            <RecommendationCard
              profile={dashboardData.profile}
              goals={dashboardData.goals}
              mealLogs={dashboardData.mealLogs}
              onNavigate={handleNavigate}
            />
          </VStack>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Dashboard;
