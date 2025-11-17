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

// import { useContext, useEffect, useState } from "react";
// import CreatorTitle from "@/components/Creator/CreatorTitle";
// import Image from "next/image";
// import { faMinus, faPlus, faStar } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useRouter } from "next/router";
// import { MerchListResponse } from "../dashboard/merch/type";
// import { Get } from "@/utils/REST";
// import { useClickOutside, useListState } from "@mantine/hooks";
// import { NumberFormatter, Button, Flex, ActionIcon, AspectRatio, Card, Center } from "@mantine/core";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import _ from "lodash";
// import useLoggedUser from "@/utils/useLoggedUser";
// import Cookies from "js-cookie";
// import { AppMainContext } from "../_app";
// import AuthModal from "@/components/AuthModal";
// import ChatBox from "@/components/chat";
// import { notifications } from "@mantine/notifications";
// // const router = useRouter();
// // const { slug } = router.query;

// export type CartStorage = {
//   variant_id: number;
//   product_id: number;
//   qty: number;
//   price: number;
// };

// const MerchandiseDetail = () => {
//   const [isr, setIsr] = useState(false);
//   const [mainData, setMainData] = useState<MerchListResponse>();
//   const [count, setCount] = useState<number>(0);
//   const [imageActive, setImage] = useState<number>(0);
//   const [loading, setLoading] = useListState<string>();
//   const [selectedVariant, setSelectedVariant] = useState<number>();
//   const [openChat, setOpenChat] = useState(false);
//   const user = useLoggedUser();
//   const router = useRouter();
//   const { slug } = router.query;
//   const { cartCount, setCartCount } = useContext(AppMainContext);
//   const clickOutsideChat = useClickOutside(() => {});

//   useEffect(() => {
//     setIsr(true);
//   }, []);

//   useEffect(() => {
//     getData();
//   }, [isr]);

//   useEffect(() => {
//     const stock = _.find(mainData?.product_varian, ["id", selectedVariant])?.stock_qty;
//     setCount((stock ?? 0) > 1 ? 1 : 0);
//   }, [selectedVariant]);

//   const getData = () => {
//     Get(`product/${slug}`, {})
//       .then((res: any) => {
//         setMainData(res.data);
//         if ((res.data?.product_varian?.length ?? 0) > 0) {
//           setSelectedVariant(res.data?.product_varian[0].id);
//           setCount(res.data?.product_varian[0].stock_qty > 1 ? 1 : 0);
//         } else {
//           setCount(res.data?.qty > 1 ? 1 : 0);
//         }
//         setLoading.filter((e) => e != "getdata");
//       })
//       .catch(() => setLoading.filter((e) => e != "getdata"));
//   };

//   // pastikan di top file ada: import Cookies from "js-cookie";

//   // const getData = async () => {
//   //   // tambahkan loading flag (sama pola di kode lain)
//   //   setLoading.append("getdata");

//   //   try {
//   //     if (!slug) {
//   //       console.warn("getData aborted: slug is empty");
//   //       return;
//   //     }

//   //     const url = `${process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "")}/product/${encodeURIComponent(slug)}`;
//   //     console.log("Fetching product detail:", url);

//   //     // ambil token dari env dulu, fallback ke cookie/localStorage
//   //     const envToken = process.env.NEXT_PUBLIC_API_TOKEN || "";
//   //     const cookieToken = Cookies.get("token") || (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "");
//   //     const token = envToken || cookieToken || "";

//   //     const headers: Record<string, string> = {
//   //       Accept: "application/json",
//   //     };
//   //     if (token) headers["Authorization"] = `Bearer ${token}`;

//   //     const res = await fetch(url, {
//   //       method: "GET",
//   //       headers,
//   //       // jika backend pakai cookie-based auth, uncomment:
//   //       // credentials: "include",
//   //     } as RequestInit);

//   //     if (!res.ok) {
//   //       // baca pesan error kalau ada
//   //       let errText = `HTTP error! status: ${res.status}`;
//   //       try {
//   //         const errJson = await res.json();
//   //         errText += ` - ${errJson?.message ?? JSON.stringify(errJson)}`;
//   //       } catch {
//   //         // ignore JSON parse error
//   //       }
//   //       throw new Error(errText);
//   //     }

//   //     const json = await res.json();
//   //     console.log("Product API response:", json);

//   //     const payload = json?.data ?? json; // jika struktur berbeda, ambil fallback

