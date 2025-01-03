import React, { useEffect, useState } from 'react';
import Logo from '@images/kolektix logo tansparant-blue.png';
import LogoWhite from '@images/logo.png';
import OTPInput from 'react-otp-input';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import useLoggedUser from '@/utils/useLoggedUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { Spinner } from '@nextui-org/react';
import { Get, Post } from '@/utils/REST';
import { toast } from 'react-toastify';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import { PasswordInput, TextInput } from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import { UserProps } from '@/utils/globalInterface';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
  otp_code: string;
}

interface ErrorRegisterProps {
  [key: string]: string[];
}

const Form = ({
  placeholder,
  label,
  onChange,
  value,
  type,
}: {
  placeholder: string;
  label?: string;
  onChange?: (e: any) => void;
  value?: string;
  type?: string;
}) => {
  return (
    <div>
      <label htmlFor='email' className='block mb-2 ml-1 text-[12px] font-medium text-dark'>
        {label}
        <input
          type={type ? type : 'text'}
          name=''
          id=''
          placeholder={placeholder}
          value={value}
          className='bg-[#e2edfc] py-2 px-3 text-xs w-full text-dark rounded-full'
          onChange={onChange}
        />{' '}
      </label>
    </div>
  );
};

const Auth = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [otp, setOtp] = useState<string>('');
  const [data, setData] = useSetState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirm: '',
    otp_code: '',
  });
  const [imageOpacity, setImageOpacity] = useState<number>(0);
  const [errors, setErrors] = useSetState<Partial<RegisterForm & { message: string; error: string; }>>({});
  const [errorRegister, setErrorRegister] = useState<ErrorRegisterProps>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [countdownEndTime, setCountdownEndTime] = useState<Date | null>(null);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);
  const users = useLoggedUser();

  const ticketCount = Cookies.get('ticketCount');
  const prevPath = Cookies.get('prevPath');

  useEffect(() => {
    if (users?.id) {
      router.push('/');
      toast.warning('Anda Sudah Login');
    }
    //eslint-disable-next-line
  }, [users]);

  const Completionist = () => (
    <button
      className='text-dark w-full rounded-full p-2 text-xs font-semibold flex items-center gap-2 hover:text-primary-base'
      onClick={handleResendOtp}
    >
      Kirim Ulang
    </button>
  );

  const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
    if (completed) {
      setCountdownActive(false);
    } else {
      return (
        <span className='text-dark w-full text-center'>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      );
    }
  };

  const handleResendOtp = () => {
    setCountdownEndTime(new Date(Date.now() + 120000));
    setCountdownActive(true);
    login();
  };

  useEffect(() => {
    setErrors({
      name: undefined,
      email: undefined,
      password: undefined,
      password_confirm: undefined,
      otp_code: undefined,
      message: undefined,
      error: undefined,
    })
  }, [data, step]);

  const submitRegister = (event?: React.FormEvent) => {
    event?.preventDefault();

    if (data.name == '') setErrors({ name: 'Wajib Diisi' });
    if (data.email == '') setErrors({ email: 'Wajib Diisi' });
    if (data.password == '') setErrors({ password: 'Wajib Diisi' });
    if (data.password.length < 8) setErrors({ password: 'Minimal 8 Karakter' });
    if (data.password != data.password_confirm) setErrors({ password_confirm: 'Password Tidak Sama' });
    if (Object.values(errors).filter(e => !!e).length > 0) return;

    setLoading(true);
    Post('register-auth', data)
      .then((res: any) => {
        setLoading(false);
        setCountdownEndTime(new Date(Date.now() + 120000));
        setCountdownActive(true);
        setStep(3);
        console.log(res);
      })
      .catch((err: any) => {
        setLoading(false);
        console.log(err);
        setErrors(err.response.data);
      });
  };

  const getPermission = async () => {
    const res = (await Get('permissions', {})) as any;
    await Cookies.set('permissions', JSON.stringify(res.data));
  }

  const login = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (data.email == '') setErrors({ email: 'Wajib Diisi' });
    if (data.password == '') setErrors({ password: 'Wajib Diisi' });
    if (Object.values(errors).filter(e => !!e).length > 0) return;

    setLoading(true);
    Post('login-auth', data)
      .then(async (res: any) => {
        await getPermission();
        setLoading(false);
        // setCountdownEndTime(new Date(Date.now() + 120000));
        // setCountdownActive(true);
        // setStep(2);

        Cookies.set('token', res.access_token);
        const role: UserProps['role'] = res?.user_access?.some((e: any) => e?.has_role?.name == 'Admin') ? 'Admin' : 'Staff';
        Cookies.set('user_data', JSON.stringify({
          ...(res?.data ?? {}),
          force_creator: true,
          role,
          ...(res?.user_access ? {
            has_creator: res?.user_access[0]?.has_parent?.has_creator
          } : {})
        }));
        setLoading(false);
        router.push(role == 'Admin' ? '/dashboard/admin' : '/dashboard');
      })
      .catch((err: any) => {
        if (err.response.status === 401) {
          toast.error('Email belum terdaftar. Silahkan registrasi terlebih dahulu');
          setStep(1);
        }
        setErrors(err.response.data);
        setLoading(false);
      });
  };

  const verifyRegister = () => {
    setLoading(true);
    Post('verify-register', data)
      .then((res: any) => {
        console.log(res);
        Cookies.set('token', res.access_token);
        Cookies.set('user_data', JSON.stringify({...res.data, force_creator: true, role: 'Staff' }));
        setLoading(false);
        router.push('/dashboard');
      })
      .catch((err: any) => {
        setOtp('');
        console.log(err.response.data.message);
        setErrors(err.response.data);
        setLoading(false);
      });
  };

  const verifyLogin = () => {
    setLoading(true);
    Post('verify-login', data)
      .then((res: any) => {
        console.log(res);
        Cookies.set('token', res.access_token);
        Cookies.set('user_data', JSON.stringify({...res.data, force_creator: true, role: 'Staff' }));
        Cookies.set('bookmarked', JSON.stringify(res.bookmarked));
        setLoading(false);
        router.push('/dashboard');
      })
      .catch((err: any) => {
        setOtp('');
        console.log(err.response.data.error);
        setErrors(err.response.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    setImageOpacity(1);
  }, []);

  const [displayedText, setDisplayedText] = useState<string>('');

  useEffect(() => {
    setImageOpacity(1);
  }, []);

  useEffect(() => {
    const text = 'Masa Depan Tongkrongan';
    let index = 0;

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[index - 1]);
      index += 1;
      if (index === text.length) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setData({ ...data, otp_code: otp });
    //eslint-disable-next-line
  }, [otp]);

  return (
    <div className='flex min-h-screen justify-center items-center bg-primary-base px-5 !py-4 md:px-20'>
      <div className='lg:w-1/2 xs:hidden md:flex flex-col justify-center items-center gap-8'>
        <Image
          src={LogoWhite}
          alt='logo'
          style={{ opacity: imageOpacity, transition: 'opacity 1.5s ease-in-out' }}
        />
        <h3 className={`text-white`}>{displayedText}</h3>
      </div>
      <div className='sm:w-full lg:max-w-[450px] flex flex-col justify-center items-center lg:px-10 max-w-xl'>
        <div className='bg-white rounded-2xl flex flex-col justify-center w-full pt-6 pb-2 px-6'>
          {step === 0 && (
            <div
              className={`flex flex-col justify-center items-center transition-opacity duration-100 ${
                step === 0 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image src={Logo} alt='Logo' className='w-1/2' />
              <h2 className='text-dark font-semibold text-xl mt-4 text-center'>Masuk sebagai Creator/Staff</h2>
              <div className='flex'>
                <p className='text-grey text-[12px] mb-2 text-center'>
                  Masukan akunmu yang sudah terdaftar sebagai Creator/Staff, 
                  <span
                    className='cursor-pointer text-primary-base font-semibold'
                    onClick={() => {
                      setStep(1);
                    }}
                  >
                    {' '}
                    Daftar Akun
                  </span>
                </p>
              </div>
              <div className='flex flex-col w-full mt-2'>
                <form onSubmit={login}>
                  <TextInput
                    labelProps={{ size: 'xs' }}
                    label="Email"
                    placeholder='Masukan Email'
                    mb={10}
                    value={data.email}
                    onChange={e => setData({ email: e.target.value })}
                    error={errors.email}
                  />
                  <PasswordInput
                    labelProps={{ size: 'xs' }}
                    label="Password"
                    placeholder="Masukan Password"
                    value={data.password}
                    onChange={e => setData({ password: e.target.value })}
                    error={errors.password}
                  />
                  {/* <Form
                    placeholder='Alamat Email'
                    onChange={(e: any) => setData({ ...data, email: e.target.value })}
                  /> */}
                  {errors && <p className='text-danger text-[10px] mt-1'>{errors.message}</p>}
                  <button
                    className='bg-primary-base text-white w-full rounded-full p-2 text-xs my-4 flex items-center justify-center disabled:bg-primary-disabled'
                    type='submit'
                    onClick={login}
                    disabled={loading}
                  >
                    {loading ? <Spinner color='default' size='sm' /> : 'Selanjutnya'}
                  </button>
                </form>
              </div>
            </div>
          )}
          {step === 1 && (
            <div
              className={`transition-opacity duration-300 opacity-0 ${step === 1 && 'opacity-100'}`}
            >
              <div className='flex justify-center flex-col items-center'>
                <Image src={Logo} alt='Logo' className='w-1/3 mb-[20px]' />
                <h2 className='text-dark font-semibold text-xl mt-2'>Daftar Akun Staff</h2>
                <div className='flex'>
                  <p className='text-grey text-sm text-center mb-3'>
                    Sudah punya akun?
                    <span
                      className='cursor-pointer text-primary-base font-semibold'
                      onClick={() => {
                        setStep(0);
                      }}
                    >
                      {' '}
                      Masuk
                    </span>
                  </p>
                </div>
              </div>
              <div className='flex flex-col w-full px-5'>
                <div>
                  <TextInput
                    labelProps={{ size: 'xs' }}
                    label="Nama Lengkap"
                    placeholder='Masukan Nama Lengkap'
                    mb={10}
                    value={data.name}
                    onChange={e => setData({ name: e.target.value })}
                    error={errors.name}
                  />
                </div>
                <div>
                  <TextInput
                    labelProps={{ size: 'xs' }}
                    label="Email"
                    placeholder='Masukan Email'
                    mb={10}
                    value={data.email}
                    onChange={e => setData({ email: e.target.value })}
                    error={errors.email}
                  />
                  <PasswordInput
                    labelProps={{ size: 'xs' }}
                    label="Password"
                    placeholder="Masukan Password"
                    value={data.password}
                    onChange={e => setData({ password: e.target.value })}
                    error={errors.password}
                  />
                  <PasswordInput
                    mt={10}
                    labelProps={{ size: 'xs' }}
                    label="Konfirmasi Password"
                    placeholder="Masukan Konfirmasi Password"
                    value={data.password_confirm}
                    onChange={e => setData({ password_confirm: e.target.value })}
                    error={errors.password_confirm}
                  />
                </div>
                {/* <div>
                  <Form
                    placeholder='Password'
                    label='Password'
                    type='password'
                    onChange={(e: any) => setData({ ...data, password: e.target.value })}
                  />
                  {errors.password &&
                    errors.password.map((error: string, index: number) => (
                      <p key={index} className='text-red-500 text-[10px] '>
                        {error}
                      </p>
                    ))}
                </div>
                <div>
                  <Form
                    placeholder='Konfirmasi Password'
                    label='Konfirmasi Password'
                    type='password'
                    onChange={(e: any) =>
                      setData({ ...data, password_confirmation: e.target.value })
                    }
                  />
                  {errors.password_confirmation &&
                    errors.password_confirmation.map((error: string, index: number) => (
                      <p key={index} className='text-red-500 text-[10px]'>
                        {error}
                      </p>
                    ))}
                </div> */}

                <button
                  className='bg-primary-base mt-[20px] mb-[20px] text-white w-full rounded-full p-2 text-xs'
                  onClick={submitRegister}
                >
                  {loading ? <Spinner color='default' size='sm' /> : 'Selanjutnya'}
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div
              className={`flex flex-col justify-center items-center transition-opacity duration-100 gap-4 ${
                step === 2 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className='text-primary-base font-semibold text-center'>
                Verifikasi melalui email
              </p>
              <p className='text-dark text-xs font-semibold text-center px-5'>
                Mohon periksa Email kamu. Kami telah mengirimkan kode ke{' '}
                <span className='text-primary-base'>{data.email}</span>
              </p>
              <OTPInput
                value={otp}
                onChange={setOtp}
                inputType='tel'
                numInputs={6}
                renderSeparator={<span>-</span>}
                renderInput={(props) => <input {...props} />}
                containerStyle={{ width: '80%' }}
                inputStyle={{
                  border: '1px solid grey ',
                  borderRadius: '8px',
                  width: '100%',
                  height: '40px',
                  fontSize: '20px',
                  color: '#000',
                  fontWeight: '400',
                }}
              />
              {errors && <p className='text-danger text-[12px] mt-1'>{errors.error}</p>}
              <div className='flex flex-col items-center w-full'>
                {countdownEndTime && countdownActive && (
                  <Countdown date={countdownEndTime} renderer={renderer} />
                )}
                {countdownActive ? (
                  <button
                    className='bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled'
                    onClick={verifyLogin}
                    disabled={loading || otp.length < 6}
                  >
                    {loading ? <Spinner color='default' size='sm' /> : 'Verifikasi'}
                  </button>
                ) : (
                  <button
                    className='bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled'
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    {loading ? <Spinner color='default' size='sm' /> : 'Kirim Ulang Kode'}
                  </button>
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div
              className={`flex flex-col justify-center items-center transition-opacity duration-100 gap-5 ${
                step === 3 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className='text-primary-base font-semibold text-center'>
                Verifikasi melalui email
              </p>
              <p className='text-dark text-xs font-semibold text-center'>
                Mohon periksa Email kamu. Kami telah mengirimkan kode ke {data.email}
              </p>
              <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                inputType='tel'
                renderSeparator={<span>-</span>}
                renderInput={(props) => <input {...props} />}
                containerStyle={{ width: '80%' }}
                inputStyle={{
                  border: '1px solid grey ',
                  borderRadius: '8px',
                  width: '100%',
                  height: '40px',
                  fontSize: '20px',
                  color: '#000',
                  fontWeight: '400',
                }}
              />
              {errors && <p className='text-danger text-[10px] mt-1'>{errors.error}</p>}

              <div className='flex flex-col items-center w-full'>
                {countdownEndTime && countdownActive && (
                  <Countdown date={countdownEndTime} renderer={renderer} />
                )}
                {countdownActive ? (
                  <button
                    className='bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled'
                    onClick={verifyRegister}
                    disabled={loading || otp.length < 6}
                  >
                    {loading ? <Spinner color='default' size='sm' /> : 'Verifikasi'}
                  </button>
                ) : (
                  <button
                    className='bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled'
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    {loading ? <Spinner color='default' size='sm' /> : 'Kirim Ulang'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
