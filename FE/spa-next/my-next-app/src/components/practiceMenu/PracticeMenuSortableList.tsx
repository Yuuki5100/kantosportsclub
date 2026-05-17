import React from "react";
import { Box, IconButton, TextField } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { Font14 } from "@/components/base";
import colors from "@/styles/colors";

export type PracticeMenuRowItem = {
  id: string;
  name: string;
  time: string;
};

type Props = {
  items: PracticeMenuRowItem[];
  onChange: (items: PracticeMenuRowItem[]) => void;
  onRemove: (index: number) => void;
  onNameChange: (index: number, value: string) => void;
  onTimeChange: (index: number, value: string) => void;
  emptyMessage: string;
  showAddButton?: boolean;
  addLabel?: string;
  onAdd?: () => void;
};

const SortableRow: React.FC<{
  item: PracticeMenuRowItem;
  index: number;
  onRemove: (index: number) => void;
  onNameChange: (index: number, value: string) => void;
  onTimeChange: (index: number, value: string) => void;
}> = ({ item, index, onRemove, onNameChange, onTimeChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: "grid",
        gridTemplateColumns: "24px minmax(0, 1.4fr) 52px 36px",
        alignItems: "center",
        gap: 0.5,
        p: 0.4,
        borderRadius: 2,
        bgcolor: colors.commonFontColorWhite,
        border: `1px solid ${colors.commonBorderGray}`,
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          color: colors.grayDark,
          p: 0.4,
          m: 0,
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          minWidth: 24,
          minHeight: 24,
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16 }} />
      </Box>

      <TextField
        size="small"
        value={item.name}
        onChange={(event) => onNameChange(index, event.target.value)}
        placeholder="練習名"
        fullWidth
        sx={{
          minWidth: 0,
          "& .MuiInputBase-input": {
            fontSize: 14,
            py: 0.6,
          },
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        <TextField
          size="small"
          value={item.time}
          onChange={(event) => onTimeChange(index, event.target.value)}
          placeholder="時間"
          sx={{
            width: 40,
            "& .MuiInputBase-input": {
              fontSize: 14,
              py: 0.6,
              px: 0.5,
            },
          }}
        />
        <Font14 sx={{ color: colors.grayDark, whiteSpace: "nowrap", flexShrink: 0 }}>分</Font14>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <IconButton
          aria-label="削除"
          onClick={() => onRemove(index)}
          size="small"
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#6b7280",
            color: "#1f2937",
            border: "1px solid #4b5563",
            borderRadius: 2,
            p: 0,
            "&:hover": {
              bgcolor: "#4b5563",
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: 20, color: "#111827" }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export const PracticeMenuSortableList: React.FC<Props> = ({
  items,
  onChange,
  onRemove,
  onNameChange,
  onTimeChange,
  emptyMessage,
  showAddButton = false,
  addLabel = "追加",
  onAdd,
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onChange(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <Box>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {items.length === 0 ? (
              <Font14 sx={{ color: colors.grayDark }}>{emptyMessage}</Font14>
            ) : (
              items.map((item, index) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={onRemove}
                  onNameChange={onNameChange}
                  onTimeChange={onTimeChange}
                />
              ))
            )}
          </Box>
        </SortableContext>
      </DndContext>

      {showAddButton && onAdd ? (
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <ButtonAction
            label={addLabel}
            size="medium"
            onClick={onAdd}
            width={120}
            sx={{
              backgroundColor: "commonTableHeader",
              color: "#ffffff",
              borderRadius: 2,
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
};
