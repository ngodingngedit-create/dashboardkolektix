import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem } from "@nextui-org/react";

interface Detail {
  invoice_no: string;
  created_at: string;
  admin_fee: string;
  grandtotal: string;
  payment_method: string;
  payment_status: string;
  total_price: string;
  total_qty: string;
  type_transaction: string;
  has_user: {
    name: string;
    email: string;
  };
  has_pemensan: {
    full_name: string;
    email: string;
    nik: string;
    no_telp: string;
  };
}

const DetailModal = ({ item, isOpen, onClose }: { item: Detail | null; isOpen: boolean; onClose: () => void }) => {
  if (!item) return null;

  // Format IDR helper function
  const formatIDR = (value: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value));
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="5xl">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-dark">
            Detail Transaksi
          </ModalHeader>
          <ModalBody className="text-dark">
            <div className="grid grid-cols-2 gap-8">
              {/* Bagian Kiri - Accordion */}
              <div>
                <Accordion defaultExpandedKeys={["pemilik-tiket", "pemesan"]}>
                  <AccordionItem key="pemesan" title="Data Pemesan">
                    <div className="mb-4">
                      <p className="text-grey">Nama Pemesan</p>
                      <p className="font-semibold">{item?.has_pemensan?.full_name}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-grey">Email Pemesan</p>
                      <p className="font-semibold">{item?.has_pemensan?.email}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-grey">NIK Pemesan</p>
                      <p className="font-semibold">{item?.has_pemensan?.nik}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-grey">No. Telepon Pemesan</p>
                      <p className="font-semibold">{item?.has_pemensan?.no_telp}</p>
                    </div>
                  </AccordionItem>
                  <AccordionItem key="pemilik-tiket" title="Data Pemilik Tiket">
                    <div className="mb-4">
                      <p className="text-grey">Nama Pemilik Tiket</p>
                      <p className="font-semibold">{item?.has_user?.name}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-grey">Email Pemilik Tiket</p>
                      <p className="font-semibold">{item?.has_user?.email}</p>
                    </div>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Bagian Kanan - Rincian Transaksi */}
              <div>
                <h3 className="text-xl font-bold mb-6">Rincian Transaksi</h3>
                
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">No. Invoice</p>
                  <p className="font-semibold">{item?.invoice_no}</p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Status Pembayaran</p>
                  <p className="font-semibold">{item?.payment_status}</p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Tipe Transaksi</p>
                  <p className="font-semibold">{item?.type_transaction}</p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Dikirim pada</p>
                  <p className="font-semibold">{new Date(item?.created_at).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Total Qty</p>
                  <p className="font-semibold">{item?.total_qty}</p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Total Harga</p>
                  <p className="font-semibold">{formatIDR(item?.total_price)}</p> {/* Format IDR */}
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Admin Fee</p>
                  <p className="font-semibold">{formatIDR(item?.admin_fee)}</p> {/* Format IDR */}
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Grand Total</p>
                  <p className="font-semibold">{formatIDR(item?.grandtotal)}</p> {/* Format IDR */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button className="bg-primary text-white" variant="flat" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default DetailModal;
