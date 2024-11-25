import useLoggedUser from "@/utils/useLoggedUser";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ActionIcon, Alert, Box, Button, Card, Flex, Image, Menu, NumberFormatter, NumberInput, ScrollArea, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { MerchListResponse } from "../merch/type";
import { useEffect, useMemo, useState } from "react";
import { useListState } from "@mantine/hooks";
import fetch from "@/utils/fetch";
import { modals } from "@mantine/modals";

type ComponentProps = {
    
};

export default function Index({  }: Readonly<ComponentProps>) {
    const user = useLoggedUser();
    const [loading, setLoading] = useListState<string>();
    const [searchQuery, setSearchQuery] = useState('');
    const [merch, setMerch] = useState<MerchListResponse[]>();
    const [openSelect, setOpenSelect] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>();
    const [selected, setSelected] = useState<{
        id: number;
        variant_id?: number;
        count: number;
    }[]>([]);

    useEffect(() => {
        if (user) getMerchList();
    }, [user]);

    const getMerchList = async () => {
        await fetch<any, MerchListResponse[]>({
            url: 'product' + `?creator_id=${user?.has_creator?.id}`,
            method: 'GET',
            before: () => setLoading.append(''),
            success: ({ data }) => data && setMerch(data.filter(e => e.product_status_id == 2)),
            complete: () => setLoading.filter(e => e != ''),
            error: () => {},
        });
    }

    const merchList = useMemo(() => {
        const filterSelected = (e: MerchListResponse): MerchListResponse | null => {
            if (e.product_varian.length > 0) {
                const variant = e.product_varian.filter(e => !selected.map(e => e.variant_id).includes(e.id));

                if (variant.length == 0) return null;
                return {...e, product_varian: variant};
            } else {
                return !selected.map(e => e.id).includes(e.id) ? e : null;
            }
        }

        return merch?.map(filterSelected)?.filter(e => Boolean(e)).filter(e => Boolean(searchQuery) ? e?.product_name.toLowerCase().includes(searchQuery) : true).map((e, i) => ({
            name: e?.product_name,
            price: (e?.product_varian.length ?? 0) > 0 ? e?.product_varian.map(e => parseInt(e.price)).reduce(
                (acc, price) => [
                    Math.min(acc[0], price),
                    Math.max(acc[1], price)
                ],
                [Infinity, -Infinity]
            ): [parseInt(e?.price ?? '999999')],
            image: (e?.product_image.length ?? 0) > 0 ? e?.product_image[0].image_url : '#',
            raw: e,
            stock: (e?.product_varian.length ?? 0) > 0 ? e?.product_varian.reduce((q, n) => q + n.stock_qty, 0) : e?.qty ?? 0
        }))
    }, [merch, searchQuery, selected]);

    const selectedList = useMemo(() => {
        return selected.map(e => {
            const product = merch?.find(z => z.id == e.id);
            const name = product?.product_name;
            const variant_name = product?.product_varian.find(z => z.id == e.variant_id)?.varian_name;
            const image = (product?.product_image?.length ?? 0) > 0 ? product?.product_image[0].image_url : '#';
            const price = (!e.variant_id ? parseInt(product?.price ?? '999999') : parseInt(product?.product_varian?.find(z => z.id == e.variant_id)?.price ?? '999999')) * e.count;
            const stock = e.variant_id ? product?.qty ?? 0 : product?.product_varian.find(z => z.id == e.variant_id)?.stock_qty ?? 0;

            return { name, variant_name, price, image, count: e.count, stock };
        })
    }, [selected]);

    const handleAddProduct = (product: MerchListResponse) => {
        if (product.product_varian.length > 0) {
            const selectVariant = (id: number) => {
                setSelected([...selected, {
                    id: product.id,
                    variant_id: id,
                    count: 1
                }]);
                modals.closeAll();
                setOpenSelect(!openSelect);
            };

            modals.open({
                size: 300,
                centered: true,
                title: 'Pilih Varian',
                children: <Stack gap={10}>
                    {product.product_varian.map((e, i) => (
                        <Button size="md" radius={8} onClick={() => selectVariant(e.id)} key={i} variant="light" color="gray" c="gray.8" fw={400}>
                            {e.varian_name} (<NumberFormatter value={parseInt(e.price)} />)
                        </Button>
                    ))}
                </Stack>
            })
        } else {
            setSelected([...selected, {
                id: product.id,
                count: 1
            }]);
            setOpenSelect(!openSelect);
        }
    }

    const handleDeleteItem = (index: number) => {
        modals.openConfirmModal({
            centered: true,
            title: 'Hapus Item',
            children: 'Apakah kamu yakin ingin menghapus item ini?',
            labels: { confirm: 'Hapus', cancel: 'Batal' },
            onConfirm: () => {
                setSelected(selected.filter((_, i) => i != index));
            }
        })
    }

    const handleSummary = useMemo(() => {
        const total = selectedList.reduce((q, n) => q + (n.price * n.count), 0);
        return { total };
    }, [selectedList]);

    const openSelectPayment = () => {
        const payment = [
            {icon: 'ph:money-wavy', text: 'CASH'},
        ];

        modals.open({
            centered: true,
            title: 'Pilih Metode Pembayaran',
            children: <Stack gap={15}>
                {payment.map((e, i) => (
                    <UnstyledButton onClick={() => {
                        setPaymentMethod(e.text);
                        modals.closeAll();
                    }}>
                        <Card withBorder radius={10} p={10}>
                            <Flex align="center" gap={10}>
                                <Icon icon={e.icon} className={`text-gray text-[24px]`} />
                                <Text>{e.text}</Text>
                            </Flex>
                        </Card>
                    </UnstyledButton>
                ))}
            </Stack>
        })
    }

    return (
        <Stack className={`md:!p-[20px_30px]`} gap={15}>
            <Card radius={999} className={`!bg-primary-base !p-[5px_16px] w-fit m-[10px_10px_0]`}>
                <Flex align="center" gap={10}>
                    <Icon icon="hugeicons:cashier" className={`text-[20px] text-white`} />
                    <Text size="md" fw={400} className={`!text-white`}>Penjualan Offline</Text>
                </Flex>
            </Card>

            <Flex gap={15} className={`!h-[calc(100vh_-_140px)] md:!h-[calc(100vh_-_180px)]`} pos="relative">
                <Card withBorder w="100%" radius={10} h="100%" className={`!absolute z-30 transition-transform ${openSelect ? '' : 'translate-x-[120%] md:!translate-x-0'} md:!static`}>
                    <Stack gap={20} h="100%">
                        <Text fw={600} c="#0B387C">Pilih Produk</Text>
                        <TextInput
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            leftSection={<Icon icon="uiw:search" />}
                            placeholder="Cari Produk"
                        />
                        <Stack gap={10} className={`overflow-y-auto`} h="100%">
                            {merchList?.map((e ,i) => (
                                <UnstyledButton disabled={(e.stock ?? 0) <= 0} className={`${(e.stock ?? 0) <= 0 ? 'opacity-75' : ''}`} key={i} onClick={() => e.raw && handleAddProduct(e.raw)}>
                                    <Card p={10} withBorder radius={8} className={`relative ${(e.stock ?? 0) <= 0 ? '!bg-[#f5f5f5]' : 'hover:!bg-[#fafafa]'}`}>
                                        <Flex gap={10}>
                                            <Image src={e.image} h={48} w={48} bg="gray" radius={5} />
                                            <Stack gap={0}>
                                                <Text size="sm" className={`capitalize`}>{e.name}</Text>
                                                <Text size="sm" className={`whitespace-nowrap`}>
                                                    {(e?.price ?? [])?.map((z, i) => (
                                                        <Box key={i} component="span">
                                                            {i != 0 && <> - </>}
                                                            <NumberFormatter value={z} key={i} />
                                                        </Box>
                                                    ))}
                                                </Text>
                                                {(e.stock ?? 0) <= 0 && <Text size="xs" c="gray" mt={5} className={`capitalize`}>Stock Habis</Text>}
                                            </Stack>
                                        </Flex>

                                        <Icon icon="uiw:right" className={`!absolute top-2/4 -translate-y-2/4 right-5 z-20 text-[#d0d0d0]`} />
                                    </Card>
                                </UnstyledButton>
                            ))}
                            {merchList?.length == 0 && (
                                <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />}>
                                    Tidak ada produk yang ditemukan
                                </Alert>
                            )}
                        </Stack>

                        <Button
                            size="md"
                            onClick={() => setOpenSelect(!openSelect)}
                            rightSection={<Icon icon="uiw:right" />}
                            className={`shrink-0 md:!hidden`}
                            c="gray"
                            variant="light">
                            Tutup
                        </Button>
                    </Stack>
                </Card>

                <Card withBorder w="100%" p={0} radius={10} h="100%">
                    <Stack gap={0} h="100%">
                        <Card p={20} className={`flex-grow h-full`}>
                            <Flex align="center" gap={10} mb={20}>
                                <Icon icon="uiw:information-o" className={`text-primary-base`} />
                                <Text fw={600} c="#0B387C">Rincian Produk</Text>
                            </Flex>

                            <Stack gap={15} className={`overflow-y-auto flex-grow`} justify="start">
                                {selectedList.map((e, i) => (
                                    <Card p={10} withBorder radius={8} pos="relative" key={i} className={`hover:!bg-[#fafafa] shrink-0`}>
                                        <Flex gap={10} wrap="wrap">
                                            <Flex gap={10} className={`flex-grow`}>
                                                <Image src={e.image} h={48} w={48} bg="gray" radius={5} />
                                                <Stack gap={0}>
                                                    <Text size="sm" className={`capitalize whitespace-nowrap`}>{e.name}</Text>
                                                    {e.variant_name && <Text size="xs" c="gray" mb={5} className={`capitalize`}>Varian: {e.variant_name}</Text>}
                                                    <Text size="sm" className={`whitespace-nowrap`}>
                                                        <NumberFormatter value={e.price} />
                                                    </Text>
                                                </Stack>
                                            </Flex>

                                            {/* className={`!absolute z-20 top-2/4 right-5 -translate-y-2/4`} */}
                                            <Flex gap={10} align="center" className={`shrink-0`}>
                                                <NumberInput
                                                    min={1}
                                                    // max={e.stock}
                                                    onChange={e => {
                                                        setSelected(selected.map((_, x) => x == i ? ({..._, count: parseInt(e as string)}) : _))
                                                    }}
                                                    value={e.count}
                                                    size="xs"
                                                    w={80}
                                                />
                                                <ActionIcon onClick={() => handleDeleteItem(i)} color="red.4" variant="transparent">
                                                    <Icon icon="uiw:delete"/>
                                                </ActionIcon>
                                            </Flex>
                                        </Flex>
                                    </Card>
                                ))}
                                {selected.length == 0 && (
                                    <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />}>
                                        Belum ada produk yang dipilih
                                    </Alert>
                                )}
                            </Stack>
                        </Card>

                        <Card p="12px 16px 16px" className={`md:!hidden border-t border-t-[#d0d0d0] !shrink-0`} radius={0}>
                            <Flex gap={15} justify="space-between" align="center" wrap="wrap">
                                <Stack gap={0}>
                                    {/* <Text><NumberFormatter className={`font-[600]`} value={100000} /></Text> */}
                                </Stack>

                                <Button onClick={() => setOpenSelect(!openSelect)} leftSection={<Icon icon="uiw:plus" />} variant="light">
                                    Tambah Produk
                                </Button>
                            </Flex>
                        </Card>

                        <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0] !shrink-0`} radius={0}>
                            <Flex gap={15} justify="space-between" align="center" wrap="wrap">
                                <Stack gap={0}>
                                    <Text size="xs" className={`!text-primary-base`}>Metode Pembayaran</Text>
                                    <Text>{paymentMethod ?? '-'}</Text>
                                </Stack>

                                <Button onClick={openSelectPayment} pos="relative" variant="light">
                                    Metode Pembayaran
                                </Button>
                            </Flex>
                        </Card>

                        <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0] !shrink-0`} radius={0}>
                            <Flex gap={15} justify="space-between" align="center" wrap="wrap">
                                <Stack gap={0}>
                                    <Text size="xs" className={`!text-primary-base`}>Total Pembayaran</Text>
                                    <Text><NumberFormatter className={`font-[600]`} value={handleSummary.total} /></Text>
                                </Stack>
                                <Button disabled={handleSummary.total <= 0 || !paymentMethod} rightSection={<Icon icon="uiw:right" />}>
                                    Selanjutnya
                                </Button>
                            </Flex>
                        </Card>
                    </Stack>
                </Card>
            </Flex>
        </Stack>
    );
}