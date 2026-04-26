/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      // 1. TOKENS DE CORES (Colors)
      colors: {
        brand: {
          primary: '#D42426',  //botoes de input
          secondary: '#E5E7EB', // Cinza background principal
          surface: '#F8F9FA',   // Cor de fundo para cards
        }
      },
       
      // 2. TOKENS DE TIPOGRAFIA (Fonts)
      fontFamily: {
        // 'sans' sobrescreve a fonte padrão do sistema
        sans: ['"Inter"', 'sans-serif'], 
        heading: ['"Poppins"', 'sans-serif'], // Fonte para Títulos
      },

      // 3. TOKENS DE FORMAS (Shapes/Arredondamento)
      borderRadius: {
        'button': '4rem', 
        'card': '1.5rem',  
      }
    },
  },
  plugins: [],
}
