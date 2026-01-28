import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from "@nextui-org/react";
import { useState, useEffect } from "react";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import ImageInput from "@/components/ImageInput.tsx";
import { notifications } from "@mantine/notifications";
import { Box, Checkbox, Flex, LoadingOverlay, Stack } from "@mantine/core";
import { EventProps } from "@/utils/globalInterface";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: number;
  eventData?: EventProps;
}

export type CategoryResponse = { id: number; name: string };

type InvitationStore<
  T = {
    fullname: string;
    email: string;
    phone: string;
  }[]
> = {
  event_id: number;
  invitation_cat_id?: number;
  invitation_title: string;
  invitation_description: string;
  total_qty: number;
  details: T;
  image?: Blob;
  is_one_receiver?: boolean;
  is_banner_image?: boolean;
  event_invitation_status?: {
    id: number;
  };
};

const isBrowser = typeof window !== "undefined";

export const invitationStoreSchema = z.object({
  event_id: z.number().int().positive(),
  invitation_cat_id: z.number().int().positive("Kategori undangan harus dipilih"),
  invitation_title: z.string().nonempty("Judul undangan tidak boleh kosong"),
  invitation_description: z.string().nonempty("Deskripsi undangan tidak boleh kosong"),
  total_qty: z.number().int().nonnegative(),
  details: z
    .array(
      z.object({
        fullname: z.string().nonempty("Nama lengkap tidak boleh kosong."),
        email: z.string().email("Format email tidak valid."),
        phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
      })
    )
    .nonempty("Detail tidak boleh kosong."),
  image: z.instanceof(Blob).optional().nullable(),
});

