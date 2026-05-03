// import TableData from "@/components/TableData";
// import { Get } from "@/utils/REST";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import {
//     Accordion,
//     ActionIcon,
//     AspectRatio,
//     Box,
//     Card,
//     Divider,
//     Flex,
//     Image,
//     NumberFormatter,
//     SimpleGrid,
//     Stack,
//     Tabs,
//     Text,
//     Title,
//     Badge
// } from "@mantine/core";
// import { useListState } from "@mantine/hooks";
// import moment from "moment";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";

// // Interface untuk data statistik
// interface StatisticsData {
//     text: string;
//     value: number;
//     icon: string;
//     isCurrency?: boolean;
// }

// // Interface untuk data transaksi merchandise
// interface MerchandiseTransactionData {
//     id: number;
//     invoice_no: string;
//     product_name: string;
//     sku: string;
//     total_qty: number;
//     total_price: number;
//     transaction_status_id: number;
//     voucher: string;
//     creator_id: number;
//     creator_name: string;
//     detail: any[];
//     order_date: string;
//     customer_name: string;
//     customer_email: string;
//     shipping_address: string;
//     status_name: string;
//     payment_method: string;
//     notes: string;
//     product_id?: number;
//     customer_phone?: string;
//     product_variant?: string;
//     shipping_address?: any;
//     // Untuk kompatibilitas dengan TableData
//     [key: string]: any;
// }

// interface InvoiceDetailData {
//     id: number;
//     invoice_no: string;
//     total_qty: number;
//     total_price: number;
//     delivery_price: number;
//     grandtotal: number;
//     admin_fee: number;
//     payment_method: string;
//     payment_status: string;
//     created_at: string;
//     user: {
//         id: number;
//         name: string;
//         email: string;
//         phone?: string | null;
//     };
//     transaction_status: {
//         id: number;
//         name: string;
//         bgcolor: string;
//     };
//     detail: Array<{
//         id: number;
//         product_id: number;
//         qty: number;
//         price: string;
//         order_notes?: string;
//         product: {
//             id: number;
//             product_name: string;
//             sku?: string;
//             creator?: {
//                 id: number;
//                 name: string;
//             };
//         };
//         variant?: {
//             id: number;
//             varian_name?: string;
//             name?: string;
//             sku?: string;
//         };
//     }>;
//     address?: {
//         nama_penerima?: string;
//         phone?: string;
//         address_detail?: string;
//         zipcode?: string | number;
//     };
//     manifest?: Array<{
//         id: number;
//         tracking_number: string;
//         courier_name: string;
//         status: string;
//         created_at: string;
//     }>;
//     history?: Array<{
//         id: number;
//         status: string;
//         note: string;
//         created_at: string;
//     }>;
// }

// // Interface untuk kolom TableData (sesuaikan dengan komponen TableData Anda)
// interface TableColumn {
//     accessor: string;
//     title: string;
//     width?: number;
//     render?: (item: any) => React.ReactNode;
// }

// // Helper function untuk parse harga dari berbagai format
// const parsePrice = (price: any): number => {
//     if (!price) return 0;

//     // Jika sudah number, langsung return
//     if (typeof price === 'number') return price;

//     // Jika string, hilangkan karakter non-digit kecuali titik dan koma
//     const priceStr = String(price);

//     // Hilangkan "Rp", spasi, dan karakter non-digit kecuali titik dan koma
//     let cleanPrice = priceStr
//         .replace(/[^\d.,]/g, '') // Hapus semua karakter kecuali digit, titik, koma
//         .replace(/\./g, '') // Hapus titik (ribuan separator)
//         .replace(',', '.'); // Ubah koma menjadi titik (decimal separator)

//     // Parse ke float
//     const parsed = parseFloat(cleanPrice);

//     // Jika NaN, coba parse langsung
//     if (isNaN(parsed)) {
//         return parseFloat(priceStr) || 0;
//     }

//     return parsed;
// };

// // Helper function untuk format rupiah
// const formatRupiah = (value: number | string): string => {
//     const numValue = typeof value === 'string' ? parsePrice(value) : value;

//     if (isNaN(numValue) || numValue === 0) {
//         return "Rp 0";
//     }

//     return new Intl.NumberFormat('id-ID', {
//         style: 'currency',
//         currency: 'IDR',
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//     }).format(numValue);
// };

// // Helper function untuk format angka tanpa mata uang
// const formatNumber = (value: number | string): string => {
//     const numValue = typeof value === 'string' ? parseFloat(value) : value;

//     if (isNaN(numValue) || numValue === 0) {
//         return "0";
//     }

//     return new Intl.NumberFormat('id-ID').format(numValue);
// };

// export default function MerchDetail() {
//     const [data, setData] = useState<any>();
//     const [imageList, setImageList] = useState<any[]>([]);
//     const [loading, setLoading] = useListState<string>();
//     const [statistics, setStatistics] = useState<StatisticsData[]>([
//         {
//             text: 'Visitor',
//             value: 1000,
//             icon: 'famicons:people-outline',
//         },
//         {
//             text: 'Total Bookmarks',
//             value: 1000,
//             icon: 'akar-icons:bookmark',
//         },
//         {
//             text: 'Total Terjual',
//             value: 0,
//             icon: 'akar-icons:shopping-bag',
//         },
//         {
//             text: 'Total Pendapatan',
//             value: 0,
//             icon: 'akar-icons:money',
//             isCurrency: true,
//         },
//     ]);
//     const [transactions, setTransactions] = useState<MerchandiseTransactionData[]>([]);
//     const [filteredTransactions, setFilteredTransactions] = useState<MerchandiseTransactionData[]>([]);
//     const router = useRouter();
//     const { slug } = router.query;

//     useEffect(() => {
//         if (slug) {
//             getData();
//         }
//     }, [slug]);

//     const getData = () => {
//         if (slug) {
//             setLoading.append('getdata');
//             Get(`product/${slug}`, {})
//                 .then((res: any) => {
//                     if (res.data) {
//                         const productData = res.data;
//                         console.log('Product data:', productData); // Debug log
//                         setData(productData);
//                         setImageList(productData.product_image || []);

//                         // Setelah data merchandise didapat, ambil data statistik dan transaksi
//                         getStatisticsData(productData.id);
//                     }
//                     setLoading.filter((e) => e != 'getdata');
//                 })
//                 .catch((err) => {
//                     console.log(err);
//                     setLoading.filter((e) => e != 'getdata');
//                 });
//         }
//     };

//     // Fungsi untuk mengambil data statistik dan transaksi
//     const getStatisticsData = async (productId: number) => {
//         try {
//             const res: any = await Get("order-bycreator", {});
//             console.log('Order by creator data:', res?.data); // Debug log

//             // Filter data berdasarkan product_id yang sedang dilihat
//             let filteredData = res?.data || [];
//             let transactionsData: MerchandiseTransactionData[] = [];

//             // Hitung total penjualan (qty) dan total pendapatan
//             let totalQty = 0;
//             let totalRevenue = 0;

//             filteredData.forEach((item: any) => {
//                 // Debug log untuk setiap item
//                 console.log('Processing item:', {
//                     id: item.id,
//                     invoice_no: item.invoice_no,
//                     detail: item.detail,
//                     total_price: item.total_price,
//                     price: item.price
//                 });

//                 // Cek apakah transaksi ini mengandung product yang dicari
//                 let hasProduct = false;
//                 let productNames: string[] = [];
//                 let productQty = 0;
//                 let productPrice = 0;
//                 let productSku = "";

//                 // Jika ada detail array
//                 if (Array.isArray(item.detail)) {
//                     item.detail.forEach((detail: any) => {
//                         const detailProductId = detail.product_id || detail.product?.id;
//                         console.log('Checking detail:', {
//                             detailProductId,
//                             targetProductId: productId,
//                             quantity: detail.quantity,
//                             price_total: detail.price_total,
//                             price: detail.price
//                         });

//                         if (detailProductId === productId) {
//                             hasProduct = true;

//                             // Kumpulkan nama produk
//                             if (detail?.product?.product_name) {
//                                 productNames.push(detail.product.product_name);
//                                 productSku = detail.product.sku || "";
//                             } else if (detail?.product_name) {
//                                 productNames.push(detail.product_name);
//                             }

//                             // Hitung qty untuk product ini
//                             const qty = detail.quantity || detail.qty || 0;
//                             productQty += qty;

//                             // Hitung price untuk product ini (gunakan parsePrice untuk konversi)
//                             const price = parsePrice(detail.price_total || detail.price || detail.total_price || 0);
//                             productPrice += price;

//                             // Tambahkan ke total keseluruhan
//                             totalQty += qty;
//                             totalRevenue += price;

//                             console.log('Product found in detail:', {
//                                 productId: detailProductId,
//                                 qty,
//                                 price,
//                                 totalQtySoFar: totalQty,
//                                 totalRevenueSoFar: totalRevenue
//                             });
//                         }
//                     });
//                 } else {
//                     // Untuk transaksi tanpa detail
//                     const rootProductId = item.product_id || item.product?.id;
//                     console.log('Checking root item:', {
//                         rootProductId,
//                         targetProductId: productId
//                     });

//                     if (rootProductId === productId) {
//                         hasProduct = true;
//                         productNames.push(item.product?.product_name || item.product_name || "-");

//                         const qty = item.total_qty || item.qty || 0;
//                         productQty = qty;

//                         const price = parsePrice(item.total_price || item.price || item.price_total || 0);
//                         productPrice = price;

//                         totalQty += qty;
//                         totalRevenue += price;

//                         console.log('Product found in root:', {
//                             productId: rootProductId,
//                             qty,
//                             price,
//                             totalQtySoFar: totalQty,
//                             totalRevenueSoFar: totalRevenue
//                         });
//                     }
//                 }

//                 // Jika transaksi mengandung product ini, tambahkan ke transactionsData
//                 if (hasProduct) {
//                     const transaction: MerchandiseTransactionData = {
//                         id: item.id || 0,
//                         invoice_no: item.invoice_no || "-",
//                         product_name: productNames.join(" | ") || "-",
//                         sku: productSku || item.detail?.[0]?.product?.sku || "-",
//                         total_qty: productQty,
//                         total_price: productPrice,
//                         transaction_status_id: item.transaction_status_id || 0,
//                         voucher: item.voucher || "-",
//                         creator_id: item.creator_id || item.creator?.id || 0,
//                         creator_name: item.creator?.name || "Creator",
//                         detail: item.detail || [],
//                         order_date: item.created_at || "-",
//                         customer_name: item.customer_name || "-",
//                         customer_email: item.customer_email || "-",
//                         shipping_address: item.shipping_address || "-",
//                         status_name: item.status_name || "-",
//                         payment_method: item.payment_method || "-",
//                         notes: item.notes || "-",
//                         product_id: productId,
//                     };

//                     transactionsData.push(transaction);
//                 }
//             });

//             console.log('Final calculations:', {
//                 totalQty,
//                 totalRevenue,
//                 transactionCount: transactionsData.length
//             });

//             // Update statistik
//             setStatistics(prev => prev.map(stat => {
//                 if (stat.text === 'Total Terjual') {
//                     return { ...stat, value: totalQty };
//                 }
//                 if (stat.text === 'Total Pendapatan') {
//                     return { ...stat, value: totalRevenue };
//                 }
//                 return stat;
//             }));

//             // Set data transaksi
//             setTransactions(transactionsData);
//             setFilteredTransactions(transactionsData);

//         } catch (error) {
//             console.error("Error fetching statistics:", error);
//         }
//     };

//     // Handler untuk pencarian
//     const handleSearch = (value: string) => {
//         if (!value.trim()) {
//             setFilteredTransactions(transactions);
//             return;
//         }

//         const searchLower = value.toLowerCase();
//         const filtered = transactions.filter(item =>
//             item.invoice_no.toLowerCase().includes(searchLower) ||
//             item.customer_name.toLowerCase().includes(searchLower) ||
//             item.product_name.toLowerCase().includes(searchLower)
//         );
//         setFilteredTransactions(filtered);
//     };

