import React, { useCallback, useContext, useMemo } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import OrderCounter from '../OrderCounter';
import { TicketProps } from '@/utils/globalInterface';
import moment from 'moment';
import { SeatmapData } from '@/utils/formInterface';
import { Context } from '@/pages/event/[slug]';
import { notifications } from '@mantine/notifications';

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
  counts: { [key: number]: number | string[] };
  setCounts: (counts: { [key: string]: number | string[] }) => void;
  data: TicketProps[];
  isLogin: boolean;
  selected: number;
  setSelected: (index: number) => void;
  maxOrder?: number;
}

export default function DateTab({
  maxOrder,
  counts,
  setCounts,
  data,
  isLogin,
  selected,
  setSelected,
}: Props) {
  const { eventData } = useContext(Context);

  const handleCount = (id: number, newCount: number | string) => {
    const data = counts[id];
    const countData = typeof newCount == 'number' ?
      newCount :
      ((typeof data != 'number' ? data : [])).includes(newCount) ? 
        (data as string[]).filter(e => e != newCount) :
        [...((typeof data != 'number' ? data : []) ?? []), newCount]

    const length = typeof countData == 'number' ? countData : countData.length;

    if (length > (eventData?.max_buy_ticket ?? 999)) {
      notifications.show({
        message: `Maksimal ${eventData?.max_buy_ticket} tiket`,
        color: 'red',
      });
      return;
    }

    setCounts({
      ...counts,
      [id]: countData,
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
        const date = item.event_schedule_date;
        if (date != null) {
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
      }));
    };

    setGroupedTickets(combineTicketsByDate(data).reverse());
  }, [data]);

  const sortedTicket = useCallback((data: GroupTicket['tickets']) => {
    return data.sort((a, b) => {
      const dateA = moment(`${a.ticket_date} ${a.starting_time}`, 'YYYY-MM-DD HH:mm');
      const dateB = moment(`${b.ticket_end} ${b.ending_time}`, 'YYYY-MM-DD HH:mm');
      return dateA.diff(dateB); // Mengurutkan berdasarkan selisih waktu
    });
  }, [groupedTickets]);

  return (
    <div className='flex flex-col'>
      <TabGroup manual selectedIndex={selected} onChange={setSelected}>
        <TabList className={`${groupedTickets.length > 1 ? 'flex' : 'hidden'} gap-2 overflow-x-scroll mb-2`}>
          {groupedTickets.map(({ date }) => (
            <Tab
              key={date}
              className='rounded-md px-1.5 max-w-16 min-w-16 h-14 text-xs border-2 border-primary-light-200 font-semibold text-dark focus:outline-none data-[selected]:bg-primary-base data-[selected]:text-white data-[focus]:outline-1 data-[focus]:outline-primary-base'
            >
              {formatDate(date)}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {groupedTickets.map(({ date, tickets }) => (
            <TabPanel key={date} className='rounded-xl bg-white/5 pt-3 flex-col gap-3 flex'>
              {sortedTicket(tickets).map((item, index) => (
                <OrderCounter
                  index={index}
                  isFullbook={(item?.is_fullbook ?? 0) == 1}
                  maxOrder={maxOrder}
                  ticketData={item}
                  description={item.description}
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
