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
//   Tabs,
//   Tab,
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Divider,
//   Accordion,
//   AccordionItem
// } from "@nextui-org/react";
// import { Card } from "@mantine/core";
// import { Get } from "@/utils/REST";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faDownload, faFileInvoice, faUser, faBox, faShoppingCart, faTruck, faReceipt, faTag, faCalendar, faInfoCircle, faChevronDown, faChevronRight, faCreditCard, faMapMarkerAlt, faStore, faPhone, faEnvelope, faSearch } from "@fortawesome/free-solid-svg-icons";
// import useLoggedUser from "@/utils/useLoggedUser";

// interface CreatorData {
//   id: number;
//   user_id: string;
//   name: string;
//   has_user?: {
//     id: number;
//     name: string;
//     email: string;
//   };
// }

// interface ShippingAddress {
//   id?: number;
//   order_id?: number;
//   address_detail?: string;
//   address_name?: string;
//   nama_penerima?: string;
//   phone?: string;
//   [key: string]: any;
// }

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
//   shipping_address?: ShippingAddress | string;
//   status_name?: string;
//   payment_method?: string;
//   notes?: string;
// }

// const MerchandiseTransaction: React.FC = () => {
//   const user = useLoggedUser();
//   const [data, setData] = useState<MerchandiseTransactionData[]>([]);
//   const [creators, setCreators] = useState<CreatorData[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(5);
//   const [filterValue, setFilterValue] = useState<string>("");
//   const [productFilter, setProductFilter] = useState<string>(""); // Filter produk baru
//   const [page, setPage] = useState<number>(1);
//   const [selectedTab, setSelectedTab] = useState<string>("transaksi");
//   const [selectedCreator, setSelectedCreator] = useState<string>("all");
//   const [loadingCreators, setLoadingCreators] = useState<boolean>(false);

//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [selectedTransaction, setSelectedTransaction] = useState<MerchandiseTransactionData | null>(null);

//   const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setFilterValue(e.target.value);
//     setPage(1);
//   }, []);

//   const onProductFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setProductFilter(e.target.value);
//     setPage(1);
//   }, []);

//   const getStatusInfo = (statusId?: number) => {
//     switch (statusId) {
//       case 1:
//         return {
//           text: "Pending",
//           color: "bg-yellow-100 text-yellow-800 border-yellow-200",
//           bgColor: "bg-yellow-100",
//           textColor: "text-yellow-800",
//         };
//       case 2:
//         return {
//           text: "Success",
//           color: "bg-green-100 text-green-800 border-green-200",
//           bgColor: "bg-green-100",
//           textColor: "text-green-800",
//         };
//       case 3:
//         return {
//           text: "Failed",
//           color: "bg-red-100 text-red-800 border-red-200",
//           bgColor: "bg-red-100",
//           textColor: "text-red-800",
//         };
//       case 4:
//         return {
//           text: "Expired",
//           color: "bg-gray-100 text-gray-800 border-gray-200",
//           bgColor: "bg-gray-100",
//           textColor: "text-gray-800",
//         };
//       default:
//         return {
//           text: "Unknown",
//           color: "bg-gray-100 text-gray-800 border-gray-200",
//           bgColor: "bg-gray-100",
//           textColor: "text-gray-800",
//         };
//     }
//   };

//   // Fungsi untuk parsing tanggal dengan aman
//   const parseDate = (dateString: string | undefined): Date => {
//     if (!dateString || dateString === "-") return new Date(0);
    
//     try {
//       const date = new Date(dateString);
      
//       if (isNaN(date.getTime())) {
//         // Coba format lain jika ISO gagal
//         const cleanedDate = dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3');
//         const newDate = new Date(cleanedDate);
        
//         return isNaN(newDate.getTime()) ? new Date(0) : newDate;
//       }
      
//       return date;
//     } catch (e) {
//       return new Date(0);
//     }
//   };

//   const formatShippingAddress = (address: ShippingAddress | string | undefined): string => {
//     if (!address) return "-";
//     if (typeof address === "string") return address;
//     const addr = address as ShippingAddress;
//     const parts: string[] = [];
//     if (addr.nama_penerima) parts.push(addr.nama_penerima);
//     if (addr.address_detail) parts.push(addr.address_detail);
//     if (addr.address_name) parts.push(addr.address_name);
//     if (addr.phone) parts.push(`Telp: ${addr.phone}`);
//     return parts.length > 0 ? parts.join(", ") : "-";
//   };

//   const getCreators = async () => {
//     setLoadingCreators(true);
//     try {
//       const res: any = await Get("creator", {});
//       setCreators(res?.data || []);
//     } catch (err: any) {
//       console.error("Failed to fetch creators:", err);
//     } finally {
//       setLoadingCreators(false);
//     }
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

//       const mapped: MerchandiseTransactionData[] = filteredData.map((item: any) => {
//         const productNames: string[] = [];
//         if (Array.isArray(item.detail) && item.detail.length > 0) {
//           item.detail.forEach((d: any) => {
//             if (d?.product && (d.product.product_name || d.product_name)) {
//               productNames.push(d.product.product_name ?? d.product_name);
//             } else if (d?.product_name) {
//               productNames.push(d.product_name);
//             } else if (d?.name) {
//               productNames.push(d.name);
//             } else if (d?.product && typeof d.product === "string") {
//               productNames.push(d.product);
//             }
//           });
//         }

//         if (productNames.length === 0) {
//           if (item?.product && (item.product.product_name || item.product.name)) {
//             productNames.push(item.product.product_name ?? item.product.name);
//           } else if (item?.product_name) {
//             productNames.push(item.product_name);
//           } else if (item?.name) {
//             productNames.push(item.name);
//           }
//         }

