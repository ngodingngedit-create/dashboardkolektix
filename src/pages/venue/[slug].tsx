import React, { useEffect, useMemo, useState } from 'react';
import foto from '../../assets/images/Banner-amis.png';
import CreatorTitle from '@/components/Creator/CreatorTitle';
import Button from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronLeft, faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { Chip, DateInput } from '@nextui-org/react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
import InputField from '@/components/Input';
import { useRouter } from 'next/router';
import fetch from '@/utils/fetch';
import { EventListResponse } from '../dashboard/my-event/type';
import { useClickOutside, useListState, useSetState } from '@mantine/hooks';
import { AspectRatio, Box, Card, Flex, Image as ImageM, NumberFormatter, UnstyledButton, Button as ButtonM, Tooltip, Modal, Stack, Text, ActionIcon } from '@mantine/core';
import { VenueListResponse } from '../dashboard/venue/type';
import useLoggedUser from '@/utils/useLoggedUser';
import { Carousel } from '@mantine/carousel';
import Link from 'next/link';
import Chat from '@/components/chat';
import { DateInput as DateInputM} from '@mantine/dates';
import moment from 'moment';
import Cookies from 'js-cookie';
import { VenueBookingOrder } from '../venue-order';
import { Icon } from '@iconify/react/dist/iconify.js';
import AuthModal from '@/components/AuthModal';

const facility = ['Free Wifi', 'Toilet', 'Ruangan Full AC', 'Kursi', 'Lighting', 'Stage', 'Parking Area', 'Rest Area', 'Sound System', 'Back Stage'];

export type FacilitiesList = { facility_name: string; facility_description: string };

