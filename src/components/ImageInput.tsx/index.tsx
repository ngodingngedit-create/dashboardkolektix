
import { ActionIcon, Box, Card, Center, FileInput, Image, InputWrapper, Text } from "@mantine/core";
import { ReactNode } from "react";
import { Icon } from "@iconify/react";

type ComponentProps = {
    floattext?: string;
    label?: string;
    error?: string | ReactNode;
    description?: string;
    value?: string | Blob | null;
    onChange?: (file: File | null) => void;
    dimension?: [number, number];
    required?: boolean;
    onDelete?: () => void;
};

export default function ImageInput({ floattext, label, error, description, value, onChange, dimension, required, onDelete }: Readonly<ComponentProps>) {
    return (
        <InputWrapper {...{ label, description, error }} withAsterisk={required}>
            <Box pos="relative" className={`[&_.clsBtn]:hover:!block`}>
                {floattext && (
                    <Card radius={8} bg="#0B387C" w="calc(100% - 14px)" className={`z-10 !absolute !bottom-[7px] left-2/4 -translate-x-2/4 !text-white text-center !p-[2px]`}>
                        <Text size="xs">{floattext}</Text>
                    </Card>
                )}

                {value && (
                    <ActionIcon
                        onClick={onDelete}
                        className={`clsBtn !hidden !absolute top-[-10px] right-[-10px] z-10`}
                        c="red"
                        size="sm"
                        bg="white"
                        radius="xl"
                    ><Icon icon="uiw:close" className={`text-[12px]`} /></ActionIcon>
                )}

                <Card
                    w={dimension ? dimension[0] : 120}
                    h={dimension ? dimension[1] : 120}
                    bg={value ? undefined : "gray.1"}
                    withBorder
                    p={0}
                    radius={8}
                    className={`cursor-pointer border-dashed`}
                    component="label"
                    pos="relative"
                >

                    <Center h="100%" pos="relative">
                        {value ? (
                            <Image
                                src={value instanceof Blob ? URL.createObjectURL(value) : value}
                                w="100%" h="100%"
                                className={`absolute top-0 left-0`}
                            />
                        ) : (
                            <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.068 4.39974H10.8014C8.56116 4.39974 7.44105 4.39974 6.58541 4.83571C5.83276 5.21921 5.22083 5.83113 4.83734 6.58378C4.40137 7.43942 4.40137 8.55953 4.40137 10.7997V21.9997C4.40137 24.24 4.40137 25.3601 4.83734 26.2157C5.22083 26.9684 5.83276 27.5803 6.58541 27.9638C7.44105 28.3997 8.56116 28.3997 10.8014 28.3997H23.068C24.308 28.3997 24.928 28.3997 25.4366 28.2634C26.817 27.8936 27.8952 26.8154 28.2651 25.435C28.4014 24.9264 28.4014 24.3064 28.4014 23.0664M25.7347 11.0664V3.06641M21.7347 7.06641H29.7347M14.4014 11.7331C14.4014 13.2058 13.2075 14.3997 11.7347 14.3997C10.2619 14.3997 9.06803 13.2058 9.06803 11.7331C9.06803 10.2603 10.2619 9.06641 11.7347 9.06641C13.2075 9.06641 14.4014 10.2603 14.4014 11.7331ZM20.3881 16.2906L9.10957 26.5438C8.47518 27.1205 8.15799 27.4089 8.12994 27.6587C8.10562 27.8752 8.18864 28.0899 8.35228 28.2338C8.54107 28.3997 8.96974 28.3997 9.82708 28.3997H22.3427C24.2616 28.3997 25.221 28.3997 25.9746 28.0774C26.9206 27.6727 27.6743 26.919 28.079 25.973C28.4014 25.2194 28.4014 24.2599 28.4014 22.341C28.4014 21.6954 28.4014 21.3726 28.3308 21.0719C28.2421 20.6941 28.072 20.3402 27.8324 20.0349C27.6417 19.792 27.3896 19.5903 26.8855 19.187L23.1558 16.2033C22.6512 15.7996 22.3989 15.5978 22.1211 15.5266C21.8762 15.4638 21.6185 15.4719 21.3781 15.55C21.1053 15.6386 20.8662 15.8559 20.3881 16.2906Z" stroke="#0B387C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        )}
                    </Center>

                    <FileInput className={`hidden`} accept=".png,.jpg,.jpeg" onChange={onChange} />
                </Card>
            </Box>
        </InputWrapper>
    );
}