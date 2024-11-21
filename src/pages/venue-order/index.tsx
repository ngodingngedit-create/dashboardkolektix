// pages/cart.tsx
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Container, Group, Checkbox, Text, Title, Button, Paper, Stack, Image, Flex, Card, NumberFormatter, ActionIcon, Center, NumberInput, AspectRatio, Divider, Accordion, UnstyledButton, TextInput, Box, Modal, Select, Textarea, SimpleGrid, Loader } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { MerchListResponse } from '../dashboard/merch/type';
import { Delete, Get } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import Cookies from 'js-cookie';
import fetch from '@/utils/fetch';
import { AddressData, addressDataSchema, AddressUpdateRequest } from '../dashboard/profile/address';
import { currencyFormat } from '@/utils/currencyFormat';
import { z } from 'zod';
import { VenueListResponse } from '../dashboard/venue/type';
import moment from 'moment';


type Province = {
    id: number;
    name: string;
}

type City = {
    id: number;
    province_id: number;
    name: string;
    province?: Province;
}

type FormState = {
    nama_pemesan?: string;
    email_pemesan?: string;
    receiver?: {
        id?: number;
        name: string;
        phone: string;
        address_name: string;
        province_id: number;
        city_id: number;
        pos_code: number;
        detail: string;
    };
    payment_method?: string;
    courier?: {
        name: string;
        type?: GetCourierRes;
    };
}

type GetCourierReq = {
    origin: number,
    origin_type: string,
    destination: number,
    destination_type: string,
    weight: number,
    courier: string
};

type GetCourierRes = {
    service: string,
    description: string,
    cost: Array<{
        value: number,
        etd: string,
        note: string
    }>
};

type OrderData = {
    product_id: number;
    variant_id: number;
    qty: number;
}[];

type Checkout = {
    user_id: number | null;
    nama_pemesan?: string;
    email_pemesan?: string;
    creator_id: number;
    grandtotal: number;
    product: Array<{
        product_id: number;
        variant_id: null | number;
        qty: number;
        price: number
    }>;
    payment_method: string;
    courier: {
        main: string;
        type: string;
        price: number
    };
    address: {
        id?: number;
        is_main_address: number;
        province_id: number;
        city_id: number;
        address_detail: string;
        address_name: string;
        zipcode: string;
        latitude: string;
        longitude: string;
        nama_penerima: string;
        phone: string;
        is_active: number;
    }
    }
;  

export const formStateSchema = z.object({
    nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
    email_pemesan: z.string().email("Email pemesan tidak boleh kosong.").optional().nullable(),
    receiver: z.object({
        name: z.string().nonempty("Nama penerima tidak boleh kosong."),
        address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
        phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
        province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
        city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
        pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
        detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
    }),
    payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
    courier: z.string().nonempty("Kurir tidak boleh kosong."),
});

export type VenueBookingOrder = {
    id: number;
    date_start: string;
    date_end: string;
}

