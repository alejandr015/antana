import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  const verifyAdminStatus = async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', currentUser.email)
        .single();
        
      setIsAdmin(!!data && !error);
    } catch (e) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await verifyAdminStatus(session.user);
      }
      setSession(session);
      setUser(session?.user ?? null);
      // Pequeño retraso estético de 1.2s para que se alcance a ver la nueva pantalla de carga
      setTimeout(() => {
        setLoading(false);
      }, 1200);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }

      if (session?.user) {
        await verifyAdminStatus(session.user);
      } else {
        setIsAdmin(false);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Iniciar sesión con correo y contraseña
  const signInWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    return { data, error };
  };
  
  // Registrarse con correo y contraseña
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const value = {
    user,
    session,
    isAdmin,
    loading,
    isRecoveringPassword,
    setIsRecoveringPassword,
    signInWithPassword,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};
