import { Button } from '@Components';
import { GITHUB_LINK, IVS_ROCKS_EXAMPLE_LINK } from '@Constants';
import { useModalManager } from '@Contexts/ModalManager';
import { clsm } from '@Utils';
import { __version } from 'amazon-ivs-web-broadcast';

import AppIcon from './AppIcon';

function About() {
  const { setModalOpen } = useModalManager();

  return (
    <div
      className={clsm([
        'grid',
        'grid-rows-[1fr_auto]',
        'w-full',
        'max-w-sm',
        'h-full',
        'gap-4',
        'bg-surface',
        'rounded-xl',
        'text-uiText',
        'ring-1',
        'ring-surfaceAlt2/10',
        'shadow-xl',
        'dark:shadow-black/80'
      ])}
    >
      <div
        className={clsm([
          'p-6',
          'pb-0',
          'overflow-y-auto',
          'overflow-x-hidden'
        ])}
      >
        <div
          className={clsm([
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'text-center',
            'gap-4'
          ])}
        >
          <div className={clsm(['w-24', 'h-24'])}>
            <AppIcon />
          </div>
          <h3>Amazon IVS Real-time Audio Web Demo</h3>
        </div>
        <div className={clsm(['flex', 'text-center', 'flex-col'])}>
          <p className={clsm(['text-sm', 'mb-3', 'text-uiText/50'])}>
            SDK Version: {`${__version.split('-')[0]}`}
          </p>
          {GITHUB_LINK && (
            <span className={clsm(['text-sm', 'mb-3', 'text-uiText/50'])}>
              View source code on{' '}
              <a
                href={GITHUB_LINK}
                target="_blank"
                rel="noreferrer noopener"
                className={clsm([
                  'text-uiText/50',
                  'hover:text-uiText',
                  'underline',
                  'underline-offset-1'
                ])}
              >
                Github
              </a>
            </span>
          )}
          {IVS_ROCKS_EXAMPLE_LINK && (
            <p className={clsm(['text-xs', 'text-uiText/50'])}>
              For more demos, visit{' '}
              <a
                href={IVS_ROCKS_EXAMPLE_LINK}
                target="_blank"
                rel="noreferrer noopener"
                className={clsm([
                  'text-uiText/50',
                  'hover:text-uiText',
                  'underline underline-offset-1'
                ])}
              >
                ivs.rocks/examples
              </a>
            </p>
          )}
        </div>
      </div>
      <footer
        className={clsm([
          'flex',
          'flex-col',
          'w-full',
          'items-center',
          'justify-center',
          'gap-4',
          'p-6',
          'pt-0'
        ])}
      >
        <Button fullWidth onClick={() => setModalOpen(false)}>
          Close
        </Button>
      </footer>
    </div>
  );
}

export default About;
