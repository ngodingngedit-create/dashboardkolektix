// pages/cart.tsx
// import { PropsWithChildren, useEffect, useMemo, useState } from "react";
// import {
//   Container,
//   Group,
//   Checkbox,
//   Text,
//   Title,
//   Button,
//   Paper,
//   Stack,
//   Image,
//   Flex,
//   Card,
//   NumberFormatter,
//   ActionIcon,
//   Center,
//   NumberInput,
//   AspectRatio,
//   Divider,
//   UnstyledButton,
//   TextInput,
//   Box,
//   Modal,
//   Select,
//   Textarea,
//   Loader,
// } from "@mantine/core";
// import { useListState } from "@mantine/hooks";
// import { MerchListResponse } from "../dashboard/merch/type";
// import { Delete, Get } from "@/utils/REST";
// import useLoggedUser from "@/utils/useLoggedUser";
// import _ from "lodash";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { useRouter } from "next/router";
// import { useForm, zodResolver } from "@mantine/form";
// import Cookies from "js-cookie";
// import fetch from "@/utils/fetch";
// import { AddressData, addressDataSchema, AddressUpdateRequest } from "../dashboard/profile/address";
// import { currencyFormat } from "@/utils/currencyFormat";
// import { z } from "zod";

// type Province = {
//   id: number;
//   name: string;
// };

// type City = {
//   id: number;
//   province_id: number;
//   name: string;
//   province?: Province;
// };

// type FormState = {
//   nama_pemesan?: string;
//   email_pemesan?: string;
//   receiver?: {
//     id?: number;
//     name: string;
//     phone: string;
//     address_name: string;
//     province_id: number;
//     city_id: number;
//     pos_code: number;
//     detail: string;
//   };
//   payment_method?: string;
//   courier?: {
//     name: string;
//     type?: GetCourierRes;
//   };
// };

// type GetCourierReq = {
//   origin: number;
//   origin_type: string;
//   destination: number;
//   destination_type: string;
//   weight: number;
//   courier: string;
// };

// type GetCourierRes = {
//   service: string;
//   description: string;
//   cost: Array<{
//     value: number;
//     etd: string;
//     note: string;
//   }>;
// };

// type OrderData = {
//   product_id: number;
//   variant_id: number;
//   qty: number;
// }[];

// type Checkout = {
//   user_id: number | null;
//   nama_pemesan?: string;
//   email_pemesan?: string;
//   creator_id: number;
//   grandtotal: number;
//   product: Array<{
//     product_id: number;
//     variant_id: null | number;
//     qty: number;
//     price: number;
//   }>;
//   payment_method: string;
//   courier: {
//     main: string;
//     type: string;
//     price: number;
//   };
//   address: {
//     id?: number;
//     is_main_address: number;
//     province_id: number;
//     city_id: number;
//     address_detail: string;
//     address_name: string;
//     zipcode: string;
//     latitude: string;
//     longitude: string;
//     nama_penerima: string;
//     phone: string;
//     is_active: number;
//   };
// };

// export const formStateSchema = z.object({
//   nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
//   email_pemesan: z.string().email("Email pemesan tidak boleh kosong.").optional().nullable(),
//   receiver: z.object({
//     name: z.string().nonempty("Nama penerima tidak boleh kosong."),
//     address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
//     phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
//     province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
//     city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
//     pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
//     detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
//   }),
//   payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
//   courier: z.object({
//     name: z.string().nonempty("Kurir tidak boleh kosong."),
//     type: z.any().optional(),
//   }),
// });

// export default function Cart() {
//   const [isr, setIsr] = useState(false);
//   const [modal, setModal] = useState<string>();
//   const [orderData, setOrderData] = useState<OrderData>();
//   const [productList, setProductList] = useListState<MerchListResponse>();
//   const [addressList, setAddressList] = useListState<AddressUpdateRequest>([]);
//   const [loading, setLoading] = useListState<string>();
//   const [provinceList, setProvinceList] = useListState<Province>([]);
//   const [cityList, setCityList] = useListState<City>([]);
//   const [subCourier, setSubCourier] = useListState<GetCourierRes>();
//   const user = useLoggedUser();
//   const router = useRouter();

//   const form = useForm<FormState>({});

//   useEffect(() => {
//     setIsr(true);
//   }, []);

//   useEffect(() => {
//     getData();
//     const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");
//     if (!_orderData || _orderData.length == 0) router.push("/merchandise");
//     setOrderData(_orderData);
//   }, [isr]);

//   useEffect(() => {
//     if (form.values.receiver && form.values.courier) {
//       getCourier();
//       form.setValues({ courier: { name: form.values.courier.name, type: undefined } });
//     }
//   }, [form.values.receiver, form.values.courier?.name]);

//   const getData = async () => {
//     Get("product", {})
//       .then((res: any) => {
//         setProductList.setState(res.data);
//         console.log(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });

//     await fetch<any, Province[]>({
//       url: "province",
//       method: "GET",
//       before: () => setLoading.append("getprovince"),
//       success: ({ data }) => {
//         setProvinceList.setState(data ?? []);
//       },
//       complete: () => setLoading.filter((e) => e != "getprovince"),
//     });

//     if (user?.id) {
//       await fetch<any, AddressUpdateRequest[]>({
//         url: `my-address?user_id=${user?.id}`,
//         method: "GET",
//         before: () => setLoading.append("getprovince"),
//         success: ({ data }) => {
//           if (data) {
//             setAddressList.setState(data ?? []);

//             const mainAddress = _.find(data, ["is_main_address", 1]) ?? data[0];
//             form.setValues({
//               receiver: {
//                 name: mainAddress.nama_penerima,
//                 phone: mainAddress.phone,
//                 address_name: mainAddress.address_name,
//                 province_id: mainAddress.province_id,
//                 city_id: mainAddress.city_id,
//                 pos_code: parseInt(mainAddress.zipcode),
//                 detail: mainAddress.address_detail,
//               },
//             });

//             getCity(mainAddress.province_id);
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getprovince"),
//       });
//     }
//   };

//   const getCity = async (province_id: number) => {
//     await fetch<any, City[]>({
//       url: `city?province_id=${province_id}`,
//       method: "GET",
//       before: () => setLoading.append("getcity"),
//       success: ({ data }) => {
//         setCityList.setState(data ?? []);
//       },
//       complete: () => setLoading.filter((e) => e != "getcity"),
//     });
//   };

//   const orderedProduct = useMemo(() => {
//     return orderData?.map((e) => {
//       const product = _.find(productList, ["id", e.product_id]);
//       const variant = e.variant_id ? _.find(product?.product_varian, ["id", e.variant_id]) : null;
//       const subprice = parseInt((!variant ? product?.price : variant?.price) ?? "0");
//       const weight = parseInt((!variant ? product?.weight : variant?.weight) ?? "0");
//       const price = subprice * e.qty;
//       const image = product?.product_image[0] ? product?.product_image[0].image_url : "#";
//       const creator_id = product?.creator_id;

