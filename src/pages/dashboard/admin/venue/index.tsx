import { Delete, Get } from "@/utils/REST";
import {
  Card, Flex, ActionIcon, Group, Select, Modal,
  Tooltip, Text, Badge, Avatar, Pagination as PaginationM,
  Button as ButtonM, Stack, NumberFormatter
} from "@mantine/core";
import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import React, { useEffect, useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { Icon } from "@iconify/react/dist/iconify.js";
import _ from "lodash";
import Link from "next/link";
import { modals } from "@mantine/modals";
import type { VenueListResponse } from "../../venue/type.d.ts";

const PER_PAGE = 10;

const tableHeadStyle: React.CSSProperties = {
  padding: "12px 15px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: "#495057",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tableCellStyle: React.CSSProperties = {
  padding: "10px 15px",
  fontSize: "13px",
  color: "#495057",
  verticalAlign: "middle",
};

export default function AdminVenueManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VenueListResponse[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  // Sorting State
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

    // Client-side filtering
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase().trim();
      result = result.filter(item =>
        (item.name?.toLowerCase().includes(needle)) ||
        (item.creator?.name?.toLowerCase().includes(needle)) ||
        ((item as any).location_name?.toLowerCase().includes(needle))
      );
    }

    if (selectedCreator) {
      result = result.filter(item => String(item.creator_id) === String(selectedCreator));
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
  }, [page, debouncedSearch, selectedCreator, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);

    const params: any = {
      page: String(page),
      per_page: String(PER_PAGE),
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCreator) params.creator_id = selectedCreator;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const qs = new URLSearchParams(params).toString();

    try {
      // User specified api/venue
      const res: any = await Get(`venue?${qs}`, {});
      if (res.data) {
        // Handle different possible response structures
        const items = Array.isArray(res.data) ? res.data : (res.data.data || []);
        const totalItems = res.total || res.data.total || items.length;
        
        setData(items);
        setTotal(totalItems);
      }
    } catch (error) {
      console.error("Error fetching venue data:", error);
      notifications.show({
        title: "Gagal",
        message: "Gagal mengambil data venue. Silakan coba lagi.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const res: any = await Get("creator", {});
      if (res.data) {
        setCreators(Array.isArray(res.data) ? res.data : (res.data.data || []));
      }
    } catch (error) {
      console.error("Gagal mengambil data creator", error);
    }
  };

  const handleDelete = (id: number) => {
    const item = data.find(v => v.id === id);
    const itemName = item?.name || "venue ini";

    modals.openConfirmModal({
      centered: true,
      title: "Hapus Venue?",
      children: `Apakah anda yakin ingin menghapus venue "${itemName}"? Tindakan ini tidak dapat dibatalkan.`,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await Delete(`venue/${id}`, { admin_override: true });
          notifications.show({
            title: "Berhasil",
            message: "Venue berhasil dihapus",
            color: "green",
          });
          fetchData();
        } catch (err) {
          console.error(err);
          notifications.show({
            title: "Gagal",
            message: "Gagal menghapus venue",
            color: "red",
          });
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
      <Flex justify="space-between" align="center" mb={10}>
        <Stack gap={5}>
          <Text size="1.8rem" fw={600}>Venue Management</Text>
          <Text size="sm" c="gray">
            Kelola semua venue dari berbagai creator dalam satu tempat
          </Text>
        </Stack>
        <ButtonM
          component={Link}
          href="/dashboard/admin/venue/create"
          leftSection={<Icon icon="ph:plus-bold" className="text-lg" />}
          radius="md"
          color="blue"
          className="shadow-sm"
        >
          Tambah Venue
        </ButtonM>
      </Flex>

      <Card withBorder radius="md" p={0} className="shadow-sm overflow-hidden border-light-grey">
        <Flex justify="flex-end" align="center" gap={15} p="md" bg="white" style={{ borderBottom: "1px solid #eee" }}>
          <div style={{ width: 220 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Penyelenggara</Text>
            <Select
              placeholder="Semua Creator"
              data={creators.map(c => ({
                value: String(c.id),
                label: c.name || c.has_user?.name || "Unknown"
              }))}
              value={selectedCreator}
              onChange={(val) => {
                setSelectedCreator(val || "");
                setPage(1);
              }}
              size="sm"
              searchable
              clearable
              radius="md"
            />
          </div>
          <div style={{ width: 250 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Rentang Tanggal</Text>
            <Flex gap={5}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="h-[36px] bg-[#f1f3f5] border-none rounded-md px-3 text-xs focus:ring-1 focus:ring-[#0B387C] outline-none w-1/2"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-[36px] bg-[#f1f3f5] border-none rounded-md px-3 text-xs focus:ring-1 focus:ring-[#0B387C] outline-none w-1/2"
              />
            </Flex>
          </div>
          <div style={{ width: 220 }}>
            <Text size="xs" fw={700} c="dimmed" mb={4} ml={2}>Pencarian</Text>
            <Input
              isClearable
              value={search}
              placeholder="Cari venue..."
              onChange={(e: any) => setSearch(e.target.value)}
              onClear={() => {
                setSearch("");
                setPage(1);
              }}
              size="sm"
              startContent={<Icon icon="ph:magnifying-glass" className="text-lg text-gray-400" />}
              classNames={{
                input: "bg-[#f1f3f5] border-none",
              }}
            />
          </div>
        </Flex>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #eee" }}>
                <th style={tableHeadStyle}>No</th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("creator.name")}>
                  Creator {sortBy === "creator.name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("name")}>
                  Info Venue {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={tableHeadStyle}>Kategori</th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("location_name")}>
                  Lokasi {sortBy === "location_name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ ...tableHeadStyle, cursor: "pointer" }} onClick={() => handleSort("starting_price")}>
                  Harga Mulai {sortBy === "starting_price" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={tableHeadStyle}>Kapasitas</th>
                <th style={{ ...tableHeadStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">Sedang memuat data...</Text>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                    <Text c="dimmed">Data tidak ditemukan</Text>
                  </td>
                </tr>
              ) : (
                sortedData.map((item, i) => {
                  const creatorName = item.creator?.name || "Unknown";
                  const venueImage = item.venue_gallery?.[0]?.image_url || item.image_url;

                  return (
                    <tr key={item.id} className="table-row-hover" style={{ borderBottom: "1px solid #f8f9fa" }}>
                      <td style={tableCellStyle}>
                        <Text size="xs" c="dimmed">{(page - 1) * PER_PAGE + i + 1}</Text>
                      </td>
                      <td style={tableCellStyle}>
                        <Group gap="xs" wrap="nowrap">
                          <Avatar
                            src={item.creator?.image_url}
                            radius="sm"
                            size="sm"
                            color="blue"
                          >
                            {creatorName.substring(0, 1)}
                          </Avatar>
                          <Text size="xs" fw={700} truncate maw={150}>{creatorName}</Text>
                        </Group>
                      </td>
                      <td style={tableCellStyle}>
                        <Group gap="xs" wrap="nowrap">
                          <div style={{ width: 40, height: 40, borderRadius: 4, overflow: "hidden", border: "1px solid #eee", backgroundColor: '#f0f0f0' }}>
                            {venueImage ? (
                                <img src={venueImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <Flex align="center" justify="center" h="100%"><Icon icon="ph:image" className="text-gray-300" /></Flex>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <Text size="xs" fw={600} lineClamp={1} maw={200}>{item.name}</Text>
                            <Text size="10px" c="dimmed" truncate maw={150}>/{item.slug}</Text>
                          </div>
                        </Group>
                      </td>
                      <td style={tableCellStyle}>
                        <Badge color="blue" variant="light" radius="xs" size="xs">
                          {item.has_venue_category?.name || "Uncategorized"}
                        </Badge>
                      </td>
                      <td style={tableCellStyle}>
                        <Group gap={4} wrap="nowrap">
                          <Icon icon="ph:map-pin" className="text-gray-400 text-xs" />
                          <Text size="xs" c="dimmed" truncate maw={150}>{(item as any).location_name || item.location || "-"}</Text>
                        </Group>
                      </td>
                      <td style={tableCellStyle}>
                        <Text size="xs" fw={700} c="blue">
                          <NumberFormatter value={item.starting_price || 0} prefix="Rp " thousandSeparator="." />
                        </Text>
                      </td>
                      <td style={tableCellStyle}>
                         <Text size="xs" fw={500}>{item.max_capacity || 0} Orang</Text>
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: "center" }}>
                        <Group gap={5} justify="center">
                          <Tooltip label="Lihat Venue">
                            <ActionIcon variant="filled" color="blue" component={Link} href={`/venue/${item.slug}`} target="_blank" size="sm">
                              <Icon icon="ph:eye" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Edit Venue">
                            <ActionIcon variant="filled" color="indigo" component={Link} href={`/dashboard/admin/venue/edit/${item.id}`} size="sm">
                              <Icon icon="ph:pencil-simple" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Hapus Venue">
                            <ActionIcon variant="filled" color="red" onClick={() => handleDelete(item.id!)} size="sm">
                              <Icon icon="ph:trash" />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {total > PER_PAGE && (
          <Flex justify="center" p="md" bg="white" style={{ borderTop: "1px solid #eee" }}>
            <PaginationM
              total={Math.ceil(total / PER_PAGE)}
              value={page}
              onChange={setPage}
              color="blue"
              size="sm"
              radius="md"
            />
          </Flex>
        )}
      </Card>
    </div>
  );
}
