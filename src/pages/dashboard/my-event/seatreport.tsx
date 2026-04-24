import React, { useState, useEffect, useMemo } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import useLoggedUser from "@/utils/useLoggedUser";
import { Get } from "@/utils/REST";
import { Select, TextInput, Card, Flex, Stack, Text, Title, Loader, Tooltip, Pagination as MantinePagination } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronRight, faUser, faTicket, faEnvelope, faPhone, faFileInvoice, faIdBadge, faCalendarDays, faFilter, faInfoCircle, faEye } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

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

const SeatReport = () => {
  const users = useLoggedUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrx, setLoadingTrx] = useState(false);
  const [seatPage, setSeatPage] = useState(1);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedTicketName, setSelectedTicketName] = useState<string | null>(null);

  const selectedEventData = useMemo(() => {
    return events.find((e) => String(e.id) === selectedEventId);
  }, [events, selectedEventId]);

  // Determine if we should use list mode (Festival) vs grid mode (Seated)
  const isFestival = useMemo(() => {
    const categoryTickets = selectedEventData?.has_event_ticket?.filter(
      (t) => selectedCategory === "all" || t.ticket_category === selectedCategory
    );

    const hasAnySeats = categoryTickets?.some(
      (t) => (t.available_seat_number && t.available_seat_number.trim() !== "") || 
             (t.taken_seat_number && t.taken_seat_number.trim() !== "")
    );

    return !hasAnySeats;
  }, [selectedCategory, selectedEventData]);

  // 1. Initial Load: Fetch Events
  const fetchEvents = async (creatorId: number) => {
    try {
      setLoading(true);
      const res: any = await Get(`event-by-creator/${creatorId}`, { status: "" });
      if (res && res.data) {
        setEvents(res.data);
        if (res.data.length > 0) {
          setSelectedEventId(String(res.data[0].id));
        }
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
        page: pageNum,
        per_page: isFestival ? 999 : 20
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

  useEffect(() => {
    if (users?.has_creator?.id) {
      fetchEvents(users.has_creator.id);
    }
  }, [users]);

  // Refresh transactions when selected event, page, or search changes
  useEffect(() => {
    if (selectedEventId && users?.has_creator?.id) {
      // In festival mode, we fetch a large batch to handle client-side filtering/counts correctly
      // In seated mode, we still use pagination as it's more structured
      fetchTransactions(users.has_creator.id, selectedEventId, isFestival ? 1 : seatPage, debouncedSearch, isFestival ? (selectedTicketName || "") : "");
    }
  }, [selectedEventId, users, seatPage, debouncedSearch, isFestival]);

  // Reset page to 1 when event ID or search query changes
  useEffect(() => {
    setSeatPage(1);
  }, [selectedEventId, debouncedSearch, selectedTicketName]);

  // Extract all broad categories from THE SELECTED EVENT'S TICKETS AND TRANSACTIONS
  const categories = useMemo(() => {
    const cats = new Set<string>();
    
    selectedEventData?.has_event_ticket?.forEach((t) => {
      if (t.ticket_category) cats.add(t.ticket_category);
    });

    transactions.forEach((trx) => {
      trx.tickets?.forEach((t) => {
        if (t.has_event_ticket?.ticket_category) cats.add(t.has_event_ticket.ticket_category);
      });
    });

    return Array.from(cats);
  }, [selectedEventData, transactions]);

  // Auto-select and validate category + ticket name
  useEffect(() => {
    if (categories.length > 0) {
      // 1. Validate Category
      if (!selectedCategory || !categories.includes(selectedCategory) || selectedCategory === "all") {
        setSelectedCategory(categories[0]);
        setSelectedTicketName(null); // Reset when category changes
        setSelectedSeat(null);
      }
    }
  }, [categories, selectedCategory]);

  // Extract ticket types matching the selected category
  const ticketTypesInCategory = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") return [];
    
    const names = new Set<string>();
    
    // Check master data
    selectedEventData?.has_event_ticket?.forEach(t => {
      if (t.ticket_category === selectedCategory) names.add(t.name);
    });
    
    // Check transactions (failsafe)
    transactions.forEach(trx => {
      trx.tickets?.forEach(t => {
        const cat = t.has_event_ticket?.ticket_category || t.ticket_category;
        const name = t.has_event_ticket?.name || t.ticket_category;
        if (cat === selectedCategory && name) names.add(name);
      });
    });
    
    return Array.from(names);
  }, [selectedCategory, selectedEventData, transactions]);

  // Default to first ticket name when types change
  useEffect(() => {
    if (ticketTypesInCategory.length > 0 && !selectedTicketName) {
      setSelectedTicketName(ticketTypesInCategory[0]);
    }
  }, [ticketTypesInCategory, selectedTicketName]);

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
    
    // 1. Add seats from event specification (usually for seated)
    selectedEventData?.has_event_ticket?.forEach((t) => {
      if (selectedCategory !== "all" && t.ticket_category !== selectedCategory) return;

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
      if (selectedCategory !== "all" && tCategory !== selectedCategory) return;
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
  const itemsPerPage = 20;
  const filteredFestivalTransactions = useMemo(() => {
    if (!isFestival) return [];
    return transactions.filter(trx => 
      !selectedTicketName || trx.tickets.some(t => (t.has_event_ticket?.name || t.ticket_category) === selectedTicketName)
    );
  }, [transactions, selectedTicketName, isFestival]);

  const totalFestivalPages = Math.ceil(filteredFestivalTransactions.length / itemsPerPage);
  
  const paginatedFestivalTransactions = useMemo(() => {
    const start = (seatPage - 1) * itemsPerPage;
    return filteredFestivalTransactions.slice(start, start + itemsPerPage);
  }, [filteredFestivalTransactions, seatPage]);

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

      {/* Standard Filter Bar */}
      <Card withBorder radius="md" p="md" shadow="sm">
        <Flex gap="md" align="flex-end" wrap="wrap">
          <Select
            label="Pilih Event"
            placeholder="Pilih Event"
            value={selectedEventId}
            onChange={(val) => {
              if (val) {
                setSelectedEventId(val);
                setSelectedSeat(null);
                setSelectedCategory("all");
                setSelectedStatus("all");
              }
            }}
            data={events.map((evt) => ({ value: String(evt.id), label: evt.name }))}
            style={{ flex: 1, minWidth: 200 }}
            searchable
          />

          <Select
            label="Category Ticket"
            placeholder="Pilih Category"
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val || categories[0])}
            data={categories.map(cat => ({ 
              value: cat, 
              label: cat.toLowerCase() === "seated" ? "Seatmap" : cat 
            }))}
            style={{ flex: 1, minWidth: 180 }}
          />

          <Select
            label="Status"
            placeholder="Semua Status"
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val || "all")}
            data={[{ value: "all", label: "Semua Status" }, ...statuses.map(stat => ({ value: stat, label: stat }))]}
            style={{ flex: 1, minWidth: 150 }}
            leftSection={<FontAwesomeIcon icon={faFilter} size="xs" />}
          />

          <TextInput
            label="Cari Nama / Seat"
            placeholder="Cari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
            style={{ flex: 1.5, minWidth: 250 }}
          />
        </Flex>
      </Card>

      {/* Content Area */}
      <div className="flex flex-col md:flex-row gap-6 relative">
        {loadingTrx && (
           <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-2xl">
              <Loader size="md" />
           </div>
        )}
        
        {/* Left Column: Seat List (25%) */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-light-grey overflow-hidden shadow-sm flex flex-col h-[70vh]">
            <div className="bg-primary-base p-4 text-white font-bold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{isFestival ? "Tiket Festival" : "Seat Number"}</span>
                <Tooltip label={isFestival ? "Abu-abu = Terjual, Biru Terang = Tersedia" : "Abu-abu = Terisi, Biru Terang = Tersedia"} position="top" withArrow>
                  <FontAwesomeIcon icon={faInfoCircle} className="cursor-help text-sm opacity-80 hover:opacity-100" />
                </Tooltip>
              </div>
              {selectedSeat && (
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" title="Seat Selected"></div>
              )}
            </div>
            <div className="flex-grow overflow-y-auto p-2 scrollbar-hide">
              {isFestival ? (
                /* FESTIVAL MODE: List of Ticket Names */
                <div className="flex flex-col gap-2">
                  {ticketTypesInCategory.length > 0 ? (
                    ticketTypesInCategory.map((tName) => {
                      const isSelected = selectedTicketName === tName;
                      // Calculate total sold for this specific ticket name from the current transaction list
                      // This ensures the count is always accurate regardless of master data state
                      const countBought = transactions.reduce((acc, trx) => {
                        const matchingTickets = trx.tickets.filter(t => (t.has_event_ticket?.name || t.ticket_category) === tName);
                        // Using qty_ticket if available, else counting items
                        const qtyBought = matchingTickets.reduce((q, t) => q + (t.qty_ticket || 1), 0);
                        return acc + qtyBought;
                      }, 0);

                      return (
                        <button
                          key={tName}
                          onClick={() => {
                            setSelectedTicketName(tName);
                            setSelectedSeat(null); // Back to table view
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
              ) : (
                /* SEATED MODE: Original Grid/List of individual seats */
                filteredSeats.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {filteredSeats.map((seat) => {
                      const isBought = !!seatMap[seat];
                      const isSelected = selectedSeat === seat;
                      return (
                        <button
                          key={seat}
                          onClick={() => setSelectedSeat(seat)}
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
                )
              )}
            </div>
            {isFestival && (
              <div className="p-3 border-t border-light-grey bg-white text-center">
                <Text size="xs" c="dimmed">Menampilkan jenis tiket tersedia</Text>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Buyer Details (75%) */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-2xl border border-light-grey shadow-sm min-h-[70vh] flex flex-col overflow-hidden">
            <div className="bg-white border-b border-light-grey p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {isFestival && selectedSeat && (
                  <button 
                    onClick={() => setSelectedSeat(null)}
                    className="text-primary-base hover:text-primary-dark font-bold text-sm flex items-center gap-2 border border-primary-base px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="rotate-180" />
                    Kembali
                  </button>
                )}
                <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                  <FontAwesomeIcon icon={faIdBadge} className="text-primary-base" />
                  {isFestival && !selectedSeat ? `DAFTAR TRANSAKSI: ${selectedTicketName}` : "LAPORAN PEMESAN"}
                  {selectedSeat && <span className="text-primary-base ml-2">[{selectedSeat}]</span>}
                </h2>
              </div>
            </div>

            <div className="p-6 flex-grow overflow-y-auto bg-[#fafafa]/50">
              {isFestival && !selectedSeat ? (
                /* FESTIVAL MODE: Table of Transactions */
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-light-grey overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-primary-light border-b border-light-grey text-primary-dark">
                            <th className="p-4 font-bold">Invoice</th>
                            <th className="p-4 font-bold">Nama Pemesan</th>
                            <th className="p-4 font-bold">Jenis Tiket</th>
                            <th className="p-4 font-bold">Email</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-grey">
                          {paginatedFestivalTransactions.map((trx) => {
                               // Find the specific seat identifier for this transaction to use as the selection key
                               const seatId = Object.keys(seatMap).find(k => seatMap[k].transaction.id === trx.id);
                              
                              return (
                                <tr key={trx.id} className="hover:bg-primary-light/10 transition-colors">
                                  <td className="p-4 font-mono font-semibold text-primary-base">{trx.invoice_no}</td>
                                  <td className="p-4 font-medium text-dark">{trx.has_user?.name || "-"}</td>
                                  <td className="p-4 font-medium text-primary-base">
                                    {trx.tickets
                                      .filter(t => !selectedTicketName || (t.has_event_ticket?.name || t.ticket_category) === selectedTicketName)
                                      .map(t => t.has_event_ticket?.name || t.ticket_category)
                                      .join(", ")}
                                  </td>
                                  <td className="p-4 text-grey">{trx.has_user?.email || "-"}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
                                      trx.payment_status?.toLowerCase() === 'verified' || trx.payment_status?.toLowerCase() === 'success' ? 'bg-green-500' :
                                      trx.payment_status?.toLowerCase() === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}>
                                      {trx.payment_status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <Tooltip label="View Detail" withArrow position="top">
                                      <button 
                                        onClick={() => seatId && setSelectedSeat(seatId)}
                                        className="bg-primary-base text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-dark transition-colors shadow-sm mx-auto"
                                      >
                                        <FontAwesomeIcon icon={faEye} size="sm" />
                                      </button>
                                    </Tooltip>
                                  </td>
                                </tr>
                              );
                          })}
                          {paginatedFestivalTransactions.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-10 text-center text-grey">
                                <FontAwesomeIcon icon={faTicket} size="2x" className="opacity-10 mb-2 block mx-auto" />
                                Tidak ada transaksi untuk jenis tiket ini.
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
                      total={isFestival ? Math.max(1, totalFestivalPages) : Math.max(1, apiTotalPages)} 
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

export default SeatReport;
