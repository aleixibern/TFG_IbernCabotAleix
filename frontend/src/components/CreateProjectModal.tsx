import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react";
import api from "../api/axios";
import type { Project } from "../types/Project";

interface CreateProjectModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onProjectCreated: (newProject: Project) => void;
}

export const CreateProjectModal = ({ isOpen, onOpenChange, onProjectCreated }: CreateProjectModalProps) => {
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
      setFormData({ title: "", description: "", subject: "" }); 
      onClose(); 
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
      classNames={{
        base: "bg-content1 text-foreground border border-divider shadow-lg",
        header: "border-b border-divider",
        footer: "border-t border-divider",
        closeButton: "hover:bg-default-100 active:bg-default-200"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-bold">
              Nou Projecte
            </ModalHeader>
            <ModalBody className="py-6 gap-4">
              <Input
                autoFocus
                label="Títol del projecte"
                placeholder="Ex: El meu TFG"
                variant="bordered"
                name="title"
                value={formData.title}
                onChange={handleChange}
                isRequired
              />
              
              <Input
                label="Assignatura"
                placeholder="Ex: Treball de Final de Grau"
                variant="bordered"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />

              <Textarea
                label="Descripció"
                placeholder="Explica breument de què va..."
                variant="bordered"
                name="description"
                value={formData.description}
                onChange={handleChange}
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