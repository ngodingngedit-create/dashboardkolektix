// import { useEffect, useMemo, useState, useCallback, useRef } from "react";
// import { MerchProps } from "@/utils/globalInterface";
// import MerchandiseCard from "@/components/Card/MerchandiseCard";
// import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
// import { Get } from "@/utils/REST";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCartShopping, faSpinner } from "@fortawesome/free-solid-svg-icons";
// import { MerchListResponse } from "../dashboard/merch/type";
// import { Text, Loader, Center } from "@mantine/core";
// import useLoggedUser from "@/utils/useLoggedUser";
// import { BookmarkListResponse } from "@/types/bookmark";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { modals } from "@mantine/modals";
// import fetch from "@/utils/fetch";
// import { BookmarkRequest } from "@/types/bookmark";

// interface ApiResponse {
//   data: MerchListResponse[];
//   total?: number;
//   current_page?: number;
//   last_page?: number;
//   per_page?: number;
//   // Coba berbagai kemungkinan struktur response
//   meta?: {
//     total: number;
//     current_page: number;
//     last_page: number;
//     per_page: number;
//   };
// }

// const Merchandise = () => {
//   const [categoryActive, setCategoryActive] = useState<string>();
//   const [data, setData] = useState<MerchListResponse[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [loadingMore, setLoadingMore] = useState<boolean>(false);
//   const [page, setPage] = useState<number>(1);
//   const [hasMore, setHasMore] = useState<boolean>(true);
//   const [total, setTotal] = useState<number>(0);
//   const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

//   const users = useLoggedUser();
//   const isLoggedIn = !!users?.name;

//   const observerRef = useRef<IntersectionObserver | null>(null);
//   const loadMoreRef = useRef<HTMLDivElement>(null);

//   const getData = useCallback(
//     async (pageNum: number = 1, isLoadMore: boolean = false) => {
//       if (isLoadMore) {
//         setLoadingMore(true);
//       } else {
//         setLoading(true);
//       }

//       try {
//         console.log(`Fetching page ${pageNum} with limit 10...`);

//         // Coba tanpa parameter dulu untuk debugging
//         const res = (await Get("product", {
//           page: pageNum,
//           limit: 10,
//         })) as any;

//         console.log("API Response:", res);

//         // Debug: Tampilkan struktur response
//         console.log("Response structure:", {
//           data: res.data,
//           hasDataProperty: res.hasOwnProperty("data"),
//           isArray: Array.isArray(res.data),
//           keys: Object.keys(res),
//           meta: res.meta,
//         });

//         let apiData: ApiResponse;
//         let filteredData: MerchListResponse[];
//         let totalItems: number;
//         let lastPage: number;

//         // Handle berbagai kemungkinan struktur response
//         if (Array.isArray(res.data)) {
//           // Case 1: response.data adalah array langsung
//           filteredData = res.data.filter((e: MerchListResponse) => e.product_status_id == 2);
//           apiData = { data: res.data };
//           totalItems = res.total || res.data.length;
//           lastPage = res.last_page || Math.ceil(totalItems / 10);
//         } else if (res.data && Array.isArray(res.data.data)) {
//           // Case 2: response.data.data adalah array (Laravel pagination default)
//           filteredData = res.data.data.filter((e: MerchListResponse) => e.product_status_id == 2);
//           apiData = res.data;
//           totalItems = res.data.total || res.data.data.length;
//           lastPage = res.data.last_page || Math.ceil(totalItems / 10);
//         } else if (Array.isArray(res)) {
//           // Case 3: response langsung array (tanpa wrapper)
//           filteredData = res.filter((e: MerchListResponse) => e.product_status_id == 2);
//           apiData = { data: res };
//           totalItems = res.length;
//           lastPage = Math.ceil(totalItems / 10);
//         } else {
//           console.error("Unexpected API response structure:", res);
//           toast.error("Format response API tidak dikenali");
//           filteredData = [];
//           totalItems = 0;
//           lastPage = 1;
//         }

//         if (isLoadMore) {
//           setData((prev) => [...prev, ...filteredData]);
//         } else {
//           setData(filteredData);
//         }

//         setTotal(totalItems);
//         setHasMore(pageNum < lastPage);

//         console.log(`Loaded ${filteredData.length} items, total: ${totalItems}, hasMore: ${pageNum < lastPage}`);

//         // Load bookmarks from user data
//         if (users?.bookmarked) {
//           const merchandiseBookmarks = users.bookmarked.filter((e: any) => e.type === "Merchandise" || e.module_id === 2);
//           const bookmarkedProductIds = merchandiseBookmarks.map((item) => item.product_id || item.event_id || item.id);
//           setBookmarkedIds(new Set(bookmarkedProductIds));
//         }
//       } catch (err: any) {
//         console.error("Error fetching merchandise:", err);

