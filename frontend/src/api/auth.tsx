import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setJwtToken } from './api';

interface UserType {
    username: string;
    is_admin: boolean;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isAdmin: boolean;
    user: UserType | null;
    token: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('jwtToken')
    );
    const [user, setUser] = useState<UserType | null>(() => {
        const saved = localStorage.getItem('user');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });

    const isAuthenticated = !!token;
    const isAdmin = user?.is_admin ?? false;

    useEffect(() => {
        if (token) {
            setJwtToken(token);
        }
    }, [token]);

    const login = async (username: string, password: string) => {
        try {
            const response = await api.post('/api/login', { username, password });
            const { token, is_admin } = response.data;

            if (token) {
                const user = { username, is_admin };

                setToken(token);
                setUser(user);

                localStorage.setItem('jwtToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                setJwtToken(token);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setJwtToken('');
    };

    const value: AuthContextType = {
        isAuthenticated,
        isAdmin,
        user,
        token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Redirect if not authenticated
export function useAuthTokenSync(redirectTo: string = '/login') {
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate(redirectTo);
        }
    }, [isAuthenticated, token, navigate]);
}
