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
  startTime: string;
  endTime: string;
};

type Props = {
  items: PracticeMenuRowItem[];
  onChange: (items: PracticeMenuRowItem[]) => void;
  onRemove: (index: number) => void;
  onNameChange: (index: number, value: string) => void;
  onTimeChange: (index: number, value: string) => void;
  onStartTimeChange: (index: number, value: string) => void;
  onEndTimeChange: (index: number, value: string) => void;
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
  onStartTimeChange: (index: number, value: string) => void;
  onEndTimeChange: (index: number, value: string) => void;
}> = ({ item, index, onRemove, onNameChange, onTimeChange, onStartTimeChange, onEndTimeChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: "grid",
        gridTemplateColumns: "24px minmax(0, 1fr)",
        gridTemplateRows: "auto auto",
        alignItems: "stretch",
        gap: 0.25,
        p: 0.75,
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
          gridColumn: "1",
          gridRow: "1 / span 2",
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

      <Box sx={{ display: "flex", gap: 0.25, alignItems: "center", gridColumn: "2", gridRow: "1" }}>
        <TextField
          value={item.startTime}
          placeholder="10:20"
          size="small"
          onChange={(e) => onStartTimeChange(index, e.target.value)}
          sx={{ width: "25%" }}
        />
        <Font14 sx={{ color: colors.grayDark }}>～</Font14>

        <TextField
          value={item.endTime}
          placeholder="10:30"
          size="small"
          onChange={(e) => onEndTimeChange(index, e.target.value)}
          sx={{ width: "25%" }}
        />

        <IconButton
          aria-label="削除"
          onClick={() => onRemove(index)}
          size="small"
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 56px",
          alignItems: "center",
          gap: 0.5,
          minWidth: 0,
          gridColumn: "2",
          gridRow: "2",
        }}
      >
        <TextField
          value={item.name}
          placeholder="メニュー名"
          size="small"
          onChange={(e) => onNameChange(index, e.target.value)}
          sx={{ minWidth: 0, width: "100%" }}
        />
        <TextField
          value={item.time}
          placeholder="時間（分）"
          size="small"
          onChange={(e) => onTimeChange(index, e.target.value)}
          sx={{
            width: 56,
            justifySelf: "end",
          }}
        />
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
  onStartTimeChange,
  onEndTimeChange,
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
                  onStartTimeChange={onStartTimeChange}
                  onEndTimeChange={onEndTimeChange}
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