//       return { ...e, product, variant, price, subprice, image, weight, creator_id };
//     });
//   }, [productList, orderData]);

//   const orderSummary = useMemo(() => {
//     const result: [string, number][] = [];

//     for (const order of orderedProduct ?? []) {
//       result.push([`x${order.qty} ${order.product?.product_name ?? "-"}`, order.price]);
//     }

//     if (form.values.courier?.type && form.values.courier?.type.cost && form.values.courier?.type.cost.length > 0) {
//       result.push(["Biaya Pengiriman", form.values.courier?.type.cost[0].value]);
//     }

//     result.push(["Biaya Admin", 2000]);

//     // const subtotal = result.reduce((q, n) => q + n[1], 0);
//     // result.push(["PPN (11%)", subtotal * 0.11]);

//     const grandtotal = result.reduce((q, n) => q + n[1], 0);
//     result.push(["Total", grandtotal]);

//     return { array: result, grandtotal };
//   }, [orderedProduct, form.values.courier?.type, form.values.receiver]);

//   const getCourier = async () => {
//     const originCityId =
//       orderedProduct && orderedProduct.length > 0 && orderedProduct[0].product?.has_store_location && typeof orderedProduct[0].product.has_store_location.city_id === "number" ? orderedProduct[0].product.has_store_location.city_id : 1;

//     await fetch<GetCourierReq, GetCourierRes[]>({
//       url: "product-cost",
//       method: "POST",
//       data: {
//         origin: originCityId,
//         origin_type: "city",
//         destination: form.values.receiver?.city_id ?? 0,
//         destination_type: "city",
//         weight: _.sumBy(orderedProduct, "weight") == 0 ? 999 : _.sumBy(orderedProduct, "weight"),
//         courier: form.values.courier?.name ?? "-",
//       },
//       before: () => setLoading.append("getsubcourier"),
//       success: (res) => setSubCourier.setState(res.data ?? []),
//       complete: () => setLoading.filter((e) => e != "getsubcourier"),
//       error: (err) => {
//         console.error("Failed to fetch courier:", err);
//       },
//     });
//   };

//   const handleCheckout = async () => {
//     const { values } = form;
//     await fetch<Checkout, { invoice_url: string }>({
//       url: "order-product",
//       method: "POST",
//       data: {
//         user_id: user?.id ?? null,
//         nama_pemesan: values.nama_pemesan,
//         email_pemesan: values.email_pemesan,
//         creator_id: orderedProduct ? orderedProduct[0].creator_id ?? 0 : 0,
//         grandtotal: orderSummary.grandtotal,
//         product: (orderedProduct ?? []).map((e) => ({
//           product_id: e.product_id,
//           variant_id: e.variant_id,
//           qty: e.qty,
//           price: e.price,
//         })),
//         payment_method: "xendit",
//         courier: {
//           main: values.courier?.name ?? "-",
//           type: values.courier?.type?.service ?? "-",
//           price: values.courier?.type?.cost[0].value ?? 999999,
//         },
//         address: {
//           id: values.receiver?.id,
//           is_main_address: 1,
//           province_id: values.receiver?.province_id ?? 1,
//           city_id: values.receiver?.city_id ?? 1,
//           address_detail: values.receiver?.detail ?? "",
//           address_name: values.receiver?.address_name ?? "",
//           zipcode: String(values.receiver?.pos_code),
//           latitude: "",
//           longitude: "",
//           nama_penerima: values.receiver?.name ?? "",
//           phone: values.receiver?.phone ?? "",
//           is_active: 1,
//         },
//       },
//       before: () => setLoading.append("checkout"),
//       success: ({ data }) => data && router.push(data.invoice_url),
//       complete: () => setLoading.filter((e) => e != "checkout"),
//       error: () => {},
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   };

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <AddressModal
//         opened={modal == "address"}
//         onClose={() => setModal(undefined)}
//         list={addressList}
//         onChange={(data) => data && form.setValues({ receiver: data })}
//         province={provinceList}
//         getCity={(e) => getCity(e)}
//         cityLoading={loading.includes("getcity")}
//         city={cityList}
//       />

//       <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
//         <Stack gap={25} mb={40}>
//           <Stack gap={0}>
//             <Title order={1} size="h2">
//               Checkout Merchandise
//             </Title>
//             <Text size="sm" c="gray">
//               Pilih Metode Pembayaran dan Alamat Pengiriman
//             </Text>
//           </Stack>

//           <Divider />

//           <Flex gap={20} w="100%" wrap="wrap">
//             <Stack gap={15} className={`flex-grow`}>
//               <DropdownComponent title="Alamat Pengiriman" icon="lets-icons:form-fill" defaultOpened>
//                 {!user?.id && (
//                   <Flex gap={15} wrap="wrap" className="[&>*]:!flex-grow">
//                     <TextInput
//                       disabled={Boolean(user?.id)}
//                       label="Nama Pemesan"
//                       placeholder="Masukan Nama Pemesan"
//                       onChange={(e) => form.setValues({ nama_pemesan: e.target.value })}
//                       value={form.values.nama_pemesan}
//                       error={form.errors.nama_pemesan}
//                     />

//                     <TextInput
//                       type="email"
//                       disabled={Boolean(user?.id)}
//                       label="Email Pemesan"
//                       placeholder="Masukan Email Pemesan"
//                       onChange={(e) => form.setValues({ email_pemesan: e.target.value })}
//                       value={form.values.email_pemesan}
//                       error={form.errors.email_pemesan}
//                     />
//                   </Flex>
//                 )}

//                 <UnstyledButton mih="100%" onClick={() => {}}>
//                   <Card withBorder p={20} radius={15} h="100%" className={`!border-b-3 !border-b-[#0B387C] ${form.values?.receiver?.pos_code ? "" : "!bg-primary-light"}`} onClick={() => setModal("address")}>
//                     {form.values?.receiver?.pos_code ? (
//                       <Flex gap={15}>
//                         <Box c={"#0B387C"}>
//                           <Icon icon="gis:location-poi" className={`text-[24px]`} />
//                         </Box>
//                         <Stack gap={3} mt={-5}>
//                           <Text fw={600} size="lg">
//                             {form.values.receiver.address_name}
//                           </Text>
//                           <Text c="gray" size="sm">
//                             {form.values.receiver.name}, {form.values.receiver.phone}
//                           </Text>
//                           <Text c="gray" size="sm" mt={5} className={`uppercase`}>
//                             {_.find(provinceList, ["id", form.values.receiver.province_id])?.name}, {_.find(cityList, ["id", form.values.receiver.city_id])?.name}, {form.values.receiver.pos_code}
//                           </Text>
//                           <Text c="gray" size="sm">
//                             {form.values.receiver.detail}
//                           </Text>
//                           {/* <Text c="gray" size="xs">({form.values.receiver?.note})</Text> */}
//                         </Stack>
//                       </Flex>
//                     ) : (
//                       <Flex align="center" gap={10} justify="center">
//                         <Icon icon="uiw:plus" className={`text-primary-base`} />
//                         <Text size="sm" c="gray.8">
//                           Pilih atau Tambah Alamat
//                         </Text>
//                       </Flex>
//                     )}
//                   </Card>
//                 </UnstyledButton>
//               </DropdownComponent>

