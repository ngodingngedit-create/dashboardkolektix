import React from 'react';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDate } from '@/utils/useFormattedDate';
import { Flex, Stack, Text } from '@mantine/core';

interface TicketContainerProps {
  type: string;
  category: string;
  price: number;
  name: string;
  description: string;
  ticketDate: string | null;
  ticketEnd: string | null;
  onDelete?: () => void;
  onEdit?: () => void;
}

const TicketContainer = ({
  type,
  category,
  price,
  name,
  description,
  ticketDate,
  ticketEnd,
  onDelete,
  onEdit,
}: TicketContainerProps) => {
  return (
    <div className='w-full bg-primary-light border-2 border-primary-light-200 rounded-md'>
      <div className='p-4 border-2 border-b-primary-light-200 border-dashed border-x-0 border-t-0'>
        <Flex justify="space-between" wrap="wrap" gap={10}>
          <Stack gap={0}>
            <p className='font-semibold'>{name}</p>
            <p className='text-grey text-sm'>{category}</p>
          </Stack>
          {/* <Stack gap={0} align="end">
            <Text size="xs" c="gray">Total 0 Tiket</Text>
            <Text size="xs" c="gray">Terjual 0 Tiket</Text>
          </Stack> */}
        </Flex>
      </div>
      <div className='p-4 flex justify-between'>
        <div>
          {' '}
          <p className='font-semibold'>
            {type === 'Berbayar' ? `Rp${price?.toLocaleString('id-ID')}` : 'Gratis'}
          </p>
          <p className='text-grey text-xs mt-1'>
            {' '}
            {`Dijual tanggal ${ticketDate && formatDate(ticketDate)} ${
              ticketEnd && '-' + formatDate(ticketEnd)
            }`}
          </p>
        </div>
        <div className='flex gap-2'>
          {onEdit && (
            <button
              onClick={onEdit}
              className='p-2 w-10 h-10 text-primary-dark  bg-white border border-primary-light-200 rounded-lg hover:bg-primary-base hover:text-white transition-all'
            >
              <FontAwesomeIcon icon={faPenToSquare} size='lg' />
            </button>
          )}
          <button
            onClick={onDelete}
            className='p-2 w-10 h-10 text-primary-dark  bg-white border border-primary-light-200 rounded-lg hover:bg-primary-base hover:text-white transition-all'
          >
            <FontAwesomeIcon icon={faTrashCan} size='lg' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketContainer;
