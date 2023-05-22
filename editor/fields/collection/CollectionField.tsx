import ItemBlocks from './ItemBlocks';
import ItemPanels from './ItemPanels';
import ItemList from './ItemList';
import AppendScript from 'templates/util/AppendScript';
import styles from 'components/pageEditor/PageEditor.module.scss';
import { useCollectionContext } from 'contexts/collectionContext';
import { memo, useEffect, useRef, useState } from 'react';
import { sortByOrder } from 'util/itemOrdering';
import { FieldRead, ItemRead } from 'types/collectorium-types';
import { UpdateFieldFunction } from 'components/pageEditor/PageEditor';
import { generateClassName } from 'components/pageEditor/editorUtils';
import CollectionEditPanel, { CollectionOptions } from './CollectionEditPanel';

type Props = {
  field: FieldRead;
  onChange: UpdateFieldFunction;
  preview: boolean;
  onDelete: (
    id: string,
    updates?: { id: string; childOrder?: string[] }[]
  ) => void;
};

// prevent context updates from rendering entire page, just render updated row
function preventRowRerender(
  prevProps: Readonly<Props>,
  nextProps: Readonly<Props>
) {
  if (nextProps.field?.rerender === prevProps.field?.rerender) {
    return true;
  }
  return false;
}
const CollectionField = memo(
  ({ field, onChange, onDelete, preview }: Props) => {
    const { collection } = useCollectionContext();
    const [editPanelOpen, setEditPanelOpen] = useState<boolean>();
    const [referenceHovered, setReferenceHovered] = useState<boolean>();
    const [inOrderItems, setInOrderItems] = useState<ItemRead[]>();
    const [options, setOptions] = useState<CollectionOptions>();
    useEffect(() => {
      if (field.value) {
        try {
          const opts = JSON.parse(field?.value) as CollectionOptions;
          setOptions(opts);
        } catch (e) {
          console.error(e);
        }
      }
    }, [field?.value]);
    useEffect(() => {
      const d = sortByOrder<ItemRead>(
        collection?.items,
        collection?.itemOrder?.order
      );
      setInOrderItems(d);
    }, [collection]);
    const mouseLeaveTimeout = useRef();

    // const changeField = (val: string) => {
    //   const value = val || ' ';
    //   const change = {
    //     type: 'field',
    //     update: { id: field.id, key: 'value', value, previous: field.value },
    //   };
    //   onChange({ id: field.id, value }, change);
    // };

    const styleClasses = generateClassName(field?.value, true);
    const className = `${field.id} ${styles.fieldStylingWrapper} ${
      referenceHovered || editPanelOpen ? styles.fieldStylingHovered : ''
    } ${styleClasses} `;
    return preview ? (
      <div className={className}>
        <div className={`${className} collection-list-wrapper`}>
          <div className="collection-list">
            <div className="collection-list-search">
              <div className="collection-search-input tc-textColor-color">
                {options?.search === 'show' && (
                  <input placeholder="Search" id="collection-search-input" />
                )}
              </div>
              {options?.sort === 'show' && (
                <div className="collection-sort-dropdown">
                  <select id="collection-sort-input" defaultValue="sort">
                    <option value="sort" disabled>
                      Sort
                    </option>
                    <option value="inorder">In Order</option>
                    <option value="alphAsc">A-Z</option>
                    <option value="alphDesc">Z-A</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              {options?.load === 'page-numbers' && (
                <div className="page-numbers" id="page-numbers-top" />
              )}
            </div>

            <div
              id="collection-item-list"
              className="collection-item-list-wrapper"
            >
              {options?.template === 'List' && (
                <ItemList items={inOrderItems} />
              )}
              {options?.template === 'Panels' && (
                <ItemPanels items={inOrderItems} />
              )}
              {options?.template === 'Blocks' && (
                <ItemBlocks items={inOrderItems} />
              )}
            </div>
            <div>
              {options?.load === 'numbers' && (
                <div className="page-numbers" id="page-numbers-bottom" />
              )}
            </div>
          </div>
          <span dangerouslySetInnerHTML={{ __html: styleSheet }} />
          <AppendScript
            script={globalGalleryScript(inOrderItems, options?.template)}
            preview={preview}
          />

          {options?.load === 'numbers' && (
            <AppendScript script={pageNumberScript} preview={preview} />
          )}
          {options?.sort === 'basic' && (
            <AppendScript script={sortItemsScript} preview={preview} />
          )}
          {options?.search && (
            <AppendScript script={searchItemsScript} preview={preview} />
          )}
        </div>
      </div>
    ) : (
      <div
        className={className}
        onMouseEnter={() => {
          if (mouseLeaveTimeout.current) {
            clearTimeout(mouseLeaveTimeout.current);
          }
          setReferenceHovered(true);
        }}
        onMouseLeave={() => {
          //@ts-ignore
          mouseLeaveTimeout.current = setTimeout(
            () => setReferenceHovered(false),
            500
          );
        }}
      >
        <CollectionEditPanel
          options={options}
          fieldId={field.id}
          onChange={(val) => {
            const value = val || ' ';
            const change = {
              type: 'field',
              update: {
                id: field.id,
                key: 'value',
                value,
                previous: field.value,
              },
            };
            onChange({ id: field.id, value }, change);
          }}
          onDelete={() => {
            onDelete(field.id);
          }}
          preview={preview}
          setEditPanelOpen={setEditPanelOpen}
          show={referenceHovered || editPanelOpen}
        >
          <div className="collection-list-wrapper">
            <div className="collection-list">
              <div className="collection-list-search">
                <div className="collection-search-input tc-textColor-color">
                  {options?.search === 'show' && (
                    <input placeholder="Search" id="collection-search-input" />
                  )}
                </div>
                {options?.sort === 'show' && (
                  <div className="collection-sort-dropdown">
                    <select id="collection-sort-input" defaultValue="sort">
                      <option value="sort" disabled>
                        Sort
                      </option>
                      <option value="inorder">In Order</option>
                      <option value="alphAsc">A-Z</option>
                      <option value="alphDesc">Z-A</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                {options?.load === 'page-numbers' && (
                  <div className="page-numbers" id="page-numbers-top" />
                )}
              </div>

              <div
                id="collection-item-list"
                className="collection-item-list-wrapper"
              >
                {options?.template === 'List' && (
                  <ItemList items={inOrderItems} />
                )}
                {options?.template === 'Panels' && (
                  <ItemPanels items={inOrderItems} />
                )}
                {options?.template === 'Blocks' && (
                  <ItemBlocks items={inOrderItems} />
                )}
              </div>
              <div>
                {options?.load === 'page-numbers' && (
                  <div className="page-numbers" id="page-numbers-bottom" />
                )}
              </div>
            </div>
            <span dangerouslySetInnerHTML={{ __html: styleSheet }} />
            {options?.template && (
              <AppendScript
                script={globalGalleryScript(inOrderItems, options?.template)}
                preview={preview}
              />
            )}

            {options?.load === 'page-numbers' && (
              <AppendScript script={pageNumberScript} preview={preview} />
            )}
            {options?.sort === 'show' && (
              <AppendScript script={sortItemsScript} preview={preview} />
            )}
            {options?.search === 'show' && (
              <AppendScript script={searchItemsScript} preview={preview} />
            )}
          </div>
        </CollectionEditPanel>
      </div>
    );
  },
  preventRowRerender
);

function globalGalleryScript(items?: ItemRead[], style?: string) {
  return `<script>
    var globalItems = ${JSON.stringify(items) || '[]'};
    var listStyleClasses = {
      List: 'collection-item-list',
      Panel: 'collection-panels',
      Blocks: 'collection-blocks'
    }
    var globalListStyle = listStyleClasses['${style}'];
    function drawItems() {
      var filteredList = Object.assign(globalItems, {});
      if (typeof searchItems === 'function') {
        filteredList = searchItems(filteredList);
      }
      if (typeof sortItems === 'function') {
        sortItems(filteredList);
      }

      if (typeof paginateItems === 'function') {
        filteredList = paginateItems(filteredList);
      }
      _drawItems(filteredList);
    }
    function _drawItems(items) {
      for (var i = 0; i < globalItems.length; i++) {
        var hideItem = document.getElementById(globalItems[i].id);
        if (hideItem) {
          hideItem.style.display = 'none';
        }
      }
      for (var i = 0; i < items.length; i++) {
        var showItem = document.getElementById(items[i].id);
        if (showItem) {
          showItem.style.display = 'flex';
        }
      }
    }
  </script>`;
}

const searchItemsScript = `<script>
  var searchElement = document.getElementById('collection-search-input');
  if (searchElement) {
    searchElement.addEventListener('input', drawItems);
  }
  function searchItems(list) {
    if (!list) {
      return [];
    }
    var searchTerm = searchElement && searchElement.value.toLowerCase();
    if (!searchTerm) return list;
    var filtered = list.filter(i => {
      var name = i.name.toLowerCase();
      if (name.includes(searchTerm)) return true;
      return false;
    });
    return filtered;
  }
</script>`;

const sortItemsScript = `<script>
    var sortElement = document.getElementById('collection-sort-input');
    if (sortElement) {
      sortElement.addEventListener('input', drawItems);
    }

    function sortItems(list) {
      if (!list || list.length === 0) return;
      var sortType = sortElement.value;
      var sorted = list;
      switch(sortType) {
        case 'alphAsc':
          sorted = list.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
          break;
        case 'alphDesc':
          sorted = list.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
      }
      var lastItem = sorted[sorted.length - 1];
      var lastItemNode = document.getElementById(lastItem.id);
      for ( var i = 0; i < sorted.length - 1; i++) {
        var node = document.getElementById(sorted[i].id);
        lastItemNode.parentNode.insertBefore(node, lastItemNode);
      }
    }
  </script>`;
// paginate items
// takes list of items and breaks it into tens,
const pageNumberScript = `<script>
  var globalCurrentPage = 1;
  drawItems();
  function updatePageNumber(num) {
    return function() {
      globalCurrentPage = num;
      drawItems();
    }
  }
  function drawPageNumbers(pages) {
    var pageNumbersTop = document.getElementById('page-numbers-top');
    var pageNumbersBottom = document.getElementById('page-numbers-bottom');
    
    // remove all pages
    while (pageNumbersTop.firstChild) {
      pageNumbersTop.removeChild(pageNumbersTop.firstChild);
    }
    while(pageNumbersBottom.firstChild) {
      pageNumbersBottom.removeChild(pageNumbersBottom.firstChild);
    }
    for (var i = 0; i < pages; i++) {
      var pageNumber = i + 1;

      var numberTop = document.createElement('div');
      numberTop.className = pageNumber === globalCurrentPage ? 'page-number selected' : 'page-number';
      numberTop.innerText = pageNumber;
      numberTop.addEventListener('click', updatePageNumber(pageNumber))

      pageNumbersTop.appendChild(numberTop);
      var numberBottom = document.createElement('div');
      numberBottom.className = pageNumber === globalCurrentPage ? 'page-number selected' : 'page-number';
      numberBottom.innerText = pageNumber;
      numberBottom.addEventListener('click', updatePageNumber(pageNumber));
      pageNumbersBottom.appendChild(numberBottom);
    }
  }

  function paginateItems(list) {
    const pages = Math.ceil(list.length/10);
    if (pages > 0 && globalCurrentPage > pages) {
      globalCurrentPage = pages;
    }
    drawPageNumbers(pages);
    // filter list to current page
    var rangeLow = (globalCurrentPage - 1) * 10;
    var rangeHigh = rangeLow + 10;
    var pageList = []
    for (var i = 0; i < list.length; i++) {
      if (i >= rangeLow && i < rangeHigh) {
        pageList.push(list[i])
      }
    }
    return pageList;
  }

  </script>`;

const styleSheet = `
<style>
.collection-list-wrapper {
  display: flex;
  justify-content: center;
  position: relative;
  margin-bottom: 48px;
  flex-grow: 1;
}

.item-displays {
}
.collection-list {
  display: flex;
  flex-direction: column;
  width: 92%;
  min-height: 520px;
}
.collection-list a {
  text-decoration: none;
}
.collection-item-list {
  display: flex;
  flex-direction: column;
}
.collection-list-item:hover {
  box-shadow: 0px 2px 13px 0px rgba(0,0,0,0.1);
}

.collection-item-list-wrapper {
  margin: 16px 0 32px;
}
.collection-list-item-name {
  font-size: 24px;
  margin: 0;
  margin-bottom: 4px;
}
.collection-list-item-description {
  font-size: 16px;
  margin: 0;
}
.collection-panels {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.collection-panel-item {
  width: 296px;
  height: 240px;
  margin: 8px 16px;
  overflow:hidden;
  justify-self: center;
  position: relative;
  background: white;
  box-shadow: 2px 2px 8px rgba(0,0,0, .5);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.collection-panel-item:hover {
  box-shadow: 4px 4px 12px rgba(0,0,0,.6);
}
.collection-panel-img {
  width: 100%;
  height: 120px;
  position: absolute;
  top: 0;
}
.collection-panel-name {
  text-align:center;
  font-size: 24px;
  padding: 2px 4px;
  border-radius: 4px;
  position: relative;
}
.collection-panel-description {
  height: 128px;
  padding: 16px 32px;
  color: black;
}
.collection-blocks {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.collection-blocks-item {
  width: 92%;
  height: 168px;
  border: 1px solid;
  margin-bottom: 16px;
  display: flex;
  overflow: hidden;
}
.collection-blocks-item-offset {
  margin-left: 5%;
}
.collection-blocks-img {
  width: 25%;
  margin-right: 2%;
}
.collection-blocks-text {
  width: 73%;
  display: flex;
  flex-direction: column;
}
.collection-blocks-name {
  font-size: 28px;
  margin: 8px 0 4px;
}
.collection-blocks-description {
  margin: 4px;
}
#collection-search-input {
  align-items: center;
  display: flex;
  position:relative;
  margin-bottom: 12px;
}
#collection-search-input::placeholder {
  color: inherit;
}
#collection-search-input, #collection-sort-input {
  padding-top: 16px;
}
.collection-list-search span {
  margin-left: -12px;
  color: #aaa;
  cursor: pointer;
  font-size: 12px;
  height: 20px;
}
.collection-list-search input {
  border:0;
  font-size: 18px;
  margin-bottom: 8px;
  padding: 8px 2px;
  border-bottom: 1px solid #222;
  outline: none;
  background: transparent;
}
.collection-list-search {
  align-items: center;
  justify-content: space-between;
  display: flex;
}
.collection-sort-dropdown select {
  appearance: none;
  background-color: transparent;
  border: none;
  font-family: inherit;
  font-size: 18px;
  width: 108px;
  cursor: pointer;
  line-height: inherit;
  outline: none;
  text-align:right;
  margin-bottom: 12px;
}
.collection-list-item {
  display: flex;
  align-items: center;
  box-sizing: content-box;
  border: 1px solid black;
  width: 100%;
  height:124px;
  max-height: 124px;
  border-radius: 2px;
  margin-top: 4px;
  cursor: pointer;
  overflow: hidden;
}
.collection-list-item-img {
  height: 122px;
  width: 124px;
  background-size: cover;
}
.collection-list-item-text {
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  width: calc(100% - 96px);
  height:124px;
  max-height: 124px;
}
.page-numbers {
  display: flex;
  justify-content: center;
}
.page-number {
  margin: 0 8px;
  cursor: pointer;
  font-size: 20px;
  line-height: 24px;
}
#page-numbers-bottom {
  position: absolute;
  width: 100%;
  bottom: 0;
}
.page-numbers-row {
  display: flex;
  justify-content: center;
}
.page-number.selected {
  text-decoration: underline;
}

@media all and (max-width: 700px) {

  .collection-list-item, .collection-list-item-text {
    height: 148px;
    max-height: 148px;
  }
  .collection-list-item-img {
    height: 146px;
  }
  .collection-panels {
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    grid-gap: 48px 48px;
  }
  .collection-panel-item {
    width: 360px;
  }
}

</style>`;

export default CollectionField;
/**    // var itemsParent = document.getElementById('collection-item-list');
      // itemsParent.removeChild(itemsParent.firstChild);
      // var listWrapper = document.createElement('div');
      // listWrapper.className = globalListStyle;
      // listWrapper.id = 'items-list';
      // for (var i = items.length - 1; i >= 0; i--) {
      //   listWrapper.appendChild(_drawItem(items[i]));
      // }
      // itemsParent.appendChild(listWrapper);
    }
    function _drawItem(item) {
      switch (globalListStyle) {
        case 'panel':
          return _drawItemPanelStyle(item);
        default:
          return _drawItemListStyle(item);
      }
    }

    function _drawItemPanelStyle(item) {
      const itemAnchor = document.createElement('a');
      itemAnchor.id = item.id;
      itemAnchor.setAttribute('data-name', item.name);
      itemAnchor.href = "/item_" + item.id + ".html";
      
      const itemWrapper = document.createElement('div');
      itemWrapper.className = "collection-panel-item";

      const itemImage = document.createElement('div');
      itemImage.className = "collection-panel-img";
      itemImage.style.backgroundSize = "cover";
      itemImage.style.backgroundImage = "url(" + item.imgSrc + ")"
      itemWrapper.appendChild('itemImage');

      const itemName = document.createElement('h3');
      itemName.className = "collection-panel-name";
      itemName.innerText = item.name;
      itemWrapper.appendChild(itemName);

      const itemDescription = document.createElement('p');
      itemDescription.className = "collection-panel-description";
      itemDescription.innerText = item.description;
      itemWrapper.appendChild(itemDescription);
      
      itemAnchor.appendChild(itemWrapper);
      return itemAnchor;
    }

    function _drawItemListStyle(item) {
      const itemAnchor = document.createElement('a');
      itemAnchor.id = item.id;
      itemAnchor.setAttribute('data-name', item.name);
      itemAnchor.href = "/item_" + item.id + ".html";
      
      const itemWrapper = document.createElement('div');
      itemWrapper.className = "collection-list-item";

      const itemImage = document.createElement('div');
      itemImage.className = "collection-list-item-img";
      itemImage.style.backgroundSize = "cover";
      itemImage.style.backgroundImage = "url(" + item.imgSrc + ")"
      itemWrapper.appendChild('itemImage');

      const itemTextWrapper = document.createElement('div');
      itemTextWrapper.className = 'collection-list-item-text';

      const itemName = document.createElement('h3');
      itemName.className = "collection-list-item-name";
      itemName.innerText = item.name;
      itemTextWrapper.appendChild(itemName);

      const itemDescription = document.createElement('p');
      itemDescription.className = "collection-list-item-description";
      itemDescription.innerText = item.description;
      itemTextWrapper.appendChild(itemDescription);
      itemWrapper.appendChild(itemTextWrapper);

      itemAnchor.appendChild(itemWrapper);
      return itemAnchor;
    } */
