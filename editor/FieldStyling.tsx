// @ts-nocheck
// eslint-disable
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
import {
  EditablePropertySection,
  fieldEditableProperties,
} from './editorUtils';
type Props = {
  style: string | null;
  children: ReactElement | ReactElement[] | Element | undefined;
  onChange: (val: string) => void;
  onDelete?: () => void;
  show?: boolean;
  setEditPanelOpen: (open: boolean) => void;
  preview: boolean;
  fieldId: string;
  type: string;
};

const FieldStyleEditor = memo(
  ({
    children,
    show = false,
    style,
    type,
    preview,
    setEditPanelOpen,
    onChange,
    onDelete,
    fieldId,
  }: Props) => {
    let styleValues: { [key: string]: string } = {};
    let cssValue: string = '';
    let cssHoverValue: string = '';
    let Children = children;
    try {
      if (style) {
        styleValues = JSON.parse(style);
        if (styleValues.height && styleValues.height === '0') {
          Children = <HiddenFieldWrapper preview={preview} />;
          cssValue = '{background-color: rgba(0,0,0,0.4);}';
        } else {
          const css = generateCss(styleValues);
          cssValue = css.cssValue;
          cssHoverValue = css.cssHoverValue;
          Children = generateWrappers(styleValues, children, fieldId, preview);
        }
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
                  .pview .${fieldId} ${cssValue}
                  .pview .${fieldId}:hover ${cssHoverValue}
                </style>`,
          }}
        />
      );
    }
    return preview ? (
      { Children }
    ) : (
      <>
        <span
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{
            __html: `<style>
                      .pview .${fieldId} ${cssValue}
                      .pview .${fieldId}:hover ${cssHoverValue}
                    </style>`,
          }}
        />

        <div
          className={`${styles.editButton} ${styles.editButtonField} ${
            show ? styles.editButtonToggled : ''
          }`}
        >
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
                    Edit {fieldEditableProperties[type].label}
                  </Text>
                  {fieldEditableProperties[type].sections.map((section) => {
                    return (
                      <SectionEditor
                        key={section.label}
                        section={section}
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
              <Icon icon="pencil" onClick={() => setEditPanelOpen(true)} />
            </div>
          </NestedPopup>
          <Icon icon="trash-can" color="danger" onClick={onDelete} />
        </div>
        {Children}
      </>
    );
  }
);

const SectionEditor = ({
  section,
  style,
  onChange,
}: {
  section: EditablePropertySection;
  style: { [key: string]: string };
  onChange: (key: string, val: string | {}) => void;
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
const opacities = [
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
const fontSizes = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '40px',
  '48px',
  '56px',
  '64px',
  '72px',
  '80px',
].map((size) => ({ name: size, value: size }));
const fontWeights = [
  { name: 'Light', value: '100' },
  { name: 'Normal', value: '400' },
  { name: 'Bold', value: '700' },
];
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
const buttonSizes = [
  {
    name: 'XS',
    value: '48px,72px',
  },
  {
    name: 'S',
    value: '72px,120px',
  },
  {
    name: 'M',
    value: '120px,160px',
  },
  {
    name: 'L',
    value: '160px,200px',
  },
];
const margins = [
  {
    name: 'None',
    value: '0',
  },
  {
    name: 'XS',
    value: '1%',
  },
  { name: 'S', value: '1.5%' },
  { name: 'M', value: '2%' },
  { name: 'L', value: '4%' },
  { name: 'XL', value: '8%' },
];
const heights = [
  { name: 'XS', value: 'xs' },
  { name: 'S', value: 's' },
  { name: 'M', value: 'm' },
  { name: 'L', value: 'l' },
  { name: 'XL', value: 'xl' },
];
const paddings = [
  { name: 'None', value: '0' },
  { name: 'XS', value: '2px 6px' },
  { name: 'S', value: '4px 8px' },
  { name: 'M', value: '8px 16px' },
  { name: 'L', value: '16px 32px' },
  { name: 'XL', value: '32px 64px' },
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
    case 'background-image': {
      return (
        <ImageField
          noAlternateSizes
          label="Set Image"
          size="sm"
          selectExisting={true}
          type="white"
          onSelect={(value) => onChange(value.media.path)}
        />
      );
    }
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
        <Select
          name="border-radius"
          label={label}
          options={borderRadii}
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    }
    case 'background-color':
    case 'color':
    case 'hoverBackground':
    case 'hoverColor':
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
    case 'height':
      return (
        <Select
          name="height"
          label={label}
          options={heights}
          color="black"
          onChange={onChange}
          value={value}
          size="s"
        />
      );
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

    case 'buttonSize':
      return (
        <Select
          name="buttonSize"
          label={label}
          options={buttonSizes}
          color="black"
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    case 'font-family':
      return (
        <FontSelector
          color="black"
          name={property}
          label={label}
          value={value}
          onChange={onChange}
        />
      );
    case 'font-size':
      return (
        <Select
          name="font-size"
          label={label}
          options={fontSizes}
          color="black"
          onChange={onChange}
          value={value}
          size="s"
        />
      );
    case 'font-weight':
      return (
        <Select
          name="font-weight"
          label={label}
          options={fontWeights}
          color="black"
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
    case 'pageLink': {
      return <PageLink value={value} onChange={onChange} />;
    }
    default:
      return <div>Property {property} not found</div>;
  }
}
function LinkWrapper({
  children,
  href,
  prodDeploy,
  preview,
}: {
  children: ReactNode;
  href: string;
  preview?: boolean;
  prodDeploy?: boolean;
}) {
  if (prodDeploy || preview) return <a href={href}>{children}</a>;
  return <a>{children}</a>;
}
function HiddenFieldWrapper({ preview }: { preview: boolean }) {
  return preview ? (
    <div className={styles.hiddenField} style={{ display: 'none' }} />
  ) : (
    <div className={styles.hiddenField} />
  );
}

function ImageBackgroundWrapper({
  defaultImageKey,
  path,
  children,
}: {
  defaultImageKey: string;
  path: string;
  children: ReactNode;
}) {
  const imgSrc = `url(${path ? path : getDefaultImageSrc(defaultImageKey)})`;
  if (/\.mp4$|\.mpeg|\.webm/.test(path)) {
    const SourceElement = createElement('source', {
      src: path || undefined,
      type: 'video/mp4',
    });
    const VideoElement = createElement(
      'video',
      {
        id: 'background-video',
        autoPlay: true,
        loop: true,
        muted: true,
        poster: undefined,
        style: { position: 'absolute', width: '100%', height: '100%' },
      },
      [SourceElement]
    );
    let childWithVideo = '';
    if (isValidElement(children)) {
      const childArray = Array.isArray(children?.props?.children)
        ? children?.props?.children
        : [children?.props?.children];
      childWithVideo = cloneElement(children, {
        children: [VideoElement, ...childArray],
      });
    }
    return <span className={styles.imageEditor}>{childWithVideo}</span>;
  }
  let childWithBackground;
  if (path && path.includes('#')) {
    childWithBackground = isValidElement(children)
      ? cloneElement(children, {
          style: {
            backgroundColor: path,
          },
        })
      : null;
    return <span className={styles.imageEditor}>{childWithBackground}</span>;
  }
  childWithBackground = isValidElement(children)
    ? cloneElement(children, {
        style: {
          backgroundImage: imgSrc,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        },
      })
    : null;
  return <span className={styles.imageEditor}>{childWithBackground}</span>;
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

export function generateCss(style: { [key: string]: string }) {
  const props = Object.keys(style);
  const values = {};
  const hoverValues = {};
  const ignoreProps = ['background-image', 'pageLink', 'background-opacity'];
  props.forEach((prop) => {
    if (ignoreProps.includes(prop)) return;

    if (
      prop === 'background-color' &&
      style[prop] &&
      style['background-opacity']
    ) {
      const rgb = hexToRgb(style[prop]);
      const rgba = `${rgb?.slice(0, rgb.length - 1)}, ${
        style['background-opacity']
      })`;
      values[prop] = rgba;
      return;
    }
    if (prop === 'margin-horizontal') {
      values['margin-left'] = style[prop];
      values['margin-right'] = style[prop];
    }
    if (prop === 'margin-vertical') {
      values['margin-top'] = style[prop];
      values['margin-bottom'] = style[prop];
    }
    if (prop === 'buttonSize') {
      const [height, width] = style[prop].split(',');
      values['min-height'] = height;
      values.width = width;
      return;
    }
    if (prop === 'hoverBackground') {
      hoverValues['background-color'] = style[prop];
      return;
    }
    if (prop === 'hoverColor') {
      hoverValues.color = style[prop];
      return;
    }

    values[prop] = style[prop];
  });
  const cssValue = JSON.stringify(values)
    .replace(/"/g, '')
    .replace(/,+(?![^(]*\))/g, ';');
  const cssHoverValue = JSON.stringify(hoverValues)
    .replace(/"/g, '')
    .replace(/,+(?![^(]*\))/g, ';');
  return { cssValue, cssHoverValue };
}

function generateWrappers(
  style: { [key: string]: string },
  children: JSX.Element,
  fieldId: string,
  preview?: boolean,
  prodDeploy?: boolean
) {
  let wrapped = children;
  if (style.pageLink) {
    wrapped = (
      <LinkWrapper
        href={style.pageLink}
        prodDeploy={prodDeploy}
        preview={preview}
      >
        {wrapped}
      </LinkWrapper>
    );
  }

  if (style['background-image']) {
    wrapped = (
      <ImageBackgroundWrapper
        path={style['background-image']}
        defaultImageKey={`bg-img-${fieldId}`}
      >
        {wrapped}
      </ImageBackgroundWrapper>
    );
  }
  return wrapped;
}
export default FieldStyleEditor;
