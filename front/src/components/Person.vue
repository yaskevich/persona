<template>

  <MainTitle :title="'Персона ' + $route.params.id " :callback="confirm" text="Сохранить"></MainTitle>

  <el-form label-width="120px" v-model="person">
    <!-- label="Имя" -->
    <el-form-item prop="firstname" label="Имя">
      <el-input placeholder="Имя" v-model="person.firstname" class="text-input" prop="firstName"></el-input>
    </el-form-item>
    <el-form-item prop="patroname" label="Отчество">
      <el-input placeholder="Отчество" v-model="person.patroname" class="text-input"></el-input>
    </el-form-item>
    <el-form-item prop="lastname" label="Фамилия">
      <el-input placeholder="Фамилия" v-model="person.lastname" class="text-input"></el-input>
    </el-form-item>
    <!-- <el-input placeholder="Фамилия при рождении" v-model="form.lastName2" class="text-input"></el-input> -->

    <el-form-item prop="wikidata" label="Wikidata ID">
      <el-input placeholder="Wikidata ID" v-model="person.wikidata" class="text-input"></el-input>
    </el-form-item>
    <!-- <el-form-item label="Пол"> -->
    <el-form-item>
      <el-radio-group v-model="person.sex">
        <el-radio label="1">Мужчина</el-radio>
        <el-radio label="2">Женщина</el-radio>
      </el-radio-group>
    </el-form-item>

  </el-form>

</template>
<script>

  import { ref } from 'vue';
  import { onBeforeMount } from 'vue';
  import store from '../store';
  import { useRoute } from 'vue-router';
  import MainTitle from './MainTitle.vue';
  import router from '../router';

  export default {
    name: 'Person',
    props: {
      // datum: Object,
    },
    setup() {
      let person = ref({});
      const vuerouter = useRoute();
      const id = vuerouter.params.id;

      onBeforeMount(async () => {
        const result = await store.getData('persons', id);
        if ('data' in result) {
          person.value = result.data[0];
          person.value.sex = person.value.sex.toString();
        }
      });

      const confirm = async () => {
        // form.validate();
        console.log('save:', person.value);
        const result = await store.postData('persons', person.value);
        console.log(result);
        router.push('/persons');
      };

      return { confirm, person };
    },
    components: {
      MainTitle,
    },
  };

</script>
