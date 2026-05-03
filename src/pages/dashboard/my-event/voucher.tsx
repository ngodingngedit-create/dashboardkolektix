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
  faArrowsRotate
} from "@fortawesome/free-solid-svg-icons";
import useLoggedUser from "@/utils/useLoggedUser";
import moment from "moment";
import axios from "axios";
import config from "@/Config";

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
  event?: {
    id: number;
    name: string;
  };
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
  const user = useLoggedUser();
  const [loading, setLoading] = useListState<string>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'code', direction: 'asc' });

  const [formData, setFormData] = useState({
    id: null as number | null,
    event_id: "",
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

  useEffect(() => {
    fetchEvents();
    fetchVouchers(1);
  }, []);

  const fetchEvents = async () => {
    setLoading.append("events");
    try {
      const response = await axios.get(`${config.wsUrl}event`);
      if (response.data && Array.isArray(response.data)) {
        const userEvents = response.data.filter((e: Event) => {
          const creatorId = e.creator_id || e.creator?.id || e.user_id || e.user?.id;
          const userId = user?.has_creator?.id;
          return creatorId ? parseInt(creatorId.toString()) === userId : true;
        });
        setEvents(userEvents.length > 0 ? userEvents : response.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading.filter((e) => e !== "events");
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
      if (user?.has_creator?.id) params.append("user_id", user.has_creator.id.toString());

      const response = await axios.get(`${config.wsUrl}vouchers?${params.toString()}`);
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
  }, [searchTerm, eventFilter, typeFilter, statusFilter]);

  const handleCreateClick = () => {
    setFormData({
      id: null,
      event_id: events.length > 0 ? events[0].id.toString() : "",
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
    setFormData({
      id: voucher.id,
      event_id: voucher.event_id?.toString() || "",
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
    if (!formData.event_id || !formData.code) {
      alert("Lengkapi data yang diperlukan");
      return;
    }
    const payload = {
      event_id: formData.event_id,
      code: formData.code,
      discount: formData.discount,
      type: formData.type,
      date_start: formData.date_start,
      date_end: formData.date_end,
      max_use: formData.max_use,
      stock: formData.stock,
      status: formData.status,
    };
    setLoading.append("save");
    try {
      if (formData.id) {
        await axios.put(`${config.wsUrl}vouchers/${formData.id}`, payload);
        alert("Voucher berhasil diperbarui");
      } else {
        await axios.post(`${config.wsUrl}vouchers`, payload);
        alert("Voucher berhasil dibuat");
      }
      setIsFormVisible(false);
      fetchVouchers(formData.id ? pagination.current_page : 1);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading.filter((e) => e !== "save");
    }
  };

  const handleDeleteVoucher = async () => {
    if (!voucherToDelete) return;
    setLoading.append("delete");
    try {
      await axios.delete(`${config.wsUrl}vouchers/${voucherToDelete}`);
      alert("Voucher berhasil dihapus");
      setDeleteModalOpen(false);
      fetchVouchers(pagination.current_page);
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menghapus voucher");
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
    if (searchTerm || eventFilter !== "all" || typeFilter !== "all" || statusFilter !== "all") {
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

        return matchesSearch && matchesEvent && matchesType && matchesStatus;
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

  const renderList = () => (
    <Stack gap={25}>
      <Flex gap={20} justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">Manajemen Voucher</Title>
          <Text size="sm" c="gray">Kelola voucher promo untuk event Anda</Text>
        </Stack>
        <Flex gap="md" align="center">
          <Card withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">TOTAL VOUCHER</Text>
            <Text size="lg" fw={700}>{stats.total}</Text>
          </Card>
          <Card withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">TOTAL TERPAKAI</Text>
            <Text size="lg" fw={700} c="blue">{stats.used}</Text>
          </Card>
          <Button 
            onClick={handleCreateClick} 
            color="blue" 
            size="md" 
            radius="lg" 
            px={24}
            title="Buat Voucher Baru"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Flex>
      </Flex>

      <Card withBorder p="md" radius="md" shadow="sm">
        <Flex gap="md" align="center" wrap="wrap">
          <TextInput placeholder="Cari kode..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: 200 }} leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />} />
          <Select placeholder="Semua Event" value={eventFilter} onChange={(v) => setEventFilter(v || "all")} data={[{ value: "all", label: "Semua Event" }, ...events.map(e => ({ value: e.id.toString(), label: e.name }))]} style={{ width: 180 }} />
          <Select placeholder="Semua Tipe" value={typeFilter} onChange={(v) => setTypeFilter(v || "all")} data={[{ value: "all", label: "Semua Tipe" }, { value: "persentase", label: "Persentase" }, { value: "nominal", label: "Nominal" }]} style={{ width: 140 }} />
          <Select placeholder="Semua Status" value={statusFilter} onChange={(v) => setStatusFilter(v || "all")} data={[{ value: "all", label: "Semua Status" }, { value: "active", label: "Aktif" }, { value: "inactive", label: "Nonaktif" }, { value: "expired", label: "Kadaluarsa" }]} style={{ width: 140 }} />
          <Button variant="light" color="gray" onClick={() => fetchVouchers(1)} loading={loading.includes("vouchers")} px={18}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
          <Button variant="light" color="gray" onClick={() => { setSearchTerm(""); setEventFilter("all"); setTypeFilter("all"); setStatusFilter("all"); fetchVouchers(1); }}>Reset</Button>
        </Flex>
      </Card>

      <Card withBorder p={0} radius="md" shadow="sm" style={{ overflow: 'hidden' }}>
        <Box style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {["No", "Kode Voucher", "Tipe Voucher", "Diskon", "Periode", "Kuota", "Stok", "Status", "Aksi"].map((label, i) => (
                  <th key={i} onClick={() => ["Kode Voucher", "Tipe Voucher", "Stok"].includes(label) && requestSort(label === "Kode Voucher" ? 'code' : label === "Tipe Voucher" ? 'type' : 'stock')} style={{
                    padding: '14px', textAlign: ["No", "Diskon", "Stok", "Status", "Aksi"].includes(label) ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: '#495057', textTransform: 'uppercase', borderBottom: '2px solid #e9ecef', cursor: ["Kode Voucher", "Tipe Voucher", "Stok"].includes(label) ? 'pointer' : 'default',
                    position: label === "Aksi" ? 'sticky' : 'static', right: label === "Aksi" ? 0 : 'auto', backgroundColor: label === "Aksi" ? '#f8f9fa' : 'transparent', zIndex: label === "Aksi" ? 10 : 1, boxShadow: label === "Aksi" ? '-2px 0 5px rgba(0,0,0,0.02)' : 'none'
                  }}>
                    <Flex align="center" gap={6} justify={["No", "Diskon", "Stok", "Status", "Aksi"].includes(label) ? 'center' : 'flex-start'}>
                      {label}
                      {["Kode Voucher", "Tipe Voucher", "Stok"].includes(label) && <FontAwesomeIcon icon={getSortIcon(label === "Kode Voucher" ? 'code' : label === "Tipe Voucher" ? 'type' : 'stock')} size="xs" style={{ color: '#adb5bd' }} />}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.includes("vouchers") ? <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center' }}><Text c="dimmed">Memuat data...</Text></td></tr> :
                sortedVouchers.length === 0 ? <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center' }}><Text c="dimmed">Tidak ada voucher ditemukan</Text></td></tr> :
                  sortedVouchers.map((v, idx) => {
                    const now = moment();
                    const startDate = moment(v.date_start);
                    const endDate = moment(v.date_end);
                    let bStat = "Aktif"; let sCol = "green"; let sysStat = v.status === 1 ? "Aktif" : "Nonaktif";
                    if (now.isBefore(startDate)) { bStat = "Belum Mulai"; sCol = "blue"; }
                    else if (now.isAfter(endDate)) { bStat = "Kadaluarsa"; sCol = "red"; }
                    else if (v.used_count >= v.max_use) { bStat = "Terpakai"; sCol = "orange"; }
                    else if (v.stock <= 0) { bStat = "Habis"; sCol = "gray"; }
                    else if (sysStat === "Nonaktif") { bStat = "Nonaktif"; sCol = "gray"; }

                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="xs" fw={700}>{(pagination.current_page - 1) * pagination.per_page + idx + 1}</Text></td>
                        <td style={{ padding: '12px 14px' }}><Text size="sm" fw={700} c="blue">{v.code}</Text></td>
                        <td style={{ padding: '12px 14px' }}>
                          <Badge variant="light" color={v.event_id && !v.product_id ? "blue" : "orange"} size="sm">
                            {v.event_id && !v.product_id ? "Event" : "Produk"}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}><Badge variant="light" color={v.type === "persentase" ? "blue" : "green"}>{v.type === "persentase" ? `${v.discount}%` : `Rp ${v.discount.toLocaleString()}`}</Badge></td>
                        <td style={{ padding: '12px 14px' }}><Text size="xs" c="dimmed">{moment(v.date_start).format("DD/MM/YY")} - {moment(v.date_end).format("DD/MM/YY")}</Text></td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="xs" fw={600}>{v.used_count}/{v.max_use}</Text></td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="sm" fw={700}>{v.stock}</Text></td>
                        <td style={{ padding: '12px 14px' }}><Flex justify="center" direction="column" align="center"><Badge variant="filled" color={sCol} size="sm" style={{ width: 100 }}>{bStat}</Badge></Flex></td>
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
        <Flex justify="space-between" align="center">
          <Text size="xs" c="dimmed">Total {pagination.total} voucher</Text>
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
          <Title order={2} size="h3">{isEditMode ? "Edit Voucher" : "Buat Voucher Baru"}</Title>
          <Text size="xs" c="dimmed">Lengkapi rincian di bawah ini</Text>
        </Stack>
      </Flex>

      <form id="voucher-form" onSubmit={(e) => { e.preventDefault(); handleSaveVoucher(); }}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Event" data={events.map(e => ({ value: e.id.toString(), label: e.name }))} value={formData.event_id} onChange={v => setFormData({ ...formData, event_id: v || "" })} required />
              <TextInput label="Kode Voucher" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
              <Select label="Tipe" data={[{ value: "persentase", label: "Persen (%)" }, { value: "nominal", label: "Nominal (Rp)" }]} value={formData.type} onChange={v => setFormData({ ...formData, type: v as any })} />
              <NumberInput label="Diskon" value={formData.discount} onChange={v => setFormData({ ...formData, discount: Number(v) })} required />
              <TextInput label="Mulai" type="date" value={formData.date_start} onChange={e => setFormData({ ...formData, date_start: e.target.value })} />
              <TextInput label="Berakhir" type="date" value={formData.date_end} onChange={e => setFormData({ ...formData, date_end: e.target.value })} />
              <NumberInput label="Kuota" value={formData.max_use} onChange={v => setFormData({ ...formData, max_use: Number(v) })} />
              <NumberInput label="Stok" value={formData.stock} onChange={v => setFormData({ ...formData, stock: Number(v) })} />
              <Select label="Status" data={[{ value: "1", label: "Aktif" }, { value: "0", label: "Nonaktif" }]} value={formData.status.toString()} onChange={v => setFormData({ ...formData, status: parseInt(v || "1") })} />
            </div>
          </Stack>
        </Card>

        {/* Floating Footer - Fixed to Viewport Bottom (Edge-to-Edge) */}
        <Box
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]"
        >
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)} leftSection={<FontAwesomeIcon icon={faXmark} />}>
              Batal
            </Button>
            <Button
              type="submit"
              form="voucher-form"
              color="blue"
              loading={loading.includes("save")}
              leftSection={<FontAwesomeIcon icon={faSave} />}
            >
              Simpan
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  return (
    <div className="p-5 md:p-8 pb-[100px] min-h-screen bg-[#fcfcfc]">
      {isFormVisible ? renderForm() : renderList()}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Hapus Voucher" centered size="sm">
        <Stack gap="md">
          <Text size="sm">Yakin ingin menghapus voucher ini?</Text>
          <Flex justify="flex-end" gap="sm"><Button variant="subtle" color="gray" onClick={() => setDeleteModalOpen(false)}>Batal</Button><Button color="red" onClick={handleDeleteVoucher} loading={loading.includes("delete")}>Hapus</Button></Flex>
        </Stack>
      </Modal>
      <Modal opened={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Detail Voucher" size="md">
        {selectedVoucher && (
          <Stack gap="md">
            <div className="grid grid-cols-2 gap-4">
              <div><Text size="xs" c="dimmed">Kode</Text><Text fw={700}>{selectedVoucher.code}</Text></div>
              <div><Text size="xs" c="dimmed">Event</Text><Text fw={700}>{selectedVoucher.event?.name || selectedVoucher.event_id}</Text></div>
            </div>
            <Alert color="blue" icon={<FontAwesomeIcon icon={faInfoCircle} />}>Berlaku: {moment(selectedVoucher.date_start).format("DD/MM/YY")} - {moment(selectedVoucher.date_end).format("DD/MM/YY")}</Alert>
            <Button fullWidth variant="light" onClick={() => setViewModalOpen(false)}>Tutup</Button>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default VoucherPage;