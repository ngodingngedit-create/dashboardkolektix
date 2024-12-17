import HeroSection from '@/components/HeroSection';
import EventList from '@/components/Home/EventList';
import CategoryBlock from '@/components/Home/CategoryBlock';
import { useEffect, useState } from 'react';
import { Get } from '@/utils/REST';
import { EventProps, SliderProps, VacancyProps } from '@/utils/globalInterface';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import PromoBlock from '@/components/Home/PromoBlock';
import JobsList from '@/components/Home/JobsList';
import TalentList from '@/components/Home/TalentList';
import MerchandiseList from '@/components/Home/MerchandiseList';
import ChatBox from '@/components/chat';
import useWindowSize from '@/utils/useWindowSize';

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<EventProps[]>([]);
  const [vacancy, setVacancy] = useState<VacancyProps[]>([]);
  const [sliderData, setSliderData] = useState<SliderProps[]>([]);
  const [activeRequests, setActiveRequests] = useState<number>(0);
  const [upcoming, setUpcoming] = useState<EventProps[]>([]);

  const handleRequestStart = () => {
    setActiveRequests((prev) => prev + 1);
    setLoading(true);
  };

  const handleRequestEnd = () => {
    setActiveRequests((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setLoading(false);
      }
      return newCount;
    });
  };
  const getData = () => {
    handleRequestStart();
    Get('event', {})
      .then((res: any) => {
        setData(res.data.sort((b: any, a: any) => {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      }));
        handleRequestEnd();
      })
      .catch((err) => {
        console.log(err);
        handleRequestEnd();
      });
  };

  const getVacancy = () => {
    handleRequestStart();
    Get('vacancy', {})
      .then((res: any) => {
        setVacancy(res.data);
        handleRequestEnd();
      })
      .catch((err) => {
        handleRequestEnd();
      });
  };

  const getSliderData = () => {
    handleRequestStart();
    Get('slider', {})
      .then((res: any) => {
        setSliderData(res.data);
        handleRequestEnd();
      })
      .catch((err) => {
        handleRequestEnd();
      });
  };

  const getUpcomingData = () => {
    handleRequestStart();
    Get('event-up-coming', {})
      .then((res: any) => {
        setUpcoming(res.data);
        handleRequestEnd();
      })
      .catch((err) => {
        handleRequestEnd();
      });
  };

  useEffect(() => {
    Cookies.remove('ticketCount', { path: '/' });
    Cookies.remove('selected', { path: '/' });
    getData();
    getUpcomingData();
    getVacancy();
    getSliderData();
  }, []);

  useEffect(() => {
    console.log(activeRequests, 'request');
    console.log(loading, 'loading');
  }, [loading]);
  return (
    <main className='bg-white min-h-screen'>
      <HeroSection data={upcoming} loading={loading} slider={sliderData} />
      {/* <EventList data={data} loading={loading} /> */}
      <CategoryBlock />
      <EventList data={data} loading={loading} />
      <PromoBlock />
      <ChatBox />
      {/* <JobsList data={vacancy} loading={loading} /> */}
      {/* <TalentList /> */}
      {/* <MerchandiseList /> */}
    </main>
  );
}
