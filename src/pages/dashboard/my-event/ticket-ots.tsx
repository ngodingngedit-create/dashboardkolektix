import { useState, useEffect, useMemo } from "react";
import { BreadcrumbItem, Breadcrumbs, Select, SelectItem, Tabs, Tab } from "@nextui-org/react";
import Button from "@/components/Button";
import { Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input } from "@nextui-org/react";
import { Get } from "@/utils/REST";
import { EventProps, TicketProps } from "@/utils/globalInterface";
import { useRouter } from "next/router";
import TicketPicker from "@/components/TicketPicker";
import ModalOfflineSales from "@/components/Modals/ModalOfflineSales";
import { Text, Badge, Card } from "@mantine/core";
import moment from "moment";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faTicketAlt, faShoppingCart, faDownload, faArrowLeft, faDesktop, faReceipt, faEye } from "@fortawesome/free-solid-svg-icons";
import config from "@/Config";
import axios from "axios";

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

interface SalesStats {
  totalOnline: number;
  totalOffline: number;
  totalTransactions: number;
  totalTicketsSold: number;
  avgTicketPrice: number;
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

// Komponen Modal Detail Transaksi
const TransactionDetailModal = ({ isOpen, onClose, transaction, paymentList, eventData }: TransactionDetailModalProps) => {
  if (!transaction) return null;

  const getPaymentMethodName = () => {
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
  const ppn = parseNumber(transaction.ppn);
  const grandTotal = parseNumber(transaction.grandtotal);
  
  const totalTicketFee = transaction.tickets?.reduce((sum: number, ticket: any) => {
    return sum + parseNumber(ticket.has_event_ticket?.ticket_fee || 0) * parseNumber(ticket.qty_ticket || 1);
  }, 0) || 0;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faReceipt} />
              <h3 className="text-lg font-semibold">Detail Transaksi</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{transaction.invoice_no}</p>
        </div>
        
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-80px)]">
          <div className="space-y-4">
            {/* Info Transaksi */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text fw={600} size="lg" className="mb-3">Informasi Transaksi</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Text size="sm" c="dimmed">Invoice</Text><Text fw={500}>{transaction.invoice_no}</Text></div>
                <div><Text size="sm" c="dimmed">Tanggal</Text><Text fw={500}>{moment(transaction.created_at).format("DD MMMM YYYY HH:mm")}</Text></div>
                <div><Text size="sm" c="dimmed">Status</Text><Badge color={status.color as any} variant="light">{status.text}</Badge></div>
                <div><Text size="sm" c="dimmed">Metode Pembayaran</Text><Text fw={500}>{getPaymentMethodName()}</Text></div>
                <div><Text size="sm" c="dimmed">Tipe Transaksi</Text><Badge color={transaction.type_transaction === "offline" ? "blue" : "green"} variant="light">{transaction.type_transaction === "offline" ? "Offline" : "Online"}</Badge></div>
                <div><Text size="sm" c="dimmed">Event</Text><Text fw={500}>{transaction.has_event?.name || "Unknown Event"}</Text></div>
              </div>
            </Card>

            {/* Info Customer */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text fw={600} size="lg" className="mb-3">Informasi Customer</Text>
              {transaction.identities && transaction.identities.length > 0 ? (
                <div className="space-y-3">
                  {transaction.identities.map((identity: any, index: number) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><Text size="sm" c="dimmed">Nama Lengkap</Text><Text fw={500}>{identity.full_name || "-"}</Text></div>
                        <div><Text size="sm" c="dimmed">Email</Text><Text fw={500}>{identity.email || "-"}</Text></div>
                        <div><Text size="sm" c="dimmed">No. Telepon</Text><Text fw={500}>{identity.no_telp || "-"}</Text></div>
                        <div><Text size="sm" c="dimmed">NIK</Text><Text fw={500}>{identity.nik || "-"}</Text></div>
                        {identity.is_pemesan === 1 && <div className="col-span-2"><Badge color="blue" variant="light">Pemesan Utama</Badge></div>}
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
              <Text fw={600} size="lg" className="mb-3">Detail Tiket</Text>
              {transaction.tickets && transaction.tickets.length > 0 ? (
                <div className="space-y-2">
                  {transaction.tickets.map((ticket: any, index: number) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div className="flex-1">
                        <Text fw={500}>{ticket.has_event_ticket?.name || "Ticket OTS"}</Text>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Text size="sm" c="dimmed">Qty: {ticket.qty_ticket || 1}</Text>
                          {ticket.code && <Text size="sm" c="dimmed">Kode: {ticket.code}</Text>}
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <Text fw={500}>Rp{parseNumber(ticket.price).toLocaleString("id-ID")}</Text>
                        <Text size="sm" c="dimmed">Subtotal: Rp{parseNumber(ticket.subtotal_price).toLocaleString("id-ID")}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4"><Text c="dimmed">Tidak ada data tiket</Text></div>
              )}
            </Card>

            {/* Ringkasan Pembayaran */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text fw={600} size="lg" className="mb-3">Ringkasan Pembayaran</Text>
              <div className="space-y-3">
                <div className="flex justify-between"><Text>Subtotal Tiket ({transaction.total_qty || 0} tiket)</Text><Text>Rp{totalPrice.toLocaleString("id-ID")}</Text></div>
                {adminFee > 0 && <div className="flex justify-between"><Text>Biaya Admin</Text><Text>Rp{adminFee.toLocaleString("id-ID")}</Text></div>}
                {ppn > 0 && <div className="flex justify-between"><Text>PPN</Text><Text>Rp{ppn.toLocaleString("id-ID")}</Text></div>}
                <div className="flex justify-between border-t pt-3 mt-2">
                  <Text fw={600}>Total Pembayaran</Text>
                  <Text fw={600} size="lg">Rp{grandTotal.toLocaleString("id-ID")}</Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
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
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalOnline: 0,
    totalOffline: 0,
    totalTransactions: 0,
    totalTicketsSold: 0,
    avgTicketPrice: 0,
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterValue, setFilterValue] = useState("");
  const [activeTab, setActiveTab] = useState<"offline" | "online">("offline");
  const router = useRouter();

  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const subtotalPrice = useMemo(() => {
    return ticket.reduce((sum, item) => sum + item.subtotal_price, 0);
  }, [ticket]);

  const totalTicketFee = useMemo(() => {
    return ticket.reduce((sum, item) => sum + (item.ticket_fee || 0), 0);
  }, [ticket]);

  const grandTotal = useMemo(() => {
    const baseAmount = subtotalPrice + totalTicketFee;
    const ppnAmount = eventData?.ppn_type === "percentage" ? baseAmount * 0.11 : eventData?.ppn || 0;
    return baseAmount + ppnAmount;
  }, [subtotalPrice, totalTicketFee, eventData]);

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
      updateSalesStats();
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
          include: "transaction_tickets,user",
        },
      });

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const filteredTransactions = response.data.data.filter((transaction: any) => {
          const transactionCreatorId = transaction.has_event?.has_creator?.id || transaction.has_event?.creator_id;
          return transactionCreatorId == creatorId;
        });

        setOfflineTransactions(filteredTransactions);
        updateSalesStats();
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
          include: "transaction_tickets,user",
        },
      });

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const filteredTransactions = response.data.data.filter((transaction: any) => {
          const transactionCreatorId = transaction.has_event?.has_creator?.id || transaction.has_event?.creator_id;
          return transactionCreatorId == creatorId;
        });

        setOnlineTransactions(filteredTransactions);
        updateSalesStats();
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
        const otherMethods = activeMethods.filter((m: PaymentMethod) => m.id !== 5);

        const sortedMethods = cashMethod ? [cashMethod, ...otherMethods] : activeMethods;

        setPaymentList(sortedMethods);
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
      ]);
    }
  };

  const updateSalesStats = () => {
    const totalOffline = offlineTransactions.reduce((sum, t) => sum + parseNumber(t.grandtotal), 0);
    const totalOnline = onlineTransactions.reduce((sum, t) => sum + parseNumber(t.grandtotal), 0);
    const totalTicketsSold = [...offlineTransactions, ...onlineTransactions].reduce((sum, t) => sum + (parseInt(t.total_qty) || 0), 0);
    const avgTicketPrice = totalTicketsSold > 0 ? (totalOffline + totalOnline) / totalTicketsSold : 0;

    setSalesStats({
      totalOnline,
      totalOffline,
      totalTransactions: offlineTransactions.length + onlineTransactions.length,
      totalTicketsSold,
      avgTicketPrice,
    });
  };

  useEffect(() => {
    if (data.length > 0) {
      updateDataBasedOnCounts();
    }
  }, [counts, data]);

  useEffect(() => {
    getAllEvents();
  }, []);

  const getPaymentMethodName = (paymentMethodId: number) => {
    const method = paymentList.find((m) => m.id === paymentMethodId);
    return method ? method.payment_name : "Unknown";
  };

  const getStatusBadge = (statusId: number) => {
    switch (statusId) {
      case 1:
        return <Badge color="yellow">Pending</Badge>;
      case 2:
        return <Badge color="green">Success</Badge>;
      case 3:
        return <Badge color="red">Failed</Badge>;
      case 4:
        return <Badge color="gray">Expired</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const currentTransactions = useMemo(() => {
    return activeTab === "offline" ? offlineTransactions : onlineTransactions;
  }, [activeTab, offlineTransactions, onlineTransactions]);

  const filteredTransactions = useMemo(() => {
    return currentTransactions.filter((transaction) => {
      const invoiceMatch = transaction.invoice_no?.toLowerCase().includes(filterValue.toLowerCase());
      const customerMatch = transaction.has_user?.email?.toLowerCase().includes(filterValue.toLowerCase());
      const nameMatch = transaction.has_user?.name?.toLowerCase().includes(filterValue.toLowerCase());
      const phoneMatch = transaction.has_user?.phone?.toLowerCase().includes(filterValue.toLowerCase());
      return invoiceMatch || customerMatch || nameMatch || phoneMatch;
    });
  }, [currentTransactions, filterValue]);

  const pages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredTransactions.slice(start, end);
  }, [page, filteredTransactions, rowsPerPage]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setPage(1);
  };

  const onRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
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
        <Breadcrumbs className="mb-5">
          <BreadcrumbItem href="/dashboard/my-event">Event Saya</BreadcrumbItem>
          <BreadcrumbItem>Tiket OTS</BreadcrumbItem>
        </Breadcrumbs>
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
        <Breadcrumbs className="mb-5">
          <BreadcrumbItem href="/dashboard/my-event">Event Saya</BreadcrumbItem>
          <BreadcrumbItem>Tiket OTS</BreadcrumbItem>
        </Breadcrumbs>
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
        <Breadcrumbs className="mb-5">
          <BreadcrumbItem href="/dashboard/my-event">Event Saya</BreadcrumbItem>
          <BreadcrumbItem>Tiket OTS</BreadcrumbItem>
        </Breadcrumbs>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shrink-0">
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              </button>
              <h3 className="text-xl sm:text-2xl font-bold">Penjualan Tiket OTS</h3>
            </div>
            <p className="text-sm text-gray-600">{eventData ? eventData.name : "Pilih event untuk penjualan OTS"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {eventData && (
              <>
                <Button label="Riwayat Penjualan" color="secondary" onClick={() => router.push(`/dashboard/my-event/${eventData.slug}`)} className="text-sm" />
                <Button label="Check-in" color="secondary" onClick={() => router.push(`/dashboard/my-event/checkin/${eventData.slug}`)} className="text-sm" />
                <Button label="Tambah Tiket OTS" color="secondary" onClick={() => router.push(`/dashboard/my-event/${eventData.id}/ticket`)} className="text-sm" />
              </>
            )}
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card shadow="sm" padding="sm" radius="md" withBorder className="h-full">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-green-100 rounded-lg shrink-0">
                        <FontAwesomeIcon icon={faStore} className="text-green-600 text-base sm:text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Total Offline</p>
                        <p className="font-bold text-lg sm:text-xl truncate">Rp{salesStats.totalOffline.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </Card>

                  <Card shadow="sm" padding="sm" radius="md" withBorder className="h-full">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-blue-100 rounded-lg shrink-0">
                        <FontAwesomeIcon icon={faDesktop} className="text-blue-600 text-base sm:text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Total Online</p>
                        <p className="font-bold text-lg sm:text-xl truncate">Rp{salesStats.totalOnline.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </Card>

                  <Card shadow="sm" padding="sm" radius="md" withBorder className="h-full">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-purple-100 rounded-lg shrink-0">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-purple-600 text-base sm:text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Transaksi</p>
                        <p className="font-bold text-lg sm:text-xl truncate">{salesStats.totalTransactions}</p>
                      </div>
                    </div>
                  </Card>

                  <Card shadow="sm" padding="sm" radius="md" withBorder className="h-full">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-orange-100 rounded-lg shrink-0">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-orange-600 text-base sm:text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Tiket Terjual</p>
                        <p className="font-bold text-lg sm:text-xl truncate">{salesStats.totalTicketsSold}</p>
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
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h4 className="font-semibold text-lg text-dark mb-2">
                    {eventData.name}
                    {data.length > 0 ? (
                      <Badge color="green" className="ml-2">
                        OTS Aktif
                      </Badge>
                    ) : (
                      <Badge color="yellow" className="ml-2">
                        Belum Ada Tiket OTS
                      </Badge>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    📅 {moment(eventData.start_date).format("DD MMMM YYYY")} - {moment(eventData.end_date).format("DD MMMM YYYY")}
                  </p>
                  <p className="text-sm text-gray-600">🏢 {eventData.location_name || "Lokasi tidak tersedia"}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className={`text-sm ${data.length > 0 ? "text-green-600" : "text-yellow-600"}`}>🎫 {data.length} tiket OTS tersedia</p>
                  <p className="text-xs text-gray-500">Untuk penjualan di lokasi event</p>
                  {data.length === 0 && <p className="text-xs text-red-500 mt-1">Tambahkan tiket OTS di halaman kelola tiket</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KOLOM KIRI - Tabel Transaksi */}
              <div className="flex flex-col h-full">
                <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h5 className="font-semibold text-lg">Riwayat Penjualan</h5>
                    <div className="flex items-center gap-2">
                      <Badge color="blue" variant="light">
                        {currentTransactions.length} transaksi
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as "offline" | "online")} aria-label="Transaction types" className="w-full">
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
                  </div>

                  <div className="mb-4">
                    <Input placeholder="Cari invoice, email, nama, atau telepon..." value={filterValue} onChange={onSearchChange} className="mb-2" />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select onChange={onRowsPerPageChange} value={rowsPerPage} className="border border-gray-300 rounded-md p-2 text-sm w-full sm:w-auto">
                        <option value={5}>5 baris</option>
                        <option value={10}>10 baris</option>
                        <option value={20}>20 baris</option>
                      </select>
                      <button onClick={downloadReport} className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 text-sm border border-gray-300 rounded-md p-2 hover:bg-gray-50 transition-colors">
                        <FontAwesomeIcon icon={faDownload} className="text-gray-600" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow overflow-auto mb-4">
                    <div className="overflow-x-auto">
                      <Table aria-label="Transactions Table" className="min-w-full">
                        <TableHeader>
                          <TableColumn className="text-xs sm:text-sm whitespace-nowrap">INVOICE</TableColumn>
                          <TableColumn className="text-xs sm:text-sm whitespace-nowrap">TANGGAL</TableColumn>
                          <TableColumn className="text-xs sm:text-sm whitespace-nowrap">CUSTOMER</TableColumn>
                          <TableColumn className="text-xs sm:text-sm whitespace-nowrap">JUMLAH</TableColumn>
                          <TableColumn className="text-xs sm:text-sm whitespace-nowrap">METODE</TableColumn>
                          <TableColumn className="text-xs sm:text-sm whitespace-nowrap">STATUS</TableColumn>
                          <TableColumn className="text-xs sm:text-sm whitespace-nowrap">AKSI</TableColumn>
                        </TableHeader>
                        <TableBody
                          emptyContent={
                            <div className="text-center py-8">
                              <p className="text-gray-500">{activeTab === "offline" ? "Belum ada transaksi offline" : "Belum ada transaksi online"}</p>
                            </div>
                          }
                          items={items}
                        >
                          {(item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="whitespace-nowrap">
                                <p className="font-medium text-xs sm:text-sm">{item.invoice_no}</p>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <p className="text-xs sm:text-sm">{moment(item.created_at).format("DD/MM/YY")}</p>
                                <p className="text-xs text-gray-500">{moment(item.created_at).format("HH:mm")}</p>
                              </TableCell>
                              <TableCell>
                                <div className="min-w-[120px]">
                                  <p className="font-medium text-xs sm:text-sm truncate">{item.has_user?.name || "Walk-in Customer"}</p>
                                  <p className="text-xs text-gray-500 truncate">{item.has_user?.email || "-"}</p>
                                  <p className="text-xs text-gray-500 truncate">{item.has_user?.phone || "-"}</p>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <p className="font-semibold text-xs sm:text-sm">Rp{parseNumber(item.grandtotal).toLocaleString("id-ID")}</p>
                                <p className="text-xs text-gray-500">{item.total_qty || 0} tiket</p>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <p className="text-xs sm:text-sm">{getPaymentMethodName(item.payment_method_id)}</p>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{getStatusBadge(item.transaction_status_id)}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <button onClick={() => handleViewTransaction(item)} className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm p-1 rounded hover:bg-primary/10 transition-colors">
                                  <FontAwesomeIcon icon={faEye} className="text-xs" />
                                  <span className="hidden sm:inline">View</span>
                                </button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {pages > 1 && (
                    <div className="flex justify-center mb-4">
                      <Pagination page={page} total={pages} onChange={setPage} showControls />
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                      <p className="text-xs text-gray-500 text-center sm:text-left">
                        Menampilkan {items.length} dari {filteredTransactions.length} transaksi {activeTab === "offline" ? "offline" : "online"}
                      </p>
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
                        <Button label="Tambah Tiket OTS" color="secondary" onClick={() => router.push(`/dashboard/my-event/${eventData.id}/ticket`)} className="w-full sm:w-auto" />
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
          <div className="bg-white border-t border-gray-200 shadow-lg rounded-t-2xl mx-2 mb-0 overflow-hidden">
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
                    
                    {eventData?.ppn && (
                      <div className="text-sm">
                        <span className="text-gray-500">+ PPN: </span>
                        <span className="font-medium text-red-600">
                          Rp{(eventData?.ppn_type === "percentage" ? (subtotalPrice + totalTicketFee) * 0.11 : eventData?.ppn || 0).toLocaleString("id-ID")}
                        </span>
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
    </>
  );
};

export default TicketOTS;