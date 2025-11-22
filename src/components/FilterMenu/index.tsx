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
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Get } from "@/utils/REST"; // gunakan util Get yang sudah ada di proyek

// jika kamu punya Data static untuk dropdown kategori/lokasi dsb,
// kamu bisa import / definisikan kembali di sini. Saya hanya fokus search event.
const pages = [
  { name: "Event", path: "/event" },
  { name: "Merchandise", path: "/merchandise" },
];

const FilterMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [events, setEvents] = useState<any[]>([]); // struktur event minimal: { id, name, slug }
  const [loadingEvents, setLoadingEvents] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1); // keyboard nav on suggestions

  // 1) placeholder logic: kalau di home, /event atau /merchandise (atau subpath), pakai "Cari Event..."
  const placeholder = useMemo(() => {
    if (!pathname) return "Cari sesuatu...";
    const p = pathname.toLowerCase();
    if (p === "/" || p.startsWith("/event") || p.startsWith("/merchandise")) return "Cari Event...";
    return "Cari sesuatu...";
  }, [pathname]);

  // 2) fetch events sekali (you may adjust to fetch a limited list or server-side search)
  useEffect(() => {
    setLoadingEvents(true);
    Get("event", {})
      .then((res: any) => {
        // sesuaikan jika API membungkus data di res.data
        const list = Array.isArray(res) ? res : res?.data ?? res?.data?.data ?? [];
        // normalize minimal object: { id, name, slug }
        const normalized = (list || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
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

  // 3) suggestions: combine event matches + page matches
  const eventMatches = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return events.filter((e) => e.name?.toLowerCase().includes(q));
  }, [events, query]);

  const pageMatches = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return pages.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  // final suggestion list: events first, then pages (you can reorder)
  const suggestions = useMemo(() => {
    // limit suggestions length if needed
    return [...eventMatches.slice(0, 6), ...pageMatches.slice(0, 4)];
  }, [eventMatches, pageMatches]);

  // 4) close suggestions on route change (helpful for persisted layouts)
  useEffect(() => {
    setShowSuggest(false);
    setQuery("");
    inputRef.current?.blur();
  }, [pathname]);

  // 5) click outside to close suggestions
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

  // 6) keyboard navigation for suggestions (ArrowUp/Down, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggest || suggestions.length === 0) {
      if (e.key === "Enter") {
        // fallback: submit input (navigate to first page match or event match if exact)
        handleSubmit();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      listRef.current?.querySelectorAll("li")[Math.min(activeIndex + 1, suggestions.length - 1)]?.scrollIntoView({
        block: "nearest",
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      listRef.current?.querySelectorAll("li")[Math.max(activeIndex - 1, 0)]?.scrollIntoView({
        block: "nearest",
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      // choose activeIndex if available, otherwise fallback to first suggestion
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

  // choose suggestion handler
  const onChooseSuggestion = (item: any) => {
    setShowSuggest(false);
    setActiveIndex(-1);
    inputRef.current?.blur();

    // if the suggestion is an event (has slug), navigate to event detail
    if (item.slug) {
      router.push(`/event/${encodeURIComponent(item.slug)}`);
      return;
    }

    // if it's a page suggestion
    if (item.path) {
      router.push(item.path);
      return;
    }
  };

  // submit handler: if exact event title matched -> goto that event
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    // try find exact event match first
    const exactEvent = events.find((ev) => ev.name.toLowerCase() === q.toLowerCase());
    if (exactEvent) {
      router.push(`/event/${encodeURIComponent(exactEvent.slug)}`);
      setShowSuggest(false);
      return;
    }

    // else if pages match exactly
    const exactPage = pages.find((p) => p.name.toLowerCase() === q.toLowerCase());
    if (exactPage) {
      router.push(exactPage.path);
      setShowSuggest(false);
      return;
    }

    // else fallback: if there are eventMatches, go to the first event detail
    if (eventMatches.length > 0) {
      router.push(`/event/${encodeURIComponent(eventMatches[0].slug)}`);
      setShowSuggest(false);
      return;
    }

    // otherwise go to /event with tag=query (or /search route if ada)
    router.push({
      pathname: "/event",
      query: { tag: encodeURIComponent(q) } as any,
    } as any);
    setShowSuggest(false);
  };

  return (
    <div className="fixed w-full bg-gradient-to-b from-primary-dark to-primary-darker drop-shadow-2xl z-50">
      <div className="flex justify-center items-center py-3 px-4">
        <div ref={containerRef} className="bg-[#02255A] rounded-full w-full max-w-screen-lg px-4 py-2 flex items-center gap-3 relative">
          {/* Search form */}
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <div className="flex items-center gap-2 bg-primary-base/20 rounded-full px-4 py-2 flex-1">
              <FontAwesomeIcon icon={faSearch} className="text-white opacity-80" />
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                tabIndex={0}
                onFocus={() => setShowSuggest(query.length > 0)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggest(e.target.value.length > 0);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                aria-label="Search"
                className="bg-primary-800 outline-none text-white placeholder-white/60 w-full rounded-full"
              />
            </div>

            {/* suggestions dropdown */}
            {showSuggest && suggestions.length > 0 && (
              <ul ref={listRef} className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg overflow-hidden max-h-64 overflow-auto">
                {suggestions.map((item, idx) => {
                  const isEvent = !!item.slug;
                  const isActive = idx === activeIndex;
                  return (
                    <li
                      key={isEvent ? `ev-${item.id}` : `pg-${item.path}`}
                      onMouseDown={(ev) => {
                        // use onMouseDown so it fires before input blur
                        ev.preventDefault();
                        onChooseSuggestion(item);
                      }}
                      className={`px-4 py-2 text-gray-800 hover:bg-primary-base hover:text-white cursor-pointer flex justify-between items-center ${isActive ? "bg-primary-base text-white" : ""}`}
                    >
                      <span className="truncate">{isEvent ? item.name : item.name}</span>
                      <small className="opacity-60 text-xs">{isEvent ? "Event" : "Page"}</small>
                    </li>
                  );
                })}
              </ul>
            )}
          </form>

          {/* Search button */}
          <div>
            <button onClick={() => handleSubmit()} type="button" className="bg-primary-base rounded-full w-16 h-16 flex items-center justify-center">
              <FontAwesomeIcon icon={faSearch} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
