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
// MerchandiseCard.tsx - Versi dengan modal varian
// import Foto from "@images/Foto=2.png";
// import Image, { StaticImageData } from "next/image";
// import { useState, useContext, useEffect } from "react";
// import styles from "./index.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBookmark as bookmarkRegular } from "@fortawesome/free-regular-svg-icons";
// import { 
//   faBookmark as bookmarkSolid, 
//   faStar as starSolid, 
//   faCalendar, 
//   faLocationDot, 
//   faShoppingCart,
//   faTimes,
//   faChevronDown,
//   faCheckCircle
// } from "@fortawesome/free-solid-svg-icons";
// import Link from "next/link";
// import { NumberFormatter, Modal, Button, Select, Text } from "@mantine/core";
// import { toast } from "react-toastify";
// import { useRouter } from "next/navigation";
// import Cookies from "js-cookie";
// import _ from "lodash";
// import { AppMainContext } from "@/pages/_app";
// import { notifications } from "@mantine/notifications";

// interface MerchCardProps {
//   id: number;
//   name: string;
//   price: number;
//   sale: number;
//   creator: string;
//   creatorid?: number;
//   creatorImage?: string | StaticImageData;
//   redirect: string;
//   image?: string | StaticImageData;
//   location: string;
//   date?: string;
//   isBookmarked?: boolean;
//   onBookmarkToggle?: (id: number) => void;
//   showBookmark?: boolean;
//   // Props baru untuk varian
//   variantId?: number;
//   stock?: number;
//   variantName?: string;
//   categoryName?: string;
//   // Data varian lengkap untuk modal
//   productVariants?: Array<{
//     id: number;
//     varian_name: string;
//     price: string;
//     stock_qty: number;
//     product_varian_category?: {
//       varian_name: string;
//     };
//   }>;
//   // Prop untuk deskripsi produk
//   description?: string;
//   // Prop untuk nama store
//   storeName?: string;
//   // Prop untuk verified status creator - diisi dari API creator
//   isVerified?: boolean;
//   // Prop baru untuk memicu fetching data creator
//   fetchCreatorVerifiedStatus?: (creatorId: number) => Promise<boolean>;
// }

// interface CartStorage {
//   variant_id: number;
//   product_id: number;
//   qty: number;
//   price: number;
//   product_name?: string;
//   image_url?: string;
//   varian_name?: string;
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
//   variantId = 0,
//   stock = 1,
//   variantName = "",
//   categoryName = "",
//   productVariants = [],
//   description = "Deskripsi produk tidak tersedia",
//   storeName = "Warehouse Kita",
//   isVerified = false,
//   fetchCreatorVerifiedStatus,
// }: MerchCardProps) => {
//   const [bookmark, setBookmark] = useState<boolean>(isBookmarked);
//   const [showBuyButton, setShowBuyButton] = useState<boolean>(false);
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  
//   // State untuk modal varian
//   const [isVariantModalOpen, setIsVariantModalOpen] = useState<boolean>(false);
//   const [selectedVariant, setSelectedVariant] = useState<any>(null);
//   const [variantOptions, setVariantOptions] = useState<Array<{value: string, label: string}>>([]);
  
//   // State untuk verified status (dari API)
//   const [creatorVerified, setCreatorVerified] = useState<boolean>(isVerified);
  
//   const router = useRouter();
//   const { setCartCount } = useContext(AppMainContext);

//   // Sync bookmark dengan prop
//   useEffect(() => {
//     setBookmark(isBookmarked);
//   }, [isBookmarked]);

//   // Sync verified status dengan prop
//   useEffect(() => {
//     setCreatorVerified(isVerified);
//   }, [isVerified]);

//   // Fetch creator verified status jika creatorid ada dan fetch function tersedia
//   useEffect(() => {
//     const fetchVerifiedStatus = async () => {
//       if (creatorid && fetchCreatorVerifiedStatus && !creatorVerified) {
//         try {
//           const verified = await fetchCreatorVerifiedStatus(creatorid);
//           setCreatorVerified(verified);
//         } catch (error) {
//           console.error("Error fetching creator verified status:", error);
//           // Tetap false jika ada error
//           setCreatorVerified(false);
//         }
//       }
//     };

//     // Hanya fetch jika belum memiliki verified status dan creatorid tersedia
//     if (creatorid && !creatorVerified && fetchCreatorVerifiedStatus) {
//       fetchVerifiedStatus();
//     }
//   }, [creatorid, fetchCreatorVerifiedStatus, creatorVerified]);

//   // Setup variant options saat productVariants berubah
//   useEffect(() => {
//     if (productVariants && productVariants.length > 0) {
//       const options = productVariants.map((variant) => ({
//         value: variant.id.toString(),
//         label: `${variant.varian_name || "Varian"} - Rp ${parseInt(variant.price || "0").toLocaleString('id-ID')}`,
//       }));
//       setVariantOptions(options);
      
//       // Set varian pertama sebagai default
//       if (productVariants[0]) {
//         setSelectedVariant(productVariants[0]);
//       }
//     }
//   }, [productVariants]);

