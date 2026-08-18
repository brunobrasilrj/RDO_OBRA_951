import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, AccessLog } from '../types';

const STORAGE_KEY_USER = 'seel_rdo_current_user_v3';
const STORAGE_KEY_ALL_USERS = 'seel_rdo_all_users_v3';
const STORAGE_KEY_LOCAL_LOGS = 'seel_rdo_access_logs_v1';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_bruno_gestor',
    name: 'Eng. Bruno Pereira',
    email: 'bruno.pereira@seel.com.br',
    password: '123',
    role: 'Engenheiro Gestor',
    obraDefault: 'ECORIOMINAS',
    trechoDefault: 'Trecho Principal'
  },
  {
    id: 'user_carlos_apontador',
    name: 'Carlos Silva (Apontador)',
    email: 'carlos.campo@seel.com.br',
    password: '123',
    role: 'Apontador',
    obraDefault: 'ECORIOMINAS',
    trechoDefault: 'Frente 01'
  },
  {
    id: 'user_roberto_fiscal',
    name: 'Roberto Mendes (Fiscal)',
    email: 'roberto.fiscal@ecoriominas.com.br',
    password: '123',
    role: 'Fiscal de Obra',
    obraDefault: 'ECORIOMINAS',
    trechoDefault: 'Frente 02'
  }
];

export const authService = {
  getCurrentUser(): UserProfile | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading user from localStorage', e);
    }
    return null;
  },

  getAllUsers(): UserProfile[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALL_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading users list', e);
    }
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  },

  setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  },

  // Save/Register user locally and sync to Cloud Firestore
  async registerUser(userData: {
    name: string;
    email: string;
    password?: string;
    role: UserProfile['role'];
    obraDefault?: string;
    trechoDefault?: string;
  }): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const emailNorm = userData.email.trim().toLowerCase();
    const all = this.getAllUsers();

    if (all.some(u => u.email.toLowerCase() === emailNorm)) {
      return { success: false, message: 'Já existe um usuário cadastrado com este e-mail.' };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name.trim(),
      email: emailNorm,
      password: userData.password?.trim() || '123',
      role: userData.role,
      obraDefault: userData.obraDefault?.trim() || 'ECORIOMINAS',
      trechoDefault: userData.trechoDefault?.trim() || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    all.push(newUser);
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(all));
    this.setCurrentUser(newUser);

    // Sync user to cloud Firestore
    try {
      const docRef = doc(db, 'users', newUser.id);
      await setDoc(docRef, newUser, { merge: true });
    } catch (err) {
      console.warn('Could not sync user to Firestore:', err);
    }

    // Log registration action
    await this.logAccess(newUser, 'CADASTRO', `Novo usuário cadastrado: ${newUser.name} (${newUser.role})`);

    return { success: true, user: newUser };
  },

  // Authenticate user with Email and Password
  async login(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const emailNorm = email.trim().toLowerCase();
    const passTrim = password.trim();

    // Check in local cache / defaults
    let users = this.getAllUsers();
    let user = users.find(u => u.email.toLowerCase() === emailNorm);

    // If not found in local, attempt fetching from cloud
    if (!user) {
      try {
        const usersCol = collection(db, 'users');
        const snap = await getDocs(usersCol);
        const cloudUsers: UserProfile[] = [];
        snap.forEach(d => cloudUsers.push(d.data() as UserProfile));
        if (cloudUsers.length > 0) {
          users = cloudUsers;
          localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(users));
          user = users.find(u => u.email.toLowerCase() === emailNorm);
        }
      } catch (err) {
        console.warn('Error fetching cloud users on login:', err);
      }
    }

    if (!user) {
      return { success: false, message: 'Usuário não encontrado. Verifique o e-mail digitado ou realize o cadastro.' };
    }

    // Password validation (default fallback to 123 if not set)
    const expectedPass = user.password || '123';
    if (passTrim !== expectedPass) {
      return { success: false, message: 'Senha incorreta. Tente novamente.' };
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date().toISOString();
    this.setCurrentUser(user);

    // Update in users array
    const idx = users.findIndex(u => u.id === user?.id);
    if (idx >= 0) {
      users[idx] = user;
      localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(users));
    }

    // Update in Firestore
    try {
      const docRef = doc(db, 'users', user.id);
      await setDoc(docRef, { lastLoginAt: user.lastLoginAt }, { merge: true });
    } catch (e) {
      console.warn('Failed to update last login in Firestore', e);
    }

    // Record access log
    await this.logAccess(user, 'LOGIN', `Login efetuado com sucesso via ${navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvel' : 'Navegador Desktop'}`);

    return { success: true, user };
  },

  logout(currentUser?: UserProfile | null): void {
    if (currentUser) {
      this.logAccess(currentUser, 'LOGIN', 'Logout / Encerramento de sessão').catch(() => {});
    }
    this.setCurrentUser(null);
  },

  // -------------------------------------------------------------
  // ACCESS LOGS & TELEMETRY AUDIT TRAIL
  // -------------------------------------------------------------
  async logAccess(
    user: UserProfile, 
    action: AccessLog['action'], 
    details?: string
  ): Promise<void> {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR');
    const timeFormatted = now.toLocaleTimeString('pt-BR');

    const logEntry: AccessLog = {
      id: `log_${now.getTime()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action,
      details: details || '',
      timestamp: now.toISOString(),
      date: dateFormatted,
      time: timeFormatted,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    // Save to local cache
    try {
      const localLogsStr = localStorage.getItem(STORAGE_KEY_LOCAL_LOGS);
      const localLogs: AccessLog[] = localLogsStr ? JSON.parse(localLogsStr) : [];
      localLogs.unshift(logEntry);
      if (localLogs.length > 200) localLogs.length = 200; // Cap local memory
      localStorage.setItem(STORAGE_KEY_LOCAL_LOGS, JSON.stringify(localLogs));
    } catch (e) {
      console.error('Error saving local log', e);
    }

    // Save directly to Cloud Firestore collection "access_logs"
    try {
      const logsCol = collection(db, 'access_logs');
      await addDoc(logsCol, logEntry);
    } catch (err) {
      console.warn('Could not push access log to Cloud Firestore:', err);
    }
  },

  getLocalLogs(): AccessLog[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCAL_LOGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading local logs', e);
    }
    return [];
  },

  // Real-time listener for the Manager/Admin to monitor access and usage in real time
  subscribeToAccessLogs(onLogs: (logs: AccessLog[]) => void): () => void {
    try {
      const logsCol = collection(db, 'access_logs');
      const q = query(logsCol, orderBy('timestamp', 'desc'), limit(100));

      return onSnapshot(q, (snapshot) => {
        const cloudLogs: AccessLog[] = [];
        snapshot.forEach((d) => {
          cloudLogs.push(d.data() as AccessLog);
        });

        if (cloudLogs.length > 0) {
          localStorage.setItem(STORAGE_KEY_LOCAL_LOGS, JSON.stringify(cloudLogs));
          onLogs(cloudLogs);
        } else {
          onLogs(this.getLocalLogs());
        }
      }, (err) => {
        console.warn('Logs subscription error:', err);
        onLogs(this.getLocalLogs());
      });
    } catch (e) {
      console.warn('Error setting up logs subscriber:', e);
      onLogs(this.getLocalLogs());
      return () => {};
    }
  }
};
