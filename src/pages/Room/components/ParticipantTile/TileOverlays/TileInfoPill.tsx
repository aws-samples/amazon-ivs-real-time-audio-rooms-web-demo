import { clsm } from '@Utils';

interface TileInfoPillProps {
  content?: string;
  icon?: JSX.Element;
  isVisible?: boolean;
  isIconVisible?: boolean;
}

function TileInfoPill({
  icon,
  content,
  isVisible = true,
  isIconVisible = false
}: TileInfoPillProps) {
  if (!isVisible || !content) {
    return <span />;
  }

  function renderIcon() {
    if (!icon || !isIconVisible) {
      return null;
    }

    return <span className={clsm(['ml-2'])}>{icon}</span>;
  }

  return (
    <div
      className={clsm([
        'flex',
        'items-center',
        '@2xs:m-auto',
        '@2xs:py-1.5',
        '@2xs:max-w-fit',
        'font-bold',
        'rounded-3xl',
        'overflow-hidden',
        '@2xs:bg-white',
        '@2xs:px-2.5',
        'text-sm',
        '@2xs:sm:text-base',
        isIconVisible ? 'justify-between' : 'justify-center'
      ])}
    >
      {content && (
        <span className={clsm(['truncate', 'text-uiText', '@2xs:text-black'])}>
          {content}
        </span>
      )}
      {renderIcon()}
    </div>
  );
}

export default TileInfoPill;
