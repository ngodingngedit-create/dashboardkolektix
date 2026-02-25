// import { Icon } from "@iconify/react/dist/iconify.js";
// import { Box, Card, Container, Divider, Flex, Image, NumberFormatter, ScrollArea, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
// import _ from "lodash";
// import Link from "next/link";
// import { InvoiceResponse } from "./type";
// import { useEffect, useMemo, useState } from "react";
// import fetch from "@/utils/fetch";
// import { useListState } from "@mantine/hooks";
// import { useRouter } from "next/router";
// import { City, Province } from "../dashboard/profile/address";

// export default function Invoice() {
//   const [isClient, setIsClient] = useState(false);
//   const [data, setData] = useState<InvoiceResponse>();
//   const [loading, setLoading] = useListState<string>();
//   const router = useRouter();
//   const { invoice } = router.query;
//   const [city, setCity] = useState<City>();
//   const [province, setProvince] = useState<Province>();

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     getData();
//   }, [isClient, invoice]);

//   useEffect(() => {
//     getProvinceCity();
//   }, [data]);

//   const getData = async () => {
//     if (invoice) {
//       await fetch<any, InvoiceResponse>({
//         url: `order-product-invoice/${invoice}`,
//         method: "GET",
//         data: {},
//         before: () => setLoading.append("getdata"),
//         success: ({ data }) => {
//           if (data) {
//             setData(data);
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getdata"),
//         error: () => {},
//       });
//     }
//   };

//   const getProvinceCity = async () => {
//     if (!data?.address?.city_id || !data?.address?.province_id) return;

//     await fetch<any, City>({
//       url: `city/${data.address.city_id}`,
//       method: "GET",
//       success: ({ data: cityData }) => cityData && setCity(cityData),
//     });

//     await fetch<any, Province>({
//       url: `province/${data.address.province_id}`,
//       method: "GET",
//       success: ({ data: provinceData }) => provinceData && setProvince(provinceData),
//     });
//   };

//   const iconStatus: { [key: string]: string } = {
//     expired: "ooui:alert",
//     pending: "icon-park-solid:time",
//     verified: "uiw:circle-check",
//   };

//   const summaryPrice = useMemo(() => {
//     const admin = 2000;
//     const totalProductPrice = data?.detail.reduce((q, n) => q + (Boolean(n.product_varian_id) ? parseInt(n.variant.price) : parseInt(n.product.price)), 0);
//     const courier = parseInt(data?.courier?.price ?? "0");
//     const ppn = (courier + admin + (totalProductPrice ?? 0)) * 0.11;

//     return { ppn, admin, courier };
//   }, [data]);

//   // Fungsi untuk format date yang konsisten di server dan client
//   const formatDate = (dateString?: string): string => {
//     if (!dateString) return "-";

//     // Gunakan UTC time untuk konsistensi antara server dan client
//     const date = new Date(dateString);

//     // Format manual tanpa toLocaleString untuk menghindari timezone differences
//     const hours = date.getUTCHours().toString().padStart(2, "0");
//     const minutes = date.getUTCMinutes().toString().padStart(2, "0");

//     const day = date.getUTCDate().toString().padStart(2, "0");
//     const month = date.getUTCMonth();
//     const year = date.getUTCFullYear();

//     const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

//     return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
//   };

//   // Tampilkan loading jika masih di server
//   if (!isClient) {
//     return (
//       <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//         <Container px={0} className={`py-[44px] md:py-[100px]`}>
//           <Card p={0} radius={8} className={`!shadow-lg`}>
//             <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//               <Flex justify="center" align="center" h={200}>
//                 <Text>Memuat invoice...</Text>
//               </Flex>
//             </Card>
//           </Card>
//         </Container>
//       </div>
//     );
//   }

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <Container px={0} className={`py-[44px] md:py-[100px]`}>
//         <Card p={0} radius={8} className={`!shadow-lg`}>
//           <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//             <Stack gap={30}>
//               <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
//                 <Flex gap={15} align="center">
//                   <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
//                   <Stack gap={0}>
//                     <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
//                       Invoice Pesanan
//                     </Title>
//                     <Text size="sm">{invoice}</Text>
//                   </Stack>
//                 </Flex>

