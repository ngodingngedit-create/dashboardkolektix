// // import CreateMerchandise from "@/components/CreateMerchandise";
// // import { Delete, Get, Post } from "@/utils/REST";
// // import { Card, Center, NumberFormatter, Button as ButtonM, Text, Switch, ActionIcon, Stack, Flex, Title, Image as MImage } from "@mantine/core";
// // import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
// // import Image from "next/image";
// // import React, { useCallback, useEffect, useMemo, useState } from "react";
// // import { MerchListResponse } from "./type";
// // import Cookies from "js-cookie";
// // import { useListState } from "@mantine/hooks";
// // import { modals } from "@mantine/modals";
// // import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
// // import merchIcon from "../../../assets/svg/merch.svg";
// // import Button from "@/components/Button";
// // import useLoggedUser from "@/utils/useLoggedUser";
// // import _ from "lodash";
// // import { Icon } from "@iconify/react/dist/iconify.js";
// // import Link from "next/link";

// // const Merch = () => {
// //   const [isRender, setIsRender] = useState(false);
// //   const [modalCreate, setModalCreate] = useState<string>();
// //   const [merchList, setMerchList] = useState<MerchListResponse[]>();
// //   const [loading, setLoading] = useListState<string>();
// //   const [loading2, setLoading2] = useState<boolean>(false); // tambahan loading
// //   const [data, setData] = useState<MerchListResponse[]>([]);
// //   const user = useLoggedUser();

// //   useEffect(() => {
// //     setIsRender(true);
// //   }, []);

// //   useEffect(() => {
// //     if (merchList == undefined) getData();
// //   }, [isRender]);

// //   const getData = () => {
// //     if (loading.includes("getdata") || !user?.has_creator) return;
// //     setLoading.append("getdata");
// //     Get(`product`, {
// //       creator_id: user?.has_creator?.id,
// //     })
// //       .then((res: any) => {
// //         setMerchList(res.data);
// //         console.log(res.data);
// //         setLoading.filter((e) => e != "getdata");
// //       })
// //       .catch((err) => {
// //         console.log(err);
// //         setLoading.filter((e) => e != "getdata");
// //       });
// //   };

// //   const getData = () => {
// //     setLoading2(true);
// //     Get("product", {})
// //       .then((res: any) => {
// //         setData((res.data as MerchListResponse[]).filter((e) => e.product_status_id == 2));
// //         console.log(res.data);
// //         setLoading2(false);
// //       })
// //       .catch((err) => {
// //         console.log(err);
// //         setLoading2(false);
// //       });
// //   };

// //   const handleToggleStatus = async (id: number, status: boolean) => {
// //     setLoading.append("toggle-status");
// //     Post(`product_toggle_status/${id}`, { status: status ? 2 : 3 })
// //       .then((res: any) => {
// //         if (res.status && merchList) {
// //           setMerchList(merchList.map((e) => (e.id == id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
// //         }
// //         setLoading.filter((e) => e != "toggle-status");
// //       })
// //       .catch((err) => {
// //         console.log(err);
// //         setLoading.filter((e) => e != "toggle-status");
// //       });
// //   };

// //   const tabStatus: [number, string][] = [
// //     [2, "Sedang Dijual"],
// //     [1, "Merchandise Draf"],
// //     [3, "Non Aktif"],
// //   ];

// //   const splittedByStatus = useCallback(
// //     (status: number) => {
// //       return merchList?.filter((e) => e.product_status_id == status);
// //     },
// //     [merchList]
// //   );

// //   const handleDelete = async (id: number) => {
// //     modals.openConfirmModal({
// //       centered: true,
// //       title: "Hapus Produk?",
// //       children: "Apakah anda yakin ingin menghapus produk ini?",
// //       labels: { confirm: "Hapus", cancel: "Batal" },
// //       onConfirm: () => {
// //         setLoading.append(`delete${id}`);
// //         Delete(`product/${id}`, {})
// //           .then(() => {
// //             setMerchList([...(merchList ?? []).filter((e) => e.id != id)]);
// //             setLoading.filter((e) => e != `delete${id}`);
// //           })
// //           .catch((err) => {
// //             console.log(err);
// //             setLoading.filter((e) => e != `delete${id}`);
// //           });
// //       },
// //     });
// //   };

// //   return (
// //     <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
// //       {modalCreate != undefined && <CreateMerchandise id={modalCreate} onClose={() => setModalCreate(undefined)} />}

// //       <Title order={1} size="h2">
// //         Merchandise Saya
// //       </Title>

// //       <div className="flex flex-wrap items-center justify-between gap-[20px]">
// //         <div className="flex gap-[10px] items-center">
// //           <Input variant="bordered" size="md" type="text" placeholder="Cari Merchandise" />
// //           <button>
// //             <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
// //               <rect width="40" height="40" rx="20" fill="#0B387C" />
// //               <path
// //                 d="M27.5 27.5L23.875 23.875M25.8333 19.1667C25.8333 22.8486 22.8486 25.8333 19.1667 25.8333C15.4848 25.8333 12.5 22.8486 12.5 19.1667C12.5 15.4848 15.4848 12.5 19.1667 12.5C22.8486 12.5 25.8333 15.4848 25.8333 19.1667Z"
// //                 stroke="white"
// //                 stroke-width="2"
// //                 stroke-linecap="round"
// //                 stroke-linejoin="round"
// //               />
// //             </svg>
// //           </button>
// //         </div>

// //         <Flex gap={10} align="center">
// //           {/* <ButtonM
// //             leftSection={<Icon icon="hugeicons:cashier" className={`text-[20px]`} />}
// //             radius="xl"
// //             color="#0B387C"
// //             component={Link}
// //             href="/dashboard/merch-pos"
// //           >
// //             Penjualan Offline
// //           </ButtonM> */}
// //           <ButtonM onClick={() => setModalCreate("")} leftSection={<Icon icon="icon-park-outline:add-one" className={`text-[24px]`} />} radius="xl" color="#0B387C">
// //             Buat Merchandise
// //           </ButtonM>
// //         </Flex>
// //       </div>

