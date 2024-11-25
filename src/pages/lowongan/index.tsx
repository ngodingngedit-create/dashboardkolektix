import React, { useState, useEffect } from 'react';
import TalentCard from '@/components/Card/TalentCard';
import JobsCard from '@/components/Card/JobsCard';
import { formatDateDiff } from '@/utils/useFormattedDate';
import empty from '@/assets/icon/vacancy.png';
import { VacancyProps } from '@/utils/globalInterface';
import { Get } from '@/utils/REST';
import JobList from '@/components/Card/JobsCard/JobList';
import { Breadcrumbs, BreadcrumbItem, Skeleton } from '@nextui-org/react';
import FilterLowongan from '@/components/FilterLowongan';
import { SimpleGrid, Stack, Card, Image, Text, Flex, AspectRatio, NumberFormatter, Divider } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';
import moment from 'moment';
import Link from 'next/link';
import { Card as CardN } from '@nextui-org/react';

const Lowongan = () => {
  const [data, setData] = useState<VacancyProps[]>([]);
  const [filteredData, setFilteredData] = useState<VacancyProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading = true
  const [nameFilter, setNameFilter] = useState<string>('');

  const getData = () => {
    setLoading(true);
    Get('vacancy', {})
      .then((res: any) => {
        setData(res.data);
        setFilteredData(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleNameFilterChange = (name: string) => {
    setNameFilter(name);
  };

  useEffect(() => {
    const updatedData = nameFilter
      ? data.filter((item) =>
          item.name.toLowerCase().includes(nameFilter.toLowerCase())
        )
      : data;

    setFilteredData(updatedData);
  }, [nameFilter, data]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className='max-w-6xl mx-auto text-dark min-h-screen'>
      <Stack gap={30}>
        <FilterLowongan setNameFilter={handleNameFilterChange} />

        {!loading && filteredData.length == 0 && (
          <div className='min-h-[80vh] flex flex-col gap-3 items-center justify-center'>
          <Image src={empty} alt='Vacancy' />
          <h3 className='text-grey'>Belum ada lowongan</h3>
          </div>
        )}

        <SimpleGrid className={`md:!grid-cols-3`}>
          {loading && (
            <>
              <Skeleton className='h-[150px] rounded-[15px]' />
              <Skeleton className='h-[150px] rounded-[15px]' />
              <Skeleton className='h-[150px] rounded-[15px]' />
            </>
          )}
          {!loading && filteredData?.map((e, i) => (
            <Card key={i} className={`hover:!bg-[#fafafa] transition-colors`} withBorder radius={15} p={10} component={Link} href={`/lowongan/${e.slug}`}>
              <Flex gap={0}>
                <AspectRatio className={`shrink-0`}>
                  <Image src={e.has_creator.image_url} w={64} radius={8} />
                </AspectRatio>

                <Card py={0} px={15} w="100%" bg="none">
                  <Stack gap={0} w="100%">
                    <Text fw={600}>{e.name}</Text>
                    <Text size="sm" c="gray">{e.location}</Text>

                    <Divider my={7} />

                    <Flex align="center" gap={7}>
                      <Icon icon="hugeicons:building-02" />
                      <Text size="sm">{e.has_creator.name}</Text>
                    </Flex>

                    <Flex align="center" gap={7} mt={5}>
                      <Icon icon="hugeicons:money-03" />
                      <Text size="sm"><NumberFormatter value={e.min_salary} /> - <NumberFormatter value={e.max_salary} /></Text>
                    </Flex>

                    <Text size="xs" mt={10} className={`!text-primary-base`}>Dibuat {moment(e.created_at).format('DD MMM YYYY')}</Text>
                  </Stack>
                </Card>
              </Flex>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      {/* {loading ? (
         <div className='flex divide-y divide-primary-light-200 content-center justify-items-center my-5 border border-primary-light-200 shadow-md rounded-md'>
         {[...Array(5)].map((_, index) => (
           <Card key={index} isHoverable isPressable className='mb-4 w-full'>
             <Skeleton className='h-36 w-full' />
             <div className='p-4'>
               <Skeleton className='w-1/2 mb-2' />
               <Skeleton className='w-1/2 mb-2' />
               <Skeleton className='w-1/2' />
             </div>
           </Card>
         ))}
          </div>
      ) : (
        <>
          {filteredData.length > 0 ? (
            <div className='grid grid-cols-4 !gap-[15px] content-center justify-items-center mb-3 rounded-md'>
              {filteredData.map((item: VacancyProps) => (
                <JobList
                  key={item.id}
                  name={item.name}
                  event={item.has_event?.name ?? 'N/A'}
                  slug={item.slug}
                  location={item.location}
                  salary={item.min_salary}
                  maxSalary={item.max_salary}
                  createdAt={item.created_at}
                  status={item.status}
                  creator={item.has_creator?.name ?? 'Unknown'}
                  img={item.has_creator?.image_url ?? '/default-image.png'}
                />
              ))}
            </div>
          ) : (
            <div className='min-h-[80vh] flex flex-col gap-3 items-center justify-center'>
              <Image src={empty} alt='Vacancy' />
              <h3 className='text-grey'>Belum ada lowongan</h3>
            </div>
          )}
        </>
      )} */}
    </div>
  );
};

export default Lowongan;
