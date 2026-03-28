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
import { Card, Center, NumberFormatter, Button as ButtonM, Title, Flex, ActionIcon, Switch, TextInput, Select, Pagination as MantinePagination } from "@mantine/core";
import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
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
import { Get } from "@/utils/REST";

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

  useEffect(() => {
    if (!isRender) return;
    getData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRender, page]);

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
    }).toString();

    Get(`product?${qs}`, {})
      .then((res: any) => {
        if (res.data) {
          console.log("Merchant data response:", res);

          const products = Array.isArray(res.data) ? res.data : [];
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
  const [filterProduct, setFilterProduct] = useState<string | null>(null);
  const [mtSortBy, setMtSortBy] = useState<string>("");
  const [mtSortDir, setMtSortDir] = useState<"asc" | "desc">("asc");
  const handleMTSort = (col: string) => {
    if (mtSortBy === col) setMtSortDir(d => d === "asc" ? "desc" : "asc");
    else { setMtSortBy(col); setMtSortDir("asc"); }
  };

  // Daftar nama produk unik untuk dropdown filter
  const productNames = useMemo(() => {
    const names = new Set<string>();
    merchList.forEach((item) => {
      if (item.product_name) names.add(item.product_name);
    });
    return Array.from(names).map((n) => ({ value: n, label: n }));
  }, [merchList]);

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

        if (filterProduct && filterProduct !== "all") {
          if (!item.product_name?.toLowerCase().includes(filterProduct.toLowerCase())) return false;
        }

        return true;
      });

      map.set(status, filtered);
    }
    return map;
  }, [splittedByStatus, search, filterProduct, tabStatus]);

  const sortedFilteredMap = useMemo(() => {
    const map = new Map<number, MerchListResponse[]>();
    for (const [status] of tabStatus) {
      let filtered = [...(filteredMap.get(status) || [])];
      if (mtSortBy) {
        filtered.sort((a: any, b: any) => {
          let valA: any = "";
          let valB: any = "";
          if (mtSortBy === "product_name") {
            valA = a.product_name ?? "";
            valB = b.product_name ?? "";
          } else if (mtSortBy === "sku") {
            valA = getProductSku(a);
            valB = getProductSku(b);
          } else if (mtSortBy === "price") {
            valA = parseInt(a.product_varian?.[0]?.price ?? a.price ?? "0", 10) || 0;
            valB = parseInt(b.product_varian?.[0]?.price ?? b.price ?? "0", 10) || 0;
          } else if (mtSortBy === "stock") {
            valA = a.product_varian?.length ? _.sumBy(a.product_varian, "stock_qty") : a.qty;
            valB = b.product_varian?.length ? _.sumBy(b.product_varian, "stock_qty") : b.qty;
          }

          if (typeof valA === "string") valA = valA.toLowerCase();
          if (typeof valB === "string") valB = valB.toLowerCase();
          
          if (valA < valB) return mtSortDir === "asc" ? -1 : 1;
          if (valA > valB) return mtSortDir === "asc" ? 1 : -1;
          return 0;
        });
      }
      map.set(status, filtered);
    }
    return map;
  }, [filteredMap, tabStatus, mtSortBy, mtSortDir]);

  return (
    <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
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
          <div className="flex flex-wrap items-center justify-between gap-[20px]">
            <Title order={1} size="h2">
              Merchandise Saya
            </Title>
            <div className="flex gap-[10px] items-center"></div>

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
          const filtered = sortedFilteredMap.get(status) ?? [];

          return (
            <Tab key={status} title={label}>
              <Card className="!overflow-auto" p={0} withBorder>
                {/* filter bar */}
                <Flex align="center" gap="sm" wrap="wrap" px={16} py={12} justify="flex-end" style={{ borderBottom: '1px solid #eee' }}>
                  <Select
                    placeholder="Filter Produk"
                    data={[
                      { value: 'all', label: 'Semua Produk' },
                      ...productNames,
                    ]}
                    value={filterProduct || 'all'}
                    onChange={(val) => setFilterProduct(val)}
                    style={{ minWidth: 200 }}
                    size="sm"
                    searchable
                    clearable
                  />
                  <TextInput
                    placeholder="Cari merchandise..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftSection={<Icon icon="akar-icons:search" width={16} />}
                    style={{ width: 280 }}
                    size="sm"
                  />
                  {(search || (filterProduct && filterProduct !== 'all')) && (
                    <ButtonM
                      size="sm"
                      variant="light"
                      color="gray"
                      onClick={() => { setSearch(""); setFilterProduct(null); }}
                      leftSection={<Icon icon="solar:refresh-bold" width={14} />}
                      radius="xl"
                    >
                      Reset
                    </ButtonM>
                  )}
                </Flex>


                <div className="bg-white rounded-[8px] overflow-hidden">
                  <Table 
                    removeWrapper 
                    className="rounded-[8px] [&_td]:py-[15px] min-w-[800px]"
                  >
                    <TableHeader>
                      <TableColumn>#</TableColumn>
                      <TableColumn className="cursor-pointer" onClick={() => handleMTSort('product_name')}>Info Produk {mtSortBy === 'product_name' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</TableColumn>
                      <TableColumn className="cursor-pointer" onClick={() => handleMTSort('sku')}>SKU {mtSortBy === 'sku' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</TableColumn>
                      <TableColumn className="cursor-pointer" onClick={() => handleMTSort('price')}>Harga {mtSortBy === 'price' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</TableColumn>
                      <TableColumn className="cursor-pointer" onClick={() => handleMTSort('stock')}>Stock {mtSortBy === 'stock' ? (mtSortDir === 'asc' ? '↑' : '↓') : <span style={{opacity:0.3}}>↑</span>}</TableColumn>
                      <TableColumn>Lokasi</TableColumn>
                      <TableColumn>Aktif</TableColumn>
                    </TableHeader>

                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow key="empty">
                          <TableCell>{null}</TableCell>
                          <TableCell>{null}</TableCell>
                          <TableCell>{null}</TableCell>
                          <TableCell>{null}</TableCell>
                          <TableCell>{null}</TableCell>
                          <TableCell>{null}</TableCell>
                          <TableCell>{null}</TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((item, i) => {
                          const safeId = String(item.id ?? i);
                          const safeSlug = String(item.slug ?? "");
                          
                          // Gunakan fungsi getProductSku untuk mendapatkan SKU
                          const safeSku = getProductSku(item);
                          
                          const safePriceRaw = String(item.product_varian?.[0]?.price ?? item.price ?? "0");
                          const safePrice = parseInt(safePriceRaw === "" ? "0" : safePriceRaw, 10) || 0;
                          const stock = item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty;
                          const location = item.has_store_location?.store_name || "-";

                          return (
                            <TableRow key={safeId}>
                              <TableCell className="whitespace-nowrap">{i + 1}</TableCell>

                              <TableCell>
                                <div className="flex items-center gap-[10px]">
                                  <p>{String(item.product_name ?? "")}</p>
                                </div>
                              </TableCell>

                              <TableCell className="whitespace-nowrap">
                                {safeSku !== "-" ? safeSku : "-"}
                              </TableCell>

                              <TableCell className="whitespace-nowrap">
                                <NumberFormatter value={safePrice} prefix="Rp " />
                              </TableCell>

                              <TableCell>{stock ?? 0}</TableCell>

                              <TableCell className="whitespace-nowrap">{String(location)}</TableCell>

                              <TableCell>
                                <div className="flex items-center gap-[10px]">
                                  <Switch checked={item.product_status_id === 2} disabled={loading.includes("toggle-status")} onChange={(z: any) => handleToggleStatus(item.id, z.target.checked)} />
                                  <ActionIcon variant="transparent" component={Link as any} href={`/dashboard/merch/${safeSlug}`}>
                                    <Icon icon="akar-icons:eye" className="text-[24px]" />
                                  </ActionIcon>
                                  <ActionIcon variant="transparent" color="gray" onClick={() => openCreateModal(safeSlug)}>
                                    <Icon icon="akar-icons:edit" className="text-[24px]" />
                                  </ActionIcon>
                                  <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id)}>
                                    <Icon icon="uiw:delete" className="text-[18px]" />
                                  </ActionIcon>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filtered.length === 0 && (
                  <Center mih={200} w="100%">
                    <div className="py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full">
                      <div className="border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2">
                        {/* <NextImage src={merchIcon} alt="merch" className="w-7" /> */}
                        <div className="w-7 h-7 bg-gray-300 rounded"></div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-lg">Belum ada merchandise yang dibuat</p>
                        <p className="text-grey max-w-72 mt-[10px]">
                          Mulai buat merchandise dengan klik button &quot;Buat Merchandise&quot; di bawah.
                        </p>
                      </div>
                      <Button label="Buat Merchandise" color="primary" className="mt-4" onClick={() => openCreateModal("")} startIcon={faCirclePlus} />
                    </div>
                  </Center>
                )}

                <Flex justify="center" align="center" gap="md" py={16} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <MantinePagination
                    total={lastPage}
                    value={page}
                    onChange={setPage}
                    size="sm"
                    radius="md"
                    withEdges
                    color="#0B387C"
                  />
                </Flex>
              </Card>
            </Tab>
          );
        })}
      </Tabs>
        </>
      )}
    </div>
  );
};

export default Merch;