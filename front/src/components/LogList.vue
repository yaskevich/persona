<template>

  <el-row type="flex" justify="center">
    <h3>
      {{loc('userlog')}}
    </h3>
  </el-row>

  <el-row v-for="(value, key) in data.logs" :gutter="20" :key="key">
    <el-col :span="6">
      <div class="grid-content bg-purple-light">
        {{data.users[value.user_id]["firstname"] + ' ' + data.users[value.user_id]["lastname"]}}
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content bg-purple">
        {{store.dateToString(value.created)}}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content bg-purple">
        {{loc(value.table_name)}}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content bg-purple">
        {{store.classify(value)}}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content">
        <router-link :to="'/log/' + value.id">
          <el-button type="primary" icon="el-icon-search" circle></el-button>
        </router-link>
      </div>
    </el-col>
  </el-row>

</template>

<script lang="ts">

  import { defineComponent, reactive, onBeforeMount } from 'vue';
  import store from '../store';

  export default defineComponent({
    setup() {
      const data = reactive({ users: [], logs: [] });

      onBeforeMount(async () => {
        await store.getDataMulti(data, {"users": "id"}, {"logs": "id"});
      });

      return { data, store, loc: store.loc };
    },
  });

</script>
