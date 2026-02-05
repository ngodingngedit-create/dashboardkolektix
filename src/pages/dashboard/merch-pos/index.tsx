// import useLoggedUser from "@/utils/useLoggedUser";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { Accordion, ActionIcon, Alert, Box, Button, Card, Flex, Image, LoadingOverlay, Menu, Modal, NumberFormatter, NumberInput, ScrollArea, Stack, Text, Textarea, TextInput, UnstyledButton } from "@mantine/core";
// import { MerchListResponse } from "../merch/type";
// import { useEffect, useMemo, useState } from "react";
// import { useListState } from "@mantine/hooks";
// import fetch from "@/utils/fetch";
// import { modals } from "@mantine/modals";
// import { notifications } from "@mantine/notifications";
// import { useForm, zodResolver } from "@mantine/form";
// import { z } from "zod";
// import _ from "lodash";
// import Cookies from "js-cookie";
// import { useRouter } from "next/router";

// type ComponentProps = {};

// type CustomerData = {
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
// };

// export type MerchCheckoutOffline = {
//   product: {
//     id: number;
//     variant_id?: number;
//     qty: number;
//     price: number;
//     subtotal: number;
//   }[];
//   invoice_num?: string;
//   customer_name?: string;
//   customer_email?: string;
//   customer_phone?: string;
//   customer_address?: string;
//   discount?: number;
//   summary?: { [key: string]: number };
//   grandtotal: number;
//   creator_id: number;
//   payment_method?: string;
// };

// export default function Index({}: Readonly<ComponentProps>) {
//   const user = useLoggedUser();
//   const [loading, setLoading] = useListState<string>();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [merch, setMerch] = useState<MerchListResponse[]>();
//   const [discount, setDiscount] = useState(0);
//   const [openSelect, setOpenSelect] = useState(false);
//   const [openCustForm, setOpenCustForm] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<string>();
//   const [selected, setSelected] = useState<
//     {
//       id: number;
//       variant_id?: number;
//       count: number;
//     }[]
//   >([]);
//   const router = useRouter();

//   const {
//     values: custValue,
//     getInputProps: custProps,
//     errors: custError,
//     validate: custValidate,
//   } = useForm<CustomerData>({
//     onValuesChange: (val) => {
//       val.phone = (val.phone ?? "").replaceAll(/\D/g, "");
//       return val;
//     },
//     validate: zodResolver(
//       z.object({
//         name: z.string().optional().nullable(),
//         email: z.string().email().optional().nullable(),
//         phone: z.string().optional().nullable(),
//         address: z.string().optional().nullable(),
//       })
//     ),
//   });

//   useEffect(() => {
//     if (user) getMerchList();
//   }, [user]);

//   //   const getMerchList = async () => {
//   //     await fetch<any, MerchListResponse[]>({
//   //       url: "product" + `?creator_id=${user?.has_creator?.id}`,
//   //       method: "GET",
//   //       before: () => setLoading.append("getdata"),
//   //       success: ({ data }) => data && setMerch(data.filter((e) => e.product_status_id == 2)),
//   //       complete: () => setLoading.filter((e) => e != "getdata"),
//   //       error: () => {},
//   //     });
//   //   };

//   const getMerchList = async (pageNum: number = 1) => {
//     // guard kalau user belum siap
//     const creatorId = user?.has_creator?.id;
//     if (!creatorId) {
//       console.warn("getMerchList aborted: no creator id on user", user);
//       return;
//     }

//     const qs = new URLSearchParams({
//       per_page: String(PER_PAGE),
//       page: String(pageNum),
//       creator_id: String(creatorId),
//     }).toString();

//     const url = `product-bymerchant?${qs}`;

//     // ambil token dari env (NEXT_PUBLIC...) atau fallback dari cookie/localStorage
//     const envToken = (process?.env?.NEXT_PUBLIC_API_TOKEN as string) || "";
//     const cookieToken = Cookies.get("token") || localStorage.getItem("token") || "";
//     const token = envToken || cookieToken || "";

//     console.log("Fetching:", url, { creatorId, pageNum, tokenPresent: !!token });

//     await fetch<any, any>({
//       url,
//       method: "GET",
//       // sertakan header Authorization bila token ada
//       headers: token
//         ? {
//             Authorization: `Bearer ${token}`,
//           }
//         : undefined,
//       before: () => setLoading.append("getdata"),
//       success: ({ data }) => {
//         // data di API-mu adalah objek paginasi: { current_page, data: [...], ... }
//         console.log("Raw API response (data):", data);

//         if (!data) {
//           console.warn("getMerchList: no data in response");
//           setMerch([]);
//           return;
//         }

//         // ambil array produk dari possible shapes:
//         // - data bisa berupa array langsung (legacy)
//         // - atau data.data adalah array (paginasi)
//         const items: MerchListResponse[] = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : data.items ?? [];

//         console.log("Resolved items length:", items.length);

//         // filter status dan set state
//         const filtered = items.filter((e) => e.product_status_id == 2);
//         console.log("Filtered items (status==2) count:", filtered.length);
//         setMerch(filtered);
//       },
//       complete: () => setLoading.filter((e) => e != "getdata"),
//       error: (err) => {
//         console.error("getMerchList error:", err);
//         notifications.show({ message: "Gagal memuat produk. Cek console.", color: "red" });
//         setMerch([]);
//       },
//     });
//   };

//   //   const merchList = useMemo(() => {
//   //     return merch
//   //       ?.filter((e) => Boolean(e))
//   //       .filter((e) => (Boolean(searchQuery) ? e?.product_name.toLowerCase().includes(searchQuery) : true))
//   //       .map((e, i) => ({
//   //         name: e?.product_name,
//   //         price: (e?.product_varian.length ?? 0) > 0 ? e?.product_varian.map((e) => parseInt(e.price)).reduce((acc, price) => [Math.min(acc[0], price), Math.max(acc[1], price)], [Infinity, -Infinity]) : [parseInt(e?.price ?? "999999")],
//   //         image: (e?.product_image.length ?? 0) > 0 ? e?.product_image[0].image_url : "#",
//   //         raw: e,
//   //         stock: (e?.product_varian.length ?? 0) > 0 ? e?.product_varian.reduce((q, n) => q + n.stock_qty, 0) : e?.qty ?? 0,
//   //       }));
//   //   }, [merch, searchQuery, selected]);

//   //   const merchList = useMemo(() => {
//   //     const q = (searchQuery ?? "").trim().toLowerCase();

//   //     return merch
//   //       ?.filter(Boolean)
//   //       .filter((e) => {
//   //         if (!q) return true; // no query -> show all

//   //         const name = String(e?.product_name ?? "").toLowerCase();
//   //         const sku = String(e?.product_varian ?? "").toLowerCase();

//   //         return name.includes(q) || sku.includes(q);
//   //       })
//   //       .map((e, i) => ({
//   //         name: e?.product_name,
//   //         price: (e?.product_varian.length ?? 0) > 0 ? e?.product_varian.map((v) => parseInt(v.price)).reduce((acc, price) => [Math.min(acc[0], price), Math.max(acc[1], price)], [Infinity, -Infinity]) : [parseInt(e?.price ?? "999999")],
//   //         image: (e?.product_image.length ?? 0) > 0 ? e?.product_image[0].image_url : "#",
//   //         raw: e,
//   //         stock: (e?.product_varian.length ?? 0) > 0 ? e?.product_varian.reduce((q, n) => q + n.stock_qty, 0) : e?.qty ?? 0,
//   //       }));
//   //   }, [merch, searchQuery, selected]);

//   const merchList = useMemo(() => {
//     const normalize = (s: unknown) =>
//       (s ?? "")
//         .toString()
//         .toLowerCase()
//         .trim()
//         .replace(/[\s\-_.]/g, ""); // hapus spasi, dash, underscore, dot supaya search lebih toleran

//     const q = normalize(searchQuery);

//     return (
//       merch
//         ?.filter(Boolean)
//         .filter((e) => {
//           if (!q) return true;

//           const name = normalize(e.product_name);
//           const skuMain = normalize((e as any).sku); // guard jika ada sku di level product

//           const variantSKUs = (e.product_varian ?? []).map((v) => normalize(v?.sku));
//           const variantNames = (e.product_varian ?? []).map((v) => normalize(v?.varian_name));

//           const searchableParts = [name, skuMain, ...variantSKUs, ...variantNames].filter(Boolean);
//           const searchable = searchableParts.join(" | ");

//           // debug: uncomment satu baris ini untuk inspeksi
//           // console.log("searchable for", e.id, searchable);

//           return searchable.includes(q);
//         })
//         .map((e) => ({
//           name: e.product_name,
//           price: (e.product_varian?.length ?? 0) > 0 ? e.product_varian.map((v) => parseInt(v.price ?? "0")).reduce((acc, price) => [Math.min(acc[0], price), Math.max(acc[1], price)], [Infinity, -Infinity]) : [parseInt(e.price ?? "0")],
//           image: (e.product_image?.length ?? 0) > 0 ? e.product_image[0].image_url : "#",
//           raw: e,
//           stock: (e.product_varian?.length ?? 0) > 0 ? e.product_varian.reduce((sum, v) => sum + (v.stock_qty ?? 0), 0) : e.qty ?? 0,
//         })) ?? []
//     );
//   }, [merch, searchQuery]); // removed `selected` from deps

