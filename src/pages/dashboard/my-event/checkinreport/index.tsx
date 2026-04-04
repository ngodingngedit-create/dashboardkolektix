import { Badge, Flex, Select, Stack, Text, Title, Card, Box, Input, Pagination, Button } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { useListState } from "@mantine/hooks";
import { EventListResponse, TransactionListResponse } from "../type";
import useLoggedUser from "@/utils/useLoggedUser";
import axios from "axios";
import config from "@/Config";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

const CheckinReport = () => {
  const [isr, setIsr] = useState(false);
  const [allDataList, setAllDataList] = useState<TransactionListResponse[]>([]);
  const [eventList, setEventList] = useState<EventListResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number>();
  const [loading, setLoading] = useListState<string>();
  
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
  }, [selectedEvent]);

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

    try {
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
      } else {
        setAllDataList([]);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      setAllDataList([]);
    } finally {
      setLoading.filter((e) => e != "getdata");
    }
  };

  // Flatten and process data
  const processedData = useMemo(() => {
    let list: any[] = [];
    let absoluteRowNum = 1;
    
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
            invoice: trans.invoice_no
          });
        }
      });
    });

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
    <div className="p-8 text-black flex flex-col gap-6 bg-white min-h-screen">
      <Flex justify="space-between" align="flex-end">
        <Stack gap={2}>
          <Title order={1} size="h2" className="font-bold tracking-tight text-[#1a1c1e]">
            Check-in Report
          </Title>
          <Text size="sm" c="dimmed">
            Daftar status kedatangan peserta berdasarkan tiket yang valid.
          </Text>
        </Stack>
      </Flex>

      <Card p={0} withBorder radius="md" style={{ overflow: 'hidden', border: '1px solid #f0f0f0' }}>
        {/* Filter Bar */}
        <Flex justify="space-between" align="center" p="md" bg="white" gap="md" wrap="wrap">
          <Button
            onClick={() => getData()}
            loading={loading.includes("getdata")}
            variant="filled"
            color="blue"
            px={12}
            title="Refresh Data"
          >
            <FontAwesomeIcon icon={faArrowsRotate} />
          </Button>

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
                  NOMOR INVOICE <SortIcon active={sortBy === 'invoice'} dir={sortDir} />
                </th>
                <th onClick={() => handleSort('nama')} style={headerStyle(false, sortBy === 'nama', sortDir)}>
                  NAMA PEMESAN <SortIcon active={sortBy === 'nama'} dir={sortDir} />
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
              </tr>
            </thead>
            <tbody>
              {loading.includes("getdata") ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "80px" }}>
                    <Text fw={500} c="dimmed">Memuat data transaksi...</Text>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "80px" }}>
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
      
      <style dangerouslySetInnerHTML={{ __html: `
        .mantine-Select-input, .mantine-Input-input {
          border-color: #e0e0e0;
        }
        .mantine-Select-input:focus, .mantine-Input-input:focus {
          border-color: #228be6;
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
