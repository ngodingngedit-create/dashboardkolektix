import BlogItem from "@/components/Blog/BlogItem";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ActionIcon, AspectRatio, Container, Divider, Flex, Image, Stack, Text } from "@mantine/core";

type ComponentProps = {
    
};

export default function BlogPage({  }: Readonly<ComponentProps>) {
    return (
        <Container size="md" py={90}>
            <AspectRatio ratio={16/5} w="100%">
                <Image src="#" bg="gray" radius={15} />
            </AspectRatio>

            <Stack w="100%" maw={700} mt={20} gap={30}>

                <Stack gap={5}>
                    <Text size="sm" c="gray">Article Category - 24 December 2024</Text>
                    <Text component="h1" fw={600} size="1.5rem" className={`!leading-[120%]`}>Cara Membeli Tiket Konser Dengan Mudah Di Website Kolektix</Text>
                </Stack>

                <Divider />

                <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </Text>

                <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </Text>

                <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </Text>

                <Divider />

                <Flex gap={10} align="center">
                    <ActionIcon variant="transparent">
                        <Icon icon="uiw:share" />
                    </ActionIcon>
                </Flex>

                <Divider />

                <Stack gap={15}>
                    <Text size="sm" c="gray">Baca Blog Lainnya</Text>
                    <Stack gap={15}>
                        {Array(4).fill(1).map(() => ({
                            image: '#',
                            title: 'Cara Membeli Tiket Konser Dengan Mudah Di Website Kolektix',
                            link: '#',
                        })).map((e, i) => (
                            <BlogItem
                                key={i}
                                image={e.image}
                                title={e.title}
                                link={e.link}
                            />
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </Container>
    );
}