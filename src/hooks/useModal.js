import { useState } from 'react';

// Hook reutilizable para manejo de modales
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);

  const openModal = (type = null, data = null) => {
    setModalType(type);
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
    setModalData(null);
  };

  const updateModalData = (newData) => {
    setModalData(newData);
  };

  return {
    isOpen,
    modalData,
    modalType,
    openModal,
    closeModal,
    updateModalData
  };
};

export default useModal;
