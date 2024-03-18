import { createWebHistory, createRouter } from 'vue-router';

const routes = [
  {
    path: '/relations',
    name: 'RelationList',
    component: () => import('./components/RelationList.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('./components/Profile.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    // component: Settings,
    component: () => import('./components/Settings.vue'),
  },
  {
    path: '/acts',
    name: 'Acts',
    component: () => import('./components/Acts.vue'),
  },
  {
    path: '/refs',
    name: 'Refs',
    component: () => import('./components/References.vue'),
  },
  {
    path: '/facts',
    name: 'FactList',
    // component: FactList,
    component: () => import('./components/FactList.vue'),
  },
  {
    path: '/user/:id',
    // component: User,
    name: 'User',
    component: () => import('./components/User.vue'),
  },
  {
    path: '/users',
    // component: UserList,
    name: 'UserList',
    // props: true
    component: () => import('./components/UserList.vue'),
  },
  {
    path: '/persons',
    // component: PersonList,
    name: 'PersonList',
    component: () => import('./components/PersonList.vue'),
  },
  {
    path: '/person/:id',
    // component: Person,
    name: 'Person',
    component: () => import('./components/Person.vue'),
  },
  {
    path: '/works',
    // component: WorkList,
    name: 'WorkList',
    component: () => import('./components/WorkList.vue'),
  },
  {
    path: '/genres',
    // component: GenreList,
    name: 'GenreList',
    component: () => import('./components/GenreList.vue'),
  },
  {
    path: '/logs',
    // component: LogList,
    name: 'LogList',
    component: () => import('./components/LogList.vue'),
  },
  // {
  // 	path: '/login',
  // 	component: Login,
  // 	name: 'Login',
  // },
  {
    path: '/books',
    // component: BookList,
    name: 'BookList',
    component: () => import('./components/BookList.vue'),
  },
  {
    path: '/work/:id?',
    // component: Work,
    name: 'Work',
    component: () => import('./components/Work.vue'),
  },
  {
    path: '/genre/:id?',
    name: 'Genre',
    component: () => import('./components/Genre.vue'),
  },
  {
    path: '/book/:id?',
    // component: Book,
    name: 'Book',
    component: () => import('./components/Book.vue'),
  },
  {
    path: '/fact/:id?',
    name: 'Fact',
    component: () => import('./components/Fact.vue'),
  },
  {
    path: '/log/:id?',
    // component: Log,
    name: 'Log',
    component: () => import('./components/Log.vue'),
  },
  {
    path: '/',
    alias: ['/home'],
    name: 'Home',
    // component: Home,
    component: () => import('./components/Home.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
