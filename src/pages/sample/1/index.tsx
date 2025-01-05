import { Center, Container, Title, Text, Flex, Stack, Image, AspectRatio, Accordion, Divider, Card, Button, SimpleGrid } from "@mantine/core";
import SampleLayout, { MerchCard } from "./layout";
import { Carousel } from "@mantine/carousel";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import Image1 from "../../../assets/images/Foto=5.png"
import Image2 from "../../../assets/images/Foto=2.png"
import Image4 from "../../../assets/images/sample4.webp";
import Image5 from "../../../assets/images/sample5.webp";

const LineUp = [
    {
        "name": "Jessie Werner",
        "role": "Bass-guitar, Vocals & Strings",
        "details": "Jessie Werner is a multi-talented musician with expertise in bass guitar, vocals, and string instruments. Known for her dynamic stage presence and innovative sound."
    },
    {
        "name": "Lawrence Mercado",
        "role": "Playing Percussion & Drums",
        "details": "Lawrence Mercado specializes in percussion and drums, bringing rhythm and energy to every performance with precision and creativity."
    },
    {
        "name": "Louise Davis",
        "role": "Bass-guitar, Vocals & Soloist",
        "details": "Louise Davis combines her skills as a bassist, vocalist, and soloist to create a compelling and memorable musical experience."
    },
    {
        "name": "Floyd Moran",
        "role": "Keyboards, Guitar & Vocals",
        "details": "Floyd Moran is a versatile artist skilled in keyboards, guitar, and vocals, delivering rich harmonies and captivating performances."
    },
];

