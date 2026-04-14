import { Icon } from '@iconify/react/dist/iconify.js';
import { ActionIcon, Button, Card, Checkbox, Divider, Flex, Grid, InputWrapper, LoadingOverlay, MultiSelect, NumberInput, Select, Space, Stack, Tabs, Text, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import fetch from '@/utils/fetch';
import { Get } from '@/utils/REST';
import { useDidUpdate, useListState } from '@mantine/hooks';
import ImageInput from '@/components/ImageInput.tsx';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { notifications } from '@mantine/notifications';
import { VenueCategory, VenueFacility, VenueListResponse } from '../../venue/type';

export default function AdminCreateVenue() {
    const [loading, setLoading] = useListState<string>();
    const [category, setCategory] = useState<VenueCategory[]>();
    const [facility, setFacility] = useState<VenueFacility[]>();
    const [creators, setCreators] = useState<any[]>([]);
    const [venue, setVenue] = useState<Partial<VenueListResponse>>();
    const router = useRouter();
    const { id } = router.query;

    const form = useForm<any>({
        initialValues: {
            creator_id: "",
            operating_hours: [
                { day_of_week: 1, open_time: "08:00", close_time: "22:00", is_closed: false },
                { day_of_week: 2, open_time: "08:00", close_time: "22:00", is_closed: false },
                { day_of_week: 3, open_time: "08:00", close_time: "22:00", is_closed: false },
                { day_of_week: 4, open_time: "08:00", close_time: "22:00", is_closed: false },
                { day_of_week: 5, open_time: "08:00", close_time: "22:00", is_closed: false },
                { day_of_week: 6, open_time: "08:00", close_time: "22:00", is_closed: true },
                { day_of_week: 0, open_time: "08:00", close_time: "22:00", is_closed: true }
            ],
            schedule: {
                name: "Regular Schedule",
                description: "Schedule utama venue",
                start_date: "",
                end_date: "",
                status: "active"
            },
            areas: [],
            prices: [],
            blocked_dates: []
        },
        onValuesChange: (val) => {
            if (val.contact_person_phone) val.contact_person_phone = val.contact_person_phone.replaceAll(/\D/g, '');
            return val;
        }
    });

    const { getInputProps: inputProps } = form;

    useEffect(() => {
        getData();
        fetchCreators();
    }, [id]);

    useDidUpdate(() => {
        if (venue) {
            form.setValues({
                ...venue,
                creator_id: String(venue.creator_id || ""),
                venue_category_id: venue.has_venue_category?.id,
                minimum_price: Boolean(venue.minimum_price) && venue.minimum_price != null ? Math.round(venue.minimum_price) : 0,
                image: venue?.venue_gallery?.map(e => e.image_url) || [],
                starting_price: Math.round(venue?.starting_price ?? 0),
                per_hour_price: Math.round(venue?.per_hour_price ?? 0),
            });
        }
    }, [venue, category, facility]);

    const getData = async () => {
        await fetch<any, VenueCategory[]>({
            url: 'venue-category',
            method: 'GET',
            success: ({ data }) => data && setCategory(data),
            before: () => setLoading.append('getdatacat'),
            complete: () => setLoading.filter(e => e != 'getdatacat'),
        });
        await fetch<any, VenueFacility[]>({
            url: 'venue-facility',
            method: 'GET',
            success: ({ data }) => data && setFacility(data),
            before: () => setLoading.append('getdatacat'),
            complete: () => setLoading.filter(e => e != 'getdatacat'),
        });
        await getVenueData();
    }

    const fetchCreators = async () => {
        try {
            const res: any = await Get("creator", {});
            if (res.data) {
                setCreators(Array.isArray(res.data) ? res.data : (res.data.data || []));
            }
        } catch (error) {
            console.error("Gagal mengambil data creator", error);
        }
    };

    const getVenueData = async () => {
        if (id) {
            await fetch<any, VenueListResponse>({
                url: 'venue/' + id,
                method: 'GET',
                before: () => setLoading.append('getdatavenue'),
                success: (data) => {
                    if (data) {
                        setVenue({
                            ...data.data,
                            venue_facility_id: data?.data?.venue_facility_id?.map(e => parseInt(String(e))) ?? [],
                        });
                    }
                },
                complete: () => setLoading.filter(e => e != 'getdatavenue'),
            });
        }
    }

    const submitData = async () => {
        const valid = form.validate();
        if (valid.hasErrors) {
            console.log(form.errors);
            return;
        }

        const payload: any = {
            ...form.values,
            venue_capacity_id: 0,
            venue_schedule_id: 0,
            opening_hour: '2024-07-02T09:00:00',
            status: form.values.status || "active",
            admin_override: true,
            operating_hours: form.values.operating_hours?.map((h: any) => ({
                day_of_week: h.day_of_week,
                ...(h.is_closed ? { is_closed: 1 } : { open_time: h.open_time?.length === 5 ? h.open_time + ":00" : h.open_time, close_time: h.close_time?.length === 5 ? h.close_time + ":00" : h.close_time })
            })) || [],
            schedule: form.values.schedule,
            areas: form.values.areas || [],
            prices: form.values.prices?.map((p: any) => ({
                ...p,
                start_time: p.start_time?.length === 5 ? p.start_time + ":00" : p.start_time,
                end_time: p.end_time?.length === 5 ? p.end_time + ":00" : p.end_time,
            })) || [],
            blocked_dates: form.values.blocked_dates || []
        };

        if (id) {
            payload._method = 'PUT';
        }

        await fetch<any, any>({
            url: id ? 'venue/' + id : 'venue',
            method: 'POST',
            data: payload,
            before: () => setLoading.append('submitdata'),
            success: () => {
                notifications.show({
                    title: 'Berhasil',
                    message: `Venue berhasil ${id ? 'diperbarui' : 'dibuat'}`,
                    color: 'green',
                });
                router.push('/dashboard/admin/venue');
            },
            complete: () => setLoading.filter(e => e != 'submitdata'),
            invalid: form.setErrors,
        });
    }

    return (
        <Stack className={`p-[20px] md:p-[30px]`} gap={30}>
            <LoadingOverlay visible={loading.includes('getdatavenue') || loading.includes('submitdata')} />
            <Flex gap={10} justify="space-between" align="center">
                <Stack gap={5}>
                    <Text size="1.8rem" fw={600}>
                        {id ? 'Edit Venue (Admin)' : 'Buat Venue Baru (Admin)'}
                    </Text>
                    <Text size="sm" c="gray">
                        Lengkapi form untuk {id ? 'memperbarui' : 'membuat'} venue baru sebagai administrator
                    </Text>
                </Stack>
            </Flex>

            <Divider />

            <Stack gap={20} w="100%">
                <Flex gap={10} align="center">
                    <Icon icon="ph:user-circle-bold" className={`text-[20px] text-primary-base`} />
                    <Text size="lg" fw={600}>Penyelenggara (Creator)</Text>
                </Flex>

                <Select
                    withAsterisk
                    label="Pilih Creator"
                    placeholder="Cari & Pilih Creator"
                    data={creators.map(c => ({ value: String(c.id), label: c.name || c.has_user?.name || `ID: ${c.id}` }))}
                    searchable
                    {...inputProps('creator_id')}
                    onChange={v => form.setValues({ creator_id: v })}
                />

                <Divider my="sm" />

                <Flex gap={10} align="center">
                    <Icon icon="ph:info-bold" className={`text-[20px] text-primary-base`} />
                    <Text size="lg" fw={600}>Informasi Venue</Text>
                </Flex>

                <InputWrapper error={form.errors.image} label="Gambar Venue" description="Direkomendasikan 1280px X 400px" withAsterisk>
                    <Flex wrap="wrap" gap={10} pt={5}>
                        {Array(5).fill(null).map((e, i) => (
                            <ImageInput
                                dimension={[200, 100]}
                                value={form.values.image && form.values.image[i] ? form.values.image[i] : undefined}
                                onChange={(e: any) => {
                                    const currentImages = [...(form.values.image || [])];
                                    if (currentImages[i]) {
                                        currentImages[i] = e;
                                    } else {
                                        currentImages.push(e);
                                    }
                                    form.setValues({ image: currentImages });
                                }}
                                onDelete={() => {
                                    const currentImages = (form.values.image || []).filter((_: any, x: number) => x != i);
                                    form.setValues({ image: currentImages });
                                }}
                                key={i}
                            />
                        ))}
                    </Flex>
                </InputWrapper>

                <Flex gap={15}>
                    <TextInput
                        withAsterisk
                        label="Nama Venue"
                        placeholder="Isi Nama Venue"
                        w="100%"
                        {...inputProps('name')}
                    />
                    <Select
                        withAsterisk
                        label="Kategori Venue"
                        placeholder="Pilih Kategori Venue"
                        disabled={loading.includes('getdatacat')}
                        data={category?.map(e => ({ value: String(e.id), label: e.name }))}
                        miw={250}
                        {...inputProps('venue_category_id')}
                        onChange={e => e && form.setValues({ venue_category_id: parseInt(e) })}
                    />
                </Flex>

                <Textarea
                    withAsterisk
                    label="Deskripsi Venue"
                    placeholder="Isi Deskripsi Venue"
                    autosize
                    minRows={3}
                    {...inputProps('description')}
                />

                <Tabs defaultValue="detail" mt={10}>
                    <Tabs.List>
                        <Tabs.Tab value="detail" leftSection={<Icon icon="ph:gear" />}>Detail Venue</Tabs.Tab>
                        <Tabs.Tab value="fasilitas" leftSection={<Icon icon="ph:app-store-logo" />}>Fasilitas Venue</Tabs.Tab>
                        <Tabs.Tab value="jadwal" leftSection={<Icon icon="ph:calendar" />}>Jadwal & Waktu</Tabs.Tab>
                        <Tabs.Tab value="area" leftSection={<Icon icon="ph:layout" />}>Area & Harga Tambahan</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="detail" pt="xl">
                        <Stack gap={15}>
                            <Flex gap={15} wrap="wrap" className={`[&>*]:!flex-grow`}>
                                <NumberInput
                                    withAsterisk
                                    label="Maksimal Kapasitas"
                                    placeholder="Masukan Maksimal Kapasitas"
                                    hideControls
                                    min={0}
                                    {...inputProps('max_capacity')}
                                />
                                <NumberInput
                                    withAsterisk
                                    label="Jumlah Kursi"
                                    placeholder="Masukan Jumlah Kursi"
                                    hideControls
                                    min={0}
                                    {...inputProps('seat_capacity')}
                                />
                            </Flex>

                            <Flex gap={15} wrap="wrap" className={`[&>*]:!flex-grow`}>
                                <Flex gap={10} align="center" className={`[&>*]:!flex-grow`}>
                                    <NumberInput
                                        withAsterisk
                                        label="Harga Per Hari"
                                        placeholder="Masukan Harga Per Hari"
                                        hideControls
                                        prefix="Rp "
                                        min={0}
                                        {...inputProps('starting_price')}
                                    />
                                    <NumberInput
                                        withAsterisk
                                        label="Harga Per Jam"
                                        placeholder="Masukan Harga Per Jam"
                                        hideControls
                                        prefix="Rp "
                                        min={0}
                                        {...inputProps('per_hour_price')}
                                    />
                                </Flex>
                                <NumberInput
                                    label="Down Payment (DP)"
                                    placeholder="Masukan Down Payment"
                                    hideControls
                                    prefix="Rp "
                                    min={0}
                                    w="100%"
                                    {...inputProps('minimum_price')}
                                />
                            </Flex>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="fasilitas" pt="xl">
                        <Stack gap={15}>
                            <MultiSelect
                                withAsterisk
                                label="Pilih Fasilitas Venue"
                                placeholder="Cari & Pilih Fasilitas"
                                data={facility?.map(e => ({ value: String(e.id), label: e.facility_name ?? '' })).filter(e => e.label) ?? []}
                                value={(form.values.venue_facility_id ?? []).map(String)}
                                onChange={vals => form.setValues({ venue_facility_id: vals.map(Number) })}
                                disabled={loading.includes('getdatacat')}
                                searchable
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="jadwal" pt="xl">
                        <Stack gap={20}>
                            <Text fw={600} size="lg">Pengaturan Jadwal (Schedule)</Text>
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <TextInput label="Nama Jadwal" withAsterisk placeholder="Regular Schedule" {...inputProps('schedule.name')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <Select label="Status Jadwal" data={[{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Inaktif' }]} {...inputProps('schedule.status')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <TextInput type="date" label="Tanggal Mulai" withAsterisk {...inputProps('schedule.start_date')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <TextInput type="date" label="Tanggal Selesai" withAsterisk {...inputProps('schedule.end_date')} />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea label="Deskripsi Jadwal" placeholder="Isi deskripsi jadwal" autosize minRows={2} {...inputProps('schedule.description')} />
                                </Grid.Col>
                            </Grid>

                            <Divider my="sm" />

                            <Text fw={600} size="lg">Jam Operasional</Text>
                            <Stack gap={10}>
                                {form.values.operating_hours?.map((item: any, index: number) => {
                                    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                                    const dayName = days[item.day_of_week];
                                    return (
                                        <Card key={index} withBorder p="sm" radius="md">
                                            <Flex align="center" justify="space-between" wrap="wrap" gap={15}>
                                                <Checkbox
                                                    label={<Text fw={600}>{dayName}</Text>}
                                                    checked={!item.is_closed}
                                                    onChange={(e) => form.setFieldValue(`operating_hours.${index}.is_closed`, !e.currentTarget.checked)}
                                                />
                                                <Flex gap={10} align="center" className={`[&>*]:!flex-grow`} flex={1} style={{ opacity: item.is_closed ? 0.5 : 1, pointerEvents: item.is_closed ? 'none' : 'auto' }}>
                                                    <TextInput type="time" label="Jam Buka" {...inputProps(`operating_hours.${index}.open_time`)} w="100%" />
                                                    <TextInput type="time" label="Jam Tutup" {...inputProps(`operating_hours.${index}.close_time`)} w="100%" />
                                                </Flex>
                                            </Flex>
                                        </Card>
                                    );
                                })}
                            </Stack>

                            <Divider my="sm" />

                            <Flex justify="space-between" align="center">
                                <Text fw={600} size="lg">Tanggal Diblokir (Blocked Dates)</Text>
                                <Button size="xs" variant="light" leftSection={<Icon icon="ph:plus" />} onClick={() => form.insertListItem('blocked_dates', { start_date: '', end_date: '', reason: '' })}>
                                    Tambah Tanggal Blokir
                                </Button>
                            </Flex>
                            <Stack gap={10}>
                                {form.values.blocked_dates?.map((item: any, index: number) => (
                                    <Card key={index} withBorder p="sm" radius="md">
                                        <Flex gap={15} align="flex-end" wrap="wrap">
                                            <TextInput type="date" label="Tanggal Mulai" required {...inputProps(`blocked_dates.${index}.start_date`)} w={{ base: '100%', md: '25%' }} />
                                            <TextInput type="date" label="Tanggal Selesai" required {...inputProps(`blocked_dates.${index}.end_date`)} w={{ base: '100%', md: '25%' }} />
                                            <TextInput label="Alasan" placeholder="Contoh: Maintenance" required {...inputProps(`blocked_dates.${index}.reason`)} flex={1} />
                                            <ActionIcon color="red" variant="light" onClick={() => form.removeListItem('blocked_dates', index)} size="lg" mb={5}>
                                                <Icon icon="ph:trash" />
                                            </ActionIcon>
                                        </Flex>
                                    </Card>
                                ))}
                            </Stack>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="area" pt="xl">
                        <Stack gap={20}>
                            <Flex justify="space-between" align="center">
                                <Text fw={600} size="lg">Area Venue</Text>
                                <Button size="xs" variant="light" leftSection={<Icon icon="ph:plus" />} onClick={() => form.insertListItem('areas', { name: '', capacity: 0, base_price: 0 })}>
                                    Tambah Area
                                </Button>
                            </Flex>
                            <Stack gap={10}>
                                {form.values.areas?.map((item: any, index: number) => (
                                    <Card key={index} withBorder p="sm" radius="md">
                                        <Flex gap={15} align="flex-end" wrap="wrap">
                                            <TextInput label="Nama Area" placeholder="Contoh: Main Hall" required {...inputProps(`areas.${index}.name`)} flex={1} />
                                            <NumberInput label="Kapasitas" required min={0} hideControls {...inputProps(`areas.${index}.capacity`)} w={{ base: '100%', md: '20%' }} />
                                            <NumberInput label="Harga Dasar" prefix="Rp " required min={0} hideControls {...inputProps(`areas.${index}.base_price`)} w={{ base: '100%', md: '30%' }} />
                                            <ActionIcon color="red" variant="light" onClick={() => form.removeListItem('areas', index)} size="lg" mb={5}>
                                                <Icon icon="ph:trash" />
                                            </ActionIcon>
                                        </Flex>
                                    </Card>
                                ))}
                            </Stack>

                            <Divider my="sm" />

                            <Flex justify="space-between" align="center">
                                <Text fw={600} size="lg">Harga Kustom (Prices)</Text>
                                <Button size="xs" variant="light" leftSection={<Icon icon="ph:plus" />} onClick={() => form.insertListItem('prices', { pricing_type: 'hourly', day_type: 'weekday', start_time: '08:00', end_time: '17:00', price: 0 })}>
                                    Tambah Harga Kustom
                                </Button>
                            </Flex>
                            <Stack gap={10}>
                                {form.values.prices?.map((item: any, index: number) => (
                                    <Card key={index} withBorder p="sm" radius="md">
                                        <Grid align="flex-end">
                                            <Grid.Col span={{ base: 12, md: 2 }}>
                                                <Select label="Tipe Harga" data={[{ value: 'hourly', label: 'Per Jam' }, { value: 'daily', label: 'Per Hari' }]} {...inputProps(`prices.${index}.pricing_type`)} />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 2 }}>
                                                <Select label="Tipe Hari" data={[{ value: 'weekday', label: 'Weekday' }, { value: 'weekend', label: 'Weekend' }]} {...inputProps(`prices.${index}.day_type`)} />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 2 }}>
                                                <TextInput type="time" label="Waktu Mulai" {...inputProps(`prices.${index}.start_time`)} />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 2 }}>
                                                <TextInput type="time" label="Waktu Selesai" {...inputProps(`prices.${index}.end_time`)} />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 3 }}>
                                                <NumberInput label="Harga" prefix="Rp " required min={0} hideControls {...inputProps(`prices.${index}.price`)} />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 1 }}>
                                                <ActionIcon color="red" variant="light" onClick={() => form.removeListItem('prices', index)} size="lg" mb={5}>
                                                    <Icon icon="ph:trash" />
                                                </ActionIcon>
                                            </Grid.Col>
                                        </Grid>
                                    </Card>
                                ))}
                            </Stack>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>

                <Flex gap={10} align="center" mt={10}>
                    <Icon icon="ph:map-pin-bold" className={`text-[20px] text-primary-base`} />
                    <Text size="lg" fw={600}>Alamat Venue</Text>
                </Flex>

                <Flex gap={15}>
                    <TextInput
                        withAsterisk
                        label="Daerah"
                        placeholder="Bandung, Jawa Barat"
                        w="100%"
                        {...inputProps('location_name')}
                    />
                    <TextInput
                        withAsterisk
                        label="Link Maps"
                        placeholder="https://maps.google.com/..."
                        w="100%"
                        {...inputProps('location')}
                    />
                </Flex>

                <Textarea
                    withAsterisk
                    label="Alamat Detail Venue"
                    placeholder="Isi Detail Alamat Venue"
                    autosize
                    minRows={3}
                    {...inputProps('location_detail')}
                />

                <Flex gap={10} align="center" mt={10}>
                    <Icon icon="ph:phone-bold" className={`text-[20px] text-primary-base`} />
                    <Text size="lg" fw={600}>Contact Person</Text>
                </Flex>

                <Flex gap={15}>
                    <TextInput
                        withAsterisk
                        label="Nama Kontak"
                        placeholder="Isi Nama Kontak"
                        w="100%"
                        {...inputProps('contact_person_name')}
                    />
                    <TextInput
                        withAsterisk
                        label="Email Kontak"
                        placeholder="Isi Email Kontak"
                        w="100%"
                        {...inputProps('contact_person_email')}
                    />
                </Flex>

                <TextInput
                    withAsterisk
                    label="No.Telp Kontak"
                    placeholder="Isi No.Telp Kontak"
                    w="100%"
                    {...inputProps('contact_person_phone')}
                />

                <Space h={50} />
            </Stack>

            <Card pos="fixed" className={`!bottom-0 !left-0 !right-0 !z-10 !border-t !border-[#d0d0d0]`} radius={0} py={15} px={30} style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
                <Flex ml="auto" w="fit-content" gap={10}>
                    <Button
                        variant="default"
                        onClick={() => router.back()}
                        radius="xl"
                        leftSection={<Icon icon="ph:x" />}
                    >
                        Batal
                    </Button>
                    <Button
                        loading={loading.includes('submitdata')}
                        onClick={submitData}
                        w="fit-content"
                        color="blue"
                        rightSection={<Icon icon="ph:check" />}
                        radius="xl">
                        Simpan Venue
                    </Button>
                </Flex>
            </Card>
        </Stack>
    );
}
