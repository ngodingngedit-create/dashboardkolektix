import TableData from "@/components/TableData";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Accordion, Card, SimpleGrid, Stack, Text, Title, Flex, Image, AspectRatio, PillGroup, Pill, Button, ActionIcon, Tabs, Badge, Divider, Alert, NumberFormatter } from "@mantine/core";
import { VenueCapacity, VenueCategory, VenueFacility, VenueListResponse, VenueStoreRequest } from './type';
import { useEffect, useState } from "react";

import useLoggedUser from "@/utils/useLoggedUser";
import { useRouter } from "next/router";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import Link from "next/link";
import { MonthPicker, MonthPickerInput } from "@mantine/dates";
import {
    useEpg,
    Epg,
    Layout,
    ProgramBox,
    ProgramContent,
    ProgramFlex,
    ProgramStack,
    ProgramTitle,
    ProgramText,
    ProgramImage,
    useProgram,
    Program,
    ProgramItem
} from "planby";
import moment from "moment";

const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const Item = ({ program,...rest }: ProgramItem) => {
    const { styles, formatTime, isLive, isMinWidth } = useProgram({ program,...rest });

    const { data } = program;
    const { image, title, since, till } = data;

    const sinceTime = formatTime(since);
    const tillTime = formatTime(till);

    return (
        <ProgramBox width={styles.width} style={styles.position}>
        <ProgramContent
            width={styles.width}
            isLive={isLive}
        >
            <ProgramFlex>
            {isLive && isMinWidth && <ProgramImage src={image} alt="Preview" />}
            <ProgramStack>
                <ProgramTitle>{title}</ProgramTitle>
                <ProgramText>
                {sinceTime} - {tillTime}
                </ProgramText>
            </ProgramStack>
            </ProgramFlex>
        </ProgramContent>
        </ProgramBox>
    );
};

