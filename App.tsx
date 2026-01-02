
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { WallSettings, PosterImage } from './types';

const DEFAULT_SETTINGS: WallSettings = {
  width: 1920,
  height: 1080,
  rows: 6,
  cols: 10,
  gap: 30,
  angle: -20,
  scale: 1.5,
  scaleY: 0.65,
  skew: 0.15,
  offsetX: 0,
  offsetY: 0,
  overlayOpacity: 0.1,
  fillMode: 'cover',
};

const generateRandomFilename = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `POSTER_${randomPart}`;
};

const ControlItem: React.FC<{
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  theme: 'dark' | 'light';
  onChange: (val: number) => void;
}> = ({ label, min, max, step = 1, value, theme, onChange }) => (
  <div className="flex flex-col gap-2 mb-6">
    <div className="flex justify-between items-center px-0.5">
      <label className={`text-[12px] font-bold tracking-tight ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>{label}</label>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`w-16 border rounded px-1.5 py-0.5 text-[11px] font-mono text-right focus:outline-none focus:ring-1 ${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700 text-white focus:ring-neutral-600' 
            : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-black'
        }`}
      />
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))} 
      className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
        theme === 'dark' ? 'accent-white bg-neutral-800' : 'accent-black bg-neutral-200'
      }`} 
    />
  </div>
);

