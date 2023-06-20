import {
    createContext,
    ReactNode,
    useState,
    useEffect,
    useContext,
    useRef,
  } from 'react';
  import {
     ReactSiteEditorProps,
     _Field, _Container,
     FieldUpdate, ContainerUpdate
  } from '../types';
  import {
    createField,
    createDefaultContainer,
  } from '../util/defaults';


  type EditorContextProviderProps = {
    children: ReactNode
  } & ReactSiteEditorProps;


  interface EditorContextInterface {
    data?: ReactSiteEditorProps['data'];
    addField: (
      pageId: string,
      containerId: string,
      type: string,
      data?: any
    ) => void;
    addContainer: (pageId: string, parentRowId?: string, siblingRowId?: string) => void;
    updateField: (id: string, update: {style?: string; data?: any}) => void;
    updateContainer: (id: string, update: {style?: string; childOrder?: string[]}) => void;
    deleteField: (id: string) => void;
    deleteContainer: (id: string) => void;
    // resetData: (data: ReactSiteEditorProps<T>['data']) => void;
  }
  const EditorContext = createContext<EditorContextInterface>({
    data: undefined,
    addField: () => {},
    addContainer: () => {},
    updateField: () => {},
    updateContainer: () => {},
    deleteField: () => {},
    deleteContainer: () => {},
    // resetData: () => {},
  });
  
  export default function EditorContextProvider({
    children,
    data,
  }: EditorContextProviderProps) {
    // we use a ref to ensure consistency when multiple setStates happen
    const internalData = useRef<ReactSiteEditorProps['data'] | undefined>();
    const internalDataMap = useRef<{[key:string]: _Field | _Container}>();
    const [dataState, setDataState] = useState<ReactSiteEditorProps['data']>();
    const [dataMap, setDataMap] = useState<{[key:string]: _Field | _Container}>();
    useEffect(() => {
      // to prevent rerenders we only draw on initial set of data
      // consumers should use `resetData` if they want to sync a new set of data for some reason
      if (!internalData.current) {
        internalData.current = data;
        setDataState(data);
        // for fast updates we create a map of data
        const map = {};
        map[data.page.id] = data.page;
        data.fields.forEach(f => {
          map[f.id] = {...f, rerender: 0};
        });
        data.containers.forEach(c => {
          map[c.id] = {...c, rerender: 0};
        });
        setDataMap(map);
      }
    }, [data]);
    

    /**
     * ADD FIELD
     */
    function addField(
      pageId: string,
      containerId: string,
      type: string,
      siblingId?: string,
      data?: T
    ) {
      const newField = createField(pageId, containerId, type, data);
      internalDataMap.current[newField.id] = newField;
      let cId = newField.containerId;
      while (cId) {
        let container = internalDataMap.current[cId];
        // insert field at position if this is fields container
        if (cId === newField.containerId && siblingId) {
          let posn = container.childOrder.indexOf(siblingId);
          container.childOrder = [...container.childOrder.slice(0, posn), newField.id, ...container.childOrder.slice(posn)];
        } else if (cId === newField.containerId){
          container.childOrder.push(newField.id);
        }
        // trigger rerender for every parent container
        container.rerender += 1;
        internalDataMap.current[cId] = container;
        // move up to next container
        cId = container.containerId;
      }
      setDataMap(internalDataMap.current);
    }
    /**
     * ADD CONTAINER
     */
    function addContainer(pageId: string, siblingId?: string, containerId?: string) {
      const newContainer = createDefaultContainer(pageId, containerId);
      internalDataMap.current[newContainer.id] = newContainer;
      let cId = containerId || null;
      while (cId) {
        let container = internalDataMap.current[cId];
        // if we are at containers parent || page is containers parent
        // update childOrder of parent
        if (cId === containerId || !containerId) {
          if (siblingId) {
            let posn = container.childOrder.indexOf(siblingId);
            container.childOrder = [...container.childOrder.slice(0, posn), newContainer.id, ...container.childOrder.slice(posn)];
          } else {
            container.childOrder.push(newContainer.id);
          }
        }
        container.rerender += 1;
        internalDataMap.current[container.id] = container;
        cId = container.containerId;
      }
      setDataMap(internalDataMap.current);
    }
  
    /**
     * UPDATE FIELD
     */
    function updateField(
      id: string,
      update: FieldUpdate,
    ) {
      const field = internalDataMap.current[id];
      if (!field) throw new Error(`No field exists for id ${id}`);
      internalDataMap.current[id] = {...field, ...update};
      let cId = field.containerId;
      while (cId) {
        let container = internalDataMap.current[cId];
        container.rerender += 1;
        internalDataMap.current[container.id] = container;
        cId = container.containerId;
      }
      setDataMap(internalDataMap.current);
    }
  
  
    /**
     * UPDATE FIELD
     */
    function updateContainer(
      id: string,
      update: ContainerUpdate,
    ) {   
      const container = internalDataMap.current[id];
      if (!container) throw new Error(`No container exists for id ${id}`);
      internalDataMap.current[id] = {...container, ...update};
      let cId = container.containerId;
      while (cId) {
        let c = internalDataMap.current[cId];
        c.rerender += 1;
        internalDataMap.current[container.id] = c;
        cId = c.containerId;
      }
      setDataMap(internalDataMap.current); 
    }

    /**
     * DELETE FIELD
     */
    function deleteField(
      id: string
    ) {
      const field = internalDataMap.current[id];
      let cId = field.containerId;
      while (cId) {
        let container = internalDataMap.current[cId];
        // remove field if this is fields container
        if (cId === field.containerId ) {
          let posn = container.childOrder.indexOf(id);
          container.childOrder = [...container.childOrder.slice(0, posn), ...container.childOrder.slice(posn + 1)];
        }
        // trigger rerender for every parent container
        container.rerender += 1;
        internalDataMap.current[cId] = container;
        cId = container.containerId;
      }
      setDataMap(internalDataMap.current);
    }

    /**
     * DELETE CONTAINER
     */
    function deleteContainer(
      id: string
    ) {
      const container = internalDataMap.current[id];
      let cId = container.containerId;
      while (cId) {
        let c = internalDataMap.current[cId];
        // remove container if this is fields container
        if (cId === container.containerId ) {
          let posn = c.childOrder.indexOf(id);
          c.childOrder = [...c.childOrder.slice(0, posn), ...c.childOrder.slice(posn + 1)];
        }
        // trigger rerender for every parent container
        c.rerender += 1;
        internalDataMap.current[cId] = c;
        cId = c.containerId;
      }
      setDataMap(internalDataMap.current);
      const deleteAllIds = recursiveDelete(id);
      console.log(`Delete container, all children: ${deleteAllIds}`);
    }

    // follow childOrder tree down in case of delete
    // return array of all ids that need to be deleted when a higher branch deleted
    function recursiveDelete(
      id: string
    ): string[] {
      if (internalDataMap.current[id].hasOwnProperty('data')) {
        return [id];
      } else {
        const r = internalDataMap.current[id] as _Container;
        if (!r?.childOrder || r?.childOrder.length === 0) {
          return [id];
        }
        return Array.prototype.concat.apply(
          [id],
          r?.childOrder?.map((c) => recursiveDelete(c))
        );
      }
    }
  
    return (
      <EditorContext.Provider
        value={{
          data,
          addField,
          addContainer,
          updateField,
          updateContainer,
          deleteField,
          deleteContainer,
        }}
      >
        {children}
      </EditorContext.Provider>
    );
  }
  
  // Pages Hook
  export function useEditorContext() {
    return useContext(EditorContext);
  }
