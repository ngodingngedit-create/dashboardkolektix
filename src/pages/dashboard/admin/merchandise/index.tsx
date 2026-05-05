import CreateMerchandiseAdmin from "@/components/CreateMerchandiseAdmin";
import { Delete, Post } from "@/utils/REST";
import { Card, Center, NumberFormatter, Button as ButtonM, Title, Flex, ActionIcon, Group, Select, Modal, Tooltip, Text, Badge, Avatar, Paper, Stack } from "@mantine/core";
import { Input } from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";
import { modals } from "@mantine/modals";
import _ from "lodash";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Get } from "@/utils/REST";
import { useDebouncedValue } from "@mantine/hooks";

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

const PER_PAGE = 10;

interface MerchListResponse {
  id: number;
  product_name?: string;
  slug?: string;
  product_status_id: number;
  creator_id?: number;
  price?: number;
  qty?: number;
  product_varian?: Array<{
    sku?: string;
    price?: number | string;
    stock_qty?: number;
  }>;
  product_image?: Array<{
    image_url?: string;
  }>;
  has_store_location?: {
    store_name?: string;
  };
  has_creator?: {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
  };
  created_at?: string;
  date?: string;
}

interface CreatorAPIResponse {
  id: number;
  user_id: string;
  name: string;
  image_url?: string;
  email?: string;
  phone_number?: string;
  has_user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

const Merch: React.FC = () => {
  const [isRender, setIsRender] = useState(false);
  const [modalCreate, setModalCreate] = useState<string | undefined>(undefined);
  const [merchList, setMerchList] = useState<MerchListResponse[]>([]);
  const [loading, setLoading] = useState<string[]>([]);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [creators, setCreators] = useState<CreatorAPIResponse[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [selectedCreatorForCreate, setSelectedCreatorForCreate] = useState<string>("");
  const [tempSelectedCreator, setTempSelectedCreator] = useState<string>("");
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  useEffect(() => {
    setIsRender(true);
    fetchCreators();
  }, []);

  useEffect(() => {
    if (!isRender) return;
    fetchData();
  }, [isRender, page, selectedCreator, debouncedSearch, startDate, endDate]);

  const fetchCreators = async () => {
    try {
      const res: any = await Get('creator', {});
      if (res.data && Array.isArray(res.data)) {
        setCreators(res.data);
      }
    } catch (err) {
      console.error("Error fetching creators:", err);
    }
  };

  const fetchData = () => {
    setLoading2(true);
    const params: any = {
      per_page: String(PER_PAGE),
      page: String(page),
    };
    if (selectedCreator) params.creator_id = selectedCreator;
    if (debouncedSearch) params.search = debouncedSearch;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const qs = new URLSearchParams(params).toString();
    Get(`product?${qs}`, {})
      .then((res: any) => {
        if (res.data) {
          setMerchList(Array.isArray(res.data) ? res.data : []);
          setLastPage(res?.last_page ?? 1);
        } else {
          setMerchList([]);
          setLastPage(1);
        }
      })
      .catch((err) => {
        console.error("Error fetching merchant data:", err);
        setMerchList([]);
        setLastPage(1);
      })
      .finally(() => setLoading2(false));
  };

  const handleRequestSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const handleToggleStatus = async (id: number, status: boolean) => {
    setLoading((prev) => [...prev, "toggle-status"]);
    try {
      const res: any = await Post(`product_toggle_status/${id}`, {
        status: status ? 2 : 3,
        admin_override: true,
      });
      if (res?.status) {
        setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => prev.filter((s) => s !== "toggle-status"));
    }
  };

  const handleDelete = (id: number) => {
    const item = merchList.find((p) => p.id === id);
    modals.openConfirmModal({
      centered: true,
      title: "Hapus Produk?",
      children: `Apakah anda yakin ingin menghapus produk "${item?.product_name || "ini"}"?`,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        Delete(`product/${id}`, { admin_override: true })
          .then(() => setMerchList((prev) => prev.filter((e) => e.id !== id)))
          .catch(console.error);
      },
    });
  };

  const openCreateModal = (slug?: string) => {
    if (slug) {
      setModalCreate(slug);
      return;
    }
    setTempSelectedCreator("");
    setShowCreatorModal(true);
  };

  const handleConfirmCreatorSelection = () => {
    if (!tempSelectedCreator) return;
    setSelectedCreatorForCreate(tempSelectedCreator);
    setShowCreatorModal(false);
    setTimeout(() => setModalCreate(""), 100);
  };

  const getCreatorName = (creatorId?: number) => {
    if (!creatorId) return "Unknown";
    const creator = creators.find(c => c.id === creatorId);
    return creator?.name || creator?.has_user?.name || "Unknown";
  };

  const filteredList = useMemo(() => {
    return (merchList || []).filter((item) => {
      if (selectedCreator && item.creator_id !== Number(selectedCreator)) return false;
      if (search && !item.product_name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [merchList, selectedCreator, search]);

  const sortedList = useMemo(() => {
    let result = [...filteredList];
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
  }, [filteredList, sortBy, sortDir]);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
      {modalCreate !== undefined && (
        <CreateMerchandiseAdmin
          id={modalCreate}
          creatorId={selectedCreatorForCreate}
          onClose={() => {
            setModalCreate(undefined);
            setSelectedCreatorForCreate("");
            fetchData();
          }}
        />
      )}

      <Modal opened={showCreatorModal} onClose={() => setShowCreatorModal(false)} title="Pilih Creator" centered>
        <div className="py-4">
          <Select
            label="Pilih Creator"
            placeholder="Pilih creator"
            data={creators.map(c => ({
              value: String(c.id),
              label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}`
            }))}
            value={tempSelectedCreator}
            onChange={(value) => setTempSelectedCreator(value || "")}
          />
          <div className="flex justify-end gap-2 mt-6">
            <ButtonM variant="light" color="gray" onClick={() => setShowCreatorModal(false)}>Batal</ButtonM>
            <ButtonM variant="filled" color="#0B387C" disabled={!tempSelectedCreator} onClick={handleConfirmCreatorSelection}>Lanjut</ButtonM>
          </div>
        </div>
      </Modal>

      <Flex justify="space-between" align="center">
        <Stack gap={5}>
          <Text size="1.8rem" fw={600}>Merchandise Management</Text>
          <Text size="sm" c="gray">Kelola semua merchandise dari berbagai creator dalam satu tempat</Text>
        </Stack>
        <ButtonM onClick={() => openCreateModal("")} leftSection={<Icon icon="ph:plus-bold" />} radius="md" color="blue">
          Tambah Produk
        </ButtonM>
      </Flex>

      <Card withBorder radius="md" p={0} className="shadow-sm overflow-hidden mt-4">
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }} wrap="wrap">
          <div style={{ width: 220 }}>
            <Select
              label="Penyelenggara"
              placeholder="Semua Creator"
              data={creators.map(c => ({ value: String(c.id), label: c.name || "Unknown" }))}
              value={selectedCreator}
              onChange={(val) => { setSelectedCreator(val || ""); setPage(1); }}
              size="sm" searchable clearable radius="md"
            />
          </div>
          <div style={{ width: 250 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4}>Rentang Tanggal</Text>
            <Flex gap={5}>
              <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} style={{ height: "36px", padding: "0 10px", borderRadius: "8px", border: "1px solid #ced4da", fontSize: "13px", width: "50%" }} />
              <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} style={{ height: "36px", padding: "0 10px", borderRadius: "8px", border: "1px solid #ced4da", fontSize: "13px", width: "50%" }} />
            </Flex>
          </div>
          <div style={{ width: 220 }}>
            <Input
              label="Pencarian"
              value={search}
              placeholder="Cari produk..."
              onChange={(e: any) => setSearch(e.target.value)}
              size="sm"
              startContent={<Icon icon="ph:magnifying-glass" />}
            />
          </div>
        </Flex>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #eee" }}>
                <th style={tableHeadStyle}>No</th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleRequestSort("has_creator.name")}>Creator</th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleRequestSort("product_name")}>Info Produk</th>
                <th style={tableHeadStyle}>SKU</th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleRequestSort("price")}>Harga</th>
                <th style={tableHeadStyle}>Stok</th>
                <th style={tableHeadStyle}>Lokasi</th>
                <th style={tableHeadStyle}>Status</th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading2 ? (
                <tr><td colSpan={9} style={{ padding: "40px", textAlign: "center" }}><Text>Loading...</Text></td></tr>
              ) : sortedList.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: "40px", textAlign: "center" }}><Text c="dimmed">Data tidak ditemukan</Text></td></tr>
              ) : (
                sortedList.map((item, i) => {
                  const safeSlug = String(item.slug ?? "");
                  const safeSku = String(item.product_varian?.[0]?.sku ?? "-");
                  const safePrice = parseInt(String(item.product_varian?.[0]?.price ?? item.price ?? "0"), 10) || 0;
                  const stock = item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty;
                  const statusId = item.product_status_id;
                  let statusLabel = "Tidak Aktif";
                  let statusColor = "red";
                  if (statusId === 2) { statusLabel = "Aktif"; statusColor = "green"; }
                  else if (statusId === 1) { statusLabel = "Draf"; statusColor = "blue"; }

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f8f9fa" }}>
                      <td style={tableCellStyle}>{(page - 1) * PER_PAGE + i + 1}</td>
                      <td style={tableCellStyle}>{getCreatorName(item.creator_id)}</td>
                      <td style={tableCellStyle}>{item.product_name}</td>
                      <td style={tableCellStyle}><Badge color="gray" variant="light" size="xs">{safeSku}</Badge></td>
                      <td style={tableCellStyle}><NumberFormatter value={safePrice} prefix="Rp " thousandSeparator="." /></td>
                      <td style={tableCellStyle}><Badge color={(stock ?? 0) > 0 ? "green" : "red"} size="xs">{stock ?? 0} Unit</Badge></td>
                      <td style={tableCellStyle}>{item.has_store_location?.store_name || "-"}</td>
                      <td style={tableCellStyle}><Badge color={statusColor} variant="light" size="xs">{statusLabel}</Badge></td>
                      <td style={{ ...tableCellStyle, textAlign: "center" }}>
                        <Group gap={5} justify="center">
                          <ActionIcon variant="filled" color={statusId === 2 ? "green" : "gray"} onClick={() => handleToggleStatus(item.id, statusId !== 2)} size="sm">
                            <Icon icon={statusId === 2 ? "ph:toggle-right-fill" : "ph:toggle-left-fill"} />
                          </ActionIcon>
                          <ActionIcon variant="filled" color="indigo" onClick={() => openCreateModal(safeSlug)} size="sm">
                            <Icon icon="ph:pencil-simple" />
                          </ActionIcon>
                          <ActionIcon variant="filled" color="red" onClick={() => handleDelete(item.id)} size="sm">
                            <Icon icon="ph:trash" />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {sortedList.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-light-grey bg-gray-50/30">
            <Text size="sm" c="dimmed">Menampilkan {sortedList.length} produk</Text>
            <Group gap={8}>
              <ButtonM variant="white" color="gray" disabled={page <= 1} onClick={() => setPage(p => p - 1)} size="xs">Sebelumnya</ButtonM>
              <Text size="xs" fw={700}>{page} / {lastPage}</Text>
              <ButtonM variant="white" color="gray" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)} size="xs">Berikutnya</ButtonM>
            </Group>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Merch;