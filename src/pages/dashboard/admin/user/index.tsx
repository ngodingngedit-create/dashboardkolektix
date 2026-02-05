// import TableData from "@/components/TableData";
// import { Pagination } from "@/types/model";
// import fetch from "@/utils/fetch";
// import { LoadingOverlay, Stack, Flex, Text, Image, Group, Avatar, Badge, Button, Modal, TextInput, Select, FileInput, Textarea, Switch, Divider } from "@mantine/core";
// import { useDisclosure, useListState } from "@mantine/hooks";
// import moment from "moment";
// import { useEffect, useState } from "react";
// import { notifications } from "@mantine/notifications";
// import { useForm } from "@mantine/form";

// // Interface untuk data creator (disesuaikan untuk user)
// interface CreatorProps {
//   id: number;
//   user_id: string;
//   category_id: string;
//   slug: string;
//   name_event_organizer: string | null;
//   name: string;
//   image: string | null;
//   phone_number: string | null;
//   description: string | null;
//   longitude: string | null;
//   latitude: string | null;
//   website: string | null;
//   status: string;
//   verified_status_id: number;
//   created_by: string | null;
//   updated_by: string | null;
//   event_coordinator_name: string | null;
//   event_cordinator_phone: string | null;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
//   email: string | null;
//   location: string | null;
//   is_verified: number;
//   image_url: string;
//   has_category: any;
//   has_user: {
//     id: number;
//     name: string;
//     email: string;
//     phone: string | null;
//     email_verified_at: string | null;
//     otp_code: string | null;
//     otp_expiry_time: string | null;
//     created_at: string;
//     updated_at: string;
//     verified_status_id: number | null;
//     is_creator: number; // 0 = user biasa, 1 = creator
//   };
// }

// export default function KelolaUser() {
//   const [loading, setLoading] = useListState<string>();
//   const [data, setData] = useState<CreatorProps[]>([]);
//   const [pagination, setPagination] = useState<any>(null);

//   // Modal untuk form
//   const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
//   const [selectedUser, setSelectedUser] = useState<CreatorProps | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);

//   // Form state untuk user
//   const form = useForm({
//     initialValues: {
//       // Data user
//       name: "",
//       email: "",
//       phone: "",
//       is_creator: 0,
//       verified_status_id: 1,

//       // Data creator (hanya jika is_creator = 1)
//       name_event_organizer: "",
//       location: "",
//       phone_number: "",
//       description: "",
//       website: "",
//       status: "active",
//       image: null as File | null,
//     },

//     validate: {
//       name: (value) => (!value ? "Nama user harus diisi" : null),
//       email: (value) => {
//         if (!value) return "Email harus diisi";
//         if (!/^\S+@\S+$/.test(value)) return "Email tidak valid";
//         return null;
//       },
//     },
//   });

//   useEffect(() => {
//     getData();
//   }, []);

//   const getData = async (params?: string) => {
//     if (!loading.includes("getdata")) {
//       try {
//         await fetch<any, any>({
//           url: "creator" + (params ? `?${params}` : ""),
//           method: "GET",
//           data: {},
//           before: () => setLoading.append("getdata"),
//           success: (response) => {
//             console.log("API Response:", response);

//             // Filter data hanya untuk user dengan is_creator = 0
//             let filteredData: CreatorProps[] = [];

//             // Handle berbagai kemungkinan struktur response
//             if (response && response.data) {
//               let creators: CreatorProps[] = [];

//               if (Array.isArray(response.data.data)) {
//                 creators = response.data.data;
//               } else if (Array.isArray(response.data)) {
//                 creators = response.data;
//               } else if (response.data.items) {
//                 creators = response.data.items;
//               } else {
//                 creators = [response.data];
//               }

//               // Filter: hanya ambil data dengan has_user.is_creator === 0
//               filteredData = creators.filter((creator: CreatorProps) => creator.has_user?.is_creator === 0);
//             }

