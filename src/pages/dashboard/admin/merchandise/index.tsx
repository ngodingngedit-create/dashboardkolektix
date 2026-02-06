// import CreateMerchandiseAdmin from "@/components/CreateMerchandiseAdmin";
// import { Delete, Post } from "@/utils/REST";
// import { Card, Center, NumberFormatter, Button as ButtonM, Title, Flex, ActionIcon, Switch, Group, Select } from "@mantine/core";
// import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
// import NextImage from "next/image";
// import React, { useEffect, useMemo, useState } from "react";
// import { modals } from "@mantine/modals";
// import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
// import merchIcon from "@/assets/svg/merch.svg";
// import Button from "@/components/Button";
// import _ from "lodash";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import Link from "next/link";
// import { Get } from "@/utils/REST";

// const PER_PAGE = 10;

// // Definisikan tipe untuk merchandise
// interface MerchListResponse {
//   id: number;
//   product_name?: string;
//   slug?: string;
//   product_status_id: number;
//   creator_id?: number;
//   price?: number;
//   qty?: number;
//   product_varian?: Array<{
//     sku?: string;
//     price?: number | string;
//     stock_qty?: number;
//   }>;
//   product_image?: Array<{
//     image_url?: string;
//   }>;
//   has_store_location?: {
//     store_name?: string;
//   };
//   has_creator?: {
//     id?: number;
//     name?: string;
//     username?: string;
//     email?: string;
//   };
//   created_at?: string;
//   date?: string;
// }

// // Tipe untuk creator dari API
// interface CreatorAPIResponse {
//   id: number;
//   user_id: string;
//   name: string;
//   image_url?: string;
//   email?: string;
//   phone_number?: string;
//   has_user?: {
//     id: number;
//     name: string;
//     email: string;
//     phone: string | null;
//   };
// }

// const Merch: React.FC = () => {
//   const [isRender, setIsRender] = useState(false);
//   const [modalCreate, setModalCreate] = useState<string | undefined>(undefined);
//   const [merchList, setMerchList] = useState<MerchListResponse[]>([]);
//   const [loading, setLoading] = useState<string[]>([]);
//   const [loading2, setLoading2] = useState<boolean>(false);
//   const [excelFile, setExcelFile] = useState<File | null>(null);

//   // State untuk creator
//   const [creators, setCreators] = useState<CreatorAPIResponse[]>([]);
//   const [selectedCreator, setSelectedCreator] = useState<string>("");
//   const [selectedCreatorForCreate, setSelectedCreatorForCreate] = useState<string>("");
//   const [tempSelectedCreator, setTempSelectedCreator] = useState<string>(""); // State untuk modal sementara

//   // pagination
//   const [page, setPage] = useState<number>(1);
//   const [lastPage, setLastPage] = useState<number>(1);

//   const tabStatus: [number, string][] = [
//     [2, "Sedang Dijual"],
//     [1, "Merchandise Draf"],
//     [3, "Non Aktif"],
//   ];

//   useEffect(() => {
//     setIsRender(true);
//   }, []);

//   useEffect(() => {
//     if (!isRender) return;
//     fetchData();
//     fetchCreators();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isRender, page]);

//   // Fetch daftar creator dari API
//   const fetchCreators = async () => {
//     try {
//       const res: any = await Get('creator', {}); // API endpoint: creator
//       if (res.data && Array.isArray(res.data)) {
//         setCreators(res.data);
//       }
//     } catch (err) {
//       console.error("Error fetching creators:", err);
//     }
//   };

//   // Fungsi untuk fetch data dengan filter
//   const fetchData = () => {
//     setLoading2(true);

//     const qs = new URLSearchParams({
//       per_page: String(PER_PAGE),
//       page: String(page),
//       ...(selectedCreator && { creator_id: selectedCreator }),
//       ...(search && { search: search }),
//       ...(startDate && { start_date: startDate }),
//       ...(endDate && { end_date: endDate }),
//     }).toString();

//     Get(`product?${qs}`, {})
//       .then((res: any) => {
//         if (res.data) {
//           console.log("Merchant data response:", res);

//           const products = Array.isArray(res.data) ? res.data : [];
//           const totalLastPage = res?.last_page ?? 1;

//           setMerchList(products);
//           setLastPage(totalLastPage);

//           console.log(`Showing page ${page} of ${totalLastPage} (${products.length} items)`);
//         } else {
//           console.warn("Response data is empty or undefined.");
//           setMerchList([]);
//           setLastPage(1);
//         }
//         setLoading2(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching merchant data:", err);
//         setMerchList([]);
//         setLastPage(1);
//         setLoading2(false);
//       });
//   };

//   // Fungsi untuk handle search/refresh
//   const handleSearch = () => {
//     setPage(1); // Reset ke halaman 1 saat search
//     fetchData();
//   };

//   // Fungsi untuk reset semua filter
//   const handleResetFilters = () => {
//     setSearch("");
//     setStartDate("");
//     setEndDate("");
//     setCategory("");
//     setMethod("");
//     setStatusFilter("");
//     setLocationFilter("");
//     setSelectedCreator("");
//     setPage(1);
//     fetchData();
//   };

//   const handleToggleStatus = async (id: number, status: boolean) => {
//     const item = merchList.find((p) => p.id === id);

//     if (!item) {
//       console.warn(`Toggle aborted: product id ${id} not found in current merchList`);
//       return;
//     }

//     setLoading((prev) => [...prev, "toggle-status"]);
//     try {
//       const res: any = await Post(`product_toggle_status/${id}`, {
//         status: status ? 2 : 3,
//         admin_override: true,
//       });

//       if (res?.status) {
//         setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
//       } else {
//         console.warn("Toggle API returned falsy status:", res);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading((prev) => prev.filter((s) => s !== "toggle-status"));
//     }
//   };

//   const handleDelete = (id: number) => {
//     const item = merchList.find((p) => p.id === id);
//     const itemName = item?.product_name || "produk ini";
    
