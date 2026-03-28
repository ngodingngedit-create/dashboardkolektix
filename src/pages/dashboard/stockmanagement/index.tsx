import Head from "next/head";
import React, { useState, useEffect } from "react";
import { Get } from "@/utils/REST";
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
  Button
} from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import useLoggedUser from "@/utils/useLoggedUser";

interface SelectedProduct {
  id: string; // unique row id (bisa gabungan product.id + variant.id)
  product_id: number;
  variant_id?: number;
  product_name: string;
  sku: string;
  initial_stock: number;
  add_stock: number;
  reduce_stock: number;
}

const StockManagement = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [reference, setReference] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [productsData, setProductsData] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  // Dummy history
  const historyData = [
    { id: 1, date: "2026-03-29 10:00", reference: "REF-001", product: "A CROWN THAT WILL LAST (BER025)", alteration: "+5", user: "Admin" },
    { id: 2, date: "2026-03-28 14:30", reference: "REF-002", product: "5 LOVE LANGUAGE (BER072)", alteration: "-2", user: "Admin" },
  ];

  const user = useLoggedUser();

  useEffect(() => {
    if (user?.has_creator?.id) {
      fetchProducts(user.has_creator.id);
    }
  }, [user]);

  const fetchProducts = async (creatorId: number) => {
    try {
      // Using 'product' with creator_id to fetch specific creator's products
      const res: any = await Get("product", { creator_id: creatorId });
      // Depending on the exact response structure of Get("product"), it's often res.data directly or res.data.data
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
          variant_id: selected.variant_id,
          product_name: selected.display_name,
          sku: selected.sku || '-',
          initial_stock: selected.stock,
          add_stock: 0,
          reduce_stock: 0
        }]);
      }
    }
    setSearchQuery('');
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const handleValueChange = (id: string, field: 'add_stock' | 'reduce_stock', val: number | string) => {
    const num = typeof val === 'number' ? val : 0;
    setSelectedProducts(selectedProducts.map(p => p.id === id ? { ...p, [field]: num } : p));
  };

  return (
    <>
      <Head>
        <title>Stock Management - Dashboard</title>
      </Head>
      <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
        <Title order={1} size="h2">
          Stock Management
        </Title>

        <Card p={30} radius="md" withBorder>
          <Text size="sm" c="dimmed" mb="xl">Please fill in the information below</Text>

          <Flex gap={30} wrap="wrap" mb="xl">
            <TextInput
              label="Date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ flex: 1, minWidth: 250 }}
            />
            <TextInput
              label="Reference"
              placeholder="e.g. TR-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              style={{ flex: 1, minWidth: 250 }}
            />
          </Flex>

          <Box mb="xl">
            <Autocomplete
              placeholder="Search product by code or name..."
              leftSection={<Icon icon="akar-icons:search" />}
              data={productOptions.map(p => p.display_name)}
              value={searchQuery}
              onChange={setSearchQuery}
              onOptionSubmit={handleProductSelect}
              size="md"
            />
          </Box>

          <Box style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
            <Table removeWrapper aria-label="Selected Products Table">
              <TableHeader>
                <TableColumn>Product</TableColumn>
                <TableColumn>Stock Awal</TableColumn>
                <TableColumn>Tambah Stock</TableColumn>
                <TableColumn>Kurangi Stock</TableColumn>
                <TableColumn align="center">Aksi</TableColumn>
              </TableHeader>
              <TableBody>
                {selectedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell>No products selected</TableCell>
                    <TableCell>{null}</TableCell>
                    <TableCell>{null}</TableCell>
                    <TableCell>{null}</TableCell>
                    <TableCell>{null}</TableCell>
                  </TableRow>
                ) : (
                  selectedProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Text fw={500} size="sm">{p.product_name}</Text>
                      </TableCell>
                      <TableCell>
                        <Text>{p.initial_stock}</Text>
                      </TableCell>
                      <TableCell>
                        <NumberInput
                          value={p.add_stock}
                          onChange={(val) => handleValueChange(p.id, 'add_stock', val)}
                          min={0}
                          style={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <NumberInput
                          value={p.reduce_stock}
                          onChange={(val) => handleValueChange(p.id, 'reduce_stock', val)}
                          min={0}
                          max={p.initial_stock + p.add_stock}
                          style={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Flex justify="center">
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleRemoveProduct(p.id)}
                          >
                            <Icon icon="solar:trash-bin-trash-bold" width={20} />
                          </ActionIcon>
                        </Flex>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>

          <Flex justify="flex-end" mt="xl">
            <Button color="blue" size="md" leftSection={<Icon icon="solar:diskette-bold" width={20} />}>Save Stock Updates</Button>
          </Flex>
        </Card>

        {/* History Table */}
        <Card p={30} radius="md" withBorder mt="md">
          <Title order={3} size="h4" mb="xl">History Perubahan Stock</Title>
          <Box style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
            <Table removeWrapper aria-label="History Table">
              <TableHeader>
                <TableColumn>Date</TableColumn>
                <TableColumn>Reference</TableColumn>
                <TableColumn>Product</TableColumn>
                <TableColumn>Alteration</TableColumn>
                <TableColumn>User</TableColumn>
              </TableHeader>
              <TableBody>
                {historyData.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.date}</TableCell>
                    <TableCell>{h.reference}</TableCell>
                    <TableCell>{h.product}</TableCell>
                    <TableCell>
                      <Text c={h.alteration.startsWith('+') ? 'green' : 'red'} fw={600}>
                        {h.alteration}
                      </Text>
                    </TableCell>
                    <TableCell>{h.user}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </div>
    </>
  );
};

export default StockManagement;