//         // Tampilkan error detail untuk debugging
//         if (err.response) {
//           console.error("Error response:", err.response.data);
//           console.error("Error status:", err.response.status);
//           toast.error(`Gagal memuat merchandise: ${err.response.status} ${err.response.data?.message || ""}`);
//         } else if (err.request) {
//           console.error("No response received:", err.request);
//           toast.error("Tidak ada respons dari server");
//         } else {
//           console.error("Error message:", err.message);
//           toast.error(`Gagal memuat merchandise: ${err.message}`);
//         }

//         // Fallback: coba ambil semua data tanpa pagination
//         if (!isLoadMore) {
//           try {
//             console.log("Trying fallback fetch without pagination...");
//             const fallbackRes = (await Get("product", {})) as any;
//             let fallbackData: MerchListResponse[] = [];

//             if (Array.isArray(fallbackRes.data)) {
//               fallbackData = fallbackRes.data.filter((e: MerchListResponse) => e.product_status_id == 2);
//             } else if (fallbackRes.data && Array.isArray(fallbackRes.data.data)) {
//               fallbackData = fallbackRes.data.data.filter((e: MerchListResponse) => e.product_status_id == 2);
//             } else if (Array.isArray(fallbackRes)) {
//               fallbackData = fallbackRes.filter((e: MerchListResponse) => e.product_status_id == 2);
//             }

//             setData(fallbackData);
//             setHasMore(false); // Nonaktifkan infinite scroll untuk fallback

//             console.log(`Fallback loaded ${fallbackData.length} items`);
//           } catch (fallbackErr) {
//             console.error("Fallback also failed:", fallbackErr);
//           }
//         }
//       } finally {
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [users?.bookmarked],
//   );

//   useEffect(() => {
//     getData(1, false);
//   }, [getData]);

//   // Setup intersection observer for infinite scroll
//   useEffect(() => {
//     if (!hasMore || loading || loadingMore) return;

//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && hasMore && !loadingMore) {
//           const nextPage = page + 1;
//           setPage(nextPage);
//           getData(nextPage, true);
//         }
//       },
//       {
//         root: null,
//         rootMargin: "100px",
//         threshold: 0.1,
//       },
//     );

//     if (loadMoreRef.current) {
//       observerRef.current.observe(loadMoreRef.current);
//     }

//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//       }
//     };
//   }, [hasMore, loading, loadingMore, page, getData]);

//   // Update bookmarks when user data changes
//   useEffect(() => {
//     if (users?.bookmarked) {
//       const merchandiseBookmarks = users.bookmarked.filter((e: any) => e.type === "Merchandise" || e.module_id === 2);
//       const bookmarkedProductIds = merchandiseBookmarks.map((item) => item.product_id || item.event_id || item.id);
//       setBookmarkedIds(new Set(bookmarkedProductIds));
//     } else {
//       setBookmarkedIds(new Set());
//     }
//   }, [users]);

//   const flashSaleProduct = useMemo(() => {
//     return data.filter((e) => e.add_to_flash_sale);
//   }, [data]);

//   const toggleBookmark = async (productId: number) => {
//     if (!isLoggedIn) {
//       toast.error("Silakan login untuk menyimpan bookmark");
//       return;
//     }

//     const isBookmarked = bookmarkedIds.has(productId);
//     const existingBookmark = users?.bookmarked?.find((e: any) => (e.product_id === productId || e.event_id === productId) && (e.type === "Merchandise" || e.module_id === 2));

//     if (isBookmarked || existingBookmark) {
//       // Show confirmation modal for removal
//       modals.openConfirmModal({
//         centered: true,
//         title: "Hapus dari bookmark",
//         children: "Apakah kamu yakin ingin menghapus merchandise ini dari bookmark?",
//         labels: { cancel: "Batal", confirm: "Hapus" },
//         onConfirm: async () => {
//           await handleRemoveBookmark(productId, existingBookmark?.id);
//         },
//       });
//     } else {
//       await handleAddBookmark(productId);
//     }
//   };

//   const handleAddBookmark = async (productId: number) => {
//     try {
//       await fetch<any, BookmarkListResponse>({
//         url: "bookmark-user",
//         method: "POST",
//         data: {
//           module_id: 2, // 2 untuk merchandise (1 untuk event)
//           type: "Merchandise",
//           product_id: productId,
//         } as BookmarkRequest,
//         success: (response) => {
//           // Update local state
//           setBookmarkedIds((prev) => new Set(prev).add(productId));

//           // Update cookies
//           const data = JSON.parse(Cookies.get("bookmarked") ?? "[]") as BookmarkListResponse[];
//           Cookies.set("bookmarked", JSON.stringify([...data, response.data]));

