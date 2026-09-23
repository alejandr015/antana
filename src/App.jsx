import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartSidebar from './components/CartSidebar.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Carga perezosa (Lazy Loading) de las páginas principales
const Home = lazy(() => import('./pages/Home.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Menu = lazy(() => import('./pages/Menu.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));

// Ruta Protegida
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('¡Conexión restaurada! Todo vuelve a funcionar normal.', { duration: 4000 });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('⚠️ Estás sin conexión. Algunas funciones no estarán disponibles.', { 
        duration: Infinity, 
        action: {
          label: 'Recargar',
          onClick: () => window.location.reload()
        }
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, 
      backgroundColor: '#ef4444', color: 'white', padding: '0.75rem', 
      textAlign: 'center', fontWeight: 'bold', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <span>⚠️ Sin conexión a internet. Revisa tu red.</span>
      <button 
        onClick={() => window.location.reload()} 
        style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid white', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>
        Recargar
      </button>
    </div>
  );
};

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <CartProvider>
      <Toaster position="top-right" theme="dark" richColors toastOptions={{ style: { background: 'rgba(8,8,8,0.95)', border: '1px solid var(--accent-yellow)', backdropFilter: 'blur(10px)' } }} />
      <NetworkStatus />
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartSidebar />}
      <div style={{ flex: 1 }}>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </div>
      {!isAdminRoute && <Footer />}
    </CartProvider>
  );
}

export default App;
