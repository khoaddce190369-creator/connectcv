import React, { useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  className = '',
  multiline = false,
  style = {},
  tag = 'span'
}) => {
  const ref = useRef<HTMLElement>(null);
  const isFocusedRef = useRef(false);

  // Chỉ cập nhật ref.current.innerText khi phần tử KHÔNG đang được focus bởi người dùng.
  // Điều này ngăn chặn việc trỏ chuột (caret) bị nhảy về đầu/cuối khi người dùng đang gõ.
  // Khi AI chuẩn hóa xong hoặc prop value thay đổi từ ngoài, DOM sẽ cập nhật chuẩn xác.
  useEffect(() => {
    if (ref.current) {
      if (!isFocusedRef.current) {
        if (ref.current.innerText !== (value || '')) {
          ref.current.innerText = value || '';
        }
      }
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    if (ref.current) {
      const text = ref.current.innerText;
      onChange(text);
    }
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (ref.current) {
      const text = ref.current.innerText;
      if (text !== value) {
        onChange(text);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  const Component = tag as any;

  return (
    <Component
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      className={`outline-none transition-all duration-150 hover:bg-black/[0.03] focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-0.5 min-w-[30px] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:italic cursor-text ${className}`}
      style={style}
    />
  );
};
