import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

export const echo: any = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY as string,
  cluster: (import.meta.env.VITE_PUSHER_APP_CLUSTER as string) || 'ap1',
  forceTLS: true,
});

export default echo;
