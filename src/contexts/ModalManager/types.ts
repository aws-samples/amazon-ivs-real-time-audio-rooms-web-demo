import { Dispatch, ReactNode, SetStateAction } from 'react';

interface ModalanagerProviderProps {
  children: React.ReactNode;
}

interface ModalContext {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  modalContent?: ReactNode;
  setModalContent: Dispatch<SetStateAction<JSX.Element | null>>;
}

export type { ModalanagerProviderProps, ModalContext };
