<template>
  <!-- <div class="user">
    <h2>№ {{ $route.params.id }}</h2>
  </div> -->
    <el-form label-width="120px" v-model="person" :inline="true">
      <!-- label="Имя" -->
      <el-form-item prop="firstName">
      <el-input placeholder="Имя" v-model="person.firstname" class="text-input" prop="firstName"></el-input>
      </el-form-item>
    <el-input placeholder="Отчество" v-model="person.patroname" class="text-input"></el-input>
    <el-input placeholder="Фамилия" v-model="person.lastname" class="text-input"></el-input>
    <!-- <el-input placeholder="Фамилия при рождении" v-model="form.lastName2" class="text-input"></el-input> -->

    <el-input placeholder="Wikidata ID" prop="wikidata" v-model="person.wikidata" class="text-input"></el-input>
    <!-- <el-form-item label="Пол"> -->
    <el-form-item>
      <el-radio-group v-model="person.sex">
        <el-radio label="1">Мужчина</el-radio>
        <el-radio label="2">Женщина</el-radio>
      </el-radio-group>
    </el-form-item>
     <el-button type="primary" @click="onSubmit">Сохранить</el-button>
    </el-form>
</template>
<script>
import { reactive, ref } from 'vue';
import { onBeforeMount } from 'vue';
import axios from 'axios';

export default {
  name: "Person",
  props: {
    // datum: Object,
  },
  setup() {

    let person = ref({});

    onBeforeMount(async() => {
      axios.get('/api/person/get/1').then((response) => {
        console.log(response.data[0]);
        person.value = response.data[0];
        person.value.sex = person.value.sex.toString();
      })
    })

    const onSubmit = () => {
      // form.validate();
        console.log('submit!', form);
        // axios.get('/api/data').then((response) => {
        //   console.log(response.data);
        // })
        axios.post('/api/person/add', form)
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    };

    console.log("render");
    return {onSubmit, person};
  },
  components: {

  }
};
</script>