//   const selectedList = useMemo(() => {
//     return selected.map((e) => {
//       const product = merch?.find((z) => z.id == e.id);
//       const name = product?.product_name;
//       const variant_name = product?.product_varian.find((z) => z.id == e.variant_id)?.varian_name;
//       const image = (product?.product_image?.length ?? 0) > 0 ? product?.product_image[0].image_url : "#";
//       const price = !e.variant_id ? parseInt(product?.price ?? "999999") : parseInt(product?.product_varian?.find((z) => z.id == e.variant_id)?.price ?? "999999");
//       const subtotal = price * e.count;
//       const stock = !e.variant_id ? product?.qty ?? 0 : product?.product_varian.find((z) => z.id == e.variant_id)?.stock_qty ?? 0;

//       return { id: e.id, variant_id: e.variant_id, name, variant_name, price, image, count: e.count, stock, subtotal };
//     });
//   }, [selected]);

//   const handleAddProduct = (product: MerchListResponse) => {
//     if (product.product_varian.length > 0) {
//       const selectVariant = (variant: MerchListResponse["product_varian"][number]) => {
//         if (selected.some((e) => e.variant_id == variant.id)) {
//           const validStock = variant.stock_qty > (selected.find((e) => e.variant_id == variant.id)?.count ?? 9999);
//           if (validStock) {
//             setSelected(selected.map((e) => (e.variant_id == variant.id ? { ...e, count: e.count + 1 } : e)));
//           } else {
//             notifications.show({
//               message: "Stock sudah mencapai maksimal",
//               color: "red",
//             });
//           }
//         } else {
//           setSelected([...selected, { id: product.id, variant_id: variant.id, count: 1 }]);
//         }
//         modals.closeAll();
//         setOpenSelect(!openSelect);
//       };

//       modals.open({
//         size: 300,
//         centered: true,
//         title: "Pilih Varian",
//         children: (
//           <Stack gap={10}>
//             {product.product_varian.map((e, i) => (
//               <Button size="md" radius={8} onClick={() => selectVariant(e)} key={i} variant="light" color="gray" c="gray.8" fw={400}>
//                 {e.varian_name} (<NumberFormatter value={parseInt(e.price)} />)
//               </Button>
//             ))}
//           </Stack>
//         ),
//       });
//     } else {
//       if (selected.some((e) => e.id == product.id)) {
//         const validStock = product.qty > (selected.find((e) => e.id == product.id)?.count ?? 9999);
//         if (validStock) {
//           setSelected(selected.map((e) => (e.id == product.id ? { ...e, count: e.count + 1 } : e)));
//         } else {
//           notifications.show({
//             message: "Stock sudah mencapai maksimal",
//             color: "red",
//           });
//         }
//       } else {
//         setSelected([...selected, { id: product.id, count: 1 }]);
//       }
//       setOpenSelect(!openSelect);
//     }
//   };

//   const handleDeleteItem = (index: number) => {
//     modals.openConfirmModal({
//       centered: true,
//       title: "Hapus Item",
//       children: "Apakah kamu yakin ingin menghapus item ini?",
//       labels: { confirm: "Hapus", cancel: "Batal" },
//       onConfirm: () => {
//         setSelected(selected.filter((_, i) => i != index));
//       },
//     });
//   };

//   const handleSummary = useMemo((): { total: number; detail: [string, number][] } => {
//     const subtotal = selectedList.reduce((q, n) => q + n.price, 0);
//     const admin = 0;
//     const disc = Boolean(discount) || discount < 0 ? discount * -1 : 0;
//     const ppn = (subtotal + admin) * 0.11;
//     const total = Math.max(0, _.sum([subtotal, admin, ppn, disc]));

//     return {
//       total,
//       detail: [
//         ["Subtotal", subtotal],
//         ["Diskon", disc],
//         ["Admin", 0],
//         ["PPN", ppn],
//       ],
//     };
//   }, [selectedList, discount]);

//   const openSelectPayment = () => {
//     const payment = [
//       { icon: "ph:money-wavy", text: "CASH" },
//       { icon: "basil:card-outline", text: "Credit Card" },
//     ];

//     modals.open({
//       centered: true,
//       title: "Pilih Metode Pembayaran",
//       children: (
//         <Stack gap={15}>
//           {payment.map((e, i) => (
//             <Button
//               key={i}
//               leftSection={<Icon icon={e.icon} className={`text-[24px]`} />}
//               variant="light"
//               color="gray"
//               c="gray.8"
//               onClick={() => {
//                 setPaymentMethod(e.text);
//                 modals.closeAll();
//               }}
//             >
//               {e.text}
//             </Button>
//           ))}
//         </Stack>
//       ),
//     });
//   };

//   const handleCustomerSave = () => {
//     const valid = custValidate();
//     if (valid.hasErrors) return;
//     setOpenCustForm(false);
//     modals.closeAll();
//   };

// const handleSave = async () => {
//   const summary: MerchCheckoutOffline["summary"] = {};
//   for (const s of handleSummary.detail) summary[s[0]] = s[1];

//   const data: MerchCheckoutOffline = {
//     product: selectedList.map((e) => ({
//       id: e.id,
//       variant_id: e.variant_id,
//       qty: e.count,
//       price: e.price,
//       subtotal: e.subtotal,
//     })),
//     customer_name: custValue.name,
//     customer_email: custValue.email,
//     customer_phone: custValue.phone,
//     customer_address: custValue.address,
//     grandtotal: handleSummary.total,
//     creator_id: user?.has_creator?.id ?? 0,
//     summary,
//     discount,
//     payment_method: paymentMethod,
//   };
//   const next = () => {
//     Cookies.set("merch_pos_submit", JSON.stringify(data satisfies MerchCheckoutOffline));
//     router.push("/dashboard/merch-pos-invoice");
//   };
//   await fetch<MerchCheckoutOffline, any>({
//     url: "merch-offline",
//     method: "POST",
//     data,
//     before: () => setLoading.append("submit"),
//     success: () => {
//       next();
//     },
//     complete: () => setLoading.filter((e) => e != "submit"),
//     error: (err) => {
//       next();
//       notifications.show({
//         message: err?.response?.data?.message ?? "Terjadi Kesalahan",
//         color: "red",
//       });
//     },
//   });
// };

//   const PER_PAGE = 10;
//   const [pageNum, setPageNum] = useState(1);

//   return (
//     <Stack className={`md:!p-[20px_30px]`}>
//       <Modal title="Data Pembeli" opened={openCustForm} onClose={handleCustomerSave} closeOnClickOutside={false} centered>
//         <Stack gap={15}>
//           <TextInput label="Nama" placeholder="Isi Nama Pembeli" {...custProps("name")} />
//           <TextInput label="Email" placeholder="Isi Email Pembeli" {...custProps("email")} inputMode="email" />
//           <TextInput label="No. Telp" placeholder="Isi No.Telp Pembeli" {...custProps("phone")} inputMode="numeric" />
//           <Textarea label="Alamat" placeholder="Isi Alamat Pembeli" {...custProps("address")} minRows={3} autosize />
//           <Button onClick={handleCustomerSave} rightSection={<Icon icon="uiw:circle-check" />}>
//             Simpan Data
//           </Button>
//         </Stack>
//       </Modal>

//       <Card radius={999} className={`!bg-primary-base !p-[5px_16px] w-fit m-[10px_10px_0]`}>
//         <Flex align="center" gap={10}>
//           <Icon icon="hugeicons:cashier" className={`text-[20px] text-white`} />
//           <Text size="md" fw={400} className={`!text-white`}>
//             Penjualan Offline
//           </Text>
//         </Flex>
//       </Card>

//       <Flex gap={15} className={`!h-[calc(100vh_-_140px)] md:!h-[calc(100vh_-_180px)]`} pos="relative">
//         <Card withBorder w="100%" radius={10} h="100%" className={`!absolute z-30 transition-transform ${openSelect ? "" : "translate-x-[120%] md:!translate-x-0"} md:!static`}>
//           <LoadingOverlay visible={loading.includes("getdata")} />
//           <Stack gap={20} h="100%">
//             <Text fw={600} c="#0B387C">
//               Pilih Produk
//             </Text>
//             <TextInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftSection={<Icon icon="uiw:search" />} placeholder="Cari Produk" />
//             <Stack gap={10} className={`overflow-y-auto`} h="100%">
//               {merchList?.map((e, i) => (
//                 <UnstyledButton disabled={(e.stock ?? 0) <= 0} className={`${(e.stock ?? 0) <= 0 ? "opacity-75" : ""}`} key={i} onClick={() => e.raw && handleAddProduct(e.raw)}>
//                   <Card p={10} withBorder radius={8} className={`relative ${(e.stock ?? 0) <= 0 ? "!bg-[#f5f5f5]" : "hover:!bg-[#fafafa]"}`}>
//                     <Flex gap={10}>
//                       <Image src={e.image} h={48} w={48} bg="gray" radius={5} />
//                       <Stack gap={0}>
//                         <Text className={`capitalize`}>{e.name}</Text>
//                         <Text size="sm" fw={600} className={`whitespace-nowrap`}>
//                           {(e?.price ?? [])?.map((z, i) => (
//                             <Box key={i} component="span">
//                               {i != 0 && <> - </>}
//                               <NumberFormatter value={z} key={i} />
//                             </Box>
//                           ))}
//                         </Text>
//                         {(e.stock ?? 0) <= 0 && (
//                           <Text size="xs" c="gray" mt={5} className={`capitalize`}>
//                             Stock Habis
//                           </Text>
//                         )}
//                       </Stack>
//                     </Flex>