//   //     // set main data
//   //     setMainData(payload);

//   //     // logic variant / qty sama seperti aslinya
//   //     const hasVariants = (payload?.product_varian?.length ?? 0) > 0;
//   //     if (hasVariants) {
//   //       const firstVar = payload.product_varian[0];
//   //       setSelectedVariant(firstVar?.id);
//   //       // set count: kalau stock > 1 -> 1, else 0
//   //       setCount((firstVar?.stock_qty ?? 0) > 1 ? 1 : 0);
//   //     } else {
//   //       setCount((payload?.qty ?? 0) > 1 ? 1 : 0);
//   //     }
//   //   } catch (err) {
//   //     console.error("Error fetching product detail:", err);
//   //     // optional: pakai notifications jika tersedia di file ini
//   //     // notifications.show({ message: "Gagal memuat detail produk", color: "red" });
//   //   } finally {
//   //     // hilangkan loading flag
//   //     setLoading.filter((e) => e !== "getdata");
//   //   }
//   // };

//   const handleAddCart = () => {
//     setLoading.append("addcart");
//     const cartData = JSON.parse(Cookies.get("_cart") ?? "[]") as CartStorage[];
//     const has = cartData.find((e) => e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true));
//     const selectedQty = (mainData?.product_varian.length ?? 0) > 0 ? mainData?.product_varian.find((e) => e.id == selectedVariant)?.stock_qty : mainData?.qty;

//     const added = has ? _.min([has?.qty + count, selectedQty]) ?? 0 : _.min([count, selectedQty]) ?? 0;

//     if (has) {
//       cartData.forEach((e, index) => {
//         if (e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true)) {
//           cartData[index] = { ...e, qty: added };
//         }
//       });
//     } else {
//       cartData.push({
//         variant_id: selectedVariant ?? 0,
//         product_id: mainData?.id ?? 0,
//         qty: added,
//         price: parseInt(selectedVariant ? _.find(mainData?.product_varian ?? [], ["id", selectedVariant])?.price ?? "0" : mainData?.price ?? "0"),
//       });
//     }

//     const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);
//     setCartCount && setCartCount(newCartCount);
//     Cookies.set("_cart", JSON.stringify(cartData));

//     notifications.show({
//       color: "Green",
//       position: "top-right",
//       message: `Berhasil menambah produk ke keranjang`,
//     });
//     setLoading.filter((e) => e != "addcart");
//   };

//   const handleDirectOrder = () => {
//     Cookies.set(
//       "order_data",
//       JSON.stringify([
//         {
//           product_id: mainData?.id,
//           variant_id: selectedVariant,
//           qty: count,
//         },
//       ])
//     );
//     router.push("/merch-order");
//   };

//   if (!mainData) return <></>;

//   return (
//     <>
//       <div ref={clickOutsideChat} className={`${openChat ? "" : "hidden"}`}>
//         <ChatBox toggleOpenTab={() => setOpenChat(!openChat)} openTab={openChat} creatorIdOpen={mainData.creator_id} />
//         <AuthModal visible={openChat && !user?.id} onClose={() => setOpenChat(false)} />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 text-dark min-h-screen pt-20 mx-auto gap-8 px-3 md:px-4 sm:px-8 lg:px-0 max-w-5xl mb-4 mt-4">
//         <div className="grid grid-cols-2 gap-2 md:grid-cols-4 auto-rows-min">
//           {/* --- GAMBAR UTAMA --- */}
//           <div className="col-span-2 md:col-span-4">
//             {mainData.product_image.length === 0 ? (
//               <AspectRatio ratio={1}>
//                 <Card bg="gray.1" radius={10}>
//                   <Center h="100%" c="gray.3">
//                     <Icon icon="bi:image" style={{ fontSize: 50 }} />
//                   </Center>
//                 </Card>
//               </AspectRatio>
//             ) : (
//               <Image src={mainData.product_image[imageActive].image_url} width={500} height={500} alt="merch" className="w-full h-64 sm:h-72 md:h-80 object-cover rounded-md" />
//             )}
//           </div>

