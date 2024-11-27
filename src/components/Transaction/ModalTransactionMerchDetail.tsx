import { City, Province } from "@/pages/dashboard/profile/address";
import { InvoiceResponse } from "@/pages/merch-invoice/type";
import fetch from "@/utils/fetch";
import { Box, Card, Flex, Image, NumberFormatter, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import moment from "moment";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ComponentProps = {
    data?: InvoiceResponse;
};

export default function ModalTransactionMerchDetail({ data }: Readonly<ComponentProps>) {
    const [city, setCity] = useState<City>();
    const [province, setProvince] = useState<Province>();

    useEffect(() => {
        getProvinceCity();
    }, [data]);

    const getProvinceCity = async () => {
        await fetch<any, City>({
            url: `city/${data?.address?.city_id}`,
            method: 'GET',
            success: ({ data }) => data && setCity(data),
        });
        await fetch<any, City>({
            url: `province/${data?.address?.province_id}`,
            method: 'GET',
            success: ({ data }) => data && setProvince(data),
        });
    }

    const summaryPrice = useMemo(() => {
        const admin = 2000;
        const totalProductPrice = data?.detail.reduce((q, n) => q + (Boolean(n.product_varian_id) ? parseInt(n.variant.price) : parseInt(n.product.price)), 0);
        const courier = parseInt(data?.courier.price ?? '0');
        const ppn = (courier + admin + (totalProductPrice ?? 0)) * 0.11;

        return { ppn, admin, courier }
    }, [data]);

    return (
        <Stack p={10} gap={30}>
            <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
                <Stack gap={10}>
                    <Text fw={600} c="gray.8">
                        Informasi Pemesan
                    </Text>
                    <Card withBorder>
                        <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                            <Stack gap={0}>
                                <Text size="xs" fw={300}>
                                    Nama Pemesan
                                </Text>
                                <Text size="sm" fw={600}>
                                    {data?.user.name}
                                </Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" fw={300}>
                                    Email Pemesan
                                </Text>
                                <Text size="sm">{data?.user.email}</Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" fw={300}>
                                    Tanggal Pesanan Dibuat
                                </Text>
                                <Text size="sm">{moment(data?.created_at).format('HH:mm, DD MMMM YYYY')}</Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" fw={300}>
                                    Status Pesanan
                                </Text>
                                <Text size="sm" fw={600}>
                                    Dikirim
                                </Text>
                            </Stack>
                        </SimpleGrid>
                    </Card>
                </Stack>
            </Flex>

            <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
                <Stack gap={10}>
                    <Text fw={600} c="gray.8">
                        Informasi Pengiriman
                    </Text>
                    <Card withBorder>
                        <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                            <Stack gap={0}>
                                <Text size="xs" fw={300}>
                                    Dikirim Dari
                                </Text>
                                <Text size="sm">JAWA BARAT, BANDUNG</Text>
                            </Stack>
                            <Box />
                            <Stack gap={0}>
                                <Text size="xs" fw={300}>
                                    Nama Penerima
                                </Text>
                                <Text size="sm" fw={600}>
                                    {data?.address?.nama_penerima}
                                </Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" fw={300}>
                                    No. Telp Penerima
                                </Text>
                                <Text size="sm">{data?.address?.phone}</Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" fw={300} mb={5}>
                                    Alamat Pengiriman
                                </Text>
                                <Text size="xs">{province?.name}, {city?.name}, {data?.address?.zipcode}</Text>
                                <Text size="xs">{data?.address?.address_detail}</Text>
                            </Stack>
                        </SimpleGrid>
                    </Card>
                </Stack>
            </Flex>
            <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
                <Stack gap={10} className={`[&_*]:!text-[14px]`}>
                    <Text fw={600} c="gray.8">
                        Detail Pesanan
                    </Text>
                    <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
                        <Table withRowBorders={false} horizontalSpacing="md" miw={600}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>No</Table.Th>
                                    <Table.Th>Produk</Table.Th>
                                    <Table.Th>Harga</Table.Th>
                                    <Table.Th>QTY</Table.Th>
                                    <Table.Th>Total</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data?.detail.map((e, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>{i + 1}</Table.Td>
                                        <Table.Td>
                                            <Flex gap={15} className={`!py-[5px]`}>
                                                <Image src={e.product.product_image[0].image_url ?? '#'} w={48} h={48} bg="gray.1" radius={5} className={`shrink-0`} />
                                                <Stack miw={400} gap={0}>
                                                    <Text>{e.product.product_name}</Text>
                                                    {Boolean(e.product_varian_id) && (
                                                        <Text size="sm" c="gray.7">
                                                            Varian: {e.variant.varian_name}
                                                        </Text>
                                                    )}
                                                </Stack>
                                            </Flex>
                                        </Table.Td>
                                        <Table.Td>
                                            <NumberFormatter value={parseInt(Boolean(e.product_varian_id) ? e.variant.price : e.product.price)} />
                                        </Table.Td>
                                        <Table.Td>{e.qty}</Table.Td>
                                        <Table.Td>
                                            <NumberFormatter value={parseInt(Boolean(e.product_varian_id) ? e.variant.price : e.product.price) * e.qty} />
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                                <Table.Tr className={`border-t border-primary-base`}>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td>
                                        <Text className={`!pt-[10px]`}>Biaya Pengiriman</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text className={`!pt-[10px]`}>
                                            <NumberFormatter value={summaryPrice.courier} />
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td>
                                        <Text>Biaya Admin</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text>
                                            <NumberFormatter value={summaryPrice.admin} />
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td>PPN (11%)</Table.Td>
                                    <Table.Td>
                                        <NumberFormatter value={summaryPrice.ppn} />
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr className={`[&_*]:!font-[600]`}>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td>Total Pembayaran</Table.Td>
                                    <Table.Td>
                                        <NumberFormatter value={data?.grandtotal} />
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </Box>
                </Stack>
            </Flex>
        </Stack>
    );
}