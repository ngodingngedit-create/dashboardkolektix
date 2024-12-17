import { useState, useEffect, useMemo } from 'react';
import { BreadcrumbItem, Breadcrumbs, Input } from '@nextui-org/react';
import Button from '@/components/Button';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
  Pagination
} from '@nextui-org/react';
import DateTab from '@/components/DateTab';
import { useAsyncList } from '@react-stately/data';
import ModalCheckin from '@/components/Dashboard/Modal/ModalCheckin';
import { Get } from '@/utils/REST';
import { EventProps, TicketProps } from '@/utils/globalInterface';
import { useRouter } from 'next/router';
import TicketPicker from '@/components/TicketPicker';
import Images from '@/components/Images';
import ModalOfflineSales from '@/components/Modals/ModalOfflineSales';
import axios from 'axios';
import config from '@/Config';
import * as XLSX from 'xlsx';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faEye } from '@fortawesome/free-solid-svg-icons';
import { ResponseData } from './offline';
import { Flex, ScrollArea, Stack, Text, Table as TableM, Card, Button as ButtonM, TextInput, Divider, NumberFormatter, ActionIcon } from '@mantine/core';
import { modals } from '@mantine/modals';
import Link from 'next/link';
import { Icon } from '@iconify/react/dist/iconify.js';
import { currencyFormat } from '@/utils/currencyFormat';
import _ from 'lodash';
import moment from 'moment';



