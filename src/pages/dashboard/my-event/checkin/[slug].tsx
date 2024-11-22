import React, { useState, useEffect, useMemo } from 'react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
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
  Pagination,
} from '@nextui-org/react';
import { Get } from '@/utils/REST';
import config from '@/Config';
import axios from 'axios';
import { formatDate, formatYear } from '@/utils/useFormattedDate';
import { useRouter } from 'next/router';
import { EventProps } from '@/utils/globalInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; 
import { Flex } from '@mantine/core';

const DetailEventTicket = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [eventData, setEventData] = useState<EventProps | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 3; 
  const [searchTerm, setSearchTerm] = useState('');
  const [checkinData, setCheckinData] = useState<any>(null);

  const router = useRouter();
  const { slug } = router.query;

  const getData = () => {
    setIsLoading(true);
    Get(`event/${slug}`, {})
      .then((res: any) => {
        setEventData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const handleCheckinClick = () => {
    if (slug) {
      console.log("Button clicked!"); 
      router.push(`/dashboard/scan/${slug}`);
    } else {
      console.error("Slug is undefined");
    }
  };
  

  const fetchTransactions = async () => {
    if (!eventData?.id) return;
  
    try {
      const res = await axios.get(`${config.wsUrl}checkin-list/${eventData.id}`);
      const json = await res.data;
      console.log(res.data, "tets")
  
      if (json.data) {
        setTransactions(Array.isArray(json.data) ? json.data : [json.data]);
      } else {
        console.error('No transactions found in response:', json);
        setTransactions([]);
      }
  
      setGrandTotal(json.grand_total || 0);
    } catch (error) {
      console.log(error);
      setTransactions([]); 
    }
  };

  const fetchCheckinStatistics = async () => {
    if (!slug) return;

    try {
      const res = await axios.get(`${config.wsUrl}checkin-statistik-by-slug/${slug}`);
      console.log(res.data, 'Check-in Statistics');
      if (res.data) {
        setCheckinData(res.data);
      } else {
        console.error('No check-in statistics found in response:', res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  

  useEffect(() => {
    if (slug) {
      getData();
      fetchCheckinStatistics();
    }
  }, [slug]);

  useEffect(() => {
    if (eventData) {
      fetchTransactions();
    }
  }, [eventData]);

  const grandTotall = useMemo(() => {
    return transactions.reduce((acc: number, item: any) => 
      acc + (item.has_transaction ? parseFloat(item.has_transaction.total_price) || 0 : 0), 
    0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => 
      transaction.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const totalPages = filteredTransactions.length > 0 ? Math.ceil(filteredTransactions.length / itemsPerPage) : 1;
  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return !isLoading && eventData ? (
    <>
      <div className='p-5 text-dark'>
        <Breadcrumbs className='mb-5'>
          <BreadcrumbItem onPress={() => router.push('/dashboard/my-event')}>
            Event Saya
          </BreadcrumbItem>
          <BreadcrumbItem>{eventData.name}</BreadcrumbItem>
          <BreadcrumbItem>Check In</BreadcrumbItem>
        </Breadcrumbs>
        <div className='flex justify-between'>
          <div>
            <h3 className='mb-3'>{eventData.name}</h3>
            <p className='text-sm text-grey mb-3'>
              {`${formatDate(eventData.start_date)} ${
                eventData.start_date !== eventData.end_date
                  ? '-' + formatDate(eventData.end_date)
                  : ''
              } ${formatYear(eventData.end_date)}`}
            </p>
            <Flex align="center" gap={8}>
              <Button label="Check In" onClick={() => router.push(`/dashboard/my-event/checkin-eticket/${eventData.slug}`)} color="primary" />
              <Button label="Check In Invitation" onClick={() => router.push(`/dashboard/my-event/checkin-invitation/${eventData.slug}`)} color="primary" />
            </Flex>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
      <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 text-center">
        <p className="text-grey">Total Jumlah Terjual</p>
        <p className="font-semibold">
          {checkinData ? checkinData.total_tickets_sold : 0}
        </p>
      </div>
      <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 text-center">
        <p className="text-grey">Total Tiket Check-in</p>
        <p className="font-semibold">
          {checkinData ? checkinData.total_checkins : 0}
        </p>
      </div>
      <div className="border border-primary-light-200 rounded-lg flex flex-col gap-1 md:gap-3 shadow-sm px-2 md:px-4 py-2 text-center">
        <p className="text-grey">Presentase Penjualan</p>
        <p className="font-semibold">
          {checkinData ? checkinData.checkin_percentage : 0}%
        </p>
      </div>
    </div>
        </div>
        <div className="mt-4 flex items-center border border-primary-light-200 rounded-lg overflow-hidden w-1/4">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-grey ml-2" />
          <input
            type="text"
            placeholder="Cari Nomor Invoice"
            className="border-none p-2 outline-none flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full border  divide-y divide-gray-200 mt-4shadow-md mt-4">
  <thead className="bg-primary">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-300">Nomor Invoice</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-300">Di-Scan Oleh</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-300">Jumlah Tiket</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-300">Tanggal & Waktu Pembelian</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-300">Status</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-300">Jumlah Pembayaran</th>
    </tr>
  </thead>
  <tbody className="bg-white">
    {paginatedTransactions.map((item) => (
      <tr key={item.id}>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-r border-gray-300">{item.invoice_number}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-r border-gray-300">{item.scan_by ? item.scan_by.name : '-'}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-r border-gray-300">{item.has_transaction ? item.has_transaction.total_qty : 0}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-r border-gray-300">
          {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-') : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap border-b border-r border-gray-300">
          <span className={`${item.checkin_status === 'verified' ? 'bg-green-500' : item.checkin_status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'} inline-block rounded-full px-2 py-1 text-white text-xs`}>
            {item.checkin_status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-300">
          {item.has_transaction && item.has_transaction.total_price
            ? parseFloat(item.has_transaction.total_price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
            : 'Rp0'}
        </td>
      </tr>
    ))}
  </tbody>
</table>




</div>



        {/* Pagination */}
        <div className='flex justify-center mt-4'>
          <Pagination
            isCompact
            showControls
            color="primary"
            page={page}
            total={totalPages}
            onChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </>
  ) : (
    <Spinner color='primary' size='lg' className='min-h-screen flex items-center justify-center' />
  );
};

export default DetailEventTicket;
