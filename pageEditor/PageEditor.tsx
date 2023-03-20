import { CSSProperties, memo, useEffect, useRef, useState } from 'react';
import FieldEditor from './FieldEditor';
import CollectionField from './fields/collection/CollectionField';
import Icon from 'components/icon/Icon';
import { PageChange, PageWithMap } from 'contexts/pageContext';
import RowStyling from './RowStyling';
import { generateClassName } from './editorUtils';
import Button from 'components/button/Button';
import AddFieldPopup from './AddFieldPopup';
import { contrastingColor } from 'util/deployUtils';
import styles from './PageEditor.module.scss';
import {
  FieldRead,
  ItemRead,
  MediaRead,
  RichTextUpdate,
  RowRead,
} from 'types/collectorium-types';
import { Descendant } from 'slate';

// shouldnt take pagename, should ust take array of rows and editable || rendered
export type UpdateFieldArgs = {
  id: string;
  value?: string;
  style?: string;
};
export type UpdateItemArgs = {
  richText?: RichTextUpdate | { nodes: Descendant[] };
  media?: MediaRead;
  name?: string;
  itemProp?: string;
  itemType?: string;
  id: string;
};
export type UpdateFunctionArgs = UpdateFieldArgs & UpdateItemArgs;
export type UpdateFieldFunction = (
  updates: UpdateFunctionArgs,
  change?: PageChange
) => void;
type Props = {
  addRow: (pageId: string, parentRowId?: string, siblingRowId?: string) => void;
  addField: (pageId: string, rowId: string, type: string) => void;
  onChange: UpdateFieldFunction;
  onDelete: (
    id: string,
    updates?: { id: string; childOrder?: string[] }[]
  ) => void;
  item?: ItemRead;
  page: PageWithMap;
  deploy?: boolean;
  preview?: boolean;
  showCollectionLink?: string;
};
export default function PageEditor({
  addField,
  addRow,
  onChange,
  onDelete,
  item,
  page,
  preview = false,
  showCollectionLink,
}: Props) {
  const rows = page.childOrder
    .map((i: string) => page.childMap[i])
    .filter((r) => !!r);

  return (
    <div>
      {showCollectionLink && (
        // @ts-ignore
        <CollectionLink row={rows[0]} name={showCollectionLink} />
      )}
      {rows.map((r) => (
        <RowEditor
          addField={addField}
          addRow={addRow}
          key={r.id}
          item={item}
          preview={preview}
          row={r as RowRead}
          childMap={page.childMap}
          onChange={onChange}
          onDelete={onDelete}
        />
      ))}
      {rows.length === 0 && page.editable && (
        <div className={styles.addRowIcon}>
          <Icon onClick={() => addRow(page.id)} icon="plus" color="white" />
        </div>
      )}
    </div>
  );
}

// prevent context updates from rendering entire page, just render updated row
function preventRowRerender(
  prevProps: Readonly<RowEditorProps>,
  nextProps: Readonly<RowEditorProps>
) {
  if (prevProps?.item !== nextProps?.item) {
    return false;
  }
  if (nextProps.row?.rerender === prevProps.row?.rerender) {
    return true;
  }
  return false;
}
type RowEditorProps = {
  addField: (
    pageId: string,
    rowId: string,
    type: string,
    name?: string
  ) => void;
  addRow: (pageId: string, parentRowId?: string, siblingRowId?: string) => void;
  row: RowRead;
  childMap: PageWithMap['childMap'];
  item?: ItemRead;
  onChange: UpdateFieldFunction;
  onDelete: (id: string) => void;
  preview: boolean;
};

const RowEditor = memo(
  ({
    addField,
    addRow,
    childMap,
    item,
    onChange,
    onDelete,
    row,
    preview,
  }: RowEditorProps) => {
    const childElems = row.childOrder
      .map((i: string) => childMap[i])
      .filter((r) => !!r);
    const [editPanelOpen, setEditPanelOpen] = useState<boolean>();
    const [referenceHovered, setReferenceHovered] = useState<boolean>();
    const [animateIn, setAnimateIn] = useState(true);
    const mouseLeaveTimeout = useRef();
    useEffect(() => {
      setTimeout(() => setAnimateIn(false), 500);
    }, []);
    const className = `${row.id} ${styles.rowStylingWrapper} ${
      animateIn ? styles.rowAnimateIn : ''
    } ${referenceHovered || editPanelOpen ? styles.rowStylingHovered : ''}
    ${generateClassName(row.style, !!row.rowId)}`;
    return (
      // @ts-ignore
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
        {(referenceHovered || editPanelOpen) && (
          <>
            {!row.rowId && (
              <div
                className={`${styles.addSection} ${styles.addSectionBottom}`}
              >
                <Button
                  onClick={() => addRow(row.pageId, undefined, row.id)}
                  style="primary"
                >
                  Add Row
                </Button>
              </div>
            )}

            <div className={`${styles.addField} ${styles.addFieldRight}`}>
              <AddFieldPopup
                onOpen={() => setEditPanelOpen(true)}
                onClose={() => setEditPanelOpen(false)}
                addField={(type: string, itemProp?: string) =>
                  addField(row.pageId, row.id, type, itemProp)
                }
                addRow={() => {
                  addRow(row.pageId, row.id);
                }}
                item={item}
              />
            </div>
          </>
        )}
        <RowStyling
          preview={preview}
          setEditPanelOpen={setEditPanelOpen}
          onChange={(style: string) => {
            const change = {
              type: 'row',
              update: {
                id: row.id,
                key: 'styles',
                value: style,
                previous: row.style,
              },
            };
            onChange({ id: row.id, style }, change);
          }}
          item={item}
          show={editPanelOpen || referenceHovered}
          style={row.style}
          name={row.id}
          parentRow={row.rowId || undefined}
          onDelete={() => onDelete(row.id)}
        />
        {childElems.map((child) => {
          if (child.hasOwnProperty('name')) {
            if ((child as FieldRead).type === 'collection')
              return (
                <CollectionField
                  field={child as FieldRead}
                  onChange={onChange}
                  key={child.id}
                  preview={preview}
                  onDelete={onDelete}
                />
              );
            return (
              <FieldEditor
                field={child as FieldRead}
                onChange={onChange}
                item={item}
                key={child.id}
                preview={preview}
                onDelete={onDelete}
              />
            );
          }
          return (
            <RowEditor
              addRow={addRow}
              addField={addField}
              key={child.id}
              row={child as RowRead}
              item={item}
              onChange={onChange}
              onDelete={onDelete}
              preview={preview}
              childMap={childMap}
            />
          );
        })}
      </div>
    );
  },
  preventRowRerender
);

function CollectionLink({ name, row }: { name: string; row: RowRead }) {
  try {
    let colorClass = 'tc-textColor-color tc-textColor-color-hover';
    const s: CSSProperties = {
      position: 'absolute',
      zIndex: 3,
      left: 8,
      top: 8,
      fontSize: '18px',
    };
    if (!row.style) {
      return (
        <a href="/home" style={s} className={colorClass}>
          View {name}
        </a>
      );
    }
    const style = JSON.parse(row?.style);

    if (style['background-color'] && style['background-color'][0] === '#') {
      s.color = contrastingColor(style.background);
    } else if (style['background-color']) {
      colorClass = `tc-${style['background-color']}-color-contrast tc-${style['background-color']}-color-contrast-hover`;
    }

    return (
      <a href="/home" style={s} className={colorClass}>
        {'< Collection'}
      </a>
    );
  } catch (e) {
    console.error(e);
    return <div />;
  }
}
