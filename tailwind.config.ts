/** @type {import('tailwindcss').Config} */
import containerQueriesPlugin from '@tailwindcss/container-queries';
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';
import twThemer from 'tailwindcss-themer';

const brandColors = {
  orange: {
    aws: '#f90',
    awshover: '#ec7211'
  }
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      nil: { max: '0px' },
      xsh: { raw: '(max-height: 600px)' },
      xswh: { raw: '(max-height: 420px),(max-width:640px)' },
      xs: { min: '320px' },
      sm: { min: '640px' },
      md: { min: '768px' },
      lg: { min: '1024px' },
      xl: { min: '1280px' },
      '2xl': { min: '1536px' }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      },
      containers: {
        '2xs': '12rem'
      },
      animation: {
        ping: '3s ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
      },
      keyframes: {
        ping: {
          '75%, 100%': {
            transform: 'scale(3)',
            opacity: '0'
          }
        }
      }
    }
  },
  plugins: [
    containerQueriesPlugin,
    twThemer({
      defaultTheme: {
        extend: {
          colors: {
            orange: brandColors.orange,
            primary: brandColors.orange.aws,
            primaryAlt: brandColors.orange.awshover,
            secondary: colors.neutral[500],
            secondaryAlt: colors.neutral[700],
            positive: colors.emerald[500],
            positiveAlt: colors.emerald[700],
            destruct: colors.red[500],
            destructAlt: colors.red[700],
            warn: colors.yellow[300],
            warnAlt: colors.yellow[500],
            uiText: colors.neutral[900],
            uiTextAlt: colors.neutral[100],
            surface: colors.white,
            surfaceAlt: colors.neutral[100],
            surfaceAlt2: colors.black,
            surfaceAlt3: colors.neutral[200],
            border: colors.neutral[200],
            overlay: colors.neutral[100]
          }
        }
      },
      themes: [
        {
          name: 'dark-theme',
          mediaQuery: '@media (prefers-color-scheme: dark)',
          extend: {
            colors: {
              primary: brandColors.orange.aws,
              primaryAlt: brandColors.orange.awshover,
              secondary: colors.neutral[500],
              secondaryAlt: colors.neutral[700],
              positive: colors.emerald[600],
              positiveAlt: colors.emerald[500],
              destruct: colors.red[600],
              destructAlt: colors.red[500],
              warn: colors.yellow[500],
              warnAlt: colors.yellow[400],
              uiText: colors.neutral[300],
              uiTextAlt: colors.neutral[700],
              surface: colors.black,
              surfaceAlt: colors.neutral[900],
              surfaceAlt2: colors.white,
              surfaceAlt3: colors.neutral[800],
              border: colors.neutral[800],
              overlay: colors.neutral[900]
            }
          }
        }
      ]
    })
  ]
};
