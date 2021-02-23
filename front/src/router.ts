import { createWebHistory, createRouter } from 'vue-router';
import Home from './components/Home.vue';
import UserList from './components/UserList.vue';
import PersonList from './components/PersonList.vue';
import WorkList from './components/WorkList.vue';

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
		path: '/works',
		component: WorkList,
		name: 'WorkList',
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
