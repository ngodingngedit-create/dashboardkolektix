import Image from "next/image";
import { useState } from "react";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as bookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as bookmarkSolid, faStar as starSolid, faCalendar, faLocationDot, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { NumberFormatter } from "@mantine/core";

interface PromoMerchCardProps {
  name: string;
  price: number;
  sale: number;
  creator: string;
  creatorid?: number;
  creatorImage?: string;
  redirect: string;
  image?: string;
  location?: string;
  date?: string;
}

const PromoMerchandiseCard = ({ 
  name, 
  price, 
  sale, 
  creator, 
  creatorid, 
  creatorImage, 
  redirect, 
  image, 
  location, 
  date 
}: PromoMerchCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  const [showBuyButton, setShowBuyButton] = useState<boolean>(false);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmark(!bookmark);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Beli merchandise:", name);
    window.location.href = redirect;
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

  return (
    <Link
      href={redirect}
      className="bg-white rounded-lg border border-primary-light-200 shadow-md w-full relative block hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={() => setShowBuyButton(true)}
      onMouseLeave={() => setShowBuyButton(false)}
    >
      {/* Bagian Gambar dengan Bookmark Button */}
      <div className="relative overflow-hidden rounded-t-lg">
        <div className={`${styles.cardImg} w-full h-48 object-cover transition-transform duration-300 ${showBuyButton ? "scale-105" : ""}`}>
          <Image
            src={image || "/images/product-default.jpg"}
            alt={name}
            width={500}
            height={500}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/product-default.jpg";
            }}
          />
        </div>

        {/* Bookmark Button di pojok kanan atas */}
        <button
          onClick={handleBookmarkClick}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full transition-all duration-200 z-10"
          aria-label={bookmark ? "Hapus bookmark" : "Tambahkan bookmark"}
        >
          <FontAwesomeIcon icon={bookmark ? bookmarkSolid : bookmarkRegular} className={bookmark ? "text-primary-500" : "text-gray-600"} size="lg" />
        </button>

        {/* Tombol Beli (versi asli) - muncul saat hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBuyClick(e);
          }}
          className={`absolute bottom-3 right-3 
            bg-white/20 hover:bg-white/30
            backdrop-blur-md
            text-white
            px-3 py-2 rounded-lg font-semibold text-sm
            transition-all duration-300 transform
            ${showBuyButton ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"}
            flex items-center gap-2
            shadow-lg
            border border-white/30
            z-10`}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
        </button>
      </div>

      {/* Bagian Konten */}
      <div className="p-3">
        {/* Nama Merchandise */}
        <h3 className="text-dark font-bold text-sm mb-2 line-clamp-2">{name}</h3>

        {/* Rating dan Lokasi */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Lokasi */}
            <div className="flex items-center">
              <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 text-xs mr-1" />
              <span className="text-gray-600 text-xs truncate max-w-[120px]">{location || "Unknown"}</span>
            </div>
          </div>

          {/* Tanggal (jika ada) */}
          {date && (
            <div className="flex items-center text-gray-500 text-xs">
              <FontAwesomeIcon icon={faCalendar} className="mr-1" />
              {new Date(date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short'
              })}
            </div>
          )}
        </div>

        {/* Creator dan Harga (layout kiri-kanan) */}
        <div className="pt-2 border-t border-blue-100 border-dashed flex items-center justify-between">
          {/* Bagian Kiri: Creator Info */}
          <Link href={`/creator/${creatorid || creator}`} className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={creatorImage || "/images/default-avatar.png"} 
              alt={`${creator} logo`} 
              className="h-7 w-7 rounded-full object-cover flex-shrink-0" 
              height={28} 
              width={28}
              onError={(e) => {
                e.currentTarget.src = "/images/default-avatar.png";
              }}
            />
            <div className="min-w-0">
              <p className="text-gray-500 text-[8px] leading-tight">Disediakan oleh</p>
              <p className="text-dark font-semibold text-xs truncate">{creator}</p>
            </div>
          </Link>

          {/* Bagian Kanan: Harga */}
          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-dark font-bold text-sm">{formatPrice(price)}</div>
            {sale > 0 && <div className="text-gray-400 text-[10px] line-through">{formatPrice(price + (price * sale) / 100)}</div>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PromoMerchandiseCard;