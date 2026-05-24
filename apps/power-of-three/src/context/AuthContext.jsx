import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useCircleMembers } from '@/hooks/useCircleMembers';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { addMemberToCircle } = useCircleMembers();

  useEffect(() => {
    const checkAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh({ $autoCancel: false });
          setCurrentUser(pb.authStore.model);
        } catch (error) {
          console.error("Auth refresh failed:", error);
          pb.authStore.clear();
          setCurrentUser(null);
        }
      }
      setInitialLoading(false);
    };

    checkAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const handleCircleJoin = async (userId, name, circleId) => {
    if (!circleId) return;
    try {
      await addMemberToCircle(circleId, userId, name);
    } catch (error) {
      console.error("Auto-join circle failed. The circle may be full or restricted.", error);
      // We don't throw here to allow auth to succeed even if join fails
    }
  };

  const login = async (email, password, circleId = null) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);
    
    if (circleId) {
      await handleCircleJoin(authData.record.id, authData.record.name || email.split('@')[0], circleId);
    }
    return authData;
  };

  const signup = async (email, password, name = '', circleId = null) => {
    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name: name
    }, { $autoCancel: false });
    
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);

    if (circleId) {
      await handleCircleJoin(authData.record.id, name || email.split('@')[0], circleId);
    }
    return authData;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    initialLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};