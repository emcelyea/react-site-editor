// import { NestedPopup } from 'components/popup/Popup';
// import Panel from 'components/panel/Panel';
// import { useCollectionSidebarContext } from 'pageComponents/builder/CollectionSidebar';
// import styles from './CollectionField.module.scss';
// import Button from 'components/button/Button';
// import { Checkbox } from 'components/checkbox/Checkbox';
// import Icon from 'components/icon/Icon';
// import { generateCss } from 'components/pageEditor/FieldStyling';
// import Radio from 'components/radio/Radio';
// import ColorPicker from 'templates/inputs/colorPicker/ColorPicker';
import Text from 'components/text/Text';
import Button from 'components/button/Button';
// import Select from 'components/select/Select';
// import Tooltip from 'components/tooltip/Tooltip';
import styles from './CollectionField.module.scss';
type Props = {
  value?: string;
  onChange: (val: string) => void;
};

const collectionTypes = ['List', 'Blocks', 'Panels'];
const CollectionTemplateSelector = ({ value, onChange }: Props) => {
  return (
    <>
      <div className={styles.headerText}>
        <Text noMargin weight="600">
          Collection Templates
        </Text>
      </div>
      {collectionTypes.map((t) => (
        <div
          key={t}
          className={`${styles.templatePreview} ${
            value === t ? styles.templatePreviewSelected : ''
          }`}
        >
          <TemplatePreview name={t} onClick={() => onChange(t)} />
        </div>
      ))}
    </>
  );
};

const TemplatePreview = ({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) => {
  return (
    <Button subtle hollow onClick={onClick}>
      {name}
    </Button>
  );
};
export default CollectionTemplateSelector;
