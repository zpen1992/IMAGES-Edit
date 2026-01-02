
export interface WallSettings {
  width: number;
  height: number;
  rows: number;
  cols: number;
  gap: number;
  angle: number;
  scale: number;
  scaleY: number;    // 纵向比例（用于实现平躺感）
  skew: number;      // 3D 纵深扭曲
  offsetX: number;
  offsetY: number;
  overlayOpacity: number;
  fillMode: 'cover' | 'stretch' | 'contain'; // 填充模式
}

export interface PosterImage {
  id: string;
  url: string;
  file: File;
}