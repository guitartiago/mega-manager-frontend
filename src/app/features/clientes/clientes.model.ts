export type Perfil = 'COMUM' | 'SOCIO' | 'PARCEIRO';

export interface ClienteRequestDTO {
  nome: string;
  email: string;
  celular: string;
  perfil: Perfil;
}

export interface ClienteResponseDTO {
  id: number;
  nome: string;
  email: string;
  celular: string;
  perfil: Perfil;
}
