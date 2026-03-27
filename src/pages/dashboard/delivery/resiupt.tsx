import React, { useEffect, useState } from "react";
import {
    Stack,
    Text,
    TextInput,
    Button,
    Group,
    Box,
    Divider,
    Loader,
    Center,
    Grid,
    ThemeIcon,
    Badge,
    Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Get } from "@/utils/REST";
import fetch from "@/utils/fetch";

interface InvoiceData {
    id: number;
    invoice_no: string;
    customer_name?: string;
    order_date?: string;
    address?: {
        nama_penerima?: string;
    };
    created_at?: string;
    courier?: {
        id: number;
        order_id: number;
        main?: string;
        type?: string;
        tracking_number?: string | null;
        etd?: string;
    };
    payment_status?: string;
}

interface ResiUpdateProps {
    invoiceNo: string;
    onClose: () => void;
    onSuccess?: () => void;
}

type ResiFormValues = {
    courier_company: string;
    courier_service: string;
    resi_no: string;
    etd: string;
    etd_time: string;
    delivery_id: string;
};

export default function ResiUpdateModal({
    invoiceNo,
    onClose,
    onSuccess,
}: ResiUpdateProps) {
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<ResiFormValues>({
        initialValues: {
            courier_company: "",
            courier_service: "",
            resi_no: "",
            etd: "",
            etd_time: "",
            delivery_id: "",
        },
        validate: {
            courier_company: (v) => (v?.trim() ? null : "Kurir perusahaan harus diisi"),
            resi_no: (v) => (v?.trim() ? null : "Nomor resi harus diisi"),
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
                const data = res.data;
                setInvoiceData(data);

                // Set initial values from existing courier data if any
                form.setValues({
                    courier_company: data.courier?.main || "",
                    courier_service: data.courier?.type || "",
                    resi_no: data.courier?.tracking_number || "",
                    etd: data.courier?.etd || "",
                    etd_time: "", // We don't have separate time from API usually, can leave empty or parse from etd
                    delivery_id: "",
                });
            }
        } catch (err) {
            console.error("Failed to fetch invoice:", err);
            notifications.show({
                title: "Error",
                message: "Gagal mengambil data invoice",
                color: "red",
            });
        } finally {
            setLoadingInvoice(false);
        }
    };

    const handleSubmit = async (values: ResiFormValues) => {
        if (!invoiceData) return;

        setSubmitting(true);
        try {
            const submitData = {
                resi_no: values.resi_no,
                courier_company: values.courier_company,
                courier_service: values.courier_service,
                etd: values.etd,
                etd_time: values.etd_time,
                delivery_id: values.delivery_id,
            };

            await fetch({
                url: `order-product-invoice/${invoiceNo}`,
                method: "POST",
                data: submitData,
                before: () => {},
                success: () => {
                    notifications.show({
                        title: "Sukses",
                        message: "Data resi pengiriman berhasil diperbarui",
                        color: "green",
                    });
                    if (onSuccess) onSuccess();
                    onClose();
                },
                error: (error: any) => {
                    notifications.show({
                        title: "Error",
                        message: error?.message || "Gagal memperbarui data resi",
                        color: "red",
                    });
                },
                complete: () => setSubmitting(false),
            });
        } catch (error) {
            console.error("Failed to update resi:", error);
            setSubmitting(false);
        }
    };

    const getPaymentStatusColor = (status: string) => {
        const colors: Record<string, string> = { 
            'Verified': 'green', 
            'Paid': 'teal', 
            'Pending': 'yellow', 
            'Unpaid': 'red', 
            'Expired': 'gray', 
            'Failed': 'red' 
        };
        return colors[status] || 'gray';
    };

    return (
        <Grid>
            {/* SISI KIRI: Info Resi / Invoice Saat Ini */}
            <Grid.Col span={5}>
                <Box p={20} className="h-full">
                    <Stack gap="xl">
                        <Group justify="space-between" align="flex-start">
                            <Box>
                                <Text fw={600} size="lg">Info Pesanan</Text>
                                <Text size="xs" c="dimmed">
                                    Invoice {invoiceNo}
                                </Text>
                            </Box>
                            {invoiceData?.payment_status && (
                                <Badge color={getPaymentStatusColor(invoiceData.payment_status)} variant="light">
                                    {invoiceData.payment_status}
                                </Badge>
                            )}
                        </Group>

                        {loadingInvoice ? (
                            <Center h={200}>
                                <Loader size="sm" />
                            </Center>
                        ) : invoiceData ? (
                            <Stack gap="sm">
                                <Box bg="gray.0" p="md" style={{ borderRadius: 8 }}>
                                    <Text size="xs" c="dimmed" mb={4}>Penerima</Text>
                                    <Text size="sm" fw={500}>
                                        {invoiceData.address?.nama_penerima || invoiceData.customer_name || "-"}
                                    </Text>
                                </Box>

                                <Divider my="sm" />

                                <Text fw={600} size="sm">Detail Pengiriman Saat Ini</Text>

                                <Grid>
                                    <Grid.Col span={12}>
                                        <Group gap="xs" wrap="nowrap" align="flex-start">
                                            <ThemeIcon variant="light" color="blue" size="md" radius="xl" className="mt-1">
                                                <Icon icon="solar:box-minimalistic-bold" />
                                            </ThemeIcon>
                                            <Box>
                                                <Text size="xs" c="dimmed">Kurir</Text>
                                                <Text size="sm" fw={500}>{invoiceData.courier?.main || "-"}</Text>
                                            </Box>
                                        </Group>
                                    </Grid.Col>

                                    <Grid.Col span={12}>
                                        <Group gap="xs" wrap="nowrap" align="flex-start">
                                            <ThemeIcon variant="light" color="teal" size="md" radius="xl" className="mt-1">
                                                <Icon icon="solar:tag-horizontal-bold" />
                                            </ThemeIcon>
                                            <Box>
                                                <Text size="xs" c="dimmed">Layanan</Text>
                                                <Text size="sm" fw={500}>{invoiceData.courier?.type || "-"}</Text>
                                            </Box>
                                        </Group>
                                    </Grid.Col>

                                    <Grid.Col span={12}>
                                        <Group gap="xs" wrap="nowrap" align="flex-start">
                                            <ThemeIcon variant="light" color="orange" size="md" radius="xl" className="mt-1">
                                                <Icon icon="solar:barcode-bold" />
                                            </ThemeIcon>
                                            <Box>
                                                <Text size="xs" c="dimmed">No. Resi</Text>
                                                <Text size="sm" fw={600}>{invoiceData.courier?.tracking_number || "-"}</Text>
                                            </Box>
                                        </Group>
                                    </Grid.Col>

                                    <Grid.Col span={12}>
                                        <Group gap="xs" wrap="nowrap" align="flex-start">
                                            <ThemeIcon variant="light" color="grape" size="md" radius="xl" className="mt-1">
                                                <Icon icon="solar:calendar-date-bold" />
                                            </ThemeIcon>
                                            <Box>
                                                <Text size="xs" c="dimmed">ETD (Estimasi)</Text>
                                                <Text size="sm" fw={500}>{invoiceData.courier?.etd || "-"}</Text>
                                            </Box>
                                        </Group>
                                    </Grid.Col>
                                </Grid>
                            </Stack>
                        ) : (
                            <Alert color="red" variant="light">
                                Data invoice tidak ditemukan
                            </Alert>
                        )}
                    </Stack>
                </Box>
            </Grid.Col>

            {/* SISI KANAN: Form Input Resi */}
            <Grid.Col span={7}>
                <Box p={20}>
                    <Text fw={600} size="lg" mb={4}>Update Resi Baru</Text>
                    <Text size="sm" c="dimmed" mb="xl">
                        Lengkapi atau ubah data pengiriman di bawah ini
                    </Text>

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <Grid gutter="md">
                                <Grid.Col span={6}>
                                    <TextInput
                                        withAsterisk
                                        label="Courier Company"
                                        placeholder="Contoh: JNE, J&T, SiCepat"
                                        size="md"
                                        {...form.getInputProps("courier_company")}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Courier Service"
                                        placeholder="Contoh: REG, YES, OKE"
                                        size="md"
                                        {...form.getInputProps("courier_service")}
                                    />
                                </Grid.Col>
                            </Grid>

                            <TextInput
                                withAsterisk
                                label="Nomor Resi (Airway Bill)"
                                placeholder="Masukkan nomor resi pengiriman"
                                size="md"
                                leftSection={<Icon icon="mdi:barcode" width={18} />}
                                {...form.getInputProps("resi_no")}
                            />

                            <Grid gutter="md">
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="ETD (Estimasi)"
                                        placeholder="Contoh: 1-2 hari"
                                        size="md"
                                        {...form.getInputProps("etd")}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="ETD Time"
                                        type="time"
                                        size="md"
                                        {...form.getInputProps("etd_time")}
                                    />
                                </Grid.Col>
                            </Grid>

                            <TextInput
                                label="Delivery ID"
                                placeholder="Contoh: DEL-123456"
                                size="md"
                                {...form.getInputProps("delivery_id")}
                            />

                            <Group justify="flex-end" mt="xl">
                                <Button variant="light" color="gray" onClick={onClose} disabled={submitting} leftSection={<Icon icon="mdi:close" />}>
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    color="blue"
                                    loading={submitting}
                                    leftSection={<Icon icon="mdi:check" />}
                                >
                                    Simpan Resi
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Box>
            </Grid.Col>
        </Grid>
    );
}
