import { Icon } from '@iconify/react/dist/iconify.js';
import { Button, Card, Divider, Flex, InputWrapper, NumberInput, Select, Stack, TagsInput, Text, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { VenueCapacity, VenueCategory, VenueFacility, VenueStoreRequest } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { useListState } from '@mantine/hooks';
import ImageInput from '@/components/ImageInput.tsx';
import { useForm, zodResolver } from '@mantine/form';
import { useRouter } from 'next/router';
import { z } from 'zod';

type ComponentProps = {};
const isBrowser = typeof window !== 'undefined';

export const VenueStoreRequestSchema = z.object({
    // creator_id: z.number().nonnegative({ message: "ID pembuat harus berupa angka dan tidak negatif." }),
    venue_category_id: z.number().nonnegative({ message: "ID kategori venue harus berupa angka dan tidak negatif." }),
    // venue_capacity_id: z.number().nonnegative({ message: "ID kapasitas venue harus berupa angka dan tidak negatif." }),
    venue_facility_id: z.array(z.number().nonnegative({ message: "ID fasilitas harus berupa angka dan tidak negatif." })).min(1, { message: "Setidaknya satu fasilitas harus dipilih." }),
    // venue_schedule_id: z.number().nonnegative({ message: "ID jadwal venue harus berupa angka dan tidak negatif." }),
    name: z.string().min(1, { message: "Nama venue tidak boleh kosong." }),
    location: z.string().min(1, { message: "Lokasi tidak boleh kosong." }),
    location_map: z.string().url({ message: "Lokasi map harus berupa URL yang valid." }),
    location_detail: z.string(),
    // opening_hour: z.string().min(1, { message: "Jam buka tidak boleh kosong." }),
    max_capacity: z.number().nonnegative({ message: "Kapasitas maksimal harus berupa angka dan tidak negatif." }),
    seat_capacity: z.number().nonnegative({ message: "Kapasitas tempat duduk harus berupa angka dan tidak negatif." }),
    contact_person_name: z.string().min(1, { message: "Nama kontak tidak boleh kosong." }),
    contact_person_email: z.string().email({ message: "Email kontak harus berupa email yang valid." }),
    contact_person_phone: z.string().min(1, { message: "Nomor telepon kontak tidak boleh kosong." }),
    starting_price: z.number().nonnegative({ message: "Harga mulai harus berupa angka dan tidak negatif." }),
    description: z.string().min(1, { message: "Deskripsi tidak boleh kosong." }),
    // status: z.string().min(1, { message: "Status tidak boleh kosong." }),
    image: isBrowser ? z.array(z.instanceof(Blob)).min(1, { message: "Setidaknya satu gambar harus diunggah." }) : z.any(),
});

export default function create({}: Readonly<ComponentProps>) {
    const [loading, setLoading] = useListState<string>();
    const [category, setCategory] = useState<VenueCategory[]>();
    const [facility, setFacility] = useState<VenueFacility[]>();
    const user = useLoggedUser();
    const router = useRouter();

    const form = useForm<VenueStoreRequest>({
        validate: zodResolver(VenueStoreRequestSchema),
        onValuesChange: (val) => {
            if (val.contact_person_phone) val.contact_person_phone = val.contact_person_phone.replaceAll(/\D/g, '');
            return val;
        }
    });

    useEffect(() => {
        getData();
    }, [user]);

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
    }

    const submitData = async () => {
        const valid = form.validate();
        if (valid.hasErrors) return;

        await fetch<VenueStoreRequest, any>({
            url: 'venue',
            method: 'POST',
            data: {
                ...form.values,
                creator_id: user?.has_creator?.id ?? 0,
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
        });
    }

    return (
        <Stack className={`p-[20px] md:p-[30px]`} gap={30}>
            <Flex gap={10} justify="space-between" align="center">
                <Stack gap={5}>
                    <Text size="1.8rem" fw={600}>
                        Buat Venue Baru
                    </Text>
                    <Text size="sm" c="gray">
                        Lengkapi form untuk membuat venue baru
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

            <Stack gap={20} maw={700}>
                <Flex gap={10} align="center">
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`}/>
                    <Text size="lg" fw={600}>Informasi Venue</Text>
                </Flex>

                <InputWrapper error={form.errors.image}>
                    <Flex wrap="wrap" gap={10}>
                        {Array(5).fill(null).map((e, i) => (
                            <ImageInput
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
                        label="Nama Venue"
                        placeholder="Isi Nama Venue"
                        w="100%"
                        {...form.getInputProps('name')}
                    />
                    <Select
                        label="Kategori Venue"
                        placeholder="Pilih Kategori Venue"
                        disabled={loading.includes('getdatacat')}
                        data={category?.map(e => ({ value: String(e.id), label: e.name }))}
                        miw={250}
                        {...form.getInputProps('venue_category_id')}
                        onChange={e => e && form.setValues({ venue_category_id: parseInt(e) })}
                    />
                </Flex>

                <Textarea
                    label="Deskripsi Venue"
                    placeholder="Isi Deskripsi Venue"
                    autosize
                    minRows={3}
                    {...form.getInputProps('description')}
                />

                <TagsInput
                    label="Fasilitas Venue"
                    placeholder="Isi Fasilitas Venue"
                    data={facility?.map(e => ({ value: String(e.id), label: e.name }))}
                    {...form.getInputProps('venue_facility_id')}
                    value={(form.values.venue_facility_id ?? []).map(e => facility?.find(z => z.id == e)?.name ?? '-')}
                    onChange={e => e && form.setValues({ venue_facility_id: e.map(e => facility?.find(z => z.name == e)?.id ?? 0) })}
                />

                <Flex gap={15}>
                    <NumberInput
                        label="Maksimal Kapasitas"
                        placeholder="Masukan Maksimal Kapasitas"
                        hideControls
                        min={0}
                        w="100%"
                        {...form.getInputProps('max_capacity')}
                    />
                    <NumberInput
                        label="Jumlah Kursi"
                        placeholder="Masukan Jumlah Kursi"
                        hideControls
                        min={0}
                        w="100%"
                        {...form.getInputProps('seat_capacity')}
                    />
                    <NumberInput
                        label="Harga Per Hari"
                        placeholder="Masukan Harga Per Hari"
                        hideControls
                        prefix="Rp "
                        min={0}
                        w="100%"
                        {...form.getInputProps('starting_price')}
                    />
                </Flex>

                <Flex gap={10} align="center" mt={10}>
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`}/>
                    <Text size="lg" fw={600}>Alamat Venue</Text>
                </Flex>

                <Flex gap={15}>
                    <TextInput
                        label="Daerah"
                        placeholder="Bandung, Jawa Barat"
                        w="100%"
                        {...form.getInputProps('location')}
                    />
                    <TextInput
                        label="Link Maps"
                        placeholder="https://maps.google.com/..."
                        w="100%"
                        {...form.getInputProps('location_map')}
                    />
                </Flex>

                <Textarea
                    label="Alamat Detail Venue"
                    placeholder="Isi Detail Alamat Venue"
                    autosize
                    minRows={3}
                    {...form.getInputProps('location_detail')}
                />

                <Flex gap={10} align="center" mt={10}>
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`}/>
                    <Text size="lg" fw={600}>Contact Person</Text>
                </Flex>

                <Flex gap={15}>
                    <TextInput
                        label="Nama Kontak"
                        placeholder="Isi Nama Kontak"
                        w="100%"
                        {...form.getInputProps('contact_person_name')}
                    />
                    <TextInput
                        label="Email Kontak"
                        placeholder="Isi Email Kontak"
                        w="100%"
                        {...form.getInputProps('contact_person_email')}
                    />
                </Flex>

                <TextInput
                    label="No.Telp Kontak"
                    placeholder="Isi No.Telp Kontak"
                    w="100%"
                    {...form.getInputProps('contact_person_phone')}
                />
            </Stack>

            <Button
                loading={loading.includes('submitdata')}
                onClick={submitData}
                w="fit-content"
                color="#194e9e"
                rightSection={<Icon icon="uiw:check" />}
                radius="xl">
                Simpan Venue
            </Button>
        </Stack>
    );
}
