import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Accordion,
  AccordionItem,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTicket,
  faChevronCircleDown,
  faTriangleExclamation,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import Images from '../Images';
import { Post } from '@/utils/REST';
import { EventProps } from '@/utils/globalInterface';
import { AsyncListData } from '@react-stately/data';
import { useRouter } from 'next/router';
import { ActionIcon, Button, Card, Fieldset, Flex, Stack, Text, TextInput, Accordion as AccordionM, Switch, NumberFormatter } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';

interface FormTicket {
  event_id: number;
  event_ticket_id: number;
  name: string;
  price: number;
  subtotal_price: number;
  qty_ticket: number;
}

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  paymentList: any;
  ticket: FormTicket[];
  eventData: EventProps | null;
  subtotal: number;
  reload: () => void;
  setParentStep: (parentStep: number) => void;
}

export default function ModalOfflineSales({
  isOpen,
  setIsOpen,
  paymentList,
  ticket,
  subtotal,
  eventData,
  reload,
  setParentStep,
}: ModalProps) {
  const [payment, setPayment] = useState<string>('');
  const [step, setStep] = useState(-1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [openForm, setOpenForm] = useState<boolean>(true);

  const classAcc = {
    base: '!p-0 !shadow-sm border-2 border-primary-light-200 rounded-md',
    heading: 'bg-primary-light px-4 rounded-t-xl',
    trigger: '',
    titleWrapper: '',
    title: 'text-sm ',
    subtitle: '',
    startContent: '',
    indicator: '',
    content: 'px-4',
  };

  useEffect(() => {
    console.log(payment);
  }, [payment]);

  useEffect(() => {
    setStep(0);
  }, [isOpen]);

  const onSubmit = () => {
    setLoading(true);
    eventData &&
      Post('transaction-offline', {
        event_id: eventData.id,
        payment_method: payment,
        admin_fee: eventData.admin_fee,
        tickets: ticket,
      })
        .then((res: any) => {
          console.log(res);
          if (payment === '3') {
            console.log(res);
            router.push(res.xendit_invoice.invoice_url);
          } else {
            reload();
            setStep(2);
            setLoading(false);
          }
        })
        .catch((err: any) => {
          console.log(err);
          setLoading(false);
        });
  };

  const splittedTicket = useMemo(() => {
    return ticket.reduce<FormTicket[]>((accumulator, currentTicket) => {
      return [...accumulator, ...Array(currentTicket.qty_ticket).fill(currentTicket)];
    }, []);
  }, [ticket]);  

  return (
    <div className='flex flex-col gap-2'>
      <Modal
        isOpen={isOpen}
        placement='auto'
        onOpenChange={setIsOpen}
        className='text-dark'
        scrollBehavior='inside'
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1 border-b px-4 border-b-primary-light-200'>
                Pembayaran
              </ModalHeader>
              <ModalBody className='bg-primary-light p-0'>
                {step === 0 ? (
                  <div className='flex flex-col w-full gap-2'>
                    <div className='bg-white flex justify-between w-full py-4 px-4 items-center'>
                      <div>
                        <h6 className='mb-1'>{eventData?.name}</h6>
                        <p>{`${eventData?.start_date} - ${eventData?.end_date}`}</p>
                      </div>
                      <Images
                        path={eventData?.image}
                        type='event'
                        alt='event'
                        className='w-24 h-14 bg-primary-base rounded-md'
                      />
                    </div>
                    <div className='bg-white'>
                      <div className='py-4 px-4'>
                        <h6>Tiket</h6>
                      </div>
                      {ticket.map((el: any, idx: number) => (
                        <div
                          key={el.event_ticket_id}
                          className='border-t border-t-primary-light-200 py-4 px-4 flex items-center gap-2'
                        >
                          <div className='flex items-center justify-center w-10 h-10 border border-primary-light-200 rounded-full'>
                            <FontAwesomeIcon icon={faTicket} className='text-primary-dark' />
                          </div>
                          <div>
                            <p className='font-semibold mb-0.5'>{el.name}</p>
                            <p className='text-grey text-xs'>
                              {el.qty_ticket} Tiket x Rp{el.subtotal_price.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='bg-white'>
                      <div className='py-4 px-4 border-b border-b-primary-light-200'>
                        <h6>Data Pemilik</h6>
                      </div>
                      <div className={`${openForm ? '' : 'hidden'}`}>
                        <Card mah={500} className={`!overflow-y-auto`} p={0}>
                          <AccordionM multiple>
                            {(splittedTicket ?? []).map((e, i) => (
                              <AccordionM.Item key={i} value={String(i)}>
                                <AccordionM.Control bg="#fafafa">
                                  <Flex gap={8} align="start">
                                    <FontAwesomeIcon icon={faTicket} className='text-primary-dark mt-[3px]' />
                                    <Stack gap={2}>
                                      <Text fw={600} size="sm">{i + 1}. Pemilik Tiket {e.name}</Text>
                                      <Text size='xs' c="gray">1x Tiket <NumberFormatter value={e.price} /></Text>
                                    </Stack>
                                  </Flex>
                                </AccordionM.Control>
                                <AccordionM.Panel py={10}>
                                  <Card p={0} key={i} radius={10}>
                                    <Stack>

                                      <Switch
                                        display={i == 0 ? 'none' : undefined}
                                        label="Gunakan Data Pertama"
                                      />

                                      <TextInput
                                        label="Nama"
                                        placeholder="Isi Nama"
                                      />

                                      <TextInput
                                        label="Email"
                                        placeholder="Isi Email"
                                      />

                                      <TextInput
                                        label="No. Telepon"
                                        placeholder="Isi No. Telepon"
                                      />

                                    </Stack>
                                  </Card>
                                </AccordionM.Panel>
                              </AccordionM.Item>
                            ))}
                          </AccordionM>
                        </Card>
                      </div>
                    </div>
                    <div className='bg-white'>
                      <div className='py-4 px-4 border-b border-b-primary-light-200'>
                        <h6>Metode Pembayaran</h6>
                      </div>
                      <div className={`py-4 ${openForm || step == 0 ? 'hidden' : ''}`}>
                        {payment}
                      </div>
                      <div className={`py-4 ${openForm ? 'hidden' : ''}`}>
                        <Accordion variant='splitted' itemClasses={classAcc}>
                          {paymentList &&
                            paymentList.map((el: any) => (
                              <AccordionItem
                                key={el.id}
                                aria-label='Anchor'
                                className=''
                                indicator={
                                  <Icon icon="uiw:down" className={`text-[16px]`} />
                                }
                                title={
                                  <Text fw={600}>{el.payment_name}</Text>
                                }
                              >
                                <RadioGroup
                                  color='primary'
                                  name='payment-method'
                                  onChange={(e) => setPayment(e.target.value)}
                                >
                                  <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                      <Images
                                        type='logo'
                                        path={el.logo}
                                        alt={el.payment_name}
                                        className='w-8 h-8 object-contain'
                                      />
                                      <p className='text-sm'>{el.payment_name}</p>
                                    </div>
                                    <Radio value={el.id}></Radio>
                                  </div>
                                </RadioGroup>
                              </AccordionItem>
                            ))}
                        </Accordion>
                      </div>
                    </div>
                    <div className='bg-white'>
                      <div className='py-4 px-4 border-b border-b-primary-light-200'>
                        <h6>Detail Pembayaran</h6>
                      </div>
                      <div className='border-b border-b-primary-light-200 px-4 py-1'>
                        {ticket.map((el: any) => (
                          <div
                            className='flex justify-between items-center my-2'
                            key={el.event_ticket_id}
                          >
                            <p className='text-dark-grey'>{`${el.name} (x${el.qty_ticket})`}</p>
                            <p className='text-dark-grey'>{`Rp${el.subtotal_price.toLocaleString(
                              'id-ID'
                            )}`}</p>
                          </div>
                        ))}
                      </div>
                      <div className='border-b border-b-primary-light-200 px-4 py-2'>
                        <div className='flex justify-between items-center mb-2'>
                          <p className='text-dark-grey'>{`Pajak`}</p>
                          <p className='text-dark-grey'>{`Rp${
                            eventData && eventData.ppn ? eventData.ppn.toLocaleString('id-ID') : 0
                          }`}</p>
                        </div>
                        <div className='flex justify-between items-center mb-2'>
                          <p className='text-dark-grey '>{`Biaya Admin`}</p>
                          <p className='text-dark-grey'>{`Rp${
                            eventData && eventData.admin_fee
                              ? eventData.admin_fee.toLocaleString('id-ID')
                              : 0
                          }`}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : step === 1 ? (
                  <div className='flex flex-col w-full gap-2'>
                    <div className='bg-white flex justify-between w-full py-4 px-4 items-center'>
                      <div>
                        <h6 className='mb-1'>{eventData?.name}</h6>
                        <p>{`${eventData?.start_date} - ${eventData?.end_date}`}</p>
                      </div>
                      <Images
                        path={eventData?.image}
                        type='event'
                        alt='event'
                        className='w-24 h-14 bg-primary-base rounded-md'
                      />
                    </div>
                    <div className='bg-white'>
                      <div className='py-4 px-4'>
                        <h6>Tiket</h6>
                      </div>
                      {ticket.map((el: any, idx: number) => (
                        <div
                          key={el.event_ticket_id}
                          className='border-t border-t-primary-light-200 py-4 px-4 flex items-center gap-2'
                        >
                          <div className='flex items-center justify-center w-10 h-10 border border-primary-light-200 rounded-full'>
                            <FontAwesomeIcon icon={faTicket} className='text-primary-dark' />
                          </div>
                          <div>
                            <p className='font-semibold mb-0.5'>{el.name}</p>
                            <p className='text-grey text-xs'>
                              {el.qty_ticket} Tiket x Rp{el.subtotal_price.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='bg-white'>
                      <div className='py-4 px-4 border-b border-b-primary-light-200'>
                        <h6>Metode Pembayaran</h6>
                      </div>
                    </div>
                    <div className='bg-white'>
                      <div className='py-4 px-4 border-b border-b-primary-light-200'>
                        <h6>Detail Pembayaran</h6>
                      </div>
                      <div className='border-b border-b-primary-light-200 px-4 py-1'>
                        {ticket.map((el: any) => (
                          <div
                            className='flex justify-between items-center my-2'
                            key={el.event_ticket_id}
                          >
                            <p className='text-dark-grey'>{`${el.name} (x${el.qty_ticket})`}</p>
                            <p className='text-dark-grey'>{`Rp${el.subtotal_price.toLocaleString(
                              'id-ID'
                            )}`}</p>
                          </div>
                        ))}
                      </div>
                      <div className='border-b border-b-primary-light-200 px-4 py-2'>
                        <div className='flex justify-between items-center mb-2'>
                          <p className='text-dark-grey'>{`Pajak`}</p>
                          <p className='text-dark-grey'>{`Rp${
                            eventData && eventData.ppn ? eventData.ppn.toLocaleString('id-ID') : 0
                          }`}</p>
                        </div>
                        <div className='flex justify-between items-center mb-2'>
                          <p className='text-dark-grey '>{`Biaya Admin`}</p>
                          <p className='text-dark-grey'>{`Rp${
                            eventData && eventData.admin_fee
                              ? eventData.admin_fee.toLocaleString('id-ID')
                              : 0
                          }`}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col py-5 px-3 justify-center text-dark text-center top-20 bg-white rounded-xl shadow-sm'>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      size='3x'
                      className='text-[#06c258] mb-2'
                    />
                    <h1 className='text-[20px] text-center'>Pembayaran Berhasil</h1>
                    <p className='text-center px-20 text-grey mt-1 mb-3'>
                      Segera untuk menyerahkan tiket pada pembeli
                    </p>
                    <div className='bg-white border border-primary-light-200 rounded-lg px-4'>
                      <div className='border-b border-b-primary-light-200 py-1'>
                        {ticket.map((el: any) => (
                          <div
                            className='flex justify-between items-center my-2'
                            key={el.event_ticket_id}
                          >
                            <p className='text-dark-grey'>{`${el.name} (x${el.qty_ticket})`}</p>
                            <p className='text-dark-grey'>{`Rp${el.subtotal_price.toLocaleString(
                              'id-ID'
                            )}`}</p>
                          </div>
                        ))}
                      </div>
                      <div className='border-b border-b-primary-light-200 py-2'>
                        <div className='flex justify-between items-center mb-2'>
                          <p className='text-dark-grey'>{`Pajak`}</p>
                          <p className='text-dark-grey'>{`Rp${
                            eventData && eventData.ppn ? eventData.ppn.toLocaleString('id-ID') : 0
                          }`}</p>
                        </div>
                        <div className='flex justify-between items-center  mb-2'>
                          <p className='text-dark-grey '>{`Biaya Admin`}</p>
                          <p className='text-dark-grey'>{`Rp${
                            eventData && eventData.admin_fee
                              ? eventData.admin_fee.toLocaleString('id-ID')
                              : 0
                          }`}</p>
                        </div>
                      </div>
                      <div className='flex justify-between py-2'>
                        <h6>Total Pembayaran</h6>
                        <h6>
                          Rp
                          {(eventData
                            ? subtotal + eventData?.ppn + eventData?.admin_fee
                            : subtotal
                          ).toLocaleString('id-ID')}
                        </h6>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className='px-4'>
                {step === 0 ? (
                  <div className='flex flex-col w-full'>
                    <div className='flex justify-between'>
                      <h6>Total Pembayaran</h6>
                      <h6>
                        Rp
                        {(eventData
                          ? subtotal + eventData?.ppn + eventData?.admin_fee
                          : subtotal
                        ).toLocaleString('id-ID')}
                      </h6>
                    </div>
                    <div className='flex items-center gap-3 px-4 py-2 rounded-md bg-[#fdf3e6] my-4'>
                      <FontAwesomeIcon
                        icon={faTriangleExclamation}
                        className='text-[#FF9B05]'
                        size='lg'
                      />
                      <p className='text-xs text-dark-grey'>
                        Pastikan untuk mengecek atau memfoto bukti <br /> pembayaran tiket sebelum
                        konfirmasi pembayaran.
                      </p>
                    </div>

                    <Flex gap={10} align="center">
                      <ActionIcon variant="transparent" display={openForm ? 'none' : undefined} onClick={() => setOpenForm(true)}>
                        <Icon icon="uiw:left" />
                      </ActionIcon>
                      <button
                        className='w-full text-white bg-primary-dark rounded-md py-2 cursor-pointer disabled:bg-primary-disabled disabled:text-white disabled:cursor-not-allowed'
                        onClick={() => openForm ? setOpenForm(false) : setStep(1)}
                      >
                        Lanjutkan
                      </button>
                    </Flex>
                  </div>
                ) : step === 1 ? (
                  <div className='flex flex-col w-full'>
                    <div className='flex justify-between'>
                      <h6>Total Pembayaran</h6>
                      <h6>
                        Rp
                        {(eventData
                          ? subtotal + eventData?.ppn + eventData?.admin_fee
                          : subtotal
                        ).toLocaleString('id-ID')}
                      </h6>
                    </div>
                    <div className='flex items-center gap-3 px-4 py-2 rounded-md bg-[#fdf3e6] my-4'>
                      <FontAwesomeIcon
                        icon={faTriangleExclamation}
                        className='text-[#FF9B05]'
                        size='lg'
                      />
                      <p className='text-xs text-dark-grey'>
                        Pastikan untuk mengecek atau memfoto bukti <br /> pembayaran tiket sebelum
                        konfirmasi pembayaran.
                      </p>
                    </div>

                    <Flex gap={10} align="center">
                      <ActionIcon variant="transparent" onClick={() => setStep(0)}>
                        <Icon icon="uiw:left" />
                      </ActionIcon>
                      <button
                        className='w-full text-white bg-primary-dark rounded-md py-2 cursor-pointer disabled:bg-primary-disabled disabled:text-white disabled:cursor-not-allowed'
                        onClick={onSubmit}
                        disabled={loading}
                      >
                        {payment === '3' ? 'Bayar Sekarang' : 'Konfirmasi Pembayaran'}
                      </button>
                    </Flex>
                  </div>
                ) : (
                  <button
                    className='w-full text-white bg-primary-dark rounded-md py-2 cursor-pointer disabled:bg-primary-disabled disabled:text-white disabled:cursor-not-allowed'
                    onClick={() => {
                      setIsOpen(false);
                      setParentStep(0);
                    }}
                  >
                    Selesai
                  </button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
