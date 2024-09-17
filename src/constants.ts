const GITHUB_LINK = '';
const IVS_ROCKS_EXAMPLE_LINK = 'https://ivs.rocks/examples/';

const STORAGE_VERSION = '1';

const STAGE_PUBLISHING_CAPACITY = 12;

const STORAGE_USERNAME_TTL = 10; // Days

const MIN_USERNAME_LENGTH = 6;

const NAME_PREFIX_FRUITS = [
  'apple',
  'banana',
  'orange',
  'grape',
  'kiwi',
  'mango',
  'pineapple',
  'strawberry',
  'blueberry',
  'raspberry',
  'blackberry',
  'peach',
  'plum',
  'apricot',
  'cherry',
  'lemon',
  'lime',
  'grapefruit',
  'tangerine',
  'pomegranate',
  'pear',
  'avocado',
  'coconut',
  'papaya',
  'guava'
];

const PARTICIPANT_PALETTES = {
  yellow: ['#FFFBBD', '#FFE019', '#F2B100', '#9E6900', '#573A00'],
  amber: ['#FFE8BD', '#FF9900', '#D14600', '#7A2B00', '#471500'],
  orange: ['#FFE0D6', '#FF6A3D', '#DB3300', '#8A2000', '#471100'],
  red: ['#FFE0E0', '#FF6161', '#DB0000', '#990000', '#520000'],
  rose: ['#4D0020', '#8F0047', '#E6006F', '#FCE6FF', '#FF66B2'],
  violet: ['#300061', '#5900B3', '#962EFF', '#BF80FF', '#F2E6FF'],
  indigo: ['#001475', '#0033CC', '#295EFF', '#7598FF', '#DBE4FF'],
  blue: ['#00204D', '#003B8F', '#006BD6', '#42B4FF', '#D1F1FF'],
  teal: ['#00293D', '#004761', '#007E94', '#00D2E6', '#D1FBFF'],
  mint: ['#003322', '#005237', '#008559', '#00E682', '#CCFFE9'],
  green: ['#003311', '#005C26', '#008A2E', '#00E600', '#D9FFD6'],
  lime: ['#002E00', '#005700', '#008A00', '#7AE600', '#EBFFCC']
};

/**
 * Animations
 */
const SCALE_MOTION_VARIANTS = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: { opacity: 1, scale: 1 },
  hovered: { scale: 1.1 }
};
const SCALE_MOTION_TRANSITIONS = {
  duration: 0.15,
  ease: 'easeInOut',
  staggerChildren: 0.5,
  scale: {
    type: 'spring',
    duration: 0.4,
    restDelta: 0.001
  }
};

export {
  GITHUB_LINK,
  IVS_ROCKS_EXAMPLE_LINK,
  MIN_USERNAME_LENGTH,
  NAME_PREFIX_FRUITS,
  PARTICIPANT_PALETTES,
  SCALE_MOTION_TRANSITIONS,
  SCALE_MOTION_VARIANTS,
  STAGE_PUBLISHING_CAPACITY,
  STORAGE_USERNAME_TTL,
  STORAGE_VERSION
};