//   const getImageUrl = (img: string | StaticImageData | undefined): string => {
//     if (!img) return "/default-image.jpg";
//     if (typeof img === "string") return img;
//     return img.src;
//   };

//   const getCreatorImageUrl = (img: string | StaticImageData | undefined): string => {
//     if (!img) return "/default-avatar.png";
//     if (typeof img === "string") return img;
//     return img.src;
//   };

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
//       const newBookmarkState = !bookmark;
//       setBookmark(newBookmarkState);

//       if (onBookmarkToggle) {
//         await onBookmarkToggle(id);
//       }
//     } catch (error) {
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

//   const handleAddToCartClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
    
//     // Jika ada varian, buka modal pilihan varian
//     if (productVariants && productVariants.length > 0) {
//       setIsVariantModalOpen(true);
//     } else {
//       // Jika tidak ada varian, langsung tambah ke cart
//       addToCartDirect();
//     }
//   };

//   const addToCartDirect = async () => {
//     if (isAddingToCart) return;
    
//     setIsAddingToCart(true);

//     try {
//       // Cek stok jika ada
//       if (stock <= 0) {
//         toast.error("Stok habis!");
//         setIsAddingToCart(false);
//         return;
//       }

//       const cartData = JSON.parse(Cookies.get("_cart") ?? "[]") as CartStorage[];
//       const has = cartData.find((e) => e.product_id == id && (e.variant_id ? e.variant_id == variantId : true));
//       const added = has ? has?.qty + 1 : 1;

//       // Cek tidak melebihi stok
//       if (added > stock) {
//         toast.error(`Stok hanya tersedia ${stock} pcs`);
//         setIsAddingToCart(false);
//         return;
//       }

//       if (has) {
//         cartData.forEach((e, index) => {
//           if (e.product_id == id && (e.variant_id ? e.variant_id == variantId : true)) {
//             cartData[index] = {
//               ...e,
//               qty: added,
//               product_name: name,
//               image_url: getImageUrl(image),
//               varian_name: variantName,
//             };
//           }
//         });
//       } else {
//         cartData.push({
//           variant_id: variantId,
//           product_id: id,
//           qty: 1,
//           price: price,
//           product_name: name,
//           image_url: getImageUrl(image),
//           varian_name: variantName,
//         });
//       }

//       // Update cart count di context
//       const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);
//       if (setCartCount) {
//         setCartCount(newCartCount);
//       }

//       // Simpan ke cookies
//       Cookies.set("_cart", JSON.stringify(cartData));

//       // Show notification
//       notifications.show({
//         color: "green",
//         position: "top-right",
//         message: `Berhasil menambahkan ${name} ke keranjang`,
//       });

//       setTimeout(() => {
//         setIsAddingToCart(false);
//       }, 1000);
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       toast.error("Terjadi kesalahan saat menambahkan ke keranjang");
//       setIsAddingToCart(false);
//     }
//   };

//   const addToCartWithVariant = async () => {
//     if (!selectedVariant || isAddingToCart) return;
    
//     setIsAddingToCart(true);

//     try {
//       // Cek stok varian
//       if (selectedVariant.stock_qty <= 0) {
//         toast.error("Stok varian ini habis!");
//         setIsAddingToCart(false);
//         return;
//       }

//       const cartData = JSON.parse(Cookies.get("_cart") ?? "[]") as CartStorage[];
//       const has = cartData.find((e) => 
//         e.product_id == id && 
//         e.variant_id == selectedVariant.id
//       );
//       const added = has ? has?.qty + 1 : 1;

//       // Cek tidak melebihi stok varian
//       if (added > selectedVariant.stock_qty) {
//         toast.error(`Stok varian ini hanya tersedia ${selectedVariant.stock_qty} pcs`);
//         setIsAddingToCart(false);
//         return;
//       }

//       if (has) {
//         cartData.forEach((e, index) => {
//           if (e.product_id == id && e.variant_id == selectedVariant.id) {
//             cartData[index] = {
//               ...e,
//               qty: added,
//               product_name: name,
//               image_url: getImageUrl(image),
//               varian_name: selectedVariant.varian_name,
//             };
//           }
//         });
//       } else {
//         cartData.push({
//           variant_id: selectedVariant.id,
//           product_id: id,
//           qty: 1,
//           price: parseInt(selectedVariant.price || "0"),
//           product_name: name,
//           image_url: getImageUrl(image),
//           varian_name: selectedVariant.varian_name,
//         });
//       }

//       // Update cart count
//       const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);
//       if (setCartCount) {
//         setCartCount(newCartCount);
//       }

//       // Simpan ke cookies
//       Cookies.set("_cart", JSON.stringify(cartData));

//       // Show notification
//       notifications.show({
//         color: "green",
//         position: "top-right",
//         message: `Berhasil menambahkan ${name} (${selectedVariant.varian_name}) ke keranjang`,
//       });

//       // Tutup modal
//       setIsVariantModalOpen(false);
      
