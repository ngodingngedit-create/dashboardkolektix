import React, { useState, useEffect, useMemo } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import { useDebouncedValue } from "@mantine/hooks";
import useLoggedUser from "@/utils/useLoggedUser";
import { Get } from "@/utils/REST";
import { Select, TextInput, Card, Flex, Stack, Text, Title, Loader, Tooltip, Pagination as MantinePagination, Badge, Box, Divider, Button, Group, ActionIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronRight, faUser, faTicket, faEnvelope, faPhone, faFileInvoice, faIdBadge, faCalendarDays, faFilter, faInfoCircle, faEye, faChair, faFileExcel, faArrowsRotate, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import moment from "moment";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";

interface Identity {
  id: number;
  full_name: string;
  email: string;
  no_telp: string;
  is_pemesan: number;
}

interface Ticket {
  id: number;
  ticket_category: string;
  seatnumber_ticket: string | string[]; // Can be JSON string or array
  has_event_ticket: {
    ticket_category: string;
    available_seat_number: string;
    taken_seat_number: string;
    reserved_seat_number?: string | null;
    name: string;
    sold_qty?: number;
    ticket_sold?: number;
  };
  qty_ticket?: number;
}

interface Transaction {
  id: number;
  event_id: string | number;
  invoice_no: string;
  payment_status: string;
  identities: Identity[];
  tickets: Ticket[];
  has_user: {
    name: string;
    email: string;
  };
}

interface EventData {
  id: number;
  name: string;
  slug?: string;
  seatmap?: string | null;
  is_session?: number;
  has_event_ticket?: {
    id: number;
    ticket_category: string;
    available_seat_number: string | null;
    taken_seat_number: string | null;
    reserved_seat_number?: string | null;
    name: string;
    sold_qty?: number;
    ticket_sold?: number;
  }[];
}

interface Props {
  initialEvents: EventData[];
  initialCreatorId: number | null;
}

const SeatReport = ({ initialEvents, initialCreatorId }: Props) => {
  const router = useRouter();
  const users = useLoggedUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<EventData[]>(initialEvents || []);
  const [loading, setLoading] = useState(false);
  const [loadingTrx, setLoadingTrx] = useState(false);
  const [seatPage, setSeatPage] = useState(1);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEvents && initialEvents.length > 0 ? String(initialEvents[0].id) : "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedTicketName, setSelectedTicketName] = useState<string | null>(null);
  const [eventDetail, setEventDetail] = useState<any>(null);
  const [loadingEventDetail, setLoadingEventDetail] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>("invoice");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [seatViewMode, setSeatViewMode] = useState<"grid" | "table">("grid");

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const handleExportExcel = () => {
    if (processedTransactions.length === 0) {
      notifications.show({
        title: "Gagal Export",
        message: "Tidak ada data untuk di-export",
        color: "red",
      });
      return;
    }

    const exportData = processedTransactions.map((trx, index) => ({
      "NO": index + 1,
      "INVOICE": trx.invoice_no,
      "NAMA PEMESAN": trx.has_user?.name || "-",
      "EMAIL": trx.has_user?.email || "-",
      "JENIS TIKET": trx.tickets
        .map(t => t.has_event_ticket?.name || t.ticket_category)
        .join(", "),
      "NO. SEAT": trx.tickets
        .map(t => {
          if (typeof t.seatnumber_ticket === 'string') {
            try {
              const parsed = JSON.parse(t.seatnumber_ticket);
              return Array.isArray(parsed) ? parsed.join(", ") : parsed;
            } catch {
              return t.seatnumber_ticket;
            }
          }
          return Array.isArray(t.seatnumber_ticket) ? t.seatnumber_ticket.join(", ") : t.seatnumber_ticket;
        })
        .filter(Boolean)
        .join(", ") || "-",
      "STATUS": trx.payment_status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Transaksi");
    XLSX.writeFile(workbook, `Laporan_Transaksi_${selectedEventData?.name || 'Event'}.xlsx`);
  };

  const selectedEventData = useMemo(() => {
    return events.find((e) => String(e.id) === selectedEventId);
  }, [events, selectedEventId]);

  // Determine if we should use list mode (Festival) vs grid mode (Seated)
  const isFestival = useMemo(() => {
    return selectedCategory === "festival";
  }, [selectedCategory]);

  // 1. Initial Load: Fetch Events (Only used if need to manually refresh, mostly handled by SSR now)
  const fetchEvents = async (creatorId: number) => {
    try {
      setLoading(true);
      const res: any = await Get(`event-by-creator/${creatorId}`, { status: "" });
      if (res && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Transactions (Fetch from API with current page and search)
  const fetchTransactions = async (creatorId: number, eventId: string, pageNum: number, searchStr: string = "", ticketName: string = "") => {
    if (!eventId || eventId === "all") {
      setTransactions([]);
      return;
    }

    try {
      setLoadingTrx(true);

      const params: any = {
        creator_id: creatorId,
        event_id: eventId,
        page: 1,
        per_page: 999999 // Fetch all for local filtering/sorting standard
      };

      if (searchStr) {
        params.search = searchStr;
      }

      const res: any = await Get(`list-transaction-by-event`, params);

      const listData = Array.isArray(res?.data) ? res.data : (res?.data?.data ? res.data.data : []);
      const paginationData = res?.pagination || res?.data?.pagination || null;

      if (paginationData && paginationData.last_page) {
        setApiTotalPages(paginationData.last_page);
      } else {
        setApiTotalPages(1);
      }

      if (listData && listData.length > 0) {
        setTransactions(listData);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    } finally {
      setLoadingTrx(false);
    }
  };

  // We no longer need to auto-fetch events on mount because it's handled by SSR
  // But we can keep it as a fallback if needed
  /*
  useEffect(() => {
    if (users?.has_creator?.id && events.length === 0) {
      fetchEvents(users.has_creator.id);
    }
  }, [users]);
  */

  // Refresh transactions when selected event, page, or search changes
  useEffect(() => {
    if (selectedEventId && users?.has_creator?.id) {
      // In festival mode, we fetch a large batch to handle client-side filtering/counts correctly
      // In seated mode, we still use pagination as it's more structured
      fetchTransactions(users.has_creator.id, selectedEventId, seatPage, debouncedSearch, isFestival ? (selectedTicketName || "") : "");
    }
  }, [selectedEventId, users, seatPage, debouncedSearch, isFestival]);

  // Fetch event details to get reserved_seat_number
  useEffect(() => {
    if (selectedEventData?.slug) {
      setLoadingEventDetail(true);
      Get(`event/${selectedEventData.slug}`, {})
        .then((res: any) => {
          if (res?.data) {
            setEventDetail(res.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching event detail:", err);
        })
        .finally(() => {
          setLoadingEventDetail(false);
        });
    } else {
      setEventDetail(null);
    }
  }, [selectedEventData?.slug]);

  const parseSeatSession = (seat: string) => {
    if (seat && seat.includes(":")) {
      const parts = seat.split(":");
      return {
        session: parts[0],
        seatName: parts.slice(1).join(":")
      };
    }
    return {
      session: null,
      seatName: seat || ""
    };
  };

  // Reset page to 1 when event ID or search query changes
  useEffect(() => {
    setSeatPage(1);
  }, [selectedEventId, debouncedSearch, selectedTicketName]);

  // Group categories into broader 'seated' and 'festival' groups
  const categoryGroups = useMemo(() => {
    const seated = new Set<string>();
    const festival = new Set<string>();

    // 1. From eventDetail/selectedEventData
    const ticketsSource = eventDetail?.has_event_ticket || selectedEventData?.has_event_ticket;
    ticketsSource?.forEach((t: any) => {
      const hasSeats = (t.available_seat_number && t.available_seat_number.trim() !== "") ||
        (t.taken_seat_number && t.taken_seat_number.trim() !== "") ||
        (t.reserved_seat_number && t.reserved_seat_number.trim() !== "");
      if (hasSeats) {
        seated.add(t.ticket_category);
      } else {
        festival.add(t.ticket_category);
      }
    });

    // 2. From transactions
    transactions.forEach((trx) => {
      trx.tickets.forEach((t) => {
        const ticketCategory = t.has_event_ticket;
        if (ticketCategory) {
          const hasSeats = (ticketCategory.available_seat_number && ticketCategory.available_seat_number.trim() !== "") ||
            (ticketCategory.taken_seat_number && ticketCategory.taken_seat_number.trim() !== "") ||
            (ticketCategory.reserved_seat_number && ticketCategory.reserved_seat_number.trim() !== "");
          if (hasSeats) {
            seated.add(ticketCategory.ticket_category);
          } else {
            festival.add(ticketCategory.ticket_category);
          }
        }
      });
    });

    return {
      seated: Array.from(seated),
      festival: Array.from(festival)
    };
  }, [selectedEventData, eventDetail, transactions]);

  const categories = useMemo(() => {
    const list = [];
    if (categoryGroups.seated.length > 0) list.push("seated");
    if (categoryGroups.festival.length > 0) list.push("festival");
    return list;
  }, [categoryGroups]);

  // Auto-select and validate category + ticket name
  useEffect(() => {
    if (categories.length > 0) {
      if (!selectedCategory || !categories.includes(selectedCategory)) {
        setSelectedCategory(categories[0]);
        setSelectedTicketName(null);
        setSelectedSeat(null);
      }
    }
  }, [categories, selectedCategory]);

  // Extract ticket types matching the selected group (Seated or Festival)
  const ticketTypesInCategory = useMemo(() => {
    const targetCategories = selectedCategory === "seated" ? categoryGroups.seated : categoryGroups.festival;
    if (targetCategories.length === 0) return [];

    const names = new Set<string>();

    selectedEventData?.has_event_ticket?.forEach(t => {
      if (targetCategories.includes(t.ticket_category)) names.add(t.name);
    });

    return Array.from(names);
  }, [selectedCategory, categoryGroups, selectedEventData]);

  // We keep selectedTicketName as null (All) by default now to show more data
  useEffect(() => {
    if (ticketTypesInCategory.length > 0 && !selectedTicketName && isFestival) {
      // For festival, we might want to default to the first one ONLY if requested, 
      // but for standard view, showing all is better.
      // setSelectedTicketName(ticketTypesInCategory[0]); 
    }
  }, [ticketTypesInCategory, selectedTicketName, isFestival]);

  // Extract all statuses from transactions
  const statuses = useMemo(() => {
    const stats = new Set<string>();
    transactions.forEach((trx) => {
      if (trx.payment_status) {
        stats.add(trx.payment_status);
      }
    });
    return Array.from(stats);
  }, [transactions]);

  // Process data into a map of seat -> transaction info
  const seatMap = useMemo(() => {
    const map: Record<string, { transaction: Transaction; ticket: Ticket }> = {};
    const isSessionEvent = eventDetail?.is_session === 1 || selectedEventData?.is_session === 1;

    const getSessionPrefix = (t: any) => {
      if (!isSessionEvent) return "";
      const sessionName = t.event_session?.session_name || t.session_name;
      if (sessionName) {
        const match = sessionName.match(/\d+/);
        return match ? `${match[0]}:` : "";
      }
      return "";
    };

    transactions.forEach((trx) => {
      trx.tickets.forEach((t) => {
        let seats: string[] = [];
        if (t.seatnumber_ticket) {
          try {
            if (typeof t.seatnumber_ticket === "string") {
              const str = t.seatnumber_ticket.trim();
              if (str.startsWith("[") || str.startsWith("{")) {
                const parsed = JSON.parse(str);
                seats = Array.isArray(parsed) ? parsed : [String(parsed)];
              } else {
                seats = [str];
              }
            } else if (Array.isArray(t.seatnumber_ticket)) {
              seats = t.seatnumber_ticket;
            }
          } catch (e) {
            if (typeof t.seatnumber_ticket === "string") {
              seats = [t.seatnumber_ticket];
            } else {
              console.error("Error parsing seats:", e);
            }
          }
        }

        // If no seats could be parsed cleanly (e.g. Festival tickets often have null seat mapping), 
        // we create a synthetic identifier so it can still be listed.
        if (seats.length === 0) {
          const fallbackName = t.ticket_category || t.has_event_ticket?.name || 'Ticket';
          seats.push(`${fallbackName} - ${trx.invoice_no} (#${t.id})`);
        }

        const prefix = getSessionPrefix(t);
        seats.forEach((s) => {
          const seatKey = prefix + s.trim();
          map[seatKey] = {
            transaction: trx,
            ticket: t,
          };
        });
      });
    });

    return map;
  }, [transactions, eventDetail, selectedEventData]);

  const reservedSeatsSet = useMemo(() => {
    const rSet = new Set<string>();
    const isSessionEvent = eventDetail?.is_session === 1 || selectedEventData?.is_session === 1;

    const getSessionPrefix = (t: any) => {
      if (!isSessionEvent) return "";
      const sessionName = t.event_session?.session_name || t.session_name;
      if (sessionName) {
        const match = sessionName.match(/\d+/);
        return match ? `${match[0]}:` : "";
      }
      return "";
    };

    // 1. From eventDetail/selectedEventData
    const ticketsSource = eventDetail?.has_event_ticket || selectedEventData?.has_event_ticket;
    ticketsSource?.forEach((t: any) => {
      const prefix = getSessionPrefix(t);
      const reserved = t.reserved_seat_number?.split(",") || [];
      reserved.forEach((s: any) => {
        const cleaned = s.trim();
        if (cleaned) rSet.add(prefix + cleaned);
      });
    });

    // 2. From transactions
    transactions.forEach((trx) => {
      trx.tickets.forEach((t) => {
        const prefix = getSessionPrefix(t);
        const ticketCategory = t.has_event_ticket;
        if (ticketCategory) {
          const reserved = ticketCategory.reserved_seat_number?.split(",") || [];
          reserved.forEach((s: any) => {
            const cleaned = s.trim();
            if (cleaned) rSet.add(prefix + cleaned);
          });
        }
      });
    });

    return rSet;
  }, [eventDetail, selectedEventData, transactions]);

  // All seat numbers for the sidebar: SOURCED FROM EVENT TICKETS + TRANSACTIONS
  const allSeats = useMemo(() => {
    const seatsSet = new Set<string>();
    const isSessionEvent = eventDetail?.is_session === 1 || selectedEventData?.is_session === 1;

    const getSessionPrefix = (t: any) => {
      if (!isSessionEvent) return "";
      const sessionName = t.event_session?.session_name || t.session_name;
      if (sessionName) {
        const match = sessionName.match(/\d+/);
        return match ? `${match[0]}:` : "";
      }
      return "";
    };

    // 1. Add seats from event specification
    const targetCategories = selectedCategory === "seated" ? categoryGroups.seated : categoryGroups.festival;

    const ticketsSource = eventDetail?.has_event_ticket || selectedEventData?.has_event_ticket;

    ticketsSource?.forEach((t: any) => {
      if (!targetCategories.includes(t.ticket_category)) return;

      const prefix = getSessionPrefix(t);
      const available = t.available_seat_number?.split(",") || [];
      const taken = t.taken_seat_number?.split(",") || [];
      const reserved = t.reserved_seat_number?.split(",") || [];

      [...available, ...taken, ...reserved].forEach((s) => {
        const cleaned = s.trim();
        if (cleaned) seatsSet.add(prefix + cleaned);
      });
    });

    // Also add reserved seats from transactions tickets has_event_ticket
    transactions.forEach((trx) => {
      trx.tickets.forEach((t) => {
        const ticketCategory = t.has_event_ticket;
        if (ticketCategory && targetCategories.includes(ticketCategory.ticket_category)) {
          const prefix = getSessionPrefix(t);
          const reserved = ticketCategory.reserved_seat_number?.split(",") || [];
          reserved.forEach((s: any) => {
            const cleaned = s.trim();
            if (cleaned) seatsSet.add(prefix + cleaned);
          });
        }
      });
    });

    // 2. Add seats from actual transactions
    Object.keys(seatMap).forEach((seat) => {
      const ticketInfo = seatMap[seat];
      const tCategory = ticketInfo.ticket.has_event_ticket?.ticket_category || ticketInfo.ticket.ticket_category;
      if (!targetCategories.includes(tCategory)) return;
      seatsSet.add(seat);
    });

    return Array.from(seatsSet).sort((a, b) => {
      const parsedA = parseSeatSession(a);
      const parsedB = parseSeatSession(b);
      if (parsedA.session !== parsedB.session) {
        if (!parsedA.session) return 1;
        if (!parsedB.session) return -1;
        return parsedA.session.localeCompare(parsedB.session, undefined, { numeric: true });
      }
      return parsedA.seatName.localeCompare(parsedB.seatName, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [selectedEventData, eventDetail, selectedCategory, seatMap, categoryGroups, transactions]);

  // Filtered list of seats based on SEARCH and CATEGORY
  const filteredSeats = useMemo(() => {
    return allSeats.filter((seat) => {
      const info = seatMap[seat];

      // Search Filter: Local filtering allows searching for transaction names or ticket categories inside the current data page.
      const matchesSearch =
        !searchQuery ||
        seat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info?.transaction?.has_user?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        info?.transaction?.identities?.some((id) => id?.full_name?.toLowerCase()?.includes(searchQuery.toLowerCase()));

      // Status Filter
      const matchesStatus = selectedStatus === "all" || info?.transaction?.payment_status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [allSeats, seatMap, searchQuery, selectedStatus]);

  // Handle Festival Table Filtering and Pagination
  const itemsPerPage = 10;
  // Final processed data for the table (Festival mode)
  const processedTransactions = useMemo(() => {
    // Only return empty if it's seated mode AND we are in grid view
    if (!isFestival && seatViewMode === "grid") return [];

    let list = transactions.filter(trx => {
      // 1. Ticket Name Filter (Quick Filter)
      const matchTicket = !selectedTicketName || trx.tickets.some(t => (t.has_event_ticket?.name || t.ticket_category) === selectedTicketName);

      // 2. Broad Group Filter (Seated vs Festival)
      const targetCategories = selectedCategory === "seated" ? categoryGroups.seated : categoryGroups.festival;
      const matchCategory = trx.tickets.some(t => targetCategories.includes(t.has_event_ticket?.ticket_category || t.ticket_category));

      // 3. Status Filter
      const matchStatus = selectedStatus === "all" || trx.payment_status === selectedStatus;

      // 4. Search Filter
      const search = debouncedSearch.toLowerCase();
      const matchSearch = !search ||
        trx.invoice_no.toLowerCase().includes(search) ||
        trx.has_user?.name?.toLowerCase().includes(search) ||
        trx.has_user?.email?.toLowerCase().includes(search);

      return matchTicket && matchCategory && matchStatus && matchSearch;
    });

    // Apply Sorting
    if (sortBy) {
      list.sort((a: any, b: any) => {
        let valA, valB;
        if (sortBy === 'invoice') { valA = a.invoice_no; valB = b.invoice_no; }
        else if (sortBy === 'nama') { valA = a.has_user?.name || ""; valB = b.has_user?.name || ""; }
        else if (sortBy === 'email') { valA = a.has_user?.email || ""; valB = b.has_user?.email || ""; }
        else if (sortBy === 'status') { valA = a.payment_status; valB = b.payment_status; }
        else { valA = a[sortBy] || ""; valB = b[sortBy] || ""; }

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [transactions, selectedTicketName, selectedCategory, selectedStatus, debouncedSearch, isFestival, seatViewMode, sortBy, sortDir]);

  const totalFestivalPages = Math.ceil(processedTransactions.length / itemsPerPage);

  const paginatedFestivalTransactions = useMemo(() => {
    const start = (seatPage - 1) * itemsPerPage;
    return processedTransactions.slice(start, start + itemsPerPage);
  }, [processedTransactions, seatPage]);

  const selectedSeatInfo = useMemo(() => {
    if (!selectedSeat) return null;
    if (seatMap[selectedSeat]) {
      return seatMap[selectedSeat];
    }
    if (reservedSeatsSet.has(selectedSeat)) {
      return { isReservedOnly: true };
    }
    return null;
  }, [selectedSeat, seatMap, reservedSeatsSet]);



  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader size="lg" />
        <Text ml="md">Memuat Data Event...</Text>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
{/* Header Title */}
<Flex align="center" gap={12}>
<button
type="button"
onClick={() => router.push('/dashboard/my-event')}
className="w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
>
<FontAwesomeIcon icon={faArrowLeft} />
</button>
<Stack gap={2} mb="lg">
<Title order={1} size="h2" className="font-bold tracking-tight text-[#1a1c1e]">
Full Report
</Title>
<Text size="sm" c="dimmed">
Laporan penjualan dan data pemesan per kursi secara real-time.
</Text>
</Stack>
</Flex>

      {/* Filter Bar - New Design */}
      <Card withBorder radius="md" p="md" shadow="sm">
        <Flex justify="space-between" align="center" wrap="wrap" gap="md">
          {/* Left: Search Bar */}
          <TextInput
            placeholder="Cari Nama, Invoice, atau Nomor Kursi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<FontAwesomeIcon icon={faSearch} size="sm" />}
            style={{ minWidth: 320, flex: 1, maxWidth: 400 }}
            size="sm"
          />

          {/* Right: Controls */}
          <Flex align="center" gap="sm">
            <Text size="sm" fw={600} c="dimmed">Pilih Event untuk Melihat Data Seatmap:</Text>
            <Select
              value={selectedEventId}
              data={events.map((evt) => ({ value: String(evt.id), label: evt.name }))}
              onChange={(val) => {
                if (val) {
                  setSelectedEventId(val);
                  setSelectedSeat(null);
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }
              }}
              placeholder="Pilih Event"
              style={{ width: 200 }}
              searchable
              size="sm"
            />

            <Select
              placeholder="Kategori Tiket"
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val || categories[0]);
                setSelectedTicketName(null);
              }}
              data={categories.map(cat => ({ 
                value: cat, 
                label: cat === "seated" ? "Seatmap" : "Festival" 
              }))}
              style={{ width: 150 }}
              size="sm"
            />

            <Select
              placeholder="Semua Status"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val || "all")}
              data={[{ value: "all", label: "Semua Status" }, ...statuses.map(stat => ({ value: stat, label: stat }))]}
              style={{ width: 160 }}
              size="sm"
            />
          </Flex>
        </Flex>
      </Card>

      {/* Content Area */}
      <div className="flex flex-col md:flex-row gap-4 relative">
        {loadingTrx && (
          <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-lg">
            <Loader size="md" />
          </div>
        )}

        {/* Left Column: Seat List (Visible in Grid mode) */}
        {!isFestival && seatViewMode === "grid" && (
          <div className="w-full md:w-1/4 flex flex-col animate-in fade-in slide-in-from-left duration-300">
            <Card withBorder radius="md" p={0} shadow="sm" className="h-[75vh] flex flex-col border-light-grey">
              {/* Header */}
              <div className="p-4 border-b border-light-grey">
                <Title order={3} size="h4" className="font-bold text-[#1a1c1e]">
                  Pilih Kursi
                </Title>
                <Text size="xs" c="dimmed" mt={4}>
                  Pilih kursi untuk melihat detail transaksi
                </Text>

                {/* Legend */}
                <Flex gap="md" mt="md" align="center" wrap="wrap">
                  <Flex align="center" gap={6}>
                    <div className="w-6 h-6 rounded border border-light-grey bg-white"></div>
                    <Text size="xs" c="dimmed">Tersedia</Text>
                  </Flex>
                  <Flex align="center" gap={6}>
                    <div className="w-6 h-6 rounded border border-light-grey bg-grey"></div>
                    <Text size="xs" c="dimmed">Terisi</Text>
                  </Flex>
                  <Flex align="center" gap={6}>
                    <div className="w-6 h-6 rounded border border-orange-500 bg-orange-500"></div>
                    <Text size="xs" c="dimmed">Reserved</Text>
                  </Flex>
                </Flex>
              </div>

              {/* Seat Grid */}
              <div className="flex-grow overflow-y-auto p-4">
                {filteredSeats.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {filteredSeats.map((seat) => {
                      const isReserved = reservedSeatsSet.has(seat);
                      const isBought = !!seatMap[seat] || isReserved;
                      const isSelected = selectedSeat === seat;
                      const parsed = parseSeatSession(seat);
                      return (
                        <button
                          key={seat}
                          onClick={() => {
                            setSelectedSeat(seat);
                            setSeatViewMode("grid");
                          }}
                          className={`
                            transition-all duration-150 border p-2.5 rounded-md text-xs font-bold
                            ${isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
                              : isReserved
                                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                : isBought
                                  ? "bg-grey text-white border-light-grey"
                                  : "bg-white text-blue-600 border-light-grey hover:border-blue-400 hover:bg-blue-50"
                            }
                          `}
                        >
                          {parsed.seatName}
                          {parsed.session && (
                            <span className="block text-[9px] font-normal opacity-75 mt-0.5">
                              Sesi {parsed.session}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 text-center">
                    <FontAwesomeIcon icon={faChair} size="3x" className="opacity-30" />
                    <Text size="sm" fw={500} c="dimmed">Tidak ada kursi ditemukan</Text>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Festival Mode Left Column (Always visible in Festival) */}
        {isFestival && (
          <div className="w-full md:w-1/4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-light-grey overflow-hidden shadow-sm flex flex-col h-[70vh]">
              <div className="bg-white border-b border-light-grey p-4 text-dark font-bold flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTicket} className="text-primary-base text-sm" />
                    <span>Tiket Festival</span>
                  </div>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-2 scrollbar-hide">
                <div className="flex flex-col gap-2">
                  {ticketTypesInCategory.length > 0 ? (
                    ticketTypesInCategory.map((tName) => {
                      const isSelected = selectedTicketName === tName;
                      const countBought = transactions.reduce((acc, trx) => {
                        const matchingTickets = trx.tickets.filter(t => (t.has_event_ticket?.name || t.ticket_category) === tName);
                        const qtyBought = matchingTickets.reduce((q, t) => q + (t.qty_ticket || 1), 0);
                        return acc + qtyBought;
                      }, 0);

                      return (
                        <button
                          key={tName}
                          onClick={() => {
                            setSelectedTicketName(tName);
                            setSelectedSeat(null);
                          }}
                          className={`
                            transition-all duration-200 border p-3 text-left w-full flex justify-between items-center rounded-xl font-medium text-sm
                            ${isSelected
                              ? "bg-primary-base text-white border-primary-base shadow-md"
                              : "bg-white text-dark border-light-grey hover:border-grey shadow-sm"}
                          `}
                        >
                          <span className="truncate">{tName}</span>
                          <span className={`text-[10px] px-2 py-1 rounded font-bold ${isSelected ? "bg-white/20 text-white" : "bg-light-grey text-dark-grey"}`}>
                            {countBought} TERJUAL
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-grey gap-2 text-center p-4">
                      <FontAwesomeIcon icon={faTicket} size="2x" className="opacity-20" />
                      <p className="text-sm font-medium">Tidak ada jenis tiket tersedia</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3 border-t border-light-grey bg-white text-center">
                <Text size="xs" c="dimmed">Menampilkan jenis tiket tersedia</Text>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Buyer Details / Table (Fills remaining space) */}
        <div className={`w-full transition-all duration-300 ease-in-out ${
          !isFestival && seatViewMode === "grid" ? "md:w-3/4" : "md:w-full"
        }`}>
          <Card withBorder radius="md" p={0} shadow="sm" className="min-h-[75vh] flex flex-col border-light-grey">
            {/* Header */}
            <div className="p-4 border-b border-light-grey flex justify-between items-center">
              <div className="flex items-center gap-3">
                {selectedSeat && (
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="lg"
                    onClick={() => setSelectedSeat(null)}
                    title="Kembali ke tabel"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="rotate-180" />
                  </ActionIcon>
                )}
                <div>
                  <Title order={3} size="h4" className="font-bold text-[#1a1c1e]">
                    Rincian Laporan
                  </Title>
                  <Text size="xs" c="dimmed" mt={4}>
                    {selectedSeat
                      ? `Detail transaksi untuk kursi ${parseSeatSession(selectedSeat).seatName}${parseSeatSession(selectedSeat).session ? ` (Sesi ${parseSeatSession(selectedSeat).session})` : ""}`
                      : "Pilih kursi untuk melihat detail transaksi"}
                  </Text>
                </div>
              </div>
              <Flex align="center" gap="sm">
                {!isFestival && (
                  <>
                    <Text size="sm" fw={600} c="dimmed">Tampilan</Text>
                    <Select
                      size="sm"
                      value={seatViewMode}
                      onChange={(val) => {
                        setSeatViewMode(val as "grid" | "table");
                        if (val === "table") setSelectedSeat(null);
                      }}
                      data={[
                        { value: "grid", label: "Seat" },
                        { value: "table", label: "Tabel" }
                      ]}
                      style={{ width: 130 }}
                    />
                  </>
                )}
                {(isFestival || seatViewMode === "table") && (
                  <Button
                    variant="filled"
                    color="green"
                    size="sm"
                    leftSection={<FontAwesomeIcon icon={faFileExcel} />}
                    onClick={handleExportExcel}
                  >
                    Export
                  </Button>
                )}
              </Flex>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-grow overflow-y-auto bg-gray-50/30">
              {(isFestival || seatViewMode === "table") && !selectedSeat ? (
                /* FESTIVAL MODE: Table of Transactions */
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-light-grey overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full w-max text-left text-sm">
                        <thead>
                          <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">NO</th>
                            <th
                              onClick={() => handleSort('invoice')}
                              className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer hover:text-blue-600"
                            >
                              INVOICE {sortBy === 'invoice' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                              onClick={() => handleSort('nama')}
                              className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer hover:text-blue-600"
                            >
                              NAMA PEMESAN {sortBy === 'nama' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">JENIS TIKET</th>
                            <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">NO. SEAT</th>
                            <th
                              onClick={() => handleSort('email')}
                              className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer hover:text-blue-600"
                            >
                              EMAIL {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                              onClick={() => handleSort('status')}
                              className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer hover:text-blue-600"
                            >
                              STATUS {sortBy === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide text-center">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-grey">
                          {paginatedFestivalTransactions.map((trx, index) => {
                            // Find the specific seat identifier for this transaction to use as the selection key
                            const seatId = Object.keys(seatMap).find(k => seatMap[k].transaction.id === trx.id);

                            return (
                              <tr
                                key={trx.id}
                                className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                                onClick={() => seatId && setSelectedSeat(seatId)}
                              >
                                <td className="py-3 px-4 font-medium text-gray-700">{(seatPage - 1) * itemsPerPage + index + 1}</td>
                                <td className="py-3 px-4 font-mono font-semibold text-blue-600 whitespace-nowrap">{trx.invoice_no}</td>
                                <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{trx.has_user?.name || "-"}</td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <Badge variant="light" color="blue" size="sm">
                                    {trx.tickets
                                      .filter(t => !selectedTicketName || (t.has_event_ticket?.name || t.ticket_category) === selectedTicketName)
                                      .map(t => t.has_event_ticket?.name || t.ticket_category)
                                      .join(", ")}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 font-semibold text-blue-600 whitespace-nowrap">
                                  {trx.tickets
                                    .map(t => {
                                      if (typeof t.seatnumber_ticket === 'string') {
                                        try {
                                          const parsed = JSON.parse(t.seatnumber_ticket);
                                          return Array.isArray(parsed) ? parsed.join(", ") : parsed;
                                        } catch {
                                          return t.seatnumber_ticket;
                                        }
                                      }
                                      return Array.isArray(t.seatnumber_ticket) ? t.seatnumber_ticket.join(", ") : t.seatnumber_ticket;
                                    })
                                    .filter(Boolean)
                                    .join(", ") || "-"}
                                </td>
                                <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{trx.has_user?.email || "-"}</td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <Badge
                                    size="sm"
                                    variant="filled"
                                    color={
                                      trx.payment_status?.toLowerCase() === 'verified' || trx.payment_status?.toLowerCase() === 'success' ? 'green' :
                                        trx.payment_status?.toLowerCase() === 'expired' ? 'red' : 'yellow'
                                    }
                                  >
                                    {trx.payment_status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Tooltip label="Lihat Detail" withArrow position="top">
                                    <ActionIcon
                                      variant="light"
                                      color="blue"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        seatId && setSelectedSeat(seatId);
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faEye} size="xs" />
                                    </ActionIcon>
                                  </Tooltip>
                                </td>
                              </tr>
                            );
                          })}
                          {paginatedFestivalTransactions.length === 0 && (
                            <tr>
                              <td colSpan={8} className="py-16">
                                <Flex direction="column" align="center" justify="center" gap="md">
                                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faTicket} size="2x" className="text-gray-300" />
                                  </div>
                                  <Text fw={600} c="gray.6" size="sm">Belum ada kursi terpilih</Text>
                                  <Text c="gray.5" size="xs">Silakan pilih nomor kursi pada panel kiri untuk memuat rincian data pemesan.</Text>
                                </Flex>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Pagination for the table */}
                  {paginatedFestivalTransactions.length > 0 && (
                    <div className="flex justify-center pt-4">
                      <MantinePagination
                        total={Math.max(1, totalFestivalPages)}
                        value={seatPage}
                        onChange={setSeatPage}
                        color="blue"
                        size="sm"
                        siblings={1}
                      />
                    </div>
                  )}
                </div>
              ) : selectedSeatInfo ? (
                (() => {
                  const info = selectedSeatInfo as any;
                  return (
                    <div className="space-y-6">
                      {info.isReservedOnly ? (
                        <Card withBorder radius="md" p="lg" shadow="sm" className="border-light-grey bg-yellow-50/10">
                          <Stack gap="md">
                            <Text size="sm" fw={700} c="yellow.9" tt="uppercase">
                              Informasi Kursi Reservasi (Reserved)
                            </Text>
                            <Divider color="light-grey" />
                            <Stack gap="sm">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                  <FontAwesomeIcon icon={faChair} className="text-yellow-600" size="sm" />
                                </div>
                                <div className="flex-1">
                                  <Text size="xs" c="dimmed">Nomor Kursi</Text>
                                  <Text size="sm" fw={600} c="dark">
                                    {parseSeatSession(selectedSeat || "").seatName}
                                  </Text>
                                </div>
                              </div>
                              {parseSeatSession(selectedSeat || "").session && (
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                    <FontAwesomeIcon icon={faCalendarDays} className="text-yellow-600" size="sm" />
                                  </div>
                                  <div className="flex-1">
                                    <Text size="xs" c="dimmed">Sesi</Text>
                                    <Badge color="yellow" variant="light" size="sm">
                                      Sesi {parseSeatSession(selectedSeat || "").session}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                              <Text size="xs" c="dimmed" mt="xs">
                                Kursi ini ditandai sebagai Reservasi (Reserved) dan tidak tersedia untuk dibeli oleh publik.
                              </Text>
                            </Stack>
                          </Stack>
                        </Card>
                      ) : (
                        <>
                          {/* Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Informasi Pemesan Card */}
                            <Card withBorder radius="md" p="lg" shadow="sm" className="border-light-grey">
                              <Stack gap="md">
                                <Text size="sm" fw={700} c="dimmed" tt="uppercase">
                                  Informasi Pemesan
                                </Text>
                                <Divider color="light-grey" />
                                <Stack gap="sm">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                      <FontAwesomeIcon icon={faUser} className="text-blue-600" size="sm" />
                                    </div>
                                    <div className="flex-1">
                                      <Text size="xs" c="dimmed">Nama Pemesan</Text>
                                      <Text size="sm" fw={600} c="dark">{info.transaction?.has_user?.name || "-"}</Text>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                      <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" size="sm" />
                                    </div>
                                    <div className="flex-1">
                                      <Text size="xs" c="dimmed">Email Pemesan</Text>
                                      <Text size="sm" fw={600} c="dark">{info.transaction?.has_user?.email || "-"}</Text>
                                    </div>
                                  </div>
                                </Stack>
                              </Stack>
                            </Card>

                            {/* Detail Transaksi Card */}
                            <Card withBorder radius="md" p="lg" shadow="sm" className="border-light-grey">
                              <Stack gap="md">
                                <Text size="sm" fw={700} c="dimmed" tt="uppercase">
                                  Detail Transaksi
                                </Text>
                                <Divider color="light-grey" />
                                <Stack gap="sm">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                      <FontAwesomeIcon icon={faFileInvoice} className="text-blue-600" size="sm" />
                                    </div>
                                    <div className="flex-1">
                                      <Text size="xs" c="dimmed">Invoice No</Text>
                                      {info.transaction?.invoice_no ? (
                                        <Link href={`/success/${info.transaction.invoice_no}`} className="text-blue-600 hover:underline font-semibold font-mono text-sm">
                                          {info.transaction.invoice_no}
                                        </Link>
                                      ) : (
                                        <Text size="sm" fw={600} c="dark">-</Text>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                      <FontAwesomeIcon icon={faTicket} className="text-blue-600" size="sm" />
                                    </div>
                                    <div className="flex-1">
                                      <Text size="xs" c="dimmed">Status Pembayaran</Text>
                                      {info.transaction?.payment_status ? (
                                        <Badge
                                          size="sm"
                                          variant="filled"
                                          color={
                                            info.transaction.payment_status?.toLowerCase() === 'verified' ||
                                            info.transaction.payment_status?.toLowerCase() === 'success' ? 'green' :
                                            info.transaction.payment_status?.toLowerCase() === 'expired' ? 'red' : 'yellow'
                                          }
                                          mt={4}
                                        >
                                          {info.transaction.payment_status}
                                        </Badge>
                                      ) : (
                                        <Text size="sm" fw={600} c="dark">-</Text>
                                      )}
                                    </div>
                                  </div>
                                </Stack>
                              </Stack>
                            </Card>
                          </div>

                          {/* Identities Table */}
                          {info.transaction?.identities && (
                            <Card withBorder radius="md" p={0} shadow="sm" className="border-light-grey">
                              <div className="p-4 border-b border-light-grey bg-blue-50/50">
                                <Text size="sm" fw={700} c="blue.7">
                                  Data Pemilik Tiket
                                </Text>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                  <thead>
                                    <tr className="border-b border-light-grey bg-gray-50">
                                      <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Nama Lengkap</th>
                                      <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Email</th>
                                      <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">No. Telp</th>
                                      <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Tipe</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-light-grey">
                                    {info.transaction.identities
                                      .filter((id: any) => id.is_pemesan === 1)
                                      .map((id: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                          <td className="py-3 px-4 font-medium text-gray-900">{id.full_name}</td>
                                          <td className="py-3 px-4 text-gray-700">{id.email}</td>
                                          <td className="py-3 px-4 text-gray-700">{id.no_telp || "-"}</td>
                                          <td className="py-3 px-4">
                                            {id.is_pemesan ? (
                                              <Badge variant="light" color="blue" size="sm">
                                                Pemesan
                                              </Badge>
                                            ) : (
                                              <Badge variant="light" color="gray" size="sm">
                                                Peserta
                                              </Badge>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </Card>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <FontAwesomeIcon icon={faChair} size="3x" className="text-blue-200" />
                  </div>
                  <div>
                    <Text size="lg" fw={700} c="gray.7">Pilih Kursi</Text>
                    <Text size="sm" c="dimmed" mt="xs" className="max-w-xs mx-auto">
                      Klik salah satu nomor kursi di sebelah kiri untuk melihat laporan data pembeli yang lengkap.
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const token = req.cookies['token'];
  const userDataStr = req.cookies['user_data'];

  if (!token || !userDataStr) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  let user = null;
  try {
    user = JSON.parse(userDataStr);
  } catch (e) {
    // Invalid JSON
  }

  const creatorId = user?.has_creator?.id;
  let initialEvents: EventData[] = [];

  if (creatorId) {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_WS_URL}event-by-creator/${creatorId}?status=`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let evData = res.data?.data;
      if (!Array.isArray(evData)) {
        evData = Array.isArray(res.data) ? res.data : [];
      }
      initialEvents = evData;
    } catch (e) {
      console.error("Error fetching initial events in SSR:", e);
    }
  }

  return {
    props: {
      initialEvents,
      initialCreatorId: creatorId || null,
    }
  };
};

export default SeatReport;
