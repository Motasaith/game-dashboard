import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                try {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                    api.defaults.headers.common['x-auth-token'] = storedToken;
                } catch (error) {
                    console.error("Failed to parse user from storage", error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            } else {
                // Guest Logic
                let guestUser = localStorage.getItem('guest_user');
                if (!guestUser) {
                    const randomId = Math.floor(Math.random() * 10000);
                    guestUser = JSON.stringify({
                        _id: `guest_${Date.now()}`,
                        username: `Guest_${randomId}`,
                        email: `guest_${randomId}@example.com`,
                        isGuest: true
                    });
                    localStorage.setItem('guest_user', guestUser);
                }
                setUser(JSON.parse(guestUser));
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    // Sync token with axios headers
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete api.defaults.headers.common['x-auth-token'];
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
    };

    const register = async (username, email, password) => {
        const res = await api.post('/api/auth/register', { username, email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (data) => {
        const res = await api.put('/api/users/update', data);
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data)); // Update local storage
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
