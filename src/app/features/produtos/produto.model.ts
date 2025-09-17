export interface ProdutoRequestDTO {
  nome: string;
  precoVenda: number; // em reais, p.ex. 12.34
  ativo: boolean;
}

export interface ProdutoResponseDTO {
  id: number;
  nome: string;
  precoVenda: number;
  ativo: boolean;
}
