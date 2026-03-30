// // app/merch-pickup/index.tsx
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableColumn,
//   TableHeader,
//   TableRow,
//   Input,
//   Pagination,
//   Button,
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Card,
//   Divider,
//   Chip
// } from "@nextui-org/react";
// import { Get } from "@/utils/REST";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faDownload, faSearch, faBoxOpen, faQrcode } from "@fortawesome/free-solid-svg-icons";
// import { Icon } from "@iconify/react";
// import useLoggedUser from "@/utils/useLoggedUser";

// interface MerchandiseTransactionData {
//   id: number;
//   invoice_no?: string;
//   product_name?: string;
//   sku?: number | string;
//   total_qty?: number;
//   total_price?: number | string;
//   transaction_status_id?: number;
//   voucher?: number | string;
//   creator_id?: number;
//   creator_name?: string;
//   detail?: any[];
//   order_date?: string;
//   customer_name?: string;
//   customer_email?: string;
//   status_name?: string;
//   payment_method?: string;
// }

// const MerchPickupPage: React.FC = () => {
//   const user = useLoggedUser();
//   const [data, setData] = useState<MerchandiseTransactionData[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(10);
//   const [filterValue, setFilterValue] = useState<string>("");
//   const [page, setPage] = useState<number>(1);
  
//   // Modal states
//   const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
//   const [selectedTransaction, setSelectedTransaction] = useState<MerchandiseTransactionData | null>(null);
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

//   const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setFilterValue(e.target.value);
//     setPage(1);
//   }, []);

//   const getStatusInfo = (statusId?: number) => {
//     switch (statusId) {
//       case 1:
//         return {
//           text: "Pending",
//           color: "bg-yellow-100 text-yellow-800 border-yellow-200",
//         };
//       case 2:
//         return {
//           text: "Success",
//           color: "bg-green-100 text-green-800 border-green-200",
//         };
//       case 3:
//         return {
//           text: "Failed",
//           color: "bg-red-100 text-red-800 border-red-200",
//         };
//       case 4:
//         return {
//           text: "Expired",
//           color: "bg-gray-100 text-gray-800 border-gray-200",
//         };
//       default:
//         return {
//           text: "Unknown",
//           color: "bg-gray-100 text-gray-800 border-gray-200",
//         };
//     }
//   };

//   // Fungsi untuk mengambil SKU dari item
//   const getSkuFromItem = (item: any): string => {
//     // Prioritas 1: Dari detail produk pertama
//     if (Array.isArray(item.detail) && item.detail.length > 0) {
//       // Cek semua detail
//       for (const d of item.detail) {
//         if (d?.product?.sku && d.product.sku !== "0.000000" && d.product.sku !== "0") {
//           return d.product.sku;
//         } else if (d?.sku && d.sku !== "0.000000" && d.sku !== "0") {
//           return d.sku;
//         } else if (d?.variant?.sku) {
//           return d.variant.sku;
//         }
//       }
//     }
    
//     // Prioritas 2: Dari level atas product
//     if (item?.product?.sku && item.product.sku !== "0.000000" && item.product.sku !== "0") {
//       return item.product.sku;
//     }
    
//     // Prioritas 3: Dari level atas
//     if (item?.sku && item.sku !== "0.000000" && item.sku !== "0") {
//       return item.sku;
//     }
    
//     return "-";
//   };

//   const getData = async () => {
//     setLoading(true);
//     try {
//       const res: any = await Get("order-bycreator", {});
//       const creatorId = user?.has_creator?.id;
//       let filteredData = res?.data || [];

//       if (creatorId) {
//         filteredData = filteredData.filter((item: any) => {
//           const itemCreatorId = item.creator_id ||
//             item.creator?.id ||
//             (item.user_id ? parseInt(item.user_id) : null);
//           return itemCreatorId === creatorId;
//         });
//       }

//       // Urutkan data berdasarkan tanggal order (dari yang terbaru)
//       filteredData.sort((a: any, b: any) => {
//         const dateA = new Date(a.created_at || a.order_date || 0);
//         const dateB = new Date(b.created_at || b.order_date || 0);
//         return dateB.getTime() - dateA.getTime(); // Descending (terbaru dulu)
//       });

//       const mapped: MerchandiseTransactionData[] = filteredData.map((item: any) => {
//         const productNames: string[] = [];
        
//         // Ambil data produk dari detail
//         if (Array.isArray(item.detail) && item.detail.length > 0) {
//           item.detail.forEach((d: any) => {
//             if (d?.product?.product_name) {
//               productNames.push(d.product.product_name);
//             } else if (d?.product_name) {
//               productNames.push(d.product_name);
//             } else if (d?.product?.name) {
//               productNames.push(d.product.name);
//             }
//           });
//         }

//         // Jika detail kosong, coba ambil dari level atas
//         if (productNames.length === 0) {
//           if (item?.product?.product_name) {
//             productNames.push(item.product.product_name);
//           } else if (item?.product_name) {
//             productNames.push(item.product_name);
//           }
//         }

//         const productName = productNames.length > 0 ? productNames.join(" | ") : "-";
//         const sku = getSkuFromItem(item);
        
//         let creatorId = 0;
//         let creatorName = user?.has_creator?.name || "Creator";

//         if (item.creator?.id) {
//           creatorId = item.creator.id;
//           creatorName = item.creator.name || item.creator.username || item.creator.email || creatorName;
//         } else if (item.creator_id) {
//           creatorId = item.creator_id;
//         }

//         // Ambil customer data dari user atau shipping address
//         let customerName = "-";
//         let customerEmail = "-";
        
//         if (item.user?.name || item.user?.email) {
//           customerName = item.user.name || customerName;
//           customerEmail = item.user.email || customerEmail;
//         } else if (item.address?.nama_penerima) {
//           customerName = item.address.nama_penerima;
//         }

//         return {
//           id: item.id || 0,
//           invoice_no: item.invoice_no || "-",
//           product_name: productName,
//           sku: sku,
//           total_qty: item.total_qty || 0,
//           total_price: item.total_price || 0,
//           transaction_status_id: item.transaction_status_id || 0,
//           voucher: item.voucher || "-",
//           creator_id: creatorId,
//           creator_name: creatorName,
//           detail: item.detail || [],
//           order_date: item.created_at || "-",
//           customer_name: customerName,
//           customer_email: customerEmail,
//           status_name: item.transaction_status?.name || "-",
//           payment_method: item.payment_method || "-",
//         };
//       });

