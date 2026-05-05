import { useState, useEffect } from 'react';
import { MockService } from '../services/MockService';

export const useCRUD = (module) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const refreshData = async () => {
    setLoading(true);
    const result = await MockService.getAll(module);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [module]);

  const handleAdd = () => {
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    setCurrentItem(item);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (currentItem) {
      await MockService.delete(module, currentItem.id);
      setIsDeleteOpen(false);
      setCurrentItem(null);
      refreshData();
    }
  };

  const handleSave = async (formData) => {
    if (currentItem && currentItem.id) {
      await MockService.update(module, currentItem.id, formData);
    } else {
      await MockService.add(module, formData);
    }
    setIsModalOpen(false);
    refreshData();
  };

  return {
    data,
    loading,
    isModalOpen,
    setIsModalOpen,
    isViewOpen,
    setIsViewOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    currentItem,
    handleAdd,
    handleEdit,
    handleView,
    handleDeleteClick,
    handleConfirmDelete,
    handleSave
  };
};
