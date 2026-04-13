import useLoggedUser from "@/utils/useLoggedUser";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Accordion,
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Image,
  LoadingOverlay,
  Menu,
  Modal,
  NumberFormatter,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
  Popover,
  Tooltip,
} from "@mantine/core";
import { MerchListResponse } from "../merch/type";
import { useEffect, useMemo, useState } from "react";
import { useListState } from "@mantine/hooks";
import fetch from "@/utils/fetch";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import _ from "lodash";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { DatePickerInput, DatesRangeValue, DatePicker } from "@mantine/dates";

type ComponentProps = {};

type CustomerData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type PaymentMethod = {
  id: number;
  payment_type_id: number;
  payment_name: string;
  account_no: string | null;
  account_name: string;
  account_branch: string;
  description: string | null;
  status: string;
  image: string | null;
  logo: string | null;
};

export type MerchCheckoutOffline = {
  product: {
    id: number;
    variant_id?: number;
    qty: number;
    price: number;
    subtotal: number;
  }[];
  invoice_num?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  discount?: number;
  summary?: { [key: string]: number };
  grandtotal: number;
  creator_id: number;
  payment_method?: string;
};

type TransactionItem = {
  id: number;
  invoice_number: string;
  invoice_no: string;
  customer_name: string;
  total_amount: number;
  status: string;
  transaction_status_id?: number;
  payment_method: string;
  created_at: string;
  items?: {
    product_name: string;
    quantity: number;
    price: number;
  }[];
};

