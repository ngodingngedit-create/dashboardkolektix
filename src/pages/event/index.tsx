// import React from "react";
// import EventCard from "@/components/Card/EventCard";
// import { EventProps } from "@/utils/globalInterface";
// import { Get } from "@/utils/REST";
// import { useEffect, useState } from "react";
// import { Breadcrumbs, BreadcrumbItem, ScrollShadow } from "@nextui-org/react";
// import EventCardLoading from "@/components/Card/EventCard/loading";
// import Chat from "@/components/chat";
// import { useRouter } from "next/router";

// interface TopicProps {
//   id: number;
//   name: string;
//   description: string;
//   status: string;
//   created_by: string | null;
//   updated_by: string | null;
//   created_at: string;
//   updated_at: string | null;
//   deleted_at: string | null;
// }

// const Event = () => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [data, setData] = useState<EventProps[]>([]);
//   const [topic, setTopic] = useState<TopicProps[]>([]);
//   const [activeCategory, setActiveCategory] = useState<string>("");

//   // const getData = () => {
//   //   setLoading(true);
//   //   Get('event', {})
//   //     .then((res: any) => {
//   //       setData(res.data.sort((b: any, a: any) => {
//   //         return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
//   //     }));
//   //       console.log("masuk", res);
//   //       setLoading(false);
//   //     })
//   //     .catch((err) => {
//   //       console.log(err);
//   //       setLoading(false);
//   //     });
//   // };

//   const router = useRouter();
//   const { tag } = router.query;

//   const getData = () => {
//     setLoading(true);

//     Get(`event?tag=${tag}`, {})
//       .then((res: any) => {
//         setData(
//           res.data.sort((b: any, a: any) => {
//             return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
//           })
//         );
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.log(err);
//         setLoading(false);
//       });
//   };

//   const getEventTopic = () => {
//     setLoading(true);
//     Get("event-topic", {})
//       .then((res: any) => {
//         setTopic(res);
//         console.log(res);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.log(err);
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     getEventTopic();
//     getData();
//   }, [tag]);

//   const filteredData = activeCategory ? data.filter((event) => event.has_event_topic?.name === activeCategory) : data;

//   return (
//     <>
//       <Chat />
//       <div className="text-dark max-w-6xl mx-auto min-h-screen py-10 md:pt-24">
//         {/* <div className='pl-4'>
//           <Breadcrumbs>
//             <BreadcrumbItem>Beranda</BreadcrumbItem>
//             <BreadcrumbItem>List Event</BreadcrumbItem>
//           </Breadcrumbs>
//         </div> */}
//         {!loading ? (
//           <>
//             <ScrollShadow orientation="horizontal" className="max-w-full flex gap-2 px-4 pb-3 mt-0">
//               {topic.map((item) => (
//                 <div
//                   key={item.id}
//                   onClick={() => setActiveCategory(item.name)}
//                   className={`cursor-pointer flex rounded-2xl items-center justify-center py-1 px-3 border ${activeCategory !== item.name ? "text-dark-grey border-primary-light-200" : "text-primary-dark border-primary-dark"}`}
//                 >
//                   <p className="whitespace-nowrap">{item.name}</p>
//                 </div>
//               ))}
//             </ScrollShadow>
//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 px-[20px] content-center justify-items-center gap-y-10 gap-x-5 my-5">
//               {filteredData.length > 0 ? (
//                 filteredData.map((event: any) => (
//                   <EventCard
//                     id={event.id}
//                     key={event.id}
//                     title={event.name}
//                     img={event.image_url}
//                     end={event.end_date}
//                     date={event.start_date}
//                     slug={event.slug}
//                     location={event.location_city}
//                     price={event.starting_price}
//                     creatorImg={event.has_creator?.image}
//                     creator={event.has_creator?.name}
//                     creatorSlug={event.has_creator?.slug}
//                     start_date={event.start_date}
//                     start_time={event.start_time}
//                     end_date={event.end_date}
//                     end_time={event.end_time}
//                   />
//                 ))
//               ) : (
//                 <p className="text-center col-span-full">No events available for the selected category.</p>
//               )}
//             </div>
//           </>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5">
//             <EventCardLoading />
//             <EventCardLoading />
//             <EventCardLoading />
//             <EventCardLoading />
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Event;

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import EventCard from "@/components/Card/EventCard";
import { EventProps } from "@/utils/globalInterface";
import { Get } from "@/utils/REST";
import { Breadcrumbs, BreadcrumbItem, ScrollShadow } from "@nextui-org/react";
import EventCardLoading from "@/components/Card/EventCard/loading";
import Chat from "@/components/chat";
import { useRouter } from "next/router";

