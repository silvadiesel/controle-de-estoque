import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  location: string;
  supplier: string;
  lastUpdated: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'saida';
  quantity: number;
  date: Date;
  reason: string;
  user: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  document: string; // CPF ou CNPJ
  phone: string;
  email: string;
  address: string;
  vehiclePlate: string;
  vehicleModel: string;
  notes: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  contact: string;
  notes: string;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  type: 'servico' | 'venda';
  clientId: string;
  clientName: string;
  vehiclePlate: string;
  vehicleModel: string;
  items: OrderItem[];
  laborCost: number;
  description: string;
  status: 'aberta' | 'em_andamento' | 'finalizada' | 'cancelada';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StockStore {
  products: Product[];
  movements: StockMovement[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addMovement: (movement: Omit<StockMovement, 'id' | 'date'>) => void;
  getProductById: (id: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addOrder: (
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'total'>
  ) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  finalizeOrder: (id: string) => void;
}

export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
      products: [
        {
          id: '1',
          name: 'Filtro de Óleo',
          code: 'FO-001',
          category: 'Filtros',
          quantity: 45,
          minQuantity: 10,
          price: 89.9,
          location: 'Prateleira A1',
          supplier: 'AutoPeças Brasil',
          lastUpdated: new Date()
        },
        {
          id: '2',
          name: 'Pastilha de Freio',
          code: 'PF-002',
          category: 'Freios',
          quantity: 8,
          minQuantity: 15,
          price: 245.0,
          location: 'Prateleira B2',
          supplier: 'Freios Premium',
          lastUpdated: new Date()
        },
        {
          id: '3',
          name: 'Correia Dentada',
          code: 'CD-003',
          category: 'Motor',
          quantity: 22,
          minQuantity: 5,
          price: 189.9,
          location: 'Prateleira C3',
          supplier: 'MotorParts',
          lastUpdated: new Date()
        },
        {
          id: '4',
          name: 'Amortecedor Dianteiro',
          code: 'AD-004',
          category: 'Suspensão',
          quantity: 3,
          minQuantity: 8,
          price: 450.0,
          location: 'Prateleira D1',
          supplier: 'Suspensão Total',
          lastUpdated: new Date()
        },
        {
          id: '5',
          name: 'Óleo Motor 15W40',
          code: 'OM-005',
          category: 'Lubrificantes',
          quantity: 120,
          minQuantity: 30,
          price: 32.9,
          location: 'Prateleira E1',
          supplier: 'Lubrax',
          lastUpdated: new Date()
        },
        {
          id: '6',
          name: 'Bateria 150Ah',
          code: 'BT-006',
          category: 'Elétrica',
          quantity: 6,
          minQuantity: 4,
          price: 890.0,
          location: 'Prateleira F1',
          supplier: 'Baterias do Brasil',
          lastUpdated: new Date()
        },
        {
          id: '7',
          name: 'Embreagem Completa',
          code: 'EC-007',
          category: 'Transmissão',
          quantity: 2,
          minQuantity: 3,
          price: 1250.0,
          location: 'Prateleira G1',
          supplier: 'TransParts',
          lastUpdated: new Date()
        },
        {
          id: '8',
          name: 'Radiador',
          code: 'RD-008',
          category: 'Arrefecimento',
          quantity: 4,
          minQuantity: 2,
          price: 780.0,
          location: 'Prateleira H1',
          supplier: 'Cooling Parts',
          lastUpdated: new Date()
        }
      ],
      movements: [
        {
          id: '1',
          productId: '1',
          productName: 'Filtro de Óleo',
          type: 'saida',
          quantity: 5,
          date: new Date(Date.now() - 86400000),
          reason: 'Manutenção preventiva - Caminhão ABC-1234',
          user: 'João Silva'
        },
        {
          id: '2',
          productId: '5',
          productName: 'Óleo Motor 15W40',
          type: 'entrada',
          quantity: 50,
          date: new Date(Date.now() - 172800000),
          reason: 'Reposição de estoque',
          user: 'Maria Santos'
        },
        {
          id: '3',
          productId: '2',
          productName: 'Pastilha de Freio',
          type: 'saida',
          quantity: 4,
          date: new Date(Date.now() - 259200000),
          reason: 'Troca de freios - Caminhão XYZ-5678',
          user: 'Carlos Lima'
        }
      ],
      categories: [
        {
          id: '1',
          name: 'Filtros',
          description: 'Filtros de óleo, ar, combustível'
        },
        { id: '2', name: 'Freios', description: 'Pastilhas, discos, lonas' },
        { id: '3', name: 'Motor', description: 'Peças internas do motor' },
        {
          id: '4',
          name: 'Suspensão',
          description: 'Amortecedores, molas, buchas'
        },
        { id: '5', name: 'Lubrificantes', description: 'Óleos e graxas' },
        {
          id: '6',
          name: 'Elétrica',
          description: 'Baterias, alternadores, motores de partida'
        },
        {
          id: '7',
          name: 'Transmissão',
          description: 'Embreagem, caixa de câmbio'
        },
        {
          id: '8',
          name: 'Arrefecimento',
          description: "Radiadores, mangueiras, bombas d'água"
        }
      ],
      clients: [
        {
          id: '1',
          name: 'Transportadora Silva',
          document: '12.345.678/0001-90',
          phone: '(11) 99999-1234',
          email: 'contato@transsilva.com.br',
          address: 'Rua das Indústrias, 500',
          vehiclePlate: 'ABC-1234',
          vehicleModel: 'Scania R450',
          notes: 'Cliente desde 2020',
          createdAt: new Date()
        },
        {
          id: '2',
          name: 'Logística Express',
          document: '98.765.432/0001-10',
          phone: '(11) 98888-5678',
          email: 'frota@logexpress.com.br',
          address: 'Av. Brasil, 1000',
          vehiclePlate: 'XYZ-5678',
          vehicleModel: 'Volvo FH 540',
          notes: 'Contrato mensal de manutenção',
          createdAt: new Date()
        }
      ],
      suppliers: [
        {
          id: '1',
          name: 'AutoPeças Brasil',
          cnpj: '11.222.333/0001-44',
          phone: '(11) 3333-4444',
          email: 'vendas@autopecasbrasil.com.br',
          address: 'Rua dos Fornecedores, 100',
          contact: 'Carlos',
          notes: 'Entrega em 2 dias úteis',
          createdAt: new Date()
        },
        {
          id: '2',
          name: 'Freios Premium',
          cnpj: '44.555.666/0001-77',
          phone: '(11) 5555-6666',
          email: 'comercial@freiospremium.com.br',
          address: 'Av. Industrial, 200',
          contact: 'Maria',
          notes: 'Especialista em freios de caminhões',
          createdAt: new Date()
        }
      ],
      orders: [
        {
          id: '1',
          type: 'servico',
          clientId: '1',
          clientName: 'Transportadora Silva',
          vehiclePlate: 'ABC-1234',
          vehicleModel: 'Scania R450',
          items: [
            {
              productId: '1',
              productName: 'Filtro de Óleo',
              quantity: 2,
              unitPrice: 89.9
            },
            {
              productId: '5',
              productName: 'Óleo Motor 15W40',
              quantity: 10,
              unitPrice: 32.9
            }
          ],
          laborCost: 350,
          description: 'Troca de óleo e filtros - revisão 50.000km',
          status: 'em_andamento',
          total: 858.8,
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date()
        }
      ],
      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              ...product,
              id: crypto.randomUUID(),
              lastUpdated: new Date()
            }
          ]
        })),
      updateProduct: (id, updatedProduct) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, ...updatedProduct, lastUpdated: new Date() }
              : p
          )
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        })),
      addMovement: (movement) =>
        set((state) => {
          const product = state.products.find(
            (p) => p.id === movement.productId
          );
          if (!product) return state;

          const newQuantity =
            movement.type === 'entrada'
              ? product.quantity + movement.quantity
              : product.quantity - movement.quantity;

          return {
            movements: [
              {
                ...movement,
                id: crypto.randomUUID(),
                date: new Date()
              },
              ...state.movements
            ],
            products: state.products.map((p) =>
              p.id === movement.productId
                ? {
                    ...p,
                    quantity: Math.max(0, newQuantity),
                    lastUpdated: new Date()
                  }
                : p
            )
          };
        }),
      getProductById: (id) => get().products.find((p) => p.id === id),
      getLowStockProducts: () =>
        get().products.filter((p) => p.quantity <= p.minQuantity),
      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: crypto.randomUUID() }
          ]
        })),
      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          )
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
        })),
      addClient: (client) =>
        set((state) => ({
          clients: [
            ...state.clients,
            { ...client, id: crypto.randomUUID(), createdAt: new Date() }
          ]
        })),
      updateClient: (id, client) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...client } : c
          )
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id)
        })),
      addSupplier: (supplier) =>
        set((state) => ({
          suppliers: [
            ...state.suppliers,
            { ...supplier, id: crypto.randomUUID(), createdAt: new Date() }
          ]
        })),
      updateSupplier: (id, supplier) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === id ? { ...s, ...supplier } : s
          )
        })),
      deleteSupplier: (id) =>
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id)
        })),
      addOrder: (order) =>
        set((state) => {
          const itemsTotal = order.items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
          );
          const total = itemsTotal + (order.laborCost || 0);
          return {
            orders: [
              ...state.orders,
              {
                ...order,
                id: crypto.randomUUID(),
                total,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          };
        }),
      updateOrder: (id, order) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== id) return o;
            const updated = { ...o, ...order, updatedAt: new Date() };
            if (order.items || order.laborCost !== undefined) {
              const items = order.items || o.items;
              const labor =
                order.laborCost !== undefined ? order.laborCost : o.laborCost;
              updated.total =
                items.reduce(
                  (sum, item) => sum + item.quantity * item.unitPrice,
                  0
                ) + labor;
            }
            return updated;
          })
        })),
      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id)
        })),
      finalizeOrder: (id) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === id);
          if (!order || order.status === 'finalizada') return state;

          // Baixar estoque dos itens
          const updatedProducts = state.products.map((product) => {
            const orderItem = order.items.find(
              (item) => item.productId === product.id
            );
            if (orderItem) {
              return {
                ...product,
                quantity: Math.max(0, product.quantity - orderItem.quantity),
                lastUpdated: new Date()
              };
            }
            return product;
          });

          // Criar movimentações de saída
          const newMovements = order.items.map((item) => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            productName: item.productName,
            type: 'saida' as const,
            quantity: item.quantity,
            date: new Date(),
            reason: `${order.type === 'servico' ? 'Ordem de Serviço' : 'Ordem de Venda'} #${order.id.slice(0, 8)} - ${order.clientName}`,
            user: 'Sistema'
          }));

          return {
            orders: state.orders.map((o) =>
              o.id === id
                ? { ...o, status: 'finalizada' as const, updatedAt: new Date() }
                : o
            ),
            products: updatedProducts,
            movements: [...newMovements, ...state.movements]
          };
        })
    }),
    {
      name: 'stock-storage'
    }
  )
);

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operador';
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (user: Omit<User, 'id' | 'createdAt'>, password: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: [
        {
          id: '1',
          name: 'Administrador',
          email: 'admin@oficina.com',
          role: 'admin',
          createdAt: new Date()
        }
      ],
      login: (email: string, password: string) => {
        // Senha padrão para demo: "123456"
        const users = get().users;
        const user = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (user && password === '123456') {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      register: (userData, password) => {
        if (password.length < 6) return false;
        const users = get().users;
        if (
          users.some(
            (u) => u.email.toLowerCase() === userData.email.toLowerCase()
          )
        ) {
          return false;
        }
        const newUser: User = {
          ...userData,
          id: crypto.randomUUID(),
          createdAt: new Date()
        };
        set((state) => ({
          users: [...state.users, newUser]
        }));
        return true;
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
