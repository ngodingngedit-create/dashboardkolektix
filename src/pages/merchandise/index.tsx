import { useEffect, useState } from 'react';
import { MerchProps } from '@/utils/globalInterface';
import MerchandiseCard from '@/components/Card/MerchandiseCard';
import { Breadcrumbs, BreadcrumbItem, ScrollShadow } from '@nextui-org/react';
import { Get } from '@/utils/REST';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import FilterMerchandise from '@/components/FilterMerchandise';
import { MerchListResponse } from '../dashboard/merch/type';

const Merchandise = () => {
  const [categoryActive, setCategoryActive] = useState<string>();
  const [data, setData] = useState<MerchListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const getData = () => {
    setLoading(true);
    Get('product', {})
      .then((res: any) => {
        setData(res.data);
        console.log(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const category = ['Merchandise', 'Merchandise 2', 'Merchandise 3', 'Merchandise 4'];

  return (
    <div className='pt-10 max-w-5xl mx-auto text-dark'>
      <FilterMerchandise />

      <div className='pl-7'>
        <Breadcrumbs>
          <BreadcrumbItem>Beranda</BreadcrumbItem>
          <BreadcrumbItem>List Merchandise</BreadcrumbItem>
        </Breadcrumbs>
      </div>

      <ScrollShadow orientation='horizontal' className='max-w-full flex gap-2 px-4 pb-3 mt-3 mx-2'>
        {category.map((e, i) => (
          <div
            key={i}
            onClick={() => setCategoryActive(e)}
            className={`cursor-pointer flex rounded-2xl items-center justify-center py-1 px-3 border ${
              categoryActive !== e
                ? 'text-dark-grey border-primary-light-200'
                : 'text-primary-dark border-primary-dark'
            }`}
          >
            <p className='whitespace-nowrap'>{e}</p>
          </div>
        ))}
      </ScrollShadow>
      {data.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 content-center justify-items-center gap-[10px] md:gap-[15px] my-5 px-[20px]'>
          {data.map((item) => (
            <MerchandiseCard
              key={item.id}
              name={item.product_name}
              price={parseInt((item?.product_varian?.length ?? 0) > 0 ? item.product_varian[0].price : item.price)}
              sale={0}
              creator={item.created_by}
              redirect={`/merchandise/${item.slug}`}
              image={item.product_image.length > 0 ? item.product_image[0].image_url : undefined}
            />
          ))}
        </div>
      ) : (
        <div className='min-h-[80vh] flex flex-col gap-3 items-center justify-center'>
          <FontAwesomeIcon icon={faCartShopping} size='2x' className='text-primary-base' />
          <h3 className='text-grey'>Belum ada merchandise</h3>
        </div>
      )}
    </div>
  );
};

export default Merchandise;
