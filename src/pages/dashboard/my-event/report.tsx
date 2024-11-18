import { Get } from '@/utils/REST';
import { Badge, Box, Card, Flex, LoadingOverlay, ScrollArea, SegmentedControl, Select, Stack, Table, Tabs, Text, Title } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useDidUpdate, useListState } from '@mantine/hooks';
import _ from 'lodash';
import moment from 'moment';
import { Tab } from '@nextui-org/react';
import TableData from '@/components/TableData';
import { EventListResponse, TransactionListResponse, TransactionStatusResponse } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';

const Merch = () => {
    const [isr, setIsr] = useState(false);
    const [dataList, setDataList] = useState<TransactionListResponse[]>();
    const [eventList, setEventList] = useState<EventListResponse[]>();
    const [selectedEvent, setSelectedEvent] = useState<number>();
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>();
    const [loading, setLoading] = useListState<string>();
    const [transactionSegment, setTransactionSegment] = useState<string>('all');
    const user = useLoggedUser();

    useEffect(() => {
        setIsr(true);
    }, []);

    useDidUpdate(() => {
        getEvent();
    }, [isr]);

    useDidUpdate(() => {
        getData();
    }, [selectedEvent]);

    const getEvent = async () => {
        await fetch<any, EventListResponse[]>({
            url: 'event',
            method: 'GET',
            before: () => setLoading.append(''),
            success: ({ data }) => {
                if ((data?.length ?? 0) > 0 && data) {
                    const _data = data.filter(e => parseInt(e.creator_id) == user?.has_creator?.id)
                    setEventList(_data);
                    setSelectedEvent(_data[0].id);
                }
            },
            complete: () => setLoading.filter(e => e != ''),
        });
        await fetch<any, any>({
            url: 'transaction-statuses',
            method: 'GET',
            before: () => setLoading.append(''),
            success: (_data) => {
                const data = _data as TransactionStatusResponse[];
                if ((data?.length ?? 0) > 0 && data) {
                    setTransactionStatus(data);
                }
            },
            complete: () => setLoading.filter(e => e != ''),
        });
    };

    const getData = async () => {
        await fetch<any, TransactionListResponse[]>({
            url: `list-transaction-by-event?event_id=${selectedEvent}`,
            method: 'GET',
            before: () => setLoading.append('getdata'),
            success: ({ data }) => data && setDataList(data),
            complete: () => setLoading.filter(e => e != 'getdata'),
        });
    };

    const listPemesan = useMemo(() => {
        return dataList?.filter(e => e.payment_status == 'Verified').map(e => e.identities).flat().map(e => ({
            'No. Identitas': e.nik,
            'Nama Pemesan': e.full_name,
            'Email': e.email,
            'No. Telepon': e.no_telp,
            'Tanggal Dibuat': moment(e.created_at).format('HH:mm:ss DD MMM YYYY'),
        }));
    }, [dataList]);

    const listTransaksi = useMemo(() => {
        return dataList?.filter(e => transactionSegment == 'all' ? true : e.type_transaction == transactionSegment).map(e => ({
            'ID': e.id,
            'Email': e.identities.find(e => e.is_pemesan == 1)?.email ?? '-',
            'No. Invoice': e.invoice_no,
            'Waktu Dikirim': moment(e.payment_date).format('HH:mm:ss DD MMM YYYY'),
            'Status': <Badge className={`[&_*]:!text-[12px] [&_*]:!font-[600]`} size="sm" color={transactionStatus?.find(z => z.id == e.transaction_status_id)?.bgcolor}>
                {transactionStatus?.find(z => z.id == e.transaction_status_id)?.name}
            </Badge>,
            'Type': <Text className={`capitalize`}>{e.type_transaction}</Text>
        }))
    }, [dataList, transactionSegment]);

    if (!isr) return <></>;

    return (
        <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
            <Flex gap={20} justify="space-between">
                <Stack gap={0}>
                    <Title order={1} size="h2">Report Event</Title>
                    <Text size="sm" c="gray">Halaman Report Event Anda</Text>
                </Stack>

                <Flex align="center" gap={10}>
                    <Text size="sm">Pilih Event</Text>
                    <Select
                        value={String(selectedEvent)}
                        data={eventList?.map(e => ({ value: String(e.id), label: e.name }))}
                        onChange={e => e && setSelectedEvent(parseInt(e))}
                    />
                </Flex>
            </Flex>

            <Tabs defaultValue="pemesan">
                <Tabs.List>
                    <Tabs.Tab value="pemesan">Data Pemesan</Tabs.Tab>
                    <Tabs.Tab value="transaksi">Data Penjualan</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="pemesan">
                    <Box mt={20}>
                        <TableData
                            loading={loading.includes('getdata')}
                            tablekey="pemesan"
                            withRowIndex
                            data={listPemesan}
                        />
                    </Box>
                </Tabs.Panel>
                <Tabs.Panel value="transaksi">
                    <Box mt={20}>
                        <TableData
                            loading={loading.includes('getdata')}
                            headers={
                                <SegmentedControl
                                    value={transactionSegment}
                                    onChange={e => setTransactionSegment(e)}
                                    data={[
                                        { label: 'All', value: 'all' },
                                        { label: 'Online', value: 'online' },
                                        { label: 'Offline', value: 'offline' },
                                    ]}
                                    radius="xl"
                                    color="#0b387c"
                                />
                            }
                            tablekey="transaksi"
                            withRowIndex
                            data={listTransaksi}
                        />
                    </Box>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
};

export default Merch;
