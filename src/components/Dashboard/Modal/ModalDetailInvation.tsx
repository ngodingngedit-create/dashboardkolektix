import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem } from "@nextui-org/react";

interface InvitationDetail {
  event_id: number;
  invitation_cat_id: number;
  invitation_title: string;
  invitation_description: string;
  total_qty: number;
  invitation_status: number;
  created_by: string; // Jika ingin menampilkan siapa yang membuat undangan
}

const InvitationDetailModal = ({ invitation, isOpen, onClose }: { invitation: InvitationDetail | null; isOpen: boolean; onClose: () => void }) => {
  if (!invitation) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="5xl">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-dark">
            Detail Undangan
          </ModalHeader>
          <ModalBody className="text-dark">
            <Accordion defaultExpandedKeys={["invitation"]}>
              <AccordionItem key="invitation" title="Data Undangan">
                <div className="flex flex-col gap-4 mb-4">
                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 shadow-sm px-4 py-2">
                    <p className="text-grey">Judul Undangan</p>
                    <p className="font-semibold">{invitation.invitation_title}</p>
                  </div>
                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 shadow-sm px-4 py-2">
                    <p className="text-grey">Deskripsi Undangan</p>
                    <p className="font-semibold">{invitation.invitation_description}</p>
                  </div>
                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 shadow-sm px-4 py-2">
                    <p className="text-grey">Total Jumlah</p>
                    <p className="font-semibold">{invitation.total_qty}</p>
                  </div>
                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 shadow-sm px-4 py-2">
                    <p className="text-grey">Status Undangan</p>
                    <p className="font-semibold">{invitation.invitation_status === 1 ? "Aktif" : "Tidak Aktif"}</p>
                  </div>
                  <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 shadow-sm px-4 py-2">
                    <p className="text-grey">Dibuat oleh</p>
                    <p className="font-semibold">{invitation.created_by}</p> {/* Menambahkan created_by jika diinginkan */}
                  </div>
                </div>
              </AccordionItem>
            </Accordion>
          </ModalBody>
          <ModalFooter>
            <Button className="bg-primary text-white" variant="flat" onPress={onClose}>
              Tutup
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default InvitationDetailModal;
