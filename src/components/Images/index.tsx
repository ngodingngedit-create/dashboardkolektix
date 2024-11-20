import Image from 'next/image';
import config from '@/Config';
import kolektix from '../../assets/images/kolektix-square.webp';

interface ImagesProps {
  type: string;
  path: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const Images = ({ path, alt, width, height, className, type }: ImagesProps) => {
  return path ? (
    <Image
      src={path}
      alt={alt ? alt : 'images'}
      className={className ? `${className}` : 'w-full object-cover'}
      width={width ? width : 200}
      height={height ? height : 200}
    />
  ) : (
    <Image
      src={kolektix}
      alt={alt ? alt : 'images'}
      className={className ? `${className}` : 'w-full object-cover'}
      width={width ? width : 200}
      height={height ? height : 200}
    />
  );
};

export default Images;
