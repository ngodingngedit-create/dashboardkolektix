import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Title, Paper, Grid, TextInput, NumberInput, Switch, Textarea, Button, Group, Tabs, FileInput, Image as MantineImage } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Get, Put } from "@/utils/REST";
import { toast } from "react-toastify";
import InputEditor from "@/components/Input/InputEditor"; // reusing their rich text component
import { LoadingOverlay } from "@mantine/core";

export default function EditEventAdmin() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      creator_id: "",
      event_social_media_id: null,
      category_id: null,
      name: "",
      slug: "",
      event_format_id: 0,
      event_topic_id: 0,
      tag: "",
      event_type_id: 1,
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      zone_time: "WIB",
      organization_method: "Offline",
      location_name: "",
      location_city: "",
      location_address: "",
      location_map: "",
      longitude: null,
      latitude: null,
      is_name: 0,
      is_phone_number: 0,
      is_birthdate: 1,
      is_email: 1,
      is_noidentity: 0,
      is_gender: 1,
      one_email_ticket: "0",
      one_id_one_ticket: "0",
      max_buy_ticket: 3,
      max_use_voucher: 2,
      ppn: null,
      admin_fee: 2000,
      admin_fee_plus: "1000",
      starting_price: 1000,
      description: "",
      term_condition: "",
      save_as_draft: "0",
      event_status_id: 3,
      activity_status: 0,
      allowed_payment_method: null,
      payment_method_custom: "QRIS,BCA,BNI,BRI,MANDIRI",
      seatmap: null,
      image_base64: "",
      image_url: "", // For previewing before changing
    }
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      Get(`event-by-creator/${id}`, {})
        .then((res: any) => {
          if (res.data) {
            const data = res.data;
            form.setValues({
              ...data,
              is_name: data.is_name ?? 0,
              is_phone_number: data.is_phone_number ?? 0,
              is_birthdate: data.is_birthdate ?? 1,
              is_email: data.is_email ?? 1,
              is_noidentity: data.is_noidentity ?? 0,
              is_gender: data.is_gender ?? 1,
            });
          }
        })
        .catch((err) => {
          toast.error("Gagal memuat data event");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = (values: typeof form.values) => {
    setSaving(true);
    
    // Convert switch booleans to 1/0
    const payload = {
      ...values,
      is_name: values.is_name ? 1 : 0,
      is_phone_number: values.is_phone_number ? 1 : 0,
      is_birthdate: values.is_birthdate ? 1 : 0,
      is_email: values.is_email ? 1 : 0,
      is_noidentity: values.is_noidentity ? 1 : 0,
      is_gender: values.is_gender ? 1 : 0,
    };

    Put(`event/${id}`, payload)
      .then((res: any) => {
        toast.success("Event berhasil diupdate!");
        router.push("/dashboard/admin/event");
      })
      .catch((err: any) => {
        toast.error(err?.response?.data?.message || "Gagal mengupdate event");
        console.error(err);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setFieldValue("image_base64", reader.result as string);
        form.setFieldValue("image_url", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading || saving} />
      <Group justify="space-between" mb="lg">
        <Title order={2}>Edit Event (Admin)</Title>
        <Button variant="default" onClick={() => router.back()}>Kembali</Button>
      </Group>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs defaultValue="basic">
          <Tabs.List mb="md">
            <Tabs.Tab value="basic" leftSection={<Icon icon="ph:info" />}>Informasi Dasar</Tabs.Tab>
            <Tabs.Tab value="datetime" leftSection={<Icon icon="ph:calendar" />}>Jadwal & Lokasi</Tabs.Tab>
            <Tabs.Tab value="config" leftSection={<Icon icon="ph:gear" />}>Konfigurasi Tiket</Tabs.Tab>
            <Tabs.Tab value="details" leftSection={<Icon icon="ph:text-align-left" />}>Deskripsi & S&K</Tabs.Tab>
          </Tabs.List>

          {/* BASIC INFORMATION */}
          <Tabs.Panel value="basic">
            <Paper withBorder p="md" radius="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Nama Event" placeholder="Nama..." required {...form.getInputProps("name")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="URL Slug" placeholder="slug-event-kamu" {...form.getInputProps("slug")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput label="Tags" placeholder="Musik, Konser..." {...form.getInputProps("tag")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <NumberInput label="Status Event (ID)" {...form.getInputProps("event_status_id")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput label="Metode Pembayaran (Custom)" {...form.getInputProps("payment_method_custom")} />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <FileInput 
                    label="Ganti Poster/Banner Event" 
                    placeholder="Upload gambar..." 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {form.values.image_url && (
                    <MantineImage 
                      src={form.values.image_url} 
                      h={200}
                      w="auto" 
                      fit="contain" 
                      mt="sm" 
                      radius="md"
                      fallbackSrc="https://placehold.co/600x400?text=No+Image"
                    />
                  )}
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* DATE TIME & LOCATION */}
          <Tabs.Panel value="datetime">
            <Paper withBorder p="md" radius="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput label="Tanggal Mulai" type="date" {...form.getInputProps("start_date")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput label="Tanggal Selesai" type="date" {...form.getInputProps("end_date")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                   <TextInput label="Zona Waktu" placeholder="WIB/WITA/WIT" {...form.getInputProps("zone_time")} />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Waktu Mulai" type="time" {...form.getInputProps("start_time")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Waktu Selesai" type="time" {...form.getInputProps("end_time")} />
                </Grid.Col>

                <Grid.Col span={12} mt="md">
                  <Title order={4} mb="xs">Lokasi Event</Title>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Metode Penyelenggaraan" placeholder="Offline/Online" {...form.getInputProps("organization_method")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Nama Lokasi" placeholder="Nama Tempat..." {...form.getInputProps("location_name")} />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea label="Alamat Lokasi" placeholder="Jl. Raya..." {...form.getInputProps("location_address")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Kota" placeholder="Jakarta, Bandung..." {...form.getInputProps("location_city")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Link Maps (Gmaps)" placeholder="https://goo.gl/maps..." {...form.getInputProps("location_map")} />
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* TICKET CONFIG */}
          <Tabs.Panel value="config">
            <Paper withBorder p="md" radius="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput label="Maks Pembelian Tiket" {...form.getInputProps("max_buy_ticket")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput label="Maks Penggunaan Voucher" {...form.getInputProps("max_use_voucher")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <NumberInput label="Admin Fee" {...form.getInputProps("admin_fee")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput label="Admin Fee Plus" {...form.getInputProps("admin_fee_plus")} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <NumberInput label="Starting Price" {...form.getInputProps("starting_price")} />
                </Grid.Col>
              </Grid>
              <Title order={4} mt="xl" mb="md">Setelan Formulir Pembeli</Title>
              <Grid>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Switch label="Wajib Nama" {...form.getInputProps("is_name", { type: 'checkbox' })} />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Switch label="Wajib No. HP" {...form.getInputProps("is_phone_number", { type: 'checkbox' })} />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Switch label="Wajib Tgl Lahir" {...form.getInputProps("is_birthdate", { type: 'checkbox' })} />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Switch label="Wajib Email" {...form.getInputProps("is_email", { type: 'checkbox' })} />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Switch label="Wajib No. KTP" {...form.getInputProps("is_noidentity", { type: 'checkbox' })} />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Switch label="Wajib Gender" {...form.getInputProps("is_gender", { type: 'checkbox' })} />
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* DESCRIPTION */}
          <Tabs.Panel value="details">
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="sm">Deskripsi Event</Title>
              <InputEditor 
                theme="snow"
                value={form.values.description}
                onChange={(v: string) => form.setFieldValue("description", v)}
                placeholder="Tulis deskripsi..."
              />

              <Title order={5} mt="xl" mb="sm">Syarat & Ketentuan</Title>
              <InputEditor 
                theme="snow"
                value={form.values.term_condition}
                onChange={(v: string) => form.setFieldValue("term_condition", v)}
                placeholder="Tulis S&K..."
              />
            </Paper>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="red" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" color="indigo">Simpan Perubahan</Button>
        </Group>
      </form>
    </Container>
  );
}
