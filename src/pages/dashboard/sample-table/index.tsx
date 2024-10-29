import { Get } from '@/utils/REST';
import { Card, LoadingOverlay, ScrollArea, Table, TableData, Title } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useListState } from '@mantine/hooks';
import _ from 'lodash';
import moment from 'moment';

const Merch = () => {
    const [dataList, setDataList] = useState<any[]>();
    const [loading, setLoading] = useListState<string>();

    useEffect(() => {
        if (dataList == undefined) getData();
    }, []);

    const getData = () => {
        if (loading.includes('getdata')) return;
        setLoading.append('getdata');
        Get(`category`, {})
            .then((res: any) => {
                setDataList(res.data);
                setLoading.filter((e) => e != 'getdata');
            })
            .catch((err) => {
                console.log(err);
                setLoading.filter((e) => e != 'getdata');
            });
    };

    const tableData = useMemo<TableData>(() => {
        const column: { [key: string]: [string, (data: any) => any] | [string] } = {
            id: ['ID'],
            name: ['Name'],
            created_at: ['Tanggal', (data: string) => moment(data).format('DD-MM-YYYY')]
        };

        const headKeys = Object.keys(column);
        const head = dataList
            ? headKeys.map((e) => _.capitalize(column[e][0]))
            : [];

        const body = dataList?.map((e) =>
            headKeys.map((key) => {
                const value = e[key] || '';
                const modifier = column[key][1];
                return modifier ? modifier(value) : value;
            })
        );

        return { head, body };
    }, [dataList]);

    return (
        <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
            <Title order={1} size="h2">
                Sample Table
            </Title>

            <Card p={0} withBorder maw="100%">
                <LoadingOverlay visible={loading.includes('getdata')} />
                <ScrollArea>
                    <Table data={tableData} />
                </ScrollArea>
            </Card>
        </div>
    );
};

export default Merch;
