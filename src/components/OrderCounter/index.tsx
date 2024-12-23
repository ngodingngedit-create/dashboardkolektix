import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { ActionIcon, Badge, Box, Button, Card, Center, Divider, Flex, NumberFormatter, Stack, Text, Tooltip } from '@mantine/core';
import { TicketProps } from '@/utils/globalInterface';
import moment from 'moment';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { randomId, useInterval } from '@mantine/hooks';
import { Context } from '@/pages/event/[slug]';
import { SeatmapData } from '@/utils/formInterface';
import chunk from '@/utils/chunk';
import { contrastColor } from 'contrast-color';

interface OrderCounterProps {
    count?: number | string[];
    setCount: (count: number | string) => void;
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
    index: number;
}



const OrderCounter = ({ index, maxOrder, count: _count, ticketData: _ticketData, setCount, isSoldOut, isFullbook, title, price, isLogin, isFinish, isReady, description }: OrderCounterProps) => {
    // const _ticketData = {...__ticketData, 
    //     ticket_date: '2024-12-17',
    //     ticket_end: '2024-12-19',
    //     starting_time: '21:12:00',
    //     ending_time: '08:50:00',
    // };
    const count = useMemo(() => {
        if (!_count) return 0;
        return typeof _count == 'number' ? _count : _count.length;
    }, [_count])
    const { seatmapData, seatmapOpen, setSeatmapOpen, ticket } = useContext(Context);
    
    const selectedSeat = useMemo(() => {
        return ticket?.map(e => e.seat_number).reduce((c, n) => ([ ...(c ?? []), ...(n ?? []) ]), [])
    }, [ticket]);

    const [isCurrent, setIsCurrent] = useState(false);
    const [timeoutHash, setTimeoutHash] = useState('');
    const interval = useInterval(() => {
        if (!isCurrent) {
            setTimeoutHash(randomId());
        }
    }, 1000);

    useEffect(() => {
        interval.start();
    }, []);

    function isCurrentTimeBetween(startDate: string, endDate: string): boolean {
        const start = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
        const end = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
        const now = moment();
        const status = now.isBetween(start, end, undefined, '[]');
    
        if (status) {
            setIsCurrent(true);
            interval.stop();
        }

        return status;
    }
    
    function isDatePassed(dateString: string) {
        const date = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
        return date.isBefore(moment());
    }

    const ticketData = useMemo(() => {
        // console.log('update');
        return _ticketData;
    }, [timeoutHash]);

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
                    {ticketData.ticket_category == 'Seated' ? (
                        <Button onClick={() => setSeatmapOpen && setSeatmapOpen(index)}>
                            Pilih Seat
                        </Button>
                    ): (
                        <Flex align="center" gap={15}>
                            <ActionIcon color="#194e9e" onClick={() => setCount(count - 1)} disabled={count <= 0}>
                                <Icon icon="uiw:minus" />
                            </ActionIcon>
                            <Text>{count}</Text>
                            <ActionIcon color="#194e9e" onClick={() => setCount(count + 1)} disabled={(maxOrder ?? 9999) == count}>
                                <Icon icon="uiw:plus" />
                            </ActionIcon>
                        </Flex>
                    )}
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
        <Card radius={10} withBorder p={20} className={`!border-primary-disabled/35 !overflow-visible relative ${seatmapOpen == index ? '!pb-[100px]' : ''}`} bg={isSoldOut || isReady || isFinish ? '#fafafa' : undefined}>
            {/* {JSON.stringify(ticket)} */}
            {seatmapOpen == index && (
                <Card bg="gray.3" radius={10} className={`!absolute w-full h-full top-0 left-0 z-[40] !border-primary-disabled/35 !border`}>
                    <Button className={`!absolute z-[40] left-2 top-2 !text-primary-base`} size="xs" bg="white" leftSection={<Icon icon="uiw:left" />} onClick={() => setSeatmapOpen && setSeatmapOpen(undefined)}>
                        Kembali
                    </Button>

                    <Text className={`!absolute top-2 left-2/4 -translate-x-2/4 z-[40] !text-primary-base`} fw={600} size="sm">Pilih Kursi</Text>

                    <SeatmapViewer data={seatmapData} selectedSeat={selectedSeat} setSelectSeat={setCount} available={ticketData.available_seat_number} />
                </Card>
            )}

            <Stack gap={10}>
                <Flex gap={20} justify="space-between">
                    {/* ml={ticketData.ticket_category == 'Seated' ? 40 : undefined} */}
                    <Stack gap={0}>
                        <Flex align="center" gap={15}>
                            <Text size="lg" className={`uppercase`}>
                                {ticketData.name}
                            </Text>
                            {ticketData.ticket_category == 'Seated' && (
                                <Badge className={`bg-primary-base`}>Seated</Badge>
                            )}
                        </Flex>
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
                    {/* <Box className={`w-[300px] h-[100px] bg-primary-base absolute rotate-[-30deg] top-[-20px] left-[-200px]`}/> */}
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
};

export default OrderCounter;

type SeatmapViewerProps = {
    data?: SeatmapData[];
    selectedSeat?: string[];
    setSelectSeat?: (data: string) => void;
    available?: string;
}

