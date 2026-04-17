'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
);

import { LayoutPdfServico } from '@/app/(dashboard)/ordens/_components/pdf/layout-pdf-servico';
import { LayoutPdfVenda } from '@/app/(dashboard)/ordens/_components/pdf/layout-pdf-venda';

interface PdfData {
  tipo: 'servico' | 'venda';
  ordem: any;
  empresa: any;
}

export default function PdfPreviewPage() {
  const params = useParams<{ tipo: string; id: string }>();
  const [data, setData] = useState<PdfData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/ordens/pdf/${params.tipo}/${params.id}`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Erro ao carregar dados');
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.tipo, params.id]);

  const logoUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/img/silva_diesel_logo.png`
      : '/img/silva_diesel_logo.png';

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: 16,
          color: '#666'
        }}
      >
        Carregando PDF...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: 16,
          color: '#ef4444'
        }}
      >
        {error || 'Dados não encontrados'}
      </div>
    );
  }

  return (
    <PDFViewer
      style={{ width: '100%', height: '100vh', border: 'none' }}
    >
      {data.tipo === 'servico' ? (
        <LayoutPdfServico
          ordem={data.ordem}
          empresa={data.empresa}
          logoUrl={logoUrl}
        />
      ) : (
        <LayoutPdfVenda
          ordem={data.ordem}
          empresa={data.empresa}
          logoUrl={logoUrl}
        />
      )}
    </PDFViewer>
  );
}
