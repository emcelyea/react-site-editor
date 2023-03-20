import { ItemRead } from 'types/collectorium-types';
import { getMainImage } from 'util/itemOrdering';
import { SerializePlain } from 'components/richText/serializer';
import { memo, useEffect, useState } from 'react';

export default function Blocks({ items = [] }: { items?: ItemRead[] }) {
  const [decoratedItems, setDecoratedItems] = useState<
    {
      id: string;
      name: string;
      description: string;
      img: string;
    }[]
  >([]);
  useEffect(() => {
    setDecoratedItems(
      items?.map((i: ItemRead) => {
        let plainDescription = '';
        try {
          if (i.description && i.description.nodes) {
            plainDescription = SerializePlain(i.description.nodes);
          }
        } catch (e) {
          console.error(e);
        }
        const truncateDescription = `${plainDescription.slice(0, 120)}...`;
        return {
          name: i.name,
          description: truncateDescription,
          img: getMainImage(i, true),
          id: i.id,
        };
      }) || []
    );
  }, [items]);
  return (
    <div className="collection-item-list">
      {decoratedItems?.map((item) => (
        <ListItem
          key={item.name}
          id={item.id}
          name={item.name}
          description={item.description}
          img={item.img}
        />
      ))}
      {items.length === 0 && <p>No Items In Collection</p>}
    </div>
  );
}
const ListItem = memo(
  ({
    id,
    name,
    description,
    img,
  }: {
    id: string;
    name: string;
    description?: string;
    img: string;
  }) => {
    return (
      <a href={`/item_${id}.html`} id={id} data-item-name={name}>
        <div className="collection-list-item tc-accent-border-color tc-accent-box-shadow-hover ">
          <div
            className="collection-list-item-img tc-background-background-color-contrast"
            style={{
              backgroundImage: `url(${img})`,
            }}
          />
          <div className="collection-list-item-text tc-background-background-color">
            <h3 className="collection-list-item-name tc-textColor-color">
              {name}
            </h3>
            <p className="collection-list-item-description tc-textColor-color">
              {description}
            </p>
          </div>
        </div>
      </a>
    );
  },
  (prevProps, nextProps) => prevProps.name === nextProps.name
);
