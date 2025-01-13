import { Box, Image, Container, Divider, Flex, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import SampleLayout, { MerchCard } from "./layout";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Carousel } from "@mantine/carousel";
import Image1 from "../../../assets/images/sample1.png";
import Image2 from "../../../assets/images/sample2.webp";
import Image3 from "../../../assets/images/sample3.webp";
import Image4 from "../../../assets/images/sample4.webp";
import Image5 from "../../../assets/images/sample5.webp";

export default function MerchandisePage() {
    return (
        <SampleLayout>
            <Container py={80}>
                <Stack gap={30}>
                    <Flex justify="space-between" gap={30} align="end">
                        <Text size="2rem" fw={600} className={`font-[Lexend]`}>Merchandise</Text>
                        <TextInput
                            c="white"
                            leftSection={<Icon icon="uiw:search" />}
                            variant="unstyled"
                            placeholder="Cari Merchandise"
                        />
                    </Flex>
                    <Divider />

                    <Flex className={`[&>*]:shrink-0`} gap={20}>
                        <Box w="calc(((100% / 3) * 2) - 10px)" h={250}>
                            <Carousel h={250} loop>
                                <Carousel.Slide pos="relative" h="100%" bg="red">
                                    <Image src={Image1.src} h={250} bg="gray.8" />
                                </Carousel.Slide>
                                <Carousel.Slide pos="relative" h="100%" bg="red">
                                    <Image src={Image2.src} h={250} bg="gray.8" />
                                </Carousel.Slide>
                            </Carousel>
                        </Box>
                        <Box w="calc(((100% / 3) * 1) - 10px)" h={250}>
                            <Carousel h={250} loop>
                                <Carousel.Slide pos="relative" h="100%" bg="red">
                                    <Image src={Image3.src} h={250} bg="gray.8" />
                                </Carousel.Slide>
                                <Carousel.Slide pos="relative" h="100%" bg="red">
                                    <Image src={Image4.src} h={250} bg="gray.8" />
                                </Carousel.Slide>
                            </Carousel>
                        </Box>
                    </Flex>

                    <SimpleGrid className={`!gap-[10px_0]`} cols={4}>
                        {Array(11).fill({
                            image: Math.floor(Math.random()) == 1 ? Image4.src : Image5.src,
                            name: 'Leisure Wear Grey Stripes',
                            price: 100000,
                            category: 'T-Shirt'
                        }).map((e, i) => (
                            <MerchCard key={i} data={e} />
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>
        </SampleLayout>
    );
}