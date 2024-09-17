import { debounce, resolvedTwConfig } from '@Utils';
import memoize from 'fast-memoize';
import { useEffect, useState } from 'react';
import { Screen } from 'tailwindcss/types/config';

type Breakpoint = keyof typeof resolvedTwConfig.theme.screens;
type Callback = React.Dispatch<React.SetStateAction<Breakpoint | undefined>>;
type Screens = Array<[Breakpoint, Screen]>;

const registeredCallbacks = new Set<Callback>();

// Sort the screens in descending order of `min`-width screen values
const screens = (
  Object.entries(resolvedTwConfig.theme.screens) as Screens
).sort((s1, s2) => getMinValue(s2[1]) - getMinValue(s1[1]));
const breakpoints = screens.map(([bp]) => bp);

// Get the current breakpoint by the media query string of each screen until a match is found
function getBreakpoint(): Breakpoint | undefined {
  const match = screens.find(([_bp, screen]) => {
    const min = getMinValue(screen);
    const query = `(min-width: ${min}px)`;
    const mediaQueryList = window.matchMedia(query);

    return mediaQueryList.matches;
  });

  return match && match[0];
}

// Extract the `min`-width value from a given screen
function getMinValue(screen: Screen) {
  return 'min' in screen ? parseInt(screen.min, 10) : 0;
}

// Match a target breakpoint with the current breakpoint
const targetMatches = memoize(
  (
    target: Breakpoint,
    breakpoint: Breakpoint = breakpoints.at(-1) as Breakpoint
  ) => {
    const currentScreen = resolvedTwConfig.theme.screens[breakpoint];
    const targetScreen = resolvedTwConfig.theme.screens[target];
    const currentMin = getMinValue(currentScreen);
    const targetMin = getMinValue(targetScreen);

    return currentMin <= targetMin;
  },
  { strategy: memoize.strategies.variadic }
);

window.addEventListener(
  'resize',
  debounce(() => {
    const breakpoint = getBreakpoint();
    registeredCallbacks.forEach((callback) => callback(breakpoint));
  }, 0)
);

function useBreakpoint(): Breakpoint | undefined; // current-breakpoint overload
function useBreakpoint(target: Breakpoint): boolean; // target-breakpoint overload
function useBreakpoint(target?: Breakpoint): Breakpoint | undefined | boolean {
  const [breakpoint, setBreakpoint] = useState(getBreakpoint);

  useEffect(() => {
    registeredCallbacks.add(setBreakpoint);

    return () => {
      registeredCallbacks.delete(setBreakpoint);
    };
  }, []);

  return target ? targetMatches(target, breakpoint) : breakpoint;
}

export type { Breakpoint };

export default useBreakpoint;