const Sidebar: React.FC<{
  settings: WallSettings;
  setSettings: React.Dispatch<React.SetStateAction<WallSettings>>;
  onDownload: () => void;
  onClear: () => void;
  onReset: () => void;
  isGenerating: boolean;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  theme: 'dark' | 'light';
}> = ({ settings, setSettings, onDownload, onClear, onReset, isGenerating, isOpen, setIsOpen, theme }) => {
  const handleChange = (key: keyof WallSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const bgClass = theme === 'dark' ? 'bg-black border-neutral-800' : 'bg-white border-neutral-100';
  const textClass = theme === 'dark' ? 'text-white' : 'text-black';

  return (
    <div className={`fixed top-0 left-0 h-screen w-80 border-r shadow-2xl z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${bgClass} ${textClass} p-6 flex flex-col overflow-y-auto`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-black tracking-tighter uppercase">Settings</h1>
        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-500/10 rounded-full transition-colors">
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Canvas / 画布</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className={`${theme === 'dark' ? 'bg-neutral-900' : 'bg-neutral-50'} p-3 rounded-xl border ${theme === 'dark' ? 'border-neutral-800' : 'border-neutral-100'}`}>
              <label className="text-[9px] text-neutral-500 block mb-1 uppercase">Width</label>
              <input type="number" value={settings.width} onChange={(e) => handleChange('width', parseInt(e.target.value))} className="w-full bg-transparent text-sm font-mono focus:outline-none" />
            </div>
            <div className={`${theme === 'dark' ? 'bg-neutral-900' : 'bg-neutral-50'} p-3 rounded-xl border ${theme === 'dark' ? 'border-neutral-800' : 'border-neutral-100'}`}>
              <label className="text-[9px] text-neutral-500 block mb-1 uppercase">Height</label>
              <input type="number" value={settings.height} onChange={(e) => handleChange('height', parseInt(e.target.value))} className="w-full bg-transparent text-sm font-mono focus:outline-none" />
            </div>
          </div>
        </section>

        <section className="py-6 border-y border-neutral-500/10">
          <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Fitting / 填充</h2>
          <div className="flex p-1 bg-neutral-500/5 rounded-xl gap-1">
            {[{ id: 'cover', label: '裁剪' }, { id: 'stretch', label: '拉伸' }, { id: 'contain', label: '比例' }].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleChange('fillMode', mode.id)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                  settings.fillMode === mode.id 
                    ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white')
                    : 'text-neutral-500 hover:bg-neutral-500/10'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </section>

        <section className="pb-6 border-b border-neutral-500/10">
          <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Grid / 阵列</h2>
          <ControlItem label="行数" min={1} max={30} value={settings.rows} theme={theme} onChange={(v) => handleChange('rows', v)} />
          <ControlItem label="列数" min={1} max={30} value={settings.cols} theme={theme} onChange={(v) => handleChange('cols', v)} />
          <ControlItem label="间距" min={0} max={200} value={settings.gap} theme={theme} onChange={(v) => handleChange('gap', v)} />
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Transform / 变换</h2>
          <ControlItem label="倾斜角度" min={-180} max={180} value={settings.angle} theme={theme} onChange={(v) => handleChange('angle', v)} />
          <ControlItem label="纵向比例" min={0.1} max={2} step={0.01} value={settings.scaleY} theme={theme} onChange={(v) => handleChange('scaleY', v)} />
          <ControlItem label="纵深扭曲" min={-1} max={1} step={0.01} value={settings.skew} theme={theme} onChange={(v) => handleChange('skew', v)} />
          <ControlItem label="整体缩放" min={0.1} max={10} step={0.1} value={settings.scale} theme={theme} onChange={(v) => handleChange('scale', v)} />
        </section>
      </div>

      <div className="mt-auto pt-8 border-t border-neutral-500/10 space-y-4">
        <button 
          onClick={onDownload}
          disabled={isGenerating}
          className={`w-full font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              theme === 'dark' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
          }`}
        >
          {isGenerating ? '正在导出...' : '导出图片'}
        </button>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={onReset} className={`py-2 rounded-xl text-[11px] font-medium transition-colors ${theme === 'dark' ? 'bg-neutral-900 text-neutral-400 hover:text-white' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}>还原</button>
            <button onClick={onClear} className={`py-2 rounded-xl text-[11px] font-medium transition-colors ${theme === 'dark' ? 'bg-neutral-900 text-neutral-500 hover:text-red-500' : 'bg-neutral-50 text-neutral-400 hover:text-red-600'}`}>清空</button>
        </div>
      </div>
    </div>
  );
};

const ImageUploader: React.FC<{ 
  onImagesAdded: (files: FileList | File[]) => void;
  theme: 'dark' | 'light';
}> = ({ onImagesAdded, theme }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);

  const btnPrimary = theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white';
  const btnSecondary = theme === 'dark' ? 'border-white text-white' : 'border-black text-black';

  return (
    <div className="max-w-xs mx-auto w-full z-20 flex flex-col gap-6">
      <button 
        onClick={() => fileInputRef.current?.click()}
        className={`w-full py-5 rounded-2xl text-[18px] font-bold transition-all active:scale-95 flex items-center justify-center ${btnPrimary}`}
      >
        开始上传
      </button>
      <button 
        onClick={() => dirInputRef.current?.click()}
        className={`w-full py-5 rounded-2xl text-[18px] font-bold transition-all active:scale-95 border-2 flex items-center justify-center ${btnSecondary}`}
      >
        导入目录
      </button>

      <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && onImagesAdded(e.target.files)} />
      <input ref={dirInputRef} type="file" {...({ webkitdirectory: "", directory: "", multiple: true } as any)} className="hidden" onChange={(e) => e.target.files && onImagesAdded(e.target.files)} />
    </div>
  );
};

const PreviewCanvas: React.FC<{
  settings: WallSettings;
  images: PosterImage[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;
}> = ({ settings, images, canvasRef, theme, isSidebarOpen }) => {
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      const promises = images.map(img => {
        return new Promise<HTMLImageElement>((resolve) => {
          const i = new Image();
          i.src = img.url;
          i.onload = () => resolve(i);
          i.onerror = () => resolve(null as any);
        });
      });
      const results = (await Promise.all(promises)).filter(i => i !== null);
      if (active) setLoadedImages(results);
    };
    loadAll();
    return () => { active = false; };
  }, [images]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.fillStyle = theme === 'dark' ? '#000000' : '#ffffff';
    ctx.fillRect(0, 0, settings.width, settings.height);

    if (loadedImages.length === 0) return;

    ctx.save();
    ctx.translate(settings.width / 2 + settings.offsetX, settings.height / 2 + settings.offsetY);
    ctx.rotate((settings.angle * Math.PI) / 180);
    ctx.transform(1, 0, settings.skew, 1, 0, 0); 
    ctx.scale(settings.scale, settings.scale * settings.scaleY); 
    
    const cardWidth = 300; 
    const cardHeight = 450; 
    const totalWidth = settings.cols * cardWidth + (settings.cols - 1) * settings.gap;
    const totalHeight = settings.rows * cardHeight + (settings.rows - 1) * settings.gap;

    const startX = -totalWidth / 2;
    const startY = -totalHeight / 2;

    for (let r = 0; r < settings.rows; r++) {
      for (let c = 0; c < settings.cols; c++) {
        const index = (r * settings.cols + c) % loadedImages.length;
        const img = loadedImages[index];
        if (!img) continue;

        const x = startX + c * (cardWidth + settings.gap);
        const y = startY + r * (cardHeight + settings.gap);

        ctx.save();
        const iw = img.width;
        const ih = img.height;
        const aspect = iw / ih;
        const targetAspect = cardWidth / cardHeight;

        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, cardHeight, 4);
        ctx.clip();

        if (settings.fillMode === 'stretch') {
          ctx.drawImage(img, x, y, cardWidth, cardHeight);
        } else if (settings.fillMode === 'contain') {
          let drawW = cardWidth;
          let drawH = cardHeight;
          let dx = x;
          let dy = y;
          if (aspect > targetAspect) {
            drawH = cardWidth / aspect;
            dy = y + (cardHeight - drawH) / 2;
          } else {
            drawW = cardHeight * aspect;
            dx = x + (cardWidth - drawW) / 2;
          }
          ctx.drawImage(img, dx, dy, drawW, drawH);
        } else { // cover
          let sx = 0, sy = 0, sw = iw, sh = ih;
          if (aspect > targetAspect) {
            sw = ih * targetAspect;
            sx = (iw - sw) / 2;
          } else {
            sh = iw / targetAspect;
            sy = (ih - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, x, y, cardWidth, cardHeight);
        }
        
        ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    if (settings.overlayOpacity > 0) {
        ctx.fillStyle = theme === 'dark' ? `rgba(0, 0, 0, ${settings.overlayOpacity})` : `rgba(255, 255, 255, ${settings.overlayOpacity})`;
        ctx.fillRect(0, 0, settings.width, settings.height);
    }

  }, [settings, loadedImages, canvasRef, theme]);

  return (
    <div className={`flex-1 flex items-center justify-center p-8 transition-all duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className={`relative transition-all duration-500 overflow-hidden border ${theme === 'dark' ? 'border-neutral-900' : 'border-neutral-100'}`}>
        <canvas 
          ref={canvasRef} 
          width={settings.width} 
          height={settings.height} 
          style={{ 
            maxWidth: isSidebarOpen ? 'calc(100vw - 420px)' : '92vw', 
            maxHeight: '88vh', 
            width: 'auto', 
            height: 'auto',
            aspectRatio: `${settings.width}/${settings.height}`
          }}
        />
      </div>
    </div>
  );
};

export default function App() {
  const [images, setImages] = useState<PosterImage[]>([]);
  const [settings, setSettings] = useState<WallSettings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appendFileRef = useRef<HTMLInputElement>(null);

  const handleImagesAdded = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    const newImages: PosterImage[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file
    }));
    setImages(prev => [...prev, ...newImages]);
    if (images.length === 0) setTimeout(() => setIsSidebarOpen(true), 300);
  }, [images.length]);

  const handleClear = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setIsSidebarOpen(false);
  }, [images]);

  const handleReset = useCallback(() => {
    setSettings(prev => ({ ...DEFAULT_SETTINGS, width: prev.width, height: prev.height }));
  }, []);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const link = document.createElement('a');
        link.download = `${generateRandomFilename()}.png`;
        link.href = canvasRef.current!.toDataURL('image/png', 0.98);
        link.click();
      } catch (e) {
        console.error("Download failed", e);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  }, []);

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 font-sans ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      <Sidebar 
        settings={settings} setSettings={setSettings} onDownload={handleDownload} onClear={handleClear}
        onReset={handleReset} isGenerating={isGenerating} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} theme={theme}
      />
      
      <main className={`flex-1 flex flex-col relative transition-all duration-500 ${isSidebarOpen ? 'pl-80' : ''}`}>
        {images.length > 0 ? (
          <PreviewCanvas settings={settings} images={images} canvasRef={canvasRef} theme={theme} isSidebarOpen={isSidebarOpen} />
        ) : (
          <div className={`flex-1 flex items-center justify-center relative overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
            <ImageUploader onImagesAdded={handleImagesAdded} theme={theme} />
          </div>
        )}

        <div className="fixed right-8 bottom-8 flex flex-col gap-4 z-40 items-center">
            {images.length > 0 && !isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${theme === 'dark' ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-white text-black border-neutral-200 shadow-sm'}`} 
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </button>
            )}

            <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${theme === 'dark' ? 'bg-white text-black border-neutral-200' : 'bg-black text-white border-neutral-800'}`}
            >
                {theme === 'dark' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                )}
            </button>

            {images.length > 0 && (
                <button 
                  onClick={() => appendFileRef.current?.click()} 
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${theme === 'dark' ? 'bg-white text-black border-neutral-200' : 'bg-black text-white border-neutral-800'}`} 
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                    <input ref={appendFileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImagesAdded(e.target.files)} />
                </button>
            )}
        </div>
      </main>
    </div>
  );
}
