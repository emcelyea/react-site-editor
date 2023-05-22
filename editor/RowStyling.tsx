// @ts-nocheck
// eslint-disable
// rowstylings job is to draw the styles and render
// the edit & delete button
import { NestedPopup } from 'components/popup/Popup';
import styles from './PageEditor.module.scss';
import Panel from 'components/panel/Panel';
import Text from 'components/text/Text';
import Button from 'components/button/Button';
import TextInput from 'components/textInput/TextInput';
import Tooltip from 'components/tooltip/Tooltip';
import { Checkbox } from 'components/checkbox/Checkbox';
import ImageField from 'templates/inputs/imageField/ImageField';
import ColorPicker from 'templates/inputs/colorPicker/ColorPicker';
import FontSelector from 'templates/inputs/fontSelector/FontSelector';
import ButtonStyleSelector from 'templates/inputs/buttonStyleSelector/ButtonStyleSelector';
import PageLink from 'templates/inputs/pageLink/PageLink';
import Icon from 'components/icon/Icon';
import Select from 'components/select/Select';
import { getDefaultImageSrc } from 'util/defaultImage';
import { useItemFormModalContext } from 'pageComponents/collection/ItemFormModalContext';
import {
  cloneElement,
  createElement,
  isValidElement,
  memo,
  ReactElement,
  ReactNode,
  useState,
  useRef,
} from 'react';
import { PageFieldRead } from 'types/collectorium-types';
import { fieldEditableProperties } from './editorUtils';
type Props = {
  style?: string | null;
  setEditPanelOpen: (open: boolean) => void;
  onChange: (val: string) => void;
  onChangeBackgroundImage?: (update: {
    value: string;
    media?: Media | undefined;
    mediaId?: string | undefined;
  }) => void;
  onDelete: (rowId: string) => void;
  item?: ItemRead;
  backgroundImageFieldValue?: PageFieldRead;
  preview: boolean;
  show?: boolean;
  name: string;
  parentRow?: string;
};

const RowStyling = memo(
  ({
    style,
    setEditPanelOpen,
    preview,
    onChange,
    onDelete,
    item,
    name,
    parentRow,
    show,
  }: Props) => {
    const { setModalOpen, setItem } = useItemFormModalContext();

    let styleValues: { [key: string]: string } = {};
    let cssValue: string = '';
    try {
      if (style) {
        styleValues = JSON.parse(style);
        cssValue = generateCss(styleValues);
      }
    } catch (e) {
      console.error(e);
    }

    if (preview) {
      return (
        <span
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{
            __html: `<style>
                      .pview .${name} ${cssValue}
                    </style>`,
          }}
        />
      );
    }
    return (
      <>
        <span
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{
            __html: `<style>
                      .pview .${name} ${cssValue}
                    </style>`,
          }}
        />

        <div
          className={`${styles.editButton} ${
            show ? styles.editButtonToggled : ''
          }`}
        >
          {item && (
            <Button
              subtle
              hollow
              style="white"
              onClick={() => {
                setItem(item);
                setModalOpen(true);
              }}
            >
              Edit Item
            </Button>
          )}
          <NestedPopup
            onClose={() => {
              setEditPanelOpen(false);
              return undefined;
            }}
            triggers={['click']}
            placement="bottom-start"
            offsetOptions={{ crossAxis: 40 }}
            renderPopup={() => (
              <Panel padding={16}>
                <div className={styles.editPanel}>
                  <Text weight="400" noMargin>
                    Edit Row
                  </Text>
                  {fieldEditableProperties.row.sections.map((section) => {
                    return (
                      <SectionEditor
                        key={section.label}
                        section={section}
                        parentRow={parentRow}
                        style={styleValues}
                        onChange={(key, val) => {
                          styleValues = {
                            ...styleValues,
                            [key]: val,
                          };
                          onChange(JSON.stringify(styleValues));
                        }}
                      />
                    );
                  })}
                </div>
              </Panel>
            )}
          >
            <div>
              <Icon
                icon="object-ungroup"
                onClick={() => setEditPanelOpen(true)}
              />
            </div>
          </NestedPopup>
          <Icon icon="trash-can" color="danger" onClick={onDelete} />
        </div>
      </>
    );
  }
);

const SectionEditor = ({
  section,
  style,
  onChange,
  parentRow,
}: {
  section: EditablePropertySection;
  style: { [key: string]: string };
  onChange: (key: string, val: string) => void;
  parentRow?: string;
}) => {
  const [showSection, setShowSection] = useState(false);
  return (
    <>
      <div
        className={`${styles.toggleSectionButton} ${
          showSection ? styles.buttonOpen : ''
        }`}
      >
        <Button
          subtle
          onClick={() => setShowSection(!showSection)}
          icon={showSection ? 'chevron-down' : 'chevron-right'}
        >
          {section.label}
        </Button>
      </div>
      {showSection &&
        section.properties.map((property) => {
          if (!parentRow && property.key === 'width') return '';
          return (
            <div className={styles.property} key={property.key}>
              <div className={styles.propertyTitle}>
                <Text size="s" weight="300">
                  {property.label}
                </Text>
                {property.tooltip && (
                  <Tooltip label={property.tooltip}>
                    <div className="margin-left-8 margin-right-8">
                      <Icon icon="circle-question" size="s" />
                    </div>
                  </Tooltip>
                )}
              </div>
              <EditProperty
                property={property.key}
                onChange={(val) => {
                  onChange(property.key, val);
                }}
                value={style[property.key]}
              />
            </div>
          );
        })}
    </>
  );
};
const alignItems = [
  {
    name: 'Centered',
    value: 'center',
  },
  {
    name: 'Top',
    value: 'flex-start',
  },
  { name: 'Bottom', value: 'flex-end' },
];

