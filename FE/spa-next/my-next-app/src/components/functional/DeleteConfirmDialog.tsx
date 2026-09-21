import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import ButtonAction from "@/components/base/Button/ButtonAction";

type DeleteConfirmDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ open, title, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>この操作は取り消せません。</DialogContent>
    <DialogActions>
      <ButtonAction label="いいえ" color="secondary" onClick={onClose} />
      <ButtonAction label="はい" onClick={onConfirm} />
    </DialogActions>
  </Dialog>
);

export default DeleteConfirmDialog;
