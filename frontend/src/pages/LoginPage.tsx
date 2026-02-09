import { useState } from 'react';
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);
            
            const token = response.data;
            console.log("Token rebut:", token); 

            localStorage.setItem('token', token);

            navigate('/dashboard'); 

        } catch (err: any) {
            setError("Credencials incorrectes. Torna-ho a provar.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full">
            <Card className="w-full max-w-md p-6 shadow-2xl border border-white/10 bg-background/60 backdrop-blur-md">
                <CardHeader className="flex flex-col gap-1 items-center pb-6">
                    <h1 className="text-3xl font-bold text-primary">Benvingut</h1>
                    <p className="text-small text-default-500">Inicia sessió per continuar</p>
                </CardHeader>
                
                <CardBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <Input 
                            isRequired
                            variant="bordered"
                            label="Email" 
                            name="email"
                            type="email"
                            placeholder="exemple@correu.com" 
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input 
                            isRequired
                            variant="bordered"
                            label="Contrasenya" 
                            name="password"
                            type="password"
                            placeholder="********" 
                            value={formData.password}
                            onChange={handleChange}
                        />

                        {error && (
                            <div className="p-3 bg-danger-50 text-danger text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" color="primary" size="lg" isLoading={loading} className="w-full font-semibold">
                            Entrar
                        </Button>

                        <div className="flex justify-center gap-2 text-small mt-2">
                            <span className="text-default-500">No tens compte?</span>
                            <Link to="/register" className="text-primary hover:underline font-bold">
                                Registra't
                            </Link>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}