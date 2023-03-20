// data used to create or update user templates
export default {
  name: 'basic',
  label: 'Basic',
  tooltip: 'Basic Template Set',
  pages: {
    home: {
      page: {
        name: 'Collection',
        type: 'home',
        landingPage: true,
        active: true,
        navLink: true,
        deletable: false,
        editable: true,
        childOrder: [],
      },
      rows: [],
    },
    item: {
      page: {
        name: 'Item',
        type: 'item',
        active: true,
        navLink: true,
        deletable: false,
        editable: true,
        childOrder: ['4'],
      },
      rows: [
        {
          id: '4',
          style: '{"display":"flex"}',
          pageId: '',
          addRows: false,
          addFields: false,
          childOrder: ['Z', 'Y', 'X'],
        },
      ],
      fields: [
        {
          id: 'X',
          name: 'name',
          rowId: '4',
          style:
            '{"width": "l", "min-height":"240px", "margin-vertical":"8px","display":"flex"}',
          type: 'plainText',
          value: 'name',
          pageId: '',
          itemProp: 'name',
        },
        {
          id: 'Y',
          name: 'description',
          rowId: '4',
          pageId: '',
          style:
            '{"width": "xl", "min-height":"240px", "margin-vertical":"8px","display":"flex"}',
          type: 'richText',
          value: 'description',
          itemProp: 'description',
        },
        {
          id: 'Z',
          name: 'media',
          rowId: '4',
          pageId: '',
          style:
            '{"width": "xl", "min-height":"240px", "margin-vertical":"8px","display":"flex"}',
          type: 'mediaGallery',
          value: '',
          itemProp: 'media',
        },
      ],
    },
    nav: {
      page: {
        name: 'nav',
        type: 'nav',
        active: true,
        navLink: false,
        deletable: false,
        editable: false,
        childOrder: ['5'],
      },
      rows: [
        {
          id: '5',
          style: '',
          pageId: '',
          addRows: false,
          addFields: true,
          childOrder: [],
        },
      ],
    },
    footer: {
      page: {
        name: 'footer',
        type: 'footer',
        active: true,
        navLink: false,
        deletable: false,
        editable: false,
        childOrder: ['6'],
      },
      rows: [
        {
          id: '6',
          style: '',
          pageId: '',
          addRows: false,
          addFields: true,
          childOrder: [],
        },
      ],
    },
    globalStyles: {
      page: {
        name: 'globalStyles',
        type: 'style',
        active: true,
        navLink: false,
        deletable: false,
        editable: false,
        childOrder: [],
      },
    },
  },
};
