// import { useState, useEffect } from 'react';
// import QrScanner from '@/components/QrScanner';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
// import Button from '@/components/Button';
// import { Post } from '@/utils/REST';
// import { faXmark, faBox, faClock, faHistory, faUser, faCalendarAlt, faCheck, faCheckDouble, faCamera, faKeyboard } from '@fortawesome/free-solid-svg-icons';

// interface SuccessMerchData {
//   invoice_no: string;
//   product_name: string;
//   quantity: string;
//   variant_name: string;
//   buyer_name: string;
//   total_price: string;
//   status: string;
//   scan_date: string;
// }

// const DUMMY_MERCH_DATA = {
//   invoice_no: 'INV-2024-MERCH-001',
//   product_name: 'T-Shirt Exclusive',
//   quantity: '2',
//   variant_name: 'L - Hitam',
//   buyer_name: 'Budi Santoso',
//   total_price: '250000',
//   status: 'pending',
//   scan_date: new Date().toISOString()
// };

// const DUMMY_QR_CODE = 'MERCH-2024-TS001-BLACK-L-2';

// interface ScanNotificationProps {
//   data: any;
//   type: 'success' | 'error';
//   onClose: () => void;
//   onScanAgain: () => void;
// }

// function ScanNotification({ data, type, onClose, onScanAgain }: ScanNotificationProps) {
//   const formatDateTime = (dateString: string) => {
//     const date = new Date(dateString);
//     return {
//       date: date.toLocaleDateString('id-ID', { 
//         day: 'numeric', 
//         month: 'short', 
//         year: 'numeric' 
//       }),
//       time: date.toLocaleTimeString('id-ID', { 
//         hour: '2-digit', 
//         minute: '2-digit' 
//       })
//     };
//   };

//   const { date, time } = formatDateTime(data.scan_date);

//   return (
//     <div className="flex flex-col h-full">
//       <div className={`rounded-xl overflow-hidden border ${
//         type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
//       }`}>
//         <div className={`px-4 py-3 flex items-center justify-between ${
//           type === 'success' ? 'bg-green-100' : 'bg-red-100'
//         }`}>
//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//               type === 'success' ? 'bg-green-600' : 'bg-red-600'
//             }`}>
//               <FontAwesomeIcon 
//                 icon={type === 'success' ? faCheckCircle : faXmark} 
//                 className="text-white text-sm" 
//               />
//             </div>
//             <div>
//               <h3 className={`font-bold text-sm ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
//                 {type === 'success' ? 'Scan Berhasil!' : 'Scan Gagal'}
//               </h3>
//               <p className={`text-xs ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
//                 {type === 'success' ? 'Data telah ditambahkan ke riwayat' : 'Coba scan ulang'}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className={`p-1 rounded-full ${type === 'success' ? 'text-green-600 hover:bg-green-200' : 'text-red-600 hover:bg-red-200'}`}
//           >
//             <FontAwesomeIcon icon={faXmark} size="sm" />
//           </button>
//         </div>

//         <div className="px-4 py-3">
//           <div className="text-center mb-3">
//             <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
//               type === 'success' 
//                 ? 'bg-green-100 border-2 border-green-200' 
//                 : 'bg-red-100 border-2 border-red-200'
//             }`}>
//               <FontAwesomeIcon 
//                 icon={type === 'success' ? faCheckCircle : faXmark} 
//                 size="lg" 
//                 className={type === 'success' ? 'text-green-600' : 'text-red-600'} 
//               />
//             </div>
//             <h4 className={`font-bold text-base mb-1 ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
//               {type === 'success' ? '✓ Data Tersimpan' : '✗ Scan Gagal'}
//             </h4>
//             <p className={`text-xs ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
//               {type === 'success' 
//                 ? 'Informasi merchandise telah disimpan di riwayat scan'
//                 : 'Merchandise tidak ditemukan atau kode tidak valid'}
//             </p>
            
//             <div className="mt-3 pt-3 border-t border-gray-200">
//               <div className="flex items-center justify-center gap-4">
//                 <div className="flex items-center gap-1">
//                   <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
//                   <span className="text-xs text-gray-600">{date}</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
//                   <span className="text-xs text-gray-600">{time}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function MerchScanPage() {
//   const [selected, setSelected] = useState<'qr' | 'manual'>('qr');
//   const [step, setStep] = useState(0);
//   const [data, setData] = useState<SuccessMerchData | null>(null);
//   const [qrCode, setQrCode] = useState<string>('');
//   const [scanHistory, setScanHistory] = useState<any[]>([]);
//   const [scanStatus, setScanStatus] = useState<'validated' | 'redeemed'>('validated');
//   const [scanDate, setScanDate] = useState<string>('');
//   const [isScanning, setIsScanning] = useState(true);
//   const [showNotification, setShowNotification] = useState(false);
//   const [notificationData, setNotificationData] = useState<any>(null);
//   const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

//   useEffect(() => {
//     if (step === 2 || data) {
//       setIsScanning(false);
//     }
//   }, [step, data]);

//   const handleMerchScan = (scannedData: string) => {
//     let merchCode = scannedData;
    
//     if (scannedData.includes('?')) {
//       const urlParams = new URLSearchParams(scannedData.split('?')[1]);
//       merchCode = urlParams.get('code') || scannedData;
//     }
    
//     processMerchCode(merchCode);
//   };

//   const processMerchCode = (code: string) => {
//     if (code === DUMMY_QR_CODE) {
//       setTimeout(() => {
//         const scanDateTime = new Date().toISOString();
//         const scanData = DUMMY_MERCH_DATA;
//         setData(scanData);
//         setScanStatus('validated');
//         setScanDate(scanDateTime);
        
//         const newScan = {
//           id: Date.now(),
//           invoice_no: DUMMY_MERCH_DATA.invoice_no,
//           buyer_name: DUMMY_MERCH_DATA.buyer_name,
//           product_name: DUMMY_MERCH_DATA.product_name,
//           variant_name: DUMMY_MERCH_DATA.variant_name,
//           quantity: DUMMY_MERCH_DATA.quantity,
//           scan_date: scanDateTime,
//           status: 'success',
//           type: 'validation',
//           pickedItems: Array(parseInt(DUMMY_MERCH_DATA.quantity)).fill(false),
//           completed: false,
//           itemDetails: Array.from({ length: parseInt(DUMMY_MERCH_DATA.quantity) }, (_, i) => ({
//             id: i + 1,
//             name: `${DUMMY_MERCH_DATA.product_name} ${DUMMY_MERCH_DATA.variant_name}`,
//             variant: DUMMY_MERCH_DATA.variant_name
//           }))
//         };
//         setScanHistory(prev => [newScan, ...prev]);
        
//         setNotificationData(newScan);
//         setNotificationType('success');
//         setShowNotification(true);
//       }, 1000);
//       return;
//     }

//     setIsScanning(false);
//     Post('merch/validate', { merch_code: code })
//       .then((res: any) => {
//         if (res.success) {
//           const scanDateTime = new Date().toISOString();
//           setData(res.data);
//           setScanStatus('validated');
//           setScanDate(scanDateTime);
          
//           const newScan = {
//             id: Date.now(),
//             invoice_no: res.data.invoice_no,
//             buyer_name: res.data.buyer_name,
//             product_name: res.data.product_name,
//             variant_name: res.data.variant_name,
//             quantity: res.data.quantity,
//             scan_date: scanDateTime,
//             status: 'success',
//             type: 'validation',
//             pickedItems: Array(parseInt(res.data.quantity)).fill(false),
//             completed: false,
//             itemDetails: Array.from({ length: parseInt(res.data.quantity) }, (_, i) => ({
//               id: i + 1,
//               name: `${res.data.product_name} ${res.data.variant_name}`,
//               variant: res.data.variant_name
//             }))
//           };
//           setScanHistory(prev => [newScan, ...prev]);
          
//           setNotificationData(newScan);
//           setNotificationType('success');
//           setShowNotification(true);
//         } else {
//           setStep(2);
//           const newScan = {
//             id: Date.now(),
//             invoice_no: 'N/A',
//             buyer_name: 'N/A',
//             product_name: 'Validasi Gagal',
//             variant_name: `Kode: ${code}`,
//             quantity: '0',
//             scan_date: new Date().toISOString(),
//             status: 'failed',
//             type: 'validation',
//             pickedItems: [],
//             completed: false,
//             itemDetails: []
//           };
//           setScanHistory(prev => [newScan, ...prev]);
          