//       // Reset state setelah delay
//       setTimeout(() => {
//         setIsAddingToCart(false);
//       }, 1000);
//     } catch (error) {
//       console.error("Error adding to cart with variant:", error);
//       toast.error("Terjadi kesalahan saat menambahkan ke keranjang");
//       setIsAddingToCart(false);
//     }
//   };

//   const handleVariantChange = (value: string | null) => {
//     if (value && productVariants) {
//       const variant = productVariants.find(v => v.id.toString() === value);
//       if (variant) {
//         setSelectedVariant(variant);
//       }
//     }
//   };

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat("id-ID", {
//       style: "currency",
//       currency: "IDR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(price);
//   };

//   const finalPrice = sale > 0 ? price : price;
//   const originalPrice = sale > 0 ? price + (price * sale) / 100 : null;

//   const hasVariants = productVariants && productVariants.length > 0;

//   return (
//     <>
//       <Link
//         href={redirect}
//         className="bg-white rounded-lg border border-primary-light-200 shadow-md w-full relative block hover:shadow-lg transition-shadow duration-300"
//         onMouseEnter={() => setShowBuyButton(true)}
//         onMouseLeave={() => setShowBuyButton(false)}
//       >
//         {/* Bagian Gambar dengan Bookmark Button */}
//         <div className="relative overflow-hidden rounded-t-lg">
//           {/* Mobile: aspect ratio 1:1 */}
//           <div className="block md:hidden relative w-full pb-[100%]">
//             <Image 
//               className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
//               src={image ?? Foto} 
//               fill
//               sizes="(max-width: 768px) 50vw, 100vw"
//               alt={name}
//             />
//           </div>

//           {/* Desktop: aspect ratio yang konsisten dengan grid */}
//           <div className="hidden md:block relative w-full pb-[100%]">
//             <Image 
//               className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
//               src={image ?? Foto} 
//               fill
//               sizes="(min-width: 768px) 25vw, 100vw"
//               alt={name}
//             />
//           </div>

//           {/* Bookmark Button */}
//           {showBookmark && (
//             <button
//               onClick={handleBookmarkClick}
//               disabled={isProcessing}
//               className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 z-10
//                 ${bookmark ? "bg-primary-100 text-primary-500 hover:bg-primary-200" : "bg-white/80 hover:bg-white text-gray-600"}
//                 ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
//               `}
//               aria-label={bookmark ? "Hapus bookmark" : "Tambahkan bookmark"}
//             >
//               <FontAwesomeIcon 
//                 icon={bookmark ? bookmarkSolid : bookmarkRegular} 
//                 className={bookmark ? "text-primary-500" : "text-gray-600"} 
//                 size="lg" 
//               />
//             </button>
//           )}

//           {/* Tombol Add to Cart */}
//           <button
//             onClick={handleAddToCartClick}
//             disabled={isAddingToCart || stock <= 0}
//             className={`absolute bottom-3 right-3 
//               ${stock <= 0 ? "bg-gray-400/50 cursor-not-allowed" : 
//                 isAddingToCart ? "bg-green-500/80 hover:bg-green-500/90" : 
//                 "bg-white/20 hover:bg-white/30"}
//               backdrop-blur-md
//               text-white
//               rounded-lg font-semibold text-xs
//               transition-all duration-300 transform
//               ${showBuyButton ? "translate-y-0 opacity-100 scale-100 px-4 py-2" : "translate-y-4 opacity-0 scale-95 px-3 py-2"}
//               flex items-center gap-2
//               shadow-lg
//               border ${stock <= 0 ? "border-gray-400/30" : 
//                 isAddingToCart ? "border-green-400/50" : 
//                 "border-white/30"}
//               z-10
//               whitespace-nowrap
//               ${isAddingToCart ? "cursor-wait" : ""}`}
//           >
//             <FontAwesomeIcon 
//               icon={faShoppingCart} 
//               className={`text-sm ${isAddingToCart ? "animate-pulse" : ""}`} 
//             />
//             {showBuyButton && (
//               <span className="font-medium">
//                 {isAddingToCart ? "✓ Berhasil" : 
//                  stock <= 0 ? "Stok Habis" : 
//                  hasVariants ? "Pilih Varian" : "Add to Cart"}
//               </span>
//             )}
//           </button>

//           {/* Badge Sale */}
//           {sale > 0 && (
//             <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
//               -{sale}%
//             </div>
//           )}

//           {/* Badge Stok Habis */}
//           {stock <= 0 && (
//             <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-5">
//               <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
//                 Stok Habis
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Bagian Konten */}
//         <div className="p-3">
//           {/* Nama Merchandise */}
//           <h3 className="text-dark font-bold text-lg md:text-[15px] mb-2 line-clamp-2">{name}</h3>

//           {/* Info Varian jika ada */}
//           {variantName && (
//             <div className="mb-2">
//               <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
//                 {categoryName}: {variantName}
//               </span>
//             </div>
//           )}

//           {/* Rating dan Lokasi */}
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-3">
//               {/* Lokasi */}
//               <div className="flex items-center">
//                 <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 text-xs mr-1" />
//                 <span className="text-gray-600 text-xs truncate max-w-[120px]">{location}</span>
//               </div>
//             </div>

//             {/* Tanggal (jika ada) */}
//             {date && (
//               <div className="flex items-center text-gray-500 text-xs">
//                 <FontAwesomeIcon icon={faCalendar} className="mr-1" />
//                 {date}
//               </div>
//             )}
//           </div>

//           {/* Creator dan Harga */}
//           <div className="pt-2 border-t border-blue-100 border-dashed flex items-center justify-between">
//             {/* Bagian Kiri: Creator Info */}
//             <Link 
//               href={`/creator/${creatorid || creator}`} 
//               className="flex items-center gap-2 flex-1 min-w-0" 
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Image creator - diperbesar untuk mobile */}
//               <Image 
//                 src={creatorImage ? getCreatorImageUrl(creatorImage) : "/default-avatar.png"} 
//                 alt={`${creator} logo`} 
//                 className="h-10 w-10 md:h-8 md:w-8 rounded-full object-cover flex-shrink-0" 
//                 height={40} 
//                 width={40} 
//               />
//               <div className="min-w-0">
//                 <p className="text-gray-500 text-[10px] md:text-[8px] leading-tight">Disediakan oleh</p>
//                 <div className="flex items-center gap-1">
//                   <p className="text-dark font-semibold text-[15px] md:text-xs truncate">{creator}</p>
//                   {/* Logo Verified jika creatorVerified = true */}
//                   {creatorVerified && (
//                     <svg 
//                       xmlns="http://www.w3.org/2000/svg" 
//                       viewBox="0 0 24 24" 
//                       fill="#1DA1F2" 
//                       className="w-3 h-3 md:w-3 md:h-3 ml-0.5 cursor-pointer"
//                     >
//                       <path d="M22 12l-2-2 1-3-3-1-1-3-3 1-2-2-2 2-3-1-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3 3-1 2 2 2-2 3 1 1-3 3-1-1-3 2-2zM10 15l-3-3 1.4-1.4L10 12.2l5.6-5.6L17 8l-7 7z" />
//                     </svg>
//                   )}
//                 </div>
//               </div>
//             </Link>

