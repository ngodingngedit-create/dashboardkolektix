import Foto from '@images/Foto=2.png';
import Image from 'next/image';
import { useState } from 'react';
import styles from './index.module.css';
import Images from '@/components/Images';
import { formatDateDiff } from '@/utils/useFormattedDate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faClock } from '@fortawesome/free-regular-svg-icons';
import Link from 'next/link';
import { AspectRatio, Image as ImageM } from '@mantine/core';

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
    <div className='flex flex-col gap-[10px] justify-between bg-white border-grey/10 ml-1 md:ml-0 border border-[#d0d0d0] rounded-[10px] overflow-hidden'>
      <div className='flex flex-col gap-3'>
        <div>
          <AspectRatio w="100%">
            <ImageM
              src={img}
              alt={`${name} - Lowongan Kolektix`}
              w="100%"
            />
          </AspectRatio>
        </div>
        <div className='flex flex-col p-4'>
          <div className='mb-2'>
            <Link href='/lowongan/detail'>
              <p className='font-semibold -mt-4 text-primary-base hover:text-primary-disabled'>{name}</p>
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
          <div className='mt-3 font-normal text-xs flex items-center'>
            <FontAwesomeIcon icon={faClock} className='mr-1 text-grey' />
            <span className='text-grey'>{formatDateDiff(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;