//     modals.openConfirmModal({
//       centered: true,
//       title: "Hapus Produk?",
//       children: `Apakah anda yakin ingin menghapus produk "${itemName}"?`,
//       labels: { confirm: "Hapus", cancel: "Batal" },
//       confirmProps: { color: 'red' },
//       onConfirm: () => {
//         setLoading((prev) => [...prev, `delete${id}`]);
//         Delete(`product/${id}`, {
//           admin_override: true,
//         })
//           .then(() => {
//             setMerchList((prev) => prev.filter((e) => e.id !== id));
//           })
//           .catch((err) => {
//             console.error(err);
//           })
//           .finally(() => setLoading((prev) => prev.filter((s) => s !== `delete${id}`)));
//       },
//     });
//   };

//   const splittedByStatus = useMemo(() => {
//     return (status: number) => merchList.filter((e) => e.product_status_id === status);
//   }, [merchList]);

//   const openCreateModal = (slug?: string) => {
//     // Jika edit, langsung buka modal dengan creator yang sudah ada
//     if (slug) {
//       setModalCreate(slug);
//       return;
//     }
    
//     // Reset temporary selection
//     setTempSelectedCreator("");
    
//     // Jika create baru, tampilkan modal pilih creator dulu
//     modals.open({
//       title: "Pilih Creator",
//       centered: true,
//       children: (
//         <div className="py-4">
//           <p className="mb-4">Silakan pilih creator untuk membuat merchandise:</p>
//           <Select
//             label="Pilih Creator"
//             placeholder="Pilih creator"
//             data={creators.map(c => ({ 
//               value: String(c.id), 
//               label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}` 
//             }))}
//             value={tempSelectedCreator}
//             onChange={(value) => setTempSelectedCreator(value || "")}
//             required
//           />
//           <div className="flex justify-end gap-2 mt-6">
//             <ButtonM
//               variant="light"
//               color="gray"
//               onClick={() => modals.closeAll()}
//             >
//               Batal
//             </ButtonM>
//             <ButtonM
//               variant="filled"
//               color="#0B387C"
//               onClick={() => {
//                 if (tempSelectedCreator) {
//                   setSelectedCreatorForCreate(tempSelectedCreator);
//                   modals.closeAll();
//                   setTimeout(() => {
//                     setModalCreate(slug);
//                   }, 100);
//                 } else {
//                   alert("Silakan pilih creator terlebih dahulu");
//                 }
//               }}
//             >
//               Pilih
//             </ButtonM>
//           </div>
//         </div>
//       ),
//       onClose: () => {
//         setTempSelectedCreator("");
//       }
//     } as any);
//   };

//   const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (
//         file.type.includes("excel") ||
//         file.type.includes("spreadsheet") ||
//         file.name.endsWith(".xlsx") ||
//         file.name.endsWith(".xls") ||
//         file.name.endsWith(".csv")
//       ) {
//         setExcelFile(file);
        
//         // Reset temporary selection
//         setTempSelectedCreator("");
        
//         // Tampilkan pilihan creator
//         modals.open({
//           title: "Import Excel",
//           centered: true,
//           children: (
//             <div className="py-4">
//               <p className="mb-4">Import merchandise untuk:</p>
//               <Select
//                 label="Pilih Creator"
//                 placeholder="Pilih creator"
//                 data={[
//                   { value: "", label: "Semua Creator" },
//                   ...creators.map(c => ({ 
//                     value: String(c.id), 
//                     label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}` 
//                   }))
//                 ]}
//                 value={tempSelectedCreator}
//                 onChange={(value) => setTempSelectedCreator(value || "")}
//                 required
//               />
//               <p className="mt-4 text-sm text-gray-600">
//                 File: {file.name}
//               </p>
//               <div className="flex justify-end gap-2 mt-6">
//                 <ButtonM
//                   variant="light"
//                   color="gray"
//                   onClick={() => modals.closeAll()}
//                 >
//                   Batal
//                 </ButtonM>
//                 <ButtonM
//                   variant="filled"
//                   color="#0B387C"
//                   onClick={() => {
//                     // Upload ke API
//                     const formData = new FormData();
//                     formData.append("excel_file", file);
//                     if (tempSelectedCreator) {
//                       formData.append("creator_id", tempSelectedCreator);
//                       setSelectedCreatorForCreate(tempSelectedCreator);
//                     }
//                     formData.append("admin_import", "true");
                    
//                     alert(`File "${file.name}" akan diimport ${tempSelectedCreator ? 'untuk creator terpilih' : 'untuk semua creator'}.`);
//                     modals.closeAll();
//                   }}
//                 >
//                   Import
//                 </ButtonM>
//               </div>
//             </div>
//           ),
//         } as any);
//       } else {
//         alert("Silakan pilih file Excel (.xlsx, .xls, atau .csv)");
//       }
//     }
//     event.target.value = "";
//   };

//   /**
//    * FILTER & SEARCH STATE
//    */
//   const [startDate, setStartDate] = useState<string>("");
//   const [endDate, setEndDate] = useState<string>("");
//   const [category, setCategory] = useState<string>("");
//   const [method, setMethod] = useState<string>("");
//   const [statusFilter, setStatusFilter] = useState<string>("");
//   const [locationFilter, setLocationFilter] = useState<string>("");
//   const [search, setSearch] = useState<string>("");

//   const itemSearchText = (item: MerchListResponse) => {
//     const parts: string[] = [];
//     if (item.product_name) parts.push(String(item.product_name));
//     if (item.slug) parts.push(String(item.slug));
//     if (item.product_varian?.[0]?.sku) parts.push(String(item.product_varian[0].sku));
//     if (item.product_varian?.length) parts.push(item.product_varian.map((v: any) => String(v?.sku ?? "")).join(" "));
//     if (item.product_varian?.[0]?.price) parts.push(String(item.product_varian[0].price));
//     if (item.price) parts.push(String(item.price));
//     if (item.qty !== undefined) parts.push(String(item.qty));
//     if (item.product_status_id !== undefined) parts.push(String(item.product_status_id));
//     if (item.product_image?.length) parts.push(item.product_image.map((p: any) => String(p?.image_url ?? "")).join(" "));
//     if (item.has_store_location?.store_name) parts.push(String(item.has_store_location.store_name));
//     if (item.has_creator?.name) parts.push(String(item.has_creator.name));
//     if (item.has_creator?.username) parts.push(String(item.has_creator.username));
//     if (item.has_creator?.email) parts.push(String(item.has_creator.email));

