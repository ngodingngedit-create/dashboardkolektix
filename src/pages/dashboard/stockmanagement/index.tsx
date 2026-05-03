import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Get } from "@/utils/REST";
import fetch from "@/utils/fetch";
import { notifications } from "@mantine/notifications";
import { useListState } from "@mantine/hooks";
import {
  Card,
  Title,
  Text,
  TextInput,
  Flex,
  Box,
  Select,
  ActionIcon,
  NumberInput,
  Autocomplete,
  Button,
  Badge,
  Group,
  Divider,
  ScrollArea,
  Tabs,
  Stack,
  Pagination
} from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSort, 
  faSortUp, 
  faSortDown, 
  faArrowsRotate, 
  faPencil, 
  faEye,
  faPlus 
} from "@fortawesome/free-solid-svg-icons";
import TableData from "@/components/TableData";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import useLoggedUser from "@/utils/useLoggedUser";

const REFERENCE_TYPE_DIRECTION: Record<string, "add" | "reduce"> = {
  restock_supplier: "add",
  produksi_internal: "add",
  return_customer: "add",
  order: "reduce",
  return_supplier: "reduce",
  damaged: "reduce",
};

const REFERENCE_TYPE_OPTIONS = [
  { value: "restock_supplier", label: "Restock dari Supplier" },
  { value: "produksi_internal", label: "Hasil Produksi Internal" },
  { value: "order", label: "Pesanan Customer" },
  { value: "return_customer", label: "Retur dari Customer" },
  { value: "return_supplier", label: "Retur ke Supplier" },
  { value: "damaged", label: "Barang Rusak/Hilang" },
];

interface SelectedProduct {
  id: string;
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  sku: string;
  initial_stock: number;
  qty: number;
  referenceType: string;
  notes: string;
  creator_name?: string;
}

const CELL_STYLE: React.CSSProperties = {
  padding: "18px 16px",
  verticalAlign: "top",
};

