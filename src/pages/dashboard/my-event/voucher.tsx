import React, { useEffect, useState, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Input,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  NumberInput,
  Group,
  ActionIcon,
  Pagination,
  Alert,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faPencil,
  faTrash,
  faTicketAlt,
  faCalendarAlt,
  faPercent,
  faDollarSign,
  faEye,
  faInfoCircle,
  faSave,
  faXmark,
  faArrowLeft,
  faSort,
  faSortUp,
  faSortDown,
  faArrowsRotate,
  faFileExcel
} from "@fortawesome/free-solid-svg-icons";
import useLoggedUser from "@/utils/useLoggedUser";
import moment from "moment";
import axios from "axios";
import * as XLSX from "xlsx";
import config from "@/Config";
import Cookies from "js-cookie";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

// Types
interface Voucher {
  id: number;
  event_id: number | null;
  product_id: number | null;
  code: string;
  discount: number;
  type: "persentase" | "nominal";
  date_start: string;
  date_end: string;
  max_use: number;
  stock: number;
  used_count: number;
  status?: number;
  created_at: string;
  updated_at: string;
  slug_url?: string;
  module_id?: number | null;
  event?: {
    id: number;
    name: string;
  };
}

interface ModuleItem {
  id: number;
  module_name: string;
}

interface Event {
  id: number;
  name: string;
  creator_id?: number | string;
  creator?: { id: number };
  user_id?: number;
  user?: { id: number };
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const VoucherPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useLoggedUser();
  const [loading, setLoading] = useListState<string>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [voucherTargetType, setVoucherTargetType] = useState<"event" | "product">("event");
  const [products, setProducts] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'code', direction: 'asc' });

  const [formData, setFormData] = useState({
    id: null as number | null,
    slug_url: "",
    module_id: 1,
    event_id: "",
    product_id: "",
    code: "",
    discount: 0,
    type: "persentase" as "persentase" | "nominal",
    date_start: "",
    date_end: "",
    max_use: 0,
    stock: 0,
    status: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  useEffect(() => {
    fetchVouchers(1);
    fetchModules();
  }, []);

  useEffect(() => {
    if (user?.has_creator?.id) {
      fetchEvents(user.has_creator.id);
      fetchProducts(user.has_creator.id);
    }
  }, [user]);

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${config.wsUrl}modules`);
      const moduleData = response.data?.data || response.data;
      if (Array.isArray(moduleData)) {
        setModules(moduleData);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchEvents = async (creatorId: number) => {
    setLoading.append("events");
    try {
      const response = await axios.get(`${config.wsUrl}event-by-creator/${creatorId}`);
      const eventData = response.data?.data || response.data;
      if (Array.isArray(eventData)) {
        setEvents(eventData);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading.filter((e) => e !== "events");
    }
  };

  const fetchProducts = async (creatorId: number) => {
    setLoading.append("products");
    try {
      const response = await axios.get(`${config.wsUrl}product?creator_id=${creatorId}`);
      const productData = response.data?.data || response.data;
      if (Array.isArray(productData)) {
        setProducts(productData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading.filter((e) => e !== "products");
    }
  };

  const fetchVouchers = async (page: number = 1) => {
    setLoading.append("vouchers");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
      });
      if (searchTerm) params.append("search", searchTerm);
      if (eventFilter !== "all") params.append("event_id", eventFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (moduleFilter !== "all") params.append("module_id", moduleFilter);
      if (user?.has_creator?.id) params.append("user_id", user.has_creator.id.toString());

      const token = Cookies.get("token");
      const response = await axios.get(`${config.wsUrl}vouchers-bycreator?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const responseData = response.data;

      if (Array.isArray(responseData)) {
        setVouchers(responseData);
        setPagination({
          current_page: page,
          last_page: Math.ceil(responseData.length / 20),
          total: responseData.length,
          per_page: 20,
        });
      } else if (responseData && Array.isArray(responseData.data)) {
        setVouchers(responseData.data);
        setPagination({
          current_page: responseData.current_page || 1,
          last_page: responseData.last_page || 1,
          total: responseData.total || responseData.data.length,
          per_page: responseData.per_page || 20,
        });
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setVouchers([]);
    } finally {
      setLoading.filter((e) => e !== "vouchers");
    }
  };

  const handlePageChange = (page: number) => fetchVouchers(page);

  useEffect(() => {
    const timer = setTimeout(() => fetchVouchers(1), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, eventFilter, typeFilter, statusFilter, moduleFilter]);

  const handleCreateClick = () => {
    setVoucherTargetType("event");
    setFormData({
      id: null,
      slug_url: "",
      module_id: 1,
      event_id: events.length > 0 ? events[0].id.toString() : "",
      product_id: products.length > 0 ? products[0].id.toString() : "",
      code: "",
      discount: 0,
      type: "persentase",
      date_start: moment().format("YYYY-MM-DD"),
      date_end: moment().add(30, 'days').format("YYYY-MM-DD"),
      max_use: 100,
      stock: 100,
      status: 1,
    });
    setIsEditMode(false);
    setIsFormVisible(true);
  };

  const handleEditClick = (voucher: Voucher) => {
    setVoucherTargetType(voucher.product_id ? "product" : "event");
    setFormData({
      id: voucher.id,
      slug_url: voucher.slug_url || "",
      module_id: voucher.module_id || (voucher.product_id ? 2 : 1),
      event_id: voucher.event_id?.toString() || "",
      product_id: voucher.product_id?.toString() || "",
      code: voucher.code,
      discount: voucher.discount,
      type: voucher.type,
      date_start: voucher.date_start.split("T")[0],
      date_end: voucher.date_end.split("T")[0],
      max_use: voucher.max_use,
      stock: voucher.stock,
      status: voucher.status || 1,
    });
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  const handleViewClick = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setVoucherToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleSaveVoucher = async () => {
    if ((formData.module_id === 1 && !formData.event_id) || (formData.module_id === 2 && !formData.product_id) || !formData.code) {
      notifications.show({ title: t("common.warning"), message: t("voucher.warning"), color: "yellow" });
      return;
    }
    const payload = {
      module_id: formData.module_id,
      event_id: formData.module_id === 1 ? formData.event_id.toString() : null,
      product_id: formData.module_id === 2 ? Number(formData.product_id) : null,
      code: formData.code,
      discount: formData.discount,
      type: formData.type,
      date_start: formData.date_start,
      date_end: formData.date_end,
      max_use: formData.max_use,
      stock: formData.stock,
      status: formData.status,
      ...(!formData.id && user?.has_creator?.id ? { creator_id: user.has_creator.id } : {}),
    };
    setLoading.append("save");
    try {
      const token = Cookies.get("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (formData.id) {
        await axios.put(`${config.wsUrl}vouchers/${formData.slug_url || formData.id}`, payload, { headers });
        notifications.show({ title: t("common.success"), message: t("voucher.updateSuccess"), color: "green" });
      } else {
        await axios.post(`${config.wsUrl}vouchers`, payload, { headers });
        notifications.show({ title: t("common.success"), message: t("voucher.createSuccess"), color: "green" });
      }
      setIsFormVisible(false);
      fetchVouchers(formData.id ? pagination.current_page : 1);
    } catch (error: any) {
      notifications.show({ title: t("common.error"), message: t("voucher.errorPrefix", { msg: error.response?.data?.message || error.message }), color: "red" });
    } finally {
      setLoading.filter((e) => e !== "save");
    }
  };

  const handleDeleteVoucher = async () => {
    if (!voucherToDelete) return;
    setLoading.append("delete");
    try {
      const token = Cookies.get("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${config.wsUrl}vouchers/${voucherToDelete}`, { headers });
      notifications.show({ title: t("common.success"), message: t("voucher.deleteSuccess"), color: "green" });
      setDeleteModalOpen(false);
      fetchVouchers(pagination.current_page);
    } catch (error: any) {
      notifications.show({ title: t("common.error"), message: error.response?.data?.message || t("voucher.deleteFailed"), color: "red" });
    } finally {
      setLoading.filter((e) => e !== "delete");
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return faSort;
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  };

  const sortedVouchers = useMemo(() => {
    let result = [...vouchers];

    // Frontend Filtering for better UX
    if (searchTerm || eventFilter !== "all" || typeFilter !== "all" || statusFilter !== "all" || moduleFilter !== "all") {
      result = result.filter((v) => {
        // Search Filter (Code and Event Name)
        const matchesSearch = !searchTerm || 
          v.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (v.event?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        // Event Filter
        const matchesEvent = eventFilter === "all" || v.event_id?.toString() === eventFilter;
        
        // Type Filter
        const matchesType = typeFilter === "all" || v.type === typeFilter;
        
        // Status Filter (Calculated status)
        let matchesStatus = true;
        if (statusFilter !== "all") {
          const now = moment();
          const startDate = moment(v.date_start);
          const endDate = moment(v.date_end);
          const sysStat = v.status === 1 ? "Aktif" : "Nonaktif";
          
          let bStat = "Aktif";
          if (now.isBefore(startDate)) bStat = "Belum Mulai";
          else if (now.isAfter(endDate)) bStat = "Kadaluarsa";
          else if (v.used_count >= v.max_use) bStat = "Terpakai";
          else if (v.stock <= 0) bStat = "Habis";
          else if (sysStat === "Nonaktif") bStat = "Nonaktif";

          if (statusFilter === "active") matchesStatus = bStat === "Aktif";
          else if (statusFilter === "inactive") matchesStatus = bStat === "Nonaktif";
          else if (statusFilter === "expired") matchesStatus = bStat === "Kadaluarsa";
        }

        // Module Filter
        const matchesModule = moduleFilter === "all" || 
          (moduleFilter === "1" && !!v.event_id && !v.product_id) || 
          (moduleFilter === "2" && !!v.product_id) ||
          (v.module_id?.toString() === moduleFilter);

        return matchesSearch && matchesEvent && matchesType && matchesStatus && matchesModule;
      });
    }

    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        let valA = "";
        let valB = "";
        if (sortConfig.key === 'code') {
          valA = (a.code || "").toLowerCase();
          valB = (b.code || "").toLowerCase();
        } else if (sortConfig.key === 'type') {
          valA = a.event_id && !a.product_id ? "event" : "produk";
          valB = b.event_id && !b.product_id ? "event" : "produk";
        } else if (sortConfig.key === 'stock') {
          return sortConfig.direction === 'asc' ? (a.stock || 0) - (b.stock || 0) : (b.stock || 0) - (a.stock || 0);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [vouchers, sortConfig, searchTerm, eventFilter, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = vouchers.length;
    const used = vouchers.reduce((sum, v) => sum + (v.used_count || 0), 0);
    return { total, used };
  }, [vouchers]);

  const handleExport = () => {
    try {
      if (sortedVouchers.length === 0) {
        alert(t("voucher.exportEmpty"));
        return;
      }
      const rows = sortedVouchers.map((v, idx) => {
        const now = moment();
        const startDate = moment(v.date_start);
        const endDate = moment(v.date_end);
        const sysStat = v.status === 1 ? "Aktif" : "Nonaktif";
        let bStat = "Aktif";
        if (now.isBefore(startDate)) bStat = "Belum Mulai";
        else if (now.isAfter(endDate)) bStat = "Kadaluarsa";
        else if (v.used_count >= v.max_use) bStat = "Terpakai";
        else if (v.stock <= 0) bStat = "Habis";
        else if (sysStat === "Nonaktif") bStat = "Nonaktif";

        const discount = v.type === "persentase" ? `${v.discount}%` : `Rp ${v.discount.toLocaleString()}`;

        return {
          No: idx + 1,
          Kode: v.code,
          Tipe: v.event_id && !v.product_id ? "Event" : "Produk",
          Diskon: discount,
          Kuota: v.max_use,
          Terpakai: v.used_count,
          Stok: v.stock,
          "Periode Mulai": moment(v.date_start).format("YYYY-MM-DD"),
          "Periode Berakhir": moment(v.date_end).format("YYYY-MM-DD"),
          Status: bStat,
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Vouchers");
      const today = moment().format("YYYY-MM-DD");
      XLSX.writeFile(wb, `vouchers-${today}.xlsx`);
    } catch (err) {
      console.error("Export voucher error:", err);
      alert(t("voucher.exportError"));
    }
  };

  const renderList = () => (
    <Stack gap={25}>
<Flex gap={20} justify="space-between" align="center" wrap="wrap">
<Flex align="center" gap={15}>
<button
type="button"
onClick={() => router.push('/dashboard/my-event')}
className="w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
>
<FontAwesomeIcon icon={faArrowLeft} />
</button>
<Stack gap={0}>
<Title order={1} size="h4" className="!text-lg md:!text-2xl">{t("voucher.title")}</Title>
<Text size="sm" c="gray" className="!text-xs md:!text-sm">{t("voucher.subtitle")}</Text>
</Stack>
</Flex>
        <Flex gap="md" align="center">
          <Card withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">{t("voucher.totalVoucher")}</Text>
            <Text size="lg" fw={700}>{stats.total}</Text>
          </Card>
          <Card withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">{t("voucher.totalUsed")}</Text>
            <Text size="lg" fw={700} c="blue">{stats.used}</Text>
          </Card>
          <Button 
            onClick={handleCreateClick} 
            color="blue" 
            size="md" 
            radius="lg" 
            px={24}
            title={t("voucher.createVoucher")}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Flex>
      </Flex>

      <Card withBorder p="md" radius="md" shadow="sm">
        <div className="overflow-x-auto">
          <Flex gap="md" align="center" wrap="nowrap" style={{ minWidth: 'max-content' }}>
          <TextInput className="shrink-0" placeholder={t("voucher.searchCode")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 200 }} leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />} />
          <Select className="shrink-0" placeholder={t("voucher.allModules")} value={moduleFilter} onChange={(v) => setModuleFilter(v || "all")} data={[{ value: "all", label: t("voucher.allModules") }, { value: "1", label: "Event" }, { value: "2", label: "Produk" }]} style={{ width: 130 }} />
          <Select className="shrink-0" placeholder={t("voucher.allEvents")} value={eventFilter} onChange={(v) => setEventFilter(v || "all")} data={[{ value: "all", label: t("voucher.allEvents") }, ...events.map(e => ({ value: e.id.toString(), label: e.name }))]} style={{ width: 160 }} />
          <Select className="shrink-0" placeholder={t("voucher.allTypes")} value={typeFilter} onChange={(v) => setTypeFilter(v || "all")} data={[{ value: "all", label: t("voucher.allTypes") }, { value: "persentase", label: t("voucher.percentage") }, { value: "nominal", label: t("voucher.nominal") }]} style={{ width: 130 }} />
          <Select className="shrink-0" placeholder={t("voucher.allStatus")} value={statusFilter} onChange={(v) => setStatusFilter(v || "all")} data={[{ value: "all", label: t("voucher.allStatus") }, { value: "active", label: t("common.active") }, { value: "inactive", label: t("common.inactive") }, { value: "expired", label: t("voucher.expired") }]} style={{ width: 130 }} />
          <Button className="shrink-0" variant="light" color="gray" onClick={() => fetchVouchers(1)} loading={loading.includes("vouchers")} px={18}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
          <Button className="shrink-0" variant="filled" color="green" radius="md" leftSection={<FontAwesomeIcon icon={faFileExcel} />} onClick={handleExport} disabled={sortedVouchers.length === 0}>{t("voucher.export")}</Button>
          <Button className="shrink-0" variant="light" color="gray" onClick={() => { setSearchTerm(""); setEventFilter("all"); setTypeFilter("all"); setStatusFilter("all"); setModuleFilter("all"); fetchVouchers(1); }}>{t("voucher.reset")}</Button>
          </Flex>
        </div>
      </Card>

      <Card withBorder p={0} radius="md" shadow="sm" style={{ overflow: 'hidden' }}>
        <Box style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {[
                  { label: t("voucher.colNo"), center: true, sortKey: null, sticky: false },
                  { label: t("voucher.colCode"), center: false, sortKey: 'code', sticky: false },
                  { label: t("voucher.colType"), center: false, sortKey: 'type', sticky: false },
                  { label: t("voucher.colDiscount"), center: true, sortKey: null, sticky: false },
                  { label: t("voucher.colPeriod"), center: false, sortKey: null, sticky: false },
                  { label: t("voucher.colQuota"), center: false, sortKey: null, sticky: false },
                  { label: t("voucher.colStock"), center: true, sortKey: 'stock', sticky: false },
                  { label: t("voucher.colStatus"), center: true, sortKey: null, sticky: false },
                  { label: t("common.actions"), center: true, sortKey: null, sticky: true }
                ].map((col, i) => (
                  <th key={i} onClick={() => col.sortKey && requestSort(col.sortKey)} style={{
                    padding: '14px', textAlign: col.center ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: '#495057', textTransform: 'uppercase', borderBottom: '2px solid #e9ecef', cursor: col.sortKey ? 'pointer' : 'default',
                    position: col.sticky ? 'sticky' : 'static', right: col.sticky ? 0 : 'auto', backgroundColor: col.sticky ? '#f8f9fa' : 'transparent', zIndex: col.sticky ? 10 : 1, boxShadow: col.sticky ? '-2px 0 5px rgba(0,0,0,0.02)' : 'none'
                  }}>
                    <Flex align="center" gap={6} justify={col.center ? 'center' : 'flex-start'}>
                      {col.label}
                      {col.sortKey && <FontAwesomeIcon icon={getSortIcon(col.sortKey)} size="xs" style={{ color: '#adb5bd' }} />}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.includes("vouchers") ? <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center' }}><Text c="dimmed">{t("common.loading")}</Text></td></tr> :
                sortedVouchers.length === 0 ? <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center' }}><Text c="dimmed">{t("voucher.noVouchers")}</Text></td></tr> :
                  sortedVouchers.map((v, idx) => {
                    const now = moment();
                    const startDate = moment(v.date_start);
                    const endDate = moment(v.date_end);
                    let bStat = t("common.active"); let sCol = "green"; let sysStat = v.status === 1 ? "Aktif" : "Nonaktif";
                    if (now.isBefore(startDate)) { bStat = t("voucher.notStarted"); sCol = "blue"; }
                    else if (now.isAfter(endDate)) { bStat = t("voucher.expired"); sCol = "red"; }
                    else if (v.used_count >= v.max_use) { bStat = t("voucher.used"); sCol = "orange"; }
                    else if (v.stock <= 0) { bStat = t("voucher.outOfStock"); sCol = "gray"; }
                    else if (sysStat === "Nonaktif") { bStat = t("common.inactive"); sCol = "gray"; }

                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="xs" fw={700}>{(pagination.current_page - 1) * pagination.per_page + idx + 1}</Text></td>
                        <td style={{ padding: '12px 14px' }}><Text size="sm" fw={700} c="blue">{v.code}</Text></td>
                        <td style={{ padding: '12px 14px' }}>
                          <Badge variant="light" color={v.event_id && !v.product_id ? "blue" : "orange"} size="sm">
                            {v.event_id && !v.product_id ? t("voucher.eventBadge") : t("voucher.productBadge")}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}><Badge variant="light" color={v.type === "persentase" ? "blue" : "green"}>{v.type === "persentase" ? `${v.discount}%` : `Rp ${v.discount.toLocaleString()}`}</Badge></td>
                        <td style={{ padding: '12px 14px' }}><Text size="xs" c="dimmed">{moment(v.date_start).format("DD/MM/YY")} - {moment(v.date_end).format("DD/MM/YY")}</Text></td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="xs" fw={600}>{v.used_count}/{v.max_use}</Text></td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="sm" fw={700}>{v.stock}</Text></td>
                        <td style={{ padding: '12px 14px' }}><Flex justify="center" direction="column" align="center"><Badge variant="filled" color={sCol} size="sm" style={{ minWidth: 100 }}>{bStat}</Badge></Flex></td>
                        <td style={{ padding: '12px 14px', position: 'sticky', right: 0, backgroundColor: 'inherit', textAlign: 'center', borderLeft: '1px solid #f1f3f5' }}>
                          <Flex gap={8} justify="center">
                            <ActionIcon variant="subtle" color="blue" onClick={() => handleViewClick(v)}><FontAwesomeIcon icon={faEye} size="xs" /></ActionIcon>
                            <ActionIcon variant="subtle" color="orange" onClick={() => handleEditClick(v)}><FontAwesomeIcon icon={faPencil} size="xs" /></ActionIcon>
                            <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteClick(v.id)}><FontAwesomeIcon icon={faTrash} size="xs" /></ActionIcon>
                          </Flex>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </Box>
      </Card>
      {vouchers.length > 0 && (
        <Flex justify="space-between" align="center" wrap="wrap" gap="xs">
          <Text size="xs" c="dimmed">{t("voucher.totalCount", { count: pagination.total })}</Text>
          <Pagination value={pagination.current_page} onChange={handlePageChange} total={pagination.last_page} radius="md" size="sm" withEdges />
        </Flex>
      )}
    </Stack>
  );

  const renderForm = () => (
    <Stack gap={25}>
      {/* Header */}
      <Flex align="center" gap={15}>
        <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="md">
          <FontAwesomeIcon icon={faArrowLeft} />
        </ActionIcon>
        <Stack gap={0}>
          <Title order={2} size="h3">{isEditMode ? t("voucher.editVoucher") : t("voucher.createVoucher")}</Title>
          <Text size="xs" c="dimmed">{t("voucher.formSubtitle")}</Text>
        </Stack>
      </Flex>

      <form id="voucher-form" onSubmit={(e) => { e.preventDefault(); handleSaveVoucher(); }}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label={t("voucher.moduleLabel")} data={modules.filter(m => m.id === 1 || m.id === 2).map(m => ({ value: m.id.toString(), label: m.module_name }))} value={formData.module_id?.toString()} onChange={v => {
                const newModuleId = Number(v) || 1;
                setFormData({ ...formData, module_id: newModuleId });
                setVoucherTargetType(newModuleId === 2 ? "product" : "event");
              }} />
              {formData.module_id === 1 ? (
                <Select label={t("voucher.eventLabel")} data={events.map(e => ({ value: e.id.toString(), label: e.name }))} value={formData.event_id} onChange={v => setFormData({ ...formData, event_id: v || "" })} required />
              ) : (
                <Select label={t("voucher.productLabel")} data={products.map(p => ({ value: p.id.toString(), label: p.product_name || p.name }))} value={formData.product_id} onChange={v => setFormData({ ...formData, product_id: v || "" })} required />
              )}
              <TextInput label={t("voucher.codeLabel")} value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
              <Select label={t("voucher.typeLabel")} data={[{ value: "persentase", label: t("voucher.percentLabel") }, { value: "nominal", label: t("voucher.nominalLabel") }]} value={formData.type} onChange={v => setFormData({ ...formData, type: v as any })} />
              <NumberInput label={t("voucher.discountLabel")} value={formData.discount} onChange={v => setFormData({ ...formData, discount: Number(v) })} required />
              <TextInput label={t("voucher.startLabel")} type="date" value={formData.date_start} onChange={e => setFormData({ ...formData, date_start: e.target.value })} />
              <TextInput label={t("voucher.endLabel")} type="date" value={formData.date_end} onChange={e => setFormData({ ...formData, date_end: e.target.value })} />
              <NumberInput label={t("voucher.quotaLabel")} value={formData.max_use} onChange={v => setFormData({ ...formData, max_use: Number(v) })} />
              <NumberInput label={t("voucher.stockLabel")} value={formData.stock} onChange={v => setFormData({ ...formData, stock: Number(v) })} />
              <Select label={t("common.status")} data={[{ value: "1", label: t("common.active") }, { value: "0", label: t("common.inactive") }]} value={formData.status.toString()} onChange={v => setFormData({ ...formData, status: parseInt(v || "1") })} />
            </div>
          </Stack>
        </Card>

        {/* Floating Footer - Fixed to Viewport Bottom (Edge-to-Edge) */}
        <Box
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]"
        >
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)} leftSection={<FontAwesomeIcon icon={faXmark} />}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="voucher-form"
              color="blue"
              loading={loading.includes("save")}
              leftSection={<FontAwesomeIcon icon={faSave} />}
            >
              {t("common.save")}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  return (
    <div className="p-5 md:p-8 pb-[100px] min-h-screen bg-[#fcfcfc]">
      {isFormVisible ? renderForm() : renderList()}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title={t("voucher.deleteTitle")} centered size="sm">
        <Stack gap="md">
          <Text size="sm">{t("voucher.deleteConfirm")}</Text>
          <Flex justify="flex-end" gap="sm"><Button variant="subtle" color="gray" onClick={() => setDeleteModalOpen(false)}>{t("common.cancel")}</Button><Button color="red" onClick={handleDeleteVoucher} loading={loading.includes("delete")}>{t("common.delete")}</Button></Flex>
        </Stack>
      </Modal>
      <Modal opened={viewModalOpen} onClose={() => setViewModalOpen(false)} title={t("voucher.detailTitle")} size="md">
        {selectedVoucher && (
          <Stack gap="md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Text size="xs" c="dimmed">{t("voucher.codeField")}</Text><Text fw={700}>{selectedVoucher.code}</Text></div>
              <div><Text size="xs" c="dimmed">{selectedVoucher.product_id ? t("voucher.productBadge") : t("voucher.eventBadge")}</Text><Text fw={700}>{selectedVoucher.event?.name || selectedVoucher.event_id || selectedVoucher.product_id}</Text></div>
            </div>
            <Alert color="blue" icon={<FontAwesomeIcon icon={faInfoCircle} />}>{t("voucher.validLabel")} {moment(selectedVoucher.date_start).format("DD/MM/YY")} - {moment(selectedVoucher.date_end).format("DD/MM/YY")}</Alert>
            <Button fullWidth variant="light" onClick={() => setViewModalOpen(false)}>{t("common.close")}</Button>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default VoucherPage;