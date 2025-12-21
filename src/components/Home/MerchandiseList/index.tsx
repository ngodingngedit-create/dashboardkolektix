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
// Pastikan file benar-benar ada di src/assets/promo.png
import segeraKoleksiImage from "@/src/assets/promo.png";

interface MerchandiseListProps {
  data: MerchListResponse[];
  loading?: boolean;
}

const MerchandiseList = ({ data, loading }: MerchandiseListProps) => {
  // Ambil 6 item pertama untuk ditampilkan
  const displayedMerchandise = data.slice(0, 6);

  return displayedMerchandise.length > 0 ? (
    <div className="my-12 md:mx-auto md:max-w-10xl md:px-8 bg-blue-100 py-6">
      {/* Desktop & Mobile sama-sama pakai scroll horizontal */}
      <div className="flex flex-col lg:flex-row">
        {/* Bagian kiri: Segera Koleksi - Hanya di desktop */}
        <div className="hidden lg:flex lg:w-1/4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-dark mb-4">Segera Koleksi</h2>

            <div className="bg-gray-200 rounded-xl h-64 w-full flex items-center justify-center mb-6">
              <div className="relative w-full h-full mx-auto">
                <Image src="/images/promo.png" alt="Segera Koleksi" fill className="object-contain" sizes="25vw" priority={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Bagian kanan: Semua konten */}
        <div className="lg:w-3/4">
          {/* Mobile Header - Ada "Segera Koleksi" */}
          <div className="lg:hidden flex justify-between items-center text-dark mb-4 px-4">
            <h2 className="text-2xl font-bold">Segera Koleksi</h2>
            <Link href="/merchandise" className="text-primary-base flex gap-2 items-center text-sm">
              Lihat Semua
              <FontAwesomeIcon icon={faCircleArrowRight} className="text-xs" />
            </Link>
          </div>

          {/* Desktop Header - Tidak ada "Segera Koleksi" */}
          <div className="hidden lg:flex justify-between items-center text-dark mb-4 px-6">
            <h3 className={styles.heading}></h3>
            <Link href="/merchandise" className="text-primary-base flex gap-2 items-center">
              Lihat Semua
              <FontAwesomeIcon icon={faCircleArrowRight} />
            </Link>
          </div>

          {/* Container untuk semua device - Scroll horizontal */}
          <div className={`${styles.eventContainer2} w-full pb-4 px-4 lg:px-8`}>
            {/* Mobile/Tablet: Card Segera Koleksi ada di sini */}
            {/* <div className="lg:hidden ${styles.eventCard} min-w-[280px] lg:min-w-0">
              <div className="bg-gray-100 rounded-lg h-64 w-full overflow-hidden flex flex-col">
                <div className="relative h-40 w-full flex-grow">
                  <Image src="/images/promo.png" alt="Segera Koleksi" fill className="object-contain p-4" sizes="(max-width: 1024px) 100vw" priority={false} />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-dark mb-2">Segera Koleksi</h3>
                  <p className="text-sm text-gray-600">Koleksi merchandise eksklusif</p>
                </div>
              </div>
            </div> */}

            {/* Merchandise Cards untuk semua device */}
            {!loading
              ? displayedMerchandise.map((item) => (
                  <div key={item.id} className={`${styles.eventCard} min-w-[280px] lg:min-w-[300px] p-3 gap-6`}>
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
                  <div key={index} className={`${styles.eventCard} min-w-[280px] lg:min-w-[300px]`}>
                    <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full"></div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    !loading && (
      <div className="my-12 md:mx-auto md:max-w-7xl md:px-10">
        <div className="flex justify-between items-center text-dark mb-4 px-6">
          <h3 className={styles.heading}>Merchandise</h3>
          <Link href="/merchandise" className="text-primary-base flex gap-2 items-center">
            Lihat Semua
            <FontAwesomeIcon icon={faCircleArrowRight} />
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
