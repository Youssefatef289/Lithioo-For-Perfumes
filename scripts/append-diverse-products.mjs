import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/newDiverseProducts.js');
let code = fs.readFileSync(filePath, 'utf8');

// Update brandId fallback in make
code = code.replace(
  'brandId: getBrandIdByName(config.brand),',
  "brandId: config.brandId || getBrandIdByName(config.brand) || (config.brand ? config.brand.toLowerCase().replace(/\\s+/g, '-') : null),"
);

const newProducts = [
  {
    id: 'nd-other-mashaaer-silver',
    name: 'Mashaaer Silver',
    nameAr: 'مشاعر فضي',
    brand: 'Elite Oud',
    brandAr: 'نخبة العود',
    category: 'Unisex Fragrance',
    categoryAr: 'عطر للجنسين',
    price: 750,
    size: '100ml',
    image: '/image/Perfume brands/Other/مشاعر فضي 750 (1).jpg',
    imageHover: '/image/Perfume brands/Other/مشاعر فضي 750 (2).jpg',
    detailImages: [
      '/image/Perfume brands/Other/مشاعر فضي 750 (1).jpg',
      '/image/Perfume brands/Other/مشاعر فضي 750 (2).jpg'
    ],
    description: 'Mashaaer Silver is a captivating oriental fragrance blending refreshing top notes with a luxurious amber and musk base.',
    descriptionAr: 'عطر مشاعر فضي عطر شرقي ساحر يجمع بين الإشراق والانتعاش مع قاعدة فاخرة من العنبر والمسك.',
    ingredients: ['Bergamot', 'Geranium', 'White Musk', 'Amber'],
    ingredientsAr: ['البرغموت', 'إبرة الراعي', 'المسك الأبيض', 'العنبر'],
    benefits: ['Gentle yet captivating oriental trail', 'Affordable luxury for every day', 'Ideal for both men and women'],
    benefitsAr: ['أثر شرقي هادئ وساحر', 'فخامة يومية بسعر مميز', 'مثالي للرجال والنساء']
  },
  {
    id: 'nd-lattafa-oud-mood',
    name: 'Lattafa Oud Mood',
    nameAr: 'عطر لطافة عود مود',
    brand: 'Lattafa',
    brandAr: 'لطافة',
    category: 'Unisex Fragrance',
    categoryAr: 'عطر للجنسين',
    price: 1200,
    size: '100ml',
    image: '/image/Perfume brands/Lattafa/عطر لطافة عود مود للجنسين - او دي بارفان - 100 مل 1200  (1).jpeg',
    imageHover: '/image/Perfume brands/Lattafa/عطر لطافة عود مود للجنسين - او دي بارفان - 100 مل 1200  (2).jpg',
    detailImages: [
      '/image/Perfume brands/Lattafa/عطر لطافة عود مود للجنسين - او دي بارفان - 100 مل 1200  (1).jpeg',
      '/image/Perfume brands/Lattafa/عطر لطافة عود مود للجنسين - او دي بارفان - 100 مل 1200  (2).jpg',
      '/image/Perfume brands/Lattafa/عطر لطافة عود مود للجنسين - او دي بارفان - 100 مل 1200  (3).jpg'
    ],
    description: 'Lattafa Oud Mood Eau de Parfum is an alluring oriental sweet oud fragrance with warm spices, caramel, and amber.',
    descriptionAr: 'عطر لطافة عود مود للجنسين ماء عطر شرقي دافئ يجمع بين حلاوة الكراميل والعنبر مع فخامة العود والتوابل.',
    ingredients: ['Oud', 'Caramel', 'Floral Notes', 'Amber', 'Resins'],
    ingredientsAr: ['العود', 'الكراميل', 'النوتات الزهرية', 'العنبر', 'الراتنجات'],
    benefits: ['Warm sweet-oud projection', 'Excellent longevity', 'Rich comforting autumn/winter scent'],
    benefitsAr: ['فوحان عود حلو ودافئ', 'ثبات ممتاز يدوم طويلاً', 'عطر شتوي مريح وفاخر']
  },
  {
    id: 'nd-amarah-rehal-forest',
    name: 'Rehal Forest AMARAH by LE BONHEUR',
    nameAr: 'عطر رحال فورست أمارة من لو بونور',
    brand: 'Amarah',
    brandAr: 'أمارة',
    category: 'Unisex Fragrance',
    categoryAr: 'عطر للجنسين',
    price: 2300,
    size: '100ml',
    image: '/image/Perfume brands/Amarah/Rehal Forest AMARAH by LE BONHEUR 100ml 2300 (1).png',
    imageHover: '/image/Perfume brands/Amarah/Rehal Forest AMARAH by LE BONHEUR 100ml 2300 (2).png',
    detailImages: [
      '/image/Perfume brands/Amarah/Rehal Forest AMARAH by LE BONHEUR 100ml 2300 (1).png',
      '/image/Perfume brands/Amarah/Rehal Forest AMARAH by LE BONHEUR 100ml 2300 (2).png'
    ],
    description: 'Rehal Forest AMARAH by LE BONHEUR is a rich woody aromatic perfume capturing the spirit of untouched nature and exotic forests.',
    descriptionAr: 'عطر رحال فورست أمارة من لو بونور هو عطر خشبي أروما فاخر يجسد سحر الطبيعة العذراء وغموض الغابات الاستوائية.',
    ingredients: ['Cedarwood', 'Cypress', 'Earthy Notes', 'Musk', 'Vetiver'],
    ingredientsAr: ['خشب الأرز', 'السرو', 'النوتات الترابية', 'المسك', 'الفتيفر'],
    benefits: ['Invigorating forest-fresh aura', 'Distinctive signature woody aroma', 'High concentration and projection'],
    benefitsAr: ['هالة عطرية منعشة كالغابات الطبيعية', 'توقيع خشبي مميز وفريد', 'تركيز عالٍ وفوحان ملموس']
  },
  {
    id: 'nd-armaf-club-de-nuit',
    name: 'Club De Nuit Intense Man',
    nameAr: 'كلوب دي نوي إنتنس للرجال',
    brand: 'Armaf',
    brandAr: 'أرماف',
    category: "Men's Fragrance",
    categoryAr: 'عطر رجالي',
    price: 2300,
    size: '105ml',
    image: '/image/Perfume brands/Armaf/CLUB DE NUIT INTENSE MAN 105 ML 2300 (1).jpeg',
    imageHover: '/image/Perfume brands/Armaf/CLUB DE NUIT INTENSE MAN 105 ML 2300 (2).jpeg',
    detailImages: [
      '/image/Perfume brands/Armaf/CLUB DE NUIT INTENSE MAN 105 ML 2300 (1).jpeg',
      '/image/Perfume brands/Armaf/CLUB DE NUIT INTENSE MAN 105 ML 2300 (2).jpeg'
    ],
    description: 'Armaf Club De Nuit Intense Man is a worldwide sensation featuring bold smoky pineapple, birch, and blackcurrant notes.',
    descriptionAr: 'عطر كلوب دي نوي إنتنس للرجال من أرماف، أيقونة عالمية بتركيبة مدخنة جذابة تجمع الأناناس والبتولا والكشمش الأسود.',
    ingredients: ['Lemon', 'Pineapple', 'Birch', 'Blackcurrant', 'Patchouli', 'Musk'],
    ingredientsAr: ['الليمون', 'الأناناس', 'البتولا', 'الكشمش الأسود', 'البتشولي', 'المسك'],
    benefits: ['Legendary compliment magnet', 'Beast mode projection and longevity', 'Versatile signature for any occasion'],
    benefitsAr: ['جاذبية أسطورية تلفت الأنظار', 'فوحان وثبات فائق القوة', 'عطر توقيع شخصي يناسب جميع المناسبات']
  },
  {
    id: 'nd-lithioo-silk-musk-uae',
    name: 'Silk Musk Eau De Parfum (UAE)',
    nameAr: 'عطر سيلك مسك أو دي بارفان (الإمارات)',
    brand: 'Lithioo',
    brandAr: 'ليثيو',
    category: 'Unisex Fragrance',
    categoryAr: 'عطر للجنسين',
    price: 1500,
    size: '100ml',
    image: '/image/Perfume brands/Lithioo/Silk Musk Eau De Parfum 100ml Longlasting Fragrance for Unisex (UAE) 1500 (1).webp',
    imageHover: '/image/Perfume brands/Lithioo/Silk Musk Eau De Parfum 100ml Longlasting Fragrance for Unisex (UAE) 1500 (2).webp',
    detailImages: [
      '/image/Perfume brands/Lithioo/Silk Musk Eau De Parfum 100ml Longlasting Fragrance for Unisex (UAE) 1500 (1).webp',
      '/image/Perfume brands/Lithioo/Silk Musk Eau De Parfum 100ml Longlasting Fragrance for Unisex (UAE) 1500 (2).webp',
      '/image/Perfume brands/Lithioo/Silk Musk Eau De Parfum 100ml Longlasting Fragrance for Unisex (UAE) 1500 (3).webp'
    ],
    description: 'Silk Musk Eau De Parfum 100ml is a velvety smooth, pure white musk fragrance crafted in the UAE for ultimate softness and longevity.',
    descriptionAr: 'عطر سيلك مسك أو دي بارفان 100 مل مسك ناعم كالحرير مصمم في الإمارات بنقاء استثنائي وثبات ناعم يدوم طوال اليوم.',
    ingredients: ['Silk Musk', 'Lily of the Valley', 'Powdery Notes', 'White Amber'],
    ingredientsAr: ['مسك الحرير', 'زنبق الوادي', 'النوتات البودرية', 'العنبر الأبيض'],
    benefits: ['Pure silky clean scent', 'Long-lasting soft radiance', 'Delicate and skin-friendly'],
    benefitsAr: ['رائحة نظافة حريرية نقية', 'إشراقة ناعمة تدوم طويلاً', 'لطيف ومريح جداً على البشرة']
  },
  {
    id: 'nd-french-avenue-marmara',
    name: 'Extrait de Parfum Marmara',
    nameAr: 'عطر مرمرة إكستري دي بارفان',
    brand: 'French Avenue',
    brandAr: 'فرنش أفينيو',
    category: 'Unisex Fragrance',
    categoryAr: 'عطر للجنسين',
    price: 2500,
    size: '100ml',
    image: '/image/Perfume brands/French Avenue/Extrait de parfum Marmara 100 ml - French Avenue 2500ج (1).webp',
    imageHover: '/image/Perfume brands/French Avenue/Extrait de parfum Marmara 100 ml - French Avenue 2500ج (2).jpeg',
    detailImages: [
      '/image/Perfume brands/French Avenue/Extrait de parfum Marmara 100 ml - French Avenue 2500ج (1).webp',
      '/image/Perfume brands/French Avenue/Extrait de parfum Marmara 100 ml - French Avenue 2500ج (2).jpeg'
    ],
    description: 'Extrait de parfum Marmara by French Avenue is a high-concentration niche creation combining Mediterranean marine freshness with deep woody resins.',
    descriptionAr: 'عطر مرمرة إكستري دي بارفان من فرنش أفينيو بتركيز نيش فائق، يمزج انتعاش البحر الأبيض المتوسط مع فخامة الأخشاب والراتنجات.',
    ingredients: ['Marine Notes', 'Citrus Peel', 'Cedar', 'Ambergris', 'Rare Spices'],
    ingredientsAr: ['النوتات البحرية', 'قشور الحمضيات', 'خشب الأرز', 'العنبر الرمادي', 'التوابل النادرة'],
    benefits: ['Niche quality Extrait de Parfum concentration', 'Crisp fresh yet opulent deep base', 'Spectacular endurance'],
    benefitsAr: ['تركيز إكستري دي بارفان بجودة النيش', 'انتعاش نقي مع قاعدة فاخرة عميقة', 'ثبات استثنائي يدوم لأيام']
  },
  {
    id: 'nd-arabiyat-aqriz',
    name: 'Aqriz by Arabiyat Prestige',
    nameAr: 'عطر أقريز من عربيات برستيج',
    brand: 'Arabiyat Prestige',
    brandAr: 'عربيات برستيج',
    category: 'Unisex Fragrance',
    categoryAr: 'عطر للجنسين',
    price: 2300,
    size: '100ml',
    image: '/image/Perfume brands/arabiyat prestige/aqriz 100ml 2300 (1).jpg',
    imageHover: '/image/Perfume brands/arabiyat prestige/aqriz 100ml 2300 (2).jpg',
    detailImages: [
      '/image/Perfume brands/arabiyat prestige/aqriz 100ml 2300 (1).jpg',
      '/image/Perfume brands/arabiyat prestige/aqriz 100ml 2300 (2).jpg'
    ],
    description: 'Aqriz by Arabiyat Prestige presents an opulent oriental experience rich in amber, rare spices, and precious wood.',
    descriptionAr: 'عطر أقريز من عربيات برستيج يقدم تجربة شرقية فاخرة غنية بالعنبر والتوابل النادرة والأخشاب الكريمة.',
    ingredients: ['Saffron', 'Nutmeg', 'Precious Woods', 'Amber', 'Musk'],
    ingredientsAr: ['الزعفران', 'جوزة الطيب', 'الأخشاب الثمينة', 'العنبر', 'المسك'],
    benefits: ['Prestigious oriental projection', 'Sophisticated bottle presentation', 'Balanced spicy-sweet harmony'],
    benefitsAr: ['فوحان شرقي فاخر ومهيب', 'تصميم زجاجة فائق الأناقة', 'تناغم متوازن بين الدفء والتوابل']
  },
  {
    id: 'nd-arabiyat-kohl',
    name: 'Kohl by Arabiyat Prestige',
    nameAr: 'عطر كحل من عربيات برستيج',
    brand: 'Arabiyat Prestige',
    brandAr: 'عربيات برستيج',
    category: 'Unisex Fragrance',
    categoryAr: 'عطر للجنسين',
    price: 2200,
    size: '100ml',
    image: '/image/Perfume brands/arabiyat prestige/kohl 100ml 2200 (1).jpg',
    imageHover: '/image/Perfume brands/arabiyat prestige/kohl 100ml 2200 (2).jpg',
    detailImages: [
      '/image/Perfume brands/arabiyat prestige/kohl 100ml 2200 (1).jpg',
      '/image/Perfume brands/arabiyat prestige/kohl 100ml 2200 (2).jpg'
    ],
    description: 'Kohl by Arabiyat Prestige is an intense, enigmatic perfume with dark smoky accords, incense, and velvet florals.',
    descriptionAr: 'عطر كحل من عربيات برستيج عطر غامض ومكثف بنغمات مدخنة آسرة من البخور ونفحات زهرية مخملية.',
    ingredients: ['Incense', 'Dark Rose', 'Smoky Woods', 'Oud Accord', 'Leather'],
    ingredientsAr: ['البخور', 'الورد الداكن', 'الأخشاب المدخنة', 'أكورد العود', 'الجلد'],
    benefits: ['Deep enigmatic personality', 'Long-lasting smoky-sweet sillage', 'Perfect for formal evening wear'],
    benefitsAr: ['شخصية عطرية عميقة وساحرة', 'فوحان دخاني حلو يدوم طويلاً', 'مثالي للأمسيات والمناسبات الرسمية']
  },
  {
    id: 'nd-arabiyat-raees-aurum',
    name: 'Raees Aurum by Arabiyat Prestige',
    nameAr: 'عطر رئيس أوروم من عربيات برستيج',
    brand: 'Arabiyat Prestige',
    brandAr: 'عربيات برستيج',
    category: "Men's Fragrance",
    categoryAr: 'عطر رجالي',
    price: 2300,
    size: '180ml',
    image: '/image/Perfume brands/arabiyat prestige/RAEES-AURUM_ 180مل  2300ج (1).jpg',
    imageHover: '/image/Perfume brands/arabiyat prestige/RAEES-AURUM_ 180مل  2300ج (2).jpg',
    detailImages: [
      '/image/Perfume brands/arabiyat prestige/RAEES-AURUM_ 180مل  2300ج (1).jpg',
      '/image/Perfume brands/arabiyat prestige/RAEES-AURUM_ 180مل  2300ج (2).jpg'
    ],
    description: 'Raees Aurum in a generous 180ml bottle delivers a regal golden aura with luminous citrus, ambergris, and refined leather.',
    descriptionAr: 'عطر رئيس أوروم بحجم 180 مل الكبير يمنحك هالة ذهبية ملكية من الحمضيات المضيئة والعنبر والجلد الراقي.',
    ingredients: ['Bergamot', 'Cardamom', 'Ambergris', 'Cedarwood', 'Leather'],
    ingredientsAr: ['البرغموت', 'الهيل', 'عنبر الحوت', 'خشب الأرز', 'الجلد'],
    benefits: ['Massive 180ml luxury edition', 'Royal masculine aura', 'Outstanding value and sillage'],
    benefitsAr: ['إصدار فاخر بحجم 180 مل ضخم', 'هالة ملكية رجالية لا تُنسى', 'قيمة استثنائية وفوحان فائق']
  },
  {
    id: 'nd-arabiyat-revolt',
    name: 'Revolt Uncaged by Arabiyat Prestige',
    nameAr: 'عطر ريفولت أنكيجد من عربيات برستيج',
    brand: 'Arabiyat Prestige',
    brandAr: 'عربيات برستيج',
    category: 'Unisex Fragrance',
    categoryAr: 'عطر للجنسين',
    price: 2300,
    size: '100ml',
    image: '/image/Perfume brands/arabiyat prestige/Revolt uncaged 100ml 2300 (1).jpg',
    imageHover: '/image/Perfume brands/arabiyat prestige/Revolt uncaged 100ml 2300 (2).jpg',
    detailImages: [
      '/image/Perfume brands/arabiyat prestige/Revolt uncaged 100ml 2300 (1).jpg',
      '/image/Perfume brands/arabiyat prestige/Revolt uncaged 100ml 2300 (2).jpg'
    ],
    description: 'Revolt Uncaged is a rebellious and modern masterpiece boasting vibrant spices, aromatic lavender, and dark vetiver.',
    descriptionAr: 'عطر ريفولت أنكيجد تحفة عطرية جريئة وعصرية تفيض بالتوابل الحيوية واللافندر العطري والفتيفر الداكن.',
    ingredients: ['Black Pepper', 'Lavender', 'Tonka Bean', 'Dark Vetiver', 'Amber'],
    ingredientsAr: ['الفلفل الأسود', 'اللافندر', 'حبوب التونكا', 'الفتيفر الداكن', 'العنبر'],
    benefits: ['Bold modern rebellious projection', 'Energizing spicy-fresh contrast', 'Remarkable staying power'],
    benefitsAr: ['فوحان جريء وعصري يلفت الانتباه', 'تباين حيوي ومنعش بين التوابل والأخشاب', 'ثبات ممتاز طوال اليوم']
  }
];

const formatted = newProducts.map(p => '  make(' + JSON.stringify(p, null, 4).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n') + '),').join('\n');

const lastBracket = code.lastIndexOf('];');
if (lastBracket === -1) {
  console.error('Could not find closing ]; in newDiverseProducts.js');
  process.exit(1);
}

const updated = code.slice(0, lastBracket) + formatted + '\n];\n';
fs.writeFileSync(filePath, updated, 'utf8');
console.log('Successfully appended 10 new products to NEW_DIVERSE_PRODUCTS!');

