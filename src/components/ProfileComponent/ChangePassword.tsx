import { Card, Divider, PasswordInput, Stack, Text, Title, Button, Flex } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useListState } from '@mantine/hooks';

type ComponentProps = {};

export const changepasswordSchema = z.object({
    old_password: z.string().nonempty("Password lama tidak boleh kosong."),
    new_password: z.string()
        .min(8, "Password baru harus minimal 8 karakter.")
        .max(20, "Password baru harus maksimal 20 karakter.")
        .regex(/[A-Z]/, "Password baru harus mengandung setidaknya satu huruf kapital.")
        .regex(/[a-z]/, "Password baru harus mengandung setidaknya satu huruf kecil.")
        .regex(/[0-9]/, "Password baru harus mengandung setidaknya satu angka.")
        .regex(/[\W_]/, "Password baru harus mengandung setidaknya satu karakter khusus."),
    confirm_password: z.string().nonempty("Konfirmasi password tidak boleh kosong.")
}).refine(data => data.new_password === data.confirm_password, {
    message: "Konfirmasi password harus sama dengan password baru.",
    path: ["confirm_password"],
});

export default function ChangePassword({}: Readonly<ComponentProps>) {
    const [loading, setLoading] = useListState<string>();

    const form = useForm({
        initialValues: {
            old_password: '',
            new_password: '',
            confirm_password: '',
        },
        validate: zodResolver(changepasswordSchema),
    });

    const handleSave = async () => {
        const valid = form.validate();
        if (valid.hasErrors) return;
    }

    return (
        <Card className={`max-w-2xl mx-auto !mt-5 !border-2 !border-primary-light-200 !rounded-xl !p-5`}>
            <Stack gap={20}>
                <Stack gap={0}>
                    <Title order={3} fw={600} c="gray.8">
                        Ganti Password
                    </Title>
                    <Text c="gray" fw={400} size="sm">
                        Perbarui Kata Sandi Anda dan Jaga Keamanan Akun
                    </Text>
                </Stack>

                <Divider />

                <Stack gap={15}>
                    <PasswordInput
                        label="Password Lama"
                        placeholder="Masukan Password Lama Anda"
                        {...form.getInputProps('old_password')}
                        key={form.key('old_password')}
                    />

                    <PasswordInput
                        label="Password Baru"
                        placeholder="Masukan Password Baru Anda"
                        {...form.getInputProps('new_password')}
                        key={form.key('new_password')}
                    />

                    <PasswordInput
                        label="Konfirmasi Password"
                        placeholder="Ulangi Password Baru Anda"
                        {...form.getInputProps('confirm_password')}
                        key={form.key('confirm_password')}
                    />

                    <Flex justify="end">
                        <Button
                            color="#0B387C"
                            w="fit-content"
                            radius="xl"
                            mt={10}
                            onClick={handleSave}
                            loading={loading.includes('save')}
                        >Simpan Password</Button>
                    </Flex>
                </Stack>

            </Stack>
        </Card>
    );
}
