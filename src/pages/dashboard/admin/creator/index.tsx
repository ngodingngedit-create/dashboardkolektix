// import TableData from "@/components/TableData";
// import { Pagination } from "@/types/model";
// import fetch from "@/utils/fetch";
// import { LoadingOverlay, Stack, Flex, Text, Image, Group, Avatar, Badge, Button, Modal, TextInput, Select, FileInput, Textarea } from "@mantine/core";
// import { useDisclosure, useListState } from "@mantine/hooks";
// import moment from "moment";
// import { useEffect, useState } from "react";
// import { notifications } from "@mantine/notifications";
// import { useForm } from "@mantine/form";

// // Interface untuk data creator
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
//     is_creator: number;
//   };
// }

// // Fungsi untuk mengkonversi file ke base64 murni (tanpa data URL prefix)
// const convertFileToBase64 = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => {
//       const base64String = reader.result as string;
//       const pureBase64 = base64String.split(',')[1];
//       resolve(pureBase64 || base64String);
//     };
//     reader.onerror = (error) => reject(error);
//   });
// };

// // Fungsi untuk mengkonversi file ke base64 dengan format lengkap (data URL) untuk preview
// const convertFileToBase64DataURL = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result as string);
//     reader.onerror = (error) => reject(error);
//   });
// };

// export default function KelolaCreator() {
//   const [loading, setLoading] = useListState<string>();
//   const [data, setData] = useState<CreatorProps[]>([]);
//   const [pagination, setPagination] = useState<any>(null);

//   // Modal untuk form
//   const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
//   const [selectedCreator, setSelectedCreator] = useState<CreatorProps | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);

//   // State untuk preview gambar dan base64
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [imageBase64, setImageBase64] = useState<string | null>(null);

//   // Form state - SESUAI dengan payload yang berhasil di Postman
//   const form = useForm({
//     initialValues: {
//       name_event_organizer: "",
//       name: "",
//       location: "",
//       phone_number: "",
//       email: "",
//       user_id: "",
//       status: "active",
//       // Hapus description dan website sementara
//       // description: "",
//       // website: "",
//     },

//     validate: {
//       name: (value) => (!value ? "Nama creator harus diisi" : null),
//       phone_number: (value) => (!value ? "Nomor telepon harus diisi" : null),
//       email: (value) => (!value ? "Email harus diisi" : null),
//       user_id: (value) => (!value ? "User ID harus diisi" : null),
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

//             if (response && response.data) {
//               if (Array.isArray(response.data.data)) {
//                 setData(response.data.data);
//                 setPagination(response.data);
//               } else if (Array.isArray(response.data)) {
//                 setData(response.data);
//                 setPagination(response);
//               } else if (response.data.items) {
//                 setData(response.data.items);
//                 setPagination(response.data);
//               } else {
//                 setData(response.data);
//                 setPagination(response);
//               }
//             } else if (Array.isArray(response)) {
//               setData(response);
//             } else if (response && response.items) {
//               setData(response.items);
//               setPagination(response);
//             }
//           },
//           complete: () => setLoading.filter((e) => e !== "getdata"),
//           error: (error) => {
//             console.error("Error fetching data:", error);
//             notifications.show({
//               title: "Gagal",
//               message: "Gagal mengambil data creator",
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
//     setSelectedCreator(null);
//     setIsEditMode(false);
//     form.reset();
//     setImagePreview(null);
//     setImageBase64(null);
//     openFormModal();
//   };

//   const handleEditClick = (creator: any) => {
//     const creatorData = creator as CreatorProps;
//     setSelectedCreator(creatorData);
//     setIsEditMode(true);

//     if (creatorData.image_url) {
//       setImagePreview(creatorData.image_url);
//     }

//     setImageBase64(null);

//     form.setValues({
//       name_event_organizer: creatorData.name_event_organizer || "",
//       name: creatorData.name || "",
//       location: creatorData.location || "",
//       phone_number: creatorData.phone_number || "",
//       email: creatorData.email || "",
//       user_id: creatorData.user_id || "",
//       status: creatorData.status || "active",
//       // description: creatorData.description || "",
//       // website: creatorData.website || "",
//     });

//     openFormModal();
//   };

//   const handleDelete = async (creator: any) => {
//     const creatorData = creator as CreatorProps;
//     if (!confirm(`Apakah Anda yakin ingin menghapus creator "${creatorData.name}"?`)) {
//       return;
//     }

