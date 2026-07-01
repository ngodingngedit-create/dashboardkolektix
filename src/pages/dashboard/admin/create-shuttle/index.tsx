import { Delete, Get, Post, Put } from "@/utils/REST";
import {
  Card, Flex, ActionIcon, Group, Modal,
  Tooltip, Text, Badge, Pagination as PaginationM,
  Button as ButtonM, Stack, TextInput, Textarea, Box, Switch as SwitchM, NumberInput
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { Input, Tabs, Tab, Checkbox, Switch } from "@nextui-org/react";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { Icon } from "@iconify/react/dist/iconify.js";
import { modals } from "@mantine/modals";
import moment from "moment";
import Seatmap, { defaultSeatmapData } from "@/components/Seatmap";
import { SeatmapData, EventTicket } from "@/utils/formInterface";
import { Context as CreateEventContext } from "@/pages/dashboard/create-event";
import Image from "next/image";
import imagePlus from "../../../../assets/icon/image-plus.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import InputField from "@/components/Input";
import InputEditor from "@/components/Input/InputEditor";
import Button from "@/components/Button";
import TicketContainer from "@/components/TicketContainer";
import ModalCreateShuttleTicket, { ShuttleTicket } from "@/components/CreateShuttle/_ModalCreateShuttleTicket";

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
  tickets?: ShuttleTicket[];
}

