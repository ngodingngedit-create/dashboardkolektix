import { Delete, Get, Post, Put } from "@/utils/REST";
import {
  Card, Flex, ActionIcon, Group, Modal,
  Tooltip, Text, Badge, Pagination as PaginationM,
  Button as ButtonM, Stack, TextInput, NumberInput, Switch, MultiSelect
} from "@mantine/core";
import { Input } from "@nextui-org/react";
import React, { useEffect, useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { Icon } from "@iconify/react/dist/iconify.js";
import { modals } from "@mantine/modals";
import moment from "moment";

const PER_PAGE = 10;

const tableHeadStyle: React.CSSProperties = {
  padding: "12px 15px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: "#495057",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tableCellStyle: React.CSSProperties = {
  padding: "10px 15px",
  fontSize: "13px",
  color: "#495057",
  verticalAlign: "middle",
};

interface BusItem {
  id: number;
  slug: string;
  plate_number: string;
  operator_id: number;
  bus_name: string;
  bus_code: string;
  bus_type: string;
  seat_layout: string;
  total_seat: number;
  facilities: string[];
  status: number;
  created_at?: string;
}

const busTypeOptions = [
  { value: "MINIBUS", label: "Minibus" },
  { value: "MEDIUM_BUS", label: "Medium Bus" },
  { value: "BIG_BUS", label: "Big Bus" },
];

const seatLayoutOptions = [
  { value: "2_1", label: "2-1 (12 kursi)" },
  { value: "2_2", label: "2-2 (29 kursi)" },
  { value: "2_3", label: "2-3 (59 kursi)" },
];

const facilitiesOptions = ["AC", "WiFi", "WIFI", "USB Charger", "USB CHARGER", "Reclining Seat", "TOILET", "TV", "Blanket"];

const emptyForm = {
  plate_number: "",
  operator_id: 1,
  bus_name: "",
  bus_code: "",
  bus_type: "MINIBUS",
  seat_layout: "2_1",
  total_seat: 12,
  facilities: [] as string[],
  status: 1,
};

export default function AdminBusManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BusItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const [sortBy, setSortBy] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [opened, setOpened] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BusItem | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const sortedData = useMemo(() => {
    let result = [...data];
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      result = result.filter(item =>
        item.bus_name?.toLowerCase().includes(needle) ||
        item.bus_code?.toLowerCase().includes(needle) ||
        item.plate_number?.toLowerCase().includes(needle)
      );
    }
    if (!sortBy) return result;
    return result.sort((a: any, b: any) => {
      let valA = a[sortBy] ?? "";
      let valB = b[sortBy] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortDir, debouncedSearch]);

  useEffect(() => { fetchData(); }, [page, debouncedSearch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await Get(`shuttlebuses`, {});
      if (res.data) {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      notifications.show({ title: "Gagal", message: "Gagal mengambil data bus.", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditSlug(null);
    setForm({ ...emptyForm });
    setOpened(true);
  };

  const handleOpenEdit = (item: BusItem) => {
    setIsEdit(true);
    setEditSlug(item.slug);
    setForm({
      plate_number: item.plate_number || "",
      operator_id: item.operator_id || 1,
      bus_name: item.bus_name || "",
      bus_code: item.bus_code || "",
      bus_type: item.bus_type || "MINIBUS",
      seat_layout: item.seat_layout || "2_1",
      total_seat: item.total_seat || 12,
      facilities: Array.isArray(item.facilities) ? item.facilities : [],
      status: item.status ?? 1,
    });
    setOpened(true);
  };

  const handleOpenView = (item: BusItem) => {
    setSelectedItem(item);
    setViewOpened(true);
  };

  const handleSubmit = async () => {
    if (!form.bus_name || !form.plate_number) {
      notifications.show({ title: "Validasi", message: "Nama bus dan nomor plat wajib diisi.", color: "orange" });
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit && editSlug) {
        await Put(`shuttlebuses/${editSlug}`, form);
        notifications.show({ title: "Berhasil", message: "Bus berhasil diupdate.", color: "green" });
      } else {
        await Post("shuttlebuses", form);
        notifications.show({ title: "Berhasil", message: "Bus berhasil ditambahkan.", color: "green" });
      }
      setOpened(false);
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menyimpan bus.";
      notifications.show({ title: "Gagal", message: msg, color: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    modals.openConfirmModal({
      title: "Hapus Bus",
      centered: true,
      children: <Text size="sm">Yakin ingin menghapus bus <b>{name}</b>? Tindakan ini tidak dapat dibatalkan.</Text>,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setLoading(true);
        try {
          await Delete(`shuttlebuses/${id}`, {});
          notifications.show({ title: "Berhasil", message: "Bus berhasil dihapus.", color: "green" });
          fetchData();
        } catch {
          notifications.show({ title: "Gagal", message: "Gagal menghapus bus.", color: "red" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const busTypeColor: Record<string, string> = {
    MINIBUS: "violet",
    MEDIUM_BUS: "blue",
    BIG_BUS: "teal",
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortBy === col
      ? <span style={{ marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
      : <span style={{ marginLeft: 4, opacity: 0.3 }}>↑</span>;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
      <Flex justify="space-between" align="center" mb={10}>
        <Stack gap={4}>
          <Text size="1.7rem" fw={700} style={{ color: "#0B387C" }}>
            <Icon icon="ph:van-bold" style={{ marginRight: 8, verticalAlign: "middle" }} />
            List Bus
          </Text>
          <Text size="sm" c="gray">Kelola armada bus untuk layanan shuttle</Text>
        </Stack>
        <ButtonM
          color="blue"
          leftSection={<Icon icon="ph:plus-bold" />}
          radius="md"
          size="md"
          onClick={handleOpenCreate}
        >
          Tambah Bus
        </ButtonM>
      </Flex>

      <Card withBorder radius="md" p={0} className="shadow-sm overflow-hidden">
        <Flex justify="space-between" align="center" gap={12} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <Text size="sm" fw={600} c="gray.7">Total: <b>{total}</b> bus</Text>
          <div style={{ width: 280 }}>
            <Input
              isClearable
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Cari nama, kode, atau plat..."
              size="sm"
              startContent={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
              classNames={{ input: "bg-[#f1f3f5] border-none" }}
            />
          </div>
        </Flex>

        <div className="w-full bg-white overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e8e8e8" }}>
                <th style={{ ...tableHeadStyle, width: 50, textAlign: "center" }}>No</th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("bus_name")}>
                  Nama Bus <SortIcon col="bus_name" />
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("plate_number")}>
                  Plat <SortIcon col="plate_number" />
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("bus_type")}>
                  Tipe <SortIcon col="bus_type" />
                </th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Kursi</th>
                <th style={{ ...tableHeadStyle }}>Fasilitas</th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Status</th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: "center" }}>
                    <Text c="dimmed">Memuat data...</Text>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: "center" }}>
                    <Stack align="center" gap={8}>
                      <Icon icon="ph:van-duotone" style={{ fontSize: 40, color: "#ccc" }} />
                      <Text c="dimmed">Tidak ada data bus</Text>
                    </Stack>
                  </td>
                </tr>
              ) : (
                sortedData.map((item, i) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafd")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Text size="sm" c="dimmed">{(page - 1) * PER_PAGE + i + 1}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm" fw={700}>{item.bus_name}</Text>
                      <Text size="xs" c="dimmed" ff="monospace">{item.bus_code}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm" fw={600} ff="monospace">{item.plate_number}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge variant="light" color={busTypeColor[item.bus_type] || "gray"} size="sm" radius="sm">
                        {item.bus_type?.replace("_", " ")}
                      </Badge>
                      <Text size="xs" c="dimmed" mt={2}>{item.seat_layout?.replace("_", "-")} layout</Text>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Text size="sm" fw={700} c="#0B387C">{item.total_seat}</Text>
                      <Text size="xs" c="dimmed">kursi</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Group gap={4} wrap="wrap">
                        {(Array.isArray(item.facilities) ? item.facilities : []).slice(0, 3).map((f, idx) => (
                          <Badge key={idx} size="xs" variant="outline" color="gray">{f}</Badge>
                        ))}
                        {(Array.isArray(item.facilities) ? item.facilities : []).length > 3 && (
                          <Badge size="xs" variant="outline" color="gray">+{item.facilities.length - 3}</Badge>
                        )}
                      </Group>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Badge variant="filled" size="sm" color={item.status ? "green" : "gray"} radius="sm">
                        {item.status ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Group gap={6} justify="center">
                        <Tooltip label="Lihat Detail">
                          <ActionIcon variant="filled" color="cyan" size="md" radius="sm" onClick={() => handleOpenView(item)}>
                            <Icon icon="ph:eye" style={{ fontSize: 16 }} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit Bus">
                          <ActionIcon variant="filled" color="indigo" size="md" radius="sm" onClick={() => handleOpenEdit(item)}>
                            <Icon icon="ph:pencil-simple" style={{ fontSize: 16 }} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Bus">
                          <ActionIcon variant="filled" color="red" size="md" radius="sm" onClick={() => handleDelete(item.id, item.bus_name)}>
                            <Icon icon="ph:trash" style={{ fontSize: 16 }} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > PER_PAGE && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", background: "white" }}>
            <PaginationM
              total={Math.ceil(total / PER_PAGE)}
              value={page}
              onChange={setPage}
              color="#0B387C"
              size="sm"
              radius="md"
            />
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Text fw={700} size="lg" c="#0B387C">{isEdit ? "Edit Bus" : "Tambah Bus Baru"}</Text>}
        size="lg"
        centered
        padding="xl"
        radius="md"
      >
        <Stack gap="md">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput
              label="Nama Bus"
              placeholder="Hiace Premium Jakarta"
              value={form.bus_name}
              onChange={e => setForm(f => ({ ...f, bus_name: e.target.value }))}
              required
            />
            <TextInput
              label="Kode Bus"
              placeholder="HC001"
              value={form.bus_code}
              onChange={e => setForm(f => ({ ...f, bus_code: e.target.value }))}
            />
            <TextInput
              label="Nomor Plat"
              placeholder="B 1234 XYZ"
              value={form.plate_number}
              onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))}
              required
            />
            <NumberInput
              label="Operator ID"
              value={form.operator_id}
              onChange={v => setForm(f => ({ ...f, operator_id: Number(v) }))}
              min={1}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <Text size="xs" fw={700} c="gray.6" mb={4} className="uppercase">Tipe Bus</Text>
              <select
                value={form.bus_type}
                onChange={e => setForm(f => ({ ...f, bus_type: e.target.value }))}
                style={{ width: "100%", height: 36, background: "#f1f3f5", border: "1px solid #ced4da", borderRadius: 6, padding: "0 10px", fontSize: 13 }}
              >
                {busTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <Text size="xs" fw={700} c="gray.6" mb={4} className="uppercase">Layout Kursi</Text>
              <select
                value={form.seat_layout}
                onChange={e => setForm(f => ({ ...f, seat_layout: e.target.value }))}
                style={{ width: "100%", height: 36, background: "#f1f3f5", border: "1px solid #ced4da", borderRadius: 6, padding: "0 10px", fontSize: 13 }}
              >
                {seatLayoutOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <NumberInput
              label="Total Kursi"
              value={form.total_seat}
              onChange={v => setForm(f => ({ ...f, total_seat: Number(v) }))}
              min={1}
            />
          </div>

          <MultiSelect
            label="Fasilitas"
            placeholder="Pilih fasilitas"
            data={facilitiesOptions}
            value={form.facilities}
            onChange={v => setForm(f => ({ ...f, facilities: v }))}
            searchable
            clearable
          />

          <Group align="center">
            <Switch
              label="Status Aktif"
              checked={form.status === 1}
              onChange={e => setForm(f => ({ ...f, status: e.currentTarget.checked ? 1 : 0 }))}
              color="blue"
            />
          </Group>

          <Group justify="flex-end" mt="md" gap={10}>
            <ButtonM variant="subtle" color="gray" onClick={() => setOpened(false)}>Batal</ButtonM>
            <ButtonM
              color="blue"
              leftSection={<Icon icon={isEdit ? "ph:floppy-disk" : "ph:plus-bold"} />}
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              {isEdit ? "Simpan Perubahan" : "Tambah Bus"}
            </ButtonM>
          </Group>
        </Stack>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        opened={viewOpened}
        onClose={() => setViewOpened(false)}
        title={<Text fw={700} size="lg" c="#0B387C">Detail Bus</Text>}
        size="md"
        centered
        padding="xl"
        radius="md"
      >
        {selectedItem && (
          <Stack gap="md">
            <div style={{ background: "#f8fafd", borderRadius: 12, padding: 20, border: "1px solid #e8edf5" }}>
              <Group gap="md">
                <div style={{
                  width: 56, height: 56, borderRadius: 12, background: "#0B387C22",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Icon icon="ph:van-bold" style={{ fontSize: 28, color: "#0B387C" }} />
                </div>
                <div>
                  <Text size="lg" fw={700}>{selectedItem.bus_name}</Text>
                  <Text size="sm" c="dimmed" ff="monospace">{selectedItem.bus_code} • {selectedItem.plate_number}</Text>
                </div>
                <Badge color={selectedItem.status ? "green" : "gray"} variant="filled" size="sm" ml="auto">
                  {selectedItem.status ? "Aktif" : "Nonaktif"}
                </Badge>
              </Group>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Tipe</Text>
                <Badge variant="light" color={selectedItem.bus_type === "MINIBUS" ? "violet" : selectedItem.bus_type === "MEDIUM_BUS" ? "blue" : "teal"} size="sm">
                  {selectedItem.bus_type?.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Layout</Text>
                <Text size="sm" fw={600}>{selectedItem.seat_layout?.replace("_", "-")}</Text>
              </div>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Total Kursi</Text>
                <Text size="sm" fw={700} c="#0B387C">{selectedItem.total_seat} kursi</Text>
              </div>
            </div>

            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase" mb={6}>Fasilitas</Text>
              <Group gap={6}>
                {(Array.isArray(selectedItem.facilities) ? selectedItem.facilities : []).map((f, i) => (
                  <Badge key={i} size="sm" variant="outline" color="gray">{f}</Badge>
                ))}
              </Group>
            </div>

            {selectedItem.created_at && (
              <Text size="xs" c="dimmed">Dibuat: {moment(selectedItem.created_at).format("DD MMM YYYY HH:mm")}</Text>
            )}

            <Group justify="flex-end" mt="xs">
              <ButtonM variant="subtle" color="gray" onClick={() => setViewOpened(false)}>Tutup</ButtonM>
              <ButtonM
                color="indigo"
                leftSection={<Icon icon="ph:pencil-simple" />}
                onClick={() => { setViewOpened(false); handleOpenEdit(selectedItem); }}
              >
                Edit
              </ButtonM>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
