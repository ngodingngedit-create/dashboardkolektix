// import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, ScrollShadow, Select, SelectItem } from "@nextui-org/react";
// import { useState, useEffect } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faUniversity } from "@fortawesome/free-solid-svg-icons";
// import { Get } from "@/utils/REST";
// import useLoggedUser from "@/utils/useLoggedUser";
// import React from "react";
// import fetch from "@/utils/fetch";
// import { useListState } from "@mantine/hooks";
// import { notifications } from "@mantine/notifications";

// interface Bank {
//   id: number;
//   name: string;
//   account_number: string;
//   account_holder: string;
//   type_bank: string;
//   account_name: string;
// }

// interface TarikDanaModalProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
//   onSubmit?: () => void;
// }

// type SubmitWithdraw = {
//   user_id: number;
//   user_bank_id: number;
//   amount: number;
//   name: string;
//   bank_account: string;
//   status: "Pending";
// };

// export default function TarikDanaModal({ isOpen, setIsOpen, onSubmit }: TarikDanaModalProps) {
//   const [loading, setLoading] = useListState<string>();
//   const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
//   const [banks, setBanks] = useState<Bank[]>([]);
//   const [amount, setAmount] = useState("");
//   const user = useLoggedUser();

//   // Fungsi untuk format rupiah
//   function formatRupiah(amount: number | string) {
//     return new Intl.NumberFormat("id-ID", {
//       style: "currency",
//       currency: "IDR",
//       minimumFractionDigits: 0,
//     }).format(Number(amount));
//   }

//   // Fungsi untuk mengambil data bank
//   const getData = () => {
//     if (user?.id) {
//       Get(`bank-by-user/${user?.id}`, {})
//         .then((res: any) => {
//           setBanks(res.data);
//           // Set default bank ke yang pertama
//           setSelectedBank(res.data[0] || null);
//         })
//         .catch((err: any) => {
//           console.log(err);
//         });
//     }
//   };

//   const handleSubmit = async (close: () => void) => {
//     await fetch<SubmitWithdraw, any>({
//       url: "withdraw",
//       method: "POST",
//       data: {
//         user_id: user?.id ?? 0,
//         user_bank_id: selectedBank?.id ?? 0,
//         amount: parseInt(amount),
//         name: selectedBank?.account_name ?? "-",
//         bank_account: selectedBank?.account_number ?? "0",
//         status: "Pending",
//       },
//       before: () => setLoading.append("submit"),
//       success: (data) => {
//         onSubmit && onSubmit();
//         close();
//       },
//       complete: () => setLoading.filter((e) => e != "submit"),
//       error: (err) => {
//         notifications.show({
//           position: "top-right",
//           color: "red",
//           message: err?.response?.data?.error ?? err?.response?.data?.message ?? "Terjadi Kesalahan",
//         });
//       },
//     });
//   };

//   // Panggil getData saat komponen dimount
//   useEffect(() => {
//     getData();
//   }, [user?.id]);

//   return (
//     <div className="flex flex-col gap-2">
//       <Modal isOpen={isOpen} onOpenChange={setIsOpen} className="text-dark" classNames={{ body: "px-0" }}>
//         <ModalContent>
//           {(onClose) => (
//             <>
//               <ModalHeader className="flex justify-between">
//                 <h2 className="text-lg font-semibold">Tarik Dana</h2>
//               </ModalHeader>
//               <ModalBody>
//                 <h3 className="text-sm font-medium text-gray-700 mx-4">Tarik Dana ke</h3>
//                 {selectedBank && (
//                   <div className="flex gap-4 lg:flex-row lg:gap-0 items-center justify-between mt-2 p-4 m-4 border rounded-lg bg-white shadow-md">
//                     <div className="flex items-center">
//                       <div className="bg-blue-100 p-3 rounded-lg">
//                         <FontAwesomeIcon icon={faUniversity} className="text-blue-500" />
//                       </div>
//                       <div className="ml-4">
//                         <p className="text-sm font-medium">Bank {selectedBank.type_bank}</p>
//                         <p className="text-xs text-gray-500">{selectedBank.account_number}</p>
//                         <p className="text-xs text-gray-500">a.n {selectedBank.account_name}</p>
//                       </div>
//                     </div>
//                     <div className="text-center lg:text-left mt-3 lg:mt-0">
//                       <a
//                         href="#"
//                         onClick={(e) => {
//                           e.preventDefault(); // Mencegah perilaku default tautan
//                           setSelectedBank(null); // Reset bank yang dipilih untuk menampilkan dropdown
//                         }}
//                         className="text-blue-500 text-sm"
//                       >
//                         Ganti Bank
//                       </a>
//                     </div>
//                   </div>
//                 )}

