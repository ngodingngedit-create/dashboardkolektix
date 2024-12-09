import { Icon } from "@iconify/react/dist/iconify.js";
import { AspectRatio, Box, Button, Card, Container, Flex, Image, Stack, Text } from "@mantine/core";
import bg1 from '../assets/images/Foto=1.png';
import logo from '../assets/images/logosquare.png';
import BlogItem from "@/components/Blog/BlogItem";
import Link from "next/link";

type ComponentProps = {
    
};

export default function PageCreator({  }: Readonly<ComponentProps>) {

    const data = {
        listtop: [
            {
                value: 200000,
                title: 'Ticket Handling',
                icon: 'majesticons:ticket-check-line',
            },
            {
                value: 200000,
                title: 'Ticket Handling',
                icon: 'majesticons:ticket-check-line',
            },
            {
                value: 200000,
                title: 'Ticket Handling',
                icon: 'majesticons:ticket-check-line',
            },
        ]
    }

    return (
        <Box size="xl" py={65}>
            <Box pos="relative">
                <AspectRatio ratio={16/5} w="100%">
                    <Image src={bg1.src} bg="gray" radius={0} />
                </AspectRatio>

                <Box pos="absolute" p={30} className={`z-20 bottom-0 left-2/4 -translate-x-2/4 w-full max-w-[1080px]`}>
                    <Text c="white" fw={600} className={`!text-[1.3rem] md:!text-[2.5rem] max-w-[700px] !leading-[110%]`}>Jadilah Kreator Event di Kolektix Sekarang Juga!</Text>
                    <Flex gap={15} mt={15}>
                        {data.listtop.map((e, i) => (
                            <Card withBorder radius={15} key={i}>
                                <Flex gap={10} align="center">
                                    <Icon icon="majesticons:ticket-check-line" className={`text-[40px] text-primary-base`} />
                                    <Stack gap={2}>
                                        <Text fw={600}>100+</Text>
                                        <Text c="gray" size="sm">Ticket Handling</Text>
                                    </Stack>
                                </Flex>
                            </Card>
                        ))}
                    </Flex>
                </Box>
            </Box>

            <Stack w="100%" gap={30} mx="auto" px={20} mt={30}>
                <Text ta="center" mb={-15} fw={600} size="lg">Cari Informasi Tentang Creator</Text>
                <Flex gap={15} align="center" wrap="wrap" mx="auto">
                    {Array(3).fill(1).map(() => ({
                        image: bg1.src,
                        title: 'Cara Menjadi Creator Dengan Mudah Di Website Kolektix',
                        link: '#',
                    })).map((e, i) => (
                        <BlogItem
                            key={i}
                            image={e.image}
                            title={e.title}
                            link={e.link}
                        />
                    ))}
                </Flex>
                <Card withBorder className={`!border-b-0`} maw={600} radius={20} mx="auto" w="100%" mt={20}>
                    <Stack align="center">
                        <Flex align="center" gap={5} justify="center">
                            <Icon icon="ri:instagram-fill" className={`text-grey/50`} />
                            <Text size="sm" c="gray">Instagram Kolektix</Text>
                        </Flex>

                        <Flex gap={15}>
                            <Card bg="#0B387C" w="fit-content" h="fit-content" radius={999} className={`!shrink-0`}>
                                <Image src={logo.src} w={48} h={48} />
                            </Card>
                            <Stack gap={5}>
                                <Text size="xl" fw={600} c="gray.8">Kolektix</Text>
                                <Text size="sm" fw={600} c="gray" mt={-10} mb={10}>5% Engagement Rate</Text>
                                <Button variant="outline" size="xs" component={Link} href="https://instagram.com/kolektix" target="_blank">
                                    Lihat Profil
                                </Button>
                            </Stack>
                        </Flex>
                    </Stack>
                </Card>
            </Stack>
        </Box>
    );
}