<template>
  <metainfo>
    <template v-slot:title="{ content }">{{ content }}</template>
  </metainfo>

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
    <div v-else style="margin-top:4rem;text-align:center;">
      <div style="max-width:600px;display: inline-block;margin: 0 auto;">
        <el-row type="flex" justify="center">
          <h3>Авторизация пользователя</h3>
        </el-row>
        <Login/>

        <!-- <el-divider><i class="el-icon-star-on"></i></el-divider> -->
        <el-divider>или</el-divider>

        <h3>Регистрация новой учетной записи</h3>
        <Profile/>
      </div>
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
import { useMeta } from 'vue-meta'

export default defineComponent({
  name: 'App',
  setup() {
    useMeta(computed(() => ({ title: store.state?.user?.settings?.title || "∙" })));
    // useMeta({
    //   title: title.value,
    //   htmlAttrs: { lang: ['ru'], amp: true },
      // description: 'The Description',
      // og: {
      //   title: 'Og Title',
      //   description: 'Bla bla',
      //   image: [
      //     'https://picsum.photos/600/400/?image=80',
      //     'https://picsum.photos/600/400/?image=82'
      //   ]
      // },
      // twitter: {
      //   title: 'Twitter Title'
      // },
    // });
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
      console.log('app → mounted!');
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
 #app, textarea, .el-dropdown-menu__item, .el-select-dropdown__item, .el-popper {
     font-family: Avenir, Helvetica, Arial, sans-serif;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
     /* text-align: center; */
    /* color: #2c3e50;     */
    /* margin-top: 60px; */
}
 .el-header {
     background-color: #b3c0d1;
     color: #333;
     line-height: 60px;
     text-align: right;
    /* font-size: .75rem;
     */
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
 .text-input{
     width: 10rem;
     margin-right:1rem;
}
 .full-width{
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
 .bg-purple-dark {
     background: #99a9bf;
}
 .bg-purple {
     background: #d3dce6;
}
 .bg-purple-light {
     background: #e5e9f2;
}
 .grid-content {
     border-radius: 4px;
     /* min-height: 36px; */
     min-height: 2rem;
     line-height: 2rem;
     text-align: center;
}
 .row-bg {
     padding: 10px 0;
     background-color: #f9fafc;
}
</style>
