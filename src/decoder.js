import { EncodedPacketSink, Input, ALL_FORMATS, UrlSource } from 'https://esm.sh/mediabunny';

/**
 * Hardware-accelerated Video Tile Decoder using WebCodecs API and Mediabunny.
 * Demuxes WebM container and feeds encoded VP9 chunks to the browser's native VideoDecoder.
 */
export class VideoTileDecoder {
  constructor() {
    this.frames = [];
    this.isReady = false;
    this.isLoading = false;
    this.decoder = null;
  }

  async load(url) {
    if (this.isLoading || this.isReady) return;
    this.isLoading = true;

    try {
      const decodedFrames = [];

      this.decoder = new VideoDecoder({
        output: (frame) => {
          decodedFrames.push(frame);
        },
        error: (err) => {
          console.error('WebCodecs VideoDecoder error:', err);
        },
      });

      const input = new Input({
        source: new UrlSource(url),
        formats: ALL_FORMATS,
      });

      const videoTrack = await input.getPrimaryVideoTrack();
      if (!videoTrack) {
        throw new Error(`No video track found in ${url}`);
      }

      const config = await videoTrack.getDecoderConfig();
      if (!config) {
        throw new Error('Failed to get decoder configuration from video track');
      }

      this.decoder.configure(config);

      const sink = new EncodedPacketSink(videoTrack);
      for await (const packet of sink.packets()) {
        const chunk = packet.toEncodedVideoChunk();
        this.decoder.decode(chunk);
      }

      await this.decoder.flush();

      // Sorteer frames op timestamp voor exacte synchrone indexering
      decodedFrames.sort((a, b) => a.timestamp - b.timestamp);
      this.frames = decodedFrames;
      this.isReady = true;
      this.isLoading = false;
      console.log(`WebCodecs: ${this.frames.length} frames gedecodeerd uit ${url}`);
    } catch (err) {
      this.isLoading = false;
      console.error('VideoTileDecoder load failed:', err);
      throw err;
    }
  }

  /**
  /**
   * Tekent het actuele VideoFrame rechtstreeks op de tegelcoördinaten.
   * @param {number} frameIndex 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} dx 
   * @param {number} dy 
   * @param {number} dw 
   * @param {number} dh 
   */
  drawTile(frameIndex, ctx, dx, dy, dw, dh) {
    if (!this.isReady || this.frames.length === 0) return;
    const idx = Math.abs(frameIndex) % this.frames.length;
    const frame = this.frames[idx];
    ctx.drawImage(frame, dx, dy, dw, dh);
  }

  destroy() {
    for (const frame of this.frames) {
      frame.close();
    }
    this.frames = [];
    if (this.decoder) {
      this.decoder.close();
      this.decoder = null;
    }
    this.isReady = false;
  }
}
