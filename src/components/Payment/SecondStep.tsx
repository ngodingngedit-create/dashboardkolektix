import React from 'react';
import useWindowSize from '@/utils/useWindowSize';
import { EventProps, PaymentMethod } from '@/utils/globalInterface';
import Image from 'next/image';
import Images from '../Images';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Accordion, AccordionItem, RadioGroup, Radio, Spinner } from '@nextui-org/react';
import {
  faTicket,
  faChevronCircleDown,
  faChevronCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '@/utils/useFormattedDate';

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
}

interface StepPaymentProps {
  detail: EventProps;
  ticket: FormTicket[];
  totalCount: number;
  onSubmit: () => void;
  totalSubtotalPrice: number;
  paymentList: PaymentMethod[];
  payment: string;
  setPayment: (payment: string) => void;
  setBank: (bank: string) => void;
  loading: boolean;
  voucher?: any;
}

const SecondStep = ({
  detail,
  ticket,
  totalCount,
  onSubmit,
  totalSubtotalPrice,
  paymentList,
  setBank,
  payment,
  setPayment,
  loading,
  voucher,
}: StepPaymentProps) => {

  console.log('voucher', voucher);
  
  const { width } = useWindowSize();
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
  return (
    width &&
    (width < 768 ? (
      <div className='bg-primary-light px-4 sm:px-8 md:px-12 lg:px-0'>
        <div className='border-b-2 p-3 border-primary-light flex items-center gap-3'>
          <div className='px-2 py-1 border-2 rounded-md border-primary-light'>
            {detail && detail.image_url && (
              <Image
                src={detail?.image_url}
                width={1000}
                height={1000}
                alt='banner'
                className='w-full h-[230px] object-cover rounded-3xl'
              />
            )}
          </div>
          <div>
            <p className='text-sm mb-1'>{detail?.name}</p>
            <p className='text-xs text-grey'>{totalCount} Tiket</p>
          </div>
        </div>
        <div className='bg-white'>
          <div className='border-b-2 p-3 border-primary-light'>
            <p className='font-semibold'>Tiket</p>
          </div>
          {ticket.map((item: FormTicket) => (
            <div
              className='border-b-2 p-3 border-primary-light flex gap-3'
              key={item.event_ticket_id}
            >
              <div className='px-3 flex items-center border-2 rounded-md border-primary-light'>
                <FontAwesomeIcon icon={faTicket} className='text-primary' />
              </div>
              <div>
                <p className='text-sm mb-1'>{item.name}</p>
                <p className='text-sm text-grey'>
                  {item.qty_ticket} Tiket x {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className='bg-white mt-1'>
          <div className='border-b-2 py-3 px-5 border-primary-light'>
            <p className='font-semibold'>Metode Pembayaran</p>
          </div>
          <div className='border-b-2 p-3 border-primary-light text-xs'>
            <Accordion variant='splitted' itemClasses={classAcc}>
              {detail.has_event_payment_method.length > 0
                ? detail.has_event_payment_method.filter(e => e.payment_method_id != 5).map((el: any) => (
                    <AccordionItem
                      key={el.has_payment_method_id}
                      aria-label='Anchor'
                      className=''
                      indicator={
                        <FontAwesomeIcon icon={faChevronCircleLeft} className='px-2 text-lg' />
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
                            setBank(e.target.value);
                            console.log(e.target.value);
                          }}
                        >
                          {el.has_payment_method.has_payment_link[0].has_payment_channel.map(
                            (item: any) => (
                              <div key={item.id} className='flex items-center justify-between py-2'>
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
                          onChange={(e) => setPayment(e.target.value)}
                        >
                          <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-3'>
                              <Images
                                type='logo'
                                path={el.has_payment_method.logo}
                                alt={el.has_payment_method.payment_name}
                                className='w-8 h-8 object-contain'
                              />
                              <p className='text-sm'>{el.has_payment_method.payment_name}</p>
                            </div>
                            <Radio value={el.has_payment_method.id.toString()}></Radio>
                          </div>
                        </RadioGroup>
                      )}
                    </AccordionItem>
                  ))
                : paymentList &&
                  paymentList.map((el: PaymentMethod) => (
                    <AccordionItem
                      key={el.id}
                      aria-label='Anchor'
                      className=''
                      indicator={
                        <FontAwesomeIcon icon={faChevronCircleLeft} className='px-2 text-lg' />
                      }
                      title={el.payment_name}
                    >
                      {el.id === 3 && el.has_payment_link && el.has_payment_link.length > 0 ? (
                        <RadioGroup
                          color='primary'
                          name='bank-code'
                          onChange={(e) => {
                            setPayment('3');
                            setBank(e.target.value);
                            console.log(e.target.value);
                          }}
                        >
                          {el.has_payment_link[0].has_payment_channel.map((item) => (
                            <div key={item.id} className='flex items-center justify-between py-2'>
                              <div className='flex items-center gap-3'>
                                <Images
                                  type='logo'
                                  path={el.logo}
                                  alt={el.payment_name}
                                  className='w-8 h-8 object-contain'
                                />
                                <p className='text-sm'>{item.payment_channel}</p>
                              </div>
                              <Radio value={item.payment_channel} />
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <RadioGroup
                          color='primary'
                          name='payment-method'
                          onChange={(e) => setPayment(e.target.value)}
                        >
                          <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-3'>
                              <Images
                                type='logo'
                                path={el.logo}
                                alt={el.payment_name}
                                className='w-8 h-8 object-contain'
                              />
                              <p className='text-sm'>{el.payment_name}</p>
                            </div>
                            <Radio value={el.id.toString()}></Radio>
                          </div>
                        </RadioGroup>
                      )}
                    </AccordionItem>
                  ))}
            </Accordion>
            <button
              className='w-full bg-primary-dark text-lg text-white py-2 rounded-lg my-5 disabled:bg-primary-disabled disabled:cursor-not-allowed mb-56'
              disabled={payment === '' || loading}
              onClick={onSubmit}
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <p className='mr-3 text-lg'>Loading</p>
                  <Spinner color='default' size='sm' />
                </div>
              ) : (
                'Bayar'
              )}
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className='bg-primary-light pb-20 h-screen px-4 sm:px-8 md:px-12 lg:px-0'>
        <div className='max-w-5xl mx-auto grid grid-cols-5 mt-8 gap-x-5 pt-20'>
          <h2 className='col-span-5 mb-5'>Konfirmasi</h2>
          <div className='col-span-3 flex flex-col gap-3'>
            <div className='border border-primary-light-200 rounded-lg bg-white'>
              <div className='border-b border-b-primary-light-200 py-4 px-6'>
                <p className='font-semibold'>Metode Pembayaran</p>
              </div>
              <div className='border-b px-3 py-5 border-primary-light text-xs'>
                <Accordion variant='splitted' itemClasses={classAcc}>
                  {detail.has_event_payment_method.length > 0
                    ? detail.has_event_payment_method.filter(e => e.payment_method_id != 5).map((el: any) => (
                        <AccordionItem
                          key={el.has_payment_method_id}
                          aria-label='Anchor'
                          className=''
                          indicator={
                            <FontAwesomeIcon icon={faChevronCircleLeft} className='px-2 text-lg' />
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
                                setBank(e.target.value);
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
                              onChange={(e) => setPayment(e.target.value)}
                            >
                              <div className='flex items-center justify-between py-2'>
                                <div className='flex items-center gap-3'>
                                  <Images
                                    type='logo'
                                    path={el.has_payment_method.logo}
                                    alt={el.has_payment_method.payment_name}
                                    className='w-8 h-8 object-contain'
                                  />
                                  <p className='text-sm'>{el.has_payment_method.payment_name}</p>
                                </div>
                                <Radio value={el.has_payment_method.id.toString()}></Radio>
                              </div>
                            </RadioGroup>
                          )}
                        </AccordionItem>
                      ))
                    : paymentList &&
                      paymentList.map((el: PaymentMethod) => (
                        <AccordionItem
                          key={el.id}
                          aria-label='Anchor'
                          className=''
                          indicator={
                            <FontAwesomeIcon icon={faChevronCircleLeft} className='px-2 text-lg' />
                          }
                          title={el.payment_name}
                        >
                          {el.id === 3 && el.has_payment_link && el.has_payment_link.length > 0 ? (
                            <RadioGroup
                              color='primary'
                              name='bank-code'
                              onChange={(e) => {
                                setPayment('3');
                                setBank(e.target.value);
                                console.log(e.target.value);
                              }}
                            >
                              {el.has_payment_link[0].has_payment_channel.map((item) => (
                                <div
                                  key={item.id}
                                  className='flex items-center justify-between py-2'
                                >
                                  <div className='flex items-center gap-3'>
                                    <Images
                                      type='logo'
                                      path={el.logo}
                                      alt={el.payment_name}
                                      className='w-8 h-8 object-contain'
                                    />
                                    <p className='text-sm'>{item.payment_channel}</p>
                                  </div>
                                  <Radio value={item.payment_channel} />
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <RadioGroup
                              color='primary'
                              name='payment-method'
                              onChange={(e) => setPayment(e.target.value)}
                            >
                              <div className='flex items-center justify-between py-2'>
                                <div className='flex items-center gap-3'>
                                  <Images
                                    type='logo'
                                    path={el.logo}
                                    alt={el.payment_name}
                                    className='w-8 h-8 object-contain'
                                  />
                                  <p className='text-sm'>{el.payment_name}</p>
                                </div>
                                <Radio value={el.id.toString()}></Radio>
                              </div>
                            </RadioGroup>
                          )}
                        </AccordionItem>
                      ))}
                </Accordion>
              </div>
            </div>
          </div>
          <div className='col-span-2 flex flex-col gap-5'>
            <div className='border border-primary-light-200 rounded-lg bg-white'>
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
            <div className='border border-primary-light-200 rounded-lg bg-white'>
              <div className='border-b border-b-primary-light-200 p-3'>
                <p className='font-semibold'>Ringkasan Pesanan</p>
              </div>
              {ticket.map((item: FormTicket) => (
                <div
                  className='border-b p-3 border-primary-light flex gap-3'
                  key={item.event_ticket_id}
                >
                  <div className='px-3 flex items-center border rounded-md border-primary-light'>
                    <FontAwesomeIcon icon={faTicket} className='text-primary' />
                  </div>
                  <div>
                    <p className='text-sm mb-1'>{item.name}</p>
                    <p className='text-sm text-grey'>
                      {item.qty_ticket} Tiket x {item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className='border border-primary-light-200 rounded-lg bg-white'>
              <div className='border-b border-b-primary-light-200 p-3'>
                <p className='font-semibold'>Detail Pembayaran</p>
              </div>
              <div className='flex flex-col gap-2 py-3 border-b border-b-primary-light-200'>
                <div className='py-3 px-4 flex justify-between items-center'>
                <p>{`Jumlah (${totalCount} Tiket)`}</p>
                <p className='font-semibold'>Rp {totalSubtotalPrice.toLocaleString('id-ID')}</p>
              </div>
                {voucher && Array.isArray(voucher) && voucher.length > 0 ? (
                  <div className='py-3 px-4 flex justify-between items-center'>
                  <p>Voucher</p>
                  <p className='font-semibold'>
                    - Rp {voucher.reduce((total, v) => total + (v.amount || 0), 0).toLocaleString('id-ID')}
                  </p>
                  </div>
                ) : null}
              <div className='py-3 px-4 flex justify-between items-center'>
                <p>Biaya Admin</p>
                <p className='font-semibold'>Rp {(detail.admin_fee * totalCount).toLocaleString('id-ID')}</p>
              </div>
              {detail.ppn ? (
                <div className='py-3 px-4 flex justify-between items-center'>
                  <p>Tax</p>
                  <p className='font-semibold'>Rp {detail.ppn.toLocaleString('id-ID')}</p>
                </div>
              ) : null}
              <div className='py-3 px-4 flex justify-between items-center'>
                <p>Total Pembayaran</p>
                <p className='font-semibold'>
                  Rp {(
                    totalSubtotalPrice +
                    (detail.admin_fee * totalCount) +
                    (detail.ppn || 0) -
                    (voucher ? voucher.reduce((total: any, v: { amount: any; }) => total + (v.amount || 0), 0) : 0)
                  ).toLocaleString('id-ID')}
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  );
};

export default SecondStep;
