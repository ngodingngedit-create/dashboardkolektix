import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight, faCalendar } from '@fortawesome/free-regular-svg-icons';
import Config from '../../Config';
import { useRouter } from 'next/router';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import config from '@/Config';
import Images from '../Images';
import Foto from '../../assets/images/amis-banner.png';
import { Skeleton, Card } from '@nextui-org/react';
import { TransactionProps } from '@/utils/globalInterface';
import { formatYear } from '@/utils/useFormattedDate';

interface TicketCardProps {
  data: TransactionProps;
}

const TicketCard = ({ data }: TicketCardProps) => {
  const router = useRouter();
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    let formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(date);
    formattedDate = formattedDate.replace(',', '');
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  return (
    <>
      <div className='border-2 rounded-md border-primary-light-200 text-dark mt-5 px-2 shadow-sm'>
        <div className='text-xs px-2 py-3 flex justify-between items-center'>
        <p
          className={`${
            data.transaction_status_id === 1 
              ? 'text-warning-700 bg-warning-50 p-2 rounded-md'   
              : data.transaction_status_id === 3 
              ? 'text-danger-700 bg-danger-50 p-2 rounded-md'   
              : data.transaction_status_id === 4 
              ? 'text-warning-700 bg-warning-50 p-2 rounded-md'  
              : 'text-success-700 bg-success-50 p-2 rounded-md'   
          }`}
        >
          {data.transaction_status_id === 1 
            ? 'Pembayaran Pending'    
            : data.transaction_status_id === 3 
            ? 'Pembayaran Gagal'        
            : data.transaction_status_id === 4 
            ? 'Transaksi Expired'      
            : 'Pembayaran Lunas'}        
        </p>
          <button
            className='flex items-center gap-2 text-primary-base'
            onClick={() => router.push(`/event/${data.has_event?.slug || ''}`)}
          >
            <p>Lihat Event</p> <FontAwesomeIcon icon={faArrowAltCircleRight} />
          </button>
        </div>
        <div className='border-2 border-primary-light-200 border-dashed border-x-0 border-b-0 py-3 px-2 flex justify-between h-auto'>
          <div className='w-full'>
            {data.has_event ? (
              <>
                <h5 className='text-sm md:text-[16px]'>{data.has_event.name}</h5>
                <div className='flex md:flex-row flex-col md:items-center text-xs text-grey md:gap-2'>
                  <div className='flex items-center gap-2'>
                    <FontAwesomeIcon icon={faCalendar} />
                    <p>{`${formatDate(data.has_event.start_date)} - ${formatDate(
                      data.has_event.end_date
                    )}`}</p>
                  </div>
                  <p className='text-primary-200 md:block hidden'>|</p>
                  <div className='flex items-center gap-2'>
                    <FontAwesomeIcon icon={faTicket} />
                    <p>{`${data.total_qty} Tiket`}</p>
                  </div>
                  <p className='text-primary-200 md:block hidden'>|</p>
                </div>
                <p className='text-grey text-xs my-3'>{data.invoice_no}</p>
                <p className='text-grey text-xs my-3'>{`Pembelian pada ${formatDate(
                  data.created_at
                )} ${formatYear(data.created_at)}`}</p>
              </>
            ) : (
              <p className='text-danger-700'>Event data not available</p>
            )}
            <div className='mt-3'>
              {data.transaction_status_id === 1 ? (
                <button
                  onClick={() => router.push(`/payment/${data.id}`)}
                  className='bg-white border-primary-light-200 border-2 text-primary-base hover:bg-primary-base hover:text-white hover:border-primary-base shadow-sm transition-all px-4 py-2 font-semibold text-xs rounded-md disabled:bg-primary-disabled disabled:cursor-not-allowed'
                >
                  Lanjutkan Pembayaran
                </button>
            ) : data.transaction_status_id === 3 || data.transaction_status_id === 4 ? (
                <button
                  className='bg-white border-primary-light border-2 text-grey shadow-sm transition-all px-4 py-2 font-semibold text-xs rounded-md disabled:bg-white disabled:cursor-not-allowed'
                  hidden
                >
                  E-tiket
                </button>
              ) : (
                <div>
                     <a
                  target='_blank'
                  href={`${Config.wsUrl}transaction-document/${data.invoice_no}`}
                  rel='noopener noreferrer'
                >
                  <button className='bg-white border-primary-light-200 border-2 text-primary-base hover:bg-primary-base hover:text-white hover:border-primary-base shadow-sm transition-all px-4 py-2 font-semibold text-xs rounded-md disabled:bg-primary-disabled disabled:cursor-not-allowed me-2'>
                    E-tiket
                  </button>
                </a>
                <a
                  target='_blank'
                  href={`/success/${data.invoice_no}`} 
                  rel='noopener noreferrer'
                >
                  <button className='bg-white border-primary-light-200 border-2 text-primary-base hover:bg-primary-base hover:text-white hover:border-primary-base shadow-sm transition-all px-4 py-2 font-semibold text-xs rounded-md disabled:bg-primary-disabled disabled:cursor-not-allowed'>
                   Invoice
                  </button>
                </a>
                </div>
               
              )}
            </div>
          </div>
          {data.has_event && (
            <div>
              <Images
                type='event'
                path={data.has_event.image}
                alt='image'
                className='h-full w-52 object-cover rounded-md'
                width={200}
                height={200}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TicketCard;
