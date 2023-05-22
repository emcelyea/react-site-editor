import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  SyntheticEvent,
  ReactElement,
  ReactNode,
} from 'react';
import styles from '../PageEditor.module.scss';
import Popup, { NestedPopup } from 'components/popup/Popup';
import Tooltip from 'components/tooltip/Tooltip';
import { LinkPopup } from 'templates/inputs/pageLink/PageLink';
import ColorPicker from 'templates/inputs/colorPicker/ColorPicker';
import Select from 'components/select/Select';
import isUrl from 'util/is-url';
import Icon, { Icons } from 'components/icon/Icon';
import {
  BaseEditor,
  createEditor,
  Editor,
  Element as SlateElement,
  Transforms,
  Descendant,
  Range,
} from 'slate';
import debounce from 'util/debounce';
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  useSlate,
  useSelected,
  RenderLeafProps,
  RenderElementProps,
} from 'slate-react';
import { MediaRead } from 'types/collectorium-types';
export type CustomElement = {
  type: 'paragraph' | 'link' | 'image';
  children: CustomText[];
  align?: string;
  url?: string;
  src?: string;
  media?: MediaRead;
  mediaId?: string;
  preview?: boolean;
  removeMedia?: (mediaId: string) => void;
};
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
const FOCUS_BOXSHADOW = '0 0 0 2px #aaa';
const HOTKEYS: { [key: string]: string } = {
  b: 'bold',
  i: 'italic',
  u: 'underline',
  '`': 'code',
};

type Props = {
  labelId: string;
  defaultValue?: Descendant[];
  value?: string;
  onBlurProp?: () => void;
  onFocusProp?: () => void;
  onChange: (value: { value: string }) => void;
  preview?: boolean;
  // preserve content in localStorage between saves
  placeholder?: string;

  // allow keyboard shortcuts
  shortcuts?: boolean;
  hideBackground?: boolean;
};

