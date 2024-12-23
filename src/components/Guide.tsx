import { Box, Overlay, Popover, Portal, Text } from "@mantine/core";
import { Dispatch, PropsWithChildren, SetStateAction, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

type Guide = {
    key: string;
    text: string;
    opened?: boolean;
    className?: string;
    order: number;
};

export const Guide = ({ order, key, children, text, opened, className }: PropsWithChildren<Guide>) => {
    const [guideStep, setGuideStep] = useLocalStorage<number>(key, 0);
    
    // useEffect(() => {
    //     function handleStorageChange(e: StorageEvent) {
    //         if (e.key === key) {
    //             if (e.newValue !== null) {
    //                 setGuideStep(order + 1);
    //             }
    //         }
    //     }

    //     window.addEventListener('storage', handleStorageChange);
    //     return () => window.removeEventListener('storage', handleStorageChange);
    // }, [key, setGuideStep]);

    return (
        <>
            {/* <Portal className="!z-[500]">
                <Overlay opacity={0.6} className={`!z-[200]`} />
            </Portal> */}
            <Popover opened={(opened === undefined ? true : opened) && order == guideStep} withArrow arrowSize={12} arrowOffset={10} shadow="md" radius={10}>
                <Popover.Target>
                    {opened ? (
                        <Box component="span" onClick={() => setGuideStep && setGuideStep((guideStep ?? 0) + 1)} className={`cursor-default !relative !z-[510] ${className}`}>
                            {children}
                        </Box>
                    ) : children}
                </Popover.Target>
                <Popover.Dropdown
                    onClick={() => setGuideStep && setGuideStep((guideStep ?? 0) + 1)}
                    classNames={{ arrow: `!border-l-primary-base !border-t-primary-base` }}
                    className={`border !border-primary-base !p-[7px_14px] !bg-[#deebfe]`}>
                    <Text size="sm" className={`!text-primary-base`} fw={500}>{text}</Text>
                </Popover.Dropdown>
            </Popover>
        </>
    );
};
