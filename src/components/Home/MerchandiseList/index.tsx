// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
// import EventCard from "@/components/Card/EventCard";
// import styles from "../index.module.css";
// import MerchandiseCard from "@/components/Card/MerchandiseCard";

// const MerchandiseList = () => {
//   return (
//     <div className="my-2 md:mx-auto md:max-w-7xl md:px-10">
//       <div className="flex justify-between items-center text-dark mb-4 px-6">
//         <h3 className={styles.heading}>Merchandise</h3>
//         <Link href="/merchandise" className="text-primary-base flex gap-2 items-center">
//           Lihat Semua
//           <FontAwesomeIcon icon={faCircleArrowRight} />
//         </Link>
//       </div>
//       <div className={`${styles.eventContainer} min-h-80 gap-4 items-center w-full pb-3 px-0 md:px-3  md:ml-0`}>
//         {/* <div className={styles.eventCard}>
//           <MerchandiseCard />
//         </div>
//         <div className={styles.eventCard}>
//           <MerchandiseCard />
//         </div>
//         <div className={styles.eventCard}>
//           <MerchandiseCard />
//         </div>
//         <div className={styles.eventCard}>
//           <MerchandiseCard />
//         </div>
//         <div className={styles.eventCard}>
//           <MerchandiseCard />
//         </div>
//         <div className={styles.eventCard}>
//           <MerchandiseCard />
//         </div> */}
//         {/* <div className={styles.eventCard}>
//           <MerchandiseCard
//             key={item.id}
//             name={item.product_name}
//             price={parseInt((item?.product_varian?.length ?? 0) > 0 ? item.product_varian[0].price : item.price)}
//             sale={0}
//             creator={item.creator.name}
//             creatorid={item.creator.id}
//             creatorImage={item.creator.image_url}
//             redirect={`/merchandise/${item.slug}`}
//             image={item.product_image.length > 0 ? item.product_image[0].image_url : undefined}
//           />
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default MerchandiseList;

// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
// import MerchandiseCard from "@/components/Card/MerchandiseCard";
// import styles from "../index.module.css";
// import { MerchListResponse } from "@/pages/dashboard/merch/type";

// interface MerchandiseListProps {
//   data: MerchListResponse[];
//   loading?: boolean;
// }

// const MerchandiseList = ({ data, loading }: MerchandiseListProps) => {
//   // Ambil 6 item pertama untuk ditampilkan
//   const displayedMerchandise = data.slice(0, 6);

//   return displayedMerchandise.length > 0 ? (
//     <div className="my-12 md:mx-auto md:max-w-7xl md:px-10">
//       <div className="flex justify-between items-center text-dark mb-4 px-6">
//         <h3 className={styles.heading}>Merchandise</h3>
//         <Link href="/merchandise" className="text-primary-base flex gap-2 items-center">
//           Lihat Semua
//           <FontAwesomeIcon icon={faCircleArrowRight} />
//         </Link>
//       </div>

//       {!loading ? (
//         <div className={`${styles.eventContainer2} min-h-80 gap-4 items-center w-full pb-3 px-0 md:px-3 md:ml-0`}>
//           {displayedMerchandise.map((item) => (
//             <div key={item.id} className={styles.eventCard}>
//               <MerchandiseCard
//                 name={item.product_name}
//                 price={parseInt((item?.product_varian?.length ?? 0) > 0 ? item.product_varian[0].price : item.price)}
//                 sale={0}
//                 creator={item.creator.name}
//                 creatorid={item.creator.id}
//                 creatorImage={item.creator.image_url}
//                 redirect={`/merchandise/${item.slug}`}
//                 image={item.product_image.length > 0 ? item.product_image[0].image_url : undefined}
//                 location={item.has_store_location?.store_name}
//               />
//             </div>
//           ))}
//         </div>
//       ) : (
//         // Loading state - sesuaikan dengan EventCardLoading jika ada
//         <div className={`${styles.eventContainer} min-h-80 gap-4 items-center w-full pb-3 px-0 md:px-3 md:ml-0`}>
//           {Array.from({ length: 6 }).map((_, index) => (
//             <div key={index} className={styles.eventCard}>
//               <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full"></div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   ) : (
//     // Empty state - hanya muncul jika tidak loading dan tidak ada data
//     !loading && (
//       <div className="my-12 md:mx-auto md:max-w-7xl md:px-10">
//         <div className="flex justify-between items-center text-dark mb-4 px-6">
//           <h3 className={styles.heading}>Merchandise</h3>
//           <Link href="/merchandise" className="text-primary-base flex gap-2 items-center">
//             Lihat Semua
//             <FontAwesomeIcon icon={faCircleArrowRight} />
//           </Link>
//         </div>
//         <div className="text-center py-12">
//           <p className="text-gray-500">Belum ada merchandise</p>
//         </div>
//       </div>
//     )
//   );
// };

