import fetch from "@/utils/fetch";
import { AspectRatio, Flex, Image, Stack, Textarea, TextInput, Button as ButtonM, Card, Text, Table, ScrollArea } from "@mantine/core";
import { useDidUpdate, useListState } from "@mantine/hooks";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem } from "@nextui-org/react";
import { useState } from "react";
import { CategoryResponse } from "./ModalAddInvation";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

interface InvitationDetail {
  event_id: number;
  invitation_cat_id: number;
  invitation_title: string;
  invitation_description: string;
  total_qty: number;
  invitation_status: number;
  created_by: string; // Jika ingin menampilkan siapa yang membuat undangan
  image?: string;
  image_url?: string;
}

const InvitationDetailModal = ({ invitation, isOpen, onClose }: { invitation: InvitationDetail | null; isOpen: boolean; onClose: () => void }) => {
  const [loading, setLoading] = useListState<string>();
  const [category, setCategory] = useState<CategoryResponse[]>();

  useDidUpdate(() => {
    if (isOpen && !category && invitation) getCategory();
  }, [isOpen]);

  const getCategory = async () => {
    await fetch<any, CategoryResponse[]>({
      url: 'invitation-category',
      method: 'GET',
      data: {},
      before: () => setLoading.append('getcategory'),
      success: ({ data }) => data && setCategory(data),
      complete: () => setLoading.filter(e => e != 'getcategory'),
      error: () => {},
    });
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="5xl">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-dark">
            Detail Undangan
          </ModalHeader>
          <ModalBody className="text-dark">
            <Flex gap={20} className={`[&>*]:flex-grow`} wrap="wrap">
              <Stack maw={350}>
                {(invitation?.image_url || invitation?.image) && (
                  <AspectRatio ratio={3/1}>
                    <Image radius={10} src={invitation?.image_url ?? invitation?.image ?? '#'} bg="gray.1" />
                  </AspectRatio>
                )}
                
                <TextInput
                  readOnly
                  variant="filled"
                  label="Judul Undangan"
                  value={invitation?.invitation_title}
                />

                <Textarea
                  readOnly
                  variant="filled"
                  label="Deskripsi Undangan"
                  value={invitation?.invitation_description}
                />

                <Flex wrap="wrap" gap={10} className={`[&>*]:flex-grow`}>
                  <TextInput
                    readOnly
                    variant="filled"
                    label="Kategori"
                    value={category?.find(e => e.id == invitation?.invitation_cat_id)?.name ?? '-'}
                  />
                  <TextInput
                    readOnly
                    variant="filled"
                    label="Total"
                    value={invitation?.total_qty}
                  />
                </Flex>
              </Stack>
              <Stack gap={10} className={`[&_th]:font-[400]`}>
                <Text c="gray" size="sm">Data Penerima</Text>
                <Card className={`w-fit`} p={0} radius={10} withBorder>
                  <ScrollArea>
                    <Table
                      data={{
                        head: ['Nama', 'Email', 'No. Telp', 'E-ticket'],
                        body: Array(3).fill('A').map(e => [
                          "Nama Penerima",
                          "email@mail.com",
                          "8572285581232",
                          <ButtonM size="xs" variant="light" component={Link} href="#" target="_blank">
                            Unduh Etiket
                          </ButtonM>
                        ]),
                      }}
                    />
                  </ScrollArea>
                </Card>
              </Stack>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Flex gap={10}>
              {/* <ButtonM component={Link} href="#" target="_blank" rightSection={<Icon icon="mdi:invoice-text-outline" />}>
                Unduh Etiket
              </ButtonM> */}
              <ButtonM variant="light" color="gray" onClick={onClose} rightSection={<Icon icon="uiw:down" />}>
                Tutup Detail
              </ButtonM>
            </Flex>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default InvitationDetailModal;