//           setNotificationData(newScan);
//           setNotificationType('error');
//           setShowNotification(true);
//         }
//       })
//       .catch((err: any) => {
//         console.log(err);
//         setStep(2);
//         const newScan = {
//           id: Date.now(),
//           invoice_no: 'N/A',
//           buyer_name: 'N/A',
//           product_name: 'Validasi Gagal',
//           variant_name: `Kode: ${code}`,
//           quantity: '0',
//           scan_date: new Date().toISOString(),
//           status: 'failed',
//           type: 'validation',
//           pickedItems: [],
//           completed: false,
//           itemDetails: []
//         };
//         setScanHistory(prev => [newScan, ...prev]);
        
//         setNotificationData(newScan);
//         setNotificationType('error');
//         setShowNotification(true);
//       });
//   };

//   const handleManualSubmit = () => {
//     if (!qrCode.trim()) {
//       setNotificationData({
//         product_name: 'Validasi Gagal',
//         variant_name: 'Kode tidak boleh kosong',
//         scan_date: new Date().toISOString(),
//         invoice_no: 'N/A',
//         buyer_name: 'N/A',
//         quantity: '0'
//       });
//       setNotificationType('error');
//       setShowNotification(true);
//       return;
//     }
//     processMerchCode(qrCode);
//   };

//   const handlePickItem = (itemId: number, index: number) => {
//     const item = scanHistory.find(item => item.id === itemId);
//     if (!item) return;
    
//     const newPickedItems = [...item.pickedItems];
//     newPickedItems[index] = !newPickedItems[index];
    
//     setScanHistory(prev => 
//       prev.map(scanItem => 
//         scanItem.id === itemId 
//           ? { 
//               ...scanItem, 
//               pickedItems: newPickedItems,
//               completed: newPickedItems.every(Boolean)
//             }
//           : scanItem
//       )
//     );
//   };

//   // FUNGSI BARU: Centang semua item untuk scan terbaru
//   const handleCheckAllItems = () => {
//     if (scanHistory.length === 0) return;
    
//     const latestScan = scanHistory[0];
//     if (latestScan.type === 'validation' && latestScan.status === 'success' && !latestScan.completed) {
//       const quantity = parseInt(latestScan.quantity) || 0;
//       const allChecked = Array(quantity).fill(true);
      
//       setScanHistory(prev => 
//         prev.map(scanItem => 
//           scanItem.id === latestScan.id 
//             ? { 
//                 ...scanItem, 
//                 pickedItems: allChecked,
//                 completed: true
//               }
//             : scanItem
//         )
//       );
//     }
//   };

//   const handleMarkAsCompleted = (itemId: number) => {
//     const item = scanHistory.find(item => item.id === itemId);
//     if (!item) return;
    
//     const pickedCount = item.pickedItems.filter(Boolean).length;
//     const quantity = parseInt(item.quantity) || 0;
    
//     if (pickedCount === quantity) {
//       setScanHistory(prev => 
//         prev.map(scanItem => 
//           scanItem.id === itemId 
//             ? { 
//                 ...scanItem, 
//                 status: 'redeemed',
//                 completed: true
//               }
//             : scanItem
//         )
//       );
      
//       const redeemScan = {
//         id: Date.now(),
//         invoice_no: item.invoice_no,
//         buyer_name: item.buyer_name,
//         product_name: item.product_name,
//         variant_name: item.variant_name,
//         quantity: item.quantity,
//         scan_date: new Date().toISOString(),
//         status: 'success',
//         type: 'redeem',
//         pickedItems: item.pickedItems,
//         completed: true,
//         itemDetails: item.itemDetails
//       };
//       setScanHistory(prev => [redeemScan, ...prev]);
//     }
//   };

//   const handleResetPick = (itemId: number) => {
//     const item = scanHistory.find(item => item.id === itemId);
//     if (!item) return;
    
//     const quantity = parseInt(item.quantity) || 0;
    
//     setScanHistory(prev => 
//       prev.map(scanItem => 
//         scanItem.id === itemId 
//           ? { 
//               ...scanItem, 
//               pickedItems: Array(quantity).fill(false),
//               completed: false
//             }
//           : scanItem
//       )
//     );
//   };

//   const setDataWrapper = (scanData: any) => {
//     if (scanData && typeof scanData === 'string') {
//       handleMerchScan(scanData);
//     } else if (scanData && scanData.qrData) {
//       handleMerchScan(scanData.qrData);
//     }
//   };

//   const formatDateTime = (dateString: string) => {
//     const date = new Date(dateString);
//     return {
//       date: date.toLocaleDateString('id-ID', { 
//         day: 'numeric', 
//         month: 'short', 
//         year: 'numeric' 
//       }),
//       time: date.toLocaleTimeString('id-ID', { 
//         hour: '2-digit', 
//         minute: '2-digit' 
//       })
//     };
//   };

//   const handleScanAgain = () => {
//     setStep(0);
//     setData(null);
//     setQrCode('');
//     setIsScanning(true);
//     setShowNotification(false);
//   };

//   const handleCloseNotification = () => {
//     setShowNotification(false);
//   };

//   const getStatusIcon = (status: string, type: string) => {
//     if (status === 'success') {
//       return (
//         <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
//           <FontAwesomeIcon icon={faCheck} className="text-green-600 text-xs" />
//         </div>
//       );
//     }
//     if (status === 'failed') {
//       return (
//         <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
//           <FontAwesomeIcon icon={faXmark} className="text-red-600 text-xs" />
//         </div>
//       );
//     }
//     if (status === 'redeemed') {
//       return (
//         <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
//           <FontAwesomeIcon icon={faCheckDouble} className="text-blue-600 text-xs" />
//         </div>
//       );
//     }
//     return null;
//   };

//   const getStatusText = (status: string, type: string) => {
//     if (type === 'redeem') {
//       return 'Pengambilan Berhasil';
//     }
//     if (status === 'success') {
//       return 'Validasi Berhasil';
//     }
//     if (status === 'failed') {
//       return 'Validasi Gagal';
//     }
//     if (status === 'redeemed') {
//       return 'Telah Diredeem';
//     }
//     return 'Diproses';
//   };

//   const getStatusColor = (status: string, type: string) => {
//     if (type === 'redeem') {
//       return 'bg-blue-50 border-blue-200 text-blue-800';
//     }
//     if (status === 'success') {
//       return 'bg-green-50 border-green-200 text-green-800';
//     }
//     if (status === 'failed') {
//       return 'bg-red-50 border-red-200 text-red-800';
//     }
//     return 'bg-gray-50 border-gray-200 text-gray-800';
//   };

//   const getPickedCount = (item: any) => {
//     if (!item.pickedItems || item.pickedItems.length === 0) return 0;
//     return item.pickedItems.filter(Boolean).length;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white">
//         <div className="px-4 sm:px-6 lg:px-8 py-6">
//           <h1 className="text-3xl font-bold text-gray-900">Scan Merchandise</h1>
//         </div>
//       </div>

//       <div className="w-full relative">
//         <div className="flex flex-col lg:flex-row lg:gap-4">
//           <div className="lg:w-1/2 lg:pl-4">
//             <div className="bg-white rounded-xl shadow-sm border border-primary-light-200 p-6 h-full min-h-[calc(100vh-120px)] mx-4 lg:mx-0">
//               <div className="flex items-center gap-3 mb-6">
//                 <FontAwesomeIcon icon={faBox} className="text-primary text-xl" />
//                 <h2 className="text-xl font-semibold text-gray-900">Scan Merchandise</h2>
//               </div>

//               <div className="flex w-full mb-6 rounded-lg overflow-hidden border border-primary-light-200">
//                 <button
//                   className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 ${selected === 'qr' 
//                     ? 'bg-primary text-white' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                   onClick={() => {
//                     setSelected('qr');
//                     setStep(0);
//                     setData(null);
//                     setIsScanning(true);
//                   }}
//                 >
//                   <FontAwesomeIcon icon={faCamera} />
//                   Scan Camera
//                 </button>
//                 <button
//                   className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 ${selected === 'manual' 
//                     ? 'bg-primary text-white' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                   onClick={() => {
//                     setSelected('manual');
//                     setStep(0);
//                     setData(null);
//                   }}
//                 >
//                   <FontAwesomeIcon icon={faKeyboard} />
//                   Scanner/Input
//                 </button>
//               </div>

//               <div>
//                 {selected === 'qr' && step === 0 && (
//                   <div className="mb-4">
//                     <div className="rounded-lg overflow-hidden border-2 border-dashed border-primary-light-200 bg-gray-50 p-2 h-[400px] relative">
//                       {!isScanning && data && (
//                         <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
//                           <div className="bg-white p-6 rounded-xl text-center max-w-md w-full">
//                             <FontAwesomeIcon 
//                               icon={faCheckCircle} 
//                               className="text-4xl mb-3 text-green-500" 
//                             />
//                             <p className="font-semibold mb-2 text-lg text-green-700">Scan Berhasil!</p>
//                             <p className="text-sm text-gray-600 mb-4">Lihat detail di riwayat scan</p>
                            
