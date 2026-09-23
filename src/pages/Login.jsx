import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithPassword, user } = useAuth();
  const navigate = useNavigate();

  // Si ya está logueado, redirigir
  if (user) {
    navigate('/admin');
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signInWithPassword(email, password);
    
    setLoading(false);
    
    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError(authError.message);
      }
    } else {
      navigate('/admin');
    }
  };

  return (
    <>
      {loading && <LoadingScreen />}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ maxWidth: '400px', width: '100%', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px solid var(--accent-yellow)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-yellow)', filter: 'blur(80px)', opacity: 0.2, zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--accent-yellow)' }}>
            <Lock size={32} />
          </div>
          
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Acceso Seguro
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Ingresa tus credenciales de administrador para acceder al panel.
          </p>

          {error && (
            <div style={{ background: 'rgba(255, 99, 132, 0.1)', borderLeft: '3px solid var(--accent-pink)', color: 'var(--accent-pink)', padding: '0.8rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem' }}
              />
            </div>
            
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '1rem 3rem 1rem 3rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={loading || !email || password.length < 6} className="cta-button" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: loading || !email || password.length < 6 ? 0.7 : 1 }}>
              {loading ? <Loader size={20} className="spin" /> : 'Ingresar al Panel'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </motion.div>
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
      </div>
    </>
  );
}

export default Login;
