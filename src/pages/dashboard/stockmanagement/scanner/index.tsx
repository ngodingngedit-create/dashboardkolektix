import { AspectRatio, Button, Card, Flex, LoadingOverlay, Stack, Text, Select, Badge, TextInput, NumberInput, ActionIcon, ScrollArea } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import QrScanner from 'qr-scanner';
import fetch from '@/utils/fetch';
import { Get } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import { useSidebar } from '@/components/SidebarComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCamera,
    faKeyboard,
} from '@fortawesome/free-solid-svg-icons';
import { notifications } from "@mantine/notifications";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@nextui-org/react";

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
    variants?: any[];
}

const CELL_STYLE: React.CSSProperties = {
    padding: "18px 16px",
    verticalAlign: "top",
};

const Scanner = () => {
    const { collapse } = useSidebar();
    const videoRef = useRef<HTMLVideoElement>(null);
    let qrScanner = useRef<QrScanner | null>(null);

    const [loading, setLoading] = useState<string>();
    const [camError, setCamError] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [selected, setSelected] = useState<'qr' | 'manual'>('qr');
    const [manualInput, setManualInput] = useState('');
    const [isAutoInputActive, setIsAutoInputActive] = useState(false);

    const user = useLoggedUser();
    const [allProductsData, setAllProductsData] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleFetchBarcodeRef = useRef<((code: string) => void) | null>(null);

    useEffect(() => {
        if (user?.has_creator?.id) {
            fetchProducts(user.has_creator.id);
        }
    }, [user]);

    const fetchProducts = async (creatorId: number) => {
        setLoading("getproducts");
        try {
            const firstRes: any = await Get("product-bymerchant", { creator_id: creatorId, per_page: 20, page: 1 });
            const firstData = firstRes?.data?.data ?? firstRes?.data ?? [];
            const lastPage: number = firstRes?.data?.last_page ?? firstRes?.last_page ?? 1;

            let allProducts: any[] = Array.isArray(firstData) ? firstData : [];

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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(undefined);
        }
    };

    useEffect(() => {
        if (selected === 'qr') {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            destroyScanner();
        };
    }, [selected]);

    useEffect(() => {
        if (isAutoInputActive) {
            const timer = setTimeout(() => {
                setManualInput('');
                setIsAutoInputActive(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isAutoInputActive]);

    const startScanner = async () => {
        try {
            setCamError(false);
            if (!videoRef.current) return;

            if (!qrScanner.current) {
                qrScanner.current = new QrScanner(
                    videoRef.current,
                    (result) => {
                        if (handleFetchBarcodeRef.current) {
                            handleFetchBarcodeRef.current(result.data);
                        }
                    },
                    {
                        maxScansPerSecond: 2,
                        highlightScanRegion: false,
                        highlightCodeOutline: false,
                    }
                );
            }

            await qrScanner.current?.start();
            setIsScanning(true);
        } catch (error) {
            console.error('Camera error:', error);
            setCamError(true);
        }
    };

    const stopScanner = () => {
        if (qrScanner.current) {
            qrScanner.current.stop();
        }
    };

    const destroyScanner = () => {
        if (qrScanner.current) {
            qrScanner.current.stop();
            qrScanner.current.destroy();
            qrScanner.current = null;
        }
    };

    const handleFetchBarcode = (code: string) => {
        if (loading === 'scan' || !isScanning) return;

        // Prevent rapid scanning
        setIsScanning(false);
        setLoading('scan');

        const cleanCode = code.trim();

        // Look up product by SKU (base product or variant)
        let foundProduct = null;
        let foundVariant = null;

        for (const product of allProductsData) {
            if (product.sku === cleanCode) {
                foundProduct = product;
                break;
            }
            const variants = product.product_varian || product.productVarian || [];
            const matchingVariant = variants.find((v: any) => v.sku === cleanCode);
            if (matchingVariant) {
                foundProduct = product;
                foundVariant = matchingVariant;
                break;
            }
        }

        if (foundProduct) {
            addProductToTable(foundProduct, foundVariant ? foundVariant.id : null, foundVariant);
            notifications.show({
                title: "Berhasil",
                message: `Produk ${foundProduct.product_name} ditambahkan ke daftar`,
                color: "green",
            });
        } else {
            notifications.show({
                title: "Tidak Ditemukan",
                message: `Produk dengan SKU ${cleanCode} tidak ditemukan`,
                color: "red",
            });
        }

        // Delay to prevent duplicate scans
        setTimeout(() => {
            setLoading(undefined);
            setIsScanning(true);
        }, 1500);
    };

    handleFetchBarcodeRef.current = handleFetchBarcode;

    const addProductToTable = (
        baseProduct: any,
        variantId: number | null,
        variantData: any | null
    ) => {
        const rowId = `${baseProduct.id}-${variantId ?? "base"}`;

        setSelectedProducts((prev) => {
            if (prev.find((p) => p.id === rowId)) {
                return prev; // Already exists
            }

            const displayName = variantData
                ? `${baseProduct.product_name} - ${variantData.varian_name || variantData.name}`
                : baseProduct.product_name;
            const sku = variantData ? variantData.sku || "-" : baseProduct.sku || "-";
            const stock = variantData
                ? variantData.stock_summary?.sisa_stock ?? variantData.stock_qty ?? variantData.stock ?? 0
                : baseProduct.qty ?? 0;

            return [
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
                    variants: baseProduct.product_varian || baseProduct.productVarian || [],
                },
                ...prev,
            ];
        });
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        handleFetchBarcode(manualInput);
        setManualInput('');
    };

    const handleRemoveProduct = (id: string) => {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
    };

    const handleRowChange = (id: string, field: keyof SelectedProduct, val: any) => {
        setSelectedProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
        );
    };

    const handleRowChanges = (id: string, updates: Partial<SelectedProduct>) => {
        setSelectedProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const getDirection = (refType: string) => REFERENCE_TYPE_DIRECTION[refType] ?? "add";

    const handleSubmit = async () => {
        if (selectedProducts.length === 0) {
            notifications.show({ title: "Error", message: "Belum ada produk yang discan!", color: "red" });
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
                    if (user?.has_creator?.id) {
                        fetchProducts(user.has_creator.id);
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

    return (
        <div className="min-h-screen bg-gray-50 pb-[100px]">
            <LoadingOverlay visible={loading === 'getproducts'} overlayProps={{ radius: "sm", blur: 2 }} />

            <div className="w-full pt-4 px-4 sm:px-8">
                <div className="flex flex-col lg:flex-row-reverse gap-6">
                    {/* Scanner Section */}
                    <div className="lg:w-[40%]">
                        <div className="bg-white rounded-xl shadow-sm border border-light-grey p-0 sm:p-6 overflow-hidden relative flex flex-col">
                            <div className="flex items-center gap-2 mb-4 p-6 sm:p-0">
                                <Icon icon="solar:scanner-bold-duotone" className="text-primary text-xl" />
                                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                    Scanner Produk
                                </h2>
                            </div>

                            {/* Tombol Switch - Scan Camera dan Manual Input */}
                            <div className="flex w-full mb-5 px-6 sm:px-0">
                                <button
                                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 ${selected === 'qr'
                                        ? 'text-primary bg-primary/5'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    onClick={() => setSelected('qr')}
                                >
                                    <FontAwesomeIcon icon={faCamera} className="text-xs" />
                                    Scan Camera
                                </button>
                                <button
                                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 ${selected === 'manual'
                                        ? 'text-primary bg-primary/5'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    onClick={() => setSelected('manual')}
                                >
                                    <FontAwesomeIcon icon={faKeyboard} className="text-xs" />
                                    Manual Input
                                </button>
                            </div>

                            <div>
                                {selected === 'qr' && (
                                    <div className="mb-0 sm:mb-4">
                                        <div className="overflow-hidden bg-black w-full relative aspect-[3/4] md:h-[400px] flex items-center justify-center sm:rounded-lg sm:border sm:border-light-grey">
                                            {camError && (
                                                <div className="absolute inset-0 bg-black bg-opacity-80 z-20 flex items-center justify-center p-4">
                                                    <div className="bg-white p-6 rounded-xl text-center max-w-md w-full">
                                                        <Icon icon="ph:camera-slash" className="text-4xl mb-3 text-red-500 mx-auto" />
                                                        <p className="font-semibold mb-2">Kamera Tidak Tersedia</p>
                                                        <p className="text-sm text-gray-600 mb-4">Aktifkan akses kamera untuk memindai QR code produk</p>
                                                        <Button
                                                            onClick={() => window.location.reload()}
                                                            fullWidth
                                                            className="!bg-primary !text-white"
                                                        >
                                                            Coba Lagi
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {!camError && (
                                                <div className="w-full h-full relative">
                                                    <video
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        muted
                                                    />

                                                    {/* Overlay Scanner */}
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                                        <div className="relative w-4/5 h-4/5 max-w-[280px] max-h-[280px]">
                                                            <div className="absolute inset-0 border-2 border-white/40 rounded-lg"></div>
                                                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[3px] border-l-[3px] border-white"></div>
                                                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-[3px] border-r-[3px] border-white"></div>
                                                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-[3px] border-l-[3px] border-white"></div>
                                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[3px] border-r-[3px] border-white"></div>
                                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-scan z-20">
                                                                <div className="absolute -top-1 left-1/2 w-2.5 h-2.5 bg-primary rounded-full transform -translate-x-1/2 shadow-[0_0_10px_rgba(var(--mantine-color-primary-6),1)]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selected === 'manual' && (
                                    <form onSubmit={handleManualSubmit} className="px-6 sm:px-0 pb-4">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                                SKU Produk / Varian
                                            </label>
                                            <input
                                                type="text"
                                                className="border-2 border-primary-light-200 rounded-lg w-full py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                                placeholder="Masukkan SKU produk"
                                                value={isAutoInputActive ? '' : manualInput}
                                                onChange={(e) => setManualInput(e.target.value)}
                                                autoFocus
                                            />
                                            <p className="text-xs text-gray-500 mt-1.5">
                                                Masukkan SKU produk atau varian untuk menambahkannya ke tabel perubahan stok.
                                            </p>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={!manualInput.trim() || loading === 'scan'}
                                            className="!bg-primary !text-white !py-2 !rounded-lg !font-medium w-full"
                                        >
                                            {loading === 'scan' ? 'Mencari...' : 'Tambah Produk'}
                                        </Button>
                                    </form>
                                )}
                            </div>

                            <style>{`
                                @keyframes scan {
                                    0%, 100% { top: 0%; }
                                    50% { top: 100%; }
                                }
                                .animate-scan { animation: scan 2s ease-in-out infinite; }
                            `}</style>
                        </div>
                    </div>

                    {/* Form Daftar Produk Terpilih Section */}
                    <div className="lg:w-[60%]">
                        <div className="bg-white rounded-xl shadow-sm border border-light-grey h-full relative flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-light-grey flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon icon="solar:box-minimalistic-bold-duotone" className="text-blue-500 text-xl" />
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        Daftar Produk Terpilih
                                    </h2>
                                </div>
                                <Badge color="blue" variant="light" size="lg">
                                    {selectedProducts.length} Produk
                                </Badge>
                            </div>

                            <ScrollArea className="flex-1" style={{ minHeight: 'calc(100vh - 300px)' }}>
                                <Table removeWrapper aria-label="Selected Products Table" style={{ minWidth: 800, width: "100%" }}>
                                    <TableHeader>
                                        <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold" style={{ minWidth: 150, padding: "12px 16px" }}>Produk</TableColumn>
                                        <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold text-center" style={{ width: 80, padding: "12px 16px" }}>Stok Awal</TableColumn>
                                        <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold" style={{ minWidth: 180, padding: "12px 16px" }}>Jenis Referensi</TableColumn>
                                        <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold" style={{ minWidth: 180, padding: "12px 16px" }}>Catatan</TableColumn>
                                        <TableColumn className="bg-gray-50/80 text-gray-600 font-semibold text-center" style={{ width: 100, padding: "12px 16px" }}>Qty</TableColumn>
                                        <TableColumn align="center" className="bg-gray-50/80 text-gray-600 font-semibold" style={{ width: 60, padding: "12px 16px" }}>Aksi</TableColumn>
                                    </TableHeader>

                                    <TableBody>
                                        {selectedProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                                                <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                                                <TableCell style={{ padding: "60px 16px", textAlign: "center" }}>
                                                    <Flex direction="column" align="center" justify="center" gap={8} style={{ color: "#9ca3af" }}>
                                                        <Icon icon="solar:inbox-line" width={48} style={{ color: "#d1d5db" }} />
                                                        <Text size="sm">Belum ada produk yang discan</Text>
                                                    </Flex>
                                                </TableCell>
                                                <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                                                <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                                                <TableCell style={{ padding: "60px 16px" }}>{null}</TableCell>
                                            </TableRow>
                                        ) : (
                                            selectedProducts.map((p) => {
                                                const dir = getDirection(p.referenceType);
                                                const finalStock = dir === "add" ? p.initial_stock + p.qty : Math.max(0, p.initial_stock - p.qty);

                                                return (
                                                    <TableRow key={p.id} className="border-b border-primary-light-200 last:border-0 hover:bg-gray-50/50 transition-colors" style={{ verticalAlign: "top" }}>
                                                        <TableCell style={CELL_STYLE}>
                                                            <Text fw={600} size="sm" className="text-gray-800" style={{ lineHeight: 1.3 }}>{p.product_name}</Text>
                                                            <Text size="xs" c="dimmed" mb={p.variants && p.variants.length > 0 ? "xs" : 0}>SKU: {p.sku}</Text>
                                                            {p.variants && p.variants.length > 0 && (
                                                                <Select
                                                                    placeholder="Pilih varian..."
                                                                    data={p.variants.map((v: any) => ({
                                                                        value: String(v.id),
                                                                        label: `${v.varian_name || v.name} (Stok: ${v.stock_summary?.sisa_stock ?? v.stock_qty ?? v.stock ?? 0})`
                                                                    }))}
                                                                    value={p.variant_id ? String(p.variant_id) : null}
                                                                    onChange={(val) => {
                                                                        const variantData = p.variants?.find((v: any) => String(v.id) === val);
                                                                        if (variantData) {
                                                                            handleRowChanges(p.id, {
                                                                                variant_id: Number(val),
                                                                                sku: variantData.sku || "-",
                                                                                initial_stock: variantData.stock_summary?.sisa_stock ?? variantData.stock_qty ?? variantData.stock ?? 0,
                                                                            });
                                                                        }
                                                                    }}
                                                                    size="xs"
                                                                    radius="md"
                                                                    className="mt-1"
                                                                    withScrollArea={false}
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell style={{ ...CELL_STYLE, textAlign: "center" }}>
                                                            <Badge color="gray" variant="light" size="lg" radius="sm">{p.initial_stock}</Badge>
                                                        </TableCell>
                                                        <TableCell style={CELL_STYLE}>
                                                            <Select
                                                                data={REFERENCE_TYPE_OPTIONS}
                                                                value={p.referenceType}
                                                                onChange={(val) => handleRowChange(p.id, "referenceType", val || "restock_supplier")}
                                                                size="sm"
                                                                radius="md"
                                                                withScrollArea={false}
                                                            />
                                                        </TableCell>
                                                        <TableCell style={CELL_STYLE}>
                                                            <TextInput
                                                                placeholder="Catatan opsional..."
                                                                value={p.notes}
                                                                onChange={(e) => handleRowChange(p.id, "notes", e.target.value)}
                                                                size="sm"
                                                                radius="md"
                                                            />
                                                        </TableCell>
                                                        <TableCell style={{ ...CELL_STYLE, textAlign: "center" }}>
                                                            <div style={{ display: "inline-block" }}>
                                                                <NumberInput
                                                                    value={p.qty}
                                                                    onChange={(val) => handleRowChange(p.id, "qty", typeof val === "number" ? val : 0)}
                                                                    allowNegative={false}
                                                                    min={0}
                                                                    w={80}
                                                                    size="sm"
                                                                    radius="md"
                                                                    classNames={{
                                                                        input: `text-center font-semibold ${dir === "add" ? "text-green-600" : "text-red-500"}`,
                                                                    }}
                                                                />
                                                                <div style={{ minHeight: 16, marginTop: 4, textAlign: "center" }}>
                                                                    {p.qty > 0 && (
                                                                        <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                                                                            → <strong style={{ color: "#374151" }}>{finalStock}</strong>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Submit Action */}
            {selectedProducts.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white p-4 px-6 border-t border-light-grey shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
                    <Flex justify="flex-end" className="max-w-7xl mx-auto w-full">
                        <Button
                            color="blue"
                            size="md"
                            radius="md"
                            loading={submitting}
                            onClick={handleSubmit}
                            leftSection={<Icon icon="solar:diskette-bold" width={20} />}
                            className="shadow-sm hover:shadow-md transition-shadow min-w-[200px]"
                        >
                            Simpan Perubahan
                        </Button>
                    </Flex>
                </div>
            )}
        </div>
    );
};

export default Scanner;