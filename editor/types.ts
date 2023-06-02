export interface Field<T> {
    id: string;
    data: T; // user defined data type that field holds
    style: string; // style string that is converted to valid css;
    edit?: boolean; // can field be edited
    delete?: boolean; // can field be deleted
    type: string; // types of fields available in an editor defined by consumer
    containerId:string; // parent container
    pageId: string; // parent page
}
// used to trigger intelligent rerenders internally
export interface _Field<T> extends Field<T> {
    rerender: number;
}
export interface FieldUpdate {
    data?: any;
    style?: string;
}

export interface Container {
    id: string;
    childOrder: string[] // order children are displayed in
    style: string; // style string that is converted to valid css;
    appendRows?: boolean; // can add rows below default true
    prependRows?: boolean; // can add rows above default true
    addFields?: boolean; // can add fields default true
    pageId: string;
    containerId?: string;
}

export interface ContainerUpdate {
    childOrder?: string[];
    style?: string;
}

export interface _Container extends Container {
    rerender: number;
}

// Page is the root container
export interface Page {
    id: string;
    childOrder: string[];
}

export interface Update<T> {
    id: string;
    childOrder?: string[];
    data?: T;
    style?: string;
}

export type ReactSiteEditorData<T> = {
    page:Page,
    fields?: Field<T>[],
    containers?: Container[]
}
export type OnChangeData<T> = {
    updated: ReactSiteEditorData<T>,
    change: {
        type: 'create' | 'update' | 'delete',
        target: 'field' | 'container',
        id: string,
        style?: string;
        data?: T,
        childOrder?: string[]
    }
}
export type ReactSiteEditorProps<T> = {
    data: ReactSiteEditorData<T>,
    onChange: (data: OnChangeData<T>) => void;
}