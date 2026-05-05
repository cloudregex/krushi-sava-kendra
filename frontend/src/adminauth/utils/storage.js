export const STORAGE_KEYS = {
  USERS: 'ksk_users',
  ROLES: 'ksk_roles',
  CURRENT_USER: 'ksk_current_user',
  SALES: 'ksk_sales',
  PURCHASES: 'ksk_purchases',
  AGRO_DATA: 'agro_erp_data'
};

export const getFromStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const initializeStorage = () => {
  let updated = false;
  let existingRoles = getFromStorage(STORAGE_KEYS.ROLES) || [];
  
  const defaultRoles = [
    {
      id: 'admin-role',
      roleName: 'Admin',
      permissions: {
        product: ['view', 'create', 'edit', 'delete'],
        category: ['view', 'create', 'edit', 'delete'],
        customer: ['view', 'create', 'edit', 'delete'],
        supplier: ['view', 'create', 'edit', 'delete'],
        sale: ['view', 'create', 'edit', 'delete'],
        purchase: ['view', 'create', 'edit', 'delete'],
        tax: ['view', 'create', 'edit', 'delete'],
        stock: ['view', 'manage'],
        users: ['manage'],
        roles: ['manage']
      }
    }
  ];

  // Filter out old default roles if they exist
  const oldRoleNames = ['User 1', 'User 2', 'User 3'];
  const originalLength = existingRoles.length;
  existingRoles = existingRoles.filter(r => !oldRoleNames.includes(r.roleName));
  
  if (existingRoles.length !== originalLength) updated = true;

  // Add missing default roles
  defaultRoles.forEach(defRole => {
    if (!existingRoles.some(r => r.roleName === defRole.roleName)) {
      existingRoles.push(defRole);
      updated = true;
    }
  });

  if (updated || existingRoles.length === 0) {
    setToStorage(STORAGE_KEYS.ROLES, existingRoles);
  }

  if (!getFromStorage(STORAGE_KEYS.USERS)) {
    setToStorage(STORAGE_KEYS.USERS, []);
  }
};
