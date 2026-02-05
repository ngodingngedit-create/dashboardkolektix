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
import { Get } from "@/utils/REST";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faSearch, faBoxOpen, faQrcode } from "@fortawesome/free-solid-svg-icons";
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
}

const MerchPickupPage: React.FC = () => {
  const user = useLoggedUser();
  const [data, setData] = useState<MerchandiseTransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filterValue, setFilterValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  
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
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case 2:
        return {
          text: "Success",
          color: "bg-green-100 text-green-800 border-green-200",
        };
      case 3:
        return {
          text: "Failed",
          color: "bg-red-100 text-red-800 border-red-200",
        };
      case 4:
        return {
          text: "Expired",
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const getData = async () => {
    setLoading(true);
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

      // Urutkan data berdasarkan tanggal order (dari yang terbaru)
      filteredData.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.order_date || 0);
        const dateB = new Date(b.created_at || b.order_date || 0);
        return dateB.getTime() - dateA.getTime(); // Descending (terbaru dulu)
      });

      const mapped: MerchandiseTransactionData[] = filteredData.map((item: any) => {
        const productNames: string[] = [];
        if (Array.isArray(item.detail) && item.detail.length > 0) {
          item.detail.forEach((d: any) => {
            if (d?.product && (d.product.product_name || d.product_name)) {
              productNames.push(d.product.product_name ?? d.product_name);
            } else if (d?.product_name) {
              productNames.push(d.product_name);
            }
          });
        }

        const productName = productNames.length > 0 ? productNames.join(" | ") : "-";
        
        let creatorId = 0;
        let creatorName = user?.has_creator?.name || "Creator";

        if (item.creator?.id) {
          creatorId = item.creator.id;
          creatorName = item.creator.name || item.creator.username || item.creator.email || creatorName;
        } else if (item.creator_id) {
          creatorId = item.creator_id;
        }

        return {
          id: item.id ?? item.order_product_id ?? 0,
          invoice_no: item.invoice_no ?? item.invoiceNo ?? item.invoice ?? "-",
          product_name: productName,
          sku: item.sku ?? item.product?.sku ?? "-",
          total_qty: item.total_qty ?? item.qty ?? 0,
          total_price: item.total_price ?? item.price ?? 0,
          transaction_status_id: item.transaction_status_id ?? item.status_id ?? 0,
          voucher: item.voucher ?? item.voucher_code ?? "-",
          creator_id: creatorId,
          creator_name: creatorName,
          detail: item.detail || [],
          order_date: item.created_at || item.order_date || "-",
          customer_name: item.customer_name || item.customer?.name || "-",
          customer_email: item.customer_email || item.customer?.email || "-",
          status_name: item.status_name || item.status?.name || "-",
          payment_method: item.payment_method || item.payment?.method || "-",
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
    getData();
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    
    // Filter by search
    if (filterValue) {
      result = result.filter((item) => 
        (item.invoice_no ?? "").toString().toLowerCase().includes(filterValue.toLowerCase()) ||
        (item.customer_name ?? "").toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    
    return result;
  }, [data, filterValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleOpenScanModal = () => {
    setIsScanModalOpen(true);
  };

  const handleScanWithCamera = () => {
    window.open(`/dashboard/merch-pickup/scan-camera`, '_self');
  };

  const handleScanWithBarcode = () => {
    window.open(`/dashboard/merch-pickup/scan-barcode`, '_self');
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

  const exportToCSV = (rows: MerchandiseTransactionData[]) => {
    const headers = ["Invoice Number", "Nama Customer", "Nama Produk", "SKU", "Total Qty", "Status", "Tanggal Order"];
    const csvContent = headers.join(",") + "\n" +
      rows.map((r) => [
        r.invoice_no,
        r.customer_name,
        r.product_name,
        r.sku,
        r.total_qty,
        getStatusInfo(r.transaction_status_id).text,
        r.order_date
      ].join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merch-pickup-" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FontAwesomeIcon icon={faBoxOpen} className="text-blue-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Merchandise Pickup</h1>
            <p className="text-gray-600 mt-1">Manajemen pengambilan merchandise</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            color="primary"
            startContent={<Icon icon="mdi:qrcode-scan" width={20} height={20} />}
            onClick={handleOpenScanModal}
            className="bg-blue-600 text-white"
          >
            Scan QR/Barcode
          </Button>
          
          <Input
            type="text"
            placeholder="Cari invoice atau nama customer..."
            value={filterValue}
            onChange={onSearchChange}
            startContent={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
            className="w-full md:w-80"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => exportToCSV(filtered)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            disabled={filtered.length === 0}
          >
            <FontAwesomeIcon icon={faDownload} className="text-green-600" />
            <span>Export ({filtered.length})</span>
          </button>
          
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="p-0">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data merchandise ditemukan
          </div>
        ) : (
          <>
            <Table
              aria-label="Merchandise Pickup Table"
              className="rounded-lg overflow-hidden"
            >
              <TableHeader>
                <TableColumn width={50}>NO</TableColumn>
                <TableColumn>INVOICE NUMBER</TableColumn>
                <TableColumn>NAMA CUSTOMER</TableColumn>
                <TableColumn>NAMA PRODUK</TableColumn>
                <TableColumn>SKU</TableColumn>
                <TableColumn>TOTAL QTY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>
                  <div className="flex items-center gap-1">
                    TANGGAL ORDER
                    <span className="text-xs text-gray-400 ml-1">▼</span>
                  </div>
                </TableColumn>
                <TableColumn width={100}>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item, index) => {
                  const statusInfo = getStatusInfo(item.transaction_status_id);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                      <TableCell className="font-medium">{item.invoice_no}</TableCell>
                      <TableCell>{item.customer_name}</TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.total_qty}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </TableCell>
                      <TableCell>{item.order_date ? new Date(item.order_date).toLocaleDateString('id-ID') : "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <div className="p-4 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {Math.min(filtered.length, (page - 1) * rowsPerPage + 1)} to {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} entries
                </div>
                <Pagination
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                  showControls
                  size="sm"
                />
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal Scan Options */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={handleCloseScanModal}
        size="lg"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:qrcode-scan" width={24} height={24} className="text-blue-600" />
                  <h2 className="text-lg font-semibold">Proses Pengambilan Merchandise</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Pilih metode scan untuk memproses pengambilan merchandise
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Scan with Camera */}
                  <div 
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                    onClick={handleScanWithCamera}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Icon icon="mdi:camera" width={32} height={32} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700">Scan dengan Kamera</h3>
                        <p className="text-sm text-gray-600 mt-1">Scan kode QR menggunakan kamera perangkat</p>
                      </div>
                      <div className="p-2">
                        <Icon icon="mdi:chevron-right" width={20} height={20} className="text-gray-400 group-hover:text-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Scan with Scanner Device */}
                  <div 
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group"
                    onClick={handleScanWithBarcode}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Icon icon="mdi:barcode-scan" width={32} height={32} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-green-700">Scan dengan Scanner</h3>
                        <p className="text-sm text-gray-600 mt-1">Scan kode QR menggunakan perangkat scanner</p>
                      </div>
                      <div className="p-2">
                        <Icon icon="mdi:chevron-right" width={20} height={20} className="text-gray-400 group-hover:text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={handleCloseScanModal}>
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
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Detail Transaksi Merchandise
              </ModalHeader>
              <ModalBody>
                {selectedTransaction && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Invoice Number</p>
                        <p className="font-medium">{selectedTransaction.invoice_no}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Order</p>
                        <p className="font-medium">
                          {selectedTransaction.order_date ? new Date(selectedTransaction.order_date).toLocaleString('id-ID') : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{selectedTransaction.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedTransaction.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Produk</p>
                        <p className="font-medium">{selectedTransaction.product_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="font-medium">{selectedTransaction.total_qty}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Harga</p>
                        <p className="font-medium text-green-600">
                          Rp {Number(selectedTransaction.total_price || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(selectedTransaction.transaction_status_id).color}`}>
                          {getStatusInfo(selectedTransaction.transaction_status_id).text}
                        </span>
                      </div>
                    </div>
                    
                    {selectedTransaction.detail && selectedTransaction.detail.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Detail Items:</p>
                        <div className="border rounded-lg p-3">
                          {selectedTransaction.detail.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                              <div>
                                <p className="font-medium">{item.product?.product_name || item.product_name || `Item ${index + 1}`}</p>
                                <p className="text-sm text-gray-500">SKU: {item.product?.sku || item.sku || "-"}</p>
                              </div>
                              <div className="text-right">
                                <p>Qty: {item.quantity || item.qty || 0}</p>
                                <p className="text-sm text-gray-500">
                                  Rp {Number(item.price || 0).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="primary" 
                  variant="light" 
                  onPress={() => {
                    handleCloseDetailModal();
                    handleOpenScanModal();
                  }}
                >
                  Proses Pengambilan
                </Button>
                <Button color="default" variant="light" onPress={handleCloseDetailModal}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MerchPickupPage;