//             {/* Bagian Kanan: Harga */}
//             <div className="text-right ml-2 flex-shrink-0">
//               <div className="text-dark font-bold text-sm md:text-sm">
//                 {formatPrice(finalPrice)}
//               </div>
//               {originalPrice && (
//                 <div className="text-gray-400 text-[10px] line-through">
//                   {formatPrice(originalPrice)}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </Link>

//       {/* Modal untuk pilihan varian */}
//       <Modal
//         opened={isVariantModalOpen}
//         onClose={() => setIsVariantModalOpen(false)}
//         title="Pilih Varian"
//         centered
//         size="lg"
//         overlayProps={{
//           backgroundOpacity: 0.55,
//           blur: 3,
//         }}
//       >
//         <div className="space-y-4">
//           {/* Preview produk - susun vertikal untuk mobile */}
//           <div className="flex flex-col md:flex-row md:items-start md:space-x-10 space-y-4 md:space-y-0">
//             {/* Gambar produk */}
//             {image && (
//               <div className="flex-shrink-0 mx-auto md:mx-0">
//                 <Image
//                   src={getImageUrl(image)}
//                   alt={name}
//                   width={180}
//                   height={180}
//                   className="rounded-md object-cover border border-gray-200 w-full max-w-[180px] md:max-w-none"
//                 />
//               </div>
//             )}
            
//             {/* Info produk */}
//             <div className="flex-1 min-w-0">
//               {/* Creator info dengan logo - TANPA "by" */}
//               <div className="flex items-center mb-2 gap-1.5">
//                 {creatorImage && (
//                   <Image 
//                     src={getCreatorImageUrl(creatorImage)} 
//                     alt={`${creator} logo`} 
//                     className="h-8 w-8 md:h-6 md:w-6 rounded-full object-cover flex-shrink-0" 
//                     height={32} 
//                     width={32} 
//                   />
//                 )}
//                 <div className="flex items-center gap-1">
//                    <Text size="sm" c="dimmed">
//                     Dibuat oleh :{" "}
//                   </Text>
//                   <span className="font-semibold text-dark text-base md:text-sm">
//                     {creator}
//                   </span>
//                   {/* Logo Verified di modal juga - menggunakan creatorVerified state */}
//                   {creatorVerified && (
//                     <svg 
//                       xmlns="http://www.w3.org/2000/svg" 
//                       viewBox="0 0 24 24" 
//                       fill="#1DA1F2" 
//                       className="w-3 h-3 md:w-3 md:h-3 ml-0.5 cursor-pointer"
//                     >
//                       <path d="M22 12l-2-2 1-3-3-1-1-3-3 1-2-2-2 2-3-1-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3 3-1 2 2 2-2 3 1 1-3 3-1-1-3 2-2zM10 15l-3-3 1.4-1.4L10 12.2l5.6-5.6L17 8l-7 7z" />
//                     </svg>
//                   )}
//                 </div>
//               </div>
              
