import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, AspectRatio, Box, Button, Card, Container, Divider, Flex, Image, NumberFormatter, ScrollArea, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import _ from "lodash";
import Link from "next/link";
import React, { use, useEffect, useMemo, useState } from "react";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import { useRouter } from "next/router";
import moment from "moment";
import { City, Province } from "../dashboard/profile/address";
import { TransactionProps } from "@/utils/globalInterface";
import { formatDate, formatYear } from "@/utils/useFormattedDate";
import { TransactionStatusResponse } from "../dashboard/my-event/type";
import config from "@/Config";
import { modals } from "@mantine/modals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket } from "@fortawesome/free-solid-svg-icons";

interface FormTicket {
  event_id: number;
  event_ticket_id: number;
  name: string;
  price: number;
  subtotal_price: number;
  qty_ticket: number;
  payment_status: string;
  seat_number?: string[];
  ticket_fee?: number;
  is_insurance?: number;
  insurance_amount?: number;
  insurance_require?: number;
}

export default function Invoice() {
  const [isr, setIsr] = useState(false);
  const [data, setData] = useState<TransactionProps>();
  const [loading, setLoading] = useListState<string>();
  const router = useRouter();
  const { invoice } = router.query;
  const [city, setCity] = useState<City>();
  const [province, setProvince] = useState<Province>();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>();
  const [ticket, setTicket] = useState<FormTicket>();

  useEffect(() => {
    getData();
  }, [invoice]);

  // Di dalam component Invoice, tambahkan useEffect untuk mengecek data ticket
  useEffect(() => {
    if (data?.tickets && data.tickets.length > 0) {
      console.log("=== DATA TICKET ===");

      data.tickets.forEach((ticket, index) => {
        console.log(`Ticket ${index + 1}:`, {
          name: ticket.has_event_ticket?.name,
          qty: ticket.qty_ticket,
          price: ticket.has_event_ticket?.price,
          is_insurance: ticket.is_insurance,
          insurance_amount: ticket.insurance_amount,
          insurance_require: ticket.insurance_require,
        });
      });

      // Atau jika hanya butuh satu ticket (contoh: ticket pertama)
      if (data.tickets[0]) {
        console.log("Detail ticket pertama:", {
          is_insurance: data.tickets[0].is_insurance,
          insurance_amount: data.tickets[0].insurance_amount,
          insurance_require: data.tickets[0].insurance_require,
        });
      }
    }
  }, [data]);

  const getData = async () => {
    if (!invoice) {
      console.error("Invoice is missing");
      return;
    }

    try {
      await fetch<any, TransactionProps>({
        url: `transaction-finish?external_id=${invoice}`,
        method: "GET",
        data: {},
        before: () => setLoading.append("getdata"),
        success: ({ data }) => {
          if (data) {
            setData(data);
          }
        },
        complete: () => setLoading.filter((e) => e !== "getdata"),
        error: () => {
          modals.open({
            centered: true,
            closeOnClickOutside: false,
            withCloseButton: false,
            children: (
              <Stack gap={10}>
                <Text ta="center">Data tidak ditemukan</Text>
                <Button
                  onClick={() => {
                    modals.closeAll();
                    router.push("/");
                  }}
                >
                  Ke Halaman Utama
                </Button>
              </Stack>
            ),
          });
        },
      });

      await fetch<any, any>({
        url: "transaction-statuses",
        method: "GET",
        success: (_data) => {
          const data = _data as TransactionStatusResponse[];
          if ((data?.length ?? 0) > 0 && data) {
            setTransactionStatus(data);
          }
        },
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const iconStatus: { [key: string]: string } = {
    FAILED: "ooui:alert",
    EXPIRED: "ooui:alert",
    Pending: "icon-park-solid:time",
    PAID: "uiw:circle-check",
  };

  // const summaryPrice = useMemo(() => {
  //     const admin = 2000;
  //     const totalProductPrice = data?.detail.reduce((q, n) => q + (Boolean(n.product_varian_id) ? parseInt(n.variant.price) : parseInt(n.product.price)), 0);
  //     const courier = parseInt(data?.courier.price ?? '0');
  //     const ppn = (courier + admin + (totalProductPrice ?? 0)) * 0.11;

  //     return { ppn, admin, courier }
  // }, [data]);

  //const dataPemesan = useMemo(() => {
  //  return undefined;
  //  // return data?.identities.find(e => e.);
  //}, [data]);

  const transStatus = useMemo(() => {
    return transactionStatus ? transactionStatus.find((e) => e.id == data?.transaction_status_id) : null;
  }, [data, transactionStatus]);

  useEffect(() => {
    if (data) {
      console.log("Data:", data);
    }
  }, [data]);

  const [createdAtText, setCreatedAtText] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [insuranceChecked, setInsuranceChecked] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Jika ada asuransi di transaction atau event
    if (data?.is_insurance === 1 || data?.has_event?.insurance_required === 1) {
      setInsuranceChecked(true);
    } else {
      setInsuranceChecked(false);
    }
  }, [data?.is_insurance, data?.has_event?.insurance_required]);

  useEffect(() => {
    if (data?.created_at && isMounted) {
      setCreatedAtText(moment(data.created_at).format("HH:mm, DD MMMM YYYY"));
    }
  }, [data, isMounted]);

  // Hitung total asuransi berdasarkan semua ticket
  const calculateInsuranceTotal = () => {
    // Cek apakah ada asuransi di transaction
    if (data?.is_insurance === 1 && data?.insurance_amount && data?.total_qty) {
      return data.insurance_amount * data.total_qty;
    }
    return 0;
  };

  // Cek apakah ada asuransi di salah satu ticket
  const hasInsurance = (data?.insurance_amount ?? 0) > 0;

  return (
    <div className={`bg-primary-light mt-[-10px] pt-[20px] pb-[30px] mb-[-20px]`}>
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
                          icon={iconStatus[transStatus?.name ?? "Pending"]}
                          className={`
                                                        text-[18px]
                                                    `}
                          style={{
                            color: transStatus?.bgcolor,
                          }}
                        />
                        <Text size="md" fw={400} c={transStatus?.bgcolor} className={`capitalize`}>
                          {transStatus?.name}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Stack>
              </Flex>
            </Stack>
          </Card>

          <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
            <Flex gap={20} className={`[&>*]:flex-grow flex-col md:flex-row`}>
              <Stack className={`min-w-[250px]`}>
                <AspectRatio ratio={16 / 5}>
                  <Image src={data?.has_event.image_url} alt={data?.has_event.name || "Event Image"} bg="gray" radius={10} />
                </AspectRatio>
              </Stack>

              <Card withBorder className={`!border-dashed shrink-0 md:max-w-[250px]`} radius={10}>
                <Stack gap={10}>
                  <Text fw={600} size="lg">
                    {data?.has_event.name}
                  </Text>

                  <Flex align="center" gap={10}>
                    <Icon icon="solar:calendar-bold" className={`shrink-0 text-primary-base text-[20px]`} />
                    <Text size="sm" c="gray">
                      {data?.has_event && `${formatDate(data?.has_event.start_date)} ${data?.has_event.start_date !== data?.has_event.end_date ? "- " + formatDate(data?.has_event.end_date) : ""} ${formatYear(data?.has_event.end_date)}`}
                    </Text>
                  </Flex>

                  <Flex align="center" gap={10}>
                    <Icon icon="tabler:clock-filled" className={`shrink-0 text-primary-base text-[20px]`} />
                    <Text size="sm" c="gray">
                      {data?.has_event?.start_time.toString()} - {data?.has_event?.end_time.toString()}
                    </Text>
                  </Flex>

                  <Flex align="start" gap={10}>
                    <Icon icon="tdesign:location-filled" className={`shrink-0 text-primary-base text-[20px]`} />
                    <Text size="sm" c="gray">
                      {data?.has_event.location_name}
                    </Text>
                  </Flex>

                  <Alert radius={10} mt={10} className={`md:hidden`}>
                    {transStatus?.description}
                  </Alert>

                  {transStatus?.name == "PAID" && (
                    <Button component={Link} href={`${config.wsUrl}transaction-document/${invoice}`} target="_blank" mt={5} rightSection={<Icon icon="uiw:download" />}>
                      Unduh Tiket
                    </Button>
                  )}
                </Stack>
              </Card>
            </Flex>

            <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
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
                        {data?.identities.find((e) => e.is_pemesan == 1)?.full_name}
                      </Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Email Pemesan
                      </Text>
                      <Text size="sm">{data?.identities.find((e) => e.is_pemesan == 1)?.email}</Text>
                    </Stack>
                    <Stack gap={0}>
                      <Text size="xs" fw={300}>
                        Tanggal Pesanan Dibuat
                      </Text>
                      <Text size="sm">{createdAtText ?? "Memuat waktu..."}</Text>
                    </Stack>
                  </SimpleGrid>
                </Card>
              </Stack>

              {(data?.grandtotal ?? 0) > 0 && (
                <Stack gap={10} className={`md:max-w-[250px] shrink-0`}>
                  <Text fw={600} c="gray.8">
                    Total Pembayaran
                  </Text>
                  <Card bg="gray.1">
                    <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
                      {/* Bagian Asuransi - DIATAS */}
                      {insuranceChecked && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-semibold text-blue-700">Anda Sudah Tercover Oleh Asuransi</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Text size="xl" fw={600}>
                        {(data?.grandtotal ?? 0) > 0 ? (
                          <NumberFormatter value={data?.grandtotal ?? 999999} />
                        ) : (
                          <Text fw={600} c="green">
                            Free
                          </Text>
                        )}
                      </Text>

                      {(data?.grandtotal ?? 0) > 0 && (
                        <>
                          <Stack gap={0}>
                            <Text size="xs" fw={300}>
                              Metode Pembayaran
                            </Text>
                            <Text size="sm" className="capitalize">
                              {data?.payment_method.payment_name ?? "PAYMENT_METHOD"}
                            </Text>
                          </Stack>
                          <Link href={data?.xendit_url ?? "#"} target="_blank">
                            <Text size="xs" className={`hover:underline !text-primary-base`}>
                              Buka Halaman Pembayaran
                            </Text>
                          </Link>
                        </>
                      )}
                    </SimpleGrid>
                  </Card>
                </Stack>
              )}
            </Flex>

            <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
              <Stack gap={10}>
                <Text fw={600} c="gray.8">
                  Informasi Voucher
                </Text>
                <Card withBorder>
                  <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[15px]`}>
                    {data?.has_transaction_voucher.map((voucher, index) => (
                      <React.Fragment key={index}>
                        <Stack key={index} gap={0}>
                          <Flex align="center" gap={10}>
                            <Text size="md" fw={600}>
                              Kode Voucher:
                            </Text>
                            <Text size="sm" fw={300}>
                              {voucher.voucher_code}
                            </Text>
                          </Flex>
                          <Flex align="center" gap={10}>
                            <Text size="md" fw={600}>
                              Diskon:
                            </Text>
                            <Text size="sm" fw={300}>
                              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(voucher.voucher_amount) || 0)}
                            </Text>
                          </Flex>
                        </Stack>
                        {index < data?.has_transaction_voucher.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </SimpleGrid>
                </Card>
              </Stack>
            </Flex>

            <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
              <Stack gap={10} className={`lg:max-w-[630px] shrink-0`}>
                <Text fw={600} c="gray.8">
                  Informasi Tiket
                </Text>
                <Card withBorder>
                  <SimpleGrid className={`!grid-cols-1 !gap-[15px]`}>
                    {data?.tickets.map((ticket, index) => (
                      <Stack key={index} gap={0}>
                        <Text size="md" fw={600}>
                          <FontAwesomeIcon icon={faTicket} className="text-primary" /> {ticket.has_event_ticket.name}
                        </Text>
                        <Text size="sm" fw={300}>
                          {ticket.qty_ticket} Tiket x {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(ticket.has_event_ticket.price ?? 0)}
                        </Text>
                      </Stack>
                    ))}
                  </SimpleGrid>
                </Card>
              </Stack>
            </Flex>

            <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
              <Stack gap={10} className={`lg:max-w-[630px] shrink-0`}>
                <Text fw={600} c="gray.8">
                  Informasi Merchandise
                </Text>
                <Card withBorder>
                  <SimpleGrid className={`!grid-cols-1 !gap-[15px]`}>
                    {data?.transaction_merches && data.transaction_merches.length > 0 ? (
                      data.transaction_merches.map((merch, index) => (
                        <Stack key={index} gap={0}>
                          <Flex align="center" gap={10}>
                            <Icon
                              icon="tabler:shirt"
                              className={`text-primary-base text-[20px] shrink-0`}
                            />
                            <Stack gap={0} className="flex-grow">
                              <Text size="md" fw={600}>
                                {merch.noted || "Merchandise"}
                              </Text>
                              <Text size="sm" fw={300}>
                                {merch.qty} Item × {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR"
                                }).format(Number(merch.price) || 0)}
                              </Text>
                              {merch.noted && (
                                <Text size="xs" fw={300} c="gray" mt={5}>
                                  Catatan: {merch.noted}
                                </Text>
                              )}
                            </Stack>
                            <Text size="md" fw={600}>
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR"
                              }).format(Number(merch.subtotal) || 0)}
                            </Text>
                          </Flex>
                        </Stack>
                      ))
                    ) : (
                      <Flex align="center" gap={10} py={10}>
                        <Icon
                          icon="tabler:shirt-off"
                          className={`text-gray-400 text-[20px]`}
                        />
                        <Text size="sm" c="gray">
                          Tidak ada merchandise yang dibeli
                        </Text>
                      </Flex>
                    )}
                  </SimpleGrid>
                </Card>
              </Stack>
            </Flex>

            <Stack>
              <Text fw={600} c="gray.8">
                Syarat dan Ketentuan
              </Text>
              <Box px={20}>
                <div dangerouslySetInnerHTML={{ __html: data?.has_event.term_condition ?? "" }}></div>
              </Box>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </div>
  );
}