//           toast.success("Berhasil menambahkan ke bookmark");
//         },
//         error: () => {
//           toast.error("Gagal menambahkan bookmark");
//         },
//       });
//     } catch (error) {
//       console.error("Error adding bookmark:", error);
//       toast.error("Gagal menambahkan bookmark");
//     }
//   };

//   const handleRemoveBookmark = async (productId: number, bookmarkId?: number) => {
//     try {
//       // Cari bookmark ID jika tidak tersedia
//       let idToDelete = bookmarkId;
//       if (!idToDelete) {
//         const existingBookmark = users?.bookmarked?.find((e: any) => (e.product_id === productId || e.event_id === productId) && (e.type === "Merchandise" || e.module_id === 2));
//         idToDelete = existingBookmark?.id;
//       }

//       if (!idToDelete) {
//         toast.error("Gagal menghapus bookmark");
//         return;
//       }

//       await fetch<any, any>({
//         url: `bookmark/${idToDelete}`,
//         method: "DELETE",
//         success: () => {
//           // Update local state
//           setBookmarkedIds((prev) => {
//             const newSet = new Set(prev);
//             newSet.delete(productId);
//             return newSet;
//           });

//           // Update cookies
//           const data = JSON.parse(Cookies.get("bookmarked") ?? "[]") as BookmarkListResponse[];
//           Cookies.set("bookmarked", JSON.stringify(data.filter((e: any) => e.id !== idToDelete && !(e.product_id === productId && (e.type === "Merchandise" || e.module_id === 2)))));

//           toast.success("Berhasil menghapus dari bookmark");
//         },
//         error: () => {
//           toast.error("Gagal menghapus bookmark");
//         },
//       });
//     } catch (error) {
//       console.error("Error removing bookmark:", error);
//       toast.error("Gagal menghapus bookmark");
//     }
//   };

//   // Handle manual load more button
//   const handleLoadMore = () => {
//     if (!loadingMore && hasMore) {
//       const nextPage = page + 1;
//       setPage(nextPage);
//       getData(nextPage, true);
//     }
//   };

//   const category = ["Merchandise", "Merchandise 2", "Merchandise 3", "Merchandise 4"];

//   return (
//     <div className="py-10 md:pt-12 max-w-5xl mx-auto text-dark !mt-[0px] md:mt-0">
//       <div className="pl-7">
//         <Breadcrumbs>
//           <BreadcrumbItem>Beranda</BreadcrumbItem>
//           <BreadcrumbItem>List Merchandise</BreadcrumbItem>
//         </Breadcrumbs>
//       </div>

//       {loading && !loadingMore ? (
//         <Center className="min-h-[50vh]">
//           <Loader size="lg" />
//           <span className="ml-2">Memuat merchandise...</span>
//         </Center>
//       ) : (
//         <>
//           {flashSaleProduct.length > 0 && (
//             <>
//               <Text px={20} mt={15} size="xl" mb={-10} fw={600}>
//                 Flash Sale
//               </Text>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 content-center justify-items-center gap-[10px] md:gap-[15px] my-5 px-[20px]">
//                 {flashSaleProduct.map((item) => (
//                   <MerchandiseCard
//                     key={`flash-${item.id}`}
//                     id={item.id}
//                     name={item.product_name}
//                     price={parseInt((item?.product_varian?.length ?? 0) > 0 ? item.product_varian[0].price : item.price)}
//                     sale={0}
//                     creator={item.creator.name}
//                     creatorid={item.creator.id}
//                     creatorImage={item.creator.image_url}
//                     redirect={`/merchandise/${item.slug}`}
//                     image={item.product_image.length > 0 ? item.product_image[0].image_url : undefined}
//                     location={item.has_store_location?.store_name}
//                     isBookmarked={bookmarkedIds.has(item.id)}
//                     onBookmarkToggle={toggleBookmark}
//                     showBookmark={isLoggedIn}
//                   />
//                 ))}
//               </div>
//             </>
//           )}

//           <Text px={20} mt={15} size="xl" mb={-10} fw={600}>
//             Semua Merchandise
//           </Text>

//           {data.length > 0 ? (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-[10px] md:gap-[15px] my-5 px-[20px]">
//                 {data.map((item, index) => (
//                   <MerchandiseCard
//                     key={`merch-${item.id}-${index}`}
//                     id={item.id}
//                     name={item.product_name}
//                     price={parseInt((item?.product_varian?.length ?? 0) > 0 ? (item.product_varian[0].price ?? 0) : (item.price ?? 0))}
//                     sale={0}
//                     creator={item.creator?.name ?? "Unknown Creator"}
//                     creatorid={item.creator?.id}
//                     creatorImage={item.creator?.image_url}
//                     redirect={`/merchandise/${item.slug}`}
//                     image={item.product_image?.length > 0 ? item.product_image[0].image_url : undefined}
//                     location={item.has_store_location?.store_name}
//                     isBookmarked={bookmarkedIds.has(item.id)}
//                     onBookmarkToggle={toggleBookmark}
//                     showBookmark={isLoggedIn}
//                     productVariants={item.product_varian as any[]}
//                   />
//                 ))}
//               </div>