//                             <Button
//                               label="Scan Lagi"
//                               onClick={handleScanAgain}
//                               color="primary"
//                             />
//                           </div>
//                         </div>
//                       )}
                      
//                       {!isScanning && (
//                         <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
//                           <div className="bg-white p-6 rounded-xl text-center">
//                             <FontAwesomeIcon 
//                               icon={faXmark} 
//                               className="text-4xl mb-3 text-red-500" 
//                             />
//                             <p className="font-semibold mb-2">Scan Gagal</p>
//                             <p className="text-sm text-gray-600 mb-4">Silakan coba lagi</p>
//                             <Button
//                               label="Scan Lagi"
//                               onClick={handleScanAgain}
//                               color="primary"
//                             />
//                           </div>
//                         </div>
//                       )}
                      
//                       {isScanning && (
//                         <>
//                           <div className="absolute inset-0 flex items-center justify-center">
//                             <div className="relative w-64 h-64">
//                               <div className="absolute inset-0 border-2 border-primary/30 rounded-lg"></div>
//                               <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
//                               <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
//                               <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
//                               <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
//                               <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-[scan_2s_ease-in-out_infinite]">
//                                 <div className="absolute -top-1 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2"></div>
//                               </div>
//                             </div>
//                           </div>
                          
//                           <QrScanner
//                             isOpen={isScanning}
//                             step={step}
//                             setStep={setStep}
//                             setData={setDataWrapper}
//                           />
//                         </>
//                       )}
//                     </div>
                    
//                     <style jsx>{`
//                       @keyframes scan {
//                         0%, 100% {
//                           top: 0%;
//                         }
//                         50% {
//                           top: 100%;
//                         }
//                       }
//                     `}</style>
//                   </div>
//                 )}
                
//                 {selected === 'manual' && step === 0 && (
//                   <div className="px-2">
//                     <div className="mb-4">
//                       <label className="block text-gray-700 text-sm font-medium mb-2">
//                         Kode Merchandise
//                       </label>
//                       <input
//                         type="text"
//                         className="border-2 border-primary-light-200 rounded-lg w-full py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
//                         placeholder="Masukkan kode merch atau scan QR"
//                         value={qrCode}
//                         onChange={(e) => setQrCode(e.target.value.toUpperCase())}
//                         autoFocus
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Contoh: {DUMMY_QR_CODE}
//                       </p>
//                     </div>
//                     <div className="flex justify-end">
//                       <Button
//                         label="Validasi Kode"
//                         onClick={handleManualSubmit}
//                         color="primary"
//                         disabled={!qrCode.trim()}
//                         fullWidth
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="lg:w-1/2 lg:pr-4 mt-6 lg:mt-0">
//             <div className="bg-white rounded-xl shadow-sm border border-primary-light-200 p-6 h-full min-h-[calc(100vh-120px)] mx-4 lg:mx-0">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                   <FontAwesomeIcon icon={faHistory} className="text-primary text-xl" />
//                   <h2 className="text-xl font-semibold text-gray-900">Riwayat Scan</h2>
//                 </div>
//                 {scanHistory.length > 0 && (
//                   <span className="bg-primary text-white text-xs font-medium px-2.5 py-1 rounded-full">
//                     {scanHistory.length}
//                   </span>
//                 )}
//               </div>

//               {showNotification ? (
//                 <div>
//                   <div className="mb-6">
//                     <ScanNotification
//                       data={notificationData}
//                       type={notificationType}
//                       onClose={handleCloseNotification}
//                       onScanAgain={handleScanAgain}
//                     />
//                   </div>

//                   <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 500px)' }}>
//                     {scanHistory.map((item, index) => {
//                       const { date, time } = formatDateTime(item.scan_date);
//                       const pickedCount = getPickedCount(item);
//                       const quantity = parseInt(item.quantity) || 0;
//                       const allPicked = pickedCount === quantity;
                      
//                       if (index === 0 && item.type === 'validation' && item.status === 'success') {
//                         return (
//                           <div 
//                             key={item.id} 
//                             className="p-4 border border-green-200 rounded-lg bg-green-50 mb-3"
//                           >
//                             <div className="flex items-start justify-between mb-2">
//                               <div className="flex items-center gap-2">
//                                 {getStatusIcon(item.status, item.type)}
//                                 <div>
//                                   <p className="font-medium text-sm text-gray-900">
//                                     {item.buyer_name !== 'N/A' ? item.buyer_name : 'Sistem'}
//                                   </p>
//                                   <p className="text-xs text-gray-500">
//                                     {item.invoice_no !== 'N/A' ? item.invoice_no : 'Tanpa Invoice'}
//                                   </p>
//                                 </div>
//                               </div>
//                               <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                 Validasi Berhasil
//                               </div>
//                             </div>
                            
//                             <div className="mb-3 ml-8">
//                               <p className="text-sm font-medium text-gray-900">
//                                 {item.product_name}
//                               </p>
//                               <p className="text-xs text-gray-600">
//                                 {item.variant_name} • {quantity} pcs
//                               </p>
                              
//                               {item.type === 'validation' && item.status === 'success' && quantity > 0 && !item.completed && (
//                                 <div className="mt-3 pt-3 border-t border-primary-light-200">
//                                   <div className="flex items-center justify-between mb-3">
//                                     <p className="text-sm font-medium text-gray-700">Centang item yang sudah diambil:</p>
//                                     <button
//                                       onClick={() => handleResetPick(item.id)}
//                                       className="text-xs text-red-600 hover:text-red-800 font-medium"
//                                     >
//                                       Reset
//                                     </button>
//                                   </div>
                                  
//                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
//                                     {Array.from({ length: quantity }).map((_, index) => {
//                                       const itemDetail = item.itemDetails && item.itemDetails[index] 
//                                         ? item.itemDetails[index] 
//                                         : { id: index + 1, name: item.product_name, variant: item.variant_name };
                                      
//                                       return (
//                                         <div 
//                                           key={index} 
//                                           className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
//                                             item.pickedItems[index] 
//                                               ? 'bg-green-50 border-green-200' 
//                                               : 'bg-white border-gray-200 hover:bg-gray-50'
//                                           }`}
//                                           onClick={() => handlePickItem(item.id, index)}
//                                         >
//                                           <div className="flex items-center">
//                                             <input
//                                               type="checkbox"
//                                               checked={item.pickedItems[index] || false}
//                                               onChange={() => handlePickItem(item.id, index)}
//                                               className="h-4 w-4 text-green-600 focus:ring-green-500 border-primary-light-200 rounded"
//                                             />
//                                           </div>
//                                           <div className="flex-1">
//                                             <p className={`text-xs font-medium ${item.pickedItems[index] ? 'text-green-600' : 'text-gray-900'}`}>
//                                               {itemDetail.name}
//                                             </p>
//                                             <p className={`text-xs ${item.pickedItems[index] ? 'text-green-500' : 'text-gray-600'}`}>
//                                               Variant: {itemDetail.variant} • Item #{index + 1}
//                                               {item.pickedItems[index] && (
//                                                 <span className="ml-1 text-green-500">✓</span>
//                                               )}
//                                             </p>
//                                           </div>
//                                         </div>
//                                       );
//                                     })}
//                                   </div>
                                  
//                                   <div className="mb-4">
//                                     <div className="flex items-center justify-between text-sm mb-2">
//                                       <span className="text-gray-600">
//                                         {pickedCount} dari {quantity} item
//                                       </span>
//                                       <span className={`font-medium ${allPicked ? 'text-green-600' : 'text-gray-700'}`}>
//                                         {quantity > 0 ? Math.round((pickedCount / quantity) * 100) : 0}%
//                                         {allPicked && ' ✓'}
//                                       </span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-2">
//                                       <div 
//                                         className={`h-2 rounded-full transition-all duration-300 ${
//                                           allPicked ? 'bg-green-600' : 'bg-green-500'
//                                         }`}
//                                         style={{ width: `${quantity > 0 ? (pickedCount / quantity) * 100 : 0}%` }}
//                                       ></div>
//                                     </div>
//                                   </div>
                                  
//                                   {allPicked && (
//                                     <div className="mt-2">
//                                       <button
//                                         onClick={() => handleMarkAsCompleted(item.id)}
//                                         className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
//                                       >
//                                         <FontAwesomeIcon icon={faCheckDouble} />
//                                         Selesai - {pickedCount} item sudah diambil
//                                       </button>
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
                            
