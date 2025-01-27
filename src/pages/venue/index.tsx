import React, { useEffect, useMemo, useState } from 'react';
import VenueCard from '@/components/Card/VenueCard';
import { Get } from '@/utils/REST';
import { VenueProps } from '@/utils/globalInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Button, Container, Flex, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import _ from 'lodash';

const Venue = () => {
  const [_data, setData] = useState<VenueProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>();

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

  const venueCategory = useMemo(() => {
    return _.uniq(_data.map((item) => item.has_venue_category.name));
  }, [_data]);

  const data = useMemo(() => {
    if (selectedCategory) {
      return _data.filter((item) => item.has_venue_category.name === selectedCategory);
    } else {
      return _data;
    }
  }, [_data, selectedCategory]);

  return (
    <Container mih="90vh" mt={40} size="lg">
      <Stack gap={15}>
        <Title size="h2" fw={600}>Semua Venue</Title>

        <Flex align="center" gap={10}>
          {venueCategory.map((item, index) => (
            <Button onClick={() => setSelectedCategory(item == selectedCategory ? undefined : item)}
              key={index}
              variant={item == selectedCategory ? 'light' : 'outline'}
              radius="xl"
              size="xs"
              color="gray"
              c="gray.8"
              className={`capitalize`}>
              {item}
            </Button>
          ))}
        </Flex>

        {data.length > 0 ? (
          <SimpleGrid className={`!grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4`}>
            {data.map((item) => (
                <VenueCard
                  id={item.id}
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
