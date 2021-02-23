<template>
<div>
  Персоналии
</div>
<el-form label-width="120px" v-model="form" :inline="true">
  <!-- label="Имя" -->
  <el-form-item
   prop="firstName"
   :rules="[
     { required: true, validator: isString, trigger: 'blur' },
     { validator: isString, trigger: ['blur', 'change'] }
   ]"
 >
  <el-input placeholder="Имя" v-model="form.firstName" class="text-input" prop="firstName"></el-input>
  </el-form-item>
<el-input placeholder="Отчество" v-model="form.patroName" class="text-input"></el-input>
<el-input placeholder="Фамилия" v-model="form.lastName" class="text-input"></el-input>
<!-- <el-input placeholder="Фамилия при рождении" v-model="form.lastName2" class="text-input"></el-input> -->

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

<el-row v-for="(value, key) in persons"  :gutter="20" :key="key">
  <el-col :span="4"><div class="grid-content bg-purple">{{value.firstname}}</div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple-light">{{value.patroname}}</div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple">{{value.lastname}}</div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple-light">{{value.wikidata}}</div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
  <!-- <el-col :span="4"><div class="grid-content bg-purple-light"></div></el-col> -->
</el-row>
</template>

<script>
import { reactive, ref } from 'vue';
import { onBeforeMount } from 'vue';
import axios from 'axios'
export default {
  name: "PersonList",
  props: {
    // datum: Object,
  },
  setup() {

    const persons = reactive([]);

    onBeforeMount(async() => {
      axios.get('/api/person/list').then((response) => {
        console.log(response.data);
        persons.push(...response.data);
      })

    })



    const form  = reactive({ firstName: '', lastName: '', lastName2: '', patroName: '', sex: '1', wikidata: ''});



    const isString = (rule, value, callback) => {
      // console.log("x", rule, value);
      const val = form[rule.field];
      if(val) {
        const res = form[rule.field].match(/^[а-я\-]+$/gi);
        // console.log("res", form[rule.field], res);
        if(!res) {
          return  callback(new Error('Не соответствует формату')) ;
        }
      } else {
        return  callback(new Error('Обязательное поле')) ;
      }
    };

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
    return {form, onSubmit, isString, persons};
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
.el-row {
   margin-bottom: 20px;
   &:last-child {
     margin-bottom: 0;
   }
 }
 .el-col {
   border-radius: 4px;
 }
 .bg-purple-dark {
   background: #99a9bf;
 }
 .bg-purple {
   background: #d3dce6;
 }
 .bg-purple-light {
   background: #e5e9f2;
 }
 .grid-content {
   border-radius: 4px;
   min-height: 36px;
 }
 .row-bg {
   padding: 10px 0;
   background-color: #f9fafc;
 }
</style>
