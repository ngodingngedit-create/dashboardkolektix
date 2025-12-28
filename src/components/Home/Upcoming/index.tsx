import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import { EventProps } from "@/utils/globalInterface";
import EventCard from "@/components/Card/EventCard";
import EventCardLoading from "@/components/Card/EventCard/loading";
import styles from "../index.module.css";
import React from "react";

interface UpcomingProps {
  className?: string;
  data: EventProps[];
  loading: boolean;
}

const Upcoming = ({ className, data, loading }: UpcomingProps) => {
  // console.log(data);
  const currentDate = new Date();

  const upcomingEvents = data.filter((event) => new Date(event.end_date) > currentDate);

  return (
    <div className="mb-12 md:mx-auto md:max-w-7xl md:px-10 md:mt-[15px]">
      {!loading && upcomingEvents.length === 0 ? null : (
        <>
          <div className="flex justify-between items-center mb-4 px-6 [&_*]:!text-white">
            <h3 className="font-bold">Segera Hadir!</h3>
            <Link href="/event" className="flex gap-2 items-center">
              Lihat Semua
              <FontAwesomeIcon icon={faCircleArrowRight} />
            </Link>
          </div>
          <div className={`${styles.eventContainer} min-h-80 items-center w-full pb-3 md:px-3 px-0 md:ml-0`}>
            <div className={styles.scrollTrack}>
              {!loading ? (
                upcomingEvents.length > 0 ? (
                  <>
                    {/* Set pertama */}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`first-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}

                    {/* Set kedua (untuk looping di desktop) */}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`second-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`second-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`second-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`second-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`second-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`second-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`second-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}
                    {upcomingEvents.map((event: EventProps, index) => (
                      <div className={styles.eventCard} key={`second-${event.id}-${index}`}>
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
                          creatorSlug={event.has_creator?.slug}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <p>No upcoming events found.</p>
                )
              ) : (
                <>
                  <EventCardLoading />
                  <EventCardLoading />
                  <EventCardLoading />
                  <EventCardLoading />
                  <EventCardLoading />
                  <EventCardLoading />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Upcoming;
