import React from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import OrderCounter from '../OrderCounter';
import { TicketProps } from '@/utils/globalInterface';

interface GroupTicket {
  date: string;
  tickets: TicketProps[];
}

interface TicketTabsProps {
  data: TicketProps[];
  isLogin: boolean;
  counts: { [key: number]: number };
  handleCount: (id: number, newCount: number) => void;
}

interface Props {
  counts: { [key: number]: number };
  setCounts: (counts: { [key: string]: number }) => void;
  data: TicketProps[];
  isLogin: boolean;
  selected: number;
  setSelected: (index: number) => void;
}

export default function DateTab({
  counts,
  setCounts,
  data,
  isLogin,
  selected,
  setSelected,
}: Props) {
  const handleCount = (id: number, newCount: number) => {
    setCounts({
      ...counts,
      [id]: newCount,
    });
  };
  const [groupedTickets, setGroupedTickets] = React.useState<GroupTicket[]>([]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    let formattedDate = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    }).format(date);

    formattedDate = formattedDate.replace(',', '');
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  React.useEffect(() => {
    const combineTicketsByDate = (tickets: TicketProps[]): GroupTicket[] => {
      const groupedByDate = tickets.reduce((acc: { [key: string]: TicketProps[] }, item) => {
        const date = item.ticket_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      return Object.keys(groupedByDate).map((date) => ({
        date,
        tickets: groupedByDate[date],
      }));
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
              className='rounded-md px-1.5 max-w-16 min-w-16 h-14 text-xs border-2 border-primary-light-200 font-semibold text-dark focus:outline-none data-[selected]:bg-primary-base data-[selected]:text-white data-[focus]:outline-1 data-[focus]:outline-primary-base'
            >
              {formatDate(date)}
            </Tab>
          ))}
        </TabList>
        <TabPanels className='mt-3'>
          {groupedTickets.map(({ date, tickets }) => (
            <TabPanel key={date} className='rounded-xl bg-white/5 p-3'>
              {tickets.map((item) => (
                <OrderCounter
                  key={item.id}
                  isLogin={isLogin}
                  count={counts[item.id]}
                  setCount={(newCount) => handleCount(item.id, newCount)}
                  isSoldOut={item.is_soldout === 1}
                  isFinish={item.is_finish === 1}
                  isReady={item.is_ready === 1}
                  title={item.name}
                  price={item.price}
                />
              ))}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
