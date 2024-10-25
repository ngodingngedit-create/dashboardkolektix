import { useState } from 'react';
import QrScanner from '@/components/QrScanner';
import QrCheckout from '@/components/QrCheckout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import Button from '@/components/Button';
import { Post } from '@/utils/REST';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface SuccessCheckinData {
  invoice_no: string;
  total_qty: string;
  event_name: string;
  name: string | null;
  category_ticket: string;
  eticket_number: string;
}

export default function CheckinPage() {
  const [selected, setSelected] = useState<'qr' | 'manual' | 'checkout'>('qr');
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SuccessCheckinData | null>(null);
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const router = useRouter();
  const { slug } = router.query;

  const handleManualSubmit = () => {
    Post('eticket/checkin', { eticket_number: invoiceNo })
      .then((res: any) => {
        console.log(res);
        setStep(1);
        setData(res.data);
        router.push(`/dashboard/my-event/checkin/${slug}`);
      })
      .catch((err: any) => {
        console.log(err);
        toast.error('Qr tidak ditemukan');
      });
  };


  return (
    <div className='flex items-center justify-center min-h-screen bg-black bg-opacity-70'>
      <div className='bg-white rounded-lg shadow-lg p-6 max-w-md w-full'>
        <h1 className='text-xl font-semibold mb-4 text-dark'>Check In</h1>

        <div>
          {selected === 'qr' && (
            <QrScanner
              isOpen={true}
              step={step}
              setStep={setStep}
              setData={setData}
            />
          )}
          {(selected === 'manual') && (
            <div className="px-5">
              <input
                type="text"
                className="border-3 border-primary-light-200 rounded-full w-full py-2 px-4 text-sm"
                placeholder="Input kode tiket"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
              />
              <div className="flex justify-end my-4">
                <Button
                  label="Submit"
                  onClick={handleManualSubmit}
                  color="primary"
                />
              </div>
            </div>
          )}
        </div>

        {step === 1 && data && (
          <div className='flex flex-col gap-3 py-4 px-6'>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle}
                size='3x'
                className='text-[#06c258] mb-3'
              />
              <h6 className=''>Check In/Checkout Berhasil</h6>
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
            <h6>Check In/Checkout Gagal</h6>
            <p className='text-grey'>Tiket gagal divalidasi silahkan coba kembali</p>
            <div className='flex justify-end my-2'>
              <Button
                  color='secondary'
                  label='Scan Ulang'
                  fullWidth
                  onClick={() => window.history.back()} // or use routing to go back
                />
            </div>
          </div>
        )}

        {step > 0 && (
          <div className='border-t border-t-primary-light-200 pt-4'>
            <div className='flex items-center w-full gap-2'>
              <Button
                color='primary'
                label='Check In/Checkout Lainnya'
                fullWidth
                onClick={() => {
                  setStep(0);
                  setData(null); // Reset data if needed
                  setInvoiceNo(''); // Clear the invoice number
                }}
              />
              <Button
                color='secondary'
                label='Kembali'
                fullWidth
                onClick={() => window.history.back()} // or use routing to go back
              />
            </div>
          </div>
        )}

        <div className="flex w-full mb-4">
          <button
            className={`flex-1 py-2 text-lg ${selected === 'qr' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            onClick={() => setSelected('qr')}
          >
            Checkin
          </button>
          <button
            className={`flex-1 py-2 text-lg ${selected === 'manual' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            onClick={() => setSelected('manual')}
          >
            Input Manual
          </button>
        </div>
      </div>
    </div>
  );
}
