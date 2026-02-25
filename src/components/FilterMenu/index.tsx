// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Menu, MenuButton, MenuItem, Transition, MenuItems } from "@headlessui/react";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";

// const Data = [
//   {
//     id: 1,
//     title: "Lokasi",
//     subtitle: "Pilih Lokasi",
//     items: [
//       { id: 1, name: "Jakarta" },
//       { id: 2, name: "Bandung" },
//       { id: 3, name: "Yogyakarta" },
//       { id: 4, name: "Semarang" },
//       { id: 5, name: "Solo" },
//       { id: 6, name: "Bali" },
//       { id: 7, name: "Medan" },
//     ],
//   },
//   {
//     id: 2,
//     title: "Kategori",
//     subtitle: "Pilih Kategori",
//     items: [
//       { id: 1, name: "Musik" },
//       { id: 2, name: "Olahraga" },
//       { id: 3, name: "Seminar" },
//       { id: 4, name: "Pendidikan" },
//       { id: 5, name: "Game" },
//       { id: 6, name: "Teknologi" },
//       { id: 7, name: "Wisata" },
//       { id: 8, name: "Seni" },
//     ],
//   },
//   {
//     id: 3,
//     title: "Waktu",
//     subtitle: "Pilih Waktu",
//     items: [
//       { id: 1, name: "Minggu Ini" },
//       { id: 2, name: "Minggu Depan" },
//       { id: 3, name: "Bulan Ini" },
//       { id: 4, name: "Bulan Depan" },
//     ],
//   },
//   {
//     id: 4,
//     title: "Harga",
//     subtitle: "Pilih Harga",
//     items: [
//       { id: 1, name: "Semua Harga" },
//       { id: 2, name: "Berbayar" },
//       { id: 3, name: "Gratis" },
//     ],
//   },
//   {
//     id: 7,
//     title: "Tipe",
//     subtitle: "Pilih Tipe",
//     items: [
//       { id: 1, name: "Offline" },
//       { id: 2, name: "Online" },
//     ],
//   },
// ];

// const FilterMenu = () => {
//   return (
//     <div className="fixed w-full bg-gradient-to-b from-primary-dark to-primary-darker drop-shadow-2xl z-50">
//       <div className="flex justify-center items-center py-3 px-4">
//         <div className="bg-[#02255A] rounded-full w-full max-w-screen-lg px-4 py-2 flex items-center gap-3">
//           {/* {Data.map((el: any, idx: number) => (
//             <Menu key={el.id}>
//               <MenuButton className='rounded-full px-4 py-2 text-sm font-medium text-white flex flex-col justify-center mx-auto hover:text-primary-base hover:bg-white h-full w-36'>
//                 <p className='text-xs'>{el.title}</p>
//                 <p className='font-extralight'>{el.subtitle}</p>
//               </MenuButton>
//               <Transition
//                 enter='transition ease-out duration-75'
//                 enterFrom='opacity-0 scale-95'
//                 enterTo='opacity-100 scale-100'
//                 leave='transition ease-in duration-100'
//                 leaveFrom='opacity-100 scale-100'
//                 leaveTo='opacity-0 scale-95'
//               >
//                 <MenuItems
//                   anchor='bottom end'
//                   className='w-52 z-50 origin-top-right rounded-xl border border-white/5 bg-white p-1 text-sm/6 text-dark [--anchor-gap:var(--spacing-1)] focus:outline-none'
//                 >
//                   {el.items.map((item: any) => (
//                     <MenuItem key={item.id}>
//                       <button className='group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10 '>
//                         {item.name}
//                       </button>
//                     </MenuItem>
//                   ))}
//                 </MenuItems>
//               </Transition>
//             </Menu>
//           ))} */}

//           {/* input search bar */}
//           <div className="flex items-center gap-2 bg-primary-base/20 rounded-full px-4 py-2 flex-1">
//             <FontAwesomeIcon icon={faSearch} className="text-white opacity-80" />
//             <input type="text" placeholder="Cari sesuatu..." className="bg-primary-800 outline-none text-white placeholder-white/60 w-full rounded-full" />
//           </div>

//           <div className="">
//             <button className="bg-primary-base rounded-full w-16 h-16">
//               <FontAwesomeIcon icon={faSearch} className="text-white" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FilterMenu;

