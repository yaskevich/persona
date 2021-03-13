<template>
  <!-- <div class="user">
    <h2>№ {{ $route.params.id }}</h2>
  </div> -->
    <el-form label-width="120px" v-model="user" :inline="true">
      <!-- label="Имя" -->
      <el-form-item prop="firstName">
      <el-input placeholder="Имя" v-model="user.firstname" class="text-input" prop="firstName"></el-input>
      </el-form-item>
    <el-input placeholder="Отчество" v-model="user.patroname" class="text-input"></el-input>
    <el-input placeholder="Фамилия" v-model="user.lastname" class="text-input"></el-input>
    <!-- <el-input placeholder="Фамилия при рождении" v-model="form.lastName2" class="text-input"></el-input> -->
    <!-- <el-input placeholder="Wikidata ID" prop="wikidata" v-model="user.wikidata" class="text-input"></el-input> -->
    <!-- <el-form-item label="Пол"> -->
    <el-form-item>
      <el-radio-group v-model="user.sex">
        <el-radio label="1">Мужчина</el-radio>
        <el-radio label="2">Женщина</el-radio>
      </el-radio-group>
    </el-form-item>
     <el-button type="primary" @click="onSubmit">Сохранить</el-button>
    </el-form>
</template>
<script>
import { ref } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
import { useRoute } from 'vue-router';
export default {
  name: "User",
  props: {
    // datum: Object,
  },
  setup() {

    let user = ref({});
    const vuerouter = useRoute();
    const id = vuerouter.params.id;

    onBeforeMount(async() => {
      const result = await store.getData("users", id);
      if("data" in result) {
        user.value = result.data[0];
        user.value.sex = user.value.sex.toString();
      }
    });

    const onSubmit = async() => {
      // form.validate();
        console.log('save:', user.value);
        const result = await store.postData("users", user.value);
        console.log(result);
    };

    return {onSubmit, user};
  },
  components: {

  }
};
</script>
