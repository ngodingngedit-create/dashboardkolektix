import TableData from "@/components/TableData";
import { Pagination } from "@/types/model";
import fetch from "@/utils/fetch";
import { EventProps } from "@/utils/globalInterface";
import { LoadingOverlay, Stack, Flex, Text, Image, Group, Avatar, Badge } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import moment from "moment";
import { ReactNode, useEffect, useState } from "react";

type DataResponse = EventProps;

export default function VenueTransaction() {
  const [loading, setLoading] = useListState<string>();
  const [data, setData] = useState<Pagination<DataResponse>>();

  useEffect(() => {
    getData();
  }, []);

  const getData = async (params?: string) => {
    if (!loading.includes("getdata"))
      await fetch<any, Pagination<DataResponse>>({
        url: "admin-data/event?" + params,
        method: "GET",
        data: {},
        before: () => setLoading.append("getdata"),
        success: ({ data }) => data && setData(data),
        complete: () => setLoading.filter((e) => e != "getdata"),
        error: () => {},
      });
  };

  return (
    <>
      <Stack className={`p-[20px] md:p-[30px]`} gap={30}>
        <LoadingOverlay visible={loading.includes("getdata")} />
        <Flex gap={10} justify="space-between" align="center">
          <Stack gap={5}>
            <Text size="1.8rem" fw={600}>
              Semua Event
            </Text>
            <Text size="sm" c="gray">
              Daftar semua event
            </Text>
          </Stack>
        </Flex>

        <TableData
          loading={loading.includes("getdata")}
          value={data}
          onChange={getData}
          data={(data?.data ?? []) as any}
          mapData={(e: any) => ({
            created_at: moment(e.created_at as string).format("DD MMM YYYY"),
            image: <Image src={e.image_url} w={50} />,
            name: e.name,
            creator: (
              <Group align="center">
                <Avatar src={e?.has_creator?.image_url} />
                <Text>{e?.has_creator?.name}</Text>
              </Group>
            ),
            status: (
              <Badge color={Boolean(e?.main_status) ? "green" : "gray"} variant="light" className={`[&_*]:text-[12px]`}>
                {Boolean(e?.main_status) ? "Disetujui" : "Sedang direview"}
              </Badge>
            ),
          })}
          headerLabel={{
            created_at: "Tanggal Dibuat",
            image: "Banner",
            name: "Nama Event",
            creator: "Penyelenggara",
            status: "Status Event",
          }}
          actionIcon={[{ icon: "uiw:right", text: "Lihat Detail" }]}
        />
      </Stack>
    </>
  );
}