// "use client";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Menu, MenuButton, MenuItem, Transition, MenuItems } from "@headlessui/react";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// const Data = [
//   {
//     id: 1,
//     title: "Lokasi",
//     subtitle: "Pilih Lokasi",
//     items: [
//       { id: 1, name: "Jakarta" },
//       { id: 2, name: "Bandung" },
//       { id: 3, name: "Yogyakarta" },
//       { id: 4, name: "Semarang" },
//       { id: 5, name: "Solo" },
//       { id: 6, name: "Bali" },
//       { id: 7, name: "Medan" },
//     ],
//   },
//   {
//     id: 2,
//     title: "Kategori",
//     subtitle: "Pilih Kategori",
//     items: [
//       { id: 1, name: "Musik" },
//       { id: 2, name: "Olahraga" },
//       { id: 3, name: "Seminar" },
//       { id: 4, name: "Pendidikan" },
//       { id: 5, name: "Game" },
//       { id: 6, name: "Teknologi" },
//       { id: 7, name: "Wisata" },
//       { id: 8, name: "Seni" },
//     ],
//   },
//   {
//     id: 3,
//     title: "Waktu",
//     subtitle: "Pilih Waktu",
//     items: [
//       { id: 1, name: "Minggu Ini" },
//       { id: 2, name: "Minggu Depan" },
//       { id: 3, name: "Bulan Ini" },
//       { id: 4, name: "Bulan Depan" },
//     ],
//   },
//   {
//     id: 4,
//     title: "Harga",
//     subtitle: "Pilih Harga",
//     items: [
//       { id: 1, name: "Semua Harga" },
//       { id: 2, name: "Berbayar" },
//       { id: 3, name: "Gratis" },
//     ],
//   },
//   {
//     id: 7,
//     title: "Tipe",
//     subtitle: "Pilih Tipe",
//     items: [
//       { id: 1, name: "Offline" },
//       { id: 2, name: "Online" },
//     ],
//   },
// ];

// const FilterMenu = () => {
//   const router = useRouter();
//   const [query, setQuery] = useState("");
//   const [showSuggest, setShowSuggest] = useState(false);

//   const pages = [
//     { name: "Event", path: "/event" },
//     { name: "Merchandise", path: "/merchandise" },
//   ];

//   const filtered = pages.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

//   const handleSubmit = (e?: React.FormEvent) => {
//     e?.preventDefault();
//     const match = pages.find((item) => item.name.toLowerCase() === query.toLowerCase());
//     if (match) {
//       router.push(match.path);
//       setShowSuggest(false);
//     } else if (filtered.length > 0) {
//       router.push(filtered[0].path);
//       setShowSuggest(false);
//     }
//   };

//   return (
//     <div className="fixed w-full bg-gradient-to-b from-primary-dark to-primary-darker drop-shadow-2xl z-50">
//       <div className="flex justify-center items-center py-3 px-4">
//         <div className="bg-[#02255A] rounded-full w-full max-w-screen-lg px-4 py-2 flex items-center gap-3 relative">
//           {/* Search input */}
//           <form onSubmit={handleSubmit} className="flex-1 relative">
//             <div className="flex items-center gap-2 bg-primary-base/20 rounded-full px-4 py-2 flex-1">
//               <FontAwesomeIcon icon={faSearch} className="text-white opacity-80" />
//               <input
//                 type="text"
//                 placeholder="Cari sesuatu..."
//                 value={query}
//                 onChange={(e) => {
//                   setQuery(e.target.value);
//                   setShowSuggest(e.target.value.length > 0);
//                 }}
//                 className="bg-primary-800 outline-none text-white placeholder-white/60 w-full rounded-full"
//               />
//             </div>

//             {/* Dropdown suggestion */}
//             {showSuggest && filtered.length > 0 && (
//               <ul className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg overflow-hidden">
//                 {filtered.map((item) => (
//                   <li
//                     key={item.path}
//                     onClick={() => {
//                       router.push(item.path);
//                       setShowSuggest(false);
//                     }}
//                     className="px-4 py-2 text-gray-800 hover:bg-primary-base hover:text-white cursor-pointer"
//                   >
//                     {item.name}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </form>

//           {/* Search button */}
//           <div>
//             <button onClick={handleSubmit} className="bg-primary-base rounded-full w-16 h-16 flex items-center justify-center">
//               <FontAwesomeIcon icon={faSearch} className="text-white" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FilterMenu;

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Get } from "@/utils/REST";

const pages = [
  { name: "Event", path: "/event" },
  { name: "Merchandise", path: "/merchandise" },
];

const FilterMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [merchandise, setMerchandise] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingMerch, setLoadingMerch] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // 1) placeholder logic dengan merchandise
  const placeholder = useMemo(() => {
    if (!pathname) return "Cari sesuatu...";
    const p = pathname.toLowerCase();
    if (p === "/") return "Cari Event...";
    if (p.startsWith("/event")) return "Cari Event...";
    if (p.startsWith("/merchandise")) return "Cari Merchandise...";
    return "Cari sesuatu...";
  }, [pathname]);

  // 2) fetch events sekali
  useEffect(() => {
    setLoadingEvents(true);
    Get("event", {})
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data ?? res?.data?.data ?? [];
        const normalized = (list || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          type: "event",
        }));
        setEvents(normalized);
      })
      .catch((err) => {
        console.error("Failed to fetch events for search:", err);
        setEvents([]);
      })
      .finally(() => {
        setLoadingEvents(false);
      });
  }, []);

  // 3) fetch SEMUA merchandise data dengan looping semua pages
  const fetchAllMerchandise = useCallback(async () => {
    if (merchandise.length > 0 || loadingMerch) return;
    
    setLoadingMerch(true);
    try {
      let allProducts: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      
      while (currentPage <= totalPages) {
        try {
          const res = (await Get("product", {
            page: currentPage,
            limit: 100,
          })) as any;

          let pageData: any[] = [];
          let pageTotal = 0;
          let pageLastPage = 1;
          
          if (Array.isArray(res)) {
            pageData = res;
          } else if (Array.isArray(res.data)) {
            pageData = res.data;
            pageTotal = res.total || res.data.length;
            pageLastPage = res.last_page || Math.ceil(pageTotal / 100);
          } else if (res.data && Array.isArray(res.data.data)) {
            pageData = res.data.data;
            pageTotal = res.data.total || res.data.data.length;
            pageLastPage = res.data.last_page || Math.ceil(pageTotal / 100);
          } else if (res.meta && Array.isArray(res.data)) {
            pageData = res.data;
            pageTotal = res.meta.total || res.data.length;
            pageLastPage = res.meta.last_page || Math.ceil(pageTotal / 100);
          }

          if (currentPage === 1 && pageLastPage > 1) {
            totalPages = pageLastPage;
          }

          const availableProducts = pageData.filter((item: any) => {
            const statusId = item.product_status_id || item.status_id;
            return statusId == 2 || statusId === "2";
          });

          allProducts = [...allProducts, ...availableProducts];

          if (pageData.length === 0) {
            break;
          }

          currentPage++;

          if (currentPage <= totalPages) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }

        } catch (pageError) {
          console.error(`Error fetching page ${currentPage}:`, pageError);
          break;
        }
      }

      const normalized = allProducts.map((item: any) => ({
        id: item.id,
        name: item.product_name || item.name || item.title || "Untitled Product",
        slug: item.slug || `product-${item.id}`,
        type: "merchandise",
      }));

      setMerchandise(normalized);

    } catch (err) {
      console.error("Error in main fetch process:", err);
      
      try {
        const fallbackRes = (await Get("product", {
          limit: 1000,
          page: 1
        })) as any;

        let fallbackData: any[] = [];
        
        if (Array.isArray(fallbackRes)) {
          fallbackData = fallbackRes;
        } else if (Array.isArray(fallbackRes.data)) {
          fallbackData = fallbackRes.data;
        } else if (fallbackRes.data && Array.isArray(fallbackRes.data.data)) {
          fallbackData = fallbackRes.data.data;
        }

        const availableData = fallbackData.filter((item: any) => {
          const statusId = item.product_status_id || item.status_id;
          return statusId == 2 || statusId === "2";
        });

        const normalized = availableData.map((item: any) => ({
          id: item.id,
          name: item.product_name || item.name || item.title,
          slug: item.slug || `product-${item.id}`,
          type: "merchandise",
        }));

        setMerchandise(normalized);
        
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
        setMerchandise([]);
      }
    } finally {
      setLoadingMerch(false);
    }
  }, [loadingMerch, merchandise.length]);

  useEffect(() => {
    fetchAllMerchandise();
  }, [fetchAllMerchandise]);

  // 4) suggestions berdasarkan halaman aktif
  const eventMatches = useMemo(() => {
    if (!query || pathname?.toLowerCase().startsWith("/merchandise")) return [];
    const q = query.toLowerCase().trim();
    return events.filter((e) => e.name?.toLowerCase().includes(q));
  }, [events, query, pathname]);

  const merchandiseMatches = useMemo(() => {
    if (!query || !pathname?.toLowerCase().startsWith("/merchandise")) return [];
    const q = query.toLowerCase().trim();
    
    return merchandise.filter((m) => {
      const productName = m.name?.toLowerCase() || "";
      return productName.includes(q);
    });
  }, [merchandise, query, pathname]);

  const pageMatches = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return pages.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  // 5) final suggestion list sesuai halaman
  const suggestions = useMemo(() => {
    const isMerchandisePage = pathname?.toLowerCase().startsWith("/merchandise");
    
    if (isMerchandisePage) {
      return [
        ...merchandiseMatches.slice(0, 10),
        ...pageMatches.slice(0, 2)
      ];
    } else {
      return [
        ...eventMatches.slice(0, 10),
        ...pageMatches.slice(0, 2)
      ];
    }
  }, [eventMatches, merchandiseMatches, pageMatches, pathname]);

  // 6) close suggestions on route change
  useEffect(() => {
    setShowSuggest(false);
    setQuery("");
    inputRef.current?.blur();
  }, [pathname]);

  // 7) click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 8) keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggest || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSubmit();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = activeIndex >= 0 ? activeIndex : 0;
      const chosen = suggestions[idx];
      if (chosen) {
        onChooseSuggestion(chosen);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowSuggest(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  // 9) choose suggestion handler
  const onChooseSuggestion = (item: any) => {
    setShowSuggest(false);
    setActiveIndex(-1);
    inputRef.current?.blur();

    if (item.slug) {
      if (item.type === "merchandise") {
        router.push(`/merchandise/${encodeURIComponent(item.slug)}`);
      } else {
        router.push(`/event/${encodeURIComponent(item.slug)}`);
      }
      return;
    }

    if (item.path) {
      router.push(item.path);
      return;
    }
  };

  // 10) submit handler
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    const isMerchandisePage = pathname?.toLowerCase().startsWith("/merchandise");

    if (isMerchandisePage) {
      const exactMerch = merchandise.find((m) => 
        m.name.toLowerCase() === q.toLowerCase()
      );
      
      if (exactMerch) {
        router.push(`/merchandise/${encodeURIComponent(exactMerch.slug)}`);
        setShowSuggest(false);
        return;
      }

      if (merchandiseMatches.length > 0) {
        router.push(`/merchandise/${encodeURIComponent(merchandiseMatches[0].slug)}`);
        setShowSuggest(false);
        return;
      }

      router.push(`/merchandise?search=${encodeURIComponent(q)}`);
    } else {
      const exactEvent = events.find((ev) => 
        ev.name.toLowerCase() === q.toLowerCase()
      );
      
      if (exactEvent) {
        router.push(`/event/${encodeURIComponent(exactEvent.slug)}`);
        setShowSuggest(false);
        return;
      }

      const exactPage = pages.find((p) => 
        p.name.toLowerCase() === q.toLowerCase()
      );
      
      if (exactPage) {
        router.push(exactPage.path);
        setShowSuggest(false);
        return;
      }

      if (eventMatches.length > 0) {
        router.push(`/event/${encodeURIComponent(eventMatches[0].slug)}`);
        setShowSuggest(false);
        return;
      }

      router.push(`/event?tag=${encodeURIComponent(q)}`);
    }

    setShowSuggest(false);
  };

  return (
    <div className="fixed w-full bg-gradient-to-b from-primary-dark to-primary-darker drop-shadow-2xl z-50">
      <div className="flex justify-center items-center py-2 md:py-3 px-3 md:px-4">
        <div ref={containerRef} className="bg-[#02255A] rounded-full w-full max-w-screen-lg px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 md:gap-3 relative">
          {/* Search form */}
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <div className="flex items-center gap-2 bg-primary-base/20 rounded-full px-3 md:px-4 py-1.5 md:py-2 flex-1">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="text-white opacity-80 text-sm md:text-base" 
              />
              <input
                id="search-filter-input"
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                tabIndex={0}
                onFocus={() => {
                  if (query.length > 0) {
                    setShowSuggest(true);
                  }
                }}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggest(e.target.value.length > 0);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                aria-label="Search"
                className="bg-primary-800 outline-none text-white placeholder-white/60 w-full rounded-full text-sm md:text-base"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Loading indicator */}
            {(loadingMerch || loadingEvents) && showSuggest && (
              <div className="absolute z-50 mt-1 md:mt-2 w-full bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-4">
                <div className="flex items-center justify-center text-gray-600 text-sm md:text-base">
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-primary-base mr-2"></div>
                  <span>Memuat...</span>
                </div>
              </div>
            )}

            {/* suggestions dropdown */}
            {showSuggest && !loadingMerch && !loadingEvents && suggestions.length > 0 && (
              <>
                {/* Backdrop for mobile */}
                <div 
                  className="fixed inset-0 bg-black/30 z-40 md:hidden"
                  onClick={() => {
                    setShowSuggest(false);
                    setActiveIndex(-1);
                  }}
                />
                
                <ul 
                  ref={listRef} 
                  className="absolute z-50 mt-1 md:mt-2 w-full bg-white rounded-lg md:rounded-xl shadow-lg overflow-hidden max-h-[60vh] md:max-h-80 overflow-y-auto"
                  style={{
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: 'calc(100vh - 120px)'
                  }}
                >
                  {suggestions.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    let itemType = "Page";
                    let displayName = item.name;
                    let badgeColor = "bg-gray-100 text-gray-800";

                    if (item.type === "event") {
                      itemType = "Event";
                      badgeColor = "bg-blue-100 text-blue-800";
                    } else if (item.type === "merchandise") {
                      itemType = "Merchandise";
                      badgeColor = "bg-green-100 text-green-800";
                    }

                    return (
                      <li
                        key={`${item.type}-${item.id || item.path}-${idx}`}
                        onMouseDown={(ev) => {
                          ev.preventDefault();
                          onChooseSuggestion(item);
                        }}
                        className={`px-3 md:px-4 py-2.5 md:py-3 text-gray-800 hover:bg-primary-base hover:text-white cursor-pointer flex justify-between items-center transition-colors ${isActive ? "bg-primary-base text-white" : ""}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm md:text-base">{displayName}</div>
                          {item.type === "merchandise" && (
                            <div className="text-xs text-gray-500 truncate mt-0.5 hidden md:block">
                              Merchandise
                            </div>
                          )}
                        </div>
                        <small className={`opacity-90 text-xs px-2 py-0.5 md:py-1 rounded whitespace-nowrap ml-2 ${isActive ? "bg-white/20 text-white" : badgeColor}`}>
                          {itemType}
                        </small>
                      </li>
                    );
                  })}
                  
                  {/* Info jumlah data - mobile friendly */}
                  <li className="px-3 md:px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSuggest(false);
                          handleSubmit();
                        }}
                        className="text-primary-base font-medium hover:text-primary-dark"
                      >
                        Cari &quot;{query}&quot;
                      </button>
                    </div>
                  </li>
                </ul>
              </>
            )}

            {/* No results found */}
            {showSuggest && !loadingMerch && !loadingEvents && query.trim() && suggestions.length === 0 && (
              <>
                {/* Backdrop for mobile */}
                <div 
                  className="fixed inset-0 bg-black/30 z-40 md:hidden"
                  onClick={() => {
                    setShowSuggest(false);
                    setActiveIndex(-1);
                  }}
                />
                
                <div className="absolute z-50 mt-1 md:mt-2 w-full bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 text-center text-gray-500">
                  <div className="mb-1 md:mb-2 text-sm md:text-base">Tidak ditemukan hasil untuk</div>
                  <div className="font-medium text-gray-700 mb-2 md:mb-3">&quot;{query}&quot;</div>
                  <div className="text-xs md:text-sm">
                    {pathname?.toLowerCase().startsWith("/merchandise") 
                      ? `Mencari di ${merchandise.length} produk` 
                      : `Mencari di ${events.length} event`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuggest(false);
                      handleSubmit();
                    }}
                    className="mt-3 md:mt-4 w-full py-2 bg-primary-base text-white rounded-lg hover:bg-primary-dark transition-colors text-sm md:text-base"
                  >
                    Cari di Halaman
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Search button */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => handleSubmit()} 
              type="button" 
              className="bg-primary-base rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center hover:bg-primary-dark transition-colors shadow-md active:scale-95 transition-transform"
              aria-label="Search"
            >
              <FontAwesomeIcon 
                icon={faSearch} 
                className="text-white text-sm md:text-lg" 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;