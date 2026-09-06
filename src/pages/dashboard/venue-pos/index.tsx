import { VenueProps } from "@/utils/globalInterface";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Accordion, ActionIcon, Alert, Box, Button, Card, Center, Divider, Flex, Grid, Group, Image, Modal, NumberFormatter, NumberInput, Select, Skeleton, Stack, Text, TextInput, Title, UnstyledButton } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import { VenueListResponse } from "../venue/type";
import { useListState, useSetState } from "@mantine/hooks";
import fetch from "@/utils/fetch";
import useLoggedUser from "@/utils/useLoggedUser";
import moment from "moment";
import { modals } from "@mantine/modals";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

type DateList = {
    date?: string;
    start_time?: string;
    end_time?: string;
};

export default function VenuePos() {
    const router = useRouter();
    const { t } = useTranslation();
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
<Flex align="center" gap={12}>
<button
type="button"
onClick={() => router.push('/dashboard/venue')}
className="w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
>
<Icon icon="ph:arrow-left-bold" />
</button>
<Stack gap={0}>
<Title size="h2" mb={4}>{t('venue.pos.title')}</Title>
<Text size="sm" c="gray">{t('venue.pos.subtitle')}</Text>
</Stack>
</Flex>
</Stack>

                <Divider my="sm" />

                <Flex className={`[&>*]:!flex-grow`} gap={20}>
                    <Stack>
                        <Card withBorder radius="xl" p={25}>
                            <Stack>
                                {loading.includes('getdata') ? (
                                    <>
                                        <Skeleton height={20} width="40%" radius="sm" />
                                        <Skeleton height={42} radius="xl" />
                                        <Skeleton height={80} radius="xl" />
                                    </>
                                ) : (
                                <>
                                <Flex align="center" gap={10}>
                                    <Icon icon="tabler:building" className="text-primary-base" />
                                    <Text size="sm" className={`!text-primary-base`}>{t('venue.info')}</Text>
                                </Flex>

                                <Select
                                    placeholder={t('venue.pos.selectVenue')}
                                    data={venue.map(v => ({ value: String(v.id), label: v.name }))}
                                    value={selectedVenue ? String(selectedVenue.id) : null}
                                    onChange={(val) => setSelectedVenue(venue.find(v => String(v.id) === val))}
                                    searchable
                                />

                                {selectedVenue && (
                                    <Card withBorder radius="xl" p="sm">
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
                                </>
                                )}
                            </Stack>
                        </Card>

                        <Card withBorder radius="xl" p={30} shadow="sm">
                            <Stack gap="xl">
                                <Flex align="center" gap={12}>
                                    <Box className="p-2.5 rounded-xl bg-primary-base/10 text-primary-base">
                                        <Icon icon="uil:calendar" width={24} />
                                    </Box>
                                    <Stack gap={0}>
                                        <Text size="lg" fw={700} className="!text-gray-800">{t('venue.pos.bookingDate')}</Text>
                                        <Text size="xs" c="dimmed">{t('venue.pos.bookingDateDesc')}</Text>
                                    </Stack>
                                </Flex>

                                <Stack gap="lg">
                                    <DatePickerInput
                                        minDate={new Date()}
                                        label={t('venue.pos.selectDate')}
                                        placeholder={t('venue.pos.selectDatePlaceholder')}
                                        leftSection={<Icon icon="solar:calendar-date-bold-duotone" className="text-primary-base" width={18} />}
                                        value={dummyDate.date ? new Date(dummyDate.date) : undefined}
                                        onChange={e => setDummyDate({ ...dummyDate, date: e ? moment(e).format('YYYY-MM-DD') : undefined })}
                                        size="md"
                                        radius="xl"
                                    />

                                    <Box className="p-4 rounded-2xl bg-gray-50 border border-light-grey">
                                        <Text size="xs" fw={700} mb={10} c="gray.6" className="uppercase tracking-wider">{t('venue.pos.bookingDuration')}</Text>
                                        <Grid align="center" gutter="sm">
                                            <Grid.Col span={5}>
                                                <Select
                                                    label={t('venue.pos.startTime')}
                                                    placeholder={t('venue.pos.selectTime')}
                                                    leftSection={<Icon icon="solar:clock-circle-bold-duotone" className="text-green-500" width={18} />}
                                                    data={Array.from({ length: 48 }).map((_, i) => {
                                                        const hour = Math.floor(i / 2);
                                                        const minute = i % 2 === 0 ? '00' : '30';
                                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                                        return { value: time, label: time };
                                                    })}
                                                    value={dummyDate.start_time || null}
                                                    onChange={val => setDummyDate({ ...dummyDate, start_time: val || undefined })}
                                                    size="md"
                                                    radius="xl"
                                                    searchable
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={2}>
                                                <Center pt={25}>
                                                    <Icon icon="solar:arrow-right-linear" className="text-gray-400" width={20} />
                                                </Center>
                                            </Grid.Col>
                                            <Grid.Col span={5}>
                                                <Select
                                                    label={t('venue.pos.endTime')}
                                                    placeholder={t('venue.pos.selectTime')}
                                                    leftSection={<Icon icon="solar:clock-circle-bold-duotone" className="text-red-500" width={18} />}
                                                    data={Array.from({ length: 48 }).map((_, i) => {
                                                        const hour = Math.floor(i / 2);
                                                        const minute = i % 2 === 0 ? '00' : '30';
                                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                                        return { value: time, label: time };
                                                    })}
                                                    value={dummyDate.end_time || null}
                                                    onChange={val => setDummyDate({ ...dummyDate, end_time: val || undefined })}
                                                    size="md"
                                                    radius="xl"
                                                    searchable
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    </Box>

                                    <Flex justify="flex-end">
                                        <Button
                                            onClick={() => {
                                                setDate.append(dummyDate);
                                                setDummyDate({ date: undefined, start_time: undefined, end_time: undefined });
                                            }}
                                            disabled={!dummyDate.date || !dummyDate.end_time || !dummyDate.start_time}
                                            variant="filled"
                                            color="blue"
                                            size="lg"
                                            radius="xl"
                                            leftSection={<Icon icon="solar:add-circle-bold-duotone" width={22} />}
                                            className="shadow-md hover:shadow-lg transition-all"
                                        >
                                            {t('venue.pos.addToSchedule')}
                                        </Button>
                                    </Flex>
                                </Stack>

                                {date.length > 0 && (
                                    <Stack gap="md" mt="xs">
                                        <Divider label={<Text size="xs" fw={700} c="dimmed">{t('venue.pos.selectedSchedule')}</Text>} labelPosition="center" />
                                        <Grid gutter="md">
                                            {date.map((e, i) => (
                                                <Grid.Col span={{ base: 12, md: 12 }} key={i}>
                                                    <Card p="md" withBorder radius="xl" className="!bg-white hover:!border-primary-base transition-colors shadow-sm">
                                                        <Flex justify="space-between" align="center">
                                                            <Group gap="md">
                                                                <Box className="p-3 rounded-2xl bg-primary-base/5 text-primary-base border border-primary-base/10">
                                                                    <Icon icon="solar:calendar-minimalistic-bold-duotone" width={24} />
                                                                </Box>
                                                                <Stack gap={2}>
                                                                    <Text fw={700} size="md" className="text-gray-800">{moment(e.date).format('DD MMMM YYYY')}</Text>
                                                                    <Group gap={6}>
                                                                        <Icon icon="solar:clock-circle-linear" width={14} className="text-gray-400" />
                                                                        <Text size="sm" fw={600} className="text-primary-base">{e.start_time} — {e.end_time}</Text>
                                                                    </Group>
                                                                </Stack>
                                                            </Group>
                                                            <ActionIcon
                                                                color="red"
                                                                variant="light"
                                                                radius="xl"
                                                                size="lg"
                                                                onClick={() => setDate.remove(i)}
                                                            >
                                                                <Icon icon="solar:trash-bin-trash-bold-duotone" width={20} />
                                                            </ActionIcon>
                                                        </Flex>
                                                    </Card>
                                                </Grid.Col>
                                            ))}
                                        </Grid>
                                    </Stack>
                                )}
                            </Stack>
                        </Card>

                        <Accordion variant="separated" radius="xl" defaultValue="data-pemesan">
                            <Accordion.Item value="data-pemesan" className="!border !border-[#dee2e6]">
                                <Accordion.Control icon={<Icon icon="ep:user" className="text-primary-base text-lg" />}>
                                    <Text size="sm" fw={600} className={`!text-primary-base`}>{t('venue.pos.bookerData')}</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Stack gap="md" pt="xs">
                                        <TextInput
                                            required
                                            label={t('venue.pos.bookerName')}
                                            placeholder={t('venue.pos.enterBookerName')}
                                        />
                                        <TextInput
                                            required
                                            label={t('venue.pos.bookerEmail')}
                                            placeholder={t('venue.pos.enterBookerEmail')}
                                        />
                                        <TextInput
                                            required
                                            label={t('venue.pos.bookerPhone')}
                                            placeholder={t('venue.pos.enterBookerPhone')}
                                        />
                                    </Stack>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Stack>

                    <Stack maw={300}>
                        <Card p={20} withBorder radius="xl" className={`!sticky !top-0 !overflow-visible`}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="ep:money" className="text-primary-base text-[20px]" />
                                    <Text size="sm" className={`!text-primary-base`}>{t('venue.pos.paymentMethod')}</Text>
                                </Flex>

                                <Select
                                    placeholder={t('venue.pos.selectPaymentMethod')}
                                    data={[{ value: 'Cash', label: 'Cash' }]}
                                    value={selectedPayment}
                                    onChange={(val) => setSelectedPayment(val || undefined)}
                                    searchable
                                />
                            </Stack>
                        </Card>

                        <Card p={20} withBorder radius="xl" className={`!sticky !top-0 !overflow-visible`}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="ic:baseline-percent" className="text-primary-base text-[20px]" />
                                    <Text size="sm" className={`!text-primary-base`}>{t('venue.pos.additionalDiscount')}</Text>
                                </Flex>

                                <NumberInput
                                    placeholder={t('venue.pos.enterAdditionalDiscount')}
                                    prefix="Rp "
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    hideControls
                                />
                            </Stack>
                        </Card>

                        <Card p={20} withBorder radius="xl" className={`!sticky !top-0 !overflow-visible`}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="material-symbols-light:order-approve-outline" className="text-primary-base text-[20px]" />
                                    <Text size="sm" className={`!text-primary-base`}>{t('venue.pos.orderSummary')}</Text>
                                </Flex>

                                <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                                    <Text>{t('venue.pos.total')}</Text>
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
                        <Text size="sm" c="gray" fw={600}>{t('venue.pos.totalPayment')}</Text>
                        <Text size="xl" fw={800} c="blue"><NumberFormatter value={0} prefix="Rp " thousandSeparator="." decimalSeparator="," /></Text>
                    </Stack>
                    <Button
                        color="#194e9e"
                        rightSection={<Icon icon="uiw:check" />}
                        radius="xl"
                        size="md"
                    >
                        {t('venue.pos.orderNow')}
                    </Button>
                </Flex>
            </Card>
        </>
    );
}