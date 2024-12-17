import { SeatmapData } from "@/utils/formInterface";
import { Icon } from "@iconify/react/dist/iconify.js";
import { DEFAULT_THEME, ActionIcon, Box, Button, Card, Center, ColorInput, ColorPicker, Flex, InputWrapper, Modal, NumberInput, ScrollArea, Stack, Text, TextInput, Tooltip, colorsTuple, useMantineTheme } from "@mantine/core";
import { useDidUpdate, useListState } from "@mantine/hooks";
import { useRef, useState, useCallback, useContext, useEffect } from "react";
import SeatmapComponent from "./SeatmapComponent";
import { modals } from "@mantine/modals";
import Moveable, { MoveableRefType, OnDrag, OnDragEnd, OnResize, OnResizeEnd, OnRotate, OnRotateEnd } from 'react-moveable';
import { Athiti } from "next/font/google";
import chunk from "@/utils/chunk";
import _ from "lodash";
import { isNotEmpty, useForm } from "@mantine/form";
import { contrastColor } from "contrast-color";
import { Context } from "@/pages/create-event";

type ComponentProps = {
    editable?: boolean;
    selected?: string[];
    onSelect?: (data?: string[]) => void;
    unavailSeat?: string[];
    onSelectAll?: (data?: string[]) => void;
};

