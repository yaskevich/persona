<template>
<div>
  Персоналии
</div>
<el-form label-width="120px" :inline="true">
<el-input placeholder="Имя" v-model="firstName" class="text-input" propr="firstName"></el-input>
<el-input placeholder="Фамилия" v-model="lastName" class="text-input"></el-input>
<el-input placeholder="Фамилия при рождении" v-model="lastName2" class="text-input"></el-input>
<el-input placeholder="Отчество" v-model="partonymicName" class="text-input"></el-input>
<el-input placeholder="Wikidata ID" v-model="wikidataID" class="text-input"></el-input>
<!-- <el-form-item label="Пол"> -->
<el-form-item>
  <el-radio-group v-model="sex">
    <el-radio label="1">Мужчина</el-radio>
    <el-radio label="2">Женщина</el-radio>
  </el-radio-group>
</el-form-item>

</el-form>
</template>

<script>
import { ref } from 'vue';
export default {
  name: "PersonList",
  props: {
    // datum: Object,
  },
  setup() {
    const firstName  = ref('');
    const lastName  = ref('');
    const lastName2  = ref('');
    const partonymicName  = ref('');
    const sex = ref('1');
    const wikidataID = ref('');
    return {firstName, lastName, lastName2, partonymicName, sex, wikidataID,};
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
