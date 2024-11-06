import { Get } from '@/utils/REST';
import { ActionIcon, Box, Button, Card, Divider, Flex, LoadingOverlay, Modal, Select, SimpleGrid, Stack, Switch, Text, Textarea, TextInput, Title, UnstyledButton } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useListState } from '@mantine/hooks';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { modals } from '@mantine/modals';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';

export type AddressData = {
    id: number;
    name: string;
    phone: string;
    province: number;
    city: number;
    detail: string;
    postcode: string;
    is_default?: boolean;
}

type AddressUpdateRequest = {
    user_id: number,
    is_main_address: 1 | 0,
    province_id: number,
    city_id: number,
    address_detail: string,
    address_name: string,
    zipcode: string,
    latitude: string,
    longitude: string,
    nama_penerima: string,
    phone: string,
    is_active: number
}

export const addressDataSchema = z.object({
    name: z.string({ message: "Wajib Diisi" }).nonempty("Nama tidak boleh kosong."),
    phone: z.string({ message: "Wajib Diisi" }).min(10, { message: 'Format Tidak Sesuai' }),
    province: z.number({ message: "Wajib Diisi" }).min(1, "Provinsi tidak boleh kosong."),
    city: z.number({ message: "Wajib Diisi" }).min(1, "Kota tidak boleh kosong."),
    detail: z.string({ message: "Wajib Diisi" }).nonempty("Detail alamat tidak boleh kosong."),
    postcode: z.string({ message: "Wajib Diisi" }).nonempty("Kode pos tidak boleh kosong."),
    is_default: z.boolean().optional(),
});

type Province = {
    id: number;
    name: string;
}

type City = {
    id: number;
    province_id: number;
    name: string;
    province?: Province;
}

type AddressListResponse = AddressUpdateRequest & { id: number };

