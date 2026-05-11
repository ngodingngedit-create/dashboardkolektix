import React from "react";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "@/utils/useFormattedDate";
import { Button, ColorInput, Flex, Stack, Text } from "@mantine/core";

interface TicketContainerProps {
  type: string;
  category: string;
  price: number;
  name: string;
  description: string;
  ticketDate: string | null;
  ticketEnd: string | null;
  qty?: number;
  sold?: number;
  onDelete?: () => void;
  onEdit?: () => void;
  onSelectSeatButton?: () => void;
  onSelectSeatColor?: (color: string) => void;
  seatColor?: string;
  isSoldout?: number;
  isFinish?: number;
  isReady?: number;
  isFullbook?: number;
  isAdmin?: boolean;
}

const TicketContainer = ({
  type,
  category,
  price,
  name,
  description,
  ticketDate,
  ticketEnd,
  qty,
  sold,
  onDelete,
  onEdit,
  onSelectSeatButton,
  onSelectSeatColor,
  seatColor,
  isSoldout,
  isFinish,
  isReady,
  isFullbook,
  isAdmin,
}: TicketContainerProps) => {
  const isSeated = category?.toLowerCase().includes("seat");

  return (
    <div className="w-full bg-primary-light border-2 border-primary-light-200 rounded-xl">
      <div className="p-4 border-2 border-b-primary-light-200 border-dashed border-x-0 border-t-0">
        <Flex justify="space-between" wrap="wrap" gap={10} align="center">
          <Stack gap={0}>
            <p className="font-semibold capitalize">{name}</p>
            <Flex gap={5} align="center">
              <p className="text-grey text-sm">{category}</p>
              {isAdmin && (
                <>
                  {isSoldout === 1 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">Sold Out</span>}
                  {isFinish === 1 && <span className="bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">Finish</span>}
                  {isReady === 1 && <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">Ready</span>}
                  {isFullbook === 1 && <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">Fullbook</span>}
                </>
              )}
            </Flex>
          </Stack>
          {onSelectSeatButton && (
            <Button onClick={onSelectSeatButton} variant="light" size="xs">
              Pilih Seat
            </Button>
          )}
          {onSelectSeatColor && !onSelectSeatButton && (
            <Stack gap={5} align="end">
              <Text c="gray" size="xs">
                Warna Seat Terbeli
              </Text>
              <ColorInput size="xs" w={100} value={seatColor} onChange={(e) => onSelectSeatColor(e)} />
            </Stack>
          )}
        </Flex>
      </div>
      <div className="p-4 flex justify-between items-center">
        <Flex gap={20} align="center" wrap="wrap">
          <div>
             <Text size="xs" c="dimmed">Harga</Text>
             <p className="font-semibold">{type === "Berbayar" ? `Rp${price?.toLocaleString("id-ID")}` : "Gratis"}</p>
          </div>
          
          <Flex gap={15} bg="white" px={12} py={6} style={{ borderRadius: '10px', border: '1px solid #E2EEFE' }}>
            {!isSeated && (
               <Stack gap={0} pr={15} style={{ borderRight: '1px solid #E2EEFE' }}>
                  <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>Jumlah Tiket</Text>
                  <Text size="sm" fw={700} c="dark">{qty?.toLocaleString("id-ID") || 0}</Text>
               </Stack>
            )}
            <Stack gap={0}>
               <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>Total Terjual</Text>
               <Text size="sm" fw={800} c="#194E9E">{sold?.toLocaleString("id-ID") || 0}</Text>
            </Stack>
          </Flex>
        </Flex>
        <div className="flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="p-2 w-10 h-10 text-primary-dark  bg-white border border-primary-light-200 rounded-lg hover:bg-primary-base hover:text-white transition-all">
              <FontAwesomeIcon icon={faPenToSquare} size="lg" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-2 w-10 h-10 text-primary-dark  bg-white border border-primary-light-200 rounded-lg hover:bg-primary-base hover:text-white transition-all">
              <FontAwesomeIcon icon={faTrashCan} size="lg" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketContainer;