//             setData(filteredData);
//             setPagination(response?.data || response);
//           },
//           complete: () => setLoading.filter((e) => e !== "getdata"),
//           error: (error) => {
//             console.error("Error fetching data:", error);
//             notifications.show({
//               title: "Gagal",
//               message: "Gagal mengambil data user",
//               color: "red",
//             });
//           },
//         });
//       } catch (error) {
//         console.error("Fetch error:", error);
//       }
//     }
//   };

//   const handleAddClick = () => {
//     setSelectedUser(null);
//     setIsEditMode(false);
//     form.reset();
//     openFormModal();
//   };

//   const handleEditClick = (user: any) => {
//     const userData = user as CreatorProps;
//     setSelectedUser(userData);
//     setIsEditMode(true);

//     // Isi form dengan data yang dipilih
//     form.setValues({
//       // Data user
//       name: userData.has_user?.name || "",
//       email: userData.has_user?.email || "",
//       phone: userData.has_user?.phone || "",
//       is_creator: userData.has_user?.is_creator || 0,
//       verified_status_id: userData.has_user?.verified_status_id || 1,

//       // Data creator
//       name_event_organizer: userData.name_event_organizer || "",
//       location: userData.location || "",
//       phone_number: userData.phone_number || "",
//       description: userData.description || "",
//       website: userData.website || "",
//       status: userData.status || "active",
//       image: null,
//     });

//     openFormModal();
//   };

//   const handleDelete = async (user: any) => {
//     const userData = user as CreatorProps;
//     if (!confirm(`Apakah Anda yakin ingin menghapus user "${userData.has_user?.name}"?`)) {
//       return;
//     }

//     // Perhatikan: Endpoint ini menghapus creator, bukan user
//     // Sesuaikan dengan API Anda jika ingin menghapus user
//     await fetch({
//       url: `creator/${userData.id}`,
//       method: "DELETE",
//       data: {},
//       before: () => setLoading.append("delete"),
//       success: () => {
//         notifications.show({
//           title: "Berhasil",
//           message: "User berhasil dihapus",
//           color: "green",
//         });
//         getData();
//       },
//       error: () => {
//         notifications.show({
//           title: "Gagal",
//           message: "Gagal menghapus user",
//           color: "red",
//         });
//       },
//       complete: () => setLoading.filter((e) => e !== "delete"),
//     });
//   };

//   const handleFormSubmit = async (values: typeof form.values) => {
//     if (isEditMode && selectedUser) {
//       // UPDATE USER DAN/ATAU CREATOR

//       // 1. Update data user di endpoint user
//       const userUpdateData = {
//         name: values.name,
//         email: values.email,
//         phone: values.phone,
//         is_creator: values.is_creator,
//         verified_status_id: values.verified_status_id,
//       };

//       try {
//         await fetch({
//           url: `users/${selectedUser.has_user?.id}`, // Sesuaikan endpoint user
//           method: "PUT",
//           data: userUpdateData,
//           before: () => setLoading.append("submit"),
//           success: () => {
//             // 2. Jika is_creator = 1, update juga data creator
//             if (values.is_creator === 1) {
//               updateCreatorData(values);
//             } else {
//               notifications.show({
//                 title: "Berhasil",
//                 message: "User berhasil diperbarui",
//                 color: "green",
//               });
//               getData();
//               closeFormModal();
//               form.reset();
//             }
//           },
//           error: (error) => {
//             notifications.show({
//               title: "Gagal",
//               message: error.message || "Gagal memperbarui user",
//               color: "red",
//             });
//           },
//           complete: () => setLoading.filter((e) => e !== "submit"),
//         });
//       } catch (error) {
//         console.error("Update error:", error);
//       }
//     } else {
//       // TAMBAH USER BARU dengan auto-verification
//       const userData = {
//         name: values.name,
//         email: values.email,
//         phone: values.phone || "", // Phone bisa kosong
//         is_creator: values.is_creator,
//         // Auto verify user dengan mengirim OTP langsung
//         otp_code: "123456", // Kode OTP default untuk auto-verification
//         otp_expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 jam dari sekarang
//         verified_status_id: values.verified_status_id,
//       };

