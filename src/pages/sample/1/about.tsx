import { AspectRatio, Container, Flex, Text, Image, Divider, Stack } from "@mantine/core";
import SampleLayout from "./layout";
import Image2 from "../../../assets/images/Foto=2.png"

export default function About() {
    return (
        <SampleLayout>
            <Container py={80}>
                <Stack gap={30}>
                    <Text size="2rem" fw={600} className={`font-[Lexend]`}>Tentang Event</Text>

                    <Divider />

                    <Flex justify="space-between" align="center" gap={30}>
                        <Text maw={500}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin purus enim, elementum eget sagittis nec, lobortis sed dui. Vivamus consequat semper ipsum, nec tempus nibh dictum in. Vestibulum tincidunt sem mi, non congue ipsum bibendum a. Nullam at tincidunt lacus. Sed convallis nisi sit amet nunc sollicitudin, a eleifend metus ullamcorper.</Text>

                        <AspectRatio ratio={2/1} maw={400} w="100%" className="shrink-0">
                            <Image src={Image2.src} bg="gray.8" />
                        </AspectRatio>
                    </Flex>
                </Stack>
            </Container>
        </SampleLayout>
    )
}