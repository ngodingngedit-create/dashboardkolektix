import Logo from "@/assets/images/kolektix logo tansparant-blue.png";
import { Input } from "@nextui-org/react";
import Image from "next/image";
//import ImageInput from '../ImageInput.tsx';
import ImageInputMultiple from "../ImageInputMultiple.tsx";
import { useForm, zodResolver } from "@mantine/form";
import { ActionIcon, Box, Button, Card, Checkbox, Divider, Flex, InputWrapper, NumberInput, Select, SimpleGrid, Stack, Switch, Table, TagsInput, Text, TextInput } from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import InputEditor from "@/components/Input/InputEditor";
import { Get, Post, Put } from "@/utils/REST";
import Cookies from "js-cookie";
import z from "zod";
import { useRouter } from "next/router";
import { useListState } from "@mantine/hooks";
import { useEffect, useState, useCallback } from "react";
import useLoggedUser from "@/utils/useLoggedUser";

const storeSchema = z.object<Record<keyof MerchandiseState, z.ZodTypeAny>>({
  name: z.string().min(1, { message: '"Wajib Diisi' }),
  weight: z.number().min(0, { message: '"Wajib Diisi' }),
  sku: z.string().min(1, { message: '"Wajib Diisi' }),
  stock: z.number().min(0, { message: '"Wajib Diisi' }),
  is_variant: z.any().nullable(),
  price: z.number().min(0, { message: '"Wajib Diisi' }),
  description: z.string().min(1, { message: '"Wajib Diisi' }),
  image: z.array(z.any()).min(1, { message: "Masukan minimal satu gambar" }),
  variant_name: z.number().optional().nullable(),
  variant: z
    .array(
      z.object({
        name: z.string({ message: '"Wajib Diisi' }).min(1, { message: '"Wajib Diisi' }),
        sku: z.string({ message: '"Wajib Diisi' }).min(1, { message: '"Wajib Diisi' }),
        stock: z.number({ message: '"Wajib Diisi' }).min(0, { message: '"Wajib Diisi' }),
        price: z.number({ message: '"Wajib Diisi' }).min(0, { message: '"Wajib Diisi' }),
        weight: z.number({ message: '"Wajib Diisi' }).min(0, { message: '"Wajib Diisi' }),
        status: z.boolean().nullable().optional(),
        sub_name: z.string().nullable().optional(),
      })
    )
    .optional()
    .nullable(),
  status: z.boolean().nullable().optional(),
});

