import { defineCollection, z } from 'astro:content';

const listasCollection = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    fecha: z.date(),
    imagen: z.string().optional(),
    libros: z.array(z.string()).optional(),
  }),
});

export const collections = {
  listas: listasCollection,
};