//           {/* --- MOBILE THUMBNAIL (SCROLL) --- */}
//           <div className="col-span-2 md:hidden w-full overflow-x-auto mt-1">
//             <div className="flex gap-2 flex-nowrap">
//               {mainData.product_image.map((e, i) => (
//                 <div key={i} className="flex-shrink-0">
//                   <AspectRatio>
//                     <Image
//                       src={e.image_url}
//                       width={500}
//                       height={500}
//                       alt="thumb"
//                       className={`w-20 h-20 object-cover rounded-md cursor-pointer ${i === imageActive ? "border-2 border-primary-dark" : "border-2 border-primary-light-200"}`}
//                       onClick={() => setImage(i)}
//                     />
//                   </AspectRatio>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* --- DESKTOP THUMBNAIL GRID (TETAP 4 KOLOM) --- */}
//           {mainData.product_image.map((e, i) => (
//             <div key={i} className="hidden md:block">
//               <AspectRatio>
//                 <Image
//                   src={e.image_url}
//                   width={500}
//                   height={500}
//                   alt="thumb"
//                   className={`w-full h-20 object-cover rounded-md cursor-pointer ${i === imageActive ? "border-2 border-primary-dark" : "border-2 border-primary-light-200"}`}
//                   onClick={() => setImage(i)}
//                 />
//               </AspectRatio>
//             </div>
//           ))}
//         </div>

//         {/* ==== Detail Produk ==== */}
//         <div className="flex flex-col gap-2 divide-y divide-primary-light-200">
//           <h3 className="text-lg md:text-xl">{mainData.product_name}</h3>
//           <div className="flex gap-2 items-center !border-y-0">
//             <p className="text-grey text-xs md:text-sm">Terjual {mainData.total_sold}</p>
//             <p>&bull;</p>
//             <p className="text-xs md:text-sm">
//               <FontAwesomeIcon icon={faStar} className="text-warning-400" />
//               <span className="ml-1">{mainData.average_star}</span>
//             </p>
//             <p className="ml-auto text-xs md:text-sm">Review: {mainData.total_review}</p>
//           </div>

//           {/* Harga + icon */}
//           <div className="!border-t-0 flex justify-between items-center">
//             <h3 className="text-xl">
//               <NumberFormatter value={parseInt(selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.price ?? "0" : mainData.price)} />
//             </h3>
//             <Flex gap={2} align="center" className="md:hidden">
//               <ActionIcon variant="transparent" size="lg" color="#0B387C">
//                 <Icon icon="lineicons:share-1" className="!text-[22px]" />
//               </ActionIcon>
//               <ActionIcon variant="transparent" size="lg" color="#0B387C">
//                 <Icon icon="ri:heart-add-line" className="!text-[22px]" />
//               </ActionIcon>
//             </Flex>
//           </div>

//           {/* Creator */}
//           <div className="flex flex-row justify-start items-center pt-3 pb-2">
//             <CreatorTitle image={mainData.creator.image_url} creator={mainData.creator.name} location="Jakarta" />
//             <div className="flex gap-1 px-9">{/* <p>Review: {mainData.total_review}</p> */}</div>
//           </div>

//           {/* Varian */}
//           {mainData?.product_varian?.length > 0 && (
//             <div className="pt-3 pb-1">
//               <p className="font-semibold">
//                 Pilih {mainData.product_varian.map((e) => e?.product_varian_category?.varian_name)[0]}: <span className="text-grey font-normal">{_.find(mainData.product_varian, ["id", selectedVariant])?.varian_name}</span>
//               </p>
//               <div className="flex flex-wrap gap-2 my-2">
//                 {mainData.product_varian.map((e, i) => (
//                   <div
//                     key={i}
//                     className={`flex items-center justify-center border text-sm ${e.id == selectedVariant ? "border-primary-dark text-primary-dark" : "border-primary-light-200 text-grey"} px-3 py-1 rounded-md cursor-pointer`}
//                     onClick={() => setSelectedVariant(e.id)}
//                   >
//                     {e.varian_name}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Deskripsi */}
//           <div className="py-3">
//             <p className="mb-[5px]">
//               Deskripsi Produk <br />
//             </p>
//             <div dangerouslySetInnerHTML={{ __html: mainData.description }} />
//           </div>
//         </div>

