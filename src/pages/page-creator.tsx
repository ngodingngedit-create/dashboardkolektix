import { AspectRatio, Box, Container, Image, Stack } from "@mantine/core";

type ComponentProps = {
    
};

export default function PageCreator({  }: Readonly<ComponentProps>) {
    return (
        <Box size="xl" py={65}>
            <AspectRatio ratio={16/3.5} w="100%">
                <Image src="#" bg="gray" radius={0} />
            </AspectRatio>

            <Stack w="100%" maw={700} mt={20} gap={30}>

            </Stack>
        </Box>
    );
}