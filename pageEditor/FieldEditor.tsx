import { UpdateFieldFunction } from './PageEditor';
import FieldStyling from './FieldStyling';
import RichText from 'components/richText/RichText';
import PlainTextField from './fields/PlainTextField';
import debounce from 'util/debounce';
import { generateClassName } from './editorUtils';
import { memo, useRef, useState } from 'react';
import TextField from './fields/TextField';
import ButtonField from './fields/ButtonField';
import ImageField from './fields/ImageField';
import MediaGallery from './fields/MediaGallery';
import styles from './PageEditor.module.scss';
import {
  FieldRead,
  ItemRead,
  MediaRead,
  RichTextUpdate,
} from 'types/collectorium-types';
import { Descendant } from 'slate';

type FieldEditorProps = {
  preview?: boolean;
  field: FieldRead;
  item?: ItemRead;
  onChange: UpdateFieldFunction;
  onDelete: (fieldId: string) => void;
};
// prevent context updates from rendering entire page, just render updated row
function preventRowRerender(
  prevProps: Readonly<FieldEditorProps>,
  nextProps: Readonly<FieldEditorProps>
) {
  if (prevProps?.item !== nextProps?.item) {
    return false;
  }
  if (nextProps.field?.rerender === prevProps.field?.rerender) {
    return true;
  }
  return false;
}

const FieldEditor = memo(
  ({ item, onChange, onDelete, field, preview = false }: FieldEditorProps) => {
    const [editPanelOpen, setEditPanelOpen] = useState<boolean>();
    const [referenceHovered, setReferenceHovered] = useState<boolean>();
    const mouseLeaveTimeout = useRef();
    function changeStyle(style: string) {
      const change = {
        type: 'field',
        update: {
          id: field.id,
          key: 'styles',
          value: style,
          previous: field.style,
        },
      };
      onChange({ id: field.id, style }, change);
    }
    const changeField = debounce<FieldUpdate>((val: FieldUpdate) => {
      const value = val || {};
      if (item) {
        onChange({
          ...value,
          id: field.id,
          itemProp: field.itemProp || undefined,
          itemType: field.type,
        });
      } else {
        const change = {
          type: 'field',
          update: {
            id: field.id,
            key: 'value',
            value: value.value as string,
            previous: field.value,
          },
        };
        onChange({ ...value, id: field.id }, change);
      }
    });

    const styleClasses = generateClassName(field?.style, true);
    const className = `${field.id} ${
      field.type === 'button'
        ? 'tc-accent-background-color tc-accentText-color'
        : ''
    } ${styles.fieldStylingWrapper} ${
      referenceHovered || editPanelOpen ? styles.fieldStylingHovered : ''
    } ${styleClasses}`;
    return (
      <div
        className={className}
        onMouseEnter={() => {
          if (mouseLeaveTimeout.current) {
            clearTimeout(mouseLeaveTimeout.current);
          }
          setReferenceHovered(true);
        }}
        onMouseLeave={() => {
          //@ts-ignore
          mouseLeaveTimeout.current = setTimeout(
            () => setReferenceHovered(false),
            500
          );
        }}
      >
        <FieldStyling
          show={referenceHovered || editPanelOpen}
          setEditPanelOpen={setEditPanelOpen}
          style={field.style}
          preview={preview}
          fieldId={field.id}
          onChange={changeStyle}
          type={field.type}
          onDelete={() => {
            onDelete(field.id);
          }}
        >
          {/*@ts-ignore*/}
          <EditField
            //@ts-ignore
            item={item}
            field={field}
            onChange={changeField}
            preview={preview}
          />
        </FieldStyling>
      </div>
    );
  },
  preventRowRerender
);

type FieldUpdate = {
  value: string;
  richText?: RichTextUpdate | { nodes: Descendant[] };
  media?: MediaRead;
  style?: string;
};
type EditFieldProps = {
  item?: ItemRead;
  preview?: boolean;
  field: FieldRead;
  onChange: (value: FieldUpdate) => void;
};
// onChange function, fields just reutrn a value & above will sort out typing
function EditField({ item, field, preview, onChange }: EditFieldProps) {
  const val = item && item[field?.itemProp as keyof ItemRead];

  switch (field.type) {
    case 'text':
      return (
        // @ts-ignore
        <TextField
          value={typeof val === 'string' ? val : field.value}
          preview={preview}
          onChange={debounce<FieldUpdate>((value) => onChange(value))}
        />
      );
    case 'button':
      return (
        // @ts-ignore
        <ButtonField
          value={field.value}
          preview={preview}
          onChange={debounce<FieldUpdate>((value) => onChange(value))}
        />
      );
    case 'image':
      return (
        <ImageField
          id={field.id}
          value={field.value}
          name={field.name}
          preview={preview}
          onChange={(value) => onChange(value)}
        />
      );
    case 'plainText':
      return (
        <PlainTextField
          value={typeof val === 'string' ? val : field.value}
          preview={preview}
          onChange={(value) => onChange(value)}
        />
      );
    case 'richText':
      if (val && val.hasOwnProperty('nodes')) {
        return (
          <RichText
            labelId="item-description"
            noBorder={true}
            onChange={(value) =>
              onChange({ value: JSON.stringify(value.nodes), richText: value })
            }
            value={val as RichTextUpdate}
            shortcuts={true}
            hideBackground={true}
            preview={preview}
            toolbarPosition="bottom-start"
          />
        );
      }
      return <div></div>;
    case 'mediaGallery':
      return (
        <MediaGallery
          id={field.id}
          value={field.value}
          item={item}
          style={field.style}
          preview={preview}
          onChange={(value) => onChange(value)}
        />
      );
    default:
      return (
        // @ts-ignore
        <TextField
          value={field.value}
          preview={preview}
          onChange={debounce<FieldUpdate>((value) => onChange(value))}
        />
      );
  }
}
export default FieldEditor;
