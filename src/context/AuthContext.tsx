import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../../types';

// Mock users database - In production, this would be a real database
const MOCK_USERS = [
    {
        id: '1',
        email: 'admin@cea.com',
        password: 'marwan2003',
        name: 'Admin User',
        role: 'admin' as const
    },
    {
        id: '2',
        email: 'viewer@cea.com',
        password: 'viewer123',
        name: 'Viewer User',
        role: 'viewer' as const
    }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user', e);
                localStorage.removeItem('auth_user');
            }
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find user in mock database
        const foundUser = MOCK_USERS.find(
            u => u.email === email && u.password === password
        );

        if (foundUser) {
            const authenticatedUser: User = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name,
                role: foundUser.role
            };

            setUser(authenticatedUser);
            localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isAuthenticated: user !== null,
        isViewer: user?.role === 'viewer',
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
