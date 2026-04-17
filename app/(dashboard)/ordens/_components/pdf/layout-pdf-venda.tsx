import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from '@react-pdf/renderer';

const BLACK = '#000000';
const GRAY = '#555555';
const LIGHT_GRAY = '#999999';
const BORDER = '#000000';
const BORDER_LIGHT = '#cccccc';

const METODO_PAGAMENTO_LABELS: Record<string, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  cheque: 'Cheque',
  debito: 'Debito',
  credito: 'Credito',
  dinheiro: 'Dinheiro'
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: BLACK
  },
  via: {
    height: '49%',
    padding: '12px 20px',
    position: 'relative'
  },
  viaLabel: {
    position: 'absolute',
    bottom: 4,
    right: 10,
    fontSize: 6,
    color: LIGHT_GRAY,
    fontStyle: 'italic'
  },
  cutLine: {
    height: '2%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  cutDashes: {
    flex: 1,
    borderTop: `1px dashed ${LIGHT_GRAY}`
  },
  cutText: {
    fontSize: 7,
    color: LIGHT_GRAY,
    marginHorizontal: 6
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingBottom: 5,
    borderBottom: `1.5px solid ${BORDER}`
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logo: {
    width: 56,
    height: 26
  },
  companyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold'
  },
  companyDetail: {
    fontSize: 6.5,
    color: GRAY,
    marginTop: 1
  },
  headerRight: {
    textAlign: 'right'
  },
  orderTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold'
  },
  orderField: {
    fontSize: 8,
    marginTop: 1
  },
  sectionTitle: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: `0.75px solid ${BORDER}`,
    paddingBottom: 1,
    marginBottom: 2,
    marginTop: 5
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    fontSize: 7.5,
    lineHeight: 1.5
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    color: '#333333'
  },
  tableTitle: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: `0.75px solid ${BORDER}`,
    paddingBottom: 1,
    marginBottom: 2,
    marginTop: 5
  },
  tableHead: {
    flexDirection: 'row',
    borderBottom: `0.75px solid #333333`,
    paddingBottom: 2,
    marginBottom: 1
  },
  tableHeadText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `0.5px solid ${BORDER_LIGHT}`,
    paddingVertical: 2
  },
  tableCell: {
    fontSize: 7
  },
  colItem: { width: '7%' },
  colDesc: { width: '43%' },
  colQtd: { width: '8%', textAlign: 'center' },
  colUnit: { width: '21%', textAlign: 'right' },
  colSub: { width: '21%', textAlign: 'right' },
  totalRow: {
    textAlign: 'right',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingTop: 2
  },
  obs: {
    fontSize: 7,
    marginTop: 4
  },
  obsLabel: {
    fontFamily: 'Helvetica-Bold'
  },
  valorTotalBox: {
    alignSelf: 'flex-end',
    border: `1.5px solid ${BORDER}`,
    padding: '3px 8px',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
    marginTop: 5
  },
  vtLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold'
  },
  vtValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold'
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 'auto'
  },
  sigBlock: {
    alignItems: 'center',
    width: '40%'
  },
  sigLine: {
    borderBottom: `0.75px solid ${BORDER}`,
    width: '100%',
    marginBottom: 2,
    height: 14
  },
  sigLabel: {
    fontSize: 7,
    color: GRAY
  },
  footer: {
    textAlign: 'center',
    fontSize: 5.5,
    color: LIGHT_GRAY,
    borderTop: `0.5px solid ${BORDER_LIGHT}`,
    paddingTop: 2,
    marginTop: 4
  }
});

