// // import React, { useEffect, useState, useCallback } from "react";
// // import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Input, Pagination } from "@nextui-org/react";
// // import { Card } from "@mantine/core";
// // import { Get } from "@/utils/REST";

// // interface MerchandiseTransactionData {
// //   id: number;
// //   invoice_no: string;
// //   product_name: string;
// //   sku: number;
// //   total_qty: number;
// //   total_price: number;
// //   transaction_status_id: number;
// //   voucher: number;
// // }

// // const MerchandiseTransaction = () => {
// //   const [data, setData] = useState<MerchandiseTransactionData[]>([]);
// //   const [loading, setLoading] = useState<boolean>(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [rowsPerPage, setRowsPerPage] = useState(5);
// //   const [filterValue, setFilterValue] = useState("");
// //   const [page, setPage] = useState(1);

// //   const onSearchChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
// //     setFilterValue(e.target.value);
// //   }, []);

// //   useEffect(() => {
// //     getData();
// //   }, []);

// //   const getData = () => {
// //     setLoading(true);
// //     Get("order-bycreator", {})
// //       .then((res: any) => {
// //         setData(res.data);
// //         setLoading(false);
// //         setError(null);
// //       })
// //       .catch((err: any) => {
// //         setLoading(false);
// //         setError(err.message);
// //       });
// //   };

// //   console.log(data);

// //   const fi = new Proxy(data, {
// //     get(target, prop, receiver) {
// //       if (prop === "filter") {
// //         return (callback: any) => {
// //           return Array.prototype.filter.call(target, (item: MerchandiseTransactionData) => item.invoice_no.toLowerCase().includes(filterValue.toLowerCase()));
// //         };
// //       }
// //       return Reflect.get(target, prop, receiver);
// //     },
// //   }).filter(() => true);

// //   const totalPages = Math.ceil(fi.length / rowsPerPage);
// //   const paginatedItems = fi.slice((page - 1) * rowsPerPage, page * rowsPerPage);

// //   if (loading) {
// //     return <div>Loading...</div>;
// //   }

// //   if (error) {
// //     return <div>Error: {error}</div>;
// //   }

// //   function onRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
// //     setRowsPerPage(Number(event.target.value));
// //     setPage(1);
// //   }

// //   return (
// //     <>
// //       <Card className={`!overflow-auto`} p={20} m={10} withBorder>
// //         <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
// //           <Input type="text" placeholder="Search by Invoice" value={filterValue} onChange={onSearchChange} />
// //           <select onChange={onRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md w-full md:w-auto">
// //             {/*<option value={1}>1</option>*/}
// //             <option value={5}>5</option>
// //             <option value={10}>10</option>
// //             <option value={20}>20</option>
// //           </select>
// //         </div>

// //         {data.length > 0 ? (
// //           <>
// //             <Table
// //               aria-label="Merchandise Transaction Table"
// //               style={{
// //                 height: "auto",
// //                 minWidth: "100%",
// //                 backgroundColor: "white",
// //                 borderRadius: "0px",
// //                 padding: "0px",
// //               }}
// //             >
// //               <TableHeader>
// //                 <TableColumn>Invoice Number</TableColumn>
// //                 <TableColumn>Nama Produk</TableColumn>
// //                 <TableColumn>SKU</TableColumn>
// //                 <TableColumn>Total Qty</TableColumn>
// //                 <TableColumn>Total Price</TableColumn>
// //                 <TableColumn>Transcation Status ID</TableColumn>
// //                 <TableColumn>Voucher</TableColumn>
// //               </TableHeader>
// //               <TableBody>
// //                 {paginatedItems.map((item: MerchandiseTransactionData) => (
// //                   <TableRow key={item.id}>
// //                     <TableCell>{item.invoice_no}</TableCell>
// //                     <TableCell>{item.product_name}</TableCell>
// //                     <TableCell>{item.sku}</TableCell>
// //                     <TableCell>{item.total_qty}</TableCell>
// //                     <TableCell>{item.total_price}</TableCell>
// //                     <TableCell>{item.transaction_status_id}</TableCell>
// //                     <TableCell>{item.voucher}</TableCell>
// //                   </TableRow>
// //                 ))}
// //               </TableBody>
// //             </Table>

// //             <div className="flex justify-start items-center gap-2 mt-4">
// //               <Pagination page={page} total={totalPages} onChange={setPage} className="items-center" />
// //             </div>
// //           </>
// //         ) : (
// //           <div>No data available</div>
// //         )}
// //       </Card>
// //     </>
// //   );
// // };

