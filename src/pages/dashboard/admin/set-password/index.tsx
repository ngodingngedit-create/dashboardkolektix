import { useState } from "react";
import { Card, TextInput, PasswordInput, Button, Stack, Title, Text, Group, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react";
import { Post } from "@/utils/REST";

export default function SetPasswordAdmin() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirm_password: "",
    },
    validate: {
      email: (val) => (/^\S+@\S+\.\S+$/.test(val.trim()) ? null : "Format email tidak valid"),
      password: (val) => (val.length >= 6 ? null : "Password minimal 6 karakter"),
      confirm_password: (val, values) => (val === values.password ? null : "Konfirmasi password tidak cocok"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email.trim(),
        password: values.password,
      };

      const res: any = await Post("setup-passoword", payload);

      notifications.show({
        title: "Berhasil",
        message: res?.message || "Password berhasil diatur",
        color: "teal",
      });

      form.reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Gagal mengatur password";
      notifications.show({
        title: "Gagal",
        message: msg,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="lg">
      <Stack gap="lg" maw={520}>
        <div>
          <Title order={2} size="h3" fw={700} c="dark">
            Set Password
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Atur ulang password user berdasarkan email akun
          </Text>
        </div>

        <Card withBorder padding="xl" radius="md" shadow="sm">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email User"
                placeholder="contoh: user@kolektix.com"
                required
                leftSection={<Icon icon="ph:envelope" className="text-lg text-gray-500" />}
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Password Baru"
                placeholder="Masukkan password baru"
                required
                leftSection={<Icon icon="ph:lock" className="text-lg text-gray-500" />}
                {...form.getInputProps("password")}
              />

              <PasswordInput
                label="Konfirmasi Password"
                placeholder="Ulangi password baru"
                required
                leftSection={<Icon icon="ph:lock-key" className="text-lg text-gray-500" />}
                {...form.getInputProps("confirm_password")}
              />

              <Group justify="flex-end" mt="md">
                <Button type="submit" loading={loading} leftSection={<Icon icon="ph:check-bold" />}>
                  Simpan Password
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Box>
  );
}
