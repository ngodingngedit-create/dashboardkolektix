// import { Get } from '@/utils/REST';
// import { AspectRatio, Button, Card, Flex, LoadingOverlay, ScrollArea, Stack, Table, TableData, Text, Title } from '@mantine/core';
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useListState } from '@mantine/hooks';
// import _ from 'lodash';
// import moment from 'moment';
// import { Icon } from '@iconify/react/dist/iconify.js';
// import QrScanner from 'qr-scanner';
// import fetch from '@/utils/fetch';
// import { modals } from '@mantine/modals';

// const Merch = () => {
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const highlightCodeOutlineRef = useRef<HTMLDivElement>(null);
//     let qrScanner = useRef<QrScanner | null>(null);

//     const [loading, setLoading] = useState<string>();
//     const [camPermit, setCamPermit] = useState(true);
//     const [lastBarcode, setLastBarcode] = useState<string | null>(null);
//     const [isScanning, setIsScanning] = useState(true);

//     useEffect(() => {
//         setTimeout(() => {
//             handleButtonClick();
//         }, 300);

//         qrScanner.current?.stop();
//         qrScanner.current = null;
//         setIsScanning(true);
//         setLastBarcode(null);
//     }, []);


//     const handleFetchBarcode = async (code: string, form?: React.FormEvent) => {
//         if (form) form.preventDefault();

//         const data = new FormData(form?.target as HTMLFormElement);
//         const barcode = form ? (data.get('code') as string) : code;

//         if (loading === 'scan' || barcode === lastBarcode || !isScanning) return;

//         setLoading('scan');
//         setLastBarcode(barcode);
//         setIsScanning(false);

//         const closeModal = () => {
//             setIsScanning(true);
//             setLoading(undefined);
//             qrScanner.current?.start();
//             // onClose();
//         };

//         try {
//             qrScanner.current?.stop();
//             await fetch<{ qr_code	: string }, any>({
//                 method: 'POST',
//                 url: 'event/scan-eticket',
//                 data: { qr_code	: barcode },
//                 headers: { lgntkn: 'true' },
//                 success: (data: any) => {
//                     if (data.success) {
//                         modals.open({
//                             radius: 15,
//                             centered: true,
//                             withCloseButton: false,
//                             onClose: closeModal,
//                             children: (
//                                 <Stack p="10" gap={20} align="center" w="100%">
//                                     <Text ta="center" size="1.3rem"  fw={600}>
//                                         Checkin Berhasil
//                                     </Text>
//                                     <Icon icon="ix:success" className={`text-[128px] text-green-500`} />
//                                     <Card bg="gray.1" radius={10} px={25} w="100%">
//                                         <Flex gap={5} align="center" justify="center" wrap="wrap" w="100%">
//                                             <Text ta="center">
//                                                 {data?.data?.has_event_ticket?.name ?? data?.data?.eticket_number}
//                                             </Text>
//                                         </Flex>
//                                     </Card>
//                                     <Button mt={-5} fullWidth onClick={() => modals.closeAll()} c="gray.8" bg="gray.1">
//                                         Ulangi Scan
//                                     </Button>
//                                 </Stack>
//                             )
//                         });
//                     } else {
//                         modals.open({
//                             radius: 15,
//                             centered: true,
//                             withCloseButton: false,
//                             onClose: closeModal,
//                             children: (
//                                 <Stack p="10" gap={20} align="center" w="100%">
//                                     <Text ta="center" size="1.3rem" fw={600}>
//                                         Checkin Gagal
//                                     </Text>
//                                     <Icon icon="ix:error" className={`text-[128px] text-red-500`} />
//                                     <Card bg="gray.1" radius={10} px={25} w="100%">
//                                         <Flex gap={5} align="center" justify="center" wrap="wrap" w="100%">
//                                             <Text ta="center" c="red">
//                                                 {data?.data?.message ?? data?.message}
//                                             </Text>
//                                         </Flex>
//                                     </Card>
//                                     <Button mt={-5} fullWidth onClick={() => modals.closeAll()} c="gray.8" bg="gray.1">
//                                         Ulangi Scan
//                                     </Button>
//                                 </Stack>
//                             )
//                         });
//                     }
//                 },
//                 error: (err) => {
//                     modals.open({
//                         radius: 15,
//                         centered: true,
//                         withCloseButton: false,
//                         onClose: closeModal,
//                         children: (
//                             <Stack p="10" gap={20} align="center" w="100%">
//                                 <Text ta="center" size="1.3rem" fw={600}>
//                                     Checkin Gagal
//                                 </Text>
//                                 <Icon icon="ix:error" className={`text-[128px] text-red-500`} />
//                                 <Card bg="gray.1" radius={10} px={25} w="100%">
//                                     <Flex gap={5} align="center" justify="center" wrap="wrap" w="100%">
//                                         <Text ta="center" c="red">
//                                             {err?.response?.data?.message ?? err?.message}
//                                         </Text>
//                                     </Flex>
//                                 </Card>
//                                 <Button mt={-5} fullWidth onClick={() => modals.closeAll()} c="gray.8" bg="gray.1">
//                                     Ulangi Scan
//                                 </Button>
//                             </Stack>
//                         )
//                     });
//                 },
//                 complete: () => setLoading(undefined)
//             });
//         } catch (error) {
//             // notifications.show({ title: 'Error', message: 'An error occurred while fetching barcode data.' });
//             console.error('Error fetching barcode data:', error);
//         } finally {
//             setLoading(undefined)
//             // await qrScanner.current?.start();
//         }
//     };

