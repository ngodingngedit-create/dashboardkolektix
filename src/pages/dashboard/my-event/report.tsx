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

import { Badge, Box, Card, Flex, Select, Stack, Text, Title, Pagination, Button, SegmentedControl, Input, ActionIcon, Modal, Group } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { useDidUpdate, useListState } from "@mantine/hooks";
import moment from "moment";
import TableData from "@/components/TableData";
import { EticketListResponse, EventListResponse, TransactionListResponse, TransactionStatusResponse, EventData } from "./type";
import fetch from "@/utils/fetch";
import useLoggedUser from "@/utils/useLoggedUser";
import axios from "axios";
import config from "@/Config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPaperPlane, faPencil, faPlus } from "@fortawesome/free-solid-svg-icons";

const Merch = () => {
  const [isr, setIsr] = useState(false);
  const [dataList, setDataList] = useState<TransactionListResponse[]>([]);
  const [dataListEticket, setDataListEticket] = useState<EticketListResponse[]>();
  const [eventList, setEventList] = useState<EventListResponse[]>();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number>();
  const [selectedTicket, setSelectedTicket] = useState<string>("all");
  const [availableTickets, setAvailableTickets] = useState<{ value: string; label: string }[]>([{ value: "all", label: "Semua Tiket" }]);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>();
  const [loading, setLoading] = useListState<string>();
  const [loadingEventData, setLoadingEventData] = useState(false);
  const [transactionSegment, setTransactionSegment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const user = useLoggedUser();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [slug, setSlug] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("transaksi");
  const [searchValue, setSearchValue] = useState<string>("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionListResponse | null>(null);

  useEffect(() => {
    setIsr(true);
  }, []);

  useDidUpdate(() => {
    getEvent();
  }, [isr]);

  useDidUpdate(() => {
    getData();
  }, [selectedEvent]);

  useDidUpdate(() => {
    if (selectedEvent && eventList) {
      const currentEvent = eventList.find((e) => e.id === selectedEvent);
      if (currentEvent?.has_event_ticket?.length) {
        const ticketsArray = currentEvent.has_event_ticket.map((ticket) => ({
          value: String(ticket.id),
          label: ticket.name,
        }));
        setAvailableTickets([{ value: "all", label: "Semua Tiket" }, ...ticketsArray]);
      } else {
        setAvailableTickets([{ value: "all", label: "Semua Tiket" }]);
      }
    }
  }, [selectedEvent, eventList]);

  const getEventData = async () => {
    setLoadingEventData(true);
    try {
      const response = await axios.get(`${config.wsUrl}event-view-list-by-slug/${slug}`);
      if (response && response.data) {
        setEventData(response.data);
        console.log(response.data, "Event data loaded");
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setLoadingEventData(false);
    }
  };

  useEffect(() => {
    if (slug) {
      getEventData();
    }
  }, [slug]);

  const getEvent = async () => {
    await fetch<any, EventListResponse[]>({
      url: "event",
      method: "GET",
      before: () => setLoading.append(""),
      success: ({ data }) => {
        if (data?.length) {
          const _data = data.filter((e) => parseInt(e.creator_id) == user?.has_creator?.id);
          setEventList(_data);
          if (_data.length > 0) {
            setSelectedEvent(_data[0].id);
            const selectedEventSlug = _data[0].slug || "";
            setSlug(selectedEventSlug);
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
        if (data?.length) {
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
          const dataArray = Array.isArray(data) ? data : [];
          setDataList(dataArray);
        } else {
          setDataList([]);
        }
      },
      complete: () => setLoading.filter((e) => e != "getdata"),
    });

    await fetch<any, TransactionListResponse[]>({
      url: `checkin-list/${selectedEvent}`,
      method: "GET",
      before: () => setLoading.append("getdata"),
      success: () => { },
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

  const listTransaksi = useMemo(() => {
    if (!Array.isArray(dataList)) return [];

    let filteredData = dataList.filter((e) => (transactionSegment === "all" ? true : e.type_transaction === transactionSegment));

    // Filter berdasarkan tiket yang dipilih
    if (selectedTicket !== "all") {
      const selectedTicketId = parseInt(selectedTicket);

      filteredData = filteredData.filter((transaction) => {
        return transaction.tickets?.some((ticket) => parseInt(ticket.event_ticket_id) === selectedTicketId);
      });
    }

    // Filter berdasarkan status
    if (selectedStatus !== "all") {
      const statusId = parseInt(selectedStatus);
      filteredData = filteredData.filter((transaction) => transaction.transaction_status_id === statusId);
    }

    // Filter berdasarkan pencarian
    if (searchValue) {
      const searchTerm = searchValue.toLowerCase();
      filteredData = filteredData.filter((transaction) => {
        const invoiceNo = transaction.invoice_no?.toLowerCase() || "";
        const email = transaction.identities?.find((id) => id.is_pemesan == 1)?.email?.toLowerCase() || "";
        const name = transaction.identities?.find((id) => id.is_pemesan == 1)?.full_name?.toLowerCase() || "";

        return invoiceNo.includes(searchTerm) || email.includes(searchTerm) || name.includes(searchTerm);
      });
    }

    return filteredData.map((e) => {
      // Cari nama tiket dari transaksi
      let ticketName = "-";
      let ticketPrice = 0;
      const identity = e.identities?.find((id) => id.is_pemesan == 1);

      // Ambil data tiket dari properti tickets
      if (e.tickets && e.tickets.length > 0) {
        const ticketNames = e.tickets.map((ticket) => ticket.has_event_ticket?.name || "-");
        ticketName = ticketNames.join(", ");

        // Hitung total harga tiket (price * qty)
        ticketPrice = e.tickets.reduce((sum, ticket) => {
          return sum + (ticket.price || 0) * (ticket.qty_ticket || 0);
        }, 0);
      }

      return {
        ...e, // Simpan data asli untuk akses di action
        No: null, // Akan diisi oleh TableData withRowIndex
        Nama: identity?.full_name || "-",
        Email: identity?.email ?? "-",
        "No. Invoice": e.invoice_no,
        "Nama Tiket": ticketName,
        "Harga Tiket": `Rp ${ticketPrice.toLocaleString("id-ID")}`,
        Status: (
          <Badge className={`[&_*]:!text-[12px] [&_*]:!font-[600]`} size="sm" color={transactionStatus?.find((z) => z.id == e.transaction_status_id)?.bgcolor}>
            {transactionStatus?.find((z) => z.id == e.transaction_status_id)?.name}
          </Badge>
        ),
        Action: (
          <Group gap="xs">
            <ActionIcon
              color="blue"
              variant="subtle"
              onClick={() => {
                setSelectedTransaction(e);
                setViewModalOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faEye} size="sm" />
            </ActionIcon>
          </Group>
        ),
      };
    });
  }, [dataList, transactionSegment, transactionStatus, selectedTicket, selectedStatus, searchValue]);

  // Statistik untuk tab Data Penjualan
  const salesStatistics = useMemo(() => {
    const filtered = listTransaksi;

    // Hitung total tiket yang sudah dibayar (Verified)
    const totalTickets = dataList.reduce((sum, transaction) => {
      if (transaction.payment_status === "Verified" && transaction.tickets) {
        return sum + transaction.tickets.reduce((ticketSum, ticket) => ticketSum + (ticket.qty_ticket || 0), 0);
      }
      return sum;
    }, 0);

    const pendingTransactions = eventData?.total_unpaid || 0;

    // Hitung total checkin dari data eticket
    const totalCheckin = dataListEticket?.filter((e) => Boolean(e.is_checkin)).length || 0;

    return {
      totalSales: eventData?.total_price_sell_online || 0,
      pendingTransactions,
      totalTickets,
      totalTransactions: filtered.length,
      totalCheckin,
    };
  }, [listTransaksi, eventData, dataList, dataListEticket]);

  const paginatedListTransaksi = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return listTransaksi.slice(startIndex, endIndex);
  }, [listTransaksi, page, itemsPerPage]);

  const totalPages = Math.ceil(listTransaksi.length / itemsPerPage);

  const exportToExcel = () => {
    if (!listTransaksi || listTransaksi.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    try {
      const headers = ["No", "Nama", "Email", "No. Invoice", "Nama Tiket", "Harga Tiket", "Status"];
      const csvRows = [
        headers.join(","),
        ...listTransaksi.map((item, index) => {
          let statusText = "Unknown";
          if (item.Status?.props?.children) {
            statusText = item.Status.props.children;
          }

          const ticketName = item["Nama Tiket"] || "-";
          // Remove "Rp " from the price for cleaner export
          const ticketPrice = item["Harga Tiket"]?.replace("Rp ", "") || "0";

          return [
            index + 1,
            `"${item.Nama}"`,
            `"${item.Email}"`,
            `"${item["No. Invoice"]}"`,
            `"${ticketName}"`,
            ticketPrice,
            `"${statusText}"`,
          ].join(",");
        }),
      ];

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
    if (!Array.isArray(dataList)) return [];

    return dataList
      ?.filter((e) => e.payment_status == "Verified")
      .flatMap((e) => e.identities || [])
      .map((e) => ({
        "No. Identitas": e.nik,
        "Nama Pemesan": e.full_name,
        Email: e.email,
        "No. Telepon": e.no_telp,
        "Tanggal Dibuat": moment(e.created_at).format("HH:mm:ss DD MMM YYYY"),
      }));
  }, [dataList]);

  const listCheckin = useMemo(() => {
    if (!Array.isArray(dataListEticket)) return [];

    return dataListEticket
      ?.filter((e) => Boolean(e.is_checkin))
      .map((e) => ({
        Eticket: e.eticket_number,
        "Waktu Checkin": moment(e.checkin_date).format("HH:mm:ss DD MMM YYYY"),
      }));
  }, [dataListEticket]);

  const listVoucher = useMemo(() => {
    // Ini contoh data voucher - Anda perlu mengganti dengan data asli dari API
    return [
      { "Kode Voucher": "DISKON50", "Nama Pemesan": "John Doe", "Email": "john@example.com", "Status": "Terpakai", "Tanggal Pakai": "2024-01-15" },
      { "Kode Voucher": "SALE30", "Nama Pemesan": "Jane Smith", "Email": "jane@example.com", "Status": "Aktif", "Tanggal Pakai": "-" },
    ];
  }, []);

  if (!isr) return <></>;

  return (
    <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
      <Flex gap={20} justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">
            Report Event
          </Title>
          <Text size="sm" c="gray">
            Halaman Report Event Anda
          </Text>
        </Stack>
      </Flex>

      <Flex gap={20} justify="flex-end" align="center">
        <Flex align="center" gap={10}>
          <Text size="sm">Pilih Event</Text>
          <Select
            value={String(selectedEvent)}
            data={eventList?.map((e) => ({ value: String(e.id), label: e.name }))}
            onChange={(e) => {
              if (e) {
                const selectedId = parseInt(e);
                setSelectedEvent(selectedId);
                setSelectedTicket("all");
                setSelectedStatus("all");
                setPage(1);
                setSearchValue("");

                const selectedEventItem = eventList?.find((item) => item.id === selectedId);
                if (selectedEventItem?.slug) {
                  setSlug(selectedEventItem.slug);
                }
              }
            }}
            placeholder="Pilih event"
            style={{ width: 200 }}
          />
        </Flex>

        <Flex align="center" gap={10}>
          <Text size="sm">Pilih Tiket</Text>
          <Select
            value={selectedTicket}
            data={availableTickets}
            onChange={(value) => {
              if (value) {
                setSelectedTicket(value);
                setPage(1);
              }
            }}
            placeholder="Pilih tiket"
            style={{ width: 200 }}
            disabled={availableTickets.length <= 1}
          />
        </Flex>

        <Button
          onClick={exportToExcel}
          variant="outline"
          leftSection={<FontAwesomeIcon icon={faDownload} />}
          disabled={!listTransaksi || listTransaksi.length === 0}
        >
          Export Excel
        </Button>
      </Flex>

      {/* Tabs Container */}
      <Card className={`!overflow-auto`} p={20} withBorder>
        {/* Statistics Cards - Hanya tampil di tab Data Penjualan */}
        {selectedTab === "transaksi" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Card 1: Total Penjualan */}
            <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penjualan</h3>
              <p className="text-lg font-semibold mt-1 text-gray-800">Rp {salesStatistics.totalSales.toLocaleString("id-ID")}</p>
            </div>

            {/* Card 2: Transaksi Pending */}
            <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi Pending</h3>
              <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.pendingTransactions} transaksi</p>
            </div>

            {/* Card 3: Total Tiket */}
            <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tiket</h3>
              <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalTickets} tiket</p>
            </div>

            {/* Card 4: Total Checkin */}
            <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Checkin</h3>
              <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalCheckin} checkin</p>
            </div>

            {/* Card 5: Total Transaksi */}
            <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Transaksi</h3>
              <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalTransactions} transaksi</p>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${selectedTab === "transaksi" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setSelectedTab("transaksi")}
            >
              Data Penjualan
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${selectedTab === "pemesan" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setSelectedTab("pemesan")}
            >
              Data Pemesan
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${selectedTab === "checkin" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setSelectedTab("checkin")}
            >
              Data Checkin
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${selectedTab === "voucher" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setSelectedTab("voucher")}
            >
              Data Voucher
            </button>
          </div>
        </div>

        {/* Tab Content - Data Penjualan */}
        {selectedTab === "transaksi" && (
          <div className="pt-4">
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

                <Select
                  placeholder="Filter Status"
                  value={selectedStatus}
                  onChange={(value) => {
                    if (value) {
                      setSelectedStatus(value);
                      setPage(1);
                    }
                  }}
                  data={[
                    { value: "all", label: "Semua Status" },
                    ...(transactionStatus?.map((status) => ({
                      value: String(status.id),
                      label: status.name
                    })) || [])
                  ]}
                  style={{ width: 200 }}
                  leftSection={<FontAwesomeIcon icon={faDownload} size="sm" />}
                />

                <Input
                  placeholder="Cari Nama, Email, atau Invoice..."
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setPage(1);
                  }}
                  style={{ width: 300 }}
                  leftSection={<FontAwesomeIcon icon={faDownload} size="sm" />}
                />
              </Flex>
            </Flex>

            <TableData
              loading={loading.includes("getdata")}
              tablekey="transaksi"
              withRowIndex
              data={paginatedListTransaksi}
              mapData={(e) => ({
                No: null,
                Nama: e.Nama,
                Email: e.Email,
                "No. Invoice": e["No. Invoice"],
                "Nama Tiket": e["Nama Tiket"],
                "Harga Tiket": e["Harga Tiket"],
                Status: e.Status,
                Action: e.Action
              })}
            />

            {listTransaksi.length > 0 && (
              <Flex justify="space-between" align="center" mt="md">
                <Text size="sm" c="dimmed">
                  Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, listTransaksi.length)} of {listTransaksi.length} entries
                </Text>
                <Pagination value={page} onChange={setPage} total={totalPages} radius="md" size="sm" withEdges />
              </Flex>
            )}
          </div>
        )}

        {/* Tab Content - Data Pemesan */}
        {selectedTab === "pemesan" && (
          <div className="pt-4">
            <Box mt={20}>
              <TableData loading={loading.includes("getdata")} tablekey="pemesan" withRowIndex data={listPemesan} mapData={(e) => ({ ...e })} />
            </Box>
          </div>
        )}

        {/* Tab Content - Data Checkin */}
        {selectedTab === "checkin" && (
          <div className="pt-4">
            <Box mt={20}>
              <TableData loading={loading.includes("getdata")} tablekey="checkin" withRowIndex data={listCheckin} mapData={(e) => ({ ...e })} />
            </Box>
          </div>
        )}

        {/* Tab Content - Data Voucher */}
        {selectedTab === "voucher" && (
          <div className="pt-4">
            <Box mt={20}>
              <TableData loading={loading.includes("getdata")} tablekey="voucher" withRowIndex data={listVoucher} mapData={(e) => ({ ...e })} />
            </Box>
          </div>
        )}
      </Card>

      {/* Modal View Detail Transaksi */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Detail Transaksi"
        size="lg"
      >
        {selectedTransaction && (
          <Stack gap="md">
            <Flex justify="space-between">
              <Text fw={500}>No. Invoice:</Text>
              <Text>{selectedTransaction.invoice_no}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fw={500}>Nama:</Text>
              <Text>{selectedTransaction.identities?.find((id) => id.is_pemesan == 1)?.full_name || "-"}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fw={500}>Email:</Text>
              <Text>{selectedTransaction.identities?.find((id) => id.is_pemesan == 1)?.email || "-"}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fw={500}>Status:</Text>
              <Badge color={transactionStatus?.find((z) => z.id == selectedTransaction.transaction_status_id)?.bgcolor}>
                {transactionStatus?.find((z) => z.id == selectedTransaction.transaction_status_id)?.name}
              </Badge>
            </Flex>
            <Flex justify="space-between">
              <Text fw={500}>Tipe Transaksi:</Text>
              <Text>{selectedTransaction.type_transaction}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fw={500}>Total Price:</Text>
              <Text fw={600}>Rp {(selectedTransaction.total_price || 0).toLocaleString("id-ID")}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fw={500}>Tanggal Transaksi:</Text>
              <Text>{selectedTransaction.payment_date ? moment(selectedTransaction.payment_date).format("DD MMM YYYY HH:mm:ss") : "-"}</Text>
            </Flex>

            {/* Detail Tiket */}
            {selectedTransaction.tickets && selectedTransaction.tickets.length > 0 && (
              <div>
                <Text fw={500} mb="xs">Detail Tiket:</Text>
                {selectedTransaction.tickets.map((ticket, index) => (
                  <Card key={index} withBorder mb="xs" p="sm">
                    <Flex justify="space-between">
                      <Text size="sm">{ticket.has_event_ticket?.name || "Tiket"}</Text>
                      <Text size="sm">Qty: {ticket.qty_ticket}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text size="sm">Harga per Tiket: Rp {(ticket.price || 0).toLocaleString("id-ID")}</Text>
                      <Text size="sm" fw={500}>Subtotal: Rp {((ticket.price || 0) * (ticket.qty_ticket || 0)).toLocaleString("id-ID")}</Text>
                    </Flex>
                  </Card>
                ))}
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default Merch;