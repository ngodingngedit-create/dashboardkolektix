import { useContext, useEffect, useMemo, useState } from "react";
import DateTab from "@/components/DateTab";
import { TicketProps } from "@/utils/globalInterface";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { ActionIcon, Alert, Badge, Button, Card, Divider, Drawer, Flex, NumberFormatter, Stack, Text, Tooltip, UnstyledButton, Image } from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Context } from "@/pages/event/[slug]";
import { useTranslation } from "react-i18next";
import config from "@/Config";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { Modal, ModalContent } from "@nextui-org/react";

interface Props {
  counts: { [key: number]: number | string[] };
  setCounts: (counts: { [key: string]: number | string[] }) => void;
  data: TicketProps[];
  isGratis?: boolean;
  maxOrder?: number;
  isLogin: boolean;
  totalCount: number;
  totalSubtotalPrice: number;
  setStep: (step: number) => void;
  scrollToTop: () => void;
  selected: number;
  setSelected: (index: number) => void;
  storeLocalStorage: () => void;
  venue: any;
}

const TicketViewBlock = ({ maxOrder, isGratis, counts, setCounts, data, isLogin, totalSubtotalPrice, totalCount, scrollToTop, setStep, selected, setSelected, storeLocalStorage, venue }: Props) => {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(false);
  const [showVenue, setShowVenue] = useState(false);
  const [venueID, setVenueID] = useState<number | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const { ticket, setTicket } = useContext(Context);

  const { displayTotalCount, displayTotalSubtotalPrice } = useMemo(() => {
    const result = data.reduce(
      (acc, item) => {
        const id = item.id;
        if (id == null) return acc;

        const rawCount = counts[id];
        const physicalTicketQty = typeof rawCount === "number" ? rawCount : Array.isArray(rawCount) ? rawCount.length : 0;

        if (physicalTicketQty <= 0) return acc;

        const isBundling = Number(item.is_bundling ?? 0) === 1;
        const bundlingQty = Number(item.bundling_qty ?? 0);
        const price = Number(item?.price ?? 0);

        if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
          // 💡 PERUBAHAN PENTING:
          // physicalTicketQty = jumlah tiket fisik (misal: 2, 4, 6, ...)
          // bundlingQty = 2/3/4 (berapa tiket per paket)
          // packageCount = berapa paket yang dibeli
          const packageCount = Math.ceil(physicalTicketQty / bundlingQty);

          // Setiap paket = 1 tiket display
          acc.displayTotalCount += packageCount;
          // Harga per paket (bukan per tiket fisik)
          acc.displayTotalSubtotalPrice += price * packageCount;

          console.log(`Bundling item ${id}:`, {
            physicalTicketQty,
            bundlingQty,
            packageCount,
            price,
            addedToCount: packageCount,
            addedToPrice: price * packageCount,
          });
        } else {
          // Non-bundling: normal
          acc.displayTotalCount += physicalTicketQty;
          acc.displayTotalSubtotalPrice += price * physicalTicketQty;
        }

        return acc;
      },
      { displayTotalCount: 0, displayTotalSubtotalPrice: 0 }
    );

    console.log("FINAL RESULT:", result);
    return result;
  }, [data, counts]);

  const router = useRouter();
  const redirectLogin = () => {
    Cookies.set("ticketCount", JSON.stringify(counts));
    Cookies.set("prevPath", router.asPath);
    selected && Cookies.set("selected", selected.toString());
    router.push("/auth");
  };

  const total = useMemo(() => {
    return ticket?.reduce((c, n) => c + n.subtotal_price, 0);
  }, [ticket]);

  const handleDelete = (index: number) => {
    if (ticket && setTicket) {
      const id = ticket[index].event_ticket_id;
      const newCount = Object.keys(counts).reduce((acc, q) => {
        if (parseInt(q) !== id) {
          acc[parseInt(q)] = counts[parseInt(q)];
        }
        return acc;
      }, {} as { [key: number]: number | string[] });

      setCounts(newCount ?? {});

      setTicket(ticket?.filter((_, i) => i != index));
    }
  };

  const SummaryBody = () => (
    <Stack gap={15}>
      <Flex justify="space-between" gap={10} wrap="wrap" align="center" w="100%">
        <Text size="sm" fw={600}>
          {t("selectedTicket")}
        </Text>
        <UnstyledButton onClick={() => setEdit(!edit)}>
          <Flex align="center" className={`${edit ? "[&_*]:!text-grey" : "[&_*]:!text-primary-base"}`} gap={8}>
            <Text fw={600} size="sm">
              {edit ? t("selectedTicketEndEdit") : "Edit"}
            </Text>
            {!edit && <Icon icon="iconoir:edit" />}
          </Flex>
        </UnstyledButton>
      </Flex>

      <Divider />

      <Stack gap={15}>
        {ticket?.map((e, i) => {
          // Cari data original ticket untuk cek is_bundling
          const originalTicket = data.find((item) => item.id === e.event_ticket_id);
          const isBundling = Number(originalTicket?.is_bundling ?? 0) === 1;
          const bundlingQty = Number(originalTicket?.bundling_qty ?? 0);

          // Tentukan display quantity: jika bundling 2-4, tampilkan 1
          const displayQty = isBundling && bundlingQty >= 2 && bundlingQty <= 99 ? 1 : e.seat_number?.length ?? e.qty_ticket;

          // Tentukan display price: jika bundling 2-4, tampilkan price bukan subtotal_price
          const displayPrice = isBundling && bundlingQty >= 2 && bundlingQty <= 99 ? e.price : e.subtotal_price;

          return (
            <Flex gap={10} wrap="wrap" justify="space-between" key={i}>
              <Flex gap={10}>
                <Icon icon="fa-solid:ticket-alt" className={`text-primary-base mt-[2px]`} />
                <Stack gap={0}>
                  <Text size="sm">
                    Tiket {e.name}{" "}
                    <Badge ml={5} className={`translate-y-[-3px]`} size="xs" color="red">
                      {displayQty}x
                    </Badge>
                  </Text>
                  {e.seat_number && (
                    <Text size="xs" c="gray">
                      Seat No: {e.seat_number.join(", ")}
                    </Text>
                  )}
                </Stack>
              </Flex>

              <Text fw={600} ml="auto" size="sm">
                <NumberFormatter value={displayPrice} />
              </Text>

              {edit && (
                <Tooltip label="Hapus Tiket">
                  <ActionIcon onClick={() => handleDelete(i)} variant="transparent" color="red" p={0} size="xs">
                    <Icon icon="uiw:close" />
                  </ActionIcon>
                </Tooltip>
              )}
            </Flex>
          );
        })}

        {(ticket?.length ?? 0) == 0 && (
          <Alert icon={<Icon icon="uiw:information-o" />} color="gray" variant="light" radius={10}>
            {t("selectedTicketEmpty")}
          </Alert>
        )}

        {(ticket?.length ?? 0) > 0 && (
          <>
            <Divider />

            <Flex gap={10} wrap="wrap" justify="space-between">
              <Text size="sm">Total ({displayTotalCount} Tiket)</Text>
              <Text fw={600} ml="auto" size="sm">
                <NumberFormatter value={displayTotalSubtotalPrice} />
              </Text>
            </Flex>
          </>
        )}
      </Stack>
    </Stack>
  );

  useEffect(() => {
    console.log("venue", venue);
  }, [venue]);

  return (
    <div className="text-dark my-5 ">
      <Drawer opened={openDetail} onClose={() => setOpenDetail(!openDetail)} withCloseButton={false} position="bottom" radius="20px 20px 0 0" size="50vh">
        <Stack gap={20} py={15} px={5} mih="calc(50vh - 30px)">
          {/* <Text c="gray" ta="center" size="sm">Detail Pembayaran</Text> */}
          <SummaryBody />
          <Button
            size="md"
            mt="auto"
            disabled={totalCount === 0}
            onClick={() => {
              if (isLogin) {
                Cookies.remove("ticketCount", { path: "/" });
                setStep(33);
                scrollToTop();
              } else storeLocalStorage();
            }}
          >
            Beli Tiket
          </Button>
        </Stack>
      </Drawer>

      <Flex gap={20}>
        <div className="rounded-t-xl shadow-md p-4 w-full max-w-[700px] md:py-8 overflow-y-scroll h-100 border-2 border-primary-light-200 mb-[60px] md:mb-[90px]" id="ticket-picker">
          <DateTab maxOrder={maxOrder} counts={counts} setCounts={setCounts} data={data} isLogin={isLogin} selected={selected} setSelected={setSelected} />
          <button></button>
        </div>

        <Stack>
          <Card miw={320} withBorder className={`flex-grow h-fit md:max-w-[400px] md:!block !hidden !sticky top-[90px]`} radius={10} p={20}>
            <SummaryBody />
          </Card>

          {venue?.length > 0 && (
            <Card miw={320} withBorder className={`flex-grow h-fit md:max-w-[400px] md:!block !hidden !sticky top-[90px]`} radius={10} p={20}>
              <Stack gap={15}>
                <Flex justify="space-between" gap={10} wrap="wrap" align="center" w="100%">
                  <Text size="sm" fw={600}>
                    Venue Layout
                  </Text>
                </Flex>
                <Divider />
                <Stack gap={15}>
                  <Slide autoplay={false}>
                    {venue?.map((e: { title: string; image: string }, i: number) => (
                      <>
                        <UnstyledButton
                          key={i}
                          onClick={() => {
                            setShowVenue(!showVenue);
                          }}
                        >
                          <Image src={`${config.assetUrl}event/${e.image}`} alt="image" radius={8} mt={-5} />
                        </UnstyledButton>
                      </>
                    ))}
                  </Slide>
                </Stack>
              </Stack>
            </Card>
          )}
        </Stack>
      </Flex>

      <div className="flex justify-between items-center bg-[#eff5ff] px-5 py-3 rounded-b-xl shadow-md w-full fixed bottom-0 left-0 z-50">
        <div>
          <p>Total {displayTotalCount} Tiket</p>
          <p className="font-semibold">Rp {displayTotalSubtotalPrice.toLocaleString("id-ID")}</p>
        </div>

        <div className="flex gap-4 items-center">
          <Button
            onClick={() => setOpenDetail(true)}
            rightSection={
              <Flex gap={10} align="center">
                <Badge color="red" size="sm">
                  {totalCount}
                </Badge>
                <Icon icon="uiw:up" />
              </Flex>
            }
            variant="transparent"
            className={`md:!hidden !text-primary-base`}
          >
            Detail
          </Button>
          {isLogin ? (
            <button
              className="bg-primary-base text-white px-4 py-2 font-semibold text-sm rounded-2xl disabled:bg-primary-disabled disabled:cursor-not-allowed"
              onClick={() => {
                Cookies.remove("ticketCount", { path: "/" });
                setStep(33);
                scrollToTop();
              }}
              disabled={totalCount === 0}
            >
              {isGratis ? "Registrasi" : "Beli"} Tiket {totalCount > 0 && `x${totalCount}`}
            </button>
          ) : (
            <button className="bg-primary-base text-white px-4 py-2 font-semibold text-sm rounded-2xl disabled:bg-primary-disabled disabled:cursor-not-allowed" onClick={storeLocalStorage} disabled={totalCount === 0}>
              {isGratis ? "Registrasi" : "Beli"} Tiket {totalCount > 0 && `x${totalCount}`}
            </button>
          )}
        </div>
      </div>
      <Modal isOpen={showVenue} onOpenChange={setShowVenue} placement="auto" size="4xl" closeButton aria-labelledby="modal-title" aria-describedby="modal-description">
        <ModalContent className="text-dark font-inter h-full">
          {(onClose) => {
            return (
              <div className="flex flex-col w-full h-full overflow-auto">
                <Slide autoplay={false}>
                  {venue?.map((e: { title: string; image: string }, i: number) => (
                    <>
                      <Image src={`${config.assetUrl}event/${e.image}`} alt="image" radius={8} mt={-5} />
                    </>
                  ))}
                </Slide>
              </div>
            );
          }}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TicketViewBlock;
