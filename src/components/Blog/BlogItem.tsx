import { AspectRatio, Card, Flex, Image, Stack, Text } from "@mantine/core";
import Link from "next/link";

type ComponentProps = {
    image: string;
    title: string;
    link: string;
};

export default function BlogItem({ image, title, link }: Readonly<ComponentProps>) {
    return (
        <Card p={0} w="100%" radius={0} component={Link} href={link}>
            <Flex gap={10} wrap="wrap">
                <AspectRatio ratio={16/5} maw={250} className={`shrink-0 flex-grow`}>
                    <Image radius={4} src={image} bg="gray.1" />
                </AspectRatio>

                <Stack gap={5}>
                    <Text size="md" fw={600}>{title}</Text>
                    <Text size="xs" c="gray">Baca Selengkapnya</Text>
                </Stack>
            </Flex>
        </Card>
    );
}