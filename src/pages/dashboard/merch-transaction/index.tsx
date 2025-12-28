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
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Input, Pagination, Tabs, Tab } from "@nextui-org/react";
import { Card } from "@mantine/core";
import { Get } from "@/utils/REST";

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

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setPage(1);
  }, []);

  const onCreatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCreator(e.target.value);
    setPage(1);
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

        // Try to get creator info from transaction data
        if (item.creator_id) {
          creatorId = item.creator_id;
          creatorName = "Loading...";
        } else if (item.user_id) {
          creatorId = parseInt(item.user_id) || 0;
          creatorName = "Loading...";
        } else if (item.creator) {
          creatorId = item.creator.id || 0;
          creatorName = item.creator.name || item.creator.username || "Unknown";
        }

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
      // Find creator by id
      const foundCreator = creators.find((creator) => creator.id === item.creator_id || parseInt(creator.user_id) === item.creator_id || creator.has_user?.id === item.creator_id);

      if (foundCreator) {
        return {
          ...item,
          creator_name: foundCreator.has_user?.name || foundCreator.name || "Unknown",
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

  // --- Export to CSV (can be opened in Excel) ---
  const exportToCSV = (rows: MerchandiseTransactionData[]) => {
    if (!rows || rows.length === 0) {
      // Create a minimal CSV with headers to avoid empty file
      const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status ID", "Voucher", "Creator"];
      const csvContent = headers.join(",") + "\n";
      downloadCSV(csvContent);
      return;
    }

    const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status ID", "Voucher", "Creator"];
    const escapeCell = (value: any) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // Escape double quotes by doubling them, and wrap cell in quotes if contains comma/newline/quote
      const needsQuotes = /[,"\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const lines = rows.map((r) =>
      [escapeCell(r.invoice_no), escapeCell(r.product_name), escapeCell(r.sku), escapeCell(r.total_qty), escapeCell(r.total_price), escapeCell(r.transaction_status_id), escapeCell(r.voucher), escapeCell(r.creator_name)].join(",")
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

  // Function to View - open URL from .env
  const handleViewInvoice = (invoiceNo: string) => {
    if (invoiceNo && invoiceNo !== "-") {
      const baseUrl = process.env.NEXT_PUBLIC_URL_MERCH || window.location.origin;
      const viewUrl = `${baseUrl}merch-invoice/${invoiceNo}`;
      window.open(viewUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading || loadingCreators) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  function onRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  }

  return (
    <Card className={`!overflow-auto`} p={20} m={10} withBorder>
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penjualan</h3>
          <p className="text-lg font-semibold mt-1 text-gray-800">Rp {filtered.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0).toLocaleString("id-ID")}</p>
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
      </div>

      {/* Tabs */}
      <Tabs aria-label="Transaction Tabs" selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)} className="mb-6">
        <Tab key="transaksi" title="Transaksi">
          {/* Search, Filter, Export, and Pagination Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto space-y-2 md:space-y-0">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Input type="text" placeholder="Search by Invoice" value={filterValue} onChange={onSearchChange} className="w-full md:w-64" size="sm" />
                <select value={selectedCreator} onChange={onCreatorChange} className="border border-light-grey p-2 rounded-md text-sm w-full md:w-48" disabled={creators.length === 0}>
                  <option value="all">All Creators</option>
                  {creators.map((creator) => (
                    <option key={creator.id} value={`${creator.id}-${creator.name}`}>
                      {creator.has_user?.name || creator.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => exportToCSV(filtered)} className="px-3 py-2 rounded-md border border-light-grey bg-white hover:bg-gray-50 text-sm flex items-center gap-2 whitespace-nowrap" title="Export to Excel">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Export</span>
              </button>
            </div>

            <select onChange={onRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md text-sm w-full md:w-auto">
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
            </select>
          </div>

          {/* Perbaikan di sini: Tampilkan pesan berbeda berdasarkan kondisi */}
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data available</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Data tidak ditemukan untuk filter yang dipilih</div>
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
                  <TableColumn>Transaction Status ID</TableColumn>
                  <TableColumn>Voucher</TableColumn>
                  <TableColumn>Creator</TableColumn>
                  <TableColumn width={100}>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{item.invoice_no}</TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.total_qty}</TableCell>
                      <TableCell>{item.total_price?.toLocaleString("id-ID")}</TableCell>
                      <TableCell>{item.transaction_status_id}</TableCell>
                      <TableCell>{item.voucher}</TableCell>
                      <TableCell>{item.creator_name}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleViewInvoice(item.invoice_no || "")}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                          disabled={!item.invoice_no || item.invoice_no === "-"}
                          title={!item.invoice_no || item.invoice_no === "-" ? "Invoice number not available" : `View ${item.invoice_no}`}
                        >
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
    </Card>
  );
};

export default MerchandiseTransaction;