//       setData(mapped);
//       setError(null);
//     } catch (err: any) {
//       setError(err?.message ?? "Failed to fetch data");
//       console.error("Error fetching pickup data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   const filtered = useMemo(() => {
//     let result = data;
    
//     // Filter by search
//     if (filterValue) {
//       const searchLower = filterValue.toLowerCase();
//       result = result.filter((item) => 
//         (item.invoice_no ?? "").toString().toLowerCase().includes(searchLower) ||
//         (item.customer_name ?? "").toLowerCase().includes(searchLower) ||
//         (item.product_name ?? "").toLowerCase().includes(searchLower) ||
//         (item.sku ?? "").toString().toLowerCase().includes(searchLower)
//       );
//     }
    
//     return result;
//   }, [data, filterValue]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
//   const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//   const handleOpenScanModal = () => {
//     setIsScanModalOpen(true);
//   };

//   const handleScanWithCamera = () => {
//     window.open(`/dashboard/merch-pickup/scan-camera`, '_self');
//   };

//   const handleScanWithBarcode = () => {
//     window.open(`/dashboard/merch-pickup/scan-barcode`, '_self');
//   };

//   const handleViewDetail = (transaction: MerchandiseTransactionData) => {
//     setSelectedTransaction(transaction);
//     setIsDetailModalOpen(true);
//   };

//   const handleCloseScanModal = () => {
//     setIsScanModalOpen(false);
//   };

//   const handleCloseDetailModal = () => {
//     setIsDetailModalOpen(false);
//     setSelectedTransaction(null);
//   };

//   const formatCurrency = (amount?: number | string) => {
//     const num = Number(amount) || 0;
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0
//     }).format(num);
//   };

//   const formatDate = (dateString?: string) => {
//     if (!dateString || dateString === "-") return "-";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('id-ID', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (e) {
//       return dateString;
//     }
//   };

//   const exportToCSV = (rows: MerchandiseTransactionData[]) => {
//     if (!rows || rows.length === 0) {
//       alert("Tidak ada data untuk di-export");
//       return;
//     }

//     const headers = ["Invoice Number", "Nama Customer", "Email", "Nama Produk", "SKU", "Total Qty", "Total Price", "Status", "Tanggal Order", "Payment Method"];
    
//     const escapeCell = (value: any) => {
//       if (value === null || value === undefined) return "";
//       const str = String(value);
//       const needsQuotes = /[,"\n]/.test(str);
//       const escaped = str.replace(/"/g, '""');
//       return needsQuotes ? `"${escaped}"` : escaped;
//     };

//     const lines = rows.map((r) =>
//       [
//         escapeCell(r.invoice_no),
//         escapeCell(r.customer_name),
//         escapeCell(r.customer_email),
//         escapeCell(r.product_name),
//         escapeCell(r.sku),
//         escapeCell(r.total_qty),
//         escapeCell(r.total_price),
//         escapeCell(getStatusInfo(r.transaction_status_id).text),
//         escapeCell(formatDate(r.order_date)),
//         escapeCell(r.payment_method)
//       ].join(",")
//     );

//     const csvContent = headers.join(",") + "\n" + lines.join("\n");
    
