export function host2url({ host }: { host: string }): string {
    if (host.includes('localhost')) {
      return `http://${host}`;
    }
  
    return `https://${host}`;
  }
  