// value of empty slate editor
const emptyValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export default function TextField({
  onChange,
  onBlurProp,
  onFocusProp,
  labelId = '',
  defaultValue = emptyValue,
  value,
  placeholder,
  preview = false,
  shortcuts = true,
  hideBackground = false,
}: Props) {
  const editor = useMemo(() => withInlines(withReact(createEditor())), []);
  const renderElement = useCallback(
    (props: RenderElementProps) => (
      <Element {...props} element={{ ...props.element, preview }} />
    ),
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => (
      <ChromeBugfixText {...props}></ChromeBugfixText>
    ),
    []
  );
  const [isFocused, setIsFocused] = useState(false);
  const [toolbarFocused, setToolbarFocused] = useState(false);

  const [fontWeight, setFontWeight] = useState('400');
  const [fontSize, setFontSize] = useState('14');
  const [color, setColor] = useState('#000000');
  const [selectionIsLink, setSelectionIsLink] = useState(false);
  // slate does not update when `value` prop is updated except on initial render
  // we preserve last value passed to onChange & compare
  // value to it to trigger redraw if value has been externally updated
  const currentValue = useRef(defaultValue);
  const currentStringValue = useRef(JSON.stringify(defaultValue));
  // bind media src & remove media src to img nodes

  // prevents rerender on every onChange event, only rerenders if value shifts entirely
  useEffect(() => {
    if (currentStringValue.current !== value) {
      try {
        const valueJson = value ? JSON.parse(value) : defaultValue;
        currentValue.current = valueJson;
        currentStringValue.current = valueJson;
        resetEditorNodes(editor, valueJson);
      } catch (e) {
        console.error('issue manually setting richtext value', e);
        currentValue.current = defaultValue;
        resetEditorNodes(editor, defaultValue);
      }
    }
  }, [value]);
  return (
    <div key={labelId} className={styles.richTextWrapper}>
      <Slate
        editor={editor}
        value={currentValue.current}
        onChange={debounce<Descendant[]>((val) => {
          currentValue.current = val;
          if (isEmptyRichText(val)) {
            currentValue.current = defaultValue;
            return onChange({ value: JSON.stringify(currentValue.current) });
          }
          // slate fires onchange events that dont actually update value
          const update = JSON.stringify(val);
          if (value !== update) {
            currentValue.current = val;
            currentStringValue.current = update;
            onChange({ value: update });
          }
        }, 900)}
      >
        <NestedPopup
          placement="bottom-start"
          triggers={['click']}
          onClose={() => {
            if (isFocused || toolbarFocused) {
              return true;
            }
            return undefined;
          }}
          offsetOptions={{ crossAxis: -12, mainAxis: 8 }}
          zIndex={3}
          renderPopup={() => {
            return (
              !preview && (
                <Toolbar>
                  <ToolbarGroup>
                    <MarkButton
                      format="italic"
                      icon="italic"
                      tooltip="Italic"
                    />

                    <MarkButton format="bold" icon="bold" tooltip="Bold" />
                    <MarkButton
                      format="underline"
                      icon="underline"
                      tooltip="Underline"
                    />
                  </ToolbarGroup>
                  <ToolbarGroup>
                    <ToolbarAddLink
                      addLink={(url, address) => {
                        if (isLinkActive(editor)) {
                          unwrapLink(editor);
                        }
                        if (!url) return;
                        wrapLink(editor, url, address, preview);
                      }}
                      active={selectionIsLink}
                      onClick={() => {
                        if (isLinkActive(editor)) {
                          unwrapLink(editor);
                        }
                      }}
                    />
                    <ToolbarAddColor
                      value={color}
                      onChange={(val) => {
                        const isActive = isMarkActive(editor, 'color');
                        if (isActive) {
                          Editor.removeMark(editor, 'color');
                        }
                        if (val && val !== 'transparent') {
                          setColor(val);
                          Editor.addMark(editor, 'color', val);
                        }
                      }}
                      onFocus={() => {
                        setToolbarFocused(true);
                      }}
                      onBlur={() => {
                        setToolbarFocused(false);
                      }}
                    />
                  </ToolbarGroup>

                  <ToolbarSelect
                    options={[
                      { value: '10', name: '10px' },
                      { value: '12', name: '12px' },
                      { value: '14', name: '14px' },
                      { value: '16', name: '16px' },
                      { value: '18', name: '18px' },
                      { value: '20', name: '20px' },
                      { value: '24', name: '24px' },
                      { value: '28', name: '28px' },
                      { value: '32', name: '32px' },
                      { value: '40', name: '40px' },
                      { value: '48', name: '48px' },
                      { value: '64', name: '64px' },
                      { value: '80', name: '80px' },
                      { value: '96', name: '96px' },
                    ]}
                    onChange={(e, val) => {
                      e.preventDefault();
                      Editor.removeMark(editor, 'fontSize');
                      Editor.addMark(editor, 'fontSize', val);
                      setFontSize(val);
                    }}
                    onFocus={() => {
                      setToolbarFocused(true);
                    }}
                    onBlur={() => {
                      setToolbarFocused(false);
                    }}
                    label="Font Size"
                    value={fontSize}
                    name="Font Size"
                  />
                  <ToolbarSelect
                    label="Font Weight"
                    options={[
                      { value: '200', name: 'Light' },
                      { value: '400', name: 'Normal' },
                      { value: '800', name: 'Bold' },
                    ]}
                    onChange={(e, val) => {
                      e.preventDefault();
                      if (isMarkActive(editor, 'bold')) {
                        Editor.removeMark(editor, 'bold');
                      }
                      Editor.removeMark(editor, 'fontWeight');
                      Editor.addMark(editor, 'fontWeight', val);
                      setFontWeight(val);
                    }}
                    onFocus={() => {
                      setToolbarFocused(true);
                    }}
                    onBlur={() => {
                      setToolbarFocused(false);
                    }}
                    value={fontWeight}
                  />
                </Toolbar>
              )
            );
          }}
        >
          <div
            className={`
            ${!preview ? styles.richTextBody : ''} ${
              isFocused ? styles.focused : ''
            } ${!preview && !hideBackground ? styles.richTextBackground : ''} ${
              styles.richTextNoBorder
            } ${preview ? styles.richTextPreview : ''}`}
          >
            <Editable
              readOnly={preview}
              name={labelId}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              style={{ minHeight: 'auto' }}
              placeholder={preview ? '' : placeholder}
              onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                const { selection } = editor;
                // dont delete certain block types on backspace
                // if (event.key === 'Backspace') {
                //   if (
                //     selection &&
                //     Range.isCollapsed(selection) &&
                //     selection.anchor.offset === 0 &&
                //     selection.anchor.path[0] > 0
                //   ) {
                //     const [node] = Editor.nodes(editor, {
                //       at: [selection.anchor.path[0] - 1, 0],
                //       match: (n) => {
                //         return (
                //           !Editor.isEditor(n) &&
                //           SlateElement.isElement(n) &&
                //           n.type === 'image'
                //         );
                //       },
                //     });
                //     if (node) {
                //       event.preventDefault();
                //     }
                //   }
                // }
                // prevents bug where arrow keys cant escape from inline text block
                if (selection && Range.isCollapsed(selection)) {
                  if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    Transforms.move(editor, {
                      unit: 'offset',
                      reverse: true,
                    });
                    return;
                  }
                  if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    Transforms.move(editor, { unit: 'offset' });
                    return;
                  }
                }
                if (shortcuts && (event.ctrlKey || event.metaKey)) {
                  if (HOTKEYS[event.key]) {
                    event.preventDefault();
                    const mark = HOTKEYS[event.key];
                    toggleMark(editor, mark);
                    return;
                  }
                }
              }}
              onSelect={() => {
                setSelectionIsLink(isLinkActive(editor));
                const marks = Editor.marks(editor);
                if (marks && marks.hasOwnProperty('fontSize')) {
                  //@ts-ignore
                  setFontSize(marks.fontSize);
                } else {
                  setFontSize('14');
                }
                if (marks && marks.hasOwnProperty('color')) {
                  //@ts-ignore
                  setColor(marks.color);
                } else {
                  setColor('#000000');
                }
                if (marks && marks.hasOwnProperty('fontWeight')) {
                  //@ts-ignore
                  setFontWeight(marks.fontWeight);
                } else {
                  setFontWeight('400');
                }
              }}
              onBlur={() => {
                setIsFocused(false);
                if (onBlurProp) {
                  onBlurProp();
                }
              }}
              onFocus={(e) => {
                // fix issue where focus fails if tab focused
                if (e.relatedTarget) {
                  Transforms.select(editor, {
                    anchor: Editor.end(editor, []),
                    focus: Editor.end(editor, []),
                  });
                }
                setIsFocused(true);
                if (onFocusProp) {
                  onFocusProp();
                }
              }}
              spellCheck
            />
          </div>
        </NestedPopup>
      </Slate>
    </div>
  );
}