//               {/* Loading indicator and observer trigger */}
//               <div ref={loadMoreRef} className="py-6 text-center">
//                 {loadingMore && (
//                   <Center>
//                     <Loader size="sm" />
//                     <span className="ml-2">Memuat merchandise...</span>
//                   </Center>
//                 )}

//                 {/* Optional: Show load more button for mobile or as fallback */}
//                 {!loadingMore && hasMore && data.length > 0 && (
//                   <div className="space-y-4">
//                     <button onClick={handleLoadMore} className="mt-4 px-6 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-dark transition-colors">
//                       Muat Lebih Banyak
//                     </button>
//                     <p className="text-sm text-gray-500">Scroll ke bawah untuk memuat otomatis</p>
//                   </div>
//                 )}

//                 {/* {!hasMore && data.length > 0 && (
//                   <p className="text-gray-500 py-4">
//                     Menampilkan semua {data.length} merchandise
//                   </p>
//                 )} */}
//               </div>
//             </>
//           ) : (
//             <div className="min-h-[80vh] flex flex-col gap-3 items-center justify-center">
//               <FontAwesomeIcon icon={faCartShopping} size="2x" className="text-primary-base" />
//               <h3 className="text-grey">Belum ada merchandise</h3>
//               <button onClick={() => getData(1, false)} className="mt-4 px-4 py-2 bg-primary-base text-white rounded hover:bg-primary-dark transition-colors">
//                 Coba Muat Ulang
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default Merchandise;

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { MerchProps } from "@/utils/globalInterface";
import MerchandiseCard from "@/components/Card/MerchandiseCard";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { Get } from "@/utils/REST";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faSpinner, faFilter, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { MerchListResponse } from "../dashboard/merch/type";
import { Text, Loader, Center, Button, Menu, Group, ActionIcon, Box, Modal, TextInput, ScrollArea, Badge, Divider } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import useLoggedUser from "@/utils/useLoggedUser";
import { BookmarkListResponse } from "@/types/bookmark";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { modals } from "@mantine/modals";
import fetch from "@/utils/fetch";
import { BookmarkRequest } from "@/types/bookmark";

