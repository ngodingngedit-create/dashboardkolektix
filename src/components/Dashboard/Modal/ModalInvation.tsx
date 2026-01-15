import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem } from "@nextui-org/react";

interface Identity {
  id?: number;
  is_pemesan?: number;
  transaction_id?: string;
  event_ticket_id?: string | null;
  seat_number?: string | null;
  full_name?: string | null;
  [k: string]: any;
}

interface MerchItem {
  id: number;
  transaction_id: number;
  transaction_identity_id: number;
  event_merch_id: number;
  product_variant_id: number;
  qty: number;
  price: string;
  subtotal: string;
  noted: string;
  product_variant?: {
    id: number;
    product_id: number;
    varian_category_id: number;
    sku: string;
    price: string;
    weight: string;
    stock_qty: number;
    status_product: string;
    varian_name: string;
  };
}

interface Detail {
  invoice_no?: string;
  created_at?: string;
  admin_fee?: string | number | null;
  grandtotal?: string | number | null;
  payment_method?: any;
  payment_status?: string;
  total_price?: string | number | null;
  total_qty?: string | number | null;
  is_insurance?: number;
  type_transaction?: string;
  transaction_merches?: MerchItem[];
  has_user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  has_identity?: Identity[] | null;
  has_pemensan?: {
    full_name?: string | null;
    email?: string | null;
    nik?: string | null;
    no_telp?: string | null;
    seat_number?: string | null;
    transaction_id?: string | null;
  } | null;
  identities?: Identity[] | null;
  has_eticket?:
  | {
    id?: number;
    transaction_id?: number | string | null;
    seat_number?: string | null;
    has_event_ticket?: {
      id: number;
      ticket_category?: string | null;
      is_bundling: number;
      bundling_qty: number;
      bundling_dates: string | null;
      qty: number;
      sold_qty: number;
      price: number;
      ticket_fee: number;
    } | null;
    transaction_status_id?: number | null;
    [k: string]: any;
  }[]
  | null;
  [k: string]: any;
}

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

