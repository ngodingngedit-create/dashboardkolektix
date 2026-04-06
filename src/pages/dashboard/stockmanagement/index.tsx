import Head from "next/head";
import React, { useState, useEffect } from "react";
import { Get } from "@/utils/REST";
import fetch from "@/utils/fetch";
import { notifications } from "@mantine/notifications";
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
} from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
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
}

const CELL_STYLE: React.CSSProperties = {
  padding: "18px 16px",
  verticalAlign: "top",
};

const StockManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productsData, setProductsData] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

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

  const fetchHistory = async (creatorId: number) => {
    try {
      const res: any = await Get("stock-management", { creator_id: creatorId });
      if (res?.data?.data) {
        setHistoryData(res.data.data);
      } else if (Array.isArray(res?.data)) {
        setHistoryData(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const fetchProducts = async (creatorId: number) => {
    try {
      const res: any = await Get("product", { creator_id: creatorId });
      if (res?.data) {
        const raw = Array.isArray(res.data) ? res.data : res.data.data || [];
        // Filter client-side to ensure only products belonging to this creator
        const filtered = raw.filter((p: any) => !p.creator_id || String(p.creator_id) === String(creatorId));
        setProductsData(filtered);
      }
    } catch (error) {
      console.error(error);
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
    <Card p="xl" radius="lg" className="border border-light-grey shadow-sm">
      <Group mb="xl" justify="space-between">
        <Group>
          <Icon icon="solar:history-bold-duotone" width={24} className="text-blue-500" />
          <Title order={4} className="text-gray-800">Riwayat Terakhir</Title>
        </Group>
      </Group>
      <Box className="rounded-xl overflow-hidden border border-light-grey shadow-sm" bg="white">
        <Table removeWrapper aria-label="History Table" className="w-full">
          <TableHeader>
            <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold py-4">Tanggal</TableColumn>
            <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold py-4">Referensi</TableColumn>
            <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold py-4">Produk</TableColumn>
            <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold py-4">Perubahan</TableColumn>
            <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold py-4">User</TableColumn>
          </TableHeader>
          <TableBody>
            {historyData.map((h, index) => {
              const dir = getDirection(h.reference_type || h.reference);
              const alteration = (dir === "reduce" ? "-" : "+") + (h.qty || h.alteration?.replace(/\D/g, '') || 0);
              const productName = h.variant ? `${h.product?.product_name || '-'} - ${h.variant.varian_name}` : (h.product?.product_name || h.product || '-');
              const dateObj = new Date(h.created_at || h.date);
              const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : (h.date || '-');

              return (
                <TableRow key={h.id || index} className="border-b border-light-grey last:border-0 hover:bg-gray-50/50">
                  <TableCell className="py-4 text-sm text-gray-600">{dateStr}</TableCell>
                  <TableCell className="py-4 text-sm font-medium text-gray-800">{h.reference_type || h.reference}</TableCell>
                  <TableCell className="py-4 text-sm text-gray-800">{productName}</TableCell>
                  <TableCell className="py-4">
                    <Badge color={dir === "add" ? "green" : "red"} variant="light" radius="sm">
                      {alteration}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-600">{h.created_by || h.user || h.product?.created_by || h.product?.creator_id || 'system'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Card>
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

          {isFormVisible ? renderForm() : renderHistory()}

        </div>
      </div>
    </>
  );
};

export default StockManagement;
