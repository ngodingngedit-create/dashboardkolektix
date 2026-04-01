// // import { Get } from "@/utils/REST";
// // import { Badge, Box, Card, Flex, LoadingOverlay, ScrollArea, SegmentedControl, Select, Stack, Table, Tabs, Text, Title } from "@mantine/core";
// // import React, { useEffect, useMemo, useState } from "react";
// // import { useDidUpdate, useListState } from "@mantine/hooks";
// // import _ from "lodash";
// // import moment from "moment";
// // import { Tab } from "@nextui-org/react";
// // import TableData from "@/components/TableData";
// // import { EticketListResponse, EventListResponse, TransactionListResponse, TransactionStatusResponse } from "./type";
// // import fetch from "@/utils/fetch";
// // import useLoggedUser from "@/utils/useLoggedUser";

// // const Merch = () => {
// //   const [isr, setIsr] = useState(false);
// //   const [dataList, setDataList] = useState<TransactionListResponse[]>();
// //   const [dataListEticket, setDataListEticket] = useState<EticketListResponse[]>();
// //   const [eventList, setEventList] = useState<EventListResponse[]>();
// //   const [selectedEvent, setSelectedEvent] = useState<number>();
// //   const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>();
// //   const [loading, setLoading] = useListState<string>();
// //   const [transactionSegment, setTransactionSegment] = useState<string>("all");
// //   const user = useLoggedUser();

// //   useEffect(() => {
// //     setIsr(true);
// //   }, []);

// //   useDidUpdate(() => {
// //     getEvent();
// //   }, [isr]);

// //   useDidUpdate(() => {
// //     getData();
// //   }, [selectedEvent]);

// //   const getEvent = async () => {
// //     await fetch<any, EventListResponse[]>({
// //       url: "event",
// //       method: "GET",
// //       before: () => setLoading.append(""),
// //       success: ({ data }) => {
// //         if ((data?.length ?? 0) > 0 && data) {
// //           const _data = data.filter((e) => parseInt(e.creator_id) == user?.has_creator?.id);
// //           setEventList(_data);
// //           setSelectedEvent(_data[0].id);
// //         }
// //       },
// //       complete: () => setLoading.filter((e) => e != ""),
// //     });
// //     await fetch<any, any>({
// //       url: "transaction-statuses",
// //       method: "GET",
// //       before: () => setLoading.append(""),
// //       success: (_data) => {
// //         const data = _data as TransactionStatusResponse[];
// //         if ((data?.length ?? 0) > 0 && data) {
// //           setTransactionStatus(data);
// //         }
// //       },
// //       complete: () => setLoading.filter((e) => e != ""),
// //     });
// //   };

// //   const getData = async () => {
// //     await fetch<any, TransactionListResponse[]>({
// //       url: `list-transaction-by-event?event_id=${selectedEvent}`,
// //       method: "GET",
// //       before: () => setLoading.append("getdata"),
// //       success: ({ data }) => data && setDataList(data),
// //       complete: () => setLoading.filter((e) => e != "getdata"),
// //     });
// //     await fetch<any, TransactionListResponse[]>({
// //       url: `checkin-list/${selectedEvent}`,
// //       method: "GET",
// //       before: () => setLoading.append("getdata"),
// //       success: ({ data }) => data && setDataList(data),
// //       complete: () => setLoading.filter((e) => e != "getdata"),
// //     });
// //     await fetch<any, EticketListResponse[]>({
// //       url: `eticket/showcheckin/${selectedEvent}`,
// //       method: "GET",
// //       before: () => setLoading.append("getdata"),
// //       success: (data) => data && setDataListEticket(data as EticketListResponse[]),
// //       complete: () => setLoading.filter((e) => e != "getdata"),
// //     });
// //   };

// //   const listPemesan = useMemo(() => {
// //     return dataList
// //       ?.filter((e) => e.payment_status == "Verified")
// //       .map((e) => e.identities)
// //       .flat()
// //       .map((e) => ({
// //         "No. Identitas": e.nik,
// //         "Nama Pemesan": e.full_name,
// //         Email: e.email,
// //         "No. Telepon": e.no_telp,
// //         "Tanggal Dibuat": moment(e.created_at).format("HH:mm:ss DD MMM YYYY"),
// //       }));
// //   }, [dataList]);

// //   const listTransaksi = useMemo(() => {
// //     return dataList
// //       ?.filter((e) => (transactionSegment == "all" ? true : e.type_transaction == transactionSegment))
// //       .map((e) => ({
// //         ID: e.id,
// //         Email: e.identities.find((e) => e.is_pemesan == 1)?.email ?? "-",
// //         "No. Invoice": e.invoice_no,
// //         "Waktu Dikirim": moment(e.payment_date).format("HH:mm:ss DD MMM YYYY"),
// //         Status: (
// //           <Badge className={`[&_*]:!text-[12px] [&_*]:!font-[600]`} size="sm" color={transactionStatus?.find((z) => z.id == e.transaction_status_id)?.bgcolor}>
// //             {transactionStatus?.find((z) => z.id == e.transaction_status_id)?.name}
// //           </Badge>
// //         ),
// //         Type: <Text className={`capitalize`}>{e.type_transaction}</Text>,
// //       }));
// //   }, [dataList, transactionSegment]);

// //   const listCheckin = useMemo(() => {
// //     return dataListEticket
// //       ?.filter((e) => Boolean(e.is_checkin))
// //       .map((e) => ({
// //         Eticket: e.eticket_number,
// //         "Waktu Checkin": moment(e.checkin_date).format("HH:mm:ss DD MMM YYYY"),
// //       }));
// //   }, [dataListEticket]);

// //   if (!isr) return <></>;

// //   return (
// //     <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
// //       <Flex gap={20} justify="space-between">
// //         <Stack gap={0}>
// //           <Title order={1} size="h2">
// //             Report Event
// //           </Title>
// //           <Text size="sm" c="gray">
// //             Halaman Report Event Anda
// //           </Text>
// //         </Stack>

// //         <Flex align="center" gap={10}>
// //           <Text size="sm">Pilih Event</Text>
// //           <Select value={String(selectedEvent)} data={eventList?.map((e) => ({ value: String(e.id), label: e.name }))} onChange={(e) => e && setSelectedEvent(parseInt(e))} />
// //         </Flex>
// //       </Flex>

// //       <Tabs defaultValue="pemesan">
// //         <Tabs.List>
// //           <Tabs.Tab value="transaksi">Data Penjualan</Tabs.Tab>
// //           <Tabs.Tab value="pemesan">Data Pemesan</Tabs.Tab>
// //           <Tabs.Tab value="checkin">Data Checkin</Tabs.Tab>
// //           <Tabs.Tab value="invitation">Data Invitation</Tabs.Tab>
// //         </Tabs.List>

// //         <Tabs.Panel value="pemesan">
// //           <Box mt={20}>
// //             <TableData loading={loading.includes("getdata")} tablekey="pemesan" withRowIndex data={listPemesan ?? []} mapData={(e) => ({ ...e })} />
// //           </Box>
// //         </Tabs.Panel>
// //         <Tabs.Panel value="transaksi">
// //           <Box mt={20}>
// //             <TableData
// //               loading={loading.includes("getdata")}
// //               headers={
// //                 <SegmentedControl
// //                   value={transactionSegment}
// //                   onChange={(e) => setTransactionSegment(e)}
// //                   data={[
// //                     { label: "All", value: "all" },
// //                     { label: "Online", value: "online" },
// //                     { label: "Offline", value: "offline" },
// //                   ]}
// //                   radius="xl"
// //                   color="#0b387c"
// //                 />
// //               }
// //               tablekey="transaksi"
// //               withRowIndex
// //               data={listTransaksi ?? []}
// //               mapData={(e) => ({ ...e })}
// //             />
// //           </Box>
// //         </Tabs.Panel>
// //         <Tabs.Panel value="checkin">
// //           <Box mt={20}>
// //             <TableData loading={loading.includes("getdata")} tablekey="transaksi" withRowIndex data={listCheckin ?? []} mapData={(e) => ({ ...e })} />
// //           </Box>
// //         </Tabs.Panel>
// //         <Tabs.Panel value="invitation">
// //           <Box mt={20}>
// //             <TableData loading={loading.includes("getdata")} tablekey="transaksi" withRowIndex data={[]} mapData={(e: any) => ({ ...e })} />
// //           </Box>
// //         </Tabs.Panel>
// //       </Tabs>
// //     </div>
// //   );
// // };

// // export default Merch;

// import { Badge, Box, Card, Flex, Select, Stack, Text, Title, Pagination, Button, SegmentedControl, Input, ActionIcon, Modal, Group, Accordion, TextInput } from "@mantine/core";
// import React, { useEffect, useMemo, useState } from "react";
// import { useDidUpdate, useListState } from "@mantine/hooks";
// import moment from "moment";
// import TableData from "@/components/TableData";
// import { EticketListResponse, EventListResponse, TransactionListResponse, TransactionStatusResponse, EventData } from "./type";
// import fetch from "@/utils/fetch";
// import useLoggedUser from "@/utils/useLoggedUser";
// import axios from "axios";
// import config from "@/Config";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faDownload, faEye, faPaperPlane, faPencil, faPlus, faSearch, faFilter, faTicketAlt, faTshirt, faChevronDown, faReceipt, faTrash } from "@fortawesome/free-solid-svg-icons";

// const Merch = () => {
//   const [isr, setIsr] = useState(false);
//   const [dataList, setDataList] = useState<TransactionListResponse[]>([]);
//   const [dataListEticket, setDataListEticket] = useState<EticketListResponse[]>();
//   const [eventList, setEventList] = useState<EventListResponse[]>();
//   const [eventData, setEventData] = useState<EventData | null>(null);
//   const [selectedEvent, setSelectedEvent] = useState<number>();
//   const [selectedTicket, setSelectedTicket] = useState<string>("all");
//   const [availableTickets, setAvailableTickets] = useState<{ value: string; label: string }[]>([{ value: "all", label: "Semua Tiket" }]);
//   const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>();
//   const [loading, setLoading] = useListState<string>();
//   const [loadingEventData, setLoadingEventData] = useState(false);
//   const [transactionSegment, setTransactionSegment] = useState<string>("all");
//   const [selectedStatus, setSelectedStatus] = useState<string>("all");
//   const user = useLoggedUser();

