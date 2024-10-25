import { useState } from 'react';
import QrCheckout from '@/components/QrCheckout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface SuccessCheckoutData {
  invoice_no: string;
  total_qty: string;
  event_name: string;
  name: string | null;
  category_ticket: string;
}

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SuccessCheckoutData | null>(null);
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div className='flex items-center justify-center min-h-screen bg-black bg-opacity-70'>
      <div className='bg-white rounded-lg shadow-lg p-6 max-w-md w-full'>
        <h1 className='text-xl font-semibold mb-4 text-dark'>Checkout</h1>

        {/* QR Scanner for Checkout */}
        <QrCheckout
          isOpen={true}
          step={step}
          setStep={setStep}
          setData={setData}
        />

        {step === 1 && data && (
          <div className='flex flex-col gap-3 py-4 px-6'>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle}
                size='3x'
                className='text-[#06c258] mb-3'
              />
              <h6 className=''>Checkout Berhasil</h6>
              <p className='text-grey'>Tiket berhasil divalidasi</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-grey text-xs'>Nama Pembeli</p>
              <p>{data.name}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-grey text-xs'>Kode Tiket</p>
              <p>{data.invoice_no}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-grey text-xs'>Jenis Tiket</p>
              <p>{data.category_ticket}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-grey text-xs'>Total Tiket</p>
              <p>{data.total_qty} Tiket</p>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className='flex flex-col gap-3 py-4 px-6'>
            <div className='flex flex-col rounded-full border-3 border-danger w-10 h-10 items-center justify-center'>
              <FontAwesomeIcon icon={faXmark} size='xl' className='text-danger' />
            </div>
            <h6>Checkout Gagal</h6>
            <p className='text-grey'>Tiket gagal divalidasi silahkan coba kembali</p>
            <div className='flex justify-end my-2'>
              <button
                className='bg-secondary text-white py-2 px-4 rounded-full'
                onClick={() => window.history.back()} // or use routing to go back
              >
                Scan Ulang
              </button>
            </div>
          </div>
        )}

        {step > 0 && (
          <div className='border-t border-t-primary-light-200 pt-4'>
            <div className='flex items-center w-full gap-2'>
              <button
                className='bg-primary text-white py-2 px-4 rounded-full flex-1'
                onClick={() => {
                  setStep(0);
                  setData(null); // Reset data if needed
                }}
              >
                Checkout Lainnya
              </button>
              <button
                className='bg-secondary text-white py-2 px-4 rounded-full flex-1'
                onClick={() => window.history.back()} // or use routing to go back
              >
                Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
