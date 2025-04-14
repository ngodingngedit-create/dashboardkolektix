import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DateInput,
} from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { FormEvent } from '@/utils/formInterface';
import { CalendarDate } from '@nextui-org/react';
import { useState } from 'react';
import React from 'react';

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
  form: FormEvent;
  setForm(form: FormEvent): void;
}

export default function ModalTicket({ isOpen, setIsOpen, form, setForm }: ModalProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  return (
    <div className='flex flex-col gap-2'>
      <Modal isOpen={isOpen} placement='auto' onOpenChange={setIsOpen} className='text-dark'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Tanggal</ModalHeader>
              <ModalBody>
                <div className='flex w-full flex-wrap gap-4'>
                  <DateInput
                    label={'Tanggal Mulai'}
                    className='w-full'
                    classNames={{
                      inputWrapper: 'border shadow-sm border-primary-light-200 bg-white rounded-md',
                    }}
                    labelPlacement='outside'
                    isRequired
                    startContent={<FontAwesomeIcon icon={faCalendar} className='text-dark' />}
                    onChange={(e: CalendarDate | null) => {
                      setStartDate(e ? e.toString() : '');
                    }}
                  />
                  <DateInput
                    label={'Tanggal Selesai'}
                    className='w-full'
                    classNames={{
                      inputWrapper: 'border shadow-sm border-primary-light-200 bg-white rounded-md',
                    }}
                    labelPlacement='outside'
                    isRequired
                    startContent={<FontAwesomeIcon icon={faCalendar} className='text-dark' />}
                    onChange={(e: CalendarDate | null) => {
                      setEndDate(e ? e.toString() : '');
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <button
                  className='w-full text-white bg-primary-dark rounded-md py-2'
                  disabled={startDate === '' || endDate === ''}
                  onClick={() => {
                    console.log(startDate, endDate);
                    setForm({ ...form, end_date: startDate });
                    setForm({ ...form, end_date: endDate });
                    onClose();
                  }}
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
