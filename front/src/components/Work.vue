<template>
  <div>
    Произведения
  </div>
  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules" :inline="true">
    <el-form-item prop="title">
      <el-input placeholder="Название" v-model="form.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="genre">
      <el-input placeholder="Тип" v-model="form.genre" class="text-input"></el-input>
    </el-form-item>

    <el-button type="primary" @click="resetForm">Очистить</el-button>
    <el-button type="primary" @click="confirm">Добавить</el-button>
  </el-form>

  <el-row v-for="(value, key) in works"  :gutter="20" :key="key">
    <el-col :span="12"><div class="grid-content bg-purple">
      {{value.title}}
    </div></el-col>
    <el-col :span="12"><div class="grid-content bg-purple-light">
      {{value.genre}}
    </div></el-col>
  </el-row>
</template>