// //       <Tabs
// //         variant="solid"
// //         aria-label="Tabs variants"
// //         className="border border-b-2 border-primary-light-200 border-x-0 border-t-0"
// //         classNames={{
// //           tabList: "pb-0 self-center font-semibold rounded-b-none bg-white",
// //           tab: "p-5",
// //           cursor: "!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base",
// //         }}
// //       >
// //         {tabStatus.map((e, i) => (
// //           <Tab key={i} title={e[1]}>
// //             <Card className={`!overflow-auto`} p={0} withBorder>
// //               <Table removeWrapper className={`rounded-[8px] [&_td]:py-[15px] min-w-[700px]`}>
// //                 <TableHeader>
// //                   <TableColumn>Info Produk</TableColumn>
// //                   <TableColumn>Harga</TableColumn>
// //                   <TableColumn>Stock</TableColumn>
// //                   <TableColumn>Aktif</TableColumn>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {(splittedByStatus(e[0]) ?? []).map((e, i) => (
// //                     <TableRow key={i}>
// //                       <TableCell>
// //                         <div className="flex items-center gap-[10px]">
// //                           {e.product_image.length > 0 && <MImage src={e.product_image[0].image_url} className="!h-10 !w-10 bg-[#d0d0d0] rounded-[5px] shrink-0" />}
// //                           <p>{e.product_name}</p>
// //                         </div>
// //                       </TableCell>
// //                       <TableCell className={`whitespace-nowrap`}>
// //                         <NumberFormatter value={parseInt((e.product_varian.length ?? 0) > 0 ? e.product_varian[0].price : e.price)} prefix="Rp " />
// //                       </TableCell>
// //                       <TableCell>{(e.product_varian.length ?? 0) > 0 ? _.sumBy(e.product_varian, "stock_qty") : e.qty}</TableCell>
// //                       <TableCell>
// //                         <div className="flex items-center gap-[10px]">
// //                           <Switch checked={e.product_status_id == 2} disabled={loading.includes("toggle-status")} onChange={(z) => handleToggleStatus(e.id, z.target.checked)} />

// //                           <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${e.slug}`}>
// //                             <Icon icon="akar-icons:eye" className={`text-[24px]`} />
// //                           </ActionIcon>

// //                           <ActionIcon variant="transparent" color="gray" onClick={() => setModalCreate(e.slug)}>
// //                             <Icon icon="akar-icons:edit" className={`text-[24px]`} />
// //                           </ActionIcon>

// //                           <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(e.id)} loading={loading.includes(`delete${e.id}`)}>
// //                             <Icon icon="uiw:delete" className={`text-[18px]`} />
// //                           </ActionIcon>
// //                         </div>
// //                       </TableCell>
// //                     </TableRow>
// //                   ))}
// //                 </TableBody>
// //               </Table>

// //               {(!splittedByStatus(e[0]) || splittedByStatus(e[0])?.length == 0 || merchList?.length == 0) && (
// //                 <Center mih={200} w="100%">
// //                   <div className="py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full">
// //                     <div className="border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2">
// //                       <Image src={merchIcon} alt="bank" className="w-7" />
// //                     </div>
// //                     <div className="text-center">
// //                       <p className="font-semibold text-lg">Belum ada merchandise yang dibuat</p>
// //                       <p className="text-grey max-w-72 mt-[10px]">Mulai buat merchandise dengan klik button “Buat Merchandise” di bawah. </p>
// //                     </div>
// //                     <Button label="Buat Merchandise" color="primary" className="mt-4" onClick={() => setModalCreate("")} startIcon={faCirclePlus} />
// //                   </div>
// //                 </Center>
// //               )}
// //             </Card>
// //           </Tab>
// //         ))}
// //       </Tabs>
// //     </div>
// //   );
// // };

// // export default Merch;

// import CreateMerchandise from "@/components/CreateMerchandise";
// import { Delete, Get, Post } from "@/utils/REST";
// import { Card, Center, NumberFormatter, Button as ButtonM, Title, Image as MImage, Flex, ActionIcon, Switch } from "@mantine/core";
// import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
// import Image from "next/image";
// import React, { useCallback, useEffect, useState } from "react";
// import { MerchListResponse } from "./type";
// import { modals } from "@mantine/modals";
// import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
// import merchIcon from "../../../assets/svg/merch.svg";
// import Button from "@/components/Button";
// import useLoggedUser from "@/utils/useLoggedUser";
// import _ from "lodash";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import Link from "next/link";

// const Merch = () => {
//   const [isRender, setIsRender] = useState(false);
//   const [modalCreate, setModalCreate] = useState<string>();
//   const [merchList, setMerchList] = useState<MerchListResponse[]>([]);
//   const [loading, setLoading] = useState<string[]>([]);
//   const [loading2, setLoading2] = useState<boolean>(false);

//   // pagination states
//   const [page, setPage] = useState<number>(1);
//   const [lastPage, setLastPage] = useState<number>(1);

//   const user = useLoggedUser();

//   useEffect(() => {
//     setIsRender(true);
//   }, []);

//   useEffect(() => {
//     if (isRender) getData();
//   }, [isRender, page]);

//   const getData = async () => {
//     setLoading2(true);
//     try {
//       const url = `/api/product-bymerchant?per_page=10&page=1`;
//       console.log("Fetching:", url);

//       const res = await fetch(url, { method: "GET" });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//       const json = await res.json();
//       console.log("API data:", json);

//       // defensive extraction:
//       // - kemungkinan respons: { message, data: { data: Array, meta... } }
//       // - atau respons: { data: Array } (lebih simple)
//       const paginationOrArray = json?.data;
//       let list: MerchListResponse[] = [];

