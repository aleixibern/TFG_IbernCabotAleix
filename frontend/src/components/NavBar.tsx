import {
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Link, 
  DropdownItem, 
  DropdownTrigger, 
  Dropdown, 
  DropdownMenu, 
  Avatar
} from "@heroui/react";
import { useNavigate } from "react-router-dom";

interface NavBarProps {
    username?: string;
    email?: string;
}

export const NavBar = ({ username, email }: NavBarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    // 'maxWidth="xl"' fa que la barra no sigui infinita en pantalles gegants
    // 'backdrop-blur' li dona l'efecte vidre modern
    <Navbar maxWidth="xl" position="sticky" className="bg-background/70 backdrop-blur-lg border-b border-white/10">
      
      <NavbarBrand>
        {/* LOGO AMB DEGRADAT */}
        <p className="font-bold text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          🚀 Gestor TFG
        </p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarItem isActive>
          <Link color="primary" href="/dashboard" className="font-medium">
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#" className="hover:text-primary transition-colors">
            Projectes
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        
        {/* AQUI ESTÀ EL CANVI CLAU: Afegim 'classNames' per pintar el fons de la capsa */}
        <Dropdown 
          placement="bottom-end" 
          backdrop="blur"
          classNames={{
            content: "bg-[#18181b] border border-white/10 shadow-xl rounded-lg min-w-[200px]"
          }}
        >
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform hover:scale-105"
              color="secondary"
              name={username?.charAt(0).toUpperCase()}
              radius="sm"
              size="sm"
            />
          </DropdownTrigger>
          
          <DropdownMenu 
            aria-label="Profile Actions" 
            variant="flat"
            className="text-white" // Forcem text blanc
            itemClasses={{
              base: [
                "data-[hover=true]:bg-white/10", // Color gris clar en passar el ratolí
                "data-[hover=true]:text-white",
              ],
            }}
          >
            <DropdownItem key="profile" className="h-14 gap-2 opacity-100" textValue="Perfil">
              <p className="font-semibold">Connectat com a</p>
              <p className="font-semibold text-primary">{email}</p>
            </DropdownItem>
            
            <DropdownItem key="settings" textValue="Configuració">
              Configuració
            </DropdownItem>
            
            <DropdownItem key="team_settings" textValue="Equip">
              Equip
            </DropdownItem>
            
            <DropdownItem key="logout" color="danger" onPress={handleLogout} textValue="Tancar Sessió">
              Tancar Sessió
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};