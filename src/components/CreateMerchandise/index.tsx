import Logo from "@/assets/images/kolektix logo tansparant-blue.png";
import { Input } from "@nextui-org/react";
import Image from "next/image";
//import ImageInput from '../ImageInput.tsx';
import ImageInputMultiple from "../ImageInputMultiple.tsx";
import { useForm, zodResolver } from "@mantine/form";
import { ActionIcon, Box, Button, Card, Checkbox, Divider, Flex, InputWrapper, Modal, NumberInput, Select, SimpleGrid, Stack, Switch, Table, TagsInput, Text, TextInput, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import InputEditor from "@/components/Input/InputEditor";
import { Get, Post, Put } from "@/utils/REST";
import Cookies from "js-cookie";
import z from "zod";
import { useRouter } from "next/router";
import { useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useState, useCallback } from "react";
import useLoggedUser from "@/utils/useLoggedUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface StoreLocationOption {
  id: number;
  store_name: string;
  full_address: string;
  city?: { name: string };
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
  size_chart: z.array(z.any()).optional().nullable(),
  variant_name: z.number().optional().nullable(),
  store_location_id: z.number().nullable().optional(),
  is_delivery: z.boolean().nullable().optional(),
  is_pickup_instore: z.boolean().nullable().optional(),
  is_preorder: z.boolean().nullable().optional(),
  pickup_store_id: z.number().nullable().optional(),
  preorder_date_start: z.any().nullable().optional(),
  preorder_start_time: z.any().nullable().optional(),
  preorder_date_end: z.any().nullable().optional(),
  preorder_end_time: z.any().nullable().optional(),
  is_promo: z.boolean().nullable().optional(),
  promo_title: z.string().nullable().optional(),
  promo_price: z.number().nullable().optional(),
  promo_start_date: z.any().nullable().optional(),
  promo_start_time: z.any().nullable().optional(),
  promo_end_date: z.any().nullable().optional(),
  promo_end_time: z.any().nullable().optional(),
  variant: z
    .array(
      z.object({
        name: z.string({ message: 'Wajib Diisi' }).min(1, { message: 'Wajib Diisi' }),
        sku: z.string({ message: 'Wajib Diisi' }).min(1, { message: 'Wajib Diisi' }),
        stock: z.number({ message: 'Wajib Diisi' }).min(0, { message: 'Wajib Diisi' }),
        price: z.number({ message: 'Wajib Diisi' }).min(1, { message: 'Wajib Diisi' }),
        weight: z.number({ message: 'Wajib Diisi' }).min(1, { message: 'Wajib Diisi' }),
        status: z.boolean().nullable().optional(),
        sub_name: z.string().optional().nullable(),
        is_promo: z.boolean().nullable().optional(),
        promo_title: z.string().nullable().optional(),
        promo_price: z.number().nullable().optional(),
        promo_start_date: z.any().nullable().optional(),
        promo_start_time: z.any().nullable().optional(),
        promo_end_date: z.any().nullable().optional(),
        promo_end_time: z.any().nullable().optional(),
      })
    )
    .optional()
    .nullable(),
  status: z.boolean().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.is_promo && !data.is_variant) {
    if (data.promo_price === null || data.promo_price === undefined || (data.promo_price as any) === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wajib Diisi",
        path: ["promo_price"],
      });
    }
  }

  if (data.is_variant && data.variant) {
    data.variant.forEach((v: any, index: number) => {
      if (v.is_promo) {
        if (v.promo_price === null || v.promo_price === undefined || (v.promo_price as any) === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Wajib Diisi",
            path: ["variant", index, "promo_price"],
          });
        }
      }
    });
  }
});

const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const getBase64FromUrl = async (url: string): Promise<string> => {
  try {
    // Try fetching directly from the client first
    const res = await fetch(url);
    if (res.ok) {
      const blob = await res.blob();
      return await fileToBase64(blob);
    }
  } catch (clientErr) {
    console.warn("Client-side fetch failed, trying proxy...", clientErr);
  }

  const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error("Failed to fetch image via proxy");
  const data = await response.json();
  return data.base64;
};

