<template>
    <h5>{{ work?.title }}</h5>
    <!-- <el-button @click="saveText" type="warning">{{ store.loc('save') }}</el-button> -->
    <el-auto-resizer>
        <template #default="{ height, width }">
            <el-table-v2 :data="arr" :columns="columns" :width="width" :height="height" fixed v-if="arr?.length">
                <!-- <el-table-column prop="form" :label="store.loc('word')" width="180" />
        <el-table-column prop="lemma" :label="store.loc('lemma')" width="180" />
        <el-table-column prop="upos" label="PoS" :filters="tags.map((x: any) => ({ text: x, value: x }))" width="80"
            :filter-method="filterTag" filter-placement="bottom-end">
            <template #default="scope">
                <el-tag type="info" :color="colors[tags.indexOf(scope.row.upos)]" disable-transitions>{{
                    scope.row.upos }}</el-tag>
            </template>
</el-table-column>
<el-table-column prop="feats" :label="store.loc('features')">
    <template #default="scope">
                <el-space v-if="scope?.row?.feats && Object.keys(scope.row.feats)?.length">
                    <el-tooltip v-for="(val, key) in scope.row.feats" class="box-item" effect="dark"
                        :content="String(key)" placement="top-start">
                        <el-tag type="info" disable-transitions>{{ val }}</el-tag>
                    </el-tooltip>
                </el-space>
            </template>
</el-table-column> -->
            </el-table-v2>
        </template>
    </el-auto-resizer>
</template>

<script setup lang="tsx">
import { onBeforeUnmount, onBeforeMount, ref, reactive } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import type { Column } from 'element-plus';
import {
    ElButton,
    ElIcon,
    ElTag,
    ElSpace,
    ElTooltip,
    TableV2FixedDir,
} from 'element-plus';
import { Filter } from '@element-plus/icons-vue';
import type { HeaderCellSlotProps } from 'element-plus';
import { useRoute } from 'vue-router';
import store from '../store';
const colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928', '#FFD70', '#C0C0C0'];

const vuerouter = useRoute();
const work = ref({} as IWork);
const arr = ref<Array<ICONLL>>();
const html = ref('');
const id = String(vuerouter.params.id);
const tags = ref();

const columns: Column<any>[] = [
    { key: 'form', title: store.loc('word'), width: 100, dataKey: 'form' },
    { key: 'lemma', title: store.loc('lemma'), width: 100, dataKey: 'lemma' },
    { key: 'upos', dataKey: 'upos', width: 150, title: 'PoS', cellRenderer: ({ cellData: upos }) => <ElTag disable-transitions color={colors[tags.value.indexOf(upos)]}>{upos} </ElTag>, },
    { key: 'feats', dataKey: 'feats', width: 400, title: 'Features', cellRenderer: ({ cellData: feats }) => feats ? <ElSpace> {Object.entries(feats)?.map((x: any) => <ElTooltip content={x[0]}><ElTag disable-transitions> {x?.[1]} </ElTag></ElTooltip>)} </ElSpace> : '', },
];

const filterTag = (value: string, row: ICONLL) => {
    return row.upos === value
};

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
    if (id) {
        const { data } = await store.getData('works', id);
        work.value = data.shift()
    }
});
</script>
