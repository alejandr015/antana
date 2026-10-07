import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader, Eye, EyeOff, UserPlus, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import LoadingScreen from '../components/LoadingScreen';

function Login() {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithPassword, signUp, user, isAdmin, isRecoveringPassword, setIsRecoveringPassword } = useAuth();
  const navigate = useNavigate();

  // Forzar el modo a update_password si venimos de un enlace de recuperación
  useEffect(() => {
    if (isRecoveringPassword) {
      setMode('update_password');
    }
  }, [isRecoveringPassword]);

  // Si ya está logueado y es admin, redirigir, PERO NO si está recuperando contraseña
  if (user && isAdmin && !isRecoveringPassword) {
    navigate('/admin');
    return null;
  }

  // Hacer scroll automático hacia arriba cuando carga la pantalla
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error: authError } = await signInWithPassword(email, password);
      setLoading(false);

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos.');
        } else {
          setError(authError.message);
        }
      } else {
        toast.success('Sesión iniciada correctamente');
      }
    } else if (mode === 'register') {
      // Validaciones de Registro
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden. Verifícalas por favor.');
        setLoading(false);
        return;
      }

      // Validar contraseña fuerte: Mínimo 1 mayúscula, 1 minúscula, 1 número y 6 caracteres
      const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})");
      if (!strongRegex.test(password)) {
        setError('La contraseña debe tener al menos 6 caracteres, incluir una letra mayúscula, una minúscula y un número.');
        setLoading(false);
        return;
      }

      const { error: authError } = await signUp(email, password);
      setLoading(false);

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setError('Este correo ya está registrado. Por favor, inicia sesión.');
        } else {
          setError(authError.message);
        }
      } else {
        toast.success('¡Cuenta creada! Por favor, revisa tu bandeja de entrada (y Spam) para confirmar tu correo antes de iniciar sesión.', { duration: 8000 });
        setMode('login'); // Pasarlo al login tras registrar
        setPassword('');
        setConfirmPassword('');
      }
    } else if (mode === 'forgot') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      if (resetError) {
        setError('Ocurrió un error al enviar el correo.');
      } else {
        toast.success('Te hemos enviado un correo con el enlace para recuperar tu contraseña.');
        setMode('login');
      }
    } else if (mode === 'update_password') {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      
      const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})");
      if (!strongRegex.test(password)) {
        setError('La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      setLoading(false);
      if (updateError) {
        setError('Hubo un error al actualizar la contraseña: ' + updateError.message);
      } else {
        toast.success('¡Contraseña actualizada exitosamente!');
        setIsRecoveringPassword(false);
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    }
  };

  const renderTitles = () => {
    if (mode === 'login') {
      return (
        <>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Acceso Seguro</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ingresa tus credenciales de administrador para acceder al panel.</p>
        </>
      );
    } else if (mode === 'register') {
      return (
        <>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Crea tu Cuenta</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Crea una contraseña segura para tu acceso institucional.</p>
        </>
      );
    } else if (mode === 'update_password') {
      return (
        <>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Actualizar Clave</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Por favor, ingresa y confirma tu nueva contraseña segura.</p>
        </>
      );
    } else {
      return (
        <>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Recuperar Clave</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ingresa tu correo para recibir un enlace de recuperación.</p>
        </>
      );
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
              {mode === 'login' ? <Lock size={32} /> : mode === 'register' ? <UserPlus size={32} /> : <KeyRound size={32} />}
            </div>

            {renderTitles()}

            {error && (
              <div style={{ background: 'rgba(255, 99, 132, 0.1)', borderLeft: '3px solid var(--accent-pink)', color: 'var(--accent-pink)', padding: '0.8rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth}>
              {mode !== 'update_password' && (
                <div style={{ position: 'relative', marginBottom: mode === 'forgot' ? '2rem' : '1rem' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    placeholder={mode === 'forgot' ? "Tu correo para recuperación" : "tucorreo@ejemplo.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem' }}
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div style={{ position: 'relative', marginBottom: (mode === 'register' || mode === 'update_password') ? '1rem' : '2rem' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={(mode === 'register' || mode === 'update_password') ? "Crea una contraseña segura" : "Tu contraseña"}
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
              )}

              {(mode === 'register' || mode === 'update_password') && (
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '1rem 3rem 1rem 3rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || (mode !== 'update_password' && !email) || (mode !== 'forgot' && password.length < 6)} 
                className="cta-button" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: (loading || (mode !== 'update_password' && !email) || (mode !== 'forgot' && password.length < 6)) ? 0.7 : 1 }}
              >
                {loading ? <Loader size={20} className="spin" /> : mode === 'login' ? 'Ingresar al Panel' : mode === 'register' ? 'Registrarme y Entrar' : mode === 'update_password' ? 'Actualizar Contraseña' : 'Enviar Enlace de Recuperación'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            {/* Links for toggling modes */}
            {mode !== 'update_password' && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                {mode === 'login' && (
                  <>
                    <button onClick={() => { setMode('forgot'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-yellow)', cursor: 'pointer', textDecoration: 'underline' }}>
                      ¿Olvidaste tu contraseña?
                    </button>
                    <button onClick={() => { setMode('register'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      ¿Eres nuevo staff? <span style={{ color: 'var(--accent-yellow)' }}>Crea tu cuenta</span>
                    </button>
                  </>
                )}
                {(mode === 'register' || mode === 'forgot') && (
                  <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Volver al <span style={{ color: 'var(--accent-yellow)' }}>Inicio de sesión</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </motion.div>
        <style dangerouslySetInnerHTML={{
          __html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
      </div>
    </>
  );
}

export default Login;
