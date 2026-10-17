import { parsePrice, formatEGP } from '../price';
import { getProductSizePrice, BOTTLE_SIZES } from '../../data/sizes';

describe('Price calculation and formatting utilities', () => {
  test('parsePrice parses numbers correctly', () => {
    expect(parsePrice(450)).toBe(450);
    expect(parsePrice('450 EGP')).toBe(450);
    expect(parsePrice('EGP 1,200.50')).toBe(1200.5);
    expect(parsePrice('invalid')).toBe(0);
    expect(parsePrice(null)).toBe(0);
  });

  test('formatEGP formats number with currency', () => {
    expect(formatEGP(300)).toContain('300');
    expect(formatEGP(300)).toContain('EGP');
  });

  test('getProductSizePrice respects default sizes and overrides', () => {
    const productWithoutOverride = { id: 'test', sizePrices: null };
    expect(getProductSizePrice(productWithoutOverride, '30ml')).toBe(300);
    expect(getProductSizePrice(productWithoutOverride, '50ml')).toBe(450);
    expect(getProductSizePrice(productWithoutOverride, '100ml')).toBe(650);

    const productWithOverride = {
      id: 'test-override',
      sizePrices: { '30ml': 350, '50ml': 500, '100ml': 750 },
    };
    expect(getProductSizePrice(productWithOverride, '30ml')).toBe(350);
    expect(getProductSizePrice(productWithOverride, '50ml')).toBe(500);
    expect(getProductSizePrice(productWithOverride, '100ml')).toBe(750);
  });

  test('Order subtotal calculation works correctly', () => {
    const items = [
      { price: '300', quantity: 2 },
      { price: 650, quantity: 1 },
    ];
    const subtotal = items.reduce(
      (sum, item) => sum + parsePrice(item.price) * item.quantity,
      0
    );
    expect(subtotal).toBe(1250);
  });
});

