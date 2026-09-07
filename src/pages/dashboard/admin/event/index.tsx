import { Get, Put } from "@/utils/REST";
import {
  Center, Title, Flex, ActionIcon, Group, Select, Modal,
  Tooltip, SimpleGrid, Text, Badge, Avatar, Pagination as PaginationM,
  Button as ButtonM, Stack, LoadingOverlay, Divider, Paper, ScrollArea
} from "@mantine/core";
import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, Button } from "@nextui-org/react";
import React, { useEffect, useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { Icon } from "@iconify/react/dist/iconify.js";
import moment from "moment";
import _ from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import type { EventListResponse } from "../../my-event/type.d.ts";
import { useTranslation } from "react-i18next";

const PER_PAGE = 10;

export default function AdminEventManagement() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EventListResponse[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [selectedEvent, setSelectedEvent] = useState<EventListResponse | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);

  // Status Tabs
  const tabStatus = [
    ["all", t("admin.event.index.status.all")],
    ["3", t("admin.event.index.status.approved")],
    ["1", t("admin.event.index.status.review")],
  ];
  const [activeTab, setActiveTab] = useState("all");

  // Manual Sorting State
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

  const sortedData = useMemo(() => {
    let result = [...data];

    // Client-side filtering as a secondary layer
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(item =>
        (item.name?.toLowerCase().includes(needle)) ||
        (item.has_creator?.name?.toLowerCase().includes(needle)) ||
        (item.slug?.toLowerCase().includes(needle))
      );
    }

    if (selectedCreator) {
      result = result.filter(item =>
        String(item.creator_id) === String(selectedCreator) ||
        String(item.has_creator?.id) === String(selectedCreator)
      );
    }

    if (!sortBy) return result;

    return result.sort((a: any, b: any) => {
      let valA = _.get(a, sortBy) ?? "";
      let valB = _.get(b, sortBy) ?? "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortDir, debouncedSearch, selectedCreator]);

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab, selectedCreator, debouncedSearch, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);

    const params: any = {
      page: String(page),
      per_page: String(PER_PAGE),
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab !== "all") params.event_status_id = activeTab;
    if (selectedCreator) params.creator_id = selectedCreator;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    // Manually build query string to ensure correct encoding
    const qs = new URLSearchParams(params).toString();
    console.log("Fetching events with params:", qs);

    try {
      const res: any = await Get(`admin-data/event?${qs}`, {});
      if (res.data) {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      notifications.show({
        title: t("common.failed"),
        message: t("admin.event.index.toast.fetchFailed"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const res: any = await Get("creator", {});
      let creatorsData = [];

      if (Array.isArray(res.data)) {
        creatorsData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        creatorsData = res.data.data;
      } else if (res.data && res.data.items) {
        creatorsData = res.data.items;
      }

      setCreators(creatorsData);
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
        event_status_id: status ? 3 : 1,
      });
      notifications.show({
        title: t("common.success"),
        message: t("admin.event.index.toast.approveSuccess", { status: status ? t("admin.event.index.status.approved") : t("admin.event.index.status.review") }),
        color: "green",
      });
      fetchData();
      if (detailOpened) setDetailOpened(false);
    } catch (err: any) {
      notifications.show({
        title: t("common.failed"),
        message: err.message || t("admin.event.index.toast.approveFailed"),
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
      <Flex justify="space-between" align="center" mb={8}>
        <Flex align="center" gap={12}>
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label={t("admin.event.index.kembali.ke.dashboard.admin")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <Stack gap={5}>
            <Text size="1.8rem" fw={600}>{t("admin.event.index.kelola.event")}</Text>
            <Text size="sm" c="gray">{t("admin.event.index.monitor.dan.kelola.persetujuan.event.platform")}</Text>
          </Stack>
        </Flex>
        <ButtonM
          component={Link}
          href="/dashboard/admin/event/create"
          color="blue"
          leftSection={<Icon icon="ph:plus-bold" />}
          radius="md"
          size="md"
        >
          {t("admin.event.index.tambah.event")}
        </ButtonM>
      </Flex>

      <Tabs
        variant="underlined"
        aria-label={t("admin.event.index.filter.status")}
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
            <div className="mt-0">
              <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
                <div className="flex flex-col gap-1.5 w-60">
                  <Text size="xs" fw={700} c="gray.6" className="uppercase tracking-wider">{t("admin.event.index.penyelenggara")}</Text>
                  <Select
                    placeholder={t("admin.event.index.semua.creator")}
                    data={creators.map(c => ({
                      value: String(c.id),
                      label: c.name || c.name_event_organizer || t("admin.event.index.placeholder.creatorName")
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
                    styles={{
                      input: { backgroundColor: '#f1f3f5', border: 'none', height: '36px' }
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Text size="xs" fw={700} c="gray.6" className="uppercase tracking-wider">{t("admin.event.index.rentang.tanggal")}</Text>
                  <Group gap={8} wrap="nowrap">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-[36px] bg-[#f1f3f5] border-none rounded-md px-3 text-xs focus:ring-1 focus:ring-[#0B387C] outline-none w-32"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-[36px] bg-[#f1f3f5] border-none rounded-md px-3 text-xs focus:ring-1 focus:ring-[#0B387C] outline-none w-32"
                    />
                  </Group>
                </div>

                <div className="flex flex-col gap-1.5 w-72">
                  <Text size="xs" fw={700} c="gray.6" className="uppercase tracking-wider">{t("admin.event.index.pencarian")}</Text>
                  <Input
                    isClearable
                    value={search}
                    onChange={(e: any) => setSearch(e.target.value)}
                    onClear={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    placeholder={t("admin.event.index.nama.event.atau.creator")}
                    size="sm"
                    startContent={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
                    className="w-full h-[36px]"
                    classNames={{
                      input: "bg-[#f1f3f5] border-none",
                    }}
                  />
                </div>
              </Flex>

              <div className="w-full bg-white overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e8e8e8' }}>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', width: 60 }}>{t("admin.event.index.no")}</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                        {t("admin.event.index.event")} {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↑</span>}
                      </th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('has_creator.name')}>
                        {t("admin.event.index.penyelenggara")} {sortBy === 'has_creator.name' ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↑</span>}
                      </th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('start_date')}>
                        {t("admin.event.index.waktu.lokasi")} {sortBy === 'start_date' ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↑</span>}
                      </th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('event_status_id')}>
                        {t("admin.event.index.status")} {sortBy === 'event_status_id' ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↑</span>}
                      </th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                        {t("admin.event.index.dibuat")} {sortBy === 'created_at' ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↑</span>}
                      </th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', position: 'sticky', right: 0, backgroundColor: '#f8f9fa', zIndex: 2, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                        {t("admin.event.index.aksi")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                          <Text c="dimmed">{loading ? t("admin.event.index.tabel.loadingEmpty") : t("admin.event.index.tabel.noData")}</Text>
                        </td>
                      </tr>
                    ) : (
                      sortedData.map((item: EventListResponse, i: number) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafd')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <Text size="sm" fw={500} c="dimmed">{(page - 1) * PER_PAGE + i + 1}</Text>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Group gap="sm" wrap="nowrap">
                              <div className="w-12 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                {item.image_url ? (
                                  <img src={item.image_url || undefined} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Center className="h-full"><Icon icon="ph:image-square" className="text-gray-300 text-2xl" /></Center>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <Text size="sm" fw={700} className="text-gray-800" lineClamp={1}>{item.name}</Text>
                                <Text size="xs" c="dimmed" truncate>/{item.slug}</Text>
                              </div>
                            </Group>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Group gap="xs" wrap="nowrap">
                              <Avatar src={item.has_creator?.image_url || undefined} size="sm" radius="xl" color="blue">
                                {item.has_creator?.name?.substring(0, 1)}
                              </Avatar>
                              <Text size="sm" fw={500} lineClamp={1}>{item.has_creator?.name || t("admin.event.index.fallback.unknown")}</Text>
                            </Group>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
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
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Badge
                              variant="filled"
                              radius="sm"
                              size="sm"
                              leftSection={<Icon icon={item.event_status_id === 3 ? "ph:check-circle-fill" : "ph:clock-countdown-fill"} />}
                              styles={{
                                root: {
                                  textTransform: 'uppercase',
                                  fontWeight: 800,
                                  backgroundColor: item.event_status_id === 3 ? '#40c057' : '#fab005',
                                  color: 'white',
                                  border: 'none',
                                  paddingLeft: '8px',
                                  paddingRight: '8px'
                                }
                              }}
                            >
                              {item.event_status_id === 3 ? t("admin.event.index.status.approved") : t("admin.event.index.status.review")}
                            </Badge>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Text size="xs" c="dimmed">{moment(item.created_at).format("DD/MM/YY HH:mm")}</Text>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                            <Group gap={8} justify="center">
                              <Tooltip label={t("admin.event.index.view.detail.event")}>
                                <ActionIcon variant="filled" color="cyan" component={Link} href={`/dashboard/admin/event/view/${item.slug_url}`} size="md" radius="sm">
                                  <Icon icon="ph:eye" className="text-lg" />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label={t("admin.event.index.edit.event")}>
                                <ActionIcon variant="filled" color="indigo" component={Link} href={`/dashboard/admin/event/edit/${item.slug_url}`} size="md" radius="sm">
                                  <Icon icon="ph:pencil-simple" className="text-lg" />
                                </ActionIcon>
                              </Tooltip>
                              {item.event_status_id === 3 ? (
                                <Tooltip label={t("admin.event.index.batalkan.persetujuan")}>
                                  <ActionIcon variant="filled" color="red" onClick={() => handleToggleApproval(item.id, false)} size="md" radius="sm">
                                    <Icon icon="ph:x-circle" className="text-lg" />
                                  </ActionIcon>
                                </Tooltip>
                              ) : (
                                <Tooltip label={t("admin.event.index.setujui.event")}>
                                  <ActionIcon variant="filled" color="green" onClick={() => handleToggleApproval(item.id, true)} size="md" radius="sm">
                                    <Icon icon="ph:check-circle" className="text-lg" />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </Group>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {total > PER_PAGE && (
                <div className="p-4 border-t border-light-grey bg-white">
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
            </div>
          </Tab>
        ))}
      </Tabs>

      {/* Detail Modal */}
      <Modal
        opened={detailOpened}
        onClose={() => setDetailOpened(false)}
        title={<Text fw={700} size="lg">{t("admin.event.index.detail.persetujuan.event")}</Text>}
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
                <img src={selectedEvent.image_url || undefined} alt="" className="w-full h-full object-cover" />
              ) : (
                <Center className="h-full"><Icon icon="ph:image-square" className="text-gray-200 text-6xl" /></Center>
              )}
              <div className="absolute top-4 right-4">
                <Badge size="lg" color={selectedEvent.event_status_id === 3 ? "green" : "orange"} variant="filled">
                  {selectedEvent.event_status_id === 3 ? t("admin.event.index.modal.badgeApproved") : t("admin.event.index.modal.badgeReview")}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Stack gap="md">
                <div>
                  <Text size="xs" fw={700} c="dimmed" className="uppercase mb-1">{t("admin.event.index.informasi.dasar")}</Text>
                  <Title order={3} className="text-gray-800 leading-tight mb-2">{selectedEvent.name}</Title>
                  <Text size="sm" c="dimmed" fw={500}>{t("admin.event.index.url.slug.kolektix.com.event")}{selectedEvent.slug}</Text>
                </div>

                <Divider />

                <Group gap="lg">
                  <div className="flex flex-col gap-1">
                    <Text size="xs" fw={700} c="dimmed" className="uppercase">{t("admin.event.index.tanggal.waktu")}</Text>
                    <Group gap={6}>
                      <Icon icon="ph:calendar" className="text-[#0B387C]" />
                      <Text size="sm" fw={600}>{moment(selectedEvent.start_date).format("DD MMMM YYYY")}</Text>
                    </Group>
                    <Text size="xs" c="dimmed" ml={26}>
                      {selectedEvent.start_time} - {selectedEvent.end_time || t("admin.event.index.modal.endTime")}
                    </Text>
                  </div>
                </Group>

                <div className="flex flex-col gap-1">
                  <Text size="xs" fw={700} c="dimmed" className="uppercase">{t("admin.event.index.lokasi")}</Text>
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
                  <Text size="xs" fw={700} c="dimmed" className="uppercase mb-3">{t("admin.event.index.penyelenggara")}</Text>
                  <Paper withBorder radius="md" p="md" bg="gray.50/50">
                    <Group>
                      <Avatar src={selectedEvent.has_creator?.image_url || undefined} size="lg" radius="md" />
                      <div>
                        <Text fw={700} size="sm">{selectedEvent.has_creator?.name}</Text>
                        <Text size="xs" c="dimmed">{selectedEvent.has_creator?.email || t("admin.event.index.modal.emailNotPublic")}</Text>
                      </div>
                    </Group>
                  </Paper>
                </div>

                <div>
                  <Text size="xs" fw={700} c="dimmed" className="uppercase mb-2">{t("admin.event.index.tentang.event")}</Text>
                  <ScrollArea.Autosize mah={150} type="scroll">
                    <Text size="sm" className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {selectedEvent.description?.replace(/<[^>]*>/g, '') || t("admin.event.index.modal.noDescription")}
                    </Text>
                  </ScrollArea.Autosize>
                </div>
              </Stack>
            </div>

            <Divider />

            <Group justify="flex-end" gap="md">
              <ButtonM variant="subtle" color="gray" onClick={() => setDetailOpened(false)}>
                {t("admin.event.index.tutup")}
              </ButtonM>
              <ButtonM
                component={Link}
                href={`/dashboard/admin/event/edit/${selectedEvent.id}`}
                variant="outline"
                color="indigo"
                leftSection={<Icon icon="ph:pencil-simple" />}
              >
                {t("admin.event.index.edit.event")}
              </ButtonM>
              {selectedEvent.event_status_id === 3 ? (
                <ButtonM
                  variant="filled"
                  color="red"
                  leftSection={<Icon icon="ph:x-circle" />}
                  onClick={() => handleToggleApproval(selectedEvent.id, false)}
                >
                  {t("admin.event.index.batalkan.persetujuan")}
                </ButtonM>
              ) : (
                <ButtonM
                  variant="filled"
                  color="green"
                  leftSection={<Icon icon="ph:check-circle" />}
                  onClick={() => handleToggleApproval(selectedEvent.id, true)}
                >
                  {t("admin.event.index.setujui.event.sekarang")}
                </ButtonM>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
