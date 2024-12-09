import { Icon } from "@iconify/react/dist/iconify.js";
import { AspectRatio, Button, Card, Center, Flex, Image, Stack, Text } from "@mantine/core";
import bgCTA from '../assets/images/hero-bg.png';
import bg1 from '../assets/images/Foto=1.png';
import bg2 from '../assets/images/Foto=4.png';

type ComponentProps = {
    
};

export default function Wristband({  }: Readonly<ComponentProps>) {
    return (
        <Stack gap={50} px={30} pb={50} pt={90} mx="auto" maw={1080}>
            <Flex justify="space-between" gap={20} align="center" className={`flex-col-reverse md:flex-row`}>
                <Stack gap={10} maw={500}>
                    <Text className={`!leading-[130%]`} component="h1" fw={600} size="1.6rem">Cetak Tiket Gelang Jadi Lebih Praktis di Kolektix</Text>
                    <Text c="gray">Solusi lengkap untuk para Event Creator dalam pengelolaan tiket event. Mengingat banyaknya hal yang harus diperhatikan selama proses pembuatan event, dengan ini Kolektix menawarkan kemudahan. Mulai dari penjualan hingga pencetakan tiket gelang, semua sudah bisa di Kolektix. Dicetak dengan bahan berkualitas dan tahan lama, tiket gelang dirancang untuk tahan lama sepanjang acara. </Text>
                    <Flex mt={20} justify="space-between" gap={20}>
                        <Flex gap={10} align="center">
                            <Icon icon="mdi:partnership-outline" className={`text-[40px] text-primary-base`} />
                            <Stack gap={2}>
                                <Text fw={600}>100+</Text>
                                <Text c="gray" size="sm">Event Partner</Text>
                            </Stack>
                        </Flex>
                        <Flex gap={10} align="center">
                            <Icon icon="majesticons:ticket-check-line" className={`text-[40px] text-primary-base`} />
                            <Stack gap={2}>
                                <Text fw={600}>100+</Text>
                                <Text c="gray" size="sm">Ticket Handling</Text>
                            </Stack>
                        </Flex>
                        <Flex gap={10} align="center">
                            <Icon icon="cuida:map-pin-outline" className={`text-[40px] text-primary-base`} />
                            <Stack gap={2}>
                                <Text fw={600}>30+</Text>
                                <Text c="gray" size="sm">Event Cities</Text>
                            </Stack>
                        </Flex>
                    </Flex>
                </Stack>
                <AspectRatio w="100%" className={`max-w-[100%] md:!max-w-[400px]`} ratio={3/3.5}>
                    <Image src={bg1.src ?? "#"} bg="gray.1" radius={10} w="100%"/>
                </AspectRatio>
            </Flex>

            <Flex justify="space-between" gap={20} align="center" className={`flex-col-reverse md:flex-row`}>
                <AspectRatio w="100%" ratio={5/3} maw={500} className={`hidden md:block`}>
                    <Image src={bg2.src} bg="gray.1" radius={10} w="100%"/>
                </AspectRatio>
                <Stack gap={20} className={`max-w-[100%] md:max-w-[400px]`}>
                    <Text ta="start" className={`!leading-[130%]`} component="h2" fw={600} size="1.6rem">Keuntungan Cetak Tiket Gelang Dengan Kami</Text>
                    <Stack align="start">
                        <Flex align="center" gap={10}>
                            <Icon icon="material-symbols:check-circle" className={`text-[24px] text-green-500`} />
                            <Text>Terintegrasi dengan sistem tiket di Kolektix</Text>
                        </Flex>
                        <Flex align="center" gap={10}>
                            <Icon icon="material-symbols:check-circle" className={`text-[24px] text-green-500`} />
                            <Text>Bebas pilih design</Text>
                        </Flex>
                        <Flex align="center" gap={10}>
                            <Icon icon="material-symbols:check-circle" className={`text-[24px] text-green-500`} />
                            <Text>Banyak pilihan material</Text>
                        </Flex>
                        <Flex align="center" gap={10}>
                            <Icon icon="material-symbols:check-circle" className={`text-[24px] text-green-500`} />
                            <Text>Harga terjangkau</Text>
                        </Flex>
                        <Flex align="center" gap={10}>
                            <Icon icon="material-symbols:check-circle" className={`text-[24px] text-green-500`} />
                            <Text>Pengiriman cepat</Text>
                        </Flex>
                    </Stack>
                </Stack>
            </Flex>

            <Card bg="none" radius={15} pos="relative">
                <Center h="100%" className={`z-20`}>
                    <Button
                        // bg="white"
                        // className={`!text-primary-base [&_*]:!text-primary-base`}
                        size="lg"
                        rightSection={<Icon icon="bi:whatsapp" className={`text-[20px]`} />}>Hubungi Kami</Button>
                </Center>

                {/* <Image src={bgCTA.src ?? '#'} className={`absolute w-full h-full top-0 left-0 z-10`} /> */}
            </Card>
        </Stack>
    );
}