// festaqingkolektiv/src/pages/dashboard/admin/role/index.tsx
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
  Card,
  Box,
  Pagination,
  ActionIcon,
  Tooltip
} from "@mantine/core";
import { Icon } from "@iconify/react";
import { useDisclosure, useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import moment from "moment";
import TableData from "@/components/TableData";
import fetch from "@/utils/fetch";

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
            console.log("API Response:", response);

            if (response && response.data) {
              let roles: RoleProps[] = [];

              if (Array.isArray(response.data.data)) {
                roles = response.data.data;
              } else if (Array.isArray(response.data)) {
                roles = response.data;
              } else if (response.data.items) {
                roles = response.data.items;
              } else {
                roles = [response.data];
              }

              setData(roles);
              setPagination(response?.data || response);
            }
          },
          complete: () => setLoading.filter((e) => e !== "getdata"),
          error: (error) => {
            console.error("Error fetching data:", error);
            notifications.show({
              title: "Gagal",
              message: "Gagal mengambil data role",
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
    setSelectedRole(null);
    setIsEditMode(false);
    form.reset();
    setIsFormVisible(true);
  };

  const handleEditClick = (rowData: any) => {
    // rowData sudah berupa RoleProps karena di-map oleh mapData
    const role = rowData as RoleProps;
    setSelectedRole(role);
    setIsEditMode(true);

    form.setValues({
      name: role.name || "",
      description: role.description || "",
      status: role.status || "active",
    });

    setIsFormVisible(true);
  };

  const handleDelete = async (rowData: any) => {
    // rowData sudah berupa RoleProps karena di-map oleh mapData
    const role = rowData as RoleProps;

    if (role.id <= 4) {
      notifications.show({
        title: "Tidak Dapat Dihapus",
        message: "Role default (ID 1-4) tidak dapat dihapus",
        color: "yellow",
      });
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"?`)) {
      return;
    }

    await fetch({
      url: `role/${role.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({
          title: "Berhasil",
          message: "Role berhasil dihapus",
          color: "green",
        });
        getData();
      },
      error: () => {
        notifications.show({
          title: "Gagal",
          message: "Gagal menghapus role",
          color: "red",
        });
      },
      complete: () => setLoading.filter((e) => e !== "delete"),
    });
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    if (isEditMode && selectedRole) {
      // UPDATE ROLE
      await fetch({
        url: `role/${selectedRole.id}`,
        method: "PUT",
        data: values,
        before: () => setLoading.append("submit"),
        success: () => {
          notifications.show({
            title: "Berhasil",
            message: "Role berhasil diperbarui",
            color: "green",
          });
          getData();
          setIsFormVisible(false);
          form.reset();
        },
        error: (error) => {
          notifications.show({
            title: "Gagal",
            message: error.message || "Gagal memperbarui role",
            color: "red",
          });
        },
        complete: () => setLoading.filter((e) => e !== "submit"),
      });
    } else {
      // TAMBAH ROLE BARU
      await fetch({
        url: "role",
        method: "POST",
        data: values,
        before: () => setLoading.append("submit"),
        success: () => {
          notifications.show({
            title: "Berhasil",
            message: "Role berhasil ditambahkan",
            color: "green",
          });
          getData();
          setIsFormVisible(false);
          form.reset();
        },
        error: (error) => {
          notifications.show({
            title: "Gagal",
            message: error.message || "Gagal menambahkan role",
            color: "red",
          });
        },
        complete: () => setLoading.filter((e) => e !== "submit"),
      });
    }
  };

  // Hitung statistik
  const stats = {
    total: data.length,
    active: data.filter(r => r.status === "active").length,
    inactive: data.filter(r => r.status === "inactive").length,
    default: data.filter(r => r.id <= 4).length,
  };

  // Function untuk memetakan data ke format table
  const mapData = (role: any) => {
    const roleData = role as RoleProps;
    return {
      id: roleData.id,
      name: roleData.name,
      description: (
        <Text size="sm" lineClamp={2}>
          {roleData.description}
        </Text>
      ),
      status: (
        <Badge
          color={roleData.status === "active" ? "green" : "red"}
          variant="light"
          size="sm"
        >
          {roleData.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
      created_at: roleData.created_at ? moment(roleData.created_at).format("DD MMM YYYY HH:mm") : "-",
      updated_at: roleData.updated_at ? moment(roleData.updated_at).format("DD MMM YYYY HH:mm") : "-",
    };
  };

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return "mdi:sort";
    return sortConfig.direction === "asc" ? "mdi:sort-ascending" : "mdi:sort-descending";
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
          <Text size="1.5rem" fw={600}>{isEditMode ? "Edit Role" : "Tambah Role Baru"}</Text>
          <Text size="xs" c="dimmed">Isi form di bawah untuk {isEditMode ? "memperbarui" : "menambahkan"} role</Text>
        </Stack>
      </Flex>

      <form id="role-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">
            <TextInput
              label="Nama Role"
              placeholder="Contoh: Admin, Staff, User"
              required
              {...form.getInputProps("name")}
            />

            <Textarea
              label="Deskripsi"
              placeholder="Masukkan deskripsi role"
              required
              autosize
              minRows={3}
              {...form.getInputProps("description")}
            />

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
          </Stack>
        </Card>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-[30px] py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)}>
              Batal
            </Button>
            <Button type="submit" form="role-form" color="blue" loading={loading.includes("submit")}>
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

      {/* Header dengan tombol Tambah */}
      <Flex gap={10} justify="space-between" align="center">
        <Stack gap={5}>
          <Text size="1.8rem" fw={600}>
            Kelola Role
          </Text>
          <Text size="sm" c="gray">
            Daftar semua role yang tersedia di sistem
          </Text>
        </Stack>

        <Button onClick={() => { handleAddClick(); setIsFormVisible(true); }} color="blue">
          + Tambah Role
        </Button>
      </Flex>

      <Group grow gap="md">
        <Stack p="md" style={{ borderRadius: "8px", border: "1px solid #e0e0e0", backgroundColor: "#f8f9fa" }} gap={5}>
          <Text size="sm" c="gray">Total Role</Text>
          <Text size="1.5rem" fw={600}>{stats.total}</Text>
        </Stack>
        <Stack p="md" style={{ borderRadius: "8px", border: "1px solid #d1fae5", backgroundColor: "#f0fdf4" }} gap={5}>
          <Text size="sm" c="green">Active</Text>
          <Text size="1.5rem" fw={600} c="green">{stats.active}</Text>
        </Stack>
        <Stack p="md" style={{ borderRadius: "8px", border: "1px solid #fee2e2", backgroundColor: "#fef2f2" }} gap={5}>
          <Text size="sm" c="red">Inactive</Text>
          <Text size="1.5rem" fw={600} c="red">{stats.inactive}</Text>
        </Stack>
        <Stack p="md" style={{ borderRadius: "8px", border: "1px solid #ddd6fe", backgroundColor: "#f5f3ff" }} gap={5}>
          <Text size="sm" c="violet">Default Role</Text>
          <Text size="1.5rem" fw={600} c="violet">{stats.default}</Text>
        </Stack>
      </Group>

      <Card withBorder p={0} radius="md" style={{ overflow: "hidden" }}>
        <Flex justify="space-between" align="center" p="md" style={{ borderBottom: "1px solid #f1f3f5" }}>
          <Text fw={600}>Daftar Role</Text>
          <Flex gap={10} align="center">
            <Tooltip label="Refresh Data">
              <ActionIcon variant="filled" color="blue" size="lg" onClick={() => getData()} loading={loading.includes("getdata")}>
                <Icon icon="mdi:refresh" width={20} />
              </ActionIcon>
            </Tooltip>
            <TextInput
              placeholder="Cari role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 250 }}
            />
          </Flex>
        </Flex>

        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                {[
                  { label: "ID", sortable: true, key: "id" },
                  { label: "Nama Role", sortable: true, key: "name" },
                  { label: "Deskripsi", sortable: false },
                  { label: "Status", sortable: true, key: "status" },
                  { label: "Aksi", sortable: false },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.sortable && requestSort(col.key!)}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#495057",
                      textTransform: "uppercase",
                      cursor: col.sortable ? "pointer" : "default",
                      position: col.label === "Aksi" ? "sticky" : "static",
                      right: col.label === "Aksi" ? 0 : "auto",
                      backgroundColor: col.label === "Aksi" ? "#f8f9fa" : "transparent",
                      zIndex: col.label === "Aksi" ? 10 : 1,
                    }}
                  >
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
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">Data tidak ditemukan</Text>
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f3f5" }}>
                    <td style={{ padding: "12px 16px" }}><Text size="sm">{item.id}</Text></td>
                    <td style={{ padding: "12px 16px" }}><Text size="sm" fw={500}>{item.name}</Text></td>
                    <td style={{ padding: "12px 16px" }}><Text size="sm" c="gray.7" lineClamp={2}>{item.description}</Text></td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge color={item.status === "active" ? "green" : "red"} variant="light" size="sm">
                        {item.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", position: "sticky", right: 0, backgroundColor: "#fff", zIndex: 5, boxShadow: "-2px 0 5px rgba(0,0,0,0.02)" }}>
                      <Flex gap={8}>
                        <Tooltip label="Edit">
                          <ActionIcon variant="filled" color="blue" onClick={() => { handleEditClick(item); setIsFormVisible(true); }}>
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
          <Pagination
            total={pagination.last_page}
            value={pagination.current_page}
            onChange={(page: number) => getData(`page=${page}`)}
            color="blue"
          />
        </Flex>
      )}
    </Stack>
  );

  return <>{isFormVisible ? renderForm() : renderList()}</>;
}