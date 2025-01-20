import { LoadingOverlay, Stack, Flex, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';

export default function VenueTransaction() {
    const [loading, setLoading] = useListState<string>();

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
            </Stack>
        </>
    )
}