import { STAGE_PUBLISHING_CAPACITY } from '@Constants';
import { exhaustiveSwitchGuard } from '@Utils';
import memoize from 'fast-memoize';

enum AspectRatio {
  AUTO = 'AUTO',
  VIDEO = 'VIDEO',
  SQUARE = 'SQUARE',
  PORTRAIT = 'PORTRAIT'
}

enum FillMode {
  CONTAIN = 'CONTAIN',
  COVER = 'COVER',
  FILL = 'FILL'
}

const LAYOUT_CONFIG = {
  maxCols: 12,
  gridGap: 12,
  fillMode: FillMode.COVER,
  aspectRatio: AspectRatio.PORTRAIT
};

const TILE_ASPECT_RATIO = {
  width: 18,
  height: 38,
  gap: 0.8
};

interface BestFit {
  cols: number;
  rows: number;
  count: number;
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  cssAspectRatio?: React.CSSProperties['aspectRatio'];
}

interface BestFitWithOverflow extends BestFit {
  overflow: number;
}

interface BestFitInput {
  count: number;
  aspectRatio: number;
  containerWidth: number;
  containerHeight: number;
}

interface RecursiveBestFitInput extends BestFitInput {
  maxBestFitAttempts: number;
  maxItemAspectRatio: number;
}

function getComputedAspectRatio(aspectRatio: AspectRatio) {
  switch (aspectRatio) {
    case AspectRatio.AUTO:
      return 5 / 4; // Heuristic used to inform best-fit calculations for AUTO aspect ratios

    case AspectRatio.VIDEO:
      return 16 / 9;

    case AspectRatio.SQUARE:
      return 1;

    case AspectRatio.PORTRAIT:
      return 8 / 9;

    default:
      exhaustiveSwitchGuard(aspectRatio);
  }
}

function getCssAspectRatio(
  aspectRatio: AspectRatio
): React.CSSProperties['aspectRatio'] {
  if (aspectRatio === AspectRatio.AUTO) {
    return 'auto';
  }

  return getComputedAspectRatio(aspectRatio);
}

function isResizedToFit(fillMode: FillMode) {
  /**
   * Only CONTAIN resizes the grid tile to stay contained within its container.
   */
  return fillMode === FillMode.CONTAIN;
}

const getBestFitWithOverflow = memoize(
  (count = 0, containerWidth = 0, containerHeight = 0): BestFitWithOverflow => {
    const { maxCols } = LAYOUT_CONFIG;
    const bestFit = getBestFit(count, containerWidth, containerHeight);
    let overflow = 0;

    if (bestFit.cols > maxCols) {
      bestFit.cols = maxCols;
      bestFit.itemWidth = containerWidth / bestFit.cols;
      overflow = bestFit.count - bestFit.rows * bestFit.cols + 1;
    }

    return { ...bestFit, overflow };
  },
  { strategy: memoize.strategies.variadic }
);

const getBestFit = memoize(
  (count = 0, containerWidth = 0, containerHeight = 0) => {
    const { fillMode, aspectRatio } = LAYOUT_CONFIG;
    const bestFitInput: BestFitInput = {
      count,
      containerWidth,
      containerHeight,
      aspectRatio: getComputedAspectRatio(aspectRatio)
    };

    let bestFit: BestFit;
    if (!isResizedToFit(fillMode) && aspectRatio === AspectRatio.AUTO) {
      const recursiveBestFitInput: RecursiveBestFitInput = {
        ...bestFitInput,
        maxBestFitAttempts: 4,
        maxItemAspectRatio: 3
      };

      bestFit = recursiveBestFitItemsToContainer(recursiveBestFitInput);
    } else {
      bestFit = bestFitItemsToContainer(bestFitInput);
    }

    bestFit.cssAspectRatio = getCssAspectRatio(aspectRatio);

    return bestFit;
  },
  { strategy: memoize.strategies.variadic }
);

function recursiveBestFitItemsToContainer(input: RecursiveBestFitInput) {
  const { count, maxBestFitAttempts, maxItemAspectRatio } = input;
  let bestFitAttempts = 0;

  function runBestFit(currentCount: number) {
    const bestFit = bestFitItemsToContainer({ ...input, count: currentCount });
    const itemAspectRatio = bestFit.itemWidth / bestFit.itemHeight;
    bestFitAttempts += 1;

    if (
      bestFitAttempts < maxBestFitAttempts &&
      itemAspectRatio > maxItemAspectRatio
    ) {
      return runBestFit(currentCount + 1);
    }

    return bestFit;
  }

  const bestFit = runBestFit(count);
  bestFit.count = count;

  return bestFit;
}

function bestFitItemsToContainer(input: BestFitInput): BestFit {
  const { count, aspectRatio, containerWidth, containerHeight } = input;

  if (!count || !aspectRatio || !containerWidth || !containerHeight) {
    return {
      cols: 0,
      rows: 0,
      itemWidth: 0,
      itemHeight: 0,
      count,
      containerWidth,
      containerHeight
    };
  }

  const normalizedContainerWidth = containerWidth / aspectRatio;
  const normalizedAspectRatio = normalizedContainerWidth / containerHeight;
  const nColsFloat = Math.sqrt(count * normalizedAspectRatio);
  const nRowsFloat = count / nColsFloat;

  // Find the best option that fills the entire height
  let nRows1 = Math.ceil(nRowsFloat);
  let nCols1 = Math.ceil(count / nRows1);
  while (nRows1 * normalizedAspectRatio < nCols1) {
    nRows1 += 1;
    nCols1 = Math.ceil(count / nRows1);
  }

  // Find the best option that fills the entire width
  let nCols2 = Math.ceil(nColsFloat);
  let nRows2 = Math.ceil(count / nCols2);
  while (nCols2 < nRows2 * normalizedAspectRatio) {
    nCols2 += 1;
    nRows2 = Math.ceil(count / nCols2);
  }

  const cellSize1 = containerHeight / nRows1;
  const cellSize2 = normalizedContainerWidth / nCols2;
  const cols = cellSize1 < cellSize2 ? nCols2 : nCols1;
  const rows = Math.ceil(count / cols);
  const itemWidth = containerWidth / cols;
  const itemHeight = containerHeight / rows;

  return {
    count,
    cols,
    rows,
    itemWidth,
    itemHeight,
    containerWidth,
    containerHeight
  };
}

