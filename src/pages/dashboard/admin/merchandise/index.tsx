import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Input, Pagination } from "@nextui-org/react";
import { Card } from "@mantine/core";
import { Get } from "@/utils/REST";

interface MerchandiseTransactionData {
  id: number;
  invoice_no?: string;
  product_name?: string;
  sku?: number | string;
  total_qty?: number;
  total_price?: number | string;
  transaction_status_id?: number;
  voucher?: number | string;
}

const MerchandiseTransaction: React.FC = () => {
  const [data, setData] = useState<MerchandiseTransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filterValue, setFilterValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setPage(1);
  }, []);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const res: any = await Get("order-bycreator", {});
      // Map response to flatten product_name and normalize fields
      const mapped: MerchandiseTransactionData[] = (res?.data || []).map((item: any) => {
        // --- NEW: collect ALL product names from detail[] (fallbacks included) ---
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

        // join all names with a separator so they show as a single cell (but include all)
        const productName = productNames.length > 0 ? productNames.join(" | ") : "-";
        // --- END NEW ---

        return {
          id: item.id ?? item.order_product_id ?? 0,
          invoice_no: item.invoice_no ?? item.invoiceNo ?? item.invoice ?? "-",
          product_name: productName,
          sku: item.sku ?? item.product?.sku ?? "-",
          total_qty: item.total_qty ?? item.qty ?? (item.detail && item.detail[0] && item.detail[0].quantity) ?? 0,
          total_price: item.total_price ?? item.price ?? item.delivery_price ?? item.price_total ?? item.price_formatted ?? 0,
          transaction_status_id: item.transaction_status_id ?? item.status_id ?? 0,
          voucher: item.voucher ?? item.voucher_code ?? "-",
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

  // simple, readable filter by invoice_no (case-insensitive)
  const filtered = data.filter((item) => (item.invoice_no ?? "").toString().toLowerCase().includes(filterValue.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // --- Export to CSV (can be opened in Excel) ---
  const exportToCSV = (rows: MerchandiseTransactionData[]) => {
    if (!rows || rows.length === 0) {
      // create a minimal CSV with headers to avoid empty file
      const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status ID", "Voucher"];
      const csvContent = headers.join(",") + "\n";
      downloadCSV(csvContent);
      return;
    }

    const headers = ["Invoice Number", "Nama Produk", "SKU", "Total Qty", "Total Price", "Transaction Status ID", "Voucher"];
    const escapeCell = (value: any) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // Escape double quotes by doubling them, and wrap cell in quotes if contains comma/newline/quote
      const needsQuotes = /[,"\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const lines = rows.map((r) => [escapeCell(r.invoice_no), escapeCell(r.product_name), escapeCell(r.sku), escapeCell(r.total_qty), escapeCell(r.total_price), escapeCell(r.transaction_status_id), escapeCell(r.voucher)].join(","));

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
      // fallback: open in new tab
      const win = window.open();
      if (win) {
        win.document.write(`<pre>${csvContent}</pre>`);
        win.document.close();
      }
    }
  };
  // --- end export functions ---

  if (loading) {
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
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
        <Input type="text" placeholder="Search by Invoice" value={filterValue} onChange={onSearchChange} />
        <select onChange={onRowsPerPageChange} value={rowsPerPage} className="border border-light-grey p-2 rounded-md w-full md:w-auto">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Tambahan 1 row untuk export Excel/CSV */}
      <div className="flex items-center justify-start gap-2 mb-4">
        <button type="button" onClick={() => exportToCSV(filtered)} className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm">
          Export (Open in Excel)
        </button>
        <span className="text-xs text-gray-500">Export dari data hasil filter saat ini</span>
      </div>

      {data.length > 0 ? (
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
              <TableColumn>Invoice Number</TableColumn>
              <TableColumn>Nama Produk</TableColumn>
              <TableColumn>SKU</TableColumn>
              <TableColumn>Total Qty</TableColumn>
              <TableColumn>Total Price</TableColumn>
              <TableColumn>Transaction Status ID</TableColumn>
              <TableColumn>Voucher</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.invoice_no}</TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.total_qty}</TableCell>
                  <TableCell>{item.total_price}</TableCell>
                  <TableCell>{item.transaction_status_id}</TableCell>
                  <TableCell>{item.voucher}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-start items-center gap-2 mt-4">
            <Pagination page={page} total={totalPages} onChange={(p) => setPage(Number(p))} className="items-center" />
          </div>
        </>
      ) : (
        <div>No data available</div>
      )}
    </Card>
  );
};

export default MerchandiseTransaction;
