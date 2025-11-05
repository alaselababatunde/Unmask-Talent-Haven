declare module 'react-player' {
  import { Component } from 'react';

  export interface ReactPlayerProps {
    url: string;
    playing?: boolean;
    controls?: boolean;
    width?: string | number;
    height?: string | number;
    className?: string;
    [key: string]: any;
  }

  export default class ReactPlayer extends Component<ReactPlayerProps> {}
}

