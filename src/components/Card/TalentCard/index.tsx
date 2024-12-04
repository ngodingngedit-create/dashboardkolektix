import Foto from '@images/Foto=2.png';
import { useState } from 'react';
import Button from '@/components/Button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, Flex, Stack, Text, Image, ActionIcon } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';

interface TalentCardProps {
  name: string;
  image: string;
  skills?: string;
  id: number;
  description?: string;
}

const TalentCard = ({ description, name, image, skills, id }: TalentCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  const router = useRouter();
  return (
    <Link href={`/talent/${id}`} className={`w-full`}>
      <Card withBorder w="100%" className={`!shadow-sm hover:!bg-[#fafafa]`} radius={10}>
        <Stack>
          <Flex gap={10} align="center">
            <Image
              radius="999"
              src={image}
              w={48}
              h={48}
              className={`border border-[#d0d0d0]`}
            />

            <Stack gap={2}>
              <Flex align="center" gap={5}>
                <Text fw={600} className={`capitalize`}>{name}</Text>
                <Icon icon="tdesign:verified-filled" className={`!text-primary-base`}/>
              </Flex>
              <Text c="gray" size="sm">{skills ?? '-'}</Text>
            </Stack>
          </Flex>

          <Text size="sm" c="gray.8">{description}</Text>

          <Flex justify="space-between" gap={10} align="center">
            <ActionIcon variant="transparent" c="gray.8">
              <Icon icon="lucide:bookmark" className={`text-[24px]`}/>
            </ActionIcon>

            <Text size="xs" className={`!text-primary-base`}>Selengkapnya..</Text>
          </Flex>
        </Stack>
        </Card>
      </Link>
  );
};

export default TalentCard;