export default function SampleWebsite() {
    return (
        <SampleLayout>

            <Stack w="100%" className={`[&>*]:w-full`} gap={100} pb={60}>
                <Container size="100vw" px={0}>
                    <Carousel loop>
                        <Carousel.Slide>
                            <Center mih={500} pos="relative">
                                <Title pos="relative" size="4rem" maw={650} fw={600} className={`z-10 !leading-[85%] uppercase font-[Lexend]`} ta="center">
                                    This Music Festival <Text fw={600} c="#FCFF3C" size="4rem" className={`uppercase font-[Lexend]`} component="span">Will Be The Amazing</Text>
                                </Title>
                                <Image src={Image1.src} bg="gray.8" className={`brightness-[70%] absolute w-full h-full top-0 left-0`} />
                            </Center>
                        </Carousel.Slide>
                        <Carousel.Slide>
                            <Center mih={500} pos="relative">
                                <Title pos="relative" size="4rem" maw={650} fw={600} className={`z-10 !leading-[85%] uppercase font-[Lexend]`} ta="center">
                                    This Music Festival <Text fw={600} c="#FCFF3C" size="4rem" className={`uppercase font-[Lexend]`} component="span">Will Be The Amazing</Text>
                                </Title>
                                <Image src={Image1.src} bg="gray.8" className={`brightness-[70%] absolute w-full h-full top-0 left-0`} />
                            </Center>
                        </Carousel.Slide>
                    </Carousel>
                </Container>

                <Container className={`[&_*]:font-[Lexend]`}>
                    <Flex justify="center" gap={30} align="center">
                        <Stack align="center" gap={5}>
                            <Text size="3rem" fw={600}>10</Text>
                            <Text>Hari</Text>
                        </Stack>
                        <Text size="3rem" fw={600}>:</Text>
                        <Stack align="center" gap={5}>
                            <Text size="3rem" fw={600}>06</Text>
                            <Text>Jam</Text>
                        </Stack>
                        <Text size="3rem" fw={600}>:</Text>
                        <Stack align="center" gap={5}>
                            <Text size="3rem" fw={600}>38</Text>
                            <Text>Menit</Text>
                        </Stack>
                        <Text size="3rem" fw={600}>:</Text>
                        <Stack align="center" gap={5}>
                            <Text size="3rem" fw={600}>51</Text>
                            <Text>Detik</Text>
                        </Stack>
                    </Flex>
                </Container>

                <Container>
                    <Flex justify="space-between" align="center" gap={30}>
                        <Text maw={500}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin purus enim, elementum eget sagittis nec, lobortis sed dui. Vivamus consequat semper ipsum, nec tempus nibh dictum in. Vestibulum tincidunt sem mi, non congue ipsum bibendum a. Nullam at tincidunt lacus. Sed convallis nisi sit amet nunc sollicitudin, a eleifend metus ullamcorper.</Text>

                        <AspectRatio ratio={2/1} maw={400} w="100%" className="shrink-0">
                            <Image src={Image2.src} bg="gray.8" />
                        </AspectRatio>
                    </Flex>
                </Container>

                <Container>
                    <Stack gap={30}>
                        <Text size="2rem" fw={600} className={`font-[Lexend]`}>Meet Our Line Up</Text>
                        <Divider />
                        <Accordion>
                            {LineUp.map((e, i) => (
                                <Accordion.Item key={i} value={String(i)}>
                                    <Accordion.Control c="white" className={`hover:!text-black`}>
                                        <Text size="xl" fw={600} className={`font-[Lexend]`}>{e.name} <Text component="span" size="sm" opacity={0.7}>{e.role}</Text></Text>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Flex gap={20}>
                                            <Image src="#" w={100} h={100} bg="gray.8" className={`!shrink-0`} />
                                            <Text>{e.details}</Text>
                                        </Flex>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </Stack>
                </Container>

                <Container id="ticket">
                    <Stack gap={30} align="center">
                        <Flex align="center" c="#FCFF3C" gap={15}>
                            <Icon icon="fa-solid:ticket-alt" className={`text-[30px]`} />
                            <Text size="2rem" fw={600} className={`font-[Lexend] italic`}>Pesan Tiket</Text>
                        </Flex>

                        <Card c="white" withBorder bg="transparent" radius={0} p={30} w="100%" maw={600} className={`hover:!translate-x-2 hover:!-translate-y-2 hover:shadow-[-0.5rem_0.5rem_0_#fff] transition-all`}>
                            <Text size="2rem" fw={600} className={`font-[Lexend] italic`}>VVIP</Text>
                            <Text mt={10}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                            <Text>Rp 300.000</Text>

                            <Flex justify="end" mt={10}>
                                <Button bg="#FCFF3C" c="black" radius={0} rightSection={<Icon icon="uiw:right" />}>
                                    Pesan Tiket
                                </Button>
                            </Flex>
                        </Card>
                        <Card c="white" withBorder bg="transparent" radius={0} p={30} w="100%" maw={600} className={`hover:!translate-x-2 hover:!-translate-y-2 hover:shadow-[-0.5rem_0.5rem_0_#fff] transition-all`}>
                            <Text size="2rem" fw={600} className={`font-[Lexend] italic`}>VIP</Text>
                            <Text mt={10}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                            <Text>Rp 200.000</Text>

                            <Flex justify="end" mt={10}>
                                <Button bg="#FCFF3C" c="black" radius={0} rightSection={<Icon icon="uiw:right" />}>
                                    Pesan Tiket
                                </Button>
                            </Flex>
                        </Card>
                        <Card c="white" withBorder bg="transparent" radius={0} p={30} w="100%" maw={600} className={`hover:!translate-x-2 hover:!-translate-y-2 hover:shadow-[-0.5rem_0.5rem_0_#fff] transition-all`}>
                            <Text size="2rem" fw={600} className={`font-[Lexend] italic`}>Reguler</Text>
                            <Text mt={10}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                            <Text>Rp 100.000</Text>

                            <Flex justify="end" mt={10}>
                                <Button bg="#FCFF3C" c="black" radius={0} rightSection={<Icon icon="uiw:right" />}>
                                    Pesan Tiket
                                </Button>
                            </Flex>
                        </Card>
                    </Stack>
                </Container>

                <Container>
                    <Stack gap={30}>
                        <Text size="2rem" fw={600} className={`font-[Lexend]`}>Merchandise</Text>
                        <Divider />

                        <SimpleGrid className={`!gap-[10px_0]`} cols={4}>
                            {Array(8).fill({
                                image: Math.floor(Math.random()) == 1 ? Image4.src : Image5.src,
                                name: 'Leisure Wear Grey Stripes',
                                price: 100000,
                                category: 'T-Shirt'
                            }).map((e, i) => (
                                <MerchCard key={i} data={e} />
                            ))}
                        </SimpleGrid>

                        <Button color="gray.8" mx="auto" w="fit-content" radius={0} component={Link} href="/sample/1/merchandise">
                            Lihat Semua
                        </Button>
                    </Stack>
                </Container>
            </Stack>

        </SampleLayout>
    );
}