//         {/* ==== Jumlah + Tombol ==== */}
//         <div className="border border-primary-light-200 rounded-lg p-3 h-fit flex flex-col gap-2 shadow-sm">
//           <div className="flex items-center justify-between">
//             <h5 className="text-lg md:text-xl">Jumlah</h5>
//             <div className="flex items-center md:hidden">
//               <div className="border border-primary-light-200 rounded-md py-2 px-5 flex gap-4">
//                 <button onClick={() => setCount(count - 1)} disabled={count <= 1} className="w-5 h-5 rounded-full disabled:border-grey disabled:text-grey border-primary-dark border-2 text-primary-dark flex items-center justify-center">
//                   <FontAwesomeIcon icon={faMinus} size="xs" />
//                 </button>
//                 <p>{count}</p>
//                 <button
//                   onClick={() => count < ((selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.stock_qty : mainData.qty) ?? 0) && setCount(count + 1)}
//                   className="w-5 h-5 rounded-full border-primary-dark border-2 text-primary-dark flex items-center justify-center"
//                 >
//                   <FontAwesomeIcon icon={faPlus} size="xs" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Desktop jumlah */}
//           <div className="hidden md:flex flex-col md:flex-row items-center gap-4">
//             <div className="flex items-center">
//               <div className="border border-primary-light-200 rounded-md py-2 px-5 flex gap-4">
//                 <button onClick={() => setCount(count - 1)} disabled={count <= 1} className="w-5 h-5 rounded-full disabled:border-grey disabled:text-grey border-primary-dark border-2 text-primary-dark flex items-center justify-center">
//                   <FontAwesomeIcon icon={faMinus} size="xs" />
//                 </button>
//                 <p>{count}</p>
//                 <button
//                   onClick={() => count < ((selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.stock_qty : mainData.qty) ?? 0) && setCount(count + 1)}
//                   className="w-5 h-5 rounded-full border-primary-dark border-2 text-primary-dark flex items-center justify-center"
//                 >
//                   <FontAwesomeIcon icon={faPlus} size="xs" />
//                 </button>
//               </div>
//             </div>
//             <p>
//               Stok <span className="font-semibold">{selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.stock_qty : mainData.qty}</span>
//             </p>
//           </div>

//           <div className="flex items-center justify-between">
//             <p className="text-grey">Subtotal</p>
//             <h5 className="font-semibold">
//               <NumberFormatter value={parseInt(selectedVariant ? _.find(mainData.product_varian, ["id", selectedVariant])?.price ?? "0" : mainData.price) * count} />
//             </h5>
//           </div>

//           {/* <Button onClick={handleAddCart} disabled={count <= 0} loading={loading.includes("addcart")} mt={5} size="md" radius="xl" color="#0B387C" leftSection={<Icon icon="uiw:plus" />}>
//             Tambah Keranjang
//           </Button>

//           <Button onClick={handleDirectOrder} disabled={count <= 0} mt={5} size="md" radius="xl" color="#0B387C" variant="outline">
//             Beli Sekarang
//           </Button> */}

//           {/* <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
//             <Button onClick={handleAddCart} disabled={count <= 0} loading={loading.includes("addcart")} size="md" radius="xl" color="#0B387C" leftSection={<Icon icon="uiw:plus" />} style={{ flex: 1 }}>
//               Tambah Keranjang
//             </Button>

//             <Button onClick={handleDirectOrder} disabled={count <= 0} size="md" radius="xl" color="#0B387C" variant="outline" style={{ flex: 1 }}>
//               Beli Sekarang
//             </Button>
//           </div> */}

//           {/* TOMBOL TAMBAH KERANJANG (tetap seperti itu aja) */}
//           {/* <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
//             <Button onClick={handleAddCart} disabled={count <= 0} loading={loading.includes("addcart")} size="md" radius="xl" color="#0B387C" leftSection={<Icon icon="uiw:plus" />} style={{ flex: 1 }}>
//               Tambah Keranjang
//             </Button>
//           </div> */}

//           {/* ROW BARU */}
//           {/* <div className="action-row"> */}
//           {/* Chat (1/4 mobile) */}
//           {/* <Button rightSection={<Icon icon="fluent:chat-12-regular" className="!text-[20px]" />} color="#0B387C" variant="outline" radius="xl" onClick={() => setOpenChat(true)} className="btn-chat" /> */}

//           {/* Beli Sekarang (3/4 mobile) */}
//           {/* <Button onClick={handleDirectOrder} disabled={count <= 0} size="md" radius="xl" color="#0B387C" variant="outline" className="btn-buy">
//               Beli Sekarang
//             </Button>
//           </div> */}
//           {/* --- Tambah Keranjang (desktop & mobile selalu 1 row sendiri) --- */}
//           <div className="mt-5">
//             <Button onClick={handleAddCart} disabled={count <= 0} loading={loading.includes("addcart")} size="md" radius="xl" color="#0B387C" leftSection={<Icon icon="uiw:plus" />} style={{ width: "100%" }}>
//               Tambah Keranjang
//             </Button>
//           </div>

