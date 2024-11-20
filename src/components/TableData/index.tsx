import { ActionIcon, Box, Card, Center, Checkbox, Divider, Flex, LoadingOverlay, Menu, MenuDropdown, NumberFormatter, Pagination, Popover, ScrollArea, Select, Stack, Table, TableProps, Text, TextInput, Tooltip } from "@mantine/core";
import { TableHeaders } from "./TableHeaders";
import { ReactNode, useEffect, useMemo, useState } from "react";
import _ from 'lodash';
import { Icon } from "@iconify/react/dist/iconify.js";
import { readLocalStorageValue, useSetState } from "@mantine/hooks";

type ActionType<T> = {
    icon?: string;
    color?: string;
    text: string;
    onClick?: (data?: T) => void;
}

type ComponentProps<T> = {
    tablekey: string;
    data?: T[];
    loading?: boolean;
    opened?: boolean;
    onRowClick?: (data?: T) => void;
    maxHeight?: string;
    withRowIndex?: boolean;
    options?: TableProps;
    currencyFormat?: string[];
    onSelected?: (list: T[], indexlist: number[]) => void;
    headers?: ReactNode;
    fetchUrl?: string;
    action?: ActionType<T>[];
    withSettings?: boolean;
};

type TableSettings = {
    showIndex: boolean;
    verticalSpacing?: TableProps['verticalSpacing'];
    hiddenColumnList: string[];
};

function chunks<T>(arr: T[], n: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += n) {
        result.push(arr.slice(i, i + n));
    }
    return result;
}

