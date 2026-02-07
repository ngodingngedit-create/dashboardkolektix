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
import { faCartShopping, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { MerchListResponse } from "../dashboard/merch/type";
import { Text, Loader, Center } from "@mantine/core";
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

const Merchandise = () => {
  const [categoryActive, setCategoryActive] = useState<string>();
  const [data, setData] = useState<MerchListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  const users = useLoggedUser();
  const isLoggedIn = !!users?.name;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const getData = useCallback(
    async (pageNum: number = 1, isLoadMore: boolean = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        console.log(`Fetching page ${pageNum} with limit 10...`);

        const res = (await Get("product", {
          page: pageNum,
          limit: 10,
        })) as any;

        console.log("API Response:", res);

        console.log("Response structure:", {
          data: res.data,
          hasDataProperty: res.hasOwnProperty("data"),
          isArray: Array.isArray(res.data),
          keys: Object.keys(res),
          meta: res.meta,
        });

        let apiData: ApiResponse;
        let filteredData: MerchListResponse[];
        let totalItems: number;
        let lastPage: number;

        if (Array.isArray(res.data)) {
          filteredData = res.data.filter((e: MerchListResponse) => e.product_status_id == 2);
          apiData = { data: res.data };
          totalItems = res.total || res.data.length;
          lastPage = res.last_page || Math.ceil(totalItems / 10);
        } else if (res.data && Array.isArray(res.data.data)) {
          filteredData = res.data.data.filter((e: MerchListResponse) => e.product_status_id == 2);
          apiData = res.data;
          totalItems = res.data.total || res.data.data.length;
          lastPage = res.data.last_page || Math.ceil(totalItems / 10);
        } else if (Array.isArray(res)) {
          filteredData = res.filter((e: MerchListResponse) => e.product_status_id == 2);
          apiData = { data: res };
          totalItems = res.length;
          lastPage = Math.ceil(totalItems / 10);
        } else {
          console.error("Unexpected API response structure:", res);
          filteredData = [];
          totalItems = 0;
          lastPage = 1;
        }

        if (isLoadMore) {
          setData((prev) => [...prev, ...filteredData]);
        } else {
          setData(filteredData);
        }

        setTotal(totalItems);
        setHasMore(pageNum < lastPage);

        console.log(`Loaded ${filteredData.length} items, total: ${totalItems}, hasMore: ${pageNum < lastPage}`);

        if (users?.bookmarked) {
          const merchandiseBookmarks = users.bookmarked.filter((e: any) => e.type === "Merchandise" || e.module_id === 2);
          const bookmarkedProductIds = merchandiseBookmarks.map((item) => item.product_id || item.event_id || item.id);
          setBookmarkedIds(new Set(bookmarkedProductIds));
        }
      } catch (err: any) {
        console.error("Error fetching merchandise:", err);

        if (err.response) {
          console.error("Error response:", err.response.data);
          console.error("Error status:", err.response.status);
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Error message:", err.message);
        }

        if (!isLoadMore) {
          try {
            console.log("Trying fallback fetch without pagination...");
            const fallbackRes = (await Get("product", {})) as any;
            let fallbackData: MerchListResponse[] = [];

            if (Array.isArray(fallbackRes.data)) {
              fallbackData = fallbackRes.data.filter((e: MerchListResponse) => e.product_status_id == 2);
            } else if (fallbackRes.data && Array.isArray(fallbackRes.data.data)) {
              fallbackData = fallbackRes.data.data.filter((e: MerchListResponse) => e.product_status_id == 2);
            } else if (Array.isArray(fallbackRes)) {
              fallbackData = fallbackRes.filter((e: MerchListResponse) => e.product_status_id == 2);
            }

            setData(fallbackData);
            setHasMore(false);
            console.log(`Fallback loaded ${fallbackData.length} items`);
          } catch (fallbackErr) {
            console.error("Fallback also failed:", fallbackErr);
          }
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [users?.bookmarked],
  );

  useEffect(() => {
    getData(1, false);
  }, [getData]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          getData(nextPage, true);
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, page, getData]);

  useEffect(() => {
    if (users?.bookmarked) {
      const merchandiseBookmarks = users.bookmarked.filter((e: any) => e.type === "Merchandise" || e.module_id === 2);
      const bookmarkedProductIds = merchandiseBookmarks.map((item) => item.product_id || item.event_id || item.id);
      setBookmarkedIds(new Set(bookmarkedProductIds));
    } else {
      setBookmarkedIds(new Set());
    }
  }, [users]);

  const flashSaleProduct = useMemo(() => {
    return data.filter((e) => e.add_to_flash_sale);
  }, [data]);

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

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      getData(nextPage, true);
    }
  };

  const category = ["Merchandise", "Merchandise 2", "Merchandise 3", "Merchandise 4"];

  return (
    <div className="py-10 md:pt-12 max-w-5xl mx-auto text-dark !mt-[0px] md:mt-0">
      {/* <div className="pl-7">
        <Breadcrumbs>
          <BreadcrumbItem>Beranda</BreadcrumbItem>
          <BreadcrumbItem>List Merchandise</BreadcrumbItem>
        </Breadcrumbs>
      </div> */}

      {loading && !loadingMore ? (
        <Center className="min-h-[50vh]">
          <Loader size="lg" />
          <span className="ml-2">Memuat merchandise...</span>
        </Center>
      ) : (
        <>
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
                  />
                ))}
              </div>
            </>
          )}

          <Text px={20} mt={15} size="xl" mb={-10} fw={600}>
            Semua Merchandise
          </Text>

          {data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-[10px] md:gap-[15px] my-5 px-[20px]">
                {data.map((item, index) => (
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
                  />
                ))}
              </div>

              <div ref={loadMoreRef} className="py-6 text-center">
                {loadingMore && (
                  <Center>
                    <Loader size="sm" />
                    <span className="ml-2">Memuat merchandise...</span>
                  </Center>
                )}

                {!loadingMore && hasMore && data.length > 0 && (
                  <div className="space-y-4">
                    <button onClick={handleLoadMore} className="mt-4 px-6 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Muat Lebih Banyak
                    </button>
                    <p className="text-sm text-gray-500">Scroll ke bawah untuk memuat otomatis</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="min-h-[80vh] flex flex-col gap-3 items-center justify-center">
              <FontAwesomeIcon icon={faCartShopping} size="2x" className="text-primary-base" />
              <h3 className="text-grey">Belum ada merchandise</h3>
              <button onClick={() => getData(1, false)} className="mt-4 px-4 py-2 bg-primary-base text-white rounded hover:bg-primary-dark transition-colors">
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