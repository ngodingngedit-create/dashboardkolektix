import EventCard from "@/components/Card/EventCard";
import { BookmarkListResponse } from "@/types/bookmark";
import fetch from "@/utils/fetch";
import useLoggedUser from "@/utils/useLoggedUser";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, AspectRatio, Box, Card, Flex, Image, LoadingOverlay, Stack, Tabs, Text } from "@mantine/core";
import { useDidUpdate, useListState } from "@mantine/hooks";
import moment from "moment";
import Link from "next/link";
import { useMemo, useState } from "react";

type ComponentProps = {
    
};

export default function BookmarkPage({  }: Readonly<ComponentProps>) {
    const [data, setData] = useState<BookmarkListResponse[]>();
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    
    useDidUpdate(() => {
        getData();
    }, [user]);

    const getData = async () => {
        await fetch<any, BookmarkListResponse[]>({
            url: 'bookmark/showby/' + user?.id,
            method: 'GET',
            before: () => setLoading.append('getdata'),
            success: ({ data }) => data && setData(data),
            complete: () => setLoading.filter(e => e != 'getdata'),
        });
    };

    const eventList = useMemo(() => {
        return data?.filter(e => e.type == "Event").map(e => e.has_event);
    }, [data]);

    return (
        <Stack p={20} pos="relative">
            <LoadingOverlay visible={loading.includes('getdata')} />

            <Stack gap={0}>
                <Text component="h1" fw={600} size="xl">Semua Bookmark</Text>
                <Text size="sm" c="gray">Daftar semua bookmark event, merchandise, dllolor</Text>
            </Stack>

            <Tabs defaultValue="event">
                <Tabs.List>
                    <Tabs.Tab value="event">Event</Tabs.Tab>
                    <Tabs.Tab value="merch">Merchandise</Tabs.Tab>
                    <Tabs.Tab value="venue">Venue</Tabs.Tab>
                    <Tabs.Tab value="talenta">Talenta</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="event" py={20}>
                    {eventList?.length == 0 && (
                        <Alert icon={<Icon icon="uiw:information-o" />} radius={8} color="gray">
                            Belum ada bookmark event
                        </Alert>
                    )}

                    <Flex gap={15} wrap="wrap">
                        {eventList?.map((e, i) => (
                            <Box key={i} className={`!max-w-[280px]`}>
                                <EventCard
                                    id={e.id}
                                    slug={e.slug}
                                    title={e.name}
                                    date={e.start_date as any}
                                    end={e.end_date as any}
                                    img={e.image_url ?? '#'}
                                    creator={e.has_creator?.name ?? '-'}
                                    creatorSlug={e.has_creator?.slug ?? '-'}
                                    creatorImg={e.has_creator?.image}
                                    price={e.starting_price}
                                    bookmark={true}
                                />
                            </Box>
                        ))}
                    </Flex>
                </Tabs.Panel>

                <Tabs.Panel value="merch" py={20}>
                    <Alert icon={<Icon icon="uiw:information-o" />} radius={8} color="gray">
                        Belum ada bookmark merchandise
                    </Alert>
                </Tabs.Panel>

                <Tabs.Panel value="venue" py={20}>
                    <Alert icon={<Icon icon="uiw:information-o" />} radius={8} color="gray">
                        Belum ada bookmark venue
                    </Alert>
                </Tabs.Panel>

                <Tabs.Panel value="talenta" py={20}>
                    <Alert icon={<Icon icon="uiw:information-o" />} radius={8} color="gray">
                        Belum ada bookmark talenta
                    </Alert>
                </Tabs.Panel>
            </Tabs>

        </Stack>
    );
}