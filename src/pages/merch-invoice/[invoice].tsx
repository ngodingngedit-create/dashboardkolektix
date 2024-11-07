import { Icon } from '@iconify/react/dist/iconify.js';
import { Box, Card, Container, Divider, Flex, Image, NumberFormatter, ScrollArea, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import _ from 'lodash';
import Link from 'next/link';

export default function Invoice() {

    return (
        <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
            <Container px={0} className={`py-[44px] md:py-[100px]`}>
                <Card p={0} radius={0} className={`!shadow-lg`}>
                    <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
                        <Stack gap={30}>
                            <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
                                <Flex gap={15} align="center">
                                    <Icon icon="iconamoon:invoice-light" className={`text-[48px]`}/>
                                    <Stack gap={0}>
                                        <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>Invoice Pesanan</Title>
                                        <Text size='sm'>No. 123ABCDEF</Text>
                                    </Stack>
                                </Flex>

                                <Stack gap={5} className={`items-start md:!items-end`}>
                                    <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
                                        <Flex align="center" gap={10}>
                                            <Text size="sm" c="gray.8">Status Pembayaran :</Text>
                                            <Flex gap={5} align="center">
                                                <Icon icon="uiw:circle-check" className={`text-[18px] text-green-600`} />
                                                <Text size="md" fw={400}>Berhasil</Text>
                                            </Flex>
                                        </Flex>
                                    </Card>
                                    <Text size="xs">Selesaikan pembayaran dalam 23:59:59</Text>
                                </Stack>
                            </Flex>
                        </Stack>
                    </Card>
                    <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>

                        <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
                            <Stack gap={10}>
                                <Text fw={600} c="gray.8">Informasi Pemesan</Text>
                                <Card withBorder>
                                    <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>Nama Pemesan</Text>
                                            <Text size="sm" fw={600}>Nama Pemesan Nama</Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>Email Pemesan</Text>
                                            <Text size="sm">email@mail.com</Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>Tanggal Pesanan Dibuat</Text>
                                            <Text size="sm">13:00 12 Januari 2025</Text>
                                        </Stack>
                                    </SimpleGrid>
                                </Card>
                            </Stack>

                            <Stack gap={10} className={`md:max-w-[300px]`}>
                                <Text fw={600} c="gray.8">Total Pembayaran</Text>
                                <Card bg="gray.1">
                                    <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
                                        <Text size="xl" fw={600}><NumberFormatter value={1000000}/></Text>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>Metode Pembayaran</Text>
                                            <Text size="sm">XENDIT</Text>
                                        </Stack>
                                        <Link href="#">
                                            <Text size="xs" className={`hover:underline !text-primary-base`}>Buka Halaman Pembayaran</Text>
                                        </Link>
                                    </SimpleGrid>
                                </Card>
                            </Stack>
                        </Flex>

                        <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
                            <Stack gap={10}>
                                <Text fw={600} c="gray.8">Informasi Pengiriman</Text>
                                <Card withBorder>
                                    <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>Dikirim Dari</Text>
                                            <Text size="sm">JAWA BARAT, BANDUNG</Text>
                                        </Stack>
                                        <Box />
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>Nama Penerima</Text>
                                            <Text size="sm" fw={600}>Nama Penerima Nama</Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300}>No. Telp Penerima</Text>
                                            <Text size="sm">0812 1234 1234</Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="xs" fw={300} mb={5}>Alamat Pengiriman</Text>
                                            <Text size="xs">DKI JAKARTA, JAKARTA UTARA, 40052</Text>
                                            <Text size="xs">Jl. Raya Kebayoran No. 3, RT 03 RW 04, Kelurahan Kebayoran Lama</Text>
                                        </Stack>
                                    </SimpleGrid>
                                </Card>
                            </Stack>
                        </Flex>

                        <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
                            <Stack gap={10} className={`[&_*]:!text-[14px]`}>
                                <Text fw={600} c="gray.8">Detail Pesanan</Text>
                                <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
                                    <Table withRowBorders={false} horizontalSpacing="md" miw={600}>
                                        <Table.Thead>
                                            <Table.Th>No</Table.Th>
                                            <Table.Th>Produk</Table.Th>
                                            <Table.Th>Harga</Table.Th>
                                            <Table.Th>QTY</Table.Th>
                                            <Table.Th>Total</Table.Th>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            <Table.Tr>
                                                <Table.Td>1</Table.Td>
                                                <Table.Td>
                                                    <Flex gap={15} className={`!py-[5px]`}>
                                                        <Image src="#" w={48} h={48} bg="gray.1" radius={5} className={`shrink-0`} />
                                                        <Stack miw={400} gap={0}>
                                                            <Text>Product Name Product Name Product Name</Text>
                                                            <Text size="sm" c="gray.7">Varian: Size S</Text>
                                                        </Stack>
                                                    </Flex>
                                                </Table.Td>
                                                <Table.Td><NumberFormatter value={200000} /></Table.Td>
                                                <Table.Td>1</Table.Td>
                                                <Table.Td><NumberFormatter value={200000} /></Table.Td>
                                            </Table.Tr>
                                            <Table.Tr>
                                                <Table.Td>2</Table.Td>
                                                <Table.Td>
                                                    <Flex gap={15} className={`!py-[5px]`}>
                                                        <Image src="#" w={48} h={48} bg="gray.1" radius={5} className={`shrink-0`} />
                                                        <Stack miw={400} gap={0}>
                                                            <Text>Product Name Product Name Product Name</Text>
                                                            <Text size="sm" c="gray.7">Varian: Size S</Text>
                                                        </Stack>
                                                    </Flex>
                                                </Table.Td>
                                                <Table.Td><NumberFormatter value={200000} /></Table.Td>
                                                <Table.Td>1</Table.Td>
                                                <Table.Td><NumberFormatter value={200000} /></Table.Td>
                                            </Table.Tr>
                                            <Table.Tr className={`border-t border-primary-base`}>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td>
                                                    <Text className={`!pt-[10px]`}>Biaya Admin</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text className={`!pt-[10px]`}><NumberFormatter value={2000} /></Text>
                                                </Table.Td>
                                            </Table.Tr>
                                            <Table.Tr>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td>PPN (11%)</Table.Td>
                                                <Table.Td><NumberFormatter value={110000} /></Table.Td>
                                            </Table.Tr>
                                            <Table.Tr className={`[&_*]:!font-[600]`}>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td>Total Pembayaran</Table.Td>
                                                <Table.Td><NumberFormatter value={1000000} /></Table.Td>
                                            </Table.Tr>
                                        </Table.Tbody>
                                    </Table>
                                </Box>
                            </Stack>
                        </Flex>

                    </Stack>
                </Card>
            </Container>
        </div>
    );
}