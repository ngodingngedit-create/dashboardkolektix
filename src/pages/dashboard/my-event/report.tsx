// import { Get } from "@/utils/REST";
// import { Badge, Box, Card, Flex, LoadingOverlay, ScrollArea, SegmentedControl, Select, Stack, Table, Tabs, Text, Title } from "@mantine/core";
// import React, { useEffect, useMemo, useState } from "react";
// import { useDidUpdate, useListState } from "@mantine/hooks";
// import _ from "lodash";
// import moment from "moment";
// import { Tab } from "@nextui-org/react";
// import TableData from "@/components/TableData";
// import { EticketListResponse, EventListResponse, TransactionListResponse, TransactionStatusResponse } from "./type";
// import fetch from "@/utils/fetch";
// import useLoggedUser from "@/utils/useLoggedUser";

// const Merch = () => {
//   const [isr, setIsr] = useState(false);
//   const [dataList, setDataList] = useState<TransactionListResponse[]>();
//   const [dataListEticket, setDataListEticket] = useState<EticketListResponse[]>();
//   const [eventList, setEventList] = useState<EventListResponse[]>();
//   const [selectedEvent, setSelectedEvent] = useState<number>();
//   const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>();
//   const [loading, setLoading] = useListState<string>();
//   const [transactionSegment, setTransactionSegment] = useState<string>("all");
//   const user = useLoggedUser();

//   useEffect(() => {
//     setIsr(true);
//   }, []);

//   useDidUpdate(() => {
//     getEvent();
//   }, [isr]);

//   useDidUpdate(() => {
//     getData();
//   }, [selectedEvent]);

//   const getEvent = async () => {
//     await fetch<any, EventListResponse[]>({
//       url: "event",
//       method: "GET",
//       before: () => setLoading.append(""),
//       success: ({ data }) => {
//         if ((data?.length ?? 0) > 0 && data) {
//           const _data = data.filter((e) => parseInt(e.creator_id) == user?.has_creator?.id);
//           setEventList(_data);
//           setSelectedEvent(_data[0].id);
//         }
//       },
//       complete: () => setLoading.filter((e) => e != ""),
//     });
//     await fetch<any, any>({
//       url: "transaction-statuses",
//       method: "GET",
//       before: () => setLoading.append(""),
//       success: (_data) => {
//         const data = _data as TransactionStatusResponse[];
//         if ((data?.length ?? 0) > 0 && data) {
//           setTransactionStatus(data);
//         }
//       },
//       complete: () => setLoading.filter((e) => e != ""),
//     });
//   };

//   const getData = async () => {
//     await fetch<any, TransactionListResponse[]>({
//       url: `list-transaction-by-event?event_id=${selectedEvent}`,
//       method: "GET",
//       before: () => setLoading.append("getdata"),
//       success: ({ data }) => data && setDataList(data),
//       complete: () => setLoading.filter((e) => e != "getdata"),
//     });
//     await fetch<any, TransactionListResponse[]>({
//       url: `checkin-list/${selectedEvent}`,
//       method: "GET",
//       before: () => setLoading.append("getdata"),
//       success: ({ data }) => data && setDataList(data),
//       complete: () => setLoading.filter((e) => e != "getdata"),
//     });
//     await fetch<any, EticketListResponse[]>({
//       url: `eticket/showcheckin/${selectedEvent}`,
//       method: "GET",
//       before: () => setLoading.append("getdata"),
//       success: (data) => data && setDataListEticket(data as EticketListResponse[]),
//       complete: () => setLoading.filter((e) => e != "getdata"),
//     });
//   };

//   const listPemesan = useMemo(() => {
//     return dataList
//       ?.filter((e) => e.payment_status == "Verified")
//       .map((e) => e.identities)
//       .flat()
//       .map((e) => ({
//         "No. Identitas": e.nik,
//         "Nama Pemesan": e.full_name,
//         Email: e.email,
//         "No. Telepon": e.no_telp,
//         "Tanggal Dibuat": moment(e.created_at).format("HH:mm:ss DD MMM YYYY"),
//       }));
//   }, [dataList]);

