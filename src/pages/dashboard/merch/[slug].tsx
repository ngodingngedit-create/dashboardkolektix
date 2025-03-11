import TableData from "@/components/TableData";
import { Get } from "@/utils/REST";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Accordion, ActionIcon, AspectRatio, Box, Button, Card, Divider, Flex, Image, NumberFormatter, SimpleGrid, Stack, Tabs, Text, Title } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function MerchDetail() {
    const [data, setData] = useState<MerchandiseShowResponse>();
    const [imageList, setImageList] = useState<MerchandiseShowResponse['product_image']>();
    const [loading, setLoading] = useListState<string>();
    const router = useRouter();
    const { slug } = router.query;

    useEffect(() => {
        getData();
    }, [slug]);

    const getData = () => {
        if (slug) {
            Get(`product/${slug}`, {})
            .then((res: any) => {
                if (res.data) {
                    const data = res.data as MerchandiseShowResponse;
                    setData(data);
                    setImageList(data.product_image);
                }
                setLoading.filter((e) => e != 'getdata');
            })
            .catch((err) => {
                console.log(err);
                setLoading.filter((e) => e != 'getdata');
            });
        }
    };

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
            text: 'Total Terjual',
            value: 1000,
            icon: 'akar-icons:shopping-bag',
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
                    <AspectRatio ratio={1} maw={200} w="100%">
                        <Image
                            radius={10}
                            src={imageList?.[0]?.image_url}
                            bg="gray.1"
                        />
                    </AspectRatio>

                    <Stack gap={0} w="100%">
                        <Text size="xs" c="gray" mb={5}>Dibuat pada {moment(data?.created_at).format('DD MMMM YYYY')}</Text>
                        <Flex gap={10} align="center">
                            <Title size="h2" >{data?.product_name}</Title>
                            {/* <Button w="fit-content" component={Link} href={`/dashboard/merch/edit/${slug}`} size="xs" variant="outline">Edit Merchandise</Button> */}
                            <ActionIcon variant="transparent" title="Buka Halaman Merchandise" onClick={() => window.open(`/merchandise/${slug}`, '_blank')}>
                                <Icon icon="proicons:open" className={`text-[24px]`}/>
                            </ActionIcon>
                        </Flex>
                        <Flex gap={8} align="center" mt={5}>
                            <Text><NumberFormatter value={0} /></Text>
                            <Divider orientation="vertical" mx={10} />
                            <Icon icon="solar:star-bold" className={`text-yellow-500 text-[24px]`} />
                            <Text>5.0</Text>
                        </Flex>
                    </Stack>
                </Flex>
            
                <Accordion variant="separated" radius={10} defaultValue="1">
                    <Accordion.Item value="1">
                        <Accordion.Control>
                            <Flex gap={10} align="center">
                                <Icon icon="akar-icons:statistic-up" className={`text-primary-base`} />
                                <Text>Statistik Merchandise</Text>
                            </Flex>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <SimpleGrid cols={4}>
                                {statistics.map((statistic, index) => (
                                    <Card key={index} radius={10} withBorder pos='relative' className={`hover:!bg-grey/10`}>
                                        <Stack key={index} gap={0}>
                                            <Text>{statistic.text}</Text>
                                            {statistic.isCurrency ? (
                                                <Text fw={600} size="xl"><NumberFormatter value={statistic.value} prefix="Rp " /></Text>
                                            ) : (
                                                <Text fw={600} size="xl">{statistic.value}</Text>
                                            )}
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

                <Tabs defaultValue="transaction">
                    <Tabs.List>
                        <Tabs.Tab value="transaction" leftSection={<Icon icon="fluent:money-16-regular" />}>Transaksi</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="transaction">
                        <Box mt={10}>
                            {/* <TableData
                                tablekey="transaction"
                            /> */}
                        </Box>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Card>
    )
}