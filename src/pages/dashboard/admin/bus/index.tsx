import { Delete, Get, Post, Put } from "@/utils/REST";
import {
  Flex, ActionIcon, Group, Modal,
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
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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
  const router = useRouter();
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
  const [editId, setEditId] = useState<number | null>(null);
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
    setEditId(null);
    setForm({ ...emptyForm });
    setOpened(true);
  };

  const handleOpenEdit = (item: BusItem) => {
    setIsEdit(true);
    setEditId(item.id);
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
      if (isEdit && editId) {
        await Put(`shuttlebuses/${editId}`, form);
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
      <Flex justify="space-between" align="center" mb={8}>
        <Flex align="center" gap={12}>
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label="Kembali ke Dashboard Admin"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <Stack gap={4}>
            <Text size="1.7rem" fw={700} style={{ color: "#0B387C", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon icon="ph:van-bold" />
              List Bus
            </Text>
            <Text size="sm" c="gray">Kelola armada bus untuk layanan shuttle</Text>
          </Stack>
        </Flex>
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

      <div className="mt-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 p-4 md:p-5">
          {loading ? (
            <>
              <div className="w-full bg-gray-100 rounded-xl animate-pulse h-64" />
              <div className="w-full bg-gray-100 rounded-xl animate-pulse h-64" />
              <div className="w-full bg-gray-100 rounded-xl animate-pulse h-64" />
              <div className="w-full bg-gray-100 rounded-xl animate-pulse h-64" />
            </>
          ) : sortedData.length === 0 ? (
            <div className="col-span-full border border-primary-light-200 flex flex-col items-center justify-center min-h-[40vh] rounded-md gap-3 text-center text-dark px-5">
              <Icon icon="ph:van-duotone" style={{ fontSize: 40, color: "#ccc" }} />
              <h3 className="text-xl font-semibold">Tidak ada data bus</h3>
            </div>
          ) : (
            sortedData.map((item) => (
              <div key={item.id} className="w-full bg-white rounded-xl shadow-md border border-primary-light-200 overflow-hidden">
                <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center">
                  <Icon icon="ph:van-bold" style={{ fontSize: 44, color: "#ccc" }} />
                  <div className="absolute right-2 top-2">
                    <Badge variant="filled" size="sm" color={item.status ? "green" : "gray"} radius="sm">
                      {item.status ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h5 className="text-lg font-semibold text-dark truncate">{item.bus_name}</h5>
                  <p className="text-grey text-sm font-mono">{item.bus_code}</p>
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="text-dark font-medium font-mono">{item.plate_number}</span>
                    <Badge variant="light" color={busTypeColor[item.bus_type] || "gray"} size="xs" radius="sm">
                      {item.bus_type?.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-grey text-sm mt-1">{item.seat_layout?.replace("_", "-")} layout • <b className="text-primary-base">{item.total_seat}</b> kursi</p>
                  <Group gap={4} wrap="wrap" mt={8}>
                    {(Array.isArray(item.facilities) ? item.facilities : []).slice(0, 3).map((f, idx) => (
                      <Badge key={idx} size="xs" variant="outline" color="gray">{f}</Badge>
                    ))}
                    {(Array.isArray(item.facilities) ? item.facilities : []).length > 3 && (
                      <Badge size="xs" variant="outline" color="gray">+{item.facilities.length - 3}</Badge>
                    )}
                  </Group>
                  <div className="mt-4 pt-3 border-t-1.5 border-dashed border-primary-light-200 flex items-center justify-end">
                    <Group gap={4}>
                      <Tooltip label="Lihat Detail">
                        <ActionIcon variant="transparent" color="cyan" onClick={() => handleOpenView(item)}>
                          <Icon icon="ph:eye" style={{ fontSize: 18 }} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Edit Bus">
                        <ActionIcon variant="transparent" color="gray" onClick={() => handleOpenEdit(item)}>
                          <Icon icon="ph:pencil-simple" style={{ fontSize: 18 }} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Hapus Bus">
                        <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id, item.bus_name)}>
                          <Icon icon="ph:trash" style={{ fontSize: 18 }} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </div>
                </div>
              </div>
            ))
          )}
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
      </div>

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
