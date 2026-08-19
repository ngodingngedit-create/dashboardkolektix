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
  shuttle_id?: number;
  shuttle_session_id?: number;
}

interface ShuttleSession {
  id?: number;
  session_name: string;
  session_start_time: string;
  session_end_time: string;
  tickets: ShuttleTicket[];
}

interface OperationDay {
  id?: number;
  day_name: string;
  sessions: ShuttleSession[];
}

const emptyTicket: ShuttleTicket = {
  name: "",
  description: "",
  qty: 0,
  price: "0",
  trip_status_id: "1",
  ticket_start_date: "",
  ticket_start_time: "08:00",
  ticket_end_date: "",
  ticket_end_time: "23:59",
  route_id: 1,
  ticket_category: "Festival",
  ticket_type: "Berbayar",
  available_seat: [],
  seat_color: "#194e9e",
  shuttle_id: 1,
  shuttle_session_id: 1,
};

const emptySession: ShuttleSession = {
  session_name: "",
  session_start_time: "08:00",
  session_end_time: "12:00",
  tickets: [],
};

const emptyDay: OperationDay = {
  day_name: "",
  sessions: [],
};

const emptyForm = {
  id: 0,
  slug: "",
  slug_url: "",
  event_id: 0,
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
  operation_days: [] as OperationDay[],
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

      // Preserve operation_days from API response
      const loadedDays: OperationDay[] = [];
      const flatTickets: ShuttleTicket[] = [];

      if (item.operation_days && Array.isArray(item.operation_days)) {
        item.operation_days.forEach((day: any) => {
          const sessions: ShuttleSession[] = [];
          if (day.sessions && Array.isArray(day.sessions)) {
            day.sessions.forEach((session: any) => {
              const sessionTickets: ShuttleTicket[] = [];
              if (session.tickets && Array.isArray(session.tickets)) {
                session.tickets.forEach((t: any) => {
                  const ticket: ShuttleTicket = {
                    id: t.id,
                    name: t.name || "",
                    description: t.description || "",
                    qty: t.qty || 0,
                    price: String(t.price || 0),
                    prices: t.prices && t.prices.length > 0
                      ? t.prices.map((p: any) => ({
                          ticket_type_id: p.ticket_type_id,
                          price: p.price,
                        }))
                      : [],
                    trip_status_id: String(t.trip_status_id || "1"),
                    ticket_start_date: t.ticket_start_date ? t.ticket_start_date.substring(0, 10) : "",
                    ticket_start_time: t.ticket_start_time || "08:00",
                    ticket_end_date: t.ticket_end_date ? t.ticket_end_date.substring(0, 10) : "",
                    ticket_end_time: t.ticket_end_time || "23:59",
                    route_id: t.route_id || 1,
                    ticket_category: t.ticket_category || (t.available_seat_number ? "Seated" : "Festival"),
                    ticket_type: t.ticket_type || (t.price > 0 ? "Berbayar" : "Gratis"),
                    available_seat_number: t.available_seat_number || "",
                    available_seat: t.available_seat_number ? t.available_seat_number.split(",") : [],
                    seat_color: t.seat_color || "#194e9e",
                    shuttle_id: t.shuttle_id || 1,
                    shuttle_session_id: t.shuttle_session_id || 1,
                  };
                  sessionTickets.push(ticket);
                  flatTickets.push(ticket);
                });
              }
              sessions.push({
                id: session.id,
                session_name: session.name || session.session_name || "",
                session_start_time: session.departure_time || session.session_start_time || "08:00",
                session_end_time: session.arrival_time || session.session_end_time || "12:00",
                tickets: sessionTickets,
              });
            });
          }
          loadedDays.push({
            id: day.id,
            day_name: day.operation_date || day.day_name || "",
            sessions,
          });
        });
      }

      setForm({
        id: item.id || 0,
        slug: item.slug || "",
        slug_url: item.slug_url || "",
        event_id: item.event_id || 1,
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
        tickets: flatTickets,
        operation_days: loadedDays,
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

  // ── Operation Days / Sessions helpers ──
  const handleAddDay = () => {
    setForm(prev => ({
      ...prev,
      operation_days: [...prev.operation_days, { ...emptyDay }],
    }));
  };

  const updateDayName = (dayIdx: number, value: string) => {
    setForm(prev => {
      const days = [...prev.operation_days];
      days[dayIdx] = { ...days[dayIdx], day_name: value };
      return { ...prev, operation_days: days };
    });
  };

  const removeDay = (dayIdx: number) => {
    setForm(prev => ({
      ...prev,
      operation_days: prev.operation_days.filter((_, i) => i !== dayIdx),
    }));
  };

  const addSession = (dayIdx: number) => {
    setForm(prev => {
      const days = [...prev.operation_days];
      days[dayIdx] = {
        ...days[dayIdx],
        sessions: [...days[dayIdx].sessions, { ...emptySession }],
      };
      return { ...prev, operation_days: days };
    });
  };

  const updateSessionField = (dayIdx: number, sesIdx: number, field: string, value: string) => {
    setForm(prev => {
      const days = [...prev.operation_days];
      const sessions = [...days[dayIdx].sessions];
      sessions[sesIdx] = { ...sessions[sesIdx], [field]: value };
      days[dayIdx] = { ...days[dayIdx], sessions };
      return { ...prev, operation_days: days };
    });
  };

  const removeSession = (dayIdx: number, sesIdx: number) => {
    setForm(prev => {
      const days = [...prev.operation_days];
      days[dayIdx] = {
        ...days[dayIdx],
        sessions: days[dayIdx].sessions.filter((_, i) => i !== sesIdx),
      };
      return { ...prev, operation_days: days };
    });
  };

  // ── Derived session options for the ticket modal ──
  const sessionOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    form.operation_days.forEach((day, di) => {
      day.sessions.forEach((ses, si) => {
        const dayLabel = day.day_name || `Hari ${di + 1}`;
        const sesLabel = ses.session_name || `Sesi ${si + 1}`;
        opts.push({
          value: `${di}-${si}`,
          label: `${dayLabel} — ${sesLabel} (${ses.session_start_time?.substring(0,5)}-${ses.session_end_time?.substring(0,5)})`,
        });
      });
    });
    return opts;
  }, [form.operation_days]);

  const handleSubmit = async () => {
    if (!form.name) {
      notifications.show({ title: "Validasi", message: "Nama shuttle wajib diisi.", color: "orange" });
      return;
    }
    setIsSubmitting(true);
    try {
      const seatmapJson = seatmapData.length > 0 ? JSON.stringify(seatmapData) : null;

      // Build operation_days payload from state
      const operationDaysPayload = form.operation_days.map((day) => ({
        ...(day.id ? { id: day.id } : {}),
        day_name: day.day_name,
        sessions: day.sessions.map((ses) => ({
          ...(ses.id ? { id: ses.id } : {}),
          session_name: ses.session_name,
          session_start_time: ses.session_start_time,
          session_end_time: ses.session_end_time,
          tickets: ses.tickets.map((t) => ({
            ...(t.id ? { id: t.id } : {}),
            name: t.name,
            description: t.description,
            qty: t.qty,
            price: parseInt(t.price) || 0,
            prices: t.prices && t.prices.length > 0
              ? t.prices.map((p: { ticket_type_id: number; price: number }) => ({
                  ticket_type_id: p.ticket_type_id,
                  price: p.price,
                }))
              : undefined,
            trip_status_id: Number(t.trip_status_id) || 1,
            route_id: t.route_id,
            ticket_type: t.ticket_type,
            ticket_category: t.ticket_category,
            ticket_start_date: t.ticket_start_date,
            ticket_start_time: t.ticket_start_time,
            ticket_end_date: t.ticket_end_date,
            ticket_end_time: t.ticket_end_time,
            ...(t.available_seat_number ? { available_seat_number: t.available_seat_number } : {}),
            ...(t.seat_color ? { seat_color: t.seat_color } : {}),
            shuttle_id: t.shuttle_id ?? form.id,
            shuttle_session_id: t.shuttle_session_id ?? 1,
          })),
        })),
      }));

      // Fallback: if no operation_days defined, use flat tickets
      const payload: any = {
        name: form.name,
        description: form.description.replace(/<[^>]*>/g, ''),
        terms: form.terms,
        start_date: form.start_date,
        start_time: form.start_time,
        end_date: form.end_date,
        end_time: form.end_time,
        is_active: form.is_active,
        payment_method_custom: form.payment_method_custom,
        seatmap: seatmapJson,
        is_name: form.is_name,
        is_email: form.is_email,
        is_phone: form.is_phone,
        is_noidentity: form.is_noidentity,
      };

      if (operationDaysPayload.length > 0) {
        payload.operation_days = operationDaysPayload;
      } else {
        payload.tickets = form.tickets.map(t => ({
          ...(t.id ? { id: t.id } : {}),
          name: t.name,
          description: t.description,
          qty: t.qty,
          price: parseInt(t.price) || 0,
          prices: t.prices && t.prices.length > 0
            ? t.prices.map((p: { ticket_type_id: number; price: number }) => ({
                ticket_type_id: p.ticket_type_id,
                price: p.price,
              }))
            : undefined,
          trip_status_id: Number(t.trip_status_id) || 1,
          route_id: t.route_id,
          ticket_type: t.ticket_type,
          ticket_category: t.ticket_category,
          ticket_start_date: t.ticket_start_date,
          ticket_start_time: t.ticket_start_time,
          ticket_end_date: t.ticket_end_date,
          ticket_end_time: t.ticket_end_time,
          ...(t.available_seat_number ? { available_seat_number: t.available_seat_number } : {}),
          ...(t.seat_color ? { seat_color: t.seat_color } : {}),
          shuttle_id: t.shuttle_id ?? form.id,
          shuttle_session_id: t.shuttle_session_id ?? 1,
        }));
      }

      if (form.image_base64) payload.image = form.image_base64;

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

  // Ticket modal state – proxies flat form.tickets
  const modalTickets = form.tickets;
  const handleSetTicket = (tickets: ShuttleTicket[]) => {
    setForm(prev => {
      // Also sync tickets into operation_days sessions by shuttle_session_id
      const days = prev.operation_days.map((day, di) => ({
        ...day,
        sessions: day.sessions.map((ses, si) => {
          const sesIdx = si + 1; // shuttle_session_id is 1-based
          return {
            ...ses,
            tickets: tickets.filter(t => t.shuttle_session_id === sesIdx),
          };
        }),
      }));
      return { ...prev, tickets, operation_days: days };
    });
  };
  const handleOpenTicketModal = () => {
    setTicketModalOpen(true);
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
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-1"><Icon icon="ph:sun-bold" className="text-amber-500" /> Tanggal & Waktu Mulai</label>
                    <input
                      type="datetime-local"
                      value={form.start_date && form.start_time ? `${form.start_date}T${form.start_time.substring(0, 5)}` : ""}
                      onFocus={e => { try { e.target.showPicker?.(); } catch { } }}
                      onClick={e => { try { e.currentTarget.showPicker?.(); } catch { } }}
                      onChange={e => {
                        const val = e.target.value;
                        if (val) {
                          const [date, time] = val.split("T");
                          setForm(f => ({ ...f, start_date: date, start_time: time + ":00" }));
                        }
                      }}
                      className="w-full h-[42px] bg-white border border-light-grey rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-1"><Icon icon="ph:sun-bold" className="text-amber-500" /> Tanggal & Waktu Selesai</label>
                    <input
                      type="datetime-local"
                      value={form.end_date && form.end_time ? `${form.end_date}T${form.end_time.substring(0, 5)}` : ""}
                      onFocus={e => { try { e.target.showPicker?.(); } catch { } }}
                      onClick={e => { try { e.currentTarget.showPicker?.(); } catch { } }}
                      onChange={e => {
                        const val = e.target.value;
                        if (val) {
                          const [date, time] = val.split("T");
                          setForm(f => ({ ...f, end_date: date, end_time: time + ":00" }));
                        }
                      }}
                      className="w-full h-[42px] bg-white border border-light-grey rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {/* ── Operation Days & Sessions ── */}
                  <div className="border-2 border-light-grey rounded-2xl my-5 mx-auto overflow-hidden">
                    <div className="border-b-2 border-light-grey px-4 py-3 flex justify-between items-center bg-primary-light-200/30">
                      <h3 className="text-medium font-semibold flex items-center gap-2">
                        <Icon icon="ph:calendar-bold" className="text-primary-base" />
                        Tanggal & Sesi Operasional
                      </h3>
                      <button onClick={handleAddDay} className="text-sm font-semibold text-primary-base flex items-center gap-1.5 hover:text-primary-dark transition-colors">
                        <Icon icon="ph:plus-bold" /> Tambah Tanggal
                      </button>
                    </div>
                    <div className="p-5">
                      {form.operation_days.length === 0 ? (
                        <div className="text-center py-6">
                          <Icon icon="ph:calendar-blank" className="text-4xl text-gray-300 mx-auto mb-2" />
                          <Text size="sm" c="dimmed">Belum ada tanggal operasional. Klik &ldquo;Tambah Tanggal&rdquo; untuk menambahkan.</Text>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {form.operation_days.map((day, di) => (
                            <div key={di} className="border border-light-grey rounded-xl overflow-hidden bg-white shadow-sm">
                              {/* Day Header */}
                              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-light-grey">
                                <div className="flex-1 flex items-center gap-2">
                                  <Icon icon="ph:calendar-dots-bold" className="text-primary-base shrink-0" />
                                  <input
                                    type="date"
                                    value={day.day_name}
                                    onChange={(e) => updateDayName(di, e.target.value)}
                                    className="flex-1 border border-light-grey rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                  />
                                </div>
                                <button
                                  onClick={() => addSession(di)}
                                  className="text-xs font-semibold text-primary-base flex items-center gap-1 hover:text-primary-dark transition-colors shrink-0"
                                >
                                  <Icon icon="ph:clock-plus-bold" /> Tambah Sesi
                                </button>
                                <button
                                  onClick={() => removeDay(di)}
                                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                                  title="Hapus hari"
                                >
                                  <Icon icon="ph:trash-bold" className="text-lg" />
                                </button>
                              </div>

                              {/* Sessions */}
                              {day.sessions.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-400 italic">
                                  Belum ada sesi. Klik &ldquo;Tambah Sesi&rdquo;.
                                </div>
                              ) : (
                                <div className="px-4 py-3 flex flex-col gap-3">
                                  {day.sessions.map((ses, si) => (
                                    <div key={si} className="flex items-center gap-3 bg-gray-50/80 rounded-lg px-3 py-2 border border-gray-100">
                                      <Icon icon="ph:clock-bold" className="text-blue-500 shrink-0" />
                                      <input
                                        type="text"
                                        placeholder={`Nama sesi ${si + 1} (contoh: Pagi, Siang, ...)`}
                                        value={ses.session_name}
                                        onChange={(e) => updateSessionField(di, si, "session_name", e.target.value)}
                                        className="flex-1 border border-light-grey rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[120px]"
                                      />
                                      <input
                                        type="time"
                                        value={ses.session_start_time?.substring(0, 5)}
                                        onChange={(e) => updateSessionField(di, si, "session_start_time", e.target.value + ":00")}
                                        className="w-[110px] border border-light-grey rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                      />
                                      <span className="text-gray-400 text-sm">—</span>
                                      <input
                                        type="time"
                                        value={ses.session_end_time?.substring(0, 5)}
                                        onChange={(e) => updateSessionField(di, si, "session_end_time", e.target.value + ":00")}
                                        className="w-[110px] border border-light-grey rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                      />
                                      <button
                                        onClick={() => removeSession(di, si)}
                                        className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                                        title="Hapus sesi"
                                      >
                                        <Icon icon="ph:x-bold" className="text-lg" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Tickets grouped under this day/session */}
                              {day.sessions.map((ses, si) => {
                                if (ses.tickets.length === 0) return null;
                                return (
                                  <div key={`tickets-${si}`} className="border-t border-primary-light-200 px-4 py-3">
                                    <Text size="xs" fw={700} c="dimmed" className="uppercase mb-2 flex items-center gap-1">
                                      <Icon icon="ph:ticket-bold" />
                                      Tiket — {ses.session_name || `Sesi ${si + 1}`}
                                    </Text>
                                    <div className="grid grid-cols-1 gap-3">
                                      {ses.tickets.map((t, tIdx) => (
                                        <TicketContainer
                                          key={tIdx}
                                          type={t.ticket_type}
                                          category={t.ticket_category}
                                          price={Number(t.price)}
                                          ticketDate={t.ticket_start_date}
                                          ticketEnd={t.ticket_end_date}
                                          description={t.description}
                                          name={t.name}
                                          qty={t.qty}
                                          onEdit={() => { handleOpenTicketModal(); }}
                                          seatColor={t.seat_color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Flat Ticket List (legacy / fallback) ── */}
                  <div className="border-2 border-light-grey rounded-2xl my-5 mx-auto">
                    <div className="border-b-2 border-light-grey px-4 py-3 flex justify-between items-center">
                      <h3 className="text-medium font-semibold">Daftar Tiket</h3>
                      <button onClick={handleOpenTicketModal} className="text-sm font-semibold text-primary-base flex items-center gap-2">
                        <Icon icon="ph:plus-bold" /> Kelola Tiket
                      </button>
                    </div>
                    <div className="p-5">
                      {form.tickets.length === 0 ? (
                        <Text size="sm" c="dimmed">Belum ada tiket. Klik &ldquo;Kelola Tiket&rdquo; untuk menambahkan.</Text>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {form.tickets.map((t, tIdx) => {
                            return (
                              <TicketContainer
                                key={tIdx}
                                type={t.ticket_type}
                                category={t.ticket_category}
                                price={Number(t.price)}
                                ticketDate={t.ticket_start_date}
                                ticketEnd={t.ticket_end_date}
                                description={t.description}
                                name={t.name}
                                qty={t.qty}
                                onEdit={() => { handleOpenTicketModal(); }}
                                seatColor={t.seat_color}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-2 border-light-grey rounded-2xl my-5 mx-auto">
                    <div className="border-b-2 border-light-grey px-4 py-3">
                      <h3 className="text-medium font-semibold">Formulir Data Pemesan</h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                      <Checkbox isSelected={form.is_name === 1} onChange={(e: any) => setForm({ ...form, is_name: e.target.checked ? 1 : 0 })}>Nama Lengkap</Checkbox>
                      <Checkbox isSelected={form.is_email === 1} onChange={(e: any) => setForm({ ...form, is_email: e.target.checked ? 1 : 0 })}>Email</Checkbox>
                      <Checkbox isSelected={form.is_phone === 1} onChange={(e: any) => setForm({ ...form, is_phone: e.target.checked ? 1 : 0 })}>No. Handphone</Checkbox>
                      <Checkbox isSelected={form.is_noidentity === 1} onChange={(e: any) => setForm({ ...form, is_noidentity: e.target.checked ? 1 : 0 })}>No. KTP</Checkbox>
                    </div>
                  </div>
                </Tab>

                <Tab key="detail" title="Detail Shuttle">
                  <div className="border-2 border-light-grey rounded-2xl my-5">
                    <div className="border-b-2 border-light-grey px-4 py-3">
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

                  <div className="border-2 border-light-grey rounded-2xl my-5">
                    <div className="border-b-2 border-light-grey px-4 py-3">
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
                  <div className="border-2 border-light-grey rounded-2xl my-5 mx-auto">
                    <div className="border-b-2 border-light-grey px-4 py-3">
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
        <div className="border-t border-light-grey fixed bottom-0 left-0 md:left-[65px] hvr:md:left-[280px] right-0 bg-white shadow-lg z-40 transition-all duration-300">
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
            ticket={modalTickets}
            setTicket={handleSetTicket}
            sessionOptions={sessionOptions}
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