//               <DropdownComponent title="Kurir Pengiriman" icon="fa-solid:shipping-fast">
//                 <Flex wrap="wrap" className={`[&>*]:!flex-grow`} gap={15}>
//                   <Select
//                     disabled={!form.values.receiver?.city_id}
//                     data={[
//                       { value: "jne", label: "JNE" },
//                       { value: "tiki", label: "TIKI" },
//                       { value: "pos", label: "POS Indonesia" },
//                     ]}
//                     placeholder="Pilih Kurir Pengiriman"
//                     value={form.values.courier?.name}
//                     onChange={(e) => {
//                       if (e) {
//                         form.setValues({ courier: { name: e, type: undefined } });
//                       }
//                     }}
//                   />
//                   <Flex gap={10} align="center">
//                     {loading.includes("getsubcourier") && <Loader size="sm" color="#0B387C" />}
//                     <Select
//                       className={`flex-grow`}
//                       disabled={!subCourier || subCourier.length <= 0 || loading.includes("getsubcourier")}
//                       data={subCourier.map((e) => ({ value: e.service, label: `${e.service} (${e.cost[0].etd} ${e.cost[0].etd.includes("HARI") ? "" : "HARI"}) ${currencyFormat(e.cost[0].value)}` }))}
//                       value={form.values.courier?.type?.service}
//                       onChange={(e) => form.setValues({ courier: { name: form.values.courier?.name ?? "-", type: subCourier.find((z) => z.service == e) } })}
//                       placeholder="Pilih Type Pengiriman"
//                     />
//                   </Flex>
//                 </Flex>
//               </DropdownComponent>

//               {/* <DropdownComponent title="Metode Pembayaran" icon="fluent:payment-16-filled">
//                                 <UnstyledButton>
//                                         <Card p={10} radius="md" bg="gray.1">
//                                             <Flex gap={20} align="center">
//                                                 <AspectRatio className={`shrink-0`}>
//                                                     <Image w={50} h={50} bg="gray.1" radius="sm" />
//                                                 </AspectRatio>

//                                                 <Text w="100%">PAYMENT_METHOD_NAME</Text>

//                                                 <Icon icon="uiw:circle-check" className={`text-[#194E9E] text-[24px] shrink-0 mr-[10px]`} />
//                                             </Flex>
//                                         </Card>
//                                     </UnstyledButton>
//                             </DropdownComponent> */}
//             </Stack>

//             <Stack gap={10} className={`flex-grow md:!max-w-[400px]`}>
//               <Card withBorder radius={10} p={20}>
//                 <Stack gap={20}>
//                   <Flex gap={10} align="center">
//                     <Icon icon="octicon:info-24" className={`text-primary-base text-[20px]`} />
//                     <Text fw={600}>Rincian Produk</Text>
//                   </Flex>

//                   <Divider />

//                   {(orderedProduct ?? []).map((e, i) => (
//                     <Flex key={i} gap={15} wrap="wrap">
//                       <AspectRatio className={`shrink-0`}>
//                         <Image alt="image" src={e.image} h={50} w={50} bg="gray.1" radius="sm" />
//                       </AspectRatio>
//                       <Stack className={`flex-grow`} gap={0}>
//                         <Text className={`whitespace-nowrap text-ellipsis overflow-hidden max-w-[150px] md:max-w-[250px]`} size="sm">
//                           {e.product?.product_name}
//                         </Text>
//                         {e.variant && (
//                           <Text c="gray" size="sm">
//                             Varian: {e.variant?.varian_name}
//                           </Text>
//                         )}
//                         <Text c="gray" size="sm">
//                           <NumberFormatter value={e.subprice} />
//                         </Text>
//                       </Stack>
//                       <Text>x{e.qty}</Text>
//                     </Flex>
//                   ))}
//                 </Stack>
//               </Card>

//               <Card withBorder radius={10} p={20}>
//                 <Stack gap={20}>
//                   <Flex gap={10} align="center">
//                     <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
//                     <Text fw={600}>Voucher</Text>
//                   </Flex>

//                   <TextInput placeholder="Masukan Kode Voucher" />
//                 </Stack>
//               </Card>

//               <Card withBorder radius={10} p={20}>
//                 <Stack gap={20}>
//                   <Flex gap={10} align="center">
//                     <Icon icon="uiw:information" className={`text-primary-base text-[20px]`} />
//                     <Text fw={600}>Total Pembayaran</Text>
//                   </Flex>

//                   <Divider />

//                   <Stack>
//                     {orderSummary.array.map((e, i) => (
//                       <Flex justify="space-between" key={i}>
//                         <Text fw={e[0] == "Total" ? 600 : 400}>{e[0]}</Text>
//                         <Text fw={e[0] == "Total" ? 600 : 400}>
//                           <NumberFormatter value={e[1]} />
//                         </Text>
//                       </Flex>
//                     ))}
//                   </Stack>

//                   {/* <Divider /> */}

//                   {/* <Button
//                                         loading={loading.includes('checkout')}
//                                         onClick={handleCheckout}
//                                         className={`uppercase`}
//                                         color="#194E9E"
//                                         rightSection={<Icon icon="uiw:check" />}
//                                         radius="xl">
//                                         Proses Pembayaran
//                                     </Button> */}
//                 </Stack>
//               </Card>
//             </Stack>
//           </Flex>
//         </Stack>

//         <Card pos="fixed" className={`bottom-0 left-0 w-[100vw] border-t !border-primary-light`} py={10} withBorder>
//           <Container size="lg" w="100%">
//             <Flex justify="end" w="100%">
//               <Button loading={loading.includes("checkout")} onClick={handleCheckout} className={`uppercase`} color="#194E9E" rightSection={<Icon icon="uiw:check" />} radius="xl">
//                 Proses Pembayaran
//               </Button>
//             </Flex>
//           </Container>
//         </Card>
//       </Container>
//     </div>
//   );
// }

// const DropdownComponent = ({ defaultOpened, children, title, icon }: PropsWithChildren<{ defaultOpened?: boolean; title: string; icon: string }>) => {
//   const [opened, setOpened] = useState<boolean>(defaultOpened ?? false);

//   return (
//     <>
//       <Card bg="white" radius={10} withBorder>
//         <Stack>
//           <Flex justify="space-between" align="center" gap={20} onClick={() => setOpened(!opened)} className={`cursor-pointer`}>
//             <Flex align="center" gap={10}>
//               <Icon icon={icon} className={`text-[20px] text-[#194E9E]`} />
//               <Text>{title}</Text>
//             </Flex>

