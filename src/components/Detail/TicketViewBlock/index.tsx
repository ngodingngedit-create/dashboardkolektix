import { useEffect, useState } from 'react';
import DateTab from '@/components/DateTab';
import { TicketProps } from '@/utils/globalInterface';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

interface Props {
  counts: { [key: number]: number };
  setCounts: (counts: { [key: string]: number }) => void;
  data: TicketProps[];
  isLogin: boolean;
  totalCount: number;
  totalSubtotalPrice: number;
  setStep: (step: number) => void;
  scrollToTop: () => void;
  selected: number;
  setSelected: (index: number) => void;
  storeLocalStorage: () => void;
}

const TicketViewBlock = ({
  counts,
  setCounts,
  data,
  isLogin,
  totalSubtotalPrice,
  totalCount,
  scrollToTop,
  setStep,
  selected,
  setSelected,
  storeLocalStorage,
}: Props) => {
  const router = useRouter();
  const redirectLogin = () => {
    Cookies.set('ticketCount', JSON.stringify(counts));
    Cookies.set('prevPath', router.asPath);
    selected && Cookies.set('selected', selected.toString());
    router.push('/auth');
  };

  return (
    <div className='text-dark my-5 '>
      <div
        className='rounded-t-xl shadow-md p-4 w-full md:w-2/3 md:py-8 overflow-y-scroll h-100 border-2 border-primary-light-200 mb-[60px] md:mb-[90px]'
        id='ticket-picker'
      >
        <DateTab
          counts={counts}
          setCounts={setCounts}
          data={data}
          isLogin={isLogin}
          selected={selected}
          setSelected={setSelected}
        />
        <button></button>
      </div>
      <div className='flex justify-between items-center bg-[#eff5ff] p-5 rounded-b-xl shadow-md w-full fixed bottom-0 left-0 z-30'>
        <div>
          <p>Total {totalCount} Tiket</p>
          <p className='font-semibold'>Rp {totalSubtotalPrice.toLocaleString('id-ID')}</p>
        </div>
        <div className='flex gap-4 items-center'>
          {/* <p className='font-semibold'>Rp {totalSubtotalPrice.toLocaleString('id-ID')}</p> */}
          {isLogin ? (
            <button
              className='bg-primary-base text-white px-4 py-2 font-semibold text-sm rounded-2xl disabled:bg-primary-disabled disabled:cursor-not-allowed'
              onClick={() => {
                Cookies.remove('ticketCount', { path: '/' });
                setStep(33);
                scrollToTop();
              }}
              disabled={totalCount === 0}
            >
              Beli Tiket
            </button>
          ) : (
            <button
              className='bg-primary-base text-white px-4 py-2 font-semibold text-sm rounded-2xl disabled:bg-primary-disabled disabled:cursor-not-allowed'
              onClick={storeLocalStorage}
              disabled={totalCount === 0}
            >
              Beli Tiket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketViewBlock;
