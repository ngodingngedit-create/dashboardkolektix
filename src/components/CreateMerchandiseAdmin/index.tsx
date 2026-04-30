import Logo from "@/assets/images/kolektix logo tansparant-blue.png";
import { Input } from "@nextui-org/react";
import Image from "next/image";
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

// Define Types
interface MerchandiseState {
  is_variant: boolean;
  name: string;
  sku: string;
  weight: number;
  stock: number;
  price: number;
  description: string;
  image: (string | File)[];
  variant_name: number | null;
  variant: Array<{
    id?: number;
    name: string;
    sku: string;
    stock: number;
    price: number;
    weight?: number;
    status?: boolean;
  }> | null;
  status: boolean | null;
}

interface VariantStoreRequest {
  id?: number;
  varian_name: string;
  sku: string;
  price: number;
  weight: number;
  stock_qty: number;
  varian_category_id: number;
  status_product: string;
}

interface MerchandiseStoreRequest {
  product_name: string;
  description: string;
  sku: string;
  price: number;
  image: string[];
  product_status_id: number;
  creator_id: number;
  qty: number;
  weight: string | number;
  show_stock_out: number;
  max_purchase_quantity: number;
  low_quantity_warning: number;
  discount: number;
  add_to_flash_sale: number;
  is_product_varian: number;
  product_variant: VariantStoreRequest[] | string;
}

interface MerchandiseShowResponse {
  id: number;
  product_name?: string;
  sku?: string;
  price?: string;
  qty?: number;
  weight?: string;
  description?: string;
  is_product_varian?: number;
  creator_id?: number;
  product_image: Array<{
    image_url: string;
    image?: string;
  }>;
  product_varian: Array<{
    id?: number;
    varian_name?: string;
    sku?: string;
    price?: string;
    stock_qty?: number;
    weight?: string;
    varian_category_id?: number;
  }>;
}

interface VariantCategoryListResponse {
  id: number;
  varian_name: string;
}

interface CreatorAPIResponse {
  id: number;
  user_id: string;
  name: string;
  image_url?: string;
  email?: string;
  phone_number?: string;
  has_user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

interface ComponentProps {
  onClose: () => void;
  id?: string;
}

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
      })
    )
    .optional()
    .nullable(),
  status: z.boolean().nullable().optional(),
});

