import { useState, useEffect, useMemo } from "react";
import { LoadingOverlay, Stack, Flex, Text, Group, Badge, Button, Select, Checkbox, Grid, Divider, TextInput, NumberInput, Box, Pagination, ActionIcon, Tooltip } from "@mantine/core";
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

// Interface untuk data permission
interface PermissionProps {
  id: number;
  user_id: number;
  role_id: number;
  module_id: number;
  is_index: number;
  is_view: number;
  is_update: number | null;
  is_delete: number;
  is_download: number;
  is_import: number;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
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
  has_role: {
    id: number;
    name: string;
    description: string;
    status: string;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  has_module: {
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
  };
}

export default function KelolaPermission() {
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<PermissionProps[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);

  // State untuk form & tampilan
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({ key: "created_at", direction: "desc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  // Form state untuk permission
  const form = useForm({
    initialValues: {
      user_id: "",
      role_id: "",
      module_id: "",
      is_index: 0,
      is_view: 0,
      is_update: 0,
      is_delete: 0,
      is_download: 0,
      is_import: 0,
    },

    validate: {
      user_id: (value) => {
        if (!value) return "User ID harus diisi";
        if (isNaN(Number(value))) return "User ID harus berupa angka";
        return null;
      },
      role_id: (value) => (!value ? "Role harus dipilih" : null),
      module_id: (value) => (!value ? "Module harus dipilih" : null),
    },
  });

  useEffect(() => {
    getData();
    getRoles();
    getModules();
  }, []);

  const getData = async (params?: string) => {
    if (!loading.includes("getdata")) {
      try {
        await fetch<any, any>({
          url: "permissions" + (params ? `?${params}` : ""),
          method: "GET",
          data: {},
          before: () => setLoading.append("getdata"),
          success: (response) => {
            if (response && response.data) {
              let permissions: PermissionProps[] = [];
              if (Array.isArray(response.data.data)) permissions = response.data.data;
              else if (Array.isArray(response.data)) permissions = response.data;
              else if (response.data.items) permissions = response.data.items;
              else permissions = [response.data];

              setData(permissions);
              setPagination(response?.data || response);
            }
          },
          complete: () => setLoading.filter((e) => e !== "getdata"),
          error: (error) => {
            notifications.show({ title: "Gagal", message: "Gagal mengambil data permission", color: "red" });
          },
        });
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
  };

  const getRoles = async () => {
    try {
      await fetch({
        url: "role",
        method: "GET",
        data: {},
        before: () => setLoading.append("getroles"),
        success: (response) => {
          if (response && response.data) {
            const rolesData = Array.isArray(response.data.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
            setRoles(rolesData.map((role: any) => ({ value: role.id.toString(), label: role.name })));
          }
        },
        complete: () => setLoading.filter((e) => e !== "getroles"),
      });
    } catch (error) { console.error(error); }
  };

  const getModules = async () => {
    try {
      const response = await fetch({
        url: "modules",
        method: "GET",
        data: {},
        before: () => setLoading.append("getmodules"),
      });
      let modulesData = [];
      if (Array.isArray(response)) modulesData = response;
      else if (response && Array.isArray(response.data)) modulesData = response.data;
      else if (response && response.data && Array.isArray(response.data.data)) modulesData = response.data.data;

      if (modulesData.length > 0) {
        setModules(modulesData.map((module: any) => ({ value: module.id.toString(), label: module.module_name || module.name })));
      }
    } catch (error) { console.error(error); }
    finally { setLoading.filter((e) => e !== "getmodules"); }
  };

  const handleAddClick = () => {
    setSelectedPermission(null);
    setIsEditMode(false);
    form.reset();
    setIsFormVisible(true);
  };

  const handleEditClick = (permission: any) => {
    setSelectedPermission(permission);
    setIsEditMode(true);
    form.setValues({
      user_id: permission.user_id.toString(),
      role_id: permission.role_id.toString(),
      module_id: permission.module_id.toString(),
      is_index: permission.is_index || 0,
      is_view: permission.is_view || 0,
      is_update: permission.is_update || 0,
      is_delete: permission.is_delete || 0,
      is_download: permission.is_download || 0,
      is_import: permission.is_import || 0,
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (permission: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus permission ini?`)) return;
    await fetch({
      url: `permission/${permission.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({ title: "Berhasil", message: "Permission berhasil dihapus", color: "green" });
        getData();
      },
      error: (error) => notifications.show({ title: "Gagal", message: error.message || "Gagal menghapus", color: "red" }),
      complete: () => setLoading.filter((e) => e !== "delete"),
    });
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    const formData = {
      user_id: parseInt(values.user_id),
      role_id: parseInt(values.role_id),
      module_id: parseInt(values.module_id),
      is_index: values.is_index ? 1 : 0,
      is_view: values.is_view ? 1 : 0,
      is_update: values.is_update ? 1 : 0,
      is_delete: values.is_delete ? 1 : 0,
      is_download: values.is_download ? 1 : 0,
      is_import: values.is_import ? 1 : 0,
    };

    const url = isEditMode ? `permissions/${selectedPermission?.id}` : "permissions";
    const method = isEditMode ? "PUT" : "POST";

    await fetch({
      url,
      method,
      data: formData,
      before: () => setLoading.append("submit"),
      success: () => {
        notifications.show({ title: "Berhasil", message: `Permission berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`, color: "green" });
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
          (item.has_user?.name && item.has_user.name.toLowerCase().includes(needle)) ||
          (item.has_role?.name && item.has_role.name.toLowerCase().includes(needle)) ||
          (item.has_module?.module_name && item.has_module.module_name.toLowerCase().includes(needle))
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        let valA = a[sortConfig.key as string];
        let valB = b[sortConfig.key as string];
        if (sortConfig.key === "user") { valA = a.has_user?.name; valB = b.has_user?.name; }
        if (sortConfig.key === "role") { valA = a.has_role?.name; valB = b.has_role?.name; }
        if (sortConfig.key === "module") { valA = a.has_module?.module_name; valB = b.has_module?.module_name; }

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
          <Text size="1.5rem" fw={600}>{isEditMode ? "Edit Permission" : "Tambah Permission Baru"}</Text>
          <Text size="xs" c="dimmed">Kelola hak akses user ke modul tertentu</Text>
        </Stack>
      </Flex>

      <form id="permission-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <LoadingOverlay visible={loading.includes("submit")} />
          <Grid>
            <Grid.Col span={6}>
              <NumberInput label="User ID" placeholder="ID User" required min={1} {...form.getInputProps("user_id")} variant="filled" />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select label="Role" placeholder="Pilih role" data={roles} searchable required {...form.getInputProps("role_id")} variant="filled" />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select label="Module" placeholder="Pilih module" data={modules} searchable required {...form.getInputProps("module_id")} variant="filled" />
            </Grid.Col>
          </Grid>

          <Divider my="xl" label="Access Rights" labelPosition="center" />

          <Grid>
            {[
              { key: "is_index", label: "Index", icon: "ph:list-bullets" },
              { key: "is_view", label: "View", icon: "ph:eye" },
              { key: "is_update", label: "Update", icon: "ph:pencil-simple" },
              { key: "is_delete", label: "Delete", icon: "ph:trash" },
              { key: "is_download", label: "Download", icon: "ph:download-simple" },
              { key: "is_import", label: "Import", icon: "ph:upload-simple" },
            ].map((perm) => (
              <Grid.Col span={4} key={perm.key}>
                <Checkbox 
                  label={perm.label} 
                  checked={(form.values as any)[perm.key] === 1} 
                  onChange={(e) => form.setFieldValue(perm.key, e.currentTarget.checked ? 1 : 0)} 
                  styles={{ label: { fontWeight: 500 } }}
                />
              </Grid.Col>
            ))}
          </Grid>
        </Box>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-[30px] py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)}>Batal</Button>
            <Button type="submit" form="permission-form" color="indigo" loading={loading.includes("submit")}>
              {isEditMode ? "Simpan Perubahan" : "Simpan Permission"}
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
          <Text size="1.8rem" fw={600} c="black">Kelola Permission</Text>
          <Text size="sm" c="black">Daftar semua permission kustom per user</Text>
        </Stack>
        <Button 
          onClick={handleAddClick} 
          leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
          color="indigo"
          radius="md"
        >
          Tambah Permission
        </Button>
      </Flex>

      <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <div style={{ width: 250 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Pencarian</Text>
            <TextInput 
              placeholder="Cari user, role, module..." 
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
                  { label: "User", sortable: true, key: "user" },
                  { label: "Role", sortable: true, key: "role" },
                  { label: "Module", sortable: true, key: "module" },
                  { label: "Rights", sortable: false },
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
                      <Text c="dimmed" fw={500}>Data permission tidak ditemukan</Text>
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
                      <Stack gap={0}>
                        <Text fw={600} size="sm" c="gray.8">{item.has_user?.name || "Admin?"}</Text>
                        <Text size="xs" c="dimmed">{item.has_user?.email || "ID: "+item.user_id}</Text>
                      </Stack>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge color="indigo" variant="filled" size="xs" radius="xs">
                        {item.has_role?.name || "-"}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>
                      <Text fw={500} size="sm">{item.has_module?.module_name || "Module "+item.module_id}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Group gap={4}>
                        {item.is_index === 1 && <Badge size="xs" radius="xs" color="gray" variant="outline">IDX</Badge>}
                        {item.is_view === 1 && <Badge size="xs" radius="xs" color="teal" variant="light">VIEW</Badge>}
                        {item.is_update === 1 && <Badge size="xs" radius="xs" color="orange" variant="light">UPD</Badge>}
                        {item.is_delete === 1 && <Badge size="xs" radius="xs" color="red" variant="light">DEL</Badge>}
                        {item.is_download === 1 && <Badge size="xs" radius="xs" color="indigo" variant="light">DL</Badge>}
                      </Group>
                    </td>
                    <td style={{ ...tableCellStyle, position: "sticky", right: 0, backgroundColor: "inherit", zIndex: 5, boxShadow: "-4px 0 8px rgba(0,0,0,0.02)" }}>
                      <Flex gap={6}>
                        <Tooltip label="Edit Permission" withArrow>
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