// // export default MerchandiseTransaction;

// import React, { useEffect, useState, useCallback } from "react";
// import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Input, Pagination } from "@nextui-org/react";
// import { Card } from "@mantine/core";
// import { Get } from "@/utils/REST";

// interface MerchandiseTransactionData {
//   id: number;
//   invoice_no?: string;
//   product_name?: string;
//   sku?: number | string;
//   total_qty?: number;
//   total_price?: number | string;
//   transaction_status_id?: number;
//   voucher?: number | string;
// }

// const MerchandiseTransaction: React.FC = () => {
//   const [data, setData] = useState<MerchandiseTransactionData[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(5);
//   const [filterValue, setFilterValue] = useState<string>("");
//   const [page, setPage] = useState<number>(1);

//   const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setFilterValue(e.target.value);
//     setPage(1);
//   }, []);

//   useEffect(() => {
//     getData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const getData = async () => {
//     setLoading(true);
//     try {
//       const res: any = await Get("order-bycreator", {});
//       // Map response to flatten product_name and normalize fields
//       const mapped: MerchandiseTransactionData[] = (res?.data || []).map((item: any) => {
//         // --- NEW: collect ALL product names from detail[] (fallbacks included) ---
//         const productNames: string[] = [];

//         // If there's a detail array, iterate and collect names from known places
//         if (Array.isArray(item.detail) && item.detail.length > 0) {
//           item.detail.forEach((d: any) => {
//             // d.product may be object with product_name
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

//         // If no names found yet, check other possible fields on root item
//         if (productNames.length === 0) {
//           if (item?.product && (item.product.product_name || item.product.name)) {
//             productNames.push(item.product.product_name ?? item.product.name);
//           } else if (item?.product_name) {
//             productNames.push(item.product_name);
//           } else if (item?.name) {
//             productNames.push(item.name);
//           }
//         }

//         // join all names with a separator so they show as a single cell (but include all)
//         const productName = productNames.length > 0 ? productNames.join(" | ") : "-";
//         // --- END NEW ---

//         return {
//           id: item.id ?? item.order_product_id ?? 0,
//           invoice_no: item.invoice_no ?? item.invoiceNo ?? item.invoice ?? "-",
//           product_name: productName,
//           sku: item.sku ?? item.product?.sku ?? "-",
//           total_qty: item.total_qty ?? item.qty ?? (item.detail && item.detail[0] && item.detail[0].quantity) ?? 0,
//           total_price: item.total_price ?? item.price ?? item.delivery_price ?? item.price_total ?? item.price_formatted ?? 0,
//           transaction_status_id: item.transaction_status_id ?? item.status_id ?? 0,
//           voucher: item.voucher ?? item.voucher_code ?? "-",
//         };
//       });

//       setData(mapped);
//       setError(null);
//     } catch (err: any) {
//       setError(err?.message ?? "Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // simple, readable filter by invoice_no (case-insensitive)
//   const filtered = data.filter((item) => (item.invoice_no ?? "").toString().toLowerCase().includes(filterValue.toLowerCase()));

//   const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
//   const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//   // --- Export to CSV (can be opened in Excel) ---
//   const exportToCSV = (rows: MerchandiseTransactionData[]) => {
//     if (!rows || rows.length === 0) {
//       // create a minimal CSV with headers to avoid empty file
//       const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status ID", "Voucher"];
//       const csvContent = headers.join(",") + "\n";
//       downloadCSV(csvContent);
//       return;
//     }

//     const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status ID", "Voucher"];
//     const escapeCell = (value: any) => {
//       if (value === null || value === undefined) return "";
//       const str = String(value);
//       // Escape double quotes by doubling them, and wrap cell in quotes if contains comma/newline/quote
//       const needsQuotes = /[,"\n]/.test(str);
//       const escaped = str.replace(/"/g, '""');
//       return needsQuotes ? `"${escaped}"` : escaped;
//     };

//     const lines = rows.map((r) => [escapeCell(r.invoice_no), escapeCell(r.product_name), escapeCell(r.sku), escapeCell(r.total_qty), escapeCell(r.total_price), escapeCell(r.transaction_status_id), escapeCell(r.voucher)].join(","));

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
//       // fallback: open in new tab
//       const win = window.open();
//       if (win) {
//         win.document.write(`<pre>${csvContent}</pre>`);
//         win.document.close();
//       }
//     }
//   };
//   // --- end export functions ---

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   function onRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
//     setRowsPerPage(Number(event.target.value));
//     setPage(1);
//   }

