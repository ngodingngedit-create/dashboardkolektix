import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import Link from 'next/link';

const Success = () => {
  return (
    <div className='flex min-h-screen flex-col justify-center gap-5 px-10 items-center text-dark text-center pt-24 pb-20'>
      <FontAwesomeIcon icon={faCheckCircle} size='6x' className='text-[#06c258]' />

      <h1 className='text-[20px] text-center'>Event berhasil dibuat!</h1>
      <p>
        Event Anda saat ini sedang dalam proses review oleh tim admin kami. Kami akan memberitahu
        Anda segera setelah proses review selesai.
      </p>
      <br />
      <p>
        Salam hangat,
        <br />
        <b className='text-primary-base'>Teman Kolektix</b>
      </p>
      <Link href='/dashboard/my-event' className='text-primary-base text-medium mt-4'>
        Ke Dashboard
      </Link>
    </div>
  );
};

export default Success;
