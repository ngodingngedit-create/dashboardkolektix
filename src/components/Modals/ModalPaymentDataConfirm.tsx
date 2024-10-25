import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import Button from '../Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

interface Form {
  nik: string;
  full_name: string;
  email: string;
  countryCode: string;
  no_telp: string;
  is_pemesan: number;
}
interface ModalPaymentDataConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  setIsOpen: (isOpen: boolean) => void;
  message?: string;
  data: Form;
  loading: boolean;
}

export default function ModalPaymentDataConfirmation({
  isOpen,
  onConfirm,
  message,
  data,
  loading,
  setIsOpen,
}: ModalPaymentDataConfirmationProps) {
  return (
    <>
      <Modal
        isOpen={isOpen}
        isDismissable={false}
        onOpenChange={setIsOpen}
        isKeyboardDismissDisabled={true}
        className='text-dark'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex items-center gap-5 border-b border-b-primary-light-200'>
                <FontAwesomeIcon icon={faTriangleExclamation} className='text-warning' />
                Konfirmasi
              </ModalHeader>
              <ModalBody>
                <p>Pastikan data kamu sudah benar yaa!</p>
                <div>
                  <p className=' text-grey mb-1'>Nama Lengkap</p>
                  <p className='font-semibold'>{data.full_name}</p>
                </div>
                <div>
                  <p className=' text-grey mb-1'>Email</p>
                  <p className='font-semibold'>{data.email}</p>
                </div>
                <div>
                  <p className=' text-grey mb-1'>No. Telepon / Handphone</p>
                  <p className='font-semibold'>{'+62' + data.no_telp}</p>
                </div>
                <div className='border border-primary-light-200 bg-primary-light px-3 flex flex-col divide-y divide-primary-light-200 rounded-xl mb-3'>
                  <div className='flex gap-3 py-3'>
                    <div className='min-w-5 min-h-5 max-h-5 max-w-5 text-xs bg-primary-dark text-white rounded-full flex items-center justify-center'>
                      1
                    </div>
                    <p>
                      Invoice dan e-Tiket akan dikirim ke alamat email berikut: <br />
                      <span className='font-semibold'>{data.email}</span>
                    </p>
                  </div>
                  <div className='flex gap-3 py-3'>
                    <div className='min-w-5 min-h-5 max-h-5 max-w-5 text-xs bg-primary-dark text-white rounded-full flex items-center justify-center'>
                      2
                    </div>
                    <p>
                      e-Tiket juga akan dikirim melalui whatsapp dengan nomor:
                      <br />
                      <span className='font-semibold'>{data.no_telp}</span>
                    </p>
                  </div>
                  <div className='flex gap-3 py-3'>
                    <div className='min-w-5 min-h-5 max-h-5 max-w-5 text-xs bg-primary-dark text-white rounded-full flex items-center justify-center'>
                      3
                    </div>
                    <p>
                      Jika belum menerima notifikasi email setelah melakukan pembayaran hubungi:
                      <br />
                      <span className='font-semibold'>+62 811 9990 445</span>
                      <br />
                      <span className='font-semibold'>teman@kolektix.com</span>
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className='border-t border-t-primary-light-200'>
                <Button
                  label='Edit Data'
                  color='secondary'
                  disabled={loading}
                  onClick={() => setIsOpen(false)}
                />
                <Button
                  color='primary'
                  label='Saya Mengerti'
                  disabled={loading}
                  onClick={onConfirm}
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
