import { PageWithMap } from 'contexts/pageContext';
import { generateColorClasses } from 'util/deployUtils';

type Props = {
  page: PageWithMap;
  deploy?: boolean;
  preview?: boolean;
};
const webfontLinks: { [key: string]: string } = {
  Roboto: `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,400;0,700;0,900;1,100;1,400;1,700;1,900&display=swap" rel="stylesheet">`,
  'Open Sans': `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,700;0,800;1,300;1,400;1,700&display=swap" rel="stylesheet">`,
  Poppins: `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,300;0,500;0,700;1,100;1,300;1,500;1,700&display=swap" rel="stylesheet">`,
  Raleway: `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,400;0,700;0,900;1,200;1,400;1,700;1,900&display=swap" rel="stylesheet">`,
  'Source Code Pro': `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200;0,400;0,500;0,700;1,200;1,400;1,500;1,700&display=swap" rel="stylesheet">`,
  Urbanist: `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100;0,300;0,400;0,700;1,100;1,300;1,400;1,700&display=swap" rel="stylesheet">`,
  Livvic: `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Livvic:ital,wght@0,100;0,300;0,400;0,700;1,100;1,300;1,400;1,700&display=swap" rel="stylesheet">
    `,
};

const DEFAULT_COLORS: { [key: string]: string } = {
  background: '#ffffff',
  textColor: '#000000',
  accent: '#ab99a8',
  accentText: '#000000',
  linkColor: '#0092e0',
  navBackground: '#ffffff',
  navLinks: '#0092e0',
  navAccent: '#000000',
};
const DEFAULT_FONT = 'Livvic';
function generateDefaultStyles(styles: string | null) {
  let styleSheet = `<style>
    body {
      margin: 0;
      height: 100%;
    }
    .pview {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    .pview div {
      box-sizing: border-box;
    }
  .pview .page-container {
    box-sizing: content-box;
    padding: 16px;
    flex: 1 0 auto;
  }
  .pview span[data-slate-placeholder=true]{
    color: inherit;
  }
  a {
    text-decoration: none;
  }

  .glightbox-mobile .glightbox-clean .gprev {
    top: 47%;
    width: 28px;
    height: 40px;
    left: 8px;
  } 
  .glightbox-mobile .glightbox-clean .gnext {
    top: 47%;
    width: 28px;
    height: 40px;
    right: 8px;
  }
  .width-xs {
    width: 14.5%;
    margin-left: 1%;
    margin-right: 1%;
  }
  .width-s {
    width: 23%;
    margin-left:1%;
    margin-right: 1%;
  }
  .width-m {
    width: 31%;
    margin-left:1%;
    margin-right: 1%;
  }
  .width-l {
    width: 64%;
    margin-left:1%;
    margin-right: 1%;
  }
  .width-xl {
    width: 98%;
    margin-left:1%;
    margin-right: 1%;
  }
  @media all and (max-width: 1000px) {
    .width-xs {
      width: 18%;
    }
    .width-m {
      width: 48%;
      margin-left:1%;
      margin-right: 1%;
    }
  }
  @media all and (max-width: 800px) {
    .width-xs {
      width: 23%;
      margin-left: 1%;
      margin-right: 1%;
    }
    .width-s {
      width: 31%;
      margin-left:1%;
      margin-right: 1%;
    }    
    .width-m {
      width: 48%;
      margin-left:1%;
      margin-right:1%;
    }

    .width-l {
      width: 98%;
      margin-left:1%;
      margin-right: 1%;
    }
  }
  @media all and (max-width: 600px) {
      .width-xs {
        width: 31%;
        margin-left: 1%;
        margin-right: 1%;
      }
      .width-s {
        width: 48%;
        margin-left:1%;
        margin-right:1%;
      }
      .width-m {
        width: 98%;
        margin-left: 1%;
        margin-right: 1%;
      }
      .width-l {
        width: 98%;
        margin-left: 1%;
        margin-right: 1%;
      }
    }
    .height-xxs {
      min-height: auto;
      height: auto;
    }
    .height-xs {
      min-height: 80px;
      height: auto;
    }
    .height-s {
      min-height: 120px;
    }
    .height-m {
      min-height:160px;
    }
    .height-l {
      min-height: 240px;
    }
    .height-xl {
      min-height: 320px;
    }
    .toprow-height-xxs {
      min-height: 64px;
    }
    .toprow-height-xs {
      min-height: 120px;
    }
    .toprow-height-s {
      min-height: 240px;
    }
    .toprow-height-m {
      min-height: 320px;
    }
    .toprow-height-l {
      min-height: 440px;
    }
    .toprow-height-xl {
      min-height: 640px;
    }
  `;

  try {
    let custom: { colors: { [key: string]: string }; font?: string } = {
      colors: {},
    };
    if (styles) {
      custom = JSON.parse(styles);
    }
    Object.keys(DEFAULT_COLORS).forEach((color) => {
      styleSheet += generateColorClasses(
        color,
        custom?.colors[color] || DEFAULT_COLORS[color]
      );
    });
    styleSheet += `.pview {
        background-color: ${
          custom?.colors.background || DEFAULT_COLORS.background
        }
      }`;
    // global apply of palette colors
    styleSheet += `.pview, .pview a,.pview p,.pview h1,.pview h2,.pview h3,.pview h4,.pview h5,.pview h6,.pview label, .pview, .pview input, .pview select, .pview .text-color {color:${
      custom?.colors.textColor || DEFAULT_COLORS.textColor
    }}`;
    styleSheet += `.pview a {color: ${
      custom?.colors.linkColor || DEFAULT_COLORS.linkColor
    }}`;
    const font = custom.font || DEFAULT_FONT;
    if (webfontLinks[font]) {
      styleSheet = webfontLinks[font] + styleSheet;
    }
    styleSheet += `.pview a,.pview p,.pview h1,.pview h2,.pview h3,.pview h4,.pview h5,.pview h6,.pview label, .pview button, .pview span, .pview, .pview input {font-family:${font}}`;
    styleSheet += '</style>';
    return styleSheet;
  } catch (e) {
    console.error(e);
  }
  return '';
}

export default function PageEditor({ page }: Props) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://collectorius.com/glightbox.min.css"
      />
      <span
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{
          __html: generateDefaultStyles(page?.style),
        }}
      />
    </>
  );
}
