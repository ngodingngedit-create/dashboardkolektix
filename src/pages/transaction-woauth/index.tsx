import FirstStepUnlogged from '@/components/Payment/FirstStepUnlogged';
import { EventProps } from '@/utils/globalInterface';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import Footer from '@/components/FooterComponent';
import React from 'react';
import { useRouter } from 'next/router';

// Interface definitions
interface FormTicket {
  event_id: number;
  event_ticket_id: number;
  name: string;
  price: number;
  subtotal_price: number;
  qty_ticket: number;
  payment_status: string;
}

interface Form {
  nik: string;
  full_name: string;
  email: string;
  countryCode: string;
  no_telp: string;
  is_pemesan: number;
  identity_type_id: number;
  event_ticket_id: number;
}

interface DataProps {
  detail: EventProps;
  ticket: FormTicket[];
  totalSubtotalPrice: number;
  totalCount: number;
  form: Form[];
  countdowns: string;
}

// Function to open IndexedDB
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDatabase', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('transactionStore')) {
        db.createObjectStore('transactionStore', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Function to get data from IndexedDB
const getDataFromIndexedDB = async (): Promise<DataProps | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('transactionStore', 'readonly');
      const store = transaction.objectStore('transactionStore');
      const request = store.get('transactionStorage');

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };

      request.onerror = (error) => {
        reject(error);
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return null;
  }
};

const TransactionWithoutAuth = () => {
  const [data, setData] = useState<DataProps | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [step, setStep] = useState<number>(0);
  const router = useRouter();

  const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
    if (completed) {
      router.back();
      // return <p>Time Out</p>;
    } else {
      return (
        <p className='font-semibold'>
          {String(minutes).padStart(2, '0')} : {String(seconds).padStart(2, '0')}
        </p>
      );
    }
  };

  useEffect(() => {
    getDataFromIndexedDB().then((fetchedData) => {
      setData(fetchedData);
    }).catch((error) => {
      console.error("Failed to fetch data from IndexedDB", error);
      setData(null);
    });
  }, []);

  return (
    <>
      <div className='text-dark min-h-screen px-4 md:px-2 lg:px-0 mb-52'>
        {data && (
          <FirstStepUnlogged
          detail={data.detail}
          ticket={data.ticket}
          totalCount={data.totalCount}
          totalSubtotalPrice={data.totalSubtotalPrice}
          forms={data.form}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          setFormValid={setFormValid}
          setStep={setStep}
          step={step}
        />
        )}
      </div>
      {step === 0 && (
        <div className='w-full fixed gap-3 bottom-0 bg-white border-t-2 border-t-primary-light-200 z-50 p-5 px-4 md:px-2 lg:px-0'>
          <div className='max-w-5xl mx-auto flex md:flex-row flex-col justify-between md:gap-0 gap-3 items-center'>
            <div className='hidden lg:flex items-center gap-0 md:gap-3 bg-[#EA4D3E] text-white px-3 py-2 rounded-md'>
              {data?.countdowns && (
                <Countdown date={new Date(data.countdowns)} renderer={renderer} />
              )}
              <div className='w-[1px] mx-1 md:mx-0 h-5 bg-primary-light-200'></div>
              <p className='text-xs'>Segera selesaikan pesananmu</p>
            </div>
            <div className='flex lg:hidden md:hidden items-center fixed top-16 right-0 left-0 gap-0 md:gap-3 bg-[#EA4D3E] text-white px-3 py-2'>
              {data?.countdowns && (
                <Countdown date={new Date(data.countdowns)} renderer={renderer} />
              )}
              <div className='w-[1px] mx-1 md:mx-0 h-5 bg-primary-light-200'></div>
              <p className='text-xs'>Segera selesaikan pesananmu</p>
            </div>
            <Button
              label='Selanjutnya'
              color='primary'
              disabled={!formValid}
              className='px-12 py-2 md:w-auto w-full'
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionWithoutAuth;
