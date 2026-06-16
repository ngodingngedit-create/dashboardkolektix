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
  Pagination,
  Tooltip
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import moment from "moment";
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
  { value: "restock_supplier", label: "restock_supplier" },
  { value: "produksi_internal", label: "produksi_internal" },
  { value: "order", label: "order" },
  { value: "return_customer", label: "return_customer" },
  { value: "return_supplier", label: "return_supplier" },
  { value: "damaged", label: "damaged" },
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
  const [selectedReferenceFilter, setSelectedReferenceFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<[Date | null, Date | null]>([null, null]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>("desc");

  const productOptions = useMemo(() => {
    if (!allProductsData) return [];
    return allProductsData.map((p) => ({
      value: p.id.toString(),
      label: p.product_name,
    }));
  }, [allProductsData]);

  const pagedHistory = historyData;
  const totalPages = Math.ceil(totalHistoryCount / rowsPerPage);

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
  const [autoSelectProduct, setAutoSelectProduct] = useState<string | null>(null);
  const [editModeId, setEditModeId] = useState<number | null>(null);

  const selectedVariantKeys = selectedProducts.map(p => p.id).join(",");
  const [variantHistoryData, setVariantHistoryData] = useState<any[]>([]);
  const [fetchingVariantHistory, setFetchingVariantHistory] = useState(false);

  useEffect(() => {
    if (!selectedVariantKeys) {
      setVariantHistoryData([]);
      return;
    }
    
    const fetchVariantHistories = async () => {
      setFetchingVariantHistory(true);
      try {
        const productIds = Array.from(new Set(selectedProducts.map(p => p.product_id)));
        const allHistories: any[] = [];
        for (const pid of productIds) {
          const res: any = await Get("stock-bycreator", {
            creator_id: user?.has_creator?.id,
            product_id: pid,
            per_page: 50 
          });
          const data = res?.data?.data || res?.data || [];
          if (Array.isArray(data)) {
            allHistories.push(...data);
          }
        }
        
        const filtered = allHistories.filter(h => {
          return selectedProducts.some(sp => 
            String(sp.product_id) === String(h.product_id) && 
            (sp.variant_id == null ? h.product_varian_id == null : String(sp.variant_id) === String(h.product_varian_id))
          );
        });
        
        filtered.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
        setVariantHistoryData(filtered);
      } catch (e) {
        console.error("Failed to fetch variant history:", e);
      } finally {
        setFetchingVariantHistory(false);
      }
    };
    
    if (user?.has_creator?.id) {
      fetchVariantHistories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariantKeys, user?.has_creator?.id]);

  useEffect(() => {
    if (router.isReady && router.query.action === "create") {
      setIsFormVisible(true);
      if (router.query.productName) {
        setAutoSelectProduct(router.query.productName as string);
      }
      // Clean up the URL to prevent reopening on refresh
      const { action, productName, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (user?.has_creator?.id) {
      fetchProducts(user.has_creator.id);
    }
  }, [user]);

  // Server-side fetching hook for History
  useEffect(() => {
    const creatorId = user?.has_creator?.id;
    if (creatorId) {
      const delayDebounceFn = setTimeout(() => {
        fetchHistory(creatorId);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [user, currentPage, rowsPerPage, historySearchQuery, selectedProductFilter, selectedReferenceFilter, dateRangeFilter, sortBy, sortDir]);

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
      const params: any = { 
        creator_id: creatorId, 
        page: currentPage, 
        per_page: rowsPerPage 
      };
      if (historySearchQuery) params.search = historySearchQuery;
      if (selectedProductFilter && selectedProductFilter !== "all") params.product_id = selectedProductFilter;
      if (selectedReferenceFilter && selectedReferenceFilter !== "all") params.reference_type = selectedReferenceFilter;
      if (dateRangeFilter[0] && dateRangeFilter[1]) {
        params.start_date = moment(dateRangeFilter[0]).format("YYYY-MM-DD");
        params.end_date = moment(dateRangeFilter[1]).format("YYYY-MM-DD");
      }
      if (sortBy) {
        params.sort_by = sortBy;
        params.sort_dir = sortDir || 'desc';
      }

      const res: any = await Get("stock-bycreator", params);
      
      if (res && res.data && Array.isArray(res.data.data)) {
        setHistoryData(res.data.data);
        setTotalHistoryCount(res.data.total || 0);
      } else if (res && Array.isArray(res.data)) {
        setHistoryData(res.data);
        setTotalHistoryCount(res.data.length);
      } else {
        setHistoryData([]);
        setTotalHistoryCount(0);
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

      const filtered = allProducts.filter((p: any) => (!p.creator_id || String(p.creator_id) === String(creatorId)) && p.product_status_id === 2);
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

  useEffect(() => {
    if (autoSelectProduct && productsData.length > 0) {
      handleProductOptionSubmit(autoSelectProduct);
      setAutoSelectProduct(null);
    }
  }, [autoSelectProduct, productsData]);

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

  const addEditProductToTable = (h: any) => {
    const baseProduct = h.product || allProductsData.find((p) => p.id === h.product_id);
    if (!baseProduct) return;
    const variantData = h.variant;

    const rowId = `${baseProduct.id}-${h.product_varian_id ?? "base"}-edit`;
    const displayName = variantData
      ? `${baseProduct.product_name} - ${variantData.varian_name || variantData.name}`
      : baseProduct.product_name;
    const sku = variantData ? variantData.sku || "-" : baseProduct.sku || "-";

    let alterationNum = h.qty;
    if (alterationNum === undefined || alterationNum === null) {
      if (typeof h.alteration === 'string') {
        alterationNum = Number(h.alteration.replace(/\D/g, ""));
      } else {
        alterationNum = Number(h.alteration);
      }
    }

    const stock = variantData
      ? variantData.stock_summary?.sisa_stock ?? variantData.stock_qty ?? variantData.stock ?? 0
      : baseProduct.qty ?? 0;

    setSelectedProducts([
      {
        id: rowId,
        product_id: baseProduct.id,
        variant_id: h.product_varian_id,
        product_name: displayName,
        sku,
        initial_stock: stock,
        qty: Math.abs(alterationNum) || 0,
        referenceType: h.reference_type || h.reference || "restock_supplier",
        notes: h.notes || "",
        creator_name: baseProduct.creator?.name || String(baseProduct.creator_id || '-'),
      }
    ]);
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

    const url = editModeId ? `stock-management/stock-movement/${editModeId}` : "stock-management/stock-movement";
    const method = editModeId ? "PUT" : "POST";

    setSubmitting(true);
    try {
      await fetch({
        url,
        method,
        data: { products: productsPayload, created_by: user?.name || user?.has_creator?.name || "system", creator_id: user?.has_creator?.id },
        headers: { "Content-Type": "application/json" },
        before: () => { },
        success: () => {
          notifications.show({ title: "Sukses", message: "Perubahan stock berhasil disimpan!", color: "green" });
          setSelectedProducts([]);
          setEditModeId(null);
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
            <DatePickerInput
              type="range"
              placeholder="Semua Tanggal"
              value={dateRangeFilter}
              onChange={(val) => {
                setDateRangeFilter(val);
                setCurrentPage(1);
              }}
              clearable
              size="sm"
              w={240}
            />
            <Select
              placeholder="Semua Referensi"
              data={[{ value: "all", label: "Semua Referensi" }, ...REFERENCE_TYPE_OPTIONS]}
              value={selectedReferenceFilter}
              onChange={(val) => {
                setSelectedReferenceFilter(val || "all");
                setCurrentPage(1);
              }}
              size="sm"
              w={180}
            />
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
          Menampilkan {Math.min((currentPage - 1) * rowsPerPage + 1, totalHistoryCount)}-
          {Math.min(currentPage * rowsPerPage, totalHistoryCount)} dari {totalHistoryCount} data
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
                              if (h && (h.product || h.product_id)) {
                                setEditModeId(h.id);
                                addEditProductToTable(h);
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
      
      {totalHistoryCount > 0 && (
        <Flex justify="space-between" align="center" mt="md">
          <Text size="xs" c="dimmed">Total {totalHistoryCount} riwayat</Text>
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
                <Flex align="center" gap={6}>
                  Jenis Referensi
                  <Tooltip
                    label={
                      <div style={{ padding: 4 }}>
                        <Text size="sm" fw={600} mb={4}>Keterangan Referensi:</Text>
                        <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <li><b>restock_supplier</b>: Stok bertambah (Pembelian dari supplier)</li>
                          <li><b>produksi_internal</b>: Stok bertambah (Produksi sendiri)</li>
                          <li><b>order</b>: Stok berkurang (Penjualan)</li>
                          <li><b>return_customer</b>: Stok bertambah (Dikembalikan pembeli)</li>
                          <li><b>return_supplier</b>: Stok berkurang (Dikembalikan ke supplier)</li>
                          <li><b>damaged</b>: Stok berkurang (Penyesuaian stok)</li>
                        </ul>
                      </div>
                    }
                    position="top"
                    withArrow
                    multiline
                    w={320}
                  >
                    <ActionIcon size="xs" radius="xl" variant="light" color="blue" style={{ cursor: "help" }}>
                      <Text size="xs" fw={700} style={{ fontStyle: "italic" }}>i</Text>
                    </ActionIcon>
                  </Tooltip>
                </Flex>
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
                            disabled={editModeId !== null}
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

      {/* Variant History section */}
      {selectedProducts.length > 0 && (
        <Box mt="xl" mb="xl">
          <Flex align="center" gap="sm" mb="md">
            <Icon icon="solar:history-bold-duotone" className="text-blue-500" width={24} />
            <Title order={4} className="text-gray-800">Riwayat Terakhir Varian Terpilih</Title>
          </Flex>
          <Box className="rounded-xl overflow-hidden border border-light-grey shadow-sm" bg="white">
            <ScrollArea h={300}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>Tanggal</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>Produk/Varian</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>Referensi</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>Perubahan</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchingVariantHistory ? (
                    <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}><Text c="dimmed">Memuat riwayat...</Text></td></tr>
                  ) : variantHistoryData.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}><Text c="dimmed">Belum ada riwayat untuk varian ini.</Text></td></tr>
                  ) : (
                    variantHistoryData.map((h, i) => {
                      const dir = getDirection(h.reference_type || h.reference);
                      const alterationNum = h.qty || (typeof h.alteration === 'string' ? h.alteration.replace(/\D/g, "") : h.alteration) || 0;
                      const dateObj = new Date(h.created_at || h.date || "");
                      const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";
                      const productName = h.variant ? `${h.product?.product_name || "-"} - ${h.variant.varian_name}` : h.product?.product_name || h.product || "-";
                      
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: h.id === editModeId ? '#ebfbee' : 'transparent' }}>
                          <td style={{ padding: '12px 16px' }}><Text size="sm">{dateStr}</Text></td>
                          <td style={{ padding: '12px 16px' }}><Text size="sm" fw={500}>{productName}</Text></td>
                          <td style={{ padding: '12px 16px' }}><Badge variant="light" color="gray" size="sm">{h.reference_type || h.reference}</Badge></td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <Badge color={dir === "add" ? "green" : "red"} variant="light" radius="sm">
                              {(dir === "reduce" ? "-" : "+") + alterationNum}
                            </Badge>
                          </td>
                          <td style={{ padding: '12px 16px' }}><Text size="sm" c="dimmed">{h.notes || "-"}</Text></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </Box>
        </Box>
      )}

      {/* Unified Floating Footer - Fixed Position */}
      <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white p-4 px-6 border-t border-light-grey shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
        <Flex justify="flex-end" gap="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={() => {
              setIsFormVisible(false);
              setEditModeId(null);
              setSelectedProducts([]);
            }}
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
            <Flex gap="md" align="flex-start">
              {isFormVisible && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  radius="xl"
                  onClick={() => {
                    setIsFormVisible(false);
                    setEditModeId(null);
                    setSelectedProducts([]);
                  }}
                  mt={4}
                  className="hover:bg-gray-200 transition-colors"
                >
                  <Icon icon="akar-icons:arrow-left" width={24} />
                </ActionIcon>
              )}
              <div>
                <Title order={2} className="text-gray-900 font-semibold mb-1">
                  {isFormVisible ? (editModeId ? "Edit Stock Movement" : "Buat Stock Movement") : "Stock Movement"}
                </Title>
                <Text c="dimmed" size="sm">
                  {isFormVisible
                    ? "Tambah data pergerakan stok produk dan varian baru."
                    : "Kelola dan perbarui ketersediaan stock produk dan varian secara langsung."}
                </Text>
              </div>
            </Flex>
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