//   const listTransaksi = useMemo(() => {
//     return dataList
//       ?.filter((e) => (transactionSegment == "all" ? true : e.type_transaction == transactionSegment))
//       .map((e) => ({
//         ID: e.id,
//         Email: e.identities.find((e) => e.is_pemesan == 1)?.email ?? "-",
//         "No. Invoice": e.invoice_no,
//         "Waktu Dikirim": moment(e.payment_date).format("HH:mm:ss DD MMM YYYY"),
//         Status: (
//           <Badge className={`[&_*]:!text-[12px] [&_*]:!font-[600]`} size="sm" color={transactionStatus?.find((z) => z.id == e.transaction_status_id)?.bgcolor}>
//             {transactionStatus?.find((z) => z.id == e.transaction_status_id)?.name}
//           </Badge>
//         ),
//         Type: <Text className={`capitalize`}>{e.type_transaction}</Text>,
//       }));
//   }, [dataList, transactionSegment]);

//   const listCheckin = useMemo(() => {
//     return dataListEticket
//       ?.filter((e) => Boolean(e.is_checkin))
//       .map((e) => ({
//         Eticket: e.eticket_number,
//         "Waktu Checkin": moment(e.checkin_date).format("HH:mm:ss DD MMM YYYY"),
//       }));
//   }, [dataListEticket]);

//   if (!isr) return <></>;

//   return (
//     <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
//       <Flex gap={20} justify="space-between">
//         <Stack gap={0}>
//           <Title order={1} size="h2">
//             Report Event
//           </Title>
//           <Text size="sm" c="gray">
//             Halaman Report Event Anda
//           </Text>
//         </Stack>

//         <Flex align="center" gap={10}>
//           <Text size="sm">Pilih Event</Text>
//           <Select value={String(selectedEvent)} data={eventList?.map((e) => ({ value: String(e.id), label: e.name }))} onChange={(e) => e && setSelectedEvent(parseInt(e))} />
//         </Flex>
//       </Flex>

//       <Tabs defaultValue="pemesan">
//         <Tabs.List>
//           <Tabs.Tab value="transaksi">Data Penjualan</Tabs.Tab>
//           <Tabs.Tab value="pemesan">Data Pemesan</Tabs.Tab>
//           <Tabs.Tab value="checkin">Data Checkin</Tabs.Tab>
//           <Tabs.Tab value="invitation">Data Invitation</Tabs.Tab>
//         </Tabs.List>

//         <Tabs.Panel value="pemesan">
//           <Box mt={20}>
//             <TableData loading={loading.includes("getdata")} tablekey="pemesan" withRowIndex data={listPemesan ?? []} mapData={(e) => ({ ...e })} />
//           </Box>
//         </Tabs.Panel>
//         <Tabs.Panel value="transaksi">
//           <Box mt={20}>
//             <TableData
//               loading={loading.includes("getdata")}
//               headers={
//                 <SegmentedControl
//                   value={transactionSegment}
//                   onChange={(e) => setTransactionSegment(e)}
//                   data={[
//                     { label: "All", value: "all" },
//                     { label: "Online", value: "online" },
//                     { label: "Offline", value: "offline" },
//                   ]}
//                   radius="xl"
//                   color="#0b387c"
//                 />
//               }
//               tablekey="transaksi"
//               withRowIndex
//               data={listTransaksi ?? []}
//               mapData={(e) => ({ ...e })}
//             />
//           </Box>
//         </Tabs.Panel>
//         <Tabs.Panel value="checkin">
//           <Box mt={20}>
//             <TableData loading={loading.includes("getdata")} tablekey="transaksi" withRowIndex data={listCheckin ?? []} mapData={(e) => ({ ...e })} />
//           </Box>
//         </Tabs.Panel>
//         <Tabs.Panel value="invitation">
//           <Box mt={20}>
//             <TableData loading={loading.includes("getdata")} tablekey="transaksi" withRowIndex data={[]} mapData={(e: any) => ({ ...e })} />
//           </Box>
//         </Tabs.Panel>
//       </Tabs>
//     </div>
//   );
// };

