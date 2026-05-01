import { Icon } from '@iconify/react/dist/iconify.js';
import { ActionIcon, Button, Card, Checkbox, Divider, Flex, Grid, InputWrapper, LoadingOverlay, Modal, MultiSelect, NumberInput, Select, Space, Stack, Tabs, Text, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState, useMemo } from 'react';
import { VenueCapacity, VenueCategory, VenueFacility, VenueListResponse, VenueStoreRequest } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { useDidUpdate, useDisclosure, useListState } from '@mantine/hooks';
import ImageInput from '@/components/ImageInput.tsx';
import { useForm, zodResolver } from '@mantine/form';
import { useRouter } from 'next/router';
import { z } from 'zod';


type ComponentProps = {};

export default function Create({ }: Readonly<ComponentProps>) {
    const [loading, setLoading] = useListState<string>();
    const [category, setCategory] = useState<VenueCategory[]>();
    const [facility, setFacility] = useState<VenueFacility[]>();
    const [venue, setVenue] = useState<Partial<VenueListResponse>>();
    const [venueFacilities, setVenueFacilities] = useState<any[]>();
    const [addFacilityOpened, { open: openAddFacility, close: closeAddFacility }] = useDisclosure(false);
    const [newFacilityName, setNewFacilityName] = useState('');
    const [newFacilityDesc, setNewFacilityDesc] = useState('');
    const [addFacilityLoading, setAddFacilityLoading] = useState(false);
    const user = useLoggedUser();
    const router = useRouter();
    const { id: slug } = router.query;

    // Memoize the data array so it has a stable reference across renders
    const memoizedFacilityData = useMemo(() => {
        return facility
            ?.filter(e => e.facility_name)
            .map(e => ({ value: String(e.facility_id), label: e.facility_name! })) ?? [];
    }, [facility]);

    const form = useForm<any>({
        initialValues: {
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
            blocked_dates: [],
            rules: [],
            faqs: []
        },

        onValuesChange: (val) => {
            if (val.contact_person_phone) val.contact_person_phone = val.contact_person_phone.replaceAll(/\D/g, '');
            return val;
        }
    });
    const { getInputProps: inputProps } = form;

    useEffect(() => {
        getData();
    }, [slug]);

    useDidUpdate(() => {
        if (venue) {
            form.setValues({
                ...venue,
                venue_category_id: venue.has_venue_category?.id,
                minimum_price: Boolean(venue.minimum_price) && venue.minimum_price != null ? Math.round(venue.minimum_price) : 0,
                image: venue?.venue_gallery?.map(e => e.image_url),
                starting_price: Math.round(venue?.starting_price ?? 0),
                per_hour_price: Math.round(venue?.per_hour_price ?? 0),
                rules: venue?.rules ?? [],
                faqs: venue?.faqs ?? [],
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
            success: ({ data }) => {
                if (data) {
                    // Filter nulls first, then deduplicate by facility_id
                    const validData = data.filter(f => f.facility_name);
                    const seen = new Set<number>();
                    const unique = validData.filter(f => {
                        if (seen.has(f.facility_id)) return false;
                        seen.add(f.facility_id);
                        return true;
                    });
                    setFacility(unique);
                }
            },
            before: () => setLoading.append('getdatacat'),
            complete: () => setLoading.filter(e => e != 'getdatacat'),
        });
        await getVenueData();
    }

    const getVenueData = async () => {
        if (slug) {
            await fetch<any, VenueListResponse>({
                url: 'creator-data/venue/' + slug,
                method: 'GET',
                before: () => setLoading.append('getdatavenue'),
                success: (data) => {
                    if (data) {
                        setVenue({
                            ...data.data,
                            venue_facility_id: data?.data?.venue_facility_id?.map(e => parseInt(String(e))) ?? [],
                        });
                        setVenueFacilities(data['dataFacilities']);
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
        };

        setLoading.append('submitdata');

        // Convert images to base64 format for JSON payload
        const processedImages = await Promise.all((form.values.image || []).map(async (file: any, index: number) => {
            if (file instanceof Blob || file instanceof File) {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            name: (file as File).name || `image_${index}.jpg`,
                            image: reader.result as string
                        });
                    };
                    reader.readAsDataURL(file);
                });
            } else if (typeof file === 'string') {
                return {
                    name: `existing_image_${index}`,
                    image: file // Send existing string URL or already base64 string
                };
            }
            return null;
        }));

        const payload: any = {
            ...form.values,
            venue_capacity_id: 0,
            venue_schedule_id: 0,
            opening_hour: '2024-07-02T09:00:00',
            status: "active",
            image: processedImages.filter(Boolean),
            operating_hours: form.values.operating_hours?.map((h: any) => ({
                day_of_week: h.day_of_week,
                ...(h.is_closed ? { is_closed: 1 } : { open_time: h.open_time?.length === 5 ? h.open_time + ":00" : h.open_time, close_time: h.close_time?.length === 5 ? h.close_time + ":00" : h.close_time })
            })) || [],
            schedule: form.values.schedule,
            areas: form.values.areas || [],
            prices: form.values.prices?.map((p: any) => ({
                ...p,
                venue_area_index: parseInt(String(p.venue_area_index)) || 0,
                start_time: p.start_time?.length === 5 ? p.start_time + ":00" : p.start_time,
                end_time: p.end_time?.length === 5 ? p.end_time + ":00" : p.end_time,
            })) || [],
            blocked_dates: form.values.blocked_dates || [],
            rules: form.values.rules || [],
            faqs: form.values.faqs || []
        };


        await fetch<any, any>({
            url: slug ? 'creator-data/venue/' + venue?.id : 'creator-data/venue',
            method: 'POST',
            data: payload,
            headers: {
                'Content-Type': 'application/json'
            },
            before: () => {}, // Handled manually at the top of submitData
            success: () => {
                router.push('/dashboard/venue')
            },
            complete: () => setLoading.filter(e => e != 'submitdata'),
            invalid: form.setErrors,
        });
    }

    return (
        <Stack className={`p-[20px] md:p-[30px]`} gap={30}>
            <LoadingOverlay visible={loading.includes('getdatavenue')} />
            <Flex gap={10} justify="space-between" align="center">
                <Stack gap={5}>
                    <Text size="1.8rem" fw={600}>
                        {slug ? 'Edit Venue' : 'Buat Venue Baru'}
                    </Text>
                    <Text size="sm" c="gray">
                        Lengkapi form untuk {slug ? 'memperbarui' : 'membuat'} venue baru
                    </Text>
                </Stack>

                {/* <Flex align="center" gap={10}>
                    <TextInput radius="xl" leftSection={<Icon icon="uiw:search" />} placeholder="Cari Nama Venue" />
                    <Button radius="xl" color="#194e9e" leftSection={<Icon icon="uiw:plus" />} component={Link} href="/dashboard/venue/create">
                        Tambah Venue
                    </Button>
                </Flex> */}
            </Flex>

            <Divider />

            <Stack gap={20} w="100%">
                <Flex gap={10} align="center">
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`} />
                    <Text size="lg" fw={600}>Informasi Venue</Text>
                </Flex>

                <InputWrapper error={form.errors.image} label="Gambar Venue" description="Direkomendasikan 1280px X 400px" withAsterisk>
                    <Flex wrap="wrap" gap={10} pt={5}>
                        {Array(5).fill(null).map((e, i) => (
                            <ImageInput
                                dimension={[200, 100]}
                                value={form.values.image && form.values.image[i] ? form.values.image[i] : undefined}
                                onChange={e => e && form.setValues({ image: [...(form.values.image ?? []), e] })}
                                onDelete={() => form.setValues({ image: (form.values.image ?? []).filter((_: any, x: number) => x != i) })}
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
                        <Tabs.Tab value="detail" leftSection={<Icon icon="uiw:setting-o" />}>Detail Venue</Tabs.Tab>
                        <Tabs.Tab value="fasilitas" leftSection={<Icon icon="uiw:appstore-o" />}>Fasilitas Venue</Tabs.Tab>
                        <Tabs.Tab value="jadwal" leftSection={<Icon icon="uiw:time" />}>Jadwal & Waktu</Tabs.Tab>
                        <Tabs.Tab value="area" leftSection={<Icon icon="uiw:appstore" />}>Area & Harga Tambahan</Tabs.Tab>
                        <Tabs.Tab value="blocked-dates" leftSection={<Icon icon="uiw:date" />}>Blocked Dates</Tabs.Tab>
                        <Tabs.Tab value="rules" leftSection={<Icon icon="uiw:file-text" />}>Aturan Venue</Tabs.Tab>
                        <Tabs.Tab value="faqs" leftSection={<Icon icon="uiw:comment" />}>FAQ</Tabs.Tab>
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
                                data={memoizedFacilityData}
                                value={(form.values.venue_facility_id ?? []).map(String)}
                                onChange={vals => form.setFieldValue('venue_facility_id', vals.map(Number))}
                                disabled={loading.includes('getdatacat')}
                                searchable
                            />

                            <Button
                                leftSection={<Icon icon="uiw:plus" />}
                                color="#194e9e"
                                variant="filled"
                                size="sm"
                                radius="xl"
                                w="fit-content"
                                onClick={openAddFacility}
                            >
                                Tambah Fasilitas
                            </Button>

                            {form.values.venue_facility_id && form.values.venue_facility_id.length > 0 && (
                                <Stack gap={10} mt={10}>
                                    <Text fw={600} size="sm">Informasi Fasilitas Terpilih:</Text>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {facility?.filter(f => form.values.venue_facility_id?.includes(f.facility_id)).map(f => (
                                            <Card key={f.facility_id} withBorder p="sm" radius="md">
                                                <Text fw={600} size="sm">{f.facility_name}</Text>
                                                <Text size="xs" c="gray" mt={2}>{f.facility_description || 'Tidak ada deskripsi tersedia.'}</Text>
                                            </Card>
                                        ))}
                                    </div>
                                </Stack>
                            )}
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

                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="blocked-dates" pt="xl">
                        <Stack gap={20}>
                            <Flex justify="space-between" align="center">
                                <Text fw={600} size="lg">Tanggal Diblokir (Blocked Dates)</Text>
                                <Button size="xs" variant="light" leftSection={<Icon icon="uiw:plus" />} onClick={() => form.insertListItem('blocked_dates', { start_date: '', end_date: '', reason: '' })}>
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
                                                <Icon icon="uiw:delete" />
                                            </ActionIcon>
                                        </Flex>
                                    </Card>
                                ))}
                                {form.values.blocked_dates?.length === 0 && (
                                    <Text size="sm" c="dimmed" ta="center">Belum ada tanggal yang diblokir.</Text>
                                )}
                            </Stack>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="area" pt="xl">
                        <Stack gap={20}>
                            <Flex justify="space-between" align="center">
                                <Text fw={600} size="lg">Area Venue</Text>
                                <Button size="xs" variant="light" leftSection={<Icon icon="uiw:plus" />} onClick={() => form.insertListItem('areas', { name: '', capacity: 0, base_price: 0 })}>
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
                                                <Icon icon="uiw:delete" />
                                            </ActionIcon>
                                        </Flex>
                                    </Card>
                                ))}
                                {form.values.areas?.length === 0 && (
                                    <Text size="sm" c="dimmed" ta="center">Belum ada area yang ditambahkan.</Text>
                                )}
                            </Stack>

                            <Divider my="sm" />

                            <Flex justify="space-between" align="center">
                                <Text fw={600} size="lg">Harga Kustom (Prices)</Text>
                                <Button size="xs" variant="light" leftSection={<Icon icon="uiw:plus" />} onClick={() => form.insertListItem('prices', { venue_area_index: '0', pricing_type: 'hourly', day_type: 'weekday', start_time: '08:00', end_time: '17:00', price: 0 })}>
                                    Tambah Harga Kustom
                                </Button>
                            </Flex>
                            <Stack gap={10}>
                                {form.values.prices?.map((item: any, index: number) => (
                                    <Card key={index} withBorder p="sm" radius="md">
                                        <Grid align="flex-end">
                                            <Grid.Col span={{ base: 12, md: 2 }}>
                                                <Select label="Pilih Area" data={form.values.areas?.map((a: any, i: number) => ({ value: String(i), label: a.name || `Area ${i+1}` })) || []} {...inputProps(`prices.${index}.venue_area_index`)} />
                                            </Grid.Col>
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
                                                    <Icon icon="uiw:delete" />
                                                </ActionIcon>
                                            </Grid.Col>
                                        </Grid>
                                    </Card>
                                ))}
                                {form.values.prices?.length === 0 && (
                                    <Text size="sm" c="dimmed" ta="center">Belum ada harga kustom yang ditambahkan.</Text>
                                )}
                            </Stack>
                        </Stack>
                    </Tabs.Panel>
 
                    <Tabs.Panel value="rules" pt="xl">
                        <Stack gap={20}>
                            <Flex justify="space-between" align="center">
                                <Text fw={600} size="lg">Aturan Venue (Rules)</Text>
                                <Button size="xs" variant="light" leftSection={<Icon icon="uiw:plus" />} onClick={() => form.insertListItem('rules', { title: '', description: '', sort_order: 0 })}>
                                    Tambah Aturan
                                </Button>
                            </Flex>
                            <Stack gap={10}>
                                {form.values.rules?.map((item: any, index: number) => (
                                    <Card key={index} withBorder p="sm" radius="md">
                                        <Flex gap={15} align="flex-end" wrap="wrap">
                                            <TextInput label="Judul Aturan" placeholder="Contoh: Dilarang Merokok" required {...inputProps(`rules.${index}.title`)} flex={1} />
                                            <TextInput label="Keterangan" placeholder="Isi detail aturan (opsional)" {...inputProps(`rules.${index}.description`)} flex={2} />
                                            <NumberInput label="Urutan" min={0} hideControls {...inputProps(`rules.${index}.sort_order`)} w={{ base: '100%', md: '10%' }} />
                                            <ActionIcon color="red" variant="light" onClick={() => form.removeListItem('rules', index)} size="lg" mb={5}>
                                                <Icon icon="uiw:delete" />
                                            </ActionIcon>
                                        </Flex>
                                    </Card>
                                ))}
                                {form.values.rules?.length === 0 && (
                                    <Text size="sm" c="dimmed" ta="center">Belum ada aturan yang ditambahkan.</Text>
                                )}
                            </Stack>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="faqs" pt="xl">
                        <Stack gap={20}>
                            <Flex justify="space-between" align="center">
                                <Text fw={600} size="lg">Pertanyaan Umum (FAQ)</Text>
                                <Button size="xs" variant="light" leftSection={<Icon icon="uiw:plus" />} onClick={() => form.insertListItem('faqs', { question: '', answer: '' })}>
                                    Tambah FAQ
                                </Button>
                            </Flex>
                            <Stack gap={10}>
                                {form.values.faqs?.map((item: any, index: number) => (
                                    <Card key={index} withBorder p="sm" radius="md">
                                        <Stack gap={10}>
                                            <Flex gap={15} align="flex-end">
                                                <TextInput label="Pertanyaan" placeholder="Contoh: Apakah ada parkir?" required {...inputProps(`faqs.${index}.question`)} flex={1} />
                                                <ActionIcon color="red" variant="light" onClick={() => form.removeListItem('faqs', index)} size="lg" mb={5}>
                                                    <Icon icon="uiw:delete" />
                                                </ActionIcon>
                                            </Flex>
                                            <Textarea label="Jawaban" placeholder="Isi jawaban dari pertanyaan" required autosize minRows={2} {...inputProps(`faqs.${index}.answer`)} />
                                        </Stack>
                                    </Card>
                                ))}
                                {form.values.faqs?.length === 0 && (
                                    <Text size="sm" c="dimmed" ta="center">Belum ada FAQ yang ditambahkan.</Text>
                                )}
                            </Stack>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>


                <Flex gap={10} align="center" mt={10}>
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`} />
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
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`} />
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
                        leftSection={<Icon icon="uiw:close" />}
                    >
                        Batal
                    </Button>
                    <Button
                        loading={loading.includes('submitdata')}
                        onClick={submitData}
                        w="fit-content"
                        color="#194e9e"
                        rightSection={<Icon icon="uiw:check" />}
                        radius="xl">
                        Simpan Venue
                    </Button>
                </Flex>
            </Card>

            {/* Modal Tambah Fasilitas */}
            <Modal
                opened={addFacilityOpened}
                onClose={() => { closeAddFacility(); setNewFacilityName(''); setNewFacilityDesc(''); }}
                title={<Text fw={700} size="lg">Tambah Fasilitas Baru</Text>}
                centered
                radius="md"
            >
                <Stack gap={15}>
                    <TextInput
                        label="Nama Fasilitas"
                        placeholder="Contoh: Parkir, WiFi, AC"
                        withAsterisk
                        value={newFacilityName}
                        onChange={e => setNewFacilityName(e.currentTarget.value)}
                    />
                    <Textarea
                        label="Deskripsi Fasilitas"
                        placeholder="Isi deskripsi fasilitas (opsional)"
                        autosize
                        minRows={2}
                        value={newFacilityDesc}
                        onChange={e => setNewFacilityDesc(e.currentTarget.value)}
                    />
                    <Flex gap={10} justify="flex-end" mt={5}>
                        <Button
                            variant="default"
                            radius="xl"
                            onClick={() => { closeAddFacility(); setNewFacilityName(''); setNewFacilityDesc(''); }}
                        >
                            Batal
                        </Button>
                        <Button
                            color="#194e9e"
                            radius="xl"
                            loading={addFacilityLoading}
                            leftSection={<Icon icon="uiw:plus" />}
                            disabled={!newFacilityName.trim()}
                            onClick={async () => {
                                setAddFacilityLoading(true);
                                await fetch<any, VenueFacility>({
                                    url: 'venue-facility',
                                    method: 'POST',
                                    data: { name: newFacilityName.trim(), description: newFacilityDesc.trim(), status: 'active' },
                                    success: ({ data }) => {
                                        if (data) {
                                            // Handle case where POST returns standard 'id' and 'name' instead of 'facility_id' and 'facility_name'
                                            const resData = data as any;
                                            const newFacilityData: any = {
                                                ...resData,
                                                facility_id: resData.facility_id || resData.id,
                                                facility_name: resData.facility_name || resData.name,
                                                facility_description: resData.facility_description || resData.description,
                                            };

                                            setFacility(prev => {
                                                const updated = [...(prev ?? []), newFacilityData as VenueFacility];
                                                // Deduplicate by facility_id
                                                const seen = new Set<number>();
                                                return updated.filter(f => {
                                                    const f_id = f.facility_id || f.id;
                                                    if (seen.has(f_id)) return false;
                                                    seen.add(f_id);
                                                    return true;
                                                });
                                            });
                                            // Auto-select new facility
                                            form.setValues({
                                                venue_facility_id: [...(form.values.venue_facility_id ?? []), newFacilityData.facility_id || newFacilityData.id]
                                            });
                                        }
                                        closeAddFacility();
                                        setNewFacilityName('');
                                        setNewFacilityDesc('');
                                    },
                                    complete: () => setAddFacilityLoading(false),
                                });
                            }}
                        >
                            Simpan Fasilitas
                        </Button>
                    </Flex>
                </Stack>
            </Modal>
        </Stack>
    );
}