//     return parts.join(" ").toLowerCase();
//   };

//   const filteredMap = useMemo(() => {
//     const map = new Map<number, MerchListResponse[]>();
//     for (const [status] of tabStatus) {
//       const baseList = splittedByStatus(status) || [];
//       const filtered = (baseList || []).filter((item) => {
//         if (startDate || endDate) {
//           const dateStr = (item as any).date || (item as any).created_at || "";
//           if (dateStr) {
//             const d = new Date(dateStr);
//             if (startDate) {
//               const s = new Date(startDate);
//               if (d < s) return false;
//             }
//             if (endDate) {
//               const e = new Date(endDate);
//               e.setHours(23, 59, 59, 999);
//               if (d > e) return false;
//             }
//           }
//         }

//         if (category) {
//           const catField = (item as any).category || (item as any).category_id || "";
//           if (!String(catField).toLowerCase().includes(category.toLowerCase())) return false;
//         }

//         if (method) {
//           const m = (item as any).payment_method || (item as any).method || "";
//           if (!String(m).toLowerCase().includes(method.toLowerCase())) return false;
//         }

//         if (statusFilter) {
//           if (statusFilter === "active" && item.product_status_id !== 2) return false;
//           if (statusFilter === "inactive" && item.product_status_id === 2) return false;
//         }

//         if (locationFilter) {
//           const itemLocation = item.has_store_location?.store_name || "";
//           if (!String(itemLocation).toLowerCase().includes(locationFilter.toLowerCase())) {
//             return false;
//           }
//         }

//         if (search) {
//           const needle = search.toLowerCase().trim();
//           if (!itemSearchText(item).includes(needle)) return false;
//         }

//         return true;
//       });

//       map.set(status, filtered);
//     }
//     return map;
//   }, [splittedByStatus, startDate, endDate, category, method, statusFilter, locationFilter, search, tabStatus]);

//   // Fungsi untuk mendapatkan nama creator dari ID
//   const getCreatorName = (creatorId?: number) => {
//     if (!creatorId) return "Unknown";
//     const creator = creators.find(c => c.id === creatorId);
//     return creator?.name || creator?.has_user?.name || "Unknown";
//   };

//   // Fungsi untuk mendapatkan email creator dari ID
//   const getCreatorEmail = (creatorId?: number) => {
//     if (!creatorId) return "";
//     const creator = creators.find(c => c.id === creatorId);
//     return creator?.has_user?.email || creator?.email || "";
//   };

//   return (
//     <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
//       {modalCreate !== undefined && (
//         <CreateMerchandiseAdmin
//           id={modalCreate}
//           creatorId={selectedCreatorForCreate}
//           onClose={() => {
//             setModalCreate(undefined);
//             setSelectedCreatorForCreate("");
//             setTempSelectedCreator("");
//             fetchData();
//           }}
//         />
//       )}

//       <input type="file" id="excel-import-input" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} style={{ display: "none" }} />

//       <div className="flex flex-wrap items-center justify-between gap-[20px]">
//         <div>
//           <Title order={1} size="h2">
//             Merchandise Management
//           </Title>
//           <p className="text-gray-600 text-sm mt-1">
//             {selectedCreator 
//               ? `Menampilkan merchandise untuk: ${getCreatorName(Number(selectedCreator))}` 
//               : "Menampilkan semua merchandise dari semua creator"}
//           </p>
//         </div>

//         <Flex gap={10} align="center">
//           <ButtonM 
//             onClick={() => openCreateModal("")} 
//             leftSection={<Icon icon="icon-park-outline:add-one" className="text-[24px]" />} 
//             radius="xl" 
//             color="#0B387C"
//           >
//             Buat Merchandise
//           </ButtonM>
//         </Flex>
//       </div>

//       {/* Filter Creator */}
//       <Card withBorder className="mb-4">
//         <div className="flex flex-col md:flex-row gap-4 items-center">
//           <div className="flex-1">
//             <Select
//               label="Filter berdasarkan Creator"
//               placeholder="Pilih creator"
//               data={[
//                 { value: "", label: "Semua Creator" },
//                 ...creators.map(c => ({ 
//                   value: String(c.id), 
//                   label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}` 
//                 }))
//               ]}
//               value={selectedCreator}
//               onChange={(value) => {
//                 setSelectedCreator(value || "");
//                 setPage(1);
//               }}
//               clearable
//               className="w-full"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <ButtonM
//               variant="filled"
//               color="#0B387C"
//               onClick={handleSearch}
//               leftSection={<Icon icon="akar-icons:search" className="text-base" />}
//               loading={loading2}
//             >
//               Cari
//             </ButtonM>
//             <ButtonM
//               variant="light"
//               color="gray"
//               onClick={handleResetFilters}
//               leftSection={<Icon icon="ph:arrow-counter-clockwise" className="text-base" />}
//             >
//               Reset Filter
//             </ButtonM>
//             <span className="text-sm text-gray-600">
//               Total: {creators.length} creator
//             </span>
//           </div>
//         </div>
//       </Card>

//       <Tabs
//         variant="solid"
//         aria-label="Tabs variants"
//         className="border-b-2 border-primary-light-200"
//         classNames={{
//           tabList: "pb-0 self-center font-semibold bg-white",
//           tab: "p-5",
//           cursor: "!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base",
//         }}
//       >
//         {tabStatus.map(([status, label]) => {
//           const filtered = filteredMap.get(status) ?? [];