//                 <Stack gap={5} className={`items-start md:!items-end`}>
//                   <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
//                     <Flex align="center" gap={10}>
//                       <Text size="sm" c="gray.8">
//                         Status Pembayaran :
//                       </Text>
//                       <Flex gap={5} align="center">
//                         <Icon
//                           icon={iconStatus[data?.payment_status?.toLowerCase() ?? "pending"]}
//                           className={`
//                             text-[18px]
//                             ${data?.payment_status?.toLowerCase() == "expired" && "text-red-400"}
//                             ${data?.payment_status?.toLowerCase() == "pending" && "text-yellow-500"}
//                             ${data?.payment_status?.toLowerCase() == "verified" && "text-green-500"}
//                           `}
//                         />
//                         <Text size="md" fw={400}>
//                           {data?.payment_status?.toLowerCase() == "expired" && <>Expired</>}
//                           {data?.payment_status?.toLowerCase() == "pending" && <>Pending</>}
//                           {data?.payment_status?.toLowerCase() == "verified" && <>Berhasil</>}
//                         </Text>
//                       </Flex>
//                     </Flex>
//                   </Card>
//                 </Stack>
//               </Flex>
//             </Stack>
//           </Card>
//           <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
//               <Stack gap={10}>
//                 <Text fw={600} c="gray.8">
//                   Informasi Pemesan
//                 </Text>
//                 <Card withBorder>
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Nama Pemesan
//                       </Text>
//                       {/* Menggunakan nama penerima untuk nama pemesan */}
//                       <Text size="sm" fw={600}>
//                         {data?.address?.nama_penerima || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Kurir yang Dipilih
//                       </Text>
//                       <Text size="sm" className="capitalize">
//                         {data?.courier?.main || "-"} - {data?.courier?.type || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Tanggal Pesanan Dibuat
//                       </Text>
//                       <Text size="sm" suppressHydrationWarning>
//                         {formatDate(data?.created_at)}
//                       </Text>
//                     </Stack>
//                   </SimpleGrid>
//                 </Card>
//               </Stack>

//               <Stack gap={10} className={`md:max-w-[300px]`}>
//                 <Text fw={600} c="gray.8">
//                   Total Pembayaran
//                 </Text>
//                 <Card bg="gray.1">
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
//                     <Text size="xl" fw={600}>
//                       <NumberFormatter value={data?.grandtotal || 0} />
//                     </Text>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Metode Pembayaran
//                       </Text>
//                       <Text size="sm" className="capitalize">
//                         {data?.payment_method || "-"}
//                       </Text>
//                     </Stack>
//                     {data?.xendit_url && (
//                       <Link href={data.xendit_url} target="_blank">
//                         <Text size="xs" className={`hover:underline !text-primary-base`}>
//                           Buka Halaman Pembayaran
//                         </Text>
//                       </Link>
//                     )}
//                   </SimpleGrid>
//                 </Card>
//               </Stack>
//             </Flex>

//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack gap={10}>
//                 <Text fw={600} c="gray.8">
//                   Informasi Pengiriman
//                 </Text>
//                 <Card withBorder>
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Nama Penerima
//                       </Text>
//                       <Text size="sm" fw={600}>
//                         {data?.address?.nama_penerima || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         No. Telp Penerima
//                       </Text>
//                       <Text size="sm">{data?.address?.phone || "-"}</Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300} mb={5}>
//                         Alamat Pengiriman
//                       </Text>
//                       <Text size="xs">
//                         {province?.name || "-"}, {city?.name || "-"}, {data?.address?.zipcode || "-"}
//                       </Text>
//                       <Text size="xs">{data?.address?.address_detail || "-"}</Text>
//                     </Stack>
//                   </SimpleGrid>
//                 </Card>
//               </Stack>
//             </Flex>

