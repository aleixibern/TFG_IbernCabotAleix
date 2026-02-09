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
  onProjectCreated: (newProject: Project) => void; // Funció per avisar al pare
}

export const CreateProjectModal = ({ isOpen, onOpenChange, onProjectCreated }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState({ title: "", description: "" });
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
      // 1. Enviem les dades al Backend
      const response = await api.post<Project>("/projects", formData);
      
      // 2. Avisem al Dashboard que tenim un projecte nou
      onProjectCreated(response.data);
      
      // 3. Resetegem el formulari i tanquem
      setFormData({ title: "", description: "" });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error creant el projecte. Torna-ho a provar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Nou Projecte</ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="Títol del projecte"
                placeholder="Ex: TFG Desenvolupament Web"
                variant="bordered"
                name="title"
                value={formData.title}
                onChange={handleChange}
                isRequired
              />
              <Textarea
                label="Descripció"
                placeholder="De què tracta aquest projecte?"
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