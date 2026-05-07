import type { Metadata } from 'next';
import { Inter, Bangers, Fredoka, Anton, Lobster } from 'next/font/google';
import ProviderReduxToolkit from './provider';
import './globals.css';

// Configurar las fuentes con next/font/google
const inter = Inter({ subsets: ['latin'], display: 'swap' });
const bangers = Bangers({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-bangers' });
const fredoka = Fredoka({ subsets: ['latin'], display: 'swap', variable: '--font-fredoka' });
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-anton' });
const lobster = Lobster({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-lobster' });

export const metadata: Metadata = {
  title: 'Juego De Rifas',
  description: 'Participa en nuestra rifa para ganar un preciado premio.¡Compra boletos para tener la oportunidad de ganar!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="es" className={`${bangers.variable} ${fredoka.variable} ${anton.variable} ${lobster.variable}`}>
      <head>
        <meta name="theme-color" content="#714b67" />
        {/* Para las fuentes que no están disponibles en next/font/google, podemos usar un link */}
        <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Baloo+2&family=Permanent+Marker&family=Chewy&family=Rubik+Mono+One&display=swap" rel="stylesheet" />

        {/* Script para verificar si las fuentes están cargadas para Canvas */}
        <script dangerouslySetInnerHTML={{
          __html: `
          // Función para verificar si una fuente está cargada
          function isFontLoaded(fontFamily) {
            return document.fonts.check('12px "' + fontFamily + '"');
          }

          // Función para esperar a que las fuentes estén cargadas
          window.waitForFonts = function(fontFamilies, callback) {
            if (!fontFamilies || fontFamilies.length === 0) {
              callback();
              return;
            }

            const checkFonts = () => {
              const allLoaded = fontFamilies.every(font => isFontLoaded(font));
              if (allLoaded) {
                console.log('Todas las fuentes cargadas para Canvas');
                callback();
              } else {
                setTimeout(checkFonts, 50);
              }
            };

            // Si document.fonts está disponible, usamos la API de Font Loading
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(() => {
                checkFonts();
              });
            } else {
              // Fallback para navegadores que no soportan Font Loading API
              setTimeout(checkFonts, 500);
            }
          };
        `}} />
      </head>
      <body className={inter.className}>
        <ProviderReduxToolkit>{children}</ProviderReduxToolkit>
      </body>
    </html>
  );
};