//         const productName = productNames.length > 0 ? productNames.join(" | ") : "-";
//         let creatorId = 0;
//         let creatorName = user?.has_creator?.name || "Creator";

//         if (item.creator?.id) {
//           creatorId = item.creator.id;
//           creatorName = item.creator.name || item.creator.username || item.creator.email || creatorName;
//         } else if (item.creator_id) {
//           creatorId = item.creator_id;
//         } else if (item.user_id) {
//           creatorId = parseInt(item.user_id) || 0;
//         }

//         const shippingAddress = item.shipping_address || item.address || "-";

//         return {
//           id: item.id ?? item.order_product_id ?? 0,
//           invoice_no: item.invoice_no ?? item.invoiceNo ?? item.invoice ?? "-",
//           product_name: productName,
//           sku: item.sku ?? item.product?.sku ?? "-",
//           total_qty: item.total_qty ?? item.qty ?? (item.detail && item.detail[0] && item.detail[0].quantity) ?? 0,
//           total_price: item.total_price ?? item.price ?? item.delivery_price ?? item.price_total ?? item.price_formatted ?? 0,
//           transaction_status_id: item.transaction_status_id ?? item.status_id ?? 0,
//           voucher: item.voucher ?? item.voucher_code ?? "-",
//           creator_id: creatorId,
//           creator_name: creatorName,
//           detail: item.detail || [],
//           order_date: item.created_at || item.order_date || item.date || "-",
//           customer_name: item.customer_name || item.customer?.name || item.nama_penerima || "-",
//           customer_email: item.customer_email || item.customer?.email || "-",
//           shipping_address: shippingAddress,
//           status_name: item.status_name || item.status?.name || "-",
//           payment_method: item.payment_method || item.payment?.method || "-",
//           notes: item.notes || item.note || "-",
//         };
//       });

//       // Sorting berdasarkan tanggal order (terbaru duluan)
//       const sortedData = mapped.sort((a, b) => {
//         const dateA = parseDate(a.order_date);
//         const dateB = parseDate(b.order_date);
//         return dateB.getTime() - dateA.getTime(); // Descending: terbaru duluan
//       });

//       setData(sortedData);
//       setError(null);
//     } catch (err: any) {
//       setError(err?.message ?? "Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     Promise.all([getData(), getCreators()]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const dataWithCreatorNames = useMemo(() => {
//     if (creators.length === 0) return data;
//     return data.map((item) => {
//       const foundCreator = creators.find((creator) => {
//         if (creator.id === item.creator_id) return true;
//         if (creator.has_user?.id === item.creator_id) return true;
//         if (parseInt(creator.user_id) === item.creator_id) return true;
//         return false;
//       });

//       if (foundCreator) {
//         return {
//           ...item,
//           creator_name: foundCreator.has_user?.name || foundCreator.name || "Unknown",
//           creator_id: foundCreator.id,
//         };
//       }
//       return item;
//     });
//   }, [data, creators]);

//   const filtered = useMemo(() => {
//     let result = dataWithCreatorNames;
    
//     // Filter berdasarkan invoice number
//     if (filterValue) {
//       result = result.filter((item) => 
//         (item.invoice_no ?? "").toString().toLowerCase().includes(filterValue.toLowerCase())
//       );
//     }
    
//     // Filter berdasarkan nama produk
//     if (productFilter) {
//       result = result.filter((item) => 
//         (item.product_name ?? "").toString().toLowerCase().includes(productFilter.toLowerCase())
//       );
//     }
    
//     return result;
//   }, [dataWithCreatorNames, filterValue, productFilter]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
//   const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//   const totalMerchandiseInPage = useMemo(() => paginatedItems.length, [paginatedItems]);
//   const totalPriceInPage = useMemo(() => paginatedItems.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0), [paginatedItems]);
//   const totalPriceAllFiltered = useMemo(() => filtered.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0), [filtered]);

//   const exportToCSV = (rows: MerchandiseTransactionData[]) => {
//     if (!rows || rows.length === 0) {
//       const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status", "Voucher", "Creator"];
//       const csvContent = headers.join(",") + "\n";
//       downloadCSV(csvContent);
//       return;
//     }

//     const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status", "Voucher", "Creator"];
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
//         escapeCell(r.product_name),
//         escapeCell(r.sku),
//         escapeCell(r.total_qty),
//         escapeCell(r.total_price),
//         escapeCell(getStatusInfo(r.transaction_status_id).text),
//         escapeCell(r.voucher),
//         escapeCell(r.creator_name),
//       ].join(",")
//     );

//     const csvContent = headers.join(",") + "\n" + lines.join("\n");
//     downloadCSV(csvContent);
//   };

//   const downloadCSV = (csvContent: string) => {
//     try {
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//       a.href = url;
//       a.download = `merchandise-transaction-${timestamp}.csv`;
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

//   const handleViewDetail = (transaction: MerchandiseTransactionData) => {
//     setSelectedTransaction(transaction);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedTransaction(null);
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

//   const formatCurrency = (amount?: number | string) => {
//     const num = Number(amount) || 0;
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0
//     }).format(num);
//   };

//   function onRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
//     setRowsPerPage(Number(event.target.value));
//     setPage(1);
//   }

//   if (loading || loadingCreators) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   // Komponen untuk modal
//   const InfoCard = ({ 
//     title, 
//     icon, 
//     children, 
//     color = "blue" 
//   }: { 
//     title: string; 
//     icon: React.ReactNode; 
//     children: React.ReactNode; 
//     color?: "blue" | "green" | "purple" | "orange" | "indigo" | "yellow"; 
//   }) => {
//     const colors = {
//       blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
//       green: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
//       purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
//       orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
//       indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200",
//       yellow: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200",
//     };

