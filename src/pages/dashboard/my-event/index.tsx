// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import addevent from '../../../assets/images/addevent.png';
// import { Tabs, Tab } from '@nextui-org/react';
// import { EventProps } from '@/utils/globalInterface';
// import EventCard from '@/components/Card/EventCard';
// import EventCardLoading from '@/components/Card/EventCard/loading';
// import { faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
// import useLoggedUser from '@/utils/useLoggedUser';
// import { Get } from '@/utils/REST';
// import InputField from '@/components/Input';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import EventCardCreator from '@/components/Card/EventCard/creator';
// import Button from '@/components/Button';
// import { useRouter } from 'next/router';
// import { Modal } from '@mantine/core';

// const MyEvent = () => {
//   const [data, setData] = useState<EventProps[] | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [status, setStatus] = useState<string>('');
//   const users = useLoggedUser();
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [isMobile, setIsMobile] = useState(false);

//   const getData = async (id: number, status: string) => {
//     try {
//       setLoading(true);
//       const res: any = await Get(`event-by-creator/${id}`, { status });

//       const validStatuses = [1, 2, 3, 4, 5, 0, null];
//       const filteredData = res.data.filter((event: EventProps) =>
//         validStatuses.includes(event.event_status_id) || event.event_status_id === null
//       );

