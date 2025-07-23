// pages/_app.js
import '../styles/style.css';
import '../styles/globals.css';  // si usas también el global de Tailwind u otro

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