//           return (
//             <Tab key={status} title={label}>
//               <Card className="!overflow-auto" p={0} withBorder>
//                 <div className="bg-white px-6 py-4 border-b">
//                   <div className="flex flex-col gap-4">
//                     {/* Baris 1: Filter Tanggal dan Creator */}
//                     <div className="flex flex-wrap items-center gap-4">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Tanggal:</span>
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="date"
//                             value={startDate}
//                             onChange={(e) => setStartDate(e.target.value)}
//                             className="border border-primary-light-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Mulai"
//                           />
//                           <span className="text-gray-400">-</span>
//                           <input
//                             type="date"
//                             value={endDate}
//                             onChange={(e) => setEndDate(e.target.value)}
//                             className="border border-primary-light-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Akhir"
//                           />
//                         </div>
//                       </div>

//                       <div className="w-px h-6 bg-gray-300"></div>

//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Creator:</span>
//                         <Select
//                           placeholder="Filter creator"
//                           data={creators.map(c => ({ 
//                             value: String(c.id), 
//                             label: c.name 
//                           }))}
//                           value={selectedCreator}
//                           onChange={(value) => {
//                             setSelectedCreator(value || "");
//                             setPage(1);
//                           }}
//                           className="min-w-[200px]"
//                           size="sm"
//                         />
//                       </div>
//                     </div>

//                     {/* Baris 2: Search dan Action Buttons */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <Input
//                           isClearable
//                           value={search}
//                           onChange={(e: any) => setSearch(e.target.value)}
//                           onClear={() => {
//                             setSearch("");
//                             setPage(1);
//                           }}
//                           placeholder="Cari merchandise..."
//                           className="min-w-[300px]"
//                           size="sm"
//                           startContent={<Icon icon="akar-icons:search" className="text-lg text-gray-400" />}
//                           classNames={{
//                             input: "text-sm py-2 pl-2",
//                           }}
//                         />
//                         <ButtonM
//                           variant="filled"
//                           color="#0B387C"
//                           onClick={handleSearch}
//                           leftSection={<Icon icon="akar-icons:search" className="text-base" />}
//                           loading={loading2}
//                           size="sm"
//                         >
//                           Cari
//                         </ButtonM>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <ButtonM
//                           size="sm"
//                           variant="filled"
//                           color="#0B387C"
//                           onClick={() => {
//                             document.getElementById("excel-import-input")?.click();
//                           }}
//                           leftSection={<Icon icon="ph:upload-simple" className="text-base" />}
//                           radius="xl"
//                         >
//                           Import Excel
//                         </ButtonM>

//                         <ButtonM
//                           size="sm"
//                           variant="light"
//                           color="gray"
//                           onClick={handleResetFilters}
//                           leftSection={<Icon icon="ph:arrow-counter-clockwise" className="text-base" />}
//                           radius="xl"
//                         >
//                           Reset Filter
//                         </ButtonM>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-[8px] overflow-hidden">
//                   <Table 
//                     removeWrapper 
//                     className="rounded-[8px] [&_td]:py-[15px] min-w-[900px]"
//                     aria-label="Table merchandise"
//                   >
//                     <TableHeader>
//                       <TableColumn>No</TableColumn>
//                       <TableColumn>Creator</TableColumn>
//                       <TableColumn>Info Produk</TableColumn>
//                       <TableColumn>SKU</TableColumn>
//                       <TableColumn>Harga</TableColumn>
//                       <TableColumn>Stock</TableColumn>
//                       <TableColumn>Lokasi</TableColumn>
//                       <TableColumn>Aksi</TableColumn>
//                     </TableHeader>

//                     <TableBody>
//                       {filtered.length === 0 ? (
//                         <TableRow>
//                           <TableCell><></></TableCell>
//                           <TableCell><></></TableCell>
//                           <TableCell><></></TableCell>
//                           <TableCell><></></TableCell>
//                           <TableCell><></></TableCell>
//                           <TableCell><></></TableCell>
//                           <TableCell><></></TableCell>
//                           <TableCell><></></TableCell>
//                         </TableRow>
//                       ) : (
//                         filtered.map((item, i) => {
//                           const safeId = String(item.id ?? i);
//                           const safeSlug = String(item.slug ?? "");
//                           const safeSku = String(item.product_varian?.[0]?.sku ?? "-");
//                           const safePriceRaw = String(item.product_varian?.[0]?.price ?? item.price ?? "0");
//                           const safePrice = parseInt(safePriceRaw === "" ? "0" : safePriceRaw, 10) || 0;
//                           const stock = item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty;
//                           const location = item.has_store_location?.store_name || "-";
//                           const creatorName = getCreatorName(item.creator_id);
//                           const creatorEmail = getCreatorEmail(item.creator_id);

//                           return (
//                             <TableRow key={safeId}>
//                               <TableCell className="whitespace-nowrap">{i + 1}</TableCell>

//                               <TableCell>
//                                 <div className="flex flex-col">
//                                   <span className="font-medium">{creatorName}</span>
//                                   {creatorEmail && (
//                                     <span className="text-xs text-gray-500">{creatorEmail}</span>
//                                   )}
//                                 </div>
//                               </TableCell>

//                               <TableCell>
//                                 <div className="flex items-center gap-[10px]">
//                                   <p>{String(item.product_name ?? "")}</p>
//                                 </div>
//                               </TableCell>

//                               <TableCell className="whitespace-nowrap">{safeSku || "-"}</TableCell>

//                               <TableCell className="whitespace-nowrap">
//                                 <NumberFormatter value={safePrice} prefix="Rp " />
//                               </TableCell>

//                               <TableCell>{stock ?? 0}</TableCell>

//                               <TableCell className="whitespace-nowrap">{String(location)}</TableCell>

