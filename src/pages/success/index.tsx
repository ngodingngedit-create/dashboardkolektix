import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import useLoggedUser from '@/utils/useLoggedUser';
import Link from 'next/link';
import Cookies from 'js-cookie';

const Success = () => {
  const userData = useLoggedUser();
  return (
    <div className='flex min-h-screen flex-col justify-center gap-5 px-10 items-center text-dark text-center pt-24 pb-20'>
      <FontAwesomeIcon icon={faCheckCircle} size='6x' className='text-[#06c258]' />
      {userData && (
        <h3 className=' text-[22px] text-center'>
          Dear <span className='font-semibold text-primary-base'>{userData.name}</span>
        </h3>
      )}
      <h1 className='text-[20px] text-center'>
        Terima Kasih Telah Melakukan order di Kolektix.com!
      </h1>
      <p>
        Silahkan cek email anda untuk memastikan status pembelian, pembayaran yang berhasil di
        verifikasi dapat melakukan download e-ticket melalui email
      </p>
      <br />
      <p>
        Salam hangat,
        <br />
        <b className='text-primary-base'>Teman Kolektix</b>
      </p>
      <Link href='/dashboard/my-ticket' className='text-primary-base text-medium mt-4'>
        Ke Dashboard
      </Link>
    </div>
  );
};

export default Success;
