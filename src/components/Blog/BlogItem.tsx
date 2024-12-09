import { AspectRatio, Card, Stack, Image, Text } from "@mantine/core";
import Link from "next/link";

type ComponentProps = {
    image: string;
    title: string;
    link: string;
};

export default function BlogItem({ image, title, link }: Readonly<ComponentProps>) {
    return (
        <Card p={0} radius={0} component={Link} href={link}>
            <Stack gap={10}>
                <AspectRatio ratio={16/5} w={250} maw={250} className={`shrink-0 flex-grow`}>
                    <Image radius={8} src={image} bg="gray.1" />
                </AspectRatio>

                <Stack gap={5} maw={250}>
                    <Text size="md" fw={600}>{title}</Text>
                    <Text size="xs" c="gray">Baca Selengkapnya</Text>
                </Stack>
            </Stack>
        </Card>
    );
}