/**
 * Color conversion utilities for email templates
 * Supports: hex, rgb, rgba, hsl, hsla, oklch, and other formats
 */

interface ParsedOKLCH {
  l: number;
  c: number;
  h: number;
  a: number;
}

interface ParsedRGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ParsedHSL {
  h: number;
  s: number;
  l: number;
  a: number;
}

/**
 * Parse OKLCH color string
 * Examples: 
 * - "oklch(0.145 0 0)" -> { l: 0.145, c: 0, h: 0, a: 1 }
 * - "oklch(1 0 0 / 10%)" -> { l: 1, c: 0, h: 0, a: 0.1 }
 */
function parseOKLCH(oklchString: string): ParsedOKLCH {
  const content = oklchString.replace(/oklch\(|\)/g, "").trim();
  const [colorPart, alphaPart] = content.split("/").map((s) => s.trim());
  
  const parts = colorPart.split(/\s+/);
  const l = parseFloat(parts[0]) || 0;
  const c = parseFloat(parts[1]) || 0;
  const h = parseFloat(parts[2]) || 0;
  
  let a = 1;
  if (alphaPart) {
    a = alphaPart.includes("%") 
      ? parseFloat(alphaPart) / 100 
      : parseFloat(alphaPart);
  }
  
  return { l, c, h, a };
}

/**
 * Parse RGB/RGBA color string
 * Examples:
 * - "rgb(255, 0, 0)" -> { r: 255, g: 0, b: 0, a: 1 }
 * - "rgba(255, 0, 0, 0.5)" -> { r: 255, g: 0, b: 0, a: 0.5 }
 */
function parseRGB(rgbString: string): ParsedRGB {
  const content = rgbString
    .replace(/rgba?\(|\)/g, "")
    .trim()
    .split(",")
    .map((s) => s.trim());
  
  const r = parseInt(content[0]) || 0;
  const g = parseInt(content[1]) || 0;
  const b = parseInt(content[2]) || 0;
  const a = content[3] ? parseFloat(content[3]) : 1;
  
  return { r, g, b, a };
}

/**
 * Parse HSL/HSLA color string
 * Examples:
 * - "hsl(240, 100%, 50%)" -> { h: 240, s: 100, l: 50, a: 1 }
 * - "hsla(240, 100%, 50%, 0.5)" -> { h: 240, s: 100, l: 50, a: 0.5 }
 * - "240 100% 50%" -> { h: 240, s: 100, l: 50, a: 1 }
 */
function parseHSL(hslString: string): ParsedHSL {
  // Remove hsl/hsla wrapper if present
  const content = hslString.replace(/hsla?\(|\)/g, "").trim();
  
  // Split by comma or space
  const parts = content.includes(",")
    ? content.split(",").map((s) => s.trim())
    : content.split(/\s+/);
  
  const h = parseFloat(parts[0]) || 0;
  const s = parseFloat(parts[1]) || 0;
  const l = parseFloat(parts[2]) || 0;
  const a = parts[3] ? parseFloat(parts[3]) : 1;
  
  return { h, s, l, a };
}

/**
 * Convert OKLCH to sRGB
 * Based on the OKLab color space specification
 */
function oklchToRGB(l: number, c: number, h: number): { r: number; g: number; b: number } {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
  
  const gammaCorrect = (val: number): number => {
    if (val <= 0.0031308) return 12.92 * val;
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };
  
  r = gammaCorrect(r);
  g = gammaCorrect(g);
  b_ = gammaCorrect(b_);
  
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  b_ = Math.max(0, Math.min(1, b_));
  
  return { r, g, b: b_ };
}

/**
 * Convert HSL to RGB
 */
function hslToRGB(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return {
    r: r + m,
    g: g + m,
    b: b + m,
  };
}

/**
 * Convert RGB values (0-1 range) to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const rHex = Math.round(r * 255).toString(16).padStart(2, "0");
  const gHex = Math.round(g * 255).toString(16).padStart(2, "0");
  const bHex = Math.round(b * 255).toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Convert RGB values (0-255 range) to hex
 */
function rgb255ToHex(r: number, g: number, b: number): string {
  const rHex = Math.round(r).toString(16).padStart(2, "0");
  const gHex = Math.round(g).toString(16).padStart(2, "0");
  const bHex = Math.round(b).toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Universal color to hex converter
 * Detects and converts: hex, rgb, rgba, hsl, hsla, oklch
 * 
 * @param colorString - Any valid CSS color string
 * @returns Hex color code or #000000 if conversion fails
 */
export function colorToHex(colorString: string): string {
  if (!colorString) return "#000000";
  
  const trimmed = colorString.trim();
  
  try {
    // Already a hex color
    if (trimmed.startsWith("#")) {
      // Validate and normalize
      const hex = trimmed.replace("#", "");
      if (hex.length === 3) {
        // Convert 3-digit hex to 6-digit
        return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
      }
      if (hex.length === 6) {
        return `#${hex}`;
      }
      // Invalid hex format
      console.warn(`Invalid hex format: ${colorString}`);
      return "#000000";
    }
    
    // OKLCH format
    if (trimmed.startsWith("oklch")) {
      const { l, c, h } = parseOKLCH(trimmed);
      const { r, g, b } = oklchToRGB(l, c, h);
      return rgbToHex(r, g, b);
    }
    
    // RGB/RGBA format
    if (trimmed.startsWith("rgb")) {
      const { r, g, b } = parseRGB(trimmed);
      return rgb255ToHex(r, g, b);
    }
    
    // HSL/HSLA format
    if (trimmed.startsWith("hsl")) {
      const { h, s, l } = parseHSL(trimmed);
      const { r, g, b } = hslToRGB(h, s, l);
      return rgbToHex(r, g, b);
    }
    
    // Plain HSL format (e.g., "240 100% 50%")
    if (trimmed.includes("%")) {
      const { h, s, l } = parseHSL(trimmed);
      const { r, g, b } = hslToRGB(h, s, l);
      return rgbToHex(r, g, b);
    }
    
    // Unknown format
    console.warn(`Unknown color format: ${colorString}`);
    return "#000000";
    
  } catch (error) {
    console.error(`Failed to convert color "${colorString}":`, error);
    return "#000000";
  }
}

/**
 * Batch convert multiple colors from a schema object
 */
export function convertSchemaColors(
  schema: Record<string, string>
): Record<string, string> {
  const converted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(schema)) {
    converted[key] = colorToHex(value);
  }
  
  return converted;
}
