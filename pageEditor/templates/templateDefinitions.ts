import { FieldCreate, Page2Create, RowCreate } from 'types/collectorium-types';
import basic from './basic';

const templateList: [
  {
    name: string;
    label: string;
    tooltip: string;
    pages: {
      [key: string]: {
        page: Page2Create;
        rows?: (RowCreate & { id: string })[];
        fields?: (FieldCreate & { id: string })[];
      };
    };
  }
] = [basic];

export default templateList;
