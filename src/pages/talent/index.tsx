import { useEffect, useState } from 'react';
import TalentCard from '@/components/Card/TalentCard';
import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';
import { TalentProps } from '@/utils/globalInterface';
import { Get } from '@/utils/REST';
import empty from '@/assets/icon/vacancy.png';
import Image from 'next/image';
import FilterTalent from '@/components/FilterTalent';

const Event = () => {
  const [data, setData] = useState<TalentProps[]>([]);
  const [filteredData, setFilteredData] = useState<TalentProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Fetch data and filter based on name and category
  const getData = () => {
    setLoading(true);
    Get('talenta', {})
      .then((res: any) => {
        const allData = res.data;
        setData(allData);
        applyFilters(allData, nameFilter, categoryFilter); // Apply initial filters if any
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  // Apply filters to the fetched data
  const applyFilters = (allData: TalentProps[], name: string, category: string) => {
    let filtered = allData;

    if (name) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (category) {
      filtered = filtered.filter((item) => item.has_category.name === category);
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    getData();
  }, []);

  // Apply filters whenever name or category changes
  useEffect(() => {
    applyFilters(data, nameFilter, categoryFilter);
  }, [nameFilter, categoryFilter]);

  return (
    <>
      <div className='py-10 max-w-4xl mx-auto text-dark'>
        {/* <div className='pl-2'>
          <Breadcrumbs>
            <BreadcrumbItem>Beranda</BreadcrumbItem>
            <BreadcrumbItem>List Talent</BreadcrumbItem>
          </Breadcrumbs>
        </div> */}
        <FilterTalent
          setNameFilter={setNameFilter}
          setCategoryFilter={setCategoryFilter}
          categories={Array.from(new Set(data.map((item) => item?.has_category?.name)))}
        />
        {filteredData.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 !mt-10 content-center justify-items-center gap-y-10 '>
            {filteredData.map((item) => (
              <TalentCard
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.image} 
                skills={item?.has_category?.name ?? '-'}
              />
            ))}
          </div>
        ) : (
          <div className='min-h-[50vh] flex flex-col gap-3 items-center justify-center'>
            <Image src={empty} alt='Vacancy' />
            <h3 className='text-grey'>Belum ada talent</h3>
          </div>
        )}
      </div>
    </>
  );
};

export default Event;
