import Editor from '../editor';
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
root.render(<Editor data={testData} onChange={(data) => {
    console.log('GOT CHANGE', data);
}}/>);