//     // Kolom untuk tabel transaksi
//     const transactionColumns: TableColumn[] = [
//         {
//             accessor: 'invoice_no',
//             title: 'Invoice No',
//             width: 150,
//         },
//         {
//             accessor: 'order_date',
//             title: 'Tanggal',
//             width: 120,
//             render: (item: any) => (
//                 <Text>{moment(item.order_date).format('DD/MM/YYYY')}</Text>
//             )
//         },
//         {
//             accessor: 'customer_name',
//             title: 'Customer',
//             width: 150,
//         },
//         {
//             accessor: 'total_qty',
//             title: 'Qty',
//             width: 80,
//             render: (item: any) => (
//                 <Text>{item.total_qty}</Text>
//             )
//         },
//         {
//             accessor: 'total_price',
//             title: 'Total',
//             width: 120,
//             render: (item: any) => (
//                 <Text>{formatRupiah(item.total_price)}</Text>
//             )
//         },
//         {
//             accessor: 'status_name',
//             title: 'Status',
//             width: 120,
//             render: (item: any) => {
//                 let color = 'blue';
//                 const status = item.status_name?.toLowerCase();

//                 if (status?.includes('selesai') || status?.includes('completed')) {
//                     color = 'green';
//                 } else if (status?.includes('pending') || status?.includes('diproses')) {
//                     color = 'yellow';
//                 } else if (status?.includes('cancel') || status?.includes('batal')) {
//                     color = 'red';
//                 }

//                 return (
//                     <Badge color={color}>
//                         {item.status_name || 'Pending'}
//                     </Badge>
//                 );
//             }
//         },
//         {
//             accessor: 'payment_method',
//             title: 'Payment Method',
//             width: 130,
//         },
//     ];

//     return (
//         <Card p={30}>
//             <Stack gap={30}>
//                 <Flex justify="space-between" gap={30}>
//                     <AspectRatio ratio={1} maw={200} w="100%">
//                         <Image
//                             radius={10}
//                             src={imageList?.[0]?.image_url}
//                             bg="gray.1"
//                             alt={data?.product_name}
//                         />
//                     </AspectRatio>

//                     <Stack gap={0} w="100%">
//                         <Text size="xs" c="gray" mb={5}>
//                             Dibuat pada {moment(data?.created_at).format('DD MMMM YYYY')}
//                         </Text>
//                         <Flex gap={10} align="center">
//                             <Title size="h2" >{data?.product_name}</Title>
//                             <ActionIcon
//                                 variant="transparent"
//                                 title="Buka Halaman Merchandise"
//                                 onClick={() => window.open(`/merchandise/${slug}`, '_blank')}
//                             >
//                                 <Icon icon="proicons:open" className={`text-[24px]`} />
//                             </ActionIcon>
//                         </Flex>
//                         <Flex gap={8} align="center" mt={5}>
//                             <Text>
//                                 {formatRupiah(data?.price || 0)}
//                             </Text>
//                             <Divider orientation="vertical" mx={10} />
//                             <Icon icon="solar:star-bold" className={`text-yellow-500 text-[24px]`} />
//                             <Text>{parseFloat(data?.average_star || "0").toFixed(1)}</Text>
//                         </Flex>
//                         <Text size="sm" mt={10} c="gray">
//                             Total Terjual: {data?.total_sold || 0} unit
//                         </Text>
//                     </Stack>
//                 </Flex>

//                 <Accordion variant="separated" radius={10} defaultValue="1">
//                     <Accordion.Item value="1">
//                         <Accordion.Control>
//                             <Flex gap={10} align="center">
//                                 <Icon icon="akar-icons:statistic-up" className={`text-primary-base`} />
//                                 <Text>Statistik Merchandise</Text>
//                             </Flex>
//                         </Accordion.Control>
//                         <Accordion.Panel>
//                             <SimpleGrid cols={4}>
//                                 {statistics.map((statistic, index) => (
//                                     <Card key={index} radius={10} withBorder pos='relative' className={`hover:!bg-grey/10`}>
//                                         <Stack key={index} gap={0}>
//                                             <Text>{statistic.text}</Text>
//                                             {statistic.isCurrency ? (
//                                                 <Text fw={600} size="xl">
//                                                     {formatRupiah(statistic.value)}
//                                                 </Text>
//                                             ) : (
//                                                 <Text fw={600} size="xl">
//                                                     {formatNumber(statistic.value)}
//                                                 </Text>
//                                             )}
//                                             <Icon
//                                                 icon={statistic.icon}
//                                                 className={`absolute text-[5rem] -bottom-5 -right-2 text-primary-base/30`}
//                                             />
//                                         </Stack>
//                                     </Card>
//                                 ))}
//                             </SimpleGrid>
//                         </Accordion.Panel>
//                     </Accordion.Item>
//                 </Accordion>

//                 <Tabs defaultValue="transaction">
//                     <Tabs.List>
//                         <Tabs.Tab value="transaction" leftSection={<Icon icon="fluent:money-16-regular" />}>
//                             Transaksi ({filteredTransactions.length})
//                         </Tabs.Tab>
//                     </Tabs.List>

//                     <Tabs.Panel value="transaction">
//                         <Box mt={10}>
//                             <div>
//                                 <Text size="sm" c="gray" mb="md">
//                                     Menampilkan {filteredTransactions.length} transaksi
//                                 </Text>

//                                 {/* Tabel sederhana sementara */}
//                                 <Box style={{ overflowX: 'auto' }}>
//                                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                                         <thead>
//                                             <tr style={{ backgroundColor: '#f8f9fa' }}>
//                                                 {transactionColumns.map((col, idx) => (
//                                                     <th
//                                                         key={idx}
//                                                         style={{
//                                                             padding: '12px',
//                                                             textAlign: 'left',
//                                                             borderBottom: '1px solid #dee2e6',
//                                                             width: col.width ? `${col.width}px` : 'auto'
//                                                         }}
//                                                     >
//                                                         {col.title}
//                                                     </th>
//                                                 ))}
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {filteredTransactions.map((item, idx) => (
//                                                 <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
//                                                     {transactionColumns.map((col, colIdx) => (
//                                                         <td key={colIdx} style={{ padding: '12px' }}>
//                                                             {col.render ? col.render(item) : item[col.accessor]}
//                                                         </td>
//                                                     ))}
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </Box>

//                                 {filteredTransactions.length === 0 && (
//                                     <Text ta="center" c="gray" mt="xl">
//                                         Tidak ada data transaksi
//                                     </Text>
//                                 )}
//                             </div>
//                         </Box>
//                     </Tabs.Panel>
//                 </Tabs>
//             </Stack>
//         </Card>
//     )
// }

import TableData from "@/components/TableData";
import { Get } from "@/utils/REST";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
    Accordion,
    ActionIcon,
    AspectRatio,
    Box,
    Card,
    Divider,
    Flex,
    Image,
    SimpleGrid,
    Stack,
    Tabs,
    Text,
    Title,
    Badge,
    Select,
    TextInput,
    Group,
    Button,
    Tooltip,
    Modal,
    Anchor,
    Pagination,
    Checkbox
} from "@mantine/core";
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
import { useListState, useDisclosure } from "@mantine/hooks";
import moment from "moment";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileInvoice,
    faCopy,
    faTruck,
    faCheckCircle,
    faClock,
    faExclamationCircle,
    faBox,
    faStore,
    faMapMarkerAlt,
    faPhone,
    faEnvelope,
    faSearch,
    faCalendar,
    faTag,
    faWeightHanging,
    faRulerCombined,
    faMoneyBillWave,
    faHourglassHalf,
    faCircleCheck,
    faInfoCircle,
    faTimeline,
    faUser,
    faCreditCard,
    faEye,
    faPrint,
} from "@fortawesome/free-solid-svg-icons";

// Interface untuk data statistik
interface StatisticsData {
    text: string;
    value: number;
    icon: string;
    isCurrency?: boolean;
}

// Interface untuk data transaksi merchandise
interface MerchandiseTransactionData {
    id: number;
    invoice_no: string;
    product_name: string;
    sku: string;
    total_qty: number;
    total_price: number;
    transaction_status_id: number;
    voucher: string;
    creator_id: number;
    creator_name: string;
    detail: any[];
    order_date: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address?: any;
    status_name: string;
    payment_method: string;
    notes: string;
    product_id?: number;
    product_variant?: string;
    courier_service?: string;
    shipping_cost?: number;
    creator_address?: string;
    creator_phone?: string;
    // Untuk kompatibilitas dengan TableData
    [key: string]: any;
}

interface InvoiceDetailData {
    id: number;
    invoice_no: string;
    total_qty: number;
    total_price: number;
    delivery_price: number;
    grandtotal: number;
    admin_fee: number;
    payment_method: string;
    payment_status: string;
    created_at: string;
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
        product_id: number;
        qty: number;
        price: string;
        order_notes?: string;
        product: {
            id: number;
            product_name: string;
            sku?: string;
            creator?: {
                id: number;
                name: string;
            };
        };
        variant?: {
            id: number;
            varian_name?: string;
            name?: string;
            sku?: string;
        };
    }>;
    address?: {
        nama_penerima?: string;
        phone?: string;
        address_detail?: string;
        zipcode?: string | number;
    };
    manifest?: Array<{
        id: number;
        tracking_number: string;
        courier_name: string;
        status: string;
        created_at: string;
    }>;
    history?: Array<{
        id: number;
        status: string;
        note: string;
        created_at: string;
    }>;
    courier?: {
        courier_company: string;
        courier_type: string;
        tracking_number?: string;
        main?: string;
        type?: string;
    };
}

// Interface untuk varian produk
interface ProductVariant {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    image?: string;
    soldCount?: number;
}

// Interface untuk kolom TableData
interface TableColumn {
    accessor: string;
    title: string | React.ReactNode;
    width?: number;
    render?: (item: any, index?: number) => React.ReactNode;
}

// Interface untuk opsi cetak
interface PrintOptions {
    sensorNama: boolean;
    sensorTelepon: boolean;
    sensorAlamat: boolean;
    tampilkanHarga: boolean;
}

// Helper function untuk parse harga
const parsePrice = (price: any): number => {
    if (!price && price !== 0) return 0;
    if (typeof price === 'number') return price;

    const priceStr = String(price).trim();

    if (priceStr.includes('.') && !priceStr.includes(',')) {
        const parts = priceStr.split('.');
        if (parts.length === 2) {
            if (parts[1].length >= 6) {
                return parseFloat(parts[0]);
            } else {
                return parseFloat(priceStr);
            }
        }
    }

    if (priceStr.includes('.') && priceStr.match(/\./g)?.length === 1) {
        const withoutDots = priceStr.replace(/\./g, '');
        const parsed = parseFloat(withoutDots);
        return isNaN(parsed) ? 0 : parsed;
    }

    if (priceStr.includes(',')) {
        const withoutDots = priceStr.replace(/\./g, '');
        const withDotDecimal = withoutDots.replace(',', '.');
        const parsed = parseFloat(withDotDecimal);
        return isNaN(parsed) ? 0 : parsed;
    }

    const parsed = parseFloat(priceStr);
    return isNaN(parsed) ? 0 : parsed;
};

// Helper function untuk format rupiah
const formatRupiah = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parsePrice(value) : value;

    if (isNaN(numValue) || numValue === 0) {
        return "Rp 0";
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numValue);
};

// Helper function untuk format angka
const formatNumber = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue) || numValue === 0) {
        return "0";
    }

    return new Intl.NumberFormat('id-ID').format(numValue);
};

// Helper function untuk mendapatkan info status
const getStatusInfo = (statusId?: number) => {
    switch (statusId) {
        case 1:
            return {
                text: "Pending",
                color: "yellow",
                badgeColor: "yellow",
            };
        case 2:
            return {
                text: "Success",
                color: "green",
                badgeColor: "green",
            };
        case 3:
            return {
                text: "Failed",
                color: "red",
                badgeColor: "red",
            };
        case 4:
            return {
                text: "Expired",
                color: "gray",
                badgeColor: "gray",
            };
        default:
            return {
                text: "Unknown",
                color: "blue",
                badgeColor: "blue",
            };
    }
};

