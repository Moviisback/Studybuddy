import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  name?: string;
  studyStreak: number;
}

export const useUser = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, you would fetch the user profile from the backend
  // But for this demo, we'll create a profile based on the Firebase user
  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      setError(null);
      
      // For demo purposes, we're using a placeholder profile
      // In a real app, you would fetch this from your API
      const placeholderProfile: UserProfile = {
        id: 1, // Placeholder
        username: currentUser.displayName || currentUser.email?.split('@')[0] || 'user',
        email: currentUser.email || '',
        name: currentUser.displayName || undefined,
        studyStreak: 0
      };
      
      setProfile(placeholderProfile);
      setIsLoading(false);
    } else {
      setProfile(null);
    }
  }, [currentUser]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) {
      setError("You must be logged in to update your profile");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would send these updates to your API
      // For demo purposes, we'll just update the local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      setIsLoading(false);
    } catch (err) {
      setError("Failed to update profile");
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile
  };
};
