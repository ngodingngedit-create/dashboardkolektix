import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { ActionIcon, Badge, Box, Card, Divider, Flex, NumberFormatter, Stack, Text } from '@mantine/core';
import { TicketProps } from '@/utils/globalInterface';
import moment from 'moment';
import { Icon } from '@iconify/react/dist/iconify.js';

interface OrderCounterProps {
    count: number;
    setCount: (count: number) => void;
    isSoldOut?: boolean;
    isFinish?: boolean;
    isReady?: boolean;
    title: string;
    price: number;
    isLogin: boolean;
    description?: string;
    ticketData: TicketProps;
}

const OrderCounter = ({ count, ticketData, setCount, isSoldOut, title, price, isLogin, isFinish, isReady, description }: OrderCounterProps) => {
    const router = useRouter();
    //194e9e
    return (
        <Card radius={10} withBorder p={20} className={`!border-primary-disabled/35 !overflow-visible`} bg={(isSoldOut || isReady || isFinish) ? '#fafafa' : undefined}>
            <Stack gap={10}>
                <Flex gap={20} justify="space-between">
                  <Stack gap={0}>
                      <Text size="lg" className={`uppercase`}>{ticketData.name}</Text>
                      <Text size="sm" c="gray">{ticketData.description}</Text>
                  </Stack>
                  <Text size="lg" fw={600}>
                    <NumberFormatter value={ticketData.price} />
                  </Text>
                </Flex>
                <Flex className={`shrink-0 mx-[-30px] relative z-10`} align="center" gap={10}>
                    <Box className={`bg-white border-r border-r-primary-disabled/35 w-[20px] h-[20px] rounded-full shrink-0`} />
                    <Divider className={`!border-dashed w-full`} />
                    <Box className={`bg-white border-l border-l-primary-disabled/35 w-[20px] h-[20px] rounded-full shrink-0`} />
                </Flex>
                <Flex justify="space-between" gap={20} align="center">
                  {isReady && (
                    <>
                      <Box>
                          <Text size="sm" className={`!text-primary-base`}>Penjualan tiket dimulai pada {moment(ticketData.ticket_date).format('DD MMM YYYY')}</Text>
                      </Box>
                      <Badge color="gray" className={`shrink-0`}>
                        Belum dimulai
                      </Badge>
                    </>
                  )}
                  {isFinish && (
                    <>
                      <Box></Box>
                      <Badge color="gray" className={`shrink-0`}>
                        Event Selesai
                      </Badge>
                    </>
                  )}
                  {isSoldOut && (
                    <>
                      <Box></Box>
                      <Badge color="red" className={`shrink-0`}>
                        Sudah Habis
                      </Badge>
                    </>
                  )}
                  {(!isReady && !isSoldOut && !isFinish) && (
                    <>
                      <Box>
                          <Text size="sm" className={`!text-primary-base`}>Penjualan tiket berakhir pada {moment(ticketData.ticket_end).format('DD MMM YYYY')}</Text>
                      </Box>
                      <Flex align="center" gap={15}>
                        <ActionIcon color="#194e9e" onClick={() => setCount(count - 1)} disabled={count <= 0}>
                          <Icon icon="uiw:minus" />
                        </ActionIcon>
                        <Text>{count}</Text>
                        <ActionIcon color="#194e9e" onClick={() => setCount(count + 1)} disabled={ticketData.max_buy_ticket == count}>
                          <Icon icon="uiw:plus" />
                        </ActionIcon>
                      </Flex>
                    </>
                  )}
                </Flex>
            </Stack>
        </Card>
    );

    return (
        <div className={`border ${isSoldOut ? 'bg-[#ffebec] border-[#ffebec]' : isFinish ? 'bg-primary-light border-primary-light-200' : isReady ? 'bg-light-grey border-primary-light' : 'border-primary'} rounded-xl flex items-center shadow-sm justify-between p-4 mb-5`}>
            <div>
                <p>{title}</p>
                <p>{description}</p>
                <p className="font-semibold">{price === 0 ? 'Free' : `Rp ${price.toLocaleString('id-ID')}`}</p>
            </div>
            <div className="flex items-center gap-3">
                {isSoldOut ? (
                    <button className="bg-[#ff9292] text-[#870809] px-3 py-1 text-sm font-semibold rounded-2xl">Sold Out</button>
                ) : isFinish ? (
                    <button className="bg-primary-900 text-primary-disabled px-3 py-1 text-sm font-semibold rounded-2xl">Event Selesai</button>
                ) : isReady ? (
                    <button className="bg-primary-light-200 text-dark px-3 py-1 text-sm font-semibold rounded-2xl" disabled>
                        Belum di mulai
                    </button>
                ) : (
                    <>
                        <button className="bg-primary-base px-2 text-lg text-white rounded-sm disabled:opacity-50" disabled={count === 0} onClick={() => setCount(count - 1)}>
                            -
                        </button>
                        <p>{count}</p>
                        <button className="bg-primary-base px-2 text-lg text-white rounded-sm" onClick={() => setCount(count + 1)}>
                            +
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderCounter;