export default function Seatmap({ editable = true, selected: selectedSeat, onSelect: setSelectedSeat, unavailSeat, onSelectAll }: Readonly<ComponentProps>) {
    const [isDragSelect, setIsDragSelect] = useState<'active' | 'inactive'>();
    const [isCanvasMove, setIsCanvasMove] = useState(false);
    const [canvasPos, setCanvasPos] = useState<[number, number]>([0, 0]);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    // const [selectedSeat, setSelectedSeat] = useListState<string>([]);
    const [modalArea, setModalArea] = useState<number | 'new'>();
    const [scale, setScale] = useState(1);
    const { seatmapData: data, setSeatmapData: setData } = useContext(Context);
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
    const movableRef = useRef<MoveableRefType>(null);
    const theme = useMantineTheme();

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
            setData?.setItem(modalArea, areaVal);
        } else {
            setData?.append({
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
                    setData?.remove(modalArea);
                    reset();
                    setModalArea(undefined);
                }

            }
        });
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (event.deltaY > 0) {
            scale > 0.5 && setScale(scale - 0.1);
        } else if (event.deltaY < 0) {
            scale < 2 && setScale(scale + 0.1);
        }
    };

    const handleMouse = {
        down: () => {
            setIsCanvasMove(true);
            setSelected(null);
        },
        up: () => {
            setIsCanvasMove(false);
            setIsDragSelect(undefined);
        },
        move: (event: React.MouseEvent<HTMLDivElement>) => {
            if (isCanvasMove && selected == null) {
                setCanvasPos([canvasPos[0] + (event.movementX / scale), canvasPos[1] + (event.movementY / scale)]);
            }
        },
        boxDown: (index: number) => {
            setSelected(index);
        },
        seatDown: (seatnumber: string, index: number) => {
            setIsDragSelect(selectedSeat?.includes(seatnumber) ? 'inactive' : 'active');
            handleSelectSeat(seatnumber, index);
        },
        seatEnter: (seatnumber: string, index: number) => {
            if (isDragSelect) {
                handleSelectSeat(seatnumber, index, isDragSelect == 'active');
            }
        }
    }

    const changeRef = (index: number, element: HTMLParagraphElement | null) => {
        contentRef.current[index] = element;
    };

    const handleSelect = (id: number | null) => {
        setSelected(id);
    };

    const handleSelectSeat = (seatnumber: string, index: number, force?: boolean) => {
        if (setSelectedSeat) {
            setSelected(index);
    
            if (force) {
                setSelectedSeat && setSelectedSeat(_.uniq([...(selectedSeat ?? []), seatnumber]));
                return;
            }
    
            const isSelected = selectedSeat?.includes(seatnumber);
    
            setSelectedSeat(
                (isSelected || force == false)
                    ? selectedSeat?.filter(seat => seat !== seatnumber)
                    : _.uniq([...(selectedSeat ?? []), seatnumber])
            );
        }
    };

    const handleMoved = ({ target }: OnDragEnd) => {
        const left = parseInt(target.style.left.replaceAll(/[^0-9-.]/g, ''));
        const top = parseInt(target.style.top.replaceAll(/[^0-9-.]/g, ''));

        setData?.applyWhere(
            (_, i) => i == selected,
            (e) => ({...e, position: [left, top]}),
        );
    };

    const handleResized = ({ target }: OnResizeEnd) => {
        const width = parseInt(target.style.width.split('px')[0]);
        const height = parseInt(target.style.height.split('px')[0]);

        setData?.applyWhere(
            (_, i) => i == selected,
            (e) => ({...e, size: [width, height]}),
        );
    };

    const handleRotated = ({ target }: OnRotateEnd) => {
        const rotation = parseInt(target.style.transform.split('rotate(')[1].split('px')[0]);
        setData?.applyWhere(
            (_, i) => i == selected,
            (e) => ({...e, rotation })
        );
    };

    const getContrastColor = useCallback((color: string) => {
        return contrastColor({ bgColor: color, threshold: 255 * 0.6 });
    }, []);

    const handleSelectAllSeat = (index: number) => {
        const val = data[index];

        if (val) {
            const seatnumber = Array((val?.col ?? 0) * (val?.row ?? 0))
                .fill(val?.prefix)
                .map((e, i) => (`${e}${i + 1}`))
                .filter(e => !unavailSeat?.includes(e));

            if (!(selectedSeat?.length == seatnumber.length)) {
                onSelectAll && onSelectAll(seatnumber);
            } else {
                onSelectAll && onSelectAll([]);
            }
        }
    }

    return (
        <div onWheel={handleWheel} onMouseUp={handleMouse.up} onMouseMove={handleMouse.move} className={`h-full relative z-20 [&_*]:!select-none`}>
            <Card withBorder radius={10} bg="gray.3" pos="relative" h="100%" className={`overflow-auto`} component={Center}>
                <Text className={`absolute top-4 left-2/4 -translate-x-2/4 z-50`} size="xs" c="gray">Seatmap Editor</Text>
                {/* <Text className={`absolute top-8 left-0 w-full z-50`} size="xs" c="gray">{JSON.stringify([scale, data])}</Text> */}
                <Flex className={`!absolute top-4 right-4 z-50`} gap={10}>
                    <Button onClick={() => setModalArea('new')} size="xs" bg="gray.1" className={`!text-primary-base`} leftSection={<Icon icon="uiw:plus" />}>
                        Tambah Area
                    </Button>
                    <ActionIcon color="gray.1" radius="xl" onClick={() => scale > 0.5 && setScale(scale - 0.1)}>
                        <Icon icon="uiw:minus" className={`text-primary-base`} />
                    </ActionIcon>
                    <ActionIcon color="gray.1" radius="xl" onClick={() => scale < 2 && setScale(scale + 0.1)}>
                        <Icon icon="uiw:plus" className={`text-primary-base`} />
                    </ActionIcon>
                </Flex>

                <Card
                    bg="transparent"
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
                        size="lg"
                        centered
                        opened={modalArea != undefined}
                        onClose={() => setModalArea(undefined)}
                        title={modalArea == 'new' ? "Buat Area Baru" : "Edit Area"}>
                        <Stack>
                            {/* {JSON.stringify(areaVal)} */}
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
                                    description="Code Seat"
                                    placeholder="Isi Code Seat"
                                    {...areaProps('prefix')}
                                />
                            </Flex>

                            <Flex className={`[&>*]:flex-grow`} gap={15}>
                                <ColorInput
                                    disallowInput
                                    // withPicker={false}
                                    label="Warna Background Area"
                                    swatches={[
                                        ...DEFAULT_THEME.colors.red,
                                        ...DEFAULT_THEME.colors.green,
                                        ...theme.colors.blue,
                                        ...DEFAULT_THEME.colors.yellow,
                                        ...DEFAULT_THEME.colors.gray,
                                    ]}
                                    swatchesPerRow={10}
                                    {...areaProps('background')}
                                    value={areaVal.background}
                                    rightSection={areaVal.background && <ActionIcon onClick={() => setAreaVal({ background: undefined })} variant="transparent">
                                        <Icon icon="uiw:close"/>
                                    </ActionIcon>}
                                />
                                <ColorInput
                                    display={modalArea == 0 ? 'none' : undefined}
                                    disallowInput
                                    // withPicker={false}
                                    label="Warna Seat"
                                    swatches={[
                                        ...DEFAULT_THEME.colors.red,
                                        ...DEFAULT_THEME.colors.green,
                                        ...theme.colors.blue,
                                        ...DEFAULT_THEME.colors.yellow,
                                        ...DEFAULT_THEME.colors.gray,
                                    ]}
                                    swatchesPerRow={10}
                                    {...areaProps('seatcolor')}
                                    value={areaVal.seatcolor}
                                    rightSection={areaVal.seatcolor && <ActionIcon onClick={() => setAreaVal({ seatcolor: undefined })} variant="transparent">
                                        <Icon icon="uiw:close"/>
                                    </ActionIcon>}
                                />
                            </Flex>

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
                                    className={`absolute z-30 [&_.hvr]:hover:!flex -translate-x-2/4 -translate-y-2/4`}
                                    style={{
                                        zIndex: i == selected ? 200 : undefined,
                                        top: `${e.position[1]}px`,
                                        left: `${e.position[0]}px`,
                                        width: e.size && e.size[0] ? `${e.size[0]}px` : undefined,
                                        height: e.size && e.size[1] ? `${e.size[1]}px` : undefined
                                    }}
                                    ref={el => changeRef(i, el)}
                                    key={i}>
                                    <Flex display={i == selected ? undefined : 'none'} className={`absolute bottom-[-38px] !pt-[20px] !pl-[20px] right-0 hvr`} gap={5}>
                                        <Button onClick={() => handleSelectAllSeat(i)} bg="gray.1" c="gray.6" size="xs" display={e.type == 'seat' ? undefined : 'none'}>
                                            Pilih Semua
                                        </Button>
                                        <Tooltip label="Edit Area" position="bottom">
                                            <ActionIcon onClick={() => {setModalArea(i); setSelected(i)}} bg="gray.1" c="gray.6" radius="xl">
                                                <Icon icon="uiw:edit" />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Flex>

                                    {e.type == 'seat' && (
                                        <Flex className={`absolute bottom-[-30px] left-0`} gap={5}>
                                            <Text size="sm" c="gray">{e.prefix}1 - {e.prefix}{(e?.col ?? 0) * (e?.row ?? 0)}</Text>
                                        </Flex>
                                    )}

                                    <Box
                                        onMouseDown={() => handleMouse.boxDown(i)}
                                        bg={e.background ?? "gray.1"}
                                        h="100%"
                                        className={`rounded-md shadow-lg`}>
                                        <Box
                                            onClick={() => handleSelect(i)}
                                            className={`absolute w-full h-full left-0 top-0 z-20`}
                                        />

                                        {e.type == 'box' && (
                                            <Center h="100%">
                                                <Text fw={500} className={`uppercase`} c={getContrastColor(e.background ?? '#fff')}>{e.text}</Text>
                                            </Center>
                                        )}

                                        {e.type == 'seat' && (
                                            <Stack h="100%" align="center" justify="center" gap={5} p={10}>
                                                {e.text && <Text size="xs" c="gray">{e.text}</Text>}
                                                <Stack gap={3} w="100%" h="100%" justify="space-between">
                                                    {chunk((Array((e.row ?? 1) * (e.col ?? 1)).fill(e.prefix).map((e, i) => (`${e}${i + 1}`)) ?? []), (e.col ?? 1)).map((x, r) => (
                                                        <Flex gap={3} w="100%" h="100%" justify="space-between" key={r}>
                                                            {x.map((z, c) => (
                                                                <Tooltip label={z} key={c} fw={600}>
                                                                    <Box
                                                                        onMouseEnter={() => handleMouse.seatEnter(z, i)}
                                                                        onMouseDown={() => handleMouse.seatDown(z, i)}
                                                                        onClick={() => !unavailSeat?.includes(z) ? handleSelectSeat(z, i) : {}}
                                                                        opacity={selectedSeat?.includes(z) || !unavailSeat?.includes(z) ? 1 : 0.3}
                                                                        w="100%" h="100%" key={c}
                                                                        className={`rounded-md relative overflow-hidden relative z-40 cursor-pointer`}>
                                                                        {/* <Center w="100%" h="100%">
                                                                            <Text size="xs" c={getContrastColor(selectedSeat?.includes(z) ? e.seatcolor ?? '#194e9e' : 'gray.1')} className={`uppercase`}>
                                                                                {z}
                                                                            </Text>
                                                                        </Center> */}
                                                                        <Box
                                                                            className={`relative z-10 rounded-sm mt-[5px] border ${selectedSeat?.includes(z) ? 'border-[#fafafa30]' : ' border-[#d0d0d0]'}`}
                                                                            bg={selectedSeat?.includes(z) ? e.seatcolor ?? '#194e9e' : 'gray.2'} h="calc(100% - 7px)">
                                                                        </Box>
                                                                        <Box
                                                                            className={`w-[calc(70%)] rounded-sm absolute top-0 left-2/4 -translate-x-2/4 h-[7px] ${selectedSeat?.includes(z) ? '' : 'border border-[#d0d0d0]'}`}
                                                                            bg={selectedSeat?.includes(z) ? e.seatcolor ?? '#194e9e' : 'gray.2'} h="calc(100% - 5px)"
                                                                        />
                                                                    </Box>
                                                                </Tooltip>
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
                    onMouseUp={handleMouse.up}
                    onMouseDown={handleMouse.down}
                    className={`cursor-grab active:cursor-grabbing`}
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
                        // console.log(target)
                    }}
                />
            </Card>
        </div>
    );
}