//       try {
//         await fetch({
//           url: "register", // Gunakan endpoint register untuk membuat user
//           method: "POST",
//           data: userData,
//           before: () => setLoading.append("submit"),
//           success: (response) => {
//             console.log("Register response:", response);

//             // Jika is_creator = 1, buat juga data creator
//             if (values.is_creator === 1 && response.data?.id) {
//               createCreatorData(values, response.data.id);
//             } else {
//               notifications.show({
//                 title: "Berhasil",
//                 message: "User berhasil ditambahkan dan diverifikasi otomatis",
//                 color: "green",
//               });
//               getData();
//               closeFormModal();
//               form.reset();
//             }
//           },
//           error: (error) => {
//             notifications.show({
//               title: "Gagal",
//               message: error.message || "Gagal menambahkan user",
//               color: "red",
//             });
//           },
//           complete: () => setLoading.filter((e) => e !== "submit"),
//         });
//       } catch (error) {
//         console.error("Create error:", error);
//       }
//     }
//   };

//   const updateCreatorData = async (values: typeof form.values) => {
//     if (!selectedUser) return;

//     const formData = new FormData();

//     // Tambahkan data creator ke FormData
//     const creatorFields = {
//       name_event_organizer: values.name_event_organizer,
//       name: values.name, // Nama creator sama dengan nama user
//       location: values.location,
//       phone_number: values.phone_number,
//       description: values.description,
//       website: values.website,
//       status: values.status,
//       user_id: selectedUser.user_id,
//     };

//     Object.keys(creatorFields).forEach((key) => {
//       const value = creatorFields[key as keyof typeof creatorFields];
//       if (value !== null && value !== undefined && value !== "") {
//         formData.append(key, String(value));
//       }
//     });

//     if (values.image) {
//       formData.append("image", values.image);
//     }

//     await fetch({
//       url: `creator/${selectedUser.id}`,
//       method: "PUT",
//       data: formData,
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//       success: () => {
//         notifications.show({
//           title: "Berhasil",
//           message: "User dan data creator berhasil diperbarui",
//           color: "green",
//         });
//         getData();
//         closeFormModal();
//         form.reset();
//       },
//       error: (error) => {
//         notifications.show({
//           title: "Peringatan",
//           message: "User berhasil diperbarui, tetapi gagal update data creator: " + (error.message || ""),
//           color: "orange",
//         });
//         getData();
//         closeFormModal();
//         form.reset();
//       },
//     });
//   };

//   const createCreatorData = async (values: typeof form.values, userId: number) => {
//     const formData = new FormData();

//     // Data untuk membuat creator baru
//     const creatorFields = {
//       name_event_organizer: values.name_event_organizer,
//       name: values.name,
//       location: values.location,
//       phone_number: values.phone_number,
//       description: values.description,
//       website: values.website,
//       status: values.status,
//       user_id: userId.toString(),
//     };

//     Object.keys(creatorFields).forEach((key) => {
//       const value = creatorFields[key as keyof typeof creatorFields];
//       if (value !== null && value !== undefined && value !== "") {
//         formData.append(key, String(value));
//       }
//     });

//     if (values.image) {
//       formData.append("image", values.image);
//     }

//     await fetch({
//       url: "creator",
//       method: "POST",
//       data: formData,
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//       success: () => {
//         notifications.show({
//           title: "Berhasil",
//           message: "User dan creator berhasil ditambahkan",
//           color: "green",
//         });
//         getData();
//         closeFormModal();
//         form.reset();
//       },
//       error: (error) => {
//         notifications.show({
//           title: "Peringatan",
//           message: "User berhasil ditambahkan, tetapi gagal membuat data creator: " + (error.message || ""),
//           color: "orange",
//         });
//         getData();
//         closeFormModal();
//         form.reset();
//       },
//     });
//   };

//   return (
//     <>
//       <Stack className="p-[20px] md:p-[30px]" gap={30}>
//         <LoadingOverlay visible={loading.includes("getdata")} />

