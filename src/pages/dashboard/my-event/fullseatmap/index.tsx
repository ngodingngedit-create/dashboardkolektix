import React, { useState, useEffect, useMemo, useRef, memo, useDeferredValue, useCallback } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import { useClickOutside } from "@mantine/hooks";
import useLoggedUser from "@/utils/useLoggedUser";
import { Get } from "@/utils/REST";
import {
  Select,
  TextInput,
  Card,
  Flex,
  Stack,
  Text,
  Title,
  Loader,
  Tooltip,
  Box,
  Button,
  ActionIcon,
  Center,
  Modal
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowsRotate,
  faExpand,
  faCompress,
  faPlus,
  faMinus,
  faInfoCircle,
  faUser,
  faTicket,
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react";
import chunk from "@/utils/chunk";
import { SeatmapData } from "@/utils/formInterface";

// Interfaces copied from seatreport.tsx for consistency
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
  seatnumber_ticket: string | string[];
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

// ─── React.memo SeatBox ───────────────────────────────────────────────────────
interface SeatBoxProps {
  seatNumber: string;
  displaySeatNumber: string;
  isBought: boolean;
  areaColor?: string;
  isDimmed: boolean;
  isHighlighted: boolean;
  onSeatClick: (seatNumber: string) => void;
}

const SeatBox = memo(function SeatBox({
  seatNumber,
  displaySeatNumber,
  isBought,
  areaColor,
  isDimmed,
  isHighlighted,
  onSeatClick,
}: SeatBoxProps) {
  const bgColor = isBought ? (areaColor || "#adb5bd") : "#e9ecef";
  const borderColor = isBought ? "rgba(250,250,250,0.18)" : "#d0d0d0";

  return (
    <Box
      component="button"
      type="button"
      onClick={() => isBought && onSeatClick(seatNumber)}
      title={`Seat: ${displaySeatNumber}${isBought ? " (Terjual - Klik untuk detail)" : " (Tersedia)"}`}
      w={20}
      h={25}
      className={`rounded-sm relative overflow-hidden transition-all duration-200 ${isBought ? "cursor-pointer" : "cursor-default"}`}
      style={{
        opacity: isDimmed ? 0.2 : 1,
        transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
        zIndex: isHighlighted ? 100 : 1,
        minWidth: "20px",
        minHeight: "25px",
        flexShrink: 0,
        padding: 0,
        border: 'none',
        background: 'transparent',
        outline: isHighlighted ? '1.5px solid white' : 'none',
        outlineOffset: '-1px',
        boxShadow: isHighlighted ? '0 0 8px rgba(0,0,0,0.4)' : 'none',
        contain: 'layout style paint',
      }}
    >
      {/* Seat body */}
      <Box
        className="relative z-10 rounded-sm"
        style={{
          marginTop: '5px',
          height: 'calc(100% - 10px)',
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          contain: 'strict',
        }}
      >
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '6px', fontWeight: 700, color: isBought ? 'white' : '#868e96', textTransform: 'uppercase', lineHeight: 1 }}>
            {displaySeatNumber}
          </span>
        </div>
      </Box>

      {/* Top arch */}
      <Box
        className="absolute top-0 left-2/4 -translate-x-2/4 rounded-sm"
        style={{
          width: '70%',
          height: '7px',
          backgroundColor: bgColor,
          border: isBought ? 'none' : `1px solid ${borderColor}`,
          contain: 'strict',
        }}
      />
    </Box>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

const FullSeatmapReport = ({ initialEvents, initialCreatorId }: Props) => {
  const users = useLoggedUser();
  const [events, setEvents] = useState<EventData[]>(initialEvents || []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrx, setLoadingTrx] = useState(false);

  const [selectedSeatTrx, setSelectedSeatTrx] = useState<Transaction | null>(null);
  const [selectedSeatTicket, setSelectedSeatTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState<string>(initialEvents && initialEvents.length > 0 ? String(initialEvents[0].id) : "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // useDeferredValue keeps the UI responsive while search updates lag behind
  const deferredSearch = useDeferredValue(searchQuery);

  // Seatmap state
  const [scale, setScale] = useState(1);
  const [canvasPos, setCanvasPos] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const selectedEventData = useMemo(() => {
    return events.find((e) => String(e.id) === selectedEventId);
  }, [events, selectedEventId]);

  const seatmapData = useMemo<SeatmapData[]>(() => {
    if (!selectedEventData?.seatmap) return [];
    try {
      const parsed = typeof selectedEventData.seatmap === 'string'
        ? JSON.parse(selectedEventData.seatmap)
        : selectedEventData.seatmap;
      return (Array.isArray(parsed) ? parsed : []).map((e: any) => {
        const validRow = Number.isInteger(Number(e.row)) ? Number(e.row) : 1;
        const validCol = Number.isInteger(Number(e.col)) ? Number(e.col) : 1;
        const startingSeat = Number.isInteger(Number(e.starting_seat)) ? Number(e.starting_seat) : 1;

        const seat = validCol > 0 ? chunk(
          Array(Math.max(0, validRow * validCol))
            .fill(0)
            .map((_, i) => `${e.is_show_code !== false ? e.prefix ?? "" : ""}${i + startingSeat}`),
          validCol
        ) : [];
        return { ...e, seat, type: e?.type ?? "seat" };
      });
    } catch (e) {
      console.error("Error parsing seatmap:", e);
      return [];
    }
  }, [selectedEventData]);

  // Fetch Transactions
  const fetchTransactions = async (creatorId: number, eventId: string) => {
    if (!eventId || eventId === "all") {
      setTransactions([]);
      return;
    }
    try {
      setLoadingTrx(true);
      const params = {
        creator_id: creatorId,
        event_id: eventId,
        per_page: 999999
      };
      const res: any = await Get(`list-transaction-by-event`, params);
      const listData = Array.isArray(res?.data) ? res.data : (res?.data?.data ? res.data.data : []);
      setTransactions(listData);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    } finally {
      setLoadingTrx(false);
    }
  };

  useEffect(() => {
    if (selectedEventId && users?.has_creator?.id) {
      fetchTransactions(users.has_creator.id, selectedEventId);
    }
  }, [selectedEventId, users]);

  const ticketNameToSessionName = useMemo(() => {
    const map = new Map<string, string>();
    transactions.forEach(trx => {
      trx.tickets.forEach((t: any) => {
        if (t.has_event_ticket?.name && t.event_session?.session_name) {
          map.set(t.has_event_ticket.name, t.event_session.session_name);
        }
      });
    });
    return map;
  }, [transactions]);

  const availableSessions = useMemo(() => {
    const sessions = new Set<string>();
    transactions.forEach((trx) => {
      trx.tickets.forEach((t: any) => {
        if (t.event_session?.session_name) {
          sessions.add(t.event_session.session_name);
        }
      });
    });
    return ["all", ...Array.from(sessions)];
  }, [transactions]);

  // Process transactions into a seat map for quick local lookup
  const seatToBuyerMap = useMemo(() => {
    const map: Record<string, { transaction: Transaction; ticket: Ticket }> = {};
    const isSessionFiltered = selectedSession !== "all";

    transactions.forEach((trx) => {
      trx.tickets.forEach((t: any) => {
        if (isSessionFiltered && t.event_session?.session_name !== selectedSession) {
          return;
        }

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
            if (typeof t.seatnumber_ticket === "string") seats = [t.seatnumber_ticket];
          }
        }
        for (let i = 0; i < seats.length; i++) {
          map[seats[i]] = { transaction: trx, ticket: t };
        }
      });
    });
    return map;
  }, [transactions, selectedSession]);

  const fetchSeatTransactionDetail = useCallback((seatNumber: string) => {
    const info = seatToBuyerMap[seatNumber];
    if (info) {
      setSelectedSeatTrx(info.transaction);
      setSelectedSeatTicket(info.ticket);
      setIsModalOpen(true);
    } else {
      console.warn("Transaction detail for seat not found locally");
    }
  }, [seatToBuyerMap]);

  const takenSeatsFromAPI = useMemo(() => {
    const seats = new Set<string>();
    const isSessionFiltered = selectedSession !== "all";

    selectedEventData?.has_event_ticket?.forEach((t: any) => {
      const sessionName = ticketNameToSessionName.get(t.name);

      if (isSessionFiltered) {
        if (sessionName && sessionName !== selectedSession) return;
        if (!sessionName && !t.name?.includes(selectedSession)) return;
      }

      if (t.taken_seat_number) {
        const parts = String(t.taken_seat_number).split(",");
        for (let i = 0; i < parts.length; i++) {
          const s = parts[i].trim();
          if (s) seats.add(s);
        }
      }
    });
    return seats;
  }, [selectedEventData, selectedSession, ticketNameToSessionName]);

  // Handle Zoom and Pan
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    document.body.style.overflow = "hidden";

    let currentScale = scale;
    const scalingValue = 0.1;

    if (event.deltaY > 0 && currentScale > 0.2) {
      currentScale -= scalingValue;
    } else if (event.deltaY < 0 && currentScale < 5) {
      currentScale += scalingValue;
    }

    setScale(currentScale);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      document.body.style.overflow = "";
      scrollTimeout.current = null;
    }, 500);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setCanvasPos([
        canvasPos[0] + event.movementX / scale,
        canvasPos[1] + event.movementY / scale
      ]);
    }
  };

  const ticketCategories = useMemo(() => {
    const list: string[] = [];
    const isSessionFiltered = selectedSession !== "all";

    selectedEventData?.has_event_ticket?.forEach((t: any) => {
      const sessionName = ticketNameToSessionName.get(t.name);
      if (isSessionFiltered) {
        if (sessionName && sessionName !== selectedSession) return;
        if (!sessionName && !t.name?.includes(selectedSession)) return;
      }
      if (t.name) list.push(t.name);
    });
    return ["all", ...Array.from(new Set(list))];
  }, [selectedEventData, selectedSession, ticketNameToSessionName]);

  // Parse seat lookup condition once for all seats
  const seatFilter = useMemo(() => {
    const hasCategoryFilter = selectedCategory !== "all";
    const hasSearch = deferredSearch !== "";
    const lowerSearch = deferredSearch.toLowerCase();
    return { hasCategoryFilter, hasSearch, lowerSearch };
  }, [selectedCategory, deferredSearch]);

  // Memoized callback for seat click to stabilize reference
  const handleSeatClick = useCallback((seatNumber: string) => {
    fetchSeatTransactionDetail(seatNumber);
  }, [fetchSeatTransactionDetail]);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <Stack gap={2} mb="xl">
        <Title order={1} size="h2" className="font-bold tracking-tight text-[#1a1c1e]">
          Seatmap Report
        </Title>
        <Text size="sm" c="dimmed">
          Visualisasi denah kursi dan status pembelian secara real-time.
        </Text>
      </Stack>

      {/* Filter Bar */}
      <Card withBorder radius="md" p="md" shadow="sm">
        <Flex justify="flex-end" align="center" wrap="wrap" gap="md">
          <Select
            value={selectedEventId}
            data={events.map((evt) => ({ value: String(evt.id), label: evt.name }))}
            onChange={(val) => {
              if (val) {
                setSelectedEventId(val);
                setSelectedSession("all");
              }
            }}
            placeholder="Pilih Event"
            style={{ width: 220 }}
            searchable
            clearable
            size="sm"
          />

          {availableSessions.length > 1 && (
            <Select
              placeholder="Sesi"
              value={selectedSession}
              onChange={(val) => setSelectedSession(val || "all")}
              data={availableSessions.map(sess => ({
                value: sess,
                label: sess === "all" ? "Semua Sesi" : sess
              }))}
              style={{ width: 180 }}
              size="sm"
            />
          )}

          <Select
            placeholder="Kategori Tiket"
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val || "all")}
            data={ticketCategories.map(cat => ({
              value: cat,
              label: cat === "all" ? "Semua Tiket" : cat
            }))}
            style={{ width: 180 }}
            leftSection={<FontAwesomeIcon icon={faTicket} size="sm" />}
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
              onClick={() => window.location.reload()}
              size="lg"
              radius="xl"
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </ActionIcon>
          </Tooltip>
        </Flex>
      </Card>

      {/* Canvas Area */}
      <Card
        withBorder
        radius="md"
        p={0}
        h="70vh"
        className="overflow-hidden relative bg-gray-50"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        {loadingTrx && (
          <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
            <Loader size="md" />
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 left-4 z-40 bg-white/90 backdrop-blur p-3 rounded-lg border border-light-grey shadow-sm space-y-2">
          <Text size="xs" fw={700} mb={4}>Legenda:</Text>
          <Flex align="center" gap={8}>
            <Box w={12} h={12} bg="gray.2" className="rounded-sm border border-gray-400" />
            <Text size="xs">Tersedia</Text>
          </Flex>
          <Flex align="center" gap={8}>
            <Box w={12} h={12} bg="gray.5" className="rounded-sm" />
            <Text size="xs">Terjual</Text>
          </Flex>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
          <Tooltip label="Download Seatmap" position="left">
            <ActionIcon color="white" bg="white" variant="default" onClick={() => {
              if (canvasWrapRef.current) {
                import('html-to-image').then(({ toPng }) => {
                  toPng(canvasWrapRef.current!, { cacheBust: true })
                    .then((dataUrl) => {
                      const link = document.createElement('a');
                      link.download = `seatmap-${selectedEventData?.name || 'event'}.png`;
                      link.href = dataUrl;
                      link.click();
                    })
                    .catch((err) => {
                      console.error('Error downloading image', err);
                    });
                }).catch(err => console.error("Failed to load html-to-image", err));
              }
            }}>
              <FontAwesomeIcon icon={faDownload} className="text-gray-600" />
            </ActionIcon>
          </Tooltip>
          <ActionIcon color="white" bg="white" variant="default" onClick={() => setScale(s => Math.min(s + 0.2, 5))}>
            <FontAwesomeIcon icon={faPlus} className="text-gray-600" />
          </ActionIcon>
          <ActionIcon color="white" bg="white" variant="default" onClick={() => setScale(s => Math.max(s - 0.2, 0.2))}>
            <FontAwesomeIcon icon={faMinus} className="text-gray-600" />
          </ActionIcon>
          <ActionIcon color="white" bg="white" variant="default" onClick={() => { setScale(1); setCanvasPos([0, 0]); }}>
            <FontAwesomeIcon icon={faExpand} className="text-gray-600" />
          </ActionIcon>
        </div>

        {/* The Seatmap Canvas */}
        <Box
          ref={canvasWrapRef}
          className="w-full h-full cursor-grab active:cursor-grabbing transition-all duration-75 relative overflow-hidden"
          onWheel={handleWheel}
          style={{ contain: 'layout paint' }}
        >
          <Box
            className="absolute z-30 top-1/2 left-1/2"
            style={{
              transform: `translate(${canvasPos[0]}px, ${canvasPos[1]}px) translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center',
              willChange: 'transform',
            }}
          >
            {/* Guide Grid lines */}
            <Box className="absolute opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2 w-[4000px] h-[4000px]"
              style={{
                backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                contain: 'layout paint',
              }}
            />

            {seatmapData.map((area, i) => (
              <Box
                key={i}
                className="absolute z-30 -translate-x-2/4 -translate-y-2/4"
                style={{
                  top: area.position ? `${area.position[1]}px` : '0px',
                  left: area.position ? `${area.position[0]}px` : '0px',
                  width: area.size?.[0] ? `${area.size[0]}px` : 'auto',
                  height: area.size?.[1] ? `${area.size[1]}px` : 'auto',
                  transform: `rotate(${area.rotation ?? 0}deg)`,
                  contain: 'layout paint',
                }}
              >
                <Box
                  bg={area.background || "transparent"}
                  style={{
                    borderRadius: `${area.radius?.[0] ?? 5}px ${area.radius?.[1] ?? 5}px ${area.radius?.[2] ?? 5}px ${area.radius?.[3] ?? 5}px`,
                    contain: 'layout paint',
                  }}
                  h="100%"
                  className={`${!!area.background ? "shadow-lg" : ""} relative`}
                >
                  {/* Area Label */}
                  {area.type === "seat" && (area.text || area.label_seat) && (
                    <Stack gap={0} align="center" className="absolute bottom-full mb-2 w-full left-0 pointer-events-none">
                      {area.text && (
                        <Text size="xs" fw={700} c="gray.8" className="uppercase">
                          {area.text}
                        </Text>
                      )}
                      {area.label_seat && (
                        <Text size="xs" c="gray">
                          {area.label_seat}
                        </Text>
                      )}
                    </Stack>
                  )}

                  {/* Left/Right Code Labels */}
                  {area.type === "seat" && area.is_show_code !== false && (
                    <>
                      <Flex className={`absolute top-2/4 -translate-y-2/4 ${!!area.background ? "-left-[40px]" : "-left-[25px]"}`} gap={5}>
                        <Text fw={600} size="sm" c="gray.8">
                          {`${area.seat_label ?? ""}`}
                        </Text>
                      </Flex>
                      <Flex className={`absolute top-2/4 -translate-y-2/4 ${!!area.background ? "-right-[40px]" : "-right-[25px]"}`} gap={5}>
                        <Text fw={600} size="sm" c="gray.8">
                          {`${area.seat_label ?? ""}`}
                        </Text>
                      </Flex>
                    </>
                  )}

                  {area.type === "box" ? (
                    <Center h="100%">
                      <Text fw={700} className="uppercase" c={area.background ? "gray.8" : "gray.6"} style={{ opacity: area.background ? 0.8 : 0.4 }}>
                        {area.text}
                      </Text>
                    </Center>
                  ) : (
                    <Stack h="100%" align="center" justify="center" gap={5} p={10}
                      style={{ contain: 'layout paint' }}
                    >
                      <Stack gap={3} w="100%" h="100%" justify="space-between"
                        style={{ contain: 'layout style paint' }}
                      >
                        {area.seat?.map((row, rIdx) => {
                          const totalCol = area.col ?? row.length;
                          const colsLeft = area.cols_left;
                          const hasAisle = colsLeft !== undefined && colsLeft !== null && colsLeft > 0 && colsLeft < totalCol;
                          const gapSize = area.gap ?? 20;
                          return (
                            <Flex key={rIdx} gap={0} w="100%" h="100%" justify="center" align="center" style={{ contain: 'layout style' }}>
                              {hasAisle ? (
                                <>
                                  <Flex gap={3} justify="flex-end">
                                    {row.slice(0, colsLeft).map((seatCode) => {
                                      const isBought = takenSeatsFromAPI.has(seatCode);
                                      const displaySeatNumber = seatCode.replace(/-/g, "");
                                      const isMatchedSearch = !seatFilter.hasSearch || displaySeatNumber.toLowerCase().includes(seatFilter.lowerSearch);
                                      const isMatchedCategory = !seatFilter.hasCategoryFilter || area.text === selectedCategory;
                                      const isHighlighted = (seatFilter.hasCategoryFilter && isMatchedCategory) || (seatFilter.hasSearch && isMatchedSearch);
                                      const isDimmed = (seatFilter.hasCategoryFilter || seatFilter.hasSearch) && !isHighlighted;
                                      return (
                                        <SeatBox
                                          key={seatCode}
                                          seatNumber={seatCode}
                                          displaySeatNumber={displaySeatNumber}
                                          isBought={isBought}
                                          areaColor={area.seatcolor}
                                          isDimmed={isDimmed}
                                          isHighlighted={isHighlighted}
                                          onSeatClick={handleSeatClick}
                                        />
                                      );
                                    })}
                                  </Flex>
                                  <Box style={{ minWidth: gapSize, flexShrink: 0 }} />
                                  <Flex gap={3} justify="flex-start">
                                    {row.slice(colsLeft).map((seatCode) => {
                                      const isBought = takenSeatsFromAPI.has(seatCode);
                                      const displaySeatNumber = seatCode.replace(/-/g, "");
                                      const isMatchedSearch = !seatFilter.hasSearch || displaySeatNumber.toLowerCase().includes(seatFilter.lowerSearch);
                                      const isMatchedCategory = !seatFilter.hasCategoryFilter || area.text === selectedCategory;
                                      const isHighlighted = (seatFilter.hasCategoryFilter && isMatchedCategory) || (seatFilter.hasSearch && isMatchedSearch);
                                      const isDimmed = (seatFilter.hasCategoryFilter || seatFilter.hasSearch) && !isHighlighted;
                                      return (
                                        <SeatBox
                                          key={seatCode}
                                          seatNumber={seatCode}
                                          displaySeatNumber={displaySeatNumber}
                                          isBought={isBought}
                                          areaColor={area.seatcolor}
                                          isDimmed={isDimmed}
                                          isHighlighted={isHighlighted}
                                          onSeatClick={handleSeatClick}
                                        />
                                      );
                                    })}
                                  </Flex>
                                </>
                              ) : (
                                <Flex gap={3} justify="center">
                                  {row.map((seatCode) => {
                                    const isBought = takenSeatsFromAPI.has(seatCode);
                                    const displaySeatNumber = seatCode.replace(/-/g, "");
                                    const isMatchedSearch = !seatFilter.hasSearch || displaySeatNumber.toLowerCase().includes(seatFilter.lowerSearch);
                                    const isMatchedCategory = !seatFilter.hasCategoryFilter || area.text === selectedCategory;
                                    const isHighlighted = (seatFilter.hasCategoryFilter && isMatchedCategory) || (seatFilter.hasSearch && isMatchedSearch);
                                    const isDimmed = (seatFilter.hasCategoryFilter || seatFilter.hasSearch) && !isHighlighted;
                                    return (
                                      <SeatBox
                                        key={seatCode}
                                        seatNumber={seatCode}
                                        displaySeatNumber={displaySeatNumber}
                                        isBought={isBought}
                                        areaColor={area.seatcolor}
                                        isDimmed={isDimmed}
                                        isHighlighted={isHighlighted}
                                        onSeatClick={handleSeatClick}
                                      />
                                    );
                                  })}
                                </Flex>
                              )}
                            </Flex>
                          );
                        })}
                      </Stack>
                    </Stack>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {/* Helpful Info */}
      {!selectedEventData?.seatmap && (
        <Card withBorder p="xl" bg="gray.0" radius="md">
          <Center>
            <Stack align="center" gap="xs">
              <FontAwesomeIcon icon={faInfoCircle} size="2x" className="text-gray-400" />
              <Text fw={700}>Tidak ada denah kursi untuk event ini</Text>
              <Text size="sm" c="dimmed">Pastikan event memiliki pengaturan &quot;Seated&quot; dan denah kursi telah dibuat.</Text>
            </Stack>
          </Center>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Transaksi Kursi" centered>
        {selectedSeatTrx && selectedSeatTicket ? (
          <Stack gap="sm">
            <Box>
              <Text size="sm" c="dimmed">Nomor Kursi</Text>
              <Text fw={700}>{selectedSeatTicket.seatnumber_ticket}</Text>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Nama Pembeli</Text>
              <Text fw={700}>{selectedSeatTrx.has_user?.name || '-'}</Text>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Email Pembeli</Text>
              <Text fw={700}>{selectedSeatTrx.has_user?.email || '-'}</Text>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Nomor Invoice</Text>
              <Text fw={700}>{selectedSeatTrx.invoice_no}</Text>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Kategori Tiket</Text>
              <Text fw={700}>{selectedSeatTicket.has_event_ticket?.name || selectedSeatTicket.ticket_category}</Text>
            </Box>
          </Stack>
        ) : (
          <Text>Data tidak ditemukan.</Text>
        )}
      </Modal>
    </div>
  );
};


export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const token = req.cookies['token'];
  const userDataStr = req.cookies['user_data'];

  if (!token || !userDataStr) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  let user = null;
  try { user = JSON.parse(userDataStr); } catch (e) { }

  const creatorId = user?.has_creator?.id;
  let initialEvents: EventData[] = [];

  if (creatorId) {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_WS_URL}event-by-creator/${creatorId}?status=`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let evData = res.data?.data;
      if (!Array.isArray(evData)) evData = Array.isArray(res.data) ? res.data : [];
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

export default FullSeatmapReport;
