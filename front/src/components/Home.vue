<template>
<div class="box">
 <!-- <h1 class="text-yellow-500 bg-blue-500">{{ msg }}</h1> -->
 <el-button type="primary" @click="count++"> {{ count }} </el-button>
  <!-- <button  class="p-4 bg-gray-600 rounded-full">count is: </button> -->
  Дата:

  <!-- <el-form ref="form" :model="form" label-width="120px"> -->
  <el-form label-width="120px">
  <el-form-item label="Activity name">
    <el-input v-model="form.name"></el-input>
  </el-form-item>
  <el-form-item label="Activity zone">
    <el-select v-model="form.region" placeholder="please select your zone">
      <el-option label="Zone one" value="shanghai"></el-option>
      <el-option label="Zone two" value="beijing"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="Activity time">
    <el-col :span="11">
      <el-date-picker type="date" placeholder="Pick a date" v-model="form.date1" style="width: 100%;"></el-date-picker>
    </el-col>
    <el-col class="line" :span="2">-</el-col>
    <el-col :span="11">
      <el-time-picker placeholder="Pick a time" v-model="form.date2" style="width: 100%;"></el-time-picker>
    </el-col>
  </el-form-item>
  <el-form-item label="Instant delivery">
    <el-switch v-model="form.delivery"></el-switch>
  </el-form-item>
  <el-form-item label="Activity type">
    <el-checkbox-group v-model="form.type">
      <el-checkbox label="Online activities" name="type"></el-checkbox>
      <el-checkbox label="Promotion activities" name="type"></el-checkbox>
      <el-checkbox label="Offline activities" name="type"></el-checkbox>
      <el-checkbox label="Simple brand exposure" name="type"></el-checkbox>
    </el-checkbox-group>
  </el-form-item>
  <el-form-item label="Resources">
    <el-radio-group v-model="form.resource">
      <el-radio label="Sponsor"></el-radio>
      <el-radio label="Venue"></el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="Activity form">
    <el-input type="textarea" v-model="form.desc"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">Create</el-button>
    <el-button>Cancel</el-button>
  </el-form-item>
</el-form>

</div>
</template>

<script lang="ts">
import { ref, defineComponent, reactive } from 'vue'
export default defineComponent({
  name: 'Home',
  props: {
    // msg: {
    //   type: String,
    //   required: true
    // }
  },
  setup: () => {
	const input = ref('');
      const count = ref(0);

      const onSubmit = () => {
        console.log('submit!');
      }

    const useScriptSetup = ref(false);
    const useTsPlugin = ref(false);

	const form = reactive({
          name: 'kek',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        });

    return { count, useScriptSetup, useTsPlugin, input, onSubmit,  form }
  }
})
</script>

<style scoped>


.box {
max-width:400px;
margin:auto;
border: 1px solid red;
}
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
