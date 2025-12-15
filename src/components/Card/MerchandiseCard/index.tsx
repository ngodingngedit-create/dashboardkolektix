import Foto from "@images/Foto=2.png";
import Image from "next/image";
import { useState } from "react";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";
import { faCalendar, faLocationDot, faBookmark as bookmarkSolid, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { NumberFormatter } from "@mantine/core";

interface MerchCardProps {
  name: string;
  price: number;
  sale: number;
  creator: string;
  creatorid?: number;
  creatorImage?: string;
  redirect: string;
  image?: string;
}

const MerchandiseCard = ({ name, price, sale, creator, creatorid, creatorImage, redirect, image }: MerchCardProps & {}) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  const [showBuyButton, setShowBuyButton] = useState<boolean>(false);

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Logic untuk beli merchandise
    console.log("Beli merchandise:", name);
    // Redirect ke halaman checkout atau tambahkan ke cart
    window.location.href = redirect; // Atau gunakan router.push jika ada
  };

  return (
    <Link href={redirect} className="bg-white rounded-lg border border-primary-light-200 shadow-md ml-1 md:ml-0 w-full relative block" onMouseEnter={() => setShowBuyButton(true)} onMouseLeave={() => setShowBuyButton(false)}>
      {/* Bagian Gambar dengan Button Overlay */}
      <div className="relative overflow-hidden">
        <Image className={`${styles.cardImg} rounded-t-lg ${showBuyButton ? "scale-105" : ""} transition-transform duration-300`} src={image ?? Foto} width={500} height={500} alt="" />
        <button
          onClick={(e) => {
            e.preventDefault(); // Mencegah navigasi ke link
            e.stopPropagation(); // Mencegah event bubbling
            handleBuyClick(e);
          }}
          className={`absolute bottom-3 right-3 bg-white/90 hover:bg-white text-dark px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
            showBuyButton ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
          } flex items-center gap-2 shadow-md hover:shadow-lg border border-gray-200 z-10`}
          style={{
            backdropFilter: "blur(4px)",
          }}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
          Beli Merch
        </button>
      </div>
      <div>
        <div className={`p-[10px]`}>
          <p className="mb-2 text-dark font-[500] leading-[140%] text-[0.8rem]">{name}</p>
          <div>
            <p className="text-dark text-[0.8rem] font-[500]">
              <NumberFormatter value={price} />
            </p>
            {/* <p className='text-dark-grey text-[0.7rem] line-through'><NumberFormatter value={sale} /></p> */}
          </div>
          <div className="flex items-center text-xs mt-[5px]">
            <p className="text-xs">
              <FontAwesomeIcon icon={starSolid} className="text-warning-400" />
              <span className="ml-1 text-grey">4.8</span>
            </p>
          </div>
        </div>
        <Link href={`/creator/${creator}`} className="flex items-center gap-2 border-t p-[10px] border-t-primary-light-200 border-dashed relative z-20">
          <Image src={creatorImage ?? "https://kolektix.com"} alt="creator logo" className="h-8 w-8 rounded-full" height={50} width={50} />
          <div>
            <p className="text-dark font-[400] text-xs">{creator}</p>
            {/* <div className='text-grey text-[10px]'>Jakarta</div> */}
          </div>
        </Link>
      </div>
    </Link>
  );
};

export default MerchandiseCard;

// import Foto from "@images/Foto=2.png";
// import Image from "next/image";
// import { useState } from "react";
// import styles from "./index.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBell as bellRegular } from "@fortawesome/free-regular-svg-icons";
// import { faBell as bellSolid, faLocationDot, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
// import Link from "next/link";
// import { NumberFormatter } from "@mantine/core";

// interface MerchCardProps {
//   name: string;
//   price: number;
//   sale: number;
//   creator: string;
//   creatorid?: number;
//   creatorImage?: string;
//   redirect: string;
//   image?: string;
//   location?: string;
// }

// const MerchandiseCard = ({ name, price, sale, creator, creatorid, creatorImage, redirect, image, location = "Jakarta" }: MerchCardProps) => {
//   const [isBellActive, setIsBellActive] = useState<boolean>(false);
//   const [showBuyButton, setShowBuyButton] = useState<boolean>(false);

//   const formattedPrice = new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 0,
//   }).format(price);

//   const handleBellClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsBellActive(!isBellActive);
//   };

//   const handleBuyClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     // Logic untuk beli merchandise
//     console.log("Beli merchandise:", name);
//     // Redirect ke halaman checkout atau tambahkan ke cart
//     window.location.href = redirect; // Atau gunakan router.push jika ada
//   };

//   return (
//     <Link
//       href={redirect}
//       className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden block h-full relative"
//       onMouseEnter={() => setShowBuyButton(true)}
//       onMouseLeave={() => setShowBuyButton(false)}
//     >
//       {/* Product Image Section */}
//       <div className="relative w-full h-48 overflow-hidden">
//         <Image className={`${styles.cardImg} object-cover transition-transform duration-300 ${showBuyButton ? "scale-105" : ""}`} src={image ?? Foto} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" alt={name} />

//         {/* Sale Badge */}
//         {sale > 0 && <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{sale}%</div>}

//         {/* Beli Merch Button - Muncul saat hover */}
//         <button
//           onClick={handleBuyClick}
//           className={`absolute bottom-3 right-3 bg-white/90 hover:bg-white text-dark px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
//             showBuyButton ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
//           } flex items-center gap-2 shadow-md hover:shadow-lg border border-gray-200`}
//           style={{
//             backdropFilter: "blur(4px)",
//           }}
//         >
//           <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
//           Beli Merch
//         </button>
//       </div>

//       {/* Product Info Section */}
//       <div className="p-4">
//         {/* Product Name */}
//         <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{name}</h3>

//         {/* Product Description */}
//         <p className="text-gray-600 text-sm mb-3 line-clamp-2">Lorem Ipsum Dolor Sit Amet</p>

//         {/* Price */}
//         <div className="mb-3">
//           <div className="font-bold text-gray-900 text-lg">{formattedPrice}</div>
//           {sale > 0 && (
//             <p className="text-gray-400 text-sm line-through">
//               <NumberFormatter value={price + (price * sale) / 100} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//             </p>
//           )}
//         </div>

//         {/* Store Info & Bell */}
//         <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
//           <div className="flex-1 min-w-0">
//             <div className="font-medium text-gray-900 text-sm truncate">{creator}</div>
//             <div className="flex items-center text-gray-500 text-xs mt-0.5">
//               <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-xs flex-shrink-0" />
//               <span className="truncate">{location}</span>
//             </div>
//           </div>

//           {/* Bell Button */}
//           <button
//             onClick={handleBellClick}
//             className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ml-2 flex-shrink-0"
//             aria-label={isBellActive ? "Hapus notifikasi" : "Aktifkan notifikasi"}
//           >
//             <FontAwesomeIcon icon={isBellActive ? bellSolid : bellRegular} className={isBellActive ? "text-yellow-500" : "text-gray-600"} />
//           </button>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default MerchandiseCard;