const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function CreateMerchandiseAdmin({ onClose, id, creatorId }: Readonly<ComponentProps & { creatorId?: string }>) {
  const [merchId, setMerchId] = useState<number>();
  const [imageList, setImageList] = useState<MerchandiseShowResponse["product_image"]>();
  const [loading, setLoading] = useListState<string>();
  const [variantCategory, setVariantCategory] = useState<VariantCategoryListResponse[]>();
  const [selectedCreatorData, setSelectedCreatorData] = useState<CreatorAPIResponse | null>(null);
  const user = useLoggedUser();

  // Debug log untuk melihat prop creatorId
  console.log("CreateMerchandiseAdmin - creatorId prop:", creatorId);
  console.log("CreateMerchandiseAdmin - id prop:", id);

  // Gunakan creatorId dari prop jika ada (untuk admin), jika tidak gunakan dari user
  // Konversi ke number karena creator_id harus number
  const currentCreatorId = creatorId ? parseInt(creatorId) : (user?.has_creator?.id || 0);
  
  console.log("CreateMerchandiseAdmin - currentCreatorId:", currentCreatorId);

  useEffect(() => {
    getData();
  }, []);

  // Fetch data creator jika creatorId diberikan
  useEffect(() => {
    if (creatorId && !id) { // Hanya fetch untuk create baru, bukan edit
      fetchCreatorData();
    }
  }, [creatorId, id]);

  const fetchCreatorData = async () => {
    try {
      if (!creatorId) return;
      
      const creatorIdNum = parseInt(creatorId);
      console.log("Fetching creator data for ID:", creatorIdNum);
      
      const res: any = await Get(`creator/${creatorIdNum}`, {});
      if (res.data) {
        console.log("Creator data fetched:", res.data);
        setSelectedCreatorData(res.data);
      }
    } catch (err) {
      console.error("Error fetching creator data:", err);
    }
  };

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
              name: data.product_name || "",
              sku: data.sku || "",
              price: parseInt(data.price ?? "0"),
              stock: data.qty ?? 0,
              weight: parseInt(data.weight ?? "0"),
              description: data.description ?? "",
              image: data.product_image.map((e) => e.image_url),
              variant_name: data.product_varian.length > 0 ? (data.product_varian[0].varian_category_id || 0) : 0,
              variant: data.product_varian.map((e) => ({
                id: e.id,
                name: e.varian_name || "",
                sku: e.sku || "",
                stock: e.stock_qty || 0,
                price: parseInt(e.price ?? "0"),
                weight: e.weight !== undefined && e.weight !== null && e.weight !== "" ? Number(e.weight) : 0,
                status: true,
              })),
            });
            
            // Jika edit, fetch creator data
            if (data.creator_id) {
              Get(`creator/${data.creator_id}`, {})
                .then((creatorRes: any) => {
                  if (creatorRes.data) {
                    setSelectedCreatorData(creatorRes.data);
                  }
                })
                .catch(err => console.error("Error fetching creator for edit:", err));
            }
          }
          setLoading.filter((e: string) => e != "getdata");
        })
        .catch((err) => {
          console.log(err);
          setLoading.filter((e: string) => e != "getdata");
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

  const handleSave = async (isDraft: boolean = false) => {
    const valid = form.validate();
    var product_id: number | null = null;
    if (valid.hasErrors) return;

    console.log("Saving with creator ID:", currentCreatorId);
    
    setLoading.append("save");
    const { name, description, price, sku, image, status, variant, stock, is_variant, variant_name } = form.values;

    try {
      const base64Images = await Promise.all(
        image.map(async (e) => {
          if (e instanceof Blob) {
            return await fileToBase64(e);
          }
          return imageList?.find((z) => e == z.image_url)?.image ?? e;
        })
      );

      // Create variant data with proper type
      const variantData: VariantStoreRequest[] = is_variant && variant
        ? variant.map((e) => ({
            id: e.id,
            varian_name: e.name,
            sku: e.sku ?? "",
            price: Number(e.price ?? 0),
            weight: Number(e.weight ?? 0),
            stock_qty: Number(e.stock ?? 0),
            varian_category_id: variant_name || 0,
            status_product: e.status ? "active" : "inactive",
          }))
        : [];

      const requestData: MerchandiseStoreRequest = {
        product_name: name,
        description: description ?? "-",
        sku,
        price: price ?? 99999,
        image: base64Images as string[],
        product_status_id: isDraft ? 1 : status == undefined ? 2 : status ? 2 : 3,
        creator_id: currentCreatorId,
        qty: stock ?? 0,
        weight: String(form.values.weight ?? 1),
        show_stock_out: 1,
        max_purchase_quantity: 100,
        low_quantity_warning: 4,
        discount: 0,
        add_to_flash_sale: 0,
        is_product_varian: is_variant ? 1 : 0,
        product_variant: JSON.stringify(variantData),
      };

      console.log("Request data to save:", requestData);

      const resProduct: any = await Post(
        Boolean(id) ? `product/${merchId}` : "product",
        requestData
      );
      product_id = resProduct.data.id as number;

      if (resProduct.status) router.reload();
    } catch (err: any) {
      console.error("Save error:", err);
      const error = err?.response?.data?.errors;
      if (error) {
        form.setErrors({ ...error, name: error.slug ?? error.product_name });
      }
    } finally {
      setLoading.filter((e: string) => e != "save");
    }
  };

  const handleImageChange = useCallback(
    (files: File[] | null) => {
      if (files) {
        form.setValues((prev: any) => ({
          ...prev,
          image: [...(prev.image ?? []), ...files],
        }));
      }
    },
    [form]
  );

  const handleImageDelete = useCallback(
    (idx: number) => {
      form.setValues((prev: any) => ({
        ...prev,
        image: (prev.image ?? []).filter((_: any, z: number) => z !== idx),
      }));
    },
    [form]
  );

  return (
    <div className="fixed w-[100vw] h-[100vh] top-0 left-0 z-[200] bg-white">
      <div className="flex flex-col h-full w-full">
        <div className="border-b border-[#E2EDFF] p-[10px] shrink-0">
          <div className="mx-auto max-w-[1280px] px-[20px] flex justify-between items-center gap-[20px]">
            <Image src={Logo} alt="Kolektix Logo" height={32} />
          </div>
        </div>

        <div className="h-full overflow-y-auto pb-[20px]">
          <div className="mx-auto max-w-[1280px] py-[20px] px-[20px] md:px-[30px] flex flex-col gap-[30px]">
            {/* Header dengan informasi creator */}
            <div>
              <h2 className="text-[30px] font-[600]">{!Boolean(id) ? "Buat" : "Update"} Merchandise</h2>
              <p className="text-grey">
                {!Boolean(id) ? "Lengkapi form dibawah untuk membuat Merchandise" : "Lengkapi form dibawah untuk update Merchandise"}
              </p>
              
              {/* Tampilkan informasi creator jika ada */}
              {selectedCreatorData && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">Merchandise untuk Creator:</p>
                  <p className="text-blue-600">
                    {selectedCreatorData.name} 
                    {selectedCreatorData.has_user?.email && ` (${selectedCreatorData.has_user.email})`}
                  </p>
                </div>
              )}
              
              {!id && creatorId && !selectedCreatorData && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800">Memuat data creator...</p>
                </div>
              )}
            </div>

            <div className="border border-[#E2EDFF] rounded-[8px]">
              <h3 className="text-[20px] font-[500] p-[12px_16px] border-b border-[#E2EDFF]">Informasi Merchandise</h3>

              <div className="p-[24px_16px] flex flex-col gap-[20px]">
                <div className="flex flex-wrap gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      Foto Merchandise <span className="text-red-400">*</span>
                    </h4>
                    <p className="text-grey mt-[5px]">Direkomendasikan tidak lebih dari 2mb</p>
                  </div>
                  <div className="flex-grow overflow-x-auto">
                    <InputWrapper error={form.errors.image as string}>
                      <Box pb={10}>
                        <ImageInputMultiple
                          value={form.values.image}
                          onChange={handleImageChange}
                          onDelete={handleImageDelete}
                          floattext={"Utama"}
                        />
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
                    <TextInput 
                      placeholder="Isi Nama Produk" 
                      error={form.errors.name as string} 
                      value={form.values.name} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValues({ name: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      SKU Produk <span className="text-red-400">*</span>
                    </h4>
                  </div>
                  <div className="flex-grow [&_*]:border-[#E2EDFF]">
                    <TextInput 
                      placeholder="Isi SKU Produk" 
                      error={form.errors.sku as string} 
                      value={form.values.sku} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValues({ sku: e.target.value.replaceAll(/\s/g, "") })} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <Switch 
              checked={form.values.is_variant} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setFieldValue("is_variant", e.target.checked)} 
              label="Gunakan Varian Merchandise" 
            />

            <div className={`${form.values.is_variant ? "hidden" : ""} border border-[#E2EDFF] rounded-[8px]`}>
              <Flex align="center" justify="space-between" className={`p-[12px_16px] border-b border-[#E2EDFF]`}>
                <h3 className="text-[20px] font-[500]">Detail Merchandise</h3>
              </Flex>

              <div className="p-[16px] flex flex-col gap-[20px]">
                <div className="flex flex-wrap items-center gap-[20px]">
                  <div className="min-w-[200px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      Harga <span className="text-red-400">*</span>
                    </h4>
                  </div>
                  <div className="flex-grow">
                    <NumberInput 
                      error={form.errors.price as string} 
                      value={form.values.price} 
                      onChange={(value: string | number) => {
                        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
                        form.setValues({ price: numValue });
                      }} 
                      hideControls 
                      placeholder="Isi Harga" 
                      decimalSeparator="," 
                      thousandSeparator="." 
                      prefix="Rp " 
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-[20px]">
                  <div className="min-w-[200px] shrink-0 mt-[12px]">
                    <h4 className="text-[16px] font-[500]">
                      Stok <span className="text-red-400">*</span>
                    </h4>
                  </div>
                  <Stack className="flex-grow">
                    <NumberInput 
                      error={form.errors.stock as string} 
                      value={form.values.stock} 
                      onChange={(value: string | number) => {
                        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
                        form.setValues({ stock: numValue });
                      }} 
                      hideControls 
                      placeholder="Isi Stok" 
                    />
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
                      error={form.errors.weight as string}
                      value={form.values.weight}
                      onChange={(value: string | number) => {
                        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
                        form.setValues({ weight: numValue });
                      }}
                      hideControls
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
                <h3 className="text-[20px] font-[500]">Varian Merchandise</h3>
              </Flex>

              <div className="p-[16px_20px] flex flex-col gap-[10px]">
                <Flex align="end" gap={10} wrap="wrap">
                  <Flex gap={10} align="center" w="100%">
                    <Select
                      searchable
                      placeholder="Nama Varian"
                      value={String(form.values.variant_name)}
                      onChange={(value: string | null) => value && form.setValues({ variant_name: parseInt(value) })}
                      data={variantCategory?.map((e) => ({ value: String(e.id), label: e.varian_name })) || []}
                    />
                    <TagsInput
                      w="100%"
                      value={form.values.variant?.map((e) => e.name) || []}
                      onChange={(value: string[]) =>
                        form.setValues({
                          variant: value.map((name, i: number) => ({
                            ...(form.values.variant?.[i] || {}),
                            name: name,
                            sku: form.values.variant?.[i]?.sku || "",
                            stock: form.values.variant?.[i]?.stock || 0,
                            price: form.values.variant?.[i]?.price || 0,
                            weight: form.values.variant?.[i]?.weight || 0,
                            status: form.values.variant?.[i]?.status || true,
                          })),
                        })
                      }
                      placeholder="Masukan Nama Varian"
                    />
                  </Flex>
                </Flex>

                {(!form.values.variant || form.values.variant.length === 0) && <Text className="!text-grey">Tambah Varian terlebih dahulu untuk mengatur varian</Text>}

                <Divider label="Atur Varian" my={10} display={form.values.variant?.[0] && Boolean(form.values.variant[0].name) ? undefined : "none"} />

                <Card className="!overflow-auto" withBorder p={0} display={form.values.variant?.[0] && Boolean(form.values.variant[0].name) ? undefined : "none"}>
                  <Table className="[&_th]:font-[500] [&_tbody_td]:py-[15px] min-w-[700px]" horizontalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>
                          {!Boolean(form.values.variant_name) ? "Varian" : variantCategory?.find((e) => e.id == form.values.variant_name)?.varian_name || "Varian"}
                        </Table.Th>
                        <Table.Th>SKU</Table.Th>
                        <Table.Th>Harga</Table.Th>
                        <Table.Th>Berat</Table.Th>
                        <Table.Th>Stok</Table.Th>
                        <Table.Th>Aktif</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {(form.values.variant || []).map((e, i: number) => (
                        <Table.Tr key={i}>
                          <Table.Td miw={100}>{e.name}</Table.Td>
                          <Table.Td>
                            <TextInput 
                              maw={200} 
                              placeholder="Isi SKU Varian" 
                              value={e.sku} 
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setFieldValue(`variant.${i}.sku`, event.target.value)} 
                              error={form.errors[`variant.${i}.sku`] as string} 
                            />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              maw={200}
                              hideControls
                              placeholder="Isi Harga Varian"
                              prefix="Rp "
                              thousandSeparator="."
                              decimalSeparator=","
                              value={e.price}
                              onChange={(value: string | number) => {
                                const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
                                form.setFieldValue(`variant.${i}.price`, numValue);
                              }}
                              error={form.errors[`variant.${i}.price`] as string}
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
                              value={e.weight || 0}
                              onChange={(value: string | number) => {
                                const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
                                form.setFieldValue(`variant.${i}.weight`, numValue);
                              }}
                              error={form.errors[`variant.${i}.weight`] as string}
                            />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              maw={200}
                              hideControls
                              placeholder="Isi Stok Varian"
                              value={e.stock}
                              onChange={(value: string | number) => {
                                const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
                                form.setFieldValue(`variant.${i}.stock`, numValue);
                              }}
                              error={form.errors[`variant.${i}.stock`] as string}
                              decimalSeparator=","
                              thousandSeparator="."
                            />
                          </Table.Td>
                          <Table.Td>
                            <Switch 
                              color="#0B387C" 
                              checked={e.status || false} 
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setFieldValue(`variant.${i}.status`, event.target.checked)} 
                              error={form.errors[`variant.${i}.status`] as string} 
                            />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              </div>
            </div>

            <div className="border border-[#E2EDFF] rounded-[8px]">
              <Flex align="center" justify="space-between" className="p-[12px_16px] border-b border-[#E2EDFF]">
                <h3 className="text-[20px] font-[500]">Deskripsi Produk</h3>
              </Flex>

              <div className="p-[16px] flex flex-col gap-[20px]">
                <InputWrapper error={form.errors.description as string}>
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
              <Flex align="center" justify="space-between" className="p-[12px_16px] border-b border-[#E2EDFF]">
                <h3 className="text-[20px] font-[500]">Status Produk</h3>
                <Switch 
                  defaultChecked 
                  size="md" 
                  color="#0B387C" 
                  checked={form.values.status || false} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValues({ status: e.target.checked })} 
                />
              </Flex>

              <div className="p-[16px] flex flex-col gap-[20px]">
                <Text c="gray">Jika status aktif, berarti produkmu dapat dicari pembeli</Text>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2EDFF] py-[15px] shrink-0">
          <div className="mx-auto max-w-[1280px] px-[20px]">
            <Flex gap={10} justify="space-between">
              <Button onClick={() => onClose && onClose()} className="!border-[#E2EDFF]" variant="subtle" color="gray" radius="xl">
                Kembali
              </Button>

              <Flex gap={10}>
                <Button loading={loading.includes("save")} onClick={() => handleSave(true)} className="!border-[#E2EDFF]" variant="outline" color="#0B387C" radius="xl">
                  Simpan Draf
                </Button>

                <Button loading={loading.includes("save")} onClick={() => handleSave(false)} bg="#0B387C" radius="xl">
                  {Boolean(id) ? "Simpan Merchandise" : "Buat Merchandise"}
                </Button>
              </Flex>
            </Flex>
          </div>
        </div>
      </div>
    </div>
  );
}