const DetailModal = ({ item, isOpen, onClose }: { item: Detail | null; isOpen: boolean; onClose: () => void }) => {
  if (!item) return null;

  // Format IDR helper function
  const formatIDR = (value?: string | number | null) => {
    const n = Number(value ?? 0);
    if (Number.isNaN(n)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);
  };

  const identities: Identity[] = item?.identities ?? item?.has_identity ?? [];
  const pemesanIdentity = identities.find((id) => id?.is_pemesan === 1) ?? null;
  const ownersList = identities.filter((id) => id?.is_pemesan !== 1);
  const etickets = item?.has_eticket ?? [];
  const merchItems = item?.transaction_merches ?? [];

  // Calculate total quantity including bundling logic
  const calculateTotalQtyWithBundling = () => {
    if (!item?.has_eticket || item.has_eticket.length === 0) {
      return Number(item?.total_qty) || 0;
    }

    const firstEticket = item.has_eticket[0];
    const ticketData = firstEticket?.has_event_ticket;

    if (!ticketData) return item.has_eticket.length;

    const isBundling = ticketData.is_bundling === 1;
    const bundlingQty = ticketData.bundling_qty ?? 0;
    const totalPhysicalQty = item.has_eticket.length;
    const validBundlingQty = Number(bundlingQty) || 0;

    if (isBundling && validBundlingQty >= 2 && validBundlingQty <= 4) {
      const packageCount = Math.floor(totalPhysicalQty / validBundlingQty);
      return packageCount > 0 ? packageCount : 1;
    }

    return totalPhysicalQty;
  };

  // Calculate total merchandise quantity
  const calculateTotalMerchQty = () => {
    if (!merchItems || merchItems.length === 0) return 0;
    return merchItems.reduce((total, merch) => total + merch.qty, 0);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="5xl">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-dark">Detail Transaksi</ModalHeader>
          <ModalBody className="text-dark">
            <div className="grid grid-cols-2 gap-8">
              {/* Bagian Kiri - Accordion */}
              <div>
                <Accordion defaultExpandedKeys={["pemesan"]}>
                  {[
                    <AccordionItem key="pemesan" title="Data Pemesan">
                      <div className="space-y-3">
                        <div>
                          <p className="text-grey">Nama Pemesan</p>
                          <p className="font-semibold">{pemesanIdentity?.full_name ?? item?.has_pemensan?.full_name ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-grey">Email Pemesan</p>
                          <p className="font-semibold">{item?.has_pemensan?.email ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-grey">NIK Pemesan</p>
                          <p className="font-semibold">{item?.has_pemensan?.nik ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-grey">No. Telepon Pemesan</p>
                          <p className="font-semibold">{item?.has_pemensan?.no_telp ?? "-"}</p>
                        </div>
                      </div>
                    </AccordionItem>,
                    ...ownersList.map((owner, idx) => {
                      const et = etickets[idx] ?? null;
                      const seat = owner?.seat_number ?? et?.seat_number ?? "-";
                      const ticketCategory = et?.has_event_ticket?.ticket_category ?? "-";
                      const ownerName = owner?.full_name ?? owner?.name ?? "-";
                      const ownerPhone = owner?.no_telp ?? "-";

                      return (
                        <AccordionItem key={owner?.id ?? `pemilik-tiket-${idx}`} title={`Pemilik Tiket #${idx + 1} - ${ownerName}`}>
                          <div className="space-y-3">
                            <div>
                              <p className="text-grey">Nama</p>
                              <p className="font-semibold">{ownerName}</p>
                            </div>
                            <div>
                              <p className="text-grey">Jenis Tiket</p>
                              <p className="font-semibold">{ticketCategory}</p>
                            </div>
                            <div>
                              <p className="text-grey">Seat Number</p>
                              <p className="font-semibold">{seat}</p>
                            </div>
                            <div>
                              <p className="text-grey">No. Telepon</p>
                              <p className="font-semibold">{ownerPhone}</p>
                            </div>
                          </div>
                        </AccordionItem>
                      );
                    }),
                    ...(merchItems.length > 0
                      ? [
                        <AccordionItem key="merchandise" title={`Merchandise (${merchItems.length} item${merchItems.length > 1 ? 's' : ''})`}>
                          <div className="space-y-4">
                            {merchItems.map((merch) => (
                              <div key={merch.id} className="p-3 border rounded">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">
                                      {merch.product_variant?.varian_name ?? "Merchandise"} (Qty: {merch.qty})
                                    </p>
                                    <p className="text-sm text-grey mt-1">SKU: {merch.product_variant?.sku ?? "-"}</p>
                                    <p className="text-sm text-grey">Catatan: {merch.noted || "-"}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{formatIDR(merch.subtotal)}</p>
                                    <p className="text-sm text-grey">@{formatIDR(merch.price)}</p>
                                  </div>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-grey">Stok tersisa:</p>
                                    <p>{merch.product_variant?.stock_qty ?? "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-grey">Berat:</p>
                                    <p>{merch.product_variant?.weight ? `${merch.product_variant.weight}g` : "-"}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionItem>,
                      ]
                      : []),
                  ]}
                </Accordion>
              </div>

              {/* Bagian Kanan - Rincian Transaksi */}
              <div>
                <h3 className="text-xl font-bold mb-6">Rincian Transaksi</h3>

                <div className="mb-4 flex justify-between">
                  <p className="text-grey">No. Invoice</p>
                  <p className="font-semibold">{item?.invoice_no ?? "-"}</p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Status Pembayaran</p>
                  <p className="font-semibold">{getStatusText(item.transaction_status_id) ?? "-"}</p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Tipe Transaksi</p>
                  <p className="font-semibold">{item?.type_transaction ?? "-"}</p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Dikirim pada</p>
                  <p className="font-semibold">
                    {item?.created_at
                      ? new Date(item.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      : "-"}
                  </p>
                </div>

                {/* Total Qty Tiket */}
                {item?.has_eticket && item.has_eticket.length > 0 && (
                  <div className="mb-4 flex justify-between">
                    <p className="text-grey">Total Qty Tiket</p>
                    <p className="font-semibold">{calculateTotalQtyWithBundling()}</p>
                  </div>
                )}

                {/* Total Qty Merchandise */}
                {merchItems.length > 0 && (
                  <div className="mb-4 flex justify-between">
                    <p className="text-grey">Total Qty Merchandise</p>
                    <p className="font-semibold">{calculateTotalMerchQty()}</p>
                  </div>
                )}

                {/* Subtotal Merchandise */}
                {merchItems.length > 0 && (
                  <div className="mb-4 flex justify-between border-t pt-4">
                    <p className="text-grey">Subtotal Merchandise</p>
                    <p className="font-semibold line-through text-red-500">
                      {formatIDR(merchItems.reduce((total, merch) => total + parseFloat(merch.subtotal), 0))}
                    </p>
                  </div>
                )}

                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Total Harga</p>
                  <p className="font-semibold">{formatIDR(item?.grandtotal)}</p>
                </div>

                {item?.admin_fee && item.admin_fee !== 0 ? (
                  <div className="mb-4 flex justify-between">
                    <p className="text-grey">Admin Fee</p>
                    <p className="font-semibold">{formatIDR(item?.admin_fee)}</p>
                  </div>
                ) : null}

                <div className="mb-4 flex justify-between">
                  <p className="text-grey">Grand Total</p>
                  <p className="font-semibold">{formatIDR(item?.grandtotal)}</p>
                </div>

                {item?.is_insurance == 1 ? (
                  <div className="mb-4 flex justify-between">
                    <p className="text-grey">Anda Tercover Asuransi!</p>
                  </div>
                ) : null}
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