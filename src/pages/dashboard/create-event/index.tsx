import { useState, useEffect, useRef, useCallback, createContext, SetStateAction, Dispatch } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import useLoggedUser from "@/utils/useLoggedUser";
import { UserProps } from "@/utils/globalInterface";
import imagePlus from "../../../assets/icon/image-plus.png";
import { faCalendar, faClock } from "@fortawesome/free-regular-svg-icons";
import { Alert, LoadingOverlay, TagsInput } from "@mantine/core";
import { Tabs, Tab, Checkbox, Switch, Select, SelectItem, Spinner } from "@nextui-org/react";
import { faLocationDot, faExclamation, faExclamationCircle, faSave, faFileAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
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
import { Get, Post, Put } from "@/utils/REST";
import { formatDate, formatYear } from "@/utils/useFormattedDate";
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
}

export const Context = createContext<{
  seatmapData: SeatmapData[];
  setSeatmapData?: UseListStateHandlers<SeatmapData>;
  ticket: EventTicket[];
  eventData?: FormEvent | null;
}>({
  seatmapData: [],
  ticket: [],
  eventData: null,
});

const CreateEvent = () => {
  const router = useRouter();
  const [ticket, setTicket] = useState<EventTicket[]>([]);
  const [form, setForm] = useState<FormEvent>({
    creator_id: 0,
    name: "",
    image: "",
    event_format_id: 0,
    event_topic_id: 0,
    tag: "",
    event_type_id: 0,
    start_date: null,
    end_date: null,
    start_time: "",
    end_time: "",
    zone_time: "",
    organization_method: "",
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
    is_kelas: false,
    is_merch: false,
    is_session: 0,
    tickets: ticket,
  });
  const observerRef = useRef<MutationObserver | null>(null);

  const syaratToolbarRef = useCallback((container: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!container) return;

    const inject = () => {
      const toolbar = container.querySelector('.ql-toolbar') as HTMLElement;
      if (!toolbar || toolbar.querySelector('.btn-syarat-default')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-syarat-default';
      btn.title = 'S&K Kolektix';
      btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:none;border-radius:4px;background:transparent;color:#9ca3af;cursor:pointer;transition:all 0.2s;margin-left:auto;flex-shrink:0;';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>';

      btn.onmouseenter = () => { btn.style.color = '#0052CC'; btn.style.backgroundColor = '#e2eefe'; };
      btn.onmouseleave = () => { btn.style.color = '#9ca3af'; btn.style.backgroundColor = 'transparent'; };
      btn.onclick = () => {
        const setFormRef = (window as any).__setFormSyarat;
        const formRef = (window as any).__formSyarat;
        if (setFormRef && formRef) {
          setFormRef({
            ...formRef,
            term_condition: `<ol><li>Tiket yang sah hanya tiket yang dibeli melalui Kolektix.com atau kanal resmi yang ditunjuk oleh penyelenggara.</li><li>Setiap tiket hanya berlaku untuk satu orang dan hanya dapat digunakan sesuai dengan ketentuan yang berlaku pada acara.</li><li>Penyelenggara tidak bertanggung jawab atas pembelian tiket yang dilakukan melalui calo, pihak ketiga, marketplace, atau kanal penjualan yang tidak resmi.</li><li>Pengunjung wajib menunjukkan e-ticket yang valid dan dapat diminta untuk menunjukkan kartu identitas yang masih berlaku pada saat proses check-in atau penukaran tiket.</li><li>Tiket yang hilang, dicuri, rusak, atau disalahgunakan tidak dapat diganti, diterbitkan ulang, maupun dikembalikan dan sepenuhnya menjadi tanggung jawab pemilik tiket.</li><li>Penyelenggara berhak melakukan perubahan terhadap jadwal acara, susunan acara, tata letak venue, kapasitas penonton, lokasi, maupun informasi lain yang berkaitan dengan pelaksanaan acara apabila diperlukan.</li><li>Dalam keadaan kahar (force majeure) yang meliputi namun tidak terbatas pada bencana alam, kebakaran, pandemi, wabah penyakit, gangguan keamanan, kerusuhan, perang, tindakan pemerintah, atau keadaan lain di luar kendali penyelenggara, acara dapat ditunda, dipindahkan, diubah, atau dibatalkan tanpa pemberitahuan sebelumnya.</li><li>Apabila acara dibatalkan oleh penyelenggara, mekanisme dan jadwal pengembalian dana akan mengikuti kebijakan yang ditetapkan oleh penyelenggara. Pengembalian dana dapat dikenakan potongan biaya administrasi, biaya pembayaran, biaya perbankan, atau biaya lain yang telah timbul selama proses transaksi.</li><li>Penyelenggara tidak bertanggung jawab atas biaya transportasi, akomodasi, konsumsi, maupun biaya pribadi lainnya yang telah dikeluarkan oleh pengunjung sehubungan dengan perubahan, penundaan, atau pembatalan acara.</li><li>Pengunjung bertanggung jawab penuh atas keamanan dan keberadaan barang pribadi yang dibawa ke area acara. Kehilangan, kerusakan, atau pencurian barang pribadi bukan merupakan tanggung jawab penyelenggara.</li><li>Pengunjung wajib mematuhi seluruh peraturan yang berlaku di area acara. Penyelenggara berhak menolak masuk atau mengeluarkan pengunjung yang dianggap melanggar ketentuan acara tanpa kewajiban pengembalian dana.</li><li>Dengan melakukan pembelian tiket dan/atau menghadiri acara, pengunjung dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku.</li></ol>`
          });
        }
      };

      toolbar.style.cssText += 'display:flex!important;align-items:center;';
      const spacer = document.createElement('span');
      spacer.style.cssText = 'flex:1;';
      toolbar.appendChild(spacer);
      toolbar.appendChild(btn);
    };

    inject();

    const observer = new MutationObserver(() => inject());
    observer.observe(container, { childList: true, subtree: true });
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    (window as any).__formSyarat = form;
    (window as any).__setFormSyarat = setForm;
  });

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
    is_promo: 0,
    promo_title: "",
    promo_price: 0,
    is_bundling: 0,
    bundling_qty: 0,
    is_soldout: 0,
    is_finish: 0,
    is_ready: 0,
    is_fullbook: 0,
    taken_seat: [],
  };
  const [error, setError] = useState<ErrorResponse>({});
  const [image, setImage] = useState<string | null>(null);
  const [editTicket, setEditTicket] = useState<EventTicket>(defaultForm);
  const [idxTicket, setIdxTicket] = useState<number>();
  const [showDate, setShowDate] = useState<boolean>(false);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [showTicket, setShowTicket] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(false);
  const [addTicket, showAddTicket] = useState<boolean>(false);
  const [tagSuggestion, setTagSuggestion] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [tab, setTab] = useState<string>("info");
  const [seatmapData, setSeatmapData] = useListState<SeatmapData>(defaultSeatmapData);
  // const [userData, setUserData] = useState<UserProps | null>(null);
  const loggedUser = useLoggedUser();
  const { slug } = router.query;
  const [eventId, setEventId] = useState<number | null>(null);
  const [addTicketModal, setAddTicketModal] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editSessionData, setEditSessionData] = useState<any>({
    session_name: "",
    session_date: "",
    start_time: "",
    end_time: "",
    inventories: [],
  });
  const [editSessionIdx, setEditSessionIdx] = useState<number | undefined>(undefined);
  const [sessionError, setSessionError] = useState("");

  // Session ticket management
  const [activeSessionIdx, setActiveSessionIdx] = useState<number | undefined>(undefined);
  const [showSessionTicketModal, setShowSessionTicketModal] = useState(false);
  const [sessionEditIdx, setSessionEditIdx] = useState<number | undefined>(undefined);
  const [sessionEditData, setSessionEditData] = useState<EventTicket>({ ...defaultForm, seat_color: "#194e9e" });

  useEffect(() => {
    getTagSuggestion();
  }, []);

  useEffect(() => {
    if (slug) getEventData();
  }, [slug]);

  useEffect(() => {
    if (router.query.addTiket === "true") {
      setAddTicketModal(true);
      onAddTicket(); // Open the "Tambah Tiket" modal
    }
  }, [router.query.addTiket]);

  const getEventData = () => {
    if (!slug) return;
    setLoadingEvent(true);
    Get(`event/${slug}`, {})
      .then((res: any) => {
        const {
          image_thumbnail,
          image,
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
        } = res.data;
        setForm({ ...rest });
        setTicket(
          (res.data.has_event_ticket as EventTicket[]).map((e: any) => ({
            ...e,
            available_seat: e.available_seat_number ? e.available_seat_number.split(",") : [],
            taken_seat: e.taken_seat_number ? e.taken_seat_number.split(",") : [],
          }))
        );
        setEventId(res.data.id);
        setImage(res.data.image_url || res.data.image_base64 as string);

        // Load sessions if available (from 'sessions' key with 'inventories')
        if (res.data.sessions && Array.isArray(res.data.sessions)) {
          setSessions(
            res.data.sessions.map((s: any) => ({
              id: s.id,
              session_name: s.session_name,
              session_date: s.session_date,
              start_time: s.start_time ? s.start_time.substring(0, 5) : s.start_time,
              end_time: s.end_time ? s.end_time.substring(0, 5) : s.end_time,
              inventories: (s.inventories || []).map((t: any) => ({
                ...t,
                id: t.id,
                event_ticket_id: t.event_ticket_id,
                ticket_type: t.ticket_type || "Berbayar",
                ticket_category: t.ticket_category || "Festival",
                ticket_date: t.ticket_date || t.start_date || null,
                ticket_end: t.ticket_end || t.end_date || null,
                available_seat: t.available_seat_number ? t.available_seat_number.split(",") : [],
                taken_seat: t.taken_seat_number ? t.taken_seat_number.split(",") : [],
                seat_color: t.seat_color || "#194e9e",
                name: t.ticket_name || t.name,
                description: t.ticket_description || t.description,
                qty: t.qty || 0,
                price: t.price || 0,
              })),
              status: s.status ?? 1,
            }))
          );
          setForm((prev: any) => ({ ...prev, is_session: 1 }));
        }

        const seatmap = res.data.seatmap ? JSON.parse(res.data.seatmap) : [];
        setSeatmapData.setState(seatmap);

        setLoadingEvent(false);
      })
      .catch((err) => {
        console.log(err);
        setLoadingEvent(false);
      });
  };

  useEffect(() => {
    if (loggedUser) {
      setForm({ ...form, creator_id: loggedUser.has_creator?.id ?? 0 });
    }
    //eslint-disable-next-line
  }, [loggedUser]);

  useEffect(() => {
    setForm({ ...form, tickets: ticket });
    //eslint-disable-next-line
  }, [ticket]);

  const getTagSuggestion = async () => {
    if (!tagSuggestion) {
      try {
        Get("category", {})
          .then((res: any) => {
            setTagSuggestion(res.data.map((e: any) => e.name));
          })
          .catch((err) => {
            toast.error("FAILED GET TAG SUGGESTION");
          });
      } catch (error) {
        console.log("FAILED GET TAG SUGGESTION");
      }
    }
  };

  const submitEvent = () => {
    console.log("********************************************");
    console.log("submit event", form);
    console.log("eventId", eventId);
    console.log("********************************************");
    //return;

    const fetchMethod = eventId === null ? Post : Put;
    setLoading(true); // Set loading ke true
    fetchMethod(eventId === null ? "event" : "event/" + eventId, {
      ...form,
      is_session: form.is_session ? 1 : 0,
      sessions: form.is_session ? sessions.map((ses) => ({
        ...ses,
        inventories: ses.inventories.map((inv: EventTicket) => ({
          ...inv,
          ticket_name: inv.name,
          ticket_type: inv.ticket_type,
          inventory_type: inv.ticket_category?.toUpperCase(),
          ticket_category: inv.ticket_category,
          available_seat_number: inv.available_seat?.join(","),
          seat_color: inv.seat_color ?? "#194e9e",
          ticket_description: inv.description,
        })),
      })) : [],
      tickets: form.tickets.map((e) => ({ ...e, available_seat_number: e.available_seat?.join(","), seat_color: e.seat_color ?? "#194e9e" })),
      has_event_ticket: ticket.map((e) => ({ ...e, available_seat_number: e.available_seat?.join(","), seat_color: e.seat_color ?? "#194e9e" })),
      seatmap: form.tickets.some((e) => e.ticket_category == "Seated") && seatmapData ? JSON.stringify(seatmapData) : null,
    })
      .then((res) => {
        console.log("submit event", res);
        toast.success(eventId === null ? "Event Berhasil Dibuat" : "Event Berhasil Diupdate");
        router.push(eventId === null ? "/dashboard/create-event/success" : "/dashboard/my-event/" + slug);
      })
      .catch((err) => {
        const errorObj = err?.response?.data?.errors || {};
        const errorMessage = err?.response?.data?.message || "Terjadi Kesalahan";

        toast.error(errorMessage);
        setError(errorObj);

        if (Object.keys(errorObj).length > 0) {
          const keys = Object.keys(errorObj);
          const hasDescription = keys.includes("description");
          const hasTermCondition = keys.includes("term_condition");

          if ((hasDescription || hasTermCondition) && keys.length <= 2) {
            setTab("detail");
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const saveDraft = () => {
    Post("event", { ...form, save_as_draft: true })
      .then((res: any) => {
        console.log(res);
        toast.success("Event disimpan sebagai draft");
        router.push("/dashboard/my-event");
      })
      .catch((err: any) => {
        console.log(err);
        toast.error(err.response.data.message);
      });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validasi tipe file
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("Silakan unggah file gambar dengan format JPG, PNG, atau GIF.");
        return;
      }

      // Validasi ukuran file
      const maxSizeInMB = 3;
      if (file.size / 1024 / 1024 > maxSizeInMB) {
        toast.error("Ukuran gambar tidak boleh lebih dari 3 mb");
        return;
      }

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
    // console.log(data);
    showAddTicket(true);
  };

  const onAddTicket = () => {
    setEditTicket({
      ...defaultForm,
      event_schedule_date: form.start_date,
    });
    // console.log(editTicket);
    setIdxTicket(undefined);
    showAddTicket(true);
  };

  const deleteTicket = (idx: number) => {
    let arr = [...ticket];
    arr.splice(idx, 1);
    setTicket(arr);
  };

  // Session handlers
  const openAddSession = () => {
    setEditSessionData({
      session_name: "",
      session_date: form.start_date || "",
      start_time: "",
      end_time: "",
      inventories: [],
    });
    setEditSessionIdx(undefined);
    setSessionError("");
    setShowSessionModal(true);
  };

  const openEditSession = (session: any, idx: number) => {
    setEditSessionData({ ...session });
    setEditSessionIdx(idx);
    setSessionError("");
    setShowSessionModal(true);
  };

  const saveSession = () => {
    if (!editSessionData.session_name.trim()) {
      setSessionError("Nama sesi wajib diisi");
      return;
    }
    if (!editSessionData.session_date) {
      setSessionError("Tanggal sesi wajib diisi");
      return;
    }
    if (!editSessionData.start_time || !editSessionData.end_time) {
      setSessionError("Waktu mulai dan selesai wajib diisi");
      return;
    }
    setSessionError("");

    if (editSessionIdx !== undefined) {
      const updated = [...sessions];
      updated[editSessionIdx] = { ...editSessionData, status: editSessionData.status ?? 1 };
      setSessions(updated);
    } else {
      setSessions([...sessions, { ...editSessionData, status: 1 }]);
    }
    setShowSessionModal(false);
  };

  const deleteSession = (idx: number) => {
    const updated = sessions.filter((_: any, i: number) => i !== idx);
    setSessions(updated);
  };

  // Session ticket handlers
  const getSessionTickets = (sessionIdx: number): EventTicket[] => {
    return sessions[sessionIdx]?.inventories || [];
  };

  const setSessionTickets = (sessionIdx: number, tickets: EventTicket[]) => {
    const updated = [...sessions];
    updated[sessionIdx] = { ...updated[sessionIdx], inventories: tickets };
    setSessions(updated);
  };

  const openAddSessionTicket = (sessionIdx: number) => {
    setActiveSessionIdx(sessionIdx);
    setSessionEditData({ ...defaultForm, seat_color: "#194e9e" });
    setSessionEditIdx(undefined);
    setShowSessionTicketModal(true);
  };

  const openEditSessionTicket = (sessionIdx: number, ticketIdx: number, ticket: EventTicket) => {
    setActiveSessionIdx(sessionIdx);
    setSessionEditData({ ...ticket });
    setSessionEditIdx(ticketIdx);
    setShowSessionTicketModal(true);
  };

  const deleteSessionTicket = (sessionIdx: number, ticketIdx: number) => {
    const tickets = getSessionTickets(sessionIdx);
    tickets.splice(ticketIdx, 1);
    setSessionTickets(sessionIdx, [...tickets]);
  };

  useEffect(() => {
    console.log("form", form);
  }, [form]);

  return (
    <>
      <LoadingOverlay visible={loadingEvent} />
      <div className="text-dark min-h-screen max-w-full mx-auto pt-2 pb-32 border-primary-light-200 px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="max-w-[1400px] mx-auto mb-6 text-center md:text-start flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="flex flex-col">
            {!!slug ? (
              <>
                <h1 className="text-2xl font-bold">Edit Event</h1>
                <p className="text-grey">Lengkapi form dibawah ini untuk merubah event</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">Buat Event</h1>
                <p className="text-grey">Lengkapi form dibawah ini untuk membuat event</p>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-[1400px] mx-auto">
          <div className="md:pr-2 xl:pr-6">
            <label className="w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-chat flex flex-col items-center justify-center h-72 gap-4 cursor-pointer">
              <input type="file" className="hidden" onChange={handleFile} accept="image/jpeg, image/png, image/gif" />
              {image ? (
                <Image src={image} alt="image" className="object-contain" width={0} height={0} style={{ width: "100%", height: "100%" }} unoptimized />
              ) : (
                <>
                  <Image src={imagePlus} alt="image-plus" />
                  <h3 className="font-semibold text-medium text-center">Unggah gambar/poster/banner</h3>
                  <p className="text-grey text-center text-sm px-8">Direkomendasikan ukuran 350px x 1080px dan maksimal 3 mb</p>
                </>
              )}
            </label>
            <div className="mt-8 text-sm">
              <InputField type="text" placeholder="Nama Event" fullWidth value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
              {error && error?.name && <p className="text-danger text-xs mt-1">{error && error?.name[0]}</p>}
            </div>
            <div className="mb-8 mt-2 text-sm">
              <TagsInput
                multiple
                className={`[&_*]:!border-[#E2EDFF]`}
                radius={8}
                placeholder="Tag; Contoh: hiburan, musik, budaya, kuliner, pendidikan"
                data={tagSuggestion}
                value={!form.tag ? [] : form.tag.split(",")}
                onChange={(e) => setForm({ ...form, tag: e.join(",") })}
                error={error && error?.tag && error?.tag[0]}
              />
            </div>
            <div className="w-full rounded-lg">
              <div className="w-full border-primary-light-200 text-grey text-sm py-2 px-2 flex items-center cursor-pointer" onClick={() => setShowDate(!showDate)}>
                <FontAwesomeIcon icon={faCalendar} size="lg" className="w-5 mr-2" />
                {form.start_date && form.end_date ? (
                  <p className="text-dark">
                    {formatDate(form.start_date)} - {formatDate(form.end_date)}
                  </p>
                ) : (
                  <p>Atur Tanggal Event</p>
                )}
                <div>
                  {error && error?.start_date && !form.start_date && <p className="text-danger text-xs ml-2">*{error && error?.start_date[0]}</p>}
                  {error && error?.end_date && !form.end_date && <p className="text-danger text-xs ml-2">*{error && error?.end_date[0]}</p>}
                </div>
              </div>
              <div className="w-full border-y-2 border-primary-light-200 text-grey text-sm py-2 px-2 flex items-center cursor-pointer" onClick={() => setShowTime(!showTime)}>
                <FontAwesomeIcon icon={faClock} size="lg" className="w-5 mr-2" />
                {form.start_time && form.end_time ? (
                  <p className="text-dark">
                    {form.start_time} - {form.end_time} {form.zone_time}
                  </p>
                ) : (
                  <p>Atur Waktu Event</p>
                )}
                <div>
                  {error && error?.start_time && !form.start_time && <p className="text-danger text-xs ml-2">*{error && error?.start_time[0]}</p>}
                  {error && error?.end_time && !form.end_time && <p className="text-danger text-xs ml-2">*{error && error?.end_time[0]}</p>}
                  {error && error?.zone_time && !form.zone_time && <p className="text-danger text-xs ml-2">*{error && error?.zone_time[0]}</p>}
                </div>
              </div>
              <div className="w-full border-primary-light-200 text-grey text-sm py-2 px-2 mb-3 flex items-center cursor-pointer" onClick={() => setShowLocation(!showLocation)}>
                <FontAwesomeIcon icon={faLocationDot} size="lg" className="w-5 mr-2" />
                {form.organization_method !== "" ? (
                  form.organization_method === "Offline" ? (
                    <p className="text-dark">{`${form.location_name}, ${form.location_address}, ${form.location_city}`}</p>
                  ) : (
                    <p className="text-dark">{form.location_map}</p>
                  )
                ) : (
                  <p>Atur Alamat Event</p>
                )}
                <div>
                  {error && error?.location_address && !form.location_address && <p className="text-danger text-xs ml-2">*{error && error?.location_address[0]}</p>}
                  {error && error?.location_city && !form.location_city && <p className="text-danger text-xs ml-2">*{error && error?.location_city[0]}</p>}
                  {error && error?.location_map && !form.location_map && <p className="text-danger text-xs ml-2">*{error && error?.location_map[0]}</p>}
                  {error && error?.location_name && !form.location_name && <p className="text-danger text-xs ml-2">*{error && error?.location_name[0]}</p>}
                  {error && error?.organization_method && !form.organization_method && <p className="text-danger text-xs ml-2">*Metode penyelenggaraan event harus diisi</p>}
                </div>
              </div>
            </div>
          </div>
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
              <Tab key="info" title="Info Tiket">
                <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <h3 className="text-medium font-semibold">Tiket</h3>
                    <div className="flex items-center gap-2 text-sm text-primary-dark cursor-pointer" onClick={onAddTicket}>
                      <button className="border-1.5 border-primary-dark rounded-full p-0.5 flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlus} className="" size="sm" />
                      </button>
                      <p>Tambah Tiket</p>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-[10px]">
                    {ticket.length == 0 && (
                      <Alert icon={<Icon icon="uiw:information-o" />} color="gray" variant="light" radius={10}>
                        Belum ada tiket yang dibuat
                      </Alert>
                    )}
                    {ticket.length > 0 &&
                      ticket.map((el, index) => (
                        <div key={index}>
                          <TicketContainer
                            type={el.ticket_type}
                            category={el.ticket_category}
                            price={el.price}
                            ticketDate={el.ticket_date}
                            ticketEnd={el.ticket_end}
                            description={el.description}
                            name={el.name}
                            onEdit={() => onEditTicket(el, index)}
                            onDelete={() => deleteTicket(index)}
                            isSoldout={el.is_soldout}
                            isFinish={el.is_finish}
                            isReady={el.is_ready}
                            isFullbook={el.is_fullbook}
                            qty={el.qty}
                            sold={el.has_ordered_seatnumber?.filter((order: any) => order.payment_status?.toUpperCase() === "PAID").reduce((acc: number, order: any) => acc + (order.qty_ticket || 1), 0) || 0}
                            isAdmin={false}
                          />
                        </div>
                      ))}
                  </div>
                </div>
                <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <h3 className="text-medium font-semibold">Formulir Data Pemesan</h3>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <Checkbox color="default" isSelected={true} isDisabled classNames={{ label: "text-sm" }}>
                        Nama Lengkap
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={true} isDisabled>
                        Email
                      </Checkbox>
                      <Checkbox classNames={{ label: "text-sm" }} color="default" isSelected={true} isDisabled>
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
                  <div className="px-4 py-3 flex justify-between items-center">
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
                          className="w-32 md:w-40 lg:w-24" // Responsive width for the select input
                          aria-label="Options"
                          size="sm"
                          defaultSelectedKeys={form.max_buy_ticket ? [form.max_buy_ticket.toString()] : []}
                          onChange={(e: any) => setForm({ ...form, max_buy_ticket: e.target.value })}
                          selectedKeys={form.max_buy_ticket ? [form.max_buy_ticket.toString()] : []}
                          classNames={{
                            listbox: "text-dark max-h-40 overflow-auto", // Restricts height and adds scroll for long lists
                            popoverContent: "w-full sm:w-48 md:w-56 lg:w-64", // Responsive width for the dropdown
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
              <Tab key="sesi" title={<div className="flex items-center gap-2"><Icon icon="mdi:calendar-clock" /> Sesi</div>}>
                <div className="border-2 border-primary-light-200 rounded-2xl my-5 mx-auto">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <h3 className="text-medium font-semibold">Pengaturan Sesi</h3>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4 pb-4">
                      <div>
                        <p className="font-medium">Aktifkan Sesi</p>
                        <p className="text-grey text-xs">Aktifkan pembagian sesi untuk event ini</p>
                      </div>
                      <Switch
                        size="lg"
                        isSelected={form.is_session === 1}
                        onChange={(e: any) => setForm({ ...form, is_session: e.target.checked ? 1 : 0 })}
                      />
                    </div>

                    {form.is_session === 1 && (
                      <>
                        <div className="flex justify-between items-center mt-4 mb-3">
                          <p className="font-semibold text-sm">Daftar Sesi</p>
                          <div className="flex items-center gap-2 text-sm text-primary-dark cursor-pointer" onClick={openAddSession}>
                            <button className="border-1.5 border-primary-dark rounded-full p-0.5 flex items-center justify-center">
                              <FontAwesomeIcon icon={faPlus} size="sm" />
                            </button>
                            <p>Tambah Sesi</p>
                          </div>
                        </div>

                        {sessions.length === 0 ? (
                          <Alert icon={<Icon icon="uiw:information-o" />} color="gray" variant="light">Belum ada sesi. Tambah sesi untuk event ini.</Alert>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {sessions.map((ses, idx) => (
                              <div
                                key={idx}
                                className="border border-primary-light-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-2 h-2 rounded-full bg-primary-base"></div>
                                      <h4 className="font-semibold text-sm">{ses.session_name}</h4>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-grey ml-4">
                                      <div className="flex items-center gap-1">
                                        <Icon icon="mdi:calendar" width={14} />
                                        <span>{ses.session_date || "-"}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Icon icon="mdi:clock-start" width={14} />
                                        <span>{ses.start_time || "-"}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Icon icon="mdi:clock-end" width={14} />
                                        <span>{ses.end_time || "-"}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => openEditSession(ses, idx)}
                                      className="p-1.5 rounded-lg hover:bg-primary-light-100 text-grey hover:text-primary-base transition-colors"
                                    >
                                      <Icon icon="mdi:pencil" width={16} />
                                    </button>
                                    <button
                                      onClick={() => deleteSession(idx)}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-grey hover:text-red-500 transition-colors"
                                    >
                                      <Icon icon="mdi:trash-can-outline" width={16} />
                                    </button>
                                  </div>
                                </div>

                                {/* Session Inventories (Tickets) */}
                                <div className="mt-3 pt-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-semibold text-grey uppercase tracking-wider">Inventory Tiket</p>
                                    <div
                                      className="flex items-center gap-1.5 text-xs text-primary-dark cursor-pointer"
                                      onClick={() => openAddSessionTicket(idx)}
                                    >
                                      <button className="border-1.5 border-primary-dark rounded-full p-0.5 flex items-center justify-center">
                                        <FontAwesomeIcon icon={faPlus} size="xs" />
                                      </button>
                                      <p>Tambah Tiket</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {(!ses.inventories || ses.inventories.length === 0) ? (
                                      <Alert icon={<Icon icon="uiw:information-o" />} color="gray" variant="light" classNames={{ root: "!p-3 !text-xs" }}>Belum ada tiket untuk sesi ini</Alert>
                                    ) : (
                                      ses.inventories.map((inv: EventTicket, invIdx: number) => (
                                        <TicketContainer
                                          key={invIdx}
                                          type={inv.ticket_type}
                                          category={inv.ticket_category}
                                          price={inv.price}
                                          ticketDate={inv.ticket_date}
                                          ticketEnd={inv.ticket_end}
                                          description={inv.description}
                                          name={inv.name}
                                          qty={inv.qty}
                                          sold={0}
                                          onEdit={() => openEditSessionTicket(idx, invIdx, inv)}
                                          onDelete={() => deleteSessionTicket(idx, invIdx)}
                                          isAdmin={false}
                                        />
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Tab>
              <Tab
                key="detail"
                title={
                  error && (error?.description || error?.term_condition) ? (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faExclamationCircle} className="text-danger" />
                      <span>Detail Event</span>
                    </div>
                  ) : (
                    "Detail Event"
                  )
                }
              >
                <div className="border-2 border-primary-light-200 rounded-2xl my-5">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <h3 className="text-medium font-semibold">Deskripsi</h3>
                    {error?.description && <p className="text-danger mt-1">{error?.description}</p>}
                  </div>
                  <div className="p-5">
                    <InputEditor
                      theme="snow"
                      onChange={(value: any) => setForm({ ...form, description: value })}
                      value={form?.description}
                      placeholder="Ketik Deskripsi"
                      modules={{
                        toolbar: [
                          [{ font: ['', 'poppins', 'helvetica', 'roboto', 'georgia', 'arial', 'courier'] }],
                          [{ header: "1" }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "bullet" }],
                        ],
                        clipboard: {
                          // toggle to add extra line breaks when pasting HTML:
                          matchVisual: false,
                        },
                      }}
                      className="editor"
                    />
                  </div>
                </div>

                <div className="border-2 border-primary-light-200 rounded-2xl my-5">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <h3 className="text-medium font-semibold">Syarat & Ketentuan</h3>
                    {error?.term_condition && <p className="text-danger mt-1">{error?.term_condition}</p>}
                  </div>
                  <div className="p-5" ref={syaratToolbarRef}>
                    <InputEditor
                      theme="snow"
                      onChange={(value: any) => setForm({ ...form, term_condition: value })}
                      value={form?.term_condition}
                      placeholder="Ketik Syarat & Ketentuan"
                      modules={{
                        toolbar: [
                          [{ font: ['', 'poppins', 'helvetica', 'roboto', 'georgia', 'arial', 'courier'] }],
                          [{ header: "1" }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "bullet" }],
                        ],
                        clipboard: {
                          matchVisual: false,
                        },
                      }}
                      className="editor"
                    />
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-light-200 fixed bottom-0 left-0 md:left-[65px] hvr:md:left-[280px] right-0 bg-white shadow-lg z-40 transition-all duration-300">
        <div className="flex justify-center items-center px-4 md:px-8 py-3 md:py-4 text-dark pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-4">
          <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto gap-3 md:gap-4">
            <p className="text-sm md:text-base text-center md:text-left mb-1 md:mb-0 font-bold">
              Hai Creator! Selangkah lagi event kamu berhasil dibuat.
            </p>
            <div className="flex gap-3 md:gap-4 w-full md:w-auto justify-center md:justify-end">
              {!slug && (
                <Button
                  onClick={saveDraft}
                  color="secondary"
                  label="Draf"
                  startIcon={faFileAlt}
                  className="flex-1 md:flex-none max-w-[120px]"
                />
              )}
              <Button
                className={`flex-1 md:flex-none max-w-[120px] whitespace-nowrap`}
                onClick={submitEvent}
                color="primary"
                disabled={loading}
                startIcon={faSave}
                label={loading ? "Loading..." : "Simpan"}
              />
            </div>
          </div>
        </div>
      </div>
      <ModalDate isOpen={showDate} setIsOpen={setShowDate} form={form} setForm={setForm} />
      <ModalTime isOpen={showTime} setIsOpen={setShowTime} form={form} setForm={setForm} />
      <ModalTicket isOpen={showTicket} setIsOpen={setShowTicket} form={form} setForm={setForm} />
      <ModalLocation isOpen={showLocation} setIsOpen={setShowLocation} form={form} setForm={setForm} />
      <Context.Provider value={{ seatmapData, setSeatmapData, ticket, eventData: form }}>
        <ModalCreateTicket
          isOpen={addTicket}
          endDate={form.end_date}
          setIsOpen={showAddTicket}
          ticket={ticket}
          setTicket={setTicket}
          data={editTicket}
          setIdx={setIdxTicket}
          idx={idxTicket}
          addTicketModal={addTicketModal}
          eventId={eventId ?? undefined}
          eventStartTime={form.start_time}
          eventEndTime={form.end_time}
          isAdmin={false}
        />
      </Context.Provider>

      {/* Session Ticket Modal */}
      {showSessionTicketModal && activeSessionIdx !== undefined && (
        <Context.Provider value={{ seatmapData, setSeatmapData, ticket: getSessionTickets(activeSessionIdx) }}>
          <ModalCreateTicket
            isOpen={showSessionTicketModal}
            setIsOpen={setShowSessionTicketModal}
            ticket={getSessionTickets(activeSessionIdx)}
            setTicket={(tickets: EventTicket[]) => { setSessionTickets(activeSessionIdx, tickets); }}
            data={sessionEditData}
            setIdx={setSessionEditIdx}
            idx={sessionEditIdx}
            endDate={form.end_date}
            eventStartTime={form.start_time}
            eventEndTime={form.end_time}
            isAdmin={false}
          />
        </Context.Provider>
      )}

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">{editSessionIdx !== undefined ? "Edit Sesi" : "Tambah Sesi"}</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-dark">Nama Sesi</label>
                <input
                  type="text"
                  className="w-full border-2 border-primary-light-200 rounded-lg p-2.5 mt-1 text-sm focus:border-primary-base focus:outline-none"
                  value={editSessionData.session_name}
                  onChange={(e) => setEditSessionData({ ...editSessionData, session_name: e.target.value })}
                  placeholder="Contoh: Sesi 1, Sesi 2, dll"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark">Tanggal Sesi</label>
                <input
                  type="date"
                  className="w-full border-2 border-primary-light-200 rounded-lg p-2.5 mt-1 text-sm focus:border-primary-base focus:outline-none"
                  value={editSessionData.session_date}
                  onChange={(e) => setEditSessionData({ ...editSessionData, session_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark">Waktu Mulai</label>
                  <input
                    type="time"
                    className="w-full border-2 border-primary-light-200 rounded-lg p-2.5 mt-1 text-sm focus:border-primary-base focus:outline-none"
                    value={editSessionData.start_time}
                    onChange={(e) => setEditSessionData({ ...editSessionData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark">Waktu Selesai</label>
                  <input
                    type="time"
                    className="w-full border-2 border-primary-light-200 rounded-lg p-2.5 mt-1 text-sm focus:border-primary-base focus:outline-none"
                    value={editSessionData.end_time}
                    onChange={(e) => setEditSessionData({ ...editSessionData, end_time: e.target.value })}
                  />
                </div>
              </div>
              {sessionError && (
                <p className="text-danger text-sm">{sessionError}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                color="secondary"
                label="Batal"
                onClick={() => setShowSessionModal(false)}
              />
              <Button
                color="primary"
                label={editSessionIdx !== undefined ? "Simpan" : "Tambah"}
                onClick={saveSession}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEvent;
