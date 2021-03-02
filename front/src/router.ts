import { createWebHistory, createRouter } from 'vue-router';
import Home from './components/Home.vue';
import UserList from './components/UserList.vue';
import PersonList from './components/PersonList.vue';
import Person from './components/Person.vue';
import WorkList from './components/WorkList.vue';
import BookList from './components/BookList.vue';
import Book from './components/Book.vue';
import LogList from './components/LogList.vue';
import Login from './components/Login.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
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
		path: '/book/:id',
		component: Book,
		name: 'Book',
	},
	{
		path: '/book',
		component: Book,
		name: 'Book',
	},

];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