//       setData(filteredData.sort((b: any, a: any) => {
//         return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
//       }));
//       // console.log(res, 'Event Data');
//     } catch (err) {
//       console.log(err);
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (users) {
//       getData(users.has_creator?.id ?? 0, status);
//     }
//   }, [users, status]);

//   const filteredData = data?.filter((event) =>
//   event.name.toLowerCase().includes(searchQuery.toLowerCase())
// );

// useEffect(() => {
//   const handleResize = () => {
//     setIsMobile(window.innerWidth < 768); // Atur breakpoint sesuai kebutuhan
//   };

//   window.addEventListener('resize', handleResize);
//   handleResize(); // Cek ukuran saat komponen pertama kali dimuat

//   return () => {
//     window.removeEventListener('resize', handleResize);
//   };
// }, []);

//   return (
//     <>
//       <div className='p-5'>
//         <h1 className='mb-4 text-dark'>Event Saya</h1>
//         <div className='flex items-center'>
//         <InputField
//             type='text'
//             size='sm'
//             placeholder='Cari Event'
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </div>
//       <Tabs
//         variant='solid'
//         aria-label='Tabs variants'
//         color='secondary'
//         selectedKey={status}
//         onSelectionChange={(key: any) => setStatus(key)}
//         classNames={{
//           tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
//           tab: 'max-w-fit lg:p-5 md:p-5 p-1 ',
//           cursor: 'rounded-b-none border-b-2 border-b-primary-base',
//         }}
//       >
//          <Tab title='Semua Event'>
//           {!loading ? (
//             data && data.length > 0 ? (
//               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5'>
//                 {data.map((event: EventProps) => (
//                   <EventCardCreator
//                     key={event.id}
//                     title={event.name}
//                     eventStatus={event.has_event_status.name}
//                     img={event.image_url}
//                     end={event.end_date}
//                     date={event.start_date}
//                     slug={event.slug}
//                     location={event.location_city}
//                     price={event.starting_price}
//                     creatorImg={event.has_creator?.image}
//                     creator={event.has_creator?.name}
//                     event_status_id={event.event_status_id}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className='border border-primary-light-200 flex flex-col items-center justify-center min-h-[80vh] rounded-md gap-3 text-center text-dark'>
//                 <Image src={addevent} alt='draft' />
//                 <h3 className='text-xl font-semibold'>Belum ada event</h3>
//                 <p className='px-10'>
//                   Mulai buat eventmu dengan klik button “Buat Event” di bawah.
//                 </p>
//                 <Button
//                   color='primary'
//                   startIcon={faPlusCircle}
//                   label='Buat Event'
//                   onClick={() => router.push('/create-event')}
//                   className='mt-3'
//                 />
//               </div>
//             )
//           ) : (
//             <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
//               <EventCardLoading />
//               <EventCardLoading />
//               <EventCardLoading />
//               <EventCardLoading />
//             </div>
//           )}
//         </Tab>
//         <Tab title='Event Aktif'>
//           {!loading ? (
//             data && data.some(event => event.event_status_id === 3) ? (
//               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5'>
//                 {data.filter(event => event.event_status_id === 3).map((event) => (
//                   <EventCardCreator
//                     key={event.id}
//                     eventStatus={event.has_event_status.name}
//                     title={event.name}
//                     img={event.image_url}
//                     end={event.end_date}
//                     date={event.start_date}
//                     slug={event.slug}
//                     location={event.location_city}
//                     price={event.starting_price}
//                     creatorImg={event.has_creator?.image}
//                     creator={event.has_creator?.name}
//                     event_status_id={event.event_status_id}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className='border border-primary-light-200 flex flex-col items-center justify-center min-h-[80vh] rounded-md gap-3 text-center text-dark'>
//                 <Image src={addevent} alt='draft' />
//                 <h3 className='text-xl font-semibold'>Belum ada event yang dibuat</h3>
//                 <p className='px-10'>
//                   Mulai buat eventmu dengan klik button “Buat Event” di bawah.
//                 </p>
//                 <Button
//                   color='primary'
//                   startIcon={faPlusCircle}
//                   label='Buat Event'
//                   onClick={() => router.push('/create-event')}
//                   className='mt-3'
//                 />
//               </div>
//             )
//           ) : (
//             <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
//               <EventCardLoading />
//               <EventCardLoading />
//               <EventCardLoading />
//               <EventCardLoading />
//             </div>
//           )}
//         </Tab>

//         <Tab title='Event Draf'>
//           {!loading ? (
//             data && data.some(event => event.event_status_id === 2) ? (
//               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5'>
//                 {data.filter(event => event.event_status_id === 2).map((event: EventProps) => (
//                   <EventCardCreator
//                     key={event.id}
//                     eventStatus={event.has_event_status.name}
//                     title={event.name}
//                     img={event.image}
//                     end={event.end_date}
//                     date={event.start_date}
//                     slug={event.slug}
//                     location={event.location_city}
//                     price={event.starting_price}
//                     creatorImg={event.has_creator?.image}
//                     creator={event.has_creator?.name}
//                     event_status_id={event.event_status_id}

//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className='border border-primary-light-200 flex flex-col items-center justify-center min-h-[80vh] rounded-md gap-3 text-center text-dark'>
//                 <Image src={addevent} alt='draft' />
//                 <h3 className='text-xl font-semibold'>Belum ada event draf</h3>
//                 <p className='px-10'>
//                   Mulai buat eventmu dengan klik button “Buat Event” di bawah.
//                 </p>
//                 <Button
//                   color='primary'
//                   startIcon={faPlusCircle}
//                   label='Buat Event'
//                   onClick={() => router.push('/create-event')}
//                   className='mt-3'
//                 />
//               </div>
//             )
//           ) : (
//             <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
//               <EventCardLoading />
//               <EventCardLoading />
//               <EventCardLoading />
//               <EventCardLoading />
//             </div>
//           )}
//         </Tab>

//         <Tab title='Event Lalu'>
//           {!loading ? (
//             data && data.some(event => event.event_status_id === 4) ? (
//               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5'>
//                 {data.filter(event => event.event_status_id === 4).map((event: EventProps) => (
//                   <EventCardCreator
//                     key={event.id}
//                     title={event.name}
//                     eventStatus={event.has_event_status.name}
//                     img={event.image}
//                     end={event.end_date}
//                     date={event.start_date}
//                     slug={event.slug}
//                     location={event.location_city}
//                     price={event.starting_price}
//                     creatorImg={event.has_creator?.image}
//                     creator={event.has_creator?.name}
//                     event_status_id={event.event_status_id}

//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className='border border-primary-light-200 flex flex-col items-center justify-center min-h-[80vh] rounded-md gap-3 text-center text-dark'>
//                 <Image src={addevent} alt='draft' />
//                 <h3 className='text-xl font-semibold'>Belum ada event lalu</h3>
//                 <p className='px-10'>
//                   Mulai buat eventmu dengan klik button “Buat Event” di bawah.
//                 </p>
//                 <Button
//                   color='primary'
//                   startIcon={faPlusCircle}
//                   label='Buat Event'
//                   onClick={() => router.push('/create-event')}
//                   className='mt-3'
//                 />
//               </div>
//             )
//           ) : (
//             <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
//               <EventCardLoading />
//               <EventCardLoading />
//               <EventCardLoading />
//               <EventCardLoading />
//             </div>
//           )}
//         </Tab>
//       </Tabs>
//     </>
//   );
// };

// export default MyEvent;

import React, { useState, useEffect } from "react";
import Image from "next/image";
import addevent from "../../../assets/images/addevent.png";
import { Tabs, Tab } from "@nextui-org/react";
import { EventProps } from "@/utils/globalInterface";
import EventCard from "@/components/Card/EventCard";
import EventCardLoading from "@/components/Card/EventCard/loading";
import { faPlusCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import useLoggedUser from "@/utils/useLoggedUser";
import { Get } from "@/utils/REST";
import InputField from "@/components/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EventCardCreator from "@/components/Card/EventCard/creator";
import Button from "@/components/Button";
import { useRouter } from "next/router";
import { Modal } from "@mantine/core";

const MyEvent = () => {
  const [data, setData] = useState<EventProps[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(""); // '' => Semua
  const users = useLoggedUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  const getData = async (id: number, status: string) => {
    try {
      setLoading(true);
      const res: any = await Get(`event-by-creator/${id}`, { status });

      const validStatuses = [1, 2, 3, 4, 5, 0, null];
      const filteredData = (res.data || []).filter((event: EventProps) => validStatuses.includes(event.event_status_id) || event.event_status_id === null);

      // sort newest start_date first
      setData(
        filteredData.sort((b: any, a: any) => {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        })
      );
    } catch (err) {
      console.log(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (users) {
      getData(users.has_creator?.id ?? 0, status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, status]);

  // Helper: return events that match the currently selected status
  const getEventsByActiveTab = (): EventProps[] => {
    if (!data) return [];
    if (status === "" || status === null) return data;
    const statusNum = Number(status);
    // if status is NaN, return all
    if (Number.isNaN(statusNum)) return data;
    return data.filter((e) => e.event_status_id === statusNum);
  };

  // Helper: filter by name only (case-insensitive)
  const getFilteredByName = (): EventProps[] => {
    const list = getEventsByActiveTab();
    if (!searchQuery || searchQuery.trim() === "") return list;
    const q = searchQuery.toLowerCase();
    return list.filter((e) => (e.name || "").toLowerCase().includes(q));
  };

  // For recommendations when search yields no results: take top 4 events from full data
  const getRecommendations = (): EventProps[] => {
    if (!data || data.length === 0) return [];
    return data.slice(0, 4);
  };

  const filteredData = getFilteredByName();
  const recommendations = getRecommendations();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Atur breakpoint sesuai kebutuhan
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Cek ukuran saat komponen pertama kali dimuat

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Small util untuk safe image field
  const eventImage = (event: EventProps) => event.image_url || (event as any).image || "";

  return (
    <>
      <div className="p-5">
        <h1 className="mb-4 text-dark">Event Saya</h1>
        <div className="flex items-center gap-3">
          <InputField
            type="text"
            size="sm"
            placeholder="Cari Event"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // optional: handle enter to blur or something, but not required
          />
          {/* optional search icon button (visual) */}
          <button onClick={() => {}} className="p-2 rounded-md" aria-label="search" title="Cari">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      <Tabs
        variant="solid"
        aria-label="Tabs variants"
        color="secondary"
        selectedKey={status}
        onSelectionChange={(key: any) => setStatus(String(key))}
        classNames={{
          tabList: "pb-0 self-center font-semibold rounded-b-none bg-white",
          tab: "max-w-fit lg:p-5 md:p-5 p-1 ",
          cursor: "rounded-b-none border-b-2 border-b-primary-base",
        }}
      >
        {/* IMPORTANT: give each Tab a key so selection works reliably */}
        <Tab key="" title="Semua Event">
          {!loading ? (
            filteredData && filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5">
                {filteredData.map((event: EventProps) => (
                  <EventCardCreator
                    key={event.id}
                    title={event.name}
                    eventStatus={event.has_event_status?.name}
                    img={eventImage(event)}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator?.image}
                    creator={event.has_creator?.name}
                    event_status_id={event.event_status_id}
                  />
                ))}
              </div>
            ) : (
              // no results for this tab + searchQuery -> show recommendations
              <div className="px-5 my-5">
                {searchQuery && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Tidak ditemukan event untuk {searchQuery}</h3>
                    <p className="text-sm text-muted-foreground">Coba rekomendasi di bawah atau ubah kata kunci pencarian.</p>
                  </div>
                )}

                {!searchQuery || recommendations.length === 0 ? (
                  <div className="border border-primary-light-200 flex flex-col items-center justify-center min-h-[50vh] rounded-md gap-3 text-center text-dark">
                    <Image src={addevent} alt="draft" />
                    <h3 className="text-xl font-semibold">Belum ada event</h3>
                    <p className="px-10">Mulai buat eventmu dengan klik button “Buat Event” di bawah.</p>
                    <Button color="primary" startIcon={faPlusCircle} label="Buat Event" onClick={() => router.push("/dashboard/create-event")} className="mt-3" />
                  </div>
                ) : (
                  <div>
                    <h4 className="mb-4 font-semibold">Rekomendasi Untukmu</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {recommendations.map((event) => (
                        <EventCardCreator
                          key={`rec-${event.id}`}
                          title={event.name}
                          eventStatus={event.has_event_status?.name}
                          img={eventImage(event)}
                          end={event.end_date}
                          date={event.start_date}
                          slug={event.slug}
                          location={event.location_city}
                          price={event.starting_price}
                          creatorImg={event.has_creator?.image}
                          creator={event.has_creator?.name}
                          event_status_id={event.event_status_id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5">
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </div>
          )}
        </Tab>

        <Tab key="3" title="Event Aktif">
          {!loading ? (
            // When user clicks the tab, status will become '3' and getEventsByActiveTab will apply that filter,
            // then filteredData will further apply the searchQuery.
            filteredData && filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5">
                {filteredData.map((event) => (
                  <EventCardCreator
                    key={event.id}
                    eventStatus={event.has_event_status?.name}
                    title={event.name}
                    img={eventImage(event)}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator?.image}
                    creator={event.has_creator?.name}
                    event_status_id={event.event_status_id}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-primary-light-200 flex flex-col items-center justify-center min-h-[50vh] rounded-md gap-3 text-center text-dark px-5">
                <Image src={addevent} alt="draft" />
                <h3 className="text-xl font-semibold">Belum ada event yang dibuat</h3>
                <p className="px-10">Mulai buat eventmu dengan klik button “Buat Event” di bawah.</p>
                <Button color="primary" startIcon={faPlusCircle} label="Buat Event" onClick={() => router.push("/dashboard/create-event")} className="mt-3" />
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5">
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </div>
          )}
        </Tab>

        <Tab key="2" title="Event Draf">
          {!loading ? (
            filteredData && filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5">
                {filteredData.map((event: EventProps) => (
                  <EventCardCreator
                    key={event.id}
                    eventStatus={event.has_event_status?.name}
                    title={event.name}
                    img={eventImage(event)}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator?.image}
                    creator={event.has_creator?.name}
                    event_status_id={event.event_status_id}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-primary-light-200 flex flex-col items-center justify-center min-h-[50vh] rounded-md gap-3 text-center text-dark px-5">
                <Image src={addevent} alt="draft" />
                <h3 className="text-xl font-semibold">Belum ada event draf</h3>
                <p className="px-10">Mulai buat eventmu dengan klik button “Buat Event” di bawah.</p>
                <Button color="primary" startIcon={faPlusCircle} label="Buat Event" onClick={() => router.push("/dashboard/create-event")} className="mt-3" />
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5">
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </div>
          )}
        </Tab>

        <Tab key="4" title="Event Lalu">
          {!loading ? (
            filteredData && filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5">
                {filteredData.map((event: EventProps) => (
                  <EventCardCreator
                    key={event.id}
                    title={event.name}
                    eventStatus={event.has_event_status?.name}
                    img={eventImage(event)}
                    end={event.end_date}
                    date={event.start_date}
                    slug={event.slug}
                    location={event.location_city}
                    price={event.starting_price}
                    creatorImg={event.has_creator?.image}
                    creator={event.has_creator?.name}
                    event_status_id={event.event_status_id}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-primary-light-200 flex flex-col items-center justify-center min-h-[50vh] rounded-md gap-3 text-center text-dark px-5">
                <Image src={addevent} alt="draft" />
                <h3 className="text-xl font-semibold">Belum ada event lalu</h3>
                <p className="px-10">Mulai buat eventmu dengan klik button Buat Event di bawah.</p>
                <Button color="primary" startIcon={faPlusCircle} label="Buat Event" onClick={() => router.push("/dashboard/create-event")} className="mt-3" />
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5">
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
              <EventCardLoading />
            </div>
          )}
        </Tab>
      </Tabs>
    </>
  );
};

export default MyEvent;
