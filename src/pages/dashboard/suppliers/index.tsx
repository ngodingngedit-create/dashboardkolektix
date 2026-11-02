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
import useLoggedUser from "@/utils/useLoggedUser";

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

export default function CreatorSuppliersPage() {
  const router = useRouter();
  const user = useLoggedUser();
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

  const creatorId = user?.has_creator?.id || user?.id || 11;

  const form = useForm({
    initialValues: {
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
    },
  });

  const getSuppliers = async (targetPage = page) => {
    setLoading((prev) => [...prev, "getdata"]);
    try {
      await fetch({
        url: `creator-data/suppliers-list?page=${targetPage}`,
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
    } catch {
      setLoading((prev) => prev.filter((k) => k !== "getdata"));
    }
  };

  useEffect(() => {
    getSuppliers(page);
  }, [page]);

  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    form.reset();
    setModalOpened(true);
  };

  const handleOpenEdit = (item: SupplierItem) => {
    setSelectedSupplier(item);
    form.setValues({
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

    let payload: any;
    if (isEdit) {
      payload = {
        supplier_type: values.supplier_type,
        supplier_name: values.supplier_name,
        contact_person: values.contact_person,
        email: values.email,
        phone: values.phone,
        whatsapp: values.whatsapp,
        address: values.address,
        province: values.province,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country || "Indonesia",
        payment_terms: values.payment_terms,
        lead_time_days: Number(values.lead_time_days),
        is_active: Boolean(values.is_active),
      };
    } else {
      payload = {
        creator_id: Number(creatorId),
        supplier_type: values.supplier_type,
        supplier_name: values.supplier_name,
        contact_person: values.contact_person,
        email: values.email,
        phone: values.phone,
        whatsapp: values.whatsapp,
        website: values.website || null,
        npwp: values.npwp || null,
        tax_name: values.tax_name || null,
        address: values.address,
        province: values.province,
        city: values.city,
        district: values.district || null,
        postal_code: values.postal_code,
        country: values.country || "Indonesia",
        payment_terms: values.payment_terms,
        lead_time_days: Number(values.lead_time_days),
        notes: values.notes || null,
        is_active: Boolean(values.is_active),
      };
    }

    setLoading((prev) => [...prev, "submit"]);
    try {
      await fetch({
        url: isEdit ? `creator-data/suppliers/${selectedSupplier?.id}` : "creator-data/suppliers",
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
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="md">
        <Flex align="center" gap={12}>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label="Kembali ke Dashboard"
          >
            <Icon icon="ph:arrow-left-bold" />
          </button>
          <Stack gap={2}>
            <Text size="1.6rem" fw={700} c="gray.9">
              Suppliers
            </Text>
            <Text size="sm" c="dimmed">
              Kelola data pemasok barang dan merchandise event Anda
            </Text>
          </Stack>
        </Flex>

        <Group>
          <Button
            leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
            color="blue"
            radius="md"
            onClick={handleOpenCreate}
            className="shadow-sm"
          >
            Tambah Supplier
          </Button>
        </Group>
      </Flex>

      {/* Main Card */}
      <Card withBorder radius="md" p={0} className="shadow-sm overflow-hidden bg-white">
        <LoadingOverlay visible={loading.includes("getdata")} overlayProps={{ blur: 1 }} />

        {/* Toolbar */}
        <Flex justify="space-between" align="center" p="md" wrap="wrap" gap="sm" style={{ borderBottom: "1px solid #f1f3f5" }}>
          <TextInput
            placeholder="Cari kode, nama, kontak, atau kota..."
            leftSection={<Icon icon="ph:magnifying-glass" className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            w={320}
            size="sm"
            radius="md"
          />
          <Text size="xs" c="dimmed">
            Total {pagination.total || filteredData.length} supplier
          </Text>
        </Flex>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                <th style={tableHeadStyle}>Kode</th>
                <th style={tableHeadStyle}>Supplier</th>
                <th style={tableHeadStyle}>Tipe</th>
                <th style={tableHeadStyle}>Kontak Person</th>
                <th style={tableHeadStyle}>Telepon / WA</th>
                <th style={tableHeadStyle}>Lokasi</th>
                <th style={tableHeadStyle}>Terms</th>
                <th style={tableHeadStyle}>Status</th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                    <Text c="dimmed" size="sm">
                      {loading.includes("getdata") ? "Memuat data..." : "Belum ada data supplier."}
                    </Text>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #f1f3f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafd")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <td style={tableCellStyle}>
                      <Badge variant="light" color="blue" radius="sm">
                        {item.supplier_code || "-"}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>
                      <Text fw={600} size="sm" c="gray.9">
                        {item.supplier_name}
                      </Text>
                      {item.email && (
                        <Text size="xs" c="dimmed">
                          {item.email}
                        </Text>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <Badge variant="outline" color={item.supplier_type === "COMPANY" ? "indigo" : "teal"} size="sm">
                        {item.supplier_type || "COMPANY"}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm">{item.contact_person || "-"}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm">{item.phone || "-"}</Text>
                      {item.whatsapp && item.whatsapp !== item.phone && (
                        <Text size="xs" c="green.7">
                          WA: {item.whatsapp}
                        </Text>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm">{item.city || "-"}</Text>
                      <Text size="xs" c="dimmed">
                        {item.province || item.country || "Indonesia"}
                      </Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm" fw={500}>
                        {item.payment_terms || "NET 30"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.lead_time_days ? `${item.lead_time_days} hari` : "-"}
                      </Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge color={item.is_active ? "green" : "gray"} variant="filled" size="sm">
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Tooltip label="Edit Supplier" withArrow>
                        <ActionIcon variant="light" color="blue" onClick={() => handleOpenEdit(item)}>
                          <Icon icon="ph:pencil-simple-bold" />
                        </ActionIcon>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <Flex justify="flex-end" p="md" style={{ borderTop: "1px solid #f1f3f5" }}>
            <Pagination
              value={page}
              onChange={(newPage) => setPage(newPage)}
              total={pagination.last_page}
              size="sm"
              radius="md"
            />
          </Flex>
        )}
      </Card>

      {/* Modal Form Tambah / Edit */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Text fw={700} size="md">
            {selectedSupplier ? "Edit Supplier" : "Tambah Supplier Baru"}
          </Text>
        }
        size="lg"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <Group grow align="flex-start">
              <Select
                label="Tipe Supplier"
                data={[
                  { value: "COMPANY", label: "Perusahaan (COMPANY)" },
                  { value: "INDIVIDUAL", label: "Individu (INDIVIDUAL)" },
                ]}
                {...form.getInputProps("supplier_type")}
              />
              <TextInput
                label="Nama Supplier"
                required
                placeholder="PT Supplier Indonesia"
                {...form.getInputProps("supplier_name")}
              />
            </Group>

            <Group grow align="flex-start">
              <TextInput
                label="Contact Person"
                required
                placeholder="Nama kontak"
                {...form.getInputProps("contact_person")}
              />
              <TextInput
                label="Email"
                type="email"
                required
                placeholder="email@supplier.com"
                {...form.getInputProps("email")}
              />
            </Group>

            <Group grow align="flex-start">
              <TextInput
                label="Nomor Telepon"
                required
                placeholder="081234567890"
                {...form.getInputProps("phone")}
              />
              <TextInput
                label="WhatsApp"
                placeholder="081234567890"
                {...form.getInputProps("whatsapp")}
              />
            </Group>

            <Textarea
              label="Alamat Lengkap"
              placeholder="Jl. Sudirman No. 20"
              minRows={2}
              {...form.getInputProps("address")}
            />

            <Group grow align="flex-start">
              <TextInput
                label="Provinsi"
                placeholder="DKI Jakarta"
                {...form.getInputProps("province")}
              />
              <TextInput
                label="Kota"
                placeholder="Jakarta Selatan"
                {...form.getInputProps("city")}
              />
            </Group>

            <Group grow align="flex-start">
              <TextInput
                label="Kecamatan (District)"
                placeholder="Kebayoran Baru"
                {...form.getInputProps("district")}
              />
              <TextInput
                label="Kode Pos"
                placeholder="12190"
                {...form.getInputProps("postal_code")}
              />
              <TextInput
                label="Negara"
                placeholder="Indonesia"
                {...form.getInputProps("country")}
              />
            </Group>

            <Group grow align="flex-start">
              <TextInput
                label="Syarat Pembayaran (Payment Terms)"
                placeholder="NET 30"
                {...form.getInputProps("payment_terms")}
              />
              <NumberInput
                label="Lead Time (Hari)"
                placeholder="10"
                min={0}
                {...form.getInputProps("lead_time_days")}
              />
            </Group>

            {!selectedSupplier && (
              <>
                <Group grow align="flex-start">
                  <TextInput
                    label="Website"
                    placeholder="https://supplier.example.com"
                    {...form.getInputProps("website")}
                  />
                  <TextInput
                    label="NPWP"
                    placeholder="01.234.567.8-012.000"
                    {...form.getInputProps("npwp")}
                  />
                </Group>
                <TextInput
                  label="Nama Pajak (Tax Name)"
                  placeholder="PT Supplier Indonesia"
                  {...form.getInputProps("tax_name")}
                />
                <Textarea
                  label="Catatan Tambahan"
                  placeholder="Keterangan kebutuhan merchandise..."
                  minRows={2}
                  {...form.getInputProps("notes")}
                />
              </>
            )}

            <Paper p="xs" withBorder radius="sm" bg="gray.0" mt="xs">
              <Switch
                label="Status Aktif"
                description="Nonaktifkan jika supplier sudah tidak bekerjasama"
                checked={form.values.is_active}
                onChange={(e) => form.setFieldValue("is_active", e.currentTarget.checked)}
              />
            </Paper>

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Batal
              </Button>
              <Button type="submit" color="blue" loading={loading.includes("submit")}>
                Simpan
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
