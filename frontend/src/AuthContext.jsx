import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

// create a new react context with empty value
// this will be used to pass the auth context around the app without using prop drilling
const AuthContext = createContext({});

// create a custom hook to use the auth context
export const useAuth = () => {
  // use the context hook to get the context value (auth state and methods)
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context; // return so it can be used in components
};

// provide component to wrap the app and provide the auth state
export const AuthProvider = ({ children }) => {
  // state to store current user object (null if not logged in)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading state to show while checking auth status

  useEffect(() => {
    // get initial session when app loads
    const getSession = async () => {
      // get the current session from supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // set the user state or null is no session
      setUser(session?.user ?? null);
      setLoading(false); // stop loading
    };

    getSession();

    // listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // (clean up) to unsubscribe from auth changes when component unmounts/disappears from screen
    return () => subscription.unsubscribe();
  }, []);
  //useCallback here per PR avoid creating a new function on every render
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      // show loading state while creating new user account
      setLoading(true);
      // call supabase to create new user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // additional data (name, profile picture, etc)
          data: userData,
        },
      });
      // return error or success data
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);
  //useCallback here per PR too
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      // call supabase to sign in user with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      // send password reset email via supabase
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        // where to redirect after password is reset
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      // update user's password via supabase
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user, // true if user exists, false if null
  };

  return (
    // provide the auth state & functions (value) to all child components
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