//         {/* Header dengan tombol Tambah */}
//         <Flex gap={10} justify="space-between" align="center">
//           <Stack gap={5}>
//             <Text size="1.8rem" fw={600}>
//               Kelola User
//             </Text>
//             <Text size="sm" c="gray">
//               Daftar semua user non-creator (is_creator = 0)
//             </Text>
//           </Stack>

//           <Button onClick={handleAddClick} color="blue">
//             + Tambah User
//           </Button>
//         </Flex>

//         {/* TABEL DATA USER */}
//         <TableData
//           loading={loading.includes("getdata")}
//           value={pagination}
//           onChange={getData}
//           data={data}
//           mapData={(e: any) => {
//             const userData = e as CreatorProps;

//             return {
//               created_at: userData.created_at ? moment(userData.created_at).format("DD MMM YYYY") : "-",
//               user: (
//                 <Group gap="sm">
//                   <Avatar color="blue" radius="sm" size="md">
//                     {userData.has_user?.name?.charAt(0) || "?"}
//                   </Avatar>
//                   <Stack gap={2}>
//                     <Text fw={500}>{userData.has_user?.name || "-"}</Text>
//                     <Text size="xs" c="dimmed">
//                       ID: {userData.user_id || "-"}
//                     </Text>
//                     <Text size="xs" c="dimmed">
//                       {userData.has_user?.email || ""}
//                     </Text>
//                   </Stack>
//                 </Group>
//               ),
//               contact: <Stack gap={2}>{userData.has_user?.phone && <Text size="sm">{userData.has_user.phone}</Text>}</Stack>,
//               status: (
//                 <Badge color={userData.status === "active" ? "green" : "gray"} variant="light" size="sm">
//                   {userData.status === "active" ? "Aktif" : "Nonaktif"}
//                 </Badge>
//               ),
//               verification: (
//                 <Badge color={userData.is_verified === 1 ? "blue" : "orange"} variant="light" size="sm">
//                   {userData.is_verified === 1 ? "Terverifikasi" : "Belum"}
//                 </Badge>
//               ),
//             };
//           }}
//           headerLabel={{
//             created_at: "Tanggal Dibuat",
//             user: "User",
//             contact: "Kontak",
//             status: "Status",
//             verification: "Verifikasi",
//           }}
//           actionIcon={[
//             {
//               icon: "mdi:pencil",
//               text: "Edit",
//               onClick: (row) => handleEditClick(row),
//             },
//             {
//               icon: "mdi:trash",
//               text: "Hapus",
//               onClick: (row) => handleDelete(row),
//               color: "red",
//             },
//           ]}
//         />
//       </Stack>

//       {/* MODAL FORM USER */}
//       <Modal
//         opened={formModalOpened}
//         onClose={() => {
//           closeFormModal();
//           form.reset();
//         }}
//         title={isEditMode ? "Edit User" : "Tambah User Baru"}
//         size="lg"
//         centered
//       >
//         <form onSubmit={form.onSubmit(handleFormSubmit)}>
//           <LoadingOverlay visible={loading.includes("submit")} />
//           <Stack gap="md">
//             {/* SECTION DATA USER */}
//             <Text fw={600} size="lg">
//               Data User
//             </Text>

//             <TextInput label="Nama Lengkap" placeholder="Contoh: John Doe" required {...form.getInputProps("name")} />

//             <TextInput label="Email" placeholder="Contoh: user@example.com" required type="email" {...form.getInputProps("email")} />

//             <TextInput label="Nomor Telepon" placeholder="Contoh: 081234567890" {...form.getInputProps("phone")} />

//             <Select
//               label="Status Verifikasi User"
//               data={[
//                 { value: "1", label: "Terverifikasi" },
//                 { value: "0", label: "Belum Terverifikasi" },
//               ]}
//               value={form.values.verified_status_id?.toString()}
//               onChange={(value) => form.setFieldValue("verified_status_id", parseInt(value || "1"))}
//             />

