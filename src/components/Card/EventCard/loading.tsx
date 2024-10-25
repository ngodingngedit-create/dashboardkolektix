import React from 'react';

const EventCardLoading = () => {
  return (
    <div className='min-w-64 max-w-64 bg-white rounded-lg border border-light-grey shadow-md mx-1 md:mx-0 '>
      <div className='animate-pulse p-3'>
        <div className='bg-light-grey h-[150px] w-full rounded-md mb-2 rounded-b-md'></div>
        <div className='py-2'>
          <div className='bg-light-grey h-6 w-2/3 mb-2 rounded-md'></div>
          <div className='bg-light-grey h-3 w-32 rounded-md mb-2'></div>
          <div className='bg-light-grey h-3 w-20 rounded-md mb-2'></div>
          <div className='bg-light-grey h-3 w-28 rounded-md mb-5'></div>

          <div className='flex justify-between text-dark items-center text-sm gap-2'>
            <div className='bg-light-grey h-3 w-full rounded-md mb-2'></div>
            <div className='bg-light-grey h-3 w-10 rounded-md mb-2'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCardLoading;
