import { describe, it, expect } from 'vitest';
import { generateSizes } from '../../src/lib/media/responsive';
import {
  getPresetTransform,
  RESPONSIVE_CONFIG,
  CARD_WIDTHS,
  HERO_WIDTHS,
  AVATAR_WIDTHS,
} from '../../src/lib/media/transforms';

describe('generateSizes', () => {
  it('generizes sizes for hero', () => {
    const sizes = generateSizes('hero');
    expect(sizes).toBe('100vw');
  });

  it('generizes sizes for card', () => {
    const sizes = generateSizes('card');
    expect(sizes).toContain('640px');
  });

  it('generizes sizes for avatar', () => {
    const sizes = generateSizes('avatar');
    expect(sizes).toContain('48px');
  });
});

describe('transforms', () => {
  it('getPresetTransform returns card transform', () => {
    const t = getPresetTransform('card');
    expect(t.width).toBe(800);
    expect(t.height).toBe(450);
  });

  it('getPresetTransform returns hero transform', () => {
    const t = getPresetTransform('hero');
    expect(t.width).toBe(1920);
  });

  it('getPresetTransform returns avatar transform', () => {
    const t = getPresetTransform('avatar');
    expect(t.gravity).toBe('face');
  });

  it('RESPONSIVE_CONFIG has widths', () => {
    expect(RESPONSIVE_CONFIG.widths.length).toBeGreaterThan(0);
  });

  it('CARD_WIDTHS has entries', () => {
    expect(CARD_WIDTHS.length).toBeGreaterThan(0);
  });

  it('HERO_WIDTHS has entries', () => {
    expect(HERO_WIDTHS.length).toBeGreaterThan(0);
  });

  it('AVATAR_WIDTHS has entries', () => {
    expect(AVATAR_WIDTHS.length).toBeGreaterThan(0);
  });
});
