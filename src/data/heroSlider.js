/** Hero slides — backgrounds in `public/image/hero/` */
export const HERO_MOBILE_BG = '/image/hero/hero-mobile.png';

export const HERO_SLIDES = [
  {
    id: 1,
    image: '/image/hero/slide-1.png',
    line1: 'At Lithioo Perfume, we believe that fragrance is more than just a scent.',
    line2: '',
    imagePosition: 'center center',
  },
  {
    id: 2,
    image: '/image/hero/slide-2.png',
    line1: "It's an identity... a feeling... a lasting memory...",
    line2: '',
    imagePosition: 'center center',
  },
  {
    id: 3,
    image: '/image/hero/slide-3.png',
    line1: 'Carefully crafted to express you.',
    line2: '',
    imagePosition: 'center center',
  },
];

export const HERO_SLIDER_IMAGES = HERO_SLIDES.map((s) => s.image);