//                 {/* Jika tidak ada bank yang dipilih, tampilkan dropdown */}
//                 {selectedBank === null && (
//                   <div className="mt-2 mx-4">
//                     <Select
//                       placeholder="Pilih Bank"
//                       onChange={(event) => {
//                         const bank = banks.find((b) => b.id.toString() === event.target.value);
//                         setSelectedBank(bank || null);
//                       }}
//                     >
//                       {banks.map((bank) => (
//                         <SelectItem key={bank.id.toString()} textValue={bank.name}>
//                           <div className="flex items-center gap-2">
//                             <FontAwesomeIcon icon={faUniversity} className="text-blue-500" />
//                             <div>
//                               <p className="text-sm text-dark font-medium">{bank.type_bank}</p>
//                               <p className="text-xs text-dark">{bank.account_number}</p>
//                               <p className="text-xs text-dark">a.n {bank.account_name}</p>
//                             </div>
//                           </div>
//                         </SelectItem>
//                       ))}
//                     </Select>
//                   </div>
//                 )}

//                 <div className="mt-6 mx-4">
//                   <h3 className="text-sm font-medium text-gray-700">Nominal Tarik Dana</h3>
//                   <Input placeholder="Rp0" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth className="mt-2" />
//                   <ScrollShadow orientation="horizontal" className="max-w-full flex gap-2 px-4 pb-3 mt-3">
//                     {[
//                       { label: "Rp100.000", value: "100000" },
//                       { label: "Rp500.000", value: "500000" },
//                       { label: "Rp1.000.000", value: "1000000" },
//                     ].map((item) => (
//                       <div
//                         key={item.value}
//                         onClick={() => setAmount(item.value)}
//                         className={`cursor-pointer flex rounded-2xl items-center justify-center py-2 px-4 border ${amount !== item.value ? "text-dark-grey border-primary-light-200" : "text-primary-dark border-primary-dark"}`}
//                       >
//                         <p className="whitespace-nowrap">{item.label}</p>
//                       </div>
//                     ))}
//                   </ScrollShadow>
//                 </div>
//               </ModalBody>
//               <ModalFooter>
//                 <Button isDisabled={!Boolean(parseInt(amount)) || !Boolean(selectedBank)} isLoading={loading.includes("submit")} fullWidth color="primary" onClick={() => handleSubmit(onClose)}>
//                   Konfirmasi & Tarik Dana <span className="ml-auto">{formatRupiah(amount || 0)}</span>
//                 </Button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// }
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
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import router from "next/router";

interface Bank {
  id: number;
  name: string;
  account_number: string;
  account_holder: string;
  type_bank: string;
  account_name: string;
}

export interface EventDataProps {
  id: number;
  event_id: number;
  creator_id: string;
}

interface EventData {
  id: number;
  creator_id: string;
  event_name: string;
  slug: string;
  total_admin_fee: number;
  total_buy: number;
  total_offline: number;
  total_online: number;
  total_paid: number;
  total_price_sell: number;
  total_price_sell_offline: number;
  total_price_sell_online: number;
  total_ticket: number;
  total_unpaid: number;
  total_views: number;
  total_withdraw: number;
}

interface TarikDanaModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit?: () => void;
  eventSlug?: string | string[];
}

type SubmitWithdraw = {
  // user_id: number;
  user_bank_id: number;
  amount: number;
  name: string;
  bank_account: string;
  transaction_status_id?: number;
  event_id?: number;
};