export default function CreateMerchandise({ onClose, id }: Readonly<ComponentProps>) {
  const [merchId, setMerchId] = useState<number>();
  const [slug, setSlug] = useState<string>("");
  const [slugUrl, setSlugUrl] = useState<string>("");
  const [activePromoVariant, setActivePromoVariant] = useState<number | null>(null);

  const [imageList, setImageList] = useState<MerchandiseShowResponse["product_image"]>();
  const [sizeChartList, setSizeChartList] = useState<MerchandiseShowResponse["product_size_chart"]>();
  const [loading, setLoading] = useListState<string>();
  const [variantCategory, setVariantCategory] = useState<VariantCategoryListResponse[]>();
  const [storeLocations, setStoreLocations] = useState<StoreLocationOption[]>([]);
  const user = useLoggedUser();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (user) getStoreLocations();
  }, [user]);

  const getData = () => {
    if (id) {
      Get(`product/${id}`, {})
        .then((res: any) => {
          if (res.data) {
            const data = res.data as MerchandiseShowResponse & { slug_url?: string };
            setMerchId(data.id);
            setSlug(data.slug || "");
            setSlugUrl(data.slug_url || "");

            setImageList(data.product_image);
            if (data.product_size_chart) {
              setSizeChartList(data.product_size_chart);
            }

            const productVarian = (data as any).productVarian || (data as any).product_varian || [];
            form.setValues({
              is_variant: Boolean(data.is_product_varian),
              name: data.product_name,
              sku: data.sku,
              price: parseInt(data.price ?? "0"),
              stock: data.qty ?? 0,
              weight: parseInt(data.weight ?? "0"),
              description: data.description ?? "",
              image: data.product_image?.map((e) => e.image_url) || [],
              size_chart: data.product_size_chart?.map((e) => e.image_url) || [],
              store_location_id: (data as any).store_location_id
                ? Number((data as any).store_location_id)
                : ((data as any).has_store_location?.id
                  ? Number((data as any).has_store_location.id)
                  : ((data as any).location_id ? Number((data as any).location_id) : null)),
              is_delivery: Boolean((data as any).is_delivery),
              is_pickup_instore: Boolean((data as any).is_pickup_instore),
              is_preorder: Boolean((data as any).is_preorder),
              pickup_store_id: (data as any).pickup_store_id ? Number((data as any).pickup_store_id) : null,
              preorder_date_start: (data as any).preorder_date_start ? String((data as any).preorder_date_start).split("T")[0].split(" ")[0] : null,
              preorder_start_time: (data as any).preorder_start_time ? String((data as any).preorder_start_time) : null,
              preorder_date_end: (data as any).preorder_date_end ? String((data as any).preorder_date_end).split("T")[0].split(" ")[0] : null,
              preorder_end_time: (data as any).preorder_end_time ? String((data as any).preorder_end_time) : null,
              is_promo: Boolean((data as any).is_promo),
              promo_title: (data as any).promo_title ?? null,
              promo_price: (data as any).promo_price ? Number((data as any).promo_price) : null,
              promo_start_date: (data as any).promo_start_date ? String((data as any).promo_start_date).split("T")[0].split(" ")[0] : null,
              promo_start_time: (data as any).promo_start_time ? String((data as any).promo_start_time) : null,
              promo_end_date: (data as any).promo_end_date ? String((data as any).promo_end_date).split("T")[0].split(" ")[0] : null,
              promo_end_time: (data as any).promo_end_time ? String((data as any).promo_end_time) : null,
              variant_name: productVarian.length > 0 ? productVarian[0].varian_category_id : 0,
              variant: productVarian.map((e: any) => {
                const parts = (e.varian_name || "").split(" - ");
                const name = parts[0];
                const sub_name = parts.slice(1).join(" - ");

                let stock_awal = e.stock_qty;
                if (e.stock_summary) {
                  try {
                    const summary = typeof e.stock_summary === 'string' ? JSON.parse(e.stock_summary) : e.stock_summary;
                    if (summary && summary.stock_awal !== undefined) {
                      stock_awal = summary.stock_awal;
                    }
                  } catch (err) {
                    console.error("Failed to parse stock_summary", err);
                  }
                }

                return {
                  id: e.id,
                  name: name,
                  sku: e.sku,
                  stock: Number(stock_awal ?? 0),
                  price: parseInt(e.price ?? "0"),
                  weight: e.weight !== undefined && e.weight !== null && e.weight !== "" ? Number(e.weight) : 0,
                  status: e.is_active !== undefined ? e.is_active === 1 : (e.status_product !== "inactive"),
                  sub_name: sub_name,
                  is_promo: Boolean(e.is_promo),
                  promo_title: e.promo_title ?? null,
                  promo_price: e.promo_price ? Number(e.promo_price) : null,
                  promo_start_date: e.promo_start_date ? String(e.promo_start_date).split("T")[0].split(" ")[0] : null,
                  promo_start_time: e.promo_start_time ? String(e.promo_start_time) : null,
                  promo_end_date: e.promo_end_date ? String(e.promo_end_date).split("T")[0].split(" ")[0] : null,
                  promo_end_time: e.promo_end_time ? String(e.promo_end_time) : null,
                };
              }),
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

  const getStoreLocations = useCallback(() => {
    Get("creator", {})
      .then((res: any) => {
        const creators: any[] = res.data ?? [];
        const matched = creators.find((c: any) => c.id === user?.has_creator?.id);
        if (matched?.slug_url) {
          Get(`store-locations/creator/${matched.slug_url}`, {})
            .then((r: any) => setStoreLocations(r.data ?? []))
            .catch(() => { });
        }
      })
      .catch(() => { });
  }, [user]);

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
      size_chart: [],
      variant_name: 0,
      variant: [],
      status: true,
      store_location_id: null,
      is_delivery: false,
      is_pickup_instore: false,
      is_preorder: false,
      pickup_store_id: null,
      preorder_date_start: null,
      preorder_start_time: null,
      preorder_date_end: null,
      preorder_end_time: null,
      is_promo: false,
      promo_title: null,
      promo_price: null,
      promo_start_date: null,
      promo_start_time: null,
      promo_end_date: null,
      promo_end_time: null,
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
    if (valid.hasErrors) {
      console.log("Validation errors:", valid.errors);
      notifications.show({
        title: "Gagal Simpan",
        message: `Gagal ${Boolean(id) ? "menyimpan perubahan" : "membuat"} produk. Pastikan semua data yang dibutuhkan sudah lengkap.`,
        color: "red",
      });
      return;
    }

    setLoading.append("save");
    const { name, description, price, sku, image, size_chart, status, variant, stock, is_variant, variant_name, store_location_id, is_delivery, is_pickup_instore, is_preorder, pickup_store_id, preorder_date_start, preorder_start_time, preorder_date_end, preorder_end_time, is_promo, promo_title, promo_price, promo_start_date, promo_start_time, promo_end_date, promo_end_time } = form.values;

    try {
      const base64Images = await Promise.all(
        image.map(async (e) => {
          if (e instanceof Blob) {
            return await fileToBase64(e);
          }
          try {
            return await getBase64FromUrl(e);
          } catch (err) {
            console.error("Failed to convert image to base64:", e, err);
            return imageList?.find((z) => e == z.image_url)?.image ?? e;
          }
        })
      );

      const base64SizeCharts = await Promise.all(
        (size_chart || []).map(async (e) => {
          if (e instanceof Blob) {
            return await fileToBase64(e);
          }
          try {
            return await getBase64FromUrl(e);
          } catch (err) {
            console.error("Failed to convert size_chart to base64:", e, err);
            return sizeChartList?.find((z) => e == z.image_url)?.image ?? e;
          }
        })
      );

      const requestData: any = {
        _method: Boolean(id) ? "PUT" : undefined,
        product_name: name,
        description: description ?? "-",
        sku,
        price: price ?? 99999,
        image: base64Images as string[],
        size_chart: base64SizeCharts as string[],
        product_status_id: isDraft ? 1 : status == undefined ? 2 : status ? 2 : 3,
        creator_id: user?.has_creator?.id ?? 0,
        qty: stock ?? 0,
        weight: String(form.values.weight ?? 1),
        show_stock_out: 1,
        max_purchase_quantity: 100,
        low_quantity_warning: 4,
        discount: 0,
        add_to_flash_sale: 0,
        is_product_varian: is_variant ? 1 : 0,
        store_location_id: store_location_id !== null ? Number(store_location_id) : null,
        is_delivery: is_delivery ? 1 : 0,
        is_pickup_instore: is_pickup_instore ? 1 : 0,
        is_preorder: is_preorder ? 1 : 0,
        pickup_store_id: pickup_store_id !== null ? Number(pickup_store_id) : null,
        preorder_date_start: preorder_date_start || null,
        preorder_start_time: preorder_date_start && preorder_start_time ? `${preorder_date_start} ${preorder_start_time.length === 5 ? preorder_start_time + ":00" : preorder_start_time}` : null,
        preorder_date_end: preorder_date_end || null,
        preorder_end_time: preorder_date_end && preorder_end_time ? `${preorder_date_end} ${preorder_end_time.length === 5 ? preorder_end_time + ":00" : preorder_end_time}` : null,
        is_promo: is_promo ? 1 : 0,
        promo_title: promo_title || null,
        promo_price: promo_price !== null && promo_price !== undefined ? Number(promo_price) : null,
        promo_start_date: promo_start_date || null,
        promo_start_time: promo_start_time ? `${promo_start_time.length === 5 ? promo_start_time + ":00" : promo_start_time}` : null,
        promo_end_date: promo_end_date || null,
        promo_end_time: promo_end_time ? `${promo_end_time.length === 5 ? promo_end_time + ":00" : promo_end_time}` : null,
        product_variant: is_variant
          ? JSON.stringify(
            variant.map((e) => ({
              id: e.id,
              varian_name: e.sub_name ? `${e.name} - ${e.sub_name}` : e.name,
              sku: e.sku ?? "",
              price: Number(e.price ?? 0),
              weight: Number(e.weight ?? 0),
              stock_qty: Number(e.stock ?? 0),
              varian_category_id: variant_name,
              status_product: e.status ? "active" : "inactive",
              is_active: e.status ? 1 : 0,
              is_promo: e.is_promo ? 1 : 0,
              promo_title: e.promo_title || null,
              promo_price: e.promo_price !== null && e.promo_price !== undefined ? Number(e.promo_price) : null,
              promo_start_date: e.promo_start_date || null,
              promo_start_time: e.promo_start_time ? `${e.promo_start_time.length === 5 ? e.promo_start_time + ":00" : e.promo_start_time}` : null,
              promo_end_date: e.promo_end_date || null,
              promo_end_time: e.promo_end_time ? `${e.promo_end_time.length === 5 ? e.promo_end_time + ":00" : e.promo_end_time}` : null,
            })) satisfies VariantStoreRequest[]
          )
          : "[]",
      };

      const resProduct: any = await Post(
        Boolean(id) ? `product/${slugUrl || id}` : "product",
        requestData
      );
      product_id = resProduct.data.id as number;

      if (resProduct) {
        notifications.show({
          title: "Sukses",
          message: Boolean(id) ? "Produk berhasil diupdate" : "Produk berhasil dibuat",
          color: "green",
        });

        if (onClose) {
          onClose();
        } else {
          setTimeout(() => {
            router.push("/dashboard/merch");
          }, 1000);
        }
      }
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

  const handleSizeChartChange = useCallback(
    (files: File[] | null) => {
      if (files) {
        form.setValues((prev) => ({
          ...prev,
          size_chart: [...(prev.size_chart ?? []), ...files],
        }));
      }
    },
    [form]
  );

  const handleSizeChartDelete = useCallback(
    (idx: number) => {
      form.setValues((prev) => ({
        ...prev,
        size_chart: (prev.size_chart ?? []).filter((_, z) => z !== idx),
      }));
    },
    [form]
  );

  return (
    <div className="bg-white rounded-[8px] w-full">
      <div className="flex flex-col w-full">

        <div className="sticky top-0 bg-white z-30 border-b border-light-grey pb-4 px-[20px] pt-[20px]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onClose && onClose()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
              aria-label="Kembali"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div>
              <h2 className="text-[30px] font-[600] m-0">{!Boolean(id) ? "Buat" : "Update"} Produk</h2>
              <p className="text-grey m-0">{!Boolean(id) ? "Lengkapi form dibawah untuk membuat Produk" : "Lengkapi form dibawah untuk update Produk"}</p>
            </div>
          </div>
        </div>

        <div className="w-full pb-[100px]">
          <div className="py-[20px] px-[20px] flex flex-col gap-[30px]">

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

                <div className="flex flex-wrap gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">
                      Size Chart
                    </h4>
                    <p className="text-grey mt-[5px]">Panduan ukuran produk (opsional)</p>
                  </div>
                  <div className="flex-grow overflow-x-auto">
                    <InputWrapper error={form.errors.size_chart}>
                      <Box pb={10}>
                        <ImageInputMultiple
                          value={form.values.size_chart}
                          onChange={handleSizeChartChange}
                          onDelete={handleSizeChartDelete}
                          floattext={"Size Chart"}
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

                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">Pengiriman</h4>
                    <p className="text-grey mt-[5px] text-[13px]">Produk bisa dikirim ke pembeli</p>
                  </div>
                  <div className="flex-grow">
                    <Switch color="#0B387C" checked={form.values.is_delivery} onChange={(e) => form.setFieldValue("is_delivery", e.currentTarget.checked)} label="Aktifkan Pengiriman" />
                  </div>
                </div>

                {form.values.is_delivery && (
                  <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                    <div className="min-w-[250px] shrink-0">
                      <h4 className="text-[16px] font-[500]">Lokasi Toko</h4>
                      <p className="text-grey mt-[5px] text-[13px]">Gudang/lokasi asal produk ini</p>
                    </div>
                    <div className="flex-grow">
                      <Select
                        placeholder={storeLocations.length === 0 ? "Belum ada lokasi toko" : "Pilih lokasi toko"}
                        searchable
                        clearable
                        data={storeLocations.map((s) => ({
                          value: String(s.id),
                          label: `${s.store_name}${s.city?.name ? ` \u2014 ${s.city.name}` : ""}`,
                        }))}
                        value={form.values.store_location_id !== null && form.values.store_location_id !== undefined ? String(form.values.store_location_id) : null}
                        onChange={(v) => form.setFieldValue("store_location_id", v ? Number(v) : null)}
                        disabled={storeLocations.length === 0}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">Pickup In Store</h4>
                    <p className="text-grey mt-[5px] text-[13px]">Pembeli dapat mengambil produk di toko</p>
                  </div>
                  <div className="flex-grow">
                    <Switch color="#0B387C" checked={form.values.is_pickup_instore} onChange={(e) => form.setFieldValue("is_pickup_instore", e.currentTarget.checked)} label="Aktifkan Pickup In Store" />
                  </div>
                </div>

                {form.values.is_pickup_instore && (
                  <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                    <div className="min-w-[250px] shrink-0">
                      <h4 className="text-[16px] font-[500]">Lokasi Pickup</h4>
                      <p className="text-grey mt-[5px] text-[13px]">Pilih toko untuk pengambilan barang</p>
                    </div>
                    <div className="flex-grow">
                      <Select
                        placeholder={storeLocations.length === 0 ? "Belum ada lokasi toko" : "Pilih lokasi pickup"}
                        searchable
                        clearable
                        data={storeLocations.map((s) => ({
                          value: String(s.id),
                          label: `${s.store_name}${s.city?.name ? ` \u2014 ${s.city.name}` : ""}`,
                        }))}
                        value={form.values.pickup_store_id !== null && form.values.pickup_store_id !== undefined ? String(form.values.pickup_store_id) : null}
                        onChange={(v) => form.setFieldValue("pickup_store_id", v ? Number(v) : null)}
                        disabled={storeLocations.length === 0}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">Pre-Order</h4>
                    <p className="text-grey mt-[5px] text-[13px]">Produk ini menggunakan sistem PO</p>
                  </div>
                  <div className="flex-grow">
                    <Switch
                      color="#0B387C"
                      checked={form.values.is_preorder}
                      onChange={(e) => {
                        const isChecked = e.currentTarget.checked;
                        form.setFieldValue("is_preorder", isChecked);
                        if (isChecked) {
                          form.setFieldValue("is_pickup_instore", true);
                        }
                      }}
                      label="Aktifkan Pre-Order"
                    />
                  </div>
                </div>

                {form.values.is_preorder && (
                  <div className="flex flex-col gap-[15px]">
                    <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                      <div className="min-w-[250px] shrink-0">
                        <h4 className="text-[16px] font-[500]">Masa Pre-Order</h4>
                        <p className="text-grey mt-[5px] text-[13px]">Mulai pre-order</p>
                      </div>
                      <div className="flex-grow flex gap-[10px]">
                        <TextInput type="date" value={form.values.preorder_date_start ? String(form.values.preorder_date_start) : ""} onChange={(e) => form.setFieldValue("preorder_date_start", e.target.value)} />
                        <TextInput type="time" value={form.values.preorder_start_time ? String(form.values.preorder_start_time) : ""} onChange={(e) => form.setFieldValue("preorder_start_time", e.target.value)} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                      <div className="min-w-[250px] shrink-0">
                        <h4 className="text-[16px] font-[500]"></h4>
                        <p className="text-grey mt-[5px] text-[13px]">Akhir pre-order</p>
                      </div>
                      <div className="flex-grow flex gap-[10px]">
                        <TextInput type="date" value={form.values.preorder_date_end ? String(form.values.preorder_date_end) : ""} onChange={(e) => form.setFieldValue("preorder_date_end", e.target.value)} />
                        <TextInput type="time" value={form.values.preorder_end_time ? String(form.values.preorder_end_time) : ""} onChange={(e) => form.setFieldValue("preorder_end_time", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-[#E2EDFF] rounded-[8px] p-[16px]">
              <div className="flex flex-col gap-[20px]">
                <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                  <div className="min-w-[250px] shrink-0">
                    <h4 className="text-[16px] font-[500]">Promo Produk</h4>
                    <p className="text-grey mt-[5px] text-[13px]">Aktifkan harga promo khusus</p>
                  </div>
                  <div className="flex-grow">
                    <Switch
                      color="#0B387C"
                      checked={form.values.is_promo}
                      onChange={(e) => form.setFieldValue("is_promo", e.currentTarget.checked)}
                      label="Aktifkan Promo"
                    />
                  </div>
                </div>

                {form.values.is_promo && (
                  <div className="flex flex-col gap-[15px]">
                    <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                      <div className="min-w-[250px] shrink-0">
                        <h4 className="text-[16px] font-[500]">Detail Promo <span className="text-red-400">*</span></h4>
                        <p className="text-grey mt-[5px] text-[13px]">Judul dan harga promo</p>
                      </div>
                      <div className="flex-grow flex flex-col gap-[10px]">
                        <TextInput
                          placeholder="Judul Promo (Contoh: Flash Sale)"
                          value={form.values.promo_title || ""}
                          onChange={(e) => form.setFieldValue("promo_title", e.target.value)}
                        />
                        <NumberInput
                          placeholder="Harga Promo"
                          value={form.values.promo_price || ""}
                          onChange={(val) => form.setFieldValue("promo_price", val as number)}
                          error={form.errors.promo_price}
                          hideControls
                          decimalSeparator=","
                          thousandSeparator="."
                          prefix="Rp "
                          rightSection={
                            <Tooltip label="Harga promo ini untuk harga coret/diskon" withArrow position="top">
                              <div className="flex items-center">
                                <Icon icon="mdi:information-outline" className="text-gray-400 text-lg cursor-help" />
                              </div>
                            </Tooltip>
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                      <div className="min-w-[250px] shrink-0">
                        <h4 className="text-[16px] font-[500]">Masa Promo</h4>
                        <p className="text-grey mt-[5px] text-[13px]">Mulai promo</p>
                      </div>
                      <div className="flex-grow flex gap-[10px]">
                        <TextInput type="date" value={form.values.promo_start_date ? String(form.values.promo_start_date) : ""} onChange={(e) => form.setFieldValue("promo_start_date", e.target.value)} />
                        <TextInput type="time" value={form.values.promo_start_time ? String(form.values.promo_start_time) : ""} onChange={(e) => form.setFieldValue("promo_start_time", e.target.value)} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-[5px] md:gap-[20px]">
                      <div className="min-w-[250px] shrink-0">
                        <h4 className="text-[16px] font-[500]"></h4>
                        <p className="text-grey mt-[5px] text-[13px]">Akhir promo</p>
                      </div>
                      <div className="flex-grow flex gap-[10px]">
                        <TextInput type="date" value={form.values.promo_end_date ? String(form.values.promo_end_date) : ""} onChange={(e) => form.setFieldValue("promo_end_date", e.target.value)} />
                        <TextInput type="time" value={form.values.promo_end_time ? String(form.values.promo_end_time) : ""} onChange={(e) => form.setFieldValue("promo_end_time", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Switch checked={form.values.is_variant} disabled={Boolean(id) && form.values.variant.length > 0} onChange={(e) => form.setFieldValue("is_variant", e.target.checked)} label="Gunakan Varian Produk" />

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
                          readOnly={Boolean(id)}
                          value={form.values.variant.map((e) => e.name)}
                          onChange={(e) => {
                            if (Boolean(id) && e.length < form.values.variant.length) {
                              notifications.show({
                                title: "Peringatan",
                                message: "Varian produk tidak boleh dihapus saat sedang melakukan update.",
                                color: "red",
                              });
                              return;
                            }
                            form.setValues({
                              variant: e.map((val) => {
                                const existing = form.values.variant.find(v => v.name === val);
                                return {
                                  name: val,
                                  sku: existing?.sku ?? "",
                                  stock: existing?.stock ?? 0,
                                  price: existing?.price ?? 0,
                                  weight: existing?.weight ?? 0,
                                  status: existing ? existing.status : true,
                                  sub_name: existing?.sub_name ?? "",
                                  is_promo: existing?.is_promo ?? false,
                                  promo_title: existing?.promo_title ?? null,
                                  promo_price: existing?.promo_price ?? null,
                                  promo_start_date: existing?.promo_start_date ?? null,
                                  promo_start_time: existing?.promo_start_time ?? null,
                                  promo_end_date: existing?.promo_end_date ?? null,
                                  promo_end_time: existing?.promo_end_time ?? null,
                                };
                              }),
                            })
                          }}
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
                        <Table.Th className="text-[12px] font-[700] text-[#777] uppercase tracking-wider">Promo</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {form.values.variant.map((e, i) => (
                        <Table.Tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <Table.Td miw={100} fw={500}>{e.name}</Table.Td>
                          <Table.Td>
                            <TextInput maw={200} placeholder="Isi Nama Varian" value={form.values.variant[i].sub_name || ""} onChange={(e) => form.setFieldValue(`variant.${i}.sub_name`, e.target.value)} error={form.errors[`variant.${i}.sub_name`]} />
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
                          <Table.Td>
                            <Button
                              variant="light"
                              color={form.values.variant[i].is_promo ? "green" : "gray"}
                              size="xs"
                              onClick={() => setActivePromoVariant(i)}
                              leftSection={<Icon icon="mdi:tag" />}
                            >
                              Atur Promo
                            </Button>
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

        <div className="border-t border-[#E2EDFF] py-[15px] fixed bottom-0 left-0 md:left-[65px] hvr:md:left-[280px] right-0 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 transition-all duration-300">
          <div className="px-[20px]">
            <Flex gap={10} justify="flex-end">

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

      <Modal
        opened={activePromoVariant !== null}
        onClose={() => setActivePromoVariant(null)}
        title={`Atur Promo Varian - ${activePromoVariant !== null ? form.values.variant[activePromoVariant]?.name : ""}`}
        size="lg"
      >
        {activePromoVariant !== null && form.values.variant[activePromoVariant] && (
          <div className="flex flex-col gap-[20px]">
            <Switch
              color="#0B387C"
              checked={form.values.variant[activePromoVariant].is_promo}
              onChange={(e) => form.setFieldValue(`variant.${activePromoVariant}.is_promo`, e.currentTarget.checked)}
              label="Aktifkan Promo Khusus Varian"
            />
            {form.values.variant[activePromoVariant].is_promo && (
              <div className="flex flex-col gap-[15px]">
                <TextInput
                  label="Judul Promo"
                  placeholder="Contoh: Flash Sale Varian"
                  value={form.values.variant[activePromoVariant].promo_title || ""}
                  onChange={(e) => form.setFieldValue(`variant.${activePromoVariant}.promo_title`, e.target.value)}
                />
                <NumberInput
                  label="Harga Promo"
                  withAsterisk
                  placeholder="Harga Promo"
                  value={form.values.variant[activePromoVariant].promo_price || ""}
                  onChange={(val) => form.setFieldValue(`variant.${activePromoVariant}.promo_price`, val as number)}
                  error={form.errors[`variant.${activePromoVariant}.promo_price`]}
                  hideControls
                  decimalSeparator=","
                  thousandSeparator="."
                  prefix="Rp "
                  rightSection={
                    <Tooltip label="Harga promo ini untuk harga coret/diskon" withArrow position="top">
                      <div className="flex items-center">
                        <Icon icon="mdi:information-outline" className="text-gray-400 text-lg cursor-help" />
                      </div>
                    </Tooltip>
                  }
                />
                <div className="flex gap-[10px]">
                  <TextInput
                    label="Tgl Mulai"
                    type="date"
                    value={form.values.variant[activePromoVariant].promo_start_date ? String(form.values.variant[activePromoVariant].promo_start_date) : ""}
                    onChange={(e) => form.setFieldValue(`variant.${activePromoVariant}.promo_start_date`, e.target.value)}
                    className="flex-1"
                  />
                  <TextInput
                    label="Waktu Mulai"
                    type="time"
                    value={form.values.variant[activePromoVariant].promo_start_time ? String(form.values.variant[activePromoVariant].promo_start_time) : ""}
                    onChange={(e) => form.setFieldValue(`variant.${activePromoVariant}.promo_start_time`, e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-[10px]">
                  <TextInput
                    label="Tgl Berakhir"
                    type="date"
                    value={form.values.variant[activePromoVariant].promo_end_date ? String(form.values.variant[activePromoVariant].promo_end_date) : ""}
                    onChange={(e) => form.setFieldValue(`variant.${activePromoVariant}.promo_end_date`, e.target.value)}
                    className="flex-1"
                  />
                  <TextInput
                    label="Waktu Berakhir"
                    type="time"
                    value={form.values.variant[activePromoVariant].promo_end_time ? String(form.values.variant[activePromoVariant].promo_end_time) : ""}
                    onChange={(e) => form.setFieldValue(`variant.${activePromoVariant}.promo_end_time`, e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
            <Button color="#0B387C" onClick={() => setActivePromoVariant(null)} fullWidth mt="md">
              Tutup & Simpan
            </Button>
          </div>
        )}
      </Modal>

    </div>
  );
}
