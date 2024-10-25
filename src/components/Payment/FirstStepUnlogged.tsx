import { useEffect, useState } from 'react';
import useWindowSize from '@/utils/useWindowSize';
import { useRouter } from 'next/router';
import { EventProps, TransactionProps } from '@/utils/globalInterface';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Field, Label, Input } from '@headlessui/react';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import {
  faChevronCircleDown,
  faChevronDown,
  faTicket,
  faChevronCircleLeft,
  faChevronUp,
  faChevronCircleUp,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import ModalTransaction from '../ModalTransaction';
import InputField from '../Input';
import { formatDate } from '@/utils/useFormattedDate';
import ModalPaymentDataConfirmation from '../Modals/ModalPaymentDataConfirm';
import InputSelect from '../Input/Select';
import { Post, Get } from '@/utils/REST';
import { Accordion, AccordionItem, Radio, RadioGroup, Switch, Spinner } from '@nextui-org/react';
import Images from '../Images';
import { toast } from 'react-toastify';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import React from 'react';

interface FormTicket {
  event_id: number;
  event_ticket_id: number;
  name: string;
  price: number;
  subtotal_price: number;
  qty_ticket: number;
  payment_status: string;
}

interface ErrorForm {
  nik: boolean;
  nama: boolean;
  email: boolean;
  countryCode: boolean;
  phone: boolean;
}

interface Form {
  nik: string;
  full_name: string;
  email: string;
  countryCode: string;
  no_telp: string;
  is_pemesan: number;
  identity_type_id: number;
  event_ticket_id: number;
}

interface StepPaymentProps {
  detail: EventProps;
  ticket: FormTicket[];
  forms: Form[];
  totalCount: number;
  totalSubtotalPrice: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setFormValid: (valid: boolean) => void;
  step: number;
  setStep: (step: number) => void;
}

const FirstStepUnlogged = ({
  detail,
  ticket,
  totalCount,
  totalSubtotalPrice,
  forms,
  isOpen,
  setIsOpen,
  setFormValid,
  step,
  setStep,
}: StepPaymentProps) => {
  const { width } = useWindowSize();
  const [form, setForm] = useState<Form[]>(forms);
  const [error, setError] = useState<ErrorForm>({
    nik: false,
    nama: false,
    email: false,
    countryCode: true,
    phone: false,
  });
  const [showModalTransaction, setShowModalTransaction] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [collapse, setCollapse] = useState<boolean[]>(form.map((_, index) => index === 0));
  const [payment, setPayment] = useState<string>('');
  const [xenditInvoice, setXenditInvoice] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<TransactionProps | null>(null);
  const [bank, setBank] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<any>(null);

  const getPaymentMethodById = (id: string) => {
    setLoading(true);
    Get(`payment-method/${id}`, {})
      .then((res: any) => {
        // console.log(res);
        setPaymentMethod(res.data);
        setLoading(false);
        setIsOpen(false);
        setStep(3);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleShowModal = () => {
    setShowModalTransaction(!showModalTransaction);
  };

  const renderer: CountdownRendererFn = ({ hours, minutes, seconds }) => {
    return (
      <div className='flex flex-col items-center justify-center  font-semibold'>
        <h3 className='text-[15px] my-5'>Waktu untuk Pembayaran Tersisa</h3>
        <div className='bg-primary-light border-2 border-primary-light-200 text-[40px] px-6 py-2 rounded-xl'>
          <div className='flex'>
            <div className='pr-4'>
              {String(hours).padStart(2, '0')}
              <p className='text-sm font-medium text-center text-grey'>Jam</p>
            </div>
            <div className='border-2 border-x-primary-light-200 border-y-primary-light px-4'>
              {String(minutes).padStart(2, '0')}
              <p className='text-sm font-medium text-center text-grey'>Menit</p>
            </div>
            <div className='pl-4'>
              {String(seconds).padStart(2, '0')}
              <p className='text-sm font-medium text-center text-grey'>Detik</p>
            </div>
          </div>
        </div>
        <p className='text-sm text-center font-light my-5 px-4'>
          Batas pembayaran sampai dengan <span className='font-semibold'>{formattedDate}</span>{' '}
          Harap selesaikan pembayaran sebelum waktu tersebut untuk menghindari pembatalan otomatis.
        </p>
      </div>
    );
  };

  const classAcc = {
    base: '!p-0',
    heading: 'bg-primary-light px-4',
    trigger: '',
    titleWrapper: '',
    title: 'text-sm ',
    subtitle: '',
    startContent: '',
    indicator: '',
    content: 'px-4',
  };

  const now = new Date();
  const targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  function padToTwoDigits(num: number) {
    return num.toString().padStart(2, '0');
  }
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  const dayName = days[targetDate.getDay()];
  const day = padToTwoDigits(targetDate.getDate());
  const month = months[targetDate.getMonth()];
  const year = targetDate.getFullYear();
  const hours = padToTwoDigits(targetDate.getHours());
  const minutes = padToTwoDigits(targetDate.getMinutes());
  const formattedDate = `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}`;
  

  const handleInput = (index: number, field: keyof Form, value: string) => {
    let newForm = [...form];
    newForm[index] = { ...newForm[index], [field]: value };
    setForm(newForm);

    const ticketPriceTotal = ticket.reduce((e, n) => e + (n.price * n.qty_ticket), 0);
    const isFormValid =
      newForm.every(
        (item) =>
          item.nik !== '' && item.full_name !== '' && item.email !== '' && item.no_telp !== ''
      ) && (ticketPriceTotal > 0 ? payment !== '' : true);

    setFormValid(isFormValid);
  };

  const handlePaymentChange = (value: string, type: 'payment' | 'bank') => {
    if (type === 'payment') {
      setPayment(value);
    } else {
      setBank(value);
    }

    const isFormValid =
      form.every(
        (item) =>
          item.nik !== '' && item.full_name !== '' && item.email !== '' && item.no_telp !== ''
      ) && value !== null;

    setFormValid(isFormValid);
  };

  useEffect(() => {
    if (detail && detail.has_event_payment_method.length === 1) {
      const ticketPriceTotal = ticket.reduce((e, n) => e + (n.price * n.qty_ticket), 0);
      const paymentMethod = detail.has_event_payment_method[0].has_payment_method;
      if (paymentMethod.payment_name === 'Xendit') {
        setPayment(paymentMethod.id.toString());
        setFormValid(
          form.every(
            (item) =>
              item.nik !== '' && item.full_name !== '' && item.email !== '' && item.no_telp !== ''
          ) && (ticketPriceTotal > 0 ? paymentMethod.id.toString() !== '' : true)
        );
      }
    }
  }, [detail, form]);

  

  const copyOrderer = (targetIndex: number) => {
    if (form.length > 0 && targetIndex > 0 && targetIndex < form.length) {
      let newForm = [...form];
      newForm[targetIndex] = { ...newForm[0] };
      setForm(newForm);
    }
  };

  const clearForm = (targetIndex: number) => {
    if (form.length > 0 && targetIndex >= 0 && targetIndex < form.length) {
      let newForm = [...form];
      newForm[targetIndex] = {
        nik: '',
        full_name: '',
        email: '',
        countryCode: '',
        no_telp: '',
        is_pemesan: 0,
        identity_type_id: 1,
        event_ticket_id: 1
      };
      setForm(newForm);
    }
  };

  const router = useRouter();

  const submitForm = () => {
    setLoading(true);
    const now = new Date();
    now.setTime(now.getTime() + 24 * 60 * 60 * 1000);
    const isoString = now.toISOString();
    const payload = {
      event_id: detail?.id,
      admin_fee: detail?.admin_fee,
      payment_method: payment ? payment : '4',
      grandtotal: detail 
        ? totalSubtotalPrice + (detail.admin_fee * totalCount) + (detail.ppn || 0) 
        : 0,
      identities: form,
      tickets: ticket,
      bank_code: bank,
      expiration_date: isoString,
    };

    const ticketPriceTotal = ticket.reduce((e, n) => e + (n.price * n.qty_ticket), 0);
    if (ticketPriceTotal == 0) {
      router.push('/success');
      return;
    }

    Post('transaction-without-auth', payload)
    .then((res: any) => {
      setTransactionData(res.data);
      console.log('Response:', res);
  
      if (res.xendit_invoice && res.xendit_invoice.invoice_url) {
        router.push(res.xendit_invoice.invoice_url);
      } else if (res.xendit_invoice && res.xendit_invoice.va_number?.length > 0) {
        setXenditInvoice(res.xendit_invoice.va_number[0]);
        setLoading(false);
        setIsOpen(false);
        setStep(3);
      }
  
      if (res.data.payment_method === '2' && !res.xendit_invoice_url) {
        getPaymentMethodById('2');
      }
    })
    .catch((err: any) => {
      console.log(err);
      setLoading(false);
  
      // Check for 400 error and out_of_stock condition
      if (err.error === 400 || err.out_of_stock) {
        toast.error('Tiket sudah habis terjual');
        router.push('/event'); // Redirect to /event page
      } else {
        toast.error('Tiket sudah habis terjual');
      }
    });
  
  };
  

  const toggleCollapse = (index: number) => {
    setCollapse((prev) => {
      let newCollapse = [...prev];
      newCollapse[index] = !newCollapse[index];
      return newCollapse;
    });
  };

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xenditInvoice.bank_account_number);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setIsCopied(false);
    }
  };

  return step === 0 ? (
    <>
      {width &&
        (width < 768 ? (
          <div className='bg-primary-light mt-32 lg:mt-0'>
            <div className='border-b p-3 border-primary-light flex items-center gap-3'>
              <div className='px-2 py-1 border rounded-md border-primary-light'>
                {detail && detail.image_url && (
                  <Image
                    src={detail?.image_url}
                    width={1000}
                    height={1000}
                    alt='banner'
                    className='w-10 h-10 object-cover rounded-md'
                  />
                )}
              </div>
              <div>
                <p className='text-sm mb-1'>{detail?.name}</p>
                <p className='text-xs text-grey'>{totalCount} Tiket</p>
              </div>
            </div>
            <div className='border border-primary-light-200 rounded-lg bg-white shadow-sm'>
                  <div className='border-b border-b-primary-light-200 p-3'>
                    <p className='font-semibold'>Ringkasan Pesanan</p>
                  </div>
                  {ticket.map((item: FormTicket) => (
                    <div
                      className='border-b p-3 border-primary-light-200 flex gap-3'
                      key={item.event_ticket_id}
                    >
                      <div className='px-3 flex items-center border rounded-md border-primary-light'>
                        <FontAwesomeIcon icon={faTicket} className='text-primary' />
                      </div>
                      <div>
                        <p className='text-sm mb-1 font-semibold'>{item.name}</p>
                        <p className=' text-grey text-xs'>
                          {item.qty_ticket} Tiket x {item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className='py-3 px-4 flex justify-between items-center'>
                    <p>{`Jumlah (${totalCount} Tiket)`}</p>
                    <p className='font-semibold'>Rp{totalSubtotalPrice.toLocaleString('id-ID')}</p>
                  </div>
                  <div className='py-3 px-4 flex justify-between items-center'>
                    <p>Biaya Admin</p>
                    <p className='font-semibold'>Rp{(detail.admin_fee * totalCount).toLocaleString('id-ID')}</p>
                  </div>
                  {detail.ppn ? (
                    <div className='py-3 px-4 flex justify-between items-center'>
                      <p>Tax</p>
                      <p className='font-semibold'>Rp{detail.ppn.toLocaleString('id-ID')}</p>
                    </div>
                  ) : null}
                  <div className='py-3 px-4 flex justify-between items-center'>
                    <p>Total Pembayaran</p>
                    <p className='font-semibold'>
                       Rp{(totalSubtotalPrice + (detail.admin_fee + (detail.ppn || 0))).toLocaleString('id-ID')}
                    </p>
                  </div>
            </div>
            {form.map((item, index) => {
                let ticketForOwner = null;
                let currentIndex = 0;

                // Loop untuk mencari tiket yang sesuai dengan index pemilik tiket
                for (const ticketItem of ticket) {
                  for (let i = 0; i < ticketItem.qty_ticket; i++) {
                    if (currentIndex === index - 1) {
                      // Pemilik ditemukan, simpan tiket untuk pemilik ini
                      ticketForOwner = ticketItem;
                      break;
                    }
                    currentIndex++;
                  }
                  if (ticketForOwner) break;
                }

                return (
                  <div className='bg-white mt-1' key={index}>
                    <div
                      className='border-b py-3 px-5 border-primary-light flex justify-between cursor-pointer'
                      onClick={() => toggleCollapse(index)}
                    >
                      <p className='font-semibold'>
                        {index > 0 ? `Pemilik Tiket ${index}` : 'Data Pemesan'}
                      </p>
                      <button className='text-grey'>
                        <FontAwesomeIcon
                          icon={faChevronUp}
                          className={`${
                            collapse[index] ? 'rotate-0' : 'rotate-180'
                          } transition-transform`}
                        />
                      </button>
                    </div>
                    {ticketForOwner && (
                      <div className='border-b p-3 border-primary-light flex justify-between gap-3'>
                        <div className='flex'>
                          <div>
                            <p className='text-sm mb-1 font-semibold'>{ticketForOwner.name}</p>
                            <p className='text-xs text-grey'>  1 Tiket x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ticketForOwner.price)}</p>
                          </div>
                        </div>
                        <div>
                          {index > 0 && (
                              <div className='px-3 py-2 rounded-lg shadow-sm text-grey'>
                                <p className='text-sm'>Gunakan Data Pemesan</p>
                                <Switch
                                  size='sm'
                                  onChange={(e: any) =>
                                    e.target.checked ? copyOrderer(index) : clearForm(index)
                                  }
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                    <div
                      className={`border-b p-3 border-primary-light ${
                        collapse[index] ? 'max-h-[26rem]' : 'max-h-0'
                      } transition-max-height delay-100 duration-150 ease-in-out`}
                    >
                      <div
                        className={`${
                          collapse[index] ? 'opacity-100' : 'opacity-0'
                        } transition-transform-opacity duration-300 delay-300 ease-in-out`}
                      >
                        <div
                          className={`${
                            collapse[index] ? 'visible delay-300 duration-300' : 'invisible'
                          } transition-transform `}
                        >
                          <div className='grid grid-cols-4 gap-3'>
                            <div>
                              <InputSelect
                                label='Identitas'
                                required
                                onChange={(e) => handleInput(index, 'identity_type_id', e.target.value)}
                                options={[
                                  { key: '1', label: 'KTP' },
                                  { key: '2', label: 'SIM' },
                                  { key: '3', label: 'Kartu Pelajar' },
                                  { key: '4', label: 'Passport' },
                                  { key: '5', label: 'KTM' },
                                ]}
                              />
                            </div>
                            <div className='col-span-3'>
                              <InputField
                                fullWidth
                                type='number'
                                label='Nomor Identitas'
                                placeholder='Contoh: 123456789012345'
                                value={item.nik}
                                onChange={(e) => handleInput(index, 'nik', e.target.value)}
                                inputProps={{ maxLength: 16 }} 
                              />
                              {error.nik && (
                                <p className='text-[10px] mt-1 text-danger'>
                                  Minimal NIK adalah 16 Digit
                                </p>
                              )}
                            </div>
                          </div>
                          <Field className='mb-2'>
                            <Label className='text-sm font-base text-grey'>Nama Lengkap</Label>
                            <Input
                              className='mt-2 block w-full rounded-lg border border-primary-light-200 bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200'
                              placeholder='Nama Lengkap'
                              value={item.full_name}
                              onChange={(e) => handleInput(index, 'full_name', e.target.value)}
                            />
                          </Field>
                          <Field className='mb-2'>
                            <Label className='text-sm font-base text-grey'>Email</Label>
                            <Input
                              type='email'
                              className='mt-2 block w-full rounded-lg border border-primary-light-200 bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200'
                              placeholder='Contoh: example@example.com'
                              value={item.email}
                              onChange={(e) => handleInput(index, 'email', e.target.value)}
                            />
                          </Field>
                          <Field className='mb-2'>
                            <Label className='text-sm font-base text-grey'>No Telepon</Label>
                            <div className='flex gap-2 items-center'>
                              <form className='max-w-sm block mt-2'>
                                <select
                                  id='countries'
                                  className='bg-gray-50 border border-primary-light-200 text-dark text-sm rounded-lg focus:ring-primary-base focus:border-primary-light-200 block w-full py-1.5'
                                  defaultValue='+62'
                                  value={item.countryCode}
                                  onChange={(e) => handleInput(index, 'countryCode', e.target.value)}
                                >
                                  <option value='+62'>+62</option>
                                  <option value='+1'>+1</option>
                                  <option value='+2'>+2</option>
                                  <option value='+3'>+3</option>
                                  <option value='+4'>+4</option>
                                </select>
                              </form>
                              <Input
                                className='mt-2 w-4/5 block rounded-lg border border-primary-light-200 bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200'
                                placeholder='Contoh: 81233334444'
                                value={item.no_telp}
                                onChange={(e) => handleInput(index, 'no_telp', e.target.value)}
                              />
                            </div>
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

             {detail && detail.has_event_payment_method.length > 1 ? (
            <div className='bg-white mt-1'>
              <div className='border-b-2 py-3 px-5 border-primary-light'>
                <p className='font-semibold'>Metode Pembayaran</p>
              </div>
              <div className='border-b-2 p-3 border-primary-light text-xs'>
             
                      <Accordion variant='splitted' itemClasses={classAcc}>
                        {detail.has_event_payment_method.map((el: any) => (
                          <AccordionItem
                            key={el.has_payment_method_id}
                            aria-label='Anchor'
                            className=''
                            indicator={
                              <FontAwesomeIcon
                                icon={faChevronCircleLeft}
                                className='px-2 text-lg'
                              />
                            }
                            title={el.has_payment_method.payment_name}
                          >
                            {el.has_payment_method.id === 3 &&
                            el.has_payment_method.has_payment_link &&
                            el.has_payment_method.has_payment_link.length > 0 ? (
                              <RadioGroup
                                color='primary'
                                name='bank-code'
                                onChange={(e) => {
                                  setPayment('3');
                                  handlePaymentChange(e.target.value, 'bank');
                                  console.log(e.target.value);
                                }}
                              >
                                {el.has_payment_method.has_payment_link[0].has_payment_channel.map(
                                  (item: any) => (
                                    <div
                                      key={item.id}
                                      className='flex items-center justify-between py-2'
                                    >
                                      <div className='flex items-center gap-3'>
                                        <Images
                                          type='logo'
                                          path={el.has_payment_method.logo}
                                          alt={el.has_payment_method.payment_name}
                                          className='w-8 h-8 object-contain'
                                        />
                                        <p className='text-sm'>{item.payment_channel}</p>
                                      </div>
                                      <Radio value={item.payment_channel} />
                                    </div>
                                  )
                                )}
                              </RadioGroup>
                            ) : (
                              <RadioGroup
                                color='primary'
                                name='payment-method'
                                onChange={(e) => handlePaymentChange(e.target.value, 'payment')}
                              >
                                <div className='flex items-center justify-between py-2'>
                                  <div className='flex items-center gap-3'>
                                    <Images
                                      type='logo'
                                      path={el.has_payment_method.logo}
                                      alt={el.has_payment_method.payment_name}
                                      className='w-8 h-8 object-contain'
                                    />
                                    <p className='text-sm'>
                                      {el.has_payment_method.payment_name}
                                    </p>
                                  </div>
                                  <Radio value={el.has_payment_method.id.toString()}></Radio>
                                </div>
                              </RadioGroup>
                            )}
                          </AccordionItem>
                        ))}
                      </Accordion>
                 
              </div>
            </div>
               ) : null}
            {/* <div className='flex justify-center'>
              <button
                className='w-[95%] bg-primary-dark text-white py-2 rounded-lg my-3 disabled:bg-primary-light-200 disabled:text-grey disabled:cursor-not-allowed'
                onClick={submitForm}
                // disabled={!isFormValid}
              >
                Lanjut
              </button>
            </div> */}
          </div>
        ) : (
          <div className='bg-primary-light min-h-screen pb-28'>
            <div className='max-w-5xl mx-auto grid grid-cols-5 mt-8 gap-x-7 pt-20 '>
              <h2 className='col-span-5 mb-4'>Personal Informasi</h2>
              <div className='col-span-3 flex flex-col gap-3'>
              {form.map((item, index) => {
                // Tentukan tiket untuk pemilik berdasarkan index
                let ticketForOwner = null;
                let currentIndex = 0;

                // Loop untuk mencari tiket yang sesuai dengan index pemilik tiket
                for (const ticketItem of ticket) {
                  for (let i = 0; i < ticketItem.qty_ticket; i++) {
                    if (currentIndex === index - 1) {
                      // Pemilik ditemukan, simpan tiket untuk pemilik ini
                      ticketForOwner = ticketItem;
                      break;
                    }
                    currentIndex++;
                  }
                  if (ticketForOwner) break;
                }

                return (
                  <div className='border border-primary-light-200 rounded-lg bg-white shadow-sm' key={index}>
                    <div
                      className='border-b border-b-primary-light-200 px-5 py-3 flex items-center justify-between cursor-pointer'
                      onClick={() => toggleCollapse(index)}
                    >
                      <p className='font-semibold'>
                        {index > 0 ? `Pemilik Tiket ${index}` : 'Data Pemesan'}
                      </p>
                      <button className='text-grey'>
                        <FontAwesomeIcon
                          icon={faChevronCircleUp}
                          className={`${collapse[index] ? 'rotate-0' : 'rotate-180'} transition-transform`}
                        />
                      </button>
                    </div>
                    
                    {/* Tampilkan data tiket jika ada */}
                    {index > 0 && ticketForOwner && (
                      <div className='border-b p-3 border-primary-light-200 flex justify-between gap-3'>
                        <div className='flex'>
                          <div className='px-3 flex items-center border rounded-md border-primary-light'>
                            <FontAwesomeIcon icon={faTicket} className='text-primary' />
                          </div>
                          <div>
                            <p className='text-sm mb-1 font-semibold'>{ticketForOwner.name}</p>
                            <p className='text-xs text-grey'>
                            1 Tiket x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ticketForOwner.price)}
                            </p>
                          </div>
                        </div>
                        <div>
                          {index > 0 && (
                              <div className=' px-3 py-2 rounded-lg shadow-sm text-grey'>
                                 <div className='flex items-center gap-2'>
                          <p className='text-sm'>Gunakan Data Pemesan</p>
                          <Switch
                            size='sm'
                            onChange={(e: any) =>
                              e.target.checked ? copyOrderer(index) : clearForm(index)
                            }
                          />
                          </div>
                         
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    <div className={`px-5 pt-3 pb-5 ${collapse[index] ? '' : 'max-h-0'} transition-max-height delay-100 duration-150 ease-in-out`}>
                      <div className={`${collapse[index] ? 'opacity-100' : 'opacity-0'} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
                        <div className={`${collapse[index] ? 'visible' : 'invisible'} flex flex-col gap-3`}> 
                          {/* Field identitas */}
                          <div className='grid grid-cols-4 gap-3'>
                            <div>
                              <InputSelect
                                label='Identitas'
                                required
                                onChange={(e) => handleInput(index, 'identity_type_id', e.target.value)}
                                options={[
                                  { key: '1', label: 'KTP' },
                                  { key: '2', label: 'SIM' },
                                  { key: '3', label: 'Kartu Pelajar' },
                                  { key: '4', label: 'Passport' },
                                  { key: '5', label: 'KTM' },
                                ]}
                              />
                            </div>
                            <div className='col-span-3'>
                              <InputField
                                fullWidth
                                type='number'
                                label='Nomor Identitas'
                                placeholder='Contoh: 123456789012345'
                                value={item.nik}
                                onChange={(e) => handleInput(index, 'nik', e.target.value)}
                                inputProps={{ maxLength: 16 }}
                              />
                              {error.nik && (
                                <p className='text-[10px] mt-1 text-danger'>
                                  Minimal NIK adalah 16 Digit
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Field lainnya */}
                          <InputField
                            fullWidth
                            type='text'
                            label='Nama Lengkap'
                            placeholder='Nama Lengkap'
                            value={item.full_name}
                            onChange={(e) => handleInput(index, 'full_name', e.target.value)}
                          />
                          
                          <InputField
                            fullWidth
                            type='text'
                            label='Email'
                            placeholder='Contoh: example@example.com'
                            value={item.email}
                            onChange={(e) => handleInput(index, 'email', e.target.value)}
                          />

                          <InputField
                            fullWidth
                            type='number'
                            label='No Telepon'
                            placeholder='Contoh: 81233334444'
                            onChange={(e) => handleInput(index, 'no_telp', e.target.value)}
                            value={item.no_telp}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              <div className='col-span-2 flex flex-col gap-3'>
                <div className='border border-primary-light-200 rounded-lg bg-white shadow-sm'>
                  {/* <div className='border-b border-b-primary-light-200 p-3'>
                <p className='font-semibold'>Event</p>
              </div> */}
                  <div className='flex items-center gap-3 p-3'>
                    {detail && detail.image_url && (
                      <Image
                        src={detail?.image_url}
                        width={1000}
                        height={1000}
                        alt='banner'
                        className='w-10 h-10 object-cover rounded-md'
                      />
                    )}
                    <div>
                      <p className='text-sm mb-1'>{detail?.name}</p>
                      <p className='text-xs text-grey'>
                        {`${formatDate(detail.start_date)} - ${formatDate(detail.end_date)}`} &bull;{' '}
                        {`${detail.start_time} - ${detail.end_time}`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='border border-primary-light-200 rounded-lg bg-white shadow-sm'>
                  <div className='border-b border-b-primary-light-200 p-3'>
                    <p className='font-semibold'>Ringkasan Pesanan</p>
                  </div>
                  {ticket.map((item: FormTicket) => (
                    <div
                      className='border-b p-3 border-primary-light-200 flex gap-3'
                      key={item.event_ticket_id}
                    >
                      <div className='px-3 flex items-center border rounded-md border-primary-light'>
                        <FontAwesomeIcon icon={faTicket} className='text-primary' />
                      </div>
                      <div>
                        <p className='text-sm mb-1 font-semibold'>{item.name}</p>
                        <p className=' text-grey text-xs'>
                          {item.qty_ticket} Tiket x {item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                 <div className='py-3 px-4 flex justify-between items-center'>
                    <p>{`Jumlah (${totalCount} Tiket)`}</p>
                    <p className='font-semibold'>Rp{totalSubtotalPrice.toLocaleString('id-ID')}</p>
                  </div>
                  <div className='py-3 px-4 flex justify-between items-center'>
                    <p>Admin Fee</p>
                    <p className='font-semibold'>Rp{(detail.admin_fee * totalCount).toLocaleString('id-ID')}</p>
                  </div>
                  {detail.ppn ? (
                    <div className='py-3 px-4 flex justify-between items-center'>
                      <p>Tax</p>
                      <p className='font-semibold'>Rp{detail.ppn.toLocaleString('id-ID')}</p>
                    </div>
                  ) : null}
                  <div className='py-3 px-4 flex justify-between items-center'>
                    <p>Total Pembayaran</p>
                    <p className='font-semibold'>
                      Rp{(totalSubtotalPrice + (detail.admin_fee * totalCount) + (detail.ppn || 0)).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                {detail && detail.has_event_payment_method.length > 1 ? (
                  <div className='border border-primary-light-200 rounded-lg bg-white'>
                    <div className='border-b border-b-primary-light-200 py-4 px-6'>
                      <p className='font-semibold'>Metode Pembayaran</p>
                    </div>
                    <div className='border-b px-3 py-5 border-primary-light text-xs'>
                    
                      <Accordion variant='splitted' itemClasses={classAcc}>
                        {detail.has_event_payment_method.map((el: any) => (
                          <AccordionItem
                            key={el.has_payment_method_id}
                            aria-label='Anchor'
                            className=''
                            indicator={
                              <FontAwesomeIcon
                                icon={faChevronCircleLeft}
                                className='px-2 text-lg'
                              />
                            }
                            title={el.has_payment_method.payment_name}
                          >
                            {el.has_payment_method.id === 3 &&
                            el.has_payment_method.has_payment_link &&
                            el.has_payment_method.has_payment_link.length > 0 ? (
                              <RadioGroup
                                color='primary'
                                name='bank-code'
                                onChange={(e) => {
                                  setPayment('3');
                                  handlePaymentChange(e.target.value, 'bank');
                                  console.log(e.target.value);
                                }}
                              >
                                {el.has_payment_method.has_payment_link[0].has_payment_channel.map(
                                  (item: any) => (
                                    <div
                                      key={item.id}
                                      className='flex items-center justify-between py-2'
                                    >
                                      <div className='flex items-center gap-3'>
                                        <Images
                                          type='logo'
                                          path={el.has_payment_method.logo}
                                          alt={el.has_payment_method.payment_name}
                                          className='w-8 h-8 object-contain'
                                        />
                                        <p className='text-sm'>{item.payment_channel}</p>
                                      </div>
                                      <Radio value={item.payment_channel} />
                                    </div>
                                  )
                                )}
                              </RadioGroup>
                            ) : (
                              <RadioGroup
                                color='primary'
                                name='payment-method'
                                onChange={(e) => handlePaymentChange(e.target.value, 'payment')}
                              >
                                <div className='flex items-center justify-between py-2'>
                                  <div className='flex items-center gap-3'>
                                    <Images
                                      type='logo'
                                      path={el.has_payment_method.logo}
                                      alt={el.has_payment_method.payment_name}
                                      className='w-8 h-8 object-contain'
                                    />
                                    <p className='text-sm'>
                                      {el.has_payment_method.payment_name}
                                    </p>
                                  </div>
                                  <Radio value={el.has_payment_method.id.toString()}></Radio>
                                </div>
                              </RadioGroup>
                            )}
                          </AccordionItem>
                        ))}
                      </Accordion>
                   

                    </div>
                  </div>
                   ) : null}
              </div>
            </div>
          </div>
        ))}
      <ModalPaymentDataConfirmation
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onConfirm={submitForm}
        loading={loading}
        data={form[0]}
      />
    </>
  ) : (
    step === 3 && transactionData && (
      <div className='bg-primary-light max-w-xl pt-16 mx-auto'>
        {detail && detail.image_url && (
          <Image
            src={detail?.image_url}
            width={1000}
            height={1000}
            alt='banner'
            className='w-full mt-10'
          />
        )}

        <div className='bg-white'>
          <div className='border-b-2 p-3 border-primary-light'>
            <Countdown
              date={targetDate}
              intervalDelay={0}
              precision={3}
              renderer={renderer}
              autoStart={true}
            />
          </div>
          <div className='border-b-2 p-3 border-primary-light flex gap-3'></div>
        </div>

        <div className='bg-white mt-1'>
          <div className='border-b-2 p-3 border-primary-light flex gap-3'>
            {xenditInvoice ? (
              <div className='flex items-center gap-3'>
                <p className='font-semibold'>{xenditInvoice.bank_code}</p>
                {/* <Image src={paymen} alt='BCA' /> */}
              </div>
            ) : (
              <div className='flex items-center gap-3'>
                <p className='font-semibold'>BCA</p>
                {/* <Image src={paymen} alt='BCA' /> */}
              </div>
            )}
          </div>
          <div className='bg-white mt-1'>
            <div className='border-b-2 p-3 border-primary-light flex flex-col gap-2'>
              <div>
                <p className='text-xs text-grey mb-1'>Kode Invoice</p>
                <p className='text-sm mb-1'>{transactionData.invoice_no}</p>
              </div>
              <div>
                {xenditInvoice ? (
                  <>
                    <p className='text-xs text-grey mb-1'>No. Virtual Account</p>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm'>{xenditInvoice.bank_account_number}</p>
                      <button
                        onClick={handleCopy}
                        className='hover:bg-primary-light-200 p-1 rounded-md'
                      >
                        <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className='text-xs text-grey mb-1'>No. Rekening</p>
                    <p className='text-sm mb-1'>{paymentMethod.account_no}</p>
                    <p className='text-xs mb-1'>Atas Nama {paymentMethod.account_name}</p>
                  </>
                )}
                {/* <p className='text-xs mb-1'>Atas Nama {paymentMethod.account_name}</p> */}
              </div>
              <div>
                <p className='text-xs text-grey mb-1'>Total Pembayaran</p>
                <p className='text-sm mb-1'>
                  {xenditInvoice
                    ? `Rp${xenditInvoice.transfer_amount.toLocaleString('id-ID')}`
                    : `Rp${transactionData.grandtotal.toLocaleString('id-ID')}`}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className='bg-white mt-1'>
          <div className='border-b-2 p-3 border-primary-light flex flex-col gap-2'>
            <div className='flex justify-between'>
              <p className='text-xs text-grey mb-1'>
                Regular Ticket {`x(${transactionData.total_qty})`}
              </p>
              <p className='text-xs mb-1'>
                Rp{transactionData.total_price.toLocaleString('id-ID')}
              </p>
            </div>
            <div className='flex justify-between items-center'>
              <p className='text-xs text-grey mb-1'>Pajak</p>
              <p className='text-xs mb-1'>
                Rp{transactionData.ppn ? transactionData.ppn.toLocaleString('id-ID') : 0}
              </p>
            </div>
            <div className='flex justify-between items-center'>
              <p className='text-xs text-grey mb-1'>Biaya Admin</p>
              <p className='text-xs mb-1'>
                Rp
                {transactionData.admin_fee ? transactionData.admin_fee.toLocaleString('id-ID') : 0}
              </p>
            </div>
            <div className='border-t-2 border-primary-light'>
              <div className='flex items-center justify-between font-semibold'>
                <p>Total Pembayaran</p>
                <p>{`Rp${transactionData.grandtotal.toLocaleString('id-ID')}`}</p>
              </div>
              {xenditInvoice ? (
                <Link href={`/success/${transactionData.invoice_no}`} target='_blank'>
                  <button className='w-full bg-primary-dark text-white py-2 rounded-lg my-3'>
                    {loading ? <Spinner color='default' size='sm' /> : 'Cek Status Pembayaran'}
                  </button>
                </Link>
              ) : (
                <button
                  className='w-full bg-primary-dark text-white py-2 rounded-lg my-3'
                  onClick={() => handleShowModal()}
                >
                  {loading ? <Spinner color='default' size='sm' /> : 'Upload Bukti Pembayaran'}
                </button>
              )}
            </div>
          </div>
        </div>
        <ModalTransaction
          id={transactionData.id}
          invoice={transactionData.invoice_no}
          isOpen={showModalTransaction}
          setIsOpen={setShowModalTransaction}
        />
      </div>
    )
  );
};

export default FirstStepUnlogged;