//       if (Array.isArray(paginationOrArray)) {
//         // simple case: data is array
//         list = paginationOrArray;
//       } else if (paginationOrArray && Array.isArray(paginationOrArray.data)) {
//         // pagination case: data.data is array
//         list = paginationOrArray.data;
//       } else {
//         // fallback: empty
//         console.warn("Unexpected API shape for products:", paginationOrArray);
//         list = [];
//       }

//       setMerchList(list);

//       // update paging if available (safely)
//       const lastPage = paginationOrArray?.last_page ?? paginationOrArray?.meta?.last_page ?? 1;
//       setLastPage(typeof lastPage === "number" ? lastPage : Number(lastPage) || 1);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//     } finally {
//       setLoading2(false);
//     }
//   };

//   const handleToggleStatus = async (id: number, status: boolean) => {
//     setLoading((prev) => [...prev, "toggle-status"]);
//     Post(`product_toggle_status/${id}`, { status: status ? 2 : 3 })
//       .then((res: any) => {
//         if (res.status) {
//           setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
//         }
//       })
//       .catch(console.error)
//       .finally(() => setLoading((prev) => prev.filter((e) => e !== "toggle-status")));
//   };

//   const handleDelete = (id: number) => {
//     modals.openConfirmModal({
//       centered: true,
//       title: "Hapus Produk?",
//       children: "Apakah anda yakin ingin menghapus produk ini?",
//       labels: { confirm: "Hapus", cancel: "Batal" },
//       onConfirm: () => {
//         setLoading((prev) => [...prev, `delete${id}`]);
//         Delete(`product/${id}`, {})
//           .then(() => {
//             setMerchList((prev) => prev.filter((e) => e.id !== id));
//           })
//           .catch(console.error)
//           .finally(() => setLoading((prev) => prev.filter((e) => e !== `delete${id}`)));
//       },
//     });
//   };

//   const tabStatus: [number, string][] = [
//     [2, "Sedang Dijual"],
//     [1, "Merchandise Draf"],
//     [3, "Non Aktif"],
//   ];

//   const splittedByStatus = useCallback((status: number) => merchList.filter((e) => e.product_status_id === status), [merchList]);

//   return (
//     <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
//       {modalCreate !== undefined && (
//         <CreateMerchandise
//           id={modalCreate}
//           onClose={() => {
//             setModalCreate(undefined);
//             getData(); // ✅ reload data setiap modal create ditutup
//           }}
//         />
//       )}

//       <Title order={1} size="h2">
//         Merchandise Saya
//       </Title>

//       <div className="flex flex-wrap items-center justify-between gap-[20px]">
//         <div className="flex gap-[10px] items-center">
//           <Input variant="bordered" size="md" type="text" placeholder="Cari Merchandise" />
//           <button>
//             <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <rect width="40" height="40" rx="20" fill="#0B387C" />
//               <path
//                 d="M27.5 27.5L23.875 23.875M25.8333 19.1667C25.8333 22.8486 22.8486 25.8333 19.1667 25.8333C15.4848 25.8333 12.5 22.8486 12.5 19.1667C12.5 15.4848 15.4848 12.5 19.1667 12.5C22.8486 12.5 25.8333 15.4848 25.8333 19.1667Z"
//                 stroke="white"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </button>
//         </div>

//         <Flex gap={10} align="center">
//           <ButtonM onClick={() => setModalCreate("")} leftSection={<Icon icon="icon-park-outline:add-one" className="text-[24px]" />} radius="xl" color="#0B387C">
//             Buat Merchandise
//           </ButtonM>
//         </Flex>
//       </div>

//       <Tabs
//         variant="solid"
//         aria-label="Tabs variants"
//         className="border-b-2 border-primary-light-200"
//         classNames={{
//           tabList: "pb-0 self-center font-semibold bg-white",
//           tab: "p-5",
//           cursor: "!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base",
//         }}
//       >
//         {tabStatus.map(([status, label]) => {
//           const filtered = splittedByStatus(status);
//           return (
//             <Tab key={status} title={label}>
//               <Card className="!overflow-auto" p={0} withBorder>
//                 <Table removeWrapper className="rounded-[8px] [&_td]:py-[15px] min-w-[700px]">
//                   <TableHeader>
//                     <TableColumn>Info Produk</TableColumn>
//                     <TableColumn>Harga</TableColumn>
//                     <TableColumn>Stock</TableColumn>
//                     <TableColumn>Aktif</TableColumn>
//                   </TableHeader>

//                   <TableBody>
//                     {filtered.map((item, i) => (
//                       <TableRow key={i}>
//                         <TableCell>
//                           <div className="flex items-center gap-[10px]">
//                             {item.product_image.length > 0 && <MImage src={item.product_image[0].image_url} className="!h-10 !w-10 bg-[#d0d0d0] rounded-[5px]" />}
//                             <p>{item.product_name}</p>
//                           </div>
//                         </TableCell>

//                         <TableCell className="whitespace-nowrap">
//                           <NumberFormatter value={parseInt(item.product_varian?.[0]?.price || item.price || "0") || 0} prefix="Rp " />
//                         </TableCell>

//                         <TableCell>{item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty}</TableCell>

//                         <TableCell>
//                           <div className="flex items-center gap-[10px]">
//                             <Switch checked={item.product_status_id === 2} disabled={loading.includes("toggle-status")} onChange={(z) => handleToggleStatus(item.id, z.target.checked)} />
//                             <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${item.slug}`}>
//                               <Icon icon="akar-icons:eye" className="text-[24px]" />
//                             </ActionIcon>
//                             <ActionIcon variant="transparent" color="gray" onClick={() => setModalCreate(item.slug)}>
//                               <Icon icon="akar-icons:edit" className="text-[24px]" />
//                             </ActionIcon>
//                             <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id)}>
//                               <Icon icon="uiw:delete" className="text-[18px]" />
//                             </ActionIcon>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>

