// import CreateMerchandise from "@/components/CreateMerchandise";
// import { Delete, Get, Post } from "@/utils/REST";
// import { Card, Center, NumberFormatter, Button as ButtonM, Text, Switch, ActionIcon, Stack, Flex, Title, Image as MImage } from "@mantine/core";
// import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
// import Image from "next/image";
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { MerchListResponse } from "./type";
// import Cookies from "js-cookie";
// import { useListState } from "@mantine/hooks";
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
//   const [merchList, setMerchList] = useState<MerchListResponse[]>();
//   const [loading, setLoading] = useListState<string>();
//   const [loading2, setLoading2] = useState<boolean>(false); // tambahan loading
//   const [data, setData] = useState<MerchListResponse[]>([]);
//   const user = useLoggedUser();

//   useEffect(() => {
//     setIsRender(true);
//   }, []);

//   useEffect(() => {
//     if (merchList == undefined) getData();
//   }, [isRender]);

//   const getData = () => {
//     if (loading.includes("getdata") || !user?.has_creator) return;
//     setLoading.append("getdata");
//     Get(`product`, {
//       creator_id: user?.has_creator?.id,
//     })
//       .then((res: any) => {
//         setMerchList(res.data);
//         console.log(res.data);
//         setLoading.filter((e) => e != "getdata");
//       })
//       .catch((err) => {
//         console.log(err);
//         setLoading.filter((e) => e != "getdata");
//       });
//   };

//   const getData = () => {
//     setLoading2(true);
//     Get("product", {})
//       .then((res: any) => {
//         setData((res.data as MerchListResponse[]).filter((e) => e.product_status_id == 2));
//         console.log(res.data);
//         setLoading2(false);
//       })
//       .catch((err) => {
//         console.log(err);
//         setLoading2(false);
//       });
//   };

//   const handleToggleStatus = async (id: number, status: boolean) => {
//     setLoading.append("toggle-status");
//     Post(`product_toggle_status/${id}`, { status: status ? 2 : 3 })
//       .then((res: any) => {
//         if (res.status && merchList) {
//           setMerchList(merchList.map((e) => (e.id == id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
//         }
//         setLoading.filter((e) => e != "toggle-status");
//       })
//       .catch((err) => {
//         console.log(err);
//         setLoading.filter((e) => e != "toggle-status");
//       });
//   };

//   const tabStatus: [number, string][] = [
//     [2, "Sedang Dijual"],
//     [1, "Merchandise Draf"],
//     [3, "Non Aktif"],
//   ];

//   const splittedByStatus = useCallback(
//     (status: number) => {
//       return merchList?.filter((e) => e.product_status_id == status);
//     },
//     [merchList]
//   );

//   const handleDelete = async (id: number) => {
//     modals.openConfirmModal({
//       centered: true,
//       title: "Hapus Produk?",
//       children: "Apakah anda yakin ingin menghapus produk ini?",
//       labels: { confirm: "Hapus", cancel: "Batal" },
//       onConfirm: () => {
//         setLoading.append(`delete${id}`);
//         Delete(`product/${id}`, {})
//           .then(() => {
//             setMerchList([...(merchList ?? []).filter((e) => e.id != id)]);
//             setLoading.filter((e) => e != `delete${id}`);
//           })
//           .catch((err) => {
//             console.log(err);
//             setLoading.filter((e) => e != `delete${id}`);
//           });
//       },
//     });
//   };

//   return (
//     <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>
//       {modalCreate != undefined && <CreateMerchandise id={modalCreate} onClose={() => setModalCreate(undefined)} />}

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
//                 stroke-width="2"
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//               />
//             </svg>
//           </button>
//         </div>

//         <Flex gap={10} align="center">
//           {/* <ButtonM
//             leftSection={<Icon icon="hugeicons:cashier" className={`text-[20px]`} />}
//             radius="xl"
//             color="#0B387C"
//             component={Link}
//             href="/dashboard/merch-pos"
//           >
//             Penjualan Offline
//           </ButtonM> */}
//           <ButtonM onClick={() => setModalCreate("")} leftSection={<Icon icon="icon-park-outline:add-one" className={`text-[24px]`} />} radius="xl" color="#0B387C">
//             Buat Merchandise
//           </ButtonM>
//         </Flex>
//       </div>