//           {/* --- DESKTOP: Beli Sekarang (1 row) --- */}
//           <div className="hidden md:block mt-3">
//             <Button onClick={handleDirectOrder} disabled={count <= 0} size="md" radius="xl" color="#0B387C" variant="outline" style={{ width: "100%" }}>
//               Beli Sekarang
//             </Button>
//           </div>

//           {/* --- DESKTOP: Chat 1/2 kanan, kiri kosong --- */}
//           <div className="hidden md:flex mt-3 gap-3">
//             <div className="w-3/5"></div> {/* kosong */}
//             <div className="w-2/5 flex justify-end">
//               <Button rightSection={<Icon icon="fluent:chat-12-regular" className="!text-[20px]" />} color="#0B387C" variant="outline" radius="xl" onClick={() => setOpenChat(true)} className="btn-chat" style={{ width: "100%" }}>
//                 Chat
//               </Button>
//             </div>
//           </div>

//           {/* --- MOBILE: Beli Sekarang + Chat satu row (chat 1/4, beli 3/4) --- */}
//           <div className="flex md:hidden mt-3 gap-3">
//             <div className="w-2/5">
//               <Button rightSection={<Icon icon="fluent:chat-12-regular" className="!text-[20px]" />} size="md" color="#0B387C" variant="outline" radius="xl" onClick={() => setOpenChat(true)} className="btn-chat" style={{ width: "100%" }}>
//                 Chat
//               </Button>
//             </div>

//             <div className="w-3/5">
//               <Button onClick={handleDirectOrder} disabled={count <= 0} size="md" radius="xl" color="#0B387C" variant="outline" style={{ width: "100%" }}>
//                 Beli Sekarang
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
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

