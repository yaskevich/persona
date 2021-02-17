import { createWebHistory, createRouter } from 'vue-router';
import Home from './components/Home.vue';
import UserList from './components/UserList.vue';
import PersonList from './components/PersonList.vue';

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
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
