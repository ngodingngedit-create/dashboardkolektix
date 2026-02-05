import { useState } from 'react';
import QrScanner from '@/components/QrScanner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import Button from '@/components/Button';
import { Post } from '@/utils/REST';
import { faXmark, faBox, faTag, faClock, faHistory, faUser, faCalendarAlt, faShoppingBag, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

interface SuccessMerchData {
  invoice_no: string;
  product_name: string;
  quantity: string;
  variant_name: string;
  buyer_name: string;
  total_price: string;
  status: string;
  scan_date: string;
}

// Dummy data untuk testing
const DUMMY_MERCH_DATA = {
  invoice_no: 'INV-2024-MERCH-001',
  product_name: 'T-Shirt Exclusive',
  quantity: '2',
  variant_name: 'L - Hitam',
  buyer_name: 'Budi Santoso',
  total_price: '250000',
  status: 'pending',
  scan_date: new Date().toISOString()
};

// QR Code dummy untuk testing
const DUMMY_QR_CODE = 'MERCH-2024-TS001-BLACK-L-2';

export default function MerchScanPage() {
  const [selected, setSelected] = useState<'qr' | 'manual'>('qr');
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SuccessMerchData | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const handleMerchScan = (scannedData: string) => {
    let merchCode = scannedData;
    
    if (scannedData.includes('?')) {
      const urlParams = new URLSearchParams(scannedData.split('?')[1]);
      merchCode = urlParams.get('code') || scannedData;
    }
    
    processMerchCode(merchCode);
  };

  const processMerchCode = (code: string) => {
    // Untuk testing: jika scan code dummy, gunakan data dummy
    if (code === DUMMY_QR_CODE) {
      setTimeout(() => {
        setStep(1);
        setData(DUMMY_MERCH_DATA);
        toast.success('Merch berhasil divalidasi');
        
        // Tambahkan ke riwayat scan
        const newScan = {
          id: Date.now(),
          invoice_no: DUMMY_MERCH_DATA.invoice_no,
          buyer_name: DUMMY_MERCH_DATA.buyer_name,
          product_name: DUMMY_MERCH_DATA.product_name,
          variant_name: DUMMY_MERCH_DATA.variant_name,
          quantity: DUMMY_MERCH_DATA.quantity,
          scan_date: new Date().toISOString(),
          status: 'validated'
        };
        setScanHistory(prev => [newScan, ...prev]);
      }, 1000);
      return;
    }

    // Jika bukan code dummy, coba API
    Post('merch/validate', { merch_code: code })
      .then((res: any) => {
        if (res.success) {
          setStep(1);
          setData(res.data);
          toast.success('Merch berhasil divalidasi');
          
          // Tambahkan ke riwayat scan
          const newScan = {
            id: Date.now(),
            invoice_no: res.data.invoice_no,
            buyer_name: res.data.buyer_name,
            product_name: res.data.product_name,
            variant_name: res.data.variant_name,
            quantity: res.data.quantity,
            scan_date: new Date().toISOString(),
            status: 'validated'
          };
          setScanHistory(prev => [newScan, ...prev]);
        } else {
          setStep(2);
          toast.error(res.message || 'Validasi merch gagal');
        }
      })
      .catch((err: any) => {
        console.log(err);
        setStep(2);
        toast.error(err.response?.data?.message || 'Terjadi kesalahan');
      });
  };

  const handleManualSubmit = () => {
    if (!qrCode.trim()) {
      toast.error('Silakan masukkan kode merch');
      return;
    }
    processMerchCode(qrCode);
  };

  const handleRedeem = () => {
    if (!data) return;
    
    // Untuk dummy data
    if (data.invoice_no === DUMMY_MERCH_DATA.invoice_no) {
      setTimeout(() => {
        toast.success('Merch berhasil diredeem');
        // Update status data
        setData({
          ...data,
          status: 'redeemed',
          scan_date: new Date().toISOString()
        });
        
        // Update status di riwayat scan
        setScanHistory(prev => 
          prev.map(item => 
            item.invoice_no === data.invoice_no 
              ? { ...item, status: 'redeemed' }
              : item
          )
        );
      }, 1000);
      return;
    }

    // Jika bukan dummy, gunakan API
    Post('merch/redeem', { merch_code: data.invoice_no })
      .then((res: any) => {
        if (res.success) {
          toast.success('Merch berhasil diredeem');
          // Update status data
          setData({
            ...data,
            status: 'redeemed',
            scan_date: new Date().toISOString()
          });
          
          // Update status di riwayat scan
          setScanHistory(prev => 
            prev.map(item => 
              item.invoice_no === data.invoice_no 
                ? { ...item, status: 'redeemed' }
                : item
            )
          );
        }
      })
      .catch((err: any) => {
        toast.error('Gagal melakukan redeem');
      });
  };

  const setDataWrapper = (scanData: any) => {
    if (scanData && typeof scanData === 'string') {
      handleMerchScan(scanData);
    } else if (scanData && scanData.qrData) {
      handleMerchScan(scanData.qrData);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <FontAwesomeIcon icon={faShoppingBag} className="text-primary text-3xl" />
                <FontAwesomeIcon 
                  icon={faQrcode} 
                  className="text-white bg-primary p-1 rounded absolute -top-1 -right-1 text-xs" 
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Scan Merchandise</h1>
                <p className="text-gray-600 text-sm">Sistem validasi dan redeem merchandise</p>
              </div>
            </div>
            
            {/* QR Code Dummy Info */}
            <div className="hidden md:block">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium mb-1">QR Code Dummy untuk Testing:</p>
                <p className="text-sm font-mono font-bold text-blue-800">{DUMMY_QR_CODE}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 50/50 Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Scanner & Manual Input */}
          <div className="space-y-6">
            {/* Scanner Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FontAwesomeIcon icon={faBox} className="text-primary text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">Scan Merchandise</h2>
              </div>

              <div className="flex w-full mb-6 rounded-lg overflow-hidden border border-gray-300">
                <button
                  className={`flex-1 py-3 text-center font-medium ${selected === 'qr' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    setSelected('qr');
                    setStep(0);
                    setData(null);
                  }}
                >
                  Scan QR Code
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium ${selected === 'manual' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    setSelected('manual');
                    setStep(0);
                    setData(null);
                  }}
                >
                  Input Manual
                </button>
              </div>

              <div>
                {selected === 'qr' && step === 0 && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-4 text-center">
                      Arahkan kamera ke QR Code merchandise
                    </p>
                    <div className="rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 p-2">
                      <QrScanner
                        isOpen={true}
                        step={step}
                        setStep={setStep}
                        setData={setDataWrapper}
                      />
                    </div>
                    
                    {/* Info Dummy QR Code untuk mobile */}
                    <div className="mt-4 md:hidden">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium mb-1">QR Code Dummy:</p>
                        <p className="text-xs font-mono text-blue-800 break-all">{DUMMY_QR_CODE}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selected === 'manual' && step === 0 && (
                  <div className="px-2">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Kode Merchandise
                      </label>
                      <input
                        type="text"
                        className="border-2 border-gray-300 rounded-lg w-full py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                        placeholder="Masukkan kode merch atau scan QR"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Contoh: {DUMMY_QR_CODE}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        label="Validasi Kode"
                        onClick={handleManualSubmit}
                        color="primary"
                        disabled={!qrCode.trim()}
                        fullWidth
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Result Display */}
              {step === 1 && data && (
                <div className='space-y-6 pt-6 mt-6 border-t border-gray-200'>
                  <div className="text-center">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      size='3x'
                      className='text-green-500 mb-3'
                    />
                    <h6 className='font-semibold text-lg text-gray-800'>Merchandise Ditemukan</h6>
                    <p className='text-gray-500 text-sm'>Validasi berhasil</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                      <FontAwesomeIcon icon={faTag} className="text-gray-400" />
                      <div className="flex-1">
                        <p className='text-gray-500 text-xs'>Kode Invoice</p>
                        <p className='font-medium text-sm'>{data.invoice_no}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className='text-gray-500 text-xs'>Nama Pembeli</p>
                          <p className='font-medium text-sm'>{data.buyer_name}</p>
                        </div>
                        <div>
                          <p className='text-gray-500 text-xs'>Status</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            data.status === 'redeemed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {data.status === 'redeemed' ? 'Sudah Diredeem' : 'Belum Diredeem'}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className='text-gray-500 text-xs'>Produk</p>
                        <p className='font-medium text-sm'>{data.product_name} ({data.variant_name})</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className='text-gray-500 text-xs'>Qty</p>
                          <p className='font-medium text-sm'>{data.quantity} pcs</p>
                        </div>
                        <div className="col-span-2">
                          <p className='text-gray-500 text-xs'>Total Harga</p>
                          <p className='font-medium text-sm'>Rp {parseInt(data.total_price).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {data.status !== 'redeemed' && (
                    <div className="pt-2">
                      <Button
                        label="Konfirmasi Redeem"
                        onClick={handleRedeem}
                        fullWidth
                      />
                    </div>
                  )}
                </div>
              )}
              
              {step === 2 && (
                <div className='flex flex-col items-center gap-4 py-8 px-2 text-center border-t border-gray-200 mt-6'>
                  <div className='flex items-center justify-center w-16 h-16 rounded-full bg-red-100'>
                    <FontAwesomeIcon icon={faXmark} size='2x' className='text-red-500' />
                  </div>
                  <div>
                    <h6 className="font-semibold text-lg text-gray-800 mb-2">Validasi Gagal</h6>
                    <p className='text-gray-500 text-sm'>Merchandise tidak ditemukan atau sudah diredeem</p>
                  </div>
                  <div className="w-full pt-4">
                    <Button
                      color='primary'
                      label='Coba Lagi'
                      fullWidth
                      onClick={() => {
                        setStep(0);
                        setData(null);
                        setQrCode('');
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Scan History */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faHistory} className="text-primary text-xl" />
                  <h2 className="text-xl font-semibold text-gray-900">Riwayat Scan</h2>
                </div>
                {scanHistory.length > 0 && (
                  <span className="bg-primary text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {scanHistory.length}
                  </span>
                )}
              </div>

              {scanHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon 
                    icon={faClock} 
                    className="text-gray-300 text-5xl mb-4" 
                  />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Belum ada riwayat scan
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Scan kode <span className="font-mono font-medium">{DUMMY_QR_CODE}</span> untuk mencoba
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setQrCode(DUMMY_QR_CODE);
                        setSelected('manual');
                        handleManualSubmit();
                      }}
                      className="text-sm text-primary hover:text-primary-dark font-medium"
                    >
                      Klik di sini untuk test dengan kode dummy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {scanHistory.map((item) => {
                    const { date, time } = formatDateTime(item.scan_date);
                    
                    return (
                      <div 
                        key={item.id} 
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {item.buyer_name}
                            </p>
                            <p className="text-xs text-gray-500">{item.invoice_no}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'redeemed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status === 'redeemed' ? 'Redeemed' : 'Validated'}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-900 font-medium">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.variant_name} • {item.quantity} pcs
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                            <span>{time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {scanHistory.length > 0 && (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Total scan: <span className="font-medium">{scanHistory.length}</span>
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                        <span className="text-xs text-gray-600">Redeemed: {scanHistory.filter(item => item.status === 'redeemed').length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></div>
                        <span className="text-xs text-gray-600">Validated: {scanHistory.filter(item => item.status === 'validated').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}