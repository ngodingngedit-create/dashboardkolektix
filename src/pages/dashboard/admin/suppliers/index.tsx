import React, { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Pagination,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/router";
import fetch from "@/utils/fetch";

export interface SupplierItem {
  id: number;
  creator_id: number;
  store_location_id: number | null;
  supplier_code: string;
  supplier_type: string;
  supplier_name: string;
  contact_person: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string | null;
  npwp: string | null;
  tax_name: string | null;
  address: string;
  province: string;
  city: string;
  district: string | null;
  postal_code: string;
  country: string;
  payment_terms: string;
  lead_time_days: number;
  notes: string | null;
  is_active: boolean | number;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  products_count?: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

const tableHeadStyle: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: "#495057",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: "13px",
  color: "#334155",
  verticalAlign: "middle",
};

export default function SuppliersAdminPage() {
  const router = useRouter();
  const [data, setData] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const [modalOpened, setModalOpened] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [creators, setCreators] = useState<{ value: string; label: string }[]>([]);

  const form = useForm({
    initialValues: {
      creator_id: 11,
      supplier_type: "COMPANY",
      supplier_name: "",
      contact_person: "",
      email: "",
      phone: "",
      whatsapp: "",
      website: "",
      npwp: "",
      tax_name: "",
      address: "",
      province: "",
      city: "",
      district: "",
      postal_code: "",
      country: "Indonesia",
      payment_terms: "NET 30",
      lead_time_days: 7,
      notes: "",
      is_active: true,
    },
    validate: {
      supplier_name: (val) => (!val ? "Nama supplier wajib diisi" : null),
      contact_person: (val) => (!val ? "Contact person wajib diisi" : null),
      email: (val) => (!val ? "Email wajib diisi" : !/^\S+@\S+$/.test(val) ? "Email tidak valid" : null),
      phone: (val) => (!val ? "Nomor telepon wajib diisi" : null),
      creator_id: (val) => (!val ? "Creator wajib dipilih" : null),
    },
  });

  const fetchCreators = async () => {
    try {
      await fetch({
        url: "creator-data/dropdown-suppliers",
        method: "GET",
        success: (res: any) => {
          const list = res?.data || [];
          if (Array.isArray(list)) {
            setCreators(
              list.map((c: any) => ({
                value: String(c.id),
                label: `${c.name} (ID: ${c.id})`,
              }))
            );
          }
        },
        error: () => {},
      });
    } catch {}
  };

  const getSuppliers = async (targetPage = page) => {
    setLoading((prev) => [...prev, "getdata"]);
    try {
      await fetch({
        url: `admin-data/suppliers?page=${targetPage}`,
        method: "GET",
        success: (res: any) => {
          const items = Array.isArray(res?.data)
            ? res.data
            : res?.data?.data && Array.isArray(res.data.data)
            ? res.data.data
            : [];
          setData(items);

          if (res?.pagination) {
            setPagination(res.pagination);
          } else if (res?.data?.current_page) {
            setPagination({
              current_page: res.data.current_page,
              last_page: res.data.last_page,
              per_page: res.data.per_page,
              total: res.data.total,
              from: res.data.from,
              to: res.data.to,
            });
          }
        },
        error: (err: any) => {
          notifications.show({
            title: "Gagal",
            message: err?.response?.data?.message || err?.message || "Gagal mengambil data supplier",
            color: "red",
          });
        },
        complete: () => {
          setLoading((prev) => prev.filter((k) => k !== "getdata"));
        },
      });
    } catch (e) {
      setLoading((prev) => prev.filter((k) => k !== "getdata"));
    }
  };

  useEffect(() => {
    getSuppliers(page);
  }, [page]);

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    form.reset();
    setModalOpened(true);
  };

  const handleOpenEdit = (item: SupplierItem) => {
    setSelectedSupplier(item);
    form.setValues({
      creator_id: item.creator_id ?? 11,
      supplier_type: item.supplier_type || "COMPANY",
      supplier_name: item.supplier_name || "",
      contact_person: item.contact_person || "",
      email: item.email || "",
      phone: item.phone || "",
      whatsapp: item.whatsapp || "",
      website: item.website || "",
      npwp: item.npwp || "",
      tax_name: item.tax_name || "",
      address: item.address || "",
      province: item.province || "",
      city: item.city || "",
      district: item.district || "",
      postal_code: item.postal_code || "",
      country: item.country || "Indonesia",
      payment_terms: item.payment_terms || "NET 30",
      lead_time_days: Number(item.lead_time_days ?? 7),
      notes: item.notes || "",
      is_active: Boolean(item.is_active),
    });
    setModalOpened(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    const isEdit = Boolean(selectedSupplier);
    const payload = {
      ...values,
      creator_id: Number(values.creator_id),
      lead_time_days: Number(values.lead_time_days),
      is_active: Boolean(values.is_active),
      store_location_id: selectedSupplier?.store_location_id ?? null,
      district: values.district || null,
      website: values.website || null,
      npwp: values.npwp || null,
      tax_name: values.tax_name || null,
      notes: values.notes || null,
    };

    setLoading((prev) => [...prev, "submit"]);
    try {
      await fetch({
        url: isEdit ? `admin-data/suppliers/${selectedSupplier?.id}` : "admin-data/suppliers",
        method: isEdit ? "PUT" : "POST",
        data: payload,
        headers: {
          "Content-Type": "application/json",
        },
        success: (res: any) => {
          notifications.show({
            title: "Sukses",
            message: res?.message || (isEdit ? "Supplier berhasil diupdate." : "Supplier berhasil ditambahkan."),
            color: "green",
          });
          setModalOpened(false);
          form.reset();
          getSuppliers(page);
        },
        error: (err: any) => {
          notifications.show({
            title: "Gagal",
            message: err?.response?.data?.message || err?.message || "Gagal menyimpan supplier.",
            color: "red",
          });
        },
        complete: () => {
          setLoading((prev) => prev.filter((k) => k !== "submit"));
        },
      });
    } catch {
      setLoading((prev) => prev.filter((k) => k !== "submit"));
    }
  };

  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return data;
    const q = debouncedSearch.toLowerCase().trim();
    return data.filter(
      (item) =>
        item.supplier_name?.toLowerCase().includes(q) ||
        item.supplier_code?.toLowerCase().includes(q) ||
        item.contact_person?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#F8FAFC]">
      <Paper p="md" radius="md" withBorder className="bg-white">
        <Flex justify="space-between" align="center" wrap="wrap" gap="md">
          <Flex align="center" gap="sm">
            <ActionIcon
              variant="light"
              color="gray"
              size="lg"
              radius="xl"
              onClick={() => router.push("/dashboard/admin")}
            >
              <Icon icon="ph:arrow-left-bold" width={18} />
            </ActionIcon>
            <div>
              <Text size="xl" fw={700} c="#0B387C">
                Kelola Suppliers
              </Text>
              <Text size="xs" c="dimmed">
                Daftar rekanan supplier merchandise admin
              </Text>
            </div>
          </Flex>

          <Button
            leftSection={<Icon icon="ph:plus-bold" width={16} />}
            color="indigo"
            radius="md"
            onClick={handleOpenCreate}
          >
            Tambah Supplier
          </Button>
        </Flex>
      </Paper>

      <Card withBorder radius="md" p="md" className="bg-white relative">
        <LoadingOverlay visible={loading.includes("getdata")} />

        <Flex justify="space-between" align="center" mb="md" gap="md" wrap="wrap">
          <TextInput
            placeholder="Cari supplier / kode / kontak..."
            leftSection={<Icon icon="uiw:search" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80"
            size="sm"
          />
          <Text size="xs" c="dimmed">
            Total: {pagination.total || filteredData.length} supplier
          </Text>
        </Flex>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ backgroundColor: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
                <th style={tableHeadStyle}>No</th>
                <th style={tableHeadStyle}>Kode</th>
                <th style={tableHeadStyle}>Supplier</th>
                <th style={tableHeadStyle}>Kontak</th>
                <th style={tableHeadStyle}>Lokasi</th>
                <th style={tableHeadStyle}>Syarat Bayar</th>
                <th style={tableHeadStyle}>Lead Time</th>
                <th style={tableHeadStyle}>Status</th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                    <Text c="dimmed">Tidak ada data supplier.</Text>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid #E2E8F0",
                      backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                    }}
                  >
                    <td style={tableCellStyle}>{(page - 1) * pagination.per_page + idx + 1}</td>
                    <td style={tableCellStyle}>
                      <Badge variant="light" color="blue" size="sm">
                        {item.supplier_code || "-"}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>
                      <div>
                        <Text fw={600} size="sm" c="#0F172A">
                          {item.supplier_name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {item.supplier_type}
                        </Text>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="xs" fw={500}>
                        {item.contact_person}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.phone || item.email}
                      </Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="xs">
                        {item.city}, {item.province}
                      </Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge variant="outline" color="gray" size="xs">
                        {item.payment_terms || "NET 30"}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="xs">{item.lead_time_days} hari</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge color={item.is_active ? "green" : "gray"} variant="light" size="xs">
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Tooltip label="Edit Supplier" withArrow>
                        <ActionIcon
                          variant="light"
                          color="indigo"
                          size="sm"
                          radius="md"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Icon icon="tabler:edit" width={16} />
                        </ActionIcon>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.last_page > 1 && (
          <Flex justify="center" mt="lg">
            <Pagination
              value={page}
              onChange={setPage}
              total={pagination.last_page}
              color="indigo"
              size="sm"
              radius="md"
            />
          </Flex>
        )}
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Text fw={700} size="md" c="#0B387C">
            {selectedSupplier ? "Edit Supplier" : "Tambah Supplier Baru"}
          </Text>
        }
        size="lg"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <Select
              label="Creator ID"
              placeholder="Pilih Creator"
              data={
                creators.length > 0
                  ? creators
                  : [{ value: "11", label: "moofeet (ID: 11)" }]
              }
              searchable
              required
              value={String(form.values.creator_id)}
              onChange={(val) => form.setFieldValue("creator_id", Number(val))}
            />

            <Flex gap="sm" direction={{ base: "column", sm: "row" }}>
              <TextInput
                label="Nama Supplier"
                placeholder="PT Supplier Indonesia"
                className="flex-1"
                required
                {...form.getInputProps("supplier_name")}
              />
              <Select
                label="Tipe Supplier"
                data={[
                  { value: "COMPANY", label: "COMPANY" },
                  { value: "INDIVIDUAL", label: "INDIVIDUAL" },
                ]}
                className="w-full sm:w-44"
                {...form.getInputProps("supplier_type")}
              />
            </Flex>

            <Flex gap="sm" direction={{ base: "column", sm: "row" }}>
              <TextInput
                label="Contact Person"
                placeholder="Budi Santoso"
                className="flex-1"
                required
                {...form.getInputProps("contact_person")}
              />
              <TextInput
                label="Email"
                placeholder="supplier@example.com"
                className="flex-1"
                required
                {...form.getInputProps("email")}
              />
            </Flex>

            <Flex gap="sm" direction={{ base: "column", sm: "row" }}>
              <TextInput
                label="Nomor Telepon"
                placeholder="081234567890"
                className="flex-1"
                required
                {...form.getInputProps("phone")}
              />
              <TextInput
                label="WhatsApp"
                placeholder="081234567890"
                className="flex-1"
                {...form.getInputProps("whatsapp")}
              />
            </Flex>

            <TextInput
              label="Website"
              placeholder="https://supplier.example.com"
              {...form.getInputProps("website")}
            />

            <Flex gap="sm" direction={{ base: "column", sm: "row" }}>
              <TextInput
                label="NPWP"
                placeholder="01.234.567.8-012.000"
                className="flex-1"
                {...form.getInputProps("npwp")}
              />
              <TextInput
                label="Tax Name"
                placeholder="PT Supplier Indonesia"
                className="flex-1"
                {...form.getInputProps("tax_name")}
              />
            </Flex>

            <Textarea
              label="Alamat Lengkap"
              placeholder="Jl. Sudirman No. 20"
              rows={2}
              {...form.getInputProps("address")}
            />

            <Flex gap="sm" direction={{ base: "column", sm: "row" }}>
              <TextInput
                label="Provinsi"
                placeholder="DKI Jakarta"
                className="flex-1"
                {...form.getInputProps("province")}
              />
              <TextInput
                label="Kota"
                placeholder="Jakarta Selatan"
                className="flex-1"
                {...form.getInputProps("city")}
              />
            </Flex>

            <Flex gap="sm" direction={{ base: "column", sm: "row" }}>
              <TextInput
                label="Kecamatan (District)"
                placeholder="Kebayoran Baru"
                className="flex-1"
                {...form.getInputProps("district")}
              />
              <TextInput
                label="Kode Pos"
                placeholder="12190"
                className="flex-1"
                {...form.getInputProps("postal_code")}
              />
            </Flex>

            <Flex gap="sm" direction={{ base: "column", sm: "row" }}>
              <TextInput
                label="Syarat Pembayaran"
                placeholder="NET 30"
                className="flex-1"
                {...form.getInputProps("payment_terms")}
              />
              <NumberInput
                label="Lead Time (Hari)"
                placeholder="10"
                className="flex-1"
                min={0}
                {...form.getInputProps("lead_time_days")}
              />
            </Flex>

            <Textarea
              label="Catatan"
              placeholder="Supplier kebutuhan merchandise event Kolektix"
              rows={2}
              {...form.getInputProps("notes")}
            />

            <Switch
              label="Status Aktif"
              checked={Boolean(form.values.is_active)}
              onChange={(e) => form.setFieldValue("is_active", e.currentTarget.checked)}
              mt="xs"
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Batal
              </Button>
              <Button type="submit" color="indigo" loading={loading.includes("submit")}>
                Simpan
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
