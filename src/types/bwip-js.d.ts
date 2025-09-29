declare module "bwip-js" {
  interface BwipOptions {
    bcid: string;        // Barcode type
    text: string;        // Text to encode
    scale?: number;      // 2x, 3x, etc.
    height?: number;     // Bar height (mm)
    includetext?: boolean;
    textxalign?: string;
  }

  function toBuffer(
    options: BwipOptions,
    callback?: (err: Error | null, png: Buffer) => void
  ): Promise<Buffer>;

  export = { toBuffer };
}
