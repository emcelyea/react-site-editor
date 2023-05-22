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

export interface Container {
    id: string;
    childOrder: string[] // order children are displayed in
    style: string; // style string that is converted to valid css;
    appendRows?: boolean; // can add rows below default true
    prependRows?: boolean; // can add rows above default true
    addFields?: boolean; // can add fields default true
    pageId?: string;
}

// Page is the root container
export interface Page {
    id: string;
    childOrder: string[];
}

// used to trigger intelligent rerenders internally
export interface _Field<T, N> extends Field<T, N> {
    rerender: number;
    parentContainerId: string;
}

export interface _Container extends Container {
    rerender: number;
    parentContainerId?: string;
}