//             <Switch
//               label="Jadikan sebagai Creator"
//               description="Jika aktif, user ini akan memiliki akses sebagai creator/event organizer"
//               checked={form.values.is_creator === 1}
//               onChange={(event) => form.setFieldValue("is_creator", event.currentTarget.checked ? 1 : 0)}
//             />

//             {/* SECTION DATA CREATOR (hanya tampil jika is_creator = 1) */}
//             {form.values.is_creator === 1 && (
//               <>
//                 <Divider my="sm" />
//                 <Text fw={600} size="lg">
//                   Data Creator
//                 </Text>
//                 <Text size="sm" c="dimmed">
//                   Isi data berikut jika user ini juga berperan sebagai creator/event organizer
//                 </Text>

//                 <TextInput label="Nama Event Organizer" placeholder="Masukkan nama event organizer" {...form.getInputProps("name_event_organizer")} />

//                 <TextInput label="Lokasi" placeholder="Contoh: Jakarta" {...form.getInputProps("location")} />

//                 <TextInput label="Nomor Telepon Creator" placeholder="Contoh: 081234567890" {...form.getInputProps("phone_number")} />

//                 <TextInput label="Website" placeholder="Contoh: https://example.com" {...form.getInputProps("website")} />

//                 <Select
//                   label="Status Creator"
//                   data={[
//                     { value: "active", label: "Aktif" },
//                     { value: "inactive", label: "Nonaktif" },
//                   ]}
//                   required
//                   {...form.getInputProps("status")}
//                 />

//                 <Textarea label="Deskripsi Creator" placeholder="Masukkan deskripsi tentang creator" autosize minRows={2} {...form.getInputProps("description")} />

//                 <FileInput
//                   label="Logo/Gambar Creator"
//                   placeholder="Pilih file gambar"
//                   accept="image/*"
//                   onChange={(file) => form.setFieldValue("image", file)}
//                   clearable
//                   description={isEditMode && selectedUser?.image_url ? "Biarkan kosong untuk tetap menggunakan gambar saat ini" : ""}
//                 />
//               </>
//             )}

//             <Group justify="flex-end" mt="md">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   closeFormModal();
//                   form.reset();
//                 }}
//               >
//                 Batal
//               </Button>
//               <Button type="submit" color="blue" loading={loading.includes("submit")}>
//                 {isEditMode ? "Simpan Perubahan" : "Tambah User"}
//               </Button>
//             </Group>
//           </Stack>
//         </form>
//       </Modal>
//     </>
//   );
// }

