import fetch from "@/utils/fetch";
import { Alert, Box, Card, Flex, NumberFormatter, ScrollArea, Stack, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useEffect, useState } from "react";

type ComponentProps = {
  user_id: number;
  setUpdate?: number;
};

interface WithdrawHistory {
  id: number;
  user_id: number;
  user_bank_id: string;
  user_approval: string | null;
  invoice_no: string;
  amount: number;
  name: string;
  bank_account: number;
  status: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function WithdrawHistoryList({ user_id, setUpdate }: Readonly<ComponentProps>) {
  const [list, setList] = useState<WithdrawHistory[]>();
  const [loading, setLoading] = useListState<string>();

  useEffect(() => {
    getData();
  }, [user_id, setUpdate]);

  const getData = async () => {
    if (user_id > 0) {
      await fetch<any, WithdrawHistory[]>({
        url: "withdraw",
        method: "GET",
        before: () => setLoading.append("getdata"),
        success: (data) => data && setList((data as WithdrawHistory[]).filter((e) => e.user_id == user_id)),
        complete: () => setLoading.filter((e) => e != "getdata"),
      });
    }
  };

  return (
    <Box mah={200} w="100%" className={`overflow-y-auto`}>
      <Stack gap={0}>
        {list?.length == 0 && <Alert radius={8}>Belum ada riwayat tarik dana</Alert>}
        {list?.map((e, i) => (
          <Card key={i} withBorder radius={10} py={8} px={16} bg="#fafafa">
            <Flex justify="space-between" gap={15}>
              <Stack gap={0}>
                <Text>18 Nov 2024</Text>
                <Text size="sm" c="gray">
                  Bank BCA, a.n {e.name}
                </Text>
              </Stack>
              <Stack gap={0} align="end">
                <Text fw={600}>
                  <NumberFormatter value={e.amount} />
                </Text>
                <Text size="sm" c={e.status == "Success" ? "green" : "gray.6"} fw={600}>
                  {e.status}
                </Text>
              </Stack>
            </Flex>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
