import { Post } from '@/utils/REST';
import { useState } from 'react';
import { useZxing } from 'react-zxing';
import { toast } from 'react-toastify';


interface SuccessCheckinData {
  invoice_no: string;
  eticket_number: string;
  total_qty: string;
  event_name: string;
  name: string | null;
  category_ticket: string;
}

interface ScannerProps {
  isOpen: boolean;
  step: number;
  setStep: (step: number) => void;
  setData: (data: SuccessCheckinData) => void;
}

const QrScanner = ({ isOpen, step, setStep, setData }: ScannerProps) => {
  const [result, setResult] = useState('');
  const { ref } = useZxing({
    onDecodeResult(result) {
      Post('eticket/checkin', { eticket_number: result.getText() })
        .then((res: any) => {
          console.log(res);
          toast.success('Check-in success');
          setData(res.data);
        })
        .catch((err: any) => {
          console.log(err);
          toast.error('Qr tidak ditemukan');
        });
    },
  });

  return (
    isOpen && (
      <>
        <video ref={ref} />
        {/* <p>
          <span>Last result:</span>
          <span>{result}</span>
        </p> */}
      </>
    )
  );
};

export default QrScanner;