const AddEventModal = ({ isOpen, onClose, eventId, eventData }: AddEventModalProps) => {
  const [loading, setLoading] = useListState<string>();
  const [category, setCategory] = useState<CategoryResponse[]>([]);

  const form = useForm<InvitationStore>({
    initialValues: {
      event_id: eventId ?? 0,
      invitation_title: "",
      invitation_description: "",
      total_qty: 1,
      details: [{ fullname: "", email: "", phone: "" }],
      is_one_receiver: false,
      is_banner_image: true,
    },
    validate: zodResolver(invitationStoreSchema),
    onValuesChange: (val) => {
      if (val.is_one_receiver) val.details = [...[val.details[0]]];
      return val;
    },
  });

  useEffect(() => {
    form.reset();
  }, [isOpen]);

  useEffect(() => {
    getCategory();
    form.setValues({ event_id: eventId });
  }, [eventId]);

  const getCategory = async () => {
    await fetch<any, CategoryResponse[]>({
      url: "invitation-category",
      method: "GET",
      data: {},
      before: () => setLoading.append("getcategory"),
      success: ({ data }) => data && setCategory(data),
      complete: () => setLoading.filter((e) => e != "getcategory"),
      error: () => {},
    });
  };

  // const handleSubmit = async () => {
  //   const valid = form.validate();
  //   if (valid.hasErrors) {
  //     notifications.show({
  //       position: "top-right",
  //       color: "red",
  //       message: "Lengkapi Terlebih dahulu Form Invitation",
  //     });
  //     return;
  //   }

  //   await fetch<InvitationStore<string>, any>({
  //     url: "invitations",
  //     method: "POST",
  //     data: {
  //       ...form.values,
  //       details: JSON.stringify(form.values.is_one_receiver ? Array(form.values.total_qty).fill(form.values.details[0]) : form.values.details),
  //     },
  //     before: () => setLoading.append("submit"),
  //     success: () => {
  //       onClose();
  //     },
  //     complete: () => setLoading.filter((e) => e != "submit"),
  //   });
  // };

  const handleSubmit = async () => {
  // 1. Validasi form dengan Mantine form
  const valid = form.validate();
  if (valid.hasErrors) {
    notifications.show({
      position: "top-right",
      color: "red",
      message: "Lengkapi Terlebih dahulu Form Invitation",
    });
    return; // INI YANG HARUS DITAMBAHKIN!
  }

  // 2. Validasi tambahan untuk anti-spam
  const validationErrors: string[] = [];
  
  // Validasi email format untuk semua details
  form.values.details.forEach((detail, index) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(detail.email)) {
      validationErrors.push(`Email ${index + 1} tidak valid: ${detail.email}`);
    }
    
    // Validasi nomor telepon minimal 10 digit
    if (detail.phone.replace(/\D/g, '').length < 10) {
      validationErrors.push(`Nomor telepon ${index + 1} tidak valid`);
    }
  });

  // Validasi jumlah invitation
  if (form.values.total_qty > 50) {
    validationErrors.push("Maksimal 50 invitation per kali input");
  }

  // Validasi duplikasi email
  const emails = form.values.details.map(d => d.email.toLowerCase());
  const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
  if (duplicateEmails.length > 0) {
    validationErrors.push("Terdapat email yang duplikat");
  }

  // 3. Jika ada validasi tambahan yang gagal
  if (validationErrors.length > 0) {
    notifications.show({
      position: "top-right",
      color: "red",
      title: "Validasi Gagal",
      message: validationErrors.join("\n"),
    });
    return; // STOP di sini juga!
  }

  // 4. Rate limiting - cek waktu submit terakhir
  const lastSubmitKey = `last_submit_time_${eventId}`;
  const lastSubmitTime = localStorage.getItem(lastSubmitKey);
  const now = Date.now();
  
  if (lastSubmitTime) {
    const timeDiff = now - parseInt(lastSubmitTime);
    if (timeDiff < 10000) { // Minimal 10 detik antar submit
      notifications.show({
        position: "top-right",
        color: "yellow",
        title: "Mohon Tunggu",
        message: "Silakan tunggu 10 detik sebelum menambah invitation baru",
      });
      return; // STOP!
    }
  }

  // 5. Set waktu submit terakhir
  localStorage.setItem(lastSubmitKey, now.toString());

  // 6. Log untuk debugging
  console.log('Submitting invitation:', {
    eventId: form.values.event_id,
    totalQty: form.values.total_qty,
    detailsCount: form.values.details.length,
    timestamp: new Date().toISOString()
  });

  // 7. Siapkan data dengan metadata anti-spam
  const submissionData = {
    ...form.values,
    details: JSON.stringify(
      form.values.is_one_receiver 
        ? Array(form.values.total_qty).fill(form.values.details[0]) 
        : form.values.details
    ),
    metadata: {
      source: 'dashboard_add_modal',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      ip_hash: typeof window !== 'undefined' 
        ? btoa(navigator.userAgent + new Date().getTime()).substring(0, 32)
        : '',
      event_id: eventId
    }
  };

  // 8. Kirim ke API
  await fetch<InvitationStore<string>, any>({
    url: "invitations",
    method: "POST",
    data: submissionData,
    before: () => setLoading.append("submit"),
    success: (response) => {
      // Cek jika response ada message spam
      if (response.message?.includes('spam')) {
        notifications.show({
          position: "top-right",
          color: "red",
          title: "Gagal",
          message: "Sistem mendeteksi aktivitas mencurigakan. Silakan coba lagi nanti.",
        });
        return;
      }
      
      // Jika sukses
      notifications.show({
        position: "top-right",
        color: "green",
        message: "Invitation berhasil ditambahkan",
      });
      onClose();
      
      // Reset form
      form.reset();
    },
    complete: () => setLoading.filter((e) => e != "submit"),
    error: (error) => {
      console.error('Error adding invitation:', error);
      
      let errorMessage = "Gagal menambahkan invitation";
      
      // Handle berbagai error
      if (error.response?.status === 429) {
        errorMessage = "Terlalu banyak permintaan. Silakan coba lagi nanti.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Data tidak valid";
      } else if (error.response?.data?.message?.toLowerCase().includes('spam')) {
        errorMessage = "Email terdeteksi sebagai spam. Silakan gunakan email yang berbeda.";
      }
      
      notifications.show({
        position: "top-right",
        color: "red",
        title: "Gagal",
        message: errorMessage,
      });
    },
  });
};

  useEffect(() => {
    if (form.values.total_qty > 0) {
      form.setValues({ details: Array(form.values.total_qty).fill({ fullname: "", email: "", phone: "" }) });
    }
  }, [form.values.total_qty]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" size="2xl">
      <ModalContent>
        <ModalHeader className="text-dark">Add New Invitation</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <Stack gap={10}>
              <ImageInput
                label="Gambar"
                dimension={[300, 100]}
                value={form.values.image ?? (form.values.is_banner_image ? eventData?.image_url : undefined)}
                onChange={(e) => (form.values.is_banner_image ? undefined : form.setValues({ image: e ?? undefined }))}
              />
              <Checkbox label="Gunakan Gambar Event" checked={form.values.is_banner_image} onChange={(e) => form.setValues({ is_banner_image: e.target.checked })} />
            </Stack>
            <div className="flex flex-wrap gap-4">
              <Box className="flex-1 relative min-w-[30%]">
                <Select
                  isInvalid={Boolean(form.errors.invitation_cat_id)}
                  description={form.errors.invitation_cat_id}
                  label={<span className="text-dark">Invitation Category</span>}
                  value={form.values.invitation_cat_id}
                  onChange={(e) => form.setValues({ invitation_cat_id: category.find((_, i) => i == parseInt(e.target.value))?.id })}
                  labelPlacement="outside" // Label di atas input
                >
                  {category.map((e, i) => (
                    <SelectItem key={i} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </Select>
                <LoadingOverlay visible={loading.includes("getcategory")} loaderProps={{ size: "md", color: "#194e9e" }} />
              </Box>
              <Input
                isInvalid={Boolean(form.errors.invitation_title)}
                description={form.errors.invitation_title}
                className="flex-1 min-w-[30%]"
                label={<span className="text-dark">Invitation Title</span>}
                value={form.values.invitation_title}
                onChange={(e) => form.setValues({ invitation_title: e.target.value })}
                labelPlacement="outside" // Label di atas input
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Textarea
                isInvalid={Boolean(form.errors.invitation_description)}
                description={form.errors.invitation_description}
                className="flex-1 min-w-[30%]"
                label={<span className="text-dark">Invitation Description</span>}
                value={form.values.invitation_description}
                onChange={(e) => form.setValues({ invitation_description: e.target.value })}
                labelPlacement="outside"
                minRows={3}
                maxRows={6}
              />
            </div>

            <Flex className={`gap-[15px] md:gap-[30px]`} align="end">
              <Input
                isInvalid={Boolean(form.errors.total_qty)}
                description={form.errors.total_qty}
                min={1}
                type="number"
                className="flex-1 max-w-[20%]"
                label={<span className="text-dark">Total Qty</span>}
                value={String(form.values.total_qty)}
                onChange={(e) => form.setValues({ total_qty: parseInt(e.target.value) })}
                labelPlacement="outside" // Label di atas input
              />
              <Checkbox className={`md:mb-[10px]`} label="Kirim ke satu penerima" checked={form.values.is_one_receiver} onChange={(e) => form.setValues({ is_one_receiver: e.target.checked })} />
            </Flex>

            {(form.values.is_one_receiver ? [form.values.details[0]] : form.values.details).map((detail, index) => (
              <div key={index} className="flex flex-wrap gap-4">
                <Input
                  isInvalid={Boolean(form.errors[`details.${index}.fullname`])}
                  description={form.errors.details ? form.errors[`details.${index}.fullname`] : undefined}
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">{`Fullname ${index + 1}`}</span>}
                  value={detail.fullname}
                  onChange={(e) => form.setFieldValue(`details.${index}.fullname`, e.target.value)}
                  labelPlacement="outside"
                />
                <Input
                  isInvalid={Boolean(form.errors[`details.${index}.email`])}
                  description={form.errors.details ? form.errors[`details.${index}.email`] : undefined}
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">{`Email ${index + 1}`}</span>}
                  value={detail.email}
                  onChange={(e) => form.setFieldValue(`details.${index}.email`, e.target.value)}
                  labelPlacement="outside"
                />
                <Input
                  isInvalid={Boolean(form.errors[`details.${index}.phone`])}
                  description={form.errors.details ? form.errors[`details.${index}.phone`] : undefined}
                  className="flex-1 min-w-[30%]"
                  label={<span className="text-dark">{`Phone ${index + 1}`}</span>}
                  value={detail.phone}
                  onChange={(e) => form.setFieldValue(`details.${index}.phone`, e.target.value)}
                  labelPlacement="outside"
                />
              </div>
            ))}
            {/* <Button onClick={addDetail} className="bg-secondary text-dark">
              Tambah Penerima Invitation
            </Button> */}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit} isLoading={loading.includes("submit")} className="bg-primary text-white">
            Tambah Invitation
          </Button>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddEventModal;
