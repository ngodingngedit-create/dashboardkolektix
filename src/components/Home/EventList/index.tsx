import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import EventCardLoading from "@/components/Card/EventCard/loading";
import { EventProps } from "@/utils/globalInterface";
import EventCard from "@/components/Card/EventCard";
import styles from "../index.module.css";
import useWindowSize from "@/utils/useWindowSize";
import React from "react";

interface ListProps {
  data: EventProps[];
  loading?: boolean;
}

const EventList = ({ data, loading }: ListProps) => {
  const { width } = useWindowSize();

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
            {data.map((event: any) => (
              <div className={styles.eventCard} key={event.id}>
                <EventCard
                  id={event.id}
                  maxWidth={300}
                  title={event.name}
                  img={event.image_url}
                  date={event.start_date}
                  end={event.end_date}
                  slug={event.slug}
                  location={event.location_city}
                  price={event.starting_price}
                  creatorImg={event.has_creator?.image}
                  creator={event.has_creator?.name}
                  creatorSlug={event.has_creator?.slug}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`${styles.eventContainer} min-h-80 gap-6 items-center w-full pb-3 md:px-3 px-0 md:ml-0`}>
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