//   const [page, setPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [slug, setSlug] = useState<string>("");
//   const [selectedTab, setSelectedTab] = useState<string>("transaksi");
//   const [searchValue, setSearchValue] = useState<string>("");
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState<TransactionListResponse | null>(null);

//   // State untuk CRUD Voucher
//   const [vouchers, setVouchers] = useState([
//     { id: 1, kode: "DISKON50", namaPemesan: "John Doe", email: "john@example.com", status: "Terpakai", tanggalPakai: "2024-01-15" },
//     { id: 2, kode: "SALE30", namaPemesan: "Jane Smith", email: "jane@example.com", status: "Aktif", tanggalPakai: "-" },
//   ]);
//   const [voucherModalOpen, setVoucherModalOpen] = useState(false);
//   const [voucherForm, setVoucherForm] = useState({
//     id: null as number | null,
//     kode: "",
//     namaPemesan: "",
//     email: "",
//     status: "Aktif",
//     tanggalPakai: "",
//   });
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);
//   const [searchVoucher, setSearchVoucher] = useState<string>("");

//   useEffect(() => {
//     setIsr(true);
//   }, []);

//   useDidUpdate(() => {
//     getEvent();
//   }, [isr]);

//   useDidUpdate(() => {
//     getData();
//   }, [selectedEvent]);

//   useDidUpdate(() => {
//     if (selectedEvent && eventList) {
//       const currentEvent = eventList.find((e) => e.id === selectedEvent);
//       if (currentEvent?.has_event_ticket?.length) {
//         const ticketsArray = currentEvent.has_event_ticket.map((ticket) => ({
//           value: String(ticket.id),
//           label: ticket.name,
//         }));
//         setAvailableTickets([{ value: "all", label: "Semua Tiket" }, ...ticketsArray]);
//       } else {
//         setAvailableTickets([{ value: "all", label: "Semua Tiket" }]);
//       }
//     }
//   }, [selectedEvent, eventList]);

//   const getEventData = async () => {
//     setLoadingEventData(true);
//     try {
//       const response = await axios.get(`${config.wsUrl}event-view-list-by-slug/${slug}`);
//       if (response && response.data) {
//         setEventData(response.data);
//         console.log(response.data, "Event data loaded");
//       }
//     } catch (error) {
//       console.error("Error fetching event data:", error);
//     } finally {
//       setLoadingEventData(false);
//     }
//   };

//   useEffect(() => {
//     if (slug) {
//       getEventData();
//     }
//   }, [slug]);

//   const getEvent = async () => {
//     await fetch<any, EventListResponse[]>({
//       url: "event",
//       method: "GET",
//       before: () => setLoading.append(""),
//       success: ({ data }) => {
//         if (data?.length) {
//           const _data = data.filter((e) => parseInt(e.creator_id) == user?.has_creator?.id);
//           setEventList(_data);
//           if (_data.length > 0) {
//             setSelectedEvent(_data[0].id);
//             const selectedEventSlug = _data[0].slug || "";
//             setSlug(selectedEventSlug);
//           }
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
//         if (data?.length) {
//           setTransactionStatus(data);
//         }
//       },
//       complete: () => setLoading.filter((e) => e != ""),
//     });
//   };

//   const getData = async () => {
//     if (!selectedEvent) return;

//     console.log("Fetching data for event:", selectedEvent);

//     await fetch<any, TransactionListResponse[]>({
//       url: `list-transaction-by-event?event_id=${selectedEvent}`,
//       method: "GET",
//       before: () => setLoading.append("getdata"),
//       success: ({ data }) => {
//         if (data) {
//           const dataArray = Array.isArray(data) ? data : [];
//           setDataList(dataArray);
//         } else {
//           setDataList([]);
//         }
//       },
//       complete: () => setLoading.filter((e) => e != "getdata"),
//     });

//     await fetch<any, TransactionListResponse[]>({
//       url: `checkin-list/${selectedEvent}`,
//       method: "GET",
//       before: () => setLoading.append("getdata"),
//       success: () => {},
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

//   const listTransaksi = useMemo(() => {
// console.log("=== DEBUG FILTERING ===");
//   console.log("Total data from API:", dataList?.length || 0);

//   if (!Array.isArray(dataList)) {
//     console.log("dataList is not an array");
//     return [];
//   }

//   console.log("transactionSegment value:", transactionSegment);
//   let filteredData = dataList.filter((e) =>
//     (transactionSegment === "all" ? true : e.type_transaction === transactionSegment)
//   );
//   console.log("After segment filter ('all' or specific):", filteredData.length);

//   // Filter tiket
//   console.log("selectedTicket value:", selectedTicket);
//   if (selectedTicket !== "all") {
//     const selectedTicketId = parseInt(selectedTicket);
//     filteredData = filteredData.filter((transaction) => {
//       const hasTicket = transaction.tickets?.some((ticket) =>
//         parseInt(ticket.event_ticket_id) === selectedTicketId
//       );
//       return hasTicket;
//     });
//     console.log("After ticket filter:", filteredData.length);
//   }

//   // Filter status
//   console.log("selectedStatus value:", selectedStatus);
//   if (selectedStatus !== "all") {
//     const statusId = parseInt(selectedStatus);
//     filteredData = filteredData.filter((transaction) =>
//       transaction.transaction_status_id === statusId
//     );
//     console.log("After status filter:", filteredData.length);
//   }

//   // Filter pencarian
//   console.log("searchValue value:", searchValue);
//   if (searchValue) {
//     const searchTerm = searchValue.toLowerCase();
//     filteredData = filteredData.filter((transaction) => {
//       const invoiceNo = transaction.invoice_no?.toLowerCase() || "";
//       const email = transaction.identities?.find((id) => id.is_pemesan == 1)?.email?.toLowerCase() || "";
//       const name = transaction.identities?.find((id) => id.is_pemesan == 1)?.full_name?.toLowerCase() || "";

//       const matches = invoiceNo.includes(searchTerm) || email.includes(searchTerm) || name.includes(searchTerm);
//       return matches;
//     });
//     console.log("After search filter:", filteredData.length);
//   }

//   console.log("=== END DEBUG ===");
//   console.log("Final result count:", filteredData.length);

//     return filteredData.map((e) => {
//       // Cari nama tiket dari transaksi
//       let ticketName = "-";
//       let ticketPrice = 0;
//       const identity = e.identities?.find((id) => id.is_pemesan == 1);

//       // Ambil data tiket dari properti tickets
//       if (e.tickets && e.tickets.length > 0) {
//         const ticketNames = e.tickets.map((ticket) => ticket.has_event_ticket?.name || "-");
//         ticketName = ticketNames.join(", ");

//         // Hitung total harga tiket (price * qty) - HANYA TIKET
//         ticketPrice = e.tickets.reduce((sum, ticket) => {
//           return sum + (ticket.price || 0) * (ticket.qty_ticket || 0);
//         }, 0);
//       }

//       return {
//         ...e, // Simpan data asli untuk akses di action
//         Nama: identity?.full_name || "-",
//         Email: identity?.email ?? "-",
//         "No. Invoice": e.invoice_no,
//         "Nama Tiket": ticketName,
//         "Harga Tiket": `Rp ${ticketPrice.toLocaleString("id-ID")}`, // HANYA Harga Tiket, tidak termasuk merch
//         Status: (
//           <Badge className={`[&_*]:!text-[12px] [&_*]:!font-[600]`} size="sm" color={transactionStatus?.find((z) => z.id == e.transaction_status_id)?.bgcolor}>
//             {transactionStatus?.find((z) => z.id == e.transaction_status_id)?.name}
//           </Badge>
//         ),
//         Action: (
//           <Group gap="xs">
//             <ActionIcon
//               color="blue"
//               variant="subtle"
//               onClick={() => {
//                 setSelectedTransaction(e);
//                 setViewModalOpen(true);
//               }}
//             >
//               <FontAwesomeIcon icon={faEye} size="sm" />
//             </ActionIcon>
//           </Group>
//         ),
//       };
//     });
//   }, [dataList, transactionSegment, transactionStatus, selectedTicket, selectedStatus, searchValue]);

//   // Statistik untuk tab Data Penjualan
//   const salesStatistics = useMemo(() => {
//     const filtered = listTransaksi;

//     // Hitung total tiket yang sudah dibayar (Verified)
//     const totalTickets = dataList.reduce((sum, transaction) => {
//       if (transaction.payment_status === "Verified" && transaction.tickets) {
//         return sum + transaction.tickets.reduce((ticketSum, ticket) => ticketSum + (ticket.qty_ticket || 0), 0);
//       }
//       return sum;
//     }, 0);

//     const pendingTransactions = eventData?.total_unpaid || 0;

//     // Hitung total checkin dari data eticket
//     const totalCheckin = dataListEticket?.filter((e) => Boolean(e.is_checkin)).length || 0;

//     return {
//       totalSales: eventData?.total_price_sell_online || 0,
//       pendingTransactions,
//       totalTickets,
//       totalTransactions: filtered.length,
//       totalCheckin,
//     };
//   }, [listTransaksi, eventData, dataList, dataListEticket]);

//   const paginatedListTransaksi = useMemo(() => {
//     const startIndex = (page - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     return listTransaksi.slice(startIndex, endIndex);
//   }, [listTransaksi, page, itemsPerPage]);

//   const totalPages = Math.ceil(listTransaksi.length / itemsPerPage);

//   const exportToExcel = () => {
//     if (!listTransaksi || listTransaksi.length === 0) {
//       alert("Tidak ada data untuk diexport");
//       return;
//     }

//     try {
//       const headers = ["No", "Nama", "Email", "No. Invoice", "Nama Tiket", "Harga Tiket", "Status"];
//       const csvRows = [
//         headers.join(","),
//         ...listTransaksi.map((item, index) => {
//           let statusText = "Unknown";
//           if (item.Status?.props?.children) {
//             statusText = item.Status.props.children;
//           }

//           const ticketName = item["Nama Tiket"] || "-";
//           // Remove "Rp " from the price for cleaner export
//           const ticketPrice = item["Harga Tiket"]?.replace("Rp ", "") || "0";

