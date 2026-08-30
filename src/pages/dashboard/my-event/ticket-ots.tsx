import { useState, useEffect, useMemo } from "react";
import { Select, SelectItem, Tabs, Tab, Pagination, Input } from "@nextui-org/react";
import Button from "@/components/Button";
import { Spinner } from "@nextui-org/react";
import { Get } from "@/utils/REST";
import { EventProps, TicketProps } from "@/utils/globalInterface";
import { useRouter } from "next/router";
import TicketPicker from "@/components/TicketPicker";
import ModalOfflineSales from "@/components/Modals/ModalOfflineSales";
import { Text, Badge, Card, Modal as MantineModal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import moment from "moment";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faTicketAlt, faDownload, faArrowLeft, faDesktop, faReceipt, faEye, faQrcode, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import config from "@/Config";
import axios from "axios";
import QrCode from "@/components/QrCode";

interface FormTicket {
  event_id: number;
  event_ticket_id: number;
  name: string;
  price: number;
  subtotal_price: number;
  qty_ticket: number;
  payment_status: string;
  grand_total: number;
  ticket_fee?: number;
}

interface OtsStats {
  totalOts: number;
  otsQty: number;
  totalEtickets: number;
  checkedInEtickets: number;
}

interface PaymentMethod {
  id: number;
  payment_name: string;
  account_no: string | null;
  account_name: string;
  account_branch: string;
  description: string | null;
  status: string;
  logo: string | null;
  icon?: string;
}

// Interface untuk modal detail transaksi
interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  paymentList: PaymentMethod[];
  eventData: EventProps | null;
}

// Helper function untuk mengonversi string ke number dengan aman
const parseNumber = (value: any): number => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  const cleaned = String(value).replace(/[^0-9.,]/g, "");
  const normalized = cleaned.replace(",", ".");
  const parsed = parseFloat(normalized);

  return isNaN(parsed) ? 0 : parsed;
};

const formatRupiah = (value: any): string => `Rp${parseNumber(value).toLocaleString("id-ID")}`;

// Mapping metode pembayaran: id 4 = QRIS, id 5 = Cash
const PAYMENT_METHOD_LABELS: Record<number, string> = {
  4: "QRIS",
  5: "Cash",
};

const labelFromKeyword = (value: string): string | null => {
  const v = value.toLowerCase();
  if (v.includes("qris") || v.includes("xendit")) return "QRIS";
  if (v.includes("cash") || v.includes("tunai")) return "Cash";
  return null;
};

// Field payment_method dari API bersifat polimorfik:
// utamakan payment_method -> id (object { id, payment_name }), fallback ke nama/angka
const resolvePaymentMethodLabel = (transaction: any): string => {
  const candidates: any[] = [transaction?.payment_method, transaction?.payment_method_id, transaction?.payment_method_name];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === "") continue;

    if (typeof candidate === "object") {
      const byId = PAYMENT_METHOD_LABELS[Number(candidate.id)];
      if (byId) return byId;
      const byName = labelFromKeyword(String(candidate.payment_name ?? candidate.name ?? ""));
      if (byName) return byName;
      continue;
    }

    const asNumber = Number(candidate);
    if (!isNaN(asNumber) && PAYMENT_METHOD_LABELS[asNumber]) {
      return PAYMENT_METHOD_LABELS[asNumber];
    }

    const byKeyword = labelFromKeyword(String(candidate));
    if (byKeyword) return byKeyword;
  }

  return "-";
};

const getPaymentMethodId = (t: any): number | null => {
  if (t?.payment_method?.id) return Number(t.payment_method.id);
  if (t?.payment_method_id) return Number(t.payment_method_id);
  return null;
};

const ROWS_PER_PAGE = 20;

type SortField = "invoice_no" | "created_at" | "name" | "total_price";

const getCustomer = (transaction: any) => {
  const identity = transaction?.identities?.find((i: any) => Number(i.is_pemesan) === 1);
  return {
    name: identity?.full_name || transaction?.has_user?.name || "Walk-in Customer",
    email: identity?.email || transaction?.has_user?.email || "-",
    phone: identity?.no_telp || transaction?.has_user?.phone || "-",
  };
};

const thCls = (align: "left" | "center" = "left") =>
  `px-4 py-3 ${align === "center" ? "text-center" : "text-left"} text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-0 z-10 bg-[#f5f7fa]`;

const tdCls = (align: "left" | "center" = "left") =>
  `px-4 py-3 ${align === "center" ? "text-center" : "text-left"} text-xs sm:text-sm whitespace-nowrap`;

const SortIcon = ({ active, dir }: { active: boolean; dir: "asc" | "desc" }) => (
  <span className="ml-1 text-[10px]">{active ? (dir === "asc" ? "▲" : "▼") : "⇅"}</span>
);

