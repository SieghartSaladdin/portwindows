/**
 * Shared spritesheet preparation for the walking desktop pets (Frieren, Fern, Stark).
 *
 * The raw sheets are 4x4 grids of hand-drawn frames sitting on a flat grey backdrop,
 * with each frame free-floating inside its own gutter. Cropping every cell at a fixed
 * Y origin leaves a different amount of empty space under the boots per direction
 * (~22-25px for the side-facing rows), which reads on screen as the pet hovering
 * above the taskbar instead of standing on it.
 *
 * buildGroundedPetSheet chroma-keys the backdrop, finds each frame's real foot baseline
 * from the alpha channel, and re-anchors that baseline to the bottom edge of its cell.
 * Every frame of every direction then shares one floor line, so wherever the pet is
 * placed its lowest boot pixel is exactly on the container's bottom edge.
 *
 * Grounding is per frame rather than per row on purpose: the frames of a row sit at
 * heights that differ by up to 10px, and the resting frame happens to be one of the
 * highest, so a row-level baseline would leave an idle pet hovering.
 */

/** Width of one cell in the normalised sheet this module emits. */
export const PET_CELL_WIDTH = 240;
/** Height of one cell in the normalised sheet this module emits. */
export const PET_CELL_HEIGHT = 280;
/** Taskbar box height (`h-13 min-h-[52px]`) — a pet's feet rest on its top border line. */
export const PET_FLOOR_HEIGHT = 52;

/** Backdrop colours are flat, but JPEG-ish artefacts need a little slack. */
const KEY_TOLERANCE = 15;
/** Alpha at or above this counts as sprite ink rather than a keying fringe. */
const ALPHA_THRESHOLD = 128;
/** A scanline needs this many ink pixels to count as content, ignoring stray speckles. */
const MIN_INK_PER_LINE = 3;
/** Content runs shorter than this are gutter noise, not a sprite row. */
const MIN_BAND_HEIGHT = 20;

export interface GroundedPetSheet {
  /** Normalised 960x1120 sheet, 4 columns x 4 direction rows, feet on the cell bottom. */
  dataUrl: string;
  /** The same sheet as a canvas, for callers that draw overlays (talking mouths) on top. */
  canvas: HTMLCanvasElement;
  /**
   * Per `[row][column]`, how far that frame moved down versus the legacy fixed-Y crop.
   * Add it to any overlay coordinate that was tuned against the old layout (the talking
   * mouths) so the overlay travels with the frame.
   */
  cellShift: number[][];
}

interface BuildOptions {
  /** Horizontal centre of each frame in source pixels, `[row][column]`. */
  centerX: number[][];
  /** Legacy fixed crop origins, used only to report `cellShift` for overlay coordinates. */
  legacyStartY: number[];
}

/** Bottom-most scanline holding real ink within a box, or -1 when the box is empty. */
function findInkBottom(
  ink: Uint8Array,
  srcWidth: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
): number {
  for (let y = y1; y >= y0; y--) {
    let count = 0;
    for (let x = x0; x < x1; x++) {
      if (ink[y * srcWidth + x] && ++count >= MIN_INK_PER_LINE) return y;
    }
  }
  return -1;
}

/** Split the sheet into its four horizontal content bands by looking for empty gutters. */
function findRowBands(ink: Uint8Array, srcWidth: number, srcHeight: number): Array<[number, number]> {
  const bands: Array<[number, number]> = [];
  let start = -1;

  for (let y = 0; y < srcHeight; y++) {
    let count = 0;
    for (let x = 0; x < srcWidth; x++) {
      if (ink[y * srcWidth + x] && ++count >= MIN_INK_PER_LINE) break;
    }

    const hasContent = count >= MIN_INK_PER_LINE;
    if (hasContent && start < 0) start = y;
    if (!hasContent && start >= 0) {
      if (y - start >= MIN_BAND_HEIGHT) bands.push([start, y - 1]);
      start = -1;
    }
  }
  if (start >= 0 && srcHeight - start >= MIN_BAND_HEIGHT) bands.push([start, srcHeight - 1]);

  return bands;
}

