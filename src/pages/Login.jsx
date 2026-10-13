import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader, Eye, EyeOff, UserPlus, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import LoadingScreen from '../components/LoadingScreen';

// Componente visual para medir la fuerza de la contraseña
const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'transparent', percent: 0 };
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score < 3) return { score, label: 'Débil', color: '#ff4d4d', percent: 33 };
    if (score < 5) return { score, label: 'Media', color: '#ffd700', percent: 66 };
    return { score, label: 'Fuerte', color: '#00cc44', percent: 100 };
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div style={{ marginTop: '-0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
        <span>Seguridad de la contraseña:</span>
        <span style={{ color: strength.color, fontWeight: 'bold' }}>{strength.label}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};

function Login() {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para seguridad avanzada
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  // Efecto para manejar el bloqueo temporal (Anti Fuerza Bruta)
  useEffect(() => {
    if (lockoutTime && Date.now() < lockoutTime) {
      setCountdown(Math.ceil((lockoutTime - Date.now()) / 1000));
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutTime(null);
          setLoginAttempts(0);
          setCountdown(0);
          clearInterval(interval);
        } else {
          setCountdown(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleResendConfirmation = async () => {
    setLoading(true);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    setLoading(false);
    
    if (resendError) {
      toast.error('Error al reenviar el correo. Intenta de nuevo más tarde.');
    } else {
      toast.success('Correo de confirmación reenviado. Por favor revisa tu bandeja de entrada y SPAM.');
      setShowResendEmail(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setShowResendEmail(false);

    // Verificar si está bloqueado
    if (lockoutTime && Date.now() < lockoutTime) {
      setError(`Demasiados intentos fallidos. Intenta de nuevo en ${countdown} segundos.`);
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const { error: authError } = await signInWithPassword(email, password);
      setLoading(false);

      if (authError) {
        // Incrementar intentos fallidos
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setLockoutTime(Date.now() + 30000); // Bloquear por 30 segundos tras 5 intentos
          setError('Demasiados intentos fallidos. Por seguridad, tu acceso ha sido bloqueado temporalmente.');
          return;
        }

        // Manejo de errores seguro y específico
        if (authError.message.includes('Email not confirmed')) {
          setError('Tu cuenta aún no está verificada. Por favor confirma tu correo electrónico.');
          setShowResendEmail(true);
        } else {
          // Mensaje genérico deliberado para evitar enumeración de usuarios
          setError('Credenciales inválidas. Verifica tu correo y contraseña.');
        }
      } else {
        setLoginAttempts(0);
        toast.success('Sesión iniciada correctamente');
      }
    } else if (mode === 'register') {
      // Validaciones de Registro
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden. Verifícalas por favor.');
        setLoading(false);
        return;
      }

      // Validar contraseña fuerte
      const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})");
      if (!strongRegex.test(password)) {
        setError('La contraseña debe ser más segura (Mínimo 6 caracteres, 1 mayúscula, 1 minúscula y 1 número).');
        setLoading(false);
        return;
      }

      const { error: authError } = await signUp(email, password);
      setLoading(false);

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setError('Este correo ya está registrado en nuestro sistema. Intenta iniciar sesión.');
        } else {
          setError('Ocurrió un error al registrar: ' + authError.message);
        }
      } else {
        toast.success('¡Cuenta creada exitosamente! Hemos enviado un enlace de confirmación a tu correo.', { duration: 8000 });
        setMode('login'); // Pasarlo al login tras registrar
        setPassword('');
        setConfirmPassword('');
      }
    } else if (mode === 'forgot') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      
      // Siempre mostramos éxito para evitar que un atacante sepa si un correo existe o no
      toast.success('Si el correo existe en nuestro sistema, recibirás un enlace de recuperación pronto.');
      setMode('login');
      
      if (resetError) {
        console.error("Error silencioso de recuperación:", resetError);
      }
    } else if (mode === 'update_password') {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      
      const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})");
      if (!strongRegex.test(password)) {
        setError('La contraseña debe ser más segura (Mínimo 6 caracteres, 1 mayúscula, 1 minúscula y 1 número).');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      setLoading(false);
      if (updateError) {
        setError('Hubo un error al actualizar la contraseña. El enlace puede haber expirado.');
      } else {
        toast.success('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.');
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
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ingresa tus credenciales para acceder al panel administrativo.</p>
        </>
      );
    } else if (mode === 'register') {
      return (
        <>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Nueva Cuenta</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Crea una credencial segura para tu acceso institucional.</p>
        </>
      );
    } else if (mode === 'update_password') {
      return (
        <>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Actualizar Clave</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ingresa tu nueva contraseña segura para la cuenta.</p>
        </>
      );
    } else {
      return (
        <>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Recuperar Acceso</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ingresa tu correo para enviarte instrucciones de recuperación.</p>
        </>
      );
    }
  };

  const isFormDisabled = loading || (lockoutTime && Date.now() < lockoutTime);

  return (
    <>
      {loading && <LoadingScreen />}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass"
          style={{ maxWidth: '420px', width: '100%', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px solid var(--accent-yellow)', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
        >
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-yellow)', filter: 'blur(80px)', opacity: 0.2, zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--accent-yellow)', border: '1px solid rgba(229, 169, 0, 0.2)' }}>
              {mode === 'login' ? <Lock size={28} /> : mode === 'register' ? <UserPlus size={28} /> : <KeyRound size={28} />}
            </div>

            {renderTitles()}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                style={{ background: 'rgba(255, 99, 132, 0.1)', borderLeft: '3px solid var(--accent-pink)', color: 'var(--accent-pink)', padding: '0.8rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: 0 }}>{error}</p>
                  {showResendEmail && (
                    <button 
                      onClick={handleResendConfirmation}
                      type="button"
                      style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid var(--accent-pink)', color: 'var(--accent-pink)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-pink)'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-pink)'; }}
                    >
                      <RefreshCw size={14} /> Reenviar enlace de confirmación
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            <form onSubmit={handleAuth}>
              {mode !== 'update_password' && (
                <div style={{ position: 'relative', marginBottom: mode === 'forgot' ? '2rem' : '1.2rem' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    placeholder={mode === 'forgot' ? "Tu correo para recuperación" : "tucorreo@ejemplo.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isFormDisabled}
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem', transition: 'border-color 0.3s', opacity: isFormDisabled ? 0.6 : 1 }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-yellow)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div style={{ position: 'relative', marginBottom: (mode === 'register' || mode === 'update_password') ? '0.5rem' : '2rem' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={(mode === 'register' || mode === 'update_password') ? "Crea una contraseña segura" : "Tu contraseña"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isFormDisabled}
                    minLength={6}
                    style={{ width: '100%', padding: '1rem 3rem 1rem 3rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem', transition: 'border-color 0.3s', opacity: isFormDisabled ? 0.6 : 1 }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-yellow)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isFormDisabled}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: isFormDisabled ? 'not-allowed' : 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              {/* Medidor de fuerza de contraseña */}
              {(mode === 'register' || mode === 'update_password') && (
                <PasswordStrengthMeter password={password} />
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
                    disabled={isFormDisabled}
                    minLength={6}
                    style={{ width: '100%', padding: '1rem 3rem 1rem 3rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem', transition: 'border-color 0.3s', opacity: isFormDisabled ? 0.6 : 1 }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-yellow)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isFormDisabled}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: isFormDisabled ? 'not-allowed' : 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isFormDisabled || (mode !== 'update_password' && !email) || (mode !== 'forgot' && password.length < 6)} 
                className="cta-button" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: (isFormDisabled || (mode !== 'update_password' && !email) || (mode !== 'forgot' && password.length < 6)) ? 0.7 : 1, transition: 'all 0.3s' }}
              >
                {loading ? <Loader size={20} className="spin" /> : 
                 (lockoutTime && Date.now() < lockoutTime) ? `Bloqueado (${countdown}s)` :
                 mode === 'login' ? 'Ingresar al Panel' : 
                 mode === 'register' ? 'Registrarme y Entrar' : 
                 mode === 'update_password' ? 'Actualizar Contraseña' : 'Enviar Enlace de Recuperación'}
                {!loading && !(lockoutTime && Date.now() < lockoutTime) && <ArrowRight size={20} />}
              </button>
            </form>

            {/* Links for toggling modes */}
            {mode !== 'update_password' && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                {mode === 'login' && (
                  <>
                    <button onClick={() => { setMode('forgot'); setError(''); setShowResendEmail(false); }} disabled={isFormDisabled} style={{ background: 'none', border: 'none', color: 'var(--accent-yellow)', cursor: isFormDisabled ? 'not-allowed' : 'pointer', textDecoration: 'underline', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--accent-yellow)'}>
                      ¿Olvidaste tu contraseña?
                    </button>
                    <button onClick={() => { setMode('register'); setError(''); setShowResendEmail(false); }} disabled={isFormDisabled} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}>
                      ¿Eres nuevo staff? <span style={{ color: 'var(--accent-yellow)', fontWeight: 'bold' }}>Crea tu cuenta</span>
                    </button>
                  </>
                )}
                {(mode === 'register' || mode === 'forgot') && (
                  <button onClick={() => { setMode('login'); setError(''); setShowResendEmail(false); }} disabled={isFormDisabled} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}>
                    Volver al <span style={{ color: 'var(--accent-yellow)', fontWeight: 'bold' }}>Inicio de sesión</span>
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

