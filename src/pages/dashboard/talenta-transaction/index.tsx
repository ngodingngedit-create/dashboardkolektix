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
  Stack,
  Card as MantineCard,
  Button,
  Modal,
  Grid,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faStar,
  faTimes,
  faReceipt,
  faEye,
  faUndo,
  faStore
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react/dist/iconify.js";
import fetch from "@/utils/fetch";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import TablePagination from "@/components/TablePagination";
import * as XLSX from "xlsx";

type DataResponse = {
  id?: number;
  order_no?: string;
  total_qty?: number;
  total_price?: number;
  grandtotal?: number;
  final_price?: number;
  payment_method?: string;
  payment_status?: string;
  transaction_status_id?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  talenta?: {
    id?: number;
    name?: string;
  } | null;
  product_name?: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
  details?: any[];
};

export default function TalentaTransaction() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<DataResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DataResponse | null>(null);

  const handleViewDetail = (item: DataResponse) => {
    setSelectedTransaction(item);
    setDetailModalOpened(true);
  };

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
      url: "talenta-mytransaction?" + (params || ""),
      method: "GET",
      data: {},
      success: (response) => {
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
      return date.toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusInfo = (item: DataResponse) => {
    const statusId = item.transaction_status_id;
    const statusStr = (item.payment_status || "").toLowerCase();

    if (statusId === 2 || statusStr.includes("paid") || statusStr.includes("success") || statusStr.includes("berhasil")) {
      return { text: t('talentaTrx.status.success'), color: "green" };
    } else if (statusId === 1 || statusStr.includes("pending") || statusStr.includes("menunggu") || statusStr.includes("unpaid")) {
      return { text: t('talentaTrx.status.pending'), color: "yellow" };
    } else if (statusId === 3 || statusStr.includes("gagal") || statusStr.includes("failed") || statusStr.includes("cancel")) {
      return { text: t('talentaTrx.status.failed'), color: "red" };
    } else if (statusId === 4 || statusStr.includes("expired")) {
      return { text: t('talentaTrx.status.expired'), color: "gray" };
    }
    return { text: item.payment_status || "-", color: "gray" };
  };

  const filtered = useMemo(() => {
    let result = [...data];

    if (filterValue) {
      result = result.filter(
        (item) =>
          (item.product_name || "").toLowerCase().includes(filterValue.toLowerCase()) ||
          (item.talenta?.name || "").toLowerCase().includes(filterValue.toLowerCase()) ||
          (item.user?.name || "").toLowerCase().includes(filterValue.toLowerCase()) ||
          (item.order_no || "").toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (dateFilter) {
      const sel = new Date(dateFilter);
      sel.setHours(0, 0, 0, 0);
      result = result.filter((item) => {
        const d = parseDate(item.created_at);
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
    
    const totalSales = successfulTrans.reduce((sum, item) => sum + Number(item.final_price || item.grandtotal || item.total_price || 0), 0);
    const totalTransactions = successfulTrans.length;
    const totalBooking = data.length;

    return { totalSales, totalTransactions, totalBooking };
  }, [data]);

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

  const handleExport = () => {
    try {
      if (!filtered || filtered.length === 0) {
        alert(t('talentaTrx.exportEmpty'));
        return;
      }
      const rows = filtered.map((item, index) => ({
        No: index + 1,
        "Order No": item.order_no || '-',
        Tanggal: formatDate(item.created_at),
        Talenta: item.product_name || item.talenta?.name || '-',
        Client: item.user?.name || '-',
        Email: item.user?.email || '-',
        Total: item.final_price || item.grandtotal || item.total_price || 0,
        Status: getStatusInfo(item).text,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Talent Transactions");
      const timestamp = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `talent-transactions-${timestamp}.xlsx`);
    } catch (err) {
      console.error("Error exporting transactions:", err);
      alert(t('talentaTrx.exportError'));
    }
  };

  return (
    <>
<Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap="md" mx={15} mt={15} mb={10}>
<Flex align="center" gap={15}>
<button
type="button"
onClick={() => router.push('/dashboard/talenta')}
className="w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
>
<Icon icon="ph:arrow-left-bold" />
</button>
<Stack gap={0}>
<Text fw={800} style={{ fontSize: "clamp(20px, 5vw, 26px)" }} mb={0} c="dark.9">
{t('talentaTrx.title')}
</Text>
<Text size="sm" c="gray">
{t('talentaTrx.subtitle')}
</Text>
</Stack>
</Flex>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <MantineCard withBorder radius="md" p="xs">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">{t('talentaTrx.totalSales')}</Text>
            <Text size="lg" fw={700}>Rp {stats.totalSales.toLocaleString('id-ID')}</Text>
          </MantineCard>
          <MantineCard withBorder radius="md" p="xs">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">{t('talentaTrx.totalTransactions')}</Text>
            <Text size="lg" fw={700}>{stats.totalTransactions}</Text>
          </MantineCard>
          <MantineCard withBorder radius="md" p="xs">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">{t('talentaTrx.totalBookings')}</Text>
            <Text size="lg" fw={700}>{stats.totalBooking}</Text>
          </MantineCard>
        </div>
      </Flex>

      <MantineCard p={25} m={15} withBorder radius="md">
        <Stack gap="xl">
          <Box mt={0}>
            {/* Filter row — satu baris, scroll-x di layar sempit */}
            <div className="overflow-x-auto flex gap-2 items-center mb-sm" style={{ marginBottom: 12 }}>
              <MantineSelect
                value={rowsPerPage.toString()}
                onChange={(val) => {
                  setRowsPerPage(Number(val));
                  setPage(1);
                }}
                data={["10", "20", "50", "100"]}
                style={{ width: 70, flexShrink: 0 }}
                size="sm"
              />
              <MantineTextInput
                type="date"
                placeholder={t('talentaTrx.filterDate')}
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                size="sm"
                style={{ width: 160, flexShrink: 0 }}
                leftSection={<FontAwesomeIcon icon={faCalendarAlt} style={{ width: 14 }} />}
              />
              <MantineTextInput
                placeholder={t('talentaTrx.searchPlaceholder')}
                leftSection={<Icon icon="solar:magnifer-linear" width={18} />}
                value={filterValue}
                onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
                style={{ width: 280, flexShrink: 0 }}
                size="sm"
              />
              <Button
                variant="filled"
                color="green"
                radius="md"
                size="sm"
                leftSection={<Icon icon="uiw:download" width={16} />}
                onClick={handleExport}
                disabled={filtered.length === 0}
                className="shrink-0"
              >
                {t('talentaTrx.export')}
              </Button>
              <Tooltip label={t('talentaTrx.resetFilters')}>
                <ActionIcon
                  variant="filled"
                  color="gray.1"
                  size="40px"
                  radius="xl"
                  onClick={clearFilters}
                  styles={{
                    root: { color: '#495057', flexShrink: 0 }
                  }}
                >
                  <FontAwesomeIcon icon={faUndo} style={{ width: 16 }} />
                </ActionIcon>
              </Tooltip>
            </div>

            <Flex align="center" gap="sm" mb="md">
              <Text size="xs" c="gray">
                {t('talentaTrx.showing', {
                  from: filtered.length > 0 ? (page - 1) * rowsPerPage + 1 : 0,
                  to: filtered.length > 0 ? Math.min(page * rowsPerPage, filtered.length) : 0,
                  total: filtered.length,
                })}
              </Text>
            </Flex>

            {/* Table — scroll-x di layar sempit */}
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
                    <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#777", width: 48 }}>#</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#777", cursor: "pointer" }} onClick={() => handleSort("order_no")}>{t('talentaTrx.table.invoice')} <SortIcon col="order_no" /></th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#777", cursor: "pointer" }} onClick={() => handleSort("created_at")}>{t('talentaTrx.table.orderDate')} <SortIcon col="created_at" /></th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#777" }}>{t('talentaTrx.table.talent')}</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#777", cursor: "pointer" }} onClick={() => handleSort("user")}>{t('talentaTrx.table.client')} <SortIcon col="user" /></th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#777", cursor: "pointer" }} onClick={() => handleSort("final_price")}>{t('talentaTrx.table.totalPayment')} <SortIcon col="final_price" /></th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#777", cursor: "pointer", position: "sticky", right: 100, backgroundColor: "#f5f7fa", zIndex: 2, boxShadow: "-2px 0 5px rgba(0,0,0,0.06)" }} onClick={() => handleSort("payment_status")}>{t('common.status')} <SortIcon col="payment_status" /></th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#777", position: "sticky", right: 0, backgroundColor: "#f5f7fa", zIndex: 2, boxShadow: "-2px 0 5px rgba(0,0,0,0.06)" }}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "60px 14px", textAlign: "center" }}>
                        <Flex justify="center" align="center" gap="sm">
                          <div
                            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                            style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e9ecef", borderTopColor: "#228be6", animation: "spin 0.8s linear infinite" }}
                          />
                          <Text size="sm" c="dimmed">{t('common.loading')}</Text>
                        </Flex>
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "60px 14px", textAlign: "center" }}>
                        <Stack align="center" gap={8}>
                          <FontAwesomeIcon icon={faStar} style={{ width: 36, height: 36, color: "#adb5bd" }} />
                          <Text size="sm" c="dimmed" fw={500}>{t('talentaTrx.empty')}</Text>
                          {hasActiveFilters && (
                            <Text size="xs" c="gray">{t('talentaTrx.emptyFilterPrefix')} <span style={{ color: "#228be6", cursor: "pointer" }} onClick={clearFilters}>{t('talentaTrx.clearFilters')}</span></Text>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, idx) => {
                      const rowNumber = (page - 1) * rowsPerPage + idx + 1;
                      const statusInfo = getStatusInfo(item);
                      return (
                        <tr key={item.id ?? idx} style={{ borderBottom: "1px solid #f0f0f0" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafd")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap", textAlign: "center", width: 48 }}><Text size="sm" c="dimmed" fw={500}>{rowNumber}</Text></td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Flex align="center" gap={6}>
                              <FontAwesomeIcon icon={faReceipt} style={{ width: 12, height: 12, color: "#868e96" }} />
                              <Text size="sm" fw={600} c="blue">{item.order_no || "-"}</Text>
                            </Flex>
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}><Text size="sm" fw={600}>{formatDate(item.created_at)}</Text></td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Flex align="center" gap={6}>
                              <FontAwesomeIcon icon={faStar} style={{ width: 12, height: 12, color: "#868e96" }} />
                              <Text size="sm">{item.product_name || item.talenta?.name || "-"}</Text>
                            </Flex>
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Flex align="center" gap={6}>
                              <FontAwesomeIcon icon={faUser} style={{ width: 12, height: 12, color: "#868e96" }} />
                              <Box>
                                <Text size="sm">{item.user?.name || "-"}</Text>
                                {item.user?.email && <Text size="xs" c="dimmed">{item.user.email}</Text>}
                              </Box>
                            </Flex>
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}><Text size="sm" fw={600}>Rp {Number(item.final_price || item.grandtotal || item.total_price || 0).toLocaleString('id-ID')}</Text></td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap", position: "sticky", right: 100, backgroundColor: "white", zIndex: 1, boxShadow: "-2px 0 5px rgba(0,0,0,0.07)" }}>
                            <Badge color={statusInfo.color} variant="filled" style={{ fontWeight: 600, width: "100%", minWidth: "max-content" }}>{statusInfo.text}</Badge>
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap", position: "sticky", right: 0, backgroundColor: "white", zIndex: 1, boxShadow: "-2px 0 5px rgba(0,0,0,0.07)", textAlign: "center" }}>
                            <ActionIcon variant="subtle" color="blue" onClick={() => handleViewDetail(item)}>
                              <FontAwesomeIcon icon={faEye} style={{ width: 14, height: 14 }} />
                            </ActionIcon>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </Box>

            <TablePagination
              page={page}
              onPageChange={setPage}
              total={filtered.length}
              rowsPerPage={rowsPerPage}
              unit="transaksi"
            />
          </Box>
        </Stack>
      </MantineCard>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Modal opened={detailModalOpened} onClose={() => setDetailModalOpened(false)} title={<Text fw={700}>{t('talentaTrx.modal.title')}</Text>} size="lg" radius="md">
        {selectedTransaction && (
          <Stack gap="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">{t('talentaTrx.modal.orderNo')}</Text>
                <Text fw={600}>{selectedTransaction.order_no || "-"}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">Status</Text>
                <Badge color={getStatusInfo(selectedTransaction).color}>{getStatusInfo(selectedTransaction).text}</Badge>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">{t('talentaTrx.modal.transactionDate')}</Text>
                <Text fw={600}>{formatDate(selectedTransaction.created_at)}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">{t('talentaTrx.table.talent')}</Text>
                <Text fw={600}>{selectedTransaction.product_name || selectedTransaction.talenta?.name || "-"}</Text>
              </Grid.Col>
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">{t('talentaTrx.modal.client')}</Text>
                <Text fw={600}>{selectedTransaction.user?.name || "-"}</Text>
                <Text size="sm">{selectedTransaction.user?.email || "-"}</Text>
              </Grid.Col>
              <Grid.Col span={12}>
                <Flex justify="space-between" mt="md" style={{ borderTop: "1px dashed #e0e0e0", paddingTop: 10 }}>
                  <Text fw={600}>{t('talentaTrx.table.totalPayment')}</Text>
                  <Text fw={700} c="blue">Rp {Number(selectedTransaction.final_price || selectedTransaction.grandtotal || selectedTransaction.total_price || 0).toLocaleString('id-ID')}</Text>
                </Flex>
              </Grid.Col>
            </Grid>
          </Stack>
        )}
      </Modal>
    </>
  );
}
