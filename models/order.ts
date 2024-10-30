import { prisma } from "../lib/prisma";
import { OrderStatus } from "@prisma/client";
import { getApiKey } from "./apikey";
import { customAlphabet } from 'nanoid';


const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 8);

export enum EOrderStatus {
  BACKLOG = "BACKLOG",
  ANDAMENTO = "ANDAMENTO",
  ENTREGA = "ENTREGA",
  CONCLUIDO = "CONCLUIDO",
};
interface IOrderItem {
  
  productId: string;
  quantidade: number;
}

export interface IOrder {
  id?: string;
  nome: string;
  orderItems: IOrderItem[];
  status: OrderStatus;
  horario: Date;
  entregador: string;
  valor: number;
  rua: string;
  numero: string;
  complemento: string;
  cep: string;
  cidade: string;
  estado: string;
  tel: string;
  metodo_pag: string;
  instrucoes: string;
  createdBy: string;
  teamId: string;
  userId: string;
};




export async function createOrderByApiKey(order: IOrder, apiKey: string) {
  const apiKeyData = await getApiKey(apiKey);

  if (!apiKeyData) {
    throw new Error("Chave de API inválida!");
  }

  const teamName = await getTeamNameById(apiKeyData.teamId);

  if (!teamName) {
    throw new Error("Não foi possível encontrar o nome do time.");
  }

  const generatedOrderId = await generateOrderId(teamName);

  return await prisma.order.create({
    data: {
      ...order,
      id: generatedOrderId,
      status: order.status || 'BACKLOG',
      orderItems: {
        create: order.orderItems.map((item: IOrderItem) => ({
          inventoryProduct: {
            connect: { id: item.productId },
          },
          quantidade: item.quantidade,
        })),
      },
    },
  });
}

// Função para criar um pediddfdfo usando o Team ID
export async function createOrder(order: IOrder, teamId: string) {
  const teamName = await getTeamNameById(teamId);

  if (!teamName) {
    throw new Error("Não foi possível encontrar o nome do time.");
  }

  const generatedOrderId = await generateOrderId(teamName);

  return await prisma.order.create({
    data: {
      ...order,
      id: generatedOrderId,
      status: order.status || 'BACKLOG',
      orderItems: {
        create: order.orderItems.map((item: IOrderItem) => ({
          inventoryProduct: {
            connect: { id: item.productId },
          },
          quantidade: item.quantidade,
        })),
      },
    },
  });
}

export async function getTeamNameById(teamId?: string) {
  const team = await prisma.team.findUnique({ 
    where: { id: teamId },
    select: { name: true }, // Seleciona apenas o nome do time
  });

  return team ? team.name : null; 
}

function generateOrderId(teamName: string): string {
  const sanitizedTeamName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '-'); 
  const randomString = nanoid();
  return `${sanitizedTeamName}-${randomString}`;
}

export async function deleteOrder(orderId: string) {  
  return await prisma.order.delete({  
      where: { id: orderId }  
  })  
}  

export const orderSelects = {
  id: true,
  nome: true,
  orderItems: {
    select: {
      id: true,
      quantidade: true,
      // Correção: Selecionando 'inventoryProduct'
      inventoryProduct: { 
        select: {
          id: true,
          name: true, 
          // ... outras propriedades de InventoryProduct que você precisa
        },
      }, 
    },
  },
  status: true,
  entregador: true,
  motivo_cancelamento: true,
  rua: true,
  valor: true,
  numero: true,
  complemento: true,
  cep: true,
  cidade: true,
  estado: true,
  tel: true,
  metodo_pag: true,
  instrucoes: true,
  createdBy: true,
  createdAt: true,
};
export async function getOrders(teamId: string) {
  return await prisma.order.findMany({
    where: { teamId: teamId },
    select: orderSelects
  })
}




export async function getNotFinishedOrders(teamId: string) {
  return await prisma.order.findMany({
    where: {
      teamId: teamId,
      status: {
        notIn: ["CONCLUIDO", "CANCELADO"],
      }
    },
    select: orderSelects
  })
}

export async function getFinishedOrders(teamId: string) {
  return await prisma.order.findMany({
    where: {
      teamId: teamId,
      status: {
        in: ["CONCLUIDO", "CANCELADO"],
      }
    },
    select: orderSelects
  })
}

export async function getUniqueOrder(id: string, teamId: string) {
  return await prisma.order.findFirst({
    where: { id: id, teamId: teamId },
    select: orderSelects
  });
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    select: orderSelects
  });
}  