import { useEffect, useMemo, useState } from "react";
import { MerchProps } from "@/utils/globalInterface";
import MerchandiseCard from "@/components/Card/MerchandiseCard";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { Get } from "@/utils/REST";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { MerchListResponse } from "../dashboard/merch/type";
import { Text } from "@mantine/core";
import useLoggedUser from "@/utils/useLoggedUser";
import { BookmarkListResponse } from "@/types/bookmark";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { modals } from "@mantine/modals";
import fetch from "@/utils/fetch"; // Import fetch yang benar
import { BookmarkRequest } from "@/types/bookmark"; // Import tipe BookmarkRequest jika ada

const Merchandise = () => {
  const [categoryActive, setCategoryActive] = useState<string>();
  const [data, setData] = useState<MerchListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  
  const users = useLoggedUser();
  const isLoggedIn = !!users?.name;
  
  const getData = () => {
    setLoading(true);
    Get("product", {})
      .then((res: any) => {
        const filteredData = (res.data as MerchListResponse[]).filter((e) => e.product_status_id == 2);
        setData(filteredData);
        console.log(res.data);
        
        // Load bookmarks from user data
        if (users?.bookmarked) {
          const merchandiseBookmarks = users.bookmarked.filter(
            (e: any) => e.type === "Merchandise" || e.module_id === 2
          );
          const bookmarkedProductIds = merchandiseBookmarks.map(item => item.product_id || item.event_id || item.id);
          setBookmarkedIds(new Set(bookmarkedProductIds));
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const flashSaleProduct = useMemo(() => {
    return data.filter((e) => e.add_to_flash_sale);
  }, [data]);

  useEffect(() => {
    getData();
  }, []);

  // Update bookmarks when user data changes
  useEffect(() => {
    if (users?.bookmarked) {
      const merchandiseBookmarks = users.bookmarked.filter(
        (e: any) => e.type === "Merchandise" || e.module_id === 2
      );
      const bookmarkedProductIds = merchandiseBookmarks.map(item => item.product_id || item.event_id || item.id);
      setBookmarkedIds(new Set(bookmarkedProductIds));
    } else {
      setBookmarkedIds(new Set());
    }
  }, [users]);

  const toggleBookmark = async (productId: number) => {
    if (!isLoggedIn) {
      toast.error("Silakan login untuk menyimpan bookmark");
      // Optional: Redirect to login
      // window.location.href = "/login";
      return;
    }

    const isBookmarked = bookmarkedIds.has(productId);
    const existingBookmark = users?.bookmarked?.find(
      (e: any) => (e.product_id === productId || e.event_id === productId) && 
                 (e.type === "Merchandise" || e.module_id === 2)
    );

    if (isBookmarked || existingBookmark) {
      // Show confirmation modal for removal
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
          module_id: 2, // 2 untuk merchandise (1 untuk event)
          type: "Merchandise",
          product_id: productId,
        } as BookmarkRequest,
        success: (response) => {
          // Update local state
          setBookmarkedIds(prev => new Set(prev).add(productId));
          
          // Update cookies
          const data = JSON.parse(Cookies.get("bookmarked") ?? "[]") as BookmarkListResponse[];
          Cookies.set("bookmarked", JSON.stringify([...data, response.data]));
          
          toast.success("Berhasil menambahkan ke bookmark");
        },
        error: () => {
          toast.error("Gagal menambahkan bookmark");
        }
      });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast.error("Gagal menambahkan bookmark");
    }
  };

  const handleRemoveBookmark = async (productId: number, bookmarkId?: number) => {
    try {
      // Cari bookmark ID jika tidak tersedia
      let idToDelete = bookmarkId;
      if (!idToDelete) {
        const existingBookmark = users?.bookmarked?.find(
          (e: any) => (e.product_id === productId || e.event_id === productId) && 
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
          // Update local state
          setBookmarkedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });

          // Update cookies
          const data = JSON.parse(Cookies.get("bookmarked") ?? "[]") as BookmarkListResponse[];
          Cookies.set("bookmarked", JSON.stringify(data.filter((e: any) => 
            e.id !== idToDelete && 
            !(e.product_id === productId && (e.type === "Merchandise" || e.module_id === 2))
          )));

          toast.success("Berhasil menghapus dari bookmark");
        },
        error: () => {
          toast.error("Gagal menghapus bookmark");
        }
      });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Gagal menghapus bookmark");
    }
  };

  const category = ["Merchandise", "Merchandise 2", "Merchandise 3", "Merchandise 4"];

  return (
    <div className="py-10 md:pt-12 max-w-5xl mx-auto text-dark !mt-[0px] md:mt-0">
      <div className="pl-7">
        <Breadcrumbs>
          <BreadcrumbItem>Beranda</BreadcrumbItem>
          <BreadcrumbItem>List Merchandise</BreadcrumbItem>
        </Breadcrumbs>
      </div>

      {flashSaleProduct.length > 0 && (
        <>
          <Text px={20} mt={15} size="xl" mb={-10} fw={600}>
            Flash Sale
          </Text>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 content-center justify-items-center gap-[10px] md:gap-[15px] my-5 px-[20px]">
            {flashSaleProduct.map((item) => (
              <MerchandiseCard
                key={item.id}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-[10px] md:gap-[15px] my-5 px-[20px]">
          {data.map((item) => (
            <MerchandiseCard
              key={item.id}
              id={item.id}
              name={item.product_name}
              price={parseInt((item?.product_varian?.length ?? 0) > 0 ? item.product_varian[0].price ?? 0 : item.price ?? 0)}
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
            />
          ))}
        </div>
      ) : (
        <div className="min-h-[80vh] flex flex-col gap-3 items-center justify-center">
          <FontAwesomeIcon icon={faCartShopping} size="2x" className="text-primary-base" />
          <h3 className="text-grey">Belum ada merchandise</h3>
        </div>
      )}
    </div>
  );
};

export default Merchandise;