import React, { useState, useEffect, useMemo } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import { useDebouncedValue } from "@mantine/hooks";
import useLoggedUser from "@/utils/useLoggedUser";
import { Get } from "@/utils/REST";
import { Select, TextInput, Card, Flex, Stack, Text, Title, Loader, Tooltip, Pagination as MantinePagination, Badge, Box, Divider, Button, Group, ActionIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronRight, faUser, faTicket, faEnvelope, faPhone, faFileInvoice, faIdBadge, faCalendarDays, faFilter, faInfoCircle, faEye, faChair, faFileExcel, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import moment from "moment";
import * as XLSX from "xlsx";

// Style helpers for consistency with report.tsx
const headerStyle = (active = false, dir = "asc"): React.CSSProperties => ({
  padding: '12px 14px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 700,
  color: '#777',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  cursor: 'pointer',
});

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
  seatmap?: string | null;
  has_event_ticket?: {
    id: number;
    ticket_category: string;
    available_seat_number: string | null;
    taken_seat_number: string | null;
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

  // Reset page to 1 when event ID or search query changes
  useEffect(() => {
    setSeatPage(1);
  }, [selectedEventId, debouncedSearch, selectedTicketName]);

  // Group categories into broader 'seated' and 'festival' groups
  const categoryGroups = useMemo(() => {
    const seated = new Set<string>();
    const festival = new Set<string>();
    
    selectedEventData?.has_event_ticket?.forEach((t) => {
      const hasSeats = (t.available_seat_number && t.available_seat_number.trim() !== "") || 
                      (t.taken_seat_number && t.taken_seat_number.trim() !== "");
      if (hasSeats) {
        seated.add(t.ticket_category);
      } else {
        festival.add(t.ticket_category);
      }
    });

    return {
      seated: Array.from(seated),
      festival: Array.from(festival)
    };
  }, [selectedEventData]);

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

        seats.forEach((s) => {
          map[s] = {
            transaction: trx,
            ticket: t,
          };
        });
      });
    });

    return map;
  }, [transactions]);

  // All seat numbers for the sidebar: SOURCED FROM EVENT TICKETS + TRANSACTIONS
  const allSeats = useMemo(() => {
    const seatsSet = new Set<string>();
    
    // 1. Add seats from event specification
    const targetCategories = selectedCategory === "seated" ? categoryGroups.seated : categoryGroups.festival;
    
    selectedEventData?.has_event_ticket?.forEach((t) => {
      if (!targetCategories.includes(t.ticket_category)) return;

      const available = t.available_seat_number?.split(",") || [];
      const taken = t.taken_seat_number?.split(",") || [];
      
      [...available, ...taken].forEach((s) => {
        const cleaned = s.trim();
        if (cleaned) seatsSet.add(cleaned);
      });
    });

    // 2. Add seats from actual transactions
    Object.keys(seatMap).forEach((seat) => {
      const ticketInfo = seatMap[seat];
      const tCategory = ticketInfo.ticket.has_event_ticket?.ticket_category || ticketInfo.ticket.ticket_category;
      if (!targetCategories.includes(tCategory)) return;
      seatsSet.add(seat);
    });
    
    return Array.from(seatsSet).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
  }, [selectedEventData, selectedCategory, seatMap]);

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

  const selectedSeatInfo = selectedSeat ? seatMap[selectedSeat] : null;



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
      {/* Header Title - Standard like Report Event */}
      <Stack gap={2} mb="xl">
        <Title order={1} size="h2" className="font-bold tracking-tight text-[#1a1c1e]">
          Sales Report
        </Title>
        <Text size="sm" c="dimmed">
          Laporan penjualan dan data pemesan per kategori tiket atau nomor kursi.
        </Text>
      </Stack>

      {/* Standard Global Filter Bar */}
      <Card withBorder radius="md" p="md" shadow="sm">
        <Flex justify="flex-end" align="center" wrap="wrap" gap="md">
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
            style={{ width: 220 }}
            searchable
            clearable
            size="sm"
          />

          <Select
            placeholder="Category Ticket"
            value={selectedCategory}
            onChange={(val) => {
               setSelectedCategory(val || categories[0]);
               setSelectedTicketName(null);
            }}
            data={categories.map(cat => ({ 
              value: cat, 
              label: cat === "seated" ? "Seatmap" : "Festival" 
            }))}
            style={{ width: 180 }}
            size="sm"
          />

          <Select
            placeholder="Semua Status"
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val || "all")}
            data={[{ value: "all", label: "Semua Status" }, ...statuses.map(stat => ({ value: stat, label: stat }))]}
            style={{ width: 160 }}
            leftSection={<FontAwesomeIcon icon={faFilter} size="sm" />}
            size="sm"
          />

          <TextInput
            placeholder="Cari Nama / Invoice / Seat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<FontAwesomeIcon icon={faSearch} size="sm" />}
            style={{ width: 250 }}
            size="sm"
          />

          <Tooltip label="Refresh Data">
            <ActionIcon
              variant="light"
              color="gray"
              onClick={() => users?.has_creator?.id && fetchTransactions(users.has_creator.id, selectedEventId, 1, debouncedSearch)}
              size="lg"
              radius="xl"
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </ActionIcon>
          </Tooltip>
        </Flex>
      </Card>

      {/* Content Area */}
      <div className="flex flex-col md:flex-row gap-6 relative">
        {loadingTrx && (
           <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-2xl">
              <Loader size="md" />
           </div>
        )}
        
        {/* Left Column: Seat List (Visible in Grid mode) */}
        {!isFestival && (
          <div className="w-full md:w-1/4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-light-grey overflow-hidden shadow-sm flex flex-col h-[70vh]">
              <div className="bg-white border-b border-light-grey p-4 text-dark font-bold flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faChair} className="text-primary-base text-sm" />
                    <span>Seat Number</span>
                  </div>
                  {selectedSeat && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" title="Seat Selected"></div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-normal mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-grey border border-grey"></div>
                    <span className="text-grey">Terisi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-white border border-light-grey"></div>
                    <span className="text-grey">Tersedia</span>
                  </div>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-2 scrollbar-hide">
                {filteredSeats.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {filteredSeats.map((seat) => {
                      const isBought = !!seatMap[seat];
                      const isSelected = selectedSeat === seat;
                      return (
                        <button
                          key={seat}
                          onClick={() => {
                            setSelectedSeat(seat);
                            setSeatViewMode("grid");
                          }}
                          className={`
                            transition-all duration-200 border p-3 rounded-lg text-sm font-medium
                            ${
                              isSelected
                                ? "bg-primary-base text-white border-primary-base shadow-md transform scale-105 z-10"
                                : isBought
                                ? "bg-grey text-white border-grey hover:bg-dark-grey hover:border-dark-grey"
                                : "bg-white text-primary-base border-light-grey hover:border-primary-base"
                            }
                          `}
                        >
                          <span className="truncate flex-1">{seat}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-grey gap-2 text-center p-4">
                    <FontAwesomeIcon icon={faTicket} size="2x" className="opacity-20" />
                    <p className="text-sm font-medium">Tidak ada seat ditemukan untuk filter ini</p>
                  </div>
                )}
              </div>
            </div>
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
        <div className={`w-full md:w-3/4`}>
          <div className="bg-white rounded-2xl border border-light-grey shadow-sm min-h-[70vh] flex flex-col overflow-hidden">
            <div className="bg-white border-b border-light-grey p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {selectedSeat && (
                  <button 
                    onClick={() => setSelectedSeat(null)}
                    className="text-dark hover:text-primary-dark font-bold text-sm flex items-center gap-2 border border-light-grey px-3 py-1.5 rounded-lg transition-colors mr-2"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="rotate-180" size="xs" />
                    Kembali
                  </button>
                )}
                <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                  <FontAwesomeIcon icon={faIdBadge} className="text-primary-base" />
                  {(isFestival || seatViewMode === "table") && !selectedSeat ? `Daftar Transaksi: ${selectedTicketName || 'Semua'}` : "Laporan Pemesan"}
                  {selectedSeat && <span className="text-primary-base ml-2">[{selectedSeat}]</span>}
                </h2>
              </div>
              {!isFestival && (
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
                  rightSectionProps={{ style: { color: '#F5FAFF' } }}
                  styles={{
                    input: {
                      backgroundColor: '#194E9E',
                      color: '#F5FAFF',
                      borderColor: '#194E9E',
                      fontWeight: 800,
                      borderRadius: '100px',
                      '&::placeholder': {
                        color: '#F5FAFF',
                        opacity: 0.7,
                      },
                    },
                  }}
                />
              )}
            </div>

            {/* Quick Filter inside Card */}
            {(isFestival || seatViewMode === "table") && !selectedSeat && (
              <div className="px-4 py-3 bg-gray-50 border-b border-light-grey flex justify-between items-center gap-4">
                <Text size="sm" fw={600} c="dimmed">Filter Cepat:</Text>
                <Flex gap="sm" align="center">
                  <Select
                    placeholder="Semua Tiket"
                    value={selectedTicketName}
                    onChange={(val) => setSelectedTicketName(val)}
                    data={ticketTypesInCategory.map(t => ({ value: t, label: t }))}
                    size="xs"
                    style={{ width: 180 }}
                    clearable
                  />
                  <Select
                    placeholder="Semua Status"
                    value={selectedStatus}
                    onChange={(val) => setSelectedStatus(val || "all")}
                    data={[{ value: "all", label: "Semua Status" }, ...statuses.map(stat => ({ value: stat, label: stat }))]}
                    size="xs"
                    style={{ width: 140 }}
                  />
                  <Button
                    variant="filled"
                    color="green"
                    leftSection={<FontAwesomeIcon icon={faFileExcel} />}
                    onClick={handleExportExcel}
                    size="xs"
                    radius="md"
                  >
                    Export Excel
                  </Button>
                </Flex>
              </div>
            )}

            <div className="p-6 flex-grow overflow-y-auto bg-[#fafafa]/50">
              {(isFestival || seatViewMode === "table") && !selectedSeat ? (
                /* FESTIVAL MODE: Table of Transactions */
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-light-grey overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full w-max text-left text-sm">
                        <thead>
                          <tr style={{ backgroundColor: "#f5f7fa", borderBottom: "2px solid #e8e8e8" }}>
                            <th style={headerStyle()}>NO</th>
                            <th onClick={() => handleSort('invoice')} style={headerStyle(sortBy === 'invoice', sortDir)}>
                              INVOICE {sortBy === 'invoice' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('nama')} style={headerStyle(sortBy === 'nama', sortDir)}>
                              NAMA PEMESAN {sortBy === 'nama' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th style={headerStyle()}>JENIS TIKET</th>
                            <th style={headerStyle()}>NO. SEAT</th>
                            <th onClick={() => handleSort('email')} style={headerStyle(sortBy === 'email', sortDir)}>
                              EMAIL {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('status')} style={headerStyle(sortBy === 'status', sortDir)}>
                              STATUS {sortBy === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th style={{ ...headerStyle(), textAlign: 'center', position: 'sticky', right: 0, backgroundColor: '#f5f7fa', zIndex: 2, boxShadow: '-2px 0 5px rgba(0,0,0,0.07)' }}>AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-grey">
                          {paginatedFestivalTransactions.map((trx, index) => {
                               // Find the specific seat identifier for this transaction to use as the selection key
                               const seatId = Object.keys(seatMap).find(k => seatMap[k].transaction.id === trx.id);
                               
                              return (
                                <tr 
                                  key={trx.id} 
                                  className="hover:bg-primary-light/10 transition-colors"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => seatId && setSelectedSeat(seatId)}
                                >
                                  <td className="p-4 font-medium text-dark">{(seatPage - 1) * itemsPerPage + index + 1}</td>
                                  <td className="p-4 font-mono font-semibold text-primary-base whitespace-nowrap">{trx.invoice_no}</td>
                                  <td className="p-4 font-medium text-dark whitespace-nowrap">{trx.has_user?.name || "-"}</td>
                                  <td className="p-4 font-medium text-primary-base whitespace-nowrap">
                                    <Badge variant="light" size="sm">
                                      {trx.tickets
                                        .filter(t => !selectedTicketName || (t.has_event_ticket?.name || t.ticket_category) === selectedTicketName)
                                        .map(t => t.has_event_ticket?.name || t.ticket_category)
                                        .join(", ")}
                                    </Badge>
                                  </td>
                                  <td className="p-4 font-bold text-primary-base whitespace-nowrap">
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
                                  <td className="p-4 text-grey whitespace-nowrap">{trx.has_user?.email || "-"}</td>
                                  <td className="p-4 whitespace-nowrap">
                                    <Badge
                                      size="sm"
                                      variant="filled"
                                      color={
                                        trx.payment_status?.toLowerCase() === 'verified' || trx.payment_status?.toLowerCase() === 'success' ? 'green' :
                                        trx.payment_status?.toLowerCase() === 'expired' ? 'red' : 'yellow'
                                      }
                                    >
                                      <span className="whitespace-nowrap">{trx.payment_status}</span>
                                    </Badge>
                                  </td>
                                  <td className="p-4 text-center sticky right-0 bg-white z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.06)]">
                                    <Tooltip label="View Detail" withArrow position="top">
                                      <ActionIcon 
                                        variant="light" 
                                        color="blue"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          seatId && setSelectedSeat(seatId);
                                        }}
                                      >
                                        <FontAwesomeIcon icon={faEye} size="sm" />
                                      </ActionIcon>
                                    </Tooltip>
                                  </td>
                                </tr>
                              );
                          })}
                          {paginatedFestivalTransactions.length === 0 && (
                            <tr>
                              <td colSpan={8} className="p-16">
                                <Flex direction="column" align="center" justify="center" gap="xs">
                                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-1">
                                    <FontAwesomeIcon icon={faTicket} size="2x" className="text-gray-200" />
                                  </div>
                                  <Text fw={600} c="gray.5" size="sm">Tidak ada transaksi ditemukan</Text>
                                  <Text c="gray.4" size="xs">Coba gunakan kata kunci lain atau sesuaikan filter Anda</Text>
                                </Flex>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Pagination for the table */}
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
                </div>
              ) : selectedSeatInfo ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Summary Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-light-grey shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-grey uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-primary-base" />
                        Informasi Pemesan
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-base">
                            <FontAwesomeIcon icon={faUser} size="xs" />
                          </div>
                          <div>
                            <p className="text-xs text-grey">Nama Pemesan</p>
                            <p className="font-semibold text-dark">{selectedSeatInfo.transaction.has_user?.name || "-"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-base">
                            <FontAwesomeIcon icon={faEnvelope} size="xs" />
                          </div>
                          <div>
                            <p className="text-xs text-grey">Email Pemesan</p>
                            <p className="font-semibold text-dark">{selectedSeatInfo.transaction.has_user?.email || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-light-grey shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-grey uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileInvoice} className="text-primary-base" />
                        Detail Transaksi
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-base">
                            <FontAwesomeIcon icon={faChevronRight} size="xs" />
                          </div>
                          <div>
                            <p className="text-xs text-grey">Invoice No</p>
                            <Link href={`/success/${selectedSeatInfo.transaction.invoice_no}`} className="text-primary-base hover:underline font-semibold font-mono">
                              {selectedSeatInfo.transaction.invoice_no}
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-base">
                            <FontAwesomeIcon icon={faChevronRight} size="xs" />
                          </div>
                          <div>
                            <p className="text-xs text-grey">Status Pembayaran</p>
                            <span
                              className={`
                                inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white
                                ${(() => {
                                  const status = selectedSeatInfo.transaction.payment_status?.toLowerCase();
                                  if (status === "verified" || status === "success") return "bg-green-500";
                                  if (status === "expired") return "bg-red-500";
                                  if (status === "pending") return "bg-yellow-500";
                                  return "bg-gray-500";
                                })()}
                              `}
                            >
                              {selectedSeatInfo.transaction.payment_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Identities Table */}
                  <div className="bg-white rounded-xl border border-light-grey overflow-hidden shadow-sm">
                    <div className="bg-primary-light p-4 border-b border-light-grey">
                      <h3 className="text-sm font-bold text-primary-base flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} />
                        Data Pemilik Tiket
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-white border-b border-light-grey text-grey">
                            <th className="p-4 font-bold">Nama Lengkap</th>
                            <th className="p-4 font-bold">Email</th>
                            <th className="p-4 font-bold">No. Telp</th>
                            <th className="p-4 font-bold">Tipe</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-grey">
                          {selectedSeatInfo.transaction.identities
                            .filter((id) => id.is_pemesan === 1)
                            .map((id, idx) => (
                            <tr key={idx} className="hover:bg-primary-light/30 transition-colors">
                              <td className="p-4 font-medium text-dark">{id.full_name}</td>
                              <td className="p-4 text-dark">{id.email}</td>
                              <td className="p-4 text-dark">{id.no_telp || "-"}</td>
                              <td className="p-4">
                                {id.is_pemesan ? (
                                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                    Pemesan
                                  </span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                    Peserta
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-grey gap-4 text-center">
                  <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center text-primary-base opacity-50">
                    <FontAwesomeIcon icon={faSearch} size="3x" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark">Pilih {isFestival ? "Transaksi" : "Seat Number"}</h3>
                    <p className="text-sm max-w-xs mx-auto">Klik salah satu {isFestival ? "transaksi" : "nomor kursi"} di sebelah kiri untuk melihat laporan data pembeli yang lengkap.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
