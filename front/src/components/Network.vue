<template>
    <el-tooltip v-model:visible="visible"
        :content="`${clickedItem?.firstname} ${clickedItem?.lastname} ${clickedItem?.note || ''}`" placement="bottom"
        effect="light" trigger="click" virtual-triggering :virtual-ref="triggerRef" />
    <div ref="container">
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, onBeforeUnmount, ref, reactive } from 'vue';
import {
    defineGraph,
    defineGraphConfig,
    defineLink,
    defineNodeWithDefaults,
    GraphNode,
    GraphController,
} from 'd3-graph-controller';
import 'd3-graph-controller/default.css';
import store from "../store";

const visible = ref(false)
const triggerRef = ref({
    getBoundingClientRect() {
        return position.value
    },
} as any);

const position = ref({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
});

const mousemoveHandler = (e: MouseEvent) => {
    position.value = DOMRect.fromRect({
        width: 0,
        height: 0,
        x: e.clientX,
        y: e.clientY,
    })
};

onMounted(() => {
    document.addEventListener('mousemove', mousemoveHandler)
});

onUnmounted(() => {
    document.removeEventListener('mousemove', mousemoveHandler)
});

const controller = ref();
const container = ref<HTMLInputElement>();
const data = reactive({ reltypes: {} as { [index: string]: IRelation }, persons: {} as { [index: string]: IPerson } });

const clickedItem = ref<IPerson>();

onBeforeUnmount(() => {
    controller.value.shutdown()
});

onMounted(async () => {

    await store.getDataMulti(data, { reltypes: 'id', persons: 'id' }, {});

    const result = await store.getData("relships");
    // console.log(result.data);
    const nodes = [...new Set(result.data.map((x: IRelship) => [x.member1, x.member2]).flat())];
    const nodesObjects = {} as { [index: string]: GraphNode };
    for (let node of nodes) {
        const handle = String(node);
        const info = data.persons[handle];

        const thisNode = defineNodeWithDefaults({
            type: 'node',
            id: handle,
            label: {
                color: 'black',
                fontSize: '1rem',
                text: info.firstname.charAt(0) + info.lastname.charAt(0),
            },
        });
        nodesObjects[handle] = thisNode;
    }

    const links = [];

    for (let rel of result.data) {
        const link = defineLink({
            source: nodesObjects[rel.member1],
            target: nodesObjects[rel.member2],
            color: data.reltypes?.[rel?.rel_id]?.color || 'gray',
            label: false,
            // label: {
            //     color: 'black',
            //     fontSize: '1rem',
            //     text: rel.rel_id,
            // },
        })
        links.push(link);
    }

    const graph = defineGraph({
        nodes: [...Object.values(nodesObjects)],
        links,
    });

    if (container.value) {
        controller.value = new GraphController(container.value, graph, defineGraphConfig({
            autoResize: true, zoom: {
                initial: 1,
                max: 1,
                min: 1,
            },
            callbacks: {
                nodeClicked: (node: GraphNode) => {
                    clickedItem.value = data.persons[node.id];
                    if (!visible.value) {
                        visible.value = true;
                    }
                },
            },
        }));
    }
});

</script>