//             <ActionIcon variant="transparent" c="gray">
//               <Icon icon="uiw:down" className={`transition-transform ${opened ? "!rotate-180" : ""}`} />
//             </ActionIcon>
//           </Flex>

//           <Stack className={`${opened ? "" : "!hidden"}`} p={5}>
//             {children}
//           </Stack>
//         </Stack>
//       </Card>
//     </>
//   );
// };

// const AddressModal = ({
//   list,
//   opened,
//   onClose,
//   onChange,
//   province,
//   getCity,
//   city,
//   cityLoading,
// }: {
//   list: AddressUpdateRequest[];
//   opened: boolean;
//   onClose: () => void;
//   onChange: (data: FormState["receiver"]) => void;
//   getCity: (province_id: number) => void;
//   cityLoading: boolean;
//   province: Province[];
//   city: City[];
// }) => {
//   const [page, setPage] = useState<"create" | "select">("select");

//   const form = useForm<Omit<AddressData, "id">>({
//     validate: zodResolver(addressDataSchema),
//     onValuesChange: (values) => {
//       if (values.postcode) values.postcode = values.postcode.replaceAll(/\D/g, "");
//       if (values.phone) values.phone = values.phone.replaceAll(/\D/g, "");
//       return values;
//     },
//   });

//   const handleSelect = (data?: AddressUpdateRequest) => {
//     if (data) {
//       onChange({
//         id: data.id,
//         name: data.nama_penerima,
//         phone: data.phone,
//         address_name: data.address_name,
//         province_id: data.province_id,
//         city_id: data.city_id,
//         pos_code: parseInt(data.zipcode),
//         detail: data.address_detail,
//       });
//     } else {
//       const valid = form.validate();
//       if (valid.hasErrors) return;

//       const { values } = form;
//       onChange({
//         name: values.nama_penerima,
//         phone: values.phone,
//         address_name: values.name,
//         province_id: values.province,
//         city_id: values.city,
//         pos_code: parseInt(values.postcode),
//         detail: values.detail,
//       });
//     }
//     onClose();
//   };

//   useEffect(() => {
//     setPage("select");
//   }, [opened]);

//   useEffect(() => {
//     getCity(form.values.province);
//     form.setValues({ city: -1 });
//   }, [form.values.province]);

//   return (
//     <>
//       <Modal title={"Pilih Alamat"} opened={opened} onClose={() => onClose()} centered>
//         {page == "select" && list.length > 0 ? (
//           <Stack gap={20}>
//             {list.map((e, i) => (
//               <UnstyledButton key={i} mih="100%" onClick={() => handleSelect(e)}>
//                 <Card
//                   withBorder
//                   p={20}
//                   radius={15}
//                   h="100%"
//                   className={`!border-b !border-b-[#0B387C]`}
//                   // onClick={() => setModal('address')}
//                 >
//                   <Flex gap={15}>
//                     <Box c={"#0B387C"}>
//                       <Icon icon="gis:location-poi" className={`text-[24px]`} />
//                     </Box>
//                     <Stack gap={3} mt={-5}>
//                       <Text fw={600} size="lg">
//                         {e.address_name}
//                       </Text>
//                       <Text c="gray" size="sm" mt={5} className={`uppercase`}>
//                         {_.find(province, ["id", e.province_id])?.name}, {_.find(city, ["id", e.city_id])?.name}, {e.zipcode}
//                       </Text>
//                       <Text c="gray" size="sm">
//                         {e.address_detail}
//                       </Text>
//                       <Text c="gray" size="sm">
//                         {e.phone}
//                       </Text>
//                       {/* <Text c="gray" size="xs">({form.values.receiver?.note})</Text> */}
//                     </Stack>
//                   </Flex>
//                 </Card>
//               </UnstyledButton>
//             ))}

//             <Button onClick={() => setPage("create")} color="#0B387C" variant="outline" className={`!border-dashed`}>
//               Tambah Baru
//             </Button>
//           </Stack>
//         ) : (
//           <Stack gap={15} p={5}>
//             <TextInput label="Nama Penerima" placeholder="Masukan Nama Penerima" {...form.getInputProps("nama_penerima")} />

//             <TextInput label="Nama Alamat" placeholder="Rumah, Kantor, ..." {...form.getInputProps("name")} />

//             <TextInput label="No. Telp" placeholder="08XX XXXX XXXX" {...form.getInputProps("phone")} />

//             <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
//               <Select
//                 searchable
//                 label="Provinsi"
//                 placeholder="Pilih Provinsi"
//                 data={_.sortBy(province, "name").map((e) => ({ value: String(e.id), label: e.name }))}
//                 value={String(form.values.province)}
//                 onChange={(e) => e && form.setFieldValue("province", parseInt(e))}
//                 error={form.errors.province}
//               />

//               <Select
//                 disabled={cityLoading}
//                 label="Kota"
//                 placeholder="Pilih Kota"
//                 data={city.map((e) => ({ value: String(e.id), label: e.name }))}
//                 value={String(form.values.city)}
//                 onChange={(e) => e && form.setFieldValue("city", parseInt(e))}
//                 error={form.errors.city}
//               />
//             </Flex>

//             <TextInput label="Kode Pos" placeholder="Masukan Kode Pos" {...form.getInputProps("postcode")} />

//             <Textarea autosize minRows={3} label="Detail Alamat" placeholder="Kecamatan, Desa, No. Rumah, dll" {...form.getInputProps("detail")} />

//             <Text size="xs" c="gray">
//               Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.
//             </Text>

//             <Flex align="center" gap={10} justify="space-between" mt={10}>
//               <Button
//                 color="#0B387C"
//                 w="fit-content"
//                 radius="xl"
//                 leftSection={<Icon icon="uiw:check" />}
//                 onClick={() => handleSelect()}
//                 // loading={loading.includes('save')}
//               >
//                 Simpan Alamat
//               </Button>

//               {/* {(modalIndex && modalIndex > 0) ? (
//                                 <ActionIcon
//                                     variant="transparent"
//                                     color="red"
//                                     onClick={() => handleDelete()}
//                                 >
//                                     <Icon icon="uiw:delete" />
//                                 </ActionIcon>
//                             ) : <></>} */}
//             </Flex>
//           </Stack>
//         )}
//       </Modal>
//     </>
//   );
// };

import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  Container,
  Group,
  Checkbox,
  Text,
  Title,
  Button,
  Paper,
  Stack,
  Image,
  Flex,
  Card,
  NumberFormatter,
  ActionIcon,
  Center,
  NumberInput,
  AspectRatio,
  Divider,
  UnstyledButton,
  TextInput,
  Box,
  Modal,
  Select,
  Textarea,
  Loader,
  SimpleGrid,
  Grid,
  Accordion,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { MerchListResponse } from "../dashboard/merch/type";
