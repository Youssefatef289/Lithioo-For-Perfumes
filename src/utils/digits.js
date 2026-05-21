const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const toArabicDigits = (value) =>
  String(value).replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)]);

export const localizeDigits = (value, language) =>
  language === 'ar' ? toArabicDigits(value) : String(value);