//     return (
//       <div className={`${colors[color]} rounded-xl border p-4 shadow-sm transition-all hover:shadow-md`}>
//         <div className="flex items-center gap-2 mb-3 pb-2 border-b">
//           <div className={`p-2 rounded-lg ${
//             color === "blue" ? "bg-blue-100 text-blue-600" :
//             color === "green" ? "bg-green-100 text-green-600" :
//             color === "purple" ? "bg-purple-100 text-purple-600" :
//             color === "orange" ? "bg-orange-100 text-orange-600" :
//             color === "indigo" ? "bg-indigo-100 text-indigo-600" :
//             "bg-yellow-100 text-yellow-600"
//           }`}>
//             {icon}
//           </div>
//           <h3 className="font-semibold text-gray-800">{title}</h3>
//         </div>
//         <div className="space-y-3">
//           {children}
//         </div>
//       </div>
//     );
//   };

//   const InfoItem = ({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) => (
//     <div className="flex items-start gap-2">
//       {icon && <div className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0">{icon}</div>}
//       <div className="flex-1 min-w-0">
//         <p className="text-xs text-gray-500 mb-0.5">{label}</p>
//         <div className="text-sm font-medium text-gray-800 break-words">{value}</div>
//       </div>
//     </div>
//   );

//   return (
//     <Card className={`!overflow-auto`} p={20} m={10} withBorder>
//       {/* SEMUA INFORMASI DIPINDAHKAN KE ATAS */}
//       <div className="mb-6 p-4 bg-gray-50 border border-light-grey rounded-md">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <div className="text-sm text-gray-700">
//               Showing <span className="font-semibold">{(page - 1) * rowsPerPage + 1}</span> to <span className="font-semibold">{Math.min(page * rowsPerPage, filtered.length)}</span> of{" "}
//               <span className="font-semibold">{filtered.length}</span> entries
//             </div>
//           </div>
//           <div className="flex items-center gap-6">
//             <div className="text-right">
//               <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Merchandise in Page</div>
//               <div className="text-lg font-semibold text-gray-800">
//                 {totalMerchandiseInPage} item{totalMerchandiseInPage !== 1 ? "s" : ""}
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price in Page</div>
//               <div className="text-lg font-semibold text-gray-800">Rp {totalPriceInPage.toLocaleString("id-ID")}</div>
//             </div>
//             <div className="text-right">
//               <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total All Filtered</div>
//               <div className="text-lg font-semibold text-gray-800">Rp {totalPriceAllFiltered.toLocaleString("id-ID")}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <Tabs aria-label="Transaction Tabs" selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)} className="mb-6">
//         <Tab key="transaksi" title="Transaksi">
//           {/* Search, Filter, Export, and Pagination Controls */}
//           <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0">
//             <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto space-y-2 md:space-y-0">
//               <div className="flex flex-col md:flex-row items-center gap-2 w-full space-y-2 md:space-y-0">
//                 <div className="flex items-center gap-2 w-full md:w-auto">
//                   <Input
//                     type="text"
//                     placeholder="Search by Invoice"
//                     value={filterValue}
//                     onChange={onSearchChange}
//                     className="w-full md:w-64"
//                     size="sm"
//                     startContent={<FontAwesomeIcon icon={faSearch} className="h-3.5 w-3.5 text-gray-400" />}
//                   />
//                 </div>
//                 <div className="flex items-center gap-2 w-full md:w-auto">
//                   <Input
//                     type="text"
//                     placeholder="Filter by Product Name"
//                     value={productFilter}
//                     onChange={onProductFilterChange}
//                     className="w-full md:w-64"
//                     size="sm"
//                     startContent={<FontAwesomeIcon icon={faBox} className="h-3.5 w-3.5 text-gray-400" />}
//                   />
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => exportToCSV(filtered)}
//                   className="px-3 py-2 rounded-md border border-light-grey bg-white hover:bg-gray-50 text-sm flex items-center gap-2 whitespace-nowrap"
//                   title="Export to Excel"
//                   disabled={filtered.length === 0}
//                 >
//                   <FontAwesomeIcon icon={faDownload} className="h-4 w-4 text-green-600" />
//                   <span>Export ({filtered.length})</span>
//                 </button>
//               </div>
//             </div>

//             <select onChange={onRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md text-sm w-full md:w-auto">
//               <option value={5}>5 rows</option>
//               <option value={10}>10 rows</option>
//               <option value={20}>20 rows</option>
//             </select>
//           </div>

//           {/* Table */}
//           {data.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">No data available</div>
//           ) : filtered.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               {`No transactions found`}
//               {filterValue ? ` for invoice containing "${filterValue}"` : ""}
//               {productFilter ? ` for product containing "${productFilter}"` : ""}
//             </div>
//           ) : (
//             <>
//               <Table
//                 aria-label="Merchandise Transaction Table"
//                 style={{
//                   height: "auto",
//                   minWidth: "100%",
//                   backgroundColor: "white",
//                   borderRadius: "0px",
//                   padding: "0px",
//                 }}
//               >
//                 <TableHeader>
//                   <TableColumn width={50}>No</TableColumn>
//                   <TableColumn>Invoice Number</TableColumn>
//                   <TableColumn>Tanggal Order</TableColumn>
//                   <TableColumn>Nama Produk</TableColumn>
//                   <TableColumn>SKU</TableColumn>
//                   <TableColumn>Total Qty</TableColumn>
//                   <TableColumn>Total Price</TableColumn>
//                   <TableColumn>Transaction Status</TableColumn>
//                   <TableColumn>Voucher</TableColumn>
//                   <TableColumn>Creator</TableColumn>
//                   <TableColumn width={80}>Actions</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   {paginatedItems.map((item, index) => {
//                     const statusInfo = getStatusInfo(item.transaction_status_id);

