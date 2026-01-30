import React, { useState, useMemo, useCallback, useEffect, createContext } from "react";
import EventCardCreator from "@/components/Card/EventCard/creator";
import config from "@/Config";
import { useRouter } from "next/router";
import axios from "axios";
import DetailModal from "@/components/Dashboard/Modal/ModalInvation";
import EditEventModal from "@/components/Dashboard/Modal/ModalEditInvation";
import AddEventModal, { CategoryResponse } from "@/components/Dashboard/Modal/ModalAddInvation";
import InvitationDetailModal from "@/components/Dashboard/Modal/ModalDetailInvation";
import { Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Pagination, Accordion, AccordionItem, Selection } from "@nextui-org/react";
import { EventProps } from "@/utils/globalInterface";
import { EventTicket, SeatmapData } from "@/utils/formInterface";
import { Tabs, Tab } from "@nextui-org/react";
import { Get } from "@/utils/REST";
import Button from "@/components/Button";
import TicketContainer from "@/components/TicketContainer";
import ModalCreateTicket from "@/components/EventCreator/Modal/ModalCreateTicket";
import ModalEditTicket from "@/components/EventCreator/Modal/ModalEditTicket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPaperPlane, faPlus } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import TarikDanaModal from "@/components/Dashboard/Modal/Withdraw";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Divider, Flex, Stack, Text, Tooltip, Button as ButtonM, Box, Center } from "@mantine/core";
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
  has_user?: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    otp_code: string | null;
    otp_expiry_time: string | null;
    created_at: string;
    updated_at: string;
    verified_status_id: number | null;
    is_creator: number;
  };
}

interface InvitationDataItem {
  id: string | number;
  invoice_no: string;
  has_user?: {
    email: string;
  };
  event_invitation_status?: {
    id: number;
  };
  invitation_title?: string;
  invitation_cat_id?: number;
  total_qty?: number;
  created_at?: string;
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
}>({
  seatmapData: [],
  ticket: [],
});

