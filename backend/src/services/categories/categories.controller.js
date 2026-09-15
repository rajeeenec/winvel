import { success } from '../../utils/response.js';
import * as categoriesService from './categories.service.js';

export async function getCategories(req, res, next) {
  try {
    const isAdmin = req.user?.role && ['admin', 'super admin'].includes(String(req.user.role).toLowerCase());
    const categories = await categoriesService.getCategories(!isAdmin);
    return success(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const category = await categoriesService.getCategoryById(req.params.id);
    return success(res, category);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await categoriesService.createCategory(req.body);
    return success(res, category, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await categoriesService.updateCategory(req.params.id, req.body);
    return success(res, category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await categoriesService.deleteCategory(req.params.id);
    return success(res, { message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
}
