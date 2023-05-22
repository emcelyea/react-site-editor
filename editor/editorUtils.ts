import { RowCreate, FieldCreate } from 'types/collectorium-types';

import { createId } from '@paralleldrive/cuid2';

export type EditableProperty = {
  key: string;
  label: string;
  tooltip?: string;
};
export type EditablePropertySection = {
  label: string;
  properties: EditableProperty[];
};

const propertyLabels: { [key: string]: string } = {
  'align-items': 'Alignment',
  'background-color': 'Background Color',
  'background-image': 'Background Image',
  'background-opacity': 'Transparency',
  border: 'Border',
  'border-radius': 'Rounding',
  buttonSize: 'Size',
  color: 'Text Color',
  'flex-direction': 'Direction',
  'font-size': 'Text Size',
  'font-weight': 'Text Weight',
  height: 'Height',
  hoverBackground: 'Background hover',
  hoverColor: 'Color hover',
  'line-height': 'Vertical Position',
  'justify-content': 'Spacing',
  'margin-horizontal': 'Gap Horizontal',
  'margin-vertical': 'Gap Vertical',
  padding: 'Padding',
  pageLink: 'Page Link',
  'text-align': 'Horizontal Position',
  width: 'Width',
};

const propertyTooltips: { [key: string]: string } = {
  'align-items': 'Alignment of items',
  'background-image': 'Set background content',
  'background-opacity': 'Transparency of elements background',
  'border-radius': 'Rounding of the elements corners.',
  'flex-direction': 'Direction elements are laid out in',
  'font-weight': 'Boldness of text',
  height: 'Height of element',
  'justify-content': 'Spacing between elements in this row',
  hoverBackground: 'Color of element background when user hovers mouse over it',
  hoverColor: 'Color of text when user hovers mouse over it',
  'margin-horizontal': 'Horizontal space between this element and the next one',
  'margin-vertical': 'Vertical space between this element and the next one',
  padding: 'Spread of this elements background',
  pageLink: 'Set the page or address that clicking this button will link to.',
  width: 'Width of element',
};
const sections: { [key: string]: string } = {
  'background-color': 'background',
  'background-image': 'background',
  'background-opacity': 'background',
  border: 'background',
  buttonSize: 'size',
  'border-radius': 'background',
  color: 'font',
  'font-size': 'font',
  'font-weight': 'font',
  'line-height': 'font',
  'align-items': 'layout',
  'flex-direction': 'layout',
  height: 'size',
  'justify-content': 'layout',
  'margin-vertical': 'size',
  'margin-horizontal': 'size',
  padding: 'size',
  width: 'size',
  hoverBackground: 'interaction',
  hoverColor: 'interaction',
  pageLink: 'interaction',
};
const sectionLabels: { [key: string]: string } = {
  background: 'Background',
  font: 'Text',
  layout: 'Content Layout',
  interaction: 'Interaction',
  size: 'Sizing',
};

function createFieldProperties(name: string, props: string[]) {
  // push fields sections
  const fieldSections = props.reduce(
    (all: { [key: string]: EditablePropertySection }, p) => {
      if (all[sections[p]]) {
        all[sections[p]].properties.push({
          key: p,
          label: propertyLabels[p],
          tooltip: propertyTooltips[p],
        });
      } else {
        all[sections[p]] = {
          label: sectionLabels[sections[p]],
          properties: [
            {
              key: p,
              label: propertyLabels[p],
              tooltip: propertyTooltips[p],
            },
          ],
        };
      }
      return all;
    },
    {}
  );
  return {
    label: name,
    sections: Object.keys(fieldSections).map((k: string) => fieldSections[k]),
  };
}

export type Fields = 'text' | 'button' | 'image' | 'collection';

