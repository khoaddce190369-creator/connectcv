import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface ItemToolbarProps {
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddBelow?: () => void;
  className?: string;
}

export const ItemToolbar: React.FC<ItemToolbarProps> = ({
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddBelow,
  className = ''
}) => {
  return (
    <div
      className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-md px-1 py-0.5 z-10 print:hidden ${className}`}
    >
      {onMoveUp && (
        <button
          onClick={onMoveUp}
          title="Di chuyển lên"
          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      )}
      {onMoveDown && (
        <button
          onClick={onMoveDown}
          title="Di chuyển xuống"
          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
      {onAddBelow && (
        <button
          onClick={onAddBelow}
          title="Thêm mục bên dưới"
          className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          title="Xóa mục này"
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
