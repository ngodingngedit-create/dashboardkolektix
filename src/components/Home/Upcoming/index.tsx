import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowRight } from '@fortawesome/free-solid-svg-icons';
import { EventProps } from '@/utils/globalInterface';
import EventCard from '@/components/Card/EventCard';
import EventCardLoading from '@/components/Card/EventCard/loading';
import styles from '../index.module.css';
import React from 'react';

interface UpcomingProps {
  className?: string;
  data: EventProps[];
  loading: boolean;
}

const Upcoming = ({ className, data, loading }: UpcomingProps) => {

  const currentDate = new Date();
  
  const upcomingEvents = data.filter(event => new Date(event.end_date) > currentDate);

  return (
    <div className='my-12 md:mx-auto md:max-w-7xl md:px-10'>
    {!loading && upcomingEvents.length === 0 ? null : (
      <>
        <div className='flex justify-between items-center mb-4 px-6 [&_*]:!text-white'>
          <h3 className='font-bold'>Segera Hadir!</h3>
          <Link href='/event' className='flex gap-2 items-center'>
            Lihat Semua
            <FontAwesomeIcon icon={faCircleArrowRight} />
          </Link>
        </div>
        <div
          className={`${styles.eventContainer} min-h-80 gap-6 items-center w-full pb-3 md:px-3 px-0 md:ml-0`}
        >
          {!loading ? (
            upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: EventProps) => (
                <div className={styles.eventCard} key={event.id}>
                  <EventCard
                    title={event.name}
                    img={event.image_url ?? ''}
                    date={new Date(event.start_date)}
                    end={new Date(event.end_date)}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator?.image}
                    creator={event.has_creator?.name}
                  />
                </div>
              ))
            ) : (
              <p>No upcoming events found.</p>
            )
          ) : (
            <>
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </>
          )}
        </div>
      </>
    )}
  </div>
  
  );
};

export default Upcoming;