const emptyForm = {
  id: 0,
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
  is_name: 1,
  is_email: 1,
  is_phone: 1,
  is_noidentity: 0,
  tickets: [] as ShuttleTicket[],
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

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShuttleItem | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [tab, setTab] = useState<string>("info-tiket");

  const [seatmapData, setSeatmapData] = useListState<SeatmapData>(defaultSeatmapData);
  const [seatmapModalOpen, setSeatmapModalOpen] = useState(false);
  const [isFullscreenSeatmap, setIsFullscreenSeatmap] = useState(false);
  const seatmapRef = useRef<any>(null);

  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Stable callback for setTicket to prevent infinite re-render loops
  const handleSetTicket = useCallback((tickets: ShuttleTicket[]) => {
    setForm(prev => ({ ...prev, tickets }));
  }, []);

  // Memoized context value to prevent unnecessary consumer re-renders
  const contextValue = useMemo(() => ({
    seatmapData,
    setSeatmapData,
    ticket: [] as EventTicket[],
  }), [seatmapData, setSeatmapData]);

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
      const res: any = await Get("shuttle", {});
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
    setTab("info-tiket");
    setShowForm(true);
  };

  const handleOpenEdit = async (slug: string) => {
    setIsEdit(true);
    setEditSlug(slug);
    setLoading(true);
    try {
      const res: any = await Get(`shuttle/${slug}`, {});
      const item = res.data || res;

      // Flatten tickets from operation_days -> sessions -> tickets
      const flattenedTickets: ShuttleTicket[] = [];
      if (item.operation_days && Array.isArray(item.operation_days)) {
        item.operation_days.forEach((day: any) => {
          if (day.sessions && Array.isArray(day.sessions)) {
            day.sessions.forEach((session: any) => {
              if (session.tickets && Array.isArray(session.tickets)) {
                session.tickets.forEach((t: any) => {
                  flattenedTickets.push({
                    id: t.id,
                    name: t.name || "",
                    description: t.description || "",
                    qty: t.qty || 0,
                    price: String(t.price || 0),
                    trip_status_id: String(t.trip_status_id || ""),
                    operation_date: t.operation_date ? t.operation_date.substring(0, 10) : "",
                    ticket_start_date: t.ticket_start_date ? t.ticket_start_date.substring(0, 10) : "",
                    ticket_start_time: t.ticket_start_time || "08:00:00",
                    ticket_end_date: t.ticket_end_date ? t.ticket_end_date.substring(0, 10) : "",
                    ticket_end_time: t.ticket_end_time || "23:59:59",
                    route_id: t.route_id || 1,
                    ticket_category: t.ticket_category || (t.available_seat_number ? "Seated" : "Festival"),
                    ticket_type: t.ticket_type || (t.price > 0 ? "Berbayar" : "Gratis"),
                    available_seat_number: t.available_seat_number || "",
                    available_seat: t.available_seat_number ? t.available_seat_number.split(",") : [],
                    seat_color: t.seat_color || "#194e9e",
                  });
                });
              }
            });
          }
        });
      }

      setForm({
        id: item.id || 0,
        slug: item.slug || "",
        slug_url: item.slug_url || "",
        event_id: item.event_id || 1,
        shuttle_trips: item.shuttle_trips || 1,
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
        is_name: item.is_name ?? 1,
        is_email: item.is_email ?? 1,
        is_phone: item.is_phone ?? 1,
        is_noidentity: item.is_noidentity ?? 0,
        tickets: flattenedTickets,
      });
      setImagePreview(item.image_url || null);

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
      setTab("info-tiket");
      setShowForm(true);
    } catch {
      notifications.show({ title: "Gagal", message: "Gagal mengambil detail shuttle.", color: "red" });
    } finally {
      setLoading(false);
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
      const seatmapJson = seatmapData.length > 0 ? JSON.stringify(seatmapData) : null;
      const payload: any = { ...form, seatmap: seatmapJson };
      if (!payload.image_base64) delete payload.image_base64;
      if (isEdit && form.id) {
        await Put(`shuttle/${form.id}`, payload);
        notifications.show({ title: "Berhasil", message: "Shuttle berhasil diupdate.", color: "green" });
      } else {
        await Post("shuttle", payload);
        notifications.show({ title: "Berhasil", message: "Shuttle berhasil dibuat.", color: "green" });
      }
      setShowForm(false);
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

  if (showForm) {
    return (
      <div className="bg-gray-50">
        <div className="text-dark min-h-screen max-w-full mx-auto pt-6 pb-32 border-primary-light-200 px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="max-w-[1400px] mx-auto mb-6 text-center md:text-start flex items-center gap-4">
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{isEdit ? "Edit Shuttle" : "Buat Shuttle"}</h1>
              <p className="text-grey">Lengkapi form dibawah ini untuk {isEdit ? "merubah" : "membuat"} shuttle</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-[1400px] mx-auto">
            {/* Left Column */}
            <div className="md:pr-2 xl:pr-6">
              <label className="w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-[#f8f9fa] flex flex-col items-center justify-center h-72 gap-4 cursor-pointer overflow-hidden relative">
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/jpeg, image/png, image/gif" />
                {imagePreview ? (
                  <img src={imagePreview} alt="image" className="object-cover w-full h-full" />
                ) : (
                  <>
                    <Image src={imagePlus} alt="image-plus" />
                    <h3 className="font-semibold text-medium text-center">Unggah gambar/poster shuttle</h3>
                    <p className="text-grey text-center text-sm px-8">Direkomendasikan rasio 16:9 dan maksimal 3 mb</p>
                  </>
                )}
              </label>

              <div className="mt-8 text-sm flex flex-col gap-4">
                <InputField
                  type="text"
                  placeholder="Nama Shuttle"
                  fullWidth
                  value={form.name}
                  onChange={(e: any) => setForm({ ...form, name: e.target.value })}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    type="text"
                    placeholder="Slug (Cth: jakarta-bandung)"
                    fullWidth
                    value={form.slug}
                    onChange={(e: any) => setForm({ ...form, slug: e.target.value })}
                  />
                  <InputField
                    type="text"
                    placeholder="Slug URL"
                    fullWidth
                    value={form.slug_url}
                    onChange={(e: any) => setForm({ ...form, slug_url: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Event ID</label>
                    <NumberInput
                      value={form.event_id}
                      onChange={v => setForm(f => ({ ...f, event_id: Number(v) }))}
                      min={1}
                      size="md"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Shuttle Trips</label>
                    <NumberInput
                      value={form.shuttle_trips}
                      onChange={v => setForm(f => ({ ...f, shuttle_trips: Number(v) }))}
                      min={1}
                      size="md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                      className="w-full h-[42px] bg-white border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Waktu Mulai</label>
                    <InputField
                      type="text"
                      placeholder="08:00:00"
                      fullWidth
                      value={form.start_time}
                      onChange={(e: any) => setForm({ ...form, start_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                      className="w-full h-[42px] bg-white border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Waktu Selesai</label>
                    <InputField
                      type="text"
                      placeholder="12:00:00"
                      fullWidth
                      value={form.end_time}
                      onChange={(e: any) => setForm({ ...form, end_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:pl-2 xl:pl-6">
              <Tabs
                selectedKey={tab}
                onSelectionChange={(e) => setTab(e as string)}
                variant="solid"
                aria-label="Tabs variants"
                className="border border-b-2 border-primary-light-200 border-x-0 border-t-0"
                fullWidth
                classNames={{
                  tabList: "pb-0 self-center font-semibold rounded-b-none bg-white",
                  tab: "p-5",
                  cursor: "rounded-b-none border-b-2 border-b-primary-base",
                }}
              >
                <Tab key="info-tiket" title="Info Tiket">
                  <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                    <div className="border-b-2 border-primary-light-200 px-4 py-3 flex justify-between items-center">
                      <h3 className="text-medium font-semibold">Tiket</h3>
                      <button onClick={() => setTicketModalOpen(true)} className="text-sm font-semibold text-primary-base flex items-center gap-2">
                        <Icon icon="ph:plus-bold" /> Kelola Tiket
                      </button>
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                      {form.tickets.length === 0 ? (
                        <Text size="sm" c="dimmed">Belum ada tiket yang ditambahkan.</Text>
                      ) : (
                        form.tickets.map((t, idx) => (
                          <TicketContainer
                            key={idx}
                            type={t.ticket_type}
                            category={t.ticket_category}
                            price={Number(t.price)}
                            name={t.name}
                            description={t.description}
                            ticketDate={t.ticket_start_date}
                            ticketEnd={t.ticket_end_date}
                            qty={t.qty}
                            onEdit={() => setTicketModalOpen(true)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                    <div className="border-b-2 border-primary-light-200 px-4 py-3">
                      <h3 className="text-medium font-semibold">Formulir Data Pemesan</h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                      <Checkbox isSelected={form.is_name === 1} onChange={(e: any) => setForm({...form, is_name: e.target.checked ? 1 : 0})}>Nama Lengkap</Checkbox>
                      <Checkbox isSelected={form.is_email === 1} onChange={(e: any) => setForm({...form, is_email: e.target.checked ? 1 : 0})}>Email</Checkbox>
                      <Checkbox isSelected={form.is_phone === 1} onChange={(e: any) => setForm({...form, is_phone: e.target.checked ? 1 : 0})}>No. Handphone</Checkbox>
                      <Checkbox isSelected={form.is_noidentity === 1} onChange={(e: any) => setForm({...form, is_noidentity: e.target.checked ? 1 : 0})}>No. KTP</Checkbox>
                    </div>
                  </div>
                </Tab>

                <Tab key="detail" title="Detail Shuttle">
                  <div className="border-2 border-primary-light-200 rounded-2xl my-5">
                    <div className="border-b-2 border-primary-light-200 px-4 py-3">
                      <h3 className="text-medium font-semibold">Deskripsi</h3>
                    </div>
                    <div className="p-5">
                      <InputEditor
                        theme="snow"
                        onChange={(value: any) => setForm(prev => prev.description === value ? prev : { ...prev, description: value })}
                        value={form.description}
                        placeholder="Ketik Deskripsi Shuttle"
                        modules={{
                          toolbar: [
                            [{ header: "1" }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "bullet" }],
                          ],
                        }}
                        className="editor"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-primary-light-200 rounded-2xl my-5">
                    <div className="border-b-2 border-primary-light-200 px-4 py-3">
                      <h3 className="text-medium font-semibold">Syarat & Ketentuan</h3>
                    </div>
                    <div className="p-5">
                      <InputEditor
                        theme="snow"
                        onChange={(value: any) => setForm(prev => prev.terms === value ? prev : { ...prev, terms: value })}
                        value={form.terms}
                        placeholder="Ketik Syarat & Ketentuan"
                        modules={{
                          toolbar: [
                            [{ header: "1" }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "bullet" }],
                          ],
                        }}
                        className="editor"
                      />
                    </div>
                  </div>
                </Tab>

                <Tab key="pengaturan" title="Pengaturan">
                  <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                    <div className="border-b-2 border-primary-light-200 px-4 py-3">
                      <h3 className="text-medium font-semibold">Status & Pembayaran</h3>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">Status Aktif</p>
                          <p className="text-grey text-xs">Tentukan apakah shuttle ini dapat dibeli</p>
                        </div>
                        <Switch
                          size="sm"
                          isSelected={form.is_active === 1}
                          onChange={(e: any) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                        />
                      </div>
                      <hr className="border-gray-200" />
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Metode Pembayaran (pisahkan dengan koma)</label>
                        <InputField
                          type="text"
                          placeholder="QRIS,BCA,MANDIRI"
                          fullWidth
                          value={form.payment_method_custom}
                          onChange={(e: any) => setForm({ ...form, payment_method_custom: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-primary-light-200 fixed bottom-0 left-0 md:left-[65px] hvr:md:left-[280px] right-0 bg-white shadow-lg z-40 transition-all duration-300">
          <div className="flex justify-center items-center px-4 md:px-8 py-3 md:py-4 text-dark pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-4">
            <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto gap-3 md:gap-4">
              <p className="text-sm md:text-base text-center md:text-left mb-1 md:mb-0 font-bold">
                {isEdit ? "Simpan perubahan shuttle ini." : "Selangkah lagi shuttle kamu berhasil dibuat."}
              </p>
              <div className="flex gap-3 md:gap-4 w-full md:w-auto justify-center md:justify-end">
                <Button
                  className="flex-1 md:flex-none max-w-[120px] whitespace-nowrap"
                  onClick={handleSubmit}
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={faSave}
                  label={isSubmitting ? "Loading..." : "Simpan"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Modal */}
        <CreateEventContext.Provider value={contextValue}>
          <ModalCreateShuttleTicket
            isOpen={ticketModalOpen}
            setIsOpen={setTicketModalOpen}
            ticket={form.tickets}
            setTicket={handleSetTicket}
          />
        </CreateEventContext.Provider>

        {/* Seatmap Fullscreen Modal */}
        <Modal
          opened={seatmapModalOpen}
          onClose={() => setSeatmapModalOpen(false)}
          title={<Text fw={700} size="lg" c="#0B387C">Editor Denah Kursi Shuttle</Text>}
          size="xl"
          fullScreen
          padding={0}
          radius={0}
        >
          <div style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
            <CreateEventContext.Provider value={contextValue}>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <Seatmap ref={seatmapRef} editable fullscreenState={[isFullscreenSeatmap, setIsFullscreenSeatmap]} />
              </div>
            </CreateEventContext.Provider>
            <Flex justify="flex-end" align="center" gap={10} p="md" style={{ borderTop: "1px solid #dee2e6", background: "white", flexShrink: 0 }}>
              <ButtonM variant="subtle" color="gray" onClick={() => setSeatmapModalOpen(false)}>Batal</ButtonM>
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
      </div>
    );
  }

  // --- TABLE VIEW ---
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
                            <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                      <Badge variant="filled" size="sm" color={item.is_active ? "green" : "gray"} radius="sm">
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
              <Text size="sm" dangerouslySetInnerHTML={{ __html: selectedItem.description }}></Text>
            </div>
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase" mb={4}>Syarat & Ketentuan</Text>
              <Text size="sm" dangerouslySetInnerHTML={{ __html: selectedItem.terms }}></Text>
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
