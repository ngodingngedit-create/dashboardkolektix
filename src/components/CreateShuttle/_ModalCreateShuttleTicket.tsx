import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { Modal as ModalM, Stack, Flex, Card, TextInput, UnstyledButton, Box, Button, Text, Radio as RadioM, RadioGroup as RadioGroupM, Switch, Checkbox as CheckboxM } from "@mantine/core";
import { RadioGroup, Radio } from "@nextui-org/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import Seatmap from "@/components/Seatmap";
import TicketContainer from "@/components/TicketContainer";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Context as CreateEventContext } from "@/pages/dashboard/create-event";
import InputField from "@/components/Input";
import { formatPrice, parsePrice } from "@/utils/useFormattedPrice";
import { Get } from "@/utils/REST";

export interface ShuttleTicket {
  id?: number;
  name: string;
  description: string;
  qty: number;
  price: string;
  prices?: { ticket_type_id: number; price: number }[];
  trip_status_id: string;
  ticket_start_date: string;
  ticket_start_time: string;
  ticket_end_date: string;
  ticket_end_time: string;
  route_id?: number | string;
  ticket_category: string;
  ticket_type: string;
  available_seat_number?: string;
  available_seat?: string[];
  seat_color?: string;
  shuttle_id?: number;
  shuttle_session_id?: number;
  // Kunci UI lokal "dayIdx-sesIdx" — satu tiket hanya untuk satu sesi.
  // Tidak dikirim ke backend (di-strip saat submit).
  _sessionKey?: string;
  is_soldout?: number;
  is_fullbook?: number;
  is_finish?: number;
  is_show?: number;
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
  prices: [],
  shuttle_id: 1,
  shuttle_session_id: 1,
};

export interface SessionOption {
  value: string; // format: "dayIdx-sesIdx"
  label: string;
  dayIdx: number;
  sesIdx: number;
  sessionId?: number;
}

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ticket: ShuttleTicket[];
  setTicket: (tickets: ShuttleTicket[]) => void;
  sessionOptions?: SessionOption[];
}

