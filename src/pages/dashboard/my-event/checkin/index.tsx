import { Get } from '@/utils/REST';
import { AspectRatio, Card, Flex, LoadingOverlay, ScrollArea, Stack, Table, TableData, Text, Title } from '@mantine/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useListState } from '@mantine/hooks';
import _ from 'lodash';
import moment from 'moment';
import { Icon } from '@iconify/react/dist/iconify.js';
import QrScanner from 'qr-scanner';
import fetch from '@/utils/fetch';
import { modals } from '@mantine/modals';

const Merch = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const highlightCodeOutlineRef = useRef<HTMLDivElement>(null);
    let qrScanner = useRef<QrScanner | null>(null);

    const [loading, setLoading] = useState<string>();
    const [camPermit, setCamPermit] = useState(true);
    const [lastBarcode, setLastBarcode] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            handleButtonClick();
        }, 300);

        qrScanner.current?.stop();
        qrScanner.current = null;
        setIsScanning(true);
        setLastBarcode(null);
    }, []);


    const handleFetchBarcode = async (code: string, form?: React.FormEvent) => {
        if (form) form.preventDefault();

        const data = new FormData(form?.target as HTMLFormElement);
        const barcode = form ? (data.get('code') as string) : code;

        if (loading === 'scan' || barcode === lastBarcode || !isScanning) return;

        setLoading('scan');
        setLastBarcode(barcode);
        setIsScanning(false);

        const closeModal = () => {
            setIsScanning(true);
            setLoading(undefined);
            qrScanner.current?.start();
            // onClose();
        };

        try {
            qrScanner.current?.stop();
            await fetch<{ qr_code	: string }, any>({
                method: 'POST',
                url: 'event/scan-eticket',
                data: { qr_code	: barcode },
                headers: { lgntkn: 'true' },
                success: (data) => {
                    modals.open({
                        radius: 15,
                        centered: true,
                        withCloseButton: false,
                        onClose: closeModal,
                        children: (
                            <Stack p="10" gap={20} align="center" w="100%">
                                <Text ta="center" size="1.3rem"  fw={600}>
                                    Checkin Berhasil
                                </Text>
                                <Icon icon="ix:success" className={`text-[128px] text-green-500`} />
                                <Card bg="gray.1" radius={10} px={25} w="100%">
                                    <Flex gap={5} align="center" justify="center" wrap="wrap" w="100%">
                                        <Text ta="center">
                                            {barcode}
                                        </Text>
                                    </Flex>
                                </Card>
                            </Stack>
                        )
                    });
                },
                error: (err) => {
                    modals.open({
                        radius: 15,
                        centered: true,
                        withCloseButton: false,
                        onClose: closeModal,
                        children: (
                            <Stack p="10" gap={20} align="center" w="100%">
                                <Text ta="center" size="1.3rem" fw={600}>
                                    Checkin Gagal
                                </Text>
                                <Icon icon="ix:error" className={`text-[128px] text-red-500`} />
                                <Card bg="gray.1" radius={10} px={25} w="100%">
                                    <Flex gap={5} align="center" justify="center" wrap="wrap" w="100%">
                                        <Text ta="center" c="red">
                                            {err?.message}
                                        </Text>
                                    </Flex>
                                </Card>
                            </Stack>
                        )
                    });
                },
                complete: () => setLoading(undefined)
            });
        } catch (error) {
            // notifications.show({ title: 'Error', message: 'An error occurred while fetching barcode data.' });
            console.error('Error fetching barcode data:', error);
        } finally {
            setLoading(undefined)
            // await qrScanner.current?.start();
        }
    };

    const handleButtonClick = async () => {
        try {
            videoRef.current!.hidden = false;
            qrScanner.current = new QrScanner(
                videoRef.current!,
                (result) => {
                    qrScanner.current?.stop();
                    handleFetchBarcode(result.data);
                },
                {
                    // calculateScanRegion: (video) => {
                    //     return { x: -15, y: -15, width: video.width - 15, height: video.height - 15};
                    // },    
                    maxScansPerSecond: 2,
                    overlay: highlightCodeOutlineRef.current!,
                    highlightCodeOutline: true,
                    highlightScanRegion: true
                }
            );

            setCamPermit(true);
            await qrScanner.current?.start();
        } catch (error) {
            if (error === 'Camera not found.') setCamPermit(false);
        }
    };

    return (
        <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
            {/* <Title order={1} size="h2">
                Check In
            </Title> */}

            <Stack align="center" gap={20}>
                <Stack gap={5} align="center" ta="center">
                    <Text size="1.7rem" fw={600}>
                        Scan QR Code
                    </Text>
                    <Text size="sm" c="gray">
                        Silahkan arahkan QR code tiket ke kamera/webcam{' '}
                    </Text>
                </Stack>

                <AspectRatio ratio={1} pos="relative" mx="auto" w="100%" maw={400}>
                    <Card w="100%" p={0}>
                        <LoadingOverlay visible={loading == 'scan'} />
                        <div className={`_scan-line !bg-gray-50/10 rounded-[15px] w-full h-full overflow-hidden border border-primary-base/60`}>
                            <AspectRatio ratio={1} w="100%">
                                <video hidden ref={videoRef}></video>
                            </AspectRatio>
                        </div>

                        {/* <Stack pos="absolute" c="red" align="center" className={`${camPermit ? 'hidden' : ''} z-10 left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4`} justify="center">
                            <Icon icon="ph:camera-slash" className={`text-[96px] md:text-[128px]`} />
                            <Text ta="center" size="sm">Aktifkan akses kamera untuk memindai QR Point dengan mudah</Text>
                        </Stack> */}
                    </Card>
                </AspectRatio>
            </Stack>

            {/* <Card p={0} withBorder maw="100%">
                <LoadingOverlay visible={loading.includes('getdata')} />
                <ScrollArea>
                    <Table data={tableData} />
                </ScrollArea>
            </Card> */}
        </div>
    );
};

export default Merch;
