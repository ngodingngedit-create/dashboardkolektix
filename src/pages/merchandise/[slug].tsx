// import { useContext, useEffect, useMemo, useState } from 'react';
// import Foto from '../../assets/images/amis-banner.png';
// import CreatorTitle from '@/components/Creator/CreatorTitle';
// import Image, { StaticImageData } from 'next/image';
// import { faCirclePlus, faMinus, faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useRouter } from 'next/router';
// import { MerchListResponse } from '../dashboard/merch/type';
// import { Get, Post } from '@/utils/REST';
// import { useClickOutside, useListState } from '@mantine/hooks';
// import { NumberFormatter, Button, Flex, ActionIcon, AspectRatio, Card, Center } from '@mantine/core';
// import { Icon } from '@iconify/react/dist/iconify.js';
// import _ from 'lodash';
// import useLoggedUser from '@/utils/useLoggedUser';
// import { toast } from 'react-toastify';
// import Cookies from 'js-cookie';
// import { AppMainContext } from '../_app';
// import AuthModal from '@/components/AuthModal';
// import ChatBox from '@/components/chat';
// import { notifications } from '@mantine/notifications';

// export type CartStorage = {
//     variant_id: number,
//     product_id: number,
//     qty: number,
//     price: number,
// }

// const MerchandiseDetail = () => {
//     const [isr, setIsr] = useState(false);
//     const [mainData, setMainData] = useState<MerchListResponse>();
//     const [colorOpt, setColorOpt] = useState<string>('');
//     const [count, setCount] = useState<number>(0);
//     const [imageActive, setImage] = useState<number>(0);
//     const [loading, setLoading] = useListState<string>();
//     const [selectedVariant, setSelectedVariant] = useState<number>();
//     const [openChat, setOpenChat] = useState(false);
//     const user = useLoggedUser();
//     const router = useRouter();
//     const { slug } = router.query;

//     const { cartCount, setCartCount } = useContext(AppMainContext);

//     const clickOutsideChat = useClickOutside(() => {

//     });

//     useEffect(() => {
//         setIsr(true);
//     }, []);

//     useEffect(() => {
//         getData();
//     }, [isr]);

//     useEffect(() => {
//         const stock = _.find(mainData?.product_varian, ['id', selectedVariant])?.stock_qty;
//         setCount((stock ?? 0) > 1 ? 1 : 0);
//     }, [selectedVariant]);

//     const getData = () => {
//         Get(`product/${slug}`, {})
//             .then((res: any) => {
//                 setMainData(res.data);
//                 //console.log(res.data);
//                 if ((res.data?.product_varian?.length) ?? 0 > 0) {
//                     setSelectedVariant(res.data?.product_varian[0].id);
//                     setCount(res.data?.product_varian[0].stock_qty > 1 ? 1 : 0);
//                 } else {
//                     setCount(res.data?.qty > 1 ? 1 : 0);
//                 }
//                 if (res.data)
//                 setLoading.filter((e) => e != 'getdata');
//             })
//             .catch((err) => {
//                 console.log(err);
//                 setLoading.filter((e) => e != 'getdata');
//             });
//     };

//     const handleAddCart = () => {
//         setLoading.append('addcart');
//         // if (user?.id) {
//         //     Post('cart', {
//         //         user_id: user?.id,
//         //         variant_id: selectedVariant,
//         //         product_id: mainData?.id,
//         //         qty: count,
//         //         price: parseInt(selectedVariant ? _.find((mainData?.product_varian ?? []), ['id', selectedVariant])?.price ?? '0' : (mainData?.price ?? '0')),
//         //         description: ''
//         //     })
//         //     .then((res: any) => {
//         //         if (res.id) {
//         //             toast.success('Berhasil menambah produk ke keranjang');
//         //             setTimeout(() => {
//         //                 router.push('/merch-cart');
//         //             }, 2000)
//         //         }
//         //         setLoading.filter(e => e != 'addcart');
//         //     })
//         //     .catch((err) => {
//         //         console.log(err);
//         //         setLoading.filter(e => e != 'addcart');
//         //     });
//         // } else {
//             const cartData = JSON.parse(Cookies.get('_cart') ?? '[]') as CartStorage[];
//             const has = cartData.find(e => e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true));
//             const selectedQty = (mainData?.product_varian.length ?? 0) > 0
//                 ? mainData?.product_varian.find(e => e.id == selectedVariant)?.stock_qty
//                 : mainData?.qty;

