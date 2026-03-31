import { Icon } from '@iconify/react/dist/iconify.js';
import { Button, Card, Divider, Flex, InputWrapper, LoadingOverlay, NumberInput, Select, Space, Stack, TagsInput, Text, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { VenueCapacity, VenueCategory, VenueFacility, VenueListResponse, VenueStoreRequest } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { useDidUpdate, useListState } from '@mantine/hooks';
import ImageInput from '@/components/ImageInput.tsx';
import { useForm, zodResolver } from '@mantine/form';
import { useRouter } from 'next/router';
import { z } from 'zod';


type ComponentProps = {};

export default function Create({}: Readonly<ComponentProps>) {
    const [loading, setLoading] = useListState<string>();
    const [category, setCategory] = useState<VenueCategory[]>();
    const [facility, setFacility] = useState<VenueFacility[]>();
    const [venue, setVenue] = useState<Partial<VenueListResponse>>();
    const [venueFacilities, setVenueFacilities] = useState<any[]>();
    const user = useLoggedUser();
    const router = useRouter();
    const { slug } = router.query;

    const form = useForm<Partial<VenueStoreRequest>>({
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

        await fetch<Partial<VenueStoreRequest>, any>({
            url: slug ? 'creator-data/venue/' + venue?.id : 'creator-data/venue',
            method: 'POST',
            data: {
                ...form.values,
                venue_capacity_id: 0,
                venue_schedule_id: 0,
                opening_hour: '2024-07-02T09:00:00',
                status: "active"
            },
            before: () => setLoading.append('submitdata'),
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
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`}/>
                    <Text size="lg" fw={600}>Informasi Venue</Text>
                </Flex>

                <InputWrapper error={form.errors.image} label="Gambar Venue" description="Direkomendasikan 1280px X 400px" withAsterisk>
                    <Flex wrap="wrap" gap={10} pt={5}>
                        {Array(5).fill(null).map((e, i) => (
                            <ImageInput
                                dimension={[200, 100]}
                                value={form.values.image && form.values.image[i] ? form.values.image[i] : undefined}
                                onChange={e => e && form.setValues({ image: [...(form.values.image ?? []), e]})}
                                onDelete={() => form.setValues({ image: (form.values.image ?? []).filter((_, x) => x != i)})}
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

                <TagsInput
                    withAsterisk
                    label="Fasilitas Venue"
                    placeholder="Isi Fasilitas Venue"
                    data={facility?.map(e => ({ value: String(e.id), label: e.name }))}
                    {...inputProps('venue_facilities_id')}
                    value={(form.values.venue_facility_id ?? []).map(e => facility?.find(z => z.id == e)?.name ?? '-')}
                    onChange={e => e && form.setValues({ venue_facility_id: e.map(e => facility?.find(z => z.name == e)?.id ?? 0) })}
                />

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

                <Flex gap={10} align="center" mt={10}>
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`}/>
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
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`}/>
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
                <Button
                    ml="auto"
                    loading={loading.includes('submitdata')}
                    onClick={submitData}
                    w="fit-content"
                    color="#194e9e"
                    rightSection={<Icon icon="uiw:check" />}
                    radius="xl">
                    Simpan Venue
                </Button>
            </Card>
        </Stack>
    );
}
