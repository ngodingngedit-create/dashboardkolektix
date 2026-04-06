import { Icon } from '@iconify/react/dist/iconify.js';
import { ActionIcon, AspectRatio, Badge, Button, Card, Center, Divider, Flex, Image, Stack, Text, TextInput } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { Blog, BlogListResponse } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

const BlogDashboard = () => {
    const [loading, setLoading] = useListState<string>();
    const [search, setSearch] = useState<string>('');
    const [_blogs, setBlogs] = useListState<Blog>();
    const user = useLoggedUser();

    useEffect(() => {
        getData();
    }, [user]);

    const blogs = useMemo(() => {
        if (!search) return _blogs;
        return _blogs?.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    }, [_blogs, search]);

    const getData = async () => {
        if (loading.includes('getdata')) return;
        await fetch<any, BlogListResponse>({
            url: 'creator-data/blog-bycreator',
            method: 'GET',
            success: (response) => {
                // Handle various possible response structures gracefully
                const result = response?.data?.data || response?.data || response;
                if (Array.isArray(result)) {
                    setBlogs.setState(result);
                }
            },
            before: () => setLoading.append('getdata'),
            complete: () => setLoading.filter(e => e != 'getdata'),
        });
    }

    const handleDelete = (id: number) => {
        modals.openConfirmModal({
            title: 'Hapus Blog',
            children: (
                <Text size="sm">
                    Apakah Anda yakin ingin menghapus blog ini? Tindakan ini tidak dapat dibatalkan.
                </Text>
            ),
            labels: { confirm: 'Hapus', cancel: 'Batal' },
            confirmProps: { color: 'red', radius: 'xl' },
            cancelProps: { radius: 'xl' },
            onConfirm: async () => {
                await fetch({
                    url: `blogs/${id}`,
                    method: 'POST',
                    data: { _method: 'DELETE' },
                    success: () => {
                        notifications.show({
                            title: 'Berhasil',
                            message: 'Blog berhasil dihapus',
                            color: 'green',
                        });
                        getData();
                    },
                    error: () => {
                        notifications.show({
                            title: 'Gagal',
                            message: 'Gagal menghapus blog',
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
                    <Text size="1.8rem" fw={600}>Dashboard Blog</Text>
                    <Text size="sm" c="gray">Kelola Semua Blog Anda</Text>
                </Stack>

                <Flex align="center" gap={10}>
                    <TextInput
                        value={search}
                        onChange={e => setSearch(e.currentTarget.value)}
                        radius="xl"
                        leftSection={<Icon icon="uiw:search" />}
                        placeholder='Cari Judul Blog'
                    />
                    <Button
                        radius="xl"
                        color="#194e9e"
                        leftSection={<Icon icon="uiw:plus" />}
                        component={Link}
                        href="/dashboard/blog/create">
                        Tambah Blog
                    </Button>
                </Flex>
            </Flex>

            <Divider />

            <Flex gap={20} wrap="wrap" className={`[&>*]:!flex-xgrow [&>*]:!w-full md:[&>*]:!max-w-[300px]`}>
                {blogs?.map((e, i) => (
                    <Card key={i} withBorder radius={10} component={Link} href={`/dashboard/blog/${e.id}`} p={0}>
                        <AspectRatio ratio={16 / 9}>
                            <Image src={e.featured_image || 'https://placehold.co/600x400?text=No+Image'} alt={e.title} />
                        </AspectRatio>

                        <Card p="md">
                            <Stack gap={3}>
                                <Text fw={600} lineClamp={2} h={50}>{e.title}</Text>
                                <Flex justify="space-between" align="center" mt="sm">
                                    <Badge variant="light" color={e.status === 'published' ? 'green' : 'yellow'}>
                                        {e.status}
                                    </Badge>
                                    <Text size="xs" c="gray">{e.views} Views • {e.reading_time} min read</Text>
                                </Flex>

                                <Divider mt="sm" />

                                <Flex justify="flex-end" gap={10} mt="sm">
                                    <ActionIcon
                                        variant="filled"
                                        color="blue"
                                        radius="md"
                                        component={Link}
                                        href={`/dashboard/blog/${e.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Icon icon="solar:pen-bold" />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="filled"
                                        color="red"
                                        radius="md"
                                        onClick={(evt) => {
                                            evt.preventDefault();
                                            evt.stopPropagation();
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
            </Flex>

            {((blogs.length == 0 || !blogs) && !loading.includes('getdata')) && (
                <Center mih={200} w="100%">
                    <div className='py-[30px] px-[20px] flex flex-col items-center justify-center text-dark gap-2 w-full'>
                        <div className='border-2 border-primary-light-200 bg-primary-light rounded-md p-2 flex items-center justify-center mb-2'>
                            <Icon icon="mage:note-text-fill" className={`text-[36px] text-primary-base`} />
                        </div>
                        <div className='text-center'>
                            <p className='font-semibold text-lg'>Tidak ada blog yang tersedia</p>
                            <p className='text-grey max-w-72 mt-[10px]'>
                                Mulai buat blog dengan klik button “Tambah Blog” di bawah.
                            </p>
                        </div>

                        <Button
                            mt={10}
                            radius="xl"
                            color="#194e9e"
                            leftSection={<Icon icon="uiw:plus" />}
                            component={Link}
                            href="/dashboard/blog/create">
                            Buat Blog Pertama
                        </Button>
                    </div>
                </Center>
            )}
        </Stack>
    );
};

export default BlogDashboard;
