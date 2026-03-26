import CreateMerchandiseAdmin from "@/components/CreateMerchandiseAdmin";
import { Delete, Post } from "@/utils/REST";
import { Card, Center, NumberFormatter, Button as ButtonM, Title, Flex, ActionIcon, Switch, Group, Select, Modal, Tooltip, SimpleGrid, Text, Badge, Avatar, Paper } from "@mantine/core";
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

  const tabStatus: [number, string][] = [
    [2, "Sedang Dijual"],
    [1, "Merchandise Draf"],
    [3, "Non Aktif"],
  ];

  useEffect(() => {
    setIsRender(true);
  }, []);

  useEffect(() => {
    if (!isRender) return;
    fetchData();
    fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRender, page, selectedCreator]);

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

    const qs = new URLSearchParams({
      per_page: String(PER_PAGE),
      page: String(page),
      ...(selectedCreator && { creator_id: selectedCreator }),
      ...(search && { search: search }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    }).toString();

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
   * FILTER & SEARCH STATE
   */
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

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

  return (
    <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
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

      {/* Modal Pilih Creator */}
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title order={1} size="h2" className="text-[#0B387C]">
            Merchandise Management
          </Title>
          <Text size="sm" c="dimmed">
            {selectedCreator 
              ? `Manajemen produk untuk creator: ${getCreatorName(Number(selectedCreator))}` 
              : "Kelola semua merchandise dari berbagai creator dalam satu tempat"}
          </Text>
        </div>

        <Group gap={12}>
          <ButtonM
            variant="light"
            color="indigo"
            radius="md"
            onClick={() => document.getElementById("excel-import-input")?.click()}
            leftSection={<Icon icon="ph:file-xls" className="text-xl" />}
          >
            Import Excel
          </ButtonM>
          <ButtonM 
            onClick={() => openCreateModal("")} 
            leftSection={<Icon icon="ph:plus-bold" className="text-lg" />} 
            radius="md" 
            color="#0B387C"
            className="shadow-sm"
          >
            Tambah Produk
          </ButtonM>
        </Group>
      </div>

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
                <div className="p-5 bg-gray-50/50">
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                    <div className="flex flex-col gap-1.5">
                      <Text size="xs" fw={600} c="dimmed" className="uppercase tracking-wider">Pencarian</Text>
                      <Input
                        isClearable
                        value={search}
                        onChange={(e: any) => setSearch(e.target.value)}
                        onClear={() => {
                          setSearch("");
                          setPage(1);
                        }}
                        placeholder="Cari nama, SKU, atau Creator..."
                        size="sm"
                        startContent={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Text size="xs" fw={600} c="dimmed" className="uppercase tracking-wider">Creator</Text>
                      <Select
                        placeholder="Semua Creator"
                        data={creators.map(c => ({ 
                          value: String(c.id), 
                          label: `${c.name}${c.has_user?.email ? ` (${c.has_user.email})` : ''}` 
                        }))}
                        value={selectedCreator}
                        onChange={(value) => {
                          setSelectedCreator(value || "");
                          setPage(1);
                          // Trigging fetchData indirectly via useEffect/search logic
                          // or explicitly if needed.
                        }}
                        size="sm"
                        variant="filled"
                        clearable
                        searchable
                        leftSection={<Icon icon="ph:user" className="text-gray-400" />}
                        className="w-full"
                        styles={{
                          input: { backgroundColor: '#f1f3f5', border: 'none' }
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Text size="xs" fw={600} c="dimmed" className="uppercase tracking-wider">Rentang Tanggal</Text>
                      <Group gap={8} grow>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-[36px] bg-gray-100/50 border-none rounded-md px-2 text-xs focus:ring-1 focus:ring-[#0B387C] outline-none"
                        />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-[36px] bg-gray-100/50 border-none rounded-md px-2 text-xs focus:ring-1 focus:ring-[#0B387C] outline-none"
                        />
                      </Group>
                    </div>

                    <div className="flex items-end gap-2">
                      <ButtonM
                        variant="filled"
                        color="#0B387C"
                        onClick={handleSearch}
                        leftSection={<Icon icon="ph:funnel" className="text-lg" />}
                        loading={loading2}
                        size="sm"
                        className="flex-1"
                      >
                        Filter
                      </ButtonM>
                      <Tooltip label="Reset semua filter">
                        <ActionIcon
                          variant="light"
                          color="gray"
                          onClick={handleResetFilters}
                          size="lg"
                          radius="md"
                        >
                          <Icon icon="ph:arrow-counter-clockwise" className="text-xl" />
                        </ActionIcon>
                      </Tooltip>
                    </div>
                  </SimpleGrid>
                </div>

                <div className="bg-white rounded-[8px] overflow-hidden">
                  <Table 
                    removeWrapper 
                    className="rounded-[8px] [&_td]:py-[15px] min-w-[900px]"
                    aria-label="Table merchandise"
                  >
                    <TableHeader>
                      <TableColumn>No</TableColumn>
                      <TableColumn>Creator</TableColumn>
                      <TableColumn>Info Produk</TableColumn>
                      <TableColumn>SKU</TableColumn>
                      <TableColumn>Harga</TableColumn>
                      <TableColumn>Stock</TableColumn>
                      <TableColumn>Lokasi</TableColumn>
                      <TableColumn>Aksi</TableColumn>
                    </TableHeader>

                    <TableBody 
                      emptyContent={null}
                    >
                      {filtered.map((item, i) => {
                          const safeId = String(item.id ?? i);
                          const safeSlug = String(item.slug ?? "");
                          const safeSku = String(item.product_varian?.[0]?.sku ?? "-");
                          const safePriceRaw = String(item.product_varian?.[0]?.price ?? item.price ?? "0");
                          const safePrice = parseInt(safePriceRaw === "" ? "0" : safePriceRaw, 10) || 0;
                          const stock = item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty;
                          const location = item.has_store_location?.store_name || "-";
                          const creatorName = getCreatorName(item.creator_id);
                          const creatorEmail = getCreatorEmail(item.creator_id);
                          const productImage = item.product_image?.[0]?.image_url;

                          return (
                            <TableRow key={safeId} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell className="text-gray-400 font-medium">{((page - 1) * PER_PAGE) + i + 1}</TableCell>

                              <TableCell>
                                <Group gap="sm" wrap="nowrap">
                                  <Avatar 
                                    src={creators.find(c => c.id === item.creator_id)?.image_url} 
                                    radius="xl" 
                                    size="sm"
                                    color="#0B387C"
                                  >
                                    {creatorName.substring(0, 1)}
                                  </Avatar>
                                  <div className="flex flex-col min-w-0">
                                    <Text size="sm" fw={600} truncate className="text-gray-800">{creatorName}</Text>
                                    {creatorEmail && (
                                      <Text size="xs" c="dimmed" truncate>{creatorEmail}</Text>
                                    )}
                                  </div>
                                </Group>
                              </TableCell>

                              <TableCell>
                                <Group gap="sm" wrap="nowrap">
                                  <div className="w-10 h-10 rounded-md border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                                    {productImage ? (
                                      <img src={productImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Center className="h-full">
                                        <Icon icon="ph:package" className="text-gray-300 text-xl" />
                                      </Center>
                                    )}
                                  </div>
                                  <Text size="sm" fw={500} lineClamp={2} className="text-gray-800 max-w-[200px]">
                                    {String(item.product_name ?? "Produk Tanpa Nama")}
                                  </Text>
                                </Group>
                              </TableCell>

                              <TableCell>
                                <Text size="xs" fw={600} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-tighter inline-block">
                                  {safeSku === "-" ? "N/A" : safeSku}
                                </Text>
                              </TableCell>

                              <TableCell>
                                <Text size="sm" fw={700} className="text-[#0B387C]">
                                  <NumberFormatter value={safePrice} prefix="Rp " thousandSeparator="." decimalSeparator="," />
                                </Text>
                              </TableCell>

                              <TableCell>
                                <Badge 
                                  variant="light" 
                                  color={(stock ?? 0) > 10 ? "green" : (stock ?? 0) > 0 ? "orange" : "red"}
                                  radius="sm"
                                >
                                  {stock ?? 0} Unit
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <Group gap={4} wrap="nowrap" className="text-gray-600">
                                  <Icon icon="ph:map-pin" className="text-gray-400" />
                                  <Text size="xs" fw={500} truncate className="max-w-[120px]">{String(location)}</Text>
                                </Group>
                              </TableCell>

                              <TableCell>
                                <Group gap={8} wrap="nowrap">
                                  <Tooltip label={item.product_status_id === 2 ? "Nonaktifkan Produk" : "Aktifkan Produk"}>
                                    <ActionIcon 
                                      variant="subtle" 
                                      onClick={() => handleToggleStatus(item.id, item.product_status_id !== 2)}
                                      color={item.product_status_id === 2 ? "green" : "gray"}
                                      size="md"
                                    >
                                      <Icon 
                                        icon={item.product_status_id === 2 ? "ph:toggle-right-fill" : "ph:toggle-left"} 
                                        className="text-[26px]"
                                      />
                                    </ActionIcon>
                                  </Tooltip>
                                  
                                  <Tooltip label="Lihat Produk">
                                    <ActionIcon variant="subtle" color="blue" component={Link} href={`/dashboard/merch/${safeSlug}`} size="md">
                                      <Icon icon="ph:eye" className="text-xl" />
                                    </ActionIcon>
                                  </Tooltip>

                                  <Tooltip label="Edit Produk">
                                    <ActionIcon variant="subtle" color="indigo" onClick={() => openCreateModal(safeSlug)} size="md">
                                      <Icon icon="ph:pencil-simple" className="text-xl" />
                                    </ActionIcon>
                                  </Tooltip>

                                  <Tooltip label="Hapus Produk">
                                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.id)} size="md">
                                      <Icon icon="ph:trash" className="text-xl" />
                                    </ActionIcon>
                                  </Tooltip>
                                </Group>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
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