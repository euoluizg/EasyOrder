export interface MenuItem {
  idItem: number;
  name: string;
  description: string;
  price: number;
  active: boolean;
  imagePath?: string;
  options?: any;
}

export interface CartItem extends MenuItem {
  amount: number;
  observation?: string;
}

export interface AuthResponse {
  access_token: string;
  message: string;
  // Se tiver refresh token, adicione aqui
}