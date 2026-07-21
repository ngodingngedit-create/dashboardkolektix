import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem, RadioGroup, Radio } from "@nextui-org/react";
import { useState, useEffect, useRef } from "react";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import ImageInput from "@/components/ImageInput.tsx";
import { notifications } from "@mantine/notifications";
import { Box, Checkbox, Flex, LoadingOverlay, Stack } from "@mantine/core";
import { EventProps } from "@/utils/globalInterface";
import { SeatmapData, EventTicket } from "@/utils/formInterface";
import Seatmap from "@/components/Seatmap";
import { Context as CreateEventContext } from "@/pages/dashboard/create-event";
import { Icon } from "@iconify/react/dist/iconify.js";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: number;
  eventData?: EventProps;
  ticket?: EventTicket[];
  seatmap?: SeatmapData[];
  setSeatmap?: any;
}

export type CategoryResponse = { id: number; name: string };

type InvitationStore<
  T = {
    fullname: string;
    email: string;
    phone: string;
    seat_number?: string;
    session?: string;
  }[]
> = {
  event_id: number;
  invitation_cat_id?: number;
  invitation_title: string;
  invitation_description: string;
  total_qty: number;
  details: T;
  image?: Blob;
  is_one_receiver?: boolean;
  is_banner_image?: boolean;
  is_seatnumber?: boolean | number;
  is_session?: boolean | number;
  event_invitation_status?: {
    id: number;
  };
  reserved_seat?: string[];
  ticket_category?: string;
  ticket_id?: number;
};

const isBrowser = typeof window !== "undefined";

export const invitationStoreSchema = z.object({
  event_id: z.number().int().positive(),
  invitation_cat_id: z.number().int().positive("Kategori undangan harus dipilih"),
  invitation_title: z.string().nonempty("Judul undangan tidak boleh kosong"),
  invitation_description: z.string().nonempty("Deskripsi undangan tidak boleh kosong"),
  total_qty: z.number().int().nonnegative(),
  details: z
    .array(
      z.object({
        fullname: z.string().nonempty("Nama lengkap tidak boleh kosong."),
        email: z.string().email("Format email tidak valid."),
        phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
        seat_number: z.string().optional(),
        session: z.string().optional(),
      })
    )
    .nonempty("Detail tidak boleh kosong."),
  image: z.instanceof(Blob).optional().nullable(),
});