// export default Merch;
import { Get } from "@/utils/REST";
import { Badge, Box, Card, Flex, LoadingOverlay, ScrollArea, SegmentedControl, Select, Stack, Table, Tabs, Text, Title, Pagination, Button } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { useDidUpdate, useListState } from "@mantine/hooks";
import _ from "lodash";
import moment from "moment";
import { Tab } from "@nextui-org/react";
import TableData from "@/components/TableData";
import { EticketListResponse, EventListResponse, TransactionListResponse, TransactionStatusResponse } from "./type";
import fetch from "@/utils/fetch";
import useLoggedUser from "@/utils/useLoggedUser";

const Merch = () => {
  const [isr, setIsr] = useState(false);
  const [dataList, setDataList] = useState<TransactionListResponse[]>();
  const [dataListEticket, setDataListEticket] = useState<EticketListResponse[]>();
  const [eventList, setEventList] = useState<EventListResponse[]>();
  const [selectedEvent, setSelectedEvent] = useState<number>();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>();
  const [loading, setLoading] = useListState<string>();
  const [transactionSegment, setTransactionSegment] = useState<string>("all");
  const user = useLoggedUser();

  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Statistic state
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    pendingTransactions: 0,
    totalTickets: 0,
  });

  useEffect(() => {
    setIsr(true);
  }, []);

  useDidUpdate(() => {
    getEvent();
  }, [isr]);

  useDidUpdate(() => {
    getData();
  }, [selectedEvent]);

  const getEvent = async () => {
    await fetch<any, EventListResponse[]>({
      url: "event",
      method: "GET",
      before: () => setLoading.append(""),
      success: ({ data }) => {
        if ((data?.length ?? 0) > 0 && data) {
          const _data = data.filter((e) => parseInt(e.creator_id) == user?.has_creator?.id);
          setEventList(_data);
          if (_data.length > 0) {
            setSelectedEvent(_data[0].id);
          }
        }
      },
      complete: () => setLoading.filter((e) => e != ""),
    });
    await fetch<any, any>({
      url: "transaction-statuses",
      method: "GET",
      before: () => setLoading.append(""),
      success: (_data) => {
        const data = _data as TransactionStatusResponse[];
        if ((data?.length ?? 0) > 0 && data) {
          setTransactionStatus(data);
        }
      },
      complete: () => setLoading.filter((e) => e != ""),
    });
  };

  const getData = async () => {
    if (!selectedEvent) return;

    await fetch<any, TransactionListResponse[]>({
      url: `list-transaction-by-event?event_id=${selectedEvent}`,
      method: "GET",
      before: () => setLoading.append("getdata"),
      success: ({ data }) => {
        if (data) {
          setDataList(data);
          calculateStatistics(data);
        }
      },
      complete: () => setLoading.filter((e) => e != "getdata"),
    });

    await fetch<any, TransactionListResponse[]>({
      url: `checkin-list/${selectedEvent}`,
      method: "GET",
      before: () => setLoading.append("getdata"),
      success: ({ data }) => data && setDataList(data),
      complete: () => setLoading.filter((e) => e != "getdata"),
    });

    await fetch<any, EticketListResponse[]>({
      url: `eticket/showcheckin/${selectedEvent}`,
      method: "GET",
      before: () => setLoading.append("getdata"),
      success: (data) => data && setDataListEticket(data as EticketListResponse[]),
      complete: () => setLoading.filter((e) => e != "getdata"),
    });
  };

  const calculateStatistics = (data: TransactionListResponse[]) => {
    let totalSales = 0;
    let pendingTransactions = 0;
    let totalTickets = 0;

    data.forEach((transaction) => {
      const amount = (transaction as any).total || (transaction as any).amount || (transaction as any).total_amount || 0;

      if (transaction.payment_status === "Verified") {
        totalSales += amount;
      }

      if (transaction.payment_status === "Pending" || transaction.transaction_status_id === 1) {
        pendingTransactions++;
      }

      totalTickets += transaction.identities?.length || 0;
    });

    setStatistics({
      totalSales,
      pendingTransactions,
      totalTickets,
    });
  };

  // Fungsi untuk export ke Excel/CSV
  const exportToExcel = () => {
    if (!listTransaksi || listTransaksi.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    try {
      // Header CSV
      const headers = ["ID", "Email", "No. Invoice", "Waktu Dikirim", "Status", "Type"];

      // Data CSV - ambil text dari React elements
      const csvRows = [
        headers.join(","),
        ...listTransaksi.map((item) => {
          // Extract text dari React element Status
          let statusText = "Unknown";
          if (item.Status && item.Status.props && item.Status.props.children) {
            statusText = item.Status.props.children;
          }

          // Extract text dari React element Type
          let typeText = "Unknown";
          if (item.Type && item.Type.props && item.Type.props.children) {
            typeText = item.Type.props.children;
          }

          return [item.ID, `"${item.Email}"`, `"${item["No. Invoice"]}"`, `"${item["Waktu Dikirim"]}"`, `"${statusText}"`, `"${typeText}"`].join(",");
        }),
      ];

      // Buat blob dan download
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split("T")[0];
      const eventName = eventList?.find((e) => e.id === selectedEvent)?.name || "event";

      link.href = url;
      link.download = `report-${eventName}-${timestamp}.csv`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Terjadi kesalahan saat mengeksport data");
    }
  };

  const listPemesan = useMemo(() => {
    return dataList
      ?.filter((e) => e.payment_status == "Verified")
      .map((e) => e.identities)
      .flat()
      .map((e) => ({
        "No. Identitas": e.nik,
        "Nama Pemesan": e.full_name,
        Email: e.email,
        "No. Telepon": e.no_telp,
        "Tanggal Dibuat": moment(e.created_at).format("HH:mm:ss DD MMM YYYY"),
      }));
  }, [dataList]);

  const listTransaksi = useMemo(() => {
    let filteredData = dataList?.filter((e) => (transactionSegment == "all" ? true : e.type_transaction == transactionSegment)) || [];

    return filteredData.map((e) => ({
      ID: e.id,
      Email: e.identities.find((e) => e.is_pemesan == 1)?.email ?? "-",
      "No. Invoice": e.invoice_no,
      "Waktu Dikirim": moment(e.payment_date).format("HH:mm:ss DD MMM YYYY"),
      Status: (
        <Badge className={`[&_*]:!text-[12px] [&_*]:!font-[600]`} size="sm" color={transactionStatus?.find((z) => z.id == e.transaction_status_id)?.bgcolor}>
          {transactionStatus?.find((z) => z.id == e.transaction_status_id)?.name}
        </Badge>
      ),
      Type: <Text className={`capitalize`}>{e.type_transaction}</Text>,
    }));
  }, [dataList, transactionSegment, transactionStatus]);

  const paginatedListTransaksi = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return listTransaksi.slice(startIndex, endIndex);
  }, [listTransaksi, page, itemsPerPage]);

  const totalPages = Math.ceil(listTransaksi.length / itemsPerPage);

  const listCheckin = useMemo(() => {
    return dataListEticket
      ?.filter((e) => Boolean(e.is_checkin))
      .map((e) => ({
        Eticket: e.eticket_number,
        "Waktu Checkin": moment(e.checkin_date).format("HH:mm:ss DD MMM YYYY"),
      }));
  }, [dataListEticket]);

  if (!isr) return <></>;

  return (
    <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card withBorder padding="lg" radius="md">
          <Text fw={500} size="sm" c="dimmed">
            Total Penjualan
          </Text>
          <Title order={3} mt="xs">
            Rp {statistics.totalSales.toLocaleString("id-ID")}
          </Title>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Text fw={500} size="sm" c="dimmed">
            Transaksi Pending
          </Text>
          <Title order={3} mt="xs">
            {statistics.pendingTransactions}
          </Title>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Text fw={500} size="sm" c="dimmed">
            Total Tiket
          </Text>
          <Title order={3} mt="xs">
            {statistics.totalTickets}
          </Title>
        </Card>
      </div>

      <Flex gap={20} justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">
            Report Event
          </Title>
          <Text size="sm" c="gray">
            Halaman Report Event Anda
          </Text>
        </Stack>

        <Flex align="center" gap={10}>
          <Text size="sm">Pilih Event</Text>
          <Select
            value={String(selectedEvent)}
            data={eventList?.map((e) => ({ value: String(e.id), label: e.name }))}
            onChange={(e) => {
              if (e) {
                setSelectedEvent(parseInt(e));
                setPage(1);
              }
            }}
            placeholder="Pilih event"
            style={{ width: 200 }}
          />
          <Button onClick={exportToExcel} variant="outline" disabled={!listTransaksi || listTransaksi.length === 0}>
            Export Excel
          </Button>
        </Flex>
      </Flex>

      <Tabs defaultValue="pemesan">
        <Tabs.List>
          <Tabs.Tab value="transaksi">Data Penjualan</Tabs.Tab>
          <Tabs.Tab value="pemesan">Data Pemesan</Tabs.Tab>
          <Tabs.Tab value="checkin">Data Checkin</Tabs.Tab>
          <Tabs.Tab value="invitation">Data Invitation</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pemesan">
          <Box mt={20}>
            <TableData loading={loading.includes("getdata")} tablekey="pemesan" withRowIndex data={listPemesan ?? []} mapData={(e) => ({ ...e })} />
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="transaksi">
          <Box mt={20}>
            {/* Filter Controls */}
            <Flex justify="space-between" align="center" mb="md" wrap="wrap" gap="md">
              <Flex gap="md" align="center" wrap="wrap">
                <SegmentedControl
                  value={transactionSegment}
                  onChange={(e) => {
                    setTransactionSegment(e);
                    setPage(1);
                  }}
                  data={[
                    { label: "All", value: "all" },
                    { label: "Online", value: "online" },
                    { label: "Offline", value: "offline" },
                  ]}
                  radius="xl"
                  color="#0b387c"
                />
              </Flex>

              <Flex gap="md" align="center">
                <Text size="sm">Items per page:</Text>
                <Select
                  value={String(itemsPerPage)}
                  onChange={(value) => {
                    setItemsPerPage(Number(value));
                    setPage(1);
                  }}
                  data={[
                    { value: "5", label: "5" },
                    { value: "10", label: "10" },
                    { value: "20", label: "20" },
                    { value: "50", label: "50" },
                  ]}
                  style={{ width: 100 }}
                />
              </Flex>
            </Flex>

            {/* Table without extra props */}
            <TableData loading={loading.includes("getdata")} tablekey="transaksi" withRowIndex data={paginatedListTransaksi ?? []} mapData={(e) => ({ ...e })} />

            {/* Pagination Controls */}
            {listTransaksi.length > 0 && (
              <Flex justify="space-between" align="center" mt="md">
                <Text size="sm" c="dimmed">
                  Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, listTransaksi.length)} of {listTransaksi.length} entries
                </Text>

                <Pagination value={page} onChange={setPage} total={totalPages} radius="md" size="sm" withEdges />
              </Flex>
            )}
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="checkin">
          <Box mt={20}>
            <TableData loading={loading.includes("getdata")} tablekey="checkin" withRowIndex data={listCheckin ?? []} mapData={(e) => ({ ...e })} />
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="invitation">
          <Box mt={20}>
            <TableData loading={loading.includes("getdata")} tablekey="invitation" withRowIndex data={[]} mapData={(e: any) => ({ ...e })} />
          </Box>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default Merch;
