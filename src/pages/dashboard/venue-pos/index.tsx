import { VenueProps } from "@/utils/globalInterface";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ActionIcon, Alert, Button, Card, Center, Divider, Drawer, Flex, Image, InputWrapper, Modal, NumberFormatter, NumberInput, Stack, Text, TextInput, Title, UnstyledButton } from "@mantine/core";
import { DatePicker, DatePickerInput, DateTimePicker, TimeInput } from "@mantine/dates";
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

    const getData = async () => {
        await fetch<any, VenueListResponse[]>({
            url: 'venue',
            method: 'GET',
            success: ({ data }) => data && setVenue.setState(data.filter(e => e.creator_id == user?.has_creator?.id)),
            before: () => setLoading.append('getdata'),
            complete: () => setLoading.filter(e => e != 'getdata'),
        });
    }

    return (
        <>
            <Drawer
                title="Pilih Venue"
                position="bottom"
                classNames={{ 
                    'body': `!max-w-[600px]`,
                    'content': `!max-w-[500px] !mx-auto !rounded-[15px_15px_0_0]`,
                }}
                w={200}
                opened={open == 'venue'}
                onClose={() => setOpen(undefined)}>
                    <Stack gap={10}>
                        {venue.length == 0 ? (
                            <Alert variant="light" color="gray" icon={<Icon icon="uiw:information-o" />} radius={8}>
                                Tidak ada venue yang tersedia
                            </Alert>
                        ) : venue.map((e, i) => (
                            <UnstyledButton key={i} onClick={() => {
                                setSelectedVenue(e);
                                setOpen(undefined);
                            }}>
                                <Card withBorder radius={10}>
                                    <Flex gap={10}>
                                        {e.venue_gallery[0] ? <Image src={e.venue_gallery[0].image_url} w={64} radius={8} /> : (
                                            <Card w={64} h={64} radius={8} bg="gray.1"></Card>
                                        )}

                                        <Stack gap={0}>
                                            <Text>{e.name}</Text>
                                            <Text c="gray" size="sm"><NumberFormatter value={parseInt(String(e.starting_price))} /></Text>
                                        </Stack>
                                    </Flex>
                                </Card>
                            </UnstyledButton>
                        ))}
                    </Stack>
            </Drawer>

            <Modal
                title="Tambah Booking"
                centered
                opened={open == 'date'}
                onClose={() => setOpen(undefined)}>
                <Stack>
                    <DatePickerInput
                        minDate={new Date()}
                        label="Tanggal"
                        placeholder="Pilih Tanggal"
                        value={dummyDate.date ? new Date(dummyDate.date) : undefined}
                        onChange={e => setDummyDate({ date: e ? moment(e).format('YYYY-MM-DD') : undefined })}
                    />
                    <Flex className={`[&>*]:flex-grow`} gap={15}>
                        <TimeInput
                            label="Jam Awal"
                            placeholder="Pilih Jam Awal"
                            value={dummyDate.start_time}
                            onChange={e => setDummyDate({ start_time: e.target.value })}
                        />
                        <TimeInput
                            label="Jam Selesai"
                            placeholder="Pilih Jam Selesai"
                            value={dummyDate.end_time}
                            onChange={e => setDummyDate({ end_time: e.target.value })}
                        />
                    </Flex>
                    <Button
                        onClick={() => {
                            setDate.append(dummyDate);
                            setOpen(undefined);
                        }}
                        disabled={!dummyDate.date || !dummyDate.end_time || !dummyDate.start_time}
                        rightSection={<Icon icon="uiw:plus" />}>
                        Tambah Booking
                    </Button>
                </Stack>
            </Modal>

            <Card maw={900} p={30}>
                <Stack gap={0}>
                    <Title size="h2">Booking Venue</Title>
                    <Text size="sm" c="gray">Buat Booking Venue secara offline</Text>
                </Stack>

                <Divider my={30} />

                <Flex className={`[&>*]:!flex-grow`} gap={20}>
                    <Stack>
                        <UnstyledButton display={!selectedVenue ? undefined : 'none'} onClick={() => setOpen('venue')} w="100%">
                            <Card bg="gray.1" h={100} radius={10}className={`hover:shadow-inner`}>
                                <Center h="100%">
                                    <Flex align="center" gap={10} c="gray.6">
                                        <Icon icon="tabler:building" className={`text-[24px]`} />
                                        <Text size="1.2rem" fw={600}>Pilih Venue</Text>
                                    </Flex>
                                </Center>
                            </Card>
                        </UnstyledButton>

                        <UnstyledButton display={!!selectedVenue ? undefined : 'none'} onClick={() => setOpen('venue')} w="100%">
                            <Card bg="gray.1" h={100} radius={10}className={`hover:shadow-inner`}>
                                    <Flex gap={10}>
                                    {selectedVenue?.venue_gallery[0] ? <Image src={selectedVenue?.venue_gallery[0].image_url} w={64} radius={8} /> : (
                                        <Card w={64} h={64} radius={8} bg="gray.1"></Card>
                                    )}

                                    <Stack gap={0}>
                                        <Text>{selectedVenue?.name}</Text>
                                        <Text c="gray" size="sm"><NumberFormatter value={parseInt(String(selectedVenue?.starting_price))} /></Text>
                                    </Stack>
                                </Flex>
                            </Card>
                        </UnstyledButton>

                        <Card withBorder radius={10} p={25}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="uil:calendar" className="text-primary-base" />
                                    <Text size="sm" className={`!text-primary-base`}>Tanggal Booking</Text>
                                </Flex>

                                {date.map((e, i) => (
                                    <Card withBorder radius={10}>
                                        <Flex justify="space-between" gap={10} wrap="wrap" align="center">
                                            <Flex gap={10} wrap="wrap" align="center">
                                                <Text>{moment(e.date).format('DD MMMM')}</Text>
                                                <Text c="gray" size="sm">{e.start_time} - {e.end_time}</Text>
                                            </Flex>
                                            <Flex align="center" gap={15}>
                                                <ActionIcon color="red" variant="transparent" onClick={() => setDate.remove(i)}>
                                                    <Icon icon="uiw:delete"/>
                                                </ActionIcon>
                                            </Flex>
                                        </Flex>
                                    </Card>
                                ))}

                                <Button onClick={() => setOpen('date')} variant="light" color="gray" leftSection={<Icon icon="uiw:plus" />}>
                                    Tambah Booking
                                </Button>
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

                                <Button onClick={() => setOpen('payment')} display={!selectedPayment ? undefined : 'none'} variant="light" color="gray" leftSection={<Icon icon="uiw:plus" />}>
                                    Pilih Metode Pembayaran
                                </Button>
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

                        <Button>
                            Pesan Sekarang
                        </Button>
                    </Stack>
                </Flex>
            </Card>
        </>
    );
}