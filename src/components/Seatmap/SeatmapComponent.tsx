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
                    {data.text && <Text size="xs" c="gray">{data.text}</Text>}
                    <Stack gap={5} w="100%" h="100%" justify="space-between">
                        {chunk((Array((data?.col ?? 1) * (data?.row ?? 1)).fill(data?.prefix).map((e, i) => (`${e}${i + 1}`)) ?? []), (data?.col ?? 1)).map((e, r) => (
                            <Flex gap={5} w="100%" h="100%" justify="space-between" key={r}>
                                {e.map((e, c) => (
                                    <Box w="100%" h="100%" key={c} className={`rounded-md bg-grey/50`}>
                                        <Center w="100%" h="100%">
                                            <Text size="xs" c="white" className={`uppercase`}>
                                                {e}
                                            </Text>
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