type ProductApiResponse = {
  data: MerchListResponse[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
};

export default function Index({ }: Readonly<ComponentProps>) {
  const user = useLoggedUser();
  const [loading, setLoading] = useListState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [merch, setMerch] = useState<MerchListResponse[]>([]);
  const [productCache, setProductCache] = useState<Record<number, MerchListResponse>>({});
  const [discount, setDiscount] = useState(0);
  const [openSelect, setOpenSelect] = useState(false);
  const [openCustForm, setOpenCustForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selected, setSelected] = useState<
    {
      id: number;
      variant_id?: number;
      count: number;
    }[]
  >([]);
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>("order");
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const [transactionStatus, setTransactionStatus] = useState<string>("all");
  const [printBillLoading, setPrintBillLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // State untuk pagination produk
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productPerPage, setProductPerPage] = useState(10);

  const {
    values: custValue,
    getInputProps: custProps,
    errors: custError,
    validate: custValidate,
  } = useForm<CustomerData>({
    onValuesChange: (val) => {
      val.phone = String(val.phone ?? "").replace(/\D/g, "");
      return val;
    },
    validate: zodResolver(
      z.object({
        name: z.string().optional().nullable(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
      })
    ),
  });

  useEffect(() => {
    if (user?.has_creator?.id) {
      getMerchList(productPage);
      getTransactions();
      getPaymentMethods();
    }
  }, [user]);

  useEffect(() => {
    // Lakukan pencarian ke API dengan debounce
    const timeoutId = setTimeout(() => {
      if (user?.has_creator?.id) {
        setProductPage(1);
        getMerchList(1, searchQuery);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?.has_creator?.id]);

  useEffect(() => {
    // Lakukan pencarian transaksi ke API secara otomatis dengan debounce
    const timeoutId = setTimeout(() => {
      if (user?.has_creator?.id) {
        setTransactionPage(1);
        getTransactions(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [transactionSearch, transactionStatus, dateRange, user?.has_creator?.id]);

  // Fungsi untuk mendapatkan status dari transaction_status_id
  const getStatusFromId = (statusId: number): { text: string; color: string } => {
    const statusMap: Record<number, { text: string; color: string }> = {
      1: { text: "Pending", color: "orange" },
      2: { text: "Success", color: "green" },
      3: { text: "Expired", color: "gray" },
      4: { text: "Failed", color: "red" },
      5: { text: "Cancelled", color: "red" },
    };

    return statusMap[statusId] || { text: "Unknown", color: "gray" };
  };

  const getPaymentMethods = async () => {
    try {
      await fetch<any, any>({
        url: "payment-method",
        method: "GET",
        before: () => setLoading.append("get-payment-methods"),
        success: (response) => {
          let data = response.data || response;

          if (data && Array.isArray(data)) {
            const filteredMethods = data.filter((method: any) =>
              method.id === 4 || method.id === 5
            );

            if (filteredMethods.length > 0) {
              setPaymentMethods(filteredMethods);
              const cashMethod = filteredMethods.find((method: any) => method.id === 5);
              if (cashMethod) {
                setPaymentMethod(cashMethod.payment_name);
              } else if (filteredMethods.length > 0) {
                setPaymentMethod(filteredMethods[0].payment_name);
              }
            } else {
              setPaymentMethods(data.slice(0, 2));
              if (data.length > 0) {
                setPaymentMethod(data[0].payment_name);
              }
            }
          } else {
            setDefaultPaymentMethods();
          }
        },
        complete: () => setLoading.filter((e) => e != "get-payment-methods"),
        error: (err) => {
          console.error("Error fetching payment methods:", err);
          setDefaultPaymentMethods();
        },
      });
    } catch (error) {
      console.error("Unexpected error in getPaymentMethods:", error);
      setDefaultPaymentMethods();
    }
  };

  const setDefaultPaymentMethods = () => {
    const defaultMethods = [
      {
        id: 5,
        payment_type_id: 1,
        payment_name: "Cash",
        account_no: null,
        account_name: "cash",
        account_branch: "cash",
        description: null,
        status: "active",
        image: null,
        logo: "cash.png",
      },
      {
        id: 4,
        payment_type_id: 1,
        payment_name: "QRIS",
        account_no: "3190267317",
        account_name: "Direct Xendit",
        account_branch: "Direct Xendit",
        description: "Others",
        status: "active",
        image: null,
        logo: "xendit.png",
      },
    ];
    setPaymentMethods(defaultMethods);
    setPaymentMethod("Cash");
  };

  const getMerchList = async (pageNum: number = 1, searchQueryParam: string = searchQuery) => {
    // Dapatkan creator_id dari user yang sedang login
    const creatorId = user?.has_creator?.id;
    if (!creatorId) {
      console.log("Creator ID tidak ditemukan");
      setMerch([]);
      setProductTotal(0);
      setProductTotalPages(1);
      return;
    }

    const isSearching = searchQueryParam.trim().length > 0;

    const params: Record<string, string> = {
      per_page: isSearching ? "9999" : String(productPerPage),
      page: String(pageNum),
      // Tambahkan filter creator_id
      creator_id: String(creatorId)
    };

    const qs = new URLSearchParams(params).toString();

    const url = `product-bymerchant?${qs}`;

    const envToken = (process?.env?.NEXT_PUBLIC_API_TOKEN as string) || "";
    const cookieToken = Cookies.get("token") || localStorage.getItem("token") || "";
    const token = envToken || cookieToken || "";

    console.log("Fetching products page", pageNum, "for creator:", creatorId, "from:", url);

    await fetch<any, ProductApiResponse>({
      url,
      method: "GET",
      headers: token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : undefined,
      before: () => setLoading.append("getdata"),
      success: (response) => {
        console.log("Product API response for creator", creatorId, ":", response);

        let products: MerchListResponse[] = [];
        let total = 0;
        let totalPages = 1;
        let currentPage = pageNum;

        // Menyesuaikan dengan format Product, maupun product-bymerchant
        const paginationObj = response?.data?.data && Array.isArray(response.data.data) ? response.data : response;

        if (paginationObj?.data && Array.isArray(paginationObj.data)) {
          products = paginationObj.data;
          total = paginationObj.total || products.length;
          totalPages = paginationObj.last_page || Math.ceil(total / productPerPage);
          currentPage = paginationObj.current_page || pageNum;
          if (!isSearching) {
            setProductPerPage(paginationObj.per_page || productPerPage);
          }
        } else if (Array.isArray(paginationObj)) {
          products = paginationObj;
          total = products.length;
          totalPages = Math.ceil(total / productPerPage);
        }

        // Filter hanya produk dengan status active (product_status_id == 2)
        const filtered = products.filter((e) => e.product_status_id == 2);
        console.log("Page", currentPage, "- Total products fetched:", products.length, "Active:", filtered.length);
        console.log("Pagination - Total:", total, "Pages:", totalPages, "Current:", currentPage);

        setMerch(filtered);
        setProductTotal(total);
        setProductTotalPages(totalPages);
        setProductPage(currentPage);

        setProductCache((prev) => {
          const next = { ...prev };
          for (const it of filtered) {
            next[it.id] = it;
          }
          return next;
        });
      },
      complete: () => setLoading.filter((e) => e != "getdata"),
      error: (err) => {
        console.error("getMerchList error:", err);
        setMerch([]);
        setProductTotal(0);
        setProductTotalPages(1);
      },
    });
  };

  const getTransactions = async (page: number = 1) => {
    const creatorId = user?.has_creator?.id;
    if (!creatorId) return;

    let url = `order-bycreator?creator_id=${creatorId}&page=${page}&limit=10&order_by=created_at&order_direction=desc`;

    if (transactionSearch.trim()) {
      url += `&search=${encodeURIComponent(transactionSearch.trim())}`;
    }

    if (transactionStatus !== "all") {
      url += `&status=${transactionStatus}`;
    }

    const [startDate, endDate] = dateRange;
    if (startDate) {
      const startDateStr = startDate.toISOString().split("T")[0];
      url += `&start_date=${startDateStr}`;
    }

    if (endDate) {
      const endDateStr = endDate.toISOString().split("T")[0];
      url += `&end_date=${endDateStr}`;
    }

    await fetch<any, any>({
      url,
      method: "GET",
      before: () => setLoading.append("get-transactions"),
      success: ({ data }) => {
        let formattedTransactions: TransactionItem[] = [];
        let total = 0;

        if (data?.data) {
          formattedTransactions = data.data.map((item: any) => {
            const pm = (item.payment_method_custom || item.payment_method || "").toLowerCase();
            const isCash = pm.includes("cash") || pm === "";
            return ({
              id: item.id,
              invoice_number: item.invoice_number || `KL-${item.id}`.padStart(6, "0"),
              invoice_no: item.invoice_no || item.invoice_number || `KL-${item.id}`.padStart(6, "0"),
              customer_name: item.customer_name || item.nama_pemesan || "Guest",
              total_amount: isCash ? (item.total_price || item.grandtotal || item.total_amount || 0) : (item.grandtotal || item.total_amount || 0),
              status: item.status || "completed",
              transaction_status_id: item.transaction_status_id ||
                (item.status === "pending" ? 1 :
                  item.status === "completed" ? 2 :
                    item.status === "expired" ? 3 :
                      item.status === "failed" ? 4 : 1),
              payment_method: item.payment_method_custom || item.payment_method || "Cash",
              created_at: item.created_at || new Date().toISOString(),
              items: item.items || item.products || [],
            });
          });
          total = data.total || data.meta?.total || formattedTransactions.length;
        } else if (Array.isArray(data)) {
          formattedTransactions = data.map((item: any) => {
            const pm = (item.payment_method_custom || item.payment_method || "").toLowerCase();
            const isCash = pm.includes("cash") || pm === "";
            return ({
              id: item.id,
              invoice_number: item.invoice_number || `KL-${item.id}`.padStart(6, "0"),
              invoice_no: item.invoice_no || item.invoice_number || `KL-${item.id}`.padStart(6, "0"),
              customer_name: item.customer_name || item.nama_pemesan || "Guest",
              total_amount: isCash ? (item.total_price || item.grandtotal || item.total_amount || 0) : (item.grandtotal || item.total_amount || 0),
              status: item.status || "completed",
              transaction_status_id: item.transaction_status_id ||
                (item.status === "pending" ? 1 :
                  item.status === "completed" ? 2 :
                    item.status === "expired" ? 3 :
                      item.status === "failed" ? 4 : 1),
              payment_method: item.payment_method_custom || item.payment_method || "Cash",
              created_at: item.created_at || new Date().toISOString(),
              items: item.items || item.products || [],
            });
          });
          total = formattedTransactions.length;
        }

        formattedTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setTransactions(formattedTransactions);
        setTotalTransactions(total);
      },
      complete: () => setLoading.filter((e) => e != "get-transactions"),
      error: (err) => {
        console.error("Error fetching transactions:", err);
      },
    });
  };

  const handleSearchTransactions = () => {
    setTransactionPage(1);
    getTransactions(1);
  };

  const handleResetFilters = () => {
    setTransactionSearch("");
    setDateRange([null, null]);
    setTransactionStatus("all");
    setTransactionPage(1);
    getTransactions(1);
  };

  const merchList = useMemo(() => {
    const normalize = (s: unknown) =>
      (s ?? "")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\-_.]/g, "");

    const q = normalize(searchQuery);

    return (
      merch
        ?.filter(Boolean)
        .filter((e) => {
          if (!q) return true;

          const name = normalize(e.product_name);
          const skuMain = normalize((e as any).sku);

          const variantSKUs = (e.product_varian ?? []).map((v) => normalize(v?.sku));
          const variantNames = (e.product_varian ?? []).map((v) => normalize(v?.varian_name));

          const searchableParts = [name, skuMain, ...variantSKUs, ...variantNames].filter(Boolean);
          const searchable = searchableParts.join(" | ");

          return searchable.includes(q);
        })
        .map((e) => ({
          name: e.product_name,
          price: (e.product_varian?.length ?? 0) > 0 ? e.product_varian.map((v) => parseInt(v.price ?? "0")).reduce((acc, price) => [Math.min(acc[0], price), Math.max(acc[1], price)], [Infinity, -Infinity]) : [parseInt(e.price ?? "0")],
          image: (e.product_image?.length ?? 0) > 0 ? e.product_image[0].image_url : "#",
          raw: e,
          stock: (e.product_varian?.length ?? 0) > 0 ? e.product_varian.reduce((sum, v) => sum + (v.stock_qty ?? 0), 0) : (e.qty ?? 0),
        })) ?? []
    );
  }, [merch, searchQuery]);

  const selectedList = useMemo(() => {
    return selected.map((e) => {
      const product = productCache[e.id];
      const name = product?.product_name;
      const variant_name = product?.product_varian?.find((z) => z.id == e.variant_id)?.varian_name;
      const image = (product?.product_image?.length ?? 0) > 0 ? product?.product_image[0].image_url : "#";
      const price = !e.variant_id ? parseInt(product?.price ?? "999999") : parseInt(product?.product_varian?.find((z) => z.id == e.variant_id)?.price ?? "999999");
      const subtotal = price * e.count;
      const stock = !e.variant_id ? (product?.qty ?? 0) : (product?.product_varian?.find((z) => z.id == e.variant_id)?.stock_qty ?? 0);

      return { id: e.id, variant_id: e.variant_id, name, variant_name, price, image, count: e.count, stock, subtotal };
    });
  }, [selected, productCache]);

  const handleAddProduct = (product: MerchListResponse) => {
    setProductCache((prev) => ({ ...prev, [product.id]: product }));

    if (product.product_varian.length > 0) {
      const selectVariant = (variant: MerchListResponse["product_varian"][number]) => {
        if (selected.some((e) => e.variant_id == variant.id)) {
          const validStock = variant.stock_qty > (selected.find((e) => e.variant_id == variant.id)?.count ?? 9999);
          if (validStock) {
            setSelected(selected.map((e) => (e.variant_id == variant.id ? { ...e, count: e.count + 1 } : e)));
          } else {
            notifications.show({
              message: "Stock sudah mencapai maksimal",
              color: "red",
            });
          }
        } else {
          setSelected([...selected, { id: product.id, variant_id: variant.id, count: 1 }]);
        }
        modals.closeAll();
        setOpenSelect(!openSelect);
      };

      modals.open({
        size: 300,
        centered: true,
        title: "Pilih Varian",
        children: (
          <Stack gap={10}>
            {product.product_varian.map((e, i) => (
              <Button size="md" radius={8} onClick={() => selectVariant(e)} key={i} variant="light" color="gray" c="gray.8" fw={400}>
                {e.varian_name} (<NumberFormatter value={parseInt(e.price)} />)
              </Button>
            ))}
          </Stack>
        ),
      });
    } else {
      if (selected.some((e) => e.id == product.id)) {
        const validStock = product.qty > (selected.find((e) => e.id == product.id)?.count ?? 9999);
        if (validStock) {
          setSelected(selected.map((e) => (e.id == product.id ? { ...e, count: e.count + 1 } : e)));
        } else {
          notifications.show({
            message: "Stock sudah mencapai maksimal",
            color: "red",
          });
        }
      } else {
        setSelected([...selected, { id: product.id, count: 1 }]);
      }
      setOpenSelect(!openSelect);
    }
  };

  const handleDeleteItem = (index: number) => {
    modals.openConfirmModal({
      centered: true,
      title: "Hapus Item",
      children: "Apakah kamu yakin ingin menghapus item ini?",
      labels: { confirm: "Hapus", cancel: "Batal" },
      onConfirm: () => {
        setSelected(selected.filter((_, i) => i != index));
      },
    });
  };

  const handleSummary = useMemo((): { total: number; detail: [string, number][] } => {
    const subtotal = selectedList.reduce((q, n) => q + (n.subtotal ?? 0), 0);
    const admin = 0;
    const disc = Boolean(discount) || discount < 0 ? discount * -1 : 0;
    const total = Math.max(0, _.sum([subtotal, admin, disc]));

    return {
      total,
      detail: [
        ["Subtotal", subtotal],
        ["Diskon", disc],
        ["Admin", 0],
      ],
    };
  }, [selectedList, discount]);

  const openSelectPayment = () => {
    if (paymentMethods.length === 0) {
      notifications.show({
        message: "Metode pembayaran belum tersedia. Silakan refresh halaman.",
        color: "yellow"
      });
      return;
    }

    modals.open({
      centered: true,
      title: "Pilih Metode Pembayaran",
      children: (
        <Stack gap={15}>
          {paymentMethods.map((method, i) => {
            const isCash = method.payment_name?.toLowerCase().includes("cash");
            const isSelected = paymentMethod === method.payment_name;
            return (
              <Button
                key={i}
                leftSection={
                  isCash
                    ? <Icon icon="ph:money-wavy" className="text-[24px]" />
                    : <Icon icon="ph:qr-code-bold" className="text-[24px]" />
                }
                variant={isSelected ? "filled" : "light"}
                color={isSelected ? "blue" : "gray"}
                c={isSelected ? "white" : "gray.8"}
                onClick={() => {
                  setPaymentMethod(method.payment_name);
                  modals.closeAll();
                }}
                fullWidth
                justify="start"
              >
                {isCash ? "Cash" : "QRIS"}
              </Button>
            );
          })}
        </Stack>
      ),
    });
  };

  const handleCustomerSave = () => {
    const valid = custValidate();
    if (valid.hasErrors) return;
    setOpenCustForm(false);
    modals.closeAll();
  };

  const handlePrintBill = () => {
    if (selectedList.length === 0) {
      notifications.show({ message: "Pilih minimal 1 produk untuk print bill", color: "red" });
      return;
    }

    setPrintBillLoading(true);

    const billContent = generateBillContent();

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Bill</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                max-width: 300px;
                margin: 0 auto;
                padding: 10px;
              }
              .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .store-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .date {
                font-size: 11px;
                margin-bottom: 10px;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
              }
              .items-table th {
                text-align: left;
                border-bottom: 1px solid #000;
                padding: 5px 0;
              }
              .items-table td {
                padding: 3px 0;
                border-bottom: 1px dashed #ccc;
              }
              .total-section {
                margin-top: 15px;
                border-top: 1px solid #000;
                padding-top: 10px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .grand-total {
                font-weight: bold;
                font-size: 14px;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 11px;
                border-top: 1px dashed #000;
                padding-top: 10px;
              }
              @media print {
                @page {
                  margin: 0;
                  size: 80mm auto;
                }
                body {
                  max-width: 80mm;
                }
              }
            </style>
          </head>
          <body>
            ${billContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    setTimeout(() => {
      setPrintBillLoading(false);
      notifications.show({
        message: "Bill berhasil dicetak",
        color: "green",
      });
    }, 1000);
  };

  const generateBillContent = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("id-ID");
    const invoiceNumber = `POS-${Date.now().toString().slice(-6)}`;

    let itemsHTML = "";
    selectedList.forEach((item, index) => {
      itemsHTML += `
        <tr>
          <td>${item.name}${item.variant_name ? ` (${item.variant_name})` : ""}</td>
          <td align="center">${item.count}</td>
          <td align="right">${item.price.toLocaleString("id-ID")}</td>
          <td align="right">${item.subtotal.toLocaleString("id-ID")}</td>
        </tr>
      `;
    });

    return `
      <div class="header">
        <div class="store-name">TOKO ${user?.has_creator?.name?.toUpperCase() || "MERCH"}</div>
        <div>Jl. Example No. 123</div>
        <div>Telp: 021-12345678</div>
        <div class="date">${dateStr} ${timeStr}</div>
        <div>Invoice: ${invoiceNumber}</div>
        ${custValue.name ? `<div>Pelanggan: ${custValue.name}</div>` : ""}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Produk</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="total-section">
        ${handleSummary.detail
        .filter(([label, value]) => value !== 0)
        .map(
          ([label, value]) => `
            <div class="total-row">
              <span>${label}:</span>
              <span>Rp ${Math.abs(value).toLocaleString("id-ID")}</span>
            </div>
          `
        )
        .join("")}
        
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>Rp ${handleSummary.total.toLocaleString("id-ID")}</span>
        </div>
        
        <div class="total-row">
          <span>Pembayaran:</span>
          <span>${paymentMethod}</span>
        </div>
      </div>

      <div class="footer">
        <div>Terima kasih atas kunjungan Anda</div>
        <div>*** ${invoiceNumber} ***</div>
      </div>
    `;
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      notifications.show({ message: "Pilih metode pembayaran terlebih dahulu.", color: "red" });
      return;
    }
    if ((selectedList ?? []).length === 0) {
      notifications.show({ message: "Pilih minimal 1 produk sebelum checkout.", color: "red" });
      return;
    }

    const name = (custValue.name ?? "").toString().trim();
    const email = (custValue.email ?? "").toString().trim();
    const phone = (custValue.phone ?? "").toString().trim();
    const address = (custValue.address ?? "").toString().trim();

    if (!name && !email && !phone && !address) {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const guestName = `Guest ${randomId}`;
      const guestEmail = `guest_${randomId}@mail.com`;
      const guestPhone = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
      const guestAddress = "Jalanan " + Math.floor(Math.random() * 100) + " Rumah " + Math.floor(Math.random() * 100);

      const safeChange = (propName: keyof CustomerData, value: string) => {
        const p = custProps(propName as any) as any;
        if (!p || typeof p.onChange !== "function") return;
        try {
          p.onChange(value);
        } catch {
          try {
            p.onChange({ target: { value } });
          } catch { }
        }
      };

      safeChange("name", guestName);
      safeChange("email", guestEmail);
      safeChange("phone", guestPhone);
      safeChange("address", guestAddress);
    }

    const payloadName = (custValue.name ?? "").toString() || `Guest`;
    const payloadEmail = (custValue.email ?? "").toString() || "-";
    const payloadPhone = (custValue.phone ?? "").toString() || "";
    const payloadAddress = (custValue.address ?? "").toString() || "";

    const productsPayload = (selectedList ?? []).map((e) => ({
      product_id: e.id,
      variant_id: e.variant_id ?? null,
      qty: e.count,
      price: e.price,
    }));

    const creatorId = user?.has_creator?.id ?? 0;
    const courierPayload = { main: "-", type: "-", price: 0 };
    const addressPayload = {
      id: null,
      is_main_address: 1,
      province_id: 1,
      city_id: 1,
      address_detail: payloadAddress,
      address_name: payloadName,
      zipcode: Math.floor(10000 + Math.random() * 90000).toString(),
      latitude: "",
      longitude: "",
      nama_penerima: payloadName,
      phone: payloadPhone,
      is_active: 1,
    };

    try {
      let paymentMethodId = 5;
      if (paymentMethod.includes("QRIS") || paymentMethod === "Pilih Metode Pembayaran") {
        paymentMethodId = 4;
      }

      const payload = {
        user_id: user?.id ?? null,
        nama_pemesan: payloadName,
        email_pemesan: payloadEmail,
        creator_id: creatorId,
        grandtotal: handleSummary.total,
        product: productsPayload,
        payment_method: paymentMethod,
        payment_method_id: paymentMethodId,
        courier: courierPayload,
        address: addressPayload,
      };

      if (paymentMethod.includes("Cash") || paymentMethod === "Cash") {
        const cashPayload = {
          ...payload,
          status: "completed",
        };

        await fetch<any, any>({
          url: "order-product",
          method: "POST",
          data: cashPayload,
          before: () => setLoading.append("checkout"),
          success: async ({ data }) => {
            console.log("Cash payment success:", data);

            await handleSave();

            notifications.show({
              message: "Pembayaran Cash berhasil diproses",
              color: "green",
            });

            handlePrintBill();
          },
          complete: () => setLoading.filter((e) => e != "checkout"),
          error: (err) => {
            console.error("Cash payment error:", err);

            if (err?.response?.data?.out_of_stock || err?.response?.out_of_stock) {
              notifications.show({
                color: "red",
                message: "Produk sudah habis stok",
              });
              return;
            }

            const msg = err?.response?.data?.message ?? "Gagal checkout. Periksa kembali input.";
            notifications.show({ message: msg, color: "red" });
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        const qrisPayload = {
          ...payload,
          status: "pending",
        };

        await fetch<any, any>({
          url: "order-product",
          method: "POST",
          data: qrisPayload,
          before: () => setLoading.append("checkout"),
          success: async ({ data }) => {
            console.log("Xendit response:", data);

            // Read the invoice URL from various possible API structures
            const invoiceUrl =
              data?.xendit?.[0]?.invoice_url ||
              data?.data?.xendit?.[0]?.invoice_url ||
              data?.invoice_url ||
              data?.data?.invoice_url;

            if (invoiceUrl) {
              // Direct langsung menuju Xendit
              window.location.href = invoiceUrl;
              return;
            }

            // Fallback kembali ke halaman invoice lokal bila tidak ada link
            await handleSave();

            notifications.show({
              message: "Checkout sukses, masuk ke sistem lokal.",
              color: "yellow",
            });
          },
          complete: () => setLoading.filter((e) => e != "checkout"),
          error: (err) => {
            console.error("handleCheckout error:", err);

            if (err?.response?.data?.out_of_stock || err?.response?.out_of_stock) {
              notifications.show({
                color: "red",
                message: "Produk sudah habis stok",
              });
              return;
            }

            const msg = err?.response?.data?.message ?? "Gagal checkout. Periksa kembali input.";
            notifications.show({ message: msg, color: "red" });
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch (err) {
      console.error("unexpected handleCheckout error:", err);
      notifications.show({ message: "Terjadi kesalahan tak terduga saat checkout.", color: "red" });
      setLoading.filter((e) => e != "checkout");
    }
  };

  const handleSave = async () => {
    const summary: MerchCheckoutOffline["summary"] = {};
    for (const s of handleSummary.detail) summary[s[0]] = s[1];

    const data: MerchCheckoutOffline = {
      product: selectedList.map((e) => ({
        id: e.id,
        variant_id: e.variant_id,
        qty: e.count,
        price: e.price,
        subtotal: e.subtotal,
      })),
      customer_name: custValue.name,
      customer_email: custValue.email,
      customer_phone: custValue.phone,
      customer_address: custValue.address,
      grandtotal: handleSummary.total,
      creator_id: user?.has_creator?.id ?? 0,
      summary,
      discount,
      payment_method: paymentMethod,
    };
    const next = () => {
      Cookies.set("merch_pos_submit", JSON.stringify(data satisfies MerchCheckoutOffline));
      router.push("/dashboard/merch-pos-invoice");
    };
    await fetch<MerchCheckoutOffline, any>({
      url: "merch-offline",
      method: "POST",
      data,
      before: () => setLoading.append("submit"),
      success: () => {
        next();
      },
      complete: () => setLoading.filter((e) => e != "submit"),
      error: (err) => {
        next();
        notifications.show({
          message: err?.response?.data?.message ?? "Terjadi Kesalahan",
          color: "red",
        });
      },
    });
  };

  const renderStatusBadge = (status: string | number) => {
    // Jika status adalah number (transaction_status_id)
    if (typeof status === "number") {
      const statusInfo = getStatusFromId(status);
      return (
        <Badge color={statusInfo.color as any} variant="light" size="sm">
          {statusInfo.text}
        </Badge>
      );
    }

    // Jika status adalah string (backward compatibility)
    const statusConfig: Record<string, { color: string; label: string }> = {
      completed: { color: "green", label: "Selesai" },
      pending: { color: "yellow", label: "Pending" },
      cancelled: { color: "red", label: "Dibatalkan" },
      processing: { color: "blue", label: "Diproses" },
      paid: { color: "green", label: "Dibayar" },
      unpaid: { color: "orange", label: "Belum Dibayar" },
      success: { color: "green", label: "Success" },
      failed: { color: "red", label: "Failed" },
      expired: { color: "red", label: "Expired" },
    };

    const config = statusConfig[status.toLowerCase()] || { color: "gray", label: status };

    return (
      <Badge color={config.color as any} variant="light" size="sm">
        {config.label}
      </Badge>
    );
  };

  const handlePrevPage = () => {
    if (productPage > 1) {
      const newPage = productPage - 1;
      setProductPage(newPage);
      getMerchList(newPage);
    }
  };

  const handleNextPage = () => {
    if (productPage < productTotalPages) {
      const newPage = productPage + 1;
      setProductPage(newPage);
      getMerchList(newPage);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== productPage) {
      setProductPage(page);
      getMerchList(page);
    }
  };

  const isGuest = custValue.name?.startsWith("Guest ") && custValue.email?.includes("guest_");

  return (
    <Stack className={`md:!p-[20px_30px] h-screen flex flex-col`}>
      <Modal title="Data Pembeli" opened={openCustForm} onClose={handleCustomerSave} closeOnClickOutside={false} centered>
        <Stack gap={15}>
          <Button
            variant="light"
            color="gray"
            onClick={() => {
              const randomId = Math.floor(100000 + Math.random() * 900000);
              const randomName = `Guest ${randomId}`;
              const randomEmail = `guest_${randomId}@mail.com`;
              const randomAddress = "Jalanan " + Math.floor(Math.random() * 100) + " Rumah " + Math.floor(Math.random() * 100);

              const randomPhone = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");

              const safeChange = (propName: keyof CustomerData, value: string) => {
                const p = custProps(propName as any) as any;
                if (!p || typeof p.onChange !== "function") return;

                try {
                  p.onChange(value);
                } catch (err) {
                  try {
                    p.onChange({ target: { value } });
                  } catch (err2) { }
                }
              };

              safeChange("name", randomName);
              safeChange("email", randomEmail);
              safeChange("phone", randomPhone);
              safeChange("address", randomAddress);
            }}
          >
            Gunakan Guest
          </Button>

          <TextInput label="Nama" placeholder="Isi Nama Pembeli" {...custProps("name")} />
          <TextInput label="Email" placeholder="Isi Email Pembeli" {...custProps("email")} inputMode="email" />
          <TextInput label="No. Telp" placeholder="Isi No.Telp Pembeli" {...custProps("phone")} inputMode="numeric" />
          <Textarea label="Alamat" placeholder="Isi Alamat Pembeli" {...custProps("address")} minRows={3} autosize />
          <Button onClick={handleCustomerSave} rightSection={<Icon icon="uiw:circle-check" />}>
            Simpan Data
          </Button>
        </Stack>
      </Modal>

      {/* ── Transaction Detail Modal ── */}
      <Modal
        opened={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        title={
          <Flex align="center" gap={10}>
            <div className="bg-primary-base/10 p-1.5 rounded-lg">
              <Icon icon="solar:file-text-bold" className="text-primary-base text-base" />
            </div>
            <div>
              <Text fw={700} size="sm" c="#0B387C">Detail Transaksi</Text>
              <Text size="xs" c="gray.5">{selectedTransaction?.invoice_no || selectedTransaction?.invoice_number || '-'}</Text>
            </div>
          </Flex>
        }
        size="md"
        radius="lg"
        padding="xl"
        styles={{
          header: { borderBottom: '1px solid #f1f3f5', paddingBottom: 12 },
          body: { paddingTop: 16 },
        }}
      >
        {selectedTransaction && (
          <Stack gap={16}>
            {/* Status Badge */}
            <Flex justify="space-between" align="center">
              <Badge
                color={getStatusFromId(selectedTransaction.transaction_status_id || 1).color}
                variant="filled"
                size="md"
                radius="sm"
              >
                {getStatusFromId(selectedTransaction.transaction_status_id || 1).text}
              </Badge>
              <Text size="xs" c="gray.5">
                {new Date(selectedTransaction.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            </Flex>

            {/* Customer Info */}
            <Card withBorder p={14} radius="md" className="bg-gray-50/50">
              <Text size="xs" c="gray.5" fw={600} mb={10} className="uppercase tracking-wider">Info Pelanggan</Text>
              <Stack gap={6}>
                <Flex justify="space-between">
                  <Text size="sm" c="gray.6">Nama</Text>
                  <Text size="sm" fw={600}>{selectedTransaction.customer_name || '-'}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text size="sm" c="gray.6">Metode Bayar</Text>
                  <Badge size="sm" variant="light" color="blue">
                    {selectedTransaction.payment_method?.toLowerCase() === 'xendit' ? 'QRIS' : selectedTransaction.payment_method || '-'}
                  </Badge>
                </Flex>
              </Stack>
            </Card>

            {/* Items */}
            {selectedTransaction.items && selectedTransaction.items.length > 0 && (
              <Card withBorder p={14} radius="md">
                <Text size="xs" c="gray.5" fw={600} mb={10} className="uppercase tracking-wider">Rincian Produk</Text>
                <Stack gap={8}>
                  {selectedTransaction.items.map((item, i) => (
                    <Flex key={i} justify="space-between" align="center">
                      <div>
                        <Text size="sm" fw={500}>{item.product_name}</Text>
                        <Text size="xs" c="gray.5">x{item.quantity} @ <NumberFormatter prefix="Rp " value={item.price} thousandSeparator="." /></Text>
                      </div>
                      <Text size="sm" fw={600}>
                        <NumberFormatter prefix="Rp " value={item.price * item.quantity} thousandSeparator="." />
                      </Text>
                    </Flex>
                  ))}
                </Stack>
              </Card>
            )}

            {/* Total */}
            <Card withBorder p={14} radius="md" className="bg-primary-base/5 border-primary-base/20">
              <Flex justify="space-between" align="center">
                <Text fw={700} c="#0B387C">Total Bayar</Text>
                <Text fw={800} size="lg" c="#0B387C">
                  <NumberFormatter prefix="Rp " value={selectedTransaction.total_amount} thousandSeparator="." />
                </Text>
              </Flex>
            </Card>
          </Stack>
        )}
      </Modal>

      <Flex gap={15} className={`flex-grow min-h-0 overflow-hidden pb-24`}>
        <Card withBorder w="100%" radius={10} h="100%" className={`!absolute z-30 transition-transform ${openSelect ? "" : "translate-x-[120%] md:!translate-x-0"} md:!static overflow-hidden flex flex-col`}>
          <LoadingOverlay visible={loading.includes("getdata")} />
          <Stack gap={20} h="100%" className="flex flex-col">
            <div>
              <Text fw={600} c="#0B387C">
                Pilih Produk
              </Text>
              <TextInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftSection={<Icon icon="uiw:search" />} placeholder="Cari Produk" mt={10} />
              <Text size="xs" c="gray.6" mt={5}>
                Menampilkan produk untuk toko Anda
              </Text>
            </div>

            <div className="overflow-y-auto flex-grow">
              {merchList?.length === 0 ? (
                <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />} mt={20}>
                  {searchQuery ? "Tidak ada produk yang cocok dengan pencarian" : "Tidak ada produk yang ditemukan untuk toko Anda"}
                </Alert>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
                  {merchList?.map((e, i) => (
                    <UnstyledButton
                      disabled={(e.stock ?? 0) <= 0}
                      className={`${(e.stock ?? 0) <= 0 ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02] transition-transform duration-200'}`}
                      key={i}
                      onClick={() => e.raw && handleAddProduct(e.raw)}
                    >
                      <Card
                        withBorder
                        radius={8}
                        className={`h-full ${(e.stock ?? 0) <= 0 ? "!bg-[#f5f5f5]" : "hover:!bg-[#fafafa] hover:shadow-md transition-all duration-200"}`}
                        p={12}
                      >
                        <Stack gap={8} className="h-full">
                          <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                            <Image
                              src={e.image}
                              width="100%"
                              height="100%"
                              fit="cover"
                              fallbackSrc="https://placehold.co/300x300/EBF4FF/0B387C?text=Produk"
                              className="object-cover"
                            />
                            {e.stock <= 0 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Text c="white" size="xs" fw={600}>
                                  STOK HABIS
                                </Text>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <Text size="sm" fw={500} lineClamp={2} className="text-gray-800 min-h-[40px]">
                              {e.name}
                            </Text>

                            <Text size="sm" fw={600} c="primary" className="mt-2">
                              {(e?.price ?? []).map((z, i) => (
                                <Box key={i} component="span">
                                  {i !== 0 && <> - </>}
                                  <NumberFormatter value={z} />
                                </Box>
                              ))}
                            </Text>

                            <div className="mt-2">
                              {e.stock > 0 ? (
                                <Text size="xs" c="green" className="flex items-center gap-1">
                                  <Icon icon="uiw:check" className="text-xs" />
                                  Stok: {e.stock}
                                </Text>
                              ) : (
                                <Text size="xs" c="red" className="flex items-center gap-1">
                                  <Icon icon="uiw:close" className="text-xs" />
                                  Stok Habis
                                </Text>
                              )}
                            </div>
                          </div>

                          {(e.stock ?? 0) > 0 && (
                            <Button
                              variant="light"
                              color="primary"
                              size="xs"
                              fullWidth
                              className="mt-2"
                              leftSection={<Icon icon="uiw:plus" />}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                e.raw && handleAddProduct(e.raw);
                              }}
                            >
                              Tambah
                            </Button>
                          )}
                        </Stack>
                      </Card>
                    </UnstyledButton>
                  ))}
                </div>
              )}
            </div>

            <Stack gap={10} mt="auto">
              {/* Pagination Controls */}
              {productTotal > 0 && (
                <Card withBorder p={10} radius={8} className="bg-gray-50">
                  <Flex justify="space-between" align="center">
                    <Text size="sm" c="gray.7">
                      Halaman {productPage} dari {productTotalPages}
                    </Text>
                    <Text size="sm" c="gray.7">
                      Total: {productTotal} produk
                    </Text>
                  </Flex>

                  <Flex gap={10} mt={10} justify="center" align="center" wrap="wrap">
                    <Button
                      onClick={handlePrevPage}
                      disabled={productPage <= 1 || loading.includes("getdata")}
                      variant="light"
                      size="sm"
                      leftSection={<Icon icon="uiw:left" />}
                      loading={loading.includes("getdata")}
                    >
                      Prev
                    </Button>

                    {/* Page Numbers */}
                    <Flex gap={5} align="center">
                      {(() => {
                        const pages = [];
                        const maxVisible = 5;

                        let startPage = Math.max(1, productPage - Math.floor(maxVisible / 2));
                        let endPage = Math.min(productTotalPages, startPage + maxVisible - 1);

                        if (endPage - startPage + 1 < maxVisible) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }

                        if (startPage > 1) {
                          pages.push(
                            <Button
                              key={1}
                              onClick={() => handlePageClick(1)}
                              variant="light"
                              size="sm"
                              px={10}
                            >
                              1
                            </Button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <Text key="ellipsis1" size="sm" c="gray.5" mx={2}>
                                ...
                              </Text>
                            );
                          }
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              onClick={() => handlePageClick(i)}
                              variant={productPage === i ? "filled" : "light"}
                              color={productPage === i ? "blue" : "gray"}
                              size="sm"
                              px={10}
                            >
                              {i}
                            </Button>
                          );
                        }

                        if (endPage < productTotalPages) {
                          if (endPage < productTotalPages - 1) {
                            pages.push(
                              <Text key="ellipsis2" size="sm" c="gray.5" mx={2}>
                                ...
                              </Text>
                            );
                          }
                          pages.push(
                            <Button
                              key={productTotalPages}
                              onClick={() => handlePageClick(productTotalPages)}
                              variant="light"
                              size="sm"
                              px={10}
                            >
                              {productTotalPages}
                            </Button>
                          );
                        }

                        return pages;
                      })()}
                    </Flex>

                    <Button
                      onClick={handleNextPage}
                      disabled={productPage >= productTotalPages || loading.includes("getdata")}
                      variant="light"
                      size="sm"
                      rightSection={<Icon icon="uiw:right" />}
                      loading={loading.includes("getdata")}
                    >
                      Next
                    </Button>
                  </Flex>
                </Card>
              )}

              <Button
                size="md"
                onClick={() => setOpenSelect(!openSelect)}
                rightSection={<Icon icon="uiw:right" />}
                className={`shrink-0 md:!hidden`}
                c="gray"
                variant="light"
              >
                Tutup
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Card withBorder w="100%" p={0} radius={10} h="100%" className="flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto">
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              classNames={{
                root: "sticky top-0 z-10 bg-white",
                tab: "data-[active=true]:bg-primary-base/10 data-[active=true]:text-primary-base py-3",
                list: "border-b border-light-grey px-4",
              }}
            >
              <Tabs.List grow>
                <Tabs.Tab value="order" leftSection={<Icon icon="uiw:shopping-cart" />}>
                  Rincian Pesanan
                </Tabs.Tab>
                <Tabs.Tab value="transactions" leftSection={<Icon icon="uiw:file-text" />}>
                  Riwayat Transaksi
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="order" pt="md">
                <Card p={20} className="h-auto">
                  <Flex align="center" gap={10} mb={20}>
                    <div className="bg-primary-base/10 p-2 rounded-lg">
                      <Icon icon="uiw:shopping-cart" className="text-primary-base text-lg" />
                    </div>
                    <div>
                      <Text fw={700} size="lg" c="#0B387C">
                        Rincian Pesanan
                      </Text>
                      <Text size="xs" c="gray.6">
                        {selectedList.length} item dipilih
                      </Text>
                    </div>
                  </Flex>

                  {selectedList.length === 0 ? (
                    <Card withBorder radius={12} p={30} className="text-center bg-gray-50/50 border-dashed border-2">
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                          <Icon icon="uiw:shopping-cart" className="text-3xl text-gray-400" />
                        </div>
                        <Text c="gray.6" size="sm" mb={10}>
                          Belum ada produk yang dipilih
                        </Text>
                      </div>
                      <Button size="md" className="md:!hidden" onClick={() => setOpenSelect(!openSelect)} leftSection={<Icon icon="uiw:plus" />} variant="filled" color="primary" radius="md" fullWidth>
                        Tambah Produk
                      </Button>
                    </Card>
                  ) : (
                    <ScrollArea h={300} scrollbarSize={6}>
                      <Stack gap={10}>
                        {selectedList.map((e, i) => (
                          <Card key={i} p={12} withBorder radius={10} className="hover:bg-gray-50/50 transition-all duration-200 group">
                            <Flex gap={12} align="center">
                              <div className="relative flex-shrink-0">
                                <Image src={e.image} h={60} w={60} radius={8} className="border border-gray-200" fallbackSrc="https://placehold.co/60x60/EBF4FF/0B387C?text=Produk" />
                                {e.count > 1 && <div className="absolute -top-2 -right-2 bg-primary-base text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{e.count}</div>}
                              </div>

                              <div className="flex-1 min-w-0">
                                <Flex justify="space-between" align="flex-start" gap={8}>
                                  <div>
                                    <Text size="sm" fw={600} lineClamp={1} className="text-gray.800">
                                      {e.name}
                                    </Text>
                                    {e.variant_name && (
                                      <Flex align="center" gap={4} mt={2}>
                                        <Icon icon="uiw:tag" className="text-xs text-gray.500" />
                                        <Text size="xs" c="gray.6" className="capitalize">
                                          {e.variant_name}
                                        </Text>
                                      </Flex>
                                    )}
                                  </div>
                                  <Text size="sm" fw={700} className="text-primary-base whitespace-nowrap">
                                    <NumberFormatter prefix="Rp " value={e.subtotal} />
                                  </Text>
                                </Flex>

                                <Flex justify="space-between" align="center" mt={8}>
                                  <div className="flex items-center gap=3">
                                    <Text size="xs" c="gray.6">
                                      @ <NumberFormatter prefix="Rp " value={e.price} />
                                    </Text>
                                    {e.stock < 10 && e.stock > 0 && (
                                      <Text size="xs" c="orange" className="bg-orange-50 px-2 py-0.5 rounded-full">
                                        Stok: {e.stock}
                                      </Text>
                                    )}
                                    {e.stock === 0 && (
                                      <Text size="xs" c="red" className="bg-red-50 px-2 py-0.5 rounded-full">
                                        Stok Habis
                                      </Text>
                                    )}
                                  </div>

                                  <Flex align="center" gap={8}>
                                    <NumberInput
                                      min={1}
                                      max={e.stock}
                                      value={e.count}
                                      onChange={(value) => {
                                        const numValue = typeof value === "string" ? parseInt(value) || 1 : value;
                                        setSelected(selected.map((item, idx) => (idx === i ? { ...item, count: numValue } : item)));
                                      }}
                                      size="xs"
                                      w={80}
                                      className="[&_input]:text-center [&_input]:font-semibold"
                                      styles={{
                                        input: {
                                          borderColor: "#CBD5E0",
                                          "&:focus": {
                                            borderColor: "#0B387C",
                                          },
                                        },
                                      }}
                                    />
                                    <ActionIcon onClick={() => handleDeleteItem(i)} color="red.5" variant="subtle" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Icon icon="uiw:delete" className="text-base" />
                                    </ActionIcon>
                                  </Flex>
                                </Flex>
                              </div>
                            </Flex>
                          </Card>
                        ))}
                      </Stack>
                    </ScrollArea>
                  )}

                  {selectedList.length > 0 && (
                    <div className="mt-4">
                      <Card withBorder radius={10} p={12} className="bg-gray-50/50">
                        <Flex justify="space-between" align="center">
                          <div>
                            <Text size="sm" c="gray.7" fw={500}>
                              Subtotal ({selectedList.length} item)
                            </Text>
                            <Text size="xs" c="gray.6">
                              Total sebelum diskon
                            </Text>
                          </div>
                          <Text size="md" fw={700} c="gray.8">
                            <NumberFormatter prefix="Rp " value={selectedList.reduce((sum, item) => sum + (item.subtotal ?? 0), 0)} />
                          </Text>
                        </Flex>
                      </Card>
                    </div>
                  )}

                  {selectedList.length > 0 && (
                    <Button size="md" className="md:!hidden mt-4" onClick={() => setOpenSelect(!openSelect)} leftSection={<Icon icon="uiw:plus" />} variant="light" color="primary" radius="md" fullWidth>
                      Tambah Produk Lain
                    </Button>
                  )}
                </Card>

                <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0]`} radius={0}>
                  <Flex gap={10} align="center" className={`overflow-x-auto [&>*]:!shrink-0`}>
                    <Button onClick={() => setOpenCustForm(true)} rightSection={<Icon icon="uiw:right" />} pos="relative" variant="light">
                      Data Pembeli
                    </Button>

                    <Button onClick={openSelectPayment} rightSection={<Icon icon="uiw:right" />} pos="relative" variant="light">
                      Metode Pembayaran {paymentMethod ? `(${paymentMethod.toLowerCase().includes("cash") ? "Cash" : "QRIS"})` : ""}
                    </Button>
                  </Flex>
                </Card>

                <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0]`} radius={0}>
                  <Flex gap={15} justify="space-between" align="center" wrap="wrap" mb={-5}>
                    <Flex gap={7} align="center">
                      <Icon icon="teenyicons:discount-outline" className={`text-primary-base`} />
                      <Text size="sm" className={`!text-primary-base`}>
                        Diskon Tambahan
                      </Text>
                    </Flex>
                    <NumberInput prefix="Rp " hideControls placeholder="Masukan Diskon" value={discount} onChange={(e) => setDiscount(parseInt(e as string))} className={`[&_*]:!text-center`} />
                  </Flex>
                </Card>

                <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0]`} radius={0}>
                  <Stack gap={8}>
                    <Accordion
                      variant="separated"
                      radius="sm"
                      chevronPosition="right"
                      className="w-full"
                      styles={{
                        item: {
                          border: "1px solid #e2e8f0",
                          backgroundColor: "#ffffff",
                          "&[data-active]": {
                            backgroundColor: "#f7fafc",
                          },
                        },
                        control: {
                          padding: "8px 12px",
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          color: "#0B387C",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        },
                        chevron: {
                          color: "#0B387C",
                          width: "16px",
                          height: "16px",
                        },
                        content: {
                          padding: "0 12px 8px 12px",
                        },
                      }}
                    >
                      <Accordion.Item value="customer">
                        <Accordion.Control>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:account-outline" className="text-sm" />
                              <span className="text-sm">Data Pembeli</span>
                            </div>
                            <Button
                              component="div"
                              size="compact-xs"
                              h={24}
                              fz={11}
                              px={8}
                              variant={isGuest ? "filled" : "light"}
                              color={isGuest ? "green" : "blue"}
                              className="mr-2 rounded z-10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const safeChange = (propName: keyof CustomerData, value: string) => {
                                  const p = custProps(propName as any) as any;
                                  if (!p) return;
                                  try {
                                    if (typeof p.onChange === "function") {
                                      p.onChange(value);
                                      return;
                                    }
                                  } catch { }
                                  try {
                                    if (typeof p.onChange === "function") p.onChange({ target: { value } });
                                  } catch { }
                                };

                                if (isGuest) {
                                  safeChange("name", "");
                                  safeChange("email", "");
                                  safeChange("phone", "");
                                  safeChange("address", "");
                                  return;
                                }

                                const randomId = Math.floor(100000 + Math.random() * 900000);
                                const randomName = `Guest ${randomId}`;
                                const randomEmail = `guest_${randomId}@mail.com`;
                                const randomPhone = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
                                const addrA = Math.floor(Math.random() * 101);
                                const addrB = Math.floor(Math.random() * 101);
                                const randomAddress = `Jalanan ${addrA} Rumah ${addrB}`;

                                safeChange("name", randomName);
                                safeChange("email", randomEmail);
                                safeChange("phone", randomPhone);
                                safeChange("address", randomAddress);
                              }}
                            >
                              {isGuest ? "Guest Aktif" : "Gunakan Guest"}
                            </Button>
                          </div>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <div className="space-y-3 pt-1">
                            {custValue.name || custValue.email || custValue.phone || custValue.address ? (
                              <>
                                <div className="grid grid-cols-1 gap-2">
                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                      <Icon icon="mdi:account" className="text-xs" />
                                      <span>Nama</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded">{custValue.name || "-"}</div>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                      <Icon icon="mdi:email-outline" className="text-xs" />
                                      <span>Email</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded">{custValue.email || "-"}</div>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                      <Icon icon="mdi:phone-outline" className="text-xs" />
                                      <span>No. Telp</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded">{custValue.phone || "-"}</div>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                      <Icon icon="mdi:map-marker-outline" className="text-xs" />
                                      <span>Alamat</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded whitespace-pre-wrap">{custValue.address || "-"}</div>
                                  </div>
                                </div>

                                <div className="flex justify-end pt-1">
                                  <Button variant="subtle" size="xs" color="blue" leftSection={<Icon icon="mdi:pencil" className="text-xs" />} onClick={() => setOpenCustForm(true)}>
                                    Edit
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-3">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
                                  <Icon icon="mdi:account-question" className="text-lg text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500 mb-3">Belum ada data pembeli</p>
                                <Button variant="light" color="blue" size="xs" leftSection={<Icon icon="mdi:plus" className="text-xs" />} onClick={() => setOpenCustForm(true)}>
                                  Tambah Data
                                </Button>
                              </div>
                            )}
                          </div>
                        </Accordion.Panel>
                      </Accordion.Item>

                      <Accordion.Item value="summary">
                        <Accordion.Control>
                          <div className="flex items-center gap-2">
                            <Icon icon="mdi:receipt-text-outline" className="text-sm" />
                            <span className="text-sm">Detail Pembayaran</span>
                          </div>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <div className="space-y-2 pt-1">
                            {handleSummary.detail
                              .filter((e) => Boolean(e[1]) || e[1] < 0)
                              .map((e, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                  <div className="flex items-center gap=1.5">
                                    {e[0] === "Subtotal" && <Icon icon="mdi:cart-outline" className="text-xs text-gray-400" />}
                                    {e[0] === "Diskon" && <Icon icon="mdi:tag-outline" className="text-xs text-gray-400" />}
                                    {e[0] === "Admin" && <Icon icon="mdi:credit-card-outline" className="text-xs text-gray-400" />}
                                    <span className="text-xs text-gray-600">{e[0]}</span>
                                  </div>
                                  <div className={`text-xs font-medium ${e[1] < 0 ? "text-red-500" : "text-gray-800"}`}>
                                    <NumberFormatter prefix="Rp " value={e[1]} />
                                  </div>
                                </div>
                              ))}

                            <div className="pt-2 mt-2 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap=1.5">
                                  <Icon icon="mdi:cash-multiple" className="text-sm text-primary-base" />
                                  <span className="text-xs font-semibold text-primary-base">Total</span>
                                </div>
                                <div className="text-sm font-bold text-primary-base">
                                  <NumberFormatter prefix="Rp " value={handleSummary.total} />
                                </div>
                              </div>

                              {discount !== 0 && (
                                <div className="mt-1 text-[10px] text-gray-500 text-right">{discount > 0 ? <span className="text-green-600">✓ Diskon diterapkan</span> : <span className="text-red-500">✗ Tanpa diskon</span>}</div>
                              )}
                            </div>
                          </div>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>

                  </Stack>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="transactions" pt="md">
                <Card p={20}>
                  <Flex align="center" gap={10} mb={20}>
                    <div className="bg-primary-base/10 p-2 rounded-lg">
                      <Icon icon="uiw:file-text" className="text-primary-base text-lg" />
                    </div>
                    <div>
                      <Text fw={700} size="lg" c="#0B387C">
                        Riwayat Transaksi
                      </Text>
                      <Text size="xs" c="gray.6">
                        {totalTransactions} transaksi ditemukan
                      </Text>
                    </div>
                  </Flex>

                  <Card withBorder p="md" radius="md" mb="md" className="bg-gray-50/50">
                    <Stack gap="md">
                      <Text fw={600} size="sm">
                        Filter Transaksi
                      </Text>

                      <Flex gap="sm" align="center" justify="space-between" wrap="wrap">
                        {/* Kiri: Status */}
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <Button variant="outline" size="sm" rightSection={<Icon icon="uiw:down" />}>
                              Status: {transactionStatus === "all" ? "Semua" :
                                transactionStatus === "1" ? "Pending" :
                                  transactionStatus === "2" ? "Success" :
                                    transactionStatus === "3" ? "Expired" :
                                      transactionStatus === "4" ? "Failed" :
                                        transactionStatus === "5" ? "Cancelled" : transactionStatus}
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item onClick={() => setTransactionStatus("all")}>Semua Status</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item onClick={() => setTransactionStatus("1")}>Pending</Menu.Item>
                            <Menu.Item onClick={() => setTransactionStatus("2")}>Success</Menu.Item>
                            <Menu.Item onClick={() => setTransactionStatus("3")}>Expired</Menu.Item>
                            <Menu.Item onClick={() => setTransactionStatus("4")}>Failed</Menu.Item>
                            <Menu.Item onClick={() => setTransactionStatus("5")}>Cancelled</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>

                        {/* Kanan: Date picker + Search */}
                        <Flex gap="sm" align="center">
                          <Popover position="bottom-end" shadow="md">
                            <Popover.Target>
                              <Tooltip label="Pilih Rentang Tanggal">
                                <ActionIcon size={36} variant={dateRange[0] ? "filled" : "light"} color="blue">
                                  <Icon icon="solar:calendar-bold" className="text-xl" />
                                </ActionIcon>
                              </Tooltip>
                            </Popover.Target>
                            <Popover.Dropdown p={10}>
                              <DatePicker type="range" value={dateRange} onChange={setDateRange} />
                            </Popover.Dropdown>
                          </Popover>

                          <TextInput
                            placeholder="Cari berdasarkan invoice atau nama..."
                            value={transactionSearch}
                            onChange={(e) => setTransactionSearch(e.target.value)}
                            leftSection={<Icon icon="uiw:search" />}
                            className="w-full sm:w-auto sm:min-w-[260px]"
                            size="sm"
                          />
                        </Flex>
                      </Flex>
                    </Stack>
                  </Card>

                  <LoadingOverlay visible={loading.includes("get-transactions")} />

                  {transactions.length === 0 ? (
                    <Card withBorder radius={12} p={30} className="text-center bg-gray-50/50 border-dashed border-2">
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                          <Icon icon="uiw:file-text" className="text-3xl text-gray-400" />
                        </div>
                        <Text c="gray.6" size="sm" mb={10}>
                          Tidak ada transaksi ditemukan
                        </Text>
                        <Button onClick={() => getTransactions()} variant="light" size="sm" leftSection={<Icon icon="uiw:reload" />}>
                          Refresh
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-xl border border-light-grey">
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e8e8e8', backgroundColor: '#f5f7fa' }}>
                              <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', width: 50 }}>#</th>
                              <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>Invoice / Tanggal</th>
                              <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>Pelanggan</th>
                              <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>Total</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>Status</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', position: 'sticky', right: 0, backgroundColor: '#f5f7fa', zIndex: 10, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction, index) => {
                              const status = getStatusFromId(transaction.transaction_status_id || 1);
                              return (
                                <tr key={transaction.id} style={{ borderBottom: '1px solid #f0f0f0' }} className="hover:bg-gray-50/50 transition-colors">
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <Text size="sm" c="gray.6">{((transactionPage as number) - 1) * 10 + index + 1}</Text>
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <Text fw={600} size="sm" c="blue.8">{transaction.invoice_no || transaction.invoice_number}</Text>
                                    <Text size="xs" c="gray.5">
                                      {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                                        day: "2-digit", month: "2-digit", year: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                      })}
                                    </Text>
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <Text size="sm" fw={500}>{transaction.customer_name}</Text>
                                    <Badge size="xs" variant="light" color="gray">{transaction.payment_method?.toLowerCase() === 'xendit' ? 'QRIS' : transaction.payment_method}</Badge>
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                    <Text fw={700} size="sm">
                                      <NumberFormatter prefix="Rp " value={transaction.total_amount} thousandSeparator="." />
                                    </Text>
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <Badge color={status.color} variant="filled" size="sm" fullWidth style={{ maxWidth: 100, margin: '0 auto' }}>
                                      {status.text}
                                    </Badge>
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center', position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 5, boxShadow: '-2px 0 5px rgba(0,0,0,0.02)' }}>
                                    <Flex gap={8} justify="center">
                                      <ActionIcon variant="light" color="blue" title="Detail" onClick={() => { setSelectedTransaction(transaction); setOpenDetailModal(true); }}><Icon icon="solar:eye-bold" width={16} /></ActionIcon>
                                    </Flex>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <Flex justify="space-between" align="center" mt="md">
                        <Text size="sm" c="gray.6">
                          Halaman {transactionPage} - Menampilkan {transactions.length} dari {totalTransactions} transaksi
                        </Text>

                        <Flex gap={10}>
                          <Button
                            size="sm"
                            variant="subtle"
                            onClick={() => {
                              if (transactionPage > 1) {
                                const newPage = transactionPage - 1;
                                setTransactionPage(newPage);
                                getTransactions(newPage);
                              }
                            }}
                            disabled={transactionPage <= 1}
                          >
                            Prev
                          </Button>
                          <Button
                            size="sm"
                            variant="subtle"
                            onClick={() => {
                              const newPage = transactionPage + 1;
                              setTransactionPage(newPage);
                              getTransactions(newPage);
                            }}
                            disabled={transactions.length < 10}
                          >
                            Next
                          </Button>
                        </Flex>
                      </Flex>
                    </>
                  )}
                </Card>
              </Tabs.Panel>
            </Tabs>
          </div>
        </Card>
      </Flex>

      {activeTab === "order" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl border border-light-grey rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] px-6 py-3 pointer-events-auto">
            <Flex justify="space-between" align="center" gap={20}>
              <Flex align="center" gap={16}>
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={handlePrintBill}
                  loading={printBillLoading}
                  disabled={selectedList.length === 0}
                  leftSection={<Icon icon="uiw:printer" className="text-lg" />}
                  size="sm"
                  radius="md"
                  className="hover:!bg-gray-100"
                >
                  Print Bill
                </Button>

                <Divider orientation="vertical" h={32} color="gray.2" />

                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold leading-none mb-1">Total Bayar</span>
                  <div className="flex items-baseline">
                    <span className="text-xl font-black text-primary-base tracking-tight leading-none">
                      <NumberFormatter prefix="Rp " value={handleSummary.total} thousandSeparator="." />
                    </span>
                  </div>
                </div>
              </Flex>

              <Button
                loading={loading.includes("submit") || loading.includes("checkout")}
                onClick={handleCheckout}
                disabled={handleSummary.total <= 0 || !paymentMethod}
                size="md"
                radius="xl"
                className="min-w-[140px] shadow-sm hover:shadow-md transition-all duration-300"
                rightSection={<Icon icon="uiw:right" className="text-base" />}
                fw={700}
              >
                Bayar
              </Button>
            </Flex>
          </div>
        </div>
      )}
    </Stack>
  );
}