const Address = () => {
    const [loading, setLoading] = useListState<string>();
    const [addressList, setAddressList] = useListState<AddressData>([]);
    const [provinceList, setProvinceList] = useListState<Province>([]);
    const [cityList, setCityList] = useListState<City>([]);
    const [provinceName, setProvinceName] = useState<{ [key: number]: string }>()
    const [cityName, setCityName] = useState<{ [key: number]: string }>()
    const [modalIndex, setModalIndex] = useState<number>();
    const [isr, setIsr] = useState(false);
    const user = useLoggedUser();


    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {
        if (isr) {
            getData();
        }
    }, [isr]);

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
            if (values.phone) values.phone = values.phone.replaceAll(/\D/g, '');
            return values;
        }
    });

    const getData = async () => {
        if (loading.includes('getdata')) return;
        await fetch<any, AddressListResponse[]>({
            url: `my-address?user_id=${user?.id}`,
            method: 'GET',
            before: () => setLoading.append('getprovince'),
            success: ({ data }) => {
                if (data) {
                    setAddressList.setState(data.map(e => ({
                        id: e.id,
                        name: e.address_name,
                        phone: e.phone,
                        province: e.province_id,
                        city: e.city_id,
                        detail: e.address_detail,
                        postcode: String(e.zipcode),
                        is_default: e.is_main_address == 1,
                    })));
                }
            },
            complete: () => setLoading.filter(e => e != 'getprovince'),
        });
        await fetch<any, Province[]>({
            url: 'province',
            method: 'GET',
            before: () => setLoading.append('getprovince'),
            success: ({ data }) => {
                setProvinceList.setState(data ?? []);
            },
            complete: () => setLoading.filter(e => e != 'getprovince'),
        });
    };

    useEffect(() => {
        getCity(form.values.province);
    }, [form.values.province]);

    useEffect(() => {
        getProvinceCityName();
    }, [addressList]);

    const getCity = async (province_id: number) => {
        await fetch<any, City[]>({
            url: `city?province_id=${province_id}`,
            method: 'GET',
            before: () => setLoading.append('getcity'),
            success: ({ data }) => {
                setCityList.setState(data ?? []);
            },
            complete: () => setLoading.filter(e => e != 'getcity'),
        });
    }

    const getProvinceCityName = async () => {
        const cityId = addressList.map(e => e.city);
        const provinceId = addressList.map(e => e.province);
        var cityName: { [key: number]: string } = [];
        var provinceName: { [key: number]: string } = [];

        cityId.forEach(async (e) => {
            await fetch<any, { name: string }>({
                url: `city/${e}`,
                method: 'GET',
                success: ({ data }) => {
                    if (data) {
                        cityName[e] = data?.name
                    }
                }
            });
        });

        provinceId.forEach(async (e) => {
            await fetch<any, { name: string }>({
                url: `province/${e}`,
                method: 'GET',
                success: ({ data }) => {
                    if (data) {
                        provinceName[e] = data?.name
                    }
                }
            });
        });

        setCityName(cityName);
        setProvinceName(provinceName);
    }

    const handleSave = async () => {
        const valid = form.validate();
        if (valid.hasErrors) return;

        const { values } = form;

        await fetch<AddressUpdateRequest, any>({
            url: modalIndex ? `my-address/${modalIndex}` : 'my-address',
            method: modalIndex ? 'PUT' : 'POST',
            data: {
                user_id: user?.id ?? 0,
                is_main_address: values.is_default ? 1 : 0,
                province_id: values.province,
                city_id: values.city,
                address_detail: values.detail,
                address_name: values.name,
                zipcode: values.postcode,
                latitude: '0',
                longitude: '0',
                nama_penerima: user?.name ?? '-',
                phone: values.phone,
                is_active: 1
            },
            before: () => setLoading.append('save'),
            success: () => {
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
            },
            complete: () => setLoading.filter(e => e != 'save'),
            error: () => {},
        });

        setModalIndex(undefined);
    };

    const handleDelete = () => {
        modals.openConfirmModal({
            centered: true,
            title: "Hapus Alamat",
            children: "Apakah anda yakin ingin menghapus alamat ini?",
            labels: { confirm: "Hapus", cancel: "Batal"},
            onConfirm: async () => {
                await fetch<any, any>({
                    url: `my-address/${modalIndex}`,
                    method: 'DELETE',
                    before: () => setLoading.append(''),
                    success: () => {
                        const data = addressList?.find(e => e.id == modalIndex)
                        setAddressList.filter(e => e.id != modalIndex);

                        if (data?.is_default) setAddressList.applyWhere(
                            (_, i) => i == 0,
                            e => ({ ...e, is_default: true })
                        );
                    },
                    complete: () => setLoading.filter(e => e != ''),
                    error: () => {},
                });
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

                    <TextInput
                        label="No. Telp"
                        placeholder="08XX XXXX XXXX"
                        {...form.getInputProps('phone')}
                    />

                    <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
                        <Select
                            label="Provinsi"
                            placeholder="Pilih Provinsi"
                            data={provinceList.map(e => ({ value: String(e.id), label: e.name }))}
                            value={String(form.values.province)}
                            onChange={e => e && form.setValues({ province: parseInt(e) })}
                            error={form.errors.province}
                        />

                        <Select
                            disabled={loading.includes('getcity')}
                            label="Kota"
                            placeholder="Pilih Kota"
                            data={cityList.map(e => ({ value: String(e.id), label: e.name }))}
                            value={String(form.values.city)}
                            onChange={e => e && form.setValues({ city: parseInt(e) })}
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
                        placeholder="RT, RW, No. Rumah, dll"
                        {...form.getInputProps('detail')}
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
                                    <Text c="gray" size="sm" mt={5} className={`uppercase`}>{provinceName ? provinceName[e.province] ?? '-' : '-'}, {cityName ? cityName[e.city] ?? '-' : '-'}, {e.postcode}</Text>
                                    <Text c="gray" size="sm">{e.detail}</Text>
                                    {/* {e.note && <Text c="gray" size="xs">({e.note})</Text>} */}
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

export default Address;
