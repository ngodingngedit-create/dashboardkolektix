import CreateMerchandise from '@/components/CreateMerchandise';
import { Delete, Get, Post } from '@/utils/REST';
import { Card, Center, NumberFormatter, Text, Switch, ActionIcon, Stack, Flex, Title, Image as MImage } from '@mantine/core';
import { Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from '@nextui-org/react';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MerchListResponse } from './type';
import Cookies from 'js-cookie';
import { useListState } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import merchIcon from '../../../assets/svg/merch.svg';
import Button from '@/components/Button';
import useLoggedUser from '@/utils/useLoggedUser';

const Merch = () => {
  const [isRender, setIsRender] = useState(false);
  const [modalCreate, setModalCreate] = useState<string>();
  const [merchList, setMerchList] = useState<MerchListResponse[]>();
  const [loading, setLoading] = useListState<string>();
  const user = useLoggedUser();

  useEffect(() => {
    setIsRender(true);
  }, [])

  useEffect(() => {
    if (merchList == undefined) getData();
  }, [isRender]);

  const getData = () => {
    if (loading.includes('getdata') || !user?.has_creator) return;
    setLoading.append('getdata');
    Get(`product`, {
      creator_id: user?.has_creator.id
    })
    .then((res: any) => {
      setMerchList(res.data);
      console.log(res.data);
      setLoading.filter(e => e != 'getdata');
    })
    .catch((err) => {
      console.log(err);
      setLoading.filter(e => e != 'getdata');
    });
  }

  const handleToggleStatus = async (id: number, status: boolean) => {
    setLoading.append('toggle-status');
    Post(`product/toggle-status/${id}`, { status: status ? 1 : 0 })
    .then((res: any) => {
      if (res.status) {
        setMerchList([...(merchList ?? []).map(e => e.id == id ? {...e, status: status ? 1 : 0 } : e)])
      }
      setLoading.filter(e => e != 'toggle-status');
    })
    .catch((err) => {
      console.log(err);
      setLoading.filter(e => e != 'toggle-status');
    });
  }

  const tabStatus: [number, string][] = [
    [1, "Sedang Dijual"],
    [5, "Merchandise Draf"],
    [0, "Non Aktif"]
  ];

  const splittedByStatus = useCallback((status: number) => {
    return merchList?.filter(e => e.product_status_id == status);
  }, [merchList]);

  const handleDelete = async (id: number) => {
    modals.openConfirmModal({
      centered: true,
      title: 'Hapus Produk?',
      children: 'Apakah anda yakin ingin menghapus produk ini?',
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      onConfirm: () => {
        setLoading.append(`delete${id}`);
        Delete(`product/${id}`, {})
        .then(() => {
          setMerchList([...(merchList ?? []).filter(e => e.id != id)]);
          setLoading.filter(e => e != `delete${id}`);
        })
        .catch((err) => {
          console.log(err);
          setLoading.filter(e => e != `delete${id}`);
        });
      }
    })
  }

  return (
    <div className={`p-[30px_20px] text-black flex flex-col gap-[25px]`}>

      {modalCreate != undefined && <CreateMerchandise id={modalCreate} onClose={() => setModalCreate(undefined)} />}

      <Title order={1} size="h2">Merchandise Saya</Title>

      <div className="flex flex-wrap items-center justify-between gap-[20px]">
        <div className="flex gap-[10px] items-center">
          <Input variant="bordered" size="md" type="text" placeholder="Cari Merchandise" />
          <button>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="#0B387C"/>
              <path d="M27.5 27.5L23.875 23.875M25.8333 19.1667C25.8333 22.8486 22.8486 25.8333 19.1667 25.8333C15.4848 25.8333 12.5 22.8486 12.5 19.1667C12.5 15.4848 15.4848 12.5 19.1667 12.5C22.8486 12.5 25.8333 15.4848 25.8333 19.1667Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <button onClick={() => setModalCreate('')} className={`text-[#0B387C] flex items-center gap-[8px] p-[10px_16px] border border-[#E2EDFF] hover:border-[#0B387C] rounded-full`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_10926_6066)">
            <path d="M9.99984 6.66699V13.3337M6.6665 10.0003H13.3332M18.3332 10.0003C18.3332 14.6027 14.6022 18.3337 9.99984 18.3337C5.39746 18.3337 1.6665 14.6027 1.6665 10.0003C1.6665 5.39795 5.39746 1.66699 9.99984 1.66699C14.6022 1.66699 18.3332 5.39795 18.3332 10.0003Z" stroke="#0B387C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_10926_6066">
            <rect width="20" height="20" fill="white"/>
            </clipPath>
            </defs>
          </svg>
          <p>Buat Merchandise</p>
        </button>
      </div>

      <Tabs
        variant='solid'
        aria-label='Tabs variants'
        className='border border-b-2 border-primary-light-200 border-x-0 border-t-0'
        classNames={{
          tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
          tab: 'p-5',
          cursor: '!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base',
        }}
      >
        {tabStatus.map((e, i) => (
          <Tab key={i} title={e[1]}>

            <Card className={`!overflow-auto`} p={0} withBorder>
              <Table removeWrapper className={`rounded-[8px] [&_td]:py-[15px] min-w-[700px]`}>
                <TableHeader>
                  <TableColumn>Info Produk</TableColumn>
                  <TableColumn>Harga</TableColumn>
                  <TableColumn>Stock</TableColumn>
                  <TableColumn>Aktif</TableColumn>
                </TableHeader>
                <TableBody>
                  {(splittedByStatus(e[0]) ?? []).map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-[10px]">
                          {e.product_image.length > 0 && (
                            <MImage src={e.product_image[0].image_url} className="!h-10 !w-10 bg-[#d0d0d0] rounded-[5px] shrink-0" />
                          )} 
                          <p>{e.product_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className={`whitespace-nowrap`}>
                        <NumberFormatter value={parseInt(e.price)} prefix="Rp " />
                      </TableCell>
                      <TableCell>{e.qty}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-[10px]">
                          <Switch checked={e.product_status_id == 1} disabled={loading.includes('toggle-status')} onChange={z => handleToggleStatus(e.id, z.target.checked)}/>
                          <ActionIcon variant="transparent" onClick={() => handleDelete(e.id)} loading={loading.includes(`delete${e.id}`)}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.3333 5.00033V4.33366C13.3333 3.40024 13.3333 2.93353 13.1517 2.57701C12.9919 2.2634 12.7369 2.00844 12.4233 1.84865C12.0668 1.66699 11.6001 1.66699 10.6667 1.66699H9.33333C8.39991 1.66699 7.9332 1.66699 7.57668 1.84865C7.26308 2.00844 7.00811 2.2634 6.84832 2.57701C6.66667 2.93353 6.66667 3.40024 6.66667 4.33366V5.00033M8.33333 9.58366V13.7503M11.6667 9.58366V13.7503M2.5 5.00033H17.5M15.8333 5.00033V14.3337C15.8333 15.7338 15.8333 16.4339 15.5608 16.9686C15.3212 17.439 14.9387 17.8215 14.4683 18.0612C13.9335 18.3337 13.2335 18.3337 11.8333 18.3337H8.16667C6.76654 18.3337 6.06647 18.3337 5.53169 18.0612C5.06129 17.8215 4.67883 17.439 4.43915 16.9686C4.16667 16.4339 4.16667 15.7338 4.16667 14.3337V5.00033" stroke="#666666" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </ActionIcon>
                          <button onClick={() => setModalCreate(e.slug)}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g clip-path="url(#clip0_9535_48088)">
                              <path d="M9.1665 3.3332H5.6665C4.26637 3.3332 3.56631 3.3332 3.03153 3.60568C2.56112 3.84536 2.17867 4.22782 1.93899 4.69822C1.6665 5.233 1.6665 5.93307 1.6665 7.3332V14.3332C1.6665 15.7333 1.6665 16.4334 1.93899 16.9682C2.17867 17.4386 2.56112 17.821 3.03153 18.0607C3.56631 18.3332 4.26637 18.3332 5.6665 18.3332H12.6665C14.0666 18.3332 14.7667 18.3332 15.3015 18.0607C15.7719 17.821 16.1543 17.4386 16.394 16.9682C16.6665 16.4334 16.6665 15.7333 16.6665 14.3332V10.8332M6.66648 13.3332H8.06193C8.46959 13.3332 8.67341 13.3332 8.86522 13.2871C9.03528 13.2463 9.19786 13.179 9.34698 13.0876C9.51517 12.9845 9.6593 12.8404 9.94755 12.5521L17.9165 4.5832C18.6069 3.89284 18.6069 2.77355 17.9165 2.0832C17.2261 1.39284 16.1069 1.39284 15.4165 2.0832L7.44753 10.0521C7.15928 10.3404 7.01515 10.4845 6.91208 10.6527C6.8207 10.8018 6.75336 10.9644 6.71253 11.1345C6.66648 11.3263 6.66648 11.5301 6.66648 11.9378V13.3332Z" stroke="#666666" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                              </g>
                              <defs>
                              <clipPath id="clip0_9535_48088">
                              <rect width="20" height="20" fill="white"/>
                              </clipPath>
                              </defs>
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!splittedByStatus(e[0]) || splittedByStatus(e[0])?.length == 0 || merchList?.length == 0) && (
                <Center mih={200} w="100%">
                  <div className='py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full'>
                    <div className='border-2 border-primary-light-200 bg-primary-light rounded-md h-10 flex items-center justify-center mb-2'>
                      <Image src={merchIcon} alt='bank' className='w-7' />
                    </div>
                    <div className='text-center'>
                      <p className='font-semibold text-lg'>Belum ada merchandise yang dibuat</p>
                      <p className='text-grey max-w-72 mt-[10px]'>
                        Mulai buat merchandise dengan klik button “Buat Merchandise” di bawah.{' '}
                      </p>
                    </div>
                    <Button
                      label='Buat Merchandise'
                      color='primary'
                      className='mt-4'
                      onClick={() => setModalCreate('')}
                      startIcon={faCirclePlus}
                    />
                  </div>
                </Center>
              )}
            </Card>

          </Tab>
        ))}
      </Tabs>

    </div>
  );
};

export default Merch;
