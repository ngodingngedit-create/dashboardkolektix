import React from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { EventProps, TicketProps } from '@/utils/globalInterface';
import TicketCounter from '../TicketCounter';

interface Props {
  counts: { [key: number]: number };
  setCounts: (counts: { [key: string]: number }) => void;
  data: TicketProps[];
  isLogin: boolean;
  selected: number;
  setSelected: (index: number) => void;
  eventData?: EventProps;
}

interface GroupTicket {
  date: string;
  tickets: TicketProps[];
}

export default function TicketPicker({
  counts,
  setCounts,
  data,
  isLogin,
  selected,
  setSelected,
  eventData,
}: Props) {
  const handleCount = (id: number, newCount: number) => {
    setCounts({
      ...counts,
      [id]: newCount,
    });
  };

  const [groupedTickets, setGroupedTickets] = React.useState<GroupTicket[]>([]);

  function formatDay(dateString: string) {
    const date = new Date(dateString);
    let formattedDate = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
    }).format(date);

    formattedDate = formattedDate.replace(',', '');
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }
  function formatDate(dateString: string) {
    let day = '';
    const date = new Date(dateString);
    const today = new Date();
    let formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(date);

    formattedDate = formattedDate.replace(',', '');
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      day = 'Hari ini';
    } else {
      day = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
    return day;
  }

  React.useEffect(() => {
    const combineTicketsByDate = (tickets: TicketProps[]): GroupTicket[] => {
      const groupedByDate = tickets.reduce((acc: { [key: string]: TicketProps[] }, item) => {
        const date = item.event_schedule_date;
        if (date) {
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
        }
        return acc;
      }, {});

      return Object.keys(groupedByDate).map((date) => ({
        date,
        tickets: groupedByDate[date],
      })).reverse();
    };

    setGroupedTickets(combineTicketsByDate(data));
  }, [data]);

  return (
    <div className='flex flex-col'>
      <TabGroup manual selectedIndex={selected} onChange={setSelected}>
        <TabList className='flex gap-4 overflow-x-scroll'>
          {groupedTickets.map(({ date }) => (
            <Tab
              key={date}
              className='rounded-md px-1.5 max-w-20 min-w-20 h-12 text-xs border-2 border-primary-light-200 font-semibold text-dark focus:outline-none  data-[selected]:bg-primary-dark data-[selected]:border-primary-dark data-[selected]:text-white  data-[focus]:outline-1 data-[focus]:outline-primary-base'
            >
              <p className='font-normal text-[12px]'>{formatDay(date)}</p>
              <p>{formatDate(date)}</p>
            </Tab>
          ))}
        </TabList>
        <TabPanels className='mt-3'>
          {groupedTickets.map(({ date, tickets }) => (
            <TabPanel key={date} className='rounded-xl bg-white/5 py-3'>
              {tickets.map((item) => (
                <TicketCounter
                  key={item.id}
                  isLogin={isLogin}
                  count={counts[item.id]}
                  setCount={(newCount) => handleCount(item.id, newCount)}
                  isSoldOut={item.is_soldout === 1}
                  isFinish={item.is_finish === 1}
                  isReady={item.is_ready === 1}
                  title={item.name}
                  price={item.price}
                  max={eventData?.max_buy_ticket}
                />
              ))}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
