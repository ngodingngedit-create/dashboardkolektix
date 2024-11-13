import React from 'react';
import EventCard from '@/components/Card/EventCard';
import { EventProps } from '@/utils/globalInterface';
import { Get } from '@/utils/REST';
import { useEffect, useState } from 'react';
import { Breadcrumbs, BreadcrumbItem, ScrollShadow } from '@nextui-org/react';
import EventCardLoading from '@/components/Card/EventCard/loading';
import Chat from '@/components/chat';

interface TopicProps {
  id: number;
  name: string;
  description: string;
  status: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

const Event = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<EventProps[]>([]);
  const [topic, setTopic] = useState<TopicProps[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const getData = () => {
    setLoading(true);
    Get('event', {})
      .then((res: any) => {
        setData(res.data);
        console.log("masuk", res);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getEventTopic = () => {
    setLoading(true);
    Get('event-topic', {})
      .then((res: any) => {
        setTopic(res);
        console.log(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getEventTopic();
    getData();
  }, []);

 
  const filteredData = activeCategory
    ? data.filter(event => event.has_event_topic?.name === activeCategory)
    : data;

  return (
    <>
      <Chat />
      <div className='text-dark max-w-6xl mx-auto min-h-screen py-10'>
        <div className='pl-4'>
          <Breadcrumbs>
            <BreadcrumbItem>Beranda</BreadcrumbItem>
            <BreadcrumbItem>List Event</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        {!loading ? (
          <>
            <ScrollShadow orientation='horizontal' className='max-w-full flex gap-2 px-4 pb-3 mt-3'>
              {topic.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveCategory(item.name)}
                  className={`cursor-pointer flex rounded-2xl items-center justify-center py-1 px-3 border ${
                    activeCategory !== item.name
                      ? 'text-dark-grey border-primary-light-200'
                      : 'text-primary-dark border-primary-dark'
                  }`}
                >
                  <p className='whitespace-nowrap'>{item.name}</p>
                </div>
              ))}
            </ScrollShadow>
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
              {filteredData.length > 0 ? (
                filteredData.map((event: any) => (
                  <EventCard
                    key={event.id}
                    title={event.name}
                    img={event.image_url}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator?.image}
                    creator={event.has_creator?.name}
                    creatorSlug={event.has_creator?.slug}
                  />
                ))
              ) : (
                <p className='text-center col-span-full'>No events available for the selected category.</p>
              )}
            </div>
          </>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
            <EventCardLoading />
            <EventCardLoading />
            <EventCardLoading />
            <EventCardLoading />
          </div>
        )}
      </div>
    </>
  );
};

export default Event;
