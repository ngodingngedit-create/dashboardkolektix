import { ActionIcon, Box, Card, Center, Checkbox, Divider, Flex, LoadingOverlay, Menu, NumberFormatter, Pagination, Popover, ScrollArea, Select, Stack, Table, TableProps, Text, TextInput, Tooltip } from "@mantine/core";
import { TableHeaders } from "./TableHeaders";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import chunks from "../../utils/chunk";
import _ from 'lodash';
import { Icon } from "@iconify/react/dist/iconify.js";
import { readLocalStorageValue, useDebouncedCallback, useSetState } from "@mantine/hooks";
import { PaginationData } from "../../types/model";

type ActionType<T> = {
    icon?: string;
    color?: string;
    text: string;
    onClick?: (data?: T) => void;
}

type HeaderLabelArray = [string, string][];
type DataTypeObject = { [key: string]: any };
type DataType = Record<string, ReactNode | Blob | DataTypeObject | string | undefined>;
type ComponentProps<T, V> = {
    tablekey?: string;
    mapData: (data: T, index: number) => V;
    data: T[];
    headerLabel?: HeaderLabelArray | { [key: string]: string };
    loading?: boolean;
    opened?: boolean;
    onRowClick?: (data?: T) => void;
    maxHeight?: string;
    withRowIndex?: boolean;
    options?: TableProps;
    currencyFormat?: string[];
    onSelected?: (list: T[], indexlist: number[], status: 'all' | 'some' | 'null') => void;
    headers?: ReactNode;
    fetchUrl?: string;
    action?: ActionType<T>[];
    actionIcon?: ActionType<T>[];
    onChangeRaw?: (data: { [key: string]: any }) => void;
    onChange?: (data: string) => void;
    value?: PaginationData;
    canSort?: string[];
    searchField?: boolean;
    width?: string | number;
    height?: string | number;
};

interface TableSettings extends Partial<TableProps> {
    showIndex: boolean;
    verticalSpacing?: TableProps['verticalSpacing'];
    hiddenColumnList: string[];
};

