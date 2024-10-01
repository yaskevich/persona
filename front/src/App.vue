<template>
  <div id="main" v-if="dataReady">
    <div v-if="loggedIn">
      <el-container>
        <el-aside width="210px" style="overflow-y: hidden;" class="hidden-sm-and-down">
          <el-menu class="el-menu-vertical-demo" :router="true" :default-openeds="['content']"
            :default-active="$router.currentRoute.value.path">
            <el-sub-menu v-for="(v, k) in menuScheme" :index="v.title" :key="k">
              <template #title><i :class="v.icon"></i><span>{{ loc(v.title) }}</span></template>
              <el-menu-item v-for="item in v.data" :index="'/' + item" :key="item">{{ loc(item) }}</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
        <el-container>
          <el-header style="text-align: right;" class="el-header">
            <el-menu :default-active="$router.currentRoute.value.path" class="el-menu-demo" mode="horizontal"
              :ellipsis="false" @select="handleSelect">
              <el-menu-item index="index">
                <img style="height: 50%" src="/android-chrome-192x192.png" alt="Project logo" />
              </el-menu-item>
              <div class="flex-grow" />
              <el-sub-menu index="workspace" class="hidden-md-and-up">

                <template #title>{{ loc('workspace') }}</template>
                <el-menu-item-group v-for="(v, k) in menuScheme" :index="v.title" :key="k">

                  <template #title><i :class="v.icon"></i><span>{{ loc(v.title) }}</span></template>
                  <el-menu-item v-for="item in v.data" :index="'/' + item" :key="item">{{ loc(item) }}</el-menu-item>
                </el-menu-item-group>
              </el-sub-menu>
              <el-sub-menu index="userspace">

                <template #title> <el-icon><el-icon-avatar /></el-icon>
                  {{ state?.user?.firstname }}
                </template>
                <el-menu-item index="/profile"> {{ loc("profile") }}
                </el-menu-item>
                <el-menu-item index="logout"> {{ loc("logout") }}
                </el-menu-item>
              </el-sub-menu>
            </el-menu>
          </el-header>
          <el-main>
            <router-view />
          </el-main>

        </el-container>
      </el-container>
    </div>
    <div v-else style="margin-top:4rem;text-align:center;">
      <div style="max-width:600px;display: inline-block;margin: 0 auto;">

        <el-row type="flex" justify="center">
          <h3>{{ loc('userauth') }}</h3>
        </el-row>

        <Login />

        <el-divider>{{ loc("or") }}</el-divider>
        <h3>{{ loc("userreg") }}</h3>

        <Profile />

      </div>
    </div>
  </div>
  <div v-else>
    {{ loc("loading") }}
  </div>
</template>

<script setup lang="ts">
// import { defineComponent, onBeforeMount, ref, onMounted, onUnmounted, computed, } from 'vue'
import { onBeforeMount, ref, computed } from 'vue';
import router from './router';
import store from './store';
import Login from './components/Login.vue';
import Profile from './components/Profile.vue';
import { useTitle } from 'vue-page-title';
import 'element-plus/theme-chalk/display.css';

const dataReady = ref(false);

// useMeta(computed(() => ({ title: store.state?.user?.settings?.title || '∙' })));
useTitle(computed(() => (store.state?.user?.settings?.title || '∙')));
// const windowWidth = ref(window.innerWidth);
// const onWidthChange = () => windowWidth.value = window.innerWidth;
// onMounted(() => window.addEventListener('resize', onWidthChange));
// onUnmounted(() => window.removeEventListener('resize', onWidthChange));
console.log("here");


const menuScheme = [
  {
    title: 'content',
    icon: 'el-icon-message',
    data: ['home', 'facts', 'persons', 'works', 'books', 'genres', 'acts', 'refs', 'network', 'relations'],
  },
  {
    title: 'admin',
    icon: 'el-icon-setting',
    data: ['users', 'logs', 'settings'],
  },
];

onBeforeMount(async () => {
  await store.getUser();
  dataReady.value = true;
  console.log('app → mounted!');
});

console.log('app → setup');

const callLogout = async () => {
  console.log('performing logout...');
  await store.logoutUser();
};

// const goToProfile = () => {
//   router.push('/profile');
// };

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  if (key === "index") {
    return;
  } else if (key === "logout") {
    callLogout();
  } else {
    router.push(key);
  }
}

// const isCollapsed = computed(() => windowWidth.value < 550 ? true: false);
// const asidewidth = computed(() => windowWidth.value < 550 ? "50px": "200px");
const loggedIn = computed(() => store?.state?.user && Object.keys(store.state.user).length);
const state = store.state;
const loc = store.loc;
</script>

<style>
.flex-grow {
  flex-grow: 1;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
}

#app,
textarea,
.el-dropdown-menu__item,
.el-select-dropdown__item,
.el-popper {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  /* color: #2c3e50;     */
  /* margin-top: 60px; */
}

/* .el-header {
  background-color: #b3c0d1;
  color: #333; 
} */

.el-aside {
  text-align: left;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

/* .username {
  margin-left: 5px;
} */

.text-input {
  width: 10rem;
  margin-right: 1rem;
}

.full-width {
  display: block;
  width: 100%;
}

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
}

/* .bg-purple-dark {
  background: #99a9bf;
}

.bg-purple {
  background: #d3dce6;
}

.bg-purple-light {
  background: #e5e9f2;
} */

/* 
.grid-content {
  border-radius: 4px;
  min-height: 36px;
  min-height: 2rem;
  line-height: 2rem;
  text-align: center;
  padding-left: 10px
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
} */

.el-icon {
  vertical-align: middle;
  margin-bottom: 3px;
}

/* .el-select__selection {
  min-width: 5rem !important;
} */

.wide-select {
  min-width: 12.5rem;
}

.tools {
  margin-top: -10px !important;
}
</style>
