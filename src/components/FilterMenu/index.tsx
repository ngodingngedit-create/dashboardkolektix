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
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const Data = [
  /* ... your Data array (unchanged) ... */
];

const FilterMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pages = [
    { name: "Event", path: "/event" },
    { name: "Merchandise", path: "/merchandise" },
  ];

  const filtered = pages.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  // 1) Close and reset on route change (covers persistent layout cases)
  useEffect(() => {
    setShowSuggest(false);
    setQuery("");
    inputRef.current?.blur();
  }, [pathname]);

  // 2) Close when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const match = pages.find((item) => item.name.toLowerCase() === query.toLowerCase());
    const target = match ? match.path : filtered.length > 0 ? filtered[0].path : null;
    if (!target) return;

    // Close and blur BEFORE navigating (next/navigation router.push is not awaitable)
    setShowSuggest(false);
    inputRef.current?.blur();
    router.push(target);
  };

  return (
    <div className="fixed w-full bg-gradient-to-b from-primary-dark to-primary-darker drop-shadow-2xl z-50">
      <div className="flex justify-center items-center py-3 px-4">
        <div ref={containerRef} className="bg-[#02255A] rounded-full w-full max-w-screen-lg px-4 py-2 flex items-center gap-3 relative">
          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <div className="flex items-center gap-2 bg-primary-base/20 rounded-full px-4 py-2 flex-1">
              <FontAwesomeIcon icon={faSearch} className="text-white opacity-80" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari sesuatu..."
                value={query}
                tabIndex={0}
                onFocus={() => setShowSuggest(query.length > 0)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggest(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowSuggest(false);
                    inputRef.current?.blur();
                  }
                }}
                aria-label="Search"
                className="bg-primary-800 outline-none text-white placeholder-white/60 w-full rounded-full"
              />
            </div>

            {/* Dropdown suggestion */}
            {showSuggest && filtered.length > 0 && (
              <ul className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg overflow-hidden">
                {filtered.map((item) => (
                  <li
                    key={item.path}
                    // use onMouseDown so it fires BEFORE input's blur (prevents flicker)
                    onMouseDown={(ev) => {
                      ev.preventDefault(); // prevent default to avoid some browsers moving focus
                      setShowSuggest(false);
                      inputRef.current?.blur();
                      router.push(item.path);
                    }}
                    className="px-4 py-2 text-gray-800 hover:bg-primary-base hover:text-white cursor-pointer"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Search button */}
          <div>
            <button type="submit" onClick={handleSubmit} className="bg-primary-base rounded-full w-16 h-16 flex items-center justify-center">
              <FontAwesomeIcon icon={faSearch} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
