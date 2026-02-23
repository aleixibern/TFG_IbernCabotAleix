import { useState } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Textarea 
} from "@heroui/react";
import api from "../api/axios";
import type { Project } from "../types/Project";

interface CreateProjectModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onProjectCreated: (newProject: Project) => void;
}

export const CreateProjectModal = ({ isOpen, onOpenChange, onProjectCreated }: CreateProjectModalProps) => {
  // 1. AFEGIM "subject" A L'ESTAT INICIAL
  const [formData, setFormData] = useState({ title: "", description: "", subject: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (onClose: () => void) => {
    if (!formData.title.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await api.post<Project>("/projects", formData);
      onProjectCreated(response.data);
      // 2. NETEJEM TAMBÉ EL "subject" EN ACABAR
      setFormData({ title: "", description: "", subject: "" }); 
      onClose(); // Tancar modal
    } catch (err) {
      console.error(err);
      setError("Error al crear el projecte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      placement="top-center" 
      backdrop="blur"
    >
      <ModalContent className="bg-zinc-900 border border-white/10 text-white">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-bold">
              Nou Projecte
            </ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="Títol del projecte"
                placeholder="Ex: El meu TFG"
                variant="bordered"
                name="title"
                value={formData.title}
                onChange={handleChange}
                isRequired
                classNames={{
                  input: "text-white",
                  label: "text-white/70",
                  inputWrapper: "border-white/20 hover:border-primary group-data-[focus=true]:border-primary"
                }}
              />
              
              {/* 3. AFEGIM L'INPUT DE L'ASSIGNATURA */}
              <Input
                label="Assignatura"
                placeholder="Ex: Treball de Final de Grau"
                variant="bordered"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                classNames={{
                  input: "text-white",
                  label: "text-white/70",
                  inputWrapper: "border-white/20 hover:border-primary group-data-[focus=true]:border-primary"
                }}
              />

              <Textarea
                label="Descripció"
                placeholder="Explica breument de què va..."
                variant="bordered"
                name="description"
                value={formData.description}
                onChange={handleChange}
                classNames={{
                  input: "text-white",
                  label: "text-white/70",
                  inputWrapper: "border-white/20 hover:border-primary group-data-[focus=true]:border-primary"
                }}
              />
              {error && <p className="text-danger text-small">{error}</p>}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Cancel·lar
              </Button>
              <Button color="primary" onPress={() => handleSubmit(onClose)} isLoading={loading}>
                Crear Projecte
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};