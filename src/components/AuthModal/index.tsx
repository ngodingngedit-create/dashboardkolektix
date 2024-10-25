import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from '@nextui-org/react';
import OTPInput from 'react-otp-input';
import Image from 'next/image';
import Logo from '@images/kolektix logo tansparant-blue.png';
import LogoWhite from '@images/logo.png';
import { Post } from '@/utils/REST';
import { toast } from 'react-toastify';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import useLoggedUser from '@/utils/useLoggedUser';

interface RegisterForm {
  name: string;
  email: string;
  otp_code: string;
}

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [otp, setOtp] = useState<string>('');
  const [data, setData] = useState<RegisterForm>({ name: '', email: '', otp_code: '' });
  const [errors, setErrors] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [countdownEndTime, setCountdownEndTime] = useState<Date | null>(null);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);
  const users = useLoggedUser();

  const ticketCount = Cookies.get('ticketCount');
  const prevPath = Cookies.get('prevPath');

  const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
    if (completed) {
      setCountdownActive(false);
      return <span className='text-dark w-full text-center'>00:00</span>;
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

  const submitRegister = () => {
    setLoading(true);
    Post('register', data)
      .then((res: any) => {
        setLoading(false);
        setCountdownEndTime(new Date(Date.now() + 120000));
        setCountdownActive(true);
        setStep(3);
      })
      .catch((err: any) => {
        setLoading(false);
        setErrors(err.response.data);
      });
  };

  const login = () => {
    setLoading(true);
    Post('login', data)
      .then((res: any) => {
        setLoading(false);
        setCountdownEndTime(new Date(Date.now() + 120000));
        setCountdownActive(true);
        setStep(2);
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

  const verifyLogin = () => {
    setLoading(true);
    Post('verify-login', data)
      .then((res: any) => {
        Cookies.set('token', res.access_token);
        Cookies.set('user_data', JSON.stringify(res.data));
        setLoading(false);
        window.location.reload();
      })
      .catch((err: any) => {
        setOtp('');
        setErrors(err.response.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    setData({ ...data, otp_code: otp });
  }, [otp]);

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalHeader>
        <Image src={LogoWhite} alt='Logo' width={100} />
      </ModalHeader>
      <ModalContent>
        <ModalBody>
          <div className='flex flex-col items-center'>
            {step === 0 && (
              <div className='flex flex-col items-center w-full'>
                <Image src={Logo} alt='Logo' className='w-1/3 mb-4' />
                <h2 className='text-dark font-semibold text-2xl'>Masuk ke akunmu</h2>
                <p className='text-grey text-sm text-center my-2'>
                  Belum memiliki akun di Kolektix?{' '}
                  <span className='cursor-pointer text-primary-base font-semibold' onClick={() => setStep(1)}>
                    Daftar
                  </span>
                </p>
                <Form
                  label='Alamat Email'
                  type='email'
                  placeholder='Alamat Email'
                  onChange={(e: any) => setData({ ...data, email: e.target.value })}
                />
                {errors && <p className='text-danger text-xs mt-1'>{errors.message}</p>}
                <Button color="primary" onClick={login} disabled={loading} className='mt-4 w-full'>
                  {loading ? <Spinner color='default' size='sm' /> : 'Selanjutnya'}
                </Button>
              </div>
            )}
            {step === 1 && (
              <div className='flex flex-col items-center w-full'>
                <Image src={Logo} alt='Logo' className='w-1/3 mb-4' />
                <h2 className='text-dark font-semibold text-2xl'>Daftar di Kolektix</h2>
                <p className='text-grey text-sm text-center mb-3'>
                  Sudah punya akun Kolektix?{' '}
                  <span className='cursor-pointer text-primary-base font-semibold' onClick={() => setStep(0)}>
                    Masuk
                  </span>
                </p>
                <Form
                  label='Nama Lengkap'
                  placeholder='Nama Lengkap'
                  onChange={(e: any) => setData({ ...data, name: e.target.value })}
                />
                {errors.name && errors.name.map((error: string, index: number) => (
                  <p key={index} className='text-red-500 text-xs'>{error}</p>
                ))}
                <Form
                  label='Email'
                  placeholder='Email'
                  value={data.email}
                  onChange={(e: any) => setData({ ...data, email: e.target.value })}
                />
                {errors.email && errors.email.map((error: string, index: number) => (
                  <p key={index} className='text-red-500 text-xs'>{error}</p>
                ))}
                <Button color="primary" onClick={submitRegister} disabled={loading} className='mt-4 w-full'>
                  {loading ? <Spinner color='default' size='sm' /> : 'Daftar'}
                </Button>
              </div>
            )}
            {step === 2 && (
              <div className='flex flex-col items-center w-full'>
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
                  containerStyle={{ width: '80%', marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}
                  inputStyle={{
                    width: '1.5em',
                    height: '2em',
                    margin: '0 0.25em',
                    fontSize: '1.5em',
                    borderRadius: '0.25em',
                    border: '2px solid #ddd',
                    textAlign: 'center',
                    transition: 'border-color 0.2s',
                    color: 'black',
                    
                  }}
                />
                {errors.otp_code && errors.otp_code.map((error: string, index: number) => (
                  <p key={index} className='text-red-500 text-xs'>{error}</p>
                ))}
                <div className='flex flex-col items-center'>
                  {countdownActive && countdownEndTime && (
                    <Countdown
                      date={countdownEndTime}
                      renderer={renderer}
                      zeroPadTime={2}
                      onComplete={() => setCountdownActive(false)}
                    />
                  )}
                  <Button color="primary" onClick={handleResendOtp} disabled={countdownActive} className='mt-2'>
                    Kirim Ulang
                  </Button>
                </div>
                <Button color="primary" onClick={verifyLogin} disabled={loading} className='mt-4 w-full'>
                  {loading ? <Spinner color='default' size='sm' /> : 'Verifikasi'}
                </Button>
              </div>
            )}
            {step === 3 && (
              <div className='flex flex-col items-center w-full'>
                <p className='text-dark text-lg font-semibold'>Pendaftaran Berhasil!</p>
                <p className='text-grey text-sm text-center'>
                  Anda telah berhasil mendaftar. Klik tombol di bawah untuk masuk.
                </p>
                <Button color="primary" onClick={() => setStep(0)} className='mt-4 w-full'>
                  Masuk
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

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
    <div className='w-full mb-4'>
      <label className='block mb-1 text-sm font-medium text-dark'>
        {label}
        <input
          type={type || 'text'}
          placeholder={placeholder}
          value={value}
          className='bg-[#e2edfc] py-2 px-3 text-xs w-full text-dark rounded-full border border-transparent focus:border-primary-base focus:outline-none'
          onChange={onChange}
        />
      </label>
    </div>
  );
};

export default AuthModal;
