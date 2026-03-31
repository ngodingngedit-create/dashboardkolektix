// festaqingkolektiv/src/pages/dashboard/admin/crew/index.tsx
import { useState, useEffect, useMemo } from "react";
import {
  LoadingOverlay,
  Stack,
  Flex,
  Text,
  Group,
  Badge,
  Button,
  TextInput,
  Select,
  Image,
  FileInput,
  Box,
  Title,
  Card,
  ActionIcon,
  Tooltip,
  Paper,
  Collapse
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import moment from "moment";
import fetch from "@/utils/fetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPencil,
  faTrash,
  faArrowLeft,
  faArrowsRotate,
  faUsers,
  faUserCheck,
  faUserXmark,
  faUserTie,
  faMapLocationDot,
  faSearch,
  faSave,
  faXmark,
  faSort,
  faSortUp,
  faSortDown,
  faChevronUp,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";

// Interface untuk data crew
interface CrewProps {
  id: number;
  event_id: number;
  teritorial_id: number;
  name: string;
  division: string;
  image: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
  status: string;
  image_url: string;
  has_event: {
    id: number;
    name: string;
    image_url: string;
    start_date: string;
    end_date: string;
    location_city: string;
  };
  has_teritorial?: {
    id: number;
    name: string;
    description: string;
    status: string;
  };
}

// Interface untuk data event (dropdown)
interface EventProps {
  id: number;
  name: string;
}

// Interface untuk data teritorial (dropdown)
interface TeritorialProps {
  id: number;
  name: string;
  status: string;
}

export default function KelolaCrew() {
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<CrewProps[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [events, setEvents] = useState<EventProps[]>([]);
  const [teritorials, setTeritorials] = useState<TeritorialProps[]>([]);

  // State untuk navigasi "halaman" di dalam index
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name', direction: 'asc' });
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  // Form state untuk crew
  const form = useForm({
    initialValues: {
      event_id: "",
      teritorial_id: "",
      name: "",
      division: "",
      status: "active",
    },

    validate: {
      event_id: (value) => (!value ? "Event harus dipilih" : null),
      teritorial_id: (value) => (!value ? "Teritorial harus dipilih" : null),
      name: (value) => (!value ? "Nama crew harus diisi" : null),
      division: (value) => (!value ? "Divisi harus diisi" : null),
    },
  });

  useEffect(() => {
    getData();
    getEvents();
    // Tidak perlu memanggil getTeritorials() lagi karena akan diambil dari data crew
  }, []);

  const getData = async (params?: string) => {
    if (!loading.includes("getdata")) {
      try {
        await fetch<any, any>({
          url: "crew" + (params ? `?${params}` : ""),
          method: "GET",
          data: {},
          before: () => setLoading.append("getdata"),
          success: (response) => {
            console.log("API Response Crew:", response);

            if (response && response.data) {
              let crews: CrewProps[] = [];

              if (Array.isArray(response.data.data)) {
                crews = response.data.data;
              } else if (Array.isArray(response.data)) {
                crews = response.data;
              } else if (response.data.items) {
                crews = response.data.items;
              } else {
                crews = [response.data];
              }

              // Pastikan properti has_teritorial ada
              crews = crews.map(crew => ({
                ...crew,
                has_teritorial: crew.has_teritorial || {
                  id: crew.teritorial_id,
                  name: "Unknown",
                  description: "",
                  status: "active"
                }
              }));

              setData(crews);
              setPagination(response?.data || response);

              // Ekstrak data teritorial dari response crew
              extractTeritorialsFromCrewData(crews);
            }
          },
          complete: () => setLoading.filter((e) => e !== "getdata"),
          error: (error) => {
            console.error("Error fetching data:", error);
            notifications.show({
              title: "Gagal",
              message: "Gagal mengambil data crew",
              color: "red",
            });
          },
        });
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
  };

  // Fungsi untuk mengekstrak data teritorial dari data crew
  const extractTeritorialsFromCrewData = (crews: CrewProps[]) => {
    const teritorialSet = new Set<string>();
    const teritorialList: TeritorialProps[] = [];

    crews.forEach(crew => {
      if (crew.has_teritorial) {
        const ter = crew.has_teritorial;
        const key = `${ter.id}-${ter.name}`;

        if (!teritorialSet.has(key) && ter.status === "active") {
          teritorialSet.add(key);
          teritorialList.push({
            id: ter.id,
            name: ter.name,
            status: ter.status
          });
        }
      }
    });

    // Tambahkan default "Unknown" jika tidak ada teritorial
    if (teritorialList.length === 0) {
      teritorialList.push({
        id: 0,
        name: "Unknown",
        status: "active"
      });
    }

    // Urutkan berdasarkan nama
    teritorialList.sort((a, b) => a.name.localeCompare(b.name));

    console.log("Extracted teritorials from crew data:", teritorialList);
    setTeritorials(teritorialList);
  };

  const getEvents = async () => {
    try {
      await fetch<any, any>({
        url: "event",
        method: "GET",
        data: {},
        before: () => setLoading.append("getevents"),
        success: (response) => {
          if (response && response.data) {
            let eventList: EventProps[] = [];

            console.log("Events response:", response);

            if (Array.isArray(response.data.data)) {
              eventList = response.data.data.map((event: any) => ({
                id: event.id,
                name: event.name
              }));
            } else if (Array.isArray(response.data)) {
              eventList = response.data.map((event: any) => ({
                id: event.id,
                name: event.name
              }));
            } else if (response.data && Array.isArray(response.data.items)) {
              eventList = response.data.items.map((event: any) => ({
                id: event.id,
                name: event.name
              }));
            }

            console.log("Processed events:", eventList);
            setEvents(eventList);
          }
        },
        complete: () => setLoading.filter((e) => e !== "getevents"),
        error: (error) => {
          console.error("Error fetching events:", error);
          notifications.show({
            title: "Gagal",
            message: "Gagal mengambil data event",
            color: "red",
          });
        },
      });
    } catch (error) {
      console.error("Fetch events error:", error);
    }
  };

  const handleAddClick = () => {
    setSelectedCrew(null);
    setIsEditMode(false);
    form.reset();
    setImageFile(null);
    setImagePreview(null);
    setIsFormVisible(true);
  };

  const handleEditClick = (rowData: any) => {
    const crew = rowData as CrewProps;
    setSelectedCrew(crew);
    setIsEditMode(true);

    console.log("Editing crew:", crew);

    form.setValues({
      event_id: crew.event_id?.toString() || "",
      teritorial_id: crew.teritorial_id?.toString() || "",
      name: crew.name || "",
      division: crew.division || "",
      status: crew.status || "active",
    });

    if (crew.image_url) {
      setImagePreview(crew.image_url);
    }

    setIsFormVisible(true);
  };

  const handleDelete = async (rowData: any) => {
    const crew = rowData as CrewProps;

    if (!confirm(`Apakah Anda yakin ingin menghapus crew "${crew.name}"?`)) {
      return;
    }

    await fetch({
      url: `crew/${crew.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({
          title: "Berhasil",
          message: "Crew berhasil dihapus",
          color: "green",
        });
        getData();
      },
      error: (error) => {
        console.error("Delete error:", error);
        notifications.show({
          title: "Gagal",
          message: error.message || "Gagal menghapus crew",
          color: "red",
        });
      },
      complete: () => setLoading.filter((e) => e !== "delete"),
    });
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Fungsi untuk mengkonversi file ke base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    console.log("Form values:", values);

    // Validasi tambahan
    if (!values.event_id) {
      notifications.show({
        title: "Error",
        message: "Event harus dipilih",
        color: "red",
      });
      return;
    }

    if (!values.teritorial_id) {
      notifications.show({
        title: "Error",
        message: "Teritorial harus dipilih",
        color: "red",
      });
      return;
    }

    try {
      let imageBase64 = "";

      // Konversi gambar ke base64 jika ada file baru
      if (imageFile) {
        try {
          imageBase64 = await convertImageToBase64(imageFile);
          console.log("Image converted to base64, length:", imageBase64.length);
        } catch (error) {
          console.error("Error converting image to base64:", error);
          notifications.show({
            title: "Gagal",
            message: "Gagal mengkonversi gambar ke base64",
            color: "red",
          });
          return;
        }
      } else if (isEditMode && selectedCrew?.image_url) {
        // Untuk mode edit, jika tidak ada gambar baru, gunakan gambar lama
        // Ambil hanya base64 dari URL yang sudah ada
        imageBase64 = selectedCrew.image_url;
      }

      // Siapkan payload sesuai format yang diminta
      const payload: any = {
        event_id: parseInt(values.event_id),
        teritorial_id: parseInt(values.teritorial_id),
        name: values.name,
        division: values.division,
        status: values.status,
      };

      // Tambahkan image jika ada (untuk create) atau jika ada gambar baru (untuk update)
      if (!isEditMode && imageBase64) {
        payload.image = imageBase64;
      } else if (isEditMode && imageFile) {
        payload.image = imageBase64;
      }

      console.log("Payload to send:", {
        ...payload,
        image: imageBase64 ? `base64 string (length: ${imageBase64.length})` : "no image"
      });

      if (isEditMode && selectedCrew) {
        // UPDATE CREW
        await fetch({
          url: `crew/${selectedCrew.id}`,
          method: "PUT",
          data: payload,
          before: () => setLoading.append("submit"),
          success: () => {
            notifications.show({
              title: "Berhasil",
              message: "Crew berhasil diperbarui",
              color: "green",
            });
            getData();
            setIsFormVisible(false);
            form.reset();
            setImageFile(null);
            setImagePreview(null);
          },
          error: (error) => {
            console.error("Update error:", error);
            notifications.show({
              title: "Gagal",
              message: error.message || "Gagal memperbarui crew",
              color: "red",
            });
          },
          complete: () => setLoading.filter((e) => e !== "submit"),
        });
      } else {
        // TAMBAH CREW BARU
        await fetch({
          url: "crew",
          method: "POST",
          data: payload,
          before: () => setLoading.append("submit"),
          success: () => {
            notifications.show({
              title: "Berhasil",
              message: "Crew berhasil ditambahkan",
              color: "green",
            });
            getData();
            setIsFormVisible(false);
            form.reset();
            setImageFile(null);
            setImagePreview(null);
          },
          error: (error) => {
            console.error("Create error:", error);
            notifications.show({
              title: "Gagal",
              message: error.message || "Gagal menambahkan crew",
              color: "red",
            });
          },
          complete: () => setLoading.filter((e) => e !== "submit"),
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat memproses data",
        color: "red",
      });
    }
  };

  // Hitung statistik
  const stats = {
    total: data.length,
    active: data.filter(c => c.status === "active").length,
    inactive: data.filter(c => c.status === "inactive").length,
    host: data.filter(c => c.division === "Host").length,
    technical: data.filter(c => c.division === "Technical").length,
    event: data.reduce((unique, crew) => {
      if (crew.has_event?.name && !unique.includes(crew.has_event.name)) {
        unique.push(crew.has_event.name);
      }
      return unique;
    }, [] as string[]).length,
    teritorial: data.reduce((unique, crew) => {
      const terName = crew.has_teritorial?.name || "Unknown";
      if (!unique.includes(terName)) {
        unique.push(terName);
      }
      return unique;
    }, [] as string[]).length,
  };

  // Function untuk memetakan data ke format table
  const mapData = (crew: any) => {
    const crewData = crew as CrewProps;

    return {
      id: crewData.id,
      image: (
        <Flex justify="center" align="center" direction="column" gap={2}>
          {crewData.image_url ? (
            <Image
              src={crewData.image_url}
              alt={crewData.name}
              w={45}
              h={45}
              radius="md"
              fallbackSrc="https://placehold.co/45x45?text=?"
              style={{ objectFit: "cover", border: '1px solid #f1f3f5' }}
            />
          ) : (
            <Box
              w={45}
              h={45}
              bg="gray.1"
              display="flex"
              style={{ alignItems: "center", justifyContent: "center", borderRadius: "50%", border: '1px solid #e9ecef' }}
            >
              <FontAwesomeIcon icon={faUsers} style={{ color: "#adb5bd" }} size="xs" />
            </Box>
          )}
        </Flex>
      ),
      name: crewData.name,
      division: crewData.division,
      event: crewData.has_event ? crewData.has_event.name : "-",
      action: (
        <Flex gap={8} justify="center">
          <Tooltip label="Edit Crew">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => handleEditClick(crewData)}
            >
              <FontAwesomeIcon icon={faPencil} size="sm" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Hapus Crew">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleDelete(crewData)}
            >
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </ActionIcon>
          </Tooltip>
        </Flex>
      )
    };
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchValue) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.division.toLowerCase().includes(searchValue.toLowerCase()) ||
        (item.has_event?.name || "").toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        let valA = "";
        let valB = "";

        if (sortConfig.key === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortConfig.key === 'division') {
          valA = a.division.toLowerCase();
          valB = b.division.toLowerCase();
        } else if (sortConfig.key === 'event') {
          valA = (a.has_event?.name || "").toLowerCase();
          valB = (b.has_event?.name || "").toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchValue, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return faSort;
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  };

  // View: List Page
  const renderList = () => (
    <Stack gap={30}>
      {/* Header */}
      <Flex gap={20} justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">
            Kelola Crew
          </Title>
          <Text size="sm" c="gray">
            Daftar semua crew yang tersedia di sistem
          </Text>
        </Stack>
        <Button
          onClick={handleAddClick}
          leftSection={<FontAwesomeIcon icon={faPlus} />}
          color="blue"
          size="md"
          radius="xl"
        >
          Tambah Crew
        </Button>
      </Flex>

      {/* Statistics Section - Matched to Screenshot Design */}
      <Card withBorder radius="md" p={0} shadow="xs" style={{ backgroundColor: '#fff' }}>
        {/* Accordion Header */}
        <Flex
          justify="space-between"
          align="center"
          p="md"
          onClick={() => setIsStatsOpen(!isStatsOpen)}
          style={{ cursor: 'pointer', borderBottom: isStatsOpen ? '1px solid #f1f3f5' : 'none' }}
        >
          <Flex align="center" gap={12}>
            <Box
              w={32}
              h={32}
              bg="blue.7"
              style={{
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FontAwesomeIcon icon={faUsers} style={{ color: '#fff' }} size="sm" />
            </Box>
            <Text fw={700} size="lg" c="gray.9">Statistik Crew</Text>
          </Flex>
          <FontAwesomeIcon
            icon={isStatsOpen ? faChevronUp : faChevronDown}
            size="sm"
            style={{ color: '#495057' }}
          />
        </Flex>

        <Collapse in={isStatsOpen}>
          <Box p="md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Crew", value: stats.total, icon: faUsers, color: "blue" },
                { label: "Active Status", value: stats.active, icon: faUserCheck, color: "green" },
                { label: "Inactive", value: stats.inactive, icon: faUserXmark, color: "red" },
                { label: "Host Division", value: stats.host, icon: faUserTie, color: "violet" },
                { label: "Teritorial", value: stats.teritorial, icon: faMapLocationDot, color: "cyan" },
              ].map((item, i) => (
                <Card
                  key={i}
                  withBorder
                  radius="md"
                  p="md"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#fff'
                  }}
                >
                  <Stack gap={4} style={{ position: 'relative', zIndex: 1 }}>
                    <Text size="xs" fw={600} c="gray.5" style={{ textTransform: 'capitalize' }}>
                      {item.label}
                    </Text>
                    <Text size="xl" fw={800} c="gray.9">
                      {item.value}
                    </Text>
                  </Stack>

                  {/* Watermark Icon */}
                  <Box
                    style={{
                      position: 'absolute',
                      bottom: -10,
                      right: -5,
                      opacity: 0.08,
                      transform: 'rotate(-15deg)',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}
                  >
                    <FontAwesomeIcon icon={item.icon} size="4x" />
                  </Box>
                </Card>
              ))}
            </div>
          </Box>
        </Collapse>
      </Card>

      <Card withBorder p="md" radius="md" shadow="sm">
        <Flex justify="space-between" align="center" mb="lg">
          <Flex gap={10}>
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={() => getData()}
              loading={loading.includes("getdata")}
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </Button>
          </Flex>
          <TextInput
            placeholder="Cari nama, divisi, atau event..."
            leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: 300 }}
          />
        </Flex>

        <Box style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {[
                  { label: "No", sortable: false },
                  { label: "Foto", sortable: false },
                  { label: "Nama", sortable: true, key: "name" },
                  { label: "Divisi", sortable: true, key: "division" },
                  { label: "Event", sortable: true, key: "event" },
                  { label: "Teritorial", sortable: false },
                  { label: "Status", sortable: false },
                  { label: "Aksi", sortable: false }
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.sortable && requestSort(col.key!)}
                    style={{
                      padding: '12px 14px',
                      textAlign: ["No", "Foto", "Teritorial", "Status", "Aksi"].includes(col.label) ? 'center' : 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#495057',
                      textTransform: 'uppercase',
                      borderBottom: '2px solid #e9ecef',
                      letterSpacing: '0.5px',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      position: col.label === "Aksi" ? 'sticky' : 'static',
                      right: col.label === "Aksi" ? 0 : 'auto',
                      backgroundColor: col.label === "Aksi" ? '#f8f9fa' : 'transparent',
                      zIndex: col.label === "Aksi" ? 10 : 1,
                      boxShadow: col.label === "Aksi" ? '-2px 0 5px rgba(0,0,0,0.02)' : 'none'
                    }}
                  >
                    <Flex align="center" gap={6} justify={["No", "Foto", "Teritorial", "Status", "Aksi"].includes(col.label) ? 'center' : 'flex-start'}>
                      {col.label}
                      {col.sortable && (
                        <FontAwesomeIcon
                          icon={getSortIcon(col.key!)}
                          size="xs"
                          style={{
                            color: sortConfig.key === col.key ? '#228be6' : '#adb5bd',
                            opacity: sortConfig.key === col.key ? 1 : 0.5
                          }}
                        />
                      )}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.includes("getdata") ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center' }}>
                    <LoadingOverlay visible />
                    <Text c="dimmed">Memuat data...</Text>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center' }}>
                    <Text c="dimmed">Tidak ada data ditemukan</Text>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const mapped = mapData(item);
                  return (
                    <tr
                      key={mapped.id}
                      style={{ borderBottom: '1px solid #f1f3f5' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                    >
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="xs" fw={700}>{idx + 1}</Text></td>
                      <td style={{ padding: '12px 14px' }}>
                        <Flex justify="center">
                          {mapped.image}
                        </Flex>
                      </td>
                      <td style={{ padding: '12px 14px' }}><Text size="sm" fw={600}>{mapped.name}</Text></td>
                      <td style={{ padding: '12px 14px' }}><Text size="sm" c="gray.7">{mapped.division}</Text></td>
                      <td style={{ padding: '12px 14px' }}><Text size="xs" lineClamp={2} style={{ maxWidth: 200 }}>{mapped.event}</Text></td>
                      <td style={{ padding: '12px 14px' }}>
                        <Flex justify="center">
                          <Badge variant="filled" color="blue" size="sm" style={{ width: 100 }}>
                            {item.has_teritorial?.name || "Unknown"}
                          </Badge>
                        </Flex>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Flex justify="center">
                          <Badge
                            variant="filled"
                            color={item.status === "active" ? "green" : "red"}
                            size="sm"
                            style={{ width: 100 }}
                          >
                            {item.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </Flex>
                      </td>
                      <td style={{
                        padding: '12px 14px',
                        position: 'sticky',
                        right: 0,
                        backgroundColor: 'inherit',
                        zIndex: 5,
                        boxShadow: '-2px 0 5px rgba(0,0,0,0.02)',
                        borderLeft: '1px solid #f1f3f5'
                      }}>
                        {mapped.action}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Box>
      </Card>
    </Stack>
  );

  // View: Form Page
  const renderForm = () => (
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
            {isEditMode ? `Edit Crew: ${selectedCrew?.name}` : "Tambah Crew Baru"}
          </Title>
          <Text size="xs" c="dimmed">Isi formulir lengkap dibawah untuk mengelola data anggota crew</Text>
        </Stack>
      </Flex>

      <form id="crew-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Pilih Event"
                placeholder="Pilih event tempat crew bertugas"
                data={events.map(event => ({
                  value: event.id.toString(),
                  label: event.name
                }))}
                searchable
                required
                {...form.getInputProps("event_id")}
              />

              <Select
                label="Pilih Teritorial"
                placeholder="Wilayah tugas crew"
                data={teritorials.map(ter => ({
                  value: ter.id.toString(),
                  label: ter.name
                }))}
                searchable
                required
                {...form.getInputProps("teritorial_id")}
              />

              <TextInput
                label="Nama Lengkap Crew"
                placeholder="Contoh: Andi Wijaya"
                required
                {...form.getInputProps("name")}
              />

              <Select
                label="Divisi / Role"
                placeholder="Tanggung jawab crew"
                data={[
                  { value: "Host", label: "Host" },
                  { value: "Technical", label: "Technical" },
                  { value: "Stage Manager", label: "Stage Manager" },
                  { value: "Sound Engineer", label: "Sound Engineer" },
                  { value: "Lighting", label: "Lighting" },
                  { value: "Production", label: "Production" },
                  { value: "Security", label: "Security" },
                  { value: "Medical", label: "Medical" },
                  { value: "Catering", label: "Catering" },
                  { value: "Other", label: "Other" },
                ]}
                required
                {...form.getInputProps("division")}
              />

              <Select
                label="Status Anggota"
                placeholder="Status keaktifan"
                data={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                required
                {...form.getInputProps("status")}
              />

              <FileInput
                label="Foto Crew"
                placeholder="Unggah foto profil"
                accept="image/*"
                value={imageFile}
                onChange={handleImageChange}
                clearable
                leftSection={<FontAwesomeIcon icon={faPlus} size="xs" />}
              />
            </div>

            {imagePreview && (
              <Paper withBorder p="sm" radius="md" style={{ maxWidth: 220 }}>
                <Text size="xs" fw={700} mb={10} c="dimmed">PREVIEW FOTO</Text>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  height={150}
                  radius="md"
                  fit="cover"
                />
              </Paper>
            )}
          </Stack>
        </Card>

        {/* Floating Footer - Fixed to Viewport Bottom (Edge-to-Edge) */}
        <Box
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]"
        >
          <Flex justify="flex-end" gap="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setIsFormVisible(false)}
              size="md"
              leftSection={<FontAwesomeIcon icon={faXmark} />}
            >
              Batalkan
            </Button>
            <Button
              type="submit"
              form="crew-form"
              color="blue"
              size="md"
              loading={loading.includes("submit")}
              leftSection={!loading.includes("submit") && <FontAwesomeIcon icon={faSave} />}
            >
              {isEditMode ? "Simpan Perubahan" : "Konfirmasi & Simpan"}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  return (
    <div className="p-[20px] md:p-[30px] pb-[100px] min-h-screen bg-[#fcfcfc]">
      <LoadingOverlay visible={loading.includes("submit")} overlayProps={{ blur: 2 }} />
      {isFormVisible ? renderForm() : renderList()}
    </div>
  );
}