//     const handleButtonClick = async () => {
//         try {
//             videoRef.current!.hidden = false;
//             qrScanner.current = new QrScanner(
//                 videoRef.current!,
//                 (result) => {
//                     qrScanner.current?.stop();
//                     handleFetchBarcode(result.data);
//                 },
//                 {
//                     // calculateScanRegion: (video) => {
//                     //     return { x: -15, y: -15, width: video.width - 15, height: video.height - 15};
//                     // },    
//                     maxScansPerSecond: 2,
//                     overlay: highlightCodeOutlineRef.current!,
//                     highlightCodeOutline: true,
//                     highlightScanRegion: true
//                 }
//             );

//             setCamPermit(true);
//             await qrScanner.current?.start();
//         } catch (error) {
//             if (error === 'Camera not found.') setCamPermit(false);
//         }
//     };

//     return (
//         <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
//             {/* <Title order={1} size="h2">
//                 Check In
//             </Title> */}

//             <Stack align="center" gap={20}>
//                 <Stack gap={5} align="center" ta="center">
//                     <Text size="1.7rem" fw={600}>
//                         Scan QR Code
//                     </Text>
//                     <Text size="sm" c="gray">
//                         Silahkan arahkan QR code tiket ke kamera/webcam{' '}
//                     </Text>
//                 </Stack>

//                 <Card w="100%" p={0} maw={400}>
//                     <LoadingOverlay visible={loading == 'scan'} />
//                     <div className={`_scan-line !bg-gray-50/10 rounded-[15px] w-full h-full overflow-hidden border border-primary-base/60`}>
//                         <AspectRatio w="100%" className={`!aspect-[9/12] md:!aspect-square`}>
//                             <video hidden className={`!aspect-[9/12] md:!aspect-square`} ref={videoRef}></video>
//                         </AspectRatio>
//                     </div>

//                     {/* <Stack pos="absolute" c="red" align="center" className={`${camPermit ? 'hidden' : ''} z-10 left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4`} justify="center">
//                         <Icon icon="ph:camera-slash" className={`text-[96px] md:text-[128px]`} />
//                         <Text ta="center" size="sm">Aktifkan akses kamera untuk memindai QR Point dengan mudah</Text>
//                     </Stack> */}
//                 </Card>
//             </Stack>

//             {/* <Card p={0} withBorder maw="100%">
//                 <LoadingOverlay visible={loading.includes('getdata')} />
//                 <ScrollArea>
//                     <Table data={tableData} />
//                 </ScrollArea>
//             </Card> */}
//         </div>
//     );
// };

// export default Merch;

import { AspectRatio, Button, Card, Flex, LoadingOverlay, Stack, Text } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import QrScanner from 'qr-scanner';
import fetch from '@/utils/fetch';
import { modals } from '@mantine/modals';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faHistory, faClock, faCalendarAlt, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';

interface ScanItem {
    id: number;
    invoice_no: string;
    buyer_name: string;
    event_name: string;
    category_ticket: string;
    total_qty: string;
    scan_date: string;
    status: 'success' | 'failed';
    message?: string;
}

