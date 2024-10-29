import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock } from '@fortawesome/free-regular-svg-icons';
import elips from '../../assets/images/Ellipse 40.png';
import Image from 'next/image';
import { Get } from '@/utils/REST';
import { TransactionProps } from '@/utils/globalInterface';
import { Spinner } from '@nextui-org/react';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import { useRouter } from 'next/router';
import Button from '@/components/Button';
import Config from '@/Config'; 
import { Transition } from '@headlessui/react';

const SuccessWithInvoice = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [data, setData] = useState<TransactionProps>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { invoice } = router.query;

  useEffect(() => {
    setIsRendered(true);
  }, []);

  // const renderer: CountdownRendererFn = ({ seconds, completed }) => {
  //   if (completed) {
  //     router.push('/dashboard/my-ticket');
  //   } else {
  //     return (
  //       <span className='text-white w-full text-center'>{`Ke halaman dashboard dalam ${String(
  //         seconds
  //       )} detik`}</span>
  //     );
  //   }
  // };

  const getData = () => {
    setLoading(true);
    Get('transaction-finish', { external_id: invoice })
      .then((res: any) => {
        setData(res.data);
        console.log('Success', res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isRendered && invoice) {
      getData();
    }
  }, [isRendered, invoice]);

  const formatTime = (date: string) => {
    const dateString = new Date(date);
    const hours = dateString.getUTCHours().toString().padStart(2, '0');
    const minutes = dateString.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getUTCFullYear();
    return `${day} ${month} ${year}`;
  };

  return !loading && data ? (
    <div className='min-h-[80vh]'>
      <Image src={elips} alt='elips' className='w-full absolute' />
      <div className='flex flex-col py-5 px-3 min-h-[50vh] justify-center text-dark text-center max-w-[20rem] border border-primary-light-200 mx-auto mb-20 top-20 relative bg-white rounded-xl shadow-sm'>
      {data.transaction_status_id !== 1 && data.transaction_status_id !== 3 && data.transaction_status_id !== 4 ? (
          <FontAwesomeIcon icon={faCheckCircle} size='3x' className='text-[#06c258] mb-2' />
        ) : (
          <FontAwesomeIcon icon={faClock} size='3x' className='text-[#fe9d36] mb-2' />
        )}
       <h1 className='text-[20px] text-center'>
          {data.transaction_status_id === 1
            ? 'Transaksi Pending'
            : data.transaction_status_id === 3
            ? 'Transaksi Failed'
            : data.transaction_status_id === 4
            ? 'Transaksi Expired'
            : 'Transaksi Berhasil'}
        </h1>


        {data.transaction_status_id !== 1 && (
          <p className='mt-2 text-grey text-sm'>
            Terimakasih sudah menggunakan kolektix, silahkan cek email untuk melihat status transaksi, atau silahkan login menggunakan email data pemesan anda.
          </p>
        )}

        <div className='border-b border-b-primary-light-200'>
          {data.payment_method && data.payment_method?.payment_name.toLowerCase() !== 'xendit' && (
            <div className='flex justify-between my-3'>
              <p className='text-grey'>Metode Pembayaran</p>
              <p className='text-dark'>{data.payment_method.payment_name}</p>
            </div>
          )}
          <div className='flex justify-between my-3'>
            <p className='text-grey'>Status</p>
            <p className='text-dark'>{data.payment_status}</p>
          </div>
          <div className='flex justify-between my-3'>
            <p className='text-grey'>Waktu</p>
            <p className='text-dark'>{formatTime(data.updated_at)}</p>
          </div>
          <div className='flex justify-between my-3'>
            <p className='text-grey'>Tanggal</p>
            <p className='text-dark'>{formatDate(data.updated_at)}</p>
          </div>
        </div>
        {/* {data.tickets.map((ticket, index) => (
        <div className='border-b border-b-primary-light-200'>
            <div className='flex justify-between my-3'>
              <p className='text-grey' key={index}>{ticket.transaction_id}</p>
            </div>
        </div> 
        ))} */}
        <div className='border-b border-b-primary-light-200'>
          <div className='flex justify-between my-3'>
            <p className='text-grey'>{`Ticket (x${data.total_qty})`}</p>
            <p className='text-dark'>Rp{data.total_price.toLocaleString('id-ID')}</p>
          </div>
          {data.admin_fee && (
            <div className='flex justify-between my-3'>
              <p className='text-grey'>Biaya Admin</p>
              <p className='text-dark'>Rp{data.admin_fee.toLocaleString('id-ID')}</p>
            </div>
          )}
        </div>
        <div className='flex justify-between my-3 font-semibold'>
          <p className='text-dark text-[15px]'>Total</p>
          <p className='text-dark text-[15px]'>Rp{data.grandtotal.toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div className='max-w-xs mx-auto'>
  {data.transaction_status_id === 1 ? (
    <Button
      label='Lanjutkan Pembayaran'
      color='primary'
      className='mb-10 mt-5'
      fullWidth
      onClick={() => {
        if (data.xendit_url) {
          router.push(data.xendit_url);
        } else if (data.id) {
          router.push(`/payment/${data.id}`);
        } else {
          console.error('URL pembayaran atau ID tidak ditemukan');
        }
      }}
    />
  ) : data.transaction_status_id === 3 || data.transaction_status_id === 4 ? (
    <Button
      label='Kembali ke Event'
      color='secondary'
      className='my-10'
      fullWidth
      onClick={() => router.push('/event')}
    />
  ) : (
    <>
      <a
        href={`${Config.wsUrl}transaction-document/${invoice}`}
        className='block bg-primary-dark text-white text-center px-4 py-2 font-semibold rounded-md mb-5'
        target='_blank'
        rel='noopener noreferrer'
      >
        Lihat Tiket
      </a>
      <Button
        label='Kembali ke Home'
        color='secondary'
        className='mb-10'
        fullWidth
        onClick={() => router.push('/')}
      />
    </>
  )}
</div>

    </div>
  ) : (
    <Spinner color='primary' size='lg' className='min-h-screen flex items-center justify-center' />
  );
};

export default SuccessWithInvoice;
