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
import { useState, useEffect, useMemo, PropsWithChildren } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { TicketProps, TicketPropsInputRequest } from '@/utils/globalInterface';
import fetch from '@/utils/fetch';
import { Box, Checkbox, Flex, Switch, Modal as ModalM, Stack, Button, Card, TextInput, UnstyledButton, Text, Popover, Overlay, Portal, HoverCard } from '@mantine/core';
import Seatmap from '@/components/Seatmap';
import { Icon } from '@iconify/react/dist/iconify.js';
import { isNotEmpty, useForm } from '@mantine/form';
import TicketContainer from '@/components/TicketContainer';
import { modals } from '@mantine/modals';
import { Guide } from '@/components/Guide';
import { notifications } from '@mantine/notifications';

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  ticket: EventTicket[];
  setTicket(form: EventTicket[]): void;
  endDate: string | null;
  data: EventTicket;
  idx?: number | null;
  setIdx: (idx?: number) => void;
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
  const defaultForm: EventTicket = {
    ticket_type: '',
    ticket_category_id: 1,
    ticket_category: 'Festival',
    name: '',
    ticket_date: null,
    ticket_end: null,
    qty: 0,
    price: 0,
    description: '',
  };
  const { values: form, setValues: setForm, validate, errors } = useForm<EventTicket>({
    initialValues: defaultForm,
    validate: {
      ticket_type: isNotEmpty(),
      ticket_category_id: isNotEmpty(),
      ticket_category: isNotEmpty(),
      name: isNotEmpty(),
      ticket_date: isNotEmpty(),
      ticket_end: isNotEmpty(),
      qty: isNotEmpty(),
      price: isNotEmpty(),
      starting_time: isNotEmpty(),
      ending_time: isNotEmpty(),
    }
  });
  const [step, setStep] = useState(0);
  const [openForm, setOpenForm] = useState<number | null>();
  const [selected, setSelected] = useState<number>();
  const [addSeatMap, setAddSeatMap] = useState(false);
  const [onSelectSeat, setOnSelectSeat] = useState<number>();
  const [hoveredTicket, setHoveredTicket] = useState<number>();

  useEffect(() => {
    if (typeof openForm == 'number') {
      setForm(ticket[openForm]);
    } else {
      setForm(defaultForm);
    }
  }, [openForm]);

  const submitTicket = async () => {
    if (eventId == undefined) {
      let arr = [...ticket];
      if (typeof idx === 'number') {
        arr[idx] = form;
      } else {
        arr.push(form);
      }
      setTicket(arr);
      setIsOpen(false);
      setIdx(undefined);
    } else {
      await fetch<TicketPropsInputRequest, any>({
        url: `event-ticket/${idx}`,
        method: 'PUT',
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
          setIdx(undefined);

          notifications.show({
            message: 'Berhasil Update Tiket',
            color: 'green'
          });
        },
        error: () => {},
      });
    }
  };

  useEffect(() => {
    setForm({ ...data });
  }, [data]);

  const openSeatMap = useMemo(() => {
    return addSeatMap;// && (ticket.some(e => e.ticket_category == 'Seated') || (form.ticket_category == 'Seated'));
  }, [ticket, form, addSeatMap]);

  const handleSaveTicket = () => {
    if (validate().hasErrors) return;

    if (typeof openForm === 'number') {
      setTicket(ticket.map((e, i) => i == openForm ? form : e));
    } else {
      setTicket([...ticket, form]);
    }
    setOpenForm(undefined);
  }

  const handleSelectSeat = (data?: string[]) => {
    setTicket(ticket.map((e, i) => i == onSelectSeat ? ({...e, available_seat: data}) : e));
  };

  const handleDeleteTicket = (index: number) => {
    modals.openConfirmModal({
      title: 'Hapus Tiket',
      children: 'Apakah kamu yakin ingin menghapus tiket ini?',
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      centered: true,
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setTicket(ticket.filter((e, i) => i != index));
        setOpenForm(undefined);
      }
    });
  }

  const unavailSeat = useMemo(() => {
    return onSelectSeat === undefined ? [] : ticket
      .map(e => e.available_seat)
      .reduce<string[]>((c, n) => ([...c, ...(n ?? [])]), [])
      .filter(e => !ticket[onSelectSeat ?? 0].available_seat?.includes(e));
  }, [onSelectSeat]);

  const allSeat = useMemo(() => {
    const result = ticket
      .map(e => e.available_seat)
      .reduce<string[]>((c, n) => ([...c, ...(n ?? [])]), []);

    if (hoveredTicket !== undefined) {
      return result.filter(e => ticket[hoveredTicket].available_seat?.includes(e))
    }

    return result;
  }, [ticket, onSelectSeat, hoveredTicket]);

  return (
    <div className='flex flex-col gap-2'>
      <ModalM
        title={(
          <HoverCard>
            <HoverCard.Target>
              <Text component='span'>Kelola Tiket</Text>
            </HoverCard.Target>
            <HoverCard.Dropdown maw={400}>
              {ticket.map((e, i) => (
                <Text size="xs" key={i}>
                  {JSON.stringify(e).replaceAll(',', ', ')}
                </Text>
              ))}
            </HoverCard.Dropdown>
          </HoverCard>
        )}
        opened={isOpen}
        centered
        onClose={() => {
          setIdx(undefined);
          setIsOpen(false);
        }}
        size={openSeatMap ? 'xl' : undefined}
        fullScreen={openSeatMap}
        className='text-dark'
      >
        {/* {JSON.stringify(errors)} */}
        <Stack gap={10} h={addSeatMap ? "calc(100vh - 100px)" : "calc(100vh - 160px)"} pb={10}>
          <Flex gap={20} h="100%">
            <Card p={10} display={openForm === undefined && ticket.length > 0 ? undefined : 'none'} className={`w-full h-full ${openSeatMap ? 'max-w-[370px]' : ''}`}>
              <Stack gap={15} h="100%">
                <TextInput
                  leftSection={<Icon icon="uiw:search" />}
                  placeholder="Cari Tiket"
                />

                <Stack gap={10} className={`overflow-y-auto h-full `}>
                  {ticket.map((e, i) => (
                    // onClick={() => setSelected(selected == i ? undefined : i)}
                    <UnstyledButton key={i}>
                      <Box
                        onMouseEnter={() => setHoveredTicket(i)}
                        onMouseLeave={() => setHoveredTicket(undefined)}
                        className={`${selected == i ? '!border !border-primary-base rounded-lg' : ''}`}>
                        <TicketContainer
                          key={i}
                          type={e.ticket_type}
                          category={e.ticket_category}
                          price={e.price}
                          ticketDate={e.ticket_date}
                          ticketEnd={e.ticket_end}
                          description={e.description}
                          name={e.name}
                          onEdit={() => {
                            setIdx(e?.id)
                            setOpenForm(i);
                          }}
                          onDelete={() => handleDeleteTicket(i)}
                          onSelectSeatButton={e.ticket_category == 'Seated' && onSelectSeat === undefined && addSeatMap ?
                            () => setOnSelectSeat(i) :
                            undefined}
                          seatColor={e.seat_color}
                          onSelectSeatColor={onSelectSeat == i ? e => setTicket(ticket?.map((z, _i) => i == _i ? ({...z, seat_color: e}) : z)) : undefined}
                        />
                      </Box>
                    </UnstyledButton>
                  ))}
                </Stack>

                <Button variant="light" size="md" onClick={() => setOpenForm(null)} rightSection={<Icon icon="uiw:plus" />} className={`shrink-0`}>
                  Tambah Tiket
                </Button>

                <Guide text="Buat Seatmap untuk mengatur posisi seat" key="guide-create-seatmap" order={0} opened={openForm === undefined && ticket.length > 0 && !addSeatMap}>
                  <Button w="100%" display={addSeatMap ? 'none' : undefined} variant="outline" size="md" onClick={() => setAddSeatMap(true)} className={`shrink-0`}>
                    Buat Seatmap
                  </Button>
                </Guide>
              </Stack>
            </Card>

            <div className={`${openForm !== undefined || ticket.length == 0 ? 'flex' : 'hidden'} h-full w-full ${openSeatMap ? 'max-w-[370px]' : ''} overflow-auto flex-col gap-2 pb-4`}>
              <Flex display={ticket.length > 0 ? undefined : 'none'}>
                <Button onClick={() => setOpenForm(undefined)} px={0} fw={400} leftSection={<Icon icon="uiw:left" />} variant="transparent" color="gray">
                  Kembali
                </Button>
              </Flex>

              {step === 0 && (
                <>
                  <RadioGroup
                    label={
                      <p className=''>
                        Kategori Tiket<span className='text-danger'> *</span>
                      </p>
                    }
                    className='gap-1 w-full'
                    size='md'
                    color='primary'
                    value={form.ticket_category}
                    onChange={(e) => setForm({ ticket_category: e.target.value == 'Seated' ? "Seated" : "Festival" })}
                  >
                    <div className='grid grid-cols-2'>
                      <Radio
                        classNames={{
                          base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1',
                        }}
                        value='Festival'
                      >
                        Festival
                      </Radio>
                      <Radio
                        classNames={{
                          base: 'opacity-50 md:!opacity-100 pointer-events-none md:!pointer-events-auto data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1',
                        }}
                        value='Seated'
                      >
                        Seat
                      </Radio>
                    </div>
                  </RadioGroup>

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
                          base: `data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1
                              ${errors['ticket_type'] ? '!border-red-400 !border-1' : ''}`,
                        }}
                        value='Berbayar'
                      >
                        Berbayar
                      </Radio>
                      <Radio
                        classNames={{
                          base: `data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1
                              ${errors['ticket_type'] ? '!border-red-400 !border-1' : ''}`,
                        }}
                        value='Gratis'
                      >
                        Gratis
                      </Radio>
                    </div>
                  </RadioGroup>

                  {/* <Switch 
                    label="Seated"
                    mt={10}
                    mb={15}
                    checked={openSeatMap}
                    onChange={e => setForm({ ...form, ticket_category: e.target.checked ? "Seated" : "Festival"  })}
                  /> */}

                  <InputField
                    error={Boolean(errors['name'])}
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
                      error={Boolean(errors['ticket_date'])}
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
                      error={Boolean(errors['ticket_end'])}
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
                      error={Boolean(errors['starting_time'])}
                      type='time'
                      label='Jam Mulai Penjualan'
                      required
                      value={form.starting_time && form.starting_time}
                      onChange={(e: any) =>
                        e && setForm({ ...form, starting_time: e.toString() })
                      }
                    />
                    <InputField
                      error={Boolean(errors['ending_time'])}
                      type='time'
                      label='Jam Berakhir Penjualan'
                      required
                      value={form.ending_time && form.ending_time}
                      onChange={(e: any) => e && setForm({ ...form, ending_time: e.toString() })}
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-2 my-2'>
                    <InputField
                      className={`${form.ticket_type == 'Gratis' ? 'hidden' : ''}`}
                      error={Boolean(errors['price'])}
                      type='num'
                      label='Harga Tiket'
                      required
                      disabled={form.ticket_type === 'Gratis'}
                      fullWidth
                      value={form.price > 0 && form.price}
                      onChange={(e: any) => setForm({ ...form, price: e.target.value })}
                      placeholder='Masukan Harga'
                    />
                    <InputField
                      className={`${form.ticket_category == 'Seated' ? 'hidden' : ''}`}
                      error={Boolean(errors['qty'])}
                      type='num'
                      label='Jumlah Tiket'
                      required
                      fullWidth
                      value={form.qty > 0 && form.qty}
                      onChange={(e: any) => setForm({ ...form, qty: e.target.value })}
                      placeholder='Masukan Jumlah'
                    />
                  </div>
                  <InputField
                    error={Boolean(errors['description'])}
                    type='textarea'
                    label='Deskripsi'
                    placeholder='Deskripsi Tiket'
                    fullWidth
                    value={form.description}
                    onChange={(e: any) => setForm({ ...form, description: e.target.value })}
                  />
                </>
              )}
              {/* {step === 1 && (
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
              )} */}

              <Flex justify="end" py={10} className={`sticky bottom-[-15px] bg-white`}>
                <button
                  className='w-[200px] ml-auto text-white bg-primary-dark rounded-full py-2'
                  onClick={() => {
                    handleSaveTicket();
                    !!eventId && submitTicket();
                    // step === 0 ? submitTicket() : setStep(1);
                  }}
                >
                  {openForm === null ? 'Tambah Tiket' : 'Simpan Tiket'}
                </button>
              </Flex>
            </div>

            <Box
              className={`flex-grow`}
              display={openSeatMap ? undefined : 'none'}>
              <Seatmap
                unavailSeat={unavailSeat}
                selected={onSelectSeat !== undefined ? ticket[onSelectSeat].available_seat : allSeat}
                onSelect={handleSelectSeat}
                onSelectAll={handleSelectSeat}
                onEdit={onSelectSeat !== undefined}
                onFinishSelectSeat={onSelectSeat !== undefined ? () => setOnSelectSeat(undefined) : undefined}
              />
            </Box>
          </Flex>

          <Button
            ml="auto"
            w="fit-content"
            size="md"
            onClick={() => {
              setIdx(undefined);
              setIsOpen(false);
            }}
            // rightSection={<Icon icon="uiw:check" />}
            display={ticket.length > 0 && addSeatMap ? undefined : 'none'}>
            Simpan Tiket
          </Button>
        </Stack>
      </ModalM>
    </div>
  );
}