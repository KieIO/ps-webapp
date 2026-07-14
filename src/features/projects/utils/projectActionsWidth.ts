const ACTION_BUTTON_WIDTH = 32;
const ACTION_BUTTON_GAP = 2;
const ACTION_CELL_PADDING = 28;

export interface ProjectActionsWidthOptions {
  hasUpdateStatus?: boolean;
  canAssign?: boolean;
  hasEdit?: boolean;
  canEvaluate?: boolean;
  hasArchive?: boolean;
  hasUnarchive?: boolean;
  hasDelete?: boolean;
}

/** Width for the fixed actions column — must fit all visible icon buttons without clipping. */
export const getProjectActionsWidth = ({
  hasUpdateStatus = false,
  canAssign = false,
  hasEdit = false,
  canEvaluate = false,
  hasArchive = false,
  hasUnarchive = false,
  hasDelete = false,
}: ProjectActionsWidthOptions): number => {
  const count = [
    hasUpdateStatus,
    canAssign,
    hasEdit,
    canEvaluate,
    hasArchive,
    hasUnarchive,
    hasDelete,
  ].filter(Boolean).length;

  if (count === 0) return 0;

  return (
    count * ACTION_BUTTON_WIDTH + Math.max(0, count - 1) * ACTION_BUTTON_GAP + ACTION_CELL_PADDING
  );
};