//             const added = has
//                 ? _.min([has?.qty + count, selectedQty]) ?? 0
//                 : _.min([count, selectedQty]) ?? 0;

//             // Update the cartData and set the appropriate quantities
//             if (has) {
//                 cartData.forEach((e, index) => {
//                     if (e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true)) {
//                         cartData[index] = { ...e, qty: added };
//                     }
//                 });
//             } else {
//                 cartData.push({
//                     variant_id: selectedVariant ?? 0,
//                     product_id: mainData?.id ?? 0,
//                     qty: added,
//                     price: parseInt(selectedVariant ? _.find((mainData?.product_varian ?? []), ['id', selectedVariant])?.price ?? '0' : (mainData?.price ?? '0')),
//                 });
//             }

//             // Calculate the new cart count
//             const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);

//             // Update state and cookies
//             setCartCount && setCartCount(newCartCount);
//             Cookies.set('_cart', JSON.stringify(cartData));

//             notifications.show({
//                 color: 'Green',
//                 position: 'top-right',
//                 message: `Berhasil menambah produk ke keranjang`
//             });
//             setLoading.filter(e => e != 'addcart');

//         // }
//     };

//     const handleDirectOrder = () => {
//         Cookies.set('order_data', JSON.stringify([
//             {
//                 product_id: mainData?.id,
//                 variant_id: selectedVariant,
//                 qty: count
//             }
//         ]))
//         router.push('/merch-order');
//     };

//     if (!mainData) return <></>;

//     return (
//     <>
//         <div ref={clickOutsideChat} className={`${openChat ? '' : 'hidden'}`}>
//             <ChatBox toggleOpenTab={() => setOpenChat(!openChat)} openTab={openChat} creatorIdOpen={mainData.creator_id} />
//             <AuthModal visible={openChat && !user?.id} onClose={() => setOpenChat(false)} />
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 text-dark min-h-screen pt-20 mx-auto gap-8 px-3 md:px-4 sm:px-8 lg:px-0 max-w-5xl mb-4 mt-4">
//             <div className="grid grid-cols-2 gap-2 md:grid-cols-4 auto-rows-min">
//                 <div className="col-span-2 md:col-span-4">
//                     {mainData.product_image.length == 0 && (
//                         <AspectRatio ratio={1}>
//                             <Card bg="gray.1" radius={10}>
//                                 <Center h="100%" c="gray.3">
//                                     <Icon icon="bi:image" style={{ fontSize: 50 }} />
//                                 </Center>
//                             </Card>
//                         </AspectRatio>
//                     )}
//                     {mainData.product_image[imageActive] && (
//                         <Image src={mainData.product_image[imageActive].image_url ?? ''} width={500} height={500} alt="merch" className="w-full h-72 object-cover rounded-md" />
//                     )}
//                 </div>
//                 {mainData.product_image.map((e, i) => (
//                     <div key={i} className="flex items-center justify-center">
//                         <AspectRatio>
//                             <Image src={e.image_url} width={500} height={500} alt="merch" className={`w-full h-20 object-cover rounded-md cursor-pointer ${i === imageActive ? 'border-2 border-primary-dark' : 'border-2 border-primary-light-200'}`} onClick={() => setImage(i)} />
//                         </AspectRatio>
//                     </div>
//                 ))}
//             </div>
//             <div className="flex flex-col gap-2 divide-y divide-primary-light-200">
//                 <h3 className="text-lg md:text-xl">{mainData.product_name}</h3>
//                 <div className="flex gap-2 items-center !border-y-0">
//                     <p className="text-grey text-xs md:text-sm">Terjual {mainData.total_sold}</p>
//                     <p>&bull;</p>
//                     <p className="text-xs md:text-sm">
//                         <FontAwesomeIcon icon={faStar} className="text-warning-400" />
//                         <span className="ml-1">{mainData.average_star}</span>
//                     </p>
//                 </div>
//                 <div className="!border-t-0">
//                     <h3 className="text-xl">
//                         <NumberFormatter value={parseInt(selectedVariant ? _.find(mainData.product_varian, ['id', selectedVariant])?.price ?? '0' : mainData.price)} />
//                     </h3>
//                     {/* <p className='text-grey text-xs line-through'>Rp1.650.000</p> */}
//                 </div>
//                 <div className="flex flex-row justify-start items-center pt-3 pb-2">
//                     <CreatorTitle image={mainData.creator.image_url} creator={mainData.creator.name} location="Jakarta" />
//                     <div className="flex gap-1 px-9">
//                         <p>Review: {mainData.total_review}</p>
//                     </div>
//                 </div>