//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack gap={10} className={`[&_*]:!text-[14px]`}>
//                 <Text fw={600} c="gray.8">
//                   Detail Pesanan
//                 </Text>
//                 <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
//                   <Table withRowBorders={false} horizontalSpacing="md" miw={600}>
//                     <Table.Thead>
//                       <Table.Tr>
//                         <Table.Th>No</Table.Th>
//                         <Table.Th>Produk</Table.Th>
//                         <Table.Th>Harga</Table.Th>
//                         <Table.Th>QTY</Table.Th>
//                         <Table.Th>Total</Table.Th>
//                       </Table.Tr>
//                     </Table.Thead>
//                     <Table.Tbody>
//                       {data?.detail?.map((e, i) => (
//                         <Table.Tr key={i}>
//                           <Table.Td>{i + 1}</Table.Td>
//                           <Table.Td>
//                             <Flex gap={15} className={`!py-[5px]`}>
//                               <Image src={e.product?.product_image?.[0]?.image_url || "#"} w={48} h={48} bg="gray.1" radius={5} className={`shrink-0`} />
//                               <Stack miw={400} gap={0}>
//                                 <Text>{e.product?.product_name || "-"}</Text>
//                                 {Boolean(e.product_varian_id) && (
//                                   <Text size="sm" c="gray.7">
//                                     Varian: {e.variant?.varian_name || "-"}
//                                   </Text>
//                                 )}
//                               </Stack>
//                             </Flex>
//                           </Table.Td>
//                           <Table.Td>
//                             <NumberFormatter value={parseInt(Boolean(e.product_varian_id) ? e.variant?.price || "0" : e.product?.price || "0")} />
//                           </Table.Td>
//                           <Table.Td>{e.qty || 0}</Table.Td>
//                           <Table.Td>
//                             <NumberFormatter value={parseInt(Boolean(e.product_varian_id) ? e.variant?.price || "0" : e.product?.price || "0") * (e.qty || 0)} />
//                           </Table.Td>
//                         </Table.Tr>
//                       ))}

//                       {/* Summary rows */}
//                       <Table.Tr>
//                         <Table.Td colSpan={3}></Table.Td>
//                         <Table.Td>
//                           <Text>Biaya Admin</Text>
//                         </Table.Td>
//                         <Table.Td>
//                           <Text>
//                             <NumberFormatter value={summaryPrice.admin} />
//                           </Text>
//                         </Table.Td>
//                       </Table.Tr>

//                       <Table.Tr className={`[&_*]:!font-[600]`}>
//                         <Table.Td colSpan={3}></Table.Td>
//                         <Table.Td>Total Pembayaran</Table.Td>
//                         <Table.Td>
//                           <NumberFormatter value={data?.grandtotal || 0} />
//                         </Table.Td>
//                       </Table.Tr>
//                     </Table.Tbody>
//                   </Table>
//                 </Box>
//               </Stack>
//             </Flex>
//           </Stack>
//         </Card>
//       </Container>
//     </div>
//   );
// }