//           return [index + 1, `"${item.Nama}"`, `"${item.Email}"`, `"${item["No. Invoice"]}"`, `"${ticketName}"`, ticketPrice, `"${statusText}"`].join(",");
//         }),
//       ];

//       const csvContent = csvRows.join("\n");
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       const timestamp = new Date().toISOString().split("T")[0];
//       const eventName = eventList?.find((e) => e.id === selectedEvent)?.name || "event";

//       link.href = url;
//       link.download = `report-${eventName}-${timestamp}.csv`;
//       link.style.display = "none";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Export error:", error);
//       alert("Terjadi kesalahan saat mengeksport data");
//     }
//   };

//   const listPemesan = useMemo(() => {
//     if (!Array.isArray(dataList)) return [];

//     return dataList
//       ?.filter((e) => e.payment_status == "Verified")
//       .flatMap((e) => e.identities || [])
//       .map((e) => ({
//         "No. Identitas": e.nik,
//         "Nama Pemesan": e.full_name,
//         Email: e.email,
//         "No. Telepon": e.no_telp,
//         "Tanggal Dibuat": moment(e.created_at).format("HH:mm:ss DD MMM YYYY"),
//       }));
//   }, [dataList]);

//   const listCheckin = useMemo(() => {
//     if (!Array.isArray(dataListEticket)) return [];

//     return dataListEticket
//       ?.filter((e) => Boolean(e.is_checkin))
//       .map((e) => ({
//         Eticket: e.eticket_number,
//         "Waktu Checkin": moment(e.checkin_date).format("HH:mm:ss DD MMM YYYY"),
//       }));
//   }, [dataListEticket]);

//   const filteredVouchers = useMemo(() => {
//     if (!searchVoucher) return vouchers;

//     const searchTerm = searchVoucher.toLowerCase();
//     return vouchers.filter(
//       (voucher) => voucher.kode.toLowerCase().includes(searchTerm) || voucher.namaPemesan.toLowerCase().includes(searchTerm) || voucher.email.toLowerCase().includes(searchTerm) || voucher.status.toLowerCase().includes(searchTerm),
//     );
//   }, [vouchers, searchVoucher]);

//   const listVoucher = useMemo(() => {
//     return filteredVouchers.map((voucher) => ({
//       ...voucher,
//       "Kode Voucher": voucher.kode,
//       "Nama Pemesan": voucher.namaPemesan,
//       Email: voucher.email,
//       Status: <Badge color={voucher.status === "Aktif" ? "green" : "orange"}>{voucher.status}</Badge>,
//       "Tanggal Pakai": voucher.tanggalPakai,
//       Action: (
//         <Group gap="xs">
//           <ActionIcon color="blue" variant="subtle" onClick={() => handleEditVoucher(voucher)}>
//             <FontAwesomeIcon icon={faPencil} size="sm" />
//           </ActionIcon>
//           <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteClick(voucher.id)}>
//             <FontAwesomeIcon icon={faTrash} size="sm" />
//           </ActionIcon>
//         </Group>
//       ),
//     }));
//   }, [filteredVouchers]);

//   // Fungsi CRUD Voucher
//   const handleAddVoucher = () => {
//     setVoucherForm({
//       id: null,
//       kode: "",
//       namaPemesan: "",
//       email: "",
//       status: "Aktif",
//       tanggalPakai: "",
//     });
//     setVoucherModalOpen(true);
//   };

//   const handleEditVoucher = (voucher: any) => {
//     setVoucherForm({
//       id: voucher.id,
//       kode: voucher.kode,
//       namaPemesan: voucher.namaPemesan,
//       email: voucher.email,
//       status: voucher.status,
//       tanggalPakai: voucher.tanggalPakai,
//     });
//     setVoucherModalOpen(true);
//   };

//   const handleSaveVoucher = () => {
//     if (voucherForm.id) {
//       // Update voucher
//       setVouchers(vouchers.map((v) => (v.id === voucherForm.id ? ({ ...voucherForm, id: voucherForm.id } as any) : v)));
//     } else {
//       // Add new voucher
//       const newId = Math.max(...vouchers.map((v) => v.id)) + 1;
//       setVouchers([...vouchers, { ...voucherForm, id: newId }]);
//     }
//     setVoucherModalOpen(false);
//   };

//   const handleDeleteClick = (id: number) => {
//     setVoucherToDelete(id);
//     setDeleteModalOpen(true);
//   };

//   const handleDeleteVoucher = () => {
//     if (voucherToDelete) {
//       setVouchers(vouchers.filter((v) => v.id !== voucherToDelete));
//       setDeleteModalOpen(false);
//       setVoucherToDelete(null);
//     }
//   };

//   if (!isr) return <></>;

//   return (
//     <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
//       <Flex gap={20} justify="space-between" align="center">
//         <Stack gap={0}>
//           <Title order={1} size="h2">
//             Report Event
//           </Title>
//           <Text size="sm" c="gray">
//             Halaman Report Event Anda
//           </Text>
//         </Stack>
//       </Flex>

//       <Flex gap={20} justify="flex-end" align="center">
//         <Flex align="center" gap={10}>
//           <Text size="sm">Pilih Event</Text>
//           <Select
//             value={String(selectedEvent)}
//             data={eventList?.map((e) => ({ value: String(e.id), label: e.name }))}
//             onChange={(e) => {
//               if (e) {
//                 const selectedId = parseInt(e);
//                 setSelectedEvent(selectedId);
//                 setSelectedTicket("all");
//                 setSelectedStatus("all");
//                 setPage(1);
//                 setSearchValue("");

//                 const selectedEventItem = eventList?.find((item) => item.id === selectedId);
//                 if (selectedEventItem?.slug) {
//                   setSlug(selectedEventItem.slug);
//                 }
//               }
//             }}
//             placeholder="Pilih event"
//             style={{ width: 200 }}
//           />
//         </Flex>

//         <Flex align="center" gap={10}>
//           <Text size="sm">Pilih Tiket</Text>
//           <Select
//             value={selectedTicket}
//             data={availableTickets}
//             onChange={(value) => {
//               if (value) {
//                 setSelectedTicket(value);
//                 setPage(1);
//               }
//             }}
//             placeholder="Pilih tiket"
//             style={{ width: 200 }}
//             disabled={availableTickets.length <= 1}
//           />
//         </Flex>

//         <Button onClick={exportToExcel} variant="outline" leftSection={<FontAwesomeIcon icon={faDownload} />} disabled={!listTransaksi || listTransaksi.length === 0}>
//           Export Excel
//         </Button>
//       </Flex>

//       {/* Tabs Container */}
//       <Card className={`!overflow-auto`} p={20} withBorder>
//         {/* Statistics Cards - Tampil di semua tab (tetap statistik Data Penjualan) */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           {/* Card 1: Total Penjualan */}
//           {/* <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
//             <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penjualan</h3>
//             <p className="text-lg font-semibold mt-1 text-gray-800">Rp {salesStatistics.totalSales.toLocaleString("id-ID")}</p>
//           </div> */}

//           {/* Card 2: Transaksi Pending */}
//           <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
//             <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi Pending</h3>
//             <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.pendingTransactions} transaksi</p>
//           </div>

//           {/* Card 3: Total Tiket */}
//           <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
//             <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tiket</h3>
//             <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalTickets} tiket</p>
//           </div>

//           {/* Card 4: Total Checkin */}
//           <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
//             <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Checkin</h3>
//             <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalCheckin} checkin</p>
//           </div>

//           {/* Card 5: Total Transaksi */}
//           <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
//             <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Transaksi</h3>
//             <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalTransactions} transaksi</p>
//           </div>
//         </div>

//         {/* Tabs Navigation */}
//         <div className="mb-6">
//           <div className="flex border-b border-gray-200">
//             <button
//               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
//                 selectedTab === "transaksi" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setSelectedTab("transaksi")}
//             >
//               Data Penjualan
//             </button>
//             <button
//               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
//                 selectedTab === "pemesan" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setSelectedTab("pemesan")}
//             >
//               Data Pemesan
//             </button>
//             <button
//               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
//                 selectedTab === "checkin" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setSelectedTab("checkin")}
//             >
//               Data Checkin
//             </button>
//             <button
//               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
//                 selectedTab === "voucher" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setSelectedTab("voucher")}
//             >
//               Data Voucher
//             </button>
//           </div>
//         </div>

//         {/* Tab Content - Data Penjualan */}
//         {selectedTab === "transaksi" && (
//           <div className="pt-4">
//             <Flex justify="space-between" align="center" mb="md" wrap="wrap" gap="md">
//               <Flex gap="md" align="center" wrap="wrap">
//                 <SegmentedControl
//                   value={transactionSegment}
//                   onChange={(e) => {
//                     setTransactionSegment(e);
//                     setPage(1);
//                   }}
//                   data={[
//                     { label: "All", value: "all" },
//                     { label: "Online", value: "online" },
//                     { label: "Offline", value: "offline" },
//                   ]}
//                   radius="xl"
//                   color="#0b387c"
//                 />

//                 <Select
//                   placeholder="Filter Status"
//                   value={selectedStatus}
//                   onChange={(value) => {
//                     if (value) {
//                       setSelectedStatus(value);
//                       setPage(1);
//                     }
//                   }}
//                   data={[
//                     { value: "all", label: "Semua Status" },
//                     ...(transactionStatus?.map((status) => ({
//                       value: String(status.id),
//                       label: status.name,
//                     })) || []),
//                   ]}
//                   style={{ width: 200 }}
//                   leftSection={<FontAwesomeIcon icon={faFilter} size="sm" />}
//                 />
//               </Flex>
//             </Flex>

//             <TableData
//               loading={loading.includes("getdata")}
//               tablekey="transaksi"
//               withRowIndex
//               data={paginatedListTransaksi}
//               mapData={(e) => ({
//                 Nama: e.Nama,
//                 Email: e.Email,
//                 "No. Invoice": e["No. Invoice"],
//                 "Nama Tiket": e["Nama Tiket"],
//                 "Harga Tiket": e["Harga Tiket"],
//                 Status: e.Status,
//                 Action: e.Action,
//               })}
//             />

//             {listTransaksi.length > 0 && (
//               <Flex justify="space-between" align="center" mt="md">
//                 <Text size="sm" c="dimmed">
//                   Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, listTransaksi.length)} of {listTransaksi.length} entries
//                 </Text>
//                 <Pagination value={page} onChange={setPage} total={totalPages} radius="md" size="sm" withEdges />
//               </Flex>
//             )}
//           </div>
//         )}