export default function Cart() {
    const [isr, setIsr] = useState(false);
    const [orderData, setOrderData] = useState<VenueBookingOrder>()
    const [venue, setVenue] = useState<VenueListResponse>();
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    const router = useRouter();

    const form = useForm<FormState>({});

    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {
        getData();
        const _orderData: VenueBookingOrder = JSON.parse(Cookies.get('venue_order_data') ?? '[]');
        if (!_orderData) router.push('/venue');
        setOrderData(_orderData);
    }, [isr]);

    useEffect(() => {
        getData();
    }, [orderData]);

    const getData = async () => {
        await fetch<any, VenueListResponse>({
            url: `venue/${orderData?.id}`,
            method: 'GET',
            before: () => setLoading.append('getdata'),
            success: ({ data }) => data && setVenue(data),
            complete: () => setLoading.filter(e => e != 'getdata'),
        });
    };

    const orderSummary = useMemo(() => {
        return {
            array: [
                ["Biaya Booking", 100000],
                ["Pajak", 11000],
                ["Biaya Admin", 2000],
                ["Total Pembayaran", 123000],
            ]
        }
    }, []);

    return (
        <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>

            <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
                <Stack gap={25} mb={40}>
                    <Stack gap={0}>
                        <Title order={1} size="h2">
                            Booking Venue
                        </Title>
                        <Text size="sm" c="gray">
                            Selesaikan Pembayaran untuk booking venue
                        </Text>
                    </Stack>

                    <Divider />

                    <Flex gap={20} w="100%" wrap="wrap" align="stretch">
                        <Stack gap={15} className={`flex-grow`}>
                            <DropdownComponent title="Detail Booking" icon="lucide:info" defaultOpened>
                                <Stack>
                                    <Flex justify="space-between" gap={20} align="center">
                                        <Stack gap={0}>
                                            <Text size="sm" c="gray">Venue</Text>
                                            <Text>{venue?.name}</Text>
                                        </Stack>
                                        <Image src={venue?.image_url ?? '#'} bg="gray.1" radius={7} w={50} h={50} />
                                    </Flex>
                                    <Stack gap={0}>
                                        <Text size="sm" c="gray">Lokasi</Text>
                                        <Text>{venue?.location}</Text>
                                    </Stack>
                                    <Flex gap={10} className={`[&>*]:!flex-grow`} wrap="wrap">
                                        <Stack gap={0}>
                                            <Text size="sm" c="gray">Maks. Kapasitas</Text>
                                            <Text><NumberFormatter value={venue?.max_capacity} /></Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="sm" c="gray">Jumlah Kursi</Text>
                                            <Text><NumberFormatter value={venue?.seat_capacity} /></Text>
                                        </Stack>
                                    </Flex>
                                    <Flex justify="space-between" gap={20} align="center">
                                        <Stack gap={0}>
                                            <Text size="sm" c="gray">Tanggal Booking</Text>
                                            <Text>{moment(orderData?.date_start).format('DD MMM YYYY')} - {moment(orderData?.date_end).format('DD MMM YYYY')}</Text>
                                        </Stack>
                                        <Button variant="transparent" color="#194e9e">
                                            Edit
                                        </Button>
                                    </Flex>
                                </Stack>
                            </DropdownComponent>

                            <DropdownComponent title={'Opsi Pembayaran'} icon={'hugeicons:money-04'} defaultOpened>
                                <Stack>
                                    <Flex component="label" justify="space-between" align="center" gap={15} className={`cursor-pointer`}>
                                        <Stack gap={0}>
                                            <Text>Pembayaran Penuh</Text>
                                            <Text maw={400} c="gray">Bayar Total (<NumberFormatter value={venue?.starting_price} />) sekarang.</Text>
                                        </Stack>
                                        <Checkbox/>
                                    </Flex>
                                    <Divider />
                                    <Flex component="label" justify="space-between" align="center" gap={15} className={`cursor-pointer`}>
                                        <Stack gap={0}>
                                            <Text>Bayar Sebagian</Text>
                                            <Text maw={400} c="gray">Bayar sebagian (<NumberFormatter value={100000} />) sekarang. Lakukan pelunasan sebelum tanggal 12 Aug 2024.</Text>
                                        </Stack>
                                        <Checkbox/>
                                    </Flex>
                                </Stack>
                            </DropdownComponent>

                            <DropdownComponent title={'Metode Pembayaran'} icon={'si:money-line'} defaultOpened>

                            </DropdownComponent>

                            {/* <DropdownComponent title="Metode Pembayaran" icon="fluent:payment-16-filled">
                                <UnstyledButton>
                                        <Card p={10} radius="md" bg="gray.1">
                                            <Flex gap={20} align="center">
                                                <AspectRatio className={`shrink-0`}>
                                                    <Image w={50} h={50} bg="gray.1" radius="sm" />
                                                </AspectRatio>

                                                <Text w="100%">PAYMENT_METHOD_NAME</Text>

                                                <Icon icon="uiw:circle-check" className={`text-[#194E9E] text-[24px] shrink-0 mr-[10px]`} />
                                            </Flex>
                                        </Card>
                                    </UnstyledButton>
                            </DropdownComponent> */}
                        </Stack>

                        <Stack gap={10} className={`!flex-grow md:!max-w-[400px]`}>
                            <Card withBorder radius={10} p={20}>
                                <Stack gap={20}>
                                    <Flex gap={10} align="center">
                                        <Icon icon="lucide:info" className={`text-primary-base text-[20px]`}/>
                                        <Text fw={600}>Detail Pembayaran</Text>
                                    </Flex>

                                    <Stack>
                                        {orderSummary.array.map((e, i) => (
                                            <Flex justify="space-between" key={i}>
                                                <Text fw={e[0] == "Total Pembayaran" ? 600 : 400}>{e[0]}</Text>
                                                <Text fw={e[0] == "Total Pembayaran" ? 600 : 400}><NumberFormatter value={e[1]}/></Text>
                                            </Flex>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Card>
                        </Stack>
                    </Flex>
                </Stack>

                <Card pos="fixed" className={`bottom-0 left-0 w-[100vw] border-t !border-primary-light`} py={10} withBorder>
                    <Container size="lg" w="100%">
                        <Flex justify="end" w="100%">
                            <Button
                                loading={loading.includes('checkout')}
                                // onClick={handleCheckout}
                                className={`uppercase`}
                                color="#194E9E"
                                rightSection={<Icon icon="uiw:check" />}
                                radius="xl">
                                Proses Pembayaran
                            </Button>
                        </Flex>
                    </Container>
                </Card>
            </Container>
        </div>
    );
}

const DropdownComponent = ({ defaultOpened, children, title, icon }: PropsWithChildren<{ defaultOpened?: boolean, title: string, icon: string }>) => {
    const [opened, setOpened] = useState<boolean>(defaultOpened ?? false);

    return (
        <>
            <Card bg="white" radius={10} withBorder>
                <Stack>
                    <Flex justify="space-between" align="center" gap={20} onClick={() => setOpened(!opened)} className={`cursor-pointer`}>
                        <Flex align="center" gap={10}>
                            <Icon icon={icon} className={`text-[20px] text-[#194E9E]`} />
                            <Text>{title}</Text>
                        </Flex>

                        <ActionIcon variant="transparent" c="gray">
                            <Icon icon="uiw:down" className={`transition-transform ${opened ? '!rotate-180' : ''}`}/>
                        </ActionIcon>
                    </Flex>

                    <Stack className={`${opened ? '' : '!hidden'}`} p={5}>
                        <Divider />
                        {children}
                    </Stack>
                </Stack>
            </Card>
        </>
    );
};