import { z } from 'zod';
import { slugify } from '../server-common';
import {
  teamName,
  apiKeyId,
  slug,
  domain,
  email,
  password,
  token,
  role,
  sentViaEmail,
  domains,
  expiredToken,
  sessionId,
  recaptchaToken,
  priceId,
  quantity,
  memberId,
  inviteToken,
  url,
  endpointId,
  sentViaEmailString,
  invitationId,
  name,
  image,
  eventTypes,
} from './primitives';

import {
  orderCep,
  orderCidade,
  orderComplemento,
  orderEntregador,
  orderEstado,
  orderId,
  orderInstrucoes,
  orderMetodoPag,
  orderNumeroRua,
  orderItems,
  orderRua,
  orderStatus,
  orderTel,
  orderName,
  orderValor
} from "./order.primitives";

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

export const updateOrderSchema = z.object({
  id: orderId.optional(),
  orderItems: orderItems.optional(),
  status: orderStatus.optional(),
  entregador: orderEntregador.optional(),
  rua: orderRua.optional(),
  numero: orderNumeroRua.optional(),
  complemento: orderComplemento.optional(),
  cep: orderCep.optional(),
  cidade: orderCidade.optional(),
  estado: orderEstado.optional(),
  tel: orderTel.optional(),
  metodo_pag: orderMetodoPag.optional(),
  instrucoes: orderInstrucoes.optional(),
})

export const createApiKeySchema = z.object({
  name: name(50),
});

export const deleteApiKeySchema = z.object({
  apiKeyId,
});

export const teamSlugSchema = z.object({
  slug,
});

export const updateTeamSchema = z.object({
  name: teamName,
  slug: slug.transform((slug) => slugify(slug)),
  domain,
});

export const createTeamSchema = z.object({
  name: teamName,
});

export const updateAccountSchema = z.union([
  z.object({
    email,
  }),
  z.object({
    name: name(),
  }),
  z.object({
    image,
  }),
]);

export const updatePasswordSchema = z.object({
  currentPassword: password,
  newPassword: password,
});

export const userJoinSchema = z.union([
  z.object({
    team: teamName,
    slug,
  }),
  z.object({
    name: name(),
    email,
    password,
    telephone: z.string(),
    category: z.string(), idNumber: z.string(),
    cep: z.string(), address: z.string(),
    storeQuantity: z.string(), orderQuantity: z.string()
  }),
]);

export const resetPasswordSchema = z.object({
  password,
  token,
});

export const inviteViaEmailSchema = z.union([
  z.object({
    email,
    role,
    sentViaEmail,
  }),
  z.object({
    role,
    sentViaEmail,
    domains,
  }),
]);

export const resendLinkRequestSchema = z.object({
  email,
  expiredToken,
});

export const deleteSessionSchema = z.object({
  id: sessionId,
});

export const forgotPasswordSchema = z.object({
  email,
  recaptchaToken: recaptchaToken.optional(),
});

export const resendEmailToken = z.object({
  email,
});

export const checkoutSessionSchema = z.object({
  price: priceId,
  quantity: quantity.optional(),
});

export const updateMemberSchema = z.object({
  role,
  memberId,
});

export const acceptInvitationSchema = z.object({
  inviteToken,
});

export const getInvitationSchema = z.object({
  token: inviteToken,
});

export const webhookEndpointSchema = z.object({
  name: name(),
  url,
  eventTypes,
});

export const updateWebhookEndpointSchema = webhookEndpointSchema.extend({
  endpointId,
});

export const getInvitationsSchema = z.object({
  sentViaEmail: sentViaEmailString,
});

export const deleteInvitationSchema = z.object({
  id: invitationId,
});

export const getWebhookSchema = z.object({
  endpointId,
});

export const deleteWebhookSchema = z.object({
  webhookId: endpointId,
});

export const deleteMemberSchema = z.object({
  memberId,
});

// email or slug
export const ssoVerifySchema = z
  .object({
    email: email.optional().or(z.literal('')),
    slug: slug.optional().or(z.literal('')),
  })
  .refine((data) => data.email || data.slug, {
    message: 'At least one of email or slug is required',
  });