function formatCurrency(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

interface PecaItem {
  id: number;
  quantidade: number;
  peca: {
    name_peca: string;
    codigo: string;
    preco: number;
  } | null;
}

interface OrdemVendaData {
  id: number;
  data_criacao: string;
  data_pagamento: string | null;
  data_previsao_pagamento: string | null;
  status: string;
  observacao: string | null;
  valor_total: number;
  metodo_pagamento: string | null;
  cliente: {
    name_cliente: string;
    nome_empresa: string;
    cnpj: string;
    cpf: string;
    telefone: string;
  } | null;
  pecas: PecaItem[];
}

interface EmpresaData {
  nomeFantasia: string;
  cnpj: string;
  cidade: string;
  estado: string;
}

interface Props {
  ordem: OrdemVendaData;
  empresa: EmpresaData;
  logoUrl: string;
}

function Via({ ordem, empresa, logoUrl }: Props) {
  const cliente = ordem.cliente;
  const totalPecas = ordem.pecas.reduce(
    (acc, item) => acc + (item.peca?.preco ?? 0) * item.quantidade,
    0
  );

  return (
    <View style={styles.via}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: logoUrl }} style={styles.logo} />
          <View>
            <Text style={styles.companyName}>SILVA DIESEL</Text>
            <Text style={styles.companyDetail}>Injecao Eletronica</Text>
            <Text style={styles.companyDetail}>
              Tel: (55) 3744-3611 | CNPJ: {empresa.cnpj}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.orderTitle}>ORDEM DE VENDA</Text>
          <Text style={styles.orderField}>No: {ordem.id}</Text>
          <Text style={styles.orderField}>
            Data: {formatDate(ordem.data_criacao)}
          </Text>
        </View>
      </View>

      {/* Dados do Cliente */}
      <Text style={styles.sectionTitle}>Dados do Cliente</Text>
      <View style={styles.infoRow}>
        <Text>
          <Text style={styles.label}>Cliente: </Text>
          {cliente?.nome_empresa || cliente?.name_cliente || '-'}
        </Text>
        <Text>
          <Text style={styles.label}>CPF/CNPJ: </Text>
          {cliente?.cnpj || cliente?.cpf || '-'}
        </Text>
        <Text>
          <Text style={styles.label}>Tel: </Text>
          {cliente?.telefone || '-'}
        </Text>
      </View>

      {/* Pagamento */}
      <Text style={styles.sectionTitle}>Pagamento</Text>
      <View style={styles.infoRow}>
        <Text>
          <Text style={styles.label}>Metodo: </Text>
          {ordem.metodo_pagamento
            ? METODO_PAGAMENTO_LABELS[ordem.metodo_pagamento] ||
              ordem.metodo_pagamento
            : '-'}
        </Text>
        <Text>
          <Text style={styles.label}>Data Pagamento: </Text>
          {formatDate(ordem.data_pagamento)}
        </Text>
        <Text>
          <Text style={styles.label}>Previsao: </Text>
          {formatDate(ordem.data_previsao_pagamento)}
        </Text>
      </View>

      {/* Pecas e Materiais */}
      <Text style={styles.tableTitle}>Pecas e Materiais</Text>
      <View style={styles.tableHead}>
        <Text style={[styles.tableHeadText, styles.colItem]}>Item</Text>
        <Text style={[styles.tableHeadText, styles.colDesc]}>Descricao</Text>
        <Text style={[styles.tableHeadText, styles.colQtd]}>Qtd</Text>
        <Text style={[styles.tableHeadText, styles.colUnit]}>Valor Unit.</Text>
        <Text style={[styles.tableHeadText, styles.colSub]}>Subtotal</Text>
      </View>
      {ordem.pecas.map((item, index) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.colItem]}>
            {String(index + 1).padStart(2, '0')}
          </Text>
          <Text style={[styles.tableCell, styles.colDesc]}>
            {item.peca?.name_peca || '-'}
          </Text>
          <Text style={[styles.tableCell, styles.colQtd]}>
            {item.quantidade}
          </Text>
          <Text style={[styles.tableCell, styles.colUnit]}>
            {formatCurrency(item.peca?.preco ?? 0)}
          </Text>
          <Text style={[styles.tableCell, styles.colSub]}>
            {formatCurrency((item.peca?.preco ?? 0) * item.quantidade)}
          </Text>
        </View>
      ))}
      <Text style={styles.totalRow}>
        Total Pecas: {formatCurrency(totalPecas)}
      </Text>

      {/* Observacao */}
      {ordem.observacao && (
        <Text style={styles.obs}>
          <Text style={styles.obsLabel}>Obs: </Text>
          {ordem.observacao}
        </Text>
      )}

      {/* Valor Total */}
      <View style={styles.valorTotalBox}>
        <Text style={styles.vtLabel}>VALOR TOTAL</Text>
        <Text style={styles.vtValue}>{formatCurrency(ordem.valor_total)}</Text>
      </View>

      {/* Assinaturas */}
      <View style={styles.signaturesRow}>
        <View style={styles.sigBlock}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>Responsavel</Text>
        </View>
        <View style={styles.sigBlock}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>Cliente</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        {empresa.nomeFantasia} - Injecao Eletronica | Tel: (55) 3744-3611 |
        CNPJ: {empresa.cnpj}
      </Text>
    </View>
  );
}

export function LayoutPdfVenda({ ordem, empresa, logoUrl }: Props) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <Via ordem={ordem} empresa={empresa} logoUrl={logoUrl} />

        {/* Linha de recorte */}
        <View style={styles.cutLine}>
          <View style={styles.cutDashes} />
          <Text style={styles.cutText}>&#9986; recorte</Text>
          <View style={styles.cutDashes} />
        </View>

        <Via ordem={ordem} empresa={empresa} logoUrl={logoUrl} />
      </Page>
    </Document>
  );
}