// Komponen Modal Detail Transaksi
const TransactionDetailModal = ({ isOpen, onClose, transaction, paymentList, eventData }: TransactionDetailModalProps) => {
  if (!transaction) return null;

  const getPaymentMethodName = () => {
    const resolved = resolvePaymentMethodLabel(transaction);
    if (resolved !== "-") {
      return resolved;
    }

    if (transaction.payment_method?.payment_name) {
      return transaction.payment_method.payment_name;
    }

    if (transaction.payment_method_id) {
      const method = paymentList.find((m) => m.id === transaction.payment_method_id);
      return method ? method.payment_name : "Unknown";
    }

    return "Unknown";
  };

  const getStatusText = () => {
    if (transaction.payment_status) {
      switch (transaction.payment_status.toLowerCase()) {
        case "verified":
        case "success":
          return { text: "Success", color: "green" };
        case "pending":
          return { text: "Pending", color: "yellow" };
        case "failed":
          return { text: "Failed", color: "red" };
        default:
          return { text: transaction.payment_status, color: "gray" };
      }
    }
    
    switch (transaction.transaction_status_id) {
      case 1:
        return { text: "Pending", color: "yellow" };
      case 2:
        return { text: "Success", color: "green" };
      case 3:
        return { text: "Failed", color: "red" };
      case 4:
        return { text: "Expired", color: "gray" };
      default:
        return { text: "Unknown", color: "gray" };
    }
  };

  const status = getStatusText();
  const totalPrice = parseNumber(transaction.total_price);
  const adminFee = parseNumber(transaction.admin_fee);
  const grandTotal = parseNumber(transaction.grandtotal);
  const totalQty = transaction.total_qty || transaction.tickets?.reduce((sum: number, ticket: any) => sum + (parseInt(ticket.qty_ticket) || 0), 0) || 0;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-light-grey px-6 py-4 z-10">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faReceipt} className="text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold leading-tight">Detail Transaksi</h3>
                <p className="text-sm text-gray-500 truncate">{transaction.invoice_no}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 shrink-0 p-1 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto px-6 py-5 max-h-[calc(90vh-140px)] space-y-4">
          {/* Info Transaksi */}
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text fw={600} size="md" mb="sm">Informasi Transaksi</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div><Text size="xs" c="dimmed">Invoice</Text><Text fw={500} className="break-all">{transaction.invoice_no}</Text></div>
              <div><Text size="xs" c="dimmed">Tanggal</Text><Text fw={500}>{moment(transaction.created_at).format("DD MMMM YYYY HH:mm")}</Text></div>
              <div><Text size="xs" c="dimmed">Status</Text><Badge color={status.color as any} variant="filled" size="sm" fw={600}>{status.text}</Badge></div>
              <div><Text size="xs" c="dimmed">Metode Pembayaran</Text><Text fw={500}>{getPaymentMethodName()}</Text></div>
              <div><Text size="xs" c="dimmed">Tipe Transaksi</Text><Badge color={transaction.type_transaction === "offline" ? "blue" : "green"} variant="light" size="sm" fw={600}>{transaction.type_transaction === "offline" ? "Offline" : "Online"}</Badge></div>
              <div><Text size="xs" c="dimmed">Event</Text><Text fw={500} className="break-words">{transaction.has_event?.name || "Unknown Event"}</Text></div>
            </div>
          </Card>

          {/* Info Customer */}
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text fw={600} size="md" mb="sm">Informasi Customer</Text>
            {transaction.identities && transaction.identities.length > 0 ? (
              <div className="space-y-3">
                {transaction.identities.map((identity: any, index: number) => (
                  <div key={index} className="p-3 border border-light-grey rounded-md bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <Text size="xs" c="dimmed">Nama Lengkap</Text>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Text fw={500}>{identity.full_name || "-"}</Text>
                          {Number(identity.is_pemesan) === 1 && (
                            <Badge color="blue" variant="light" size="sm" fw={600}>Pemesan Utama</Badge>
                          )}
                        </div>
                      </div>
                      <div><Text size="xs" c="dimmed">Email</Text><Text fw={500} className="break-all">{identity.email || "-"}</Text></div>
                      <div><Text size="xs" c="dimmed">No. Telepon</Text><Text fw={500}>{identity.no_telp || "-"}</Text></div>
                      <div><Text size="xs" c="dimmed">NIK</Text><Text fw={500}>{identity.nik || "-"}</Text></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4"><Text c="dimmed">Tidak ada informasi customer</Text></div>
            )}
          </Card>

          {/* Detail Tiket */}
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text fw={600} size="md" mb="sm">Detail Tiket</Text>
            {transaction.tickets && transaction.tickets.length > 0 ? (
              <div className="space-y-3">
                {transaction.tickets.map((ticket: any, index: number) => (
                  <div key={index} className="flex justify-between items-start gap-4 border-b border-light-grey pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <Text fw={500}>{ticket.has_event_ticket?.name || "Tiket OTS"}</Text>
                      <Text size="sm" c="dimmed" className="mt-0.5">
                        {`${formatRupiah(ticket.price)} x ${ticket.qty_ticket || 1}${ticket.code ? ` • Kode: ${ticket.code}` : ""}`}
                      </Text>
                    </div>
                    <Text fw={500} className="shrink-0 text-right">{formatRupiah(ticket.subtotal_price)}</Text>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4"><Text c="dimmed">Tidak ada data tiket</Text></div>
            )}
          </Card>

          {/* Ringkasan Pembayaran */}
          <Card shadow="sm" padding="md" radius="md" withBorder className="bg-gray-50">
            <Text fw={600} size="md" mb="sm">Ringkasan Pembayaran</Text>
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-4">
                <Text size="sm" c="dimmed">Subtotal Tiket ({totalQty} tiket)</Text>
                <Text size="sm">{formatRupiah(totalPrice)}</Text>
              </div>
              {adminFee > 0 && (
                <div className="flex justify-between items-center gap-4">
                  <Text size="sm" c="dimmed">Biaya Admin</Text>
                  <Text size="sm">{formatRupiah(adminFee)}</Text>
                </div>
              )}
              <div className="flex justify-between items-center gap-4 border-t border-light-grey pt-3 mt-2">
                <Text fw={700}>Total Pembayaran</Text>
                <Text fw={700} size="xl">{formatRupiah(grandTotal)}</Text>
              </div>
            </div>
          </Card>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-light-grey px-6 py-4">
          <Button label="Tutup" color="secondary" onClick={onClose} className="w-full" />
        </div>
      </div>
    </div>
  );
};

const TicketOTS = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [qrTransaction, setQrTransaction] = useState<any>(null);
  const [selected, setSelected] = useState<number>(0);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [data, setData] = useState<TicketProps[]>([]);
  const [ticket, setTicket] = useState<FormTicket[]>([]);
  const [eventData, setEventData] = useState<EventProps | null>(null);
  const [paymentList, setPaymentList] = useState<PaymentMethod[]>([]);
  const [events, setEvents] = useState<EventProps[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [offlineTransactions, setOfflineTransactions] = useState<any[]>([]);
  const [onlineTransactions, setOnlineTransactions] = useState<any[]>([]);
  const [checkinTransaction, setCheckinTransaction] = useState<any>(null);
  const [checkingInId, setCheckingInId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const [activeTab, setActiveTab] = useState<"offline" | "online">("offline");
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const router = useRouter();

  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const subtotalPrice = useMemo(() => {
    return ticket.reduce((sum, item) => sum + item.subtotal_price, 0);
  }, [ticket]);

  const totalTicketFee = useMemo(() => {
    return ticket.reduce((sum, item) => sum + (item.ticket_fee || 0), 0);
  }, [ticket]);

  const grandTotal = useMemo(() => {
    return subtotalPrice + totalTicketFee;
  }, [subtotalPrice, totalTicketFee]);

  const getUserData = () => {
    try {
      const userData = Cookies.get("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const getCreatorId = () => {
    const user = getUserData();
    return user?.has_creator?.id || user?.creator_id || user?.id;
  };

  useEffect(() => {
    if (!showModal && eventData) {
      refreshTransactionData();
    }
  }, [showModal, eventData]);

  const refreshTransactionData = async () => {
    if (!eventData) return;

    try {
      await getOfflineTransactions(eventData.id);
      await getOnlineTransactions(eventData.id);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const getAllEvents = async () => {
    setIsLoading(true);

    try {
      const creatorId = getCreatorId();

      if (!creatorId) {
        console.error("❌ Creator ID tidak ditemukan");
        setEvents([]);
        setIsLoading(false);
        return;
      }

      let response: any;

      try {
        response = await Get("event", {
          include_tickets: true,
        });
      } catch (err) {
        console.error("❌ Gagal mengambil data event:", err);
        throw new Error("Tidak dapat mengambil data event");
      }

      let eventsData: EventProps[] = [];

      if (response?.data && Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response && Array.isArray(response)) {
        eventsData = response;
      } else if (response?.data?.events && Array.isArray(response.data.events)) {
        eventsData = response.data.events;
      } else if (response?.events && Array.isArray(response.events)) {
        eventsData = response.events;
      }

      const creatorEvents = eventsData.filter((event: EventProps) => {
        const eventCreatorId = event.has_creator?.id || event.creator_id;
        return eventCreatorId == creatorId;
      });

      setEvents(creatorEvents);

      if (creatorEvents.length === 1) {
        const event = creatorEvents[0];
        setSelectedEventId(event.id.toString());
        await loadEventData(event);
      } else if (creatorEvents.length > 0) {
        const firstEvent = creatorEvents[0];
        setSelectedEventId(firstEvent.id.toString());
        await loadEventData(firstEvent);
      }
    } catch (err: any) {
      console.error("❌ Error fetching events:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventData = async (event: EventProps) => {
    setIsLoading(true);
    setEventData(event);

    const tickets = event.has_event_ticket || [];

    const formattedTickets: TicketProps[] = tickets
      .filter((ticket: any) => ticket.is_ots === 1)
      .map((ticket: any) => ({
        id: ticket.id,
        event_id: ticket.event_id?.toString() || "",
        name: ticket.name || "Tiket",
        qty: ticket.qty || 0,
        price: ticket.price || 0,
        description: ticket.description || "",
        ticket_date: ticket.ticket_date || "",
        starting_time: ticket.starting_time || "",
        ending_time: ticket.ending_time || "",
        ticket_fee: ticket.ticket_fee || 0,
        ticket_fee_percentage: ticket.ticket_fee_percentage || 0,
        ticket_fee_description: ticket.ticket_fee_description || "",
        start_date: ticket.start_date || "",
        ticket_end: ticket.ticket_end || "",
        is_fullbook: ticket.is_fullbook || 0,
        is_soldout: ticket.is_soldout || 0,
        is_finish: ticket.is_finish || 0,
        is_ready: ticket.is_ready || 0,
        is_promo: ticket.is_promo || 0,
        is_bundling: ticket.is_bundling || 0,
        bundling_qty: ticket.bundling_qty || 0,
        promo_title: ticket.promo_title || "",
        promo_price: ticket.promo_price || 0,
        is_ots: ticket.is_ots || 0,
        has_event_ticket: [],
        created_by: ticket.created_by || null,
        updated_by: ticket.updated_by || null,
        created_at: ticket.created_at || null,
        updated_at: ticket.updated_at || null,
        deleted_at: ticket.deleted_at || null,
        has_event: event,
        max_buy_ticket: ticket.max_buy_ticket || 0,
        event_schedule_date: ticket.event_schedule_date || null,
        available_seat_number: ticket.available_seat_number || "",
        seat_color: ticket.seat_color || "",
        ticket_category: (ticket.ticket_category as "Seated" | "Festival") || "Festival",
        has_ordered_seatnumber: ticket.has_ordered_seatnumber || [],
        is_bundling_merch: ticket.is_bundling_merch || 0,
      }));

    setData(formattedTickets);

    const initialCount: Record<number, number> = {};
    formattedTickets.forEach((item) => {
      initialCount[item.id] = 0;
    });
    setCounts(initialCount);
    setTicket([]);

    await Promise.all([getPaymentMethod(), getOfflineTransactions(event.id), getOnlineTransactions(event.id)]);

    setIsLoading(false);
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const selectedEvent = events.find((event) => event.id.toString() === eventId);
    if (selectedEvent) {
      loadEventData(selectedEvent);
    }
  };

  const getOfflineTransactions = async (eventId: number) => {
    try {
      const creatorId = getCreatorId();

      const response: any = await axios.get(`${config.wsUrl}list-transaction-by-event`, {
        params: {
          event_id: eventId,
          type_transaction: "offline",
          page: 1,
          per_page: 999999,
          include: "transaction_tickets,user",
        },
      });

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const filteredTransactions = response.data.data.filter((transaction: any) => {
          const transactionCreatorId = transaction.has_event?.has_creator?.id || transaction.has_event?.creator_id;
          return transactionCreatorId == creatorId;
        });

        setOfflineTransactions(filteredTransactions);
      }
    } catch (err: any) {
      console.error("❌ Error fetching offline transactions:", err);
      setOfflineTransactions([]);
    }
  };

  const getOnlineTransactions = async (eventId: number) => {
    try {
      const creatorId = getCreatorId();

      const response: any = await axios.get(`${config.wsUrl}list-transaction-by-event`, {
        params: {
          event_id: eventId,
          type_transaction: "online",
          page: 1,
          per_page: 999999,
          include: "transaction_tickets,user",
        },
      });

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const filteredTransactions = response.data.data.filter((transaction: any) => {
          const transactionCreatorId = transaction.has_event?.has_creator?.id || transaction.has_event?.creator_id;
          return transactionCreatorId == creatorId;
        });

        setOnlineTransactions(filteredTransactions);
      }
    } catch (err: any) {
      console.error("❌ Error fetching online transactions:", err);
      setOnlineTransactions([]);
    }
  };

  const updateDataBasedOnCounts = () => {
    const newData = Object.keys(counts)
      .map(Number)
      .filter((id) => counts[id] > 0)
      .map((id) => {
        const ticketData = data.find((el) => el.id === id);
        if (!ticketData) return null;

        const qty = counts[id];
        const subtotal = ticketData.price * qty;
        const ticketFee = (ticketData.ticket_fee || 0) * qty;

        return {
          id: id,
          event_id: eventData?.id || 0,
          event_ticket_id: id,
          price: ticketData.price,
          name: ticketData.name,
          subtotal_price: subtotal,
          qty_ticket: qty,
          ticket_fee: ticketFee,
          payment_status: "pending",
          grand_total: subtotal + ticketFee,
        };
      })
      .filter(Boolean) as FormTicket[];

    setTicket(newData);
  };

  const getPaymentMethod = async () => {
    try {
      const creatorId = getCreatorId();

      if (!creatorId) {
        console.error("❌ Creator ID tidak ditemukan untuk mengambil payment method");
        return;
      }

      let res: any;

      try {
        res = await Get(`payment-method`, {
          creator_id: creatorId,
          status: "active",
        });
      } catch (err) {
        res = await Get(`payment-method`, {});
      }

      if (res && Array.isArray(res)) {
        const activeMethods = res.filter((method: PaymentMethod) => method.status === "active");

        const cashMethod = activeMethods.find((m: PaymentMethod) => m.id === 5);
        const qrisSource = activeMethods.find((m: PaymentMethod) => m.id === 4) || activeMethods.find((m: PaymentMethod) => m.id !== 5);
        const qrisMethod = qrisSource ? { ...qrisSource, payment_name: "QRIS", icon: "ph:qr-code-bold" } : null;

        setPaymentList([cashMethod, qrisMethod].filter(Boolean) as PaymentMethod[]);
      }
    } catch (err: any) {
      console.error("Error fetching payment methods:", err);
      setPaymentList([
        {
          id: 5,
          payment_name: "Cash",
          account_no: null,
          account_name: "Tunai",
          account_branch: "",
          description: "Pembayaran tunai di lokasi",
          status: "active",
          logo: null,
        },
        {
          id: 4,
          payment_name: "QRIS",
          icon: "ph:qr-code-bold",
          account_no: null,
          account_name: "Xendit",
          account_branch: "",
          description: "Pembayaran QRIS",
          status: "active",
          logo: null,
        },
      ]);
    }
  };

  const otsStats = useMemo<OtsStats>(() => {
    const allSuccess = offlineTransactions.filter((t) => Number(t.transaction_status_id) === 2);
    const qrisSuccess = allSuccess.filter((t) => getPaymentMethodId(t) === 4);

    const totalOts = qrisSuccess.reduce((sum, t) => {
      const tickets = t.tickets || [];
      return sum + tickets.reduce((s: number, tk: any) => s + parseNumber(tk.subtotal_price), 0);
    }, 0);

    let totalEtickets = 0;
    let checkedInEtickets = 0;
    allSuccess.forEach((t) => {
      const ets = t.etickets || [];
      totalEtickets += ets.length;
      checkedInEtickets += ets.filter((e: any) => Number(e.is_checkin) === 1).length;
    });

    return {
      totalOts,
      otsQty: allSuccess.length,
      totalEtickets,
      checkedInEtickets,
    };
  }, [offlineTransactions]);

  useEffect(() => {
    if (data.length > 0) {
      updateDataBasedOnCounts();
    }
  }, [counts, data]);

  useEffect(() => {
    getAllEvents();
  }, []);

  const getStatusBadge = (statusId: number) => {
    const badge = (color: string, text: string) => (
      <span className="inline-flex items-center">
        <Badge color={color} variant="filled" size="sm" fw={600}>
          {text}
        </Badge>
      </span>
    );
    switch (statusId) {
      case 1:
        return badge("yellow", "Pending");
      case 2:
        return badge("green", "Success");
      case 3:
        return badge("red", "Failed");
      case 4:
        return badge("gray", "Expired");
      default:
        return badge("gray", "Unknown");
    }
  };

  const currentTransactions = useMemo(() => {
    return activeTab === "offline" ? offlineTransactions : onlineTransactions;
  }, [activeTab, offlineTransactions, onlineTransactions]);

  const filteredTransactions = useMemo(() => {
    const filtered = currentTransactions.filter((transaction) => {
      const customer = getCustomer(transaction);
      const q = filterValue.toLowerCase();
      return (
        transaction.invoice_no?.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.name.toLowerCase().includes(q) ||
        customer.phone.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const av = sortBy === "name" ? getCustomer(a).name.toLowerCase() : a[sortBy];
      const bv = sortBy === "name" ? getCustomer(b).name.toLowerCase() : b[sortBy];
      const cmp =
        sortBy === "total_price"
          ? parseNumber(av) - parseNumber(bv)
          : typeof av === "number"
            ? av - parseNumber(bv)
            : String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [currentTransactions, filterValue, sortBy, sortDir]);

  const pages = Math.ceil(filteredTransactions.length / ROWS_PER_PAGE);
  const items = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return filteredTransactions.slice(start, end);
  }, [page, filteredTransactions]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir(field === "created_at" ? "desc" : "asc");
    }
    setPage(1);
  };

  const downloadReport = () => {
    if (!eventData) return;

    const type = activeTab === "offline" ? "offline" : "online";
    const url = `${config.wsUrl}list-transaction-by-event?event_id=${eventData.id}&type_transaction=${type}&download=true`;
    window.open(url, "_blank");
  };

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleManualCheckin = async (eticket: any) => {
    if (!eticket?.eticket_number) return;
    setCheckingInId(eticket.id);
    try {
      const response = await axios.post(
        `${config.wsUrl}event/scan-eticket`,
        { qr_code: eticket.eticket_number },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (response.data?.success || response.data?.status === 200 || response.data?.status === true) {
        notifications.show({
          title: "Berhasil",
          message: "Check-in manual berhasil dilakukan",
          color: "green",
        });
        setCheckinTransaction((prev: any) =>
          prev
            ? {
                ...prev,
                etickets: prev.etickets.map((e: any) => (e.id === eticket.id ? { ...e, is_checkin: 1 } : e)),
              }
            : prev
        );
        await refreshTransactionData();
      } else {
        throw new Error(response.data?.message || "Gagal melakukan check-in manual");
      }
    } catch (error: any) {
      notifications.show({
        title: "Gagal",
        message: error.response?.data?.message || error.message || "Terjadi kesalahan",
        color: "red",
      });
    } finally {
      setCheckingInId(null);
    }
  };

  const resetTicketForm = () => {
    const resetCounts: Record<number, number> = {};
    data.forEach((item) => {
      resetCounts[item.id] = 0;
    });
    setCounts(resetCounts);
    setTicket([]);
    setSelected(0);
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="py-5 px-4 sm:px-5">
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <Spinner color="primary" size="lg" />
          <p className="mt-4 text-gray-600">Memuat data event...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0 && !isLoading) {
    return (
      <div className="py-5 px-4 sm:px-5">
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <h3 className="text-red-500 mb-4">Tidak ada event</h3>
          <p className="text-gray-600 mb-4">Anda belum memiliki event</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button label="Buat Event Baru" color="secondary" onClick={() => router.push("/dashboard/my-event/create")} />
            <Button label="Kelola Event Saya" color="secondary" onClick={() => router.push("/dashboard/my-event")} />
            <Button label="Refresh Data" color="primary" onClick={() => getAllEvents()} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-5 px-4 sm:px-5 pb-24">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shrink-0">
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              </button>
              <h3 className="text-xl sm:text-2xl font-bold">Penjualan Tiket OTS</h3>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <div className="mb-4">
                <Select
                  label="Pilih Event"
                  placeholder={events.length === 0 ? "Tidak ada event" : "Pilih event untuk penjualan OTS"}
                  selectedKeys={selectedEventId ? [selectedEventId] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleEventSelect(selected);
                  }}
                  isLoading={isLoading}
                  isDisabled={events.length === 0}
                  className="w-full"
                >
                  {events.map((event) => (
                    <SelectItem key={event.id.toString()} value={event.id.toString()} textValue={`${event.name} (${moment(event.start_date).format("DD MMM YYYY")})`}>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-xs text-gray-500">{moment(event.start_date).format("DD MMM YYYY")}</span>
                        <span className={`text-xs mt-1 ${(event.has_event_ticket || []).filter((t: any) => t.is_ots === 1).length > 0 ? "text-green-600" : "text-yellow-600"}`}>
                          {(event.has_event_ticket || []).filter((t: any) => t.is_ots === 1).length || 0} tiket OTS
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {eventData && (
              <div className="lg:col-span-8">
                <div className="grid grid-cols-2 gap-3">
                  <Card shadow="sm" padding="sm" radius="md" withBorder className="h-full">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-green-100 rounded-lg shrink-0">
                        <FontAwesomeIcon icon={faStore} className="text-green-600 text-base sm:text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Total OTS</p>
                        <p className="font-bold text-lg sm:text-xl truncate">Rp{otsStats.totalOts.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </Card>

                  <Card shadow="sm" padding="sm" radius="md" withBorder className="h-full">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-blue-100 rounded-lg shrink-0">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-blue-600 text-base sm:text-lg" />
                      </div>
                      <div className="min-w-0 w-full">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Qty OTS</p>
                        <p className="font-bold text-lg sm:text-xl truncate">{otsStats.otsQty} Transaksi</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          Check-In: {otsStats.checkedInEtickets} / {otsStats.totalEtickets} Tiket
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {eventData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KOLOM KIRI - Tabel Transaksi */}
              <div className="flex flex-col h-full">
                <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h5 className="font-semibold text-lg">Riwayat Penjualan</h5>
                    <Badge color="blue" variant="light">
                      {currentTransactions.length} transaksi
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <div className="flex-grow">
                      <Input placeholder="Cari invoice, email, nama, atau telepon..." value={filterValue} onChange={onSearchChange} className="w-full" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Tabs
                        selectedKey={activeTab}
                        onSelectionChange={(key) => {
                          setActiveTab(key as "offline" | "online");
                          setPage(1);
                        }}
                        size="sm"
                        aria-label="Transaction types"
                      >
                        <Tab
                          key="offline"
                          title={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faStore} className="text-sm" />
                              <span>Offline ({offlineTransactions.length})</span>
                            </div>
                          }
                        />
                        <Tab
                          key="online"
                          title={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faDesktop} className="text-sm" />
                              <span>Online ({onlineTransactions.length})</span>
                            </div>
                          }
                        />
                      </Tabs>
                      <button onClick={downloadReport} className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 text-sm border border-light-grey rounded-md px-3 py-2 hover:bg-gray-50 transition-colors">
                        <FontAwesomeIcon icon={faDownload} className="text-gray-600" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto overflow-x-auto mb-4 max-h-[360px]">
                      <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                        <thead>
                          <tr className="border-b border-light-grey" style={{ backgroundColor: "#f5f7fa" }}>
                            <th className={`${thCls("center")} w-12 sticky left-0 z-20 bg-[#f5f7fa]`}>No</th>
                            <th onClick={() => handleSort("invoice_no")} className={`${thCls()} cursor-pointer select-none`}>
                              Invoice <SortIcon active={sortBy === "invoice_no"} dir={sortDir} />
                            </th>
                            <th onClick={() => handleSort("created_at")} className={`${thCls()} cursor-pointer select-none`}>
                              Tanggal <SortIcon active={sortBy === "created_at"} dir={sortDir} />
                            </th>
                            <th onClick={() => handleSort("name")} className={`${thCls()} cursor-pointer select-none`}>
                              Customer <SortIcon active={sortBy === "name"} dir={sortDir} />
                            </th>
                            <th onClick={() => handleSort("total_price")} className={`${thCls()} cursor-pointer select-none`}>
                              Jumlah <SortIcon active={sortBy === "total_price"} dir={sortDir} />
                            </th>
                            <th className={thCls()}>Metode</th>
                            <th className={`${thCls()} min-w-[110px]`}>Status</th>
                            <th className={`${thCls("center")} w-20 min-w-[80px] sticky right-[182px] z-20 bg-[#f5f7fa]`}>E-Ticket</th>
                            <th className={`${thCls("center")} min-w-[110px] sticky right-[72px] z-20 bg-[#f5f7fa]`}>Check-In</th>
                            <th className={`${thCls("center")} min-w-[120px]`}>Status Check-In</th>
                            <th className={`${thCls("center")} min-w-[72px] sticky right-0 z-20 bg-[#f5f7fa]`}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length > 0 ? (
                            items.map((item: any, idx: number) => (
                              <tr key={item.id} className="border-b border-light-grey hover:bg-gray-50 transition-colors">
                                <td className={`${tdCls("center")} w-12 sticky left-0 z-20 bg-white`}>{(page - 1) * ROWS_PER_PAGE + idx + 1}</td>
                                <td className={tdCls()}>
                                  <p className="font-medium">{item.invoice_no}</p>
                                </td>
                                <td className={tdCls()}>
                                  <p>{moment(item.created_at).format("DD/MM/YY")}</p>
                                  <p className="text-xs text-gray-500">{moment(item.created_at).format("HH:mm")}</p>
                                </td>
                                <td className={tdCls()}>
                                  <div className="min-w-[120px]">
                                    <p className="font-medium truncate">{getCustomer(item).name}</p>
                                    <p className="text-xs text-gray-500 truncate">{getCustomer(item).email}</p>
                                    <p className="text-xs text-gray-500 truncate">{getCustomer(item).phone}</p>
                                  </div>
                                </td>
                                <td className={tdCls()}>
                                  <p className="font-semibold">{formatRupiah(item.total_price)}</p>
                                  <p className="text-xs text-gray-500">{item.total_qty || 0} tiket</p>
                                </td>
                                <td className={tdCls()}>{resolvePaymentMethodLabel(item)}</td>
                                <td className={tdCls()}>{getStatusBadge(item.transaction_status_id)}</td>
                                <td className={`${tdCls("center")} sticky right-[182px] z-20 bg-white`}>
                                  {(() => {
                                    const isPaid = Number(item.transaction_status_id) === 2;
                                    const hasEtickets = item.etickets && item.etickets.length > 0;
                                    const qrTitle = !isPaid ? "E-Ticket tersedia setelah pembayaran berhasil" : hasEtickets ? "Lihat QR Code E-Ticket" : "Tidak ada e-ticket";
                                    return (
                                      <button
                                        onClick={() => setQrTransaction(item)}
                                        disabled={!isPaid || !hasEtickets}
                                        title={qrTitle}
                                        className="relative flex items-center justify-center w-8 h-8 mx-auto text-primary hover:bg-primary/10 rounded-md transition-colors disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                      >
                                        <FontAwesomeIcon icon={faQrcode} />
                                        {isPaid && item.etickets && item.etickets.length > 1 && (
                                          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                                            {item.etickets.length}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })()}
                                </td>
                                <td className={`${tdCls("center")} sticky right-[72px] z-20 bg-white`}>
                                  <div className="flex items-center justify-center gap-1">
                                    {(() => {
                                      const isPaid = Number(item.transaction_status_id) === 2;
                                      const etickets: any[] = item.etickets || [];
                                      const hasEtickets = etickets.length > 0;
                                      const hasUnchecked = etickets.some((e: any) => Number(e.is_checkin) !== 1);
                                      const checkinTitle = !isPaid ? "Check-in tersedia setelah pembayaran berhasil" : !hasEtickets ? "Tidak ada e-ticket" : hasUnchecked ? "Check-in Manual" : "Semua e-ticket sudah check-in";
                                      return (
                                        <button
                                          onClick={() => setCheckinTransaction(item)}
                                          disabled={!isPaid || !hasEtickets || !hasUnchecked}
                                          title={checkinTitle}
                                          className="flex items-center justify-center w-8 h-8 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                        >
                                          <FontAwesomeIcon icon={faCheckCircle} />
                                        </button>
                                      );
                                    })()}
                                    {(() => {
                                      const isKnownStatus = [1, 2, 3, 4].includes(Number(item.transaction_status_id));
                                      if (!isKnownStatus) {
                                        return (
                                          <span title="E-Ticket tidak tersedia untuk status ini" className="flex items-center justify-center w-8 h-8 text-gray-300 cursor-not-allowed rounded-md">
                                            <FontAwesomeIcon icon={faDownload} />
                                          </span>
                                        );
                                      }
                                      return (
                                        <a
                                          href={`${config.wsUrl}transaction-document/${item.invoice_no}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Download E-Ticket"
                                          className="flex items-center justify-center w-8 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                          <FontAwesomeIcon icon={faDownload} />
                                        </a>
                                      );
                                    })()}
                                  </div>
                                </td>
                                <td className={`${tdCls("center")}`}>
                                  {(() => {
                                    const isPaid = Number(item.transaction_status_id) === 2;
                                    const etickets: any[] = item.etickets || [];
                                    if (!isPaid || etickets.length === 0) return <span className="text-gray-400">-</span>;
                                    const checkedInCount = etickets.filter((e: any) => Number(e.is_checkin) === 1).length;
                                    const allChecked = checkedInCount === etickets.length;
                                    return (
                                      <Badge color={allChecked ? "green" : "yellow"} variant={allChecked ? "filled" : "light"} size="sm" fw={600}>
                                        {checkedInCount}/{etickets.length} Check-In
                                      </Badge>
                                    );
                                  })()}
                                </td>
                                <td className={`${tdCls("center")} sticky right-0 z-20 bg-white`}>
                                  <button onClick={() => handleViewTransaction(item)} title="Lihat Detail Transaksi" className="flex items-center justify-center w-8 h-8 mx-auto text-primary hover:text-primary-dark rounded hover:bg-primary/10 transition-colors">
                                    <FontAwesomeIcon icon={faEye} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={11} className="text-center py-8 text-gray-500">
                                {activeTab === "offline" ? "Belum ada transaksi offline" : "Belum ada transaksi online"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                  </div>

                  <div className="mt-4 pt-4 border-t border-light-grey">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                      <p className="text-xs text-gray-500 text-center sm:text-left">
                        Menampilkan {filteredTransactions.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1} sampai{" "}
                        {Math.min(page * ROWS_PER_PAGE, filteredTransactions.length)} dari {filteredTransactions.length} transaksi {activeTab === "offline" ? "offline" : "online"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {pages > 1 && <Pagination page={page} total={pages} onChange={setPage} showControls />}
                        <Button
                          label="Refresh Data"
                          color="secondary"
                          onClick={() => {
                            if (eventData) {
                              loadEventData(eventData);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* KOLOM KANAN - TicketPicker */}
              <div className="flex flex-col h-full">
                <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h5 className="font-semibold text-lg">Pilih Tiket OTS</h5>
                    <div className="flex items-center gap-2">
                      {data.length > 0 ? (
                        <Badge color="green" variant="light">
                          {data.length} tiket tersedia
                        </Badge>
                      ) : (
                        <Badge color="yellow" variant="light">
                          Belum ada tiket OTS
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                      <Spinner color="primary" />
                      <p className="ml-3">Memuat data tiket...</p>
                    </div>
                  ) : data.length > 0 ? (
                    <>
                      <div className="flex-grow overflow-y-auto pr-2 mb-4">
                        <TicketPicker eventData={eventData} counts={counts} setCounts={setCounts} data={data} isLogin={true} selected={selected} setSelected={setSelected} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 flex-grow flex flex-col justify-center">
                      <div className="text-gray-400 mb-3">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <h5 className="font-semibold text-lg mb-1">Belum ada tiket OTS</h5>
                      <p className="text-sm text-gray-500 mb-4">Event ini belum memiliki tiket yang diaktifkan untuk penjualan OTS. Tambahkan tiket OTS terlebih dahulu untuk mulai penjualan.</p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button label="Refresh Data" color="primary" onClick={() => loadEventData(eventData)} className="w-full sm:w-auto" />
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}

        {!eventData && events.length > 0 && (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h5 className="font-semibold text-lg mb-1">Pilih Event Terlebih Dahulu</h5>
            <p className="text-sm text-gray-500 mb-4">Silakan pilih event dari dropdown di atas untuk mulai penjualan tiket OTS</p>
          </div>
        )}
      </div>

      {/* FOOTER - POSISI ABSOLUTE DALAM PAGE TAPI IKUT SCROLL */}
      {eventData && data.length > 0 && (
        <div className="fixed bottom-0 left-[280px] right-[200px] z-40 transition-all duration-300">
          <div className="bg-white border-t border-primary-light-200 shadow-lg rounded-t-2xl mx-2 mb-0 overflow-hidden">
            <div className="max-w-full mx-auto px-4 py-3">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                {/* Bagian Kiri - Info Tiket */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="font-bold">{totalCount}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tiket Dipilih</p>
                      <p className="text-sm font-medium">{totalCount} tiket</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Subtotal: </span>
                      <span className="font-medium">Rp{subtotalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    
                    {totalTicketFee > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-500">+ Biaya: </span>
                        <span className="font-medium text-red-600">Rp{totalTicketFee.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bagian Kanan - Total & Tombol */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none text-right sm:text-center">
                    <p className="text-xs text-gray-500">Total Pembayaran</p>
                    <p className="text-lg font-bold text-primary">Rp{grandTotal.toLocaleString("id-ID")}</p>
                  </div>
                  
                  <Button 
                    label="Proses Pembayaran" 
                    color="primary" 
                    onClick={() => setShowModal(true)} 
                    disabled={totalCount < 1} 
                    className="flex-1 sm:flex-none min-w-[160px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {eventData && (
        <ModalOfflineSales
          isOpen={showModal}
          setIsOpen={setShowModal}
          paymentList={paymentList}
          ticket={ticket}
          eventData={eventData}
          subtotal={subtotalPrice}
          ticketFee={totalTicketFee}
          grandTotal={grandTotal}
          reload={() => {
            if (eventData) {
              refreshTransactionData();
            }
          }}
          setParentStep={() => {}}
          onSuccess={() => {
            resetTicketForm();
          }}
        />
      )}

      {/* Modal Detail Transaksi Custom */}
      <TransactionDetailModal 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        transaction={selectedTransaction} 
        paymentList={paymentList} 
        eventData={eventData} 
      />

      {/* Modal QR Code E-Ticket */}
      <MantineModal
        opened={Boolean(qrTransaction)}
        onClose={() => setQrTransaction(null)}
        size="lg"
        centered
        title={<Text fw={600}>QR Code E-Ticket{qrTransaction?.invoice_no ? ` — ${qrTransaction.invoice_no}` : ""}</Text>}
      >
        {qrTransaction?.etickets && qrTransaction.etickets.length > 0 ? (
          <div className={`grid gap-4 max-h-[60vh] overflow-y-auto p-1 ${qrTransaction.etickets.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 justify-items-center"}`}>
            {qrTransaction.etickets.map((et: any) => (
              <div key={et.id} className="flex flex-col items-center border border-primary-light-200 rounded-lg p-3 w-full max-w-[320px]">
                <QrCode slug={String(et.eticket_number ?? "")} />
                <Text size="xs" c="dimmed" mt={6} className="text-center break-all">
                  {et.eticket_number}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            Tidak ada e-ticket untuk transaksi ini
          </Text>
        )}
      </MantineModal>

      {/* Modal Check-in E-Ticket */}
      <MantineModal
        opened={Boolean(checkinTransaction)}
        onClose={() => setCheckinTransaction(null)}
        size="md"
        centered
        title={<Text fw={600}>Check-in E-Ticket{checkinTransaction?.invoice_no ? ` — ${checkinTransaction.invoice_no}` : ""}</Text>}
      >
        {checkinTransaction?.etickets && checkinTransaction.etickets.length > 0 ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
            {checkinTransaction.etickets.map((et: any) => {
              const isChecked = Number(et.is_checkin) === 1;
              return (
                <div key={et.id} className="flex justify-between items-center border border-primary-light-200 rounded-lg p-3 bg-gray-50 gap-3">
                  <div className="min-w-0">
                    <Text size="xs" c="dimmed">Nomor E-Ticket</Text>
                    <Text size="sm" fw={600} className="font-mono break-all">{et.eticket_number}</Text>
                    <div className="mt-1">
                      <Badge color={isChecked ? "green" : "gray"} variant="filled" size="xs" fw={600}>
                        {isChecked ? "SUDAH CHECKIN" : "BELUM CHECKIN"}
                      </Badge>
                    </div>
                  </div>
                  {!isChecked && (
                    <Button
                      label={checkingInId === et.id ? "..." : "Checkin Manual"}
                      color="secondary"
                      onClick={() => handleManualCheckin(et)}
                      disabled={checkingInId === et.id}
                      className="shrink-0 h-9"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            Tidak ada e-ticket untuk transaksi ini
          </Text>
        )}
      </MantineModal>
    </>
  );
};

export default TicketOTS;