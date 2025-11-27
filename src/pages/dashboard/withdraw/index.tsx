// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowDown, faPlus } from "@fortawesome/free-solid-svg-icons";
// import TarikDanaModal from "@/components/Dashboard/Modal/Withdraw";
// import TopUpModal from "@/components/Dashboard/Modal/TopUp";
// import { useState, useEffect } from "react";
// import CreatorTable from "@/components/Dashboard/CreatorTable";
// import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
// import WithdrawHistoryList from "@/components/MyEvent/WithdrawHistoryList";

// // Definisikan tipe untuk transaksi
// interface Transaction {
//   type: string;
//   time: string;
//   amount: string;
//   destination: string;
//   color: string;
// }

// interface EventData {
//   creator_id: string;
//   event_name: string;
//   slug: string;
//   total_admin_fee: number;
//   total_buy: number;
//   total_offline: number;
//   total_online: number;
//   total_paid: number;
//   total_price_sell: number;
//   total_price_sell_offline: number;
//   total_price_sell_online: number;
//   total_ticket: number;
//   total_unpaid: number;
//   total_views: number;
// }

// interface Record {
//   date: string;
//   transactions: Transaction[];
// }

// const WithDraw = () => {
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
//   const [isDetailModalOpen2, setIsDetailModalOpen2] = useState<boolean>(false);
//   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // State untuk detail transaksi
//   const [eventData, setEventData] = useState<EventData[] | null>(null);

//   const calculateTotal = (key: keyof EventData) => {
//     console.log(eventData);
//     if (!eventData || eventData.length === 0) return 0;

//     return eventData.reduce((total, event) => {
//       if (key === "total_price_sell") {
//         const online = Number(event.total_price_sell_online || 0);
//         const offline = Number(event.total_price_sell_offline || 0);
//         return total + online + offline;
//       }
//       return total + Number(event[key] || 0);
//     }, 0);
//   };

//   const calculateTotalEvents = () => {
//     return eventData ? eventData.length : 0;
//   };

//   const handleTransactionClick = (transaction: Transaction) => {
//     setSelectedTransaction(transaction);
//     setIsDetailModalOpen2(true);
//   };

//   const transactionsData: Record[] = [
//     // {
//     //     date: 'Kamis, 11 Jul 2024',
//     //     transactions: [
//     //         { type: 'Pembayaran', time: '07:22 WIB', amount: '-Rp10.000', destination: 'Ke BCA', color: 'text-red-500' },
//     //         { type: 'Top Up', time: '07:22 WIB', amount: '+Rp10.000', destination: 'Dari BCA', color: 'text-green-500' },
//     //         { type: 'Tarik Dana', time: '07:22 WIB', amount: '-Rp10.000', destination: 'Ke BCA', color: 'text-red-500' },
//     //     ],
//     // },
//     // {
//     //     date: 'Rabu, 10 Jul 2024',
//     //     transactions: [
//     //         { type: 'Pembayaran', time: '07:22 WIB', amount: '-Rp10.000', destination: 'Ke BCA', color: 'text-red-500' },
//     //         { type: 'Top Up', time: '07:22 WIB', amount: '+Rp10.000', destination: 'Dari BCA', color: 'text-green-500' },
//     //         { type: 'Top Up', time: '07:22 WIB', amount: '+Rp10.000', destination: 'Dari BCA', color: 'text-green-500' },
//     //     ],
//     // },
//   ];

