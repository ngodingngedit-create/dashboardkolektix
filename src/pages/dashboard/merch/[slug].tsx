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
    NumberFormatter,
    SimpleGrid,
    Stack,
    Tabs,
    Text,
    Title,
    Badge,
    ScrollArea
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
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
    shipping_address: string;
    status_name: string;
    payment_method: string;
    notes: string;
    product_id?: number;
    // Untuk kompatibilitas dengan TableData
    [key: string]: any;
}

// Interface untuk kolom TableData (sesuaikan dengan komponen TableData Anda)
interface TableColumn {
    accessor: string;
    title: string;
    width?: number;
    render?: (item: any) => React.ReactNode;
}

// Helper function untuk parse harga dari berbagai format
const parsePrice = (price: any): number => {
    if (!price && price !== 0) return 0;

    // Jika sudah number, langsung return
    if (typeof price === 'number') return price;

    // Jika string, coba beberapa format
    const priceStr = String(price).trim();

    console.log('Parsing price string:', priceStr); // Debug

    // CASE 1: Format dengan titik sebagai decimal separator (200000.000000)
    // Ini biasanya dari database dengan decimal places
    if (priceStr.includes('.') && !priceStr.includes(',')) {
        // Hitung berapa digit setelah titik
        const parts = priceStr.split('.');
        if (parts.length === 2) {
            // Jika setelah titik ada 6 digit (biasanya decimal places), bagi dengan 1
            if (parts[1].length >= 6) {
                // Contoh: "200000.000000" -> 200000 / 1 = 200000
                const integerPart = parts[0];
                // Untuk nilai seperti "200000.000000", kita anggap sebagai integer tanpa decimal
                return parseFloat(integerPart);
            } else {
                // Jika sedikit digit setelah titik, mungkin benar-benar decimal
                // Contoh: "200.50" -> 200.50
                return parseFloat(priceStr);
            }
        }
    }

    // CASE 2: Format dengan titik sebagai ribuan separator
    // Contoh: "200.000" atau "1.500.000"
    if (priceStr.includes('.') && priceStr.match(/\./g)?.length === 1) {
        // Hanya satu titik, bisa jadi ribuan separator
        const withoutDots = priceStr.replace(/\./g, '');
        const parsed = parseFloat(withoutDots);
        return isNaN(parsed) ? 0 : parsed;
    }

    // CASE 3: Format dengan koma sebagai decimal separator
    // Contoh: "200000,00" atau "200.000,00"
    if (priceStr.includes(',')) {
        // Hapus titik sebagai ribuan separator, ganti koma dengan titik
        const withoutDots = priceStr.replace(/\./g, '');
        const withDotDecimal = withoutDots.replace(',', '.');
        const parsed = parseFloat(withDotDecimal);
        return isNaN(parsed) ? 0 : parsed;
    }

    // CASE 4: String tanpa separator
    const parsed = parseFloat(priceStr);
    return isNaN(parsed) ? 0 : parsed;
};

// Helper function untuk format rupiah dengan benar
const formatRupiah = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parsePrice(value) : value;

    console.log('Formatting rupiah:', { input: value, parsed: numValue }); // Debug

    if (isNaN(numValue) || numValue === 0) {
        return "Rp 0";
    }

    // Format dengan Intl.NumberFormat untuk locale Indonesia
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numValue);
};

// Helper function untuk format angka tanpa mata uang
const formatNumber = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue) || numValue === 0) {
        return "0";
    }

    return new Intl.NumberFormat('id-ID').format(numValue);
};

