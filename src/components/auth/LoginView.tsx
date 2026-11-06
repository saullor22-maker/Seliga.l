import React, { useState } from 'react';
import {
  Flame,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { AuthUser } from '../../types';

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('saullor22@gmail.com');
  const [password, setPassword] = useState('seliga123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Determine user based on role or email
      let role: 'admin' | 'caixa' | 'cozinha' = 'admin';
      let name = 'Saullo Rodrigues';

      if (email.toLowerCase().includes('caixa') || email.toLowerCase().includes('atendimento')) {
        role = 'caixa';
        name = 'Larissa Mendes (Caixa)';
      } else if (email.toLowerCase().includes('cozinha') || email.toLowerCase().includes('chapa')) {
        role = 'cozinha';
        name = 'Marcos Cozinha';
      }

      const loggedUser: AuthUser = {
        id: `user-${Date.now()}`,
        name,
        email: email.trim(),
        role,
      };

      if (rememberMe) {
        localStorage.setItem('se_liga_lanche_auth_user', JSON.stringify(loggedUser));
      }

      onLogin(loggedUser);
    }, 400);
  };

  const handleQuickLogin = (role: 'admin' | 'caixa' | 'cozinha') => {
    let user: AuthUser;
    if (role === 'admin') {
      user = {
        id: 'usr-admin',
        name: 'Saullo Rodrigues',
        email: 'saullor22@gmail.com',
        role: 'admin',
      };
    } else if (role === 'caixa') {
      user = {
        id: 'usr-caixa',
        name: 'Larissa Mendes',
        email: 'atendimento@seligalanche.com.br',
        role: 'caixa',
      };
    } else {
      user = {
        id: 'usr-cozinha',
        name: 'Marcos Cozinha',
        email: 'cozinha@seligalanche.com.br',
        role: 'cozinha',
      };
    }

    if (rememberMe) {
      localStorage.setItem('se_liga_lanche_auth_user', JSON.stringify(user));
    }
    onLogin(user);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const googleUser: AuthUser = {
        id: 'usr-google',
        name: 'Saullo Rodrigues',
        email: 'saullor22@gmail.com',
        role: 'admin',
      };
      if (rememberMe) {
        localStorage.setItem('se_liga_lanche_auth_user', JSON.stringify(googleUser));
      }
      onLogin(googleUser);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-950/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-amber-500 p-0.5 shadow-2xl shadow-red-600/40 ring-4 ring-amber-400/20">
            <div className="w-full h-full bg-zinc-950/40 rounded-[14px] flex items-center justify-center">
              <Flame className="w-9 h-9 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
                SE LIGA
              </span>
              <span className="bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-md text-xs font-black tracking-wider uppercase shadow-md">
                LANCHE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Sistema Operacional & Gestão de Hamburgueria
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Acesse sua conta</h2>
            <p className="text-xs text-zinc-400">
              Entre com suas credenciais de operador ou use o acesso rápido
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                <span>E-mail do Operador</span>
                <span className="text-[10px] text-zinc-500 font-normal">saullor22@gmail.com</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@seligalanche.com.br"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                <span>Senha de Acesso</span>
                <span className="text-[10px] text-zinc-500 font-normal">Ex: seliga123</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 bg-zinc-950 border-zinc-700 focus:ring-0"
                />
                <span>Lembrar neste navegador</span>
              </label>

              <span className="text-[11px] text-amber-400/90 hover:underline cursor-pointer">
                Esqueceu a senha?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social / Google Login */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>
          </div>

          {/* Quick Demo Logins */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Acesso Rápido de Demonstração
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-400">
                  Gerente / Admin
                </div>
                <div className="text-[10px] text-zinc-400">Acesso Total</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('caixa')}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-400">
                  Operador Caixa
                </div>
                <div className="text-[10px] text-zinc-400">Pedidos & Vendas</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Copyright Footer */}
        <div className="text-center space-y-1.5 text-xs text-zinc-400">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Conexão Segura &bull; Pronto para Firebase Firestore & Auth</span>
          </p>
          <p className="text-[10px] text-zinc-400">
            &copy; 2026 Se Liga Lanche. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
