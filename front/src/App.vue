<template>
<div id="main" v-if="dataReady">
  <div v-if="loggedIn">
<el-container style="border: 1px solid #eee">
  <el-aside width="200px" style="background-color: rgb(238, 241, 246);text-align:left;">
    <el-menu :default-openeds="['1', '3']">
      <el-submenu index="1">
        <template #title><i class="el-icon-message"></i>Управление</template>
        <el-menu-item-group>
          <template #title>Контент</template>

          <!-- <div id="nav">
             <router-link to="/">Home</router-link> |
             <router-link to="/about">About</router-link>
         </div>
         <router-view /> -->
         <router-link to="/">
           <el-menu-item index="1-1">Обзор</el-menu-item>
          </router-link>
         <router-link to="/">
           <el-menu-item index="1-32">Типы</el-menu-item>
          </router-link>
         <router-link to="/">
           <el-menu-item index="1-31">События</el-menu-item>
          </router-link>
          <router-link to="/persons">
            <el-menu-item index="1-7">Персоналии</el-menu-item>
          </router-link>
          <router-link to="/works">
            <el-menu-item index="1-4">Произведения</el-menu-item>
          </router-link>
          <router-link to="/books">
            <el-menu-item index="1-8">Издания</el-menu-item>
          </router-link>
        </el-menu-item-group>
        <el-menu-item-group title="Доступ">
          <router-link to="/users">
            <el-menu-item index="1-20">Пользователи</el-menu-item>
          </router-link>
          <router-link to="/logs">
            <el-menu-item index="1-21">Действия</el-menu-item>
          </router-link>
          <router-link to="/settings">
            <el-menu-item index="1-22">Проект</el-menu-item>
          </router-link>
        </el-menu-item-group>
        <!-- <el-submenu index="1-4">
          <template #title>Option4</template>
          <el-menu-item index="1-4-1">Option 4-1</el-menu-item>
        </el-submenu> -->
      </el-submenu>
      <!-- <el-submenu index="2">
        <template #title><i class="el-icon-menu"></i>Navigator Two</template>
        <el-menu-item-group>
          <template #title>Group 1</template>
          <el-menu-item index="2-1">Option 1</el-menu-item>
          <el-menu-item index="2-2">Option 2</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="Group 2">
          <el-menu-item index="2-3">Option 3</el-menu-item>
        </el-menu-item-group>
        <el-submenu index="2-4">
          <template #title>Option 4</template>
          <el-menu-item index="2-4-1">Option 4-1</el-menu-item>
        </el-submenu>
      </el-submenu> -->
      <!-- <el-submenu index="3">
        <template #title><i class="el-icon-setting"></i>Navigator Three</template>
        <el-menu-item-group>
          <template #title>Group 1</template>
          <el-menu-item index="3-1">Option 1</el-menu-item>
          <el-menu-item index="3-2">Option 2</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="Group 2">
          <el-menu-item index="3-3">Option 3</el-menu-item>
        </el-menu-item-group>
        <el-submenu index="3-4">
          <template #title>Option 4</template>
          <el-menu-item index="3-4-1">Option 4-1</el-menu-item>
        </el-submenu>
      </el-submenu> -->
    </el-menu>
  </el-aside>

  <el-container>
    <el-header style="text-align: right; font-size: 12px">
      <el-dropdown>
        <i class="el-icon-setting" style="margin-right: 15px"></i>
        <template #dropdown>
          <el-dropdown-menu>
              <el-dropdown-item>Профиль</el-dropdown-item>
              <el-dropdown-item @click="callLogout">Выйти</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span>{{state.user.firstname}}</span>
    </el-header>
    <el-main>
      <!-- <div class="common-layout">
      <el-container>
        <el-header>Header</el-header>
        <el-main> -->
          <!-- Main -->
          <router-view />
          <!-- <Home msg="Проект" /> -->
        <!-- </el-main>
      </el-container>
    </div> -->
    </el-main>
  </el-container>
</el-container>
  </div>
  <div v-else>
    Пользователь не авторизован!
    <Login/>
  </div>
</div>
<div v-else>
    <!-- {{$config.locale.loading}} -->
    загрузка...
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue';
// import Home from './components/Home.vue';
// import router from "./router";
import store from "./store";
import Login from './components/Login.vue';

export default defineComponent({
  name: 'App',
  setup() {
     onBeforeMount(async() => {
       await store.getUser();
       // document.title = $primevue.config.locale.hi;
       // if (errors.features && errors.features.value) {
       //     console.log("error", errors.features);
       // }
       dataReady.value = true;
       console.log('app → mounted!')
    })
     console.log("app → setup");
     const dataReady = ref(false);

     const callLogout  = async() => {
        console.log("performing logout...");
        await store.logout();
     };
     // const isAuth =  ref(store.state.user && Object.keys(store.state.user).length);
     // if (!isAuth.value) {
     //   console.log("no user");
     //   // router.replace("/login");
     // }
     // console.log("auth:", store.actions.isAuth());
     return {
       callLogout,
       dataReady,
       state: store.state,
       // isAuth,
     };
    },
    computed: {
      loggedIn() {
        return store.state.user && Object.keys(store.state.user).length;
      }
    },
    components: {
      Login
    }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
.el-header {
    background-color: #B3C0D1;
    color: #333;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
  }
</style>
