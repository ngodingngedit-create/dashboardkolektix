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
import { Delete, Post } from "@/utils/REST";
import { NumberFormatter, Button as ButtonM, Flex, ActionIcon, Switch, Pagination as MantinePagination, Stack, Divider, Text } from "@mantine/core";
import { Tab, Tabs } from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";
import { MerchListResponse } from "./type";
import { modals } from "@mantine/modals";
import { faArrowLeft, faSearch, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/Button";
import InputField from "@/components/Input";
import useLoggedUser from "@/utils/useLoggedUser";
import _ from "lodash";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Get } from "@/utils/REST";
import { useRouter } from "next/router";
import TarikDanaModal from "@/components/Dashboard/Modal/Withdraw";

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

  // withdraw modal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // total pendapatan dari transaksi merchandise
  const [totalPendapatan, setTotalPendapatan] = useState<number>(0);
  const [totalTransaksi, setTotalTransaksi] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);

  const user = useLoggedUser();
  const router = useRouter();
  const tabStatus: [number, string][] = [
    [2, "Sedang Dijual"],
    [1, "Produk Draf"],
    [3, "Non Aktif"],
  ];

  useEffect(() => {
    setIsRender(true);
  }, []);

  useEffect(() => {
    if (!isRender || !user?.has_creator?.id) return;
    getData(page);
    fetchTotalPendapatan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRender, page, user?.has_creator?.id]);

  const fetchTotalPendapatan = async () => {
    const creatorId = user?.has_creator?.id;
    
    if (!creatorId) {
      console.warn("fetchTotalPendapatan: No creator ID available");
      return;
    }

    try {
      console.log("Fetching total pendapatan for creator:", creatorId);
      const res: any = await Get("order-bycreator", {});
      console.log("order-bycreator response:", res);
      
      let allOrders = res?.data || [];
      
      // Filter orders that have at least one detail item belonging to this creator
      const filteredData = allOrders.filter((item: any) => {
        // Check if order has detail array
        if (!item.detail || !Array.isArray(item.detail)) return false;
        
        // Check if any detail item belongs to this creator
        return item.detail.some((detail: any) => {
          const detailCreatorId = detail.creator_id || detail.product?.creator_id;
          return detailCreatorId === creatorId;
        });
      });
      
      console.log("Filtered by creator:", filteredData.length, "items");
      
      // Filter for PAID transactions only
      // transaction_status_id === 2 means paid/completed
      // Exclude payment_status_id === 5 (refund) and payment_method_id === 5
      const successfulOrders = filteredData.filter(
        (item: any) => {
          const isPaid = item.transaction_status_id === 2;
          const notRefunded = item.payment_status_id !== 5;
          const validPaymentMethod = item.payment_method_id !== 5;
          
          console.log(`Order ${item.invoice_no}:`, { 
            transaction_status_id: item.transaction_status_id,
            payment_status_id: item.payment_status_id,
            payment_method_id: item.payment_method_id,
            isPaid, notRefunded, validPaymentMethod
          });
          
          return isPaid && notRefunded && validPaymentMethod;
        }
      );
      
      console.log("Paid/Successful orders:", successfulOrders.length, "items");
      
      // Calculate total pendapatan
      // Sum only items that belong to this creator
      const total = successfulOrders.reduce((sum: number, order: any) => {
        const orderTotal = (order.detail || [])
          .filter((detail: any) => {
            const detailCreatorId = detail.creator_id || detail.product?.creator_id;
            return detailCreatorId === creatorId;
          })
          .reduce((detailSum: number, detail: any) => {
            const price = Number(detail.price) || 0;
            const qty = Number(detail.qty) || 1;
            return detailSum + (price * qty);
          }, 0);
        return sum + orderTotal;
      }, 0);
      
      console.log("Total pendapatan (paid only):", total);
      
      setTotalPendapatan(total);
      setTotalTransaksi(successfulOrders.length);
      
      // Fetch total withdrawn amount
      fetchTotalWithdrawn();
    } catch (err) {
      console.error("Error fetching total pendapatan:", err);
    }
  };

  const fetchTotalWithdrawn = async () => {
    try {
      const creatorId = user?.has_creator?.id;
      if (!creatorId) return;

      // Fetch withdraw history
      const res: any = await Get("withdraw", {});
      const withdrawals = res?.data || [];
      
      // Filter withdrawals for this creator and sum approved amounts
      const totalWithdrawn = withdrawals
        .filter((w: any) => {
          // Check if withdrawal belongs to this creator
          const withdrawCreatorId = w.creator_id || w.user?.has_creator?.id;
          return withdrawCreatorId === creatorId && w.transaction_status_id === 2; // status 2 = approved/success
        })
        .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);
      
      setTotalWithdrawn(totalWithdrawn);
      console.log("Total withdrawn:", totalWithdrawn);
    } catch (err) {
      console.error("Error fetching total withdrawn:", err);
    }
  };

  const getData = (pageNum: number = 1) => {
    setLoading2(true);

    const creatorId = user?.has_creator?.id;

    if (!creatorId) {
      console.warn("getData aborted: missing creator_id");
      setMerchList([]);
      setLastPage(1);
      setLoading2(false);
      return;
    }

    const qs = new URLSearchParams({
      per_page: String(PER_PAGE),
      page: String(pageNum),
      creator_id: String(creatorId),
      order_by: "created_at",
      order_direction: "desc",
    }).toString();

    Get(`product?${qs}`, {})
      .then((res: any) => {
        if (res.data) {
          console.log("Merchant data response:", res);

          const rawProducts = Array.isArray(res.data) ? res.data : [];
          // Sort client-side: newest first
          const products = [...rawProducts].sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          const totalLastPage = res?.last_page ?? 1;

          setMerchList(products);
          setLastPage(totalLastPage);

          console.log(`Showing page ${pageNum} of ${totalLastPage} (${products.length} items)`);
        } else {
          console.warn("Response data is empty or undefined.");
          setMerchList([]);
          setLastPage(1);
        }
        setLoading2(false);
      })
      .catch((err) => {
        console.error("Error fetching merchant data:", err);
        setMerchList([]);
        setLastPage(1);
        setLoading2(false);
      });
  };

  const handleToggleStatus = async (id: number, status: boolean) => {
    const creatorId = user?.has_creator?.id;
    const item = merchList.find((p) => p.id === id);

    if (!item) {
      console.warn(`Toggle aborted: product id ${id} not found in current merchList`);
      return;
    }

    if (creatorId && item.creator_id && String(item.creator_id) !== String(creatorId)) {
      console.warn(`Toggle aborted: product ${id} does not belong to creator ${creatorId}`);
      return;
    }

    setLoading((prev) => [...prev, "toggle-status"]);
    try {
      const res: any = await Post(`product_toggle_status/${id}`, {
        status: status ? 2 : 3,
      });

      if (res?.status) {
        setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
      } else {
        console.warn("Toggle API returned falsy status:", res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => prev.filter((s) => s !== "toggle-status"));
    }
  };

  const handleDelete = (id: number, slug: string) => {
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

  const splittedByStatus = useMemo(() => {
    return (status: number) => merchList.filter((e) => e.product_status_id === status);
  }, [merchList]);

  const openCreateModal = (slug?: string) => {
    setModalCreate(slug);
  };

  /**
   * FILTER & SEARCH STATE
   */
  const [search, setSearch] = useState<string>("");

  // Fungsi untuk mendapatkan SKU produk
  const getProductSku = (item: MerchListResponse): string => {
    // 1. Cek SKU di level produk (jika ada)
    if (item.sku) return item.sku;

    // 2. Cek SKU dari varian pertama (jika ada varian)
    if (item.product_varian?.[0]?.sku) return item.product_varian[0].sku;

    // 3. Cek semua varian untuk SKU
    if (item.product_varian?.length > 0) {
      const sku = item.product_varian.find(v => v.sku)?.sku;
      if (sku) return sku;
    }

    // 4. Default
    return "-";
  };

  const itemSearchText = (item: MerchListResponse) => {
    const parts: string[] = [];
    if (item.product_name) parts.push(String(item.product_name));
    if (item.slug) parts.push(String(item.slug));

    // Tambahkan SKU produk ke search
    const sku = getProductSku(item);
    if (sku && sku !== "-") parts.push(String(sku));

    if (item.product_varian?.length) {
      parts.push(...item.product_varian
        .filter(v => v?.sku)
        .map(v => String(v.sku))
      );
    }

    if (item.product_varian?.[0]?.price) parts.push(String(item.product_varian[0].price));
    if (item.price) parts.push(String(item.price));
    if (item.qty !== undefined) parts.push(String(item.qty));
    if (item.product_status_id !== undefined) parts.push(String(item.product_status_id));
    if (item.product_image?.length) parts.push(item.product_image.map((p: any) => String(p?.image_url ?? "")).join(" "));
    if (item.has_store_location?.store_name) parts.push(String(item.has_store_location.store_name));

    return parts.join(" ").toLowerCase();
  };

  const filteredMap = useMemo(() => {
    const map = new Map<number, MerchListResponse[]>();
    for (const [status] of tabStatus) {
      const baseList = splittedByStatus(status) || [];
      const filtered = (baseList || []).filter((item) => {
        if (search) {
          const needle = search.toLowerCase().trim();
          if (!itemSearchText(item).includes(needle)) return false;
        }

        return true;
      });

      map.set(status, filtered);
    }
    return map;
  }, [splittedByStatus, search, tabStatus]);

  return (
    <div className="p-5">
      {/* Withdraw Modal */}
      <TarikDanaModal
        isOpen={isWithdrawOpen}
        setIsOpen={setIsWithdrawOpen}
        totalSaldo={totalPendapatan - totalWithdrawn}
        onSubmit={() => {
          setIsWithdrawOpen(false);
          fetchTotalPendapatan();
        }}
      />

      {modalCreate !== undefined ? (
        <CreateMerchandise
          id={modalCreate}
          onClose={() => {
            setModalCreate(undefined);
            getData(page);
          }}
        />
      ) : (
        <>
          {/* Header: judul di kiri */}
          <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
                aria-label="Kembali ke Dashboard"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h1 className="text-dark m-0">Produk Saya</h1>
            </div>
          </div>

          {/* Statistik pendapatan & aksi buat produk */}
          <div className="bg-white border border-primary-light-200 rounded-xl p-4 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <Flex gap="xl" align="center" wrap="wrap">
              <Stack gap={4}>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">Total Pendapatan</Text>
                <Flex align="center" gap="xs">
                  <Text size="xl" fw={700}>
                    <NumberFormatter prefix="Rp " value={totalPendapatan} thousandSeparator="." decimalSeparator="," />
                  </Text>
                  <ActionIcon
                    size="lg"
                    radius="xl"
                    color="#0B387C"
                    variant="filled"
                    onClick={() => setIsWithdrawOpen(true)}
                  >
                    <Icon icon="solar:wallet-money-bold" className="text-[20px]" />
                  </ActionIcon>
                </Flex>
                <Flex gap="md" mt={4}>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">Sudah Ditarik</Text>
                    <Text size="xs" fw={600} c="red">
                      <NumberFormatter prefix="Rp " value={totalWithdrawn} thousandSeparator="." decimalSeparator="," />
                    </Text>
                  </Stack>
                  <Divider orientation="vertical" size="xs" />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">Tersedia</Text>
                    <Text size="xs" fw={600} c="green">
                      <NumberFormatter prefix="Rp " value={totalPendapatan - totalWithdrawn} thousandSeparator="." decimalSeparator="," />
                    </Text>
                  </Stack>
                </Flex>
              </Stack>
            </Flex>
            <ButtonM
              onClick={() => openCreateModal("")}
              leftSection={<Icon icon="icon-park-outline:add-one" className="text-[24px]" />}
              radius="xl"
              color="#0B387C"
            >
              Buat Produk
            </ButtonM>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b-2 border-primary-light-200 md:grid-cols-[1fr_auto]">
            <Tabs
              variant="solid"
              aria-label="Tabs variants"
              className="md:col-start-1 md:row-start-1 md:self-start"
              classNames={{
                tabList: "pb-0 self-center font-semibold bg-white",
                tab: "p-5",
                cursor: "!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base",
                panel: "md:col-start-1 md:col-span-2 md:row-start-2",
              }}
            >
            {tabStatus.map(([status, label]) => {
              const filtered = filteredMap.get(status) ?? [];

              return (
                <Tab key={status} title={label}>
                  {!loading2 ? (
                    filtered.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 content-center md:justify-items-start justify-items-center gap-x-6 gap-y-10 my-5 px-5">
                          {filtered.map((item: MerchListResponse) => {
                            const image = item.product_image?.[0]?.image_url;
                            const price = Number(item.product_varian?.[0]?.price ?? item.price ?? 0) || 0;
                            const stock = item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty;
                            const location = item.has_store_location?.store_name || "-";

                            return (
                              <div key={String(item.id)} className="w-full bg-white rounded-xl shadow-md border border-primary-light-200 overflow-hidden">
                                <div className="relative w-full h-44 bg-primary-light">
                                  {image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={image} alt={item.product_name} className="w-full h-44 object-cover" />
                                  ) : (
                                    <div className="w-full h-44 flex items-center justify-center bg-gray-200">
                                      <Icon icon="solar:box-bold" className="text-4xl text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute right-2 top-2">
                                    <span className="bg-light-grey text-dark py-1 px-3 rounded-full shadow-sm text-xs">{label}</span>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h5 className="text-lg font-semibold text-dark truncate">{item.product_name}</h5>
                                  <p className="text-primary-base font-bold mt-1">
                                    <NumberFormatter prefix="Rp " value={price} thousandSeparator="." decimalSeparator="," />
                                  </p>
                                  <div className="flex items-center gap-4 mt-3 text-sm text-grey">
                                    <span>
                                      Stock:{" "}
                                      <Link
                                        href={`/dashboard/stockmanagement?action=create&productName=${encodeURIComponent(String(item.product_name || ""))}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                      >
                                        {stock ?? 0}
                                      </Link>
                                    </span>
                                    <span>{String(location)}</span>
                                  </div>
                                  <div className="mt-4 pt-3 border-t-1.5 border-dashed border-primary-light-200 flex items-center justify-between">
                                    <Switch checked={item.product_status_id === 2} disabled={loading.includes("toggle-status")} onChange={(z: any) => handleToggleStatus(item.id, z.target.checked)} />
                                    <div className="flex items-center gap-1">
                                      <ActionIcon variant="transparent" component={Link as any} href={`/dashboard/merch/${String(item.slug || "")}`}>
                                        <Icon icon="akar-icons:eye" className="text-[22px]" />
                                      </ActionIcon>
                                      <ActionIcon variant="transparent" color="gray" onClick={() => openCreateModal(String(item.slug || ""))}>
                                        <Icon icon="akar-icons:edit" className="text-[22px]" />
                                      </ActionIcon>
                                      <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id, String((item as any).slug_url || item.slug || ""))}>
                                        <Icon icon="uiw:delete" className="text-[18px]" />
                                      </ActionIcon>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-center py-6" style={{ borderTop: "1px solid #f0f0f0" }}>
                          <MantinePagination
                            total={lastPage}
                            value={page}
                            onChange={setPage}
                            size="sm"
                            radius="md"
                            withEdges
                            color="#0B387C"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="border border-primary-light-200 flex flex-col items-center justify-center min-h-[50vh] rounded-md gap-3 text-center text-dark px-5 my-5">
                        <div className="w-7 h-7 bg-gray-300 rounded"></div>
                        <h3 className="text-xl font-semibold">Belum ada Produk yang dibuat</h3>
                        <p className="px-10">Mulai buat merchandise dengan klik button &quot;Buat Produk&quot; di atas.</p>
                        <Button label="Buat Produk" color="primary" className="mt-3" onClick={() => openCreateModal("")} startIcon={faCirclePlus} />
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5 px-5">
                      <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse" />
                      <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse" />
                      <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse" />
                      <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse" />
                    </div>
                  )}
                </Tab>
              );
            })}
          </Tabs>

          <div className="flex items-center gap-3 pb-0 md:pt-3 md:pr-4 md:col-start-2 md:row-start-1 md:self-start">
            <InputField
              type="text"
              size="sm"
              placeholder="Cari Produk"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={() => {}} className="p-2 rounded-md" aria-label="search" title="Cari">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Merch;