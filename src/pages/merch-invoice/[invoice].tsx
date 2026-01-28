import { Icon } from "@iconify/react/dist/iconify.js";
import { Box, Card, Container, Divider, Flex, Image, NumberFormatter, ScrollArea, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import _ from "lodash";
import Link from "next/link";
import { InvoiceResponse } from "./type";
import { useEffect, useMemo, useState } from "react";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import { useRouter } from "next/router";
import { City, Province } from "../dashboard/profile/address";

export default function Invoice() {
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<InvoiceResponse>();
  const [loading, setLoading] = useListState<string>();
  const router = useRouter();
  const { invoice } = router.query;
  const [city, setCity] = useState<City>();
  const [province, setProvince] = useState<Province>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getData();
  }, [isClient, invoice]);

  useEffect(() => {
    getProvinceCity();
  }, [data]);

  const getData = async () => {
    if (invoice) {
      await fetch<any, InvoiceResponse>({
        url: `order-product-invoice/${invoice}`,
        method: "GET",
        data: {},
        before: () => setLoading.append("getdata"),
        success: ({ data }) => {
          if (data) {
            setData(data);
          }
        },
        complete: () => setLoading.filter((e) => e != "getdata"),
        error: () => {},
      });
    }
  };

  const getProvinceCity = async () => {
    if (!data?.address?.city_id || !data?.address?.province_id) return;

    await fetch<any, City>({
      url: `city/${data.address.city_id}`,
      method: "GET",
      success: ({ data: cityData }) => cityData && setCity(cityData),
    });

    await fetch<any, Province>({
      url: `province/${data.address.province_id}`,
      method: "GET",
      success: ({ data: provinceData }) => provinceData && setProvince(provinceData),
    });
  };

  const iconStatus: { [key: string]: string } = {
    expired: "ooui:alert",
    pending: "icon-park-solid:time",
    verified: "uiw:circle-check",
  };

  const summaryPrice = useMemo(() => {
    const admin = 2000;
    const totalProductPrice = data?.detail.reduce((q, n) => q + (Boolean(n.product_varian_id) ? parseInt(n.variant.price) : parseInt(n.product.price)), 0);
    const courier = parseInt(data?.courier?.price ?? "0");
    const ppn = (courier + admin + (totalProductPrice ?? 0)) * 0.11;

    return { ppn, admin, courier };
  }, [data]);

  // Fungsi untuk format date yang konsisten di server dan client
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";

    // Gunakan UTC time untuk konsistensi antara server dan client
    const date = new Date(dateString);

    // Format manual tanpa toLocaleString untuk menghindari timezone differences
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");

    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
  };

  // Tampilkan loading jika masih di server
  if (!isClient) {
    return (
      <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
        <Container px={0} className={`py-[44px] md:py-[100px]`}>
          <Card p={0} radius={8} className={`!shadow-lg`}>
            <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
              <Flex justify="center" align="center" h={200}>
                <Text>Memuat invoice...</Text>
              </Flex>
            </Card>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
      <Container px={0} className={`py-[44px] md:py-[100px]`}>
        <Card p={0} radius={8} className={`!shadow-lg`}>
          <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
            <Stack gap={30}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
                <Flex gap={15} align="center">
                  <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
                  <Stack gap={0}>
                    <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
                      Invoice Pesanan
                    </Title>
                    <Text size="sm">{invoice}</Text>
                  </Stack>
                </Flex>

                <Stack gap={5} className={`items-start md:!items-end`}>
                  <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
                    <Flex align="center" gap={10}>
                      <Text size="sm" c="gray.8">
                        Status Pembayaran :
                      </Text>
                      <Flex gap={5} align="center">
                        <Icon
                          icon={iconStatus[data?.payment_status?.toLowerCase() ?? "pending"]}
                          className={`
                            text-[18px]
                            ${data?.payment_status?.toLowerCase() == "expired" && "text-red-400"}
                            ${data?.payment_status?.toLowerCase() == "pending" && "text-yellow-500"}
                            ${data?.payment_status?.toLowerCase() == "verified" && "text-green-500"}
                          `}
                        />
                        <Text size="md" fw={400}>
                          {data?.payment_status?.toLowerCase() == "expired" && <>Expired</>}
                          {data?.payment_status?.toLowerCase() == "pending" && <>Pending</>}
                          {data?.payment_status?.toLowerCase() == "verified" && <>Berhasil</>}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Stack>
              </Flex>
            </Stack>
          </Card>
          <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
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
                        {data?.user?.name || "-"}
                      </Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Email Pemesan
                      </Text>
                      <Text size="sm">{data?.user?.email || "-"}</Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Tanggal Pesanan Dibuat
                      </Text>
                      <Text size="sm" suppressHydrationWarning>
                        {formatDate(data?.created_at)}
                      </Text>
                    </Stack>
                  </SimpleGrid>
                </Card>
              </Stack>

              <Stack gap={10} className={`md:max-w-[300px]`}>
                <Text fw={600} c="gray.8">
                  Total Pembayaran
                </Text>
                <Card bg="gray.1">
                  <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
                    <Text size="xl" fw={600}>
                      <NumberFormatter value={data?.grandtotal || 0} />
                    </Text>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Metode Pembayaran
                      </Text>
                      <Text size="sm" className="capitalize">
                        {data?.payment_method || "-"}
                      </Text>
                    </Stack>
                    {data?.xendit_url && (
                      <Link href={data.xendit_url} target="_blank">
                        <Text size="xs" className={`hover:underline !text-primary-base`}>
                          Buka Halaman Pembayaran
                        </Text>
                      </Link>
                    )}
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
                        {data?.address?.nama_penerima || "-"}
                      </Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        No. Telp Penerima
                      </Text>
                      <Text size="sm">{data?.address?.phone || "-"}</Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300} mb={5}>
                        Alamat Pengiriman
                      </Text>
                      <Text size="xs">
                        {province?.name || "-"}, {city?.name || "-"}, {data?.address?.zipcode || "-"}
                      </Text>
                      <Text size="xs">{data?.address?.address_detail || "-"}</Text>
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
                      {data?.detail?.map((e, i) => (
                        <Table.Tr key={i}>
                          <Table.Td>{i + 1}</Table.Td>
                          <Table.Td>
                            <Flex gap={15} className={`!py-[5px]`}>
                              <Image src={e.product?.product_image?.[0]?.image_url || "#"} w={48} h={48} bg="gray.1" radius={5} className={`shrink-0`} />
                              <Stack miw={400} gap={0}>
                                <Text>{e.product?.product_name || "-"}</Text>
                                {Boolean(e.product_varian_id) && (
                                  <Text size="sm" c="gray.7">
                                    Varian: {e.variant?.varian_name || "-"}
                                  </Text>
                                )}
                              </Stack>
                            </Flex>
                          </Table.Td>
                          <Table.Td>
                            <NumberFormatter value={parseInt(Boolean(e.product_varian_id) ? e.variant?.price || "0" : e.product?.price || "0")} />
                          </Table.Td>
                          <Table.Td>{e.qty || 0}</Table.Td>
                          <Table.Td>
                            <NumberFormatter value={parseInt(Boolean(e.product_varian_id) ? e.variant?.price || "0" : e.product?.price || "0") * (e.qty || 0)} />
                          </Table.Td>
                        </Table.Tr>
                      ))}

                      {/* Summary rows */}
                      {/* <Table.Tr className={`border-t border-primary-base`}>
                        <Table.Td colSpan={3}></Table.Td>
                        <Table.Td>
                          <Text className={`!pt-[10px]`}>Biaya Pengiriman</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text className={`!pt-[10px]`}>
                            <NumberFormatter value={summaryPrice.courier} />
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                       */}
                      <Table.Tr>
                        <Table.Td colSpan={3}></Table.Td>
                        <Table.Td>
                          <Text>Biaya Admin</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text>
                            <NumberFormatter value={summaryPrice.admin} />
                          </Text>
                        </Table.Td>
                      </Table.Tr>

                      <Table.Tr className={`[&_*]:!font-[600]`}>
                        <Table.Td colSpan={3}></Table.Td>
                        <Table.Td>Total Pembayaran</Table.Td>
                        <Table.Td>
                          <NumberFormatter value={data?.grandtotal || 0} />
                        </Table.Td>
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
