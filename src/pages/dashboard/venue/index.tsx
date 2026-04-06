import { Icon } from '@iconify/react/dist/iconify.js';
import { ActionIcon, AspectRatio, Badge, Button, Card, Center, Divider, Flex, Image, NumberFormatter, Stack, Text, TextInput } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { VenueListResponse } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

const MyVenue = () => {
  const [loading, setLoading] = useListState<string>();
  const [search, setSearch] = useState<string>('');
  const [_venue, setVenue] = useListState<VenueListResponse>();
  const user = useLoggedUser();

  useEffect(() => {
    getData();
  }, [user]);

  const venue = useMemo(() => {
    if (!search) return _venue;
    return _venue?.filter(e => e.name?.toLowerCase().includes(search.toLowerCase()));
  }, [_venue, search]);

  const getData = async () => {
    if (loading.includes('getdata')) return;
    await fetch<any, VenueListResponse[]>({
      url: 'creator-data/venue',
      method: 'GET',
      success: ({ data }) => data && setVenue.setState(data),
      before: () => setLoading.append('getdata'),
      complete: () => setLoading.filter(e => e != 'getdata'),
    });
  }

  const handleDelete = (id: number) => {
    modals.openConfirmModal({
        title: 'Hapus Venue',
        children: (
            <Text size="sm">
                Apakah Anda yakin ingin menghapus venue ini? Tindakan ini tidak dapat dibatalkan.
            </Text>
        ),
        labels: { confirm: 'Hapus', cancel: 'Batal' },
        confirmProps: { color: 'red', radius: 'xl' },
        cancelProps: { radius: 'xl' },
        onConfirm: async () => {
            await fetch({
                url: `venue/${id}`, // adjust endpoint if needed
                method: 'POST',
                data: { _method: 'DELETE' },
                success: () => {
                    notifications.show({
                        title: 'Berhasil',
                        message: 'Venue berhasil dihapus',
                        color: 'green',
                    });
                    getData();
                },
                error: () => {
                    notifications.show({
                        title: 'Gagal',
                        message: 'Gagal menghapus venue',
                        color: 'red',
                    });
                }
            });
        },
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
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
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
            Buat Venue
          </Button>
        </Flex>
      </Flex>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full">
        {venue?.map((e: any, i) => (
          <Card key={i} withBorder radius={10} p={0} className={`relative group hover:shadow-md transition-shadow`}>
            <AspectRatio ratio={16/9}>
              {e.venue_gallery && e.venue_gallery.length > 0 ? (
                <Image src={e.venue_gallery[0].image_url} alt={`${e.name} - Image`} />
              ) : (
                <Image src={e.image_url || 'https://placehold.co/600x400?text=No+Image'} alt={`${e.name} - Image`} />
              )}
            </AspectRatio>

            <Card p="md">
              <Stack gap={5}>
                <Text size="xs" c="gray" fw={500}>{e.location_name || e.location}</Text>
                <Text fw={600} lineClamp={1}>{e.name}</Text>
                
                {e.starting_price && (
                   <Text size="sm" c="blue" fw={700}>
                      <NumberFormatter prefix="Rp " value={Number(e.starting_price)} thousandSeparator="." decimalSeparator="," />
                      <Text component="span" size="xs" c="dimmed" fw={400}> / hari</Text>
                   </Text>
                )}

                {e.has_venue_category && (
                  <Badge variant="outline" size="sm" className={`mt-1`}>
                    {e.has_venue_category?.name}
                  </Badge>
                )}
                
                {(e.venue_areas?.length > 0 || e.venue_facilities?.length > 0) && (
                  <>
                    <Divider mt="xs" mb={4} />
                    <Flex gap={15} align="center" wrap="wrap">
                        {e.venue_areas?.length > 0 && (
                            <Text size="xs" c="dimmed" className="flex items-center gap-1">
                              <Icon icon="tabler:layout-dashboard" /> {e.venue_areas.length} Area
                            </Text>
                        )}
                        {e.venue_facilities?.length > 0 && (
                            <Text size="xs" c="dimmed" className="flex items-center gap-1">
                              <Icon icon="tabler:building" /> {e.venue_facilities.length} Fasilitas
                            </Text>
                        )}
                    </Flex>
                  </>
                )}

                <Divider mt="xs" />

                <Flex justify="flex-end" gap={10} mt="sm">
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    radius="md"
                    component={Link}
                    href={`/dashboard/venue/edit/${e.slug || e.id}`}
                  >
                    <Icon icon="solar:pen-bold" />
                  </ActionIcon>
                  <ActionIcon
                    variant="filled"
                    color="red"
                    radius="md"
                    onClick={(evt) => {
                      evt.preventDefault();
                      handleDelete(e.id);
                    }}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" />
                  </ActionIcon>
                </Flex>
              </Stack>
            </Card>
          </Card>
        ))}
      </div>

      {((venue.length == 0 || !venue) && !loading.includes('getdata')) && (
        <Center mih={200} w="100%">
        <div className='py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full'>
          <div className='border-2 border-primary-light-200 bg-primary-light rounded-md p-2 flex items-center justify-center mb-2'>
            <Icon icon="mage:building-b" className={`text-[36px] text-primary-base`} />
          </div>
          <div className='text-center'>
            <p className='font-semibold text-lg'>Tidak ada venue yang tersedia</p>
            <p className='text-grey max-w-72 mt-[10px]'>
              Mulai buat venue dengan klik button “Buat Venue di bawah.{' '}
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
