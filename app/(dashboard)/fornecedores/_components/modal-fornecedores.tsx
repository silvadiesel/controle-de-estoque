import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Fornecedor } from '@/db/schema';

export const modalFornecedores = ({
  data,
  setData
}: {
  data: Partial<Fornecedor>;
  setData: (data: Partial<Fornecedor>) => void;
}) => (
  <div className='grid gap-4 py-4'>
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label>Nome / Razão Social *</Label>
        <Input
          value={data.name_empresa || ''}
          onChange={(e) => setData({ ...data, name_empresa: e.target.value })}
          placeholder='AutoPeças Brasil'
          className='bg-input border-border'
        />
      </div>
      <div className='space-y-2'>
        <Label>CNPJ *</Label>
        <Input
          value={data.cnpj || ''}
          onChange={(e) => setData({ ...data, cnpj: e.target.value })}
          placeholder='00.000.000/0001-00'
          className='bg-input border-border'
        />
      </div>
    </div>
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label>Telefone</Label>
        <Input
          value={data.telefone || ''}
          onChange={(e) => setData({ ...data, telefone: e.target.value })}
          placeholder='(11) 3333-4444'
          className='bg-input border-border'
        />
      </div>
      <div className='space-y-2'>
        <Label>Email</Label>
        <Input
          value={data.email || ''}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          placeholder='vendas@fornecedor.com'
          className='bg-input border-border'
        />
      </div>
    </div>
  </div>
);
