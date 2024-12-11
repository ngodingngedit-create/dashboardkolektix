import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { ActionIcon, Badge, Box, Flex, Text } from '@mantine/core';
import moment from 'moment';
import { TicketProps } from '@/utils/globalInterface';
import { Icon } from '@iconify/react/dist/iconify.js';

interface TicketCounterProps {
  count: number;
  setCount: (count: number) => void;
  isSoldOut?: boolean;
  isFinish?: boolean;
  isReady?: boolean;
  title: string;
  price: number;
  isLogin: boolean;
  max?: number;
  isFullbook?: boolean;
  ticketData: TicketProps;
}

const TicketCounter = ({
  ticketData,
  count,
  setCount,
  isSoldOut,
  title,
  price,
  isLogin,
  isFinish,
  isReady,
  isFullbook,
  max,
}: TicketCounterProps) => {
  const router = useRouter();

  function isCurrentTimeBetween(startDate: string, endDate: string): boolean {
    const start = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
    const end = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
    const now = moment();

    return now.isBetween(start, end, undefined, '[]');
  }

  function isDatePassed(dateString: string) {
      const date = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
      return date.isBefore(moment());
  }

  const StatusComponent = () => {
      if (isFullbook)
          return (
              <>
                  <Box></Box>
                  <Badge color="gray" className={`shrink-0`}>
                      Full Booked
                  </Badge>
              </>
          );

      if (isSoldOut)
          return (
              <>
                  <Box></Box>
                  <Badge color="red" className={`shrink-0`}>
                      Habis Terjual
                  </Badge>
              </>
          );

      if (isFinish)
          return (
              <>
                  <Box></Box>
                  <Badge color="gray" className={`shrink-0`}>
                      Event Selesai
                  </Badge>
              </>
          );

      if (!isDatePassed(`${ticketData.ticket_date} ${ticketData?.starting_time ?? '00:00:00'}`))
          return (
              <>
                  <Box>
                      <Text size="sm" className={`!text-primary-base`}>
                          {price <= 0 ? 'Registrasi' : 'Penjualan'} tiket dimulai
                      </Text>
                      <Text size="xs" className={`!text-primary-base`}>
                          {moment(`${ticketData.ticket_date} ${ticketData?.starting_time ?? '00:00:00'}`).format('DD MMM YYYY')} - Jam {moment(`${ticketData.ticket_date} ${ticketData?.starting_time ?? '00:00:00'}`).format('HH:mm')} WIB
                      </Text>
                  </Box>
                  <Badge color="gray" className={`shrink-0`}>
                      Belum dimulai
                  </Badge>
              </>
          );

      if (isDatePassed(`${ticketData.ticket_end} ${ticketData?.ending_time ?? '00:00:00'}`))
          return (
              <>
                  <Box></Box>
                  <Badge color="gray" className={`shrink-0`}>
                      {price <= 0 ? 'Registrasi' : 'Penjualan'} Selesai
                  </Badge>
              </>
          );

      if (isCurrentTimeBetween(`${ticketData.ticket_date} ${ticketData?.starting_time ?? '00:00:00'}`, `${ticketData.ticket_end} ${ticketData?.ending_time ?? '00:00:00'}`))
          return (
              <>
                  <Box>
                      <Text size="sm" className={`!text-primary-base`}>
                          {price <= 0 ? 'Registrasi' : 'Penjualan'} tiket berakhir
                      </Text>
                      <Text size="xs" className={`!text-primary-base`}>
                          {moment(`${ticketData.ticket_end} ${ticketData?.ending_time ?? '00:00:00'}`).format('DD MMM YYYY')} - Jam {moment(`${ticketData.ticket_end} ${ticketData?.ending_time ?? '00:00:00'}`).format('HH:mm')} WIB
                      </Text>
                  </Box>
                  <Flex align="center" gap={15}>
                      <ActionIcon color="#194e9e" onClick={() => setCount(count - 1)} disabled={count <= 0}>
                          <Icon icon="uiw:minus" />
                      </ActionIcon>
                      <Text>{count}</Text>
                      <ActionIcon color="#194e9e" onClick={() => setCount(count + 1)} disabled={(max ?? 9999) == count}>
                          <Icon icon="uiw:plus" />
                      </ActionIcon>
                  </Flex>
              </>
          );

      return (
          <>
              <Box></Box>
              <Badge color="gray" className={`shrink-0`}>
                  Event Selesai
              </Badge>
          </>
      );
  };

  return (
    <div
      className={`border ${
        isSoldOut
          ? 'bg-[#ffebec] border-[#ffebec]'
          : isFinish
          ? 'bg-primary-light border-primary-light-200'
          : isReady
          ? 'bg-gray-200 border-gray-200'
          : 'border-primary-light-200'
      } rounded-md flex flex-col shadow-sm mb-5 divide-y-2 divide-primary-light-200 divide-dashed bg-primary-light`}
    >
      <div className='p-3'>
        <p className=''>{title}</p>
      </div>
      <div className='flex items-center justify-between p-3'>
        <p className='font-semibold'>Rp {price.toLocaleString('id-ID')}</p>
        <div className='flex items-center gap-3'>
          {isSoldOut ? (
            <button className='bg-[#ff9292] text-[#870809] px-3 py-1 text-sm font-semibold rounded-2xl'>
              Sold Out
            </button>
          ) : isFinish ? (
            <button className='bg-primary-light-200 text-primary-disabled px-3 py-1 text-sm font-semibold rounded-2xl'>
              Event Selesai
            </button>
          ) : isReady ? (
            <button className='bg-gray-300 text-gray-500 px-3 py-1 text-sm font-semibold rounded-2xl' disabled>
              Belum di mulai
            </button>
          ) : (
            <>
              <StatusComponent />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCounter;
