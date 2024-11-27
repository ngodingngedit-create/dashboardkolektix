import { Icon } from '@iconify/react/dist/iconify.js';
import { AspectRatio, Badge, Button, Card, Center, Divider, Flex, Image, Stack, Text, TextInput } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { VenueListResponse } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';

const MyVenue = () => {
  const [loading, setLoading] = useListState<string>();
  const [venue, setVenue] = useListState<VenueListResponse>();
  const user = useLoggedUser();

  useEffect(() => {
    getData();
  }, [user]);

  const getData = async () => {
    await fetch<any, VenueListResponse[]>({
      url: 'venue',
      method: 'GET',
      success: ({ data }) => data && setVenue.setState(data.filter(e => e.creator_id == user?.has_creator?.id)),
      before: () => setLoading.append('getdata'),
      complete: () => setLoading.filter(e => e != 'getdata'),
    });
  }

  return (
    <Stack className={`p-[20px] md:p-[30px]`} gap={30}>
      <Flex gap={20} justify="space-between" align="center">
        <Stack gap={5}>
          <Text size="1.8rem" fw={600}>Semua Venue</Text>
          <Text size="sm" c="gray">Kelola Semua Venue Anda</Text>
        </Stack>

        <Flex align="center" gap={10}>
          <TextInput
            radius="xl"
            leftSection={<Icon icon="uiw:search" />}
            placeholder='Cari Nama Venue'
          />
          <Button
            radius="xl"
            color="#194e9e"
            leftSection={<Icon icon="uiw:plus" />}
            component={Link}
            href="/dashboard/venue/create">
            Tambah Venue
          </Button>
        </Flex>
      </Flex>

      <Divider />

      <Flex gap={20} wrap="wrap" className={`[&>*]:!flex-xgrow [&>*]:!w-full md:[&>*]:!max-w-[250px]`}>
        {venue?.map((e ,i) => (
          <Card key={i} withBorder radius={10} component={Link} href={`/dashboard/venue/${e.slug}`} p={0}>
            <AspectRatio>
              <Image src={e.venue_gallery[0] ? e.venue_gallery[0].image_url : e.image_url} alt={`${e.name} - Image`} />
            </AspectRatio>

            <Card>
              <Stack gap={3}>
                <Text size="sm" c="gray" fw={400}>{e.location}</Text>
                <Text fw={600}>{e.name}</Text>
                {e.has_venue_category && (
                  <Badge variant="outline" className={`mt-1 [&_*]:!font-[400]`}>
                    {e.has_venue_category?.name}
                  </Badge>
                )}
              </Stack>
            </Card>
          </Card>
        ))}
      </Flex>

      {((venue.length == 0 || !venue) && !loading.includes('getdata')) && (
        <Center mih={200} w="100%">
        <div className='py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full'>
          <div className='border-2 border-primary-light-200 bg-primary-light rounded-md p-2 flex items-center justify-center mb-2'>
            <Icon icon="mage:building-b" className={`text-[36px] text-primary-base`} />
          </div>
          <div className='text-center'>
            <p className='font-semibold text-lg'>Belum ada merchandise yang dibuat</p>
            <p className='text-grey max-w-72 mt-[10px]'>
              Mulai buat merchandise dengan klik button “Buat Merchandise” di bawah.{' '}
            </p>
          </div>

          <Button
            mt={10}
            radius="xl"
            color="#194e9e"
            leftSection={<Icon icon="uiw:plus" />}
            component={Link}
            href="/dashboard/venue/create">
            Tambah Venue
          </Button>
        </div>
      </Center>
      )}
    </Stack>
  );
};

export default MyVenue;