//@ts-ignore
const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };

  switch (element.type) {
    case 'link':
      return (
        <LinkComponent attributes={attributes} element={element}>
          {children}
        </LinkComponent>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};
//@ts-ignore
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.fontSize || leaf.fontWeight || leaf.color) {
    children = (
      <span
        style={{
          fontSize: `${leaf.fontSize}px`,
          fontWeight: leaf.fontWeight,
          color: leaf.color,
        }}
      >
        {children}
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};

/** ##########
 * Mark Element <b> <i> <u> functionality
 * ##########
 */
const MarkButton = ({ format, icon, value = true, tooltip }: ButtonProps) => {
  const editor = useSlate();
  return (
    <ToolbarButton
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format, value);
      }}
      tooltip={tooltip}
      icon={icon}
    ></ToolbarButton>
  );
};
const toggleMark = (
  editor: BaseEditor & ReactEditor,
  format: string,
  value: string | boolean = true
) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, value);
  }
};
const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  //@ts-ignore
  return marks ? marks[format] : false;
};
type ButtonProps = {
  format: string;
  icon: Icons;
  value?: string | boolean;
  tooltip?: string;
};

/** #######
 *  Add/remove Links Functionality
 *  #######
 */
const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
  return !!link;
};
const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
};
const wrapLink = (
  editor: Editor,
  url: string,
  address: string,
  preview?: boolean
) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);

  const link: CustomElement = {
    type: 'link',
    url: address,
    preview,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};
const LinkComponent = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const selected = useSelected();
  return (
    <a
      {...attributes}
      href={element.preview ? element.url : undefined}
      style={{ boxShadow: selected ? FOCUS_BOXSHADOW : '' }}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
};

/** ########
 * HOCS that wrap our createEditor() call
 * #########
 */

