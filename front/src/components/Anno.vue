<template>
    <!-- <h5>{{ arr?.title }}</h5> -->
    <!-- <el-button @click="saveText" type="warning">{{ store.loc('save') }}</el-button> -->
    <el-table :data="arr" border style="width: 100%" v-if="arr?.length">
        <el-table-column prop="form" label="Word" width="180" />
        <el-table-column prop="lemma" label="Lemma" width="180" />
        <el-table-column prop="upos" label="PoS" :filters="tags.map((x: any) => ({ text: x, value: x }))"
            :filter-method="filterTag" filter-placement="bottom-end" />
    </el-table>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onBeforeMount, ref, reactive } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { useRoute } from 'vue-router';
import store from '../store';

const vuerouter = useRoute();
const work = ref({} as IWork);
const arr = ref<Array<ICONLL>>();
const html = ref('');
const id = String(vuerouter.params.id);
const tags = ref();


const filterTag = (value: string, row: ICONLL) => {
    return row.upos === value
}

onBeforeMount(async () => {
    // console.log('router id', id);
    if (id) {
        const { data } = await store.getData('annotation', id);
        if (data) {
            arr.value = data;
            // console.log('this work', arr.value);
            tags.value = [...new Set(data.map((x: any) => x.upos))]
        }
    }
});
</script>