//                               <TableCell>
//                                 <div className="flex items-center gap-[10px]">
//                                   <ActionIcon 
//                                     variant="transparent" 
//                                     onClick={() => handleToggleStatus(item.id, item.product_status_id !== 2)}
//                                     title={item.product_status_id === 2 ? "Nonaktifkan" : "Aktifkan"}
//                                   >
//                                     <Icon 
//                                       icon={item.product_status_id === 2 ? "mdi:toggle-switch" : "mdi:toggle-switch-off"} 
//                                       className={`text-[24px] ${item.product_status_id === 2 ? 'text-green-600' : 'text-gray-400'}`}
//                                     />
//                                   </ActionIcon>
//                                   <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${safeSlug}`}>
//                                     <Icon icon="akar-icons:eye" className="text-[24px]" />
//                                   </ActionIcon>
//                                   <ActionIcon variant="transparent" color="gray" onClick={() => openCreateModal(safeSlug)}>
//                                     <Icon icon="akar-icons:edit" className="text-[24px]" />
//                                   </ActionIcon>
//                                   <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id)}>
//                                     <Icon icon="uiw:delete" className="text-[18px]" />
//                                   </ActionIcon>
//                                 </div>
//                               </TableCell>
//                             </TableRow>
//                           );
//                         })
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>

//                 {filtered.length === 0 && (
//                   <Center mih={200} w="100%">
//                     <div className="py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full">
//                       <div className="border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2">
//                         <NextImage src={merchIcon} alt="merch" className="w-7" />
//                       </div>
//                       <div className="text-center">
//                         <p className="font-semibold text-lg">Belum ada merchandise</p>
//                         <p className="text-grey max-w-72 mt-[10px]">
//                           {selectedCreator 
//                             ? `${getCreatorName(Number(selectedCreator))} belum memiliki merchandise`
//                             : "Belum ada merchandise yang dibuat oleh creator manapun"
//                           }
//                         </p>
//                       </div>
//                       <Button 
//                         label="Buat Merchandise" 
//                         color="primary" 
//                         className="mt-4" 
//                         onClick={() => openCreateModal("")} 
//                         startIcon={faCirclePlus} 
//                       />
//                     </div>
//                   </Center>
//                 )}

//                 {filtered.length > 0 && (
//                   <div className="flex justify-center items-center gap-4 py-6">
//                     <ButtonM disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
//                       Sebelumnya
//                     </ButtonM>
//                     <span>
//                       Halaman {page} dari {lastPage}
//                     </span>
//                     <ButtonM disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
//                       Berikutnya
//                     </ButtonM>
//                   </div>
//                 )}
//               </Card>
//             </Tab>
//           );
//         })}
//       </Tabs>
//     </div>
//   );
// };

// export default Merch;

import CreateMerchandiseAdmin from "@/components/CreateMerchandiseAdmin";
import { Delete, Post } from "@/utils/REST";
import { Card, Center, NumberFormatter, Button as ButtonM, Title, Flex, ActionIcon, Switch, Group, Select, Modal } from "@mantine/core";
import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import NextImage from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { modals } from "@mantine/modals";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import merchIcon from "@/assets/svg/merch.svg";
import Button from "@/components/Button";
import _ from "lodash";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Get } from "@/utils/REST";

const PER_PAGE = 10;

// Definisikan tipe untuk merchandise
interface MerchListResponse {
  id: number;
  product_name?: string;
  slug?: string;
  product_status_id: number;
  creator_id?: number;
  price?: number;
  qty?: number;
  product_varian?: Array<{
    sku?: string;
    price?: number | string;
    stock_qty?: number;
  }>;
  product_image?: Array<{
    image_url?: string;
  }>;
  has_store_location?: {
    store_name?: string;
  };
  has_creator?: {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
  };
  created_at?: string;
  date?: string;
}

