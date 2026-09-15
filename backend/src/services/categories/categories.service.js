import { error } from '../../utils/response.js';
import * as categoriesRepo from './categories.repository.js';

export async function getCategories(activeOnly = true) {
  return categoriesRepo.findAll(activeOnly);
}

export async function createCategory(data) {
  return categoriesRepo.create(data);
}

export async function getCategoryById(id) {
  const category = await categoriesRepo.findById(id);
  if (!category) throw error('Category not found', 404);
  return category;
}

export async function updateCategory(id, data) {
  await getCategoryById(id);
  return categoriesRepo.update(id, data);
}

export async function deleteCategory(id) {
  await getCategoryById(id);
  return categoriesRepo.remove(id);
}
