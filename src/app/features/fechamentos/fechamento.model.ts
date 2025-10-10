export interface ItemFechamentoDTO {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface FechamentoResumoDTO {
  id: number;
  clienteNome: string;
  usuario: string;
  dataHora: string;   // ISO
  total: number;
}

export interface FechamentoResponseDTO extends FechamentoResumoDTO {
  clienteId: number;
  itens: ItemFechamentoDTO[];
}
