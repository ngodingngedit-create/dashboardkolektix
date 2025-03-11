import { Carousel } from '@mantine/carousel';
import { Card, NumberFormatter, Stack, Image, AspectRatio, Box, ActionIcon } from '@mantine/core';
import Link from 'next/link';
import notFoundImage from '../../../assets/images/icon-notfound.png';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';
import useLoggedUser from '@/utils/useLoggedUser';
import { useDidUpdate, useListState } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { BookmarkListResponse, BookmarkRequest } from '@/types/bookmark';
import fetch from '@/utils/fetch';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

interface VenueCardProps {
  id?: number;
  title: string;
  image: string[];
  location: string;
  price: number;
  slug: string;
  bookmark_id?: number;
}
const VenueCard = ({ id, bookmark_id, slug, title, image, location, price }: VenueCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  const [loading, setLoading] = useListState<string>();
  const users = useLoggedUser();
  
  useDidUpdate(() => {
      if (users) {
        const bookmarked = (users?.bookmarked ?? [])?.find(e => e.venue_id == id);
        if (bookmarked != undefined) setBookmark(true);
      }
    }, [users]);

    const toggleBookmark = () => {
        if (!bookmark && !bookmark_id) {
          toggleBookmarkFetch();
          setBookmark(true);
        } else {
          modals.openConfirmModal({
            centered: true,
            title: 'Hapus dari bookmark',
            children: 'Apakah kamu yakin ingin menghapus event ini dari bookmark?',
            labels: { cancel: 'Batal', confirm: 'Hapus' },
            onConfirm: () => {
              toggleBookmarkFetch(false);
              setBookmark(false);
            }
          })
        }
      }

      const toggleBookmarkFetch = async (status: boolean = true) => {
        if (!status) {
          const bookid = users?.bookmarked?.find(e => e?.venue_id == id)?.id;
          if (!bookid) {
            toast.error('Gagal Menghapus');
            return;
          }
    
          await fetch<any, any>({
            url: 'bookmark/' + (bookmark_id ?? bookid),
            method: 'DELETE',
            before: () => setLoading.append('bookmark'),
            success: () => {
              const data = JSON.parse(Cookies.get('bookmarked') ?? '[]') as BookmarkListResponse[];
              Cookies.set('bookmarked', JSON.stringify(data.filter(e => e.venue_id != id)));
              toast.info('Berhasil menghapus ke bookmark');
            },
            complete: () => setLoading.filter(e => e != 'bookmark'),
            error: () => toast.error('Gagal Menghapus')
          });
          return;
        }
    
        await fetch<BookmarkRequest, BookmarkListResponse>({
          url: 'bookmark-user',
          method: 'POST',
          data: {
            module_id: 5,
            type: 'Venue',
            venue_id: id as number
          },
          before: () => setLoading.append('bookmark'),
          success: ({ data: newData }) => {
            const data = JSON.parse(Cookies.get('bookmarked') ?? '[]') as BookmarkListResponse[];
            Cookies.set('bookmarked', JSON.stringify([...data, newData]));
            toast.info('Berhasil menambahkan ke bookmark')
          },
          complete: () => setLoading.filter(e => e != 'bookmark'),
        });
      }

  return (
    <Card withBorder radius={10} p={0} className={`hover:!bg-grey/10 transition-colors [&_.bookmarkicon]:hover:!opacity-100 [&_.mantine-Carousel-control]:hover:!opacity-100 [&_.mantine-Carousel-control]:!opacity-0`}>

      <Card pos="absolute" top={15} right={15} radius={0} className={`!z-20`} p={0} bg="none">
        <ActionIcon onClick={toggleBookmark} loading={loading.includes('setbookmark')} variant="transparent" color="white" size="lg" className={`opacity-0 bookmarkicon`}>
          <Icon icon={bookmark ? "famicons:bookmark" : "famicons:bookmark-outline"} className={`text-[30px]`} />
        </ActionIcon>
      </Card>

      <Stack gap={0}>
        <AspectRatio w="100%">
          {image && (
            <Carousel controlSize={12}>
              {image.map((e, i) => (
                <Carousel.Slide key={i}>
                  <AspectRatio w="100%">
                    <Image
                      src={e}
                      alt={title}
                    />
                  </AspectRatio>
                </Carousel.Slide>
              ))}
              {image.length == 0 && (
                <Carousel.Slide>
                  <AspectRatio w="100%">
                    <Image
                      src={notFoundImage.src}
                      alt={title}
                    />
                  </AspectRatio>
                </Carousel.Slide>
              )}
            </Carousel>
          )}
        </AspectRatio>

        <Box component={Link} href={`/venue/${slug}`}>
          <Stack gap={0} p={15} >
            <p className='text-xs text-grey'>{location}</p>
            <p className='font-semibold'>{title}</p>
            <p className='mt-[10px] text-primary-dark text-xs'>Mulai dari</p>
            <p className='font-semibold'>
                <NumberFormatter value={price} /> <span className='text-grey'>/Hari</span>
            </p>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

export default VenueCard;