//     try {
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//       a.href = url;
//       a.download = `merch-pickup-${timestamp}.csv`;
//       a.style.display = "none";
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (e) {
//       const win = window.open();
//       if (win) {
//         win.document.write(`<pre>${csvContent}</pre>`);
//         win.document.close();
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         <span className="ml-3 text-gray-600">Loading pickup data...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-red-100 rounded-full">
//             <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <div>
//             <h3 className="font-semibold text-red-700">Error Loading Data</h3>
//             <p className="text-red-600 mt-1">{error}</p>
//             <button 
//               onClick={getData}
//               className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6">
//       {/* Header Section */}
//       <div className="mb-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
//               <FontAwesomeIcon icon={faBoxOpen} className="text-white text-xl" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">Merchandise Pickup</h1>
//               <p className="text-gray-600 mt-1">Manajemen pengambilan merchandise oleh customer</p>
//             </div>
//           </div>
          
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//               <span className="text-sm font-medium text-blue-800">
//                 Total Transaksi: {filtered.length}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search and Action Section */}
//       <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-6 gap-4">
//         <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
//           <Button
//             color="primary"
//             startContent={<Icon icon="mdi:qrcode-scan" width={20} height={20} />}
//             onClick={handleOpenScanModal}
//             className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:shadow-md transition-shadow"
//             size="lg"
//           >
//             Scan QR/Barcode
//           </Button>
          
//           <div className="relative flex-1 md:w-96">
//             <Input
//               type="text"
//               placeholder="Cari invoice, nama customer, produk, atau SKU..."
//               value={filterValue}
//               onChange={onSearchChange}
//               startContent={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
//               classNames={{
//                 input: "pl-10",
//                 inputWrapper: "h-12 bg-white border-gray-300 hover:border-blue-400"
//               }}
//               size="lg"
//             />
//             {filterValue && (
//               <button
//                 onClick={() => setFilterValue("")}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               >
//                 ✕
//               </button>
//             )}
//           </div>
//         </div>
        
//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
//           <button
//             onClick={() => exportToCSV(filtered)}
//             disabled={filtered.length === 0}
//             className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
//               filtered.length === 0 
//                 ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
//                 : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm hover:shadow-md"
//             }`}
//           >
//             <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
//             <span>Export ({filtered.length})</span>
//           </button>
          
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
//             <select
//               value={rowsPerPage}
//               onChange={(e) => {
//                 setRowsPerPage(Number(e.target.value));
//                 setPage(1);
//               }}
//               className="border border-gray-300 rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value={10}>10 rows</option>
//               <option value={25}>25 rows</option>
//               <option value={50}>50 rows</option>
//               <option value={100}>100 rows</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Table Section */}
//       <Card className="p-0 shadow-sm border border-gray-200 overflow-hidden">
//         {filtered.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
//               <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 text-3xl" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-700 mb-2">
//               {filterValue ? "Tidak ditemukan" : "Belum ada data pickup"}
//             </h3>
//             <p className="text-gray-500 mb-4 max-w-md mx-auto">
//               {filterValue 
//                 ? `Tidak ada transaksi yang cocok dengan "${filterValue}"`
//                 : "Mulai dengan memindai QR code untuk proses pickup"}
//             </p>
//             {filterValue && (
//               <button
//                 onClick={() => setFilterValue("")}
//                 className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
//               >
//                 Clear search
//               </button>
//             )}
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <Table
//                 aria-label="Merchandise Pickup Table"
//                 classNames={{
//                   base: "min-w-full",
//                   th: "bg-gray-50 text-gray-700 font-semibold text-sm uppercase border-b border-gray-200 py-4 px-4",
//                   td: "border-b border-gray-100 py-4 px-4",
//                   tr: "hover:bg-gray-50 transition-colors"
//                 }}
//                 removeWrapper
//               >
//                 <TableHeader>
//                   <TableColumn width={60} className="text-center">NO</TableColumn>
//                   <TableColumn>INVOICE NUMBER</TableColumn>
//                   <TableColumn>NAMA CUSTOMER</TableColumn>
//                   <TableColumn>NAMA PRODUK</TableColumn>
//                   <TableColumn>SKU</TableColumn>
//                   <TableColumn width={100} className="text-center">QTY</TableColumn>
//                   <TableColumn width={120} className="text-center">STATUS</TableColumn>
//                   <TableColumn width={150}>TANGGAL ORDER</TableColumn>
//                   <TableColumn width={80} className="text-center">ACTIONS</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   {paginatedItems.map((item, index) => {
//                     const statusInfo = getStatusInfo(item.transaction_status_id);
                    
//                     return (
//                       <TableRow key={item.id}>
//                         <TableCell className="text-center text-gray-500">
//                           {(page - 1) * rowsPerPage + index + 1}
//                         </TableCell>
//                         <TableCell>
//                           <div className="font-medium text-gray-800">{item.invoice_no}</div>
//                           <div className="text-xs text-gray-500 mt-0.5">
//                             {item.payment_method || "N/A"}
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="font-medium">{item.customer_name}</div>
//                           <div className="text-xs text-gray-500 truncate max-w-[200px]">
//                             {item.customer_email}
//                           </div>
//                         </TableCell>
//                         <TableCell className="max-w-[200px]">
//                           <div className="truncate" title={item.product_name}>
//                             {item.product_name}
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
//                             {item.sku || "-"}
//                           </span>
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-medium">
//                             {item.total_qty}
//                           </span>
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
//                             {statusInfo.text}
//                           </span>
//                         </TableCell>
//                         <TableCell>
//                           <div className="text-sm">
//                             {formatDate(item.order_date)}
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <button
//                             onClick={() => handleViewDetail(item)}
//                             className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
//                             title="View details"
//                           >
//                             <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
//                           </button>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </div>
            
//             {/* Table Footer with Pagination */}
//             <div className="p-4 border-t border-gray-200 bg-gray-50">
//               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//                 <div className="text-sm text-gray-600">
//                   Showing <span className="font-semibold">{Math.min(filtered.length, (page - 1) * rowsPerPage + 1)}</span> to{" "}
//                   <span className="font-semibold">{Math.min(page * rowsPerPage, filtered.length)}</span> of{" "}
//                   <span className="font-semibold">{filtered.length}</span> entries
//                   {filterValue && (
//                     <span className="ml-2 text-blue-600">
//                       (filtered from {data.length} total)
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <Pagination
//                     page={page}
//                     total={totalPages}
//                     onChange={setPage}
//                     showControls
//                     size="sm"
//                     classNames={{
//                       cursor: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
//                       item: "text-gray-700 hover:text-blue-600",
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </Card>

//       {/* Modal Scan Options */}
//       <Modal
//         isOpen={isScanModalOpen}
//         onClose={handleCloseScanModal}
//         size="lg"
//         backdrop="blur"
//         classNames={{
//           base: "bg-gradient-to-b from-gray-50 to-white",
//           backdrop: "backdrop-blur-sm",
//           header: "border-b-0 pb-0",
//           footer: "border-t-0",
//         }}
//       >
//         <ModalContent>
//           {() => (
//             <>
//               <ModalHeader className="flex flex-col gap-1 pt-6">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
//                     <Icon icon="mdi:qrcode-scan" width={24} height={24} className="text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">Proses Pengambilan Merchandise</h2>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Pilih metode scan untuk memverifikasi pengambilan merchandise
//                     </p>
//                   </div>
//                 </div>
//               </ModalHeader>
//               <ModalBody className="py-6">
//                 <div className="space-y-4">
//                   {/* Scan with Camera */}
//                   <div 
//                     className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group active:scale-[0.98]"
//                     onClick={handleScanWithCamera}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
//                         <Icon icon="mdi:camera" width={28} height={28} className="text-blue-600" />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-gray-800 group-hover:text-blue-700">Scan dengan Kamera</h3>
//                         <p className="text-sm text-gray-600 mt-1">Scan kode QR menggunakan kamera perangkat Anda</p>
//                       </div>
//                       <div className="p-2">
//                         <Icon icon="mdi:chevron-right" width={20} height={20} className="text-gray-400 group-hover:text-blue-500" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Scan with Scanner Device */}
//                   <div 
//                     className="p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group active:scale-[0.98]"
//                     onClick={handleScanWithBarcode}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg group-hover:from-green-200 group-hover:to-green-300 transition-colors">
//                         <Icon icon="mdi:barcode-scan" width={28} height={28} className="text-green-600" />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-gray-800 group-hover:text-green-700">Scan dengan Scanner</h3>
//                         <p className="text-sm text-gray-600 mt-1">Scan kode QR menggunakan perangkat scanner barcode</p>
//                       </div>
//                       <div className="p-2">
//                         <Icon icon="mdi:chevron-right" width={20} height={20} className="text-gray-400 group-hover:text-green-500" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </ModalBody>
//               <ModalFooter className="pb-6">
//                 <Button 
//                   color="default" 
//                   variant="light" 
//                   onPress={handleCloseScanModal}
//                   className="text-gray-600 hover:text-gray-800"
//                 >
//                   Batal
//                 </Button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>

//       {/* Detail Transaction Modal */}
//       <Modal
//         isOpen={isDetailModalOpen}
//         onClose={handleCloseDetailModal}
//         size="2xl"
//         backdrop="blur"
//         scrollBehavior="inside"
//         classNames={{
//           base: "bg-gradient-to-b from-gray-50 to-white",
//           backdrop: "backdrop-blur-sm",
//           header: "border-b-0",
//           footer: "border-t-0",
//         }}
//       >
//         <ModalContent>
//           {() => (
//             <>
//               <ModalHeader className="flex flex-col gap-1 pt-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <FontAwesomeIcon icon={faBoxOpen} className="text-blue-600" />
//                     </div>
//                     <div>
//                       <h2 className="text-xl font-bold text-gray-800">Detail Transaksi Merchandise</h2>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Informasi lengkap transaksi untuk verifikasi pickup
//                       </p>
//                     </div>
//                   </div>
//                   {selectedTransaction && (
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedTransaction.transaction_status_id).color}`}>
//                       {getStatusInfo(selectedTransaction.transaction_status_id).text}
//                     </span>
//                   )}
//                 </div>
//               </ModalHeader>
//               <ModalBody className="py-6">
//                 {selectedTransaction && (
//                   <div className="space-y-6">
//                     {/* Basic Info Grid */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div className="bg-white border border-gray-200 rounded-lg p-4">
//                         <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
//                         <p className="font-medium text-lg text-gray-800">{selectedTransaction.invoice_no}</p>
//                       </div>
//                       <div className="bg-white border border-gray-200 rounded-lg p-4">
//                         <p className="text-sm text-gray-500 mb-1">Tanggal Order</p>
//                         <p className="font-medium text-gray-800">{formatDate(selectedTransaction.order_date)}</p>
//                       </div>
//                       <div className="bg-white border border-gray-200 rounded-lg p-4">
//                         <p className="text-sm text-gray-500 mb-1">Customer Name</p>
//                         <p className="font-medium text-gray-800">{selectedTransaction.customer_name}</p>
//                       </div>
//                       <div className="bg-white border border-gray-200 rounded-lg p-4">
//                         <p className="text-sm text-gray-500 mb-1">Customer Email</p>
//                         <p className="font-medium text-gray-800 truncate">{selectedTransaction.customer_email}</p>
//                       </div>
//                     </div>

//                     {/* Product Info */}
//                     <div className="bg-white border border-gray-200 rounded-lg p-5">
//                       <h3 className="font-semibold text-gray-800 mb-4">Informasi Produk</h3>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Nama Produk</p>
//                           <p className="font-medium text-gray-800">{selectedTransaction.product_name}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">SKU</p>
//                           <p className="font-medium font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block">
//                             {selectedTransaction.sku || "-"}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Quantity</p>
//                           <p className="font-medium text-gray-800">
//                             <span className="text-blue-600 text-xl">{selectedTransaction.total_qty}</span> item
//                           </p>
//                         </div>
//                       </div>
//                       <div className="mt-4 pt-4 border-t">
//                         <p className="text-sm text-gray-500 mb-1">Total Harga</p>
//                         <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedTransaction.total_price)}</p>
//                       </div>
//                     </div>

//                     {/* Detail Items */}
//                     {selectedTransaction.detail && selectedTransaction.detail.length > 0 && (
//                       <div className="bg-white border border-gray-200 rounded-lg p-5">
//                         <h3 className="font-semibold text-gray-800 mb-4">Detail Items ({selectedTransaction.detail.length})</h3>
//                         <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
//                           {selectedTransaction.detail.map((item: any, index: number) => (
//                             <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
//                               <div className="flex-1">
//                                 <p className="font-medium text-gray-800">
//                                   {item.product?.product_name || item.product_name || item.product?.name || `Item ${index + 1}`}
//                                 </p>
//                                 <div className="flex items-center gap-4 mt-2">
//                                   <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
//                                     SKU: {item.product?.sku || item.sku || "-"}
//                                   </span>
//                                   <span className="text-xs text-gray-500">Qty: {item.quantity || item.qty || 0}</span>
//                                   <span className="text-xs text-gray-500">
//                                     Harga: {formatCurrency(item.price || item.product?.price || item.variant?.price)}
//                                   </span>
//                                 </div>
//                               </div>
//                               <div className="text-right">
//                                 <p className="font-semibold text-gray-800">
//                                   {formatCurrency((item.quantity || item.qty || 0) * (Number(item.price) || Number(item.product?.price) || Number(item.variant?.price) || 0))}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-0.5">Subtotal</p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Payment Info */}
//                     <div className="bg-white border border-gray-200 rounded-lg p-5">
//                       <h3 className="font-semibold text-gray-800 mb-4">Informasi Pembayaran</h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Metode Pembayaran</p>
//                           <p className="font-medium text-gray-800">{selectedTransaction.payment_method || "-"}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Status Transaksi</p>
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedTransaction.transaction_status_id).color}`}>
//                             {getStatusInfo(selectedTransaction.transaction_status_id).text}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </ModalBody>
//               <ModalFooter className="pb-6">
//                 <div className="flex flex-col sm:flex-row gap-3 w-full">
//                   <Button
//                     color="default"
//                     variant="light"
//                     onPress={handleCloseDetailModal}
//                     className="flex-1 sm:flex-none"
//                   >
//                     Tutup
//                   </Button>
//                   <div className="flex gap-3">
//                     <Button
//                       color="primary"
//                       variant="solid"
//                       onPress={() => {
//                         handleCloseDetailModal();
//                         handleOpenScanModal();
//                       }}
//                       className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
//                       startContent={<Icon icon="mdi:qrcode-scan" width={16} height={16} />}
//                     >
//                       Proses Pengambilan
//                     </Button>
//                   </div>
//                 </div>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// };