import { Icon } from "@iconify/react/dist/iconify.js";
import { Box, Button, Card, Container, Divider, Flex, Image, NumberFormatter, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import Link from "next/link";
import { InvoiceResponse } from "./type";
import { useEffect, useMemo, useState } from "react";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import { useRouter } from "next/router";
import { City, Province } from "../dashboard/profile/address";

// Definisikan interface Product
interface Product {
  id: number;
  product_name: string;
  price: string;
  admin_fee?: string;
  fee?: string;
  admin?: string;
  adminFee?: string;
  application_fee?: string;
  service_fee?: string;
  product_image?: Array<{ id: number; image_url: string }>;
}

// Interface untuk response produk dari API dengan pagination
interface ProductResponse {
  data: Product[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function Invoice() {
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<InvoiceResponse>();
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useListState<string>();
  const [loadingDownload, setLoadingDownload] = useState(false);
  const router = useRouter();
  const { invoice } = router.query;
  const [city, setCity] = useState<City>();
  const [province, setProvince] = useState<Province>();

  // Default admin fee 5000 untuk fallback
  const DEFAULT_ADMIN_FEE = 5000;
  
  // State untuk tracking produk yang kena fallback
  const [fallbackProducts, setFallbackProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getData();
  }, [isClient, invoice]);

  useEffect(() => {
    if (data?.detail) {
      fetchAllProductsPaginated();
    }
  }, [data]);

  useEffect(() => {
    getProvinceCity();
  }, [data]);

  // Hitung fallback products setelah products berubah
  useEffect(() => {
    if (data?.detail && products.size > 0) {
      const newFallbackProducts = new Set<number>();
      
      data.detail.forEach(item => {
        const product = products.get(item.product_id);
        const productAny = product as any;
        
        // Jika produk tidak ditemukan atau tidak punya admin_fee, masukin ke fallback
        if (!product || !productAny.admin_fee) {
          newFallbackProducts.add(item.product_id);
        }
      });
      
      setFallbackProducts(newFallbackProducts);
      console.log("🎯 Fallback products:", Array.from(newFallbackProducts));
    }
  }, [data, products]);

  const fetchAllProductsPaginated = async () => {
    try {
      setLoading.append("fetchProducts");
      
      const productsMap = new Map<number, Product>();
      let currentPage = 1;
      let lastPage = 1;
      let hasMorePages = true;
      
      // Dapatkan semua product IDs yang perlu di-fetch
      const neededProductIds = new Set(data?.detail.map(item => item.product_id) || []);
      console.log("🔍 Need to fetch products:", Array.from(neededProductIds));
      
      // Loop untuk mengambil semua halaman
      while (hasMorePages) {
        console.log(`📦 Fetching products page ${currentPage}...`);
        
        await fetch<any, ProductResponse>({
          url: `product?page=${currentPage}`,
          method: "GET",
          success: ({ data: responseData }) => {
            console.log(`📄 Response page ${currentPage}:`, responseData);
            
            // Handle berbagai format response
            let productsData: Product[] = [];
            
            if (responseData?.data && Array.isArray(responseData.data)) {
              // Format: { data: [...], meta: { last_page: ... } }
              productsData = responseData.data;
              lastPage = responseData.meta?.last_page || responseData.last_page || 1;
              
              // Update hasMorePages berdasarkan lastPage
              if (currentPage >= lastPage) {
                hasMorePages = false;
              } else {
                currentPage++;
              }
            } else if (Array.isArray(responseData)) {
              // Format: langsung array
              productsData = responseData;
              // Jika response adalah array dan kosong, berhenti
              if (productsData.length === 0) {
                hasMorePages = false;
              } else {
                // Coba halaman berikutnya
                currentPage++;
              }
            } else {
              // Format tidak dikenal, berhenti
              hasMorePages = false;
            }
            
            // Masukkan semua produk dari halaman ini ke map
            productsData.forEach((product: Product) => {
              if (product?.id) {
                productsMap.set(product.id, product);
                
                // Log jika ini adalah produk yang kita butuhkan
                if (neededProductIds.has(product.id)) {
                  const productAny = product as any;
                  console.log(`✅ Found needed product ${product.id} on page ${currentPage-1}:`, {
                    id: product.id,
                    name: product.product_name,
                    admin_fee: productAny.admin_fee || 'NOT FOUND'
                  });
                }
              }
            });
            
            console.log(`📊 Page ${currentPage - 1}: Got ${productsData.length} products, total so far: ${productsMap.size}`);
            console.log(`🔄 Has more pages: ${hasMorePages}, current page: ${currentPage}, last page: ${lastPage}`);
          },
          error: (error) => {
            console.error(`❌ Error fetching page ${currentPage}:`, error);
            hasMorePages = false;
          }
        });
      }
      
      setProducts(productsMap);
      console.log("🎯 Total products fetched:", productsMap.size);
      
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading.filter((e) => e != "fetchProducts");
    }
  };

  const getProvinceCity = async () => {
    if (!data?.address?.city_id || !data?.address?.province_id) return;

    await fetch<any, City>({
      url: `city/${data.address.city_id}`,
      method: "GET",
      success: ({ data: cityData }) => cityData && setCity(cityData),
    });

    await fetch<any, Province>({
      url: `province/${data.address.province_id}`,
      method: "GET",
      success: ({ data: provinceData }) => provinceData && setProvince(provinceData),
    });
  };

  const getData = async () => {
    if (invoice) {
      await fetch<any, InvoiceResponse>({
        url: `order-product-invoice/${invoice}`,
        method: "GET",
        data: {},
        before: () => setLoading.append("getdata"),
        success: ({ data }) => {
          if (data) {
            setData(data);
            console.log("📋 Invoice Data:", data);
            console.log("📋 Detail items:", data.detail);
          }
        },
        complete: () => setLoading.filter((e) => e != "getdata"),
        error: () => {},
      });
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoice) return;
    
    setLoadingDownload(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_WS_URL;
      
      if (!apiUrl) {
        console.error('NEXT_PUBLIC_WS_URL is not defined');
        return;
      }

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      let downloadUrl;
      if (baseUrl.endsWith('/api')) {
        downloadUrl = `${baseUrl}/order-product/download/${invoice}`;
      } else if (baseUrl.endsWith('/api/')) {
        downloadUrl = `${baseUrl}order-product/download/${invoice}`;
      } else {
        downloadUrl = `${baseUrl}/api/order-product/download/${invoice}`;
      }
      
      console.log('Download URL:', downloadUrl);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setLoadingDownload(false);
    }
  };

  const iconStatus: { [key: string]: string } = {
    expired: "ooui:alert",
    pending: "icon-park-solid:time",
    verified: "uiw:circle-check",
  };

  // Fungsi pure untuk mendapatkan admin fee
  const getAdminFeeForItem = (item: any): number => {
    if (item.product_id && products.has(item.product_id)) {
      const product = products.get(item.product_id);
      const productAny = product as any;
      
      const adminFee = productAny.admin_fee || 
                       productAny.fee || 
                       productAny.admin || 
                       productAny.adminFee ||
                       productAny.application_fee ||
                       productAny.service_fee;
      
      if (adminFee) {
        const parsedFee = parseInt(adminFee);
        return isNaN(parsedFee) ? DEFAULT_ADMIN_FEE : parsedFee;
      }
    }
    
    return DEFAULT_ADMIN_FEE;
  };

  // Hitung total harga produk
  const totalProductPrice = useMemo(() => {
    const total = data?.detail.reduce((total, item) => {
      const price = item.product_varian_id 
        ? parseInt(item.variant?.price || "0") 
        : parseInt(item.product?.price || "0");
      return total + (price * (item.qty || 0));
    }, 0) || 0;
    
    return total;
  }, [data]);

  // Hitung total admin fee
  const totalAdminFee = useMemo(() => {
    const total = data?.detail.reduce((total, item) => {
      const adminFeePerItem = getAdminFeeForItem(item);
      return total + (adminFeePerItem * (item.qty || 0));
    }, 0) || 0;
    
    return total;
  }, [data, products]);

  // Grand total = total produk + total admin fee
  const grandTotal = useMemo(() => {
    return totalProductPrice + totalAdminFee;
  }, [totalProductPrice, totalAdminFee]);

  // Dapatkan daftar produk yang kena fallback
  const fallbackProductsList = useMemo(() => {
    if (!data?.detail) return [];
    return data.detail
      .filter(item => fallbackProducts.has(item.product_id))
      .map(item => ({
        id: item.product_id,
        name: item.product?.product_name || 'Unknown',
        qty: item.qty || 0
      }));
  }, [data, fallbackProducts]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
  };

  if (!isClient) {
    return (
      <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
        <Container px={0} className={`py-[44px] md:py-[100px]`}>
          <Card p={0} radius={8} className={`!shadow-lg`}>
            <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
              <Flex justify="center" align="center" h={200}>
                <Text>Memuat invoice...</Text>
              </Flex>
            </Card>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
      <Container px={0} className={`py-[44px] md:py-[100px]`}>
        <Card p={0} radius={8} className={`!shadow-lg`}>
          <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
            <Stack gap={30}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
                <Flex gap={15} align="center">
                  <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
                  <Stack gap={0}>
                    <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
                      Invoice Pesanan
                    </Title>
                    <Text size="sm">{invoice}</Text>
                  </Stack>
                </Flex>

                <Stack gap={5} className={`items-start md:!items-end`}>
                  <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
                    <Flex align="center" gap={10}>
                      <Text size="sm" c="gray.8">
                        Status Pembayaran :
                      </Text>
                      <Flex gap={5} align="center">
                        <Icon
                          icon={iconStatus[data?.payment_status?.toLowerCase() ?? "pending"]}
                          className={`
                            text-[18px]
                            ${data?.payment_status?.toLowerCase() == "expired" && "text-red-400"}
                            ${data?.payment_status?.toLowerCase() == "pending" && "text-yellow-500"}
                            ${data?.payment_status?.toLowerCase() == "verified" && "text-green-500"}
                          `}
                        />
                        <Text size="md" fw={400}>
                          {data?.payment_status?.toLowerCase() == "expired" && <>Expired</>}
                          {data?.payment_status?.toLowerCase() == "pending" && <>Pending</>}
                          {data?.payment_status?.toLowerCase() == "verified" && <>Berhasil</>}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Stack>
              </Flex>
            </Stack>
          </Card>
          <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
            <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
              <Stack gap={10}>
                <Text fw={600} c="gray.8">
                  Informasi Pemesan
                </Text>
                <Card withBorder>
                  <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Nama Pemesan
                      </Text>
                      <Text size="sm" fw={600}>
                        {data?.address?.nama_penerima || "-"}
                      </Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Kurir yang Dipilih
                      </Text>
                      <Text size="sm" className="capitalize">
                        {data?.courier?.main || "-"} - {data?.courier?.type || "-"}
                      </Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Tanggal Pesanan Dibuat
                      </Text>
                      <Text size="sm" suppressHydrationWarning>
                        {formatDate(data?.created_at)}
                      </Text>
                    </Stack>
                  </SimpleGrid>
                </Card>
              </Stack>

              <Stack gap={10} className={`md:max-w-[300px]`}>
                <Text fw={600} c="gray.8">
                  Total Pembayaran
                </Text>
                <Card bg="gray.1">
                  <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
                    <Text size="xl" fw={600}>
                      <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," />
                    </Text>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Metode Pembayaran
                      </Text>
                      <Text size="sm" className="capitalize">
                        {data?.payment_method || "-"}
                      </Text>
                    </Stack>
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<Icon icon="mdi:file-download-outline" />}
                      onClick={handleDownloadInvoice}
                      loading={loadingDownload}
                      size="sm"
                      fullWidth
                      disabled={!invoice}
                    >
                      Download Invoice Merch
                    </Button>
                    {data?.xendit_url && (
                      <Link href={data.xendit_url} target="_blank">
                        <Button
                          variant="light"
                          color="green"
                          leftSection={<Icon icon="mdi:external-link" />}
                          size="sm"
                          fullWidth
                        >
                          Buka Halaman Pembayaran
                        </Button>
                      </Link>
                    )}
                  </SimpleGrid>
                </Card>
              </Stack>
            </Flex>

            <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
              <Stack gap={10}>
                <Text fw={600} c="gray.8">
                  Informasi Pengiriman
                </Text>
                <Card withBorder>
                  <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Nama Penerima
                      </Text>
                      <Text size="sm" fw={600}>
                        {data?.address?.nama_penerima || "-"}
                      </Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        No. Telp Penerima
                      </Text>
                      <Text size="sm">{data?.address?.phone || "-"}</Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300} mb={5}>
                        Alamat Pengiriman
                      </Text>
                      <Text size="xs">
                        {province?.name || "-"}, {city?.name || "-"}, {data?.address?.zipcode || "-"}
                      </Text>
                      <Text size="xs">{data?.address?.address_detail || "-"}</Text>
                    </Stack>
                  </SimpleGrid>
                </Card>
              </Stack>
            </Flex>

            <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
              <Stack gap={10} className={`[&_*]:!text-[14px]`}>
                <Text fw={600} c="gray.8">
                  Detail Pesanan
                </Text>
                
                {/* Tampilkan peringatan jika ada produk yang kena fallback */}
                {fallbackProductsList.length > 0 && (
                  <Card withBorder bg="yellow.0" c="yellow.9" p="sm">
                    <Flex gap="xs" align="center">
                      <Icon icon="mdi:alert" />
                      <Box>
                        <Text fw={600} size="sm">Perhatian: Ada {fallbackProductsList.length} produk menggunakan admin fee default 5000</Text>
                        <Text size="xs">Produk: {fallbackProductsList.map(p => p.name).join(', ')}</Text>
                      </Box>
                    </Flex>
                  </Card>
                )}
                
                <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
                  <Table withRowBorders={false} horizontalSpacing="md" miw={600}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>No</Table.Th>
                        <Table.Th>Produk</Table.Th>
                        <Table.Th>Qty</Table.Th>
                        <Table.Th>Harga</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {data?.detail?.map((e, i) => {
                        const price = e.product_varian_id 
                          ? parseInt(e.variant?.price || "0") 
                          : parseInt(e.product?.price || "0");
                        
                        const qty = e.qty || 0;
                        
                        return (
                          <Table.Tr key={i}>
                            <Table.Td>{i + 1}</Table.Td>
                            <Table.Td>
                              <Flex gap={15} className={`!py-[5px]`}>
                                <Image 
                                  src={e.product?.product_image?.[0]?.image_url || "#"} 
                                  w={48} 
                                  h={48} 
                                  bg="gray.1" 
                                  radius={5} 
                                  className={`shrink-0`} 
                                />
                                <Stack gap={0}>
                                  <Text>{e.product?.product_name || "-"}</Text>
                                  {Boolean(e.product_varian_id) && (
                                    <Text size="sm" c="gray.7">
                                      Varian: {e.variant?.varian_name || "-"}
                                    </Text>
                                  )}
                                  {/* Menambahkan order_notes di bawah nama produk */}
                                  {e.order_notes && (
                                    <Text size="xs" c="dimmed" fs="italic" mt={4}>
                                      Catatan: {e.order_notes}
                                    </Text>
                                  )}
                                </Stack>
                              </Flex>
                            </Table.Td>
                            <Table.Td>{qty}</Table.Td>
                            <Table.Td>
                              <NumberFormatter value={price} thousandSeparator="." decimalSeparator="," />
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Box>

                {/* Summary Card */}
                <Card withBorder mt="md" bg="gray.0">
                  <Stack gap="xs">
                    <Flex justify="space-between">
                      <Text fw={500}>Subtotal Produk:</Text>
                      <Text fw={500}>
                        <NumberFormatter value={totalProductPrice} thousandSeparator="." decimalSeparator="," />
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fw={500}>Total Admin Fee:</Text>
                      <Text fw={500}>
                        <NumberFormatter value={totalAdminFee} thousandSeparator="." decimalSeparator="," />
                      </Text>
                    </Flex>
                    <Divider my="xs" />
                    <Flex justify="space-between">
                      <Text fw={700} size="lg">Total Pembayaran:</Text>
                      <Text fw={700} size="lg" c="blue">
                        <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," />
                      </Text>
                    </Flex>
                  </Stack>
                </Card>
              </Stack>
            </Flex>
          </Stack>
        </Card>
      </Container>
    </div>
  );
}