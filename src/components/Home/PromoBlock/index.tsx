// import React from 'react';
// import styles from './index.module.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTicket, faUsers } from '@fortawesome/free-solid-svg-icons';

// const PromoBlock = () => {
//   return (
//     <div className={`${styles.bgPromo} md:rounded-e-[50px] my-20 md:pb-0 py-8 !text-white`}>
//       <div className='flex flex-col md:flex-row justify-between'>
//         <div className='w-full md:w-2/3 pt-0 md:pt-32'>
//           <div className='bg-white text-dark w-72 font-semibold rounded-full md:rounded-none md:rounded-e-full py-1 md:pl-20 md:text-start text-center mx-auto md:mx-0'>
//             <p>
//               Hai, <span className='text-primary-base'>Teman Kolektix</span>
//             </p>
//           </div>
//           <div className='px-5 mt-4 md:px-20 md:my-7 md:text-start text-center'>
//             <h2>Mau buat event seru?</h2>
//             <h1 className='font-bold text-[24px] md:text-[40px]'>
//               Kolektix siap jadi partner kamu!
//             </h1>
//             <button className='bg-primary-base px-3 py-2 hover:bg-primary-dark rounded-md my-5'>
//               Buat Event
//             </button>
//           </div>
//         </div>
//         <div className='w-full md:w-1/4 flex flex-col justify-center items-center gap-2 mt-5 md:mt-0'>
//           <div className='flex w-2/3 md:w-full md:self-end items-center bg-gradient-to-b from-dark/40 to-white/20 md:rounded-e-none rounded-3xl md:rounded-s-3xl border border-grey/20 py-2'>
//             <div className='w-1/4 flex justify-center'>
//               <FontAwesomeIcon icon={faTicket} className='' size='2xl' />
//             </div>
//             <div className='w-2/3'>
//               <p className='text-xs'>Melayani lebih dari</p>
//               <h1 className='md:text-[35px] text-[24px]'>1.000+</h1>
//               <p>Pemesan Tiket</p>
//             </div>
//           </div>
//           <div className='flex w-2/3 md:w-full items-center bg-gradient-to-b from-dark/40 to-white/20 rounded-3xl md:rounded-e-3xl md:rounded-e-none md:rounded-s-3xl border border-white/20 py-2'>
//             <div className='w-1/4 flex justify-center'>
//               <FontAwesomeIcon icon={faUsers} className='' size='2xl' />
//             </div>
//             <div className='w-2/3'>
//               <p className='text-xs'>Dipercaya lebih dari</p>
//               <h1 className='md:text-[35px] text-[24px]'>20+</h1>
//               <p>Event Creator</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PromoBlock;

import React from "react";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import useLoggedUser from "@/utils/useLoggedUser";
import { UserProps } from "@/utils/globalInterface";
import { useState, useEffect } from "react";

const PromoBlock = () => {
  const [userData, setUserData] = useState<UserProps>();
  const users = useLoggedUser();
  const router = useRouter();

  const handleCreateEvent = () => {
    router.push(!userData?.has_creator ? "/register/creator" : "/create-event");
  };

  useEffect(() => {
    if (users) {
      setUserData(users);
      console.log(users);
    }
  }, [users]);

  return (
    <div className={`${styles.bgPromo} md:rounded-e-[50px] my-20 md:pb-0 py-8 !text-white`}>
      <div className="flex flex-col md:flex-row justify-between">
        <div className="w-full md:w-2/3 pt-0 md:pt-32">
          <div className="bg-white text-dark w-72 font-semibold rounded-full md:rounded-none md:rounded-e-full py-1 md:pl-20 md:text-start text-center mx-auto md:mx-0">
            <p>
              Hai, <span className="text-primary-base">Teman Kolektix</span>
            </p>
          </div>
          <div className="px-5 mt-4 md:px-20 md:my-7 md:text-start text-center">
            <h2>Mau buat event seru?</h2>
            <h1 className="font-bold text-[24px] md:text-[40px]">Kolektix siap jadi partner kamu!</h1>

            {/* BUTTON UPDATED */}
            <button onClick={handleCreateEvent} className="bg-primary-base px-3 py-2 hover:bg-primary-dark rounded-md my-5">
              Buat Event
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/4 flex flex-col justify-center items-center gap-2 mt-5 md:mt-0">
          <div className="flex w-2/3 md:w-full md:self-end items-center bg-gradient-to-b from-dark/40 to-white/20 md:rounded-e-none rounded-3xl md:rounded-s-3xl border border-grey/20 py-2">
            <div className="w-1/4 flex justify-center">
              <FontAwesomeIcon icon={faTicket} className="" size="2xl" />
            </div>
            <div className="w-2/3">
              <p className="text-xs">Melayani lebih dari</p>
              <h1 className="md:text-[35px] text-[24px]">1.000+</h1>
              <p>Pemesan Tiket</p>
            </div>
          </div>

          <div className="flex w-2/3 md:w-full items-center bg-gradient-to-b from-dark/40 to-white/20 rounded-3xl md:rounded-e-3xl md:rounded-e-none md:rounded-s-3xl border border-white/20 py-2">
            <div className="w-1/4 flex justify-center">
              <FontAwesomeIcon icon={faUsers} className="" size="2xl" />
            </div>
            <div className="w-2/3">
              <p className="text-xs">Dipercaya lebih dari</p>
              <h1 className="md:text-[35px] text-[24px]">20+</h1>
              <p>Event Creator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBlock;
