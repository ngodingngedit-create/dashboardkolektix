import fetch from "@/utils/fetch";
import { LoadingOverlay, Stack, Flex, Text, Image, Group, Avatar, Badge, Button, TextInput, Select, FileInput, Box, Pagination, ActionIcon, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useListState, useDebouncedValue } from "@mantine/hooks";
import moment from "moment";
import { useEffect, useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const router = useRouter();
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

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({ key: "created_at", direction: "desc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

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
      name: (value) => (!value ? t("admin.creator.index.validation.nameRequired") : null),
      phone_number: (value) => (!value ? t("admin.creator.index.validation.phoneRequired") : null),
      email: (value) => (!value ? t("admin.creator.index.validation.emailRequired") : null),
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
              title: t("common.failed"),
              message: t("admin.creator.index.toast.fetchFailed"),
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
    if (!confirm(t("admin.creator.index.confirm.delete", { name: creatorData.name || "" }))) {
      return;
    }

    await fetch({
      url: `creator/${creatorData.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({
          title: t("common.success"),
          message: t("admin.creator.index.toast.deleted"),
          color: "green",
        });
        getData();
      },
      error: () => {
        notifications.show({
          title: t("common.failed"),
          message: t("admin.creator.index.toast.deleteFailed"),
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
          title: t("admin.creator.index.toast.imageProcessedTitle"),
          message: t("admin.creator.index.toast.imageProcessed"),
          color: "green",
          autoClose: 2000,
        });
      } catch (error) {
        console.error("Error converting image to base64:", error);
        notifications.show({
          title: t("common.failed"),
          message: t("admin.creator.index.toast.imageProcessFailed"),
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

    if (imageBase64) {
      payload.image = imageBase64;
    } else if (!isEditMode) {
      payload.image = null;
    }

    payload.name_event_organizer = values.name_event_organizer || "";
    payload.name = values.name;
    payload.location = values.location || "";
    payload.phone_number = values.phone_number;
    payload.email = values.email;
    payload.status = values.status;

    if (isEditMode && selectedCreator?.user_id) {
      payload.user_id = selectedCreator.user_id;
    }

    const url = isEditMode ? `creator/${selectedCreator?.id}` : "creator";
    const method = isEditMode ? "PUT" : "POST";

    await fetch({
      url,
      method,
      data: payload,
      before: () => setLoading.append("submit"),
      success: (response) => {
        notifications.show({
          title: t("common.success"),
          message: isEditMode ? t("admin.creator.index.toast.savedEdit") : t("admin.creator.index.toast.savedAdd"),
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
        if (error.response?.status === 422) {
          notifications.show({
            title: t("common.failed"),
            message: error.response.data.message || t("admin.creator.index.toast.processFailed"),
            color: "red",
          });
        } else {
          notifications.show({
            title: t("common.failed"),
            message: error.message || t("admin.creator.index.toast.saveFailed"),
            color: "red",
          });
        }
      },
      complete: () => setLoading.filter((e) => e !== "submit"),
    });
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          (item.email && item.email.toLowerCase().includes(needle)) ||
          (item.has_user?.name && item.has_user.name.toLowerCase().includes(needle))
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
        <Tooltip label={t("admin.creator.index.kembali")}>
          <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="xl">
            <Icon icon="ph:arrow-left-bold" width={20} />
          </ActionIcon>
        </Tooltip>
        <Stack gap={0}>
          <Text size="1.5rem" fw={600}>{isEditMode ? t("admin.creator.index.header.editCreator") : t("admin.creator.index.header.addCreator")}</Text>
          <Text size="xs" c="dimmed">{t("admin.creator.index.isi.form.di.bawah.untuk.mengelola.data.creator")}</Text>
        </Stack>
      </Flex>

      <form id="creator-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">
            {imagePreview && (
              <Stack gap={5}>
                <Text size="sm" fw={600}>{t("admin.creator.index.preview.gambar")}</Text>
                <Image src={imagePreview} w={120} h={120} radius="sm" fit="cover" alt={t("admin.creator.index.preview")} />
              </Stack>
            )}

            {!imagePreview && isEditMode && selectedCreator?.image_url && (
              <Stack gap={5}>
                <Text size="sm" fw={600}>{t("admin.creator.index.gambar.saat.ini")}</Text>
                <Image src={selectedCreator.image_url} w={120} h={120} radius="sm" fit="cover" alt={t("admin.creator.index.current")} />
              </Stack>
            )}

            <FileInput
              label={t("admin.creator.index.logo.gambar.opsional")}
              placeholder={t("admin.creator.index.pilih.file.gambar")}
              accept="image/*"
              onChange={handleFileChange}
              clearable
              variant="filled"
            />

            <TextInput label={t("admin.creator.index.nama.creator")} placeholder={t("admin.creator.index.contoh.gwenesbuk.records")} required {...form.getInputProps("name")} />
            <TextInput label={t("admin.creator.index.nama.event.organizer")} placeholder={t("admin.creator.index.masukkan.nama.event.organizer")} {...form.getInputProps("name_event_organizer")} />
            <TextInput label={t("admin.creator.index.lokasi")} placeholder={t("admin.creator.index.contoh.jakarta")} {...form.getInputProps("location")} />
            <TextInput label={t("admin.creator.index.nomor.telepon")} placeholder={t("admin.creator.index.contoh.081234567890")} required {...form.getInputProps("phone_number")} />
            <TextInput label={t("admin.creator.index.email")} placeholder={t("admin.creator.index.contoh.creator.example.com")} required type="email" {...form.getInputProps("email")} />
            <Select
              label={t("admin.creator.index.status")}
              data={[
                { value: "active", label: t("admin.creator.index.option.active") },
                { value: "inactive", label: t("admin.creator.index.option.inactive") },
              ]}
              required
              {...form.getInputProps("status")}
            />
          </Stack>
        </Box>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-[30px] py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)}>{t("admin.creator.index.batal")}</Button>
            <Button type="submit" form="creator-form" color="indigo" loading={loading.includes("submit")}>
              {isEditMode ? t("admin.creator.index.button.saveEdit") : t("admin.creator.index.button.saveAdd")}
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
        <Flex align="center" gap={12}>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label={t("admin.creator.index.kembali.ke.dashboard.admin")}
          >
            <Icon icon="ph:arrow-left-bold" className="text-lg" />
          </button>
          <Stack gap={2}>
            <Text size="1.8rem" fw={600} c="black">{t("admin.creator.index.kelola.creator")}</Text>
            <Text size="sm" c="black">{t("admin.creator.index.daftar.semua.creator.event.organizer")}</Text>
          </Stack>
        </Flex>
        <Button 
          onClick={handleAddClick} 
          leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
          color="indigo"
          radius="md"
        >
          {t("admin.creator.index.tambah.creator")}
        </Button>
      </Flex>

      <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <div style={{ width: 250 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>{t("admin.creator.index.pencarian")}</Text>
            <TextInput 
              placeholder={t("admin.creator.index.cari.creator")} 
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
                  { label: t("admin.creator.index.table.no"), sortable: false },
                  { label: t("admin.creator.index.table.createdAt"), sortable: true, key: "created_at" },
                  { label: t("admin.creator.index.table.logo"), sortable: false },
                  { label: t("admin.creator.index.table.creatorEo"), sortable: true, key: "name" },
                  { label: t("admin.creator.index.table.contactLocation"), sortable: false },
                  { label: t("admin.creator.index.table.userAccount"), sortable: false },
                  { label: t("admin.creator.index.table.status"), sortable: true, key: "status" },
                  { label: t("admin.creator.index.table.actions"), sortable: false },
                ].map((col, i) => (
                  <th 
                    key={i} 
                    onClick={() => col.sortable && requestSort(col.key!)} 
                    style={{ 
                      ...tableHeadStyle,
                      cursor: col.sortable ? "pointer" : "default",
                      position: col.label === t("admin.creator.index.table.actions") ? "sticky" : "static", 
                      right: col.label === t("admin.creator.index.table.actions") ? 0 : "auto", 
                      backgroundColor: col.label === t("admin.creator.index.table.actions") ? "#f8fafd" : "transparent", 
                      zIndex: col.label === t("admin.creator.index.table.actions") ? 10 : 1 
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
                  <td colSpan={8} style={{ padding: "60px", textAlign: "center" }}>
                    <Stack align="center" gap="xs">
                      <Icon icon="ph:users-three" className="text-5xl text-gray-300" />
                      <Text c="dimmed" fw={500}>{t("admin.creator.index.data.creator.tidak.ditemukan")}</Text>
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
                      {item.image_url ? (
                        <Image src={item.image_url} w={40} h={40} radius="sm" fit="cover" />
                      ) : (
                        <Avatar color="indigo" variant="light" radius="sm" size={40}>{item.name?.charAt(0) || "?"}</Avatar>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <Stack gap={0}>
                        <Text fw={600} size="sm" c="gray.8">{item.name || "-"}</Text>
                        {item.name_event_organizer && <Text size="xs" c="dimmed">{t("admin.creator.index.eo")} {item.name_event_organizer}</Text>}
                      </Stack>
                    </td>
                    <td style={tableCellStyle}>
                      <Stack gap={0}>
                        {item.phone_number && <Text size="xs" fw={500}>{item.phone_number}</Text>}
                        {item.email && <Text size="xs" c="dimmed">{item.email}</Text>}
                        {item.location && <Text size="xs" c="indigo.4">{item.location}</Text>}
                      </Stack>
                    </td>
                    <td style={tableCellStyle}>
                      <Stack gap={0}>
                        <Text size="xs" fw={600}>{item.has_user?.name || t("admin.creator.index.noUserAccount")}</Text>
                        <Text size="xs" c="dimmed">{item.has_user?.email || ""}</Text>
                      </Stack>
                    </td>
                    <td style={tableCellStyle}>
                      <Stack gap={4} align="flex-start">
                        <Badge color={item.status === "active" ? "teal" : "red"} variant="filled" size="xs" radius="xs">
                          {item.status === "active" ? t("admin.creator.index.badge.aktif") : t("admin.creator.index.badge.nonaktif")}
                        </Badge>
                        <Badge color={item.is_verified === 1 ? "indigo" : "gray"} variant="filled" size="xs" radius="xs">
                          {item.is_verified === 1 ? t("admin.creator.index.badge.verified") : t("admin.creator.index.badge.unverified")}
                        </Badge>
                      </Stack>
                    </td>
                    <td style={{ ...tableCellStyle, position: "sticky", right: 0, backgroundColor: "inherit", zIndex: 5, boxShadow: "-4px 0 8px rgba(0,0,0,0.02)" }}>
                      <Flex gap={6}>
                        <Tooltip label={t("admin.creator.index.edit.data")} withArrow>
                          <ActionIcon variant="filled" color="indigo" onClick={() => handleEditClick(item)} size="sm">
                            <Icon icon="ph:pencil-simple" className="text-lg" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t("admin.creator.index.hapus")} withArrow>
                          <ActionIcon variant="filled" color="red" onClick={() => handleDelete(item)} size="sm">
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
          <Pagination total={pagination.last_page} value={pagination.current_page} onChange={(page: number) => getData(`page=${page}`)} color="indigo" />
        </Flex>
      )}
    </Stack>
  );

  return <>{isFormVisible ? renderForm() : renderList()}</>;
}