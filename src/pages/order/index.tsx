import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faLocationDot, faClock } from '@fortawesome/free-solid-svg-icons';
import Foto from '@images/Banner-amis.png';
import Image from 'next/image';

const Order = () => {
  return (
    <div className='min-h-100'>
      <div className='bg-primary-base rounded-b-xl h-40 relative'>
        <h1 className='text-white'>DETAIL Pesanan</h1>
      </div>
      <div className='bg-white p-1 w-1/2 absolute top-20 rounded-xl shadow-md'>
        <div className='flex items-center'>
          <div className='w-4/6 p-2'>
            <Image src={Foto} alt='Foto' className='rounded-xl w-full' />
          </div>
          <div className='w-2/6 p-2'>
            <p className='mb-3 font-normal text-sm'>
              <FontAwesomeIcon icon={faCalendar} className='mr-3 text-primary' />
              <span className='text-dark'>12 Juni - 14 Juni 2024</span>
            </p>
            <p className='mb-3 font-normal text-sm'>
              <FontAwesomeIcon icon={faClock} className='mr-3 text-primary' />
              <span className='text-dark'>13:00 - 19:00</span>
            </p>
            <p className='mb-3 font-normal text-sm'>
              <FontAwesomeIcon icon={faLocationDot} className='mr-3 text-primary' />
              <span className='text-dark'>Jakarta</span>
            </p>
          </div>
        </div>
        <div>
          <table className='w-full text-dark text-sm border-collapse border border-grey'>
            <thead>
              <tr>
                <th>Song</th>
                <th>Artist</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>The Sliding Mr. Bones (Next Stop, Pottersville)</td>
                <td>Malcolm Lockyer</td>
                <td>1961</td>
              </tr>
              <tr>
                <td>Witchy Woman</td>
                <td>The Eagles</td>
                <td>1972</td>
              </tr>
              <tr>
                <td>Shining Star</td>
                <td>Earth, Wind, and Fire</td>
                <td>1975</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Order;