//                             <div className="flex items-center justify-between text-xs ml-8">
//                               <div className="flex items-center gap-1 text-gray-500">
//                                 <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
//                                 <span>{date}</span>
//                               </div>
//                               <div className="flex items-center gap-1 text-gray-500">
//                                 <FontAwesomeIcon icon={faClock} className="text-gray-400" />
//                                 <span>{time}</span>
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       }
                      
//                       return (
//                         <div 
//                           key={item.id} 
//                           className={`p-4 border rounded-lg transition-colors mb-3 ${getStatusColor(item.status, item.type)}`}
//                         >
//                           <div className="flex items-start justify-between mb-2">
//                             <div className="flex items-center gap-2">
//                               {getStatusIcon(item.status, item.type)}
//                               <div>
//                                 <p className={`font-medium text-sm ${item.status === 'failed' ? 'text-red-800' : 'text-gray-900'}`}>
//                                   {item.buyer_name !== 'N/A' ? item.buyer_name : 'Sistem'}
//                                 </p>
//                                 <p className={`text-xs ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
//                                   {item.invoice_no !== 'N/A' ? item.invoice_no : 'Tanpa Invoice'}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               item.type === 'redeem'
//                                 ? 'bg-blue-100 text-blue-800'
//                                 : item.status === 'success'
//                                 ? 'bg-green-100 text-green-800'
//                                 : item.status === 'failed'
//                                 ? 'bg-red-100 text-red-800'
//                                 : 'bg-yellow-100 text-yellow-800'
//                             }`}>
//                               {getStatusText(item.status, item.type)}
//                             </div>
//                           </div>
                          
//                           <div className="mb-3 ml-8">
//                             <p className={`text-sm font-medium ${item.status === 'failed' ? 'text-red-700' : 'text-gray-900'}`}>
//                               {item.product_name}
//                             </p>
//                             <p className={`text-xs ${item.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
//                               {item.variant_name} • {quantity} pcs
//                             </p>
                            
//                             {item.type === 'redeem' && (
//                               <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
//                                 <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
//                                 <span>Merchandise telah diserahkan ({quantity} item)</span>
//                               </div>
//                             )}
//                             {item.type === 'validation' && item.status === 'success' && item.completed && (
//                               <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
//                                 <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
//                                 <span>Pengambilan selesai ({pickedCount}/{quantity} item)</span>
//                               </div>
//                             )}
//                             {item.status === 'failed' && (
//                               <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
//                                 <FontAwesomeIcon icon={faXmark} className="text-xs" />
//                                 <span>Gagal divalidasi</span>
//                               </div>
//                             )}
//                           </div>
                          
//                           <div className="flex items-center justify-between text-xs ml-8">
//                             <div className={`flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
//                               <FontAwesomeIcon icon={faCalendarAlt} className={item.status === 'failed' ? 'text-red-500' : 'text-gray-400'} />
//                               <span>{date}</span>
//                             </div>
//                             <div className={`flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
//                               <FontAwesomeIcon icon={faClock} className={item.status === 'failed' ? 'text-red-500' : 'text-gray-400'} />
//                               <span>{time}</span>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ) : scanHistory.length === 0 ? (
//                 <div className="text-center py-12">
//                   <FontAwesomeIcon 
//                     icon={faClock} 
//                     className="text-gray-300 text-5xl mb-4" 
//                   />
//                   <h3 className="text-lg font-medium text-gray-700 mb-2">
//                     Belum ada riwayat scan
//                   </h3>
//                   <p className="text-gray-500 text-sm max-w-md mx-auto">
//                     Scan kode <span className="font-mono font-medium">{DUMMY_QR_CODE}</span> untuk mencoba
//                   </p>
//                   <div className="mt-4">
//                     <button
//                       onClick={() => {
//                         setQrCode(DUMMY_QR_CODE);
//                         setSelected('manual');
//                         handleManualSubmit();
//                       }}
//                       className="text-sm text-primary hover:text-primary-dark font-medium"
//                     >
//                       Klik di sini untuk test dengan kode dummy
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
//                   {scanHistory.map((item) => {
//                     const { date, time } = formatDateTime(item.scan_date);
//                     const pickedCount = getPickedCount(item);
//                     const quantity = parseInt(item.quantity) || 0;
//                     const allPicked = pickedCount === quantity;
                    
//                     return (
//                       <div 
//                         key={item.id} 
//                         className={`p-4 border rounded-lg transition-colors mb-3 ${getStatusColor(item.status, item.type)}`}
//                       >
//                         <div className="flex items-start justify-between mb-2">
//                           <div className="flex items-center gap-2">
//                             {getStatusIcon(item.status, item.type)}
//                             <div>
//                               <p className={`font-medium text-sm ${item.status === 'failed' ? 'text-red-800' : 'text-gray-900'}`}>
//                                 {item.buyer_name !== 'N/A' ? item.buyer_name : 'Sistem'}
//                               </p>
//                               <p className={`text-xs ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
//                                 {item.invoice_no !== 'N/A' ? item.invoice_no : 'Tanpa Invoice'}
//                               </p>
//                             </div>
//                           </div>
//                           <div className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             item.type === 'redeem'
//                               ? 'bg-blue-100 text-blue-800'
//                               : item.status === 'success'
//                               ? 'bg-green-100 text-green-800'
//                               : item.status === 'failed'
//                               ? 'bg-red-100 text-red-800'
//                               : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {getStatusText(item.status, item.type)}
//                           </div>
//                         </div>
                        
//                         <div className="mb-3 ml-8">
//                           <p className={`text-sm font-medium ${item.status === 'failed' ? 'text-red-700' : 'text-gray-900'}`}>
//                             {item.product_name}
//                           </p>
//                           <p className={`text-xs ${item.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
//                             {item.variant_name} • {quantity} pcs
//                           </p>
                          
//                           {item.type === 'validation' && item.status === 'success' && quantity > 0 && !item.completed && (
//                             <div className="mt-3 pt-3 border-t border-primary-light-200">
//                               <div className="flex items-center justify-between mb-3">
//                                 <p className="text-sm font-medium text-gray-700">Centang item yang sudah diambil:</p>
//                                 <button
//                                   onClick={() => handleResetPick(item.id)}
//                                   className="text-xs text-red-600 hover:text-red-800 font-medium"
//                                 >
//                                   Reset
//                                 </button>
//                               </div>
                              
//                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
//                                 {Array.from({ length: quantity }).map((_, index) => {
//                                   const itemDetail = item.itemDetails && item.itemDetails[index] 
//                                     ? item.itemDetails[index] 
//                                     : { id: index + 1, name: item.product_name, variant: item.variant_name };
                                  
//                                   return (
//                                     <div 
//                                       key={index} 
//                                       className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
//                                         item.pickedItems[index] 
//                                           ? 'bg-green-50 border-green-200' 
//                                           : 'bg-white border-gray-200 hover:bg-gray-50'
//                                       }`}
//                                       onClick={() => handlePickItem(item.id, index)}
//                                     >
//                                       <div className="flex items-center">
//                                         <input
//                                           type="checkbox"
//                                           checked={item.pickedItems[index] || false}
//                                           onChange={() => handlePickItem(item.id, index)}
//                                           className="h-4 w-4 text-green-600 focus:ring-green-500 border-primary-light-200 rounded"
//                                         />
//                                       </div>
//                                       <div className="flex-1">
//                                         <p className={`text-xs font-medium ${item.pickedItems[index] ? 'text-green-600' : 'text-gray-900'}`}>
//                                           {itemDetail.name}
//                                         </p>
//                                         <p className={`text-xs ${item.pickedItems[index] ? 'text-green-500' : 'text-gray-600'}`}>
//                                           Variant: {itemDetail.variant} • Item #{index + 1}
//                                           {item.pickedItems[index] && (
//                                             <span className="ml-1 text-green-500">✓</span>
//                                           )}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
                              
//                               <div className="mb-4">
//                                 <div className="flex items-center justify-between text-sm mb-2">
//                                   <span className="text-gray-600">
//                                     {pickedCount} dari {quantity} item
//                                   </span>
//                                   <span className={`font-medium ${allPicked ? 'text-green-600' : 'text-gray-700'}`}>
//                                     {quantity > 0 ? Math.round((pickedCount / quantity) * 100) : 0}%
//                                     {allPicked && ' ✓'}
//                                   </span>
//                                 </div>
//                                 <div className="w-full bg-gray-200 rounded-full h-2">
//                                   <div 
//                                     className={`h-2 rounded-full transition-all duration-300 ${
//                                       allPicked ? 'bg-green-600' : 'bg-green-500'
//                                     }`}
//                                     style={{ width: `${quantity > 0 ? (pickedCount / quantity) * 100 : 0}%` }}
//                                   ></div>
//                                 </div>
//                               </div>
                              
