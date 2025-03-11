import React, { useEffect, useMemo, useState } from 'react';
import VenueCard from '@/components/Card/VenueCard';
import { Get } from '@/utils/REST';
import { VenueProps } from '@/utils/globalInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Button, Card, Container, Divider, Flex, SimpleGrid, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';

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
    return _.uniq(_data.map((item) => item.has_venue_category));
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

        <Divider />

        <Flex align="center" gap={10} className={`overflow-x-auto [&>*]:shrink-0`}>
          {venueCategory.map((item, index) => (
            <UnstyledButton key={index} onClick={() => setSelectedCategory(item.name == selectedCategory ? undefined : item.name)}>
              <Card py={8} radius={0} className={`${item.name == selectedCategory ? ' !text-primary-base !border-b !border-b-primary-base' : '!text-grey hover:!bg-grey/10'}`}>
                <Flex gap={10} align="center">
                  <Icon icon={item.icon_menu ?? ''} className={`text-[30px]`} />
                  <Text size="sm" fw={400}>{item.name}</Text>
                </Flex>
              </Card>
            </UnstyledButton>
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
