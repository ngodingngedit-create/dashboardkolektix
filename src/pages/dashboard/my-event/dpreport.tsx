import { Badge, Box, Card, Flex, Select, Stack, Text, Title, Pagination, Button, SegmentedControl, Input, ActionIcon, Modal, Group, Accordion, Table, Divider, TextInput, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import React, { useEffect, useMemo, useState } from "react";
import { useDidUpdate, useListState } from "@mantine/hooks";
import moment from "moment";
import Cookies from "js-cookie";
import { EventListResponse, DownpaymentData } from "./type";
import useLoggedUser from "@/utils/useLoggedUser";
import axios from "axios";
import config from "@/Config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faFilter, faSearch, faFileExcel, faMoneyBillWave, faReceipt, faInfoCircle, faCalendarDays, faUser, faEnvelope, faGlobe, faWallet } from "@fortawesome/free-solid-svg-icons";

const DPReport = () => {
  const [isr, setIsr] = useState(false);
  const [allDataList, setAllDataList] = useState<DownpaymentData[]>([]);
  const [eventList, setEventList] = useState<EventListResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | "all">("all");
  const [loading, setLoading] = useListState<string>();
  const [searchValue, setSearchValue] = useState<string>("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDP, setSelectedDP] = useState<DownpaymentData | null>(null);
  const user = useLoggedUser();

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setIsr(true);
  }, []);

  useDidUpdate(() => {
    fetchEvents();
  }, [isr]);

  useEffect(() => {
    if (isr) {
      loadDPData();
    }
  }, [isr, selectedEvent]);

  const fetchEvents = async () => {
    setLoading.append("fetchEvents");
    try {
      const response = await axios.get(`${config.wsUrl}event`);
      if (response.data?.data && Array.isArray(response.data.data)) {
        const creatorIdNumber = Number(user?.has_creator?.id);
        const filteredEvents = response.data.data.filter((e: any) => Number(e.creator_id) === creatorIdNumber);
        setEventList(filteredEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading.filter((e) => e !== "fetchEvents");
    }
  };

  const loadDPData = async () => {
    setLoading.append("loadData");
    try {
      const apiUrl = `${config.wsUrl}downpayment/creator`;
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        let data = response.data.data;
        if (selectedEvent !== "all") {
          data = data.filter((item: DownpaymentData) => item.event_id === Number(selectedEvent));
        }
        setAllDataList(data);
      }
    } catch (error) {
      console.error("Error loading DP data:", error);
      setAllDataList([]);
    } finally {
      setLoading.filter((e) => e !== "loadData");
    }
  };

  const filteredData = useMemo(() => {
    if (!searchValue) return allDataList;
    const q = searchValue.toLowerCase();
    return allDataList.filter((item) => {
      const dpNo = item.downpayment_no?.toLowerCase() || "";
      const pemesan = item.identities?.find(id => id.is_pemesan === 1)?.full_name?.toLowerCase() || "";
      const email = item.identities?.find(id => id.is_pemesan === 1)?.email?.toLowerCase() || "";
      return dpNo.includes(q) || pemesan.includes(q) || email.includes(q);
    });
  }, [allDataList, searchValue]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const exportToExcel = () => {
    if (!filteredData.length) return;
    const headers = ["No", "No. DP", "Nama Pemesan", "Email", "Event", "Total Tiket", "Grand Total", "Terbayar", "Sisa", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredData.map((item, index) => {
        const pemesan = item.identities?.find(id => id.is_pemesan === 1) || item.identities?.[0];
        return [
          index + 1,
          `"${item.downpayment_no}"`,
          `"${pemesan?.full_name || "-"}"`,
          `"${pemesan?.email || "-"}"`,
          `"${item.event?.name || "-"}"`,
          item.total_qty,
          item.grandtotal,
          item.paid_amount,
          item.remaining_amount,
          `"${item.payment_status}"`
        ].join(",");
      })
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-dp-${moment().format("YYYY-MM-DD")}.csv`;
    link.click();
  };

  if (!isr) return <></>;

  return (
    <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
      <Flex justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">Down Payment Report</Title>
          <Text size="sm" c="gray">Kelola dan pantau transaksi Down Payment event Anda</Text>
        </Stack>
        <Group>
          <Select
            placeholder="Pilih Event"
            data={[{ value: "all", label: "Semua Event" }, ...eventList.map(e => ({ value: String(e.id), label: e.name }))]}
            value={String(selectedEvent)}
            onChange={(val) => setSelectedEvent(val as any)}
            style={{ width: 250 }}
            searchable
            clearable={false}
          />
          <Button 
            onClick={exportToExcel} 
            color="green" 
            leftSection={<FontAwesomeIcon icon={faFileExcel} />}
            disabled={filteredData.length === 0}
          >
            Export Excel
          </Button>
        </Group>
      </Flex>

      <Card withBorder p={0}>
        <Box p="md" style={{ borderBottom: '1px solid #eee' }}>
          <Flex gap="md" align="center">
            <TextInput
              placeholder="Cari No. DP, Nama, atau Email..."
              leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ flexGrow: 1 }}
            />
          </Flex>
        </Box>

        <Box className="overflow-x-auto">
          <Table verticalSpacing="sm" highlightOnHover>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">No</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">No. DP</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Pemesan</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Event</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Tiket</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Total</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Terbayar</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Sisa</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading.includes("loadData") ? (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    <Text c="gray">Memuat data...</Text>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    <Text c="gray">Tidak ada data ditemukan</Text>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const pemesan = item.identities?.find(id => id.is_pemesan === 1) || item.identities?.[0];
                  return (
                    <tr key={item.id}>
                      <td className="px-4">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-4 font-mono text-xs font-bold text-blue-600">{item.downpayment_no}</td>
                      <td className="px-4">
                        <Text size="sm" fw={500}>{pemesan?.full_name || "-"}</Text>
                        <Text size="xs" c="gray">{pemesan?.email || "-"}</Text>
                      </td>
                      <td className="px-4">
                        <Text size="sm" className="line-clamp-1">{item.event?.name || "-"}</Text>
                      </td>
                      <td className="px-4 text-center">{item.total_qty}</td>
                      <td className="px-4 text-right">Rp {item.grandtotal.toLocaleString("id-ID")}</td>
                      <td className="px-4 text-right text-green-600 font-medium">Rp {item.paid_amount.toLocaleString("id-ID")}</td>
                      <td className="px-4 text-right text-red-600 font-medium">Rp {item.remaining_amount.toLocaleString("id-ID")}</td>
                      <td className="px-4 text-center">
                        <Badge 
                          color={item.payment_status === "Paid" ? "green" : item.payment_status === "Partial Paid" ? "blue" : "gray"}
                          variant="light"
                        >
                          {item.payment_status}
                        </Badge>
                      </td>
                      <td className="px-4 text-center">
                        <ActionIcon 
                          color="blue" 
                          variant="light" 
                          onClick={() => {
                            setSelectedDP(item);
                            setViewModalOpen(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} size="sm" />
                        </ActionIcon>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Box>

        {totalPages > 1 && (
          <Box p="md" style={{ borderTop: '1px solid #eee' }}>
            <Flex justify="center">
              <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} color="blue" />
            </Flex>
          </Box>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={<Text fw={700}>Detail Down Payment - {selectedDP?.downpayment_no}</Text>}
        size="lg"
      >
        {selectedDP && (
          <Stack gap="md">
            <div className="grid grid-cols-2 gap-4">
              <Box p="sm" className="bg-gray-50 rounded-lg">
                <Text size="xs" c="gray" fw={700} tt="uppercase">Informasi Pemesan</Text>
                <Divider my={5} />
                <Group gap="xs" mt={5}>
                  <FontAwesomeIcon icon={faUser} size="xs" className="text-gray-400" />
                  <Text size="sm" fw={600}>{selectedDP.identities?.find(id => id.is_pemesan === 1)?.full_name || "-"}</Text>
                </Group>
                <Group gap="xs" mt={3}>
                  <FontAwesomeIcon icon={faEnvelope} size="xs" className="text-gray-400" />
                  <Text size="sm">{selectedDP.identities?.find(id => id.is_pemesan === 1)?.email || "-"}</Text>
                </Group>
              </Box>
              <Box p="sm" className="bg-gray-50 rounded-lg">
                <Text size="xs" c="gray" fw={700} tt="uppercase">Informasi Event</Text>
                <Divider my={5} />
                <Text size="sm" fw={600} className="line-clamp-1">{selectedDP.event?.name}</Text>
                <Text size="xs" c="gray">{moment(selectedDP.event?.start_date).format("DD MMM YYYY")}</Text>
              </Box>
            </div>

            <Box>
              <Text size="xs" c="gray" fw={700} tt="uppercase">Daftar Tiket</Text>
              <Table variant="simple" mt="xs" withColumnBorders withTableBorder>
                <thead className="bg-gray-100">
                  <tr>
                    <th>Tiket</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Harga</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDP.tickets.map((t) => (
                    <tr key={t.id}>
                      <td className="text-xs font-bold">{t.code}</td>
                      <td className="text-center text-xs">{t.qty_ticket}</td>
                      <td className="text-right text-xs">Rp {t.price.toLocaleString("id-ID")}</td>
                      <td className="text-right text-xs font-semibold">Rp {t.subtotal_price.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>

            <Box>
              <Text size="xs" c="gray" fw={700} tt="uppercase">Jadwal Cicilan</Text>
              <Accordion variant="separated" mt="xs">
                {selectedDP.installments.map((inst) => (
                  <Accordion.Item key={inst.id} value={inst.title}>
                    <Accordion.Control>
                      <Flex justify="space-between" align="center" w="100%" pr="md">
                        <Text size="sm" fw={600}>{inst.title} ({inst.percentage}%)</Text>
                        <Badge color={inst.payment_status === "Paid" ? "green" : "orange"} size="sm">
                          {inst.payment_status}
                        </Badge>
                      </Flex>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        <Flex justify="space-between">
                          <Text size="xs" c="gray">Jumlah Tagihan:</Text>
                          <Text size="xs" fw={700}>Rp {inst.grandtotal.toLocaleString("id-ID")}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text size="xs" c="gray">Jatuh Tempo:</Text>
                          <Text size="xs">{moment(inst.due_date).format("DD MMMM YYYY")}</Text>
                        </Flex>
                        {inst.payment_status === "Paid" && (
                          <Flex justify="space-between">
                            <Text size="xs" c="gray">Metode Pembayaran:</Text>
                            <Text size="xs" className="uppercase">{inst.payment_channel || "-"}</Text>
                          </Flex>
                        )}
                        {inst.payment_status === "Pending" && inst.xendit_url && (
                          <Button 
                            component="a" 
                            href={inst.xendit_url} 
                            target="_blank" 
                            size="xs" 
                            variant="light" 
                            fullWidth
                            mt={5}
                          >
                            Buka Link Pembayaran
                          </Button>
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Box>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default DPReport;
