import { Post } from '@/utils/REST';
import { useState, useRef, useCallback } from 'react';
import { useZxing } from 'react-zxing';
import _ from 'lodash';

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
  scanType: 'merchandise';
}

const QrScanner = ({ isOpen, step, setStep, setData, scanType }: ScannerProps) => {
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
            
            // Kembalikan semua data response ke parent component
            setData({
              type: 'merchandise',
              status: res.status,
              success: res.status || res.success,
              data: res.data,
              message: res.message,
              pickup_status: res.pickup_status,
              rawResponse: res
            });
          })
          .catch((err: any) => {
            console.log('Merch scan error:', err);
            setData({
              type: 'merchandise',
              status: false,
              success: false,
              error: true,
              message: 'Gagal memproses QR merchandise',
              rawError: err
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
      
      // Hanya handle merchandise scan
      if (scanType === 'merchandise') {
        handleMerchScan(decodedText);
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