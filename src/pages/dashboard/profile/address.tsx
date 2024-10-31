import { Get } from '@/utils/REST';
import { ActionIcon, Box, Button, Card, Divider, Flex, LoadingOverlay, Modal, Select, SimpleGrid, Stack, Switch, Text, Textarea, TextInput, Title, UnstyledButton } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useListState } from '@mantine/hooks';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { modals } from '@mantine/modals';

type AddressData = {
    id: number;
    name: string;
    province: string;
    city: string;
    detail: string;
    postcode: string;
    note?: string;
    is_default?: boolean;
}

const addressDataSchema = z.object({
    name: z.string({ message: "Wajib Diisi" }).nonempty("Nama tidak boleh kosong."),
    province: z.string({ message: "Wajib Diisi" }).nonempty("Provinsi tidak boleh kosong."),
    city: z.string({ message: "Wajib Diisi" }).nonempty("Kota tidak boleh kosong."),
    detail: z.string({ message: "Wajib Diisi" }).nonempty("Detail alamat tidak boleh kosong."),
    postcode: z.string({ message: "Wajib Diisi" }).nonempty("Kode pos tidak boleh kosong."),
    note: z.string().optional(),
    is_default: z.boolean().optional(),
});

const dummyData: AddressData[] = [
    {
        id: 1,
        name: "Rumah",
        province: "Jawa Barat",
        city: "Bandung",
        detail: "Jl. Kebon Jeruk No. 5, RT 02 RW 01, Kelurahan Kebon Jeruk",
        note: "Dekat dengan taman kota dan pusat perbelanjaan",
        postcode: '40552',
        is_default: true
    },
    {
        id: 2,
        name: "Kantor",
        province: "Jawa Timur",
        city: "Surabaya",
        detail: "Jl. Merpati No. 10, Lantai 2, Kecamatan Gubeng",
        postcode: '40552',
        is_default: false
    },
    {
        id: 3,
        name: "Rumah 2",
        province: "DKI Jakarta",
        city: "Jakarta Selatan",
        detail: "Jl. Raya Kebayoran No. 3, RT 03 RW 04, Kelurahan Kebayoran Lama",
        postcode: '40552',
        is_default: false
    }
];