// Helper function untuk format payment method
const formatPaymentMethod = (method: string): string => {
    if (!method) return "-";

    const methodLower = method.toLowerCase();

    if (methodLower.includes('xendit')) {
        return 'QRIS';
    }

    if (methodLower.includes('bca')) return 'BCA';
    if (methodLower.includes('bri')) return 'BRI';
    if (methodLower.includes('mandiri')) return 'Mandiri';
    if (methodLower.includes('bni')) return 'BNI';
    if (methodLower.includes('permata')) return 'Permata';
    if (methodLower.includes('cimb')) return 'CIMB';
    if (methodLower.includes('danamon')) return 'Danamon';
    if (methodLower.includes('maybank')) return 'Maybank';
    if (methodLower.includes('qris')) return 'QRIS';
    if (methodLower.includes('gopay')) return 'GoPay';
    if (methodLower.includes('ovo')) return 'OVO';
    if (methodLower.includes('dana')) return 'DANA';
    if (methodLower.includes('linkaja')) return 'LinkAja';
    if (methodLower.includes('shopeepay')) return 'ShopeePay';

    return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
};

// Helper function untuk format nama kurir
const formatCourierName = (courier: any): string => {
    if (!courier) return "J&T";

    const courierStr = String(courier).toLowerCase();

    if (courierStr.includes('jne')) return "JNE";
    if (courierStr.includes('jnt') || courierStr.includes('jt')) return "J&T";
    if (courierStr.includes('sicepat')) return "SiCepat";
    if (courierStr.includes('pos')) return "POS Indonesia";
    if (courierStr.includes('tiki')) return "TIKI";
    if (courierStr.includes('wahana')) return "Wahana";
    if (courierStr.includes('ninja')) return "Ninja Xpress";
    if (courierStr.includes('anteraja')) return "AnterAja";

    return String(courier).toUpperCase();
};

// Helper function untuk format service kurir
const formatCourierService = (service: any): string => {
    if (!service) return "Reg";

    const serviceStr = String(service).toLowerCase();

    if (serviceStr.includes('reg')) return "Reg";
    if (serviceStr.includes('yes')) return "YES";
    if (serviceStr.includes('oke')) return "OKE";
    if (serviceStr.includes('express')) return "Express";
    if (serviceStr.includes('priority')) return "Priority";

    return String(service);
};

// Helper function untuk sensor nama
const maskName = (name: string, sensor: boolean): string => {
    if (!sensor || !name) return name || '-';
    if (name.length <= 2) return name.charAt(0) + '*';
    return name.charAt(0) + '*'.repeat(name.length - 1);
};

// Helper function untuk sensor telepon
const maskPhone = (phone: string, sensor: boolean): string => {
    if (!sensor || !phone) return phone || '-';
    if (phone.length <= 6) return phone.substring(0, 2) + '*'.repeat(phone.length - 2);
    return phone.substring(0, 4) + '*'.repeat(phone.length - 7) + phone.substring(phone.length - 3);
};

// Helper function untuk sensor alamat
const maskAddress = (address: string, city: string, province: string, zipcode: string, sensor: boolean): string => {
    if (!sensor) return address;
    const parts = [];
    if (city) parts.push(city);
    if (province) parts.push(province);
    if (zipcode) parts.push(zipcode);
    return parts.join(', ') || 'Alamat disembunyikan';
};

// Fungsi untuk generate QR code dengan pendekatan yang lebih kompatibel untuk PDF
const generateQRCodeHTML = (text: string): string => {
    // Gunakan text atau default
    const qrData = text || 'KLTRX-JLBVTZRYH';

    // Ukuran QR code (21x21 untuk versi kecil)
    const size = 21;

    // Buat seed berdasarkan data
    const seed = qrData.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Generate pattern QR code
    const generateQRPattern = (): boolean[][] => {
        const grid: boolean[][] = [];

        for (let i = 0; i < size; i++) {
            const row: boolean[] = [];
            for (let j = 0; j < size; j++) {
                // Finder patterns di 3 sudut
                if ((i < 7 && j < 7) || (i < 7 && j > size - 8) || (i > size - 8 && j < 7)) {
                    // Finder pattern yang benar
                    if (i === 0 || i === 6 || j === 0 || j === 6) {
                        row.push(true); // Border luar hitam
                    } else if (i === 1 || i === 5 || j === 1 || j === 5) {
                        row.push(false); // Border dalam putih
                    } else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) {
                        row.push(true); // Area dalam hitam
                    } else {
                        row.push(false);
                    }
                }
                // Alignment pattern
                else if (i > size - 9 && j > size - 9 && i < size - 2 && j < size - 2) {
                    if (i === size - 8 || i === size - 4 || j === size - 8 || j === size - 4) {
                        row.push(true);
                    } else if (i === size - 7 || i === size - 5 || j === size - 7 || j === size - 5) {
                        row.push(false);
                    } else if (i === size - 6 && j === size - 6) {
                        row.push(true);
                    } else {
                        row.push(false);
                    }
                }
                // Timing patterns
                else if (i === 6 && j > 7 && j < size - 8) {
                    row.push(j % 2 === 0);
                }
                else if (j === 6 && i > 7 && i < size - 8) {
                    row.push(i % 2 === 0);
                }
                // Data area
                else {
                    const charIndex = (i * j + seed) % qrData.length;
                    const charCode = qrData.charCodeAt(charIndex) || 0;
                    const val = (charCode + i + j + seed) % 3;
                    row.push(val === 0);
                }
            }
            grid.push(row);
        }

        return grid;
    };

    const grid = generateQRPattern();
    const cellSize = 10; // ukuran setiap sel dalam pixel

    // Buat SVG string
    let svg = `<svg width="${size * cellSize}" height="${size * cellSize}" viewBox="0 0 ${size * cellSize} ${size * cellSize}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="white"/>`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j]) {
                svg += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
            }
        }
    }

    svg += `</svg>`;

    return svg;
};

