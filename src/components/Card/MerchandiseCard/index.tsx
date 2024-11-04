import Foto from '@images/Foto=2.png';
import Image from 'next/image';
import { useState } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as starSolid } from '@fortawesome/free-solid-svg-icons';
import {
  faCalendar,
  faLocationDot,
  faBookmark as bookmarkSolid,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { NumberFormatter } from '@mantine/core';

interface MerchCardProps {
  name: string;
  price: number;
  sale: number;
  creator: string;
  redirect: string;
  image?: string;
}

const MerchandiseCard = ({ name, price, sale, creator, redirect, image }: MerchCardProps & {}) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  return (
    <Link href={redirect} className='bg-white rounded-lg border border-primary-light-200 shadow-md ml-1 md:ml-0 w-full'>
      <div className={``}>
        <Image className={`${styles.cardImg} rounded-t-lg`} src={image ?? Foto} width={500} height={500} alt='' />
      </div>
      <div>
        <div className={`p-[10px]`}>
          <p className='mb-2 text-dark font-[500] leading-[140%] text-[0.8rem]'>{name}</p>
          <div>
            <p className='text-dark text-[0.8rem] font-[500]'><NumberFormatter value={price} /></p>
            <p className='text-dark-grey text-[0.7rem] line-through'><NumberFormatter value={sale} /></p>
          </div>
          <div className='flex items-center text-xs mt-[5px]'>
            <p className='text-xs'>
              <FontAwesomeIcon icon={starSolid} className='text-warning-400' />
              <span className='ml-1 text-grey'>4.8</span>
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 border-t p-[10px] border-t-primary-light-200 border-dashed'>
          <div className='h-8 w-8 bg-primary-light-200 rounded-full'></div>
          <div>
            <p className='text-dark font-[400] text-xs'>{creator}</p>
            <div className='text-grey text-[10px]'>Jakarta</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MerchandiseCard;
