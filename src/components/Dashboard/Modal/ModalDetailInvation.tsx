// import fetch from "@/utils/fetch";
// import { AspectRatio, Flex, Image, Stack, Textarea, TextInput, Button as ButtonM, Card, Text, Table, ScrollArea } from "@mantine/core";
// import { useDidUpdate, useListState } from "@mantine/hooks";
// import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem } from "@nextui-org/react";
// import { useState } from "react";
// import { CategoryResponse } from "./ModalAddInvation";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import Link from "next/link";
// import config from "@/Config";

// interface InvitationDetail {
//   id: number;
//   event_id: number;
//   invitation_cat_id: number;
//   invitation_title: string;
//   invitation_description: string;
//   total_qty: number;
//   invitation_status: number;
//   created_by: string; // Jika ingin menampilkan siapa yang membuat undangan
//   image?: string;
//   image_url?: string;
// }

// const InvitationDetailModal = ({ invitation, isOpen, onClose }: { invitation: InvitationDetail | null; isOpen: boolean; onClose: () => void }) => {
//   const [loading, setLoading] = useListState<string>();
//   const [category, setCategory] = useState<CategoryResponse[]>();
//   const [data, setData] = useState<EventInvitationResponse>();

//   useDidUpdate(() => {
//     if (isOpen && !category && invitation) getCategory();
//     if (!data) getData();
//   }, [isOpen]);

//   const getCategory = async () => {
//     await fetch<any, CategoryResponse[]>({
//       url: 'invitation-category',
//       method: 'GET',
//       data: {},
//       before: () => setLoading.append('getcategory'),
//       success: ({ data }) => data && setCategory(data),
//       complete: () => setLoading.filter(e => e != 'getcategory'),
//       error: () => {},
//     });
//   }

//   const getData = async () => {
//     await fetch<any, any>({
//       url: `invitations/${invitation?.id}`,
//       method: 'GET',
//       data: {},
//       before: () => setLoading.append('getdata'),
//       success: (data) => data && setData(data as EventInvitationResponse),
//       complete: () => setLoading.filter(e => e != 'getdata'),
//       error: () => {},
//     });
//   }

//   return (
//     <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="5xl">
//       <ModalContent>
//         <>
//           <ModalHeader className="flex flex-col gap-1 text-dark">
//             Detail Undangan
//           </ModalHeader>
//           <ModalBody className="text-dark">
//             <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack maw={350}>
//                 {(data?.image) && (
//                   <AspectRatio ratio={3/1}>
//                     <Image radius={10} src={invitation?.image_url ?? data?.image ?? '#'} bg="gray.1" />
//                   </AspectRatio>
//                 )}

//                 <TextInput
//                   readOnly
//                   variant="filled"
//                   label="Judul Undangan"
//                   value={invitation?.invitation_title}
//                 />

//                 <Textarea
//                   readOnly
//                   variant="filled"
//                   label="Deskripsi Undangan"
//                   value={invitation?.invitation_description}
//                 />

//                 <Flex wrap="wrap" gap={10} className={`[&>*]:flex-grow`}>
//                   <TextInput
//                     readOnly
//                     variant="filled"
//                     label="Kategori"
//                     value={category?.find(e => e.id == invitation?.invitation_cat_id)?.name ?? '-'}
//                   />
//                   <TextInput
//                     readOnly
//                     variant="filled"
//                     label="Total"
//                     value={invitation?.total_qty}
//                   />
//                 </Flex>
//               </Stack>
//               <Stack gap={10} className={`[&_th]:font-[400]`}>
//                 <Text c="gray" size="sm">Data Penerima</Text>
//                 <Card className={``} p={0} radius={10} withBorder>
//                   <ScrollArea>
//                     <Table
//                       w="100%"
//                       data={{
//                         head: ['Nama', 'Email', 'No. Telp', 'E-ticket'],
//                         body: (data?.event_invitation_detail ?? []).map((e, i) => [
//                           e.fullname,
//                           e.email,
//                           e.phone,
//                           <ButtonM
//                             key={i}
//                             size="xs"
//                             variant="light"
//                             component={Link}
//                             href={`${config['wsUrl']}invitations/eticket/${e.id}`}
//                             target="_blank">
//                             Unduh Etiket
//                           </ButtonM>
//                         ]),
//                       }}
//                     />
//                   </ScrollArea>
//                 </Card>
//               </Stack>
//             </Flex>
//           </ModalBody>
//           <ModalFooter>
//             <Flex gap={10}>
//               {/* <ButtonM component={Link} href="#" target="_blank" rightSection={<Icon icon="mdi:invoice-text-outline" />}>
//                 Unduh Etiket
//               </ButtonM> */}
//               <ButtonM variant="light" color="gray" onClick={onClose} rightSection={<Icon icon="uiw:down" />}>
//                 Tutup Detail
//               </ButtonM>
//             </Flex>
//           </ModalFooter>
//         </>
//       </ModalContent>
//     </Modal>
//   );
// };