//                 {filtered.length === 0 && (
//                   <Center mih={200} w="100%">
//                     <div className="py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full">
//                       <div className="border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2">
//                         <Image src={merchIcon} alt="bank" className="w-7" />
//                       </div>
//                       <div className="text-center">
//                         <p className="font-semibold text-lg">Belum ada merchandise yang dibuat</p>
//                         <p className="text-grey max-w-72 mt-[10px]">Mulai buat merchandise dengan klik button “Buat Merchandise” di bawah.</p>
//                       </div>
//                       <Button label="Buat Merchandise" color="primary" className="mt-4" onClick={() => setModalCreate("")} startIcon={faCirclePlus} />
//                     </div>
//                   </Center>
//                 )}

//                 {/* Pagination */}
//                 <div className="flex justify-center items-center gap-4 py-6">
//                   <ButtonM disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
//                     Sebelumnya
//                   </ButtonM>
//                   <span>
//                     Halaman {page} dari {lastPage}
//                   </span>
//                   <ButtonM disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
//                     Berikutnya
//                   </ButtonM>
//                 </div>
//               </Card>
//             </Tab>
//           );
//         })}
//       </Tabs>
//     </div>
//   );
// };

// export default Merch;

// import CreateMerchandise from "@/components/CreateMerchandise";
// import { Delete, Get, Post } from "@/utils/REST";
// import { Card, Center, NumberFormatter, Button as ButtonM, Title, Image as MImage, Flex, ActionIcon, Switch } from "@mantine/core";
// import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
// import Image from "next/image";
// import React, { useEffect, useMemo, useState } from "react";
// import { MerchListResponse } from "./type";
// import { modals } from "@mantine/modals";
// import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
// import merchIcon from "../../../assets/svg/merch.svg";
// import Button from "@/components/Button";
// import useLoggedUser from "@/utils/useLoggedUser";
// import _ from "lodash";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import Link from "next/link";
// import Cookies from "js-cookie";

// const PER_PAGE = 10;

// const Merch: React.FC = () => {
//   const [isRender, setIsRender] = useState(false);
//   const [modalCreate, setModalCreate] = useState<string | undefined>(undefined);
//   const [merchList, setMerchList] = useState<MerchListResponse[]>([]);
//   const [loading, setLoading] = useState<string[]>([]);
//   const [loading2, setLoading2] = useState<boolean>(false);

//   // pagination
//   const [page, setPage] = useState<number>(1);
//   const [lastPage, setLastPage] = useState<number>(1);

//   const user = useLoggedUser();
//   const tabStatus: [number, string][] = [
//     [2, "Sedang Dijual"],
//     [1, "Merchandise Draf"],
//     [3, "Non Aktif"],
//   ];

//   useEffect(() => {
//     setIsRender(true);
//   }, []);

//   // fetch data when component first renders and whenever page changes
//   useEffect(() => {
//     if (!isRender) return;
//     getData(page);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isRender, page]);

//   // getData: calls Next.js API route /api/product-bymerchant which proxies token
//   // const getData = async (pageNum: number = 1) => {
//   //   setLoading2(true);
//   //   try {
//   //     const qs = new URLSearchParams({ per_page: String(PER_PAGE), page: String(pageNum) }).toString();
//   //     const url = `${process.env.NEXT_PUBLIC_WS_URL}/product-bymerchant?${qs}`;
//   //     console.log("Fetching:", url);

//   //     const res = await fetch(url, { method: "GET" });
//   //     if (!res.ok) {
//   //       // if backend returns non-json (HTML, etc.) this will throw when parsing, so we check status first
//   //       throw new Error(`HTTP error! status: ${res.status}`);
//   //     }
//   //     const json = await res.json();
//   //     console.log("API data:", json);

//   //     const pagination = json?.data;
//   //     const list: MerchListResponse[] = Array.isArray(pagination?.data) ? pagination.data : Array.isArray(pagination) ? pagination : [];

//   //     setMerchList(list);

//   //     const computedLastPage = pagination?.last_page ?? 1;
//   //     setLastPage(Number(computedLastPage) || 1);
//   //   } catch (err) {
//   //     console.error("Error fetching data:", err);
//   //     // optionally setMerchList([]) on error
//   //   } finally {
//   //     setLoading2(false);
//   //   }
//   // };
//   // const getData = async (pageNum: number = 1) => {
//   //   setLoading2(true);

//   //   try {
//   //     const qs = new URLSearchParams({
//   //       per_page: String(PER_PAGE),
//   //       page: String(pageNum),
//   //     }).toString();

//   //     const url = `${process.env.NEXT_PUBLIC_URL}/product-bymerchant?${qs}`;
//   //     console.log("Fetching:", url);

//   //     const token = process.env.NEXT_PUBLIC_API_TOKEN;

//   //     const res = await fetch(url, {
//   //       method: "GET",
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //         Accept: "application/json",
//   //       },
//   //     });

//   //     if (!res.ok) {
//   //       throw new Error(`HTTP error! status: ${res.status}`);
//   //     }

//   //     const json = await res.json();
//   //     console.log("API data:", json);

//   //     const pagination = json?.data;
//   //     const list: MerchListResponse[] = Array.isArray(pagination?.data) ? pagination.data : Array.isArray(pagination) ? pagination : [];

//   //     setMerchList(list);

//   //     const computedLastPage = pagination?.last_page ?? 1;
//   //     setLastPage(Number(computedLastPage) || 1);
//   //   } catch (err) {
//   //     console.error("Error fetching data:", err);
//   //   } finally {
//   //     setLoading2(false);
//   //   }
//   // };

//   const getData = async (pageNum: number = 1) => {
//     setLoading2(true);

//     try {
//       // guard: butuh creator id
//       const creatorId = user?.has_creator?.id;
//       if (!creatorId) {
//         console.warn("getData aborted: no creator id on user", user);
//         setMerchList([]); // opsional: clear list
//         setLastPage(1);
//         return;
//       }

//       const qs = new URLSearchParams({
//         per_page: String(PER_PAGE),
//         page: String(pageNum),
//         creator_id: String(creatorId),
//       }).toString();

