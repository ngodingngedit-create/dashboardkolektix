import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowLeft, faEye, faUniversity, faWallet } from "@fortawesome/free-solid-svg-icons";
import { Get } from "@/utils/REST";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Loader,
  NumberFormatter,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useListState } from "@mantine/hooks";
import useLoggedUser from "@/utils/useLoggedUser";
import fetch from "@/utils/fetch";
import Cookies from "js-cookie";
import Link from "next/link";

interface SaldoData {
  status: boolean;
  creator_id?: number;
  total_event_transactions?: number;
  total_event_withdraws?: number;
  event_saldo?: number;
  total_order_product?: number;
  total_saldo?: number;
}

interface Bank {
  id: number;
  name: string;
  account_number: string;
  account_holder: string;
  type_bank: string;
  account_name: string;
}

interface WithdrawHistory {
  id: number;
  event_id?: number | null;
  user_id: number | null;
  user_bank_id: string;
  invoice_no: string;
  amount: number;
  name: string;
  bank_account: number | null;
  status: string;
  transaction_status_id?: number | null;
  category?: string;
  bank?: {
    type_bank?: string;
    account_name?: string;
    account_number?: string;
  } | null;
  created_at: string;
}

type ViewMode = "withdraw" | "history";

const PRIMARY = "#0B387C";
const PRIMARY_DARK = "#081F4B";

