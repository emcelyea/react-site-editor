import Editor, {useEditorFunctions, TextField, ComponentSelector, Draggable, EditorContent} from '../editor';
import React from 'react';
import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('mount-app');
const root = createRoot(domNode);
const testData =  {
    page: {
        id: '1',
        childOrder: ['2']
    },
    containers: [{
        id: '2',
        childOrder: ['3'],
        style: '',
        pageId: '1',
    }],
    fields: [{
        id: '3',
        data: 'dogs',
        style: '',
        type: 'text',
        containerId: '2',
        pageId: '1'
    }]
}
const COMPONENTS = [{
    name: 'Text',
    component: TextField
}]

const ReactSiteEditorTest = () => {
    return (
        <Editor data={testData} onChange={data => console.log(data)} components={COMPONENTS}>
            <Sidebar/>
            <EditorContent/>
        </Editor>
    );
}

// Sidebar utilizes ComponentSelector, an area that has draggable elements that do nothing if not added to DOM area
const Sidebar = () => {
    const {addField, addContainer} = useEditorFunctions();
    return (
        <ComponentSelector>
            <button onClick={addContainer}>Add Container</button>
            <button onClick={() => addField('text')}></button>
        </ComponentSelector>
    );
}

root.render(<ReactSiteEditorTest/>);

