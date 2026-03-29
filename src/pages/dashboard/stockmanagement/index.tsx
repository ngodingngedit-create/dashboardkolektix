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
  Grid,
  Textarea,
  Divider,
  Badge,
  Group
} from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import useLoggedUser from "@/utils/useLoggedUser";

interface SelectedProduct {
  id: string;
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  sku: string;
  initial_stock: number;
  alteration: number;
}

const StockManagement = () => {
  const [referenceType, setReferenceType] = useState('restock_supplier');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState("");

  const [productsData, setProductsData] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Dummy history
  const historyData = [
    { id: 1, date: "2026-03-29 10:00", reference: "restock_supplier", product: "A CROWN THAT WILL LAST (BER025)", alteration: "+5", user: "system" },
    { id: 2, date: "2026-03-28 14:30", reference: "order", product: "5 LOVE LANGUAGE (BER072)", alteration: "-2", user: "system" },
  ];

  const user = useLoggedUser();

  useEffect(() => {
    if (user?.has_creator?.id) {
      fetchProducts(user.has_creator.id);
    }
  }, [user]);

  const fetchProducts = async (creatorId: number) => {
    try {
      const res: any = await Get("product", { creator_id: creatorId });
      if (res?.data) {
        setProductsData(Array.isArray(res.data) ? res.data : (res.data.data || []));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Prepare autocomplete items
  const productOptions = productsData.flatMap(p => {
    if (p.product_varian && p.product_varian.length > 0) {
      return p.product_varian.map((v: any) => ({
        ...p,
        variant_id: v.id,
        display_name: `${p.product_name} - ${v.varian_name || v.name} (${v.sku || '-'})`,
        sku: v.sku,
        stock: v.stock_qty || v.stock || 0
      }));
    }
    return [{
      ...p,
      display_name: `${p.product_name} (${p.sku || '-'})`,
      stock: p.qty || 0
    }];
  });

  const handleProductSelect = (val: string) => {
    const selected = productOptions.find(p => p.display_name === val);
    if (selected) {
      const rowId = `${selected.id}-${selected.variant_id || 'base'}`;
      if (!selectedProducts.find(p => p.id === rowId)) {
        setSelectedProducts([...selectedProducts, {
          id: rowId,
          product_id: selected.id,
          variant_id: selected.variant_id || null,
          product_name: selected.display_name,
          sku: selected.sku || '-',
          initial_stock: selected.stock,
          alteration: 0
        }]);
      } else {
        notifications.show({ title: 'Info', message: 'Product already selected', color: 'blue' });
      }
    }
    setSearchQuery('');
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const handleValueChange = (id: string, val: number | string) => {
    const num = typeof val === 'number' ? val : 0;
    setSelectedProducts(selectedProducts.map(p => p.id === id ? { ...p, alteration: num } : p));
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      notifications.show({ title: 'Error', message: 'Belum ada produk yang dipilih!', color: 'red' });
      return;
    }

    if (!referenceType) {
      notifications.show({ title: 'Error', message: 'Silakan pilih Jenis Referensi!', color: 'red' });
      return;
    }

    // Group products by product_id
    const productsMap = new Map<number, any>();

    selectedProducts.forEach(p => {
      if (p.alteration === 0) return;

      if (!productsMap.has(p.product_id)) {
        productsMap.set(p.product_id, {
          product_id: p.product_id,
          stocks: []
        });
      }

      const prod = productsMap.get(p.product_id);

      if (p.alteration > 0) {
        prod.stocks.push({
          product_varian_id: p.variant_id,
          stock_status_id: 2,
          qty: p.alteration,
          reference_type: referenceType,
          notes: notes
        });
      } else if (p.alteration < 0) {
        prod.stocks.push({
          product_varian_id: p.variant_id,
          stock_status_id: 3,
          qty: Math.abs(p.alteration),
          reference_type: referenceType,
          notes: notes
        });
      }
    });

    const productsPayload = Array.from(productsMap.values());
    if (productsPayload.length === 0) {
      notifications.show({ title: 'Error', message: 'Silakan isi jumlah Perubahan (+/-)!', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      await fetch({
        url: "stock-management/stock-movement",
        method: "POST",
        data: {
          products: productsPayload,
          created_by: "system"
        },
        before: () => { },
        success: (res) => {
          notifications.show({ title: 'Sukses', message: 'Perubahan stock berhasil disimpan!', color: 'green' });
          setSelectedProducts([]);
          setNotes('');
          if (user?.has_creator?.id) {
            fetchProducts(user.has_creator.id);
          }
        },
        error: (err: any) => {
          notifications.show({ title: 'Error', message: err?.message || 'Gagal menyimpan perubahan stock', color: 'red' });
        },
        complete: () => setSubmitting(false)
      });
    } catch (e) {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Stock Movement | Dashboard</title>
      </Head>
      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div>
            <Title order={2} className="text-gray-900 font-semibold mb-2">
              Stock Movement
            </Title>
            <Text c="dimmed" size="sm">
              Kelola dan perbarui ketersediaan stock produk dan varian secara langsung.
            </Text>
          </div>

          <Grid gutter="lg" align="stretch">
            {/* Left Column: Form Controls */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card p="xl" radius="lg" className="border border-light-grey shadow-sm h-full flex flex-col">
                <Group mb="md">
                  <Icon icon="solar:document-add-bold-duotone" width={24} className="text-blue-500" />
                  <Title order={4} className="text-gray-800">Detail Pergerakan</Title>
                </Group>
                <Divider mb="xl" color="gray.1" />

                <div className="flex flex-col gap-5">
                  <Select
                    withAsterisk
                    label="Jenis Referensi"
                    placeholder="Pilih alasan perubahan"
                    description="Pilih dasar dari pergerakan stock ini"
                    data={[
                      { value: "restock_supplier", label: "Restock dari Supplier" },
                      { value: "produksi_internal", label: "Hasil Produksi Internal" },
                      { value: "order", label: "Pesanan Customer" },
                      { value: "return_customer", label: "Retur dari Customer" },
                      { value: "return_supplier", label: "Retur ke Supplier" },
                      { value: "adjustment", label: "Penyesuaian (Opname)" },
                      { value: "damaged", label: "Barang Rusak/Hilang" }
                    ]}
                    value={referenceType}
                    onChange={(val) => setReferenceType(val || '')}
                    size="md"
                  />

                  <Textarea
                    label="Catatan (Opsional)"
                    placeholder="Contoh: Restock kloter kedua bulan ini..."
                    description="Tambahkan detail tambahan jika diperlukan"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    minRows={3}
                    autosize
                    size="md"
                  />

                  <Autocomplete
                    mt="md"
                    label="Cari Produk"
                    placeholder="Ketik nama atau SKU produk..."
                    leftSection={<Icon icon="akar-icons:search" className="text-gray-400" />}
                    data={productOptions.map(p => p.display_name)}
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onOptionSubmit={handleProductSelect}
                    size="md"
                  />
                </div>
              </Card>
            </Grid.Col>

            {/* Right Column: Table & Save */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card p="xl" radius="lg" className="border border-light-grey shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <Title order={4} className="text-gray-800 flex items-center gap-2">
                    <Icon icon="solar:box-minimalistic-bold-duotone" className="text-blue-500" />
                    Daftar Produk Terpilih
                  </Title>
                  <Badge color="blue" variant="light" size="lg">
                    {selectedProducts.length} Produk
                  </Badge>
                </div>

                <Box className="flex-1 rounded-xl overflow-hidden border border-light-grey shadow-sm mt-2 mb-6" bg="white">
                  <Table removeWrapper aria-label="Selected Products Table" className="w-full">
                    <TableHeader>
                      <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold py-4">Produk</TableColumn>
                      <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold py-4 text-center">Stok Awal</TableColumn>
                      <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold py-4 text-center">Perubahan (+/-)</TableColumn>
                      <TableColumn align="center" className="bg-gray-50/80 text-gray-600 font-semibold py-4">Aksi</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {selectedProducts.length === 0 ? (
                        <TableRow>
                          <TableCell className="py-12">
                            <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                              <Icon icon="solar:inbox-line" width={48} className="text-gray-200" />
                              <Text size="sm">Belum ada produk yang dipilih</Text>
                            </div>
                          </TableCell>
                          <TableCell className="hidden">{null}</TableCell>
                          <TableCell className="hidden">{null}</TableCell>
                          <TableCell className="hidden">{null}</TableCell>
                        </TableRow>
                      ) : (
                        selectedProducts.map((p) => (
                          <TableRow key={p.id} className="border-b border-primary-light-200 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <TableCell className="py-4">
                              <Text fw={600} size="sm" className="text-gray-800">{p.product_name}</Text>
                              <Text size="xs" c="dimmed">SKU: {p.sku}</Text>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge color="gray" variant="light" size="lg" radius="sm">
                                {p.initial_stock}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex justify-center flex-col items-center gap-1">
                                <NumberInput
                                  value={p.alteration}
                                  onChange={(val) => handleValueChange(p.id, val)}
                                  allowNegative={true}
                                  w={120}
                                  size="sm"
                                  radius="md"
                                  classNames={{
                                    input: `text-center font-semibold ${p.alteration > 0 ? 'text-green-600' : p.alteration < 0 ? 'text-red-500' : 'text-gray-700'}`
                                  }}
                                />
                                {p.alteration !== 0 && (
                                  <Text size="xs" c="dimmed">
                                    Hasil akhir: <span className="font-semibold text-gray-700">{Math.max(0, p.initial_stock + p.alteration)}</span>
                                  </Text>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Flex justify="center">
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  size="md"
                                  onClick={() => handleRemoveProduct(p.id)}
                                  className="hover:scale-110 transition-transform"
                                >
                                  <Icon icon="solar:trash-bin-trash-bold" width={18} />
                                </ActionIcon>
                              </Flex>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>

                <Flex justify="flex-end" mt="auto">
                  <Button
                    color="blue"
                    size="md"
                    radius="md"
                    loading={submitting}
                    onClick={handleSubmit}
                    leftSection={<Icon icon="solar:shield-check-bold" width={20} />}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    Simpan Perubahan
                  </Button>
                </Flex>
              </Card>
            </Grid.Col>
          </Grid>

          {/* History Section (To be connected to backend later) */}
          <Card p="xl" radius="lg" className="border border-light-grey shadow-sm mt-4">
            <Group mb="xl">
              <Icon icon="solar:history-bold-duotone" width={24} className="text-blue-500" />
              <Title order={4} className="text-gray-800">Riwayat Terakhir</Title>
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
                  {historyData.map((h) => (
                    <TableRow key={h.id} className="border-b border-light-grey last:border-0 hover:bg-gray-50/50">
                      <TableCell className="py-4 text-sm text-gray-600">{h.date}</TableCell>
                      <TableCell className="py-4 text-sm font-medium text-gray-800">{h.reference}</TableCell>
                      <TableCell className="py-4 text-sm text-gray-800">{h.product}</TableCell>
                      <TableCell className="py-4">
                        <Badge
                          color={h.alteration.startsWith('+') ? 'green' : 'red'}
                          variant="light"
                          radius="sm"
                        >
                          {h.alteration}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">{h.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </div>
      </div>
    </>
  );
};

export default StockManagement;