interface TopicProps {
  id: number;
  name: string;
  description: string;
  status: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

const Event = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [data, setData] = useState<EventProps[]>([]);
  const [topic, setTopic] = useState<TopicProps[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const ITEMS_PER_PAGE = 12;

  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { tag } = router.query;

  const normalize = (v?: any) => (v ? String(v).trim() : "");

  // Function to get all data (without pagination from backend)
  const getAllData = (tagParam?: string) => {
    setLoading(true);
    
    const endpoint = tagParam ? `event?tag=${encodeURIComponent(tagParam)}` : "event";

    Get(endpoint, {})
      .then((res: any) => {
        const allEvents = res?.data || res || [];
        // Sort by date (newest first)
        const sortedEvents = allEvents.sort((b: any, a: any) => {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });
        setData(sortedEvents);
        setCurrentPage(1);
        setHasMore(sortedEvents.length > ITEMS_PER_PAGE);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  // Get paginated data from the already loaded data
  const getPaginatedData = () => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  // Load more items
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      // Simulate loading delay
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        const totalLoaded = (currentPage + 1) * ITEMS_PER_PAGE;
        setHasMore(totalLoaded < data.length);
        setLoadingMore(false);
      }, 300);
    }
  }, [loadingMore, hasMore, currentPage, data.length]);

  const getEventTopic = () => {
    Get("event-topic", {})
      .then((res: any) => {
        setTopic(res || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.5, rootMargin: "50px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [observerTarget, hasMore, loadingMore, loadMore]);

  // Initialize data when router is ready / tag changes
  useEffect(() => {
    if (!router.isReady) return;

    const rawTag = Array.isArray(tag) ? tag[0] : tag;
    const decodedTag = rawTag ? decodeURIComponent(String(rawTag)) : "";

    if (decodedTag) {
      setActiveCategory(decodedTag);
    } else {
      setActiveCategory("");
    }

    getEventTopic();
    getAllData(decodedTag);
    // Reset to page 1 when category changes
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, tag]);

  // Get current page data
  const currentData = useMemo(() => {
    return getPaginatedData();
  }, [data, currentPage]);

  // Filter data by category if needed
  const filteredData = useMemo(() => {
    if (!activeCategory) return currentData;
    
    return currentData.filter((event) => 
      event.has_event_topic && 
      normalize(event.has_event_topic.name).toLowerCase() === normalize(activeCategory).toLowerCase()
    );
  }, [currentData, activeCategory]);

  // orderedTopics: place activeCategory first (if exists) but keep original order otherwise
  const orderedTopics = useMemo(() => {
    if (!topic || topic.length === 0) return [];
    if (!activeCategory) return topic;

    const activeIdx = topic.findIndex((t) => normalize(t.name).toLowerCase() === normalize(activeCategory).toLowerCase());

    if (activeIdx <= 0) return topic; // already first or not found

    const copy = [...topic];
    const [activeItem] = copy.splice(activeIdx, 1); // remove the matched item
    return [activeItem, ...copy];
  }, [topic, activeCategory]);

  return (
    <>
      <Chat />
      <div className="text-dark max-w-6xl mx-auto min-h-screen py-10 md:pt-24">
        {!loading ? (
          <>
            <ScrollShadow orientation="horizontal" className="max-w-full flex gap-2 px-4 pb-3 mt-0">
              {orderedTopics.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveCategory(item.name);
                    const encoded = encodeURIComponent(item.name);
                    router.replace(
                      {
                        pathname: "/event",
                        query: { tag: encoded },
                      },
                      undefined,
                      { shallow: true }
                    );
                    getAllData(item.name);
                    setCurrentPage(1);
                  }}
                  className={`cursor-pointer flex rounded-2xl items-center justify-center py-1 px-3 border ${
                    normalize(activeCategory).toLowerCase() !== normalize(item.name).toLowerCase() ? "text-dark-grey border-primary-light-200" : "text-primary-dark border-primary-dark"
                  }`}
                >
                  <p className="whitespace-nowrap">{item.name}</p>
                </div>
              ))}
            </ScrollShadow>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 px-[20px] content-center justify-items-center gap-y-10 gap-x-5 my-5">
              {filteredData.length > 0 ? (
                <>
                  {filteredData.map((event: any) => (
                    <EventCard
                      id={event.id}
                      key={`${event.id}-${event.created_at}`}
                      title={event.name}
                      img={event.image_url}
                      end={event.end_date}
                      date={event.start_date}
                      slug={event.slug}
                      location={event.location_city}
                      price={event.starting_price}
                      creatorImg={event.has_creator?.image}
                      creator={event.has_creator?.name}
                      creatorSlug={event.has_creator?.slug}
                      start_date={event.start_date}
                      start_time={event.start_time}
                      end_date={event.end_date}
                      end_time={event.end_time}
                      verified={event.has_creator?.is_verified}
                    />
                  ))}
                  
                  {/* Loading indicator at the bottom */}
                  {loadingMore && (
                    <>
                      <EventCardLoading />
                      <EventCardLoading />
                      <EventCardLoading />
                      <EventCardLoading />
                    </>
                  )}
                  
                  {/* Observer target for infinite scroll */}
                  {hasMore && (
                    <div ref={observerTarget} className="col-span-full h-20 flex items-center justify-center">
                      {loadingMore ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
                          <p className="text-gray-500 mt-2">Memuat event...</p>
                        </div>
                      ) : (
                        <p className="text-gray-500">Scroll untuk melihat lebih banyak</p>
                      )}
                    </div>
                  )}
                  
                  {/* Show message when no more data */}
                  {!hasMore && filteredData.length > 0 && (
                    <div className="col-span-full h-10 flex items-center justify-center">
                      <p className="text-gray-500">Tidak ada event lainnya</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">Tidak ada event tersedia untuk kategori ini.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5">
            <EventCardLoading />
            <EventCardLoading />
            <EventCardLoading />
            <EventCardLoading />
          </div>
        )}
      </div>
    </>
  );
};

export default Event;