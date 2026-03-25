import { Icon } from '@iconify/react/dist/iconify.js';
import {
    Button,
    Divider,
    LoadingOverlay,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
    Box,
    Grid,
    Group,
    ThemeIcon,
    Card,
    Alert,
    Badge,
    Table,
    Pagination,
    Container,
    Center,
    Loader,
    Image,
    ActionIcon,
    Tooltip,
    Indicator,
    Avatar,
    SimpleGrid,
    Flex
} from '@mantine/core';
import { useEffect, useState, useRef, useCallback } from 'react';
import fetch from '@/utils/fetch';
import { useDidUpdate, useListState } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

// Types
type Creator = {
    id: number;
    name: string;
    slug_url: string;
    avatar?: string;
};

type Transaction = {
    id: number;
    invoice_no: string;
    customer: {
        name: string;
        email?: string;
        avatar?: string;
    };
    payment_status: string;
    grandtotal: number;
    total_qty: number;
    created_at: string;
    items: any[];
    transaction_status: {
        id: number;
        name: string;
        bgcolor: string;
    };
    latest_manifest?: {
        status_name: string;
        tracking_number: string;
        updated_at?: string;
    };
};

type OrderDetail = {
    order_id: number;
    order_courier_id: number;
    invoice_no: string;
    customer_name: string;
    order_date: string;
    items?: any[];
    grandtotal?: number;
    payment_status?: string;
};

type TrackingFormValues = {
    order_id?: number;
    order_courier_id?: number;
    tracking_status_id: number | null;
    status_name: string;
    description: string;
    location: string;
    courier_time: string;
    pic_name: string;
};

