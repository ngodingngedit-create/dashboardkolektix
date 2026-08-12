import { useState, useEffect, useMemo } from "react";
import { LoadingOverlay, Stack, Flex, Text, Group, Badge, Button, Grid, Divider, TextInput, Box, Pagination, ActionIcon, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useListState, useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import moment from "moment";
import fetch from "@/utils/fetch";

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

// Interface untuk data module
interface ModuleProps {
  id: number;
  module_name: string;
  module_description: string | null;
  module_link: string | null;
  is_backoffice: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export default function KelolaModule() {
  const router = useRouter();
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<ModuleProps[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  // State untuk form & tampilan
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({ key: "created_at", direction: "desc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  // Form state untuk module
  const form = useForm({
    initialValues: {
      module_name: "",
      module_description: "",
      module_link: "",
    },

    validate: {
      module_name: (value) => (!value ? "Nama module harus diisi" : null),
    },
  });

  // Authentication check dengan bearer token
  useEffect(() => {
    const token = Cookies.get("token");
    const userDataStr = Cookies.get("user_data");

    // Cek apakah bearer token ada
    if (!token) {
      notifications.show({
        title: "Unauthorized",
        message: "Bearer token tidak ditemukan. Silakan login kembali.",
        color: "red",
      });
      router.push("/login");
      return;
    }

    // Cek apakah user adalah admin
    let userData = null;
    try {
      userData = userDataStr ? JSON.parse(userDataStr) : null;
    } catch (e) {
      console.error("Error parsing user_data:", e);
    }

    if (!userData || userData.role !== "Admin") {
      notifications.show({
        title: "Access Denied",
        message: "Anda tidak memiliki akses ke halaman ini. Hanya Admin yang diperbolehkan.",
        color: "red",
      });
      router.push("/dashboard");
      return;
    }
  }, [router]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async (params?: string) => {
    if (!loading.includes("getdata")) {
      try {
        await fetch<any, any>({
          url: "modules" + (params ? `?${params}` : ""),
          method: "GET",
          data: {},
          before: () => setLoading.append("getdata"),
          success: (response) => {
            console.log("API Response:", response);
            let modules: ModuleProps[] = [];
            
            // Handle berbagai format response
            if (Array.isArray(response)) {
              // Response langsung berupa array
              modules = response;
            } else if (response && Array.isArray(response.data)) {
              // Response.data berupa array
              modules = response.data;
            } else if (response && response.data && Array.isArray(response.data.data)) {
              // Response.data.data berupa array
              modules = response.data.data;
            } else if (response && response.data && response.data.items) {
              modules = response.data.items;
            } else if (response && response.data) {
              // Single object
              modules = [response.data];
            }

            console.log("Parsed modules:", modules);
            setData(modules);
            setPagination(response?.data || response);
          },
          complete: () => setLoading.filter((e) => e !== "getdata"),
          error: (error) => {
            console.error("Error fetching modules:", error);
            notifications.show({ title: "Gagal", message: "Gagal mengambil data module", color: "red" });
          },
        });
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
  };

  const handleAddClick = () => {
    setSelectedModule(null);
    setIsEditMode(false);
    form.reset();
    setIsFormVisible(true);
  };

  const handleEditClick = (module: ModuleProps) => {
    setSelectedModule(module);
    setIsEditMode(true);
    form.setValues({
      module_name: module.module_name || "",
      module_description: module.module_description || "",
      module_link: module.module_link || "",
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (module: ModuleProps) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus module "${module.module_name}"?`)) return;
    await fetch({
      url: `modules/${module.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({ title: "Berhasil", message: "Module berhasil dihapus", color: "green" });
        getData();
      },
      error: (error) => notifications.show({ title: "Gagal", message: error.message || "Gagal menghapus", color: "red" }),
      complete: () => setLoading.filter((e) => e !== "delete"),
    });
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    const formData = {
      module_name: values.module_name,
      module_description: values.module_description || null,
      module_link: values.module_link || null,
    };

    const url = isEditMode ? `modules/${selectedModule?.id}` : "modules";
    const method = isEditMode ? "PUT" : "POST";

    await fetch({
      url,
      method,
      data: formData,
      before: () => setLoading.append("submit"),
      success: () => {
        notifications.show({ title: "Berhasil", message: `Module berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`, color: "green" });
        getData();
        setIsFormVisible(false);
        form.reset();
      },
      error: (error) => notifications.show({ title: "Gagal", message: error.message || "Gagal menyimpan", color: "red" }),
      complete: () => setLoading.filter((e) => e !== "submit"),
    });
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (item) =>
          (item.module_name && item.module_name.toLowerCase().includes(needle)) ||
          (item.module_description && item.module_description.toLowerCase().includes(needle)) ||
          (item.module_link && item.module_link.toLowerCase().includes(needle))
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        let valA = a[sortConfig.key as string];
        let valB = b[sortConfig.key as string];

        valA = (valA || "").toString().toLowerCase();
        valB = (valB || "").toString().toLowerCase();
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
            <Icon icon="ph:arrow-left-bold" width={20} />
          </ActionIcon>
        </Tooltip>
        <Stack gap={0}>
          <Text size="1.5rem" fw={600}>{isEditMode ? "Edit Module" : "Tambah Module Baru"}</Text>
          <Text size="xs" c="dimmed">Kelola data module sistem</Text>
        </Stack>
      </Flex>

      <form id="module-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <LoadingOverlay visible={loading.includes("submit")} />
          <Grid>
            <Grid.Col span={12}>
              <TextInput 
                label="Nama Module" 
                placeholder="Masukkan nama module" 
                required 
                {...form.getInputProps("module_name")} 
                variant="filled" 
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput 
                label="Deskripsi Module" 
                placeholder="Masukkan deskripsi module (opsional)" 
                {...form.getInputProps("module_description")} 
                variant="filled" 
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput 
                label="Link Module" 
                placeholder="Masukkan link module (opsional)" 
                {...form.getInputProps("module_link")} 
                variant="filled" 
              />
            </Grid.Col>
          </Grid>
        </Box>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-[30px] py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)}>Batal</Button>
            <Button type="submit" form="module-form" color="indigo" loading={loading.includes("submit")}>
              {isEditMode ? "Simpan Perubahan" : "Simpan Module"}
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
          <Text size="1.8rem" fw={600} c="black">Kelola Module</Text>
          <Text size="sm" c="black">Daftar semua module dalam sistem</Text>
        </Stack>
        <Button 
          onClick={handleAddClick} 
          leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
          color="indigo"
          radius="md"
        >
          Tambah Module
        </Button>
      </Flex>

      <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <div style={{ width: 250 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Pencarian</Text>
            <TextInput 
              placeholder="Cari nama module..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              leftSection={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
            />
          </div>
        </Flex>

        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafd", borderBottom: "1px solid #eee" }}>
                {[
                  { label: "No", sortable: false },
                  { label: "Nama Module", sortable: true, key: "module_name" },
                  { label: "Deskripsi", sortable: true, key: "module_description" },
                  { label: "Link", sortable: true, key: "module_link" },
                  { label: "Dibuat", sortable: true, key: "created_at" },
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
                  <td colSpan={6} style={{ padding: "60px", textAlign: "center" }}>
                    <Stack align="center" gap="xs">
                      <Icon icon="ph:shield-slash" className="text-5xl text-gray-300" />
                      <Text c="dimmed" fw={500}>Data module tidak ditemukan</Text>
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
                      <Text fw={600} size="sm" c="gray.8">{item.module_name}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm" c="dimmed">{item.module_description || "-"}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm" c="dimmed">{item.module_link || "-"}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="xs" c="dimmed">
                        {item.created_at ? moment(item.created_at).format("DD MMM YYYY HH:mm") : "-"}
                      </Text>
                    </td>
                    <td style={{ ...tableCellStyle, position: "sticky", right: 0, backgroundColor: "inherit", zIndex: 5, boxShadow: "-4px 0 8px rgba(0,0,0,0.02)" }}>
                      <Flex gap={6}>
                        <Tooltip label="Edit Module" withArrow>
                          <ActionIcon variant="filled" color="indigo" onClick={() => handleEditClick(item)} size="sm">
                            <Icon icon="ph:pencil-simple" className="text-lg" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus" withArrow>
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