const MyEventDetail = () => {
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

  // Fetch transactions with pagination - FIXED VERSION
  const fetchTransactions = useCallback(async (pageNumber: number = 1, searchValue: string = filterValue) => {
    if (!data?.id) {
      console.log("No event ID, skipping fetch");
      return;
    }

    try {
      setTransactionLoading(true);
      console.log("Fetching transactions for event_id:", data.id);
      console.log("Page:", pageNumber);
      console.log("Filter:", transactionFilter);
      console.log("Search value:", searchValue);
      
      const params = new URLSearchParams({
        event_id: data.id.toString(),
        page: pageNumber.toString(),
        limit: transactionRowsPerPage.toString(),
      });

      if (searchValue) {
        params.append('search', searchValue);
      }

      if (transactionFilter !== 'all') {
        params.append('type', transactionFilter);
      }

      const url = `list-transaction-by-event?${params.toString()}`;
      console.log("Fetch URL:", `${config.wsUrl}${url}`);

      const response = await axios.get(`${config.wsUrl}${url}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data as TransactionResponse;
      console.log("API Response:", result);
      console.log("Response data:", result?.data);
      console.log("Response pagination:", result?.pagination);
      
      if (result?.data && Array.isArray(result.data)) {
        // Map data ke format yang sesuai dengan interface
        const mappedData: TransactionItem[] = result.data.map((item: any) => ({
          id: item.id,
          invoice_no: item.invoice_no,
          type_transaction: item.type_transaction,
          created_at: item.created_at,
          transaction_status_id: item.transaction_status_id,
          has_user: item.has_user,
          identities: item.identities
        }));
        
        setTransactionData(mappedData);
        setGrandTotal(result.grand_total || 0);
        setTransactionPagination(result.pagination || {
          current_page: pageNumber,
          last_page: 1,
          total: 0,
          per_page: transactionRowsPerPage,
        });
        setTransactionPage(pageNumber);
        console.log(`Loaded ${mappedData.length} transactions for page ${pageNumber}`);
      } else {
        console.warn("No data or invalid data format");
        setTransactionData([]);
        setGrandTotal(0);
        setTransactionPagination({
          current_page: pageNumber,
          last_page: 1,
          total: 0,
          per_page: transactionRowsPerPage,
        });
      }
    } catch (error) {
      console.error("Error fetching transaction data:", error);
      setTransactionData([]);
      setGrandTotal(0);
      setTransactionPagination({
        current_page: pageNumber,
        last_page: 1,
        total: 0,
        per_page: transactionRowsPerPage,
      });
    } finally {
      setTransactionLoading(false);
    }
  }, [data?.id, transactionFilter, transactionRowsPerPage, filterValue]);

  useEffect(() => {
    if (activeTab === "Transaksi" && data?.id) {
      console.log("Fetching transactions for tab Transaksi");
      fetchTransactions(1, filterValue);
    }
  }, [activeTab, data?.id, transactionFilter]);

  // Filter items locally for immediate response while waiting for server
  const filteredTransactionItems = useMemo(() => {
    if (!Array.isArray(transactionData)) {
      console.log("transactionData is not array:", transactionData);
      return [];
    }

    const lowerFilterValue = filterValue.toLowerCase();

    const filtered = transactionData.filter((item) => {
      const matchesInvoice = item.invoice_no?.toLowerCase().includes(lowerFilterValue) || false;
      
      // Cek email dari has_user atau identities
      const userEmail = item.has_user?.email?.toLowerCase() || "";
      const identityEmail = item.identities?.[0]?.email?.toLowerCase() || "";
      const matchesEmail = userEmail.includes(lowerFilterValue) || identityEmail.includes(lowerFilterValue);

      return matchesInvoice || matchesEmail;
    });

    console.log("Filtered items result:", filtered.length, "items");
    return filtered;
  }, [transactionData, filterValue]);

  const onTransactionRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = Number(e.target.value);
    setTransactionRowsPerPage(newRowsPerPage);
    // Reset ke page 1 saat mengubah rows per page
    fetchTransactions(1, filterValue);
  }, [fetchTransactions, filterValue]);

  const onTransactionPageChange = useCallback((page: number) => {
    console.log("Changing to page:", page);
    fetchTransactions(page, filterValue);
  }, [fetchTransactions, filterValue]);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    // Reset ke page 1 saat search
    fetchTransactions(1, value);
  }, [fetchTransactions]);

  const handleTransactionFilterChange = useCallback((filter: "all" | "online" | "offline") => {
    setTransactionFilter(filter);
    // Reset ke page 1 saat mengganti filter
    fetchTransactions(1, filterValue);
  }, [fetchTransactions, filterValue]);

  const sendInvitationEmail = useCallback(
    async (invitationItem: any) => {
      const invitationIdStr = String(invitationItem?.id);

      setSendingInvitations((prev) => ({
        ...prev,
        [invitationIdStr]: true,
      }));

      try {
        const payload = {
          event_id: data?.id,
          invitation_title: invitationItem?.invitation_title || "Undangan Event",
          invitation_description: invitationItem?.invitation_description || "",
          total_qty: invitationItem?.total_qty || 0,
          details:
            invitationItem?.event_invitation_detail?.map((detail: any) => ({
              fullname: detail?.fullname || "",
              email: detail?.email || "",
              phone: detail?.phone || "",
            })) || [],
          is_one_receiver: invitationItem?.is_one_receiver === 1,
          is_banner_image: invitationItem?.is_banner_event === 1,
          invitation_cat_id: invitationItem?.invitation_cat_id || 17,
        };

        console.log("📤 Sending invitation payload:", payload);

        await fetch({
          url: "invitations",
          method: "POST",
          data: payload,
          success: (res) => {
            console.log("✅ Invitation response:", res);

            const isSuccess = res.success === true || res.success === "true" || res.message?.includes("success") || res.message?.includes("berhasil") || res.id !== undefined || res.data?.id !== undefined;

            if (isSuccess) {
              notifications.show({
                title: "Berhasil!",
                message: `Invitation berhasil dikirim ke ${payload.details.length} penerima`,
                color: "green",
                position: "top-right",
              });

              setTimeout(() => {
                getInvitationEventData(data?.id || 0);
              }, 1000);
            } else {
              throw new Error("Tunggu beberapa menit dan coba refresh page.");
            }
          },
          error: (error) => {
            console.error("❌ Error in fetch:", error);
            throw error;
          },
        });
      } catch (error: any) {
        console.error("❌ Error sending invitation:", error);

        let errorMessage = "Gagal mengirim invitation. Silakan coba lagi.";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        notifications.show({
          title: "Gagal!",
          message: errorMessage,
          color: "red",
          position: "top-right",
        });
      } finally {
        setSendingInvitations((prev) => ({
          ...prev,
          [invitationIdStr]: false,
        }));
      }
    },
    [data?.id],
  );

  const sendAllInvitations = async () => {
    if (!data?.id || !Array.isArray(invitation) || invitation.length === 0) {
      notifications.show({
        title: "Peringatan",
        message: "Tidak ada invitation yang bisa dikirim",
        color: "yellow",
        position: "top-right",
      });
      return;
    }

    setIsSendingInvitation(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const invitationItem of invitation) {
        if (!invitationItem?.id || !invitationItem?.event_invitation_detail) continue;

        try {
          const payload = {
            event_id: data.id,
            invitation_title: invitationItem.invitation_title || `Invitation ${invitationItem.id}`,
            invitation_description: invitationItem.invitation_description || "",
            total_qty: invitationItem.total_qty || 0,
            details: invitationItem.event_invitation_detail
              .map((detail: any) => ({
                fullname: detail?.fullname || "",
                email: detail?.email || "",
                phone: detail?.phone || "",
              }))
              .filter((detail: any) => detail.email),
            is_one_receiver: invitationItem.is_one_receiver === 1,
            is_banner_image: invitationItem.is_banner_event === 1,
            invitation_cat_id: invitationItem.invitation_cat_id || 17,
          };

          if (payload.details.length === 0) {
            console.warn(`No email found for invitation ${invitationItem.id}`);
            continue;
          }

          await fetch({
            url: "invitations",
            method: "POST",
            data: payload,
          });

          successCount++;

          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error sending invitation ${invitationItem.id}:`, error);
          errorCount++;
        }
      }

      notifications.show({
        title: "Selesai!",
        message: `Berhasil mengirim ${successCount} invitation. Gagal: ${errorCount}`,
        color: successCount > 0 ? "green" : "red",
        position: "top-right",
      });

      getInvitationEventData(data.id);
    } catch (error) {
      console.error("Error in sendAllInvitations:", error);
      notifications.show({
        title: "Error",
        message: "Terjadi kesalahan saat mengirim invitation",
        color: "red",
        position: "top-right",
      });
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
      error: () => {},
    });
  };

  const getWithdrawHistory = async () => {
    try {
      const response = await axios.get(`${config.wsUrl}withdraw`);
      const withdrawData = Array.isArray(response.data) ? response.data : response.data.data || [];

      const filteredData = withdrawData.filter((item: WithdrawHistory) => item.event_id === data?.id);
      setWithdrawHistoryList(filteredData);
    } catch (error) {
      console.error("Error fetching withdraw data:", error);
    }
  };

  useEffect(() => {
    (window as any).getWithdrawHistory = getWithdrawHistory;
  }, [withdrawHistoryList]);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (item: React.SetStateAction<null>) => {
    setSelectedEvent(item);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  const openDetailModal = (item: any, ticket: any) => {
    setSelectedItem(item);
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
    setSelectedTicket(null);
  };

  const openInvitationModal = (item: any) => {
    setSelectedInvitation(item);
    setIsInvitationModalOpen(true);
  };

  const closeInvitationModal = () => {
    setIsInvitationModalOpen(false);
    setSelectedInvitation(null);
  };

  const getData = () => {
    setLoading(true);
    Get(`event/${slug}`, {})
      .then((res: any) => {
        if (res.data) {
          setData(res.data);
          res?.data?.seatmap && setSeatmap.setState(JSON.parse(res?.data?.seatmap));
          const eventId = res.data.id;
          setTicket(res.data.has_event_ticket);
          getReportData(eventId);
          getInvitationEventData(eventId);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  };

  const getReportData = async (id: string | number) => {
    try {
      const response = await axios.get(`${config.wsUrl}event/show-report/${id}`);
      const result = response.data;

      if (Array.isArray(result.data)) {
        setInvitationData(result.data);
      } else {
        setInvitationData([]);
      }
    } catch (err) {
      console.error("Error fetching invitation data:", err);
    }
  };

  const sendETicket = useCallback(
    async (invoiceNo: string, email: string, itemId: string | number) => {
      const itemIdStr = String(itemId);

      setSendingEmails((prev) => ({
        ...prev,
        [itemIdStr]: true,
      }));

      try {
        const response = await axios.get(`${config.wsUrl}transaction/send/eticket/${invoiceNo}`, {
          params: { email },
          headers: {
            "X-Email-Type": "transaction",
            "X-Event-Id": data?.id,
          },
        });

        notifications.show({
          title: "Berhasil!",
          message: `E-ticket berhasil dikirim ke ${email}`,
          color: "green",
          position: "top-right",
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Gagal mengirim e-ticket. Silakan coba lagi.";
        notifications.show({
          title: "Gagal!",
          message: errorMessage,
          color: "red",
          position: "top-right",
        });
      } finally {
        setTimeout(() => {
          setSendingEmails((prev) => ({
            ...prev,
            [itemIdStr]: false,
          }));
        }, 300);
      }
    },
    [data?.id],
  );

  const handleDownloadTransaction = async () => {
    const params = new URLSearchParams({
      event_id: data?.id?.toString() || '',
      download: 'true'
    });
    
    window.open(`${config.wsUrl}list-transaction-by-event?${params.toString()}`);
  };

  const sendEventETicket = async (invoiceNo: any, email: any) => {
    try {
      const response = await axios.get(`${config.wsUrl}transaction/send/eticket/${invoiceNo}`, {
        params: {
          email: email,
        },
      });
      toast.success(`E-ticket sent successfully to ${email}`);
    } catch (error) {
      console.error("Error sending e-ticket:", error);
      toast.error("Failed to send e-ticket.");
    }
  };

  useEffect(() => {
    if (slug) {
      getData();
      getInvitationCategory();
    }
  }, [slug]);

  useEffect(() => {
    if (data?.id && user?.id) {
      getWithdrawHistory();
    }
  }, [data?.id, user?.id, updateWithdrawHistory]);

  const getStatusClass = (statusId: any) => {
    switch (statusId) {
      case 1:
        return "bg-warning";
      case 2:
        return "bg-success";
      case 3:
        return "bg-danger";
      case 4:
        return "bg-secondary";
      default:
        return "";
    }
  };

  const getStatusText = (statusId: any) => {
    switch (statusId) {
      case 1:
        return "Pending";
      case 2:
        return "Verified";
      case 3:
        return "Failed";
      case 4:
        return "Expired";
      default:
        return "Unknown";
    }
  };

  const getStatusTextInvitation = (statusId: any) => {
    switch (statusId) {
      case 0:
        return "Cancel";
      case 1:
        return "Success";
      default:
        return "Unknown";
    }
  };

  const getInvitationStatusClass = (statusId: any) => {
    switch (statusId) {
      case 0:
        return "bg-danger";
      case 1:
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  const getInvitationEventData = async (id: string | number) => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.wsUrl}invitations/event/${id}`, {
        params: {
          with_details: true,
        },
      });

      const invitationData = Array.isArray(response.data) ? response.data : response.data.data || [];

      setInvitation(invitationData);
    } catch (err) {
      console.error("Error fetching event invitation data:", err);
      setInvitation([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEventItems = useMemo(() => {
    if (!Array.isArray(invitation)) {
      return [];
    }

    return invitation.filter((item) => item.invitation_title?.toLowerCase().includes(invitationFilter.toLowerCase()));
  }, [invitation, invitationFilter]);

  const eventPages = Math.ceil(filteredEventItems.length / rowsPerPage);

  const eventItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredEventItems.slice(start, end);
  }, [page, filteredEventItems, rowsPerPage]);

  const onEventSearchChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
    setInvitationFilter(e.target.value);
    setPage(1);
  }, []);

  const onEventRowsPerPageChange = useCallback((e: { target: { value: any } }) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const getEventData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.wsUrl}event-view-list-by-slug/${slug}`);
      if (response && response.data) {
        setEventData(response.data);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof slug === "string") {
      getEventData();
    }
  }, [slug]);

  const onEditTicket = (data: EventTicket, idx: number) => {
    setIdxTicket(idx);
    setEditTicketData(data);
    setIsEditTicketModalOpen(true);
  };

  const downloadLaporan = () => {
    if (!eventData) return;

    const dataLaporan = [
      ["Ringkasan Penjualan Tiket"],
      ["Total View", eventData?.total_views || 0],
      ["Total Bookmarks", 0],
      ["Total Tiket Terjual", eventData?.total_paid || 0],
      ["Total Penjualan", `Rp${eventData?.total_price_sell ? eventData.total_price_sell.toLocaleString("id-ID") : 0}`],
      ["Total Admin Fee", `Rp${eventData?.total_admin_fee ? eventData.total_admin_fee.toLocaleString("id-ID") : 0}`],
      ["Total Tiket", eventData?.total_ticket || 0],
      ["Total Pembelian", eventData?.total_buy || 0],
      ["Total Online", eventData?.total_online || 0],
      ["Total Offline", eventData?.total_offline || 0],
      ["Total Pembayaran Belum Lunas", eventData?.total_unpaid || 0],
      ["Total Penjualan Online", `Rp${eventData?.total_price_sell_online ? eventData.total_price_sell_online.toLocaleString("id-ID") : 0}`],
      ["Total Penjualan Offline", `Rp${eventData?.total_price_sell_offline ? eventData.total_price_sell_offline.toLocaleString("id-ID") : 0}`],
      ["Grand Total", `Rp${eventData?.total_price_sell && eventData?.total_admin_fee ? (eventData.total_price_sell - eventData.total_admin_fee).toLocaleString("id-ID") : 0}`],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataLaporan);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
    XLSX.writeFile(workbook, `Laporan_Penjualan_Event_${eventData.event_name}.xlsx`);
  };

  return !loading && data ? (
    <>
      <div>
        <Breadcrumbs className="mb-5 p-5">
          <BreadcrumbItem onPress={() => router.push("/dashboard/my-event")}>Event Saya</BreadcrumbItem>
          <BreadcrumbItem>Detail Event</BreadcrumbItem>
        </Breadcrumbs>
        <div className="p-5 flex flex-col md:flex-row lg:flex gap-2">
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
              shareLink={window.location.origin + "/event/" + data.slug}
            />

            <div className="flex flex-col items-center justify-center p-4 max-w-full min-w-full lg:min-w-60 w-full bg-white rounded-xl shadow-md mx-1 md:mx-0 border border-primary-light-200 mt-4">
              <h5 className="text-lg font-semibold mb-2">Share your event link</h5>
              <QrCode slug={`${window.location.origin}/event/${data.slug}`} errorCorrectionLevel="H" margin={8} logoSizeRatio={0.22} />
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
                    <Button color="primary" label="Tarik Dana" className="w-full md:w-auto" onClick={() => setIsModalOpen(true)} />
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
        
        // Hitung nomor urut berdasarkan page dan index di page
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
              <Tooltip label="Kirim Ulang">
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
              <Tooltip label="Lihat Detail">
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
                            <Tooltip label="Tambah Invitation Baru">
                              <button className="w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2" onClick={openAddModal}>
                                <FontAwesomeIcon icon={faPlus} className="text-white text-sm" />
                              </button>
                            </Tooltip>
                            <Tooltip label="Kirim Semua Invitation">
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
                                      <Tooltip label="Kirim Invitation">
                                        <button
                                          disabled={sendingInvitations[String(item?.id)] || emailCount === 0}
                                          className="w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          onClick={() => sendInvitationEmail(item)}
                                        >
                                          {sendingInvitations[String(item?.id)] ? <Spinner size="sm" color="white" /> : <FontAwesomeIcon icon={faPaperPlane} className="text-white text-sm" />}
                                        </button>
                                      </Tooltip>
                                      <Tooltip label="Lihat Detail">
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
                            <Tooltip label="download">
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
      <Context.Provider value={{ seatmapData: seatmap, setSeatmapData: setSeatmap, ticket }}>
        <ModalCreateTicket isOpen={addTicket} setIsOpen={showAddTicket} ticket={ticket} setTicket={setTicket} data={editTicketData} setIdx={setIdxTicket} idx={idxTicket} eventId={data.id} endDate={data.end_date} />
        <ModalEditTicket isOpen={isEditTicketModalOpen} setIsOpen={setIsEditTicketModalOpen} ticket={ticket} setTicket={setTicket} data={editTicketData} setIdx={setIdxTicket} idx={idxTicket} eventId={data.id} endDate={data.end_date} />
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

export default MyEventDetail;

// import React, { useState, useMemo, useCallback, useEffect, createContext, useRef } from "react";
// import EventCardCreator from "@/components/Card/EventCard/creator";
// import { useAsyncList } from "@react-stately/data";
// import config from "@/Config";
// import { useRouter } from "next/router";
// import axios from "axios";
// import DetailModal from "@/components/Dashboard/Modal/ModalInvation";
// import EditEventModal from "@/components/Dashboard/Modal/ModalEditInvation";
// import AddEventModal, { CategoryResponse } from "@/components/Dashboard/Modal/ModalAddInvation";
// import InvitationDetailModal from "@/components/Dashboard/Modal/ModalDetailInvation";
// import { Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Pagination, Accordion, AccordionItem, Selection, Modal } from "@nextui-org/react";
// import { EventProps } from "@/utils/globalInterface";
// import { EventTicket, SeatmapData } from "@/utils/formInterface";
// import { Tabs, Tab } from "@nextui-org/react";
// import { Get } from "@/utils/REST";
// import Button from "@/components/Button";
// import TicketContainer from "@/components/TicketContainer";
// import ModalCreateTicket from "@/components/EventCreator/Modal/ModalCreateTicket";
// import ModalEditTicket from "@/components/EventCreator/Modal/ModalEditTicket";
// import DescriptionBlock from "@/components/Detail/DescriptionBlock";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faDownload, faEye, faPaperPlane, faPencil, faPlus } from "@fortawesome/free-solid-svg-icons";
// import * as XLSX from "xlsx";
// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Legend } from "chart.js";
// import TarikDanaModal from "@/components/Dashboard/Modal/Withdraw";
// import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
// import { toast } from "react-toastify";
// import { get } from "http";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { ActionIcon, Card, Divider, Flex, NumberFormatter, Stack, Text, Tooltip, Button as ButtonM, Box, Center } from "@mantine/core";
// import WithdrawHistoryList from "@/components/MyEvent/WithdrawHistoryList";
// import useLoggedUser from "@/utils/useLoggedUser";
// import fetch from "@/utils/fetch";
// import { notifications } from "@mantine/notifications";
// import _ from "lodash";
// import { useListState, UseListStateHandlers } from "@mantine/hooks";
// import QrCode from "@/components/QrCode";
// import { useParams } from "next/navigation";

// interface EventData {
//   creator_id: string;
//   event_name: string;
//   slug: string;
//   total_admin_fee: number;
//   total_buy: number;
//   total_offline: number;
//   total_online: number;
//   total_paid: number;
//   total_price_sell: number;
//   total_price_sell_offline: number;
//   total_price_sell_online: number;
//   total_ticket: number;
//   total_unpaid: number;
//   total_views: number;
//   total_withdraw: number;
//   total_ticket_failed: number;
//   total_ticket_pending: number;
//   total_ticket_sold: number;
//   total_pendapatan: number;
// }

// interface WithdrawHistory {
//   id: number;
//   event_id: number | null;
//   product_id: number | null;
//   user_id: number;
//   user_bank_id: string;
//   user_approval: string | null;
//   invoice_no: string;
//   amount: number;
//   name: string;
//   bank_account: number;
//   status: "Pending" | "Success" | "Failed" | "Rejected";
//   created_by: string | null;
//   updated_by: string | null;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
//   transaction_status_id: number | null;
//   has_user?: {
//     id: number;
//     name: string;
//     email: string;
//     email_verified_at: string | null;
//     otp_code: string | null;
//     otp_expiry_time: string | null;
//     created_at: string;
//     updated_at: string;
//     verified_status_id: number | null;
//     is_creator: number;
//   };
// }

// interface InvitationDataItem {
//   id: string | number;
//   invoice_no: string;
//   has_user?: {
//     email: string;
//   };
//   event_invitation_status?: {
//     id: number;
//   };
//   invitation_title?: string;
//   invitation_cat_id?: number;
//   total_qty?: number;
//   created_at?: string;
//   has_detail_invitation?: Array<{
//     email: string;
//     fullname: string;
//     phone: string;
//   }>;
// }

// interface DetailInvitation {
//   id: number;
//   event_invitation_id: number;
//   invitation_number: string;
//   identity_no: string | null;
//   fullname: string;
//   email: string;
//   phone: string;
//   recived_status: number;
//   attendance_status: number;
//   is_checkin: number;
//   checkin_date: string;
//   is_checkout: number;
//   checkout_date: string | null;
//   scan_checkin_by: string | null;
//   scan_checkout_by: string | null;
//   created_by: string;
//   updated_by: string | null;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
// }

// interface InvitationResponse {
//   id: number;
//   event_id: number;
//   is_banner_event: number;
//   is_one_receiver: number;
//   invitation_cat_id: number;
//   invitation_title: string;
//   invitation_description: string;
//   total_qty: number;
//   invitation_status: number;
//   created_by: string;
//   updated_by: string | null;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
//   image: string | null;
//   total_eticket: number;
//   has_detail_invitation: DetailInvitation[];
// }

// export const Context = createContext<{
//   seatmapData?: SeatmapData[];
//   setSeatmapData?: UseListStateHandlers<SeatmapData>;
//   ticket?: EventTicket[];
// }>({
//   seatmapData: [],
//   ticket: [],
// });

// const MyEventDetail = () => {
//   const defaultForm: EventTicket = {
//     ticket_type: "",
//     ticket_category_id: 1,
//     ticket_category: "Festival",
//     name: "",
//     ticket_date: null,
//     ticket_end: null,
//     event_schedule_date: null,
//     qty: 0,
//     price: 0,
//     description: "",
//   };
//   const router = useRouter();
//   const user = useLoggedUser();
//   const { slug } = router.query;
//   const [data, setData] = useState<EventProps>();
//   const [ticket, setTicket] = useState<EventTicket[]>([]);
//   const [editTicketData, setEditTicketData] = useState<EventTicket>(defaultForm);
//   const [isEditTicketModalOpen, setIsEditTicketModalOpen] = useState<boolean>(false);
//   const [addTicket, showAddTicket] = useState<boolean>(false);
//   const [idxTicket, setIdxTicket] = useState<number>();
//   const [loading, setLoading] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [grandTotal, setGrandTotal] = useState(0);
//   const [eventData, setEventData] = useState<EventData | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//   const [filterValue, setFilterValue] = useState("");
//   const [page, setPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [transactionFilter, setTransactionFilter] = useState<"all" | "online" | "offline">("all");
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [selectedInvitation, setSelectedInvitation] = useState<InvitationResponse | null>(null);
//   const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
//   const [invitationData, setInvitationData] = useState<any[]>([]);
//   const [invitation, setInvitation] = useState<InvitationResponse[]>([]);
//   const [invitationFilter, setInvitationFilter] = useState("");
//   const [updateWithdrawHistory, setUpdateWithdrawHistory] = useState(1);
//   const [seatmap, setSeatmap] = useListState<SeatmapData>([]);
//   const [invitationCategory, setInvitationCategory] = useState<CategoryResponse[]>();
//   const [transactionList, setTransactionList] = useState<any[]>([]);
//   const [withdrawHistoryList, setWithdrawHistoryList] = useState<WithdrawHistory[]>([]);
//   const [totalWithdrawn, setTotalWithdrawn] = useState(0);
//   const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});
//   const [lastSentTime, setLastSentTime] = useState<number>(0);
//   const [isSendingInvitation, setIsSendingInvitation] = useState(false);
//   const params = useParams();
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [selectedItemForSend, setSelectedItemForSend] = useState<InvitationResponse | null>(null);
//   const [modalType, setModalType] = useState<'transaction' | 'invitation'>('transaction');

//   const remainingBalance = (eventData?.total_price_sell || 0) - withdrawHistoryList.reduce((sum, item) => sum + item.amount, 0);

//   const getInvitationCategory = async () => {
//     await fetch<any, CategoryResponse[]>({
//       url: "invitation-category",
//       method: "GET",
//       data: {},
//       success: ({ data }) => data && setInvitationCategory(data),
//       error: () => {},
//     });
//   };

//   const getWithdrawHistory = async () => {
//     try {
//       const response = await axios.get(`${config.wsUrl}withdraw`);
//       const withdrawData = Array.isArray(response.data) ? response.data : response.data.data || [];

//       // Filter berdasarkan event_id
//       const filteredData = withdrawData.filter((item: WithdrawHistory) => item.event_id === data?.id);

//       setWithdrawHistoryList(filteredData);
//       console.log("Filtered Withdraw Data for event:", filteredData);
//     } catch (error) {
//       console.error("Error fetching withdraw data:", error);
//     }
//   };

//   useEffect(() => {
//     (window as any).getWithdrawHistory = getWithdrawHistory;
//     (window as any).withdrawList = withdrawHistoryList;
//   }, [withdrawHistoryList]);

//   const openAddModal = () => {
//     setIsAddModalOpen(true);
//   };

//   const closeAddModal = () => {
//     setIsAddModalOpen(false);
//   };

//   const openEditModal = (item: React.SetStateAction<null>) => {
//     setSelectedEvent(item);
//     setIsEditModalOpen(true);
//   };

//   const closeEditModal = () => {
//     setIsEditModalOpen(false);
//     setSelectedEvent(null);
//   };

//   const openDetailModal = (item: any, ticket: any) => {
//     setSelectedItem(item);
//     setSelectedTicket(ticket);
//     setIsDetailModalOpen(true);
//   };

//   const closeDetailModal = () => {
//     setIsDetailModalOpen(false);
//     setSelectedItem(null);
//     setSelectedTicket(null);
//   };

//   const openInvitationModal = (item: InvitationResponse) => {
//     setSelectedInvitation(item);
//     setIsInvitationModalOpen(true);
//   };

//   const closeInvitationModal = () => {
//     setIsInvitationModalOpen(false);
//     setSelectedInvitation(null);
//   };

//   const getData = () => {
//     setLoading(true);
//     Get(`event/${slug}`, {})
//       .then((res: any) => {
//         if (res.data) {
//           setData(res.data);
//           res?.data?.seatmap && setSeatmap.setState(JSON.parse(res?.data?.seatmap));
//           console.log("masuk", res);
//           const eventId = res.data.id;
//           setTicket(res.data.has_event_ticket);
//           getReportData(eventId);
//           getInvitationEventData(eventId);
//           getTransactions();
//         } else {
//           console.warn("Response data is empty or undefined.");
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching data:", err);
//         setLoading(false);
//       });
//   };

//   const getReportData = async (id: string | number) => {
//     try {
//       const response = await axios.get(`${config.wsUrl}event/show-report/${id}`);
//       const result = response.data;

//       if (Array.isArray(result.data)) {
//         setInvitationData(result.data);
//       } else {
//         console.warn("Fetched data is not an array:", result);
//         setInvitationData([]);
//       }
//     } catch (err) {
//       console.error("Error fetching invitation data:", err);
//     }
//   };

//   const getTransactions = async () => {
//     try {
//       const response = await axios.get(`${config.wsUrl}transaction`);
//       const payload = Array.isArray(response.data) ? response.data : (response.data.data ?? []);

//       setTransactionList(payload);
//     } catch (err) {
//       console.error("Error fetching transactions", err);
//       setTransactionList([]);
//     }
//   };

//   const findTransactionStatus = (invoice: string) => {
//     const trx = transactionList.find((t) => t.invoice_no === invoice);
//     return trx?.transaction_status_id ?? null;
//   };

//   const sendETicket = async (invoiceNo: string, email: string, itemId: string | number) => {
//     const itemIdStr = String(itemId);

//     setSendingEmails((prev) => ({
//       ...prev,
//       [itemIdStr]: true,
//     }));

//     try {
//       const response = await axios.get(`${config.wsUrl}transaction/send/eticket/${invoiceNo}`, {
//         params: { email },
//         headers: {
//           "X-Email-Type": "transaction",
//           "X-Event-Id": data?.id,
//         },
//       });

//       console.log("E-ticket sent successfully:", response.data);

//       notifications.show({
//         title: "Berhasil!",
//         message: `E-ticket berhasil dikirim ke ${email}`,
//         color: "green",
//         position: "top-right",
//       });
//     } catch (error: any) {
//       console.error("Error sending e-ticket:", error);

//       const errorMessage = error.response?.data?.message || "Gagal mengirim e-ticket. Silakan coba lagi.";
//       notifications.show({
//         title: "Gagal!",
//         message: errorMessage,
//         color: "red",
//         position: "top-right",
//       });
//     } finally {
//       setTimeout(() => {
//         setSendingEmails((prev) => ({
//           ...prev,
//           [itemIdStr]: false,
//         }));
//       }, 300);
//     }
//   };

//   const handleDownloadTransaction = async () => {
//     window.open(`${config.wsUrl}list-transaction-by-event?event_id=${data?.id}&download=true`);
//   };

//   // Fungsi untuk mengirim invitation via email menggunakan API
//   const sendInvitationEmail = async (invitationId: number, emails: string[]) => {
//     try {
//       setIsSendingInvitation(true);

//       // Kirim request ke API untuk mengirim invitation
//       const response = await axios.post(`${config.wsUrl}invitation/send-email`, {
//         invitation_id: invitationId,
//         emails: emails,
//         event_id: data?.id,
//         event_name: data?.name,
//         event_slug: data?.slug
//       });

//       if (response.data.success) {
//         notifications.show({
//           title: "Berhasil!",
//           message: `Invitation berhasil dikirim ke ${emails.length} email`,
//           color: "green",
//           position: "top-right",
//         });

//         // Update status invitation jika perlu
//         await updateInvitationStatus(invitationId);

//         return { success: true, data: response.data };
//       } else {
//         throw new Error(response.data.message || "Gagal mengirim invitation");
//       }
//     } catch (error: any) {
//       console.error("Error sending invitation email:", error);

//       const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat mengirim invitation";
//       notifications.show({
//         title: "Gagal!",
//         message: errorMessage,
//         color: "red",
//         position: "top-right",
//       });

//       return { success: false, error: errorMessage };
//     } finally {
//       setIsSendingInvitation(false);
//     }
//   };

//   // Fungsi untuk update status invitation setelah dikirim
//   const updateInvitationStatus = async (invitationId: number) => {
//     try {
//       await axios.put(`${config.wsUrl}invitations/${invitationId}/status`, {
//         status: 2, // Status sent
//       });
//     } catch (error) {
//       console.error("Error updating invitation status:", error);
//     }
//   };

//   // Fungsi untuk mengirim invitation ke semua penerima
//   const sendInvitationToAll = async (invitationId: number) => {
//     try {
//       setIsSendingInvitation(true);

//       // Ambil detail invitation terlebih dahulu
//       const invitationDetail = await getInvitationDetail(invitationId);

//       if (!invitationDetail || !invitationDetail.has_detail_invitation || invitationDetail.has_detail_invitation.length === 0) {
//         notifications.show({
//           title: "Peringatan",
//           message: "Tidak ada email penerima untuk invitation ini",
//           color: "yellow",
//           position: "top-right",
//         });
//         return;
//       }

//       // Ekstrak semua email dari detail invitation
//       const emails = invitationDetail.has_detail_invitation
//         .map(detail => detail.email)
//         .filter(email => email && email.trim() !== "");

//       if (emails.length === 0) {
//         notifications.show({
//           title: "Peringatan",
//           message: "Tidak ada email yang valid untuk dikirim",
//           color: "yellow",
//           position: "top-right",
//         });
//         return;
//       }

//       // Kirim invitation ke semua email
//       const result = await sendInvitationEmail(invitationId, emails);

//       if (result.success) {
//         // Refresh data invitation
//         await getInvitationEventData(data?.id || 0);
//       }
//     } catch (error) {
//       console.error("Error in sendInvitationToAll:", error);
//       notifications.show({
//         title: "Gagal!",
//         message: "Terjadi kesalahan saat mengirim invitation",
//         color: "red",
//         position: "top-right",
//       });
//     } finally {
//       setIsSendingInvitation(false);
//     }
//   };

//   // Fungsi untuk mengambil detail invitation
//   const getInvitationDetail = async (invitationId: number): Promise<InvitationResponse | null> => {
//     try {
//       const response = await axios.get(`${config.wsUrl}invitations/${invitationId}`);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching invitation detail:", error);
//       return null;
//     }
//   };

//   // Handler untuk mengirim invitation dari tabel
//   const handleSendInvitation = async (item: InvitationResponse) => {
//     try {
//       setIsSendingInvitation(true);

//       // Jika invitation hanya untuk satu penerima (is_one_receiver = 1)
//       if (item.is_one_receiver === 1 && item.has_detail_invitation && item.has_detail_invitation.length > 0) {
//         const firstDetail = item.has_detail_invitation[0];
//         const emails = [firstDetail.email];

//         await sendInvitationEmail(item.id, emails);
//       }
//       // Jika invitation untuk banyak penerima
//       else if (item.has_detail_invitation && item.has_detail_invitation.length > 0) {
//         // Ekstrak semua email
//         const emails = item.has_detail_invitation
//           .map(detail => detail.email)
//           .filter(email => email && email.trim() !== "");

//         if (emails.length > 0) {
//           await sendInvitationEmail(item.id, emails);
//         } else {
//           notifications.show({
//             title: "Peringatan",
//             message: "Tidak ada email penerima yang valid",
//             color: "yellow",
//             position: "top-right",
//           });
//         }
//       } else {
//         // Jika belum ada detail invitation, ambil dulu detailnya
//         await sendInvitationToAll(item.id);
//       }

//       // Refresh data invitation
//       await getInvitationEventData(data?.id || 0);
//     } catch (error) {
//       console.error("Error in handleSendInvitation:", error);
//     } finally {
//       setIsSendingInvitation(false);
//     }
//   };

//   // Fungsi untuk mengirim invitation dengan modal konfirmasi
//   const sendInvitationWithConfirm = (item: InvitationResponse) => {
//     setSelectedItemForSend(item);
//     setModalType('invitation');
//     setShowConfirmModal(true);
//   };

//   // Konfirmasi pengiriman invitation
//   const confirmSendInvitation = async () => {
//     if (selectedItemForSend) {
//       await handleSendInvitation(selectedItemForSend);
//       setShowConfirmModal(false);
//       setSelectedItemForSend(null);
//     }
//   };

//   useEffect(() => {
//     if (slug) {
//       console.log("Slug is available:", slug);
//       getData();
//       getInvitationCategory();
//     } else {
//       console.warn("Slug is undefined or missing.");
//     }
//   }, [slug]);

//   useEffect(() => {
//     if (data?.id && user?.id) {
//       getWithdrawHistory();
//     }
//   }, [data?.id, user?.id, updateWithdrawHistory]);

//   const filteredItems = useMemo(() => {
//     if (!Array.isArray(invitationData)) {
//       return [];
//     }

//     const lowerFilterValue = filterValue.toLowerCase();

//     return invitationData.filter((item) => {
//       const matchesInvoice = item.invoice_no?.toLowerCase().includes(lowerFilterValue) || false;
//       const matchesEmail = item.has_user?.email?.toLowerCase().includes(lowerFilterValue) || false;
//       const matchesStatus = item.transaction_status_id === 2;
//       const matchesType = transactionFilter === "all" || item.type_transaction === transactionFilter;

//       return (matchesInvoice || matchesEmail) && matchesStatus && matchesType;
//     });
//   }, [invitationData, filterValue, transactionFilter]);

//   const pages = Math.ceil(filteredItems.length / rowsPerPage);

//   const items = useMemo(() => {
//     const start = (page - 1) * rowsPerPage;
//     const end = start + rowsPerPage;
//     return filteredItems.slice(start, end);
//   }, [page, filteredItems, rowsPerPage]);

//   const onSearchChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
//     setFilterValue(e.target.value);
//     setPage(1);
//   }, []);

//   const onRowsPerPageChange = useCallback((e: { target: { value: any } }) => {
//     setRowsPerPage(Number(e.target.value));
//     setPage(1);
//   }, []);

//   const getStatusClass = (statusId: any) => {
//     switch (statusId) {
//       case 1:
//         return "bg-warning";
//       case 2:
//         return "bg-success";
//       case 3:
//         return "bg-danger";
//       case 4:
//         return "bg-secondary";
//       default:
//         return "";
//     }
//   };

//   const getStatusText = (statusId: any) => {
//     switch (statusId) {
//       case 1:
//         return "Pending";
//       case 2:
//         return "Verified";
//       case 3:
//         return "Failed";
//       case 4:
//         return "Expired";
//       default:
//         return "Unknown";
//     }
//   };

//   const getStatusTextInvitation = (statusId: any) => {
//     switch (statusId) {
//       case 0:
//         return "Cancel";
//       case 1:
//         return "Active";
//       case 2:
//         return "Sent";
//       default:
//         return "Unknown";
//     }
//   };

//   const getInvitationStatusClass = (statusId: any) => {
//     switch (statusId) {
//       case 0:
//         return "bg-danger";
//       case 1:
//         return "bg-warning";
//       case 2:
//         return "bg-success";
//       default:
//         return "bg-secondary";
//     }
//   };

//   const getInvitationEventData = async (id: string | number) => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${config.wsUrl}invitations/event/${id}`);
//       console.log("Response from API:", response.data);
//       // Pastikan response.data adalah array
//       if (Array.isArray(response.data)) {
//         setInvitation(response.data);
//       } else if (response.data && Array.isArray(response.data.data)) {
//         setInvitation(response.data.data);
//       } else {
//         console.warn("Invalid invitation data format:", response.data);
//         setInvitation([]);
//       }
//     } catch (err) {
//       console.error("Error fetching event invitation data:", err);
//       setInvitation([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredEventItems = useMemo(() => {
//     if (!Array.isArray(invitation)) {
//       return [];
//     }

//     return invitation.filter((item) =>
//       item.invitation_title?.toLowerCase().includes(invitationFilter.toLowerCase())
//     );
//   }, [invitation, invitationFilter]);

//   const eventPages = Math.ceil(filteredEventItems.length / rowsPerPage);

//   const eventItems = useMemo(() => {
//     const start = (page - 1) * rowsPerPage;
//     const end = start + rowsPerPage;
//     return filteredEventItems.slice(start, end);
//   }, [page, filteredEventItems, rowsPerPage]);

//   const onEventSearchChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
//     setInvitationFilter(e.target.value);
//     setPage(1);
//   }, []);

//   const onEventRowsPerPageChange = useCallback((e: { target: { value: any } }) => {
//     setRowsPerPage(Number(e.target.value));
//     setPage(1);
//   }, []);

//   const getEventData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${config.wsUrl}event-view-list-by-slug/${slug}`);
//       if (response && response.data) {
//         setEventData(response.data);
//         console.log(response.data, "tes uhuy");
//       }
//     } catch (error) {
//       console.error("Error fetching event data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const chartData = {
//     labels: ["Online", "Offline"],
//     datasets: [
//       {
//         label: "Jumlah Transaksi",
//         data: [eventData?.total_online || 0, eventData?.total_offline || 0],
//         backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)"],
//       },
//     ],
//   };

//   useEffect(() => {
//     if (typeof slug === "string") {
//       getEventData();
//     }
//   }, [slug]);

//   const onEditTicket = (data: EventTicket, idx: number) => {
//     console.log("Editing ticket:", data, idx);
//     setIdxTicket(idx);
//     setEditTicketData(data);
//     setIsEditTicketModalOpen(true);
//   };

//   const onAddTicket = () => {
//     router.replace(`/edit-event/${data?.slug}?addTiket=true`);
//   };

//   const deleteTicket = (idx: number) => {
//     let arr = [...ticket];
//     arr.splice(idx, 1);
//     setTicket(arr);
//   };

//   let list = useAsyncList({
//     async load({ signal }) {
//       if (data?.id) {
//         try {
//           let res = await axios.get(`${config.wsUrl}list-transaction-by-event?event_id=${data.id}`, {
//             signal,
//           });
//           let json = await res.data;
//           setIsLoading(false);

//           return {
//             items: json.data,
//           };
//         } catch (error) {
//           console.error("Error fetching transaction data:", error);
//           setIsLoading(false);
//           return { items: [] };
//         }
//       } else {
//         setIsLoading(false);
//         return { items: [] };
//       }
//     },
//   });

//   useEffect(() => {
//     if (data?.id) {
//       setIsLoading(true);

//       axios
//         .get(`${config.wsUrl}list-transaction-by-event?event_id=${data.id}`)
//         .then((res) => {
//           setGrandTotal(res.data.grand_total || 0);
//           console.log("Transaction data fetched:", res.data);
//           setIsLoading(false);
//         })
//         .catch((err) => {
//           console.error("Error fetching transaction data:", err);
//           setIsLoading(false);
//         });
//     } else {
//       console.log("Menunggu data event tersedia...");
//     }
//   }, [data]);

//   const downloadLaporan = () => {
//     if (!eventData) return;

//     const dataLaporan = [
//       ["Ringkasan Penjualan Tiket"],
//       ["Total View", eventData?.total_views || 0],
//       ["Total Bookmarks", 0],
//       ["Total Tiket Terjual", eventData?.total_paid || 0],
//       ["Total Penjualan", `Rp${eventData?.total_price_sell ? eventData.total_price_sell.toLocaleString("id-ID") : 0}`],
//       ["Total Admin Fee", `Rp${eventData?.total_admin_fee ? eventData.total_admin_fee.toLocaleString("id-ID") : 0}`],
//       ["Total Tiket", eventData?.total_ticket || 0],
//       ["Total Pembelian", eventData?.total_buy || 0],
//       ["Total Online", eventData?.total_online || 0],
//       ["Total Offline", eventData?.total_offline || 0],
//       ["Total Pembayaran Belum Lunas", eventData?.total_unpaid || 0],
//       ["Total Penjualan Online", `Rp${eventData?.total_price_sell_online ? eventData.total_price_sell_online.toLocaleString("id-ID") : 0}`],
//       ["Total Penjualan Offline", `Rp${eventData?.total_price_sell_offline ? eventData.total_price_sell_offline.toLocaleString("id-ID") : 0}`],
//       ["Grand Total", `Rp${eventData?.total_price_sell && eventData?.total_admin_fee ? (eventData.total_price_sell - eventData.total_admin_fee).toLocaleString("id-ID") : 0}`],
//     ];

//     const worksheet = XLSX.utils.aoa_to_sheet(dataLaporan);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");

//     XLSX.writeFile(workbook, `Laporan_Penjualan_Event_${eventData.event_name}.xlsx`);
//   };

//   return !loading && data ? (
//     <>
//       <div>
//         <Breadcrumbs className="mb-5 p-5">
//           <BreadcrumbItem onPress={() => router.push("/dashboard/my-event")}>Event Saya</BreadcrumbItem>
//           <BreadcrumbItem>Detail Event</BreadcrumbItem>
//         </Breadcrumbs>
//         <div className="p-5 flex flex-col md:flex-row lg:flex gap-2">
//           <div className="max-w-[300px]">
//             <EventCardCreator
//               key={data.id}
//               eventStatus={data.has_event_status.name}
//               title={data.name}
//               img={data.image_url}
//               end={data.end_date}
//               date={data.start_date}
//               slug={data.slug}
//               location={data.location_name}
//               price={data.starting_price}
//               creatorImg={data.has_creator?.image}
//               creator={data.has_creator?.name}
//               withoutButton
//               shareLink={window.location.origin + "/event/" + data.slug}
//             />

//             <div className="flex flex-col items-center justify-center p-4 max-w-full min-w-full lg:min-w-60 w-full bg-white rounded-xl shadow-md mx-1 md:mx-0 border border-primary-light-200 mt-4">
//               <h5 className="text-lg font-semibold mb-2">Share your event link</h5>
//               <QrCode slug={`${window.location.origin}/event/${data.slug}`} errorCorrectionLevel="H" margin={8} logoSizeRatio={0.22} />
//               {
//                 <Button
//                   label="Download QR Code"
//                   color="primary"
//                   className="mt-4"
//                   onClick={() => {
//                     const qrCodeCanvas = document.querySelector(".qrcode canvas") as HTMLCanvasElement;
//                     if (qrCodeCanvas) {
//                       const link = document.createElement("a");
//                       link.href = qrCodeCanvas.toDataURL("image/png");
//                       link.download = `${data.slug}-qrcode.png`;
//                       link.click();
//                     }
//                   }}
//                 />
//               }
//             </div>

//             <div className="text-center w-full my-4">
//               <Button label="Check-in" color="primary" className="w-full" onClick={() => router.push(`/dashboard/my-event/checkin/${data.slug}`)} />
//             </div>
//             <div className="text-center w-full my-4">
//               <Button label="Penjualan" color="primary" className="w-full" onClick={() => router.push(`/dashboard/my-event/sell/${data.slug}`)} />
//             </div>
//           </div>

//           <div className="w-full flex flex-col gap-4 text-dark px-4 md:px-6 lg:px-8">
//             <Accordion className="border border-primary-light-200 rounded-lg shadow-sm py-0 pr-5">
//               <AccordionItem
//                 title={
//                   <div className=" flex flex-col md:flex-row justify-between items-start md:items-center px-4">
//                     <div className="mb-3 md:mb-0">
//                       <p className="text-grey">Total Pendapatan Event</p>
//                       <h6>
//                         Rp.
//                         {(eventData?.total_pendapatan || 0).toLocaleString("id-ID")}
//                       </h6>
//                     </div>
//                     <Button color="primary" label="Tarik Dana" className="w-full md:w-auto" onClick={() => setIsModalOpen(true)} />
//                   </div>
//                 }
//               >
//                 <Stack p={20} pt={0} gap={10}>
//                   <Divider />
//                   <Text size="sm" fw={600} c="gray">
//                     Riwayat Tarik Dana
//                   </Text>
//                   <WithdrawHistoryList user_id={user?.id ?? 0} setUpdate={updateWithdrawHistory} />
//                 </Stack>
//               </AccordionItem>
//             </Accordion>

//             <Accordion selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} className="rounded-lg shadow-sm p-0" aria-label="Event Data Accordion">
//               <AccordionItem key="1" title="Statistik Event" className="border border-primary-light-200 px-4 rounded-lg">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 [&>div]:!relative [&_p:first-child]:w-full [&>div]:!overflow-hidden">
//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Total Penjualan Online</p>
//                       <Icon icon="hugeicons:money-04" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">
//                       Rp
//                       {(eventData?.total_price_sell_online || 0).toLocaleString("id-ID")}
//                     </p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Total Penjualan Offline</p>
//                       <Icon icon="hugeicons:money-04" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">
//                       Rp
//                       {(eventData?.total_price_sell_offline || 0).toLocaleString("id-ID")}
//                     </p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Total Transaksi</p>
//                       <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">{eventData?.total_paid || 0}</p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Transaksi Gagal</p>
//                       <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">{eventData?.total_ticket_failed || 0}</p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Transaksi Pending</p>
//                       <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">{eventData?.total_ticket_pending || 0}</p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Ticket Terjual</p>
//                       <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">{eventData?.total_ticket_sold || 0}</p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Total Withdraw</p>
//                       <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">{eventData?.total_withdraw || 0}</p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Total View</p>
//                       <Icon icon="tabler:users" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">{eventData?.total_views || 0}</p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Total Bookmarks</p>
//                       <Icon icon="meteor-icons:bookmark" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">0</p>
//                   </div>

//                   <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
//                     <Flex align="center" gap={7}>
//                       <p className="text-grey">Jenis Tiket</p>
//                       <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
//                     </Flex>
//                     <p className="font-semibold">{eventData?.total_ticket || 0}</p>
//                   </div>
//                 </div>
//               </AccordionItem>
//             </Accordion>

//             <div className="border border-primary-light-200 rounded-lg shadow-sm">
//               <Tabs className="flex flex-col" variant="underlined">
//                 <Tab title="Detail" className="px-2">
//                   <Tabs
//                     radius="full"
//                     color="secondary"
//                     classNames={{
//                       tabList: "bg-transparent",
//                       tab: "data-[selected=true]:text-primary",
//                       cursor: "border border-primary-base",
//                     }}
//                   >
//                     <Tab title="Deskripsi" className="px-2">
//                       <div dangerouslySetInnerHTML={{ __html: data.description }}></div>
//                     </Tab>
//                     <Tab title="Syarat & Ketentuan" className="px-2">
//                       <div
//                         className="ml-5"
//                         dangerouslySetInnerHTML={{
//                           __html: data.term_condition,
//                         }}
//                       ></div>
//                     </Tab>
//                   </Tabs>
//                 </Tab>
//                 <Tab title="Tiket">
//                   <div className="flex justify-between items-center px-3 py-2">
//                     <h6 className="text-lg font-semibold">Tiket</h6>
//                   </div>
//                   <div className="px-3">
//                     {ticket.length > 0 &&
//                       ticket.map((el, index) => (
//                         <div key={index} className={`mb-3`}>
//                           <TicketContainer
//                             type={el.ticket_type}
//                             category={el.ticket_category}
//                             ticketDate={el.ticket_date}
//                             ticketEnd={el.ticket_end}
//                             price={el.price}
//                             description={el.description}
//                             name={el.name}
//                             onEdit={() => onEditTicket(el, index)}
//                           />
//                         </div>
//                       ))}
//                   </div>
//                 </Tab>
//                 <Tab title="Transaksi" className="px-2">
//                   <div className="bg-primary-light flex flex-col gap-2">
//                     <div className="bg-white">
//                       <div className="px-5 py-3">
//                         <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
//                           <Input type="text" placeholder="Search by Invoice or Email" value={filterValue} onChange={onSearchChange} />
//                           <select onChange={onRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md w-full md:w-auto">
//                             <option value={5}>5</option>
//                             <option value={10}>10</option>
//                             <option value={20}>20</option>
//                           </select>
//                         </div>

//                         {/* Transaction Type Buttons */}
//                         <div className="flex gap-4 mb-4 items-center">
//                           <Button label="All" onClick={() => setTransactionFilter("all")} color={transactionFilter === "all" ? "primary" : "secondary"} fullWidth />
//                           <Button label="Online" onClick={() => setTransactionFilter("online")} color={transactionFilter === "online" ? "primary" : "secondary"} fullWidth />
//                           <Button label="Offline" onClick={() => setTransactionFilter("offline")} color={transactionFilter === "offline" ? "primary" : "secondary"} fullWidth />
//                           <ButtonM className={`shrink-0`} leftSection={<Icon icon="uiw:download" className={`text-[20px]`} />} variant="transparent" color="#194e9e" onClick={handleDownloadTransaction}>
//                             Download
//                           </ButtonM>
//                         </div>

//                         {/* Single Transaction Table */}
//                         <Table
//                           aria-label="Invitation Table"
//                           isHeaderSticky
//                           bottomContentPlacement="outside"
//                           classNames={{
//                             wrapper: "max-h-[382px]",
//                           }}
//                           topContentPlacement="outside"
//                           bottomContent={<Pagination className="items-center" page={page} total={pages} onChange={setPage} />}
//                         >
//                           <TableHeader>
//                             <TableColumn className="font-bold text-sm">No</TableColumn>
//                             <TableColumn className="font-bold text-sm">Email</TableColumn>
//                             <TableColumn className="font-bold text-sm">No.Invoice</TableColumn>
//                             <TableColumn className="font-bold text-sm">Waktu Dikirim</TableColumn>
//                             <TableColumn className="font-bold text-sm">Status</TableColumn>
//                             <TableColumn className="font-bold text-sm">Type</TableColumn>
//                             <TableColumn className="font-bold text-sm">Aksi</TableColumn>
//                           </TableHeader>
//                           <TableBody items={items}>
//                             {(item) => (
//                               <TableRow key={item?.id}>
//                                 <TableCell className="border-b-1 text-sm">
//                                   {_.indexOf(
//                                     items.map((e) => e?.id),
//                                     item?.id,
//                                   ) + 1}
//                                 </TableCell>
//                                 <TableCell className="border-b-1 text-sm">{item?.has_user?.email}</TableCell>
//                                 <TableCell className="border-b-1 text-sm">{item?.invoice_no}</TableCell>
//                                 <TableCell className="border-b-1 text-sm">
//                                   {item?.created_at &&
//                                     new Date(item.created_at).toLocaleDateString("en-GB", {
//                                       year: "numeric",
//                                       month: "long",
//                                       day: "numeric",
//                                     })}
//                                 </TableCell>
//                                 <TableCell className="border-b-1">
//                                   {(() => {
//                                     const statusId = findTransactionStatus(item.invoice_no);

//                                     return <span className={`px-2 py-1 rounded-md text-white ${getStatusClass(statusId)}`}>{getStatusText(statusId)}</span>;
//                                   })()}
//                                 </TableCell>

//                                 <TableCell className="border-b-1 text-sm">{item.type_transaction}</TableCell>
//                                 <TableCell className="border-b-1 flex items-center">
//                                   <Tooltip label="Kirim Ulang">
//                                     <button
//                                       disabled={sendingEmails[String(item?.id)]}
//                                       className="w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
//                                       onClick={() => {
//                                         if (item?.has_user && item.has_user.email) {
//                                           sendETicket(item.invoice_no, item.has_user.email, item.id);
//                                         } else {
//                                           notifications.show({
//                                             title: "Error",
//                                             message: "Email tidak tersedia untuk pengguna ini.",
//                                             color: "red",
//                                             position: "top-right",
//                                           });
//                                         }
//                                       }}
//                                     >
//                                       {sendingEmails[String(item?.id)] ? <Spinner size="sm" color="default" /> : <FontAwesomeIcon icon={faPaperPlane} className="text-white text-sm" />}
//                                     </button>
//                                   </Tooltip>
//                                   <Tooltip label="Lihat Detail">
//                                     <button className="ml-2 w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2">
//                                       <FontAwesomeIcon
//                                         icon={faEye}
//                                         className="text-white text-sm"
//                                         onClick={() => {
//                                           console.log("row item:", item);
//                                           console.log("local ticket var:", ticket);
//                                           openDetailModal(item, ticket);
//                                         }}
//                                       />
//                                     </button>
//                                   </Tooltip>
//                                 </TableCell>
//                               </TableRow>
//                             )}
//                           </TableBody>
//                         </Table>
//                       </div>
//                     </div>
//                   </div>
//                 </Tab>

//                 <Tab title="Invitation" className="px-2">
//                   <div className="bg-primary-light flex flex-col gap-2">
//                     <div className="bg-white">
//                       <div className="px-5 py-3">
//                         <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
//                           <Input type="text" placeholder="Search by Invitation Title" value={invitationFilter} onChange={onEventSearchChange} />
//                           <select onChange={onEventRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md w-full md:w-auto">
//                             <option value={5}>5</option>
//                             <option value={10}>10</option>
//                             <option value={20}>20</option>
//                           </select>
//                           <Tooltip label="Tambah Invitation Baru">
//                             <button className="w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2">
//                               <FontAwesomeIcon icon={faPlus} className="text-white text-sm" onClick={openAddModal} />
//                             </button>
//                           </Tooltip>
//                         </div>
//                         {loading ? (
//                           <p>Loading...</p>
//                         ) : (
//                           <Table aria-label="Event Invitation Table" bottomContent={<Pagination className="items-center" page={page} total={eventPages} onChange={setPage} />}>
//                             <TableHeader>
//                               <TableColumn className="font-bold text-md">No</TableColumn>
//                               <TableColumn className="font-bold text-md">Judul Undangan</TableColumn>
//                               <TableColumn className="font-bold text-md">Type</TableColumn>
//                               <TableColumn className="font-bold text-md">Qty</TableColumn>
//                               <TableColumn className="font-bold text-md">Status</TableColumn>
//                               <TableColumn className="font-bold text-md">Aksi</TableColumn>
//                             </TableHeader>
//                             <TableBody items={eventItems}>
//                               {(item) => (
//                                 <TableRow key={item?.id}>
//                                   <TableCell className="border-b-1">
//                                     {_.indexOf(
//                                       eventItems.map((e) => e?.id),
//                                       item?.id,
//                                     ) + 1}
//                                   </TableCell>
//                                   <TableCell className="border-b-1">{item?.invitation_title}</TableCell>
//                                   <TableCell className="border-b-1">{invitationCategory?.find((e) => e.id == item?.invitation_cat_id)?.name ?? "-"}</TableCell>
//                                   <TableCell className="border-b-1">{item?.total_qty}</TableCell>
//                                   <TableCell className="border-b-1">
//                                     {(() => {
//                                       const statusId = item?.invitation_status ?? 1;
//                                       return <span className={`px-2 py-1 rounded-md text-white ${getInvitationStatusClass(statusId)}`}>{getStatusTextInvitation(statusId)}</span>;
//                                     })()}
//                                   </TableCell>
//                                   <TableCell className="border-b-1 flex items-center gap-2">
//                                     <Tooltip label="Kirim Invitation">
//                                       <button
//                                         disabled={isSendingInvitation}
//                                         className="w-10 h-10 flex items-center justify-center bg-primary-base hover:bg-primary-dark text-white rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                                         onClick={() => handleSendInvitation(item)}
//                                       >
//                                         {isSendingInvitation ? <Spinner size="sm" color="white" /> : <FontAwesomeIcon icon={faPaperPlane} className="text-white text-sm" />}
//                                       </button>
//                                     </Tooltip>
//                                     <Tooltip label="Lihat Detail">
//                                       <button className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2" onClick={() => openInvitationModal(item)}>
//                                         <FontAwesomeIcon icon={faEye} className="text-white text-sm" />
//                                       </button>
//                                     </Tooltip>
//                                   </TableCell>
//                                 </TableRow>
//                               )}
//                             </TableBody>
//                           </Table>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </Tab>
//                 <Tab title="Penjualan" className="px-2">
//                   <div className="bg-primary-light flex flex-col gap-2">
//                     <div className="bg-white">
//                       <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-3 pb-3 border-b border-b-primary-light-200">
//                         <h6>Ringkasan</h6>
//                         <p onClick={downloadLaporan} className="text-primary-base font-semibold mt-2 md:mt-0 cursor-pointer">
//                           <span>
//                             <Tooltip label="download">
//                               <FontAwesomeIcon icon={faDownload} className="mr-2" />
//                             </Tooltip>
//                           </span>
//                           Download Laporan
//                         </p>
//                       </div>
//                       <div className="flex flex-col mx-3 gap-3 border-b py-3 border-b-primary-light-200">
//                         <div className="flex items-center justify-between">
//                           <p className="text-dark-grey">Total Penjualan Tiket Online</p>
//                           <p className="font-semibold">
//                             Rp
//                             {(eventData?.total_price_sell || 0).toLocaleString("id-ID")}
//                           </p>
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <p className="text-dark-grey">Total Promo</p>
//                           <p className="font-semibold">{`(-) Rp0`}</p>
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <p className="text-dark-grey">Biaya Layanan Penjualan Tiket Online</p>
//                           <p className="font-semibold">
//                             Rp
//                             {(eventData?.total_admin_fee || 0).toLocaleString("id-ID")}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex justify-between px-3 py-4">
//                         <p className="text-primary">Total</p>
//                         <p className="font-semibold">
//                           Rp
//                           {((eventData?.total_price_sell || 0) - (eventData?.total_admin_fee || 0)).toLocaleString("id-ID")}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </Tab>
//               </Tabs>
//             </div>
//           </div>
//         </div>
//       </div>
//       <DetailModal item={selectedItem} isOpen={isDetailModalOpen} onClose={closeDetailModal} />
//       <AddEventModal eventData={data} isOpen={isAddModalOpen} onClose={closeAddModal} eventId={data.id} />
//       <EditEventModal item={selectedEvent} isOpen={isEditModalOpen} onClose={closeEditModal} />
//       <TarikDanaModal
//         isOpen={isModalOpen}
//         setIsOpen={setIsModalOpen}
//         onSubmit={() => {
//           setUpdateWithdrawHistory(updateWithdrawHistory + 1);
//           getWithdrawHistory();
//           console.log("withdraw submitted");
//         }}
//         eventSlug={params.slug}
//       />
//       <InvitationDetailModal invitation={selectedInvitation} isOpen={isInvitationModalOpen} onClose={closeInvitationModal} />

//       {/* Modal Konfirmasi Pengiriman */}
//       <Modal
//         isOpen={showConfirmModal}
//         onClose={() => setShowConfirmModal(false)}
//         title="Konfirmasi Pengiriman"
//         size="md"
//       >
//         <div className="p-4">
//           <p className="mb-4">
//             {modalType === 'invitation'
//               ? `Apakah Anda yakin ingin mengirim invitation "${selectedItemForSend?.invitation_title}"?`
//               : 'Apakah Anda yakin ingin mengirim email?'}
//           </p>
//           <div className="flex justify-end gap-2">
//             <Button
//               label="Batal"
//               color="secondary"
//               onClick={() => setShowConfirmModal(false)}
//             />
//             <Button
//               label="Kirim"
//               color="primary"
//               onClick={confirmSendInvitation}
//             />
//           </div>
//         </div>
//       </Modal>

//       <Context.Provider value={{ seatmapData: seatmap, setSeatmapData: setSeatmap, ticket }}>
//         <ModalCreateTicket isOpen={addTicket} setIsOpen={showAddTicket} ticket={ticket} setTicket={setTicket} data={editTicketData} setIdx={setIdxTicket} idx={idxTicket} eventId={data.id} endDate={data.end_date} />
//         <ModalEditTicket isOpen={isEditTicketModalOpen} setIsOpen={setIsEditTicketModalOpen} ticket={ticket} setTicket={setTicket} data={editTicketData} setIdx={setIdxTicket} idx={idxTicket} eventId={data.id} endDate={data.end_date} />
//       </Context.Provider>
//     </>
//   ) : (
//     <Box w="100%" mih={300} h={300}>
//       <Center h="100%">
//         <Spinner />
//       </Center>
//     </Box>
//   );
// };

// export default MyEventDetail;
