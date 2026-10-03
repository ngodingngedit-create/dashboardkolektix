import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Get } from "@/utils/REST";
import useLoggedUser from "@/utils/useLoggedUser";
import {
  Badge,
  Box,
  Card,
  Flex,
  Loader,
  Select,
  Text,
  Title,
} from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ProductOption {
  slug: string;
  product_name: string;
}

interface ReportTransaction {
  total_qty: number;
  transaction_status_id: number;
  product_variant: string;
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

const getStatusInfo = (statusId?: number) => {
  switch (statusId) {
    case 1:
      return { text: "Pending" };
    case 2:
      return { text: "Success" };
    case 3:
      return { text: "Failed" };
    case 4:
      return { text: "Expired" };
    default:
      return { text: "Unknown" };
  }
};

const PER_PAGE = 50;

const StockReport = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useLoggedUser();

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [allTransactions, setAllTransactions] = useState<ReportTransaction[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

        const mapped: ProductOption[] = all
          .filter((p: any) => p?.slug)
          .map((p: any) => ({
            slug: String(p.slug),
            product_name: p.product_name || p.name || String(p.slug),
          }));

        setProducts(mapped);
        // Auto-pilih produk pertama
        if (mapped.length > 0) {
          setSelectedSlug((prev) => prev ?? mapped[0].slug);
        }
      } catch (err) {
        console.error("Error fetching products for stock report:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId]);

  // Ambil detail produk + transaksi setiap kali produk terpilih berubah
  useEffect(() => {
    if (!selectedSlug) {
      setData(null);
      setAllTransactions([]);
      return;
    }

    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res: any = await Get(`product/${selectedSlug}`, {});
        if (res?.data) {
          const productData = res.data;
          setData(productData);
          await fetchTransactions(productData.id);
        } else {
          setData(null);
          setAllTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching product detail for stock report:", err);
        setData(null);
        setAllTransactions([]);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  // Bangun daftar transaksi produk terpilih (disederhanakan dari dashboard/merch/[slug])
  const fetchTransactions = async (productId: number) => {
    try {
      const res: any = await Get("order-bycreator", {});
      const orders = res?.data || [];
      const allTransactionsData: ReportTransaction[] = [];

      orders.forEach((item: any) => {
        let hasProduct = false;
        let productQty = 0;
        let productVariant = "";

        if (Array.isArray(item.detail)) {
          item.detail.forEach((detail: any) => {
            const detailProductId = detail.product_id || detail.product?.id;

            if (detailProductId === productId) {
              hasProduct = true;

              if (detail?.product?.product_name) {
                if (detail.variant) {
                  if (typeof detail.variant === "object") {
                    productVariant =
                      detail.variant.varian_name || detail.variant.name || "";
                  } else if (typeof detail.variant === "string") {
                    productVariant = detail.variant;
                  }
                }
                if (!productVariant && detail.variant_name) {
                  productVariant = detail.variant_name;
                }
              }

              productQty += detail.quantity || detail.qty || 0;
            }
          });
        } else {
          const rootProductId = item.product_id || item.product?.id;

          if (rootProductId === productId) {
            hasProduct = true;
            productQty = item.total_qty || item.qty || 0;
            if (item.variant_name || item.variant) {
              productVariant = item.variant_name || item.variant;
            }
          }
        }

        if (hasProduct) {
          const statusInfo = getStatusInfo(item.transaction_status_id);
          allTransactionsData.push({
            total_qty: productQty,
            transaction_status_id: item.transaction_status_id || 0,
            product_variant: productVariant || "-",
            status_name: statusInfo.text,
          } as ReportTransaction);
        }
      });

      setAllTransactions(allTransactionsData);
    } catch (err) {
      console.error("Error fetching transactions for stock report:", err);
      setAllTransactions([]);
    }
  };

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.slug,
        label: p.product_name,
      })),
    [products]
  );

  const variants: any[] = useMemo(
    () => data?.productVarian || data?.product_varian || [],
    [data]
  );

  const columns = [
    t("merchDetail.variant"),
    t("createMerch.colSku"),
    t("createMerch.price"),
    t("merchDetail.initialStock"),
    t("merchDetail.sold"),
    "Paid",
    "Pending",
    "Expired",
    t("merchDetail.remainingStock"),
  ];

  const renderTable = () => {
    if (loadingDetail) {
      return (
        <Flex align="center" justify="center" gap="sm" py="xl">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            {t("stock.loadingReport")}
          </Text>
        </Flex>
      );
    }

    if (!selectedSlug) {
      return (
        <Box py="xl" ta="center">
          <Text c="dimmed" size="sm">
            {products.length === 0 && !loadingProducts
              ? t("stock.noProducts")
              : t("stock.selectProductForReport")}
          </Text>
        </Box>
      );
    }

    if (variants.length === 0) {
      return (
        <Box py="xl" ta="center">
          <Text c="dimmed">{t("merchDetail.noVariantData")}</Text>
        </Box>
      );
    }

    return (
      <Box style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "max-content",
            minWidth: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f5f7fa",
                borderBottom: "2px solid #e8e8e8",
              }}
            >
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#777",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.map((v: any, i: number) => {
              const variantName =
                v.varian_name || v.name || v.variant_name || `Varian ${i + 1}`;
              const sku = v.sku || "-";
              const price = parsePrice(v.price || 0);
              const stockAwal =
                v.stock_summary?.stock_awal !== undefined
                  ? v.stock_summary.stock_awal
                  : v.stock_qty || v.stock || 0;

              // Hitung dari allTransactions (sama seperti dashboard/merch/[slug])
              const vTx = allTransactions.filter(
                (tx) =>
                  (tx.product_variant || "").toLowerCase() ===
                  variantName.toLowerCase()
              );
              const terjual =
                v.stock_summary?.terjual !== undefined
                  ? v.stock_summary.terjual
                  : vTx.reduce((s, tx) => s + (tx.total_qty || 0), 0);
              const paid = vTx
                .filter((tx) => tx.transaction_status_id === 2)
                .reduce((s, tx) => s + (tx.total_qty || 0), 0);
              const pending = vTx
                .filter((tx) => tx.transaction_status_id === 1)
                .reduce((s, tx) => s + (tx.total_qty || 0), 0);
              const expired = vTx
                .filter((tx) => tx.transaction_status_id === 4)
                .reduce((s, tx) => s + (tx.total_qty || 0), 0);
              const sisaStock =
                v.stock_summary?.sisa_stock !== undefined
                  ? v.stock_summary.sisa_stock
                  : Math.max(0, stockAwal - paid);
              const isSoldOut = sisaStock <= 0 && stockAwal > 0;

              return (
                <tr
                  key={v.id ?? i}
                  style={{ borderBottom: "1px solid #f0f0f0" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8fafd")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "")
                  }
                >
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <Text size="sm" fw={600}>
                      {variantName}
                    </Text>
                    {isSoldOut && (
                      <Badge size="xs" color="red" variant="filled" mt={4}>
                        SOLD OUT
                      </Badge>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <Badge
                      variant="light"
                      color="gray"
                      size="sm"
                      styles={{
                        label: {
                          textTransform: "none",
                          fontFamily: "monospace",
                        },
                      }}
                    >
                      {sku}
                    </Badge>
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <Text size="sm" fw={600}>
                      {formatRupiah(price)}
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    <Text size="sm">{stockAwal}</Text>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    <Text size="sm" fw={600}>
                      {terjual}
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    <Text size="sm" fw={700} c={paid > 0 ? "green" : "dimmed"}>
                      {paid}
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    <Text
                      size="sm"
                      fw={700}
                      c={pending > 0 ? "orange" : "dimmed"}
                    >
                      {pending}
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    <Text size="sm" fw={700} c={expired > 0 ? "red" : "dimmed"}>
                      {expired}
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    <Badge
                      color={
                        sisaStock === 0
                          ? "red"
                          : sisaStock <= 5
                            ? "orange"
                            : "green"
                      }
                      variant="filled"
                      size="md"
                      style={{
                        fontWeight: 700,
                        minWidth: 32,
                        justifyContent: "center",
                      }}
                    >
                      {sisaStock}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <>
      <Head>
        <title>
          {t("stock.reportTitle")} | Dashboard
        </title>
      </Head>

      <div className="px-4 pb-4 pt-2 md:px-6 md:pb-6 md:pt-3 bg-gray-50/50 min-h-screen">
        <div className="flex flex-col gap-2 w-full">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap="md">
            <Flex gap="md" align="flex-start">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm flex items-center justify-center"
              >
                <Icon icon="ph:arrow-left-bold" />
              </button>
              <div>
                <Title order={2} className="text-gray-900 font-semibold mb-1">
                  {t("stock.reportTitle")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("stock.reportDesc")}
                </Text>
              </div>
            </Flex>
          </Flex>

          <Card p="sm" radius="lg" className="border-0 shadow-none">
            {/* Dropdown produk — kanan atas tabel */}
            <Flex justify="flex-end" mb="xs">
              <Select
                label={t("stock.selectProduct")}
                placeholder={t("stock.searchProduct")}
                data={productOptions}
                value={selectedSlug}
                onChange={(val) => setSelectedSlug(val)}
                searchable
                disabled={loadingProducts || productOptions.length === 0}
                w={300}
                size="sm"
                styles={{
                  label: {
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#868e96",
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </Flex>

            {renderTable()}
          </Card>
        </div>
      </div>
    </>
  );
};

export default StockReport;