export default function VenuePage() {
    const [loading, setLoading] = useListState<string>();
    const [category, setCategory] = useState<VenueCategory[]>();
    const [facility, setFacility] = useState<VenueFacility[]>();
    const [venue, setVenue] = useState<VenueListResponse>();
    const [venueFacilities, setVenueFacilities] = useState<any[]>();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const user = useLoggedUser();
    const router = useRouter();
    const { id } = router.query;
    const { getEpgProps, getLayoutProps } = useEpg({
        epg: [],
        channels: [
            {
                logo: 'https://via.placeholder.com',
                uuid: '10339a4b-7c48-40ab-abad-f3bcaf95d9fa',
            },],
        startDate: '2022/02/02', // or 2022-02-02T00:00:00
    });

    useEffect(() => {
        id && getData();
    }, [id]);

    const getData = async () => {
        if (loading.includes('getdata')) return;
        setLoading.append('getdata');

        await fetch<any, VenueListResponse>({
            url: 'creator-data/venue/' + id,
            method: 'GET',
            success: async (data) => {
                if (data) {
                    setVenue(data?.data);

                    await fetch<any, VenueCategory[]>({
                        url: 'venue-category',
                        method: 'GET',
                        success: ({ data }) => data && setCategory(data),
                    });
                    await fetch<any, VenueFacility[]>({
                        url: 'venue-facility',
                        method: 'GET',
                        success: ({ data }) => data && setFacility(data),
                    });

                    setVenueFacilities(data['dataFacilities']);
                    setLoading.filter(e => e != 'getdata');
                }
            },
            error: () => router.push('/dashboard/venue'),
        });
    }

    const statistics = [
        {
            text: 'Visitor',
            value: 0,
            icon: 'famicons:people-outline',
        },
        {
            text: 'Total Bookmarks',
            value: 0,
            icon: 'akar-icons:bookmark',
        },
        {
            text: 'Total Booking Berjalan',
            value: 0,
            icon: 'akar-icons:calendar',
        },
        {
            text: 'Total Pendapatan',
            value: 0,
            icon: 'akar-icons:money',
            isCurrency: true,
        },
    ]

    return (
        <Card p={30}>
            <Stack gap={30}>
                <Flex justify="space-between" gap={30}>
                    <Stack gap={0}>
                        <Title size="h2" >{venue?.name}</Title>
                        <Text size="sm" c="gray">{category?.find(e => e.id == venue?.venue_category_id)?.name}</Text>
                        <PillGroup mt={10}>
                            {facility?.filter(e => venue?.venue_facility_id?.map(e => parseInt(String(e))).includes(e.id)).map((e, i) => (
                                <Pill key={i}>{e.name}</Pill>
                            ))}
                        </PillGroup>
                        <Flex gap={10} mt={25} align="center">
                            <Button w="fit-content" component={Link} href={`/dashboard/venue/edit/${id}`} size="xs" variant="outline">Edit Venue</Button>
                            <ActionIcon variant="transparent" title="Buka Halaman Venue" onClick={() => window.open(`/venue/${venue?.slug}`, '_blank')}>
                                <Icon icon="proicons:open" className={`text-[24px]`}/>
                            </ActionIcon>
                        </Flex>
                    </Stack>

                    <AspectRatio ratio={128/40} maw={500} w="100%">
                        <Image
                            radius={10}
                            src={venue?.venue_gallery?.[0]?.image_url}
                            bg="gray.1"
                        />
                    </AspectRatio>
                </Flex>

                <Accordion variant="separated" radius={10} defaultValue="1">
                    <Accordion.Item value="1">
                        <Accordion.Control>
                            <Flex gap={10} align="center">
                                <Icon icon="akar-icons:statistic-up" className={`text-primary-base`} />
                                <Text>Statistik Venue</Text>
                            </Flex>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <SimpleGrid cols={4}>
                                {statistics.map((statistic, index) => (
                                    <Card key={index} radius={10} withBorder pos='relative' className={`hover:!bg-grey/10`}>
                                        <Stack key={index} gap={0}>
                                            <Text>{statistic.text}</Text>
                                            <Text fw={600} size="xl">{statistic.value}</Text>
                                            <Icon
                                                icon={statistic.icon}
                                                className={`absolute text-[5rem] -bottom-5 -right-2 text-primary-base/30`}
                                            />
                                        </Stack>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>

                <Tabs defaultValue="book">
                    <Tabs.List>
                        <Tabs.Tab value="book" leftSection={<Icon icon="akar-icons:calendar" />} >
                            List Booking
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="book">
                        <Stack gap={15} py={20}>
                            {(venue?.has_booking_venue?.length ?? 0) > 0 ? venue?.has_booking_venue?.map((e, i) => (
                                <Card withBorder radius={8} key={i}>
                                    <Flex justify="space-between" gap={15} wrap="wrap">
                                        <Stack gap={0}>
                                            {e?.event_banner && <AspectRatio ratio={16 / 5} maw={500} w="100%">
                                                <Image src={e?.event_banner} radius={8} />
                                            </AspectRatio>}
                                            <Flex align="center" gap={8} mt={10}>
                                                <Text size="sm" c="gray">{moment(e.start_date).format('DD MMMM YYYY')}</Text>
                                                {e?.start_date != e?.end_date && <Text size="sm" c="gray">- {moment(e.end_date).format('DD MMMM YYYY')}</Text>}
                                            </Flex>
                                            <Text size="lg" fw={600} className={`capitalize`}>{e?.event_name}</Text>
                                        </Stack>
                                        <Stack gap={5} align="end" h="100%" justify="space-between">
                                            <Flex align="center" gap={8}>
                                                <Text size="sm" c="gray">Status Pembayaran:</Text>
                                                <Badge variant="light" className={`capitalize`} size="lg" color={
                                                    e?.payment_status?.toLowerCase() == 'pending' ? 'yellow' :
                                                    e?.payment_status?.toLowerCase() == 'verified' ? 'green' : 'red'
                                                }>{e?.payment_status}</Badge>
                                            </Flex>
                                            <Text size="lg" fw={600}>Total Dibayar <NumberFormatter value={e?.grandtotal ?? 0} /></Text>
                                            {/* <Button variant="transparent" size="sm" component={Link} href={`/venue-invoice/${e?.invoice_no}`}>
                                                Lihat Invoice
                                            </Button> */}
                                        </Stack>
                                    </Flex>
                                </Card>
                            )) : (
                                <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />}>
                                    Tidak ada transaksi venue
                                </Alert>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Card>
    );
}