//       const url = `${process.env.NEXT_PUBLIC_URL}/product-bymerchant?${qs}`;
//       console.log("Fetching:", url);

//       // ambil token dari env dulu, fallback ke cookie/localStorage
//       const envToken = process.env.NEXT_PUBLIC_API_TOKEN || "";
//       const cookieToken = Cookies.get("token") || (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "");
//       const token = envToken || cookieToken || "";

//       const headers: Record<string, string> = {
//         Accept: "application/json",
//       };
//       if (token) headers["Authorization"] = `Bearer ${token}`;

//       const res = await fetch(url, {
//         method: "GET",
//         headers,
//         // jika backend pakai cookie-based auth dan kamu butuh cookie:
//         // credentials: 'include'
//       } as RequestInit);

//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }

//       const json = await res.json();
//       console.log("API data:", json);

//       // json.data is expected to be pagination object: { current_page, data: [...], last_page, ... }
//       const pagination = json?.data;
//       const list: MerchListResponse[] = Array.isArray(pagination?.data) ? pagination.data : Array.isArray(pagination) ? pagination : [];

//       // filter produk status == 2 (sama seperti sebelumnya)
//       const filtered = (list || []).filter((e) => e.product_status_id == 2);

//       setMerchList(filtered);

//       const computedLastPage = pagination?.last_page ?? 1;
//       setLastPage(Number(computedLastPage) || 1);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       // optional: notifications.show({ message: "Gagal memuat produk", color: "red" });
//     } finally {
//       setLoading2(false);
//     }
//   };

//   const handleToggleStatus = async (id: number, status: boolean) => {
//     setLoading((prev) => [...prev, "toggle-status"]);
//     try {
//       const res: any = await Post(`product_toggle_status/${id}`, { status: status ? 2 : 3 });
//       if (res?.status) {
//         setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading((prev) => prev.filter((s) => s !== "toggle-status"));
//     }
//   };

//   const handleDelete = (id: number) => {
//     modals.openConfirmModal({
//       centered: true,
//       title: "Hapus Produk?",
//       children: "Apakah anda yakin ingin menghapus produk ini?",
//       labels: { confirm: "Hapus", cancel: "Batal" },
//       onConfirm: () => {
//         setLoading((prev) => [...prev, `delete${id}`]);
//         Delete(`product/${id}`, {})
//           .then(() => {
//             setMerchList((prev) => prev.filter((e) => e.id !== id));
//           })
//           .catch((err) => {
//             console.error(err);
//           })
//           .finally(() => setLoading((prev) => prev.filter((s) => s !== `delete${id}`)));
//       },
//     });
//   };

//   // memoize splitted lists for each status
//   const splittedByStatus = useMemo(() => {
//     const map = new Map<number, MerchListResponse[]>();
//     [2, 1, 3].forEach((st) =>
//       map.set(
//         st,
//         merchList.filter((e) => e.product_status_id === st)
//       )
//     );
//     return (status: number) => map.get(status) ?? [];
//   }, [merchList]);

//   // helper to open create modal and refresh after close
//   const openCreateModal = (slug?: string) => {
//     setModalCreate(slug);
//   };

//   return (
//     <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
//       {modalCreate !== undefined && (
//         <CreateMerchandise
//           id={modalCreate}
//           onClose={() => {
//             setModalCreate(undefined);
//             // refresh current page after create/edit
//             getData(page);
//           }}
//         />
//       )}

//       <Title order={1} size="h2">
//         Merchandise Saya
//       </Title>

//       <div className="flex flex-wrap items-center justify-between gap-[20px]">
//         <div className="flex gap-[10px] items-center">
//           <Input variant="bordered" size="md" type="text" placeholder="Cari Merchandise" />
//           <button>
//             <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <rect width="40" height="40" rx="20" fill="#0B387C" />
//               <path
//                 d="M27.5 27.5L23.875 23.875M25.8333 19.1667C25.8333 22.8486 22.8486 25.8333 19.1667 25.8333C15.4848 25.8333 12.5 22.8486 12.5 19.1667C12.5 15.4848 15.4848 12.5 19.1667 12.5C22.8486 12.5 25.8333 15.4848 25.8333 19.1667Z"
//                 stroke="white"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </button>
//         </div>

//         <Flex gap={10} align="center">
//           <ButtonM onClick={() => openCreateModal("")} leftSection={<Icon icon="icon-park-outline:add-one" className="text-[24px]" />} radius="xl" color="#0B387C">
//             Buat Merchandise
//           </ButtonM>
//         </Flex>
//       </div>

//       <Tabs
//         variant="solid"
//         aria-label="Tabs variants"
//         className="border-b-2 border-primary-light-200"
//         classNames={{
//           tabList: "pb-0 self-center font-semibold bg-white",
//           tab: "p-5",
//           cursor: "!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base",
//         }}
//       >
//         {tabStatus.map(([status, label]) => {
//           const filtered = splittedByStatus(status);
//           return (
//             <Tab key={status} title={label}>
//               <Card className="!overflow-auto" p={0} withBorder>
//                 <Table removeWrapper className="rounded-[8px] [&_td]:py-[15px] min-w-[700px]">
//                   <TableHeader>
//                     <TableColumn>Info Produk</TableColumn>
//                     <TableColumn>SKU</TableColumn>
//                     <TableColumn>Harga</TableColumn>
//                     <TableColumn>Stock</TableColumn>
//                     <TableColumn>Aktif</TableColumn>
//                   </TableHeader>

//                   {/* <TableBody>
//                     {filtered.map((item, i) => (
//                       <TableRow key={item.id ?? i}>
//                         <TableCell>
//                           <div className="flex items-center gap-[10px]">
//                             {item.product_image?.length > 0 && <MImage src={item.product_image[0].image_url} className="!h-10 !w-10 bg-[#d0d0d0] rounded-[5px]" />}
//                             <p>{item.product_name}</p>
//                           </div>
//                         </TableCell>

