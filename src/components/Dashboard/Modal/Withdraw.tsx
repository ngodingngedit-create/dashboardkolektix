import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, ScrollShadow, Select, SelectItem } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity } from "@fortawesome/free-solid-svg-icons";
import { Get } from "@/utils/REST";
import useLoggedUser from "@/utils/useLoggedUser";
import React from "react";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

interface Bank {
  id: number;
  name: string;
  account_number: string;
  account_holder: string;
  type_bank: string;
  account_name: string;
}

interface TarikDanaModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit?: () => void;
}

type SubmitWithdraw = {
  user_id: number;
  user_bank_id: number;
  amount: number;
  name: string;
  bank_account: string;
  status: "Pending";
};

export default function TarikDanaModal({ isOpen, setIsOpen, onSubmit }: TarikDanaModalProps) {
  const [loading, setLoading] = useListState<string>();
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

  const handleSubmit = async (close: () => void) => {
    await fetch<SubmitWithdraw, any>({
      url: "withdraw",
      method: "POST",
      data: {
        user_id: user?.id ?? 0,
        user_bank_id: selectedBank?.id ?? 0,
        amount: parseInt(amount),
        name: selectedBank?.account_name ?? "-",
        bank_account: selectedBank?.account_number ?? "0",
        status: "Pending",
      },
      before: () => setLoading.append("submit"),
      success: (data) => {
        onSubmit && onSubmit();
        close();
      },
      complete: () => setLoading.filter((e) => e != "submit"),
      error: (err) => {
        notifications.show({
          position: "top-right",
          color: "red",
          message: err?.response?.data?.error ?? err?.response?.data?.message ?? "Terjadi Kesalahan",
        });
      },
    });
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
                <h2 className="text-lg font-semibold">Tarik Dana</h2>
              </ModalHeader>
              <ModalBody>
                <h3 className="text-sm font-medium text-gray-700 mx-4">Tarik Dana ke</h3>
                {selectedBank && (
                  <div className="flex gap-4 lg:flex-row lg:gap-0 items-center justify-between mt-2 p-4 m-4 border rounded-lg bg-white shadow-md">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FontAwesomeIcon icon={faUniversity} className="text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">Bank {selectedBank.type_bank}</p>
                        <p className="text-xs text-gray-500">{selectedBank.account_number}</p>
                        <p className="text-xs text-gray-500">a.n {selectedBank.account_name}</p>
                      </div>
                    </div>
                    <div className="text-center lg:text-left mt-3 lg:mt-0">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault(); // Mencegah perilaku default tautan
                          setSelectedBank(null); // Reset bank yang dipilih untuk menampilkan dropdown
                        }}
                        className="text-blue-500 text-sm"
                      >
                        Ganti Bank
                      </a>
                    </div>
                  </div>
                )}

                {/* Jika tidak ada bank yang dipilih, tampilkan dropdown */}
                {selectedBank === null && (
                  <div className="mt-2 mx-4">
                    <Select
                      placeholder="Pilih Bank"
                      onChange={(event) => {
                        const bank = banks.find((b) => b.id.toString() === event.target.value);
                        setSelectedBank(bank || null);
                      }}
                    >
                      {banks.map((bank) => (
                        <SelectItem key={bank.id.toString()} textValue={bank.name}>
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUniversity} className="text-blue-500" />
                            <div>
                              <p className="text-sm text-dark font-medium">{bank.type_bank}</p>
                              <p className="text-xs text-dark">{bank.account_number}</p>
                              <p className="text-xs text-dark">a.n {bank.account_name}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="mt-6 mx-4">
                  <h3 className="text-sm font-medium text-gray-700">Nominal Tarik Dana</h3>
                  <Input placeholder="Rp0" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth className="mt-2" />
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
                <Button isDisabled={!Boolean(parseInt(amount)) || !Boolean(selectedBank)} isLoading={loading.includes("submit")} fullWidth color="primary" onClick={() => handleSubmit(onClose)}>
                  Konfirmasi & Tarik Dana <span className="ml-auto">{formatRupiah(amount || 0)}</span>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
