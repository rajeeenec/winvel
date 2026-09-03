import { success } from '../../utils/response.js';
import * as productsService from './products.service.js';

export async function getProducts(req, res, next) {
  try {
    const { categoryId, featured } = req.query;
    const isAdmin = req.user?.role && ['admin', 'super admin'].includes(String(req.user.role).toLowerCase());
    const products = await productsService.getProducts({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      featured: featured === 'true',
      activeOnly: !isAdmin,
    });
    return success(res, products);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await productsService.getProductById(parseInt(req.params.id));
    return success(res, product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productsService.createProduct(req.body);
    return success(res, product, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productsService.updateProduct(parseInt(req.params.id), req.body);
    return success(res, product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productsService.deleteProduct(parseInt(req.params.id));
    return success(res, { message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
}
