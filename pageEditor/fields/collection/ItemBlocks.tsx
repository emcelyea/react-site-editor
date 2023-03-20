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
    <div className="collection-blocks">
      {decoratedItems?.map((item, i) => (
        <BlockItem
          key={item.name}
          id={item.id}
          name={item.name}
          description={item.description}
          img={item.img}
          odd={i % 2 === 1}
        />
      ))}
      {items.length === 0 && <p>No Items In Collection</p>}
    </div>
  );
}
const BlockItem = memo(
  ({
    id,
    name,
    description,
    img,
    odd,
  }: {
    id: string;
    name: string;
    description?: string;
    img: string;
    odd: boolean;
  }) => {
    return (
      <a
        href={`/item_${id}.html`}
        className={`collection-blocks-item tc-accent-border-color tc-accent-box-shadow-hover  ${
          odd ? 'collection-blocks-item-offset' : ''
        }`}
        id={id}
        data-item-name={name}
      >
        <div
          className="collection-blocks-img"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
          }}
        />
        <div className="collection-blocks-text tc-textColor-color tc-textColor-color-hover">
          <h3 className="collection-blocks-name ">{name}</h3>
          <p className="collection-blocks-description">{description}</p>
        </div>
      </a>
    );
  },
  (prevProps, nextProps) => prevProps.name === nextProps.name
);
