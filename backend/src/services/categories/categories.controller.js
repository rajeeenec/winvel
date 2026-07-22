import { success } from '../../utils/response.js';
import * as categoriesService from './categories.service.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await categoriesService.getCategories(req.user?.role !== 'admin');
    return success(res, categories);
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
