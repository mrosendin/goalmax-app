import { api, User } from '@/lib/api/client';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

const TOKEN_KEY = 'telofy_auth_token';
const USER_KEY = 'telofy_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load stored auth on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);

      if (token && userJson) {
        api.setToken(token);
        setUser(JSON.parse(userJson));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await api.signIn(email, password);
    
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    
    api.setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
    
    return response.user;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const response = await api.signUp(email, password, name);
    
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    
    api.setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
    
    return response.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.signOut();
    } catch (error) {
      // Ignore error, we're signing out anyway
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    
    api.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
}