//                     <Icon icon="uiw:right" className={`!absolute top-2/4 -translate-y-2/4 right-5 z-20 text-[#d0d0d0]`} />
//                   </Card>
//                 </UnstyledButton>
//               ))}
//               {merchList?.length == 0 && (
//                 <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />}>
//                   Tidak ada produk yang ditemukan
//                 </Alert>
//               )}
//             </Stack>

//             <Flex gap={10} mt={10}>
//               <Button
//                 onClick={() => {
//                   setPageNum(pageNum - 1);
//                   getMerchList(pageNum - 1);
//                 }}
//                 disabled={pageNum <= 1}
//               >
//                 Prev
//               </Button>
//               <Button
//                 onClick={() => {
//                   setPageNum(pageNum + 1);
//                   getMerchList(pageNum + 1);
//                 }}
//               >
//                 Next
//               </Button>
//             </Flex>

//             <Button size="md" onClick={() => setOpenSelect(!openSelect)} rightSection={<Icon icon="uiw:right" />} className={`shrink-0 md:!hidden`} c="gray" variant="light">
//               Tutup
//             </Button>
//           </Stack>
//         </Card>

//         <Card withBorder w="100%" p={0} radius={10} h="100%">
//           <Stack gap={0} h="100%">
//             <Card p={20} className={`flex-grow h-full`}>
//               <Flex align="center" gap={10} mb={20}>
//                 <Icon icon="uiw:information-o" className={`text-primary-base`} />
//                 <Text fw={600} c="#0B387C">
//                   Rincian Produk
//                 </Text>
//               </Flex>

//               <Stack gap={12} className={`overflow-y-auto flex-grow`} justify="start">
//                 {selectedList.map((e, i) => (
//                   <Card p={10} withBorder radius={8} pos="relative" key={i} className={`hover:!bg-[#fafafa] shrink-0`}>
//                     <Flex gap={10} wrap="wrap">
//                       <Flex gap={10} className={`flex-grow`}>
//                         <Image src={e.image} h={48} w={48} bg="gray" radius={5} />
//                         <Stack gap={0}>
//                           <Text size="sm" className={`capitalize whitespace-nowrap`}>
//                             {e.name}
//                           </Text>
//                           {e.variant_name && (
//                             <Text size="xs" c="gray" mb={5} className={`capitalize`}>
//                               Varian: {e.variant_name}
//                             </Text>
//                           )}
//                           <Text size="sm" className={`whitespace-nowrap`}>
//                             <NumberFormatter value={e.subtotal} />
//                           </Text>
//                         </Stack>
//                       </Flex>

//                       {/* className={`!absolute z-20 top-2/4 right-5 -translate-y-2/4`} */}
//                       <Flex gap={10} align="center" className={`shrink-0`}>
//                         <NumberInput
//                           min={1}
//                           max={e.stock}
//                           onChange={(e) => {
//                             setSelected(selected.map((_, x) => (x == i ? { ..._, count: parseInt(e as string) } : _)));
//                           }}
//                           value={e.count}
//                           size="xs"
//                           w={80}
//                         />
//                         <ActionIcon onClick={() => handleDeleteItem(i)} color="red.4" variant="transparent">
//                           <Icon icon="uiw:delete" />
//                         </ActionIcon>
//                       </Flex>
//                     </Flex>
//                   </Card>
//                 ))}
//                 {selected.length == 0 && (
//                   <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />}>
//                     Belum ada produk yang dipilih
//                   </Alert>
//                 )}
//                 <Button size="md" className={`md:!hidden shrink-0`} onClick={() => setOpenSelect(!openSelect)} leftSection={<Icon icon="uiw:plus" />} variant="light">
//                   Tambah Produk
//                 </Button>
//               </Stack>
//             </Card>

//             <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0] !shrink-0`} radius={0}>
//               <Flex gap={10} align="center" className={`overflow-x-auto [&>*]:!shrink-0`}>
//                 <Button onClick={() => setOpenCustForm(true)} rightSection={<Icon icon="uiw:right" />} pos="relative" variant="light">
//                   Data Pembeli
//                 </Button>

//                 <Button onClick={openSelectPayment} rightSection={<Icon icon="uiw:right" />} pos="relative" variant="light">
//                   Metode Pembayaran {paymentMethod ? `(${paymentMethod})` : ""}
//                 </Button>
//               </Flex>
//             </Card>

//             <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0] !shrink-0`} radius={0}>
//               <Flex gap={15} justify="space-between" align="center" wrap="wrap" mb={-5}>
//                 <Flex gap={7} align="center">
//                   <Icon icon="teenyicons:discount-outline" className={`text-primary-base`} />
//                   <Text size="sm" className={`!text-primary-base`}>
//                     Diskon Tambahan
//                   </Text>
//                 </Flex>
//                 <NumberInput prefix="Rp " hideControls placeholder="Masukan Diskon" value={discount} onChange={(e) => setDiscount(parseInt(e as string))} className={`[&_*]:!text-center`} />
//               </Flex>
//             </Card>

//             <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0] !shrink-0`} radius={0}>
//               <Stack>
//                 <Accordion
//                   w="calc(100% + 40px)"
//                   chevronPosition="left"
//                   mx={-20}
//                   mt={-12}
//                   className={`
//                                         ${handleSummary.detail.filter((e) => Boolean(e[1]) || e[1] < 0).length > 0 ? "" : "!hidden"}
//                                         [&_.mantine-Accordion-label]:!text-primary-base [&_.mantine-Accordion-label]:!text-[14px]
//                                         [&_.mantine-Accordion-chevron>svg]:!rotate-180 [&_.mantine-Accordion-label]:!ml-[-5px]
//                                     `}
//                 >
//                   <Accordion.Item value="summary">
//                     <Accordion.Control>Detail Pembayaran</Accordion.Control>
//                     <Accordion.Panel>
//                       <Stack px={10} gap={10}>
//                         {handleSummary.detail
//                           .filter((e) => Boolean(e[1]) || e[1] < 0)
//                           .map((e, i) => (
//                             <Flex gap={10} align="center" justify="space-between" key={i}>
//                               <Text size="sm" c="gray.8">
//                                 {e[0]}
//                               </Text>
//                               <Text size="sm" fw={600} c={e[1] < 0 ? "red" : undefined}>
//                                 <NumberFormatter prefix="Rp " value={e[1]} />
//                               </Text>
//                             </Flex>
//                           ))}
//                       </Stack>
//                     </Accordion.Panel>
//                   </Accordion.Item>
//                 </Accordion>
//                 <Flex gap={15} justify="space-between" align="center" wrap="wrap">
//                   <Stack gap={0}>
//                     <Text size="xs" className={`!text-primary-base`}>
//                       Total Pembayaran
//                     </Text>
//                     <Text>
//                       <NumberFormatter className={`font-[600]`} value={handleSummary.total} />
//                     </Text>
//                   </Stack>
//                   <Button loading={loading.includes("submit")} onClick={handleSave} disabled={handleSummary.total <= 0 || !paymentMethod} rightSection={<Icon icon="uiw:right" />}>
//                     Bayar
//                   </Button>
//                 </Flex>
//               </Stack>
//             </Card>
//           </Stack>
//         </Card>
//       </Flex>
//     </Stack>
//   );
// }
import useLoggedUser from "@/utils/useLoggedUser";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Accordion,
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Image,
  LoadingOverlay,
  Menu,
  Modal,
  NumberFormatter,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { MerchListResponse } from "../merch/type";
import { useEffect, useMemo, useState } from "react";
import { useListState } from "@mantine/hooks";
import fetch from "@/utils/fetch";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import _ from "lodash";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { DatePickerInput, DatesRangeValue } from "@mantine/dates";

type ComponentProps = {};

type CustomerData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type MerchCheckoutOffline = {
  product: {
    id: number;
    variant_id?: number;
    qty: number;
    price: number;
    subtotal: number;
  }[];
  invoice_num?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  discount?: number;
  summary?: { [key: string]: number };
  grandtotal: number;
  creator_id: number;
  payment_method?: string;
};

type TransactionItem = {
  id: number;
  invoice_number: string;
  invoice_no: string;
  customer_name: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items?: {
    product_name: string;
    quantity: number;
    price: number;
  }[];
};

