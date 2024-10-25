import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

interface OrderCounterProps {
  count: number;
  setCount: (count: number) => void;
  isSoldOut?: boolean;
  isFinish?: boolean;
  isReady?: boolean;
  title: string;
  price: number;
  isLogin: boolean;
}

const OrderCounter = ({
  count,
  setCount,
  isSoldOut,
  title,
  price,
  isLogin,
  isFinish,
  isReady,
}: OrderCounterProps) => {
  const router = useRouter();
  return (
    <div
      className={`border ${
        isSoldOut
          ? 'bg-[#ffebec] border-[#ffebec]'
          : isFinish
          ? 'bg-primary-light border-primary-light-200'
          : isReady
          ? 'bg-light-grey border-primary-light'
          : 'border-primary'
      } rounded-xl flex items-center shadow-sm justify-between p-4 mb-5`}
    >
      <div>
        <p>{title}</p>
        <p className='font-semibold'>
          {price === 0 ? 'Free' : `Rp ${price.toLocaleString('id-ID')}`}
        </p>

      </div>
      <div className='flex items-center gap-3'>
        {isSoldOut ? (
          <button className='bg-[#ff9292] text-[#870809] px-3 py-1 text-sm font-semibold rounded-2xl'>
            Sold Out
          </button>
        ) : isFinish ? (
          <button className='bg-primary-900 text-primary-disabled px-3 py-1 text-sm font-semibold rounded-2xl'>
            Event Selesai
          </button>
        ) : isReady ? (
          <button className='bg-primary-light-200 text-dark px-3 py-1 text-sm font-semibold rounded-2xl' disabled>
            Belum di mulai
          </button>
        ) : (
          <>
            <button
              className='bg-primary-base px-2 text-lg text-white rounded-sm disabled:opacity-50'
              disabled={count === 0}
              onClick={() => setCount(count - 1)}
            >
              -
            </button>
            <p>{count}</p>
            <button
              className='bg-primary-base px-2 text-lg text-white rounded-sm'
              onClick={() => setCount(count + 1)}
            >
              +
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCounter;
