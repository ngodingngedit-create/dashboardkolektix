
import React, { useEffect, useState, useCallback, useMemo } from "react";
import TrackingUpdateModal from "./trackingupt";
import ResiUpdateModal from "./resiupt";
import {
  Modal as NextUIModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button as NextUIButton,
  Card as NextUICard,
  CardBody,
  Chip,
} from "@nextui-org/react";
import { 
    Flex, 
    Group, 
    Select as MantineSelect, 
    TextInput as MantineTextInput, 
    Checkbox, 
    Button as MantineButton, 
    ActionIcon, 
    NumberFormatter, 
    Text, 
    Box, 
    Badge, 
    Tooltip,
    Pagination as MantinePagination,
    Stack,
    Divider,
    Tabs,
    Card as MantineCard
} from "@mantine/core";
import { Get } from "@/utils/REST";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faDownload,
  faFileInvoice,
  faUser,
  faBox,
  faShoppingCart,
  faMapMarkerAlt,
  faEnvelope,
  faPhone,
  faStore,
  faCalendar,
  faTag,
  faCreditCard,
  faInfoCircle,
  faSearch,
  faReceipt,
  faCalendarAlt,
  faTruck,
  faCheckCircle,
  faClock,
  faCopy,
  faWeightHanging,
  faRuler,
  faMoneyBillWave,
  faPrint,
  faTimeline,
  faCircleCheck,
  faSpinner,
  faBoxOpen,
  faLocationDot,
  faHourglassHalf,
  faExclamationCircle,
  faBarcode,
  faPalette,
  faRulerCombined,
  faFilter,
  faTimes,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react/dist/iconify.js";
import useLoggedUser from "@/utils/useLoggedUser";
import { useRouter } from "next/router";

interface CreatorData {
  id: number;
  user_id: string;
  name: string;
  slug_url?: string;
  has_user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ShippingAddress {
  id?: number;
  order_id?: number;
  address_detail?: string;
  address_name?: string;
  nama_penerima?: string;
  phone?: string;
  [key: string]: any;
}

interface VariantOption {
  id?: number;
  product_id?: number;
  name?: string;
  value?: string;
}

interface ProductVariant {
  id?: number;
  product_id?: number;
  product_varian_option_id?: number;
  sku?: string;
  price?: string;
  stock?: number;
  weight?: number;
  created_at?: string;
  updated_at?: string;
  variant_option?: VariantOption | string | null;
  name?: string;
  value?: string;
}

interface ProductDetail {
  id?: number;
  order_product_id?: number;
  product_id?: number;
  store_location_id?: number | null;
  creator_id?: number | null;
  product_varian_id?: number | null;
  qty?: number;
  price?: string;
  order_notes?: string;
  admin_fee?: number;
  sku?: string;
  product_name?: string;

  product?: {
    id: number;
    product_name: string;
    price: string;
    creator_id: number;
    average_star: string;
    total_review: number;
    total_sold: number;
    sku?: string;

    creator?: {
      id: number;
      name: string;
      image_url?: string;
    };

    images?: Array<{
      id: number;
      product_id: number;
      name: string;
      image: string;
      image_url: string;
    }>;
  };

  variant?: ProductVariant | null;
}

interface MerchandiseTransactionData {
  id: number;
  invoice_no?: string;
  product_name?: string;
  product_details?: ProductDetail[];
  sku?: number | string;
  total_qty?: number;
  total_price?: number | string;
  transaction_status_id?: number;
  voucher?: number | string;
  creator_id?: number;
  creator_name?: string;
  detail?: ProductDetail[];
  order_date?: string;
  customer_name?: string;
  customer_email?: string;
  shipping_address?: ShippingAddress | string;
  status_name?: string;
  payment_method?: string;
  notes?: string;
  resi_no?: string;
  courier_name?: string;
  ongkir?: number;
}

interface InvoiceDetailData {
  status: boolean;
  message: string;
  data: {
    id: number;
    invoice_no: string;
    store_location_id?: number;
    user_id: string;
    total_qty: number;
    total_price: number;
    delivery_price: number;
    grandtotal: number;
    admin_fee: number;
    ppn: number | null;
    payment_method_id: number;
    payment_method: string;
    transaction_status_id: number;
    payment_status: string;
    payment_channel_id: string;
    xendit_url?: string;
    payment_method_custom?: string;
    payment_date?: string;
    is_pickup: number;
    picked_up_at?: string | null;
    picked_up_by?: string | null;
    created_at: string;
    updated_at: string;

    user: {
      id: number;
      name: string;
      email: string;
      phone?: string | null;
    };

    transaction_status: {
      id: number;
      name: string;
      bgcolor: string;
    };

    detail: Array<{
      id: number;
      order_product_id: number;
      product_id: number;
      store_location_id?: number | null;
      creator_id?: number | null;
      product_varian_id?: number | null;
      qty: number;
      price: string;
      order_notes?: string;
      admin_fee?: number;

      product: {
        id: number;
        product_name: string;
        price: string;
        creator_id: number;
        average_star: string;
        total_review: number;
        total_sold: number;
        sku?: string;

        creator?: {
          id: number;
          name: string;
          image_url?: string;
        };

        images?: Array<{
          id: number;
          product_id: number;
          name: string;
          image: string;
          image_url: string;
        }>;
      };

      variant?: {
        id: number;
        product_id: number;
        product_varian_option_id: number;
        sku: string;
        price: string;
        stock: number;
        weight: number;
        created_at: string;
        updated_at: string;
        variant_option: {
          id: number;
          product_id: number;
          name: string;
          value: string;
        };
      } | null;
    }>;

    address?: {
      id: number;
      order_id: number;
      is_main_address: number;
      province_id: number;
      city_id: number;
      address_detail: string;
      address_name?: string | null;
      zipcode: number;
      latitude?: string;
      longitude?: string;
      nama_penerima: string;
      phone: string;
    };

    courier?: {
      id: number;
      order_id: number;
      main: string;
      type: string;
      price: string;
      created_at: string;
      updated_at: string;
      courier_company: string;
      courier_type: string;
      courier_service?: string | null;
      etd?: string | null;
      etd_time?: string | null;
      tracking_number?: string | null;
      delivery_id?: string | null;
      origin_lat?: string;
      origin_lng?: string;
      destination_lat?: string;
      destination_lng?: string;
      order_manifests?: any[];
    };

    manifest?: Array<{
      id: number;
      tracking_status_id: number;
      order_id: number;
      order_courier_id: number;
      tracking_number: string;
      status_name: string;
      description: string;
      location: string;
      image?: string | null;
      courier_time: string;
      pic_name: string;
      created_by: string;
      created_at: string;

      tracking_status?: {
        id: number;
        status_delivery: string;
        description: string;
        active_status: number;
      };
    }>;

    pickup?: any | null;
  };
}

interface ShippingData {
  id: number;
  invoice_no: string;
  product_name: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  address?: string;
  shipping_status: "sent" | "pending";
  order_date: string;
  total_qty: number;
}

interface FilterOption {
  key: string;
  label: string;
}

const DeliveryPage: React.FC = () => {
  const router = useRouter();
  const user = useLoggedUser();
  const [data, setData] = useState<MerchandiseTransactionData[]>([]);
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filterValue, setFilterValue] = useState<string>("");

  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [productOptions, setProductOptions] = useState<FilterOption[]>([]);

  const [variantFilter, setVariantFilter] = useState<string>("");
  const [variantOptions, setVariantOptions] = useState<FilterOption[]>([]);