export default function Index({}: Readonly<ComponentProps>) {
  const user = useLoggedUser();
  const [loading, setLoading] = useListState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [merch, setMerch] = useState<MerchListResponse[]>();
  const [productCache, setProductCache] = useState<Record<number, MerchListResponse>>({});
  const [discount, setDiscount] = useState(0);
  const [openSelect, setOpenSelect] = useState(false);
  const [openCustForm, setOpenCustForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("Qris");
  const [selected, setSelected] = useState<
    {
      id: number;
      variant_id?: number;
      count: number;
    }[]
  >([]);
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>("order");
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const [transactionStatus, setTransactionStatus] = useState<string>("all");
  const [printBillLoading, setPrintBillLoading] = useState(false);

  const {
    values: custValue,
    getInputProps: custProps,
    errors: custError,
    validate: custValidate,
  } = useForm<CustomerData>({
    onValuesChange: (val) => {
      val.phone = String(val.phone ?? "").replace(/\D/g, "");
      return val;
    },
    validate: zodResolver(
      z.object({
        name: z.string().optional().nullable(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
      }),
    ),
  });

  useEffect(() => {
    if (user) {
      getMerchList();
      getTransactions();
    }
  }, [user]);

  const getMerchList = async (pageNum: number = 1) => {
    const creatorId = user?.has_creator?.id;
    if (!creatorId) {
      console.warn("getMerchList aborted: no creator id on user", user);
      return;
    }

    const qs = new URLSearchParams({
      per_page: String(PER_PAGE),
      page: String(pageNum),
      creator_id: String(creatorId),
    }).toString();

    const url = `product-bymerchant?${qs}`;

    const envToken = (process?.env?.NEXT_PUBLIC_API_TOKEN as string) || "";
    const cookieToken = Cookies.get("token") || localStorage.getItem("token") || "";
    const token = envToken || cookieToken || "";

    console.log("Fetching:", url, { creatorId, pageNum, tokenPresent: !!token });

    await fetch<any, any>({
      url,
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      before: () => setLoading.append("getdata"),
      success: ({ data }) => {
        console.log("Raw API response (data):", data);

        if (!data) {
          console.warn("getMerchList: no data in response");
          setMerch([]);
          return;
        }

        const items: MerchListResponse[] = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : (data.items ?? []);

        console.log("Resolved items length:", items.length);

        const filtered = items.filter((e) => e.product_status_id == 2);
        console.log("Filtered items (status==2) count:", filtered.length);
        setMerch(filtered);

        setProductCache((prev) => {
          const next = { ...prev };
          for (const it of filtered) {
            next[it.id] = it;
          }
          return next;
        });
      },
      complete: () => setLoading.filter((e) => e != "getdata"),
      error: (err) => {
        console.error("getMerchList error:", err);
        notifications.show({ message: "Gagal memuat produk. Cek console.", color: "red" });
        setMerch([]);
      },
    });
  };

  const getTransactions = async (page: number = 1) => {
    const creatorId = user?.has_creator?.id;
    if (!creatorId) return;

    let url = `order-bycreator?creator_id=${creatorId}&page=${page}&limit=10&order_by=created_at&order_direction=desc`;

    if (transactionSearch) {
      url += `&search=${encodeURIComponent(transactionSearch)}`;
    }

    if (transactionStatus !== "all") {
      url += `&status=${transactionStatus}`;
    }

    const [startDate, endDate] = dateRange;
    if (startDate) {
      const startDateStr = startDate.toISOString().split("T")[0];
      url += `&start_date=${startDateStr}`;
    }

    if (endDate) {
      const endDateStr = endDate.toISOString().split("T")[0];
      url += `&end_date=${endDateStr}`;
    }

    await fetch<any, any>({
      url,
      method: "GET",
      before: () => setLoading.append("get-transactions"),
      success: ({ data }) => {
        console.log("Transactions data:", data);

        let formattedTransactions: TransactionItem[] = [];
        let total = 0;

        if (data?.data) {
          formattedTransactions = data.data.map((item: any) => ({
            id: item.id,
            invoice_number: item.invoice_number || `KL-${item.id}`.padStart(6, "0"),
            invoice_no: item.invoice_no || item.invoice_number || `KL-${item.id}`.padStart(6, "0"),
            customer_name: item.customer_name || item.nama_pemesan || "Guest",
            total_amount: item.grandtotal || item.total_amount || 0,
            status: item.status || "completed",
            payment_method: item.payment_method || "Cash",
            created_at: item.created_at || new Date().toISOString(),
            items: item.items || item.products || [],
          }));
          total = data.total || data.meta?.total || formattedTransactions.length;
        } else if (Array.isArray(data)) {
          formattedTransactions = data.map((item: any) => ({
            id: item.id,
            invoice_number: item.invoice_number || `KL-${item.id}`.padStart(6, "0"),
            invoice_no: item.invoice_no || item.invoice_number || `KL-${item.id}`.padStart(6, "0"),
            customer_name: item.customer_name || item.nama_pemesan || "Guest",
            total_amount: item.grandtotal || item.total_amount || 0,
            status: item.status || "completed",
            payment_method: item.payment_method || "Cash",
            created_at: item.created_at || new Date().toISOString(),
            items: item.items || item.products || [],
          }));
          total = formattedTransactions.length;
        }

        formattedTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setTransactions(formattedTransactions);
        setTotalTransactions(total);
      },
      complete: () => setLoading.filter((e) => e != "get-transactions"),
      error: (err) => {
        console.error("Error fetching transactions:", err);
        notifications.show({ message: "Gagal memuat riwayat transaksi", color: "red" });
      },
    });
  };

  const handleSearchTransactions = () => {
    setTransactionPage(1);
    getTransactions(1);
  };

  const handleResetFilters = () => {
    setTransactionSearch("");
    setDateRange([null, null]);
    setTransactionStatus("all");
    setTransactionPage(1);
    getTransactions(1);
  };

  const merchList = useMemo(() => {
    const normalize = (s: unknown) =>
      (s ?? "")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\-_.]/g, "");

    const q = normalize(searchQuery);

    return (
      merch
        ?.filter(Boolean)
        .filter((e) => {
          if (!q) return true;

          const name = normalize(e.product_name);
          const skuMain = normalize((e as any).sku);

          const variantSKUs = (e.product_varian ?? []).map((v) => normalize(v?.sku));
          const variantNames = (e.product_varian ?? []).map((v) => normalize(v?.varian_name));

          const searchableParts = [name, skuMain, ...variantSKUs, ...variantNames].filter(Boolean);
          const searchable = searchableParts.join(" | ");

          return searchable.includes(q);
        })
        .map((e) => ({
          name: e.product_name,
          price: (e.product_varian?.length ?? 0) > 0 ? e.product_varian.map((v) => parseInt(v.price ?? "0")).reduce((acc, price) => [Math.min(acc[0], price), Math.max(acc[1], price)], [Infinity, -Infinity]) : [parseInt(e.price ?? "0")],
          image: (e.product_image?.length ?? 0) > 0 ? e.product_image[0].image_url : "#",
          raw: e,
          stock: (e.product_varian?.length ?? 0) > 0 ? e.product_varian.reduce((sum, v) => sum + (v.stock_qty ?? 0), 0) : (e.qty ?? 0),
        })) ?? []
    );
  }, [merch, searchQuery]);

  const selectedList = useMemo(() => {
    return selected.map((e) => {
      const product = productCache[e.id];
      const name = product?.product_name;
      const variant_name = product?.product_varian?.find((z) => z.id == e.variant_id)?.varian_name;
      const image = (product?.product_image?.length ?? 0) > 0 ? product?.product_image[0].image_url : "#";
      const price = !e.variant_id ? parseInt(product?.price ?? "999999") : parseInt(product?.product_varian?.find((z) => z.id == e.variant_id)?.price ?? "999999");
      const subtotal = price * e.count;
      const stock = !e.variant_id ? (product?.qty ?? 0) : (product?.product_varian?.find((z) => z.id == e.variant_id)?.stock_qty ?? 0);

      return { id: e.id, variant_id: e.variant_id, name, variant_name, price, image, count: e.count, stock, subtotal };
    });
  }, [selected, productCache]);

  const handleAddProduct = (product: MerchListResponse) => {
    setProductCache((prev) => ({ ...prev, [product.id]: product }));

    if (product.product_varian.length > 0) {
      const selectVariant = (variant: MerchListResponse["product_varian"][number]) => {
        if (selected.some((e) => e.variant_id == variant.id)) {
          const validStock = variant.stock_qty > (selected.find((e) => e.variant_id == variant.id)?.count ?? 9999);
          if (validStock) {
            setSelected(selected.map((e) => (e.variant_id == variant.id ? { ...e, count: e.count + 1 } : e)));
          } else {
            notifications.show({
              message: "Stock sudah mencapai maksimal",
              color: "red",
            });
          }
        } else {
          setSelected([...selected, { id: product.id, variant_id: variant.id, count: 1 }]);
        }
        modals.closeAll();
        setOpenSelect(!openSelect);
      };

      modals.open({
        size: 300,
        centered: true,
        title: "Pilih Varian",
        children: (
          <Stack gap={10}>
            {product.product_varian.map((e, i) => (
              <Button size="md" radius={8} onClick={() => selectVariant(e)} key={i} variant="light" color="gray" c="gray.8" fw={400}>
                {e.varian_name} (<NumberFormatter value={parseInt(e.price)} />)
              </Button>
            ))}
          </Stack>
        ),
      });
    } else {
      if (selected.some((e) => e.id == product.id)) {
        const validStock = product.qty > (selected.find((e) => e.id == product.id)?.count ?? 9999);
        if (validStock) {
          setSelected(selected.map((e) => (e.id == product.id ? { ...e, count: e.count + 1 } : e)));
        } else {
          notifications.show({
            message: "Stock sudah mencapai maksimal",
            color: "red",
          });
        }
      } else {
        setSelected([...selected, { id: product.id, count: 1 }]);
      }
      setOpenSelect(!openSelect);
    }
  };

  const handleDeleteItem = (index: number) => {
    modals.openConfirmModal({
      centered: true,
      title: "Hapus Item",
      children: "Apakah kamu yakin ingin menghapus item ini?",
      labels: { confirm: "Hapus", cancel: "Batal" },
      onConfirm: () => {
        setSelected(selected.filter((_, i) => i != index));
      },
    });
  };

  const handleSummary = useMemo((): { total: number; detail: [string, number][] } => {
    const subtotal = selectedList.reduce((q, n) => q + (n.subtotal ?? 0), 0);
    const admin = 0;
    const disc = Boolean(discount) || discount < 0 ? discount * -1 : 0;
    const total = Math.max(0, _.sum([subtotal, admin, disc]));

    return {
      total,
      detail: [
        ["Subtotal", subtotal],
        ["Diskon", disc],
        ["Admin", 0],
      ],
    };
  }, [selectedList, discount]);

  const openSelectPayment = () => {
    const payment = [
      { icon: "ph:money-wavy", text: "CASH" },
      { icon: "ph:money-wavy", text: "Qris" },
    ];

    modals.open({
      centered: true,
      title: "Pilih Metode Pembayaran",
      children: (
        <Stack gap={15}>
          {payment.map((e, i) => (
            <Button
              key={i}
              leftSection={<Icon icon={e.icon} className={`text-[24px]`} />}
              variant="light"
              color="gray"
              c="gray.8"
              onClick={() => {
                setPaymentMethod(e.text);
                modals.closeAll();
              }}
            >
              {e.text}
            </Button>
          ))}
        </Stack>
      ),
    });
  };

  const handleCustomerSave = () => {
    const valid = custValidate();
    if (valid.hasErrors) return;
    setOpenCustForm(false);
    modals.closeAll();
  };

  const handlePrintBill = () => {
    if (selectedList.length === 0) {
      notifications.show({ message: "Pilih minimal 1 produk untuk print bill", color: "red" });
      return;
    }

    setPrintBillLoading(true);

    const billContent = generateBillContent();

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Bill</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                max-width: 300px;
                margin: 0 auto;
                padding: 10px;
              }
              .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .store-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .date {
                font-size: 11px;
                margin-bottom: 10px;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
              }
              .items-table th {
                text-align: left;
                border-bottom: 1px solid #000;
                padding: 5px 0;
              }
              .items-table td {
                padding: 3px 0;
                border-bottom: 1px dashed #ccc;
              }
              .total-section {
                margin-top: 15px;
                border-top: 1px solid #000;
                padding-top: 10px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .grand-total {
                font-weight: bold;
                font-size: 14px;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 11px;
                border-top: 1px dashed #000;
                padding-top: 10px;
              }
              @media print {
                @page {
                  margin: 0;
                  size: 80mm auto;
                }
                body {
                  max-width: 80mm;
                }
              }
            </style>
          </head>
          <body>
            ${billContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    setTimeout(() => {
      setPrintBillLoading(false);
      notifications.show({
        message: "Bill berhasil dicetak",
        color: "green",
      });
    }, 1000);
  };

  const generateBillContent = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("id-ID");
    const invoiceNumber = `POS-${Date.now().toString().slice(-6)}`;

    let itemsHTML = "";
    selectedList.forEach((item, index) => {
      itemsHTML += `
        <tr>
          <td>${item.name}${item.variant_name ? ` (${item.variant_name})` : ""}</td>
          <td align="center">${item.count}</td>
          <td align="right">${item.price.toLocaleString("id-ID")}</td>
          <td align="right">${item.subtotal.toLocaleString("id-ID")}</td>
        </tr>
      `;
    });

    return `
      <div class="header">
        <div class="store-name">TOKO ${user?.has_creator?.name?.toUpperCase() || "MERCH"}</div>
        <div>Jl. Example No. 123</div>
        <div>Telp: 021-12345678</div>
        <div class="date">${dateStr} ${timeStr}</div>
        <div>Invoice: ${invoiceNumber}</div>
        ${custValue.name ? `<div>Pelanggan: ${custValue.name}</div>` : ""}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Produk</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="total-section">
        ${handleSummary.detail
          .filter(([label, value]) => value !== 0)
          .map(
            ([label, value]) => `
            <div class="total-row">
              <span>${label}:</span>
              <span>Rp ${Math.abs(value).toLocaleString("id-ID")}</span>
            </div>
          `,
          )
          .join("")}
        
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>Rp ${handleSummary.total.toLocaleString("id-ID")}</span>
        </div>
        
        <div class="total-row">
          <span>Pembayaran:</span>
          <span>${paymentMethod}</span>
        </div>
      </div>

      <div class="footer">
        <div>Terima kasih atas kunjungan Anda</div>
        <div>*** ${invoiceNumber} ***</div>
      </div>
    `;
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      notifications.show({ message: "Pilih metode pembayaran terlebih dahulu.", color: "red" });
      return;
    }
    if ((selectedList ?? []).length === 0) {
      notifications.show({ message: "Pilih minimal 1 produk sebelum checkout.", color: "red" });
      return;
    }

    const name = (custValue.name ?? "").toString().trim();
    const email = (custValue.email ?? "").toString().trim();
    const phone = (custValue.phone ?? "").toString().trim();
    const address = (custValue.address ?? "").toString().trim();

    if (!name && !email && !phone && !address) {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const guestName = `Guest ${randomId}`;
      const guestEmail = `guest_${randomId}@mail.com`;
      const guestPhone = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
      const guestAddress = "Jalanan " + Math.floor(Math.random() * 100) + " Rumah " + Math.floor(Math.random() * 100);

      const safeChange = (propName: keyof CustomerData, value: string) => {
        const p = custProps(propName as any) as any;
        if (!p || typeof p.onChange !== "function") return;
        try {
          p.onChange(value);
        } catch {
          try {
            p.onChange({ target: { value } });
          } catch {}
        }
      };

      safeChange("name", guestName);
      safeChange("email", guestEmail);
      safeChange("phone", guestPhone);
      safeChange("address", guestAddress);
    }

    const payloadName = (custValue.name ?? "").toString() || `Guest`;
    const payloadEmail = (custValue.email ?? "").toString() || "-";
    const payloadPhone = (custValue.phone ?? "").toString() || "";
    const payloadAddress = (custValue.address ?? "").toString() || "";

    const productsPayload = (selectedList ?? []).map((e) => ({
      product_id: e.id,
      variant_id: e.variant_id ?? null,
      qty: e.count,
      price: e.price,
    }));

    const creatorId = user?.has_creator?.id ?? 0;
    const courierPayload = { main: "-", type: "-", price: 0 };
    const addressPayload = {
      id: null,
      is_main_address: 1,
      province_id: 1,
      city_id: 1,
      address_detail: payloadAddress,
      address_name: payloadName,
      zipcode: Math.floor(10000 + Math.random() * 90000).toString(),
      latitude: "",
      longitude: "",
      nama_penerima: payloadName,
      phone: payloadPhone,
      is_active: 1,
    };

    try {
      if (paymentMethod === "CASH") {
        await fetch<any, any>({
          url: "order-product",
          method: "POST",
          data: {
            user_id: user?.id ?? null,
            nama_pemesan: payloadName,
            email_pemesan: payloadEmail,
            creator_id: creatorId,
            grandtotal: handleSummary.total,
            product: productsPayload,
            payment_method: paymentMethod,
            courier: courierPayload,
            address: addressPayload,
            status: "completed",
          },
          before: () => setLoading.append("checkout"),
          success: async ({ data }) => {
            console.log("Cash payment success:", data);

            await handleSave();

            notifications.show({
              message: "Pembayaran Cash berhasil diproses",
              color: "green",
            });

            handlePrintBill();
          },
          complete: () => setLoading.filter((e) => e != "checkout"),
          error: (err) => {
            console.error("Cash payment error:", err);

            if (err?.response?.data?.out_of_stock || err?.response?.out_of_stock) {
              notifications.show({
                color: "red",
                message: "Produk sudah habis stok",
              });
              return;
            }

            const msg = err?.response?.data?.message ?? "Gagal checkout. Periksa kembali input.";
            notifications.show({ message: msg, color: "red" });
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else if (paymentMethod === "Qris") {
        await fetch<any, { invoice_url: string }>({
          url: "order-product",
          method: "POST",
          data: {
            user_id: user?.id ?? null,
            nama_pemesan: payloadName,
            email_pemesan: payloadEmail,
            creator_id: creatorId,
            grandtotal: handleSummary.total,
            product: productsPayload,
            payment_method: paymentMethod,
            courier: courierPayload,
            address: addressPayload,
          },
          before: () => setLoading.append("checkout"),
          success: async ({ data }) => {
            console.log("Xendit response:", data);

            await handleSave();

            if (data?.invoice_url) {
              router.push(data.invoice_url);
              return;
            }

            notifications.show({
              message: "Checkout sukses, tapi invoice tidak tersedia.",
              color: "yellow",
            });
          },
          complete: () => setLoading.filter((e) => e != "checkout"),
          error: (err) => {
            console.error("handleCheckout error:", err);

            if (err?.response?.data?.out_of_stock || err?.response?.out_of_stock) {
              notifications.show({
                color: "red",
                message: "Produk sudah habis stok",
              });
              return;
            }

            const msg = err?.response?.data?.message ?? "Gagal checkout. Periksa kembali input.";
            notifications.show({ message: msg, color: "red" });
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch (err) {
      console.error("unexpected handleCheckout error:", err);
      notifications.show({ message: "Terjadi kesalahan tak terduga saat checkout.", color: "red" });
      setLoading.filter((e) => e != "checkout");
    }
  };

  const handleSave = async () => {
    const summary: MerchCheckoutOffline["summary"] = {};
    for (const s of handleSummary.detail) summary[s[0]] = s[1];

    const data: MerchCheckoutOffline = {
      product: selectedList.map((e) => ({
        id: e.id,
        variant_id: e.variant_id,
        qty: e.count,
        price: e.price,
        subtotal: e.subtotal,
      })),
      customer_name: custValue.name,
      customer_email: custValue.email,
      customer_phone: custValue.phone,
      customer_address: custValue.address,
      grandtotal: handleSummary.total,
      creator_id: user?.has_creator?.id ?? 0,
      summary,
      discount,
      payment_method: paymentMethod,
    };
    const next = () => {
      Cookies.set("merch_pos_submit", JSON.stringify(data satisfies MerchCheckoutOffline));
      router.push("/dashboard/merch-pos-invoice");
    };
    await fetch<MerchCheckoutOffline, any>({
      url: "merch-offline",
      method: "POST",
      data,
      before: () => setLoading.append("submit"),
      success: () => {
        next();
      },
      complete: () => setLoading.filter((e) => e != "submit"),
      error: (err) => {
        next();
        notifications.show({
          message: err?.response?.data?.message ?? "Terjadi Kesalahan",
          color: "red",
        });
      },
    });
  };

  const renderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      completed: { color: "green", label: "Selesai" },
      pending: { color: "yellow", label: "Pending" },
      cancelled: { color: "red", label: "Dibatalkan" },
      processing: { color: "blue", label: "Diproses" },
      paid: { color: "green", label: "Dibayar" },
      unpaid: { color: "orange", label: "Belum Dibayar" },
      success: { color: "green", label: "Sukses" },
      failed: { color: "red", label: "Gagal" },
    };

    const config = statusConfig[status.toLowerCase()] || { color: "gray", label: status };

    return (
      <Badge color={config.color} variant="light" size="sm">
        {config.label}
      </Badge>
    );
  };

  const PER_PAGE = 10;
  const [pageNum, setPageNum] = useState(1);
  const isGuest = custValue.name?.startsWith("Guest ") && custValue.email?.includes("guest_");

  return (
    <Stack className={`md:!p-[20px_30px] h-screen flex flex-col`}>
      <Modal title="Data Pembeli" opened={openCustForm} onClose={handleCustomerSave} closeOnClickOutside={false} centered>
        <Stack gap={15}>
          <Button
            variant="light"
            color="gray"
            onClick={() => {
              const randomId = Math.floor(100000 + Math.random() * 900000);
              const randomName = `Guest ${randomId}`;
              const randomEmail = `guest_${randomId}@mail.com`;
              const randomAddress = "Jalanan " + Math.floor(Math.random() * 100) + " Rumah " + Math.floor(Math.random() * 100);

              const randomPhone = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");

              const safeChange = (propName: keyof CustomerData, value: string) => {
                const p = custProps(propName as any) as any;
                if (!p || typeof p.onChange !== "function") return;

                try {
                  p.onChange(value);
                } catch (err) {
                  try {
                    p.onChange({ target: { value } });
                  } catch (err2) {}
                }
              };

              safeChange("name", randomName);
              safeChange("email", randomEmail);
              safeChange("phone", randomPhone);
              safeChange("address", randomAddress);
            }}
          >
            Gunakan Guest
          </Button>

          <TextInput label="Nama" placeholder="Isi Nama Pembeli" {...custProps("name")} />
          <TextInput label="Email" placeholder="Isi Email Pembeli" {...custProps("email")} inputMode="email" />
          <TextInput label="No. Telp" placeholder="Isi No.Telp Pembeli" {...custProps("phone")} inputMode="numeric" />
          <Textarea label="Alamat" placeholder="Isi Alamat Pembeli" {...custProps("address")} minRows={3} autosize />
          <Button onClick={handleCustomerSave} rightSection={<Icon icon="uiw:circle-check" />}>
            Simpan Data
          </Button>
        </Stack>
      </Modal>

      <Flex gap={15} className={`flex-grow min-h-0 overflow-hidden pb-24`}>
        <Card withBorder w="100%" radius={10} h="100%" className={`!absolute z-30 transition-transform ${openSelect ? "" : "translate-x-[120%] md:!translate-x-0"} md:!static overflow-hidden flex flex-col`}>
          <LoadingOverlay visible={loading.includes("getdata")} />
          <Stack gap={20} h="100%" className="flex flex-col">
            <div>
              <Text fw={600} c="#0B387C">
                Pilih Produk
              </Text>
              <TextInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftSection={<Icon icon="uiw:search" />} placeholder="Cari Produk" mt={10} />
            </div>

            <div className="overflow-y-auto flex-grow">
              {merchList?.length === 0 ? (
                <Alert radius={10} color="gray" icon={<Icon icon="uiw:information-o" />} mt={20}>
                  Tidak ada produk yang ditemukan
                </Alert>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
                  {merchList?.map((e, i) => (
                    <UnstyledButton
                      disabled={(e.stock ?? 0) <= 0}
                      className={`${(e.stock ?? 0) <= 0 ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02] transition-transform duration-200'}`}
                      key={i}
                      onClick={() => e.raw && handleAddProduct(e.raw)}
                    >
                      <Card
                        withBorder
                        radius={8}
                        className={`h-full ${(e.stock ?? 0) <= 0 ? "!bg-[#f5f5f5]" : "hover:!bg-[#fafafa] hover:shadow-md transition-all duration-200"}`}
                        p={12}
                      >
                        <Stack gap={8} className="h-full">
                          <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                            <Image
                              src={e.image}
                              width="100%"
                              height="100%"
                              fit="cover"
                              fallbackSrc="https://placehold.co/300x300/EBF4FF/0B387C?text=Produk"
                              className="object-cover"
                            />
                            {e.stock <= 0 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Text c="white" size="xs" fw={600}>
                                  STOK HABIS
                                </Text>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <Text size="sm" fw={500} lineClamp={2} className="text-gray-800 min-h-[40px]">
                              {e.name}
                            </Text>
                            
                            <Text size="sm" fw={600} c="primary" className="mt-2">
                              {(e?.price ?? []).map((z, i) => (
                                <Box key={i} component="span">
                                  {i !== 0 && <> - </>}
                                  <NumberFormatter value={z} />
                                </Box>
                              ))}
                            </Text>
                            
                            <div className="mt-2">
                              {e.stock > 0 ? (
                                <Text size="xs" c="green" className="flex items-center gap-1">
                                  <Icon icon="uiw:check" className="text-xs" />
                                  Stok: {e.stock}
                                </Text>
                              ) : (
                                <Text size="xs" c="red" className="flex items-center gap-1">
                                  <Icon icon="uiw:close" className="text-xs" />
                                  Stok Habis
                                </Text>
                              )}
                            </div>
                          </div>

                          {(e.stock ?? 0) > 0 && (
                            <Button
                              variant="light"
                              color="primary"
                              size="xs"
                              fullWidth
                              className="mt-2"
                              leftSection={<Icon icon="uiw:plus" />}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                e.raw && handleAddProduct(e.raw);
                              }}
                            >
                              Tambah
                            </Button>
                          )}
                        </Stack>
                      </Card>
                    </UnstyledButton>
                  ))}
                </div>
              )}
            </div>

            <Stack gap={10} mt="auto">
              <Flex gap={10} mt={10}>
                <Button
                  onClick={() => {
                    setPageNum(pageNum - 1);
                    getMerchList(pageNum - 1);
                  }}
                  disabled={pageNum <= 1}
                >
                  Prev
                </Button>
                <Button
                  onClick={() => {
                    setPageNum(pageNum + 1);
                    getMerchList(pageNum + 1);
                  }}
                >
                  Next
                </Button>
              </Flex>

              <Button size="md" onClick={() => setOpenSelect(!openSelect)} rightSection={<Icon icon="uiw:right" />} className={`shrink-0 md:!hidden`} c="gray" variant="light">
                Tutup
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Card withBorder w="100%" p={0} radius={10} h="100%" className="flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto">
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              classNames={{
                root: "sticky top-0 z-10 bg-white",
                tab: "data-[active=true]:bg-primary-base/10 data-[active=true]:text-primary-base py-3",
                list: "border-b border-gray-200 px-4",
              }}
            >
              <Tabs.List grow>
                <Tabs.Tab value="order" leftSection={<Icon icon="uiw:shopping-cart" />}>
                  Rincian Pesanan
                </Tabs.Tab>
                <Tabs.Tab value="transactions" leftSection={<Icon icon="uiw:file-text" />}>
                  Riwayat Transaksi
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="order" pt="md">
                <Card p={20} className="h-auto">
                  <Flex align="center" gap={10} mb={20}>
                    <div className="bg-primary-base/10 p-2 rounded-lg">
                      <Icon icon="uiw:shopping-cart" className="text-primary-base text-lg" />
                    </div>
                    <div>
                      <Text fw={700} size="lg" c="#0B387C">
                        Rincian Pesanan
                      </Text>
                      <Text size="xs" c="gray.6">
                        {selectedList.length} item dipilih
                      </Text>
                    </div>
                  </Flex>

                  {selectedList.length === 0 ? (
                    <Card withBorder radius={12} p={30} className="text-center bg-gray-50/50 border-dashed border-2">
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                          <Icon icon="uiw:shopping-cart" className="text-3xl text-gray-400" />
                        </div>
                        <Text c="gray.6" size="sm" mb={10}>
                          Belum ada produk yang dipilih
                        </Text>
                      </div>
                      <Button size="md" className="md:!hidden" onClick={() => setOpenSelect(!openSelect)} leftSection={<Icon icon="uiw:plus" />} variant="filled" color="primary" radius="md" fullWidth>
                        Tambah Produk
                      </Button>
                    </Card>
                  ) : (
                    <ScrollArea h={300} scrollbarSize={6}>
                      <Stack gap={10}>
                        {selectedList.map((e, i) => (
                          <Card key={i} p={12} withBorder radius={10} className="hover:bg-gray-50/50 transition-all duration-200 group">
                            <Flex gap={12} align="center">
                              <div className="relative flex-shrink-0">
                                <Image src={e.image} h={60} w={60} radius={8} className="border border-gray-200" fallbackSrc="https://placehold.co/60x60/EBF4FF/0B387C?text=Produk" />
                                {e.count > 1 && <div className="absolute -top-2 -right-2 bg-primary-base text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{e.count}</div>}
                              </div>

                              <div className="flex-1 min-w-0">
                                <Flex justify="space-between" align="flex-start" gap={8}>
                                  <div>
                                    <Text size="sm" fw={600} lineClamp={1} className="text-gray-800">
                                      {e.name}
                                    </Text>
                                    {e.variant_name && (
                                      <Flex align="center" gap={4} mt={2}>
                                        <Icon icon="uiw:tag" className="text-xs text-gray-500" />
                                        <Text size="xs" c="gray.6" className="capitalize">
                                          {e.variant_name}
                                        </Text>
                                      </Flex>
                                    )}
                                  </div>
                                  <Text size="sm" fw={700} className="text-primary-base whitespace-nowrap">
                                    <NumberFormatter prefix="Rp " value={e.subtotal} />
                                  </Text>
                                </Flex>

                                <Flex justify="space-between" align="center" mt={8}>
                                  <div className="flex items-center gap=3">
                                    <Text size="xs" c="gray.6">
                                      @ <NumberFormatter prefix="Rp " value={e.price} />
                                    </Text>
                                    {e.stock < 10 && e.stock > 0 && (
                                      <Text size="xs" c="orange" className="bg-orange-50 px-2 py-0.5 rounded-full">
                                        Stok: {e.stock}
                                      </Text>
                                    )}
                                    {e.stock === 0 && (
                                      <Text size="xs" c="red" className="bg-red-50 px-2 py-0.5 rounded-full">
                                        Stok Habis
                                      </Text>
                                    )}
                                  </div>

                                  <Flex align="center" gap={8}>
                                    <NumberInput
                                      min={1}
                                      max={e.stock}
                                      value={e.count}
                                      onChange={(value) => {
                                        const numValue = typeof value === "string" ? parseInt(value) || 1 : value;
                                        setSelected(selected.map((item, idx) => (idx === i ? { ...item, count: numValue } : item)));
                                      }}
                                      size="xs"
                                      w={80}
                                      className="[&_input]:text-center [&_input]:font-semibold"
                                      styles={{
                                        input: {
                                          borderColor: "#CBD5E0",
                                          "&:focus": {
                                            borderColor: "#0B387C",
                                          },
                                        },
                                      }}
                                    />
                                    <ActionIcon onClick={() => handleDeleteItem(i)} color="red.5" variant="subtle" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Icon icon="uiw:delete" className="text-base" />
                                    </ActionIcon>
                                  </Flex>
                                </Flex>
                              </div>
                            </Flex>
                          </Card>
                        ))}
                      </Stack>
                    </ScrollArea>
                  )}

                  {selectedList.length > 0 && (
                    <div className="mt-4">
                      <Card withBorder radius={10} p={12} className="bg-gray-50/50">
                        <Flex justify="space-between" align="center">
                          <div>
                            <Text size="sm" c="gray.7" fw={500}>
                              Subtotal ({selectedList.length} item)
                            </Text>
                            <Text size="xs" c="gray.6">
                              Total sebelum diskon
                            </Text>
                          </div>
                          <Text size="md" fw={700} c="gray.8">
                            <NumberFormatter prefix="Rp " value={selectedList.reduce((sum, item) => sum + (item.subtotal ?? 0), 0)} />
                          </Text>
                        </Flex>
                      </Card>
                    </div>
                  )}

                  {selectedList.length > 0 && (
                    <Button size="md" className="md:!hidden mt-4" onClick={() => setOpenSelect(!openSelect)} leftSection={<Icon icon="uiw:plus" />} variant="light" color="primary" radius="md" fullWidth>
                      Tambah Produk Lain
                    </Button>
                  )}
                </Card>

                <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0]`} radius={0}>
                  <Flex gap={10} align="center" className={`overflow-x-auto [&>*]:!shrink-0`}>
                    <Button onClick={() => setOpenCustForm(true)} rightSection={<Icon icon="uiw:right" />} pos="relative" variant="light">
                      Data Pembeli
                    </Button>

                    <Button onClick={openSelectPayment} rightSection={<Icon icon="uiw:right" />} pos="relative" variant="light">
                      Metode Pembayaran {paymentMethod ? `(${paymentMethod})` : ""}
                    </Button>
                  </Flex>
                </Card>

                <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0]`} radius={0}>
                  <Flex gap={15} justify="space-between" align="center" wrap="wrap" mb={-5}>
                    <Flex gap={7} align="center">
                      <Icon icon="teenyicons:discount-outline" className={`text-primary-base`} />
                      <Text size="sm" className={`!text-primary-base`}>
                        Diskon Tambahan
                      </Text>
                    </Flex>
                    <NumberInput prefix="Rp " hideControls placeholder="Masukan Diskon" value={discount} onChange={(e) => setDiscount(parseInt(e as string))} className={`[&_*]:!text-center`} />
                  </Flex>
                </Card>

                <Card p="12px 16px 16px" className={`border-t border-t-[#d0d0d0]`} radius={0}>
                  <Stack gap={8}>
                    <Accordion
                      variant="separated"
                      radius="sm"
                      chevronPosition="right"
                      className="w-full"
                      styles={{
                        item: {
                          border: "1px solid #e2e8f0",
                          backgroundColor: "#ffffff",
                          "&[data-active]": {
                            backgroundColor: "#f7fafc",
                          },
                        },
                        control: {
                          padding: "8px 12px",
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          color: "#0B387C",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        },
                        chevron: {
                          color: "#0B387C",
                          width: "16px",
                          height: "16px",
                        },
                        content: {
                          padding: "0 12px 8px 12px",
                        },
                      }}
                    >
                      <Accordion.Item value="customer">
                        <Accordion.Control>
                          <div className="flex items-center gap-2">
                            <Icon icon="mdi:account-outline" className="text-sm" />
                            <span className="text-sm">Data Pembeli</span>
                          </div>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <div className="space-y-3 pt-1">
                            {custValue.name || custValue.email || custValue.phone || custValue.address ? (
                              <>
                                <div className="grid grid-cols-1 gap-2">
                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                      <Icon icon="mdi:account" className="text-xs" />
                                      <span>Nama</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded">{custValue.name || "-"}</div>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                      <Icon icon="mdi:email-outline" className="text-xs" />
                                      <span>Email</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded">{custValue.email || "-"}</div>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                      <Icon icon="mdi:phone-outline" className="text-xs" />
                                      <span>No. Telp</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded">{custValue.phone || "-"}</div>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                      <Icon icon="mdi:map-marker-outline" className="text-xs" />
                                      <span>Alamat</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded whitespace-pre-wrap">{custValue.address || "-"}</div>
                                  </div>
                                </div>

                                <div className="flex justify-end pt-1">
                                  <Button variant="subtle" size="xs" color="blue" leftSection={<Icon icon="mdi:pencil" className="text-xs" />} onClick={() => setOpenCustForm(true)}>
                                    Edit
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-3">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
                                  <Icon icon="mdi:account-question" className="text-lg text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500 mb-3">Belum ada data pembeli</p>
                                <Button variant="light" color="blue" size="xs" leftSection={<Icon icon="mdi:plus" className="text-xs" />} onClick={() => setOpenCustForm(true)}>
                                  Tambah Data
                                </Button>
                              </div>
                            )}
                          </div>
                        </Accordion.Panel>
                      </Accordion.Item>

                      <Accordion.Item value="summary">
                        <Accordion.Control>
                          <div className="flex items-center gap-2">
                            <Icon icon="mdi:receipt-text-outline" className="text-sm" />
                            <span className="text-sm">Detail Pembayaran</span>
                          </div>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <div className="space-y-2 pt-1">
                            {handleSummary.detail
                              .filter((e) => Boolean(e[1]) || e[1] < 0)
                              .map((e, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                  <div className="flex items-center gap-1.5">
                                    {e[0] === "Subtotal" && <Icon icon="mdi:cart-outline" className="text-xs text-gray-400" />}
                                    {e[0] === "Diskon" && <Icon icon="mdi:tag-outline" className="text-xs text-gray-400" />}
                                    {e[0] === "Admin" && <Icon icon="mdi:credit-card-outline" className="text-xs text-gray-400" />}
                                    <span className="text-xs text-gray-600">{e[0]}</span>
                                  </div>
                                  <div className={`text-xs font-medium ${e[1] < 0 ? "text-red-500" : "text-gray-800"}`}>
                                    <NumberFormatter prefix="Rp " value={e[1]} />
                                  </div>
                                </div>
                              ))}

                            <div className="pt-2 mt-2 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Icon icon="mdi:cash-multiple" className="text-sm text-primary-base" />
                                  <span className="text-xs font-semibold text-primary-base">Total</span>
                                </div>
                                <div className="text-sm font-bold text-primary-base">
                                  <NumberFormatter prefix="Rp " value={handleSummary.total} />
                                </div>
                              </div>

                              {discount !== 0 && (
                                <div className="mt-1 text-[10px] text-gray-500 text-right">{discount > 0 ? <span className="text-green-600">✓ Diskon diterapkan</span> : <span className="text-red-500">✗ Tanpa diskon</span>}</div>
                              )}
                            </div>
                          </div>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                    <Flex justify="flex-end" mt={2}>
                      <Button
                        component="button"
                        type="button"
                        size="xs"
                        radius="sm"
                        variant={isGuest ? "filled" : "blue"}
                        color={isGuest ? "green" : "gray"}
                        data-ssr="1"
                        onClick={() => {
                          const safeChange = (propName: keyof CustomerData, value: string) => {
                            const p = custProps(propName as any) as any;
                            if (!p) return;
                            try {
                              if (typeof p.onChange === "function") {
                                p.onChange(value);
                                return;
                              }
                            } catch {}
                            try {
                              if (typeof p.onChange === "function") p.onChange({ target: { value } });
                            } catch {}
                          };

                          if (isGuest) {
                            safeChange("name", "");
                            safeChange("email", "");
                            safeChange("phone", "");
                            safeChange("address", "");
                            return;
                          }

                          const randomId = Math.floor(100000 + Math.random() * 900000);
                          const randomName = `Guest ${randomId}`;
                          const randomEmail = `guest_${randomId}@mail.com`;
                          const randomPhone = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
                          const addrA = Math.floor(Math.random() * 101);
                          const addrB = Math.floor(Math.random() * 101);
                          const randomAddress = `Jalanan ${addrA} Rumah ${addrB}`;

                          safeChange("name", randomName);
                          safeChange("email", randomEmail);
                          safeChange("phone", randomPhone);
                          safeChange("address", randomAddress);
                        }}
                      >
                        {isGuest ? "Guest Aktif" : "Gunakan Guest"}
                      </Button>
                    </Flex>
                  </Stack>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="transactions" pt="md">
                <Card p={20}>
                  <Flex align="center" gap={10} mb={20}>
                    <div className="bg-primary-base/10 p-2 rounded-lg">
                      <Icon icon="uiw:file-text" className="text-primary-base text-lg" />
                    </div>
                    <div>
                      <Text fw={700} size="lg" c="#0B387C">
                        Riwayat Transaksi
                      </Text>
                      <Text size="xs" c="gray.6">
                        {totalTransactions} transaksi ditemukan
                      </Text>
                    </div>
                  </Flex>

                  <Card withBorder p="md" radius="md" mb="md" className="bg-gray-50/50">
                    <Stack gap="md">
                      <Text fw={600} size="sm">
                        Filter Transaksi
                      </Text>

                      <Flex gap="md" wrap="wrap">
                        <TextInput
                          placeholder="Cari berdasarkan invoice..."
                          value={transactionSearch}
                          onChange={(e) => setTransactionSearch(e.target.value)}
                          leftSection={<Icon icon="uiw:search" />}
                          className="flex-1 min-w-[200px]"
                          size="sm"
                        />

                        <DatePickerInput type="range" placeholder="Pilih rentang tanggal" value={dateRange} onChange={setDateRange} className="w-[250px]" size="sm" clearable valueFormat="DD/MM/YYYY" />

                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <Button variant="outline" size="sm" rightSection={<Icon icon="uiw:down" />}>
                              Status: {transactionStatus === "all" ? "Semua" : transactionStatus}
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item onClick={() => setTransactionStatus("all")}>Semua Status</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item onClick={() => setTransactionStatus("paid")}>Dibayar</Menu.Item>
                            <Menu.Item onClick={() => setTransactionStatus("unpaid")}>Belum Dibayar</Menu.Item>
                            <Menu.Item onClick={() => setTransactionStatus("completed")}>Selesai</Menu.Item>
                            <Menu.Item onClick={() => setTransactionStatus("pending")}>Pending</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Flex>

                      <Flex gap="sm" justify="flex-end">
                        <Button variant="light" size="sm" onClick={handleResetFilters} leftSection={<Icon icon="uiw:reload" />}>
                          Reset
                        </Button>
                        <Button size="sm" onClick={handleSearchTransactions} loading={loading.includes("get-transactions")} leftSection={<Icon icon="uiw:search" />}>
                          Cari
                        </Button>
                      </Flex>
                    </Stack>
                  </Card>

                  <LoadingOverlay visible={loading.includes("get-transactions")} />

                  {transactions.length === 0 ? (
                    <Card withBorder radius={12} p={30} className="text-center bg-gray-50/50 border-dashed border-2">
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                          <Icon icon="uiw:file-text" className="text-3xl text-gray-400" />
                        </div>
                        <Text c="gray.6" size="sm" mb={10}>
                          Tidak ada transaksi ditemukan
                        </Text>
                        <Button onClick={() => getTransactions()} variant="light" size="sm" leftSection={<Icon icon="uiw:reload" />}>
                          Refresh
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table striped highlightOnHover verticalSpacing="sm" style={{ minWidth: "800px" }}>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th style={{ width: "60px" }}>No</Table.Th>
                              <Table.Th style={{ minWidth: "150px" }}>Invoice No</Table.Th>
                              <Table.Th style={{ minWidth: "150px" }}>Pelanggan</Table.Th>
                              <Table.Th style={{ minWidth: "120px" }}>Total</Table.Th>
                              <Table.Th style={{ minWidth: "120px" }}>Status</Table.Th>
                              <Table.Th style={{ minWidth: "120px" }}>Pembayaran</Table.Th>
                              <Table.Th style={{ minWidth: "120px" }}>Tanggal</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {transactions.map((transaction, index) => (
                              <Table.Tr key={transaction.id}>
                                <Table.Td>
                                  <Text size="sm" c="gray.7">
                                    {(transactionPage - 1) * 10 + index + 1}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text fw={500} size="sm">
                                    {transaction.invoice_no || transaction.invoice_number}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm">{transaction.customer_name}</Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text fw={600} size="sm">
                                    <NumberFormatter prefix="Rp " value={transaction.total_amount} thousandSeparator="." decimalSeparator="," />
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <div style={{ minWidth: "100px" }}>{renderStatusBadge(transaction.status)}</div>
                                </Table.Td>
                                <Table.Td>
                                  <Badge variant="outline" size="sm">
                                    {transaction.payment_method}
                                  </Badge>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm">
                                    {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </Text>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </div>

                      <Flex justify="space-between" align="center" mt="md">
                        <Text size="sm" c="gray.6">
                          Halaman {transactionPage} - Menampilkan {transactions.length} dari {totalTransactions} transaksi
                        </Text>

                        <Flex gap={10}>
                          <Button
                            size="sm"
                            variant="subtle"
                            onClick={() => {
                              if (transactionPage > 1) {
                                const newPage = transactionPage - 1;
                                setTransactionPage(newPage);
                                getTransactions(newPage);
                              }
                            }}
                            disabled={transactionPage <= 1}
                          >
                            Prev
                          </Button>
                          <Button
                            size="sm"
                            variant="subtle"
                            onClick={() => {
                              const newPage = transactionPage + 1;
                              setTransactionPage(newPage);
                              getTransactions(newPage);
                            }}
                            disabled={transactions.length < 10}
                          >
                            Next
                          </Button>
                        </Flex>
                      </Flex>
                    </>
                  )}
                </Card>
              </Tabs.Panel>
            </Tabs>
          </div>
        </Card>
      </Flex>

      {activeTab === "order" && (
        <div
          className="fixed bottom-0 z-50"
          style={{
            left: "300px",
            right: "280px",
          }}
        >
          <div className="bg-white border border-gray-200 rounded-t-lg shadow-lg px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button variant="light" color="gray" onClick={handlePrintBill} loading={printBillLoading} disabled={selectedList.length === 0} leftSection={<Icon icon="uiw:printer" />} size="md">
                  Print Bill
                </Button>
                <div className="h-6 border-l border-gray-300"></div>
                <div className="flex flex-col">
                  <span className="text-sm text-primary-base font-medium">Total Pembayaran</span>
                  <span className="text-base font-bold">
                    <NumberFormatter prefix="Rp " value={handleSummary.total} />
                  </span>
                </div>
              </div>
              <Button loading={loading.includes("submit") || loading.includes("checkout")} onClick={handleCheckout} disabled={handleSummary.total <= 0 || !paymentMethod} size="md" radius="xl" className="min-w-[120px]">
                Bayar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Stack>
  );
}