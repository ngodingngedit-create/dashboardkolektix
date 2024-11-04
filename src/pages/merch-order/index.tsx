// pages/cart.tsx
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Container, Group, Checkbox, Text, Title, Button, Paper, Stack, Image, Flex, Card, NumberFormatter, ActionIcon, Center, NumberInput, AspectRatio, Divider, Accordion, UnstyledButton, TextInput, Box, Modal, Select, Textarea, SimpleGrid } from '@mantine/core';
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
import { useForm } from '@mantine/form';

type FormState = {
    receiver?: {
        name: string;
        phone: string;
        province: string;
        province_code?: number;
        city: string;
        citi_code?: number;
        pos_code: number;
        detail: string;
        note: string;
    };
    payment_method?: any;
    courier?: any;
}

export default function Cart() {
    const [isr, setIsr] = useState(false);
    const [modal, setModal] = useState<string>();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [productList, setProductList] = useListState<MerchListResponse>();
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    const router = useRouter();

    const form = useForm<FormState>({});

    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {}, [isr]);

    return (
        <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
            <AddressModal opened={modal == 'address'} onClose={() => setModal(undefined)} list={[]} onChange={() => {}}/>

            <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
                <Stack gap={25}>
                    <Stack gap={0}>
                        <Title order={1} size="h2">
                            Checkout Merchandise
                        </Title>
                        <Text size="sm" c="gray">
                            Pilih Metode Pembayaran dan Alamat Pengiriman
                        </Text>
                    </Stack>

                    <Divider />

                    <Flex gap={20} w="100%" wrap="wrap">
                        <Stack gap={15} className={`flex-grow`}>
                            <DropdownComponent title="Data Pengiriman" icon="lets-icons:form-fill" defaultOpened>
                                <Flex gap={15} wrap="wrap" className="[&>*]:!flex-grow">
                                    <TextInput
                                        label="Nama Penerima"
                                        placeholder="Masukan Nama Penerima"
                                    />

                                    <TextInput
                                        label="No. Telp Penerima"
                                        placeholder="Masukan No. Telp Penerima"
                                    />
                                </Flex>

                                <UnstyledButton mih="100%" onClick={() => {}}>
                                    <Card
                                        withBorder
                                        p={20}
                                        radius={15}
                                        h="100%"
                                        className={`!border-b-3 !border-b-[#0B387C] ${form.values?.receiver?.pos_code ? '' : '!bg-primary-light'}`}
                                        onClick={() => setModal('address')}
                                    >
                                        {form.values?.receiver?.pos_code ? (
                                            <Flex gap={15}>
                                                <Box c={"#0B387C"}>
                                                    <Icon icon="gis:location-poi" className={`text-[24px]`}/>
                                                </Box>
                                                <Stack gap={3} mt={-5}>
                                                    <Text fw={600} size="lg">{form.values.receiver.name}</Text>
                                                    <Text c="gray" size="sm" mt={5} className={`uppercase`}>{form.values.receiver.province}, {form.values.receiver.city}, {form.values.receiver.pos_code}</Text>
                                                    <Text c="gray" size="sm">{form.values.receiver.detail}</Text>
                                                    <Text c="gray" size="xs">({form.values.receiver?.note})</Text>
                                                </Stack>
                                            </Flex>
                                        ) : (
                                            <Flex align="center" gap={10} justify="center">
                                                <Icon icon="uiw:plus" className={`text-primary-base`}/>
                                                <Text size="sm" c='gray.8'>Pilih atau Tambah Alamat</Text>
                                            </Flex>
                                        )}
                                    </Card>
                                </UnstyledButton>
                            </DropdownComponent>

                            <DropdownComponent title="Kurir Pengiriman" icon="fa-solid:shipping-fast">
                                <SimpleGrid className={`!gap-[10px] !grid-cols-1 md:!grid-cols-2`}>
                                    {Array(3).fill('COURIER_NAME').map((e, i) => (
                                        <UnstyledButton key={i} p={8} className={`!rounded-md !bg-primary-light`} pos="relative">
                                            <Flex align="center" gap={15}>
                                                <AspectRatio className={`shrink-0`}>
                                                    <Image w={40} h={40} radius="sm"/>
                                                </AspectRatio>
                                                <Text>{e}</Text>
                                                <Icon icon="uiw:circle-check" className={`text-[#194E9E] text-[24px] shrink-0 mr-[10px] absolute right-[5px] top-2/4 -translate-y-2/4 z-10`} />
                                            </Flex>
                                        </UnstyledButton>
                                    ))}
                                </SimpleGrid>
                            </DropdownComponent>

                            <DropdownComponent title="Metode Pembayaran" icon="fluent:payment-16-filled">
                                <UnstyledButton>
                                        <Card p={10} radius="md" bg="gray.1">
                                            <Flex gap={20} align="center">
                                                <AspectRatio className={`shrink-0`}>
                                                    <Image w={50} h={50} bg="gray.1" radius="sm" />
                                                </AspectRatio>

                                                <Text w="100%">PAYMENT_METHOD_NAME</Text>

                                                <Icon icon="uiw:circle-check" className={`text-[#194E9E] text-[24px] shrink-0 mr-[10px]`} />
                                            </Flex>
                                        </Card>
                                    </UnstyledButton>
                            </DropdownComponent>
                        </Stack>

                        <Stack gap={10} className={`flex-grow md:!max-w-[400px]`}>
                            <Card withBorder radius={10} p={20}>
                                <Stack gap={20}>
                                    <Flex gap={10} align="center">
                                        <Icon icon="octicon:info-24" className={`text-primary-base text-[20px]`}/>
                                        <Text fw={600}>Rincian Produk</Text>
                                    </Flex>

                                    <Divider />

                                    {Array(2).fill('PRODUCT_NAME PRODUCT_NAME PRODUCT_NAME PRODUCT_NAME').map((e, i) => (
                                        <Flex key={i} gap={15} wrap="wrap">
                                            <AspectRatio className={`shrink-0`}>
                                                <Image h={50} w={50} bg="gray.1" radius="sm"/>
                                            </AspectRatio>
                                            <Stack className={`flex-grow`} gap={0}>
                                                <Text className={`whitespace-nowrap text-ellipsis overflow-hidden max-w-[150px] md:max-w-[250px]`} size="sm">{e}</Text>
                                                <Text c="gray" size="sm">Varian: variant_name</Text>
                                                <Text c="gray" size="sm"><NumberFormatter value={100000}/></Text>
                                            </Stack>
                                            <Text>x1</Text>
                                        </Flex>
                                    ))}
                                </Stack>
                            </Card>

                            <Card withBorder radius={10} p={20}>
                                <Stack gap={20}>
                                    <Flex gap={10} align="center">
                                        <Icon icon="uiw:information" className={`text-primary-base text-[20px]`}/>
                                        <Text fw={600}>Total Pembayaran</Text>
                                    </Flex>

                                    <Divider />

                                    <Stack>
                                        <Flex justify="space-between">
                                            <Text>Product 1</Text>
                                            <Text><NumberFormatter value={100000}/></Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>Product 2</Text>
                                            <Text><NumberFormatter value={100000}/></Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>Ongkos Kirim</Text>
                                            <Text><NumberFormatter value={10000}/></Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text fw={600}>Total Pembayaran</Text>
                                            <Text fw={600}><NumberFormatter value={210000}/></Text>
                                        </Flex>
                                    </Stack>

                                    <Divider />

                                    <Button
                                        className={`uppercase`}
                                        color="#194E9E"
                                        rightSection={<Icon icon="uiw:check" />}
                                        radius="xl">
                                        Checkout Order
                                    </Button>
                                </Stack>
                            </Card>
                        </Stack>
                    </Flex>
                </Stack>
            </Container>
        </div>
    );
}

