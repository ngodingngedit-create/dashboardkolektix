import { VenueProps } from "@/utils/globalInterface";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ActionIcon, Alert, Button, Card, Center, Divider, Flex, Image, Modal, NumberFormatter, NumberInput, Select, Stack, Text, TextInput, Title, UnstyledButton } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import { VenueListResponse } from "../venue/type";
import { useListState, useSetState } from "@mantine/hooks";
import fetch from "@/utils/fetch";
import useLoggedUser from "@/utils/useLoggedUser";
import moment from "moment";
import { modals } from "@mantine/modals";

type DateList = {
    date?: string;
    start_time?: string;
    end_time?: string;
};

export default function VenuePos() {
    const [loading, setLoading] = useListState<string>();
    const [venue, setVenue] = useListState<VenueListResponse>();
    const user = useLoggedUser();
    const [open, setOpen] = useState<string>();
    const [selectedVenue, setSelectedVenue] = useState<VenueListResponse>();
    const [date, setDate] = useListState<DateList>([]);
    const [dummyDate, setDummyDate] = useSetState<DateList>({});
    const [selectedPayment, setSelectedPayment] = useState<string>();

    const getData = async () => {
        if (!user) return;
        await fetch<any, VenueListResponse[]>({
            url: 'creator-data/venue',
            method: 'GET',
            success: ({ data }) => data && setVenue.setState(data),
            before: () => setLoading.append('getdata'),
            complete: () => setLoading.filter(e => e != 'getdata'),
        });
    }

    useEffect(() => {
        setDummyDate({
            date: undefined,
            start_time: undefined,
            end_time: undefined,
        })
    }, [open]);

    useEffect(() => {
        getData();
    }, [user]);

    return (
        <>

            <Stack className={`p-[20px] md:p-[24px]`} gap={20} w="100%" pb={100}>
                <Stack gap={0}>
                    <Title size="h2" mb={4}>Booking Venue</Title>
                    <Text size="sm" c="gray">Buat Booking Venue secara offline</Text>
                </Stack>

                <Divider my="sm" />

                <Flex className={`[&>*]:!flex-grow`} gap={20}>
                    <Stack>
                        <Card withBorder radius={10} p={25}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="tabler:building" className="text-primary-base" />
                                    <Text size="sm" className={`!text-primary-base`}>Informasi Venue</Text>
                                </Flex>

                                <Select
                                    placeholder="Pilih Venue"
                                    data={venue.map(v => ({ value: String(v.id), label: v.name }))}
                                    value={selectedVenue ? String(selectedVenue.id) : null}
                                    onChange={(val) => setSelectedVenue(venue.find(v => String(v.id) === val))}
                                    searchable
                                />

                                {selectedVenue && (
                                    <Card withBorder radius={10} p="sm">
                                        <Flex gap={10}>
                                            {selectedVenue?.venue_gallery[0] ? <Image src={selectedVenue?.venue_gallery[0].image_url} w={64} radius={8} /> : (
                                                <Card w={64} h={64} radius={8} bg="gray.1"></Card>
                                            )}
                                            <Stack gap={0}>
                                                <Text>{selectedVenue?.name}</Text>
                                                <Text c="gray" size="sm"><NumberFormatter prefix="Rp " value={parseInt(String(selectedVenue?.starting_price))} thousandSeparator="." decimalSeparator="," /></Text>
                                            </Stack>
                                        </Flex>
                                    </Card>
                                )}
                            </Stack>
                        </Card>

                        <Card withBorder radius={10} p={25}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="uil:calendar" className="text-primary-base" />
                                    <Text size="sm" className={`!text-primary-base`}>Tanggal Booking</Text>
                                </Flex>

                                <Flex gap={10} align="flex-end" wrap="wrap">
                                    <DatePickerInput
                                        minDate={new Date()}
                                        label="Tanggal"
                                        placeholder="Pilih Tanggal"
                                        value={dummyDate.date ? new Date(dummyDate.date) : undefined}
                                        onChange={e => setDummyDate({ ...dummyDate, date: e ? moment(e).format('YYYY-MM-DD') : undefined })}
                                        style={{ flex: 1, minWidth: 150 }}
                                    />
                                    <TimeInput
                                        label="Jam Awal"
                                        value={dummyDate.start_time || ""}
                                        onChange={e => setDummyDate({ ...dummyDate, start_time: e.target.value })}
                                        style={{ width: 100 }}
                                    />
                                    <TimeInput
                                        label="Jam Selesai"
                                        value={dummyDate.end_time || ""}
                                        onChange={e => setDummyDate({ ...dummyDate, end_time: e.target.value })}
                                        style={{ width: 100 }}
                                    />
                                    <Button
                                        onClick={() => {
                                            setDate.append(dummyDate);
                                            setDummyDate({ date: undefined, start_time: undefined, end_time: undefined });
                                        }}
                                        disabled={!dummyDate.date || !dummyDate.end_time || !dummyDate.start_time}
                                        variant="light" color="blue"
                                    >
                                        Tambah
                                    </Button>
                                </Flex>

                                {date.length > 0 && (
                                    <Stack gap="xs" mt="sm">
                                        {date.map((e, i) => (
                                            <Card p="xs" withBorder radius={8} key={i}>
                                                <Flex justify="space-between" align="center">
                                                    <Text size="sm">{moment(e.date).format('DD MMMM YYYY')} ({e.start_time} - {e.end_time})</Text>
                                                    <ActionIcon color="red" variant="subtle" onClick={() => setDate.remove(i)}>
                                                        <Icon icon="uiw:delete" />
                                                    </ActionIcon>
                                                </Flex>
                                            </Card>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </Card>

                        <Card withBorder radius={10} p={25}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="ep:user" className="text-primary-base" />
                                    <Text size="sm" className={`!text-primary-base`}>Data Pemesan</Text>
                                </Flex>

                                <TextInput
                                    required
                                    label="Nama Pemesan"
                                    placeholder="Masukan Nama Pemesan"
                                />
                                <TextInput
                                    required
                                    label="Email Pemesan"
                                    placeholder="Masukan Email Pemesan"
                                />
                                <TextInput
                                    required
                                    label="No. Telp Pemesan"
                                    placeholder="Masukan No. Telp Pemesan"
                                />
                            </Stack>
                        </Card>
                    </Stack>

                    <Stack maw={300}>
                        <Card p={20} withBorder radius={10} className={`!sticky !top-0 !overflow-visible`}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="ep:money" className="text-primary-base text-[20px]" />
                                    <Text size="sm" className={`!text-primary-base`}>Metode Pembayaran</Text>
                                </Flex>

                                <Select
                                    placeholder="Pilih Metode Pembayaran"
                                    data={[{ value: 'Cash', label: 'Cash' }]}
                                    value={selectedPayment}
                                    onChange={(val) => setSelectedPayment(val || undefined)}
                                    searchable
                                />
                            </Stack>
                        </Card>

                        <Card p={20} withBorder radius={10} className={`!sticky !top-0 !overflow-visible`}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="ic:baseline-percent" className="text-primary-base text-[20px]" />
                                    <Text size="sm" className={`!text-primary-base`}>Diskon Tambahan</Text>
                                </Flex>

                                <NumberInput
                                    placeholder="Masukan Diskon Tambahan"
                                    prefix="Rp "
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    hideControls
                                />
                            </Stack>
                        </Card>

                        <Card p={20} withBorder radius={10} className={`!sticky !top-0 !overflow-visible`}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="material-symbols-light:order-approve-outline" className="text-primary-base text-[20px]" />
                                    <Text size="sm" className={`!text-primary-base`}>Ringkasan Pesanan</Text>
                                </Flex>

                                <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                                    <Text>Total</Text>
                                    <Text><NumberFormatter value={0} /></Text>
                                </Flex>
                            </Stack>
                        </Card>

                    </Stack>
                </Flex>
            </Stack>

            <Card pos="fixed" className={`!bottom-0 !left-0 !right-0 !z-10 !border-t !border-[#d0d0d0]`} radius={0} py={15} px={30} style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
                <Flex justify="space-between" align="center" pl={{ base: 0, md: 90 }}>
                    <Stack gap={0}>
                        <Text size="sm" c="gray" fw={600}>Total Pembayaran</Text>
                        <Text size="xl" fw={800} c="blue"><NumberFormatter value={0} prefix="Rp " thousandSeparator="." decimalSeparator="," /></Text>
                    </Stack>
                    <Button
                        color="#194e9e"
                        rightSection={<Icon icon="uiw:check" />}
                        radius="xl"
                        size="md"
                    >
                        Pesan Sekarang
                    </Button>
                </Flex>
            </Card>
        </>
    );
}