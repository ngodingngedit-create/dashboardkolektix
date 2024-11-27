import { useEffect, useMemo, useRef, useState } from "react";
import { MerchCheckoutOffline } from "../merch-pos";
import { useDidUpdate, useListState } from "@mantine/hooks";
import { MerchListResponse } from "../merch/type";
import useLoggedUser from "@/utils/useLoggedUser";
import fetch from "@/utils/fetch";
import Cookies from 'js-cookie';
import { useRouter } from "next/router";
import { Box, Button, Card, Flex, NumberFormatter, Stack, Table, Text } from "@mantine/core";
import moment from "moment";
import { useReactToPrint } from 'react-to-print';
import { Icon } from "@iconify/react/dist/iconify.js";

type ComponentProps = {
    
};

export default function MerchPosInvoice({  }: Readonly<ComponentProps>) {
    const router = useRouter();
    const user = useLoggedUser();
    const [loading, setLoading] = useListState<string>();
    const [data, setData] = useState<MerchCheckoutOffline>();
    const [merch, setMerch] = useState<MerchListResponse[]>();
    const contentRef = useRef(null);
    const printContent = useReactToPrint({ contentRef });

    useDidUpdate(() => {
        getData();
    }, [user]);

    const getData = async () => {
        const data = JSON.parse(Cookies.get('merch_pos_submit') ?? 'null') as (MerchCheckoutOffline | null);
        data ? setData(data) : router.push('/dashboard/merch-pos');

        await fetch<any, MerchListResponse[]>({
            url: 'product' + `?creator_id=${user?.has_creator?.id}`,
            method: 'GET',
            before: () => setLoading.append('getdata'),
            success: ({ data }) => data && setMerch(data.filter(e => e.product_status_id == 2)),
            complete: () => setLoading.filter(e => e != 'getdata'),
            error: () => {},
        });
    }

    const invoiceData = useMemo(() => {
        const findMerch = (id: number, variant_id?: number) => {
            const data = merch?.find(e => e.id == id);
            const name = data?.product_name;
            const variant = variant_id ? data?.product_varian.find(e => e.id == variant_id)?.varian_name : '';

            return { name, variant }
        };

        const product = data?.product.map(e => ({...e, ...findMerch(e.id, e.variant_id) }));
        const raw = data;
        return { product, raw };
    }, [data, merch]);

    return (
        <Stack align="center" px={20} py={40} gap={20}>
            <Stack gap={3} align="center">
                <Text size="1.5rem" fw={600}>Cetak Faktur</Text>
                <Text size="sm" c="gray">Faktur Penjualan Merchandise</Text>
            </Stack>
            <Card maw={400} w="100%" withBorder p={0} shadow="lg">
                <Card w="100%" ref={contentRef}>
                    <Stack mb={20} gap={5}>
                        <Text fw={600} ta="center" className={`uppercase !italic !underline`}>{user?.has_creator?.name}</Text>
                        <Text ta="center" className={``}>{user?.has_creator?.website ?? 'www.kolektix.com'}</Text>
                    </Stack>
                    <Table unstyled className={`
                        mb-[20px]
                        [&_th]:!border-b [&_th]:!border-b-[#838383] [&_th]:!bg-transparent
                        [&_th]:text-start [&_th]:!font-[600] [&_td:last-child]:!text-end
                    `}>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td>Tel: {user?.has_creator?.phone_number}</Table.Td>
                                <Table.Td>Invoice #{data?.invoice_num}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td>Customer: Walk-in</Table.Td>
                                <Table.Td>{moment(new Date()).format('DD/MM/YYYY')}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td>{data?.customer_name ?? '-'}</Table.Td>
                                <Table.Td>{moment(new Date()).format('HH:mm:ss')}</Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                    <Table unstyled className={`
                        [&_th]:!border-b [&_th]:!border-b-[#838383] [&_th]:!bg-transparent
                        [&_th]:text-start [&_th]:!font-[600] [&_th]:!italic
                    `}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>#</Table.Th>
                                <Table.Th>Produk</Table.Th>
                                <Table.Th>Varian</Table.Th>
                                <Table.Th>Qty</Table.Th>
                                <Table.Th style={{ textAlign: 'end' }}>Subtotal</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {invoiceData.product?.map((e, i) => (
                                <Table.Tr key={i}>
                                    <Table.Td>{i + 1}</Table.Td>
                                    <Table.Td>{e.name}</Table.Td>
                                    <Table.Td>{e.variant ?? '-'}</Table.Td>
                                    <Table.Td>{e.qty}</Table.Td>
                                    <Table.Td className={`text-end`}><NumberFormatter prefix="" value={e.subtotal} /></Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    <Table unstyled className={`
                        mt-[10px]
                        [&_tr:first-child_td]:pt-[10px]
                        [&_tr:last-child_td]:pb-[10px]
                        border-t border-t-[#838383]
                        border-b border-b-[#838383]
                        [&_th]:!border-b [&_th]:!border-b-[#838383] [&_th]:!bg-transparent
                        [&_th]:text-start [&_th]:!font-[600] [&_td:last-child]:!text-end
                    `}>
                        <Table.Tbody>
                            {Object.keys(invoiceData.raw?.summary ?? {}).map((e, i) => (
                                <Table.Tr key={i}>
                                    <Table.Td>{e}</Table.Td>
                                    <Table.Td><NumberFormatter value={(invoiceData.raw?.summary ? invoiceData.raw?.summary[e] : 0)} /></Table.Td>
                                </Table.Tr>
                            ))}
                            <Table.Tr className={`[&_*]:font-[600] border-t [&_*]:pt-[7px] [&_*]:mt-[7px]`}>
                                <Table.Td>Jumlah Dibayar</Table.Td>
                                <Table.Td><NumberFormatter value={invoiceData.raw?.grandtotal} /></Table.Td>
                            </Table.Tr>
                            {invoiceData.raw?.payment_method && (
                                <Table.Tr>
                                    <Table.Td>Metode</Table.Td>
                                    <Table.Td>{invoiceData.raw?.payment_method}</Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                    <Text size="sm" ta="center" my={20}>Terima Kasih Banyak Sudah Berbelanja!</Text>
                </Card>
            </Card>
            <Flex gap={20}>
                <Button size="md" onClick={() => printContent()} rightSection={<Icon icon="la:print" className={`text-[24px]`} />}>
                    Cetak Faktur
                </Button>
            </Flex>
        </Stack>
    );
}