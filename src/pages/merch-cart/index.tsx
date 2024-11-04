// pages/cart.tsx
import { useEffect, useMemo, useState } from 'react';
import { Container, Group, Checkbox, Text, Title, Button, Paper, Stack, Image, Flex, Card, NumberFormatter, ActionIcon, Center, NumberInput, AspectRatio } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { MerchListResponse } from '../dashboard/merch/type';
import { Delete, Get } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';
import { modals } from '@mantine/modals';
import merchIcon from '../../assets/svg/merch.svg';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import ButtonB from '@/components/Button';
import ImageB from 'next/image';

interface CartItem {
    id: number;
    storeName: string;
    productName: string;
    price: number;
    variant?: string;
    imageUrl: string;
}

type CartListResponse = {
    id: number;
    user_id: number;
    product_id: number;
    qty: number;
    price: number;
};

const cartItems: CartItem[] = [
    { id: 1, storeName: 'Store A', productName: 'Product 1', price: 100, variant: 'Red', imageUrl: '/path/to/image1.jpg' },
    { id: 2, storeName: 'Store B', productName: 'Product 2', price: 200, imageUrl: '/path/to/image2.jpg' },
    { id: 3, storeName: 'Store A', productName: 'Product 3', price: 300, variant: 'Large', imageUrl: '/path/to/image3.jpg' }
];

export default function Cart() {
    const [isr, setIsr] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [productList, setProductList] = useListState<MerchListResponse>();
    const [cartList, setCartList] = useListState<CartListResponse>();
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    const router = useRouter();

    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {
        getCart();
        getProduct();
    }, [isr]);

    const getCart = () => {
        Get('cart', {})
            .then((res: any) => {
                const list = _.filter(res, ['user_id', user?.id]);
                setCartList.setState(list);
                console.log(list);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const deleteCart = (id: number) => {
        modals.openConfirmModal({
            centered: true,
            title: 'Hapus Produk?',
            children: 'Apakah anda yakin ingin menghapus produk ini dari keranjang?',
            labels: { confirm: 'Hapus', cancel: 'Batal' },
            onConfirm: () => {
                Delete(`cart/${id}`, {})
                .then((res: any) => {
                    setCartList.filter((e) => e.id != id);
                })
                .catch((err) => {
                    console.log(err);
                });
            }
        })
    };

    const getProduct = () => {
        Get('product', {})
            .then((res: any) => {
                setProductList.setState(res.data);
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const cartListFiltered = useMemo(() => {
        return cartList.map((e) => ({ ...e, product: _.find(productList, ['id', e.product_id]) }));
    }, [cartList]);

    const handleSelect = (id: number) => {
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
    };

    const totalPrice = cartListFiltered.filter((item) => selectedItems.includes(item.id)).reduce((sum, item) => sum + (item.price * item.qty), 0);

    const subheadings = ['Cek produkmu sebelum melanjutkan!', 'Pastikan yang kamu beli sesuai kebutuhan.', 'Nikmati belanja dengan aman dan nyaman.'];

    return (
        <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px]`}>
            <Title order={1} size="h2">
                Keranjang Saya
            </Title>
            <Text size="md" c="gray">
                {subheadings[0]}
            </Text>{' '}
            {/* You can choose any subheading from the array */}
            <Flex mt="xl" gap="md" className={`flex-col md:flex-row w-full`}>
                <Stack gap="md" w="100%">
                    {cartListFiltered.map((item, i) => (
                        <Paper key={item.id} p="md" withBorder>
                            <Flex gap={15} align="center" justify="space-between" wrap="wrap">
                                <Flex gap={15} align="center">
                                    <Checkbox checked={selectedItems.includes(item.id)} onChange={() => handleSelect(item.id)} />
                                    <AspectRatio>
                                        <Image src={item.product?.product_image[0].image_url} alt={'cart-img'} w={64} h={64} className={`!shrink-0 bg-grey/20`} radius={5} />
                                    </AspectRatio>
                                    <div className={`w-full`}>
                                        <Text fw={500}>{item.product?.product_name}</Text>
                                        <Text size="sm" c="gray"><NumberFormatter value={item.price} /></Text>
                                    </div>
                                </Flex>

                                <Flex gap={10} align="center" justify="end" className={`flex-grow`}>
                                    <ActionIcon
                                        radius="xl"
                                        className={`shrink-0`}
                                        disabled={item.qty <= 0}
                                        onClick={() => setCartList.applyWhere((_, x) => x == i, (e) => ({...e, qty: e.qty - 1}))}
                                        color="#194E9E">
                                        <Icon icon="uiw:minus" />
                                    </ActionIcon>
                                    <NumberInput value={item.qty} hideControls w={50} className='[&_*]:!text-center'/>
                                    <ActionIcon
                                        radius="xl"
                                        className={`shrink-0`}
                                        disabled={item.qty >= (item.product?.qty ?? 0)}
                                        onClick={() => setCartList.applyWhere((_, x) => x == i, (e) => ({...e, qty: e.qty + 1}))}
                                        color="#194E9E">
                                        <Icon icon="uiw:plus" />
                                    </ActionIcon>
                                    <ActionIcon
                                        className={`shrink-0`}
                                        onClick={() => deleteCart(item.id)}
                                        color="red"
                                        variant='transparent'>
                                        <Icon icon="uiw:delete" />
                                    </ActionIcon>
                                </Flex>
                            </Flex>
                        </Paper>
                    ))}
                    {cartListFiltered?.length == 0 && (
                        <Center mih={200} w="100%">
                            <div className='py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full'>
                                <div className='border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2'>
                                    <ImageB src={merchIcon} alt='bank' className='w-7' />
                                </div>
                                <div className='text-center'>
                                <p className='font-semibold text-lg'>Belum ada produk di keranjang</p>
                                <p className='text-grey max-w-72 mt-[10px]'>
                                    Cari Produk dan tambahkan ke keranjang.
                                </p>
                                </div>
                                <ButtonB
                                    label='Cari Produk'
                                    color='primary'
                                    className='mt-4'
                                    onClick={() => router.push('/merchandise')}
                                    startIcon={faCirclePlus}
                                />
                            </div>
                        </Center>
                    )}
                </Stack>

                <Card withBorder w="100%" className={`md:max-w-[300px]`} h="fit-content">
                    <Stack gap="md">
                        <Title order={3}>Checkout</Title>
                        <Flex justify="space-between">
                            <Text>Total Harga</Text>
                            <Text><NumberFormatter value={totalPrice} /></Text>
                        </Flex>
                        <Button fullWidth color="#194E9E" disabled={selectedItems.length === 0 || cartListFiltered.length == 0} radius="xl">
                            Checkout
                        </Button>
                    </Stack>
                </Card>
            </Flex>
        </Container>
    );
}
