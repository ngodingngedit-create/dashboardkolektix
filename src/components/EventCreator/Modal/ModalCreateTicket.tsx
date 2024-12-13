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
import { TicketProps, TicketPropsInputRequest } from '@/utils/globalInterface';
import fetch from '@/utils/fetch';
import { Box, Checkbox, Flex, Switch, Modal as ModalM, Stack } from '@mantine/core';
import Seatmap from '@/components/Seatmap';

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  ticket: EventTicket[];
  setTicket(form: EventTicket[]): void;
  endDate: string | null;
  data: EventTicket;
  idx?: number | null;
  setIdx: (idx: number | null) => void;
  eventId?: number;
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
  eventId,
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
  const submitTicket = async () => {
    await fetch<TicketPropsInputRequest, any>({
      url: `event-ticket/${idx}`,
      method: 'OUT',
      data: {
        ...form,
        event_id: String(eventId)
      } as TicketPropsInputRequest,
      success: () => {
        let arr = [...ticket];
        if (typeof idx === 'number') {
          arr[idx] = form;
        } else {
          arr.push(form);
        }
        setTicket(arr);
        setIsOpen(false);
        setIdx(null);
      },
      error: () => {},
    });
  };

  useEffect(() => {
    setForm({ ...data });
  }, [data]);

  return (
    <div className='flex flex-col gap-2'>
      <ModalM
        title={step === 0 ? 'Tambah Tiket' : 'Tanggal Penjualan'}
        opened={isOpen}
        centered
        onClose={() => {
          setIdx(null);
          setIsOpen(false);
        }}
        size={form.ticket_category == 'Seated' ? 'xl' : undefined}
        fullScreen={form.ticket_category == 'Seated'}
        className='text-dark'
      >
        <Stack gap={10} h={form.ticket_category == 'Seated' ? "calc(100vh - 100px)" : undefined}>
          <Flex gap={20} h="100%">
            <div className={`flex w-full ${form.ticket_category == 'Seated' ? 'max-w-[370px]' : ''} flex-col gap-1`}>
              {step === 0 && (
                <>
                  <RadioGroup
                    label={
                      <p className=''>
                        Jenis Tiket<span className='text-danger'> *</span>
                      </p>
                    }
                    className='gap-1 w-full'
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

                  <Switch 
                    label="Seated"
                    mt={10}
                    mb={15}
                    checked={form.ticket_category == 'Seated'}
                    onChange={e => setForm({ ...form, ticket_category: e.target.checked ? "Seated" : "Festival"  })}
                  />

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
            <Box
              className={`flex-grow`}
              display={form.ticket_category == 'Seated' ? undefined : 'none'}>
              <Seatmap />
            </Box>
          </Flex>
          <Flex justify="end">
            <button
              className='w-[200px] ml-auto mt-[15px] text-white bg-primary-dark rounded-full py-2'
              onClick={() => {
                step === 0 ? submitTicket() : setStep(0);
              }}
            >
              {step === 0 ? 'Tambah Tiket' : 'Simpan'}
            </button>
          </Flex>
        </Stack>
      </ModalM>
    </div>
  );
}