//   return (
//     <Card className={`!overflow-auto`} p={20} m={10} withBorder>
//       <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
//         <Input type="text" placeholder="Search by Invoice" value={filterValue} onChange={onSearchChange} />
//         <select onChange={onRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md w-full md:w-auto">
//           <option value={5}>5</option>
//           <option value={10}>10</option>
//           <option value={20}>20</option>
//         </select>
//       </div>

//       {/* Tambahan 1 row untuk export Excel/CSV */}
//       <div className="flex items-center justify-start gap-2 mb-4">
//         <button type="button" onClick={() => exportToCSV(filtered)} className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm">
//           Export (Open in Excel)
//         </button>
//         <span className="text-xs text-gray-500">Export dari data hasil filter saat ini</span>
//       </div>

//       {data.length > 0 ? (
//         <>
//           <Table
//             aria-label="Merchandise Transaction Table"
//             style={{
//               height: "auto",
//               minWidth: "100%",
//               backgroundColor: "white",
//               borderRadius: "0px",
//               padding: "0px",
//             }}
//           >
//             <TableHeader>
//               <TableColumn>Invoice Number</TableColumn>
//               <TableColumn>Nama Produk</TableColumn>
//               <TableColumn>SKU</TableColumn>
//               <TableColumn>Total Qty</TableColumn>
//               <TableColumn>Total Price</TableColumn>
//               <TableColumn>Transaction Status ID</TableColumn>
//               <TableColumn>Voucher</TableColumn>
//             </TableHeader>
//             <TableBody>
//               {paginatedItems.map((item) => (
//                 <TableRow key={item.id}>
//                   <TableCell>{item.invoice_no}</TableCell>
//                   <TableCell>{item.product_name}</TableCell>
//                   <TableCell>{item.sku}</TableCell>
//                   <TableCell>{item.total_qty}</TableCell>
//                   <TableCell>{item.total_price}</TableCell>
//                   <TableCell>{item.transaction_status_id}</TableCell>
//                   <TableCell>{item.voucher}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           <div className="flex justify-start items-center gap-2 mt-4">
//             <Pagination page={page} total={totalPages} onChange={(p) => setPage(Number(p))} className="items-center" />
//           </div>
//         </>
//       ) : (
//         <div>No data available</div>
//       )}
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
  Divider
} from "@nextui-org/react";
import { Card } from "@mantine/core";
import { Get } from "@/utils/REST";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faFileInvoice, faUser, faBox, faShoppingCart, faTruck, faReceipt, faTag, faCalendar, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

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
  // Tambahan field untuk modal detail
  detail?: any[];
  order_date?: string;
  customer_name?: string;
  customer_email?: string;
  shipping_address?: ShippingAddress | string;
  // Tambahan field dari response API
  status_name?: string;
  payment_method?: string;
  notes?: string;
}