//         {/* Tab Content - Data Pemesan */}
//         {selectedTab === "pemesan" && (
//           <div className="pt-4">
//             <Flex justify="space-between" align="center" mb="md">
//               {/* Input search bisa ditambahkan di sini jika diperlukan */}
//             </Flex>
//             <Box mt={20}>
//               <TableData loading={loading.includes("getdata")} tablekey="pemesan" withRowIndex data={listPemesan} mapData={(e) => ({ ...e })} />
//             </Box>
//           </div>
//         )}

//         {/* Tab Content - Data Checkin */}
//         {selectedTab === "checkin" && (
//           <div className="pt-4">
//             <Flex justify="space-between" align="center" mb="md">
//               {/* Input search bisa ditambahkan di sini jika diperlukan */}
//             </Flex>
//             <Box mt={20}>
//               <TableData loading={loading.includes("getdata")} tablekey="checkin" withRowIndex data={listCheckin} mapData={(e) => ({ ...e })} />
//             </Box>
//           </div>
//         )}

//         {/* Tab Content - Data Voucher */}
//         {selectedTab === "voucher" && (
//           <div className="pt-4">
//             <Flex justify="space-between" align="center" mb="md">
//               <Input placeholder="Cari Voucher" value={searchVoucher} onChange={(e) => setSearchVoucher(e.target.value)} style={{ width: 300 }} leftSection={<FontAwesomeIcon icon={faSearch} size="sm" />} />
//               <Button onClick={handleAddVoucher} leftSection={<FontAwesomeIcon icon={faPlus} />}>
//                 Tambah Voucher
//               </Button>
//             </Flex>
//             <Box mt={20}>
//               <TableData
//                 loading={loading.includes("getdata")}
//                 tablekey="voucher"
//                 withRowIndex
//                 data={listVoucher}
//                 mapData={(e) => ({
//                   "Kode Voucher": e["Kode Voucher"],
//                   "Nama Pemesan": e["Nama Pemesan"],
//                   Email: e["Email"],
//                   Status: e["Status"],
//                   "Tanggal Pakai": e["Tanggal Pakai"],
//                   Action: e["Action"],
//                 })}
//               />
//             </Box>
//           </div>
//         )}
//       </Card>

//       {/* Modal untuk Tambah/Edit Voucher */}
//       <Modal opened={voucherModalOpen} onClose={() => setVoucherModalOpen(false)} title={voucherForm.id ? "Edit Voucher" : "Tambah Voucher"} size="md">
//         <Stack gap="md">
//           <TextInput label="Kode Voucher" placeholder="Masukkan kode voucher" value={voucherForm.kode} onChange={(e) => setVoucherForm({ ...voucherForm, kode: e.target.value })} required />
//           <TextInput label="Nama Pemesan" placeholder="Masukkan nama pemesan" value={voucherForm.namaPemesan} onChange={(e) => setVoucherForm({ ...voucherForm, namaPemesan: e.target.value })} required />
//           <TextInput label="Email" placeholder="Masukkan email" value={voucherForm.email} onChange={(e) => setVoucherForm({ ...voucherForm, email: e.target.value })} required />
//           <Select
//             label="Status"
//             value={voucherForm.status}
//             onChange={(value) => setVoucherForm({ ...voucherForm, status: value || "Aktif" })}
//             data={[
//               { value: "Aktif", label: "Aktif" },
//               { value: "Terpakai", label: "Terpakai" },
//             ]}
//           />
//           <TextInput label="Tanggal Pakai" placeholder="YYYY-MM-DD" value={voucherForm.tanggalPakai} onChange={(e) => setVoucherForm({ ...voucherForm, tanggalPakai: e.target.value })} />
//           <Flex justify="flex-end" gap="md">
//             <Button variant="outline" onClick={() => setVoucherModalOpen(false)}>
//               Batal
//             </Button>
//             <Button onClick={handleSaveVoucher}>{voucherForm.id ? "Update" : "Simpan"}</Button>
//           </Flex>
//         </Stack>
//       </Modal>

//       {/* Modal Konfirmasi Hapus */}
//       <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Konfirmasi Hapus" size="sm">
//         <Stack gap="md">
//           <Text>Apakah Anda yakin ingin menghapus voucher ini?</Text>
//           <Flex justify="flex-end" gap="md">
//             <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
//               Batal
//             </Button>
//             <Button color="red" onClick={handleDeleteVoucher}>
//               Hapus
//             </Button>
//           </Flex>
//         </Stack>
//       </Modal>

//       {/* Modal View Detail Transaksi */}
//       <Modal
//         opened={viewModalOpen}
//         onClose={() => setViewModalOpen(false)}
//         title={
//           <Flex align="center" gap="sm">
//             <FontAwesomeIcon icon={faReceipt} color="white" />
//             <Text fw={600} c="white">
//               Detail Transaksi
//             </Text>
//           </Flex>
//         }
//         size="lg"
//         radius="md"
//         styles={{
//           header: {
//             backgroundColor: "#0b387c",
//             color: "white",
//             margin: 0,
//             borderTopLeftRadius: "8px",
//             borderTopRightRadius: "8px",
//             padding: "16px 20px",
//           },
//           content: {
//             padding: 0,
//           },
//           title: {
//             fontSize: "16px",
//             fontWeight: 600,
//             color: "white",
//             flex: 1,
//           },
//           close: {
//             color: "white",
//             marginRight: "4px",
//           },
//           body: {
//             padding: "20px",
//           },
//         }}
//         closeButtonProps={{
//           "aria-label": "Close modal",
//           style: {
//             backgroundColor: "transparent",
//           },
//         }}
//       >
//         {selectedTransaction && (
//           <Stack gap="lg">
//             {/* Header Info Transaksi */}
//             <Card withBorder shadow="sm" radius="md" p="lg">
//               <Stack gap="xs">
//                 <Flex justify="space-between" align="center">
//                   <Text fw={600} size="sm" c="dimmed">
//                     No. Invoice
//                   </Text>
//                   <Text fw={600} size="lg" className="font-mono">
//                     {selectedTransaction.invoice_no}
//                   </Text>
//                 </Flex>
//                 <Flex justify="space-between" align="center">
//                   <Text fw={600} size="sm" c="dimmed">
//                     Status
//                   </Text>
//                   <Badge size="lg" color={transactionStatus?.find((z) => z.id == selectedTransaction.transaction_status_id)?.bgcolor} radius="sm">
//                     {transactionStatus?.find((z) => z.id == selectedTransaction.transaction_status_id)?.name}
//                   </Badge>
//                 </Flex>
//               </Stack>
//             </Card>

//             {/* Info Pembeli */}
//             <Card withBorder shadow="sm" radius="md" p="lg">
//               <Text fw={600} size="md" mb="md">
//                 Informasi Pembeli
//               </Text>
//               <Stack gap="sm">
//                 <Flex justify="space-between">
//                   <Text fw={500} size="sm">
//                     Nama
//                   </Text>
//                   <Text>{selectedTransaction.identities?.find((id) => id.is_pemesan == 1)?.full_name || "-"}</Text>
//                 </Flex>
//                 <Flex justify="space-between">
//                   <Text fw={500} size="sm">
//                     Email
//                   </Text>
//                   <Text>{selectedTransaction.identities?.find((id) => id.is_pemesan == 1)?.email || "-"}</Text>
//                 </Flex>
//                 <Flex justify="space-between">
//                   <Text fw={500} size="sm">
//                     Tipe Transaksi
//                   </Text>
//                   <Badge color={selectedTransaction.type_transaction === "online" ? "blue" : "orange"} variant="light">
//                     {selectedTransaction.type_transaction?.toUpperCase()}
//                   </Badge>
//                 </Flex>
//               </Stack>
//             </Card>

//             {/* Detail Harga */}
//             <Card withBorder shadow="sm" radius="md" p="lg">
//               <Text fw={600} size="md" mb="md">
//                 Ringkasan Pembayaran
//               </Text>
//               <Stack gap="sm">
//                 <Flex justify="space-between">
//                   <Text fw={500} size="sm">
//                     Tanggal Transaksi
//                   </Text>
//                   <Text>{selectedTransaction.payment_date ? moment(selectedTransaction.payment_date).format("DD MMM YYYY HH:mm:ss") : "-"}</Text>
//                 </Flex>
//                 <Flex justify="space-between">
//                   <Text fw={500} size="sm">
//                     Total Pembayaran
//                   </Text>
//                   <Text fw={700} size="lg" c="blue">
//                     Rp {(selectedTransaction.total_price || 0).toLocaleString("id-ID")}
//                   </Text>
//                 </Flex>
//               </Stack>
//             </Card>

//             {/* Accordion untuk Detail Tiket dan Merch */}
//             <Accordion
//               variant="separated"
//               radius="md"
//               chevron={<FontAwesomeIcon icon={faChevronDown} />}
//               styles={{
//                 chevron: {
//                   "&[data-rotate]": {
//                     transform: "rotate(-180deg)",
//                   },
//                 },
//               }}
//             >
//               {/* Detail Tiket */}
//               {selectedTransaction.tickets && selectedTransaction.tickets.length > 0 && (
//                 <Accordion.Item value="tickets">
//                   <Accordion.Control icon={<FontAwesomeIcon icon={faTicketAlt} />}>
//                     <Flex align="center" gap="sm">
//                       <Text fw={600}>Detail Tiket</Text>
//                       <Badge size="sm" color="blue" variant="light">
//                         {selectedTransaction.tickets.length} item
//                       </Badge>
//                     </Flex>
//                   </Accordion.Control>
//                   <Accordion.Panel>
//                     <Stack gap="md">
//                       {selectedTransaction.tickets.map((ticket, index) => (
//                         <Card key={index} withBorder radius="sm" p="md" style={{ borderLeft: "4px solid #228be6" }}>
//                           <Flex justify="space-between" align="start" mb="xs">
//                             <div>
//                               <Text fw={600} size="sm">
//                                 {ticket.has_event_ticket?.name || "Tiket"}
//                               </Text>
//                               <Text size="xs" c="dimmed">
//                                 Qty: {ticket.qty_ticket} tiket
//                               </Text>
//                             </div>
//                             <Badge color="blue" variant="light">
//                               Rp {(ticket.price || 0).toLocaleString("id-ID")}
//                             </Badge>
//                           </Flex>
//                           <Flex justify="space-between" align="center">
//                             <Text size="sm" c="dimmed">
//                               Subtotal
//                             </Text>
//                             <Text fw={600} size="sm">
//                               Rp {((ticket.price || 0) * (ticket.qty_ticket || 0)).toLocaleString("id-ID")}
//                             </Text>
//                           </Flex>
//                         </Card>
//                       ))}
//                     </Stack>
//                   </Accordion.Panel>
//                 </Accordion.Item>
//               )}

