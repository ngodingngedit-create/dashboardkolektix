import Foto from '@images/Foto=2.png';
import { useState } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import {
  faCalendar,
  faLocationDot,
  faBookmark as bookmarkSolid,
} from '@fortawesome/free-solid-svg-icons';
import useLoggedUser from '@/utils/useLoggedUser';
import Images from '@/components/Images';
import Link from 'next/link';
import { AspectRatio, Box, Card, Flex, Image, Text } from '@mantine/core';
import moment from 'moment';
import { Icon } from '@iconify/react/dist/iconify.js';

interface EventCardProps {
  slug?: string;
  title?: string;
  date: Date;
  end: Date;
  location?: string;
  img: string;
  description?: string;
  creatorImg?: string;
  creator: string;
  bookmark?: boolean;
  price?: number;
  creatorSlug?: string;
  has_creator?: {
    slug: string;
  }; 
  maxWidth?: number
  start_date?: string,
  start_time?: string,
  end_date?: string,
  end_time?: string,
}

const EventCard = ({
  maxWidth,
  slug,
  title,
  date,
  location,
  img,
  description,
  price,
  creatorImg,
  creatorSlug,
  creator,
  has_creator,
  end,
  start_date,
  start_time,
  end_date,
  end_time,
}: EventCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  const users = useLoggedUser();
  const currentDate = new Date();

  const eventDate = (event: Date) => {
    const date = new Date(event);
    const month = date.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return month;
  };

  const isEventEnded = currentDate > new Date(end);

  function isCurrentTimeBetween(startDate: string, endDate: string): boolean {
    const start = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
    const end = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
    const now = moment();

    return now.isBetween(start, end, undefined, '[]');
  }

  return (
    <div style={{  maxWidth }} className='[&_.hoverCTA]:hover:!translate-y-0 bg-white rounded-lg shadow-md mx-1 md:mx-2 border border-primary-light-200 relative'>
      <Link href={`/event/${slug}`}>
        <div className="relative overflow-hidden">
          <Box pos="relative">
            <AspectRatio ratio={1062/365}>
              <Image
                className={`!rounded-t-lg`}
                src={img}
                alt='Banner'
              />
            </AspectRatio>

            {(isCurrentTimeBetween(`${start_date} ${start_time}:00`, `${end_date} ${end_time}:00`)) && (
                <Card className={`!absolute z-20 top-2 right-2 w-fit !rounded-full !border !border-white/50 backdrop-blur-sm`} p="4px 16px 4px 30px" bg="#00000030">
                    <Flex gap={10} align="center">
                        <Icon icon="ph:dot-duotone" className={`absolute top-2/4 left-0 -translate-y-2/4 !text-[40px] mr-[-20px] animate-pulse !text-red-500`} />
                        <Icon icon="mynaui:video" className={`!text-[22px] !text-red-500`} />
                        <Text fw={600} c="white" size="xs">Live Event</Text>
                    </Flex>
                </Card>
            )}
          </Box>

          {isEventEnded ? (
            <div className="absolute top-2 right-2 bg-light-grey text-dark px-2 py-1 rounded-xl text-xs">
              Event Ended
            </div>
          ) : (
            <Card
              pos="absolute"
              p="5px 14px"
              bg="#ffffff20"
              radius="xl"
              fw={600}
              c="white"
              className={`transition-transform hoverCTA !border !border-white translate-y-[60px] bottom-3 right-3`}>
              Beli Tiket
            </Card>
          )}
        </div>
      </Link>
      <div className='p-3'>
        <Link href={`/event/${slug}`}>
          <h5 className="mb-2 text-lg font-semibold tracking-tight text-dark truncate max-w-[230px]">{title}</h5>
        </Link>
        <p className='mb-3 font-normal text-sm'>
          <FontAwesomeIcon icon={faCalendar} className='mr-3 text-primary-base' />
          <span className='text-grey'>
            {`${eventDate(date)}`}
          </span>
        </p>
        <div className='flex justify-between text-dark items-center font-semibold'>
          <p>{price === 0 ? 'Free' : `Rp${price?.toLocaleString('id-ID')}`}</p>
          {users?.name && (
            <button
              onClick={() => setBookmark(!bookmark)}
              className='inline-flex items-center py-2 text-base font-medium text-center text-dark rounded-lg'
            >
              <FontAwesomeIcon
                icon={bookmark ? bookmarkSolid : faBookmark}
                className='text-dark'
              />
            </button>
          )}
        </div>
      </div>
      <div className='border-t-1.5 border-dashed border-primary-light-200'>
      <Link className='flex items-center p-3' href={`/creator/${creatorSlug}`}>
          <Images
            type='creator'
            path={creatorImg}
            alt='image'
            className='w-8 h-8 border border-primary-light-200 rounded-full object-contain'
            width={200}
            height={200}
          />
          <p className='ml-2 text-dark text-sm font-semibold truncate max-w-[200px]'>{creator}</p>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