  const [page, setPage] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState<string>("transaksi");
  const [loadingCreators, setLoadingCreators] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ marginLeft: 4, opacity: sortBy === col ? 1 : 0.3, cursor: 'pointer' }}>
      {sortBy === col && sortDir === "desc" ? "↓" : "↑"}
    </span>
  );

  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetailData['data'] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<MerchandiseTransactionData | null>(null);

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [printLoading, setPrintLoading] = useState<boolean>(false);

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForTracking, setSelectedInvoiceForTracking] = useState<string>("");

  const [isResiModalOpen, setIsResiModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForResi, setSelectedInvoiceForResi] = useState<string>("");

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setPage(1);
  }, []);

  const onProductChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
    setPage(1);
  }, []);

  const onVariantFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVariantFilter(e.target.value);
    setPage(1);
  }, []);

  const onDateFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setPage(1);
  }, []);

  const clearDateFilter = useCallback(() => {
    setDateFilter("");
    setPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterValue("");
    setSelectedProduct("all");
    setVariantFilter("");
    setDateFilter("");
    setPage(1);
  }, []);

  const toggleSelectItem = (id: number) => {
    setSelectedInvoiceIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInvoiceIds.length === paginatedItems.length && paginatedItems.length > 0) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(paginatedItems.map(item => item.id));
    }
  };


  const getStatusInfo = (statusId?: number) => {
    switch (statusId) {
      case 1:
        return {
          text: "PENDING",
          color: "yellow",
        };
      case 2:
        return {
          text: "SUCCESS",
          color: "green",
        };
      case 3:
        return {
          text: "FAILED",
          color: "red",
        };
      case 4:
        return {
          text: "EXPIRED",
          color: "gray",
        };
      default:
        return {
          text: "UNKNOWN",
          color: "gray",
        };
    }
  };

  const getShippingStatusInfo = (item: MerchandiseTransactionData) => {
    const statusName = item.status_name?.toLowerCase() || "";
    const isSent = statusName.includes("kirim") || statusName.includes("selesai") || statusName.includes("success");
    
    if (isSent) {
      return {
        text: "Terkirim",
        color: "green",
      };
    } else {
      return {
        text: "Belum Terkirim",
        color: "yellow",
      };
    }
  };

  const getStatusIcon = (statusName: string) => {
    const lowerStatus = statusName.toLowerCase();
    if (lowerStatus.includes('expired')) {
      return faHourglassHalf;
    } else if (lowerStatus.includes('berhasil') || lowerStatus.includes('sukses')) {
      return faCheckCircle;
    } else if (lowerStatus.includes('gagal') || lowerStatus.includes('failed')) {
      return faExclamationCircle;
    } else if (lowerStatus.includes('proses') || lowerStatus.includes('diproses')) {
      return faSpinner;
    } else if (lowerStatus.includes('dikirim') || lowerStatus.includes('shipping')) {
      return faTruck;
    } else if (lowerStatus.includes('diterima') || lowerStatus.includes('delivered')) {
      return faCheckCircle;
    } else {
      return faBoxOpen;
    }
  };

  const getVariantIcon = (variantName: string = '') => {
    const lowerName = variantName.toLowerCase();
    if (lowerName.includes('warna') || lowerName.includes('color')) {
      return faPalette;
    } else if (lowerName.includes('ukuran') || lowerName.includes('size')) {
      return faRulerCombined;
    } else {
      return faTag;
    }
  };

  const formatVariantDisplay = (variant: any): string => {
    if (!variant) return '';

    if (variant.variant_option && typeof variant.variant_option === 'object' && variant.variant_option !== null) {
      const option = variant.variant_option as { name?: string; value?: string };
      if (option.name && option.value) {
        return `${option.name}: ${option.value}`;
      }
    }

    if (variant.variant_option && typeof variant.variant_option === 'string') {
      return variant.variant_option;
    }

    if (variant.name && variant.value) {
      return `${variant.name}: ${variant.value}`;
    }

    if (typeof variant === 'string') {
      return variant;
    }

    return '';
  };

  const getVariantName = (variant: any): string => {
    if (!variant) return '';

    if (variant.variant_option && typeof variant.variant_option === 'object' && variant.variant_option !== null) {
      const option = variant.variant_option as { name?: string };
      return option.name || '';
    }

    if (variant.name) {
      return variant.name;
    }

    return '';
  };

  const getVariantValue = (variant: any): string => {
    if (!variant) return '';

    if (variant.variant_option && typeof variant.variant_option === 'object' && variant.variant_option !== null) {
      const option = variant.variant_option as { value?: string };
      return option.value || '';
    }

    if (variant.value) {
      return variant.value;
    }

    return '';
  };

  const extractAllVariantValues = (data: MerchandiseTransactionData[]): FilterOption[] => {
    const variantSet = new Set<string>();

    data.forEach(item => {
      if (item.detail && Array.isArray(item.detail)) {
        item.detail.forEach(detail => {
          if (detail.variant) {
            const variantDisplay = formatVariantDisplay(detail.variant);
            if (variantDisplay) {
              variantSet.add(variantDisplay);
            }
          }
        });
      }
    });

    return Array.from(variantSet).map(value => ({
      key: value,
      label: value
    }));
  };

  const parseDate = (dateString: string | undefined): Date => {
    if (!dateString || dateString === "-") return new Date(0);

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        const cleanedDate = dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3");
        const newDate = new Date(cleanedDate);

        return isNaN(newDate.getTime()) ? new Date(0) : newDate;
      }

      return date;
    } catch (e) {
      return new Date(0);
    }
  };

  const getSkuFromItem = (item: any): string => {
    if (Array.isArray(item.detail) && item.detail.length > 0) {
      for (const d of item.detail) {
        if (d?.product?.sku && d.product.sku !== "0.000000" && d.product.sku !== "0") {
          return d.product.sku;
        } else if (d?.sku && d.sku !== "0.000000" && d.sku !== "0") {
          return d.sku;
        } else if (d?.variant?.sku) {
          return d.variant.sku;
        }
      }
    }

    if (item?.product?.sku && item.product.sku !== "0.000000" && item.product.sku !== "0") {
      return item.product.sku;
    }

    if (item?.sku && item.sku !== "0.000000" && item.sku !== "0") {
      return item.sku;
    }

    return "-";
  };

  const getProductNameWithVariant = (detail: any): string => {
    if (!detail) return "-";

    let productName = "";

    if (detail.product?.product_name) {
      productName = detail.product.product_name;
    } else if (detail.product_name) {
      productName = detail.product_name;
    } else if (detail.product?.name) {
      productName = detail.product.name;
    } else {
      productName = "Produk";
    }

    if (detail.variant) {
      const variantInfo = formatVariantDisplay(detail.variant);
      if (variantInfo) {
        return `${productName} (${variantInfo})`;
      }
    }

    return productName;
  };

  const formatAllProductsWithVariants = (details: any[]): string => {
    if (!details || details.length === 0) return "-";

    const productStrings = details.map(detail => {
      return getProductNameWithVariant(detail);
    });

    return productStrings.join(" | ");
  };

  const extractProductNames = (data: MerchandiseTransactionData[]): FilterOption[] => {
    const productSet = new Set<string>();

    data.forEach(item => {
      if (item.product_name && item.product_name !== "-") {
        const products = item.product_name.split(" | ");
        products.forEach(p => {
          const cleanName = p.replace(/\s*\([^)]*\)\s*$/, '').trim();
          if (cleanName && cleanName !== "-") {
            productSet.add(cleanName);
          }
        });
      }
    });

    return Array.from(productSet).map(name => ({
      key: name,
      label: name
    }));
  };

  const formatShippingAddress = (address: ShippingAddress | string | undefined): string => {
    if (!address) return "-";
    if (typeof address === "string") return address;
    const addr = address as ShippingAddress;
    const parts: string[] = [];
    if (addr.nama_penerima) parts.push(addr.nama_penerima);
    if (addr.address_detail) parts.push(addr.address_detail);
    if (addr.address_name) parts.push(addr.address_name);
    if (addr.phone) parts.push(`Telp: ${addr.phone}`);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const getCreators = async () => {
    setLoadingCreators(true);
    try {
      const res: any = await Get("creator", {});
      setCreators(res?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch creators:", err);
    } finally {
      setLoadingCreators(false);
    }
  };

  const getData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await Get("order-bycreator", {});
      const creatorId = user?.has_creator?.id;
      let filteredData = res?.data || [];

      if (creatorId) {
        filteredData = filteredData.filter((item: any) => {
          const itemCreatorId =
            item.creator_id ||
            item.creator?.id ||
            (item.user_id ? parseInt(item.user_id) : null);
          return itemCreatorId === creatorId && item.transaction_status_id === 2 && (item.address || item.shipping_address);
        });
      } else {
        filteredData = filteredData.filter((item: any) => item.transaction_status_id === 2 && (item.address || item.shipping_address));
      }

      const mapped: MerchandiseTransactionData[] = filteredData.map((item: any) => {
        const productDetails = Array.isArray(item.detail) ? item.detail : [];
        const productName = productDetails.length > 0
          ? formatAllProductsWithVariants(productDetails)
          : item.product?.product_name || item.product_name || "-";

        const sku = getSkuFromItem(item);

        let creatorId = 0;
        let creatorName = user?.has_creator?.name || "Creator";

        if (item.creator?.id) {
          creatorId = item.creator.id;
          creatorName =
            item.creator.name || item.creator.username || item.creator.email || creatorName;
        } else if (item.creator_id) {
          creatorId = item.creator_id;
        }

        const shippingAddress = item.address || item.shipping_address || "-";

        return {
          resi_no: item.courier?.tracking_number || "-",
          courier_name: item.courier?.courier_company || item.courier?.main || "-",
          ongkir: Number(item.courier?.price) || 0,
          id: item.id || 0,
          invoice_no: item.invoice_no || "-",
          product_name: productName,
          product_details: productDetails,
          sku: sku,
          total_qty: item.total_qty || 0,
          total_price: item.total_price || 0,
          transaction_status_id: item.transaction_status_id || 0,
          voucher: item.voucher || "-",
          creator_id: creatorId,
          creator_name: creatorName,
          detail: item.detail || [],
          order_date: item.created_at || "-",
          customer_name: item.user?.name || "-",
          customer_email: item.user?.email || "-",
          shipping_address: shippingAddress,
          status_name: item.transaction_status?.name || "-",
          payment_method: item.payment_method || "-",
          notes: item.notes || "-",
        };
      });

      const sortedData = mapped.sort((a, b) => {
        const dateA = parseDate(a.order_date);
        const dateB = parseDate(b.order_date);
        return dateB.getTime() - dateA.getTime();
      });

      setData(sortedData);

      const products = extractProductNames(sortedData);
      setProductOptions(products);

      const variants = extractAllVariantValues(sortedData);
      setVariantOptions(variants);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setData([]);
      setError("Gagal mengambil data dari server");
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceDetail = async (invoiceNo: string) => {
    setLoadingDetail(true);
    setDetailError(null);

    try {
      console.log("Fetching invoice detail for:", invoiceNo);

      const response = await Get(`order-product-invoice/${invoiceNo}`, {}) as InvoiceDetailData;

      console.log("Invoice Detail Response:", response);

      if (response?.status && response?.data) {
        setInvoiceDetail(response.data);
        return response.data;
      } else {
        setDetailError(response?.message || "Gagal mengambil detail invoice");
        return null;
      }
    } catch (err: any) {
      console.error("Error fetching invoice detail:", err);
      setDetailError(err.message || "Terjadi kesalahan saat mengambil detail invoice");
      return null;
    } finally {
      setLoadingDetail(false);
    }
  };

  const getTrackingNumber = (): string => {
    if (!invoiceDetail) return "-";

    if (invoiceDetail.manifest && invoiceDetail.manifest.length > 0) {
      const manifestWithTracking = invoiceDetail.manifest.find(m => m.tracking_number);
      if (manifestWithTracking?.tracking_number) {
        return manifestWithTracking.tracking_number;
      }
    }

    return invoiceDetail.courier?.tracking_number || "-";
  };

  const getCourierName = (): string => {
    if (!invoiceDetail) return "JNE";

    if (invoiceDetail.courier?.courier_company) {
      const company = invoiceDetail.courier.courier_company.toLowerCase();
      if (company.includes('jne')) return 'JNE';
      if (company.includes('jnt')) return 'JNT';
      if (company.includes('sicepat')) return 'SICEPAT';
      if (company.includes('pos')) return 'POS';
      if (company.includes('tiki')) return 'TIKI';
      if (company.includes('wahana')) return 'WAHANA';
      if (company.includes('ninja')) return 'NINJA';
      if (company.includes('lion')) return 'LION';
      if (company.includes('ide')) return 'IDE';
      if (company.includes('sap')) return 'SAP';
      return invoiceDetail.courier.courier_company.toUpperCase();
    }

    if (invoiceDetail.courier?.main) {
      return invoiceDetail.courier.main.toUpperCase();
    }

    return "JNE";
  };

  const generateResiHTML = (detailData: any): string => {
    if (!detailData) return "";

    const courierName = detailData.courier?.courier_company || detailData.courier?.main || "Biteship";
    const trackingNumber = detailData.courier?.tracking_number || "-";
    const senderName = user?.has_creator?.name || "deelestari";
    const senderPhone = detailData.user?.phone || "081287206604";
    const senderAddress = "Perumahan Diamond Valley blok A2 no 1, bedahan Sawangan, Jl. H. Sulaiman, Kec. Sawangan, Kota Depok, Jawa Barat (rumah paling pinggir A2/1 sebelum belokan), Sawangan, Depok, Jawa B...";

    const receiverName = detailData.address?.nama_penerima || "H****";
    const maskedReceiverName = receiverName.length > 1
      ? receiverName.charAt(0) + '*'.repeat(receiverName.length - 1)
      : receiverName;

    const receiverPhone = detailData.address?.phone || "0819****129";
    const maskedReceiverPhone = receiverPhone.length > 4
      ? receiverPhone.substring(0, 4) + '*'.repeat(receiverPhone.length - 7) + receiverPhone.substring(receiverPhone.length - 3)
      : receiverPhone;

    const receiverFullAddress = detailData.address
      ? `${detailData.address.address_detail}, ${detailData.address.city_id || ''}, ${detailData.address.province_id || ''}, ${detailData.address.zipcode || ''}`
      : "JL, Jakarta Timur, DKI Jakarta";

    const productItems = detailData.detail?.map((d: any) => {
      const productName = d.product?.product_name || 'Produk';
      let variantInfo = '';

      if (d.variant) {
        const variantDisplay = formatVariantDisplay(d.variant);
        if (variantDisplay) {
          variantInfo = ` (${variantDisplay})`;
        }
      }

      return `${d.qty}x ${productName}${variantInfo}`;
    }).join(', ') || "Produk Merchandise";

    const courierService = detailData.courier?.courier_type || "reg";
    const referenceNumber = detailData.invoice_no || "-";
    const orderNotes = detailData.detail?.find((d: any) => d.order_notes)?.order_notes || "mechanise deelestari";

    const generateBarcodeBars = () => {
      const chars = trackingNumber.split('');
      let bars = '';
      chars.forEach((char: string) => {
        const code = char.charCodeAt(0);
        const width = (code % 5 + 2) * 2;
        bars += `<div style="display: inline-block; width: ${width}px; height: 60px; background-color: #000000; margin-right: 2px; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>`;
      });
      return bars;
    };

    return `
      <div class="resi-page">
        <div class="resi-container">
          <div class="header">
            <h1>${courierName.toUpperCase()}</h1>
            <div class="subtitle">${courierService.toUpperCase()}</div>
          </div>
          
          <div class="biteship">
            Shipping Powered by Biteship
          </div>
          
          <div class="barcode-container">
            <div class="barcode-bars">
              ${generateBarcodeBars()}
            </div>
            <div class="barcode-number">${trackingNumber}</div>
          </div>
          
          <div class="tracking-number">
            No. Resi: ${trackingNumber}
          </div>
          
          <div class="reference">
            <span class="reference-label">No. Pesanan:</span>
            <span class="reference-value">${referenceNumber}</span>
          </div>
          
          <div class="address-section">
            <div class="address-box">
              <div class="address-label">PENERIMA:</div>
              <div class="address-name">${maskedReceiverName}</div>
              <div class="address-phone">${maskedReceiverPhone}</div>
              <div class="address-detail">${receiverFullAddress}</div>
            </div>
            <div class="address-box">
              <div class="address-label">PENGIRIM:</div>
              <div class="address-name">${senderName}</div>
              <div class="address-phone">${senderPhone}</div>
            </div>
          </div>
          
          <div class="product-info">
            <span class="product-label">Isi Paket:</span>
            <div class="product-detail">${productItems}</div>
          </div>
          
          <div class="notes">
            <em>Catatan: ${orderNotes}</em>
          </div>
          
          <div class="footer">
            Printed from kolektix.com
          </div>
        </div>
      </div>
    `;
  };

  const handleBulkPrint = async () => {
    if (selectedInvoiceIds.length === 0) return;

    setPrintLoading(true);
    try {
      const allResiHTML: string[] = [];
      
      for (const id of selectedInvoiceIds) {
        const transaction = filtered.find(t => t.id === id);
        if (!transaction?.invoice_no) continue;
        
        try {
          const res: any = await Get(`order-product-invoice/${transaction.invoice_no}`, {});
          if (res?.data) {
            allResiHTML.push(generateResiHTML(res.data));
          }
        } catch (err) {
          console.error(`Failed to fetch invoice ${transaction.invoice_no}:`, err);
        }
      }

      if (allResiHTML.length === 0) {
        alert("Gagal mengambil data invoice untuk dicetak.");
        return;
      }

      const combinedHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bulk Print Resi</title>
          <style>
            @media print {
              @page { size: A4; margin: 0; }
              .resi-page { 
                page-break-after: always; 
                height: 100vh; 
                display: flex; 
                align-items: center; 
                justify-content: center;
              }
              body { margin: 0; padding: 0; }
            }
            .resi-page { padding: 40px; border-bottom: 1px dashed #ccc; }
            .resi-container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border: 2px solid #000;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { font-size: 32px; font-weight: bold; margin: 0; }
            .subtitle { font-size: 14px; margin-top: 5px; }
            .biteship { text-align: center; margin: 10px 0; font-size: 14px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .barcode-container { text-align: center; margin: 15px 0; padding: 10px; border: 2px solid #000; }
            .barcode-bars { display: flex; justify-content: center; margin-bottom: 5px; }
            .barcode-number { font-family: monospace; font-size: 14px; }
            .tracking-number { text-align: center; font-size: 18px; font-weight: bold; margin: 10px 0; padding: 10px; border: 2px solid #000; background: #f9f9f9; }
            .reference { margin: 10px 0; padding: 8px; border: 2px solid #000; background: #f9f9f9; }
            .reference-label { font-weight: bold; margin-bottom: 4px; display: block; }
            .address-section { margin: 10px 0; border: 2px solid #000; }
            .address-box { padding: 10px; }
            .address-box:first-child { border-bottom: 2px solid #000; }
            .address-label { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
            .address-detail { line-height: 1.4; background: #f9f9f9; padding: 8px; border: 2px solid #000; margin-top: 5px; font-size: 13px; }
            .product-info { margin: 10px 0; padding: 10px; border: 2px solid #000; background: #f9f9f9; }
            .product-label { font-weight: bold; text-decoration: underline; margin-bottom: 5px; display: block; }
            .product-detail { font-size: 14px; line-height: 1.4; }
            .notes { margin: 10px 0; padding: 8px; border: 2px solid #000; background: #f9f9f9; font-style: italic; font-size: 13px; }
            .footer { margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          ${allResiHTML.join('')}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
        </html>
      `;

      const blob = new Blob([combinedHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Bulk print failed:", err);
    } finally {
      setPrintLoading(false);
    }
  };

  const handlePrintSingle = async (transaction: MerchandiseTransactionData) => {
    if (!transaction.invoice_no) return;
    
    setPrintLoading(true);
    try {
      const res: any = await Get(`order-product-invoice/${transaction.invoice_no}`, {});
      if (res?.data) {
        const resiHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Resi - ${transaction.invoice_no}</title>
            <style>
              @media print {
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 0; }
                .resi-page { height: 100vh; display: flex; align-items: center; justify-content: center; }
              }
              .resi-page { padding: 40px; }
              .resi-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border: 2px solid #000;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .header h1 { font-size: 32px; font-weight: bold; margin: 0; }
              .subtitle { font-size: 14px; margin-top: 5px; }
              .biteship { text-align: center; margin: 10px 0; font-size: 14px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
              .barcode-container { text-align: center; margin: 15px 0; padding: 10px; border: 2px solid #000; }
              .barcode-bars { display: flex; justify-content: center; margin-bottom: 5px; }
              .barcode-number { font-family: monospace; font-size: 14px; }
              .tracking-number { text-align: center; font-size: 18px; font-weight: bold; margin: 10px 0; padding: 10px; border: 2px solid #000; background: #f9f9f9; }
              .reference { margin: 10px 0; padding: 8px; border: 2px solid #000; background: #f9f9f9; }
              .reference-label { font-weight: bold; margin-bottom: 4px; display: block; }
              .address-section { margin: 10px 0; border: 2px solid #000; }
              .address-box { padding: 10px; }
              .address-box:first-child { border-bottom: 2px solid #000; }
              .address-label { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
              .address-detail { line-height: 1.4; background: #f9f9f9; padding: 8px; border: 2px solid #000; margin-top: 5px; font-size: 13px; }
              .product-info { margin: 10px 0; padding: 10px; border: 2px solid #000; background: #f9f9f9; }
              .product-label { font-weight: bold; text-decoration: underline; margin-bottom: 5px; display: block; }
              .product-detail { font-size: 14px; line-height: 1.4; }
              .notes { margin: 10px 0; padding: 8px; border: 2px solid #000; background: #f9f9f9; font-style: italic; font-size: 13px; }
              .footer { margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; text-align: center; font-size: 12px; }
            </style>
          </head>
          <body>
            ${generateResiHTML(res.data)}
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
          </html>
        `;

        const blob = new Blob([resiHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error("Print failed:", err);
    } finally {
      setPrintLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([getData(), getCreators()]);
  }, []);

  const dataWithCreatorNames = useMemo(() => {
    if (creators.length === 0) return data;
    return data.map((item) => {
      const foundCreator = creators.find((creator) => {
        if (creator.id === item.creator_id) return true;
        if (creator.has_user?.id === item.creator_id) return true;
        if (parseInt(creator.user_id) === item.creator_id) return true;
        return false;
      });

      if (foundCreator) {
        return {
          ...item,
          creator_name: foundCreator.has_user?.name || foundCreator.name || "Unknown",
          creator_id: foundCreator.id,
        };
      }
      return item;
    });
  }, [data, creators]);

  const filtered = useMemo(() => {
    let result = dataWithCreatorNames;

    if (filterValue) {
      result = result.filter((item) =>
        (item.invoice_no ?? "")
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    if (selectedProduct && selectedProduct !== "all") {
      result = result.filter((item) =>
        (item.product_name ?? "")
          .toString()
          .toLowerCase()
          .includes(selectedProduct.toLowerCase())
      );
    }

    if (variantFilter) {
      result = result.filter((item) => {
        if (!item.detail || !Array.isArray(item.detail)) return false;

        return item.detail.some(detail => {
          if (!detail.variant) return false;
          const variantDisplay = formatVariantDisplay(detail.variant);
          return variantDisplay.toLowerCase().includes(variantFilter.toLowerCase());
        });
      });
    }

    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      selectedDate.setHours(0, 0, 0, 0);

      result = result.filter((item) => {
        const orderDate = parseDate(item.order_date);
        if (orderDate.getTime() === 0) return false;
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === selectedDate.getTime();
      });
    }

    return result;
  }, [dataWithCreatorNames, filterValue, selectedProduct, variantFilter, dateFilter]);


  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const sortedFiltered = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      let valA = a[sortBy] ?? "";
      let valB = b[sortBy] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  const paginatedItems = sortedFiltered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const totalPriceAllFiltered = useMemo(
    () => filtered.reduce((sum, item) => {
      if (item.transaction_status_id === 2) {
        return sum + (Number(item.total_price) || 0);
      }
      return sum;
    }, 0),
    [filtered]
  );

  const totalSuccessfulTransactions = useMemo(
    () => filtered.filter(item => item.transaction_status_id === 2).length,
    [filtered]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterValue) count++;
    if (selectedProduct && selectedProduct !== "all") count++;
    if (variantFilter) count++;
    if (dateFilter) count++;
    return count;
  }, [filterValue, selectedProduct, variantFilter, dateFilter]);

  const exportToCSV = (rows: MerchandiseTransactionData[]) => {
    const successfulRows = rows.filter(item => item.transaction_status_id === 2);

    if (!successfulRows || successfulRows.length === 0) {
      const headers = [
        "Invoice Number",
        "Nama Produk (dengan Varian)",
        "SKU",
        "Total Qty",
        "Total Price",
        "Transaction Status",
        "Voucher",
      ];
      const csvContent = headers.join(",") + "\n";
      downloadCSV(csvContent);
      return;
    }

    const headers = [
      "Invoice Number",
      "Nama Produk (dengan Varian)",
      "SKU",
      "Total Qty",
      "Total Price",
      "Transaction Status",
      "Voucher",
    ];
    const escapeCell = (value: any) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      const needsQuotes = /[,"\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const lines = successfulRows.map((r) =>
      [
        escapeCell(r.invoice_no),
        escapeCell(r.product_name),
        escapeCell(r.sku),
        escapeCell(r.total_qty),
        escapeCell(r.total_price),
        escapeCell(getStatusInfo(r.transaction_status_id).text),
        escapeCell(r.voucher),
      ].join(",")
    );

    const csvContent = headers.join(",") + "\n" + lines.join("\n");
    downloadCSV(csvContent);
  };

  const downloadCSV = (csvContent: string) => {
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = url;
      a.download = `merchandise-transaction-${timestamp}.csv`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      const win = window.open();
      if (win) {
        win.document.write(`<pre>${csvContent}</pre>`);
        win.document.close();
      }
    }
  };

  const handleViewDetail = async (transaction: MerchandiseTransactionData) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
    setInvoiceDetail(null);
    setDetailError(null);

    if (transaction.invoice_no && transaction.invoice_no !== "-") {
      await getInvoiceDetail(transaction.invoice_no);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setInvoiceDetail(null);
    setDetailError(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = parseDate(dateString);
      if (date.getTime() === 0) return dateString;
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = parseDate(dateString);
      if (date.getTime() === 0) return dateString;
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = parseDate(dateString);
      if (date.getTime() === 0) return dateString;
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCompactCurrency = (amount?: number | string) => {
    const num = Number(amount) || 0;
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  function onRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ProductCell = ({ details }: { details?: ProductDetail[] }) => {
    if (!details || details.length === 0) {
      return <span>-</span>;
    }

    return (
      <div className="space-y-2 max-w-xs">
        {details.map((detail, idx) => {
          const productName = detail.product?.product_name || detail.product_name || "Produk";
          const hasVariant = detail.variant && Object.keys(detail.variant).length > 0;

          const variantName = hasVariant ? getVariantName(detail.variant) : '';
          const variantValue = hasVariant ? getVariantValue(detail.variant) : '';
          const variantDisplay = hasVariant ? formatVariantDisplay(detail.variant) : '';

          return (
            <div key={idx} className="border-b border-gray-100 last:border-0 pb-1 last:pb-0">
              <div className="flex items-start gap-1">
                <FontAwesomeIcon
                  icon={faBox}
                  className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0"
                />
                <span className="text-xs font-medium">{productName}</span>
              </div>

              {hasVariant && variantDisplay && (
                <div className="ml-4 mt-1 space-y-1">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <FontAwesomeIcon
                      icon={getVariantIcon(variantName)}
                      className="h-2.5 w-2.5 text-purple-500"
                    />
                    {variantName && variantValue ? (
                      <>
                        <span className="font-medium">{variantName}:</span>
                        <span className="text-gray-700">{variantValue}</span>
                      </>
                    ) : (
                      <span className="text-gray-700">{variantDisplay}</span>
                    )}
                  </div>

                  {detail.variant?.sku && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FontAwesomeIcon icon={faBarcode} className="h-2.5 w-2.5" />
                      <span>SKU: {detail.variant.sku}</span>
                    </div>
                  )}
                </div>
              )}

              {detail.qty && (
                <div className="ml-4 mt-1 text-xs text-gray-500">
                  Qty: {detail.qty}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading || loadingCreators) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Text fw={800} style={{ fontSize: '26px' }} mx={15} mt={15} mb={0} c="dark.9">Data Pengiriman</Text>
      <MantineCard p={25} m={15} withBorder radius="md">
        <Stack gap="xl">


            <Box mt={15}>
                        {/* Row 1: Search + Filter Produk + Item per halaman → rata kanan */}
                        <Flex align="center" gap="sm" wrap="wrap" mb="sm" justify="flex-end">
                            <MantineTextInput
                                placeholder="Cari invoice..."
                                leftSection={<Icon icon="solar:magnifer-linear" width={18} />}
                                value={filterValue}
                                onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
                                style={{ width: 300 }}
                                size="sm"
                            />
                            <MantineSelect
                                placeholder="Filter Produk"
                                data={[
                                    { value: 'all', label: 'Semua Produk' },
                                    ...extractProductNames(data).map(p => ({ value: p.key, label: p.label }))
                                ]}
                                value={selectedProduct}
                                onChange={(val) => { setSelectedProduct(val || 'all'); setPage(1); }}
                                style={{ minWidth: 200 }}
                                size="sm"
                                searchable
                                clearable
                            />
                            <Group gap="xs" align="center">
                                <Text size="sm" c="gray">Item per halaman:</Text>
                                <MantineSelect
                                    value={rowsPerPage.toString()}
                                    onChange={(val) => { setRowsPerPage(Number(val)); setPage(1); }}
                                    data={['10', '20', '50', '100']}
                                    style={{ width: 80 }}
                                    size="sm"
                                />
                            </Group>
                        </Flex>

                        {/* Row 2: Menampilkan kiri | Pilih Semua + Cetak kanan */}
                        <Flex align="center" gap="sm" mb="md">
                            <Text size="sm" c="gray">
                                Menampilkan {filtered.length > 0 ? `${(page-1)*rowsPerPage+1}-${Math.min(page*rowsPerPage, filtered.length)}` : '0'} dari {filtered.length} pengiriman
                            </Text>
                            <Checkbox
                                checked={selectedInvoiceIds.length === paginatedItems.length && paginatedItems.length > 0}
                                indeterminate={selectedInvoiceIds.length > 0 && selectedInvoiceIds.length < paginatedItems.length}
                                onChange={toggleSelectAll}
                                size="sm"
                                label="Pilih Semua"
                                ml="auto"
                                styles={{ label: { fontSize: '13px', fontWeight: 500, cursor: 'pointer' } }}
                            />
                            <MantineButton
                                variant="filled"
                                color="blue"
                                leftSection={printLoading ? <Icon icon="line-md:loading-twotone-loop" /> : <Icon icon="solar:printer-bold" width={16} />}
                                onClick={handleBulkPrint}
                                disabled={selectedInvoiceIds.length === 0 || printLoading}
                                size="sm"
                                styles={{ root: { color: 'white' } }}
                            >
                                Cetak Resi Semua {selectedInvoiceIds.length > 0 ? `(${selectedInvoiceIds.length})` : ''}
                            </MantineButton>
                        </Flex>

                        {/* Table */}
                        <Box style={{ overflowX: 'auto', overflowY: 'auto', position: 'relative' }}>
                            <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e8e8e8', backgroundColor: '#f5f7fa' }}>
                                        <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', width: 48 }}>#</th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }} onClick={() => handleSort('invoice_no')}>Invoice <SortIcon col="invoice_no" /></th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }} onClick={() => handleSort('customer_name')}>Customer <SortIcon col="customer_name" /></th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }} onClick={() => handleSort('product_name')}>Produk <SortIcon col="product_name" /></th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }} onClick={() => handleSort('resi_no')}>Resi <SortIcon col="resi_no" /></th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }} onClick={() => handleSort('ongkir')}>Ongkir <SortIcon col="ongkir" /></th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }} onClick={() => handleSort('shipping_address')}>Alamat Tujuan <SortIcon col="shipping_address" /></th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dikirim Dari</th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', position: 'sticky', right: 145, backgroundColor: '#f5f7fa', zIndex: 2, boxShadow: '-2px 0 5px rgba(0,0,0,0.06)' }} onClick={() => handleSort('status_name')}>Status Kirim <SortIcon col="status_name" /></th>
                                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', position: 'sticky', right: 0, backgroundColor: '#f5f7fa', zIndex: 2, boxShadow: '-2px 0 5px rgba(0,0,0,0.07)' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((item, idx) => {
                                        const shippingInfo = getShippingStatusInfo(item);
                                        const rowNumber = (page - 1) * rowsPerPage + idx + 1;
                                        return (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafd')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', textAlign: 'center', width: 48 }}>
                                                    <Text size="sm" c="dimmed" fw={500}>{rowNumber}</Text>
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                                    <Text 
                                                        size="sm" 
                                                        fw={600} 
                                                        c="blue" 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleViewDetail(item)}
                                                    >
                                                        {item.invoice_no}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">{formatDate(item.order_date)}</Text>
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                                    <Text size="sm">{item.customer_name}</Text>
                                                    <Text size="xs" c="dimmed">{item.customer_email}</Text>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>{item.product_name}</Text>
                                                    <Text size="xs" c="dimmed">Qty: {item.total_qty}</Text>
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                                    <Text size="sm" fw={600}>{item.resi_no && item.resi_no !== '-' ? item.resi_no : <Text size="sm" c="dimmed">Belum ada</Text>}</Text>
                                                    <Text size="xs" c="dimmed">{item.courier_name && item.courier_name !== '-' ? item.courier_name : ''}</Text>
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                                    {item.ongkir && item.ongkir > 0 ? (
                                                        <Text size="sm" fw={600}>
                                                            <NumberFormatter prefix="Rp " value={item.ongkir} thousandSeparator="." decimalSeparator="," />
                                                        </Text>
                                                    ) : (
                                                        <Text size="sm" c="dimmed">-</Text>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                                                        {formatShippingAddress((item as any).address || item.shipping_address)}
                                                    </Text>
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                                    <Text size="sm">Warehouse Kita</Text>
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', position: 'sticky', right: 145, backgroundColor: 'white', zIndex: 1, boxShadow: '-2px 0 4px rgba(0,0,0,0.05)' }}>
                                                    <Badge color={shippingInfo.color} variant="filled" style={{ fontWeight: 600 }}>
                                                        {shippingInfo.text}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1, boxShadow: '-2px 0 5px rgba(0,0,0,0.07)' }}>
                                                    <Flex align="center" gap="xs">
                                                        <Tooltip label="Update Tracking">
                                                            <ActionIcon 
                                                                variant="light" 
                                                                color="blue" 
                                                                onClick={() => { setSelectedInvoiceForTracking(item.invoice_no || ""); setIsTrackingModalOpen(true); }}
                                                                size="md"
                                                                radius="md"
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} style={{ width: 14 }} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Update Resi">
                                                            <ActionIcon 
                                                                variant="light" 
                                                                color="violet" 
                                                                onClick={() => { setSelectedInvoiceForResi(item.invoice_no || ""); setIsResiModalOpen(true); }}
                                                                size="md"
                                                                radius="md"
                                                            >
                                                                <Icon icon="solar:ticket-bold" width={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Checkbox
                                                            checked={selectedInvoiceIds.includes(item.id)}
                                                            onChange={() => toggleSelectItem(item.id)}
                                                            size="xs"
                                                        />
                                                        <Tooltip label="Cetak Resi">
                                                            <ActionIcon 
                                                                variant="filled" 
                                                                color="blue" 
                                                                onClick={() => handlePrintSingle(item)}
                                                                loading={printLoading}
                                                                size="md"
                                                                radius="md"
                                                            >
                                                                <Icon icon="solar:printer-bold" width={14} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Flex>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Box>

                        {paginatedItems.length === 0 && (
                            <Box py="xl" ta="center">
                                <Text c="dimmed">Tidak ada data pengiriman yang ditemukan</Text>
                            </Box>
                        )}

                        <Flex justify="space-between" align="center" mt={0} px={4} py={14} style={{ borderTop: '1px solid #ebebeb', backgroundColor: '#fafafa', borderRadius: '0 0 8px 8px' }}>
                            <Text size="xs" c="dimmed">
                                Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                            </Text>
                            <MantinePagination 
                                total={totalPages} 
                                value={page} 
                                onChange={setPage} 
                                size="sm"
                                radius="xl"
                                withEdges
                                color="blue"
                                styles={{
                                    control: { border: '1px solid #e0e0e0', fontWeight: 600 },
                                }}
                            />
                            <Text size="xs" c="dimmed">
                                {filtered.length > 0 ? `${(page-1)*rowsPerPage+1}–${Math.min(page*rowsPerPage, filtered.length)}` : '0'} / {filtered.length}
                            </Text>
                        </Flex>
                    </Box>
        </Stack>
    </MantineCard>

      <NextUIModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="full"
        scrollBehavior="inside"
        classNames={{
          base: 'bg-white',
          backdrop: 'backdrop-blur-sm',
          header: 'border-b border-primary-light-200 px-6 py-4 bg-gradient-to-r from-[#0b387c] to-[#1a4b9c] sticky top-0 z-10',
          body: 'p-0',
          footer: 'border-t border-primary-light-200 px-6 py-4 bg-gray-50',
          closeButton: 'text-white hover:bg-white/20',
        }}
      >
        <ModalContent>
          {() => {
            const trackingNumber = getTrackingNumber();

            return (
              <>
                <ModalHeader className="flex flex-col gap-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <FontAwesomeIcon icon={faFileInvoice} className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Detail Pesanan</h2>
                        <p className="text-xs text-white/90 flex items-center gap-2">
                          <span>Order ID: {selectedTransaction?.invoice_no || '-'}</span>
                          <button
                            onClick={() => copyToClipboard(selectedTransaction?.invoice_no || '')}
                            className="text-white/70 hover:text-white"
                          >
                            <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
                          </button>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invoiceDetail?.transaction_status && (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
                          style={{
                            backgroundColor: invoiceDetail.transaction_status.bgcolor,
                            color: '#fff'
                          }}
                        >
                          {invoiceDetail.transaction_status.name}
                        </span>
                      )}
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody className="py-0">
                  {loadingDetail ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : detailError ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="h-12 w-12 text-red-300 mb-3" />
                        <p className="text-red-500">{detailError}</p>
                      </div>
                    </div>
                  ) : invoiceDetail ? (
                    <div className="bg-gray-50">
                      <div className="bg-white border-b border-primary-light-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${invoiceDetail.transaction_status?.name.toLowerCase().includes('expired')
                                  ? 'bg-gray-100'
                                  : 'bg-green-100'
                                }`}>
                                <FontAwesomeIcon
                                  icon={getStatusIcon(invoiceDetail.transaction_status?.name || '')}
                                  className={`h-5 w-5 ${invoiceDetail.transaction_status?.name.toLowerCase().includes('expired')
                                      ? 'text-gray-600'
                                      : 'text-green-600'
                                    }`}
                                />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Status Pesanan</p>
                                <p className="text-sm font-semibold">
                                  {invoiceDetail.transaction_status?.name || 'Diproses'}
                                </p>
                              </div>
                            </div>
                            <div className="h-8 w-px bg-primary-light-200"></div>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faTruck} className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Status Pengiriman</p>
                                <p className="text-sm font-semibold">
                                  {invoiceDetail.manifest && invoiceDetail.manifest.length > 0
                                    ? invoiceDetail.manifest[0].status_name
                                    : 'Order berhasil dibuat'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">No. Resi</p>
                            <p className="font-mono text-sm font-semibold">
                              {trackingNumber}
                            </p>
                            {trackingNumber !== '-' && (
                              <p className="text-xs text-gray-500 mt-1">
                                {invoiceDetail.courier?.courier_company} {invoiceDetail.courier?.courier_type}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2 space-y-4">
                            <NextUICard className="border border-primary-light-200 shadow-sm">
                              <CardBody className="p-0">
                                <div className="p-4 border-b border-primary-light-200 bg-gray-50">
                                  <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBox} className="h-4 w-4 text-purple-600" />
                                    Informasi Paket
                                  </h3>
                                </div>
                                <div className="p-4">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-primary-light-200">
                                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Nama Barang</th>
                                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Varian</th>
                                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Qty</th>
                                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Harga</th>
                                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Subtotal</th>
                                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-600">Catatan</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {invoiceDetail.detail && invoiceDetail.detail.length > 0 ? (
                                          invoiceDetail.detail.map((item, idx) => {
                                            let variantDisplay = '-';
                                            let variantName = '';

                                            if (item.variant) {
                                              const variantInfo = formatVariantDisplay(item.variant);
                                              if (variantInfo) {
                                                variantDisplay = variantInfo;
                                              }
                                              variantName = getVariantName(item.variant);
                                            }

                                            return (
                                              <tr key={idx} className="border-b border-primary-light-200">
                                                <td className="py-2 px-2">
                                                  <p className="font-medium text-xs">{item.product?.product_name || 'Produk'}</p>
                                                </td>
                                                <td className="py-2 px-2">
                                                  {variantDisplay !== '-' ? (
                                                    <Chip
                                                      size="sm"
                                                      variant="flat"
                                                      color="secondary"
                                                      startContent={
                                                        <FontAwesomeIcon
                                                          icon={getVariantIcon(variantName)}
                                                          className="h-2.5 w-2.5 mr-1"
                                                        />
                                                      }
                                                      className="text-xs"
                                                    >
                                                      {variantDisplay}
                                                    </Chip>
                                                  ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                  )}
                                                </td>
                                                <td className="py-2 px-2 text-xs">{item.qty}</td>
                                                <td className="py-2 px-2 text-xs">{formatCompactCurrency(parseFloat(item.price))}</td>
                                                <td className="py-2 px-2 text-xs font-medium">
                                                  {formatCompactCurrency(parseFloat(item.price) * item.qty)}
                                                </td>
                                                <td className="py-2 px-2 text-xs text-gray-500">
                                                  {item.order_notes || '-'}
                                                </td>
                                              </tr>
                                            );
                                          })
                                        ) : (
                                          <tr>
                                            <td colSpan={6} className="py-4 text-center text-gray-500">
                                              Tidak ada item
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </CardBody>
                            </NextUICard>

                            {invoiceDetail.address && (
                              <NextUICard className="border border-primary-light-200 shadow-sm">
                                <CardBody className="p-0">
                                  <div className="p-3 border-b border-primary-light-200 bg-blue-50">
                                    <h3 className="font-semibold text-xs flex items-center gap-2">
                                      <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-blue-600" />
                                      Alamat Pengiriman
                                    </h3>
                                  </div>
                                  <div className="p-3">
                                    <p className="font-semibold text-sm">{invoiceDetail.address.nama_penerima}</p>
                                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                      <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                                      {invoiceDetail.address.phone}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-2">
                                      {invoiceDetail.address.address_detail}
                                      {invoiceDetail.address.zipcode && `, ${invoiceDetail.address.zipcode}`}
                                    </p>
                                  </div>
                                </CardBody>
                              </NextUICard>
                            )}

                            <NextUICard className="border border-primary-light-200 shadow-sm">
                              <CardBody className="p-0">
                                <div className="p-4 border-b border-primary-light-200 bg-gray-50">
                                  <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <FontAwesomeIcon icon={faReceipt} className="h-4 w-4 text-blue-600" />
                                    Ringkasan Pesanan
                                  </h3>
                                </div>
                                <div className="p-4">
                                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Order ID</p>
                                      <p className="font-mono text-sm font-semibold flex items-center gap-2">
                                        {invoiceDetail.invoice_no}
                                        <button
                                          onClick={() => copyToClipboard(invoiceDetail.invoice_no)}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
                                        </button>
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Tanggal Order</p>
                                      <p className="text-sm font-semibold">
                                        {formatDateShort(invoiceDetail.created_at)}, {formatTime(invoiceDetail.created_at)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Kurir</p>
                                      <p className="text-sm font-semibold flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTruck} className="h-3 w-3 text-gray-400" />
                                        {invoiceDetail.courier?.courier_company || 'sicepat'} {invoiceDetail.courier?.courier_type || 'reg'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Berat</p>
                                      <p className="text-sm font-semibold flex items-center gap-2">
                                        <FontAwesomeIcon icon={faWeightHanging} className="h-3 w-3 text-gray-400" />
                                        {invoiceDetail.total_qty} gram
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Ongkos Kirim</p>
                                      <p className="text-sm font-semibold text-green-600">{formatCompactCurrency(invoiceDetail.delivery_price)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
                                      <p className="text-sm font-semibold flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCreditCard} className="h-3 w-3 text-gray-400" />
                                        {invoiceDetail.payment_method_custom || invoiceDetail.payment_method || 'QRIS'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardBody>
                            </NextUICard>
                          </div>

                          <div className="lg:col-span-1 space-y-4">
                            <NextUICard className="border border-primary-light-200 shadow-sm">
                              <CardBody className="p-0">
                                <div className="p-4 border-b border-primary-light-200 bg-gray-50">
                                  <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTimeline} className="h-4 w-4 text-blue-600" />
                                    Riwayat Pelacakan
                                  </h3>
                                </div>
                                <div className="p-4 max-h-[500px] overflow-y-auto">
                                  {invoiceDetail.manifest && invoiceDetail.manifest.length > 0 ? (
                                    <div className="relative">
                                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-light-200"></div>
                                      <div className="space-y-4">
                                        {invoiceDetail.manifest.map((manifest, idx) => (
                                          <div key={idx} className="flex gap-3 relative">
                                            <div className="relative z-10">
                                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}>
                                                <FontAwesomeIcon
                                                  icon={idx === 0 ? faLocationDot : getStatusIcon(manifest.status_name)}
                                                  className={`h-4 w-4 ${idx === 0 ? 'text-blue-600' : 'text-gray-600'
                                                    }`}
                                                />
                                              </div>
                                            </div>
                                            <div className="flex-1 pb-4">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <p className="text-sm font-medium">{manifest.status_name}</p>
                                                  <p className="text-xs text-gray-600 mt-0.5">{manifest.description}</p>
                                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                                                    {manifest.location}
                                                  </p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-xs font-medium">{formatDateShort(manifest.courier_time)}</p>
                                                  <p className="text-xs text-gray-500">{formatTime(manifest.courier_time)}</p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-light-200"></div>
                                      <div className="flex gap-3 relative">
                                        <div className="relative z-10">
                                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-green-600" />
                                          </div>
                                        </div>
                                        <div className="flex-1 pb-4">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="text-sm font-medium">Order berhasil dibuat</p>
                                              <p className="text-xs text-gray-600 mt-0.5">Pembelian berhasil, Order Berhasil</p>
                                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                                                Warehouse
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-xs font-medium">{formatDateShort(invoiceDetail.created_at)}</p>
                                              <p className="text-xs text-gray-500">{formatTime(invoiceDetail.created_at)}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardBody>
                            </NextUICard>

                            <NextUICard className="border border-primary-light-200 shadow-sm sticky top-4">
                              <CardBody className="p-0">
                                <div className="p-3 border-b border-primary-light-200 bg-green-50">
                                  <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="h-4 w-4 text-green-600" />
                                    Ringkasan Pembayaran
                                  </h3>
                                </div>
                                <div className="p-3">
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Total Harga</span>
                                      <span className="font-medium">{formatCompactCurrency(invoiceDetail.total_price)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Ongkos Kirim</span>
                                      <span className="font-medium">{formatCompactCurrency(invoiceDetail.delivery_price)}</span>
                                    </div>
                                    {invoiceDetail.admin_fee ? (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Admin Fee</span>
                                        <span className="font-medium">{formatCompactCurrency(invoiceDetail.admin_fee)}</span>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Admin Fee</span>
                                        <span className="font-medium">Rp 4.000</span>
                                      </div>
                                    )}
                                    <Divider className="my-2 bg-primary-light-200" />
                                    <div className="flex justify-between font-semibold text-sm">
                                      <span>Total Tagihan</span>
                                      <span className="text-green-600">{formatCompactCurrency(invoiceDetail.grandtotal)}</span>
                                    </div>
                                  </div>

                                  <Divider className="my-3 bg-primary-light-200" />

                                  <div>
                                    <h4 className="font-semibold text-xs mb-2 flex items-center gap-2">
                                      <FontAwesomeIcon icon={faCreditCard} className="h-3 w-3 text-gray-400" />
                                      Detail Transaksi
                                    </h4>
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Tanggal</span>
                                        <span className="font-medium">
                                          {formatDateShort(invoiceDetail.created_at)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Deskripsi</span>
                                        <p className="font-medium text-xs mt-1 bg-gray-50 p-2 rounded border border-primary-light-200">
                                          Payment with {invoiceDetail.payment_method_custom || invoiceDetail.payment_method || 'QRIS'}
                                          <br />
                                          <span className="text-gray-500 text-[10px]">
                                            {invoiceDetail.invoice_no}
                                          </span>
                                        </p>
                                      </div>
                                      <div className="flex justify-between pt-1">
                                        <span className="text-gray-600">Jumlah</span>
                                        <span className="font-semibold">{formatCompactCurrency(invoiceDetail.grandtotal)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <Divider className="my-3 bg-primary-light-200" />

                                  <div className="text-center">
                                    <p className="text-[10px] text-gray-500">
                                      {invoiceDetail.xendit_url ? (
                                        <a
                                          href={invoiceDetail.xendit_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          Lihat Detail Pembayaran
                                        </a>
                                      ) : (
                                        'Punya masukkan? Request flur atau berikan feedback'
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </NextUICard>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faFileInvoice} className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">Tidak ada detail transaksi</p>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter className="py-4 bg-gray-50 px-6">
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
                    <NextUIButton
                      color="default"
                      variant="light"
                      onPress={handleCloseModal}
                      className="min-w-[100px]"
                      size="sm"
                    >
                      Tutup
                    </NextUIButton>
                    {trackingNumber !== '-' && (
                      <NextUIButton
                        color="secondary"
                        variant="flat"
                        onPress={() => selectedTransaction && handlePrintSingle(selectedTransaction)}
                        className="min-w-[120px]"
                        size="sm"
                        startContent={<FontAwesomeIcon icon={faPrint} className="h-3.5 w-3.5" />}
                      >
                        Cetak Resi
                      </NextUIButton>
                    )}
                    <NextUIButton
                      color="primary"
                      variant="solid"
                      onPress={() => {
                        if (
                          selectedTransaction?.invoice_no &&
                          selectedTransaction.invoice_no !== '-'
                        ) {
                          const baseUrl =
                            process.env.NEXT_PUBLIC_URL_MERCH || window.location.origin;
                          const viewUrl = `${baseUrl}merch-invoice/${selectedTransaction.invoice_no}`;
                          window.open(viewUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      isDisabled={
                        !selectedTransaction?.invoice_no || selectedTransaction.invoice_no === '-'
                      }
                      className="bg-[#194E9E] hover:bg-[#163C7A] text-white min-w-[180px]"
                      startContent={<FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />}
                      size="sm"
                    >
                      Lihat Invoice Lengkap
                    </NextUIButton>
                  </div>
                </ModalFooter>
              </>
            )
          }}
        </ModalContent>
      </NextUIModal>

      {/* Tracking Update Modal */}
      <NextUIModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          base: 'bg-white',
          backdrop: 'backdrop-blur-sm',
          header: 'border-b border-gray-200 px-6 py-3 bg-gradient-to-r from-[#0b387c] to-[#1a4b9c] sticky top-0 z-10',
          body: 'p-0',
          closeButton: 'text-white hover:bg-white/20',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Update Tracking</h2>
                    <p className="text-xs text-white/90">Invoice: {selectedInvoiceForTracking}</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-0">
                <TrackingUpdateModal
                  invoiceNo={selectedInvoiceForTracking}
                  onClose={() => setIsTrackingModalOpen(false)}
                  onSuccess={() => {
                    // Optionally refresh data
                  }}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </NextUIModal>

      {/* Resi Update Modal */}
      <NextUIModal
        isOpen={isResiModalOpen}
        onClose={() => setIsResiModalOpen(false)}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          base: 'bg-white',
          backdrop: 'backdrop-blur-sm',
          header: 'border-b border-gray-200 px-6 py-3 bg-gradient-to-r from-[#0b387c] to-[#1a4b9c] sticky top-0 z-10',
          body: 'p-0',
          closeButton: 'text-white hover:bg-white/20',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon icon="solar:ticket-bold" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Update Resi Pengiriman</h2>
                    <p className="text-xs text-white/90">Invoice: {selectedInvoiceForResi}</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-0">
                <ResiUpdateModal
                  invoiceNo={selectedInvoiceForResi}
                  onClose={() => setIsResiModalOpen(false)}
                  onSuccess={() => {
                    getData();
                  }}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </NextUIModal>
    </>
  );
};

export default DeliveryPage;