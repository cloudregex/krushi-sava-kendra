// Mock Service for AgroERP
const STORAGE_KEY = 'agro_erp_data';

const getInitialData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  
  return {
    suppliers: [],
    customers: [],
    categories: [
      { id: 1, name: 'Fertilizers', description: 'Chemical and organic fertilizers', isActive: true, createdAt: new Date().toISOString() },
      { id: 2, name: 'Pesticides', description: 'Insecticides and herbicides', isActive: true, createdAt: new Date().toISOString() }
    ],
    taxes: [
      { id: 1, name: 'GST 5%', percentage: 5, isActive: true, createdAt: new Date().toISOString() },
      { id: 2, name: 'GST 12%', percentage: 12, isActive: true, createdAt: new Date().toISOString() },
      { id: 3, name: 'GST 18%', percentage: 18, isActive: true, createdAt: new Date().toISOString() }
    ],
    products: [
      { id: 1, name: 'Urea 45%', salePrice: 300, costPrice: 250, tax: 5, batchNo: 'UR-2023-1', category: 'Fertilizers', stock: 850 },
      { id: 2, name: 'DAP Fertilizer', salePrice: 1200, costPrice: 1000, tax: 12, batchNo: 'DAP-A1', category: 'Fertilizers', stock: 200 },
      { id: 3, name: 'Pesticide X', salePrice: 500, costPrice: 400, tax: 18, batchNo: 'PX-99', category: 'Pesticides', stock: 10 },
      { id: 4, name: 'Potash Fertilizer', salePrice: 800, costPrice: 650, tax: 5, batchNo: 'PK-01', category: 'Fertilizers', stock: 400 },
      { id: 5, name: 'Calcium Nitrate', salePrice: 450, costPrice: 380, tax: 12, batchNo: 'CN-22', category: 'Fertilizers', stock: 300 },
    ]
  };
};

let db = getInitialData();

// If products are empty (old cached data), seed them
if (!db.products || db.products.length === 0) {
  db.products = [
    { id: 1, name: 'Urea 45%', salePrice: 300, costPrice: 250, tax: 5, batchNo: 'UR-2023-1', category: 'Fertilizers', stock: 850 },
    { id: 2, name: 'DAP Fertilizer', salePrice: 1200, costPrice: 1000, tax: 12, batchNo: 'DAP-A1', category: 'Fertilizers', stock: 200 },
    { id: 3, name: 'Pesticide X', salePrice: 500, costPrice: 400, tax: 18, batchNo: 'PX-99', category: 'Pesticides', stock: 10 },
    { id: 4, name: 'Potash Fertilizer', salePrice: 800, costPrice: 650, tax: 5, batchNo: 'PK-01', category: 'Fertilizers', stock: 400 },
    { id: 5, name: 'Calcium Nitrate', salePrice: 450, costPrice: 380, tax: 12, batchNo: 'CN-22', category: 'Fertilizers', stock: 300 },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const saveDB = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const MockService = {
  getAll: (module) => Promise.resolve(db[module] || []),
  
  getById: (module, id) => {
    const item = db[module].find(i => i.id === Number(id));
    return Promise.resolve(item || null);
  },
  
  add: (module, item) => {
    const newItem = { 
      ...item, 
      id: Date.now(), 
      createdAt: new Date().toISOString(),
      isActive: item.isActive !== undefined ? item.isActive : true 
    };
    db[module].push(newItem);
    saveDB();
    return Promise.resolve(newItem);
  },
  
  update: (module, id, updatedItem) => {
    const index = db[module].findIndex(item => item.id === id);
    if (index !== -1) {
      db[module][index] = { ...db[module][index], ...updatedItem };
      saveDB();
      return Promise.resolve(db[module][index]);
    }
    return Promise.reject('Item not found');
  },
  
  delete: (module, id) => {
    db[module] = db[module].filter(item => item.id !== id);
    saveDB();
    return Promise.resolve(true);
  }
};
