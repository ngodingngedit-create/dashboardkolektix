// festaqingkolektiv/src/pages/dashboard/admin/role/index.tsx
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
  TextInput, 
  Select, 
  Textarea 
} from "@mantine/core";
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

  // Modal untuk form
  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
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
    openFormModal();
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

    openFormModal();
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
          closeFormModal();
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
          closeFormModal();
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

  return (
    <>
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

          <Button onClick={handleAddClick} color="blue">
            + Tambah Role
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
            <Text size="sm" c="gray">Total Role</Text>
            <Text size="1.5rem" fw={600}>{stats.total}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #d1fae5",
              backgroundColor: "#f0fdf4"
            }}
            gap={5}
          >
            <Text size="sm" c="green">Active</Text>
            <Text size="1.5rem" fw={600} c="green">{stats.active}</Text>
          </Stack>
          
          <Stack 
            p="md" 
            style={{ 
              borderRadius: "8px", 
              border: "1px solid #fee2e2",
              backgroundColor: "#fef2f2"
            }}
            gap={5}
          >
            <Text size="sm" c="red">Inactive</Text>
            <Text size="1.5rem" fw={600} c="red">{stats.inactive}</Text>
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
            <Text size="sm" c="violet">Default Role</Text>
            <Text size="1.5rem" fw={600} c="violet">{stats.default}</Text>
          </Stack>
        </Group>

        {/* TABEL DATA ROLE */}
        <TableData
          loading={loading.includes("getdata")}
          value={pagination}
          onChange={getData}
          data={data}
          mapData={mapData}
          headerLabel={{
            id: "ID",
            name: "Nama Role",
            description: "Deskripsi",
            status: "Status",
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
              onClick: (rowData: any) => {
                const role = rowData as RoleProps;
                if (role.id <= 4) {
                  notifications.show({
                    title: "Tidak Dapat Dihapus",
                    message: "Role default (ID 1-4) tidak dapat dihapus",
                    color: "yellow",
                  });
                  return;
                }
                handleDelete(rowData);
              },
              color: "red",
            },
          ]}
        />
      </Stack>

      {/* MODAL FORM ROLE */}
      <Modal
        opened={formModalOpened}
        onClose={() => {
          closeFormModal();
          form.reset();
        }}
        title={isEditMode ? "Edit Role" : "Tambah Role Baru"}
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
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
                {isEditMode ? "Simpan Perubahan" : "Tambah Role"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}