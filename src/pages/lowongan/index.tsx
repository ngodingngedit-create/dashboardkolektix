import React, { useState, useEffect } from 'react';
import TalentCard from '@/components/Card/TalentCard';
import JobsCard from '@/components/Card/JobsCard';
import { formatDateDiff } from '@/utils/useFormattedDate';
import empty from '@/assets/icon/vacancy.png';
import { VacancyProps } from '@/utils/globalInterface';
import { Get } from '@/utils/REST';
import JobList from '@/components/Card/JobsCard/JobList';
import { Breadcrumbs, BreadcrumbItem, Skeleton, Card } from '@nextui-org/react';
import Image from 'next/image';
import FilterLowongan from '@/components/FilterLowongan';

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
    <div className='pt-10 max-w-2xl mx-auto text-dark min-h-screen px-4 sm:px-8 md:px-12 lg:px-0'>
      <FilterLowongan setNameFilter={handleNameFilterChange} />

      {loading ? (
         <div className='flex flex-col divide-y divide-primary-light-200 content-center justify-items-center my-5 border border-primary-light-200 shadow-md rounded-md'>
         {[...Array(5)].map((_, index) => (
           <Card key={index} isHoverable isPressable className='mb-4'>
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
            <div className='flex flex-col divide-y divide-primary-light-200 content-center justify-items-center my-5 border border-primary-light-200 shadow-md rounded-md'>
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
                  img={item.has_creator?.image ?? '/default-image.png'}
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
      )}
    </div>
  );
};

export default Lowongan;