//                         <TableCell className="whitespace-nowrap">
//                           <NumberFormatter value={parseInt(item.product_varian?.[0]?.price || item.price || "0") || 0} prefix="Rp " />
//                         </TableCell>

//                         <TableCell>{item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty}</TableCell>

//                         <TableCell>
//                           <div className="flex items-center gap-[10px]">
//                             <Switch checked={item.product_status_id === 2} disabled={loading.includes("toggle-status")} onChange={(z) => handleToggleStatus(item.id, z.target.checked)} />
//                             <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${item.slug}`}>
//                               <Icon icon="akar-icons:eye" className="text-[24px]" />
//                             </ActionIcon>
//                             <ActionIcon variant="transparent" color="gray" onClick={() => openCreateModal(item.slug)}>
//                               <Icon icon="akar-icons:edit" className="text-[24px]" />
//                             </ActionIcon>
//                             <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id)}>
//                               <Icon icon="uiw:delete" className="text-[18px]" />
//                             </ActionIcon>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody> */}
//                   <TableBody>
//                     {filtered.map((item, i) => (
//                       <TableRow key={item.id ?? i}>
//                         <TableCell>
//                           <div className="flex items-center gap-[10px]">
//                             {item.product_image?.length > 0 && <MImage src={item.product_image[0].image_url} className="!h-10 !w-10 bg-[#d0d0d0] rounded-[5px]" />}
//                             <p>{item.product_name}</p>
//                           </div>
//                         </TableCell>

//                         {/* === SKU (column 2) === */}
//                         <TableCell className="whitespace-nowrap">{item.product_varian?.[0]?.sku || "-"}</TableCell>

//                         <TableCell className="whitespace-nowrap">
//                           <NumberFormatter value={parseInt(item.product_varian?.[0]?.price || item.price || "0") || 0} prefix="Rp " />
//                         </TableCell>

//                         <TableCell>{item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty}</TableCell>

//                         <TableCell>
//                           <div className="flex items-center gap-[10px]">
//                             <Switch checked={item.product_status_id === 2} disabled={loading.includes("toggle-status")} onChange={(z) => handleToggleStatus(item.id, z.target.checked)} />
//                             <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${item.slug}`}>
//                               <Icon icon="akar-icons:eye" className="text-[24px]" />
//                             </ActionIcon>
//                             <ActionIcon variant="transparent" color="gray" onClick={() => openCreateModal(item.slug)}>
//                               <Icon icon="akar-icons:edit" className="text-[24px]" />
//                             </ActionIcon>
//                             <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id)}>
//                               <Icon icon="uiw:delete" className="text-[18px]" />
//                             </ActionIcon>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>

//                 {filtered.length === 0 && (
//                   <Center mih={200} w="100%">
//                     <div className="py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full">
//                       <div className="border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2">
//                         <Image src={merchIcon} alt="bank" className="w-7" />
//                       </div>
//                       <div className="text-center">
//                         <p className="font-semibold text-lg">Belum ada merchandise yang dibuat</p>
//                         <p className="text-grey max-w-72 mt-[10px]">Mulai buat merchandise dengan klik button “Buat Merchandise” di bawah.</p>
//                       </div>
//                       <Button label="Buat Merchandise" color="primary" className="mt-4" onClick={() => openCreateModal("")} startIcon={faCirclePlus} />
//                     </div>
//                   </Center>
//                 )}

//                 {/* Pagination */}
//                 <div className="flex justify-center items-center gap-4 py-6">
//                   <ButtonM disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
//                     Sebelumnya
//                   </ButtonM>
//                   <span>
//                     Halaman {page} dari {lastPage}
//                   </span>
//                   <ButtonM disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
//                     Berikutnya
//                   </ButtonM>
//                 </div>
//               </Card>
//             </Tab>
//           );
//         })}
//       </Tabs>
//     </div>
//   );
// };

// export default Merch;

import CreateMerchandise from "@/components/CreateMerchandise";
import { Delete, Get, Post } from "@/utils/REST";
import { Card, Center, NumberFormatter, Button as ButtonM, Title, Image as MImage, Flex, ActionIcon, Switch } from "@mantine/core";
import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { MerchListResponse } from "./type";
import { modals } from "@mantine/modals";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import merchIcon from "../../../assets/svg/merch.svg";
import Button from "@/components/Button";
import useLoggedUser from "@/utils/useLoggedUser";
import _ from "lodash";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import Cookies from "js-cookie";

const PER_PAGE = 10;

