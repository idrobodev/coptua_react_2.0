module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    // darkMode: false, // or 'media' or 'class'
    theme: {
        screens: {
            'sm': '640px',
            // => @media (min-width: 640px) { ... }

            'md': '768px',
            // => @media (min-width: 768px) { ... }

            'lg': '1024px',
            // => @media (min-width: 1024px) { ... }

            'xl': '1280px',
            // => @media (min-width: 1280px) { ... }

            '2xl': '1536px',
            // => @media (min-width: 1536px) { ... }
        },
        container: {
            center: true,
            padding: '1rem'
        },
        fontFamily: {
            'mono': ['cursive', 'SFMono-Regular'],
            'Poppins': ['Poppins', 'sans-serif'],
            'Montserrat': ['Montserrat', 'sans-serif'],
            'sans': ['Poppins', 'sans-serif'],
        },
        extend: {
            colors: {
                'primary': '#676cb8',
                'secondary': '#3695cc',
                'card-bg': '#DAD7CD'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                }
            },
            animation: {
                fadeIn: 'fadeIn 0.2s ease-out',
                slideUp: 'slideUp 0.3s ease-out'
            }
        },
    },
    plugins: [],
}
