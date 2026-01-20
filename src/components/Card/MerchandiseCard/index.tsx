// // MerchandiseCard.tsx
// import Foto from "@images/Foto=2.png";
// import Image from "next/image";
// import { useState } from "react";
// import styles from "./index.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBookmark as bookmarkRegular } from "@fortawesome/free-regular-svg-icons";
// import { faBookmark as bookmarkSolid, faStar as starSolid, faCalendar, faLocationDot, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
// import Link from "next/link";
// import { NumberFormatter } from "@mantine/core";
// import { toast } from "react-toastify";

// interface MerchCardProps {
//   id: number; // Added id prop
//   name: string;
//   price: number;
//   sale: number;
//   creator: string;
//   creatorid?: number;
//   creatorImage?: string;
//   redirect: string;
//   image?: string;
//   location: string;
//   date?: string;
//   isBookmarked?: boolean; // New prop
//   onBookmarkToggle?: (id: number) => void; // New prop
//   showBookmark?: boolean; // New prop - kontrol visibility
// }

// const MerchandiseCard = ({
//   id,
//   name,
//   price,
//   sale,
//   creator,
//   creatorid,
//   creatorImage,
//   redirect,
//   image,
//   location,
//   date,
//   isBookmarked = false,
//   onBookmarkToggle,
//   showBookmark = false,
// }: MerchCardProps) => {
//   const [bookmark, setBookmark] = useState<boolean>(isBookmarked);
//   const [showBuyButton, setShowBuyButton] = useState<boolean>(false);
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);

//   // Sync dengan prop isBookmarked
//   useState(() => {
//     setBookmark(isBookmarked);
//   });

//   const handleBookmarkClick = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (isProcessing) return;

//     if (!showBookmark) {
//       toast.error("Silakan login untuk menyimpan bookmark");
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       // Update state lokal dulu untuk feedback instan
//       const newBookmarkState = !bookmark;
//       setBookmark(newBookmarkState);

//       // Panggil callback dari parent
//       if (onBookmarkToggle) {
//         await onBookmarkToggle(id);
//       }
//     } catch (error) {
//       // Rollback state jika gagal
//       setBookmark(!bookmark);
//       console.error("Error toggling bookmark:", error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleBuyClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     console.log("Beli merchandise:", name);
//     window.location.href = redirect;
//   };

//   // Format harga ke format Indonesia
//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat("id-ID", {
//       style: "currency",
//       currency: "IDR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(price);
//   };

//   return (
//     <Link
//       href={redirect}
//       className="bg-white rounded-lg border border-primary-light-200 shadow-md w-full relative block hover:shadow-lg transition-shadow duration-300"
//       onMouseEnter={() => setShowBuyButton(true)}
//       onMouseLeave={() => setShowBuyButton(false)}
//     >
//       {/* Bagian Gambar dengan Bookmark Button */}
//       <div className="relative overflow-hidden rounded-t-lg">
//         <Image
//           className={`${styles.cardImg} w-full h-48 object-cover transition-transform duration-300 ${showBuyButton ? "scale-105" : ""}`}
//           src={image ?? Foto}
//           width={500}
//           height={500}
//           alt={name}
//         />

//         {/* Bookmark Button - hanya muncul jika showBookmark true */}
//         {showBookmark && (
//           <button
//             onClick={handleBookmarkClick}
//             disabled={isProcessing}
//             className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 z-10
//               ${bookmark
//                 ? 'bg-primary-100 text-primary-500 hover:bg-primary-200'
//                 : 'bg-white/80 hover:bg-white text-gray-600'
//               }
//               ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
//             `}
//             aria-label={bookmark ? "Hapus bookmark" : "Tambahkan bookmark"}
//           >
//             <FontAwesomeIcon
//               icon={bookmark ? bookmarkSolid : bookmarkRegular}
//               className={bookmark ? "text-primary-500" : "text-gray-600"}
//               size="lg"
//             />
//           </button>
//         )}

