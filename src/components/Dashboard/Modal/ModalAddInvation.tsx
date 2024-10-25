import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@nextui-org/react";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '@/Config';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string; // Mengambil event_id dari data yang sudah ada
}

const AddEventModal = ({ isOpen, onClose, eventId }: AddEventModalProps) => {
  const [formData, setFormData] = useState({
    event_id: eventId, // Sesuaikan event_id dengan props
    invitation_cat_id: '',
    invitation_title: '',
    invitation_description: '',
    total_qty: 1,
    details: [
      { fullname: '', email: '', phone: '', created_by: 'admin' }
    ],
    invitation_status: 1,
    created_by: 'admin'
  });

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      event_id: eventId,
    }));
  }, [eventId]);

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { fullname: '', email: '', phone: '', created_by: 'admin' }]
    });
  };

  const handleDetailChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${config.wsUrl}invitations/event`, formData);
      toast.success('Event added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event.');
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="2xl">
      <ModalContent>
        <ModalHeader className="text-dark">Add New Invitation</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <Input
                className="flex-1 min-w-[30%]"
                label={<span className="text-dark">Invitation Category ID</span>}
                value={formData.invitation_cat_id}
                onChange={(e) => setFormData({ ...formData, invitation_cat_id: e.target.value })}
                labelPlacement="outside" // Label di atas input
              />
              <Input
                className="flex-1 min-w-[30%]"
                label={<span className="text-dark">Invitation Title</span>}
                value={formData.invitation_title}
                onChange={(e) => setFormData({ ...formData, invitation_title: e.target.value })}
                labelPlacement="outside" // Label di atas input
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Textarea
                className="flex-1 min-w-[30%]"
                label={<span className="text-dark">Invitation Description</span>}
                value={formData.invitation_description}
                onChange={(e) => setFormData({ ...formData, invitation_description: e.target.value })}
                labelPlacement="outside" // Label di atas input
                minRows={3} // Jumlah baris minimum
                maxRows={6} // Jumlah baris maksimum
              />
            </div>
            {formData.details.map((detail, index) => (
              <div key={index} className="flex flex-wrap gap-4">
                <Input
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">{`Fullname ${index + 1}`}</span>}
                  value={detail.fullname}
                  onChange={(e) => handleDetailChange(index, 'fullname', e.target.value)}
                  labelPlacement="outside" // Label di atas input
                />
                <Input
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">{`Email ${index + 1}`}</span>}
                  value={detail.email}
                  onChange={(e) => handleDetailChange(index, 'email', e.target.value)}
                  labelPlacement="outside" // Label di atas input
                />
                <Input
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">{`Phone ${index + 1}`}</span>}
                  value={detail.phone}
                  onChange={(e) => handleDetailChange(index, 'phone', e.target.value)}
                  labelPlacement="outside" // Label di atas input
                />
              </div>
            ))}
            <Button onClick={addDetail} className="bg-secondary text-dark">
              Tambah Penerima Invitation
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit} className="bg-primary text-white">
            Tambah Invitation
          </Button>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddEventModal;
