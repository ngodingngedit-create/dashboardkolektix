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

import { AspectRatio, Button, Card, Flex, LoadingOverlay, Stack, Text, Tabs } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import QrScanner from 'qr-scanner';
import fetch from '@/utils/fetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTicket,
    faHistory,
    faClock,
    faCalendarAlt,
    faCheck,
    faCamera,
    faKeyboard,
    faXmark,
    faEnvelope,
    faUser,
    faCircleExclamation,
    faExclamation
} from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';

interface ScanItem {
    id: number;
    invoice_no: string;
    buyer_name: string;
    event_name: string;
    category_ticket: string;
    total_qty: string;
    scan_date: string;
    status: 'success' | 'warning' | 'failed';
    message?: string;
    type: 'ticket' | 'invitation';
}

const Merch = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    let qrScanner = useRef<QrScanner | null>(null);

    const [loading, setLoading] = useState<string>();
    const [camError, setCamError] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [selected, setSelected] = useState<'qr' | 'manual'>('qr');
    const [activeTab, setActiveTab] = useState<'ticket' | 'invitation'>('ticket');
    const [manualInput, setManualInput] = useState('');
    const [scanHistory, setScanHistory] = useState<ScanItem[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [currentScanData, setCurrentScanData] = useState<any>(null);
    const [isAutoInputActive, setIsAutoInputActive] = useState(false);

    useEffect(() => {
        if (selected === 'qr') {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [selected]);

    // Handle auto-input dari scanner dengan delay 3 detik
    useEffect(() => {
        if (isAutoInputActive) {
            const timer = setTimeout(() => {
                setManualInput('');
                setIsAutoInputActive(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isAutoInputActive]);

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
        if (status === 'warning') {
            return (
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCircleExclamation} className="text-yellow-600 text-xs" />
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
        if (status === 'warning') {
            return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        }
        if (status === 'failed') {
            return 'bg-red-50 border-red-200 text-red-800';
        }
        return 'bg-gray-50 border-gray-200 text-gray-800';
    };

    const getStatusText = (status: string) => {
        if (status === 'success') {
            return activeTab === 'ticket' ? 'Check-in Berhasil' : 'Validasi Berhasil';
        }
        if (status === 'warning') {
            return 'Sudah Check In';
        }
        if (status === 'failed') {
            return 'Ticket Tidak Valid';
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
            // Different API endpoints for ticket and invitation
            const url = activeTab === 'ticket'
                ? 'event/scan-eticket'
                : 'invitations/checkin';

            await fetch<any, any>({
                method: 'POST',
                url: url,
                data: activeTab === 'ticket' ? { qr_code: code } : { invitation_number: code },
                headers: { lgntkn: 'true' },
                success: (data: any) => {
                    const message = data?.message || (activeTab === 'ticket' ? 'Check-in berhasil' : 'Validasi berhasil');
                    const isAlreadyCheckedIn = message.toLowerCase().includes('sudah') || message.toLowerCase().includes('check-in') || message.toLowerCase().includes('already');
                    const isInvalidTicket = message.toLowerCase().includes('tidak terdaftar') || message.toLowerCase().includes('not found') || message.toLowerCase().includes('tidak valid') || message.toLowerCase().includes('invalid');

                    const newScan: ScanItem = {
                        id: Date.now(),
                        invoice_no: data?.data?.eticket_number || data?.data?.invitation_code || code,
                        buyer_name: data?.data?.has_event_ticket?.name || data?.data?.guest_name || 'Pengunjung',
                        event_name: data?.data?.event_name || 'Event',
                        category_ticket: data?.data?.ticket_category || data?.data?.invitation_type || 'Regular',
                        total_qty: data?.data?.quantity || '1',
                        scan_date: scanDateTime,
                        status: isInvalidTicket ? 'failed' : (isAlreadyCheckedIn ? 'warning' : 'success'),
                        message: isAlreadyCheckedIn ? (activeTab === 'ticket' ? 'Sudah Checkin' : 'Sudah Validasi') : message,
                        type: activeTab
                    };

                    setScanHistory(prev => [newScan, ...prev]);
                    setCurrentScanData(newScan);
                    setShowSuccessModal(true);
                },
                error: (err) => {
                    const errorMessage = err?.response?.data?.message || err?.message || 'Terjadi kesalahan';
                    const isAlreadyCheckedIn = errorMessage.toLowerCase().includes('sudah') || errorMessage.toLowerCase().includes('check-in') || errorMessage.toLowerCase().includes('already');
                    const isInvalidTicket = errorMessage.toLowerCase().includes('tidak terdaftar') || errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('tidak valid') || errorMessage.toLowerCase().includes('invalid');

                    const newScan: ScanItem = {
                        id: Date.now(),
                        invoice_no: code,
                        buyer_name: isAlreadyCheckedIn ? (err?.response?.data?.data?.buyer_name || 'N/A') : 'N/A',
                        event_name: isAlreadyCheckedIn ? (activeTab === 'ticket' ? 'Sudah Checkin' : 'Sudah Validasi') : (isInvalidTicket ? 'Ticket tidak terdaftar' : 'Validasi Gagal'),
                        category_ticket: isAlreadyCheckedIn ? 'Warning' : 'Error',
                        total_qty: '0',
                        scan_date: scanDateTime,
                        status: isAlreadyCheckedIn ? 'warning' : 'failed',
                        message: isAlreadyCheckedIn ? (activeTab === 'ticket' ? 'Sudah Checkin' : 'Sudah Validasi') : (isInvalidTicket ? 'Ticket tidak terdaftar' : errorMessage),
                        type: activeTab
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

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        handleFetchQRCode(manualInput);
        setManualInput('');
    };

    const handleScanAgain = () => {
        setShowSuccessModal(false);
        setCurrentScanData(null);
        setIsScanning(true);
        if (selected === 'qr') {
            startScanner();
        }
    };

    // Filter scan history based on active tab
    const filteredHistory = scanHistory.filter(item => item.type === activeTab);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header and Tabs */}
            <div className="bg-white py-3 px-4 sm:px-6 lg:px-8 flex justify-end items-center shadow-sm">
                <div className="flex w-full md:w-auto rounded-md overflow-hidden border border-primary-light-200 bg-gray-50">
                    <button
                        className={`flex-1 md:w-32 py-1.5 md:py-2 text-center text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'ticket'
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-100'}`}
                        onClick={() => {
                            setActiveTab('ticket');
                            setShowSuccessModal(false);
                            setCurrentScanData(null);
                        }}
                    >
                        <FontAwesomeIcon icon={faTicket} className="text-xs" />
                        Ticket
                    </button>
                    <button
                        className={`flex-1 md:w-32 py-1.5 md:py-2 text-center text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'invitation'
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-100'}`}
                        onClick={() => {
                            setActiveTab('invitation');
                            setShowSuccessModal(false);
                            setCurrentScanData(null);
                        }}
                    >
                        <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                        Invitation
                    </button>
                </div>
            </div>

            <div className="w-full">
                <div className="flex flex-col lg:flex-row">
                    {/* Bagian Scanner */}
                    <div className="lg:w-1/2">
                        <div className="bg-white rounded-xl shadow-sm border border-primary-light-200 p-0 sm:p-6 m-0 sm:m-4 overflow-hidden relative">
                            <div className="flex items-center gap-2 mb-4 p-6 sm:p-0">
                                <FontAwesomeIcon
                                    icon={activeTab === 'ticket' ? faTicket : faEnvelope}
                                    className="text-primary text-base"
                                />
                                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                    Scan {activeTab === 'ticket' ? 'Ticket' : 'Invitation'}
                                </h2>
                            </div>

                            {/* Tombol Switch - Scan Camera dan Scanner (Standard Tabs) */}
                            <div className="flex w-full mb-5 px-6 sm:px-0">
                                <button
                                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 ${selected === 'qr'
                                        ? 'text-primary bg-primary/5'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    onClick={() => {
                                        setSelected('qr');
                                        setShowSuccessModal(false);
                                        startScanner();
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCamera} className="text-xs" />
                                    Scan Camera
                                </button>
                                <button
                                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 ${selected === 'manual'
                                        ? 'text-primary bg-primary/5'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    onClick={() => {
                                        setSelected('manual');
                                        setShowSuccessModal(false);
                                        stopScanner();
                                    }}
                                >
                                    <FontAwesomeIcon icon={faKeyboard} className="text-xs" />
                                    Scanner
                                </button>
                            </div>

                            <div>
                                {selected === 'qr' && (
                                    <div className="mb-0 sm:mb-4">
                                        <div className="overflow-hidden bg-black w-full relative aspect-[3/4] md:h-[400px] flex items-center justify-center sm:rounded-lg sm:border sm:border-primary-light-200">
                                            {camError && (
                                                <div className="absolute inset-0 bg-black bg-opacity-80 z-20 flex items-center justify-center p-4">
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

                                            {/* Video mentok penuh */}
                                            {!camError && (
                                                <div className="w-full h-full relative">
                                                    <video
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        muted
                                                    />

                                                    {/* Overlay Scanner - di atas video */}
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                                        <div className="relative w-4/5 h-4/5 max-w-[280px] max-h-[280px]">
                                                            {/* Kotak pembatas transparan */}
                                                            <div className="absolute inset-0 border-2 border-white/40 rounded-lg"></div>

                                                            {/* Sudut-sudut */}
                                                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[3px] border-l-[3px] border-white"></div>
                                                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-[3px] border-r-[3px] border-white"></div>
                                                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-[3px] border-l-[3px] border-white"></div>
                                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[3px] border-r-[3px] border-white"></div>

                                                            {/* Garis scan yang bergerak */}
                                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-scan z-20">
                                                                <div className="absolute -top-1 left-1/2 w-2.5 h-2.5 bg-primary rounded-full transform -translate-x-1/2 shadow-[0_0_10px_rgba(var(--mantine-color-primary-6),1)]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selected === 'manual' && (
                                    <form onSubmit={handleManualSubmit} className="px-2 pb-4">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                                {activeTab === 'ticket' ? 'Kode Tiket / Invoice' : 'Kode Invitation'}
                                            </label>
                                            <input
                                                type="text"
                                                className="border-2 border-primary-light-200 rounded-lg w-full py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                                placeholder={activeTab === 'ticket' ? "Masukkan kode tiket" : "Masukkan kode undangan"}
                                                value={isAutoInputActive ? '' : manualInput}
                                                onChange={(e) => setManualInput(e.target.value)}
                                                autoFocus
                                            />
                                            <p className="text-xs text-gray-500 mt-1.5">
                                                {activeTab === 'ticket'
                                                    ? 'Masukkan nomor invoice atau kode tiket untuk diproses scanner'
                                                    : 'Masukkan kode undangan untuk divalidasi oleh scanner'}
                                            </p>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={!manualInput.trim() || loading === 'scan'}
                                            fullWidth
                                            className="!bg-primary !text-white !py-2 !rounded-lg !font-medium"
                                        >
                                            {loading === 'scan' ? 'Memproses...' : 'Scan / Validasi'}
                                        </Button>
                                    </form>
                                )}
                            </div>

                            {/* Modal Success - Integrated within scanner area */}
                            {showSuccessModal && currentScanData && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4 rounded-xl">
                                    <div className="bg-white p-6 rounded-xl text-center max-w-md w-full animate-fadeIn shadow-2xl">
                                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                                            currentScanData.status === 'success' ? 'bg-green-100' : 
                                            (currentScanData.status === 'warning' ? 'bg-yellow-100' : 'bg-red-500')
                                        }`}>
                                            <FontAwesomeIcon
                                                icon={currentScanData.status === 'success' ? faCheck : (currentScanData.status === 'warning' ? faExclamation : faXmark)}
                                                className={`text-2xl ${
                                                    currentScanData.status === 'success' ? 'text-green-500' : 
                                                    (currentScanData.status === 'warning' ? 'text-yellow-500' : 'text-white')
                                                }`}
                                            />
                                        </div>
                                        <p className={`font-semibold mb-2 text-lg ${
                                            currentScanData.status === 'success' ? 'text-green-700' : 
                                            (currentScanData.status === 'warning' ? 'text-yellow-700' : 'text-red-700')
                                        }`}>
                                            {currentScanData.status === 'success'
                                                ? (activeTab === 'ticket' ? 'Check-in Berhasil!' : 'Validasi Berhasil!')
                                                : (currentScanData.status === 'warning' ? (activeTab === 'ticket' ? 'Sudah Checkin' : 'Sudah Validasi') : 'Gagal!')}
                                        </p>

                                        <div className={`text-left mb-4 p-3 rounded-lg border ${currentScanData.status === 'success' ? 'bg-gray-50 border-light-grey' : (currentScanData.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200')}`}>
                                            {currentScanData.status === 'success' || currentScanData.status === 'warning' ? (
                                                <div className="space-y-2">
                                                    <p className={`text-sm font-medium ${currentScanData.status === 'warning' ? 'text-yellow-800' : 'text-primary'}`}>{currentScanData.invoice_no}</p>
                                                    <div className="grid grid-cols-2 gap-1 text-sm">
                                                        <span className={currentScanData.status === 'warning' ? 'text-yellow-700' : 'text-gray-600'}>{activeTab === 'ticket' ? 'Pengunjung:' : 'Nama:'}</span>
                                                        <span className={`font-medium ${currentScanData.status === 'warning' ? 'text-yellow-900' : 'text-gray-900'}`}>{currentScanData.buyer_name}</span>

                                                        <span className={currentScanData.status === 'warning' ? 'text-yellow-700' : 'text-gray-600'}>Event:</span>
                                                        <span className={`font-medium ${currentScanData.status === 'warning' ? 'text-yellow-900' : 'text-gray-900'}`}>{currentScanData.event_name}</span>

                                                        <span className={currentScanData.status === 'warning' ? 'text-yellow-700' : 'text-gray-600'}>{activeTab === 'ticket' ? 'Kategori:' : 'Tipe:'}</span>
                                                        <span className={`font-medium ${currentScanData.status === 'warning' ? 'text-yellow-900' : 'text-gray-900'}`}>{currentScanData.category_ticket}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-2">
                                                    <p className="text-sm text-red-600 font-medium">{currentScanData.message}</p>
                                                </div>
                                            )}
                                        </div>

                                        {currentScanData.status === 'success' && (
                                            <p className="text-sm text-gray-600 mb-4">
                                                {activeTab === 'ticket'
                                                    ? 'Tiket berhasil divalidasi. Pengunjung dapat memasuki venue.'
                                                    : 'Undangan berhasil divalidasi.'}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => setShowSuccessModal(false)}
                                                fullWidth
                                                className="!bg-gray-100 !text-gray-700 !py-2 !rounded-lg hover:!bg-gray-200 uppercase text-xs font-bold tracking-wider"
                                            >
                                                Tutup
                                            </Button>
                                            <Button
                                                onClick={handleScanAgain}
                                                fullWidth
                                                className="!bg-primary !text-white !py-2 !rounded-lg shadow-md uppercase text-xs font-bold tracking-wider"
                                            >
                                                Scan Ulang
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

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

                    {/* Bagian Riwayat Scan */}
                    <div className="lg:w-1/2">
                        <div className="bg-white rounded-xl shadow-sm border border-primary-light-200 p-6 m-4 h-full min-h-[calc(100vh-200px)] relative">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faHistory} className="text-primary text-base" />
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        Riwayat {activeTab === 'ticket' ? 'Ticket' : 'Invitation'}
                                    </h2>
                                </div>
                                {filteredHistory.length > 0 && (
                                    <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        Total: {filteredHistory.length}
                                    </span>
                                )}
                            </div>

                            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                                {filteredHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FontAwesomeIcon
                                            icon={faClock}
                                            className="text-gray-300 text-5xl mb-4"
                                        />
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                                            Belum ada riwayat {activeTab === 'ticket' ? 'ticket' : 'invitation'}
                                        </h3>
                                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                                            {activeTab === 'ticket'
                                                ? 'Scan tiket menggunakan kamera atau masukkan kode tiket secara manual'
                                                : 'Scan undangan menggunakan kamera atau masukkan kode undangan secara manual'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredHistory.map((item) => {
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
                                                            <FontAwesomeIcon icon={item.type === 'ticket' ? faTicket : faEnvelope} className="text-xs" />
                                                            {item.category_ticket}
                                                        </p>
                                                        <p className={`text-xs flex items-center gap-1 ${item.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
                                                            <Icon icon="ph:ticket" className="text-xs" />
                                                            {item.total_qty} {item.type === 'ticket' ? 'tiket' : 'undangan'}
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

        </div>
    );
};

export default Merch;