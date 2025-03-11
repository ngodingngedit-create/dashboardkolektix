import { Icon } from "@iconify/react/dist/iconify.js";
import { ActionIcon, Box, Flex, Table, Text, Tooltip, UnstyledButton, useMantineTheme } from "@mantine/core";

type ComponentProps = {
    label: string;
    value: string;
    status?: boolean;
    sort?: 'ASC' | 'DESC';
    onClick?: () => void;
    freezed?: boolean;
    canfreeze?: boolean;
    canSort?: string[];
    onFreezeClick?: () => void;
};

export default function TableHeader({ label, value, sort, onClick, status = true, freezed, onFreezeClick, canfreeze = true, canSort }: Readonly<ComponentProps>) {
    const cansort = canSort ? canSort.includes(value) : true;

    return (
        <Flex align="center" justify="space-between" gap={5} mt={-3}>
            <UnstyledButton w="100%" p={0} onClick={cansort ? onClick : undefined} className={`[&_.txt]:hover:text-[--mantine-color-gray-7] ${!cansort ? '!cursor-default' : ''}`}>
                <Flex align="center" gap={5}>
                    {(sort != undefined) && <Icon icon={sort == "ASC" ? "line-md:arrow-up" : "line-md:arrow-down"} className={`text-[--mantine-primary-color-filled]`} />}
                    <Text size="sm" fw={600} c={(status || sort) ? "gray.7" : "gray.5"} mb={-3} className={`txt whitespace-nowrap`}>{label}</Text>
                </Flex>
            </UnstyledButton>
            {canfreeze && (
                <Tooltip label={freezed ? "Unfreeze Column" : "Freeze Column"}>
                    <Box className={`translate-y-[3px] translate-x-[12px]`}>
                        <ActionIcon onClick={onFreezeClick} variant="transparent" size="md" color={freezed ? "orange" : "gray.4"} className={`${freezed ? '' : 'hvrPin opacity-0'}`}>
                            <Icon icon="bxs:pin" className={`!text-[18px]`}/>
                        </ActionIcon>
                    </Box>
                </Tooltip>
            )}
        </Flex>
    );
};

type HeadersComponentProps = {
    label: [string, string][];
    data?: [string, 'ASC' | 'DESC'];
    onChange?: (data: [string, 'ASC' | 'DESC'] | undefined) => void;
    freezeCol?: number;
    canFreeze?: boolean;
    setFreeze?: (idx: number | undefined) => void;
    hasCheckbox?: boolean;
    hasAction?: boolean;
    canSort?: string[];
};

export function TableHeaders({ label, data, onChange, freezeCol, setFreeze, canSort, canFreeze = true, hasCheckbox = false, hasAction = false }: Readonly<HeadersComponentProps>) {
    const theme = useMantineTheme();

    return <>
        {
            label.map((e, i) => (
                <Table.Th key={i} className={`${freezeCol != undefined && i == freezeCol ? `sticky ${hasCheckbox ? 'left-[56px]' : '-left-px'} ${hasAction ? 'right-[65px]' : '-right-px'}` : ''} [&_.hvrPin]:hover:!opacity-100`}>
                    <Box className={`${i == freezeCol ? 'relative z-30 [&_*]:!text-[--mantine-primary-color-filled] [&_*]:!font-[800]' : 'z-10'}`}>
                        {e[0] == 'divider' ? (
                            <Box key={i} className={`w-px bg-black/10 h-[30px] -my-[10px]`} />
                        ) : (
                            <TableHeader
                                canSort={canSort}
                                freezed={freezeCol == i}
                                canfreeze={(freezeCol == i && canFreeze) || (canFreeze && freezeCol == undefined)}
                                label={e[0]}
                                value={e[1]}
                                sort={(data && e[1] == data[0]) ? data[1] : undefined}
                                status={data == undefined}
                                onClick={() => !canSort ? {} : (Boolean(e[0]) && onChange) && onChange(
                                    (data && data[0]) == e[1] ?
                                    (data && data[1] == 'DESC') ? undefined : [e[1], (data && data[1] == 'ASC') ? 'DESC' : 'ASC'] :
                                    [e[1], 'ASC']
                                )}
                                onFreezeClick={() => setFreeze && setFreeze(freezeCol == i ? undefined : i)}
                            />
                        )}
                    </Box>

                    {i == freezeCol && <Box
                        className={`absolute top-0 left-0 z-20 border-x w-full h-full pointer-events-none`}
                        style={{ background: `linear-gradient(to right, ${theme.colors[theme.primaryColor][1]}70, ${theme.colors[theme.primaryColor][0]}30)` }}
                    />}
                </Table.Th>
            ))
        }
    </>;
};
