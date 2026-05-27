export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
  maxBytes?: number;
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxDimension: 1280,
  quality: 0.8,
  mimeType: 'image/jpeg',
  // Vercel Functions tem hard limit de 4.5MB no body; mantemos margem
  // pra acomodar o resto do payload JSON (campos + base64 overhead ~33%).
  maxBytes: 3.5 * 1024 * 1024
};

export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo selecionado não é uma imagem válida.');
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);

  const { width, height } = scaleDimensions(
    image.naturalWidth,
    image.naturalHeight,
    opts.maxDimension
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível processar a imagem neste navegador.');
  }
  ctx.drawImage(image, 0, 0, width, height);

  const compressed = canvas.toDataURL(opts.mimeType, opts.quality);

  if (estimateDataUrlBytes(compressed) > opts.maxBytes) {
    throw new Error(
      'Imagem muito grande mesmo após compressão. Escolha uma imagem menor.'
    );
  }

  return compressed;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error('Não foi possível ler o arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Não foi possível decodificar a imagem.'));
    img.src = src;
  });
}

function scaleDimensions(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const ratio = width > height ? maxDimension / width : maxDimension / height;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
}

function estimateDataUrlBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return dataUrl.length;
  const base64 = dataUrl.slice(commaIndex + 1);
  // base64 -> bytes: 3/4 do length, descontando padding
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}
