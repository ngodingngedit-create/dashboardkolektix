import { Get } from '@/utils/REST';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Flex,
  LoadingOverlay,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
  Badge,
} from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useListState } from '@mantine/hooks';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/router';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSave,
  faXmark,
  faSearch,
  faPlus,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

export type AddressData = {
  id: number;
  name: string;
  nama_penerima: string;
  phone: string;
  province: number;
  city: number;
  detail: string;
  postcode: string;
  is_default?: boolean;
};

export type AddressUpdateRequest = {
  id?: number;
  user_id: number;
  is_main_address: 1 | 0;
  province_id: number;
  city_id: number;
  address_detail: string;
  address_name: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  nama_penerima: string;
  phone: string;
  is_active: number;
};

export const addressDataSchema = z.object({
  name: z.string({ message: 'Wajib Diisi' }).nonempty('Nama tidak boleh kosong.'),
  nama_penerima: z.string({ message: 'Wajib Diisi' }).nonempty('Nama Penerima tidak boleh kosong.'),
  phone: z.string({ message: 'Wajib Diisi' }).min(10, { message: 'Format Tidak Sesuai' }),
  province: z.number({ message: 'Wajib Diisi' }).min(1, 'Provinsi tidak boleh kosong.'),
  city: z.number({ message: 'Wajib Diisi' }).min(1, 'Kota tidak boleh kosong.'),
  detail: z.string({ message: 'Wajib Diisi' }).nonempty('Detail alamat tidak boleh kosong.'),
  postcode: z.string({ message: 'Wajib Diisi' }).nonempty('Kode pos tidak boleh kosong.'),
  is_default: z.boolean().optional(),
});

export type Province = {
  id: number;
  name: string;
};

export type City = {
  id: number;
  province_id: number;
  name: string;
  province?: Province;
};

type AddressListResponse = AddressUpdateRequest & { id: number };

