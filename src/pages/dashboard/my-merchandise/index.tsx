import { useEffect, useState } from 'react';
import { Get } from '@/utils/REST';
import React from 'react';

interface TransactionStatus {
  id: number;
  name: string;
  bgcolor: string;
  textcolor?: string;
}

interface ProductVariant {
  id: number;
  varian_name: string;
  price: string;
}

interface ProductDetail {
  id: number;
  order_product_id: number;
  product_id: number;
  product_varian_id: number;
  qty: number;
  price: string;
  order_notes: string;
  variant: ProductVariant;
  product: {
    id: number;
    name: string;
    [key: string]: any;
  } | null;
}

interface Courier {
  id: number;
  order_id: number;
  main: string;
  type: string;
  price: string;
}

interface Address {
  id: number;
  order_id: number;
  nama_penerima: string;
  phone: string;
  address_detail: string;
}

interface MerchandiseTransaction {
  id: number;
  invoice_no: string;
  user_id: string;
  total_qty: number;
  total_price: number;
  delivery_price: number;
  grandtotal: number;
  admin_fee: number;
  payment_method: string;
  transaction_status_id: number;
  payment_status: string;
  created_at: string;
  updated_at: string;
  transaction_status: TransactionStatus;
  detail: ProductDetail[];
  address: Address;
  courier: Courier;
}

export default function MerchandiseDashboard() {
  const [data, setData] = useState<MerchandiseTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('all');
  const [showFilter, setShowFilter] = useState<boolean>(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const getData = () => {
    setLoading(true);
    Get('order-product', {})
      .then((res: any) => {
        const sortedData = (res.data || []).sort((a: MerchandiseTransaction, b: MerchandiseTransaction) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setData(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const filteredData = status === 'all' 
    ? data 
    : data.filter(item => 
        item.transaction_status?.name?.toLowerCase() === status.toLowerCase()
      );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const uniqueStatuses = Array.from(
    new Set(data.map(item => item.transaction_status?.name?.toLowerCase() || 'unknown'))
  ).filter(Boolean);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusStyle = (bgColor: string) => {
    return {
      backgroundColor: `${bgColor}20`,
      color: bgColor,
    };
  };

  // Pagination controls
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(currentPage - 2, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Transaksi Merchandise</h1>
            <p className="text-sm text-gray-600 mt-1">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} transaksi
              {status !== 'all' && ` (Filter: ${status.charAt(0).toUpperCase() + status.slice(1)})`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={getData}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {status === 'all' ? 'Semua Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>

              {showFilter && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowFilter(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-30 min-w-[180px] py-2">
                    <button
                      onClick={() => {
                        setStatus('all');
                        setShowFilter(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        status === 'all' ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Semua Status
                    </button>
                    {uniqueStatuses.map((statusName) => (
                      <button
                        key={statusName}
                        onClick={() => {
                          setStatus(statusName);
                          setShowFilter(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          status === statusName ? 'text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {statusName.charAt(0).toUpperCase() + statusName.slice(1)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentItems.map((item: MerchandiseTransaction) => (
              <div 
                key={item.id} 
                className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">#{item.invoice_no}</h3>
                      <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                    </div>
                    <div 
                      className="px-3 py-1 text-xs font-semibold rounded-full"
                      style={getStatusStyle(item.transaction_status?.bgcolor || '#6c757d')}
                    >
                      {item.transaction_status?.name || 'Unknown'}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(item.grandtotal)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{item.total_qty} item</span>
                      <span>•</span>
                      <span>{item.payment_method}</span>
                      <span>•</span>
                      <span className={`font-medium ${
                        item.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {item.payment_status === 'paid' ? 'Lunas' : 'Menunggu'}
                      </span>
                    </div>
                  </div>

                  {/* Products - TAMPILKAN NAMA PRODUK + VARIAN */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Produk Dipesan</div>
                    <div className="space-y-3">
                      {item.detail.slice(0, 2).map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm mb-0.5">
                              {detail.product?.name || 'Nama Produk'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {detail.variant?.varian_name || 'Varian'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                {detail.qty} pcs
                              </div>
                              <span className="font-medium text-gray-900 text-sm">
                                {formatCurrency(detail.qty * parseInt(detail.price))}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              @ {formatCurrency(parseInt(detail.price))}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {item.detail.length > 2 && (
                        <div className="pt-2 text-sm text-gray-500">
                          + {item.detail.length - 2} produk lainnya
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer & Shipping */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{item.address?.nama_penerima}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[140px]">{item.address?.phone}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{item.courier?.main?.toUpperCase()}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(parseInt(item.courier?.price || '0'))}</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-5 py-4 border-t border-gray-100">
                  <a
                    href={`/merch-invoice/${item.invoice_no}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat Detail Transaksi
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Items Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">per halaman</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {status === 'all' 
              ? 'Belum ada transaksi merchandise' 
              : `Tidak ada transaksi "${status.charAt(0).toUpperCase() + status.slice(1)}"`
            }
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {status === 'all' 
              ? 'Transaksi merchandise akan muncul di sini setelah ada pesanan.'
              : 'Coba gunakan filter lain untuk melihat transaksi yang tersedia.'
            }
          </p>
          {status !== 'all' && (
            <button
              onClick={() => setStatus('all')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tampilkan Semua Transaksi
            </button>
          )}
        </div>
      )}
    </div>
  );
}