module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
      custom: '1px 5px 5px 1px rgba(0, 0, 0, 0.1), 1px 5px 5px 1px rgba(0, 0, 0, 0.04)',
    },
    maxHeight: {
      custom: '50rem',
      4: '1rem',
      8: '2rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      '3/4': '75%',
      '4/5': '80%',
      '5/6': '83.333333%',
      full: '100%',
    },

    extend: {
      padding: {
        18: '4.5rem',
        '3/4': '75%',
        '9/16': '56.25%',
      },
      margin: {
        18: '4.5rem',
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        128: '32rem',
        144: '36rem',
      },
      transitionProperty: {
        width: 'width',
        height: 'height',
      },
      backgroundImage: {
        'question-baloon': "url('/images/forms/baloon.svg')",
      },
      maxWidth: {
        200: '50rem',
      },
      maxHeight: {
        '1/2': '50%',
      },
      minWidth: {
        4: '1rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        40: '10rem',
        80: '20rem',
      },
      minHeight: {
        '3/4': '75%',
        '4/5': '80%',
        '5/6': '83.333333%',
      },
      cursor: {
        grab: 'grab',
      },
      skew: {
        15: '15deg',
      },
    },
    zIndex: {
      0: 0,
      1: 1,
      10: 10,
      20: 20,
      25: 25,
      30: 30,
      40: 40,
      50: 50,
      75: 75,
      100: 100,
      auto: 'auto',
    },
  },
  variants: {
    maxWidth: ['responsive'],
    extend: {
      backgroundColor: ['active'],
    },
  },
  plugins: [],
};
