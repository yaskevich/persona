<template>

<el-container style="margin-top:-4rem; border: 1px solid #eee">
  <el-aside width="200px" style="background-color: rgb(238, 241, 246);text-align:left;">
    <el-menu :default-openeds="['1', '3']">
      <el-submenu index="1">
        <template #title><i class="el-icon-message"></i>Всякое</template>
        <!-- <el-menu-item-group>
          <template #title>Group 1</template> -->
          <!-- <div id="nav">
             <router-link to="/">Home</router-link> |
             <router-link to="/about">About</router-link>
         </div>
         <router-view /> -->
          <el-menu-item index="1-1"><router-link to="/">Главная</router-link></el-menu-item>
          <el-menu-item index="1-2"><router-link to="/users">Пользователи</router-link></el-menu-item>
        <!-- </el-menu-item-group> -->
        <!-- <el-menu-item-group title="Group 2">
          <el-menu-item index="1-3">Option 3</el-menu-item>
        </el-menu-item-group> -->
        <!-- <el-submenu index="1-4">
          <template #title>Option4</template>
          <el-menu-item index="1-4-1">Option 4-1</el-menu-item>
        </el-submenu> -->
      </el-submenu>
      <el-submenu index="2">
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
      </el-submenu>
      <el-submenu index="3">
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
      </el-submenu>
    </el-menu>
  </el-aside>

  <el-container>
    <el-header style="text-align: right; font-size: 12px">
      <el-dropdown>
        <i class="el-icon-setting" style="margin-right: 15px"></i>
        <template #dropdown>
          <el-dropdown-menu>
              <el-dropdown-item>View</el-dropdown-item>
              <el-dropdown-item>Add</el-dropdown-item>
              <el-dropdown-item>Delete</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span>Tom</span>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Home from './components/Home.vue';

export default defineComponent({
  name: 'App',
  components: {
    Home
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
  margin-top: 60px;
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