// export default InvitationDetailModal;

import fetch from "@/utils/fetch";
import { AspectRatio, Flex, Image, Stack, Textarea, TextInput, Button as ButtonM, Card, Text, Table, ScrollArea } from "@mantine/core";
import { useDidUpdate, useListState } from "@mantine/hooks";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { CategoryResponse } from "./ModalAddInvation";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import config from "@/Config";

interface EventInvitationDetail {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  // tambahkan properti lain sesuai kebutuhan
}

interface EventInvitationResponse {
  id: number;
  event_id: number;
  invitation_cat_id: number;
  invitation_title: string;
  invitation_description: string;
  total_qty: number;
  invitation_status: number;
  created_by: string;
  image?: string;
  image_url?: string;
  event_invitation_detail: EventInvitationDetail[];
  has_user?: {
    email: string;
    // tambahkan properti lain
  };
  // tambahkan properti lain sesuai response API
}

interface InvitationDetail {
  id: number;
  event_id: number;
  invitation_cat_id: number;
  invitation_title: string;
  invitation_description: string;
  total_qty: number;
  invitation_status: number;
  created_by: string;
  image?: string;
  image_url?: string;
}

const InvitationDetailModal = ({ invitation, isOpen, onClose }: { invitation: InvitationDetail | null; isOpen: boolean; onClose: () => void }) => {
  const [loading, setLoading] = useListState<string>();
  const [category, setCategory] = useState<CategoryResponse[]>();
  const [data, setData] = useState<EventInvitationResponse | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Reset data saat modal ditutup
  const handleClose = () => {
    setData(null);
    setLastFetchTime(0);
    onClose();
  };

  // Fetch kategori undangan (hanya sekali)
  const getCategory = async () => {
    await fetch<any, CategoryResponse[]>({
      url: "invitation-category",
      method: "GET",
      data: {},
      before: () => setLoading.append("getcategory"),
      success: ({ data }) => data && setCategory(data),
      complete: () => setLoading.filter((e) => e !== "getcategory"),
      error: () => {},
    });
  };

  // Fetch data undangan dengan cache buster
  const getData = async (forceRefresh = false) => {
    if (!invitation?.id) return;

    // Jika data sudah ada dan tidak force refresh, skip jika < 5 detik
    const now = Date.now();
    if (!forceRefresh && data && now - lastFetchTime < 5000) {
      console.log("Skip refresh, data masih fresh");
      return;
    }

    // Tambah timestamp untuk hindari cache browser
    const timestamp = new Date().getTime();

    await fetch<any, any>({
      url: `invitations/${invitation.id}?_t=${timestamp}`,
      method: "GET",
      data: {},
      before: () => setLoading.append("getdata"),
      success: (response) => {
        if (response) {
          console.log("Data invitation diterima:", response);
          setData(response as EventInvitationResponse);
          setLastFetchTime(Date.now());
        }
      },
      complete: () => setLoading.filter((e) => e !== "getdata"),
      error: (error) => {
        console.error("Error fetching invitation details:", error);
      },
    });
  };

  // Fetch data saat modal pertama kali dibuka
  useEffect(() => {
    if (isOpen && invitation?.id) {
      console.log("Modal dibuka, fetching data...");

      // Reset data sebelumnya
      setData(null);

      // Fetch kategori jika belum ada
      if (!category) {
        getCategory();
      }

      // Fetch data undangan
      getData(true); // Force refresh
    }

    // Reset saat modal ditutup
    return () => {
      if (!isOpen) {
        setData(null);
      }
    };
  }, [isOpen, invitation?.id]);

  // Handle refresh manual
  const handleManualRefresh = async () => {
    console.log("Manual refresh triggered");
    await getData(true);
  };

  // Auto-refresh jika modal terbuka > 30 detik
  useEffect(() => {
    if (!isOpen || !invitation?.id) return;

    const autoRefreshInterval = setInterval(() => {
      if (isOpen) {
        console.log("Auto-refreshing invitation data...");
        getData();
      }
    }, 30000); // Refresh setiap 30 detik

    return () => {
      clearInterval(autoRefreshInterval);
    };
  }, [isOpen, invitation?.id]);

  const isLoading = loading.includes("getdata");

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      placement="top-center"
      size="5xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-dark">
              <div className="flex items-center justify-between w-full">
                <span>Detail Undangan</span>
                <div className="flex items-center gap-2">
                  {isLoading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Spinner size="sm" className="mr-2" />
                      Memuat...
                    </div>
                  )}
                  <Button size="sm" variant="light" onPress={handleManualRefresh} isLoading={isLoading} isIconOnly>
                    <Icon icon="mdi:refresh" />
                  </Button>
                </div>
              </div>
              {data && (
                <Text size="sm" c="dimmed">
                  Terakhir diperbarui: {new Date(lastFetchTime).toLocaleTimeString("id-ID")}
                </Text>
              )}
            </ModalHeader>

            <ModalBody className="text-dark">
              {isLoading && !data ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <Spinner size="lg" />
                    <Text mt="md">Memuat data undangan...</Text>
                  </div>
                </div>
              ) : data ? (
                <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap">
                  <Stack maw={350}>
                    {(data.image || invitation?.image_url) && (
                      <AspectRatio ratio={3 / 1}>
                        <Image radius={10} src={data.image || invitation?.image_url || "#"} bg="gray.1" alt={data.invitation_title} />
                      </AspectRatio>
                    )}

                    <TextInput readOnly variant="filled" label="Judul Undangan" value={data.invitation_title || invitation?.invitation_title || "-"} />

                    <Textarea readOnly variant="filled" label="Deskripsi Undangan" value={data.invitation_description || invitation?.invitation_description || "-"} rows={4} />

                    <Flex wrap="wrap" gap={10} className={`[&>*]:flex-grow`}>
                      <TextInput readOnly variant="filled" label="Kategori" value={category?.find((e) => e.id == data.invitation_cat_id)?.name ?? "-"} />
                    </Flex>

                    {data.has_user && <TextInput readOnly variant="filled" label="Email Pembuat" value={data.has_user.email || "-"} />}
                  </Stack>

                  <Stack gap={10} className={`[&_th]:font-[400]`}>
                    <div className="flex items-center justify-between">
                      <Text c="gray" size="sm">
                        Data Penerima
                      </Text>
                      <Text size="sm" c="dimmed">
                        Total: {data.event_invitation_detail?.length || 0} penerima
                      </Text>
                    </div>

                    {data.event_invitation_detail && data.event_invitation_detail.length > 0 ? (
                      <Card className={``} p={0} radius={10} withBorder>
                        <ScrollArea h={400}>
                          <Table
                            w="100%"
                            striped
                            highlightOnHover
                            data={{
                              head: ["No", "Nama", "Email", "No. Telp", "E-ticket"],
                              body: data.event_invitation_detail.map((e, i) => [
                                i + 1,
                                e.fullname || "-",
                                e.email || "-",
                                e.phone || "-",
                                <ButtonM
                                  key={i}
                                  size="xs"
                                  variant="light"
                                  component={Link}
                                  href={`${config["wsUrl"]}invitations/eticket/${e.id}`}
                                  target="_blank"
                                  onClick={(event) => {
                                    // Optional: Log download
                                    console.log("Downloading e-ticket for:", e.email);
                                  }}
                                >
                                  Unduh
                                </ButtonM>,
                              ]),
                            }}
                          />
                        </ScrollArea>
                      </Card>
                    ) : (
                      <Card p="xl" withBorder>
                        <Text c="dimmed" ta="center">
                          Belum ada data penerima
                        </Text>
                      </Card>
                    )}
                  </Stack>
                </Flex>
              ) : (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <Icon icon="mdi:alert-circle-outline" className="text-4xl text-gray-400 mb-4" />
                    <Text>Data tidak tersedia atau gagal dimuat</Text>
                    <ButtonM variant="light" mt="md" onClick={handleManualRefresh}>
                      Coba Muat Ulang
                    </ButtonM>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Flex gap={10}>
                {data && data.event_invitation_detail && data.event_invitation_detail.length > 0 && (
                  <ButtonM component={Link} href={`${config["wsUrl"]}invitations/export/${invitation?.id}`} target="_blank" rightSection={<Icon icon="mdi:download" />}>
                    Export Data
                  </ButtonM>
                )}
                <ButtonM variant="light" color="gray" onClick={handleClose} rightSection={<Icon icon="uiw:down" />}>
                  Tutup
                </ButtonM>
                <ButtonM variant="filled" onClick={handleManualRefresh} loading={isLoading} rightSection={<Icon icon="mdi:refresh" />}>
                  Refresh
                </ButtonM>
              </Flex>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InvitationDetailModal;
