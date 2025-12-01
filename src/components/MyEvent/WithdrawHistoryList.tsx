// import fetch from "@/utils/fetch";
// import { Alert, Box, Card, Flex, NumberFormatter, ScrollArea, Stack, Text } from "@mantine/core";
// import { useListState } from "@mantine/hooks";
// import { useEffect, useState } from "react";

// type ComponentProps = {
//   user_id: number;
//   setUpdate?: number;
// };

// interface WithdrawHistory {
//   id: number;
//   user_id: number;
//   user_bank_id: string;
//   user_approval: string | null;
//   invoice_no: string;
//   amount: number;
//   name: string;
//   bank_account: number;
//   status: string;
//   created_by: string | null;
//   updated_by: string | null;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
// }

// export default function WithdrawHistoryList({ user_id, setUpdate }: Readonly<ComponentProps>) {
//   const [list, setList] = useState<WithdrawHistory[]>();
//   const [loading, setLoading] = useListState<string>();

//   useEffect(() => {
//     getData();
//   }, [user_id, setUpdate]);

//   const getData = async () => {
//     if (user_id > 0) {
//       await fetch<any, WithdrawHistory[]>({
//         url: "withdraw",
//         method: "GET",
//         before: () => setLoading.append("getdata"),
//         success: (data) => data && setList((data as WithdrawHistory[]).filter((e) => e.user_id == user_id)),
//         complete: () => setLoading.filter((e) => e != "getdata"),
//       });
//     }
//   };

//   return (
//     <Box mah={200} w="100%" className={`overflow-y-auto`}>
//       <Stack gap={0}>
//         {list?.length == 0 && <Alert radius={8}>Belum ada riwayat tarik dana</Alert>}
//         {list?.map((e, i) => (
//           <Card key={i} withBorder radius={10} py={8} px={16} bg="#fafafa">
//             <Flex justify="space-between" gap={15}>
//               <Stack gap={0}>
//                 <Text>18 Nov 2024</Text>
//                 <Text size="sm" c="gray">
//                   Bank BCA, a.n {e.name}
//                 </Text>
//               </Stack>
//               <Stack gap={0} align="end">
//                 <Text fw={600}>
//                   <NumberFormatter value={e.amount} />
//                 </Text>
//                 <Text size="sm" c={e.status == "Success" ? "green" : "gray.6"} fw={600}>
//                   {e.status}
//                 </Text>
//               </Stack>
//             </Flex>
//           </Card>
//         ))}
//       </Stack>
//     </Box>
//   );
// }

import fetch from "@/utils/fetch";
import { Alert, Box, Card, Flex, NumberFormatter, Stack, Text, Badge } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

type ComponentProps = {
  user_id: number;
  setUpdate?: number;
};

interface WithdrawHistory {
  id: number;
  event_id?: number | null;
  user_id: number | null;
  user_bank_id: string;
  user_approval: string | null;
  invoice_no: string;
  amount: number;
  name: string;
  bank_account: number | null;
  status: string;
  transaction_status_id?: number | null;
  has_user?: any | null;
  bank?: {
    type_bank?: string;
    account_name?: string;
    account_number?: string;
  } | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function WithdrawHistoryList({ user_id, setUpdate }: Readonly<ComponentProps>) {
  const [list, setList] = useState<WithdrawHistory[] | undefined>(undefined);
  const [loading, setLoading] = useListState<string>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sampleCardRef = useRef<HTMLDivElement | null>(null);
  const [maxHeightPx, setMaxHeightPx] = useState<number | undefined>(undefined);

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

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id, setUpdate]);

  useEffect(() => {
    if (!list || list.length <= 1) {
      setMaxHeightPx(undefined);
      return;
    }

    const measure = () => {
      const el = sampleCardRef.current;
      if (el) {
        const h = el.getBoundingClientRect().height;
        const target = Math.ceil(h * 1.5);
        setMaxHeightPx(target);
      }
    };

    requestAnimationFrame(measure);

    let ro: ResizeObserver | null = null;
    if (sampleCardRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        measure();
      });
      ro.observe(sampleCardRef.current);
    }

    return () => {
      if (ro && sampleCardRef.current) ro.unobserve(sampleCardRef.current);
    };
  }, [list]);

  const getData = async () => {
    if (user_id > 0) {
      await fetch<any, WithdrawHistory[]>({
        url: "withdraw",
        method: "GET",
        before: () => setLoading.append("getdata"),
        success: (data) => {
          // --------------- FILTER: hanya tampilkan yang punya event_id ---------------
          const filteredByEvent = (data as WithdrawHistory[]).filter((e) => e.event_id != null); // event_id !== null/undefined
          setList(filteredByEvent);
          // --------------------------------------------------------------------------
          //
          // Jika kamu ingin menampilkan semua milik user OR yg punya event_id:
          // const filtered = (data as WithdrawHistory[]).filter(e => e.user_id == user_id || e.event_id != null);
          // setList(filtered);
        },
        complete: () => setLoading.filter((e) => e != "getdata"),
      });
    } else {
      setList([]);
    }
  };

  return (
    <Box
      w="100%"
      ref={containerRef}
      style={{
        maxHeight: maxHeightPx ? `${maxHeightPx}px` : undefined,
        overflowY: maxHeightPx ? "auto" : undefined,
      }}
      className="transition-all"
    >
      <Stack gap={8}>
        {list && list.length === 0 && <Alert radius={8}>Belum ada riwayat tarik dana terkait event</Alert>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: 12 }}>
          <style>{`
              @media (min-width: 768px) {
                .withdraw-grid {
                  display: grid;
                  grid-template-columns: repeat(1, minmax(0, 1fr));
                  gap: 12px;
                }
              }
            `}</style>

          <div className="withdraw-grid" style={{ display: "grid", gap: 12 }}>
            {list?.map((e, i) => {
              const withdrawDate = new Date(e.created_at);
              const formattedDate = withdrawDate.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const cardRef = i === 0 ? sampleCardRef : undefined;
              const bankName = e.bank?.type_bank ?? "Bank";
              const accountName = e.bank?.account_name ?? e.name ?? "-";

              return (
                <Card key={e.id ?? i} withBorder radius={10} py={8} px={16} bg="#fafafa" ref={cardRef} style={{ boxSizing: "border-box" }}>
                  <Flex justify="space-between" gap={15}>
                    <Stack gap={0}>
                      <Text>{formattedDate}</Text>
                      <Text size="sm" c="gray">
                        {bankName}, a.n {accountName}
                      </Text>
                      {/* tampilkan event_id bila perlu */}
                      {e.event_id != null && (
                        <Text size="xs" c="gray.6">
                          Event ID: {e.event_id}
                        </Text>
                      )}
                    </Stack>

                    <Stack gap={0} align="end">
                      <Text fw={600}>
                        <NumberFormatter value={e.amount} prefix="Rp " thousandSeparator="." decimalSeparator="," />
                      </Text>

                      {/* gunakan transaction_status_id untuk text + warna */}
                      <Badge color={getStatusColor(e.transaction_status_id)} variant="light">
                        {getStatusText(e.transaction_status_id)}
                      </Badge>
                    </Stack>
                  </Flex>
                </Card>
              );
            })}
          </div>
        </div>
      </Stack>
    </Box>
  );
}
