import { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';

export const useCRUD = (module) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const result = await ApiService.getAll(module);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
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
      try {
        await ApiService.delete(module, currentItem.id);
        setIsDeleteOpen(false);
        setCurrentItem(null);
        refreshData();
      } catch (error) {
        console.error("Failed to delete item", error);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (currentItem && currentItem.id) {
        await ApiService.update(module, currentItem.id, formData);
      } else {
        await ApiService.add(module, formData);
      }
      setIsModalOpen(false);
      refreshData();
    } catch (error) {
      console.error("Failed to save item", error);
    }
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