const Address = () => {
  const [loading, setLoading] = useListState<string>();
  const [addressList, setAddressList] = useListState<AddressData>([]);
  const [provinceList, setProvinceList] = useListState<Province>([]);
  const [cityList, setCityList] = useListState<City>([]);
  const [provinceName, setProvinceName] = useState<{ [key: number]: string }>();
  const [cityName, setCityName] = useState<{ [key: number]: string }>();
  const [isr, setIsr] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
const user = useLoggedUser();
const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({
    key: null,
    direction: null,
  });

  useEffect(() => { setIsr(true); }, []);
  useEffect(() => { if (isr) getData(); }, [isr]);

  const form = useForm<Omit<AddressData, 'id'>>({
    validate: zodResolver(addressDataSchema),
    onValuesChange: (values) => {
      if (values.postcode) values.postcode = values.postcode.replaceAll(/\D/g, '');
      if (values.phone) values.phone = values.phone.replaceAll(/\D/g, '');
      return values;
    },
  });

  const getData = async () => {
    if (loading.includes('getdata')) return;
    await fetch<any, AddressListResponse[]>({
      url: `my-address?user_id=${user?.id}`,
      method: 'GET',
      before: () => setLoading.append('getdata'),
      success: ({ data }) => {
        if (data) {
          setAddressList.setState(
            data.map((e) => ({
              id: e.id,
              nama_penerima: e.nama_penerima,
              name: e.address_name,
              phone: e.phone,
              province: e.province_id,
              city: e.city_id,
              detail: e.address_detail,
              postcode: String(e.zipcode),
              is_default: e.is_main_address == 1,
            }))
          );
        }
      },
      complete: () => setLoading.filter((e) => e !== 'getdata'),
    });
    await fetch<any, Province[]>({
      url: 'province',
      method: 'GET',
      before: () => setLoading.append('getprovince'),
      success: ({ data }) => { setProvinceList.setState(data ?? []); },
      complete: () => setLoading.filter((e) => e !== 'getprovince'),
    });
  };

  useEffect(() => { getCity(form.values.province); }, [form.values.province]);
  useEffect(() => { getProvinceCityName(); }, [addressList]);

  const getCity = async (province_id: number) => {
    await fetch<any, City[]>({
      url: `city?province_id=${province_id}`,
      method: 'GET',
      before: () => setLoading.append('getcity'),
      success: ({ data }) => { setCityList.setState(data ?? []); },
      complete: () => setLoading.filter((e) => e !== 'getcity'),
    });
  };

  const getProvinceCityName = async () => {
    const cityId = addressList.map((e) => e.city);
    const provinceId = addressList.map((e) => e.province);
    var cityNameMap: { [key: number]: string } = [];
    var provinceNameMap: { [key: number]: string } = [];

    cityId.forEach(async (e) => {
      await fetch<any, { name: string }>({
        url: `city/${e}`,
        method: 'GET',
        success: ({ data }) => { if (data) cityNameMap[e] = data?.name; },
      });
    });
    provinceId.forEach(async (e) => {
      await fetch<any, { name: string }>({
        url: `province/${e}`,
        method: 'GET',
        success: ({ data }) => { if (data) provinceNameMap[e] = data?.name; },
      });
    });
    setCityName(cityNameMap);
    setProvinceName(provinceNameMap);
  };

  const handleAddClick = () => {
    setSelectedAddressId(null);
    setIsEditMode(false);
    form.reset();
    setIsFormVisible(true);
  };

  const handleEditClick = (addr: AddressData) => {
    setSelectedAddressId(addr.id);
    setIsEditMode(true);
    form.setValues({
      name: addr.name,
      nama_penerima: addr.nama_penerima,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      detail: addr.detail,
      postcode: addr.postcode,
      is_default: addr.is_default,
    });
    setIsFormVisible(true);
  };

  const handleSave = async () => {
    const valid = form.validate();
    if (valid.hasErrors) return;

    const { values } = form;

    await fetch<AddressUpdateRequest, any>({
      url: selectedAddressId ? `my-address/${selectedAddressId}` : 'my-address',
      method: selectedAddressId ? 'PUT' : 'POST',
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
        nama_penerima: values.nama_penerima,
        phone: values.phone,
        is_active: 1,
      },
      before: () => setLoading.append('save'),
      success: () => {
        if (form.values.is_default) setAddressList.apply((e) => ({ ...e, is_default: false }));
        if (selectedAddressId) {
          setAddressList.applyWhere(
            (e) => e.id == selectedAddressId,
            (e) => ({
              ...form.values,
              id: addressList?.find((e) => e.id == selectedAddressId)?.id ?? 0,
              is_default: form.values.is_default ? true : e.is_default,
            })
          );
        } else {
          setAddressList.prepend({ ...form.values, id: addressList.length + 1 });
        }
        setIsFormVisible(false);
        form.reset();
      },
      complete: () => setLoading.filter((e) => e !== 'save'),
      error: () => {},
    });
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      centered: true,
      title: 'Hapus Alamat',
      children: 'Apakah anda yakin ingin menghapus alamat ini?',
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      onConfirm: async () => {
        await fetch<any, any>({
          url: `my-address/${selectedAddressId}`,
          method: 'DELETE',
          before: () => setLoading.append('delete'),
          success: () => {
            const data = addressList?.find((e) => e.id == selectedAddressId);
            setAddressList.filter((e) => e.id != selectedAddressId);
            if (data?.is_default)
              setAddressList.applyWhere(
                (_, i) => i == 0,
                (e) => ({ ...e, is_default: true })
              );
            setIsFormVisible(false);
          },
          complete: () => setLoading.filter((e) => e !== 'delete'),
          error: () => {},
        });
      },
    });
  };

  // ─── List View ────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let result = [...addressList];
    if (searchValue) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.nama_penerima.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.phone.includes(searchValue) ||
          item.detail.toLowerCase().includes(searchValue.toLowerCase()) ||
          (provinceName && provinceName[item.province]?.toLowerCase().includes(searchValue.toLowerCase())) ||
          (cityName && cityName[item.city]?.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        let valA = a[sortConfig.key as string];
        let valB = b[sortConfig.key as string];

        if (sortConfig.key === "location") {
            valA = `${provinceName ? provinceName[a.province] : ""} ${cityName ? cityName[a.city] : ""}`;
            valB = `${provinceName ? provinceName[b.province] : ""} ${cityName ? cityName[b.city] : ""}`;
        }

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [addressList, searchValue, sortConfig, provinceName, cityName]);

  const renderList = () => (
    <div className="p-[30px_20px] md:p-[30px] md:max-w-[1440px] mx-auto pb-[100px]">
      <Stack gap={30}>
        <Flex gap={20} justify="space-between" align="center" wrap="wrap">
          <Flex align="center" gap={12}>
            <ActionIcon variant="light" color="gray" onClick={() => router.push('/dashboard')} size="lg" radius="md">
              <FontAwesomeIcon icon={faArrowLeft} />
            </ActionIcon>
            <Title order={1} size="h3" fw={600} c="gray.8">Alamat Saya</Title>
          </Flex>
          <Flex align="center" gap={12} wrap="wrap">
            <TextInput
              placeholder="Cari nama alamat, penerima, atau lokasi..."
              leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ width: "100%", maxWidth: 320 }}
            />
            <Button
              onClick={handleAddClick}
              leftSection={<FontAwesomeIcon icon={faPlus} />}
              color="blue"
              size="md"
              radius="xl"
            >
              Tambah Alamat
            </Button>
          </Flex>
        </Flex>

        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10">
            {filteredData.map((item) => (
              <div key={item.id} className="w-full bg-white rounded-xl shadow-md border border-primary-light-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-lg font-semibold text-dark truncate">{item.name}</h5>
                    {item.is_default && <Badge color="blue" variant="light" size="sm">Utama</Badge>}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 text-sm">
                    <p className="text-dark"><span className="text-grey">Penerima:</span> {item.nama_penerima}</p>
                    <p className="text-dark"><span className="text-grey">No. Telp:</span> {item.phone}</p>
                    <p className="text-dark">
                      <span className="text-grey">Lokasi:</span>{" "}
                      {provinceName ? provinceName[item.province] ?? "-" : "-"},{" "}
                      {cityName ? cityName[item.city] ?? "-" : "-"}
                    </p>
                    <p className="text-grey">Pos: {item.postcode}</p>
                    <p className="text-grey">{item.detail}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t-1.5 border-dashed border-primary-light-200 flex items-center justify-end gap-2">
                    <Tooltip label="Edit">
                      <ActionIcon variant="light" color="blue" onClick={() => handleEditClick(item)}>
                        <FontAwesomeIcon icon={faPen} size="sm" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Hapus">
                      <ActionIcon variant="light" color="red" onClick={() => { setSelectedAddressId(item.id); setTimeout(() => handleDelete(), 100); }}>
                        <FontAwesomeIcon icon={faTrash} size="sm" />
                      </ActionIcon>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-primary-light-200 flex flex-col items-center justify-center min-h-[40vh] rounded-md gap-3 text-center text-dark px-5">
            <Box c="gray.4">
              <FontAwesomeIcon icon={faSearch} className="text-[2rem]" />
            </Box>
            <h3 className="text-xl font-semibold">{searchValue ? "Alamat tidak ditemukan" : "Tidak ada alamat yang terdaftar"}</h3>
            <Text size="sm" c="gray">Klik tombol &quot;Tambah Alamat&quot; untuk menambahkan alamat pengiriman.</Text>
          </div>
        )}
      </Stack>
    </div>
  );

  // ─── Form View ────────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="p-[30px_20px] md:p-[30px] md:max-w-[1440px] mx-auto pb-[100px]">
      <Stack gap={25}>
        {/* Header */}
        <Flex align="center" gap={15}>
          <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="md">
            <FontAwesomeIcon icon={faArrowLeft} />
          </ActionIcon>
          <Stack gap={0}>
            <Title order={2} size="h3">
              {isEditMode ? 'Edit Alamat' : 'Tambah Alamat Baru'}
            </Title>
            <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola data alamat Anda</Text>
          </Stack>
        </Flex>

        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Nama Penerima"
                placeholder="Masukan Nama Penerima"
                {...form.getInputProps('nama_penerima')}
              />
              <TextInput
                label="Nama Alamat"
                placeholder="Rumah, Kantor, ..."
                {...form.getInputProps('name')}
              />
              <TextInput
                label="No. Telp"
                placeholder="08XX XXXX XXXX"
                {...form.getInputProps('phone')}
              />
              <Select
                label="Provinsi"
                placeholder="Pilih Provinsi"
                data={provinceList.map((e) => ({ value: String(e.id), label: e.name }))}
                value={String(form.values.province)}
                onChange={(e) => e && form.setValues({ province: parseInt(e) })}
                error={form.errors.province}
                searchable
              />
              <Select
                disabled={loading.includes('getcity')}
                label="Kota"
                placeholder="Pilih Kota"
                data={cityList.map((e) => ({ value: String(e.id), label: e.name }))}
                value={String(form.values.city)}
                onChange={(e) => e && form.setValues({ city: parseInt(e) })}
                error={form.errors.city}
                searchable
              />
              <TextInput
                label="Kode Pos"
                placeholder="Masukan Kode Pos"
                {...form.getInputProps('postcode')}
              />
            </div>

            <Textarea
              autosize
              minRows={3}
              label="Detail Alamat"
              placeholder="RT, RW, No. Rumah, dll"
              {...form.getInputProps('detail')}
            />

            <Switch
              label="Alamat Utama"
              checked={form.values.is_default}
              onChange={(e) => form.setFieldValue('is_default', e.target.checked)}
              error={form.errors.is_default}
            />

            <Text size="xs" c="gray">
              Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.
            </Text>
          </Stack>
        </Card>

        {/* Floating Footer */}
        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
          <Flex justify="space-between" align="center">
            <div>
              {isEditMode && (
                <Button
                  variant="subtle"
                  color="red"
                  leftSection={<Icon icon="uiw:delete" />}
                  onClick={handleDelete}
                  loading={loading.includes('delete')}
                >
                  Hapus Alamat
                </Button>
              )}
            </div>
            <Flex gap="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setIsFormVisible(false)}
                size="md"
                leftSection={<FontAwesomeIcon icon={faXmark} />}
              >
                Batalkan
              </Button>
              <Button
                color="#0B387C"
                size="md"
                loading={loading.includes('save')}
                leftSection={!loading.includes('save') && <FontAwesomeIcon icon={faSave} />}
                onClick={handleSave}
              >
                {isEditMode ? 'Simpan Perubahan' : 'Konfirmasi & Simpan'}
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Stack>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <LoadingOverlay visible={loading.includes('save')} overlayProps={{ blur: 2 }} />
      {isFormVisible ? renderForm() : renderList()}
    </div>
  );
};

export default Address;
