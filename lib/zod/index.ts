import z, { ZodTypeAny } from 'zod'; // Import ZodTypeAny
import { ApiError } from '../errors';
export * from './schema';

export const validateWithSchema = <ZSchema extends ZodTypeAny>(
  schema: ZSchema,
  data: unknown // Or a more specific type if possible
) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(
      422,
      `Validation Error: ${result.error.errors.map((e) => e.message).join(', ')}` // Improved error message
    );
  }

  return result.data as z.infer<ZSchema>;
};