//       <Tabs
//         variant="solid"
//         aria-label="Tabs variants"
//         className="border border-b-2 border-primary-light-200 border-x-0 border-t-0"
//         classNames={{
//           tabList: "pb-0 self-center font-semibold rounded-b-none bg-white",
//           tab: "p-5",
//           cursor: "!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base",
//         }}
//       >
//         {tabStatus.map((e, i) => (
//           <Tab key={i} title={e[1]}>
//             <Card className={`!overflow-auto`} p={0} withBorder>
//               <Table removeWrapper className={`rounded-[8px] [&_td]:py-[15px] min-w-[700px]`}>
//                 <TableHeader>
//                   <TableColumn>Info Produk</TableColumn>
//                   <TableColumn>Harga</TableColumn>
//                   <TableColumn>Stock</TableColumn>
//                   <TableColumn>Aktif</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   {(splittedByStatus(e[0]) ?? []).map((e, i) => (
//                     <TableRow key={i}>
//                       <TableCell>
//                         <div className="flex items-center gap-[10px]">
//                           {e.product_image.length > 0 && <MImage src={e.product_image[0].image_url} className="!h-10 !w-10 bg-[#d0d0d0] rounded-[5px] shrink-0" />}
//                           <p>{e.product_name}</p>
//                         </div>
//                       </TableCell>
//                       <TableCell className={`whitespace-nowrap`}>
//                         <NumberFormatter value={parseInt((e.product_varian.length ?? 0) > 0 ? e.product_varian[0].price : e.price)} prefix="Rp " />
//                       </TableCell>
//                       <TableCell>{(e.product_varian.length ?? 0) > 0 ? _.sumBy(e.product_varian, "stock_qty") : e.qty}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-[10px]">
//                           <Switch checked={e.product_status_id == 2} disabled={loading.includes("toggle-status")} onChange={(z) => handleToggleStatus(e.id, z.target.checked)} />

//                           <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${e.slug}`}>
//                             <Icon icon="akar-icons:eye" className={`text-[24px]`} />
//                           </ActionIcon>

//                           <ActionIcon variant="transparent" color="gray" onClick={() => setModalCreate(e.slug)}>
//                             <Icon icon="akar-icons:edit" className={`text-[24px]`} />
//                           </ActionIcon>

//                           <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(e.id)} loading={loading.includes(`delete${e.id}`)}>
//                             <Icon icon="uiw:delete" className={`text-[18px]`} />
//                           </ActionIcon>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>

