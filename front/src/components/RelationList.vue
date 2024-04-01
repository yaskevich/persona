<template>
    <MainTitle :title="store.loc('relations')" :callback="() => $router.push('/relation/')"></MainTitle>
    <el-space direction="vertical" alignment="flex-start">
        <el-button :color="value?.color" style="margin: 5px" v-for="(value, key) in rels"
            @click="$router.push('/relation/' + value.id)">
            <!-- <el-icon style="margin-left: 3px; margin-right: 3px;">
                <el-icon-switch v-if="value.bilateral" />
                <el-icon-right v-else />
            </el-icon> -->
            {{ store.renderRelations(value) }}
        </el-button>
    </el-space>
</template>

<script setup lang="ts">

import { ref, onBeforeMount } from 'vue';
import store from '../store';
import MainTitle from './MainTitle.vue';

const rels = ref<Array<IRelation>>();

onBeforeMount(async () => {
    const { data } = await store.getData('reltypes');
    // console.log(data);
    rels.value = data;
});

</script>