export default function TableData<T extends DataType, V extends DataType>({
    tablekey,
    mapData,
    data: _data,
    headerLabel: _headerLabel = {},
    loading = false,
    opened = true,
    maxHeight,
    withRowIndex,
    onRowClick,
    options,
    currencyFormat,
    onSelected,
    headers,
    action,
    actionIcon,
    onChange,
    value,
    canSort,
    searchField = true,
    onChangeRaw,
    width,
    height,
}: Readonly<ComponentProps<T, V>>) {
    const [freeze, setFreeze] = useState<number>();
    const [page, setPage] = useState<V[][]>([[]]);
    const [pageNum, setPageNum] = useState(0);
    const [sort, setSort] = useState<[string, 'ASC' | 'DESC']>();
    const [perPage, setPerPage] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selected, setSelected] = useState<number[]>([]);
    const [isFirstFetch, setIsFirstFetch] = useState(true);
    const [settings, setSettings] = useSetState<TableSettings>({
        showIndex: withRowIndex ?? false,
        hiddenColumnList: []
    });

    const headerLabel = useMemo(() => {
        return Array.isArray(_headerLabel) ? Object.fromEntries(_headerLabel) : _headerLabel
    }, [_headerLabel]);

    const storageKey = `TABLE_SETTINGS`;
    const data = useMemo(() => _data.map(mapData), [_data]);
    const header: [string, string][] = useMemo(() => data.length > 0 ?
        _.uniq(data.map(e => Object.keys(e)).flat())
            .filter(e => !settings.hiddenColumnList.includes(e))
            .map((e) => [headerLabel[e] ?? e, e]) :
        [], [data, settings.hiddenColumnList]);

    useEffect(() => {
        const settingsData = readLocalStorageValue<TableSettings>({ key: storageKey });
        if (settingsData) {
            setSettings(settingsData);
        } else {
            localStorage.setItem(storageKey, JSON.stringify(settings));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(settings));
        setFreeze(undefined);
    }, [settings]);

    useEffect(() => {
        const selectStatus = selected.length == data.length ? 'all' : selected.length > 0 ? 'some' : 'null';
        onSelected && onSelected(selected.map(e => _data[e]), selected, selectStatus);
    }, [selected]);

    useEffect(() => {
        Boolean(value) ? debounceUpdateServerSide() : updateNonServerside();
    }, [searchQuery]);

    useEffect(() => {
        Boolean(value) ? updateServerSide() : updateNonServerside();
    }, [Boolean(value) ? 0 : data, pageNum, sort]);

    useEffect(() => {
        Boolean(value) ? updateServerSide(true) : updateNonServerside();
    }, [perPage]);

    const debounceUpdateServerSide = useDebouncedCallback(() => {
        updateServerSide();
    }, 700);

    const updateServerSide = (resetPage = false) => {
        const params: string[] = [];
        params.push(`page=${resetPage ? 1 : pageNum + 1}`);
        params.push(`perpage=${perPage}`);

        if (sort) {
            params.push(`sortby=${sort[0]}`);
            params.push(`sortorder=${sort[1]}`);
        }

        if (Boolean(searchQuery)) {
            params.push(`search=${searchQuery}`);
        }

        const rawParamsData = params.reduce((acc, param) => {
            const [key, value] = param.split('=');
            acc[key] = value;
            return acc;
        }, {} as { [key: string]: string });

        perPage != value?.per_page && setPageNum(0);

        if (!isFirstFetch) {
            onChange && onChange(params.join('&'));
            onChangeRaw && onChangeRaw(rawParamsData);
        } else {
            setIsFirstFetch(false);
        }
    }

    const updateNonServerside = () => {
        var filteredData = data.filter(e => Object.values(e)
            .some(e => String(e)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
        );

        var sortedData = sort ? _.sortBy(filteredData, [sort[0]]) : filteredData;
        sortedData = sort ? sort[1] == 'ASC' ? sortedData : sortedData.reverse() : filteredData;

        if (data.length > 0) {
            const _data = chunks(sortedData, perPage)
            setPage(_data);
            setSelected([]);

            if (pageNum > _data.length) {
                setPageNum(0);
            }
        }
    };

    const dataIndex = useCallback((index: number) => {
        if (Boolean(value)) return (perPage * ((value?.current_page ?? 1) - 1)) + (index + 1);
        return (index + (perPage * pageNum) + 1);
    }, [data, pageNum]);

    const tdValue = useCallback((data: any): React.ReactNode => {
        if (data === null || data === undefined) return '-';
        if (typeof data === 'object' && data !== null && !data['$$typeof']) return JSON.stringify(data);

        return data;
    }, []);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <Stack w={width} h={height} gap={12} display={!opened ? 'none' : undefined} style={{ maxHeight: maxHeight ?? `calc(100vh - 200px)` }} key={tablekey}>
            <Flex justify="space-between" align="center">
                <Box>{headers}</Box>

                <Flex align="center" gap={10}>
                    {searchField && (
                        <TextInput
                            size="xs"
                            leftSection={<Icon icon="uiw:search" />}
                            placeholder="Cari Data"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            rightSection={Boolean(searchQuery) && (
                                <ActionIcon
                                    variant="transparent"
                                    color="gray"
                                    onClick={handleClearSearch}
                                >
                                    <Icon icon="ic:round-clear" />
                                </ActionIcon>
                            )}
                        />
                    )}

                    <Popover position="bottom-end">
                        <Popover.Target>
                            <ActionIcon variant="transparent" color="gray" radius="xl">
                                <Icon icon="uiw:setting-o" className={`!text-[20px]`} />
                            </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown className={`!shadow-lg`} maw="100vw">
                            <Flex gap={20} mah="50vh" wrap="wrap" className={`overflow-auto`}>
                                <Stack className={`overflow-y-auto`}>
                                    <Box className={`sticky top-0 bg-white z-10 pt-[5px] pb-[10px] border-b`}>
                                        <Flex align="center" gap={7}>
                                            <Icon icon="uiw:setting-o" className={`text-gray-500 text-[12px]`} />
                                            <Text size="xs" c="gray">Pengaturan Tabel</Text>
                                        </Flex>
                                    </Box>
                                    <Select
                                        label="Jarak Baris"
                                        leftSection={<Icon icon="lsicon:vertical-split-outline" />}
                                        value={String(settings.verticalSpacing ?? "xs")}
                                        onChange={e => setSettings({ verticalSpacing: e ?? undefined })}
                                        data={[
                                            { value: "6px", label: "Sempit (Kecil)" },
                                            { value: "xs", label: "Normal" },
                                            { value: "md", label: "Sedang" },
                                            { value: "lg", label: "Renggang" },
                                            { value: "xl", label: "Sangat Renggang" },
                                        ]}
                                    />
                                    <Checkbox
                                        label="Tampilkan Urutan"
                                        checked={settings.showIndex}
                                        className={`!cursor-pointer`}
                                        onChange={(z) => setSettings({ showIndex: z.target.checked })}
                                    />
                                    <Checkbox
                                        label="Garis Kolom"
                                        checked={settings.withColumnBorders}
                                        className={`!cursor-pointer`}
                                        onChange={(z) => setSettings({ withColumnBorders: z.target.checked })}
                                    />
                                    <Checkbox
                                        label="Garis Baris"
                                        defaultChecked
                                        checked={settings.withRowBorders}
                                        className={`!cursor-pointer`}
                                        onChange={(z) => setSettings({ withRowBorders: z.target.checked })}
                                    />
                                </Stack>
                                <Divider className={`md:block hidden`} orientation="vertical" display={Object.keys(data[0] ?? []).length > 0 ? undefined : 'none'} />
                                <Stack className={`overflow-y-auto`} display={Object.keys(data[0] ?? []).length > 0 ? undefined : 'none'}>
                                    <Box className={`sticky top-0 bg-white z-10 pt-[5px] pb-[10px] border-b`}>
                                        <Text size="xs" c="gray">Atur Kolom</Text>
                                    </Box>
                                    {Object.keys(data[0] ?? []).map((e, i) => (
                                        <Checkbox
                                            key={i}
                                            label={headerLabel[e] ?? e}
                                            checked={!settings.hiddenColumnList.includes(e)}
                                            className={`!cursor-pointer`}
                                            onChange={(z) => setSettings({ hiddenColumnList: z.target.checked ? settings.hiddenColumnList.filter(z => z != e) : [...settings.hiddenColumnList, e] })}
                                        />
                                    ))}
                                </Stack>
                            </Flex>
                        </Popover.Dropdown>
                    </Popover>
                </Flex>
            </Flex>

            {(data.length == 0 && opened && !loading) ? (
                <Card withBorder py={40}>
                    <Center>
                        <Stack align="center">
                            <Icon icon="ic:twotone-do-not-disturb-alt" className={`text-[48px] text-[--mantine-primary-color-filled]`} />
                            <Divider w={140} mb={-10} />
                            <Text c="gray">Data Tidak Ditemukan</Text>
                            <Divider w={140} mt={-10} />
                        </Stack>
                    </Center>
                </Card>
            ) : (
                <>
                    <Card p={0} withBorder className={`[&_td]:!whitespace-nowrap [&_tbody]:!border-b [&_tbody]:!border-[#d0d0d0]`} mih={300} h="100%" component={ScrollArea}>
                        <LoadingOverlay visible={loading} />
                        <Table {...{
                            stickyHeader: true,
                            ...options,
                            verticalSpacing: settings.verticalSpacing ?? options?.verticalSpacing ?? 'xs',
                            withColumnBorders: settings.withColumnBorders ?? options?.withColumnBorders ?? false,
                            withRowBorders: settings.withRowBorders ?? options?.withRowBorders ?? true
                        }}>
                            <Table.Thead>
                                {Boolean(onSelected) && (
                                    <Table.Th className={`sticky -left-px top-0`}>
                                        <Checkbox
                                            checked={selected.length == data.length}
                                            indeterminate={selected.length > 0 && !(selected.length == data.length) ? true : undefined}
                                            color={selected.length > 0 && !(selected.length == data.length) ? 'gray.5' : undefined}
                                            onChange={e => e.target.checked ? setSelected(Array(data.length).fill(1).map((_, i) => i)) : setSelected([])}
                                        />
                                        <Box className={`absolute top-0 left-0 z-20 w-full h-full pointer-events-none`} />
                                    </Table.Th>
                                )}
                                {settings.showIndex && <Table.Th>No</Table.Th>}
                                <TableHeaders
                                    data={sort}
                                    onChange={setSort}
                                    label={header}
                                    freezeCol={freeze}
                                    setFreeze={setFreeze}
                                    hasCheckbox={Boolean(onSelected)}
                                    hasAction={((action?.length ?? 0) > 0)}
                                    canSort={canSort}
                                />
                                {(((action?.length ?? 0) > 0) || ((actionIcon?.length ?? 0) > 0)) && (
                                    <Table.Th className={`sticky -right-px top-0`}>
                                        <Box className={`absolute top-0 left-0 z-30 border-x border-[#d0d0d0] w-full h-full pointer-events-none !bg-[#F3F4F6]`} />
                                    </Table.Th>
                                )}
                            </Table.Thead>
                            <Table.Tbody>
                                {(Boolean(value) ? data : page.length > 0 ? page[pageNum] : []).map((item, index) => (
                                    <Table.Tr key={index} className={`${onRowClick ? 'cursor-pointer' : ''}`}>
                                        {Boolean(onSelected) && (
                                            <Table.Td className={`sticky -left-px`} width={56}>
                                                <Checkbox
                                                    checked={selected.includes(index + (perPage * pageNum))}
                                                    onChange={e => setSelected(e.target.checked ? [...selected, index + (perPage * pageNum)] : selected.filter(z => z != index + (perPage * pageNum)))}
                                                />
                                                <Box className={`absolute top-0 left-0 z-10 border-x border-[#d0d0d0] w-full h-full pointer-events-none`} />
                                            </Table.Td>
                                        )}
                                        {settings.showIndex && <Table.Td>{dataIndex(index)}</Table.Td>}
                                        {header.map((value, idx) => (
                                            <Table.Td
                                                onClick={() => onRowClick && onRowClick(_data[index])}
                                                key={idx}
                                                className={`
                                                    ${idx === freeze ? `sticky ${Boolean(onSelected) ? 'left-[56px]' : '-left-px'} ${((action?.length ?? 0) > 0) ? 'right-[65px]' : '-right-px'}` : ''}
                                                `}
                                            >
                                                {currencyFormat?.includes(value[1]) ? (
                                                    <NumberFormatter value={parseInt(item[value[1]] as string) ?? 0} />
                                                ) : (
                                                    <Text size="sm">
                                                        {Boolean(item[value[1]]) ? tdValue(item[value[1]] ?? '-') : '-'}
                                                    </Text>
                                                )}
                                                {idx == freeze && (
                                                    <Box className={`absolute top-0 left-0 z-10 border-x border-[#d0d0d0] w-full h-full`} />
                                                )}
                                            </Table.Td>
                                        ))}
                                        {(((action?.length ?? 0) > 0) || ((actionIcon?.length ?? 0) > 0)) && (
                                            <Table.Td className={`sticky -right-px !py-0 !px-2`}>
                                                <Flex align="center">
                                                    {actionIcon?.map((e, i) => (
                                                        <Tooltip key={i} label={e.text}>
                                                            <ActionIcon
                                                                p={0}
                                                                className={`hoverBtn`}
                                                                key={i}
                                                                variant="transparent"
                                                                color={e.color ?? "gray"}
                                                                onClick={() => e.onClick && e.onClick(_data[index])}>
                                                                <Icon icon={e.icon ?? '-'} className={`!text-[22px]`} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    ))}
                                                    <Menu position="left-start">
                                                        <Menu.Target>
                                                            <ActionIcon display={((action?.length ?? 0) > 0) ? undefined : 'none'} variant="transparent" color="gray">
                                                                <Icon icon="mingcute:more-2-fill" className={`!text-[18px]`} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            {action?.map((e, i) => (
                                                                <Menu.Item
                                                                    key={i}
                                                                    leftSection={e.icon ? <Icon icon={e.icon} /> : undefined}
                                                                    color={e.color}
                                                                    onClick={() => e.onClick && e.onClick(_data[index])}
                                                                >{e.text}</Menu.Item>
                                                            ))}
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                    <Box className={`absolute top-0 left-0 z-10 border-x border-[#d0d0d0] w-full h-full pointer-events-none`} />
                                                </Flex>
                                            </Table.Td>
                                        )}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Card>

                    <Flex gap={20} wrap="wrap" align="center">
                        <Pagination
                            disabled={loading}
                            total={value?.last_page ?? page?.length ?? 1}
                            radius="md"
                            size='sm'
                            display={(value?.last_page ?? page?.length) <= 1 ? 'none' : undefined}
                            value={value?.current_page ?? (pageNum + 1)}
                            onChange={e => setPageNum(e - 1)}
                        />
                        <Divider orientation="vertical" className={`shrink-0`} display={(value?.last_page ?? page?.length) <= 1 ? 'none' : undefined} />
                        <Flex gap={10} align="center">
                            <Text size="sm" c='gray'>Jumlah per Halaman</Text>
                            <Select
                                disabled={loading}
                                size='xs'
                                radius="md"
                                w={70}
                                data={[5, 10, 20, 40, 50, 100].map(String)}
                                value={String(value?.per_page ?? perPage)}
                                onChange={e => e && setPerPage(parseInt(e))}
                            />
                        </Flex>
                    </Flex>
                </>
            )}

        </Stack>
    );
}