const formatRupiah = (amountVal: number | string) => {
  const num = Number(amountVal) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

const getStatusText = (statusId: any) => {
  switch (statusId) {
    case 1:
      return "Pending";
    case 2:
      return "Verified";
    case 3:
      return "Failed";
    case 4:
      return "Expired";
    default:
      return "Unknown";
  }
};

const getStatusColor = (statusId: any) => {
  switch (statusId) {
    case 1:
      return "yellow";
    case 2:
      return "green";
    case 3:
      return "red";
    case 4:
      return "gray";
    default:
      return "gray";
  }
};

const getCategoryLabel = (item: WithdrawHistory) => {
  if (item.category) return item.category;
  if (item.event_id != null) return "Event";
  return "Merchandise";
};

const PER_PAGE = 10;

const WithDraw = () => {
  const user = useLoggedUser();
  const [loading, setLoading] = useListState<string>([]);

  // ─── View ────────────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("withdraw");

  // ─── Saldo & summary ─────────────────────────────────────────────────────────
  const [saldoData, setSaldoData] = useState<SaldoData | null>(null);

  // ─── Withdraw form ───────────────────────────────────────────────────────────
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [amount, setAmount] = useState<string>("");

  // ─── Withdraw history ────────────────────────────────────────────────────────
  const [history, setHistory] = useState<WithdrawHistory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [page, setPage] = useState(1);

  const creatorId = user?.has_creator?.id;

  // ─── Data fetching ───────────────────────────────────────────────────────────
  const getSaldoData = useCallback(
    async (id: number) => {
      setLoading.append("saldo");
      try {
        const res: any = await Get(`creator/${id}/saldo`, {});
        console.log("Saldo API response:", res);
        if (res) {
          // API bisa return langsung objek { status, creator_id, ... } atau { data: {...} }
          if (res.data) {
            setSaldoData(res.data);
          } else {
            setSaldoData(res);
          }
        }
      } catch (error) {
        console.error("Error fetching saldo data:", error);
      } finally {
        setLoading.filter((e) => e !== "saldo");
      }
    },
    [setLoading]
  );

  const getBanks = useCallback(() => {
    if (!user?.id) return;
    Get(`bank-by-user/${user.id}`, {})
      .then((res: any) => {
        const data: Bank[] = res?.data ?? [];
        setBanks(data);
        setSelectedBank((prev) => prev ?? data[0] ?? null);
      })
      .catch((err) => {
        console.error("fetch banks error:", err);
        notifications.show({ title: "Error", message: "Gagal mengambil data bank", color: "red" });
      });
  }, [user?.id]);

  const getHistory = useCallback(() => {
    if (!user?.id) return;
    fetch<any, WithdrawHistory[]>({
      url: "withdraw",
      method: "GET",
      params: { user_id: user.id },
      before: () => setLoading.append("history"),
      success: (res: any) => {
        const data = Array.isArray(res) ? res : res?.data ?? [];
        setHistory(data.filter((e: WithdrawHistory) => e.user_id === user.id));
        setPage(1);
      },
      complete: () => setLoading.filter((e) => e !== "history"),
    });
  }, [user?.id, setLoading]);

  useEffect(() => {
    if (creatorId) getSaldoData(creatorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId]);

  useEffect(() => {
    if (user?.id) {
      getBanks();
      getHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const availableBalance = saldoData?.total_saldo || 0;

  const totalWithdrawn = useMemo(
    () =>
      history
        .filter((e) => e.transaction_status_id === 2)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [history]
  );

  const filteredHistory = useMemo(() => {
    let data = [...history].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (categoryFilter !== "all") {
      data = data.filter((e) => getCategoryLabel(e).toLowerCase() === categoryFilter.toLowerCase());
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      data = data.filter((e) => new Date(e.created_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter((e) => new Date(e.created_at) <= to);
    }

    return data;
  }, [history, categoryFilter, dateFrom, dateTo]);

  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredHistory.slice(start, start + PER_PAGE);
  }, [filteredHistory, page]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PER_PAGE));

  // ─── Withdraw submit ─────────────────────────────────────────────────────────
  const handleSubmitWithdraw = async () => {
    const parsedAmount = Number(String(amount).replace(/\D/g, ""));

    if (!user?.id) {
      notifications.show({ color: "red", message: "User tidak tersedia" });
      return;
    }
    if (!selectedBank) {
      notifications.show({ color: "red", message: "Pilih bank tujuan terlebih dahulu" });
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      notifications.show({ color: "red", message: "Masukkan nominal yang valid" });
      return;
    }
    if (parsedAmount < 10000) {
      notifications.show({ color: "red", message: "Minimal penarikan Rp 10.000" });
      return;
    }
    if (parsedAmount > availableBalance) {
      notifications.show({ color: "red", message: `Saldo tidak cukup. Saldo tersedia: ${formatRupiah(availableBalance)}` });
      return;
    }

    const authToken = Cookies.get("token") || process.env.NEXT_PUBLIC_API_TOKEN || "";

    await fetch<any, any>({
      url: "withdraw/store-creator",
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: {
        user_bank_id: selectedBank.id,
        amount: parsedAmount,
        name: selectedBank.account_name ?? "-",
        bank_account: selectedBank.account_number ?? "0",
        transaction_status_id: 1,
      },
      before: () => setLoading.append("submit"),
      success: () => {
        notifications.show({ color: "green", message: "Permintaan tarik dana dikirim" });
        setAmount("");
        getSaldoData(creatorId ?? 0);
        getHistory();
      },
      complete: () => setLoading.filter((e) => e !== "submit"),
      error: (err) => {
        notifications.show({
          color: "red",
          message: err?.response?.data?.error ?? err?.response?.data?.message ?? "Terjadi Kesalahan",
        });
      },
    });
  };

  const quickAmounts = [
    { label: "Rp100.000", value: "100000" },
    { label: "Rp500.000", value: "500000" },
    { label: "Rp1.000.000", value: "1000000" },
  ];

  // ─── UI components ───────────────────────────────────────────────────────────
  const renderSaldoCard = () => (
    <Card
      radius="lg"
      p={0}
      style={{
        background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})`,
        overflow: "hidden",
      }}
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap="md" p="xl" px="2rem" py="1.75rem">
        <Stack gap={6}>
          <Flex align="center" gap="sm">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesomeIcon icon={faWallet} className="text-white text-lg" />
            </div>
            <Text c="white" fw={500} size="md" opacity={0.9}>
              Total Saldo
            </Text>
          </Flex>
          <Text c="white" fw={700} size="2.1rem">
            {loading.includes("saldo") ? (
              <Loader size="sm" color="white" />
            ) : (
              formatRupiah(availableBalance)
            )}
          </Text>
        </Stack>

        <Flex gap="md" wrap="wrap">
          {viewMode === "history" ? (
            <Button
              radius="xl"
              size="md"
              color="white"
              style={{ background: "rgba(255,255,255,0.15)" }}
              leftSection={<FontAwesomeIcon icon={faArrowDown} />}
              onClick={() => setViewMode("withdraw")}
            >
              Tarik Dana
            </Button>
          ) : (
            <Button
              radius="xl"
              size="md"
              color="white"
              style={{ background: "rgba(255,255,255,0.15)" }}
              leftSection={<FontAwesomeIcon icon={faArrowLeft} />}
              onClick={() => setViewMode("history")}
            >
              History Withdraw
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  );

  const renderSummaryCards = () => {
    const items = [
      {
        title: "Total Event",
        value: saldoData?.total_event_transactions || 0,
      },
      {
        title: "Total Merchandise",
        value: saldoData?.total_order_product || 0,
      },
      {
        title: "Total Venue",
        value: 0,
      },
      {
        title: "Total Talenta",
        value: 0,
      },
    ];

    return (
      <Card radius="lg" withBorder p="lg">
        <Grid gutter="md">
          {items.map((item, index) => (
            <Grid.Col key={item.title} span={{ base: 6, md: 6, lg: 3 }}>
              <Flex
                direction="column"
                gap={4}
                pl={index > 0 ? "md" : 0}
                style={index > 0 ? { borderLeft: "1px solid #e5e7eb" } : undefined}
              >
                <Text size="xs" c="dimmed" fw={500}>
                  {item.title}
                </Text>
                <Text fw={700} size="xl">
                  {formatRupiah(item.value)}
                </Text>
              </Flex>
            </Grid.Col>
          ))}
        </Grid>
      </Card>
    );
  };

  const renderWithdrawForm = () => (
    <Card radius="lg" withBorder p="xl">
      <Stack gap="lg">
        <Title order={3}>Tarik Dana</Title>

        <Divider />

        <Grid gutter="xl">
          {/* Kolom Kiri — Bank Tujuan */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg">
              <Text fw={600} size="sm" c="gray">
                Tarik Dana ke
              </Text>

              {selectedBank ? (
                <Flex
                  align="center"
                  justify="space-between"
                  gap="lg"
                  wrap="wrap"
                  p="md"
                  style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}
                >
                  <Flex align="center" gap="md">
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 10,
                        background: "#E6EEFB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FontAwesomeIcon icon={faUniversity} className="text-primary-base text-lg" />
                    </div>
                    <Stack gap={2}>
                      <Text fw={600} size="sm">
                        Bank {selectedBank.type_bank}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {selectedBank.account_number}
                      </Text>
                      <Text size="xs" c="dimmed">
                        a.n {selectedBank.account_name}
                      </Text>
                    </Stack>
                  </Flex>
                  <Button
                    variant="subtle"
                    color="blue"
                    size="sm"
                    radius="xl"
                    onClick={() => setSelectedBank(null)}
                  >
                    Ganti Bank
                  </Button>
                </Flex>
              ) : (
                <Stack gap="sm">
                  <Select
                    placeholder="Pilih Bank"
                    data={banks.map((b) => ({
                      value: String(b.id),
                      label: `Bank ${b.type_bank} - ${b.account_number} (a.n ${b.account_name})`,
                    }))}
                    searchable
                    onChange={(val) => {
                      const bank = banks.find((b) => b.id.toString() === String(val));
                      setSelectedBank(bank || null);
                    }}
                  />
                  <Link href="/dashboard/bank?add=true" className="text-blue-600 text-sm font-medium hover:underline text-center">
                    + Tambah rekening baru
                  </Link>
                </Stack>
              )}

              {/* Info pencairan */}
              <Card radius="md" p="md" bg="#F0F7FF" withBorder={false}>
                <Flex align="center" gap="sm">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#0B387C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Text c="white" size="xs" fw={700}>i</Text>
                  </div>
                  <Text size="xs" c="dimmed">
                    <span style={{ fontWeight: 600, color: "#0B387C" }}>Informasi Pencairan Dana:</span> Dana masuk dalam <span style={{ fontWeight: 600 }}>1 - 24 jam kerja</span> (tergantung waktu bank).
                  </Text>
                </Flex>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Kolom Kanan — Nominal */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg">
              <Flex justify="space-between" align="center">
                <Text fw={600} size="sm" c="gray">
                  Nominal Tarik Dana
                </Text>
                <Text size="xs" c="dimmed">
                  Maks: {formatRupiah(availableBalance)}
                </Text>
              </Flex>
              <TextInput
                placeholder="Rp0"
                size="lg"
                radius="md"
                leftSection={<span className="text-sm text-gray-500 font-semibold">Rp</span>}
                value={Number(amount || 0).toLocaleString("id-ID")}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const num = Number(value) || 0;
                  setAmount(num <= availableBalance ? String(num) : String(availableBalance));
                }}
              />
              <ScrollArea type="never" className="w-full">
                <Flex gap="sm" wrap="wrap">
                  {quickAmounts
                    .filter((item) => Number(item.value) <= availableBalance)
                    .map((item) => (
                      <div
                        key={item.value}
                        onClick={() => setAmount(item.value)}
                        className={`cursor-pointer flex rounded-2xl items-center justify-center py-2 px-4 border ${
                          amount !== item.value
                            ? "text-gray-500 border-gray-300"
                            : "text-primary-dark border-primary-dark"
                        }`}
                      >
                        <Text size="sm" fw={500} className="whitespace-nowrap">
                          {item.label}
                        </Text>
                      </div>
                    ))}
                  {availableBalance >= 10000 && (
                    <div
                      onClick={() => setAmount(String(availableBalance))}
                      className={`cursor-pointer flex rounded-2xl items-center justify-center py-2 px-4 border ${
                        amount !== String(availableBalance)
                          ? "text-gray-500 border-gray-300"
                          : "text-primary-dark border-primary-dark"
                      }`}
                    >
                      <Text size="sm" fw={500} className="whitespace-nowrap">
                        Tarik Semua
                      </Text>
                    </div>
                  )}
                </Flex>
              </ScrollArea>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Bottom bar */}
        <Divider />
        <Flex justify="space-between" align="center" wrap="wrap" gap="md">
          <Stack gap={2}>
            <Text size="sm" c="dimmed">
              Total Penarikan
            </Text>
            <Text fw={700} size="xl" c="red">
              {formatRupiah(totalWithdrawn)}
            </Text>
          </Stack>
          <Flex gap="md">
            <Button
              radius="xl"
              size="md"
              variant="outline"
              color="gray"
              onClick={() => {
                setAmount("");
                setSelectedBank(banks[0] ?? null);
              }}
            >
              Batal
            </Button>
            <Button
              radius="xl"
              size="md"
              color="#0B387C"
              loading={loading.includes("submit")}
              disabled={
                !Boolean(Number(amount)) ||
                !Boolean(selectedBank) ||
                Number(amount) > availableBalance ||
                Number(amount) < 10000 ||
                availableBalance <= 0
              }
              onClick={handleSubmitWithdraw}
            >
              {availableBalance <= 0 ? "Saldo Tidak Tersedia" : "Tarik Dana"}
            </Button>
          </Flex>
        </Flex>
      </Stack>
    </Card>
  );

  const renderHistoryTable = () => (
    <Card radius="lg" withBorder p="xl">
      <Stack gap="lg">
        <Flex justify="space-between" align="center" wrap="wrap" gap="md">
          <Title order={3}>History Withdraw</Title>

          {/* Filter bar */}
          <Flex align="center" gap="md" wrap="wrap">
            <Select
              placeholder="Semua Kategori"
              data={[
                { value: "all", label: "Semua Kategori" },
                { value: "event", label: "Event" },
                { value: "merchandise", label: "Merchandise" },
                { value: "venue", label: "Venue" },
                { value: "talenta", label: "Talenta" },
              ]}
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val || "all");
                setPage(1);
              }}
              style={{ minWidth: 180 }}
              size="sm"
            />
            <DateInput
              value={dateFrom}
              onChange={(val) => {
                setDateFrom(val);
                setPage(1);
              }}
              placeholder="Dari Tanggal"
              valueFormat="DD MMM YYYY"
              style={{ width: 180 }}
              size="sm"
            />
            <DateInput
              value={dateTo}
              onChange={(val) => {
                setDateTo(val);
                setPage(1);
              }}
              placeholder="Sampai Tanggal"
              valueFormat="DD MMM YYYY"
              style={{ width: 180 }}
              size="sm"
            />
            {(categoryFilter !== "all" || dateFrom || dateTo) && (
              <Button
                size="sm"
                variant="light"
                color="gray"
                radius="xl"
                onClick={() => {
                  setCategoryFilter("all");
                  setDateFrom(null);
                  setDateTo(null);
                  setPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </Flex>
        </Flex>

        <Divider />

        {loading.includes("history") ? (
          <Flex justify="center" py="xl">
            <Loader />
          </Flex>
        ) : filteredHistory.length === 0 ? (
          <Alert radius={8} color="gray">
            Belum ada riwayat tarik dana
          </Alert>
        ) : (
          <>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" className="min-w-[800px]">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Tanggal</Table.Th>
                    <Table.Th>Kategori</Table.Th>
                    <Table.Th>Bank & Rekening Tujuan</Table.Th>
                    <Table.Th>Nominal</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th ta="center">Aksi</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedHistory.map((e, i) => {
                    const withdrawDate = new Date(e.created_at);
                    const formattedDate = withdrawDate.toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                    const bankName = e.bank?.type_bank ?? "Bank";
                    const accountNumber = e.bank?.account_number ?? (e.bank_account?.toString() ?? "-");
                    const accountName = e.bank?.account_name ?? e.name ?? "-";
                    const category = getCategoryLabel(e);

                    return (
                      <Table.Tr key={e.id ?? i}>
                        <Table.Td className="whitespace-nowrap">{formattedDate}</Table.Td>
                        <Table.Td className="whitespace-nowrap">
                          <Badge variant="light" color="gray" radius="sm">
                            {category}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={0}>
                            <Text size="sm" fw={500}>
                              {bankName} ({accountNumber})
                            </Text>
                            <Text size="xs" c="dimmed">
                              Rekening a.n {accountName}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td className="whitespace-nowrap">
                          <Text fw={600}>
                            <NumberFormatter value={e.amount} prefix="Rp " thousandSeparator="." decimalSeparator="," />
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(e.transaction_status_id)} variant="light">
                            {getStatusText(e.transaction_status_id)}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Button variant="subtle" size="xs" color="blue" radius="xl">
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Flex justify="flex-end" align="center" gap="md">
              <Text size="xs" c="dimmed">
                Menampilkan {filteredHistory.length} riwayat
              </Text>
              <Pagination total={totalPages} value={page} onChange={setPage} color="#0B387C" radius="xl" />
            </Flex>
          </>
        )}
      </Stack>
    </Card>
  );

  return (
    <div className="p-[20px] md:p-[30px] text-black flex flex-col gap-[25px]">
      {renderSaldoCard()}
      {renderSummaryCards()}

      {viewMode === "withdraw" ? renderWithdrawForm() : renderHistoryTable()}
    </div>
  );
};

export default WithDraw;
