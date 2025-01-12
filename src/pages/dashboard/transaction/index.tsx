import ModalTransactionMerchDetail from "@/components/Transaction/ModalTransactionMerchDetail";
import fetch from "@/utils/fetch";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, AspectRatio, Badge, Button, Card, Divider, Flex, Image, NumberFormatter, Stack, Tabs, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";

type ComponentProps = {};

export default function Transaction({  }: Readonly<ComponentProps>) {
    const [data, setData] = useState<Partial<Record<'venue', any[]>>>({});
    const [loading, setLoading] = useListState<string>();

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        await fetch<any, any>({
            url: 'user-data/transactions',
            method: 'GET',
            before: () => setLoading.append('getdata'),
            success: ({ data }) => setData(data),
            complete: () => setLoading.filter(e => e != 'getdata'),
            error: () => {},
        });
    }

    const handleOpenMerchDetail = () => {
        modals.open({
            title: 'Detail Transaksi',
            centered: true,
            size: 'xl',
            children: <ModalTransactionMerchDetail />
        });
    }

    return (
        <Stack className={`p-[20px] md:!p-[30px]`}>

            <Stack gap={0}>
                <Text fw={600} size="xl">Transaksi Lainnya</Text>
                <Text size="sm" c="gray">Daftar semua transaksi merchandise, venue, dan lainnya</Text>
            </Stack>

            <Tabs defaultValue="merch">
                <Tabs.List>
                    <Tabs.Tab value="merch">Merchandise</Tabs.Tab>
                    <Tabs.Tab value="venue">Venue</Tabs.Tab>
                    <Tabs.Tab value="job">Apply Lowongan</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="merch">
                    <Stack py={20} gap={15}>
                        {Array(0).fill('').map((e, i) => (
                            <Card key={i} withBorder radius={8} p={0}>
                                <Stack gap={0}>
                                    <Card className={`!bg-primary-light`} p={15}>
                                        <Flex align="center" gap={10} wrap="wrap" w="100%">
                                            <Icon icon="icon-park-outline:transaction" className={`!text-[20px] text-primary-base`} />
                                            <Text size="sm" c="gray.7" fw={600}>MERCH-1023875234</Text>
                                            <Text size="xs" className={`uppercase !text-primary-base`} ml="auto">{moment('2024-11-20').format('DD MMM YYYY')}</Text>
                                        </Flex>
                                    </Card>

                                    <Divider />

                                    <Card p={15}>
                                        <Text size="xs" c="gray" mb={5}>+2 Produk Lainnya</Text>

                                        <Flex gap={15} align="center" wrap="wrap" justify="space-between">
                                            <Flex gap={10}>
                                                <Image src="#" w={48} h={48} bg="gray" radius={5} />
                                                <Stack gap={0}>
                                                    <Text size="sm" fw={600}>Merch Name Merch Name</Text>
                                                    <Text size="xs" c="gray">Varian: Name</Text>
                                                    <Text size="sm" mt={5}><NumberFormatter value={100000} /></Text>
                                                </Stack>
                                            </Flex>

                                            <Card withBorder radius={999} p="5px 16px">
                                                <Text size="xs" className={`whitespace-nowrap`}>Status Pesanan: <Text fw={600} component="span">Dikirim</Text></Text>
                                            </Card>

                                            <Button onClick={handleOpenMerchDetail} variant="subtle" size="xs" className={`!text-primary-base`}>
                                                Lihat Detail
                                            </Button>
                                        </Flex>
                                    </Card>
                                </Stack>
                            </Card>
                        ))}
                        {true && (
                            <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />}>
                                Tidak ada transaksi merchandise
                            </Alert>
                        )}
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="venue">
                    <Stack gap={15} py={20}>
                        {(data.venue?.length ?? 0) > 0 ? data.venue?.map((e, i) => (
                            <Card withBorder radius={8} key={i}>
                                <Flex justify="space-between" gap={15} wrap="wrap">
                                    <Stack gap={0}>
                                        {e?.venue?.venue_gallery[0] && <AspectRatio ratio={16 / 5} maw={500} w="100%">
                                            <Image src={e?.venue?.venue_gallery[0]?.image} radius={8} />
                                        </AspectRatio>}
                                        <Flex align="center" gap={8} mt={10}>
                                            <Text size="sm" c="gray">{moment(e.start_date).format('DD MMMM YYYY')}</Text>
                                            {e?.start_date != e?.end_date && <Text size="sm" c="gray">- {moment(e.end_date).format('DD MMMM YYYY')}</Text>}
                                        </Flex>
                                        <Text size="lg" fw={600}>Venue {e?.venue?.name}</Text>
                                        <Text>{e?.venue?.location_name}</Text>
                                    </Stack>
                                    <Stack gap={5} align="end" h="100%" justify="space-between">
                                        <Flex align="center" gap={8}>
                                            <Text size="sm" c="gray">Status Pembayaran:</Text>
                                            <Badge variant="light" className={`capitalize`} size="lg" color={
                                                e?.payment_status.toLowerCase() == 'pending' ? 'yellow' :
                                                e?.payment_status.toLowerCase() == 'verified' ? 'green' : 'red'
                                            }>{e?.payment_status}</Badge>
                                        </Flex>
                                        <Divider my={15} />
                                        <Text size="lg" fw={600}>Total Dibayar <NumberFormatter value={e?.grandtotal ?? 0} /></Text>
                                        <Button variant="transparent" size="sm" component={Link} href={`/venue-invoice/${e?.invoice_no}`}>
                                            Lihat Invoice
                                        </Button>
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

                <Tabs.Panel value="job">
                    <Stack gap={15} py={20}>
                        <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />}>
                            Tidak ada apply lowongan
                        </Alert>
                    </Stack>
                </Tabs.Panel>
            </Tabs>

        </Stack>
    );
}