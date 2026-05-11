import React, { useState, useMemo, useCallback, useEffect, createContext } from "react";
import EventCardCreator from "@/components/Card/EventCard/creator";
import config from "@/Config";
import { useRouter } from "next/router";
import axios from "axios";
import DetailModal from "@/components/Dashboard/Modal/ModalInvation";
import EditEventModal from "@/components/Dashboard/Modal/ModalEditInvation";
import AddEventModal, { CategoryResponse } from "@/components/Dashboard/Modal/ModalAddInvation";
import InvitationDetailModal from "@/components/Dashboard/Modal/ModalDetailInvation";
import { Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Pagination, Accordion, AccordionItem, Selection, Tabs, Tab, Tooltip, Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { EventProps } from "@/utils/globalInterface";
import { EventTicket, SeatmapData } from "@/utils/formInterface";
import { Get } from "@/utils/REST";
import Button from "@/components/Button";
import TicketContainer from "@/components/TicketContainer";
import ModalCreateTicket from "@/components/EventCreator/Modal/ModalCreateTicket";
import ModalEditTicket from "@/components/EventCreator/Modal/ModalEditTicket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPaperPlane, faPlus, faMoneyBillTransfer, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import TarikDanaModal from "@/components/Dashboard/Modal/Withdraw";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Divider, Flex, Stack, Text, Button as ButtonM, Box, Center } from "@mantine/core";
import WithdrawHistoryList from "@/components/MyEvent/WithdrawHistoryList";
import useLoggedUser from "@/utils/useLoggedUser";
import fetch from "@/utils/fetch";
import { notifications } from "@mantine/notifications";
import _ from "lodash";
import { useListState, UseListStateHandlers } from "@mantine/hooks";
import QrCode from "@/components/QrCode";
import { useParams } from "next/navigation";

interface EventData {
  creator_id: string;
  event_name: string;
  slug: string;
  total_admin_fee: number;
  total_buy: number;
  total_offline: number;
  total_online: number;
  total_paid: number;
  total_price_sell: number;
  total_price_sell_offline: number;
  total_price_sell_online: number;
  total_ticket: number;
  total_unpaid: number;
  total_views: number;
  total_withdraw: number;
  total_ticket_failed: number;
  total_ticket_pending: number;
  total_ticket_sold: number;
  total_pendapatan: number;
}

interface WithdrawHistory {
  id: number;
  event_id: number | null;
  product_id: number | null;
  user_id: number;
  user_bank_id: string;
  user_approval: string | null;
  invoice_no: string;
  amount: number;
  name: string;
  bank_account: number;
  status: "Pending" | "Success" | "Failed" | "Rejected";
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  transaction_status_id: number | null;
}

interface TransactionItem {
  id: string | number;
  invoice_no: string;
  type_transaction: string;
  created_at: string;
  transaction_status_id: number;
  has_user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    verified_status_id: number | null;
    is_creator: number;
  };
  identities?: Array<{
    id: number;
    email: string;
    full_name: string;
  }>;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface TransactionResponse {
  data: any[];
  grand_total: number;
  pagination: PaginationData;
}

export const Context = createContext<{
  seatmapData?: SeatmapData[];
  setSeatmapData?: UseListStateHandlers<SeatmapData>;
  ticket?: EventTicket[];
  eventData?: EventProps | null;
  seatmapOpen?: number;
  setSeatmapOpen?: (index?: number) => void;
  setTicket?: (ticket: EventTicket[]) => void;
}>({
  seatmapData: [],
  ticket: [],
  eventData: null,
  seatmapOpen: undefined,
  setSeatmapOpen: () => {},
  setTicket: () => {},
});

const AdminEventDetailView = () => {
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
  };
  const router = useRouter();
  const user = useLoggedUser();
  const { slug } = router.query;
  const [data, setData] = useState<EventProps>();
  const [ticket, setTicket] = useState<EventTicket[]>([]);
  const [editTicketData, setEditTicketData] = useState<EventTicket>(defaultForm);
  const [isEditTicketModalOpen, setIsEditTicketModalOpen] = useState<boolean>(false);
  const [addTicket, showAddTicket] = useState<boolean>(false);
  const [idxTicket, setIdxTicket] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState<"all" | "online" | "offline">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [invitationData, setInvitationData] = useState<any[]>([]);
  const [invitation, setInvitation] = useState<any[]>([]);
  const [invitationFilter, setInvitationFilter] = useState("");
  const [updateWithdrawHistory, setUpdateWithdrawHistory] = useState(1);
  const [seatmap, setSeatmap] = useListState<SeatmapData>([]);
  const [invitationCategory, setInvitationCategory] = useState<CategoryResponse[]>();
  const [seatmapOpen, setSeatmapOpen] = useState<number>();

  const [activeTab, setActiveTab] = useState<string>("Detail");
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionItem[]>([]);
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [sendingInvitations, setSendingInvitations] = useState<Record<string, boolean>>({});
  const params = useParams();
  const [withdrawHistoryList, setWithdrawHistoryList] = useState<WithdrawHistory[]>([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionRowsPerPage, setTransactionRowsPerPage] = useState(20);
  const [transactionPagination, setTransactionPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  const remainingBalance = (eventData?.total_price_sell || 0) - withdrawHistoryList.reduce((sum, item) => sum + item.amount, 0);

  const fetchTransactions = useCallback(async (pageNumber: number = 1, searchValue: string = filterValue) => {
    if (!data?.id) return;
    try {
      setTransactionLoading(true);
      const queryParams = new URLSearchParams({
        event_id: data.id.toString(),
        page: pageNumber.toString(),
        limit: transactionRowsPerPage.toString(),
      });
      if (searchValue) queryParams.append('search', searchValue);
      if (transactionFilter !== 'all') queryParams.append('type', transactionFilter);
      const response = await axios.get(`${config.wsUrl}list-transaction-by-event?${queryParams.toString()}`);
      const result = response.data as TransactionResponse;
      if (result?.data && Array.isArray(result.data)) {
        setTransactionData(result.data);
        setGrandTotal(result.grand_total || 0);
        setTransactionPagination(result.pagination || { current_page: pageNumber, last_page: 1, total: 0, per_page: transactionRowsPerPage });
        setTransactionPage(pageNumber);
      }
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setTransactionLoading(false);
    }
  }, [data?.id, transactionFilter, transactionRowsPerPage, filterValue]);

  useEffect(() => {
    if (activeTab === "Transaksi" && data?.id) fetchTransactions(1, filterValue);
  }, [activeTab, data?.id, transactionFilter]);

  const filteredTransactionItems = useMemo(() => {
    if (!Array.isArray(transactionData)) return [];
    const lowerFilterValue = filterValue.toLowerCase();
    return transactionData.filter((item) => {
      const matchesInvoice = item.invoice_no?.toLowerCase().includes(lowerFilterValue) || false;
      const userEmail = item.has_user?.email?.toLowerCase() || "";
      const identityEmail = item.identities?.[0]?.email?.toLowerCase() || "";
      return matchesInvoice || userEmail.includes(lowerFilterValue) || identityEmail.includes(lowerFilterValue);
    });
  }, [transactionData, filterValue]);

  const onTransactionRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTransactionRowsPerPage(Number(e.target.value));
    fetchTransactions(1, filterValue);
  }, [fetchTransactions, filterValue]);

  const onTransactionPageChange = useCallback((page: number) => {
    fetchTransactions(page, filterValue);
  }, [fetchTransactions, filterValue]);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    fetchTransactions(1, e.target.value);
  }, [fetchTransactions]);

  const handleTransactionFilterChange = useCallback((filter: "all" | "online" | "offline") => {
    setTransactionFilter(filter);
    fetchTransactions(1, filterValue);
  }, [fetchTransactions, filterValue]);

  const sendInvitationEmail = useCallback(async (invitationItem: any) => {
    const invitationIdStr = String(invitationItem?.id);
    setSendingInvitations((prev) => ({ ...prev, [invitationIdStr]: true }));
    try {
      const payload = {
        event_id: data?.id,
        invitation_title: invitationItem?.invitation_title || "Undangan Event",
        invitation_description: invitationItem?.invitation_description || "",
        total_qty: invitationItem?.total_qty || 0,
        details: invitationItem?.event_invitation_detail?.map((detail: any) => ({ fullname: detail?.fullname || "", email: detail?.email || "", phone: detail?.phone || "" })) || [],
        is_one_receiver: invitationItem?.is_one_receiver === 1,
        is_banner_image: invitationItem?.is_banner_event === 1,
        invitation_cat_id: invitationItem?.invitation_cat_id || 17,
      };
      await fetch({
        url: "invitations",
        method: "POST",
        data: payload,
        success: (res) => {
          notifications.show({ title: "Berhasil!", message: `Invitation berhasil dikirim`, color: "green" });
          setTimeout(() => getInvitationEventData(data?.id || 0), 1000);
        },
      });
    } catch (error: any) {
      notifications.show({ title: "Gagal!", message: error.message || "Gagal mengirim invitation", color: "red" });
    } finally {
      setSendingInvitations((prev) => ({ ...prev, [invitationIdStr]: false }));
    }
  }, [data?.id]);

  const sendAllInvitations = async () => {
    if (!data?.id || !Array.isArray(invitation) || invitation.length === 0) return;
    setIsSendingInvitation(true);
    try {
      for (const item of invitation) {
        if (!item?.id) continue;
        await sendInvitationEmail(item);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      notifications.show({ title: "Selesai!", message: "Semua invitation telah diproses", color: "green" });
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const getInvitationCategory = async () => {
    await fetch<any, CategoryResponse[]>({
      url: "invitation-category",
      method: "GET",
      data: {},
      success: ({ data }) => data && setInvitationCategory(data),
    });
  };

  const getWithdrawHistory = async () => {
    try {
      const response = await axios.get(`${config.wsUrl}withdraw`);
      const withdrawData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setWithdrawHistoryList(withdrawData.filter((item: WithdrawHistory) => item.event_id === data?.id));
    } catch (error) {
      console.error("Error fetching withdraw data:", error);
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const openEditModal = (item: any) => { setSelectedEvent(item); setIsEditModalOpen(true); };
  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedEvent(null); };
  const openDetailModal = (item: any, ticket: any) => { setSelectedItem(item); setSelectedTicket(ticket); setIsDetailModalOpen(true); };
  const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedItem(null); setSelectedTicket(null); };
  const openInvitationModal = (item: any) => { setSelectedInvitation(item); setIsInvitationModalOpen(true); };
  const closeInvitationModal = () => { setIsInvitationModalOpen(false); setSelectedInvitation(null); };

  const getEventData = async (realSlug: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.wsUrl}event-view-list-by-slug/${realSlug}`);
      if (response.data) setEventData(response.data);
    } finally {
      setLoading(false);
    }
  };

  const getData = () => {
    setLoading(true);
    Get(`admin-data/event/${slug}`, {})
      .then((res: any) => {
        if (res.data) {
          setData(res.data);
          res?.data?.seatmap && setSeatmap.setState(JSON.parse(res?.data?.seatmap));
          setTicket(res.data.has_event_ticket);
          getReportData(res.data.id);
          getInvitationEventData(res.data.id);
          if (res.data.slug) {
            getEventData(res.data.slug);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const getReportData = async (id: string | number) => {
    try {
      const response = await axios.get(`${config.wsUrl}event/show-report/${id}`);
      setInvitationData(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error("Error fetching report data:", err);
    }
  };

  const sendETicket = useCallback(async (invoiceNo: string, email: string, itemId: string | number) => {
    const itemIdStr = String(itemId);
    setSendingEmails((prev) => ({ ...prev, [itemIdStr]: true }));
    try {
      await axios.get(`${config.wsUrl}transaction/send/eticket/${invoiceNo}`, { params: { email }, headers: { "X-Email-Type": "transaction", "X-Event-Id": data?.id } });
      notifications.show({ title: "Berhasil!", message: `E-ticket berhasil dikirim ke ${email}`, color: "green" });
    } catch (error: any) {
      notifications.show({ title: "Gagal!", message: error.response?.data?.message || "Gagal mengirim e-ticket", color: "red" });
    } finally {
      setTimeout(() => setSendingEmails((prev) => ({ ...prev, [itemIdStr]: false })), 300);
    }
  }, [data?.id]);

  const handleDownloadTransaction = async () => {
    window.open(`${config.wsUrl}list-transaction-by-event?event_id=${data?.id}&download=true`);
  };

  useEffect(() => {
    if (slug) { getData(); getInvitationCategory(); }
  }, [slug]);

  useEffect(() => {
    if (data?.id) getWithdrawHistory();
  }, [data?.id, updateWithdrawHistory]);

  const getInvitationEventData = async (id: string | number) => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.wsUrl}invitations/event/${id}`, { params: { with_details: true } });
      setInvitation(Array.isArray(response.data) ? response.data : response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredEventItems = useMemo(() => {
    if (!Array.isArray(invitation)) return [];
    return invitation.filter((item) => item.invitation_title?.toLowerCase().includes(invitationFilter.toLowerCase()));
  }, [invitation, invitationFilter]);

  const eventPages = Math.ceil(filteredEventItems.length / rowsPerPage);
  const eventItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredEventItems.slice(start, start + rowsPerPage);
  }, [page, filteredEventItems, rowsPerPage]);

  const onEventSearchChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
    setInvitationFilter(e.target.value);
    setPage(1);
  }, []);

  const onEventRowsPerPageChange = useCallback((e: { target: { value: any } }) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onEditTicket = (data: EventTicket, idx: number) => { setIdxTicket(idx); setEditTicketData(data); setIsEditTicketModalOpen(true); };

  const downloadLaporan = () => {
    if (!eventData) return;
    const dataLaporan = [
      ["Ringkasan Penjualan Tiket"],
      ["Total View", eventData.total_views || 0],
      ["Total Bookmarks", 0],
      ["Total Tiket Terjual", eventData.total_paid || 0],
      ["Total Penjualan", `Rp${eventData.total_price_sell ? eventData.total_price_sell.toLocaleString("id-ID") : 0}`],
      ["Total Admin Fee", `Rp${eventData.total_admin_fee ? eventData.total_admin_fee.toLocaleString("id-ID") : 0}`],
      ["Total Tiket", eventData.total_ticket || 0],
      ["Total Pembelian", eventData.total_buy || 0],
      ["Total Online", eventData.total_online || 0],
      ["Total Offline", eventData.total_offline || 0],
      ["Total Pembayaran Belum Lunas", eventData.total_unpaid || 0],
      ["Total Penjualan Online", `Rp${eventData.total_price_sell_online ? eventData.total_price_sell_online.toLocaleString("id-ID") : 0}`],
      ["Total Penjualan Offline", `Rp${eventData.total_price_sell_offline ? eventData.total_price_sell_offline.toLocaleString("id-ID") : 0}`],
      ["Grand Total", `Rp${eventData.total_price_sell && eventData.total_admin_fee ? (eventData.total_price_sell - eventData.total_admin_fee).toLocaleString("id-ID") : 0}`],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(dataLaporan);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
    XLSX.writeFile(workbook, `Laporan_Penjualan_Event_${eventData.event_name}.xlsx`);
  };

  const getStatusClass = (statusId: any) => {
    switch (statusId) {
      case 1: return "bg-warning";
      case 2: return "bg-success";
      case 3: return "bg-danger";
      case 4: return "bg-secondary";
      default: return "";
    }
  };

  const getStatusText = (statusId: any) => {
    switch (statusId) {
      case 1: return "Pending";
      case 2: return "Verified";
      case 3: return "Failed";
      case 4: return "Expired";
      default: return "Unknown";
    }
  };

  const getStatusTextInvitation = (statusId: any) => {
    switch (statusId) {
      case 0: return "Cancel";
      case 1: return "Active";
      case 2: return "Sent";
      default: return "Unknown";
    }
  };

  const getInvitationStatusClass = (statusId: any) => {
    switch (statusId) {
      case 0: return "bg-danger";
      case 1: return "bg-warning";
      case 2: return "bg-success";
      default: return "bg-secondary";
    }
  };

  return !loading && data ? (
    <>
      <div className="p-5">
        <Breadcrumbs className="mb-5">
          <BreadcrumbItem onPress={() => router.push("/dashboard/admin/event")}>Manajemen Event</BreadcrumbItem>
          <BreadcrumbItem>Detail Event (Admin)</BreadcrumbItem>
        </Breadcrumbs>
        <div className="flex items-center mb-4 gap-4">
          <button
            onClick={() => router.push("/dashboard/admin/event")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label="Kembali"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-dark m-0">Detail Event (Admin View)</h1>
        </div>
        <div className="flex flex-col md:flex-row lg:flex gap-2">
          <div className="max-w-[300px]">
            <EventCardCreator
              key={data.id}
              eventStatus={data.has_event_status.name}
              title={data.name}
              img={data.image_url}
              end={data.end_date}
              date={data.start_date}
              slug={data.slug}
              location={data.location_name}
              price={data.starting_price}
              creatorImg={data.has_creator?.image}
              creator={data.has_creator?.name}
              withoutButton
              shareLink={window.location.hostname === "dashboard.kolektix.com" ? `https://kolektix.com/event/${data.slug}` : `${window.location.origin}/event/${data.slug}`}
              liveReportLink={`https://api.kolektix.com/event/dashboard/${(data as any).slug_url || data.slug}`}
            />

            <div className="flex flex-col items-center justify-center p-4 max-w-full min-w-full lg:min-w-60 w-full bg-white rounded-xl shadow-md mx-1 md:mx-0 border border-primary-light-200 mt-4">
              <h5 className="text-lg font-semibold mb-2">Share your event link</h5>
              <QrCode slug={window.location.hostname === "dashboard.kolektix.com" ? `https://kolektix.com/event/${data.slug}` : `${window.location.origin}/event/${data.slug}`} errorCorrectionLevel="H" margin={8} logoSizeRatio={0.22} />
              {
                <Button
                  label="Download QR Code"
                  color="primary"
                  className="mt-4"
                  onClick={() => {
                    const qrCodeCanvas = document.querySelector(".qrcode canvas") as HTMLCanvasElement;
                    if (qrCodeCanvas) {
                      const link = document.createElement("a");
                      link.href = qrCodeCanvas.toDataURL("image/png");
                      link.download = `${data.slug}-qrcode.png`;
                      link.click();
                    }
                  }}
                />
              }
            </div>

            <div className="text-center w-full my-4">
              <Button label="Check-in" color="primary" className="w-full" onClick={() => router.push(`/dashboard/my-event/checkin/${data.slug}`)} />
            </div>
            <div className="text-center w-full my-4">
              <Button label="Penjualan" color="primary" className="w-full" onClick={() => router.push(`/dashboard/my-event/sell/${data.slug}`)} />
            </div>
          </div>

          <div className="w-full flex flex-col gap-4 text-dark px-4 md:px-6 lg:px-8">
            <Accordion className="border border-primary-light-200 rounded-lg shadow-sm py-0 pr-5">
              <AccordionItem
                title={
                  <div className=" flex flex-col md:flex-row justify-between items-start md:items-center px-4">
                    <div className="mb-3 md:mb-0">
                      <p className="text-grey">Total Pendapatan Event</p>
                      <h6>
                        Rp.
                        {(eventData?.total_pendapatan || 0).toLocaleString("id-ID")}
                      </h6>
                    </div>
                    <Button color="primary" label="Tarik Dana" startIcon={faMoneyBillTransfer} className="w-full md:w-auto" onClick={() => setIsModalOpen(true)} />
                  </div>
                }
              >
                <Stack p={20} pt={0} gap={10}>
                  <Divider />
                  <Text size="sm" fw={600} c="gray">
                    Riwayat Tarik Dana
                  </Text>
                  <WithdrawHistoryList user_id={user?.id ?? 0} setUpdate={updateWithdrawHistory} />
                </Stack>
              </AccordionItem>
            </Accordion>

            <Accordion selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} className="rounded-lg shadow-sm p-0" aria-label="Event Data Accordion">
              <AccordionItem key="1" title="Statistik Event" className="border border-primary-light-200 px-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 [&>div]:!relative [&_p:first-child]:w-full [&>div]:!overflow-hidden">
                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Total Penjualan Online</p>
                      <Icon icon="hugeicons:money-04" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">
                      Rp
                      {(eventData?.total_price_sell_online || 0).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Total Penjualan Offline</p>
                      <Icon icon="hugeicons:money-04" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">
                      Rp
                      {(eventData?.total_price_sell_offline || 0).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Total Transaksi</p>
                      <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">{eventData?.total_paid || 0}</p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Transaksi Gagal</p>
                      <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">{eventData?.total_ticket_failed || 0}</p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Transaksi Pending</p>
                      <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">{eventData?.total_ticket_pending || 0}</p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Ticket Terjual</p>
                      <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">{eventData?.total_ticket_sold || 0}</p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Total Withdraw</p>
                      <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">{eventData?.total_withdraw || 0}</p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Total View</p>
                      <Icon icon="tabler:users" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">{eventData?.total_views || 0}</p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Total Bookmarks</p>
                      <Icon icon="meteor-icons:bookmark" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">0</p>
                  </div>

                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                    <Flex align="center" gap={7}>
                      <p className="text-grey">Jenis Tiket</p>
                      <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                    </Flex>
                    <p className="font-semibold">{eventData?.total_ticket || 0}</p>
                  </div>
                </div>
              </AccordionItem>
            </Accordion>

            <div className="border border-primary-light-200 rounded-lg shadow-sm">
              <Tabs className="flex flex-col" variant="underlined" selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key.toString())}>
                <Tab key="Detail" title="Detail" className="px-2">
                  <Tabs
                    radius="full"
                    color="secondary"
                    classNames={{
                      tabList: "bg-transparent",
                      tab: "data-[selected=true]:text-primary",
                      cursor: "border border-primary-base",
                    }}
                  >
                    <Tab title="Deskripsi" className="px-2">
                      <div dangerouslySetInnerHTML={{ __html: data.description }}></div>
                    </Tab>
                    <Tab title="Syarat & Ketentuan" className="px-2">
                      <div
                        className="ml-5"
                        dangerouslySetInnerHTML={{
                          __html: data.term_condition,
                        }}
                      ></div>
                    </Tab>
                  </Tabs>
                </Tab>
                <Tab key="Tiket" title="Tiket">
                  <div className="flex justify-between items-center px-3 py-2">
                    <h6 className="text-lg font-semibold">Tiket</h6>
                    <ButtonM variant="light" leftSection={<Icon icon="uiw:plus" />} size="xs" onClick={() => { setEditTicketData(defaultForm); showAddTicket(true); }}>Tambah Tiket</ButtonM>
                  </div>
                  <div className="px-3">
                    {ticket.length > 0 &&
                      ticket.map((el, index) => (
                        <div key={index} className={`mb-3`}>
                          <TicketContainer
                            type={el.ticket_type}
                            category={el.ticket_category}
                            ticketDate={el.ticket_date}
                            ticketEnd={el.ticket_end}
                            price={el.price}
                            description={el.description}
                            name={el.name}
                            qty={el.qty}
                            sold={el.ticket_sold ?? el.sold_qty ?? 0}
                            isAdmin={true}
                            onEdit={() => onEditTicket(el, index)}
                          />
                        </div>
                      ))}
                  </div>
                </Tab>
                <Tab key="Transaksi" title="Transaksi" className="px-2">
                  <div className="bg-primary-light flex flex-col gap-2">
                    <div className="bg-white">
                      <div className="px-5 py-3">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
                          <Input type="text" placeholder="Search by Invoice or Email" value={filterValue} onChange={onSearchChange} />
                          <select 
                            onChange={onTransactionRowsPerPageChange} 
                            value={transactionRowsPerPage} 
                            className="border border-light-grey p-2 rounded-md w-full md:w-auto"
                          >
                            <option value={2}>2</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </select>
                        </div>

                        <div className="flex gap-4 mb-4 items-center">
                          <Button label="All" onClick={() => handleTransactionFilterChange("all")} color={transactionFilter === "all" ? "primary" : "secondary"} />
                          <Button label="Online" onClick={() => handleTransactionFilterChange("online")} color={transactionFilter === "online" ? "primary" : "secondary"} />
                          <Button label="Offline" onClick={() => handleTransactionFilterChange("offline")} color={transactionFilter === "offline" ? "primary" : "secondary"} />
                          <ButtonM className={`shrink-0`} leftSection={<Icon icon="uiw:download" className={`text-[20px]`} />} variant="transparent" color="#194e9e" onClick={handleDownloadTransaction}>
                            Download
                          </ButtonM>
                        </div>

                        {transactionLoading ? (
                          <div className="flex justify-center py-10">
                            <Spinner size="lg" />
                          </div>
                        ) : filteredTransactionItems.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-gray-500">No transactions found</p>
                          </div>
                        ) : (
                          <Table
                            aria-label="Transaction Table"
                            isHeaderSticky
                            bottomContentPlacement="outside"
                            classNames={{
                              wrapper: "max-h-[382px]",
                            }}
                            topContentPlacement="outside"
                            bottomContent={
                              transactionPagination.total > 0 ? (
                                <Pagination
                                  className="items-center"
                                  page={transactionPagination.current_page}
                                  total={transactionPagination.last_page}
                                  onChange={onTransactionPageChange}
                                  showControls
                                  showShadow
                                />
                              ) : null
                            }
                          >
                            <TableHeader>
                              <TableColumn className="font-bold text-sm">No</TableColumn>
                              <TableColumn className="font-bold text-sm">Email</TableColumn>
                              <TableColumn className="font-bold text-sm">No.Invoice</TableColumn>
                              <TableColumn className="font-bold text-sm">Waktu Dikirim</TableColumn>
                              <TableColumn className="font-bold text-sm">Status</TableColumn>
                              <TableColumn className="font-bold text-sm">Type</TableColumn>
                              <TableColumn className="font-bold text-sm">Aksi</TableColumn>
                            </TableHeader>
                            <TableBody 
                              items={filteredTransactionItems}
                              emptyContent="No transactions found"
                            >
                              {filteredTransactionItems.map((item: TransactionItem, index: number) => {
                                const userEmail = item?.has_user?.email;
                                const identityEmail = item?.identities?.[0]?.email;
                                const email = userEmail || identityEmail || "-";
                                
                                const itemNumber = (transactionPagination.current_page - 1) * transactionPagination.per_page + index + 1;
                                
                                return (
                                  <TableRow key={item.id}>
                                    <TableCell className="border-b-1 text-sm">
                                      {itemNumber}
                                    </TableCell>
                                    <TableCell className="border-b-1 text-sm">{email}</TableCell>
                                    <TableCell className="border-b-1 text-sm">{item.invoice_no}</TableCell>
                                    <TableCell className="border-b-1 text-sm">
                                      {item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }) : "-"}
                                    </TableCell>
                                    <TableCell className="border-b-1">
                                      <span className={`px-2 py-1 rounded-md text-white ${getStatusClass(item.transaction_status_id)}`}>
                                        {getStatusText(item.transaction_status_id)}
                                      </span>
                                    </TableCell>
                                    <TableCell className="border-b-1 text-sm">{item.type_transaction}</TableCell>
                                    <TableCell className="border-b-1 flex items-center">
                                      <Tooltip content="Kirim Ulang">
                                        <button
                                          disabled={sendingEmails[String(item.id)]}
                                          className="w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                          onClick={() => {
                                            if (email && email !== "-") {
                                              sendETicket(item.invoice_no, email, item.id);
                                            } else {
                                              notifications.show({
                                                title: "Error",
                                                message: "Email tidak tersedia untuk pengguna ini.",
                                                color: "red",
                                                position: "top-right",
                                              });
                                            }
                                          }}
                                        >
                                          {sendingEmails[String(item.id)] ? <Spinner size="sm" color="default" /> : <FontAwesomeIcon icon={faPaperPlane} className="text-white text-sm" />}
                                        </button>
                                      </Tooltip>
                                      <Tooltip content="Lihat Detail">
                                        <button className="ml-2 w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2" onClick={() => openDetailModal(item, ticket)}>
                                          <FontAwesomeIcon icon={faEye} className="text-white text-sm" />
                                        </button>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab key="Invitation" title="Invitation" className="px-2">
                  <div className="bg-primary-light flex flex-col gap-2">
                    <div className="bg-white">
                      <div className="px-5 py-3">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
                          <Input type="text" placeholder="Search by Invitation Title" value={invitationFilter} onChange={onEventSearchChange} />
                          <select onChange={onEventRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md w-full md:w-auto">
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </select>
                          <div className="flex gap-2">
                            <Tooltip content="Tambah Invitation Baru">
                              <button className="w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2" onClick={openAddModal}>
                                <FontAwesomeIcon icon={faPlus} className="text-white text-sm" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Kirim Semua Invitation">
                              <button
                                disabled={isSendingInvitation}
                                className="w-10 h-10 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={sendAllInvitations}
                              >
                                {isSendingInvitation ? <Spinner size="sm" color="white" /> : <FontAwesomeIcon icon={faPaperPlane} className="text-white text-sm" />}
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                        {loading ? (
                          <p>Loading...</p>
                        ) : (
                          <Table aria-label="Event Invitation Table" bottomContent={<Pagination className="items-center" page={page} total={eventPages} onChange={setPage} />}>
                            <TableHeader>
                              <TableColumn className="font-bold text-md">No</TableColumn>
                              <TableColumn className="font-bold text-md">Judul Undangan</TableColumn>
                              <TableColumn className="font-bold text-md">Type</TableColumn>
                              <TableColumn className="font-bold text-md">Qty</TableColumn>
                              <TableColumn className="font-bold text-md">Status</TableColumn>
                              <TableColumn className="font-bold text-md">Aksi</TableColumn>
                            </TableHeader>
                            <TableBody items={eventItems}>
                              {(item) => {
                                const emailCount = item?.event_invitation_detail?.filter((detail: any) => detail?.email)?.length || 0;

                                return (
                                  <TableRow key={item?.id}>
                                    <TableCell className="border-b-1">{(page - 1) * rowsPerPage + filteredEventItems.indexOf(item) + 1}</TableCell>
                                    <TableCell className="border-b-1">{item?.invitation_title}</TableCell>
                                    <TableCell className="border-b-1">{invitationCategory?.find((e) => e.id == item?.invitation_cat_id)?.name ?? "-"}</TableCell>
                                    <TableCell className="border-b-1">{item?.total_qty}</TableCell>
                                    <TableCell className="border-b-1">
                                      {(() => {
                                        const statusId = item?.event_invitation_status?.id ?? null;
                                        return <span className={`px-2 py-1 rounded-md text-white ${getInvitationStatusClass(statusId)}`}>{getStatusTextInvitation(statusId)}</span>;
                                      })()}
                                    </TableCell>
                                    <TableCell className="border-b-1 flex items-center gap-2">
                                      <Tooltip content="Kirim Invitation">
                                        <button
                                          disabled={sendingInvitations[String(item?.id)] || emailCount === 0}
                                          className="w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          onClick={() => sendInvitationEmail(item)}
                                        >
                                          {sendingInvitations[String(item?.id)] ? <Spinner size="sm" color="white" /> : <FontAwesomeIcon icon={faPaperPlane} className="text-white text-sm" />}
                                        </button>
                                      </Tooltip>
                                      <Tooltip content="Lihat Detail">
                                        <button className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2" onClick={() => openInvitationModal(item)}>
                                          <FontAwesomeIcon icon={faEye} className="text-white text-sm" />
                                        </button>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                );
                              }}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab key="Penjualan" title="Penjualan" className="px-2">
                  <div className="bg-primary-light flex flex-col gap-2">
                    <div className="bg-white">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-3 pb-3 border-b border-b-primary-light-200">
                        <h6>Ringkasan</h6>
                        <p onClick={downloadLaporan} className="text-primary-base font-semibold mt-2 md:mt-0 cursor-pointer">
                          <span>
                            <Tooltip content="download">
                              <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            </Tooltip>
                          </span>
                          Download Laporan
                        </p>
                      </div>
                      <div className="flex flex-col mx-3 gap-3 border-b py-3 border-b-primary-light-200">
                        <div className="flex items-center justify-between">
                          <p className="text-dark-grey">Total Penjualan Tiket Online</p>
                          <p className="font-semibold">
                            Rp
                            {(eventData?.total_price_sell || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-dark-grey">Total Promo</p>
                          <p className="font-semibold">{`(-) Rp0`}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-dark-grey">Biaya Layanan Penjualan Tiket Online</p>
                          <p className="font-semibold">
                            Rp
                            {(eventData?.total_admin_fee || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between px-3 py-4">
                        <p className="text-primary">Total</p>
                        <p className="font-semibold">
                          Rp
                          {((eventData?.total_price_sell || 0) - (eventData?.total_admin_fee || 0)).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <DetailModal item={selectedItem} isOpen={isDetailModalOpen} onClose={closeDetailModal} />
      <AddEventModal eventData={data} isOpen={isAddModalOpen} onClose={closeAddModal} eventId={data.id} />
      <EditEventModal item={selectedEvent} isOpen={isEditModalOpen} onClose={closeEditModal} />
      <TarikDanaModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSubmit={() => {
          setUpdateWithdrawHistory(updateWithdrawHistory + 1);
          getWithdrawHistory();
        }}
        eventSlug={params.slug}
      />
      <InvitationDetailModal invitation={selectedInvitation} isOpen={isInvitationModalOpen} onClose={closeInvitationModal} />
      <Context.Provider value={{ seatmapData: seatmap, setSeatmapData: setSeatmap, ticket, eventData: data, seatmapOpen, setSeatmapOpen, setTicket }}>
        <ModalCreateTicket onSuccess={getData} isOpen={addTicket} setIsOpen={showAddTicket} ticket={ticket} setTicket={setTicket} startDate={data.start_date} data={editTicketData} setIdx={setIdxTicket} idx={idxTicket} eventId={data.id} endDate={data.end_date} isAdmin={true} />
        <ModalEditTicket onSuccess={getData} isOpen={isEditTicketModalOpen} setIsOpen={setIsEditTicketModalOpen} ticket={ticket} setTicket={setTicket} startDate={data.start_date} data={editTicketData} setIdx={setIdxTicket} idx={idxTicket} eventId={data.id} endDate={data.end_date} isAdmin={true} />
      </Context.Provider>
    </>
  ) : (
    <Box w="100%" mih={300} h={300}>
      <Center h="100%">
        <Spinner />
      </Center>
    </Box>
  );
};

export default AdminEventDetailView;
