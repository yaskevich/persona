<template>
  <el-descriptions class="margin-top" :title="store.texts['dbevent'][store.state.lang]" :column="2" border>
      <el-descriptions-item>
        <template #label>
          <i class="el-icon-user"></i>
          {{store.texts['user'][store.state.lang]}}
        </template>
        {{user["firstname"] + ' ' + user["lastname"]}}
      </el-descriptions-item>

      <el-descriptions-item>
        <template #label>
          <i class="el-icon-mobile-phone"></i>
          {{store.texts['event'][store.state.lang]}}
        </template>
        {{store.classify(record)}}
      </el-descriptions-item>

      <!-- <el-descriptions-item>
        <template #label>
          <i class="el-icon-location-outline"></i>
          Place
        </template>
        Suzhou
      </el-descriptions-item> -->

      <el-descriptions-item>
        <template #label>
          <i class="el-icon-tickets"></i>
          {{store.texts['datatype'][store.state.lang]}}
        </template>
        <el-tag>
          {{store.texts?.[record.table_name]?.[store.state.lang]}}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item>
        <template #label>
          <i class="el-icon-office-building"></i>
        {{store.texts['dateandtime'][store.state.lang]}}
        </template>
        {{store.dateToString(record.created)}}
      </el-descriptions-item>

    </el-descriptions>


<h3 class="el-descriptions__title" style="margin-top:2rem;">
  {{store.texts['data'][store.state.lang]}}
</h3>
<hr/>
<el-row  :gutter="20">
  <el-col :span="8">
    <div class="grid-content el-descriptions__title bg-purple-light">
      {{store.texts['field'][store.state.lang]}}
    </div>
  </el-col>
  <el-col :span="8">
    <div class="grid-content el-descriptions__title bg-purple">
      {{store.texts['wasbefore'][store.state.lang]}}
    </div>
  </el-col>
  <el-col :span="8">
    <div class="grid-content el-descriptions__title bg-purple-light">
      {{store.texts['becameafter'][store.state.lang]}}
    </div>
  </el-col>
</el-row>
<hr/>
<el-row v-for="(v, k) in keys"  :gutter="20" :key="k">
  <el-col :span="8">
    <div class="grid-content bg-purple-light">
      {{v}}
    </div>
  </el-col>
  <el-col :span="8">
    <div class="grid-content bg-purple">
      {{record?.data0?.[v]}}
    </div>
  </el-col>
  <el-col :span="8">
    <div class="grid-content bg-purple-light">
      {{record?.data1?.[v]}}
    </div>
  </el-col>
</el-row>

</template>
<script>
import { ref } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
import { useRoute } from 'vue-router';

export default {
  name: "Log",
  setup() {
    const user = ref({});
    const record = ref({});
    const vuerouter = useRoute();
    const id = vuerouter.params.id;
    const keys= ref([]);

    onBeforeMount(async() => {
      const resultRecord = await store.getData("logs", id);
      if("data" in resultRecord) {
        console.log(resultRecord.data);
        record.value = resultRecord.data.shift();
        const result = await store.getData("users", record.value.user_id);
        if("data" in result) {
          user.value = result.data[0];
        }

        keys.value  = [...new Set([...Object.keys(record.value.data0||{}), ...Object.keys(record.value.data1||{})])];
      }

    });

    return { user, record, store, keys };
  },
};
</script>

<style scoped>
  .title {
  font-weight:bold;
  }
</style>
