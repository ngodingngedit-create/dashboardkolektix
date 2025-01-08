import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { ActionIcon, Badge, Box, Button, Card, Center, Divider, Drawer, Flex, LoadingOverlay, Modal, NumberFormatter, Stack, Text, Tooltip } from '@mantine/core';
import { TicketProps } from '@/utils/globalInterface';
import moment from 'moment';
import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { randomId, useDidUpdate, useInterval } from '@mantine/hooks';
import { Context } from '@/pages/event/[slug]';
import { SeatmapData } from '@/utils/formInterface';
import chunk from '@/utils/chunk';
import { contrastColor } from 'contrast-color';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

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
    //     ticket_end: '2025-12-19',
    //     starting_time: '21:12:00',
    //     ending_time: '08:50:00',
    // };

    const { t, i18n } = useTranslation();
    const { locale, locales } = useRouter();
    const count = useMemo(() => {
        if (!_count) return 0;
        return typeof _count == 'number' ? _count : _count.length;
    }, [_count])
    const { seatmapData, seatmapOpen, setSeatmapOpen, ticket } = useContext(Context);
    
    const selectedSeat = useMemo(() => {
        return ticket?.map(e => e.seat_number).reduce((c, n) => ([ ...(c ?? []), ...(n ?? []) ]), [])
    }, [ticket]);

    const [isCurrent, setIsCurrent] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
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
                        {t('soldOut')}
                    </Badge>
                </>
            );

        if (isFinish)
            return (
                <>
                    <Box></Box>
                    <Badge color="gray" className={`shrink-0`}>
                        {t('eventDone')}
                    </Badge>
                </>
            );

        if (!isDatePassed(`${ticketData.ticket_date} ${ticketData?.starting_time ?? '00:00:00'}`))
            return (
                <>
                    <Box>
                        <Text size="sm" className={`!text-primary-base`}>
                            {price <= 0 ? t('registrationStarted') : t('ticketSalesStarted')}
                        </Text>
                        <Text size="xs" className={`!text-primary-base`}>
                            {moment(`${ticketData.ticket_date} ${ticketData?.starting_time ?? '00:00:00'}`).format('DD MMM YYYY')} - Jam {moment(`${ticketData.ticket_date} ${ticketData?.starting_time ?? '00:00:00'}`).format('HH:mm')} WIB
                        </Text>
                    </Box>
                    <Badge color="gray" className={`shrink-0`}>
                        {t('notStarted')}
                    </Badge>
                </>
            );

        if (isDatePassed(`${ticketData.ticket_end} ${ticketData?.ending_time ?? '00:00:00'}`))
            return (
                <>
                    <Box></Box>
                    <Badge color="gray" className={`shrink-0`}>
                        {price <= 0 ? t('registrationDone') : t('salesDone')} 
                    </Badge>
                </>
            );

        if (isCurrentTimeBetween(`${ticketData.ticket_date} ${ticketData?.starting_time ?? '00:00:00'}`, `${ticketData.ticket_end} ${ticketData?.ending_time ?? '00:00:00'}`))
            return (
                <>
                    <Box>
                        <Text size="sm" className={`!text-primary-base`}>
                            {price <= 0 ? t('registrationEnded') : t('ticketSalesEnded')}
                        </Text>
                        <Text size="xs" className={`!text-primary-base`}>
                            {moment(`${ticketData.ticket_end} ${ticketData?.ending_time ?? '00:00:00'}`).format('DD MMM YYYY')} - Jam {moment(`${ticketData.ticket_end} ${ticketData?.ending_time ?? '00:00:00'}`).format('HH:mm')} WIB
                        </Text>
                    </Box>
                    {ticketData.ticket_category == 'Seated' ? (
                        <Button onClick={() => setSeatmapOpen && setSeatmapOpen(index)} className={`shrink-0`}>
                            {t('selectSeat')}
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
                    {t('eventDone')}
                </Badge>
            </>
        );
    };
    //194e9e
    return (
        <Card radius={10} withBorder p={20} className={`!border-primary-disabled/35 !overflow-visible relative ${seatmapOpen == index ? '!pb-[150px]' : ''}`} bg={isSoldOut || isReady || isFinish ? '#fafafa' : undefined}>
            {/* {JSON.stringify(ticket)} */}
            {seatmapOpen == index && window?.innerWidth > 767 && !isFullscreen && (
                <Card bg="gray.3" radius={10} className={`!hidden md:!block !absolute w-full h-full top-0 left-0 z-[40] !border-primary-disabled/35 !border`}>
                    <Button className={`!absolute z-[40] left-2 top-2 !text-primary-base`} size="xs" bg="white" leftSection={<Icon icon="uiw:left" />} onClick={() => setSeatmapOpen && setSeatmapOpen(undefined)}>
                        {t('back')}
                    </Button>

                    <Text className={`!absolute top-2 left-2/4 -translate-x-2/4 z-[40] !text-primary-base`} fw={600} size="sm">{t('selectSeat')}</Text>

                    <SeatmapViewer setIsFullscreen={setIsFullscreen} isFullscreen={isFullscreen} ticketData={ticketData} data={seatmapData} selectedSeat={selectedSeat} setSelectSeat={setCount} available={ticketData.available_seat_number} />
                </Card>
            )}

            {(window?.innerWidth < 767 || isFullscreen) && (
                <Drawer
                    title={(
                        <Stack gap={4}>
                            <Text>{`${t('selectSeat')} ${ticketData.name}`}</Text>
                            {((selectedSeat?.length ?? 0) > 0) && 
                                <Text size="sm" c="gray">Seat No: {selectedSeat?.map((e, i) => (
                                    <Badge bg="#194e9e" key={i} size="sm" ml={5} className={`translate-y-[-3px]`}>
                                        {e}
                                    </Badge>
                                ))}
                                </Text>
                            }
                        </Stack>
                    )}
                    opened={seatmapOpen == index}
                    onClose={() => setSeatmapOpen && setSeatmapOpen(undefined)}
                    position="bottom"
                    radius={25}
                    size={isFullscreen ? "92vh" : "80vh"}
                    overlayProps={{  opacity: 0.3 }}>
                        <Stack gap={20} align="end">
                            <Card bg="gray.3" w="100%" h={isFullscreen ? "70vh" : "calc(100vh - 330px)"} radius={10} className={`!border-primary-disabled/35 !border`}>
                                <SeatmapViewer setIsFullscreen={setIsFullscreen} isFullscreen={isFullscreen} ticketData={ticketData} data={seatmapData} selectedSeat={selectedSeat} setSelectSeat={setCount} available={ticketData.available_seat_number} />
                            </Card>

                            <Button
                                mt={8}
                                size="md"
                                fullWidth={!isFullscreen}
                                onClick={() => window?.innerWidth < 767 ? 
                                    setSeatmapOpen && setSeatmapOpen(undefined) : 
                                    setIsFullscreen(false)
                                }>
                                {isFullscreen ? 'Tutup Fullscreen' : 'Selesai'}
                            </Button>
                        </Stack>
                </Drawer>
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
                <Flex justify="space-between" gap={20} align="center" className={`shrink-0`}>
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
    ticketData?: TicketProps;
    setIsFullscreen?: (data: boolean) => void;
    isFullscreen?: boolean;
}

const SeatmapViewer = ({ ticketData, data, selectedSeat, setSelectSeat, available, setIsFullscreen, isFullscreen }: SeatmapViewerProps) => {
    const [isCanvasMove, setIsCanvasMove] = useState(false);
    const [scale, setScale] = useState(1);
    const [canvasPos, setCanvasPos] = useState<[number, number]>([0, 0]);
    const canvasWrap = useRef<HTMLDivElement>(null);
    const { seatmapData, seatmapOpen } = useContext(Context);
    const [lastTouch, setLastTouch] = useState<React.Touch>();
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (seatmapOpen !== undefined) {
            const area = seatmapData
            ?.filter(e => Array((e.col ?? 1) * (e.row ?? 1))
                .fill(e.prefix)
                .map((_, i) => `${e.prefix}${i+1}`)
                .some(x => ticketData?.available_seat_number?.includes(x))
            )
    
            if (area) {
                const [x, y]: [number, number] = area.map(e => e.position)
                .reduce<[number[], number[]]>((c, n) => ([[...c[0], n[0]], [...c[1], n[1]]]), [[], []])
                .map(e => (e.reduce((sum, num) => sum + num, 0) / e.length)) as [number, number]

                setCanvasPos([x * -1, y * -1]);
            }
        }
    }, [seatmapOpen]);

    const handleMouse = {
        down: () => {
            setIsCanvasMove(true);
            const [x, y] = canvasWrap?.current?.style?.transform
            ?.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
            ?.slice(1)
            .map(Number) || [0, 0];
        },
        up: () => {
            setIsCanvasMove(false);
        },
        move: (event: React.MouseEvent<HTMLDivElement>) => {
            if (isCanvasMove && canvasWrap?.current) {
                const [x, y] = canvasWrap?.current?.style?.transform
                    ?.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
                    ?.slice(1)
                    .map(Number) || [0, 0];
                var currentScale = parseFloat(canvasWrap?.current?.style?.scale ?? '1');

                if (currentScale <= 0.01) currentScale = 1;

                const newX = x + event.movementX / currentScale;
                const newY = y + event.movementY / currentScale;

                if (canvasWrap?.current?.style) {
                    canvasWrap.current.style.transform = `translate(${newX}px, ${newY}px)`;
                }
            }
        },
        touchdown: (event: React.TouchEvent<HTMLDivElement>) => {
            setIsCanvasMove(true);
            const touch = event.touches[0];
            localStorage.setItem('lastTouch', JSON.stringify({ pageX: touch.pageX, pageY: touch.pageY }));
        },
        touchup: () => {
            setIsCanvasMove(false);
        },
        touchmove: (event: React.TouchEvent<HTMLDivElement>) => {
            if (event.touches.length === 2) {
                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                const distance = Math.sqrt(
                    Math.pow(touch2.pageX - touch1.pageX, 2) +
                    Math.pow(touch2.pageY - touch1.pageY, 2)
                );

                const lastDistance = parseFloat(localStorage.getItem('lastDistance') || '0');
                var currentScale = parseFloat(canvasWrap?.current?.style?.scale ?? '1');
                if (currentScale <= 0.01) currentScale = 1;

                if (lastDistance) {
                    const scaleChange = distance / lastDistance;
                    currentScale *= scaleChange;
                    if (canvasWrap?.current?.style && currentScale > 0) {
                        canvasWrap.current.style.scale = `${String(currentScale)}`;
                    }
                }

                localStorage.setItem('lastDistance', String(distance));
            } else {
                const touch = event.touches[0];
                const lastTouch = JSON.parse(localStorage.getItem('lastTouch') || '{"pageX": 0, "pageY": 0}');
                var currentScale = parseFloat(canvasWrap?.current?.style?.scale ?? '1');
                if (currentScale <= 0.01) currentScale = 1;

                if (isCanvasMove && canvasWrap?.current) {
                    const [x, y] = canvasWrap?.current?.style?.transform
                        ?.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
                        ?.slice(1)
                        .map(Number) || [0, 0];
            
                    const newX = x + (touch.pageX - (lastTouch.pageX ?? 0)) / currentScale;
                    const newY = y + (touch.pageY - (lastTouch.pageY ?? 0)) / currentScale;

                    if (canvasWrap?.current?.style) {
                        canvasWrap.current.style.transform = `translate(${newX}px, ${newY}px)`;
                    }
            
                    localStorage.setItem('lastTouch', JSON.stringify({ pageX: touch.pageX, pageY: touch.pageY }));
                }
            }
        },
        wheel: (event?: React.WheelEvent<HTMLDivElement>, force?: 'up' | 'down') => {
            event?.preventDefault();
            document.body.style.overflow = 'hidden';

            var currentScale = parseFloat(canvasWrap?.current?.style?.scale ?? '1');
            var scalingValue = 0.3;

            if (((event?.deltaY ?? 0) > 0 || force == 'up') && currentScale > 0.5) {
                currentScale -= scalingValue;
            }

            if (((event?.deltaY ?? 0) < 0 || force == 'down') && currentScale < 8) {
                currentScale += scalingValue;
            }

            if (canvasWrap?.current?.style && currentScale > 0) {
                canvasWrap.current.style.scale = `${String(currentScale)}`;
            }

            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            scrollTimeout.current = setTimeout(() => {
                document.body.style.overflow = '';
                scrollTimeout.current = null;
            }, 1000);
        }    
    }

    useEffect(() => {
        if (window) {
            window.addEventListener('mouseup', handleMouse.up);
        }
    }, []);

    if (!data) return <></>;

    return (
        <div
            onWheel={handleMouse.wheel}
            onMouseDown={handleMouse.down}
            onMouseUp={handleMouse.up}
            onMouseMove={handleMouse.move}
            onTouchStart={handleMouse.touchdown}
            onTouchEnd={handleMouse.touchup}
            onTouchMove={handleMouse.touchmove}
            className={`h-full w-full relative z-30 [&_*]:!select-none`}>
            <Flex className={`!absolute top-0 right-0 z-50`} gap={10}>
                <ActionIcon className={`!hidden md:!block`} color="gray.1" radius="xl" onClick={() => setIsFullscreen && setIsFullscreen(!isFullscreen)}>
                    <Icon icon="lucide:fullscreen" className={`text-primary-base`} />
                </ActionIcon>
                <ActionIcon color="gray.1" radius="xl" onClick={() => handleMouse.wheel(undefined, 'up')}>
                    <Icon icon="uiw:minus" className={`text-primary-base`} />
                </ActionIcon>
                <ActionIcon color="gray.1" radius="xl" onClick={() => handleMouse.wheel(undefined, 'down')}>
                    <Icon icon="uiw:plus" className={`text-primary-base`} />
                </ActionIcon>
            </Flex>

            <Card
                ref={canvasWrap}
                bg="transparent"
                pos="relative"
                style={{
                    overflow: 'hidden',
                    scale: `${scale * 100}%`,
                    transform: `translate(${canvasPos[0]}px, ${canvasPos[1]}px)`
                }}
                className={`z-20 !overflow-visible top-2/4`}
            >
                <Box className={`absolute top-2/4 left-2/4 w-[2px] h-[999vh] bg-grey/10 -translate-y-2/4 -translate-x-2/4`}/>
                <Box className={`absolute top-2/4 left-2/4 w-[999vw] h-[2px] bg-grey/10 -translate-y-2/4 -translate-x-2/4`}/>

                <Box className={`absolute z-20 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4`}>
                    <SeatmapItem ticketData={ticketData} data={data} selectedSeat={selectedSeat} available={available} setSelectSeat={!isCanvasMove  ? setSelectSeat : () => {}} />
                </Box>
            </Card>
        </div>
    )
}

const SeatmapItem = ({ ticketData, data, selectedSeat, setSelectSeat, available }: SeatmapViewerProps) => {
    const [loading, setLoading] = useState(false);
    const getContrastColor = useCallback((color: string) => {
        return contrastColor({ bgColor: color, threshold: 255 * 0.6 });
    }, []);

    const availableSeat = useMemo(() => {
        const soldSeat = ticketData?.has_ordered_seatnumber?.map(e => e.seatnumber_ticket  ?? '') ?? [];
        return available?.split(',').filter(e => !soldSeat.includes(e));
    }, [available, ticketData]);

    const filteredArea = useMemo(() => {
        setLoading(true);

        const result = (data ?? []).map(e => ({
            ...e,
            seat: chunk(
                (Array((e.row ?? 1) * (e.col ?? 1))
                    .fill(e.prefix)
                    .map((e, i) => (`${e}${i + 1}`)) ?? [])
                    .map(s => ({ 
                        code: s,
                        active: availableSeat?.includes(s),
                        color: ticketData?.seat_color ?? e.seatcolor ?? '#194e9e',
                        selected: selectedSeat?.includes(s)
                    }))
                , (e.col ?? 1)
            )
        }));

        setLoading(false);
        return result;
    }, [selectedSeat]);

    if (!data) return <></>;

    return (
        <>
            <LoadingOverlay visible={loading} />
            {filteredArea.map((e, i) => (
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

                        {/* {e.type == 'seat' && (
                            <Flex className={`absolute bottom-[-30px] left-0`} gap={5}>
                                <Text size="sm" c="gray">{e.prefix}1 - {e.prefix}{(e?.col ?? 0) * (e?.row ?? 0)}</Text>
                            </Flex>
                        )} */}

                        <Box
                            bg={e.background ?? (e.type != 'box' ? 'transparent' : "gray.1")}
                            h="100%"
                            className={`rounded-md ${!e.background ? '' : 'shadow-lg'}`}>
                            <Box
                                // onClick={() => handleSelect(i)}
                                className={`absolute w-full h-full left-0 top-0 z-20`}
                            />

                            {e.type == 'box' && (
                                <Center h="100%">
                                    <Text fw={500} className={`uppercase`} c={getContrastColor(e.background ?? '#fff')}>{e.text}</Text>
                                </Center>
                            )}

                            {e.type != 'box' && (
                                <Stack h="100%" align="center" justify="center" gap={5} p={10}>
                                    {e.text && <Text size="xs" c="gray">{e.text}</Text>}
                                    <Stack gap={3} w="100%" h="100%" justify="space-between">
                                        {(e.seat ?? []).map((x, r) => (
                                            <Flex w="100%" h="100%" justify="space-between" key={r} className={`!gap-[7px] md:!gap-[5px]`}>
                                                {x.map((z, c) => (
                                                    <Tooltip label={z.code} key={c} fw={600}>
                                                        <Box
                                                            onClick={() => z.active && setSelectSeat && setSelectSeat(z.code)}
                                                            opacity={z.active ? z.selected ? 0.5 : 1 : 0.1}
                                                            w={20} h={25} key={c}
                                                            className={`rounded-md overflow-hidden relative z-40 cursor-pointer`}>
                                                            {/* <Center w="100%" h="100%">
                                                                <Text size="xs" c={getContrastColor(z.selected ? e.seatcolor ?? '#194e9e' : 'gray.1')} className={`uppercase`}>
                                                                    {z}
                                                                </Text>
                                                            </Center> */}
                                                            <Box
                                                                className={`relative z-10 !rounded-[5px] mt-[5px] border ${z.selected ? 'border-[#fafafa30]' : ' border-[#d0d0d0]'}`}
                                                                h="calc(100% - 7px)"
                                                                bg={z.color}
                                                            />
                                                            <Box
                                                                className={`w-[calc(70%)] !rounded-[5px] absolute top-0 left-2/4 -translate-x-2/4 h-[7px] ${z.selected ? '' : 'border border-[#d0d0d0]'}`}
                                                                h="calc(100% - 5px)"
                                                                bg={z.color}
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