import { useEffect, useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { Get, Post, Put, Delete } from "@/utils/REST";
import { LoadingOverlay, Stack, Flex, Text, Group, Avatar, Badge, Button, TextInput, PasswordInput, Select, Card, Box, Pagination, Grid, ActionIcon, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useDebouncedValue } from "@mantine/hooks";
import moment from "moment";
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

interface UserMapping {
  id: number;
  user_id: number;
  role_id: number;
  parent_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  has_creator: boolean;
  creator: any;
  has_talent: boolean;
  talent: any;
  has_mapping: boolean;
  user_mapping: UserMapping | null;
}

interface PageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  total: number;
}

const errMessage = (err: any, fallback: string) => err?.response?.data?.message || err?.message || fallback;

export default function KelolaUser() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const isEditMode = !!selectedUser;

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      verified_status_id: 1,
    },
    validate: {
      name: (value) => (!value ? t("admin.user.index.validation.nameRequired") : null),
      email: (value) => {
        if (!value) return t("admin.user.index.validation.emailRequired");
        if (!/^\S+@\S+$/.test(value)) return t("admin.user.index.validation.emailInvalid");
        return null;
      },
      password: (value) => {
        if (!value) return isEditMode ? null : t("admin.user.index.validation.passwordRequired");
        return value.length < 8 ? t("admin.user.index.validation.passwordMin") : null;
      },
    },
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const getData = async () => {
    // ponytail: search sends ?search= and per_page=1000 so the client-side filter covers all users if the API ignores search; if API also ignores per_page, search only covers the current page. Upgrade: backend search.
    const params: Record<string, string> = debouncedSearch
      ? { page: "1", per_page: "1000", search: debouncedSearch.trim() }
      : { page: String(page) };

    setLoading(true);
    try {
      const res: any = await Get(`admin-data/users?${new URLSearchParams(params).toString()}`, {});
      const p = res?.data;
      setData(Array.isArray(p?.data) ? p.data : []);
      setMeta(p ? { current_page: p.current_page, last_page: p.last_page, per_page: p.per_page, from: p.from, to: p.to, total: p.total } : null);
    } catch (err) {
      notifications.show({ title: t("common.failed"), message: errMessage(err, t("admin.user.index.toast.fetchFailed")), color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    form.reset();
    setIsFormVisible(true);
  };

  const handleEditClick = (user: UserRow) => {
    setSelectedUser(user);
    form.setValues({ name: user.name || "", email: user.email || "", phone: user.phone || "", password: "", verified_status_id: 1 });
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setSelectedUser(null);
    form.reset();
  };

  const handleDelete = async (user: UserRow) => {
    if (!confirm(t("admin.user.index.confirm.delete", { name: user.name || "" }))) return;
    setLoading(true);
    try {
      await Delete(`admin-data/users/${user.id}`, {});
      notifications.show({ title: t("common.success"), message: t("admin.user.index.toast.deleted"), color: "green" });
      getData();
    } catch (err) {
      notifications.show({ title: t("common.failed"), message: errMessage(err, t("admin.user.index.toast.deleteFailed")), color: "red" });
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values: typeof form.values) => {
    const base = {
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      verified_status_id: values.verified_status_id,
    };

    setSubmitting(true);
    try {
      if (selectedUser) {
        await Put(`admin-data/users/${selectedUser.id}`, values.password ? { ...base, password: values.password } : base);
        notifications.show({ title: t("common.success"), message: t("admin.user.index.toast.updated"), color: "green" });
        getData();
      } else {
        await Post("admin-data/users", { ...base, password: values.password, is_creator: false, google_id: null, avatar: null });
        notifications.show({ title: t("common.success"), message: t("admin.user.index.toast.added"), color: "green" });
        if (page === 1 && !debouncedSearch) getData();
        else {
          setSearchQuery("");
          setPage(1);
        }
      }
      closeForm();
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors && typeof errors === "object") {
        form.setErrors(Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])));
      }
      notifications.show({
        title: t("common.failed"),
        message: errMessage(err, isEditMode ? t("admin.user.index.toast.updateFailed") : t("admin.user.index.toast.addFailed")),
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(needle) ||
          item.email?.toLowerCase().includes(needle) ||
          item.phone?.toLowerCase().includes(needle)
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      const pick = (r: UserRow): any => {
        if (sortConfig.key === "created_at") return r.user_mapping?.created_at || "";
        if (sortConfig.key === "status") return r.user_mapping?.status || "";
        return (r as any)[sortConfig.key as string] ?? "";
      };
      result.sort((a, b) => {
        let valA = pick(a);
        let valB = pick(b);
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
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

  const rowNumber = (idx: number) => (debouncedSearch || !meta ? idx + 1 : (meta.current_page - 1) * meta.per_page + idx + 1);

  const renderForm = () => (
    <Stack gap={25} className="p-[20px] md:p-[30px] pb-24" pos="relative">
      <Flex align="center" gap={15}>
        <Tooltip label={t("admin.user.index.kembali")}>
          <ActionIcon variant="light" color="gray" onClick={closeForm} size="lg" radius="xl">
            <Icon icon="mdi:arrow-left" width={20} />
          </ActionIcon>
        </Tooltip>
        <Stack gap={0}>
          <Text size="1.5rem" fw={600}>{isEditMode ? t("admin.user.index.header.editUser") : t("admin.user.index.header.addUser")}</Text>
          <Text size="xs" c="dimmed">{t("admin.user.index.isi.form.di.bawah.untuk.mengelola.data.user")}</Text>
        </Stack>
      </Flex>

      <form id="user-form" onSubmit={form.onSubmit(handleFormSubmit)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <LoadingOverlay visible={submitting} />
          <Stack gap="md">
            <Text fw={600} size="lg">{t("admin.user.index.data.user")}</Text>
            <Grid>
              <Grid.Col span={{ base: 12, xs: 6 }}>
                <TextInput label={t("admin.user.index.nama.lengkap")} placeholder={t("admin.user.index.contoh.john.doe")} required {...form.getInputProps("name")} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6 }}>
                <TextInput label={t("admin.user.index.email")} placeholder={t("admin.user.index.contoh.user.example.com")} required type="email" {...form.getInputProps("email")} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6 }}>
                <TextInput label={t("admin.user.index.nomor.telepon")} placeholder={t("admin.user.index.contoh.081234567890")} {...form.getInputProps("phone")} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6 }}>
                <PasswordInput
                  label={t("admin.user.index.label.password")}
                  description={isEditMode ? t("admin.user.index.hint.passwordKeepCurrent") : undefined}
                  required={!isEditMode}
                  autoComplete="new-password"
                  {...form.getInputProps("password")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6 }}>
                <Select
                  label={t("admin.user.index.status.verifikasi.user")}
                  data={[
                    { value: "1", label: t("admin.user.index.option.verified") },
                    { value: "0", label: t("admin.user.index.option.unverified") },
                  ]}
                  value={form.values.verified_status_id.toString()}
                  onChange={(value) => form.setFieldValue("verified_status_id", parseInt(value || "1"))}
                  allowDeselect={false}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-[30px] py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={closeForm} disabled={submitting}>
              {t("admin.user.index.batal")}
            </Button>
            <Button type="submit" form="user-form" color="blue" loading={submitting}>
              {isEditMode ? t("admin.user.index.button.saveEdit") : t("admin.user.index.button.saveAdd")}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  const columns = [
    { label: t("admin.user.index.table.no"), sortable: false },
    { label: t("admin.user.index.table.createdAt"), sortable: true, key: "created_at" },
    { label: t("admin.user.index.table.user"), sortable: true, key: "name" },
    { label: t("admin.user.index.table.contact"), sortable: false },
    { label: t("admin.user.index.table.status"), sortable: true, key: "status" },
    { label: t("admin.user.index.table.role"), sortable: false },
    { label: t("admin.user.index.table.actions"), sortable: false, sticky: true },
  ];

  const renderList = () => (
    <Stack className="p-[20px] md:p-[30px]" gap={30} pos="relative">
      <LoadingOverlay visible={loading} />

      <Flex justify="space-between" align="center">
        <Flex align="center" gap={12}>
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label={t("admin.user.index.kembali.ke.dashboard.admin")}
          >
            <Icon icon="ph:arrow-left-bold" className="text-lg" />
          </button>
          <Stack gap={2}>
            <Text size="1.8rem" fw={600} c="black">{t("admin.user.index.kelola.user")}</Text>
            <Text size="sm" c="black">{t("admin.user.index.daftar.semua.user.kolektix")}</Text>
          </Stack>
        </Flex>
        <Button onClick={handleAddClick} leftSection={<Icon icon="ph:plus-bold" className="text-lg" />} color="indigo" radius="md">
          {t("admin.user.index.tambah.user")}
        </Button>
      </Flex>

      <Box style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" wrap="nowrap" style={{ overflowX: "auto", borderBottom: "1px solid #eee" }}>
          <div style={{ width: 250, flexShrink: 0 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>{t("admin.user.index.pencarian")}</Text>
            <TextInput
              placeholder={t("admin.user.index.cari.user.nama.email")}
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
                {columns.map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.sortable && requestSort(col.key!)}
                    style={{
                      ...tableHeadStyle,
                      cursor: col.sortable ? "pointer" : "default",
                      position: col.sticky ? "sticky" : "static",
                      right: col.sticky ? 0 : "auto",
                      backgroundColor: col.sticky ? "#f8fafd" : "transparent",
                      zIndex: col.sticky ? 10 : 1,
                    }}
                  >
                    <Flex align="center" gap={6}>
                      {col.label}
                      {col.sortable &&
                        (sortConfig.key === col.key && sortConfig.direction ? (
                          <Icon icon={sortConfig.direction === "asc" ? "ph:caret-up-bold" : "ph:caret-down-bold"} width={12} className="text-indigo-500" />
                        ) : (
                          <Icon icon="ph:caret-up-down-bold" width={12} className="text-gray-300" />
                        ))}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: "60px", textAlign: "center" }}>
                    <Stack align="center" gap="xs">
                      <Icon icon="ph:user-circle-minus" className="text-5xl text-gray-300" />
                      <Text c="dimmed" fw={500}>{t("admin.user.index.data.user.tidak.ditemukan")}</Text>
                    </Stack>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #f1f3f5", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafd")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={tableCellStyle}>
                      <Text size="sm" fw={600} c="dimmed">{rowNumber(idx)}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm">{item.user_mapping?.created_at ? moment(item.user_mapping.created_at).format("DD MMM YYYY") : "-"}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      <Group gap="sm" wrap="nowrap">
                        <Avatar color="indigo" radius="sm" size="md" variant="light">
                          {item.name?.charAt(0)?.toUpperCase() || "?"}
                        </Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={600} c="gray.8">{item.name || "-"}</Text>
                          <Text size="xs" c="dimmed">{item.email || ""}</Text>
                          <Text size="xs" c="indigo.4">{t("admin.user.index.id")} {item.id}</Text>
                        </Stack>
                      </Group>
                    </td>
                    <td style={tableCellStyle}>
                      <Text size="sm" fw={500}>{item.phone || "-"}</Text>
                    </td>
                    <td style={tableCellStyle}>
                      {item.user_mapping ? (
                        <Badge color={item.user_mapping.status === "active" ? "teal" : "gray"} variant="filled" radius="xs" size="xs">
                          {item.user_mapping.status === "active" ? t("admin.user.index.badge.aktif") : t("admin.user.index.badge.nonaktif")}
                        </Badge>
                      ) : (
                        <Text size="sm" c="dimmed">-</Text>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <Group gap={4}>
                        {item.has_creator && <Badge color="violet" variant="light" radius="xs" size="xs">{t("admin.user.index.badge.creator")}</Badge>}
                        {item.has_talent && <Badge color="pink" variant="light" radius="xs" size="xs">{t("admin.user.index.badge.talent")}</Badge>}
                        {!item.has_creator && !item.has_talent && <Badge color="gray" variant="light" radius="xs" size="xs">{t("admin.user.index.badge.user")}</Badge>}
                      </Group>
                    </td>
                    <td style={{ ...tableCellStyle, position: "sticky", right: 0, backgroundColor: "inherit", zIndex: 5, boxShadow: "-4px 0 8px rgba(0,0,0,0.02)" }}>
                      <Flex gap={6}>
                        <Tooltip label={t("admin.user.index.edit.data")} withArrow>
                          <ActionIcon variant="filled" color="indigo" onClick={() => handleEditClick(item)} size="sm" aria-label={t("admin.user.index.edit.data")}>
                            <Icon icon="ph:pencil-simple" className="text-lg" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t("admin.user.index.hapus.user")} withArrow>
                          <ActionIcon variant="filled" color="red" onClick={() => handleDelete(item)} size="sm" aria-label={t("admin.user.index.hapus.user")}>
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

      {meta && !debouncedSearch && (
        <Flex justify="space-between" align="center" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            {t("admin.user.index.pageInfo", { from: meta.from ?? 0, to: meta.to ?? 0, total: meta.total })}
          </Text>
          {meta.last_page > 1 && <Pagination total={meta.last_page} value={page} onChange={setPage} color="blue" />}
        </Flex>
      )}
    </Stack>
  );

  return <>{isFormVisible ? renderForm() : renderList()}</>;
}
