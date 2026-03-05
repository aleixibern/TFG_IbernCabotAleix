import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Button } from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom"; 
import { getInitials } from '../utils/stringUtils'; 
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

interface MainLayoutProps {
  children: React.ReactNode;
  username?: string;
  email?: string;
}

export const MainLayout = ({ children, username, email }: MainLayoutProps) => {
  const location = useLocation(); 
  const navigate = useNavigate();
  
  // Hooks per als nous sistemes
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Icones SVG professionals per als botons
  const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  );

  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );

  const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar maxWidth="xl" className="border-b border-divider bg-background">
        <NavbarBrand>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/dashboard')}
          >
            {/* Icona SVG professional de Lynx */}
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
            </svg>
            <span className="font-bold text-xl tracking-wide">Lynx</span>
          </div>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={location.pathname === '/dashboard'}>
            <Link color={location.pathname === '/dashboard' ? "primary" : "foreground"} href="/dashboard">
              {t('dashboard')}
            </Link>
          </NavbarItem>
          <NavbarItem isActive={location.pathname.startsWith('/project')}>
            <Link color={location.pathname.startsWith('/project') ? "primary" : "foreground"} href="/dashboard">
              {t('projects')}
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2 items-center">
          
          {/* Botó per canviar el Tema (Light / Dark) */}
          <Button 
            isIconOnly 
            variant="light" 
            aria-label="Toggle theme"
            onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </Button>

          {/* Desplegable per canviar d'Idioma */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly variant="light" aria-label="Language">
                <GlobeIcon />
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Language selection" 
              onAction={(key) => i18n.changeLanguage(key as string)}
            >
              <DropdownItem key="ca">Català</DropdownItem>
              <DropdownItem key="es">Español</DropdownItem>
              <DropdownItem key="en">English</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          
          {/* Desplegable de l'Usuari */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                  isBordered
                  as="button"
                  className="transition-transform ml-2"
                  color="primary"
                  size="sm"
                  showFallback
                  fallback={<span className="font-bold text-foreground">{getInitials(username)}</span>}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2 opacity-100" textValue="Perfil" onPress={() => navigate('/profile')}>
                <p className="text-sm text-default-500">{t('logged_in_as')}</p>
                <p className="font-semibold text-primary">{email}</p>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout} className="text-danger" textValue="Tancar Sessió">
                {t('logout')}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="max-w-7xl mx-auto px-6 pt-6 h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
};