//                     return (
//                       <TableRow key={item.id}>
//                         <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
//                         <TableCell>{item.invoice_no}</TableCell>
//                         <TableCell>{formatDate(item.order_date)}</TableCell>
//                         <TableCell>{item.product_name}</TableCell>
//                         <TableCell>{item.sku}</TableCell>
//                         <TableCell>{item.total_qty}</TableCell>
//                         <TableCell>Rp {Number(item.total_price || 0).toLocaleString("id-ID")}</TableCell>
//                         <TableCell>
//                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>{statusInfo.text}</span>
//                         </TableCell>
//                         <TableCell>{item.voucher}</TableCell>
//                         <TableCell>{item.creator_name}</TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => handleViewDetail(item)}
//                               className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
//                               title={`View details for ${item.invoice_no}`}
//                             >
//                               <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>

//               {/* BAGIAN BAWAH TABLE KOSONG - HANYA PAGINATION */}
//               <div className="flex justify-start items-center gap-2 mt-4">
//                 <Pagination page={page} total={totalPages} onChange={(p) => setPage(Number(p))} className="items-center" size="sm" />
//               </div>
//             </>
//           )}
//         </Tab>

//         <Tab key="pengiriman" title="Pengiriman">
//           <div className="text-center py-12 text-gray-500">
//             <p>Fitur Pengiriman akan segera hadir</p>
//             <p className="text-sm mt-2">Sedang dalam pengembangan</p>
//           </div>
//         </Tab>
//       </Tabs>

