import React from 'react';
import useWindowSize from '@/utils/useWindowSize';
import {
  EventProps,
  PaymentMethod,
  TransactionProps,
  TransactionTicketProps,
} from '@/utils/globalInterface';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Spinner } from '@nextui-org/react';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '@/utils/useFormattedDate';
import { useRouter } from 'next/router';
import Images from '../Images';

interface Voucher {
  id: number;
  name: string;
  amount: number;
}

interface StepPaymentProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setStep: (step: number) => void;
  xenditInvoice?: any;
  transactionData: TransactionProps | null;
  scrollToTop: () => void;
  voucher?: Voucher[]; 
}

const ThirdStep = ({
  transactionData,
  setLoading,
  setStep,
  scrollToTop,
  xenditInvoice,
  loading,
  voucher,
}: StepPaymentProps) => {
  const router = useRouter();
  const { width } = useWindowSize();
  // Only proceed if transactionData exists
  if (!width || !transactionData) return null;

  // Calculate amounts properly
  const baseAmount = transactionData.tickets.reduce(
  (sum, ticket) => sum + (ticket.price * ticket.qty_ticket), 
  0
);
const adminFee = transactionData.has_event.admin_fee * transactionData.total_qty;
const voucherDiscount = voucher?.reduce((sum, v) => sum + (v.amount || 0), 0) || 0;
const subtotal = baseAmount + adminFee - voucherDiscount;
const taxAmount = Math.round(subtotal * (transactionData.has_event.ppn / 100));
const grandtotal = subtotal + taxAmount;

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
    transactionData &&
    (width < 768 ? (
      <div className='bg-primary-light max-w-2xl mx-auto px-4 sm:px-8 md:px-12 lg:px-0 pb-56'>
        <div className='border-b-2 p-3 border-primary-light flex items-center gap-3'>
          <div className='px-2 py-1 border-2 rounded-md border-primary-light'>
            {transactionData.has_event && transactionData.has_event.image_url && (
              <Image
                src={transactionData.has_event?.image_url}
                width={1000}
                height={1000}
                alt='banner'
                className='w-10 h-10 object-cover rounded-md'
              />
            )}
          </div>
          <div>
            <p className='text-sm mb-1'>{transactionData.has_event.name}</p>
            <p className='text-xs text-grey'>{transactionData.total_qty} Tiket</p>
          </div>
        </div>
        <div className='bg-white'></div>
        <div className='bg-white mt-1'>
          <div className='border-b-2 p-3 border-primary-light'>
            <p className='font-semibold'>Pengunjung</p>
          </div>
          <div className='border-b-2 p-3 border-primary-light flex flex-col gap-2'>
            {transactionData.has_event.is_noidentity ? (
              <div>
                <p className='text-xs text-grey mb-1'>Nomor Induk KTP</p>
                <p className='text-sm mb-1'>{transactionData.identities[0].nik}</p>
              </div>
            ) : (
              <></>
            )}
            {transactionData.has_event.is_name ? (
              <div>
                <p className='text-xs text-grey mb-1'>Nama Lengkap</p>
                <p className='text-sm mb-1'>{transactionData.identities[0].full_name}</p>
              </div>
            ) : (
              <></>
            )}
            {transactionData.has_event.is_email ? (
              <div>
                <p className='text-xs text-grey mb-1'>Email</p>
                <p className='text-sm mb-1'>{transactionData.identities[0].email}</p>
              </div>
            ) : (
              <></>
            )}
            {transactionData.has_event.is_phone_number ? (
              <div>
                <p className='text-xs text-grey mb-1'>No. Telepon / Handphone</p>
                <p className='text-sm mb-1'>{'+62' + transactionData.identities[0].no_telp}</p>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
        {/* <div className='bg-white mt-1'>
          <div className='border-b-2 p-3 border-primary-light'>
            <p className='font-semibold'>Metode Pembayaran</p>
          </div>
          <div className='border-b-2 p-3 border-primary-light flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
              <Images
                path={transactionData.payment_method.logo}
                type='logo'
                alt='BCA'
                className='w-10'
              />
              <p className='text-sm'>{transactionData.payment_method.payment_name}</p>
            </div>
            {xenditInvoice && (
              <>
                <p>{xenditInvoice.bank_code + ' ' + xenditInvoice.bank_branch}</p>
                <p>
                  No Virtual Account :{' '}
                  <span className='font-semibold'>{xenditInvoice.bank_account_number}</span>
                </p>
              </>
            )}
          </div>
        </div> */}
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
            {voucher && voucher.length > 0 && (
  <>
    <div className='flex justify-between items-center'>
      <p className='text-xs text-grey mb-1'>Total Voucher Discount</p>
      <p className='text-xs mb-1'>
        - Rp {voucher.reduce((sum: number, v: Voucher) => sum + v.amount, 0).toLocaleString('id-ID')}
      </p>
    </div>
  </>
)}
            <div className='flex justify-between items-center'>
              <p className='text-xs text-grey mb-1'>PPN ({transactionData.ppn}%)</p>
              <p className='text-xs mb-1'>
                Rp{Math.round(taxAmount).toLocaleString('id-ID')}
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
              <p>
                 Rp{Math.round(grandtotal).toLocaleString('id-ID')}
              </p>
            </div>
              {/* <button
                className='w-full bg-primary-dark text-white py-2 rounded-lg my-3 disabled:bg-primary-disabled disabled:cursor-not-allowed'
                disabled={loading}
                onClick={
                  transactionData.payment_method.id === 4 && transactionData.xendit_url
                    ? () => {
                        setLoading(true);
                        router.push(transactionData.xendit_url);
                      }
                    : transactionData.payment_method.id === 3
                    ? () => {
                        setStep(3);
                        scrollToTop();
                      }
                    : () => {
                        setStep(2);
                        scrollToTop();
                      }
                }
              >
                {loading ? (
                  <div className='flex items-center justify-center'>
                    <p className='mr-3 text-lg'>Loading</p>
                    <Spinner color='default' size='sm' />
                  </div>
                ) : (
                  'Bayar Sekarang'
                )}
              </button> */}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className='bg-primary-light pb-28 min-h-screen'>
        <div className='max-w-5xl mx-auto grid grid-cols-5 mt-8 gap-x-5 pt-20'>
          <h2 className='col-span-5 mb-5'>Konfirmasi Pembayaran</h2>
          <div className='col-span-3 flex flex-col gap-3'>
          {transactionData.identities.map((item, index) => {
              let ticketForOwner = null;
              let currentIndex = 0;

              // Start assigning tickets only from index 1
              if (index > 0) {
                // Loop through tickets to find the tickets for the current owner
                for (const ticketItem of transactionData.tickets) {
                  for (let i = 0; i < ticketItem.qty_ticket; i++) {
                    if (currentIndex === index - 1) {
                      // Assign one ticket to the current owner starting from index 1
                      ticketForOwner = { ...ticketItem, qty_ticket: 1 };
                      break;
                    }
                    currentIndex++;
                  }
                  if (ticketForOwner) break;
                }
              }

              return (
                <div className="border border-primary-light-200 rounded-lg bg-white" key={index}>
                  <div className="border-b border-b-primary-light-200 py-4 px-6">
                    <p className="font-semibold">Data Pelanggan</p>
                  </div>
                  <div className="border-b px-6 py-5 border-primary-light">
                    {transactionData.has_event.is_noidentity ? (
                      <div>
                        <p className="text-grey mb-1">Nomor Induk KTP</p>
                        <p className="font-semibold mb-1">{item.nik}</p>
                      </div>
                    ) : (
                      <></>
                    )}
                    {transactionData.has_event.is_name ? (
                      <div>
                        <p className="text-grey mb-1">Nama Lengkap</p>
                        <p className="font-semibold mb-1">{item.full_name}</p>
                      </div>
                    ) : (
                      <></>
                    )}
                    {transactionData.has_event.is_email ? (
                      <div>
                        <p className="text-grey mb-1">Email</p>
                        <p className="font-semibold mb-1">{item.email}</p>
                      </div>
                    ) : (
                      <></>
                    )}
                    {transactionData.has_event.is_phone_number ? (
                      <div>
                        <p className="text-grey mb-1">No. Telepon / Handphone</p>
                        <p className="font-semibold mb-1">{'+62' + item.no_telp}</p>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="px-6 py-3">
                    {ticketForOwner && index > 0 ? ( // Ensure ticket is displayed only for index > 0
                      <div className="border-b p-3 border-primary-light flex gap-3" key={ticketForOwner.event_ticket_id}>
                        <div className="px-3 flex items-center border rounded-md border-primary-light">
                          <FontAwesomeIcon icon={faTicket} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm mb-1 font-semibold">
                            {ticketForOwner.has_event_ticket.name} (Normal)
                          </p>
                          <p className="text-sm text-grey">
                            {ticketForOwner.qty_ticket} Tiket x{' '}
                            {ticketForOwner.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              );
            })}

            
            {/* 
            <div className='border border-primary-light-200 rounded-lg bg-white'>
              <div className='border-b border-b-primary-light-200 py-4 px-6'>
                <p className='font-semibold'>Metode Pembayaran</p>
              </div>
              <div className='border-b px-3 py-5 border-primary-light text-xs'>
                <div className='flex items-center gap-3 px-3'>
                  <Images
                    path={transactionData.payment_method.logo}
                    type='logo'
                    alt='BCA'
                    className='w-10'
                  />
                  <p className='text-sm'>{transactionData.payment_method.payment_name}</p>
                </div>
                {xenditInvoice && (
                  <div className='p-3 flex flex-col gap-2'>
                    <p>{xenditInvoice.bank_code + ' ' + xenditInvoice.bank_branch}</p>
                    <p>
                      No Virtual Account :{' '}
                      <span className='font-semibold'>{xenditInvoice.bank_account_number}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            */}

          </div>
          <div className='col-span-2 flex flex-col gap-5'>
            <div className='border border-primary-light-200 rounded-lg bg-white'>
              <div className='flex items-center gap-3 p-3'>
                {transactionData.has_event && transactionData.has_event.image_url && (
                  <Image
                    src={transactionData.has_event?.image_url}
                    width={1000}
                    height={1000}
                    alt='banner'
                    className='w-10 h-10 object-cover rounded-md'
                  />
                )}
                <div>
                  <p className='text-sm mb-1'>{transactionData.has_event?.name}</p>
                  <p className='text-xs text-grey'>
                    {`${formatDate(transactionData.has_event.start_date)} - ${formatDate(
                      transactionData.has_event.end_date
                    )}`}{' '}
                    &bull;{' '}
                    {`${transactionData.has_event.start_time} - ${transactionData.has_event.end_time}`}
                  </p>
                </div>
              </div>
            </div>
            <div className='border border-primary-light-200 rounded-lg bg-white'>
              <div className='border-b border-b-primary-light-200 p-3'>
                <p className='font-semibold'>Ringkasan Pesanan</p>
              </div>
              {transactionData.tickets.map((item: TransactionTicketProps) => (
                <div
                  className='border-b p-3 border-primary-light flex gap-3'
                  key={item.event_ticket_id}
                >
                  <div className='px-3 flex items-center border rounded-md border-primary-light'>
                    <FontAwesomeIcon icon={faTicket} className='text-primary' />
                  </div>
                  <div>
                    <p className='text-sm mb-1 font-semibold'>{item.has_event_ticket.name}</p>
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
              {transactionData.tickets.map((item: TransactionTicketProps) => (
                  <div
                    className='flex items-center justify-between px-4'
                    key={item.event_ticket_id}
                  >
                    <p className='text-sm mb-1'>
                      {`${item.has_event_ticket.name} (x${item.qty_ticket})`}
                    </p>
                    <p className='text-sm text-grey'>
                      Rp{(item.price * item.qty_ticket).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              <div className='flex items-center justify-between px-4'>
                <p className='text-sm mb-1'>Admin Fee</p>
                <p className='text-sm text-grey'>
                  Rp
                  {transactionData.has_event.admin_fee
                    ? (transactionData.has_event.admin_fee * transactionData.total_qty).toLocaleString('id-ID')
                    : 0}
                </p>
              </div>
              {voucher && Array.isArray(voucher) && voucher.length > 0 ? (
                  <div className='flex items-center justify-between px-4'>
                  <p className='text-sm mb-1'>Voucher</p>
                  <p className='text-sm text-grey'>
                    - Rp {voucher.reduce((total, v) => total + (v.amount || 0), 0).toLocaleString('id-ID')}
                  </p>
                  </div>
                ) : null}
                <div className='flex items-center justify-between px-4'>
                  <p className='text-sm mb-1'>PPN ({transactionData.has_event.ppn}%)</p>
                  <p className='text-sm text-grey'>
                   Rp{Math.round(taxAmount).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className='py-3 px-4 flex justify-between items-center'>
                <p className='font-semibold'>{`Total Pembayaran`}</p>
                <p className='font-semibold'>
                   Rp{Math.round(grandtotal).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  );
};

export default ThirdStep;