//   return (
//     <div className="w-full max-w-2xl bg-blue-50 mx-auto mt-4 mb-48 rounded-lg shadow-lg overflow-hidden">
//       <div className="bg-primary text-white p-4 flex justify-between items-center">
//         <div>
//           <div className="flex items-center">
//             <i className="fas fa-wallet mr-2"></i>
//             <span>Saldo</span>
//           </div>
//           <div className="text-2xl">Rp{calculateTotal("total_price_sell").toLocaleString("id-ID")}</div>
//         </div>
//         <div className="flex space-x-4">
//           <div className="flex flex-col items-center">
//             <FontAwesomeIcon onClick={() => setIsDetailModalOpen(true)} icon={faPlus} className="mb-1 border border-white p-1 cursor-pointer" />
//             <button className="flex items-center space-x-1">
//               <span>Top Up</span>
//             </button>
//           </div>
//           <div className="flex flex-col items-center">
//             <FontAwesomeIcon onClick={() => setIsModalOpen(true)} icon={faArrowDown} className="mb-1 border border-white p-1 cursor-pointer" />
//             <button className="flex items-center space-x-1">
//               <span>Tarik Dana</span>
//             </button>
//           </div>
//         </div>
//       </div>
//       <div className="">
//         <h2 className="text-lg text-dark font-semibold mb-4 bg-white p-4">Riwayat Transaksi</h2>
//         <div className="space-y-4">
//           {/* {transactionsData.map((record, index) => (
//             <div key={index}>
//               <div className="text-dark text-lg mb-2 bg-white p-4">{record.date}</div>
//               <div className="space-y-2">
//                 {record.transactions.map((transaction, idx) => (
//                   <div
//                     key={idx}
//                     className="flex justify-between items-center bg-white my-2 p-4 cursor-pointer hover:bg-gray-100"
//                     onClick={() => handleTransactionClick(transaction)} // Panggil fungsi saat transaksi diklik
//                   >
//                     <div className="text-dark">
//                       <div>{transaction.type}</div>
//                       <div className="text-gray-500 text-sm">{transaction.time}</div>
//                     </div>
//                     <div>
//                       <div className="text-dark text-sm">{transaction.destination}</div>
//                       <div className={transaction.color}>{transaction.amount}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))} */}
//           <WithdrawHistoryList user_id={6} />
//         </div>
//       </div>
//       <TarikDanaModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
//       <TopUpModal isOpen={isDetailModalOpen} setIsOpen={setIsDetailModalOpen} />

//       {/* Modal untuk detail transaksi */}
//       <Modal isOpen={isDetailModalOpen2} onClose={() => setIsDetailModalOpen2(false)}>
//         <ModalContent>
//           <ModalHeader className="text-dark">Detail Transaksi</ModalHeader>
//           <ModalBody>
//             {selectedTransaction && (
//               <div>
//                 <p className="text-lg font-bold text-dark mb-2">Pembayaran</p>
//                 <p className="text-dark text-lg mb-4">{selectedTransaction.amount}</p>
//                 <p className="text-lg font-bold text-dark mb-2">Rincian Transaksi</p>
//                 <div className="flex justify-between">
//                   <p className="text-dark mb-2">Jenis</p>
//                   <p className="text-dark mb-2"> {selectedTransaction.type}</p>
//                 </div>
//                 <div className="flex justify-between">
//                   <p className="text-dark mb-2">Waktu</p>
//                   <p className="text-dark mb-2">{selectedTransaction.time}</p>
//                 </div>
//                 <div className="flex justify-between">
//                   <p className="text-dark mb-2">Tujuan</p>
//                   <p className="text-dark mb-2"> {selectedTransaction.destination}</p>
//                 </div>
//               </div>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button className="bg-primary text-white" onClick={() => setIsDetailModalOpen2(false)}>
//               Tutup
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// };

