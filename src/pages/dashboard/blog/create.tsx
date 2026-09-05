import { Icon } from '@iconify/react/dist/iconify.js';
import { Box, Button, Card, Checkbox, Divider, Flex, InputWrapper, LoadingOverlay, NumberInput, Select, Space, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { BlogStoreRequest } from './type';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { useListState } from '@mantine/hooks';
import ImageInput from '@/components/ImageInput.tsx/index';
import InputEditor from '@/components/Input/InputEditor/index';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

export default function Create() {
    const { t } = useTranslation();
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    const router = useRouter();

    const form = useForm<Partial<BlogStoreRequest>>({
        initialValues: {
            status: 'published',
            allow_comments: 1,
            category_id: 1,
            reading_time: 5,
            published_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        },
        validate: {
            title: (value) => (!value ? t('blogForm.titleRequired') : null),
            content: (value) => (!value ? t('blogForm.contentRequired') : null),
        }
    });

    const submitData = async () => {
        const valid = form.validate();
        if (valid.hasErrors) return;

        await fetch<Partial<BlogStoreRequest>, any>({
            url: 'blogs',
            method: 'POST',
            data: {
                ...form.values,
                creator_id: user?.has_creator?.id ?? 1,
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
<Flex gap={10} justify="space-between" align="center">
<Flex align="center" gap={15}>
<button
type="button"
onClick={() => router.push('/dashboard/blog')}
className="w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
>
<Icon icon="ph:arrow-left-bold" />
</button>
<Stack gap={5}>
<Text size="1.8rem" fw={600}>{t('blogForm.createTitle')}</Text>
<Text size="sm" c="gray">{t('blogForm.createDesc')}</Text>
</Stack>
</Flex>
</Flex>

            <Divider />

            <Stack gap={20} w="100%" pb={100}>
                <Flex gap={10} align="center">
                    <Icon icon="uiw:information" className={`text-[20px] text-primary-base`}/>
                    <Text size="lg" fw={600}>{t('blogForm.blogInfo')}</Text>
                </Flex>

                <InputWrapper label={t('blogForm.featuredImage')} description={t('blogForm.imageHint')}>
                    <Box pt={5}>
                        <ImageInput
                            dimension={[300, 150]}
                            value={form.values.featured_image as string}
                            onChange={async (file: File | null) => {
                                if (!file) {
                                    form.setFieldValue('featured_image', '');
                                    return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    form.setFieldValue('featured_image', reader.result as string);
                                };
                                reader.readAsDataURL(file);
                            }}
                            onDelete={() => form.setFieldValue('featured_image', '')}
                        />
                    </Box>
                </InputWrapper>

                <Flex gap={15} wrap="wrap">
                    <TextInput
                        withAsterisk
                        label={t('blogForm.titleLabel')}
                        placeholder={t('blogForm.titlePlaceholder')}
                        style={{ flex: 1 }}
                        {...form.getInputProps('title')}
                    />
                    <Select
                        label={t('blogForm.category')}
                        placeholder={t('blogForm.selectCategory')}
                        data={[
                            { value: '1', label: t('blogForm.catTech') },
                            { value: '2', label: t('blogForm.catLifestyle') },
                            { value: '3', label: t('blogForm.catEntertainment') },
                            { value: '4', label: t('blogForm.catEducation') },
                        ]}
                        w={200}
                        value={String(form.values.category_id)}
                        onChange={(val) => form.setFieldValue('category_id', Number(val))}
                    />
                </Flex>

                <Textarea
                    label={t('blogForm.excerpt')}
                    placeholder={t('blogForm.excerptPlaceholder')}
                    autosize
                    minRows={2}
                    {...form.getInputProps('excerpt')}
                />

                <InputWrapper label={t('blogForm.content')} withAsterisk>
                    <Card withBorder p={0} mt={5}>
                        <InputEditor
                            value={form.values.content}
                            onChange={(val: string) => form.setFieldValue('content', val)}
                        />
                    </Card>
                </InputWrapper>

                <Flex gap={15} wrap="wrap" align="flex-end">
                    <Select
                        label={t('blogForm.status')}
                        placeholder={t('blogForm.selectStatus')}
                        data={[
                            { value: 'published', label: t('blogForm.optPublished') },
                            { value: 'draft', label: t('blogForm.optDraft') },
                        ]}
                        {...form.getInputProps('status')}
                    />
                    <DateInput
                        label={t('blogForm.publishDate')}
                        placeholder={t('blogForm.selectDate')}
                        value={dayjs(form.values.published_at).toDate()}
                        onChange={(val) => form.setFieldValue('published_at', dayjs(val).format('YYYY-MM-DD HH:mm:ss'))}
                    />
                    <NumberInput
                        label={t('blogForm.readTime')}
                        placeholder="5"
                        {...form.getInputProps('reading_time')}
                    />
                </Flex>

                <Checkbox
                    label={t('blogForm.allowComments')}
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
                        {t('blogForm.cancel')}
                    </Button>
                    <Button
                        loading={loading.includes('submitdata')}
                        onClick={submitData}
                        w="fit-content"
                        color="#194e9e"
                        rightSection={<Icon icon="uiw:check" />}
                        radius="xl">
                        {t('blogForm.saveBlog')}
                    </Button>
                </Flex>
            </Card>
        </Stack>
    );
}

