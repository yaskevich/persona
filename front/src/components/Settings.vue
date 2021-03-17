<template>
    <el-form label-width="120px" v-model="settings" :inline="true">
      <el-form-item>
      <el-select
          v-model="settings.persona"
          filterable
          placeholder="Основная персона"
          >
          <el-option
            v-for="item in persons"
            :key="item.id"
            :label="item.value"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
     <el-button type="primary" @click="onSubmit">Сохранить</el-button>
    </el-form>
</template>
<script>
import { ref } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
export default {
  name: "Settings",

  setup() {

    let settings = ref({});
    let persons = ref([]);

    onBeforeMount(async() => {
      const personsData = await store.getData("persons");
      persons.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      console.log(persons);

      const result = await store.getData("settings");
      if("data" in result) {
        console.log(result.data);
          settings.value.persona = result.data[0]["persona_id"];
      }
    });

    const onSubmit = async() => {
      // form.validate();
        // console.log('save:', user.value);
        // const result = await store.postData("users", user.value);
        // console.log(result);
    };

    return {onSubmit, settings, persons};
  },
  components: {

  }
};
</script>
