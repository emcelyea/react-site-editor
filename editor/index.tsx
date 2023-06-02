import Editor from './Editor';
import EditorContext from './context/EditorContext';
import {ReactSiteEditorProps} from './types';


export default function ReactSiteEditor<T>({data}: ReactSiteEditorProps<T>) {
    
    return (
        <EditorContext data={data}>
            <Editor/>
        </EditorContext>
    );
}