const AddEventModal = ({ isOpen, onClose, eventId, eventData, ticket: propTicket, seatmap: propSeatmap, setSeatmap: propSetSeatmap }: AddEventModalProps) => {
  const [loading, setLoading] = useListState<string>();
  const [category, setCategory] = useState<CategoryResponse[]>([]);

  // Ticket type & seat selection
  const [ticketType, setTicketType] = useState<"Festival" | "Seat">("Festival");
  const [selectedTicketId, setSelectedTicketId] = useState<number | undefined>(undefined);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showSeatPicker, setShowSeatPicker] = useState(false);
  const [seatPickerFullscreen, setSeatPickerFullscreen] = useState(false);
  const seatmapRef = useRef<any>(null);

  // Get the selected ticket for seat reservations
  const selectedTicket = propTicket?.find(t => t.id === selectedTicketId);

  // Computed unavailable seats: collect from ALL tickets so seats from other ticket types can't be selected
  // Handle both formats: formInterface (array[]) and API response (comma-separated string "_seat_number")
  const parseSeats = (t: any, field: string): string[] => {
    const val = t[field] || t[field.replace("_seat", "_seat_number")] || t[field.replace("_seat_number", "_seat")] || "";
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val) return val.split(",").filter(Boolean);
    return [];
  };

  // Get available seats per ticket so we can block seats from OTHER tickets
  const allTicketAvailable = (propTicket || []).reduce<string[]>((acc, t) => {
    return [...acc, ...parseSeats(t, "available_seat")];
  }, []);
  const selectedTicketSeats = parseSeats(selectedTicket || {}, "available_seat");
  // Seats that belong to other tickets (even if available) should not be clickable
  const otherTicketSeats = allTicketAvailable.filter(s => !selectedTicketSeats.includes(s));

  // Collect reserved/taken from ALL tickets
  const allTicketReserved = (propTicket || []).reduce<string[]>((acc, t) => {
    return [...acc, ...parseSeats(t, "reserved_seat")];
  }, []);
  const allTicketTaken = (propTicket || []).reduce<string[]>((acc, t) => {
    return [...acc, ...parseSeats(t, "taken_seat")];
  }, []);

  // existingReservedSeats = reserved seats from the SELECTED ticket only (for visual)
  const existingReservedSeats = parseSeats(selectedTicket || {}, "reserved_seat");
  const filteredReservedSeats = [...existingReservedSeats, ...selectedSeats];
  // unavailSeats = all reserved/taken from ALL tickets + available seats from OTHER tickets
  // Empty seats (not in any ticket) can still be picked
  const unavailSeats = Array.from(new Set([...allTicketReserved, ...allTicketTaken, ...otherTicketSeats]));

  const form = useForm<InvitationStore>({
    initialValues: {
      event_id: eventId ?? 0,
      invitation_title: "",
      invitation_description: "",
      total_qty: 1,
      details: [{ fullname: "", email: "", phone: "", seat_number: "", session: "" }],
      is_one_receiver: false,
      is_banner_image: true,
      is_seatnumber: false,
      is_session: false,
      ticket_category: "Festival",
      reserved_seat: [],
      ticket_id: undefined,
    },
    validate: zodResolver(invitationStoreSchema),
    onValuesChange: (val) => {
      if (val.is_one_receiver) val.details = [...[val.details[0]]];
      return val;
    },
  });

  useEffect(() => {
    form.reset();
    setSelectedSeats([]);
    setTicketType("Festival");
    setSelectedTicketId(undefined);
  }, [isOpen]);

  useEffect(() => {
    getCategory();
    form.setValues({ event_id: eventId });
  }, [eventId]);

  const getCategory = async () => {
    await fetch<any, CategoryResponse[]>({
      url: "invitation-category",
      method: "GET",
      data: {},
      before: () => setLoading.append("getcategory"),
      success: ({ data }) => data && setCategory(data),
      complete: () => setLoading.filter((e) => e != "getcategory"),
      error: () => {},
    });
  };

  const handleSubmit = async () => {
  const valid = form.validate();
  if (valid.hasErrors) {
    notifications.show({
      position: "top-right",
      color: "red",
      message: "Lengkapi Terlebih dahulu Form Invitation",
    });
    return;
  }

  const validationErrors: string[] = [];
  
  form.values.details.forEach((detail, index) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(detail.email)) {
      validationErrors.push(`Email ${index + 1} tidak valid: ${detail.email}`);
    }
    
    if (detail.phone.replace(/\D/g, '').length < 10) {
      validationErrors.push(`Nomor telepon ${index + 1} tidak valid`);
    }
  });

  if (form.values.total_qty > 50) {
    validationErrors.push("Maksimal 50 invitation per kali input");
  }

  const emails = form.values.details.map(d => d.email.toLowerCase());
  const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
  if (duplicateEmails.length > 0) {
    validationErrors.push("Terdapat email yang duplikat");
  }

  if (validationErrors.length > 0) {
    notifications.show({
      position: "top-right",
      color: "red",
      title: "Validasi Gagal",
      message: validationErrors.join("\n"),
    });
    return;
  }

  const lastSubmitKey = `last_submit_time_${eventId}`;
  const lastSubmitTime = localStorage.getItem(lastSubmitKey);
  const now = Date.now();
  
  if (lastSubmitTime) {
    const timeDiff = now - parseInt(lastSubmitTime);
    if (timeDiff < 10000) {
      notifications.show({
        position: "top-right",
        color: "yellow",
        title: "Mohon Tunggu",
        message: "Silakan tunggu 10 detik sebelum menambah invitation baru",
      });
      return;
    }
  }

  localStorage.setItem(lastSubmitKey, now.toString());

  console.log('Submitting invitation:', {
    eventId: form.values.event_id,
    totalQty: form.values.total_qty,
    detailsCount: form.values.details.length,
    timestamp: new Date().toISOString()
  });

  const detailsToSubmit = form.values.is_one_receiver
    ? Array(form.values.total_qty).fill(form.values.details[0])
    : form.values.details;

  const submissionData = {
    ...form.values,
    is_seatnumber: form.values.is_seatnumber ? 1 : 0,
    is_session: form.values.is_session ? 1 : 0,
    ticket_category: ticketType,
    ticket_id: ticketType === "Seat" ? selectedTicketId : undefined,
    reserved_seat: ticketType === "Seat" ? selectedSeats : [],
    details: JSON.stringify(
      detailsToSubmit.map((d: any) => ({
        fullname: d.fullname,
        email: d.email,
        phone: d.phone,
        ...(form.values.is_seatnumber ? { seat_number: d.seat_number || "" } : {}),
        ...(form.values.is_session ? { session: d.session || "" } : {}),
      }))
    ),
    metadata: {
      source: 'dashboard_add_modal',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      ip_hash: typeof window !== 'undefined' 
        ? btoa(navigator.userAgent + new Date().getTime()).substring(0, 32)
        : '',
      event_id: eventId
    }
  };

  await fetch<InvitationStore<string>, any>({
    url: "invitations",
    method: "POST",
    data: submissionData,
    before: () => setLoading.append("submit"),
    success: (response) => {
      if (response.message?.includes('spam')) {
        notifications.show({
          position: "top-right",
          color: "red",
          title: "Gagal",
          message: "Sistem mendeteksi aktivitas mencurigakan. Silakan coba lagi nanti.",
        });
        return;
      }
      
      notifications.show({
        position: "top-right",
        color: "green",
        message: "Invitation berhasil ditambahkan",
      });
      onClose();
      form.reset();
    },
    complete: () => setLoading.filter((e) => e != "submit"),
    error: (error) => {
      console.error('Error adding invitation:', error);
      
      let errorMessage = "Gagal menambahkan invitation";
      
      if (error.response?.status === 429) {
        errorMessage = "Terlalu banyak permintaan. Silakan coba lagi nanti.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Data tidak valid";
      } else if (error.response?.data?.message?.toLowerCase().includes('spam')) {
        errorMessage = "Email terdeteksi sebagai spam. Silakan gunakan email yang berbeda.";
      }
      
      notifications.show({
        position: "top-right",
        color: "red",
        title: "Gagal",
        message: errorMessage,
      });
    },
  });
};

  useEffect(() => {
    if (form.values.total_qty > 0) {
      form.setValues({ details: Array(form.values.total_qty).fill({ fullname: "", email: "", phone: "", seat_number: "", session: "" }) });
    }
  }, [form.values.total_qty]);

  // Auto-select ticket if only one ticket with seat category exists
  useEffect(() => {
    if (ticketType === "Seat" && propTicket) {
      const seatTickets = propTicket.filter(t => t.ticket_category === "Seated");
      if (seatTickets.length === 1 && !selectedTicketId) {
        setSelectedTicketId(seatTickets[0].id);
      }
    }
  }, [ticketType, propTicket]);

  // Filter tickets to only show "Seat" category tickets for seat reservation
  const seatTickets = propTicket?.filter(t => 
    t.ticket_category === "Seated"
  ) || [];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      classNames={{
        wrapper: "justify-end p-0",
        base: "h-screen max-h-screen m-0 !mr-0 rounded-l-xl rounded-r-none w-[70vw] max-w-[70vw]",
      }}
      motionProps={{
        variants: {
          enter: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
          exit: { x: "100%", opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
        },
      }}
    >
      <ModalContent>
        {showSeatPicker ? (
          <>
            <ModalHeader className="text-dark">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSeatPicker(false)}
                    className="flex items-center gap-1.5 text-sm text-grey hover:text-dark transition-colors"
                  >
                    <Icon icon="mdi:arrow-left" width={18} />
                    <span>Kembali</span>
                  </button>
                  <span>Pilih Kursi</span>
                </div>
                {selectedTicket && (
                  <p className="text-sm font-normal text-grey">
                    Tiket: <span className="font-medium text-dark">{selectedTicket.name}</span>
                  </p>
                )}
              </div>
            </ModalHeader>
            <ModalBody className="!p-0">
              <div style={{ height: "calc(80vh - 100px)", display: "flex", flexDirection: "column" }}>
                <CreateEventContext.Provider value={{ seatmapData: propSeatmap || [], setSeatmapData: propSetSeatmap || new Proxy({}, { get: () => () => {} }), ticket: propTicket || [] }}>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <Seatmap
                      ref={seatmapRef}
                      onFinishSelectSeat={() => {}}
                      editable={false}
                      onEdit={true}
                      selected={selectedSeats}
                      onSelect={(data?: string[]) => setSelectedSeats(data || [])}
                      soldSeat={allTicketTaken}
                      reservedSeat={filteredReservedSeats}
                      availableSeat={selectedTicketSeats}
                      unavailSeat={unavailSeats}
                      fullscreenState={[seatPickerFullscreen, setSeatPickerFullscreen]}
                    />
                  </div>
                </CreateEventContext.Provider>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex justify-between items-center w-full">
                <p className="text-sm text-grey">
                  {selectedSeats.length > 0
                    ? `${selectedSeats.length} kursi dipilih: ${selectedSeats.join(", ")}`
                    : "Klik kursi untuk memilih"}
                </p>
                <div className="flex gap-3">
                  <Button variant="flat" onPress={() => { setSelectedSeats([]); }}>
                    Reset
                  </Button>
                  <Button className="bg-primary text-white" onPress={() => setShowSeatPicker(false)}>
                    Simpan Kursi
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader className="text-dark">Add New Invitation</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                <Stack gap={10}>
                  <ImageInput
                    label="Gambar"
                    dimension={[300, 100]}
                    value={form.values.image ?? (form.values.is_banner_image ? eventData?.image_url : undefined)}
                    onChange={(e) => (form.values.is_banner_image ? undefined : form.setValues({ image: e ?? undefined }))}
                  />
                  <Checkbox label="Gunakan Gambar Event" checked={form.values.is_banner_image} onChange={(e) => form.setValues({ is_banner_image: e.target.checked })} />
                </Stack>

                {/* Ticket Type Selector — hidden, tidak dihapus */}
                <div className="hidden">
                  <div className="border-2 border-primary-light-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-dark mb-3">Tipe Tiket</p>
                    <RadioGroup
                      value={ticketType}
                      onValueChange={(val) => {
                        setTicketType(val as "Festival" | "Seat");
                        if (val === "Festival") {
                          setSelectedSeats([]);
                          setSelectedTicketId(undefined);
                        }
                      }}
                      orientation="horizontal"
                      className="gap-4"
                    >
                      <Radio value="Festival" description="Tiket tanpa kursi khusus">Festival</Radio>
                      <Radio value="Seat" description="Tiket dengan kursi khusus">Seat</Radio>
                    </RadioGroup>

                    {ticketType === "Seat" && (
                      <div className="mt-3 pt-3 border-t border-primary-light-200 flex flex-col gap-3">
                        {/* Ticket name selector */}
                        <div>
                          <p className="text-sm font-medium mb-1">Nama Tiket</p>
                          <Select
                            aria-label="Pilih Tiket"
                            placeholder="Pilih tiket untuk reservasi kursi"
                            selectedKeys={selectedTicketId ? [String(selectedTicketId)] : []}
                            onChange={(e) => setSelectedTicketId(Number(e.target.value))}
                            size="sm"
                            variant="bordered"
                          >
                            {propTicket?.filter(t => t.ticket_category === "Seated")
                              .map((t) => (
                                <SelectItem key={String(t.id)} value={String(t.id)}>
                                  {t.name}
                                </SelectItem>
                              )) as any}
                          </Select>
                        </div>

                        {/* Seat selection */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Reservasi Kursi</p>
                            <p className="text-xs text-grey">
                              {selectedSeats.length > 0
                                ? `${selectedSeats.length} kursi dipilih: ${selectedSeats.join(", ")}`
                                : "Belum ada kursi dipilih"}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowSeatPicker(true)}
                            className="flex items-center gap-1.5 text-xs text-primary-base border border-primary-base rounded-lg px-3 py-1.5 hover:bg-primary-light-100 transition-colors"
                          >
                            <Icon icon="mdi:sofa" width={14} />
                            <span>Pilih Kursi</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                <div className="flex flex-wrap gap-4">
                  <Box className="flex-1 relative min-w-[30%]">
                    <Select
                      isInvalid={Boolean(form.errors.invitation_cat_id)}
                      description={form.errors.invitation_cat_id}
                      label={<span className="text-dark">Invitation Category</span>}
                      value={form.values.invitation_cat_id}
                      onChange={(e) => form.setValues({ invitation_cat_id: category.find((_, i) => i == parseInt(e.target.value))?.id })}
                      labelPlacement="outside"
                    >
                      {category.map((e, i) => (
                        <SelectItem key={i} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <LoadingOverlay visible={loading.includes("getcategory")} loaderProps={{ size: "md", color: "#194e9e" }} />
                  </Box>
                  <Input
                    isInvalid={Boolean(form.errors.invitation_title)}
                    description={form.errors.invitation_title}
                    className="flex-1 min-w-[30%]"
                    label={<span className="text-dark">Invitation Title</span>}
                    value={form.values.invitation_title}
                    onChange={(e) => form.setValues({ invitation_title: e.target.value })}
                    labelPlacement="outside"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Textarea
                    isInvalid={Boolean(form.errors.invitation_description)}
                    description={form.errors.invitation_description}
                    className="flex-1 min-w-[30%]"
                    label={<span className="text-dark">Invitation Description</span>}
                    value={form.values.invitation_description}
                    onChange={(e) => form.setValues({ invitation_description: e.target.value })}
                    labelPlacement="outside"
                    minRows={3}
                    maxRows={6}
                  />
                </div>

                <Flex className={`gap-[15px] md:gap-[30px]`} align="end">
                  <Input
                    isInvalid={Boolean(form.errors.total_qty)}
                    description={form.errors.total_qty}
                    min={1}
                    type="number"
                    className="flex-1 max-w-[20%]"
                    label={<span className="text-dark">Total Qty</span>}
                    value={String(form.values.total_qty)}
                    onChange={(e) => form.setValues({ total_qty: parseInt(e.target.value) })}
                    labelPlacement="outside"
                  />
                  <Checkbox className={`md:mb-[10px]`} label="Kirim ke satu penerima" checked={form.values.is_one_receiver} onChange={(e) => form.setValues({ is_one_receiver: e.target.checked })} />
                  <Checkbox className={`md:mb-[10px]`} label="Sertakan Nomor Kursi" checked={!!form.values.is_seatnumber} onChange={(e) => form.setValues({ is_seatnumber: e.target.checked })} />
                  <Checkbox className={`md:mb-[10px]`} label="Sertakan Sesi" checked={!!form.values.is_session} onChange={(e) => form.setValues({ is_session: e.target.checked })} />
                </Flex>

                {(form.values.is_one_receiver ? [form.values.details[0]] : form.values.details).map((detail, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      isInvalid={Boolean(form.errors[`details.${index}.fullname`])}
                      description={form.errors.details ? form.errors[`details.${index}.fullname`] : undefined}
                      className="flex-1 min-w-0"
                      label={<span className="text-dark">{`Fullname ${index + 1}`}</span>}
                      value={detail.fullname}
                      onChange={(e) => form.setFieldValue(`details.${index}.fullname`, e.target.value)}
                      labelPlacement="outside"
                    />
                    <Input
                      isInvalid={Boolean(form.errors[`details.${index}.email`])}
                      description={form.errors.details ? form.errors[`details.${index}.email`] : undefined}
                      className="flex-1 min-w-0"
                      label={<span className="text-dark">{`Email ${index + 1}`}</span>}
                      value={detail.email}
                      onChange={(e) => form.setFieldValue(`details.${index}.email`, e.target.value)}
                      labelPlacement="outside"
                    />
                    {form.values.is_seatnumber && (
                      <Input
                        className="flex-1 min-w-0"
                        label={<span className="text-dark">{`Seat Number ${index + 1}`}</span>}
                        placeholder="Contoh: A1, B2"
                        value={(detail as any).seat_number || ""}
                        onChange={(e) => form.setFieldValue(`details.${index}.seat_number`, e.target.value)}
                        labelPlacement="outside"
                      />
                    )}
                    {form.values.is_session && (
                      <Input
                        className="flex-1 min-w-0"
                        label={<span className="text-dark">{`Sesi ${index + 1}`}</span>}
                        placeholder="Contoh: Sesi 1, Sesi A"
                        value={(detail as any).session || ""}
                        onChange={(e) => form.setFieldValue(`details.${index}.session`, e.target.value)}
                        labelPlacement="outside"
                      />
                    )}
                    <Input
                      isInvalid={Boolean(form.errors[`details.${index}.phone`])}
                      description={form.errors.details ? form.errors[`details.${index}.phone`] : undefined}
                      className="flex-1 min-w-0"
                      label={<span className="text-dark">{`Phone ${index + 1}`}</span>}
                      value={detail.phone}
                      onChange={(e) => form.setFieldValue(`details.${index}.phone`, e.target.value)}
                      labelPlacement="outside"
                    />
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onClick={handleSubmit} isLoading={loading.includes("submit")} className="bg-primary text-white">
                Tambah Invitation
              </Button>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddEventModal;