interface ApiResponse {
  data: MerchListResponse[];
  total?: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  meta?: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

// Tambahkan interface untuk Creator
interface Creator {
  id: number;
  name: string;
  image_url: string;
  is_verified?: boolean | number;
}

// Update tipe MerchListResponse untuk include Creator dengan is_verified
type MerchListResponseWithVerified = MerchListResponse & {
  creator: (MerchListResponse['creator'] & { is_verified?: boolean | number });
};

const Merchandise = () => {
  const [categoryActive, setCategoryActive] = useState<string>();
  const [data, setData] = useState<MerchListResponseWithVerified[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<number>(0); // Progress loading
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false); // Status lagi load semua
  
  const [creatorVerifiedCache, setCreatorVerifiedCache] = useState<Map<number, boolean>>(new Map());
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [opened, { open, close }] = useDisclosure(false);

  const users = useLoggedUser();
  const isLoggedIn = !!users?.name;

  // ============ FUNGSI FETCH CREATOR ============
  const fetchCreatorVerifiedStatus = useCallback(async (creatorId: number): Promise<boolean> => {
    try {
      if (creatorVerifiedCache.has(creatorId)) {
        return creatorVerifiedCache.get(creatorId)!;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_WS_URL;
      
      const response = await window.fetch(`${apiBaseUrl}creator/${creatorId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        setCreatorVerifiedCache(prev => new Map(prev).set(creatorId, false));
        return false;
      }
      
      const result = await response.json();
      const data = result.data || result;
      
      let isVerified = false;
      if (typeof data.is_verified === 'number') {
        isVerified = data.is_verified === 1;
      } else {
        isVerified = data.is_verified || false;
      }
      
      setCreatorVerifiedCache(prev => new Map(prev).set(creatorId, isVerified));
      return isVerified;
    } catch (error) {
      console.error('Error fetching creator verified status:', error);
      setCreatorVerifiedCache(prev => new Map(prev).set(creatorId, false));
      return false;
    }
  }, [creatorVerifiedCache]);

  // ============ FUNGSI UPDATE VERIFIED ============
  const updateDataWithVerifiedStatus = useCallback(async () => {
    const creatorIdsToUpdate = new Set<number>();
    
    data.forEach(item => {
      if (item.creator?.id && 
          item.creator?.is_verified === undefined && 
          !creatorIdsToUpdate.has(item.creator.id)) {
        creatorIdsToUpdate.add(item.creator.id);
      }
    });
    
    if (creatorIdsToUpdate.size === 0) return;
    
    const updatePromises = Array.from(creatorIdsToUpdate).map(async (creatorId) => {
      const isVerified = await fetchCreatorVerifiedStatus(creatorId);
      return { creatorId, isVerified };
    });
    
    const results = await Promise.allSettled(updatePromises);
    
    setData(prev => prev.map(item => {
      if (!item.creator?.id) return item;
      
      const result = results.find(r => 
        r.status === 'fulfilled' && 
        r.value.creatorId === item.creator.id
      );
      
      if (result && result.status === 'fulfilled') {
        return {
          ...item,
          creator: {
            ...item.creator,
            is_verified: result.value.isVerified ? 1 : 0
          }
        };
      }
      
      return item;
    }));
  }, [data, fetchCreatorVerifiedStatus]);

  // ============ FUNGSI GET SINGLE PAGE ============
  const fetchPage = useCallback(async (pageNum: number): Promise<MerchListResponseWithVerified[]> => {
    try {
      console.log(`📦 Fetching page ${pageNum}...`);
      
      const res = (await Get("product", {
        page: pageNum,
        limit: 10,
      })) as any;

      let filteredData: MerchListResponseWithVerified[] = [];

      // Parse response
      if (res.data && res.data.last_page !== undefined) {
        filteredData = (res.data.data || []).filter((e: MerchListResponse) => e.product_status_id == 2) as MerchListResponseWithVerified[];
      } else if (res.meta && res.meta.last_page !== undefined) {
        filteredData = (res.data || []).filter((e: MerchListResponse) => e.product_status_id == 2) as MerchListResponseWithVerified[];
      } else if (res.last_page !== undefined) {
        filteredData = (res.data || []).filter((e: MerchListResponse) => e.product_status_id == 2) as MerchListResponseWithVerified[];
      } else {
        filteredData = (Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [])
          .filter((e: MerchListResponse) => e.product_status_id == 2) as MerchListResponseWithVerified[];
      }

      return filteredData;
    } catch (error) {
      console.error(`❌ Error fetching page ${pageNum}:`, error);
      return [];
    }
  }, []);

  // ============ FUNGSI GET FIRST PAGE + GET TOTAL PAGES ============
  const getFirstPage = useCallback(async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      console.log('📦 Fetching first page...');
      
      const res = (await Get("product", {
        page: 1,
        limit: 10,
      })) as any;

      let firstPageData: MerchListResponseWithVerified[] = [];
      let totalItems = 0;
      let totalPages = 1;

      // Parse response untuk dapat first page data dan total pages
      if (res.data && res.data.last_page !== undefined) {
        firstPageData = (res.data.data || []).filter((e: MerchListResponse) => e.product_status_id == 2) as MerchListResponseWithVerified[];
        totalItems = res.data.total || 0;
        totalPages = Math.max(1, res.data.last_page || 1);
      } else if (res.meta && res.meta.last_page !== undefined) {
        firstPageData = (res.data || []).filter((e: MerchListResponse) => e.product_status_id == 2) as MerchListResponseWithVerified[];
        totalItems = res.meta.total || 0;
        totalPages = Math.max(1, res.meta.last_page || 1);
      } else if (res.last_page !== undefined) {
        firstPageData = (res.data || []).filter((e: MerchListResponse) => e.product_status_id == 2) as MerchListResponseWithVerified[];
        totalItems = res.total || 0;
        totalPages = Math.max(1, res.last_page || 1);
      } else {
        firstPageData = (Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [])
          .filter((e: MerchListResponse) => e.product_status_id == 2) as MerchListResponseWithVerified[];
        totalItems = firstPageData.length;
        totalPages = 1;
      }

      // Set data awal dari page 1
      setData(firstPageData);
      setTotal(totalItems);
      setLastPage(totalPages);
      
      console.log(`✅ First page loaded | Total pages: ${totalPages} | Total items: ${totalItems}`);

      // Update bookmarks
      if (users?.bookmarked) {
        const merchandiseBookmarks = users.bookmarked.filter((e: any) => e.type === "Merchandise" || e.module_id === 2);
        const bookmarkedProductIds = merchandiseBookmarks.map((item) => item.product_id || item.event_id || item.id);
        setBookmarkedIds(new Set(bookmarkedProductIds));
      }

      // KALO CUMA 1 PAGE, SELESAI
      if (totalPages <= 1) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      // ============ LOAD SEMUA PAGE SISANYA SECARA PARALEL ============
      setIsLoadingAll(true);
      
      // Buat array halaman 2 sampai totalPages
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      
      console.log(`🚀 Fetching ${remainingPages.length} remaining pages in parallel...`);
      
      // Fetch semua page secara paralel
      const pagePromises = remainingPages.map(pageNum => fetchPage(pageNum));
      
      // Tunggu semua promise selesai
      const results = await Promise.allSettled(pagePromises);
      
      // Kumpulkan semua data dari page 2 - lastPage
      let allRemainingData: MerchListResponseWithVerified[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allRemainingData = [...allRemainingData, ...result.value];
          console.log(`✅ Page ${remainingPages[index]} loaded | Items: ${result.value.length}`);
        }
        
        // Update progress
        setProgress(Math.round(((index + 1) / remainingPages.length) * 100));
      });
      
      // Gabungkan data page 1 + semua page sisanya
      setData(prev => [...prev, ...allRemainingData]);
      
      console.log(`🎉 ALL PAGES LOADED! Total items: ${firstPageData.length + allRemainingData.length}`);
      
      setHasMore(false);
      setIsLoadingAll(false);
      
    } catch (error) {
      console.error('❌ Error in getFirstPage:', error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }, [users?.bookmarked, fetchPage]);

  // ============ INITIAL LOAD - LANGSUNG AMBIL SEMUA ============
  useEffect(() => {
    getFirstPage();
  }, [getFirstPage]);

  // ============ UPDATE VERIFIED STATUS ============
  useEffect(() => {
    if (data.length > 0 && !loading && !isLoadingAll) {
      updateDataWithVerifiedStatus();
    }
  }, [data, loading, isLoadingAll, updateDataWithVerifiedStatus]);

  // ============ UPDATE BOOKMARKS ============
  useEffect(() => {
    if (users?.bookmarked) {
      const merchandiseBookmarks = users.bookmarked.filter((e: any) => e.type === "Merchandise" || e.module_id === 2);
      const bookmarkedProductIds = merchandiseBookmarks.map((item) => item.product_id || item.event_id || item.id);
      setBookmarkedIds(new Set(bookmarkedProductIds));
    } else {
      setBookmarkedIds(new Set());
    }
  }, [users]);

  // ============ RESET FILTER ============
  useEffect(() => {
    if (selectedCreator !== null) {
      // Reset dan load ulang semua data
      getFirstPage();
    }
  }, [selectedCreator, getFirstPage]);

  // ============ MEMOIZED VALUES ============
  const flashSaleProduct = useMemo(() => {
    return data.filter((e) => e.add_to_flash_sale);
  }, [data]);

  const uniqueCreators = useMemo(() => {
    const creators = new Map<number, { id: number; name: string }>();
    data.forEach(item => {
      if (item.creator?.id && item.creator?.name) {
        if (!creators.has(item.creator.id)) {
          creators.set(item.creator.id, {
            id: item.creator.id,
            name: item.creator.name
          });
        }
      }
    });
    return Array.from(creators.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return uniqueCreators;
    const query = searchQuery.toLowerCase();
    return uniqueCreators.filter(creator => 
      creator.name.toLowerCase().includes(query)
    );
  }, [uniqueCreators, searchQuery]);

  const filteredData = useMemo(() => {
    if (!selectedCreator) return data;
    const creatorId = parseInt(selectedCreator);
    return data.filter(item => item.creator?.id === creatorId);
  }, [data, selectedCreator]);

  // ============ HANDLER SELECT CREATOR ============
  const handleSelectCreator = (creatorId: string | null) => {
    setSelectedCreator(creatorId);
    close();
    setSearchQuery("");
  };

  // ============ BOOKMARK HANDLERS ============
  const toggleBookmark = async (productId: number) => {
    if (!isLoggedIn) {
      toast.error("Silakan login untuk menyimpan bookmark");
      return;
    }

    const isBookmarked = bookmarkedIds.has(productId);
    const existingBookmark = users?.bookmarked?.find((e: any) => (e.product_id === productId || e.event_id === productId) && (e.type === "Merchandise" || e.module_id === 2));

    if (isBookmarked || existingBookmark) {
      modals.openConfirmModal({
        centered: true,
        title: "Hapus dari bookmark",
        children: "Apakah kamu yakin ingin menghapus merchandise ini dari bookmark?",
        labels: { cancel: "Batal", confirm: "Hapus" },
        onConfirm: async () => {
          await handleRemoveBookmark(productId, existingBookmark?.id);
        },
      });
    } else {
      await handleAddBookmark(productId);
    }
  };

  const handleAddBookmark = async (productId: number) => {
    try {
      await fetch<any, BookmarkListResponse>({
        url: "bookmark-user",
        method: "POST",
        data: {
          module_id: 2,
          type: "Merchandise",
          product_id: productId,
        } as BookmarkRequest,
        success: (response) => {
          setBookmarkedIds((prev) => new Set(prev).add(productId));
          const data = JSON.parse(Cookies.get("bookmarked") ?? "[]") as BookmarkListResponse[];
          Cookies.set("bookmarked", JSON.stringify([...data, response.data]));
          toast.success("Berhasil menambahkan ke bookmark");
        },
        error: () => {
          toast.error("Gagal menambahkan bookmark");
        },
      });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast.error("Gagal menambahkan bookmark");
    }
  };

  const handleRemoveBookmark = async (productId: number, bookmarkId?: number) => {
    try {
      let idToDelete = bookmarkId;
      if (!idToDelete) {
        const existingBookmark = users?.bookmarked?.find((e: any) => (e.product_id === productId || e.event_id === productId) && (e.type === "Merchandise" || e.module_id === 2));
        idToDelete = existingBookmark?.id;
      }

      if (!idToDelete) {
        toast.error("Gagal menghapus bookmark");
        return;
      }

      await fetch<any, any>({
        url: `bookmark/${idToDelete}`,
        method: "DELETE",
        success: () => {
          setBookmarkedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          const data = JSON.parse(Cookies.get("bookmarked") ?? "[]") as BookmarkListResponse[];
          Cookies.set("bookmarked", JSON.stringify(data.filter((e: any) => e.id !== idToDelete && !(e.product_id === productId && (e.type === "Merchandise" || e.module_id === 2)))));
          toast.success("Berhasil menghapus dari bookmark");
        },
        error: () => {
          toast.error("Gagal menghapus bookmark");
        },
      });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Gagal menghapus bookmark");
    }
  };

  // ============ RENDER ============
  return (
    <div className="py-10 md:pt-12 max-w-5xl mx-auto text-dark !mt-[0px] md:mt-0">
      {/* LOADING SEMUA DATA */}
      {loading && (
        <Center className="min-h-[50vh] flex-col gap-4">
          <Loader size="lg" />
          <div className="text-center">
            <span className="text-lg font-medium">Memuat semua merchandise...</span>
            {lastPage > 1 && (
              <>
                <div className="mt-4 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {progress}% • Halaman 1 dari {lastPage}
                </p>
                {isLoadingAll && (
                  <p className="mt-1 text-xs text-gray-500">
                    ⚡ Mengambil {lastPage - 1} halaman sisanya secara paralel...
                  </p>
                )}
              </>
            )}
          </div>
        </Center>
      )}

      {/* DATA SUDAH LENGKAP */}
      {!loading && (
        <>
          {/* FLASH SALE SECTION */}
          {flashSaleProduct.length > 0 && (
            <>
              <Text px={20} mt={15} size="xl" mb={-10} fw={600}>
                Flash Sale
              </Text>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 content-center justify-items-center gap-[10px] md:gap-[15px] my-5 px-[20px]">
                {flashSaleProduct.map((item) => (
                  <MerchandiseCard
                    key={`flash-${item.id}`}
                    id={item.id}
                    name={item.product_name}
                    price={parseInt((item?.product_varian?.length ?? 0) > 0 ? item.product_varian[0].price : item.price)}
                    sale={0}
                    creator={item.creator.name}
                    creatorid={item.creator.id}
                    creatorImage={item.creator.image_url}
                    redirect={`/merchandise/${item.slug}`}
                    image={item.product_image.length > 0 ? item.product_image[0].image_url : undefined}
                    location={item.has_store_location?.store_name}
                    isBookmarked={bookmarkedIds.has(item.id)}
                    onBookmarkToggle={toggleBookmark}
                    showBookmark={isLoggedIn}
                    fetchCreatorVerifiedStatus={fetchCreatorVerifiedStatus}
                    isVerified={item.creator?.is_verified === 1 || item.creator?.is_verified === true}
                  />
                ))}
              </div>
            </>
          )}

          {/* MOBILE FILTER */}
          <div className="px-[20px] mb-3 md:hidden">
            <Box className="flex items-center justify-between">
              <Text size="xl" fw={600}>
                Semua Merchandise
              </Text>
              {uniqueCreators.length > 0 && (
                <ActionIcon 
                  variant="light" 
                  color="blue" 
                  size="lg"
                  aria-label="Filter creator"
                  onClick={open}
                >
                  <FontAwesomeIcon icon={faFilter} />
                </ActionIcon>
              )}
            </Box>
            {selectedCreator && (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge color="blue" variant="light">
                    {uniqueCreators.find(c => c.id.toString() === selectedCreator)?.name}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    ({filteredData.length} merchandise)
                  </Text>
                </div>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setSelectedCreator(null)}
                  color="red"
                >
                  Hapus Filter
                </Button>
              </div>
            )}
          </div>

          {/* MOBILE FILTER MODAL */}
          <Modal
            opened={opened}
            onClose={close}
            title={
              <div className="flex items-center justify-between">
                <Text fw={600}>Filter Creator</Text>
              </div>
            }
            centered
            size="sm"
            className="md:hidden"
            overlayProps={{
              backgroundOpacity: 0.55,
              blur: 3,
            }}
            radius="md"
          >
            <div className="space-y-4">
              <TextInput
                placeholder="Cari creator..."
                leftSection={<FontAwesomeIcon icon={faSearch} size="sm" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                size="md"
                radius="md"
              />

              <Divider />

              <div className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-1">
                  <Button
                    fullWidth
                    variant={!selectedCreator ? "filled" : "light"}
                    color={!selectedCreator ? "blue" : "gray"}
                    justify="start"
                    onClick={() => handleSelectCreator(null)}
                    className="justify-start py-2"
                    size="md"
                    radius="md"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Semua Creator</span>
                      <Badge color="gray" variant="light" size="sm">
                        {data.length}
                      </Badge>
                    </div>
                  </Button>
                  
                  {filteredCreators.length > 0 ? (
                    filteredCreators.map((creator) => {
                      const creatorItemCount = data.filter(item => item.creator?.id === creator.id).length;
                      return (
                        <Button
                          key={creator.id}
                          fullWidth
                          variant={selectedCreator === creator.id.toString() ? "filled" : "light"}
                          color={selectedCreator === creator.id.toString() ? "blue" : "gray"}
                          justify="start"
                          onClick={() => handleSelectCreator(creator.id.toString())}
                          className="justify-start py-2"
                          size="md"
                          radius="md"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{creator.name}</span>
                            <Badge color="gray" variant="light" size="sm">
                              {creatorItemCount}
                            </Badge>
                          </div>
                        </Button>
                      );
                    })
                  ) : (
                    <Center py={10}>
                      <Text c="dimmed" size="sm">Tidak ada creator yang cocok</Text>
                    </Center>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  fullWidth
                  onClick={close}
                  size="md"
                  radius="md"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </Modal>

          {/* DESKTOP TITLE */}
          <div className="hidden md:block">
            <Text px={20} mt={15} size="xl" mb={-10} fw={600}>
              Semua Merchandise
              {selectedCreator && (
                <span className="ml-2 text-base font-normal">
                  - {uniqueCreators.find(c => c.id.toString() === selectedCreator)?.name}
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => setSelectedCreator(null)}
                    color="red"
                    className="ml-2"
                  >
                    Hapus
                  </Button>
                </span>
              )}
              {!selectedCreator && total > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({total} item)
                </span>
              )}
            </Text>
          </div>

          {/* MAIN GRID - SEMUA DATA LANGSUNG TAMPIL */}
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-[10px] md:gap-[15px] my-5 px-[20px]">
              {filteredData.map((item, index) => (
                <MerchandiseCard
                  key={`merch-${item.id}-${index}`}
                  id={item.id}
                  name={item.product_name}
                  price={parseInt((item?.product_varian?.length ?? 0) > 0 ? (item.product_varian[0].price ?? 0) : (item.price ?? 0))}
                  sale={0}
                  creator={item.creator?.name ?? "Unknown Creator"}
                  creatorid={item.creator?.id}
                  creatorImage={item.creator?.image_url}
                  redirect={`/merchandise/${item.slug}`}
                  image={item.product_image?.length > 0 ? item.product_image[0].image_url : undefined}
                  location={item.has_store_location?.store_name}
                  isBookmarked={bookmarkedIds.has(item.id)}
                  onBookmarkToggle={toggleBookmark}
                  showBookmark={isLoggedIn}
                  productVariants={item.product_varian as any[]}
                  fetchCreatorVerifiedStatus={fetchCreatorVerifiedStatus}
                  isVerified={item.creator?.is_verified === 1 || item.creator?.is_verified === true}
                />
              ))}
            </div>
          ) : (
            <div className="min-h-[80vh] flex flex-col gap-3 items-center justify-center">
              <FontAwesomeIcon icon={faCartShopping} size="2x" className="text-primary-base" />
              <h3 className="text-grey">Belum ada merchandise</h3>
              {selectedCreator && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Tidak ada merchandise untuk creator{" "}
                    <span className="font-semibold">
                      {uniqueCreators.find(c => c.id.toString() === selectedCreator)?.name}
                    </span>
                  </p>
                  <Button
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => setSelectedCreator(null)}
                  >
                    Hapus Filter
                  </Button>
                </div>
              )}
              <button onClick={() => getFirstPage()} className="mt-4 px-4 py-2 bg-primary-base text-white rounded hover:bg-primary-dark transition-colors">
                Coba Muat Ulang
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Merchandise;