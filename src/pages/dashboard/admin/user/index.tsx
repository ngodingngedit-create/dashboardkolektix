import { useEffect, useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import TableData from "@/components/TableData";
import { Pagination as PaginationType } from "@/types/model";
import fetch from "@/utils/fetch";
import { LoadingOverlay, Stack, Flex, Text, Image, Group, Avatar, Badge, Button, TextInput, Select, FileInput, Textarea, Switch, Divider, Card, Box, Pagination, Grid, ActionIcon, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useDisclosure, useListState, useDebouncedValue } from "@mantine/hooks";
import moment from "moment";

const tableHeadStyle: React.CSSProperties = {
  padding: "12px 15px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: "#495057",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tableCellStyle: React.CSSProperties = {
  padding: "10px 15px",
  fontSize: "13px",
  color: "#495057",
  verticalAlign: "middle",
};

// Interface untuk data creator (disesuaikan untuk user)
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
    is_creator: number; // 0 = user biasa, 1 = creator
  };
}

export default function KelolaUser() {
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<CreatorProps[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CreatorProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({ key: "created_at", direction: "desc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  // Form state untuk user
  const form = useForm({
    initialValues: {
      // Data user
      name: "",
      email: "",
      phone: "",
      is_creator: 0,
      verified_status_id: 1,

      // Data creator (hanya jika is_creator = 1)
      name_event_organizer: "",
      location: "",
      phone_number: "",
      description: "",
      website: "",
      status: "active",
      image: null as File | null,
    },

    validate: {
      name: (value) => (!value ? "Nama user harus diisi" : null),
      email: (value) => {
        if (!value) return "Email harus diisi";
        if (!/^\S+@\S+$/.test(value)) return "Email tidak valid";
        return null;
      },
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

            // Filter data hanya untuk user dengan is_creator = 0
            let filteredData: CreatorProps[] = [];

            // Handle berbagai kemungkinan struktur response
            if (response && response.data) {
              let creators: CreatorProps[] = [];

              if (Array.isArray(response.data.data)) {
                creators = response.data.data;
              } else if (Array.isArray(response.data)) {
                creators = response.data;
              } else if (response.data.items) {
                creators = response.data.items;
              } else {
                creators = [response.data];
              }

              // Filter: hanya ambil data dengan has_user.is_creator === 0
              filteredData = creators.filter((creator: CreatorProps) => creator.has_user?.is_creator === 0);
            }

            setData(filteredData);
            setPagination(response?.data || response);
          },
          complete: () => setLoading.filter((e) => e !== "getdata"),
          error: (error) => {
            console.error("Error fetching data:", error);
            notifications.show({
              title: "Gagal",
              message: "Gagal mengambil data user",
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
    setSelectedUser(null);
    setIsEditMode(false);
    form.reset();
    setIsFormVisible(true);
  };

  const handleEditClick = (user: any) => {
    const userData = user as CreatorProps;
    setSelectedUser(userData);
    setIsEditMode(true);

    // Isi form dengan data yang dipilih
    form.setValues({
      // Data user
      name: userData.has_user?.name || "",
      email: userData.has_user?.email || "",
      phone: userData.has_user?.phone || "",
      is_creator: userData.has_user?.is_creator || 0,
      verified_status_id: userData.has_user?.verified_status_id || 1,

      // Data creator
      name_event_organizer: userData.name_event_organizer || "",
      location: userData.location || "",
      phone_number: userData.phone_number || "",
      description: userData.description || "",
      website: userData.website || "",
      status: userData.status || "active",
      image: null,
    });

    setIsFormVisible(true);
  };

  const handleDelete = async (user: any) => {
    const userData = user as CreatorProps;
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userData.has_user?.name}"?`)) {
      return;
    }

    // Perhatikan: Endpoint ini menghapus creator, bukan user
    // Sesuaikan dengan API Anda jika ingin menghapus user
    await fetch({
      url: `creator/${userData.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({
          title: "Berhasil",
          message: "User berhasil dihapus",
          color: "green",
        });
        getData();
      },
      error: () => {
        notifications.show({
          title: "Gagal",
          message: "Gagal menghapus user",
          color: "red",
        });
      },
      complete: () => setLoading.filter((e) => e !== "delete"),
    });
  };

  // Fungsi untuk auto-verify user setelah registrasi
  const autoVerifyUser = async (email: string, otpCode: string): Promise<boolean> => {
    try {
      return new Promise((resolve) => {
        fetch({
          url: "verify-register",
          method: "POST",
          data: {
            email: email,
            otp_code: otpCode
          },
          success: () => {
            console.log("Auto verification successful for:", email);
            resolve(true);
          },
          error: (error) => {
            console.error("Auto verification failed:", error);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error("Verification request error:", error);
      return false;
    }
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    if (isEditMode && selectedUser) {
      // UPDATE USER DAN/ATAU CREATOR

      // 1. Update data user di endpoint user
      const userUpdateData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        is_creator: values.is_creator,
        verified_status_id: values.verified_status_id,
      };

      try {
        await fetch({
          url: `users/${selectedUser.has_user?.id}`,
          method: "PUT",
          data: userUpdateData,
          before: () => setLoading.append("submit"),
          success: async () => {
            // 2. Jika is_creator = 1, update juga data creator
            if (values.is_creator === 1) {
              await updateCreatorData(values);
            } else {
              notifications.show({
                title: "Berhasil",
                message: "User berhasil diperbarui",
                color: "green",
              });
              getData();
              setIsFormVisible(false);
              form.reset();
            }
          },
          error: (error) => {
            notifications.show({
              title: "Gagal",
              message: error.message || "Gagal memperbarui user",
              color: "red",
            });
          },
          complete: () => setLoading.filter((e) => e !== "submit"),
        });
      } catch (error) {
        console.error("Update error:", error);
        notifications.show({
          title: "Error",
          message: "Terjadi kesalahan saat memperbarui user",
          color: "red",
        });
      }
    } else {
      // TAMBAH USER BARU dengan auto-verification
      const userData = {
        name: values.name,
        email: values.email,
        phone: values.phone || "",
        is_creator: values.is_creator,
        verified_status_id: values.verified_status_id,
      };

      try {
        await fetch({
          url: "register",
          method: "POST",
          data: userData,
          before: () => setLoading.append("submit"),
          success: async (response) => {
            console.log("Register response:", response);

            // Cek apakah response mengandung OTP code
            const otpCode = response.data?.otp_code;
            const userEmail = values.email;
            const userId = response.data?.id;

            let verificationSuccess = false;

            // Jika ada OTP code di response, lakukan auto verification
            if (otpCode && userEmail) {
              verificationSuccess = await autoVerifyUser(userEmail, otpCode);
            }

            // Jika is_creator = 1, buat data creator
            if (values.is_creator === 1 && userId) {
              await createCreatorData(values, userId);
            }

            // Tampilkan notifikasi berdasarkan hasil
            if (verificationSuccess) {
              notifications.show({
                title: "Berhasil",
                message: "User berhasil ditambahkan dan diverifikasi otomatis",
                color: "green",
              });
            } else if (otpCode) {
              notifications.show({
                title: "Berhasil",
                message: "User berhasil ditambahkan, tetapi verifikasi otomatis gagal",
                color: "orange",
              });
            } else {
              notifications.show({
                title: "Berhasil",
                message: "User berhasil ditambahkan",
                color: "green",
              });
            }

            getData();
            setIsFormVisible(false);
            form.reset();
          },
          error: (error) => {
            console.error("Register error:", error);
            notifications.show({
              title: "Gagal",
              message: error.message || "Gagal menambahkan user",
              color: "red",
            });
          },
          complete: () => setLoading.filter((e) => e !== "submit"),
        });
      } catch (error) {
        console.error("Create error:", error);
        notifications.show({
          title: "Error",
          message: "Terjadi kesalahan saat menambahkan user",
          color: "red",
        });
      }
    }
  };

  const updateCreatorData = async (values: typeof form.values) => {
    if (!selectedUser) return;

    const formData = new FormData();

    // Tambahkan data creator ke FormData
    const creatorFields = {
      name_event_organizer: values.name_event_organizer,
      name: values.name, // Nama creator sama dengan nama user
      location: values.location,
      phone_number: values.phone_number,
      description: values.description,
      website: values.website,
      status: values.status,
      user_id: selectedUser.user_id,
    };

    Object.keys(creatorFields).forEach((key) => {
      const value = creatorFields[key as keyof typeof creatorFields];
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    if (values.image) {
      formData.append("image", values.image);
    }

    await fetch({
      url: `creator/${selectedUser.id}`,
      method: "PUT",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      success: () => {
        notifications.show({
          title: "Berhasil",
          message: "User dan data creator berhasil diperbarui",
          color: "green",
        });
      },
      error: (error) => {
        notifications.show({
          title: "Peringatan",
          message: "User berhasil diperbarui, tetapi gagal update data creator: " + (error.message || ""),
          color: "orange",
        });
      },
    });
  };

  const createCreatorData = async (values: typeof form.values, userId: number) => {
    const formData = new FormData();

    // Data untuk membuat creator baru
    const creatorFields = {
      name_event_organizer: values.name_event_organizer,
      name: values.name,
      location: values.location,
      phone_number: values.phone_number,
      description: values.description,
      website: values.website,
      status: values.status,
      user_id: userId.toString(),
    };

    Object.keys(creatorFields).forEach((key) => {
      const value = creatorFields[key as keyof typeof creatorFields];
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    if (values.image) {
      formData.append("image", values.image);
    }

    await fetch({
      url: "creator",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      success: () => {
        console.log("Creator data created successfully");
      },
      error: (error) => {
        console.error("Create creator error:", error);
        notifications.show({
          title: "Peringatan",
          message: "User berhasil ditambahkan, tetapi gagal membuat data creator: " + (error.message || ""),
          color: "orange",
        });
      },
    });
  };

  const stats = useMemo(() => {
    return {
      total: data.length,
      active: data.filter(d => d.status === "active").length,
      verified: data.filter(d => d.is_verified === 1).length,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (item) =>
          (item.has_user?.name && item.has_user.name.toLowerCase().includes(needle)) ||
          (item.has_user?.email && item.has_user.email.toLowerCase().includes(needle)) ||
          (item.name_event_organizer && item.name_event_organizer.toLowerCase().includes(needle))
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        let valA = a[sortConfig.key as string];
        let valB = b[sortConfig.key as string];

        if (sortConfig.key === "user") { valA = a.has_user?.name; valB = b.has_user?.name; }
        if (sortConfig.key === "status") { valA = a.status; valB = b.status; }
        if (sortConfig.key === "is_verified") { valA = a.is_verified; valB = b.is_verified; }

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, debouncedSearch, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    else if (sortConfig.key === key && sortConfig.direction === "desc") direction = null;
    setSortConfig({ key, direction });
  };

  const renderForm = () => (
    <Stack gap={25} className="p-[20px] md:p-[30px]" pos="relative">
      <Flex align="center" gap={15}>
        <Tooltip label="Kembali">
          <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="xl">
            <Icon icon="mdi:arrow-left" width={20} />
          </ActionIcon>
        </Tooltip>
        <Stack gap={0}>
          <Text size="1.5rem" fw={600}>{isEditMode ? "Edit User" : "Tambah User Baru"}</Text>
          <Text size="xs" c="dimmed">Isi form di bawah untuk mengelola data user</Text>
        </Stack>
      </Flex>

      <form id="user-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">
            <Text fw={600} size="lg">Data User</Text>
            <Grid>
              <Grid.Col span={6}>
                <TextInput label="Nama Lengkap" placeholder="Contoh: John Doe" required {...form.getInputProps("name")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Email" placeholder="Contoh: user@example.com" required type="email" {...form.getInputProps("email")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Nomor Telepon" placeholder="Contoh: 081234567890" {...form.getInputProps("phone")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Status Verifikasi User"
                  data={[
                    { value: "1", label: "Terverifikasi" },
                    { value: "0", label: "Belum Terverifikasi" },
                  ]}
                  value={form.values.verified_status_id?.toString()}
                  onChange={(value) => form.setFieldValue("verified_status_id", parseInt(value || "1"))}
                />
              </Grid.Col>
            </Grid>

            <Switch
              label="Jadikan sebagai Creator"
              description="Jika aktif, user ini akan memiliki akses sebagai creator/event organizer"
              checked={form.values.is_creator === 1}
              onChange={(event) => form.setFieldValue("is_creator", event.currentTarget.checked ? 1 : 0)}
              mt="md"
            />

            {form.values.is_creator === 1 && (
              <>
                <Divider my="sm" />
                <Text fw={600} size="lg">Data Creator</Text>
                <Text size="sm" c="dimmed">Isi data berikut jika user ini juga berperan sebagai creator/event organizer</Text>

                <Grid>
                  <Grid.Col span={6}>
                    <TextInput label="Nama Event Organizer" placeholder="Masukkan nama event organizer" {...form.getInputProps("name_event_organizer")} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Lokasi" placeholder="Contoh: Jakarta" {...form.getInputProps("location")} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Nomor Telepon Creator" placeholder="Contoh: 081234567890" {...form.getInputProps("phone_number")} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Website" placeholder="Contoh: https://example.com" {...form.getInputProps("website")} />
                  </Grid.Col>
                </Grid>

                <Select
                  label="Status Creator"
                  data={[
                    { value: "active", label: "Aktif" },
                    { value: "inactive", label: "Nonaktif" },
                  ]}
                  required
                  {...form.getInputProps("status")}
                />

                <Textarea label="Deskripsi Creator" placeholder="Masukkan deskripsi tentang creator" autosize minRows={2} {...form.getInputProps("description")} />

                <FileInput
                  label="Logo/Gambar Creator"
                  placeholder="Pilih file gambar"
                  accept="image/*"
                  onChange={(file) => form.setFieldValue("image", file)}
                  clearable
                  description={isEditMode && selectedUser?.image_url ? "Biarkan kosong untuk tetap menggunakan gambar saat ini" : ""}
                />
              </>
            )}
          </Stack>
        </Card>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-[30px] py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)} disabled={loading.includes("submit")}>
              Batal
            </Button>
            <Button type="submit" form="user-form" color="blue" loading={loading.includes("submit")}>
              {isEditMode ? "Simpan Perubahan" : "Simpan User"}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  const renderList = () => (
    <Stack className="p-[20px] md:p-[30px]" gap={30}>
      <LoadingOverlay visible={loading.includes("getdata")} />

      <Flex justify="space-between" align="center">
        <Stack gap={2}>
          <Text size="1.8rem" fw={600} c="black">Kelola User</Text>
          <Text size="sm" c="black">Daftar semua user kolektix</Text>
        </Stack>
        <Button 
          onClick={handleAddClick} 
          leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
          color="indigo"
          radius="md"
        >
          Tambah User
        </Button>
      </Flex>

      <Box 
        style={{ 
          backgroundColor: "white", 
          borderRadius: "12px", 
          border: "1px solid #eee", 
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
        }}
      >
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <div style={{ width: 250 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Pencarian</Text>
            <TextInput 
              placeholder="Cari user (nama, email)..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              leftSection={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
            />
          </div>
        </Flex>

        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafd", borderBottom: "1px solid #eee" }}>
                {[
                  { label: "No", sortable: false },
                  { label: "Tanggal Dibuat", sortable: true, key: "created_at" },
                  { label: "User", sortable: true, key: "user" },
                  { label: "Kontak", sortable: false },
                  { label: "Status", sortable: true, key: "status" },
                  { label: "Verifikasi", sortable: true, key: "is_verified" },
                  { label: "Aksi", sortable: false },
                ].map((col, i) => (
                  <th 
                    key={i} 
                    onClick={() => col.sortable && requestSort(col.key!)} 
                    style={{ 
                      ...tableHeadStyle,
                      cursor: col.sortable ? "pointer" : "default",
                      position: col.label === "Aksi" ? "sticky" : "static", 
                      right: col.label === "Aksi" ? 0 : "auto", 
                      backgroundColor: col.label === "Aksi" ? "#f8fafd" : "transparent", 
                      zIndex: col.label === "Aksi" ? 10 : 1 
                    }}
                  >
                    <Flex align="center" gap={6}>
                      {col.label}
                      {col.sortable && (
                        sortConfig.key === col.key ? (
                          <Icon icon={sortConfig.direction === "asc" ? "ph:caret-up-bold" : "ph:caret-down-bold"} width={12} className="text-indigo-500" />
                        ) : (
                          <Icon icon="ph:caret-up-down-bold" width={12} className="text-gray-300" />
                        )
                      )}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "60px", textAlign: "center" }}>
                    <Stack align="center" gap="xs">
                      <Icon icon="ph:user-circle-minus" className="text-5xl text-gray-300" />
                      <Text c="dimmed" fw={500}>Data user tidak ditemukan</Text>
                    </Stack>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr 
                    key={idx} 
                    style={{ borderBottom: "1px solid #f1f3f5", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafd")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={tableCellStyle}>
                      <Text size="sm" fw={600} c="dimmed">
                        {pagination?.current_page ? (Number(pagination.current_page) - 1) * (Number(pagination.per_page) || 10) + idx + 1 : idx + 1}
                      </Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm">{item.created_at ? moment(item.created_at).format("DD MMM YYYY") : "-"}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Group gap="sm">
                        <Avatar color="indigo" radius="sm" size="md" variant="light">
                          {item.has_user?.name?.charAt(0) || "?"}
                        </Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={600} c="gray.8">{item.has_user?.name || "-"}</Text>
                          <Text size="xs" c="dimmed">{item.has_user?.email || ""}</Text>
                          <Text size="xs" c="indigo.4">ID: {item.user_id || "-"}</Text>
                        </Stack>
                      </Group>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm" fw={500}>{item.has_user?.phone || "-"}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge 
                        color={item.status === "active" ? "teal" : "gray"} 
                        variant="filled" 
                        radius="xs"
                        size="xs"
                      >
                        {item.status === "active" ? "AKTIF" : "NONAKTIF"}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge 
                        color={item.is_verified === 1 ? "indigo" : "orange"} 
                        variant="filled" 
                        radius="xs"
                        size="xs"
                      >
                        {item.is_verified === 1 ? "VERIFIED" : "PENDING"}
                      </Badge>
                    </td>
                    <td style={{ ...tableCellStyle, position: "sticky", right: 0, backgroundColor: "inherit", zIndex: 5, boxShadow: "-4px 0 8px rgba(0,0,0,0.02)" }}>
                      <Flex gap={6}>
                        <Tooltip label="Edit Data" withArrow>
                          <ActionIcon 
                            variant="filled" 
                            color="indigo" 
                            onClick={() => handleEditClick(item)}
                            size="sm"
                          >
                            <Icon icon="ph:pencil-simple" className="text-lg" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus User" withArrow>
                          <ActionIcon 
                            variant="filled" 
                            color="red" 
                            onClick={() => handleDelete(item)}
                            size="sm"
                          >
                            <Icon icon="ph:trash" className="text-lg" />
                          </ActionIcon>
                        </Tooltip>
                      </Flex>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      {pagination && pagination.last_page > 1 && (
        <Flex justify="center" mt="md">
          <Pagination total={pagination.last_page} value={pagination.current_page} onChange={(page: number) => getData(`page=${page}`)} color="blue" />
        </Flex>
      )}
    </Stack>
  );

  return <>{isFormVisible ? renderForm() : renderList()}</>;
}