const VenueDetail = () => {
    const router = useRouter();
    const { slug } = router.query;
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [data, setData] = useState<VenueListResponse>();
    const [facilities, setFacilities] = useState<FacilitiesList[]>();
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [openChat, setOpenChat] = useState(false);
    const [modalBooking, setModalBooking] = useState(false);
    const [date, setDate] = useSetState({
      start: '',
      end: ''
    });

    const clickOutsideChat = useClickOutside(() => {
        if (Boolean(user?.id) && openChat) {
            setTimeout(() => {
                setOpenChat(false);
            }, 500);
        }
    });

    const handleArrowClick = (direction: 'left' | 'right') => {
      if (direction === 'left') {
          if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear((prevYear) => prevYear - 1);
          } else {
              setCurrentMonth((prevMonth) => prevMonth - 1);
          }
      } else {
          if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear((prevYear) => prevYear + 1);
          } else {
              setCurrentMonth((prevMonth) => prevMonth + 1);
          }
      }
  };

    const eventList = useMemo(() => {
        return data?.has_booked_venue?.filter((e) => e?.start_date.slice(0, 7) == `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
    }, [currentMonth]);

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

    useEffect(() => {
        if (Boolean(slug)) getData();
    }, [slug]);

    const getData = async () => {
        await fetch<any, VenueListResponse>({
            url: `venue/${slug}`,
            method: 'GET',
            before: () => setLoading.append('getdata'),
            success: (data) => {
                data.data && setData(data.data);
                data['dataFacilities'] && setFacilities(data['dataFacilities'] as FacilitiesList[]);
            },
            complete: () => setLoading.filter((e) => e != 'getdata')
        });
    };

    const handleOrder = () => {
      if (data?.id) {
        Cookies.set('venue_order_data', JSON.stringify({
          id: data?.id,
          slug: data?.slug,
          date_start: date.start,
          date_end: date.end
        } satisfies VenueBookingOrder));
        setLoading.append('submit');
        router.push('/venue-order');
      }
    }

    return (
        <div className="max-w-5xl min-h-screen mx-auto py-20 px-4 sm:px-8 md:px-12 lg:px-0">
            <div ref={clickOutsideChat} className={`${openChat ? '' : 'hidden'}`}>
                <Chat toggleOpenTab={() => setOpenChat(!openChat)} openTab={openChat} creatorIdOpen={data?.creator_id} />
                <AuthModal visible={openChat && !user?.id} onClose={() => setOpenChat(false)} />
            </div>
            <div className="">
                <Breadcrumbs>
                    <BreadcrumbItem>Beranda</BreadcrumbItem>
                    <BreadcrumbItem>List Venue</BreadcrumbItem>
                    <BreadcrumbItem>{data?.name}</BreadcrumbItem>
                </Breadcrumbs>
            </div>
            {/* <div className='flex w-full py-5 h-[500px] gap-2'>
        <ImageM src={data?.venue_gallery[0].image_url} w={100} alt='Banner' />
      </div> */}
            <Box my={20}>
                <Card p={0} radius={8}>
                    <Carousel
                        initialSlide={galleryIndex}
                        onSlideChange={(e) =>
                            setTimeout(() => {
                                setGalleryIndex(e);
                            }, 0)
                        }
                    >
                        {data?.venue_gallery.map((e, i) => (
                            <Carousel.Slide key={i}>
                                <AspectRatio ratio={16 / 5} className={`hidden md:block`}>
                                    <ImageM src={e.image_url} />
                                </AspectRatio>
                                <AspectRatio ratio={16 / 9} className={`md:hidden`}>
                                    <ImageM src={e.image_url} />
                                </AspectRatio>
                            </Carousel.Slide>
                        ))}
                    </Carousel>
                </Card>
                <Flex gap={7} mt={10} className={`overflow-x-auto`}>
                    {data?.venue_gallery.map((e, i) => (
                        <UnstyledButton onClick={() => setGalleryIndex(i)} key={i}>
                            <Card withBorder p={0} radius={8} opacity={galleryIndex == i ? 0.5 : 1}>
                                <AspectRatio w={50}>
                                    <ImageM src={e.image_url} />
                                </AspectRatio>
                            </Card>
                        </UnstyledButton>
                    ))}
                </Flex>
            </Box>
            <div className="flex flex-col md:flex-row text-dark gap-4">
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                    <div>
                        <h3 className="font-semibold mb-2 capitalize">{data?.name}</h3>
                        <p className="text-sm">{data?.location}</p>
                    </div>
                    <div className="border-y-primary-light-200 border-y flex justify-between items-center py-4">
                        <CreatorTitle image={data?.creator?.image_url} creator={data?.creator?.name ?? '-'} location="Jakarta" />
                        <ButtonM color="#194e9e" radius={999} variant="outline" component={Link} href={`/creator/${data?.creator.name}`}>
                            Lihat Host
                        </ButtonM>
                    </div>
                    <div className="border-b border-b-primary-light-200 pb-4">
                        <h6 className="text-lg font-semibold mb-4">Spesifikasi</h6>
                        <div className="flex flex-col md:flex-row items-start md:items-center mt-4">
                            <div className="flex-1 border-b md:border-r border-primary-light-200 pb-4 md:pb-0 md:pr-4 md:mr-4">
                                <p className="text-grey text-sm mb-1">Maksimal Kapasitas</p>
                                <p className="font-semibold text-lg">
                                    <NumberFormatter prefix="" value={data?.max_capacity} />
                                </p>
                            </div>
                            <div className="flex-1 pt-4 md:pt-0">
                                <p className="text-grey text-sm mb-1">Jumlah Kursi</p>
                                <p className="font-semibold text-lg">
                                    <NumberFormatter prefix="" value={data?.seat_capacity} />
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-grey text-sm mb-2">Fasilitas</p>
                            <div className="flex flex-wrap">
                                {data?.facility?.map((el, idx) => (
                                    <Chip color="default" size="sm" key={idx} classNames={{ base: 'mr-2 mb-2', content: 'font-semibold' }}>
                                        {el}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-b-primary-light-200 pb-4">
                        <h6>Tentang Venue</h6>
                        <p className="mt-4">{data?.description}</p>
                    </div>

                    {(!!data?.location_detail || data?.location?.startsWith('https://www.google.com/maps')) && (
                        <div>
                            <h6>Lokasi Venue</h6>

                            {!!data?.location_detail && <p className="text-grey mt-4">{data?.location_detail}</p>}

                            {data?.location?.startsWith('https://www.google.com/maps') && (
                                <div className="mt-4">
                                    <iframe
                                        src={
                                            data?.location ??
                                            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.239516341929!2d106.82918257586827!3d-6.232123761033168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e8cbb9e497%3A0xc9b90fc0ac3963bc!2sMenara%20Kadin%20Indonesia%2C%20Jl.%20H.%20R.%20Rasuna%20Said%20Blok%20X-5%20No.Kav.%202-3%2C%20RT.1%2FRW.2%2C%20Kuningan%2C%20Kuningan%20Tim.%2C%20Kecamatan%20Setiabudi%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2012950!5e0!3m2!1sid!2sid!4v1721144578839!5m2!1sid!2sid'
                                        }
                                        width="100%"
                                        height="200"
                                        style={{ border: 0, borderRadius: 10 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/3 sticky top-[100px]">
                    <div className="border border-primary-light-200 !hidden md:!flex rounded-lg p-4 flex-col gap-2 shadow-sm">
                        <div>
                            <p className="text-primary-base mb-1">Mulai dari</p>
                            <h6>
                                <NumberFormatter value={Math.round(data?.starting_price ?? 0)} />
                                <span className="text-grey">/Hari</span>{' '}
                            </h6>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
                          <DateInputM
                            minDate={new Date()}
                            maxDate={date.end ? new Date(date.end) : undefined}
                            value={date.start ? new Date(date.start) : undefined}
                            onChange={e => setDate({ start: moment(e).format('YYYY-MM-DD')})}
                            valueFormat='DD MMMM YYYY'
                            placeholder="Dari Tanggal"
                          />
                          <DateInputM
                            disabled={!Boolean(date?.start)}
                            minDate={date.start ? new Date(date.start) : undefined}
                            value={date.end ? new Date(date.end) : undefined}
                            onChange={e => setDate({ end: moment(e).format('YYYY-MM-DD')})}
                            valueFormat='DD MMMM YYYY'
                            placeholder="Sampai Tanggal"
                          />
                        </div>
                        <Flex align="center" gap={10}>
                            <Button loading={loading.includes('submit')} onClick={handleOrder} disabled={!date.start || !date.end} color="primary" label="Book" fullWidth />
                            <ActionIcon onClick={() => setOpenChat(true)} variant="transparent" color="#194e9e" className={`shrink-0`}>
                                <Icon icon="fluent:chat-12-regular" className={`text-[30px]`} />
                            </ActionIcon>
                        </Flex>
                    </div>
                    <div className="border border-primary-light-200 rounded-lg flex flex-col gap-2 shadow-sm mt-7">
                        <div className="border-b border-primary-light-200 p-4">
                            <h6>Jadwal Event</h6>
                        </div>
                        <div className="px-4 py-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-semibold">{monthNames[currentMonth]} {currentYear}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleArrowClick('left')} className="w-8 h-8 rounded-full border border-primary-light-200">
                                        <FontAwesomeIcon icon={faCircleChevronLeft} className="text-grey" />
                                    </button>
                                    <button onClick={() => handleArrowClick('right')} className="w-8 h-8 rounded-full border border-primary-light-200">
                                        <FontAwesomeIcon icon={faCircleChevronRight} className="text-grey" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col w-full">
                                {eventList?.map((e, i) => (
                                    <div key={i} className="!w-full flex gap-4 mt-4">
                                        <div className="w-full md:w-[15%] mt-[5px]">
                                            <p>{moment(e?.start_date).format('dd')}</p>
                                            <p className="font-semibold text-lg">{moment(e?.start_date).format('DD')}</p>
                                        </div>
                                        <Stack gap={10} w="100%">
                                            <div className="w-full md:w-[85%] border border-primary-light-200 rounded-md p-3 mt-2 md:mt-0">
                                                <AspectRatio ratio={16 / 5} mb={10} w="100%">
                                                    <ImageM src={e?.event_banner} bg="gray.1" radius={8} />
                                                </AspectRatio>
                                                <p className="font-semibold capitalize">{e?.event_name}</p>
                                                {/* <p className="text-grey">12:00 - 14:00</p> */}
                                            </div>
                                        </Stack>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Box mt={30} />

            <Modal opened={modalBooking} onClose={() => setModalBooking(false)} title="Pilih Tanggal Booking" centered>
                <Stack gap={10}>
                    <DateInputM
                        minDate={new Date()}
                        maxDate={date.end ? new Date(date.end) : undefined}
                        value={date.start ? new Date(date.start) : undefined}
                        onChange={e => setDate({ start: moment(e).format('YYYY-MM-DD')})}
                        valueFormat='DD MMMM YYYY'
                        placeholder="Dari Tanggal"
                    />
                    <DateInputM
                        disabled={!Boolean(date?.start)}
                        minDate={date.start ? new Date(date.start) : undefined}
                        value={date.end ? new Date(date.end) : undefined}
                        onChange={e => setDate({ end: moment(e).format('YYYY-MM-DD')})}
                        valueFormat='DD MMMM YYYY'
                        placeholder="Sampai Tanggal"
                    />
                    <ButtonM
                        loading={loading.includes('submit')}
                        disabled={!date.start || !date.end}
                        onClick={handleOrder}
                        className={`shrink-0`}
                        color="#194e9e"
                        radius="xl"
                    >
                        Booking Sekarang
                    </ButtonM>
                </Stack>
            </Modal>

            <Card pos="fixed" className={`z-30 bottom-0 right-0 w-full border-t border-t-[#d0d0d0]`} py={10}>
                <Flex w="100%" maw={1024} mx="auto" gap={10} wrap="wrap" justify="space-between" align="center">
                    <Stack gap={2}>
                        <Text size="xs" className={`!text-primary-base`}>Mulai Dari</Text>
                        <Text fw={600} size="sm"><NumberFormatter value={Math.round(data?.starting_price ?? 0)} /> <Text component="span" size="sm" fw={400} c="gray">/ Hari</Text></Text>
                    </Stack>
                    <Flex align="center" gap={7}>
                        <ButtonM
                            loading={loading.includes('submit')}
                            onClick={() => setModalBooking(true)}
                            className={`shrink-0`}
                            color="#194e9e"
                            radius="xl"
                        >
                            Booking Sekarang
                        </ButtonM>
                        <ActionIcon onClick={() => setOpenChat(true)} variant="transparent" color="#194e9e" className={`shrink-0`}>
                            <Icon icon="fluent:chat-12-regular" className={`text-[24px]`} />
                        </ActionIcon>
                    </Flex>
                </Flex>
            </Card>
        </div>
    );
};

export default VenueDetail;
