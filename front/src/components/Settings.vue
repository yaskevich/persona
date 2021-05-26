<template>
    <MainTitle title="Проект" :callback="confirm" text="Сохранить"></MainTitle>
    <el-form label-width="220px" :model="settings" ref="formRef" :rules="rules">

      <el-form-item label="Основная персона">
      <el-select
          v-model="settings.persona"
          filterable
          placeholder="Персоны"
          >
          <el-option
            v-for="item in persons"
            :key="item.id"
            :label="item.value"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="title" label="Название проекта">
        <el-input placeholder="..." v-model="settings.title" class="text-input"></el-input>
      </el-form-item>

    </el-form>
</template>

<script lang="ts">
import { onBeforeMount, ref } from 'vue';
import store from "../store";
import MainTitle from './MainTitle.vue';

export default {
  name: "Settings",

  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    let settings = ref({});
    let persons = ref([]);

    onBeforeMount(async() => {
      const personsData = await store.getData("persons");
      persons.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      console.log(persons);

      const result = await store.getData("settings");
      if("data" in result) {
        console.log("settings", result.data);
          settings.value = result.data[0];
      }
      console.log("settings", settings.value);
    });


    const confirm = () => {
      formRef.value?.validate(async(valid) => {
        if(valid) {
          console.log('save:', settings.value);
          const result = await store.postData("settings", Object.assign({"id": 1}, settings.value));
          console.log(result);
        } else{
          console.log("form not valid");
          return false;
        }
      });
    };



    const  rules = {
      title: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' }
      ],
    };

    return { confirm, settings, persons, rules, formRef, };
  },
  components: {
    MainTitle,
  }
};
</script>
