import { SeatmapData } from "@/utils/formInterface";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ActionIcon, Box, Button, Card, Center, ColorInput, ColorPicker, Flex, InputWrapper, Modal, NumberInput, ScrollArea, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { useDidUpdate, useListState } from "@mantine/hooks";
import { useRef, useState } from "react";
import SeatmapComponent from "./SeatmapComponent";
import { modals } from "@mantine/modals";
import Moveable, { OnDrag, OnDragEnd, OnResize, OnResizeEnd, OnRotate, OnRotateEnd } from 'react-moveable';
import { Athiti } from "next/font/google";
import chunk from "@/utils/chunk";
import _ from "lodash";
import { isNotEmpty, useForm } from "@mantine/form";

type ComponentProps = {
    editable?: boolean;
};

export default function Seatmap({ editable = true }: Readonly<ComponentProps>) {
    const [isCanvasMove, setIsCanvasMove] = useState(false);
    const [canvasPos, setCanvasPos] = useState<[number, number]>([0, 0]);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [selectedSeat, setSelectedSeat] = useListState<string>([]);
    const [modalArea, setModalArea] = useState<number | 'new'>();
    const [scale, setScale] = useState(1);
    const [data, setData] = useListState<SeatmapData>([
        {
            position: [0, 0],
            size: [300, 30],
            type: 'box',
            text: 'Main Stage',
        }
    ]);
    const areaForm = useForm<SeatmapData>({
        validate: {
            col: isNotEmpty(),
            prefix: isNotEmpty(),
            row: isNotEmpty(),
        }
    });
    const { setFieldValue: areaSetValue, values: areaVal, setValues: setAreaVal, getInputProps: areaProps, reset } = areaForm;
    const contentRef = useRef<Array<HTMLParagraphElement | null>>([]);
    const canvasContainerRef = useRef(null);
    const baseContainerRef = useRef(null);

    useDidUpdate(() => {
        if (typeof modalArea == 'number') {
            setAreaVal(data[modalArea]);
        } else {
            setAreaVal({
                position: [0, 0],
                size: [300, 200],
                type: 'seat',
                text: '',
                prefix: '',
                row: 0,
                col: 0,
            });
            reset();
        }
    }, [modalArea]);

    const handleSaveArea = () => {
        if (areaForm.validate().hasErrors && modalArea != 0) return;

        if (typeof modalArea == 'number') {
            setData.setItem(modalArea, areaVal);
        } else {
            setData.append({
                ...areaVal, 
                position: [0, 0],
                size: [300, 200],
                type: 'seat',
            });
        }

        reset();
        setModalArea(undefined);
    };

    const handleDeleteArea = () => {
        modals.openConfirmModal({
            centered: true,
            title: 'Hapus Area',
            children: 'Apakah kamu yakin ingin menghapus area ini?',
            labels: { confirm: 'Hapus', cancel: 'Batal' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                if (typeof modalArea == 'number') {
                    setData.remove(modalArea);
                    reset();
                    setModalArea(undefined);
                }

            }
        });
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        console.log(event.deltaY)
        if (event.deltaY > 0) {
            scale > 0.5 && setScale(scale - 0.1);
        } else if (event.deltaY < 0) {
            scale < 2 && setScale(scale + 0.1);
        }
    };

    const handleMouse = {
        down: () => { setIsCanvasMove(true) },
        up: () => { setIsCanvasMove(false) },
        move: (event: React.MouseEvent<HTMLDivElement>) => {
            if (isCanvasMove) {
                setCanvasPos([canvasPos[0] + event.movementX, canvasPos[1] + event.movementY]);
            }
        }
    }

    const changeRef = (index: number, element: HTMLParagraphElement | null) => {
        contentRef.current[index] = element;
    };

    const handleSelect = (id: number | null) => {
        setSelected(id);
    };

    const handleSelectSeat = (seatnumber: string) => {
        if (selectedSeat.includes(seatnumber)) {
            setSelectedSeat.filter(e => e != seatnumber);
        } else {
            setSelectedSeat.setState(_.uniq([...selectedSeat, seatnumber]));
        }
    }

    const handleMoved = ({ target }: OnDragEnd) => {
        const left = parseInt(target.style.left.replaceAll(/[^0-9-.]/g, ''));
        const top = parseInt(target.style.top.replaceAll(/[^0-9-.]/g, ''));

        setData.applyWhere(
            (_, i) => i == selected,
            (e) => ({...e, position: [left, top]}),
        );
    };

    const handleResized = ({ target }: OnResizeEnd) => {
        const width = parseInt(target.style.width.split('px')[0]);
        const height = parseInt(target.style.height.split('px')[0]);

        setData.applyWhere(
            (_, i) => i == selected,
            (e) => ({...e, size: [width, height]}),
        );
    };

    const handleRotated = ({ target }: OnRotateEnd) => {
        const rotation = parseInt(target.style.transform.split('rotate(')[1].split('px')[0]);
        setData.applyWhere(
            (_, i) => i == selected,
            (e) => ({...e, rotation })
        );
    };

    return (
        <div onWheel={handleWheel} className={`h-full relative z-20`}>
            <Card withBorder radius={10} pos="relative" h="100%" className={`overflow-auto`} component={Center}>
                <Text className={`absolute top-4 left-2/4 -translate-x-2/4 z-50`} size="xs" c="gray">Seatmap Editor</Text>
                {/* <Text className={`absolute top-8 left-0 w-full z-50`} size="xs" c="gray">{JSON.stringify([scale, data])}</Text> */}
                <Box className={`!absolute bottom-4 left-2/4 -translate-x-2/4 z-50`}>
                    <Button onClick={() => setModalArea('new')} size="xs" bg="gray.1" c="gray.6" leftSection={<Icon icon="uiw:plus" />}>
                        Tambah Area
                    </Button>
                </Box>
                <Flex className={`!absolute bottom-4 right-4 z-50`} gap={10}>
                    <ActionIcon color="gray.1" radius="xl" onClick={() => scale > 0.5 && setScale(scale - 0.1)}>
                        <Icon icon="uiw:minus" className={`text-primary-base`} />
                    </ActionIcon>
                    <ActionIcon color="gray.1" radius="xl" onClick={() => scale < 2 && setScale(scale + 0.1)}>
                        <Icon icon="uiw:plus" className={`text-primary-base`} />
                    </ActionIcon>
                </Flex>

                <Card
                    pos="relative"
                    style={{
                        scale: `${scale * 100}%`,
                        transform: `translate(${canvasPos[0]}px,${canvasPos[1]}px)`
                    }}
                    className={`z-30 !overflow-visible`}
                >
                    <Box className={`absolute top-2/4 left-2/4 w-[2px] h-[999vh] bg-grey/10 -translate-y-2/4 -translate-x-2/4`}/>
                    <Box className={`absolute top-2/4 left-2/4 w-[999vw] h-[2px] bg-grey/10 -translate-y-2/4 -translate-x-2/4`}/>

                    <Modal
                        centered
                        opened={modalArea != undefined}
                        onClose={() => setModalArea(undefined)}
                        title={modalArea == 'new' ? "Buat Area Baru" : "Edit Area"}>
                        <Stack>
                            <TextInput
                                label="Label Area"
                                placeholder="Isi Label Area"
                                {...areaProps('text')}
                            />

                            <Flex className={`[&>*]:flex-grow`} gap={15} display={modalArea == 0 ? 'none' : undefined}>
                                <NumberInput
                                    withAsterisk
                                    hideControls
                                    label="Jumlah Kolom"
                                    placeholder="Isi Jumlah Kolom"
                                    {...areaProps('col')}
                                />
                                <NumberInput
                                    withAsterisk
                                    hideControls
                                    label="Jumlah Baris"
                                    placeholder="Isi Jumlah Baris"
                                    {...areaProps('row')}
                                />
                                <TextInput
                                    withAsterisk
                                    mt={5}
                                    description="Code Seat Number"
                                    placeholder="Isi Code"
                                    {...areaProps('prefix')}
                                />
                            </Flex>

                            <ColorInput
                                label="Warna Area"
                                className={`[&_.mantine-ColorPicker-body]:!hidden [&_.mantine-ColorPicker-saturation]:!hidden`}
                                swatches={['#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                                {...areaProps('background')}
                            />

                            <Flex gap={10} align="center" mt={10} justify="end">
                                {(typeof modalArea == 'number' && modalArea != 0) && (
                                    <ActionIcon color="red" onClick={handleDeleteArea} variant="transparent">
                                        <Icon icon="uiw:delete" className={`text-[24px]`} />
                                    </ActionIcon>
                                )}
                                <Button onClick={handleSaveArea}>
                                    {modalArea == 'new' ? 'Tambah' : 'Simpan'} Area
                                </Button>
                            </Flex>
                        </Stack>
                    </Modal>

                    <Box className={`absolute z-30 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4`}>
                        {data.map((e, i) => (
                            // <Tooltip label={e.text} position="bottom" bg="gray.1" c="gray.8" key={i} withArrow>
                                <Box
                                    className={`absolute z-30`}
                                    style={{
                                        zIndex: i == selected ? 200 : undefined,
                                        top: `${e.position[1]}px`,
                                        left: `${e.position[0]}px`,
                                        width: e.size && e.size[0] ? `${e.size[0]}px` : undefined,
                                        height: e.size && e.size[1] ? `${e.size[1]}px` : undefined
                                    }}
                                    ref={el => changeRef(i, el)}
                                    key={i}>
                                    <Flex className={`absolute bottom-[-35px] right-0 ${i == selected ? '' : '!hidden'}`}>
                                        <Tooltip label="Edit Area" position="bottom">
                                            <ActionIcon onClick={() => setModalArea(i)} bg="gray.1" c="gray.6">
                                                <Icon icon="uiw:edit" />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Flex>

                                    <Box
                                        bg={e.background ?? "gray.1"}
                                        h="100%"
                                        className={`rounded-md`}>
                                        <Box onClick={() => handleSelect(i)} className={`absolute w-full h-full left-0 top-0 z-20`} />

                                        {e.type == 'box' && (
                                            <Center h="100%">
                                                <Text>{e.text}</Text>
                                            </Center>
                                        )}

                                        {e.type == 'seat' && (
                                            <Stack h="100%" align="center" justify="center" gap={5} p={10}>
                                                {e.text && <Text size="xs" c="gray">{e.text}</Text>}
                                                <Stack gap={5} w="100%" h="100%" justify="space-between">
                                                    {chunk((Array((e.row ?? 1) * (e.col ?? 1)).fill(e.prefix).map((e, i) => (`${e}${i + 1}`)) ?? []), (e.col ?? 1)).map((e, r) => (
                                                        <Flex gap={5} w="100%" h="100%" justify="space-between" key={r}>
                                                            {e.map((e, c) => (
                                                                <Box onClick={() => handleSelectSeat(e)} w="100%" h="100%" key={c} className={`rounded-md ${selectedSeat.includes(e) ? 'bg-primary-base' : 'bg-grey/50'} relative z-40 cursor-pointer`}>
                                                                    <Center w="100%" h="100%">
                                                                        <Text size="xs" c="white" className={`uppercase`}>
                                                                            {e}
                                                                        </Text>
                                                                    </Center>
                                                                </Box>
                                                            ))}
                                                        </Flex>
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        )}

                                    </Box>
                                    {/* <Text className={`absolute top-[calc(100%_+_8px)] left-0 text-[8px]`} c="blue" size="8px">
                                        {JSON.stringify(e)}
                                    </Text> */}
                                </Box>
                            // </Tooltip>
                        ))}
                    </Box>

                    {
                        (editable && selected != null) && (
                            <>
                                <Moveable
                                    origin
                                    draggable
                                    resizable
                                    rotatable
                                    roundable
                                    roundRelative={false}
                                    snapContainer={canvasContainerRef}
                                    snapDirections={{ left: true, top: true, right: true, bottom: true, center: true, middle: true }}
                                    snapRotationDegrees={Array(Math.round(360/15)).fill(0).map((e, i) => i * 15)}
                                    target={contentRef.current[selected]}
                                    onDragEnd={handleMoved}
                                    onResizeEnd={handleResized}
                                    onRotateEnd={handleRotated}
                                    onResize={({ target, width, height, delta }: OnResize) => {
                                        document.querySelectorAll('._content').forEach(e => {
                                            if (e instanceof HTMLElement) e.style.outline = '1px dashed blue';
                                        });
                                        delta[0] && (target!.style.width = `${width}px`);
                                        delta[1] && (target!.style.height = `${height}px`);
                                    }}
                                    onDrag={({ target, transform, left, top }: OnDrag) => {
                                        target!.style.top = `${top}px`;
                                        target!.style.left = `${left}px`;
                                    }}
                                    onRotate={({ target, transform }: OnRotate) => {
                                        target!.style.transform = transform;
                                    }}
                                    onRound={({ target, borderRadius }) => {
                                        target!.style.borderRadius = borderRadius;
                                    }}
                                />
                            </>
                        )
                    }
                </Card>

                <div
                    onMouseMove={handleMouse.move}
                    onMouseDown={handleMouse.down}
                    onMouseUp={handleMouse.up}
                    style={{
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                    }}
                    onClick={() => {
                        handleSelect(null)
                    }}
                    onDragEnd={(target) => {
                        console.log(target)
                    }}
                />
            </Card>
        </div>
    );
}