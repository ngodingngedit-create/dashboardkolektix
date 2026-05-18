import { Badge, Box, Card, Flex, Select, Stack, Text, Title, Pagination, Button, SegmentedControl, Input, ActionIcon, Modal, Group, Accordion, Table, Divider, TextInput, Tooltip, Portal, Transition } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import React, { useEffect, useMemo, useState } from "react";
import { useDidUpdate, useListState } from "@mantine/hooks";
import moment from "moment";
import Cookies from "js-cookie";
import { EventListResponse, DownpaymentData } from "./type";
import useLoggedUser from "@/utils/useLoggedUser";
import axios from "axios";
import config from "@/Config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faFilter, faSearch, faFileExcel, faMoneyBillWave, faReceipt, faInfoCircle, faCalendarDays, faUser, faEnvelope, faGlobe, faWallet, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";

const DPReport = () => {
  const getSuccessUrl = (invoice: string) => {
    const host = window.location.hostname;
    let baseUrl = "https://kolektix.com";
    if (host.includes("localhost")) {
      baseUrl = "http://localhost:3001";
    } else if (host.includes("kolektix.my.id")) {
      baseUrl = "https://kolektix.my.id";
    }
    return `${baseUrl}/success-downpayment/${invoice}`;
  };

  const [isr, setIsr] = useState(false);
  const [allDataList, setAllDataList] = useState<DownpaymentData[]>([]);
  const [eventList, setEventList] = useState<EventListResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | "all">("all");
  const [loading, setLoading] = useListState<string>();
  const [searchValue, setSearchValue] = useState<string>("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDP, setSelectedDP] = useState<DownpaymentData | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" | null }>({
    key: "created_at",
    direction: "desc",
  });
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<string>("all");
  const user = useLoggedUser();

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setIsr(true);
  }, []);

  useDidUpdate(() => {
    if (user?.has_creator?.id) {
      fetchEvents();
    }
  }, [isr, user]);

  useEffect(() => {
    if (isr) {
      loadDPData();
    }
  }, [isr, selectedEvent]);

  const fetchEvents = async () => {
    setLoading.append("fetchEvents");
    try {
      const creatorId = user?.has_creator?.id;
      if (!creatorId) return;
      
      const response = await axios.get(`${config.wsUrl}event-by-creator/${creatorId}`);
      if (response.data?.data && Array.isArray(response.data.data)) {
        setEventList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading.filter((e) => e !== "fetchEvents");
    }
  };

  const loadDPData = async () => {
    setLoading.append("loadData");
    try {
      const apiUrl = `${config.wsUrl}downpayment/creator`;
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        let data = response.data.data;
        if (selectedEvent !== "all") {
          data = data.filter((item: DownpaymentData) => item.event_id === Number(selectedEvent));
        }
        setAllDataList(data);
      }
    } catch (error) {
      console.error("Error loading DP data:", error);
      setAllDataList([]);
    } finally {
      setLoading.filter((e) => e !== "loadData");
    }
  };

  const availableTickets = useMemo(() => {
    const tickets = new Set<string>();
    allDataList.forEach(item => {
      item.tickets?.forEach(t => {
        if (t.code) tickets.add(t.code);
      });
    });
    return ["all", ...Array.from(tickets)];
  }, [allDataList]);

  const filteredData = useMemo(() => {
    let data = [...allDataList];

    // Status Filter
    if (selectedStatus !== "all") {
      data = data.filter(item => item.payment_status === selectedStatus);
    }

    // Ticket Filter
    if (selectedTicket !== "all") {
      data = data.filter(item => item.tickets?.some(t => t.code === selectedTicket));
    }

    // Search Filter
    if (searchValue) {
      const q = searchValue.toLowerCase();
      data = data.filter((item) => {
        const dpNo = item.downpayment_no?.toLowerCase() || "";
        const pemesan = item.identities?.find(id => id.is_pemesan === 1)?.full_name?.toLowerCase() || "";
        const email = item.identities?.find(id => id.is_pemesan === 1)?.email?.toLowerCase() || "";
        return dpNo.includes(q) || pemesan.includes(q) || email.includes(q);
      });
    }

    // Sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        let v1: any, v2: any;
        if (sortConfig.key === 'downpayment_no') {
          v1 = a.downpayment_no || "";
          v2 = b.downpayment_no || "";
        } else if (sortConfig.key === 'pemesan') {
          v1 = a.identities?.find(id => id.is_pemesan === 1)?.full_name || "";
          v2 = b.identities?.find(id => id.is_pemesan === 1)?.full_name || "";
        } else if (sortConfig.key === 'email') {
          v1 = a.identities?.find(id => id.is_pemesan === 1)?.email || "";
          v2 = b.identities?.find(id => id.is_pemesan === 1)?.email || "";
        } else if (sortConfig.key === 'grandtotal') {
          v1 = a.grandtotal || 0;
          v2 = b.grandtotal || 0;
        } else if (sortConfig.key === 'ticket_name') {
          v1 = a.tickets?.[0]?.code || "";
          v2 = b.tickets?.[0]?.code || "";
        } else if (sortConfig.key === 'payment_status') {
          v1 = a.payment_status || "";
          v2 = b.payment_status || "";
        } else if (sortConfig.key === 'created_at') {
          v1 = new Date(a.created_at).getTime();
          v2 = new Date(b.created_at).getTime();
        } else {
          v1 = (a as any)[sortConfig.key] || "";
          v2 = (b as any)[sortConfig.key] || "";
        }

        if (v1 < v2) return sortConfig.direction === 'asc' ? -1 : 1;
        if (v1 > v2) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [allDataList, selectedStatus, selectedTicket, searchValue, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} size="xs" style={{ marginLeft: 8, opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} size="xs" style={{ marginLeft: 8, color: '#228be6' }} />
      : <FontAwesomeIcon icon={faSortDown} size="xs" style={{ marginLeft: 8, color: '#228be6' }} />;
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const exportToExcel = () => {
    if (!filteredData.length) return;
    const headers = ["No", "No. DP", "Nama Pemesan", "Email", "Event", "Total Tiket", "Grand Total", "Terbayar", "Sisa", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredData.map((item, index) => {
        const pemesan = item.identities?.find(id => id.is_pemesan === 1) || item.identities?.[0];
        return [
          index + 1,
          `"${item.downpayment_no}"`,
          `"${pemesan?.full_name || "-"}"`,
          `"${pemesan?.email || "-"}"`,
          `"${item.event?.name || "-"}"`,
          item.total_qty,
          item.grandtotal,
          item.paid_amount,
          item.remaining_amount,
          `"${item.payment_status}"`
        ].join(",");
      })
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-dp-${moment().format("YYYY-MM-DD")}.csv`;
    link.click();
  };

  if (!isr) return <></>;

  return (
    <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
      <Flex justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">Down Payment Report</Title>
          <Text size="sm" c="gray">Kelola dan pantau transaksi Down Payment event Anda</Text>
        </Stack>
      </Flex>

      <Flex justify="flex-end" gap="sm" align="center" wrap="wrap">
        <Button 
          onClick={exportToExcel} 
          variant="filled"
          color="green"
          leftSection={<FontAwesomeIcon icon={faFileExcel} />}
          disabled={filteredData.length === 0}
          radius="xl"
          size="sm"
        >
          Export Excel
        </Button>
        
        <Select
          placeholder="Pilih Event"
          data={[{ value: "all", label: "Semua Event" }, ...eventList.map(e => ({ value: String(e.id), label: e.name }))]}
          value={String(selectedEvent)}
          onChange={(val) => setSelectedEvent(val as any)}
          w={200}
          size="sm"
          radius="md"
          searchable
        />

        <Select
          placeholder="Semua Tiket"
          data={availableTickets.map(t => ({ value: t, label: t === 'all' ? 'Semua Tiket' : t }))}
          value={selectedTicket}
          onChange={(val) => setSelectedTicket(val || 'all')}
          w={150}
          size="sm"
          radius="md"
        />

        <Select
          placeholder="Semua Status"
          data={[
            { value: "all", label: "Semua Status" },
            { value: "Paid", label: "Paid" },
            { value: "Partial Paid", label: "Partial Paid" },
            { value: "Pending", label: "Pending" },
            { value: "Expired", label: "Expired" },
            { value: "Unpaid", label: "Unpaid" },
            { value: "Canceled", label: "Canceled" },
          ]}
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val || 'all')}
          w={150}
          size="sm"
          radius="md"
        />

        <TextInput
          placeholder="Cari nama atau invoice..."
          leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          w={220}
          size="sm"
          radius="md"
        />
      </Flex>

      <Card withBorder p={0} radius="md" style={{ overflow: 'hidden' }}>
        <Box className="overflow-x-auto">
          <Table verticalSpacing="md" highlightOnHover withRowBorders>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase">NO</th>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('downpayment_no')}>
                  NO. INVOICE {getSortIcon('downpayment_no')}
                </th>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('pemesan')}>
                  NAMA {getSortIcon('pemesan')}
                </th>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('email')}>
                  EMAIL {getSortIcon('email')}
                </th>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('ticket_name')}>
                  NAMA TIKET {getSortIcon('ticket_name')}
                </th>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase text-right cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('grandtotal')}>
                  HARGA TIKET {getSortIcon('grandtotal')}
                </th>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase text-center">METODE PEMBAYARAN</th>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase text-center cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('payment_status')}>
                  STATUS {getSortIcon('payment_status')}
                </th>
                <th style={{ padding: '16px' }} className="text-xs font-bold text-gray-500 uppercase text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading.includes("loadData") ? (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    <Text c="gray">Memuat data...</Text>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    <Text c="gray">Tidak ada data ditemukan</Text>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const pemesan = item.identities?.find(id => id.is_pemesan === 1) || item.identities?.[0];
                  const ticketNames = item.tickets?.map(t => t.code).filter(Boolean);
                  const displayTicketName = ticketNames.length > 1 
                    ? `${ticketNames[0]} (+${ticketNames.length - 1})` 
                    : ticketNames[0] || "-";

                  return (
                    <tr key={item.id} style={{ transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px' }} className="text-sm">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td style={{ padding: '16px' }} className="text-sm font-semibold">
                        <Text 
                          component="a" 
                          href={getSuccessUrl(item.downpayment_no)} 
                          target="_blank" 
                          variant="text" 
                          c="blue" 
                          style={{ cursor: 'pointer', textDecoration: 'none' }}
                          className="hover:underline"
                        >
                          {item.downpayment_no}
                        </Text>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Text size="sm" fw={500}>{pemesan?.full_name || "-"}</Text>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Text size="sm">{pemesan?.email || "-"}</Text>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Tooltip label={ticketNames.join(", ")} disabled={ticketNames.length <= 1}>
                          <Text size="sm" className="line-clamp-1">{displayTicketName}</Text>
                        </Tooltip>
                      </td>
                      <td style={{ padding: '16px' }} className="text-right text-sm fw-semibold">Rp {item.grandtotal.toLocaleString("id-ID")}</td>
                      <td style={{ padding: '16px' }} className="text-center">
                        <Text size="sm" className="uppercase">
                          {(item.payment_method?.toLowerCase().includes('xendit') || String(item.payment_method) === '4') ? 'QRIS' : (item.payment_method || "-")}
                        </Text>
                      </td>
                      <td style={{ padding: '16px' }} className="text-center">
                        <Badge 
                          color={
                            item.payment_status === "Paid" ? "green" : 
                            item.payment_status === "Partial Paid" ? "blue" : 
                            item.payment_status === "Pending" ? "yellow" : 
                            item.payment_status === "Expired" ? "red" : 
                            item.payment_status === "Unpaid" ? "orange" : 
                            "gray"
                          }
                          variant="light"
                          radius="sm"
                          size="sm"
                        >
                          {item.payment_status}
                        </Badge>
                      </td>
                      <td style={{ padding: '16px' }} className="text-center">
                        <ActionIcon 
                          color="blue" 
                          variant="subtle" 
                          radius="md"
                          onClick={() => {
                            setSelectedDP(item);
                            setViewModalOpen(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} size="sm" />
                        </ActionIcon>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Box>

        {totalPages > 1 && (
          <Box p="md" style={{ borderTop: '1px solid #eee' }}>
            <Flex justify="center">
              <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} color="blue" />
            </Flex>
          </Box>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={<Text size="xl">Detail Down Payment</Text>}
        size="xl"
        radius="lg"
        padding={0}
        styles={{
          header: { borderBottom: '1px solid #eee', padding: '20px 24px' },
          content: { overflow: 'hidden' }
        }}
      >
        {selectedDP && (
          <>
            <Box p="xl" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Stack gap="xl">
                {/* Header Section */}
                <Flex justify="space-between" align="flex-start" wrap="wrap" gap="md">
                  <Box>
                    <Text size="sm" c="gray" tt="uppercase">No. Invoice</Text>
                    <Text size="lg" c="blue">{selectedDP.downpayment_no}</Text>
                  </Box>
                  <Box className="text-right">
                    <Text size="sm" c="gray" tt="uppercase">Status Transaksi</Text>
                    <Badge 
                      color={
                        selectedDP.payment_status === "Paid" ? "green" : 
                        selectedDP.payment_status === "Partial Paid" ? "blue" : 
                        selectedDP.payment_status === "Pending" ? "yellow" : 
                        "gray"
                      }
                      variant="filled"
                      size="lg"
                      radius="sm"
                    >
                      {selectedDP.payment_status}
                    </Badge>
                  </Box>
                </Flex>

                <Divider style={{ borderColor: '#eee' }} />

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Box p="md" className="rounded-xl border" style={{ borderColor: '#eee', backgroundColor: '#fcfcfc' }}>
                    <Flex align="center" gap="sm" mb="md">
                      <Box className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FontAwesomeIcon icon={faUser} size="sm" />
                      </Box>
                      <Text>Informasi Pemesan</Text>
                    </Flex>
                    <Stack gap="xs">
                      <Box>
                        <Text size="xs" c="gray">Nama Lengkap</Text>
                        <Text>{selectedDP.identities?.find(id => id.is_pemesan === 1)?.full_name || "-"}</Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="gray">Email</Text>
                        <Text>{selectedDP.identities?.find(id => id.is_pemesan === 1)?.email || "-"}</Text>
                      </Box>
                    </Stack>
                  </Box>

                  <Box p="md" className="rounded-xl border" style={{ borderColor: '#eee', backgroundColor: '#fcfcfc' }}>
                    <Flex align="center" gap="sm" mb="md">
                      <Box className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <FontAwesomeIcon icon={faCalendarDays} size="sm" />
                      </Box>
                      <Text>Informasi Event</Text>
                    </Flex>
                    <Stack gap="xs">
                      <Box>
                        <Text size="xs" c="gray">Nama Event</Text>
                        <Text className="line-clamp-1">{selectedDP.event?.name}</Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="gray">Tanggal Event</Text>
                        <Text>{moment(selectedDP.event?.start_date).format("DD MMMM YYYY")}</Text>
                      </Box>
                    </Stack>
                  </Box>
                </div>

                {/* Tickets Table */}
                <Box>
                  <Text mb="xs" size="sm" c="gray" tt="uppercase">Daftar Tiket</Text>
                  <Box className="overflow-hidden rounded-xl border" style={{ borderColor: '#eee' }}>
                    <Table variant="simple" verticalSpacing="sm">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th className="text-xs py-3 pl-4 text-gray-500">TIKET</th>
                          <th className="text-xs py-3 text-center text-gray-500">QTY</th>
                          <th className="text-xs py-3 text-right text-gray-500">HARGA</th>
                          <th className="text-xs py-3 text-right pr-4 text-gray-500">SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDP.tickets.map((t) => (
                          <tr key={t.id} className="border-t" style={{ borderColor: '#eee' }}>
                            <td className="py-3 pl-4">
                              <Text size="xs">{t.code}</Text>
                            </td>
                            <td className="py-3 text-center">
                              <Text size="xs">{t.qty_ticket}</Text>
                            </td>
                            <td className="py-3 text-right">
                              <Text size="xs">Rp {t.price.toLocaleString("id-ID")}</Text>
                            </td>
                            <td className="py-3 text-right pr-4">
                              <Text size="xs">Rp {t.subtotal_price.toLocaleString("id-ID")}</Text>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Box>
                </Box>

                {/* Installments Section */}
                <Box>
                  <Text mb="xs" size="sm" c="gray" tt="uppercase">Jadwal Cicilan</Text>
                  <Accordion variant="separated" radius="md">
                    {selectedDP.installments.map((inst, index) => (
                      <Accordion.Item key={inst.id} value={inst.title} className="border mb-2" style={{ borderColor: '#eee' }}>
                        <Accordion.Control>
                          <Flex justify="space-between" align="center" w="100%" pr="md">
                            <Group gap="xs">
                              <Box className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">
                                {index + 1}
                              </Box>
                              <Text size="sm">{inst.title} ({inst.percentage}%)</Text>
                            </Group>
                            <Badge 
                              color={inst.payment_status === "Paid" ? "green" : inst.payment_status === "Pending" ? "yellow" : "orange"} 
                              size="sm"
                              variant="dot"
                            >
                              {inst.payment_status}
                            </Badge>
                          </Flex>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Box p="md" className="bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-y-3">
                              <Box>
                                <Text size="xs" c="gray">Jumlah Tagihan</Text>
                                <Text size="sm">Rp {inst.grandtotal.toLocaleString("id-ID")}</Text>
                              </Box>
                              <Box className="text-right">
                                <Text size="xs" c="gray">Jatuh Tempo</Text>
                                <Text size="sm">{moment(inst.due_date).format("DD MMM YYYY")}</Text>
                              </Box>
                              {inst.payment_status === "Paid" && (
                                <div className="col-span-2">
                                  <Text size="xs" c="gray">Metode Pembayaran</Text>
                                  <Text size="sm" className="uppercase">{inst.payment_channel || "-"}</Text>
                                </div>
                              )}
                            </div>
                            {inst.payment_status === "Pending" && inst.xendit_url && (
                              <Button 
                                component="a" 
                                href={inst.xendit_url} 
                                target="_blank" 
                                size="sm" 
                                variant="filled" 
                                color="blue"
                                fullWidth
                                mt="md"
                                radius="md"
                              >
                                Bayar Sekarang
                              </Button>
                            )}
                          </Box>
                        </Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Box>

                {/* Footer Summary */}
                <Box p="lg" className="rounded-2xl border" style={{ borderColor: '#eee', backgroundColor: '#fcfcfc' }}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text size="xs" c="gray" tt="uppercase">Grand Total Transaksi</Text>
                      <Text size="xl" fw={500}>Rp {selectedDP.grandtotal.toLocaleString("id-ID")}</Text>
                    </Box>
                    <Box className="text-right">
                      <Text size="xs" c="gray" tt="uppercase">Terbayar</Text>
                      <Text size="lg" fw={500} c="green.6">Rp {selectedDP.paid_amount.toLocaleString("id-ID")}</Text>
                    </Box>
                  </Flex>
                </Box>
              </Stack>
            </Box>
          </>
        )}
      </Modal>

      {/* Floating Sticky Footer - Truly outside the modal box */}
      <Portal>
        <Transition mounted={viewModalOpen} transition="slide-up" duration={400} timingFunction="ease">
          {(styles) => (
            <Box 
              style={{ 
                ...styles, 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                height: '80px',
                backgroundColor: '#fff',
                borderTop: '1px solid #eee',
                zIndex: 1000, 
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <Flex justify="flex-end" align="center" gap="xl" w="100%">
                <Text 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => setViewModalOpen(false)}
                  c="gray.7"
                  size="sm"
                >
                  Tutup
                </Text>
                <Button 
                  radius="md" 
                  color="blue" 
                  leftSection={<FontAwesomeIcon icon={faEye} />}
                  onClick={() => {
                    if (selectedDP) {
                      window.open(getSuccessUrl(selectedDP.downpayment_no), "_blank");
                    }
                  }}
                  style={{ height: '44px' }}
                >
                  Lihat Invoice Lengkap
                </Button>
              </Flex>
            </Box>
          )}
        </Transition>
      </Portal>
    </div>
  );
};

export default DPReport;
