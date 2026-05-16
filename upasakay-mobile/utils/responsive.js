import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on a standard ~5" device (iPhone X / common Android).
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Horizontal scale (widths, paddings that should track screen width).
export const scale = (size) => (width / GUIDELINE_BASE_WIDTH) * size;

// Vertical scale (heights that should track screen height).
export const verticalScale = (size) => (height / GUIDELINE_BASE_HEIGHT) * size;

// Softer scale for fonts/heights so small phones don't shrink text too hard
// and large phones don't blow it up. factor 0.5 = halfway to full scaling.
export const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;

// Floating bottom nav lives at { bottom: 25, height: 70 } (see app/(tabs)/Users/_layout.tsx).
// Scrollable screens add this as paddingBottom so content never sits under the bar.
// Safe-area bottom inset is applied separately via SafeAreaView.
export const NAV_CLEARANCE = Math.round(verticalScale(120));
