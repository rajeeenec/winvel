import { error } from '../../utils/response.js';
import * as productsRepo from './products.repository.js';

export async function getProducts(filters) {
  return productsRepo.findAll(filters);
}

export async function getProductById(id) {
  const product = await productsRepo.findById(id);
  if (!product) throw error('Product not found', 404);

  const variants = await productsRepo.findVariantsByProductId(id);
  return { ...product, variants };
}

export async function createProduct(data) {
  return productsRepo.create(data);
}

export async function updateProduct(id, data) {
  const existing = await productsRepo.findById(id);
  if (!existing) throw error('Product not found', 404);
  return productsRepo.update(id, data);
}

export async function deleteProduct(id) {
  const existing = await productsRepo.findById(id);
  if (!existing) throw error('Product not found', 404);
  await productsRepo.remove(id);
}