//     await fetch({
//       url: `creator/${creatorData.id}`,
//       method: "DELETE",
//       data: {},
//       before: () => setLoading.append("delete"),
//       success: () => {
//         notifications.show({
//           title: "Berhasil",
//           message: "Creator berhasil dihapus",
//           color: "green",
//         });
//         getData();
//       },
//       error: () => {
//         notifications.show({
//           title: "Gagal",
//           message: "Gagal menghapus creator",
//           color: "red",
//         });
//       },
//       complete: () => setLoading.filter((e) => e !== "delete"),
//     });
//   };

//   const handleFileChange = async (file: File | null) => {
//     if (file) {
//       try {
//         const base64String = await convertFileToBase64(file);
//         setImageBase64(base64String);

//         const base64DataURL = await convertFileToBase64DataURL(file);
//         setImagePreview(base64DataURL);

//         notifications.show({
//           title: "Gambar berhasil diproses",
//           message: "Gambar telah dikonversi ke base64",
//           color: "green",
//           autoClose: 2000,
//         });
//       } catch (error) {
//         console.error("Error converting image to base64:", error);
//         notifications.show({
//           title: "Gagal",
//           message: "Gagal memproses gambar",
//           color: "red",
//         });
//       }
//     } else {
//       setImageBase64(null);
//       setImagePreview(null);
//     }
//   };

//   const handleFormSubmit = async (values: typeof form.values) => {
//     // Payload SESUAI dengan yang berhasil di Postman
//     const payload: any = {
//       name_event_organizer: values.name_event_organizer || "",
//       name: values.name,
//       location: values.location || "",
//       phone_number: values.phone_number,
//       email: values.email,
//       user_id: parseInt(values.user_id) || 0, // Harus number
//       status: values.status,
//     };

//     // Tambahkan image jika ada (base64 murni)
//     if (imageBase64) {
//       payload.image = imageBase64;
//     }
//     // Untuk edit mode, jika tidak ada gambar baru, jangan kirim field image
//     // Untuk add mode, jika tidak ada gambar, biarkan tidak ada field image atau kirim null
//     else if (!isEditMode) {
//       // Untuk tambah data tanpa gambar
//       payload.image = null;
//     }

//     console.log("Payload yang akan dikirim:", JSON.stringify(payload, null, 2));

//     const url = isEditMode ? `creator/${selectedCreator?.id}` : "creator";
//     const method = isEditMode ? "PUT" : "POST";

//     await fetch({
//       url,
//       method,
//       data: payload, // Kirim sebagai OBJEK biasa
//       before: () => setLoading.append("submit"),
//       success: (response) => {
//         console.log("Response dari server:", response);
//         notifications.show({
//           title: "Berhasil",
//           message: `Creator berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`,
//           color: "green",
//         });
//         getData();
//         closeFormModal();
//         form.reset();
//         setImagePreview(null);
//         setImageBase64(null);
//       },
//       error: (error) => {
//         console.error("Error submitting form:", error);
//         console.error("Error details:", error.response || error.message);
//         notifications.show({
//           title: "Gagal",
//           message: error.message || `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} creator`,
//           color: "red",
//         });
//       },
//       complete: () => setLoading.filter((e) => e !== "submit"),
//     });
//   };

//   return (
//     <>
//       <Stack className="p-[20px] md:p-[30px]" gap={30}>
//         <LoadingOverlay visible={loading.includes("getdata")} />

//         <Flex gap={10} justify="space-between" align="center">
//           <Stack gap={5}>
//             <Text size="1.8rem" fw={600}>
//               Kelola Creator
//             </Text>
//             <Text size="sm" c="gray">
//               Daftar semua creator/event organizer
//             </Text>
//           </Stack>

//           <Button
//             onClick={handleAddClick}
//             color="blue"
//           >
//             + Tambah Creator
//           </Button>
//         </Flex>

//         <TableData
//           loading={loading.includes("getdata")}
//           value={pagination}
//           onChange={getData}
//           data={data}
//           mapData={(e: any) => {
//             const creator = e as CreatorProps;

