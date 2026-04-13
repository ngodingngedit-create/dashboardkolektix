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
            <Card maw={400} w="100%" withBorder p={15} shadow="lg" className="bg-gray-100 flex justify-center items-center">
                <div ref={contentRef} style={{ width: '58mm', background: '#fff', padding: '10px', fontFamily: '"Courier New", Courier, monospace', fontSize: '11px', color: '#000', lineHeight: 1.4, boxSizing: 'border-box' }}>
                    <style type="text/css" media="print">
                        {`
                            @page { size: 58mm auto; margin: 0; }
                            body { margin: 0; padding: 0; background: none; }
                            * { color: #000 !important; background: transparent !important; box-shadow: none !important; }
                            .print-border-bottom { border-bottom: 1px dashed #000 !important; }
                            .print-border-top { border-top: 1px dashed #000 !important; }
                        `}
                    </style>

                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>{user?.has_creator?.name}</div>
                        <div>{user?.has_creator?.website ?? 'www.kolektix.com'}</div>
                        <div>Tel: {user?.has_creator?.phone_number}</div>
                    </div>

                    <div className="print-border-bottom" style={{ paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px dashed #888' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Inv:</span>
                            <span>#{data?.invoice_num || `KL-${Math.floor(Math.random() * 10000)}`}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tgl:</span>
                            <span>{moment(new Date()).format('DD/MM/YY HH:mm')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Plg:</span>
                            <span>{data?.customer_name || 'Walk-in'}</span>
                        </div>
                    </div>

                    <div className="print-border-bottom" style={{ paddingBottom: '3px', marginBottom: '5px', borderBottom: '1px dashed #888', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Item</span>
                            <span>Total</span>
                        </div>
                    </div>
                    
                    <div style={{ paddingBottom: '5px', marginBottom: '5px' }}>
                        {invoiceData.product?.map((e, i) => (
                            <div key={i} style={{ marginBottom: '8px' }}>
                                <div style={{ wordBreak: 'break-word', paddingRight: '5px' }}>{e.name} {e.variant ? `(${e.variant})` : ''}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '5px' }}>
                                    <span>{e.qty} x <NumberFormatter value={e.price || Math.floor((e.subtotal || 0) / (e.qty || 1))} thousandSeparator="." decimalSeparator="," /></span>
                                    <span><NumberFormatter value={e.subtotal} thousandSeparator="." decimalSeparator="," /></span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="print-border-top" style={{ paddingTop: '8px', marginTop: '5px', borderTop: '1px dashed #888' }}>
                        {Object.keys(invoiceData.raw?.summary ?? {}).map((e, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span>{e}</span>
                                <span><NumberFormatter value={(invoiceData.raw?.summary ? invoiceData.raw?.summary[e] : 0)} thousandSeparator="." decimalSeparator="," /></span>
                            </div>
                        ))}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '8px', fontSize: '13px' }}>
                            <span>TOTAL</span>
                            <span>Rp <NumberFormatter value={invoiceData.raw?.grandtotal} thousandSeparator="." decimalSeparator="," /></span>
                        </div>
                        
                        {invoiceData.raw?.payment_method && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                <span>Metode</span>
                                <span style={{ textTransform: 'capitalize' }}>{invoiceData.raw?.payment_method}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>
                        Terima Kasih Banyak<br/>Sudah Berbelanja!
                    </div>
                </div>
            </Card>
            <Flex gap={20}>
                <Button size="md" variant="light" color="gray" onClick={() => router.push('/dashboard/merch-pos')} leftSection={<Icon icon="uiw:left" className="text-lg" />}>
                    Kembali
                </Button>
                <Button size="md" onClick={() => printContent()} rightSection={<Icon icon="la:print" className={`text-[24px]`} />}>
                    Cetak Faktur
                </Button>
            </Flex>
        </Stack>
    );
}