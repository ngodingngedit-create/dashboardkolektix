import { Icon } from '@iconify/react/dist/iconify.js';
import { Box, Button, Card, Checkbox, Divider, Flex, InputWrapper, LoadingOverlay, NumberInput, Select, Space, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { Blog, BlogStoreRequest } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { useDidUpdate, useListState } from '@mantine/hooks';
import ImageInput from '@/components/ImageInput.tsx/index';
import InputEditor from '@/components/Input/InputEditor/index';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

export default function Edit() {
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    const router = useRouter();
    const { id } = router.query;
    const [blog, setBlog] = useState<Blog>();

    const form = useForm<Partial<BlogStoreRequest & { _method?: string }>>({
        initialValues: {
            status: 'published',
            allow_comments: 1,
            category_id: 1,
            reading_time: 5,
        },
        validate: {
            title: (value) => (!value ? 'Judul wajib diisi' : null),
            content: (value) => (!value ? 'Konten wajib diisi' : null),
        }
    });

    useEffect(() => {
        if (id) {
            getBlogData();
        }
    }, [id]);

    const getBlogData = async () => {
        await fetch<any, Blog>({
            url: `blogs/${id}`,
            method: 'GET',
            before: () => setLoading.append('getblog'),
            success: (response) => {
                if (response && response.data) {
                    setBlog(response.data);
                }
            },
            complete: () => setLoading.filter(e => e != 'getblog'),
        });
    }

    useDidUpdate(() => {
        if (blog) {
            form.setValues({
                title: blog.title,
                excerpt: blog.excerpt,
                content: blog.content,
                featured_image: blog.featured_image,
                status: blog.status,
                category_id: blog.category_id,
                published_at: blog.published_at,
                reading_time: blog.reading_time,
                allow_comments: blog.allow_comments,
            });
        }
    }, [blog]);

    const submitData = async () => {
        const valid = form.validate();
        if (valid.hasErrors) return;

        await fetch<any, any>({
            url: `blogs/${id}`,
            method: 'POST', 
            data: {
                ...form.values,
                creator_id: user?.has_creator?.id ?? blog?.creator_id ?? 1,
                _method: 'PUT'
            },
            before: () => setLoading.append('submitdata'),
            success: () => {
                router.push('/dashboard/blog')
            },
            complete: () => setLoading.filter(e => e != 'submitdata'),
            invalid: form.setErrors,
        });
    }

    return (
        <Stack className={`p-[20px] md:p-[30px]`} gap={30}>
            <LoadingOverlay visible={loading.includes('getblog')} />
            <Flex gap={10} justify="space-between" align="center">
                <Stack gap={5}>
                    <Text size="1.8rem" fw={600}>Edit Blog</Text>
                    <Text size="sm" c="gray">Perbarui detail artikel blog Anda</Text>
                </Stack>
            </Flex>

            <Divider />

            <Stack gap={20} w="100%" pb={100}>
                <Flex gap={10} align="center">
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`}/>
                    <Text size="lg" fw={600}>Informasi Blog</Text>
                </Flex>

                <InputWrapper label="Gambar Utama (Featured Image)" description="Direkomendasikan 1200px X 630px">
                    <Box pt={5}>
                        <ImageInput
                            dimension={[300, 150]}
                            value={form.values.featured_image as string}
                            onChange={(e: any) => form.setFieldValue('featured_image', e || '')}
                            onDelete={() => form.setFieldValue('featured_image', '')}
                        />
                    </Box>
                </InputWrapper>

                <Flex gap={15} wrap="wrap">
                    <TextInput
                        withAsterisk
                        label="Judul Blog"
                        placeholder="Masukkan Judul Artikel"
                        style={{ flex: 1 }}
                        {...form.getInputProps('title')}
                    />
                    <Select
                        label="Kategori"
                        placeholder="Pilih Kategori"
                        data={[
                            { value: '1', label: 'Teknologi' },
                            { value: '2', label: 'Gaya Hidup' },
                            { value: '3', label: 'Hiburan' },
                            { value: '4', label: 'Edukasi' },
                        ]}
                        w={200}
                        value={String(form.values.category_id)}
                        onChange={(val) => form.setFieldValue('category_id', Number(val))}
                    />
                </Flex>

                <Textarea
                    label="Ringkasan (Excerpt)"
                    placeholder="Masukkan ringkasan singkat artikel"
                    autosize
                    minRows={2}
                    {...form.getInputProps('excerpt')}
                />

                <InputWrapper label="Konten Blog" withAsterisk>
                    <Card withBorder p={0} mt={5}>
                        <InputEditor
                            value={form.values.content}
                            onChange={(val: string) => form.setFieldValue('content', val)}
                        />
                    </Card>
                </InputWrapper>

                <Flex gap={15} wrap="wrap" align="flex-end">
                    <Select
                        label="Status"
                        placeholder="Pilih Status"
                        data={[
                            { value: 'published', label: 'Published' },
                            { value: 'draft', label: 'Draft' },
                        ]}
                        {...form.getInputProps('status')}
                    />
                    <DateInput
                        label="Tanggal Publikasi"
                        placeholder="Pilih Tanggal"
                        value={form.values.published_at ? dayjs(form.values.published_at).toDate() : null}
                        onChange={(val) => form.setFieldValue('published_at', dayjs(val).format('YYYY-MM-DD HH:mm:ss'))}
                    />
                    <NumberInput
                        label="Estimasi Waktu Baca (menit)"
                        placeholder="5"
                        {...form.getInputProps('reading_time')}
                    />
                </Flex>

                <Checkbox
                    label="Izinkan Komentar"
                    checked={form.values.allow_comments === 1}
                    onChange={(e) => form.setFieldValue('allow_comments', e.currentTarget.checked ? 1 : 0)}
                />
            </Stack>

            <Card pos="fixed" className={`!bottom-0 !left-0 !right-0 !z-10 !border-t !border-[#d0d0d0]`} radius={0} py={15} px={30} style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
                <Flex justify="flex-end" gap={10}>
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={() => router.push('/dashboard/blog')}
                        leftSection={<Icon icon="uiw:close" />}
                        radius="xl">
                        Batal
                    </Button>
                    <Button
                        loading={loading.includes('submitdata')}
                        onClick={submitData}
                        w="fit-content"
                        color="#194e9e"
                        rightSection={<Icon icon="uiw:check" />}
                        radius="xl">
                        Perbarui Blog
                    </Button>
                </Flex>
            </Card>
        </Stack>
    );
}
