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
    <div className="my-12 md:mx-auto md:max-w-7xl md:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Bagian kiri: Segera Koleksi (Judul) */}
        <div className="lg:col-span-1 flex items-center justify-center lg:justify-start">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-bold text-dark mb-4">Segera Koleksi</h2>

            {/* Placeholder untuk gambar - bisa diganti dengan gambar asli nanti */}
            <div className="bg-gray-200 rounded-xl h-64 w-full flex items-center justify-center mb-6">
              <div className="relative w-full h-full mx-auto">
                {" "}
                {/* atur ukuran disini */}
                <Image src="/images/promo.png" alt="Segera Koleksi" fill className="object-contain" sizes="100vw" priority={false} />
              </div>
            </div>

            <Link href="/upcoming" className="inline-flex items-center gap-2 text-primary-base hover:text-primary-dark font-medium">
              Lihat Selengkapnya
              <FontAwesomeIcon icon={faCircleArrowRight} />
            </Link>
          </div>
        </div>

        {/* Bagian kanan: Daftar Merchandise */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center text-dark mb-4 px-0 lg:px-6">
            <h3 className={styles.heading}></h3>
            <Link href="/merchandise" className="text-primary-base flex gap-2 items-center">
              Lihat Semua
              <FontAwesomeIcon icon={faCircleArrowRight} />
            </Link>
          </div>

          {!loading ? (
            <div className={`${styles.eventContainer2} min-h-80 gap-4 items-center w-full pb-3 px-0 md:px-3 md:ml-0`}>
              {displayedMerchandise.map((item) => (
                <div key={item.id} className={styles.eventCard}>
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
              ))}
            </div>
          ) : (
            <div className={`${styles.eventContainer} min-h-80 gap-4 items-center w-full pb-3 px-0 md:px-3 md:ml-0`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={styles.eventCard}>
                  <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full"></div>
                </div>
              ))}
            </div>
          )}
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