const Merch = () => {
    const [dataList, setDataList] = useState<any[]>();
    const [loading, setLoading] = useListState<string>();
    const [addressList, setAddressList] = useListState<AddressData>(dummyData);
    const [modalIndex, setModalIndex] = useState<number>();

    useEffect(() => {
        if (dataList == undefined) getData();
    }, []);

    useEffect(() => {
        if (modalIndex && modalIndex > 0) {
            const data = _.find(addressList, ['id', modalIndex]);
            if (data) form.setValues(data);
        } else form.reset();
    }, [modalIndex]);

    const form = useForm<Omit<AddressData, 'id'>>({
        validate: zodResolver(addressDataSchema),
        onValuesChange: (values) => {
            if (values.postcode) values.postcode = values.postcode.replaceAll(/\D/g, '');
            return values;
        }
    });

    const getData = () => {
        if (loading.includes('getdata')) return;
        setLoading.append('getdata');
        Get(`category`, {})
            .then((res: any) => {
                setDataList(res.data);
                setLoading.filter((e) => e != 'getdata');
            })
            .catch((err) => {
                console.log(err);
                setLoading.filter((e) => e != 'getdata');
            });
    };

    const handleSave = () => {
        const valid = form.validate();
        if (valid.hasErrors) return;

        if (form.values.is_default) setAddressList.apply(e => ({...e, is_default: false }));

        if (modalIndex) {
            setAddressList.applyWhere(
                e => e.id == modalIndex,
                e => ({
                    ...form.values,
                    id: addressList?.find(e => e.id == modalIndex)?.id ?? 0,
                    is_default: form.values.is_default ? true : e.is_default
                })
            );
        } else {
            setAddressList.prepend({
                ...form.values,
                id: addressList.length + 1
            });
        }

        setModalIndex(undefined);
    };

    const handleDelete = () => {
        modals.openConfirmModal({
            centered: true,
            title: "Hapus Alamat",
            children: "Apakah anda yakin ingin menghapus alamat ini?",
            labels: { confirm: "Hapus", cancel: "Batal"},
            onConfirm: () => {
                const data = addressList?.find(e => e.id == modalIndex)
                setAddressList.filter(e => e.id != modalIndex);

                if (data?.is_default) setAddressList.applyWhere(
                    (_, i) => i == 0,
                    e => ({ ...e, is_default: true })
                );
                setModalIndex(undefined);
            }
        })
    };

    return (
        <div className={`p-[30px_20px] md:p-[30px] md:max-w-[1440px] mx-auto text-black flex flex-col gap-[25px]`}>
            <Modal
                title={modalIndex == 0 ? "Buat Alamat Baru" : "Edit Alamat"}
                opened={modalIndex != undefined}
                onClose={() => setModalIndex(undefined)}
                centered
            >
                <Stack gap={15} p={5}>
                    <Flex gap={15} className={`!flex-col md:!flex-row`}>
                        <TextInput
                            label="Nama Alamat"
                            placeholder="Rumah, Kantor, ..."
                            {...form.getInputProps('name')}
                        />

                        <Switch
                            className={`mt-0 md:!mt-[33px]`}
                            label="Alamat Utama"
                            checked={form.values.is_default}
                            onChange={e => form.setFieldValue('is_default', e.target.checked)}
                            error={form.errors.is_default}
                        />
                    </Flex>

                    <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
                        <Select
                            label="Provinsi"
                            placeholder="Pilih Provinsi"
                            data={dummyData.map(e => e.province)}
                            value={form.values.province}
                            onChange={e => e && form.setFieldValue('province', e)}
                            error={form.errors.province}
                        />

                        <Select
                            label="Kota"
                            placeholder="Pilih Kota"
                            data={dummyData.map(e => e.city)}
                            value={form.values.city}
                            onChange={e => e && form.setFieldValue('city', e)}
                            error={form.errors.city}
                        />
                    </Flex>

                    <TextInput
                        label="Kode Pos"
                        placeholder="Masukan Kode Pos"
                        {...form.getInputProps('postcode')}
                    />

                    <Textarea
                        autosize
                        minRows={3}
                        label="Detail Alamat"
                        placeholder="Kecamatan, Desa, No. Rumah, dll"
                        {...form.getInputProps('detail')}
                    />

                    <TextInput
                        label="Keterangan Tambahan"
                        placeholder="Patokan Rumah, dll"
                        {...form.getInputProps('note')}
                    />

                    <Text size="xs" c="gray">Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.</Text>

                    <Flex align="center" gap={10} justify="space-between" mt={10}>
                        <Button
                            color="#0B387C"
                            w="fit-content"
                            radius="xl"
                            leftSection={<Icon icon="uiw:check" />}
                            onClick={handleSave}
                            loading={loading.includes('save')}
                        >Simpan Alamat</Button>

                        {(modalIndex && modalIndex > 0) ? (
                            <ActionIcon
                                variant="transparent"
                                color="red"
                                onClick={() => handleDelete()}
                            >
                                <Icon icon="uiw:delete" />
                            </ActionIcon>
                        ) : <></>}
                    </Flex>
                </Stack>
            </Modal>

            <Flex justify="space-between" gap={20} wrap="wrap" align="center">
                <Stack gap={5}>
                    <Title order={1} size="h3" fw={600} c="gray.8">Alamat Saya</Title>
                    <Text c="gray" size="sm">Perbarui dan Kelola Alamat Anda</Text>
                </Stack>

                <Button
                    variant='outline'
                    color="#0B387C"
                    w="fit-content"
                    radius="xl"
                    leftSection={<Icon icon="uiw:plus" />}
                    onClick={() => setModalIndex(0)}
                >Tambah Alamat</Button>
            </Flex>

            <Divider />

            <SimpleGrid display={addressList.length > 0 ? undefined : 'none'} className={`[&>*]:flex-grow !grid-cols-1 sm:!grid-cols-2 md:!grid-cols-3`}>
                {addressList.map((e, i) => (
                    <UnstyledButton key={i} mih="100%" onClick={() => setModalIndex(e.id)}>
                        <Card withBorder p={20} radius={15} h="100%" className={`${e.is_default ? '!border-b-3 !border-b-[#0B387C]' : ''}`}>
                            <Flex gap={15}>
                                <Box c={e.is_default ? "#0B387C" : "#6285b9"}>
                                    <Icon icon="gis:location-poi" className={`text-[24px]`}/>
                                </Box>
                                <Stack gap={3} mt={-5}>
                                    <Text fw={600} size="lg">{e.name} {e.is_default && <Text c="#0B387C" component="span" size="xs" fw={600} className={`whitespace-nowrap`}>(Alamat Utama)</Text>} </Text>
                                    <Text c="gray" size="sm" mt={5} className={`uppercase`}>{e.province}, {e.city}, {e.postcode}</Text>
                                    <Text c="gray" size="sm">{e.detail}</Text>
                                    {e.note && <Text c="gray" size="xs">({e.note})</Text>}
                                </Stack>
                            </Flex>
                        </Card>
                    </UnstyledButton>
                ))}
            </SimpleGrid>

            {(addressList.length == 0 || !addressList) && (
                <Card withBorder radius={15} px={30} py={60}>
                    <Stack align="center" gap={15}>
                        <Box c="#0B387C">
                            <Icon icon="nonicons:not-found-16" className={`text-[2rem]`} />
                        </Box>
                        <Text ta="center" c="gray">Tidak ada alamat yang terdaftar</Text>
                        <Button
                            variant='outline'
                            color="#0B387C"
                            w="fit-content"
                            radius="xl"
                            leftSection={<Icon icon="uiw:plus" />}
                            onClick={() => setModalIndex(0)}
                        >Tambah Alamat</Button>
                    </Stack>
                </Card>
            )}
        </div>
    );
};

export default Merch;
