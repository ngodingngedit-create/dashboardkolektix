import { Carousel } from '@mantine/carousel';
import { Card, NumberFormatter, Stack, Image, AspectRatio, Box } from '@mantine/core';
import Link from 'next/link';

interface VenueCardProps {
  title: string;
  image: string[];
  location: string;
  price: number;
  slug: string;
}
const VenueCard = ({ slug, title, image, location, price }: VenueCardProps) => {
  return (
    <Card withBorder radius={10} p={0} className={`hover:!bg-grey/10 transition-colors [&_.mantine-Carousel-control]:hover:!opacity-100 [&_.mantine-Carousel-control]:!opacity-0`}>
      <Stack gap={0}>
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
          </Carousel>
        )}

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