export default function OrderTracking() {
    const [loading, setLoading] = useListState<string>();
    const [creators, setCreators] = useState<Creator[]>([]);
    const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination states
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Observer for infinite scroll
    const observerRef = useRef<IntersectionObserver>();
    const lastTransactionRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore && step === 2) {
                loadMoreTransactions();
            }
        });

        if (node) observerRef.current.observe(node);
    }, [loadingMore, hasMore, step]);

    const form = useForm<TrackingFormValues>({
        initialValues: {
            tracking_status_id: null,
            status_name: '',
            description: '',
            location: 'Warehouse Jakarta',
            courier_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            pic_name: 'system'
        },
        validate: {
            tracking_status_id: (value) => (value !== null && value > 0) ? null : 'Status tracking harus dipilih',
            status_name: (value) => value?.trim() ? null : 'Nama status harus diisi',
            description: (value) => value?.trim() ? null : 'Deskripsi harus diisi',
        }
    });

    useEffect(() => {
        getCreators();
    }, []);

    useDidUpdate(() => {
        if (orderDetail) {
            form.setValues({
                ...form.values,
                order_id: orderDetail.order_id,
                order_courier_id: orderDetail.order_courier_id,
            });
            setStep(4);
        }
    }, [orderDetail]);

    const getCreators = async () => {
        await fetch({
            url: 'creator',
            method: 'GET',
            before: () => setLoading.append('getcreators'),
            success: (response: any) => {
                if (response?.data && response.data.length > 0) {
                    setCreators(response.data);
                } else {
                    notifications.show({
                        title: 'Info',
                        message: 'Tidak ada data creator',
                        color: 'blue'
                    });
                }
            },
            error: () => {
                notifications.show({
                    title: 'Error',
                    message: 'Gagal mengambil data creator',
                    color: 'red'
                });
            },
            complete: () => setLoading.filter(e => e !== 'getcreators'),
        });
    };

    const getTransactions = async (slug: string, page: number = 1) => {
        await fetch({
            url: `order-product/creator/${slug}/transactions?page=${page}&per_page=10`,
            method: 'GET',
            before: () => {
                if (page === 1) {
                    setLoading.append('gettransactions');
                } else {
                    setLoadingMore(true);
                }
            },
            success: (response: any) => {
                let transactionsData = [];
                let paginationData = null;

                if (response?.data?.transactions) {
                    transactionsData = response.data.transactions;
                    paginationData = response.data.pagination;
                } else if (response?.transactions) {
                    transactionsData = response.transactions;
                    paginationData = response.pagination;
                } else if (Array.isArray(response)) {
                    transactionsData = response;
                } else if (response?.data && Array.isArray(response.data)) {
                    transactionsData = response.data;
                }

                if (page === 1) {
                    setTransactions(transactionsData);
                } else {
                    setTransactions(prev => [...prev, ...transactionsData]);
                }

                if (paginationData) {
                    setPagination({
                        current_page: paginationData.current_page || page,
                        last_page: paginationData.last_page || 1,
                        total: paginationData.total || transactionsData.length,
                        per_page: paginationData.per_page || 10
                    });

                    // Check if there are more pages
                    const currentPage = paginationData.current_page || page;
                    const lastPage = paginationData.last_page || 1;
                    setHasMore(currentPage < lastPage);
                } else {
                    // If no pagination data, assume no more data
                    setHasMore(false);
                }

                if (page === 1) {
                    setStep(2);
                }
            },
            error: () => {
                notifications.show({
                    title: 'Error',
                    message: 'Gagal mengambil data transaksi',
                    color: 'red'
                });
                if (page === 1) {
                    setTransactions([]);
                }
            },
            complete: () => {
                if (page === 1) {
                    setLoading.filter(e => e !== 'gettransactions');
                } else {
                    setLoadingMore(false);
                }
            },
        });
    };

    const loadMoreTransactions = () => {
        if (selectedCreator && hasMore && !loadingMore) {
            const nextPage = pagination.current_page + 1;
            getTransactions(selectedCreator.slug_url, nextPage);
        }
    };

    const getOrderDetail = async (transaction: Transaction) => {
        let orderCourierId = Math.floor(Math.random() * 1000) + 1;

        const orderDetailData: OrderDetail = {
            order_id: transaction.id,
            order_courier_id: orderCourierId,
            invoice_no: transaction.invoice_no,
            customer_name: transaction.customer?.name || '-',
            order_date: transaction.created_at,
            items: transaction.items || [],
            grandtotal: transaction.grandtotal || 0,
            payment_status: transaction.payment_status || 'Unknown'
        };

        setOrderDetail(orderDetailData);
        setStep(3);
    };

    const submitTracking = async () => {
        const validation = form.validate();
        if (validation.hasErrors) {
            notifications.show({
                title: 'Error',
                message: 'Mohon lengkapi semua field yang diperlukan',
                color: 'red'
            });
            return;
        }

        if (!orderDetail) {
            notifications.show({
                title: 'Error',
                message: 'Data order tidak ditemukan',
                color: 'red'
            });
            return;
        }

        const submitData = {
            order_id: orderDetail.order_id,
            order_courier_id: orderDetail.order_courier_id,
            tracking_status_id: Number(form.values.tracking_status_id),
            status_name: form.values.status_name,
            description: form.values.description,
            location: 'Warehouse Jakarta',
            courier_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            pic_name: 'system',
        };

        await fetch({
            url: 'order-manifest/',
            method: 'POST',
            data: submitData,
            before: () => setLoading.append('submittracking'),
            success: () => {
                notifications.show({
                    title: 'Sukses',
                    message: 'Data tracking berhasil disimpan',
                    color: 'green'
                });

                resetForm();
            },
            error: (error: any) => {
                notifications.show({
                    title: 'Error',
                    message: error?.message || 'Gagal menyimpan data',
                    color: 'red'
                });
            },
            complete: () => setLoading.filter(e => e !== 'submittracking'),
        });
    };

    const resetForm = () => {
        form.reset();
        setSelectedCreator(null);
        setTransactions([]);
        setOrderDetail(null);
        setSearchQuery('');
        setPagination({
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: 10
        });
        setHasMore(true);
        setStep(1);
    };

    const StepIndicator = () => (
        <Group justify="center" gap="xl" mb="xl" style={{ flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map((s) => (
                <Box key={s} style={{ textAlign: 'center', minWidth: 70 }}>
                    <ThemeIcon
                        size={40}
                        radius="xl"
                        variant={step >= s ? 'filled' : 'light'}
                        color={step >= s ? 'blue' : 'gray'}
                    >
                        <Text fw={700}>{s}</Text>
                    </ThemeIcon>
                    <Text size="xs" mt={4} c={step >= s ? 'blue' : 'dimmed'}>
                        {s === 1 && 'Pilih Creator'}
                        {s === 2 && 'Pilih Invoice'}
                        {s === 3 && 'Detail Order'}
                        {s === 4 && 'Form Tracking'}
                    </Text>
                </Box>
            ))}
        </Group>
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    // Filter transactions based on search query
    const filteredTransactions = transactions.filter(transaction => {
        const query = searchQuery.toLowerCase();
        return (
            transaction.invoice_no.toLowerCase().includes(query) ||
            transaction.customer?.name.toLowerCase().includes(query) ||
            transaction.id.toString().includes(query)
        );
    });

    return (
        <Box pos="relative" mih="100vh" bg="gray.0">
            <LoadingOverlay visible={loading.length > 0} />

            {/* Header */}
            <Box bg="white" style={{ borderBottom: '1px solid #dee2e6' }}>
                <Container size="lg" px="xl" py="lg">
                    <Group justify="space-between" align="center">
                        <Box>
                            <Title order={2} size="h2" fw={700}>
                                Tracking Order
                            </Title>
                            <Text size="sm" c="dimmed" mt={4}>
                                Buat tracking baru untuk order yang sudah diterima
                            </Text>
                        </Box>
                        {step > 1 && (
                            <Button
                                variant="subtle"
                                onClick={resetForm}
                                leftSection={<Icon icon="mdi:arrow-left" />}
                                size="sm"
                            >
                                Kembali ke Awal
                            </Button>
                        )}
                    </Group>
                </Container>
            </Box>

            <Divider />

            {/* Main Content */}
            <Container size="lg" px="xl" py="xl">
                <StepIndicator />

                <Stack gap="xl">
                    {/* Step 1: Pilih Creator */}
                    {step === 1 && (
                        <Paper withBorder radius="md" shadow="sm" bg="white" p="xl">
                            <Group gap="sm" align="center" mb="md">
                                <ThemeIcon size="lg" variant="light" color="blue" radius="md">
                                    <Icon icon="mdi:account-group" />
                                </ThemeIcon>
                                <Box>
                                    <Title order={4} fw={600}>Pilih Creator</Title>
                                    <Text size="sm" c="dimmed">Pilih creator dari daftar untuk melihat transaksi</Text>
                                </Box>
                            </Group>

                            <Stack gap="md">
                                <Select
                                    label="Pilih Creator"
                                    placeholder="Klik untuk memilih creator"
                                    data={creators.map((creator: Creator) => ({
                                        value: creator.slug_url,
                                        label: creator.name
                                    }))}
                                    size="md"
                                    searchable
                                    clearable
                                    disabled={loading.includes('getcreators')}
                                    onChange={(value) => {
                                        if (value) {
                                            const creator = creators.find((c: Creator) => c.slug_url === value);
                                            if (creator) {
                                                setSelectedCreator(creator);
                                                setTransactions([]); // Reset transactions
                                                setPagination({
                                                    current_page: 1,
                                                    last_page: 1,
                                                    total: 0,
                                                    per_page: 10
                                                });
                                                setHasMore(true);
                                                getTransactions(value, 1);
                                            }
                                        }
                                    }}
                                />
                            </Stack>
                        </Paper>
                    )}

                    {/* Step 2: Pilih Invoice dengan Desain yang Dirapikan */}
                    {step === 2 && (
                        <Paper withBorder radius="md" shadow="sm" bg="white" p="xl">
                            {/* Header dengan Statistik dan Search */}
                            <Stack gap="md" mb="lg">
                                <Group justify="space-between" align="center">
                                    <Group gap="sm">
                                        <ThemeIcon size="lg" variant="light" color="blue" radius="md">
                                            <Icon icon="mdi:file-document" />
                                        </ThemeIcon>
                                        <Box>
                                            <Title order={4} fw={600}>Daftar Invoice</Title>
                                            <Text size="sm" c="dimmed">
                                                {selectedCreator && `Creator: ${selectedCreator.name}`}
                                            </Text>
                                        </Box>
                                    </Group>

                                    {/* Statistik Ringkas */}
                                    {pagination.total > 0 && (
                                        <Badge size="lg" variant="light" color="blue" radius="sm">
                                            {pagination.total} Transaksi
                                        </Badge>
                                    )}
                                </Group>

                                {/* Search dan Filter */}
                                <Group grow>
                                    <TextInput
                                        placeholder="Cari invoice, customer, atau ID order..."
                                        leftSection={<Icon icon="mdi:magnify" width={20} />}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                        size="md"
                                        radius="md"
                                    />
                                    <Select
                                        placeholder="Filter status"
                                        data={['Semua', 'Verified', 'Pending', 'Unpaid']}
                                        defaultValue="Semua"
                                        size="md"
                                        radius="md"
                                        leftSection={<Icon icon="mdi:filter" width={20} />}
                                    />
                                </Group>

                                {/* Info Ringkas */}
                                <Text size="sm" c="dimmed">
                                    {filteredTransactions.length > 0
                                        ? `Menampilkan ${filteredTransactions.length} dari ${pagination.total} transaksi`
                                        : 'Tidak ada transaksi yang ditemukan'}
                                </Text>
                            </Stack>

                            {/* Daftar Invoice dengan Grid Layout */}
                            <Box style={{ maxHeight: '600px', overflowY: 'auto' }} px={4}>
                                <Stack gap="md">
                                    {filteredTransactions.length > 0 ? (
                                        <>
                                            {filteredTransactions.map((transaction: Transaction, index: number) => {
                                                const isLastItem = index === filteredTransactions.length - 1;
                                                const paymentStatusColor = getPaymentStatusColor(transaction.payment_status);

                                                return (
                                                    <Card
                                                        key={transaction.id}
                                                        withBorder
                                                        padding="lg"
                                                        radius="md"
                                                        style={{
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                                        }}
                                                        styles={{
                                                            root: {
                                                                '&:hover': {
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                                }
                                                            }
                                                        }}
                                                        onClick={() => getOrderDetail(transaction)}
                                                        ref={isLastItem ? lastTransactionRef : null}
                                                    >
                                                        <Stack gap="md">
                                                            {/* Baris 1: Invoice dan Status */}
                                                            <Group justify="space-between" align="center">
                                                                <Group gap="xs">
                                                                    <ThemeIcon size="sm" color="blue" variant="light" radius="sm">
                                                                        <Icon icon="mdi:receipt" width={16} />
                                                                    </ThemeIcon>
                                                                    <Text fw={700} size="lg">
                                                                        {transaction.invoice_no}
                                                                    </Text>
                                                                </Group>
                                                                <Group gap="xs">
                                                                    <Badge
                                                                        color={paymentStatusColor}
                                                                        variant="light"
                                                                        size="lg"
                                                                        radius="sm"
                                                                    >
                                                                        {transaction.payment_status}
                                                                    </Badge>
                                                                    <Tooltip label="Lihat detail">
                                                                        <ActionIcon variant="subtle" color="blue">
                                                                            <Icon icon="mdi:arrow-right" width={18} />
                                                                        </ActionIcon>
                                                                    </Tooltip>
                                                                </Group>
                                                            </Group>

                                                            {/* Baris 2: Informasi Customer */}
                                                            <Group gap="xs">
                                                                <Avatar
                                                                    size="sm"
                                                                    radius="xl"
                                                                    color="blue"
                                                                >
                                                                    {transaction.customer?.name?.charAt(0) || '?'}
                                                                </Avatar>
                                                                <Box>
                                                                    <Text size="sm" fw={500}>
                                                                        {transaction.customer?.name}
                                                                    </Text>
                                                                    <Group gap={4}>
                                                                        <Icon icon="mdi:calendar" width={14} color="gray" />
                                                                        <Text size="xs" c="dimmed">
                                                                            {formatDate(transaction.created_at)}
                                                                        </Text>
                                                                    </Group>
                                                                </Box>
                                                            </Group>

                                                            {/* Baris 3: Grid Informasi Tambahan */}
                                                            <SimpleGrid cols={3} spacing="xs">
                                                                <Box>
                                                                    <Text size="xs" c="dimmed">Order ID</Text>
                                                                    <Text size="sm" fw={500}>#{transaction.id}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text size="xs" c="dimmed">Total Qty</Text>
                                                                    <Text size="sm" fw={500}>
                                                                        {transaction.total_qty || 0} item
                                                                    </Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text size="xs" c="dimmed">Total</Text>
                                                                    <Text size="sm" fw={700} c="blue">
                                                                        {formatCurrency(transaction.grandtotal)}
                                                                    </Text>
                                                                </Box>
                                                            </SimpleGrid>

                                                            {/* Baris 4: Tracking Info (Jika Ada) */}
                                                            {transaction.latest_manifest && (
                                                                <Box
                                                                    p="xs"
                                                                    bg="gray.0"
                                                                    style={{ borderRadius: 8 }}
                                                                >
                                                                    <Group justify="space-between">
                                                                        <Group gap="xs">
                                                                            <Indicator
                                                                                color="blue"
                                                                                processing
                                                                                size={10}
                                                                            >
                                                                                <ThemeIcon
                                                                                    size="sm"
                                                                                    color="blue"
                                                                                    variant="light"
                                                                                    radius="xl"
                                                                                >
                                                                                    <Icon icon="mdi:truck" width={14} />
                                                                                </ThemeIcon>
                                                                            </Indicator>
                                                                            <Box>
                                                                                <Text size="xs" c="dimmed">
                                                                                    Tracking Terakhir
                                                                                </Text>
                                                                                <Group gap="xs">
                                                                                    <Badge size="sm" variant="dot" color="blue">
                                                                                        {transaction.latest_manifest.status_name}
                                                                                    </Badge>
                                                                                    <Text size="xs" fw={500}>
                                                                                        {transaction.latest_manifest.tracking_number}
                                                                                    </Text>
                                                                                </Group>
                                                                            </Box>
                                                                        </Group>
                                                                        {transaction.latest_manifest.updated_at && (
                                                                            <Text size="xs" c="dimmed">
                                                                                {formatDate(transaction.latest_manifest.updated_at)}
                                                                            </Text>
                                                                        )}
                                                                    </Group>
                                                                </Box>
                                                            )}

                                                            {/* Baris 5: Item Count (Jika Ada Items) */}
                                                            {transaction.items && transaction.items.length > 0 && (
                                                                <Group gap="xs">
                                                                    <Icon icon="mdi:package-variant" width={14} color="gray" />
                                                                    <Text size="xs" c="dimmed">
                                                                        {transaction.items.length} item produk
                                                                    </Text>
                                                                </Group>
                                                            )}
                                                        </Stack>
                                                    </Card>
                                                );
                                            })}

                                            {/* Loading Indicator */}
                                            {loadingMore && (
                                                <Center py="xl">
                                                    <Loader size="sm" />
                                                    <Text ml="sm" size="sm" c="dimmed">
                                                        Memuat lebih banyak transaksi...
                                                    </Text>
                                                </Center>
                                            )}

                                            {/* No More Data */}
                                            {!hasMore && transactions.length > 0 && (
                                                <Center py="xl">
                                                    <Stack align="center" gap="xs">
                                                        <ThemeIcon size="xl" radius="xl" color="gray" variant="light">
                                                            <Icon icon="mdi:check-all" width={24} />
                                                        </ThemeIcon>
                                                        <Text size="sm" c="dimmed">
                                                            Semua transaksi telah dimuat
                                                        </Text>
                                                    </Stack>
                                                </Center>
                                            )}
                                        </>
                                    ) : (
                                        // Empty State
                                        <Center py="xl">
                                            <Stack align="center" gap="md">
                                                <ThemeIcon size={80} radius={100} color="gray" variant="light">
                                                    <Icon icon="mdi:receipt" width={40} />
                                                </ThemeIcon>
                                                <Box ta="center">
                                                    <Title order={5} fw={500}>
                                                        {searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada transaksi'}
                                                    </Title>
                                                    <Text size="sm" c="dimmed" mt={4}>
                                                        {searchQuery
                                                            ? `Tidak ditemukan invoice dengan kata kunci "${searchQuery}"`
                                                            : 'Tidak ada transaksi yang tersedia untuk creator ini'}
                                                    </Text>
                                                </Box>
                                                {searchQuery && (
                                                    <Button
                                                        variant="light"
                                                        onClick={() => setSearchQuery('')}
                                                        leftSection={<Icon icon="mdi:close" />}
                                                    >
                                                        Hapus Filter
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Center>
                                    )}
                                </Stack>
                            </Box>

                            {/* Traditional Pagination (Optional) */}
                            {pagination.last_page > 1 && !loadingMore && (
                                <Group justify="center" mt="xl">
                                    <Pagination
                                        total={pagination.last_page}
                                        value={pagination.current_page}
                                        onChange={(page) => {
                                            if (selectedCreator) {
                                                setTransactions([]);
                                                getTransactions(selectedCreator.slug_url, page);
                                            }
                                        }}
                                        size="sm"
                                        radius="md"
                                        withEdges
                                    />
                                </Group>
                            )}
                        </Paper>
                    )}

                    {/* Step 3: Detail Order */}
                    {step === 3 && orderDetail && (
                        <Paper withBorder radius="md" shadow="sm" bg="white" p="xl">
                            <Group gap="sm" align="center" mb="md">
                                <ThemeIcon size="lg" variant="light" color="blue" radius="md">
                                    <Icon icon="mdi:package" />
                                </ThemeIcon>
                                <Box>
                                    <Title order={4} fw={600}>Detail Order</Title>
                                    <Text size="sm" c="dimmed">Konfirmasi detail order sebelum membuat tracking</Text>
                                </Box>
                            </Group>

                            <Stack gap="md">
                                <Card withBorder p="lg" radius="md" bg="blue.0">
                                    <Stack gap="md">
                                        <Group justify="space-between">
                                            <Text fw={500} size="sm" c="dimmed">Invoice</Text>
                                            <Text fw={700} size="lg">{orderDetail.invoice_no}</Text>
                                        </Group>
                                        <Divider />
                                        <SimpleGrid cols={2} spacing="md">
                                            <Box>
                                                <Text size="xs" c="dimmed">Order ID</Text>
                                                <Text fw={500}>#{orderDetail.order_id}</Text>
                                            </Box>
                                            <Box>
                                                <Text size="xs" c="dimmed">Customer</Text>
                                                <Text fw={500}>{orderDetail.customer_name}</Text>
                                            </Box>
                                            <Box>
                                                <Text size="xs" c="dimmed">Tanggal Order</Text>
                                                <Text fw={500}>{formatDate(orderDetail.order_date)}</Text>
                                            </Box>
                                            <Box>
                                                <Text size="xs" c="dimmed">Total</Text>
                                                <Text fw={700} c="blue" size="lg">
                                                    {formatCurrency(orderDetail.grandtotal || 0)}
                                                </Text>
                                            </Box>
                                        </SimpleGrid>
                                    </Stack>
                                </Card>

                                <Group grow>
                                    <Button
                                        variant="light"
                                        onClick={() => setStep(2)}
                                        leftSection={<Icon icon="mdi:arrow-left" />}
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        onClick={() => setStep(4)}
                                        rightSection={<Icon icon="mdi:arrow-right" />}
                                    >
                                        Lanjut ke Form Tracking
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    )}

                    {/* Step 4: Form Tracking */}
                    {step === 4 && orderDetail && (
                        <Paper withBorder radius="md" shadow="sm" bg="white" p="xl">
                            <Group gap="sm" align="center" mb="md">
                                <ThemeIcon size="lg" variant="light" color="blue" radius="md">
                                    <Icon icon="mdi:truck-delivery" />
                                </ThemeIcon>
                                <Box>
                                    <Title order={4} fw={600}>Form Tracking</Title>
                                    <Text size="sm" c="dimmed">Lengkapi data tracking untuk order ini</Text>
                                </Box>
                            </Group>

                            <Stack gap="lg">
                                {/* Ringkasan Order */}
                                <Paper withBorder p="md" bg="gray.0" radius="md">
                                    <Group justify="space-between">
                                        <Box>
                                            <Text size="xs" c="dimmed">Invoice</Text>
                                            <Text fw={600}>{orderDetail.invoice_no}</Text>
                                        </Box>
                                        <Box>
                                            <Text size="xs" c="dimmed">Order ID</Text>
                                            <Text fw={600}>#{orderDetail.order_id}</Text>
                                        </Box>
                                        <Box>
                                            <Text size="xs" c="dimmed">Customer</Text>
                                            <Text fw={600}>{orderDetail.customer_name}</Text>
                                        </Box>
                                    </Group>
                                </Paper>

                                <Select
                                    withAsterisk
                                    label="Status Tracking"
                                    placeholder="Pilih status tracking"
                                    data={[
                                        { value: '1', label: '1 - Dalam Proses' },
                                        { value: '2', label: '2 - Dalam Perjalanan' },
                                        { value: '3', label: '3 - Telah Diterima' },
                                        { value: '4', label: '4 - Gagal Dikirim' },
                                    ]}
                                    size="md"
                                    searchable
                                    clearable
                                    {...form.getInputProps('tracking_status_id')}
                                />

                                <TextInput
                                    withAsterisk
                                    label="Nama Status"
                                    placeholder="Contoh: Telah Diterima"
                                    size="md"
                                    {...form.getInputProps('status_name')}
                                />

                                <Textarea
                                    withAsterisk
                                    label="Deskripsi"
                                    placeholder="Deskripsi detail status tracking"
                                    autosize
                                    minRows={3}
                                    size="md"
                                    {...form.getInputProps('description')}
                                />

                                <Alert color="blue" variant="light">
                                    <Group gap="xs">
                                        <Icon icon="mdi:information" />
                                        <Text size="sm">
                                            Tracking akan dibuat dengan lokasi {form.values.location} dan PIC {form.values.pic_name}
                                        </Text>
                                    </Group>
                                </Alert>

                                <Group grow>
                                    <Button
                                        variant="light"
                                        onClick={() => setStep(3)}
                                        leftSection={<Icon icon="mdi:arrow-left" />}
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        loading={loading.includes('submittracking')}
                                        onClick={submitTracking}
                                        color="blue"
                                        size="md"
                                        leftSection={<Icon icon="mdi:check" />}
                                    >
                                        Submit Tracking
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}