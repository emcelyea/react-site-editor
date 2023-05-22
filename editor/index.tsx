import Editor from './Editor';
import {Page, Field, Container} from './types';

type ReactSiteEditorProps<T> = {
    data: {
        page:Page,
        fields?: Field<T>,
        containers?: Container,
    }
}
export default function ReactSiteEditor({data}: ReactSiteEditorProps<string>) {
    
    return <Editor data={data}/>
}