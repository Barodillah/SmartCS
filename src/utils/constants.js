export const COLORS = {
  brandRed: '#E60012',
  brandRedDark: '#B5000F',
  dark: '#111111',
  dark2: '#1A1A1A',
  gray700: '#444444',
  gray500: '#777777',
  gray100: '#E5E5E5',
  white: '#FFFFFF'
};

export const ANGULAR_CLIP = "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))";

export const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val).replace('IDR', 'Rp');
};

export const models = [
  {
    name: "Destinator",
    price: 402000000,
    img: "https://csdwindo.com/media/mmksi/destinator.png",
    badge: "POPULAR"
  },
  {
    name: "New Xforce HEV",
    price: 455000000,
    img: "https://csdwindo.com/wp-content/uploads/newxforcetr.png",
    badge: "NEW"
  },
  {
    name: "Fuso Canter",
    price: 452500000,
    img: "https://csdwindo.com/media/ktb/CANTER-FE-73.webp",
    badge: "KENDARAAN NIAGA"
  }
];
