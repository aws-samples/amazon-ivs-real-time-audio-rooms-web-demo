import { useContextHook } from '@Hooks';
import { createContext, useMemo, useState } from 'react';

import { ModalanagerProviderProps, ModalContext } from './types';

const Context = createContext<ModalContext | null>(null);

function useModalManager() {
  return useContextHook(Context);
}

function ModalManagerProvider({ children }: ModalanagerProviderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

  const value = useMemo<ModalContext>(
    () => ({
      modalOpen,
      setModalOpen,
      modalContent,
      setModalContent
    }),
    [modalOpen, setModalOpen, modalContent, setModalContent]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export { ModalManagerProvider, useModalManager };
