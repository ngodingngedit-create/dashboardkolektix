import React, { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { Tabs, Tab } from "@nextui-org/react";
import EventCard from "@/components/Card/EventCard";
import { Breadcrumbs, BreadcrumbItem, ScrollShadow } from "@nextui-org/react";
import { Get } from "@/utils/REST";
import Images from "@/components/Images";
import { useRouter } from "next/router";
import { MerchListResponse } from "../dashboard/merch/type";
import MerchandiseCard from "@/components/Card/MerchandiseCard";

interface Creator {
  id: string;
  name: string;
  image: string;
  member_since: string;
  created_at: string;
}

interface Event {
  id: string;
  name: string;
  image_url: string;
  end_date: string;
  start_date: string;
  slug: string;
  location_city: string;
  starting_price: string;
  has_creator: {
    slug: string | undefined;
    id: string | undefined;
    image: string;
    name: string;
    name_event_organizer: string;
    created_at: string;
  };
}

const tabData = [
  { key: "event", label: "Event" },
  { key: "merchandise", label: "Merchandise" },
  { key: "venue", label: "Venue" },
  { key: "lowongan", label: "Lowongan" },
  { key: "talent", label: "Talent" },
];

const MenuCreator = [
  { key: "1", label: "Event Aktif" },
  { key: "2", label: "Event Lalu" },
];

const CreatoMenu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Event Aktif");
  const [activeTab, setActiveTab] = useState<string>("event");
  const [creatorData, setCreatorData] = useState<Creator | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [merchandise, setmMerchandise] = useState<MerchListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { slug } = router.query;

  const getData = () => {
    setLoading(true);
    Get(`event-creator/${slug}`, {})
      .then((res: any) => {
        setEvents(res.data);
        setCreatorData(res.data.length > 0 ? res.data[0].has_creator : null);
        console.log("Data Creator:", res.data);
      })
      .catch((err: any) => {
        console.error("Error fetching data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
    Get("product", {})
      .then((res: any) => {
        setmMerchandise((res.data as MerchListResponse[]).filter((e) => e.creator.name == slug && e.product_status_id == 2));
        console.log(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getMemberSinceYear = () => {
    if (creatorData?.created_at) {
      return new Date(creatorData.created_at).getFullYear();
    }
    return "Tahun Tidak Tersedia";
  };

  const filterEvents = (isActive: boolean) => {
    const currentDate = new Date();
    return events.filter((event) => {
      const isEventEnded = currentDate > new Date(event.end_date);
      return isActive ? !isEventEnded : isEventEnded;
    });
  };

  useEffect(() => {
    if (slug) {
      getData();
    }
  }, [slug]);

  return (
    <div className="min-h-screen mx-auto">
      <div className="w-full">
        <img src="https://storage.nu.or.id/storage/post/16_9/mid/img-20211125-094750_1637808730.jpg" alt="Descriptive Alt Text" className="w-full h-52 sm:h-64 md:h-72 lg:h-80 object-cover" />
      </div>
      <div className="mx-auto w-full md:w-10/12 px-4 sm:px-6 md:px-8 lg:px-0">
        <div className="relative">
          <Images
            type="creator"
            path={creatorData?.image || ""}
            alt={creatorData?.name || "image"}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-medium object-cover border-3 border-white absolute -top-16 md:-top-20 lg:-top-24 shadow-xl"
            width={200}
            height={200}
          />
        </div>
        <div className="flex flex-col md:flex-row py-10 md:justify-between">
          <div>
            <p className="text-xl md:text-2xl font-semibold text-dark">{creatorData?.name || "Nama Organizer"}</p>
            <p className="text-sm md:text-base text-grey">Member sejak {getMemberSinceYear()}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-0">
            <Button label="Follow" color="primary" className="w-full h-10 md:w-40 text-white disabled:bg-gray-400 disabled:text-gray-400 disabled:opacity-50" />
            <Button label="Kirim Pesan" color="secondary" className="w-full h-10 md:w-40 text-dark disabled:bg-gray-400 disabled:text-gray-400 disabled:opacity-50" />
          </div>
        </div>
        <div className="w-full">
          <Tabs
            aria-label="Options"
            color="primary"
            variant="underlined"
            className="border border-b-2 border-primary-light-200 border-x-0 border-t-0"
            fullWidth
            classNames={{
              tabList: "gap-4 sm:gap-6 w-full relative rounded-none p-0 border-b border-divider pb-0 self-center font-semibold rounded-b-none bg-white",
              cursor: "rounded-b-none border-b-2 border-b-primary-base",
              tab: "max-w-fit px-0 h-10 sm:h-12",
            }}
            onSelectionChange={(key) => setActiveTab(String(key))}
          >
            {tabData.map(({ key, label }) => (
              <Tab
                key={key}
                title={
                  <div className="flex items-center text-medium space-x-2">
                    <span>{label}</span>
                  </div>
                }
              />
            ))}
          </Tabs>

          {/* Hanya tampilkan ScrollShadow jika tab yang aktif adalah "Event" */}
          {activeTab === "event" && (
            <ScrollShadow orientation="horizontal" className="max-w-full flex gap-2 pb-3 mt-3">
              {MenuCreator.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setActiveCategory(item.label)}
                  className={`cursor-pointer flex rounded-2xl items-center justify-center py-1 px-3 border ${activeCategory !== item.label ? "text-dark-grey border-primary-light-200" : "text-primary-dark border-primary-dark"}`}
                >
                  <p className="whitespace-nowrap">{item.label}</p>
                </div>
              ))}
            </ScrollShadow>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 gap-x-[20px] mt-5 !w-full mb-[50px]">
            {activeTab === "event" &&
              (activeCategory === "Event Aktif" ? (
                filterEvents(true).length > 0 ? (
                  filterEvents(true).map((event) => (
                    <EventCard
                      id={event.id}
                      key={event.id}
                      title={event.name}
                      img={event.image_url}
                      end={new Date(event.end_date)}
                      date={new Date(event.start_date)}
                      slug={event.slug}
                      location={event.location_city}
                      price={Number(event.starting_price)}
                      creatorImg={event.has_creator?.image}
                      creator={event.has_creator?.name}
                      creatorSlug={event.has_creator?.slug}
                    />
                  ))
                ) : (
                  <p className="text-center col-span-full mb-[20px]">No active events available for the selected category.</p>
                )
              ) : filterEvents(false).length > 0 ? (
                filterEvents(false).map((event) => (
                  <EventCard
                    id={event.id}
                    key={event.id}
                    title={event.name}
                    img={event.image_url}
                    end={new Date(event.end_date)}
                    date={new Date(event.start_date)}
                    slug={event.slug}
                    location={event.location_city}
                    price={Number(event.starting_price)}
                    creatorImg={event.has_creator?.image}
                    creator={event.has_creator?.name}
                    creatorSlug={event.has_creator?.slug}
                  />
                ))
              ) : (
                <p className="text-center col-span-full">No past events available for the selected category.</p>
              ))}

            {activeTab == "merchandise" && (
              <>
                {merchandise.map((item) => (
                  <MerchandiseCard
                    key={item.id}
                    name={item.product_name}
                    price={parseInt((item?.product_varian?.length ?? 0) > 0 ? item.product_varian[0].price : item.price)}
                    sale={0}
                    creator={item.creator.name}
                    creatorid={item.creator.id}
                    redirect={`/merchandise/${item.slug}`}
                    image={item.product_image.length > 0 ? item.product_image[0].image_url : undefined}
                    location={item.has_store_location?.store_name}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatoMenu;
