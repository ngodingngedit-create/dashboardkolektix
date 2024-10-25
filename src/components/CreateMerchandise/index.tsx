import Logo from '@/assets/images/kolektix logo tansparant-blue.png';
import { Input } from '@nextui-org/react';
import Image from 'next/image';
import ImageInput from '../ImageInput.tsx';
import { useForm } from '@mantine/form';
import { ActionIcon, Button, Card, Divider, Flex, NumberInput, SimpleGrid, Switch, Table, TagsInput, Text, TextInput } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';

type MerchandiseState = {
    image: (string | Blob)[];
    variant: {
        name: string;
        value: string[];
    }[];
}

type ComponentProps = {
    onDraft?: () => void;
};

export default function CreateMerchandise({ onDraft }: Readonly<ComponentProps>) {
    const form = useForm<MerchandiseState>({
        initialValues: {
            image: [],
            variant: []
        }
    });

    return (
        <div className="fixed w-[100vw] h-[100vh] top-0 left-0 z-[900] bg-white">
            <div className="flex flex-col h-full w-full">

                <div className="border-b border-[#E2EDFF] p-[10px] shrink-0">
                    <div className="mx-auto max-w-[1280px] px-[20px] flex justify-between items-center gap-[20px]">
                        <Image src={Logo} alt="Kolektix Logo" height={32}/>
                        <div className="h-[32px] w-[32px] bg-light-grey rounded-full"></div>
                    </div>
                </div>

                <div className="h-full overflow-y-auto pb-[20px]">
                    <div className="mx-auto max-w-[1280px] py-[20px] px-[30px] flex flex-col gap-[30px]">

                        <div>
                            <h2 className="text-[30px] font-[600]">Buat Merchandise</h2>
                            <p className="text-grey">Lengkapi form dibawah untuk membuat Merchandise</p>
                        </div>

                        <div className="border border-[#E2EDFF] rounded-[8px]">
                            <h3 className="text-[20px] font-[500] p-[12px_16px] border-b border-[#E2EDFF]">Informasi Merchandise</h3>

                            <div className="p-[24px_16px] flex flex-col gap-[20px]">
                                <div className="flex gap-[20px]">
                                    <div className="min-w-[300px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Foto Merchandise <span className="text-red-400">*</span></h4>
                                        <p className="text-grey mt-[5px]">Direkomendasikan tidak lebih dari 2mb</p>
                                    </div>
                                    <div className="w-full">
                                        <SimpleGrid cols={5} w="fit-content">
                                            {Array(10).fill(1).map((e, i) => (
                                                <ImageInput
                                                    key={i}
                                                    value={form.values.image[i]}
                                                    onChange={e => e && (form.values.image[i] ?
                                                        form.setValues({ image: form.values.image.map((x, z) => z == i ? e : x) }) :
                                                        form.setValues({ image: [...form.values.image, e] })
                                                    )}
                                                    onDelete={() => form.setValues({ image: form.values.image.filter((_, z) => z != i) })}
                                                    floattext={i == 0 ? 'Utama' : undefined}
                                                />
                                            ))}
                                        </SimpleGrid>
                                    </div>
                                </div>

                                <div className="flex items-center gap-[20px]">
                                    <div className="min-w-[300px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Nama Produk <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="w-full [&_*]:border-[#E2EDFF]">
                                        <Input variant="bordered" size="lg" type="text" placeholder="Isi Nama Produk" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-[20px]">
                                    <div className="min-w-[300px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Kategori <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="w-full [&_*]:border-[#E2EDFF]">
                                        <Input variant="bordered" size="lg" type="text" placeholder="Isi Kategori Produk" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[#E2EDFF] rounded-[8px]">
                            <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`}>
                                <h3 className="text-[20px] font-[500]">Varian Merchandise</h3>
                                <Button
                                    onClick={() => form.setValues({ variant: [...form.values.variant, { name: '', value: [] }] })}
                                    color="#0B387C"
                                    variant="transparent"
                                    leftSection={
                                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99967 5.93262V11.266M5.33301 8.59928H10.6663M14.6663 8.59928C14.6663 12.2812 11.6816 15.266 7.99967 15.266C4.31778 15.266 1.33301 12.2812 1.33301 8.59928C1.33301 4.91739 4.31778 1.93262 7.99967 1.93262C11.6816 1.93262 14.6663 4.91739 14.6663 8.59928Z" stroke="#0B387C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    }
                                >Tambah Varian</Button>
                            </Flex>

                            <div className="p-[16px_20px] flex flex-col gap-[10px]">
                                {form.values.variant.map((e, i) => (
                                    <Flex key={i} align="end" gap={15}>
                                        <TextInput
                                            value={form.values.variant[i].name}
                                            onChange={e => form.setFieldValue(`variant.${i}.name`, e.target.value)}
                                            label="Nama Varian"
                                            placeholder="Contoh: Ukuran, Warna"
                                        />
                                        <TagsInput
                                            w="100%"
                                            value={form.values.variant[i].value}
                                            onChange={e => form.setFieldValue(`variant.${i}.value`, e)}
                                            placeholder="Ketik untuk menambah tipe varian Warna"
                                        />
                                        <ActionIcon
                                            variant="transparent"
                                            color="#0B387C"
                                            radius="xl"
                                            className={`!border-[#E2EDFF] shrink-0 mb-[-2px]`}
                                            size="xl"
                                            onClick={() => form.setValues({ variant: form.values.variant.filter((_, z) => z != i) })}>
                                            <Icon icon="material-symbols:delete-outline" className={`text-[24px]`}/>
                                        </ActionIcon>
                                    </Flex>
                                ))}

                                <Divider my={10} />

                                <Card withBorder p={0}>
                                    <Table className={`[&_th]:font-[500] [&_tbody_td]:py-[15px]`} horizontalSpacing="md">
                                        <Table.Thead>
                                            <Table.Tr>
                                                {form.values.variant.map((variant, index) => (
                                                    <Table.Th key={index}>{variant.name}</Table.Th>
                                                ))}
                                                <Table.Th>SKU</Table.Th>
                                                <Table.Th>Harga</Table.Th>
                                                <Table.Th>Berat</Table.Th>
                                                <Table.Th>Stok</Table.Th>
                                                <Table.Th>Aktif</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {form.values.variant.reduce((rows: any[], variant, variantIndex) => {
                                                const values = variant.value;
                                                if (variantIndex === 0) {
                                                    values.forEach((value1) => {
                                                        const row = { [variant.name]: value1 };
                                                        rows.push(row);
                                                    });
                                                } else {
                                                    return rows.flatMap((row) => {
                                                        return values.map((value2) => {
                                                            return {
                                                                ...row,
                                                                [variant.name]: value2,
                                                            };
                                                        });
                                                    });
                                                }
                                                return rows;
                                            }, []).map((row, rowIndex) => (
                                                <Table.Tr key={rowIndex}>
                                                    {form.values.variant.map((variant, variantIndex) => (
                                                        <Table.Td key={variantIndex} miw={100}>{row[variant.name]}</Table.Td>
                                                    ))}
                                                    <Table.Td miw={100}>SKU</Table.Td>
                                                    <Table.Td>
                                                        <NumberInput maw={200} hideControls placeholder="Isi Harga Varian" />
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <NumberInput maw={200} hideControls placeholder="Isi Berat Varian" />
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <NumberInput maw={200} hideControls placeholder="Isi Stok Varian" />
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Switch color="#0B387C" />
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Card>
                            </div>
                        </div>

                        <div className="border border-[#E2EDFF] rounded-[8px]">
                            <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`}>
                                <h3 className="text-[20px] font-[500]">Detail Merchandise</h3>
                                <Switch size="md" color="#0B387C"/>
                            </Flex>

                            <div className="p-[16px] flex flex-col gap-[20px]">
                                <div className="flex items-center gap-[20px]">
                                    <div className="min-w-[300px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Harga <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="w-full [&_*]:border-[#E2EDFF]">
                                        <Input variant="bordered" size="lg" type="text" placeholder="Isi Harga" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-[20px]">
                                    <div className="min-w-[300px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Stok <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="w-full [&_*]:border-[#E2EDFF]">
                                        <Input variant="bordered" size="lg" type="text" placeholder="Isi Stok" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-[20px]">
                                    <div className="min-w-[300px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Berat <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="w-full [&_*]:border-[#E2EDFF]">
                                        <Input variant="bordered" size="lg" type="text" placeholder="Isi Berat" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[#E2EDFF] rounded-[8px]">
                            <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`}>
                                <h3 className="text-[20px] font-[500]">Status Produk</h3>
                                <Switch size="md" color="#0B387C"/>
                            </Flex>

                            <div className="p-[16px] flex flex-col gap-[20px]">
                                <Text c="gray">Jika status aktif, berarti produkmu dapat dicari pembeli</Text>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="border-t border-[#E2EDFF] p-[10px] shrink-0">
                    <div className="mx-auto max-w-[1280px] px-[20px] flex justify-end items-center gap-[20px]">
                        <Flex gap={10}>
                            <Button
                                onClick={onDraft}
                                className={`!border-[#E2EDFF]`}
                                variant="outline"
                                color="#0B387C"
                                radius="xl"
                            >Simpan Draf</Button>

                            <Button
                                bg="#0B387C"
                                radius="xl"
                            >Buat Merchandise</Button>
                        </Flex>
                    </div>
                </div>

            </div>
        </div>
    );
}