export default function TarikDanaModal({ isOpen, setIsOpen, onSubmit, eventSlug }: TarikDanaModalProps) {
  const [loading, loadingHandlers] = useListState<string>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [amount, setAmount] = useState("");
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [eventDatas, setEventDatas] = useState<EventDataProps | null>(null);
  const user = useLoggedUser();
  const params = useParams();

  // Fungsi untuk format rupiah
  function formatRupiah(amountVal: number | string) {
    const num = Number(amountVal) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  }

  const { slug } = router.query;

  const getDataEvent = () => {
    Get(`event/${slug}`, {})
      .then((res: any) => {
        console.log("Fetched event data:", res.data?.id);
        setEventDatas(res.data);
        console.log("Event data fetched:", res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log("Event ID (yang benar):", eventDatas?.id); // 102
  console.log("Creator ID (bukan ini):", eventDatas?.creator_id); // 40

  useEffect(() => {
    if (slug) {
      getDataEvent();
    }
  }, [slug]);

  // Fetch event data
  const fetchEventData = () => {
    let slug: string | undefined;

    if (eventSlug) {
      slug = Array.isArray(eventSlug) ? eventSlug[0] : eventSlug;
    } else if (params?.slug) {
      slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    }

    if (!slug) {
      console.log("❌ No event slug available");
      return;
    }

    console.log("🔍 Fetching event data for slug:", slug);

    Get(`event-view-list-by-slug/${slug}`, {})
      .then((res: any) => {
        console.log("📊 API Response:", res);

        // Response langsung adalah event data
        if (res && res.event_name) {
          console.log("✅ Event data found:", {
            name: res.event_name,
            total_price_sell: res.total_price_sell,
            total_withdraw: res.total_withdraw,
          });
          setEventData(res);
        } else {
          console.error("❌ Response doesn't contain event data");
        }
      })
      .catch((err: any) => {
        console.error("❌ Error:", err);
      });
  };

  // Hitung saldo yang tersedia untuk ditarik
  const calculateAvailableBalance = () => {
    if (!eventData) {
      console.log("⚠️ Event data not loaded yet");
      return 0;
    }

    const totalEarned = Number(eventData.total_price_sell) || 0;
    const totalWithdrawn = Number(eventData.total_withdraw) || 0;
    const availableBalance = totalEarned - totalWithdrawn;

    console.log("💰 Balance Calculation:", {
      totalEarned,
      totalWithdrawn,
      availableBalance,
    });

    return availableBalance > 0 ? availableBalance : 0;
  };

  // Fungsi untuk mengambil data bank
  const getData = () => {
    if (user?.id) {
      Get(`bank-by-user/${user?.id}`, {})
        .then((res: any) => {
          const data: Bank[] = res?.data ?? [];
          setBanks(data);
          setSelectedBank(data.length ? data[0] : null);
        })
        .catch((err: any) => {
          console.error("fetch banks error:", err);
          notifications.show({
            title: "Error",
            message: "Gagal mengambil data bank",
            color: "red",
            position: "top-right",
          });
        });
    } else {
      setBanks([]);
      setSelectedBank(null);
    }
  };

  const authToken = Cookies.get("token") || process.env.NEXT_PUBLIC_API_TOKEN || "";
  console.log("auth token :", authToken);

  const handleSubmit = async (close?: () => void) => {
    const parsedAmount = Number(amount.replace(/\D/g, ""));
    const availableBalance = calculateAvailableBalance();

    console.log("🚀 Submit attempt:", {
      parsedAmount,
      availableBalance,
      hasEventData: !!eventData,
      eventData,
    });

    if (!user?.id) {
      notifications.show({ color: "red", message: "User tidak tersedia", position: "top-right" });
      return;
    }
    if (!selectedBank) {
      notifications.show({ color: "red", message: "Pilih bank tujuan terlebih dahulu", position: "top-right" });
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      notifications.show({ color: "red", message: "Masukkan nominal yang valid", position: "top-right" });
      return;
    }
    if (parsedAmount < 10000) {
      notifications.show({ color: "red", message: "Minimal penarikan Rp 10.000", position: "top-right" });
      return;
    }

    // Validasi saldo cukup
    if (parsedAmount > availableBalance) {
      notifications.show({
        color: "red",
        message: `Saldo tidak cukup. Saldo tersedia: ${formatRupiah(availableBalance)}`,
        position: "top-right",
      });
      return;
    }

    // Validasi saldo 0
    if (availableBalance <= 0) {
      notifications.show({
        color: "red",
        message: "Tidak ada saldo yang bisa ditarik",
        position: "top-right",
      });
      return;
    }

    await fetch<SubmitWithdraw, any>({
      url: "withdraw/store-creator",
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: {
        // user_id: user.id,
        user_bank_id: selectedBank.id,
        amount: parsedAmount,
        name: selectedBank.account_name ?? "-",
        bank_account: selectedBank.account_number ?? "0",
        transaction_status_id: 1,
        event_id: Number(eventDatas?.id),
      },
      before: () => loadingHandlers.append("submit"),
      success: (data) => {
        onSubmit && onSubmit();
        if (typeof close === "function") {
          try {
            close();
          } catch (err) {
            setIsOpen(false);
          }
        } else {
          setIsOpen(false);
        }

        notifications.show({
          color: "green",
          message: "Permintaan tarik dana dikirim",
          position: "top-right",
        });
      },
      complete: () => loadingHandlers.filter((e) => e !== "submit"),
      error: (err) => {
        loadingHandlers.filter((e) => e !== "submit");
        notifications.show({
          position: "top-right",
          color: "red",
          message: err?.response?.data?.error ?? err?.response?.data?.message ?? "Terjadi Kesalahan",
        });
      },
    });
  };

  // Panggil getData saat komponen dimount atau user berubah
  useEffect(() => {
    if (isOpen) {
      console.log("📂 Modal opened, fetching data...");
      getData();
      fetchEventData();
    }
  }, [isOpen, user?.id]);

  // Hitung saldo tersedia
  const availableBalance = calculateAvailableBalance();

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
                {/* Info Saldo dengan warna warning jika 0 */}
                <div className={`mx-4 mb-4 p-3 rounded-lg ${availableBalance > 0 ? "bg-blue-50" : "bg-yellow-50"}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Saldo Tersedia:</span>
                    <span className={`text-lg font-bold ${availableBalance > 0 ? "text-green-600" : "text-red-600"}`}>{formatRupiah(availableBalance)}</span>
                  </div>
                  {eventData ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Total Penjualan: {formatRupiah(eventData.total_price_sell || 0)} • Sudah Ditarik: {formatRupiah(eventData.total_withdraw || 0)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Memuat data saldo...</p>
                  )}

                  {availableBalance <= 0 && eventData && <p className="text-xs text-red-600 mt-1">Tidak ada saldo yang bisa ditarik. Pastikan ada penjualan tiket.</p>}
                </div>

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
                          e.preventDefault();
                          setSelectedBank(null);
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
                        const value = event.target.value;
                        console.log("Extracted value:", value);

                        const bank = banks.find((b) => b.id.toString() === String(value));
                        setSelectedBank(bank || null);
                      }}
                    >
                      {banks.map((bank) => (
                        <SelectItem key={bank.id.toString()} value={bank.id.toString()} textValue={bank.name}>
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
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Nominal Tarik Dana</h3>
                    <span className="text-xs text-gray-500">Maks: {formatRupiah(availableBalance)}</span>
                  </div>
                  <Input
                    placeholder="Rp0"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      // Cek tidak melebihi saldo
                      if (Number(value) <= availableBalance) {
                        setAmount(value);
                      } else {
                        setAmount(availableBalance.toString());
                      }
                    }}
                    fullWidth
                    className="mt-2"
                  />
                  <ScrollShadow orientation="horizontal" className="max-w-full flex gap-2 px-4 pb-3 mt-3">
                    {[
                      { label: "Rp100.000", value: "100000" },
                      { label: "Rp500.000", value: "500000" },
                      { label: "Rp1.000.000", value: "1000000" },
                    ]
                      .filter((item) => Number(item.value) <= availableBalance) // Hanya tampilkan yang <= saldo
                      .map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            if (Number(item.value) <= availableBalance) {
                              setAmount(item.value);
                            }
                          }}
                          className={`cursor-pointer flex rounded-2xl items-center justify-center py-2 px-4 border ${amount !== item.value ? "text-dark-grey border-primary-light-200" : "text-primary-dark border-primary-dark"} ${
                            Number(item.value) > availableBalance ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <p className="whitespace-nowrap">{item.label}</p>
                        </div>
                      ))}
                    {/* Tombol tarik semua saldo */}
                    {availableBalance >= 10000 && (
                      <div
                        onClick={() => setAmount(availableBalance.toString())}
                        className={`cursor-pointer flex rounded-2xl items-center justify-center py-2 px-4 border ${
                          amount !== availableBalance.toString() ? "text-dark-grey border-primary-light-200" : "text-primary-dark border-primary-dark"
                        }`}
                      >
                        <p className="whitespace-nowrap">Tarik Semua</p>
                      </div>
                    )}
                  </ScrollShadow>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  isDisabled={!Boolean(Number(amount)) || !Boolean(selectedBank) || Number(amount) > availableBalance || Number(amount) < 10000 || availableBalance <= 0}
                  isLoading={loading.includes("submit")}
                  fullWidth
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(onClose);
                  }}
                >
                  {availableBalance <= 0 ? "Saldo Tidak Tersedia" : "Konfirmasi & Tarik Dana"}
                  <span className="ml-auto">{formatRupiah(amount || 0)}</span>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
