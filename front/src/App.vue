<template>

  <div id="main" v-if="dataReady">
    <div v-if="loggedIn">
      <el-container>
        <el-aside width="210px" style="overflow-y: hidden;" >
          <el-menu @select="selMenu" :collapse="false" class="el-menu-vertical-demo">
            <el-submenu v-for="(v, k) in menuScheme" :index="String(k)" :key="k">
              <template #title><i :class="v.icon"></i><span>{{v.title}}</span></template>
              <el-menu-item v-for="(value, key) in v.data" :index="key" :key="key">{{value}}</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-container>
          <el-header >
            <el-dropdown>
              <i class="el-icon-s-custom"></i>
              <span class="username">{{state.user.firstname}}</span>
              <template #dropdown>
                 <el-dropdown-menu>
                    <el-dropdown-item @click="goToProfile">
                       Профиль
                    </el-dropdown-item>
                    <el-dropdown-item @click="callLogout">Выйти</el-dropdown-item>
                 </el-dropdown-menu>
              </template>
            </el-dropdown>

          </el-header>
          <el-main>
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </div>
    <div v-else style="margin-top:4rem;">
      <div>Авторизация пользователя</div>
      <Login/>
      <el-divider><i class="el-icon-star-on"></i></el-divider>
      <div>или</div>
      <h2>Регистрация новой учетной записи</h2>
      <Profile/>
    </div>
  </div>
  <div v-else>
    <!-- {{$config.locale.loading}} -->
    загрузка...
  </div>

</template>

<script lang="ts">
// import { defineComponent, onBeforeMount, ref, onMounted, onUnmounted, computed, } from 'vue'
import { defineComponent, onBeforeMount, ref, computed, } from 'vue'
import router from './router'
import store from './store'
import Login from './components/Login.vue'
import Profile from './components/Profile.vue'

export default defineComponent({
  name: 'App',
  setup() {
    // const windowWidth = ref(window.innerWidth);
    // const onWidthChange = () => windowWidth.value = window.innerWidth;
    // onMounted(() => window.addEventListener('resize', onWidthChange));
    // onUnmounted(() => window.removeEventListener('resize', onWidthChange));
    const dataReady = ref(false);
    const menuScheme = [
      {
        title: 'Контент',
        icon: 'el-icon-message',
        data: {
          '': 'Обзор',
          facts: 'Факты',
          persons: 'Персоналии',
          works: 'Произведения',
          books: 'Издания',
          acts: 'Деятельность',
          refs: 'Библиография',
        }
      },
      {
        title: 'Настройки',
        icon: 'el-icon-setting',
        data: {
          users: 'Пользователи',
          logs: 'Действия',
          settings: 'Проект'
        }
      }
    ];

    onBeforeMount(async () => {
      await store.getUser()
      dataReady.value = true;
      console.log('app → mounted!')
    });

    console.log('app → setup');


    const callLogout = async () => {
      console.log('performing logout...')
      await store.logout()
    }

    const goToProfile = () => {
      router.push('/profile');
    };

    const selMenu = e => {
      router.push('/' + e)
    };

    // const isCollapsed = computed(() => windowWidth.value < 550 ? true: false);
    // const asidewidth = computed(() => windowWidth.value < 550 ? "50px": "200px");
    const loggedIn = computed(() =>  Object.keys(store?.state?.user).length);

    return {
      // asidewidth,
      // isCollapsed,
      loggedIn,
      goToProfile,
      menuScheme,
      selMenu,
      callLogout,
      dataReady,
      state: store.state,
    }
  },
  components: {
    Login,
    Profile
  }
})
</script>

<style>
  textarea, .el-dropdown-menu__item, .el-select-dropdown__item {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    /* color: #2c3e50; */
    /* margin-top: 60px; */
  }
  .el-header {
    background-color: #b3c0d1;
    color: #333;
    line-height: 60px;
    text-align: right;
    /* font-size: .75rem; */
  }
  .el-aside {
    text-align:left;
  }
  .el-menu-vertical-demo:not(.el-menu--collapse) {
   width: 200px;
   min-height: 400px;
 }
 .username{
   margin-left:5px;
 }
</style>
