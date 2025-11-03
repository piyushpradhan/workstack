import { createContext, useContext, useState } from "react";

type ModalState = {
  project: boolean;
  task: boolean;
  confirm: boolean;
};

const initialModalState: ModalState = {
  project: false,
  task: false,
  confirm: false,
};

type ModalProviderState = {
  modalState: ModalState;
  toggleModal: (modal: keyof ModalState) => void;
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  isModalOpen: (modal: keyof ModalState) => boolean;
};

const initialState = {
  modalState: initialModalState,
  toggleModal: () => null,
  openModal: () => null,
  closeModal: () => null,
  isModalOpen: () => false,
};

const ModalProviderContext = createContext<ModalProviderState>(initialState);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const isModalOpen = (modal: keyof ModalState) => {
    return modalState[modal];
  };

  const toggleModal = (modal: keyof ModalState) => {
    setModalState((prev) => ({ ...prev, [modal]: !prev[modal] }));
  };

  const openModal = (modal: keyof ModalState) => {
    setModalState((prev) => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof ModalState) => {
    setModalState((prev) => ({ ...prev, [modal]: false }));
  };

  return (
    <ModalProviderContext.Provider
      value={{ modalState, toggleModal, openModal, closeModal, isModalOpen }}
    >
      {children}
    </ModalProviderContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalProviderContext);

  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  return context;
};
