<template>

  <el-descriptions class="margin-top" title="Данные в базе" :column="1" border style="max-width: 400px;">
      <template #extra>
        <!-- <el-tag size="medium">Тег</el-tag> -->
         <el-tooltip class="item" effect="dark" content="Версия веб-приложения" placement="left">
           <el-button size="medium">{{version}}</el-button>
        </el-tooltip>
      </template>
      <el-descriptions-item>
        <template #label>
          <i class="el-icon-user"></i>
          Персоналии
        </template>
        {{data.persons}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <i class="el-icon-edit"></i>
          Произведения
        </template>
        {{data.works}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <i class="el-icon-notebook-2"></i>
          Издания
        </template>
        {{data.books}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <i class="el-icon-watch"></i>
          Факты
        </template>
        {{data.facts}}
      </el-descriptions-item>
      <!-- <el-descriptions-item>
        <template #label>
          <i class="el-icon-office-building"></i>
          что-то еще
        </template>
        1234
      </el-descriptions-item> -->
    </el-descriptions>
    <!-- <el-divider></el-divider> -->

</template>

<script lang="ts">

import { reactive, defineComponent, onBeforeMount } from 'vue'
import store from '../store'

export default defineComponent({
  name: 'Home',
  setup: () => {
    const data = reactive({})

    onBeforeMount(async () => {
      const names  = ['persons', 'works', 'books', 'facts'];
      (await Promise.all(names.map(async(x) => store.getData(x)))).forEach((x, i) => data[names[i]] = x.data.length);
    })

    return { data, version: store.version }
  }
})

</script>