// Tipe untuk creator dari API
interface CreatorAPIResponse {
  id: number;
  user_id: string;
  name: string;
  image_url?: string;
  email?: string;
  phone_number?: string;
  has_user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

const Merch: React.FC = () => {
  const [isRender, setIsRender] = useState(false);
  const [modalCreate, setModalCreate] = useState<string | undefined>(undefined);
  const [merchList, setMerchList] = useState<MerchListResponse[]>([]);
  const [loading, setLoading] = useState<string[]>([]);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // State untuk creator
  const [creators, setCreators] = useState<CreatorAPIResponse[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [selectedCreatorForCreate, setSelectedCreatorForCreate] = useState<string>("");
  const [tempSelectedCreator, setTempSelectedCreator] = useState<string>("");
  
  // State untuk modal pilih creator
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const tabStatus: [number, string][] = [
    [2, "Sedang Dijual"],
    [1, "Merchandise Draf"],
    [3, "Non Aktif"],
  ];

  useEffect(() => {
    setIsRender(true);
  }, []);

  useEffect(() => {
    if (!isRender) return;
    fetchData();
    fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRender, page]);

  // Fetch daftar creator dari API
  const fetchCreators = async () => {
    try {
      const res: any = await Get('creator', {});
      if (res.data && Array.isArray(res.data)) {
        setCreators(res.data);
      }
    } catch (err) {
      console.error("Error fetching creators:", err);
    }
  };

  // Fungsi untuk fetch data dengan filter
  const fetchData = () => {
    setLoading2(true);

    const qs = new URLSearchParams({
      per_page: String(PER_PAGE),
      page: String(page),
      ...(selectedCreator && { creator_id: selectedCreator }),
      ...(search && { search: search }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    }).toString();

    Get(`product?${qs}`, {})
      .then((res: any) => {
        if (res.data) {
          const products = Array.isArray(res.data) ? res.data : [];
          const totalLastPage = res?.last_page ?? 1;

          setMerchList(products);
          setLastPage(totalLastPage);
        } else {
          console.warn("Response data is empty or undefined.");
          setMerchList([]);
          setLastPage(1);
        }
        setLoading2(false);
      })
      .catch((err) => {
        console.error("Error fetching merchant data:", err);
        setMerchList([]);
        setLastPage(1);
        setLoading2(false);
      });
  };

  // Fungsi untuk handle search/refresh
  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  // Fungsi untuk reset semua filter
  const handleResetFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setCategory("");
    setMethod("");
    setStatusFilter("");
    setLocationFilter("");
    setSelectedCreator("");
    setPage(1);
    fetchData();
  };

  const handleToggleStatus = async (id: number, status: boolean) => {
    const item = merchList.find((p) => p.id === id);

    if (!item) {
      console.warn(`Toggle aborted: product id ${id} not found in current merchList`);
      return;
    }

    setLoading((prev) => [...prev, "toggle-status"]);
    try {
      const res: any = await Post(`product_toggle_status/${id}`, {
        status: status ? 2 : 3,
        admin_override: true,
      });

      if (res?.status) {
        setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
      } else {
        console.warn("Toggle API returned falsy status:", res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => prev.filter((s) => s !== "toggle-status"));
    }
  };

  const handleDelete = (id: number) => {
    const item = merchList.find((p) => p.id === id);
    const itemName = item?.product_name || "produk ini";
    
    modals.openConfirmModal({
      centered: true,
      title: "Hapus Produk?",
      children: `Apakah anda yakin ingin menghapus produk "${itemName}"?`,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setLoading((prev) => [...prev, `delete${id}`]);
        Delete(`product/${id}`, {
          admin_override: true,
        })
          .then(() => {
            setMerchList((prev) => prev.filter((e) => e.id !== id));
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => setLoading((prev) => prev.filter((s) => s !== `delete${id}`)));
      },
    });
  };

  const splittedByStatus = useMemo(() => {
    return (status: number) => merchList.filter((e) => e.product_status_id === status);
  }, [merchList]);

  const openCreateModal = (slug?: string) => {
    // Jika edit, langsung buka modal dengan creator yang sudah ada
    if (slug) {
      setModalCreate(slug);
      return;
    }
    
    // Reset temporary selection dan tampilkan modal
    setTempSelectedCreator("");
    setShowCreatorModal(true);
  };

  const handleConfirmCreatorSelection = () => {
    if (!tempSelectedCreator) {
      alert("Silakan pilih creator terlebih dahulu");
      return;
    }
    
    setSelectedCreatorForCreate(tempSelectedCreator);
    setShowCreatorModal(false);
    
    // Buka modal create merchandise setelah delay singkat
    setTimeout(() => {
      setModalCreate("");
    }, 100);
  };

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type.includes("excel") ||
        file.type.includes("spreadsheet") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")
      ) {
        setExcelFile(file);
        
        // Tampilkan modal pilih creator untuk import
        modals.open({
          title: "Import Excel",
          centered: true,
          children: (
            <div className="py-4">
              <p className="mb-4">Import merchandise untuk:</p>
              <Select
                label="Pilih Creator"
                placeholder="Pilih creator"
                data={[
                  { value: "", label: "Semua Creator" },
                  ...creators.map(c => ({ 
                    value: String(c.id), 
                    label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}` 
                  }))
                ]}
                value={tempSelectedCreator}
                onChange={(value) => setTempSelectedCreator(value || "")}
                required
              />
              <p className="mt-4 text-sm text-gray-600">
                File: {file.name}
              </p>
              <div className="flex justify-end gap-2 mt-6">
                <ButtonM
                  variant="light"
                  color="gray"
                  onClick={() => modals.closeAll()}
                >
                  Batal
                </ButtonM>
                <ButtonM
                  variant="filled"
                  color="#0B387C"
                  onClick={() => {
                    // Upload ke API
                    const formData = new FormData();
                    formData.append("excel_file", file);
                    if (tempSelectedCreator) {
                      formData.append("creator_id", tempSelectedCreator);
                    }
                    formData.append("admin_import", "true");
                    
                    // Implementasi upload API di sini
                    console.log("Importing file:", file.name, "for creator:", tempSelectedCreator);
                    alert(`File "${file.name}" akan diimport ${tempSelectedCreator ? 'untuk creator terpilih' : 'untuk semua creator'}.`);
                    modals.closeAll();
                  }}
                >
                  Import
                </ButtonM>
              </div>
            </div>
          ),
        } as any);
      } else {
        alert("Silakan pilih file Excel (.xlsx, .xls, atau .csv)");
      }
    }
    event.target.value = "";
  };

  /**
   * FILTER & SEARCH STATE
   */
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const itemSearchText = (item: MerchListResponse) => {
    const parts: string[] = [];
    if (item.product_name) parts.push(String(item.product_name));
    if (item.slug) parts.push(String(item.slug));
    if (item.product_varian?.[0]?.sku) parts.push(String(item.product_varian[0].sku));
    if (item.product_varian?.length) parts.push(item.product_varian.map((v: any) => String(v?.sku ?? "")).join(" "));
    if (item.product_varian?.[0]?.price) parts.push(String(item.product_varian[0].price));
    if (item.price) parts.push(String(item.price));
    if (item.qty !== undefined) parts.push(String(item.qty));
    if (item.product_status_id !== undefined) parts.push(String(item.product_status_id));
    if (item.product_image?.length) parts.push(item.product_image.map((p: any) => String(p?.image_url ?? "")).join(" "));
    if (item.has_store_location?.store_name) parts.push(String(item.has_store_location.store_name));
    if (item.has_creator?.name) parts.push(String(item.has_creator.name));
    if (item.has_creator?.username) parts.push(String(item.has_creator.username));
    if (item.has_creator?.email) parts.push(String(item.has_creator.email));

    return parts.join(" ").toLowerCase();
  };

  const filteredMap = useMemo(() => {
    const map = new Map<number, MerchListResponse[]>();
    for (const [status] of tabStatus) {
      const baseList = splittedByStatus(status) || [];
      const filtered = (baseList || []).filter((item) => {
        if (startDate || endDate) {
          const dateStr = (item as any).date || (item as any).created_at || "";
          if (dateStr) {
            const d = new Date(dateStr);
            if (startDate) {
              const s = new Date(startDate);
              if (d < s) return false;
            }
            if (endDate) {
              const e = new Date(endDate);
              e.setHours(23, 59, 59, 999);
              if (d > e) return false;
            }
          }
        }

        if (category) {
          const catField = (item as any).category || (item as any).category_id || "";
          if (!String(catField).toLowerCase().includes(category.toLowerCase())) return false;
        }

        if (method) {
          const m = (item as any).payment_method || (item as any).method || "";
          if (!String(m).toLowerCase().includes(method.toLowerCase())) return false;
        }

        if (statusFilter) {
          if (statusFilter === "active" && item.product_status_id !== 2) return false;
          if (statusFilter === "inactive" && item.product_status_id === 2) return false;
        }

        if (locationFilter) {
          const itemLocation = item.has_store_location?.store_name || "";
          if (!String(itemLocation).toLowerCase().includes(locationFilter.toLowerCase())) {
            return false;
          }
        }

        if (search) {
          const needle = search.toLowerCase().trim();
          if (!itemSearchText(item).includes(needle)) return false;
        }

        return true;
      });

      map.set(status, filtered);
    }
    return map;
  }, [splittedByStatus, startDate, endDate, category, method, statusFilter, locationFilter, search, tabStatus]);

  // Fungsi untuk mendapatkan nama creator dari ID
  const getCreatorName = (creatorId?: number) => {
    if (!creatorId) return "Unknown";
    const creator = creators.find(c => c.id === creatorId);
    return creator?.name || creator?.has_user?.name || "Unknown";
  };

  // Fungsi untuk mendapatkan email creator dari ID
  const getCreatorEmail = (creatorId?: number) => {
    if (!creatorId) return "";
    const creator = creators.find(c => c.id === creatorId);
    return creator?.has_user?.email || creator?.email || "";
  };

  return (
    <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
      {modalCreate !== undefined && (
        <CreateMerchandiseAdmin
          id={modalCreate}
          creatorId={selectedCreatorForCreate}
          onClose={() => {
            setModalCreate(undefined);
            setSelectedCreatorForCreate("");
            setTempSelectedCreator("");
            fetchData();
          }}
        />
      )}

      {/* Modal Pilih Creator */}
      <Modal
        opened={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        title="Pilih Creator"
        centered
      >
        <div className="py-4">
          <p className="mb-4">Silakan pilih creator untuk membuat merchandise:</p>
          <Select
            label="Pilih Creator"
            placeholder="Pilih creator"
            data={creators.map(c => ({ 
              value: String(c.id), 
              label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}` 
            }))}
            value={tempSelectedCreator}
            onChange={(value) => setTempSelectedCreator(value || "")}
            required
          />
          <div className="flex justify-end gap-2 mt-6">
            <ButtonM
              variant="light"
              color="gray"
              onClick={() => setShowCreatorModal(false)}
            >
              Batal
            </ButtonM>
            <ButtonM
              variant="filled"
              color="#0B387C"
              disabled={!tempSelectedCreator}
              onClick={handleConfirmCreatorSelection}
            >
              Lanjut
            </ButtonM>
          </div>
        </div>
      </Modal>

      <input type="file" id="excel-import-input" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} style={{ display: "none" }} />

      <div className="flex flex-wrap items-center justify-between gap-[20px]">
        <div>
          <Title order={1} size="h2">
            Merchandise Management
          </Title>
          <p className="text-gray-600 text-sm mt-1">
            {selectedCreator 
              ? `Menampilkan merchandise untuk: ${getCreatorName(Number(selectedCreator))}` 
              : "Menampilkan semua merchandise dari semua creator"}
          </p>
        </div>

        <Flex gap={10} align="center">
          <ButtonM 
            onClick={() => openCreateModal("")} 
            leftSection={<Icon icon="icon-park-outline:add-one" className="text-[24px]" />} 
            radius="xl" 
            color="#0B387C"
          >
            Buat Merchandise
          </ButtonM>
        </Flex>
      </div>

      {/* Filter Creator */}
      <Card withBorder className="mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <Select
              label="Filter berdasarkan Creator"
              placeholder="Pilih creator"
              data={[
                { value: "", label: "Semua Creator" },
                ...creators.map(c => ({ 
                  value: String(c.id), 
                  label: `${c.name}${c.has_user?.email ? ` - ${c.has_user.email}` : ''}` 
                }))
              ]}
              value={selectedCreator}
              onChange={(value) => {
                setSelectedCreator(value || "");
                setPage(1);
              }}
              clearable
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <ButtonM
              variant="filled"
              color="#0B387C"
              onClick={handleSearch}
              leftSection={<Icon icon="akar-icons:search" className="text-base" />}
              loading={loading2}
            >
              Cari
            </ButtonM>
            <ButtonM
              variant="light"
              color="gray"
              onClick={handleResetFilters}
              leftSection={<Icon icon="ph:arrow-counter-clockwise" className="text-base" />}
            >
              Reset Filter
            </ButtonM>
            <span className="text-sm text-gray-600">
              Total: {creators.length} creator
            </span>
          </div>
        </div>
      </Card>

      <Tabs
        variant="solid"
        aria-label="Tabs variants"
        className="border-b-2 border-primary-light-200"
        classNames={{
          tabList: "pb-0 self-center font-semibold bg-white",
          tab: "p-5",
          cursor: "!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base",
        }}
      >
        {tabStatus.map(([status, label]) => {
          const filtered = filteredMap.get(status) ?? [];

          return (
            <Tab key={status} title={label}>
              <Card className="!overflow-auto" p={0} withBorder>
                <div className="bg-white px-6 py-4 border-b">
                  <div className="flex flex-col gap-4">
                    {/* Baris 1: Filter Tanggal dan Creator */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Tanggal:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-primary-light-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mulai"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-primary-light-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Akhir"
                          />
                        </div>
                      </div>

                      <div className="w-px h-6 bg-gray-300"></div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Creator:</span>
                        <Select
                          placeholder="Filter creator"
                          data={creators.map(c => ({ 
                            value: String(c.id), 
                            label: c.name 
                          }))}
                          value={selectedCreator}
                          onChange={(value) => {
                            setSelectedCreator(value || "");
                            setPage(1);
                          }}
                          className="min-w-[200px]"
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Baris 2: Search dan Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Input
                          isClearable
                          value={search}
                          onChange={(e: any) => setSearch(e.target.value)}
                          onClear={() => {
                            setSearch("");
                            setPage(1);
                          }}
                          placeholder="Cari merchandise..."
                          className="min-w-[300px]"
                          size="sm"
                          startContent={<Icon icon="akar-icons:search" className="text-lg text-gray-400" />}
                          classNames={{
                            input: "text-sm py-2 pl-2",
                          }}
                        />
                        <ButtonM
                          variant="filled"
                          color="#0B387C"
                          onClick={handleSearch}
                          leftSection={<Icon icon="akar-icons:search" className="text-base" />}
                          loading={loading2}
                          size="sm"
                        >
                          Cari
                        </ButtonM>
                      </div>

                      <div className="flex items-center gap-2">
                        <ButtonM
                          size="sm"
                          variant="filled"
                          color="#0B387C"
                          onClick={() => {
                            document.getElementById("excel-import-input")?.click();
                          }}
                          leftSection={<Icon icon="ph:upload-simple" className="text-base" />}
                          radius="xl"
                        >
                          Import Excel
                        </ButtonM>

                        <ButtonM
                          size="sm"
                          variant="light"
                          color="gray"
                          onClick={handleResetFilters}
                          leftSection={<Icon icon="ph:arrow-counter-clockwise" className="text-base" />}
                          radius="xl"
                        >
                          Reset Filter
                        </ButtonM>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[8px] overflow-hidden">
                  <Table 
                    removeWrapper 
                    className="rounded-[8px] [&_td]:py-[15px] min-w-[900px]"
                    aria-label="Table merchandise"
                  >
                    <TableHeader>
                      <TableColumn>No</TableColumn>
                      <TableColumn>Creator</TableColumn>
                      <TableColumn>Info Produk</TableColumn>
                      <TableColumn>SKU</TableColumn>
                      <TableColumn>Harga</TableColumn>
                      <TableColumn>Stock</TableColumn>
                      <TableColumn>Lokasi</TableColumn>
                      <TableColumn>Aksi</TableColumn>
                    </TableHeader>

                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell><></></TableCell>
                          <TableCell><></></TableCell>
                          <TableCell><></></TableCell>
                          <TableCell><></></TableCell>
                          <TableCell><></></TableCell>
                          <TableCell><></></TableCell>
                          <TableCell><></></TableCell>
                          <TableCell><></></TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((item, i) => {
                          const safeId = String(item.id ?? i);
                          const safeSlug = String(item.slug ?? "");
                          const safeSku = String(item.product_varian?.[0]?.sku ?? "-");
                          const safePriceRaw = String(item.product_varian?.[0]?.price ?? item.price ?? "0");
                          const safePrice = parseInt(safePriceRaw === "" ? "0" : safePriceRaw, 10) || 0;
                          const stock = item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty;
                          const location = item.has_store_location?.store_name || "-";
                          const creatorName = getCreatorName(item.creator_id);
                          const creatorEmail = getCreatorEmail(item.creator_id);

                          return (
                            <TableRow key={safeId}>
                              <TableCell className="whitespace-nowrap">{i + 1}</TableCell>

                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{creatorName}</span>
                                  {creatorEmail && (
                                    <span className="text-xs text-gray-500">{creatorEmail}</span>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-[10px]">
                                  <p>{String(item.product_name ?? "")}</p>
                                </div>
                              </TableCell>

                              <TableCell className="whitespace-nowrap">{safeSku || "-"}</TableCell>

                              <TableCell className="whitespace-nowrap">
                                <NumberFormatter value={safePrice} prefix="Rp " />
                              </TableCell>

                              <TableCell>{stock ?? 0}</TableCell>

                              <TableCell className="whitespace-nowrap">{String(location)}</TableCell>

                              <TableCell>
                                <div className="flex items-center gap-[10px]">
                                  <ActionIcon 
                                    variant="transparent" 
                                    onClick={() => handleToggleStatus(item.id, item.product_status_id !== 2)}
                                    title={item.product_status_id === 2 ? "Nonaktifkan" : "Aktifkan"}
                                  >
                                    <Icon 
                                      icon={item.product_status_id === 2 ? "mdi:toggle-switch" : "mdi:toggle-switch-off"} 
                                      className={`text-[24px] ${item.product_status_id === 2 ? 'text-green-600' : 'text-gray-400'}`}
                                    />
                                  </ActionIcon>
                                  <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${safeSlug}`}>
                                    <Icon icon="akar-icons:eye" className="text-[24px]" />
                                  </ActionIcon>
                                  <ActionIcon variant="transparent" color="gray" onClick={() => openCreateModal(safeSlug)}>
                                    <Icon icon="akar-icons:edit" className="text-[24px]" />
                                  </ActionIcon>
                                  <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id)}>
                                    <Icon icon="uiw:delete" className="text-[18px]" />
                                  </ActionIcon>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filtered.length === 0 && (
                  <Center mih={200} w="100%">
                    <div className="py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full">
                      <div className="border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2">
                        <NextImage src={merchIcon} alt="merch" className="w-7" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-lg">Belum ada merchandise</p>
                        <p className="text-grey max-w-72 mt-[10px]">
                          {selectedCreator 
                            ? `${getCreatorName(Number(selectedCreator))} belum memiliki merchandise`
                            : "Belum ada merchandise yang dibuat oleh creator manapun"
                          }
                        </p>
                      </div>
                      <Button 
                        label="Buat Merchandise" 
                        color="primary" 
                        className="mt-4" 
                        onClick={() => openCreateModal("")} 
                        startIcon={faCirclePlus} 
                      />
                    </div>
                  </Center>
                )}

                {filtered.length > 0 && (
                  <div className="flex justify-center items-center gap-4 py-6">
                    <ButtonM disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Sebelumnya
                    </ButtonM>
                    <span>
                      Halaman {page} dari {lastPage}
                    </span>
                    <ButtonM disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
                      Berikutnya
                    </ButtonM>
                  </div>
                )}
              </Card>
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Merch;