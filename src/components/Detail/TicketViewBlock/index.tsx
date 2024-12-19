import { useContext, useEffect, useMemo, useState } from 'react';
import DateTab from '@/components/DateTab';
import { TicketProps } from '@/utils/globalInterface';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { ActionIcon, Alert, Card, Divider, Flex, NumberFormatter, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Context } from '@/pages/event/[slug]';

interface Props {
  counts: { [key: number]: number | string[] };
  setCounts: (counts: { [key: string]: number | string[] }) => void;
  data: TicketProps[];
  isGratis?: boolean;
  maxOrder?: number;
  isLogin: boolean;
  totalCount: number;
  totalSubtotalPrice: number;
  setStep: (step: number) => void;
  scrollToTop: () => void;
  selected: number;
  setSelected: (index: number) => void;
  storeLocalStorage: () => void;
}

const TicketViewBlock = ({
  maxOrder,
  isGratis,
  counts,
  setCounts,
  data,
  isLogin,
  totalSubtotalPrice,
  totalCount,
  scrollToTop,
  setStep,
  selected,
  setSelected,
  storeLocalStorage,
}: Props) => {
  const [edit, setEdit] = useState(false);
  const { ticket, setTicket } = useContext(Context);

  const router = useRouter();
  const redirectLogin = () => {
    Cookies.set('ticketCount', JSON.stringify(counts));
    Cookies.set('prevPath', router.asPath);
    selected && Cookies.set('selected', selected.toString());
    router.push('/auth');
  };

  const total = useMemo(() => {
    return ticket?.reduce((c, n) => c + (n.subtotal_price * (n.seat_number?.length ?? n.qty_ticket ?? 1)), 0)
  }, [ticket]);

  const handleDelete = (index: number) => {
    if (ticket && setTicket) {
      const id = ticket[index].event_ticket_id;
      const newCount = Object.keys(counts).reduce((acc, q) => {
        if (parseInt(q) !== id) {
          acc[parseInt(q)] = counts[parseInt(q)];
        }
        return acc;
      }, {} as { [key: number]: number | string[] });

      setCounts(newCount ?? {});

      setTicket(ticket?.filter((_, i) => i != index));
    }
  }

  return (
    <div className='text-dark my-5 '>
      <Flex gap={20} wrap="wrap">
        <div
          className='rounded-t-xl shadow-md p-4 w-full max-w-[700px] md:py-8 overflow-y-scroll h-100 border-2 border-primary-light-200 mb-[60px] md:mb-[90px]'
          id='ticket-picker'
        >
          <DateTab
            maxOrder={maxOrder}
            counts={counts}
            setCounts={setCounts}
            data={data}
            isLogin={isLogin}
            selected={selected}
            setSelected={setSelected}
          />
          <button></button>
        </div>
        <Card withBorder className={`flex-grow h-fit md:max-w-[400px]`} radius={10} p={20}>
          <Stack gap={15}>
            <Flex justify="space-between" gap={10} wrap="wrap" align="center" w="100%">
              <Text size="sm" fw={600}>Tiket Dipilih</Text>
              <UnstyledButton onClick={() => setEdit(!edit)}>
                <Flex align="center" className={`${edit ? '[&_*]:!text-grey' : '[&_*]:!text-primary-base'}`} gap={8}>
                  <Text fw={600} size="sm">{edit ? 'Tutup Edit' : 'Edit'}</Text>
                  {!edit && <Icon icon="iconoir:edit" />}
                </Flex>
              </UnstyledButton>
            </Flex>

            <Divider />

            <Stack gap={15}>
              {ticket?.map((e, i) => (
                <Flex gap={10} wrap="wrap" justify="space-between" key={i}>
                  <Flex gap={10}>
                    <Icon icon="fa-solid:ticket-alt" className={`text-primary-base mt-[2px]`}/>
                    <Stack gap={0}>
                      <Text size="sm">Tiket {e.name} ({e.seat_number?.length ?? e.qty_ticket}x)</Text>
                      {e.seat_number && <Text size="xs" c="gray">{e.seat_number.join(', ')}</Text>}
                    </Stack>
                  </Flex>

                  <Text fw={600} ml="auto" size="sm"><NumberFormatter value={e.subtotal_price * (e.seat_number?.length ?? e.qty_ticket ?? 1)}/></Text>

                  {edit && (
                    <Tooltip label="Hapus Tiket">
                      <ActionIcon onClick={() => handleDelete(i)} variant="transparent" color="red" p={0} size="xs">
                        <Icon icon="uiw:close" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Flex>
              ))}

              {(ticket?.length ?? 0) == 0 && (
                <Alert icon={<Icon icon="uiw:information-o" />} color="gray" variant="light" radius={10}>
                  Pilih tiket terlebih dahulu
                </Alert>
              )}

              {(ticket?.length ?? 0) > 0 && (
                <>
                  <Divider />

                  <Flex gap={10} wrap="wrap" justify="space-between">
                    <Text size="sm">Total</Text>
                    <Text fw={600} ml="auto" size="sm"><NumberFormatter value={total ?? 0}/></Text>
                  </Flex>
                </>
              )}
            </Stack>
          </Stack>
        </Card>
      </Flex>
      <div className='flex justify-between items-center bg-[#eff5ff] p-5 rounded-b-xl shadow-md w-full fixed bottom-0 left-0 z-30'>
        <div>
          <p>Total {totalCount} Tiket</p>
          <p className='font-semibold'>Rp {totalSubtotalPrice.toLocaleString('id-ID')}</p>
        </div>
        <div className='flex gap-4 items-center'>
          {/* <p className='font-semibold'>Rp {totalSubtotalPrice.toLocaleString('id-ID')}</p> */}
          {isLogin ? (
            <button
              className='bg-primary-base text-white px-4 py-2 font-semibold text-sm rounded-2xl disabled:bg-primary-disabled disabled:cursor-not-allowed'
              onClick={() => {
                Cookies.remove('ticketCount', { path: '/' });
                setStep(33);
                scrollToTop();
              }}
              disabled={totalCount === 0}
            >
              {isGratis ? 'Registrasi' : 'Beli'} Tiket
            </button>
          ) : (
            <button
              className='bg-primary-base text-white px-4 py-2 font-semibold text-sm rounded-2xl disabled:bg-primary-disabled disabled:cursor-not-allowed'
              onClick={storeLocalStorage}
              disabled={totalCount === 0}
            >
              {isGratis ? 'Registrasi' : 'Beli'} Tiket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketViewBlock;
