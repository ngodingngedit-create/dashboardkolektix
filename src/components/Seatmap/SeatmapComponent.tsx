import chunk from "@/utils/chunk";
import { SeatmapData } from "@/utils/formInterface";
import { Box, Center, Flex, Stack, Text } from "@mantine/core";

type ComponentProps = {
    data: SeatmapData;
};

export default function SeatmapComponent({ data }: Readonly<ComponentProps>) {

    const renderSeatGrid = () => {
        const totalCol = data?.col ?? 1;
        const totalRow = data?.row ?? 1;
        const colsLeft = data?.cols_left ?? Math.floor(totalCol / 2);
        const colsRight = totalCol - colsLeft;
        const gapSize = data?.gap ?? 20;
        const seatCodes = Array(totalCol * totalRow).fill(0).map((_, i) =>
            `${data.is_show_code !== false ? data?.prefix ?? "" : ""}${i + (data?.starting_seat ?? 1)}`
        );
        const rows = chunk(seatCodes, totalCol);

        return (
            <Stack w="100%" h="100%" justify="space-between">
                {rows.map((rowSeats, r) => (
                    <div 
                        key={r}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${colsLeft}, 40px) ${gapSize}px repeat(${colsRight}, 40px)`,
                            gap: '25px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            border: '2px solid red'
                        }}
                    >
                        {/* Left seats: cols_left columns */}
                        {rowSeats.slice(0, colsLeft).map((code, c) => (
                            <Box
                                w="40px"
                                h="40px"
                                key={`l-${c}`}
                                className={`rounded-md bg-grey/50`}
                                style={{ margin: '5px' }}
                            >
                                <Center w="100%" h="100%">
                                    {data.is_show_code !== false && (
                                        <Text size="xs" c="white" className={`uppercase`}>
                                            {code}
                                        </Text>
                                    )}
                                </Center>
                            </Box>
                        ))}
                        {/* Aisle */}
                        <div />
                        {/* Right seats: remaining columns */}
                        {rowSeats.slice(colsLeft).map((code, c) => (
                            <Box
                                w="40px"
                                h="40px"
                                key={`r-${c}`}
                                className={`rounded-md bg-grey/50`}
                                style={{ margin: '5px' }}
                            >
                                <Center w="100%" h="100%">
                                    {data.is_show_code !== false && (
                                        <Text size="xs" c="white" className={`uppercase`}>
                                            {code}
                                        </Text>
                                    )}
                                </Center>
                            </Box>
                        ))}
                    </div>
                ))}
            </Stack>
        );
    };

    return (
        <Box
            bg="gray.1"
            h="100%"
            className={`rounded-md`}>

            {data.type == 'box' && (
                <Center h="100%">
                    <Text>{data.text}</Text>
                </Center>
            )}

            {data.type == 'seat' && (
                <Stack h="100%" align="center" justify="center" gap={20} p={20}>
                    {(data.seat_label || data.text) && (
                        <Stack gap={0} align="center" className="absolute bottom-full mb-2 w-full left-0 pointer-events-none">
                            {data.text && <Text size="xs" fw={700} c="gray.8" className="uppercase">{data.text}</Text>}
                            {data.seat_label && <Text size="xs" c="gray">{data.seat_label}</Text>}
                        </Stack>
                    )}
                    {renderSeatGrid()}
                </Stack>
            )}

        </Box>
    );
}