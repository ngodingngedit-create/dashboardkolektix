import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
  cn,
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

export default function ModalLocation({ isOpen, setIsOpen, form, setForm }: ModalProps) {
  const [eventType, setEventType] = useState<string>(
    form.organization_method !== '' ? form.organization_method : 'Offline'
  );
  const [locationForm, setLocationForm] = useState<any>({
    organization_method: form.organization_method,
    location_name: form.location_name,
    location_address: form.location_address,
    location_city: form.location_city,
    location_map: form.location_map,
  });

  const onSubmit = () => {
    setForm({ ...form, ...locationForm });
    setIsOpen(false);
  };
  return (
    <div className='flex flex-col gap-2'>
      <Modal isOpen={isOpen} placement='auto' onOpenChange={setIsOpen} className='text-dark'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Lokasi</ModalHeader>
              <ModalBody>
                <div className='flex w-full flex-col gap-4'>
                  <RadioGroup
                    label={
                      <p className=''>
                        Diselenggarakan secara<span className='text-danger'>*</span>
                      </p>
                    }
                    className=''
                    size='md'
                    color='primary'
                    orientation='horizontal'
                    defaultValue={
                      locationForm.organization_method && locationForm.organization_method
                    }
                    onChange={(e: any) => {
                      setEventType(e.target.value);
                      setLocationForm({
                        ...locationForm,
                        organization_method: e.target.value,
                      });
                    }}
                  >
                    <Radio
                      classNames={{
                        base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-grey rounded-md ml-0.5 mr-3 my-1',
                      }}
                      value='Offline'
                    >
                      Offline
                    </Radio>
                    <Radio
                      classNames={{
                        base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-grey rounded-md ml-0.5 mr-3 my-1',
                      }}
                      value='Online'
                    >
                      Online
                    </Radio>
                  </RadioGroup>
                  {eventType === 'Offline' && (
                    <>
                      <InputField
                        type='text'
                        label='Nama Tempat'
                        required
                        placeholder='Nama Tempat'
                        fullWidth
                        value={locationForm.location_name && locationForm.location_name}
                        onChange={(e) =>
                          setLocationForm({ ...locationForm, location_name: e.target.value })
                        }
                      />
                      <div className='grid grid-cols-2 gap-2'>
                        <InputField
                          type='text'
                          label='Alamat'
                          required
                          placeholder='Ketik Alamat'
                          value={locationForm.location_address && locationForm.location_address}
                          onChange={(e) =>
                            setLocationForm({ ...locationForm, location_address: e.target.value })
                          }
                          fullWidth
                        />
                        <InputField
                          type='text'
                          label='Kota'
                          required
                          placeholder='Ketik Kota'
                          value={locationForm.location_city && locationForm.location_city}
                          onChange={(e) =>
                            setLocationForm({ ...locationForm, location_city: e.target.value })
                          }
                          fullWidth
                        />
                      </div>
                      <InputField
                        type='text'
                        label='Link Lokasi Map'
                        required
                        placeholder='https://'
                        fullWidth
                        value={locationForm.location_map && locationForm.location_map}
                        onChange={(e) =>
                          setLocationForm({ ...locationForm, location_map: e.target.value })
                        }
                      />
                    </>
                  )}
                  {eventType === 'Online' && (
                    <>
                      <InputField
                        type='text'
                        label='URL Streaming'
                        required
                        placeholder='https://'
                        value={locationForm.location_map && locationForm.location_map}
                        fullWidth
                        onChange={(e) =>
                          setLocationForm({ ...locationForm, location_map: e.target.value })
                        }
                      />
                      <div className='bg-primary-light border border-primary-light-200 rounded-lg w-full py-3 pr-3 pl-6  text-sm text-grey'>
                        <ul className='leading-tight'>
                          <li className='mb-1'>
                            Masukkan URL Streaming dengan benar karena akan diterima oleh Pembeli
                            Tiket setelah transaksi selesai.
                          </li>
                          <li className='mb-1'>
                            Anda tidak bisa mengubah URL Streaming setelah event dibuat.
                          </li>
                          <li className='mb-1'>
                            Kesalahan memasukkan URL Streaming bukan tanggung jawab KOLEKTIX.
                          </li>
                          <li className='mb-1'>
                            Jika salah memasukkan URL, buat event baru untuk memperbaikinya.
                          </li>
                          <li className='mb-1'>Event Offline bisa diubah menjadi Event Online.</li>
                          <li className='mb-1'>
                            Event Online tidak bisa diubah menjadi Event Offline.
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <button
                  className='w-full text-white bg-primary-dark rounded-md py-2'
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
