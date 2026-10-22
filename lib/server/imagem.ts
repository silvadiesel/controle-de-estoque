const IMAGEM_DATA_URL = /^data:image\/(jpeg|png|webp);base64,/;
const IMAGEM_MAX_LENGTH = 5_000_000;

export function isImagemValida(valor: unknown): valor is string | null {
  if (valor === null || valor === undefined) return true;
  return (
    typeof valor === 'string' &&
    valor.length <= IMAGEM_MAX_LENGTH &&
    IMAGEM_DATA_URL.test(valor)
  );
}
