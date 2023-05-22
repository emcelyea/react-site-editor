import ContentEditable from 'react-contenteditable';

export default function TextField({
  onChange,
  preview = false,
  value = '',
}: {
  value: string;
  onChange: (val: { value: string }) => void;
  preview?: boolean;
}) {
  return (
    //@ts-ignore
    <ContentEditable
      html={value}
      onChange={(e) => {
        onChange({ value: e.target.value ? e.target.value : ' ' });
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}
      disabled={preview}
      tagName="span"
      style={{
        outline: 'none',
        whiteSpace: 'pre-wrap',
        border: value === ' ' ? '1px dashed rgb(90, 159, 227)' : '',
      }}
    />
  );
}
