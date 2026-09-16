import '@/styles/main.scss';
import { bootDashboard } from '@/dashboard';

const root = document.getElementById('app');
if (root) {
    void bootDashboard(root);
}
