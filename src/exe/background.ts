import { startBackground } from '@/background';
import { getBrowserApi } from '@/browser';

const api = getBrowserApi();
if (api) {
    startBackground(api);
}
