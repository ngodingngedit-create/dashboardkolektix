import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Flex,
  Stack,
  Text,
  TextInput,
  Textarea,
  Button as ButtonM,
  SimpleGrid,
  Select,
  Image as MantineImage,
  Box,
  LoadingOverlay,
  Group,
  Divider,
} from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import { Get, Put } from "@/utils/REST";

interface SiteSettingsData {
  id: number;
  slug: string;
  site_name: string;
  favicon: string | null;
  og_image: string | null;
  website_logo: string | null;
  website_title: string;
  website_metaname: string;
  website_description: string;
  website_keywords: string;
  website_email: string;
  website_phone: string;
  dashboard_title: string;
  dashboard_logo: string | null;
  dashboard_icon: string | null;
  login_logo: string | null;
  is_active: boolean | number;
}

export default function AdminSiteSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settingId, setSettingId] = useState<number>(1);

  // Text inputs
  const [slug, setSlug] = useState("");
  const [siteName, setSiteName] = useState("");
  const [websiteTitle, setWebsiteTitle] = useState("");
  const [websiteMetaname, setWebsiteMetaname] = useState("");
  const [websiteDescription, setWebsiteDescription] = useState("");
  const [websiteKeywords, setWebsiteKeywords] = useState("");
  const [websiteEmail, setWebsiteEmail] = useState("");
  const [websitePhone, setWebsitePhone] = useState("");
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [isActive, setIsActive] = useState<string>("1");

  // Images (holds URL or base64 data)
  const [websiteLogo, setWebsiteLogo] = useState<string | null>(null);
  const [dashboardLogo, setDashboardLogo] = useState<string | null>(null);
  const [dashboardIcon, setDashboardIcon] = useState<string | null>(null);
  const [loginLogo, setLoginLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);

  const websiteLogoRef = useRef<HTMLInputElement>(null);
  const dashboardLogoRef = useRef<HTMLInputElement>(null);
  const dashboardIconRef = useRef<HTMLInputElement>(null);
  const loginLogoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const ogImageRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await toBase64(file);
        setter(base64);
      } catch (err) {
        console.error(err);
        notifications.show({
          title: "Gagal",
          message: "Gagal memproses file gambar",
          color: "red",
        });
      }
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res: any = await Get("site-settings/active", {});
      const data: SiteSettingsData = res?.data || res;
      if (data) {
        if (data.id) setSettingId(data.id);
        setSlug(data.slug || "");
        setSiteName(data.site_name || "");
        setWebsiteTitle(data.website_title || "");
        setWebsiteMetaname(data.website_metaname || "");
        setWebsiteDescription(data.website_description || "");
        setWebsiteKeywords(data.website_keywords || "");
        setWebsiteEmail(data.website_email || "");
        setWebsitePhone(data.website_phone || "");
        setDashboardTitle(data.dashboard_title || "");
        setIsActive(data.is_active ? "1" : "0");

        setWebsiteLogo(data.website_logo || null);
        setDashboardLogo(data.dashboard_logo || null);
        setDashboardIcon(data.dashboard_icon || null);
        setLoginLogo(data.login_logo || null);
        setFavicon(data.favicon || null);
        setOgImage(data.og_image || null);
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Error",
        message: "Gagal mengambil data site settings",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      slug,
      site_name: siteName,
      favicon,
      og_image: ogImage,
      website_logo: websiteLogo,
      website_title: websiteTitle,
      website_metaname: websiteMetaname,
      website_description: websiteDescription,
      website_keywords: websiteKeywords,
      website_email: websiteEmail,
      website_phone: websitePhone,
      dashboard_title: dashboardTitle,
      dashboard_logo: dashboardLogo,
      dashboard_icon: dashboardIcon,
      login_logo: loginLogo,
      is_active: Number(isActive),
    };

    try {
      await Put(`admin-data/site-settings/${settingId}`, payload);
      notifications.show({
        title: "Sukses",
        message: "Site settings berhasil diperbarui",
        color: "green",
      });
      fetchSettings();
    } catch (error: any) {
      console.error(error);
      notifications.show({
        title: "Gagal",
        message:
          error?.response?.data?.message || "Gagal memperbarui site settings",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderUploadField = (
    label: string,
    value: string | null,
    setter: (val: string | null) => void,
    inputRef: React.RefObject<HTMLInputElement>
  ) => (
    <Stack gap={6}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, setter)}
      />
      <Box
        p="sm"
        style={{
          border: "1px dashed #ced4da",
          borderRadius: 8,
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 140,
        }}
      >
        {value ? (
          <Stack align="center" gap={8}>
            <MantineImage
              src={value}
              alt={label}
              fit="contain"
              w={100}
              h={70}
              radius="sm"
            />
            <Group gap={6}>
              <ButtonM
                size="xs"
                variant="light"
                color="blue"
                onClick={() => inputRef.current?.click()}
              >
                Ganti
              </ButtonM>
              <ButtonM
                size="xs"
                variant="light"
                color="red"
                onClick={() => {
                  setter(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Hapus
              </ButtonM>
            </Group>
          </Stack>
        ) : (
          <Stack align="center" gap={6}>
            <Icon icon="ph:image" className="text-3xl text-gray-400" />
            <ButtonM
              size="xs"
              variant="light"
              color="blue"
              onClick={() => inputRef.current?.click()}
            >
              Upload Gambar
            </ButtonM>
          </Stack>
        )}
      </Box>
    </Stack>
  );

  return (
    <div className="flex flex-col gap-6 p-6 pb-28 min-h-screen bg-gray-50/50">
      <Flex justify="space-between" align="center" mb={10}>
        <Flex align="center" gap={12}>
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-100 transition-all shadow-sm"
            aria-label="Kembali ke Dashboard Admin"
          >
            <Icon icon="ph:arrow-left-bold" />
          </button>
          <Stack gap={5}>
            <Text size="1.8rem" fw={600}>
              Site Settings
            </Text>
            <Text size="sm" c="gray">
              Kelola konfigurasi nama situs, SEO meta, kontak, dan logo aplikasi
            </Text>
          </Stack>
        </Flex>
      </Flex>

      <form id="site-settings-form" onSubmit={handleSubmit}>
        <Box pos="relative">
          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

          <Stack gap="lg">
            {/* General Info */}
            <Card withBorder radius="md" p="lg" className="shadow-sm">
              <Text fw={600} size="md" mb="md">
                Informasi Umum
              </Text>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Site Name"
                  required
                  placeholder="Kolektix"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
                <TextInput
                  label="Slug"
                  required
                  placeholder="kolektix"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <TextInput
                  label="Dashboard Title"
                  placeholder="Kolektix Dashboard"
                  value={dashboardTitle}
                  onChange={(e) => setDashboardTitle(e.target.value)}
                />
                <Select
                  label="Status Situs"
                  data={[
                    { value: "1", label: "Aktif" },
                    { value: "0", label: "Nonaktif" },
                  ]}
                  value={isActive}
                  onChange={(val) => setIsActive(val || "1")}
                />
              </SimpleGrid>
            </Card>

            {/* SEO & Meta */}
            <Card withBorder radius="md" p="lg" className="shadow-sm">
              <Text fw={600} size="md" mb="md">
                SEO & Metadata
              </Text>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Website Title"
                  placeholder="Kolektix Ticketing"
                  value={websiteTitle}
                  onChange={(e) => setWebsiteTitle(e.target.value)}
                />
                <TextInput
                  label="Website Metaname"
                  placeholder="Kolektix - Platform Tiket Online"
                  value={websiteMetaname}
                  onChange={(e) => setWebsiteMetaname(e.target.value)}
                />
              </SimpleGrid>
              <Box mt="md">
                <Textarea
                  label="Website Description"
                  minRows={3}
                  placeholder="Deskripsi website..."
                  value={websiteDescription}
                  onChange={(e) => setWebsiteDescription(e.target.value)}
                />
              </Box>
              <Box mt="md">
                <TextInput
                  label="Website Keywords"
                  placeholder="tiket event, tiket konser, kolektix"
                  value={websiteKeywords}
                  onChange={(e) => setWebsiteKeywords(e.target.value)}
                />
              </Box>
            </Card>

            {/* Kontak */}
            <Card withBorder radius="md" p="lg" className="shadow-sm">
              <Text fw={600} size="md" mb="md">
                Kontak & Bantuan
              </Text>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Website Email"
                  type="email"
                  placeholder="admin@kolektix.com"
                  value={websiteEmail}
                  onChange={(e) => setWebsiteEmail(e.target.value)}
                />
                <TextInput
                  label="Website Phone"
                  placeholder="081234567890"
                  value={websitePhone}
                  onChange={(e) => setWebsitePhone(e.target.value)}
                />
              </SimpleGrid>
            </Card>

            {/* Logo & Icons (Base64) */}
            <Card withBorder radius="md" p="lg" className="shadow-sm">
              <Stack gap={4} mb="md">
                <Text fw={600} size="md">
                  Logo & Ikon (Base64)
                </Text>
                <Text size="xs" c="dimmed">
                  File gambar otomatis dikonversi ke format base64 string saat diunggah.
                </Text>
              </Stack>
              <Divider mb="md" />

              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {renderUploadField(
                  "Website Logo",
                  websiteLogo,
                  setWebsiteLogo,
                  websiteLogoRef
                )}
                {renderUploadField(
                  "Dashboard Logo",
                  dashboardLogo,
                  setDashboardLogo,
                  dashboardLogoRef
                )}
                {renderUploadField(
                  "Dashboard Icon",
                  dashboardIcon,
                  setDashboardIcon,
                  dashboardIconRef
                )}
                {renderUploadField(
                  "Login Logo",
                  loginLogo,
                  setLoginLogo,
                  loginLogoRef
                )}
                {renderUploadField(
                  "Favicon",
                  favicon,
                  setFavicon,
                  faviconRef
                )}
                {renderUploadField(
                  "OG Image (Social Share)",
                  ogImage,
                  setOgImage,
                  ogImageRef
                )}
              </SimpleGrid>
            </Card>
          </Stack>
        </Box>
      </form>

      {/* Sticky Bottom Bar */}
      <div className="border-t border-light-grey fixed bottom-0 left-0 md:left-[65px] right-0 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40 p-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <Text size="sm" c="dimmed" className="hidden sm:block">
            Pastikan seluruh data dan logo telah sesuai sebelum menyimpan perubahan.
          </Text>
          <div className="flex justify-end w-full sm:w-auto">
            <ButtonM
              form="site-settings-form"
              type="submit"
              size="md"
              radius="md"
              color="blue"
              loading={submitting}
              leftSection={<Icon icon="ph:floppy-disk-bold" className="text-xl" />}
            >
              Simpan Perubahan
            </ButtonM>
          </div>
        </div>
      </div>
    </div>
  );
}