//         {/* Tombol Beli - muncul saat hover dengan teks "Add to Cart" */}
//         <button
//           onClick={handleBuyClick}
//           className={`absolute bottom-3 right-3
//             bg-white/20 hover:bg-white/30
//             backdrop-blur-md
//             text-white
//             rounded-lg font-semibold text-xs
//             transition-all duration-300 transform
//             ${showBuyButton ? "translate-y-0 opacity-100 scale-100 px-4 py-2" : "translate-y-4 opacity-0 scale-95 px-3 py-2"}
//             flex items-center gap-2
//             shadow-lg
//             border border-white/30
//             z-10
//             whitespace-nowrap`}
//         >
//           <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
//           {showBuyButton && <span className="font-medium">Add to Cart</span>}
//         </button>
//       </div>

//       {/* Bagian Konten */}
//       <div className="p-3">
//         {/* Nama Merchandise */}
//         <h3 className="text-dark font-bold text-sm mb-2 line-clamp-2">{name}</h3>

//         {/* Rating dan Lokasi */}
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center gap-3">
//             {/* Lokasi */}
//             <div className="flex items-center">
//               <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 text-xs mr-1" />
//               <span className="text-gray-600 text-xs truncate max-w-[120px]">{location}</span>
//             </div>
//           </div>

//           {/* Tanggal (jika ada) */}
//           {date && (
//             <div className="flex items-center text-gray-500 text-xs">
//               <FontAwesomeIcon icon={faCalendar} className="mr-1" />
//               {date}
//             </div>
//           )}
//         </div>

//         {/* Creator dan Harga */}
//         <div className="pt-2 border-t border-blue-100 border-dashed flex items-center justify-between">
//           {/* Bagian Kiri: Creator Info */}
//           <Link
//             href={`/creator/${creatorid || creator}`}
//             className="flex items-center gap-2 flex-1 min-w-0"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <Image
//               src={creatorImage ?? "/default-avatar.png"}
//               alt={`${creator} logo`}
//               className="h-7 w-7 rounded-full object-cover flex-shrink-0"
//               height={28}
//               width={28}
//             />
//             <div className="min-w-0">
//               <p className="text-gray-500 text-[8px] leading-tight">Disediakan oleh</p>
//               <p className="text-dark font-semibold text-xs truncate">{creator}</p>
//             </div>
//           </Link>

//           {/* Bagian Kanan: Harga */}
//           <div className="text-right ml-2 flex-shrink-0">
//             <div className="text-dark font-bold text-sm">{formatPrice(price)}</div>
//             {sale > 0 && (
//               <div className="text-gray-400 text-[10px] line-through">
//                 {formatPrice(price + (price * sale) / 100)}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default MerchandiseCard;

// MerchandiseCard.tsx
/// MerchandiseCard.tsx
import Foto from "@images/Foto=2.png";
import Image, { StaticImageData } from "next/image";
import { useState, useContext } from "react";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as bookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as bookmarkSolid, faStar as starSolid, faCalendar, faLocationDot, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { NumberFormatter } from "@mantine/core";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import _ from "lodash";
import { AppMainContext } from "@/pages/_app"; // Sesuaikan path
import { notifications } from "@mantine/notifications";

interface MerchCardProps {
  id: number; // ID merchandise
  name: string;
  price: number;
  sale: number;
  creator: string;
  creatorid?: number;
  creatorImage?: string | StaticImageData;
  redirect: string; // URL untuk detail produk
  image?: string | StaticImageData;
  location: string;
  date?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: number) => void;
  showBookmark?: boolean;
  // Props baru untuk Add to Cart
  variantId?: number; // ID varian (jika ada)
  stock?: number; // Stok tersedia
  variantName?: string; // Nama varian
  categoryName?: string; // Nama kategori varian
}

interface CartStorage {
  variant_id: number;
  product_id: number;
  qty: number;
  price: number;
  product_name?: string;
  image_url?: string;
  varian_name?: string;
}

