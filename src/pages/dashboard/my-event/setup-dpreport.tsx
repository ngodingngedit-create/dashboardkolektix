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
  Progress,
  Textarea,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faPencil,
  faTrash,
  faEye,
  faInfoCircle,
  faSave,
  faXmark,
  faArrowLeft,
  faSort,
  faCalendarAlt,
  faPercent,
  faFileAlt,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import useLoggedUser from "@/utils/useLoggedUser";
import moment from "moment";
import axios from "axios";
import config from "@/Config";

// Baseline Types
interface InstallmentSchedule {
  id?: string;
  title: string;
  percentage: number;
  due_date: string;
}

interface DownpaymentConfig {
  id: string | number;
  event_id: string;
  event_name: string;
  initial_dp_percent: number;
  status: number; // 1 = Aktif, 0 = Nonaktif
  notes: string;
  installments: InstallmentSchedule[];
  created_at: string;
  updated_at: string;
}

interface CreatorEvent {
  id: number;
  name: string;
  start_date: string;
  image_url?: string;
  location_city?: string;
}

const SetupDPReportPage = () => {
  const user = useLoggedUser();
  const [loading, setLoading] = useListState<string>([]);
  const [events, setEvents] = useState<CreatorEvent[]>([]);
  const [configs, setConfigs] = useState<DownpaymentConfig[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<DownpaymentConfig | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form State
  const [formData, setFormData] = useState({
    id: null as string | number | null,
    event_id: "",
    initial_dp_percent: 50,
    status: 1,
    notes: "",
    installments: [] as InstallmentSchedule[],
  });

  // Load events and configs
  useEffect(() => {
    if (user?.has_creator?.id) {
      fetchEvents(user.has_creator.id);
    }
  }, [user]);

  // Load configs after events are ready (to match event names)
  useEffect(() => {
    if (events.length > 0) {
      fetchConfigs();
    }
  }, [events]);

  const fetchEvents = async (creatorId: number) => {
    setLoading.append("events");
    try {
      const response = await axios.get(`${config.wsUrl}event-by-creator/${creatorId}`);
      if (response.data?.data && Array.isArray(response.data.data)) {
        setEvents(response.data.data);
      } else {
        // Fallback to general event endpoint
        const fallbackRes = await axios.get(`${config.wsUrl}event`);
        if (fallbackRes.data && Array.isArray(fallbackRes.data)) {
          setEvents(fallbackRes.data.slice(0, 10));
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      // Mock events in case the API is unavailable
      setEvents([
        { id: 1, name: "Kolektix Music Festival 2026", start_date: "2026-08-15" },
        { id: 2, name: "Tech Conference & Startup Expo", start_date: "2026-09-10" },
        { id: 3, name: "J-Pop & Anime Cultural Gathering", start_date: "2026-10-01" },
      ]);
    } finally {
      setLoading.filter((e) => e !== "events");
    }
  };

  const fetchConfigs = async () => {
    setLoading.append("configs");
    try {
      const response = await axios.get(`${config.wsUrl}downpayment-configs`);
      if (response.data && Array.isArray(response.data)) {
        setConfigs(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.warn("API Downpayment Configs not found/failed, falling back to Local Storage");
      // Read from local storage
      const localData = localStorage.getItem("kolektix_dp_configs");
      if (localData) {
        try {
          const parsed = JSON.parse(localData) as DownpaymentConfig[];
          // Update event names from state to keep it consistent
          const hydrated = parsed.map((item) => {
            const match = events.find((e) => String(e.id) === String(item.event_id));
            return {
              ...item,
              event_name: match ? match.name : item.event_name,
            };
          });
          setConfigs(hydrated);
        } catch (e) {
          console.error("Failed to parse local configs:", e);
          initializeMockConfigs();
        }
      } else {
        initializeMockConfigs();
      }
    } finally {
      setLoading.filter((e) => e !== "configs");
    }
  };

  const initializeMockConfigs = () => {
    // Generate dummy downpayment setups based on loaded events
    if (events.length === 0) return;
    
    const mockData: DownpaymentConfig[] = [
      {
        id: "mock-1",
        event_id: String(events[0].id),
        event_name: events[0].name,
        initial_dp_percent: 50,
        status: 1,
        notes: "Pelunasan dapat dicicil 2x sesuai jadwal. Tiket aktif setelah pelunasan 100%.",
        installments: [
          { title: "Cicilan 1", percentage: 25, due_date: moment().add(15, "days").format("YYYY-MM-DD") },
          { title: "Pelunasan Akhir", percentage: 25, due_date: moment().add(30, "days").format("YYYY-MM-DD") },
        ],
        created_at: moment().subtract(5, "days").toISOString(),
        updated_at: moment().subtract(1, "days").toISOString(),
      },
    ];

    if (events.length > 1) {
      mockData.push({
        id: "mock-2",
        event_id: String(events[1].id),
        event_name: events[1].name,
        initial_dp_percent: 40,
        status: 0,
        notes: "Hanya untuk kategori VIP. Pelunasan H-14 sebelum event dimulai.",
        installments: [
          { title: "Pelunasan Utama", percentage: 60, due_date: moment(events[1].start_date).subtract(14, "days").format("YYYY-MM-DD") },
        ],
        created_at: moment().subtract(10, "days").toISOString(),
        updated_at: moment().subtract(10, "days").toISOString(),
      });
    }

    localStorage.setItem("kolektix_dp_configs", JSON.stringify(mockData));
    setConfigs(mockData);
  };

  // Installment Builders
  const handleAddInstallment = () => {
    const nextInstallmentNum = formData.installments.length + 1;
    const isLast = nextInstallmentNum === 2 || nextInstallmentNum === 3;
    const title = isLast ? "Pelunasan" : `Cicilan ${nextInstallmentNum}`;
    
    // Calculate remaining percentage to hit 100%
    const currentSum = formData.initial_dp_percent + formData.installments.reduce((sum, inst) => sum + inst.percentage, 0);
    const defaultPercentage = Math.max(0, 100 - currentSum);

    setFormData({
      ...formData,
      installments: [
        ...formData.installments,
        {
          title,
          percentage: defaultPercentage > 0 ? defaultPercentage : 10,
          due_date: moment().add(15 * nextInstallmentNum, "days").format("YYYY-MM-DD"),
        },
      ],
    });
  };

  const handleRemoveInstallment = (index: number) => {
    const updated = formData.installments.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      installments: updated,
    });
  };

  const handleInstallmentChange = (index: number, field: keyof InstallmentSchedule, value: any) => {
    const updated = [...formData.installments];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      installments: updated,
    });
  };

  // Form Operations
  const handleCreateClick = () => {
    // Pick the first event not currently configured if possible, or fallback to first
    const configuredEventIds = configs.map((c) => String(c.event_id));
    const availableEvent = events.find((e) => !configuredEventIds.includes(String(e.id))) || events[0];

    setFormData({
      id: null,
      event_id: availableEvent ? String(availableEvent.id) : "",
      initial_dp_percent: 50,
      status: 1,
      notes: "Pelunasan tiket wajib diselesaikan sesuai jadwal cicilan. E-Ticket akan aktif secara otomatis setelah status pembayaran 100% lunas.",
      installments: [
        { title: "Pelunasan", percentage: 50, due_date: availableEvent ? moment(availableEvent.start_date).subtract(7, "days").format("YYYY-MM-DD") : moment().add(30, "days").format("YYYY-MM-DD") },
      ],
    });
    setIsEditMode(false);
    setIsFormVisible(true);
  };

  const handleEditClick = (configItem: DownpaymentConfig) => {
    setFormData({
      id: configItem.id,
      event_id: String(configItem.event_id),
      initial_dp_percent: configItem.initial_dp_percent,
      status: configItem.status,
      notes: configItem.notes || "",
      installments: [...configItem.installments],
    });
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  const handleViewClick = (configItem: DownpaymentConfig) => {
    setSelectedConfig(configItem);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (id: string | number) => {
    setConfigToDelete(id);
    setDeleteModalOpen(true);
  };

  // Calculate stats and validation
  const totalPercentage = useMemo(() => {
    const installmentsSum = formData.installments.reduce((sum, inst) => sum + inst.percentage, 0);
    return formData.initial_dp_percent + installmentsSum;
  }, [formData.initial_dp_percent, formData.installments]);

  const saveConfig = async () => {
    if (!formData.event_id) {
      alert("Silakan pilih event terlebih dahulu");
      return;
    }

    if (totalPercentage !== 100) {
      alert(`Akumulasi persentase DP dan Cicilan harus tepat 100%! Saat ini: ${totalPercentage}%`);
      return;
    }

    // Check empty titles or due dates in installments
    const hasEmptyField = formData.installments.some((inst) => !inst.title.trim() || !inst.due_date);
    if (hasEmptyField) {
      alert("Lengkapi seluruh nama cicilan dan batas waktu pembayaran");
      return;
    }

    const matchedEvent = events.find((e) => String(e.id) === String(formData.event_id));
    const eventName = matchedEvent ? matchedEvent.name : "Event Terkait";

    const payload: Omit<DownpaymentConfig, "id" | "created_at" | "updated_at"> & { id?: string | number } = {
      event_id: formData.event_id,
      event_name: eventName,
      initial_dp_percent: formData.initial_dp_percent,
      status: formData.status,
      notes: formData.notes,
      installments: formData.installments,
    };

    setLoading.append("save");
    try {
      if (formData.id) {
        await axios.put(`${config.wsUrl}downpayment-configs/${formData.id}`, payload);
      } else {
        await axios.post(`${config.wsUrl}downpayment-configs`, payload);
      }
      alert("Konfigurasi Down Payment berhasil disimpan!");
      setIsFormVisible(false);
      fetchConfigs();
    } catch (error) {
      console.warn("Backend API save failed, falling back to Local Storage update");
      // Handle in local storage
      const localData = localStorage.getItem("kolektix_dp_configs");
      let localConfigs: DownpaymentConfig[] = localData ? JSON.parse(localData) : [];

      if (formData.id) {
        // Edit Mode
        localConfigs = localConfigs.map((item) =>
          String(item.id) === String(formData.id)
            ? {
                ...item,
                event_id: formData.event_id,
                event_name: eventName,
                initial_dp_percent: formData.initial_dp_percent,
                status: formData.status,
                notes: formData.notes,
                installments: formData.installments,
                updated_at: new Date().toISOString(),
              }
            : item
        );
      } else {
        // Create Mode
        const newConfig: DownpaymentConfig = {
          id: `local-${Date.now()}`,
          event_id: formData.event_id,
          event_name: eventName,
          initial_dp_percent: formData.initial_dp_percent,
          status: formData.status,
          notes: formData.notes,
          installments: formData.installments,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localConfigs.unshift(newConfig);
      }

      localStorage.setItem("kolektix_dp_configs", JSON.stringify(localConfigs));
      setConfigs(
        localConfigs.map((item) => {
          const match = events.find((e) => String(e.id) === String(item.event_id));
          return { ...item, event_name: match ? match.name : item.event_name };
        })
      );
      
      alert(formData.id ? "Konfigurasi DP berhasil diperbarui!" : "Konfigurasi DP baru berhasil dibuat!");
      setIsFormVisible(false);
    } finally {
      setLoading.filter((e) => e !== "save");
    }
  };

  const deleteConfig = async () => {
    if (!configToDelete) return;
    setLoading.append("delete");
    try {
      await axios.delete(`${config.wsUrl}downpayment-configs/${configToDelete}`);
      alert("Konfigurasi berhasil dihapus!");
      setDeleteModalOpen(false);
      fetchConfigs();
    } catch (error) {
      console.warn("Backend API delete failed, deleting from Local Storage");
      const localData = localStorage.getItem("kolektix_dp_configs");
      if (localData) {
        const localConfigs: DownpaymentConfig[] = JSON.parse(localData);
        const filtered = localConfigs.filter((item) => String(item.id) !== String(configToDelete));
        localStorage.setItem("kolektix_dp_configs", JSON.stringify(filtered));
        setConfigs(
          filtered.map((item) => {
            const match = events.find((e) => String(e.id) === String(item.event_id));
            return { ...item, event_name: match ? match.name : item.event_name };
          })
        );
      }
      alert("Konfigurasi berhasil dihapus!");
      setDeleteModalOpen(false);
    } finally {
      setLoading.filter((e) => e !== "delete");
    }
  };

  // Filtered lists
  const filteredConfigs = useMemo(() => {
    return configs.filter((c) => {
      const matchSearch =
        !searchTerm ||
        c.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.event_id.includes(searchTerm);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.status === 1) ||
        (statusFilter === "inactive" && c.status === 0);
      return matchSearch && matchStatus;
    });
  }, [configs, searchTerm, statusFilter]);

  // Pagination lists
  const paginatedConfigs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredConfigs.slice(start, start + itemsPerPage);
  }, [filteredConfigs, currentPage]);

  const totalPages = Math.ceil(filteredConfigs.length / itemsPerPage) || 1;

  // Visual allocations builder for progress bar
  const progressAllocation = useMemo(() => {
    const allocations = [
      { value: formData.initial_dp_percent, color: "blue", label: `DP (${formData.initial_dp_percent}%)` },
    ];
    const colors = ["teal", "grape", "orange", "indigo", "pink"];
    formData.installments.forEach((inst, idx) => {
      allocations.push({
        value: inst.percentage,
        color: colors[idx % colors.length],
        label: `${inst.title || "Cicilan"} (${inst.percentage}%)`,
      });
    });
    return allocations;
  }, [formData.initial_dp_percent, formData.installments]);

  // STATS
  const stats = useMemo(() => {
    const total = configs.length;
    const active = configs.filter((c) => c.status === 1).length;
    return { total, active };
  }, [configs]);

  const renderList = () => (
    <Stack gap={25}>
      <Flex gap={20} justify="space-between" align="center" wrap="wrap">
        <Stack gap={0}>
          <Title order={1} size="h2">Setup Down Payment</Title>
          <Text size="sm" c="gray">Kelola aturan pembayaran DP dan sistem cicilan tiket event Anda</Text>
        </Stack>
        <Flex gap="md" align="center">
          <Card withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">TOTAL EVENT DP</Text>
            <Text size="lg" fw={700}>{stats.total}</Text>
          </Card>
          <Card withBorder radius="md" p="xs" style={{ minWidth: 140 }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">SETUP AKTIF</Text>
            <Text size="lg" fw={700} c="green">{stats.active}</Text>
          </Card>
          <Button
            onClick={handleCreateClick}
            color="blue"
            size="md"
            radius="lg"
            px={24}
            leftSection={<FontAwesomeIcon icon={faPlus} />}
            disabled={events.length === 0}
          >
            Buat Setup Baru
          </Button>
        </Flex>
      </Flex>

      <Card withBorder p="md" radius="md" shadow="sm">
        <Flex gap="md" align="center" wrap="wrap">
          <TextInput
            placeholder="Cari nama event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: 260 }}
            leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
          />
          <Select
            placeholder="Semua Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v || "all")}
            data={[
              { value: "all", label: "Semua Status" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Nonaktif" },
            ]}
            style={{ width: 160 }}
          />
          <Button
            variant="light"
            color="gray"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setCurrentPage(1);
            }}
          >
            Reset Filter
          </Button>
        </Flex>
      </Card>

      <Card withBorder p={0} radius="md" shadow="sm" style={{ overflow: "hidden" }}>
        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                {["No", "Nama Event", "DP Awal (%)", "Jadwal Cicilan", "Batas Pelunasan", "Status", "Aksi"].map((label, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "14px",
                      textAlign: ["No", "DP Awal (%)", "Jadwal Cicilan", "Status", "Aksi"].includes(label) ? "center" : "left",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#495057",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #e9ecef",
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.includes("configs") ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">Memuat data...</Text>
                  </td>
                </tr>
              ) : paginatedConfigs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">Belum ada setup downpayment yang dikonfigurasi</Text>
                  </td>
                </tr>
              ) : (
                paginatedConfigs.map((configItem, idx) => {
                  const lastInstallment = configItem.installments[configItem.installments.length - 1];
                  const deadlineDate = lastInstallment ? moment(lastInstallment.due_date).format("DD MMM YYYY") : "-";
                  const installmentSummary = configItem.installments.length > 0 
                    ? `${configItem.installments.length} Cicilan (${configItem.installments.map(i => `${i.percentage}%`).join(" + ")})`
                    : "Langsung Lunas";

                  return (
                    <tr key={configItem.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <td style={{ padding: "14px", textAlign: "center" }}>
                        <Text size="xs" fw={700}>{(currentPage - 1) * itemsPerPage + idx + 1}</Text>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Text size="sm" fw={700} c="blue" className="line-clamp-1">{configItem.event_name}</Text>
                      </td>
                      <td style={{ padding: "14px", textAlign: "center" }}>
                        <Badge variant="light" color="blue" size="md">
                          {configItem.initial_dp_percent}%
                        </Badge>
                      </td>
                      <td style={{ padding: "14px", textAlign: "center" }}>
                        <Text size="xs" fw={600}>{installmentSummary}</Text>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Flex align="center" gap={6}>
                          <FontAwesomeIcon icon={faCalendarAlt} size="xs" style={{ color: "#868e96" }} />
                          <Text size="xs" c="dimmed" fw={600}>{deadlineDate}</Text>
                        </Flex>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Flex justify="center">
                          <Badge
                            variant="filled"
                            color={configItem.status === 1 ? "green" : "gray"}
                            size="sm"
                            style={{ width: 100 }}
                          >
                            {configItem.status === 1 ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </Flex>
                      </td>
                      <td style={{ padding: "14px", textAlign: "center" }}>
                        <Flex gap={8} justify="center">
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleViewClick(configItem)}>
                            <FontAwesomeIcon icon={faEye} size="xs" />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="orange" onClick={() => handleEditClick(configItem)}>
                            <FontAwesomeIcon icon={faPencil} size="xs" />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteClick(configItem.id)}>
                            <FontAwesomeIcon icon={faTrash} size="xs" />
                          </ActionIcon>
                        </Flex>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Box>
      </Card>
      
      {totalPages > 1 && (
        <Flex justify="space-between" align="center">
          <Text size="xs" c="dimmed">Menampilkan {filteredConfigs.length} konfigurasi</Text>
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
            radius="md"
            size="sm"
            withEdges
          />
        </Flex>
      )}
    </Stack>
  );

  const renderForm = () => {
    const isSumValid = totalPercentage === 100;
    
    return (
      <Stack gap={25}>
        {/* Header */}
        <Flex align="center" gap={15}>
          <ActionIcon
            variant="light"
            color="gray"
            onClick={() => setIsFormVisible(false)}
            size="lg"
            radius="md"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </ActionIcon>
          <Stack gap={0}>
            <Title order={2} size="h3">
              {isEditMode ? "Edit Setup Down Payment" : "Buat Setup Down Payment"}
            </Title>
            <Text size="xs" c="dimmed">Atur detail pembayaran berkala untuk tiket event</Text>
          </Stack>
        </Flex>

        <form id="dpsetup-form" onSubmit={(e) => { e.preventDefault(); saveConfig(); }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-[100px]">
            {/* Left Panel - Main Info */}
            <div className="lg:col-span-7">
              <Card withBorder padding="xl" radius="md" shadow="sm">
                <Stack gap="xl">
                  <Title order={4} size="h4" mb={-10} c="dark.7">
                    <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: 8, color: "#228be6" }} />
                    Informasi Utama
                  </Title>
                  
                  <Select
                    label="Pilih Event"
                    description="Event yang ingin didukung metode pembayaran Down Payment"
                    data={events.map((e) => ({ value: String(e.id), label: e.name }))}
                    value={formData.event_id}
                    onChange={(v) => setFormData({ ...formData, event_id: v || "" })}
                    disabled={isEditMode}
                    required
                    searchable
                    nothingFoundMessage="Tidak ada event ditemukan"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput
                      label="Down Payment Awal (%)"
                      description="Uang muka wajib saat pembelian tiket"
                      value={formData.initial_dp_percent}
                      onChange={(v) => setFormData({ ...formData, initial_dp_percent: Number(v || 0) })}
                      min={10}
                      max={90}
                      step={5}
                      required
                    />

                    <Select
                      label="Status Setup"
                      description="Apakah skema cicilan ini langsung aktif"
                      data={[
                        { value: "1", label: "Aktif" },
                        { value: "0", label: "Nonaktif" },
                      ]}
                      value={formData.status.toString()}
                      onChange={(v) => setFormData({ ...formData, status: parseInt(v || "1") })}
                    />
                  </div>

                  <Textarea
                    label="Syarat & Ketentuan Pelunasan (Notes)"
                    description="Catatan ini akan tampil pada formulir transaksi/e-ticket pembeli"
                    placeholder="Contoh: Pembayaran cicilan kedua dilakukan maksimal 14 hari..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    minRows={4}
                    maxRows={8}
                  />
                </Stack>
              </Card>
            </div>

            {/* Right Panel - Installments Builder */}
            <div className="lg:col-span-5">
              <Card withBorder padding="xl" radius="md" shadow="sm">
                <Stack gap="lg">
                  <Flex justify="space-between" align="center" mb={-5}>
                    <Title order={4} size="h4" c="dark.7">
                      <FontAwesomeIcon icon={faPercent} style={{ marginRight: 8, color: "#228be6" }} />
                      Jadwal Cicilan
                    </Title>
                    <Badge color={isSumValid ? "green" : "orange"} variant="light" size="md">
                      Total: {totalPercentage}%
                    </Badge>
                  </Flex>
                  
                  <Text size="xs" c="dimmed">
                    Tentukan tanggal batas waktu dan pembagian sisa pelunasan. Persentase DP Awal + Cicilan harus sama dengan **100%**.
                  </Text>

                  {/* Percentage Progress Bar representation */}
                  <Box py={5}>
                    <Progress.Root size="xl" radius="lg">
                      {progressAllocation.map((alloc, idx) => (
                        <Progress.Section key={idx} value={alloc.value} color={alloc.color}>
                          <Progress.Label>{alloc.value > 10 ? `${alloc.value}%` : ""}</Progress.Label>
                        </Progress.Section>
                      ))}
                    </Progress.Root>
                    <Flex gap={8} wrap="wrap" mt={8}>
                      {progressAllocation.map((alloc, idx) => (
                        <Flex key={idx} align="center" gap={4}>
                          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: `var(--mantine-color-${alloc.color}-filled)` }} />
                          <Text size="xs" fw={700} c="dimmed">{alloc.label}</Text>
                        </Flex>
                      ))}
                    </Flex>
                  </Box>

                  {!isSumValid && (
                    <Alert
                      color="orange"
                      icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
                      styles={{ label: { fontSize: "12px" }, message: { fontSize: "11px" } }}
                    >
                      Total alokasi saat ini adalah **{totalPercentage}%**. Silakan sesuaikan agar genap **100%** (kurang/lebih {100 - totalPercentage}%).
                    </Alert>
                  )}

                  {isSumValid && (
                    <Alert
                      color="green"
                      icon={<FontAwesomeIcon icon={faCheckCircle} />}
                      styles={{ label: { fontSize: "12px" }, message: { fontSize: "11px" } }}
                    >
                      Skema cicilan valid dan siap disimpan!
                    </Alert>
                  )}

                  <Stack gap="md" mt={5}>
                    {formData.installments.map((inst, idx) => (
                      <Card key={idx} withBorder padding="md" radius="md" style={{ backgroundColor: "#fcfcfc" }}>
                        <Stack gap="sm">
                          <Flex justify="space-between" align="center">
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Pembayaran #{idx + 1}</Text>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleRemoveInstallment(idx)}
                              size="sm"
                              title="Hapus pembayaran"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </ActionIcon>
                          </Flex>

                          <div className="grid grid-cols-1 gap-3">
                            <TextInput
                              label="Nama Tagihan"
                              placeholder="e.g. Cicilan 1 / Pelunasan Akhir"
                              size="xs"
                              value={inst.title}
                              onChange={(e) => handleInstallmentChange(idx, "title", e.target.value)}
                              required
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <NumberInput
                                label="Porsi (%)"
                                size="xs"
                                value={inst.percentage}
                                onChange={(v) => handleInstallmentChange(idx, "percentage", Number(v || 0))}
                                min={5}
                                max={90}
                                step={5}
                                required
                              />

                              <TextInput
                                label="Batas Waktu"
                                size="xs"
                                type="date"
                                value={inst.due_date}
                                onChange={(e) => handleInstallmentChange(idx, "due_date", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </Stack>
                      </Card>
                    ))}

                    <Button
                      variant="light"
                      color="blue"
                      onClick={handleAddInstallment}
                      leftSection={<FontAwesomeIcon icon={faPlus} />}
                      size="sm"
                      disabled={totalPercentage >= 100}
                    >
                      Tambah Termin Pembayaran
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </div>
          </div>

          {/* Floating Action Footer */}
          <Box
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              backgroundColor: "#fff",
              borderTop: "1px solid #e9ecef",
              padding: "16px 32px",
              boxShadow: "0 -10px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Flex justify="flex-end" gap="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setIsFormVisible(false)}
                leftSection={<FontAwesomeIcon icon={faXmark} />}
              >
                Batal
              </Button>
              <Button
                type="submit"
                form="dpsetup-form"
                color="blue"
                loading={loading.includes("save")}
                disabled={!isSumValid}
                leftSection={<FontAwesomeIcon icon={faSave} />}
              >
                Simpan Konfigurasi
              </Button>
            </Flex>
          </Box>
        </form>
      </Stack>
    );
  };

  return (
    <div className="p-5 md:p-8 pb-[100px] min-h-screen bg-[#fcfcfc] text-black">
      {isFormVisible ? renderForm() : renderList()}

      {/* Delete Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Setup Down Payment"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menghapus konfigurasi Down Payment untuk event ini? Pembeli tidak akan lagi bisa memilih opsi DP untuk event ini.
          </Text>
          <Flex justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button color="red" onClick={deleteConfig} loading={loading.includes("delete")}>
              Hapus
            </Button>
          </Flex>
        </Stack>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={<Text size="xl" fw={700}>Rincian Skema Down Payment</Text>}
        size="lg"
        radius="md"
      >
        {selectedConfig && (
          <Stack gap="lg" p="xs">
            <Box>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">Nama Event</Text>
              <Text fw={700} size="lg" c="blue">{selectedConfig.event_name}</Text>
            </Box>

            <div className="grid grid-cols-2 gap-4">
              <Box p="md" className="rounded-xl border bg-gray-50" style={{ borderColor: "#eee" }}>
                <Text size="xs" c="dimmed" fw={700}>DOWN PAYMENT AWAL</Text>
                <Text size="xl" fw={700} c="blue">{selectedConfig.initial_dp_percent}%</Text>
              </Box>

              <Box p="md" className="rounded-xl border bg-gray-50" style={{ borderColor: "#eee" }}>
                <Text size="xs" c="dimmed" fw={700}>STATUS METODE</Text>
                <Badge
                  color={selectedConfig.status === 1 ? "green" : "gray"}
                  variant="filled"
                  mt="xs"
                >
                  {selectedConfig.status === 1 ? "Aktif" : "Nonaktif"}
                </Badge>
              </Box>
            </div>

            <Box>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb="xs">Jadwal Pembayaran Termin</Text>
              <Stack gap="xs">
                {selectedConfig.installments.map((inst, idx) => (
                  <Flex
                    key={idx}
                    justify="space-between"
                    align="center"
                    p="sm"
                    className="rounded-lg border"
                    style={{ borderColor: "#eee" }}
                  >
                    <Group gap="xs">
                      <Box
                        className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs fw-700 c-blue"
                        style={{ color: "#228be6", backgroundColor: "#e7f5ff" }}
                      >
                        {idx + 1}
                      </Box>
                      <Text size="sm" fw={600}>{inst.title} ({inst.percentage}%)</Text>
                    </Group>
                    <Flex align="center" gap={6}>
                      <FontAwesomeIcon icon={faCalendarAlt} size="xs" style={{ color: "#868e96" }} />
                      <Text size="xs" fw={700} c="gray.7">
                        Due: {moment(inst.due_date).format("DD MMM YYYY")}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </Stack>
            </Box>

            {selectedConfig.notes && (
              <Box>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb="xs">Syarat & Ketentuan</Text>
                <Card withBorder padding="sm" radius="md" style={{ backgroundColor: "#faf8f5" }}>
                  <Text size="xs" c="gray.8" style={{ whiteSpace: "pre-wrap" }}>
                    {selectedConfig.notes}
                  </Text>
                </Card>
              </Box>
            )}

            <Button fullWidth variant="light" color="blue" onClick={() => setViewModalOpen(false)}>
              Tutup Rincian
            </Button>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default SetupDPReportPage;