function getComputedMeetingGridStyle(isGridSplit: boolean) {
  const computedGridStyle: React.CSSProperties = { gap: LAYOUT_CONFIG.gridGap };

  if (isGridSplit) {
    computedGridStyle.gridTemplateRows = '70% auto';
  }

  return computedGridStyle;
}

function getComputedParticipantGridStyle(bestFit: BestFit) {
  const { gridGap, aspectRatio } = LAYOUT_CONFIG;
  const computedParticipantGridStyle: React.CSSProperties = {
    gap: gridGap,
    margin: gridGap,
    gridTemplateColumns: `repeat(${bestFit.cols * 2}, minmax(0, 1fr))`,
    ...getComputedGridDimensions(bestFit, gridGap, aspectRatio)
  };

  return computedParticipantGridStyle;
}

function getComputedGridDimensions(
  bestFit: BestFit,
  gridGap: number,
  aspectRatio: AspectRatio
) {
  const dimensions: React.CSSProperties = { height: '100%', maxWidth: '100%' };

  if (
    bestFit.rows > 0 &&
    bestFit.cols > 0 &&
    aspectRatio !== AspectRatio.AUTO
  ) {
    const computedAspectRatio = getComputedAspectRatio(aspectRatio);

    const totalXGap = gridGap * (bestFit.cols - 1); // gap_size * num_col_gaps
    const totalYGap = gridGap * (bestFit.rows - 1); // gap_size * num_row_gaps
    const slotHeight = (bestFit.containerHeight - totalYGap) / bestFit.rows;
    const slotWidth = slotHeight * computedAspectRatio;
    const totalSlotsWidth = slotWidth * bestFit.cols;
    const maxSlotWidth = Math.min(
      bestFit.containerWidth,
      totalSlotsWidth + totalXGap
    );

    delete dimensions.height;
    dimensions.maxWidth = maxSlotWidth;
  }

  return dimensions;
}

function getComputedGridSlotStyle(index: number, bestFit: BestFit) {
  const isFirstSlot = index === 0;
  const isOneByTwo = bestFit.count === 2 && bestFit.cols === 1;
  const isTwoByOne = bestFit.count === 2 && bestFit.cols === 2;
  const remainingItemsOnLastRow = bestFit.count % bestFit.cols;
  const computedSlotStyle: React.CSSProperties = {
    aspectRatio: bestFit.cssAspectRatio,
    gridColumnStart: 'span 2',
    gridColumnEnd: 'span 2'
  };

  // If needed, shift the last row to align it with the center of the grid
  if (bestFit.count - index === remainingItemsOnLastRow) {
    const shiftSlotRowBy = bestFit.cols - remainingItemsOnLastRow + 1;
    computedSlotStyle.gridColumnStart = shiftSlotRowBy;
  }

  // Position 1-by-2 and 2-by-1 grid LAYOUT_CONFIG participants side-by-side
  if (isOneByTwo) {
    computedSlotStyle.alignItems = isFirstSlot ? 'flex-end' : 'flex-start';
  } else if (isTwoByOne) {
    computedSlotStyle.justifyContent = isFirstSlot ? 'flex-end' : 'flex-start';
  }

  return computedSlotStyle;
}

function getGridContainerDimensions(
  tilesCount: number,
  isFullWidthGrid = false
) {
  if (
    tilesCount === 0 ||
    tilesCount >= STAGE_PUBLISHING_CAPACITY ||
    isFullWidthGrid
  )
    return { width: '100%', maxHeight: '100%' };

  let cols = tilesCount; // The ideal column count for each tile count

  if (tilesCount === 4) {
    cols = 2;
  } else if (tilesCount === 5) {
    cols = 3;
  } else if (
    (tilesCount >= 6 && tilesCount <= 8) ||
    (tilesCount >= 10 && tilesCount <= STAGE_PUBLISHING_CAPACITY)
  ) {
    cols = 4;
  } else if (tilesCount === 9) {
    cols = 5;
  }

  const numColsGap = cols + 1; // Includes outer gaps
  const rows = Math.ceil(tilesCount / cols); // The ideal row count for each tile count
  const numRowsGap = rows - 1;

  return {
    width: `${Math.min(100, TILE_ASPECT_RATIO.width * cols + TILE_ASPECT_RATIO.gap * numColsGap)}%`,
    maxHeight: `${Math.min(100, TILE_ASPECT_RATIO.height * rows + numRowsGap)}%`
  };
}

export {
  AspectRatio,
  FillMode,
  getBestFit,
  getBestFitWithOverflow,
  getComputedAspectRatio,
  getComputedGridSlotStyle,
  getComputedMeetingGridStyle,
  getComputedParticipantGridStyle,
  getGridContainerDimensions,
  LAYOUT_CONFIG
};
