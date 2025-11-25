// --- 1. USUÁRIOS (Funcionários e Clientes) ---
export interface User {
  idUser: number;
  name: string;
  email: string;
  type: 'dono' | 'gerente' | 'garcom' | 'cozinha' | 'client';
  active?: boolean;
  lastLogin?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  message: string;
}

// --- 2. MESAS (Desks) ---
export interface Desk {
  idDesk: number;
  deskNumber: number;
  capacity: number;
  condition: 'livre' | 'ocupada' | 'reservada' | 'manutencao';
  qrCodeUid?: string;
  qr_code_image?: string; // O backend retorna isso ao criar (Base64)
}

// --- 3. CARDÁPIO (Menu) ---
export interface MenuItem {
  idItem: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;           // Visível apenas para Admin
  timePreparation?: number;
  emphasis?: boolean;
  active: boolean;
  imagePath?: string;
  options?: any;           // JSON de personalização (adicionais, etc.)
  category?: string;
}

// --- 4. CARRINHO (Front-end only) ---
// Estende o MenuItem para adicionar quantidade e obs
export interface CartItem extends MenuItem {
  amount: number;
  observation?: string;
  custom?: any;            // As escolhas do cliente (ex: { "Ponto": "Bem Passado" })
}

// --- 5. PEDIDOS (Orders) ---
export interface OrderItem {
  idOrderItem?: number;
  name: string;            // O nome vem do JOIN no backend
  amount: number;
  unitPrice: number;
  observation?: string;
  custom?: any;
}

export interface Order {
  idOrder: number;
  idClient?: number;
  idDesk?: number;
  deskNumber: number;      // Vem do JOIN no backend (importante para a Cozinha)
  status: 'recebido' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';
  total: number;
  timeDate: string;
  observation?: string;
  items?: OrderItem[];     // Lista de itens (vem no getOrderDetails)
}