// binds tooltips and labels to list of editable properties
const textFieldEditables = createFieldProperties('Text', [
  'background-color',
  'background-image',
  'background-opacity',
  'height',
  'width',
  'margin-horizontal',
  'margin-vertical',
  'padding',
]);
const buttonFieldEditables = createFieldProperties('Button', [
  'background-color',
  'background-opacity',
  'border-radius',
  'buttonSize',
  'color',
  'font-size',
  'font-weight',
  'hoverBackground',
  'hoverColor',
  'margin-vertical',
  'margin-horizontal',
  'padding',
  'pageLink',
]);
const imageFieldEditables = createFieldProperties('Image', [
  'height',
  'width',
  'margin-vertical',
  'margin-horizontal',
  'padding',
  'border',
  'border-radius',
]);

const mediaGalleryEditables = createFieldProperties('MediaGallery', [
  'width',
  'height',
  'margin-vertical',
  'margin-horizontal',
  'padding',
]);

const collectionFieldEditables = createFieldProperties('Collection', [
  'border',
  'border-radius',
  'height',
  'margin',
  'padding',
  'width',
]);
const plainTextFieldEditables = createFieldProperties('PlainText', [
  'align-items',
  'justify-content',
  'background-color',
  'background-opacity',
  'border-radius',
  'color',
  'font-size',
  'font-weight',
  'margin-vertical',
  'margin-horizontal',
  'padding',
  'width',
]);
const richTextFieldEditables = createFieldProperties('RichText', [
  'background-color',
  'margin-vertical',
  'margin-horizontal',
  'padding',
  'width',
]);

// row handles properties differently all props cant be added
const rowFieldEditables = createFieldProperties('Row', [
  'align-items',
  'flex-direction',
  'justify-content',
  'background-color',
  // 'border',
  'border-radius',
  'height',
  'width',
  'margin-vertical',
  'margin-horizontal',
  'background-opacity',
  'padding',
]);
export const fieldEditableProperties = {
  text: textFieldEditables,
  button: buttonFieldEditables,
  image: imageFieldEditables,
  collection: collectionFieldEditables,
  mediaGallery: mediaGalleryEditables,
  plainText: plainTextFieldEditables,
  richText: richTextFieldEditables,
  // row handles inputs differently all props cant be added
  row: rowFieldEditables,
};

export const createField = (
  pageId: string,
  rowId: string,
  type: string,
  itemProp?: string
) => {
  switch (type) {
    case 'text':
      return createTextField(pageId, rowId, itemProp);
    case 'image':
      return createImageField(pageId, rowId, itemProp);
    case 'button':
      return createButtonField(pageId, rowId, itemProp);
    case 'collection':
      return createCollectionField(pageId, rowId, itemProp);
    case 'mediaGallery':
      return createMediaGalleryField(pageId, rowId, itemProp);
    case 'plainText':
      return createPlainTextField(pageId, rowId, itemProp);
    case 'richText':
      return createRichTextField(pageId, rowId, itemProp);
    default:
      return createTextField(pageId, rowId, itemProp);
  }
};
export const createTextField = (
  pageId: string,
  rowId: string,
  itemProp?: string
): FieldCreate => {
  const id = createId();
  return {
    name: `field_${id}`,
    value: `[{"type": "paragraph","children":[{ "text": "Text" }]}]`,
    type: 'text',
    style: '{"width": "s", "height":"m", "margin-vertical":"8px"}',
    pageId,
    // row and id may be of length 7, which indicates they are to be created still
    // backend will resolve how to create/update these onSave, for now they get temp ids
    rowId,
    id,
    itemProp,
    create: true,
  };
};
export const createPlainTextField = (
  pageId: string,
  rowId: string,
  itemProp?: string
): FieldCreate => {
  const id = createId();
  return {
    name: `field_${id}`,
    value: '',
    type: 'plainText',
    style: '{"width": "s", "height":"m", "margin-vertical":"8px"}',
    pageId,
    // row and id may be of length 7, which indicates they are to be created still
    // backend will resolve how to create/update these onSave, for now they get temp ids
    rowId,
    id,
    itemProp,
    create: true,
  };
};
export const createRichTextField = (
  pageId: string,
  rowId: string,
  itemProp?: string
): FieldCreate => {
  const id = createId();
  return {
    name: `field_${id}`,
    value: `[{"type": "paragraph","children":[{ "text": "Text" }]}]`,
    type: 'richText',
    style: '{"width": "s", "height":"m", "margin-vertical":"8px"}',
    pageId,
    // row and id may be of length 7, which indicates they are to be created still
    // backend will resolve how to create/update these onSave, for now they get temp ids
    rowId,
    id,
    itemProp,
    create: true,
  };
};
export const createButtonField = (
  pageId: string,
  rowId: string,
  itemProp?: string
): FieldCreate => {
  const id = createId();
  return {
    name: `field_${id}`,
    value: 'Button',
    type: 'button',
    style:
      '{"width":"s", "height":"m", "display":"flex","align-items":"center","justify-content":"center", "font-size":"28px","font-weight":"300", "padding": "4px 8px","border-radius":"4px"}',
    pageId,
    // row and id may be of length 7, which indicates they are to be created still
    // backend will resolve how to create/update these onSave, for now they get temp ids
    rowId,
    id,
    itemProp,
    create: true,
  };
};
export const createImageField = (
  pageId: string,
  rowId: string,
  itemProp?: string
): FieldCreate => {
  const id = createId();
  return {
    name: `field_${id}`,
    value: '',
    type: 'image',
    style:
      '{"width":"m", "height":"m", "display":"flex","align-items":"center","justify-content":"center"}',
    pageId,
    // row and id may be of length 7, which indicates they are to be created still
    // backend will resolve how to create/update these onSave, for now they get temp ids
    rowId,
    id,
    itemProp,
    create: true,
  };
};
export const createMediaGalleryField = (
  pageId: string,
  rowId: string,
  itemProp?: string
): FieldCreate => {
  const id = createId();
  return {
    name: `field_${id}`,
    value: '',
    type: 'mediaGallery',
    style:
      '{"width":"xl", "height":"m", "display":"flex","align-items":"center","justify-content":"center"}',
    pageId,
    // row and id may be of length 7, which indicates they are to be created still
    // backend will resolve how to create/update these onSave, for now they get temp ids
    rowId,
    id,
    itemProp,
    create: true,
  };
};