//               {(!splittedByStatus(e[0]) || splittedByStatus(e[0])?.length == 0 || merchList?.length == 0) && (
//                 <Center mih={200} w="100%">
//                   <div className="py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full">
//                     <div className="border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2">
//                       <Image src={merchIcon} alt="bank" className="w-7" />
//                     </div>
//                     <div className="text-center">
//                       <p className="font-semibold text-lg">Belum ada merchandise yang dibuat</p>
//                       <p className="text-grey max-w-72 mt-[10px]">Mulai buat merchandise dengan klik button “Buat Merchandise” di bawah. </p>
//                     </div>
//                     <Button label="Buat Merchandise" color="primary" className="mt-4" onClick={() => setModalCreate("")} startIcon={faCirclePlus} />
//                   </div>
//                 </Center>
//               )}
//             </Card>
//           </Tab>
//         ))}
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
import React, { useCallback, useEffect, useState } from "react";
import { MerchListResponse } from "./type";
import { modals } from "@mantine/modals";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import merchIcon from "../../../assets/svg/merch.svg";
import Button from "@/components/Button";
import useLoggedUser from "@/utils/useLoggedUser";
import _ from "lodash";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const Merch = () => {
  const [isRender, setIsRender] = useState(false);
  const [modalCreate, setModalCreate] = useState<string>();
  const [merchList, setMerchList] = useState<MerchListResponse[]>([]);
  const [loading, setLoading] = useState<string[]>([]);
  const [loading2, setLoading2] = useState<boolean>(false);

  // pagination states
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const user = useLoggedUser();

  useEffect(() => {
    setIsRender(true);
  }, []);

  useEffect(() => {
    if (isRender) getData();
  }, [isRender, page]);

  const getData = () => {
    setLoading2(true);
    Get(`product`, { creator_id: user?.has_creator?.id  })
      .then((res: any) => {
        console.log(res);
        const list = res.data as MerchListResponse[];
        setMerchList(list);
        if (res.meta) {
          setLastPage(res.meta.last_page || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading2(false));
  };

  const handleToggleStatus = async (id: number, status: boolean) => {
    setLoading((prev) => [...prev, "toggle-status"]);
    Post(`product_toggle_status/${id}`, { status: status ? 2 : 3 })
      .then((res: any) => {
        if (res.status) {
          setMerchList((prev) => prev.map((e) => (e.id === id ? { ...e, product_status_id: status ? 2 : 3 } : e)));
        }
      })
      .catch(console.error)
      .finally(() => setLoading((prev) => prev.filter((e) => e !== "toggle-status")));
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
          .catch(console.error)
          .finally(() => setLoading((prev) => prev.filter((e) => e !== `delete${id}`)));
      },
    });
  };

  const tabStatus: [number, string][] = [
    [2, "Sedang Dijual"],
    [1, "Merchandise Draf"],
    [3, "Non Aktif"],
  ];

  const splittedByStatus = useCallback((status: number) => merchList.filter((e) => e.product_status_id === status), [merchList]);

  return (
    <div className="p-[30px_20px] text-black flex flex-col gap-[25px]">
      {modalCreate !== undefined && (
        <CreateMerchandise
          id={modalCreate}
          onClose={() => {
            setModalCreate(undefined);
            getData(); // ✅ reload data setiap modal create ditutup
          }}
        />
      )}

      <Title order={1} size="h2">
        Merchandise Saya
      </Title>

      <div className="flex flex-wrap items-center justify-between gap-[20px]">
        <div className="flex gap-[10px] items-center">
          <Input variant="bordered" size="md" type="text" placeholder="Cari Merchandise" />
          <button>
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
          </button>
        </div>

        <Flex gap={10} align="center">
          <ButtonM onClick={() => setModalCreate("")} leftSection={<Icon icon="icon-park-outline:add-one" className="text-[24px]" />} radius="xl" color="#0B387C">
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
          const filtered = splittedByStatus(status);
          return (
            <Tab key={status} title={label}>
              <Card className="!overflow-auto" p={0} withBorder>
                <Table removeWrapper className="rounded-[8px] [&_td]:py-[15px] min-w-[700px]">
                  <TableHeader>
                    <TableColumn>Info Produk</TableColumn>
                    <TableColumn>Harga</TableColumn>
                    <TableColumn>Stock</TableColumn>
                    <TableColumn>Aktif</TableColumn>
                  </TableHeader>

                  <TableBody>
                    {filtered.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-[10px]">
                            {item.product_image.length > 0 && <MImage src={item.product_image[0].image_url} className="!h-10 !w-10 bg-[#d0d0d0] rounded-[5px]" />}
                            <p>{item.product_name}</p>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <NumberFormatter value={parseInt(item.product_varian?.[0]?.price || item.price || "0") || 0} prefix="Rp " />
                        </TableCell>

                        <TableCell>{item.product_varian?.length ? _.sumBy(item.product_varian, "stock_qty") : item.qty}</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-[10px]">
                            <Switch checked={item.product_status_id === 2} disabled={loading.includes("toggle-status")} onChange={(z) => handleToggleStatus(item.id, z.target.checked)} />
                            <ActionIcon variant="transparent" component={Link} href={`/dashboard/merch/${item.slug}`}>
                              <Icon icon="akar-icons:eye" className="text-[24px]" />
                            </ActionIcon>
                            <ActionIcon variant="transparent" color="gray" onClick={() => setModalCreate(item.slug)}>
                              <Icon icon="akar-icons:edit" className="text-[24px]" />
                            </ActionIcon>
                            <ActionIcon variant="transparent" color="red" onClick={() => handleDelete(item.id)}>
                              <Icon icon="uiw:delete" className="text-[18px]" />
                            </ActionIcon>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

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
                      <Button label="Buat Merchandise" color="primary" className="mt-4" onClick={() => setModalCreate("")} startIcon={faCirclePlus} />
                    </div>
                  </Center>
                )}

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 py-6">
                  <ButtonM disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Sebelumnya
                  </ButtonM>
                  <span>
                    Halaman {page} dari {lastPage}
                  </span>
                  <ButtonM disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
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
