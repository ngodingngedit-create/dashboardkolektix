import { Delete, Get, Post, Put } from "@/utils/REST";
import {
  Card, Flex, ActionIcon, Group, Modal,
  Tooltip, Text, Badge, Pagination as PaginationM,
  Button as ButtonM, Stack, TextInput, NumberInput, Switch
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

interface RouteItem {
  id: number;
  slug?: string;
  route_name: string;
  origin_name: string;
  destination_name: string;
  distance_km: number;
  duration_minutes: number;
  status: number;
  created_at?: string;
}

const emptyForm = {
  route_name: "",
  origin_name: "",
  destination_name: "",
  distance_km: 0,
  duration_minutes: 0,
  status: 1,
};

export default function AdminRouteManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RouteItem[]>([]);
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
  const [selectedItem, setSelectedItem] = useState<RouteItem | null>(null);
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
        item.route_name?.toLowerCase().includes(needle) ||
        item.origin_name?.toLowerCase().includes(needle) ||
        item.destination_name?.toLowerCase().includes(needle)
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
      const res: any = await Get(`shuttleroutes`, {});
      if (res.data) {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      notifications.show({ title: "Gagal", message: "Gagal mengambil data rute.", color: "red" });
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

  const handleOpenEdit = async (item: RouteItem) => {
    setIsEdit(true);
    setEditSlug(item.slug || String(item.id));
    setForm({
      route_name: item.route_name || "",
      origin_name: item.origin_name || "",
      destination_name: item.destination_name || "",
      distance_km: item.distance_km || 0,
      duration_minutes: item.duration_minutes || 0,
      status: item.status ?? 1,
    });
    setOpened(true);
  };

  const handleOpenView = async (item: RouteItem) => {
    if (item.slug) {
      setLoading(true);
      try {
        const res: any = await Get(`shuttleroutes/${item.slug}`, {});
        setSelectedItem(res.data || res);
      } catch {
        setSelectedItem(item);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedItem(item);
    }
    setViewOpened(true);
  };

  const handleSubmit = async () => {
    if (!form.route_name || !form.origin_name || !form.destination_name) {
      notifications.show({ title: "Validasi", message: "Nama rute, asal, dan tujuan wajib diisi.", color: "orange" });
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit && editSlug) {
        await Put(`shuttleroutes/${editSlug}`, form);
        notifications.show({ title: "Berhasil", message: "Rute berhasil diupdate.", color: "green" });
      } else {
        await Post("shuttleroutes", form);
        notifications.show({ title: "Berhasil", message: "Rute berhasil ditambahkan.", color: "green" });
      }
      setOpened(false);
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menyimpan rute.";
      notifications.show({ title: "Gagal", message: msg, color: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item: RouteItem) => {
    modals.openConfirmModal({
      title: "Hapus Rute",
      centered: true,
      children: <Text size="sm">Yakin ingin menghapus rute <b>{item.route_name}</b>? Tindakan ini tidak dapat dibatalkan.</Text>,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setLoading(true);
        try {
          await Delete(`shuttleroutes/${item.id}`, {});
          notifications.show({ title: "Berhasil", message: "Rute berhasil dihapus.", color: "green" });
          fetchData();
        } catch {
          notifications.show({ title: "Gagal", message: "Gagal menghapus rute.", color: "red" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
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
            <Icon icon="ph:path-bold" style={{ marginRight: 8, verticalAlign: "middle" }} />
            List Rute
          </Text>
          <Text size="sm" c="gray">Kelola rute perjalanan shuttle</Text>
        </Stack>
        <ButtonM
          color="blue"
          leftSection={<Icon icon="ph:plus-bold" />}
          radius="md"
          size="md"
          onClick={handleOpenCreate}
        >
          Tambah Rute
        </ButtonM>
      </Flex>

      <Card withBorder radius="md" p={0} className="shadow-sm overflow-hidden">
        <Flex justify="space-between" align="center" gap={12} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <Text size="sm" fw={600} c="gray.7">Total: <b>{total}</b> rute</Text>
          <div style={{ width: 280 }}>
            <Input
              isClearable
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Cari rute, asal, tujuan..."
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
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("route_name")}>
                  Nama Rute <SortIcon col="route_name" />
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("origin_name")}>
                  Asal → Tujuan <SortIcon col="origin_name" />
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer", textAlign: "center" }} onClick={() => handleSort("distance_km")}>
                  Jarak <SortIcon col="distance_km" />
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer", textAlign: "center" }} onClick={() => handleSort("duration_minutes")}>
                  Durasi <SortIcon col="duration_minutes" />
                </th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Status</th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: "center" }}>
                    <Text c="dimmed">Memuat data...</Text>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: "center" }}>
                    <Stack align="center" gap={8}>
                      <Icon icon="ph:path-duotone" style={{ fontSize: 40, color: "#ccc" }} />
                      <Text c="dimmed">Tidak ada data rute</Text>
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
                      <Text size="sm" fw={700}>{item.route_name}</Text>
                      {item.slug && <Text size="xs" c="dimmed" ff="monospace">{item.slug}</Text>}
                    </td>
                    <td style={tableCellStyle}>
                      <Group gap={6} wrap="nowrap" align="center">
                        <div style={{
                          background: "#e8f4fd", borderRadius: 6, padding: "2px 8px",
                          fontSize: 12, fontWeight: 600, color: "#1971c2"
                        }}>
                          {item.origin_name}
                        </div>
                        <Icon icon="ph:arrow-right-bold" style={{ color: "#aaa", flexShrink: 0 }} />
                        <div style={{
                          background: "#e9fbe9", borderRadius: 6, padding: "2px 8px",
                          fontSize: 12, fontWeight: 600, color: "#2f9e44"
                        }}>
                          {item.destination_name}
                        </div>
                      </Group>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Text size="sm" fw={600}>{item.distance_km} km</Text>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Text size="sm" fw={600}>{formatDuration(item.duration_minutes)}</Text>
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
                        <Tooltip label="Edit Rute">
                          <ActionIcon variant="filled" color="indigo" size="md" radius="sm" onClick={() => handleOpenEdit(item)}>
                            <Icon icon="ph:pencil-simple" style={{ fontSize: 16 }} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Rute">
                          <ActionIcon variant="filled" color="red" size="md" radius="sm" onClick={() => handleDelete(item)}>
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
        title={<Text fw={700} size="lg" c="#0B387C">{isEdit ? "Edit Rute" : "Tambah Rute Baru"}</Text>}
        size="md"
        centered
        padding="xl"
        radius="md"
      >
        <Stack gap="md">
          <TextInput
            label="Nama Rute"
            placeholder="Jakarta - Bandung"
            value={form.route_name}
            onChange={e => setForm(f => ({ ...f, route_name: e.target.value }))}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput
              label="Kota Asal"
              placeholder="Jakarta"
              value={form.origin_name}
              onChange={e => setForm(f => ({ ...f, origin_name: e.target.value }))}
              required
            />
            <TextInput
              label="Kota Tujuan"
              placeholder="Bandung"
              value={form.destination_name}
              onChange={e => setForm(f => ({ ...f, destination_name: e.target.value }))}
              required
            />
            <NumberInput
              label="Jarak (km)"
              placeholder="150.5"
              value={form.distance_km}
              onChange={v => setForm(f => ({ ...f, distance_km: Number(v) }))}
              min={0}
              decimalScale={2}
            />
            <NumberInput
              label="Durasi (menit)"
              placeholder="180"
              value={form.duration_minutes}
              onChange={v => setForm(f => ({ ...f, duration_minutes: Number(v) }))}
              min={0}
            />
          </div>

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
              {isEdit ? "Simpan Perubahan" : "Tambah Rute"}
            </ButtonM>
          </Group>
        </Stack>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        opened={viewOpened}
        onClose={() => setViewOpened(false)}
        title={<Text fw={700} size="lg" c="#0B387C">Detail Rute</Text>}
        size="md"
        centered
        padding="xl"
        radius="md"
      >
        {selectedItem && (
          <Stack gap="lg">
            <div style={{ background: "#f8fafd", borderRadius: 12, padding: 20, border: "1px solid #e8edf5" }}>
              <Text size="lg" fw={700} mb={8}>{selectedItem.route_name}</Text>
              <Group gap={8} align="center">
                <div style={{ background: "#e8f4fd", borderRadius: 8, padding: "6px 14px", fontWeight: 700, color: "#1971c2", fontSize: 14 }}>
                  {selectedItem.origin_name}
                </div>
                <Icon icon="ph:arrow-right-bold" style={{ color: "#aaa", fontSize: 20 }} />
                <div style={{ background: "#e9fbe9", borderRadius: 8, padding: "6px 14px", fontWeight: 700, color: "#2f9e44", fontSize: 14 }}>
                  {selectedItem.destination_name}
                </div>
              </Group>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ textAlign: "center", background: "#f1f3f5", borderRadius: 10, padding: 14 }}>
                <Icon icon="ph:road-horizon-bold" style={{ fontSize: 24, color: "#0B387C", marginBottom: 4 }} />
                <Text size="lg" fw={800} c="#0B387C">{selectedItem.distance_km}</Text>
                <Text size="xs" c="dimmed">km</Text>
              </div>
              <div style={{ textAlign: "center", background: "#f1f3f5", borderRadius: 10, padding: 14 }}>
                <Icon icon="ph:clock-countdown-bold" style={{ fontSize: 24, color: "#0B387C", marginBottom: 4 }} />
                <Text size="lg" fw={800} c="#0B387C">{formatDuration(selectedItem.duration_minutes)}</Text>
                <Text size="xs" c="dimmed">durasi</Text>
              </div>
              <div style={{ textAlign: "center", background: "#f1f3f5", borderRadius: 10, padding: 14 }}>
                <Icon icon="ph:check-circle-bold" style={{ fontSize: 24, color: selectedItem.status ? "#2f9e44" : "#aaa", marginBottom: 4 }} />
                <Text size="sm" fw={700} c={selectedItem.status ? "green" : "gray"}>
                  {selectedItem.status ? "Aktif" : "Nonaktif"}
                </Text>
                <Text size="xs" c="dimmed">status</Text>
              </div>
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
