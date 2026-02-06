// import { Post } from '@/utils/REST';
// import { useState, useRef, useCallback } from 'react';
// import { useZxing } from 'react-zxing';
// import { toast } from 'react-toastify';
// import _ from 'lodash';  // Ensure you have lodash installed

// interface SuccessCheckinData {
//   invoice_no: string;
//   eticket_number: string;
//   total_qty: string;
//   event_name: string;
//   name: string | null;
//   category_ticket: string;
// }

// interface ScannerProps {
//   isOpen: boolean;
//   step: number;
//   setStep: (step: number) => void;
//   setData: (data: SuccessCheckinData) => void;
// }

// const QrScanner = ({ isOpen, step, setStep, setData }: ScannerProps) => {
//   const [result, setResult] = useState('');
//   const requestLock = useRef(false);
  
//   const handleDecodeResult = useCallback(
//     _.throttle((decodedText: string) => {
//       if (!requestLock.current) {
//         requestLock.current = true;
//         Post('eticket/checkin', { eticket_number: decodedText })
//           .then((res: any) => {
//             console.log(res);
//             toast.success('Check-in success');
//             setData(res.data);
//           })
//           .catch((err: any) => {
//             console.log(err);
//             toast.error('Qr tidak ditemukan');
//           })
//           .finally(() => {
//             requestLock.current = false;
//           });
//       }
//     }, 3000), // Adjust the delay as needed
//     [],
//   );

//   const { ref } = useZxing({
//     onDecodeResult(result) {
//       handleDecodeResult(result.getText());
//     },
//   });

//   return (
//     isOpen && (
//       <>
//         <video ref={ref as React.RefObject<HTMLVideoElement>} />
//       </>
//     )
//   );
// };

// export default QrScanner;

import { Post } from '@/utils/REST';
import { useState, useRef, useCallback } from 'react';
import { useZxing } from 'react-zxing';
import { toast } from 'react-toastify';
import _ from 'lodash';

interface SuccessCheckinData {
  invoice_no: string;
  eticket_number: string;
  total_qty: string;
  event_name: string;
  name: string | null;
  category_ticket: string;
}

interface SuccessMerchData {
  invoice_no: string;
  product_name: string;
  quantity: string;
  variant_name: string;
  buyer_name: string;
  total_price: string;
  status: string;
  scan_date: string;
}

interface ScannerProps {
  isOpen: boolean;
  step: number;
  setStep: (step: number) => void;
  setData: (data: any) => void;
  scanType?: 'eticket' | 'merchandise';
}

const QrScanner = ({ isOpen, step, setStep, setData, scanType = 'eticket' }: ScannerProps) => {
  const [result, setResult] = useState('');
  const requestLock = useRef(false);
  
  const handleMerchScan = useCallback(
    _.throttle((decodedText: string) => {
      if (!requestLock.current) {
        requestLock.current = true;
        
        let merchCode = decodedText;
        if (decodedText.includes('?')) {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          merchCode = urlParams.get('code') || decodedText;
        }
        
        Post('order-product/scan/', { invoice_no: merchCode })
          .then((res: any) => {
            console.log('Merch scan response:', res);
            if (res.success) {
              toast.success('Scan merchandise berhasil!');
              
              const merchData: SuccessMerchData = {
                invoice_no: res.data.invoice_no || 'N/A',
                product_name: res.data.product_name || res.data.name || 'Produk Merchandise',
                quantity: res.data.quantity || '1',
                variant_name: res.data.variant_name || res.data.variant || 'Standard',
                buyer_name: res.data.buyer_name || res.data.name || 'Customer',
                total_price: res.data.total_price || '0',
                status: res.data.status || 'validated',
                scan_date: new Date().toISOString()
              };
              
              setData(merchData);
            } else {
              toast.error(res.message || 'Merchandise tidak ditemukan');
              setData({
                error: true,
                message: res.message || 'Merchandise tidak ditemukan'
              });
            }
          })
          .catch((err: any) => {
            console.log('Merch scan error:', err);
            toast.error('Gagal memproses QR merchandise');
            setData({
              error: true,
              message: 'Gagal memproses QR merchandise'
            });
          })
          .finally(() => {
            requestLock.current = false;
          });
      }
    }, 3000),
    []
  );

  const handleEticketScan = useCallback(
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
            setData({
              error: true,
              message: 'QR tidak ditemukan'
            });
          })
          .finally(() => {
            requestLock.current = false;
          });
      }
    }, 3000),
    []
  );

  const { ref } = useZxing({
    onDecodeResult(result) {
      const decodedText = result.getText();
      
      if (scanType === 'merchandise') {
        handleMerchScan(decodedText);
      } else {
        handleEticketScan(decodedText);
      }
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