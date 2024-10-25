import Logo from '@/assets/images/kolektix logo tansparant-blue.png';
import { Input } from '@nextui-org/react';
import Image from 'next/image';
import ImageInput from '../ImageInput.tsx';
import { useForm, zodResolver } from '@mantine/form';
import { ActionIcon, Box, Button, Card, Checkbox, Divider, Flex, InputWrapper, NumberInput, SimpleGrid, Stack, Switch, Table, TagsInput, Text, TextInput } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';
import InputEditor from '@/components/Input/InputEditor';
import { Post } from '@/utils/REST';
import Cookies from 'js-cookie';
import z from 'zod';
import { useRouter } from 'next/router';
import { useListState } from '@mantine/hooks';

const storeSchema = z.object<Record<keyof MerchandiseState, z.ZodTypeAny>>({
    name: z.string().min(1, { message: '"Wajib Diisi' }),
    sku: z.string().min(1, { message: '"Wajib Diisi' }),
    price: z.number().min(1, { message: '"Wajib Diisi' }),
    description: z.string().min(1, { message: '"Wajib Diisi' }),
    image: z.array(z.any()).min(1, { message: 'Masukan minimal satu gambar'}),
    variant: z.array(z.any()).optional().nullable(),
    variantdetail: z.array(z.any()).optional().nullable(),
    status: z.boolean().nullable().optional()
});