//             return {
//               created_at: creator.created_at ? moment(creator.created_at).format("DD MMM YYYY") : "-",
//               image: creator.image_url ? (
//                 <Image src={creator.image_url} w={50} h={50} radius="sm" fit="cover" />
//               ) : (
//                 <Avatar color="blue" radius="sm" w={50} h={50}>
//                   {creator.name?.charAt(0) || "?"}
//                 </Avatar>
//               ),
//               name: (
//                 <Stack gap={2}>
//                   <Text fw={500}>{creator.name || "-"}</Text>
//                   {creator.name_event_organizer && (
//                     <Text size="xs" c="dimmed">
//                       EO: {creator.name_event_organizer}
//                     </Text>
//                   )}
//                 </Stack>
//               ),
//               contact: (
//                 <Stack gap={2}>
//                   {creator.phone_number && <Text size="sm">{creator.phone_number}</Text>}
//                   {creator.email && <Text size="xs" c="dimmed">{creator.email}</Text>}
//                   {creator.location && <Text size="xs" c="dimmed">{creator.location}</Text>}
//                 </Stack>
//               ),
//               user: (
//                 <Stack gap={2}>
//                   <Text size="sm" fw={500}>{creator.has_user?.name || creator.has_user?.email || "Tidak ada"}</Text>
//                   <Text size="xs" c="dimmed">{creator.has_user?.email || ""}</Text>
//                 </Stack>
//               ),
//               status: (
//                 <Badge 
//                   color={creator.status === "active" ? "green" : "red"} 
//                   variant="light" 
//                   size="sm"
//                 >
//                   {creator.status === "active" ? "Aktif" : creator.status || "Unknown"}
//                 </Badge>
//               ),
//               verification: (
//                 <Badge 
//                   color={creator.is_verified === 1 ? "blue" : "gray"} 
//                   variant="light" 
//                   size="sm"
//                 >
//                   {creator.is_verified === 1 ? "Terverifikasi" : "Belum"}
//                 </Badge>
//               ),
//             };
//           }}
//           headerLabel={{
//             created_at: "Tanggal Dibuat",
//             image: "Logo",
//             name: "Nama Creator",
//             contact: "Kontak & Lokasi",
//             user: "User Akun",
//             status: "Status",
//             verification: "Verifikasi",
//           }}
//           actionIcon={[
//             { 
//               icon: "mdi:pencil", 
//               text: "Edit", 
//               onClick: (row) => handleEditClick(row) 
//             },
//             { 
//               icon: "mdi:trash", 
//               text: "Hapus", 
//               onClick: (row) => handleDelete(row), 
//               color: "red" 
//             }
//           ]}
//         />
//       </Stack>

//       <Modal
//         opened={formModalOpened}
//         onClose={() => {
//           closeFormModal();
//           form.reset();
//           setImagePreview(null);
//           setImageBase64(null);
//         }}
//         title={isEditMode ? "Edit Creator" : "Tambah Creator Baru"}
//         size="lg"
//         centered
//       >
//         <form onSubmit={form.onSubmit(handleFormSubmit)}>
//           <LoadingOverlay visible={loading.includes("submit")} />
//           <Stack gap="md">
//             <TextInput
//               label="Nama Creator"
//               placeholder="Contoh: Gwenesbuk Records"
//               required
//               {...form.getInputProps("name")}
//             />

//             <TextInput
//               label="Nama Event Organizer"
//               placeholder="Masukkan nama event organizer"
//               {...form.getInputProps("name_event_organizer")}
//             />

//             <TextInput
//               label="Lokasi"
//               placeholder="Contoh: Jakarta"
//               {...form.getInputProps("location")}
//             />

//             <TextInput
//               label="Nomor Telepon"
//               placeholder="Contoh: 081234567890"
//               required
//               {...form.getInputProps("phone_number")}
//             />

//             <TextInput
//               label="Email"
//               placeholder="Contoh: creator@example.com"
//               required
//               type="email"
//               {...form.getInputProps("email")}
//             />

//             <TextInput
//               label="User ID"
//               placeholder="Masukkan ID user yang terkait"
//               required
//               type="number"
//               {...form.getInputProps("user_id")}
//             />

//             <Select
//               label="Status"
//               data={[
//                 { value: "active", label: "Aktif" },
//                 { value: "inactive", label: "Nonaktif" },
//               ]}
//               required
//               {...form.getInputProps("status")}
//             />

//             {/* Komentari dulu description dan website */}
//             {/* <Textarea
//               label="Deskripsi (Opsional)"
//               placeholder="Masukkan deskripsi tentang creator"
//               autosize
//               minRows={2}
//               {...form.getInputProps("description")}
//             />

