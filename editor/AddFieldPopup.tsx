import { NestedPopup } from 'components/popup/Popup';
import styles from './PageEditor.module.scss';
import Panel from 'components/panel/Panel';
import Text from 'components/text/Text';
import Icon from 'components/icon/Icon';
import Button from 'components/button/Button';
import { ItemRead } from 'types/collectorium-types';
type Props = {
  addField: (type: string, itemProp?: string) => void;
  onClose: () => void;
  onOpen: () => void;
  addRow: () => void;
  item?: ItemRead;
};
export default function FieldStyleEditor({
  onOpen,
  onClose,
  addField,
  addRow,
  item,
}: Props) {
  return (
    <NestedPopup
      onClose={() => {
        onClose();
        return undefined;
      }}
      triggers={['click']}
      placement="bottom-start"
      offsetOptions={{ crossAxis: 40 }}
      renderPopup={() => (
        <Panel padding={16}>
          <div className={styles.editPanel}>
            <Text weight="400" noMargin>
              {item ? 'Item Fields' : 'Add Field'}
            </Text>
            {item ? (
              <div className={styles.fieldList}>
                <div
                  className={styles.field}
                  onClick={() => addField('plainText', 'name')}
                >
                  <Icon icon="font" />
                  <Text noMargin>Item Name</Text>
                </div>
                <div
                  className={styles.field}
                  onClick={() => addField('richText', 'description')}
                >
                  <Icon icon="spell-check" />
                  <Text noMargin>Item Description</Text>
                </div>
                <div
                  className={styles.field}
                  onClick={() => addField('mediaGallery', 'media')}
                >
                  <Icon icon="photo-film" />
                  <Text noMargin>Item Media Gallery</Text>
                </div>
              </div>
            ) : (
              <div className={styles.fieldList}>
                <div className={styles.field} onClick={() => addField('text')}>
                  <Icon icon="font" />
                  <Text noMargin>Text</Text>
                </div>
                <div className={styles.field} onClick={() => addRow()}>
                  <Icon icon="table-columns" />
                  <Text noMargin>Row</Text>
                </div>
                <div
                  className={styles.field}
                  onClick={() => addField('button')}
                >
                  <Icon icon="stop" />
                  <Text noMargin>Button</Text>
                </div>
                <div className={styles.field} onClick={() => addField('image')}>
                  <Icon icon="image" />
                  <Text noMargin>Image</Text>
                </div>
                <div
                  className={styles.field}
                  onClick={() => addField('collection')}
                >
                  <Icon icon="building-columns" />
                  <Text noMargin>Collection</Text>
                </div>
                <div
                  className={styles.field}
                  onClick={() => addField('mediaGallery')}
                >
                  <Icon icon="photo-film" />
                  <Text noMargin>Media Gallery</Text>
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    >
      <div>
        <Button style="white" onClick={onOpen} size="m">
          Add Field
        </Button>
      </div>
    </NestedPopup>
  );
}