const Merch = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    let qrScanner = useRef<QrScanner | null>(null);

    const [loading, setLoading] = useState<string>();
    const [camError, setCamError] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [scanHistory, setScanHistory] = useState<ScanItem[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [currentScanData, setCurrentScanData] = useState<any>(null);

    useEffect(() => {
        startScanner();

        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        try {
            stopScanner();
            setCamError(false);

            if (!videoRef.current) return;

            qrScanner.current = new QrScanner(
                videoRef.current,
                (result) => {
                    handleFetchQRCode(result.data);
                },
                {
                    maxScansPerSecond: 2,
                    highlightScanRegion: false,
                    highlightCodeOutline: false,
                }
            );

            await qrScanner.current?.start();
            setIsScanning(true);
        } catch (error) {
            console.error('Camera error:', error);
            setCamError(true);
        }
    };

    const stopScanner = () => {
        if (qrScanner.current) {
            qrScanner.current.stop();
            qrScanner.current.destroy();
            qrScanner.current = null;
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

    const getStatusIcon = (status: string) => {
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
        return null;
    };

    const getStatusColor = (status: string) => {
        if (status === 'success') {
            return 'bg-green-50 border-green-200 text-green-800';
        }
        if (status === 'failed') {
            return 'bg-red-50 border-red-200 text-red-800';
        }
        return 'bg-gray-50 border-gray-200 text-gray-800';
    };

    const getStatusText = (status: string) => {
        if (status === 'success') {
            return 'Check-in Berhasil';
        }
        if (status === 'failed') {
            return 'Check-in Gagal';
        }
        return 'Diproses';
    };

    const handleFetchQRCode = async (code: string) => {
        if (loading === 'scan' || !isScanning) return;

        setLoading('scan');
        setIsScanning(false);
        stopScanner();

        const scanDateTime = new Date().toISOString();

        try {
            await fetch<{ qr_code: string }, any>({
                method: 'POST',
                url: 'event/scan-eticket',
                data: { qr_code: code },
                headers: { lgntkn: 'true' },
                success: (data: any) => {
                    const newScan: ScanItem = {
                        id: Date.now(),
                        invoice_no: data?.data?.eticket_number || code,
                        buyer_name: data?.data?.has_event_ticket?.name || 'Pengunjung',
                        event_name: data?.data?.event_name || 'Event',
                        category_ticket: data?.data?.ticket_category || 'Regular',
                        total_qty: data?.data?.quantity || '1',
                        scan_date: scanDateTime,
                        status: 'success',
                        message: data?.message || 'Check-in berhasil'
                    };

                    setScanHistory(prev => [newScan, ...prev]);
                    setCurrentScanData(newScan);
                    setShowSuccessModal(true);
                },
                error: (err) => {
                    const errorMessage = err?.response?.data?.message || err?.message || 'Terjadi kesalahan';
                    
                    const newScan: ScanItem = {
                        id: Date.now(),
                        invoice_no: code,
                        buyer_name: 'N/A',
                        event_name: 'Validasi Gagal',
                        category_ticket: 'Error',
                        total_qty: '0',
                        scan_date: scanDateTime,
                        status: 'failed',
                        message: errorMessage
                    };

                    setScanHistory(prev => [newScan, ...prev]);
                    setCurrentScanData(newScan);
                    setShowSuccessModal(true);
                },
                complete: () => setLoading(undefined)
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleScanAgain = () => {
        setShowSuccessModal(false);
        setCurrentScanData(null);
        setIsScanning(true);
        startScanner();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Check-in Tiket</h1>
                </div>
            </div>

            <div className="w-full">
                <div className="flex flex-col lg:flex-row">
                    {/* Bagian Scanner */}
                    <div className="lg:w-1/2">
                        <div className="bg-white rounded-xl shadow-sm border border-primary-light-200 p-6 m-4">
                            <div className="flex items-center gap-3 mb-6">
                                <FontAwesomeIcon icon={faTicket} className="text-primary text-xl" />
                                <h2 className="text-xl font-semibold text-gray-900">Scan Ticket</h2>
                            </div>

                            <div className="mb-4">
                                <div className="rounded-lg overflow-hidden border-2 border-dashed border-primary-light-200 bg-gray-50 p-2 h-[400px] relative flex items-center justify-center">
                                    {camError && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center p-4">
                                            <div className="bg-white p-6 rounded-xl text-center max-w-md w-full">
                                                <Icon icon="ph:camera-slash" className="text-4xl mb-3 text-red-500 mx-auto" />
                                                <p className="font-semibold mb-2">Kamera Tidak Tersedia</p>
                                                <p className="text-sm text-gray-600 mb-4">Aktifkan akses kamera untuk memindai QR code</p>
                                                <Button
                                                    onClick={() => window.location.reload()}
                                                    fullWidth
                                                    className="!bg-primary !text-white"
                                                >
                                                    Coba Lagi
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Video dengan ukuran persegi */}
                                    {!camError && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="relative w-[300px] h-[300px]">
                                                <video
                                                    className="w-full h-full object-cover rounded-lg"
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                />
                                                
                                                {/* Overlay Scanner - di atas video */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                                    <div className="relative w-64 h-64">
                                                        {/* Kotak pembatas transparan */}
                                                        <div className="absolute inset-0 border-2 border-primary/30 rounded-lg"></div>
                                                        
                                                        {/* Sudut-sudut */}
                                                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                                                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                                                        
                                                        {/* Garis scan yang bergerak */}
                                                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-scan">
                                                            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <style>{`
                                    @keyframes scan {
                                        0%, 100% {
                                            top: 0%;
                                        }
                                        50% {
                                            top: 100%;
                                        }
                                    }
                                    .animate-scan {
                                        animation: scan 2s ease-in-out infinite;
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
                        </div>
                    </div>

                    {/* Bagian Riwayat Scan */}
                    <div className="lg:w-1/2">
                        <div className="bg-white rounded-xl shadow-sm border border-primary-light-200 p-6 m-4 h-full min-h-[calc(100vh-200px)] relative">
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

                            {/* Modal Success - CUSTOM MODAL, BUKAN DARI MANTINE MODALS */}
                            {showSuccessModal && currentScanData && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4 rounded-xl">
                                    <div className="bg-white p-6 rounded-xl text-center max-w-md w-full animate-fadeIn">
                                        <FontAwesomeIcon
                                            icon={currentScanData.status === 'success' ? faCheckCircle : faXmark}
                                            className={`text-4xl mb-3 ${currentScanData.status === 'success' ? 'text-green-500' : 'text-red-500'
                                                }`}
                                        />
                                        <p className={`font-semibold mb-2 text-lg ${currentScanData.status === 'success' ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                            {currentScanData.status === 'success' ? 'Check-in Berhasil!' : 'Check-in Gagal!'}
                                        </p>

                                        <div className="text-left mb-4 bg-gray-50 p-3 rounded-lg">
                                            {currentScanData.status === 'success' ? (
                                                // Tampilan untuk success
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium">{currentScanData.invoice_no}</p>
                                                    <div className="grid grid-cols-2 gap-1 text-sm">
                                                        <span className="text-gray-600">Pengunjung:</span>
                                                        <span className="font-medium">{currentScanData.buyer_name}</span>
                                                        
                                                        <span className="text-gray-600">Kategori:</span>
                                                        <span className="font-medium">{currentScanData.category_ticket}</span>
                                                        
                                                        <span className="text-gray-600">Jumlah:</span>
                                                        <span className="font-medium">{currentScanData.total_qty} Tiket</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Tampilan untuk failed
                                                <div className="text-center">
                                                    <p className="text-sm text-red-600">{currentScanData.message}</p>
                                                </div>
                                            )}
                                        </div>

                                        {currentScanData.status === 'success' && (
                                            <p className="text-sm text-gray-600 mb-4">
                                                Tiket berhasil divalidasi. Pengunjung dapat memasuki venue.
                                            </p>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => setShowSuccessModal(false)}
                                                fullWidth
                                                className="!bg-primary !text-white !py-2 !rounded-lg"
                                            >
                                                Tutup
                                            </Button>
                                            <Button
                                                onClick={handleScanAgain}
                                                fullWidth
                                                className="!bg-primary !text-white !py-2 !rounded-lg"
                                            >
                                                Scan Ulang
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
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
                                            Scan tiket menggunakan kamera untuk melakukan check-in
                                        </p>
                                    </div>
                                ) : (
                                    scanHistory.map((item) => {
                                        const { date, time } = formatDateTime(item.scan_date);

                                        return (
                                            <div
                                                key={item.id}
                                                className={`p-4 border rounded-lg transition-colors mb-3 ${getStatusColor(item.status)}`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(item.status)}
                                                        <div>
                                                            <p className={`font-medium text-sm ${item.status === 'failed' ? 'text-red-800' : 'text-gray-900'}`}>
                                                                {item.buyer_name}
                                                            </p>
                                                            <p className={`text-xs ${item.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
                                                                {item.invoice_no}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'success'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {getStatusText(item.status)}
                                                    </div>
                                                </div>

                                                <div className="mb-3 ml-8">
                                                    <p className={`text-sm font-medium ${item.status === 'failed' ? 'text-red-700' : 'text-gray-900'}`}>
                                                        {item.event_name}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className={`text-xs flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
                                                            <FontAwesomeIcon icon={faTicket} className="text-xs" />
                                                            {item.category_ticket}
                                                        </p>
                                                        <p className={`text-xs flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
                                                            <Icon icon="ph:ticket" className="text-xs" />
                                                            {item.total_qty} tiket
                                                        </p>
                                                    </div>

                                                    {item.message && (
                                                        <div className="mt-2">
                                                            <p className={`text-xs font-medium ${item.status === 'success' ? 'text-green-700' : 'text-red-700'
                                                                }`}>
                                                                {item.message}
                                                            </p>
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
                        </div>
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
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setScanHistory([])}
                                fullWidth
                                className="!bg-primary !text-white !py-2 !rounded-lg"
                            >
                                Clear History
                            </Button>
                            <Button
                                onClick={handleScanAgain}
                                fullWidth
                                className="!bg-primary !text-white !py-2 !rounded-lg"
                            >
                                Scan Ulang
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Merch;