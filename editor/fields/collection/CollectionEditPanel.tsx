import { NestedPopup } from 'components/popup/Popup';
import Panel from 'components/panel/Panel';
import { useCollectionSidebarContext } from 'pageComponents/builder/CollectionSidebar';
import styles from './CollectionField.module.scss';
import Button from 'components/button/Button';
import { Checkbox } from 'components/checkbox/Checkbox';
import Icon from 'components/icon/Icon';
import CollectionTemplateSelector from './CollectionTemplateSelector';
import ColorPicker from 'templates/inputs/colorPicker/ColorPicker';
import Text from 'components/text/Text';
import Select from 'components/select/Select';
import Tooltip from 'components/tooltip/Tooltip';
import { memo, ReactElement } from 'react';

type Props = {
  children: ReactElement | ReactElement[] | Element | undefined;
  fieldId: string;
  options?: CollectionOptions;
  onChange: (val: string, style?: string) => void;
  onDelete: () => void;
  preview: boolean;
  show?: boolean;
  setEditPanelOpen: (open: boolean) => void;
};

export type CollectionOptions = {
  ['background-color']?: string;
  color?: string;
  width?: string;
  template?: string;
  load?: string;
  search?: string;
  sort?: string;
};
const widths = [
  { name: 'M', value: 'm' },
  { name: 'L', value: 'l' },
  { name: 'XL', value: 'xl' },
];
const CollectionEditPanel = memo(
  ({
    children,
    fieldId,
    options = {},
    onDelete,
    onChange,
    show,
    setEditPanelOpen,
    preview,
  }: Props) => {
    const { setOpen, open } = useCollectionSidebarContext();
    let cssValue = '';
    if (options?.color && options.color.includes('#')) {
      cssValue += `
      .pview #collection-search-input {color:${options.color}; border-bottom:1px solid ${options.color};}
      .pview #collection-sort-input {color:${options.color};}
      .pview .page-numbers {color:${options.color};}`;
    }
    if (
      options['background-color'] &&
      options['background-color'].includes('#')
    ) {
      cssValue += `
      .pview .${fieldId} {background-color:${options['background-color']};}`;
    }
    if (!children) return null;
    return (
      <>
        <span
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{
            __html: `<style>
                  ${cssValue}
                </style>`,
          }}
        />
        {!preview ? (
          <>
            <div
              className={`${styles.editPanelTrigger} ${
                show ? styles.editPanelToggled : ''
              }`}
            >
              <div className={styles.manageCollection}>
                <Button
                  hollow
                  subtle
                  style="white"
                  onClick={() => setOpen(!open)}
                >
                  {open ? 'Close Manage' : 'Manage Collection'}
                </Button>
              </div>
              <NestedPopup
                onClose={() => {
                  setEditPanelOpen(false);
                  return undefined;
                }}
                dismissOptions={{ ancestorScroll: false }}
                triggers={['click']}
                placement="top-start"
                renderPopup={() => (
                  <Panel padding={24}>
                    <div className={styles.headerText}>
                      <Text noMargin weight="600">
                        Collection Options
                      </Text>
                    </div>
                    <div className={styles.collectionEditPanelInputs}>
                      <div className="flex-row flex-center margin-bottom-8">
                        <Checkbox
                          label="Pagination"
                          name="pagination"
                          checked={options.load === 'page-numbers'}
                          onChange={() => {
                            if (options.load === 'page-numbers') {
                              return onChange(
                                JSON.stringify({ ...options, load: 'scroll' })
                              );
                            }
                            onChange(
                              JSON.stringify({
                                ...options,
                                load: 'page-numbers',
                              })
                            );
                          }}
                        />
                        <Tooltip
                          label="Display a certain number of items per page, toggle off to show all your items on a single page"
                          placement="bottom"
                          width="l"
                        >
                          <div className="margin-left-8">
                            <Icon icon="circle-question" size="s" />
                          </div>
                        </Tooltip>
                      </div>
                      <div className="flex-row flex-center margin-bottom-8">
                        <Checkbox
                          name="search"
                          label="Show search input"
                          checked={options.search === 'show'}
                          onChange={() => {
                            if (options.search === 'show') {
                              return onChange(
                                JSON.stringify({ ...options, search: 'hide' })
                              );
                            }
                            onChange(
                              JSON.stringify({
                                ...options,
                                search: 'show',
                              })
                            );
                          }}
                        />{' '}
                        <Tooltip
                          label="Display or hide the search input at the top of your collection"
                          placement="bottom"
                          width="l"
                        >
                          <div className="margin-left-8">
                            <Icon icon="circle-question" size="s" />
                          </div>
                        </Tooltip>
                      </div>
                      <div className="flex-row flex-center margin-bottom-8">
                        <Checkbox
                          name="sort"
                          label="Show sort dropdown"
                          checked={options.sort === 'show'}
                          onChange={() => {
                            if (options.sort === 'show') {
                              return onChange(
                                JSON.stringify({ ...options, sort: 'hide' })
                              );
                            }
                            onChange(
                              JSON.stringify({
                                ...options,
                                sort: 'show',
                              })
                            );
                          }}
                        />
                        <Tooltip
                          label="Display or hide the sort dropdown at the top of your collection"
                          placement="bottom"
                          width="l"
                        >
                          <div className="margin-left-8">
                            <Icon icon="circle-question" size="s" />
                          </div>
                        </Tooltip>
                      </div>
                      <div className={styles.headerText}>
                        <Text noMargin weight="600">
                          Styles
                        </Text>
                      </div>
                      <ColorPicker
                        name="background-color"
                        label="Background Color"
                        onChange={(val, palette) => {
                          const value = palette || val;
                          onChange(
                            JSON.stringify({
                              ...options,
                              'background-color': value,
                            })
                          );
                        }}
                        value={options['background-color']}
                      />
                      <ColorPicker
                        name="color"
                        label="Search/Sort Color"
                        onChange={(val, palette) => {
                          const value = palette || val;
                          onChange(
                            JSON.stringify({
                              ...options,
                              color: value,
                            })
                          );
                        }}
                        value={options.color}
                      />
                      <div className="flex-row flex-center flex-space-between">
                        <Text size="s" noMargin>
                          Width
                        </Text>
                        <Select
                          name="width"
                          options={widths}
                          color="black"
                          onChange={(val) =>
                            onChange(JSON.stringify({ ...options, width: val }))
                          }
                          value={options.width}
                          size="s"
                        />
                      </div>
                      <CollectionTemplateSelector
                        value={options.template}
                        onChange={(val) =>
                          onChange(
                            JSON.stringify({ ...options, template: val })
                          )
                        }
                      />
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
            {children}
          </>
        ) : (
          children
        )}
      </>
    );
  }
);

export default CollectionEditPanel;