export default function ModalCreateShuttleTicket({ isOpen, setIsOpen, ticket, setTicket, sessionOptions }: ModalProps) {
  const [openForm, setOpenForm] = useState<number | undefined>(undefined);
  const [form, setForm] = useState<ShuttleTicket>(emptyTicket);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const [addSeatMap, setAddSeatMap] = useState(false);
  const [isFullscreenSeatmap, setIsFullscreenSeatmap] = useState(false);
  const [onSelectSeat, setOnSelectSeat] = useState<number | undefined>();
  const [hoveredTicket, setHoveredTicket] = useState<number | undefined>();
  const seatmapRef = useRef<any>(null);

  const { seatmapData } = useContext(CreateEventContext);

  const [routeList, setRouteList] = useState<{ id: number; origin_name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      Get("shuttleroutes", {}).then((res: any) => {
        if (res?.data?.data) setRouteList(res.data.data);
      }).catch(() => { });
    }
  }, [isOpen]);

  useEffect(() => {
    const opts = sessionOptions || [];
    if (typeof openForm === "number" && openForm >= 0) {
      setSelectedKeys([]);
      const t = ticket[openForm];
      if (!t) {
        setForm({ ...emptyTicket });
        return;
      }
      // Tiket lama mungkin belum punya _sessionKey (data dari API).
      // Resolve dari shuttle_session_id -> sessionId, fallback ke _sessionKey / sesi pertama.
      let resolved = t._sessionKey;
      if ((!resolved || !opts.some((o) => o.value === resolved)) && opts.length > 0) {
        const byId = opts.find((o) => o.sessionId !== undefined && o.sessionId === t.shuttle_session_id);
        resolved = byId?.value || t._sessionKey || opts[0]?.value;
      }
      setForm({
        ...t,
        _sessionKey: resolved,
        shuttle_session_id:
          opts.find((o) => o.value === resolved)?.sessionId ?? t.shuttle_session_id ?? 1,
      });
    } else {
      // Form tiket baru: default pilih sesi pertama agar langsung ter-attach.
      const first = opts[0];
      setSelectedKeys(first ? [first.value] : []);
      setForm({
        ...emptyTicket,
        _sessionKey: first?.value,
        shuttle_session_id: first?.sessionId ?? emptyTicket.shuttle_session_id ?? 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openForm, isOpen]);

  // Sinkronisasi pilihan saat daftar sesi berubah (tambah/hapus sesi selagi modal terbuka).
  // Buang key yang sudah tidak valid; pastikan minimal 1 terpilih untuk form baru.
  // Hanya untuk form tambah baru — mode edit tetap single dan tidak pakai selectedKeys.
  useEffect(() => {
    if (typeof openForm === "number" && openForm >= 0) return;
    const opts = sessionOptions || [];
    if (opts.length === 0) {
      setSelectedKeys([]);
      return;
    }
    setSelectedKeys((prev) => {
      const valid = prev.filter((k) => opts.some((o) => o.value === k));
      if (valid.length > 0) return valid.length === prev.length ? prev : valid;
      return opts[0] ? [opts[0].value] : [];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionOptions, openForm]);

  const openSeatMap = useMemo(() => addSeatMap, [addSeatMap]);

  const resolveSessionKey = (key?: string): SessionOption | undefined => {
    const opts = sessionOptions || [];
    if (key) {
      const hit = opts.find((o) => o.value === key);
      if (hit) return hit;
    }
    return opts[0];
  };

  const isEditing = typeof openForm === "number" && openForm >= 0;
  const isNew = !isEditing;
  const showSessionList = isNew && (sessionOptions || []).length > 1;
  const allSelected = isNew && (sessionOptions || []).length > 0 && selectedKeys.length === (sessionOptions || []).length;

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        // Minimal 1 sesi harus terpilih.
        if (prev.length <= 1) return prev;
        const next = prev.filter((k) => k !== key);
        setForm((f) => {
          if (f._sessionKey !== key) return f;
          const fallback = (sessionOptions || []).find((o) => o.value === next[0]);
          return { ...f, _sessionKey: next[0], shuttle_session_id: fallback?.sessionId ?? f.shuttle_session_id ?? 1 };
        });
        return next;
      }
      const next = [...prev, key];
      setForm((f) => ({ ...f, _sessionKey: f._sessionKey ?? key }));
      return next;
    });
  };

  const selectAllSessions = () => {
    const opts = sessionOptions || [];
    const all = opts.map((o) => o.value);
    setSelectedKeys(all);
    if (all.length > 0) {
      const first = opts[0];
      setForm((f) => ({ ...f, _sessionKey: f._sessionKey ?? first.value, shuttle_session_id: f.shuttle_session_id ?? first.sessionId ?? 1 }));
    }
  };

  const clearSessionSelection = () => {
    const opts = sessionOptions || [];
    const first = opts[0];
    setSelectedKeys(first ? [first.value] : []);
    if (first) {
      setForm((f) => ({ ...f, _sessionKey: first.value, shuttle_session_id: first.sessionId ?? f.shuttle_session_id ?? 1 }));
    }
  };

  const handleSaveTicket = () => {
    if (!form.name || !form.ticket_start_date) {
      notifications.show({ title: "Validasi", message: "Mohon isi nama tiket dan tanggal", color: "red" });
      return;
    }
    const opts = sessionOptions || [];
    if (opts.length === 0) {
      notifications.show({ title: "Validasi", message: "Tambahkan tanggal & sesi operasional dulu sebelum membuat tiket.", color: "orange" });
      return;
    }
    // Hitung seat/qty sekali sebelum di-clone agar konsisten di semua sesi.
    // (Nomor kursi yang sama dipakai ulang di tiap sesi — armada yang sama.)
    const seatNumber = form.available_seat && form.available_seat.length > 0
      ? form.available_seat.join(",")
      : form.available_seat_number;
    const seatQty = form.available_seat && form.available_seat.length > 0
      ? form.available_seat.length
      : form.qty;
    const base: ShuttleTicket = {
      ...form,
      ...(seatNumber ? { available_seat_number: seatNumber } : {}),
      qty: seatQty,
    };

    if (isEditing) {
      // Edit tetap berlaku untuk satu sesi saja.
      const target = resolveSessionKey(form._sessionKey);
      const newForm: ShuttleTicket = {
        ...base,
        _sessionKey: target?.value ?? form._sessionKey,
        shuttle_session_id: target?.sessionId ?? form.shuttle_session_id ?? 1,
      };
      setTicket(ticket.map((e, i) => (i === openForm ? newForm : e)));
      setOpenForm(undefined);
      return;
    }

    // Tambah baru: duplikasi ke sesi-sesi yang dicentang (1 / beberapa / semua).
    // Strip id agar jadi row baru. Kursi yang sama dipakai ulang tiap sesi.
    const validTargets = opts.filter((o) => selectedKeys.includes(o.value));
    if (validTargets.length === 0) {
      notifications.show({ title: "Validasi", message: "Pilih minimal 1 sesi untuk tiket ini.", color: "orange" });
      return;
    }
    const clones: ShuttleTicket[] = validTargets.map((opt) => {
      const { id: _omit, ...rest } = base;
      return {
        ...rest,
        _sessionKey: opt.value,
        shuttle_session_id: opt.sessionId ?? base.shuttle_session_id ?? 1,
      };
    });
    setTicket([...ticket, ...clones]);
    if (clones.length > 1) {
      notifications.show({ title: "Berhasil", message: `Tiket "${form.name}" dibuat untuk ${clones.length} sesi.`, color: "green" });
    }
    const first = opts[0];
    setSelectedKeys(first ? [first.value] : []);
    setOpenForm(undefined);
  };

  const handleDeleteTicket = (index: number) => {
    modals.openConfirmModal({
      title: "Hapus Tiket",
      children: "Apakah kamu yakin ingin menghapus tiket ini?",
      labels: { confirm: "Hapus", cancel: "Batal" },
      centered: true,
      confirmProps: { color: "red" },
      onConfirm: () => {
        setTicket(ticket.filter((_, i) => i !== index));
        setOpenForm(undefined);
      },
    });
  };

  const handleSelectSeat = (data?: string[]) => {
    setTicket(ticket.map((e, i) => (i === onSelectSeat ? { ...e, available_seat: data } : e)));
  };

  const handleSeatClick = (seatnumber: string) => {
    const ticketIdx = ticket.findIndex((t) => t.available_seat?.includes(seatnumber));
    if (ticketIdx !== -1) {
      setOnSelectSeat(ticketIdx);
    } else {
      const firstSeated = ticket.findIndex((t) => t.ticket_category === "Seated");
      if (firstSeated !== -1) {
        setOnSelectSeat(firstSeated);
      }
    }
  };

  const unavailSeat = useMemo(() => {
    return onSelectSeat === undefined
      ? []
      : ticket
        .map((e) => e.available_seat || [])
        .reduce<string[]>((c, n) => [...c, ...n], [])
        .filter((e) => !ticket[onSelectSeat].available_seat?.includes(e));
  }, [onSelectSeat, ticket]);

  const allSeat = useMemo(() => {
    const result = ticket.map((e) => e.available_seat || []).reduce<string[]>((c, n) => [...c, ...n], []);
    if (hoveredTicket !== undefined) {
      return result.filter((e) => ticket[hoveredTicket].available_seat?.includes(e));
    }
    return result;
  }, [ticket, hoveredTicket]);

  return (
    <ModalM
      title={<Text fw={700}>Kelola Tiket Shuttle</Text>}
      opened={isOpen}
      centered
      onClose={() => setIsOpen(false)}
      size={openSeatMap ? "xl" : undefined}
      fullScreen={openSeatMap}
    >
      <Stack gap={10} h={addSeatMap ? "calc(100vh - 100px)" : "calc(100vh - 160px)"} pb={10}>
        <Flex gap={20} h="100%">
          <Card p={10} display={openForm === undefined && ticket.length > 0 && !isFullscreenSeatmap ? undefined : "none"} className={`w-full h-full ${openSeatMap ? "max-w-[370px]" : ""}`}>
            <Stack gap={15} h="100%">
              <TextInput leftSection={<Icon icon="uiw:search" />} placeholder="Cari Tiket" />
              <Stack gap={10} className="overflow-y-auto h-full">
                {ticket.map((e, i) => (
                  <UnstyledButton key={i} onClick={() => e.ticket_category === "Seated" && addSeatMap && setOnSelectSeat(i)}>
                    <Box onMouseEnter={() => setHoveredTicket(i)} onMouseLeave={() => setHoveredTicket(undefined)} className={`${onSelectSeat === i ? "!border !border-primary-base rounded-lg" : ""}`}>
                      <TicketContainer
                        type={e.ticket_type}
                        category={e.ticket_category}
                        price={Number(e.price)}
                        ticketDate={e.ticket_start_date}
                        ticketEnd={e.ticket_end_date}
                        description={e.description}
                        name={e.name}
                        qty={e.qty}
                        onEdit={() => setOpenForm(i)}
                        onDelete={() => handleDeleteTicket(i)}
                        onSelectSeatButton={e.ticket_category === "Seated" && onSelectSeat === undefined && addSeatMap ? () => setOnSelectSeat(i) : undefined}
                        seatColor={e.seat_color}
                        onSelectSeatColor={onSelectSeat === i ? (col) => setTicket(ticket.map((z, _i) => (i === _i ? { ...z, seat_color: col } : z))) : undefined}
                      />
                    </Box>
                  </UnstyledButton>
                ))}
              </Stack>
              <div className="flex flex-col gap-2 shrink-0 mt-auto">
                <button onClick={() => setOpenForm(-1)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-base text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm">
                  <Icon icon="uiw:plus" className="text-base" /> Tambah Tiket
                </button>
                <button style={{ display: addSeatMap ? "none" : undefined }} onClick={() => setAddSeatMap(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary-light-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                  Buat Seatmap
                </button>
                <button onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all">
                  Tutup
                </button>
              </div>
            </Stack>
          </Card>

          <div className={`${openForm !== undefined || ticket.length === 0 ? (isFullscreenSeatmap ? "hidden" : "flex") : "hidden"} h-full w-full ${openSeatMap ? "max-w-[370px]" : ""} overflow-auto flex-col gap-2 pb-4`}>
            <Flex display={ticket.length > 0 ? undefined : "none"}>
              <button onClick={() => setOpenForm(undefined)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors py-1">
                <Icon icon="uiw:left" className="text-base" /> Kembali
              </button>
            </Flex>

            {sessionOptions && sessionOptions.length > 0 && (
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between">
                  <Text size="sm" fw={500}>Sesi <span className="text-red-500">*</span></Text>
                  {showSessionList && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllSessions}
                        className="text-xs font-semibold text-primary-base hover:underline"
                      >
                        Pilih semua
                      </button>
                      <span className="text-gray-300 text-xs">|</span>
                      <button
                        type="button"
                        onClick={clearSessionSelection}
                        className="text-xs font-semibold text-gray-500 hover:underline"
                      >
                        Hapus semua
                      </button>
                    </div>
                  )}
                </div>
                {isEditing || !showSessionList ? (
                  <select
                    className="w-full border border-light-grey rounded-lg p-2 text-sm bg-white"
                    value={(() => {
                      if (form._sessionKey && sessionOptions.some((opt) => opt.value === form._sessionKey)) {
                        return form._sessionKey;
                      }
                      return sessionOptions[0]?.value || "";
                    })()}
                    onChange={(e) => {
                      const selected = sessionOptions.find((opt) => opt.value === e.target.value);
                      setForm({
                        ...form,
                        _sessionKey: e.target.value,
                        shuttle_session_id: selected?.sessionId ?? form.shuttle_session_id ?? 1,
                      });
                    }}
                  >
                    {sessionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="border border-light-grey rounded-lg p-2.5 flex flex-col gap-1.5 max-h-48 overflow-y-auto bg-white">
                    {sessionOptions.map((opt) => (
                      <CheckboxM
                        key={opt.value}
                        size="sm"
                        label={opt.label}
                        checked={selectedKeys.includes(opt.value)}
                        onChange={() => toggleKey(opt.value)}
                      />
                    ))}
                  </div>
                )}
                {showSessionList && (
                  <Text size="xs" c="dimmed">
                    {selectedKeys.length === 0
                      ? "Pilih minimal 1 sesi."
                      : selectedKeys.length === 1
                        ? "Tiket akan dibuat untuk 1 sesi."
                        : `Tiket akan dibuat ${selectedKeys.length} kali — satu untuk tiap sesi terpilih.`}{" "}
                    {allSelected ? "(semua sesi)" : ""}
                  </Text>
                )}
              </div>
            )}

            <RadioGroup label={<p>Kategori Tiket<span className="text-red-500"> *</span></p>} className="gap-1 w-full" size="md" color="primary" value={form.ticket_category} onChange={(e) => setForm({ ...form, ticket_category: e.target.value })}>
              <div className="grid grid-cols-2">
                <Radio classNames={{ base: "data-[selected=true]:bg-primary-light-200 border-2 border-primary-light-200 rounded-lg p-2" }} value="Festival">Non-Seat</Radio>
                <Radio classNames={{ base: "data-[selected=true]:bg-primary-light-200 border-2 border-primary-light-200 rounded-lg p-2" }} value="Seated">Seat</Radio>
              </div>
            </RadioGroup>

            <RadioGroup label={<p>Jenis Tiket<span className="text-red-500"> *</span></p>} className="gap-1 w-full mt-2" size="md" color="primary" value={form.ticket_type} onChange={(e: any) => setForm({ ...form, ticket_type: e.target.value })}>
              <div className="grid grid-cols-2">
                <Radio classNames={{ base: "data-[selected=true]:bg-primary-light-200 border-2 border-primary-light-200 rounded-lg p-2" }} value="Berbayar">Berbayar</Radio>
                <Radio classNames={{ base: "data-[selected=true]:bg-primary-light-200 border-2 border-primary-light-200 rounded-lg p-2" }} value="Gratis">Gratis</Radio>
              </div>
            </RadioGroup>

            <InputField type="text" label="Nama Tiket" placeholder="Nama Tiket" required fullWidth value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />

            <div className="grid grid-cols-2 gap-2 my-2">
              <div className="flex flex-col gap-1">
                <Text size="sm" fw={500}>Jenis Perjalanan</Text>
                <select className="w-full border border-light-grey rounded-lg p-2 text-sm bg-white" value={String(form.trip_status_id)} onChange={(e) => setForm({ ...form, trip_status_id: e.target.value })}>
                  <option value="1">Pergi</option>
                  <option value="2">Pulang</option>
                  <option value="3">Pulang Pergi</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Text size="sm" fw={500}>Rute <span className="text-red-500">*</span></Text>
                <select className="w-full border border-light-grey rounded-lg p-2 text-sm bg-white" value={form.route_id || ""} onChange={(e) => setForm({ ...form, route_id: e.target.value ? Number(e.target.value) : "" })}>
                  <option value="">Pilih Rute</option>
                  {routeList.map((r) => (
                    <option key={r.id} value={r.id}>{r.origin_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              <div>
                <p className="mb-1 text-grey text-sm">Tgl Mulai Penjualan <span className="text-danger">*</span></p>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm shadow-sm border border-light-grey focus:outline-primary-disabled rounded-lg"
                  value={form.ticket_start_date ? form.ticket_start_date.substring(0, 10) : ""}
                  onFocus={e => { try { e.target.showPicker?.(); } catch { } }}
                  onClick={e => { try { e.currentTarget.showPicker?.(); } catch { } }}
                  onChange={(e) => setForm({ ...form, ticket_start_date: e.target.value })}
                />
              </div>
              <div>
                <p className="mb-1 text-grey text-sm">Tgl Berakhir Penjualan <span className="text-danger">*</span></p>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm shadow-sm border border-light-grey focus:outline-primary-disabled rounded-lg"
                  value={form.ticket_end_date ? form.ticket_end_date.substring(0, 10) : ""}
                  onFocus={e => { try { e.target.showPicker?.(); } catch { } }}
                  onClick={e => { try { e.currentTarget.showPicker?.(); } catch { } }}
                  onChange={(e) => setForm({ ...form, ticket_end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              <div>
                <p className="mb-1 text-grey text-sm">Jam Mulai Penjualan <span className="text-danger">*</span></p>
                <input
                  type="time"
                  className="w-full px-3 py-2 text-sm shadow-sm border border-light-grey focus:outline-primary-disabled rounded-lg"
                  value={form.ticket_start_time || "08:00"}
                  onFocus={e => { try { e.target.showPicker?.(); } catch { } }}
                  onClick={e => { try { e.currentTarget.showPicker?.(); } catch { } }}
                  onChange={(e) => setForm({ ...form, ticket_start_time: e.target.value })}
                />
              </div>
              <div>
                <p className="mb-1 text-grey text-sm">Jam Berakhir Penjualan <span className="text-danger">*</span></p>
                <input
                  type="time"
                  className="w-full px-3 py-2 text-sm shadow-sm border border-light-grey focus:outline-primary-disabled rounded-lg"
                  value={form.ticket_end_time || "23:59"}
                  onFocus={e => { try { e.target.showPicker?.(); } catch { } }}
                  onClick={e => { try { e.currentTarget.showPicker?.(); } catch { } }}
                  onChange={(e) => setForm({ ...form, ticket_end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              <InputField className={`${form.ticket_type === "Gratis" ? "hidden" : ""}`} type="text" label="Harga Tiket" required disabled={form.ticket_type === "Gratis"} fullWidth value={formatPrice(form.price)} onChange={(e: any) => setForm({ ...form, price: String(parsePrice(e.target.value)) })} placeholder="Masukan Harga" />
              <InputField className={`${form.ticket_category === "Seated" ? "hidden" : ""}`} type="num" label="Jumlah Tiket" required fullWidth value={form.qty > 0 ? form.qty : ""} onChange={(e: any) => setForm({ ...form, qty: e.target.value })} placeholder="Masukan Jumlah" />
            </div>

            <div className="border border-light-grey rounded-lg p-3 my-2 flex flex-col gap-2">
              <Text size="sm" fw={600}>Status Tiket</Text>
              <div className="grid grid-cols-2 gap-3">
                <Switch
                  size="sm"
                  label="Soldout"
                  checked={form.is_soldout === 1}
                  onChange={(e) => setForm({ ...form, is_soldout: e.target.checked ? 1 : 0 })}
                />
                <Switch
                  size="sm"
                  label="Fullbook"
                  checked={form.is_fullbook === 1}
                  onChange={(e) => setForm({ ...form, is_fullbook: e.target.checked ? 1 : 0 })}
                />
                <Switch
                  size="sm"
                  label="Finish"
                  checked={form.is_finish === 1}
                  onChange={(e) => setForm({ ...form, is_finish: e.target.checked ? 1 : 0 })}
                />
                <Switch
                  size="sm"
                  label="Show"
                  checked={form.is_show === 1}
                  onChange={(e) => setForm({ ...form, is_show: e.target.checked ? 1 : 0 })}
                />
              </div>
            </div>

            {form.ticket_type === "Berbayar" && (
              <div className="border border-light-grey rounded-lg p-3">
                <Text size="sm" fw={600} className="mb-2">Harga per Tipe Tiket (opsional)</Text>
                {[
                  { id: 1, name: "Ticket Pergi" },
                  { id: 2, name: "Ticket Pulang" },
                  { id: 3, name: "Pulang Pergi" },
                ].map((tt) => {
                  const priceItem = (form.prices || []).find((p: any) => p.ticket_type_id === tt.id);
                  return (
                    <div key={tt.id} className="flex items-center gap-2 mb-2">
                      <Text size="sm" className="w-28 shrink-0">{tt.name}</Text>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukan Harga"
                        value={priceItem?.price ? formatPrice(String(priceItem.price)) : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const numericVal = parsePrice(val);
                          const existing = form.prices || [];
                          const filtered = existing.filter((p: any) => p.ticket_type_id !== tt.id);
                          setForm({
                            ...form,
                            prices: numericVal > 0
                              ? [...filtered, { ticket_type_id: tt.id, price: numericVal }]
                              : filtered,
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <InputField type="textarea" label="Deskripsi" placeholder="Deskripsi Tiket" fullWidth value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />

            <Flex justify="end" py={10} className="sticky bottom-[-15px] bg-white z-10 border-t border-light-grey pt-4">
              <button className="w-full sm:w-auto px-8 py-2.5 text-white bg-primary-base rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm" onClick={handleSaveTicket}>
                <FontAwesomeIcon icon={openForm === undefined ? faPlus : faSave} />
                {isEditing
                  ? "Simpan Tiket"
                  : showSessionList && selectedKeys.length > 1
                    ? `Tambah Tiket ke ${selectedKeys.length} Sesi`
                    : "Tambah Tiket"}
              </button>
            </Flex>
          </div>

          <Box className="flex-grow" display={openSeatMap ? undefined : "none"}>
            <Seatmap
              ref={seatmapRef}
              editable={true}
              fullscreenState={[isFullscreenSeatmap, setIsFullscreenSeatmap]}
              unavailSeat={unavailSeat}
              selected={onSelectSeat !== undefined ? ticket[onSelectSeat]?.available_seat || [] : allSeat}
              onSelect={handleSelectSeat}
              onSelectAll={handleSelectSeat}
              onEdit={onSelectSeat !== undefined}
              onFinishSelectSeat={onSelectSeat !== undefined ? () => setOnSelectSeat(undefined) : undefined}
              onSeatClick={handleSeatClick}
            />
          </Box>
        </Flex>
      </Stack>
    </ModalM>
  );
}

