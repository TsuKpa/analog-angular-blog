import { Routes } from '@angular/router';
import NotFoundPage from './pages/404.page';

export default [
  {
    path: '404',
    component: NotFoundPage,
  },
  {
    path: '**', // This is a wildcard route that will match any unmatched URL
    component: NotFoundPage // Directly use the component instead of redirecting
  }
] as Routes;
