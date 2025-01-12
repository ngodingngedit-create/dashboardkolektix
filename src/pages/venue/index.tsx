import React, { useEffect, useState } from 'react';
import VenueCard from '@/components/Card/VenueCard';
import { Breadcrumbs, BreadcrumbItem, Select, SelectItem } from '@nextui-org/react';
import { Get } from '@/utils/REST';
import { VenueProps } from '@/utils/globalInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Button, Flex, Text } from '@mantine/core';

const Venue = () => {
  const [data, setData] = useState<VenueProps[]>([]);
  const getVenue = () => {
    Get('venue', {})
      .then((res: any) => {
        console.log(res);
        setData(res.data);
      })
      .catch((err: any) => console.log(err));
  };

  useEffect(() => {
    getVenue();
  }, []);
  return (
    <div className='min-h-screen'>
      <div className='pt-5 md:pt-12 lg:mt-0 md:mt-5 sm:mt-20 max-w-4xl mx-auto text-dark'>
        <Text mb={10} fw={600}>Semua Venue</Text>
        {/* <Flex align="center" gap={10} mb={15}>
          <Button variant="outline" radius="xl" size="xs" color="gray" c="gray.8">
            Photographer
          </Button>
          <Button variant="outline" radius="xl" size="xs" color="gray" c="gray.8">
            Videographer
          </Button>
          <Button variant="outline" radius="xl" size="xs" color="gray" c="gray.8">
            Sound Engineer
          </Button>
        </Flex> */}

        {data.length > 0 ? (
         <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 content-center justify-items-center gap-y-10 my-5'>
         {data.map((item) => (
           <div key={item.id}>
             <VenueCard
                slug={item.slug}
                title={item.name}
                location={item?.location_name ?? ''}
                price={Math.round(item.starting_price)}
                image={item.venue_gallery[0] ? item.venue_gallery[0].image_url : item.image_url}
             />
           </div>
         ))}
       </div>
       
        ) : (
          <div className='min-h-[80vh] flex flex-col gap-3 items-center justify-center'>
            <FontAwesomeIcon icon={faLocationDot} className='text-primary-base' size='2x' />
            <h3 className='text-grey'>Belum ada venue</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Venue;
