import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

export const startLoader = () => NProgress.start();
export const stopLoader = () => NProgress.done();