export const createCollectionField = (
  pageId: string,
  rowId: string,
  itemProp?: string
): FieldCreate => {
  const id = createId();
  return {
    name: `field_${id}`,
    value:
      '{"search":"basic","sort":"basic", "template":"List","load":"scroll","width":"xl"}',
    type: 'collection',
    style: '{"width":"xl", "height":"l", }',
    pageId,
    // row and id may be of length 7, which indicates they are to be created still
    // backend will resolve how to create/update these onSave, for now they get temp ids
    rowId,
    id,
    itemProp,
    create: true,
  };
};

const rowStyle = `{
  "display":"flex",
  "align-items":"center",
  "justify-content":"center",
  "flex-wrap":"wrap",
  "padding": "16px 32px",
  "min-height": "320px",
  "min-width":"120px",
  "width": "100%"
}`;
const nestedRowStyle = `{
  "display":"flex",
  "align-items":"center",
  "justify-content":"center",
  "flex-wrap":"wrap",
  "padding": "8px 16px",
  "width": "m",
  "min-height": "280px",
  "margin": "0 1%"
}`;

export const createDefaultRow = (
  pageId: string,
  rowId?: string,
  childOrder?: string[]
): RowCreate => {
  return {
    childOrder: childOrder || [],
    style: rowId ? nestedRowStyle : rowStyle,
    pageId,
    rowId,
    rerender: 1,
    // row and id may be of length 7, which indicates they are to be created still
    // backend will resolve how this is done
    id: createId(),
    create: true,
  };
};

export function generateClassName(styles?: string | null, parentRow?: boolean) {
  if (!styles) return '';
  try {
    const s = JSON.parse(styles);
    if (!s) {
      return '';
    }
    let name = '';
    if (s.width && parentRow) {
      name += ` width-${s.width}`;
    }
    if (s.height) {
      name += ` ${!parentRow ? 'toprow-' : ''}height-${s.height}`;
    }
    if (s.color) {
      name += ` tc-${s.color}-color`;
    }
    if (s['background-color']) {
      name += ` tc-${s['background-color']}-background-color`;
    }

    return name;
  } catch (e) {
    console.error(e);
  }
  return '';
}
