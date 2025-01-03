import InputField from '@/components/Input';
import elips from '../../../assets/images/Ellipse 40.png';
import Cookies from 'js-cookie';
import imagePlus from '../../../assets/icon/image-plus.png';
import { Post } from '@/utils/REST';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { Spinner } from '@nextui-org/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation, faCheck } from '@fortawesome/free-solid-svg-icons';
import useLoggedUser from '@/utils/useLoggedUser';
import { UserProps } from '@/utils/globalInterface';
import { toast } from 'react-toastify';
import ModalOTP from '@/components/Modals/ModalOTP';
import { Flex, Image as ImageM } from '@mantine/core';
import photo1 from "@images/register-creator-1.png";
import photo2 from "@images/register-creator-2.png";
import { Guide } from '@/components/Guide';
import { notifications } from '@mantine/notifications';

interface FormCreator {
  image?: string;
  name_event_organizer: string;
  name: string;
  location: string;
  phone_number: string;
  email: string;
  user_id: number | null;
  category_id: number;
  status: string;
  latitude: string;
  longitude: string;
  website: string;
}

interface ErrorResponse {
  name_event_organizer?: string[];
  name?: string[];
  email?: string[];
  phone_number?: string[];
  location?: string[];
}

const Creator = () => {
  const router = useRouter();
  const [step, setStep] = useState({
    one: true,
    two: false,
    three: false,
    four: false,
    five: false,
  });
  const users = useLoggedUser();
  const [error, setError] = useState<ErrorResponse>({});
  const [otp, setOtp] = useState<string>('');
  const [userData, setUserData] = useState<UserProps | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [form, setForm] = useState<FormCreator>({
    image: '',
    name_event_organizer: '',
    name: '',
    location: '',
    phone_number: '',
    email: userData ? userData?.email ?? '' : '',
    user_id: userData ? userData?.id ?? 0 : null,
    status: 'active',
    category_id: 1,
    latitude: '1',
    longitude: '2',
    website: 'www.example.net',
  });
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
    Post('creator', form)
      .then((res: any) => {
        console.log(res);
        const user = { ...userData, has_creator: res.data };
        Cookies.set('user_data', JSON.stringify(user));
        router.push('/create-event').then(() => {
          window.location.reload();
        });
        toast.success('Akun creator anda berhasil dibuat');
        setLoading(false);
      })
      .catch((err: any) => {
        setOtp('');
        console.log(err);
        const errs = err.response.data.errors;
        setError(errs);
        console.log(errs);
        toast.error(err.response.data.message);
        setIsOpen(false);
        setLoading(false);
      });
  };

  const verifyRegister = () => {
    setLoading(true);
    Post('verify-register', { email: form.email, name: form.name_event_organizer, otp_code: otp })
      .then((res: any) => {
        console.log(res);
        Cookies.set('token', res.access_token);
        submit();
        setLoading(false);
      })
      .catch((err: any) => {
        setOtp('');
        console.log(err.response.data.message);
        setLoading(false);
      });
  };

  const submitRegister = () => {
    setLoading(true);
    Post('register', { email: form.email, name: form.name_event_organizer })
      .then((res: any) => {
        setIsOpen(true);
        setLoading(false);
        console.log(res);
      })
      .catch((err: any) => {
        setLoading(false);
        setError(err.response.data);
        toast.error('Form belum valid');
        console.log(err);
      });
  };

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_SIZE) {
        notifications.show({
          message: 'Maksimal ukuran gambar adalah 2MB',
          color: 'red',
        })
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setForm({ ...form, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const hasError = (field: keyof ErrorResponse) => {
    return error && error[field] && error[field]!.length > 0;
  };

  // useEffect(() => {
  //   console.log(userData);
  // }, []);

  return (
    <>
      <Image src={elips} className='w-full' alt='elips' quality={100} />

      <Flex gap={30} justify="space-evenly" align="end">
        <ImageM className={`!hidden md:!block`} src={photo1.src} w={photo1.width/11} />

        <div className='text-dark w-full px-[20px] md:w-fit py-10 flex flex-col items-center mt-4 sm:px-6 md:px-8 lg:px-0 '>
          <div className='text-start mb-8'>
            <h1 className='text-3xl font-semibold mb-2'>Memulai sebagai Creator</h1>
            <p className='text-grey'>Halo, silahkan isi detail creator dibawah ini ya!</p>
          </div>
          <ol className='relative text-gray-500 border-s-2 border-primary-light-200 ms-4 mx-2'>
            <li className='mb-10 ms-8 list-none'>
              <div className='flex items-center '>
                <button
                  className={`absolute flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary-base hover:text-white transition-colors -start-4 ring-white ${
                    hasError('name_event_organizer') || hasError('name')
                      ? 'bg-red-600'
                      : step.one
                      ? 'bg-primary-dark text-white'
                      : 'bg-primary-light-200 text-primary-dark'
                  }  disabled:bg-primary-light-200`}
                  onClick={() => setStep({ ...step, one: !step.one })}
                >
                  {!step.one && form.name_event_organizer !== '' && form.name !== '' ? (
                    <FontAwesomeIcon icon={faCheck} className='text-primary-dark' />
                  ) : (hasError('name_event_organizer') || hasError('name')) && !step.one ? (
                    <FontAwesomeIcon icon={faExclamation} className='text-white' />
                  ) : (
                    1
                  )}
                </button>

                <div>
                  <h3 className='font-bold text-sm leading-tight mb-2'>
                    Masukkan detail penyelenggara
                  </h3>
                  {error.name && <p className='text-danger text-xs'>* {error.name}</p>}
                  {error.name_event_organizer && (
                    <p className='text-danger text-xs'>* {error.name_event_organizer}</p>
                  )}
                </div>
              </div>
              <Guide guidekey={'create-creator'} text={'Masukkan detail penyelenggara'} order={0} opened={step.one}>
              <div
                className={`my-2 flex flex-col gap-5 items-start transition-all ease-in-out delay-200 overflow-hidden ${
                  step.one ? 'h-40' : 'h-0'
                }`}
              >
                <InputField
                  size='sm'
                  type='text'
                  // className='border-primary-light-200 text-sm px-2 py-1.5 border-2 focus:outline-primary-disabled rounded-md w-80'
                  placeholder='Nama Penyelengara Event, Misal: javamusikindo'
                  onChange={(e) => setForm({ ...form, name_event_organizer: e.target.value })}
                />

                <InputField
                  size='sm'
                  type='text'
                  // className='border-primary-light-200 text-sm px-2 py-1.5 border-2 focus:outline-primary-disabled rounded-md w-80'
                  placeholder='Nama Pemilik'
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <button
                  className={`${!form.name || !form.name_event_organizer ? '!pointer-events-none opacity-50' : ''} text-sm px-8 py-1.5  bg-primary-base text-white rounded-md hover:bg-primary-dark transition-all ${
                    !step.two ? 'visible' : 'invisible'
                  }`}
                  onClick={() => setStep({ ...step, one: !step.one, two: !step.two })}
                >
                  Lanjut
                </button>
              </div>
              </Guide>
            </li>
            <li className='mb-10 ms-8 list-none'>
              <div className='flex items-center'>
                <button
                  className={`absolute flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary-base hover:text-white transition-colors -start-4 ring-4 ring-white ${
                    hasError('location')
                      ? 'bg-red-600'
                      : step.two
                      ? 'bg-primary-dark text-white'
                      : 'bg-primary-light-200 text-primary-dark'
                  }  disabled:bg-primary-light-200`}
                  onClick={() => setStep({ ...step, two: !step.two })}
                >
                  {!step.two && form.location !== '' ? (
                    <FontAwesomeIcon icon={faCheck} className='text-primary-dark' />
                  ) : hasError('location') && !step.two ? (
                    <FontAwesomeIcon icon={faExclamation} className='text-white' />
                  ) : (
                    2
                  )}
                </button>
                <div>
                  <h3 className='font-bold text-sm leading-tight mb-2'>
                    Masukkan alamat lokasi creator
                  </h3>
                  {error.location && <p className='text-danger text-xs'>* {error.location}</p>}
                </div>
              </div>
              <div
                className={`my-2 flex flex-col gap-5 items-start transition-all ease-in-out delay-200 overflow-hidden ${
                  step.two ? 'h-28' : 'h-0'
                }`}
              >
                <Guide guidekey={'create-creator'} text={'Masukan Kota Asal Creator seperti Jakarta/Bandung'} order={1} opened={step.two}>
                  <InputField
                    size='sm'
                    type='text'
                    // className='border-primary-light-200 text-sm px-2 py-1.5 border-2 focus:outline-primary-disabled rounded-md w-80'
                    placeholder='Misalnya Jakarta'
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </Guide>

                <button
                  className={`${!form.location ? '!pointer-events-none opacity-50' : ''} text-sm px-8 py-1.5 bg-primary-base text-white rounded-md hover:bg-primary-dark transition-all ${
                    !step.three ? 'visible' : 'invisible'
                  }`}
                  onClick={() => setStep({ ...step, two: !step.two, three: !step.three })}
                >
                  Lanjut
                </button>
              </div>
            </li>
            <li className='mb-8 ms-8 list-none'>
              <div className='flex items-center'>
                <button
                  onClick={() => setStep({ ...step, three: !step.three })}
                  className={`absolute flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary-base hover:text-white transition-colors -start-4 ring-4 ring-white ${
                    hasError('phone_number')
                      ? 'bg-red-600'
                      : step.three
                      ? 'bg-primary-dark text-white'
                      : 'bg-primary-light-200 text-primary-dark'
                  } disabled:bg-primary-light-200`}
                >
                  {!step.three && form.phone_number !== '' ? (
                    <FontAwesomeIcon icon={faCheck} className='text-primary-dark' />
                  ) : hasError('phone_number') && !step.two ? (
                    <FontAwesomeIcon icon={faExclamation} className='text-white' />
                  ) : (
                    3
                  )}
                </button>
                <div>
                  <h3 className='font-bold text-sm leading-tight mb-2'>
                    Masukkan no. telepon / handphone
                  </h3>
                  {error.phone_number && (
                    <p className='text-danger text-xs'>* {error.phone_number}</p>
                  )}
                </div>
              </div>
              <div
                className={`my-2 flex flex-col gap-5 items-start transition-all ease-in-out delay-200 overflow-hidden ${
                  step.three ? 'h-28' : 'h-0'
                }`}
              >
                <Guide guidekey={'create-creator'} text={'Masukan No.Telp yang dapat dihubungi'} order={2} opened={step.three}>
                  <InputField
                    size='sm'
                    type='number'
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value.replaceAll(/\D/g, '').replace(/^(?!0|6)(\d+)/, '628$1').replace(/^(0)/, '62') })}
                    placeholder='Contoh: 08123456789'
                  />
                </Guide>

                <button
                  className={`${!form.phone_number ? '!pointer-events-none opacity-50' : ''} text-sm px-8 py-1.5 bg-primary-base text-white rounded-md hover:bg-primary-dark transition-all ${
                    !step.four ? 'visible' : 'invisible'
                  }`}
                  onClick={() => setStep({ ...step, three: !step.three, four: !step.four })}
                >
                  Lanjut
                </button>
              </div>
            </li>
            <li className='mb-8 ms-8 list-none'>
              <div className='flex items-center'>
                <button
                  onClick={() => setStep({ ...step, four: !step.four })}
                  className={`absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white ${
                    step.four
                      ? 'bg-primary-dark text-white'
                      : 'bg-primary-light-200 text-primary-dark'
                  } hover:bg-primary-base hover:text-white transition-colors`}
                >
                  {!step.four && form.image !== '' ? (
                    <FontAwesomeIcon icon={faCheck} className='text-primary-dark' />
                  ) : (
                    4
                  )}
                </button>
                <h3 className='font-bold text-sm leading-tight mb-2'>
                  Masukkan image / logo creator
                </h3>
              </div>
              <div
                className={`my-2 flex flex-col gap-5 items-start transition-all ease-in-out delay-200 overflow-hidden ${
                  step.four ? 'h-40' : 'h-0'
                }`}
              >
                <Guide guidekey={'create-creator'} text={'Image size 512px x 512px & Max 2MB'} order={3} opened={step.four}>
                  <label className='w-60 border-2 border-primary-light-200 rounded-lg border-dashed bg-primary-light flex flex-col items-center justify-center h-24 gap-4 cursor-pointer'>
                    <input type='file' className='hidden' onChange={handleFile} accept='.jpg,.jpeg,.png' />
                    {image ? (
                      <Image
                        src={image}
                        alt='image'
                        className='object-contain'
                        width={0}
                        height={0}
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <>
                        <Image src={imagePlus} alt='image-plus' />
                        <h3 className='font-semibold text-medium text-center'>Unggah logo creator</h3>
                      </>
                    )}
                  </label>
                </Guide>
                <button
                  className={`${!form.image ? '!pointer-events-none opacity-50' : ''} text-sm px-8 py-1.5 bg-primary-base text-white rounded-md hover:bg-primary-dark transition-all ${
                    !step.five ? 'visible' : 'invisible'
                  }`}
                  onClick={() => setStep({ ...step, four: !step.four, five: !step.five })}
                >
                  Lanjut
                </button>
              </div>
            </li>
            <li className='ms-8 list-none'>
              <div className='flex items-center'>
                <button
                  onClick={() => setStep({ ...step, five: !step.five })}
                  className={`absolute flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary-base hover:text-white transition-colors -start-4 ring-4 ring-white ${
                    hasError('email')
                      ? 'bg-red-600'
                      : step.five
                      ? 'bg-primary-dark text-white'
                      : 'bg-primary-light-200 text-primary-dark'
                  } disabled:bg-primary-light-200`}
                >
                  {step.five && form.email !== '' ? (
                    <FontAwesomeIcon icon={faCheck} className='text-primary-dark' />
                  ) : hasError('email') && !step.two ? (
                    <FontAwesomeIcon icon={faExclamation} className='text-white' />
                  ) : (
                    5
                  )}
                </button>
                <div>
                  <h3 className='font-bold text-sm leading-tight mb-2'>Masukkan email</h3>
                  {error.email && <p className='text-danger text-xs'>* {error.email}</p>}
                </div>
              </div>
              <div
                className={`my-2 flex flex-col gap-2 items-start transition-all ease-in-out delay-200 overflow-hidden ${
                  step.five ? 'h-28' : 'h-0'
                }`}
              >
                <Guide guidekey={'create-creator'} text={'Masukan Email creator'} order={4} opened={step.five}>
                  <InputField
                    size='sm'
                    type='text'
                    // className='border-primary-light-200 text-sm px-2 py-1.5 border-2 focus:outline-primary-disabled rounded-md w-80'
                    placeholder='Contoh: johndoe@xxxx.com'
                    disabled={userData?.email !== undefined}
                    value={userData?.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Guide>
                {users?.name ? (
                  <button
                    className={`${!form.email && userData?.email? '!pointer-events-none opacity-50' : ''} text-sm px-8 py-1.5 bg-primary-base text-white rounded-md my-3 hover:bg-primary-dark transition-all disabled:bg-primary-disabled disabled:cursor-not-allowed`}
                    disabled={loading}
                    onClick={submit}
                  >
                    Lanjut {loading && <Spinner color='default' size='sm' />}
                  </button>
                ) : (
                  <button
                    className={`${!form.email && userData?.email? '!pointer-events-none opacity-50' : ''} text-sm px-8 py-1.5 bg-primary-base text-white rounded-md my-3 hover:bg-primary-dark transition-all disabled:bg-primary-disabled disabled:cursor-not-allowed`}
                    disabled={loading}
                    onClick={submitRegister}
                  >
                    Lanjut {loading && <Spinner color='default' size='sm' />}
                  </button>
                )}
              </div>
            </li>
          </ol>
        </div>

        <ImageM className={`!hidden md:!block`} src={photo2.src} w={photo2.width/11} />
      </Flex>
      <ModalOTP
        isOpen={isOpen}
        onSubmit={verifyRegister}
        setIsOpen={setIsOpen}
        email={form.email}
        otp={otp}
        setOtp={setOtp}
        loading={loading}
      />
    </>
  );
};

export default Creator;
