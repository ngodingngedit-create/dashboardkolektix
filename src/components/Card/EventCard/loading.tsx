// import React from 'react';

// const EventCardLoading = () => {
//   return (
//     <div className='min-w-64 max-w-64 bg-white rounded-lg border border-light-grey shadow-md mx-1 md:mx-0 '>
//       <div className='animate-pulse p-3'>
//         <div className='bg-light-grey h-[150px] w-full rounded-md mb-2 rounded-b-md'></div>
//         <div className='py-2'>
//           <div className='bg-light-grey h-6 w-2/3 mb-2 rounded-md'></div>
//           <div className='bg-light-grey h-3 w-32 rounded-md mb-2'></div>
//           <div className='bg-light-grey h-3 w-20 rounded-md mb-2'></div>
//           <div className='bg-light-grey h-3 w-28 rounded-md mb-5'></div>

//           <div className='flex justify-between text-dark items-center text-sm gap-2'>
//             <div className='bg-light-grey h-3 w-full rounded-md mb-2'></div>
//             <div className='bg-light-grey h-3 w-10 rounded-md mb-2'></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EventCardLoading;

import React from "react";

const EventCardLoading = () => {
  return (
    <div className="bg-white rounded-lg border border-primary-light-200 shadow-md mx-1 md:mx-2 w-full">
      <div className="animate-pulse p-3">
        {/* image area with same aspect ratio as real card */}
        <div className="bg-light-grey w-full rounded-md mb-3" style={{ paddingTop: "34.4%" }} />
        {/* paddingTop 34.4% approximates ratio 1062/365 -> 365/1062 = 0.3438 */}

        <div className="py-2">
          <div className="bg-light-grey h-6 w-2/3 mb-2 rounded-md" />
          <div className="bg-light-grey h-3 w-32 rounded-md mb-2" />
          <div className="bg-light-grey h-3 w-20 rounded-md mb-2" />
          <div className="bg-light-grey h-3 w-28 rounded-md mb-5" />

          <div className="flex justify-between items-center text-dark text-sm gap-2">
            <div className="bg-light-grey h-3 w-24 rounded-md" />
            <div className="bg-light-grey h-8 w-24 rounded-lg" />
          </div>
        </div>

        <div className="border-t-1.5 border-dashed border-primary-light-200 mt-3 pt-3 flex items-center gap-3">
          <div className="bg-light-grey rounded-full" style={{ width: 40, height: 40 }} />
          <div style={{ flex: 1 }}>
            <div className="bg-light-grey h-3 w-1/2 rounded-md mb-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCardLoading;