export default function TableData<T extends Record<string, ReactNode>>({
    tablekey,
    data: _data = [],
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
    withSettings = false,
}: Readonly<ComponentProps<T>>) {
    const [freeze, setFreeze] = useState<number>();
    const [page, setPage] = useState<T[][]>([[]]);
    const [pageNum, setPageNum] = useState(0);
    const [sort, setSort] = useState<[string, 'ASC' | 'DESC']>();
    const [perPage, setPerPage] = useState<number>(20);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selected, setSelected] = useState<number[]>([]);
    const [settings, setSettings] = useSetState<TableSettings>({
        showIndex: withRowIndex ?? false,
        hiddenColumnList: []
    });

    const storageKey = `TABLE_SETTINGS_${tablekey.toUpperCase()}`;
    const data = useMemo(() => _data, [_data]);
    const header: [string, string][] = useMemo(() => data.length > 0 ?
        Object.keys(data[0]).filter(e => !settings.hiddenColumnList.includes(e)).map((e) => [e, e]) :
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
    }, [settings]);

    useEffect(() => {
        var filteredData = data.filter(e => Object.values(e)
            .some(e => String(e)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
        );

        var sortedData = sort ? _.sortBy(filteredData, [sort[0]]) : filteredData;
        sortedData = sort ? sort[1] == 'ASC' ? sortedData : sortedData.reverse() : filteredData;

        if (data.length > 0) {
            setPage(chunks(sortedData, perPage));
            setPageNum(0);
            setSelected([]);
        }
    }, [data, perPage, sort, searchQuery]);

    return (
        <Stack gap={12} display={!opened ? 'none' : undefined} style={{ maxHeight: maxHeight ?? `calc(100vh - 200px)` }}>
            <Flex justify="space-between" align="center">
                <Box>
                    {headers}
                </Box>

                <Flex align="center" gap={10}>
                    <TextInput
                        size="xs"
                        leftSection={<Icon icon="uiw:search" />}
                        placeholder="Cari Data"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />

                    <Popover position="bottom-end">
                        <Popover.Target>
                            <ActionIcon display={withSettings ? undefined : 'none'} variant="transparent" color="gray" radius="xl">
                                <Icon icon="uiw:setting-o" className={`!text-[20px]`} />
                            </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown className={`!shadow-lg`}>
                            <Flex gap={20} mah="50vh">
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
                                </Stack>
                                <Divider orientation="vertical"  display={Object.keys(data[0] ?? []).length > 0 ? undefined : 'none'} />
                                <Stack className={`overflow-y-auto`} display={Object.keys(data[0] ?? []).length > 0 ? undefined : 'none'}>
                                    <Box className={`sticky top-0 bg-white z-10 pt-[5px] pb-[10px] border-b`}>
                                        <Text size="xs" c="gray">Atur Kolom</Text>
                                    </Box>
                                    {Object.keys(data[0] ?? []).map((e, i) => (
                                        <Checkbox
                                            key={i}
                                            label={e}
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

            {(data.length == 0 && opened) ? (
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
                    <Card radius={15} p={0} withBorder className={`[&_td]:!whitespace-nowrap`} component={ScrollArea}>
                        <LoadingOverlay visible={loading} />
                        <Table {...{ stickyHeader: true, ...options, verticalSpacing: settings.verticalSpacing ?? options?.verticalSpacing ?? 'xs' }}>
                            <Table.Thead>
                                {Boolean(onSelected) && (
                                    <Table.Th className={`sticky -left-px top-0`}>
                                        <Checkbox

                                        />
                                        <Box className={`absolute top-0 left-0 z-20 border-x w-full h-full pointer-events-none`} />
                                    </Table.Th>
                                )}
                                {settings.showIndex && <Table.Th fw={400}>No</Table.Th>}
                                <TableHeaders
                                    data={sort}
                                    onChange={setSort}
                                    label={header}
                                    freezeCol={freeze}
                                    setFreeze={setFreeze}
                                    hasCheckbox={Boolean(onSelected)}
                                    hasAction={Boolean(action)}
                                />
                                {Boolean(action) && (
                                    <Table.Th className={`sticky -right-px top-0`}>
                                        <ActionIcon variant="transparent" color="gray" opacity={0}>
                                            <Icon icon="mingcute:more-2-fill" className={`!text-[18px]`} />
                                        </ActionIcon>
                                        <Box className={`absolute top-0 left-0 z-30 border-x w-full h-full pointer-events-none !bg-[#F3F4F6]`} />
                                    </Table.Th>
                                )}
                            </Table.Thead>
                            <Table.Tbody>
                                {(page.length > 0 ? page[pageNum] : []).map((item, index) => (
                                    <Table.Tr key={index} className={`${onRowClick ? 'cursor-pointer' : ''}`}>
                                        {Boolean(onSelected) && (
                                            <Table.Td className={`sticky -left-px`}>
                                                <Checkbox
                                                    checked={selected.includes(index + (perPage * pageNum))}
                                                    onChange={e => setSelected(e.target.checked ? [...selected, index + (perPage * pageNum)] : selected.filter(z => z != index + (perPage * pageNum)))}
                                                />
                                                <Box className={`absolute top-0 left-0 z-10 border-x w-full h-full pointer-events-none`} />
                                            </Table.Td>
                                        )}
                                        {settings.showIndex && <Table.Td>{(index + (perPage * pageNum) + 1)}</Table.Td>}
                                        {header.map((value, idx) => (
                                            <Table.Td
                                                onClick={() => onRowClick && onRowClick(item)}
                                                key={idx}
                                                className={`
                                                    ${idx === freeze ? `sticky ${Boolean(onSelected) ? 'left-[56px]' : '-left-px'} ${Boolean(action) ? 'right-[65px]' : '-right-px'}` : ''}
                                                `}
                                            >
                                                {currencyFormat?.includes(value[0]) ? (
                                                    <NumberFormatter value={parseInt(item[value[0]] as string) ?? 0} />
                                                ) : (
                                                    <Text size="sm">{Boolean(item[value[0]]) ? item[value[0]] : '-'}</Text>
                                                )}
                                                {idx == freeze && (
                                                    <Box className={`absolute top-0 left-0 z-10 border-x w-full h-full`} />
                                                )}
                                            </Table.Td>
                                        ))}
                                        {Boolean(action) && (
                                            <Table.Td className={`sticky -right-px`}>
                                                <Menu position="bottom-end">
                                                    <Menu.Target>
                                                        <ActionIcon variant="transparent" color="gray">
                                                            <Icon icon="mingcute:more-2-fill" className={`!text-[18px]`} />
                                                        </ActionIcon>
                                                    </Menu.Target>
                                                    <Menu.Dropdown>
                                                        {action?.map((e, i) => (
                                                            <Menu.Item
                                                                key={i}
                                                                leftSection={e.icon ? <Icon icon={e.icon} /> : undefined}
                                                                color={e.color}
                                                                onClick={() => e.onClick && e.onClick(item)}
                                                            >{e.text}</Menu.Item>
                                                        ))}
                                                    </Menu.Dropdown>
                                                </Menu>
                                                <Box className={`absolute top-0 left-0 z-10 border-x w-full h-full pointer-events-none`} />
                                            </Table.Td>
                                        )}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Card>

                    <Flex gap={20} wrap="wrap" align="center">
                        <Pagination
                            total={page?.length ?? 1}
                            radius="md"
                            size='sm'
                            display={page?.length <= 1 ? 'none' : undefined}
                            value={pageNum + 1}
                            onChange={e => setPageNum(e - 1)}
                        />
                        <Divider orientation="vertical" className={`shrink-0`} display={page?.length <= 1 ? 'none' : undefined} />
                        <Flex gap={10} align="center">
                            <Text size="sm" c='gray'>Jumlah per Halaman</Text>
                            <Select
                                size='xs'
                                radius="md"
                                w={70}
                                data={[10, 20, 30, 40, 50].map(String)}
                                value={String(perPage)}
                                onChange={e => e && setPerPage(parseInt(e))}
                            />
                        </Flex>
                    </Flex>
                </>
            )}

        </Stack>
    );
}
