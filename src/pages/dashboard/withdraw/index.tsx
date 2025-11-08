import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import TarikDanaModal from "@/components/Dashboard/Modal/Withdraw";
import TopUpModal from "@/components/Dashboard/Modal/TopUp";
import { useState, useEffect } from "react";
import CreatorTable from "@/components/Dashboard/CreatorTable";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

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

interface Record {
  date: string;
  transactions: Transaction[];
}

const WithDraw = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen2, setIsDetailModalOpen2] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // State untuk detail transaksi
  const [eventData, setEventData] = useState<EventData[] | null>(null);

  const calculateTotal = (key: keyof EventData) => {
    console.log(eventData);
    if (!eventData || eventData.length === 0) return 0;

    return eventData.reduce((total, event) => {
      if (key === "total_price_sell") {
        const online = Number(event.total_price_sell_online || 0);
        const offline = Number(event.total_price_sell_offline || 0);
        return total + online + offline;
      }
      return total + Number(event[key] || 0);
    }, 0);
  };

  const calculateTotalEvents = () => {
    return eventData ? eventData.length : 0;
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen2(true);
  };

  const transactionsData: Record[] = [
    // {
    //     date: 'Kamis, 11 Jul 2024',
    //     transactions: [
    //         { type: 'Pembayaran', time: '07:22 WIB', amount: '-Rp10.000', destination: 'Ke BCA', color: 'text-red-500' },
    //         { type: 'Top Up', time: '07:22 WIB', amount: '+Rp10.000', destination: 'Dari BCA', color: 'text-green-500' },
    //         { type: 'Tarik Dana', time: '07:22 WIB', amount: '-Rp10.000', destination: 'Ke BCA', color: 'text-red-500' },
    //     ],
    // },
    // {
    //     date: 'Rabu, 10 Jul 2024',
    //     transactions: [
    //         { type: 'Pembayaran', time: '07:22 WIB', amount: '-Rp10.000', destination: 'Ke BCA', color: 'text-red-500' },
    //         { type: 'Top Up', time: '07:22 WIB', amount: '+Rp10.000', destination: 'Dari BCA', color: 'text-green-500' },
    //         { type: 'Top Up', time: '07:22 WIB', amount: '+Rp10.000', destination: 'Dari BCA', color: 'text-green-500' },
    //     ],
    // },
  ];

  return (
    <div className="w-full max-w-2xl bg-blue-50 mx-auto mt-4 mb-48 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-primary text-white p-4 flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <i className="fas fa-wallet mr-2"></i>
            <span>Saldo</span>
          </div>
          <div className="text-2xl">Rp{calculateTotal("total_price_sell").toLocaleString("id-ID")}</div>
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
      <div className="">
        <h2 className="text-lg text-dark font-semibold mb-4 bg-white p-4">Riwayat Transaksi</h2>
        <div className="space-y-4">
          {transactionsData.map((record, index) => (
            <div key={index}>
              <div className="text-dark text-lg mb-2 bg-white p-4">{record.date}</div>
              <div className="space-y-2">
                {record.transactions.map((transaction, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white my-2 p-4 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTransactionClick(transaction)} // Panggil fungsi saat transaksi diklik
                  >
                    <div className="text-dark">
                      <div>{transaction.type}</div>
                      <div className="text-gray-500 text-sm">{transaction.time}</div>
                    </div>
                    <div>
                      <div className="text-dark text-sm">{transaction.destination}</div>
                      <div className={transaction.color}>{transaction.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <TarikDanaModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      <TopUpModal isOpen={isDetailModalOpen} setIsOpen={setIsDetailModalOpen} />

      {/* Modal untuk detail transaksi */}
      <Modal isOpen={isDetailModalOpen2} onClose={() => setIsDetailModalOpen2(false)}>
        <ModalContent>
          <ModalHeader className="text-dark">Detail Transaksi</ModalHeader>
          <ModalBody>
            {selectedTransaction && (
              <div>
                <p className="text-lg font-bold text-dark mb-2">Pembayaran</p>
                <p className="text-dark text-lg mb-4">{selectedTransaction.amount}</p>
                <p className="text-lg font-bold text-dark mb-2">Rincian Transaksi</p>
                <div className="flex justify-between">
                  <p className="text-dark mb-2">Jenis</p>
                  <p className="text-dark mb-2"> {selectedTransaction.type}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-dark mb-2">Waktu</p>
                  <p className="text-dark mb-2">{selectedTransaction.time}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-dark mb-2">Tujuan</p>
                  <p className="text-dark mb-2"> {selectedTransaction.destination}</p>
                </div>
              </div>
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