//             <TextInput
//               label="Website (Opsional)"
//               placeholder="Contoh: https://example.com"
//               {...form.getInputProps("website")}
//             /> */}

//             {imagePreview && (
//               <Stack gap={5}>
//                 <Text size="sm" fw={500}>Preview Gambar</Text>
//                 <Image 
//                   src={imagePreview} 
//                   w={100} 
//                   h={100} 
//                   radius="sm" 
//                   fit="cover"
//                   alt="Preview"
//                 />
//               </Stack>
//             )}

//             {!imagePreview && isEditMode && selectedCreator?.image_url && (
//               <Stack gap={5}>
//                 <Text size="sm" fw={500}>Gambar Saat Ini</Text>
//                 <Image 
//                   src={selectedCreator.image_url} 
//                   w={100} 
//                   h={100} 
//                   radius="sm" 
//                   fit="cover"
//                   alt="Current"
//                 />
//               </Stack>
//             )}

//             <FileInput
//               label="Logo/Gambar (Opsional)"
//               placeholder="Pilih file gambar"
//               accept="image/*"
//               onChange={handleFileChange}
//               clearable
//               description={isEditMode && selectedCreator?.image_url ? 
//                 "Pilih gambar baru untuk mengubah, atau biarkan kosong untuk tetap menggunakan gambar saat ini" : 
//                 "Opsional, dapat diupload nanti"}
//             />

//             {imageBase64 && (
//               <Text size="xs" c="dimmed">
//                 Gambar berhasil dikonversi ke base64 ({Math.round(imageBase64.length / 1024)} KB)
//               </Text>
//             )}

//             <Group justify="flex-end" mt="md">
//               <Button 
//                 variant="outline" 
//                 onClick={() => {
//                   closeFormModal();
//                   form.reset();
//                   setImagePreview(null);
//                   setImageBase64(null);
//                 }}
//               >
//                 Batal
//               </Button>
//               <Button 
//                 type="submit" 
//                 color="blue" 
//                 loading={loading.includes("submit")}
//               >
//                 {isEditMode ? "Simpan Perubahan" : "Tambah Creator"}
//               </Button>
//             </Group>
//           </Stack>
//         </form>
//       </Modal>
//     </>
//   );
// }

import fetch from "@/utils/fetch";
import { LoadingOverlay, Stack, Flex, Text, Image, Group, Avatar, Badge, Button, TextInput, Select, FileInput, Card, Box, Pagination, ActionIcon, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useListState } from "@mantine/hooks";
import moment from "moment";
import { useEffect, useState, useMemo } from "react";
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

