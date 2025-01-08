import TableData from "@/components/TableData";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Accordion, Card, SimpleGrid, Stack, Text, Title, Flex, Image, AspectRatio, PillGroup, Pill, Button, ActionIcon, Tabs } from "@mantine/core";
import { VenueCapacity, VenueCategory, VenueFacility, VenueListResponse, VenueStoreRequest } from './type';
import { useEffect, useState } from "react";
import { FacilitiesList } from "@/pages/venue/[slug]";
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
    const [venueFacilities, setVenueFacilities] = useState<FacilitiesList[]>();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const user = useLoggedUser();
    const router = useRouter();
    const { slug } = router.query;
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
        getData();
    }, [user]);

    useEffect(() => {
        getVenueData();
    }, [slug]);

    const getData = async () => {
        await fetch<any, VenueCategory[]>({
            url: 'venue-category',
            method: 'GET',
            success: ({ data }) => data && setCategory(data),
            before: () => setLoading.append('getdatacat'),
            complete: () => setLoading.filter(e => e != 'getdatacat'),
        });
        await fetch<any, VenueFacility[]>({
            url: 'venue-facility',
            method: 'GET',
            success: ({ data }) => data && setFacility(data),
            before: () => setLoading.append('getdatacat'),
            complete: () => setLoading.filter(e => e != 'getdatacat'),
        });
    }

    const getVenueData = async () => {
        if (slug) {
            await fetch<any, VenueListResponse>({
                url: 'venue/' + slug,
                method: 'GET',
                before: () => setLoading.append('getdatavenue'),
                success: (data) => {
                    if (data) {
                        setVenue(data.data);
                        setVenueFacilities(data['dataFacilities']);
                    }
                },
                complete: () => setLoading.filter(e => e != 'getdatavenue'),
            });
        }
    }

    const statistics = [
        {
            text: 'Visitor',
            value: 1000,
            icon: 'famicons:people-outline',
        },
        {
            text: 'Total Bookmarks',
            value: 1000,
            icon: 'akar-icons:bookmark',
        },
        {
            text: 'Total Booking Berjalan',
            value: 1000,
            icon: 'akar-icons:calendar',
        },
        {
            text: 'Total Pendapatan',
            value: 1000,
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
                            {facility?.map((e, i) => (
                                <Pill key={i}>{e.name}</Pill>
                            ))}
                        </PillGroup>
                        <Flex gap={10} mt={25} align="center">
                            <Button w="fit-content" component={Link} href={`/dashboard/venue/edit/${slug}`} size="xs" variant="outline">Edit Venue</Button>
                            <ActionIcon variant="transparent" title="Buka Halaman Venue" onClick={() => window.open(`/venue/${slug}`, '_blank')}>
                                <Icon icon="proicons:open" className={`text-[24px]`}/>
                            </ActionIcon>
                        </Flex>
                    </Stack>

                    <AspectRatio ratio={128/40} maw={500} w="100%">
                        <Image
                            radius={10}
                            src={venue?.venue_gallery[0].image_url}
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
                        <Card px={0} h={500}>
                            <Epg {...getEpgProps()}>
                                <Layout {...getLayoutProps()} isTimeline />
                            </Epg>
                        </Card>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Card>
    );
}