import { Badge, Flex, Select, Stack, Text, Title, Card, Box, Input, Pagination, Button, Modal, Group } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { useListState } from "@mantine/hooks";
import { EventListResponse, TransactionListResponse } from "../type";
import useLoggedUser from "@/utils/useLoggedUser";
import axios from "axios";
import config from "@/Config";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { notifications } from "@mantine/notifications";

const CheckinReport = () => {
  const [isr, setIsr] = useState(false);
  const [allDataList, setAllDataList] = useState<TransactionListResponse[]>([]);
  const [eventList, setEventList] = useState<EventListResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number>();
  const [loading, setLoading] = useListState<string>();

  // New state for Report Type and Invitation data
  const [reportType, setReportType] = useState<"eticket" | "invitation">("eticket");
  const [invitationData, setInvitationData] = useState<any[]>([]);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  // Table state matching report.tsx standard
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<string>("no");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const user = useLoggedUser();

  useEffect(() => {
    setIsr(true);
  }, []);

  useEffect(() => {
    if (isr && user) {
      getEvent();
    }
  }, [isr, user]);

  useEffect(() => {
    if (selectedEvent) {
      getData();
    }
  }, [selectedEvent, reportType]);

  const getEvent = async () => {
    setLoading.append("getevent");
    try {
      let fullEvents: EventListResponse[] = [];
      let currentPageNum = 1;
      let lastPage = 1;

      const response = await axios.get(`${config.wsUrl}event?page=${currentPageNum}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });

      if (response.data?.data && Array.isArray(response.data.data)) {
        fullEvents = [...response.data.data];
        if (response.data.pagination) {
          lastPage = response.data.pagination.last_page || 1;
          for (let page = 2; page <= lastPage; page++) {
            const nextRes = await axios.get(`${config.wsUrl}event?page=${page}`, {
              headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
            });
            if (nextRes.data?.data && Array.isArray(nextRes.data.data)) {
              fullEvents = [...fullEvents, ...nextRes.data.data];
            }
          }
        }
      }

      if (fullEvents.length > 0) {
        const creatorId = user?.has_creator?.id;
        const filtered = creatorId
          ? fullEvents.filter((e) => String(e.creator_id) === String(creatorId))
          : [];

        setEventList(filtered);
        if (filtered.length > 0 && !selectedEvent) {
          setSelectedEvent(filtered[0].id);
        }
      }
    } catch (error) {
      console.error("Fetch Event error:", error);
    } finally {
      setLoading.filter((e) => e != "getevent");
    }
  };

  const getData = async () => {
    if (!selectedEvent) return;

    setLoading.append("getdata");
    setAllDataList([]);
    setInvitationData([]);

    try {
      if (reportType === "eticket") {
        const params = new URLSearchParams({
          event_id: selectedEvent.toString(),
          page: "1",
          per_page: "999999",
        });

        const apiUrl = `${config.wsUrl}list-transaction-by-event?${params.toString()}`;
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        });

        if (response.data?.data && Array.isArray(response.data.data)) {
          const verifiedData = response.data.data.filter((t: any) =>
            t.payment_status?.toLowerCase() === 'verified' || t.transaction_status_id === 2
          );
          setAllDataList(verifiedData);
        }
      } else {
        // Fetch Invitations
        const response = await axios.get(`${config.wsUrl}invitations/event/${selectedEvent}`, {
          params: { with_details: true },
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        });

        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setInvitationData(data);
      }
    } catch (error: any) {
      console.error("API Error:", error);
    } finally {
      setLoading.filter((e) => e != "getdata");
    }
  };

  const handleManualCheckin = async () => {
    if (!selectedCheckin) return;
    setCheckingIn(true);
    try {
      const isEticket = reportType === "eticket";
      const url = isEticket ? "event/scan-eticket" : "invitations/checkin";
      const payload = isEticket 
        ? { qr_code: selectedCheckin.qr_code } 
        : { invitation_number: selectedCheckin.invitation_number };

      const response = await axios.post(`${config.wsUrl}${url}`, payload, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });

      if (response.data?.success || response.data?.status === 200 || response.data?.status === true) {
        notifications.show({
          title: "Berhasil",
          message: "Check-in manual berhasil dilakukan",
          color: "green"
        });
        setIsCheckinModalOpen(false);
        getData();
      } else {
        throw new Error(response.data?.message || "Gagal melakukan check-in manual");
      }
    } catch (error: any) {
      notifications.show({
        title: "Gagal",
        message: error.response?.data?.message || error.message || "Terjadi kesalahan",
        color: "red"
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Flatten and process data
  const processedData = useMemo(() => {
    let list: any[] = [];
    let absoluteRowNum = 1;

    if (reportType === "eticket") {
      allDataList.forEach((trans) => {
        trans.tickets?.forEach((ticket) => {
          const qty = parseInt(String(ticket.qty_ticket)) || 1;
          for (let i = 0; i < qty; i++) {
            const identity = trans.identities?.[i];
            list.push({
              no: absoluteRowNum++,
              nama: identity?.full_name || (trans.has_user as any)?.name || "-",
              telepon: identity?.no_telp || (trans.has_user as any)?.phone || "-",
              email: identity?.email || (trans.has_user as any)?.email || "-",
              status_checkin: ticket.ticket_checkin_status === 1,
              invoice: trans.invoice_no,
              qr_code: ticket.etiket_number // Used for manual check-in
            });
          }
        });
      });
    } else {
      invitationData.forEach((invGroup) => {
        invGroup.event_invitation_detail?.forEach((detail: any) => {
          list.push({
            no: absoluteRowNum++,
            nama: detail.fullname || "-",
            telepon: detail.phone || "-",
            email: detail.email || "-",
            status_checkin: detail.checkin_status === 1,
            invoice: detail.invitation_number // In invitation mode, we show invitation number
          });
        });
      });
    }

    // Filtering
    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase();
      list = list.filter(item =>
        item.nama?.toLowerCase().includes(lowerSearch) ||
        item.telepon?.toLowerCase().includes(lowerSearch) ||
        item.email?.toLowerCase().includes(lowerSearch) ||
        item.invoice?.toLowerCase().includes(lowerSearch)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    // Re-assign display row numbers based on current sort
    return list.map((item, index) => ({ ...item, displayNo: index + 1 }));
  }, [allDataList, searchValue, sortBy, sortDir]);

  // Pagination logic
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  // Stats calculation
  const stats = useMemo(() => {
    const total = processedData.length;
    const checkin = processedData.filter(i => i.status_checkin).length;
    return { total, checkin };
  }, [processedData]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  if (!isr) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* Main Content Area */}
      <div className="p-8 text-black flex flex-col gap-6 flex-grow">
        <Flex justify="space-between" align="flex-end">
          <Stack gap={2}>
            <Title order={1} size="h2" className="font-bold tracking-tight text-[#1a1c1e]">
              Check-in Report {reportType === "eticket" ? "E-Ticket" : "Invitation"}
            </Title>
            <Text size="sm" c="dimmed">
              Daftar status kedatangan peserta berdasarkan {reportType === "eticket" ? "tiket" : "undangan"} yang valid.
            </Text>
          </Stack>

          <Select
            value={reportType}
            onChange={(val) => {
              if (val) {
                setReportType(val as any);
                setCurrentPage(1);
              }
            }}
            data={[
              { value: "eticket", label: "E-Ticket" },
              { value: "invitation", label: "Invitation" },
            ]}
            radius="md"
            style={{ width: 150 }}
          />
        </Flex>

        <Card p={0} withBorder radius="md" style={{ overflow: 'hidden', border: '1px solid #f0f0f0' }}>
          {/* Filter Bar */}
          <Flex justify="space-between" align="center" p="md" bg="white" gap="md" wrap="wrap">
            <Flex gap="md" align="center">
              {/* Stats Cards */}
              <Card withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">TOTAL {reportType === "eticket" ? "E-TICKET" : "INVITATION"}</Text>
                <Text size="lg" fw={700}>{stats.total}</Text>
              </Card>
              <Card withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">TOTAL CHECKIN</Text>
                <Text size="lg" fw={700} c="green">{stats.checkin}</Text>
              </Card>
            </Flex>

            <Flex gap="sm" align="center">
              <Select
                value={selectedEvent ? String(selectedEvent) : null}
                onChange={(val) => {
                  if (val) {
                    setSelectedEvent(parseInt(val));
                    setCurrentPage(1);
                  }
                }}
                data={eventList?.map(ev => ({ value: String(ev.id), label: ev.name })) || []}
                placeholder={loading.includes("getevent") ? "Memuat list event..." : "Pilih Event"}
                disabled={loading.includes("getevent")}
                searchable
                style={{ width: 220 }}
                radius="md"
                styles={{
                  input: { border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
                }}
              />
              <Input
                placeholder="Cari Nama, Email, atau No. Telepon..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(1);
                }}
                leftSection={<FontAwesomeIcon icon={faSearch} size="sm" />}
                style={{ width: 280 }}
                radius="md"
              />
            </Flex>
          </Flex>

          {/* Custom Table Standard report.tsx */}
          <Box style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f7fa", borderBottom: "2px solid #e8e8e8" }}>
                  <th style={headerStyle(true)}>NO</th>
                  <th onClick={() => handleSort('invoice')} style={headerStyle(false, sortBy === 'invoice', sortDir)}>
                    {reportType === "eticket" ? "NOMOR INVOICE" : "NOMOR UNDANGAN"} <SortIcon active={sortBy === 'invoice'} dir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('nama')} style={headerStyle(false, sortBy === 'nama', sortDir)}>
                    NAMA <SortIcon active={sortBy === 'nama'} dir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('telepon')} style={headerStyle(false, sortBy === 'telepon', sortDir)}>
                    NO. TELEPON <SortIcon active={sortBy === 'telepon'} dir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('email')} style={headerStyle(false, sortBy === 'email', sortDir)}>
                    EMAIL <SortIcon active={sortBy === 'email'} dir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('status_checkin')} style={headerStyle(false, sortBy === 'status_checkin', sortDir)}>
                    STATUS CHECK-IN <SortIcon active={sortBy === 'status_checkin'} dir={sortDir} />
                  </th>
                  <th style={headerStyle()}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading.includes("getdata") ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "80px" }}>
                      <Text fw={500} c="dimmed">Memuat data...</Text>
                    </td>
                  </tr>
                ) : pagedData.length > 0 ? (
                  pagedData.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafd')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                    >
                      <td style={cellStyle(true)}>
                        <Text size="sm" c="dimmed" fw={500}>{item.displayNo}</Text>
                      </td>
                      <td style={cellStyle()}>
                        <Text size="sm" fw={600} className="font-mono">{item.invoice}</Text>
                      </td>
                      <td style={cellStyle()}>
                        <Text size="sm" fw={600} style={{ color: '#333' }}>{item.nama}</Text>
                      </td>
                      <td style={cellStyle()}>
                        <Text size="sm">{item.telepon}</Text>
                      </td>
                      <td style={cellStyle()}>
                        <Text size="sm" c="dimmed">{item.email}</Text>
                      </td>
                      <td style={cellStyle()}>
                        <Badge
                          color={item.status_checkin ? "green" : "gray"}
                          variant="light"
                          size="sm"
                          className="font-semibold px-3 py-1"
                        >
                          {item.status_checkin ? "SUDAH CHECKIN" : "BELUM CHECKIN"}
                        </Badge>
                      </td>
                      <td style={cellStyle()}>
                        {!item.status_checkin && (
                          <Button 
                            size="compact-xs" 
                            variant="light" 
                            color="blue"
                            leftSection={<FontAwesomeIcon icon={faCheckCircle} />}
                            onClick={() => {
                              setSelectedCheckin({
                                ...item,
                                invitation_number: item.invoice, // For invitation
                                qr_code: item.qr_code // For eticket
                              });
                              setIsCheckinModalOpen(true);
                            }}
                          >
                            Checkin Manual
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "80px" }}>
                      <Text c="dimmed" fw={500}>Data Tidak Ditemukan</Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>

          {/* Footer Pagination Standard report.tsx */}
          {totalItems > 0 && (
            <Flex justify="space-between" align="center" p="md" bg="white" style={{ borderTop: "1px solid #f0f0f0" }}>
              <Text size="sm" c="dimmed">
                Menampilkan <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> sampai <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> dari <strong>{totalItems}</strong> data
              </Text>

              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                radius="md"
                size="sm"
                withEdges
                color="blue"
              />
            </Flex>
          )}
        </Card>

        <Modal.Root
          opened={isCheckinModalOpen}
          onClose={() => setIsCheckinModalOpen(false)}
          centered
          radius="md"
          size="420px"
        >
          <Modal.Overlay />
          <Modal.Content style={{ overflow: 'hidden' }}>
            <Modal.Header style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 20px' }}>
              <Modal.Title><Text fw={700} size="sm">Konfirmasi Check-in Manual</Text></Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            
            <Modal.Body style={{ padding: '20px' }}>
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  Apakah Anda yakin ingin melakukan check-in manual untuk peserta berikut?
                </Text>
                <Box p="md" bg="gray.0" style={{ borderRadius: 8, border: '1px solid #eef0f2' }}>
                  <Stack gap={8}>
                    <Flex justify="space-between" align="center">
                      <Text size="sm" fw={600} c="dimmed">Nama:</Text>
                      <Text size="sm" fw={700}>{selectedCheckin?.nama}</Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text size="sm" fw={600} c="dimmed">{reportType === "eticket" ? "Invoice" : "No. Undangan"}:</Text>
                      <Text size="sm" fw={700} className="font-mono">{selectedCheckin?.invoice}</Text>
                    </Flex>
                    {reportType === "eticket" && (
                      <Flex justify="space-between" align="center">
                        <Text size="sm" fw={600} c="dimmed">Kode Tiket:</Text>
                        <Text size="sm" fw={700} color="blue" className="font-mono">{selectedCheckin?.qr_code}</Text>
                      </Flex>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
      </div>

      {/* Page-level Sticky Footer for Modal Actions */}
      {isCheckinModalOpen && (
        <Box 
          className="checkin-sticky-footer"
          style={{ 
            position: 'fixed', 
            bottom: 0, 
            right: 0,
            backgroundColor: 'white', 
            borderTop: '1px solid #f0f0f0',
            padding: '16px 40px',
            zIndex: 10001, // Higher than Mantine Modal backdrop
            boxShadow: '0 -4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Group>
            <Button variant="subtle" color="gray" onClick={() => setIsCheckinModalOpen(false)}>Batal</Button>
            <Button onClick={handleManualCheckin} loading={checkingIn} color="blue" radius="md" px="xl">Konfirmasi Check-in</Button>
          </Group>
        </Box>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .mantine-Select-input, .mantine-Input-input {
          border-color: #e0e0e0;
        }
        .mantine-Select-input:focus, .mantine-Input-input:focus {
          border-color: #228be6;
        }
        .checkin-sticky-footer {
          left: 0;
        }
        @media (min-width: 768px) {
          .checkin-sticky-footer {
            /* Adjusted to match the collapsed sidebar width in the screenshot */
            left: 65px; 
          }
        }
      `}} />
    </div>
  );
};

// Style helpers for consistency with report.tsx
const headerStyle = (isNo = false, active = false, dir = "asc"): React.CSSProperties => ({
  padding: '12px 14px',
  textAlign: isNo ? 'center' : 'left',
  fontSize: '12px',
  fontWeight: 700,
  color: '#777',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  cursor: isNo ? 'default' : 'pointer',
  width: isNo ? 64 : 'auto',
});

const cellStyle = (isNo = false): React.CSSProperties => ({
  padding: '14px 14px',
  whiteSpace: 'nowrap',
  textAlign: isNo ? 'center' : 'left',
  width: isNo ? 64 : 'auto',
});

const SortIcon = ({ active, dir }: { active: boolean, dir: "asc" | "desc" }) => (
  <span style={{ marginLeft: 6, opacity: active ? 1 : 0.25, fontSize: '10px' }}>
    {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
  </span>
);

export default CheckinReport;
