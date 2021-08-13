import { createWebHistory, createRouter } from 'vue-router';
import Home from './components/Home.vue';
import User from './components/User.vue';
import UserList from './components/UserList.vue';
import PersonList from './components/PersonList.vue';
import Person from './components/Person.vue';
import Work from './components/Work.vue';
import WorkList from './components/WorkList.vue';
import BookList from './components/BookList.vue';
import Book from './components/Book.vue';
import LogList from './components/LogList.vue';
// import Login from './components/Login.vue';
import Settings from './components/Settings.vue';
import FactList from './components/FactList.vue';
import Log from './components/Log.vue';
import GenreList from './components/GenreList.vue';

const routes = [
	{
		path: '/profile',
		name: 'Profile',
		component: () => import('./components/Profile.vue'),
	},
	{
		path: '/settings',
		name: 'Settings',
		component: Settings,
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
		component: FactList,
	},
	{
		path: '/user/:id',
		component: User,
		name: 'User',
	},
	{
		path: '/users',
		component: UserList,
		name: 'UserList',
		// props: true
	},
	{
		path: '/persons',
		component: PersonList,
		name: 'PersonList',
	},
	{
		path: '/person/:id',
		component: Person,
		name: 'Person',
	},
	{
		path: '/works',
		component: WorkList,
		name: 'WorkList',
	},
	{
		path: '/genres',
		component: GenreList,
		name: 'GenreList',
	},
	{
		path: '/logs',
		component: LogList,
		name: 'LogList',
	},
	// {
	// 	path: '/login',
	// 	component: Login,
	// 	name: 'Login',
	// },
	{
		path: '/books',
		component: BookList,
		name: 'BookList',
	},
	{
		path: '/work/:id?',
		component: Work,
		name: 'Work',
	},
	{
		path: '/book/:id?',
		component: Book,
		name: 'Book',
	},
	{
		path: '/fact/:id?',
		name: 'Fact',
		component: () => import('./components/Fact.vue'),
	},
	{
		path: '/log/:id?',
		component: Log,
		name: 'Log',
	},
	{
		path: '/',
		alias: ['/home'],
		name: 'Home',
		component: Home,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
