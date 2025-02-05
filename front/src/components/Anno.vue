<template>
    <h5>{{ work?.title }}</h5>
    <!-- <el-button @click="saveText" type="warning">{{ store.loc('save') }}</el-button> -->
    {{ work }}
</template>

<script setup lang="ts">
import { onBeforeUnmount, onBeforeMount, ref, reactive } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { useRoute } from 'vue-router';
import store from '../store';

const vuerouter = useRoute();
const work = ref({} as IWork);
const html = ref('');
const id = String(vuerouter.params.id);


onBeforeMount(async () => {
    // console.log('router id', id);
    if (id) {
        const { data } = await store.getData('annotation', id);
        if (data) {
            work.value = data;
            console.log('this work', work.value);
        }
    }
});
</script>
