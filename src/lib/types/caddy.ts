// src/lib/types/caddy.ts
export interface CaddySite {
    handle: {
      handler: string;
      [key: string]: any;
    }[];
    match: {
      host: string[];
    }[];
    terminal: boolean;
  }
  
  export interface CaddyStaticSite extends CaddySite {
    handle: {
      handler: 'file_server';
      root: string;
      index_names?: string[];
      try_files?: string[];
      [key: string]: any;
    }[];
  }
  
  export interface CaddyReverseProxySite extends CaddySite {
    handle: {
      handler: 'reverse_proxy';
      upstreams: { dial: string }[];
      preserve_path_prefix?: boolean;
      strip_prefix?: boolean;
      headers?: { request: Record<string, string> };
      [key: string]: any;
    }[];
  }