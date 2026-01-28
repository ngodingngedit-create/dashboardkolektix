import { useEffect, useState } from 'react';
import { Get } from '@/utils/REST';
import React from 'react';

interface TransactionStatus {
  id: number;
  name: string;
  bgcolor: string;
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
  product: any | null;
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

  const getData = () => {
    setLoading(true);
    Get('order-product', {})
      .then((res: any) => {
        // Sort by date (newest first)
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

  // Filter berdasarkan status transaction
  const filteredData = status === 'all' 
    ? data 
    : data.filter(item => 
        item.transaction_status?.name?.toLowerCase() === status.toLowerCase()
      );

  // Get unique statuses from data
  const uniqueStatuses = Array.from(
    new Set(data.map(item => item.transaction_status?.name?.toLowerCase() || 'unknown'))
  ).filter(Boolean);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-dark mb-1">Transaksi Merchandise</h1>
        <p className="text-xs text-gray-500">Kelola pesanan merchandise</p>
      </div>

      {/* Filter Dropdown Button */}
      <div className="mb-4 relative">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
        >
          <span>{status === 'all' ? 'Semua Status' : status.toUpperCase()}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showFilter && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[140px]">
            <button
              onClick={() => {
                setStatus('all');
                setShowFilter(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                status === 'all' ? 'bg-primary/5 text-primary' : 'text-gray-700'
              } ${uniqueStatuses.length > 0 ? 'border-b border-gray-100' : 'rounded-t-lg'}`}
            >
              Semua Status
            </button>
            {uniqueStatuses.map((statusName) => (
              <button
                key={statusName}
                onClick={() => {
                  setStatus(statusName);
                  setShowFilter(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                  status === statusName ? 'bg-primary/5 text-primary' : 'text-gray-700'
                } ${uniqueStatuses.indexOf(statusName) === uniqueStatuses.length - 1 ? 'rounded-b-lg' : ''}`}
              >
                {statusName.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          // Loading Skeleton - dengan shadow
          <div className="w-full shadow-sm rounded-lg px-3 py-3 bg-white">
            <div className="w-full animate-pulse">
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-48 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="space-y-3">
            {filteredData.map((item: MerchandiseTransaction) => (
              <div 
                key={item.id} 
                className="shadow-sm rounded-lg p-3 bg-white hover:shadow transition-shadow duration-150"
              >
                {/* Status badge */}
                <div 
                  className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full text-white mb-2 shadow-sm"
                  style={{ backgroundColor: item.transaction_status?.bgcolor || '#6c757d' }}
                >
                  {item.transaction_status?.name || 'Unknown'}
                </div>

                {/* Header compact */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-dark text-sm">#{item.invoice_no}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pembelian pada {formatDate(item.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">
                      Rp {item.grandtotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Products minimal */}
                <div className="mb-2">
                  {item.detail.map((detail, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 text-sm">
                      <div>
                        <span className="font-medium">
                          {detail.variant?.varian_name || 'Produk'}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({detail.qty} × Rp {parseInt(detail.price).toLocaleString('id-ID')})
                        </span>
                      </div>
                      <span className="font-medium">
                        Rp {(detail.qty * parseInt(detail.price)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Recipient minimal */}
                <div className="text-xs text-gray-600 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Kurir:</span>
                    <span className="font-medium">
                      {item.courier?.main?.toUpperCase()} - Rp {parseInt(item.courier?.price || '0').toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penerima:</span>
                    <span className="font-medium">{item.address?.nama_penerima}</span>
                  </div>
                </div>

                {/* Action Button minimal dengan garis opacity rendah */}
                <div className="pt-2 border-t border-gray-100/30 flex justify-end">
                  <a
                    href={`/merch-invoice/${item.invoice_no}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Lihat Invoice
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full mb-2 shadow-sm">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              {status === 'all' 
                ? 'Belum ada transaksi merchandise' 
                : `Tidak ada transaksi dengan status "${status.toUpperCase()}"`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}