//               {/* Detail Merch */}
//               {selectedTransaction.transaction_merches && selectedTransaction.transaction_merches.length > 0 && (
//                 <Accordion.Item value="merch">
//                   <Accordion.Control icon={<FontAwesomeIcon icon={faTshirt} />}>
//                     <Flex align="center" gap="sm">
//                       <Text fw={600}>Detail Merchandise</Text>
//                       <Badge size="sm" color="green" variant="light">
//                         {selectedTransaction.transaction_merches.length} item
//                       </Badge>
//                     </Flex>
//                   </Accordion.Control>
//                   <Accordion.Panel>
//                     <Stack gap="md">
//                       {selectedTransaction.transaction_merches.map((merch: any, index: number) => (
//                         <Card key={index} withBorder radius="sm" p="md" style={{ borderLeft: "4px solid #40c057" }}>
//                           <Flex justify="space-between" align="start" mb="xs">
//                             <div>
//                               <Text fw={600} size="sm">
//                                 Merch {index + 1}
//                                 {merch.product_variant?.varian_name && (
//                                   <Badge size="xs" color="gray" ml="sm">
//                                     {merch.product_variant.varian_name}
//                                   </Badge>
//                                 )}
//                               </Text>
//                               <Text size="xs" c="dimmed">
//                                 Qty: {merch.qty} pcs
//                               </Text>
//                             </div>
//                             <Badge color="green" variant="light">
//                               Rp {parseFloat(merch.price || "0").toLocaleString("id-ID")}
//                             </Badge>
//                           </Flex>

//                           {merch.product_variant && (
//                             <Flex gap="md" mb="xs">
//                               <Badge size="xs" color="gray" variant="outline">
//                                 SKU: {merch.product_variant.sku || "-"}
//                               </Badge>
//                             </Flex>
//                           )}

//                           <Flex justify="space-between" align="center">
//                             <div>
//                               <Text size="sm" c="dimmed">
//                                 Subtotal
//                               </Text>
//                               {merch.noted && (
//                                 <Text size="xs" c="dimmed" mt={4}>
//                                   Catatan: {merch.noted}
//                                 </Text>
//                               )}
//                             </div>
//                             <Text fw={600} size="sm">
//                               Rp {(parseFloat(merch.price || "0") * (merch.qty || 0)).toLocaleString("id-ID")}
//                             </Text>
//                           </Flex>
//                         </Card>
//                       ))}
//                     </Stack>
//                   </Accordion.Panel>
//                 </Accordion.Item>
//               )}
//             </Accordion>

//             {/* Ringkasan Total */}
//             <Card withBorder shadow="sm" radius="md" p="lg" bg="blue.0">
//               <Stack gap="xs">
//                 {/* Subtotal Tiket */}
//                 {selectedTransaction.tickets && selectedTransaction.tickets.length > 0 && (
//                   <Flex justify="space-between">
//                     <Text fw={500} size="sm">
//                       Subtotal Tiket
//                     </Text>
//                     <Text fw={600} size="sm">
//                       Rp {selectedTransaction.tickets.reduce((sum, ticket) => sum + (ticket.price || 0) * (ticket.qty_ticket || 0), 0).toLocaleString("id-ID")}
//                     </Text>
//                   </Flex>
//                 )}

//                 {/* Subtotal Merch */}
//                 {selectedTransaction.transaction_merches && selectedTransaction.transaction_merches.length > 0 && (
//                   <Flex justify="space-between">
//                     <Text fw={500} size="sm">
//                       Subtotal Merch
//                     </Text>
//                     <Text fw={600} size="sm">
//                       Rp {selectedTransaction.transaction_merches.reduce((sum, merch) => sum + parseFloat(merch.price || "0") * (merch.qty || 0), 0).toLocaleString("id-ID")}
//                     </Text>
//                   </Flex>
//                 )}

//                 {/* Total Keseluruhan */}
//                 <Flex justify="space-between" align="center" pt="xs" style={{ borderTop: "1px solid #dee2e6" }}>
//                   <Text fw={700} size="lg">
//                     Total Transaksi
//                   </Text>
//                   <Text fw={800} size="xl" c="blue">
//                     Rp {(selectedTransaction.total_price || 0).toLocaleString("id-ID")}
//                   </Text>
//                 </Flex>
//               </Stack>
//             </Card>
//           </Stack>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default Merch;

import { Badge, Box, Card, Flex, Select, Stack, Text, Title, Pagination, Button, SegmentedControl, Input, ActionIcon, Modal, Group, Accordion, Table } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { useDidUpdate, useListState } from "@mantine/hooks";
import moment from "moment";
import { EticketListResponse, EventListResponse, TransactionListResponse, TransactionStatusResponse, EventData } from "./type";
import useLoggedUser from "@/utils/useLoggedUser";
import axios from "axios";
import config from "@/Config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faFilter, faTicketAlt, faTshirt, faChevronDown, faReceipt, faSearch, faMoneyBillWave, faQrcode, faArrowsRotate, faFileExcel, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Definisikan tipe untuk metode pembayaran
type PaymentMethodInfo = {
  label: string;
  icon: IconDefinition | null;
  color: string;
} | null;