export default function CreateMerchandise({ onClose, id }: Readonly<ComponentProps>) {
  const [merchId, setMerchId] = useState<number>();
  const [imageList, setImageList] = useState<MerchandiseShowResponse["product_image"]>();
  const [loading, setLoading] = useListState<string>();
  const [variantCategory, setVariantCategory] = useState<VariantCategoryListResponse[]>();
  const user = useLoggedUser();

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    if (id) {
      Get(`product/${id}`, {})
        .then((res: any) => {
          if (res.data) {
            const data = res.data as MerchandiseShowResponse;
            setMerchId(data.id);
            setImageList(data.product_image);

            if (data.is_product_varian) form.setValues({ is_variant: Boolean(data.is_product_varian) });
            form.setValues({
              name: data.product_name,
              sku: data.sku,
              price: parseInt(data.price ?? "0"),
              stock: data.qty ?? 0,
              weight: parseInt(data.weight ?? "0"),
              description: data.description ?? "",
              image: data.product_image.map((e) => e.image_url),
              variant_name: data.product_varian.length > 0 ? data.product_varian[0].varian_category_id : 0,
              variant: data.product_varian.map((e) => ({
                id: e.id,
                name: e.varian_name,
                sku: e.sku,
                stock: e.stock_qty,
                price: parseInt(e.price ?? "0"),
                weight: e.weight !== undefined && e.weight !== null && e.weight !== "" ? Number(e.weight) : undefined,
                status: true,
                sub_name: "", // initial empty for existing variants 
              })),
            });
          }
          setLoading.filter((e) => e != "getdata");
        })
        .catch((err) => {
          console.log(err);
          setLoading.filter((e) => e != "getdata");
        });
    }
    if (!variantCategory) {
      Get(`product-varian-category`, {})
        .then((res: any) => {
          if (res.data) {
            console.log(res.data);
            const data = res.data as VariantCategoryListResponse[];
            setVariantCategory(data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const router = useRouter();
  const form = useForm<MerchandiseState>({
    initialValues: {
      is_variant: false,
      name: "",
      sku: "",
      weight: 0,
      stock: 0,
      price: 0,
      description: "",
      image: [],
      variant_name: 0,
      variant: [],
      status: true,
    },
    validate: zodResolver(storeSchema),
  });

  // const handleSave = async (isDraft: boolean = false) => {
  //   const valid = form.validate();
  //   var product_id: number | null = null;
  //   if (valid.hasErrors) return;

  //   setLoading.append("save");
  //   const { name, description, price, sku, image, status, variant, stock, is_variant, variant_name } = form.values;

  //   try {
  //     const resProduct: any = await Post(
  //       Boolean(id) ? `product/${merchId}` : "product",
  //       {
  //         product_name: name,
  //         description: description ?? "-",
  //         sku,
  //         price: price ?? 99999,
  //         image: image.map((e) => (e instanceof Blob ? e : imageList?.find((z) => e == z.image_url)?.image ?? "")),
  //         product_status_id: isDraft ? 1 : status == undefined ? 2 : status ? 2 : 3,
  //         creator_id: user?.has_creator?.id ?? 0,
  //         // order: 10,
  //         // can_purchasable: 1,
  //         qty: stock ?? 0,
  //         weight: form.values.weight ?? 1,
  //         show_stock_out: 1,
  //         max_purchase_quantity: 100,
  //         low_quantity_warning: 4,
  //         // refundable: 0,
  //         discount: 0,
  //         // is_product_quantity_multiply: 1,
  //         add_to_flash_sale: 0,
  //         is_product_varian: is_variant ? 1 : 0,
  //         product_variant: is_variant
  //           ? JSON.stringify(
  //               variant.map((e) => ({
  //                 id: e.id,
  //                 varian_name: e.name,
  //                 sku: e.sku ?? "",
  //                 price: e.price ?? 999999,
  //                 weight: e.weight ?? 1,
  //                 stock_qty: e.stock ?? 0,
  //                 varian_category_id: variant_name,
  //                 status_product: e.status ? "active" : "inactive",
  //               })) satisfies VariantStoreRequest[]
  //             )
  //           : "[]",
  //       } satisfies MerchandiseStoreRequest,
  //       "multipart/form-data"
  //     );
  //     product_id = resProduct.data.id as number;

  //     if (resProduct.status) router.reload();
  //   } catch (err: any) {
  //     const error = err?.response?.data?.errors;
  //     if (error) {
  //       form.setErrors({ ...error, name: error.slug ?? error.product_name });
  //     }
  //   } finally {
  //     setLoading.filter((e) => e != "save");
  //   }
  // };

  const handleSave = async (isDraft: boolean = false) => {
    const valid = form.validate();
    var product_id: number | null = null;
    if (valid.hasErrors) return;

    setLoading.append("save");
    const { name, description, price, sku, image, status, variant, stock, is_variant, variant_name } = form.values;

    try {
      const resProduct: any = await Post(
        Boolean(id) ? `product/${merchId}` : "product",
        {
          product_name: name,
          description: description ?? "-",
          sku,
          price: price ?? 99999,
          image: image.map((e) => (e instanceof Blob ? e : imageList?.find((z) => e == z.image_url)?.image ?? "")),
          product_status_id: isDraft ? 1 : status == undefined ? 2 : status ? 2 : 3,
          creator_id: user?.has_creator?.id ?? 0,
          // order: 10,
          // can_purchasable: 1,
          qty: stock ?? 0,
          weight: form.values.weight ?? 1,
          show_stock_out: 1,
          max_purchase_quantity: 100,
          low_quantity_warning: 4,
          // refundable: 0,
          discount: 0,
          // is_product_quantity_multiply: 1,
          add_to_flash_sale: 0,
          is_product_varian: is_variant ? 1 : 0,
          product_variant: is_variant
            ? JSON.stringify(
              variant.map((e) => ({
                id: e.id,
                varian_name: e.sub_name ? `${e.name} - ${e.sub_name}` : e.name,
                sku: e.sku ?? "",
                price: e.price ?? 999999,
                weight: e.weight ?? 1,
                stock_qty: e.stock ?? 0,
                varian_category_id: variant_name,
                status_product: e.status ? "active" : "inactive",
              })) satisfies VariantStoreRequest[]
            )
            : "[]",
        } satisfies MerchandiseStoreRequest,
        "multipart/form-data"
      );
      product_id = resProduct.data.id as number;

      if (resProduct.status) router.reload();
    } catch (err: any) {
      const error = err?.response?.data?.errors;
      if (error) {
        form.setErrors({ ...error, name: error.slug ?? error.product_name });
      }
    } finally {
      setLoading.filter((e) => e != "save");
    }
  };

  const handleImageChange = useCallback(
    (files: File[] | null) => {
      if (files) {
        form.setValues((prev) => ({
          ...prev,
          image: [...(prev.image ?? []), ...files],
        }));
      }
    },
    [form]
  );

  const handleImageDelete = useCallback(
    (idx: number) => {
      form.setValues((prev) => ({
        ...prev,
        image: (prev.image ?? []).filter((_, z) => z !== idx),
      }));
    },
    [form]
  );

  return (
    <div className="bg-white rounded-[8px] w-full">
      <div className="flex flex-col w-full">

        <div className="w-full pb-[20px]">
          <div className="py-[20px] px-[20px] flex flex-col gap-[30px]">
            <div>
              <h2 className="text-[30px] font-[600]">{!Boolean(id) ? "Buat" : "Update"} Produk</h2>
              <p className="text-grey">{!Boolean(id) ? "Lengkapi form dibawah untuk membuat Produk" : "Lengkapi form dibawah untuk update Produk"}</p>
            </div>

            <div className="border border-[#E2EDFF] rounded-[8px]">
              <h3 className="text-[20px] font-[500] p-[12px_16px] border-b border-[#E2EDFF]">Informasi Produk</h3>

              <div className="p-[24px_16px] flex flex-col gap-[20px]">
                <div className="flex flex-wrap gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      Foto Produk <span className="text-red-400">*</span>
                    </h4>
                    <p className="text-grey mt-[5px]">Direkomendasikan tidak lebih dari 2mb</p>
                  </div>
                  <div className="flex-grow overflow-x-auto">
                    <InputWrapper error={form.errors.image}>
                      <Box pb={10}>
                        {(() => {
                          return (
                            <ImageInputMultiple
                              value={form.values.image}
                              onChange={handleImageChange}
                              onDelete={handleImageDelete}
                              //onChange={files => {
                              //    if (files) {
                              //        form.setValues({ image: [...form.values.image, ...files] });
                              //    }
                              //}}
                              //onDelete={idx => form.setValues({ image: form.values.image.filter((_, z) => z !== idx) })}
                              floattext={"Utama"}
                            />
                          );
                        })()}
                      </Box>
                    </InputWrapper>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      Nama Produk <span className="text-red-400">*</span>
                    </h4>
                  </div>
                  <div className="flex-grow [&_*]:border-[#E2EDFF]">
                    <TextInput placeholder="Isi Nama Produk" error={form.errors.name} value={form.values.name} onChange={(e) => form.setValues({ name: e.target.value })} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      SKU Produk <span className="text-red-400">*</span>
                    </h4>
                  </div>
                  <div className="flex-grow [&_*]:border-[#E2EDFF]">
                    <Flex gap={10}>
                      <ActionIcon variant="filled" bg="#0B387C" size={36} radius="md" title="Generate SKU" onClick={() => form.setFieldValue('sku', `${user?.has_creator?.id ?? 0}-${Math.floor(100000 + Math.random() * 900000)}`)}>
                        <Icon icon="ph:link-bold" className="text-lg" />
                      </ActionIcon>
                      <TextInput className="flex-grow" placeholder="Isi SKU Produk" error={form.errors.sku} value={form.values.sku} onChange={(e) => form.setFieldValue('sku', e.target.value.replaceAll(/\s/g, ""))} />
                    </Flex>
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

            <Switch checked={form.values.is_variant} onChange={(e) => form.setFieldValue("is_variant", e.target.checked)} label="Gunakan Varian Produk" />

            <div className={`${form.values.is_variant ? "hidden" : ""} border border-[#E2EDFF] rounded-[8px]`}>
              <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`}>
                <h3 className="text-[20px] font-[500]">Detail Produk</h3>
              </Flex>

              <div className="p-[16px] flex flex-col gap-[20px]">
                <div className="flex flex-wrap items-center gap-[20px]">
                  <div className="min-w-[200px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      Harga <span className="text-red-400">*</span>
                    </h4>
                  </div>
                  <div className="flex-grow">
                    <NumberInput error={form.errors.price} value={form.values.price} onChange={(e) => form.setValues({ price: e as number })} hideControls placeholder="Isi Harga" decimalSeparator="," thousandSeparator="." prefix="Rp " />
                  </div>
                </div>
                <div className="flex flex-wrap gap-[20px]">
                  <div className="min-w-[200px] shrink-0 mt-[12px]">
                    <h4 className="text-[16px] font-[500]">
                      {!Boolean(id) ? "Stok" : "Stok Awal"} <span className="text-red-400">*</span>
                    </h4>
                  </div>
                  <Stack className="flex-grow">
                    <NumberInput error={form.errors.stock} value={form.values.stock} onChange={(e) => form.setValues({ stock: e as number })} hideControls type="text" placeholder="Isi Stok" disabled={Boolean(id)} />
                    <Checkbox label="Tampilkan label jika stok habis" />
                  </Stack>
                </div>
                <div className="flex flex-wrap items-center gap-[20px]">
                  <div className="min-w-[200px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      Berat <span className="text-red-400">*</span>
                    </h4>
                  </div>
                  <div className="flex-grow">
                    <NumberInput
                      error={form.errors.weight}
                      value={form.values.weight}
                      onChange={(e) => form.setValues({ weight: e as number })}
                      hideControls
                      type="text"
                      placeholder="Isi Berat"
                      suffix=" gr"
                      decimalSeparator=","
                      thousandSeparator="."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`${form.values.is_variant ? "" : "hidden"} border border-[#E2EDFF] rounded-[8px]`}>
              <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`} wrap="wrap">
                <h3 className="text-[20px] font-[500]">Varian Produk</h3>
                {/* <Button
                                    p={0}
                                    onClick={() => form.setValues({ variant: [...form.values.variant, { name: '', value: [] }] })}
                                    color="#0B387C"
                                    variant="transparent"
                                    leftSection={
                                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99967 5.93262V11.266M5.33301 8.59928H10.6663M14.6663 8.59928C14.6663 12.2812 11.6816 15.266 7.99967 15.266C4.31778 15.266 1.33301 12.2812 1.33301 8.59928C1.33301 4.91739 4.31778 1.93262 7.99967 1.93262C11.6816 1.93262 14.6663 4.91739 14.6663 8.59928Z" stroke="#0B387C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    }
                                >Tambah Varian</Button> */}
              </Flex>

              <div className="p-[16px_20px] flex flex-col gap-[10px]">
                <Flex align="end" gap={10} wrap="wrap">
                  <Flex gap={10} align="center" w="100%">
                    <Select
                      searchable
                      placeholder="Kategori Varian"
                      value={String(form.values.variant_name)}
                      onChange={(e) => e && form.setValues({ variant_name: parseInt(e as string) })}
                      data={variantCategory?.map((e) => ({ value: String(e.id), label: e.varian_name }))}
                      style={{ width: 200 }}
                    />
                    {(() => {
                      const selectedCategoryName = variantCategory?.find((e) => e.id === form.values.variant_name)?.varian_name;
                      const tagsPlaceholder = selectedCategoryName ? `Masukkan Nama ${selectedCategoryName}` : `Masukan Nama Varian`;
                      return (
                        <TagsInput
                          w="100%"
                          value={form.values.variant.map((e) => e.name)}
                          onChange={(e) =>
                            form.setValues({
                              variant: e.map((val, i) => ({
                                name: val,
                                sku: form.values.variant[i]?.sku ?? "",
                                stock: form.values.variant[i]?.stock ?? 0,
                                price: form.values.variant[i]?.price ?? 0,
                                weight: form.values.variant[i]?.weight ?? 0,
                                status: form.values.variant[i] ? form.values.variant[i].status : true,
                                sub_name: form.values.variant[i]?.sub_name ?? "",
                              })),
                            })
                          }
                          placeholder={tagsPlaceholder}
                        />
                      );
                    })()}
                  </Flex>
                </Flex>

                {form.values.variant.length == 0 && <Text className={`!text-grey`}>Tambah Varian terlebih dahulu untuk mengatur varian</Text>}

                <Divider label="Atur Varian" my={10} display={form.values.variant[0] && Boolean(form.values.variant[0].name) ? undefined : "none"} />

                <Card className={`!overflow-auto`} withBorder p={0} display={form.values.variant[0] && Boolean(form.values.variant[0].name) ? undefined : "none"}>
                  <Table className={`min-w-[700px]`} horizontalSpacing="md" verticalSpacing="sm">
                    <Table.Thead className="bg-[#f5f7fa] border-b-2 border-[#e8e8e8]">
                      <Table.Tr>
                        <Table.Th className="text-[12px] font-[700] text-[#777] uppercase tracking-wider">{!Boolean(form.values.variant_name) ? "Kategori" : variantCategory?.find((e) => e.id == form.values.variant_name)?.varian_name}</Table.Th>
                        <Table.Th className="text-[12px] font-[700] text-[#777] uppercase tracking-wider">Varian</Table.Th>
                        <Table.Th className="text-[12px] font-[700] text-[#777] uppercase tracking-wider">SKU</Table.Th>
                        <Table.Th className="text-[12px] font-[700] text-[#777] uppercase tracking-wider">Harga</Table.Th>
                        <Table.Th className="text-[12px] font-[700] text-[#777] uppercase tracking-wider">Berat</Table.Th>
                        <Table.Th className="text-[12px] font-[700] text-[#777] uppercase tracking-wider">{!Boolean(id) ? "Stok" : "Stok Awal"}</Table.Th>
                        <Table.Th className="text-[12px] font-[700] text-[#777] uppercase tracking-wider">Aktif</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {form.values.variant.map((e, i) => (
                        <Table.Tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <Table.Td miw={100} fw={500}>{e.name}</Table.Td>
                          <Table.Td>
                            <TextInput maw={200} placeholder="Isi Nama Varian" value={form.values.variant[i].sub_name || ""} onChange={(e) => form.setFieldValue(`variant.${i}.sub_name`, e.target.value)} />
                          </Table.Td>
                          <Table.Td>
                            <Flex gap={5}>
                              <TextInput className="flex-grow" placeholder="Isi SKU Varian" value={form.values.variant[i].sku} onChange={(e) => form.setFieldValue(`variant.${i}.sku`, e.target.value)} error={form.errors[`variant.${i}.sku`]} />
                              <ActionIcon variant="filled" bg="#0B387C" size={36} radius="md" onClick={() => form.setFieldValue(`variant.${i}.sku`, `${user?.has_creator?.id ?? 0}-${Math.floor(100000 + Math.random() * 900000)}`)} title="Generate SKU">
                                <Icon icon="ph:link-bold" className="text-lg" />
                              </ActionIcon>
                            </Flex>
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              maw={200}
                              hideControls
                              placeholder="Isi Harga Varian"
                              prefix="Rp "
                              thousandSeparator="."
                              decimalSeparator=","
                              value={form.values.variant[i].price}
                              onChange={(e) => form.setFieldValue(`variant.${i}.price`, e)}
                              error={form.errors[`variant.${i}.price`]}
                            />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              maw={200}
                              hideControls
                              placeholder="Isi Berat Varian"
                              suffix=" gr"
                              thousandSeparator="."
                              decimalSeparator=","
                              value={form.values.variant[i].weight}
                              onChange={(e) => form.setFieldValue(`variant.${i}.weight`, e)}
                              error={form.errors[`variant.${i}.weight`]}
                            />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              maw={200}
                              hideControls
                              placeholder="Isi Stok Varian"
                              value={form.values.variant[i].stock}
                              onChange={(e) => form.setFieldValue(`variant.${i}.stock`, e)}
                              error={form.errors[`variant.${i}.stock`]}
                              decimalSeparator=","
                              thousandSeparator="."
                              disabled={Boolean(id)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Switch color="#0B387C" checked={form.values.variant[i].status} onChange={(e) => form.setFieldValue(`variant.${i}.status`, e.target.checked)} error={form.errors[`variant.${i}.status`]} />
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
                <h3 className="text-[20px] font-[500]">Deskripsi Produk</h3>
              </Flex>

              <div className="p-[16px] flex flex-col gap-[20px]">
                <InputWrapper error={form.errors.description}>
                  <InputEditor
                    theme="snow"
                    onChange={(value: string) => form.setValues({ description: value })}
                    value={form.values.description}
                    placeholder="Ketik Syarat & Ketentuan"
                    modules={{
                      toolbar: [[{ header: "1" }], ["bold", "italic", "underline", "strike"], [{ list: "bullet" }]],
                      clipboard: {
                        matchVisual: false,
                      },
                    }}
                    className="editor"
                  />
                </InputWrapper>
              </div>
            </div>

            <div className="border border-[#E2EDFF] rounded-[8px]">
              <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`}>
                <h3 className="text-[20px] font-[500]">Status Produk</h3>
                <Switch defaultChecked size="md" color="#0B387C" checked={form.values.status} onChange={(e) => form.setValues({ status: e.target.checked })} />
              </Flex>

              <div className="p-[16px] flex flex-col gap-[20px]">
                <Text c="gray">Jika status aktif, berarti produkmu dapat dicari pembeli</Text>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2EDFF] py-[15px] shrink-0">
          <div className="px-[20px]">
            <Flex gap={10} justify="space-between">
              <Button
                onClick={() => onClose && onClose()}
                className={`!border-[#E2EDFF]`}
                variant="subtle"
                color="gray"
                radius="xl"
                leftSection={<Icon icon="solar:arrow-left-linear" width={16} />}
              >
                Kembali
              </Button>

              <Flex gap={10}>
                <Button
                  loading={loading.includes("save")}
                  onClick={() => handleSave(true)}
                  className={`!border-[#E2EDFF]`}
                  variant="outline"
                  color="#0B387C"
                  radius="xl"
                  leftSection={<Icon icon="solar:diskette-bold" width={16} />}
                >
                  Simpan Draf
                </Button>

                <Button
                  loading={loading.includes("save")}
                  onClick={() => handleSave(false)}
                  bg="#0B387C"
                  radius="xl"
                  leftSection={<Icon icon="solar:check-circle-bold" width={16} />}
                >
                  {Boolean(id) ? "Simpan Produk" : "Buat Produk"}
                </Button>
              </Flex>
            </Flex>
          </div>
        </div>
      </div>
    </div>
  );
}