const justifyContent = [
  { name: 'Space Between', value: 'space-between' },
  { name: 'Space Around', value: 'space-around' },
  {
    name: 'Centered',
    value: 'center',
  },
  {
    name: 'Start',
    value: 'flex-start',
  },
  { name: 'End', value: 'flex-end' },
];
const flexDirection = [
  {
    name: 'Row',
    value: 'row',
  },
  {
    name: 'Column',
    value: 'column',
  },
];
const opacities = [
  { name: '0%', value: '0' },
  { name: '10%', value: '.10' },
  { name: '20%', value: '.20' },
  { name: '30%', value: '.30' },
  { name: '40%', value: '.40' },
  { name: '50%', value: '.50' },
  { name: '60%', value: '.60' },
  { name: '70%', value: '.70' },
  { name: '80%', value: '.80' },
  { name: '90%', value: '.90' },
  { name: '100%', value: '1' },
];
const heights = [
  { name: 'XXS', value: 'xxs' },
  { name: 'XS', value: 'xs' },
  { name: 'S', value: 's' },
  { name: 'M', value: 'm' },
  { name: 'L', value: 'l' },
  { name: 'XL', value: 'xl' },
];
const paddings = [
  '0',
  '2px 6px',
  '4px 8px',
  '8px 16px',
  '16px 32px',
  '32px 64px',
].map((p) => ({
  name: p.slice(0, p.indexOf(' ')),
  value: p,
}));
const borderRadii = [
  { name: '0', value: '0' },
  { name: '2px', value: '2px' },
  { name: '4px', value: '4px' },
  { name: '8px', value: '8px' },
  { name: '16px', value: '16px' },
];
const widths = [
  { name: 'XS', value: 'xs' },
  { name: 'S', value: 's' },
  { name: 'M', value: 'm' },
  { name: 'L', value: 'l' },
  { name: 'XL', value: 'xl' },
];
const margins = [
  {
    name: 'None',
    value: '0',
  },
  {
    name: 'XS',
    value: '4px',
  },
  { name: 'S', value: '8px' },
  { name: 'M', value: '16px' },
  { name: 'L', value: '32px' },
  { name: 'XL', value: '64px' },
];
function EditProperty({
  label = '',
  property,
  onChange,
  value = '',
}: {
  label?: string;
  property: EditableProperty;
  onChange: Props['onChange'];
  value: string | undefined;
}) {
  switch (property) {
    case 'align-items': {
      return (
        <Select
          name="align-items"
          label={label}
          options={alignItems}
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    }
    case 'background-color':
      return (
        <ColorPicker
          name={property}
          label={label}
          onChange={(val, palette) =>
            palette ? onChange(palette) : onChange(val)
          }
          value={value}
        />
      );
    case 'background-opacity': {
      return (
        <Select
          name="background-opacity"
          label={label}
          options={opacities}
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    }
    case 'border-radius': {
      return (
        <div className="margin-left-16" style={{ width: 72 }}>
          <Select
            name="rounding"
            label={label}
            options={borderRadii}
            onChange={onChange}
            value={value}
            size="s"
          />
        </div>
      );
    }
    case 'flex-direction': {
      return (
        <Select
          name="flex-direction"
          label={label}
          options={flexDirection}
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    }

    case 'height':
      return (
        <div className="margin-left-16" style={{ width: 72 }}>
          <Select
            name="height"
            label={label}
            options={heights}
            onChange={onChange}
            value={value}
            size="s"
          />
        </div>
      );
    case 'justify-content':
      return (
        <Select
          name="justify-content"
          label={label}
          options={justifyContent}
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    case 'margin-horizontal':
      return (
        <Select
          name="margin-horizontal"
          label={label}
          options={margins}
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    case 'margin-vertical':
      return (
        <Select
          name="margin-vertical"
          label={label}
          options={margins}
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    case 'padding': {
      return (
        <Select
          name="padding"
          label={label}
          options={paddings}
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    }
    case 'width':
      return (
        <Select
          name="width"
          label={label}
          options={widths}
          color="black"
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    default:
      return <span></span>;
  }
}
function generateCss(style: { [key: string]: string }) {
  const props = Object.keys(style);
  const values = {};
  const ignoreValues = ['width'];
  props.forEach((prop) => {
    if (ignoreValues.includes(prop)) return;
    if (
      prop === 'background-color' &&
      style[prop] &&
      style['background-opacity'] &&
      style[prop] !== 'transparent'
    ) {
      const rgb = hexToRgb(style[prop]);
      const rgba = `${rgb?.slice(0, rgb.length - 1)}, ${
        style['background-opacity']
      })`;
      values[prop] = rgba;
      return;
    }
    if (prop === 'height') {
      values['min-height'] = style[prop];
      return;
    }
    if (prop === 'background-opacity') return;
    if (prop === 'margin-horizontal') {
      values['margin-left'] = style[prop];
      values['margin-right'] = style[prop];
    }
    if (prop === 'margin-vertical') {
      values['margin-top'] = style[prop];
      values['margin-bottom'] = style[prop];
    }
    values[prop] = style[prop];
  });
  const cssValue = JSON.stringify(values)
    .replace(/"/g, '')
    .replace(/,+(?![^(]*\))/g, ';');
  return cssValue;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
        result[3],
        16
      )})`
    : null;
}
export default RowStyling;
