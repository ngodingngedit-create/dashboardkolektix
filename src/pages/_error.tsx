import type { NextPage } from 'next';
import Logo from '@/assets/images/kolektix logo tansparant-blue.png';
import Link from 'next/link';
import Image from 'next/image';

const Error: NextPage<{ statusCode?: number }> = ({ statusCode }) => {
  console.log({ statusCode });
  return (
    <div className='min-h-screen text-dark flex flex-col gap-2 items-center justify-center'>
      <Image src={Logo} alt='Logo' className='w-20' />
      <h1 className='font-bold text-5xl'>{statusCode ? `${statusCode}` : '404'}</h1>
      <p className=''>
        {statusCode
          ? `We have an internal server error`
          : 'Sorry, this page does’nt exist or a client side error occured'}
      </p>
      <Link href='/' className='text-primary-base text-sm'>
        Back to Home
      </Link>
    </div>
  );
};

// various log checks
Error.getInitialProps = ({ res, err }) => {
  console.log('err', err);
  console.log('res', res);
  const clientSideError = res ? res.statusCode : Boolean(err);
  console.log({ clientSideError });
  console.log('server', Boolean(res));
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