// export default MerchPickupPage;

// app/merch-pickup/index.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Input,
  Pagination,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  Divider,
  Chip
} from "@nextui-org/react";
import {
  Flex,
  Group,
  Select as MantineSelect,
  TextInput as MantineTextInput,
  Button as MantineButton,
  ActionIcon,
  NumberFormatter,
  Text,
  Box,
  Badge,
  Tooltip,
  Pagination as MantinePagination,
  Stack,
  Card as MantineCard,
  Divider as MantineDivider
} from "@mantine/core";
import { Get } from "@/utils/REST";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faSearch, faBoxOpen, faQrcode, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react";
import useLoggedUser from "@/utils/useLoggedUser";

interface MerchandiseTransactionData {
  id: number;
  invoice_no?: string;
  product_name?: string;
  sku?: number | string;
  total_qty?: number;
  total_price?: number | string;
  transaction_status_id?: number;
  voucher?: number | string;
  creator_id?: number;
  creator_name?: string;
  detail?: any[];
  order_date?: string;
  customer_name?: string;
  customer_email?: string;
  status_name?: string;
  payment_method?: string;
  isAvailable?: boolean; // Flag untuk menandai data yang tersedia
}

const MerchPickupPage: React.FC = () => {
  const user = useLoggedUser();
  const [data, setData] = useState<MerchandiseTransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filterValue, setFilterValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Modal states
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<MerchandiseTransactionData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setPage(1);
  }, []);

  const getStatusInfo = (statusId?: number) => {
    switch (statusId) {
      case 1:
        return {
          text: "Pending",
          color: "bg-yellow-100 text-yellow-800 border-primary-light-200",
        };
      case 2:
        return {
          text: "Success",
          color: "bg-green-100 text-green-800 border-primary-light-200",
        };
      case 3:
        return {
          text: "Failed",
          color: "bg-red-100 text-red-800 border-primary-light-200",
        };
      case 4:
        return {
          text: "Expired",
          color: "bg-gray-100 text-gray-800 border-primary-light-200",
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-100 text-gray-800 border-primary-light-200",
        };
    }
  };

  // Fungsi untuk mengambil SKU dari item
  const getSkuFromItem = (item: any): string => {
    if (!item) return "-";
    
    // Prioritas 1: Dari detail produk pertama
    if (Array.isArray(item.detail) && item.detail.length > 0) {
      // Cek semua detail
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
    
    // Prioritas 2: Dari level atas product
    if (item?.product?.sku && item.product.sku !== "0.000000" && item.product.sku !== "0") {
      return item.product.sku;
    }
    
    // Prioritas 3: Dari level atas
    if (item?.sku && item.sku !== "0.000000" && item.sku !== "0") {
      return item.sku;
    }
    
    return "-";
  };

  const validateAndMapData = (item: any): MerchandiseTransactionData | null => {
    // Validasi apakah data memiliki informasi minimal
    if (!item) return null;
    
    try {
      // Cek apakah data memiliki invoice atau ID
      if (!item.id && !item.invoice_no) {
        console.warn("Data tidak valid: tidak memiliki ID atau invoice_no", item);
        return null;
      }
      
      const productNames: string[] = [];
      
      // Ambil data produk dari detail
      if (Array.isArray(item.detail) && item.detail.length > 0) {
        item.detail.forEach((d: any) => {
          if (d?.product?.product_name) {
            productNames.push(d.product.product_name);
          } else if (d?.product_name) {
            productNames.push(d.product_name);
          } else if (d?.product?.name) {
            productNames.push(d.product.name);
          }
        });
      }

      // Jika detail kosong, coba ambil dari level atas
      if (productNames.length === 0) {
        if (item?.product?.product_name) {
          productNames.push(item.product.product_name);
        } else if (item?.product_name) {
          productNames.push(item.product_name);
        } else if (item?.product?.name) {
          productNames.push(item.product.name);
        }
      }

      const productName = productNames.length > 0 ? productNames.join(" | ") : "Produk tidak tersedia";
      const sku = getSkuFromItem(item);
      
      let creatorId = 0;
      let creatorName = user?.has_creator?.name || "Creator";

      if (item.creator?.id) {
        creatorId = item.creator.id;
        creatorName = item.creator.name || item.creator.username || item.creator.email || creatorName;
      } else if (item.creator_id) {
        creatorId = item.creator_id;
      }

      // Ambil customer data dari user atau shipping address
      let customerName = "Customer tidak tersedia";
      let customerEmail = "-";
      
      if (item.user?.name || item.user?.email) {
        customerName = item.user.name || customerName;
        customerEmail = item.user.email || customerEmail;
      } else if (item.address?.nama_penerima) {
        customerName = item.address.nama_penerima;
      }

      return {
        id: item.id || 0,
        invoice_no: item.invoice_no || `INV-${item.id || "UNKNOWN"}`,
        product_name: productName,
        sku: sku,
        total_qty: item.total_qty || 0,
        total_price: item.total_price || 0,
        transaction_status_id: item.transaction_status_id || 0,
        voucher: item.voucher || "-",
        creator_id: creatorId,
        creator_name: creatorName,
        detail: item.detail || [],
        order_date: item.created_at || "-",
        customer_name: customerName,
        customer_email: customerEmail,
        status_name: item.transaction_status?.name || "-",
        payment_method: item.payment_method || "-",
        isAvailable: true // Data valid
      };
    } catch (error) {
      console.error("Error mapping data:", error, item);
      return null;
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
          const itemCreatorId = item.creator_id ||
            item.creator?.id ||
            (item.user_id ? parseInt(item.user_id) : null);
          return itemCreatorId === creatorId;
        });
      }

      // Filter dan mapping data
      const mapped: MerchandiseTransactionData[] = filteredData
        .map((item: any) => validateAndMapData(item))
        .filter((item: MerchandiseTransactionData | null): item is MerchandiseTransactionData => item !== null);

      // Data yang tidak valid akan ditambahkan dengan informasi khusus
      const unavailableItems: MerchandiseTransactionData[] = [];
      
      // Jika ada data yang gagal dimapping, tambahkan placeholder
      if (filteredData.length > mapped.length) {
        // Temukan data yang gagal dimapping
        filteredData.forEach((item: any) => {
          const mappedItem = mapped.find(m => m.id === item.id);
          if (!mappedItem && item.id) {
            unavailableItems.push({
              id: item.id,
              invoice_no: `Data tidak tersedia (ID: ${item.id})`,
              product_name: "Data invoice tidak tersedia",
              sku: "-",
              total_qty: 0,
              total_price: 0,
              transaction_status_id: 3, // Failed status
              voucher: "-",
              creator_id: creatorId || 0,
              creator_name: "Unknown",
              detail: [],
              order_date: "-",
              customer_name: "Customer tidak tersedia",
              customer_email: "-",
              status_name: "Data Error",
              payment_method: "-",
              isAvailable: false // Data tidak tersedia
            });
          }
        });
      }

      // Gabungkan data yang valid dan yang tidak tersedia
      const allData = [...mapped, ...unavailableItems];
      
      // Urutkan data berdasarkan tanggal order (dari yang terbaru)
      allData.sort((a: any, b: any) => {
        const dateA = new Date(a.order_date || 0);
        const dateB = new Date(b.order_date || 0);
        return dateB.getTime() - dateA.getTime(); // Descending (terbaru dulu)
      });

      setData(allData);
      
      // Jika ada data yang tidak tersedia, tampilkan info warning
      if (unavailableItems.length > 0) {
        setError(`Beberapa data (${unavailableItems.length} item) tidak tersedia karena error 404`);
      }
      
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Jika 404, tetap tampilkan UI tapi dengan data placeholder
        const placeholderData: MerchandiseTransactionData[] = [
          {
            id: 1,
            invoice_no: "Tidak ada data invoice",
            product_name: "Data tidak ditemukan",
            sku: "-",
            total_qty: 0,
            total_price: 0,
            transaction_status_id: 3,
            voucher: "-",
            creator_id: user?.has_creator?.id || 0,
            creator_name: user?.has_creator?.name || "Unknown",
            detail: [],
            order_date: "-",
            customer_name: "-",
            customer_email: "-",
            status_name: "Data tidak tersedia",
            payment_method: "-",
            isAvailable: false
          }
        ];
        setData(placeholderData);
        setError("Data invoice tidak ditemukan (404). Silakan coba lagi nanti.");
      } else {
        setError(err?.message ?? "Failed to fetch data");
        console.error("Error fetching pickup data:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const filtered = useMemo(() => {
    let result = data;
    
    // Filter by search
    if (filterValue) {
      const searchLower = filterValue.toLowerCase();
      result = result.filter((item) => 
        (item.invoice_no ?? "").toString().toLowerCase().includes(searchLower) ||
        (item.customer_name ?? "").toLowerCase().includes(searchLower) ||
        (item.product_name ?? "").toLowerCase().includes(searchLower) ||
        (item.sku ?? "").toString().toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [data, filterValue]);

  const [mtSortBy, setMtSortBy] = useState<string>("");
  const [mtSortDir, setMtSortDir] = useState<"asc" | "desc">("asc");
  const handleMTSort = (col: string) => {
    if (mtSortBy === col) setMtSortDir(d => d === "asc" ? "desc" : "asc");
    else { setMtSortBy(col); setMtSortDir("asc"); }
    setPage(1);
  };
  const sortedFiltered = useMemo(() => {
    if (!mtSortBy) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      let valA = a[mtSortBy] ?? "";
      let valB = b[mtSortBy] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return mtSortDir === "asc" ? -1 : 1;
      if (valA > valB) return mtSortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, mtSortBy, mtSortDir]);

  const totalPriceAllFiltered = useMemo(
    () => filtered.reduce((sum, item) => {
      // Adjusted logic from transaction pickup
      if (item.transaction_status_id === 2 || item.transaction_status_id === 3 || (item as any).payment_status === "PAID") {
        return sum + (Number(item.total_price) || 0);
      }
      return sum;
    }, 0),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedItems = sortedFiltered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleOpenScanModal = () => {
    setIsScanModalOpen(true);
  };

  const handleScanWithCamera = () => {
    // Navigasi ke halaman scan dengan tab camera aktif
    window.open(`/dashboard/merch-pickup/scan-camera?tab=camera`, '_self');
  };

  const handleScanWithBarcode = () => {
    // Navigasi ke halaman scan yang sama, tapi dengan tab scanner/input aktif
    window.open(`/dashboard/merch-pickup/scan-camera?tab=scanner`, '_self');
  };

  const handleViewDetail = (transaction: MerchandiseTransactionData) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleCloseScanModal = () => {
    setIsScanModalOpen(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  const formatCurrency = (amount?: number | string) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const exportToCSV = (rows: MerchandiseTransactionData[]) => {
    if (!rows || rows.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const headers = ["Invoice Number", "Nama Customer", "Email", "Nama Produk", "SKU", "Total Qty", "Total Price", "Status", "Tanggal Order", "Payment Method"];
    
    const escapeCell = (value: any) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      const needsQuotes = /[,"\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const lines = rows.map((r) =>
      [
        escapeCell(r.invoice_no),
        escapeCell(r.customer_name),
        escapeCell(r.customer_email),
        escapeCell(r.product_name),
        escapeCell(r.sku),
        escapeCell(r.total_qty),
        escapeCell(r.total_price),
        escapeCell(getStatusInfo(r.transaction_status_id).text),
        escapeCell(formatDate(r.order_date)),
        escapeCell(r.payment_method)
      ].join(",")
    );

    const csvContent = headers.join(",") + "\n" + lines.join("\n");
    
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = url;
      a.download = `merch-pickup-${timestamp}.csv`;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading pickup data...</span>
      </div>
    );
  }

  return (
    <>
      <Flex mt={15} mx={15} justify="space-between" align="center" wrap="wrap">
          <Text fw={800} style={{ fontSize: '26px' }} mb={0} c="dark.9">Pickup Merchandise</Text>
          <Group gap="xl">
              <Stack gap={2}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">Total Transaksi</Text>
                  <Text size="xl" fw={700}>{filtered.length}</Text>
              </Stack>
              <MantineDivider orientation="vertical" />
              <Stack gap={2}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">Total Penjualan</Text>
                  <Text size="xl" fw={700}>
                      <NumberFormatter prefix="Rp " value={totalPriceAllFiltered} thousandSeparator="." decimalSeparator="," />
                  </Text>
              </Stack>
          </Group>
      </Flex>

      <MantineCard p={25} mt={20} mx={15} mb={15} withBorder radius="md">
        <Stack gap="xl">
            <Box>
                <Flex align="center" gap="sm" mb="sm" justify="space-between" wrap="wrap">
                    <Group gap="sm">
                        <MantineSelect
                            value={rowsPerPage.toString()}
                            onChange={(val) => {
                                setRowsPerPage(Number(val));
                                setPage(1);
                            }}
                            data={['10', '20', '50', '100']}
                            style={{ width: 70 }}
                            size="sm"
                        />
                        <MantineButton 
                            variant="filled" 
                            color="green" 
                            leftSection={<Icon icon="solar:file-download-bold" width={18} />}
                            onClick={() => exportToCSV(filtered.filter(item => item.isAvailable))}
                            disabled={filtered.filter(item => item.isAvailable).length === 0}
                            size="sm"
                            styles={{ root: { color: 'white' } }}
                        >
                            Export CSV ({filtered.filter(item => item.isAvailable).length})
                        </MantineButton>
                        <MantineButton
                            variant="filled"
                            color="blue"
                            leftSection={<Icon icon="mdi:qrcode-scan" width={18} />}
                            onClick={handleOpenScanModal}
                            size="sm"
                        >
                            Scan QR/Barcode
                        </MantineButton>
                    </Group>
                    <Group gap="sm">
                        <MantineTextInput
                            placeholder="Cari invoice, dll..."
                            leftSection={<Icon icon="solar:magnifer-linear" width={18} />}
                            value={filterValue}
                            onChange={(e) => {
                                setFilterValue(e.target.value);
                                setPage(1);
                            }}
                            style={{ width: 300 }}
                            size="sm"
                        />
                    </Group>
                </Flex>

                <Flex align="center" gap="sm" mb="md">
                    <Text size="sm" c="gray">
                        Menampilkan {filtered.length > 0 ? `${(page-1)*rowsPerPage+1}-${Math.min(page*rowsPerPage, filtered.length)}` : '0'} dari {filtered.length} transaksi
                    </Text>
                </Flex>

                <Box style={{ overflow: 'auto', maxHeight: '70vh', position: 'relative' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '1px solid #f0f0f0' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr style={{ backgroundColor: '#f5f7fa' }}>
                                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', width: 48, borderBottom: '2px solid #e8e8e8' }}>#</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', borderBottom: '2px solid #e8e8e8' }} onClick={() => handleMTSort('invoice_no')}>Invoice {mtSortBy === 'invoice_no' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', borderBottom: '2px solid #e8e8e8' }} onClick={() => handleMTSort('customer_name')}>Customer {mtSortBy === 'customer_name' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', borderBottom: '2px solid #e8e8e8' }} onClick={() => handleMTSort('product_name')}>Produk {mtSortBy === 'product_name' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', borderBottom: '2px solid #e8e8e8' }} onClick={() => handleMTSort('sku')}>SKU {mtSortBy === 'sku' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', borderBottom: '2px solid #e8e8e8' }} onClick={() => handleMTSort('total_qty')}>Qty {mtSortBy === 'total_qty' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', borderBottom: '2px solid #e8e8e8' }} onClick={() => handleMTSort('transaction_status_id')}>Status {mtSortBy === 'transaction_status_id' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', borderBottom: '2px solid #e8e8e8' }} onClick={() => handleMTSort('order_date')}>Tanggal Order {mtSortBy === 'order_date' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', position: 'sticky', right: 0, backgroundColor: '#f5f7fa', zIndex: 11, boxShadow: '-2px 0 5px rgba(0,0,0,0.07)', borderBottom: '2px solid #e8e8e8' }}>
                                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.map((item: MerchandiseTransactionData, idx: number) => {
                                const statusInfo = getStatusInfo(item.transaction_status_id);
                                const isAvailable = item.isAvailable !== false;
                                const rowNumber = (page - 1) * rowsPerPage + idx + 1;
                                
                                return (
                                    <tr key={item.id} style={{ backgroundColor: !isAvailable ? '#fef2f2' : '' }}>
                                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', textAlign: 'center', width: 48, borderBottom: '1px solid #f0f0f0' }}>
                                            <Text size="sm" c="dimmed" fw={500}>{rowNumber}</Text>
                                        </td>
                                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', borderBottom: '1px solid #f0f0f0' }}>
                                            <Flex align="center" gap="xs">
                                                <Text size="sm" fw={600} c={!isAvailable ? 'red.7' : 'dark'}>{item.invoice_no}</Text>
                                                {!isAvailable && <Badge color="red" size="xs">Tidak Tersedia</Badge>}
                                            </Flex>
                                            <Text size="xs" c="dimmed">{isAvailable ? item.payment_method || "N/A" : "Data error 404"}</Text>
                                        </td>
                                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', borderBottom: '1px solid #f0f0f0' }}>
                                            <Text size="sm" c={!isAvailable ? 'red.7' : 'dark'}>{item.customer_name}</Text>
                                            <Text size="xs" c="dimmed">{item.customer_email}</Text>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <Text size="sm" c={!isAvailable ? 'red.7' : 'dark'} style={{ whiteSpace: 'nowrap' }}>
                                                {item.product_name} {!isAvailable && '(Data tidak tersedia)'}
                                            </Text>
                                        </td>
                                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                                            <MantineButton 
                                                color={isAvailable ? 'gray' : 'red'} 
                                                variant="light" 
                                                size="xs" 
                                                radius="sm" 
                                                w={140}
                                                styles={{ 
                                                    root: { minHeight: 28, height: 'auto', padding: '4px 12px' },
                                                    label: { whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.2 } 
                                                }}
                                            >
                                                {item.sku || "-"}
                                            </MantineButton>
                                        </td>
                                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', borderBottom: '1px solid #f0f0f0' }}>
                                            <Text size="sm" fw={600} c={!isAvailable ? 'red.7' : 'dark'}>{isAvailable ? item.total_qty : "-"}</Text>
                                        </td>
                                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                                            {isAvailable ? (
                                                <MantineButton 
                                                    color={statusInfo.color.includes('yellow') ? 'yellow' : statusInfo.color.includes('green') ? 'green' : statusInfo.color.includes('red') ? 'red' : 'gray'} 
                                                    variant="filled" 
                                                    size="xs"
                                                    radius="xl"
                                                    w={130}
                                                    styles={{ 
                                                        root: { minHeight: 28, height: 'auto', padding: '4px 8px' },
                                                        label: { whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2 } 
                                                    }}
                                                >
                                                    {statusInfo.text}
                                                </MantineButton>
                                            ) : (
                                                <MantineButton color="red" variant="filled" size="xs" radius="xl" w={130}>
                                                    Data Error
                                                </MantineButton>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', borderBottom: '1px solid #f0f0f0' }}>
                                            <Text size="sm" c={!isAvailable ? 'dimmed' : 'dark'}>{isAvailable ? formatDate(item.order_date) : "Tidak tersedia"}</Text>
                                        </td>
                                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', position: 'sticky', right: 0, backgroundColor: !isAvailable ? '#fef2f2' : 'white', zIndex: 1, boxShadow: '-2px 0 4px rgba(0,0,0,0.06)', borderBottom: '1px solid #f0f0f0' }}>
                                            <Flex align="center" gap="xs">
                                                {isAvailable ? (
                                                  <Tooltip label="Lihat Detail">
                                                      <ActionIcon 
                                                          variant="light" 
                                                          color="blue" 
                                                          onClick={() => handleViewDetail(item)}
                                                          size="md"
                                                          radius="md"
                                                      >
                                                          <Icon icon="solar:eye-bold" width={16} />
                                                      </ActionIcon>
                                                  </Tooltip>
                                                ) : (
                                                  <Badge color="gray" variant="light">Tidak Tersedia</Badge>
                                                )}
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
                        <Text c="dimmed">Tidak ada data transaksi yang ditemukan</Text>
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
                        {filtered.length > 0 ? `${(page-1)*rowsPerPage+1}-${Math.min(page*rowsPerPage, filtered.length)}` : '0'} / {filtered.length}
                    </Text>
                </Flex>
            </Box>
        </Stack>
      </MantineCard>
      {/* Modal Scan Options */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={handleCloseScanModal}
        size="lg"
        backdrop="blur"
        classNames={{
          base: "bg-gradient-to-b from-gray-50 to-white",
          backdrop: "backdrop-blur-sm",
          header: "border-b-0 pb-0",
          footer: "border-t-0",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Icon icon="mdi:qrcode-scan" width={20} height={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Proses Pengambilan Merchandise</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Pilih metode scan untuk memverifikasi pengambilan merchandise
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  {/* Scan with Camera */}
                  <div 
                    className="p-5 border-2 border-primary-light-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group active:scale-[0.98]"
                    onClick={handleScanWithCamera}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                        <Icon icon="mdi:camera" width={24} height={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700">Scan dengan Kamera</h3>
                        <p className="text-sm text-gray-600 mt-1">Scan kode QR menggunakan kamera perangkat Anda</p>
                      </div>
                      <div className="p-2">
                        <Icon icon="mdi:chevron-right" width={16} height={16} className="text-gray-400 group-hover:text-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Scan with Scanner Device */}
                  <div 
                    className="p-5 border-2 border-primary-light-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group active:scale-[0.98]"
                    onClick={handleScanWithBarcode}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg group-hover:from-green-200 group-hover:to-green-300 transition-colors">
                        <Icon icon="mdi:barcode-scan" width={24} height={24} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-green-700">Scan dengan Scanner/Input</h3>
                        <p className="text-sm text-gray-600 mt-1">Gunakan scanner barcode atau input manual kode merchandise</p>
                      </div>
                      <div className="p-2">
                        <Icon icon="mdi:chevron-right" width={16} height={16} className="text-gray-400 group-hover:text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="pb-6">
                <Button 
                  color="default" 
                  variant="light" 
                  onPress={handleCloseScanModal}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Batal
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Detail Transaction Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        size="2xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          base: "bg-gradient-to-b from-gray-50 to-white",
          backdrop: "backdrop-blur-sm",
          header: "border-b-0",
          footer: "border-t-0",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Detail Transaksi Merchandise</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Informasi lengkap transaksi untuk verifikasi pickup
                      </p>
                    </div>
                  </div>
                  {selectedTransaction && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedTransaction.isAvailable !== false 
                        ? getStatusInfo(selectedTransaction.transaction_status_id).color
                        : "bg-red-100 text-red-700 border border-primary-light-200"
                    }`}>
                      {selectedTransaction.isAvailable !== false 
                        ? getStatusInfo(selectedTransaction.transaction_status_id).text
                        : "Data Error"
                      }
                    </span>
                  )}
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                {selectedTransaction && (
                  <div className="space-y-6">
                    {/* Warning if data not available */}
                    {selectedTransaction.isAvailable === false && (
                      <div className="bg-red-50 border border-primary-light-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                          <div>
                            <h3 className="font-semibold text-red-700">Data Invoice Tidak Tersedia</h3>
                            <p className="text-red-600 text-sm mt-1">
                              Data untuk invoice ini tidak dapat diakses (Error 404). 
                              Silakan hubungi administrator untuk informasi lebih lanjut.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-primary-light-200 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                        <p className="font-medium text-lg text-gray-800">{selectedTransaction.invoice_no}</p>
                      </div>
                      <div className="bg-white border border-primary-light-200 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Tanggal Order</p>
                        <p className="font-medium text-gray-800">{formatDate(selectedTransaction.order_date)}</p>
                      </div>
                      <div className="bg-white border border-primary-light-200 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                        <p className="font-medium text-gray-800">{selectedTransaction.customer_name}</p>
                      </div>
                      <div className="bg-white border border-primary-light-200 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Customer Email</p>
                        <p className="font-medium text-gray-800 truncate">{selectedTransaction.customer_email}</p>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="bg-white border border-primary-light-200 rounded-lg p-5">
                      <h3 className="font-semibold text-gray-800 mb-4">Informasi Produk</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Nama Produk</p>
                          <p className="font-medium text-gray-800">{selectedTransaction.product_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">SKU</p>
                          <p className={`font-medium font-mono px-2 py-1 rounded inline-block ${
                            selectedTransaction.isAvailable !== false 
                              ? "text-gray-800 bg-gray-100" 
                              : "text-red-700 bg-red-100"
                          }`}>
                            {selectedTransaction.sku || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Quantity</p>
                          <p className="font-medium text-gray-800">
                            {selectedTransaction.isAvailable !== false ? (
                              <span className="text-blue-600 text-xl">{selectedTransaction.total_qty}</span>
                            ) : (
                              <span className="text-gray-400 text-xl">-</span>
                            )}
                            <span className="ml-2">item</span>
                          </p>
                        </div>
                      </div>
                      {selectedTransaction.isAvailable !== false && (
                        <div className="mt-4 pt-4 border-t border-primary-light-200">
                          <p className="text-sm text-gray-500 mb-1">Total Harga</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedTransaction.total_price)}</p>
                        </div>
                      )}
                    </div>

                    {/* Detail Items */}
                    {selectedTransaction.detail && selectedTransaction.detail.length > 0 && selectedTransaction.isAvailable !== false && (
                      <div className="bg-white border border-primary-light-200 rounded-lg p-5">
                        <h3 className="font-semibold text-gray-800 mb-4">Detail Items ({selectedTransaction.detail.length})</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {selectedTransaction.detail.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-primary-light-200 rounded-lg hover:border-blue-200 transition-colors">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">
                                  {item.product?.product_name || item.product_name || item.product?.name || `Item ${index + 1}`}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-primary-light-200">
                                    SKU: {item.product?.sku || item.sku || "-"}
                                  </span>
                                  <span className="text-xs text-gray-500">Qty: {item.quantity || item.qty || 0}</span>
                                  <span className="text-xs text-gray-500">
                                    Harga: {formatCurrency(item.price || item.product?.price || item.variant?.price)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">
                                  {formatCurrency((item.quantity || item.qty || 0) * (Number(item.price) || Number(item.product?.price) || Number(item.variant?.price) || 0))}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">Subtotal</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    {selectedTransaction.isAvailable !== false && (
                      <div className="bg-white border border-primary-light-200 rounded-lg p-5">
                        <h3 className="font-semibold text-gray-800 mb-4">Informasi Pembayaran</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Metode Pembayaran</p>
                            <p className="font-medium text-gray-800">{selectedTransaction.payment_method || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Status Transaksi</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedTransaction.transaction_status_id).color}`}>
                              {getStatusInfo(selectedTransaction.transaction_status_id).text}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="pb-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    color="default"
                    variant="light"
                    onPress={handleCloseDetailModal}
                    className="flex-1 sm:flex-none"
                  >
                    Tutup
                  </Button>
                  {selectedTransaction?.isAvailable !== false && (
                    <div className="flex gap-3">
                      <Button
                        color="primary"
                        variant="solid"
                        onPress={() => {
                          handleCloseDetailModal();
                          handleOpenScanModal();
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5"
                        startContent={<Icon icon="mdi:qrcode-scan" width={14} height={14} />}
                      >
                        Proses Pengambilan
                      </Button>
                    </div>
                  )}
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default MerchPickupPage;