// Detect if text being added is a link
const withInlines = (editor: Editor) => {
  const { insertData, isVoid, isInline } = editor;
  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element);
  };
  editor.isInline = (element) =>
    ['link'].includes(element.type) || isInline(element);

  editor.insertData = (data) => {
    const text = data.getData('text/plain');
    if (text && isUrl(text.trim())) {
      wrapLink(editor, text, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

/** ######
 * Utility functions, fix chromium bugs & allow us to reset editor content using a value prop
 * ###### */
const InlineChromiumBugfix = () => (
  <span contentEditable={false} style={{ fontSize: 0 }}>
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const ChromeBugfixText = ({ attributes, children, leaf }: RenderLeafProps) => (
  <span
    // The following is a workaround for a Chromium bug where,
    // if you have an inline at the end of a block,
    // clicking the end of a block puts the cursor inside the inline
    // instead of inside the final {text: ''} node
    // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
    style={{ paddingLeft: leaf.text === '' ? '0.1px' : undefined }}
    {...attributes}
  >
    <Leaf attributes={attributes} leaf={leaf}>
      {children}
    </Leaf>
  </span>
);
export function isEmptyRichText(nodes: Descendant[]): boolean | null {
  try {
    return (
      nodes.length === 1 &&
      SlateElement.isElement(nodes[0]) &&
      nodes[0].type === 'paragraph' &&
      nodes[0]?.children.length === 1 &&
      nodes[0].children[0].text === ''
    );
  } catch (e) {
    console.error(e);
    return true;
  }
}

function resetEditorNodes(editor: Editor, nodes?: Descendant[]): void {
  const children = [...editor.children];
  children.forEach((node) =>
    editor.apply({ type: 'remove_node', path: [0], node })
  );

  if (nodes) {
    nodes.forEach((node, i) =>
      // @ts-ignore
      editor.apply({ type: 'insert_node', path: [i], node })
    );
  }
}
export function Toolbar({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  return <div className={styles.toolbar}>{children}</div>;
}

export function ToolbarButton({
  active,
  icon,
  onMouseDown = () => {},
  onClick = () => {},
  tooltip,
}: {
  active: boolean;
  icon: Icons;
  onMouseDown?: (event: SyntheticEvent) => void;
  onClick?: () => void;
  tooltip?: string;
}) {
  if (tooltip) {
    return (
      <Tooltip label={tooltip} placement="top">
        <button
          onMouseDown={(e) => {
            onMouseDown(e);
            e.preventDefault();
          }}
          className={styles.toolbarButton}
          onClick={onClick}
        >
          <Icon color={active ? 'black' : 'grey'} icon={icon}></Icon>
        </button>
      </Tooltip>
    );
  }
  return (
    <button
      onMouseDown={(e) => {
        onMouseDown(e);
        e.preventDefault();
      }}
      className={styles.toolbarButton}
      onClick={onClick}
    >
      <Icon color={active ? 'black' : 'grey'} icon={icon}></Icon>
    </button>
  );
}

export function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className={styles.toolbarButtonGroup}>{children}</div>;
}

export function ToolbarSelect({
  label,
  options,
  onChange,
  onBlur = () => {},
  onFocus = () => {},
  value,
  name,
}: {
  label: string;
  options: { value: string; name: string }[];
  name?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onChange: (event: SyntheticEvent, value: string) => void;
  value?: string;
}) {
  return (
    <Tooltip label={label} placement="top">
      <div className={styles.toolbarSelect}>
        <Select
          options={options}
          value={value}
          label=""
          onChange={(val, e) => onChange(e, val)}
          showLabel={false}
          name={name}
          size="s"
          onBlur={onBlur}
          onFocus={onFocus}
        />
      </div>
    </Tooltip>
  );
}

export function ToolbarAddLink({
  active,
  addLink,
  onClick = () => {},
}: {
  active?: boolean;
  addLink: (url: string, address: string) => void;
  onClick?: () => void;
}) {
  return (
    <Tooltip label={active ? 'Remove Link' : 'Add Link'} placement="top">
      <div onClick={onClick}>
        <Popup
          disabled={active}
          zIndex={3}
          renderPopup={({ close }) => {
            return (
              <LinkPopup
                value=""
                onChange={(formattedUrl, ogUrl) => {
                  addLink(ogUrl, formattedUrl);
                  close();
                }}
              />
            );
          }}
          triggers={['click']}
        >
          <button className={styles.toolbarButton}>
            <Icon color={active ? 'black' : 'grey'} icon="link"></Icon>
          </button>
        </Popup>
      </div>
    </Tooltip>
  );
}

export function ToolbarAddColor({
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  value?: string;
  onChange?: (color?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <Tooltip label="Set Color" placement="top">
      <button className={styles.toolbarButton}>
        <ColorPicker
          name="richtext-colorpicker"
          value={value}
          onChange={(val) => onChange && onChange(val)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </button>
    </Tooltip>
  );
}
