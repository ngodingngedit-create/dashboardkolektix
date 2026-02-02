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
  Modal, 
  TextInput, 
  Select, 
  Textarea,
  Image,
  FileInput,
  Box
} from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import moment from "moment";
import TableData from "@/components/TableData";
import fetch from "@/utils/fetch";

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

  // Modal untuk form
  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    openFormModal();
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

    openFormModal();
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
            closeFormModal();
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
            closeFormModal();
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
    const teritorialName = crewData.has_teritorial?.name || "Unknown";
    
    return {
      id: crewData.id,
      image: crewData.image_url ? (
        <Image
          src={crewData.image_url}
          alt={crewData.name}
          width={50}
          height={50}
          radius="md"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <Box
          w={50}
          h={50}
          bg="gray.2"
          display="flex"
          style={{ alignItems: "center", justifyContent: "center", borderRadius: "8px" }}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ color: "#868e96" }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </Box>
      ),
      name: crewData.name,
      division: crewData.division,
      event: crewData.has_event ? (
        <Text size="sm" lineClamp={2}>
          {crewData.has_event.name}
        </Text>
      ) : "-",
      teritorial: (
        <Badge variant="light" size="sm">
          {teritorialName}
        </Badge>
      ),
      status: (
        <Badge 
          color={crewData.status === "active" ? "green" : "red"} 
          variant="light" 
          size="sm"
        >
          {crewData.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
      created_at: crewData.created_at ? moment(crewData.created_at).format("DD MMM YYYY HH:mm") : "-",
      updated_at: crewData.updated_at ? moment(crewData.updated_at).format("DD MMM YYYY HH:mm") : "-",
    };
  };

  return (
    <>
      <Stack className="p-[20px] md:p-[30px]" gap={30}>
        <LoadingOverlay visible={loading.includes("getdata")} />

        {/* Header dengan tombol Tambah */}
        <Flex gap={10} justify="space-between" align="center">
          <Stack gap={5}>
            <Text size="1.8rem" fw={600}>
              Kelola Crew
            </Text>
            <Text size="sm" c="gray">
              Daftar semua crew yang tersedia di sistem
            </Text>
          </Stack>

          <Button onClick={handleAddClick} color="blue">
            + Tambah Crew
          </Button>
        </Flex>

        {/* Statistik Cards */}
        <Group grow gap="md">
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa"
            }}
            gap={5}
          >
            <Text size="sm" c="gray">Total Crew</Text>
            <Text size="1.5rem" fw={600}>{stats.total}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #d1fae5",
              backgroundColor: "#f0fdf4"
            }}
            gap={5}
          >
            <Text size="sm" c="green">Active</Text>
            <Text size="1.5rem" fw={600} c="green">{stats.active}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #fee2e2",
              backgroundColor: "#fef2f2"
            }}
            gap={5}
          >
            <Text size="sm" c="red">Inactive</Text>
            <Text size="1.5rem" fw={600} c="red">{stats.inactive}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #ddd6fe",
              backgroundColor: "#f5f3ff"
            }}
            gap={5}
          >
            <Text size="sm" c="violet">Host</Text>
            <Text size="1.5rem" fw={600} c="violet">{stats.host}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #a5f3fc",
              backgroundColor: "#ecfeff"
            }}
            gap={5}
          >
            <Text size="sm" c="cyan">Teritorial</Text>
            <Text size="1.5rem" fw={600} c="cyan">{stats.teritorial}</Text>
          </Stack>
        </Group>

        {/* TABEL DATA CREW */}
        <TableData
          loading={loading.includes("getdata")}
          value={pagination}
          onChange={getData}
          data={data}
          mapData={mapData}
          headerLabel={{
            id: "ID",
            image: "Foto",
            name: "Nama",
            division: "Divisi",
            event: "Event",
            teritorial: "Teritorial",
            status: "Status",
            created_at: "Dibuat Pada",
            updated_at: "Diperbarui Pada",
          }}
          actionIcon={[
            {
              icon: "mdi:pencil",
              text: "Edit",
              onClick: handleEditClick,
            },
            {
              icon: "mdi:trash",
              text: "Hapus",
              onClick: handleDelete,
              color: "red",
            },
          ]}
        />
      </Stack>

      {/* MODAL FORM CREW */}
      <Modal
        opened={formModalOpened}
        onClose={() => {
          closeFormModal();
          form.reset();
          setImageFile(null);
          setImagePreview(null);
        }}
        title={isEditMode ? "Edit Crew" : "Tambah Crew Baru"}
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">
            <Select
              label="Event"
              placeholder="Pilih event"
              data={events.map(event => ({ 
                value: event.id.toString(), 
                label: event.name 
              }))}
              searchable
              required
              nothingFoundMessage="Tidak ada event ditemukan"
              {...form.getInputProps("event_id")}
            />

            <Select
              label="Teritorial"
              placeholder="Pilih teritorial"
              data={teritorials.map(ter => ({ 
                value: ter.id.toString(), 
                label: ter.name 
              }))}
              searchable
              required
              nothingFoundMessage="Tidak ada teritorial ditemukan"
              {...form.getInputProps("teritorial_id")}
            />

            <TextInput 
              label="Nama Crew" 
              placeholder="Masukkan nama crew" 
              required 
              {...form.getInputProps("name")}
            />

            <Select
              label="Divisi"
              placeholder="Pilih divisi"
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

            <FileInput
              label="Foto Crew"
              placeholder="Pilih file gambar"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              value={imageFile}
              onChange={handleImageChange}
              clearable
              description={isEditMode ? "Biarkan kosong jika tidak ingin mengubah foto" : "Maksimal 2MB"}
            />

            {imagePreview && (
              <Box>
                <Text size="sm" mb={5}>Preview:</Text>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  height={150}
                  radius="md"
                  fit="cover"
                />
              </Box>
            )}

            <Select
              label="Status"
              placeholder="Pilih status"
              data={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              required
              {...form.getInputProps("status")}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={() => {
                  closeFormModal();
                  form.reset();
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                color="blue" 
                loading={loading.includes("submit")}
              >
                {isEditMode ? "Simpan Perubahan" : "Tambah Crew"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}