import { Delete, Get } from "@/utils/REST";
import useLoggedUser from "@/utils/useLoggedUser";
import _ from "lodash";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/router";
import { useForm, zodResolver } from "@mantine/form";
import Cookies from "js-cookie";
import fetch from "@/utils/fetch";
import { AddressData, addressDataSchema, AddressUpdateRequest } from "../dashboard/profile/address";
import { currencyFormat } from "@/utils/currencyFormat";
import { z } from "zod";

type Province = {
  id: number;
  name: string;
};

type City = {
  id: number;
  province_id: number;
  name: string;
  province?: Province;
};

type FormState = {
  nama_pemesan?: string;
  email_pemesan?: string;
  phone_pemesan?: string;
  pickup_location?: {
    address: string;
  };
  receiver?: {
    id?: number;
    name: string;
    phone: string;
    address_name: string;
    province_id: number;
    city_id: number;
    pos_code: number;
    detail: string;
  };
  payment_method?: string;
  courier?: {
    name: string;
    type?: GetCourierRes;
  };
};

type GetCourierReq = {
  origin: number;
  origin_type: string;
  destination: number;
  destination_type: string;
  weight: number;
  courier: string;
};

type GetCourierRes = {
  service: string;
  description: string;
  cost: Array<{
    value: number;
    etd: string;
    note: string;
  }>;
};

type OrderData = {
  product_id: number;
  variant_id: number;
  qty: number;
}[];

type Checkout = {
  user_id: number | null;
  nama_pemesan?: string;
  email_pemesan?: string;
  creator_id: number;
  grandtotal: number;
  product: Array<{
    product_id: number;
    variant_id: null | number;
    qty: number;
    price: number;
  }>;
  payment_method: string;
  courier: {
    main: string;
    type: string;
    price: number;
  };
  address: {
    id?: number;
    is_main_address: number;
    province_id: number;
    city_id: number;
    address_detail: string;
    address_name: string;
    zipcode: string;
    latitude: string;
    longitude: string;
    nama_penerima: string;
    phone: string;
    is_active: number;
  };
};

export const formStateSchema = z.object({
  nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
  email_pemesan: z.string().email("Email pemesan tidak boleh kosong.").optional().nullable(),
  phone_pemesan: z.string().nonempty("Nomor telepon pemesan tidak boleh kosong.").optional().nullable(),
  pickup_location: z
    .object({
      address: z.string().nonempty("Lokasi pengambilan tidak boleh kosong."),
    })
    .optional(),
  receiver: z.object({
    name: z.string().nonempty("Nama penerima tidak boleh kosong."),
    address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
    phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
    province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
    city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
    pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
    detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
  }),
  payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
  courier: z.object({
    name: z.string().nonempty("Kurir tidak boleh kosong."),
    type: z.any().optional(),
  }),
});

