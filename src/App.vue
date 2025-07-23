<template>
  <div id="app-container" class="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 antialiased text-slate-700">
    <div class="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style="min-height: 700px;">
      
      <!-- Header -->
      <header class="p-6 border-b border-slate-200 flex-shrink-0">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-slate-800">{{ currentPlan.title }}</h1>
          <div class="flex items-center space-x-2 text-sm font-medium text-slate-500">
            <span>步驟</span>
            <span class="text-xl font-bold text-emerald-500">{{ currentStep + 1 }}</span>
            <span>/ {{ steps.length }}</span>
          </div>
        </div>
        <div class="mt-4 w-full bg-slate-200 rounded-full h-2.5">
          <div class="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" :style="{ width: progressBarWidth }"></div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow p-8 overflow-y-auto">
        <transition name="page" mode="out-in">
          <div :key="currentStep">
            <!-- Welcome Page -->
            <div v-if="currentStep === 0" class="text-center flex flex-col items-center justify-center h-full">
              <ion-icon name="rocket-outline" class="text-7xl text-emerald-500 mb-4"></ion-icon>
              <h2 class="text-4xl font-bold text-slate-800 mb-4">開啟你的人生藍圖</h2>
              <p class="max-w-2xl text-lg text-slate-500 mb-8">這是一個引導你探索內心、規劃未來的工具。讓我們一起將模糊的夢想，轉化為清晰可行的計畫。</p>
              <button @click="nextStep" class="bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-emerald-600 transition-transform transform hover:scale-105">
                立即開始
              </button>
            </div>

            <!-- Plan Definition & Allocation Pages -->
            <div v-else-if="currentStep > 0 && currentStep < 4">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left: Item Definition & Sorting -->
                <div>
                  <div class="flex items-center mb-4">
                    <ion-icon name="list-outline" class="text-2xl text-slate-500 mr-3"></ion-icon>
                    <h3 class="text-xl font-bold text-slate-800">1. 定義與排序你的目標</h3>
                  </div>
                  <div class="p-4 bg-slate-50 rounded-lg mb-4">
                    <p class="text-sm text-slate-600">{{ currentPlan.instruction_define }}</p>
                  </div>
                  <div class="flex gap-2 mb-4">
                    <input type="text" v-model="currentPlan.newItemText" :placeholder="currentPlan.placeholder" @keyup.enter="addNewItem" class="flex-grow w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition">
                    <button @click="addNewItem" class="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 transition-all flex-shrink-0">+</button>
                  </div>
                  <draggable v-model="currentPlan.items" item-key="id" handle=".handle" ghost-class="sortable-ghost" tag="ul" class="space-y-2">
                    <template #item="{element, index}">
                      <li class="flex items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <div class="handle cursor-grab text-slate-400 hover:text-slate-600 mr-3">
                          <ion-icon name="menu-outline" class="text-xl"></ion-icon>
                        </div>
                        <span class="font-medium text-slate-700 flex-grow">{{ index + 1 }}. {{ element.text }}</span>
                        <button @click="deleteItem(element.id)" class="text-slate-400 hover:text-red-500 transition-colors ml-2">
                          <ion-icon name="trash-outline" class="text-xl"></ion-icon>
                        </button>
                      </li>
                    </template>
                  </draggable>
                  <p v-if="currentPlan.items.length === 0" class="text-center text-slate-500 mt-4 p-4 bg-slate-100 rounded-lg">點擊 '+' 開始新增你的目標吧！</p>
                </div>
                <!-- Right: Time Allocation -->
                <div>
                  <div class="flex items-center mb-4">
                    <ion-icon name="pie-chart-outline" class="text-2xl text-slate-500 mr-3"></ion-icon>
                    <h3 class="text-xl font-bold text-slate-800">2. 分配你的精力</h3>
                  </div>
                  <div class="p-4 bg-slate-50 rounded-lg mb-4">
                    <p class="text-sm text-slate-600">{{ currentPlan.instruction_allocate }}</p>
                  </div>
                  <div class="space-y-4">
                    <div v-for="item in currentPlan.items" :key="item.id" class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <label class="font-medium text-slate-700 block mb-2">{{ item.text }}</label>
                      <div class="flex items-center gap-4">
                        <input type="range" min="0" max="100" step="5" v-model.number="item.percentage" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer">
                        <span class="font-bold text-emerald-600 text-lg w-16 text-right">{{ item.percentage }}%</span>
                      </div>
                    </div>
                    <div class="mt-6 pt-4 border-t-2 border-dashed">
                      <div class="flex justify-between items-center text-xl font-bold">
                        <span class="text-slate-800">總計</span>
                        <span :class="totalPercentage === 100 ? 'text-emerald-500' : 'text-red-500'">{{ totalPercentage }}%</span>
                      </div>
                      <p v-if="totalPercentage !== 100" class="text-right text-sm text-red-500 mt-1">總和必須等於 100% 才能進入下一步</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Summary Page -->
            <div v-if="currentStep === 4" class="text-center flex flex-col items-center justify-center h-full">
              <ion-icon name="checkmark-circle-outline" class="text-7xl text-emerald-500 mb-4"></ion-icon>
              <h2 class="text-4xl font-bold text-slate-800 mb-4">太棒了！你已完成藍圖規劃</h2>
              <p class="max-w-2xl text-lg text-slate-500 mb-8">這份藍圖是你專屬的指南針。請將它儲存好，並時常回顧、調整，讓它引領你航向理想的未來。</p>
              <div class="flex space-x-4">
                <button @click="currentStep = 0" class="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-full hover:bg-slate-300 transition">
                  重新規劃
                </button>
              </div>
            </div>
          </div>
        </transition>
      </main>

      <!-- Footer -->
      <footer class="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center flex-shrink-0">
        <button @click="prevStep" :disabled="currentStep === 0" class="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-6 rounded-full hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
          上一步
        </button>
        <button @click="nextStep" :disabled="isNextDisabled" class="bg-emerald-500 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-emerald-600 transition disabled:opacity-50 disabled:bg-emerald-300 disabled:cursor-not-allowed">
          {{ currentStep === steps.length - 2 ? '完成規劃' : '下一步' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import draggable from 'vuedraggable';

// --- 外部腳本 (Ionicons) ---
const ioniconsScriptModule = document.createElement('script');
ioniconsScriptModule.type = 'module';
ioniconsScriptModule.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js';
document.head.appendChild(ioniconsScriptModule );

const ioniconsScriptNoModule = document.createElement('script');
ioniconsScriptNoModule.noModule = true;
ioniconsScriptNoModule.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js';
document.head.appendChild(ioniconsScriptNoModule );

// --- 專案資料與邏輯 ---
const currentStep = ref(0);
const steps = ref([
    { key: 'welcome', title: '歡迎' },
    { 
        key: 'tenYear', 
        title: '第一步：十年願景',
        instruction_define: '想像十年後，你過著最理想的生活。構成這份生活的關鍵元素是什麼？請一一寫下並排序。',
        instruction_allocate: '如果你的總精力是100%，你會如何分配在這些願景上？這將幫助你釐清它們的相對重要性。',
        placeholder: '例如：健康的身體與心靈',
        newItemText: '',
        items: [
            { id: 1, text: '健康的身體與心靈', percentage: 25 },
            { id: 2, text: '建立穩固的家庭關係', percentage: 25 },
            { id: 3, text: '成為行業內的專家', percentage: 30 },
            { id: 4, text: '財務獨立，有能力幫助他人', percentage: 15 },
            { id: 5, text: '每年至少去一個新國家旅行', percentage: 5 },
        ]
    },
    { 
        key: 'fiveYear', 
        title: '第二步：五年里程碑',
        instruction_define: '為了實現十年願景，五年後的你需要在哪些方面取得關鍵進展？這些是你的中期目標。',
        instruction_allocate: '精力分配將幫助你聚焦在未來五年最重要的任務上。',
        placeholder: '例如：養成每週運動3次的習慣',
        newItemText: '',
        items: []
    },
    { 
        key: 'oneYear', 
        title: '第三步：年度行動計畫',
        instruction_define: '聚焦當下。為了達成五年里程碑，今年你必須完成哪些具體行動？',
        instruction_allocate: '這是你今年的戰鬥地圖。合理的精力分配是成功的關鍵。',
        placeholder: '例如：報名健身房並請教練',
        newItemText: '',
        items: []
    },
    { key: 'summary', title: '總結與展望' }
]);

const currentPlan = computed(() => steps.value[currentStep.value]);
const progressBarWidth = computed(() => `${(currentStep.value / (steps.value.length - 1)) * 100}%`);
const totalPercentage = computed(() => {
    if (currentStep.value === 0 || currentStep.value >= 4) return 100;
    return currentPlan.value.items.reduce((sum, item) => sum + (item.percentage || 0), 0);
});

const isNextDisabled = computed(() => {
    if (currentStep.value === 0) return false;
    if (currentStep.value >= 4) return true;
    const plan = currentPlan.value;
    if (plan.items.length === 0) return true;
    if (totalPercentage.value !== 100) return true;
    return false;
});

function nextStep() {
    if (!isNextDisabled.value && currentStep.value < steps.value.length - 1) {
        currentStep.value++;
    }
}

function prevStep() {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
}

function addNewItem() {
    const plan = currentPlan.value;
    if (plan.newItemText.trim() === '') return;
    plan.items.push({
        id: Date.now(),
        text: plan.newItemText.trim(),
        percentage: 0
    });
    plan.newItemText = '';
}

function deleteItem(id) {
    const plan = currentPlan.value;
    plan.items = plan.items.filter(item => item.id !== id);
}

watch(currentStep, (newStep, oldStep) => {
    if (newStep > oldStep) {
        const sourcePlan = steps.value[oldStep];
        const targetPlan = steps.value[newStep];
        if (targetPlan.items && targetPlan.items.length === 0 && sourcePlan.items && sourcePlan.items.length > 0) {
            targetPlan.items = JSON.parse(JSON.stringify(sourcePlan.items)).map(item => ({...item, percentage: 0}));
        }
    }
});
</script>
