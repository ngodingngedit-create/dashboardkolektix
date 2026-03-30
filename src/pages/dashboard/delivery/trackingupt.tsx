import React, { useEffect, useState } from "react";
import {
    Stack,
    Text,
    Select,
    TextInput,
    Textarea,
    Button,
    Group,
    Box,
    Alert,
    Divider,
    Badge,
    Loader,
    Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react/dist/iconify.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faTimeline,
    faTruck,
    faTruckFast,
    faCheckCircle,
    faSpinner,
    faBoxOpen,
    faExclamationCircle,
    faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import { Get } from "@/utils/REST";
import fetch from "@/utils/fetch";

interface ManifestItem {
    id: number;
    tracking_status_id: number;
    order_id: number;
    order_courier_id: number;
    tracking_number: string;
    status_name: string;
    description: string;
    location: string;
    image?: string | null;
    courier_time: string;
    pic_name: string;
    created_by: string;
    created_at: string;
    tracking_status?: {
        id: number;
        status_delivery: string;
        description: string;
        active_status: number;
    };
}

interface InvoiceData {
    id: number;
    invoice_no: string;
    courier?: {
        id: number;
        order_id: number;
        courier_company?: string;
        courier_type?: string;
        tracking_number?: string | null;
    };
    manifest?: ManifestItem[];
}

interface TrackingUpdateProps {
    invoiceNo: string;
    onClose: () => void;
    onSuccess?: () => void;
}

type TrackingFormValues = {
    tracking_status_id: string | null;
    status_name: string;
    description: string;
    location: string;
    courier_time: string;
    pic_name: string;
};

const getIconByStatusId = (statusId: number, isFirst: boolean) => {
    if (isFirst) return { icon: faLocationDot, bg: "#DBEAFE", color: "#2563EB" }; // blue dot for latest
    switch (statusId) {
        case 1: // Dalam Proses
            return { icon: faSpinner, bg: "#FEF9C3", color: "#CA8A04" };
        case 2: // Dalam Perjalanan
            return { icon: faTruckFast, bg: "#DBEAFE", color: "#2563EB" };
        case 3: // Telah Diterima
            return { icon: faCheckCircle, bg: "#DCFCE7", color: "#16A34A" };
        case 4: // Gagal Dikirim
            return { icon: faExclamationCircle, bg: "#FEE2E2", color: "#DC2626" };
        default:
            return { icon: faBoxOpen, bg: "#F3F4F6", color: "#6B7280" };
    }
};

const formatDateTracking = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        const date = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        return { date, time };
    } catch {
        return { date: "-", time: "-" };
    }
};

