import { Icon } from '@iconify/react/dist/iconify.js';
import { Alert, AspectRatio, Box, Button, Card, Container, Divider, Flex, Image, NumberFormatter, ScrollArea, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import _ from 'lodash';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import fetch from '@/utils/fetch';
import { useListState } from '@mantine/hooks';
import { useRouter } from 'next/router';
import moment from 'moment';
import { City, Province } from '../dashboard/profile/address';
import { TransactionProps } from '@/utils/globalInterface';
import { formatDate, formatYear } from '@/utils/useFormattedDate';
import { TransactionStatusResponse } from '../dashboard/my-event/type';
import config from '@/Config';
import { modals } from '@mantine/modals';



export default function Invoice() {
    const [isr, setIsr] = useState(false);
    const [data, setData] = useState<TransactionProps>();
    const [loading, setLoading] = useListState<string>();
    const router = useRouter();
    const { invoice } = router.query;
    const [city, setCity] = useState<City>();
    const [province, setProvince] = useState<Province>();
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>();

    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {
        getData();
    }, [isr, invoice]);

    const getData = async () => {
        if (invoice) {
            await fetch<any, TransactionProps>({
                url: `transaction-finish?external_id=${invoice}`,
                method: 'GET',
                data: {},
                before: () => setLoading.append('getdata'),
                success: ({ data }) => {
                    if (data) {
                        setData(data);
                    }
                },
                complete: () => setLoading.filter(e => e != 'getdata'),
                error: () => {
                    modals.open({
                        centered: true,
                        closeOnClickOutside: false,
                        withCloseButton: false,
                        children: <Stack gap={10}> 
                            <Text ta="center">Data tidak ditemukan</Text>
                            <Button onClick={() => {modals.closeAll(); router.push('/')}}>
                                Ke Halaman Utama
                            </Button>
                        </Stack>
                    })
                },
            });
            await fetch<any, any>({
                url: 'transaction-statuses',
                method: 'GET',
                success: (_data) => {
                    const data = _data as TransactionStatusResponse[];
                    if ((data?.length ?? 0) > 0 && data) {
                        setTransactionStatus(data);
                    }
                },
            });
        }
    }

    const iconStatus: {[key: string]: string} = {
        'FAILED': 'ooui:alert',
        'EXPIRED': 'ooui:alert',
        'Pending': 'icon-park-solid:time',
        'PAID': 'uiw:circle-check',
    }

    // const summaryPrice = useMemo(() => {
    //     const admin = 2000;
    //     const totalProductPrice = data?.detail.reduce((q, n) => q + (Boolean(n.product_varian_id) ? parseInt(n.variant.price) : parseInt(n.product.price)), 0);
    //     const courier = parseInt(data?.courier.price ?? '0');
    //     const ppn = (courier + admin + (totalProductPrice ?? 0)) * 0.11;

    //     return { ppn, admin, courier }
    // }, [data]);

    const dataPemesan = useMemo(() => {
      return undefined;
      // return data?.identities.find(e => e.);
    }, [data]);

    const transStatus = useMemo(() => {
        return transactionStatus ? transactionStatus.find(e => e.id == data?.transaction_status_id) : null;
    }, [data, transactionStatus]);

    return (
        <div className={`bg-primary-light mt-[-10px] pt-[20px] pb-[30px] mb-[-20px]`}>
            <Container px={0} className={`py-[44px] md:py-[100px]`}>
                <Card p={0} radius={8} className={`!shadow-lg`}>
                    <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
                        <Stack gap={30}>
                            <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
                                <Flex gap={15} align="center">
                                    <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
                                    <Stack gap={0}>
                                        <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
                                            Invoice Pesanan
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
                                                    icon={iconStatus[transStatus?.name ?? 'Pending']}
                                                    className={`
                                                        text-[18px]
                                                    `}
                                                    style={{ 
                                                        color: transStatus?.bgcolor
                                                    }}
                                                />
                                                <Text size="md" fw={400}>
                                                    {transStatus?.name}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Card>
                                </Stack>
                            </Flex>
                        </Stack>
                    </Card>

                    <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>

                        <Flex gap={20} className={`[&>*]:flex-grow flex-col md:flex-row`}>
                            <Stack className={`min-w-[250px]`}>
                                <AspectRatio ratio={16/5}>
                                    <Image src={data?.has_event.image_url} bg="gray" radius={10} />
                                </AspectRatio>
                            </Stack>

                            <Card withBorder className={`!border-dashed shrink-0 md:max-w-[250px]`} radius={10}>
                                <Stack gap={10}>
                                    <Text fw={600} size="lg">{data?.has_event.name}</Text>

                                    <Flex align="center" gap={10}>
                                        <Icon icon="solar:calendar-bold" className={`shrink-0 text-primary-base text-[20px]`} />
                                        <Text size="sm" c="gray">{data?.has_event && `${formatDate(data?.has_event.start_date)} ${data?.has_event.start_date !== data?.has_event.end_date ? '- ' + formatDate(data?.has_event.end_date) : ''} ${formatYear(data?.has_event.end_date)}`}</Text>
                                    </Flex>

                                    <Flex align="center" gap={10}>
                                        <Icon icon="tabler:clock-filled" className={`shrink-0 text-primary-base text-[20px]`} />
                                        <Text size="sm" c="gray">{data?.has_event?.start_time.toString()} - {data?.has_event?.end_time.toString()}</Text>
                                    </Flex>

                                    <Flex align="start" gap={10}>
                                        <Icon icon="tdesign:location-filled" className={`shrink-0 text-primary-base text-[20px]`} />
                                        <Text size="sm" c="gray">{data?.has_event.location_name}</Text>
                                    </Flex>

                                    <Alert radius={10} mt={10} className={`md:hidden`}>
                                        {transStatus?.description}
                                    </Alert>

                                    {transStatus?.name == 'PAID' && (
                                        <Button
                                            component={Link}
                                            href={`${config.wsUrl}transaction-document/${invoice}`}
                                            target="_blank"
                                            mt={5}
                                            rightSection={<Icon icon="uiw:download" />}>
                                            Unduh Tiket
                                        </Button>
                                    )}
                                </Stack>
                            </Card>
                        </Flex>

                        <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
                            <Stack gap={10}>
                                <Text fw={600} c="gray.8">
                                    Informasi Pemesan
                                </Text>
                                <Card withBorder>
                                    <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>
                                                Nama Pemesan
                                            </Text>
                                            <Text size="sm" fw={600}>
                                                {data?.identities.find(e => e.is_pemesan == 1)?.full_name}
                                            </Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>
                                                Email Pemesan
                                            </Text>
                                            <Text size="sm">{data?.identities.find(e => e.is_pemesan == 1)?.email}</Text>
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

                            {(data?.grandtotal ?? 0) > 0 && (
                                <Stack gap={10} className={`md:max-w-[250px] shrink-0`}>
                                    <Text fw={600} c="gray.8">
                                        Total Pembayaran
                                    </Text>
                                    <Card bg="gray.1">
                                        <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
                                            <Text size="xl" fw={600}>
                                                {(data?.grandtotal ?? 0) > 0 ? (
                                                    <NumberFormatter value={data?.grandtotal ?? 999999} />
                                                ) : (
                                                    <Text fw={600} c="green">Free</Text>
                                                )}
                                            </Text>

                                            {(data?.grandtotal ?? 0) > 0 && (
                                                <>
                                                    <Stack gap={0}>
                                                        <Text size="xs" fw={300}>
                                                            Metode Pembayaran
                                                        </Text>
                                                        <Text size="sm" className='capitalize'>{data?.payment_method.payment_name ?? 'PAYMENT_METHOD'}</Text>
                                                    </Stack>
                                                    <Link href={data?.xendit_url ?? '#'} target="_blank">
                                                        <Text size="xs" className={`hover:underline !text-primary-base`}>
                                                            Buka Halaman Pembayaran
                                                        </Text>
                                                    </Link>
                                                </>
                                            )}
                                        </SimpleGrid>
                                    </Card>
                                </Stack>
                            )}
                        </Flex>

                        <Stack>
                            <Text fw={600} c="gray.8">
                                Syarat dan Ketentuan
                            </Text>
                            <Box px={20}>
                                <div dangerouslySetInnerHTML={{ __html: data?.has_event.term_condition ?? '' }}></div>
                            </Box>
                        </Stack>
                    </Stack>
                </Card>
            </Container>
        </div>
    );
}
