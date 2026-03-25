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
  Card as NextUICard,
  CardBody,
  Divider,
  Chip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Card as MantineCard } from "@mantine/core";
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
} from "@fortawesome/free-solid-svg-icons";
import useLoggedUser from "@/utils/useLoggedUser";

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
  shipping_address: string;
  shipping_status: "sent" | "pending";
  order_date: string;
  total_qty: number;
}

interface FilterOption {
  key: string;
  label: string;
}

const MerchandiseTransaction: React.FC = () => {
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

  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetailData['data'] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [shippingPage, setShippingPage] = useState<number>(1);
  const [shippingFilter, setShippingFilter] = useState<string>("");
  const [shippingStatusFilter, setShippingStatusFilter] = useState<string>("all");
  const [shippingRowsPerPage, setShippingRowsPerPage] = useState<number>(5);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<MerchandiseTransactionData | null>(null);

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

  const onShippingFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingFilter(e.target.value);
    setShippingPage(1);
  }, []);

  const onShippingStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setShippingStatusFilter(e.target.value);
    setShippingPage(1);
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
          text: "PAID",
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

  const getShippingStatusInfo = (status: "sent" | "pending") => {
    if (status === "sent") {
      return {
        text: "Terkirim",
        color: "bg-green-100 text-green-800 border-green-200",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: faCheckCircle,
      };
    } else {
      return {
        text: "Belum Terkirim",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        icon: faClock,
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
          return itemCreatorId === creatorId;
        });
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

  const generateResiHTML = (): string => {
    if (!invoiceDetail) return "";

    const courierName = getCourierName();
    const trackingNumber = getTrackingNumber();
    const senderName = user?.has_creator?.name || "deelestari";
    const senderPhone = invoiceDetail.user?.phone || "081287206604";
    const senderAddress = "Perumahan Diamond Valley blok A2 no 1, bedahan Sawangan, Jl. H. Sulaiman, Kec. Sawangan, Kota Depok, Jawa Barat (rumah paling pinggir A2/1 sebelum belokan), Sawangan, Depok, Jawa B...";

    const receiverName = invoiceDetail.address?.nama_penerima || "H****";
    const maskedReceiverName = receiverName.length > 1
      ? receiverName.charAt(0) + '*'.repeat(receiverName.length - 1)
      : receiverName;

    const receiverPhone = invoiceDetail.address?.phone || "0819****129";
    const maskedReceiverPhone = receiverPhone.length > 4
      ? receiverPhone.substring(0, 4) + '*'.repeat(receiverPhone.length - 7) + receiverPhone.substring(receiverPhone.length - 3)
      : receiverPhone;

    const receiverFullAddress = invoiceDetail.address
      ? `${invoiceDetail.address.address_detail}, ${invoiceDetail.address.city_id || ''}, ${invoiceDetail.address.province_id || ''}, ${invoiceDetail.address.zipcode || ''}`
      : "JL, Jakarta Timur, DKI Jakarta, 154, 6, 13850";

    const productItems = invoiceDetail.detail?.map(d => {
      const productName = d.product?.product_name || 'Produk';
      let variantInfo = '';

      if (d.variant) {
        const variantDisplay = formatVariantDisplay(d.variant);
        if (variantDisplay) {
          variantInfo = ` (${variantDisplay})`;
        }
      }

      return `${d.qty}x ${productName}${variantInfo}`;
    }).join(', ') || "2x tes varian, Perahu Kertas Dee Lestari (Not For Sale)";

    const totalQty = invoiceDetail.total_qty || 2;
    const courierService = invoiceDetail.courier?.courier_type || "reg";
    const deliveryPrice = invoiceDetail.delivery_price || 9000;
    const referenceNumber = invoiceDetail.invoice_no || "MERCH-17733343295LOH3D";

    const orderNotes = invoiceDetail.detail?.find(d => d.order_notes)?.order_notes || "mechanise deelestari";

    const generateBarcodeBars = () => {
      const chars = trackingNumber.split('');
      let bars = '';
      chars.forEach((char) => {
        const code = char.charCodeAt(0);
        const width = (code % 5 + 2) * 2;
        bars += `<div style="display: inline-block; width: ${width}px; height: 60px; background-color: #000000; margin-right: 2px; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>`;
      });
      return bars;
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
            .barcode-bars div {
              background-color: #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          .resi-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border: 2px solid #000;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: bold;
            margin: 0;
            color: #000;
            letter-spacing: 2px;
          }
          
          .header .subtitle {
            font-size: 14px;
            color: #000;
            margin-top: 5px;
            font-weight: normal;
          }
          
          .biteship {
            text-align: center;
            margin: 10px 0;
            font-size: 14px;
            color: #000;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          
          .tracking-number {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0;
            padding: 10px;
            border: 2px solid #000;
            background-color: #f9f9f9;
          }
          
          .barcode-container {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #000;
            background-color: #fff;
          }
          
          .barcode-bars {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 10px;
            background-color: #fff;
          }
          
          .barcode-bars div {
            display: inline-block;
            background-color: #000;
            height: 60px;
            margin-right: 2px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            forced-color-adjust: none;
          }
          
          .barcode-number {
            font-family: monospace;
            font-size: 14px;
            letter-spacing: 2px;
            margin-top: 10px;
            color: #000;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #000;
            font-size: 14px;
          }
          
          .reference {
            margin: 15px 0;
            padding: 10px;
            border: 2px solid #000;
            background-color: #f9f9f9;
          }
          
          .reference-label {
            font-weight: bold;
            margin-right: 10px;
            display: block;
            margin-bottom: 5px;
          }
          
          .reference-value {
            font-family: monospace;
            font-size: 14px;
            word-break: break-all;
          }
          
          .address-section {
            margin: 15px 0;
            border: 2px solid #000;
          }
          
          .address-box {
            padding: 12px;
          }
          
          .address-box:first-child {
            border-bottom: 2px solid #000;
          }
          
          .address-label {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
            text-decoration: underline;
          }
          
          .address-name {
            font-weight: bold;
            margin: 5px 0;
            font-size: 14px;
          }
          
          .address-phone {
            color: #000;
            margin: 5px 0;
            font-size: 14px;
          }
          
          .address-detail {
            line-height: 1.5;
            margin: 10px 0;
            padding: 10px;
            border: 2px solid #000;
            background-color: #f9f9f9;
            font-size: 13px;
          }
          
          .product-info {
            margin: 15px 0;
            padding: 12px;
            border: 2px solid #000;
            background-color: #f9f9f9;
          }
          
          .product-label {
            font-weight: bold;
            margin-bottom: 8px;
            display: block;
            text-decoration: underline;
          }
          
          .product-detail {
            font-size: 14px;
            line-height: 1.5;
          }
          
          .notes {
            margin: 15px 0;
            padding: 10px;
            border: 2px solid #000;
            background-color: #f9f9f9;
            font-style: italic;
            font-size: 14px;
          }
          
          .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #000;
            text-align: center;
            font-size: 12px;
            color: #000;
          }
          
          .dashed-line {
            border-bottom: 1px dashed #000;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="resi-container">
          <div class="header">
            <h1>${courierName}</h1>
            <div class="subtitle">EXPRESS ACROSS NATIONS</div>
          </div>
          
          <div class="biteship">kolektix.com</div>
          
          <div class="tracking-number">
            Nomor Resi - ${trackingNumber}
          </div>
          
          <div class="barcode-container">
            <div class="barcode-bars">
              ${generateBarcodeBars()}
            </div>
            <div class="barcode-number">${trackingNumber}</div>
          </div>
          
          <div class="info-row">
            <span><strong>Ongkos Kirim:</strong> Rp. ${deliveryPrice.toLocaleString('id-ID')}</span>
            <span><strong>Jenis Layanan</strong> - ${courierService}</span>
          </div>
          
          <div class="reference">
            <span class="reference-label">Reference Number</span>
            <div class="reference-value">${referenceNumber}</div>
          </div>
          
          <div class="address-section">
            <div class="address-box">
              <div class="address-label">Alamat Penerima:</div>
              <div class="address-name">${receiverName} - ${receiverPhone}</div>
            </div>
            
            <div class="address-box">
              <div class="address-label">Alamat Pengirim:</div>
              <div class="address-name">${senderName}</div>
              <div class="address-phone">${senderPhone}</div>
            </div>
          </div>
          
          <div class="address-detail">
            ${receiverFullAddress}
          </div>
          
          <div class="dashed-line"></div>
          
          <div class="address-detail">
            ${senderAddress}
          </div>
          
          <div class="product-info">
            <span class="product-label">Jenis Barang:</span>
            <div class="product-detail">${productItems} - Fashion</div>
          </div>
          
          <div class="notes">
            <em>Catatan: ${orderNotes}</em>
          </div>
          
          <div class="footer">
            Pengiriman dari Warehouse<br>
            kolektix.com
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintResi = () => {
    const trackingNumber = getTrackingNumber();
    if (!invoiceDetail || trackingNumber === "-") return;

    const resiHTML = generateResiHTML();
    const blob = new Blob([resiHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }

    setTimeout(() => URL.revokeObjectURL(url), 1000);
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

  const shippingData = useMemo(() => {
    const shippingItems: ShippingData[] = dataWithCreatorNames
      .filter(item =>
        item.transaction_status_id === 2 &&
        item.shipping_address &&
        item.shipping_address !== "-"
      )
      .map(item => ({
        id: item.id,
        invoice_no: item.invoice_no || "-",
        product_name: item.product_name || "-",
        customer_name: item.customer_name || "-",
        shipping_address: formatShippingAddress(item.shipping_address),
        shipping_status: "pending" as const,
        order_date: item.order_date || "-",
        total_qty: item.total_qty || 0,
      }));

    return shippingItems;
  }, [dataWithCreatorNames]);

  const filteredShippingData = useMemo(() => {
    let result = shippingData;

    if (shippingFilter) {
      const searchLower = shippingFilter.toLowerCase();
      result = result.filter(item =>
        item.invoice_no.toLowerCase().includes(searchLower) ||
        item.product_name.toLowerCase().includes(searchLower) ||
        item.customer_name.toLowerCase().includes(searchLower) ||
        item.shipping_address.toLowerCase().includes(searchLower)
      );
    }

    if (shippingStatusFilter !== "all") {
      result = result.filter(item => item.shipping_status === shippingStatusFilter);
    }

    result = [...result].sort((a, b) => {
      const dateA = parseDate(a.order_date);
      const dateB = parseDate(b.order_date);
      return dateB.getTime() - dateA.getTime();
    });

    return result;
  }, [shippingData, shippingFilter, shippingStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const shippingTotalPages = Math.max(1, Math.ceil(filteredShippingData.length / shippingRowsPerPage));
  const paginatedShippingItems = filteredShippingData.slice(
    (shippingPage - 1) * shippingRowsPerPage,
    shippingPage * shippingRowsPerPage
  );

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

  function onShippingRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setShippingRowsPerPage(Number(event.target.value));
    setShippingPage(1);
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
    <MantineCard className="!overflow-auto" p={20} m={10} withBorder>
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
              Showing{' '}
              <span className="font-semibold">
                {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold">
                {Math.min(page * rowsPerPage, filtered.length)}
              </span>{' '}
              of <span className="font-semibold">{filtered.length}</span> entries
            </div>
            {activeFiltersCount > 0 && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="h-3 w-3" />
                <span>{activeFiltersCount} filter aktif</span>
                <button
                  onClick={clearAllFilters}
                  className="ml-2 text-blue-800 hover:text-blue-900"
                  title="Hapus semua filter"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Transaksi
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {filtered.length} item{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaksi Berhasil
              </div>
              <div className="text-lg font-semibold text-green-600">
                {totalSuccessfulTransactions}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price (Berhasil)
              </div>
              <div className="text-lg font-semibold text-gray-800">
                Rp {totalPriceAllFiltered.toLocaleString('id-ID')}
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

                <div className="flex items-center gap-2 w-full md:w-64">
                  <select
                    value={selectedProduct}
                    onChange={onProductChange}
                    className="w-full border border-light-grey p-2 rounded-md text-sm"
                  >
                    <option value="all">Semua Produk</option>
                    {productOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder="Filter by Varian"
                    value={variantFilter}
                    onChange={onVariantFilterChange}
                    className="w-full md:w-48"
                    size="sm"
                    startContent={
                      <FontAwesomeIcon icon={faPalette} className="h-3.5 w-3.5 text-gray-400" />
                    }
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Input
                    type="date"
                    placeholder="Filter by Date"
                    value={dateFilter}
                    onChange={onDateFilterChange}
                    className="w-full md:w-48"
                    size="sm"
                    startContent={
                      <FontAwesomeIcon icon={faCalendarAlt} className="h-3.5 w-3.5 text-gray-400" />
                    }
                  />
                  {dateFilter && (
                    <button
                      onClick={clearDateFilter}
                      className="px-2 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Clear date filter"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => exportToCSV(filtered)}
                  className="px-3 py-2 rounded-md border border-light-grey bg-white hover:bg-gray-50 text-sm flex items-center gap-2 whitespace-nowrap"
                  title="Export to Excel"
                  disabled={filtered.length === 0}
                >
                  <FontAwesomeIcon icon={faDownload} className="h-4 w-4 text-green-600" />
                  <span>Export ({totalSuccessfulTransactions})</span>
                </button>
              </div>
            </div>

            <select
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
              className="border border-light-grey p-2 rounded-md text-sm w-full md:w-auto"
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
            </select>
          </div>

          {variantFilter && (
            <div className="mb-4 p-2 bg-purple-50 border border-purple-200 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <FontAwesomeIcon icon={faPalette} className="h-3 w-3" />
                <span>Filter varian: <strong>&quot;{variantFilter}&quot;</strong></span>
              </div>
              <button
                onClick={() => setVariantFilter('')}
                className="text-purple-700 hover:text-purple-900"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </div>
          )}

          <Table
            aria-label="Merchandise Transaction Table"
            style={{
              height: 'auto',
              minWidth: '100%',
              backgroundColor: 'white',
              borderRadius: '0px',
              padding: '0px',
            }}
            classNames={{
              base: 'min-h-[300px]',
            }}
          >
            <TableHeader>
              <TableColumn width={50}>No</TableColumn>
              <TableColumn>Invoice Number</TableColumn>
              <TableColumn>Tanggal Order</TableColumn>
              <TableColumn>Nama Produk & Varian</TableColumn>
              <TableColumn>SKU</TableColumn>
              <TableColumn>Total Qty</TableColumn>
              <TableColumn>Total Price</TableColumn>
              <TableColumn>Transaction Status</TableColumn>
              <TableColumn>Voucher</TableColumn>
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
                        {filterValue || selectedProduct !== 'all' || variantFilter || dateFilter
                          ? 'Tidak ditemukan invoice dengan filter yang dipilih'
                          : error
                            ? 'Gagal mengambil data dari server'
                            : 'Belum ada data transaksi merchandise'}
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
                    <TableCell>
                      {item.detail && item.detail.length > 0 ? (
                        <ProductCell details={item.detail} />
                      ) : (
                        <span>{item.product_name}</span>
                      )}
                    </TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.total_qty}</TableCell>
                    <TableCell>Rp {Number(item.total_price || 0).toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    </TableCell>
                    <TableCell>{item.voucher}</TableCell>
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
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <Input
                type="text"
                placeholder="Cari invoice, produk, pemesan, atau alamat..."
                value={shippingFilter}
                onChange={onShippingFilterChange}
                className="w-full md:w-80"
                size="sm"
                startContent={
                  <FontAwesomeIcon icon={faSearch} className="h-3.5 w-3.5 text-gray-400" />
                }
              />
              <select
                onChange={onShippingStatusFilterChange}
                value={shippingStatusFilter}
                className="border border-light-grey p-2 rounded-md text-sm w-full md:w-48"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Belum Terkirim</option>
                <option value="sent">Terkirim</option>
              </select>
            </div>

            <select
              onChange={onShippingRowsPerPageChange}
              value={shippingRowsPerPage}
              className="border border-light-grey p-2 rounded-md text-sm w-full md:w-auto"
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
            </select>
          </div>

          <Table
            aria-label="Shipping Table"
            style={{
              height: 'auto',
              minWidth: '100%',
              backgroundColor: 'white',
              borderRadius: '0px',
              padding: '0px',
            }}
            classNames={{
              base: 'min-h-[300px]',
            }}
          >
            <TableHeader>
              <TableColumn width={50}>No</TableColumn>
              <TableColumn>Invoice Number</TableColumn>
              <TableColumn>Nama Produk</TableColumn>
              <TableColumn>Nama Pemesan</TableColumn>
              <TableColumn>Alamat Tujuan</TableColumn>
              <TableColumn>Status Pengiriman</TableColumn>
              <TableColumn width={80}>Actions</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faTruck} className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium text-lg">
                        {shippingFilter || shippingStatusFilter !== 'all'
                          ? 'Tidak ditemukan data pengiriman'
                          : 'Belum ada data pengiriman'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {shippingFilter || shippingStatusFilter !== 'all'
                          ? 'Coba ubah filter pencarian Anda'
                          : 'Data pengiriman akan muncul ketika ada transaksi berhasil'}
                      </p>
                    </div>
                  </div>
                </div>
              }
            >
              {paginatedShippingItems.map((item, index) => {
                const statusInfo = getShippingStatusInfo(item.shipping_status);

                return (
                  <TableRow key={item.id}>
                    <TableCell>{(shippingPage - 1) * shippingRowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <span className="font-medium">{item.invoice_no}</span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <span className="text-sm">{item.product_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-gray-400" />
                        <span>{item.customer_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 max-w-xs">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item.shipping_address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                      >
                        <FontAwesomeIcon icon={statusInfo.icon} className="h-3 w-3" />
                        {statusInfo.text}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          const transaction = dataWithCreatorNames.find(d => d.id === item.id);
                          if (transaction) handleViewDetail(transaction);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        title={`View details for ${item.invoice_no}`}
                      >
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredShippingData.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-700">
                Menampilkan {filteredShippingData.length} data pengiriman
              </div>
              <Pagination
                page={shippingPage}
                total={shippingTotalPages}
                onChange={(p) => setShippingPage(Number(p))}
                className="items-center"
                size="sm"
              />
            </div>
          )}
        </Tab>
      </Tabs>

      <Modal
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
                    <Button
                      color="default"
                      variant="light"
                      onPress={handleCloseModal}
                      className="min-w-[100px]"
                      size="sm"
                    >
                      Tutup
                    </Button>
                    {trackingNumber !== '-' && (
                      <Button
                        color="secondary"
                        variant="flat"
                        onPress={handlePrintResi}
                        className="min-w-[120px]"
                        size="sm"
                        startContent={<FontAwesomeIcon icon={faPrint} className="h-3.5 w-3.5" />}
                      >
                        Cetak Resi
                      </Button>
                    )}
                    <Button
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
                    </Button>
                  </div>
                </ModalFooter>
              </>
            )
          }}
        </ModalContent>
      </Modal>
    </MantineCard>
  );
};

export default MerchandiseTransaction;