//                               {allPicked && (
//                                 <div className="mt-2">
//                                   <button
//                                     onClick={() => handleMarkAsCompleted(item.id)}
//                                     className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
//                                   >
//                                     <FontAwesomeIcon icon={faCheckDouble} />
//                                     Selesai - {pickedCount} item sudah diambil
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           )}
                          
//                           {item.type === 'redeem' && (
//                             <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
//                               <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
//                               <span>Merchandise telah diserahkan ({quantity} item)</span>
//                             </div>
//                           )}
//                           {item.type === 'validation' && item.status === 'success' && item.completed && (
//                             <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
//                               <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
//                               <span>Pengambilan selesai ({pickedCount}/{quantity} item)</span>
//                             </div>
//                           )}
//                           {item.status === 'failed' && (
//                             <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
//                               <FontAwesomeIcon icon={faXmark} className="text-xs" />
//                               <span>Gagal divalidasi</span>
//                             </div>
//                           )}
//                         </div>
                        
//                         <div className="flex items-center justify-between text-xs ml-8">
//                           <div className={`flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
//                             <FontAwesomeIcon icon={faCalendarAlt} className={item.status === 'failed' ? 'text-red-500' : 'text-gray-400'} />
//                             <span>{date}</span>
//                           </div>
//                           <div className={`flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
//                             <FontAwesomeIcon icon={faClock} className={item.status === 'failed' ? 'text-red-500' : 'text-gray-400'} />
//                             <span>{time}</span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {(!showNotification && scanHistory.length > 0) && (
//           <div className="fixed bottom-6 z-50" style={{ 
//             left: 'calc(50% + 16px)',
//             width: 'calc(50% - 32px)'
//           }}>
//             <div className="bg-white rounded-xl shadow-lg border border-primary-light-200 p-4 mx-4 lg:mx-0 lg:mr-4">
//               <div className="flex gap-2">
//                 <Button
//                   label="Clear History"
//                   onClick={() => setScanHistory([])}
//                   fullWidth
//                   color="primary"
//                 />
//                 <Button
//                   label="Centang Semua"
//                   onClick={handleCheckAllItems}
//                   fullWidth
//                   color="primary"
//                 />
//                 <Button
//                   label="Scan Baru"
//                   onClick={handleScanAgain}
//                   fullWidth
//                   color="primary"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {showNotification && (
//           <div className="fixed bottom-6 z-50" style={{ 
//             left: 'calc(50% + 16px)',
//             width: 'calc(50% - 32px)'
//           }}>
//             <div className="bg-white rounded-xl shadow-lg border border-primary-light-200 p-4 mx-4 lg:mx-0 lg:mr-4">
//               <div className="flex gap-2">
//                 <Button
//                   label="Tutup Notifikasi"
//                   onClick={handleCloseNotification}
//                   fullWidth
//                   color="primary"
                  
