const fs = require("fs");
const path = require("path");

const newContent = `import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
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
}

const emptyTicket: ShuttleTicket = {
  name: "",
  description: "",
  qty: 0,
  price: "0",
  trip_status_id: "SINGLETRIP",
  operation_date: "",
  ticket_start_date: "",
  ticket_start_time: "08:00:00",
  ticket_end_date: "",
  ticket_end_time: "23:59:59",
  route_id: 1,
  ticket_category: "Festival",
  ticket_type: "Berbayar",
  available_seat: [],
  seat_color: "#194e9e",
};

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ticket: ShuttleTicket[];
  setTicket: (tickets: ShuttleTicket[]) => void;
}

export default function ModalCreateShuttleTicket({ isOpen, setIsOpen, ticket, setTicket }: ModalProps) {
  const [openForm, setOpenForm] = useState<number | null>(undefined);
  const [form, setForm] = useState<ShuttleTicket>(emptyTicket);
  
  const [addSeatMap, setAddSeatMap] = useState(false);
  const [isFullscreenSeatmap, setIsFullscreenSeatmap] = useState(false);
  const [onSelectSeat, setOnSelectSeat] = useState<number | undefined>();
  const [hoveredTicket, setHoveredTicket] = useState<number | undefined>();
  const seatmapRef = useRef<any>(null);

  const { seatmapData } = useContext(CreateEventContext);

  useEffect(() => {
    if (typeof openForm === "number") {
      setForm(ticket[openForm]);
    } else {
      setForm({ ...emptyTicket });
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
          <Card p={10} display={openForm === undefined && ticket.length > 0 && !isFullscreenSeatmap ? undefined : "none"} className={\`w-full h-full \${openSeatMap ? "max-w-[370px]" : ""}\`}>
            <Stack gap={15} h="100%">
              <TextInput leftSection={<Icon icon="uiw:search" />} placeholder="Cari Tiket" />
              <Stack gap={10} className="overflow-y-auto h-full">
                {ticket.map((e, i) => (
                  <UnstyledButton key={i} onClick={() => e.ticket_category === "Seated" && addSeatMap && setOnSelectSeat(i)}>
                    <Box onMouseEnter={() => setHoveredTicket(i)} onMouseLeave={() => setHoveredTicket(undefined)} className={\`\${onSelectSeat === i ? "!border !border-primary-base rounded-lg" : ""}\`}>
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
              <Button variant="light" size="md" onClick={() => setOpenForm(null)} rightSection={<Icon icon="uiw:plus" />} className="shrink-0">
                Tambah Tiket
              </Button>
              <Button w="100%" display={addSeatMap ? "none" : undefined} variant="outline" size="md" onClick={() => setAddSeatMap(true)} className="shrink-0">
                Buat Seatmap
              </Button>
              <Button w="100%" variant="light" size="md" onClick={() => setIsOpen(false)} className="shrink-0">
                Tutup
              </Button>
            </Stack>
          </Card>

          <div className={\`\${openForm !== undefined || ticket.length === 0 ? (isFullscreenSeatmap ? "hidden" : "flex") : "hidden"} h-full w-full \${openSeatMap ? "max-w-[370px]" : ""} overflow-auto flex-col gap-2 pb-4\`}>
            <Flex display={ticket.length > 0 ? undefined : "none"}>
              <Button onClick={() => setOpenForm(undefined)} px={0} fw={400} leftSection={<Icon icon="uiw:left" />} variant="transparent" color="gray">
                Kembali
              </Button>
            </Flex>

            <RadioGroup label={<p>Kategori Tiket<span className="text-red-500"> *</span></p>} className="gap-1 w-full" size="md" color="primary" value={form.ticket_category} onChange={(e) => setForm({ ...form, ticket_category: e.target.value })}>
              <div className="grid grid-cols-2">
                <Radio classNames={{ base: "data-[selected=true]:bg-primary-light-200 border-2 border-primary-light-200 rounded-lg p-2" }} value="Festival">Festival</Radio>
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
                <select className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white" value={form.trip_status_id} onChange={(e) => setForm({ ...form, trip_status_id: e.target.value })}>
                  <option value="SINGLETRIP">Single Trip</option>
                  <option value="ROUNDTRIP">Round Trip</option>
                </select>
              </div>
              <InputField type="text" label="Route ID" required fullWidth value={form.route_id?.toString() || ""} onChange={(e: any) => setForm({ ...form, route_id: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 my-2">
              <InputField type="date" label="Tanggal Keberangkatan" required value={form.operation_date} onChange={(e: any) => e && setForm({ ...form, operation_date: e.toString() })} />
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              <InputField type="date" label="Tgl Mulai Penjualan" required value={form.ticket_start_date} onChange={(e: any) => e && setForm({ ...form, ticket_start_date: e.toString() })} />
              <InputField type="date" label="Tgl Berakhir Penjualan" required value={form.ticket_end_date} onChange={(e: any) => e && setForm({ ...form, ticket_end_date: e.toString() })} />
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              <InputField type="time" label="Jam Mulai Penjualan" required value={form.ticket_start_time} onChange={(e: any) => e && setForm({ ...form, ticket_start_time: e.toString() })} />
              <InputField type="time" label="Jam Berakhir Penjualan" required value={form.ticket_end_time} onChange={(e: any) => e && setForm({ ...form, ticket_end_time: e.toString() })} />
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              <InputField className={\`\${form.ticket_type === "Gratis" ? "hidden" : ""}\`} type="text" label="Harga Tiket" required disabled={form.ticket_type === "Gratis"} fullWidth value={formatPrice(form.price)} onChange={(e: any) => setForm({ ...form, price: parsePrice(e.target.value) })} placeholder="Masukan Harga" />
              <InputField className={\`\${form.ticket_category === "Seated" ? "hidden" : ""}\`} type="num" label="Jumlah Tiket" required fullWidth value={form.qty > 0 ? form.qty : ""} onChange={(e: any) => setForm({ ...form, qty: e.target.value })} placeholder="Masukan Jumlah" />
            </div>

            <InputField type="textarea" label="Deskripsi" placeholder="Deskripsi Tiket" fullWidth value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />

            <Flex justify="end" py={10} className="sticky bottom-[-15px] bg-white">
              <button className="w-[200px] ml-auto text-white bg-primary-dark rounded-full py-2 flex items-center justify-center gap-2" onClick={handleSaveTicket}>
                <FontAwesomeIcon icon={openForm === null ? faPlus : faSave} />
                {openForm === null ? "Tambah Tiket" : "Simpan Tiket"}
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
`;
fs.writeFileSync(path.join(__dirname, "src", "pages", "dashboard", "admin", "create-shuttle", "ModalCreateShuttleTicket.tsx"), newContent, "utf8");
console.log("Rewrite success");

