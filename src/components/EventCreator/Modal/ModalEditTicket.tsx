import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, RadioGroup, Radio, Tabs, Tab } from "@nextui-org/react";
import { EventTicket } from "@/utils/formInterface";
import InputField from "@/components/Input";
import { useState, useEffect, useMemo, PropsWithChildren, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { TicketProps, TicketPropsInputRequest } from "@/utils/globalInterface";
import fetch from "@/utils/fetch";
import { Box, Checkbox, Flex, Switch, Modal as ModalM, Stack, Button, Card, TextInput, UnstyledButton, Text, Popover, Overlay, Portal, HoverCard } from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import { isNotEmpty, useForm } from "@mantine/form";
import TicketContainer from "@/components/TicketContainer";
import { modals } from "@mantine/modals";
import { Guide } from "@/components/Guide";
import { notifications } from "@mantine/notifications";
import { Context } from "@/pages/dashboard/create-event";
import { useRouter } from "next/router";

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  ticket: EventTicket[];
  setTicket(form: EventTicket[]): void;
  endDate: string | null;
  data: EventTicket;
  idx?: number | null;
  setIdx: (idx?: number) => void;
  eventId?: number;
  addTicketModal?: boolean;
  eventStartTime?: string;
  eventEndTime?: string;
  onSuccess?(): void;
}

