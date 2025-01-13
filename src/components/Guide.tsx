import { Box, List, Overlay, Popover, Portal, Stack, Text } from "@mantine/core";
import { PropsWithChildren, useEffect, useState } from "react";

type Guide = {
    guidekey: string;
    text: string;
    description?: string[];
    opened?: boolean;
    className?: string;
    order: number;
};

export const Guide = ({ order, guidekey, children, text, description, opened, className }: PropsWithChildren<Guide>) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [r, setR] = useState(false);

    useEffect(() => {
        setR(true);
    }, []);

    useEffect(() => {
        const storedStep = localStorage.getItem(guidekey);
        setCurrentStep(storedStep ? parseInt(storedStep, 10) : 0);
    }, [guidekey]);

    useEffect(() => {
        if (opened === false) {
            setCurrentStep(0);
        }
    }, [opened]);

    const handleNextStep = () => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        localStorage.setItem(guidekey, nextStep.toString());
    };

    const handleResetStep = () => {
        setCurrentStep(0);
        localStorage.setItem(guidekey, "0");
    };

    const isStepActive = (opened ?? true) && currentStep === order;

    useEffect(() => {
        if (!isStepActive && opened) {
            const storedStep = localStorage.getItem(guidekey);
            setCurrentStep(storedStep ? parseInt(storedStep, 10) : 0);
        }
    }, [isStepActive, opened, guidekey]);

    const syncStep = () => {
        if (!r) return;
        const storedStep = localStorage.getItem(guidekey);
        if (parseInt(storedStep ?? '0') != currentStep) {
            setCurrentStep(storedStep ? parseInt(storedStep, 10) : 0);
        }
    }
    syncStep();

    return (
        <>
            {isStepActive && (
                <Portal className="!z-[500]">
                    <Overlay onClick={isStepActive ? handleNextStep : undefined} opacity={0.6} className="!z-[200] !w-[100vw] !h-[100vh]" />
                </Portal>
            )}
            <Popover opened={isStepActive} withArrow arrowSize={12} arrowOffset={10} shadow="md" radius={10}>
                <Popover.Target>
                    <Box
                        component="span"
                        onClick={isStepActive ? handleNextStep : undefined}
                        className={`cursor-default !relative ${isStepActive ? `!z-[510]` : ''} ${className}`}
                    >
                        {children}
                    </Box>
                </Popover.Target>
                <Popover.Dropdown
                    onClick={isStepActive ? handleNextStep : undefined}
                    classNames={{ arrow: `!border-l-primary-base !border-t-primary-base` }}
                    className="border !border-primary-base !p-[7px_14px] !bg-[#deebfe]"
                >
                    <Stack gap={5} p={5}>
                        <Text size="sm" className="!text-primary-base" fw={500}>
                            {text}
                        </Text>

                        {description && (
                            <List>
                                {description.map((e, i) => (
                                    <List.Item key={i}>
                                        <Text className="!text-primary-base" size="sm" c="gray.8">{e}</Text>
                                    </List.Item>
                                ))}
                            </List>
                        )}
                    </Stack>
                </Popover.Dropdown>
            </Popover>
        </>
    );
};
