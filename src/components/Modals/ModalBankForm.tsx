import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import InputField from '@/components/Input';
import { useEffect, useState } from 'react';
import Button from '../Button';
import { UserProps } from '@/utils/globalInterface';
import { Post } from '@/utils/REST';
import { toast } from 'react-toastify';

interface FormBankProps {
  user_id: number;
  type_bank: string;
  account_name: string;
  account_number: string;
  status: 'active' | 'inactive';
}
interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  user: UserProps | undefined;
  getData: () => void;
}

export default function ModalBankForm({ isOpen, setIsOpen, user, getData }: ModalProps) {
  const [form, setForm] = useState<FormBankProps>({
    user_id: 0,
    type_bank: '',
    account_name: '',
    account_number: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    setLoading(true);
    Post('user-bank', form)
      .then((res) => {
        console.log(res);
        toast.success('Sukses menambah rekening');
        getData();
        setIsOpen(false);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error('Gagal menambah rekening');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) {
      setForm({
        ...form,
        user_id: user?.id ?? 0,
      });
    }
  }, [user]);
  return (
    <div className='flex flex-col gap-2'>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} className='text-dark font-inter'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1 px-5'>Tambah Rekening</ModalHeader>
              <ModalBody className='px-5'>
                <div className='flex flex-col gap-3'>
                  <InputField
                    label='Nama Bank'
                    placeholder='Ketik nama bank'
                    type='text'
                    fullWidth
                    onChange={(e) => setForm({ ...form, type_bank: e.target.value })}
                  />
                  <InputField
                    label='Nomor Rekening'
                    placeholder='Ketik nomor rekening'
                    type='number'
                    fullWidth
                    onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                  />
                  <InputField
                    label='Atas Nama'
                    placeholder='Ketik nama pemilik rekening'
                    type='text'
                    fullWidth
                    onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                  />
                </div>
              </ModalBody>
              <ModalFooter className='px-5'>
                <Button
                  color='primary'
                  onClick={onSubmit}
                  label='Simpan'
                  fullWidth
                  disabled={loading}
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
