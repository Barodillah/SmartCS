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
    price: 395000000,
    img: "https://storage.googleapis.com/gcmkscsp001/public/products/highlights/sJqnTckI2EgKKa48IYboaLZw5G8UR7vhk8agT6rL.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=bsidevops%40gp-prod-mmksi-web-01.iam.gserviceaccount.com%2F20260422%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260422T053716Z&X-Goog-Expires=604800&X-Goog-SignedHeaders=host&ts=1776836236&X-Goog-Signature=95f38e4d90c3ec7aac5090b403f6fe63d7d3fd2f5bde262f34337cf41d678bb3c35cec21a80ed6e7ad416fdd25e01d606d03dfd9f665b82e1ca0a040328615d63320705def10342b8b68e2ec9d773b10510c5afa32b960316d5c417bebcf8f1d9ea8d87095348b1ae1be3b48cd5215058989f5a5a0e9b2ab27565e5af1ce2aa80724d402b7a12791d53ec7b3075e05f531729138b5c07fb30158d2e466a9f1f0eee7452de06c80be1c23a4b298d9ddcced8b254135914e195148ccf5be90f0808f548e022984fb5e6d43c34c1dfad7ff2c126f07556e662c34e08c5ba7b695671295f6a0483ca10bdc6da878ad208e49c3c7cb283605c74ac43d131b2d76faa7",
    badge: "NEW"
  },
  {
    name: "Xforce",
    price: 390000000,
    img: "https://storage.googleapis.com/gcmkscsp001/public/products/highlights/eAVURLuZ3mzJtym2zYs7QGAsBma5UJ574ZNqm4np.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=bsidevops%40gp-prod-mmksi-web-01.iam.gserviceaccount.com%2F20260422%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260422T053706Z&X-Goog-Expires=604800&X-Goog-SignedHeaders=host&ts=1776836226&X-Goog-Signature=8d5ad173ed285a86a77764792318a6437ad1604393a1707a11215663c5e89e90dbe7628e5b0a243915c81cad43d54962d5b0e82e5b5779a476527269f319201f47f08bd1c810b0826bc5eade615414b577cedae48ef3e441113fecc8c5842c6b471b18326a367b15be22377246490c2324bdb7fc1f4067efcfff548b1c385e183ee86d87f44ee53e83d2fe3c194202020c457a6eaace7569032b0cfb9f017d1cf14007e2d717547cb793e3cf626c4d70bb9202648bd51fa2cecc9c49e8b8f5d5d14be5c834cc871e6b69e3a2e2b34af145fa26858a8d80f19c604a3de99a28ea59077faf8ea2a7b9a43819a8b1e64c7093ae86191524a09f67e4a659cb03e55b",
    badge: "POPULAR"
  },
  {
    name: "Fuso Canter",
    price: 452500000,
    img: "https://www.ktbfuso.co.id/wp-content/uploads/2023/02/CANTER-FE-73.webp",
    badge: "KENDARAAN NIAGA"
  }
];
