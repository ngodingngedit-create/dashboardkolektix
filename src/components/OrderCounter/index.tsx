import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { ActionIcon, Badge, Box, Card, Divider, Flex, NumberFormatter, Stack, Text } from '@mantine/core';
import { TicketProps } from '@/utils/globalInterface';
import moment from 'moment';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useEffect, useMemo, useState } from 'react';
import { randomId, useInterval } from '@mantine/hooks';

interface OrderCounterProps {
    count: number;
    setCount: (count: number) => void;
    isSoldOut?: boolean;
    isFinish?: boolean;
    isReady?: boolean;
    isFullbook?: boolean;
    title: string;
    price: number;
    isLogin: boolean;
    description?: string;
    ticketData: TicketProps;
    maxOrder?: number;
}

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

const OrderCounter = ({ maxOrder, count, ticketData: _ticketData, setCount, isSoldOut, isFullbook, title, price, isLogin, isFinish, isReady, description }: OrderCounterProps) => {
    const [timeoutHash, setTimeoutHash] = useState('');
    const interval = useInterval(() => setTimeoutHash(randomId()), 1000);

    useEffect(() => {
        interval.start();
    }, []);

    const ticketData = useMemo(() => _ticketData, [timeoutHash]);

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
                        <ActionIcon color="#194e9e" onClick={() => setCount(count + 1)} disabled={(maxOrder ?? 9999) == count}>
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
    //194e9e
    return (
        <Card radius={10} withBorder p={20} className={`!border-primary-disabled/35 !overflow-visible`} bg={isSoldOut || isReady || isFinish ? '#fafafa' : undefined}>
            <Stack gap={10}>
                <Flex gap={20} justify="space-between">
                    <Stack gap={0}>
                        <Text size="lg" className={`uppercase`}>
                            {ticketData.name}
                        </Text>
                        {ticketData.description && (
                            <Text size="sm" c="gray">
                                {ticketData.description?.split('\n').map((e, i) => (
                                    <Text key={i}>{e}</Text>
                                ))}
                            </Text>
                        )}
                    </Stack>
                    <Text size="lg" fw={600}>
                        {ticketData.price <= 0 ? (
                            <Text c="green" component="span" fw={600}>FREE</Text>
                        ) : (
                            <NumberFormatter value={ticketData.price} />
                        )}
                    </Text>
                </Flex>
                <Flex className={`shrink-0 mx-[-30px] relative z-10`} align="center" gap={10}>
                    <Box className={`bg-white border-r border-r-primary-disabled/35 w-[20px] h-[20px] rounded-full shrink-0`} />
                    <Divider className={`!border-dashed w-full`} />
                    <Box className={`bg-white border-l border-l-primary-disabled/35 w-[20px] h-[20px] rounded-full shrink-0`} />
                </Flex>
                <Flex justify="space-between" gap={20} align="center">
                    <StatusComponent />
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
