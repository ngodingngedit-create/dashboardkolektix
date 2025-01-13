import React, { useEffect, useState } from 'react';
import VenueCard from '@/components/Card/VenueCard';
import { Get } from '@/utils/REST';
import { VenueProps } from '@/utils/globalInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Button, Container, Flex, SimpleGrid, Stack, Text, Title } from '@mantine/core';

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
    <Container mih="90vh" mt={40} size="lg">
      <Stack gap={15}>
        <Title size="h2" fw={600}>Semua Venue</Title>

        <Flex align="center" gap={10}>
          <Button variant="outline" radius="xl" size="xs" color="gray" c="gray.8">
            Photographer
          </Button>
          <Button variant="outline" radius="xl" size="xs" color="gray" c="gray.8">
            Videographer
          </Button>
          <Button variant="outline" radius="xl" size="xs" color="gray" c="gray.8">
            Sound Engineer
          </Button>
        </Flex>

        {data.length > 0 ? (
          <SimpleGrid className={`!grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4`}>
            {data.map((item) => (
                <VenueCard
                  key={item.id}
                  slug={item.slug}
                  title={item.name}
                  location={item?.location_name ?? ''}
                  price={Math.round(item.starting_price)}
                  image={item.venue_gallery.map(e => e.image_url)}
                />
            ))}
          </SimpleGrid>
        ) : (
          <div className='min-h-[80vh] flex flex-col gap-3 items-center justify-center'>
            <FontAwesomeIcon icon={faLocationDot} className='text-primary-base' size='2x' />
            <h3 className='text-grey'>Belum ada venue</h3>
          </div>
        )}
      </Stack>
    </Container>
  );
};

export default Venue;