const Merch = () => {
  const [isr, setIsr] = useState(false);
  const [allDataList, setAllDataList] = useState<TransactionListResponse[]>([]);
  const [dataListEticket, setDataListEticket] = useState<EticketListResponse[]>();
  const [eventList, setEventList] = useState<EventListResponse[]>([]);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number>();
  const [selectedTicket, setSelectedTicket] = useState<string>("all");
  const [availableTickets, setAvailableTickets] = useState<{ value: string; label: string }[]>([{ value: "all", label: "Semua Tiket" }]);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatusResponse[]>([]);
  const [loading, setLoading] = useListState<string>();
  const [loadingEventData, setLoadingEventData] = useState(false);
  const [transactionSegment, setTransactionSegment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const user = useLoggedUser();

  const [slug, setSlug] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("transaksi");
  const [searchValue, setSearchValue] = useState<string>("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionListResponse | null>(null);

  // State untuk pagination SERVER SIDE
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  // State untuk info dari API
  const [apiPaginationInfo, setApiPaginationInfo] = useState({
    totalRecords: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    setIsr(true);
  }, []);

  useDidUpdate(() => {
    getEvent();
  }, [isr]);

  useDidUpdate(() => {
    if (selectedEvent) {
      setCurrentPage(1);
      loadEventData();
    }
  }, [selectedEvent]);

  useDidUpdate(() => {
    if (selectedEvent && eventList.length > 0) {
      const currentEvent = eventList.find((e) => e.id === selectedEvent);
      if (currentEvent?.has_event_ticket?.length) {
        const ticketsArray = currentEvent.has_event_ticket.map((ticket) => ({
          value: ticket.name,
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

  // Fungsi untuk fetch semua event dengan pagination - menggunakan axios langsung
  const fetchAllEvents = async () => {
    setLoading.append("fetchEvents");
    let allEvents: EventListResponse[] = [];
    let currentPage = 1;
    let lastPage = 1;

    try {
      console.log("Starting to fetch all events...");
      console.log("Current user creator ID:", user?.has_creator?.id);

      // Fetch halaman pertama dengan axios
      const response = await axios.get(`${config.wsUrl}event?page=${currentPage}`);

      console.log("First page response status:", response.status);
      console.log("First page response data:", response.data);

      if (response.data?.data && Array.isArray(response.data.data)) {
        // Response dengan pagination wrapper
        const firstPageData = response.data.data;
        allEvents = [...firstPageData];

        // Dapatkan info pagination
        if (response.data.pagination) {
          lastPage = response.data.pagination.last_page || 1;
          console.log(`Total pages: ${lastPage}`);
          console.log(`Total events: ${response.data.pagination.total}`);

          // Fetch halaman berikutnya jika ada
          if (lastPage > 1) {
            for (let page = 2; page <= lastPage; page++) {
              console.log(`Fetching page ${page}...`);
              const nextResponse = await axios.get(`${config.wsUrl}event?page=${page}`);

              if (nextResponse.data?.data && Array.isArray(nextResponse.data.data)) {
                allEvents = [...allEvents, ...nextResponse.data.data];
                console.log(`Page ${page} added, total events: ${allEvents.length}`);
              }
            }
          }
        }
      } else if (Array.isArray(response.data)) {
        // Response langsung array
        allEvents = response.data;
        console.log("Response is direct array, length:", allEvents.length);
      }

      console.log("All events before filter:", allEvents.length);

      // Filter berdasarkan creator_id - handle string dan number
      if (allEvents.length > 0) {
        // Jika user memiliki creator ID, filter berdasarkan itu
        if (user?.has_creator?.id) {
          const creatorIdNumber = Number(user.has_creator.id);
          console.log("Filtering by creator_id:", creatorIdNumber);

          const filteredEvents = allEvents.filter((e) => {
            // creator_id bisa string atau number, konversi ke number untuk perbandingan
            const eventCreatorId = e.creator_id ? Number(e.creator_id) : null;
            return eventCreatorId === creatorIdNumber;
          });

          console.log("Filtered events:", filteredEvents.length);

          if (filteredEvents.length > 0) {
            setEventList(filteredEvents);
            setSelectedEvent(filteredEvents[0].id);
            const selectedEventSlug = filteredEvents[0].slug || "";
            setSlug(selectedEventSlug);
            console.log("Selected event:", filteredEvents[0].name);
          } else {
            // Jika tidak ada event yang cocok, tampilkan semua event untuk debugging
            console.log("No events match creator_id, showing all events");
            console.log("All events creator_ids:", allEvents.map(e => ({ id: e.id, name: e.name, creator_id: e.creator_id })));
            setEventList(allEvents);
            if (allEvents.length > 0) {
              setSelectedEvent(allEvents[0].id);
              const selectedEventSlug = allEvents[0].slug || "";
              setSlug(selectedEventSlug);
            }
          }
        } else {
          // Jika user tidak punya creator ID, tampilkan semua event
          console.log("User has no creator ID, showing all events");
          setEventList(allEvents);
          if (allEvents.length > 0) {
            setSelectedEvent(allEvents[0].id);
            const selectedEventSlug = allEvents[0].slug || "";
            setSlug(selectedEventSlug);
          }
        }
      } else {
        console.log("No events found");
        setEventList([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventList([]);
    } finally {
      setLoading.filter((e) => e != "fetchEvents");
    }
  };

  const getEvent = async () => {
    // Fetch transaction statuses dengan axios
    setLoading.append("fetchStatuses");
    try {
      console.log("Fetching transaction statuses...");
      const statusResponse = await axios.get(`${config.wsUrl}transaction-statuses`);
      console.log("Status response:", statusResponse.data);

      if (statusResponse.data?.length) {
        setTransactionStatus(statusResponse.data);
      } else if (statusResponse.data?.data?.length) {
        setTransactionStatus(statusResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching statuses:", error);
    } finally {
      setLoading.filter((e) => e != "fetchStatuses");
    }

    // Fetch all events
    await fetchAllEvents();
  };

  // Fungsi untuk mendapatkan metode pembayaran berdasarkan ID
  const getPaymentMethod = (paymentMethod: any): PaymentMethodInfo => {
    if (!paymentMethod) {
      return null;
    }

    // Mapping berdasarkan ID
    const paymentId = paymentMethod.id;

    // Mapping ID ke metode pembayaran
    if (paymentId === 4) {
      return {
        label: "QRIS",
        icon: faQrcode,
        color: "blue"
      };
    }

    if (paymentId === 5) {
      return {
        label: "Cash",
        icon: faMoneyBillWave,
        color: "green"
      };
    }

    // Untuk metode pembayaran lainnya berdasarkan payment_name
    const paymentName = paymentMethod.payment_name?.toLowerCase() || '';

    if (paymentName.includes('qris')) {
      return {
        label: "QRIS",
        icon: faQrcode,
        color: "blue"
      };
    }

    if (paymentName.includes('cash') || paymentName.includes('tunai')) {
      return {
        label: "Cash",
        icon: faMoneyBillWave,
        color: "green"
      };
    }

    let displayLabel = paymentMethod.payment_name || paymentMethod.name || "Unknown";
    displayLabel = displayLabel
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return {
      label: displayLabel,
      icon: null,
      color: "gray"
    };
  };

  const loadEventData = async () => {
    if (!selectedEvent) {
      return;
    }

    setLoading.append("loadData");
    setAllDataList([]);

    try {
      const params = new URLSearchParams({
        event_id: selectedEvent.toString(),
        page: "1",
        per_page: "999999"
      });

      const apiUrl = `${config.wsUrl}list-transaction-by-event?${params.toString()}`;
      const response = await axios.get(apiUrl);

      if (response.data?.data && Array.isArray(response.data.data)) {
        setAllDataList([...response.data.data]);
        setApiPaginationInfo({
          totalRecords: response.data.data.length,
          grandTotal: response.data.grand_total || 0,
        });
      } else {
        setAllDataList([]);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      setAllDataList([]);
    } finally {
      setLoading.filter((e) => e != "loadData");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useDidUpdate(() => {
    setCurrentPage(1);
  }, [selectedTicket, selectedStatus, transactionSegment, searchValue]);

  const [sortBy, setSortBy] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  // Proses filter secara lokal (karena ambil sekaligus)
  const filteredDataList = useMemo(() => {
    let result = [...allDataList];

    // Filter by segment (Type Transaction)
    if (transactionSegment !== "all") {
      result = result.filter(e => e.type_transaction === transactionSegment);
    }
    
    // Filter by Ticket Type
    if (selectedTicket !== "all") {
      result = result.filter(e => e.tickets?.some((t: any) => t.has_event_ticket?.name === selectedTicket));
    }
    
    // Filter by Status
    if (selectedStatus !== "all") {
      result = result.filter(e => String(e.transaction_status_id) === selectedStatus);
    }
    
    // Search by Keyword
    if (searchValue) {
      const q = searchValue.toLowerCase();
      result = result.filter(e => {
        const inv = e.invoice_no?.toLowerCase() || "";
        const iden = e.identities?.find((id) => id.is_pemesan == 1) || e.identities?.[0];
        const email = iden?.email?.toLowerCase() || "";
        const name = iden?.full_name?.toLowerCase() || "";
        return inv.includes(q) || email.includes(q) || name.includes(q);
      });
    }

    return result;
  }, [allDataList, transactionSegment, selectedTicket, selectedStatus, searchValue]);

  const itemsPerPageLocal = 20;
  const currentTotal = filteredDataList.length;
  const lastPageLocal = Math.ceil(currentTotal / itemsPerPageLocal) || 1;

  // Proses data untuk tabel transaksi (di sliced)
  const processedTransactionData = useMemo(() => {
    if (!filteredDataList.length) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPageLocal;
    const paginatedArray = filteredDataList.slice(startIndex, startIndex + itemsPerPageLocal);

    let result = paginatedArray.map((transaction, index) => {
      const globalIndex = startIndex + index + 1;

      let pemesanIdentity = null;
      if (transaction.identities?.length) {
        pemesanIdentity = transaction.identities.find((id) => id.is_pemesan == 1) || transaction.identities[0];
      }

      let ticketName = "-";
      let ticketPrice = 0;

      if (transaction.tickets?.length) {
        ticketName = transaction.tickets
          .map((ticket) => ticket.has_event_ticket?.name || "-")
          .join(", ");
        ticketPrice = transaction.tickets.reduce((sum, ticket) =>
          sum + (ticket.price || 0) * (ticket.qty_ticket || 1), 0);
      }

      const paymentMethodInfo = getPaymentMethod(transaction.payment_method);

      return {
        no: globalIndex,
        nama: pemesanIdentity?.full_name || "-",
        email: pemesanIdentity?.email || "-",
        invoice: transaction.invoice_no || "-",
        tiket: ticketName,
        harga: `Rp ${ticketPrice.toLocaleString("id-ID")}`,
        payment: paymentMethodInfo ? (
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <Badge
              color={paymentMethodInfo.color}
              variant="filled"
              leftSection={paymentMethodInfo.icon && <FontAwesomeIcon icon={paymentMethodInfo.icon} size="xs" />}
              style={{ width: 100 }}
            >
              {paymentMethodInfo.label}
            </Badge>
          </Box>
        ) : (
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <Badge color="gray" variant="filled" style={{ width: 100 }}>
              {transaction.payment_method?.payment_name || "-"}
            </Badge>
          </Box>
        ),
        status: (
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <Badge
              color={transactionStatus?.find((z) => z.id == transaction.transaction_status_id)?.bgcolor || "gray"}
              variant="filled"
              style={{ width: 100 }}
            >
              {transactionStatus?.find((z) => z.id == transaction.transaction_status_id)?.name || "Unknown"}
            </Badge>
          </Box>
        ),
        action: (
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <ActionIcon
              color="blue"
              variant="subtle"
              onClick={() => {
                setSelectedTransaction(transaction);
                setViewModalOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faEye} size="sm" />
            </ActionIcon>
          </Box>
        ),
      };
    });

    if (sortBy) {
      result.sort((a: any, b: any) => {
        let valA = a[sortBy] ?? "";
        let valB = b[sortBy] ?? "";

        // Handle string comparison
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        // Handle React node comparison (for styling elements)
        if (React.isValidElement(valA)) return 0; // Skip complex react elements parsing, or compare their text equivalent

        // Handle "harga" specifically
        if (sortBy === "harga") {
          const numA = Number(String(a[sortBy]).replace(/[^0-9,-]+/g, ""));
          const numB = Number(String(b[sortBy]).replace(/[^0-9,-]+/g, ""));
          valA = isNaN(numA) ? 0 : numA;
          valB = isNaN(numB) ? 0 : numB;
        }

        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredDataList, transactionStatus, sortBy, sortDir, currentPage]);

  // Proses data untuk tabel pemesan
  const processedPemesanData = useMemo(() => {
    if (!Array.isArray(allDataList)) return [];

    let result = allDataList
      ?.filter((e) => e.payment_status == "Verified")
      .flatMap((e) => e.identities || [])
      .filter((id) => id.is_pemesan == 1)
      .map((e, index) => ({
        no: index + 1,
        nik: e.nik || "-",
        nama: e.full_name || "-",
        email: e.email || "-",
        telepon: e.no_telp || "-",
        tanggal: moment(e.created_at).format("HH:mm:ss DD MMM YYYY"),
      }));

    if (sortBy) {
      result.sort((a: any, b: any) => {
        let valA = a[sortBy] ?? "";
        let valB = b[sortBy] ?? "";
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allDataList, sortBy, sortDir]);

  // Proses data untuk tabel checkin
  const processedCheckinData = useMemo(() => {
    if (!Array.isArray(dataListEticket)) return [];

    let result = dataListEticket
      ?.filter((e) => Boolean(e.is_checkin))
      .map((e, index) => ({
        no: index + 1,
        eticket: e.eticket_number || "-",
        waktu: moment(e.checkin_date).format("HH:mm:ss DD MMM YYYY"),
      }));

    if (sortBy) {
      result.sort((a: any, b: any) => {
        let valA = a[sortBy] ?? "";
        let valB = b[sortBy] ?? "";
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [dataListEticket, sortBy, sortDir]);

  const salesStatistics = useMemo(() => {
    const totalTickets = allDataList.reduce((sum, transaction) => {
      if (transaction.payment_status === "Verified" && transaction.tickets) {
        return sum + transaction.tickets.reduce((ticketSum: any, ticket: any) => ticketSum + (ticket.qty_ticket || 1), 0);
      }
      return sum;
    }, 0);

    const pendingTransactions = eventData?.total_unpaid || 0;
    const totalCheckin = dataListEticket?.filter((e) => Boolean(e.is_checkin)).length || 0;

    return {
      pendingTransactions,
      totalTickets,
      totalTransactions: allDataList.length,
      totalCheckin,
    };
  }, [allDataList, eventData, dataListEticket]);

  const exportToExcel = () => {
    if (!allDataList || allDataList.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    try {
      const headers = ["No", "Nama", "Email", "No. Invoice", "Nama Tiket", "Harga Tiket", "Metode Pembayaran", "Status"];
      const csvRows = [
        headers.join(","),
        ...allDataList.map((item, index) => {
          let pemesanIdentity = null;
          if (item.identities && item.identities.length > 0) {
            pemesanIdentity = item.identities.find((id) => id.is_pemesan == 1) || item.identities[0];
          }

          let ticketName = "-";
          let ticketPrice = 0;

          if (item.tickets && item.tickets.length > 0) {
            const ticketNames = item.tickets.map((ticket) => {
              return ticket.has_event_ticket?.name || "-";
            });
            ticketName = ticketNames.join(", ");
            ticketPrice = item.tickets.reduce((sum: number, ticket: any) => {
              return sum + (ticket.price || 0) * (ticket.qty_ticket || 1);
            }, 0);
          }

          const statusText = transactionStatus?.find((z) => z.id == item.transaction_status_id)?.name || "Unknown";
          const paymentMethodInfo = getPaymentMethod(item.payment_method);
          const paymentMethodText = paymentMethodInfo ? paymentMethodInfo.label : (item.payment_method?.payment_name || "-");
          const globalIndex = index + 1;

          return [
            globalIndex,
            `"${pemesanIdentity?.full_name || "-"}"`,
            `"${pemesanIdentity?.email || "-"}"`,
            `"${item.invoice_no}"`,
            `"${ticketName}"`,
            ticketPrice,
            `"${paymentMethodText}"`,
            `"${statusText}"`
          ].join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split("T")[0];
      const eventName = eventList.find((e) => e.id === selectedEvent)?.name || "event";

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

      {/* Statistics Statistics Accordion */}
      <Accordion variant="separated" radius="md" defaultValue="statistics" styles={{
        item: { border: '1px solid #e9ecef', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' },
        control: { padding: '15px 20px', '&:hover': { backgroundColor: '#f8fafc' } },
        content: { padding: '0 20px 20px 20px' }
      }}>
        <Accordion.Item value="statistics">
          <Accordion.Control icon={<FontAwesomeIcon icon={faChartPie} color="#0b387c" />}>
            <Text fw={700} size="md" c="gray.8">Ringkasan Statistik Event</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi Pending</h3>
                <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.pendingTransactions} transaksi</p>
              </div>

              <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tiket</h3>
                <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalTickets} tiket</p>
              </div>

              <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Checkin</h3>
                <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalCheckin} checkin</p>
              </div>

              <div className="bg-white border border-light-grey rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Transaksi</h3>
                <p className="text-lg font-semibold mt-1 text-gray-800">{salesStatistics.totalTransactions} transaksi</p>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Global Filter Bar - Outside the tab card */}
      <div className="mb-4">
        {selectedTab === "transaksi" && (
          <SegmentedControl
            value={transactionSegment}
            onChange={(e) => setTransactionSegment(e)}
            data={[
              { label: "All", value: "all" },
              { label: "Online", value: "online" },
              { label: "Offline", value: "offline" },
            ]}
            radius="xl"
            color="#0b387c"
          />
        )}
      </div>


      {/* Tabs Container */}
      <Card className={`!overflow-auto`} p={20} withBorder>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex border-b border-light-grey gap-2">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${selectedTab === "transaksi" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              onClick={() => setSelectedTab("transaksi")}
            >
              Data Penjualan
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${selectedTab === "pemesan" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              onClick={() => setSelectedTab("pemesan")}
            >
              Data Pemesan
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${selectedTab === "checkin" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              onClick={() => setSelectedTab("checkin")}
            >
              Data Checkin
            </button>
          </div>
        </div>

        {/* Tab Content - Data Penjualan */}
        {selectedTab === "transaksi" && (
          <div className="pt-2">
            {/* Filter Bar inside the tab content */}
            <Flex justify="space-between" align="center" mb="md" wrap="wrap" gap="sm">
              {/* Left side: Refresh and Export Excel */}
              <Flex gap={8} align="center">
                <Button
                  onClick={() => loadEventData()}
                  loading={loading.includes("loadData")}
                  variant="filled"
                  color="blue"
                  px={10}
                  title={`Refresh Data (${apiPaginationInfo.totalRecords})`}
                >
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </Button>

                <Button
                  onClick={exportToExcel}
                  color="green"
                  variant="filled"
                  leftSection={<FontAwesomeIcon icon={faFileExcel} />}
                  disabled={!allDataList || allDataList.length === 0}
                >
                  Export Excel
                </Button>
              </Flex>

              {/* Right side: Event, Tiket, Status, and Search */}
              <Flex gap={8} align="center" wrap="wrap">
                <Select
                  value={selectedEvent ? String(selectedEvent) : null}
                  data={eventList.map((e) => ({ value: String(e.id), label: e.name }))}
                  onChange={(e) => {
                    if (e) {
                      const selectedId = parseInt(e);
                      setSelectedEvent(selectedId);
                      setSelectedTicket("all");
                      setSelectedStatus("all");
                      setTransactionSegment("all");
                      setSearchValue("");
                      setCurrentPage(1);
                      const selectedEventData = eventList.find(event => event.id === selectedId);
                      if (selectedEventData?.slug) setSlug(selectedEventData.slug);
                    }
                  }}
                  placeholder={loading.includes("fetchEvents") ? "Loading..." : "Pilih Event"}
                  style={{ width: 190 }}
                  disabled={loading.includes("fetchEvents")}
                  nothingFoundMessage="Tidak ada event"
                  searchable
                  clearable
                />

                <Select
                  value={selectedTicket}
                  data={availableTickets}
                  onChange={(value) => { if (value) setSelectedTicket(value); }}
                  placeholder="Pilih Tiket"
                  style={{ width: 155 }}
                  disabled={availableTickets.length <= 1}
                />

                <Select
                  placeholder="Semua Status"
                  value={selectedStatus}
                  onChange={(value) => value && setSelectedStatus(value)}
                  data={[
                    { value: "all", label: "Semua Status" },
                    ...(transactionStatus?.map((status) => ({
                      value: String(status.id),
                      label: status.name,
                    })) || []),
                  ]}
                  style={{ width: 165 }}
                  leftSection={<FontAwesomeIcon icon={faFilter} size="sm" />}
                />

                <Input
                  placeholder="Cari nama atau invoice..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  style={{ width: 220 }}
                  leftSection={<FontAwesomeIcon icon={faSearch} size="sm" />}
                />
              </Flex>
            </Flex>
            {/* TABLE TRANSAKSI DENGAN SCROLL */}
            <Box style={{ overflowX: 'auto', position: 'relative' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e8e8e8', backgroundColor: '#f5f7fa' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', width: 48 }}>NO</th>
                    <th onClick={() => handleSort('invoice')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>NO. INVOICE <span style={{ opacity: sortBy === 'invoice' ? 1 : 0.3 }}>{sortBy === 'invoice' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('nama')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>NAMA <span style={{ opacity: sortBy === 'nama' ? 1 : 0.3 }}>{sortBy === 'nama' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('email')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>EMAIL <span style={{ opacity: sortBy === 'email' ? 1 : 0.3 }}>{sortBy === 'email' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('tiket')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>NAMA TIKET <span style={{ opacity: sortBy === 'tiket' ? 1 : 0.3 }}>{sortBy === 'tiket' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('harga')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>HARGA TIKET <span style={{ opacity: sortBy === 'harga' ? 1 : 0.3 }}>{sortBy === 'harga' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>METODE PEMBAYARAN</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>STATUS</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', position: 'sticky', right: 0, backgroundColor: '#f5f7fa', zIndex: 2, boxShadow: '-2px 0 5px rgba(0,0,0,0.07)' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.includes("loadData") ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                        <Text>Loading...</Text>
                      </td>
                    </tr>
                  ) : processedTransactionData.length > 0 ? (
                    processedTransactionData.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafd')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', textAlign: 'center', width: 48 }}><Text size="sm" c="dimmed" fw={500}>{item.no}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm" fw={600}>{item.invoice}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm">{item.nama}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="xs" c="dimmed">{item.email}</Text></td>
                        <td style={{ padding: '12px 14px' }}><Text size="sm">{item.tiket}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm" fw={600}>{item.harga}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{item.payment}</td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{item.status}</td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1, boxShadow: '-2px 0 4px rgba(0,0,0,0.06)' }}>{item.action}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                        <Text>Tidak ada data</Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>

            {filteredDataList.length > 0 && (
              <Flex justify="space-between" align="center" mt="md">
                <Text size="sm" c="dimmed">
                  Menampilkan {((currentPage - 1) * itemsPerPageLocal) + 1} sampai {Math.min(currentPage * itemsPerPageLocal, currentTotal)} dari <strong>{currentTotal}</strong> transaksi
                  <br />
                  <small>
                    Halaman {currentPage} dari {lastPageLocal} | Total Keseluruhan: Rp {apiPaginationInfo.grandTotal.toLocaleString("id-ID")}
                  </small>
                </Text>

                <Flex gap="md" align="center">
                  <Pagination
                    value={currentPage}
                    onChange={handlePageChange}
                    total={lastPageLocal}
                    radius="md"
                    size="sm"
                    withEdges
                  />
                </Flex>
              </Flex>
            )}
          </div>
        )}

        {/* Tab Content - Data Pemesan */}
        {selectedTab === "pemesan" && (
          <div className="pt-4">
            {/* TABLE PEMESAN DENGAN SCROLL */}
            <Box style={{ overflowX: 'auto', position: 'relative' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e8e8e8', backgroundColor: '#f5f7fa' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', width: 48 }}>NO</th>
                    <th onClick={() => handleSort('nik')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>NO. IDENTITAS <span style={{ opacity: sortBy === 'nik' ? 1 : 0.3 }}>{sortBy === 'nik' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('nama')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>NAMA PEMESAN <span style={{ opacity: sortBy === 'nama' ? 1 : 0.3 }}>{sortBy === 'nama' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('email')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>EMAIL <span style={{ opacity: sortBy === 'email' ? 1 : 0.3 }}>{sortBy === 'email' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('telepon')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>NO. TELEPON <span style={{ opacity: sortBy === 'telepon' ? 1 : 0.3 }}>{sortBy === 'telepon' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('tanggal')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>TANGGAL DIBUAT <span style={{ opacity: sortBy === 'tanggal' ? 1 : 0.3 }}>{sortBy === 'tanggal' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {processedPemesanData.length > 0 ? (
                    processedPemesanData.map((item: any, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafd')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', textAlign: 'center', width: 48 }}><Text size="sm" c="dimmed" fw={500}>{item.no}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm" fw={600}>{item.nik}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm">{item.nama}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="xs" c="dimmed">{item.email}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm">{item.telepon}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm" c="dimmed">{item.tanggal}</Text></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                        <Text>Tidak ada data pemesan</Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </div>
        )}

        {/* Tab Content - Data Checkin */}
        {selectedTab === "checkin" && (
          <div className="pt-4">
            {/* TABLE CHECKIN DENGAN SCROLL */}
            <Box style={{ overflowX: 'auto', position: 'relative' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e8e8e8', backgroundColor: '#f5f7fa' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', width: 48 }}>NO</th>
                    <th onClick={() => handleSort('eticket')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>ETICKET <span style={{ opacity: sortBy === 'eticket' ? 1 : 0.3 }}>{sortBy === 'eticket' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                    <th onClick={() => handleSort('waktu')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#777', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>WAKTU CHECKIN <span style={{ opacity: sortBy === 'waktu' ? 1 : 0.3 }}>{sortBy === 'waktu' && sortDir === 'desc' ? '↓' : '↑'}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {processedCheckinData.length > 0 ? (
                    processedCheckinData.map((item: any, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafd')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', textAlign: 'center', width: 48 }}><Text size="sm" c="dimmed" fw={500}>{item.no}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm" fw={600}>{item.eticket}</Text></td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}><Text size="sm" c="dimmed">{item.waktu}</Text></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>
                        <Text>Tidak ada data checkin</Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </div>
        )}
      </Card>

      {/* Modal View Detail Transaksi */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={
          <Flex align="center" gap="sm">
            <FontAwesomeIcon icon={faReceipt} color="white" />
            <Text fw={600} c="white">Detail Transaksi</Text>
          </Flex>
        }
        size="lg"
        radius="md"
        styles={{
          header: { backgroundColor: "#0b387c", color: "white", margin: 0, borderTopLeftRadius: "8px", borderTopRightRadius: "8px", padding: "16px 20px" },
          content: { padding: 0 },
          title: { fontSize: "16px", fontWeight: 600, color: "white", flex: 1 },
          close: { color: "white", marginRight: "4px" },
          body: { padding: "20px" },
        }}
        closeButtonProps={{ "aria-label": "Close modal", style: { backgroundColor: "transparent" } }}
      >
        {selectedTransaction && (
          <Stack gap="lg">
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack gap="xs">
                <Flex justify="space-between" align="center">
                  <Text fw={600} size="sm" c="dimmed">No. Invoice</Text>
                  <Text fw={600} size="lg" className="font-mono">{selectedTransaction.invoice_no}</Text>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text fw={600} size="sm" c="dimmed">Status</Text>
                  <Badge size="lg" color={transactionStatus?.find((z) => z.id == selectedTransaction.transaction_status_id)?.bgcolor} radius="sm">
                    {transactionStatus?.find((z) => z.id == selectedTransaction.transaction_status_id)?.name}
                  </Badge>
                </Flex>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" p="lg">
              <Text fw={600} size="md" mb="md">Informasi Pembeli</Text>
              <Stack gap="sm">
                <Flex justify="space-between">
                  <Text fw={500} size="sm">Nama</Text>
                  <Text>{selectedTransaction.identities?.find((id) => id.is_pemesan == 1)?.full_name || selectedTransaction.identities?.[0]?.full_name || "-"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">Email</Text>
                  <Text>{selectedTransaction.identities?.find((id) => id.is_pemesan == 1)?.email || selectedTransaction.identities?.[0]?.email || "-"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">Tipe Transaksi</Text>
                  <Badge color={selectedTransaction.type_transaction === "online" ? "blue" : "orange"} variant="light">
                    {selectedTransaction.type_transaction?.toUpperCase()}
                  </Badge>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">Metode Pembayaran</Text>
                  {selectedTransaction.payment_method ? (
                    (() => {
                      const paymentMethodInfo = getPaymentMethod(selectedTransaction.payment_method);
                      return paymentMethodInfo ? (
                        <Badge color={paymentMethodInfo.color} variant="light" leftSection={paymentMethodInfo.icon && <FontAwesomeIcon icon={paymentMethodInfo.icon} size="xs" />}>
                          {paymentMethodInfo.label}
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="light">{selectedTransaction.payment_method.payment_name || "Tidak Ada"}</Badge>
                      );
                    })()
                  ) : <Text>-</Text>}
                </Flex>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" p="lg">
              <Text fw={600} size="md" mb="md">Ringkasan Pembayaran</Text>
              <Stack gap="sm">
                <Flex justify="space-between">
                  <Text fw={500} size="sm">Tanggal Transaksi</Text>
                  <Text>{selectedTransaction.payment_date ? moment(selectedTransaction.payment_date).format("DD MMM YYYY HH:mm:ss") : "-"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fw={500} size="sm">Total Pembayaran</Text>
                  <Text fw={700} size="lg" c="blue">Rp {(selectedTransaction.total_price || 0).toLocaleString("id-ID")}</Text>
                </Flex>
              </Stack>
            </Card>

            <Accordion variant="separated" radius="md" chevron={<FontAwesomeIcon icon={faChevronDown} />}>
              {selectedTransaction.tickets && selectedTransaction.tickets.length > 0 && (
                <Accordion.Item value="tickets">
                  <Accordion.Control icon={<FontAwesomeIcon icon={faTicketAlt} />}>
                    <Flex align="center" gap="sm">
                      <Text fw={600}>Detail Tiket</Text>
                      <Badge size="sm" color="blue" variant="light">{selectedTransaction.tickets.length} item</Badge>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="md">
                      {selectedTransaction.tickets.map((ticket, index) => (
                        <Card key={index} withBorder radius="sm" p="md" style={{ borderLeft: "4px solid #228be6" }}>
                          <Flex justify="space-between" align="start" mb="xs">
                            <div>
                              <Text fw={600} size="sm">{ticket.has_event_ticket?.name || "Tiket"}</Text>
                              <Text size="xs" c="dimmed">Qty: {ticket.qty_ticket} tiket</Text>
                            </div>
                            <Badge color="blue" variant="light">Rp {(ticket.price || 0).toLocaleString("id-ID")}</Badge>
                          </Flex>
                          <Flex justify="space-between" align="center">
                            <Text size="sm" c="dimmed">Subtotal</Text>
                            <Text fw={600} size="sm">Rp {((ticket.price || 0) * (ticket.qty_ticket || 1)).toLocaleString("id-ID")}</Text>
                          </Flex>
                        </Card>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              )}

              {selectedTransaction.transaction_merches && selectedTransaction.transaction_merches.length > 0 && (
                <Accordion.Item value="merch">
                  <Accordion.Control icon={<FontAwesomeIcon icon={faTshirt} />}>
                    <Flex align="center" gap="sm">
                      <Text fw={600}>Detail Merchandise</Text>
                      <Badge size="sm" color="green" variant="light">{selectedTransaction.transaction_merches.length} item</Badge>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="md">
                      {selectedTransaction.transaction_merches.map((merch: any, index: number) => (
                        <Card key={index} withBorder radius="sm" p="md" style={{ borderLeft: "4px solid #40c057" }}>
                          <Flex justify="space-between" align="start" mb="xs">
                            <div>
                              <Text fw={600} size="sm">Merch {index + 1}</Text>
                              {merch.product_variant?.varian_name && (
                                <Badge size="xs" color="gray" ml="sm">{merch.product_variant.varian_name}</Badge>
                              )}
                              <Text size="xs" c="dimmed">Qty: {merch.qty} pcs</Text>
                            </div>
                            <Badge color="green" variant="light">Rp {parseFloat(merch.price || "0").toLocaleString("id-ID")}</Badge>
                          </Flex>
                          <Flex justify="space-between" align="center">
                            <div>
                              <Text size="sm" c="dimmed">Subtotal</Text>
                              {merch.noted && <Text size="xs" c="dimmed" mt={4}>Catatan: {merch.noted}</Text>}
                            </div>
                            <Text fw={600} size="sm">Rp {(parseFloat(merch.price || "0") * (merch.qty || 0)).toLocaleString("id-ID")}</Text>
                          </Flex>
                        </Card>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              )}
            </Accordion>

            <Card withBorder shadow="sm" radius="md" p="lg" bg="blue.0">
              <Stack gap="xs">
                {selectedTransaction.tickets && selectedTransaction.tickets.length > 0 && (
                  <Flex justify="space-between">
                    <Text fw={500} size="sm">Subtotal Tiket</Text>
                    <Text fw={600} size="sm">Rp {selectedTransaction.tickets.reduce((sum, ticket) => sum + (ticket.price || 0) * (ticket.qty_ticket || 1), 0).toLocaleString("id-ID")}</Text>
                  </Flex>
                )}
                {selectedTransaction.transaction_merches && selectedTransaction.transaction_merches.length > 0 && (
                  <Flex justify="space-between">
                    <Text fw={500} size="sm">Subtotal Merch</Text>
                    <Text fw={600} size="sm">Rp {selectedTransaction.transaction_merches.reduce((sum, merch) => sum + parseFloat(merch.price || "0") * (merch.qty || 0), 0).toLocaleString("id-ID")}</Text>
                  </Flex>
                )}
                <Flex justify="space-between" align="center" pt="xs" style={{ borderTop: "1px solid #dee2e6" }}>
                  <Text fw={700} size="lg">Total Transaksi</Text>
                  <Text fw={800} size="xl" c="blue">Rp {(selectedTransaction.total_price || 0).toLocaleString("id-ID")}</Text>
                </Flex>
              </Stack>
            </Card>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default Merch;