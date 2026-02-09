import type { ReactNode } from 'react';
import { NavBar } from '../components/NavBar';

interface MainLayoutProps {
    children: ReactNode;
    username?: string;
    email?: string;
}

export const MainLayout = ({ children, username, email }: MainLayoutProps) => {
    return (
        <div className="min-h-screen bg-background">
            {/* La barra de navegació sempre a dalt */}
            <NavBar username={username} email={email} />
            
            {/* El contingut de la pàgina (Dashboard, Projectes, etc.) anirà aquí */}
            <main className="container mx-auto max-w-7xl px-6 flex-grow pt-6">
                {children}
            </main>
        </div>
    );
};