const exportToExcel = (transactions: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(transactions);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

interface FormTicket {
  event_id: number;
  event_ticket_id: number;
  name: string;
  price: number;
  subtotal_price: number;
  qty_ticket: number;
  payment_status: string;
  grand_total: number;
}

interface TransactionResponse {
  data: any;
}

interface Transaction {
  grand_total: number;
  invoice_no: string;
}

const DetailEventTicket = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<number>(0);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [data, setData] = useState<TicketProps[]>([]);
  const [ticket, setTicket] = useState<FormTicket[]>([]);
  const [step, setStep] = useState<number>(0);
  const [isLogin, setIsLogin] = useState(true);
  const [eventData, setEventData] = useState<EventProps | null>(null);
  const [paymentList, setPaymentList] = useState<any>(null);
  const router = useRouter();
  const { slug } = router.query;
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const [activeTab, setActiveTab] = useState('Offline');
  const [onlineTransactions, setOnlineTransactions] = useState([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [onlineList, setOnlineList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [onlinePage, setOnlinePage] = useState(1);
  const rowsPerPage = 25;
  const rowsPerPages = 25;

  useEffect(() => {
    if (data.length > 0) updateDataBasedOnCounts();
  }, [counts]);

  const updateDataBasedOnCounts = () => {
    const newData = Object.keys(counts)
        .filter((id) => counts[parseInt(id)] > 0)
        .map((id, idx) => ({
            id: parseInt(id),
            event_id: 1,
            event_ticket_id: parseInt(id),
            price: data[data.findIndex((el) => el.id === parseInt(id))].price,
            name: data[data.findIndex((el) => el.id === parseInt(id))].name,
            subtotal_price: data[data.findIndex((el) => el.id === parseInt(id))].price * counts[id],
            qty_ticket: counts[id],
            payment_status: 'pending',
            grand_total: 0
        }));

    setTicket(newData);
    // //console.log(newData, 'aw');
  };

  const getData = () => {
    setIsLoading(true);
    Get(`event/${slug}`, {})
      .then((res: any) => {
        setEventData(res.data);
        setData(res.data.has_event_ticket);
        initializeCounts(res.data.has_event_ticket);
        setIsLoading(false);
        console.log('Event data fetched:', res);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };


  const getPaymentMethod = () => {
    setIsLoading(true);
    Get(`payment-method`, {})
      .then((res: any) => {
        console.log(res);
        setPaymentList(res);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  
  

  const initializeCounts = (data: TicketProps[]) => {
    const initialCount: Record<number, number> = {};
    data.forEach((item) => {
      initialCount[item.id] = 0;
    });
    setCounts(initialCount);
  };


  useEffect(() => {
    if (slug) {
      getData();
      getPaymentMethod();
    }
  }, [slug]);


  useEffect(() => {
    if (activeTab === 'Online') {
      const fetchOnlineTransactions = async () => {
        setIsLoadingOnline(true);
        const data = await getTransactionByEvent();
        if (data) {
          setOnlineTransactions(data.data || []);
        }
        setIsLoadingOnline(false);
      };
  
      fetchOnlineTransactions();
    }
  }, [activeTab, eventData?.id]);
  

  let totalPrice = 0;
  let totalQty = 0;

  ticket.forEach((item) => {
    totalPrice += item.price;
    totalQty += item.qty_ticket;
  });

  let totalSubtotalPrice = 0;

  ticket.forEach((item) => {
    totalSubtotalPrice += item.subtotal_price;
  });

  useEffect(() => {
    if (eventData && eventData.id) {
      list.reload();
    }
  }, [eventData]);

  let list = useAsyncList({
    async load({ signal }) {
      if (!eventData?.id) {
        return { items: [] };
      }

  
      try {
        const res = await axios.get(
          `${config.wsUrl}list-transaction-by-event?event_id=${eventData.id}&type_transaction=offline`,
          { signal }
        );
        const json = await res.data;
        console.log(json, signal, 'offline');
  
        
        const totalDataLength = json.data.length;
        console.log('Total transaksi offline:', totalDataLength);
        
  
        // Update UI atau state dengan total panjang data
        setIsLoading(false);
  
        return { items: json.data as ResponseData['data'], total: totalDataLength };
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setIsLoading(false);
        return { items: [], total: 0 };
      }
    },

    

    
  
  async sort({ items, sortDescriptor }) {
    return {
      items: items.sort((a, b) => {
        // @ts-ignore
        const first = a[sortDescriptor.column];
        // @ts-ignore
        const second = b[sortDescriptor.column];
        let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

        if (sortDescriptor.direction === 'descending') {
          cmp *= -1;
        }
        return cmp;
      }),
    };
  },
});


const getTransactionByEvent = async () => {
  if (!eventData?.id) return;

  setIsLoading(true);

  try {
    const response = await axios.get(
      `${config.wsUrl}list-transaction-by-event?event_id=${eventData.id}&type_transaction=online`
    );
    const transactionData = response.data;
    console.log('online:', transactionData);

    setOnlineList(transactionData.data); // Simpan data transaksi online di state

    // Jika ada grand_total yang perlu disimpan, lakukan di sini
    setGrandTotal(transactionData.grand_total);

    return transactionData;
  } catch (error) {
    console.error('Error fetching transaction data by event:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  if (slug) {
    getData();
    getPaymentMethod();
    getTransactionByEvent();
  }
}, [slug]);

// useEffect(() => {
//   if (data.length > 0) {
//     updateDataBasedOnCounts();
//   }
// }, [counts]);

useEffect(() => {
  if (eventData && eventData.id) {
    getTransactionByEvent();
    list.reload();
  }
}, [eventData]);
const pages = list.items.length > 0 ? Math.ceil(list.items.length / rowsPerPage) : 25;
const onlinePages = Math.ceil(onlineList.length / rowsPerPages);
console.log(list.items); // Untuk cek apakah datanya benar




// Get the items for the current page
const currentItems = useMemo(() => {
  const start = (page - 1) * rowsPerPage;
  return list.items.slice(start, start + rowsPerPage) as ResponseData['data'];
}, [page, list.items]);

const currentItemsOnline = useMemo(() => {
  const start = (onlinePage - 1) * rowsPerPages;
  return onlineList.slice(start, start + rowsPerPages);
}, [onlinePage, onlineList]);

const [searchQuery, setSearchQuery] = useState('');

// Fungsi untuk menangani perubahan input pencarian
const handleSearchChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSearchQuery(event.target.value);
};



const filteredOfflineTransactions = list.items.filter((transaction: any) =>
    transaction.invoice_no.toLowerCase().includes(searchQuery.toLowerCase())
);

const filteredOnlineTransactions = onlineList.filter((transaction: any) =>
    transaction.invoice_no.toLowerCase().includes(searchQuery.toLowerCase())
);

const handleOpenDetailOffline = (data: ResponseData['data'][number]) => {
  modals.open({
    title: 'Detail Transaksi',
    children: <ModalOfflineDetail data={data} />,
    centered: true,
    size: '80vw',
  })
}

return (
  <>
  <div className="py-5 text-dark px-5">
    <Breadcrumbs className="mb-5">
      <BreadcrumbItem href="/dashboard/my-event">Event Saya</BreadcrumbItem>
      <BreadcrumbItem>{eventData?.name}</BreadcrumbItem>
      <BreadcrumbItem onClick={() => setStep(0)}>Penjualan</BreadcrumbItem>
      {step === 1 && <BreadcrumbItem>Tiket</BreadcrumbItem>}
    </Breadcrumbs>
    <Flex align="center" justify="space-between" gap={20} wrap="wrap">
      <div className='flex gap-2 mb-4 items-center'>
        <Button
          label="Online"
          color={activeTab === 'Offline' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('Offline')}
        />
        <Button
          label="Offline"
          color={activeTab === 'Online' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('Online')}
        />
        {(activeTab === 'Online' && step == 1) && (
          <Text fw={600} ml={10}>Tiket - OTS</Text>
        )}
      </div>
      <Button
          label="List Transaksi"
          color={'secondary'}
          onClick={() => setStep(0)}
        />
    </Flex>
    {activeTab === 'Offline' ? (
        <div>
        <div className="">
          <div>
            {eventData && <h3 className="mb-3">{eventData.name}</h3>}
            <p className="text-sm text-grey mb-3">12 Juni - 14 Juni 2024</p>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
            <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 mt-4 text-center">
              <p className="text-grey">Total Pembelian Online</p>
              <p className="font-semibold">{onlineList.length}</p>
            </div>
            <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 mt-4 text-center">
              <p className="text-grey">Total Jumlah Tiket Online</p>
              <p className="font-semibold">
                {onlineList.reduce((acc: number, item: any) => acc + parseFloat(item.total_qty || 0), 0)}
              </p>
            </div>
            <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 mt-4 text-center">
              <p className="text-grey">Total Transaksi Online</p>
              <p className="font-semibold">
                Rp{onlineList.reduce((acc: number, item: any) => acc + parseFloat(item.total_price || 0), 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
        <div className="mb-4 mt-4 flex justify-between">
          <div>
          <Button
                label="Download Laporan"
                color="secondary"
                onClick={() => exportToExcel(onlineTransactions, 'online_transactions')}
              />
          </div>

            </div>
            <Table
          aria-label="Example table with client side sorting"
          isCompact
          className='mt-5 border-2 border-primary-light-200 rounded-xl w-full table-auto' 
          classNames={{
            table: '',
            th: 'bg-primary-light font-medium text-md font-bold text-dark',
            tr: 'border-b border-b-primary-light-200 last:border-b-0',
            td: 'text-xs border-l border-l-primary-light-200 border-r text-md border-primary-light-200 py-2',
          }}
        >
          <TableHeader>
            <TableColumn key="name" allowsSorting>
              Nama
            </TableColumn>
            <TableColumn key="invoice_no" allowsSorting>
              Nomor Invoice
            </TableColumn>
            <TableColumn key="created_at" allowsSorting>
              Tanggal & Waktu Pembelian
            </TableColumn>
            <TableColumn key="total_qty" allowsSorting>
              Jumlah Tiket
            </TableColumn>
            <TableColumn key="transaction_status_id" allowsSorting>
              Status
            </TableColumn>
            <TableColumn key="total_price" allowsSorting>
              Jumlah Pembayaran
            </TableColumn>
            <TableColumn key="actions">
              Aksi
            </TableColumn>
          </TableHeader>
          <TableBody
            items={currentItemsOnline}
            isLoading={isLoadingOnline}
            loadingContent={<Spinner label="Loading..." />}
            emptyContent="Tidak ada transaksi"
          >
            {(item: any) => (
              <TableRow key={item.id}>
                {(columnKey) => {
                  if (columnKey === "name") {
                    return (
                      <TableCell>
                        {item.has_user ? item.has_user.name : "Tidak Ada"}
                      </TableCell>
                    );
                  }
                  if (columnKey === "total_price") {
                    return (
                      <TableCell>
                        {parseFloat(item.total_price).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })}
                      </TableCell>
                    );
                  }
                  if (columnKey === "transaction_status_id") {
                    return (
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-md font-medium ${
                            item.transaction_status_id === 4
                              ? 'bg-red-500 text-white' // Warna background danger
                              : item.transaction_status_id === 2
                              ? 'bg-green-500 text-white' // Warna background success
                              : item.transaction_status_id === 1
                              ? 'bg-yellow-500 text-white' // Warna background untuk Pending
                              : 'bg-gray-200 text-black' // Default jika status tidak Expired, Verified, atau Pending
                          }`}
                        >
                          {item.payment_status}
                        </span>
                      </TableCell>
                    );
                  }
                  if (columnKey === "created_at") {
                    return (
                      <TableCell>
                        {item.created_at
                          ? new Date(item.created_at)
                              .toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                              .split('/')
                              .join('-')
                          : '-'}
                      </TableCell>
                    );
                  }
                  if (columnKey === "actions") {
                    return (
                      <TableCell>
                        <div className="flex space-x-2">
                          <button>
                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-600 hover:text-gray-800" />
                          </button>
                          <button>
                            <FontAwesomeIcon icon={faEye} className="text-gray-600 hover:text-gray-800" />
                          </button>
                        </div>
                      </TableCell>
                    );
                  }
                  return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex w-full justify-center mt-4">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={onlinePage}
              total={onlinePages}
              onChange={(page) => setOnlinePage(page)} // Perbarui untuk menggunakan page
            />
          </div>
      </div>
     
    ) : (
      !isLoading && eventData ? (
        <>
          {step === 0 ? (
            <>
              <div className=" mb-4">
                <div>
                  <Flex justify="space-between" gap={20} wrap="wrap">
                    <Stack gap={0}>
                      <h3 className="mb-3">{eventData.name}</h3>
                      <p className="text-sm text-grey mb-3">{moment(eventData.start_date).format('DD MMM YYYY')} - {moment(eventData.end_date).format('DD MMM YYYY')}</p>
                      <p className='text-black'>{eventData.grand_total}</p>
                    </Stack>
                    <ButtonM
                      onClick={() => setStep(1)}
                      rightSection={<Icon icon="hugeicons:cashier" />}
                    >Penjualan Tiket OTS</ButtonM>
                  </Flex>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 mt-4 text-center">
                  <p className="text-grey">Total Pembelian Offline</p>
                  <p className="font-semibold">{list.items.length}</p>
                </div>
                <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 mt-4 text-center">
                  <p className="text-grey">Total Jumlah Tiket</p>
                  <p className="font-semibold">
                  {list.items.reduce((acc: number, item: any) => acc + parseFloat(item.total_qty || 0), 0)}
                  </p>
                </div>
                <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 mt-4 text-center">
                  <p className="text-grey">Total Transaksi Offline</p>
                  <p className="font-semibold">
                    Rp
                    {list.items.reduce((acc: number, item: any) => acc + parseFloat(item.total_price || 0), 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              </div>
              <div className="mb-4 mt-4 flex justify-between">
                <div>
                <Button
                      label="Download Laporan"
                      color="secondary"
                      onClick={() => exportToExcel(list.items, 'offline_transactions')}
                    />
                </div>
              </div>
              <Table
                aria-label="Example table with client side sorting"
                isCompact
                className='mt-5 border-2 border-primary-light-200 rounded-xl'
                classNames={{
                  table: '',
                  th: 'bg-primary-light font-medium text-md font-bold text-dark',
                  tr: 'border-b border-b-primary-light-200 last:border-b-0',
                  td: 'text-xs border-l border-l-primary-light-200 border-r text-md border-primary-light-200 py-2',
                }}
              >
                <TableHeader>
                  {/* <TableColumn key="name" allowsSorting>
                    Nama
                  </TableColumn> */}
                  <TableColumn key="invoice_no" allowsSorting={false}>
                    Nomor Invoice
                  </TableColumn>
                  <TableColumn key="created_at" allowsSorting={false}>
                    Tanggal & Waktu Pembelian
                  </TableColumn>
                  <TableColumn key="total_qty" allowsSorting={false}>
                    Jumlah Tiket
                  </TableColumn>
                  <TableColumn key="transaction_status_id" allowsSorting={false}>
                    Status
                  </TableColumn>
                  <TableColumn key="total_price" allowsSorting={false}>
                    Jumlah Pembayaran
                  </TableColumn>
                  <TableColumn key="actions">
                    Aksi
                  </TableColumn>
                </TableHeader>
                <TableBody
                  items={currentItems}
                  isLoading={isLoading}
                  loadingContent={<Spinner label="Loading..." />}
                  emptyContent="Tidak ada transaksi"
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      {(columnKey) => {
                        // if (columnKey === "name") {
                        //   return (
                        //     <TableCell>
                        //       {item.has_user ? item.has_user.name : "Tidak Ada"}
                        //     </TableCell>
                        //   );
                        // }
                        if (columnKey === "total_price") {
                          return (
                            <TableCell>
                              {parseFloat(item.total_price).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                              })}
                            </TableCell>
                          );
                        }
                        if (columnKey === "transaction_status_id") {
                          return (
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-md font-medium ${
                                  item.transaction_status_id === "4"
                                    ? 'bg-red-500 text-white' // Warna background danger
                                    : item.transaction_status_id === "2"
                                    ? 'bg-green-500 text-white' // Warna background success
                                    : item.transaction_status_id === "1"
                                    ? 'bg-yellow-500 text-white' // Warna background untuk Pending
                                    : 'bg-gray-200 text-black' // Default jika status tidak Expired, Verified, atau Pending
                                }`}
                              >
                                {item.payment_status}
                              </span>
                            </TableCell>
                          );
                        }
                        if (columnKey === "created_at") {
                          return (
                            <TableCell>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              }).split('/').join('-') : '-'}
                            </TableCell>
                          );
                        }
                        if (columnKey === "actions") {
                          return (
                            <TableCell>
                              <div className="flex space-x-2">
                                {/* <button>
                                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-600 hover:text-gray-800" />
                                </button> */}
                                <ActionIcon onClick={() => handleOpenDetailOffline(item)} variant="transparent">
                                  <Icon icon="iconamoon:eye" className={`text-[24px]`} />
                                </ActionIcon>
                                <ActionIcon
                                  component={Link}
                                  href={`${config['wsUrl']}transaction-document/${item.invoice_no}`}
                                  target="_blank"
                                  variant="transparent">
                                  <Icon icon="uiw:download" className={`text-[20px]`} />
                                </ActionIcon>
                              </div>
                            </TableCell>
                          );
                        }
                        return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
                      }}
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex w-full justify-center mt-4">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
            </>
          ) : (
            <>
              <div className="min-h-[60vh] max-w-2xl mx-auto">
                <TicketPicker
                  eventData={eventData}
                  counts={counts}
                  setCounts={setCounts}
                  data={data}
                  isLogin={isLogin}
                  selected={selected}
                  setSelected={setSelected}
                />
              </div>
              <div className="w-full sticky bottom-0 border-t bg-white border-t-primary-light-200 py-4">
                <div className="flex max-w-2xl mx-auto justify-between items-center">
                  <div>
                    <p className="font-semibold mb-0.5">
                      Total
                      <span className="text-grey">{` (${totalCount} Tiket)`}</span>
                    </p>
                    <p className="font-semibold">
                      Rp{totalSubtotalPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Button
                    label="Pembayaran"
                    color="primary"
                    onClick={() => setShowModal(true)}
                    disabled={totalCount < 1}
                  />
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <Spinner color="primary" />
      )
    )}
  </div>
  <ModalOfflineSales
    isOpen={showModal}
    setIsOpen={setShowModal}
    // paymentList={[...(paymentList ?? []), { id: 5, payment_name: 'CASH', icon: 'mingcute:cash-2-line' }].map(e => ({...e, logo: `${config.assetUrl}logo/${e.logo ?? '#'}`}))}
    paymentList={
      eventData?.has_event_payment_method.map((e) => paymentList.find((z: any) => z.id == e.payment_method_id)).length == 0 ?
      paymentList.filter((e: any) => e.id == '4') :
      eventData?.has_event_payment_method.map((e) => paymentList.find((z: any) => z.id == e.payment_method_id))
    }
    ticket={ticket}
    eventData={eventData}
    subtotal={totalSubtotalPrice}
    reload={list.reload}
    setParentStep={setStep}
  />
</>

);

};

export default DetailEventTicket;

const ModalOfflineDetail = ({ data }: { data: ResponseData['data'][number] }) => {
  return (
    <Flex gap={30} wrap="wrap" className={`[&>*]:flex-grow`}>
      <Card withBorder radius={10} maw={400}>
        <Stack>
          <Text fw={600}>No Invoice: {data.invoice_no}</Text>
          <Divider />
          <Flex gap={10} wrap="wrap" className={`[&>*]:flex-grow`}>
            <TextInput
              label="Waktu Transaksi"
              variant="filled"
              value={moment(data.created_at).format('DD MMMM YYYY - HH:mm')}
              readOnly
            />
            <TextInput
              label="Total Tiket"
              variant="filled"
              value={data.total_qty}
              readOnly
            />
            <TextInput
              label="Jumlah Pembayaran"
              variant="filled"
              value={currencyFormat(parseInt(data.grandtotal))}
              readOnly
            />
            <TextInput
              label="Metode Pembayaran"
              variant="filled"
              value={_.capitalize(data?.payment_method?.account_name ?? '-')}
              readOnly
            />
          </Flex>
          <Divider />
          <ButtonM
            w="fit-content"
            component={Link}
            href={`${config['wsUrl']}transaction-document/${data.invoice_no}`}
            target="_blank"
            rightSection={<Icon icon="uiw:download" />}>
            Unduh Etiket
          </ButtonM>
        </Stack>
      </Card>
      <Stack gap={8}>
        <Text c="gray">Pemilik Tiket</Text>
        <Card className={``} p={0} radius={10} withBorder>
          <ScrollArea>
            <TableM
              w="100%"
              data={{
                head: ['Nama', 'Email', 'No. Telp'],
                body: (data?.identities ?? []).map((e, i) => [
                  e.full_name,
                  e.email,
                  e.no_telp,
                ]),
              }}
            />
          </ScrollArea>
        </Card>
      </Stack>
    </Flex>
  )
}
