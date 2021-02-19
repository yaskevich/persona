<template>
<div>
  Персоналии
</div>
<el-form label-width="120px" v-model="form" :inline="true">
  <el-form-item
   prop="firstName"
   label="Имя"
   :rules="[
     { required: true, validator: isString, message: 'Обязательное поле', trigger: 'blur' },
     { validator: isString, message: 'Не соответствует формату', trigger: ['blur', 'change'] }
   ]"
 >
  <el-input placeholder="Имя" v-model="form.firstName" class="text-input" propr="firstName"></el-input>
  </el-form-item>

<el-input placeholder="Фамилия" v-model="form.lastName" class="text-input"></el-input>
<el-input placeholder="Фамилия при рождении" v-model="form.lastName2" class="text-input"></el-input>
<el-input placeholder="Отчество" v-model="form.patroName" class="text-input"></el-input>
<el-input placeholder="Wikidata ID" prop="wikidata" v-model="form.wikidata" class="text-input"></el-input>
<!-- <el-form-item label="Пол"> -->
<el-form-item>
  <el-radio-group v-model="form.sex">
    <el-radio label="1">Мужчина</el-radio>
    <el-radio label="2">Женщина</el-radio>
  </el-radio-group>
</el-form-item>
 <el-button type="primary" @click="onSubmit">Добавить</el-button>
</el-form>
</template>

<script>
import { reactive, ref } from 'vue';
import axios from 'axios'
export default {
  name: "PersonList",
  props: {
    // datum: Object,
  },
  setup() {
    const form  = reactive({ firstName: '', lastName: '', lastName2: '', patroName: '', sex: '1', wikidata: ''});

    const isString = (rule, value, callback) => {
      console.log("x", rule);
      const res = form[rule.field].match(/^[а-я]+$/gi);
      console.log("res", form[rule.field], res);
      if(!res) {
        // return  callback(new Error('Please input the password again')) ;
        return false;
      }

    };
    const onSubmit = () => {
      // form.validate();
        console.log('submit!', form);
        axios.get('/').then((response) => {
          console.log(response.data);
        })

    };


    return {form, onSubmit, isString};
  },
  components: {

  }
};
</script>

<style scoped>
.text-input{
  width: 10rem;
  margin-right:1rem;
}
</style>