//       {/* Modal Detail Transaksi */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         size="4xl"
//         scrollBehavior="inside"
//         classNames={{
//           base: "bg-gradient-to-b from-gray-50 to-white",
//           backdrop: "backdrop-blur-sm",
//           header: "border-b-0 px-6 pt-4 pb-3",
//           footer: "border-t-0",
//         }}
//       >
//         <ModalContent>
//           {() => (
//             <>
//               <ModalHeader className="flex flex-col gap-1 py-3 bg-[#0b387c]">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
//                       <FontAwesomeIcon icon={faFileInvoice} className="h-5 w-5 text-white" />
//                     </div>
//                     <div>
//                       <h2 className="text-lg font-bold text-white">Detail Transaksi</h2>
//                       <p className="text-xs text-white/90 opacity-90">{selectedTransaction?.invoice_no || "-"}</p>
//                     </div>
//                   </div>
//                   {selectedTransaction && (
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusInfo(selectedTransaction.transaction_status_id).bgColor} ${getStatusInfo(selectedTransaction.transaction_status_id).textColor}`}>
//                       {getStatusInfo(selectedTransaction.transaction_status_id).text}
//                     </span>
//                   )}
//                 </div>
//               </ModalHeader>
//               <ModalBody className="py-6 px-6">
//                 {selectedTransaction && (
//                   <div className="space-y-6">
//                     {/* Grid Cards */}
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       {/* Ringkasan Transaksi */}
//                       <InfoCard 
//                         title="Ringkasan Transaksi" 
//                         icon={<FontAwesomeIcon icon={faReceipt} className="h-4 w-4" />} 
//                         color="blue"
//                       >
//                         <InfoItem 
//                           label="Invoice Number" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faFileInvoice} className="h-3 w-3 text-blue-500" />
//                               <span>{selectedTransaction.invoice_no || "-"}</span>
//                             </div>
//                           } 
//                         />
//                         <InfoItem 
//                           label="Tanggal Order" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-green-500" />
//                               <span>{formatDate(selectedTransaction.order_date)}</span>
//                             </div>
//                           } 
//                         />
//                         <InfoItem 
//                           label="Voucher" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faTag} className="h-3 w-3 text-purple-500" />
//                               <span className={selectedTransaction.voucher === "-" ? "text-gray-400" : "text-gray-800"}>
//                                 {selectedTransaction.voucher === "-" ? "Tidak ada" : selectedTransaction.voucher}
//                               </span>
//                             </div>
//                           } 
//                         />
//                         <InfoItem 
//                           label="Metode Pembayaran" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faCreditCard} className="h-3 w-3 text-orange-500" />
//                               <span>{selectedTransaction.payment_method || "-"}</span>
//                             </div>
//                           } 
//                         />
//                       </InfoCard>

//                       {/* Informasi Produk */}
//                       <InfoCard 
//                         title="Informasi Produk" 
//                         icon={<FontAwesomeIcon icon={faBox} className="h-4 w-4" />} 
//                         color="purple"
//                       >
//                         <InfoItem 
//                           label="Nama Produk" 
//                           value={
//                             <div className="bg-gray-50 p-2 rounded-lg">
//                               <p className="text-sm font-medium">{selectedTransaction.product_name || "-"}</p>
//                             </div>
//                           } 
//                         />
//                         <div className="grid grid-cols-2 gap-4">
//                           <InfoItem label="SKU" value={selectedTransaction.sku || "-"} />
//                           <InfoItem 
//                             label="Quantity" 
//                             value={
//                               <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
//                                 {selectedTransaction.total_qty || 0} item
//                               </span>
//                             } 
//                           />
//                         </div>
//                         <div className="pt-2 border-t">
//                           <p className="text-xs text-gray-500 mb-1">Total Harga</p>
//                           <p className="text-xl font-bold text-green-600">{formatCurrency(selectedTransaction.total_price)}</p>
//                         </div>
//                       </InfoCard>

//                       {/* Informasi Customer */}
//                       <InfoCard 
//                         title="Informasi Customer" 
//                         icon={<FontAwesomeIcon icon={faUser} className="h-4 w-4" />} 
//                         color="green"
//                       >
//                         <InfoItem 
//                           label="Nama Customer" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-gray-400" />
//                               <span>{selectedTransaction.customer_name || "-"}</span>
//                             </div>
//                           } 
//                         />
//                         <InfoItem 
//                           label="Email" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-gray-400" />
//                               <span>{selectedTransaction.customer_email || "-"}</span>
//                             </div>
//                           } 
//                         />
//                         <InfoItem 
//                           label="Telepon" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-gray-400" />
//                               <span>
//                                 {typeof selectedTransaction.shipping_address === 'object' && 
//                                  selectedTransaction.shipping_address?.phone 
//                                   ? selectedTransaction.shipping_address.phone 
//                                   : "-"}
//                               </span>
//                             </div>
//                           } 
//                         />
//                       </InfoCard>

//                       {/* Informasi Creator */}
//                       <InfoCard 
//                         title="Informasi Creator" 
//                         icon={<FontAwesomeIcon icon={faStore} className="h-4 w-4" />} 
//                         color="indigo"
//                       >
//                         <InfoItem 
//                           label="Nama Creator" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faStore} className="h-3 w-3 text-indigo-400" />
//                               <span>{selectedTransaction.creator_name || "-"}</span>
//                             </div>
//                           } 
//                         />
//                         <InfoItem 
//                           label="Creator ID" 
//                           value={
//                             <div className="flex items-center gap-2">
//                               <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-gray-400" />
//                               <span>{selectedTransaction.creator_id || "-"}</span>
//                             </div>
//                           } 
//                         />
//                       </InfoCard>

//                       {/* Alamat Pengiriman */}
//                       <div className="lg:col-span-2">
//                         <InfoCard 
//                           title="Alamat Pengiriman" 
//                           icon={<FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4" />} 
//                           color="orange"
//                         >
//                           <div className="p-3 bg-white border border-orange-100 rounded-lg">
//                             <div className="flex items-start gap-3">
//                               <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
//                               <p className="text-sm text-gray-700 leading-relaxed">
//                                 {formatShippingAddress(selectedTransaction.shipping_address)}
//                               </p>
//                             </div>
//                           </div>
//                         </InfoCard>
//                       </div>

//                       {/* Detail Items */}
//                       {selectedTransaction.detail && selectedTransaction.detail.length > 0 && (
//                         <div className="lg:col-span-2">
//                           <InfoCard 
//                             title={`Detail Item (${selectedTransaction.detail.length})`} 
//                             icon={<FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4" />} 
//                             color="yellow"
//                           >
//                             <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
//                               {selectedTransaction.detail.map((item: any, index: number) => (
//                                 <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-yellow-200 transition-colors">
//                                   <div className="flex-1">
//                                     <p className="font-medium text-gray-800">
//                                       {item.product?.product_name || item.product_name || item.product?.name || item.name || `Item ${index + 1}`}
//                                     </p>
//                                     <div className="flex items-center gap-4 mt-1">
//                                       <span className="text-xs text-gray-500">Qty: {item.quantity || item.qty || 0}</span>
//                                       <span className="text-xs text-gray-500">
//                                         Harga: {formatCurrency(item.price || item.product?.price)}
//                                       </span>
//                                     </div>
//                                   </div>
//                                   <div className="text-right">
//                                     <p className="font-semibold text-gray-800">
//                                       {formatCurrency((item.quantity || item.qty || 0) * (Number(item.price) || Number(item.product?.price) || 0))}
//                                     </p>
//                                     <p className="text-xs text-gray-500 mt-0.5">Subtotal</p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </InfoCard>
//                         </div>
//                       )}

//                       {/* Catatan */}
//                       {selectedTransaction.notes && selectedTransaction.notes !== "-" && (
//                         <div className="lg:col-span-2">
//                           <InfoCard 
//                             title="Catatan" 
//                             icon={<FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />} 
//                             color="yellow"
//                           >
//                             <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
//                               <p className="text-sm text-gray-700">{selectedTransaction.notes}</p>
//                             </div>
//                           </InfoCard>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </ModalBody>
//               <ModalFooter className="py-5 bg-gray-50 px-6">
//                 <div className="flex flex-col sm:flex-row gap-3 w-full">
//                   <Button
//                     color="default"
//                     variant="light"
//                     onPress={handleCloseModal}
//                     className="flex-1 sm:flex-none"
//                   >
//                     Tutup
//                   </Button>
//                   <div className="flex gap-3">
//                     <Button
//                       color="primary"
//                       variant="solid"
//                       onPress={() => {
//                         if (selectedTransaction?.invoice_no && selectedTransaction.invoice_no !== "-") {
//                           const baseUrl = process.env.NEXT_PUBLIC_URL_MERCH || window.location.origin;
//                           const viewUrl = `${baseUrl}merch-invoice/${selectedTransaction.invoice_no}`;
//                           window.open(viewUrl, "_blank", "noopener,noreferrer");
//                         }
//                       }}
//                       isDisabled={!selectedTransaction?.invoice_no || selectedTransaction.invoice_no === "-"}
//                       className="bg-[#194E9E] hover:bg-[#163C7A] text-white"
//                       startContent={<FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />}
//                     >
//                       Lihat Invoice Lengkap
//                     </Button>
//                   </div>
//                 </div>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>
//     </Card>
//   );
// };

// export default MerchandiseTransaction;

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
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Card } from "@mantine/core";
import { Get } from "@/utils/REST";
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
} from "@fortawesome/free-solid-svg-icons";
import useLoggedUser from "@/utils/useLoggedUser";

interface CreatorData {
  id: number;
  user_id: string;
  name: string;
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
  shipping_address?: ShippingAddress | string;
  status_name?: string;
  payment_method?: string;
  notes?: string;
}

const MerchandiseTransaction: React.FC = () => {
  const user = useLoggedUser();
  const [data, setData] = useState<MerchandiseTransactionData[]>([]);
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filterValue, setFilterValue] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState<string>("transaksi");
  const [selectedCreator, setSelectedCreator] = useState<string>("all");
  const [loadingCreators, setLoadingCreators] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<MerchandiseTransactionData | null>(null);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setPage(1);
  }, []);

  const onProductFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProductFilter(e.target.value);
    setPage(1);
  }, []);

  const getStatusInfo = (statusId?: number) => {
    switch (statusId) {
      case 1:
        return {
          text: "Pending",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
      case 2:
        return {
          text: "Success",
          color: "bg-green-100 text-green-800 border-green-200",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
        };
      case 3:
        return {
          text: "Failed",
          color: "bg-red-100 text-red-800 border-red-200",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
        };
      case 4:
        return {
          text: "Expired",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
    }
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
    setError(null); // Reset error setiap kali fetch data
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
          return itemCreatorId === creatorId;
        });
      }

      const mapped: MerchandiseTransactionData[] = filteredData.map((item: any) => {
        const productNames: string[] = [];

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

        if (productNames.length === 0) {
          if (item?.product?.product_name) {
            productNames.push(item.product.product_name);
          } else if (item?.product_name) {
            productNames.push(item.product_name);
          }
        }

        const productName = productNames.length > 0 ? productNames.join(" | ") : "-";
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
          id: item.id || 0,
          invoice_no: item.invoice_no || "-",
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
    } catch (err: any) {
      console.error("Error fetching data:", err);
      // Tetap set data kosong dan error state
      setData([]);
      setError("Gagal mengambil data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([getData(), getCreators()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (productFilter) {
      result = result.filter((item) =>
        (item.product_name ?? "")
          .toString()
          .toLowerCase()
          .includes(productFilter.toLowerCase())
      );
    }

    return result;
  }, [dataWithCreatorNames, filterValue, productFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const totalMerchandiseInPage = useMemo(
    () => paginatedItems.length,
    [paginatedItems]
  );
  const totalPriceInPage = useMemo(
    () => paginatedItems.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0),
    [paginatedItems]
  );
  const totalPriceAllFiltered = useMemo(
    () => filtered.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0),
    [filtered]
  );

  const exportToCSV = (rows: MerchandiseTransactionData[]) => {
    if (!rows || rows.length === 0) {
      const headers = [
        "Invoice Number",
        "Nama Produk",
        "SKU",
        "Total Qty",
        "Total Price",
        "Transaction Status",
        "Voucher",
        "Creator",
      ];
      const csvContent = headers.join(",") + "\n";
      downloadCSV(csvContent);
      return;
    }

    const headers = [
      "Invoice Number",
      "Nama Produk",
      "SKU",
      "Total Qty",
      "Total Price",
      "Transaction Status",
      "Voucher",
      "Creator",
    ];
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
        escapeCell(r.product_name),
        escapeCell(r.sku),
        escapeCell(r.total_qty),
        escapeCell(r.total_price),
        escapeCell(getStatusInfo(r.transaction_status_id).text),
        escapeCell(r.voucher),
        escapeCell(r.creator_name),
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

  const handleViewDetail = (transaction: MerchandiseTransactionData) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
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

  const formatCurrency = (amount?: number | string) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  function onRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  }

  if (loading || loadingCreators) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // HAPUS KONDISI ERROR YANG MENAMPILKAN RED BOX
  // JIKA TERJADI ERROR, TETAP TAMPILKAN UI DENGAN DATA KOSONG

  const InfoCard = ({
    title,
    icon,
    children,
    color = "blue",
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: "blue" | "green" | "purple" | "orange" | "indigo" | "yellow";
  }) => {
    const colors = {
      blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      green: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
      orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
      indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200",
      yellow: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200",
    };

    return (
      <div
        className={`${colors[color]} rounded-xl border p-4 shadow-sm transition-all hover:shadow-md`}
      >
        <div className="flex items-center gap-2 mb-3 pb-2 border-b">
          <div
            className={`p-2 rounded-lg ${
              color === "blue"
                ? "bg-blue-100 text-blue-600"
                : color === "green"
                ? "bg-green-100 text-green-600"
                : color === "purple"
                ? "bg-purple-100 text-purple-600"
                : color === "orange"
                ? "bg-orange-100 text-orange-600"
                : color === "indigo"
                ? "bg-indigo-100 text-indigo-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {icon}
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    );
  };

  const InfoItem = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="flex items-start gap-2">
      {icon && <div className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-gray-800 break-words">{value}</div>
      </div>
    </div>
  );

  return (
    <Card className={`!overflow-auto`} p={20} m={10} withBorder>
      {/* Banner error (jika ada) tapi tidak mengganggu tampilan tabel */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 text-sm">{error}</span>
            </div>
            <button
              onClick={getData}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-50 border border-light-grey rounded-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-semibold">
                {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(page * rowsPerPage, filtered.length)}
              </span>{" "}
              of <span className="font-semibold">{filtered.length}</span> entries
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Merchandise
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price
              </div>
              <div className="text-lg font-semibold text-gray-800">
                Rp {totalPriceAllFiltered.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        aria-label="Transaction Tabs"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        className="mb-6"
      >
        <Tab key="transaksi" title="Transaksi">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto space-y-2 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center gap-2 w-full space-y-2 md:space-y-0">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder="Search by Invoice"
                    value={filterValue}
                    onChange={onSearchChange}
                    className="w-full md:w-64"
                    size="sm"
                    startContent={
                      <FontAwesomeIcon icon={faSearch} className="h-3.5 w-3.5 text-gray-400" />
                    }
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder="Filter by Product Name"
                    value={productFilter}
                    onChange={onProductFilterChange}
                    className="w-full md:w-64"
                    size="sm"
                    startContent={
                      <FontAwesomeIcon icon={faBox} className="h-3.5 w-3.5 text-gray-400" />
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => exportToCSV(filtered)}
                  className="px-3 py-2 rounded-md border border-light-grey bg-white hover:bg-gray-50 text-sm flex items-center gap-2 whitespace-nowrap"
                  title="Export to Excel"
                  disabled={filtered.length === 0}
                >
                  <FontAwesomeIcon icon={faDownload} className="h-4 w-4 text-green-600" />
                  <span>Export ({filtered.length})</span>
                </button>
              </div>
            </div>

            <select
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
              className="border border-light-grey p-2 rounded-md text-sm w-full md:w-auto"
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
            </select>
          </div>

          {/* TABLE - SELALU DITAMPILKAN, MESKIPUN ERROR */}
          <Table
            aria-label="Merchandise Transaction Table"
            style={{
              height: "auto",
              minWidth: "100%",
              backgroundColor: "white",
              borderRadius: "0px",
              padding: "0px",
            }}
            classNames={{
              base: "min-h-[300px]",
            }}
          >
            <TableHeader>
              <TableColumn width={50}>No</TableColumn>
              <TableColumn>Invoice Number</TableColumn>
              <TableColumn>Tanggal Order</TableColumn>
              <TableColumn>Nama Produk</TableColumn>
              <TableColumn>SKU</TableColumn>
              <TableColumn>Total Qty</TableColumn>
              <TableColumn>Total Price</TableColumn>
              <TableColumn>Transaction Status</TableColumn>
              <TableColumn>Voucher</TableColumn>
              <TableColumn>Creator</TableColumn>
              <TableColumn width={80}>Actions</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileInvoice} className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium text-lg">Data invoice tidak ada</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {filterValue || productFilter
                          ? `Tidak ditemukan invoice${
                              filterValue ? ` dengan kode "${filterValue}"` : ""
                            }${productFilter ? ` untuk produk "${productFilter}"` : ""}`
                          : error
                          ? "Gagal mengambil data dari server"
                          : "Belum ada data transaksi merchandise"}
                      </p>
                    </div>
                  </div>
                </div>
              }
            >
              {paginatedItems.map((item, index) => {
                const statusInfo = getStatusInfo(item.transaction_status_id);

                return (
                  <TableRow key={item.id}>
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{item.invoice_no}</TableCell>
                    <TableCell>{formatDate(item.order_date)}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.total_qty}</TableCell>
                    <TableCell>Rp {Number(item.total_price || 0).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    </TableCell>
                    <TableCell>{item.voucher}</TableCell>
                    <TableCell>{item.creator_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          title={`View details for ${item.invoice_no}`}
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filtered.length > 0 && (
            <div className="flex justify-start items-center gap-2 mt-4">
              <Pagination
                page={page}
                total={totalPages}
                onChange={(p) => setPage(Number(p))}
                className="items-center"
                size="sm"
              />
            </div>
          )}
        </Tab>

        <Tab key="pengiriman" title="Pengiriman">
          <div className="text-center py-12 text-gray-500">
            <p>Fitur Pengiriman akan segera hadir</p>
            <p className="text-sm mt-2">Sedang dalam pengembangan</p>
          </div>
        </Tab>
      </Tabs>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-gradient-to-b from-gray-50 to-white",
          backdrop: "backdrop-blur-sm",
          header: "border-b-0 px-6 pt-4 pb-3",
          footer: "border-t-0",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 py-3 bg-[#0b387c]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <FontAwesomeIcon icon={faFileInvoice} className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Detail Transaksi</h2>
                      <p className="text-xs text-white/90 opacity-90">
                        {selectedTransaction?.invoice_no || "-"}
                      </p>
                    </div>
                  </div>
                  {selectedTransaction && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        getStatusInfo(selectedTransaction.transaction_status_id).bgColor
                      } ${getStatusInfo(selectedTransaction.transaction_status_id).textColor}`}
                    >
                      {getStatusInfo(selectedTransaction.transaction_status_id).text}
                    </span>
                  )}
                </div>
              </ModalHeader>
              <ModalBody className="py-6 px-6">
                {selectedTransaction && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InfoCard
                        title="Ringkasan Transaksi"
                        icon={<FontAwesomeIcon icon={faReceipt} className="h-4 w-4" />}
                        color="blue"
                      >
                        <InfoItem
                          label="Invoice Number"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon
                                icon={faFileInvoice}
                                className="h-3 w-3 text-blue-500"
                              />
                              <span>{selectedTransaction.invoice_no || "-"}</span>
                            </div>
                          }
                        />
                        <InfoItem
                          label="Tanggal Order"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-green-500" />
                              <span>{formatDate(selectedTransaction.order_date)}</span>
                            </div>
                          }
                        />
                        <InfoItem
                          label="Voucher"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faTag} className="h-3 w-3 text-purple-500" />
                              <span
                                className={
                                  selectedTransaction.voucher === "-"
                                    ? "text-gray-400"
                                    : "text-gray-800"
                                }
                              >
                                {selectedTransaction.voucher === "-"
                                  ? "Tidak ada"
                                  : selectedTransaction.voucher}
                              </span>
                            </div>
                          }
                        />
                        <InfoItem
                          label="Metode Pembayaran"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon
                                icon={faCreditCard}
                                className="h-3 w-3 text-orange-500"
                              />
                              <span>{selectedTransaction.payment_method || "-"}</span>
                            </div>
                          }
                        />
                      </InfoCard>

                      <InfoCard
                        title="Informasi Produk"
                        icon={<FontAwesomeIcon icon={faBox} className="h-4 w-4" />}
                        color="purple"
                      >
                        <InfoItem
                          label="Nama Produk"
                          value={
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <p className="text-sm font-medium">
                                {selectedTransaction.product_name || "-"}
                              </p>
                            </div>
                          }
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <InfoItem
                            label="SKU"
                            value={
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                {selectedTransaction.sku || "-"}
                              </span>
                            }
                          />
                          <InfoItem
                            label="Quantity"
                            value={
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                {selectedTransaction.total_qty || 0} item
                              </span>
                            }
                          />
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-1">Total Harga</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(selectedTransaction.total_price)}
                          </p>
                        </div>
                      </InfoCard>

                      <InfoCard
                        title="Informasi Customer"
                        icon={<FontAwesomeIcon icon={faUser} className="h-4 w-4" />}
                        color="green"
                      >
                        <InfoItem
                          label="Nama Customer"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-gray-400" />
                              <span>{selectedTransaction.customer_name || "-"}</span>
                            </div>
                          }
                        />
                        <InfoItem
                          label="Email"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-gray-400" />
                              <span>{selectedTransaction.customer_email || "-"}</span>
                            </div>
                          }
                        />
                        <InfoItem
                          label="Telepon"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-gray-400" />
                              <span>
                                {typeof selectedTransaction.shipping_address === "object" &&
                                selectedTransaction.shipping_address?.phone
                                  ? selectedTransaction.shipping_address.phone
                                  : "-"}
                              </span>
                            </div>
                          }
                        />
                      </InfoCard>

                      <InfoCard
                        title="Informasi Creator"
                        icon={<FontAwesomeIcon icon={faStore} className="h-4 w-4" />}
                        color="indigo"
                      >
                        <InfoItem
                          label="Nama Creator"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faStore} className="h-3 w-3 text-indigo-400" />
                              <span>{selectedTransaction.creator_name || "-"}</span>
                            </div>
                          }
                        />
                        <InfoItem
                          label="Creator ID"
                          value={
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-gray-400" />
                              <span>{selectedTransaction.creator_id || "-"}</span>
                            </div>
                          }
                        />
                      </InfoCard>

                      <div className="lg:col-span-2">
                        <InfoCard
                          title="Alamat Pengiriman"
                          icon={<FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4" />}
                          color="orange"
                        >
                          <div className="p-3 bg-white border border-orange-100 rounded-lg">
                            <div className="flex items-start gap-3">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0"
                              />
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {formatShippingAddress(selectedTransaction.shipping_address)}
                              </p>
                            </div>
                          </div>
                        </InfoCard>
                      </div>

                      {selectedTransaction.detail &&
                        selectedTransaction.detail.length > 0 && (
                          <div className="lg:col-span-2">
                            <InfoCard
                              title={`Detail Item (${selectedTransaction.detail.length})`}
                              icon={<FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4" />}
                              color="yellow"
                            >
                              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {selectedTransaction.detail.map((item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-yellow-200 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        {item.product?.product_name ||
                                          item.product_name ||
                                          item.product?.name ||
                                          item.name ||
                                          `Item ${index + 1}`}
                                      </p>
                                      <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-gray-500">
                                          Qty: {item.quantity || item.qty || 0}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          SKU: {item.product?.sku || item.sku || "-"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Harga:{" "}
                                          {formatCurrency(
                                            item.price ||
                                              item.product?.price ||
                                              item.variant?.price
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-800">
                                        {formatCurrency(
                                          (item.quantity || item.qty || 0) *
                                            (Number(item.price) ||
                                              Number(item.product?.price) ||
                                              Number(item.variant?.price) ||
                                              0)
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">Subtotal</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </InfoCard>
                          </div>
                        )}

                      {selectedTransaction.notes && selectedTransaction.notes !== "-" && (
                        <div className="lg:col-span-2">
                          <InfoCard
                            title="Catatan"
                            icon={<FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />}
                            color="yellow"
                          >
                            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                              <p className="text-sm text-gray-700">{selectedTransaction.notes}</p>
                            </div>
                          </InfoCard>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="py-5 bg-gray-50 px-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    color="default"
                    variant="light"
                    onPress={handleCloseModal}
                    className="flex-1 sm:flex-none"
                  >
                    Tutup
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      color="primary"
                      variant="solid"
                      onPress={() => {
                        if (
                          selectedTransaction?.invoice_no &&
                          selectedTransaction.invoice_no !== "-"
                        ) {
                          const baseUrl =
                            process.env.NEXT_PUBLIC_URL_MERCH || window.location.origin;
                          const viewUrl = `${baseUrl}merch-invoice/${selectedTransaction.invoice_no}`;
                          window.open(viewUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                      isDisabled={
                        !selectedTransaction?.invoice_no || selectedTransaction.invoice_no === "-"
                      }
                      className="bg-[#194E9E] hover:bg-[#163C7A] text-white"
                      startContent={<FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />}
                    >
                      Lihat Invoice Lengkap
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default MerchandiseTransaction;