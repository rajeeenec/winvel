import { db } from '../../config/database.js';

export async function findAll() {
  const roles = await db('roles as r')
    .select(
      'r.id',
      'r.name',
      'r.description',
      'r.created_at',
      db.raw('COUNT(DISTINCT u.id) as user_count'),
      db.raw('COUNT(DISTINCT rp.permission_id) as permission_count')
    )
    .leftJoin('users as u', 'r.id', 'u.role_id')
    .leftJoin('role_permissions as rp', 'r.id', 'rp.role_id')
    .groupBy('r.id', 'r.name', 'r.description', 'r.created_at')
    .orderBy('r.id', 'asc');

  return roles;
}

export async function findById(id) {
  const role = await db('roles').where({ id }).first();
  if (!role) return null;

  const permissions = await db('role_permissions as rp')
    .select('p.*')
    .join('permissions as p', 'rp.permission_id', 'p.id')
    .where('rp.role_id', id);

  const users = await db('users')
    .select('id', 'first_name', 'last_name', 'email', 'status')
    .where('role_id', id);

  return {
    ...role,
    permissions,
    users,
  };
}

export async function findAllPermissions() {
  let permissions = await db('permissions').select('*').orderBy(['module', 'name']);
  
  // If permissions table is empty, seed default permissions
  if (permissions.length === 0) {
    const defaultPermissions = [
      { name: 'products.view', module: 'Products', action: 'View Products' },
      { name: 'products.create', module: 'Products', action: 'Create Product' },
      { name: 'products.edit', module: 'Products', action: 'Edit Product' },
      { name: 'products.delete', module: 'Products', action: 'Delete Product' },
      { name: 'orders.view', module: 'Orders', action: 'View Orders' },
      { name: 'orders.manage', module: 'Orders', action: 'Update Order Status' },
      { name: 'categories.manage', module: 'Categories', action: 'Manage Categories' },
      { name: 'customers.view', module: 'Customers', action: 'View Customers' },
      { name: 'settings.manage', module: 'Settings', action: 'Manage Settings & Theme' },
      { name: 'roles.manage', module: 'Roles', action: 'Manage Roles & Access Control' },
    ];

    for (const perm of defaultPermissions) {
      await db('permissions').insert(perm);
    }
    permissions = await db('permissions').select('*').orderBy(['module', 'name']);
  }

  return permissions;
}

export async function create({ name, description, permissionIds = [] }) {
  const [insertId] = await db('roles').insert({
    name,
    description: description || null,
  });

  if (Array.isArray(permissionIds) && permissionIds.length > 0) {
    const insertRows = permissionIds.map((pId) => ({
      role_id: insertId,
      permission_id: pId,
    }));
    await db('role_permissions').insert(insertRows);
  }

  return findById(insertId);
}

export async function update(id, { name, description, permissionIds }) {
  await db('roles')
    .where({ id })
    .update({
      name,
      description: description || null,
    });

  if (Array.isArray(permissionIds)) {
    await db('role_permissions').where({ role_id: id }).delete();
    if (permissionIds.length > 0) {
      const insertRows = permissionIds.map((pId) => ({
        role_id: id,
        permission_id: pId,
      }));
      await db('role_permissions').insert(insertRows);
    }
  }

  return findById(id);
}

export async function remove(id) {
  await db('role_permissions').where({ role_id: id }).delete();
  await db('roles').where({ id }).delete();
}
