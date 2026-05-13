import React, { useState, useEffect, useMemo, useRef } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import { useDebouncedValue, useClickOutside } from "@mantine/hooks";
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
  Center
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
  faTicket
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

const FullSeatmapReport = ({ initialEvents, initialCreatorId }: Props) => {
  const users = useLoggedUser();
  const [events, setEvents] = useState<EventData[]>(initialEvents || []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrx, setLoadingTrx] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState<string>(initialEvents && initialEvents.length > 0 ? String(initialEvents[0].id) : "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

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
      const parsed = JSON.parse(selectedEventData.seatmap);
      return (Array.isArray(parsed) ? parsed : []).map((e: any) => {
        const seat = chunk(
          Array((e.row ?? 1) * (e.col ?? 1))
            .fill(0)
            .map((_, i) => `${e.is_show_code !== false ? e.prefix ?? "" : ""}${i + (e?.starting_seat ?? 1)}`) ?? [],
          e.col ?? 1
        );
        return { ...e, seat, type: e?.type ?? "seat" };
      });
    } catch (e) {
      console.error("Error parsing seatmap:", e);
      return [];
    }
  }, [selectedEventData]);

  // Fetch Transactions (like seatreport.tsx)
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

  const takenSeatsFromAPI = useMemo(() => {
    const seats = new Set<string>();
    selectedEventData?.has_event_ticket?.forEach(t => {
      if (t.taken_seat_number) {
        t.taken_seat_number.split(",").forEach(s => {
          if (s.trim()) seats.add(s.trim());
        });
      }
    });
    return seats;
  }, [selectedEventData]);

  // Process transactions into a seat map for easy lookup
  const seatToBuyerMap = useMemo(() => {
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
            if (typeof t.seatnumber_ticket === "string") seats = [t.seatnumber_ticket];
          }
        }
        seats.forEach((s) => {
          map[s] = { transaction: trx, ticket: t };
        });
      });
    });
    return map;
  }, [transactions]);

  // Handle Zoom and Pan (similar to Seatmap component)
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

  // Categories for filtering
  const ticketCategories = useMemo(() => {
    const list = selectedEventData?.has_event_ticket?.map(t => t.name) || [];
    return ["all", ...list];
  }, [selectedEventData]);

  // Renderer for individual seats
  const renderSeat = (seatNumber: string, areaColor?: string, areaTicketName?: string) => {
    const buyerInfo = seatToBuyerMap[seatNumber];
    const isBought = takenSeatsFromAPI.has(seatNumber);

    // Highlight logic
    const isMatchedCategory = selectedCategory === "all" || (buyerInfo && buyerInfo.ticket.has_event_ticket?.name === selectedCategory);
    const isMatchedSearch = !debouncedSearch ||
      seatNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      buyerInfo?.transaction?.has_user?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      buyerInfo?.transaction?.invoice_no?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const isHighlighted = (selectedCategory !== "all" && isMatchedCategory) || (debouncedSearch && isMatchedSearch);

    // Dim seats that don't match if something is selected/searched
    const isDimmed = (selectedCategory !== "all" || debouncedSearch) && !isHighlighted;

    const tooltipContent = buyerInfo ? (
      <Stack gap={2}>
        <Text size="xs" fw={700}>Seat: {seatNumber}</Text>
        <Text size="xs">Pembeli: {buyerInfo.transaction.has_user?.name}</Text>
        <Text size="xs">Invoice: {buyerInfo.transaction.invoice_no}</Text>
        <Text size="xs">Tiket: {buyerInfo.ticket.has_event_ticket?.name}</Text>
      </Stack>
    ) : isBought ? (
      <Stack gap={2}>
        <Text size="xs" fw={700}>Seat: {seatNumber}</Text>
        <Text size="xs" c="orange">Terjual</Text>
      </Stack>
    ) : (
      <Text size="xs">Seat: {seatNumber} (Tersedia)</Text>
    );

    return (
      <Tooltip label={tooltipContent} key={seatNumber} withArrow position="top">
        <Box
          onMouseEnter={() => { }}
          w={20}
          h={25}
          className={`rounded-md overflow-hidden relative z-40 transition-all duration-200`}
          style={{
            opacity: isDimmed ? 0.2 : 1,
            transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
            zIndex: isHighlighted ? 100 : 1,
          }}
        >
          <Box
            className={`relative z-10 rounded-sm mt-[5px] border ${isBought ? "border-[#fafafa30]" : " border-[#d0d0d0]"}`}
            bg={isBought ? (areaColor || "#666666") : "gray.2"}
            h="calc(100% - 7px)"
            style={{
              boxShadow: isHighlighted ? '0 0 8px rgba(0,0,0,0.4)' : 'none',
              border: isHighlighted ? '1.5px solid white' : undefined
            }}
          >
            <Center className="h-full">
              <Text size="6px" fw={700} c={isBought ? "white" : "gray.6"} className="uppercase">
                {seatNumber}
              </Text>
            </Center>
          </Box>

          <Box
            className={`w-[calc(70%)] rounded-sm absolute top-0 left-2/4 -translate-x-2/4 h-[7px] ${isBought ? "" : "border border-[#d0d0d0]"}`}
            bg={isBought ? (areaColor || "#666666") : "gray.2"}
            h="calc(100% - 5px)"
          />
        </Box>
      </Tooltip>
    );
  };

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
            onChange={(val) => val && setSelectedEventId(val)}
            placeholder="Pilih Event"
            style={{ width: 220 }}
            searchable
            clearable
            size="sm"
          />

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
              onClick={() => users?.has_creator?.id && fetchTransactions(users.has_creator.id, selectedEventId)}
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
            <Box w={12} h={12} bg="gray.3" className="rounded-sm border border-gray-400" />
            <Text size="xs">Tersedia</Text>
          </Flex>
          <Flex align="center" gap={8}>
            <Box w={12} h={12} bg="gray.6" className="rounded-sm" />
            <Text size="xs">Terjual</Text>
          </Flex>
          <Flex align="center" gap={8}>
            <div className="w-3 h-3 border-2 border-white bg-blue-600 rounded-sm shadow-[0_0_5px_rgba(0,0,0,0.3)]" />
            <Text size="xs">Terpilih (Highlight)</Text>
          </Flex>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
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
        >
          <Box
            className="absolute z-30 top-1/2 left-1/2"
            style={{
              transform: `translate(${canvasPos[0]}px, ${canvasPos[1]}px) translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center'
            }}
          >
            {/* Guide Grid lines */}
            <Box className="absolute opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2 w-[4000px] h-[4000px]"
              style={{
                backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            />

            {seatmapData.map((area, i) => (
              <Box
                key={i}
                className="absolute z-30"
                style={{
                  top: `${area.position[1]}px`,
                  left: `${area.position[0]}px`,
                  width: area.size?.[0] ? `${area.size[0]}px` : 'auto',
                  height: area.size?.[1] ? `${area.size[1]}px` : 'auto',
                  transform: `rotate(${area.rotation ?? 0}deg)`,
                }}
              >
                <Box
                  bg={area.background || "transparent"}
                  style={{
                    borderRadius: `${area.radius?.[0] ?? 5}px ${area.radius?.[1] ?? 5}px ${area.radius?.[2] ?? 5}px ${area.radius?.[3] ?? 5}px`,
                  }}
                  h="100%"
                  className={`${!!area.background ? "shadow-lg" : ""} relative`}
                >
                  {/* Area Label - Match Editor Logic */}
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

                  {/* Left/Right Code Labels - Match Editor */}
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
                    <Stack h="100%" align="center" justify="center" gap={5} p={10}>
                      <Stack gap={3} w="100%" h="100%" justify="space-between">
                        {area.seat?.map((row, rIdx) => (
                          <Flex key={rIdx} gap={3} w="100%" h="100%" justify="space-between">
                            {row.map((seatCode) => renderSeat(seatCode, area.seatcolor, area.text))}
                          </Flex>
                        ))}
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
