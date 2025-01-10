import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Card, Center, Divider, Drawer, Flex, InputWrapper, Stack, Text, TextInput, Title, UnstyledButton } from "@mantine/core";
import { DatePicker, DatePickerInput, DateTimePicker } from "@mantine/dates";
import { useState } from "react";

export default function VenuePos() {
    const [open, setOpen] = useState<string>();

    return (
        <>
            <Drawer
                title="Pilih Venue"
                position="bottom"
                w={200}
                opened={open == 'venue'}
                onClose={() => setOpen(undefined)}>

            </Drawer>

            <Card maw={900} p={30}>
                <Stack gap={0}>
                    <Title size="h2">Booking Venue</Title>
                    <Text size="sm" c="gray">Buat Booking Venue secara offline</Text>
                </Stack>

                <Divider my={30} />

                <Flex className={`[&>*]:!flex-grow`} gap={20}>
                    <Stack>
                        <UnstyledButton onClick={() => setOpen('venue')} w="100%">
                            <Card bg="gray.1" h={100} radius={10}className={`hover:shadow-inner`}>
                                <Center h="100%">
                                    <Flex align="center" gap={10} c="gray.6">
                                        <Icon icon="tabler:building" className={`text-[24px]`} />
                                        <Text size="1.2rem" fw={600}>Pilih Venue</Text>
                                    </Flex>
                                </Center>
                            </Card>
                        </UnstyledButton>

                        {/* <DatePicker
                            type="range"
                        />

                        <DateTimePicker
                            
                        /> */}

                        <Card withBorder radius={10} p={25}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="ep:user" className="text-primary-base" />
                                    <Text size="sm" className={`!text-primary-base`}>Data Pemesan</Text>
                                </Flex>

                                <TextInput
                                    required
                                    label="Nama Pemesan"
                                    placeholder="Masukan Nama Pemesan"
                                />
                                <TextInput
                                    required
                                    label="Email Pemesan"
                                    placeholder="Masukan Email Pemesan"
                                />
                                <TextInput
                                    required
                                    label="No. Telp Pemesan"
                                    placeholder="Masukan No. Telp Pemesan"
                                />
                            </Stack>
                        </Card>
                    </Stack>

                    <Stack maw={300}>
                        <Card p={20} withBorder radius={10} className={`!sticky !top-0 !overflow-visible`}>
                            <Stack>
                                <Flex align="center" gap={10}>
                                    <Icon icon="material-symbols-light:order-approve-outline" className="text-primary-base text-[20px]" />
                                    <Text size="sm" className={`!text-primary-base`}>Ringkasan Pesanan</Text>
                                </Flex>
                            </Stack>
                        </Card>
                        <Button>
                            Pesan Sekarang
                        </Button>
                    </Stack>
                </Flex>
            </Card>
        </>
    );
}