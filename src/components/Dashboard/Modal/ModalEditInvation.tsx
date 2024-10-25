import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '@/Config';

interface EditEventModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

const EditEventModal = ({ item, isOpen, onClose }: EditEventModalProps) => {
  const [formData, setFormData] = useState({
    event_id: '',
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
    if (item) {
      setFormData(item);
    }
  }, [item]);

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
      await axios.put(`${config.wsUrl}invitations/event/${formData.event_id}`, formData);
      toast.success('Event updated successfully');
      onClose(); // Close modal after successful submission
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event.');
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="2xl">
      <ModalContent>
        <ModalHeader className="text-dark">Edit Event</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <Input
                className="flex-1 min-w-[30%]"
                label="Event ID"
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
              />
              <Input
                className="flex-1 min-w-[30%]"
                label="Invitation Category ID"
                value={formData.invitation_cat_id}
                onChange={(e) => setFormData({ ...formData, invitation_cat_id: e.target.value })}
              />
              <Input
                className="flex-1 min-w-[30%]"
                label="Invitation Title"
                value={formData.invitation_title}
                onChange={(e) => setFormData({ ...formData, invitation_title: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Input
                className="flex-1 min-w-[30%]"
                label="Invitation Description"
                value={formData.invitation_description}
                onChange={(e) => setFormData({ ...formData, invitation_description: e.target.value })}
              />
            </div>
            {/* Only showing one detail input */}
            <div className="flex flex-wrap gap-4">
              <Input
                className="flex-1 min-w-[30%]"
                label="Fullname"
                value={formData.details[0]?.fullname || ''}
                onChange={(e) => handleDetailChange(0, 'fullname', e.target.value)}
              />
              <Input
                className="flex-1 min-w-[30%]"
                label="Email"
                value={formData.details[0]?.email || ''}
                onChange={(e) => handleDetailChange(0, 'email', e.target.value)}
              />
              <Input
                className="flex-1 min-w-[30%]"
                label="Phone"
                value={formData.details[0]?.phone || ''}
                onChange={(e) => handleDetailChange(0, 'phone', e.target.value)}
              />
            </div>
            <Button onClick={addDetail} className="bg-secondary text-dark">
              Add Another Detail
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit} className="bg-primary text-white">
            Update Event
          </Button>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditEventModal;
