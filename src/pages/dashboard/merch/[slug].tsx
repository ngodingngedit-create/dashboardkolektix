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
//     // Untuk kompatibilitas dengan TableData
//     [key: string]: any;
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
    Pagination
} from "@mantine/core";
import { useListState, useDisclosure } from "@mantine/hooks";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
    shipping_address: string;
    status_name: string;
    payment_method: string;
    notes: string;
    product_id?: number;
    product_variant?: string;
    courier?: string;
    courier_service?: string;
    shipping_cost?: number;
    creator_address?: string;
    creator_phone?: string;
    [key: string]: any;
}

// Interface untuk varian produk
interface ProductVariant {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    image?: string;
}

// Interface untuk kolom TableData
interface TableColumn {
    accessor: string;
    title: string;
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
                    body {
                        background: white;
                        padding: 0.5in;
                    }
                    .resi-container {
                        box-shadow: none;
                        border: 2px solid #000 !important;
                    }
                }
                
                .resi-container {
                    max-width: 700px;
                    width: 100%;
                    margin: 0 auto;
                    background: white;
                    border: 2px solid #000;
                    padding: 25px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
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
                
                .biteship {
                    text-align: center;
                    margin: 15px 0;
                    font-size: 16px;
                    color: #000;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 12px;
                    font-weight: 500;
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
                
                <div class="biteship">kolektix.com</div>
                
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
        {
            text: 'Total Varian',
            value: 0,
            icon: 'akar-icons:layers',
        },
    ]);
    const [transactions, setTransactions] = useState<MerchandiseTransactionData[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<MerchandiseTransactionData[]>([]);
    const [allTransactions, setAllTransactions] = useState<MerchandiseTransactionData[]>([]);
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<string | null>('all');

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
                            if (stat.text === 'Total Varian') {
                                return { ...stat, value: variants.length };
                            }
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
                    }
                }
            });

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
                id: 0, // ID tidak diperlukan untuk filter
                name: name,
                sku: '',
                price: 0,
                stock: 0
            })));

            applyFilters(searchValue, filterBy, sortBy, selectedVariant, transactionsData);
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
        transactionList: MerchandiseTransactionData[]
    ) => {
        let filtered = [...transactionList];

        if (filter && filter !== 'all') {
            if (filter === 'success') {
                filtered = filtered.filter(item => item.transaction_status_id === 2);
            } else if (filter === 'pending') {
                filtered = filtered.filter(item => item.transaction_status_id === 1);
            } else if (filter === 'failed') {
                filtered = filtered.filter(item => item.transaction_status_id === 3);
            }
        }

        if (variant && variant !== 'all') {
            filtered = filtered.filter(item =>
                item.product_variant?.toLowerCase() === variant.toLowerCase()
            );
        }

        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(item =>
                (item.invoice_no?.toLowerCase() || '').includes(searchLower) ||
                (item.customer_name?.toLowerCase() || '').includes(searchLower) ||
                (item.product_name?.toLowerCase() || '').includes(searchLower) ||
                (item.product_variant?.toLowerCase() || '').includes(searchLower) ||
                (formatPaymentMethod(item.payment_method)?.toLowerCase() || '').includes(searchLower)
            );
        }

        if (sort) {
            filtered.sort((a, b) => {
                if (sort === 'newest') {
                    return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
                } else if (sort === 'oldest') {
                    return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
                } else if (sort === 'highest') {
                    return b.total_price - a.total_price;
                } else if (sort === 'lowest') {
                    return a.total_price - b.total_price;
                }
                return 0;
            });
        }

        setFilteredTransactions(filtered);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        applyFilters(value, filterBy, sortBy, selectedVariant, transactions);
        setCurrentPage(1); // Reset ke halaman pertama
    };

    const handleFilterChange = (value: string | null) => {
        setFilterBy(value);
        applyFilters(searchValue, value, sortBy, selectedVariant, transactions);
        setCurrentPage(1); // Reset ke halaman pertama
    };

    const handleSortChange = (value: string | null) => {
        setSortBy(value);
        applyFilters(searchValue, filterBy, value, selectedVariant, transactions);
        setCurrentPage(1); // Reset ke halaman pertama
    };

    const handleVariantChange = (value: string | null) => {
        setSelectedVariant(value);
        applyFilters(searchValue, filterBy, sortBy, value, transactions);
        setCurrentPage(1); // Reset ke halaman pertama
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
        const productUrl = `${window.location.origin}/merchandise/${slug}`;

        const link = document.createElement('a');
        link.href = `https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=${encodeURIComponent(productUrl)}&choe=UTF-8`;
        link.download = `qr-${data?.product_name || 'product'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const transactionColumns: TableColumn[] = [
        {
            accessor: 'no',
            title: 'No',
            width: 60,
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
                <Text ta="center">{String(item.invoice_no || '-')}</Text>
            )
        },
        {
            accessor: 'order_date',
            title: 'Tanggal',
            width: 120,
            render: (item: any) => (
                <Text ta="center">{item.order_date ? moment(item.order_date).format('DD/MM/YYYY') : '-'}</Text>
            )
        },
        {
            accessor: 'customer_name',
            title: 'Customer',
            width: 150,
            render: (item: any) => (
                <Text ta="center">{String(item.customer_name || '-')}</Text>
            )
        },
        {
            accessor: 'product_variant',
            title: 'Varian',
            width: 100,
            render: (item: any) => {
                const variant = item.product_variant;
                if (!variant || variant === '-') return <Text ta="center">-</Text>;
                return <Text ta="center">{String(variant)}</Text>;
            }
        },
        {
            accessor: 'total_qty',
            title: 'Qty',
            width: 80,
            render: (item: any) => (
                <Text ta="center">{Number(item.total_qty) || 0}</Text>
            )
        },
        {
            accessor: 'total_price',
            title: 'Total',
            width: 120,
            render: (item: any) => (
                <Text ta="center">{formatRupiah(item.total_price)}</Text>
            )
        },
        {
            accessor: 'status_name',
            title: 'Status',
            width: 100,
            render: (item: any) => {
                const statusInfo = getStatusInfo(item.transaction_status_id);
                return (
                    <Flex justify="center">
                        <Badge color={statusInfo.badgeColor}>
                            {statusInfo.text}
                        </Badge>
                    </Flex>
                );
            }
        },
        {
            accessor: 'payment_method',
            title: 'Payment Method',
            width: 130,
            render: (item: any) => (
                <Text ta="center">{String(formatPaymentMethod(item.payment_method) || '-')}</Text>
            )
        },
        {
            accessor: 'actions',
            title: 'Cetak Resi',
            width: 100,
            render: (item: any) => (
                <Flex justify="center" align="center">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handlePrintClick(item.invoice_no)}
                        title="Cetak Resi"
                        size="md"
                        loading={printLoading && selectedInvoice === item.invoice_no}
                    >
                        <Icon icon="solar:printer-bold" width={18} />
                    </ActionIcon>
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
    const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/merchandise/${slug}` : '';

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startItem = filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredTransactions.length);

    return (
        <>
            {/* Modal QR Code Produk */}
            <Modal opened={qrOpened} onClose={closeQr} title="QR Code Produk" centered size="md">
                <Stack align="center" gap="md">
                    <Image
                        src={`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(productUrl)}&choe=UTF-8`}
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
                    {/* Accordion Statistik */}
                    <Accordion variant="separated" radius={10}>
                        <Accordion.Item value="statistik">
                            <Accordion.Control>
                                <Flex gap={10} align="center">
                                    <Icon icon="akar-icons:statistic-up" className="text-primary-base" />
                                    <Text>Statistik Merchandise</Text>
                                </Flex>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <SimpleGrid cols={3}>
                                    {statistics.map((statistic, index) => (
                                        <Card key={index} radius={10} withBorder pos='relative' className="hover:!bg-grey/10">
                                            <Stack gap={0}>
                                                <Text>{statistic.text}</Text>
                                                {statistic.isCurrency ? (
                                                    <Text fw={600} size="xl">
                                                        {formatRupiah(statistic.value)}
                                                    </Text>
                                                ) : (
                                                    <Text fw={600} size="xl">
                                                        {formatNumber(statistic.value)}
                                                    </Text>
                                                )}
                                                <Icon
                                                    icon={statistic.icon}
                                                    className="absolute text-[5rem] -bottom-5 -right-2 text-primary-base/30"
                                                />
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>

                    {/* Header Produk */}
                    <Flex justify="space-between" gap={30}>
                        <AspectRatio ratio={1} maw={200} w="100%">
                            <Image
                                radius={10}
                                src={imageList?.[0]?.image_url}
                                bg="gray.1"
                                alt={data?.product_name || 'produk'}
                            />
                        </AspectRatio>

                        <Stack gap={0} w="100%">
                            <Text size="xs" c="gray" mb={5}>
                                Dibuat pada {data?.created_at ? moment(data.created_at).format('DD MMMM YYYY') : '-'}
                            </Text>
                            <Flex gap={10} align="center">
                                <Title size="h2">{data?.product_name || '-'}</Title>
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
                                <Text fw={600}>
                                    {formatRupiah(productPrice)}
                                </Text>
                                <Divider orientation="vertical" mx={10} />
                                <Icon icon="solar:star-bold" className="text-yellow-500 text-[24px]" />
                                <Text>{data?.average_star ? parseFloat(data.average_star).toFixed(1) : '0.0'}</Text>
                            </Flex>
                            <Text size="sm" mt={10} c="gray">
                                Total Terjual: {data?.total_sold || 0} unit
                            </Text>
                        </Stack>
                    </Flex>

                    <Tabs defaultValue="transaction">
                        <Tabs.List>
                            <Tabs.Tab value="transaction" leftSection={<Icon icon="fluent:money-16-regular" />}>
                                Transaksi ({filteredTransactions.length})
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="transaction">
                            <Box mt={10}>
                                {/* Search and Filter */}
                                <Group justify="space-between" mb="md">
                                    <Group>
                                        <TextInput
                                            placeholder="Cari invoice, customer, produk, varian..."
                                            leftSection={<Icon icon="solar:magnifer-linear" width={18} />}
                                            value={searchValue}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            style={{ width: 350 }}
                                        />
                                        <Select
                                            placeholder="Filter Status"
                                            leftSection={<Icon icon="solar:filter-bold" width={18} />}
                                            data={[
                                                { value: 'all', label: 'Semua Status' },
                                                { value: 'success', label: 'Success' },
                                                { value: 'pending', label: 'Pending' },
                                                { value: 'failed', label: 'Failed' },
                                            ]}
                                            value={filterBy}
                                            onChange={handleFilterChange}
                                            style={{ width: 180 }}
                                            clearable={false}
                                        />
                                        <Select
                                            placeholder="Filter Varian"
                                            leftSection={<Icon icon="solar:layers-bold" width={18} />}
                                            data={[
                                                { value: 'all', label: 'Semua Varian' },
                                                ...productVariants.map(v => ({
                                                    value: v.name,
                                                    label: v.name
                                                }))
                                            ]}
                                            value={selectedVariant}
                                            onChange={handleVariantChange}
                                            style={{ width: 180 }}
                                            clearable={false}
                                        />
                                        <Select
                                            placeholder="Urutkan"
                                            leftSection={<Icon icon="solar:sort-bold" width={18} />}
                                            data={[
                                                { value: 'newest', label: 'Terbaru' },
                                                { value: 'oldest', label: 'Terlama' },
                                                { value: 'highest', label: 'Total Tertinggi' },
                                                { value: 'lowest', label: 'Total Terendah' },
                                            ]}
                                            value={sortBy}
                                            onChange={handleSortChange}
                                            style={{ width: 180 }}
                                            clearable={false}
                                        />
                                    </Group>
                                    <Button
                                        variant="light"
                                        color="blue"
                                        leftSection={<Icon icon="solar:printer-bold" width={18} />}
                                        onClick={() => {
                                            // Handle cetak semua resi
                                            alert('Fitur cetak semua resi akan segera hadir');
                                        }}
                                        disabled={filteredTransactions.length === 0 || printLoading}
                                    >
                                        Cetak Semua Resi ({filteredTransactions.length})
                                    </Button>
                                </Group>

                                <Flex justify="space-between" align="center" mb="md">
                                    <Text size="sm" c="gray">
                                        Menampilkan {filteredTransactions.length > 0 ? `${startItem}-${endItem}` : '0'} dari {filteredTransactions.length} transaksi
                                        {filterBy && filterBy !== 'all' && ` dengan status ${filterBy}`}
                                        {selectedVariant && selectedVariant !== 'all' && `, varian ${selectedVariant}`}
                                    </Text>

                                    <Select
                                        placeholder="Item per halaman"
                                        value={itemsPerPage.toString()}
                                        onChange={handleItemsPerPageChange}
                                        data={[
                                            { value: '5', label: '5 per halaman' },
                                            { value: '10', label: '10 per halaman' },
                                            { value: '20', label: '20 per halaman' },
                                            { value: '50', label: '50 per halaman' },
                                        ]}
                                        style={{ width: 150 }}
                                    />
                                </Flex>

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
                                                {transactionColumns.map((col, idx) => (
                                                    <th
                                                        key={idx}
                                                        style={{
                                                            padding: '14px 12px',
                                                            textAlign: 'center',
                                                            borderBottom: '2px solid #dee2e6',
                                                            width: col.width ? `${col.width}px` : 'auto',
                                                            whiteSpace: 'nowrap',
                                                            backgroundColor: '#f8f9fa',
                                                            fontWeight: 600,
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {col.title}
                                                    </th>
                                                ))}
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
                                                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#fafafa';
                                                    }}
                                                >
                                                    {transactionColumns.map((col, colIdx) => {
                                                        const column = transactionColumns[colIdx];

                                                        if (col.accessor === 'no' && column.render) {
                                                            return (
                                                                <td key={colIdx} style={{
                                                                    padding: '12px',
                                                                    textAlign: 'center',
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    {column.render(item, idx)}
                                                                </td>
                                                            );
                                                        }

                                                        if (column.render && col.accessor !== 'no') {
                                                            return (
                                                                <td key={colIdx} style={{
                                                                    padding: '12px',
                                                                    textAlign: 'center',
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    {column.render(item)}
                                                                </td>
                                                            );
                                                        }

                                                        const value = getValueByAccessor(item, column.accessor);
                                                        return (
                                                            <td key={colIdx} style={{
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                whiteSpace: 'nowrap'
                                                            }}>
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
                                                    applyFilters('', 'all', 'newest', 'all', transactions);
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
        </>
    )
}