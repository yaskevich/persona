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
import Login from './components/Login.vue';
import Settings from './components/Settings.vue';
import Acts from './components/Acts.vue';
import Refs from './components/References.vue';
import FactList from './components/FactList.vue';
import Fact from './components/Fact.vue';
import Log from './components/Log.vue';
import Profile from './components/Profile.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
	},
	{
		path: '/profile',
		name: 'Profile',
		component: Profile,
	},
	{
		path: '/settings',
		name: 'Settings',
		component: Settings,
	},
	{
		path: '/acts',
		name: 'Acts',
		component: Acts,
	},
	{
		path: '/refs',
		name: 'Refs',
		component: Refs,
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
		path: '/logs',
		component: LogList,
		name: 'LogList',
	},
	{
		path: '/login',
		component: Login,
		name: 'Login',
	},
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
		component: Fact,
		name: 'Fact',
	},
	{
		path: '/log/:id?',
		component: Log,
		name: 'Log',
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