//                 />
//                 <Button
//                   label="Centang Semua"
//                   onClick={handleCheckAllItems}
//                   fullWidth
//                   color="primary"
//                 />
//                 <Button
//                   label="Scan Lagi"
//                   onClick={handleScanAgain}
//                   fullWidth
//                   color="primary"
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import QrScannerMerch from '@/components/QrScannerMerch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import Button from '@/components/Button';
import { Post, Get } from '@/utils/REST';
import Cookies from 'js-cookie';
import { faXmark, faBox, faClock, faHistory, faCalendarAlt, faCheck, faCheckDouble, faCamera, faKeyboard, faSpinner, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface SuccessMerchData {
  invoice_no: string;
  product_name: string;
  quantity: string;
  variant_name: string;
  buyer_name: string;
  total_price: string;
  status: string;
  scan_date: string;
  pickup_status?: string;
  message?: string;
}

interface ScanItem {
  id: number;
  invoice_no: string;
  buyer_name: string;
  product_name: string;
  variant_name: string;
  quantity: string;
  total_price: string;
  scan_date: string;
  status: 'success' | 'failed' | 'redeemed';
  type: 'validation' | 'redeem';
  pickedItems: boolean[];
  completed: boolean;
  itemDetails: Array<{
    id: number;
    name: string;
    variant: string;
  }>;
  message?: string;
  pickup_status?: string;
}

export default function MerchScanPage() {
  const [selected, setSelected] = useState<'qr' | 'manual'>('qr');
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SuccessMerchData | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScanItem[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastScanMessage, setLastScanMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentScanData, setCurrentScanData] = useState<SuccessMerchData | null>(null);
  const [showModalFooter, setShowModalFooter] = useState(false);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  useEffect(() => {
    if (step === 2 || data) {
      setIsScanning(false);
    }
  }, [step, data]);

  const fetchScanHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const authToken = Cookies.get('auth_token') || Cookies.get('token');
      
      const config = authToken ? {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      } : {};

      const response = await Get('order-bycreator', config) as {
        success: boolean;
        data: any[];
        message?: string;
      };
      
      if (response.success && Array.isArray(response.data)) {
        const pickupOrders = response.data
          .filter((order: any) => order.is_pickup === 1)
          .map((order: any, index: number) => ({
            id: order.id || Date.now() + index,
            invoice_no: order.invoice_no || 'N/A',
            buyer_name: order.buyer_name || order.customer_name || 'Customer',
            product_name: order.product_name || 'Merchandise',
            variant_name: order.variant_name || order.variant || 'Standard',
            quantity: order.quantity?.toString() || '1',
            total_price: order.total_price || '0',
            scan_date: order.updated_at || order.created_at || new Date().toISOString(),
            status: 'success' as const,
            type: 'redeem' as const,
            pickedItems: Array(parseInt(order.quantity || 1)).fill(true),
            completed: true,
            itemDetails: Array.from({ length: parseInt(order.quantity || 1) }, (_, i) => ({
              id: i + 1,
              name: order.product_name || 'Merchandise',
              variant: order.variant_name || 'Standard'
            }))
          }));
        
        setScanHistory(pickupOrders);
      }
    } catch (error) {
      console.error('Error fetching scan history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleMerchScan = (scannedData: string) => {
    let merchCode = scannedData;
    
    if (scannedData.includes('?')) {
      const urlParams = new URLSearchParams(scannedData.split('?')[1]);
      merchCode = urlParams.get('code') || scannedData;
    }
    
    processMerchCode(merchCode);
  };

  const processMerchCode = async (code: string) => {
    try {
      setIsScanning(false);
      setLastScanMessage(null);
      setShowSuccessModal(false);
      setShowModalFooter(false);
      
      const response = await Post('order-product/scan/', { invoice_no: code }) as {
        status: boolean;
        message: string;
        pickup_status: string;
        data?: {
          invoice_no?: string;
          is_pickup?: number;
          picked_up_at?: string | null;
          picked_up_by?: string;
          user?: {
            id: number;
            name: string;
            email: string;
            phone: string | null;
          };
          products?: Array<{
            product_name: string;
            variant: string;
            price: string;
            image: string;
            qty: number;
          }>;
        };
      };
      
      if (response.status && response.data) {
        const scanDateTime = new Date().toISOString();
        const firstProduct = response.data.products?.[0];
        
        const merchData: SuccessMerchData = {
          invoice_no: response.data.invoice_no || 'N/A',
          product_name: firstProduct?.product_name || 'Produk Merchandise',
          quantity: firstProduct?.qty?.toString() || '1',
          variant_name: firstProduct?.variant || 'Standard',
          buyer_name: response.data.user?.name || response.data.picked_up_by || 'Customer',
          total_price: firstProduct?.price || '0',
          status: response.data.is_pickup === 1 ? 'redeemed' : 'validated',
          scan_date: scanDateTime,
          message: response.message,
          pickup_status: response.pickup_status
        };
        
        setCurrentScanData(merchData);
        
        if (selected === 'qr') {
          setShowSuccessModal(true);
          setShowModalFooter(true);
        }
        
        if (selected === 'manual') {
          setData(merchData);
        }
        
        const quantity = parseInt(merchData.quantity) || 1;
        const isPickup = response.data.is_pickup === 1;
        
        const newScan: ScanItem = {
          id: Date.now(),
          invoice_no: merchData.invoice_no,
          buyer_name: merchData.buyer_name,
          product_name: merchData.product_name,
          variant_name: merchData.variant_name,
          quantity: merchData.quantity,
          total_price: merchData.total_price,
          scan_date: scanDateTime,
          status: 'success',
          type: isPickup ? 'redeem' : 'validation',
          pickedItems: isPickup ? Array(quantity).fill(true) : Array(quantity).fill(false),
          completed: isPickup,
          itemDetails: Array.from({ length: quantity }, (_, i) => ({
            id: i + 1,
            name: merchData.product_name,
            variant: merchData.variant_name
          })),
          message: response.message,
          pickup_status: response.pickup_status
        };
        
        const displayMessage = `${response.message}${response.pickup_status ? `: ${response.pickup_status}` : ''}`;
        setLastScanMessage(displayMessage);
        
        setScanHistory(prev => [newScan, ...prev]);
        fetchScanHistory();
      } else {
        setStep(2);
        const newScan: ScanItem = {
          id: Date.now(),
          invoice_no: 'N/A',
          buyer_name: 'N/A',
          product_name: 'Validasi Gagal',
          variant_name: `Kode: ${code}`,
          quantity: '0',
          total_price: '0',
          scan_date: new Date().toISOString(),
          status: 'failed',
          type: 'validation',
          pickedItems: [],
          completed: false,
          itemDetails: [],
          message: response.message || 'Scan gagal'
        };
        
        setLastScanMessage(response.message || 'Scan gagal');
        setScanHistory(prev => [newScan, ...prev]);
      }
    } catch (error: any) {
      console.log('Scan error:', error);
      setStep(2);
      const newScan: ScanItem = {
        id: Date.now(),
        invoice_no: 'N/A',
        buyer_name: 'N/A',
        product_name: 'Validasi Gagal',
        variant_name: `Kode: ${code}`,
        quantity: '0',
        total_price: '0',
        scan_date: new Date().toISOString(),
        status: 'failed',
        type: 'validation',
        pickedItems: [],
        completed: false,
        itemDetails: [],
        message: 'Terjadi kesalahan saat scan'
      };
      
      setLastScanMessage('Terjadi kesalahan saat scan');
      setScanHistory(prev => [newScan, ...prev]);
    }
  };

  const handleManualSubmit = () => {
    if (!qrCode.trim()) {
      const newScan: ScanItem = {
        id: Date.now(),
        invoice_no: 'N/A',
        buyer_name: 'N/A',
        product_name: 'Validasi Gagal',
        variant_name: 'Kode tidak boleh kosong',
        quantity: '0',
        total_price: '0',
        scan_date: new Date().toISOString(),
        status: 'failed',
        type: 'validation',
        pickedItems: [],
        completed: false,
        itemDetails: [],
        message: 'Kode tidak boleh kosong'
      };
      
      setLastScanMessage('Kode tidak boleh kosong');
      setScanHistory(prev => [newScan, ...prev]);
      return;
    }
    processMerchCode(qrCode);
  };

  const handlePickItem = (itemId: number, index: number) => {
    const item = scanHistory.find(item => item.id === itemId);
    if (!item) return;
    
    const newPickedItems = [...item.pickedItems];
    newPickedItems[index] = !newPickedItems[index];
    
    setScanHistory(prev => 
      prev.map(scanItem => 
        scanItem.id === itemId 
          ? { 
              ...scanItem, 
              pickedItems: newPickedItems,
              completed: newPickedItems.every(Boolean)
            }
          : scanItem
      )
    );
  };

  const handleCheckAllItems = () => {
    if (scanHistory.length === 0) return;
    
    const latestScan = scanHistory[0];
    if (latestScan.type === 'validation' && latestScan.status === 'success' && !latestScan.completed) {
      const quantity = parseInt(latestScan.quantity) || 0;
      const allChecked = Array(quantity).fill(true);
      
      setScanHistory(prev => 
        prev.map(scanItem => 
          scanItem.id === latestScan.id 
            ? { 
                ...scanItem, 
                pickedItems: allChecked,
                completed: true
              }
            : scanItem
        )
      );
    }
  };

  const handleMarkAsCompleted = async (itemId: number) => {
    const item = scanHistory.find(item => item.id === itemId);
    if (!item) return;
    
    const pickedCount = item.pickedItems.filter(Boolean).length;
    const quantity = parseInt(item.quantity) || 0;
    
    if (pickedCount === quantity) {
      try {
        const response = await Post('/api/order-product/complete/', { 
          invoice_no: item.invoice_no,
          quantity: item.quantity 
        }) as {
          success: boolean;
          message?: string;
        };
        
        if (response.success) {
          setScanHistory(prev => 
            prev.map(scanItem => 
              scanItem.id === itemId 
                ? { 
                    ...scanItem, 
                    status: 'redeemed',
                    completed: true
                  }
                : scanItem
            )
          );
          
          const redeemScan: ScanItem = {
            id: Date.now(),
            invoice_no: item.invoice_no,
            buyer_name: item.buyer_name,
            product_name: item.product_name,
            variant_name: item.variant_name,
            quantity: item.quantity,
            total_price: item.total_price,
            scan_date: new Date().toISOString(),
            status: 'success',
            type: 'redeem',
            pickedItems: item.pickedItems,
            completed: true,
            itemDetails: item.itemDetails,
            message: response.message || 'Pengambilan selesai'
          };
          
          setScanHistory(prev => [redeemScan, ...prev]);
          setLastScanMessage('Pengambilan merchandise selesai');
          
          fetchScanHistory();
        } else {
          setLastScanMessage(response.message || 'Gagal menyelesaikan pengambilan');
        }
      } catch (error) {
        console.error('Error completing order:', error);
        setLastScanMessage('Gagal menyelesaikan pengambilan');
      }
    }
  };

  const handleResetPick = (itemId: number) => {
    const item = scanHistory.find(item => item.id === itemId);
    if (!item) return;
    
    const quantity = parseInt(item.quantity) || 0;
    
    setScanHistory(prev => 
      prev.map(scanItem => 
        scanItem.id === itemId 
          ? { 
              ...scanItem, 
              pickedItems: Array(quantity).fill(false),
              completed: false
            }
          : scanItem
      )
    );
  };

  const setDataWrapper = (scanData: any) => {
    if (scanData && scanData.type === 'merchandise') {
      if (scanData.success) {
        const merchData: SuccessMerchData = {
          invoice_no: scanData.data?.invoice_no || 'N/A',
          product_name: scanData.data?.products?.[0]?.product_name || 'Produk Merchandise',
          quantity: scanData.data?.products?.[0]?.qty?.toString() || '1',
          variant_name: scanData.data?.products?.[0]?.variant || 'Standard',
          buyer_name: scanData.data?.user?.name || scanData.data?.picked_up_by || 'Customer',
          total_price: scanData.data?.products?.[0]?.price || '0',
          status: scanData.data?.is_pickup === 1 ? 'redeemed' : 'validated',
          scan_date: new Date().toISOString()
        };
        
        setCurrentScanData({
          ...merchData,
          message: scanData.message,
          pickup_status: scanData.pickup_status
        });
        
        setShowSuccessModal(true);
        setShowModalFooter(true);
        
        const quantity = parseInt(merchData.quantity) || 1;
        const isPickup = scanData.data?.is_pickup === 1;
        
        const newScan: ScanItem = {
          id: Date.now(),
          invoice_no: merchData.invoice_no,
          buyer_name: merchData.buyer_name,
          product_name: merchData.product_name,
          variant_name: merchData.variant_name,
          quantity: merchData.quantity,
          total_price: merchData.total_price,
          scan_date: new Date().toISOString(),
          status: 'success',
          type: isPickup ? 'redeem' : 'validation',
          pickedItems: isPickup ? Array(quantity).fill(true) : Array(quantity).fill(false),
          completed: isPickup,
          itemDetails: Array.from({ length: quantity }, (_, i) => ({
            id: i + 1,
            name: merchData.product_name,
            variant: merchData.variant_name
          })),
          message: scanData.message,
          pickup_status: scanData.pickup_status
        };
        
        setScanHistory(prev => [newScan, ...prev]);
        fetchScanHistory();
        
      } else {
        setCurrentScanData({
          invoice_no: 'N/A',
          product_name: 'Validasi Gagal',
          quantity: '0',
          variant_name: `Kode: ${scanData.rawResponse?.invoice_no || 'N/A'}`,
          buyer_name: 'N/A',
          total_price: '0',
          status: 'failed',
          scan_date: new Date().toISOString(),
          message: scanData.message || 'Scan gagal'
        });
        
        setShowSuccessModal(true);
        setShowModalFooter(true);
        
        const newScan: ScanItem = {
          id: Date.now(),
          invoice_no: 'N/A',
          buyer_name: 'N/A',
          product_name: 'Validasi Gagal',
          variant_name: 'Validasi Gagal',
          quantity: '0',
          total_price: '0',
          scan_date: new Date().toISOString(),
          status: 'failed',
          type: 'validation',
          pickedItems: [],
          completed: false,
          itemDetails: [],
          message: scanData.message || 'Scan gagal'
        };
        
        setScanHistory(prev => [newScan, ...prev]);
      }
    } else if (scanData && typeof scanData === 'string') {
      handleMerchScan(scanData);
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

  const handleScanAgain = () => {
    setStep(0);
    setData(null);
    setQrCode('');
    setIsScanning(true);
    setLastScanMessage(null);
    setShowSuccessModal(false);
    setCurrentScanData(null);
    setShowModalFooter(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setShowModalFooter(false);
    setCurrentScanData(null);
  };

  const handleScanAgainFromModal = () => {
    setShowSuccessModal(false);
    setShowModalFooter(false);
    setStep(0);
    setData(null);
    setQrCode('');
    setIsScanning(true);
    setLastScanMessage(null);
    setCurrentScanData(null);
  };

  const getStatusIcon = (status: string, type: string) => {
    if (status === 'success') {
      return (
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faCheck} className="text-green-600 text-xs" />
        </div>
      );
    }
    if (status === 'failed') {
      return (
        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faXmark} className="text-red-600 text-xs" />
        </div>
      );
    }
    if (status === 'redeemed') {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faCheckDouble} className="text-blue-600 text-xs" />
        </div>
      );
    }
    return null;
  };

  const getStatusText = (status: string, type: string) => {
    if (type === 'redeem') {
      return 'Pengambilan Berhasil';
    }
    if (status === 'success') {
      return 'Validasi Berhasil';
    }
    if (status === 'failed') {
      return 'Validasi Gagal';
    }
    if (status === 'redeemed') {
      return 'Telah Diredeem';
    }
    return 'Diproses';
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'redeem') {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    if (status === 'success') {
      return 'bg-green-50 border-green-200 text-green-800';
    }
    if (status === 'failed') {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    return 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getPickedCount = (item: ScanItem) => {
    if (!item.pickedItems || item.pickedItems.length === 0) return 0;
    return item.pickedItems.filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Scan Merchandise</h1>
        </div>
      </div>

      <div className="w-full relative">
        <div className="flex flex-col lg:flex-row lg:gap-4">
          {/* Bagian Scanner */}
          <div className="lg:w-1/2 lg:pl-4">
            <div className="bg-white rounded-xl shadow-sm border border-primary-light-200 p-6 h-full min-h-[calc(100vh-120px)] mx-4 lg:mx-0">
              <div className="flex items-center gap-3 mb-6">
                <FontAwesomeIcon icon={faBox} className="text-primary text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">Scan Merchandise</h2>
              </div>

              <div className="flex w-full mb-6 rounded-lg overflow-hidden border border-primary-light-200">
                <button
                  className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 ${selected === 'qr' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    setSelected('qr');
                    setStep(0);
                    setData(null);
                    setCurrentScanData(null);
                    setIsScanning(true);
                    setShowSuccessModal(false);
                    setShowModalFooter(false);
                  }}
                >
                  <FontAwesomeIcon icon={faCamera} />
                  Scan Camera
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 ${selected === 'manual' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    setSelected('manual');
                    setStep(0);
                    setData(null);
                    setCurrentScanData(null);
                    setShowSuccessModal(false);
                    setShowModalFooter(false);
                  }}
                >
                  <FontAwesomeIcon icon={faKeyboard} />
                  Scanner/Input
                </button>
              </div>

              <div>
                {selected === 'qr' && step === 0 && (
                  <div className="mb-4">
                    <div className="rounded-lg overflow-hidden border-2 border-dashed border-primary-light-200 bg-gray-50 p-2 h-[400px] relative">
                      {!isScanning && !data && !showSuccessModal && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center p-4">
                          <div className="bg-white p-6 rounded-xl text-center max-w-md w-full">
                            <FontAwesomeIcon 
                              icon={faXmark} 
                              className="text-4xl mb-3 text-red-500" 
                            />
                            <p className="font-semibold mb-2">Scan Gagal</p>
                            <p className="text-sm text-gray-600 mb-4">Silakan coba lagi</p>
                            <Button
                              label="Scan Lagi"
                              onClick={handleScanAgain}
                              color="primary"
                              fullWidth
                            />
                          </div>
                        </div>
                      )}
                      
                      {isScanning && !showSuccessModal && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-64 h-64">
                              <div className="absolute inset-0 border-2 border-primary/30 rounded-lg"></div>
                              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-[scan_2s_ease-in-out_infinite]">
                                <div className="absolute -top-1 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2"></div>
                              </div>
                            </div>
                          </div>
                          
                          <QrScannerMerch
                            isOpen={isScanning}
                            step={step}
                            setStep={setStep}
                            setData={setDataWrapper}
                            scanType="merchandise"
                          />
                        </>
                      )}
                    </div>
                    
                    <style jsx>{`
                      @keyframes scan {
                        0%, 100% {
                          top: 0%;
                        }
                        50% {
                          top: 100%;
                        }
                      }
                      @keyframes fadeIn {
                        from {
                          opacity: 0;
                          transform: scale(0.95);
                        }
                        to {
                          opacity: 1;
                          transform: scale(1);
                        }
                      }
                      .animate-fadeIn {
                        animation: fadeIn 0.2s ease-out;
                      }
                    `}</style>
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
                        className="border-2 border-primary-light-200 rounded-lg w-full py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                        placeholder="Masukkan invoice number"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Masukkan nomor invoice untuk validasi merchandise
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
            </div>
          </div>

          {/* Bagian Riwayat Scan dengan Modal */}
          <div className="lg:w-1/2 lg:pr-4 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm border border-primary-light-200 p-6 h-full min-h-[calc(100vh-120px)] mx-4 lg:mx-0 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faHistory} className="text-primary text-xl" />
                  <h2 className="text-xl font-semibold text-gray-900">Riwayat Scan</h2>
                </div>
                {scanHistory.length > 0 && !isLoadingHistory && (
                  <span className="bg-primary text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {scanHistory.length}
                  </span>
                )}
                {isLoadingHistory && (
                  <FontAwesomeIcon icon={faSpinner} className="text-primary animate-spin" />
                )}
              </div>

              {/* Modal Success */}
              {showSuccessModal && currentScanData && selected === 'qr' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-xl text-center max-w-md w-full animate-fadeIn">
                    <FontAwesomeIcon 
                      icon={currentScanData.pickup_status?.includes('Sudah diambil') ? faInfoCircle : faCheckCircle} 
                      className={`text-4xl mb-3 ${
                        currentScanData.pickup_status?.includes('Sudah diambil') 
                          ? 'text-yellow-500' 
                          : 'text-green-500'
                      }`} 
                    />
                    <p className={`font-semibold mb-2 text-lg ${
                      currentScanData.pickup_status?.includes('Sudah diambil') 
                        ? 'text-yellow-700' 
                        : 'text-green-700'
                    }`}>
                      Scan Berhasil!
                    </p>
                    
                    <div className="text-left mb-4 bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Invoice:</div>
                        <div className="font-medium">{currentScanData.invoice_no}</div>
                        
                        <div className="text-gray-600">Produk:</div>
                        <div className="font-medium">{currentScanData.product_name}</div>
                        
                        <div className="text-gray-600">Variant:</div>
                        <div className="font-medium">{currentScanData.variant_name}</div>
                        
                        <div className="text-gray-600">Pembeli:</div>
                        <div className="font-medium">{currentScanData.buyer_name}</div>
                        
                        <div className="text-gray-600">Status:</div>
                        <div className={`font-medium ${
                          currentScanData.pickup_status?.includes('Sudah diambil') 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                        }`}>
                          {currentScanData.pickup_status || 'Valid'}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {currentScanData.pickup_status?.includes('Sudah diambil') 
                        ? 'Merchandise ini sudah pernah diambil sebelumnya.'
                        : 'Lihat detail di riwayat scan'}
                    </p>
                  </div>
                </div>
              )}

              {isLoadingHistory ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="text-primary text-4xl mb-4 animate-spin" 
                  />
                  <p className="text-gray-600">Memuat riwayat scan...</p>
                </div>
              ) : (
                <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                  {lastScanMessage && selected === 'qr' && !showSuccessModal && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      lastScanMessage.includes('berhasil') || lastScanMessage.includes('Scan berhasil')
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : lastScanMessage.includes('Sudah diambil')
                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon 
                          icon={
                            lastScanMessage.includes('berhasil') || lastScanMessage.includes('Scan berhasil') 
                              ? (lastScanMessage.includes('Sudah diambil') ? faInfoCircle : faCheckCircle) 
                              : faExclamationTriangle
                          } 
                          className={
                            lastScanMessage.includes('berhasil') || lastScanMessage.includes('Scan berhasil') 
                              ? (lastScanMessage.includes('Sudah diambil') ? 'text-yellow-600' : 'text-green-600')
                              : 'text-red-600'
                          }
                        />
                        <span className="text-sm font-medium">{lastScanMessage}</span>
                      </div>
                    </div>
                  )}

                  {lastScanMessage && selected === 'manual' && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      lastScanMessage.includes('berhasil') || lastScanMessage.includes('Scan berhasil')
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : lastScanMessage.includes('Sudah diambil')
                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon 
                          icon={
                            lastScanMessage.includes('berhasil') || lastScanMessage.includes('Scan berhasil') 
                              ? (lastScanMessage.includes('Sudah diambil') ? faInfoCircle : faCheckCircle) 
                              : faExclamationTriangle
                          } 
                          className={
                            lastScanMessage.includes('berhasil') || lastScanMessage.includes('Scan berhasil') 
                              ? (lastScanMessage.includes('Sudah diambil') ? 'text-yellow-600' : 'text-green-600')
                              : 'text-red-600'
                          }
                        />
                        <span className="text-sm font-medium">{lastScanMessage}</span>
                      </div>
                    </div>
                  )}

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
                        Scan kode merchandise menggunakan kamera atau masukkan nomor invoice secara manual
                      </p>
                    </div>
                  ) : (
                    scanHistory.map((item, index) => {
                      const { date, time } = formatDateTime(item.scan_date);
                      const pickedCount = getPickedCount(item);
                      const quantity = parseInt(item.quantity) || 0;
                      const allPicked = pickedCount === quantity;
                      
                      if (index === 0 && item.type === 'validation' && item.status === 'success') {
                        return (
                          <div 
                            key={item.id} 
                            className="p-4 border border-green-200 rounded-lg bg-green-50 mb-3"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status, item.type)}
                                <div>
                                  <p className="font-medium text-sm text-gray-900">
                                    {item.buyer_name !== 'N/A' ? item.buyer_name : 'Sistem'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.invoice_no !== 'N/A' ? item.invoice_no : 'Tanpa Invoice'}
                                  </p>
                                </div>
                              </div>
                              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Validasi Berhasil
                              </div>
                            </div>
                            
                            <div className="mb-3 ml-8">
                              <p className="text-sm font-medium text-gray-900">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {item.variant_name} • {quantity} pcs • Rp {parseInt(item.total_price || '0').toLocaleString('id-ID')}
                              </p>
                              
                              {item.message && (
                                <div className="mt-1">
                                  <p className="text-xs text-green-700 font-medium">
                                    {item.message}
                                    {item.pickup_status && ` • ${item.pickup_status}`}
                                  </p>
                                </div>
                              )}
                              
                              {item.type === 'validation' && item.status === 'success' && quantity > 0 && !item.completed && (
                                <div className="mt-3 pt-3 border-t border-primary-light-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-700">Centang item yang sudah diambil:</p>
                                    <button
                                      onClick={() => handleResetPick(item.id)}
                                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                                    >
                                      Reset
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                    {Array.from({ length: quantity }).map((_, index) => {
                                      const itemDetail = item.itemDetails && item.itemDetails[index] 
                                        ? item.itemDetails[index] 
                                        : { id: index + 1, name: item.product_name, variant: item.variant_name };
                                      
                                      return (
                                        <div 
                                          key={index} 
                                          className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                                            item.pickedItems[index] 
                                              ? 'bg-green-50 border-green-200' 
                                              : 'bg-white border-gray-200 hover:bg-gray-50'
                                          }`}
                                          onClick={() => handlePickItem(item.id, index)}
                                        >
                                          <div className="flex items-center">
                                            <input
                                              type="checkbox"
                                              checked={item.pickedItems[index] || false}
                                              onChange={() => handlePickItem(item.id, index)}
                                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-primary-light-200 rounded"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <p className={`text-xs font-medium ${item.pickedItems[index] ? 'text-green-600' : 'text-gray-900'}`}>
                                              {itemDetail.name}
                                            </p>
                                            <p className={`text-xs ${item.pickedItems[index] ? 'text-green-500' : 'text-gray-600'}`}>
                                              Variant: {itemDetail.variant} • Item #{index + 1}
                                              {item.pickedItems[index] && (
                                                <span className="ml-1 text-green-500">✓</span>
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span className="text-gray-600">
                                        {pickedCount} dari {quantity} item
                                      </span>
                                      <span className={`font-medium ${allPicked ? 'text-green-600' : 'text-gray-700'}`}>
                                        {quantity > 0 ? Math.round((pickedCount / quantity) * 100) : 0}%
                                        {allPicked && ' ✓'}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          allPicked ? 'bg-green-600' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${quantity > 0 ? (pickedCount / quantity) * 100 : 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  {allPicked && (
                                    <div className="mt-2">
                                      <button
                                        onClick={() => handleMarkAsCompleted(item.id)}
                                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                                      >
                                        <FontAwesomeIcon icon={faCheckDouble} />
                                        Selesai - {pickedCount} item sudah diambil
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs ml-8">
                              <div className="flex items-center gap-1 text-gray-500">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                <span>{time}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`p-4 border rounded-lg transition-colors mb-3 ${getStatusColor(item.status, item.type)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status, item.type)}
                              <div>
                                <p className={`font-medium text-sm ${item.status === 'failed' ? 'text-red-800' : 'text-gray-900'}`}>
                                  {item.buyer_name !== 'N/A' ? item.buyer_name : 'Sistem'}
                                </p>
                                <p className={`text-xs ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
                                  {item.invoice_no !== 'N/A' ? item.invoice_no : 'Tanpa Invoice'}
                                </p>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.type === 'redeem'
                                ? 'bg-blue-100 text-blue-800'
                                : item.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusText(item.status, item.type)}
                            </div>
                          </div>
                          
                          <div className="mb-3 ml-8">
                            <p className={`text-sm font-medium ${item.status === 'failed' ? 'text-red-700' : 'text-gray-900'}`}>
                              {item.product_name}
                            </p>
                            <p className={`text-xs ${item.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
                              {item.variant_name} • {quantity} pcs • Rp {parseInt(item.total_price || '0').toLocaleString('id-ID')}
                            </p>
                            
                            {item.message && (
                              <div className="mt-1">
                                <p className={`text-xs font-medium ${
                                  item.status === 'success' ? 'text-green-700' : 
                                  item.status === 'failed' ? 'text-red-700' : 'text-blue-700'
                                }`}>
                                  {item.message}
                                  {item.pickup_status && ` • ${item.pickup_status}`}
                                </p>
                              </div>
                            )}
                            
                            {item.type === 'redeem' && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                                <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
                                <span>Merchandise telah diserahkan ({quantity} item)</span>
                              </div>
                            )}
                            {item.type === 'validation' && item.status === 'success' && item.completed && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
                                <span>Pengambilan selesai ({pickedCount}/{quantity} item)</span>
                              </div>
                            )}
                            {item.status === 'failed' && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                <span>Gagal divalidasi</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs ml-8">
                            <div className={`flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
                              <FontAwesomeIcon icon={faCalendarAlt} className={item.status === 'failed' ? 'text-red-500' : 'text-gray-400'} />
                              <span>{date}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
                              <FontAwesomeIcon icon={faClock} className={item.status === 'failed' ? 'text-red-500' : 'text-gray-400'} />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        {scanHistory.length > 0 && (
          <div className="fixed bottom-6 z-50" style={{ 
            left: 'calc(50% + 16px)',
            width: 'calc(50% - 32px)'
          }}>
            <div className="bg-white rounded-xl shadow-lg border border-primary-light-200 p-4 mx-4 lg:mx-0 lg:mr-4">
              {showModalFooter && showSuccessModal && selected === 'qr' ? (
                <div className="flex gap-2">
                  <Button
                    label="Tutup"
                    onClick={handleCloseSuccessModal}
                    fullWidth
                    color="primary"
                  />
                  <Button
                    label="Scan Ulang"
                    onClick={handleScanAgainFromModal}
                    fullWidth
                    color="primary"
                  />
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    label="Clear History"
                    onClick={() => setScanHistory([])}
                    fullWidth
                    color="primary"
                  />
                  <Button
                    label="Scan Ulang"
                    onClick={handleCheckAllItems}
                    fullWidth
                    color="primary"
                  />
                  <Button
                    label="Pickup Semua"
                    onClick={handleScanAgain}
                    fullWidth
                    color="primary"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}