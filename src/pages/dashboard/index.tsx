import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import CreatorTable from '@/components/Dashboard/CreatorTable';
import { formatDateNoCheck, formatDay, formatYear } from '@/utils/useFormattedDate';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import useLoggedUser from '@/utils/useLoggedUser';
import { Get } from '@/utils/REST';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Alert, Box, Card } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';

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

export default function Dashboard() {
  const user = useLoggedUser();
  const router = useRouter();
  const [eventData, setEventData] = useState<EventData[] | null>(null);

  useEffect(() => {
    const userData = Cookies.get('token');
    if (userData === undefined) {
      router.push('/auth');
    }

    if (user && user.has_creator) {
      const creatorId = user.has_creator?.id;

      Get(`event-view-list-by-creator/${creatorId}`, {})
        .then((response) => {
          const eventData = response as EventData[];
          setEventData(eventData); 
          console.log("Fetched event data:", eventData);
        })
        .catch((error) => {
          console.error("Error fetching event data:", error);
        });
    }
  }, [user, router]);

  const now = new Date();

  const calculateTotal = (key: keyof EventData) => {
    if (!eventData || eventData.length === 0) return 0;

    return eventData.reduce((total, event) => total + Number(event[key] || 0), 0);
  };

  const calculateTotalEvents = () => {
    return eventData ? eventData.length : 0;
  };

  return (
    <div className="w-full text-dark">
    
      <div className="flex flex-col gap-2 px-4 py-4 md:px-7 md:py-4 w-full bg-gradient-to-b from-white to-[#f5f5f5]">
        <h1 className='mb-4 text-dark'>Dashboard</h1>
        <Box px={0}>
          {!user?.is_verified && (
            <Alert color="red" icon={<Icon icon="uiw:information-o" />} radius={8} className={`mt-[-10px] mb-[10px]`}>
              Akun Anda belum terverifikasi. <Link className={`text-primary-base hover:underline`} href="/dashboard/legal">Verifikasi Sekarang</Link>
            </Alert>
          )}
        </Box>
        <p className="text-dark-grey mb-1">
          {formatDay(now.toString())} &bull; {formatDateNoCheck(now.toString())},{' '}
          {formatYear(now.toString())}
        </p>
        <h3 className="font-semibold text-xl md:text-2xl capitalize">Halo, {user?.has_creator?.name}</h3>
        <p className="text-sm text-dark-grey">Pantau dan kelola event, lowongan, dan merchandise</p>
      </div>

      <Card>

        <Accordion defaultExpandedKeys={['event']}>
          {/* Event Section */}
          <AccordionItem key="event" title="Event Saya">
            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-primary-light-200 rounded-md divide-x divide-y divide-primary-light-200 my-3">
                <CreatorTable icon="mdi:event-star" title="Event Berjalan" value={calculateTotalEvents()} />
                <CreatorTable icon="mdi:event-edit" title="Event Draf" value={calculateTotal('total_unpaid')} yBorderNone />
                <CreatorTable icon="lucide:users-round" title="Total Pengunjung" value={calculateTotal('total_views')} yBorderNone />
                <CreatorTable icon="hugeicons:invoice" title="Total Transaksi" value={calculateTotal('total_paid')} yBorderNone />
                <CreatorTable icon="heroicons-outline:ticket" title="Total Tiket Terjual" value={calculateTotal('total_ticket')} xBorderNone />
                <CreatorTable icon="mdi:event-multiple-check" title="Total Penjualan" currency value={calculateTotal('total_price_sell')} />
              </div>
            </div>
          </AccordionItem>

          {/* Job Section */}
          <AccordionItem key="lowongan" title="Lowongan">
            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-primary-light-200 rounded-md divide-x divide-y divide-primary-light-200 my-3">
                <CreatorTable icon="material-symbols:list-alt-outline" title="Lowongan yang aktif" value={0} />
                <CreatorTable icon="mynaui:book-user" title="Lowongan Draf" value={0} yBorderNone />
                <CreatorTable icon="lucide:users-round" title="Total Pengunjung" value={0} yBorderNone />
                <CreatorTable icon="hugeicons:wanted" title="Pelamar belum direspon" value={0} yBorderNone />
              </div>
            </div>
          </AccordionItem>

          {/* Merchandise Section */}
          <AccordionItem key="merchandise" title="Merchandise">
            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-primary-light-200 rounded-md divide-x divide-y divide-primary-light-200 my-3">
                <CreatorTable icon="fluent-mdl2:product-variant" title="Sedang dijual" value={0} />
                <CreatorTable icon="fluent-mdl2:product-release" title="Merchandise Draf" value={0} yBorderNone />
                <CreatorTable icon="lucide:users-round" title="Total Pengunjung" value={0} yBorderNone />
                <CreatorTable icon="uil:transaction" title="Total Transaksi Merchandise" value={0} yBorderNone />
                <CreatorTable icon="mage:box-3d-check" title="Total Merchandise Terjual" value={0} xBorderNone />
                <CreatorTable icon="ix:product-management" title="Total Penjualan Merchandise" currency value={0} />
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}