// export default WithDraw;

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { faArrowDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import TarikDanaModal from "@/components/Dashboard/Modal/Withdraw";
import TopUpModal from "@/components/Dashboard/Modal/TopUp";
import WithdrawHistoryList from "@/components/MyEvent/WithdrawHistoryList";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import config from "@/Config";
import Cookies from "js-cookie";
import useLoggedUser from "@/utils/useLoggedUser";

interface SaldoData {
  status: boolean;
  creator_id?: number;
  total_event_transaction?: number;
  total_event_withdraw?: number;
  event_saldo?: number;
  total_order_product?: number;
  total_saldo?: number;
}

// Definisikan tipe untuk transaksi
interface Transaction {
  type: string;
  time: string;
  amount: string;
  destination: string;
  color: string;
}

interface EventData {
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
}

const WithDraw = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { creator_id } = router.query;

  // state dan modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen2, setIsDetailModalOpen2] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // -> PERBAIKAN: eventData sebagai objek tunggal (sesuai pemakaian di JSX)
  const [loading, setLoading] = useState<boolean>(false);

  const [saldoData, setSaldoData] = useState<SaldoData | null>(null);

  const loggedUser = useLoggedUser();

  useEffect(() => {
    const creatorId = loggedUser?.has_creator?.id;
    console.log("Creator ID:", creatorId);

    if (creatorId) {
      getSaldoData(creatorId);
    }
  }, [loggedUser]);

  const getSaldoData = async (creatorId: number) => {
    console.log("getSaldoData dipanggil"); // Debug: cek apakah function dijalankan
    setLoading(true);
    try {
      const token = Cookies.get("token") || process.env.NEXT_PUBLIC_AUTH_TOKEN;
      console.log("Token:", token ? "Ada" : "Tidak ada"); // Debug: cek token
      console.log("URL:", `${config.wsUrl}creator/${creatorId}/saldo`); // Debug: cek URL

      const response = await axios.get(`${config.wsUrl}creator/${creatorId}/saldo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response full:", response); // Debug: cek response lengkap
      console.log("Response status:", response.status); // Debug: cek status code

      if (response && response.data) {
        setSaldoData(response.data);
        console.log(response.data, "saldo data");
      }
    } catch (error) {
      console.error("Error fetching saldo data:", error);
      // Tambahan debug error
      if (axios.isAxiosError(error)) {
        console.error("Response error:", error.response?.data);
        console.error("Status code:", error.response?.status);
      }
    } finally {
      setLoading(false);
      console.log("Loading selesai"); // Debug: cek apakah finally dijalankan
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen2(true);
  };

  return (
    // NOTE: removed `max-w-2xl` so saldo area can stretch full width.
    <div className="w-[90%] bg-blue-50 mx-auto mt-4 mb-48 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-primary text-white p-4 flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center">
            <i className="fas fa-wallet mr-2"></i>
            <span>Saldo</span>
          </div>
          <div className="text-2xl">Rp{(saldoData?.total_saldo || 0).toLocaleString("id-ID")}</div>
        </div>

        <div className="flex space-x-4">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon onClick={() => setIsDetailModalOpen(true)} icon={faPlus} className="mb-1 border border-white p-1 cursor-pointer" />
            <button className="flex items-center space-x-1">
              <span>Top Up</span>
            </button>
          </div>
          <div className="flex flex-col items-center">
            <FontAwesomeIcon onClick={() => setIsModalOpen(true)} icon={faArrowDown} className="mb-1 border border-white p-1 cursor-pointer" />
            <button className="flex items-center space-x-1">
              <span>Tarik Dana</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg text-dark font-semibold mb-4 bg-white p-4">Riwayat Transaksi</h2>
        <div className="space-y-4">{/* <WithdrawHistoryList user_id={6} onTransactionClick={(t: Transaction) => handleTransactionClick(t)} /> */}</div>
      </div>

      <TarikDanaModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      <TopUpModal isOpen={isDetailModalOpen} setIsOpen={setIsDetailModalOpen} />

      {/* Modal untuk detail transaksi - diatur supaya full width */}
      <Modal isOpen={isDetailModalOpen2} onClose={() => setIsDetailModalOpen2(false)} className="!p-0" style={{ padding: 0 }}>
        <ModalContent
          className="p-4"
          style={{
            width: "100vw",
            maxWidth: "100vw",
            margin: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            boxSizing: "border-box",
          }}
        >
          <ModalHeader className="text-dark">Detail Transaksi</ModalHeader>
          <ModalBody>
            {selectedTransaction ? (
              <div className="w-full">
                <p className="text-lg font-bold text-dark mb-2">{selectedTransaction.type}</p>
                <p className="text-dark text-lg mb-4">{selectedTransaction.amount}</p>

                <p className="text-lg font-bold text-dark mb-2">Rincian Transaksi</p>
                <div className="flex justify-between">
                  <p className="text-dark mb-2">Jenis</p>
                  <p className="text-dark mb-2">{selectedTransaction.type}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-dark mb-2">Waktu</p>
                  <p className="text-dark mb-2">{selectedTransaction.time}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-dark mb-2">Tujuan</p>
                  <p className="text-dark mb-2">{selectedTransaction.destination}</p>
                </div>
              </div>
            ) : (
              <div>Tidak ada detail transaksi</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button className="bg-primary text-white" onClick={() => setIsDetailModalOpen2(false)}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default WithDraw;