const MerchandiseCard = ({
  id,
  name,
  price,
  sale,
  creator,
  creatorid,
  creatorImage,
  redirect,
  image,
  location,
  date,
  isBookmarked = false,
  onBookmarkToggle,
  showBookmark = false,
  variantId = 0,
  stock = 1,
  variantName = "",
  categoryName = "",
}: MerchCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(isBookmarked);
  const [showBuyButton, setShowBuyButton] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const router = useRouter();
  const { setCartCount } = useContext(AppMainContext);

  // Fungsi untuk mendapatkan URL gambar sebagai string
  const getImageUrl = (img: string | StaticImageData | undefined): string => {
    if (!img) return "/default-image.jpg";
    if (typeof img === "string") return img;
    return img.src; // Untuk StaticImageData
  };

  // Fungsi untuk mendapatkan creator image URL
  const getCreatorImageUrl = (img: string | StaticImageData | undefined): string => {
    if (!img) return "/default-avatar.png";
    if (typeof img === "string") return img;
    return img.src;
  };

  // Sync dengan prop isBookmarked
  useState(() => {
    setBookmark(isBookmarked);
  });

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return;

    if (!showBookmark) {
      toast.error("Silakan login untuk menyimpan bookmark");
      return;
    }

    setIsProcessing(true);
    try {
      const newBookmarkState = !bookmark;
      setBookmark(newBookmarkState);

      if (onBookmarkToggle) {
        await onBookmarkToggle(id);
      }
    } catch (error) {
      setBookmark(!bookmark);
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Beli merchandise:", name);
    window.location.href = redirect;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      // Cek stok jika ada
      if (stock <= 0) {
        toast.error("Stok habis!");
        setIsAddingToCart(false);
        return;
      }

      // LOGIC ADD TO CART SAMA DENGAN HALAMAN DETAIL
      const cartData = JSON.parse(Cookies.get("_cart") ?? "[]") as CartStorage[];
      const has = cartData.find((e) => e.product_id == id && (e.variant_id ? e.variant_id == variantId : true));

      // Default quantity = 1 (sama seperti di detail)
      const added = has ? has?.qty + 1 : 1;

      // Cek tidak melebihi stok
      if (added > stock) {
        toast.error(`Stok hanya tersedia ${stock} pcs`);
        setIsAddingToCart(false);
        return;
      }

      if (has) {
        cartData.forEach((e, index) => {
          if (e.product_id == id && (e.variant_id ? e.variant_id == variantId : true)) {
            cartData[index] = {
              ...e,
              qty: added,
              product_name: name,
              image_url: getImageUrl(image),
              varian_name: variantName,
            };
          }
        });
      } else {
        cartData.push({
          variant_id: variantId,
          product_id: id,
          qty: 1, // Default 1 pcs
          price: price,
          product_name: name,
          image_url: getImageUrl(image),
          varian_name: variantName,
        });
      }

      // Update cart count di context
      const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);
      if (setCartCount) {
        setCartCount(newCartCount);
      }

      // Simpan ke cookies
      Cookies.set("_cart", JSON.stringify(cartData));

      // Show notification (sama seperti di detail)
      notifications.show({
        color: "green",
        position: "top-right",
        message: `Berhasil menambahkan ${name} ke keranjang`,
      });

      // Tidak redirect ke merch-cart, tetap di halaman yang sama
      // Bisa tambahkan efek visual feedback
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Terjadi kesalahan saat menambahkan ke keranjang");
      setIsAddingToCart(false);
    }
  };

  // Format harga ke format Indonesia
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const finalPrice = sale > 0 ? price : price;
  const originalPrice = sale > 0 ? price + (price * sale) / 100 : null;

  return (
    <Link
      href={redirect}
      className="bg-white rounded-lg border border-primary-light-200 shadow-md w-full relative block hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={() => setShowBuyButton(true)}
      onMouseLeave={() => setShowBuyButton(false)}
    >
      {/* Bagian Gambar dengan Bookmark Button */}
      <div className="relative overflow-hidden rounded-t-lg">
        <Image className={`${styles.cardImg} w-full h-48 object-cover transition-transform duration-300 ${showBuyButton ? "scale-105" : ""}`} src={image ?? Foto} width={500} height={500} alt={name} />

        {/* Bookmark Button - hanya muncul jika showBookmark true */}
        {showBookmark && (
          <button
            onClick={handleBookmarkClick}
            disabled={isProcessing}
            className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 z-10
              ${bookmark ? "bg-primary-100 text-primary-500 hover:bg-primary-200" : "bg-white/80 hover:bg-white text-gray-600"}
              ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
            `}
            aria-label={bookmark ? "Hapus bookmark" : "Tambahkan bookmark"}
          >
            <FontAwesomeIcon icon={bookmark ? bookmarkSolid : bookmarkRegular} className={bookmark ? "text-primary-500" : "text-gray-600"} size="lg" />
          </button>
        )}

        {/* Tombol Add to Cart - muncul saat hover */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || stock <= 0}
          className={`absolute bottom-3 right-3 
            ${stock <= 0 ? "bg-gray-400/50 cursor-not-allowed" : isAddingToCart ? "bg-green-500/80 hover:bg-green-500/90" : "bg-white/20 hover:bg-white/30"}
            backdrop-blur-md
            text-white
            rounded-lg font-semibold text-xs
            transition-all duration-300 transform
            ${showBuyButton ? "translate-y-0 opacity-100 scale-100 px-4 py-2" : "translate-y-4 opacity-0 scale-95 px-3 py-2"}
            flex items-center gap-2
            shadow-lg
            border ${stock <= 0 ? "border-gray-400/30" : isAddingToCart ? "border-green-400/50" : "border-white/30"}
            z-10
            whitespace-nowrap
            ${isAddingToCart ? "cursor-wait" : ""}`}
        >
          <FontAwesomeIcon icon={faShoppingCart} className={`text-sm ${isAddingToCart ? "animate-pulse" : ""}`} />
          {showBuyButton && <span className="font-medium">{isAddingToCart ? "✓ Berhasil" : stock <= 0 ? "Stok Habis" : "Add to Cart"}</span>}
        </button>

        {/* Badge Sale */}
        {sale > 0 && <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">-{sale}%</div>}

        {/* Badge Stok Habis */}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-5">
            <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">Stok Habis</span>
          </div>
        )}
      </div>

      {/* Bagian Konten */}
      <div className="p-3">
        {/* Nama Merchandise */}
        <h3 className="text-dark font-bold text-sm mb-2 line-clamp-2">{name}</h3>

        {/* Info Varian jika ada */}
        {variantName && (
          <div className="mb-2">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
              {categoryName}: {variantName}
            </span>
          </div>
        )}

        {/* Rating dan Lokasi */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Lokasi */}
            <div className="flex items-center">
              <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 text-xs mr-1" />
              <span className="text-gray-600 text-xs truncate max-w-[120px]">{location}</span>
            </div>
          </div>

          {/* Tanggal (jika ada) */}
          {date && (
            <div className="flex items-center text-gray-500 text-xs">
              <FontAwesomeIcon icon={faCalendar} className="mr-1" />
              {date}
            </div>
          )}
        </div>

        {/* Creator dan Harga */}
        <div className="pt-2 border-t border-blue-100 border-dashed flex items-center justify-between">
          {/* Bagian Kiri: Creator Info */}
          <Link href={`/creator/${creatorid || creator}`} className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <Image src={creatorImage ? getCreatorImageUrl(creatorImage) : "/default-avatar.png"} alt={`${creator} logo`} className="h-7 w-7 rounded-full object-cover flex-shrink-0" height={28} width={28} />
            <div className="min-w-0">
              <p className="text-gray-500 text-[8px] leading-tight">Disediakan oleh</p>
              <p className="text-dark font-semibold text-xs truncate">{creator}</p>
            </div>
          </Link>

          {/* Bagian Kanan: Harga */}
          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-dark font-bold text-sm">{formatPrice(finalPrice)}</div>
            {originalPrice && <div className="text-gray-400 text-[10px] line-through">{formatPrice(originalPrice)}</div>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MerchandiseCard;
