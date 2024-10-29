import { Get } from '@/utils/REST';
import { Card, ScrollArea, Table, TableData, Title } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useListState } from '@mantine/hooks';
import _ from 'lodash';

const Merch = () => {
    const [dataList, setDataList] = useState<any[]>();
    const [loading, setLoading] = useListState<string>();

    useEffect(() => {
        if (dataList == undefined) getData();
    }, []);

    const getData = () => {
        if (loading.includes('getdata')) return;
        setLoading.append('getdata');
        Get(`product`, {})
        .then((res: any) => {
            setDataList(res.data);
            setLoading.filter((e) => e != 'getdata');
        })
        .catch((err) => {
            console.log(err);
            setLoading.filter((e) => e != 'getdata');
        });
    };

    const tableData: TableData = {
        head: dataList ? Object.keys(dataList[0]).map(_.capitalize) : [],
        body: dataList?.map((e, i) => Object.values(e))
    };

    return (
        <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
            <Title order={1} size="h2">
                Sample Table
            </Title>

            <Card p={0} withBorder maw="100%">
                <ScrollArea>
                    <Table data={tableData} />
                </ScrollArea>
            </Card>
        </div>
    );
};

export default Merch;
