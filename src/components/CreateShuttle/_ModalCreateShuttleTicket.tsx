import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { Modal as ModalM, Stack, Flex, Card, TextInput, UnstyledButton, Box, Button, Text, HoverCard, Radio as RadioM, RadioGroup as RadioGroupM } from "@mantine/core";
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
  trip_status_id: string;
  operation_date: string;
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
  dayIdx?: number;
  sessionIdx?: number;
}

const emptyTicket: ShuttleTicket = {
  name: "",
  description: "",
  qty: 0,
  price: "0",
  trip_status_id: "1",
  operation_date: "",
  ticket_start_date: "",
  ticket_start_time: "08:00",
  ticket_end_date: "",
  ticket_end_time: "23:59",
  route_id: 1,
  ticket_category: "Festival",
  ticket_type: "Berbayar",
  available_seat: [],
  seat_color: "#194e9e",
  dayIdx: 0,
  sessionIdx: 0,
};

interface DayOption {
  operation_date: string;
  sessions: { name: string; departure_time: string }[];
}

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ticket: ShuttleTicket[];
  setTicket: (tickets: ShuttleTicket[]) => void;
  operationDays: DayOption[];
}

export default function ModalCreateShuttleTicket({ isOpen, setIsOpen, ticket, setTicket, operationDays }: ModalProps) {
  const [openForm, setOpenForm] = useState<number | undefined>(undefined);
  const [form, setForm] = useState<ShuttleTicket>(emptyTicket);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0);

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

  // Track latest selected idx in refs so the useEffect is not stale
  const selectedDayRef = useRef(selectedDayIdx);
  const selectedSessionRef = useRef(selectedSessionIdx);
  useEffect(() => { selectedDayRef.current = selectedDayIdx; }, [selectedDayIdx]);
  useEffect(() => { selectedSessionRef.current = selectedSessionIdx; }, [selectedSessionIdx]);

  useEffect(() => {
    if (typeof openForm === "number") {
      const t = ticket[openForm];
      setForm(t);
      setSelectedDayIdx(t.dayIdx ?? 0);
      setSelectedSessionIdx(t.sessionIdx ?? 0);
    } else {
      setForm({ ...emptyTicket, dayIdx: selectedDayRef.current, sessionIdx: selectedSessionRef.current });
    }
  }, [openForm, ticket]);

  const openSeatMap = useMemo(() => addSeatMap, [addSeatMap]);

  const handleSaveTicket = () => {
    if (!form.name || !form.ticket_start_date) {
      notifications.show({ title: "Validasi", message: "Mohon isi nama tiket dan tanggal", color: "red" });
      return;
    }
    const newForm = { ...form };
    if (newForm.available_seat && newForm.available_seat.length > 0) {
      newForm.available_seat_number = newForm.available_seat.join(",");
      newForm.qty = newForm.available_seat.length;
    }
    if (typeof openForm === "number") {
      setTicket(ticket.map((e, i) => (i === openForm ? newForm : e)));
    } else {
      setTicket([...ticket, newForm]);
    }
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
                <button onClick={() => setOpenForm(undefined)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-base text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm">
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

            {/* Day & Session Selector */}
            {operationDays.length > 0 && (
              <div className="grid grid-cols-2 gap-2 my-2 border border-primary-light-200 rounded-xl p-3 bg-blue-50/30">
                <div>
                  <Text size="sm" fw={500}>Hari Operasi <span className="text-red-500">*</span></Text>
                  <select
                    className="w-full border border-light-grey rounded-lg p-2 text-sm bg-white mt-1"
                    value={selectedDayIdx}
                    onChange={(e) => {
                      const dIdx = parseInt(e.target.value);
                      setSelectedDayIdx(dIdx);
                      setSelectedSessionIdx(0);
                      setForm(prev => ({ ...prev, dayIdx: dIdx, sessionIdx: 0 }));
                    }}
                  >
                    {operationDays.map((day, i) => (
                      <option key={i} value={i}>
                        Hari {i + 1} {day.operation_date ? `(${day.operation_date})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Text size="sm" fw={500}>Sesi <span className="text-red-500">*</span></Text>
                  <select
                    className="w-full border border-light-grey rounded-lg p-2 text-sm bg-white mt-1"
                    value={selectedSessionIdx}
                    onChange={(e) => {
                      const sIdx = parseInt(e.target.value);
                      setSelectedSessionIdx(sIdx);
                      setForm(prev => ({ ...prev, sessionIdx: sIdx }));
                    }}
                  >
                    {operationDays[selectedDayIdx]?.sessions.map((s, i) => (
                      <option key={i} value={i}>
                        {s.name || `Sesi ${i + 1}`} {s.departure_time ? `(${s.departure_time})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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

            <div className="grid grid-cols-1 my-2">
              <div>
                <p className="mb-1 text-grey text-sm">Tanggal Keberangkatan <span className="text-danger">*</span></p>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm shadow-sm border border-light-grey focus:outline-primary-disabled rounded-lg"
                  value={form.operation_date ? form.operation_date.substring(0, 10) : ""}
                  onFocus={e => { try { e.target.showPicker?.(); } catch { } }}
                  onClick={e => { try { e.currentTarget.showPicker?.(); } catch { } }}
                  onChange={(e) => setForm({ ...form, operation_date: e.target.value })}
                />
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

            <InputField type="textarea" label="Deskripsi" placeholder="Deskripsi Tiket" fullWidth value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />

            <Flex justify="end" py={10} className="sticky bottom-[-15px] bg-white z-10 border-t border-light-grey pt-4">
              <button className="w-full sm:w-auto px-8 py-2.5 text-white bg-primary-base rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm" onClick={handleSaveTicket}>
                <FontAwesomeIcon icon={openForm === undefined ? faPlus : faSave} />
                {openForm === undefined ? "Tambah Tiket" : "Simpan Tiket"}
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

