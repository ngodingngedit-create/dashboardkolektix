import SidebarComponent from '@/components/SidebarComponent';
import TicketCard from '@/components/TicketCard';
import { Tabs, Tab, Select, SelectItem } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { Get } from '@/utils/REST';
import { TransactionProps } from '@/utils/globalInterface';
import React from 'react';

export default function Dashboard() {
  const [data, setData] = useState<TransactionProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  const getData = (status: string) => {
    setLoading(true);
    Get(`transaction-list-by-user?status=${status}`, {})
      .then((res: any) => {
        setData(res.data);
        setLoading(false);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getData(status);
  }, [status]);

  // Pisahkan event aktif dan event lalu
  const currentDate = new Date();
  const eventAktif = data.filter(item => new Date(item.has_event?.end_date) >= currentDate);
  const eventLalu = data.filter(item => new Date(item.has_event?.end_date) < currentDate);

  return (
    <>
      <Tabs
        variant='underlined'
        aria-label='Tabs variants'
        className='px-5 border border-b-primary-light-200 border-x-0 border-t-0 pt-5'
        fullWidth
        classNames={{ tabList: 'pb-0 w-full md:w-4/12', tab: 'justify-start' }}
      >
        <Tab key='active' title='Event Aktif'>
          <div className='px-5'>
            {loading ? (
              <div className='w-full flex items-center gap-3 border-2 border-[#dddddd] shadow-sm rounded-md justify-between px-3 py-3'>
                <div className='w-full animate-pulse'>
                  <div className='h-2.5 bg-[#dddddd] rounded-full  w-full mb-3'></div>
                  <div className='flex text-xs text-grey gap-2 justify-between'>
                    <div>
                      <div className='h-2.5 bg-[#dddddd] rounded-full  w-48 mb-3'></div>
                      <div className='h-6 bg-[#dddddd] rounded-md  w-48 mb-3'></div>
                      <div className='h-2.5 bg-[#dddddd] rounded-md  w-60 mb-3'></div>
                      <div className='h-7 bg-[#dddddd] rounded-md  w-42'></div>
                    </div>
                    <div className='h-28 w-52 bg-[#dddddd] rounded-md'></div>
                  </div>
                </div>
              </div>
            ) : eventAktif.length > 0 ? (
              eventAktif.map((item: any, idx: number) => <TicketCard key={idx} data={item} />)
            ) : (
              <p className='text-dark text-sm ml-2'>Anda belum memiliki transaksi saat ini</p>
            )}
          </div>
        </Tab>
        <Tab key='history' title='Event Lalu'>
          <div className='px-5 text-dark'>
            {eventLalu.length > 0 ? (
              eventLalu.map((item: any, idx: number) => <TicketCard key={idx} data={item} />)
            ) : (
              <p className='text-dark text-sm ml-2'>Belum ada event</p>
            )}
          </div>
        </Tab>
      </Tabs>
    </>
  );
}