export default function CreateMerchandise({ onClose }: Readonly<ComponentProps>) {
    const [loading, setLoading] = useListState<string>();

    const router = useRouter();
    const form = useForm<MerchandiseState>({
        initialValues: {
            name: '',
            sku: '',
            price: 0,
            description: '',
            image: [],
            variant: [],
            variantdetail: [],
            status: true
        },
        validate: zodResolver(storeSchema)
    });

    const handleSave = (isDraft: boolean = false) => {
        const valid = form.validate();
        if (valid.hasErrors) return;

        setLoading.append('save');
        const { name, description, price: selling_price, sku, image, status } = form.values;
        Post('product', {
            name,
            description: description ?? '-',
            sku,
            selling_price,
            image,
            status: isDraft ? 5 : status ? 1 : 0,
            creator_id: parseInt(JSON.parse(Cookies.get('user_data') ?? '')?.has_creator?.id ?? 0),
            buying_price: selling_price,
            variation_price: 0,
            order: 10,
            can_purchasable: 1,
            show_stock_out: 1,
            maximum_purchase_quantity: 100,
            low_stock_quantity_warning: 4,
            refundable: 0,
            discount: 0,
            is_product_quantity_multiply: 1,
            add_to_flash_sale: 1
        } satisfies MerchandiseStoreRequest, 'multipart/form-data')
        .then((res: any) => {
            router.reload();
            setLoading.filter(e => e != 'save');
        })
        .catch(({ response }) => {
            form.setErrors({ ...response.data.errors, name: response.data.errors.slug ?? undefined });
            setLoading.filter(e => e != 'save');
        });
    }

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
                    <div className="mx-auto max-w-[1280px] py-[20px] px-[20px] md:px-[30px] flex flex-col gap-[30px]">

                        <div>
                            <h2 className="text-[30px] font-[600]">Buat Merchandise</h2>
                            <p className="text-grey">Lengkapi form dibawah untuk membuat Merchandise</p>
                        </div>

                        <div className="border border-[#E2EDFF] rounded-[8px]">
                            <h3 className="text-[20px] font-[500] p-[12px_16px] border-b border-[#E2EDFF]">Informasi Merchandise</h3>

                            <div className="p-[24px_16px] flex flex-col gap-[20px]">
                                <div className="flex flex-wrap gap-[20px]">
                                    <div className="min-w-[250px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Foto Merchandise <span className="text-red-400">*</span></h4>
                                        <p className="text-grey mt-[5px]">Direkomendasikan tidak lebih dari 2mb</p>
                                    </div>
                                    <div className="flex-grow overflow-x-auto">
                                        <InputWrapper error={form.errors.image}>
                                            <Box pb={10}>
                                                <SimpleGrid w="fit-content" className={`!flex sm:!grid sm:!grid-cols-3 md:!grid-cols-5`}>
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
                                            </Box>
                                        </InputWrapper>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                                    <div className="min-w-[250px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Nama Produk <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="flex-grow [&_*]:border-[#E2EDFF]">
                                        <TextInput placeholder="Isi Nama Produk" error={form.errors.name} value={form.values.name} onChange={e => form.setValues({ name: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                                    <div className="min-w-[250px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">SKU Produk <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="flex-grow [&_*]:border-[#E2EDFF]">
                                        <TextInput placeholder="Isi Nama Produk" error={form.errors.sku} value={form.values.sku} onChange={e => form.setValues({ sku: e.target.value.replaceAll(/\s/g, '') })} />
                                    </div>
                                </div>

                                {/* <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                                    <div className="min-w-[250px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Kategori <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="flex-grow [&_*]:border-[#E2EDFF]">
                                        <TagsInput placeholder="Isi Kategori Produk" />
                                    </div>
                                </div> */}
                            </div>
                        </div>

                        <div className="border border-[#E2EDFF] rounded-[8px]">
                            <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`} wrap="wrap">
                                <h3 className="text-[20px] font-[500]">Varian Merchandise</h3>
                                <Button
                                    p={0}
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
                                    <Flex key={i} align="end" gap={10} wrap="wrap">
                                        <TextInput
                                            value={form.values.variant[i].name}
                                            onChange={e => form.setFieldValue(`variant.${i}.name`, e.target.value)}
                                            label="Nama Varian"
                                            placeholder="Contoh: Ukuran, Warna"
                                        />
                                        <Flex gap={10} align="center">
                                            <TagsInput
                                                w="100%"
                                                value={form.values.variant[i].value}
                                                onChange={e => form.setFieldValue(`variant.${i}.value`, e)}
                                                placeholder={`Ketik untuk menambah tipe varian ${form.values.variant[i].name}`}
                                            />
                                            <ActionIcon
                                                variant="transparent"
                                                color="#0B387C"
                                                radius="xl"
                                                className={`!border-[#E2EDFF] shrink-0`}
                                                size="xl"
                                                onClick={() => form.setValues({ variant: form.values.variant.filter((_, z) => z != i) })}>
                                                <Icon icon="material-symbols:delete-outline" className={`text-[24px]`}/>
                                            </ActionIcon>
                                        </Flex>
                                    </Flex>
                                ))}

                                {form.values.variant.length == 0 && (
                                    <Text className={`!text-grey`}>Tambah Varian terlebih dahulu untuk mengatur varian</Text>
                                )}

                                <Divider label="Atur Varian" my={10} display={form.values.variant[0] && Boolean(form.values.variant[0].name) ? undefined : 'none'}/>

                                <Card className={`!overflow-auto`} withBorder p={0} display={form.values.variant[0] && Boolean(form.values.variant[0].name) ? undefined : 'none'}>
                                    <Table className={`[&_th]:font-[500] [&_tbody_td]:py-[15px] min-w-[700px]`} horizontalSpacing="md">
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
                                                    <Table.Td>
                                                        <TextInput maw={200} placeholder="Isi SKU Varian"/>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <NumberInput maw={200} hideControls placeholder="Isi Harga Varian" prefix="Rp " thousandSeparator/>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <NumberInput maw={200} hideControls placeholder="Isi Berat Varian" suffix=' gr' thousandSeparator/>
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
                            </Flex>

                            <div className="p-[16px] flex flex-col gap-[20px]">
                                <div className="flex flex-wrap items-center gap-[20px]">
                                    <div className="min-w-[200px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Harga <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="flex-grow">
                                        <NumberInput error={form.errors.name} value={form.values.price} onChange={e => form.setValues({ price: e as number })} hideControls placeholder="Isi Harga" />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-[20px]">
                                    <div className="min-w-[200px] shrink-0 mt-[12px]">
                                        <h4 className="text-[16px] font-[500]">Stok <span className="text-red-400">*</span></h4>
                                    </div>
                                    <Stack className="flex-grow">
                                        <NumberInput hideControls type="text" placeholder="Isi Stok" />
                                        <Checkbox label="Tampilkan label jika stok habis"/>
                                    </Stack>
                                </div>
                                <div className="flex flex-wrap items-center gap-[20px]">
                                    <div className="min-w-[200px] shrink-0">
                                        <h4 className="text-[16px] font-[500]">Berat <span className="text-red-400">*</span></h4>
                                    </div>
                                    <div className="flex-grow">
                                        <NumberInput hideControls type="text" placeholder="Isi Stok" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[#E2EDFF] rounded-[8px]">
                            <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`}>
                                <h3 className="text-[20px] font-[500]">Deskripsi Produk</h3>
                            </Flex>

                            <div className="p-[16px] flex flex-col gap-[20px]">
                                <InputEditor
                                    theme='snow'
                                    onChange={(value: string) => form.setValues({ description: value })}
                                    value={form.values.description}
                                    error={form.errors.description}
                                    placeholder='Ketik Syarat & Ketentuan'
                                    modules={{
                                        toolbar: [
                                        [{ header: '1' }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ list: 'bullet' }],
                                        ],
                                        clipboard: {
                                        matchVisual: false,
                                        },
                                    }}
                                    className='editor'
                                />
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
                    {JSON.stringify(form.errors)}
                    <div className="mx-auto max-w-[1280px] px-[20px]">
                        <Flex gap={10} justify="space-between">
                            <Button
                                onClick={() => onClose && onClose()}
                                className={`!border-[#E2EDFF]`}
                                variant="subtle"
                                color="gray"
                                radius="xl"
                            >Kembali</Button>

                            <Flex gap={10}>
                                <Button
                                    loading={loading.includes('save')}
                                    onClick={() => handleSave(true)}
                                    className={`!border-[#E2EDFF]`}
                                    variant="outline"
                                    color="#0B387C"
                                    radius="xl"
                                >Simpan Draf</Button>

                                <Button
                                    loading={loading.includes('save')}
                                    onClick={() => handleSave(false)}
                                    bg="#0B387C"
                                    radius="xl"
                                >Buat Merchandise</Button>
                            </Flex>
                        </Flex>
                    </div>
                </div>

            </div>
        </div>
    );
}