import TableData from "@/components/TableData";
import { Pagination } from "@/types/model";
import fetch from "@/utils/fetch";
import { LoadingOverlay, Stack, Flex, Text, Image, Group, Avatar, Badge, Button, Modal, TextInput, Select, FileInput, Textarea, Switch, Divider } from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import moment from "moment";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";

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

  // Modal untuk form
  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<CreatorProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
    openFormModal();
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

    openFormModal();
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
              closeFormModal();
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
            closeFormModal();
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

  return (
    <>
      <Stack className="p-[20px] md:p-[30px]" gap={30}>
        <LoadingOverlay visible={loading.includes("getdata")} />

        {/* Header dengan tombol Tambah */}
        <Flex gap={10} justify="space-between" align="center">
          <Stack gap={5}>
            <Text size="1.8rem" fw={600}>
              Kelola User
            </Text>
            <Text size="sm" c="gray">
              Daftar semua user non-creator (is_creator = 0)
            </Text>
          </Stack>

          <Button onClick={handleAddClick} color="blue">
            + Tambah User
          </Button>
        </Flex>

        {/* TABEL DATA USER */}
        <TableData
          loading={loading.includes("getdata")}
          value={pagination}
          onChange={getData}
          data={data}
          mapData={(e: any) => {
            const userData = e as CreatorProps;

            return {
              created_at: userData.created_at ? moment(userData.created_at).format("DD MMM YYYY") : "-",
              user: (
                <Group gap="sm">
                  <Avatar color="blue" radius="sm" size="md">
                    {userData.has_user?.name?.charAt(0) || "?"}
                  </Avatar>
                  <Stack gap={2}>
                    <Text fw={500}>{userData.has_user?.name || "-"}</Text>
                    <Text size="xs" c="dimmed">
                      ID: {userData.user_id || "-"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {userData.has_user?.email || ""}
                    </Text>
                  </Stack>
                </Group>
              ),
              contact: <Stack gap={2}>{userData.has_user?.phone && <Text size="sm">{userData.has_user.phone}</Text>}</Stack>,
              status: (
                <Badge color={userData.status === "active" ? "green" : "gray"} variant="light" size="sm">
                  {userData.status === "active" ? "Aktif" : "Nonaktif"}
                </Badge>
              ),
              verification: (
                <Badge color={userData.is_verified === 1 ? "blue" : "orange"} variant="light" size="sm">
                  {userData.is_verified === 1 ? "Terverifikasi" : "Belum"}
                </Badge>
              ),
            };
          }}
          headerLabel={{
            created_at: "Tanggal Dibuat",
            user: "User",
            contact: "Kontak",
            status: "Status",
            verification: "Verifikasi",
          }}
          actionIcon={[
            {
              icon: "mdi:pencil",
              text: "Edit",
              onClick: (row) => handleEditClick(row),
            },
            {
              icon: "mdi:trash",
              text: "Hapus",
              onClick: (row) => handleDelete(row),
              color: "red",
            },
          ]}
        />
      </Stack>

      {/* MODAL FORM USER */}
      <Modal
        opened={formModalOpened}
        onClose={() => {
          closeFormModal();
          form.reset();
        }}
        title={isEditMode ? "Edit User" : "Tambah User Baru"}
        size="lg"
        centered
      >
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">
            {/* SECTION DATA USER */}
            <Text fw={600} size="lg">
              Data User
            </Text>

            <TextInput label="Nama Lengkap" placeholder="Contoh: John Doe" required {...form.getInputProps("name")} />

            <TextInput label="Email" placeholder="Contoh: user@example.com" required type="email" {...form.getInputProps("email")} />

            <TextInput label="Nomor Telepon" placeholder="Contoh: 081234567890" {...form.getInputProps("phone")} />

            <Select
              label="Status Verifikasi User"
              data={[
                { value: "1", label: "Terverifikasi" },
                { value: "0", label: "Belum Terverifikasi" },
              ]}
              value={form.values.verified_status_id?.toString()}
              onChange={(value) => form.setFieldValue("verified_status_id", parseInt(value || "1"))}
            />

            <Switch
              label="Jadikan sebagai Creator"
              description="Jika aktif, user ini akan memiliki akses sebagai creator/event organizer"
              checked={form.values.is_creator === 1}
              onChange={(event) => form.setFieldValue("is_creator", event.currentTarget.checked ? 1 : 0)}
            />

            {/* SECTION DATA CREATOR (hanya tampil jika is_creator = 1) */}
            {form.values.is_creator === 1 && (
              <>
                <Divider my="sm" />
                <Text fw={600} size="lg">
                  Data Creator
                </Text>
                <Text size="sm" c="dimmed">
                  Isi data berikut jika user ini juga berperan sebagai creator/event organizer
                </Text>

                <TextInput label="Nama Event Organizer" placeholder="Masukkan nama event organizer" {...form.getInputProps("name_event_organizer")} />

                <TextInput label="Lokasi" placeholder="Contoh: Jakarta" {...form.getInputProps("location")} />

                <TextInput label="Nomor Telepon Creator" placeholder="Contoh: 081234567890" {...form.getInputProps("phone_number")} />

                <TextInput label="Website" placeholder="Contoh: https://example.com" {...form.getInputProps("website")} />

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
              <Button type="submit" color="blue" loading={loading.includes("submit")}>
                {isEditMode ? "Simpan Perubahan" : "Tambah User"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}