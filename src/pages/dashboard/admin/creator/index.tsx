import TableData from "@/components/TableData";
import { Pagination } from "@/types/model";
import fetch from "@/utils/fetch";
import { LoadingOverlay, Stack, Flex, Text, Image, Group, Avatar, Badge, Button, Modal, TextInput, Select, FileInput, Textarea } from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import moment from "moment";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";

// Interface untuk data creator
interface CreatorProps {
  id: number;
  user_id: string;
  category_id: string;
  slug: string;
  name_event_organizer: string | null;
  name: string;
  image: string | null;
  phone_number: string | null;
  description: string | null;
  longitude: string | null;
  latitude: string | null;
  website: string | null;
  status: string;
  verified_status_id: number;
  created_by: string | null;
  updated_by: string | null;
  event_coordinator_name: string | null;
  event_cordinator_phone: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  email: string | null;
  location: string | null;
  is_verified: number;
  image_url: string;
  has_category: any;
  has_user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    email_verified_at: string | null;
    otp_code: string | null;
    otp_expiry_time: string | null;
    created_at: string;
    updated_at: string;
    verified_status_id: number | null;
    is_creator: number;
  };
}

export default function KelolaCreator() {
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<CreatorProps[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  
  // Modal untuk form
  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const form = useForm({
    initialValues: {
      name_event_organizer: "",
      name: "",
      location: "",
      phone_number: "",
      email: "",
      user_id: "",
      status: "active",
      image: null as File | null,
      description: "",
      website: "",
    },

    validate: {
      name: (value) => (!value ? "Nama creator harus diisi" : null),
      phone_number: (value) => (!value ? "Nomor telepon harus diisi" : null),
      email: (value) => (!value ? "Email harus diisi" : null),
      user_id: (value) => (!value ? "User ID harus diisi" : null),
    },
  });

  useEffect(() => {
    getData();
  }, []);

  const getData = async (params?: string) => {
    if (!loading.includes("getdata")) {
      try {
        await fetch<any, any>({
          url: "creator" + (params ? `?${params}` : ""),
          method: "GET",
          data: {},
          before: () => setLoading.append("getdata"),
          success: (response) => {
            console.log("API Response:", response);
            
            // Handle berbagai kemungkinan struktur response
            if (response && response.data) {
              // Jika response memiliki data dan pagination
              if (Array.isArray(response.data.data)) {
                // Format: { data: { data: [...], ...pagination } }
                setData(response.data.data);
                setPagination(response.data);
              } else if (Array.isArray(response.data)) {
                // Format: { data: [...] }
                setData(response.data);
                setPagination(response);
              } else if (response.data.items) {
                // Format: { data: { items: [...] } }
                setData(response.data.items);
                setPagination(response.data);
              } else {
                // Format lain
                setData(response.data);
                setPagination(response);
              }
            } else if (Array.isArray(response)) {
              // Jika response langsung array
              setData(response);
            } else if (response && response.items) {
              // Jika response memiliki items
              setData(response.items);
              setPagination(response);
            }
          },
          complete: () => setLoading.filter((e) => e !== "getdata"),
          error: (error) => {
            console.error("Error fetching data:", error);
            notifications.show({
              title: "Gagal",
              message: "Gagal mengambil data creator",
              color: "red",
            });
          },
        });
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
  };

  const handleAddClick = () => {
    setSelectedCreator(null);
    setIsEditMode(false);
    form.reset();
    openFormModal();
  };

  const handleEditClick = (creator: any) => {
    const creatorData = creator as CreatorProps;
    setSelectedCreator(creatorData);
    setIsEditMode(true);
    
    // Isi form dengan data yang dipilih
    form.setValues({
      name_event_organizer: creatorData.name_event_organizer || "",
      name: creatorData.name || "",
      location: creatorData.location || "",
      phone_number: creatorData.phone_number || "",
      email: creatorData.email || "",
      user_id: creatorData.user_id || "",
      status: creatorData.status || "active",
      image: null,
      description: creatorData.description || "",
      website: creatorData.website || "",
    });
    
    openFormModal();
  };

  const handleDelete = async (creator: any) => {
    const creatorData = creator as CreatorProps;
    if (!confirm(`Apakah Anda yakin ingin menghapus creator "${creatorData.name}"?`)) {
      return;
    }

    await fetch({
      url: `creator/${creatorData.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({
          title: "Berhasil",
          message: "Creator berhasil dihapus",
          color: "green",
        });
        getData();
      },
      error: () => {
        notifications.show({
          title: "Gagal",
          message: "Gagal menghapus creator",
          color: "red",
        });
      },
      complete: () => setLoading.filter((e) => e !== "delete"),
    });
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    const formData = new FormData();
    
    // Tambahkan semua field ke FormData
    Object.keys(values).forEach((key) => {
      const value = values[key as keyof typeof values];
      if (key === "image") {
        if (value) {
          formData.append(key, value);
        }
      } else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    const url = isEditMode ? `creator/${selectedCreator?.id}` : "creator";
    const method = isEditMode ? "PUT" : "POST";

    await fetch({
      url,
      method,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      before: () => setLoading.append("submit"),
      success: () => {
        notifications.show({
          title: "Berhasil",
          message: `Creator berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`,
          color: "green",
        });
        getData();
        closeFormModal();
        form.reset();
      },
      error: (error) => {
        notifications.show({
          title: "Gagal",
          message: error.message || `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} creator`,
          color: "red",
        });
      },
      complete: () => setLoading.filter((e) => e !== "submit"),
    });
  };

  return (
    <>
      <Stack className="p-[20px] md:p-[30px]" gap={30}>
        <LoadingOverlay visible={loading.includes("getdata")} />
        
        {/* Header dengan tombol Tambah */}
        <Flex gap={10} justify="space-between" align="center">
          <Stack gap={5}>
            <Text size="1.8rem" fw={600}>
              Kelola Creator
            </Text>
            <Text size="sm" c="gray">
              Daftar semua creator/event organizer
            </Text>
          </Stack>
          
          <Button
            onClick={handleAddClick}
            color="blue"
          >
            + Tambah Creator
          </Button>
        </Flex>

        {/* TABEL DATA CREATOR */}
        <TableData
          loading={loading.includes("getdata")}
          value={pagination}
          onChange={getData}
          data={data}
          mapData={(e: any) => {
            const creator = e as CreatorProps;
            
            return {
              created_at: creator.created_at ? moment(creator.created_at).format("DD MMM YYYY") : "-",
              image: creator.image_url ? (
                <Image src={creator.image_url} w={50} h={50} radius="sm" fit="cover" />
              ) : (
                <Avatar color="blue" radius="sm" w={50} h={50}>
                  {creator.name?.charAt(0) || "?"}
                </Avatar>
              ),
              name: (
                <Stack gap={2}>
                  <Text fw={500}>{creator.name || "-"}</Text>
                  {creator.name_event_organizer && (
                    <Text size="xs" c="dimmed">
                      EO: {creator.name_event_organizer}
                    </Text>
                  )}
                </Stack>
              ),
              contact: (
                <Stack gap={2}>
                  {creator.phone_number && <Text size="sm">{creator.phone_number}</Text>}
                  {creator.email && <Text size="xs" c="dimmed">{creator.email}</Text>}
                  {creator.location && <Text size="xs" c="dimmed">{creator.location}</Text>}
                </Stack>
              ),
              user: (
                <Stack gap={2}>
                  <Text size="sm" fw={500}>{creator.has_user?.name || creator.has_user?.email || "Tidak ada"}</Text>
                  <Text size="xs" c="dimmed">{creator.has_user?.email || ""}</Text>
                </Stack>
              ),
              status: (
                <Badge 
                  color={creator.status === "active" ? "green" : "red"} 
                  variant="light" 
                  size="sm"
                >
                  {creator.status === "active" ? "Aktif" : creator.status || "Unknown"}
                </Badge>
              ),
              verification: (
                <Badge 
                  color={creator.is_verified === 1 ? "blue" : "gray"} 
                  variant="light" 
                  size="sm"
                >
                  {creator.is_verified === 1 ? "Terverifikasi" : "Belum"}
                </Badge>
              ),
            };
          }}
          headerLabel={{
            created_at: "Tanggal Dibuat",
            image: "Logo",
            name: "Nama Creator",
            contact: "Kontak & Lokasi",
            user: "User Akun",
            status: "Status",
            verification: "Verifikasi",
          }}
          actionIcon={[
            { 
              icon: "mdi:pencil", 
              text: "Edit", 
              onClick: (row) => handleEditClick(row) 
            },
            { 
              icon: "mdi:trash", 
              text: "Hapus", 
              onClick: (row) => handleDelete(row), 
              color: "red" 
            }
          ]}
        />
      </Stack>

      {/* MODAL FORM CREATOR */}
      <Modal
        opened={formModalOpened}
        onClose={() => {
          closeFormModal();
          form.reset();
        }}
        title={isEditMode ? "Edit Creator" : "Tambah Creator Baru"}
        size="lg"
        centered
      >
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">
            <TextInput
              label="Nama Creator"
              placeholder="Contoh: Gwenesbuk Records"
              required
              {...form.getInputProps("name")}
            />

            <TextInput
              label="Nama Event Organizer"
              placeholder="Masukkan nama event organizer"
              {...form.getInputProps("name_event_organizer")}
            />

            <TextInput
              label="Lokasi"
              placeholder="Contoh: Jakarta"
              {...form.getInputProps("location")}
            />

            <TextInput
              label="Nomor Telepon"
              placeholder="Contoh: 081234567890"
              required
              {...form.getInputProps("phone_number")}
            />

            <TextInput
              label="Email"
              placeholder="Contoh: creator@example.com"
              required
              type="email"
              {...form.getInputProps("email")}
            />

            <TextInput
              label="User ID"
              placeholder="Masukkan ID user yang terkait"
              required
              {...form.getInputProps("user_id")}
            />

            <TextInput
              label="Website"
              placeholder="Contoh: https://example.com"
              {...form.getInputProps("website")}
            />

            <Select
              label="Status"
              data={[
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
              ]}
              required
              {...form.getInputProps("status")}
            />

            <Textarea
              label="Deskripsi"
              placeholder="Masukkan deskripsi tentang creator"
              autosize
              minRows={2}
              {...form.getInputProps("description")}
            />

            <FileInput
              label="Logo/Gambar"
              placeholder="Pilih file gambar"
              accept="image/*"
              onChange={(file) => form.setFieldValue("image", file)}
              clearable
              description={isEditMode && selectedCreator?.image_url ? "Biarkan kosong untuk tetap menggunakan gambar saat ini" : ""}
            />

            <Group justify="flex-end" mt="md">
              <Button 
                variant="outline" 
                onClick={() => {
                  closeFormModal();
                  form.reset();
                }}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                color="blue" 
                loading={loading.includes("submit")}
              >
                {isEditMode ? "Simpan Perubahan" : "Tambah Creator"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}