import { clsm } from '@Utils';
import BoringAvatar from 'boring-avatars';

interface AvatarProps {
  name: string;
  className?: string;
  colors: string[];
}

function Avatar({ name, className, colors }: AvatarProps) {
  return (
    <div className={clsm(['rounded-full', 'aspect-square', className])}>
      <BoringAvatar name={name} size="100%" variant="beam" colors={colors} />
    </div>
  );
}

export default Avatar;
