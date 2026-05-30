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
        title: "Gagal",
        message: "Gagal mengambil data slider. Silakan coba lagi.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    const item = data.find(v => v.id === id);
    const itemName = item?.name || "slider ini";

    modals.openConfirmModal({
      centered: true,
      title: "Hapus Slider?",
      children: `Apakah anda yakin ingin menghapus slider "${itemName}"? Tindakan ini tidak dapat dibatalkan.`,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await Delete(`slider/${id}`, { admin_override: true });
          notifications.show({
            title: "Berhasil",
            message: "Slider berhasil dihapus",
            color: "green",
          });
          fetchData();
        } catch (err) {
          console.error(err);
          notifications.show({
            title: "Gagal",
            message: "Gagal menghapus slider",
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
            title: "Peringatan",
            message: "Nama dan Gambar wajib diisi!",
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
                title: "Berhasil",
                message: "Slider berhasil diupdate",
                color: "green"
            });
        } else {
            await Post(`slider`, payload);
            notifications.show({
                title: "Berhasil",
                message: "Slider berhasil ditambahkan",
                color: "green"
            });
        }
        setOpened(false);
        fetchData();
    } catch (error) {
        console.error(error);
        notifications.show({
            title: "Gagal",
            message: "Terjadi kesalahan saat menyimpan slider",
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
        <Stack gap={5}>
          <Text size="1.8rem" fw={600}>Slider Management</Text>
          <Text size="sm" c="gray">
            Kelola banner slider yang ditampilkan di halaman utama
          </Text>
        </Stack>
        <ButtonM
          onClick={handleOpenCreate}
          leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
          radius="md"
          color="blue"
          className="shadow-sm"
        >
          Tambah Slider
        </ButtonM>
      </Flex>

      <Card withBorder radius="md" p={0} className="shadow-sm overflow-hidden border-light-grey">
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <div style={{ width: 220 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Pencarian</Text>
            <Input
              isClearable
              value={search}
              placeholder="Cari slider..."
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
                <th style={tableHeadStyle}>No</th>
                <th style={tableHeadStyle}>Banner</th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("name")}>
                  Nama Slider {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("description")}>
                  Deskripsi {sortBy === "description" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("rank")}>
                  Rank {sortBy === "rank" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">Sedang memuat data...</Text>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">Data tidak ditemukan</Text>
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
                          {item.status === 'active' ? 'Aktif' : (item.status === 'inactive' ? 'Tidak Aktif' : (item.status || 'Aktif'))}
                        </Badge>
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: "center" }}>
                        <Group gap={5} justify="center">
                          <Tooltip label="Edit Slider">
                            <ActionIcon variant="filled" color="indigo" onClick={() => handleOpenEdit(item)} size="sm">
                              <Icon icon="ph:pencil-simple" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Hapus Slider">
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
        title={<Text fw={600}>{isEdit ? "Edit Slider" : "Tambah Slider"}</Text>}
        centered
        size="lg"
      >
        <form onSubmit={handleSubmit}>
            <Stack gap="md">
                <TextInput
                    label="Nama Slider"
                    placeholder="Masukkan nama slider"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                />
                <Textarea
                    label="Deskripsi"
                    placeholder="Masukkan deskripsi slider"
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    minRows={3}
                />
                <Flex gap="md">
                    <Select
                        label="Status"
                        placeholder="Pilih status"
                        data={[
                            { value: 'active', label: 'Aktif' },
                            { value: 'inactive', label: 'Tidak Aktif' }
                        ]}
                        value={status}
                        onChange={(val) => setStatus(val || 'active')}
                        required
                        style={{ flex: 1 }}
                    />
                    <NumberInput
                        label="Rank"
                        placeholder="Contoh: 1"
                        value={rank}
                        onChange={setRank}
                        style={{ flex: 1 }}
                    />
                </Flex>
                
                <Box>
                    <Text size="sm" fw={500} mb={5}>
                        Gambar Slider {isEdit ? "" : <span className="text-red-500">*</span>}
                    </Text>
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-w-full h-auto max-h-[200px] object-contain rounded-md" />
                        ) : (
                            <>
                                <Icon icon="ph:upload-simple" className="text-3xl text-gray-400 mb-2" />
                                <Text size="sm" c="dimmed">Klik untuk mengunggah gambar</Text>
                                <Text size="xs" c="dimmed">Disarankan rasio 16:9 atau sejenisnya</Text>
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
                    <ButtonM variant="default" onClick={() => setOpened(false)}>Batal</ButtonM>
                    <ButtonM type="submit" color="blue" loading={isSubmitting}>Simpan</ButtonM>
                </Flex>
            </Stack>
        </form>
      </Modal>
    </div>
  );
}
