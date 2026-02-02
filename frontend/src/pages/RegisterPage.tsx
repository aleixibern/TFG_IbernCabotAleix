import { useState } from 'react';
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    
    
    const [formData, setFormData] = useState({
        username: '',
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
            await api.post('/auth/register', formData);
            alert("Usuari registrat correctament!");
            navigate('/login'); 
        } catch (err: any) {
            setError("Error en el registre. Potser l'email ja existeix?");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen w-full">
            
            {}
            <Card className="w-full max-w-md p-6 shadow-2xl border border-white/10 bg-background/60 backdrop-blur-md">
                <CardHeader className="flex flex-col gap-1 items-center pb-6">
                    <h1 className="text-3xl font-bold text-primary">Crear Compte</h1>
                    <p className="text-small text-default-500">Uneix-te a la plataforma</p>
                </CardHeader>
                
                <CardBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <Input 
                            isRequired
                            variant="bordered"
                            label="Nom d'usuari" 
                            name="username"
                            placeholder="Introdueix el teu nom" 
                            value={formData.username}
                            onChange={handleChange}
                        />
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
                            placeholder="Minim 6 caràcters" 
                            value={formData.password}
                            onChange={handleChange}
                        />

                        {error && (
                            <div className="p-3 bg-danger-50 text-danger text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" color="primary" size="lg" isLoading={loading} className="w-full font-semibold">
                            Registrar-se
                        </Button>

                        <div className="flex justify-center gap-2 text-small mt-2">
                            <span className="text-default-500">Ja tens compte?</span>
                            <Link to="/login" className="text-primary hover:underline font-bold">
                                Inicia sessió
                            </Link>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
