import { Get, Put } from "@/utils/REST";
import {
  Card, Center, Title, Flex, ActionIcon, Group, Select, Modal,
  Tooltip, SimpleGrid, Text, Badge, Avatar, Pagination as PaginationM,
  Button as ButtonM, Stack, LoadingOverlay, Divider, Paper, ScrollArea
} from "@mantine/core";
import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react/dist/iconify.js";
import moment from "moment";
import _ from "lodash";
import Link from "next/link";
import type { EventListResponse } from "../../my-event/type.d.ts";

const PER_PAGE = 10;

export default function AdminEventManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EventListResponse[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventListResponse | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);

  // Status Tabs
  const tabStatus = [
    ["all", "Semua"],
    ["1", "Disetujui"],
    ["0", "Sedang Direview"],
  ];
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchData();
    fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab, selectedCreator]);

  const fetchData = async () => {
    setLoading(true);
    const params: any = {
      page: page,
      per_page: PER_PAGE,
    };

    if (search) params.search = search;
    if (activeTab !== "all") params.main_status = activeTab;
    if (selectedCreator) params.creator_id = selectedCreator;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    try {
      const res: any = await Get(`admin-data/event`, params);
      if (res.data) {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message: "Gagal mengambil data event",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const res: any = await Get("creator", {});
      setCreators(res.data?.data || []);
    } catch (error) {
      console.error("Gagal mengambil data creator", error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setSearch("");
    setSelectedCreator("");
    setStartDate("");
    setEndDate("");
    setActiveTab("all");
    setPage(1);
  };

  const handleToggleApproval = async (id: number, status: boolean) => {
    setLoading(true);
    try {
      await Put(`admin-data/event/${id}`, {
        main_status: status ? 1 : 0,
      });
      notifications.show({
        title: "Berhasil",
        message: `Status event berhasil ${status ? "disetujui" : "dibatalkan"}`,
        color: "green",
      });
      fetchData();
      if (detailOpened) setDetailOpened(false);
    } catch (err: any) {
      notifications.show({
        title: "Gagal",
        message: err.message || "Gagal memperbarui status event",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (event: EventListResponse) => {
    setSelectedEvent(event);
    setDetailOpened(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title order={2} fw={800} className="text-[#0B387C] tracking-tight">Kelola Event</Title>
          <Text size="sm" c="dimmed" fw={500}>Monitor dan kelola persetujuan event platform</Text>
        </div>
        <Group>
          <ButtonM
            variant="light"
            color="gray"
            onClick={fetchData}
            leftSection={<Icon icon="ph:arrows-clockwise" className="text-lg" />}
            size="sm"
          >
            Refresh
          </ButtonM>
        </Group>
      </div>

      <Tabs
        variant="underlined"
        aria-label="Filter Status"
        selectedKey={activeTab}
        onSelectionChange={(key) => {
          setActiveTab(key.toString());
          setPage(1);
        }}
        classNames={{
          tabList: "gap-6",
          tab: "h-12 px-2 text-gray-500 font-medium hover:text-[#0B387C]",
          cursor: "bg-[#0B387C]",
          tabContent: "group-data-[selected=true]:text-[#0B387C]"
        }}
      >
        {tabStatus.map(([status, label]) => (
          <Tab key={status} title={label}>
            <Card withBorder radius="md" p={0} className="mt-4 shadow-sm overflow-hidden border-light-grey">
              <div className="p-5 bg-gray-50/50">
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                  <div className="flex flex-col gap-1.5">
                    <Text size="xs" fw={600} c="dimmed" className="uppercase tracking-wider">Pencarian</Text>
                    <Input
                      isClearable
                      value={search}
                      onChange={(e: any) => setSearch(e.target.value)}
                      onClear={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      placeholder="Nama Event atau Creator..."
                      size="sm"
                      startContent={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Text size="xs" fw={600} c="dimmed" className="uppercase tracking-wider">Penyelenggara</Text>
                    <Select
                      placeholder="Semua Creator"
                      data={creators.map(c => ({
                        value: String(c.id),
                        label: c.name
                      }))}
                      value={selectedCreator}
                      onChange={(val) => {
                        setSelectedCreator(val || "");
                        setPage(1);
                      }}
                      size="sm"
                      variant="filled"
                      clearable
                      searchable
                      leftSection={<Icon icon="ph:user" className="text-gray-400" />}
                      className="w-full"
                      styles={{
                        input: { backgroundColor: '#f1f3f5', border: 'none' }
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Text size="xs" fw={600} c="dimmed" className="uppercase tracking-wider">Rentang Tanggal</Text>
                    <Group gap={8} grow>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-[36px] bg-gray-100/50 border-none rounded-md px-2 text-xs focus:ring-1 focus:ring-[#0B387C] outline-none"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-[36px] bg-gray-100/50 border-none rounded-md px-2 text-xs focus:ring-1 focus:ring-[#0B387C] outline-none"
                      />
                    </Group>
                  </div>

                  <div className="flex items-end gap-2">
                    <ButtonM
                      variant="filled"
                      color="#0B387C"
                      onClick={handleSearch}
                      leftSection={<Icon icon="ph:funnel" className="text-lg" />}
                      loading={loading}
                      size="sm"
                      className="flex-1"
                    >
                      Filter
                    </ButtonM>
                    <Tooltip label="Reset semua filter">
                      <ActionIcon variant="light" color="gray" onClick={handleReset} size="lg" className="h-[36px] w-[36px]">
                        <Icon icon="ph:arrows-counter-clockwise" className="text-xl" />
                      </ActionIcon>
                    </Tooltip>
                  </div>
                </SimpleGrid>
              </div>

              <div className="overflow-x-auto relative min-h-[400px]">
                <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
                <Table
                  aria-label="Tabel Event"
                  removeWrapper
                  classNames={{
                    th: "bg-gray-50/80 text-gray-600 font-bold border-b border-light-grey h-12 uppercase text-[11px] tracking-wider",
                    td: "py-4 border-b border-light-grey",
                  }}
                >
                  <TableHeader>
                    <TableColumn width={60}>No</TableColumn>
                    <TableColumn>Event</TableColumn>
                    <TableColumn>Penyelenggara</TableColumn>
                    <TableColumn>Waktu & Lokasi</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Dibuat</TableColumn>
                    <TableColumn align="center">Aksi</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={loading ? " " : "Tidak ada event ditemukan"}
                  >
                    {data.map((item, i) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Text size="sm" fw={500} c="dimmed">{(page - 1) * PER_PAGE + i + 1}</Text>
                        </TableCell>
                        <TableCell>
                          <Group gap="sm" wrap="nowrap">
                            <div className="w-12 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                              {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Center className="h-full"><Icon icon="ph:image-square" className="text-gray-300 text-2xl" /></Center>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <Text size="sm" fw={700} className="text-gray-800" lineClamp={1}>{item.name}</Text>
                              <Text size="xs" c="dimmed" truncate>/{item.slug}</Text>
                            </div>
                          </Group>
                        </TableCell>
                        <TableCell>
                          <Group gap="xs" wrap="nowrap">
                            <Avatar src={item.has_creator?.image_url} size="sm" radius="xl" color="blue">
                              {item.has_creator?.name?.substring(0, 1)}
                            </Avatar>
                            <Text size="sm" fw={500} lineClamp={1}>{item.has_creator?.name || "Unknown"}</Text>
                          </Group>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Group gap={4} wrap="nowrap">
                              <Icon icon="ph:calendar-blank" className="text-gray-400 text-sm" />
                              <Text size="xs" fw={500}>{moment(item.start_date).format("DD MMM YYYY")}</Text>
                            </Group>
                            <Group gap={4} wrap="nowrap">
                              <Icon icon="ph:map-pin" className="text-gray-400 text-sm" />
                              <Text size="xs" fw={500} c="dimmed" lineClamp={1}>{item.location_name || item.location_city}</Text>
                            </Group>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="light"
                            color={item.main_status ? "green" : "orange"}
                            radius="sm"
                            leftSection={<Icon icon={item.main_status ? "ph:check-circle-fill" : "ph:clock-countdown-fill"} />}
                          >
                            {item.main_status ? "Disetujui" : "Review"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Text size="xs" c="dimmed">{moment(item.created_at).format("DD/MM/YY HH:mm")}</Text>
                        </TableCell>
                        <TableCell>
                          <Group gap={4} justify="center">
                            <Tooltip label="Detail Event">
                              <ActionIcon variant="light" color="#0B387C" onClick={() => openDetail(item)} size="md">
                                <Icon icon="ph:eye" className="text-lg" />
                              </ActionIcon>
                            </Tooltip>
                            {item.main_status ? (
                              <Tooltip label="Batalkan Persetujuan">
                                <ActionIcon variant="light" color="red" onClick={() => handleToggleApproval(item.id, false)} size="md">
                                  <Icon icon="ph:x-circle" className="text-lg" />
                                </ActionIcon>
                              </Tooltip>
                            ) : (
                              <Tooltip label="Setujui Event">
                                <ActionIcon variant="filled" color="green" onClick={() => handleToggleApproval(item.id, true)} size="md">
                                  <Icon icon="ph:check-circle" className="text-lg" />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </Group>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {total > PER_PAGE && (
                <div className="p-4 border-t border-gray-50 bg-white">
                  <PaginationM
                    total={Math.ceil(total / PER_PAGE)}
                    value={page}
                    onChange={setPage}
                    color="#0B387C"
                    size="sm"
                    radius="md"
                    className="justify-center"
                  />
                </div>
              )}
            </Card>
          </Tab>
        ))}
      </Tabs>

      {/* Detail Modal */}
      <Modal
        opened={detailOpened}
        onClose={() => setDetailOpened(false)}
        title={<Text fw={700} size="lg">Detail Persetujuan Event</Text>}
        size="xl"
        centered
        padding="xl"
        radius="md"
        styles={{ title: { color: '#0B387C' } }}
      >
        {selectedEvent && (
          <Stack gap="xl">
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {selectedEvent.image_url ? (
                <img src={selectedEvent.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Center className="h-full"><Icon icon="ph:image-square" className="text-gray-200 text-6xl" /></Center>
              )}
              <div className="absolute top-4 right-4">
                <Badge size="lg" color={selectedEvent.main_status ? "green" : "orange"} variant="filled">
                  {selectedEvent.main_status ? "Disetujui" : "Menunggu Review"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Stack gap="md">
                <div>
                  <Text size="xs" fw={700} c="dimmed" className="uppercase mb-1">Informasi Dasar</Text>
                  <Title order={3} className="text-gray-800 leading-tight mb-2">{selectedEvent.name}</Title>
                  <Text size="sm" c="dimmed" fw={500}>URL Slug: kolektix.com/event/{selectedEvent.slug}</Text>
                </div>

                <Divider />

                <Group gap="lg">
                  <div className="flex flex-col gap-1">
                    <Text size="xs" fw={700} c="dimmed" className="uppercase">Tanggal & Waktu</Text>
                    <Group gap={6}>
                      <Icon icon="ph:calendar" className="text-[#0B387C]" />
                      <Text size="sm" fw={600}>{moment(selectedEvent.start_date).format("DD MMMM YYYY")}</Text>
                    </Group>
                    <Text size="xs" c="dimmed" ml={26}>
                      {selectedEvent.start_time} - {selectedEvent.end_time || "Selesai"}
                    </Text>
                  </div>
                </Group>

                <div className="flex flex-col gap-1">
                  <Text size="xs" fw={700} c="dimmed" className="uppercase">Lokasi</Text>
                  <Group gap={6} align="flex-start">
                    <Icon icon="ph:map-pin" className="text-[#0B387C] mt-1" />
                    <div className="flex flex-col">
                      <Text size="sm" fw={600}>{selectedEvent.location_name}</Text>
                      <Text size="xs" c="dimmed">{selectedEvent.location_address}, {selectedEvent.location_city}</Text>
                    </div>
                  </Group>
                </div>
              </Stack>

              <Stack gap="md">
                <div>
                  <Text size="xs" fw={700} c="dimmed" className="uppercase mb-3">Penyelenggara</Text>
                  <Paper withBorder radius="md" p="md" bg="gray.50/50">
                    <Group>
                      <Avatar src={selectedEvent.has_creator?.image_url} size="lg" radius="md" />
                      <div>
                        <Text fw={700} size="sm">{selectedEvent.has_creator?.name}</Text>
                        <Text size="xs" c="dimmed">{selectedEvent.has_creator?.email || "Email tidak publik"}</Text>
                      </div>
                    </Group>
                  </Paper>
                </div>

                <div>
                  <Text size="xs" fw={700} c="dimmed" className="uppercase mb-2">Tentang Event</Text>
                  <ScrollArea.Autosize mah={150} type="scroll">
                    <Text size="sm" className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {selectedEvent.description?.replace(/<[^>]*>/g, '') || "Tidak ada deskripsi."}
                    </Text>
                  </ScrollArea.Autosize>
                </div>
              </Stack>
            </div>

            <Divider />

            <Group justify="flex-end" gap="md">
              <ButtonM variant="subtle" color="gray" onClick={() => setDetailOpened(false)}>
                Tutup
              </ButtonM>
              {selectedEvent.main_status ? (
                <ButtonM
                  variant="filled"
                  color="red"
                  leftSection={<Icon icon="ph:x-circle" />}
                  onClick={() => handleToggleApproval(selectedEvent.id, false)}
                >
                  Batalkan Persetujuan
                </ButtonM>
              ) : (
                <ButtonM
                  variant="filled"
                  color="green"
                  leftSection={<Icon icon="ph:check-circle" />}
                  onClick={() => handleToggleApproval(selectedEvent.id, true)}
                >
                  Setujui Event Sekarang
                </ButtonM>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
