import { Post } from '@/utils/REST';
import { useState, useRef, useCallback } from 'react';
import { useZxing } from 'react-zxing';
import { toast } from 'react-toastify';
import _ from 'lodash';  // Ensure you have lodash installed

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
  const requestLock = useRef(false);
  
  const handleDecodeResult = useCallback(
    _.throttle((decodedText: string) => {
      if (!requestLock.current) {
        requestLock.current = true;
        Post('eticket/checkin', { eticket_number: decodedText })
          .then((res: any) => {
            console.log(res);
            toast.success('Check-in success');
            setData(res.data);
          })
          .catch((err: any) => {
            console.log(err);
            toast.error('Qr tidak ditemukan');
          })
          .finally(() => {
            requestLock.current = false;
          });
      }
    }, 3000), // Adjust the delay as needed
    [],
  );

  const { ref } = useZxing({
    onDecodeResult(result) {
      handleDecodeResult(result.getText());
    },
  });

  return (
    isOpen && (
      <>
        <video ref={ref as React.RefObject<HTMLVideoElement>} />
      </>
    )
  );
};

export default QrScanner;
