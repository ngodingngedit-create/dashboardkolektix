import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import OTPInput from 'react-otp-input';
import Button from '../Button';

interface ModalOTPProps {
  isOpen: boolean;
  onSubmit: () => void;
  setIsOpen: (isOpen: boolean) => void;
  otp: string;
  setOtp: (otp: string) => void;
  email: string;
  loading: boolean;
}

export default function ModalOTP({
  isOpen,
  onSubmit,
  setIsOpen,
  email,
  otp,
  setOtp,
  loading,
}: ModalOTPProps) {
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
                <div className='flex flex-col items-center gap-8 justify-center'>
                  <p className='text-dark font-semibold text-center px-5'>
                    Mohon periksa Email kamu. Kami telah mengirimkan kode ke{' '}
                    <span className='text-primary-base'>{email}</span>
                  </p>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    inputType='tel'
                    numInputs={6}
                    renderInput={(props) => <input {...props} />}
                    containerStyle={{ width: '80%' }}
                    inputStyle={{
                      border: '1px solid grey ',
                      borderRadius: '8px',
                      width: '100%',
                      height: '40px',
                      fontSize: '20px',
                      color: '#000',
                      fontWeight: '400',
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color='primary'
                  label='Verifikasi'
                  onClick={onSubmit}
                  disabled={loading || otp.length !== 6}
                  fullWidth
                  className='py-2'
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
