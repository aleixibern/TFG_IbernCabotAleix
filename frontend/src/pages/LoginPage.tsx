import { useState } from 'react';
import { Button, Input, Card, CardBody, Divider } from "@heroui/react";
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      alert('Credencials incorrectes o error de connexió');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        console.log("Token de Google rebut. Enviant al Backend...");
        
        
        const res = await api.post('/auth/google', { 
            token: credentialResponse.credential 
        });
        
        localStorage.setItem('token', res.data.token);
        
        navigate('/dashboard');
        
      } catch (e) {
        console.error("Error al backend:", e);
        alert("Error iniciant sessió amb Google. Mira la consola.");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Card className="w-[400px] p-8 bg-zinc-900 border border-white/10 shadow-2xl">
        <CardBody className="flex flex-col gap-6">
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Benvingut</h2>
            <p className="text-default-500 text-sm mt-1">Gestor de Projectes TFG</p>
          </div>

          
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Google Login Failed')}
              theme="filled_black" 
              shape="rectangular"
              size="large"
              width="320"
              text="signin_with"
            />
          </div>

          <div className="flex items-center gap-2">
            <Divider className="flex-1 bg-white/20" />
            <span className="text-xs text-default-500 uppercase">O amb correu</span>
            <Divider className="flex-1 bg-white/20" />
          </div>
          
          <div className="flex flex-col gap-3">
            <Input 
              label="Email" 
              placeholder="nom@exemple.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              variant="bordered"
              classNames={{ 
                input: "text-white", 
                label: "text-white/70",
                inputWrapper: "border-white/20 hover:border-primary group-data-[focus=true]:border-primary" 
              }}
            />
            <Input 
              label="Contrasenya" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              variant="bordered"
              classNames={{ 
                input: "text-white", 
                label: "text-white/70",
                inputWrapper: "border-white/20 hover:border-primary group-data-[focus=true]:border-primary" 
              }}
            />
          </div>
          
          <Button color="primary" onPress={handleLogin} className="w-full font-bold shadow-lg shadow-primary/20">
            Entrar
          </Button>

          <p className="text-center text-default-500 text-sm mt-2">
            No tens compte? <Link to="/register" className="text-primary hover:underline font-medium">Registra't</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}