import Foto from '@images/Foto=2.png';
import Image from 'next/image';
import { useState } from 'react';
import styles from './index.module.css';
import Images from '@/components/Images';
import { formatDateDiff } from '@/utils/useFormattedDate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faClock } from '@fortawesome/free-regular-svg-icons';
import Link from 'next/link';

interface JobsCardProps {
  img: string;
  name: string;
  slug: string;
  event: string;
  location: string;
  salary: number;
  status: string;
  creator: string;
  maxSalary: number;
  createdAt: string;
}

const JobList = ({
  name,
  img,
  slug,
  event,
  maxSalary,
  location,
  salary,
  status,
  creator,
  createdAt,
}: JobsCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  return (
    <div className='min-w-64 flex justify-between bg-white p-4 border-grey/10 ml-1 md:ml-0'>
      <div className='flex gap-3'>
        <div>
          <Images
            path={img}
            type='creator'
            alt='creator'
            className='w-10 h-10 object-cover rounded-sm'
          />
        </div>
        <div className='flex flex-col'>
          <div className='mb-2'>
            <Link href='/lowongan/detail'>
              <p className='font-semibold text-primary-base hover:text-primary-disabled'>{name}</p>
            </Link>
            <p className='tracking-tight text-dark text-xs my-0.5'>{event}</p>
            <p className='text-grey text-xs'>{location}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='text-xs'>
              {`Rp${salary.toLocaleString('id-ID')} - Rp${maxSalary.toLocaleString('id-ID')}`}
            </p>
            <p className='text-grey text-xs'>{status}</p>
          </div>
        </div>
      </div>
      <div>
        <div className='mb-3 font-normal text-xs flex items-center'>
          <FontAwesomeIcon icon={faClock} className='mr-1 text-grey' />
          <span className='text-grey'>{formatDateDiff(createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default JobList;