const Merch: React.FC = () => {
  const [isRender, setIsRender] = useState(false);
  const [modalCreate, setModalCreate] = useState<string | undefined>(undefined);
  const [merchList, setMerchList] = useState<MerchListResponse[]>([]);
  const [loading, setLoading] = useState<string[]>([]);
  const [loading2, setLoading2] = useState<boolean>(false);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const user = useLoggedUser();
  const tabStatus: [number, string][] = [
    [2, "Sedang Dijual"],
    [1, "Merchandise Draf"],
    [3, "Non Aktif"],
  ];

  useEffect(() => {
    setIsRender(true);
  }, []);

  // fetch data when component first renders and whenever page changes
  useEffect(() => {
    if (!isRender) return;
    getData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRender, page]);

  const getData = async (pageNum: number = 1) => {
    setLoading2(true);

    try {
      // guard: butuh creator id
      const creatorId = user?.has_creator?.id;
      if (!creatorId) {
        console.warn("getData aborted: no creator id on user", user);
        setMerchList([]); // opsional: clear list
        setLastPage(1);
        return;
      }

      const qs = new URLSearchParams({
        per_page: String(PER_PAGE),
        page: String(pageNum),
        creator_id: String(creatorId),
      }).toString();

      const url = `${process.env.NEXT_PUBLIC_URL}/product-bymerchant?${qs}`;
      console.log("Fetching:", url);

      // ambil token dari env dulu, fallback ke cookie/localStorage
      const envToken = process.env.NEXT_PUBLIC_API_TOKEN || "";
      const cookieToken = Cookies.get("token") || (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "");
      const token = envToken || cookieToken || "";

      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: "GET",
        headers,
        // jika backend pakai cookie-based auth dan kamu butuh cookie:
        // credentials: 'include'
      } as RequestInit);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      console.log("API data:", json);

      // json.data is expected to be pagination object: { current_page, data: [...], last_page, ... }
      const pagination = json?.data;
      const list: MerchListResponse[] = Array.isArray(pagination?.data) ? pagination.data : Array.isArray(pagination) ? pagination : [];

      // keep all items, we'll split by tab later — if you want initial filtering, adjust here
      setMerchList(list);

      const computedLastPage = pagination?.last_page ?? 1;
      setLastPage(Number(computedLastPage) || 1);
    } catch (err) {
      console.error("Error fetching data:", err);
      // optional: notifications.show({ message: "Gagal memuat produk", color: "red" });
    } finally {
      setLoading2(false);
    }
  };

  const handleToggleStatus = async (id: number, status: boolean) => {
    setLoading((prev) => [...prev, "toggle-status"]);
    try {
      const res: any = await Post(`product_toggle_status/${id}`, {
        status: status ? 2 : 3,
      });
      if (res?.status) {
        setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => prev.filter((s) => s !== "toggle-status"));
    }
  };

  const handleDelete = (id: number) => {
    modals.openConfirmModal({
      centered: true,
      title: "Hapus Produk?",
      children: "Apakah anda yakin ingin menghapus produk ini?",
      labels: { confirm: "Hapus", cancel: "Batal" },
      onConfirm: () => {
        setLoading((prev) => [...prev, `delete${id}`]);
        Delete(`product/${id}`, {})
          .then(() => {
            setMerchList((prev) => prev.filter((e) => e.id !== id));
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => setLoading((prev) => prev.filter((s) => s !== `delete${id}`)));
      },
    });
  };

  // memoize splitted lists for each status
  const splittedByStatus = useMemo(() => {
    const map = new Map<number, MerchListResponse[]>();
    [2, 1, 3].forEach((st) =>
      map.set(
        st,
        merchList.filter((e) => e.product_status_id === st)
      )
    );
    return (status: number) => map.get(status) ?? [];
  }, [merchList]);

  // helper to open create modal and refresh after close
  const openCreateModal = (slug?: string) => {
    setModalCreate(slug);
  };

  /**
   * --- FILTER & SEARCH STATE (ditambahkan untuk tabel) ---
   * Ini tidak mengubah data server / pagination — hanya filter client-side pada list halaman yang sudah di-fetch
   */
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [category, setCategory] = useState<string>(""); // placeholder, sesuaikan bila ada field category
  const [method, setMethod] = useState<string>(""); // placeholder untuk metode pembayaran jika ada
  const [statusFilter, setStatusFilter] = useState<string>(""); // "active"/"inactive" optional
  const [search, setSearch] = useState<string>("");

  // helper: buat teks pencarian gabungan untuk tiap item
  const itemSearchText = (item: MerchListResponse) => {
    const parts: string[] = [];
    if (item.product_name) parts.push(String(item.product_name));
    if (item.slug) parts.push(String(item.slug));
    // sku dari varian pertama
    if (item.product_varian?.[0]?.sku) parts.push(String(item.product_varian[0].sku));
    // semua varian sku jika ada
    if (item.product_varian?.length) parts.push(item.product_varian.map((v: any) => v.sku || "").join(" "));
    if (item.product_varian?.[0]?.price) parts.push(String(item.product_varian[0].price));
    if (item.price) parts.push(String(item.price));
    if (item.qty !== undefined) parts.push(String(item.qty));
    if (item.product_status_id !== undefined) parts.push(String(item.product_status_id));
    // add image urls too (rarely searched)
    if (item.product_image?.length) parts.push(item.product_image.map((p) => p.image_url).join(" "));
    return parts.join(" ").toLowerCase();
  };

  return (
    <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
      {modalCreate !== undefined && (
        <CreateMerchandise
          id={modalCreate}
          onClose={() => {
            setModalCreate(undefined);
            // refresh current page after create/edit
            getData(page);
          }}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-[20px]">
        <Title order={1} size="h2">
          Merchandise Saya
        </Title>
        <div className="flex gap-[10px] items-center">
          {/* Reuse Input dari @nextui-org/react yang sudah diimport */}
          {/* <Input isClearable value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Cari Merchandise" /> */}
          {/* <button>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="#0B387C" />
              <path
                d="M27.5 27.5L23.875 23.875M25.8333 19.1667C25.8333 22.8486 22.8486 25.8333 19.1667 25.8333C15.4848 25.8333 12.5 22.8486 12.5 19.1667C12.5 15.4848 15.4848 12.5 19.1667 12.5C22.8486 12.5 25.8333 15.4848 25.8333 19.1667Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button> */}
        </div>

        <Flex gap={10} align="center">
          <ButtonM onClick={() => openCreateModal("")} leftSection={<Icon icon="icon-park-outline:add-one" className="text-[24px]" />} radius="xl" color="#0B387C">
            Buat Merchandise
          </ButtonM>
        </Flex>
      </div>

      <Tabs
        variant="solid"
        aria-label="Tabs variants"
        className="border-b-2 border-primary-light-200"
        classNames={{
          tabList: "pb-0 self-center font-semibold bg-white",
          tab: "p-5",
          cursor: "!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base",
        }}
      >
        {tabStatus.map(([status, label]) => {
          // base list for this tab (from server-splitted)
          const baseList = splittedByStatus(status);

          // apply client-side filters & search on top of baseList
          const filtered = useMemo(() => {
            return (baseList || []).filter((item) => {
              // date filter: check item.date or created_at if exists
              if (startDate || endDate) {
                const dateStr = (item as any).date || (item as any).created_at || "";
                if (dateStr) {
                  const d = new Date(dateStr);
                  if (startDate) {
                    const s = new Date(startDate);
                    if (d < s) return false;
                  }
                  if (endDate) {
                    const e = new Date(endDate);
                    e.setHours(23, 59, 59, 999);
                    if (d > e) return false;
                  }
                }
              }

              // category filter (if your item has category field)
              if (category) {
                const catField = (item as any).category || (item as any).category_id || "";
                if (!String(catField).toLowerCase().includes(category.toLowerCase())) return false;
              }

              // method filter (if your item has payment/method field)
              if (method) {
                const m = (item as any).payment_method || (item as any).method || "";
                if (!String(m).toLowerCase().includes(method.toLowerCase())) return false;
              }

              // statusFilter
              if (statusFilter) {
                if (statusFilter === "active" && item.product_status_id !== 2) return false;
                if (statusFilter === "inactive" && item.product_status_id === 2) return false;
              }

              // search bar
              if (search) {
                const needle = search.toLowerCase().trim();
                if (!itemSearchText(item).includes(needle)) return false;
              }

              return true;
            });
          }, [baseList, startDate, endDate, category, method, statusFilter, search]);

          return (
            <Tab key={status} title={label}>
              <Card className="!overflow-auto" p={0} withBorder>
                {/* --- FILTER BAR (khusus di atas tabel setiap tab) --- */}
                <div className="bg-white px-4 py-3 border-b">
                  <div className="flex flex-wrap gap-3 items-center">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-full px-3 py-2" placeholder="Tanggal Mulai" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-full px-3 py-2" placeholder="Tanggal Akhir" />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-full px-3 py-2">
                      <option value="">Semua Kategori</option>
                      {/* jika ada categories, map di sini */}
                    </select>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                      <Input isClearable value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Cari disini..." className="w-64" />
                      <ButtonM
                        size="sm"
                        onClick={() => {
                          // reset semua filter lokal
                          setSearch("");
                          setStartDate("");
                          setEndDate("");
                          setCategory("");
                          setMethod("");
                          setStatusFilter("");
                        }}
                      >
                        Reset
                      </ButtonM>
                    </div>
                  </div>
                </div>

                {/* --- TABLE (dengan filtered list) --- */}
                <div className="bg-white rounded-[8px] overflow-hidden">
                  <Table removeWrapper className="rounded-[8px] [&_td]:py-[15px] min-w-[700px]">
                    <TableHeader>
                      <TableColumn>No</TableColumn>
                      <TableColumn>Info Produk</TableColumn>
                      <TableColumn>SKU</TableColumn>
                      <TableColumn>Harga</TableColumn>
                      <TableColumn>Stock</TableColumn>
                      <TableColumn>Aktif</TableColumn>
                    </TableHeader>

                    <TableBody>
                      {
                        <>
                          {filtered.length === 0 ? (
                            <TableRow key="empty">
                              <TableCell>{null}</TableCell>
                              <TableCell>{null}</TableCell>
                              <TableCell>{null}</TableCell>
                              <TableCell>{null}</TableCell>
                              <TableCell>{null}</TableCell>
                              <TableCell>{null}</TableCell>
                            </TableRow>
                          ) : (
                            filtered.map((item, i) => (
                              <TableRow key={String(item.id ?? i)}>
                                {/* No */}
                                <TableCell className="whitespace-nowrap">{i + 1}</TableCell>

                                {/* Info Produk */}
                                <TableCell>
                                  <div className="flex items-center gap-[10px]">
                                    {/* uncomment jika perlu image */}
                                    {/* {item.product_image?.length > 0 && (
                  <MImage src={item.product_image[0].image_url} className="!h-10 !w-10 bg-[#d0d0d0] rounded-[5px]" />
                )} */}
                                    <p>{item.product_name}</p>
                                  </div>
                                </TableCell>

                                {/* SKU */}
                                <TableCell className="whitespace-nowrap">{item.product_varian?.[0]?.sku || "-"}</TableCell>

                                {/* Harga */}
                                <TableCell className="whitespace-nowrap">
                                  <NumberFormatter value={parseInt(String(item.product_varian?.[0]?.price || item.price || "0")) || 0} prefix="Rp " />
                                </TableCell>

                                {/* Stock */}
                                <TableCell>{item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty}</TableCell>

                                {/* Aktif / Actions */}
                                <TableCell>
                                  <div className="flex items-center gap-[10px]">
                                    <Switch checked={item.product_status_id === 2} disabled={loading.includes("toggle-status")} onChange={(z: any) => handleToggleStatus(item.id, z.target.checked)} />
                                    <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${item.slug}`}>
                                      <Icon icon="akar-icons:eye" className="text-[24px]" />
                                    </ActionIcon>
                                    <ActionIcon variant="transparent" color="gray" onClick={() => openCreateModal(item.slug)}>
                                      <Icon icon="akar-icons:edit" className="text-[24px]" />
                                    </ActionIcon>
                                    <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id)}>
                                      <Icon icon="uiw:delete" className="text-[18px]" />
                                    </ActionIcon>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </>
                      }
                    </TableBody>
                  </Table>
                </div>

                {filtered.length === 0 && (
                  <Center mih={200} w="100%">
                    <div className="py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full">
                      <div className="border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2">
                        <Image src={merchIcon} alt="bank" className="w-7" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-lg">Belum ada merchandise yang dibuat</p>
                        <p className="text-grey max-w-72 mt-[10px]">Mulai buat merchandise dengan klik button “Buat Merchandise” di bawah.</p>
                      </div>
                      <Button label="Buat Merchandise" color="primary" className="mt-4" onClick={() => openCreateModal("")} startIcon={faCirclePlus} />
                    </div>
                  </Center>
                )}

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 py-6">
                  <ButtonM disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Sebelumnya
                  </ButtonM>
                  <span>
                    Halaman {page} dari {lastPage}
                  </span>
                  <ButtonM disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
                    Berikutnya
                  </ButtonM>
                </div>
              </Card>
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Merch;