// Helper function untuk mendapatkan info status berdasarkan transaction_status_id
const getStatusInfo = (statusId?: number) => {
    switch (statusId) {
        case 1: // pending
            return {
                text: "Pending",
                color: "yellow",
                badgeColor: "yellow",
            };
        case 2: // success
            return {
                text: "Success",
                color: "green",
                badgeColor: "green",
            };
        case 3: // failed
            return {
                text: "Failed",
                color: "red",
                badgeColor: "red",
            };
        case 4: // expired
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

export default function MerchDetail() {
    const [data, setData] = useState<any>();
    const [imageList, setImageList] = useState<any[]>([]);
    const [loading, setLoading] = useListState<string>();
    const [statistics, setStatistics] = useState<StatisticsData[]>([
        {
            text: 'Visitor',
            value: 0,
            icon: 'famicons:people-outline',
        },
        {
            text: 'Total Bookmarks',
            value: 0,
            icon: 'akar-icons:bookmark',
        },
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
    const router = useRouter();
    const { slug } = router.query;

    useEffect(() => {
        if (slug) {
            getData();
        }
    }, [slug]);

    const getData = () => {
        if (slug) {
            setLoading.append('getdata');
            Get(`product/${slug}`, {})
                .then((res: any) => {
                    if (res.data) {
                        const productData = res.data;
                        console.log('Product data:', productData); // Debug log
                        console.log('Product price raw:', productData.price); // Debug log harga
                        console.log('Product price type:', typeof productData.price); // Debug type

                        // Test parsing
                        const testParsed = parsePrice(productData.price);
                        console.log('Test parsed price:', testParsed);
                        console.log('Test formatted price:', formatRupiah(testParsed));

                        setData(productData);
                        setImageList(productData.product_image || []);

                        // Setelah data merchandise didapat, ambil data statistik dan transaksi
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

    // Fungsi untuk mengambil data statistik dan transaksi
    const getStatisticsData = async (productId: number) => {
        try {
            const res: any = await Get("order-bycreator", {});
            console.log('Order by creator data:', res?.data); // Debug log

            // Filter data berdasarkan product_id yang sedang dilihat
            let filteredData = res?.data || [];
            let transactionsData: MerchandiseTransactionData[] = [];

            // Hitung total penjualan (qty) dan total pendapatan
            let totalQty = 0;
            let totalRevenue = 0;

            filteredData.forEach((item: any) => {
                // Cek apakah transaksi ini mengandung product yang dicari
                let hasProduct = false;
                let productNames: string[] = [];
                let productQty = 0;
                let productPrice = 0;
                let productSku = "";

                // Jika ada detail array
                if (Array.isArray(item.detail)) {
                    item.detail.forEach((detail: any) => {
                        const detailProductId = detail.product_id || detail.product?.id;

                        if (detailProductId === productId) {
                            hasProduct = true;

                            // Kumpulkan nama produk
                            if (detail?.product?.product_name) {
                                productNames.push(detail.product.product_name);
                                productSku = detail.product.sku || "";
                            } else if (detail?.product_name) {
                                productNames.push(detail.product_name);
                            }

                            // Hitung qty untuk product ini
                            const qty = detail.quantity || detail.qty || 0;
                            productQty += qty;

                            // Hitung price untuk product ini (gunakan parsePrice untuk konversi)
                            const price = parsePrice(detail.price_total || detail.price || detail.total_price || 0);
                            productPrice += price;

                            // Tambahkan ke total keseluruhan
                            totalQty += qty;
                            totalRevenue += price;
                        }
                    });
                } else {
                    // Untuk transaksi tanpa detail
                    const rootProductId = item.product_id || item.product?.id;

                    if (rootProductId === productId) {
                        hasProduct = true;
                        productNames.push(item.product?.product_name || item.product_name || "-");

                        const qty = item.total_qty || item.qty || 0;
                        productQty = qty;

                        const price = parsePrice(item.total_price || item.price || item.price_total || 0);
                        productPrice = price;

                        totalQty += qty;
                        totalRevenue += price;
                    }
                }

                // Jika transaksi mengandung product ini, tambahkan ke transactionsData
                if (hasProduct) {
                    // Get status info
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
                        detail: item.detail || [],
                        order_date: item.created_at || "-",
                        customer_name: item.customer_name || "-",
                        customer_email: item.customer_email || "-",
                        shipping_address: item.shipping_address || "-",
                        status_name: statusInfo.text, // Menggunakan helper function
                        payment_method: item.payment_method || "-",
                        notes: item.notes || "-",
                        product_id: productId,
                    };

                    transactionsData.push(transaction);
                }
            });

            console.log('Final calculations:', {
                totalQty,
                totalRevenue,
                transactionCount: transactionsData.length
            });

            // Update statistik
            setStatistics(prev => prev.map(stat => {
                if (stat.text === 'Total Terjual') {
                    return { ...stat, value: totalQty };
                }
                if (stat.text === 'Total Pendapatan') {
                    return { ...stat, value: totalRevenue };
                }
                return stat;
            }));

            // Set data transaksi
            setTransactions(transactionsData);
            setFilteredTransactions(transactionsData);

        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    // Handler untuk pencarian
    const handleSearch = (value: string) => {
        if (!value.trim()) {
            setFilteredTransactions(transactions);
            return;
        }

        const searchLower = value.toLowerCase();
        const filtered = transactions.filter(item =>
            item.invoice_no.toLowerCase().includes(searchLower) ||
            item.customer_name.toLowerCase().includes(searchLower) ||
            item.product_name.toLowerCase().includes(searchLower)
        );
        setFilteredTransactions(filtered);
    };

    // Kolom untuk tabel transaksi
    const transactionColumns: TableColumn[] = [
        {
            accessor: 'invoice_no',
            title: 'Invoice No',
            width: 150,
        },
        {
            accessor: 'order_date',
            title: 'Tanggal',
            width: 120,
            render: (item: any) => (
                <Text>{moment(item.order_date).format('DD/MM/YYYY')}</Text>
            )
        },
        {
            accessor: 'customer_name',
            title: 'Customer',
            width: 150,
        },
        {
            accessor: 'total_qty',
            title: 'Qty',
            width: 80,
            render: (item: any) => (
                <Text>{item.total_qty}</Text>
            )
        },
        {
            accessor: 'total_price',
            title: 'Total',
            width: 120,
            render: (item: any) => (
                <Text>{formatRupiah(item.total_price)}</Text>
            )
        },
        {
            accessor: 'status_name',
            title: 'Status',
            width: 120,
            render: (item: any) => {
                const statusInfo = getStatusInfo(item.transaction_status_id);
                return (
                    <Badge color={statusInfo.badgeColor}>
                        {statusInfo.text}
                    </Badge>
                );
            }
        },
        {
            accessor: 'payment_method',
            title: 'Payment Method',
            width: 130,
        },
    ];

    // Parse harga produk untuk ditampilkan
    const productPrice = data ? parsePrice(data.price) : 0;
    const maxTableHeight = 400; // Tinggi maksimal tabel sebelum scroll

    return (
        <Card p={30}>
            <Stack gap={30}>
                <Flex justify="space-between" gap={30}>
                    <AspectRatio ratio={1} maw={200} w="100%">
                        <Image
                            radius={10}
                            src={imageList?.[0]?.image_url}
                            bg="gray.1"
                            alt={data?.product_name}
                        />
                    </AspectRatio>

                    <Stack gap={0} w="100%">
                        <Text size="xs" c="gray" mb={5}>
                            Dibuat pada {moment(data?.created_at).format('DD MMMM YYYY')}
                        </Text>
                        <Flex gap={10} align="center">
                            <Title size="h2" >{data?.product_name}</Title>
                            <ActionIcon
                                variant="transparent"
                                title="Buka Halaman Merchandise"
                                onClick={() => window.open(`/merchandise/${slug}`, '_blank')}
                            >
                                <Icon icon="proicons:open" className={`text-[24px]`} />
                            </ActionIcon>
                        </Flex>
                        <Flex gap={8} align="center" mt={5}>
                            <Text fw={600}>
                                {formatRupiah(productPrice)}
                            </Text>
                            <Divider orientation="vertical" mx={10} />
                            <Icon icon="solar:star-bold" className={`text-yellow-500 text-[24px]`} />
                            <Text>{parseFloat(data?.average_star || "0").toFixed(1)}</Text>
                        </Flex>
                        <Text size="sm" mt={10} c="gray">
                            Total Terjual: {data?.total_sold || 0} unit
                        </Text>
                    </Stack>
                </Flex>

                <Accordion variant="separated" radius={10} defaultValue="1">
                    <Accordion.Item value="1">
                        <Accordion.Control>
                            <Flex gap={10} align="center">
                                <Icon icon="akar-icons:statistic-up" className={`text-primary-base`} />
                                <Text>Statistik Merchandise</Text>
                            </Flex>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <SimpleGrid cols={4}>
                                {statistics.map((statistic, index) => (
                                    <Card key={index} radius={10} withBorder pos='relative' className={`hover:!bg-grey/10`}>
                                        <Stack key={index} gap={0}>
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
                                                className={`absolute text-[5rem] -bottom-5 -right-2 text-primary-base/30`}
                                            />
                                        </Stack>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>

                <Tabs defaultValue="transaction">
                    <Tabs.List>
                        <Tabs.Tab value="transaction" leftSection={<Icon icon="fluent:money-16-regular" />}>
                            Transaksi ({filteredTransactions.length})
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="transaction">
                        <Box mt={10}>
                            <div>
                                <Text size="sm" c="gray" mb="md">
                                    Menampilkan {filteredTransactions.length} transaksi
                                </Text>

                                {/* Tabel dengan ScrollArea */}
                                <ScrollArea h={Math.min(maxTableHeight, filteredTransactions.length * 60 + 80)}>
                                    <Box style={{ overflowX: 'auto', minWidth: '100%' }}>
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            minWidth: '800px' // Lebar minimum untuk memastikan semua kolom terlihat
                                        }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                                    {transactionColumns.map((col, idx) => (
                                                        <th
                                                            key={idx}
                                                            style={{
                                                                padding: '12px',
                                                                textAlign: 'left',
                                                                borderBottom: '1px solid #dee2e6',
                                                                width: col.width ? `${col.width}px` : 'auto',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {col.title}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTransactions.map((item, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                        {transactionColumns.map((col, colIdx) => (
                                                            <td key={colIdx} style={{
                                                                padding: '12px',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {col.render ? col.render(item) : item[col.accessor]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Box>
                                </ScrollArea>

                                {filteredTransactions.length === 0 && (
                                    <Text ta="center" c="gray" mt="xl">
                                        Tidak ada data transaksi
                                    </Text>
                                )}

                                {/* Info scroll jika data banyak */}
                                {filteredTransactions.length > 5 && (
                                    <Text size="xs" c="gray" ta="center" mt="sm">
                                        Scroll untuk melihat lebih banyak data
                                    </Text>
                                )}
                            </div>
                        </Box>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Card>
    )
}