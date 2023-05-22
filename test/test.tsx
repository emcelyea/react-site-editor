import Editor from '../editor/index';
import React from 'react';
import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('mount-app');
const root = createRoot(domNode);

root.render(<Editor/>);
