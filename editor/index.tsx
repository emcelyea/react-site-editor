import Editor from './Editor';
import TextField from './fields/TextField';
import EditorContext,  {useEditorContext} from './context/EditorContext';
import {ReactSiteEditorProps} from './types';


export default function ReactSiteEditor({data, children, onChange}: ReactSiteEditorProps) {
    
    return (
        <EditorContext data={data} onChange={onChange}>
            {children}
        </EditorContext>
    );
}

export {TextField as TextField};
export {useEditorContext as useEditorFunctions};
export const EditorContent = Editor;
export const ComponentSelector = () => {

}