// export default MerchandiseList;

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import MerchandiseCard from "@/components/Card/MerchandiseCard";
import styles from "../index.module.css";
import { MerchListResponse } from "@/pages/dashboard/merch/type";
import Image from "next/image";

interface MerchandiseListProps {
  data: MerchListResponse[];
  loading?: boolean;
}

const MerchandiseList = ({ data, loading }: MerchandiseListProps) => {
  const displayedMerchandise = data.slice(0, 6);

  return displayedMerchandise.length > 0 ? (
    <div className="my-12 md:mx-auto md:max-w-10xl md:px-8 bg-blue-100 py-6">
      {/* Container utama - 40-60 di mobile, 25-75 di desktop */}
      <div className="flex flex-row items-start w-full">
        {/* Bagian kiri: Segera Koleksi - 40% mobile, 25% desktop */}
        <div className="flex w-2/5 md:w-1/4 flex-col items-center justify-center px-2 md:px-4">
          <div className="text-center w-full">
            <h2 className="text-2xl md:text-5xl font-bold text-dark mb-1 md:mb-4">Segera Koleksi</h2>
            <div className="bg-gray-200 rounded-lg md:rounded-xl h-64 md:h-64 w-full flex items-center justify-center">
              {/* GAMBAR DIPERBESAR UNTUK DESKTOP */}
              <div className="relative w-full h-full">
                <Image src="/images/promo.png" alt="Segera Koleksi" fill className="object-contain" sizes="(max-width: 767px) 40vw, 25vw" priority={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Bagian kanan: Merchandise List - 60% mobile, 75% desktop */}
        <div className="w-3/5 md:w-3/4 pl-2 md:pl-4 overflow-hidden">
          {/* Header "Lihat Semua" - DI KANAN */}
          <div className="w-full flex justify-end mb-2 md:mb-4 pr-2 md:pr-0">
            <Link href="/merchandise" className="text-primary-base flex gap-1 md:gap-2 items-center text-xs md:text-base whitespace-nowrap">
              Lihat Semua
              <FontAwesomeIcon icon={faCircleArrowRight} className="text-xs md:text-base flex-shrink-0" />
            </Link>
          </div>

          {/* Container merchandise - 1 CARD VISIBLE DI MOBILE */}
          <div className={styles.merchContainer}>
            {!loading
              ? displayedMerchandise.map((item) => (
                  <div key={item.id} className={styles.merchCard}>
                    <MerchandiseCard
                      name={item.product_name}
                      price={parseInt((item?.product_varian?.length ?? 0) > 0 ? item.product_varian[0].price : item.price)}
                      sale={0}
                      creator={item.creator.name}
                      creatorid={item.creator.id}
                      creatorImage={item.creator.image_url}
                      redirect={`/merchandise/${item.slug}`}
                      image={item.product_image.length > 0 ? item.product_image[0].image_url : undefined}
                      location={item.has_store_location?.store_name}
                    />
                  </div>
                ))
              : Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={styles.merchCard}>
                    <div className="animate-pulse bg-gray-200 rounded-lg h-28 md:h-64 w-full"></div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    !loading && (
      <div className="my-12 md:mx-auto md:max-w-7xl md:px-10">
        <div className="flex justify-end items-center text-dark mb-4 px-6">
          <Link href="/merchandise" className="text-primary-base flex gap-2 items-center whitespace-nowrap">
            Lihat Semua
            <FontAwesomeIcon icon={faCircleArrowRight} className="flex-shrink-0" />
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Belum ada merchandise</p>
        </div>
      </div>
    )
  );
};

export default MerchandiseList;

// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
// import PromoMerchandiseCard from "@/components/Card/MerchandisePromo";
// import styles from "../index.module.css";
// import { MerchPromoResponse, PromoProduct } from "@/pages/dashboard/merch/type";
// import Image from "next/image";

// interface PromoMerchandiseListProps {
//   data: MerchPromoResponse | null | undefined;
//   loading?: boolean;
// }

// const PromoMerchandiseList = ({ data, loading }: PromoMerchandiseListProps) => {
//   if (!data) {
//     return null; // Return null agar tidak render apa-apa jika tidak ada data
//   }

//   // Perbaikan: handle jika products adalah object, bukan array
//   let displayedProducts: PromoProduct[] = [];

//   if (data.products) {
//     if (Array.isArray(data.products)) {
//       // Jika products adalah array
//       displayedProducts = data.products.filter((product: PromoProduct) => product.product_status_id === 2).slice(0, 6);
//     } else {
//       // Jika products adalah object single product
//       const product = data.products as any; // Type assertion karena tipe mungkin tidak sesuai
//       if (product.product_status_id === 2) {
//         displayedProducts = [product];
//       }
//     }
//   }

//   return (
//     <div className="my-12 md:mx-auto md:max-w-10xl md:px-8 bg-blue-100 py-6">
//       {/* Container utama - 40-60 di mobile, 25-75 di desktop */}
//       <div className="flex flex-row items-start w-full">
//         {/* Bagian kiri: Segera Koleksi - 40% mobile, 25% desktop */}
//         <div className="flex w-2/5 md:w-1/4 flex-col items-center justify-center px-2 md:px-4">
//           <div className="text-center w-full">
//             <h2 className="text-2xl md:text-5xl font-bold text-dark mb-1 md:mb-4">{data.promo_name || "Segera Koleksi"}</h2>
//             <div className="bg-gray-200 rounded-lg md:rounded-xl h-64 md:h-64 w-full flex items-center justify-center">
//               {/* GAMBAR DIPERBESAR UNTUK DESKTOP */}
//               <div className="relative w-full h-full">
//                 <Image
//                   src={data.promo_banner ? `/images/promo/${data.promo_banner}` : "../../public/images/promo.png"}
//                   alt={data.promo_name || "Segera Koleksi"}
//                   fill
//                   className="object-contain"
//                   sizes="(max-width: 767px) 40vw, 25vw"
//                   priority={false}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bagian kanan: Merchandise List - 60% mobile, 75% desktop */}
//         <div className="w-3/5 md:w-3/4 pl-2 md:pl-4 overflow-hidden">
//           {/* Header "Lihat Semua" - DI KANAN */}
//           <div className="w-full flex justify-end mb-2 md:mb-4 pr-2 md:pr-0">
//             <Link href={`/promo/${data.promo_slug || data.promo_id}`} className="text-primary-base flex gap-1 md:gap-2 items-center text-xs md:text-base whitespace-nowrap">
//               Lihat Semua
//               <FontAwesomeIcon icon={faCircleArrowRight} className="text-xs md:text-base flex-shrink-0" />
//             </Link>
//           </div>

//           {/* Container merchandise - 1 CARD VISIBLE DI MOBILE */}
//           <div className={styles.merchContainer}>
//             {!loading ? (
//               displayedProducts.length > 0 ? (
//                 displayedProducts.map((product) => (
//                   <div key={product.id} className={styles.merchCard}>
//                     <PromoMerchandiseCard
//                       name={product.product_name}
//                       price={parseFloat(product.price)}
//                       sale={0}
//                       creator={product.creator?.name || product.created_by || "Creator"}
//                       creatorid={product.creator_id}
//                       creatorImage={product.creator?.image_url}
//                       redirect={`/merchandise/${product.slug}`}
//                       image={product.product_image?.length > 0 ? product.product_image[0].image_url : undefined}
//                       location={product.has_store_location?.store_name}
//                     />
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8 text-gray-500 w-full">Belum ada produk aktif dalam promo ini</div>
//               )
//             ) : (
//               Array.from({ length: 6 }).map((_, index) => (
//                 <div key={index} className={styles.merchCard}>
//                   <div className="animate-pulse bg-gray-200 rounded-lg h-28 md:h-64 w-full"></div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PromoMerchandiseList;
