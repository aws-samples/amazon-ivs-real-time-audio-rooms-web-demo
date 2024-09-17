import { clsm } from '@Utils';

import Spinner from './Spinner';
import { SpinnerSize } from './theme';

function PageSpinner() {
  return (
    <div
      className={clsm([
        'w-screen',
        'h-screen',
        'flex',
        'justify-center',
        'items-center'
      ])}
    >
      <Spinner size={SpinnerSize.LARGE} />
    </div>
  );
}

export default PageSpinner;