const DropdownComponent = ({ defaultOpened, children, title, icon }: PropsWithChildren<{ defaultOpened?: boolean, title: string, icon: string }>) => {
    const [opened, setOpened] = useState<boolean>(defaultOpened ?? false);

    return (
        <>
            <Card bg="white" radius={10} withBorder>
                <Stack>
                    <Flex justify="space-between" align="center" gap={20} onClick={() => setOpened(!opened)} className={`cursor-pointer`}>
                        <Flex align="center" gap={10}>
                            <Icon icon={icon} className={`text-[20px] text-[#194E9E]`} />
                            <Text>{title}</Text>
                        </Flex>

                        <ActionIcon variant="transparent" c="gray">
                            <Icon icon="uiw:down" className={`transition-transform ${opened ? '!rotate-180' : ''}`}/>
                        </ActionIcon>
                    </Flex>

                    <Stack className={`${opened ? '' : '!hidden'}`} p={5}>{children}</Stack>
                </Stack>
            </Card>
        </>
    );
};

const AddressModal = ({ list, opened, onClose, onChange }: {
    list: any[];
    opened: boolean;
    onClose: () => void;
    onChange: (data: Omit<FormState['receiver'], 'id'>) => void;
}) => {
    const [page, setPage] = useState<'create' | 'select'>(list.length > 0 ? 'select' : 'create');

    return (
        <>
            <Modal
                title={"Pilih Alamat"}
                opened={opened}
                onClose={() => onClose()}
                centered
            >
                <Stack gap={15} p={5}>
                    <TextInput
                        label="Nama Alamat"
                        placeholder="Rumah, Kantor, ..."
                        // {...form.getInputProps('name')}
                    />

                    <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
                        <Select
                            label="Provinsi"
                            placeholder="Pilih Provinsi"
                            // data={dummyData.map(e => e.province)}
                            // value={form.values.province}
                            // onChange={e => e && form.setFieldValue('province', e)}
                            // error={form.errors.province}
                        />

                        <Select
                            label="Kota"
                            placeholder="Pilih Kota"
                            // data={dummyData.map(e => e.city)}
                            // value={form.values.city}
                            // onChange={e => e && form.setFieldValue('city', e)}
                            // error={form.errors.city}
                        />
                    </Flex>

                    <TextInput
                        label="Kode Pos"
                        placeholder="Masukan Kode Pos"
                        // {...form.getInputProps('postcode')}
                    />

                    <Textarea
                        autosize
                        minRows={3}
                        label="Detail Alamat"
                        placeholder="Kecamatan, Desa, No. Rumah, dll"
                        // {...form.getInputProps('detail')}
                    />

                    <TextInput
                        label="Keterangan Tambahan"
                        placeholder="Patokan Rumah, dll"
                        // {...form.getInputProps('note')}
                    />

                    <Text size="xs" c="gray">Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.</Text>

                    <Flex align="center" gap={10} justify="space-between" mt={10}>
                        <Button
                            color="#0B387C"
                            w="fit-content"
                            radius="xl"
                            leftSection={<Icon icon="uiw:check" />}
                            // onClick={handleSave}
                            // loading={loading.includes('save')}
                        >Simpan Alamat</Button>

                        {/* {(modalIndex && modalIndex > 0) ? (
                            <ActionIcon
                                variant="transparent"
                                color="red"
                                onClick={() => handleDelete()}
                            >
                                <Icon icon="uiw:delete" />
                            </ActionIcon>
                        ) : <></>} */}
                    </Flex>
                </Stack>
            </Modal>
        </>
    )
}