// Fungsi untuk generate HTML resi
const generateResiHTML = (invoice: any, options: PrintOptions): string => {
    // Debug: lihat struktur data
    console.log('Invoice data:', invoice);

    // Ekstrak data dengan aman (gunakan optional chaining dan default values)
    const courierCompany = invoice?.courier?.courier_company || invoice?.courier?.main || 'J&T';
    const courierType = invoice?.courier?.courier_type || invoice?.courier?.type || 'reg';

    // Gunakan tracking_number dari manifest jika ada, atau dari courier, atau invoice_no
    const trackingNumber = invoice?.courier?.tracking_number ||
        invoice?.manifest?.[0]?.tracking_number ||
        invoice?.invoice_no ||
        'KLTRX-XXXXXXXXX';

    const deliveryPrice = options.tampilkanHarga ? (parseFloat(invoice?.delivery_price) || 0) : 0;

    // Data pengirim - dari product.creator atau user
    const creatorData = invoice?.detail?.[0]?.product?.creator || {};
    const senderName = creatorData?.name || invoice?.user?.name || 'deelestari';
    const senderPhone = creatorData?.phone || invoice?.user?.phone || '081287206604';
    const senderAddress = creatorData?.address ||
        'Perumahan Diamond Valley blok A2 no 1, bedahan Sawangan, Jl. H. Sulaiman, Kec. Sawangan, Kota Depok, Jawa Barat (rumah paling pinggir A2/1 sebelum belokan), Sawangan, Depok, Jawa Barat';

    // Data penerima dari address object
    const receiverName = options.sensorNama
        ? maskName(invoice?.address?.nama_penerima || 'Customer', true)
        : (invoice?.address?.nama_penerima || 'Customer');

    const receiverPhone = options.sensorTelepon
        ? maskPhone(invoice?.address?.phone || '', true)
        : (invoice?.address?.phone || '');

    // Alamat penerima detail
    const receiverAddressDetail = invoice?.address?.address_detail || '';
    const receiverZipcode = invoice?.address?.zipcode?.toString() || '';

    // Gabungkan alamat lengkap (tanpa city dan province karena nilainya 0)
    const receiverFullAddress = options.sensorAlamat
        ? maskAddress(receiverAddressDetail, '', '', receiverZipcode, true)
        : `${receiverAddressDetail}${receiverZipcode ? ', ' + receiverZipcode : ''}`;

    // Generate QR code SVG
    const qrCodeSVG = generateQRCodeHTML(trackingNumber);

    // Format produk dengan informasi variant
    const productItems = invoice?.detail?.map((d: any) => {
        const productName = d?.product?.product_name || 'Produk';
        let variantInfo = '';

        // Ambil informasi variant dari detail.variant
        if (d?.variant) {
            if (typeof d.variant === 'object') {
                const variantName = d.variant.varian_name || d.variant.name || '';
                variantInfo = variantName ? ` (${variantName})` : '';
            } else if (typeof d.variant === 'string') {
                variantInfo = ` (${d.variant})`;
            }
        }

        return `${d?.qty || 1}x ${productName}${variantInfo}`;
    }).join(', ') || '1x Produk';

    const totalQty = invoice?.total_qty || 1;
    const referenceNumber = invoice?.invoice_no || '';
    const orderNotes = invoice?.detail?.find((d: any) => d?.order_notes)?.order_notes || '-';

    const courierName = formatCourierName(courierCompany);

    const getSlogan = (kurir: string) => {
        if (kurir === 'J&T') return 'EXPRESS ACROSS NATIONS';
        if (kurir === 'JNE') return 'CONNECTING HAPPINESS';
        if (kurir === 'SiCepat') return 'BEST COURIER';
        if (kurir === 'POS Indonesia') return 'MELAYANI DENGAN HATI';
        if (kurir === 'TIKI') return 'TIKI TURUT BERBAGI';
        if (kurir === 'Ninja Xpress') return 'NINJA EXPRESS';
        if (kurir === 'AnterAja') return 'ANTERAJA';
        return 'EXPRESS DELIVERY';
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resi Pengiriman - ${trackingNumber}</title>
            <style>
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    body {
                        background: white;
                        margin: 0;
                        padding: 0;
                    }
                    .resi-container {
                        box-shadow: none;
                        border: 2px solid #000 !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                    }
                }
                
                .resi-container {
                    max-width: 190mm; /* A4 width (~210mm) minus margins */
                    width: 100%;
                    margin: 20px auto;
                    background: white;
                    border: 2px solid #000;
                    padding: 25px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                }
                
                .header h1 {
                    font-size: 42px;
                    font-weight: 800;
                    margin: 0;
                    color: #000;
                    letter-spacing: 3px;
                }
                
                .header .subtitle {
                    font-size: 16px;
                    color: #000;
                    margin-top: 5px;
                    font-weight: 500;
                }
                
                .powered-by {
                    text-align: center;
                    margin: 15px 0;
                    font-size: 16px;
                    color: #000;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .tracking-number {
                    text-align: center;
                    font-size: 22px;
                    font-weight: bold;
                    margin: 20px 0;
                    padding: 15px;
                    border: 3px solid #000;
                    background-color: #f0f0f0;
                    letter-spacing: 1px;
                }
                
                .qr-container {
                    display: flex;
                    justify-content: center;
                    margin: 25px 0;
                }
                
                .qr-code {
                    width: 210px;
                    height: 210px;
                    background-color: white;
                    border: 3px solid #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 5px;
                }
                
                .qr-code svg {
                    width: 100%;
                    height: 100%;
                    display: block;
                }
                
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 15px 0;
                    padding: 12px 0;
                    border-bottom: 2px solid #000;
                    font-size: 16px;
                }
                
                .reference {
                    margin: 20px 0;
                    padding: 15px;
                    border: 3px solid #000;
                    background-color: #f0f0f0;
                }
                
                .reference-label {
                    font-weight: bold;
                    margin-right: 10px;
                    display: block;
                    margin-bottom: 8px;
                    font-size: 16px;
                }
                
                .reference-value {
                    font-family: monospace;
                    font-size: 18px;
                    word-break: break-all;
                    font-weight: 500;
                }
                
                .address-section {
                    margin: 20px 0;
                    border: 3px solid #000;
                }
                
                .address-box {
                    padding: 15px;
                    border-bottom: 3px solid #000;
                }
                
                .address-box:last-child {
                    border-bottom: none;
                }
                
                .address-label {
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-size: 16px;
                    text-decoration: underline;
                }
                
                .address-name {
                    font-weight: bold;
                    margin: 5px 0;
                    font-size: 18px;
                }
                
                .address-phone {
                    color: #000;
                    margin: 5px 0 10px 0;
                    font-size: 16px;
                }
                
                .address-detail {
                    line-height: 1.6;
                    margin: 5px 0 0 0;
                    padding: 0;
                    font-size: 15px;
                }
                
                .product-info {
                    margin: 20px 0;
                    padding: 15px;
                    border: 3px solid #000;
                    background-color: #f9f9f9;
                }
                
                .product-label {
                    font-weight: bold;
                    margin-bottom: 10px;
                    display: block;
                    text-decoration: underline;
                    font-size: 16px;
                }
                
                .product-detail {
                    font-size: 16px;
                    line-height: 1.6;
                }
                
                .notes {
                    margin: 20px 0;
                    padding: 15px;
                    border: 3px solid #000;
                    background-color: #f9f9f9;
                    font-style: italic;
                    font-size: 15px;
                }
                
                .footer {
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 3px solid #000;
                    text-align: center;
                    font-size: 14px;
                    color: #000;
                }
                
                .dashed-line {
                    border-bottom: 2px dashed #000;
                    margin: 15px 0;
                }
            </style>
        </head>
        <body>
            <div class="resi-container">
                <div class="header">
                    <h1>${courierName}</h1>
                    <div class="subtitle">${getSlogan(courierName)}</div>
                </div>
                
                <div class="powered-by">Powered by Kolektix.com</div>
                
                <div class="tracking-number">
                    Nomor Resi - ${trackingNumber}
                </div>
                
                <div class="qr-container">
                    <div class="qr-code">
                        ${qrCodeSVG}
                    </div>
                </div>
                
                <div class="info-row">
                    <span><strong>Ongkos Kirim:</strong> ${options.tampilkanHarga ? `Rp ${deliveryPrice.toLocaleString('id-ID')}` : '***'}</span>
                    <span><strong>Layanan:</strong> ${courierType}</span>
                </div>
                
                <div class="reference">
                    <span class="reference-label">Reference Number</span>
                    <div class="reference-value">${referenceNumber}</div>
                </div>
                
                <div class="address-section">
                    <!-- Alamat Penerima -->
                    <div class="address-box">
                        <div class="address-label">ALAMAT PENERIMA:</div>
                        <div class="address-name">${receiverName}</div>
                        <div class="address-phone">${receiverPhone}</div>
                        <div class="address-detail">${receiverFullAddress}</div>
                    </div>
                    
                    <!-- Alamat Pengirim -->
                    <div class="address-box">
                        <div class="address-label">ALAMAT PENGIRIM:</div>
                        <div class="address-name">${senderName}</div>
                        <div class="address-phone">${senderPhone}</div>
                        <div class="address-detail">${senderAddress}</div>
                    </div>
                </div>
                
                <div class="product-info">
                    <span class="product-label">Jenis Barang:</span>
                    <div class="product-detail">
                        ${productItems}<br>
                        <strong>Total Item:</strong> ${totalQty} pcs
                    </div>
                </div>
                
                <div class="notes">
                    <em>Catatan: ${orderNotes}</em>
                </div>
                
                <div class="footer">
                    Pengiriman melalui ${courierName}<br>
                    kolektix.com - Solusi Marketplace Terintegrasi
                </div>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `;
};

export default function MerchDetail() {
    const [data, setData] = useState<any>();
    const [imageList, setImageList] = useState<any[]>([]);
    const [loading, setLoading] = useListState<string>();
    const [statistics, setStatistics] = useState<StatisticsData[]>([
        {
            text: 'Total Terjual',
            value: 0,
            icon: 'akar-icons:shopping-bag',
        },
        {
            text: 'Total Pendapatan',
            value: 0,
            icon: 'akar-icons:money',
            isCurrency: true,
        },
    ]);
    const [transactions, setTransactions] = useState<MerchandiseTransactionData[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<MerchandiseTransactionData[]>([]);
    const [allTransactions, setAllTransactions] = useState<MerchandiseTransactionData[]>([]);
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<string | null>('all');
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [variantSoldCounts, setVariantSoldCounts] = useState<{ [key: string]: number }>({});

    // State untuk Detail Modal (View Detail Invoice)
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
    const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<MerchandiseTransactionData | null>(null);
    const [invoiceDetail, setInvoiceDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // State untuk cetak resi
    const [showPrintOptions, setShowPrintOptions] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [selectedInvoice, setSelectedInvoice] = useState('');
    const [printError, setPrintError] = useState<string | null>(null);

    // State untuk opsi cetak
    const [sensorNama, setSensorNama] = useState(true);
    const [sensorTelepon, setSensorTelepon] = useState(true);
    const [sensorAlamat, setSensorAlamat] = useState(false);
    const [tampilkanHarga, setTampilkanHarga] = useState(true);

    // State untuk QR Code Modal
    const [qrOpened, { open: openQr, close: closeQr }] = useDisclosure(false);

    // State untuk Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedTransactions, setPaginatedTransactions] = useState<MerchandiseTransactionData[]>([]);

    const router = useRouter();
    const { slug } = router.query;

    // State untuk search dan filter
    const [searchValue, setSearchValue] = useState('');
    const [filterBy, setFilterBy] = useState<string | null>('all');
    const [sortBy, setSortBy] = useState<string | null>('newest');

    // State untuk Table Header Sort
    const [tableSortField, setTableSortField] = useState<string | null>(null);
    const [tableSortDir, setTableSortDir] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (slug) {
            getData();
        }
    }, [slug]);

    // Effect untuk update pagination ketika filteredTransactions berubah
    useEffect(() => {
        updatePagination();
    }, [filteredTransactions, currentPage, itemsPerPage]);

    const updatePagination = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedTransactions(filteredTransactions.slice(startIndex, endIndex));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string | null) => {
        if (value) {
            setItemsPerPage(parseInt(value));
            setCurrentPage(1); // Reset ke halaman pertama
        }
    };

    const getData = () => {
        if (slug) {
            setLoading.append('getdata');
            Get(`product/${slug}`, {})
                .then((res: any) => {
                    if (res.data) {
                        const productData = res.data;
                        setData(productData);
                        setImageList(productData.product_image || []);

                        // Ambil variants dari produk (untuk keperluan lain, bukan untuk filter)
                        const variants: ProductVariant[] = [];
                        if (productData.variants && Array.isArray(productData.variants)) {
                            productData.variants.forEach((v: any) => {
                                variants.push({
                                    id: v.id,
                                    name: v.variant_name || v.name || '-',
                                    sku: v.sku || '-',
                                    price: parsePrice(v.price || 0),
                                    stock: v.stock || 0,
                                    image: v.image_url
                                });
                            });
                        }

                        setStatistics(prev => prev.map(stat => {
                            return stat;
                        }));

                        getStatisticsData(productData.id);
                    }
                    setLoading.filter((e) => e != 'getdata');
                })
                .catch((err) => {
                    console.log(err);
                    setLoading.filter((e) => e != 'getdata');
                });
        }
    };

    const getStatisticsData = async (productId: number) => {
        try {
            const res: any = await Get("order-bycreator", {});

            const filteredData = res?.data || [];
            const transactionsData: MerchandiseTransactionData[] = [];
            const allTransactionsData: MerchandiseTransactionData[] = [];

            // Set untuk menyimpan varian unik dari transaksi
            const uniqueVariants = new Set<string>();

            let totalQty = 0;
            let totalRevenue = 0;
            const variantCounts: { [key: string]: number } = {};

            filteredData.forEach((item: any) => {
                let hasProduct = false;
                const productNames: string[] = [];
                let productQty = 0;
                let productPrice = 0;
                let productSku = "";
                let productVariant = "";

                if (Array.isArray(item.detail)) {
                    item.detail.forEach((detail: any) => {
                        const detailProductId = detail.product_id || detail.product?.id;

                        if (detailProductId === productId) {
                            hasProduct = true;

                            if (detail?.product?.product_name) {
                                productNames.push(detail.product.product_name);
                                productSku = detail.product.sku || "";

                                // Ambil variant dari detail.variant
                                if (detail.variant) {
                                    if (typeof detail.variant === 'object') {
                                        productVariant = detail.variant.varian_name || detail.variant.name || '';
                                    } else if (typeof detail.variant === 'string') {
                                        productVariant = detail.variant;
                                    }
                                }

                                // Fallback ke variant_name jika ada
                                if (!productVariant && detail.variant_name) {
                                    productVariant = detail.variant_name;
                                }

                                // Tambahkan ke set varian unik jika ada
                                if (productVariant && productVariant !== '-') {
                                    uniqueVariants.add(productVariant);
                                }
                            } else if (detail?.product_name) {
                                productNames.push(detail.product_name);
                            }

                            const qty = detail.quantity || detail.qty || 0;
                            productQty += qty;

                            const price = parsePrice(detail.price_total || detail.price || detail.total_price || 0);
                            productPrice += price;
                        }
                    });
                } else {
                    const rootProductId = item.product_id || item.product?.id;

                    if (rootProductId === productId) {
                        hasProduct = true;
                        productNames.push(item.product?.product_name || item.product_name || "-");

                        const qty = item.total_qty || item.qty || 0;
                        productQty = qty;

                        const price = parsePrice(item.total_price || item.price || item.price_total || 0);
                        productPrice = price;

                        if (item.variant_name || item.variant) {
                            productVariant = item.variant_name || item.variant;
                            if (productVariant && productVariant !== '-') {
                                uniqueVariants.add(productVariant);
                            }
                        }
                    }
                }

                if (hasProduct) {
                    const statusInfo = getStatusInfo(item.transaction_status_id);

                    const transaction: MerchandiseTransactionData = {
                        id: item.id || 0,
                        invoice_no: item.invoice_no || "-",
                        product_name: productNames.join(" | ") || "-",
                        sku: productSku || item.detail?.[0]?.product?.sku || "-",
                        total_qty: productQty,
                        total_price: productPrice,
                        transaction_status_id: item.transaction_status_id || 0,
                        voucher: item.voucher || "-",
                        creator_id: item.creator_id || item.creator?.id || 0,
                        creator_name: item.creator?.name || "Creator",
                        creator_address: item.creator?.address || "",
                        creator_phone: item.creator?.phone || "",
                        detail: item.detail || [],
                        order_date: item.created_at || "-",
                        customer_name: item.address?.nama_penerima || item.customer_name || "-",
                        customer_email: item.customer_email || "-",
                        customer_phone: item.address?.phone || item.customer_phone || item.phone || "-",
                        shipping_address: item.shipping_address || "-",
                        status_name: statusInfo.text,
                        payment_method: item.payment_method || "-",
                        notes: item.notes || "-",
                        product_id: productId,
                        product_variant: productVariant || '-',
                        courier: item.courier || item.shipping_courier,
                        courier_service: item.courier_service || item.shipping_service,
                        shipping_cost: item.shipping_cost || item.ongkos_kirim,
                    };

                    allTransactionsData.push(transaction);

                    if (item.transaction_status_id === 2) {
                        totalQty += productQty;
                        totalRevenue += productPrice;
                        transactionsData.push(transaction);

                        // Update variant counts
                        if (productVariant && productVariant !== '-') {
                            variantCounts[productVariant] = (variantCounts[productVariant] || 0) + productQty;
                        }
                    }
                }
            });

            setVariantSoldCounts(variantCounts);

            setStatistics(prev => prev.map(stat => {
                if (stat.text === 'Total Terjual') {
                    return { ...stat, value: totalQty };
                }
                if (stat.text === 'Total Pendapatan') {
                    return { ...stat, value: totalRevenue };
                }
                return stat;
            }));

            setTransactions(transactionsData);
            setAllTransactions(allTransactionsData);

            // Update productVariants dengan varian dari transaksi
            const variantList = Array.from(uniqueVariants)
                .filter(v => v && v !== '-')
                .sort((a, b) => a.localeCompare(b));

            setProductVariants(variantList.map(name => ({
                id: 0,
                name: name,
                sku: '',
                price: 0,
                stock: 0,
                soldCount: variantCounts[name] || 0
            })));

            applyFilters(searchValue, filterBy, sortBy, selectedVariant, tableSortField, tableSortDir, transactionsData);
            setCurrentPage(1);

        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    const applyFilters = (
        search: string,
        filter: string | null,
        sort: string | null,
        variant: string | null,
        tSortField: string | null = tableSortField,
        tSortDir: 'asc' | 'desc' = tableSortDir,
        transactionList: MerchandiseTransactionData[] = transactions
    ) => {
        let result = [...transactionList];

        // Reset selection when filtering
        setSelectedInvoiceIds([]);

        if (filter && filter !== 'all') {
            if (filter === 'success') {
                result = result.filter(item => item.transaction_status_id === 2);
            } else if (filter === 'pending') {
                result = result.filter(item => item.transaction_status_id === 1);
            } else if (filter === 'failed') {
                result = result.filter(item => item.transaction_status_id === 3);
            }
        }

        if (variant && variant !== 'all') {
            result = result.filter(item => item.product_variant === variant);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(item =>
                (item.invoice_no || '').toLowerCase().includes(searchLower) ||
                (item.customer_name || '').toLowerCase().includes(searchLower) ||
                (item.product_name || '').toLowerCase().includes(searchLower) ||
                (item.product_variant || '').toLowerCase().includes(searchLower)
            );
        }

        if (sort) {
            if (sort === 'newest') {
                result.sort((a, b) => moment(b.order_date).valueOf() - moment(a.order_date).valueOf());
            } else if (sort === 'oldest') {
                result.sort((a, b) => moment(a.order_date).valueOf() - moment(b.order_date).valueOf());
            } else if (sort === 'highest') {
                result.sort((a, b) => b.total_price - a.total_price);
            } else if (sort === 'lowest') {
                result.sort((a, b) => a.total_price - b.total_price);
            }
        }

        if (tSortField) {
            result.sort((a: any, b: any) => {
                let aVal = a[tSortField];
                let bVal = b[tSortField];
                if (tSortField === 'order_date') {
                    aVal = moment(a.order_date).valueOf();
                    bVal = moment(b.order_date).valueOf();
                } else if (tSortField === 'total_qty' || tSortField === 'total_price' || tSortField === 'transaction_status_id') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                } else {
                    aVal = String(aVal || '').toLowerCase();
                    bVal = String(bVal || '').toLowerCase();
                }

                if (aVal < bVal) return tSortDir === 'asc' ? -1 : 1;
                if (aVal > bVal) return tSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredTransactions(result);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        applyFilters(value, filterBy, sortBy, selectedVariant, tableSortField, tableSortDir, transactions);
        setCurrentPage(1); // Reset ke halaman pertama
    };

    const handleFilterChange = (value: string | null) => {
        setFilterBy(value);
        applyFilters(searchValue, value, sortBy, selectedVariant, tableSortField, tableSortDir, transactions);
        setCurrentPage(1); // Reset ke halaman pertama
    };

    const handleSortChange = (value: string | null) => {
        setSortBy(value);
        applyFilters(searchValue, filterBy, value, selectedVariant, tableSortField, tableSortDir, transactions);
        setCurrentPage(1); // Reset ke halaman pertama
    };

    const handleVariantChange = (value: string | null) => {
        setSelectedVariant(value);
        applyFilters(searchValue, filterBy, sortBy, value, tableSortField, tableSortDir, transactions);
        setCurrentPage(1); // Reset ke halaman pertama
    };

    const handleTableSort = (field: string) => {
        const isAsc = tableSortField === field && tableSortDir === 'asc';
        const nextDir = isAsc ? 'desc' : 'asc';
        setTableSortField(field);
        setTableSortDir(nextDir);
        applyFilters(searchValue, filterBy, sortBy, selectedVariant, field, nextDir, transactions);
        setCurrentPage(1);
    };

    const getInvoiceDetail = async (invoiceNo: string) => {
        setLoadingDetail(true);
        setDetailError(null);
        try {
            const res: any = await Get(`order-product-invoice/${invoiceNo}`, {});
            if (res?.data) {
                setInvoiceDetail(res.data);
            } else {
                setDetailError("Gagal mengambil rincian invoice.");
            }
        } catch (err) {
            console.error("Error fetching invoice detail:", err);
            setDetailError("Terjadi kesalahan saat mengambil rincian invoice.");
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleViewInvoiceDetail = async (item: MerchandiseTransactionData) => {
        setSelectedInvoiceDetail(item);
        openDetail();
        setInvoiceDetail(null);
        setDetailError(null);
        if (item.invoice_no && item.invoice_no !== "-") {
            await getInvoiceDetail(item.invoice_no);
        }
    };

    const getVariantName = (variant: any) => {
        if (!variant) return '';
        if (typeof variant === 'string') return '';
        return variant.varian_name || variant.name || '';
    };

    const getVariantValue = (variant: any) => {
        if (!variant) return '';
        if (typeof variant === 'string') return variant;
        return variant.varian_value || variant.value || '';
    };

    const formatVariantDisplay = (variant: any) => {
        if (!variant) return "-";
        if (typeof variant === 'string') return variant;
        const name = getVariantName(variant);
        const value = getVariantValue(variant);
        if (name && value) return `${name}: ${value}`;
        return name || value || "-";
    };

    const getTrackingNumber = () => {
        if (!invoiceDetail) return '-';
        return invoiceDetail.courier?.tracking_number ||
            invoiceDetail.manifest?.[0]?.tracking_number ||
            invoiceDetail.invoice_no ||
            '-';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatDateDetail = (dateString?: string) => {
        if (!dateString || dateString === "-") return "-";
        try {
            return moment(dateString).format('DD MMM YYYY, HH:mm');
        } catch (e) {
            return dateString;
        }
    };

    const formatPaymentMethodDetail = (method?: string) => {
        if (!method) return "-";
        if (method.toLowerCase().includes("cash")) return "CASH";
        if (method.toLowerCase().includes("transfer")) return "TRANSFER";
        return method.toUpperCase();
    };

    // Fungsi untuk mengambil data invoice saat icon cetak diklik
    const handlePrintClick = async (invoiceNo: string) => {
        setPrintLoading(true);
        setSelectedInvoice(invoiceNo);
        setPrintError(null);

        // Buat loading toast
        const loadingToast = document.createElement('div');
        loadingToast.style.position = 'fixed';
        loadingToast.style.top = '20px';
        loadingToast.style.right = '20px';
        loadingToast.style.backgroundColor = '#333';
        loadingToast.style.color = 'white';
        loadingToast.style.padding = '10px 20px';
        loadingToast.style.borderRadius = '5px';
        loadingToast.style.zIndex = '9999';
        loadingToast.innerText = 'Mengambil data invoice...';
        document.body.appendChild(loadingToast);

        try {
            console.log('Fetching invoice:', invoiceNo);

            // Panggil API
            const response: any = await Get(`order-product-invoice/${invoiceNo}`, {});
            console.log('Full API Response:', response);

            // Periksa struktur response
            if (!response) {
                throw new Error('Response is empty');
            }

            // Coba akses data dari berbagai kemungkinan struktur
            let result = null;

            // Jika response langsung berisi data
            if (response.data) {
                result = response.data;
            }
            // Jika response adalah objek dengan status
            else if (response.status !== undefined) {
                result = response;
            }
            // Jika response adalah array
            else if (Array.isArray(response)) {
                result = { status: true, data: response };
            }
            // Jika response adalah data langsung
            else {
                result = { status: true, data: response };
            }

            console.log('Processed result:', result);

            // Hapus loading toast
            if (document.body.contains(loadingToast)) {
                document.body.removeChild(loadingToast);
            }

            // Cek status
            if (!result || result.status === false) {
                throw new Error(result?.message || 'Gagal mengambil data invoice');
            }

            // Ambil data invoice
            const invoiceData = result.data || result;

            if (!invoiceData) {
                throw new Error('Data invoice kosong');
            }

            console.log('Invoice data received:', invoiceData);

            // Simpan data invoice dan tampilkan modal opsi
            setInvoiceData(invoiceData);
            setShowPrintOptions(true);
            setPrintLoading(false);

        } catch (error: any) {
            console.error('Error fetching invoice:', error);

            // Hapus loading toast
            if (document.body.contains(loadingToast)) {
                document.body.removeChild(loadingToast);
            }
            setPrintError(error.message || 'Gagal mengambil data invoice');
            setPrintLoading(false);

            // Tampilkan alert error dengan detail
            alert(`Gagal mengambil data invoice: ${error.message || 'Unknown error'}\n\nCek console untuk detail lebih lanjut.`);
        }
    };

    const toggleSelectAll = () => {
        if (selectedInvoiceIds.length === paginatedTransactions.length) {
            setSelectedInvoiceIds([]);
        } else {
            setSelectedInvoiceIds(paginatedTransactions.map(t => t.invoice_no));
        }
    };

    const toggleSelectInvoice = (invoiceNo: string) => {
        setSelectedInvoiceIds(prev =>
            prev.includes(invoiceNo)
                ? prev.filter(id => id !== invoiceNo)
                : [...prev, invoiceNo]
        );
    };

    const handleBulkPrint = () => {
        if (selectedInvoiceIds.length === 0) return;
        alert(`Mencetak ${selectedInvoiceIds.length} resi...`);
    };

    // Fungsi untuk mencetak resi dengan opsi yang dipilih
    const handlePrintWithOptions = () => {
        if (!invoiceData) {
            alert('Data invoice tidak tersedia');
            return;
        }

        try {
            console.log('Generating receipt with options:', {
                sensorNama,
                sensorTelepon,
                sensorAlamat,
                tampilkanHarga
            });

            // Generate HTML resi
            const options: PrintOptions = {
                sensorNama,
                sensorTelepon,
                sensorAlamat,
                tampilkanHarga
            };

            const resiHTML = generateResiHTML(invoiceData, options);

            // Buka window baru untuk print
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(resiHTML);
                printWindow.document.close();
            } else {
                alert('Popup blocker mungkin menghalangi pembukaan jendela cetak. Silakan izinkan popup untuk situs ini.');
            }

            // Tutup modal
            setShowPrintOptions(false);
            setInvoiceData(null);

        } catch (error: any) {
            console.error('Error generating receipt:', error);
            alert(`Gagal membuat resi: ${error.message || 'Unknown error'}`);
        }
    };

    const downloadQRCode = () => {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        const isProduction = host.includes('kolektix.com') && !host.includes('festaging');
        const domain = isProduction ? 'kolektix.com' : 'kolektix.my.id';
        const finalProductUrl = `https://${domain}/merchandise/${slug}`;

        const link = document.createElement('a');
        link.href = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(finalProductUrl)}`;
        link.download = `qr-${data?.product_name || 'product'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const transactionColumns: TableColumn[] = [
        {
            accessor: 'no',
            title: 'No',
            width: 50,
            render: (item: any, index?: number) => {
                const rowIndex = index !== undefined
                    ? (currentPage - 1) * itemsPerPage + index + 1
                    : 0;
                return (
                    <Text ta="center" fw={500}>{rowIndex}</Text>
                );
            }
        },
        {
            accessor: 'invoice_no',
            title: 'Invoice No',
            width: 150,
            render: (item: any) => (
                <Text ta="center" size="sm">{String(item.invoice_no || '-')}</Text>
            )
        },
        {
            accessor: 'order_date',
            title: 'Tanggal',
            width: 110,
            render: (item: any) => (
                <Text ta="center" size="sm">{item.order_date ? moment(item.order_date).format('DD/MM/YY') : '-'}</Text>
            )
        },
        {
            accessor: 'customer_name',
            title: 'Customer',
            width: 140,
            render: (item: any) => (
                <Text ta="center" size="sm" truncate>{String(item.customer_name || '-')}</Text>
            )
        },
        {
            accessor: 'product_variant',
            title: 'Varian',
            width: 100,
            render: (item: any) => {
                const variant = item.product_variant;
                if (!variant || variant === '-') return <Text ta="center" size="sm" c="dimmed">-</Text>;
                return <Text ta="center" size="sm">{String(variant)}</Text>;
            }
        },
        {
            accessor: 'total_qty',
            title: 'Qty',
            width: 60,
            render: (item: any) => (
                <Text ta="center" size="sm">{Number(item.total_qty) || 0}</Text>
            )
        },
        {
            accessor: 'total_price',
            title: 'Total',
            width: 120,
            render: (item: any) => (
                <Text ta="center" size="sm" fw={500}>{formatRupiah(item.total_price)}</Text>
            )
        },
        {
            accessor: 'status_name',
            title: 'Status Pembayaran',
            width: 130,
            render: (item: any) => {
                const statusInfo = getStatusInfo(item.transaction_status_id);
                return (
                    <Flex justify="center" w="100%">
                        <Badge variant="filled" color={statusInfo.badgeColor} size="md" style={{ fontWeight: 600, width: '100%', minWidth: 'max-content' }}>
                            {statusInfo.text}
                        </Badge>
                    </Flex>
                );
            }
        },
        {
            accessor: 'shipping_status',
            title: 'Status Pengiriman',
            width: 140,
            render: (item: any) => (
                    <Flex justify="center" w="100%">
                        <Badge color="gray" variant="filled" size="md" style={{ fontWeight: 600, width: '100%', minWidth: 'max-content' }}>
                            Siap Dikirim
                        </Badge>
                    </Flex>
            )
        },
        {
            accessor: 'payment_method',
            title: 'Metode Pembayaran',
            width: 140,
            render: (item: any) => (
                <Text ta="center" size="sm">{String(formatPaymentMethod(item.payment_method) || '-')}</Text>
            )
        },
        {
            accessor: 'actions',
            title: 'Aksi',
            width: 140,
            render: (item: any) => (
                <Flex justify="center" align="center" gap="xs">
                    <Tooltip label="Detail Invoice">
                        <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleViewInvoiceDetail(item)}
                            title="Lihat Detail"
                            size="md"
                            radius="md"
                        >
                            <Icon icon="solar:eye-bold" width={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Checkbox
                        checked={selectedInvoiceIds.includes(item.invoice_no)}
                        onChange={() => toggleSelectInvoice(item.invoice_no)}
                        size="xs"
                    />
                    <Tooltip label="Cetak Resi">
                        <ActionIcon
                            variant="filled"
                            color="blue"
                            onClick={() => handlePrintClick(item.invoice_no)}
                            title="Cetak Resi"
                            size="md"
                            radius="md"
                            loading={printLoading && selectedInvoice === item.invoice_no}
                        >
                            <Icon icon="solar:printer-bold" width={16} />
                        </ActionIcon>
                    </Tooltip>
                </Flex>
            )
        },
    ];

    const getValueByAccessor = (item: MerchandiseTransactionData, accessor: string): any => {
        switch (accessor) {
            case 'invoice_no':
                return item.invoice_no;
            case 'order_date':
                return item.order_date;
            case 'customer_name':
                return item.customer_name;
            case 'product_variant':
                const variant = item.product_variant;
                if (!variant || variant === '-') return '-';
                return variant;
            case 'total_qty':
                return item.total_qty;
            case 'total_price':
                return item.total_price;
            case 'status_name':
                return item.status_name;
            case 'payment_method':
                return item.payment_method;
            default:
                return (item as any)[accessor] || '-';
        }
    };

    const productPrice = data ? parsePrice(data.price) : 0;
    const maxTableHeight = 400;
    
    // Logic for storefront URL based on environment
    const getStorefrontUrl = () => {
        if (typeof window === 'undefined') return '';
        const host = window.location.hostname;
        // Check if it's production dashboard or production main site
        const isProduction = host.includes('kolektix.com') && !host.includes('festaging');
        const domain = isProduction ? 'kolektix.com' : 'kolektix.my.id';
        return `https://${domain}/merchandise/${slug}`;
    };
    const productUrl = getStorefrontUrl();

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startItem = filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredTransactions.length);

    return (
        <>
            {/* Modal QR Code Produk */}
            <Modal opened={qrOpened} onClose={closeQr} title="QR Code Produk" centered size="md">
                <Stack align="center" gap="md">
                    <Image
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productUrl)}`}
                        alt={`QR Code untuk ${data?.product_name || 'produk'}`}
                        width={250}
                        height={250}
                        style={{ objectFit: 'contain' }}
                    />
                    <Text size="sm" ta="center">
                        Scan QR code untuk melihat halaman merchandise
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">
                        Link: <Anchor href={productUrl} target="_blank" size="xs">{productUrl}</Anchor>
                    </Text>
                    <Group grow w="100%">
                        <Button
                            onClick={downloadQRCode}
                            leftSection={<Icon icon="solar:download-bold" width={18} />}
                        >
                            Download QR Code
                        </Button>
                        <Button
                            variant="light"
                            onClick={() => window.open(productUrl, '_blank')}
                            leftSection={<Icon icon="proicons:open" width={18} />}
                        >
                            Buka Halaman
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Modal Opsi Cetak Resi */}
            <Modal opened={showPrintOptions} onClose={() => {
                setShowPrintOptions(false);
                setInvoiceData(null);
            }} title="Opsi Cetak Resi" centered size="sm">
                <Stack>
                    <Text size="sm">Pilih opsi untuk resi - {selectedInvoice}</Text>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="sensorNama"
                            checked={sensorNama}
                            onChange={(e) => setSensorNama(e.target.checked)}
                        />
                        <label htmlFor="sensorNama">Sensor Nama Penerima</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="sensorTelepon"
                            checked={sensorTelepon}
                            onChange={(e) => setSensorTelepon(e.target.checked)}
                        />
                        <label htmlFor="sensorTelepon">Sensor Nomor Telepon</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="sensorAlamat"
                            checked={sensorAlamat}
                            onChange={(e) => setSensorAlamat(e.target.checked)}
                        />
                        <label htmlFor="sensorAlamat">Sensor Alamat (hanya kota)</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="tampilkanHarga"
                            checked={tampilkanHarga}
                            onChange={(e) => setTampilkanHarga(e.target.checked)}
                        />
                        <label htmlFor="tampilkanHarga">Tampilkan Harga</label>
                    </div>

                    {printError && (
                        <Text color="red" size="sm">{printError}</Text>
                    )}

                    <Group grow mt="md">
                        <Button variant="light" onClick={() => {
                            setShowPrintOptions(false);
                            setInvoiceData(null);
                        }}>Batal</Button>
                        <Button onClick={handlePrintWithOptions}>Cetak Resi</Button>
                    </Group>
                </Stack>
            </Modal>

            <Card p={30}>
                <Stack gap={30}>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={30}>
                        {/* Header Produk */}
                        <Flex gap={30} align="start">
                            <AspectRatio ratio={1} maw={180} w="100%">
                                <Image
                                    radius={10}
                                    src={imageList?.[0]?.image_url}
                                    bg="gray.1"
                                    alt={data?.product_name || 'produk'}
                                />
                            </AspectRatio>

                            <Stack gap={0} flex={1}>
                                <Text size="xs" c="gray" mb={5}>
                                    Dibuat pada {data?.created_at ? moment(data.created_at).format('DD MMMM YYYY') : '-'}
                                </Text>
                                <Flex gap={10} align="center">
                                    <Title size="h2" style={{ fontSize: '24px' }}>{data?.product_name || '-'}</Title>
                                    <Tooltip label="Tampilkan QR Code">
                                        <ActionIcon
                                            variant="transparent"
                                            onClick={openQr}
                                            size="lg"
                                        >
                                            <Icon icon="solar:qr-code-bold" className="text-[24px]" />
                                        </ActionIcon>
                                    </Tooltip>
                                </Flex>
                                <Flex gap={8} align="center" mt={5}>
                                    <Text fw={600} size="lg">
                                        {formatRupiah(productPrice)}
                                    </Text>
                                    <Divider orientation="vertical" mx={10} />
                                    <Icon icon="solar:star-bold" className="text-yellow-500 text-[20px]" />
                                    <Text fw={500}>{data?.average_star ? parseFloat(data.average_star).toFixed(1) : '0.0'}</Text>
                                </Flex>
                                <Stack gap={4} mt={15}>
                                    <Text size="sm" fw={600} c="gray.7">
                                        Total Terjual: {data?.total_sold || 0} unit
                                    </Text>
                                    <Text size="xs" fw={500} c="dimmed">
                                        Varian Terjual:
                                    </Text>
                                    <Group gap={8}>
                                        {productVariants.length > 0 ? (
                                            productVariants.map((v, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="light"
                                                    color="gray"
                                                    size="sm"
                                                    styles={{ label: { textTransform: 'none' } }}
                                                >
                                                    {v.name}: {v.soldCount}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Text size="xs" c="dimmed italic">Belum ada varian terjual</Text>
                                        )}
                                    </Group>
                                </Stack>
                            </Stack>
                        </Flex>

                        {/* Accordion Statistik */}
                        <Accordion variant="separated" radius={10} defaultValue="statistik">
                            <Accordion.Item value="statistik">
                                <Accordion.Control>
                                    <Flex gap={10} align="center">
                                        <Icon icon="solar:chart-square-bold" className="text-primary-base" width={20} />
                                        <Text fw={600}>Statistik Merchandise</Text>
                                    </Flex>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={2} spacing="md">
                                        {statistics.map((statistic, index) => (
                                            <Card key={index} radius={12} withBorder pos='relative' p="md" className="hover:!bg-grey/10 transition-colors">
                                                <Stack gap={4}>
                                                    <Text size="xs" c="dimmed" fw={500}>{statistic.text}</Text>
                                                    {statistic.isCurrency ? (
                                                        <Text fw={700} size="lg">
                                                            {formatRupiah(statistic.value)}
                                                        </Text>
                                                    ) : (
                                                        <Text fw={700} size="lg">
                                                            {formatNumber(statistic.value)}
                                                        </Text>
                                                    )}
                                                    <Icon
                                                        icon={statistic.icon}
                                                        className="absolute text-[3rem] -bottom-2 -right-1 text-primary-base/10"
                                                    />
                                                </Stack>
                                            </Card>
                                        ))}
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </SimpleGrid>

                    <Tabs defaultValue="transaction">
                        <Tabs.List>
                            <Tabs.Tab value="transaction" leftSection={<Icon icon="fluent:money-16-regular" />}>
                                Transaksi ({filteredTransactions.length})
                            </Tabs.Tab>
                            <Tabs.Tab value="stock" leftSection={<Icon icon="solar:box-bold" width={16} />}>
                                Stock Report
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="stock">
                            <Box mt={16}>
                                {(() => {
                                    const variants = data?.productVarian || data?.product_varian || [];
                                    if (variants.length === 0) {
                                        return (
                                            <Box py="xl" ta="center">
                                                <Text c="dimmed">Belum ada data varian produk</Text>
                                            </Box>
                                        );
                                    }
                                    return (
                                        <Box style={{ overflowX: 'auto' }}>
                                            <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e8e8e8' }}>
                                                        {['Varian', 'SKU', 'Harga', 'Stock Awal', 'Terjual', 'Paid', 'Pending', 'Expired', 'Sisa Stock'].map(col => (
                                                            <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {variants.map((v: any, i: number) => {
                                                        const variantName = v.varian_name || v.name || v.variant_name || `Varian ${i + 1}`;
                                                        const sku = v.sku || '-';
                                                        const price = parsePrice(v.price || 0);
                                                        const stockAwal = v.stock_summary?.stock_awal !== undefined ? v.stock_summary.stock_awal : (v.stock_qty || v.stock || 0);

                                                        // Hitung dari allTransactions
                                                        const vTx = allTransactions.filter(tx =>
                                                            (tx.product_variant || '').toLowerCase() === variantName.toLowerCase()
                                                        );
                                                        const terjual = v.stock_summary?.terjual !== undefined ? v.stock_summary.terjual : vTx.reduce((s, tx) => s + (tx.total_qty || 0), 0);
                                                        const paid = vTx.filter(tx => tx.transaction_status_id === 2).reduce((s, tx) => s + (tx.total_qty || 0), 0);
                                                        const pending = vTx.filter(tx => tx.transaction_status_id === 1).reduce((s, tx) => s + (tx.total_qty || 0), 0);
                                                        const expired = vTx.filter(tx => tx.transaction_status_id === 4).reduce((s, tx) => s + (tx.total_qty || 0), 0);
                                                        const sisaStock = v.stock_summary?.sisa_stock !== undefined ? v.stock_summary.sisa_stock : Math.max(0, stockAwal - paid);
                                                        const isSoldOut = sisaStock <= 0 && stockAwal > 0;

                                                        return (
                                                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafd')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                                                    <Text size="sm" fw={600}>{variantName}</Text>
                                                                    {isSoldOut && <Badge size="xs" color="red" variant="filled" mt={4}>SOLD OUT</Badge>}
                                                                </td>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                                                    <Badge variant="light" color="gray" size="sm" styles={{ label: { textTransform: 'none', fontFamily: 'monospace' } }}>{sku}</Badge>
                                                                </td>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                                                    <Text size="sm" fw={600}>{formatRupiah(price)}</Text>
                                                                </td>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                                    <Text size="sm">{stockAwal}</Text>
                                                                </td>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                                    <Text size="sm" fw={600}>{terjual}</Text>
                                                                </td>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                                    <Text size="sm" fw={700} c={paid > 0 ? 'green' : 'dimmed'}>{paid}</Text>
                                                                </td>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                                    <Text size="sm" fw={700} c={pending > 0 ? 'orange' : 'dimmed'}>{pending}</Text>
                                                                </td>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                                    <Text size="sm" fw={700} c={expired > 0 ? 'red' : 'dimmed'}>{expired}</Text>
                                                                </td>
                                                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                                    <Badge
                                                                        color={sisaStock === 0 ? 'red' : sisaStock <= 5 ? 'orange' : 'green'}
                                                                        variant="filled"
                                                                        size="md"
                                                                        style={{ fontWeight: 700, minWidth: 32, justifyContent: 'center' }}
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
                                })()}
                            </Box>
                        </Tabs.Panel>

                        <Tabs.Panel value="transaction">
                            <Box mt={10}>
                                {/* Search and Filter */}
                                <Box mb="md">
                                    <Flex align="center" gap="sm" mb="sm" justify="space-between" wrap="wrap">
                                        <Select
                                            value={itemsPerPage.toString()}
                                            onChange={handleItemsPerPageChange}
                                            data={[
                                                { value: '5', label: '5' },
                                                { value: '10', label: '10' },
                                                { value: '20', label: '20' },
                                                { value: '50', label: '50' },
                                            ]}
                                            style={{ width: 70 }}
                                            size="sm"
                                        />
                                        <Group gap="sm">
                                            <Select
                                                placeholder="Filter Status"
                                                data={[
                                                    { value: 'all', label: 'Semua Status' },
                                                    { value: 'success', label: 'Success' },
                                                    { value: 'pending', label: 'Pending' },
                                                    { value: 'failed', label: 'Failed' },
                                                ]}
                                                value={filterBy}
                                                onChange={handleFilterChange}
                                                style={{ width: 140 }}
                                                clearable={false}
                                                size="sm"
                                            />
                                            <Select
                                                placeholder="Filter Varian"
                                                data={[
                                                    { value: 'all', label: 'Semua Varian' },
                                                    ...(productVariants || []).map(v => ({
                                                        value: v.name,
                                                        label: v.name
                                                    }))
                                                ]}
                                                value={selectedVariant}
                                                onChange={handleVariantChange}
                                                style={{ width: 140 }}
                                                clearable={false}
                                                size="sm"
                                            />
                                            <Select
                                                placeholder="Urutkan"
                                                data={[
                                                    { value: 'newest', label: 'Terbaru' },
                                                    { value: 'oldest', label: 'Terlama' },
                                                    { value: 'highest', label: 'Total Tertinggi' },
                                                    { value: 'lowest', label: 'Total Terendah' },
                                                ]}
                                                value={sortBy}
                                                onChange={handleSortChange}
                                                style={{ width: 140 }}
                                                clearable={false}
                                                size="sm"
                                            />
                                            <TextInput
                                                placeholder="Cari invoice, customer, produk..."
                                                leftSection={<Icon icon="solar:magnifer-linear" width={18} />}
                                                value={searchValue}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                style={{ width: 280 }}
                                                size="sm"
                                            />
                                        </Group>
                                    </Flex>
                                    <Flex align="center" gap="sm" mb="sm">
                                        <Text size="xs" c="gray">
                                            Menampilkan {filteredTransactions.length > 0 ? `${startItem}-${endItem}` : '0'} dari {filteredTransactions.length} transaksi
                                            {filterBy && filterBy !== 'all' && ` dengan status ${filterBy}`}
                                            {selectedVariant && selectedVariant !== 'all' && `, varian ${selectedVariant}`}
                                        </Text>
                                    </Flex>
                                </Box>

                                {/* Tabel Transaksi dengan Fixed Header */}
                                <Box
                                    style={{
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        overflow: 'auto',
                                        maxHeight: Math.min(maxTableHeight, paginatedTransactions.length * 52 + 80),
                                        position: 'relative'
                                    }}
                                >
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        minWidth: '1150px',
                                        borderSpacing: 0
                                    }}>
                                        <thead>
                                            <tr style={{
                                                backgroundColor: '#f8f9fa',
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 10,
                                                boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                {transactionColumns.map((col, idx) => {
                                                    return (
                                                        <th
                                                            key={idx}
                                                            onClick={() => {
                                                                if (col.accessor !== 'actions' && col.accessor !== 'no' && col.accessor !== 'shipping_status') {
                                                                    handleTableSort(col.accessor);
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '14px 12px',
                                                                textAlign: 'center',
                                                                borderBottom: '2px solid #dee2e6',
                                                                width: col.width ? `${col.width}px` : 'auto',
                                                                whiteSpace: 'nowrap',
                                                                backgroundColor: '#f8f9fa',
                                                                fontWeight: 600,
                                                                fontSize: '14px',
                                                                position: 'sticky',
                                                                top: 0,
                                                                zIndex: col.accessor === 'actions' ? 30 : 20,
                                                                right: col.accessor === 'actions' ? 0 : undefined,
                                                                boxShadow: col.accessor === 'actions' ? '-2px 0 5px rgba(0,0,0,0.07)' : undefined,
                                                                cursor: (col.accessor !== 'actions' && col.accessor !== 'no' && col.accessor !== 'shipping_status') ? 'pointer' : 'default'
                                                            }}
                                                        >
                                                            {col.accessor === 'actions' ? (
                                                                <Flex align="center" justify="center" gap="xs">
                                                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Aksi</span>
                                                                    <Checkbox
                                                                        checked={selectedInvoiceIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                                                                        indeterminate={selectedInvoiceIds.length > 0 && selectedInvoiceIds.length < paginatedTransactions.length}
                                                                        onChange={toggleSelectAll}
                                                                        size="xs"
                                                                    />
                                                                    <Tooltip label={`Cetak Resi ${selectedInvoiceIds.length > 0 ? `(${selectedInvoiceIds.length})` : ''}`}>
                                                                        <ActionIcon
                                                                            variant="transparent"
                                                                            color="blue"
                                                                            onClick={handleBulkPrint}
                                                                            disabled={selectedInvoiceIds.length === 0 || printLoading}
                                                                            style={{ position: 'relative', overflow: 'visible', marginLeft: 4 }}
                                                                        >
                                                                            {printLoading ? <Icon icon="line-md:loading-twotone-loop" /> : <Icon icon="solar:printer-bold" width={18} />}
                                                                            {selectedInvoiceIds.length > 0 && (
                                                                                <Badge size="xs" color="red" variant="filled" style={{ position: 'absolute', top: -5, right: -5, pointerEvents: 'none', padding: '0 4px', height: 16, minWidth: 16, color: 'white', fontWeight: 800 }}>
                                                                                    {selectedInvoiceIds.length}
                                                                                </Badge>
                                                                            )}
                                                                        </ActionIcon>
                                                                    </Tooltip>
                                                                </Flex>
                                                            ) : (
                                                                <Flex align="center" justify="center" gap={4}>
                                                                    {col.title}
                                                                    {(col.accessor !== 'actions' && col.accessor !== 'no' && col.accessor !== 'shipping_status') && (
                                                                        <span style={{ fontSize: '12px', color: tableSortField === col.accessor ? '#333' : '#ccc', opacity: tableSortField === col.accessor ? 1 : 0.4 }}>
                                                                            {tableSortField === col.accessor ? (tableSortDir === 'asc' ? '↑' : '↓') : '↑'}
                                                                        </span>
                                                                    )}
                                                                </Flex>
                                                            )}
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedTransactions.map((item, idx) => (
                                                <tr
                                                    key={idx}
                                                    style={{
                                                        borderBottom: '1px solid #dee2e6',
                                                        backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8fafd';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#fafafa';
                                                    }}
                                                >
                                                    {transactionColumns.map((col, colIdx) => {
                                                        const column = transactionColumns[colIdx];
                                                        const isAction = col.accessor === 'actions';

                                                        const cellStyle: React.CSSProperties = {
                                                            padding: '12px',
                                                            textAlign: 'center',
                                                            whiteSpace: 'nowrap',
                                                            backgroundColor: 'inherit',
                                                            zIndex: isAction ? 5 : 1,
                                                            position: isAction ? 'sticky' : undefined,
                                                            right: isAction ? 0 : undefined,
                                                            boxShadow: isAction ? '-2px 0 4px rgba(0,0,0,0.06)' : undefined
                                                        };

                                                        if (col.accessor === 'no' && column.render) {
                                                            return (
                                                                <td key={colIdx} style={cellStyle}>
                                                                    {column.render(item, idx)}
                                                                </td>
                                                            );
                                                        }

                                                        if (column.render && col.accessor !== 'no') {
                                                            return (
                                                                <td key={colIdx} style={cellStyle}>
                                                                    {column.render(item)}
                                                                </td>
                                                            );
                                                        }

                                                        const value = getValueByAccessor(item, column.accessor);
                                                        return (
                                                            <td key={colIdx} style={cellStyle}>
                                                                {String(value || '-')}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>

                                {/* Pagination */}
                                {filteredTransactions.length > 0 && (
                                    <Flex justify="space-between" align="center" mt="xl">
                                        <Text size="sm" c="gray">
                                            Menampilkan halaman {currentPage} dari {totalPages}
                                        </Text>
                                        <Pagination
                                            total={totalPages}
                                            value={currentPage}
                                            onChange={handlePageChange}
                                            size="sm"
                                            radius="md"
                                            withEdges
                                            boundaries={1}
                                        />
                                    </Flex>
                                )}

                                {filteredTransactions.length === 0 && (
                                    <Stack align="center" gap="md" mt="xl" py={50}>
                                        <Icon icon="solar:box-minimalistic-broken" width={64} className="text-gray-400" />
                                        <Text ta="center" c="gray" size="lg" fw={500}>
                                            Tidak ada data transaksi
                                        </Text>
                                        {(searchValue || filterBy !== 'all' || selectedVariant !== 'all') && (
                                            <Button
                                                variant="light"
                                                size="md"
                                                leftSection={<Icon icon="solar:refresh-bold" width={18} />}
                                                onClick={() => {
                                                    setSearchValue('');
                                                    setFilterBy('all');
                                                    setSelectedVariant('all');
                                                    setSortBy('newest');
                                                    setTableSortField(null);
                                                    setTableSortDir('asc');
                                                    applyFilters('', 'all', 'newest', 'all', null, 'asc', transactions);
                                                }}
                                            >
                                                Reset Filter
                                            </Button>
                                        )}
                                    </Stack>
                                )}
                            </Box>
                        </Tabs.Panel>
                    </Tabs>
                </Stack>
            </Card>
            {/* Modal Detail Transaksi */}
            <NextUIModal
                isOpen={detailOpened}
                onClose={closeDetail}
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
                    {(onClose) => {
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
                                                    <span>Order ID: {selectedInvoiceDetail?.invoice_no || '-'}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(selectedInvoiceDetail?.invoice_no || '')}
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
                                        <div className="bg-gray-50 pb-10">
                                            <div className="bg-white border-b border-primary-light-200 px-6 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${invoiceDetail.transaction_status?.name.toLowerCase().includes('expired') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                                <FontAwesomeIcon icon={invoiceDetail.transaction_status?.name.toLowerCase().includes('expired') ? faExclamationCircle : faCheckCircle} className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] items-center uppercase tracking-wider text-gray-500 font-bold">Status Pesanan</p>
                                                                <p className="text-sm font-bold text-gray-800">{invoiceDetail.transaction_status?.name || '-'}</p>
                                                            </div>
                                                        </div>

                                                        <Divider orientation="vertical" h={30} />

                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                                <FontAwesomeIcon icon={faTruck} className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Status Pengiriman</p>
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {invoiceDetail.manifest?.[0]?.status || 'Order berhasil dibuat'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">No. Resi</p>
                                                        <p className="text-sm font-bold text-blue-600 font-mono tracking-wider">{trackingNumber}</p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">{invoiceDetail.courier?.courier_type || 'jne reg'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="max-w-7xl mx-auto px-6 py-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    {/* Left Column - Details */}
                                                    <div className="lg:col-span-2 space-y-6">
                                                        <NextUICard shadow="sm" className="border-none">
                                                            <CardBody className="p-0">
                                                                <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex items-center gap-2">
                                                                    <FontAwesomeIcon icon={faBox} className="text-blue-500 h-4 w-4" />
                                                                    <span className="text-sm font-bold text-blue-900">Informasi Paket</span>
                                                                </div>
                                                                <div className="p-0 overflow-hidden">
                                                                    <table className="w-100 min-w-full divide-y divide-gray-100">
                                                                        <thead className="bg-gray-50/50">
                                                                            <tr>
                                                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                                                                <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">Varian</th>
                                                                                <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                                                                <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Harga</th>
                                                                                <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subtotal</th>
                                                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Catatan</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white border-b border-light-grey">
                                                                            {invoiceDetail.detail?.map((item: any, idx: number) => (
                                                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                                                        <p className="text-sm font-semibold text-gray-800">{item.product?.product_name || '-'}</p>
                                                                                    </td>
                                                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                                                        {item.variant ? (
                                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                                                                {formatVariantDisplay(item.variant)}
                                                                                            </span>
                                                                                        ) : <span className="text-gray-400">-</span>}
                                                                                    </td>
                                                                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-700">{item.qty}</td>
                                                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-600">{formatRupiah(item.price)}</td>
                                                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-800">
                                                                                        {formatRupiah(Number(item.price) * item.qty)}
                                                                                    </td>
                                                                                    <td className="px-4 py-4 text-sm text-gray-500 min-w-[150px]">
                                                                                        <p className="italic text-[11px] line-clamp-2" title={item.order_notes}>{item.order_notes || '-'}</p>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </CardBody>
                                                        </NextUICard>

                                                        <NextUICard shadow="sm" className="border-none">
                                                            <CardBody className="p-0">
                                                                <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex items-center gap-2">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 h-4 w-4" />
                                                                    <span className="text-sm font-bold text-blue-900">Alamat Pengiriman</span>
                                                                </div>
                                                                <div className="p-5">
                                                                    <div className="flex items-start gap-4">
                                                                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-light-grey flex items-center justify-center flex-shrink-0">
                                                                            <FontAwesomeIcon icon={faUser} className="text-gray-400 h-5 w-5" />
                                                                        </div>
                                                                        <div className="space-y-1 flex-1">
                                                                            <p className="text-lg font-bold text-gray-800">{invoiceDetail.address?.nama_penerima || invoiceDetail.user?.name}</p>
                                                                            <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                                                                                <span className="flex items-center gap-1.5"><FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-gray-400" />{invoiceDetail.address?.phone || invoiceDetail.user?.phone || '-'}</span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mt-2">{invoiceDetail.address?.address_detail || '-'}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </NextUICard>

                                                        <NextUICard shadow="sm" className="border-none">
                                                            <CardBody className="p-0">
                                                                <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex items-center gap-2">
                                                                    <FontAwesomeIcon icon={faFileInvoice} className="text-blue-500 h-4 w-4" />
                                                                    <span className="text-sm font-bold text-blue-900">Ringkasan Pesanan</span>
                                                                </div>
                                                                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-6">
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Order ID</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-bold text-gray-800 font-mono tracking-tight">{invoiceDetail.invoice_no}</p>
                                                                            <button onClick={() => copyToClipboard(invoiceDetail.invoice_no)} className="text-gray-300 hover:text-blue-500 transition-colors">
                                                                                <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Tanggal Order</p>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-gray-300" />
                                                                            <p className="text-sm font-bold text-gray-800">{formatDateDetail(invoiceDetail.created_at)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Kurir</p>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <FontAwesomeIcon icon={faTruck} className="h-3 w-3 text-gray-300" />
                                                                            <p className="text-sm font-bold text-gray-800">{invoiceDetail.courier?.courier_company || 'jne reg'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Berat</p>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <FontAwesomeIcon icon={faWeightHanging} className="h-3 w-3 text-gray-300" />
                                                                            <p className="text-sm font-bold text-gray-800">1 gram</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </NextUICard>
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-6">
                                                        <NextUICard shadow="sm" className="border-none border-blue-100">
                                                            <CardBody className="p-0">
                                                                <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex items-center gap-2">
                                                                    <FontAwesomeIcon icon={faTimeline} className="text-blue-500 h-4 w-4" />
                                                                    <span className="text-sm font-bold text-blue-900">Riwayat Pelacakan</span>
                                                                </div>
                                                                <div className="p-5 max-h-[400px] overflow-y-auto">
                                                                    {invoiceDetail.history && invoiceDetail.history.length > 0 ? (
                                                                        <div className="relative space-y-6 before:absolute before:left-3.5 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-blue-100">
                                                                            {invoiceDetail.history.map((h: any, idx: number) => (
                                                                                <div key={idx} className="relative pl-10">
                                                                                    <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center z-10 ${idx === 0 ? 'bg-blue-500 shadow-blue-200' : 'bg-gray-200'} shadow-md overflow-visible`}>
                                                                                        {idx === 0 && <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></div>}
                                                                                        <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-gray-400'}`}></div>
                                                                                    </div>
                                                                                    <div className="space-y-0.5">
                                                                                        <p className={`text-sm font-bold ${idx === 0 ? 'text-blue-600' : 'text-gray-700'}`}>{h.status}</p>
                                                                                        <p className="text-[11px] leading-relaxed text-gray-500 font-medium">{h.note}</p>
                                                                                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="h-2 w-2" />
                                                                                            <span>Warehouse</span>
                                                                                            <span className="mx-1">•</span>
                                                                                            <span>{formatDateDetail(h.created_at)}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center py-6">
                                                                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                                                                <FontAwesomeIcon icon={faHourglassHalf} className="text-gray-300 h-5 w-5" />
                                                                            </div>
                                                                            <p className="text-sm font-bold text-gray-800">Menunggu data kurir</p>
                                                                            <p className="text-[11px] text-gray-500 mt-1">Status pengiriman akan diperbarui secara otomatis</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardBody>
                                                        </NextUICard>

                                                        <NextUICard shadow="sm" className="border-none bg-green-50/30 border border-green-100">
                                                            <CardBody className="p-0">
                                                                <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
                                                                    <FontAwesomeIcon icon={faTag} className="text-green-600 h-4 w-4" />
                                                                    <span className="text-sm font-bold text-green-900">Ringkasan Pembayaran</span>
                                                                </div>
                                                                <div className="p-5 space-y-3">
                                                                    <div className="flex justify-between items-center text-sm font-medium">
                                                                        <span className="text-gray-600">Total Harga</span>
                                                                        <span className="text-gray-900 font-bold">{formatRupiah(invoiceDetail.total_price)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm font-medium">
                                                                        <span className="text-gray-600">Ongkos Kirim</span>
                                                                        <span className="text-gray-900 font-bold">{formatRupiah(invoiceDetail.delivery_price)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm font-medium">
                                                                        <span className="text-gray-600">Admin Fee</span>
                                                                        <span className="text-gray-900 font-bold">{formatRupiah(invoiceDetail.admin_fee || 2000)}</span>
                                                                    </div>
                                                                    <div className="pt-3 border-t border-green-100 flex justify-between items-center">
                                                                        <span className="text-sm font-bold text-gray-800">Total Tagihan</span>
                                                                        <span className="text-lg font-bold text-green-600 tracking-tight">{formatRupiah(invoiceDetail.grandtotal || (Number(invoiceDetail.total_price) + Number(invoiceDetail.delivery_price) + (invoiceDetail.admin_fee || 2000)))}</span>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </NextUICard>

                                                        <NextUICard shadow="sm" className="border-none">
                                                            <CardBody className="p-0">
                                                                <div className="bg-gray-50/50 px-4 py-3 border-b border-light-grey flex items-center gap-2">
                                                                    <FontAwesomeIcon icon={faCreditCard} className="text-gray-500 h-4 w-4" />
                                                                    <span className="text-sm font-bold text-gray-700">Detail Transaksi</span>
                                                                </div>
                                                                <div className="p-5 space-y-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                                            <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Tanggal</p>
                                                                            <p className="text-xs font-bold text-gray-800">{formatDateDetail(invoiceDetail.created_at)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                                            <FontAwesomeIcon icon={faFileInvoice} className="h-4 w-4" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Deskripsi</p>
                                                                            <p className="text-xs font-medium text-gray-600 leading-relaxed pr-2">
                                                                                Payment with {formatPaymentMethodDetail(invoiceDetail.payment_method)} {invoiceDetail.invoice_no}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </NextUICard>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </ModalBody>
                                <ModalFooter className="flex items-center justify-end gap-2 border-t border-light-grey">
                                    <NextUIButton
                                        variant="light"
                                        onPress={onClose}
                                        className="font-bold text-gray-600 h-10 px-6 rounded-xl border border-light-grey hover:bg-gray-100 transition-all"
                                    >
                                        Tutup
                                    </NextUIButton>
                                    <NextLink href={`/dashboard/merch-transaction`} passHref>
                                        <NextUIButton
                                            as="a"
                                            variant="light"
                                            color="primary"
                                            className="font-bold h-10 px-6 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                                            Lihat Invoice Lengkap
                                        </NextUIButton>
                                    </NextLink>
                                    <NextUIButton
                                        color="primary"
                                        className="font-bold h-10 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md shadow-blue-200 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
                                        onPress={() => handlePrintClick(selectedInvoiceDetail?.invoice_no || '')}
                                        isLoading={printLoading}
                                    >
                                        <FontAwesomeIcon icon={faPrint} className="h-3.5 w-3.5" />
                                        Cetak Resi
                                    </NextUIButton>
                                </ModalFooter>
                            </>
                        );
                    }}
                </ModalContent>
            </NextUIModal>
        </>
    )
}