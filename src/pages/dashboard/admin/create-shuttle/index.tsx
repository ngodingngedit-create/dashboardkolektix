import { Delete, Get, Post, Put } from "@/utils/REST";
import {
  Card, Flex, ActionIcon, Group, Modal,
  Tooltip, Text, Badge, Pagination as PaginationM,
  Button as ButtonM, Stack, TextInput, Textarea, Box, Switch, NumberInput
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { Input } from "@nextui-org/react";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { Icon } from "@iconify/react/dist/iconify.js";
import { modals } from "@mantine/modals";
import moment from "moment";
import Seatmap, { defaultSeatmapData } from "@/components/Seatmap";
import { SeatmapData } from "@/utils/formInterface";
import { Context as CreateEventContext } from "@/pages/dashboard/create-event";

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

interface ShuttleItem {
  id: number;
  slug: string;
  slug_url: string;
  event_id: number;
  name: string;
  description: string;
  terms: string;
  image: string;
  image_url?: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  is_active: number;
  payment_method_custom: string;
  seatmap: string;
  created_at?: string;
  is_name?: number;
  is_email?: number;
  is_phone?: number;
  is_noidentity?: number;
}

const emptyForm = {
  slug: "",
  slug_url: "",
  event_id: 1,
  shuttle_trips: 1,
  name: "",
  description: "",
  terms: "",
  start_date: "",
  start_time: "08:00:00",
  end_date: "",
  end_time: "12:00:00",
  is_active: 1,
  payment_method_custom: "QRIS,BCA,MANDIRI",
  seatmap: "",
  image_base64: "",
};

export default function AdminCreateShuttle() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ShuttleItem[]>([]);
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
  const [selectedItem, setSelectedItem] = useState<ShuttleItem | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Seatmap editor state
  const [seatmapData, setSeatmapData] = useListState<SeatmapData>(defaultSeatmapData);
  const [seatmapModalOpen, setSeatmapModalOpen] = useState(false);
  const [isFullscreenSeatmap, setIsFullscreenSeatmap] = useState(false);
  const seatmapRef = useRef<any>(null);

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const sortedData = useMemo(() => {
    let result = [...data];
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      result = result.filter(item =>
        item.name?.toLowerCase().includes(needle) ||
        item.slug?.toLowerCase().includes(needle) ||
        item.description?.toLowerCase().includes(needle)
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
      const res: any = await Get(`shuttle`, {});
      if (res.data) {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      notifications.show({ title: "Gagal", message: "Gagal mengambil data shuttle.", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditSlug(null);
    setForm({ ...emptyForm });
    setImagePreview(null);
    setSeatmapData.setState(defaultSeatmapData);
    setOpened(true);
  };

  const handleOpenEdit = async (slug: string) => {
    setIsEdit(true);
    setEditSlug(slug);
    setLoading(true);
    try {
      const res: any = await Get(`shuttle/${slug}`, {});
      const item = res.data || res;
      setForm({
        slug: item.slug || "",
        slug_url: item.slug_url || "",
        event_id: item.event_id || 1,
        shuttle_trips: 1,
        name: item.name || "",
        description: item.description || "",
        terms: item.terms || "",
        start_date: item.start_date ? item.start_date.substring(0, 10) : "",
        start_time: item.start_time || "08:00:00",
        end_date: item.end_date ? item.end_date.substring(0, 10) : "",
        end_time: item.end_time || "12:00:00",
        is_active: item.is_active ?? 1,
        payment_method_custom: item.payment_method_custom || "",
        seatmap: item.seatmap || "",
        image_base64: "",
      });
      setImagePreview(item.image_url || null);

      // Parse & load seatmap into editor
      if (item.seatmap) {
        try {
          const parsed = typeof item.seatmap === "string" ? JSON.parse(item.seatmap) : item.seatmap;
          setSeatmapData.setState(Array.isArray(parsed) ? parsed : defaultSeatmapData);
        } catch {
          setSeatmapData.setState(defaultSeatmapData);
        }
      } else {
        setSeatmapData.setState(defaultSeatmapData);
      }
    } catch {
      notifications.show({ title: "Gagal", message: "Gagal mengambil detail shuttle.", color: "red" });
    } finally {
      setLoading(false);
      setOpened(true);
    }
  };

  const handleOpenView = async (slug: string) => {
    setLoading(true);
    try {
      const res: any = await Get(`shuttle/${slug}`, {});
      setSelectedItem(res.data || res);
      setViewOpened(true);
    } catch {
      notifications.show({ title: "Gagal", message: "Gagal mengambil detail shuttle.", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setForm(f => ({ ...f, image_base64: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.slug || !form.name) {
      notifications.show({ title: "Validasi", message: "Slug dan nama wajib diisi.", color: "orange" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Serialize seatmap data to JSON string for the POST/PUT payload
      const seatmapJson = seatmapData.length > 0 ? JSON.stringify(seatmapData) : null;
      const payload: any = { ...form, seatmap: seatmapJson };
      if (!payload.image_base64) delete payload.image_base64;
      if (isEdit && editSlug) {
        await Put(`shuttle/${editSlug}`, payload);
        notifications.show({ title: "Berhasil", message: "Shuttle berhasil diupdate.", color: "green" });
      } else {
        await Post("shuttle", payload);
        notifications.show({ title: "Berhasil", message: "Shuttle berhasil dibuat.", color: "green" });
      }
      setOpened(false);
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menyimpan shuttle.";
      notifications.show({ title: "Gagal", message: msg, color: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    modals.openConfirmModal({
      title: "Hapus Shuttle",
      centered: true,
      children: <Text size="sm">Yakin ingin menghapus shuttle <b>{name}</b>? Tindakan ini tidak dapat dibatalkan.</Text>,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setLoading(true);
        try {
          await Delete(`shuttle/${id}`, {});
          notifications.show({ title: "Berhasil", message: "Shuttle berhasil dihapus.", color: "green" });
          fetchData();
        } catch {
          notifications.show({ title: "Gagal", message: "Gagal menghapus shuttle.", color: "red" });
        } finally {
          setLoading(false);
        }
      },
    });
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
            <Icon icon="ph:bus-bold" style={{ marginRight: 8, verticalAlign: "middle" }} />
            Event Shuttle
          </Text>
          <Text size="sm" c="gray">Kelola daftar event shuttle yang tersedia</Text>
        </Stack>
        <ButtonM
          color="blue"
          leftSection={<Icon icon="ph:plus-bold" />}
          radius="md"
          size="md"
          onClick={handleOpenCreate}
        >
          Tambah Shuttle
        </ButtonM>
      </Flex>

      <Card withBorder radius="md" p={0} className="shadow-sm overflow-hidden">
        <Flex justify="space-between" align="center" gap={12} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <Text size="sm" fw={600} c="gray.7">Total: <b>{total}</b> shuttle</Text>
          <div style={{ width: 280 }}>
            <Input
              isClearable
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Cari nama atau slug..."
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
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("name")}>
                  Nama <SortIcon col="name" />
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("slug")}>
                  Slug <SortIcon col="slug" />
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("start_date")}>
                  Tanggal <SortIcon col="start_date" />
                </th>
                <th style={{ ...tableHeadStyle }}>Metode Bayar</th>
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
                      <Icon icon="ph:bus-duotone" style={{ fontSize: 40, color: "#ccc" }} />
                      <Text c="dimmed">Tidak ada data shuttle</Text>
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
                      <Group gap="sm" wrap="nowrap">
                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: "#f0f0f0", flexShrink: 0 }}>
                          {item.image_url ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                              <Icon icon="ph:bus" style={{ fontSize: 20, color: "#ccc" }} />
                            </div>
                          )}
                        </div>
                        <div>
                          <Text size="sm" fw={700} lineClamp={1}>{item.name}</Text>
                          <Text size="xs" c="dimmed" lineClamp={1}>{item.description}</Text>
                        </div>
                      </Group>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="xs" c="dimmed" ff="monospace">{item.slug}</Text>
                      <Text size="xs" c="blue" ff="monospace">{item.slug_url}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="xs" fw={500}>{moment(item.start_date).format("DD MMM YYYY")}</Text>
                      <Text size="xs" c="dimmed">{item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Group gap={4} wrap="wrap">
                        {item.payment_method_custom?.split(",").map(m => (
                          <Badge key={m} size="xs" variant="light" color="blue">{m.trim()}</Badge>
                        ))}
                      </Group>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Badge
                        variant="filled"
                        size="sm"
                        color={item.is_active ? "green" : "gray"}
                        radius="sm"
                      >
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                      <Group gap={6} justify="center">
                        <Tooltip label="Lihat Detail">
                          <ActionIcon variant="filled" color="cyan" size="md" radius="sm" onClick={() => handleOpenView(item.slug)}>
                            <Icon icon="ph:eye" style={{ fontSize: 16 }} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit Shuttle">
                          <ActionIcon variant="filled" color="indigo" size="md" radius="sm" onClick={() => handleOpenEdit(item.slug)}>
                            <Icon icon="ph:pencil-simple" style={{ fontSize: 16 }} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Shuttle">
                          <ActionIcon variant="filled" color="red" size="md" radius="sm" onClick={() => handleDelete(item.id, item.name)}>
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
        title={<Text fw={700} size="lg" c="#0B387C">{isEdit ? "Edit Shuttle" : "Tambah Shuttle Baru"}</Text>}
        size="xl"
        centered
        padding="xl"
        radius="md"
      >
        <Stack gap="md">
          {/* Image Upload */}
          <Box>
            <Text size="xs" fw={700} c="gray.6" mb={6} className="uppercase">Gambar Shuttle</Text>
            <div
              style={{
                width: "100%", height: 160, borderRadius: 12, background: "#f1f3f5",
                border: "2px dashed #ced4da", cursor: "pointer", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </>
              ) : (
                <Stack align="center" gap={4}>
                  <Icon icon="ph:image-square-duotone" style={{ fontSize: 36, color: "#aaa" }} />
                  <Text size="xs" c="dimmed">Klik untuk upload gambar</Text>
                </Stack>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          </Box>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput
              label="Slug"
              placeholder="jakarta-bandung"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              required
            />
            <TextInput
              label="Slug URL"
              placeholder="jakarta-bandung-shuttle"
              value={form.slug_url}
              onChange={e => setForm(f => ({ ...f, slug_url: e.target.value }))}
            />
            <NumberInput
              label="Event ID"
              value={form.event_id}
              onChange={v => setForm(f => ({ ...f, event_id: Number(v) }))}
              min={1}
            />
            <NumberInput
              label="Shuttle Trips"
              value={form.shuttle_trips}
              onChange={v => setForm(f => ({ ...f, shuttle_trips: Number(v) }))}
              min={1}
            />
          </div>

          <TextInput
            label="Nama Shuttle"
            placeholder="The Sounds Projects"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Text size="xs" fw={700} c="gray.6" mb={4} className="uppercase">Tanggal Mulai</Text>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                style={{ width: "100%", height: 36, background: "#f1f3f5", border: "1px solid #ced4da", borderRadius: 6, padding: "0 10px", fontSize: 13 }}
              />
            </div>
            <TextInput
              label="Waktu Mulai"
              placeholder="08:00:00"
              value={form.start_time}
              onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
            />
            <div>
              <Text size="xs" fw={700} c="gray.6" mb={4} className="uppercase">Tanggal Selesai</Text>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                style={{ width: "100%", height: 36, background: "#f1f3f5", border: "1px solid #ced4da", borderRadius: 6, padding: "0 10px", fontSize: 13 }}
              />
            </div>
            <TextInput
              label="Waktu Selesai"
              placeholder="12:00:00"
              value={form.end_time}
              onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
            />
          </div>

          <Textarea
            label="Deskripsi"
            placeholder="Shuttle Executive Jakarta Bandung"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            autosize
            minRows={2}
          />
          <Textarea
            label="Syarat & Ketentuan"
            placeholder="Tiket tidak dapat direfund"
            value={form.terms}
            onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
            autosize
            minRows={2}
          />

          <TextInput
            label="Metode Pembayaran (pisahkan dengan koma)"
            placeholder="QRIS,BCA,MANDIRI"
            value={form.payment_method_custom}
            onChange={e => setForm(f => ({ ...f, payment_method_custom: e.target.value }))}
          />

          {/* Seatmap Editor Section */}
          <Box>
            <Text size="xs" fw={700} c="gray.6" mb={6} className="uppercase">Denah Kursi (Seatmap)</Text>
            <div
              style={{
                border: "1px solid #dee2e6",
                borderRadius: 10,
                overflow: "hidden",
                background: "#f8f9fa",
              }}
            >
              {/* Preview bar */}
              <Flex
                align="center"
                justify="space-between"
                p="sm"
                style={{ borderBottom: "1px solid #dee2e6", background: "white" }}
              >
                <Flex align="center" gap={8}>
                  <Icon icon="ph:map-trifold" style={{ fontSize: 18, color: "#0B387C" }} />
                  <Text size="sm" fw={600} c="gray.7">
                    {seatmapData.filter(a => a.type === "seat").length > 0
                      ? `${seatmapData.filter(a => a.type === "seat").length} area kursi dikonfigurasi`
                      : "Belum ada kursi dikonfigurasi"}
                  </Text>
                </Flex>
                <ButtonM
                  size="xs"
                  variant="light"
                  color="blue"
                  leftSection={<Icon icon="ph:pencil-simple" />}
                  onClick={() => setSeatmapModalOpen(true)}
                >
                  Buka Editor
                </ButtonM>
              </Flex>

              {/* Mini preview of area names */}
              {seatmapData.filter(a => a.type === "seat").length > 0 ? (
                <Flex gap={6} p="sm" wrap="wrap">
                  {seatmapData.filter(a => a.type === "seat").map((area, i) => (
                    <Badge key={i} size="sm" variant="light" color="blue">
                      {area.text || `Area ${i + 1}`}
                      {area.row && area.col ? ` (${area.row * area.col} kursi)` : ""}
                    </Badge>
                  ))}
                </Flex>
              ) : (
                <Flex align="center" justify="center" p="md">
                  <Text size="xs" c="dimmed">Klik &quot;Buka Editor&quot; untuk membuat denah kursi shuttle</Text>
                </Flex>
              )}
            </div>
          </Box>

          <Group align="center">
            <Switch
              label="Aktif"
              checked={form.is_active === 1}
              onChange={e => setForm(f => ({ ...f, is_active: e.currentTarget.checked ? 1 : 0 }))}
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
              {isEdit ? "Simpan Perubahan" : "Buat Shuttle"}
            </ButtonM>
          </Group>
        </Stack>
      </Modal>

      {/* Seatmap Editor Modal — fullscreen */}
      <Modal
        opened={seatmapModalOpen}
        onClose={() => setSeatmapModalOpen(false)}
        title={
          <Flex align="center" gap={8}>
            <Icon icon="ph:map-trifold" style={{ fontSize: 18, color: "#0B387C" }} />
            <Text fw={700} size="lg" c="#0B387C">Editor Denah Kursi Shuttle</Text>
          </Flex>
        }
        size="xl"
        fullScreen
        padding={0}
        radius={0}
      >
        <div style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
          {/* Wrap with the CreateEvent Context so the Seatmap component can read/write seatmapData */}
          <CreateEventContext.Provider value={{ seatmapData, setSeatmapData, ticket: [] }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <Seatmap
                ref={seatmapRef}
                editable
                fullscreenState={[isFullscreenSeatmap, setIsFullscreenSeatmap]}
              />
            </div>
          </CreateEventContext.Provider>

          {/* Footer action bar */}
          <Flex
            justify="flex-end"
            align="center"
            gap={10}
            p="md"
            style={{ borderTop: "1px solid #dee2e6", background: "white", flexShrink: 0 }}
          >
            <ButtonM variant="subtle" color="gray" onClick={() => setSeatmapModalOpen(false)}>
              Batal
            </ButtonM>
            <ButtonM
              color="blue"
              leftSection={<Icon icon="ph:check-bold" />}
              onClick={() => {
                notifications.show({ title: "Seatmap Disimpan", message: "Denah kursi berhasil dikonfigurasi.", color: "green" });
                setSeatmapModalOpen(false);
              }}
            >
              Simpan Seatmap
            </ButtonM>
          </Flex>
        </div>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        opened={viewOpened}
        onClose={() => setViewOpened(false)}
        title={<Text fw={700} size="lg" c="#0B387C">Detail Shuttle</Text>}
        size="lg"
        centered
        padding="xl"
        radius="md"
      >
        {selectedItem && (
          <Stack gap="md">
            {selectedItem.image_url && (
              <div style={{ borderRadius: 12, overflow: "hidden", height: 180 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedItem.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Nama</Text>
                <Text size="sm" fw={600}>{selectedItem.name}</Text>
              </div>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Status</Text>
                <Badge color={selectedItem.is_active ? "green" : "gray"} variant="filled" size="sm">
                  {selectedItem.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Slug</Text>
                <Text size="sm" ff="monospace">{selectedItem.slug}</Text>
              </div>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Slug URL</Text>
                <Text size="sm" ff="monospace">{selectedItem.slug_url}</Text>
              </div>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Tanggal Mulai</Text>
                <Text size="sm">{moment(selectedItem.start_date).format("DD MMM YYYY")} {selectedItem.start_time?.substring(0, 5)}</Text>
              </div>
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase">Tanggal Selesai</Text>
                <Text size="sm">{moment(selectedItem.end_date).format("DD MMM YYYY")} {selectedItem.end_time?.substring(0, 5)}</Text>
              </div>
            </div>
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase" mb={4}>Deskripsi</Text>
              <Text size="sm">{selectedItem.description}</Text>
            </div>
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase" mb={4}>Syarat & Ketentuan</Text>
              <Text size="sm">{selectedItem.terms}</Text>
            </div>
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase" mb={4}>Metode Pembayaran</Text>
              <Group gap={6}>
                {selectedItem.payment_method_custom?.split(",").map(m => (
                  <Badge key={m} size="sm" variant="light" color="blue">{m.trim()}</Badge>
                ))}
              </Group>
            </div>
            {selectedItem.seatmap && (
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase" mb={4}>Denah Kursi</Text>
                <Group gap={6} wrap="wrap">
                  {(() => {
                    try {
                      const parsed = typeof selectedItem.seatmap === "string"
                        ? JSON.parse(selectedItem.seatmap)
                        : selectedItem.seatmap;
                      return (Array.isArray(parsed) ? parsed : [])
                        .filter((a: any) => a.type === "seat")
                        .map((area: any, i: number) => (
                          <Badge key={i} size="sm" variant="light" color="blue">
                            {area.text || `Area ${i + 1}`}
                            {area.row && area.col ? ` (${area.row * area.col} kursi)` : ""}
                          </Badge>
                        ));
                    } catch {
                      return <Text size="xs" c="dimmed">Tidak dapat membaca seatmap.</Text>;
                    }
                  })()}
                </Group>
              </div>
            )}
            <Group justify="flex-end" mt="xs">
              <ButtonM variant="subtle" color="gray" onClick={() => setViewOpened(false)}>Tutup</ButtonM>
              <ButtonM
                color="indigo"
                leftSection={<Icon icon="ph:pencil-simple" />}
                onClick={() => { setViewOpened(false); handleOpenEdit(selectedItem.slug); }}
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
