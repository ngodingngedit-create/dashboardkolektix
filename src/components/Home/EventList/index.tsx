// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
// import EventCardLoading from "@/components/Card/EventCard/loading";
// import { EventProps } from "@/utils/globalInterface";
// import EventCard from "@/components/Card/EventCard";
// import styles from "../index.module.css";
// import useWindowSize from "@/utils/useWindowSize";
// import React from "react";
// import Upcoming from "../Upcoming";

// interface ListProps {
//   data: EventProps[];
//   loading?: boolean;
// }

// const EventList = ({ data, loading }: ListProps) => {
//   const { width } = useWindowSize();

//   return data.length > 0 ? (
//     <>
//       <div className="my-12 md:mx-auto md:max-w-7xl md:px-10">
//         <div className="flex justify-between items-center text-dark mb-4 px-6">
//           <h3 className={styles.heading}>Event</h3>
//           <Link href="/event" className="text-primary-base flex gap-2 items-center">
//             Lihat Semua
//             <FontAwesomeIcon icon={faCircleArrowRight} />
//           </Link>
//         </div>
//         {!loading ? (
//           <div className={`${styles.eventContainer2} min-h-80 gap-1 items-center w-full pb-3 md:px-3 px-0 md:ml-0`}>
//             {data.map((event: any) => (
//               <div className={styles.eventCard} key={event.id}>
//                 <EventCard
//                   // id={event.id}
//                   // maxWidth={300}
//                   // title={event.name}
//                   // img={event.image_url}
//                   // date={event.start_date}
//                   // end={event.end_date}
//                   // slug={event.slug}
//                   // location={event.location_city}
//                   // price={event.starting_price}
//                   // creatorImg={event.has_creator?.image}
//                   // creator={event.has_creator?.name}
//                   // creatorSlug={event.has_creator?.slug}
//                   id={event.id}
//                   maxWidth={300}
//                   title={event.name}
//                   img={event.image_url ?? ""}
//                   date={new Date(event.start_date)}
//                   end={new Date(event.end_date)}
//                   slug={event.slug}
//                   location={event.location_city}
//                   price={event.starting_price}
//                   creatorImg={event.has_creator?.image}
//                   creator={event.has_creator?.name}
//                   creatorSlug={event.has_creator?.slug} // 🔹 tambahkan ini
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className={`${styles.eventContainer} min-h-80 gap-6 items-center w-full pb-3 md:px-3 px-0 md:ml-0`}>
//             <EventCardLoading />
//             <EventCardLoading />
//             <EventCardLoading />
//           </div>
//         )}
//       </div>
//     </>
//   ) : (
//     <>
//       <p className="font-semibold text-dark">Belum ada event</p>
//     </>
//   );
// };

// export default EventList;

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import EventCardLoading from "@/components/Card/EventCard/loading";
import { EventProps } from "@/utils/globalInterface";
import EventCard from "@/components/Card/EventCard";
import styles from "../index.module.css";
import useWindowSize from "@/utils/useWindowSize";
import React, { useMemo } from "react";
import Upcoming from "../Upcoming";
import { useRouter } from "next/router"; // <-- added

interface ListProps {
  data: EventProps[];
  loading?: boolean;
}

const EventList = ({ data, loading }: ListProps) => {
  const { width } = useWindowSize();
  const router = useRouter();
  const { category: categoryQuery } = router.query; // may be string or array

  // normalize category param to a single string (if present)
  const categoryParam = Array.isArray(categoryQuery) ? categoryQuery[0] : categoryQuery;

  // helper: check if an event matches the category string (robust across possible shapes)
  const matchesCategory = (event: any, cat: string) => {
    if (!cat) return true;
    const c = String(cat).toLowerCase();

    // common field: event.category (string)
    if (event.category && String(event.category).toLowerCase().includes(c)) return true;

    // common field: event.category_name
    if (event.category_name && String(event.category_name).toLowerCase().includes(c)) return true;

    // common field: event.categories (array of strings or objects)
    if (Array.isArray(event.categories)) {
      // array of strings
      if (event.categories.some((x: any) => String(x).toLowerCase().includes(c))) return true;
      // array of objects with name/key
      if (
        event.categories.some(
          (x: any) =>
            x &&
            String(x.name || x.title || x.label || "")
              .toLowerCase()
              .includes(c)
        )
      )
        return true;
    }

    // fallback: maybe category exists on has_creator or tags
    if (event.tags && Array.isArray(event.tags) && event.tags.some((t: any) => String(t).toLowerCase().includes(c))) return true;

    // fallback: match against event.name as last resort (keeps behavior predictable)
    if (event.name && String(event.name).toLowerCase().includes(c)) return true;

    return false;
  };

  // compute displayed events (preserve original data if no category param)
  const displayed = useMemo(() => {
    if (!categoryParam) return data;
    return data.filter((ev) => matchesCategory(ev, categoryParam as string));
  }, [data, categoryParam]);

  return data.length > 0 ? (
    <>
      <div className="my-12 md:mx-auto md:max-w-7xl md:px-10">
        <div className="flex justify-between items-center text-dark mb-4 px-6">
          <h3 className={styles.heading}>Event</h3>
          <Link href="/event" className="text-primary-base flex gap-2 items-center">
            Lihat Semua
            <FontAwesomeIcon icon={faCircleArrowRight} />
          </Link>
        </div>
        {!loading ? (
          <div className={`${styles.eventContainer2} min-h-80 gap-1 items-center w-full pb-3 md:px-3 px-0 md:ml-0`}>
            {displayed.map((event: any) => (
              <div className={styles.eventCard} key={event.id}>
                <EventCard
                  id={event.id}
                  maxWidth={300}
                  title={event.name}
                  img={event.image_url ?? ""}
                  date={new Date(event.start_date)}
                  end={new Date(event.end_date)}
                  slug={event.slug}
                  location={event.location_city}
                  price={event.starting_price}
                  creatorImg={event.has_creator?.image}
                  creator={event.has_creator?.name}
                  creatorSlug={event.has_creator?.slug} // 🔹 tetap ada
                  verified={event.has_creator?.is_verified}
                  is_promo={event.is_promo}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`${styles.eventContainer2} min-h-80 gap-6 items-center w-full pb-3 md:px-3 px-0 md:ml-0`}>
            <EventCardLoading />
            <EventCardLoading />
            <EventCardLoading />
          </div>
        )}
      </div>
    </>
  ) : (
    <>
      <p className="font-semibold text-dark">Belum ada event</p>
    </>
  );
};

export default EventList;
