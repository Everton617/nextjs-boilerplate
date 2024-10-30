import { getApiKey } from './../../../models/apikey';
import { PrismaClient } from '@prisma/client'
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next'
import { IOrder,createOrderByApiKey } from '../../../models/order';
import {validateWithSchema } from "../../../lib/zod/index";


import {
  orderCep,
  orderComplemento,
  orderEntregador,
  orderInstrucoes,
  orderMetodoPag,
  orderNumeroRua,
  orderItems,
  orderStatus,
  orderTel,
  orderName,
  orderValor
} from "../../../lib/zod/order.primitives";


const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { apiKey } = req.query;

  try {
    switch (req.method) {
      case "GET":
        if (!apiKey || typeof apiKey !== "string") {
          return res.status(400).json({
            error: { message: "apiKey is required and must be a string" },
          });
        }
        await handleGET(req, res, apiKey);
        break;
      case "POST":
        if (!apiKey || typeof apiKey !== "string") {
          return res.status(400).json({
            error: { message: "apiKey is required and must be a string" },
          });
        }
        await handlePOST(req, res, apiKey);
        break;
      default:
        res.setHeader("Allow", "GET, POST, DELETE, PATCH");
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: unknown) {
    const message = typeof error === 'string' ? error : 'Something went wrong';
    const status = error instanceof Error && typeof error === 'number' ? error : 500;
    res.status(status).json({ error: { message } });
  }
}

async function handleGET(
    req: NextApiRequest,
    res: NextApiResponse,
    apiKey: string
  ) {
    try {
      const apiKeyData = await getApiKey(apiKey); 
  
      if (!apiKeyData) {
        return res.status(401).json({ error: { message: "Invalid API key" } });
      }
  
      const { teamId } = apiKeyData;
  
      const orders = await prisma.order.findMany({
        where: { teamId },
        include: {
          orderItems: {
            include: { inventoryProduct: true },
          },
        },
      });
  
      res.status(200).json(orders);
    } catch (error) {
      console.log(error)
    }
  }

  async function validateCEPExistence(cep: string) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    return {
        rua: data.logradouro,
        cidade: data.localidade,
        estado: data.uf
    };
}

export const createOrderSchema = z.object({
  nome: orderName,
  valor: orderValor,
  orderItems: orderItems,
  status: orderStatus,
  entregador: orderEntregador,
  numero: orderNumeroRua,
  complemento: orderComplemento,
  cep: orderCep,
  tel: orderTel,
  metodo_pag: orderMetodoPag,
  instrucoes: orderInstrucoes,
});


async function handlePOST(
  req: NextApiRequest,
  res: NextApiResponse,
  apiKey: string 
) {
  try {
    if (!req.body.order) throw new Error("Order not provided");

    const apiKeyData = await getApiKey(apiKey);

    if (!apiKeyData) {
      return res.status(401).json({ error: { message: "Invalid API key" } });
    }

    const { teamId } = apiKeyData;

    // ObteuserId usando teamId (ajuste o modelo/relacionamento conforme necessário)
    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId },
      select: { userId: true }, // Seleciona apenas o userId
    });

    if (!teamMember) {
      return res.status(404).json({ error: { message: "User not found in this team" } });
    }

    const userId = teamMember.userId;

    const reqOrder = validateWithSchema(createOrderSchema, req.body.order);
    const address = await validateCEPExistence(reqOrder.cep);

    const order = {
      ...reqOrder,
      ...address,
      horario: new Date(),
      createdBy: userId, 
      teamId: teamId,    
      userId: userId     
    } as IOrder;

    const newOrder = await createOrderByApiKey(order,apiKey);
    const data: Record<string, string | number | Date | string[]> = {};
    Object.entries(newOrder).forEach(([key, value]) => {
        if (key !== "teamId" && key !== "userId" && key !== "createdAt" && key !== "updatedAt") {
            data[key] = value;
        }
    });
    console.log(data);
    return res.json({ data, message: "Order created!" });
    // ... (código para formatar a resposta - igual ao anterior)
  } catch (error) {
    console.log(error)
  }
} 


