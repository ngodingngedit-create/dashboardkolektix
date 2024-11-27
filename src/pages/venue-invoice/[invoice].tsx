import { Icon } from '@iconify/react/dist/iconify.js';
import { AspectRatio, Box, Card, Container, Divider, Flex, Image, NumberFormatter, ScrollArea, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import _ from 'lodash';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import fetch from '@/utils/fetch';
import { useListState } from '@mantine/hooks';
import { useRouter } from 'next/router';
import moment from 'moment';
import { City, Province } from '../dashboard/profile/address';
import { VenueInvoiceResponse } from './type';



export default function Invoice() {
    const [isr, setIsr] = useState(false);
    const [data, setData] = useState<VenueInvoiceResponse>();
    const [loading, setLoading] = useListState<string>();
    const router = useRouter();
    const { invoice } = router.query;
    const [city, setCity] = useState<City>();
    const [province, setProvince] = useState<Province>();

    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {
        getData();
    }, [isr, invoice]);

    const getData = async () => {
        if (invoice) {
            await fetch<any, VenueInvoiceResponse>({
                url: `order-product-invoice/${invoice}`,
                method: 'GET',
                data: {},
                before: () => setLoading.append('getdata'),
                success: ({ data }) => {
                    if (data) {
                        setData(data);
                    }
                },
                complete: () => setLoading.filter(e => e != 'getdata'),
                error: () => {},
            });
        }
    }

    const iconStatus: {[key: string]: string} = {
        'expired': 'ooui:alert',
        'pending': 'icon-park-solid:time',
        'verified': 'uiw:circle-check',
    }

    return (
        <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
            <Container px={0} className={`py-[54px] md:py-[100px] !px-[10px]`}>
                <Card p={0} radius={8} className={`!shadow-lg`}>
                    <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
                        <Stack gap={30}>
                            <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
                                <Flex gap={15} align="center">
                                    <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
                                    <Stack gap={0}>
                                        <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
                                            Invoice Booking Venue
                                        </Title>
                                        <Text size="sm">{invoice}</Text>
                                    </Stack>
                                </Flex>

                                <Stack gap={5} className={`items-start md:!items-end`}>
                                    <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
                                        <Flex align="center" gap={10}>
                                            <Text size="sm" c="gray.8">
                                                Status Pembayaran :
                                            </Text>
                                            <Flex gap={5} align="center">
                                                <Icon
                                                    icon={iconStatus[data?.payment_status.toLowerCase() ?? 'pending']}
                                                    className={`
                                                        text-[18px]
                                                        ${data?.payment_status.toLowerCase() == 'expired' && 'text-red-400'}
                                                        ${data?.payment_status.toLowerCase() == 'pending' && 'text-yellow-500'}
                                                        ${data?.payment_status.toLowerCase() == 'verified' && 'text-green-500'}
                                                    `}
                                                />
                                                <Text size="md" fw={400}>
                                                    {data?.payment_status.toLowerCase() == 'expired' && <>Expired</>}
                                                    {data?.payment_status.toLowerCase() == 'pending' && <>Pending</>}
                                                    {data?.payment_status.toLowerCase() == 'verified' && <>Berhasil</>}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Card>
                                    {/* <Text size="xs">Selesaikan pembayaran dalam 23:59:59</Text> */}
                                </Stack>
                            </Flex>
                        </Stack>
                    </Card>
                    <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
                        <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap">
                            <Stack className={`min-w-[250px]`}>
                                <AspectRatio ratio={16/5} w="100%">
                                    <Image src={"#"} bg="gray" radius={10} />
                                </AspectRatio>
                            </Stack>

                            <Stack className={`shrink-0 max-w-[250px]`} gap={0}>
                                <Text fw={600}>Nama Venue Nama Venue</Text>
                                <Text size="sm" c="gray">Jakarta Jakarta</Text>
                            </Stack>
                        </Flex>

                        <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
                            <Stack gap={10}>
                                <Text fw={600} c="gray.8">
                                    Informasi Booking
                                </Text>
                                <Card withBorder>
                                    <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>
                                                Nama Pemesan
                                            </Text>
                                            <Text size="sm" fw={600}>
                                                {data?.user.name}
                                            </Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>
                                                Email Pemesan
                                            </Text>
                                            <Text size="sm">{data?.user.email}</Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>
                                                Tanggal Pesanan Dibuat
                                            </Text>
                                            <Text size="sm">{moment(data?.created_at).format('HH:mm, DD MMMM YYYY')}</Text>
                                        </Stack>
                                    </SimpleGrid>
                                </Card>
                            </Stack>

                            <Stack gap={10} className={`md:max-w-[250px] shrink-0`}>
                                <Text fw={600} c="gray.8">
                                    Total Pembayaran
                                </Text>
                                <Card bg="gray.1">
                                    <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
                                        <Text size="xl" fw={600}>
                                            <NumberFormatter value={data?.grandtotal ?? 999999} />
                                        </Text>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>
                                                Metode Pembayaran
                                            </Text>
                                            <Text size="sm" className='capitalize'>{data?.payment_method ?? 'PAYMENT_METHOD'}</Text>
                                        </Stack>
                                        <Link href={data?.xendit_url ?? '#'} target="_blank">
                                            <Text size="xs" className={`hover:underline !text-primary-base`}>
                                                Buka Halaman Pembayaran
                                            </Text>
                                        </Link>
                                    </SimpleGrid>
                                </Card>
                            </Stack>
                        </Flex>
                    </Stack>
                </Card>
            </Container>
        </div>
    );
}
