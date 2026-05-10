import { useState, useEffect, createContext, SetStateAction, Dispatch } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import imagePlus from "../../../../../assets/icon/image-plus.png";
import { faCalendar, faClock } from "@fortawesome/free-regular-svg-icons";
import { Alert, LoadingOverlay, TagsInput, Paper, Grid as MantineGrid } from "@mantine/core";
import { Tabs, Tab, Checkbox, Switch, Select, SelectItem, Spinner } from "@nextui-org/react";
import { faLocationDot, faExclamation, faExclamationCircle, faSave, faFileAlt, faArrowLeft, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputField from "@/components/Input";
import InputEditor from "@/components/Input/InputEditor";
import TicketContainer from "@/components/TicketContainer";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import ModalDate from "@/components/EventCreator/Modal/ModalDate";
import ModalTime from "@/components/EventCreator/Modal/ModalTime";
import ModalTicket from "@/components/EventCreator/Modal/ModalTicket";
import { FormEvent, EventTicket, SeatmapData } from "@/utils/formInterface";
import ModalLocation from "@/components/EventCreator/Modal/ModalLocation";
import ModalCreateTicket from "@/components/EventCreator/Modal/ModalCreateTicket";
import { Get, Put } from "@/utils/REST";
import { formatDate } from "@/utils/useFormattedDate";
import { toast } from "react-toastify";
import Button from "@/components/Button";
import React from "react";
import { useListState, UseListStateHandlers } from "@mantine/hooks";
import { defaultSeatmapData } from "@/components/Seatmap";
import { Icon } from "@iconify/react/dist/iconify.js";

const option = [
  { key: 1, label: "1 Tiket" },
  { key: 2, label: "2 Tiket" },
  { key: 3, label: "3 Tiket" },
  { key: 4, label: "4 Tiket" },
  { key: 5, label: "5 Tiket" },
  { key: 6, label: "6 Tiket" },
  { key: 7, label: "7 Tiket" },
  { key: 8, label: "8 Tiket" },
  { key: 9, label: "9 Tiket" },
  { key: 10, label: "10 Tiket" },
];

interface ErrorResponse {
  name?: string[];
  tag?: string[];
  start_date?: string[];
  end_date?: string[];
  start_time?: string[];
  end_time?: string[];
  zone_time?: string[];
  organization_method?: string[];
  location_name?: string[];
  location_city?: string[];
  location_address?: string[];
  location_map?: string[];
  description?: string[];
  term_condition?: string[];
  creator_id?: string[];
}

export const Context = createContext<{
  seatmapData: SeatmapData[];
  setSeatmapData?: UseListStateHandlers<SeatmapData>;
  ticket: EventTicket[];
}>({
  seatmapData: [],
  ticket: [],
});

const EditEventAdmin = () => {
  const router = useRouter();
  const { slug_url } = router.query;
  const [ticket, setTicket] = useState<EventTicket[]>([]);
  const [form, setForm] = useState<any>({
    creator_id: 0,
    name: "",
    image: "",
    event_format_id: 1,
    event_topic_id: 1,
    tag: "",
    event_type_id: 1,
    start_date: null,
    end_date: null,
    start_time: "",
    end_time: "",
    zone_time: "Asia/Jakarta",
    organization_method: "Offline",
    location_name: "",
    location_city: "",
    location_address: "",
    location_map: "",
    longitude: "",
    latitude: "",
    is_name: true,
    is_phone_number: true,
    is_birthdate: false,
    is_email: true,
    is_noidentity: true,
    is_gender: false,
    max_buy_ticket: 1,
    one_email_ticket: false,
    one_id_one_ticket: false,
    description: "",
    term_condition: "",
    save_as_draft: false,
    is_promo: 0,
    is_bundling: 0,
    is_assistant: false,
    is_profession: false,
    is_company: false,
    tickets: [],
    // Admin specific
    slug: "",
    event_status_id: 3,
    payment_method_custom: "QRIS,BCA,BNI,BRI,MANDIRI",
    max_use_voucher: 2,
    ppn_type: "percentage",
    ppn: 0,
    starting_price: 1000,
    is_insurance: 0,
    insurance_required: 0,
    insurance_amount: null,
  });

  const defaultTicket: EventTicket = {
    ticket_type: "Berbayar",
    ticket_category_id: 1,
    ticket_category: "Festival",
    name: "",
    ticket_date: null,
    ticket_end: null,
    event_schedule_date: null,
    qty: 0,
    price: 0,
    description: "",
    is_promo: 0,
    promo_title: "",
    promo_price: 0,
    is_bundling: 0,
    bundling_qty: 0,
    is_soldout: 0,
    is_finish: 0,
    is_ready: 0,
    is_fullbook: 0,
  };

  const [error, setError] = useState<ErrorResponse>({});
  const [image, setImage] = useState<string | null>(null);
  const [editTicket, setEditTicket] = useState<EventTicket>(defaultTicket);
  const [idxTicket, setIdxTicket] = useState<number>();
  const [showDate, setShowDate] = useState<boolean>(false);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [showTicket, setShowTicket] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(false);
  const [addTicket, showAddTicket] = useState<boolean>(false);
  const [tagSuggestion, setTagSuggestion] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [tab, setTab] = useState<string>("info");
  const [creators, setCreators] = useState<any[]>([]);
  const [seatmapData, setSeatmapData] = useListState<SeatmapData>(defaultSeatmapData);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (slug_url) fetchEventData();
  }, [slug_url]);

  const fetchInitialData = async () => {
    try {
      const [tagsRes, creatorsRes] = await Promise.all([
        Get("category", {}),
        Get("creator", {})
      ]);
      setTagSuggestion((tagsRes as any).data.map((e: any) => e.name));
      
      let creatorsData = [];
      if (Array.isArray((creatorsRes as any).data)) creatorsData = (creatorsRes as any).data;
      else if ((creatorsRes as any).data && Array.isArray((creatorsRes as any).data.data)) creatorsData = (creatorsRes as any).data.data;
      setCreators(creatorsData);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    }
  };

  const fetchEventData = () => {
    setLoadingInitial(true);
    Get(`admin-data/event/${slug_url}`, {})
      .then((res: any) => {
        const data = res.data;
        const {
          image_thumbnail,
          has_event_ticket,
          has_creator,
          has_event_status,
          has_event_payment_method,
          has_event_social_meida,
          has_venue_layout,
          has_category_event,
          has_merches,
          has_insurances,
          has_event_format,
          has_event_topic,
          has_event_type,
          ...rest
        } = data;

        setForm({
          ...rest,
          is_name: !!data.is_name,
          is_phone_number: !!data.is_phone_number,
          is_birthdate: !!data.is_birthdate,
          is_email: !!data.is_email,
          is_noidentity: !!data.is_noidentity,
          is_gender: !!data.is_gender,
          is_assistant: !!data.is_assistant,
          is_profession: !!data.is_profession,
          is_company: !!data.is_company,
          max_buy_ticket: data.max_buy_ticket || 1,
          one_email_ticket: !!data.one_email_ticket || data.one_email_ticket === "1",
          one_id_one_ticket: !!data.one_id_one_ticket || data.one_id_one_ticket === "1",
          is_insurance: data.is_insurance || 0,
          insurance_required: data.insurance_required || 0,
          insurance_amount: data.insurance_amount || null,
        });

        setTicket(
          (data.has_event_ticket as EventTicket[]).map((e: any) => ({
            ...e,
            available_seat: e.available_seat_number ? e.available_seat_number.split(",") : [],
          }))
        );

        setImage(data.image_url || data.image_base64);

        const seatmap = data.seatmap ? JSON.parse(data.seatmap) : [];
        setSeatmapData.setState(seatmap);
      })
      .catch((err) => {
        toast.error("Gagal memuat data event");
        console.error(err);
      })
      .finally(() => setLoadingInitial(false));
  };

  const submitEvent = () => {
    setLoading(true);
    const payload = {
      ...form,
      is_name: form.is_name ? 1 : 0,
      is_phone_number: form.is_phone_number ? 1 : 0,
      is_birthdate: form.is_birthdate ? 1 : 0,
      is_email: form.is_email ? 1 : 0,
      is_noidentity: form.is_noidentity ? 1 : 0,
      is_gender: form.is_gender ? 1 : 0,
      is_assistant: form.is_assistant ? 1 : 0,
      is_profession: form.is_profession ? 1 : 0,
      is_company: form.is_company ? 1 : 0,
      one_email_ticket: form.one_email_ticket ? "1" : "0",
      one_id_one_ticket: form.one_id_one_ticket ? "1" : "0",
      is_insurance: form.is_insurance ? 1 : 0,
      insurance_required: form.insurance_required ? 1 : 0,
      insurance_amount: form.insurance_amount,
      tickets: ticket.map((e) => ({ ...e, available_seat_number: e.available_seat?.join(","), seat_color: e.seat_color ?? "#194e9e" })),
      seatmap: ticket.some((e) => e.ticket_category == "Seated") && seatmapData ? JSON.stringify(seatmapData) : null,
    };

    Put(`admin-data/event/${slug_url}`, payload)
      .then((res: any) => {
        toast.success("Event Berhasil Diupdate (Admin)");
        router.push("/dashboard/admin/event");
      })
      .catch((err) => {
        const errorObj = err?.response?.data?.errors || {};
        toast.error(err?.response?.data?.message || "Terjadi Kesalahan");
        setError(errorObj);
      })
      .finally(() => setLoading(false));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setForm({ ...form, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const onEditTicket = (data: EventTicket, idx: number) => {
    setIdxTicket(idx);
    setEditTicket(data);
    showAddTicket(true);
  };

  const onAddTicket = () => {
    setEditTicket({ ...defaultTicket });
    setIdxTicket(undefined);
    showAddTicket(true);
  };

  const deleteTicket = (idx: number) => {
    let arr = [...ticket];
    arr.splice(idx, 1);
    setTicket(arr);
  };

  return (
    <>
      <LoadingOverlay visible={loadingInitial || loading} />
      <div className="text-dark min-h-screen max-w-full mx-auto pt-2 pb-32 border-primary-light-200 px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="max-w-[1400px] mx-auto mb-6 text-center md:text-start flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Edit Event (Admin)</h1>
            <p className="text-grey">Lengkapi form dibawah ini untuk merubah event sebagai admin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-[1400px] mx-auto">
          <div className="md:pr-2 xl:pr-6">
            <label className="w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-chat flex flex-col items-center justify-center h-72 gap-4 cursor-pointer">
              <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
              {image ? (
                <Image src={image} alt="image" className="object-cover" width={0} height={0} style={{ width: "100%", height: "100%" }} unoptimized />
              ) : (
                <>
                  <Image src={imagePlus} alt="image-plus" />
                  <h3 className="font-semibold text-medium text-center">Unggah gambar/poster/banner</h3>
                  <p className="text-grey text-center text-sm px-8">Direkomendasikan ukuran 724 x 340px</p>
                </>
              )}
            </label>

            <div className="mt-8">
              <Select
                label="Pilih Penyelenggara (Creator)"
                placeholder="Cari creator..."
                variant="bordered"
                radius="sm"
                className="mb-4"
                selectedKeys={form.creator_id ? [form.creator_id.toString()] : []}
                onChange={(e) => setForm({ ...form, creator_id: Number(e.target.value) })}
              >
                {creators.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name || c.name_event_organizer || "Unknown"}
                  </SelectItem>
                ))}
              </Select>

              <InputField type="text" placeholder="Nama Event" fullWidth value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
              {error?.name && <p className="text-danger text-xs mt-1">{error.name[0]}</p>}
            </div>

            <div className="mb-8 mt-2 text-sm">
              <TagsInput
                multiple
                radius={8}
                placeholder="Tag; Contoh: hiburan, musik, budaya"
                data={tagSuggestion}
                value={!form.tag ? [] : form.tag.split(",")}
                onChange={(e) => setForm({ ...form, tag: e.join(",") })}
                error={error?.tag && error.tag[0]}
              />
            </div>

            <div className="w-full rounded-lg">
              <div className="w-full border-primary-light-200 text-grey text-sm py-2 px-2 flex items-center cursor-pointer" onClick={() => setShowDate(!showDate)}>
                <FontAwesomeIcon icon={faCalendar} size="lg" className="w-5 mr-2" />
                {form.start_date && form.end_date ? (
                  <p className="text-dark">{formatDate(form.start_date)} - {formatDate(form.end_date)}</p>
                ) : (
                  <p>Atur Tanggal Event</p>
                )}
              </div>
              <div className="w-full border-y-2 border-primary-light-200 text-grey text-sm py-2 px-2 flex items-center cursor-pointer" onClick={() => setShowTime(!showTime)}>
                <FontAwesomeIcon icon={faClock} size="lg" className="w-5 mr-2" />
                {form.start_time && form.end_time ? (
                  <p className="text-dark">{form.start_time} - {form.end_time} {form.zone_time}</p>
                ) : (
                  <p>Atur Waktu Event</p>
                )}
              </div>
              <div className="w-full border-primary-light-200 text-grey text-sm py-2 px-2 mb-3 flex items-center cursor-pointer" onClick={() => setShowLocation(!showLocation)}>
                <FontAwesomeIcon icon={faLocationDot} size="lg" className="w-5 mr-2" />
                {form.organization_method !== "" ? (
                  <p className="text-dark">{form.location_name || form.location_map || "Lokasi Teratur"}</p>
                ) : (
                  <p>Atur Alamat Event</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:pl-2 xl:pl-6">
            <Tabs
              selectedKey={tab}
              onSelectionChange={(e) => setTab(e as string)}
              variant="solid"
              fullWidth
              classNames={{
                tabList: "pb-0 self-center font-semibold rounded-b-none bg-white",
                tab: "p-5",
                cursor: "rounded-b-none border-b-2 border-b-primary-base",
              }}
            >
              <Tab key="info" title="Info Tiket">
                <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                  <div className="border-b-2 border-primary-light-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-medium font-semibold">Tiket</h3>
                    <div className="flex items-center gap-2 text-sm text-primary-dark cursor-pointer" onClick={onAddTicket}>
                      <button className="border-1.5 border-primary-dark rounded-full p-0.5 flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlus} size="sm" />
                      </button>
                      <p>Tambah Tiket</p>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-[10px] max-h-[450px] overflow-y-auto custom-scrollbar">
                    {ticket.length === 0 ? (
                      <Alert icon={<Icon icon="uiw:information-o" />} color="gray" variant="light">Belum ada tiket</Alert>
                    ) : (
                      ticket.map((el, index) => (
                        <TicketContainer
                          key={index}
                          type={el.ticket_type}
                          category={el.ticket_category}
                          price={el.price}
                          ticketDate={el.ticket_date}
                          ticketEnd={el.ticket_end}
                          description={el.description}
                          name={el.name}
                          onEdit={() => onEditTicket(el, index)}
                          onDelete={() => deleteTicket(index)}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                  <div className="border-b-2 border-primary-light-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-medium font-semibold">Formulir Data Pemesan</h3>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <Checkbox color="default" isSelected={form.is_name} classNames={{ label: "text-sm" }} onChange={(e: any) => setForm({ ...form, is_name: e.target.checked })}>
                        Nama Lengkap
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={form.is_email} onChange={(e: any) => setForm({ ...form, is_email: e.target.checked })}>
                        Email
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={form.is_phone_number} onChange={(e: any) => setForm({ ...form, is_phone_number: e.target.checked })}>
                        No. Handphone
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={form.is_noidentity} onChange={(e: any) => setForm({ ...form, is_noidentity: e.target.checked })}>
                        No. KTP
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={form.is_birthdate} onChange={(e: any) => setForm({ ...form, is_birthdate: e.target.checked })}>
                        Tanggal Lahir
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={form.is_gender} onChange={(e: any) => setForm({ ...form, is_gender: e.target.checked })}>
                        Jenis Kelamin
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={form.is_assistant} onChange={(e: any) => setForm({ ...form, is_assistant: e.target.checked })}>
                        Asisten
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={form.is_profession} onChange={(e: any) => setForm({ ...form, is_profession: e.target.checked })}>
                        Profesi
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={form.is_company} onChange={(e: any) => setForm({ ...form, is_company: e.target.checked })}>
                        Perusahaan
                      </Checkbox>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                  <div className="border-b-2 border-primary-light-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-medium font-semibold">Pengaturan Tiket</h3>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <div>
                          <p>Jumlah maks. tiket dalam 1 transaksi</p>
                          <p className="text-grey text-xs">Jumlah maksimal tiket yang dapat dibeli dalam 1 transaksi</p>
                        </div>
                        <Select
                          variant="underlined"
                          className="w-32 md:w-40 lg:w-24"
                          aria-label="Options"
                          size="sm"
                          defaultSelectedKeys={form.max_buy_ticket ? [form.max_buy_ticket.toString()] : []}
                          onChange={(e: any) => setForm({ ...form, max_buy_ticket: Number(e.target.value) })}
                          selectedKeys={form.max_buy_ticket ? [form.max_buy_ticket.toString()] : []}
                          classNames={{
                            listbox: "text-dark max-h-40 overflow-auto",
                            popoverContent: "w-full sm:w-48 md:w-56 lg:w-64",
                          }}
                        >
                          {option.map((item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p>1 akun email untuk 1 kali transaksi</p>
                          <p className="text-grey text-xs">1 akun email hanya dapat melakukan 1 kali transaksi pembelian tiket</p>
                        </div>
                        <div>
                          <Switch size="sm" isSelected={form.one_email_ticket} onChange={(e: any) => setForm({ ...form, one_email_ticket: e.target.checked })} />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p>1 tiket untuk 1 data pemesan</p>
                          <p className="text-grey text-xs">Data setiap tiket tidak boleh sama</p>
                        </div>
                        <div>
                          <Switch size="sm" isSelected={form.one_id_one_ticket} onChange={(e: any) => setForm({ ...form, one_id_one_ticket: e.target.checked })} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab key="detail" title="Detail Event">
                <div className="border-2 border-primary-light-200 rounded-2xl my-5">
                  <div className="border-b-2 border-primary-light-200 px-4 py-3">
                    <h3 className="text-medium font-semibold">Deskripsi</h3>
                  </div>
                  <div className="p-5">
                    <InputEditor theme="snow" value={form.description} onChange={(v: any) => setForm({ ...form, description: v })} placeholder="Ketik Deskripsi" />
                  </div>
                </div>
                <div className="border-2 border-primary-light-200 rounded-2xl my-5">
                  <div className="border-b-2 border-primary-light-200 px-4 py-3">
                    <h3 className="text-medium font-semibold">Syarat & Ketentuan</h3>
                  </div>
                  <div className="p-5">
                    <InputEditor theme="snow" value={form.term_condition} onChange={(v: any) => setForm({ ...form, term_condition: v })} placeholder="Ketik S&K" />
                  </div>
                </div>
              </Tab>

              <Tab key="admin" title={<div className="flex items-center gap-2"><FontAwesomeIcon icon={faGear} /> Admin</div>}>
                <div className="border-2 border-primary-light-200 rounded-2xl my-5 p-5">
                  <MantineGrid>
                    <MantineGrid.Col span={6}>
                      <InputField label="URL Slug" type="text" fullWidth noShadow value={form.slug} onChange={(e: any) => setForm({ ...form, slug: e.target.value })} />
                    </MantineGrid.Col>
                    <MantineGrid.Col span={6}>
                      <InputField label="Status ID (3=Review, 1=Active)" type="num" fullWidth noShadow value={form.event_status_id} onChange={(e: any) => setForm({ ...form, event_status_id: Number(e.target.value) })} />
                    </MantineGrid.Col>
                    <MantineGrid.Col span={12}>
                      <InputField label="Metode Pembayaran (Custom)" type="text" fullWidth noShadow value={form.payment_method_custom} onChange={(e: any) => setForm({ ...form, payment_method_custom: e.target.value })} />
                    </MantineGrid.Col>
                    <MantineGrid.Col span={6}>
                      <Select
                        label="Tipe PPN"
                        placeholder="Pilih tipe PPN"
                        variant="bordered"
                        radius="sm"
                        classNames={{
                          trigger: "!shadow-none"
                        }}
                        selectedKeys={form.ppn_type ? [form.ppn_type] : []}
                        onChange={(e) => setForm({ ...form, ppn_type: e.target.value })}
                      >
                        <SelectItem key="percentage" value="percentage">Percentage (%)</SelectItem>
                        <SelectItem key="nominal" value="nominal">Nominal (Rp)</SelectItem>
                      </Select>
                    </MantineGrid.Col>
                    <MantineGrid.Col span={6}>
                      <InputField 
                        label={form.ppn_type === "percentage" ? "PPN (%)" : "PPN (Nominal)"} 
                        type="num" 
                        fullWidth 
                        noShadow
                        value={form.ppn} 
                        onChange={(e: any) => setForm({ ...form, ppn: Number(e.target.value) })} 
                      />
                    </MantineGrid.Col>
                    <MantineGrid.Col span={4}>
                      <InputField label="Starting Price" type="num" fullWidth noShadow value={form.starting_price} onChange={(e: any) => setForm({ ...form, starting_price: Number(e.target.value) })} />
                    </MantineGrid.Col>
                    <MantineGrid.Col span={4}>
                      <InputField label="Maks Penggunaan Voucher" type="num" fullWidth noShadow value={form.max_use_voucher} onChange={(e: any) => setForm({ ...form, max_use_voucher: Number(e.target.value) })} />
                    </MantineGrid.Col>
                    <MantineGrid.Col span={12}>
                      <div className="flex flex-col gap-4 p-4 border border-primary-light-200 rounded-lg bg-chat/50 mt-2">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            isSelected={form.is_insurance === 1}
                            onChange={(e: any) => setForm({ ...form, is_insurance: e.target.checked ? 1 : 0, insurance_required: e.target.checked ? form.insurance_required : 0, insurance_amount: e.target.checked ? form.insurance_amount : null })}
                          >
                            Aktifkan Asuransi
                          </Checkbox>
                          {form.is_insurance === 1 && (
                            <Checkbox
                              isSelected={form.insurance_required === 1}
                              onChange={(e: any) => setForm({ ...form, insurance_required: e.target.checked ? 1 : 0 })}
                            >
                              Wajib Asuransi
                            </Checkbox>
                          )}
                        </div>
                        {form.is_insurance === 1 && (
                          <div className="max-w-xs">
                            <InputField
                              label="Biaya Asuransi"
                              type="num"
                              fullWidth
                              noShadow
                              placeholder="Masukan biaya asuransi"
                              value={form.insurance_amount}
                              onChange={(e: any) => setForm({ ...form, insurance_amount: Number(e.target.value) })}
                            />
                          </div>
                        )}
                      </div>
                    </MantineGrid.Col>
                  </MantineGrid>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-light-200 fixed bottom-0 left-0 md:left-[65px] right-0 bg-white shadow-lg z-40 p-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <p className="text-sm font-bold hidden md:block">Mode Admin: Konfigurasi event secara penuh.</p>
          <div className="flex gap-4 w-full md:w-auto">
            <Button className="flex-1 md:flex-none" onClick={() => router.back()} color="secondary" label="Batal" />
            <Button className="flex-1 md:flex-none" onClick={submitEvent} color="primary" disabled={loading} startIcon={faSave} label={loading ? "Loading..." : "Simpan Perubahan"} />
          </div>
        </div>
      </div>

      <ModalDate isOpen={showDate} setIsOpen={setShowDate} form={form} setForm={setForm} />
      <ModalTime isOpen={showTime} setIsOpen={setShowTime} form={form} setForm={setForm} />
      <ModalLocation isOpen={showLocation} setIsOpen={setShowLocation} form={form} setForm={setForm} />
      <Context.Provider value={{ seatmapData, setSeatmapData, ticket }}>
        <ModalCreateTicket
          isOpen={addTicket}
          setIsOpen={showAddTicket}
          ticket={ticket}
          setTicket={setTicket}
          data={editTicket}
          setIdx={setIdxTicket}
          idx={idxTicket}
          eventId={form.id}
          endDate={form.end_date}
          eventStartTime={form.start_time}
          eventEndTime={form.end_time}
        />
      </Context.Provider>
    </>
  );
};

export default EditEventAdmin;
