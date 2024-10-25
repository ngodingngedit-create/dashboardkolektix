import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { FormEvent } from '@/utils/formInterface';
import { useState } from 'react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  form: FormEvent;
  setForm(form: FormEvent): void;
}

export default function ModalTime({ isOpen, setIsOpen, form, setForm }: ModalProps) {
  const [startTime, setStartTime] = useState<string>(form.start_time);
  const [endTime, setEndTime] = useState<string>(form.end_time);
  const [zoneTime, setZoneTime] = useState<string>(form.zone_time || 'WIB'); // Default to WIB if no zone_time

  const onSubmit = () => {
    setForm({ ...form, start_time: startTime, end_time: endTime, zone_time: zoneTime });
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
                <div className='grid grid-cols-2 w-full gap-3'>
                  <div>
                    <label className='block mb-1 text-sm'>Jam Mulai</label>
                    <input
                      type='time'
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className='w-full p-2 border border-primary-light-200 rounded-md'
                      required
                    />
                  </div>
                  <div>
                    <label className='block mb-1 text-sm'>Jam Berakhir</label>
                    <input
                      type='time'
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className='w-full p-2 border border-primary-light-200 rounded-md'
                      required
                    />
                  </div>
                </div>
                <RadioGroup
                  label={
                    <p className='text-sm'>
                      Zona Waktu <span className='text-danger'>*</span>
                    </p>
                  }
                  defaultValue={zoneTime} // Ensure WIB is selected by default
                  size='md'
                  onChange={(e) => setZoneTime(e.target.value)}
                >
                  <Radio value='WIB'>Waktu Indonesia Barat</Radio>
                  <Radio value='WITA'>Waktu Indonesia Tengah</Radio>
                  <Radio value='WIT'>Waktu Indonesia Timur</Radio>
                </RadioGroup>
              </ModalBody>
              <ModalFooter>
                <button
                  className='w-full text-white bg-primary-dark rounded-md py-2 disabled:bg-primary-disabled disabled:text-white disabled:cursor-not-allowed'
                  disabled={startTime === '' || endTime === '' || zoneTime === ''}
                  onClick={() => {
                    onSubmit();
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