//                 {mainData?.product_varian?.length > 0 && (
//                   <div className="pt-3 pb-1">
//                       <p className="font-semibold">
//                           Pilih {mainData.product_varian.map(e => e?.product_varian_category?.varian_name)[0]}: <span className="text-grey font-normal">{_.find(mainData.product_varian, ['id', selectedVariant])?.varian_name}</span>
//                       </p>
//                       <div className="flex flex-wrap gap-2 my-2">
//                           {mainData.product_varian.map((e, i) => (
//                               <div className={`flex items-center justify-center border text-sm ${e.id == selectedVariant ? 'border-primary-dark text-primary-dark' : 'border-primary-light-200 text-grey'} px-3 py-1 rounded-md cursor-pointer`} onClick={() => setSelectedVariant(e.id)} key={i}>
//                                   {e.varian_name}
//                               </div>
//                           ))}
//                       </div>
//                   </div>
//                 )}

//                 <div className="py-3">
//                     <p className={`mb-[5px]`}>
//                         Deskripsi Produk <br />
//                     </p>
//                     <div dangerouslySetInnerHTML={{ __html: mainData.description }} />
//                 </div>
//             </div>
//             <div className="border border-primary-light-200 rounded-lg p-3 h-fit flex flex-col gap-2 shadow-sm">
//                 <h5 className="text-lg md:text-xl">Jumlah</h5>
//                 <div className="flex flex-col md:flex-row items-center gap-4">
//                     <div className="flex items-center">
//                         <div className="border border-primary-light-200 rounded-md py-2 px-5 flex gap-4">
//                             <button onClick={() => setCount(count - 1)} disabled={count <= 1} className="w-5 h-5 rounded-full disabled:border-grey disabled:text-grey border-primary-dark border-2 text-primary-dark flex items-center justify-center">
//                                 <FontAwesomeIcon icon={faMinus} size="xs" />
//                             </button>
//                             <p>{count}</p>
//                             <button onClick={() => (count < ((selectedVariant ? _.find(mainData.product_varian, ['id', selectedVariant])?.stock_qty : mainData.qty) ?? 0)) && setCount(count + 1)} disabled={count == mainData.qty} className="w-5 h-5 rounded-full border-primary-dark border-2 text-primary-dark flex items-center justify-center">
//                                 <FontAwesomeIcon icon={faPlus} size="xs" />
//                             </button>
//                         </div>
//                     </div>
//                     <p>
//                         Stok <span className="font-semibold">{selectedVariant ? _.find(mainData.product_varian, ['id', selectedVariant])?.stock_qty : mainData.qty}</span>
//                     </p>
//                 </div>
//                 {/* <div className="flex justify-end">
//                     <p className="text-grey line-through">Rp1.650.000</p>
//                 </div> */}
//                 <div className="flex items-center justify-between">
//                     <p className="text-grey">Subtotal</p>
//                     <h5 className="font-semibold"><NumberFormatter value={parseInt(selectedVariant ? _.find(mainData.product_varian, ['id', selectedVariant])?.price ?? '0' : mainData.price) * count} /></h5>
//                 </div>
//                     <Button
//                         onClick={handleAddCart}
//                         disabled={count <= 0}
//                         loading={loading.includes('addcart')}
//                         mt={5}
//                         size="md"
//                         radius="xl"
//                         color="#0B387C"
//                         leftSection={<Icon icon="uiw:plus" />}
//                     >
//                         Tambah Keranjang
//                     </Button>
//                     <Button
//                         onClick={handleDirectOrder}
//                         disabled={count <= 0}
//                         mt={5}
//                         size="md"
//                         radius="xl"
//                         color="#0B387C"
//                         variant="outline"
//                     >
//                         Beli Sekarang
//                     </Button>
//                     <Flex mt={7} align="center" justify="space-between" gap={10} w="100%">
//                         <Flex gap={5} align="center">
//                             <ActionIcon variant="transparent" size="lg" color="#0B387C">
//                                 <Icon icon="lineicons:share-1" className={`!text-[24px]`} />
//                             </ActionIcon>
//                             <ActionIcon variant="transparent" size="lg" color="#0B387C">
//                                 <Icon icon="ri:heart-add-line" className={`!text-[24px]`} />
//                             </ActionIcon>
//                         </Flex>

