// festaqingkolektiv/src/pages/dashboard/admin/permission/index.tsx
import { useState, useEffect } from "react";
import { 
  LoadingOverlay, 
  Stack, 
  Flex, 
  Text, 
  Group, 
  Badge, 
  Button, 
  Modal, 
  Select, 
  Checkbox,
  Grid,
  Divider
} from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import moment from "moment";
import TableData from "@/components/TableData";
import fetch from "@/utils/fetch";

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
  const [users, setUsers] = useState<any[]>([]);

  // Modal untuk form
  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
      user_id: (value) => (!value ? "User harus dipilih" : null),
      role_id: (value) => (!value ? "Role harus dipilih" : null),
      module_id: (value) => (!value ? "Module harus dipilih" : null),
    },
  });

  useEffect(() => {
    getData();
    getRoles();
    getModules();
    getUsers();
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
            console.log("API Permission Response:", response);
            
            if (response && response.data) {
              let permissions: PermissionProps[] = [];

              if (Array.isArray(response.data.data)) {
                permissions = response.data.data;
              } else if (Array.isArray(response.data)) {
                permissions = response.data;
              } else if (response.data.items) {
                permissions = response.data.items;
              } else {
                permissions = [response.data];
              }

              setData(permissions);
              setPagination(response?.data || response);
            }
          },
          complete: () => setLoading.filter((e) => e !== "getdata"),
          error: (error) => {
            console.error("Error fetching permission data:", error);
            notifications.show({
              title: "Gagal",
              message: "Gagal mengambil data permission",
              color: "red",
            });
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
        success: (response) => {
          if (response && response.data) {
            const rolesData = Array.isArray(response.data.data) 
              ? response.data.data 
              : Array.isArray(response.data) 
                ? response.data 
                : [];
            setRoles(rolesData.map((role: any) => ({
              value: role.id.toString(),
              label: role.name,
            })));
          }
        },
      });
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const getModules = async () => {
    try {
      await fetch({
        url: "module",
        method: "GET",
        data: {},
        success: (response) => {
          if (response && response.data) {
            const modulesData = Array.isArray(response.data.data) 
              ? response.data.data 
              : Array.isArray(response.data) 
                ? response.data 
                : [];
            setModules(modulesData.map((module: any) => ({
              value: module.id.toString(),
              label: module.module_name,
            })));
          }
        },
      });
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const getUsers = async () => {
    try {
      await fetch({
        url: "users", // Sesuaikan dengan endpoint user yang tersedia
        method: "GET",
        data: {},
        success: (response) => {
          if (response && response.data) {
            const usersData = Array.isArray(response.data.data) 
              ? response.data.data 
              : Array.isArray(response.data) 
                ? response.data 
                : [];
            setUsers(usersData.map((user: any) => ({
              value: user.id.toString(),
              label: `${user.name} (${user.email})`,
            })));
          }
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddClick = () => {
    setSelectedPermission(null);
    setIsEditMode(false);
    form.reset();
    openFormModal();
  };

  const handleEditClick = (rowData: any) => {
    // Cari permission berdasarkan ID dari data asli
    const permissionId = rowData.id;
    const permission = data.find(p => p.id === permissionId) as PermissionProps;
    if (!permission) return;
    
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

    openFormModal();
  };

  const handleDelete = async (rowData: any) => {
    // Cari permission berdasarkan ID dari data asli
    const permissionId = rowData.id;
    const permission = data.find(p => p.id === permissionId) as PermissionProps;
    if (!permission) return;
    
    if (!confirm(`Apakah Anda yakin ingin menghapus permission ini?`)) {
      return;
    }

    await fetch({
      url: `permission/${permission.id}`,
      method: "DELETE",
      data: {},
      before: () => setLoading.append("delete"),
      success: () => {
        notifications.show({
          title: "Berhasil",
          message: "Permission berhasil dihapus",
          color: "green",
        });
        getData();
      },
      error: () => {
        notifications.show({
          title: "Gagal",
          message: "Gagal menghapus permission",
          color: "red",
        });
      },
      complete: () => setLoading.filter((e) => e !== "delete"),
    });
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    const formData = {
      ...values,
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

    if (isEditMode && selectedPermission) {
      // UPDATE PERMISSION
      await fetch({
        url: `permission/${selectedPermission.id}`,
        method: "PUT",
        data: formData,
        before: () => setLoading.append("submit"),
        success: () => {
          notifications.show({
            title: "Berhasil",
            message: "Permission berhasil diperbarui",
            color: "green",
          });
          getData();
          closeFormModal();
          form.reset();
        },
        error: (error) => {
          notifications.show({
            title: "Gagal",
            message: error.message || "Gagal memperbarui permission",
            color: "red",
          });
        },
        complete: () => setLoading.filter((e) => e !== "submit"),
      });
    } else {
      // TAMBAH PERMISSION BARU
      await fetch({
        url: "permission",
        method: "POST",
        data: formData,
        before: () => setLoading.append("submit"),
        success: () => {
          notifications.show({
            title: "Berhasil",
            message: "Permission berhasil ditambahkan",
            color: "green",
          });
          getData();
          closeFormModal();
          form.reset();
        },
        error: (error) => {
          notifications.show({
            title: "Gagal",
            message: error.message || "Gagal menambahkan permission",
            color: "red",
          });
        },
        complete: () => setLoading.filter((e) => e !== "submit"),
      });
    }
  };

  // Function untuk memetakan data ke format table
  const mapData = (permission: any) => {
    // Type assertion ke PermissionProps
    const permissionData = permission as PermissionProps;
    return {
      id: permissionData.id,
      user: (
        <Stack gap={2}>
          <Text fw={500}>{permissionData.has_user?.name || "-"}</Text>
          <Text size="xs" c="dimmed">
            {permissionData.has_user?.email || ""}
          </Text>
        </Stack>
      ),
      role: (
        <Badge color="blue" variant="light" size="sm">
          {permissionData.has_role?.name || "-"}
        </Badge>
      ),
      module: (
        <Text size="sm">{permissionData.has_module?.module_name || "-"}</Text>
      ),
      permissions: (
        <Group gap="xs">
          {permissionData.is_index === 1 && <Badge size="xs" color="gray">Index</Badge>}
          {permissionData.is_view === 1 && <Badge size="xs" color="green">View</Badge>}
          {permissionData.is_update === 1 && <Badge size="xs" color="yellow">Update</Badge>}
          {permissionData.is_delete === 1 && <Badge size="xs" color="red">Delete</Badge>}
          {permissionData.is_download === 1 && <Badge size="xs" color="blue">Download</Badge>}
          {permissionData.is_import === 1 && <Badge size="xs" color="violet">Import</Badge>}
        </Group>
      ),
      created_at: permissionData.created_at ? moment(permissionData.created_at).format("DD MMM YYYY HH:mm") : "-",
      updated_at: permissionData.updated_at ? moment(permissionData.updated_at).format("DD MMM YYYY HH:mm") : "-",
    };
  };

  // Fungsi untuk menghitung statistik tanpa menggunakan Set iteration
  const getStats = () => {
    const userIds: number[] = [];
    const roleIds: number[] = [];
    const moduleIds: number[] = [];
    
    data.forEach(permission => {
      if (!userIds.includes(permission.user_id)) {
        userIds.push(permission.user_id);
      }
      if (!roleIds.includes(permission.role_id)) {
        roleIds.push(permission.role_id);
      }
      if (!moduleIds.includes(permission.module_id)) {
        moduleIds.push(permission.module_id);
      }
    });

    return {
      total: data.length,
      users: userIds.length,
      roles: roleIds.length,
      modules: moduleIds.length,
    };
  };

  const stats = getStats();

  return (
    <>
      <Stack className="p-[20px] md:p-[30px]" gap={30}>
        <LoadingOverlay visible={loading.includes("getdata")} />

        {/* Header dengan tombol Tambah */}
        <Flex gap={10} justify="space-between" align="center">
          <Stack gap={5}>
            <Text size="1.8rem" fw={600}>
              Kelola Permission
            </Text>
            <Text size="sm" c="gray">
              Daftar semua permission yang tersedia di sistem
            </Text>
          </Stack>

          <Button onClick={handleAddClick} color="blue">
            + Tambah Permission
          </Button>
        </Flex>

        {/* Statistik Cards */}
        <Group grow gap="md">
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa"
            }}
            gap={5}
          >
            <Text size="sm" c="gray">Total Permission</Text>
            <Text size="1.5rem" fw={600}>{stats.total}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #dbeafe",
              backgroundColor: "#eff6ff"
            }}
            gap={5}
          >
            <Text size="sm" c="blue">User Unik</Text>
            <Text size="1.5rem" fw={600} c="blue">{stats.users}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #fde68a",
              backgroundColor: "#fffbeb"
            }}
            gap={5}
          >
            <Text size="sm" c="yellow">Role Unik</Text>
            <Text size="1.5rem" fw={600} c="yellow">{stats.roles}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #ddd6fe",
              backgroundColor: "#f5f3ff"
            }}
            gap={5}
          >
            <Text size="sm" c="violet">Module Unik</Text>
            <Text size="1.5rem" fw={600} c="violet">{stats.modules}</Text>
          </Stack>
        </Group>

        {/* TABEL DATA PERMISSION */}
        <TableData
          loading={loading.includes("getdata")}
          value={pagination}
          onChange={getData}
          data={data}
          mapData={mapData}
          headerLabel={{
            id: "ID",
            user: "User",
            role: "Role",
            module: "Module",
            permissions: "Permissions",
            created_at: "Dibuat Pada",
            updated_at: "Diperbarui Pada",
          }}
          actionIcon={[
            {
              icon: "mdi:pencil",
              text: "Edit",
              onClick: handleEditClick,
            },
            {
              icon: "mdi:trash",
              text: "Hapus",
              onClick: handleDelete,
              color: "red",
            },
          ]}
        />
      </Stack>

      {/* MODAL FORM PERMISSION */}
      <Modal
        opened={formModalOpened}
        onClose={() => {
          closeFormModal();
          form.reset();
        }}
        title={isEditMode ? "Edit Permission" : "Tambah Permission Baru"}
        size="lg"
        centered
      >
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
          <LoadingOverlay visible={loading.includes("submit")} />
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="User"
                  placeholder="Pilih user"
                  data={users}
                  searchable
                  required
                  {...form.getInputProps("user_id")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Role"
                  placeholder="Pilih role"
                  data={roles}
                  searchable
                  required
                  {...form.getInputProps("role_id")}
                />
              </Grid.Col>
            </Grid>

            <Select
              label="Module"
              placeholder="Pilih module"
              data={modules}
              searchable
              required
              {...form.getInputProps("module_id")}
            />

            <Divider my="sm" label="Permission Settings" />

            <Grid>
              <Grid.Col span={4}>
                <Checkbox
                  label="Index"
                  description="Akses halaman index"
                  checked={form.values.is_index === 1}
                  onChange={(e) => form.setFieldValue("is_index", e.currentTarget.checked ? 1 : 0)}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Checkbox
                  label="View"
                  description="Akses view data"
                  checked={form.values.is_view === 1}
                  onChange={(e) => form.setFieldValue("is_view", e.currentTarget.checked ? 1 : 0)}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Checkbox
                  label="Update"
                  description="Akses update data"
                  checked={form.values.is_update === 1}
                  onChange={(e) => form.setFieldValue("is_update", e.currentTarget.checked ? 1 : 0)}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Checkbox
                  label="Delete"
                  description="Akses delete data"
                  checked={form.values.is_delete === 1}
                  onChange={(e) => form.setFieldValue("is_delete", e.currentTarget.checked ? 1 : 0)}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Checkbox
                  label="Download"
                  description="Akses download data"
                  checked={form.values.is_download === 1}
                  onChange={(e) => form.setFieldValue("is_download", e.currentTarget.checked ? 1 : 0)}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Checkbox
                  label="Import"
                  description="Akses import data"
                  checked={form.values.is_import === 1}
                  onChange={(e) => form.setFieldValue("is_import", e.currentTarget.checked ? 1 : 0)}
                />
              </Grid.Col>
            </Grid>

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
                {isEditMode ? "Simpan Perubahan" : "Tambah Permission"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}