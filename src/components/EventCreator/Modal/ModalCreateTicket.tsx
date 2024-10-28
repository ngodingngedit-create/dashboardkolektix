import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
} from '@nextui-org/react';
import { EventTicket } from '@/utils/formInterface';
import InputField from '@/components/Input';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  ticket: EventTicket[];
  setTicket(form: EventTicket[]): void;
  endDate: string | null;
  data: EventTicket;
  idx?: number | null;
  setIdx: (idx: number | null) => void;
}

export default function ModalCreateTicket({
  isOpen,
  setIsOpen,
  ticket,
  setTicket,
  endDate,
  data,
  idx,
  setIdx,
}: ModalProps) {
  const defaultForm = {
    ticket_type: data.ticket_type,
    ticket_category_id: data.ticket_category_id,
    ticket_category: data.ticket_category,
    name: data.name,
    ticket_date: data.ticket_date,
    ticket_end: data.ticket_end,
    qty: data.qty,
    price: data.price,
    description: data.description,
  };
  const [form, setForm] = useState<EventTicket>(defaultForm);
  const [step, setStep] = useState(0);
  const submitTicket = () => {
    let arr = [...ticket];
    if (typeof idx === 'number') {
      arr[idx] = form;
    } else {
      arr.push(form);
    }
    setTicket(arr);
    setIsOpen(false);
    setIdx(null);
  };

  useEffect(() => {
    setForm({ ...data });
  }, [data]);

  return (
    <div className='flex flex-col gap-2'>
      <Modal
        isOpen={isOpen}
        placement='auto'
        onClose={() => {
          setIdx(null);
        }}
        onOpenChange={setIsOpen}
        className='text-dark'
        scrollBehavior='inside'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center'>
                  {step !== 0 && (
                    <button onClick={() => setStep(0)}>
                      <FontAwesomeIcon icon={faArrowLeft} className='mr-5' />
                    </button>
                  )}
                  {step === 0 ? 'Tambah Tiket' : 'Tanggal Penjualan'}
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='flex w-full flex-col gap-1'>
                  {step === 0 && (
                    <>
                      <RadioGroup
                        label={
                          <p className=''>
                            Jenis Tiket<span className='text-danger'> *</span>
                          </p>
                        }
                        className='gap-1'
                        size='md'
                        color='primary'
                        value={form.ticket_type}
                        onChange={(e: any) => setForm({ ...form, ticket_type: e.target.value })}
                      >
                        <div className='grid grid-cols-2'>
                          <Radio
                            classNames={{
                              base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1',
                            }}
                            value='Berbayar'
                          >
                            Berbayar
                          </Radio>
                          <Radio
                            classNames={{
                              base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1',
                            }}
                            value='Gratis'
                          >
                            Gratis
                          </Radio>
                        </div>
                      </RadioGroup>
                      <Tabs
                        selectedKey={form.ticket_category}
                        onSelectionChange={e => setForm({ ...form, ticket_category: e as string })}
                        variant='solid'
                        aria-label='Tabs variants'
                        className='border border-b-2 border-primary-light-200 border-x-0 border-t-0 mt-2'
                        fullWidth
                        classNames={{
                          tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
                          tab: 'p-5',
                          cursor: 'rounded-b-none border-b-2 border-b-primary-base',
                        }}
                      >
                        <Tab key="Festival" title="Festival">
                          <InputField
                            type='text'
                            label='Nama Tiket'
                            placeholder='Nama Tiket'
                            required
                            fullWidth
                            value={form.name}
                            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
                          />
                          <div className='grid grid-cols-2 gap-2 my-2'>
                            <InputField
                              type='date'
                              label='Tanggal Mulai Penjualan'
                              required
                              maxDateVal={endDate ? endDate : undefined}
                              value={form.ticket_date && form.ticket_date}
                              onChange={(e: any) =>
                                e && setForm({ ...form, ticket_date: e.toString() })
                              }
                            />
                            <InputField
                              type='date'
                              label='Tanggal Berakhir Penjualan'
                              required
                              value={form.ticket_end && form.ticket_end}
                              minDateVal={form.ticket_date ? form.ticket_date : undefined}
                              maxDateVal={endDate ? endDate : undefined}
                              onChange={(e: any) => e && setForm({ ...form, ticket_end: e.toString() })}
                            />
                          </div>
                          <div className='grid grid-cols-2 gap-2 my-2'>
                            <InputField
                              type='num'
                              label='Harga Tiket'
                              required
                              disabled={form.ticket_type === 'Gratis'}
                              fullWidth
                              value={form.price > 0 && form.price}
                              onChange={(e: any) => setForm({ ...form, price: e.target.value })}
                            />
                            <InputField
                              type='num'
                              label='Jumlah Tiket'
                              required
                              fullWidth
                              value={form.qty > 0 && form.qty}
                              onChange={(e: any) => setForm({ ...form, qty: e.target.value })}
                            />
                          </div>
                          <InputField
                            type='textarea'
                            label='Deskripsi'
                            placeholder='Deskripsi Tiket'
                            required
                            fullWidth
                            value={form.description}
                            onChange={(e: any) => setForm({ ...form, description: e.target.value })}
                          />
                        </Tab>
                        <Tab key="Seated" title="Seated">

                        </Tab>
                      </Tabs>
                    </>
                  )}
                  {step === 1 && (
                    <div className='flex flex-col gap-3'>
                      <div className='grid grid-cols-2 gap-5'>
                        <InputField type='date' label='Tanggal Mulai' required />
                        <InputField type='time' label='Jam Mulai' required />
                      </div>
                      <div className='grid grid-cols-2 gap-5'>
                        <InputField type='date' label='Tanggal Berakhir' required />
                        <InputField type='time' label='Jam Berakhir' required />
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <button
                  className='w-full text-white bg-primary-dark rounded-md py-2'
                  onClick={() => {
                    step === 0 ? submitTicket() : setStep(0);
                  }}
                >
                  {step === 0 ? 'Lanjut' : 'Simpan'}
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
