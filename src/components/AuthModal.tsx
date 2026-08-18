import React, { useState } from 'react';
import { 
  User, 
  X, 
  Check, 
  Plus, 
  Shield, 
  Lock, 
  Mail, 
  Building, 
  MapPin, 
  Briefcase, 
  KeyRound,
  LogIn,
  UserPlus,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService, DEFAULT_USERS } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'switch'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserProfile['role']>('Engenheiro de Campo');
  const [regObra, setRegObra] = useState('ECORIOMINAS');
  const [regTrecho, setRegTrecho] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim()) {
      setLoginError('Informe o e-mail de acesso.');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Informe sua senha.');
      return;
    }

    setIsSubmitting(true);
    const result = await authService.login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onShowToast(`Bem-vindo, ${result.user.name}! Acesso registrado com sucesso.`);
      onClose();
    } else {
      setLoginError(result.message || 'Erro ao realizar login. Verifique seus dados.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!regName.trim()) {
      setLoginError('Informe seu nome completo.');
      return;
    }
    if (!regEmail.trim()) {
      setLoginError('Informe seu e-mail corporativo.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 3) {
      setLoginError('Defina uma senha com pelo menos 3 caracteres.');
      return;
    }

    setIsSubmitting(true);
    const result = await authService.registerUser({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      obraDefault: regObra,
      trechoDefault: regTrecho
    });
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onShowToast(`Conta criada com sucesso! Bem-vindo, ${result.user.name}.`);
      onClose();
    } else {
      setLoginError(result.message || 'Não foi possível cadastrar o usuário.');
    }
  };

  const handleQuickSelectPreset = (user: UserProfile) => {
    setLoginEmail(user.email);
    setLoginPassword(user.password || '123');
    setLoginError(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#0f4c81] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-amber-400 p-1.5 rounded-lg text-slate-950">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                Controle de Acesso & Identificação
              </h3>
              <p className="text-[11px] text-blue-200">
                Identificação do usuário por e-mail, senha e telemetria de uso
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Bar if logged in */}
        {currentUser && (
          <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0f4c81] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 leading-none">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">{currentUser.email} • {currentUser.role}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onLogout();
                setMode('login');
                onShowToast('Sessão encerrada.');
              }}
              className="text-rose-600 hover:text-rose-800 text-[11px] font-bold flex items-center gap-1 bg-white border border-rose-200 px-2 py-1 rounded cursor-pointer"
            >
              <LogOut className="w-3 h-3" /> Sair
            </button>
          </div>
        )}

        {/* Tabs: Entrar vs Cadastrar */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#0f4c81] border-b-2 border-[#0f4c81]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar com E-mail & Senha</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#0f4c81] border-b-2 border-[#0f4c81]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Novo Cadastro</span>
          </button>
        </div>

        {/* Body Form */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-2.5 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0f4c81]" /> E-mail Cadastrado
                </label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ex: bruno.pereira@seel.com.br"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-[#0f4c81]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#0f4c81]" /> Senha de Acesso
                </label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-[#0f4c81]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0f4c81] hover:bg-[#0a3459] text-white text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Autenticando...' : 'Acessar Aplicativo'}</span>
              </button>

              {/* Quick Preset Buttons for testing */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Usuários Pré-Configurados (Clique para preencher):
                </div>
                <div className="space-y-1.5">
                  {DEFAULT_USERS.map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleQuickSelectPreset(usr)}
                      className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg p-2 text-left flex items-center justify-between transition cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{usr.name}</div>
                        <div className="text-[10px] text-slate-500">{usr.email} • {usr.role}</div>
                      </div>
                      <span className="text-[9px] font-bold bg-blue-100 text-[#0f4c81] px-1.5 py-0.5 rounded">
                        Preencher
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo:
                </label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Eng. Roberto Albuquerque"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mail Corporativo:
                </label>
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nome@seel.com.br"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Senha de Acesso:
                </label>
                <input 
                  type="password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Crie sua senha segura"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Função / Cargo:
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium bg-white"
                  >
                    <option value="Engenheiro Gestor">Engenheiro Gestor</option>
                    <option value="Engenheiro de Campo">Engenheiro de Campo</option>
                    <option value="Fiscal de Obra">Fiscal de Obra</option>
                    <option value="Apontador">Apontador de Obra</option>
                    <option value="Coordenador">Coordenador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Obra Padrão:
                  </label>
                  <input 
                    type="text" 
                    value={regObra}
                    onChange={(e) => setRegObra(e.target.value)}
                    placeholder="ECORIOMINAS"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trecho / Frente Padrão:
                </label>
                <input 
                  type="text" 
                  value={regTrecho}
                  onChange={(e) => setRegTrecho(e.target.value)}
                  placeholder="Ex: KM 42 / Trecho Norte"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Cadastrando...' : 'Criar Conta e Entrar'}</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
