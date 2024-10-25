import Foto from '@images/Foto=2.png';
import Image from 'next/image';
import { useState } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import {
  faCalendar,
  faLocationDot,
  faBookmark as bookmarkSolid,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface JobsCardProps {
  name: string;
  slug: string;
  event: string;
  location: string;
  salary: string;
  status: string;
  creator: string;
  startDate: string;
  endDate: string;
}

const JobsCard = ({
  name,
  slug,
  event,
  startDate,
  endDate,
  location,
  salary,
  status,
  creator,
}: JobsCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  return (
    <div className='min-w-64 bg-white rounded-3xl dark:bg-gray-800 dark:border-gray-700 shadow-md border border-grey/10 ml-1 md:ml-0'>
      <div className='p-5'>
        <h3 className='text-dark my-2 font-bold'>{name}r</h3>
        <a href='#'>
          <h5 className='mb-2 text-lg font-semibold tracking-tight text-dark'>{event}</h5>
        </a>
        <p className='mb-3 font-normal text-sm'>
          <FontAwesomeIcon icon={faCalendar} className='mr-3 text-primary-base' />
          <span className='text-dark'>
            {startDate} - {endDate}
          </span>
        </p>
        <p className='mb-3 font-normal text-sm'>
          <FontAwesomeIcon icon={faLocationDot} className='mr-3 text-primary-base' />
          <span className='text-dark'>{location}</span>
        </p>
        <p className='text-primary-base font-bold'>
          {salary} / {status}
        </p>
        <div className='flex justify-between text-dark items-center text-sm mt-3'>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 bg-primary-light-200 rounded-full'></div>
            <div>
              <p className='text-dark font-semibold'>{creator}</p>
              <div className='text-grey text-xs'>{location}</div>
            </div>
          </div>
          <button
            onClick={() => setBookmark(!bookmark)}
            className='inline-flex items-center  py-2 text-base font-medium text-center text-dark  rounded-lg '
          >
            <FontAwesomeIcon icon={bookmark ? bookmarkSolid : faBookmark} className=' text-dark' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobsCard;