export function buildGroundedPetSheet(
  img: HTMLImageElement,
  { centerX, legacyStartY }: BuildOptions,
): GroundedPetSheet | null {
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = img.width;
  srcCanvas.height = img.height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return null;
  srcCtx.drawImage(img, 0, 0);

  const imgData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const pixels = imgData.data;
  const srcWidth = srcCanvas.width;
  const srcHeight = srcCanvas.height;

  // The top-left pixel is always backdrop, so it doubles as the key colour.
  const keyR = pixels[0];
  const keyG = pixels[1];
  const keyB = pixels[2];

  // Knock out the backdrop and record which pixels are solid sprite ink in one pass.
  const ink = new Uint8Array(srcWidth * srcHeight);
  for (let p = 0; p < ink.length; p++) {
    const i = p * 4;
    if (
      Math.abs(pixels[i] - keyR) < KEY_TOLERANCE &&
      Math.abs(pixels[i + 1] - keyG) < KEY_TOLERANCE &&
      Math.abs(pixels[i + 2] - keyB) < KEY_TOLERANCE
    ) {
      pixels[i + 3] = 0;
    } else if (pixels[i + 3] >= ALPHA_THRESHOLD) {
      ink[p] = 1;
    }
  }
  srcCtx.putImageData(imgData, 0, 0);

  const detected = findRowBands(ink, srcWidth, srcHeight);
  // Fall back to the legacy fixed windows if a sheet ever lands without clean gutters.
  const bands: Array<[number, number]> =
    detected.length === 4
      ? detected
      : legacyStartY.map((top) => [top, Math.min(srcHeight - 1, top + PET_CELL_HEIGHT - 1)] as [number, number]);

  const sheet = document.createElement('canvas');
  sheet.width = PET_CELL_WIDTH * 4;
  sheet.height = PET_CELL_HEIGHT * 4;
  const ctx = sheet.getContext('2d');
  if (!ctx) return null;

  const halfWidth = PET_CELL_WIDTH / 2;
  const cellShift: number[][] = [];

  for (let r = 0; r < 4; r++) {
    const [bandTop, bandBottom] = bands[r];
    // A crop must never reach back into the band above, or it drags that row's boots in.
    const previousBandBottom = r > 0 ? bands[r - 1][1] : -1;
    const rowShift: number[] = [];

    for (let c = 0; c < 4; c++) {
      const sX = Math.round(centerX[r][c] - halfWidth);
      const x0 = Math.max(0, sX);
      const x1 = Math.min(srcWidth, x0 + PET_CELL_WIDTH);

      // Lowest boot pixel of this frame: where its floor line is.
      let footY = findInkBottom(ink, srcWidth, x0, x1, bandTop, bandBottom);
      if (footY < 0) footY = bandBottom;

      // Take the cell as the strip of source ending on that floor line, so the boots
      // land on the cell's bottom edge and the head keeps whatever room is left.
      const cropTop = Math.min(footY, Math.max(0, previousBandBottom + 1, footY - PET_CELL_HEIGHT + 1));
      const cropHeight = footY + 1 - cropTop;
      const destY = r * PET_CELL_HEIGHT + (PET_CELL_HEIGHT - cropHeight);

      ctx.drawImage(
        srcCanvas,
        sX, cropTop, PET_CELL_WIDTH, cropHeight,
        c * PET_CELL_WIDTH, destY, PET_CELL_WIDTH, cropHeight,
      );

      rowShift.push(legacyStartY[r] + PET_CELL_HEIGHT - 1 - footY);
    }

    cellShift.push(rowShift);
  }

  return { dataUrl: sheet.toDataURL(), canvas: sheet, cellShift };
}
