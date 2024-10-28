import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import addevent from '../../../assets/images/addevent.png';
import { Tabs, Tab } from '@nextui-org/react';
import { EventProps } from '@/utils/globalInterface';
import EventCard from '@/components/Card/EventCard';
import EventCardLoading from '@/components/Card/EventCard/loading';
import { faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import useLoggedUser from '@/utils/useLoggedUser';
import { Get } from '@/utils/REST';
import InputField from '@/components/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import EventCardCreator from '@/components/Card/EventCard/creator';
import Button from '@/components/Button';
import { useRouter } from 'next/router';
import { Modal } from '@mantine/core';

const MyEvent = () => {
  const [data, setData] = useState<EventProps[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const users = useLoggedUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  const getData = async (id: number, status: string) => {
    try {
      setLoading(true);
      const res: any = await Get(`event-by-creator/${id}`, { status });
      
      const validStatuses = [1, 2, 3, 4, 5, 0, null];
      const filteredData = res.data.filter((event: EventProps) => 
        validStatuses.includes(event.event_status_id) || event.event_status_id === null
      );
      
      setData(filteredData);
      console.log(res, 'Event Data');
    } catch (err) {
      console.log(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (users) {
      getData(users.has_creator.id, status);
    }
  }, [users, status]);

  const filteredData = data?.filter((event) =>
  event.name.toLowerCase().includes(searchQuery.toLowerCase())
);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Atur breakpoint sesuai kebutuhan
  };

  window.addEventListener('resize', handleResize);
  handleResize(); // Cek ukuran saat komponen pertama kali dimuat

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);


  return (
    <>
      <div className='p-5'>
        <h1 className='mb-4 text-dark'>Event Saya</h1>
        <div className='flex items-center'>
        <InputField
            type='text'
            size='sm'
            placeholder='Cari Event'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Tabs
        variant='solid'
        aria-label='Tabs variants'
        color='secondary'
        selectedKey={status}
        onSelectionChange={(key: any) => setStatus(key)}
        classNames={{
          tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
          tab: 'max-w-fit lg:p-5 md:p-5 p-1 ',
          cursor: 'rounded-b-none border-b-2 border-b-primary-base',
        }}
      >
         <Tab title='Semua Event'>
          {!loading ? (
            data && data.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5'>
                {data.map((event: EventProps) => (
                  <EventCardCreator
                    key={event.id}
                    title={event.name}
                    eventStatus={event.has_event_status.name}
                    img={event.image}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator.image}
                    creator={event.has_creator.name}
                    event_status_id={event.event_status_id}
                  />
                ))}
              </div>
            ) : (
              <div className='border border-primary-light-200 flex flex-col items-center justify-center min-h-[80vh] rounded-md gap-3 text-center text-dark'>
                <Image src={addevent} alt='draft' />
                <h3 className='text-xl font-semibold'>Belum ada event</h3>
                <p className='px-10'>
                  Mulai buat eventmu dengan klik button “Buat Event” di bawah.
                </p>
                <Button
                  color='primary'
                  startIcon={faPlusCircle}
                  label='Buat Event'
                  onClick={() => router.push('/create-event')}
                  className='mt-3'
                />
              </div>
            )
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </div>
          )}
        </Tab>
        <Tab title='Event Aktif'>
          {!loading ? (
            data && data.some(event => event.event_status_id === 3) ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5'>
                {data.filter(event => event.event_status_id === 3).map((event) => (
                  <EventCardCreator
                    key={event.id}
                    eventStatus={event.has_event_status.name}
                    title={event.name}
                    img={event.image}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator.image}
                    creator={event.has_creator.name}
                    event_status_id={event.event_status_id}
                  />
                ))}
              </div>
            ) : (
              <div className='border border-primary-light-200 flex flex-col items-center justify-center min-h-[80vh] rounded-md gap-3 text-center text-dark'>
                <Image src={addevent} alt='draft' />
                <h3 className='text-xl font-semibold'>Belum ada event yang dibuat</h3>
                <p className='px-10'>
                  Mulai buat eventmu dengan klik button “Buat Event” di bawah.
                </p>
                <Button
                  color='primary'
                  startIcon={faPlusCircle}
                  label='Buat Event'
                  onClick={() => router.push('/create-event')}
                  className='mt-3'
                />
              </div>
            )
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </div>
          )}
        </Tab>

        <Tab title='Event Draf'>
          {!loading ? (
            data && data.some(event => event.event_status_id === 2) ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5'>
                {data.filter(event => event.event_status_id === 2).map((event: EventProps) => (
                  <EventCardCreator
                    key={event.id}
                    eventStatus={event.has_event_status.name}
                    title={event.name}
                    img={event.image}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator.image}
                    creator={event.has_creator.name}
                    event_status_id={event.event_status_id}

                  />
                ))}
              </div>
            ) : (
              <div className='border border-primary-light-200 flex flex-col items-center justify-center min-h-[80vh] rounded-md gap-3 text-center text-dark'>
                <Image src={addevent} alt='draft' />
                <h3 className='text-xl font-semibold'>Belum ada event draf</h3>
                <p className='px-10'>
                  Mulai buat eventmu dengan klik button “Buat Event” di bawah.
                </p>
                <Button
                  color='primary'
                  startIcon={faPlusCircle}
                  label='Buat Event'
                  onClick={() => router.push('/create-event')}
                  className='mt-3'
                />
              </div>
            )
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </div>
          )}
        </Tab>

        <Tab title='Event Lalu'>
          {!loading ? (
            data && data.some(event => event.event_status_id === 4) ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5'>
                {data.filter(event => event.event_status_id === 4).map((event: EventProps) => (
                  <EventCardCreator
                    key={event.id}
                    title={event.name}
                    eventStatus={event.has_event_status.name}
                    img={event.image}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator.image}
                    creator={event.has_creator.name}
                    event_status_id={event.event_status_id}

                  />
                ))}
              </div>
            ) : (
              <div className='border border-primary-light-200 flex flex-col items-center justify-center min-h-[80vh] rounded-md gap-3 text-center text-dark'>
                <Image src={addevent} alt='draft' />
                <h3 className='text-xl font-semibold'>Belum ada event lalu</h3>
                <p className='px-10'>
                  Mulai buat eventmu dengan klik button “Buat Event” di bawah.
                </p>
                <Button
                  color='primary'
                  startIcon={faPlusCircle}
                  label='Buat Event'
                  onClick={() => router.push('/create-event')}
                  className='mt-3'
                />
              </div>
            )
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </div>
          )}
        </Tab>

       
      </Tabs>
    </>
  );
};

export default MyEvent;
