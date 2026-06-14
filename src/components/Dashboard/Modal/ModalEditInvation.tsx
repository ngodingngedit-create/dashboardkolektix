import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from "@nextui-org/react";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '@/Config';
import { notifications } from "@mantine/notifications";

interface EditEventModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

const EditEventModal = ({ item, isOpen, onClose }: EditEventModalProps) => {
  const [formData, setFormData] = useState({
    id: '',
    event_id: '',
    invitation_cat_id: '',
    invitation_title: '',
    invitation_description: '',
    total_qty: 1,
    details: [
      { id: '', invitation_number: '', fullname: '', email: '', phone: '' }
    ],
    invitation_status: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${config.wsUrl}invitation-category`);
        const data = response.data?.data || response.data || [];
        setCategory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };
    fetchCategory();
  }, []);

  useEffect(() => {
    if (item) {
      const details = item.event_invitation_detail || item.has_detail_invitation || [];
      setFormData({
        id: item.id || '',
        event_id: item.event_id || '',
        invitation_cat_id: item.invitation_cat_id || '',
        invitation_title: item.invitation_title || '',
        invitation_description: item.invitation_description || '',
        total_qty: item.total_qty || 1,
        details: details.length > 0 ? details.map((d: any) => ({
          id: d.id || '',
          invitation_number: d.invitation_number || '',
          fullname: d.fullname || '',
          email: d.email || '',
          phone: d.phone || ''
        })) : [{ id: '', invitation_number: '', fullname: '', email: '', phone: '' }],
        invitation_status: item.invitation_status || 1,
      });
    }
  }, [item, isOpen]);

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { id: '', invitation_number: '', fullname: '', email: '', phone: '' }],
      total_qty: formData.total_qty + 1
    });
  };

  const removeDetail = (index: number) => {
    const updatedDetails = [...formData.details];
    updatedDetails.splice(index, 1);
    setFormData({ ...formData, details: updatedDetails, total_qty: formData.total_qty - 1 });
  };

  const handleDetailChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        invitation_code: formData.details[0]?.invitation_number || formData.details[0]?.id || formData.id || 'INV-000',
        fullname: formData.details[0]?.fullname || '',
        email: formData.details[0]?.email || '',
        qty: formData.total_qty,
        details: JSON.stringify(formData.details)
      };
      
      await axios.put(`${config.wsUrl}invitations/${formData.id}`, payload);
      notifications.show({
        position: "top-right",
        color: "green",
        message: "Invitation berhasil diperbarui",
      });
      onClose();
    } catch (error) {
      console.error('Error updating invitation:', error);
      notifications.show({
        position: "top-right",
        color: "red",
        message: "Gagal memperbarui invitation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="2xl">
      <ModalContent>
        <ModalHeader className="text-dark">Edit Invitation</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-wrap gap-4">
              <Select
                className="flex-1 min-w-[30%]"
                label={<span className="text-dark">Invitation Category</span>}
                selectedKeys={formData.invitation_cat_id ? [String(formData.invitation_cat_id)] : []}
                onChange={(e) => setFormData({ ...formData, invitation_cat_id: e.target.value })}
                labelPlacement="outside"
              >
                {category.map((e: any) => (
                  <SelectItem key={String(e.id)} textValue={e.name}>
                    {e.name}
                  </SelectItem>
                ))}
              </Select>
              <Input
                className="flex-1 min-w-[30%]"
                label={<span className="text-dark">Invitation Title</span>}
                value={formData.invitation_title}
                onChange={(e) => setFormData({ ...formData, invitation_title: e.target.value })}
                labelPlacement="outside"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Textarea
                className="flex-1 min-w-[30%]"
                label={<span className="text-dark">Invitation Description</span>}
                value={formData.invitation_description}
                onChange={(e) => setFormData({ ...formData, invitation_description: e.target.value })}
                labelPlacement="outside"
                minRows={3}
              />
            </div>
            <h6 className="text-md font-semibold mt-4">Penerima Invitation</h6>
            {formData.details.map((detail, index) => (
              <div key={index} className="flex flex-wrap gap-4 items-end bg-gray-50 p-3 rounded-lg relative">
                {formData.details.length > 1 && (
                  <button 
                    onClick={() => removeDetail(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10 text-xs"
                  >
                    ×
                  </button>
                )}
                <Input
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">Fullname</span>}
                  value={detail.fullname || ''}
                  onChange={(e) => handleDetailChange(index, 'fullname', e.target.value)}
                  labelPlacement="outside"
                />
                <Input
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">Email</span>}
                  value={detail.email || ''}
                  onChange={(e) => handleDetailChange(index, 'email', e.target.value)}
                  labelPlacement="outside"
                />
                <Input
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">Phone</span>}
                  value={detail.phone || ''}
                  onChange={(e) => handleDetailChange(index, 'phone', e.target.value)}
                  labelPlacement="outside"
                />
              </div>
            ))}
            <Button onClick={addDetail} className="bg-secondary text-dark mt-2">
              Tambah Penerima
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit} isLoading={isLoading} className="bg-primary text-white">
            Simpan Perubahan
          </Button>
          <Button variant="flat" onPress={onClose}>
            Batal
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditEventModal;