//               {/* Nama produk */}
//               <Text fw={700} size="lg" lineClamp={2} mb={10}>
//                 {name}
//               </Text>
              
//               {/* Deskripsi Produk */}
//               <div className="space-y-2">
//                 {/* Dikirim dari store */}
//                 <div className="flex items-start">
//                   <FontAwesomeIcon 
//                     icon={faCheckCircle} 
//                     className="text-green-500 text-sm mr-2 mt-0.5 flex-shrink-0" 
//                   />
//                   <Text size="sm" c="dark" fw={500}>
//                     Dikirim dari {storeName}
//                   </Text>
//                 </div>
                
//                 {/* Ambil di Pasar Bareng Bareng */}
//                 <div className="flex items-start">
//                   <FontAwesomeIcon 
//                     icon={faCheckCircle} 
//                     className="text-green-500 text-sm mr-2 mt-0.5 flex-shrink-0" 
//                   />
//                   <Text size="sm" c="dark" fw={500}>
//                     Ambil di Pasar Bareng Bareng
//                   </Text>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Pilih varian */}
//           {hasVariants && (
//             <div className="space-y-2 pt-3">
//               <Text fw={600} size="sm">Pilih varian:</Text>
//               <Select
//                 value={selectedVariant?.id?.toString()}
//                 onChange={handleVariantChange}
//                 data={variantOptions}
//                 placeholder="Pilih varian"
//                 nothingFoundMessage="Tidak ada varian"
//                 searchable
//                 clearable={false}
//                 size="md"
//               />
              
//             </div>
//           )}

//           {/* Tombol aksi */}
//           <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
//             <Button
//               variant="outline"
//               onClick={() => setIsVariantModalOpen(false)}
//               disabled={isAddingToCart}
//               size="md"
//               fullWidth
//               className="sm:w-auto"
//             >
//               Batal
//             </Button>
//             <Button
//               onClick={hasVariants ? addToCartWithVariant : addToCartDirect}
//               loading={isAddingToCart}
//               disabled={
//                 hasVariants 
//                   ? (!selectedVariant || selectedVariant.stock_qty <= 0)
//                   : stock <= 0
//               }
//               color="blue"
//               size="md"
//               fullWidth
//               className="sm:w-auto"
//             >
//               {isAddingToCart ? "Menambahkan..." : "Tambahkan ke Keranjang"}
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default MerchandiseCard;