const SeatmapViewer = ({ data, selectedSeat, setSelectSeat, available }: SeatmapViewerProps) => {
    const [isCanvasMove, setIsCanvasMove] = useState(false);
    const [scale, setScale] = useState(1);
    const [canvasPos, setCanvasPos] = useState<[number, number]>([0, 0]);

    const handleMouse = {
        down: () => {
            setIsCanvasMove(true);
            // setSelected(null);
        },
        up: () => {
            setIsCanvasMove(false);
        },
        move: (event: React.MouseEvent<HTMLDivElement>) => {
            if (isCanvasMove) {
                setCanvasPos([canvasPos[0] + (event.movementX / scale), canvasPos[1] + (event.movementY / scale)]);
            }
        },
    }

    if (!data) return <></>;

    return (
        <div onMouseDown={handleMouse.down} onMouseUp={handleMouse.up} onMouseMove={handleMouse.move} className={`h-full relative z-30 [&_*]:!select-none`}>
            <Card
                bg="transparent"
                pos="relative"
                style={{
                    scale: `${scale * 100}%`,
                    transform: `translate(${canvasPos[0]}px,${canvasPos[1]}px)`
                }}
                className={`z-20 !overflow-visible`}
            >
                <Box className={`absolute z-20 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4`}>
                    <SeatmapItem data={data} selectedSeat={selectedSeat} available={available} setSelectSeat={setSelectSeat} />
                </Box>
            </Card>
        </div>
    )
}

const SeatmapItem = ({ data, selectedSeat, setSelectSeat, available }: SeatmapViewerProps) => {
    const getContrastColor = useCallback((color: string) => {
        return contrastColor({ bgColor: color, threshold: 255 * 0.6 });
    }, []);

    const availableSeat = useMemo(() => {
        return available?.split(',');
    }, [available]);

    if (!data) return <></>;

    return (
        <>
            {data.map((e, i) => (
                // <Tooltip label={e.text} position="bottom" bg="gray.1" c="gray.8" key={i} withArrow>
                    <Box
                        className={`absolute z-30 [&_.hvr]:hover:!flex -translate-x-2/4 -translate-y-2/4`}
                        style={{
                            top: `${e.position[1]}px`,
                            left: `${e.position[0]}px`,
                            width: e.size && e.size[0] ? `${e.size[0]}px` : undefined,
                            height: e.size && e.size[1] ? `${e.size[1]}px` : undefined
                        }}
                        key={i}>

                        {e.type == 'seat' && (
                            <Flex className={`absolute bottom-[-30px] left-0`} gap={5}>
                                <Text size="sm" c="gray">{e.prefix}1 - {e.prefix}{(e?.col ?? 0) * (e?.row ?? 0)}</Text>
                            </Flex>
                        )}

                        <Box
                            bg={e.background ?? "gray.1"}
                            h="100%"
                            className={`rounded-md shadow-lg`}>
                            <Box
                                // onClick={() => handleSelect(i)}
                                className={`absolute w-full h-full left-0 top-0 z-20`}
                            />

                            {e.type == 'box' && (
                                <Center h="100%">
                                    <Text fw={500} className={`uppercase`} c={getContrastColor(e.background ?? '#fff')}>{e.text}</Text>
                                </Center>
                            )}

                            {e.type == 'seat' && (
                                <Stack h="100%" align="center" justify="center" gap={5} p={10}>
                                    {e.text && <Text size="xs" c="gray">{e.text}</Text>}
                                    <Stack gap={3} w="100%" h="100%" justify="space-between">
                                        {chunk((Array((e.row ?? 1) * (e.col ?? 1)).fill(e.prefix).map((e, i) => (`${e}${i + 1}`)) ?? []), (e.col ?? 1)).map((x, r) => (
                                            <Flex w="100%" h="100%" justify="space-between" key={r} className={`!gap-[7x] md:!gap-[5px]`}>
                                                {x.map((z, c) => (
                                                    <Tooltip label={z} key={c} fw={600}>
                                                        <Box
                                                            onClick={() => availableSeat?.includes(z) && setSelectSeat && setSelectSeat(z)}
                                                            opacity={selectedSeat?.includes(z) ? 0.5 : 1}
                                                            w="100%" h="100%" key={c}
                                                            className={`rounded-md overflow-hidden relative z-40 cursor-pointer`}>
                                                            {/* <Center w="100%" h="100%">
                                                                <Text size="xs" c={getContrastColor(selectedSeat?.includes(z) ? e.seatcolor ?? '#194e9e' : 'gray.1')} className={`uppercase`}>
                                                                    {z}
                                                                </Text>
                                                            </Center> */}
                                                            <Box
                                                                className={`relative z-10 !rounded-[5px] mt-[5px] border ${selectedSeat?.includes(z) ? 'border-[#fafafa30]' : ' border-[#d0d0d0]'}`}
                                                                h="calc(100% - 7px)"
                                                                bg={!selectedSeat?.includes(z) && availableSeat?.includes(z) ? e.seatcolor ?? '#194e9e' : '#194e9e'}
                                                            />
                                                            <Box
                                                                className={`w-[calc(70%)] !rounded-[5px] absolute top-0 left-2/4 -translate-x-2/4 h-[7px] ${selectedSeat?.includes(z) ? '' : 'border border-[#d0d0d0]'}`}
                                                                h="calc(100% - 5px)"
                                                                bg={!selectedSeat?.includes(z) && availableSeat?.includes(z) ? e.seatcolor ?? '#194e9e' : '#194e9e'}
                                                            />
                                                        </Box>
                                                    </Tooltip>
                                                ))}
                                            </Flex>
                                        ))}
                                    </Stack>
                                </Stack>
                            )}

                        </Box>
                        {/* <Text className={`absolute top-[calc(100%_+_8px)] left-0 text-[8px]`} c="blue" size="8px">
                            {JSON.stringify(e)}
                        </Text> */}
                    </Box>
                // </Tooltip>
            ))}
        </>
    )
}