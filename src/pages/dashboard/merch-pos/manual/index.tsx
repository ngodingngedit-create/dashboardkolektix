import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Get } from "@/utils/REST";
import fetch from "@/utils/fetch";
import useLoggedUser from "@/utils/useLoggedUser";
import { notifications } from "@mantine/notifications";
import {
  Button,
  Card,
  Divider,
  Flex,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ManualProduct {
  id: number;
  slug: string;
  product_name: string;
  price: any;
  product_varian?: any[];
  productVarian?: any[];
}

// Helper function untuk parse harga (sama seperti dashboard/merch/[slug])
const parsePrice = (price: any): number => {
  if (!price && price !== 0) return 0;
  if (typeof price === "number") return price;

  const priceStr = String(price).trim();

  if (priceStr.includes(".") && !priceStr.includes(",")) {
    const parts = priceStr.split(".");
    if (parts.length === 2) {
      if (parts[1].length >= 6) {
        return parseFloat(parts[0]);
      }
      return parseFloat(priceStr);
    }
  }

  if (priceStr.includes(".") && priceStr.match(/\./g)?.length === 1) {
    const withoutDots = priceStr.replace(/\./g, "");
    const parsed = parseFloat(withoutDots);
    return isNaN(parsed) ? 0 : parsed;
  }

  if (priceStr.includes(",")) {
    const withoutDots = priceStr.replace(/\./g, "");
    const withDotDecimal = withoutDots.replace(",", ".");
    const parsed = parseFloat(withDotDecimal);
    return isNaN(parsed) ? 0 : parsed;
  }

  const parsed = parseFloat(priceStr);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function untuk format rupiah (sama seperti dashboard/merch/[slug])
const formatRupiah = (value: number | string): string => {
  const numValue = typeof value === "string" ? parsePrice(value) : value;

  if (isNaN(numValue) || numValue === 0) {
    return "Rp 0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

// Fallback metode pembayaran (sama seperti dashboard/merch-pos)
const DEFAULT_PAYMENT_METHODS = [
  { id: 5, payment_name: "Cash" },
  { id: 4, payment_name: "QRIS" },
];

const PER_PAGE = 50;

const ManualTransaction = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useLoggedUser();

  const [products, setProducts] = useState<ManualProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<
    { id: number; payment_name: string }[]
  >(DEFAULT_PAYMENT_METHODS);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState<Date | null>(new Date());
  const [qty, setQty] = useState<number | string>(1);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const creatorId = user?.has_creator?.id;

  // Ambil daftar produk creator — API yang sama seperti dashboard/merch (GET product?...)
  useEffect(() => {
    if (!creatorId) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const buildQs = (pageNum: number) =>
          new URLSearchParams({
            per_page: String(PER_PAGE),
            page: String(pageNum),
            creator_id: String(creatorId),
            order_by: "created_at",
            order_direction: "desc",
          }).toString();

        const normalize = (res: any): any[] => {
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.data?.data)) return res.data.data;
          return [];
        };

        const firstRes: any = await Get(`product?${buildQs(1)}`, {});
        let all = normalize(firstRes);
        const lastPage = firstRes?.last_page ?? firstRes?.data?.last_page ?? 1;

        if (lastPage > 1) {
          const rest = await Promise.all(
            Array.from({ length: lastPage - 1 }, (_, i) =>
              Get(`product?${buildQs(i + 2)}`, {}).catch(() => null)
            )
          );
          rest.forEach((res) => {
            all = all.concat(normalize(res));
          });
        }

        setProducts(
          all.filter((p: any) => p?.id).map((p: any) => ({
            id: p.id,
            slug: p.slug ? String(p.slug) : "",
            product_name: p.product_name || p.name || "-",
            price: p.price || 0,
            product_varian: p.product_varian || p.productVarian || [],
          }))
        );
      } catch (err) {
        console.error("Error fetching products for manual transaction:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId]);

  // Ambil metode pembayaran — sama seperti dashboard/merch-pos (GET payment-method, filter Cash/QRIS)
  useEffect(() => {
    const getPaymentMethods = async () => {
      try {
        await fetch<any, any>({
          url: "payment-method",
          method: "GET",
          success: (response: any) => {
            const data = response?.data || response;
            if (Array.isArray(data)) {
              const filtered = data.filter((m: any) => m.id === 4 || m.id === 5);
              if (filtered.length > 0) {
                setPaymentMethods(filtered);
              }
            }
          },
          error: () => {
            setPaymentMethods(DEFAULT_PAYMENT_METHODS);
          },
        });
      } catch {
        setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      }
    };

    getPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: String(p.id),
        label: p.product_name,
      })),
    [products]
  );

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const variants = useMemo(
    () =>
      selectedProduct
        ? selectedProduct.product_varian || (selectedProduct as any).productVarian || []
        : [],
    [selectedProduct]
  );

  const variantOptions = useMemo(
    () =>
      variants.map((v: any) => {
        const name = v.varian_name || v.name || v.variant_name || "-";
        const stock =
          v.stock_summary?.sisa_stock ??
          v.stock_qty ??
          v.stock ??
          0;
        return {
          value: String(v.id),
          label: `${name} (Stok: ${stock})`,
        };
      }),
    [variants]
  );

  const selectedVariant = useMemo(
    () => variants.find((v: any) => String(v.id) === selectedVariantId) ?? null,
    [variants, selectedVariantId]
  );

  const variantPrice = selectedVariant
    ? parsePrice(selectedVariant.price || 0)
    : selectedProduct
      ? parsePrice(selectedProduct.price || 0)
      : 0;

  const variantStock = selectedVariant
    ? (selectedVariant.stock_summary?.sisa_stock ??
      selectedVariant.stock_qty ??
      selectedVariant.stock ??
      0)
    : 0;

  const total = variantPrice * (Number(qty) || 0);

  const handleProductChange = (val: string | null) => {
    setSelectedProductId(val);
    setSelectedVariantId(null);
    setQty(1);
  };

  // TODO: picks up POST order-product (is_pos: 1) — lihat dashboard/merch-pos/index.tsx:913-957.
  // Tahap ini UI saja: hanya validasi + pratinjau, belum ada POST.
  const handleSave = () => {
    if (!selectedProductId || !transactionDate || !qty || !paymentMethod) {
      notifications.show({
        message: t("manual.fillAllFields"),
        color: "red",
      });
      return;
    }

    if (selectedVariant && Number(qty) > variantStock) {
      notifications.show({
        message: t("manual.qtyExceedsStock"),
        color: "red",
      });
      return;
    }

    notifications.show({
      message: t("manual.submitSoon"),
      color: "blue",
    });
  };

  return (
    <>
      <Head>
        <title>
          {t("manual.title")} | Dashboard
        </title>
      </Head>

      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        <div className="flex flex-col gap-6 w-full">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap="md">
            <Flex gap="md" align="flex-start">
              <button
                type="button"
                onClick={() => router.push("/dashboard/merch-pos")}
                className="w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm flex items-center justify-center"
              >
                <Icon icon="ph:arrow-left-bold" />
              </button>
              <div>
                <Title order={2} className="text-gray-900 font-semibold mb-1">
                  {t("manual.title")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("manual.desc")}
                </Text>
              </div>
            </Flex>
          </Flex>

          <Card p="lg" radius="lg" className="border-0 shadow-none">
            <Stack gap="md" w="100%" pb={80}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Select
                withAsterisk
                label={t("manual.product")}
                placeholder={
                  loadingProducts
                    ? t("stock.loadingReport")
                    : products.length === 0
                      ? t("manual.noProducts")
                      : t("manual.selectProduct")
                }
                data={productOptions}
                value={selectedProductId}
                onChange={handleProductChange}
                searchable
                disabled={loadingProducts || productOptions.length === 0}
                nothingFoundMessage={t("manual.searchProduct")}
                size="sm"
              />

              <Select
                withAsterisk
                label={t("manual.variant")}
                placeholder={
                  !selectedProductId
                    ? t("manual.selectProductFirst")
                    : t("manual.selectVariant")
                }
                data={variantOptions}
                value={selectedVariantId}
                onChange={setSelectedVariantId}
                searchable
                disabled={!selectedProductId || variantOptions.length === 0}
                size="sm"
              />

              <DatePickerInput
                withAsterisk
                label={t("manual.transactionDate")}
                value={transactionDate}
                onChange={setTransactionDate}
                maxDate={new Date()}
                size="sm"
              />

              <NumberInput
                withAsterisk
                label={t("manual.qty")}
                value={qty}
                onChange={setQty}
                min={1}
                max={selectedVariant ? variantStock : undefined}
                size="sm"
              />

              <Select
                withAsterisk
                label={t("manual.paymentMethod")}
                placeholder={t("manual.selectPaymentMethod")}
                data={paymentMethods.map((m) => ({
                  value: m.payment_name,
                  label: m.payment_name,
                }))}
                value={paymentMethod}
                onChange={setPaymentMethod}
                size="sm"
              />
              </SimpleGrid>

              <Divider />

              <Flex justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  {t("manual.total")}
                </Text>
                <Text size="lg" fw={700}>
                  {formatRupiah(total)}
                </Text>
              </Flex>
            </Stack>
          </Card>
        </div>
      </div>

      {/* Sticky footer */}
      <Card
        pos="fixed"
        className="!bottom-0 !left-0 !right-0 !z-10 !border-t !border-[#d0d0d0]"
        radius={0}
        py={15}
        px={30}
        style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}
      >
        <Flex justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            onClick={() => router.push("/dashboard/merch-pos")}
          >
            {t("manual.cancel")}
          </Button>
          <Button color="blue" onClick={handleSave}>
            {t("manual.save")}
          </Button>
        </Flex>
      </Card>
    </>
  );
};

export default ManualTransaction;
