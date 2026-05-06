import { SeatmapData } from "@/utils/formInterface";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toPng } from "html-to-image";
import {
  DEFAULT_THEME,
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  ColorInput,
  ColorPicker,
  Flex,
  InputWrapper,
  Modal,
  NumberInput,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
  colorsTuple,
  useMantineTheme,
  SegmentedControl,
  Checkbox,
  Switch,
} from "@mantine/core";
import { useDidUpdate, useListState } from "@mantine/hooks";
import { useRef, useState, useCallback, useContext, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import SeatmapComponent from "./SeatmapComponent";
import { modals } from "@mantine/modals";
import Moveable, { MoveableRefType, OnDrag, OnDragEnd, OnResize, OnResizeEnd, OnRotate, OnRotateEnd } from "react-moveable";
import { Athiti } from "next/font/google";
import chunk from "@/utils/chunk";
import _ from "lodash";
import { isNotEmpty, useForm } from "@mantine/form";
import { contrastColor } from "contrast-color";
import { Context as EditContext } from "@/pages/dashboard/my-event/[slug]";
import { Context } from "@/pages/dashboard/create-event";
import { Guide } from "../Guide";

type ComponentProps = {
  editable?: boolean;
  selected?: string[];
  onSelect?: (data?: string[]) => void;
  unavailSeat?: string[];
  onSelectAll?: (data?: string[]) => void;
  onEdit?: boolean;
  onFinishSelectSeat?: () => void;
  fullscreenState: [boolean, (state: boolean) => void];
  onSeatClick?: (seatnumber: string) => void;
};

export const defaultSeatmapData: SeatmapData[] = [
  { position: [0, -165], size: [300, 66], type: "box", text: "Main Stage", background: "#fff", radius: [5, 5, 5, 5] },
  // {"type":"box","text":"REGULER","position":[-228,-17],"size":[134,200]},
  // {"col":12,"row":8,"prefix":"A","type":"seat","position":[0,-17],"size":[300,200]},
  // {"text":"REGULER","type":"box","position":[228,-17],"size":[134,200]}
];

export default forwardRef(function Seatmap({
  fullscreenState: [isFullscreen, setIsFullscreen],
  onFinishSelectSeat,
  onEdit = true,
  editable = true,
  selected: selectedSeat,
  onSelect: setSelectedSeat,
  unavailSeat,
  onSelectAll,
  onSeatClick,
}: Readonly<ComponentProps>, ref) {
  const [isDragSelect, setIsDragSelect] = useState<string[]>();
  const [isCanvasMove, setIsCanvasMove] = useState(false);
  const [canvasPos, setCanvasPos] = useState<[number, number]>([0, 0]);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  // const [selectedSeat, setSelectedSeat] = useListState<string>([]);
  const [modalArea, setModalArea] = useState<number | "new">();
  const [scale, setScale] = useState(1);
  const { seatmapData: __data } = useContext(EditContext);
  const { seatmapData: _data, setSeatmapData: setData, ticket } = useContext(Context);
  const areaForm = useForm<SeatmapData>({
    validate: {
      col: isNotEmpty(),
      prefix: isNotEmpty(),
      row: isNotEmpty(),
    },
  });
  const { setFieldValue: areaSetValue, values: areaVal, setErrors, setValues: setAreaVal, getInputProps: areaProps, reset } = areaForm;
  const contentRef = useRef<Array<HTMLParagraphElement | null>>([]);
  const canvasContainerRef = useRef(null);
  const movableRef = useRef<MoveableRefType>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const theme = useMantineTheme();

  const canvasWrap = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    download: async () => {
      if (canvasWrap.current === null) return;

      try {
        const dataUrl = await toPng(canvasWrap.current, {
          cacheBust: true,
          width: 2000,
          height: 2000,
          pixelRatio: 2, // Better quality
          style: {
            transform: 'translate(0,0)',
            scale: '1',
            width: '2000px',
            height: '2000px',
            margin: '0',
            padding: '0',
            display: 'block',
            position: 'relative',
            backgroundColor: '#f8f9fa'
          },
          filter: (node) => {
            const el = node as HTMLElement;
            if (!el.classList) return true;
            
            // Filter out UI elements by class
            const isUILayout = el.classList.contains('z-50') || 
                               el.classList.contains('tooltipx') || 
                               el.classList.contains('bg-grey/10') ||
                               el.classList.contains('moveable-control-box') ||
                               el.classList.contains('moveable-line') ||
                               el.classList.contains('moveable-area');
            
            // Hide specific nudge/control containers if they don't have z-50
            const isControl = el.classList.contains('mantine-ActionIcon-root') || 
                             el.classList.contains('mantine-Button-root');

            return !isUILayout && !(isControl && el.closest('.z-50') === null && !el.closest('.seat-container'));
          },
          backgroundColor: '#f8f9fa'
        });

        const link = document.createElement('a');
        link.download = `seatmap-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('oops, something went wrong!', err);
      }
    }
  }));

  useDidUpdate(() => {
    if (typeof modalArea == "number") {
      setAreaVal(_data[modalArea]);
    } else {
      setAreaVal({
        position: [0, 0],
        size: [300, 200],
        type: "seat",
        text: "",
        prefix: "",
        row: 0,
        col: 0,
        seat_label: "",
        is_show_code: true,
      });
      reset();
    }
  }, [modalArea]);

  const handleAddRectangle = () => {
    setData?.append({
      position: [0, 0],
      size: [300, 200],
      type: "box",
      text: "New Rectangle",
      background: "#ffffff",
      radius: [5, 5, 5, 5],
    });
    setSelected(_data.length);
  };

  const handleAddText = () => {
    setData?.append({
      position: [0, 0],
      size: [200, 50],
      type: "box",
      text: "New Text",
      background: undefined,
      radius: [0, 0, 0, 0],
    });
    setSelected(_data.length);
  };

  const handleNudge = (dx: number, dy: number) => {
    if (selected !== null) {
      setData?.applyWhere(
        (_, i) => i == selected,
        (e) => ({ ...e, position: [e.position[0] + dx, e.position[1] + dy] })
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selected !== null) {
        if (e.key === "ArrowUp") handleNudge(0, -1);
        if (e.key === "ArrowDown") handleNudge(0, 1);
        if (e.key === "ArrowLeft") handleNudge(-1, 0);
        if (e.key === "ArrowRight") handleNudge(1, 0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  const handleSaveArea = () => {
    if (areaForm.validate().hasErrors && modalArea != 0 && areaVal?.type == "seat") {
      return;
    } else if ((!areaVal?.text || areaVal?.text == "") && areaVal?.type == "box") {
      setErrors({ text: "Required" });
      return;
    }

    // if (!areaVal.prefix || !areaVal.starting_seat) {
    //     setErrors({
    //         prefix: 'Required',
    //         starting_seat: 'Required',
    //     });
    //     return;
    // }

    const validSeatNumber = !data
      .filter((e, i) => i != modalArea)
      .some((e) => {
        const invalidPrefix = e.prefix == areaVal.prefix;
        const currentMax = (e?.col ?? 0) * (e?.row ?? 0);
        const currentMin = e?.starting_seat ?? 1;
        const newMax = (areaVal?.col ?? 0) * (areaVal?.row ?? 0);
        const newMin = areaVal?.starting_seat ?? 1;
        const invalidSeatNumber = newMin <= currentMax && newMax >= currentMin;

        return invalidPrefix && invalidSeatNumber;
      });

    if (!validSeatNumber) {
      setErrors({
        prefix: "Sudah Tersedia, coba prefix lain",
        starting_seat: "Sudah Tersedia, coba starting seat lain",
      });
      return;
    }

    if (typeof modalArea == "number") {
      setData?.setItem(modalArea, {
        ...areaVal,
        size: areaVal?.type != "box" && areaVal?.background === undefined ? [(areaVal?.col ?? 1) * 30, (areaVal?.row ?? 1) * 35 + 8] : areaVal.size,
      });
    } else {
      setData?.append({
        ...areaVal,
        position: [0, 0],
        size: areaVal?.type != "box" && areaVal?.background === undefined ? [(areaVal?.col ?? 1) * 30, (areaVal?.row ?? 1) * 35 + 8] : [300, 300],
      });
    }

    reset();
    setModalArea(undefined);
  };

  const handleDeleteArea = () => {
    modals.openConfirmModal({
      centered: true,
      title: "Hapus Area",
      children: "Apakah kamu yakin ingin menghapus area ini?",
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        if (typeof modalArea == "number") {
          setData?.remove(modalArea);
          reset();
          setModalArea(undefined);
        }
      },
    });
  };

  const handleWheel = (event?: React.WheelEvent<HTMLDivElement>, force?: "up" | "down") => {
    event?.preventDefault();
    document.body.style.overflow = "hidden";

    var currentScale = parseFloat(canvasWrap?.current?.style?.scale ?? "1");
    var scalingValue = 0.3;

    if (((event?.deltaY ?? 0) > 0 || force == "up") && currentScale > 0.5) {
      currentScale -= scalingValue;
    }

    if (((event?.deltaY ?? 0) < 0 || force == "down") && currentScale < 8) {
      currentScale += scalingValue;
    }

    if (canvasWrap?.current?.style && currentScale > 0) {
      canvasWrap.current.style.scale = `${String(currentScale)}`;
    }

    // Jika ada timeout sebelumnya, batalkan
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Izinkan kembali scroll setelah timeout
    scrollTimeout.current = setTimeout(() => {
      document.body.style.overflow = "";
      scrollTimeout.current = null; // Reset timeout
    }, 1000); // Timeout 1000ms
  };

  const handleMouse = {
    down: () => {
      setIsCanvasMove(true);
      // setSelected(null);
      const [x, y] = canvasWrap?.current?.style?.transform
        ?.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
        ?.slice(1)
        .map(Number) || [0, 0];

      // setCanvasPos([x, y]);
    },
    up: () => {
      setIsCanvasMove(false);
    },
    move: (event: React.MouseEvent<HTMLDivElement>) => {
      if (isCanvasMove && canvasWrap?.current) {
        const [x, y] = canvasWrap?.current?.style?.transform
          ?.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
          ?.slice(1)
          .map(Number) || [0, 0];
        var currentScale = parseFloat(canvasWrap?.current?.style?.scale ?? "1");

        if (currentScale <= 0.01) currentScale = 1;

        const newX = x + event.movementX / currentScale;
        const newY = y + event.movementY / currentScale;

        if (canvasWrap?.current?.style) {
          canvasWrap.current.style.transform = `translate(${newX}px, ${newY}px)`;
        }
      }
      // if (isCanvasMove) {
      //     setCanvasPos([canvasPos[0] + (event.movementX / scale), canvasPos[1] + (event.movementY / scale)]);
      // }
    },
    boxDown: (index: number) => {
      if (!onFinishSelectSeat) {
        setSelected(index);
      }
    },
    seatDown: (seatnumber: string, index: number) => {
      if (onFinishSelectSeat) {
        if (onEdit && !unavailSeat?.includes(seatnumber)) {
          setIsDragSelect([seatnumber]);
        } else if (!onEdit && onSeatClick) {
          onSeatClick(seatnumber);
        }
      } else {
        handleMouse.boxDown(index);
      }
    },
    seatUp: () => {
      setIsDragSelect(undefined);
      handleSelectSeat(isDragSelect ?? [], undefined, !selectedSeat?.includes(isDragSelect ? isDragSelect[0] : ""));
    },
    seatEnter: (seatnumber: string, index: number) => {
      if (isDragSelect !== undefined && onEdit && !unavailSeat?.includes(seatnumber)) {
        // setIsDragSelect(seatnumber, index, isDragSelect !== undefined);
        setIsDragSelect([...isDragSelect, seatnumber]);
      }
    },
  };

  const changeRef = (index: number, element: HTMLParagraphElement | null) => {
    contentRef.current[index] = element;
  };

  const handleSelect = (id: number | null) => {
    setSelected(id);
  };

  const handleSelectSeat = (_seatnumber: string | string[], index?: number, action?: boolean) => {
    if (setSelectedSeat) {
      index !== undefined && setSelected(index);
      const seatnumber = typeof _seatnumber == "string" ? [_seatnumber] : _seatnumber;

      if (action) {
        setSelectedSeat && setSelectedSeat(_.uniq([...(selectedSeat ?? []), ...seatnumber]));
        return;
      }

      const isSelected = selectedSeat?.some((e) => seatnumber.includes(e));
      const result = isSelected || action == false ? selectedSeat?.filter((seat) => !seatnumber.includes(seat)) : _.uniq([...(selectedSeat ?? []), ...seatnumber]);

      setSelectedSeat(result);
    }
  };

  const handleMoved = ({ target }: OnDragEnd) => {
    const left = parseInt(target.style.left.replaceAll(/[^0-9-.]/g, ""));
    const top = parseInt(target.style.top.replaceAll(/[^0-9-.]/g, ""));

    setData?.applyWhere(
      (_, i) => i == selected,
      (e) => ({ ...e, position: [left, top] })
    );
  };

  const handleResized = ({ target }: OnResizeEnd) => {
    const width = parseInt(target.style.width.split("px")[0]);
    const height = parseInt(target.style.height.split("px")[0]);

    setData?.applyWhere(
      (_, i) => i == selected,
      (e) => ({ ...e, size: [width, height] })
    );
  };

  const handleRotated = ({ target }: OnRotateEnd) => {
    const rotation = parseInt(target.style.transform.split("rotate(")[1].split("px")[0]);
    setData?.applyWhere(
      (_, i) => i == selected,
      (e) => ({ ...e, rotation })
    );
  };

  const getContrastColor = useCallback((color: string) => {
    return contrastColor({ bgColor: color, threshold: 255 * 0.6 });
  }, []);

  const handleSelectAllSeat = (index: number) => {
    const val = _data[index];

    if (val) {
      const seatnumber = Array((val?.col ?? 0) * (val?.row ?? 0))
        .fill(val?.prefix)
        .map((e, i) => `${e}${i + (val.starting_seat ?? 1)}`)
        .filter((e) => !unavailSeat?.includes(e));

      if (selectedSeat?.some((e) => seatnumber.includes(e))) {
        setSelectedSeat && setSelectedSeat(selectedSeat?.filter((e) => !seatnumber.includes(e)));
      } else {
        setSelectedSeat && setSelectedSeat(_.uniq([...(selectedSeat ?? []), ...seatnumber]));
      }
    }
  };

  const data = useMemo<SeatmapData[]>(() => {
    return ((__data?.length ?? 0) > 0 ? __data ?? [] : _data ?? []).map((e) => {
      const seat = chunk(
        Array((e.row ?? 1) * (e.col ?? 1))
          .fill(0)
          .map((_, i) => `${e.is_show_code !== false ? e.prefix ?? "" : ""}${i + (e?.starting_seat ?? 1)}`) ?? [],
        e.col ?? 1
      );
      return { ...e, seat, type: e?.type ?? "seat" };
    });
  }, [_data, __data]);

  return (
    <div onWheel={handleWheel} onMouseUp={handleMouse.up} onMouseMove={handleMouse.move} className={`h-full relative z-20 [&_*]:!select-none`}>
      <Card
        withBorder
        radius={10}
        pos="relative"
        h="100%"
        className={`overflow-auto`}
        component={Center}
        bg="gray.3"
        // style={{
        //     backgroundSize: '40px 40px',
        //     backgroundImage: `
        //         linear-gradient(to right, grey 1px, transparent 1px),
        //         linear-gradient(to bottom, grey 1px, transparent 1px);
        //     `,
        // }}
      >
        <Text className={`absolute top-4 left-2/4 -translate-x-2/4 z-50`} size="xs" c="gray">
          Seatmap Editor
        </Text>

        {/* <Text className={`absolute top-8 left-0 w-full z-50`} size="xs" c="gray">{JSON.stringify(data)}</Text> */}

        <Flex className={`!absolute top-4 left-4 z-50`} gap={10}>
          <Button color="gray" bg="white" display={isFullscreen ? undefined : "none"} onClick={() => setIsFullscreen(!isFullscreen)} size="xs" variant="light" leftSection={<Icon icon="uiw:right" />}>
            Tutup Fullscreen
          </Button>
        </Flex>

        <Flex className={`!absolute top-4 right-4 z-50`} gap={10}>
          <Guide guidekey="guide-create-seatmap" text="Tombol untuk menambah area seat" order={1}>
            <Flex gap={10}>
              <Tooltip label="Tambah Teks" position="bottom" withArrow>
                <Button onClick={handleAddText} size="xs" bg="gray.1" className={`!text-primary-base`} leftSection={<Icon icon="uiw:plus" />}>
                  <Icon icon="bi:type" className="text-lg" />
                </Button>
              </Tooltip>
              <Tooltip label="Tambah Rectangle" position="bottom" withArrow>
                <Button onClick={handleAddRectangle} size="xs" bg="gray.1" className={`!text-primary-base`} leftSection={<Icon icon="uiw:plus" />}>
                  <Icon icon="ic:outline-rectangle" className="text-lg" />
                </Button>
              </Tooltip>
              <Button onClick={() => setModalArea("new")} size="xs" bg="gray.1" className={`!text-primary-base`} leftSection={<Icon icon="uiw:plus" />}>
                Tambah Area
              </Button>
            </Flex>
          </Guide>
          <ActionIcon color="gray.1" radius="xl" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Icon icon="ic:outline-fullscreen" className={`text-primary-base`} />
          </ActionIcon>
          <ActionIcon color="gray.1" radius="xl" onClick={() => handleWheel(undefined, "up")}>
            <Icon icon="uiw:minus" className={`text-primary-base`} />
          </ActionIcon>
          <ActionIcon color="gray.1" radius="xl" onClick={() => handleWheel(undefined, "down")}>
            <Icon icon="uiw:plus" className={`text-primary-base`} />
          </ActionIcon>
        </Flex>

        <Flex className={`!absolute bottom-4 left-2/4 -translate-x-2/4 z-50`} gap={10}>
          {onFinishSelectSeat && (
            <Guide guidekey="guide-create-seatmap" text="Tombol untuk menambah area seat" order={1}>
              <Button onClick={onFinishSelectSeat} size="sm" rightSection={<Icon icon="uiw:check" />}>
                Selesai Pilih Seat
              </Button>
            </Guide>
          )}
        </Flex>

        <Modal size="lg" centered opened={modalArea != undefined} onClose={() => setModalArea(undefined)} title={modalArea == "new" ? "Buat Area Baru" : "Edit Area"}>
          <Stack>
            {/* {JSON.stringify(areaVal)} */}
            <SegmentedControl
              display={modalArea == "new" ? undefined : "none"}
              data={[
                { value: "seat", label: "Seated" },
                { value: "box", label: "Festival" },
              ]}
              radius="xl"
              {...areaProps("type")}
            />

            <Flex gap={15}>
              <TextInput style={{ flex: 1 }} label="Label Area" placeholder="Isi Label Area" {...areaProps("text")} />
              <TextInput 
                style={{ flex: 1 }} 
                display={areaVal?.type == "box" ? "none" : undefined}
                label="Label Seat" 
                placeholder="Isi Label Seat" 
                {...areaProps("label_seat")} 
              />
            </Flex>

            <Flex className={`[&>*]:flex-grow`} gap={15} display={modalArea == 0 || areaVal?.type == "box" ? "none" : undefined}>
              <NumberInput withAsterisk hideControls label="Jumlah Kolom" placeholder="Isi Jumlah Kolom" {...areaProps("col")} />
              <NumberInput withAsterisk hideControls label="Jumlah Baris" placeholder="Isi Jumlah Baris" {...areaProps("row")} />
              <TextInput 
                mt={5} 
                label={
                  <Flex align="center" gap={5} wrap="nowrap">
                    <Text size="sm" fw={500} style={{ whiteSpace: "nowrap" }}>Code Seat <span style={{ color: "red" }}>*</span></Text>
                    <Switch 
                      size="xs" 
                      checked={areaVal.is_show_code !== false} 
                      onChange={(e) => setAreaVal({ is_show_code: e.currentTarget.checked })} 
                    />
                  </Flex>
                } 
                placeholder="Isi Code Seat" 
                {...areaProps("prefix")} 
              />
              <TextInput mt={5} label="Label Code" placeholder="Isi Label Code" {...areaProps("seat_label")} />
              <NumberInput hideControls withAsterisk mt={5} label="Starting Seat" placeholder="Isi Starting Seat" defaultValue={1} {...areaProps("starting_seat")} />
            </Flex>

            <InputWrapper label="Atur Radius" display={modalArea == 0 || areaVal?.type == "box" ? undefined : "none"}>
              <Flex className={`[&>*]:flex-grow`} gap={15} display={modalArea == 0 || areaVal?.type == "box" ? undefined : "none"}>
                <NumberInput
                  hideControls
                  leftSection={<Icon icon="bx:border-radius" className={`-rotate-90`} />}
                  withAsterisk
                  mt={5}
                  value={areaVal.radius?.[0]}
                  onChange={(e) => setAreaVal({ radius: [parseInt(e as string), areaVal.radius?.[1] ?? 5, areaVal.radius?.[2] ?? 5, areaVal.radius?.[3] ?? 5] })}
                />
                <NumberInput
                  hideControls
                  leftSection={<Icon icon="bx:border-radius" />}
                  withAsterisk
                  mt={5}
                  value={areaVal.radius?.[1]}
                  onChange={(e) => setAreaVal({ radius: [areaVal.radius?.[0] ?? 5, parseInt(e as string), areaVal.radius?.[2] ?? 5, areaVal.radius?.[3] ?? 5] })}
                />
                <NumberInput
                  hideControls
                  leftSection={<Icon icon="bx:border-radius" className={`rotate-90`} />}
                  withAsterisk
                  mt={5}
                  value={areaVal.radius?.[2]}
                  onChange={(e) => setAreaVal({ radius: [areaVal.radius?.[0] ?? 5, areaVal.radius?.[1] ?? 5, parseInt(e as string), areaVal.radius?.[3] ?? 5] })}
                />
                <NumberInput
                  hideControls
                  leftSection={<Icon icon="bx:border-radius" className={`rotate-180`} />}
                  withAsterisk
                  mt={5}
                  value={areaVal.radius?.[3]}
                  onChange={(e) => setAreaVal({ radius: [areaVal.radius?.[0] ?? 5, areaVal.radius?.[1] ?? 5, areaVal.radius?.[2] ?? 5, parseInt(e as string)] })}
                />
              </Flex>
            </InputWrapper>

            <Flex className={`[&>*]:flex-grow`} gap={15}>
              <ColorInput
                display={areaVal.background == undefined ? "none" : undefined}
                disallowInput
                label="Warna Background Area"
                swatches={[...DEFAULT_THEME.colors.red, ...DEFAULT_THEME.colors.green, ...theme.colors.blue, ...DEFAULT_THEME.colors.yellow, ...DEFAULT_THEME.colors.gray]}
                swatchesPerRow={10}
                {...areaProps("background")}
                value={areaVal.background}
                rightSection={
                  areaVal.background && (
                    <ActionIcon onClick={() => setAreaVal({ background: undefined })} variant="transparent">
                      <Icon icon="uiw:close" />
                    </ActionIcon>
                  )
                }
              />
              <Switch mt={25} display={areaVal.background !== undefined ? "none" : undefined} label="Tambah Background Area" checked={areaVal.background != undefined} onChange={() => setAreaVal({ background: "#ffffff" })} />
              <ColorInput
                display={modalArea == 0 ? "none" : undefined}
                disallowInput
                label="Warna Seat"
                swatches={[...DEFAULT_THEME.colors.red, ...DEFAULT_THEME.colors.green, ...theme.colors.blue, ...DEFAULT_THEME.colors.yellow, ...DEFAULT_THEME.colors.gray]}
                swatchesPerRow={10}
                {...areaProps("seatcolor")}
                value={areaVal.seatcolor}
                rightSection={
                  areaVal.seatcolor && (
                    <ActionIcon onClick={() => setAreaVal({ seatcolor: undefined })} variant="transparent">
                      <Icon icon="uiw:close" />
                    </ActionIcon>
                  )
                }
              />
            </Flex>


            <Flex gap={10} align="center" mt={10} justify="end">
              {typeof modalArea == "number" && modalArea != 0 && (
                <ActionIcon color="red" onClick={handleDeleteArea} variant="transparent">
                  <Icon icon="uiw:delete" className={`text-[24px]`} />
                </ActionIcon>
              )}
              <Button onClick={handleSaveArea}>{modalArea == "new" ? "Tambah" : "Simpan"} Area</Button>
            </Flex>
          </Stack>
        </Modal>

        <Card
          ref={canvasWrap}
          bg="transparent"
          pos="relative"
          w="100%"
          h="100%"
          style={{
            scale: `${scale * 100}%`,
            transform: `translate(${canvasPos[0]}px,${canvasPos[1]}px)`,
          }}
          className={`z-30 !overflow-visible`}
        >
          <Box className={`absolute top-2/4 left-2/4 w-[2px] h-[999vh] bg-grey/10 -translate-y-2/4 -translate-x-2/4`} />
          <Box className={`absolute top-2/4 left-2/4 w-[999vw] h-[2px] bg-grey/10 -translate-y-2/4 -translate-x-2/4`} />

          <Box className={`absolute z-30 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 seat-container`}>
            {data.map((e, i) => (
              // <Tooltip label={e.text} position="bottom" bg="gray.1" c="gray.8" key={i} withArrow>
              <Box
                className={`absolute z-30 [&>.tooltipx]:hover:!flex -translate-x-2/4 -translate-y-2/4`}
                style={{
                  transform: `rotate(${e.rotation ?? 0}deg)`,
                  zIndex: i == selected ? 200 : undefined,
                  top: `${e.position[1]}px`,
                  left: `${e.position[0]}px`,
                  width: e.size && e.size[0] ? `${e.size[0]}px` : undefined,
                  height: e.size && e.size[1] ? `${e.size[1]}px` : undefined,
                }}
                ref={(el) => changeRef(i, el)}
                key={i}
              >
                <Flex display={i == selected ? undefined : "none"} className={`absolute top-0 left-0 w-full h-full pointer-events-none`} justify="center" align="center">
                  <ActionIcon
                    className="pointer-events-auto !absolute -top-14 bg-white text-grey hover:!bg-primary-base hover:!text-white transition-colors border border-light-grey shadow-sm"
                    variant="transparent"
                    size="xs"
                    radius="xl"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleNudge(0, -1);
                    }}
                  >
                    <Icon icon="icon-park-outline:up-one" />
                  </ActionIcon>
                  <ActionIcon
                    className="pointer-events-auto !absolute -bottom-14 bg-white text-grey hover:!bg-primary-base hover:!text-white transition-colors border border-light-grey shadow-sm"
                    variant="transparent"
                    size="xs"
                    radius="xl"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleNudge(0, 1);
                    }}
                  >
                    <Icon icon="icon-park-outline:down-one" />
                  </ActionIcon>
                  <ActionIcon
                    className="pointer-events-auto !absolute -left-14 bg-white text-grey hover:!bg-primary-base hover:!text-white transition-colors border border-light-grey shadow-sm"
                    variant="transparent"
                    size="xs"
                    radius="xl"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleNudge(-1, 0);
                    }}
                  >
                    <Icon icon="icon-park-outline:left-one" />
                  </ActionIcon>
                  <ActionIcon
                    className="pointer-events-auto !absolute -right-14 bg-white text-grey hover:!bg-primary-base hover:!text-white transition-colors border border-light-grey shadow-sm"
                    variant="transparent"
                    size="xs"
                    radius="xl"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleNudge(1, 0);
                    }}
                  >
                    <Icon icon="icon-park-outline:right-one" />
                  </ActionIcon>
                </Flex>

                <Flex display={i == selected ? undefined : "none"} className={`tooltipx absolute bottom-[-38px] !pt-[20px] !pl-[20px] right-0 hvr`} gap={5}>
                  {onFinishSelectSeat && (
                    <Button className={`btnSelectAll`} onClick={() => handleSelectAllSeat(i)} bg="gray.1" c="gray.6" size="xs" display={e.type == "seat" ? undefined : "none"}>
                      Pilih Semua
                    </Button>
                  )}
                  {!onFinishSelectSeat && (
                    <Tooltip label="Edit Area" position="bottom">
                      <ActionIcon
                        display={i == selected ? undefined : "none"}
                        onClick={() => {
                          setModalArea(i);
                          setSelected(i);
                        }}
                        bg="gray.1"
                        c="gray.6"
                        radius="xl"
                      >
                        <Icon icon="uiw:edit" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Flex>
                {/* <Text size="sm" c="gray">{e.prefix}1 - {e.prefix}{(e?.col ?? 0) * (e?.row ?? 0)}</Text> */}

                {e.type == "seat" && e.is_show_code !== false && (
                  <Flex className={`absolute top-2/4 -translate-y-2/4 ${!!e.background ? "-left-[40px]" : "-left-[25px]"}`} gap={5}>
                    <Text fw={600} size="sm" c="gray.8">
                      {`${e.seat_label ?? ""}`}
                    </Text>
                  </Flex>
                )}

                {e.type == "seat" && e.is_show_code !== false && (
                  <Flex className={`absolute top-2/4 -translate-y-2/4 ${!!e.background ? "-right-[40px]" : "-right-[25px]"}`} gap={5}>
                    <Text fw={600} size="sm" c="gray.8">
                      {`${e.seat_label ?? ""}`}
                    </Text>
                  </Flex>
                )}

                <Guide guidekey="guide-create-seatmap" opened={i == 2} text="Posisikan area sesuai yang diinginkan" order={2}>
                  <Box
                    onMouseDown={() => handleMouse.boxDown(i)}
                    bg={e.background ?? "transparent"}
                    style={{
                      borderRadius: `${e.radius?.[0] ?? 5}px ${e.radius?.[1] ?? 5}px ${e.radius?.[2] ?? 5}px ${e.radius?.[3] ?? 5}px`,
                    }}
                    h="100%"
                    className={`${!!e.background ? "shadow-lg" : ""}`}
                  >
                    <Box onClick={!onFinishSelectSeat ? () => handleSelect(i) : undefined} className={`absolute w-full h-full left-0 top-0 z-20`} />

                    {e.type == "box" && (
                      <Center h="100%">
                        <Text fw={500} className={`uppercase`} c={getContrastColor(e.background ?? "#fff")}>
                          {e.text}
                        </Text>
                      </Center>
                    )}

                    {e.type == "seat" && (
                      <Stack h="100%" align="center" justify="center" gap={5} p={10}>
                        {(e.text || e.label_seat) && (
                          <Stack gap={0} align="center" className="absolute bottom-full mb-2 w-full left-0 pointer-events-none">
                            {e.text && (
                              <Text size="xs" fw={700} c="gray.8" className="uppercase">
                                {e.text}
                              </Text>
                            )}
                            {e.label_seat && (
                              <Text size="xs" c="gray">
                                {e.label_seat}
                              </Text>
                            )}
                          </Stack>
                        )}
                        <Stack gap={3} w="100%" h="100%" justify="space-between">
                          {(e.seat ?? []).map((x, r) => (
                            <Flex gap={3} w="100%" h="100%" justify="space-between" key={r}>
                              {x.map((z, c) => (
                                <Tooltip label={z} key={c} fw={600}>
                                  <Box
                                    onMouseEnter={() => handleMouse.seatEnter(z, i)}
                                    onMouseDown={() => handleMouse.seatDown(z, i)}
                                    onMouseUp={() => handleMouse.seatUp()}
                                    // onClick={() => onEdit && !unavailSeat?.includes(z) ? handleSelectSeat(z, i) : {}}
                                    opacity={selectedSeat?.includes(z) || !unavailSeat?.includes(z) ? 1 : 0.3}
                                    w={20}
                                    h={25}
                                    key={c}
                                    className={`rounded-md overflow-hidden relative z-40 cursor-pointer`}
                                  >
                                    {/* <Center w="100%" h="100%">
                                                                            <Text size="xs" c={getContrastColor(selectedSeat?.includes(z) ? e.seatcolor ?? '#194e9e' : 'gray.1')} className={`uppercase`}>
                                                                                {z}
                                                                            </Text>
                                                                        </Center> */}
                                    <SeatBox active={Boolean(selectedSeat?.includes(z) || isDragSelect?.includes(z))} color={e.seatcolor} />
                                  </Box>
                                </Tooltip>
                              ))}
                            </Flex>
                          ))}
                        </Stack>
                      </Stack>
                    )}
                  </Box>
                </Guide>
                {/* <Text className={`absolute top-[calc(100%_+_8px)] left-0 text-[8px]`} c="blue" size="8px">
                                        {JSON.stringify(e)}
                                    </Text> */}
              </Box>
              // </Tooltip>
            ))}
          </Box>

          {editable && selected != null && !onFinishSelectSeat && (
            <>
              <Moveable
                origin
                draggable
                resizable={selected !== undefined ? !(data?.[selected]?.background === undefined && data?.[selected]?.type == "seat") : false}
                rotatable
                roundable
                roundRelative={false}
                snapContainer={canvasContainerRef}
                snapDirections={{ left: true, top: true, right: true, bottom: true, center: true, middle: true }}
                snapRotationDegrees={Array(Math.round(360 / 15))
                  .fill(0)
                  .map((e, i) => i * 15)}
                target={contentRef.current[selected]}
                onDragEnd={handleMoved}
                onResizeEnd={handleResized}
                onRotateEnd={handleRotated}
                onResize={({ target, width, height, delta }: OnResize) => {
                  document.querySelectorAll("._content").forEach((e) => {
                    if (e instanceof HTMLElement) e.style.outline = "1px dashed blue";
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
          )}
        </Card>

        <div
          onMouseUp={handleMouse.up}
          onMouseDown={handleMouse.down}
          className={`cursor-grab active:cursor-grabbing`}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
          }}
          onClick={() => {
            handleSelect(null);
          }}
          onDragEnd={(target) => {
            // console.log(target)
          }}
        />
      </Card>
    </div>
  );
});

const SeatBox = ({ active, color }: { active: boolean; color?: string }) => {
  return (
    <>
      <Box className={`relative z-10 rounded-sm mt-[5px] border ${active ? "border-[#fafafa30]" : " border-[#d0d0d0]"}`} bg={active ? color ?? "#194e9e" : "gray.2"} h="calc(100% - 7px)"></Box>

      <Box className={`w-[calc(70%)] rounded-sm absolute top-0 left-2/4 -translate-x-2/4 h-[7px] ${active ? "" : "border border-[#d0d0d0]"}`} bg={active ? color ?? "#194e9e" : "gray.2"} h="calc(100% - 5px)" />
    </>
  );
};  