export default function TrackingUpdateForm({
    invoiceNo,
    onClose,
    onSuccess,
}: TrackingUpdateProps) {
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<TrackingFormValues>({
        initialValues: {
            tracking_status_id: null,
            status_name: "",
            description: "",
            location: "Warehouse Jakarta",
            courier_time: new Date().toISOString().slice(0, 19).replace("T", " "),
            pic_name: "system",
        },
        validate: {
            tracking_status_id: (v) => (v ? null : "Status tracking harus dipilih"),
            status_name: (v) => (v?.trim() ? null : "Nama status harus diisi"),
            description: (v) => (v?.trim() ? null : "Deskripsi harus diisi"),
        },
    });

    useEffect(() => {
        if (invoiceNo) fetchInvoice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoiceNo]);

    const fetchInvoice = async () => {
        setLoadingInvoice(true);
        try {
            const res: any = await Get(`order-product-invoice/${invoiceNo}`, {});
            if (res?.data) {
                setInvoiceData(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch invoice:", err);
        } finally {
            setLoadingInvoice(false);
        }
    };

    const handleSubmit = async () => {
        const validation = form.validate();
        if (validation.hasErrors) {
            notifications.show({
                title: "Validasi Gagal",
                message: "Mohon lengkapi semua field yang diperlukan",
                color: "red",
            });
            return;
        }

        if (!invoiceData) {
            notifications.show({ title: "Error", message: "Data invoice tidak ditemukan", color: "red" });
            return;
        }

        const courierId = invoiceData.courier?.id;
        if (!courierId) {
            notifications.show({ title: "Error", message: "Data kurir tidak ditemukan", color: "red" });
            return;
        }

        const payload = {
            order_id: invoiceData.id,
            order_courier_id: courierId,
            tracking_status_id: Number(form.values.tracking_status_id),
            status_name: form.values.status_name,
            description: form.values.description,
            location: form.values.location || "Warehouse Jakarta",
            courier_time: new Date().toISOString().slice(0, 19).replace("T", " "),
            pic_name: form.values.pic_name || "system",
        };

        setSubmitting(true);
        try {
            await fetch({
                url: "order-manifest/",
                method: "POST",
                data: payload,
                success: () => {
                    notifications.show({
                        title: "Berhasil",
                        message: "Data tracking berhasil disimpan",
                        color: "green",
                    });
                    form.reset();
                    fetchInvoice(); // refresh tracking list
                    if (onSuccess) onSuccess();
                },
                error: (err: any) => {
                    notifications.show({
                        title: "Gagal",
                        message: err?.message || "Gagal menyimpan data tracking",
                        color: "red",
                    });
                },
                complete: () => setSubmitting(false),
            });
        } catch {
            setSubmitting(false);
        }
    };

    // Sort by tracking_status_id desc (highest status on top, status 1 at bottom)
    const manifests = [...(invoiceData?.manifest ?? [])].sort(
        (a, b) => (b.tracking_status_id ?? 0) - (a.tracking_status_id ?? 0)
    );

    const isDelivered = manifests.some(m => m.tracking_status_id >= 3);

    return (
        <div className="flex flex-col relative w-full bg-white">
            <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* ===== LEFT: Riwayat Pelacakan ===== */}
                <div className="w-full md:w-[45%] flex flex-col bg-gray-50">
                    <div className="px-6 py-4 bg-white sticky top-0 z-20 border-b border-primary-light shadow-sm">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faTimeline} className="h-4 w-4 text-blue-600" />
                            <Text fw={600} size="sm">
                                Riwayat Pelacakan
                            </Text>
                        </div>
                        <Text size="xs" c="dimmed" mt={2}>
                            Invoice: <span className="font-semibold text-gray-700">{invoiceNo}</span>
                        </Text>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {loadingInvoice ? (
                            <Center py="xl">
                                <Loader size="sm" />
                            </Center>
                        ) : manifests.length === 0 ? (
                            <Center py="xl">
                                <Stack align="center" gap="xs">
                                    <FontAwesomeIcon icon={faBoxOpen} className="h-10 w-10 text-gray-300" />
                                    <Text size="sm" c="dimmed" ta="center">
                                        Belum ada riwayat pelacakan
                                    </Text>
                                </Stack>
                            </Center>
                        ) : (
                            <div className="relative">
                                <div className="space-y-5">
                                    {manifests.map((m, idx) => {
                                        const { icon, bg, color } = getIconByStatusId(m.tracking_status_id, idx === 0);
                                        // Override to green if all delivered
                                        const finalBg = isDelivered && m.tracking_status_id >= 3 ? '#DCFCE7' : bg;
                                        const finalColor = isDelivered && m.tracking_status_id >= 3 ? '#16A34A' : color;
                                        const { date, time } = formatDateTracking(m.courier_time || m.created_at);
                                        return (
                                            <div key={m.id} className="flex gap-3 relative">
                                                {/* dot */}
                                                <div className="relative z-10 flex-shrink-0">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                                        style={{ backgroundColor: finalBg }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={icon}
                                                            style={{ color: finalColor }}
                                                            className="h-4 w-4"
                                                        />
                                                    </div>
                                                </div>
                                                {/* content */}
                                                <div className="flex-1 pb-4">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 leading-snug">
                                                                {m.status_name}
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-0.5">{m.description}</p>
                                                            {m.location && (
                                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                    <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3 text-gray-400" />
                                                                    {m.location}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right flex-shrink-0 text-xs text-gray-500">
                                                            <p className="font-medium">{date}</p>
                                                            <p>{time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* left footer removed */}
                </div>

                {/* ===== RIGHT: Update Tracking Form ===== */}
                <div className="w-full md:w-[55%] flex flex-col">
                    <div className="px-6 py-4 bg-white sticky top-0 z-20 border-b border-light-grey shadow-sm">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:truck-delivery" width={18} className="text-blue-600" />
                            <Text fw={600} size="sm">
                                Update Tracking
                            </Text>
                        </div>
                        <Text size="xs" c="dimmed" mt={2}>
                            Tambahkan status pelacakan baru untuk order ini
                        </Text>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <Stack gap="md">
                            {/* Order Summary */}
                            {invoiceData && (
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <Group justify="space-between">
                                        <Box>
                                            <Text size="xs" c="dimmed">Invoice</Text>
                                            <Text fw={600} size="sm">{invoiceData.invoice_no}</Text>
                                        </Box>
                                        <Box>
                                            <Text size="xs" c="dimmed">Order ID</Text>
                                            <Text fw={600} size="sm">#{invoiceData.id}</Text>
                                        </Box>
                                        <Box>
                                            <Text size="xs" c="dimmed">Total Status</Text>
                                            <Badge color="blue" variant="light" size="sm">
                                                {invoiceData.manifest?.length ?? 0} riwayat
                                            </Badge>
                                        </Box>
                                    </Group>
                                </div>
                            )}

                            <Select
                                withAsterisk
                                label="Status Tracking"
                                placeholder="Pilih status tracking"
                                data={[
                                    { value: "1", label: "1 - Dalam Proses" },
                                    { value: "2", label: "2 - Dalam Perjalanan" },
                                    { value: "3", label: "3 - Telah Diterima" },
                                    { value: "4", label: "4 - Gagal Dikirim" },
                                ]}
                                size="sm"
                                searchable
                                clearable
                                {...form.getInputProps("tracking_status_id")}
                            />

                            <TextInput
                                withAsterisk
                                label="Nama Status"
                                placeholder="Contoh: Telah diterima oleh pemesan"
                                size="sm"
                                {...form.getInputProps("status_name")}
                            />

                            <Textarea
                                withAsterisk
                                label="Deskripsi"
                                placeholder="Deskripsi detail status tracking"
                                autosize
                                minRows={3}
                                size="sm"
                                {...form.getInputProps("description")}
                            />

                            <Divider />

                            <TextInput
                                label="Lokasi"
                                placeholder="Contoh: Warehouse Jakarta"
                                size="sm"
                                leftSection={<FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5 text-gray-400" />}
                                {...form.getInputProps("location")}
                            />

                            <Alert color="blue" variant="light" py="xs" px="sm">
                                <Group gap="xs" align="flex-start">
                                    <Icon icon="mdi:information" width={16} />
                                    <Text size="xs">
                                        Waktu tracking akan dicatat secara otomatis berdasarkan waktu saat ini.
                                    </Text>
                                </Group>
                            </Alert>
                        </Stack>
                    </div>

                    {/* right footer removed */}
                </div>
            </div>

            {/* Unified Floating Footer - Fixed to Viewport Bottom (Edge-to-Edge) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 px-6 py-4 bg-white border-t border-light-grey shadow-[0_-10px_20px_rgba(0,0,0,0.08)] flex items-center justify-between">
                <div>
                    {invoiceData?.courier && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <FontAwesomeIcon icon={faTruck} className="h-4 w-4 text-blue-500" />
                            <span>
                                {invoiceData.courier.courier_company || "-"}{" "}
                                {invoiceData.courier.courier_type || ""}
                            </span>
                            {invoiceData.courier.tracking_number && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <span className="font-mono font-semibold text-gray-900">
                                        {invoiceData.courier.tracking_number}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <Group justify="flex-end" gap="sm">
                    <Button variant="light" color="gray" size="sm" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        size="sm"
                        color="blue"
                        loading={submitting}
                        leftSection={<Icon icon="mdi:check" width={16} />}
                        onClick={handleSubmit}
                    >
                        Simpan Tracking
                    </Button>
                </Group>
            </div>
        </div>
    );
}