import Foto from "@images/Foto=2.png";
import Image, { StaticImageData } from "next/image";
import { useState, useContext, useEffect } from "react";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as bookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { 
  faBookmark as bookmarkSolid, 
  faStar as starSolid, 
  faCalendar, 
  faLocationDot, 
  faShoppingCart,
  faTimes,
  faChevronDown,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { NumberFormatter, Modal, Button, Select, Text } from "@mantine/core";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import _ from "lodash";
import { AppMainContext } from "@/pages/_app";
import { notifications } from "@mantine/notifications";

interface MerchCardProps {
  id: number;
  name: string;
  price: number;
  sale: number;
  creator: string;
  creatorid?: number;
  creatorImage?: string | StaticImageData;
  redirect: string;
  image?: string | StaticImageData;
  location: string;
  date?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: number) => void;
  showBookmark?: boolean;
  // Props untuk varian
  variantId?: number;
  stock?: number;
  variantName?: string;
  categoryName?: string;
  // Data varian lengkap untuk modal
  productVariants?: Array<{
    id: number;
    varian_name: string;
    price: string;
    stock_qty: number;
    product_varian_category?: {
      varian_name: string;
    };
  }>;
  // Prop untuk deskripsi produk
  description?: string;
  // Prop untuk nama store
  storeName?: string;
  // Prop untuk verified status creator
  isVerified?: boolean;
  // Prop untuk memicu fetching data creator
  fetchCreatorVerifiedStatus?: (creatorId: number) => Promise<boolean>;
  // Prop untuk status pre-order (YANG INI PENTING!)
  isPreorder?: number | boolean | string;
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
  productVariants = [],
  description = "Deskripsi produk tidak tersedia",
  storeName = "Warehouse Kita",
  isVerified = false,
  fetchCreatorVerifiedStatus,
  isPreorder = 0, // Default 0
}: MerchCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(isBookmarked);
  const [showBuyButton, setShowBuyButton] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  
  // State untuk modal varian
  const [isVariantModalOpen, setIsVariantModalOpen] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [variantOptions, setVariantOptions] = useState<Array<{value: string, label: string}>>([]);
  
  // State untuk verified status
  const [creatorVerified, setCreatorVerified] = useState<boolean>(isVerified);
  
  const router = useRouter();
  const { setCartCount } = useContext(AppMainContext);

  // LOGGING: Lihat nilai isPreorder yang diterima
  useEffect(() => {
    console.log("📦 MERCH CARD - ID:", id, "Nama:", name, "isPreorder DITERIMA:", isPreorder, "Tipe:", typeof isPreorder);
  }, [id, name, isPreorder]);

  // PRE-ORDER DETECTION - Mendeteksi berbagai format nilai
  const isPreorderActive = (() => {
    // Jika tidak ada data
    if (isPreorder === undefined || isPreorder === null) return false;
    
    // Jika number 1 atau boolean true
    if (isPreorder === 1 || isPreorder === true) return true;
    
    // Jika string "1"
    if (isPreorder === "1") return true;
    
    // Jika string "true" (case insensitive)
    if (typeof isPreorder === "string" && isPreorder.toLowerCase() === "true") return true;
    
    // Jika number > 0 (misal 1, 2, dst)
    if (typeof isPreorder === "number" && isPreorder > 0) return true;
    
    return false;
  })();

  // LOGGING: Hasil deteksi
  useEffect(() => {
    console.log(
      `%c🏷️ ${name} - PRE-ORDER: ${isPreorderActive ? '✅ AKTIF' : '❌ TIDAK AKTIF'} (dari nilai: ${isPreorder})`,
      `color: ${isPreorderActive ? 'purple' : 'gray'}; font-weight: bold; font-size: 12px;`
    );
  }, [name, isPreorder, isPreorderActive]);

  // Sync bookmark
  useEffect(() => {
    setBookmark(isBookmarked);
  }, [isBookmarked]);

  // Sync verified status
  useEffect(() => {
    setCreatorVerified(isVerified);
  }, [isVerified]);

  // Fetch creator verified status
  useEffect(() => {
    const fetchVerifiedStatus = async () => {
      if (creatorid && fetchCreatorVerifiedStatus && !creatorVerified) {
        try {
          const verified = await fetchCreatorVerifiedStatus(creatorid);
          setCreatorVerified(verified);
        } catch (error) {
          console.error("Error fetching creator verified status:", error);
          setCreatorVerified(false);
        }
      }
    };

    if (creatorid && !creatorVerified && fetchCreatorVerifiedStatus) {
      fetchVerifiedStatus();
    }
  }, [creatorid, fetchCreatorVerifiedStatus, creatorVerified]);

  // Setup variant options
  useEffect(() => {
    if (productVariants && productVariants.length > 0) {
      const options = productVariants.map((variant) => ({
        value: variant.id.toString(),
        label: `${variant.varian_name || "Varian"} - Rp ${parseInt(variant.price || "0").toLocaleString('id-ID')}`,
      }));
      setVariantOptions(options);
      
      if (productVariants[0]) {
        setSelectedVariant(productVariants[0]);
      }
    }
  }, [productVariants]);

  const getImageUrl = (img: string | StaticImageData | undefined): string => {
    if (!img) return "/default-image.jpg";
    if (typeof img === "string") return img;
    return img.src;
  };

  const getCreatorImageUrl = (img: string | StaticImageData | undefined): string => {
    if (!img) return "/default-avatar.png";
    if (typeof img === "string") return img;
    return img.src;
  };

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

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (productVariants && productVariants.length > 0) {
      setIsVariantModalOpen(true);
    } else {
      addToCartDirect();
    }
  };

  const addToCartDirect = async () => {
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);

    try {
      if (stock <= 0) {
        toast.error("Stok habis!");
        setIsAddingToCart(false);
        return;
      }

      const cartData = JSON.parse(Cookies.get("_cart") ?? "[]") as CartStorage[];
      const has = cartData.find((e) => e.product_id == id && (e.variant_id ? e.variant_id == variantId : true));
      const added = has ? has?.qty + 1 : 1;

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
          qty: 1,
          price: price,
          product_name: name,
          image_url: getImageUrl(image),
          varian_name: variantName,
        });
      }

      const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);
      if (setCartCount) {
        setCartCount(newCartCount);
      }

      Cookies.set("_cart", JSON.stringify(cartData));

      notifications.show({
        color: "green",
        position: "top-right",
        message: `Berhasil menambahkan ${name} ke keranjang`,
      });

      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Terjadi kesalahan saat menambahkan ke keranjang");
      setIsAddingToCart(false);
    }
  };

  const addToCartWithVariant = async () => {
    if (!selectedVariant || isAddingToCart) return;
    
    setIsAddingToCart(true);

    try {
      if (selectedVariant.stock_qty <= 0) {
        toast.error("Stok varian ini habis!");
        setIsAddingToCart(false);
        return;
      }

      const cartData = JSON.parse(Cookies.get("_cart") ?? "[]") as CartStorage[];
      const has = cartData.find((e) => 
        e.product_id == id && 
        e.variant_id == selectedVariant.id
      );
      const added = has ? has?.qty + 1 : 1;

      if (added > selectedVariant.stock_qty) {
        toast.error(`Stok varian ini hanya tersedia ${selectedVariant.stock_qty} pcs`);
        setIsAddingToCart(false);
        return;
      }

      if (has) {
        cartData.forEach((e, index) => {
          if (e.product_id == id && e.variant_id == selectedVariant.id) {
            cartData[index] = {
              ...e,
              qty: added,
              product_name: name,
              image_url: getImageUrl(image),
              varian_name: selectedVariant.varian_name,
            };
          }
        });
      } else {
        cartData.push({
          variant_id: selectedVariant.id,
          product_id: id,
          qty: 1,
          price: parseInt(selectedVariant.price || "0"),
          product_name: name,
          image_url: getImageUrl(image),
          varian_name: selectedVariant.varian_name,
        });
      }

      const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);
      if (setCartCount) {
        setCartCount(newCartCount);
      }

      Cookies.set("_cart", JSON.stringify(cartData));

      notifications.show({
        color: "green",
        position: "top-right",
        message: `Berhasil menambahkan ${name} (${selectedVariant.varian_name}) ke keranjang`,
      });

      setIsVariantModalOpen(false);
      
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart with variant:", error);
      toast.error("Terjadi kesalahan saat menambahkan ke keranjang");
      setIsAddingToCart(false);
    }
  };

  const handleVariantChange = (value: string | null) => {
    if (value && productVariants) {
      const variant = productVariants.find(v => v.id.toString() === value);
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  };

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

  const hasVariants = productVariants && productVariants.length > 0;

  return (
    <>
      <Link
        href={redirect}
        className="bg-white rounded-lg border border-primary-light-200 shadow-md w-full relative block hover:shadow-lg transition-shadow duration-300"
        onMouseEnter={() => setShowBuyButton(true)}
        onMouseLeave={() => setShowBuyButton(false)}
      >
        {/* Bagian Gambar */}
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Mobile */}
          <div className="block md:hidden relative w-full pb-[100%]">
            <Image 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
              src={image ?? Foto} 
              fill
              sizes="(max-width: 768px) 50vw, 100vw"
              alt={name}
            />
          </div>

          {/* Desktop */}
          <div className="hidden md:block relative w-full pb-[100%]">
            <Image 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
              src={image ?? Foto} 
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
              alt={name}
            />
          </div>

          {/* Bookmark Button */}
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
              <FontAwesomeIcon 
                icon={bookmark ? bookmarkSolid : bookmarkRegular} 
                className={bookmark ? "text-primary-500" : "text-gray-600"} 
                size="lg" 
              />
            </button>
          )}

          {/* Tombol Add to Cart */}
          <button
            onClick={handleAddToCartClick}
            disabled={isAddingToCart || stock <= 0}
            className={`absolute bottom-3 right-3 
              ${stock <= 0 ? "bg-gray-400/50 cursor-not-allowed" : 
                isAddingToCart ? "bg-green-500/80 hover:bg-green-500/90" : 
                "bg-white/20 hover:bg-white/30"}
              backdrop-blur-md
              text-white
              rounded-lg font-semibold text-xs
              transition-all duration-300 transform
              ${showBuyButton ? "translate-y-0 opacity-100 scale-100 px-4 py-2" : "translate-y-4 opacity-0 scale-95 px-3 py-2"}
              flex items-center gap-2
              shadow-lg
              border ${stock <= 0 ? "border-gray-400/30" : 
                isAddingToCart ? "border-green-400/50" : 
                "border-white/30"}
              z-10
              whitespace-nowrap
              ${isAddingToCart ? "cursor-wait" : ""}`}
          >
            <FontAwesomeIcon 
              icon={faShoppingCart} 
              className={`text-sm ${isAddingToCart ? "animate-pulse" : ""}`} 
            />
            {showBuyButton && (
              <span className="font-medium">
                {isAddingToCart ? "✓ Berhasil" : 
                 stock <= 0 ? "Stok Habis" : 
                 hasVariants ? "Pilih Varian" : "Add to Cart"}
              </span>
            )}
          </button>

          {/* BADGE PRE ORDER - TAMPIL JIKA AKTIF */}
          {isPreorderActive && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded z-20 shadow-lg flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              PRE ORDER
            </div>
          )}

          {/* Badge Sale */}
          {sale > 0 && (
            <div className={`absolute ${isPreorderActive ? 'top-2 left-24' : 'top-2 left-2'} bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10`}>
              -{sale}%
            </div>
          )}

          {/* Badge Stok Habis */}
          {stock <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-5">
              <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        {/* Bagian Konten */}
        <div className="p-3">
          {/* Nama dengan Badge Pre Order di samping */}
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-dark font-bold text-lg md:text-[15px] line-clamp-2 flex-1">{name}</h3>
            {isPreorderActive && (
              <span className="bg-purple-100 text-purple-800 text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                PRE-ORDER
              </span>
            )}
          </div>

          {/* Info Varian */}
          {variantName && (
            <div className="mb-2">
              <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                {categoryName}: {variantName}
              </span>
            </div>
          )}

          {/* Lokasi dan Tanggal */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 text-xs mr-1" />
                <span className="text-gray-600 text-xs truncate max-w-[120px]">{location}</span>
              </div>
            </div>
            {date && (
              <div className="flex items-center text-gray-500 text-xs">
                <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                {date}
              </div>
            )}
          </div>

          {/* Creator dan Harga */}
          <div className="pt-2 border-t border-blue-100 border-dashed flex items-center justify-between">
            <Link 
              href={`/creator/${creatorid || creator}`} 
              className="flex items-center gap-2 flex-1 min-w-0" 
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={creatorImage ? getCreatorImageUrl(creatorImage) : "/default-avatar.png"} 
                alt={`${creator} logo`} 
                className="h-10 w-10 md:h-8 md:w-8 rounded-full object-cover flex-shrink-0" 
                height={40} 
                width={40} 
              />
              <div className="min-w-0">
                <p className="text-gray-500 text-[10px] md:text-[8px] leading-tight">Disediakan oleh</p>
                <div className="flex items-center gap-1">
                  <p className="text-dark font-semibold text-[15px] md:text-xs truncate">{creator}</p>
                  {creatorVerified && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="#1DA1F2" 
                      className="w-3 h-3 md:w-3 md:h-3 ml-0.5 cursor-pointer"
                    >
                      <path d="M22 12l-2-2 1-3-3-1-1-3-3 1-2-2-2 2-3-1-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3 3-1 2 2 2-2 3 1 1-3 3-1-1-3 2-2zM10 15l-3-3 1.4-1.4L10 12.2l5.6-5.6L17 8l-7 7z" />
                    </svg>
                  )}
                </div>
              </div>
            </Link>

            <div className="text-right ml-2 flex-shrink-0">
              <div className="text-dark font-bold text-sm md:text-sm">
                {formatPrice(finalPrice)}
              </div>
              {originalPrice && (
                <div className="text-gray-400 text-[10px] line-through">
                  {formatPrice(originalPrice)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Modal Varian */}
      <Modal
        opened={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        title="Pilih Varian"
        centered
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-10 space-y-4 md:space-y-0">
            {image && (
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <Image
                  src={getImageUrl(image)}
                  alt={name}
                  width={180}
                  height={180}
                  className="rounded-md object-cover border border-gray-200 w-full max-w-[180px] md:max-w-none"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {isPreorderActive && (
                <div className="inline-flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  PRE ORDER
                </div>
              )}
              
              <div className="flex items-center mb-2 gap-1.5">
                {creatorImage && (
                  <Image 
                    src={getCreatorImageUrl(creatorImage)} 
                    alt={`${creator} logo`} 
                    className="h-8 w-8 md:h-6 md:w-6 rounded-full object-cover flex-shrink-0" 
                    height={32} 
                    width={32} 
                  />
                )}
                <div className="flex items-center gap-1 flex-wrap">
                  <Text size="sm" c="dimmed">
                    Dibuat oleh :{" "}
                  </Text>
                  <span className="font-semibold text-dark text-base md:text-sm">
                    {creator}
                  </span>
                  {creatorVerified && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="#1DA1F2" 
                      className="w-3 h-3 md:w-3 md:h-3 cursor-pointer"
                    >
                      <path d="M22 12l-2-2 1-3-3-1-1-3-3 1-2-2-2 2-3-1-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3 3-1 2 2 2-2 3 1 1-3 3-1-1-3 2-2zM10 15l-3-3 1.4-1.4L10 12.2l5.6-5.6L17 8l-7 7z" />
                    </svg>
                  )}
                </div>
              </div>
              
              <Text fw={700} size="lg" lineClamp={2} mb={10}>
                {name}
              </Text>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <FontAwesomeIcon 
                    icon={faCheckCircle} 
                    className="text-green-500 text-sm mr-2 mt-0.5 flex-shrink-0" 
                  />
                  <Text size="sm" c="dark" fw={500}>
                    Dikirim dari {storeName}
                  </Text>
                </div>
                
                <div className="flex items-start">
                  <FontAwesomeIcon 
                    icon={faCheckCircle} 
                    className="text-green-500 text-sm mr-2 mt-0.5 flex-shrink-0" 
                  />
                  <Text size="sm" c="dark" fw={500}>
                    Ambil di Pasar Bareng Bareng
                  </Text>
                </div>

                {isPreorderActive && (
                  <div className="flex items-start mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <Text size="sm" c="purple" fw={600}>
                      Produk Pre Order - Proses pengiriman akan diinformasikan kemudian
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          {hasVariants && (
            <div className="space-y-2 pt-3">
              <Text fw={600} size="sm">Pilih varian:</Text>
              <Select
                value={selectedVariant?.id?.toString()}
                onChange={handleVariantChange}
                data={variantOptions}
                placeholder="Pilih varian"
                nothingFoundMessage="Tidak ada varian"
                searchable
                clearable={false}
                size="md"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsVariantModalOpen(false)}
              disabled={isAddingToCart}
              size="md"
              fullWidth
              className="sm:w-auto"
            >
              Batal
            </Button>
            <Button
              onClick={hasVariants ? addToCartWithVariant : addToCartDirect}
              loading={isAddingToCart}
              disabled={
                hasVariants 
                  ? (!selectedVariant || selectedVariant.stock_qty <= 0)
                  : stock <= 0
              }
              color="blue"
              size="md"
              fullWidth
              className="sm:w-auto"
            >
              {isAddingToCart ? "Menambahkan..." : "Tambahkan ke Keranjang"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MerchandiseCard;