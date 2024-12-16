import React, { useState, useMemo, useCallback, useEffect } from 'react';import EventCardCreator from '@/components/Card/EventCard/creator';
import { useAsyncList } from '@react-stately/data';
import config from '@/Config';
import { useRouter } from 'next/router';
import axios from 'axios';
import DetailModal from '@/components/Dashboard/Modal/ModalInvation';
import EditEventModal from '@/components/Dashboard/Modal/ModalEditInvation';
import AddEventModal, { CategoryResponse } from '@/components/Dashboard/Modal/ModalAddInvation';
import InvitationDetailModal from '@/components/Dashboard/Modal/ModalDetailInvation';
import {
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Accordion, AccordionItem, Selection
} from '@nextui-org/react';
import { EventProps } from '@/utils/globalInterface';
import { EventTicket } from '@/utils/formInterface';
import { Tabs, Tab } from '@nextui-org/react';
import { Get } from '@/utils/REST';
import Button from '@/components/Button';
import TicketContainer from '@/components/TicketContainer';
import ModalCreateTicket from '@/components/EventCreator/Modal/ModalCreateTicket';
import DescriptionBlock from '@/components/Detail/DescriptionBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload,faEye, faPaperPlane, faPencil, faPlus } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Legend } from 'chart.js';
import TarikDanaModal from '@/components/Dashboard/Modal/Withdraw';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
import { toast } from 'react-toastify';
import { get } from 'http';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ActionIcon, Card, Divider, Flex, NumberFormatter, Stack, Text, Tooltip, Button as ButtonM, Box, Center } from '@mantine/core';
import WithdrawHistoryList from '@/components/MyEvent/WithdrawHistoryList';
import useLoggedUser from '@/utils/useLoggedUser';
import fetch from '@/utils/fetch';
import { notifications } from '@mantine/notifications';
import _ from 'lodash';



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

interface InvitationDataItem {
  invoice_no: string;
  // Add other properties as needed
}

const MyEventDetail = () => {
  const defaultForm: EventTicket = {
    ticket_type: '',
    ticket_category_id: 1,
    ticket_category: 'Festival',
    name: '',
    ticket_date: null,
    ticket_end: null,
    qty: 0,
    price: 0,
    description: '',
  };
  const router = useRouter();
  const user = useLoggedUser();
  const { slug } = router.query;
  const [data, setData] = useState<EventProps>();
  const [ticket, setTicket] = useState<EventTicket[]>([]);
  const [editTicket, setEditTicket] = useState<EventTicket>(defaultForm);
  const [addTicket, showAddTicket] = useState<boolean>(false);
  const [idxTicket, setIdxTicket] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0); 
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedInvitation, setSelectedInvitation] =  useState(null);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [invitationData, setInvitationData] = useState<any[]>([]);
  const [invitation, setInvitation] = useState<any[]>([]); // Consider renaming to invitation to avoid confusion
  const [invitationFilter, setInvitationFilter] = useState('');
  const [updateWithdrawHistory, setUpdateWithdrawHistory] = useState(1);

  const [invitationCategory, setInvitationCategory] = useState<CategoryResponse[]>();

  const getInvitationCategory = async () => {
    await fetch<any, CategoryResponse[]>({
      url: 'invitation-category',
      method: 'GET',
      data: {},
      success: ({ data }) => data && setInvitationCategory(data),
      error: () => {},
    });
  }


  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (item: React.SetStateAction<null>) => {
    setSelectedEvent(item);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };


  const openDetailModal = (item:any) => {
    setSelectedItem(item);  // Set the selected item details
    setIsDetailModalOpen(true);    // Open the modal
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);   // Close the modal
    setSelectedItem(null);   // Clear selected item
  };

  const openInvitationModal = (item: any) => {
    setSelectedInvitation(item);
    setIsInvitationModalOpen(true);
  };

  const closeInvitationModal = () => {
    setIsInvitationModalOpen(false);
    setSelectedInvitation(null);
  };

    const getData = () => {
      setLoading(true);
      Get(`event/${slug}`, {})
          .then((res: any) => {
              if (res.data) {
                  setData(res.data);
                  console.log("masuk", res);
                  const eventId = res.data.id;
                  setTicket(res.data.has_event_ticket);
                  getReportData(eventId);
                  getInvitationEventData(eventId);
              } else {
                  console.warn("Response data is empty or undefined.");
              }
              setLoading(false);
          })
          .catch((err) => {
              console.error("Error fetching data:", err);
              setLoading(false);
          });
  };
  const getReportData = async (id: string | number) => {
    try {
      const response = await axios.get(`${config.wsUrl}event/show-report/${id}`);
      const result = response.data;
  
      if (Array.isArray(result.data)) {
        setInvitationData(result.data);
      } else {
        console.warn("Fetched data is not an array:", result);
        setInvitationData([]);
      }
    } catch (err) {
      console.error("Error fetching invitation data:", err);
    }
  };


  const sendETicket = async (invoiceNo: any, email: any) => {
    try {
      const response = await axios.get(`${config.wsUrl}transaction/send/eticket/${invoiceNo}`, {
        params: {
          email: email // Pass the email here as a query parameter
        }
      });
      console.log('E-ticket sent successfully:', response.data);
      setLoading(false);
      toast.success(`E-ticket sent successfully to ${email}`); // Use toast for success notification
    } catch (error) {
      console.error('Error sending e-ticket:', error);
      toast.error('Failed to send e-ticket.'); // Use toast for error notification
    }
  };
  
  
  const handleDownloadTransaction = async () => {
    window.open(`${config.wsUrl}list-transaction-by-event?event_id=${data?.id}&download=true`)
  }


  useEffect(() => {
    if (slug) {
      getData();
      getInvitationCategory();
    }
  }, [slug]);


  const filteredItems = useMemo(() => {
    if (!Array.isArray(invitationData)) {
      return [];
    }
  
    return invitationData.filter((item) => {
      const matchesInvoice = item.invoice_no.toLowerCase().includes(filterValue.toLowerCase());
      const matchesStatus = item.transaction_status_id === 2; // Status filter
      const matchesType = transactionFilter === 'all' || item.type_transaction === transactionFilter;
  
      return matchesInvoice && matchesStatus && matchesType;
    });
  }, [invitationData, filterValue, transactionFilter]);
  

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const onSearchChange = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
    setFilterValue(e.target.value);
    setPage(1);
  }, []);

  const onRowsPerPageChange = useCallback((e: { target: { value: any; }; }) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const getStatusClass = (statusId: any) => {
    switch (statusId) {
      case 1:
        return 'bg-warning'; // For Pending
      case 2:
        return 'bg-success'; // For Verified / Paid
      case 3:
        return 'bg-danger'; // For Failed
      case 4:
        return 'bg-secondary'; // For Expired
      default:
        return ''; // Default or unknown status
    }
  };
  
  const getStatusText = (statusId: any) => {
    switch (statusId) {
      case 1:
        return 'Pending';
      case 2:
        return 'Verified';
      case 3:
        return 'Failed';
      case 4:
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getInvitationEventData = async (id: string | number) => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get(`${config.wsUrl}invitations/event/${id}`);
      console.log("Response from API:", response.data); // Print API response
      setInvitation(response.data); // Set invitation data
    } catch (err) {
      console.error("Error fetching event invitation data:", err);
    } finally {
      setLoading(false); // End loading
    }
};


  
  const sendEventETicket = async (invoiceNo: any, email: any) => {
    try {
      const response = await axios.get(`${config.wsUrl}transaction/send/eticket/${invoiceNo}`, {
        params: {
          email: email
        }
      });
      console.log('E-ticket sent successfully:', response.data);
      setLoading(false);
      toast.success(`E-ticket sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending e-ticket:', error);
      toast.error('Failed to send e-ticket.');
    }
  };
  
  const filteredEventItems = useMemo(() => {
    if (!Array.isArray(invitation)) {
      return []; // If it's not an array, return an empty array
    }
  
    return invitation.filter((item) =>
      item.invitation_title.toLowerCase().includes(invitationFilter.toLowerCase())
    );
  }, [invitation, invitationFilter]);
  
  

  
  const eventPages = Math.ceil(filteredEventItems.length / rowsPerPage);

const eventItems = useMemo(() => {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return filteredEventItems.slice(start, end);
}, [page, filteredEventItems, rowsPerPage]);

  
  const onEventSearchChange = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
    setInvitationFilter(e.target.value);
    setPage(1);
  }, []);
  
  const onEventRowsPerPageChange = useCallback((e: { target: { value: any; }; }) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);
  
  const getEventStatusClass = (statusId: any) => {
    switch (statusId) {
      case 1:
        return 'bg-warning'; // Pending
      case 2:
        return 'bg-success'; // Verified / Paid
      case 3:
        return 'bg-danger'; // Failed
      case 4:
        return 'bg-secondary'; // Expired
      default:
        return ''; // Default
    }
  };
  
  const getEventStatusText = (statusId: any) => {
    switch (statusId) {
      case 1:
        return 'Pending';
      case 2:
        return 'Verified';
      case 3:
        return 'Failed';
      case 4:
        return 'Expired';
      default:
        return 'Unknown';
    }
  };
  

  const getEventData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.wsUrl}event-view-list-by-slug/${slug}`);
      if (response && response.data) {
        setEventData(response.data);
        console.log(response.data,"tes uhuy")
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Online', 'Offline'],
    datasets: [
      {
        label: 'Jumlah Transaksi',
        data: [
          eventData?.total_online || 0,
          eventData?.total_offline || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  useEffect(() => {
    if (typeof slug === 'string') {
      getEventData();
    }
  }, [slug]);
  
  
  
  
  const onEditTicket = (data: EventTicket, idx: number) => {
    console.log("Editing ticket:", data, idx); 
    setIdxTicket(idx);
    setEditTicket(data);
    showAddTicket(true);
  };

  const onAddTicket = () => {
    // setEditTicket({
    //   ...defaultForm,
    // });
    setIdxTicket(null);
    showAddTicket(true);
  };

  const deleteTicket = (idx: number) => {
    let arr = [...ticket];
    arr.splice(idx, 1);
    setTicket(arr);
  };

  useEffect(() => {
    if (slug) {
      console.log("Slug is available:", slug);
      getData();
    } else {
      console.warn("Slug is undefined or missing.");
    }
  }, [slug]);

  let list = useAsyncList({
    async load({ signal }) {
      if (data?.id) {
        try {
          let res = await axios.get(`${config.wsUrl}list-transaction-by-event?event_id=${data.id}`, {
            signal,
          });
          let json = await res.data;
          setIsLoading(false);
  
          return {
            items: json.data,
          };
        } catch (error) {
          console.error("Error fetching transaction data:", error);
          setIsLoading(false);
          return { items: [] };
        }
      } else {
        setIsLoading(false);
        return { items: [] };
      }
    },
  });

  useEffect(() => {
    if (data?.id) {

      setIsLoading(true);

      axios
        .get(`${config.wsUrl}list-transaction-by-event?event_id=${data.id}`)
        .then((res) => {

          setGrandTotal(res.data.grand_total || 0);

          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching transaction data:", err);
          setIsLoading(false);
        });
    } else {
      console.log("Menunggu data event tersedia...");
    }
  }, [data]);

  const downloadLaporan = () => {
    if (!eventData) return;
  
    // Data yang akan dimasukkan ke dalam file Excel
    const dataLaporan = [
      ['Ringkasan Penjualan Tiket'],
      ['Total View', eventData?.total_views || 0],
      ['Total Bookmarks', 0],
      ['Total Tiket Terjual', eventData?.total_paid || 0],
      ['Total Penjualan', `Rp${eventData?.total_price_sell ? eventData.total_price_sell.toLocaleString('id-ID') : 0}`],
      ['Total Admin Fee', `Rp${eventData?.total_admin_fee ? eventData.total_admin_fee.toLocaleString('id-ID') : 0}`],
      ['Total Tiket', eventData?.total_ticket || 0],
      ['Total Pembelian', eventData?.total_buy || 0],
      ['Total Online', eventData?.total_online || 0],
      ['Total Offline', eventData?.total_offline || 0],
      ['Total Pembayaran Belum Lunas', eventData?.total_unpaid || 0],
      ['Total Penjualan Online', `Rp${eventData?.total_price_sell_online ? eventData.total_price_sell_online.toLocaleString('id-ID') : 0}`],
      ['Total Penjualan Offline', `Rp${eventData?.total_price_sell_offline ? eventData.total_price_sell_offline.toLocaleString('id-ID') : 0}`],
      [
        'Grand Total',
        `Rp${eventData?.total_price_sell && eventData?.total_admin_fee ? 
          (eventData.total_price_sell - eventData.total_admin_fee).toLocaleString('id-ID') : 0}`,
      ],
    ];
  
    // Membuat worksheet dan workbook
    const worksheet = XLSX.utils.aoa_to_sheet(dataLaporan);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');
  
    // Mengunduh file Excel
    XLSX.writeFile(workbook, `Laporan_Penjualan_Event_${eventData.event_name}.xlsx`);
  };
 

  return !loading && data ? (
    <>
    <div>
    <Breadcrumbs className='mb-5 p-5'>
    <BreadcrumbItem onPress={() => router.push('/dashboard/my-event')}>
      Event Saya
    </BreadcrumbItem>
    <BreadcrumbItem>Detail Event</BreadcrumbItem>
    </Breadcrumbs>
    <div className="p-5 flex flex-col md:flex-row lg:flex gap-2">

          <div className='max-w-[300px]'>     
            <EventCardCreator
              key={data.id}
              eventStatus={data.has_event_status.name}
              title={data.name}
              img={data.image_url}
              end={data.end_date}
              date={data.start_date}
              slug={data.slug}
              location={data.location_name}
              price={data.starting_price}
              creatorImg={data.has_creator?.image}
              creator={data.has_creator?.name}
              withoutButton
              shareLink={window.location.origin + '/event/' + data.slug}
            />
          <div className='text-center w-full my-4'>
              <Button
                label='Check-in'
                color='primary'
                className='w-full'
                onClick={() => router.push(`/dashboard/my-event/checkin/${data.slug}`)}
              />
          </div>
          <div className='text-center w-full my-4'>
              <Button
                label='Check-out'
                color='primary'
                className='w-full'
                onClick={() => router.push(`/dashboard/my-event/checkout/${data.slug}`)}
              />
          </div>
          <div className='text-center w-full my-4'>
              <Button
                label='Penjualan'
                color='primary'
                className='w-full'
                onClick={() => router.push(`/dashboard/my-event/sell/${data.slug}`)}
              />
          </div>
          {/* <div className='text-center w-full my-4'>
              <Button
                label='Penjualan'
                color='primary'
                onClick={() => router.push(`/dashboard/my-event/sell/${data.slug}`)}
                className='w-full'
              />
          </div> */}
          </div>
          
          <div className="w-full flex flex-col gap-4 text-dark px-4 md:px-6 lg:px-8">
              <Accordion
                className="border border-primary-light-200 rounded-lg shadow-sm py-0 pr-5">
                <AccordionItem
                  title={(
                  <div className=" flex flex-col md:flex-row justify-between items-start md:items-center px-4">
                    <div className="mb-3 md:mb-0">
                      <p className="text-grey">Dana yang belum di tarik</p>
                      <h6><NumberFormatter value={parseInt(data.transaction_saldo_by_event.total_saldo_event ?? 0) ?? 0} /></h6>
                    </div>
                    <Button 
                      color="primary" 
                      label="Tarik Dana" 
                      className="w-full md:w-auto"
                      onClick={() => setIsModalOpen(true)} 
                    />
                  </div>
                  )}
                >
                  <Stack p={20} pt={0} gap={10}>
                    <Divider />
                    <Text size="sm" fw={600} c="gray">Riwayat Tarik Dana</Text>
                    <WithdrawHistoryList user_id={user?.id ?? 0} setUpdate={updateWithdrawHistory}/>
                  </Stack>
                </AccordionItem>
              </Accordion>
            
            <Accordion
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            className="rounded-lg shadow-sm p-0"
            aria-label="Event Data Accordion"
            >
              <AccordionItem
                key="1"
                title="Statistik Event"
                className="border border-primary-light-200 px-4 rounded-lg"
              >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 [&>div]:!relative [&_p:first-child]:w-full [&>div]:!overflow-hidden">
              {/* Total View */}
              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total View</p>
                  <Icon icon="tabler:users" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">{eventData?.total_views || 0}</p>
              </div>

              {/* Total Bookmarks */}
              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total Bookmarks</p>
                  <Icon icon="meteor-icons:bookmark" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">0</p>
              </div>

              {/* Total Tiket Terjual */}
              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total Tiket Terjual</p>
                  <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">{eventData?.total_paid || 0}</p>
              </div>

              {/* Total Penjualan */}
              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total Penjualan</p>
                  <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">
                  Rp{(eventData?.total_price_sell || 0).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Data Event Lainnya */}
              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total Admin Fee</p>
                  <Icon icon="hugeicons:money-04" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">
                  Rp {(eventData?.total_admin_fee || 0).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total Tiket</p>
                  <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">{eventData?.total_ticket || 0}</p>
              </div>

              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total Pembelian</p>
                  <Icon icon="mingcute:ticket-line" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">{eventData?.total_buy || 0}</p>
              </div>

              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total Online</p>
                  <Icon icon="icon-park-outline:web-page" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">{eventData?.total_online || 0}</p>
              </div>

              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                  <p className="text-grey">Total Offline</p>
                  <Icon icon="hugeicons:cashier" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">{eventData?.total_offline || 0}</p>
              </div>

              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                <p className="text-grey">Total Pembayaran Belum Lunas</p>
                  <Icon icon="hugeicons:money-not-found-03" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">{eventData?.total_unpaid || 0}</p>
              </div>

              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                <p className="text-grey">Total Penjualan Online</p>
                  <Icon icon="hugeicons:money-04" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">
                  Rp{(eventData?.total_price_sell_online || 0).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2">
                <Flex align="center" gap={7}>
                <p className="text-grey">Total Penjualan Offline</p>
                  <Icon icon="hugeicons:money-04" className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />
                </Flex>
                <p className="font-semibold">
                  Rp{(eventData?.total_price_sell_offline || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
              </AccordionItem>
            </Accordion>
            {/* <div className="mx-auto">
              <Bar data={chartData} />
            </div> */}
            <div className="border border-primary-light-200 rounded-lg shadow-sm">
              <Tabs className='flex flex-col' variant="underlined">
                <Tab title="Detail" className="px-2">
                  <Tabs
                    radius="full"
                    color="secondary"
                    classNames={{
                      tabList: "bg-transparent",
                      tab: "data-[selected=true]:text-primary",
                      cursor: "border border-primary-base",
                    }}
                  >
                    <Tab title="Deskripsi" className="px-2">
                      <div dangerouslySetInnerHTML={{ __html: data.description }}></div>
                    </Tab>
                    <Tab title="Syarat & Ketentuan" className="px-2">
                      <div
                        className="ml-5"
                        dangerouslySetInnerHTML={{ __html: data.term_condition }}
                      ></div>
                    </Tab>
                  </Tabs>
                </Tab>
                <Tab title="Tiket">
                  <div className="px-3">
                    {ticket.length > 0 &&
                      ticket.map((el, index) => (
                        <div key={index}>
                          <TicketContainer
                            type={el.ticket_type}
                            category={el.ticket_category}
                            ticketDate={el.ticket_date}
                            ticketEnd={el.ticket_end}
                            price={el.price}
                            description={el.description}
                            name={el.name}
                            // onEdit={() => onEditTicket(el, index)}
                            onDelete={() => deleteTicket(index)}
                          />
                        </div>
                      ))}
                  </div>
                </Tab>
                <Tab title="Transaksi" className="px-2">
                  <div className="bg-primary-light flex flex-col gap-2">
                    <div className="bg-white">
                      <div className="px-5 py-3">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
                          <Input
                            type="text"
                            placeholder="Search by Invoice"
                            value={filterValue}
                            onChange={onSearchChange}
                          />
                          <select
                            onChange={onRowsPerPageChange}
                            value={rowsPerPage}
                            className="border border-light-grey p-2 rounded-md w-full md:w-auto"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </select>
                        </div>

                        {/* Transaction Type Buttons */}
                        <div className="flex gap-4 mb-4 items-center">
                          <Button
                            label="All"
                            onClick={() => setTransactionFilter('all')}
                            color={transactionFilter === 'all' ? 'primary' : 'secondary'}
                            fullWidth
                          />
                          <Button
                            label="Online"
                            onClick={() => setTransactionFilter('online')}
                            color={transactionFilter === 'online' ? 'primary' : 'secondary'}
                            fullWidth
                          />
                          <Button
                            label="Offline"
                            onClick={() => setTransactionFilter('offline')}
                            color={transactionFilter === 'offline' ? 'primary' : 'secondary'}
                            fullWidth
                          />
                          <ButtonM
                            className={`shrink-0`}
                            leftSection={<Icon icon="uiw:download" className={`text-[20px]`} />}
                            variant="transparent"
                            color="#194e9e"
                            onClick={handleDownloadTransaction}>
                            Download  
                          </ButtonM>
                        </div>

                        {/* Single Transaction Table */}
                        <Table
                          aria-label="Invitation Table"
                          isHeaderSticky
                          bottomContentPlacement="outside"
                          classNames={{
                            wrapper: "max-h-[382px]",
                          }}
                          topContentPlacement="outside"
                          bottomContent={
                            <Pagination className="items-center" page={page} total={pages} onChange={setPage} />
                          }
                        >
                          <TableHeader>
                            <TableColumn className='font-bold text-sm'>ID</TableColumn>
                            <TableColumn className='font-bold text-sm'>Email</TableColumn>
                            <TableColumn className='font-bold text-sm'>No.Invoice</TableColumn>
                            <TableColumn className='font-bold text-sm'>Waktu Dikirim</TableColumn>
                            <TableColumn className='font-bold text-sm'>Status</TableColumn>
                            <TableColumn className='font-bold text-sm'>Type</TableColumn>
                            <TableColumn className='font-bold text-sm'>Aksi</TableColumn>
                          </TableHeader>
                          <TableBody items={filteredItems}>
                            {(item) => (
                              <TableRow key={item?.id}>
                                <TableCell className='border-b-1 text-sm'>{item?.id}</TableCell>
                                <TableCell className='border-b-1 text-sm'>{item?.has_user?.email}</TableCell>
                                <TableCell className='border-b-1 text-sm'>{item?.invoice_no}</TableCell>
                                <TableCell className='border-b-1 text-sm'>
                                  {item?.created_at && new Date(item.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </TableCell>
                                <TableCell className='border-b-1'>
                                  <span 
                                    className={`px-2 py-1 rounded-md text-white ${getStatusClass(item.transaction_status_id)}`}
                                  >
                                    {getStatusText(item.transaction_status_id)}
                                  </span>
                                </TableCell>
                                <TableCell className='border-b-1 text-sm'>{item.type_transaction}</TableCell> 
                                <TableCell className='border-b-1'>
                                  <Tooltip label="Kirim Ulang">
                                    <FontAwesomeIcon 
                                      icon={faPaperPlane} 
                                      className="ml-2 cursor-pointer bg-primary-base w-10 text-white rounded-md p-2" 
                                      onClick={() => sendETicket(item.invoice_no, item.has_user.email)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Lihat Detail">
                                    <FontAwesomeIcon 
                                      icon={faEye} 
                                      className="ml-2 cursor-pointer w-10 bg-primary-base text-white rounded-md p-2" 
                                      onClick={() => openDetailModal(item)} 
                                    />
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab title="Invitation" className="px-2">
                  <div className="bg-primary-light flex flex-col gap-2">
                    <div className="bg-white">
                      <div className="px-5 py-3">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
                          <Input
                            type="text"
                            placeholder="Search by Invitation Title"
                            value={invitationFilter} 
                            onChange={onEventSearchChange}
                          />
                          <select
                            onChange={onEventRowsPerPageChange}
                            value={rowsPerPage}
                            className="border border-light-grey p-2 rounded-md w-full md:w-auto"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </select>
                          <Tooltip label="Tambah Invitation Baru">
                            <FontAwesomeIcon 
                              className="ml-2 cursor-pointer w-10 bg-primary-base text-white rounded-md p-2"  
                              onClick={openAddModal} 
                              icon={faPlus} 
                            />
                          </Tooltip>
                        </div>
                        {loading ? (
                          <p>Loading...</p> // Show loading indicator
                        ) : (
                          <Table
                            aria-label="Event Invitation Table"
                            bottomContent={
                              <Pagination className="items-center" page={page} total={eventPages} onChange={setPage} />
                            }
                          >
                            <TableHeader>
                              <TableColumn className='font-bold text-md'>No</TableColumn>
                              <TableColumn className='font-bold text-md'>Judul Undangan</TableColumn>
                              <TableColumn className='font-bold text-md'>Type</TableColumn>
                              <TableColumn className='font-bold text-md'>Qty</TableColumn>
                              {/* <TableColumn className='font-bold text-md'>Deskripsi</TableColumn> */}
                              {/* <TableColumn className='font-bold text-md'>Status Undangan</TableColumn>
                              <TableColumn className='font-bold text-md'>Waktu Dikirim</TableColumn> */}
                              <TableColumn className='font-bold text-md'>Aksi</TableColumn>
                            </TableHeader>
                            <TableBody items={eventItems}>
                              {(item) => (
                                <TableRow key={item?.id}>
                                  <TableCell className='border-b-1'>{_.indexOf(eventItems.map(e => e?.id), item?.id) + 1}</TableCell>
                                  <TableCell className='border-b-1'>{item?.invitation_title}</TableCell>
                                  <TableCell className='border-b-1'>{invitationCategory?.find(e => e.id == item?.invitation_cat_id)?.name ?? '-'}</TableCell>
                                  <TableCell className='border-b-1'>{item?.total_qty}</TableCell>
                                  {/* <TableCell className='border-b-1'>{item?.invitation_description}</TableCell>
                                  <TableCell className='border-b-1'>
                                    <span 
                                      className={`px-2 py-1 rounded-md text-white ${getEventStatusClass(item.invitation_status)}`}
                                    >
                                      {getEventStatusText(item.invitation_status)}
                                    </span>
                                  </TableCell>
                                  <TableCell className='border-b-1'>{item?.created_at && new Date(item.created_at).toString()}</TableCell> */}
                                  <TableCell className='border-b-1'>
                                    <Tooltip label="Kirim Ulang">
                                      <FontAwesomeIcon 
                                        icon={faPaperPlane} 
                                        className="ml-2 cursor-pointer bg-primary-base w-10 text-white rounded-md p-2" 
                                        onClick={() => sendEventETicket(item.invoice_no, item.has_user.email)}
                                      />
                                    </Tooltip>
                                    <Tooltip label="Lihat Detail">
                                      <FontAwesomeIcon 
                                        icon={faEye} 
                                        className="ml-2 cursor-pointer bg-primary-base w-10 text-white rounded-md p-2" 
                                        onClick={() => openInvitationModal(item)} 
                                      />
                                    </Tooltip>
                                    {/* <FontAwesomeIcon 
                                      icon={faPencil} 
                                      className="ml-2 cursor-pointer bg-primary-base w-10 text-white rounded-md p-2" 
                                      onClick={() => openEditModal(item)}
                                    /> */}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </div>
                  </div>
                </Tab>
                <Tab title="Penjualan" className="px-2">
                  <div className="bg-primary-light flex flex-col gap-2">
                    <div className="bg-white">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-3 pb-3 border-b border-b-primary-light-200">
                        <h6>Ringkasan</h6>
                        <p onClick={downloadLaporan} className="text-primary-base font-semibold mt-2 md:mt-0 cursor-pointer">
                          <span>
                            <Tooltip label="download">
                              <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            </Tooltip>
                          </span>
                          Download Laporan
                        </p>
                      </div>
                      <div className="flex flex-col mx-3 gap-3 border-b py-3 border-b-primary-light-200">
                        <div className="flex items-center justify-between">
                          <p className="text-dark-grey">Total Penjualan Tiket Online</p>
                          <p className="font-semibold">Rp{(eventData?.total_price_sell || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-dark-grey">Total Promo</p>
                          <p className="font-semibold">{`(-) Rp0`}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-dark-grey">Biaya Layanan Penjualan Tiket Online</p>
                          <p className="font-semibold">Rp{(eventData?.total_admin_fee || 0).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="flex justify-between px-3 py-4">
                        <p className="text-primary">Total</p>
                        <p className="font-semibold">
                          Rp{((eventData?.total_price_sell || 0) - (eventData?.total_admin_fee || 0)).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
      </div>
    </div>
    <DetailModal item={selectedItem} isOpen={isDetailModalOpen} onClose={closeDetailModal} />
    <AddEventModal eventData={data} isOpen={isAddModalOpen} onClose={closeAddModal} eventId={data.id} />
    <EditEventModal item={selectedEvent} isOpen={isEditModalOpen} onClose={closeEditModal} />
    <TarikDanaModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSubmit={() => setUpdateWithdrawHistory(updateWithdrawHistory + 1)} />
    <InvitationDetailModal invitation={selectedInvitation} isOpen={isInvitationModalOpen} onClose={closeInvitationModal} />
    <ModalCreateTicket
      isOpen={addTicket}
      setIsOpen={showAddTicket}
      ticket={ticket}
      setTicket={setTicket}
      data={editTicket}
      setIdx={setIdxTicket}
      idx={idxTicket}
      eventId={data.id}
      endDate={data.end_date}
    />
    </>
  ) : (
    <Box w="100%" mih={300} h={300}>
      <Center h="100%">
        <Spinner />
      </Center>
    </Box>
  );
};



export default MyEventDetail;
function getReportData(eventId: any) {
  throw new Error('Function not implemented.');
}



