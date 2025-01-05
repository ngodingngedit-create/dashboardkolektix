import { Icon } from "@iconify/react/dist/iconify.js";
import { ActionIcon, Box, Card, Container, Flex, Image, NumberFormatter, Stack, Text, Tooltip } from "@mantine/core";
import Head from "next/head";
import Link from "next/link";
import { PropsWithChildren } from "react";
import Logo from "../../../assets/images/logosquare.png"
import style from './style.module.css';
import Image4 from "../../../assets/images/sample4.webp";
import Image5 from "../../../assets/images/sample5.webp";

const Navbar = () => {
    return (
        <Box pos="fixed" w="100%" top={0} left={0} className={`z-50`}>
            <Container pos="relative">
                <Flex py={20} justify="space-between" gap={30} align="center">
                    <Text size="xl" fw={800} className={`!font-[Host_Grotesk] italic`}>MUZICON</Text>

                    <Flex gap={30} className={`hover:[&>*]:opacity-50 transition-opacity`} align="center">
                        <Link href="/sample/1#ticket">
                            <Text size="md" fw={200}>Pesan Tiket</Text>
                        </Link>
                        <Link href="/sample/1/merchandise">
                            <Text size="md" fw={200}>Merchandise</Text>
                        </Link>
                        <Link href="/sample/1/about">
                            <Text size="md" fw={200}>Tentang Event</Text>
                        </Link>
                        <ActionIcon variant="transparent" color="white">
                            <Icon icon="uiw:search" />
                        </ActionIcon>
                    </Flex>
                </Flex>
                <Tooltip label="Powered by Kolektix" openDelay={2000}>
                    <Box className={`absolute top-0 right-[-50px]`} bg="#0B387C" p={5} pt={20}>
                        <Image src={Logo.src} h={36} />
                    </Box>
                </Tooltip>
            </Container>
        </Box>
    )
}

export default function SampleLayout({ children }: PropsWithChildren) {
    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
                <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300..700&display=swap" rel="stylesheet"/>
            </Head>
            <Box mih="100vh" className={`${style.bg}`} c="white">
                <Navbar />
                {children}
            </Box>
        </>
    )
}

type MerchCardProps = {
    data: {
        image: string;
        name: string;
        price: number;
        category?: string;
    };
}

export const MerchCard = ({ data }: MerchCardProps) => {
    return (
        <Card radius={0} bg="transparent" p={0} c="white" component={Link} href="#">
            <Image src={Math.floor(Math.random() * 10) > 5 ? Image4.src : Image5.src} bg="gray.8" />
            <Stack gap={0} pt={10} pb={15} pr={10}>
                <Text size="xs">{data.category}</Text>
                <Text fw={600}>{data.name}</Text>
                <Text><NumberFormatter value={data.price} /></Text>
            </Stack>
        </Card>
    )
}