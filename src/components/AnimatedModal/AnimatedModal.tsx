import './AnimatedModal.css';

import { SCALE_MOTION_TRANSITIONS, SCALE_MOTION_VARIANTS } from '@Constants';
import { clsm } from '@Utils';
import memoize from 'fast-memoize';
import { motion } from 'framer-motion';
import React from 'react';
import Modal from 'react-modal';

interface AnimatedModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

Modal.setAppElement('#root');

function ModalContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={SCALE_MOTION_VARIANTS}
      transition={SCALE_MOTION_TRANSITIONS}
      key="modal-motion"
    >
      {children}
    </motion.div>
  );
}

const getModalContent = memoize((children) => (
  <ModalContent>{children}</ModalContent>
));

function AnimatedModal({
  isOpen,
  onRequestClose,
  children
}: AnimatedModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick
      aria={{
        labelledby: 'title',
        describedby: 'full_description'
      }}
      contentElement={(_, innerChildren) => getModalContent(innerChildren)}
      overlayClassName={clsm([
        'fixed',
        'inset-0',
        'bg-overlay/80',
        'backdrop-blur',
        'grid',
        'place-items-center',
        'transition',
        'will-change-transform'
      ])}
      contentLabel="Settings modal"
      closeTimeoutMS={150}
    >
      {children}
    </Modal>
  );
}

export default AnimatedModal;
