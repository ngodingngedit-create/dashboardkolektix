import { AspectRatio, Container, Image, Stack, Text } from "@mantine/core";

type ComponentProps = {
    
};

export default function BlogPage({  }: Readonly<ComponentProps>) {
    return (
        <Container size="lg" py={80}>
            <Stack w="100%">
                <AspectRatio ratio={16/5} w="100%">
                    <Image src="#" bg="gray" radius={15} />
                </AspectRatio>

                <Stack gap={5}>
                    <Text size="sm" c="gray">Article Category</Text>
                    <Text component="h1" fw={600} size="1.5rem" className={`!leading-[120%]`}>Cara Membeli Tiket Konser Dengan Mudah Di Website Kolektix</Text>
                </Stack>
            </Stack>
        </Container>
    );
}