export default function Cart() {
  const [isr, setIsr] = useState(false);
  const [modal, setModal] = useState<string>();
  const [orderData, setOrderData] = useState<OrderData>();
  const [productList, setProductList] = useListState<MerchListResponse>();
  const [addressList, setAddressList] = useListState<AddressUpdateRequest>([]);
  const [loading, setLoading] = useListState<string>();
  const [provinceList, setProvinceList] = useListState<Province>([]);
  const [cityList, setCityList] = useListState<City>([]);
  const [subCourier, setSubCourier] = useListState<GetCourierRes>();
  const user = useLoggedUser();
  const router = useRouter();

  const form = useForm<FormState>({
    initialValues: {
      pickup_location: {
        address: "Pasar Bareng - Bareng, Pamulang Square, Jl. Siliwangi No.7, Pamulang Bar., Kec. Pamulang, Kota Tangerang Selatan, Banten 15417",
      },
    },
  });

  // Fungsi untuk mendapatkan alamat singkat
  const getShortAddress = (fullAddress: string) => {
    const parts = fullAddress.split(',');
    if (parts.length > 2) {
      return parts.slice(0, 2).join(',').trim();
    }
    return fullAddress;
  };

  // Fungsi untuk mendapatkan alamat detail yang dipotong
  const getTruncatedAddress = (fullAddress: string) => {
    const shortAddress = getShortAddress(fullAddress);
    const remaining = fullAddress.replace(shortAddress, '').replace(/^,\s*/, '');
    
    if (remaining.length > 50) {
      return remaining.substring(0, 50) + '...';
    }
    return remaining;
  };

  useEffect(() => {
    setIsr(true);
  }, []);

  useEffect(() => {
    getData();
    const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");
    if (!_orderData || _orderData.length == 0) router.push("/merchandise");
    setOrderData(_orderData);
  }, [isr]);

  useEffect(() => {
    if (form.values.receiver && form.values.courier) {
      getCourier();
      form.setValues({ courier: { name: form.values.courier.name, type: undefined } });
    }
  }, [form.values.receiver, form.values.courier?.name]);

  const getData = async () => {
    Get("product", {})
      .then((res: any) => {
        setProductList.setState(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    await fetch<any, Province[]>({
      url: "province",
      method: "GET",
      before: () => setLoading.append("getprovince"),
      success: ({ data }) => {
        setProvinceList.setState(data ?? []);
      },
      complete: () => setLoading.filter((e) => e != "getprovince"),
    });

    if (user?.id) {
      await fetch<any, AddressUpdateRequest[]>({
        url: `my-address?user_id=${user?.id}`,
        method: "GET",
        before: () => setLoading.append("getprovince"),
        success: ({ data }) => {
          if (data) {
            setAddressList.setState(data ?? []);

            const mainAddress = _.find(data, ["is_main_address", 1]) ?? data[0];
            form.setValues({
              receiver: {
                name: mainAddress.nama_penerima,
                phone: mainAddress.phone,
                address_name: mainAddress.address_name,
                province_id: mainAddress.province_id,
                city_id: mainAddress.city_id,
                pos_code: parseInt(mainAddress.zipcode),
                detail: mainAddress.address_detail,
              },
            });

            getCity(mainAddress.province_id);
          }
        },
        complete: () => setLoading.filter((e) => e != "getprovince"),
      });
    }
  };

  const getCity = async (province_id: number) => {
    await fetch<any, City[]>({
      url: `city?province_id=${province_id}`,
      method: "GET",
      before: () => setLoading.append("getcity"),
      success: ({ data }) => {
        setCityList.setState(data ?? []);
      },
      complete: () => setLoading.filter((e) => e != "getcity"),
    });
  };

  const orderedProduct = useMemo(() => {
    return orderData?.map((e) => {
      const product = _.find(productList, ["id", e.product_id]);
      const variant = e.variant_id ? _.find(product?.product_varian, ["id", e.variant_id]) : null;
      const subprice = parseInt((!variant ? product?.price : variant?.price) ?? "0");
      const weight = parseInt((!variant ? product?.weight : variant?.weight) ?? "0");
      const price = subprice * e.qty;
      const image = product?.product_image[0] ? product?.product_image[0].image_url : "#";
      const creator_id = product?.creator_id;

      return { ...e, product, variant, price, subprice, image, weight, creator_id };
    });
  }, [productList, orderData]);

  const orderSummary = useMemo(() => {
    const result: [string, number][] = [];

    for (const order of orderedProduct ?? []) {
      result.push([`x${order.qty} ${order.product?.product_name ?? "-"}`, order.price]);
    }

    if (form.values.courier?.type && form.values.courier?.type.cost && form.values.courier?.type.cost.length > 0) {
      result.push(["Biaya Pengiriman", form.values.courier?.type.cost[0].value]);
    }

    result.push(["Biaya Admin", 2000]);

    const grandtotal = result.reduce((q, n) => q + n[1], 0);
    result.push(["Total", grandtotal]);

    return { array: result, grandtotal };
  }, [orderedProduct, form.values.courier?.type, form.values.receiver]);

  const getCourier = async () => {
    const originCityId =
      orderedProduct && orderedProduct.length > 0 && orderedProduct[0].product?.has_store_location && typeof orderedProduct[0].product.has_store_location.city_id === "number" ? orderedProduct[0].product.has_store_location.city_id : 1;

    await fetch<GetCourierReq, GetCourierRes[]>({
      url: "product-cost",
      method: "POST",
      data: {
        origin: originCityId,
        origin_type: "city",
        destination: form.values.receiver?.city_id ?? 0,
        destination_type: "city",
        weight: _.sumBy(orderedProduct, "weight") == 0 ? 999 : _.sumBy(orderedProduct, "weight"),
        courier: form.values.courier?.name ?? "-",
      },
      before: () => setLoading.append("getsubcourier"),
      success: (res) => setSubCourier.setState(res.data ?? []),
      complete: () => setLoading.filter((e) => e != "getsubcourier"),
      error: (err) => {
        console.error("Failed to fetch courier:", err);
      },
    });
  };

  const handleCheckout = async () => {
    const { values } = form;
    await fetch<Checkout, { invoice_url: string }>({
      url: "order-product",
      method: "POST",
      data: {
        user_id: user?.id ?? null,
        nama_pemesan: values.nama_pemesan,
        email_pemesan: values.email_pemesan,
        creator_id: orderedProduct ? orderedProduct[0].creator_id ?? 0 : 0,
        grandtotal: orderSummary.grandtotal,
        product: (orderedProduct ?? []).map((e) => ({
          product_id: e.product_id,
          variant_id: e.variant_id,
          qty: e.qty,
          price: e.price,
        })),
        payment_method: "xendit",
        courier: {
          main: values.courier?.name ?? "-",
          type: values.courier?.type?.service ?? "-",
          price: values.courier?.type?.cost[0].value ?? 999999,
        },
        address: {
          id: values.receiver?.id,
          is_main_address: 1,
          province_id: values.receiver?.province_id ?? 1,
          city_id: values.receiver?.city_id ?? 1,
          address_detail: values.receiver?.detail ?? "",
          address_name: values.receiver?.address_name ?? "",
          zipcode: String(values.receiver?.pos_code),
          latitude: "",
          longitude: "",
          nama_penerima: values.receiver?.name ?? "",
          phone: values.receiver?.phone ?? "",
          is_active: 1,
        },
      },
      before: () => setLoading.append("checkout"),
      success: ({ data }) => data && router.push(data.invoice_url),
      complete: () => setLoading.filter((e) => e != "checkout"),
      error: () => {},
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return (
    <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
      <AddressModal
        opened={modal == "address"}
        onClose={() => setModal(undefined)}
        list={addressList}
        onChange={(data) => data && form.setValues({ receiver: data })}
        province={provinceList}
        getCity={(e) => getCity(e)}
        cityLoading={loading.includes("getcity")}
        city={cityList}
      />

      <PickupLocationModal opened={modal == "pickup"} onClose={() => setModal(undefined)} onSelect={(address) => form.setValues({ pickup_location: { address } })} currentAddress={form.values.pickup_location?.address} />

      <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
        <Stack gap={25} mb={40}>
          <Stack gap={0}>
            <Title order={1} size="h2">
              Checkout Merchandise
            </Title>
            <Text size="sm" c="gray">
              Pilih Metode Pembayaran dan Alamat Pengiriman
            </Text>
          </Stack>

          <Divider />

          {/* Grid 60/40 Layout */}
          <Grid>
            {/* Bagian Kiri - 60% */}
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Accordion
                variant="separated"
                radius="md"
                defaultValue={["data-pemesan", "data-pengiriman"]}
                multiple
              >
                {/* Data Pemesan Accordion */}
                <Accordion.Item value="data-pemesan">
                  <Accordion.Control>
                    <Flex gap={10} align="center">
                      <Icon icon="lets-icons:form-fill" className={`text-[20px] text-[#194E9E]`} />
                      <Text fw={600}>Data Pemesan</Text>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="md">
                      <TextInput
                        disabled={Boolean(user?.id)}
                        label="Nama Pemesan"
                        placeholder="Masukan Nama Pemesan"
                        onChange={(e) => form.setValues({ nama_pemesan: e.target.value })}
                        value={form.values.nama_pemesan}
                        error={form.errors.nama_pemesan}
                      />

                      <TextInput
                        type="email"
                        disabled={Boolean(user?.id)}
                        label="Email Pemesan"
                        placeholder="Masukan Email Pemesan"
                        onChange={(e) => form.setValues({ email_pemesan: e.target.value })}
                        value={form.values.email_pemesan}
                        error={form.errors.email_pemesan}
                      />

                      <TextInput
                        type="tel"
                        disabled={Boolean(user?.id)}
                        label="No. Telepon Pemesan"
                        placeholder="Masukan No. Telepon Pemesan"
                        onChange={(e) => form.setValues({ phone_pemesan: e.target.value })}
                        value={form.values.phone_pemesan}
                        error={form.errors.phone_pemesan}
                      />

                      {/* Bagian 1: Lokasi Pengambilan - Card dengan border bottom biru */}
                      <div>
                        <Text size="sm" fw={500} mb={5}>
                          Lokasi Pengambilan
                        </Text>
                        <UnstyledButton onClick={() => setModal("pickup")} className="w-full">
                          <Card 
                            withBorder 
                            p={15} 
                            radius={10}
                            className={`
                              w-full
                              !border !border-gray-300 
                              hover:bg-gray-50 
                              transition-colors 
                              cursor-pointer
                              !border-b-3 !border-b-[#0B387C]
                            `}
                          >
                            <Flex gap={10} align="center">
                              <Box c={"#0B387C"}>
                                <Icon icon="gis:location-poi" className={`text-[20px]`} />
                              </Box>
                              <Stack gap={2} className="flex-grow">
                                <Text fw={500} size="sm" lineClamp={1}>
                                  {getShortAddress(form.values.pickup_location?.address || "")}
                                </Text>
                                <Text c="gray" size="xs" lineClamp={1}>
                                  {getTruncatedAddress(form.values.pickup_location?.address || "")}
                                </Text>
                              </Stack>
                              <Icon icon="uiw:right" className="text-gray-400 text-sm" />
                            </Flex>
                          </Card>
                        </UnstyledButton>
                      </div>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>

                {/* Data Pengiriman Accordion */}
                <Accordion.Item value="data-pengiriman">
                  <Accordion.Control>
                    <Flex gap={10} align="center">
                      <Icon icon="fa-solid:shipping-fast" className={`text-[20px] text-[#194E9E]`} />
                      <Text fw={600}>Data Pengiriman</Text>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="md">
                      {/* Bagian 2: Alamat Pengiriman - Card dengan border bottom biru */}
                      <div>
                        <Text size="sm" fw={500} mb={5}>
                          Alamat Pengiriman
                        </Text>
                        <UnstyledButton mih="100%" onClick={() => setModal("address")} className="w-full">
                          <Card 
                            withBorder 
                            p={15} 
                            radius={10}
                            h="100%" 
                            className={`
                              w-full
                              !border !border-gray-300 
                              hover:bg-gray-50 
                              transition-colors 
                              cursor-pointer
                              !border-b-3 !border-b-[#0B387C]
                              ${form.values?.receiver?.pos_code ? "" : "!bg-primary-light"}
                            `}
                          >
                            {form.values?.receiver?.pos_code ? (
                              <Flex gap={10} align="center">
                                <Box c={"#0B387C"}>
                                  <Icon icon="gis:location-poi" className={`text-[20px]`} />
                                </Box>
                                <Stack gap={2} className="flex-grow">
                                  <Text fw={500} size="sm" lineClamp={1}>
                                    {form.values.receiver.address_name}
                                  </Text>
                                  <Text c="gray" size="xs" lineClamp={1}>
                                    {form.values.receiver.name}, {form.values.receiver.phone}
                                  </Text>
                                  <Text c="gray" size="xs" lineClamp={1} className={`uppercase`}>
                                    {_.find(provinceList, ["id", form.values.receiver.province_id])?.name}, {_.find(cityList, ["id", form.values.receiver.city_id])?.name}
                                  </Text>
                                </Stack>
                                <Icon icon="uiw:right" className="text-gray-400 text-sm" />
                              </Flex>
                            ) : (
                              <Flex align="center" gap={10} justify="center">
                                <Icon icon="uiw:plus" className={`text-primary-base`} />
                                <Text size="sm" c="gray.8">
                                  Pilih atau Tambah Alamat
                                </Text>
                              </Flex>
                            )}
                          </Card>
                        </UnstyledButton>
                      </div>

                      {/* Bagian Kurir Pengiriman */}
                      <div>
                        <Text size="sm" fw={500} mb={5}>
                          Pilih Kurir
                        </Text>
                        <Flex wrap="wrap" gap={10}>
                          <Select
                            className="flex-grow"
                            disabled={!form.values.receiver?.city_id}
                            data={[
                              { value: "jne", label: "JNE" },
                              { value: "tiki", label: "TIKI" },
                              { value: "pos", label: "POS Indonesia" },
                            ]}
                            placeholder="Pilih Kurir Pengiriman"
                            value={form.values.courier?.name}
                            onChange={(e) => {
                              if (e) {
                                form.setValues({ courier: { name: e, type: undefined } });
                              }
                            }}
                            // error={form.errors.courier?.name}
                          />
                          <Flex gap={10} align="center" className="flex-grow">
                            {loading.includes("getsubcourier") && <Loader size="sm" color="#0B387C" />}
                            <Select
                              className={`flex-grow`}
                              disabled={!subCourier || subCourier.length <= 0 || loading.includes("getsubcourier")}
                              data={subCourier.map((e) => ({ value: e.service, label: `${e.service} (${e.cost[0].etd} ${e.cost[0].etd.includes("HARI") ? "" : "HARI"}) ${currencyFormat(e.cost[0].value)}` }))}
                              value={form.values.courier?.type?.service}
                              onChange={(e) => form.setValues({ courier: { name: form.values.courier?.name ?? "-", type: subCourier.find((z) => z.service == e) } })}
                              placeholder="Pilih Tipe Pengiriman"
                              // error={form.errors.courier?.type}
                            />
                          </Flex>
                        </Flex>
                      </div>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Grid.Col>

            {/* Bagian Kanan - 40% */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap={10}>
                <Card withBorder radius={10} p={20}>
                  <Stack gap={15}>
                    <Flex gap={10} align="center">
                      <Icon icon="octicon:info-24" className={`text-primary-base text-[20px]`} />
                      <Text fw={600}>Rincian Produk</Text>
                    </Flex>

                    <Divider />

                    {(orderedProduct ?? []).map((e, i) => (
                      <Flex key={i} gap={15} align="center">
                        <AspectRatio ratio={1} w={60}>
                          <Image alt="image" src={e.image} w="100%" h="100%" bg="gray.1" radius="sm" />
                        </AspectRatio>
                        <Stack gap={3} className={`flex-grow`}>
                          <Text size="sm" fw={500}>
                            {e.product?.product_name}
                          </Text>
                          {e.variant && (
                            <Text c="gray" size="xs">
                              Varian: {e.variant?.varian_name}
                            </Text>
                          )}
                          <Text size="sm" fw={600}>
                            <NumberFormatter value={e.subprice} prefix="Rp " thousandSeparator="." decimalSeparator="," />
                          </Text>
                        </Stack>
                        <Text size="sm">x{e.qty}</Text>
                      </Flex>
                    ))}
                  </Stack>
                </Card>

                <Card withBorder radius={10} p={20}>
                  <Stack gap={15}>
                    <Flex gap={10} align="center">
                      <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
                      <Text fw={600}>Voucher</Text>
                    </Flex>

                    <TextInput placeholder="Masukan Kode Voucher" />
                  </Stack>
                </Card>

                <Card withBorder radius={10} p={20}>
                  <Stack gap={15}>
                    <Flex gap={10} align="center">
                      <Icon icon="uiw:information" className={`text-primary-base text-[20px]`} />
                      <Text fw={600}>Total Pembayaran</Text>
                    </Flex>

                    <Divider />

                    <Stack>
                      {orderSummary.array.map((e, i) => (
                        <Flex justify="space-between" key={i}>
                          <Text fw={e[0] == "Total" ? 600 : 400}>{e[0]}</Text>
                          <Text fw={e[0] == "Total" ? 600 : 400}>
                            <NumberFormatter value={e[1]} prefix="Rp " thousandSeparator="." decimalSeparator="," />
                          </Text>
                        </Flex>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>

        <Card pos="fixed" className={`bottom-0 left-0 w-[100vw] border-t !border-primary-light`} py={10} withBorder>
          <Container size="lg" w="100%">
            <Flex justify="end" w="100%">
              <Button loading={loading.includes("checkout")} onClick={handleCheckout} className={`uppercase`} color="#194E9E" rightSection={<Icon icon="uiw:check" />} radius="xl">
                Proses Pembayaran
              </Button>
            </Flex>
          </Container>
        </Card>
      </Container>
    </div>
  );
}

// Komponen DropdownComponent dihapus karena tidak digunakan lagi

const AddressModal = ({
  list,
  opened,
  onClose,
  onChange,
  province,
  getCity,
  city,
  cityLoading,
}: {
  list: AddressUpdateRequest[];
  opened: boolean;
  onClose: () => void;
  onChange: (data: FormState["receiver"]) => void;
  getCity: (province_id: number) => void;
  cityLoading: boolean;
  province: Province[];
  city: City[];
}) => {
  const [page, setPage] = useState<"create" | "select">("select");

  const form = useForm<Omit<AddressData, "id">>({
    validate: zodResolver(addressDataSchema),
    onValuesChange: (values) => {
      if (values.postcode) values.postcode = values.postcode.replaceAll(/\D/g, "");
      if (values.phone) values.phone = values.phone.replaceAll(/\D/g, "");
      return values;
    },
  });

  const handleSelect = (data?: AddressUpdateRequest) => {
    if (data) {
      onChange({
        id: data.id,
        name: data.nama_penerima,
        phone: data.phone,
        address_name: data.address_name,
        province_id: data.province_id,
        city_id: data.city_id,
        pos_code: parseInt(data.zipcode),
        detail: data.address_detail,
      });
    } else {
      const valid = form.validate();
      if (valid.hasErrors) return;

      const { values } = form;
      onChange({
        name: values.nama_penerima,
        phone: values.phone,
        address_name: values.name,
        province_id: values.province,
        city_id: values.city,
        pos_code: parseInt(values.postcode),
        detail: values.detail,
      });
    }
    onClose();
  };

  useEffect(() => {
    setPage("select");
  }, [opened]);

  useEffect(() => {
    getCity(form.values.province);
    form.setValues({ city: -1 });
  }, [form.values.province]);

  return (
    <>
      <Modal title={"Pilih Alamat"} opened={opened} onClose={() => onClose()} centered>
        {page == "select" && list.length > 0 ? (
          <Stack gap={20}>
            {list.map((e, i) => (
              <UnstyledButton key={i} mih="100%" onClick={() => handleSelect(e)}>
                <Card withBorder p={20} radius={15} h="100%" className={`!border-b !border-b-[#0B387C]`}>
                  <Flex gap={15}>
                    <Box c={"#0B387C"}>
                      <Icon icon="gis:location-poi" className={`text-[24px]`} />
                    </Box>
                    <Stack gap={3} mt={-5}>
                      <Text fw={600} size="lg">
                        {e.address_name}
                      </Text>
                      <Text c="gray" size="sm" mt={5} className={`uppercase`}>
                        {_.find(province, ["id", e.province_id])?.name}, {_.find(city, ["id", e.city_id])?.name}, {e.zipcode}
                      </Text>
                      <Text c="gray" size="sm">
                        {e.address_detail}
                      </Text>
                      <Text c="gray" size="sm">
                        {e.phone}
                      </Text>
                    </Stack>
                  </Flex>
                </Card>
              </UnstyledButton>
            ))}

            <Button onClick={() => setPage("create")} color="#0B387C" variant="outline" className={`!border-dashed`}>
              Tambah Baru
            </Button>
          </Stack>
        ) : (
          <Stack gap={15} p={5}>
            <TextInput label="Nama Penerima" placeholder="Masukan Nama Penerima" {...form.getInputProps("nama_penerima")} />

            <TextInput label="Nama Alamat" placeholder="Rumah, Kantor, ..." {...form.getInputProps("name")} />

            <TextInput label="No. Telp" placeholder="08XX XXXX XXXX" {...form.getInputProps("phone")} />

            <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
              <Select
                searchable
                label="Provinsi"
                placeholder="Pilih Provinsi"
                data={_.sortBy(province, "name").map((e) => ({ value: String(e.id), label: e.name }))}
                value={String(form.values.province)}
                onChange={(e) => e && form.setFieldValue("province", parseInt(e))}
                error={form.errors.province}
              />

              <Select
                disabled={cityLoading}
                label="Kota"
                placeholder="Pilih Kota"
                data={city.map((e) => ({ value: String(e.id), label: e.name }))}
                value={String(form.values.city)}
                onChange={(e) => e && form.setFieldValue("city", parseInt(e))}
                error={form.errors.city}
              />
            </Flex>

            <TextInput label="Kode Pos" placeholder="Masukan Kode Pos" {...form.getInputProps("postcode")} />

            <Textarea autosize minRows={3} label="Detail Alamat" placeholder="Kecamatan, Desa, No. Rumah, dll" {...form.getInputProps("detail")} />

            <Text size="xs" c="gray">
              Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.
            </Text>

            <Flex align="center" gap={10} justify="space-between" mt={10}>
              <Button color="#0B387C" w="fit-content" radius="xl" leftSection={<Icon icon="uiw:check" />} onClick={() => handleSelect()}>
                Simpan Alamat
              </Button>
            </Flex>
          </Stack>
        )}
      </Modal>
    </>
  );
};

const PickupLocationModal = ({ opened, onClose, onSelect, currentAddress }: { opened: boolean; onClose: () => void; onSelect: (address: string) => void; currentAddress?: string }) => {
  const pickupLocations = [
    {
      address: "Pasar Bareng - Bareng, Pamulang Square, Jl. Siliwangi No.7, Pamulang Bar., Kec. Pamulang, Kota Tangerang Selatan, Banten 15417",
      name: "Pasar Bareng - Bareng, Pamulang Square",
    },
    // Tambahkan lokasi lain jika diperlukan
  ];

  return (
    <Modal title="Pilih Lokasi Pengambilan" opened={opened} onClose={onClose} centered>
      <Stack gap={20}>
        {pickupLocations.map((location, index) => (
          <UnstyledButton
            key={index}
            onClick={() => {
              onSelect(location.address);
              onClose();
            }}
          >
            <Card withBorder p={20} radius={15} className={`!border-b !border-b-[#0B387C] ${currentAddress === location.address ? "bg-primary-light" : ""}`}>
              <Flex gap={15}>
                <Box c={"#0B387C"}>
                  <Icon icon="gis:location-poi" className={`text-[24px]`} />
                </Box>
                <Stack gap={3} mt={-5}>
                  <Text fw={600} size="lg">
                    {location.name}
                  </Text>
                  <Text c="gray" size="sm">
                    {location.address}
                  </Text>
                </Stack>
              </Flex>
            </Card>
          </UnstyledButton>
        ))}

        <Button onClick={onClose} color="#0B387C" variant="outline">
          Tutup
        </Button>
      </Stack>
    </Modal>
  );
};