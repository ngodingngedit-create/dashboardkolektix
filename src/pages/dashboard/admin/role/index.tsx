import { useState, useEffect, useMemo } from "react";
import { LoadingOverlay, Stack, Flex, Text, Group, Badge, Button, TextInput, Select, Textarea, Box, Pagination, ActionIcon, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useListState, useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
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

// Interface untuk data role
interface RoleProps {
  id: number;
  name: string;
  description: string;
  status: string;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function KelolaRole() {
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<RoleProps[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  // State untuk form & tampilan
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({ key: "id", direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  // Form state untuk role
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      status: "active",
    },

    validate: {
      name: (value) => (!value ? "Nama role harus diisi" : null),
      description: (value) => (!value ? "Deskripsi role harus diisi" : null),
    },
  });

  useEffect(() => {
    getData();
  }, []);

  const getData = async (params?: string) => {
    if (!loading.includes("getdata")) {
      try {
        await fetch<any, any>({
          url: "role" + (params ? `?${params}` : ""),
          method: "GET",
          data: {},
          before: () => setLoading.append("getdata"),
          success: (response) => {
            if (response && response.data) {
              let roles: RoleProps[] = [];
              if (Array.isArray(response.data.data)) roles = response.data.data;
              else if (Array.isArray(response.data)) roles = response.data;
              else if (response.data.items) roles = response.data.items;
              else roles = [response.data];

              setData(roles);
              setPagination(response?.data || response);
            }
          },
          complete: () => setLoading.filter((e) => e !== "getdata"),
          error: (error) => notifications.show({ title: "Gagal", message: "Gagal mengambil data role", color: "red" }),
        });
      } catch (error) { console.error(error); }
    }
  };

  const handleAddClick = () => {
    setSelectedRole(null);
    setIsEditMode(false);
    form.reset();
    setIsFormVisible(true);
  };

  const handleEditClick = (role: any) => {
    setSelectedRole(role);
    setIsEditMode(true);
    form.setValues({
      name: role.name || "",
      description: role.description || "",
      status: role.status || "active",
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (role: any) => {
    if (role.id <= 4) {
      notifications.show({ title: "Tidak Dapat Dihapus", message: "Role default tidak dapat dihapus", color: "yellow" });
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"?`)) return;
    await fetch({
      url: `role/${role.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({ title: "Berhasil", message: "Role berhasil dihapus", color: "green" });
        getData();
      },
      error: () => notifications.show({ title: "Gagal", message: "Gagal menghapus role", color: "red" }),
      complete: () => setLoading.filter((e) => e !== "delete"),
    });
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    const url = isEditMode ? `role/${selectedRole?.id}` : "role";
    const method = isEditMode ? "PUT" : "POST";
    await fetch({
      url,
      method,
      data: values,
      before: () => setLoading.append("submit"),
      success: () => {
        notifications.show({ title: "Berhasil", message: `Role berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`, color: "green" });
        getData();
        setIsFormVisible(false);
        form.reset();
      },
      error: (error) => notifications.show({ title: "Gagal", message: error.message || "Gagal menyimpan role", color: "red" }),
      complete: () => setLoading.filter((e) => e !== "submit"),
    });
  };

  // Hitung statistik
  const stats = {
    total: data.length,
    active: data.filter(r => r.status === "active").length,
    inactive: data.filter(r => r.status === "inactive").length,
    default: data.filter(r => r.id <= 4).length,
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          (item.description && item.description.toLowerCase().includes(needle))
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
        <Tooltip label="Kembali">
          <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="xl">
            <Icon icon="ph:arrow-left-bold" width={20} />
          </ActionIcon>
        </Tooltip>
        <Stack gap={0}>
          <Text size="1.5rem" fw={600}>{isEditMode ? "Edit Role" : "Tambah Role Baru"}</Text>
          <Text size="xs" c="dimmed">Konfigurasi hak akses dan peran user</Text>
        </Stack>
      </Flex>

      <form id="role-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">
            <TextInput label="Nama Role" placeholder="Contoh: Admin, Staff, User" required {...form.getInputProps("name")} variant="filled" />
            <Textarea label="Deskripsi" placeholder="Masukkan deskripsi role" required autosize minRows={3} {...form.getInputProps("description")} variant="filled" />
            <Select
              label="Status"
              placeholder="Pilih status"
              data={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              required
              {...form.getInputProps("status")}
              variant="filled"
            />
          </Stack>
        </Box>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-[30px] py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)}>Batal</Button>
            <Button type="submit" form="role-form" color="indigo" loading={loading.includes("submit")}>
              {isEditMode ? "Simpan Perubahan" : "Simpan Role"}
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
          <Text size="1.8rem" fw={600} c="black">Kelola Role</Text>
          <Text size="sm" c="black">Daftar semua tingkatan akses sistem</Text>
        </Stack>
        <Button 
          onClick={handleAddClick} 
          leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
          color="indigo"
          radius="md"
        >
          Tambah Role
        </Button>
      </Flex>

      <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <div style={{ width: 250 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Pencarian</Text>
            <TextInput 
              placeholder="Cari role..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              leftSection={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
            />
          </div>
        </Flex>

        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafd", borderBottom: "1px solid #eee" }}>
                {[
                  { label: "ID", sortable: true, key: "id" },
                  { label: "Role", sortable: true, key: "name" },
                  { label: "Deskripsi", sortable: false },
                  { label: "Status", sortable: true, key: "status" },
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
                  <td colSpan={5} style={{ padding: "60px", textAlign: "center" }}>
                    <Stack align="center" gap="xs">
                      <Icon icon="ph:identification-card-slash" className="text-5xl text-gray-300" />
                      <Text c="dimmed" fw={500}>Data role tidak ditemukan</Text>
                    </Stack>
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any, idx: number) => (
                  <tr 
                    key={idx} 
                    style={{ borderBottom: "1px solid #f1f3f5", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafd")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={tableCellStyle}><Text size="xs" fw={700} c="indigo">#{item.id}</Text></td>
                    <td style={tableCellStyle}><Text size="sm" fw={600} c="gray.8">{item.name}</Text></td>
                    <td style={tableCellStyle}><Text size="xs" c="dimmed" lineClamp={2}>{item.description}</Text></td>
                    <td style={tableCellStyle}>
                      <Badge color={item.status === "active" ? "teal" : "red"} variant="filled" size="xs" radius="xs">
                        {item.status === "active" ? "AKTIF" : "NONAKTIF"}
                      </Badge>
                    </td>
                    <td style={{ ...tableCellStyle, position: "sticky", right: 0, backgroundColor: "inherit", zIndex: 5, boxShadow: "-4px 0 8px rgba(0,0,0,0.02)" }}>
                      <Flex gap={6}>
                        <Tooltip label="Edit Role" withArrow>
                          <ActionIcon variant="filled" color="indigo" onClick={() => handleEditClick(item)} size="sm">
                            <Icon icon="ph:pencil-simple" className="text-lg" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus" withArrow>
                          <ActionIcon variant="filled" color="red" onClick={() => handleDelete(item)} size="sm" disabled={item.id <= 4}>
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