const StockManagement = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [productsData, setProductsData] = useState<any[]>([]);
  const [allProductsData, setAllProductsData] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useListState<string>([]);
  const [submitting, setSubmitting] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [selectedProductFilter, setSelectedProductFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>("desc");
  const [tableState, setTableState] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 10 });

  const productOptions = useMemo(() => {
    if (!allProductsData) return [];
    return allProductsData.map((p) => ({
      value: p.id.toString(),
      label: p.product_name,
    }));
  }, [allProductsData]);

  const filteredHistory = useMemo(() => {
    return historyData.filter((h) => {
      const productName = h.variant
        ? `${h.product?.product_name || "-"} - ${h.variant.varian_name}`
        : h.product?.product_name || h.product || "-";

      const matchesSearch =
        productName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        (h.reference_type || h.reference || "").toLowerCase().includes(historySearchQuery.toLowerCase());

      const matchesProduct =
        selectedProductFilter === "all" ||
        h.product_id?.toString() === selectedProductFilter ||
        h.product?.id?.toString() === selectedProductFilter;

    return matchesSearch && matchesProduct;
    });
  }, [historyData, historySearchQuery, selectedProductFilter]);

  const sortedHistory = useMemo(() => {
    let result = [...filteredHistory];
    if (sortBy && sortDir) {
      result.sort((a, b) => {
        let valA: any = "";
        let valB: any = "";
        
        if (sortBy === 'date') {
          valA = new Date(a.created_at || a.date || "").getTime();
          valB = new Date(b.created_at || b.date || "").getTime();
        } else if (sortBy === 'reference') {
          valA = (a.reference_type || a.reference || "").toLowerCase();
          valB = (b.reference_type || b.reference || "").toLowerCase();
        } else if (sortBy === 'product') {
          valA = (a.variant ? `${a.product?.product_name || "-"} - ${a.variant.varian_name}` : a.product?.product_name || a.product || "-").toLowerCase();
          valB = (b.variant ? `${b.product?.product_name || "-"} - ${b.variant.varian_name}` : b.product?.product_name || b.product || "-").toLowerCase();
        }

        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [filteredHistory, sortBy, sortDir]);

  const pagedHistory = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedHistory.slice(start, start + rowsPerPage);
  }, [sortedHistory, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedHistory.length / rowsPerPage);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ active, dir }: { active: boolean, dir: 'asc' | 'desc' | null }) => {
    if (!active || !dir) return <FontAwesomeIcon icon={faSort} size="xs" style={{ color: '#adb5bd', opacity: 0.5 }} />;
    return <FontAwesomeIcon icon={dir === 'asc' ? faSortUp : faSortDown} size="xs" style={{ color: '#228be6' }} />;
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inline variant dropdown state
  const [pendingBaseProduct, setPendingBaseProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const user = useLoggedUser();

  useEffect(() => {
    if (user?.has_creator?.id) {
      fetchProducts(user.has_creator.id);
      fetchHistory(user.has_creator.id);
    }
  }, [user]);

  // Client-side filtering with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!searchQuery.trim()) {
        setProductsData(allProductsData);
      } else {
        const q = searchQuery.toLowerCase();
        setProductsData(
          allProductsData.filter((p) =>
            (p.product_name || "").toLowerCase().includes(q) ||
            (p.sku || "").toLowerCase().includes(q)
          )
        );
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, allProductsData]);

  const fetchHistory = async (creatorId: number) => {
    setLoading.append("getdata");
    try {
      const res: any = await Get("stock-management", { creator_id: creatorId });
      if (res?.data) {
        const raw = Array.isArray(res.data) ? res.data : res.data.data || [];
        // Filter client-side as a safeguard to ensure only movements for this creator's products are shown
        const filtered = raw.filter((h: any) => {
            const prodCreatorId = h.product?.creator_id || h.creator_id;
            return String(prodCreatorId) === String(creatorId);
        });
        setHistoryData(filtered);
      }
    } catch (e) {
      console.error("Failed to fetch history:", e);
    } finally {
      setLoading.filter((e) => e !== "getdata");
    }
  };

  const fetchProducts = async (creatorId: number) => {
    setLoading.append("getproducts");
    try {
      // First fetch to get pagination info
      const firstRes: any = await Get("product-bymerchant", { creator_id: creatorId, per_page: 20, page: 1 });
      const firstData = firstRes?.data?.data ?? firstRes?.data ?? [];
      const lastPage: number = firstRes?.data?.last_page ?? firstRes?.last_page ?? 1;

      let allProducts: any[] = Array.isArray(firstData) ? firstData : [];

      // Fetch remaining pages in parallel
      if (lastPage > 1) {
        const pageRequests = [];
        for (let p = 2; p <= lastPage; p++) {
          pageRequests.push(Get("product-bymerchant", { creator_id: creatorId, per_page: 20, page: p }));
        }
        const pageResults = await Promise.all(pageRequests);
        pageResults.forEach((res: any) => {
          const pageData = res?.data?.data ?? res?.data ?? [];
          if (Array.isArray(pageData)) allProducts = allProducts.concat(pageData);
        });
      }

      const filtered = allProducts.filter((p: any) => !p.creator_id || String(p.creator_id) === String(creatorId));
      setAllProductsData(filtered);
      setProductsData(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading.filter((e) => e !== "getproducts");
    }
  };


  // One entry per BASE PRODUCT only
  const baseProductOptions = (() => {
    const seen = new Set<string>();
    return productsData
      .filter((p) => {
        if (seen.has(p.product_name)) return false;
        seen.add(p.product_name);
        return true;
      })
      .map((p) => p.product_name);
  })();

  const handleProductOptionSubmit = (val: string) => {
    setTimeout(() => setSearchQuery(""), 0);

    const baseProduct = productsData.find((p) => p.product_name === val);
    if (!baseProduct) return;

    const variants = baseProduct.product_varian || baseProduct.productVarian || [];

    if (variants.length > 0) {
      setPendingBaseProduct(baseProduct);
      setSelectedVariantId(null);
    } else {
      addProductToTable(baseProduct, null, null);
      setPendingBaseProduct(null);
      setSelectedVariantId(null);
    }
  };

  const handleVariantSelect = (variantId: string | null) => {
    if (!variantId || !pendingBaseProduct) return;
    const variants = pendingBaseProduct.product_varian || pendingBaseProduct.productVarian || [];
    const variantData = variants.find((v: any) => String(v.id) === variantId);
    addProductToTable(pendingBaseProduct, Number(variantId), variantData);
    setPendingBaseProduct(null);
    setSelectedVariantId(null);
  };

  const addProductToTable = (
    baseProduct: any,
    variantId: number | null,
    variantData: any | null
  ) => {
    const rowId = `${baseProduct.id}-${variantId ?? "base"}`;

    setSelectedProducts((prev) => {
      if (prev.find((p) => p.id === rowId)) {
        notifications.show({
          title: "Info",
          message: "Produk/varian sudah ada dalam daftar",
          color: "blue",
        });
        return prev;
      }

      const displayName = variantData
        ? `${baseProduct.product_name} - ${variantData.varian_name || variantData.name}`
        : baseProduct.product_name;
      const sku = variantData ? variantData.sku || "-" : baseProduct.sku || "-";
      const stock = variantData
        ? variantData.stock_summary?.sisa_stock ?? variantData.stock_qty ?? variantData.stock ?? 0
        : baseProduct.qty ?? 0;

      return [
        ...prev,
        {
          id: rowId,
          product_id: baseProduct.id,
          variant_id: variantId,
          product_name: displayName,
          sku,
          initial_stock: stock,
          qty: 0,
          referenceType: "restock_supplier",
          notes: "",
          creator_name: baseProduct.creator?.name || String(baseProduct.creator_id || '-'),
        },
      ];
    });
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const handleRowChange = (id: string, field: keyof SelectedProduct, val: any) => {
    setSelectedProducts(
      selectedProducts.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const getDirection = (refType: string) => REFERENCE_TYPE_DIRECTION[refType] ?? "add";

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      notifications.show({ title: "Error", message: "Belum ada produk yang dipilih!", color: "red" });
      return;
    }

    const hasQty = selectedProducts.some((p) => p.qty > 0);
    if (!hasQty) {
      notifications.show({ title: "Error", message: "Silakan isi Qty untuk setidaknya satu produk!", color: "red" });
      return;
    }

    const productsMap = new Map<number, any>();
    selectedProducts.forEach((p) => {
      if (p.qty === 0) return;
      if (!productsMap.has(p.product_id)) {
        productsMap.set(p.product_id, { product_id: p.product_id, stocks: [] });
      }
      const direction = getDirection(p.referenceType);
      productsMap.get(p.product_id).stocks.push({
        product_varian_id: p.variant_id,
        stock_status_id: direction === "add" ? 2 : 3,
        qty: p.qty,
        reference_type: p.referenceType,
        notes: p.notes,
      });
    });

    const productsPayload = Array.from(productsMap.values());
    if (productsPayload.length === 0) {
      notifications.show({ title: "Error", message: "Silakan isi Qty terlebih dahulu!", color: "red" });
      return;
    }

    setSubmitting(true);
    try {
      await fetch({
        url: "stock-management/stock-movement",
        method: "POST",
        data: { products: productsPayload, created_by: user?.name || user?.has_creator?.name || "system" },
        before: () => { },
        success: () => {
          notifications.show({ title: "Sukses", message: "Perubahan stock berhasil disimpan!", color: "green" });
          setSelectedProducts([]);
          setIsFormVisible(false);
          if (user?.has_creator?.id) {
            fetchProducts(user.has_creator.id);
            fetchHistory(user.has_creator.id);
          }
        },
        error: (err: any) => {
          notifications.show({ title: "Error", message: err?.message || "Gagal menyimpan perubahan stock", color: "red" });
        },
        complete: () => setSubmitting(false),
      });
    } catch {
      setSubmitting(false);
    }
  };

  // History data uses API now

  const renderHistory = () => (
    <Box mt={0}>
      <Stack gap="xs" mb="md">
        <Flex align="center" justify="space-between" wrap="wrap" gap="sm">
          <Group gap="sm">
            <Select
              value={rowsPerPage.toString()}
              onChange={(val) => {
                setRowsPerPage(Number(val));
                setCurrentPage(1);
              }}
              data={["10", "20", "50", "100"]}
              style={{ width: 80 }}
              size="sm"
            />
          </Group>

          <Group gap="sm">
            <Select
              placeholder="Semua Produk"
              data={[{ value: "all", label: "Semua Produk" }, ...productOptions]}
              value={selectedProductFilter}
              onChange={(val) => {
                setSelectedProductFilter(val || "all");
                setCurrentPage(1);
              }}
              style={{ minWidth: 200 }}
              size="sm"
              searchable
              clearable
            />
            <TextInput
              placeholder="Cari data..."
              leftSection={<Icon icon="uiw:search" width={14} />}
              value={historySearchQuery}
              onChange={(e) => {
                setHistorySearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              size="sm"
              style={{ minWidth: 250 }}
            />
            <Button 
              variant="filled" 
              color="blue" 
              size="sm"
              onClick={() => user?.has_creator?.id && fetchHistory(user.has_creator.id)} 
              loading={loading.includes("getdata")}
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </Button>
          </Group>
        </Flex>
        <Text size="xs" c="dimmed">
          Menampilkan {Math.min((currentPage - 1) * rowsPerPage + 1, sortedHistory.length)}-
          {Math.min(currentPage * rowsPerPage, sortedHistory.length)} dari {sortedHistory.length} data
        </Text>
      </Stack>

      <Card withBorder p={0} radius="md" shadow="sm" style={{ overflow: 'hidden', border: '1px solid #f0f0f0' }}>
        <Box style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '14px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#495057', textTransform: 'uppercase', borderBottom: '2px solid #e9ecef', width: 60 }}>
                  NO
                </th>
                <th onClick={() => handleSort('date')} style={{ padding: '14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#495057', textTransform: 'uppercase', borderBottom: '2px solid #e9ecef', cursor: 'pointer' }}>
                  <Flex align="center" gap={6}>
                    TANGGAL <SortIcon active={sortBy === 'date'} dir={sortDir} />
                  </Flex>
                </th>
                <th onClick={() => handleSort('reference')} style={{ padding: '14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#495057', textTransform: 'uppercase', borderBottom: '2px solid #e9ecef', cursor: 'pointer' }}>
                  <Flex align="center" gap={6}>
                    REFERENSI <SortIcon active={sortBy === 'reference'} dir={sortDir} />
                  </Flex>
                </th>
                <th onClick={() => handleSort('product')} style={{ padding: '14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#495057', textTransform: 'uppercase', borderBottom: '2px solid #e9ecef', cursor: 'pointer' }}>
                  <Flex align="center" gap={6}>
                    PRODUK <SortIcon active={sortBy === 'product'} dir={sortDir} />
                  </Flex>
                </th>
                <th style={{ padding: '14px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#495057', textTransform: 'uppercase', borderBottom: '2px solid #e9ecef' }}>
                  PERUBAHAN
                </th>
                <th style={{ padding: '14px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#495057', textTransform: 'uppercase', borderBottom: '2px solid #e9ecef', position: 'sticky', right: 0, backgroundColor: '#f8f9fa', zIndex: 10, boxShadow: '-2px 0 5px rgba(0,0,0,0.02)' }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {loading.includes("getdata") ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                    <Text c="dimmed" fw={500}>Memuat data...</Text>
                  </td>
                </tr>
              ) : pagedHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                    <Text c="dimmed" fw={500}>Tidak ada data ditemukan</Text>
                  </td>
                </tr>
              ) : (
                pagedHistory.map((h, idx) => {
                  const dir = getDirection(h.reference_type || h.reference);
                  const alterationNum = h.qty || (typeof h.alteration === 'string' ? h.alteration.replace(/\D/g, "") : h.alteration) || 0;
                  const productName = h.variant
                    ? `${h.product?.product_name || "-"} - ${h.variant.varian_name}`
                    : h.product?.product_name || h.product || "-";
                  const dateObj = new Date(h.created_at || h.date || "");
                  const dateStr = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : h.date || "-";

                  return (
                    <tr key={h.id || idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <Text size="xs" fw={700}>{(currentPage - 1) * rowsPerPage + idx + 1}</Text>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Text size="sm">{dateStr}</Text>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge variant="light" color="gray" size="sm" radius="sm">
                          {h.reference_type || h.reference}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Text size="sm" fw={500}>{productName}</Text>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <Badge color={dir === "add" ? "green" : "red"} variant="light" radius="sm" size="md">
                          {(dir === "reduce" ? "-" : "+") + alterationNum}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 14px', position: 'sticky', right: 0, backgroundColor: 'inherit', textAlign: 'center', borderLeft: '1px solid #f1f3f5' }}>
                        <Group gap={8} justify="center">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => {
                              if (h && h.product) {
                                handleProductOptionSubmit(h.product.product_name);
                                setIsFormVisible(true);
                              }
                            }}
                          >
                            <FontAwesomeIcon icon={faPencil} size="xs" />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() => {
                              const product = h.product || allProductsData.find((p: any) => p.id === h.product_id);
                              const slug = product?.slug;
                              if (slug) {
                                router.push(`/dashboard/merch/${slug}`);
                              } else {
                                notifications.show({
                                  title: "Info",
                                  message: "Slug produk tidak ditemukan",
                                  color: "orange"
                                });
                              }
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} size="xs" />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Box>
      </Card>
      
      {sortedHistory.length > 0 && (
        <Flex justify="space-between" align="center" mt="md">
          <Text size="xs" c="dimmed">Total {sortedHistory.length} riwayat</Text>
          <Pagination 
            value={currentPage} 
            onChange={setCurrentPage} 
            total={totalPages} 
            radius="md" 
            size="sm" 
            withEdges 
          />
        </Flex>
      )}
    </Box>
  );

  const renderForm = () => (
    <Card p="xl" radius="lg" className="border border-light-grey shadow-sm pb-[100px]">
      {/* Title row */}
      <Flex justify="space-between" align="center" mb="lg">
        <Group>
          <Icon icon="solar:box-minimalistic-bold-duotone" className="text-blue-500" width={24} />
          <Title order={4} className="text-gray-800">Daftar Produk Terpilih</Title>
        </Group>
        <Badge color="blue" variant="light" size="lg">
          {selectedProducts.length} Produk
        </Badge>
      </Flex>

      {/* Search bar + inline variant dropdown */}
      <Flex align="flex-end" gap="sm" mb="md" wrap="wrap">
        <Box style={{ flex: "0 0 360px", minWidth: 240 }}>
          <Autocomplete
            label="Cari Produk"
            placeholder="Ketik nama atau SKU produk..."
            leftSection={<Icon icon="akar-icons:search" className="text-gray-400" />}
            data={baseProductOptions}
            value={searchQuery}
            onChange={setSearchQuery}
            onOptionSubmit={handleProductOptionSubmit}
            size="md"
          />
        </Box>

        {pendingBaseProduct && (
          <Box style={{ flex: "0 0 240px", minWidth: 180 }}>
            <Select
              label={`Varian — ${pendingBaseProduct.product_name}`}
              placeholder="Pilih varian"
              data={(
                pendingBaseProduct.product_varian ||
                pendingBaseProduct.productVarian ||
                []
              ).map((v: any) => ({
                value: String(v.id),
                label: `${v.varian_name || v.name} (Stok: ${v.stock_summary?.sisa_stock ?? v.stock_qty ?? v.stock ?? 0
                  })`,
              }))}
              value={selectedVariantId}
              onChange={handleVariantSelect}
              size="md"
              clearable
              onClear={() => { setPendingBaseProduct(null); setSelectedVariantId(null); }}
            />
          </Box>
        )}
      </Flex>

      <Divider mb="md" color="gray.1" />

      {/* Table */}
      <Box className="rounded-xl overflow-hidden border border-light-grey shadow-sm" bg="white">
        <ScrollArea>
          <Table removeWrapper aria-label="Selected Products Table" style={{ minWidth: 920, width: "100%" }}>
            <TableHeader>
              <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold" style={{ minWidth: 180, padding: "12px 16px" }}>
                Produk
              </TableColumn>
              <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold text-center" style={{ width: 100, padding: "12px 16px" }}>
                Stok Awal
              </TableColumn>
              <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold" style={{ minWidth: 210, padding: "12px 16px" }}>
                Jenis Referensi
              </TableColumn>
              <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold" style={{ minWidth: 200, padding: "12px 16px" }}>
                Catatan
              </TableColumn>
              <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold text-center" style={{ width: 130, padding: "12px 16px" }}>
                Qty
              </TableColumn>
              <TableColumn align="center" className="bg-gray-50/80 text-gray-600 font-semibold" style={{ width: 70, padding: "12px 16px" }}>
                Aksi
              </TableColumn>
            </TableHeader>

            <TableBody>
              {selectedProducts.length === 0 ? (
                <TableRow>
                  <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                  <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                  <TableCell style={{ padding: "60px 16px", textAlign: "center" }}>
                    <Flex direction="column" align="center" justify="center" gap={8} style={{ color: "#9ca3af" }}>
                      <Icon icon="solar:inbox-line" width={48} style={{ color: "#d1d5db" }} />
                      <Text size="sm">Belum ada produk yang dipilih</Text>
                    </Flex>
                  </TableCell>
                  <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                  <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                  <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                </TableRow>
              ) : (
                selectedProducts.map((p) => {
                  const dir = getDirection(p.referenceType);
                  const finalStock =
                    dir === "add"
                      ? p.initial_stock + p.qty
                      : Math.max(0, p.initial_stock - p.qty);

                  return (
                    <TableRow
                      key={p.id}
                      className="border-b border-primary-light-200 last:border-0 hover:bg-gray-50/50 transition-colors"
                      style={{ verticalAlign: "top" }}
                    >
                      {/* Produk */}
                      <TableCell style={CELL_STYLE}>
                        <Text fw={600} size="sm" className="text-gray-800" style={{ lineHeight: 1.3 }}>
                          {p.product_name}
                        </Text>
                        <Text size="xs" c="dimmed">SKU: {p.sku}</Text>
                      </TableCell>

                      {/* Stok Awal */}
                      <TableCell style={{ ...CELL_STYLE, textAlign: "center" }}>
                        <Badge color="gray" variant="light" size="lg" radius="sm">
                          {p.initial_stock}
                        </Badge>
                      </TableCell>

                      {/* Jenis Referensi */}
                      <TableCell style={CELL_STYLE}>
                        <Select
                          data={REFERENCE_TYPE_OPTIONS}
                          value={p.referenceType}
                          onChange={(val) =>
                            handleRowChange(p.id, "referenceType", val || "restock_supplier")
                          }
                          size="sm"
                          radius="md"
                          styles={{ input: { fontSize: 13 } }}
                          withScrollArea={false}
                        />
                      </TableCell>

                      {/* Catatan */}
                      <TableCell style={CELL_STYLE}>
                        <TextInput
                          placeholder="Catatan opsional..."
                          value={p.notes}
                          onChange={(e) => handleRowChange(p.id, "notes", e.target.value)}
                          size="sm"
                          radius="md"
                        />
                      </TableCell>

                      {/* Qty — natural flow so row extends down */}
                      <TableCell style={{ ...CELL_STYLE, textAlign: "center" }}>
                        <div style={{ display: "inline-block" }}>
                          <NumberInput
                            value={p.qty}
                            onChange={(val) =>
                              handleRowChange(p.id, "qty", typeof val === "number" ? val : 0)
                            }
                            allowNegative={false}
                            min={0}
                            w={100}
                            size="sm"
                            radius="md"
                            classNames={{
                              input: `text-center font-semibold ${dir === "add" ? "text-green-600" : "text-red-500"
                                }`,
                            }}
                          />
                          {/* Normal flow result line */}
                          <div style={{ minHeight: 16, marginTop: 4, textAlign: "center" }}>
                            {p.qty > 0 && (
                              <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                                → <strong style={{ color: "#374151" }}>{finalStock}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Aksi */}
                      <TableCell style={{ ...CELL_STYLE, textAlign: "center" }}>
                        <ActionIcon
                          color="red"
                          variant="light"
                          size="md"
                          onClick={() => handleRemoveProduct(p.id)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Icon icon="solar:trash-bin-trash-bold" width={18} />
                        </ActionIcon>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Box>

      {/* Unified Floating Footer - Fixed Position */}
      <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white p-4 px-6 border-t border-light-grey shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
        <Flex justify="flex-end" gap="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={() => setIsFormVisible(false)}
            leftSection={<Icon icon="mdi:close" />}
          >
            Batal
          </Button>
          <Button
            color="blue"
            size="md"
            radius="md"
            loading={submitting}
            onClick={handleSubmit}
            leftSection={<Icon icon="solar:diskette-bold" width={20} />}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            Simpan Perubahan
          </Button>
        </Flex>
      </Box>
    </Card>
  );

  return (
    <>
      <Head>
        <title>{isFormVisible ? "Buat Stock Movement" : "Stock Movement"} | Dashboard</title>
      </Head>

      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">

          {/* Header */}
          <Flex justify="space-between" align="center">
            <div>
              <Title order={2} className="text-gray-900 font-semibold mb-1">
                {isFormVisible ? "Buat Stock Movement" : "Stock Movement"}
              </Title>
              <Text c="dimmed" size="sm">
                {isFormVisible
                  ? "Tambah data pergerakan stok produk dan varian baru."
                  : "Kelola dan perbarui ketersediaan stock produk dan varian secara langsung."}
              </Text>
            </div>
            {!isFormVisible && (
              <Button
                variant="filled"
                color="blue"
                leftSection={<Icon icon="solar:add-circle-bold" width={22} />}
                onClick={() => setIsFormVisible(true)}
                size="md"
                radius="md"
                className="shadow-sm"
              >
                Buat Stock Movement
              </Button>
            )}
          </Flex>

          {isFormVisible ? (
            renderForm()
          ) : (
            <Card p="lg" radius="lg" className="border border-light-grey shadow-sm">
              {renderHistory()}
            </Card>
          )}

        </div>
      </div>
    </>
  );
};

export default StockManagement;
