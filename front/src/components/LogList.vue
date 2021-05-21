<template>
  <div style="margin-bottom: 1rem;">
    Журнал действий пользователей
  </div>
  <el-row v-for="(value, key) in logs"  :gutter="20" :key="key">
    <el-col :span="6">
      <div class="grid-content bg-purple-light">
        {{users[value.user_id]["firstname"] + ' ' + users[value.user_id]["lastname"]}}
      </div>
    </el-col>
    <el-col :span="10">
      <div class="grid-content bg-purple">
        {{showDate(value.created)}}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content bg-purple">
        {{value.table_name}}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content">
        <router-link :to="'/log/' + value.id">
        <el-button>{{classify(value)}}</el-button>
        </router-link>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from "../store";

export default defineComponent({
  setup() {
    const users = reactive([]);
    const logs = reactive([]);

    onBeforeMount(async() => {

      const resultUsers = await store.getData("users");
      if("data" in resultUsers) {
        Object.assign(users,
           resultUsers.data
            .reduce((x, y) => { return { ...x, [y["id"]]: y }}, {}));
      }

      const resultLogs = await store.getData("logs");
      if("data" in resultLogs) {
        logs.push(...resultLogs.data.sort((a, b) => b.id.toString().localeCompare(a.id.toString())));
      }

    });

    const classify = (x) => {
      if (x.data1 && Object.keys(x.data1).length){
        return x.data0 && Object.keys(x.data0).length ? "Изменение" : "Создание";
      } else {
        return "Удаление";
      }
    };

    const showDate = (x) => {
      const dt  = new Date(x);
      return dt.toLocaleString('ru-RU');
    }

    return { users, logs, classify, showDate }
  }
})
</script>
