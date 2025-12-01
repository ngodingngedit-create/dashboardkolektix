import Foto from "@images/Foto=2.png";
import { useState } from "react";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate, formatYear } from "@/utils/useFormattedDate";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from "next/router";
import { faLocationDot, faBookmark as bookmarkSolid } from "@fortawesome/free-solid-svg-icons";
import Images from "@/components/Images";
import Link from "next/link";
import Button from "@/components/Button";
import { ActionIcon, Card, CopyButton, Flex, TextInput, Tooltip, Image, AspectRatio } from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";

interface EventCardProps {
  slug?: string;
  title?: string;
  date: string;
  end: string;
  location?: string;
  img: string | null;
  description?: string;
  creatorImg?: string;
  creator: string;
  bookmark?: boolean;
  price?: number;
  withoutButton?: boolean;
  status?: string;
  eventStatus: string;
  event_status_id?: number;
  shareLink?: string;
}

const EventCardCreator = ({ shareLink, slug, title, date, location, img, withoutButton, end, status, eventStatus, event_status_id }: EventCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  const router = useRouter();

  const eventDate = (event: Date) => {
    const date = new Date(event);
    const month = date.toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    return month;
  };
  return (
    <div className="relative max-w-full min-w-full lg:min-w-60 w-full bg-white rounded-xl shadow-md mx-1 md:mx-0 border border-primary-light-200">
      <Link href={`/dashboard/my-event/${slug}`}>
        <div className="absolute right-0 top-0 p-3">
          <div className="bg-light-grey text-dark py-1 px-3 rounded-full shadow-sm">
            <p className="text-xs">{eventStatus}</p>
          </div>
        </div>
        <AspectRatio ratio={1062 / 365}>
          <Image className={`!rounded-t-xl`} src={img} alt="Banner" />
        </AspectRatio>
      </Link>
      <div className="p-3">
        <Link href={`/event/${slug}`}>
          <h5 className="mb-2 text-lg font-semibold tracking-tight text-dark truncate max-w-[230px]">{title}</h5>
        </Link>
        <p className="text-grey text-sm mb-1">Tanggal & Waktu</p>
        <p className="mb-3 font-normal text-sm">
          <FontAwesomeIcon icon={faCalendar} className="mr-2 text-grey" />
          <span className="text-dark">{`${formatDate(date)} ${date !== end ? "-" + formatDate(end) : ""} ${formatYear(end)}`}</span>
        </p>

        <p className="text-grey text-sm mb-1">Venue</p>
        <p className="mb-3 font-normal text-sm">
          <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-grey" />
          <span className="text-grey">{location}</span>
        </p>
        <p className="text-grey text-sm mb-1">Halaman Event</p>
        {Boolean(shareLink) && (
          <Card p={0} mt={15}>
            <Flex align="center" gap={5}>
              <TextInput variant="filled" value={shareLink} readOnly size="xs" radius={10} />
              <CopyButton value={shareLink ?? "-"} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={"Copy"} withArrow position="right">
                    <ActionIcon color={"#194e9e"} variant="subtle" onClick={copy}>
                      <Icon icon="tabler:copy" />
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
              <Tooltip label={"Buka Link event"} withArrow position="right">
                <ActionIcon color={"#194e9e"} variant="subtle" component="a" href={shareLink} target="_blank" rel="noopener noreferrer">
                  <Icon icon="tabler:send" />
                </ActionIcon>
              </Tooltip>
            </Flex>
          </Card>
        )}
      </div>
      {!withoutButton &&
        event_status_id &&
        (event_status_id === 3 ? (
          <div className="border-t-1.5 border-dashed border-primary-light-200 grid grid-cols-2 justify-items-center w-full p-3 gap-x-2">
            <Button label="Lihat Detail" color="primary" fullWidth className="col-span-2 mb-2" onClick={() => router.push(`/dashboard/my-event/${slug}`)} />
            <Button label="Check In" color="secondary" fullWidth className="text-xs" onClick={() => router.push(`/dashboard/scan/${slug}`)} />
            <Button label="Penjualan" color="secondary" fullWidth className="text-xs" onClick={() => router.push(`/dashboard/my-event/sell/${slug}`)} />
          </div>
        ) : event_status_id === 2 ? (
          <div className="border-t-1.5 border-dashed border-primary-light-200 grid grid-cols-2 justify-items-center w-full p-3 gap-x-2">
            <Button label="Publish" color="primary" fullWidth className="text-xs" onClick={() => router.push(`/dashboard/my-event/checkin/${slug}`)} />
            <Button label="Edit" color="secondary" fullWidth className="text-xs" onClick={() => router.push(`/dashboard/my-event//${slug}`)} />
          </div>
        ) : (
          <div className="border-t-1.5 border-dashed border-primary-light-200 grid grid-cols-2 justify-items-center w-full p-3 gap-x-2">
            <Button label="Lihat Detail" color="primary" fullWidth className="col-span-2 mb-2" onClick={() => router.push(`/dashboard/my-event/${slug}`)} />
          </div>
        ))}
    </div>
  );
};

export default EventCardCreator;
