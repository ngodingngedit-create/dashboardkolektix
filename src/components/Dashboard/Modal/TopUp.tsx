import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, ScrollShadow, Select, SelectItem } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity } from "@fortawesome/free-solid-svg-icons";
import { Get } from "@/utils/REST";
import useLoggedUser from "@/utils/useLoggedUser";
import React from "react";

interface Bank {
  id: number;
  name: string;
  account_number: string;
  account_holder: string;
  type_bank: string;
  account_name: string;
}

interface TopUpProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function TopUpModal({ isOpen, setIsOpen }: TopUpProps) {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [amount, setAmount] = useState("");
  const user = useLoggedUser();

  // Fungsi untuk format rupiah
  function formatRupiah(amount: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  }

  // Fungsi untuk mengambil data bank
  const getData = () => {
    if (user?.id) {
      Get(`bank-by-user/${user?.id}`, {})
        .then((res: any) => {
          setBanks(res.data);
          // Set default bank ke yang pertama
          setSelectedBank(res.data[0] || null);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  };

  // Panggil getData saat komponen dimount
  useEffect(() => {
    getData();
  }, [user?.id]);

  return (
    <div className="flex flex-col gap-2">
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} className="text-dark" classNames={{ body: "px-0" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between">
                <h2 className="text-lg font-semibold">Top Up</h2>
              </ModalHeader>
              <ModalBody>
                <h3 className="text-md font-medium text-gray-700 mx-4">Top Up ke</h3>
                <p className="mx-4">Kolektix Saldo</p>
                <p className="mx-4">Rp0</p>
                {/* Jika tidak ada bank yang dipilih, tampilkan dropdown */}
                <div className="mt-6 mx-4">
                  <h3 className="text-sm font-medium text-gray-700">Nominal Top Up</h3>
                  <Input placeholder="Rp0" value={amount} type="number" onChange={(e) => setAmount(e.target.value)} fullWidth className="mt-2" />
                  <ScrollShadow orientation="horizontal" className="max-w-full flex gap-2 px-4 pb-3 mt-3">
                    {[
                      { label: "Rp100.000", value: "100000" },
                      { label: "Rp500.000", value: "500000" },
                      { label: "Rp1.000.000", value: "1000000" },
                    ].map((item) => (
                      <div
                        key={item.value}
                        onClick={() => setAmount(item.value)}
                        className={`cursor-pointer flex rounded-2xl items-center justify-center py-2 px-4 border ${amount !== item.value ? "text-dark-grey border-primary-light-200" : "text-primary-dark border-primary-dark"}`}
                      >
                        <p className="whitespace-nowrap">{item.label}</p>
                      </div>
                    ))}
                  </ScrollShadow>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button fullWidth color="primary" onClick={onClose}>
                  Konfirmasi & Top Up <span className="ml-auto">{formatRupiah(amount || 0)}</span>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
