import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Put } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';

interface TransactionProofProps {
  transaction_id: number;
  bank_id: number;
  bank_name: string;
  bank_account: string;
  bank_account_name: string;
  file_transfer: string;
}

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  id: number;
  invoice: string;
}

export default function ModalTransaction({ isOpen, setIsOpen, id, invoice }: ModalProps) {
  const [form, setForm] = useState<TransactionProofProps>({
    transaction_id: 0,
    bank_id: 1,
    bank_name: '',
    bank_account: '',
    bank_account_name: '',
    file_transfer: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const userData = useLoggedUser();

  const handleSubmit = () => {
    setLoading(true);
    Put(`transaction-payment-confirmation`, { ...form, transaction_id: id })
      .then((res) => {
        console.log(res);
        if (userData?.id) {
          router.push('/success');
        } else {
          router.push(`/success/${invoice}`);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, file_transfer: reader.result as string });
        // console.log(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = () => {
    return form.bank_account_name !== '' && form.file_transfer !== '';
  };

  // useEffect(() => {
  //   console.log(form);
  //   console.log(id);
  // }, [form]);
  return (
    <div className='flex flex-col gap-2'>
      <Modal isOpen={isOpen} placement='auto' onOpenChange={setIsOpen} className='text-dark'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Bukti Pembayaran</ModalHeader>
              <ModalBody>
                <div className='flex w-full flex-wrap gap-4'>
                  <Input
                    type='text'
                    label='Nama Bank'
                    placeholder='e.g: BCA'
                    className=''
                    variant='bordered'
                    labelPlacement='outside'
                    onChange={(e: any) => setForm({ ...form, bank_name: e.target.value })}
                  />
                  <Input
                    type='text'
                    label='No Rekening'
                    placeholder='e.g: 2x02930xx'
                    className=''
                    variant='bordered'
                    labelPlacement='outside'
                    onChange={(e: any) => setForm({ ...form, bank_account: e.target.value })}
                  />
                  <Input
                    type='text'
                    label='Nama Pemilik Rekening'
                    placeholder='e.g: John Doe'
                    className=''
                    isRequired
                    variant='bordered'
                    labelPlacement='outside'
                    onChange={(e: any) => setForm({ ...form, bank_account_name: e.target.value })}
                  />
                  <label className='block text-sm font-medium text-dark'>
                    Foto Bukti Pembayaran <span className='text-red-500'>*</span>
                  </label>
                  <input
                    className='block w-full mb-5 py-2 text-sm text-dark border border-grey rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:text-white file:border-0 file:ml-2 file:bg-primary-disabled file:py-1 file:rounded-md'
                    id='small_size'
                    type='file'
                    onChange={(e: any) => handleFile(e)}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button>
                <Button
                  className='bg-primary-base text-white disabled:bg-primary-disabled disabled:cursor-not-allowed'
                  disabled={loading || !isFormValid()}
                  onClick={handleSubmit}
                >
                  {loading ? <Spinner color='default' size='sm' /> : 'Submit'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
