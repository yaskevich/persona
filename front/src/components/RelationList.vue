<template>
    <MainTitle :title="store.loc('relations')" :callback="confirm"></MainTitle>
    <el-space direction="vertical" alignment="flex-start">
        <el-button style="margin: 5px" :type="value.bilateral ? 'primary': 'info'" v-for="(value, key) in rels"
            @click="$router.push('/relation/' + value.id)"> {{ value.name1 }}
            {{ value.bilateral ? '⟺':  '⟹'  }}
            <!-- <el-icon style="margin-left: 3px; margin-right: 3px;">
                <el-icon-switch v-if="value.bilateral" />
                <el-icon-right v-else />
            </el-icon> -->
            {{ value.name2 }}</el-button>
    </el-space>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import store from '../store';
import MainTitle from './MainTitle.vue';

const rels = ref<Array<IRelation>>();

const confirm = () => {
    console.log("ok");
}

onBeforeMount(async () => {
    const { data } = await store.getData('reltypes');
    console.log(data);
    rels.value = data;
});

</script>