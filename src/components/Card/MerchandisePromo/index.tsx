// MerchandisePromo/index.tsx (versi lebih fleksibel)
import Image from "next/image";
import { useState } from "react";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as bookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as bookmarkSolid, faStar as starSolid, faCalendar, faLocationDot, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { NumberFormatter } from "@mantine/core";
import { toast } from "react-toastify";

interface PromoMerchCardProps {
  id?: number; // Jadikan optional dengan ?
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
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: number) => void;
  showBookmark?: boolean;
}

const MerchandisePromo = ({ 
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
}: PromoMerchCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(isBookmarked);
  const [showBuyButton, setShowBuyButton] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
    
    if (!id) {
      toast.error("Bookmark tidak tersedia untuk produk ini");
      return;
    }
    
    setIsProcessing(true);
    try {
      const newBookmarkState = !bookmark;
      setBookmark(newBookmarkState);
      
      if (onBookmarkToggle && id) {
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
    window.location.href = redirect;
  };

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

        {showBookmark && id && (
          <button
            onClick={handleBookmarkClick}
            disabled={isProcessing}
            className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 z-10
              ${bookmark 
                ? 'bg-primary-100 text-primary-500 hover:bg-primary-200' 
                : 'bg-white/80 hover:bg-white text-gray-600'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
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

      <div className="p-3">
        <h3 className="text-dark font-bold text-sm mb-2 line-clamp-2">{name}</h3>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 text-xs mr-1" />
              <span className="text-gray-600 text-xs truncate max-w-[120px]">{location || "Unknown"}</span>
            </div>
          </div>

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

        <div className="pt-2 border-t border-blue-100 border-dashed flex items-center justify-between">
          <Link 
            href={`/creator/${creatorid || creator}`} 
            className="flex items-center gap-2 flex-1 min-w-0" 
            onClick={(e) => e.stopPropagation()}
          >
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

          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-dark font-bold text-sm">{formatPrice(price)}</div>
            {sale > 0 && (
              <div className="text-gray-400 text-[10px] line-through">
                {formatPrice(price + (price * sale) / 100)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MerchandisePromo;