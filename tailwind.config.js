/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./task_tracker/templates/**/*.{html,js}",
    "./task_tracker/static/js/**/*.{html,js}"
    ],
  safelist: [
    'min-w-sideOpen',
    'bg-grey-600'
  ],
  theme: {
    extend: {
      colors: {
        app: {
          DEFAULT: '#0d0c1a',
        },
        surface: {
          DEFAULT: '#151428',
        },
        sidebar: {
          aaaa: {
            DEFAULT: '#19182c',
            onhover: '#34334a',
            text: '#ffffff',
          },
          aaab: {
            DEFAULT: ''
          },
        },
        border: {
          aaaa: '#373650',
          aaab: '#564d3b'
        },

        text: {
          error: '#ef4444'
        },

        background: {
          cards: '#000000'
        },
        'card-bg': '#16152a',
        'card-border': '#2d2b4a',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'primary': '#3b82f6'
      },

      fontFamily: {
        comic: ['Inter', 'system-ui', 'sans-serif'],
      },

      width: {
        'sideOpen': '150px',
      },

      gap: {
        'xs': '2px',      
        'sm': '8px',     
        'md': '12px',     
        'lg': '20px',
        'xl': '44px'
      },

      fontSize: {
        'xss': ['0.2rem', { lineHeight: '1.5' }],
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'md': ['1.125rem', { lineHeight: '1.4' }],
        'lg': ['1.25rem', { lineHeight: '1.4' }],
        'xl': ['1.5rem', { lineHeight: '1.3' }],
      },

      borderRadius: {
        'ssm': '0.125rem',
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'full': '9999px',
      }


    },
  },
  plugins: [],
}

