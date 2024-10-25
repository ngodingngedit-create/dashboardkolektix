import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DateInput,
} from '@nextui-org/react';
import { FormEvent } from '@/utils/formInterface';
import InputField from '@/components/Input';
import { useState } from 'react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  form: FormEvent;
  setForm(form: FormEvent): void;
}

export default function ModalDate({ isOpen, setIsOpen, form, setForm }: ModalProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const onSubmit = () => {
    // setForm({ ...form, end_date: endDate });
    setIsOpen(false);
  };
  return (
    <div className='flex flex-col gap-2'>
      <Modal isOpen={isOpen} placement='auto' onOpenChange={setIsOpen} className='text-dark'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Tanggal</ModalHeader>
              <ModalBody>
                <div className='grid grid-cols-2 w-full gap-4'>
                  <InputField
                    type='date'
                    label='Tanggal Mulai'
                    value={form.start_date && form.start_date}
                    required
                    onChange={(e) => setForm({ ...form, start_date: e.toString() })}
                    fullWidth
                  />
                  <InputField
                    type='date'
                    label='Tanggal Selesai'
                    minDateVal={form.start_date ? form.start_date : undefined}
                    value={form.end_date && form.end_date}
                    required
                    onChange={(e) => setForm({ ...form, end_date: e.toString() })}
                    fullWidth
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <button
                  className='w-full text-white bg-primary-dark rounded-md py-2 cursor-pointer disabled:bg-primary-disabled disabled:text-white disabled:cursor-not-allowed'
                  disabled={form.start_date === '' && form.end_date === ''}
                  onClick={onSubmit}
                >
                  Simpan
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
