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
} from "@fortawesome/free-solid-svg-icons";
import TableData from "@/components/TableData";
import useLoggedUser from "@/utils/useLoggedUser";
import moment from "moment";
import axios from "axios";
import config from "@/Config";

// Types
interface Voucher {
  id: number;
  event_id: number;
  code: string;
  discount: number;
  type: "persentase" | "nominal";
  date_start: string;
  date_end: string;
  max_use: number;
  stock: number;
  used_count: number;
  status?: number; // Changed to number
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
  creator?: {
    id: number;
  };
  user_id?: number;
  user?: {
    id: number;
  };
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
  
  // State untuk modal dan form
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);
  
  // State untuk form - STATUS DIUBAH KE NUMBER
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
    status: 1, // Changed to number: 1 = active, 0 = inactive
  });
  
  // State untuk filter dan search
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch data on component mount
  useEffect(() => {
    fetchEvents();
    fetchVouchers(1);
  }, []);

  // Fetch events for dropdown using axios
  const fetchEvents = async () => {
    setLoading.append("events");
    
    try {
      console.log("Fetching events... User:", user);
      
      const response = await axios.get(`${config.wsUrl}event`);
      console.log("Events API Response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Tampilkan semua event dulu untuk debugging
        console.log("All events:", response.data);
        
        // Filter events by user/creator dengan berbagai cara
        const userEvents = response.data.filter((e: Event) => {
          
          // Cek creator_id dalam berbagai format yang mungkin
          const creatorId = 
            e.creator_id || 
            e.creator?.id ||
            e.user_id ||
            e.user?.id;
          
          const userId = user?.has_creator?.id;
          
          // Jika ada creator_id, bandingkan dengan user
          if (creatorId) {
            return parseInt(creatorId.toString()) === userId;
          }
          
          // Jika tidak ada creator_id, tampilkan semua untuk testing
          return true;
        });
        
        console.log("Filtered events for user:", userEvents);
        setEvents(userEvents);
        
        // Jika tidak ada event, mungkin user belum punya event
        if (userEvents.length === 0) {
          console.warn("No events found for this user. Showing all events for testing.");
          // Untuk testing, tampilkan beberapa event pertama
          const testEvents = response.data.slice(0, 5);
          setEvents(testEvents);
        }
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Jika response berupa { data: [...] }
        console.log("Events from data property:", response.data.data);
        setEvents(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching events:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      // Fallback untuk testing
      const mockEvents = [
        { id: 1, name: "Event Test 1", creator_id: user?.has_creator?.id || 41 },
        { id: 2, name: "Event Test 2", creator_id: user?.has_creator?.id || 41 },
        { id: 3, name: "Event Test 3", creator_id: user?.has_creator?.id || 41 },
      ];
      setEvents(mockEvents);
    } finally {
      setLoading.filter((e) => e !== "events");
    }
  };

  // Fetch vouchers with pagination using axios
  const fetchVouchers = async (page: number = 1) => {
    setLoading.append("vouchers");
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (eventFilter !== "all") {
        params.append("event_id", eventFilter);
      }

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      // Opsional: Tambahkan user_id untuk filter berdasarkan user
      if (user?.has_creator?.id) {
        params.append("user_id", user.has_creator.id.toString());
      }

      const url = `${config.wsUrl}vouchers?${params.toString()}`;
      console.log("Fetching vouchers from:", url);
      
      const response = await axios.get(url);
      console.log("Vouchers API Full Response:", response);
      console.log("Vouchers API Data:", response.data);

      // PERBAIKAN: Response langsung berupa array
      const responseData = response.data;
      
      if (Array.isArray(responseData)) {
        // Jika response langsung array
        console.log("Response is array, length:", responseData.length);
        console.log("First voucher:", responseData[0]);
        setVouchers(responseData);
        setPagination({
          current_page: page,
          last_page: Math.ceil(responseData.length / 20),
          total: responseData.length,
          per_page: 20,
        });
      } else if (responseData && Array.isArray(responseData.data)) {
        // Jika response berupa { data: [...] }
        console.log("Response has data property, length:", responseData.data.length);
        setVouchers(responseData.data);
        setPagination({
          current_page: responseData.current_page || 1,
          last_page: responseData.last_page || 1,
          total: responseData.total || responseData.data.length,
          per_page: responseData.per_page || 20,
        });
      } else if (responseData?.success && Array.isArray(responseData.data)) {
        // Jika response berupa { success: true, data: [...] }
        console.log("Response has success property, length:", responseData.data.length);
        setVouchers(responseData.data);
        setPagination({
          current_page: responseData.current_page || 1,
          last_page: responseData.last_page || 1,
          total: responseData.total || responseData.data.length,
          per_page: responseData.per_page || 20,
        });
      } else {
        console.log("Unexpected response format:", responseData);
        setVouchers([]);
      }
      
    } catch (error: any) {
      console.error("Error fetching vouchers:", error);
      console.error("Error response:", error.response?.data);
      setVouchers([]);
    } finally {
      setLoading.filter((e) => e !== "vouchers");
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchVouchers(page);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVouchers(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, eventFilter, typeFilter, statusFilter]);

  // Open modal for creating new voucher
  const handleCreateClick = () => {
    console.log("Create clicked. Available events:", events);
    
    // Jika tidak ada event, fetch ulang
    if (events.length === 0) {
      fetchEvents();
      alert("Sedang mengambil data event...");
    }
    
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
      status: 1, // Default active
    });
    setModalOpen(true);
  };

  // Open modal for editing voucher
  const handleEditClick = (voucher: Voucher) => {
    console.log("Edit voucher:", voucher);
    setFormData({
      id: voucher.id,
      event_id: voucher.event_id.toString(),
      code: voucher.code,
      discount: voucher.discount,
      type: voucher.type,
      date_start: voucher.date_start.split("T")[0],
      date_end: voucher.date_end.split("T")[0],
      max_use: voucher.max_use,
      stock: voucher.stock,
      status: voucher.status || 1, // Default to active if not set
    });
    setModalOpen(true);
  };

  // Open modal for viewing voucher details
  const handleViewClick = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setViewModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setVoucherToDelete(id);
    setDeleteModalOpen(true);
  };

  // Save voucher (create or update) using axios - DIPERBAIKI PAYLOAD
  const handleSaveVoucher = async () => {
    console.log("Save voucher form data:", formData);
    
    if (!formData.event_id) {
      alert("Pilih event terlebih dahulu");
      return;
    }

    if (!formData.code) {
      alert("Kode voucher harus diisi");
      return;
    }

    if (formData.type === "persentase" && formData.discount > 100) {
      alert("Diskon persentase tidak boleh lebih dari 100%");
      return;
    }

    // Validasi tanggal
    const startDate = moment(formData.date_start);
    const endDate = moment(formData.date_end);
    
    if (endDate.isBefore(startDate)) {
      alert("Tanggal berakhir tidak boleh sebelum tanggal mulai");
      return;
    }

    // PERBAIKAN PAYLOAD: Semua dalam format yang benar
    const payload = {
      event_id: formData.event_id, // Tetap string untuk API
      code: formData.code,
      discount: formData.discount, // Tetap number, API akan handle conversion
      type: formData.type,
      date_start: formData.date_start,
      date_end: formData.date_end,
      max_use: formData.max_use, // Tetap number
      stock: formData.stock, // Tetap number
      status: formData.status, // Number: 1 = active, 0 = inactive
    };

    console.log("Saving voucher payload:", payload);
    console.log("Payload type check:", {
      event_id: typeof payload.event_id,
      discount: typeof payload.discount,
      max_use: typeof payload.max_use,
      stock: typeof payload.stock,
      status: typeof payload.status,
    });

    setLoading.append("save");

    try {
      if (formData.id) {
        // Update existing voucher
        console.log("Updating voucher ID:", formData.id);
        const response = await axios.put(
          `${config.wsUrl}vouchers/${formData.id}`,
          payload
        );
        
        console.log("Update response:", response.data);
        
        if (response.data) {
          alert("Voucher berhasil diperbarui");
          setModalOpen(false);
          fetchVouchers(pagination.current_page);
        }
      } else {
        // Create new voucher
        console.log("Creating new voucher...");
        const response = await axios.post(
          `${config.wsUrl}vouchers`,
          payload
        );
        
        console.log("Create response:", response.data);
        
        if (response.data) {
          alert("Voucher berhasil dibuat");
          setModalOpen(false);
          fetchVouchers(1);
        } else {
          alert("Gagal membuat voucher. Response tidak valid.");
        }
      }
    } catch (error: any) {
      console.error("Error saving voucher:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Terjadi kesalahan saat menyimpan voucher";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Tampilkan error details jika ada
      if (error.response?.data) {
        console.log("Full error response:", error.response.data);
        
        // Tampilkan field errors jika ada
        if (typeof error.response.data === 'object') {
          const fieldErrors = [];
          for (const [key, value] of Object.entries(error.response.data)) {
            if (Array.isArray(value)) {
              fieldErrors.push(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n');
          }
        }
      }
      
      alert(`Error:\n${errorMessage}`);
    } finally {
      setLoading.filter((e) => e !== "save");
    }
  };

  // Delete voucher using axios
  const handleDeleteVoucher = async () => {
    if (!voucherToDelete) return;

    setLoading.append("delete");

    try {
      const response = await axios.delete(
        `${config.wsUrl}vouchers/${voucherToDelete}`
      );
      
      console.log("Delete response:", response.data);
      
      if (response.data) {
        alert("Voucher berhasil dihapus");
        setDeleteModalOpen(false);
        setVoucherToDelete(null);
        fetchVouchers(pagination.current_page);
      }
    } catch (error: any) {
      console.error("Error deleting voucher:", error);
      console.error("Error details:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Terjadi kesalahan saat menghapus voucher";
      alert(errorMessage);
    } finally {
      setLoading.filter((e) => e !== "delete");
    }
  };

  // Format table data
  const tableData = useMemo(() => {
    console.log("Formatting table data. Vouchers:", vouchers);
    console.log("Vouchers length:", vouchers.length);
    
    return vouchers.map((voucher, index) => {
      const globalIndex = (pagination.current_page - 1) * pagination.per_page + index + 1;
      const now = moment();
      const startDate = moment(voucher.date_start);
      const endDate = moment(voucher.date_end);
      
      let status = "Aktif";
      let statusColor = "green";
      let systemStatus = null;
      
      // Status sistem dari API
      if (voucher.status !== undefined) {
        systemStatus = voucher.status === 1 ? "Aktif" : "Nonaktif";
      }
      
      // Status berdasarkan logika bisnis
      if (now.isBefore(startDate)) {
        status = "Belum Mulai";
        statusColor = "blue";
      } else if (now.isAfter(endDate)) {
        status = "Kadaluarsa";
        statusColor = "red";
      } else if (voucher.used_count >= voucher.max_use) {
        status = "Terpakai";
        statusColor = "orange";
      } else if (voucher.stock <= 0) {
        status = "Habis";
        statusColor = "gray";
      } else if (systemStatus === "Nonaktif") {
        status = "Nonaktif";
        statusColor = "gray";
      }

      return {
        No: globalIndex,
        "Kode Voucher": voucher.code,
        "Nama Event": voucher.event?.name || `Event ID: ${voucher.event_id}`,
        Diskon: (
          <Badge color={voucher.type === "persentase" ? "blue" : "green"} variant="light">
            {voucher.type === "persentase" ? `${voucher.discount}%` : `Rp ${voucher.discount.toLocaleString("id-ID")}`}
          </Badge>
        ),
        "Periode": `${moment(voucher.date_start).format("DD/MM/YYYY")} - ${moment(voucher.date_end).format("DD/MM/YYYY")}`,
        "Kuota": `${voucher.used_count}/${voucher.max_use}`,
        "Stok": voucher.stock,
        Status: (
          <Stack gap={2}>
            <Badge color={statusColor} size="sm">
              {status}
            </Badge>
            {systemStatus && systemStatus !== status && (
              <Badge color="gray" variant="outline" size="xs">
                Sistem: {systemStatus}
              </Badge>
            )}
          </Stack>
        ),
        Action: (
          <Group gap="xs">
            <ActionIcon
              color="blue"
              variant="subtle"
              onClick={() => handleViewClick(voucher)}
            >
              <FontAwesomeIcon icon={faEye} size="sm" />
            </ActionIcon>
            <ActionIcon
              color="orange"
              variant="subtle"
              onClick={() => handleEditClick(voucher)}
            >
              <FontAwesomeIcon icon={faPencil} size="sm" />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={() => handleDeleteClick(voucher.id)}
            >
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </ActionIcon>
          </Group>
        ),
      };
    });
  }, [vouchers, pagination]);

  return (
    <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
      {/* Header */}
      <Flex gap={20} justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">
            Manajemen Voucher
          </Title>
          <Text size="sm" c="gray">
            Kelola voucher promo untuk event Anda
          </Text>
        </Stack>
        
        <Button
          onClick={handleCreateClick}
          leftSection={<FontAwesomeIcon icon={faPlus} />}
          loading={loading.includes("save")}
          disabled={events.length === 0 && loading.includes("events")}
        >
          {events.length === 0 ? "Tunggu..." : "Buat Voucher Baru"}
        </Button>
      </Flex>

      {/* Filters */}
      <Card withBorder p="md">
        <Flex gap="md" align="center" wrap="wrap">
          <Input
            placeholder="Cari kode voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            leftSection={<FontAwesomeIcon icon={faSearch} size="sm" />}
          />
          
          <Select
            placeholder="Filter Event"
            value={eventFilter}
            onChange={(value) => setEventFilter(value || "all")}
            data={[
              { value: "all", label: "Semua Event" },
              ...events.map((event) => ({
                value: event.id.toString(),
                label: event.name,
              })),
            ]}
            style={{ width: 200 }}
            clearable
            disabled={events.length === 0}
          />
          
          <Select
            placeholder="Filter Tipe"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value || "all")}
            data={[
              { value: "all", label: "Semua Tipe" },
              { value: "persentase", label: "Persentase" },
              { value: "nominal", label: "Nominal" },
            ]}
            style={{ width: 150 }}
            clearable
          />
          
          <Select
            placeholder="Filter Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
              { value: "all", label: "Semua Status" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Nonaktif" },
              { value: "expired", label: "Kadaluarsa" },
            ]}
            style={{ width: 150 }}
            clearable
          />
          
          <Button
            variant="light"
            onClick={() => {
              setSearchTerm("");
              setEventFilter("all");
              setTypeFilter("all");
              setStatusFilter("all");
              fetchVouchers(1);
            }}
          >
            Reset Filter
          </Button>
        </Flex>
      </Card>

      {/* Voucher Table */}
      <Card className="!overflow-auto" p={20} withBorder>
        <TableData
          loading={loading.includes("vouchers")}
          tablekey="vouchers"
          withRowIndex={false}
          data={tableData}
          mapData={(e) => ({
            No: e.No,
            "Kode Voucher": e["Kode Voucher"],
            "Nama Event": e["Nama Event"],
            Diskon: e.Diskon,
            Periode: e.Periode,
            Kuota: e.Kuota,
            Stok: e.Stok,
            Status: e.Status,
            Action: e.Action,
          })}
        />

        {/* Debug info */}
        <Flex justify="space-between" align="center" mt="md">
          <Text size="sm" c="dimmed">
            Total Data: {vouchers.length} voucher(s) | 
            Tabel Data: {tableData.length} row(s) | 
            Loading: {loading.includes("vouchers") ? "Ya" : "Tidak"}
          </Text>
        </Flex>

        {/* Pagination */}
        {vouchers.length > 0 && (
          <Flex justify="space-between" align="center" mt="md">
            <Text size="sm" c="dimmed">
              Menampilkan {tableData[0]?.No || 1} sampai {tableData[tableData.length - 1]?.No || tableData.length} dari{" "}
              <strong>{pagination.total}</strong> voucher
            </Text>
            
            <Pagination
              value={pagination.current_page}
              onChange={handlePageChange}
              total={pagination.last_page}
              radius="md"
              size="sm"
              withEdges
            />
          </Flex>
        )}

        {/* Empty State */}
        {vouchers.length === 0 && !loading.includes("vouchers") && (
          <Card withBorder mt="md" p="xl">
            <Flex direction="column" align="center" gap="md">
              <FontAwesomeIcon icon={faTicketAlt} size="2x" color="#adb5bd" />
              <Text size="lg" c="dimmed" fw={500}>
                Tidak ada data voucher
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchTerm || eventFilter !== "all" || typeFilter !== "all" || statusFilter !== "all"
                  ? "Tidak ditemukan voucher dengan filter yang dipilih"
                  : "Belum ada voucher yang dibuat"}
              </Text>
              <Button 
                onClick={handleCreateClick} 
                leftSection={<FontAwesomeIcon icon={faPlus} />}
                disabled={events.length === 0}
              >
                {events.length === 0 ? "Tunggu data event..." : "Buat Voucher Pertama"}
              </Button>
              
              {events.length === 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchEvents}
                  loading={loading.includes("events")}
                >
                  Refresh Data Event
                </Button>
              )}
            </Flex>
          </Card>
        )}
      </Card>

      {/* Modal Create/Edit Voucher - STATUS DIUBAH KE NUMBER */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={formData.id ? "Edit Voucher" : "Buat Voucher Baru"}
        size="lg"
      >
        <Stack gap="md">
          <Select
            label="Event"
            placeholder="Pilih event"
            value={formData.event_id}
            onChange={(value) => setFormData({ ...formData, event_id: value || "" })}
            data={events.map((event) => ({
              value: event.id.toString(),
              label: event.name,
            }))}
            required
            disabled={loading.includes("save") || events.length === 0}
            error={events.length === 0 ? "Belum ada event. Silakan buat event terlebih dahulu." : undefined}
            description={events.length === 0 ? "Tidak ada event yang tersedia" : `Tersedia ${events.length} event`}
          />
          
          <TextInput
            label="Kode Voucher"
            placeholder="Contoh: SAVE50"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            disabled={loading.includes("save")}
            maxLength={20}
            description="Kode akan otomatis menjadi huruf besar"
          />
          
          <Select
            label="Tipe Diskon"
            value={formData.type}
            onChange={(value) => setFormData({ 
              ...formData, 
              type: value as "persentase" | "nominal" 
            })}
            data={[
              { value: "persentase", label: "Persentase (%)" },
              { value: "nominal", label: "Nominal (Rp)" },
            ]}
            leftSection={
              <FontAwesomeIcon 
                icon={formData.type === "persentase" ? faPercent : faDollarSign} 
                size="sm" 
              />
            }
            required
            disabled={loading.includes("save")}
          />
          
          <NumberInput
            label="Nilai Diskon"
            placeholder={formData.type === "persentase" ? "Contoh: 50" : "Contoh: 10000"}
            value={formData.discount}
            onChange={(value) => setFormData({ ...formData, discount: Number(value) })}
            required
            disabled={loading.includes("save")}
            min={0}
            max={formData.type === "persentase" ? 100 : 10000000}
            leftSection={
              formData.type === "persentase" ? (
                <FontAwesomeIcon icon={faPercent} size="sm" />
              ) : (
                <Text size="sm">Rp</Text>
              )
            }
            rightSection={
              formData.type === "persentase" ? (
                <Text size="sm">%</Text>
              ) : undefined
            }
            description={formData.type === "persentase" 
              ? "Maksimal 100%" 
              : "Maksimal Rp 10.000.000"}
          />
          
          {/* STATUS FIELD: Diubah ke number */}
          <Select
            label="Status"
            value={formData.status.toString()}
            onChange={(value) => setFormData({ ...formData, status: value === "1" ? 1 : 0 })}
            data={[
              { value: "1", label: "Aktif" },
              { value: "0", label: "Nonaktif" },
            ]}
            required
            disabled={loading.includes("save")}
            description="1 = Aktif, 0 = Nonaktif"
          />
          
          <Flex gap="md">
            <TextInput
              label="Tanggal Mulai"
              type="date"
              value={formData.date_start}
              onChange={(e) => setFormData({ ...formData, date_start: e.target.value })}
              required
              disabled={loading.includes("save")}
              style={{ flex: 1 }}
              leftSection={<FontAwesomeIcon icon={faCalendarAlt} size="sm" />}
              min={moment().format("YYYY-MM-DD")}
            />
            
            <TextInput
              label="Tanggal Berakhir"
              type="date"
              value={formData.date_end}
              onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
              required
              disabled={loading.includes("save")}
              style={{ flex: 1 }}
              leftSection={<FontAwesomeIcon icon={faCalendarAlt} size="sm" />}
              min={formData.date_start || moment().format("YYYY-MM-DD")}
            />
          </Flex>
          
          <Flex gap="md">
            <NumberInput
              label="Max. Penggunaan"
              placeholder="Contoh: 100"
              value={formData.max_use}
              onChange={(value) => setFormData({ ...formData, max_use: Number(value) })}
              required
              disabled={loading.includes("save")}
              min={1}
              style={{ flex: 1 }}
              description="Berapa kali voucher bisa digunakan"
            />
            
            <NumberInput
              label="Stok Awal"
              placeholder="Contoh: 100"
              value={formData.stock}
              onChange={(value) => setFormData({ ...formData, stock: Number(value) })}
              required
              disabled={loading.includes("save")}
              min={0}
              style={{ flex: 1 }}
              description="Jumlah voucher yang tersedia"
            />
          </Flex>
          
          {formData.type === "persentase" && formData.discount > 100 && (
            <Alert 
              variant="light" 
              color="red" 
              icon={<FontAwesomeIcon icon={faInfoCircle} />}
              title="Perhatian"
            >
              Diskon persentase tidak boleh lebih dari 100%
            </Alert>
          )}
          
          <Flex justify="flex-end" gap="md" mt="md">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={loading.includes("save")}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveVoucher}
              loading={loading.includes("save")}
              disabled={!formData.event_id || !formData.code}
            >
              {formData.id ? "Update" : "Simpan"}
            </Button>
          </Flex>
        </Stack>
      </Modal>

      {/* Modal Delete Confirmation */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <Stack gap="md">
          <Text>Apakah Anda yakin ingin menghapus voucher ini?</Text>
          <Text size="sm" c="dimmed">
            Tindakan ini tidak dapat dibatalkan.
          </Text>
          <Flex justify="flex-end" gap="md">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={loading.includes("delete")}
            >
              Batal
            </Button>
            <Button
              color="red"
              onClick={handleDeleteVoucher}
              loading={loading.includes("delete")}
            >
              Hapus
            </Button>
          </Flex>
        </Stack>
      </Modal>

      {/* Modal View Voucher Details */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Detail Voucher"
        size="md"
      >
        {selectedVoucher && (
          <Stack gap="lg">
            <Card withBorder p="md">
              <Stack gap="xs">
                <Flex justify="space-between" align="center">
                  <Text fw={600} size="sm" c="dimmed">
                    Kode Voucher
                  </Text>
                  <Badge size="lg" color="blue" variant="filled">
                    {selectedVoucher.code}
                  </Badge>
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text fw={600} size="sm" c="dimmed">
                    Event
                  </Text>
                  <Text>{selectedVoucher.event?.name || `Event ID: ${selectedVoucher.event_id}`}</Text>
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text fw={600} size="sm" c="dimmed">
                    Tipe Diskon
                  </Text>
                  <Badge 
                    color={selectedVoucher.type === "persentase" ? "blue" : "green"} 
                    variant="light"
                  >
                    {selectedVoucher.type === "persentase" ? "Persentase" : "Nominal"}
                  </Badge>
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text fw={600} size="sm" c="dimmed">
                    Nilai Diskon
                  </Text>
                  <Text fw={700} size="lg">
                    {selectedVoucher.type === "persentase"
                      ? `${selectedVoucher.discount}%`
                      : `Rp ${selectedVoucher.discount.toLocaleString("id-ID")}`}
                  </Text>
                </Flex>
                
                {selectedVoucher.status !== undefined && (
                  <Flex justify="space-between" align="center">
                    <Text fw={600} size="sm" c="dimmed">
                      Status Sistem
                    </Text>
                    <Badge color={selectedVoucher.status === 1 ? "green" : "red"}>
                      {selectedVoucher.status === 1 ? "Aktif (1)" : "Nonaktif (0)"}
                    </Badge>
                  </Flex>
                )}
              </Stack>
            </Card>
            
            <Card withBorder p="md">
              <Text fw={600} size="md" mb="sm">
                Informasi Periode
              </Text>
              <Stack gap="xs">
                <Flex justify="space-between">
                  <Text fw={500} size="sm">
                    Mulai
                  </Text>
                  <Text>{moment(selectedVoucher.date_start).format("DD MMMM YYYY")}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">
                    Berakhir
                  </Text>
                  <Text>{moment(selectedVoucher.date_end).format("DD MMMM YYYY")}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">
                    Durasi
                  </Text>
                  <Text>
                    {moment(selectedVoucher.date_end).diff(
                      moment(selectedVoucher.date_start),
                      "days"
                    )} hari
                  </Text>
                </Flex>
              </Stack>
            </Card>
            
            <Card withBorder p="md">
              <Text fw={600} size="md" mb="sm">
                Statistik Penggunaan
              </Text>
              <Stack gap="xs">
                <Flex justify="space-between">
                  <Text fw={500} size="sm">
                    Max. Penggunaan
                  </Text>
                  <Text>{selectedVoucher.max_use} kali</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">
                    Sudah Digunakan
                  </Text>
                  <Text color={selectedVoucher.used_count >= selectedVoucher.max_use ? "red" : "green"}>
                    {selectedVoucher.used_count} kali
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">
                    Stok Tersisa
                  </Text>
                  <Text color={selectedVoucher.stock <= 0 ? "red" : "green"}>
                    {selectedVoucher.stock} voucher
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">
                    Dibuat Pada
                  </Text>
                  <Text>{moment(selectedVoucher.created_at).format("DD MMM YYYY HH:mm")}</Text>
                </Flex>
              </Stack>
            </Card>
            
            {/* Status */}
            <Card 
              withBorder 
              p="md" 
              style={{ 
                borderLeft: `4px solid ${
                  selectedVoucher.status === 0 ? "#868e96" :
                  selectedVoucher.used_count >= selectedVoucher.max_use ? "#fa5252" :
                  moment().isAfter(selectedVoucher.date_end) ? "#fa5252" :
                  selectedVoucher.stock <= 0 ? "#868e96" :
                  moment().isBefore(selectedVoucher.date_start) ? "#228be6" :
                  "#40c057"
                }` 
              }}
            >
              <Flex justify="space-between" align="center">
                <Text fw={600}>Status</Text>
                <Badge
                  color={
                    selectedVoucher.status === 0 ? "gray" :
                    selectedVoucher.used_count >= selectedVoucher.max_use ? "red" :
                    moment().isAfter(selectedVoucher.date_end) ? "red" :
                    selectedVoucher.stock <= 0 ? "gray" :
                    moment().isBefore(selectedVoucher.date_start) ? "blue" :
                    "green"
                  }
                  size="lg"
                >
                  {selectedVoucher.status === 0 ? "Nonaktif" :
                   selectedVoucher.used_count >= selectedVoucher.max_use ? "Terpakai" :
                   moment().isAfter(selectedVoucher.date_end) ? "Kadaluarsa" :
                   selectedVoucher.stock <= 0 ? "Habis" :
                   moment().isBefore(selectedVoucher.date_start) ? "Belum Mulai" :
                   "Aktif"}
                </Badge>
              </Flex>
            </Card>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default VoucherPage;