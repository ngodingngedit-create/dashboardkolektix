import { Delete, Get, Post, Put } from "@/utils/REST";
import {
  Card, Flex, ActionIcon, Group, Modal, Select, NumberInput,
  Tooltip, Text, Badge, Pagination as PaginationM,
  Button as ButtonM, Stack, TextInput, Textarea, Box
} from "@mantine/core";
import { Input } from "@nextui-org/react";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { Icon } from "@iconify/react/dist/iconify.js";
import _ from "lodash";
import { modals } from "@mantine/modals";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const PER_PAGE = 10;

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

interface SliderItem {
  id: number;
  name: string;
  description: string;
  image: string;
  image_url?: string;
  status?: string;
  rank?: number;
  created_at?: string;
}

export default function AdminSliderManagement() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SliderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  // Sorting State
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Modal State
  const [opened, setOpened] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [rank, setRank] = useState<number | string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    let result = [...data];

    // Client-side filtering
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(item =>
        (item.name?.toLowerCase().includes(needle)) ||
        (item.description?.toLowerCase().includes(needle))
      );
    }

    if (!sortBy) return result;

    return result.sort((a: any, b: any) => {
      let valA = _.get(a, sortBy) ?? "";
      let valB = _.get(b, sortBy) ?? "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortDir, debouncedSearch]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const fetchData = async () => {
    setLoading(true);

    const params: any = {
      page: String(page),
      per_page: String(PER_PAGE),
    };

    if (debouncedSearch) params.search = debouncedSearch;

    const qs = new URLSearchParams(params).toString();

    try {
      const res: any = await Get(`slider?${qs}`, {});
      if (res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data.data || []);
        const totalItems = res.total || res.data.total || items.length;
        
        setData(items);
        setTotal(totalItems);
      }
    } catch (error) {
      console.error("Error fetching slider data:", error);
      notifications.show({
        title: t("common.failed"),
        message: t("admin.slider.index.toast.fetchFailed"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    const item = data.find(v => v.id === id);
    const itemName = item?.name || t("admin.slider.index.confirm.deleteFallback");

    modals.openConfirmModal({
      centered: true,
      title: t("admin.slider.index.confirm.deleteTitle"),
      children: t("admin.slider.index.confirm.delete", { name: itemName }),
      labels: { confirm: t("common.delete"), cancel: t("common.cancel") },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await Delete(`slider/${id}`, { admin_override: true });
          notifications.show({
            title: t("common.success"),
            message: t("admin.slider.index.toast.deleted"),
            color: "green",
          });
          fetchData();
        } catch (err) {
          console.error(err);
          notifications.show({
            title: t("common.failed"),
            message: t("admin.slider.index.toast.deleteFailed"),
            color: "red",
          });
        }
      },
    });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("active");
    setRank("");
    setImageFile(null);
    setImagePreview(null);
    setIsEdit(false);
    setEditId(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpened(true);
  };

  const handleOpenEdit = (item: SliderItem) => {
    resetForm();
    setIsEdit(true);
    setEditId(item.id);
    setName(item.name || "");
    setDescription(item.description || "");
    setStatus(item.status || "active");
    setRank(item.rank ?? "");
    setImagePreview(item.image_url || item.image || null);
    setOpened(true);
  };

  const toBase64 = (file: File) => new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || (!isEdit && !imageFile)) {
            notifications.show({
                title: t("common.warning"),
                message: t("admin.slider.index.validation.nameRequired"),
                color: "yellow"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let base64Image = undefined;
            if (imageFile) {
                base64Image = await toBase64(imageFile);
            }

            const payload: any = {
                name,
                description,
                status
            };

            if (rank !== "") {
                payload.rank = Number(rank);
            }

            if (base64Image) {
                payload.image = base64Image;
            }

            if (isEdit && editId) {
                await Put(`slider/${editId}`, payload);
                notifications.show({
                    title: t("common.success"),
                    message: t("admin.slider.index.toast.updateSuccess"),
                    color: "green"
                });
            } else {
                await Post(`slider`, payload);
                notifications.show({
                    title: t("common.success"),
                    message: t("admin.slider.index.toast.addSuccess"),
                    color: "green"
                });
            }
            setOpened(false);
            fetchData();
        } catch (error) {
            console.error(error);
            notifications.show({
                title: t("common.failed"),
                message: t("admin.slider.index.toast.saveFailed"),
                color: "red"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
      <Flex justify="space-between" align="center" mb={10}>
        <Flex align="center" gap={12}>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label={t("admin.slider.index.kembali.ke.dashboard.admin")}
          >
            <Icon icon="ph:arrow-left-bold" />
          </button>
          <Stack gap={5}>
            <Text size="1.8rem" fw={600}>{t("admin.slider.index.slider.management")}</Text>
            <Text size="sm" c="gray">
              {t("admin.slider.index.kelola.banner.slider.yang.ditampilkan.di.halaman.utama")}
            </Text>
          </Stack>
        </Flex>
        <ButtonM
          onClick={handleOpenCreate}
          leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
          radius="md"
          color="blue"
          className="shadow-sm"
        >
          {t("admin.slider.index.tambah.slider")}
        </ButtonM>
      </Flex>

      <Card withBorder radius="md" p={0} className="shadow-sm overflow-hidden border-light-grey">
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <div style={{ width: 220 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>{t("admin.slider.index.pencarian")}</Text>
            <Input
              isClearable
              value={search}
              placeholder={t("admin.slider.index.cari.slider")}
              onChange={(e: any) => setSearch(e.target.value)}
              onClear={() => {
                setSearch("");
                setPage(1);
              }}
              size="sm"
              startContent={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
              classNames={{
                input: "bg-[#f1f3f5] border-none",
              }}
            />
          </div>
        </Flex>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #eee" }}>
                <th style={tableHeadStyle}>{t("admin.slider.index.no")}</th>
                <th style={tableHeadStyle}>{t("admin.slider.index.banner")}</th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("name")}>
                  {t("admin.slider.index.nama.slider")} {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("description")}>
                  {t("admin.slider.index.deskripsi")} {sortBy === "description" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("rank")}>
                  {t("admin.slider.index.rank")} {sortBy === "rank" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("status")}>
                  {t("admin.slider.index.status")} {sortBy === "status" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>{t("admin.slider.index.aksi")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">{t("admin.slider.index.sedang.memuat.data")}</Text>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">{t("admin.slider.index.data.tidak.ditemukan")}</Text>
                  </td>
                </tr>
              ) : (
                sortedData.map((item, i) => {
                  const bannerImage = item.image_url || item.image;

                  return (
                    <tr key={item.id} className="table-row-hover" style={{ borderBottom: "1px solid #f8f9fa" }}>
                      <td style={tableCellStyle}>
                        <Text size="xs" c="dimmed">{(page - 1) * PER_PAGE + i + 1}</Text>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ width: 120, height: 60, borderRadius: 8, overflow: "hidden", border: "1px solid #eee", backgroundColor: '#f0f0f0' }}>
                          {bannerImage ? (
                              <img src={bannerImage} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                              <Flex align="center" justify="center" h="100%"><Icon icon="ph:image" className="text-gray-300" /></Flex>
                          )}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <Text size="sm" fw={600} lineClamp={2} maw={250}>{item.name}</Text>
                      </td>
                      <td style={tableCellStyle}>
                        <Text size="xs" c="dimmed" lineClamp={2} maw={300}>{item.description || "-"}</Text>
                      </td>
                      <td style={tableCellStyle}>
                        <Text size="xs" fw={600}>{item.rank ?? "-"}</Text>
                      </td>
                      <td style={tableCellStyle}>
                        <Badge color={item.status === 'active' ? 'green' : 'gray'} variant="light" radius="xs" size="xs">
                          {item.status === 'active' ? t("admin.slider.index.option.active") : (item.status === 'inactive' ? t("admin.slider.index.option.inactive") : (item.status || t("admin.slider.index.option.active")))}
                        </Badge>
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: "center" }}>
                        <Group gap={5} justify="center">
                          <Tooltip label={t("admin.slider.index.edit.slider")}>
                            <ActionIcon variant="filled" color="indigo" onClick={() => handleOpenEdit(item)} size="sm">
                              <Icon icon="ph:pencil-simple" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t("admin.slider.index.hapus.slider")}>
                            <ActionIcon variant="filled" color="red" onClick={() => handleDelete(item.id!)} size="sm">
                              <Icon icon="ph:trash" />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {total > PER_PAGE && (
          <Flex justify="center" p="md" bg="white" style={{ borderTop: "1px solid #eee" }}>
            <PaginationM
              total={Math.ceil(total / PER_PAGE)}
              value={page}
              onChange={setPage}
              color="blue"
              size="sm"
              radius="md"
            />
          </Flex>
        )}
      </Card>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Text fw={600}>{isEdit ? t("admin.slider.index.header.editSlider") : t("admin.slider.index.header.addSlider")}</Text>}
        centered
        size="lg"
      >
        <form onSubmit={handleSubmit}>
            <Stack gap="md">
                <TextInput
                    label={t("admin.slider.index.nama.slider")}
                    placeholder={t("admin.slider.index.masukkan.nama.slider")}
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                />
                <Textarea
                    label={t("admin.slider.index.deskripsi")}
                    placeholder={t("admin.slider.index.masukkan.deskripsi.slider")}
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    minRows={3}
                />
                <Flex gap="md">
                    <Select
                        label={t("admin.slider.index.status")}
                        placeholder={t("admin.slider.index.pilih.status")}
                        data={[
                            { value: 'active', label: t("admin.slider.index.option.active") },
                            { value: 'inactive', label: t("admin.slider.index.option.inactive") }
                        ]}
                        value={status}
                        onChange={(val) => setStatus(val || 'active')}
                        required
                        style={{ flex: 1 }}
                    />
                    <NumberInput
                        label={t("admin.slider.index.rank")}
                        placeholder={t("admin.slider.index.contoh.1")}
                        value={rank}
                        onChange={setRank}
                        style={{ flex: 1 }}
                    />
                </Flex>
                
                <Box>
                    <Text size="sm" fw={500} mb={5}>
                        {t("admin.slider.index.gambar.slider")} {isEdit ? "" : <span className="text-red-500">*</span>}
                    </Text>
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt={t("admin.slider.index.preview")} className="max-w-full h-auto max-h-[200px] object-contain rounded-md" />
                        ) : (
                            <>
                                <Icon icon="ph:upload-simple" className="text-3xl text-gray-400 mb-2" />
                                <Text size="sm" c="dimmed">{t("admin.slider.index.klik.untuk.mengunggah.gambar")}</Text>
                                <Text size="xs" c="dimmed">{t("admin.slider.index.disarankan.rasio.16.9.atau.sejenisnya")}</Text>
                            </>
                        )}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                    />
                </Box>

                <Flex justify="flex-end" gap="sm" mt="md">
                    <ButtonM variant="default" onClick={() => setOpened(false)}>{t("admin.slider.index.batal")}</ButtonM>
                    <ButtonM type="submit" color="blue" loading={isSubmitting}>{t("admin.slider.index.simpan")}</ButtonM>
                </Flex>
            </Stack>
        </form>
      </Modal>
    </div>
  );
}
