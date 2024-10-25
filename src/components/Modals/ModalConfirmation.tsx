import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import Button from '../Button';

interface ModalConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  setIsOpen: (isOpen: boolean) => void;
  message?: string;
}

export default function ModalConfirmation({
  isOpen,
  onConfirm,
  message,
  setIsOpen,
}: ModalConfirmationProps) {
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
              <ModalHeader className='flex flex-col gap-1'>Konfirmasi</ModalHeader>
              <ModalBody>
                <p>{message ? message : 'Apakah anda yakin?'}</p>
              </ModalBody>
              <ModalFooter>
                <Button label='Tidak' color='secondary' onClick={() => setIsOpen(false)} />
                <Button color='primary' label='Ya' onClick={onConfirm} />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
