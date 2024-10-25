import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

interface TicketCounterProps {
  count: number;
  setCount: (count: number) => void;
  isSoldOut?: boolean;
  isFinish?: boolean;
  isReady?: boolean;
  title: string;
  price: number;
  isLogin: boolean;
}

const TicketCounter = ({
  count,
  setCount,
  isSoldOut,
  title,
  price,
  isLogin,
  isFinish,
  isReady,
}: TicketCounterProps) => {
  const router = useRouter();
  return (
    <div
      className={`border ${
        isSoldOut
          ? 'bg-[#ffebec] border-[#ffebec]'
          : isFinish
          ? 'bg-primary-light border-primary-light-200'
          : isReady
          ? 'bg-gray-200 border-gray-200'
          : 'border-primary-light-200'
      } rounded-md flex flex-col shadow-sm mb-5 divide-y-2 divide-primary-light-200 divide-dashed bg-primary-light`}
    >
      <div className='p-3'>
        <p className=''>{title}</p>
      </div>
      <div className='flex items-center justify-between p-3'>
        <p className='font-semibold'>Rp {price.toLocaleString('id-ID')}</p>
        <div className='flex items-center gap-3'>
          {isSoldOut ? (
            <button className='bg-[#ff9292] text-[#870809] px-3 py-1 text-sm font-semibold rounded-2xl'>
              Sold Out
            </button>
          ) : isFinish ? (
            <button className='bg-primary-light-200 text-primary-disabled px-3 py-1 text-sm font-semibold rounded-2xl'>
              Event Selesai
            </button>
          ) : isReady ? (
            <button className='bg-gray-300 text-gray-500 px-3 py-1 text-sm font-semibold rounded-2xl' disabled>
              Belum di mulai
            </button>
          ) : (
            <>
              <button
                className='border-2 w-5 h-5 text-center border-primary-base flex items-center justify-center leading-none text-primary-base rounded-full font-semibold disabled:border-grey disabled:text-grey'
                disabled={count === 0}
                onClick={() => setCount(count - 1)}
              >
                <FontAwesomeIcon icon={faMinus} className='w-5' size='xs' />
              </button>
              <p className='font-semibold min-w-10 text-center'>{count}</p>
              <button
                className='border-2 w-5 h-5 text-center border-primary-base flex items-center justify-center leading-none text-primary-base rounded-full font-semibold'
                onClick={() => setCount(count + 1)}
              >
                <FontAwesomeIcon icon={faPlus} className='w-5' size='xs' />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCounter;
