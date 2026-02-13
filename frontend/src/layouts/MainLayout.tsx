import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar } from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom"; 

interface MainLayoutProps {
  children: React.ReactNode;
  username?: string;
  email?: string;
}

export const MainLayout = ({ children, username, email }: MainLayoutProps) => {
  const location = useLocation(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar maxWidth="xl" className="border-b border-white/10 bg-black">
        <NavbarBrand>
          <span className="font-bold text-inherit text-xl text-primary">🚀 Gestor TFG</span>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={location.pathname === '/dashboard'}>
            <Link color={location.pathname === '/dashboard' ? "primary" : "foreground"} href="/dashboard">
              Dashboard
            </Link>
          </NavbarItem>
          
          <NavbarItem isActive={location.pathname.startsWith('/project')}>
            <Link color={location.pathname.startsWith('/project') ? "primary" : "foreground"} href="#" aria-current="page">
              Projectes
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={username?.charAt(0).toUpperCase() || "?"}
                size="sm"
                src="" 
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat" className="text-white">
              <DropdownItem key="profile" className="h-14 gap-2 opacity-100" textValue="Perfil">
                <p className="text-sm text-gray-400">Connectat com:</p>
                <p className="font-semibold text-primary">{email}</p>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout} className="text-danger" textValue="Tancar Sessió">
                Tancar Sessió
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