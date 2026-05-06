import chunk from "@/utils/chunk";
import { SeatmapData } from "@/utils/formInterface";
import { Box, Center, Flex, Stack, Text } from "@mantine/core";

type ComponentProps = {
    data: SeatmapData;
};

export default function SeatmapComponent({ data }: Readonly<ComponentProps>) {

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
                <Stack h="100%" align="center" justify="center" gap={5} p={10}>
                    {(data.seat_label || data.text) && (
                        <Stack gap={0} align="center" className="absolute bottom-full mb-2 w-full left-0 pointer-events-none">
                            {data.text && <Text size="xs" fw={700} c="gray.8" className="uppercase">{data.text}</Text>}
                            {data.seat_label && <Text size="xs" c="gray">{data.seat_label}</Text>}
                        </Stack>
                    )}
                    <Stack gap={5} w="100%" h="100%" justify="space-between">
                        {chunk((Array((data?.col ?? 1) * (data?.row ?? 1)).fill(0).map((_, i) => (`${data.is_show_code !== false ? data?.prefix ?? "" : ""}${i + (data?.starting_seat ?? 1)}`)) ?? []), (data?.col ?? 1)).map((e, r) => (
                            <Flex gap={5} w="100%" h="100%" justify="space-between" key={r}>
                                {e.map((e, c) => (
                                    <Box w="100%" h="100%" key={c} className={`rounded-md bg-grey/50`}>
                                        <Center w="100%" h="100%">
                                            {data.is_show_code !== false && (
                                                <Text size="xs" c="white" className={`uppercase`}>
                                                    {e}
                                                </Text>
                                            )}
                                        </Center>
                                    </Box>
                                ))}
                            </Flex>
                        ))}
                    </Stack>
                </Stack>
            )}

        </Box>
    );
}