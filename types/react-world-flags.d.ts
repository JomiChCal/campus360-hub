declare module 'react-world-flags' {
  import type { FC } from 'react';

  interface FlagProperties {
    code: string;
    className?: string;
    fallback?: React.ReactNode;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
  }

  const Flag: FC<FlagProperties>;
  export default Flag;
}
