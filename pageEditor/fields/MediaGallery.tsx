import { memo } from 'react';
import { ItemRead, MediaRead } from 'types/collectorium-types';
import { mediaFromPath } from 'util/s3Functions';
import AppendScript from 'templates/util/AppendScript';
import ImageField from 'templates/inputs/imageField/ImageField';
import styles from '../PageEditor.module.scss';
import { sortByOrder } from 'util/itemOrdering';
// Media Gallery
export default function MediaGallery({
  id,
  onChange,
  preview = false,
  value = '',
  style = '',
  item,
}: {
  id: string;
  style?: string | null;
  value: string | MediaRead[];
  onChange: (val: { value: string; media?: MediaRead }) => void;
  preview?: boolean;
  item?: ItemRead;
}) {
  let galleryType = 'row';
  let media = Array.isArray(value) ? value : [];
  try {
    if (style) {
      galleryType = JSON.parse(style)?.mediaGalleryStyle;
    }
    if (item) {
      media = sortByOrder<MediaRead>(item.media, item.itemMediaOrder?.order);
    } else if (value && typeof value === 'string' && value.length > 8) {
      media = JSON.parse(value);
      // @ts-ignore
      media = media.map((m) => mediaFromPath(m));
    }
  } catch (e) {
    console.error(e);
  }
  if (preview) {
    return <Gallery fieldId={id} media={media} galleryType={galleryType} />;
  }
  return (
    <>
      <div className={styles.imageFieldUpload}>
        <ImageField
          selectColor={false}
          label="Add Image"
          size="sm"
          itemId={item?.id}
          selectExisting={true}
          type="white"
          onSelect={(val) => {
            try {
              let m = Array.isArray(value) ? value : [];
              if (value && typeof value === 'string' && value.length > 8) {
                m = JSON.parse(value);
              }
              // @ts-ignore
              m.push(val?.media?.path);
              onChange({ value: JSON.stringify(m), media: val.media });
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </div>
      <Gallery
        preview={preview}
        fieldId={id}
        media={media}
        galleryType={galleryType}
      />
    </>
  );
}

function Gallery({
  galleryType,
  fieldId,
  media,
  preview,
}: { galleryType?: string } & GalleryProps) {
  switch (galleryType) {
    case 'row':
      return <RowGallery fieldId={fieldId} media={media} preview={preview} />;
    default:
      return <RowGallery fieldId={fieldId} media={media} preview={preview} />;
  }
}

type GalleryProps = {
  preview?: boolean;
  fieldId: string;
  media: MediaRead[];
};
const RowGallery = memo(
  ({ preview, fieldId, media }: GalleryProps) => {
    return (
      <>
        <div className="item-images-row" id="item-media">
          {media.map((m) => (
            <div className="item-image-wrapper" key={m.path}>
              <a
                href={m.path || ''}
                className="glightbox item-image-link"
                data-gallery={fieldId}
                data-glightbox={`${m.title ? `title: ${m.title}` : ''}; ${
                  m.description ? `description: ${m.description}` : ''
                }`}
                data-media-src={
                  m?.contentType.includes('video')
                    ? m.thumbnailPath || ''
                    : m.smallPath || m.path
                }
                data-media-alt={m.name}
              >
                {m?.contentType.includes('video') && (
                  <div className="play-button" />
                )}
              </a>
              <div className="item-image-overlay" />
            </div>
          ))}
        </div>
        <div dangerouslySetInnerHTML={{ __html: rowGalleryStyle }} />
        <AppendScript
          refresh={media.length}
          script={enableLightboxScript}
          preview={preview}
        />
      </>
    );
  },
  (nextProps, prevProps) => nextProps.media.length === prevProps.media.length
);

const enableLightboxScript = `<script>
// force lazy load of imgs by updating display to block every 50ms
function showImage(anchor, time) {
  return setTimeout(function() {
      var src, alt;
      for (var i = 0; i < anchor.attributes.length; i++) {
          if (anchor.attributes[i].name === 'data-media-src') {
              src = anchor.attributes[i].value;
          }
          if (anchor.attributes[i].name === 'data-media-alt') {
              alt = anchor.attributes[i].value;
          }
      }
      if (src && alt) {
          var image = document.createElement('img');
          image.setAttribute('src', src);
          image.setAttribute('alt', alt);
          image.className = 'item-image-tag-selector';
          anchor.appendChild(image);
      }
  }, time * 50)
}

var imgs = document.getElementsByClassName('item-image-link');
for (var i = 0; i < imgs.length; i++) {
  showImage(imgs[i], i)
}

if (typeof lightbox === 'undefined' && typeof GLightbox === 'undefined') {
  var lightbox = document.createElement('script');
  lightbox.addEventListener('load', () => {
    GLightbox({
      touchNavigation: true,
      loop: true
    });
  });

  lightbox.src = 'https://collectorius.com/glightbox.js';
  document.body.appendChild(lightbox);
} else {
    let pollForLightbox = setInterval(function() {
        if (typeof Glightbox !== 'undefined') {
            GLightbox({
                touchNavigation: true,
                loop: true
            });
            clearInterval(pollForLightbox);
        }
    }, 200);
}
</script>`;

const rowGalleryStyle = `<style>
.item-images{
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
  .item-images-row {
    width: 92%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
  }
  .item-image-wrapper {
    height: 200px;
    line-height: 200px;
    width: 280px;
    margin: 8px;
    overflow: hidden;
    position: relative;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 0 8px 2px rgb(255,255,255,.2);
  }
  .play-button {
      position: absolute;
      top: 64px;
      left: 104px;
      box-sizing: border-box;
      width: 72px;
      height: 72px;
      border-style: solid;
      border-width: 36px 0px 36px 72px;
      border-color: transparent transparent transparent rgba(220,220,220,.9);
  }
  .item-image-wrapper:hover img {
    transform: translate3d(0,0,0);
  }
  
  .item-image-link {
    display: block;
    width: 100%;
    height: auto;
    position: relative;
    overflow: hidden;
  }
  .item-image-wrapper img {
    width: calc(100% + 50px);
    max-width: calc(100% + 50px);
    transform: translate3d(-40px, 0, 0);
    transition-duration: 0.35s;
    background: #aaa;
  }
  .item-image-wrapper:hover .item-image-overlay {
    transition: opacity 0.5s;
    opacity: 1;
  }
  .item-image-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0,0,0,0.25);
    opacity: 0;
    pointer-events:none;
  }
</style>`;
