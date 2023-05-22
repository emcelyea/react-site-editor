export default function debounce<T>(func: (val: T) => void, timeout = 500) {
    let timer: NodeJS.Timeout;
    return (val: T) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(val);
      }, timeout);
    };
  }
  