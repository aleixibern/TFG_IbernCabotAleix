import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Input, Button, Avatar, Divider, Spinner } from "@heroui/react";
import { MainLayout } from '../layouts/MainLayout';
import api from '../api/axios';
import type { User } from '../types/User';
import { getInitials } from '../utils/stringUtils'; // <-- IMPORT NOU

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        api.get<User>('/users/me').then(res => {
            setUser(res.data);
            setUsername(res.data.username);
            setLoading(false);
        }).catch(err => {
            console.error("Error carregant el perfil:", err);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage({ text: "", type: "" });
        try {
            const res = await api.put<User>('/users/me', { username });
            setUser(res.data);
            setMessage({ text: "Perfil actualitzat amb èxit!", type: "success" });
        } catch (error) {
            setMessage({ text: "Error a l'actualitzar el perfil.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black"><Spinner size="lg" /></div>;

    return (
        <MainLayout username={user?.username} email={user?.email}>
            <div className="max-w-2xl mx-auto p-4 mt-8">
                <h1 className="text-3xl font-bold text-white mb-6">El meu Perfil</h1>
                
                <Card className="bg-zinc-900 border border-white/10">
                    <CardHeader className="flex gap-5 p-6 pb-4">
                        <Avatar 
                            className="w-20 h-20 text-large" 
                            color="primary" 
                            isBordered 
                            showFallback
                            fallback={<span className="font-bold">{getInitials(user?.username)}</span>}
                        />
                        <div className="flex flex-col justify-center">
                            <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                            <p className="text-default-500">{user?.email}</p>
                        </div>
                    </CardHeader>
                    <Divider className="bg-white/10" />
                    <CardBody className="p-6 gap-6">
                        <h3 className="text-lg font-semibold text-white">Dades Bàsiques</h3>
                        
                        <Input 
                            label="Correu Electrònic" 
                            value={user?.email} 
                            isDisabled 
                            variant="bordered"
                            description="L'adreça de correu no es pot modificar per seguretat."
                        />

                        <Input 
                            label="Nom d'usuari" 
                            value={username} 
                            onValueChange={setUsername}
                            variant="bordered"
                            classNames={{ input: "text-white" }}
                        />

                        {message.text && (
                            <p className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-danger'}`}>
                                {message.text}
                            </p>
                        )}

                        <div className="flex justify-end mt-2">
                            <Button 
                                color="primary" 
                                onPress={handleSave} 
                                isLoading={saving} 
                                isDisabled={username === user?.username || !username.trim()}
                            >
                                Guardar Canvis
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </MainLayout>
    );
}