const MerchandiseTransaction: React.FC = () => {
  const [data, setData] = useState<MerchandiseTransactionData[]>([]);
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filterValue, setFilterValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState<string>("transaksi");
  const [selectedCreator, setSelectedCreator] = useState<string>("all");
  const [loadingCreators, setLoadingCreators] = useState<boolean>(false);

  // State untuk modal detail
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<MerchandiseTransactionData | null>(null);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setPage(1);
  }, []);

  const onCreatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCreator(e.target.value);
    setPage(1);
  };

  // Fungsi untuk mendapatkan status dan warna berdasarkan transaction_status_id
  const getStatusInfo = (statusId?: number) => {
    switch (statusId) {
      case 1: // pending
        return {
          text: "Pending",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
      case 2: // success
        return {
          text: "Success",
          color: "bg-green-100 text-green-800 border-green-200",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
        };
      case 3: // failed
        return {
          text: "Failed",
          color: "bg-red-100 text-red-800 border-red-200",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
        };
      case 4: // expired
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

  // Fungsi untuk format shipping address
  const formatShippingAddress = (address: ShippingAddress | string | undefined): string => {
    if (!address) return "-";

    if (typeof address === "string") return address;

    // Jika address adalah object
    const addr = address as ShippingAddress;

    // Buat string address dari object
    const parts: string[] = [];

    if (addr.nama_penerima) {
      parts.push(addr.nama_penerima);
    }

    if (addr.address_detail) {
      parts.push(addr.address_detail);
    }

    if (addr.address_name) {
      parts.push(addr.address_name);
    }

    if (addr.phone) {
      parts.push(`Telp: ${addr.phone}`);
    }

    return parts.length > 0 ? parts.join(", ") : "-";
  };

  // Fetch data creators
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

  // Fetch transaction data
  const getData = async () => {
    setLoading(true);
    try {
      const res: any = await Get("order-bycreator", {});
      // Map response to flatten product_name and normalize fields
      const mapped: MerchandiseTransactionData[] = (res?.data || []).map((item: any) => {
        // Collect ALL product names from detail[]
        const productNames: string[] = [];

        // If there's a detail array, iterate and collect names from known places
        if (Array.isArray(item.detail) && item.detail.length > 0) {
          item.detail.forEach((d: any) => {
            // d.product may be object with product_name
            if (d?.product && (d.product.product_name || d.product_name)) {
              productNames.push(d.product.product_name ?? d.product_name);
            } else if (d?.product_name) {
              productNames.push(d.product_name);
            } else if (d?.name) {
              productNames.push(d.name);
            } else if (d?.product && typeof d.product === "string") {
              productNames.push(d.product);
            }
          });
        }

        // If no names found yet, check other possible fields on root item
        if (productNames.length === 0) {
          if (item?.product && (item.product.product_name || item.product.name)) {
            productNames.push(item.product.product_name ?? item.product.name);
          } else if (item?.product_name) {
            productNames.push(item.product_name);
          } else if (item?.name) {
            productNames.push(item.name);
          }
        }

        // Join all names with a separator
        const productName = productNames.length > 0 ? productNames.join(" | ") : "-";

        // Get creator info from transaction data
        let creatorId = 0;
        let creatorName = "Unknown";

        // Priority 1: Jika ada creator object lengkap
        if (item.creator?.id) {
          creatorId = item.creator.id;
          creatorName = item.creator.name || item.creator.username || item.creator.email || "Unknown";
        }
        // Priority 2: Jika ada creator_id langsung
        else if (item.creator_id) {
          creatorId = item.creator_id;
        }
        // Priority 3: Jika ada user_id
        else if (item.user_id) {
          creatorId = parseInt(item.user_id) || 0;
        }

        // Format shipping address
        const shippingAddress = item.shipping_address || item.address || "-";

        return {
          id: item.id ?? item.order_product_id ?? 0,
          invoice_no: item.invoice_no ?? item.invoiceNo ?? item.invoice ?? "-",
          product_name: productName,
          sku: item.sku ?? item.product?.sku ?? "-",
          total_qty: item.total_qty ?? item.qty ?? (item.detail && item.detail[0] && item.detail[0].quantity) ?? 0,
          total_price: item.total_price ?? item.price ?? item.delivery_price ?? item.price_total ?? item.price_formatted ?? 0,
          transaction_status_id: item.transaction_status_id ?? item.status_id ?? 0,
          voucher: item.voucher ?? item.voucher_code ?? "-",
          creator_id: creatorId,
          creator_name: creatorName,
          // Tambahan data untuk modal
          detail: item.detail || [],
          order_date: item.created_at || item.order_date || item.date || "-",
          customer_name: item.customer_name || item.customer?.name || item.nama_penerima || "-",
          customer_email: item.customer_email || item.customer?.email || "-",
          shipping_address: shippingAddress,
          // Tambahan field
          status_name: item.status_name || item.status?.name || "-",
          payment_method: item.payment_method || item.payment?.method || "-",
          notes: item.notes || item.note || "-",
        };
      });

      setData(mapped);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch both data in parallel
    Promise.all([getData(), getCreators()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update creator names when creators data is loaded
  const dataWithCreatorNames = useMemo(() => {
    if (creators.length === 0) return data;

    return data.map((item) => {
      // Find creator by id - IMPROVED MATCHING LOGIC
      const foundCreator = creators.find((creator) => {
        // Match by creator.id
        if (creator.id === item.creator_id) return true;
        // Match by creator.has_user.id
        if (creator.has_user?.id === item.creator_id) return true;
        // Match by creator.user_id (converted to number)
        if (parseInt(creator.user_id) === item.creator_id) return true;
        return false;
      });

      if (foundCreator) {
        return {
          ...item,
          creator_name: foundCreator.has_user?.name || foundCreator.name || "Unknown",
          // Ensure creator_id is consistent with creator's id
          creator_id: foundCreator.id,
        };
      }

      return item;
    });
  }, [data, creators]);

  // Filter data by creator and invoice search
  const filtered = useMemo(() => {
    let result = dataWithCreatorNames;

    // Filter by creator
    if (selectedCreator !== "all") {
      const [creatorId] = selectedCreator.split("-");
      result = result.filter((item) => item.creator_id?.toString() === creatorId);
    }

    // Filter by invoice number
    if (filterValue) {
      result = result.filter((item) => (item.invoice_no ?? "").toString().toLowerCase().includes(filterValue.toLowerCase()));
    }

    return result;
  }, [dataWithCreatorNames, selectedCreator, filterValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Hitung total merchandise (jumlah item yang ditampilkan di halaman ini)
  const totalMerchandiseInPage = useMemo(() => {
    return paginatedItems.length;
  }, [paginatedItems]);

  // Hitung total price dari item yang ditampilkan di halaman ini
  const totalPriceInPage = useMemo(() => {
    return paginatedItems.reduce((sum, item) => {
      const price = Number(item.total_price) || 0;
      return sum + price;
    }, 0);
  }, [paginatedItems]);

  // Hitung total price dari SEMUA item yang difilter
  const totalPriceAllFiltered = useMemo(() => {
    return filtered.reduce((sum, item) => {
      const price = Number(item.total_price) || 0;
      return sum + price;
    }, 0);
  }, [filtered]);

  // --- Export to CSV (can be opened in Excel) ---
  const exportToCSV = (rows: MerchandiseTransactionData[]) => {
    if (!rows || rows.length === 0) {
      // Create a minimal CSV with headers to avoid empty file
      const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status", "Voucher", "Creator"];
      const csvContent = headers.join(",") + "\n";
      downloadCSV(csvContent);
      return;
    }

    const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status", "Voucher", "Creator"];
    const escapeCell = (value: any) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // Escape double quotes by doubling them, and wrap cell in quotes if contains comma/newline/quote
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
      // Fallback: open in new tab
      const win = window.open();
      if (win) {
        win.document.write(`<pre>${csvContent}</pre>`);
        win.document.close();
      }
    }
  };
  // --- end export functions ---

  // Function to open modal detail
  const handleViewDetail = (transaction: MerchandiseTransactionData) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  // Format date
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

  // Format currency
  const formatCurrency = (amount?: number | string) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  function onRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  }

  if (loading || loadingCreators) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className={`!overflow-auto`} p={20} m={10} withBorder>
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penjualan</h3>
          <p className="text-lg font-semibold mt-1 text-gray-800">Rp {totalPriceAllFiltered.toLocaleString("id-ID")}</p>
          {selectedCreator !== "all" && <p className="text-xs text-gray-500 mt-1">(Filtered by creator)</p>}
        </div>
        <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Dikirim</h3>
          <p className="text-lg font-semibold mt-1 text-gray-800">{filtered.filter((item) => item.transaction_status_id === 3).length} transaksi</p>
        </div>
        <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pengambilan</h3>
          <p className="text-lg font-semibold mt-1 text-gray-800 text-sm">
            Diambil {filtered.filter((item) => item.transaction_status_id === 4).length} / {filtered.length} transaksi
          </p>
        </div>
        <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Merchandise</h3>
          <p className="text-lg font-semibold mt-1 text-gray-800">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </p>
          {selectedCreator !== "all" && <p className="text-xs text-gray-500 mt-1">(Filtered)</p>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs aria-label="Transaction Tabs" selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)} className="mb-6">
        <Tab key="transaksi" title="Transaksi">
          {/* Search, Filter, Export, and Pagination Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto space-y-2 md:space-y-0">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Input type="text" placeholder="Search by Invoice" value={filterValue} onChange={onSearchChange} className="w-full md:w-64" size="sm" />
                <select value={selectedCreator} onChange={onCreatorChange} className="border border-light-grey p-2 rounded-md text-sm w-full md:w-48" disabled={loadingCreators}>
                  <option value="all">All Creators</option>
                  {creators.map((creator) => (
                    <option key={creator.id} value={`${creator.id}-${creator.name}`}>
                      {creator.has_user?.name || creator.name}
                    </option>
                  ))}
                </select>
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

            <select onChange={onRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md text-sm w-full md:w-auto">
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
            </select>
          </div>

          {/* Filter Status Indicator */}
          {selectedCreator !== "all" && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-700">
                    Showing transactions for: <strong>{creators.find((c) => c.id.toString() === selectedCreator.split("-")[0])?.has_user?.name || creators.find((c) => c.id.toString() === selectedCreator.split("-")[0])?.name}</strong>
                  </span>
                </div>
                <button onClick={() => setSelectedCreator("all")} className="text-sm text-blue-600 hover:text-blue-800 underline">
                  Clear filter
                </button>
              </div>
            </div>
          )}

          {/* Perbaikan di sini: Tampilkan pesan berbeda berdasarkan kondisi */}
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data available</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedCreator !== "all"
                ? `No transactions found for selected creator${filterValue ? ` and invoice containing "${filterValue}"` : ""}`
                : `No transactions found${filterValue ? ` for invoice containing "${filterValue}"` : ""}`}
            </div>
          ) : (
            <>
              <Table
                aria-label="Merchandise Transaction Table"
                style={{
                  height: "auto",
                  minWidth: "100%",
                  backgroundColor: "white",
                  borderRadius: "0px",
                  padding: "0px",
                }}
              >
                <TableHeader>
                  <TableColumn width={50}>No</TableColumn>
                  <TableColumn>Invoice Number</TableColumn>
                  <TableColumn>Nama Produk</TableColumn>
                  <TableColumn>SKU</TableColumn>
                  <TableColumn>Total Qty</TableColumn>
                  <TableColumn>Total Price</TableColumn>
                  <TableColumn>Transaction Status</TableColumn>
                  <TableColumn>Voucher</TableColumn>
                  <TableColumn>Creator</TableColumn>
                  <TableColumn width={80}>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item, index) => {
                    const statusInfo = getStatusInfo(item.transaction_status_id);

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{item.invoice_no}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.total_qty}</TableCell>
                        <TableCell>Rp {Number(item.total_price || 0).toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>{statusInfo.text}</span>
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

              {/* Total Summary Section */}
              {paginatedItems.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 border border-light-grey rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{(page - 1) * rowsPerPage + 1}</span> to <span className="font-semibold">{Math.min(page * rowsPerPage, filtered.length)}</span> of{" "}
                        <span className="font-semibold">{filtered.length}</span> entries
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Merchandise in Page</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {totalMerchandiseInPage} item{totalMerchandiseInPage !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price in Page</div>
                        <div className="text-lg font-semibold text-gray-800">Rp {totalPriceInPage.toLocaleString("id-ID")}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total All Filtered</div>
                        <div className="text-lg font-semibold text-gray-800">Rp {totalPriceAllFiltered.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-start items-center gap-2 mt-4">
                <Pagination page={page} total={totalPages} onChange={(p) => setPage(Number(p))} className="items-center" size="sm" />
              </div>
            </>
          )}
        </Tab>

        <Tab key="pengambilan" title="Pengambilan Barang">
          <div className="text-center py-12 text-gray-500">
            <p>Fitur Pengambilan Barang akan segera hadir</p>
            <p className="text-sm mt-2">Sedang dalam pengembangan</p>
          </div>
        </Tab>

        <Tab key="pengiriman" title="Pengiriman">
          <div className="text-center py-12 text-gray-500">
            <p>Fitur Pengiriman akan segera hadir</p>
            <p className="text-sm mt-2">Sedang dalam pengembangan</p>
          </div>
        </Tab>
      </Tabs>

      {/* Modal Detail Transaksi */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="3xl"
        scrollBehavior="inside"
        className="max-w-4xl"
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileInvoice} className="h-5 w-5 text-blue-600" />
                    Detail Transaksi
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Invoice: {selectedTransaction?.invoice_no || "-"}</p>
                </div>
                {selectedTransaction && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusInfo(selectedTransaction.transaction_status_id).color}`}>
                    {getStatusInfo(selectedTransaction.transaction_status_id).text}
                  </span>
                )}
              </div>
            </ModalHeader>
            <ModalBody className="py-4">
              {selectedTransaction && (
                <div className="space-y-5">
                  {/* Section 1: Invoice & Order Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faReceipt} className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-gray-700">Informasi Transaksi</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                        <p className="text-sm font-medium text-gray-800">{selectedTransaction.invoice_no || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tanggal Order</p>
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-gray-400" />
                          {formatDate(selectedTransaction.order_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Voucher</p>
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                          <FontAwesomeIcon icon={faTag} className="h-3 w-3 text-gray-400" />
                          {selectedTransaction.voucher || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <Divider className="my-2" />

                  {/* Section 2: Customer & Shipping Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-green-600" />
                        <h3 className="text-sm font-semibold text-gray-700">Informasi Customer</h3>
                      </div>
                      <div className="space-y-2 pl-1">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nama</p>
                          <p className="text-sm font-medium text-gray-800">{selectedTransaction.customer_name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <p className="text-sm font-medium text-gray-800">{selectedTransaction.customer_email || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faTruck} className="h-4 w-4 text-orange-600" />
                        <h3 className="text-sm font-semibold text-gray-700">Alamat Pengiriman</h3>
                      </div>
                      <div className="pl-1">
                        <p className="text-xs text-gray-500 mb-1">Alamat Lengkap</p>
                        <p className="text-sm font-medium text-gray-800 leading-relaxed">
                          {formatShippingAddress(selectedTransaction.shipping_address)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Product & Creator Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faBox} className="h-4 w-4 text-purple-600" />
                        <h3 className="text-sm font-semibold text-gray-700">Informasi Produk</h3>
                      </div>
                      <div className="space-y-2 pl-1">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nama Produk</p>
                          <p className="text-sm font-medium text-gray-800">{selectedTransaction.product_name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">SKU</p>
                          <p className="text-sm font-medium text-gray-800">{selectedTransaction.sku || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-indigo-600" />
                        <h3 className="text-sm font-semibold text-gray-700">Informasi Creator</h3>
                      </div>
                      <div className="space-y-2 pl-1">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nama Creator</p>
                          <p className="text-sm font-medium text-gray-800">{selectedTransaction.creator_name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Creator ID</p>
                          <p className="text-sm font-medium text-gray-800">{selectedTransaction.creator_id || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-700">Ringkasan Order</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Quantity</p>
                        <p className="text-sm font-medium text-gray-800">{selectedTransaction.total_qty || 0} item(s)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
                        <p className="text-sm font-medium text-gray-800">{selectedTransaction.payment_method || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Harga</p>
                        <p className="text-lg font-bold text-blue-700">{formatCurrency(selectedTransaction.total_price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Notes (if exists) */}
                  {selectedTransaction.notes && selectedTransaction.notes !== "-" && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-yellow-600" />
                        <h3 className="text-sm font-semibold text-gray-700">Catatan</h3>
                      </div>
                      <p className="text-sm text-gray-700 pl-6">{selectedTransaction.notes}</p>
                    </div>
                  )}

                  {/* Section 6: Order Items Table */}
                  {selectedTransaction.detail && selectedTransaction.detail.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faBox} className="h-4 w-4 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-700">Detail Item ({selectedTransaction.detail.length})</h3>
                      </div>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Qty</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Harga</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedTransaction.detail.map((item: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{index + 1}</td>
                                <td className="px-3 py-2 text-xs font-medium text-gray-900 max-w-xs truncate">
                                  {item.product?.product_name ||
                                    item.product_name ||
                                    item.product?.name ||
                                    item.name ||
                                    "-"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-center">{item.quantity || item.qty || 0}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatCurrency(item.price || item.product?.price)}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-right">
                                  {formatCurrency((item.quantity || item.qty || 0) * (Number(item.price) || Number(item.product?.price) || 0))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter className="py-3 border-t">
              <div className="flex justify-between items-center w-full">
                <Button
                  color="default"
                  variant="light"
                  onPress={handleCloseModal}
                  className="text-sm"
                >
                  Tutup
                </Button>
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => {
                      if (selectedTransaction?.invoice_no && selectedTransaction.invoice_no !== "-") {
                        const baseUrl = process.env.NEXT_PUBLIC_URL_MERCH || window.location.origin;
                        const viewUrl = `${baseUrl}merch-invoice/${selectedTransaction.invoice_no}`;
                        window.open(viewUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    isDisabled={!selectedTransaction?.invoice_no || selectedTransaction.invoice_no === "-"}
                    className="text-sm"
                  >
                    <FontAwesomeIcon icon={faEye} className="h-3 w-3 mr-2" />
                    Lihat Invoice Lengkap
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default MerchandiseTransaction;