//                         <Button
//                             leftSection={<Icon icon="fluent:chat-12-regular" className={`!text-[20px]`} />}
//                             color="#0B387C"
//                             variant="outline"
//                             radius="xl"
//                             onClick={() => setOpenChat(true)}
//                         >
//                             Chat Creator
//                         </Button>
//                     </Flex>
//             </div>
//         </div>
//     </>
//     );
// };

// export default MerchandiseDetail;

import { useContext, useEffect, useState } from "react";
import CreatorTitle from "@/components/Creator/CreatorTitle";
import Image from "next/image";
import { faMinus, faPlus, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { MerchListResponse } from "../dashboard/merch/type";
import { Get } from "@/utils/REST";
import { useClickOutside, useListState } from "@mantine/hooks";
import { NumberFormatter, Button, Flex, ActionIcon, AspectRatio, Card, Center } from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import _ from "lodash";
import useLoggedUser from "@/utils/useLoggedUser";
import Cookies from "js-cookie";
import { AppMainContext } from "../_app";
import AuthModal from "@/components/AuthModal";
import ChatBox from "@/components/chat";
import { notifications } from "@mantine/notifications";

export type CartStorage = {
  variant_id: number;
  product_id: number;
  qty: number;
  price: number;
};

// Interface untuk data review dari API
interface ReviewData {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Update interface untuk creator
interface CreatorWithVerification {
  id: number;
  name: string;
  image_url: string;
  has_creator?: {
    is_verified?: number;
  };
}

// Update interface untuk MerchListResponse
interface MerchListResponseWithCreator extends Omit<MerchListResponse, 'creator'> {
  creator: CreatorWithVerification;
}

const MerchandiseDetail = () => {
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [isr, setIsr] = useState(false);
  const [mainData, setMainData] = useState<MerchListResponseWithCreator>();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [imageActive, setImage] = useState<number>(0);
  const [loading, setLoading] = useListState<string>();
  const [selectedVariant, setSelectedVariant] = useState<number>();
  const [openChat, setOpenChat] = useState(false);
  const user = useLoggedUser();
  const router = useRouter();
  const { slug } = router.query;
  const { cartCount, setCartCount } = useContext(AppMainContext);
  const clickOutsideChat = useClickOutside(() => {});

  useEffect(() => {
    setIsr(true);
  }, []);

  useEffect(() => {
    getData();
  }, [isr]);

  useEffect(() => {
    if (slug && activeTab === "reviews") {
      getReviews();
    }
  }, [slug, activeTab]);

  useEffect(() => {
    const stock = _.find(mainData?.product_varian, ["id", selectedVariant])?.stock_qty;
    setCount((stock ?? 0) > 1 ? 1 : 0);
  }, [selectedVariant]);

  const getData = () => {
    Get(`product/${slug}`, {})
      .then((res: any) => {
        setMainData(res.data);
        if ((res.data?.product_varian?.length ?? 0) > 0) {
          setSelectedVariant(res.data?.product_varian[0].id);
          setCount(res.data?.product_varian[0].stock_qty > 1 ? 1 : 0);
        } else {
          setCount(res.data?.qty > 1 ? 1 : 0);
        }
        setLoading.filter((e) => e != "getdata");
      })
      .catch(() => setLoading.filter((e) => e != "getdata"));
  };

  const getReviews = () => {
    if (!slug) return;

    setLoadingReviews(true);
    Get(`product-reviews/${slug}`, {})
      .then((res: any) => {
        if (res.data && Array.isArray(res.data)) {
          setReviews(res.data);
        } else {
          setReviews([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      })
      .finally(() => {
        setLoadingReviews(false);
      });
  };

  // Fungsi untuk mendapatkan warna avatar berdasarkan nama
  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-pink-500", "bg-green-500", "bg-purple-500", "bg-yellow-500", "bg-red-500", "bg-indigo-500", "bg-teal-500"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Fungsi untuk format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hari ini";
    } else if (diffDays === 1) {
      return "Kemarin";
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} minggu yang lalu`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} bulan yang lalu`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} tahun yang lalu`;
    }
  };

  const handleAddCart = () => {
    setLoading.append("addcart");
    const cartData = JSON.parse(Cookies.get("_cart") ?? "[]") as CartStorage[];
    const has = cartData.find((e) => e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true));
    const selectedQty = (mainData?.product_varian.length ?? 0) > 0 ? mainData?.product_varian.find((e) => e.id == selectedVariant)?.stock_qty : mainData?.qty;

    const added = has ? _.min([has?.qty + count, selectedQty]) ?? 0 : _.min([count, selectedQty]) ?? 0;

    if (has) {
      cartData.forEach((e, index) => {
        if (e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true)) {
          cartData[index] = { ...e, qty: added };
        }
      });
    } else {
      cartData.push({
        variant_id: selectedVariant ?? 0,
        product_id: mainData?.id ?? 0,
        qty: added,
        price: parseInt(selectedVariant ? _.find(mainData?.product_varian ?? [], ["id", selectedVariant])?.price ?? "0" : mainData?.price ?? "0"),
      });
    }

    const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);
    setCartCount && setCartCount(newCartCount);
    Cookies.set("_cart", JSON.stringify(cartData));

    notifications.show({
      color: "Green",
      position: "top-right",
      message: `Berhasil menambah produk ke keranjang`,
    });
    setLoading.filter((e) => e != "addcart");
  };

  const handleDirectOrder = () => {
    Cookies.set(
      "order_data",
      JSON.stringify([
        {
          product_id: mainData?.id,
          variant_id: selectedVariant,
          qty: count,
        },
      ])
    );
    router.push("/merch-order");
  };

  if (!mainData) return <></>;

  return (
    <>
      <div ref={clickOutsideChat} className={`${openChat ? "" : "hidden"}`}>
        <ChatBox toggleOpenTab={() => setOpenChat(!openChat)} openTab={openChat} creatorIdOpen={mainData.creator_id} />
        <AuthModal visible={openChat && !user?.id} onClose={() => setOpenChat(false)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 text-dark min-h-screen pt-20 mx-auto gap-8 px-3 md:px-4 sm:px-8 lg:px-0 max-w-5xl mb-4 mt-4">
        {/* Gambar produk - DESKTOP TETAP, MOBILE DIPERBAIKI */}
        <div className="grid grid-cols-2 gap-2 auto-rows-min">
          <div className="col-span-2 md:col-span-4">
            {mainData.product_image.length === 0 ? (
              <AspectRatio ratio={1}>
                <Card bg="gray.1" radius={10}>
                  <Center h="100%" c="gray.3">
                    <Icon icon="bi:image" style={{ fontSize: 50 }} />
                  </Center>
                </Card>
              </AspectRatio>
            ) : (
              <div className="relative w-full aspect-square">
                <Image 
                  src={mainData.product_image[imageActive].image_url} 
                  fill 
                  alt="merch" 
                  className="w-full h-auto object-cover rounded-md"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>

          {/* Mobile thumbnail - FIX KHUSUS UNTUK IPHONE */}
          {mainData.product_image.length > 1 && (
            <div className="col-span-2 md:hidden w-full mt-1">
              <div className="overflow-x-auto pb-2 -mx-1 px-1">
                <div className="flex gap-2 flex-nowrap py-1 min-w-max">
                  {mainData.product_image.map((e, i) => (
                    <div key={i} className="flex-shrink-0">
                      <div className="relative w-20 h-20 rounded-md overflow-hidden">
                        <Image
                          src={e.image_url}
                          fill
                          alt="thumb"
                          className={`object-cover cursor-pointer transition-all duration-200 ${
                            i === imageActive 
                              ? "opacity-100 ring-2 ring-primary-dark ring-offset-1 scale-105" 
                              : "opacity-80 hover:opacity-100"
                          }`}
                          onClick={() => setImage(i)}
                          sizes="80px"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Desktop thumbnail - TETAP SEPERTI SEBELUMNYA */}
          {mainData.product_image.length > 1 && (
            <div className="hidden md:block col-span-2 w-full overflow-x-auto mt-1">
              <div className="flex gap-2 flex-nowrap pb-1">
                {mainData.product_image.map((e, i) => (
                  <div key={i} className="flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden cursor-pointer">
                      <Image src={e.image_url} fill alt="thumb" className={`object-cover transition-opacity ${i === imageActive ? "opacity-100" : "opacity-80 hover:opacity-100"}`} onClick={() => setImage(i)} />
                      {i === imageActive && <div className="absolute inset-0 border-2 border-primary-dark rounded-md" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail produk */}
        <div className="flex flex-col gap-2 divide-y divide-primary-light-200">
          <h3 className="text-lg md:text-xl">{mainData.product_name}</h3>
          <div className="flex gap-2 items-center !border-y-0">
            <p className="text-grey text-xs md:text-sm">Terjual {mainData.total_sold}</p>
            <p>&bull;</p>
            <p className="text-xs md:text-sm">
              <FontAwesomeIcon icon={faStar} className="text-warning-400" />
              <span className="ml-1">{mainData.average_star || 0}</span>
            </p>
            <p className="ml-auto text-xs md:text-sm">Review: {mainData.total_review || 0}</p>
          </div>
          <div className="!border-t-0 flex justify-between items-center">
            <h3 className="text-xl">
              <NumberFormatter value={parseInt(selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.price ?? "0" : mainData.price)} />
            </h3>
            <Flex gap={2} align="center" className="md:hidden">
              <ActionIcon variant="transparent" size="lg" color="#0B387C">
                <Icon icon="lineicons:share-1" className="!text-[22px]" />
              </ActionIcon>
              <ActionIcon variant="transparent" size="lg" color="#0B387C">
                <Icon icon="ri:heart-add-line" className="!text-[22px]" />
              </ActionIcon>
            </Flex>
          </div>
          <div className="flex flex-row justify-start items-center pt-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                <Image src={mainData.creator.image_url} alt={mainData.creator.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <p className="font-medium">{mainData.creator.name}</p>
                  {mainData.creator.has_creator?.is_verified === 1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1DA1F2" className="w-4 h-4">
                      <path d="M22 12l-2-2 1-3-3-1-1-3-3 1-2-2-2 2-3-1-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3 3-1 2 2 2-2 3 1 1-3 3-1-1-3 2-2zM10 15l-3-3 1.4-1.4L10 12.2l5.6-5.6L17 8l-7 7z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-grey">Jakarta</p>
              </div>
            </div>
          </div>
          {mainData?.product_varian?.length > 0 && (
            <div className="pt-3 pb-1">
              <p className="font-semibold">
                Pilih {mainData.product_varian.map((e) => e?.product_varian_category?.varian_name)[0]}: <span className="text-grey font-normal">{_.find(mainData.product_varian, ["id", selectedVariant])?.varian_name}</span>
              </p>
              <div className="overflow-x-auto my-2">
                <div className="flex gap-2 pb-2 min-w-min">
                  {mainData.product_varian.map((e, i) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 flex items-center justify-center border text-sm ${
                        e.id == selectedVariant ? "border-primary-dark text-primary-dark" : "border-primary-light-200 text-grey"
                      } px-4 py-2 rounded-md cursor-pointer whitespace-nowrap`}
                      onClick={() => setSelectedVariant(e.id)}
                    >
                      {e.varian_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="py-3">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 md:py-2 px-3 md:px-4 font-medium text-sm md:text-sm ${activeTab === "description" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("description")}
              >
                Deskripsi Produk
              </button>
              <button
                className={`py-2 md:py-2 px-3 md:px-4 font-medium text-sm md:text-sm ${activeTab === "reviews" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("reviews")}
              >
                Ulasan ({reviews.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="pt-2">
              {activeTab === "description" ? (
                <div>
                  <div className="prose max-w-none text-gray-700 text-sm md:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: mainData.description }} />
                </div>
              ) : (
                <div className="space-y-4">
                  {loadingReviews ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-gray-500">Memuat ulasan...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 border border-gray-200 rounded-lg">
                      <Icon icon="mdi:message-text-outline" className="text-gray-300 text-4xl mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada ulasan untuk produk ini</p>
                      <p className="text-sm text-gray-400 mt-1">Jadilah yang pertama memberikan ulasan</p>
                    </div>
                  ) : (
                    // Review cards dari API
                    reviews.map((review) => {
                      const userName = review.user?.name || "Pengguna";
                      const userInitial = userName.charAt(0).toUpperCase();
                      const avatarColor = getAvatarColor(userName);

                      return (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${avatarColor}`}>{userInitial}</div>
                              <div className="ml-3">
                                <div className="font-medium text-gray-900">{userName}</div>
                                <div className="flex items-center mt-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <FontAwesomeIcon key={i} icon={faStar} className={`text-sm ${i < review.rating ? "text-warning-400" : "text-gray-300"}`} />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-2">{formatDate(review.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {review.comment && <p className="mt-3 text-gray-700 text-sm leading-relaxed">{review.comment}</p>}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Jumlah + Tombol */}
        <div className="border border-primary-light-200 rounded-lg p-3 h-fit flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <h5 className="text-lg md:text-xl">Jumlah</h5>
            <div className="flex items-center md:hidden">
              <div className="border border-primary-light-200 rounded-md py-2 px-5 flex gap-4">
                <button onClick={() => setCount(count - 1)} disabled={count <= 1} className="w-5 h-5 rounded-full disabled:border-grey disabled:text-grey border-primary-dark border-2 text-primary-dark flex items-center justify-center">
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>
                <p>{count}</p>
                <button
                  onClick={() => count < ((selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.stock_qty : mainData.qty) ?? 0) && setCount(count + 1)}
                  className="w-5 h-5 rounded-full border-primary-dark border-2 text-primary-dark flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center">
              <div className="border border-primary-light-200 rounded-md py-2 px-5 flex gap-4">
                <button onClick={() => setCount(count - 1)} disabled={count <= 1} className="w-5 h-5 rounded-full disabled:border-grey disabled:text-grey border-primary-dark border-2 text-primary-dark flex items-center justify-center">
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>
                <p>{count}</p>
                <button
                  onClick={() => count < ((selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.stock_qty : mainData.qty) ?? 0) && setCount(count + 1)}
                  className="w-5 h-5 rounded-full border-primary-dark border-2 text-primary-dark flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </button>
              </div>
            </div>
            <p>
              Stok <span className="font-semibold">{selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.stock_qty : mainData.qty}</span>
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-grey">Subtotal</p>
            <h5 className="font-semibold">
              <NumberFormatter value={parseInt(selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.price ?? "0" : mainData.price) * count} />
            </h5>
          </div>

          <div className="mt-5">
            <Button onClick={handleAddCart} disabled={count <= 0} loading={loading.includes("addcart")} size="md" radius="xl" color="#0B387C" leftSection={<Icon icon="uiw:plus" />} style={{ width: "100%" }}>
              Tambah Keranjang
            </Button>
          </div>

          <div className="hidden md:block mt-3">
            <Button onClick={handleDirectOrder} disabled={count <= 0} size="md" radius="xl" color="#0B387C" variant="outline" style={{ width: "100%" }}>
              Beli Sekarang
            </Button>
          </div>

          <div className="hidden md:flex mt-3 gap-3">
            <div className="w-3/5"></div>
            <div className="w-2/5 flex justify-end">
              <Button rightSection={<Icon icon="fluent:chat-12-regular" className="!text-[20px]" />} color="#0B387C" variant="outline" radius="xl" onClick={() => setOpenChat(true)} style={{ width: "100%" }}>
                Chat
              </Button>
            </div>
          </div>

          <div className="flex md:hidden mt-3 gap-3">
            <div className="w-2/5">
              <Button rightSection={<Icon icon="fluent:chat-12-regular" className="!text-[20px]" />} size="md" color="#0B387C" variant="outline" radius="xl" onClick={() => setOpenChat(true)} style={{ width: "100%" }}>
                Chat
              </Button>
            </div>
            <div className="w-3/5">
              <Button onClick={handleDirectOrder} disabled={count <= 0} size="md" radius="xl" color="#0B387C" variant="outline" style={{ width: "100%" }}>
                Beli Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MerchandiseDetail;