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

interface PaginationProps {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
}

const Event = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [data, setData] = useState<EventProps[]>([]);
  const [topic, setTopic] = useState<TopicProps[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationProps>({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    next_page_url: null
  });
  
  const ITEMS_PER_PAGE = 12;

  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const router = useRouter();
  const { tag } = router.query;

  const normalize = (v?: any) => (v ? String(v).trim() : "");

  // Function to fetch data with pagination
  const fetchEvents = async (page: number = 1, tagParam?: string, append: boolean = false) => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let endpoint = `event?page=${page}&per_page=${ITEMS_PER_PAGE}`;
      if (tagParam) {
        endpoint += `&tag=${encodeURIComponent(tagParam)}`;
      }

      const res: any = await Get(endpoint, {});
      
      // Handle different response structures
      const newEvents = res?.data || [];
      const paginationData = res?.pagination || {
        current_page: page,
        last_page: 1,
        per_page: ITEMS_PER_PAGE,
        total: newEvents.length,
        next_page_url: null
      };

      // Sort events by start_date (newest first) for ALL pages
      const sortedEvents = [...newEvents].sort((a: any, b: any) => {
        const dateA = new Date(a.start_date).getTime();
        const dateB = new Date(b.start_date).getTime();
        return dateB - dateA; // Descending: newest first
      });

      setData(prev => {
        if (append) {
          // Prevent duplicates when appending
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNewEvents = sortedEvents.filter((item: EventProps) => !existingIds.has(item.id));
          
          // Combine and re-sort all events to maintain newest-first order
          const combined = [...prev, ...uniqueNewEvents];
          return combined.sort((a: any, b: any) => {
            const dateA = new Date(a.start_date).getTime();
            const dateB = new Date(b.start_date).getTime();
            return dateB - dateA;
          });
        } else {
          return sortedEvents;
        }
      });

      setPagination(paginationData);
      
    } catch (err) {
      console.log("Error fetching events:", err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getEventTopic = () => {
    Get("event-topic", {})
      .then((res: any) => {
        setTopic(res || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Load more items when scrolling
  const loadMore = useCallback(() => {
    if (
      !loadingMore && 
      !loading && 
      pagination.next_page_url && 
      !isFetchingRef.current
    ) {
      const nextPage = pagination.current_page + 1;
      fetchEvents(nextPage, activeCategory || undefined, true);
    }
  }, [loadingMore, loading, pagination, activeCategory]);

  // Setup intersection observer
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && pagination.next_page_url) {
          loadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "100px" // Start loading when 100px from bottom
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observerRef.current.observe(currentTarget);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination.next_page_url, loadMore]);

  // Initialize data when router is ready / tag changes
  useEffect(() => {
    if (!router.isReady) return;

    const rawTag = Array.isArray(tag) ? tag[0] : tag;
    const decodedTag = rawTag ? decodeURIComponent(String(rawTag)) : "";

    // Reset state when category changes
    setData([]);
    setPagination({
      current_page: 1,
      last_page: 1,
      per_page: ITEMS_PER_PAGE,
      total: 0,
      next_page_url: null
    });

    if (decodedTag) {
      setActiveCategory(decodedTag);
      fetchEvents(1, decodedTag, false);
    } else {
      setActiveCategory("");
      fetchEvents(1, undefined, false);
    }

    getEventTopic();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, tag]);

  // Filter data by category if needed (for safety, though backend should already filter)
  const filteredData = useMemo(() => {
    if (!activeCategory) return data;
    
    // If backend already filters, just return data
    return data;
  }, [data, activeCategory]);

  // orderedTopics: place activeCategory first
  const orderedTopics = useMemo(() => {
    if (!topic || topic.length === 0) return [];
    if (!activeCategory) return topic;

    const activeIdx = topic.findIndex((t) => 
      normalize(t.name).toLowerCase() === normalize(activeCategory).toLowerCase()
    );

    if (activeIdx <= 0) return topic;

    const copy = [...topic];
    const [activeItem] = copy.splice(activeIdx, 1);
    return [activeItem, ...copy];
  }, [topic, activeCategory]);

  // Handle category change
  const handleCategoryChange = (categoryName: string) => {
    setActiveCategory(categoryName);
    setData([]); // Clear existing data
    
    const encoded = encodeURIComponent(categoryName);
    router.replace(
      {
        pathname: "/event",
        query: { tag: encoded },
      },
      undefined,
      { shallow: true }
    );
    
    fetchEvents(1, categoryName, false);
  };

  // Clear filter
  const handleClearFilter = () => {
    setActiveCategory("");
    setData([]);
    router.replace(
      {
        pathname: "/event",
      },
      undefined,
      { shallow: true }
    );
    fetchEvents(1, undefined, false);
  };

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
                  onClick={() => handleCategoryChange(item.name)}
                  className={`cursor-pointer flex rounded-2xl items-center justify-center py-1 px-3 border ${
                    normalize(activeCategory).toLowerCase() !== normalize(item.name).toLowerCase() 
                      ? "text-dark-grey border-primary-light-200" 
                      : "text-primary-dark border-primary-dark"
                  }`}
                >
                  <p className="whitespace-nowrap">{item.name}</p>
                </div>
              ))}
              
              {/* Optional: Clear filter button */}
              {activeCategory && (
                <div
                  onClick={handleClearFilter}
                  className="cursor-pointer flex rounded-2xl items-center justify-center py-1 px-3 border text-red-500 border-red-300 hover:bg-red-50"
                >
                  <p className="whitespace-nowrap">Clear Filter ✕</p>
                </div>
              )}
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
                  
                  {/* Loading skeletons when loading more */}
                  {loadingMore && (
                    <>
                      <EventCardLoading />
                      <EventCardLoading />
                      <EventCardLoading />
                      <EventCardLoading />
                    </>
                  )}
                  
                  {/* Observer target for infinite scroll */}
                  {pagination.next_page_url && (
                    <div 
                      ref={observerTarget} 
                      className="col-span-full h-20 flex items-center justify-center"
                    >
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