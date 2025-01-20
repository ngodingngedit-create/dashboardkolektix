import TableData from '@/components/TableData';
import { Pagination } from '@/types/model';
import fetch from '@/utils/fetch';
import { LoadingOverlay, Stack, Flex, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { ReactNode, useEffect, useState } from 'react';

type DataResponse = {
    name: string;
}

export default function VenueTransaction() {
    const [loading, setLoading] = useListState<string>();
    const [data, setData] = useState<Pagination<DataResponse>>();

    useEffect(() => {
        getData();
    }, []);

    const getData = async (params?: string) => {
        if (!loading.includes('getdadta'))
        await fetch<any, Pagination<DataResponse>>({
            url: 'creator-data/venue-transaction?' + params,
            method: 'GET',
            data: {},
            before: () => setLoading.append('getdata'),
            success: ({ data }) => data && setData(data),
            complete: () => setLoading.filter(e => e != 'getdata'),
            error: () => {},
        });
    }

    return (
        <>
            <Stack className={`p-[20px] md:p-[30px]`} gap={30}>
                <LoadingOverlay visible={loading.includes('getdata')} />
                <Flex gap={10} justify="space-between" align="center">
                    <Stack gap={5}>
                        <Text size="1.8rem" fw={600}>
                            Transaksi Venue
                        </Text>
                        <Text size="sm" c="gray">
                            Daftar semua transaksi venue
                        </Text>
                    </Stack>
                </Flex>

                <TableData
                    loading={loading.includes('getdata')}
                    value={data}
                    onChange={getData}
                    data={data?.data ?? []}
                    mapData={e => e}
                />
            </Stack>
        </>
    )
}