export default function ModalEditTicket({ isOpen, setIsOpen, ticket, setTicket, endDate, data, idx, setIdx, eventId, addTicketModal, eventStartTime, eventEndTime, onSuccess }: ModalProps) {
  const defaultForm: EventTicket = {
    ticket_type: "",
    ticket_category_id: 1,
    ticket_category: "Festival",
    name: "",
    ticket_date: null,
    ticket_end: null,
    event_schedule_date: null,
    qty: 0,
    price: 0,
    description: "",
    starting_time: "00:00",
    ending_time: "00:00",
    is_promo: 0,
    promo_title: "",
    promo_price: 0,
    is_bundling: 0,
    bundling_qty: 0,
  };
  const {
    values: form,
    setValues: setForm,
    validate,
    errors,
  } = useForm<EventTicket>({
    initialValues: defaultForm,
    validate: {
      ticket_type: isNotEmpty(),
      ticket_category_id: isNotEmpty(),
      ticket_category: isNotEmpty(),
      name: isNotEmpty(),
      ticket_date: isNotEmpty(),
      ticket_end: isNotEmpty(),
      event_schedule_date: isNotEmpty(),
      qty: isNotEmpty(),
      price: isNotEmpty(),
      starting_time: isNotEmpty(),
      ending_time: isNotEmpty(),
    },
  });
  const [step, setStep] = useState(0);
  const [openForm, setOpenForm] = useState<number | null>();
  const [selected, setSelected] = useState<number>();
  const [hoveredTicket, setHoveredTicket] = useState<number>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { slug } = router.query;

  const refetchTickets = async () => {
    try {
      const response = await fetch({
        url: `event-ticket?event_id=${eventId}`,
        method: "GET",
      });

      if (response?.data) {
        // Update ticket list di parent atau state
        // Sesuaikan dengan struktur data yang digunakan
        setTicket(response.data); // Atau callback ke parent
      }
    } catch (error) {
      console.error("Error refetching tickets:", error);
    }
  };

  useEffect(() => {
    if (isOpen && typeof idx === "number") {
      // Jika modal dibuka dengan idx (mode edit), langsung buka form
      setOpenForm(idx);
    }
  }, [isOpen, idx]);

  useEffect(() => {
    if (typeof openForm == "number") {
      console.log("Setting form with ticket data:", ticket[openForm]);
      setForm(ticket[openForm]);
    } else {
      setForm(defaultForm);
    }
  }, [openForm]);

  // ATAU bisa langsung set dari data prop:
  useEffect(() => {
    if (isOpen && data && data.id) {
      console.log("Setting form from data prop:", data);
      setForm({ ...data });
    }
  }, [isOpen, data]);

  const submitTicket = async () => {
    console.log("=== SUBMIT TICKET ===");
    console.log("idx:", idx);
    console.log("form.id:", form.id);
    console.log("eventId:", eventId);
    console.log("form data:", form);

    if (eventId == undefined) {
      // Mode create event (belum ada eventId di database)
      let arr = [...ticket];
      if (typeof idx === "number") {
        arr[idx] = form;
      } else {
        arr.push(form);
      }
      setTicket(arr);
      setIsOpen(false);
      setIdx(undefined);
    } else {
      // Mode edit event (sudah ada eventId di database)
      setLoading(true); // Tambahkan loading state

      try {
        if (form.id) {
          // UPDATE MODE - Edit ticket yang sudah ada
          console.log(">>> MODE: UPDATE - Mengupdate ticket id:", form.id);

          const response = await fetch({
            url: `event-ticket/${form.id}`,
            method: "PUT",
            data: {
              ...form,
              event_id: String(eventId),
              available_seat_number: form.available_seat?.join(","),
              seat_color: form.seat_color ?? "#194e9e",
            } as TicketPropsInputRequest,
          });

          console.log("✓ Update berhasil", response);

          // PENTING: Refetch data ticket setelah update
          await refetchTickets(); // Pastikan function ini ada

          notifications.show({
            message: "Berhasil Update Tiket",
            color: "green",
          });
        } else {
          // CREATE MODE - Tambah ticket baru
          console.log(">>> MODE: CREATE - Membuat ticket baru");

          const response = await fetch({
            url: `event-ticket`,
            method: "POST",
            data: {
              ...form,
              event_id: String(eventId),
              available_seat_number: form.available_seat?.join(","),
              seat_color: form.seat_color ?? "#194e9e",
            } as TicketPropsInputRequest,
          });

          console.log("✓ Create berhasil, id:", response.data?.id);

          // PENTING: Refetch data ticket setelah create
          await refetchTickets(); // Pastikan function ini ada

          notifications.show({
            message: "Berhasil Tambah Tiket",
            color: "green",
          });
        }

        // Reset state setelah berhasil
        setIsOpen(false);
        setIdx(undefined);
        setOpenForm(undefined);
      } catch (err) {
        console.error("✗ Error:", err);
        notifications.show({
          message: form.id ? "Gagal Update Tiket" : "Gagal Tambah Tiket",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setForm({ ...data });
  }, [data]);

  const handleSaveTicket = () => {
    // if (validate().hasErrors) return;
    console.log("handleSaveTicket", form);

    if (typeof openForm === "number") {
      setTicket(ticket.map((e, i) => (i == openForm ? form : e)));
    } else {
      setTicket([...ticket, form]);
    }
    setOpenForm(undefined);
  };

  useEffect(() => {
    console.log("FORM", form);
  }, [form]);

  return (
    <div className="flex flex-col gap-2">
      <ModalM
        title={
          <HoverCard>
            <HoverCard.Target>
              <Text component="span">Kelola Tiket</Text>
            </HoverCard.Target>
          </HoverCard>
        }
        opened={isOpen}
        centered
        onClose={() => {
          setIdx(undefined);
          setIsOpen(false);
        }}
        size="lg"
        className="text-dark"
      >
        <Stack gap={10} h="calc(100vh - 160px)" pb={10}>
          <Flex gap={20} h="100%">
            <Card p={10} display={openForm === undefined && ticket.length > 0 ? undefined : "none"} className="w-full h-full">
              <Stack gap={15} h="100%">
                <TextInput leftSection={<Icon icon="uiw:search" />} placeholder="Cari Tiket" />

                <Stack gap={10} className="overflow-y-auto h-full">
                  {ticket.map((e, i) => (
                    <UnstyledButton key={i}>
                      <Box onMouseEnter={() => setHoveredTicket(i)} onMouseLeave={() => setHoveredTicket(undefined)} className={`${selected == i ? "!border !border-primary-base rounded-lg" : ""}`}>
                        <TicketContainer
                          key={i}
                          type={e.ticket_type}
                          category={e.ticket_category}
                          price={e.price}
                          ticketDate={e.ticket_date}
                          ticketEnd={e.ticket_end}
                          description={e.description}
                          name={e.name}
                          onEdit={() => {
                            setIdx(e?.id);
                            setOpenForm(i);
                          }}
                          //   onDelete={() => handleDeleteTicket(i)}
                        />
                      </Box>
                    </UnstyledButton>
                  ))}
                </Stack>

                <Button display={!eventId ? undefined : "none"} variant="light" size="md" onClick={() => setOpenForm(null)} rightSection={<Icon icon="uiw:plus" />} className="shrink-0">
                  Tambah Tiket
                </Button>
              </Stack>
            </Card>

            <div className={`${openForm !== undefined || ticket.length == 0 ? "flex" : "hidden"} h-full w-full overflow-auto flex-col gap-2 pb-4`}>
              <Flex display={ticket.length > 0 ? undefined : "none"}>
                <Button onClick={() => setOpenForm(undefined)} px={0} fw={400} leftSection={<Icon icon="uiw:left" />} variant="transparent" color="gray">
                  Kembali
                </Button>
              </Flex>

              {step === 0 && (
                <>
                  <RadioGroup
                    label={
                      <p className="">
                        Kategori Tiket<span className="text-danger"> *</span>
                      </p>
                    }
                    className="gap-1 w-full"
                    size="md"
                    color="primary"
                    value={form.ticket_category}
                    onChange={(e) => setForm({ ticket_category: e.target.value == "Seated" ? "Seated" : "Festival" })}
                  >
                    <div className="grid grid-cols-2">
                      <Radio
                        classNames={{
                          base: "data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1",
                        }}
                        value="Festival"
                      >
                        Festival
                      </Radio>
                      <Radio
                        classNames={{
                          base: "opacity-50 md:!opacity-100 pointer-events-none md:!pointer-events-auto data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1",
                        }}
                        value="Seated"
                      >
                        Seat
                      </Radio>
                    </div>
                  </RadioGroup>

                  <RadioGroup
                    label={
                      <p className="">
                        Jenis Tiket<span className="text-danger"> *</span>
                      </p>
                    }
                    className="gap-1 w-full"
                    size="md"
                    color="primary"
                    value={form.ticket_type}
                    onChange={(e: any) => setForm({ ...form, ticket_type: e.target.value })}
                  >
                    <div className="grid grid-cols-2">
                      <Radio
                        classNames={{
                          base: `data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1
                              ${errors["ticket_type"] ? "!border-red-400 !border-1" : ""}`,
                        }}
                        value="Berbayar"
                      >
                        Berbayar
                      </Radio>
                      <Radio
                        classNames={{
                          base: `data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-md pr-6 border-2 border-primary-light-200 max-w-full rounded-lg ml-0.5 mr-3 my-1
                              ${errors["ticket_type"] ? "!border-red-400 !border-1" : ""}`,
                        }}
                        value="Gratis"
                      >
                        Gratis
                      </Radio>
                    </div>
                  </RadioGroup>

                  <InputField error={Boolean(errors["name"])} type="text" label="Nama Tiket" placeholder="Nama Tiket" required fullWidth value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />

                  <div className="grid grid-cols-1 my-2">
                    <InputField
                      error={Boolean(errors["event_schedule_date"])}
                      type="date"
                      label="Tgl Event"
                      required
                      value={form.event_schedule_date && form.event_schedule_date}
                      minDateVal={form.ticket_date ? form.ticket_date : undefined}
                      maxDateVal={endDate ? endDate : undefined}
                      onChange={(e: any) => {
                        e && setForm({ ...form, event_schedule_date: e.toString() });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2">
                    <InputField
                      error={Boolean(errors["ticket_date"])}
                      type="date"
                      label="Tgl Mulai Penjualan"
                      required
                      maxDateVal={endDate ? endDate : undefined}
                      value={form.ticket_date && form.ticket_date}
                      onChange={(e: any) => e && setForm({ ...form, ticket_date: e.toString() })}
                    />
                    <InputField
                      error={Boolean(errors["ticket_end"])}
                      type="date"
                      label="Tgl Berakhir Penjualan"
                      required
                      value={form.ticket_end && form.ticket_end}
                      minDateVal={form.ticket_date ? form.ticket_date : undefined}
                      maxDateVal={endDate ? endDate : undefined}
                      onChange={(e: any) => e && setForm({ ...form, ticket_end: e.toString() })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2">
                    <InputField
                      error={Boolean(errors["starting_time"])}
                      type="time"
                      label="Jam Mulai Penjualan"
                      required
                      value={form.starting_time && form.starting_time}
                      onChange={(e: any) => e && setForm({ ...form, starting_time: e.toString() })}
                    />
                    <InputField
                      error={Boolean(errors["ending_time"])}
                      type="time"
                      label="Jam Berakhir Penjualan"
                      required
                      value={form.ending_time && form.ending_time}
                      onChange={(e: any) => e && setForm({ ...form, ending_time: e.toString() })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 my-2">
                    <InputField
                      className={`${form.ticket_type == "Gratis" ? "hidden" : ""}`}
                      error={Boolean(errors["price"])}
                      type="num"
                      label="Harga Tiket"
                      required
                      disabled={form.ticket_type === "Gratis"}
                      fullWidth
                      value={form.price > 0 && form.price}
                      onChange={(e: any) => setForm({ ...form, price: e.target.value })}
                      placeholder="Masukan Harga"
                    />
                    <InputField
                      className={`${form.ticket_category == "Seated" ? "hidden" : ""}`}
                      error={Boolean(errors["qty"])}
                      type="num"
                      label="Jumlah Tiket"
                      required
                      fullWidth
                      value={form.qty > 0 && form.qty}
                      onChange={(e: any) => setForm({ ...form, qty: e.target.value })}
                      placeholder="Masukan Jumlah"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 my-2">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <Checkbox
                        label={<span className="font-medium text-sm text-dark">Promo</span>}
                        checked={form.is_promo === 1}
                        onChange={(event) => setForm({ ...form, is_promo: event.currentTarget.checked ? 1 : 0 })}
                      />
                      {form.is_promo === 1 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <InputField
                            type="text"
                            label="Nama Promo"
                            placeholder="Nama Promo"
                            fullWidth
                            value={form.promo_title || ""}
                            onChange={(e: any) => setForm({ ...form, promo_title: e.target.value })}
                          />
                          <InputField
                            type="num"
                            label="Harga Promo"
                            placeholder="Harga Promo"
                            fullWidth
                            value={form.promo_price || ""}
                            onChange={(e: any) => setForm({ ...form, promo_price: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 my-2">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <Checkbox
                        label={<span className="font-medium text-sm text-dark">Bundling</span>}
                        checked={form.is_bundling === 1}
                        onChange={(event) => setForm({ ...form, is_bundling: event.currentTarget.checked ? 1 : 0 })}
                      />
                      {form.is_bundling === 1 && (
                        <div className="mt-3">
                          <p className="mb-1 text-grey text-sm">
                            Jumlah Tiket Bundling<span className="text-danger"> *</span>
                          </p>
                          <select
                            className="w-full border border-primary-light-200 shadow-sm focus:outline-primary-disabled rounded-lg px-3 py-2 text-sm bg-white"
                            value={form.bundling_qty || ""}
                            onChange={(e: any) => setForm({ ...form, bundling_qty: Number(e.target.value) })}
                          >
                            <option value="" disabled>Pilih Jumlah Tiket</option>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <option key={num} value={num}>{num} Tiket</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <InputField
                    error={Boolean(errors["description"])}
                    type="textarea"
                    label="Deskripsi"
                    placeholder="Deskripsi Tiket"
                    fullWidth
                    value={form.description}
                    onChange={(e: any) => setForm({ ...form, description: e.target.value })}
                  />
                </>
              )}

              <Flex justify="end" py={10} className="sticky bottom-[-15px] bg-white">
                <button
                  className="w-[200px] ml-auto text-white bg-primary-dark rounded-full py-2"
                  onClick={() => {
                    handleSaveTicket();
                    !!eventId && submitTicket();
                  }}
                >
                  {openForm === null ? "Tambah Tiket" : "Simpan Tiket"}
                </button>
              </Flex>
            </div>
          </Flex>
        </Stack>
      </ModalM>
    </div>
  );
}
