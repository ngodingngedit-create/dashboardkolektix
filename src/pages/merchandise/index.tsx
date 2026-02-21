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
import { Get } from "@/utils/REST";
import MerchandiseCard from "@/components/Card/MerchandiseCard";
import { Text, Loader, Center, Button, Badge } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import useLoggedUser from "@/utils/useLoggedUser";
import { toast } from "react-toastify";
import { modals } from "@mantine/modals";
import fetch from "@/utils/fetch";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faFilter, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Modal, TextInput, Divider, ActionIcon } from "@mantine/core";
import { MerchListResponse } from "../dashboard/merch/type";
import { BookmarkListResponse, BookmarkRequest } from "@/types/bookmark";

// ============ TYPE DEFINITIONS ============
type MerchListResponseWithVerified = MerchListResponse & {
  creator: (MerchListResponse['creator'] & { is_verified?: boolean | number });
};

const Merchandise = () => {
  // ============ STATE ============
  const [data, setData] = useState<MerchListResponseWithVerified[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  
  const users = useLoggedUser();
  const isLoggedIn = !!users?.name;

  // ============ REFS ============
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  
  // ============ CACHE CREATOR ============
  const [creatorCache, setCreatorCache] = useState<Record<number, boolean>>({});
  const cacheRef = useRef<Record<number, boolean>>({});
  const isFetchingCreators = useRef(false);
  const pendingCreatorFetch = useRef<Set<number>>(new Set());

  // ============ INITIAL LOAD ============
  useEffect(() => {
    loadInitialData();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // ============ RESET WHEN FILTER CHANGE ============
  useEffect(() => {
    if (selectedCreator !== null) {
      resetAndLoad();
    }
  }, [selectedCreator]);

  // ============ SETUP INTERSECTION OBSERVER ============
  useEffect(() => {
    if (loading || !hasMore || loadingMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !isFetchingRef.current) {
          loadMoreData();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore, currentPage]);

  // ============ UPDATE BOOKMARKS ============
  useEffect(() => {
    if (users?.bookmarked) {
      const bookmarkedIds = users.bookmarked
        .filter((e: any) => e.type === "Merchandise" || e.module_id === 2)
        .map((item: any) => item.product_id || item.event_id || item.id);
      setBookmarkedIds(new Set(bookmarkedIds));
    }
  }, [users]);

  // ============ LOAD INITIAL DATA ============
  const loadInitialData = async () => {
    if (initialLoadDoneRef.current) return;
    
    setLoading(true);
    setData([]);
    setCurrentPage(1);
    isFetchingRef.current = true;
    
    try {
      console.log('📦 Fetching initial page...');
      const response = await Get("product", { page: 1, limit: 10 }) as any;
      
      // Parse response
      let products: MerchListResponseWithVerified[] = [];
      let lastPage = 1;
      
      if (response.data?.last_page) {
        lastPage = response.data.last_page;
        products = (response.data.data || []).filter((e: any) => e.product_status_id == 2);
      } else if (response.meta?.last_page) {
        lastPage = response.meta.last_page;
        products = (response.data || []).filter((e: any) => e.product_status_id == 2);
      } else if (response.last_page) {
        lastPage = response.last_page;
        products = (response.data || []).filter((e: any) => e.product_status_id == 2);
      }
      
      setData(products);
      setTotalPages(lastPage);
      setHasMore(lastPage > 1);
      initialLoadDoneRef.current = true;
      
      console.log(`📊 Page 1/${lastPage} | Items: ${products.length}`);
      
      // Fetch creators untuk initial data
      await fetchCreatorsForProducts(products);
      
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // ============ LOAD MORE DATA ============
  const loadMoreData = async () => {
    if (isFetchingRef.current || !hasMore || loadingMore || currentPage >= totalPages) return;
    
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    isFetchingRef.current = true;
    
    try {
      console.log(`⏳ Loading page ${nextPage}...`);
      
      // Delay 1.5 detik antar request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await Get("product", { page: nextPage, limit: 10 }) as any;
      
      // Parse response
      let newProducts: MerchListResponseWithVerified[] = [];
      
      if (response.data?.data) {
        newProducts = response.data.data.filter((e: any) => e.product_status_id == 2);
      } else if (response.data) {
        newProducts = (Array.isArray(response.data) ? response.data : [])
          .filter((e: any) => e.product_status_id == 2);
      }
      
      if (newProducts.length > 0) {
        setData(prev => [...prev, ...newProducts]);
        setCurrentPage(nextPage);
        setHasMore(nextPage < totalPages);
        
        console.log(`✅ Page ${nextPage}/${totalPages} loaded | +${newProducts.length} items`);
        
        // Fetch creators untuk produk baru
        await fetchCreatorsForProducts(newProducts);
      } else {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error(`❌ Error loading page ${nextPage}:`, error);
      toast.error("Gagal memuat data tambahan");
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  // ============ FETCH CREATORS FOR PRODUCTS ============
  const fetchCreatorsForProducts = async (products: MerchListResponseWithVerified[]) => {
    // Kumpulin unique creator IDs yang belum di-fetch
    const creatorIds = Array.from(new Set(
      products
        .map(item => item.creator?.id)
        .filter((id): id is number => 
          id !== undefined && 
          id !== null && 
          !cacheRef.current.hasOwnProperty(id) &&
          !pendingCreatorFetch.current.has(id)
        )
    ));
    
    if (creatorIds.length === 0 || isFetchingCreators.current) return;
    
    // Tandai sebagai pending
    creatorIds.forEach(id => pendingCreatorFetch.current.add(id));
    
    // Fetch satu per satu dengan delay 500ms
    for (let i = 0; i < creatorIds.length; i++) {
      const id = creatorIds[i];
      
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      try {
        console.log(`👤 Fetching creator ${id}...`);
        const res = await window.fetch(`${process.env.NEXT_PUBLIC_WS_URL}creator/${id}`);
        
        if (res.ok) {
          const result = await res.json();
          const data = result.data || result;
          const isVerified = data.is_verified == 1 || data.is_verified == true;
          
          // Update cache
          cacheRef.current[id] = isVerified;
          setCreatorCache({ ...cacheRef.current });
          
          // Update data yang sudah ada
          setData(prev => prev.map(item => {
            if (item.creator?.id === id) {
              return {
                ...item,
                creator: {
                  ...item.creator,
                  is_verified: isVerified ? 1 : 0
                }
              };
            }
            return item;
          }));
        }
      } catch (e) {
        console.error(`Error fetch creator ${id}:`, e);
        cacheRef.current[id] = false;
      } finally {
        pendingCreatorFetch.current.delete(id);
      }
    }
  };

  // ============ RESET AND LOAD ============
  const resetAndLoad = () => {
    // Reset semua state
    setData([]);
    setCurrentPage(1);
    setHasMore(true);
    setLoading(true);
    initialLoadDoneRef.current = false;
    isFetchingRef.current = false;
    
    // Cancel pending fetches
    pendingCreatorFetch.current.clear();
    
    // Load ulang
    loadInitialData();
  };

  // ============ MEMOIZED ============
  const flashSaleProduct = useMemo(() => {
    return data.filter(e => e.add_to_flash_sale);
  }, [data]);

  const uniqueCreators = useMemo(() => {
    const creators = new Map();
    data.forEach(item => {
      if (item.creator?.id && item.creator?.name) {
        creators.set(item.creator.id, {
          id: item.creator.id,
          name: item.creator.name
        });
      }
    });
    return Array.from(creators.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return uniqueCreators;
    return uniqueCreators.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueCreators, searchQuery]);

  const filteredData = useMemo(() => {
    if (!selectedCreator) return data;
    return data.filter(item => item.creator?.id === parseInt(selectedCreator));
  }, [data, selectedCreator]);

  // ============ BOOKMARK HANDLERS ============
  const toggleBookmark = async (productId: number) => {
    if (!isLoggedIn) {
      toast.error("Silakan login untuk menyimpan bookmark");
      return;
    }

    const isBookmarked = bookmarkedIds.has(productId);
    const existingBookmark = users?.bookmarked?.find((e: any) => 
      (e.product_id === productId || e.event_id === productId) && 
      (e.type === "Merchandise" || e.module_id === 2)
    );

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
          const data = JSON.parse(Cookies.get("bookmarked") ?? "[]");
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
        const existingBookmark = users?.bookmarked?.find((e: any) => 
          (e.product_id === productId || e.event_id === productId) && 
          (e.type === "Merchandise" || e.module_id === 2)
        );
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
          const data = JSON.parse(Cookies.get("bookmarked") ?? "[]");
          Cookies.set("bookmarked", JSON.stringify(data.filter((e: any) => 
            e.id !== idToDelete && !(e.product_id === productId && (e.type === "Merchandise" || e.module_id === 2))
          )));
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

  // ============ HANDLER FILTER ============
  const handleSelectCreator = (creatorId: string | null) => {
    setSelectedCreator(creatorId);
    close();
    setSearchQuery("");
  };

  // ============ RENDER ============
  return (
    <div className="py-10 md:pt-12 max-w-5xl mx-auto text-dark">
      {/* LOADING INITIAL */}
      {loading && (
        <Center className="min-h-[50vh] flex-col gap-4">
          <Loader size="lg" />
          <span className="text-lg font-medium">Memuat merchandise...</span>
        </Center>
      )}

      {/* DATA LOADED */}
      {!loading && (
        <>
          {/* FLASH SALE SECTION */}
          {flashSaleProduct.length > 0 && (
            <>
              <Text px={20} size="xl" fw={600} className="mb-2">
                🔥 Flash Sale
              </Text>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-[20px] mb-8">
                {flashSaleProduct.map((item) => (
                  <MerchandiseCard
                    key={`flash-${item.id}`}
                    id={item.id}
                    name={item.product_name}
                    price={parseInt(item.product_varian?.[0]?.price || item.price || "0")}
                    sale={0}
                    creator={item.creator?.name || "Unknown"}
                    creatorid={item.creator?.id}
                    creatorImage={item.creator?.image_url}
                    redirect={`/merchandise/${item.slug}`}
                    image={item.product_image?.[0]?.image_url}
                    location={item.has_store_location?.store_name}
                    isBookmarked={bookmarkedIds.has(item.id)}
                    onBookmarkToggle={toggleBookmark}
                    showBookmark={isLoggedIn}
                    isVerified={cacheRef.current[item.creator?.id] || item.creator?.is_verified === 1 || item.creator?.is_verified === true}
                  />
                ))}
              </div>
            </>
          )}

          {/* FILTER MOBILE */}
          <div className="px-[20px] mb-4 md:hidden">
            <div className="flex items-center justify-between">
              <Text size="xl" fw={600}>
                Semua Merchandise
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredData.length})
                </span>
              </Text>
              {uniqueCreators.length > 0 && (
                <ActionIcon variant="light" color="blue" size="lg" onClick={open}>
                  <FontAwesomeIcon icon={faFilter} />
                </ActionIcon>
              )}
            </div>
            {selectedCreator && (
              <div className="mt-2 flex items-center justify-between">
                <Badge color="blue" variant="light" size="lg">
                  {uniqueCreators.find(c => c.id.toString() === selectedCreator)?.name}
                  <span className="ml-1 text-xs">({filteredData.length})</span>
                </Badge>
                <Button variant="subtle" size="xs" onClick={() => setSelectedCreator(null)} color="red">
                  Hapus
                </Button>
              </div>
            )}
          </div>

          {/* MODAL FILTER */}
          <Modal
            opened={opened}
            onClose={close}
            title={<Text fw={600}>Filter Creator</Text>}
            centered
            size="sm"
            className="md:hidden"
            radius="md"
          >
            <div className="space-y-4">
              <TextInput
                placeholder="Cari creator..."
                leftSection={<FontAwesomeIcon icon={faSearch} size="sm" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
              <Divider />
              <div className="max-h-[60vh] overflow-y-auto">
                <Button
                  fullWidth
                  variant={!selectedCreator ? "filled" : "light"}
                  color={!selectedCreator ? "blue" : "gray"}
                  onClick={() => handleSelectCreator(null)}
                  className="justify-start mb-1"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Semua Creator</span>
                    <Badge color="gray" variant="light" size="sm">
                      {data.length}
                    </Badge>
                  </div>
                </Button>
                
                {filteredCreators.map((creator) => {
                  const count = data.filter(item => item.creator?.id === creator.id).length;
                  return (
                    <Button
                      key={creator.id}
                      fullWidth
                      variant={selectedCreator === creator.id.toString() ? "filled" : "light"}
                      color={selectedCreator === creator.id.toString() ? "blue" : "gray"}
                      onClick={() => handleSelectCreator(creator.id.toString())}
                      className="justify-start mb-1"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{creator.name}</span>
                        <Badge color="gray" variant="light" size="sm">
                          {count}
                        </Badge>
                      </div>
                    </Button>
                  );
                })}
              </div>
              <Button fullWidth onClick={close} variant="light">
                Tutup
              </Button>
            </div>
          </Modal>

          {/* DESKTOP TITLE */}
          <div className="hidden md:flex md:px-[20px] md:mb-4 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Text size="xl" fw={600}>
                Semua Merchandise
              </Text>
              <Badge size="lg" variant="dot" color="blue">
                {filteredData.length} item
              </Badge>
            </div>
            {selectedCreator && (
              <Button variant="subtle" size="xs" onClick={() => setSelectedCreator(null)} color="red">
                Hapus Filter: {uniqueCreators.find(c => c.id.toString() === selectedCreator)?.name}
              </Button>
            )}
          </div>

          {/* GRID PRODUCT */}
          {filteredData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 px-[20px]">
                {filteredData.map((item, index) => (
                  <MerchandiseCard
                    key={`merch-${item.id}-${index}`}
                    id={item.id}
                    name={item.product_name}
                    price={parseInt(item.product_varian?.[0]?.price || item.price || "0")}
                    sale={0}
                    creator={item.creator?.name || "Unknown"}
                    creatorid={item.creator?.id}
                    creatorImage={item.creator?.image_url}
                    redirect={`/merchandise/${item.slug}`}
                    image={item.product_image?.[0]?.image_url}
                    location={item.has_store_location?.store_name}
                    isBookmarked={bookmarkedIds.has(item.id)}
                    onBookmarkToggle={toggleBookmark}
                    showBookmark={isLoggedIn}
                    productVariants={item.product_varian as any[]}
                    isVerified={cacheRef.current[item.creator?.id] || item.creator?.is_verified === 1 || item.creator?.is_verified === true}
                  />
                ))}
              </div>

              {/* INFINITE SCROLL TRIGGER */}
              {hasMore && (
                <div ref={loadingRef} className="w-full py-8 flex justify-center">
                  {loadingMore ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader size="sm" />
                      <span className="text-sm text-gray-500">
                        Memuat halaman {currentPage + 1} dari {totalPages}...
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Scroll untuk memuat lebih banyak</span>
                  )}
                </div>
              )}
            </>
          ) : (
            <Center className="min-h-[60vh] flex-col gap-4">
              <FontAwesomeIcon icon={faCartShopping} size="3x" className="text-gray-300" />
              <h3 className="text-xl font-medium text-gray-500">Belum ada merchandise</h3>
              {selectedCreator && (
                <Button variant="light" color="red" onClick={() => setSelectedCreator(null)}>
                  Hapus Filter
                </Button>
              )}
            </Center>
          )}
        </>
      )}
    </div>
  );
};

export default Merchandise;