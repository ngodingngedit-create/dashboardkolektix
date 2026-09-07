import { Delete, Get, Post, Put } from "@/utils/REST";
import {
  Flex, ActionIcon, Group, Modal,
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
import { useRouter } from "next/router";
import InputField from "@/components/Input";
import InputEditor from "@/components/Input/InputEditor";
import Button from "@/components/Button";
import TicketContainer from "@/components/TicketContainer";
import ModalCreateShuttleTicket, { ShuttleTicket } from "@/components/CreateShuttle/_ModalCreateShuttleTicket";
import { useTranslation } from "react-i18next";

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
  is_soldout?: number;
  is_fullbook?: number;
  is_finish?: number;
  is_show?: number;
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
  is_soldout: 0,
  is_fullbook: 0,
  is_finish: 0,
  is_show: 1,
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
  const { t } = useTranslation();
  const router = useRouter();
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
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShuttleItem | null>(null);
  const [detailTab, setDetailTab] = useState<string>("Detail");
  const [detailDays, setDetailDays] = useState<OperationDay[]>([]);
  const [detailTickets, setDetailTickets] = useState<ShuttleTicket[]>([]);
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
      notifications.show({ title: t("common.failed"), message: t("admin.create-shuttle.index.validation.fetchFailed"), color: "red" });
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

  const parseShuttleDetail = (item: any): { days: OperationDay[]; tickets: ShuttleTicket[] } => {
    const days: OperationDay[] = [];
    const tickets: ShuttleTicket[] = [];

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
                  is_soldout: t.is_soldout ?? 0,
                  is_fullbook: t.is_fullbook ?? 0,
                  is_finish: t.is_finish ?? 0,
                  is_show: t.is_show ?? 1,
                };
                sessionTickets.push(ticket);
                tickets.push(ticket);
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
        days.push({
          id: day.id,
          day_name: day.operation_date || day.day_name || "",
          sessions,
        });
      });
    }

    return { days, tickets };
  };

  const handleOpenEdit = async (slug: string) => {
    setIsEdit(true);
    setEditSlug(slug);
    setLoading(true);
    try {
      const res: any = await Get(`shuttle/${slug}`, {});
      const item = res.data || res;

      const { days: loadedDays, tickets: flatTickets } = parseShuttleDetail(item);

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
          is_soldout: item.is_soldout ?? 0,
          is_fullbook: item.is_fullbook ?? 0,
          is_finish: item.is_finish ?? 0,
          is_show: item.is_show ?? 1,
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
      notifications.show({ title: t("common.failed"), message: t("admin.create-shuttle.index.modal.fetchDetailFailed"), color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenView = async (slug: string) => {
    setShowDetail(true);
    setLoading(true);
    try {
      const res: any = await Get(`shuttle/${slug}`, {});
      const item = res.data || res;
      setSelectedItem(item);
      const { days, tickets } = parseShuttleDetail(item);
      setDetailDays(days);
      setDetailTickets(tickets);
    } catch {
      notifications.show({ title: t("common.failed"), message: t("admin.create-shuttle.index.modal.fetchDetailFailed"), color: "red" });
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

  // â”€â”€ Operation Days / Sessions helpers â”€â”€
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

  // â”€â”€ Derived session options for the ticket modal â”€â”€
  const sessionOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    form.operation_days.forEach((day, di) => {
      day.sessions.forEach((ses, si) => {
        const dayLabel = day.day_name || `Hari ${di + 1}`;
        const sesLabel = ses.session_name || `Sesi ${si + 1}`;
        opts.push({
          value: `${di}-${si}`,
          label: `${dayLabel} â€” ${sesLabel} (${ses.session_start_time?.substring(0,5)}-${ses.session_end_time?.substring(0,5)})`,
        });
      });
    });
    return opts;
  }, [form.operation_days]);

  const handleSubmit = async () => {
    console.log('[handleSubmit] form state at submit', {
      is_soldout: form.is_soldout,
      ticketsCount: form.tickets.length,
      operationDaysCount: form.operation_days.length,
      operationDaysStructure: form.operation_days.map(d => ({ day: d.day_name, sessions: d.sessions.map(s => ({ name: s.session_name, ticketsCount: s.tickets.length })) }))
    });
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
            is_soldout: t.is_soldout ?? 0,
            is_fullbook: t.is_fullbook ?? 0,
            is_finish: t.is_finish ?? 0,
            is_show: t.is_show ?? 1,
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
          is_soldout: form.is_soldout,
          is_fullbook: form.is_fullbook,
          is_finish: form.is_finish,
          is_show: form.is_show,
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
          is_soldout: t.is_soldout ?? 0,
          is_fullbook: t.is_fullbook ?? 0,
          is_finish: t.is_finish ?? 0,
          is_show: t.is_show ?? 1,
        }));
      }

      if (form.image_base64) payload.image = form.image_base64;

      console.log('[handleSubmit] final payload', JSON.parse(JSON.stringify(payload)));

      if (isEdit && form.id) {
        await Put(`shuttle/${form.id}`, payload);
        notifications.show({ title: t("common.success"), message: t("admin.create-shuttle.index.toast.saveSuccessEdit") || t("admin.create-shuttle.index.modal.addTitle"), color: "green" });
      } else {
        await Post("shuttle", payload);
        notifications.show({ title: t("common.success"), message: t("admin.create-shuttle.index.toast.saveSuccessAdd") || t("admin.create-shuttle.index.modal.addTitle"), color: "green" });
      }
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("admin.create-shuttle.index.validation.saveFailed");
      notifications.show({ title: t("common.failed"), message: msg, color: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    modals.openConfirmModal({
      title: t("admin.create-shuttle.index.confirm.deleteTitle"),
      centered: true,
      children: <Text size="sm">{t("admin.create-shuttle.index.yakin.ingin.menghapus.shuttle")} <b>{name}</b>{t("admin.create-shuttle.index.tindakan.ini.tidak.dapat.dibatalkan")}</Text>,
      labels: { confirm: t("common.delete"), cancel: t("common.cancel") },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setLoading(true);
        try {
          await Delete(`shuttle/${id}`, {});
          notifications.show({ title: t("common.success"), message: t("admin.create-shuttle.index.toast.deleted"), color: "green" });
          fetchData();
        } catch {
          notifications.show({ title: t("common.failed"), message: t("admin.create-shuttle.index.validation.deleteFailed"), color: "red" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Ticket modal state â€“ proxies flat form.tickets
  const modalTickets = form.tickets;
  const handleSetTicket = (tickets: ShuttleTicket[]) => {
    console.log('[handleSetTicket] called', {
      incomingCount: tickets.length,
      incomingSessionIds: tickets.map(t => t.shuttle_session_id),
      prevOperationDays: form.operation_days.map(d => ({ day: d.day_name, sessions: d.sessions.map(s => ({ name: s.session_name, count: s.tickets.length })) }))
    });
    setForm(prev => {
      const days = prev.operation_days.map((day) => ({
        ...day,
        sessions: day.sessions.map((ses, si) => {
          const targetId = ses.id ?? (si + 1);
          const matched = tickets.filter(t => t.shuttle_session_id === targetId);
          console.log('[handleSetTicket] session filter', { sesIdx: si + 1, targetId, sessionName: ses.session_name, matchedCount: matched.length });
          return {
            ...ses,
            tickets: matched,
          };
        }),
      }));
      console.log('[handleSetTicket] result', {
        prevTicketsCount: prev.tickets.length,
        newTicketsCount: tickets.length,
        newOperationDays: days.map(d => ({ day: d.day_name, sessions: d.sessions.map(s => ({ name: s.session_name, count: s.tickets.length })) }))
      });
      return { ...prev, tickets, operation_days: days };
    });
  };
  const handleOpenTicketModal = () => {
    setTicketModalOpen(true);
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortBy === col
      ? <span style={{ marginLeft: 4 }}>{sortDir === "asc" ? "â†‘" : "â†“"}</span>
      : <span style={{ marginLeft: 4, opacity: 0.3 }}>â†‘</span>;

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
              <h1 className="text-2xl font-bold">{isEdit ? t("admin.create-shuttle.index.header.editShuttle") : t("admin.create-shuttle.index.header.addShuttle")}</h1>
              <p className="text-grey">{t("admin.create-shuttle.index.lengkapi.form.dibawah.ini.untuk")} {isEdit ? "merubah" : "membuat"} {t("admin.create-shuttle.index.shuttle")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-[1400px] mx-auto">
            {/* Left Column */}
            <div className="md:pr-2 xl:pr-6">
              <label className="w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-[#f8f9fa] flex flex-col items-center justify-center h-72 gap-4 cursor-pointer overflow-hidden relative">
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/jpeg, image/png, image/gif" />
                {imagePreview ? (
                  <img src={imagePreview} alt={t("admin.create-shuttle.index.image")} className="object-cover w-full h-full" />
                ) : (
                  <>
                    <Image src={imagePlus} alt={t("admin.create-shuttle.index.image.plus")} />
                    <h3 className="font-semibold text-medium text-center">{t("admin.create-shuttle.index.unggah.gambar.poster.shuttle")}</h3>
                    <p className="text-grey text-center text-sm px-8">{t("admin.create-shuttle.index.direkomendasikan.rasio.16.9.dan.maksimal.3.mb")}</p>
                  </>
                )}
              </label>

              <div className="mt-8 text-sm flex flex-col gap-4">
                <InputField
                  type="text"
                  placeholder={t("admin.create-shuttle.index.nama.shuttle")}
                  fullWidth
                  value={form.name}
                  onChange={(e: any) => setForm({ ...form, name: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-1"><Icon icon="ph:sun-bold" className="text-amber-500" /> {t("admin.create-shuttle.index.tanggal.waktu.mulai")}</label>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-1"><Icon icon="ph:sun-bold" className="text-amber-500" /> {t("admin.create-shuttle.index.tanggal.waktu.selesai")}</label>
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
                aria-label={t("admin.create-shuttle.index.tabs.variants")}
                className="border border-b-2 border-primary-light-200 border-x-0 border-t-0"
                fullWidth
                classNames={{
                  tabList: "pb-0 self-center font-semibold rounded-b-none bg-white",
                  tab: "p-5",
                  cursor: "rounded-b-none border-b-2 border-b-primary-base",
                }}
              >
                <Tab key="info-tiket" title={t("admin.create-shuttle.index.info.tiket")}>
                  {/* â”€â”€ Operation Days & Sessions â”€â”€ */}
                  <div className="border-2 border-light-grey rounded-2xl my-5 mx-auto overflow-hidden">
                    <div className="border-b-2 border-light-grey px-4 py-3 flex justify-between items-center bg-primary-light-200/30">
                      <h3 className="text-medium font-semibold flex items-center gap-2">
                        <Icon icon="ph:calendar-bold" className="text-primary-base" />
                        {t("admin.create-shuttle.index.tanggal.sesi.operasional")}
                      </h3>
                      <button onClick={handleAddDay} className="text-sm font-semibold text-primary-base flex items-center gap-1.5 hover:text-primary-dark transition-colors">
                        <Icon icon="ph:plus-bold" /> {t("admin.create-shuttle.index.tambah.tanggal")}
                      </button>
                    </div>
                    <div className="p-5">
                      {form.operation_days.length === 0 ? (
                        <div className="text-center py-6">
                          <Icon icon="ph:calendar-blank" className="text-4xl text-gray-300 mx-auto mb-2" />
                          <Text size="sm" c="dimmed">{t("admin.create-shuttle.index.belum.ada.tanggal.operasional.klik.ldquo.tambah.tanggal.rdquo.untuk.me")}</Text>
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
                                  <Icon icon="ph:clock-plus-bold" /> {t("admin.create-shuttle.index.tambah.sesi")}
                                </button>
                                <button
                                  onClick={() => removeDay(di)}
                                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                                  title={t("admin.create-shuttle.index.hapus.hari")}
                                >
                                  <Icon icon="ph:trash-bold" className="text-lg" />
                                </button>
                              </div>

                              {/* Sessions */}
                              {day.sessions.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-400 italic">
                                  {t("admin.create-shuttle.index.belum.ada.sesi.klik.ldquo.tambah.sesi.rdquo")}
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
                                      <span className="text-gray-400 text-sm">â€”</span>
                                      <input
                                        type="time"
                                        value={ses.session_end_time?.substring(0, 5)}
                                        onChange={(e) => updateSessionField(di, si, "session_end_time", e.target.value + ":00")}
                                        className="w-[110px] border border-light-grey rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                      />
                                      <button
                                        onClick={() => removeSession(di, si)}
                                        className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                                        title={t("admin.create-shuttle.index.hapus.sesi")}
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
                                      {t("admin.create-shuttle.index.tiket")} {ses.session_name || `Sesi ${si + 1}`}
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

                  {/* â”€â”€ Flat Ticket List (legacy / fallback) â”€â”€ */}
                  <div className="border-2 border-light-grey rounded-2xl my-5 mx-auto">
                    <div className="border-b-2 border-light-grey px-4 py-3 flex justify-between items-center">
                      <h3 className="text-medium font-semibold">{t("admin.create-shuttle.index.daftar.tiket")}</h3>
                      <button onClick={handleOpenTicketModal} className="text-sm font-semibold text-primary-base flex items-center gap-2">
                        <Icon icon="ph:plus-bold" /> {t("admin.create-shuttle.index.kelola.tiket")}
                      </button>
                    </div>
                    <div className="p-5">
                      {form.tickets.length === 0 ? (
                        <Text size="sm" c="dimmed">{t("admin.create-shuttle.index.belum.ada.tiket.klik.ldquo.kelola.tiket.rdquo.untuk.menambahkan")}</Text>
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
                      <h3 className="text-medium font-semibold">{t("admin.create-shuttle.index.formulir.data.pemesan")}</h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                      <Checkbox isSelected={form.is_name === 1} onChange={(e: any) => setForm({ ...form, is_name: e.target.checked ? 1 : 0 })}>{t("admin.create-shuttle.index.nama.lengkap")}</Checkbox>
                      <Checkbox isSelected={form.is_email === 1} onChange={(e: any) => setForm({ ...form, is_email: e.target.checked ? 1 : 0 })}>{t("admin.create-shuttle.index.email")}</Checkbox>
                      <Checkbox isSelected={form.is_phone === 1} onChange={(e: any) => setForm({ ...form, is_phone: e.target.checked ? 1 : 0 })}>{t("admin.create-shuttle.index.no.handphone")}</Checkbox>
                      <Checkbox isSelected={form.is_noidentity === 1} onChange={(e: any) => setForm({ ...form, is_noidentity: e.target.checked ? 1 : 0 })}>{t("admin.create-shuttle.index.no.ktp")}</Checkbox>
                    </div>
                  </div>
                </Tab>

                <Tab key="detail" title={t("admin.create-shuttle.index.detail.shuttle")}>
                  <div className="border-2 border-light-grey rounded-2xl my-5">
                    <div className="border-b-2 border-light-grey px-4 py-3">
                      <h3 className="text-medium font-semibold">{t("admin.create-shuttle.index.deskripsi")}</h3>
                    </div>
                    <div className="p-5">
                      <InputEditor
                        theme="snow"
                        onChange={(value: any) => setForm(prev => prev.description === value ? prev : { ...prev, description: value })}
                        value={form.description}
                        placeholder={t("admin.create-shuttle.index.ketik.deskripsi.shuttle")}
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
                      <h3 className="text-medium font-semibold">{t("admin.create-shuttle.index.syarat.ketentuan")}</h3>
                    </div>
                    <div className="p-5">
                      <InputEditor
                        theme="snow"
                        onChange={(value: any) => setForm(prev => prev.terms === value ? prev : { ...prev, terms: value })}
                        value={form.terms}
                        placeholder={t("admin.create-shuttle.index.ketik.syarat.ketentuan")}
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

                <Tab key="pengaturan" title={t("admin.create-shuttle.index.pengaturan")}>
                  <div className="border-2 border-light-grey rounded-2xl my-5 mx-auto">
                    <div className="border-b-2 border-light-grey px-4 py-3">
                      <h3 className="text-medium font-semibold">{t("admin.create-shuttle.index.status.pembayaran")}</h3>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{t("admin.create-shuttle.index.status.aktif")}</p>
                            <p className="text-grey text-xs">{t("admin.create-shuttle.index.tentukan.apakah.shuttle.ini.dapat.dibeli")}</p>
                          </div>
                          <Switch
                            size="sm"
                            isSelected={form.is_active === 1}
                            onChange={(e: any) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                          />
                        </div>
                        {/* New flags */}
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm">{t("admin.create-shuttle.index.soldout")}</p>
                          <Switch
                            size="sm"
                            isSelected={form.is_soldout === 1}
                            onChange={(e: any) => {
                              console.log('[is_soldout] onChange fired', { e, isChecked: e?.target?.checked, type: typeof e, isCheckedAlt: e });
                              setForm({ ...form, is_soldout: e.target.checked ? 1 : 0 });
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm">{t("admin.create-shuttle.index.fullbook")}</p>
                          <Switch
                            size="sm"
                            isSelected={form.is_fullbook === 1}
                            onChange={(e: any) => setForm({ ...form, is_fullbook: e.target.checked ? 1 : 0 })}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm">{t("admin.create-shuttle.index.finish")}</p>
                          <Switch
                            size="sm"
                            isSelected={form.is_finish === 1}
                            onChange={(e: any) => setForm({ ...form, is_finish: e.target.checked ? 1 : 0 })}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm">{t("admin.create-shuttle.index.show")}</p>
                          <Switch
                            size="sm"
                            isSelected={form.is_show === 1}
                            onChange={(e: any) => setForm({ ...form, is_show: e.target.checked ? 1 : 0 })}
                          />
                        </div>
                      <hr className="border-gray-200" />
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">{t("admin.create-shuttle.index.metode.pembayaran.pisahkan.dengan.koma")}</label>
                        <InputField
                          type="text"
                          placeholder={t("admin.create-shuttle.index.qris.bca.mandiri")}
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
                {isEdit ? t("admin.create-shuttle.index.modal.saveEdit") : t("admin.create-shuttle.index.modal.addDesc")}
              </p>
              <div className="flex gap-3 md:gap-4 w-full md:w-auto justify-center md:justify-end">
                <Button
                  className="flex-1 md:flex-none max-w-[120px] whitespace-nowrap"
                  onClick={handleSubmit}
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={faSave}
                  label={isSubmitting ? t("admin.create-shuttle.index.button.loading") : t("admin.create-shuttle.index.button.save")}
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
          title={<Text fw={700} size="lg" c="#0B387C">{t("admin.create-shuttle.index.editor.denah.kursi.shuttle")}</Text>}
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
              <ButtonM variant="subtle" color="gray" onClick={() => setSeatmapModalOpen(false)}>{t("admin.create-shuttle.index.batal")}</ButtonM>
              <ButtonM
                color="blue"
                leftSection={<Icon icon="ph:check-bold" />}
                onClick={() => {
                  notifications.show({ title: t("admin.create-shuttle.index.toast.seatmapSaved"), message: t("admin.create-shuttle.index.modal.seatmapSuccess"), color: "green" });
                  setSeatmapModalOpen(false);
                }}
              >
                {t("admin.create-shuttle.index.simpan.seatmap")}
              </ButtonM>
            </Flex>
          </div>
        </Modal>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (showDetail) {
    return (
      <div className="p-5">
        <div className="flex items-center mb-4 gap-4">
          <button
            onClick={() => setShowDetail(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label={t("admin.create-shuttle.index.kembali.ke.daftar.shuttle")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-dark m-0">{t("admin.create-shuttle.index.detail.shuttle")}</h1>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="w-full md:max-w-[300px] flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-md border border-primary-light-200 overflow-hidden">
              <div className="relative w-full h-44 bg-gray-100">
                {selectedItem?.image_url ? (
                  <img src={selectedItem.image_url} alt="" className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center">
                    <Icon icon="ph:bus" style={{ fontSize: 40, color: "#ccc" }} />
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <Badge variant="filled" size="sm" color={selectedItem?.is_active ? "green" : "gray"} radius="sm">
                    {selectedItem?.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h5 className="text-lg font-semibold text-dark truncate">{selectedItem?.name}</h5>
                <p className="text-dark text-sm mt-2">
                  <Icon icon="ph:calendar-blank" className="inline text-gray-400 mr-1.5" />
                  {moment(selectedItem?.start_date).format("DD MMM YYYY")} {selectedItem?.start_time?.substring(0, 5)} - {moment(selectedItem?.end_date).format("DD MMM YYYY")} {selectedItem?.end_time?.substring(0, 5)}
                </p>
              </div>
            </div>
            <ButtonM variant="subtle" color="gray" onClick={() => setShowDetail(false)}>
              {t("admin.create-shuttle.index.kembali")}
            </ButtonM>
          </div>

          <div className="flex-1 border border-primary-light-200 rounded-lg shadow-sm">
            {loading || !selectedItem ? (
              <div className="p-5 flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <Tabs className="flex flex-col" variant="underlined" selectedKey={detailTab} onSelectionChange={(k) => setDetailTab(k.toString())}>
                <Tab key="Detail" title={t("admin.create-shuttle.index.detail")} className="px-2">
                  <Tabs
                    radius="full"
                    color="secondary"
                    classNames={{
                      tabList: "bg-transparent",
                      tab: "data-[selected=true]:text-primary",
                      cursor: "border border-primary-base",
                    }}
                  >
                    <Tab title={t("admin.create-shuttle.index.deskripsi")} className="px-2">
                      <div dangerouslySetInnerHTML={{ __html: selectedItem.description }}></div>
                    </Tab>
                    <Tab title={t("admin.create-shuttle.index.syarat.ketentuan")} className="px-2">
                      <div
                        className="ml-5"
                        dangerouslySetInnerHTML={{ __html: selectedItem.terms }}
                      ></div>
                    </Tab>
                  </Tabs>
                  <div className="mt-4 pt-4 border-t border-primary-light-200">
                    <div>
                      <Text size="xs" fw={700} c="dimmed" className="uppercase" mb={4}>{t("admin.create-shuttle.index.metode.pembayaran")}</Text>
                      <Group gap={6}>
                        {selectedItem.payment_method_custom?.split(",").map(m => (
                          <Badge key={m} size="sm" variant="light" color="blue">{m.trim()}</Badge>
                        ))}
                      </Group>
                    </div>
                    {selectedItem.seatmap && (
                      <div className="mt-4">
                        <Text size="xs" fw={700} c="dimmed" className="uppercase" mb={4}>{t("admin.create-shuttle.index.denah.kursi")}</Text>
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
                              return <Text size="xs" c="dimmed">{t("admin.create-shuttle.index.tidak.dapat.membaca.seatmap")}</Text>;
                            }
                          })()}
                        </Group>
                      </div>
                    )}
                    <div className="mt-4">
                      <Text size="xs" fw={700} c="dimmed" className="uppercase">{t("admin.create-shuttle.index.slug")}</Text>
                      <Text size="sm" ff="monospace">{selectedItem.slug}</Text>
                    </div>
                    <div className="mt-2">
                      <Text size="xs" fw={700} c="dimmed" className="uppercase">{t("admin.create-shuttle.index.slug.url")}</Text>
                      <Text size="sm" ff="monospace">{selectedItem.slug_url}</Text>
                    </div>
                  </div>
                </Tab>
                <Tab key="Tiket" title={t("admin.create-shuttle.index.tiket.2")}>
                  <div className="flex justify-between items-center px-3 py-2">
                    <h6 className="text-lg font-semibold">{t("admin.create-shuttle.index.tiket.2")}</h6>
                  </div>
                  <div className="px-3">
                    {detailTickets.length > 0 ? (
                      detailTickets.map((t, index) => (
                        <div key={index} className="mb-3">
                          <TicketContainer
                            type={t.ticket_type}
                            category={t.ticket_category}
                            price={Number(t.price)}
                            name={t.name}
                            description={t.description}
                            ticketDate={null}
                            ticketEnd={null}
                            qty={t.qty}
                            seatColor={t.seat_color}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">{t("admin.create-shuttle.index.belum.ada.tiket")}</p>
                      </div>
                    )}
                  </div>
                </Tab>
                <Tab key="Jadwal" title={t("admin.create-shuttle.index.jadwal")}>
                  <div className="px-3 py-3">
                    {detailDays.length > 0 ? (
                      detailDays.map((day, i) => (
                        <div key={i} className="mb-4">
                          <h6 className="text-sm font-semibold text-dark mb-2">{day.day_name}</h6>
                          <div className="flex flex-col gap-2">
                            {day.sessions.map((s, j) => (
                              <div key={j} className="border border-primary-light-200 rounded-lg p-3 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">{s.session_name}</p>
                                  <p className="text-xs text-grey">
                                    {s.session_start_time?.substring(0, 5)} - {s.session_end_time?.substring(0, 5)}
                                  </p>
                                </div>
                                <Badge size="sm" variant="light" color="blue">{s.tickets.length} {t("admin.create-shuttle.index.tiket.3")}</Badge>
                              </div>
                            ))}
                            {day.sessions.length === 0 && (
                              <p className="text-xs text-gray-400">{t("admin.create-shuttle.index.tidak.ada.sesi")}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">{t("admin.create-shuttle.index.belum.ada.jadwal.operasional")}</p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TABLE VIEW ---
  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
      <Flex justify="space-between" align="center" mb={8}>
        <Flex align="center" gap={12}>
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label={t("admin.create-shuttle.index.kembali.ke.dashboard.admin")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <Stack gap={4}>
            <Text size="1.7rem" fw={700} style={{ color: "#0B387C", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon icon="ph:bus-bold" />
              {t("admin.create-shuttle.index.event.shuttle")}
            </Text>
            <Text size="sm" c="gray">{t("admin.create-shuttle.index.kelola.daftar.event.shuttle.yang.tersedia")}</Text>
          </Stack>
        </Flex>
        <ButtonM
          color="blue"
          leftSection={<Icon icon="ph:plus-bold" />}
          radius="md"
          size="md"
          onClick={handleOpenCreate}
        >
          {t("admin.create-shuttle.index.tambah.shuttle")}
        </ButtonM>
      </Flex>

      <div className="mt-4">
        <Flex justify="space-between" align="center" gap={12} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <Text size="sm" fw={600} c="gray.7">{t("admin.create-shuttle.index.total")} <b>{total}</b> {t("admin.create-shuttle.index.shuttle")}</Text>
          <div style={{ width: 280 }}>
            <Input
              isClearable
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder={t("admin.create-shuttle.index.cari.nama.atau.slug")}
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
              <Icon icon="ph:bus-duotone" style={{ fontSize: 40, color: "#ccc" }} />
              <h3 className="text-xl font-semibold">{t("admin.create-shuttle.index.tidak.ada.data.shuttle")}</h3>
            </div>
          ) : (
            sortedData.map((item) => (
              <div key={item.id} className="w-full bg-white rounded-xl shadow-md border border-primary-light-200 overflow-hidden">
                <div className="relative w-full h-44 bg-gray-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center">
                      <Icon icon="ph:bus" style={{ fontSize: 40, color: "#ccc" }} />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <Badge variant="filled" size="sm" color={item.is_active ? "green" : "gray"} radius="sm">
                      {item.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h5 className="text-lg font-semibold text-dark truncate">{item.name}</h5>
                  <p className="text-grey text-sm mt-1 line-clamp-2">{item.description}</p>
                  <p className="text-dark text-sm mt-3">
                    <Icon icon="ph:calendar-blank" className="inline text-gray-400 mr-1.5" />
                    {moment(item.start_date).format("DD MMM YYYY")} â€¢ {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                  </p>
                  <Group gap={4} wrap="wrap" mt={8}>
                    {item.payment_method_custom?.split(",").map(m => (
                      <Badge key={m} size="xs" variant="light" color="blue">{m.trim()}</Badge>
                    ))}
                  </Group>
                  <div className="mt-4 pt-3 border-t-1.5 border-dashed border-primary-light-200 flex items-center justify-end">
                    <Group gap={4}>
                      <Tooltip label={t("admin.create-shuttle.index.lihat.detail")}>
                        <ActionIcon variant="transparent" color="cyan" onClick={() => handleOpenView(item.slug)}>
                          <Icon icon="ph:eye" style={{ fontSize: 18 }} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t("admin.create-shuttle.index.edit.shuttle")}>
                        <ActionIcon variant="transparent" color="gray" onClick={() => handleOpenEdit(item.slug)}>
                          <Icon icon="ph:pencil-simple" style={{ fontSize: 18 }} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t("admin.create-shuttle.index.hapus.shuttle")}>
                        <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id, item.name)}>
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
    </div>
  );
}
