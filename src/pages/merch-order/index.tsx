// pages/cart.tsx
import { useEffect, useMemo, useState } from 'react';
import { Container, Group, Checkbox, Text, Title, Button, Paper, Stack, Image, Flex, Card, NumberFormatter, ActionIcon, Center, NumberInput, AspectRatio } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { MerchListResponse } from '../dashboard/merch/type';
import { Delete, Get } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';
import { modals } from '@mantine/modals';
import merchIcon from '../../assets/svg/merch.svg';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import ButtonB from '@/components/Button';
import ImageB from 'next/image';

export default function Cart() {
    const [isr, setIsr] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [productList, setProductList] = useListState<MerchListResponse>();
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    const router = useRouter();

    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {
    }, [isr]);

    return (
        <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px]`}>
            <Title order={1} size="h2">
                Checkout Merchandise
            </Title>
            <Text size="md" c="gray">
                
            </Text>
        </Container>
    );
}