const MerchandiseDetail = () => {
  const [isr, setIsr] = useState(false);
  const [mainData, setMainData] = useState<MerchListResponse | any>();
  const [count, setCount] = useState<number>(0);
  const [imageActive, setImage] = useState<number>(0);
  const [loading, setLoading] = useListState<string>();
  const [selectedVariant, setSelectedVariant] = useState<number>();
  const [openChat, setOpenChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
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

  const handleAddCart = () => {
    setLoading.append("addcart");
    const cartData = JSON.parse(Cookies.get("_cart") ?? "[]") as CartStorage[];
    const has = cartData.find((e: any) => e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true));
    const selectedQty = (mainData?.product_varian.length ?? 0) > 0 ? mainData?.product_varian.find((e: any) => e.id == selectedVariant)?.stock_qty : mainData?.qty;

    const added = has ? _.min([has?.qty + count, selectedQty]) ?? 0 : _.min([count, selectedQty]) ?? 0;

    if (has) {
      cartData.forEach((e: any, index: number) => {
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
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 auto-rows-min">
          {/* --- GAMBAR UTAMA --- */}
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
              <Image src={mainData.product_image[imageActive].image_url} width={500} height={500} alt="merch" className="w-full h-64 sm:h-72 md:h-80 object-cover rounded-md" />
            )}
          </div>

          {/* --- MOBILE THUMBNAIL (SCROLL) --- */}
          <div className="col-span-2 md:hidden w-full overflow-x-auto mt-1">
            <div className="flex gap-2 flex-nowrap">
              {mainData.product_image.map((e: any, i: number) => (
                <div key={i} className="flex-shrink-0">
                  <AspectRatio>
                    <Image
                      src={e.image_url}
                      width={500}
                      height={500}
                      alt="thumb"
                      className={`w-20 h-20 object-cover rounded-md cursor-pointer ${i === imageActive ? "border-2 border-primary-dark" : "border-2 border-primary-light-200"}`}
                      onClick={() => setImage(i)}
                    />
                  </AspectRatio>
                </div>
              ))}
            </div>
          </div>

          {/* --- DESKTOP THUMBNAIL GRID (TETAP 4 KOLOM) --- */}
          {mainData.product_image.map((e: any, i: number) => (
            <div key={i} className="hidden md:block">
              <AspectRatio>
                <Image
                  src={e.image_url}
                  width={500}
                  height={500}
                  alt="thumb"
                  className={`w-full h-20 object-cover rounded-md cursor-pointer ${i === imageActive ? "border-2 border-primary-dark" : "border-2 border-primary-light-200"}`}
                  onClick={() => setImage(i)}
                />
              </AspectRatio>
            </div>
          ))}
        </div>

        {/* ==== Detail Produk ==== */}
        <div className="flex flex-col gap-2 divide-y divide-primary-light-200">
          <h3 className="text-lg md:text-xl">{mainData.product_name}</h3>
          <div className="flex gap-2 items-center !border-y-0">
            <p className="text-grey text-xs md:text-sm">Terjual {mainData.total_sold}</p>
            <p>&bull;</p>
            <p className="text-xs md:text-sm">
              <FontAwesomeIcon icon={faStar} className="text-warning-400" />
              <span className="ml-1">{mainData.average_star}</span>
            </p>
            <p className="ml-auto text-xs md:text-sm">Review: {mainData.total_review}</p>
          </div>

          {/* Harga + icon */}
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

          {/* Creator */}
          <div className="flex flex-row justify-start items-center pt-3 pb-2">
            <CreatorTitle image={mainData.creator.image_url} creator={mainData.creator.name} location="Jakarta" />
            <div className="flex gap-1 px-9">{/* <p>Review: {mainData.total_review}</p> */}</div>
          </div>

          {/* Varian */}
          {mainData?.product_varian?.length > 0 && (
            <div className="pt-3 pb-1">
              <p className="font-semibold">
                Pilih {mainData.product_varian.map((e: any) => e?.product_varian_category?.varian_name)[0]}: <span className="text-grey font-normal">{_.find(mainData.product_varian, ["id", selectedVariant])?.varian_name}</span>
              </p>
              <div className="flex flex-wrap gap-2 my-2">
                {mainData.product_varian.map((e: any, i: number) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center border text-sm ${e.id == selectedVariant ? "border-primary-dark text-primary-dark" : "border-primary-light-200 text-grey"} px-3 py-1 rounded-md cursor-pointer`}
                    onClick={() => setSelectedVariant(e.id)}
                  >
                    {e.varian_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====== TABS: Deskripsi Produk | Ulasan ====== */}
          <div className="py-3">
            <div className="flex gap-2">
              <div className="flex gap-4 border-b border-primary-light-200 pb-1">
                <div
                  onClick={() => setActiveTab("description")}
                  className={`flex-1 text-center py-3 text-sm font-medium cursor-pointer rounded-md whitespace-nowrap ${
                    activeTab === "description" ? "border-b-4 border-primary-dark text-primary-dark" : "text-grey hover:text-primary-dark"
                  }`}
                >
                  Deskripsi Produk
                </div>

                <div
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 text-center py-3 text-sm font-medium cursor-pointer rounded-md whitespace-nowrap ${activeTab === "reviews" ? "border-b-4 border-primary-dark text-primary-dark" : "text-grey hover:text-primary-dark"}`}
                >
                  Ulasan ({mainData.total_review ?? 0})
                </div>
              </div>
            </div>

            <div className="mt-3">
              {activeTab === "description" ? (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: mainData.description ?? "<p>Deskripsi tidak tersedia.</p>" }} />
              ) : (
                <div className="space-y-3">
                  {/* Support multiple possible review fields if present in API */}
                  {(mainData.product_review && mainData.product_review.length > 0) || (mainData.reviews && mainData.reviews.length > 0) ? (
                    (mainData.product_review ?? mainData.reviews).map((r: any, idx: number) => (
                      <div key={idx} className="border p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{r.user_name ?? r.name ?? "Pengguna"}</div>
                          <div className="text-sm text-grey">{r.star ? `${r.star} ★` : ""}</div>
                        </div>
                        <div className="text-sm text-grey mt-2">{r.comment ?? r.message ?? r.review ?? "-"}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-grey">Belum ada ulasan untuk produk ini.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==== Jumlah + Tombol ==== */}
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

          {/* Desktop jumlah */}
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
              <Button rightSection={<Icon icon="fluent:chat-12-regular" className="!text-[20px]" />} color="#0B387C" variant="outline" radius="xl" onClick={() => setOpenChat(true)} className="btn-chat" style={{ width: "100%" }}>
                Chat
              </Button>
            </div>
          </div>

          <div className="flex md:hidden mt-3 gap-3">
            <div className="w-2/5">
              <Button rightSection={<Icon icon="fluent:chat-12-regular" className="!text-[20px]" />} size="md" color="#0B387C" variant="outline" radius="xl" onClick={() => setOpenChat(true)} className="btn-chat" style={{ width: "100%" }}>
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
