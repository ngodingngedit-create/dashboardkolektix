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

// Fungsi untuk mengkonversi file ke base64 murni (tanpa data URL prefix)
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Hapus bagian "data:image/...;base64," untuk mendapatkan base64 murni
      const pureBase64 = base64String.split(',')[1];
      resolve(pureBase64 || base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Fungsi untuk mengkonversi file ke base64 dengan format lengkap (data URL) untuk preview
const convertFileToBase64DataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function KelolaCreator() {
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<CreatorProps[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  
  // Modal untuk form
  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // State untuk preview gambar dan base64
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Form state - SESUAI dengan payload
  const form = useForm({
    initialValues: {
      name_event_organizer: "",
      name: "",
      location: "",
      phone_number: "",
      email: "",
      user_id: "", // Akan diubah ke number saat submit
      status: "active",
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
            
            if (response && response.data) {
              if (Array.isArray(response.data.data)) {
                setData(response.data.data);
                setPagination(response.data);
              } else if (Array.isArray(response.data)) {
                setData(response.data);
                setPagination(response);
              } else if (response.data.items) {
                setData(response.data.items);
                setPagination(response.data);
              } else {
                setData(response.data);
                setPagination(response);
              }
            } else if (Array.isArray(response)) {
              setData(response);
            } else if (response && response.items) {
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
    setImagePreview(null);
    setImageBase64(null);
    openFormModal();
  };

  const handleEditClick = (creator: any) => {
    const creatorData = creator as CreatorProps;
    setSelectedCreator(creatorData);
    setIsEditMode(true);
    
    // Set preview gambar jika ada
    if (creatorData.image_url) {
      setImagePreview(creatorData.image_url);
    }
    
    // Reset base64
    setImageBase64(null);
    
    // Isi form dengan data yang dipilih
    form.setValues({
      name_event_organizer: creatorData.name_event_organizer || "",
      name: creatorData.name || "",
      location: creatorData.location || "",
      phone_number: creatorData.phone_number || "",
      email: creatorData.email || "",
      user_id: creatorData.user_id || "",
      status: creatorData.status || "active",
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

  // Handler untuk perubahan file input
  const handleFileChange = async (file: File | null) => {
    if (file) {
      try {
        // Konversi file ke base64 murni untuk dikirim ke server
        const base64String = await convertFileToBase64(file);
        setImageBase64(base64String);
        
        // Konversi ke data URL untuk preview
        const base64DataURL = await convertFileToBase64DataURL(file);
        setImagePreview(base64DataURL);
        
        // Notifikasi sukses
        notifications.show({
          title: "Gambar berhasil diproses",
          message: "Gambar telah dikonversi ke base64",
          color: "green",
          autoClose: 2000,
        });
      } catch (error) {
        console.error("Error converting image to base64:", error);
        notifications.show({
          title: "Gagal",
          message: "Gagal memproses gambar",
          color: "red",
        });
      }
    } else {
      // Reset jika file dihapus
      setImageBase64(null);
      setImagePreview(null);
    }
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    // Siapkan payload sesuai dengan format yang Anda berikan
    const payload: any = {
      name_event_organizer: values.name_event_organizer || "",
      name: values.name,
      location: values.location || "",
      phone_number: values.phone_number,
      email: values.email,
      user_id: parseInt(values.user_id) || 0, // KONVERSI ke number
      status: values.status,
    };

    // Tambahkan description dan website jika ada (opsional)
    if (values.description) {
      payload.description = values.description;
    }
    
    if (values.website) {
      payload.website = values.website;
    }

    // Jika ada base64 image, tambahkan ke payload
    if (imageBase64) {
      payload.image = imageBase64;
    } else if (!isEditMode) {
      // Jika mode tambah dan tidak ada gambar, kirim null
      payload.image = null;
    }
    // Jika mode edit dan tidak ada gambar baru, JANGAN kirim field image sama sekali

    console.log("Payload yang akan dikirim:", payload);

    const url = isEditMode ? `creator/${selectedCreator?.id}` : "creator";
    const method = isEditMode ? "PUT" : "POST";

    await fetch({
      url,
      method,
      data: payload,
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
        setImagePreview(null);
        setImageBase64(null);
      },
      error: (error) => {
        console.error("Error submitting form:", error);
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
          setImagePreview(null);
          setImageBase64(null);
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
              type="number" // Tambahkan type number
              {...form.getInputProps("user_id")}
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
              label="Deskripsi (Opsional)"
              placeholder="Masukkan deskripsi tentang creator"
              autosize
              minRows={2}
              {...form.getInputProps("description")}
            />

            <TextInput
              label="Website (Opsional)"
              placeholder="Contoh: https://example.com"
              {...form.getInputProps("website")}
            />

            {/* Preview gambar */}
            {imagePreview && (
              <Stack gap={5}>
                <Text size="sm" fw={500}>Preview Gambar</Text>
                <Image 
                  src={imagePreview} 
                  w={100} 
                  h={100} 
                  radius="sm" 
                  fit="cover"
                  alt="Preview"
                />
              </Stack>
            )}

            {!imagePreview && isEditMode && selectedCreator?.image_url && (
              <Stack gap={5}>
                <Text size="sm" fw={500}>Gambar Saat Ini</Text>
                <Image 
                  src={selectedCreator.image_url} 
                  w={100} 
                  h={100} 
                  radius="sm" 
                  fit="cover"
                  alt="Current"
                />
              </Stack>
            )}

            <FileInput
              label="Logo/Gambar (Opsional)"
              placeholder="Pilih file gambar"
              accept="image/*"
              onChange={handleFileChange}
              clearable
              description={isEditMode && selectedCreator?.image_url ? 
                "Pilih gambar baru untuk mengubah, atau biarkan kosong untuk tetap menggunakan gambar saat ini" : 
                "Opsional, dapat diupload nanti"}
            />

            {imageBase64 && (
              <Text size="xs" c="dimmed">
                Gambar berhasil dikonversi ke base64 ({Math.round(imageBase64.length / 1024)} KB)
              </Text>
            )}

            <Group justify="flex-end" mt="md">
              <Button 
                variant="outline" 
                onClick={() => {
                  closeFormModal();
                  form.reset();
                  setImagePreview(null);
                  setImageBase64(null);
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