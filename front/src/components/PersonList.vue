<template>
<div>
  Персоналии
</div>
<!-- ref="formInstance" -->
<el-form label-width="120px" ref="formRef" :model="form" :inline="true" :rules="rules">
  <!-- label="Имя" -->
  <el-form-item prop="firstname">
    <el-input placeholder="Имя" v-model="form.firstname" class="text-input"></el-input>
  </el-form-item>
  <el-form-item prop="patroname">
    <el-input placeholder="Отчество" v-model="form.patroname" class="text-input"></el-input>
  </el-form-item>
  <el-form-item prop="lastname">
    <el-input placeholder="Фамилия" v-model="form.lastname"></el-input>
  </el-form-item>
<!-- <el-input placeholder="Фамилия при рождении" v-model="form.lastName2" class="text-input"></el-input> -->

<el-input placeholder="Wikidata ID" prop="wikidata" v-model="form.wikidata" class="text-input"></el-input>
<!-- <el-form-item label="Пол"> -->
<el-form-item>
  <el-radio-group v-model="form.sex">
    <el-radio label="1">Мужчина</el-radio>
    <el-radio label="2">Женщина</el-radio>
  </el-radio-group>
</el-form-item>
 <el-button type="primary" @click="confirm">Добавить</el-button>
</el-form>

<el-row v-for="(value, key) in persons"  :gutter="20" :key="key">
  <el-col :span="4"><div class="grid-content bg-purple"><i :class="value.sex === 1 ? 'el-icon-male' : 'el-icon-female'"></i> {{value.firstname}}</div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple-light">{{value.patroname}}</div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple">{{value.lastname}}</div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple-light">{{value.wikidata||'&nbsp;'}}</div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple">
    <router-link :to="'/person/' + value.id">
    <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width"></el-button>
  </router-link>
  </div></el-col>
  <el-col :span="4"><div class="grid-content bg-purple-light">
    <!-- <el-button type="primary" @click="confirm">Удалить</el-button> -->
    <el-popconfirm
      title="Точно удалить это к чертям собачьим?"
      confirmButtonText="Ага!"
      cancelButtonText="Нееееет!"
      @confirm="deletePerson(value.id, key)"
    >
    <template #reference>
      <el-button>Удалить</el-button>
      </template>
      </el-popconfirm>

  </div></el-col>
</el-row>
</template>

<script lang="ts">
import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from "../store";


export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const form  = reactive({ firstname: '', lastname: '', patroname: '', sex: '1', wikidata: ''});
    const persons = reactive([]);

    onBeforeMount(async() => {
      const result = await store.getData("persons");
      if("data" in result) {
        persons.push(...result.data);
      }
    });

    // const isString = (rule, value, callback) => {
    //   // console.log("x", rule, value);
    //   const val = form[rule.field];
    //   if(val) {
    //     const res = form[rule.field].match(/^[а-я-]+$/gi);
    //     // console.log("res", form[rule.field], res);
    //     if(!res) {
    //       return  callback(new Error('Не соответствует формату')) ;
    //     }
    //   } else {
    //     return  callback(new Error('Обязательное поле')) ;
    //   }
    // };
    const deletePerson = async(id, key) => {
      const result = await store.deleteById("persons", id);
      // console.log(result);
      if("data" in result && "id" in result.data) {
        console.log("deleted", id);
        persons.splice(key, 1);
      }
    };
    const resetForm = () => {
      formRef.value?.resetFields();
    };
    const confirm = () => {
      formRef.value?.validate(async(valid) => {
        if (valid) {
          console.log("ok send", form);
          const result = await store.postData("persons", form);
          console.log(result);
          if("data" in result && "id" in result.data) {
            persons.unshift({...form});
            console.log("success", persons);
            formRef.value?.resetFields();
          }
        }  else{
          console.log("form not valid");
          return false;
        }
      });
    };

    const  rules = {
      firstname: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
      lastname: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
      patroname: [
        { required: false, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
    };
    return { deletePerson, resetForm, confirm, formRef, form, persons, rules};
  }
});
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
   /* min-height: 36px; */
 }
 .row-bg {
   padding: 10px 0;
   background-color: #f9fafc;
 }
 .full-width{
   display: block;
   width: 100%;
 }
</style>
