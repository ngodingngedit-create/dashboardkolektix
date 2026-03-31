import { useState, useEffect, useMemo } from "react";
import bankEmpty from "../../../assets/icon/bank.png";
import Image from "next/image";
import {
  Stack,
  Flex,
  Text,
  Title,
  Card,
  Button,
  TextInput,
  Select,
  ActionIcon,
  Tooltip,
  Box,
  LoadingOverlay,
  Badge,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPencil,
  faTrash,
  faArrowLeft,
  faArrowsRotate,
  faSave,
  faXmark,
  faSort,
  faSortUp,
  faSortDown,
  faSearch,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { Delete, Get, Post, Put } from "@/utils/REST";
import useLoggedUser from "@/utils/useLoggedUser";

interface BankProps {
  id: number;
  user_id: number;
  type_bank: string;
  account_name: string;
  account_number: string;
  status: "active" | "inactive";
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

const BANK_LIST = [
  "BCA", "BNI", "BRI", "Mandiri", "CIMB Niaga", "Danamon",
  "Permata", "Panin", "BTN", "Bank Mega", "Bank Syariah Indonesia (BSI)",
  "Jenius (BTPN)", "Jago", "OVO", "GoPay", "Dana", "Lainnya",
];

const Bank = () => {
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<BankProps[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankProps | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" | null }>({
    key: "type_bank",
    direction: "asc",
  });
  const user = useLoggedUser();

  const form = useForm({
    initialValues: {
      type_bank: "",
      account_number: "",
      account_name: "",
      status: "active",
    },
    validate: {
      type_bank: (v) => (!v ? "Nama bank harus dipilih" : null),
      account_number: (v) => (!v ? "Nomor rekening harus diisi" : null),
      account_name: (v) => (!v ? "Atas nama harus diisi" : null),
    },
  });

  const getData = () => {
    if (!user) return;
    if (loading.includes("getdata")) return;
    setLoading.append("getdata");
    Get(`bank-by-user/${user?.id}`, {})
      .then((res: any) => {
        setData(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err: any) => {
        console.log(err);
        notifications.show({ title: "Gagal", message: "Gagal mengambil data rekening", color: "red" });
      })
      .finally(() => setLoading.filter((e) => e !== "getdata"));
  };

  const deleteData = (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rekening ini?")) return;
    setLoading.append("delete");
    Delete(`user-bank/${id}`, {})
      .then(() => {
        notifications.show({ title: "Berhasil", message: "Rekening berhasil dihapus", color: "green" });
        getData();
      })
      .catch(() => notifications.show({ title: "Gagal", message: "Gagal menghapus rekening", color: "red" }))
      .finally(() => setLoading.filter((e) => e !== "delete"));
  };

  const handleAddClick = () => {
    setSelectedBank(null);
    setIsEditMode(false);
    form.reset();
    setIsFormVisible(true);
  };

  const handleEditClick = (item: BankProps) => {
    setSelectedBank(item);
    setIsEditMode(true);
    form.setValues({
      type_bank: item.type_bank,
      account_number: item.account_number,
      account_name: item.account_name,
      status: item.status,
    });
    setIsFormVisible(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    const payload = {
      user_id: user?.id ?? 0,
      type_bank: values.type_bank,
      account_number: values.account_number,
      account_name: values.account_name,
      status: values.status,
    };
    setLoading.append("submit");
    try {
      if (isEditMode && selectedBank) {
        await Put(`user-bank/${selectedBank.id}`, payload);
        notifications.show({ title: "Berhasil", message: "Rekening berhasil diperbarui", color: "green" });
      } else {
        await Post("user-bank", payload);
        notifications.show({ title: "Berhasil", message: "Rekening berhasil ditambahkan", color: "green" });
      }
      getData();
      setIsFormVisible(false);
      form.reset();
    } catch {
      notifications.show({ title: "Gagal", message: "Gagal menyimpan data rekening", color: "red" });
    } finally {
      setLoading.filter((e) => e !== "submit");
    }
  };

  useEffect(() => {
    if (user) getData();
  }, [user]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchValue) {
      result = result.filter(
        (item) =>
          item.type_bank.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.account_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.account_number.includes(searchValue)
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        const valA = (a[sortConfig.key] || "").toLowerCase();
        const valB = (b[sortConfig.key] || "").toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchValue, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    else if (sortConfig.key === key && sortConfig.direction === "desc") direction = null;
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return faSort;
    return sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  // ─── List View ───────────────────────────────────────────────────────────
  const renderList = () => (
    <Stack gap={30}>
      {/* Header */}
      <Flex gap={20} justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">Rekening Bank</Title>
          <Text size="sm" c="gray">Daftar rekening bank yang terhubung ke akun Anda</Text>
        </Stack>
        <Button
          onClick={handleAddClick}
          leftSection={<FontAwesomeIcon icon={faPlus} />}
          color="blue"
          size="md"
          radius="xl"
        >
          Tambah Rekening
        </Button>
      </Flex>

      {/* Table Card */}
      <Card withBorder p="md" radius="md" shadow="sm">
        <Flex justify="space-between" align="center" mb="lg">
          <Flex gap={10}>
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={getData}
              loading={loading.includes("getdata")}
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </Button>
          </Flex>
          <TextInput
            placeholder="Cari nama bank, rekening, atau atas nama..."
            leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: 320 }}
          />
        </Flex>

        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                {[
                  { label: "No", sortable: false },
                  { label: "Bank", sortable: true, key: "type_bank" },
                  { label: "Nomor Rekening", sortable: false },
                  { label: "Atas Nama", sortable: true, key: "account_name" },
                  { label: "Status", sortable: false },
                  { label: "Aksi", sortable: false },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.sortable && requestSort(col.key!)}
                    style={{
                      padding: "12px 14px",
                      textAlign: ["No", "Status", "Aksi"].includes(col.label) ? "center" : "left",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#495057",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #e9ecef",
                      letterSpacing: "0.5px",
                      cursor: col.sortable ? "pointer" : "default",
                      userSelect: "none",
                      position: col.label === "Aksi" ? "sticky" : "static",
                      right: col.label === "Aksi" ? 0 : "auto",
                      backgroundColor: col.label === "Aksi" ? "#f8f9fa" : "transparent",
                      zIndex: col.label === "Aksi" ? 10 : 1,
                    }}
                  >
                    <Flex align="center" gap={6} justify={["No", "Status", "Aksi"].includes(col.label) ? "center" : "flex-start"}>
                      {col.label}
                      {col.sortable && (
                        <FontAwesomeIcon
                          icon={getSortIcon(col.key!)}
                          size="xs"
                          style={{ color: sortConfig.key === col.key ? "#228be6" : "#adb5bd", opacity: sortConfig.key === col.key ? 1 : 0.5 }}
                        />
                      )}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.includes("getdata") ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">Memuat data...</Text>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "60px", textAlign: "center" }}>
                    <Stack align="center" gap={10}>
                      <Image src={bankEmpty} alt="bank" width={40} height={40} />
                      <Text c="dimmed" fw={500}>Belum ada rekening yang disimpan</Text>
                      <Text size="xs" c="gray">Tambah rekening bank untuk memudahkan penarikan K-Wallet</Text>
                    </Stack>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #f1f3f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <Text size="xs" fw={700}>{idx + 1}</Text>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Flex align="center" gap={10}>
                        <Box
                          w={36} h={36} bg="blue.1"
                          style={{ borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                          <FontAwesomeIcon icon={faUniversity} style={{ color: "#228be6" }} />
                        </Box>
                        <Text size="sm" fw={600}>{item.type_bank}</Text>
                      </Flex>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Text size="sm" style={{ fontFamily: "monospace", letterSpacing: 1 }}>{item.account_number}</Text>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Text size="sm" c="gray.7">{item.account_name}</Text>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <Badge
                        variant="filled"
                        color={item.status === "active" ? "green" : "red"}
                        size="sm"
                      >
                        {item.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 14px", position: "sticky", right: 0, backgroundColor: "inherit", zIndex: 5, boxShadow: "-2px 0 5px rgba(0,0,0,0.02)", borderLeft: "1px solid #f1f3f5" }}>
                      <Flex gap={8} justify="center">
                        <Tooltip label="Edit Rekening">
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleEditClick(item)}>
                            <FontAwesomeIcon icon={faPencil} size="sm" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Rekening">
                          <ActionIcon variant="subtle" color="red" onClick={() => deleteData(item.id)} loading={loading.includes("delete")}>
                            <FontAwesomeIcon icon={faTrash} size="sm" />
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
    </Stack>
  );

  // ─── Form View ───────────────────────────────────────────────────────────
  const renderForm = () => (
    <Stack gap={25}>
      {/* Header */}
      <Flex align="center" gap={15}>
        <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="md">
          <FontAwesomeIcon icon={faArrowLeft} />
        </ActionIcon>
        <Stack gap={0}>
          <Title order={2} size="h3">
            {isEditMode ? `Edit Rekening: ${selectedBank?.type_bank}` : "Tambah Rekening Baru"}
          </Title>
          <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola data rekening bank Anda</Text>
        </Stack>
      </Flex>

      <form id="bank-form" onSubmit={form.onSubmit(handleSubmit)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Nama Bank"
                placeholder="Pilih bank"
                data={BANK_LIST.map((b) => ({ value: b, label: b }))}
                searchable
                required
                {...form.getInputProps("type_bank")}
              />
              <TextInput
                label="Nomor Rekening"
                placeholder="Contoh: 1234567890"
                required
                {...form.getInputProps("account_number")}
              />
              <TextInput
                label="Atas Nama"
                placeholder="Nama pemilik rekening"
                required
                {...form.getInputProps("account_name")}
              />
              <Select
                label="Status"
                placeholder="Status rekening"
                data={[
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                ]}
                required
                {...form.getInputProps("status")}
              />
            </div>
          </Stack>
        </Card>

        {/* Floating Footer */}
        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
          <Flex justify="flex-end" gap="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setIsFormVisible(false)}
              size="md"
              leftSection={<FontAwesomeIcon icon={faXmark} />}
            >
              Batalkan
            </Button>
            <Button
              type="submit"
              form="bank-form"
              color="blue"
              size="md"
              loading={loading.includes("submit")}
              leftSection={!loading.includes("submit") && <FontAwesomeIcon icon={faSave} />}
            >
              {isEditMode ? "Simpan Perubahan" : "Konfirmasi & Simpan"}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  return (
    <div className="p-[20px] md:p-[30px] pb-[100px] min-h-screen bg-[#fcfcfc]">
      <LoadingOverlay visible={loading.includes("submit")} overlayProps={{ blur: 2 }} />
      {isFormVisible ? renderForm() : renderList()}
    </div>
  );
};

export default Bank;