// Fungsi untuk mengkonversi file ke base64 dengan format Data URL lengkap
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

  // State untuk form & tampilan
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // State untuk preview gambar dan base64
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Form state - HAPUS user_id dari form values
  const form = useForm({
    initialValues: {
      name_event_organizer: "",
      name: "",
      location: "",
      phone_number: "",
      email: "",
      status: "active",
    },

    validate: {
      name: (value) => (!value ? "Nama creator harus diisi" : null),
      phone_number: (value) => (!value ? "Nomor telepon harus diisi" : null),
      email: (value) => (!value ? "Email harus diisi" : null),
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
    setIsFormVisible(true);
  };

  const handleEditClick = (creator: any) => {
    const creatorData = creator as CreatorProps;
    setSelectedCreator(creatorData);
    setIsEditMode(true);

    if (creatorData.image_url) {
      setImagePreview(creatorData.image_url);
    }

    setImageBase64(null);

    form.setValues({
      name_event_organizer: creatorData.name_event_organizer || "",
      name: creatorData.name || "",
      location: creatorData.location || "",
      phone_number: creatorData.phone_number || "",
      email: creatorData.email || "",
      status: creatorData.status || "active",
    });

    setIsFormVisible(true);
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

  const handleFileChange = async (file: File | null) => {
    if (file) {
      try {
        const base64DataURL = await convertFileToBase64DataURL(file);
        setImageBase64(base64DataURL);
        setImagePreview(base64DataURL);

        notifications.show({
          title: "Gambar berhasil diproses",
          message: "Gambar siap diupload",
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
      setImageBase64(null);
      setImagePreview(null);
    }
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    const payload: any = {};

    // Gunakan Data URL lengkap untuk image
    if (imageBase64) {
      payload.image = imageBase64;
    } else if (!isEditMode) {
      // Untuk tambah data tanpa gambar
      payload.image = null;
    }

    // ============ KUNCI UTAMA: TANPA USER_ID ============
    // Semua field kecuali user_id
    payload.name_event_organizer = values.name_event_organizer || "";
    payload.name = values.name;
    payload.location = values.location || "";
    payload.phone_number = values.phone_number;
    payload.email = values.email;
    payload.status = values.status;

    // TIDAK ADA user_id di payload!
    // Backend harus handle ini dengan salah satu cara:
    // 1. Membuat user baru otomatis berdasarkan email
    // 2. Membiarkan creator.user_id = null
    // 3. Auto-generate user dengan data minimal

    // Jika backend membutuhkan user_id tapi kita tidak punya,
    // kita bisa menambahkan fallback logic:
    if (isEditMode && selectedCreator?.user_id) {
      // Untuk edit, tetap pakai user_id yang sudah ada jika ada
      payload.user_id = selectedCreator.user_id;
    }
    // ====================================================

    console.log("Payload creator (TANPA user_id):", {
      ...payload,
      image: imageBase64 ? `${imageBase64.substring(0, 50)}...` : null,
      has_user_id: !!payload.user_id
    });

    const url = isEditMode ? `creator/${selectedCreator?.id}` : "creator";
    const method = isEditMode ? "PUT" : "POST";

    await fetch({
      url,
      method,
      data: payload,
      before: () => setLoading.append("submit"),
      success: (response) => {
        console.log("Response dari server:", response);
        notifications.show({
          title: "Berhasil",
          message: `Creator berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`,
          color: "green",
        });
        getData();
        setIsFormVisible(false);
        form.reset();
        setImagePreview(null);
        setImageBase64(null);
      },
      error: (error) => {
        console.error("Error submitting form:", error);

        // Jika error karena user_id required
        if (error.response?.status === 422) {
          const errors = error.response.data.errors || {};
          if (errors.user_id) {
            notifications.show({
              title: "Perhatian",
              message: "Backend membutuhkan user_id. Mungkin perlu menyesuaikan endpoint atau hubungi developer backend.",
              color: "yellow",
            });
          } else {
            notifications.show({
              title: "Gagal",
              message: error.response.data.message || `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} creator`,
              color: "red",
            });
          }
        } else {
          notifications.show({
            title: "Gagal",
            message: error.message || `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} creator`,
            color: "red",
          });
        }
      },
      complete: () => setLoading.filter((e) => e !== "submit"),
    });
  };

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.has_user?.name && item.has_user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        const valA = (a[sortConfig.key as string] || "").toString().toLowerCase();
        const valB = (b[sortConfig.key as string] || "").toString().toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchQuery, sortConfig]);

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
          <Text size="1.5rem" fw={600}>{isEditMode ? "Edit Creator" : "Tambah Creator Baru"}</Text>
          <Text size="xs" c="dimmed">Isi form di bawah untuk mengelola data Creator</Text>
        </Stack>
      </Flex>

      <form id="creator-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">

            {/* Preview gambar (form is now part of renderForm and all field logic starts here) */}
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
                Gambar siap diupload ({Math.round(imageBase64.length / 1024)} KB)
              </Text>
            )}

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

            <Select
              label="Status"
              data={[
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
              ]}
              required
              {...form.getInputProps("status")}
            />

          </Stack>
        </Card>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-[30px] py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)}>
              Batal
            </Button>
            <Button type="submit" form="creator-form" color="blue" loading={loading.includes("submit")}>
              {isEditMode ? "Simpan Perubahan" : "Simpan Creator"}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  const renderList = () => (
    <Stack className="p-[20px] md:p-[30px]" gap={30}>
      <LoadingOverlay visible={loading.includes("getdata")} />

      <Flex gap={10} justify="space-between" align="center">
        <Stack gap={5}>
          <Text size="1.8rem" fw={600}>Kelola Creator</Text>
          <Text size="sm" c="gray">Daftar semua creator/event organizer</Text>
        </Stack>
        <Button onClick={handleAddClick} color="blue">+ Tambah Creator</Button>
      </Flex>

      <Card withBorder p={0} radius="md" style={{ overflow: "hidden" }}>
        <Flex justify="space-between" align="center" p="md" style={{ borderBottom: "1px solid #f1f3f5" }}>
          <Text fw={600}>Daftar Creator</Text>
          <Flex gap={10} align="center">
            <Tooltip label="Refresh Data">
              <ActionIcon variant="filled" color="blue" size="lg" onClick={() => getData()} loading={loading.includes("getdata")}>
                <Icon icon="mdi:refresh" width={20} />
              </ActionIcon>
            </Tooltip>
            <TextInput placeholder="Cari creator..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: 250 }} />
          </Flex>
        </Flex>

        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                {[
                  { label: "Tanggal", sortable: true, key: "created_at" },
                  { label: "Logo", sortable: false },
                  { label: "Creator & EO", sortable: true, key: "name" },
                  { label: "Kontak & Lokasi", sortable: false },
                  { label: "User Akun", sortable: false },
                  { label: "Status", sortable: true, key: "status" },
                  { label: "Aksi", sortable: false },
                ].map((col, i) => (
                  <th key={i} onClick={() => col.sortable && requestSort(col.key!)} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#495057", textTransform: "uppercase", cursor: col.sortable ? "pointer" : "default", position: col.label === "Aksi" ? "sticky" : "static", right: col.label === "Aksi" ? 0 : "auto", backgroundColor: col.label === "Aksi" ? "#f8f9fa" : "transparent", zIndex: col.label === "Aksi" ? 10 : 1 }}>
                    <Flex align="center" gap={4}>
                      {col.label}
                      {col.sortable && (
                        sortConfig.key === col.key ? (sortConfig.direction === "asc" ? "↑" : "↓") : <span style={{ opacity: 0.3 }}>↑</span>
                      )}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center" }}><Text c="dimmed">Data tidak ditemukan</Text></td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f3f5" }}>
                    <td style={{ padding: "12px 16px" }}><Text size="sm">{item.created_at ? moment(item.created_at).format("DD MMM YYYY") : "-"}</Text></td>
                    <td style={{ padding: "12px 16px" }}>
                      {item.image_url ? (
                        <Image src={item.image_url} w={45} h={45} radius="sm" fit="cover" />
                      ) : (
                        <Avatar color="blue" radius="sm" size={45}>{item.name?.charAt(0) || "?"}</Avatar>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Stack gap={2}>
                        <Text fw={500} size="sm">{item.name || "-"}</Text>
                        {item.name_event_organizer && <Text size="xs" c="dimmed">EO: {item.name_event_organizer}</Text>}
                      </Stack>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Stack gap={2}>
                        {item.phone_number && <Text size="sm">{item.phone_number}</Text>}
                        {item.email && <Text size="xs" c="dimmed">{item.email}</Text>}
                        {item.location && <Text size="xs" c="dimmed">{item.location}</Text>}
                      </Stack>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>{item.has_user?.name || item.has_user?.email || "Tidak ada user"}</Text>
                        <Text size="xs" c="dimmed">{item.has_user?.email || ""}</Text>
                      </Stack>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Stack gap={4} align="flex-start">
                        <Badge color={item.status === "active" ? "green" : "red"} variant="light" size="sm">
                          {item.status === "active" ? "Aktif" : item.status || "Unknown"}
                        </Badge>
                        <Badge color={item.is_verified === 1 ? "blue" : "gray"} variant="light" size="xs">
                          {item.is_verified === 1 ? "Terverifikasi" : "Belum Verifikasi"}
                        </Badge>
                      </Stack>
                    </td>
                    <td style={{ padding: "12px 16px", position: "sticky", right: 0, backgroundColor: "#fff", zIndex: 5, boxShadow: "-2px 0 5px rgba(0,0,0,0.02)" }}>
                      <Flex gap={8}>
                        <Tooltip label="Edit">
                          <ActionIcon variant="filled" color="blue" onClick={() => handleEditClick(item)}>
                            <Icon icon="mdi:pencil-outline" width={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus">
                          <ActionIcon variant="filled" color="red" onClick={() => handleDelete(item)}>
                            <Icon icon="mdi:trash-can-outline" width={16} />
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
      </Card>

      {pagination && pagination.last_page > 1 && (
        <Flex justify="center" mt="md">
          <Pagination total={pagination.last_page} value={pagination.current_page} onChange={(page: number) => getData(`page=${page}`)} color="blue" />
        </Flex>
      )}
    </Stack>
  );

  return <>{isFormVisible ? renderForm() : renderList()}</>;
}