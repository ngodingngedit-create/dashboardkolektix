import CreateMerchandiseAdmin from "@/components/CreateMerchandiseAdmin";
import { Delete, Post } from "@/utils/REST";
import { Card, Center, NumberFormatter, Button as ButtonM, Title, Flex, ActionIcon, Switch, Group, Select, Modal, Tooltip, SimpleGrid, Text, Badge, Avatar, Paper, Stack } from "@mantine/core";
import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import NextImage from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { modals } from "@mantine/modals";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import merchIcon from "@/assets/svg/merch.svg";
import Button from "@/components/Button";
import _ from "lodash";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Get } from "@/utils/REST";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

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

// Definisikan tipe untuk merchandise
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

// Tipe untuk creator dari API
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
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // State untuk creator
  const [creators, setCreators] = useState<CreatorAPIResponse[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [selectedCreatorForCreate, setSelectedCreatorForCreate] = useState<string>("");
  const [tempSelectedCreator, setTempSelectedCreator] = useState<string>("");

  // State untuk modal pilih creator
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  // Filter & Search State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Sorting
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Debounced search
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const tabStatus: [number, string][] = [
    [2, "Sedang Dijual"],
    [1, "Merchandise Draf"],
    [3, "Non Aktif"],
  ];

  useEffect(() => {
    setIsRender(true);
  }, []);

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    if (!isRender) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRender, page, selectedCreator, debouncedSearch, startDate, endDate]);

  // Fetch daftar creator dari API
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

  // Fungsi untuk fetch data dengan filter
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
    console.log("Fetching merch with params:", qs);

    Get(`product?${qs}`, {})
      .then((res: any) => {
        if (res.data) {
          const products = Array.isArray(res.data) ? res.data : [];
          const totalLastPage = res?.last_page ?? 1;

          setMerchList(products);
          setLastPage(totalLastPage);
        } else {
          console.warn("Response data is empty or undefined.");
          setMerchList([]);
          setLastPage(1);
        }
        setLoading2(false);
      })
      .catch((err) => {
        console.error("Error fetching merchant data:", err);
        setMerchList([]);
        setLastPage(1);
        setLoading2(false);
      });
  };

  // Fungsi untuk handle search/refresh
  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleRequestSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // Fungsi untuk reset semua filter
  const handleResetFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setCategory("");
    setMethod("");
    setStatusFilter("");
    setLocationFilter("");
    setSelectedCreator("");
    setPage(1);
    fetchData();
  };

  const handleToggleStatus = async (id: number, status: boolean) => {
    const item = merchList.find((p) => p.id === id);

    if (!item) {
      console.warn(`Toggle aborted: product id ${id} not found in current merchList`);
      return;
    }

    setLoading((prev) => [...prev, "toggle-status"]);
    try {
      const res: any = await Post(`product_toggle_status/${id}`, {
        status: status ? 2 : 3,
        admin_override: true,
      });

      if (res?.status) {
        setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
      } else {
        console.warn("Toggle API returned falsy status:", res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => prev.filter((s) => s !== "toggle-status"));
    }
  };

  const handleDelete = (id: number) => {
    const item = merchList.find((p) => p.id === id);
    const itemName = item?.product_name || "produk ini";

    modals.openConfirmModal({
      centered: true,
      title: "Hapus Produk?",
      children: `Apakah anda yakin ingin menghapus produk "${itemName}"?`,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setLoading((prev) => [...prev, `delete${id}`]);
        Delete(`product/${id}`, {
          admin_override: true,
        })
          .then(() => {
            setMerchList((prev) => prev.filter((e) => e.id !== id));
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => setLoading((prev) => prev.filter((s) => s !== `delete${id}`)));
      },
    });
  };

  const splittedByStatus = useMemo(() => {
    return (status: number) => merchList.filter((e) => e.product_status_id === status);
  }, [merchList]);

  const openCreateModal = (slug?: string) => {
    // Jika edit, langsung buka modal dengan creator yang sudah ada
    if (slug) {
      setModalCreate(slug);
      return;
    }

    // Reset temporary selection dan tampilkan modal
    setTempSelectedCreator("");
    setShowCreatorModal(true);
  };

  const handleConfirmCreatorSelection = () => {
    if (!tempSelectedCreator) {
      alert("Silakan pilih creator terlebih dahulu");
      return;
    }

    setSelectedCreatorForCreate(tempSelectedCreator);
    setShowCreatorModal(false);

    // Buka modal create merchandise setelah delay singkat
    setTimeout(() => {
      setModalCreate("");
    }, 100);
  };

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type.includes("excel") ||
        file.type.includes("spreadsheet") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")
      ) {
        setExcelFile(file);

        // Tampilkan modal pilih creator untuk import
        modals.open({
          title: "Import Excel",
          centered: true,
          children: (
            <div className="py-4">
              <p className="mb-4">Import merchandise untuk:</p>
              <Select
                label="Pilih Creator"
                placeholder="Pilih creator"
                data={[
                  { value: "", label: "Semua Creator" },
                  ...creators.map(c => ({
                    value: String(c.id),
                    label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}`
                  }))
                ]}
                value={tempSelectedCreator}
                onChange={(value) => setTempSelectedCreator(value || "")}
                required
              />
              <p className="mt-4 text-sm text-gray-600">
                File: {file.name}
              </p>
              <div className="flex justify-end gap-2 mt-6">
                <ButtonM
                  variant="light"
                  color="gray"
                  onClick={() => modals.closeAll()}
                >
                  Batal
                </ButtonM>
                <ButtonM
                  variant="filled"
                  color="#0B387C"
                  onClick={() => {
                    // Upload ke API
                    const formData = new FormData();
                    formData.append("excel_file", file);
                    if (tempSelectedCreator) {
                      formData.append("creator_id", tempSelectedCreator);
                    }
                    formData.append("admin_import", "true");

                    // Implementasi upload API di sini
                    console.log("Importing file:", file.name, "for creator:", tempSelectedCreator);
                    alert(`File "${file.name}" akan diimport ${tempSelectedCreator ? 'untuk creator terpilih' : 'untuk semua creator'}.`);
                    modals.closeAll();
                  }}
                >
                  Import
                </ButtonM>
              </div>
            </div>
          ),
        } as any);
      } else {
        alert("Silakan pilih file Excel (.xlsx, .xls, atau .csv)");
      }
    }
    event.target.value = "";
  };

  /**
   * ITEM SEARCH SEARCH HELPER
   */

  const itemSearchText = (item: MerchListResponse) => {
    const parts: string[] = [];
    if (item.product_name) parts.push(String(item.product_name));
    if (item.slug) parts.push(String(item.slug));
    if (item.product_varian?.[0]?.sku) parts.push(String(item.product_varian[0].sku));
    if (item.product_varian?.length) parts.push(item.product_varian.map((v: any) => String(v?.sku ?? "")).join(" "));
    if (item.product_varian?.[0]?.price) parts.push(String(item.product_varian[0].price));
    if (item.price) parts.push(String(item.price));
    if (item.qty !== undefined) parts.push(String(item.qty));
    if (item.product_status_id !== undefined) parts.push(String(item.product_status_id));
    if (item.product_image?.length) parts.push(item.product_image.map((p: any) => String(p?.image_url ?? "")).join(" "));
    if (item.has_store_location?.store_name) parts.push(String(item.has_store_location.store_name));
    if (item.has_creator?.name) parts.push(String(item.has_creator.name));
    if (item.has_creator?.username) parts.push(String(item.has_creator.username));
    if (item.has_creator?.email) parts.push(String(item.has_creator.email));

    return parts.join(" ").toLowerCase();
  };

  const filteredMap = useMemo(() => {
    const map = new Map<number, MerchListResponse[]>();
    for (const [status] of tabStatus) {
      const baseList = splittedByStatus(status) || [];
      const filtered = (baseList || []).filter((item) => {
        if (selectedCreator && item.creator_id !== Number(selectedCreator)) return false;

        if (startDate || endDate) {
          const dateStr = (item as any).date || (item as any).created_at || "";
          if (dateStr) {
            const d = new Date(dateStr);
            if (startDate) {
              const s = new Date(startDate);
              if (d < s) return false;
            }
            if (endDate) {
              const e = new Date(endDate);
              e.setHours(23, 59, 59, 999);
              if (d > e) return false;
            }
          }
        }

        if (category) {
          const catField = (item as any).category || (item as any).category_id || "";
          if (!String(catField).toLowerCase().includes(category.toLowerCase())) return false;
        }

        if (method) {
          const m = (item as any).payment_method || (item as any).method || "";
          if (!String(m).toLowerCase().includes(method.toLowerCase())) return false;
        }

        if (statusFilter) {
          if (statusFilter === "active" && item.product_status_id !== 2) return false;
          if (statusFilter === "inactive" && item.product_status_id === 2) return false;
        }

        if (locationFilter) {
          const itemLocation = item.has_store_location?.store_name || "";
          if (!String(itemLocation).toLowerCase().includes(locationFilter.toLowerCase())) {
            return false;
          }
        }

        if (search) {
          const needle = search.toLowerCase().trim();
          if (!itemSearchText(item).includes(needle)) return false;
        }

        return true;
      });

      map.set(status, filtered);
    }
    return map;
  }, [splittedByStatus, startDate, endDate, category, method, statusFilter, locationFilter, search, tabStatus, selectedCreator]);

  // Fungsi untuk mendapatkan nama creator dari ID
  const getCreatorName = (creatorId?: number) => {
    if (!creatorId) return "Unknown";
    const creator = creators.find(c => c.id === creatorId);
    return creator?.name || creator?.has_user?.name || "Unknown";
  };

  // Fungsi untuk mendapatkan email creator dari ID
  const getCreatorEmail = (creatorId?: number) => {
    if (!creatorId) return "";
    const creator = creators.find(c => c.id === creatorId);
    return creator?.has_user?.email || creator?.email || "";
  };

  const sortedList = useMemo(() => {
    let result = [...merchList];

    // Client-side filtering as fallback
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(item =>
        (item.product_name?.toLowerCase().includes(needle)) ||
        (item.has_creator?.name?.toLowerCase().includes(needle)) ||
        (item.product_varian?.some(v => v.sku?.toLowerCase().includes(needle)))
      );
    }

    if (selectedCreator) {
      result = result.filter(item => String(item.creator_id) === String(selectedCreator));
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
  }, [merchList, sortBy, sortDir, debouncedSearch, selectedCreator]);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
      {modalCreate !== undefined && (
        <CreateMerchandiseAdmin
          id={modalCreate}
          creatorId={selectedCreatorForCreate}
          onClose={() => {
            setModalCreate(undefined);
            setSelectedCreatorForCreate("");
            setTempSelectedCreator("");
            fetchData();
          }}
        />
      )}

      {/* Modal Pilih Creatr */}
      <Modal
        opened={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        title="Pilih Creator"
        centered
      >
        <div className="py-4">
          <p className="mb-4">Silakan pilih creator untuk membuat merchandise:</p>
          <Select
            label="Pilih Creator"
            placeholder="Pilih creator"
            data={creators.map(c => ({
              value: String(c.id),
              label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}`
            }))}
            value={tempSelectedCreator}
            onChange={(value) => setTempSelectedCreator(value || "")}
            required
          />
          <div className="flex justify-end gap-2 mt-6">
            <ButtonM
              variant="light"
              color="gray"
              onClick={() => setShowCreatorModal(false)}
            >
              Batal
            </ButtonM>
            <ButtonM
              variant="filled"
              color="#0B387C"
              disabled={!tempSelectedCreator}
              onClick={handleConfirmCreatorSelection}
            >
              Lanjut
            </ButtonM>
          </div>
        </div>
      </Modal>

      <input type="file" id="excel-import-input" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} style={{ display: "none" }} />

      <Flex justify="space-between" align="center" mb={10}>
        <Stack gap={5}>
          <Text size="1.8rem" fw={600}>Merchandise Management</Text>
          <Text size="sm" c="gray">
            {selectedCreator
              ? `Manajemen produk untuk creator: ${getCreatorName(Number(selectedCreator))}`
              : "Kelola semua merchandise dari berbagai creator dalam satu tempat"}
          </Text>
        </Stack>
        <Group gap={12}>
          {/* <ButtonM
            variant="light"
            color="indigo"
            radius="md"
            onClick={() => document.getElementById("excel-import-input")?.click()}
            leftSection={<Icon icon="ph:file-xls" className="text-xl" />}
          >
            Import Excel
          </ButtonM> */}
          <ButtonM
            onClick={() => openCreateModal("")}
            leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
            radius="md"
            color="blue"
            className="shadow-sm"
          >
            Tambah Produk
          </ButtonM>
        </Group>
      </Flex>

      <Tabs
        variant="underlined"
        aria-label="Status Produk"
        classNames={{
          tabList: "gap-6",
          tab: "h-12 px-2 text-gray-500 font-medium hover:text-[#0B387C]",
          cursor: "bg-[#0B387C]",
          tabContent: "group-data-[selected=true]:text-[#0B387C]"
        }}
      >
        {tabStatus.map(([status, label]) => {
          const filtered = filteredMap.get(status) ?? [];

          return (
            <Tab key={status} title={label}>
              <Card withBorder radius="md" p={0} className="mt-4 shadow-sm overflow-hidden">
                <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
                  <div style={{ width: 220 }}>
                    <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Penyelenggara</Text>
                    <Select
                      placeholder="Semua Creator"
                      data={creators.map(c => ({
                        value: String(c.id),
                        label: c.name || c.has_user?.name || "Unknown"
                      }))}
                      value={selectedCreator}
                      onChange={(val) => {
                        setSelectedCreator(val || "");
                        setPage(1);
                      }}
                      size="sm"
                      searchable
                      clearable
                      radius="md"
                    />
                  </div>
                  <div style={{ width: 250 }}>
                    <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Rentang Tanggal</Text>
                    <Flex gap={5}>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setPage(1);
                        }}
                        style={{
                          height: "36px",
                          padding: "0 10px",
                          borderRadius: "8px",
                          border: "1px solid #ced4da",
                          fontSize: "13px",
                          width: "50%"
                        }}
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setPage(1);
                        }}
                        style={{
                          height: "36px",
                          padding: "0 10px",
                          borderRadius: "8px",
                          border: "1px solid #ced4da",
                          fontSize: "13px",
                          width: "50%"
                        }}
                      />
                    </Flex>
                  </div>
                  <div style={{ width: 220 }}>
                    <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Pencarian</Text>
                    <Input
                      isClearable
                      value={search}
                      placeholder="Cari produk..."
                      onChange={(e: any) => setSearch(e.target.value)}
                      onClear={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      size="sm"
                      startContent={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
                    />
                  </div>
                </Flex>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #eee" }}>
                        <th style={tableHeadStyle}>No</th>
                        <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleRequestSort("has_creator.name")}>
                          Creator {sortBy === "has_creator.name" && (sortDir === "asc" ? "↑" : "↓")}
                        </th>
                        <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleRequestSort("product_name")}>
                          Info Produk {sortBy === "product_name" && (sortDir === "asc" ? "↑" : "↓")}
                        </th>
                        <th style={tableHeadStyle}>SKU</th>
                        <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleRequestSort("price")}>
                          Harga {sortBy === "price" && (sortDir === "asc" ? "↑" : "↓")}
                        </th>
                        <th style={tableHeadStyle}>Stok</th>
                        <th style={tableHeadStyle}>Lokasi</th>
                        <th style={{ ...tableHeadStyle, textAlign: "center" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedList.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                            <Text c="dimmed">Data tidak ditemukan</Text>
                          </td>
                        </tr>
                      ) : (
                        sortedList.map((item, i) => {
                          const safeSlug = String(item.slug ?? "");
                          const safeSku = String(item.product_varian?.[0]?.sku ?? "-");
                          const safePriceRaw = String(item.product_varian?.[0]?.price ?? item.price ?? "0");
                          const safePrice = parseInt(safePriceRaw === "" ? "0" : safePriceRaw, 10) || 0;
                          const stock = item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty;
                          const location = item.has_store_location?.store_name || "-";
                          const creatorName = getCreatorName(item.creator_id);
                          const productImage = item.product_image?.[0]?.image_url;

                          return (
                            <tr key={item.id} className="table-row-hover" style={{ borderBottom: "1px solid #f8f9fa" }}>
                              <td style={tableCellStyle}>
                                <Text size="xs" c="dimmed">{(page - 1) * PER_PAGE + i + 1}</Text>
                              </td>
                              <td style={tableCellStyle}>
                                <Group gap="xs" wrap="nowrap">
                                  <Avatar
                                    src={creators.find(c => c.id === item.creator_id)?.image_url}
                                    radius="sm"
                                    size="sm"
                                    color="blue"
                                  >
                                    {creatorName.substring(0, 1)}
                                  </Avatar>
                                  <Text size="xs" fw={700} truncate maw={150}>{creatorName}</Text>
                                </Group>
                              </td>
                              <td style={tableCellStyle}>
                                <Group gap="xs" wrap="nowrap">
                                  {productImage && (
                                    <div style={{ width: 35, height: 35, borderRadius: 4, overflow: "hidden", border: "1px solid #eee" }}>
                                      <img src={productImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                  )}
                                  <Text size="xs" fw={600} lineClamp={1} maw={200}>{item.product_name || "Tanpa Nama"}</Text>
                                </Group>
                              </td>
                              <td style={tableCellStyle}>
                                <Badge color="gray" variant="light" radius="xs" size="xs">{safeSku}</Badge>
                              </td>
                              <td style={tableCellStyle}>
                                <Text size="xs" fw={700} c="blue">
                                  <NumberFormatter value={safePrice} prefix="Rp " thousandSeparator="." />
                                </Text>
                              </td>
                              <td style={tableCellStyle}>
                                <Badge
                                  color={(stock ?? 0) > 10 ? "green" : (stock ?? 0) > 0 ? "orange" : "red"}
                                  variant="filled"
                                  radius="xs"
                                  size="xs"
                                >
                                  {stock ?? 0} Unit
                                </Badge>
                              </td>
                              <td style={tableCellStyle}>
                                <Text size="xs" c="dimmed" truncate maw={100}>{location}</Text>
                              </td>
                              <td style={{ ...tableCellStyle, textAlign: "center" }}>
                                <Group gap={5} justify="center">
                                  <Tooltip label={item.product_status_id === 2 ? "Nonaktifkan" : "Aktifkan"}>
                                    <ActionIcon
                                      variant="filled"
                                      onClick={() => handleToggleStatus(item.id, item.product_status_id !== 2)}
                                      color={item.product_status_id === 2 ? "green" : "gray"}
                                      size="sm"
                                    >
                                      <Icon icon={item.product_status_id === 2 ? "ph:toggle-right-fill" : "ph:toggle-left-fill"} />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Tooltip label="Lihat">
                                    <ActionIcon variant="filled" color="blue" component={Link} href={`/dashboard/merch/${safeSlug}`} size="sm">
                                      <Icon icon="ph:eye" />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Tooltip label="Edit">
                                    <ActionIcon variant="filled" color="indigo" onClick={() => openCreateModal(safeSlug)} size="sm">
                                      <Icon icon="ph:pencil-simple" />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Tooltip label="Hapus">
                                    <ActionIcon variant="filled" color="red" onClick={() => handleDelete(item.id)} size="sm">
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

                {filtered.length === 0 && (
                  <Center mih={300} w="100%" className="bg-gray-50/30">
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                        <Icon icon="ph:package-light" className="text-4xl text-gray-300" />
                      </div>
                      <Title order={3} size="h4" fw={700} className="text-gray-800">
                        Belum ada merchandise
                      </Title>
                      <Text c="dimmed" size="sm" className="max-w-xs mt-2 mb-6">
                        {selectedCreator
                          ? `${getCreatorName(Number(selectedCreator))} belum memiliki produk yang terdaftar di kategori ini.`
                          : "Gunakan tombol di bawah untuk menambahkan produk pertama Anda atau ubah filter pencarian."
                        }
                      </Text>
                      <ButtonM
                        variant="filled"
                        color="#0B387C"
                        radius="md"
                        onClick={() => openCreateModal("")}
                        leftSection={<Icon icon="ph:plus-bold" />}
                      >
                        Tambah Produk Baru
                      </ButtonM>
                    </div>
                  </Center>
                )}

                {filtered.length > 0 && (
                  <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                    <Text size="sm" c="dimmed" fw={500}>
                      Menampilkan <span className="text-gray-700">{Math.min(filtered.length, PER_PAGE)}</span> dari <span className="text-gray-700">{filtered.length}</span> produk
                    </Text>
                    <Group gap={8}>
                      <ButtonM
                        variant="white"
                        color="gray"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        leftSection={<Icon icon="ph:caret-left-bold" />}
                        size="xs"
                        radius="md"
                        className="border border-gray-200"
                      >
                        Sebelumnya
                      </ButtonM>
                      <Paper withBorder px={10} py={4} radius="md" className="bg-white">
                        <Text size="xs" fw={700} className="text-[#0B387C]">
                          {page} <span className="text-gray-400 mx-1">/</span> {lastPage}
                        </Text>
                      </Paper>
                      <ButtonM
                        variant="white"
                        color="gray"
                        disabled={page >= lastPage}
                        onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                        rightSection={<Icon icon="ph:caret-right-bold" />}
                        size="xs"
                        radius="md"
                        className="border border-gray-200"
                      >
                        Berikutnya
                      </ButtonM>
                    </Group>
                  </div>
                )}
              </Card>
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Merch;