<script setup lang="ts">
interface MenuData {
    name: string
    label: string
    active: boolean
}

defineProps<{
    menuData: MenuData[]
}>()

const emit = defineEmits(['menuChange'])

const handleClick = (item: MenuData) => {
    // 父组件的方法'
    emit('menuChange', item.name)
}
</script>

<template>
    <div class="fixed_menu">
        <button
            v-for="(item, index) in menuData"
            :key="index"
            :class="{ active: item.active }"
            @click="handleClick(item)"
        >
            {{ item.label }}
        </button>
    </div>
</template>

<style lang="less" scoped>
.fixed_menu {
    // position: absolute;
    // top: 0;
    // left: 0;
    padding: 10px;
    display: flex;
    // flex-direction: column;
    gap: 10px;

    .active {
        border-color: #646cff;
    }
}
</style>
