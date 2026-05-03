import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Flex,
  Select as MantineSelect,
  TextInput as MantineTextInput,
  ActionIcon,
  Text,
  Box,
  Badge,
  Tooltip,
  Pagination as MantinePagination,
  Stack,
  Card as MantineCard,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faStore,
  faTimes,
  faClock,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react/dist/iconify.js";
import fetch from "@/utils/fetch";

// Matches actual API: GET creator-data/venue-transaction
type VenueDetail = {
  id?: number;
  name?: string;
  location_name?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  starting_price?: number;
  minimum_price?: number;
};

type DataResponse = {
  id?: number;
  invoice_no?: string;
  venue_id?: string;
  user_id?: string;
  total_qty?: number;
  total_price?: number;
  grandtotal?: number;
  admin_fee?: number;
  payment_method?: string;
  payment_status?: string;
  transaction_status_id?: number;
  start_date?: string;
  end_date?: string;
  event_name?: string | null;
  created_at?: string;
  updated_at?: string;
  venue?: VenueDetail;
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
  details?: any[];
};

export default function VenueTransaction() {
  const [data, setData] = useState<DataResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ marginLeft: 4, opacity: sortBy === col ? 1 : 0.3, cursor: "pointer" }}>
      {sortBy === col && sortDir === "desc" ? "↓" : "↑"}
    </span>
  );

  const getData = async (params?: string) => {
    setLoading(true);
    await fetch<any, any>({
      url: "creator-data/venue-transaction?" + (params || ""),
      method: "GET",
      data: {},
      success: (response) => {
        // real response shape: { status, data: { current_page, data: [...] } }
        const res = response?.data ?? response;
        const list: DataResponse[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setData(list);
      },
      error: () => {},
      complete: () => setLoading(false),
    });
  };

  useEffect(() => {
    getData();
  }, []);

  const parseDate = (dateString?: string): Date => {
    if (!dateString || dateString === "-") return new Date(0);
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? new Date(0) : d;
    } catch {
      return new Date(0);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = parseDate(dateString);
      if (date.getTime() === 0) return dateString;
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Uses actual API fields: transaction_status_id + payment_status string
  const getStatusInfo = (item: DataResponse) => {
    const statusId = item.transaction_status_id;
    const statusStr = (item.payment_status || "").toLowerCase();

    if (statusId === 2 || statusStr.includes("paid") || statusStr.includes("success") || statusStr.includes("berhasil")) {
      return { text: "Berhasil", color: "green" };
    } else if (statusId === 1 || statusStr.includes("pending") || statusStr.includes("menunggu") || statusStr.includes("unpaid")) {
      return { text: "Pending", color: "yellow" };
    } else if (statusId === 3 || statusStr.includes("gagal") || statusStr.includes("failed") || statusStr.includes("cancel")) {
      return { text: "Gagal", color: "red" };
    } else if (statusId === 4 || statusStr.includes("expired")) {
      return { text: "Expired", color: "gray" };
    }
    return { text: item.payment_status || "-", color: "gray" };
  };

  const filtered = useMemo(() => {
    let result = [...data];

    if (filterValue) {
      result = result.filter(
        (item) =>
          (item.event_name || "").toLowerCase().includes(filterValue.toLowerCase()) ||
          (item.user?.name || "").toLowerCase().includes(filterValue.toLowerCase()) ||
          (item.venue?.name || "").toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (dateFilter) {
      const sel = new Date(dateFilter);
      sel.setHours(0, 0, 0, 0);
      result = result.filter((item) => {
        const d = parseDate(item.start_date);
        if (d.getTime() === 0) return false;
        d.setHours(0, 0, 0, 0);
        return d.getTime() === sel.getTime();
      });
    }

    return result;
  }, [data, filterValue, dateFilter]);

  const stats = useMemo(() => {
    const successfulTrans = data.filter(item => {
      const statusId = item.transaction_status_id;
      const statusStr = (item.payment_status || "").toLowerCase();
      return statusId === 2 || statusStr.includes("paid") || statusStr.includes("success") || statusStr.includes("berhasil");
    });
    
    const totalSales = successfulTrans.reduce((sum, item) => sum + (item.grandtotal || item.total_price || 0), 0);
    const totalTransactions = successfulTrans.length;
    const totalBooking = data.length;

    return { totalSales, totalTransactions, totalBooking };
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const sortedFiltered = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      let vA = a[sortBy] ?? "";
      let vB = b[sortBy] ?? "";
      if (typeof vA === "string") vA = vA.toLowerCase();
      if (typeof vB === "string") vB = vB.toLowerCase();
      if (vA < vB) return sortDir === "asc" ? -1 : 1;
      if (vA > vB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  const paginatedItems = sortedFiltered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const clearFilters = useCallback(() => {
    setFilterValue("");
    setDateFilter("");
    setPage(1);
  }, []);

  const hasActiveFilters = filterValue || dateFilter;

  return (
    <>
      <Flex justify="space-between" align="center" mx={15} mt={15} mb={10}>
        <Stack gap={0}>
          <Text fw={800} style={{ fontSize: "26px" }} mb={0} c="dark.9">
            Transaksi Venue
          </Text>
          <Text size="sm" c="gray">
            Daftar semua transaksi venue
          </Text>
        </Stack>
        <Flex gap="md" align="center">
          <MantineCard withBorder radius="md" p="xs" style={{ minWidth: 150 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Total Penjualan</Text>
            <Text size="lg" fw={700}>Rp {stats.totalSales.toLocaleString('id-ID')}</Text>
          </MantineCard>
          <MantineCard withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Total Transaksi</Text>
            <Text size="lg" fw={700}>{stats.totalTransactions}</Text>
          </MantineCard>
          <MantineCard withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Total Booking</Text>
            <Text size="lg" fw={700}>{stats.totalBooking}</Text>
          </MantineCard>
        </Flex>
      </Flex>

      <MantineCard p={25} m={15} withBorder radius="md">
        <Stack gap="xl">
          <Box mt={0}>
            {/* Row 1: rows per page kiri | filter kanan */}
            <Flex align="center" gap="sm" mb="sm" justify="space-between" wrap="wrap">
              <MantineSelect
                value={rowsPerPage.toString()}
                onChange={(val) => {
                  setRowsPerPage(Number(val));
                  setPage(1);
                }}
                data={["10", "20", "50", "100"]}
                style={{ width: 70 }}
                size="sm"
              />
              <Flex gap="sm" align="center" wrap="wrap">
                {/* Filter tanggal */}
                <Box style={{ position: "relative" }}>
                  <MantineTextInput
                    type="date"
                    placeholder="Filter tanggal"
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                    size="sm"
                    style={{ width: 160 }}
                    leftSection={<FontAwesomeIcon icon={faCalendarAlt} style={{ width: 14 }} />}
                  />
                </Box>

                {/* Searchbar */}
                <MantineTextInput
                  placeholder="Cari event, venue, atau client..."
                  leftSection={<Icon icon="solar:magnifer-linear" width={18} />}
                  value={filterValue}
                  onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
                  style={{ width: 280 }}
                  size="sm"
                />

                {/* Clear filter */}
                {hasActiveFilters && (
                  <Tooltip label="Hapus semua filter">
                    <ActionIcon variant="light" color="gray" size="sm" onClick={clearFilters}>
                      <FontAwesomeIcon icon={faTimes} style={{ width: 12 }} />
                    </ActionIcon>
                  </Tooltip>
                )}

                {/* Refresh */}
                <Tooltip label="Refresh data">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => getData()}
                    loading={loading}
                  >
                    <Icon icon="solar:refresh-linear" width={16} />
                  </ActionIcon>
                </Tooltip>
              </Flex>
            </Flex>

            {/* Info row */}
            <Flex align="center" gap="sm" mb="md">
              <Text size="xs" c="gray">
                Menampilkan{" "}
                {filtered.length > 0
                  ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, filtered.length)}`
                  : "0"}{" "}
                dari {filtered.length} transaksi
              </Text>
            </Flex>

            {/* Table */}
            <Box style={{ overflowX: "auto", overflowY: "auto", position: "relative" }}>
              <table
                style={{
                  width: "max-content",
                  minWidth: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #f0f0f0",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #e8e8e8", backgroundColor: "#f5f7fa" }}>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        width: 48,
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("invoice_no")}
                    >
                      Invoice <SortIcon col="invoice_no" />
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("created_at")}
                    >
                      Tanggal Order <SortIcon col="created_at" />
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("event_name")}
                    >
                      Nama Event <SortIcon col="event_name" />
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("venue")}
                    >
                      Venue <SortIcon col="venue" />
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("start_date")}
                    >
                      Tanggal Event <SortIcon col="start_date" />
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("user")}
                    >
                      Client <SortIcon col="user" />
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Pax
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Ruangan
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#777",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                        position: "sticky",
                        right: 0,
                        backgroundColor: "#f5f7fa",
                        zIndex: 2,
                        boxShadow: "-2px 0 5px rgba(0,0,0,0.06)",
                      }}
                      onClick={() => handleSort("payment_status")}
                    >
                      Status <SortIcon col="payment_status" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} style={{ padding: "60px 14px", textAlign: "center" }}>
                        <Flex justify="center" align="center" gap="sm">
                          <div
                            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              border: "3px solid #e9ecef",
                              borderTopColor: "#228be6",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          <Text size="sm" c="dimmed">Memuat data...</Text>
                        </Flex>
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: "60px 14px", textAlign: "center" }}>
                        <Stack align="center" gap={8}>
                          <FontAwesomeIcon icon={faStore} style={{ width: 36, height: 36, color: "#adb5bd" }} />
                          <Text size="sm" c="dimmed" fw={500}>Tidak ada transaksi venue ditemukan</Text>
                          {hasActiveFilters && (
                            <Text size="xs" c="gray">
                              Coba ubah filter atau{" "}
                              <span
                                style={{ color: "#228be6", cursor: "pointer" }}
                                onClick={clearFilters}
                              >
                                hapus filter
                              </span>
                            </Text>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, idx) => {
                      const rowNumber = (page - 1) * rowsPerPage + idx + 1;
                      const statusInfo = getStatusInfo(item);
                      return (
                        <tr
                          key={item.id ?? idx}
                          style={{ borderBottom: "1px solid #f0f0f0" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafd")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                        >
                          {/* No */}
                          <td
                            style={{
                              padding: "12px 14px",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                              width: 48,
                            }}
                          >
                            <Text size="sm" c="dimmed" fw={500}>
                              {rowNumber}
                            </Text>
                          </td>

                          {/* Invoice No */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Flex align="center" gap={6}>
                              <FontAwesomeIcon
                                icon={faReceipt}
                                style={{ width: 12, height: 12, color: "#868e96" }}
                              />
                              <Text size="sm" fw={600} c="blue" style={{ fontFamily: "monospace", letterSpacing: 0.5 }}>
                                {item.invoice_no || "-"}
                              </Text>
                            </Flex>
                          </td>

                          {/* Tanggal Order */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Text size="sm" fw={600}>
                              {formatDate(item.created_at)}
                            </Text>
                          </td>

                          {/* Nama Event */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Text size="sm" fw={600}>
                              {item.event_name || "-"}
                            </Text>
                          </td>

                          {/* Venue */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Flex align="center" gap={6}>
                              <FontAwesomeIcon
                                icon={faStore}
                                style={{ width: 12, height: 12, color: "#868e96" }}
                              />
                              <Box>
                                <Text size="sm">{item.venue?.name || "-"}</Text>
                                {item.venue?.location_name && (
                                  <Text size="xs" c="dimmed">{item.venue.location_name}</Text>
                                )}
                              </Box>
                            </Flex>
                          </td>

                          {/* Tanggal Event */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Flex align="center" gap={6}>
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                style={{ width: 12, height: 12, color: "#868e96" }}
                              />
                              <Box>
                                <Text size="sm" fw={600}>
                                  {formatDate(item.start_date)}
                                </Text>
                                {item.end_date && item.end_date !== item.start_date && (
                                  <Text size="xs" c="dimmed">
                                    s/d {formatDate(item.end_date)}
                                  </Text>
                                )}
                              </Box>
                            </Flex>
                          </td>

                          {/* Client */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Flex align="center" gap={6}>
                              <FontAwesomeIcon
                                icon={faUser}
                                style={{ width: 12, height: 12, color: "#868e96" }}
                              />
                              <Box>
                                <Text size="sm">{item.user?.name || "-"}</Text>
                                {item.user?.email && (
                                  <Text size="xs" c="dimmed">{item.user.email}</Text>
                                )}
                              </Box>
                            </Flex>
                          </td>

                          {/* Pax — from details, default '-' */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Text size="sm" c="dimmed">-</Text>
                          </td>

                          {/* Ruangan — from details, default '-' */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Text size="sm" c="dimmed">-</Text>
                          </td>

                          {/* Status — sticky */}
                          <td
                            style={{
                              padding: "12px 14px",
                              whiteSpace: "nowrap",
                              position: "sticky",
                              right: 0,
                              backgroundColor: "white",
                              zIndex: 1,
                              boxShadow: "-2px 0 5px rgba(0,0,0,0.07)",
                            }}
                          >
                            <Badge
                              color={statusInfo.color}
                              variant="filled"
                              style={{ fontWeight: 600, width: "100%", minWidth: "max-content" }}
                            >
                              {statusInfo.text}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </Box>

            {/* Empty state sudah ada di dalam tbody */}

            {/* Pagination footer */}
            <Flex
              justify="space-between"
              align="center"
              mt={0}
              px={4}
              py={14}
              style={{
                borderTop: "1px solid #ebebeb",
                backgroundColor: "#fafafa",
                borderRadius: "0 0 8px 8px",
              }}
            >
              <Text size="xs" c="dimmed">
                Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
              </Text>
              <MantinePagination
                total={totalPages}
                value={page}
                onChange={setPage}
                size="sm"
                radius="xl"
                withEdges
                color="blue"
                styles={{
                  control: { border: "1px solid #e0e0e0", fontWeight: 600 },
                }}
              />
              <Text size="xs" c="dimmed">
                {filtered.length > 0
                  ? `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, filtered.length)}`
                  : "0"}{" "}
                / {filtered.length}
              </Text>
            </Flex>
          </Box>
        </Stack>
      </MantineCard>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}