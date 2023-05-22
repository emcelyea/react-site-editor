import { getDefaultImageSrc } from 'util/defaultImage';
import ImageField from 'templates/inputs/imageField/ImageField';
import styles from '../PageEditor.module.scss';
import { MediaRead } from 'types/collectorium-types';
export default function ImageBackgroundWrapper({
  id,
  name,
  value,
  preview = false,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  preview?: boolean;
  onChange: (value: { value: string; media: MediaRead }) => void;
}) {
  const imgSrc = `${value || getDefaultImageSrc(id)}`;
  if (preview) {
    return (
      <div style={{ overflow: 'hidden' }}>
        {/\.mp4$|\.mpeg|\.webm/.test(value) ? (
          <video
            id={id}
            autoPlay
            loop
            muted
            style={{ height: '100%', width: '100%' }}
          />
        ) : (
          <img
            src={imgSrc}
            alt={name}
            style={{ width: '100%', height: 'auto' }}
          />
        )}
      </div>
    );
  }
  return (
    <>
      <div className={styles.imageFieldUpload}>
        <ImageField
          noAlternateSizes
          selectColor={false}
          label="Set Image"
          size="sm"
          selectExisting={true}
          type="white"
          onSelect={(value) => {
            if (value?.media)
              onChange({ value: value.media.id, media: value.media });
          }}
        />
      </div>
      <div style={{ overflow: 'hidden', height: '100%', width: '100%' }}>
        {/\.mp4$|\.mpeg|\.webm/.test(value) ? (
          <video
            id={id}
            autoPlay
            loop
            muted
            style={{ height: '100%', width: '100%' }}
          >
            <source src={imgSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={imgSrc}
            alt={name}
            style={{ width: '100%', height: 'auto' }}
          />
        )}
      </div>
    </>
  );
}
