// 全局變量
var currentStep = 0;
var totalSteps = 4;
var planData = {
    vision50: '',
    actionPlan10: '',
    actionPlan5: '',
    actionPlan1: '',
    immediateAction3months: '',
    immediateActionSaved: false,
    priorities: [],
    timeAllocation: {},
    satisfaction: false
};

// 顯示提示訊息
function showToast(message, type) {
    type = type || 'info';
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 更新進度條
function updateProgress() {
    var progress = (currentStep / totalSteps) * 100;
    var progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
}

// 顯示時間警告
function showTimeWarning(total, step) {
    step = step || '10';
    var timeWarning = document.getElementById('timeWarning' + (step === '10' ? '' : step));
    var timeWarningText = document.getElementById('timeWarningText' + (step === '10' ? '' : step));
    
    if (total > 168) {
        if (timeWarningText) {
            timeWarningText.textContent = '你的時間分配已超過一週168小時的限制！目前總計 ' + total + ' 小時，請調整時間分配。';
        }
        if (timeWarning) {
            timeWarning.classList.add('show');
        }
        showToast('⚠️ 時間超過限制！目前 ' + total + ' 小時，請調整至168小時以內', 'error');
    } else {
        if (timeWarning) {
            timeWarning.classList.remove('show');
        }
    }
}

// 編輯優先級項目
function editPriority(btn) {
    var priorityItem = btn.closest('.priority-item');
    var textSpan = priorityItem.querySelector('.priority-text');
    var currentText = textSpan.textContent.trim();
    
    if (priorityItem.querySelector('input')) return;
    
    var input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.cssText = 'flex: 1; padding: 8px; border: 2px solid #667eea; border-radius: 8px; font-size: 1.1rem; font-weight: 600; background: white; font-family: inherit; outline: none;';
    
    var confirmBtn = document.createElement('button');
    confirmBtn.innerHTML = '✅';
    confirmBtn.style.cssText = 'margin-left: 8px; padding: 8px 12px; border: none; background: #48bb78; color: white; border-radius: 6px; cursor: pointer; font-family: inherit;';
    
    var cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '❌';
    cancelBtn.style.cssText = 'margin-left: 5px; padding: 8px 12px; border: none; background: #e74c3c; color: white; border-radius: 6px; cursor: pointer; font-family: inherit;';
    
    textSpan.style.display = 'none';
    btn.style.display = 'none';
    
    textSpan.parentNode.insertBefore(input, textSpan);
    textSpan.parentNode.insertBefore(confirmBtn, textSpan);
    textSpan.parentNode.insertBefore(cancelBtn, textSpan);
    
    input.focus();
    input.select();
    
    function confirmEdit() {
        var newText = input.value.trim();
        if (newText === '' || newText.length > 15) {
            showToast('項目名稱不能為空且不能超過15個字！', 'error');
            return;
        }
        
        var container = priorityItem.parentElement;
        var otherItems = container.querySelectorAll('.priority-text');
        for (var i = 0; i < otherItems.length; i++) {
            if (otherItems[i] !== textSpan && otherItems[i].textContent.trim() === newText) {
                showToast('這個名稱已經存在，請使用不同的名稱！', 'error');
                return;
            }
        }
        
        textSpan.textContent = newText;
        restoreDisplay();
        showToast('編輯成功！', 'success');
        createTimeAllocation();
    }
    
    function cancelEdit() {
        restoreDisplay();
    }
    
    function restoreDisplay() {
        textSpan.style.display = '';
        btn.style.display = '';
        if (input.parentNode) input.remove();
        if (confirmBtn.parentNode) confirmBtn.remove();
        if (cancelBtn.parentNode) cancelBtn.remove();
    }
    
    confirmBtn.addEventListener('click', confirmEdit);
    cancelBtn.addEventListener('click', cancelEdit);
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    });
}

// 刪除優先級項目
function removePriority(btn) {
    var priorityItem = btn.closest('.priority-item');
    var container = priorityItem.parentElement;
    var currentCount = container.querySelectorAll('.priority-item').length;
    
    if (currentCount <= 3) {
        showToast('至少需要保留3個人生領域！', 'error');
        return;
    }
    
    var itemName = priorityItem.querySelector('.priority-text').textContent.trim();
    container.removeChild(priorityItem);
    updatePriorityRanks();
    showToast('已刪除「' + itemName + '」', 'success');
}

// 新增優先級項目
function addNewPriority() {
    // 找到當前活躍步驟的容器
    var activeStep = document.querySelector('.step-card.active');
    if (!activeStep) return;
    
    var container = activeStep.querySelector('.priorities-container');
    if (!container) return;
    
    var currentItems = container.querySelectorAll('.priority-item');
    
    if (currentItems.length >= 10) {
        showToast('最多只能設定10個人生領域！', 'error');
        return;
    }
    
    var newItem = document.createElement('div');
    newItem.className = 'priority-item';
    newItem.innerHTML = '<input type="text" placeholder="輸入新的人生領域名稱..." style="flex: 1; padding: 12px; border: 2px solid #667eea; border-radius: 8px; font-size: 1.1rem; font-weight: 600; font-family: inherit; outline: none;" class="new-item-input">' +
        '<div class="priority-actions">' +
        '<button onclick="confirmNewItem(this)" style="margin-left: 8px; padding: 8px 12px; border: none; background: #48bb78; color: white; border-radius: 6px; cursor: pointer; font-family: inherit;">✅</button>' +
        '<button onclick="cancelNewItem(this)" style="margin-left: 5px; padding: 8px 12px; border: none; background: #e74c3c; color: white; border-radius: 6px; cursor: pointer; font-family: inherit;">❌</button>' +
        '<div class="priority-rank">' + (currentItems.length + 1) + '</div>' +
        '</div>';
    
    var addButton = container.querySelector('.add-priority-btn');
    container.insertBefore(newItem, addButton);
    
    var input = newItem.querySelector('.new-item-input');
    input.focus();
}

// 确认新增项目
function confirmNewItem(btn) {
    var newItem = btn.closest('.priority-item');
    var input = newItem.querySelector('.new-item-input');
    var newText = input.value.trim();
    var container = newItem.parentElement;
    
    if (newText === '') {
        showToast('項目名稱不能為空！', 'error');
        input.focus();
        return;
    }
    
    if (newText.length > 15) {
        showToast('項目名稱請控制在15個字以內！', 'error');
        input.focus();
        return;
    }
    
    var existingItems = container.querySelectorAll('.priority-text');
    for (var i = 0; i < existingItems.length; i++) {
        if (existingItems[i].textContent.trim() === newText) {
            showToast('這個名稱已經存在，請使用不同的名稱！', 'error');
            input.focus();
            return;
        }
    }
    
    var rank = newItem.querySelector('.priority-rank').textContent;
    newItem.innerHTML = '<span class="priority-text">' + newText + '</span>' +
        '<div class="priority-actions">' +
        '<button class="edit-btn" onclick="editPriority(this)">✏️ 編輯</button>' +
        '<button class="cancel-btn" onclick="removePriority(this)">🗑️ 刪除</button>' +
        '<div class="priority-rank">' + rank + '</div>' +
        '</div>';
    newItem.draggable = true;
    
    initializeDragAndDrop();
    
    // 根據當前步驟更新時間分配
    var activeStep = document.querySelector('.step-card.active');
    if (activeStep) {
        var stepId = activeStep.id;
        if (stepId === 'step1') {
            createTimeAllocation('10');
        } else if (stepId === 'step2') {
            createTimeAllocation('5');
        } else if (stepId === 'step3') {
            createTimeAllocation('1');
        }
    }
    
    showToast('已新增「' + newText + '」', 'success');
}

// 取消新增项目
function cancelNewItem(btn) {
    var newItem = btn.closest('.priority-item');
    var container = newItem.parentElement;
    container.removeChild(newItem);
    updatePriorityRanks();
}

// 更新優先級排名
function updatePriorityRanks(containerId) {
    if (!containerId) {
        var activeStep = document.querySelector('.step-card.active');
        if (activeStep) {
            var prioritiesContainer = activeStep.querySelector('.priorities-container');
            if (prioritiesContainer) {
                containerId = prioritiesContainer.id;
            }
        }
    }
    
    var selector = containerId ? '#' + containerId + ' .priority-item' : '.priority-item';
    var items = document.querySelectorAll(selector);
    
    for (var i = 0; i < items.length; i++) {
        var rank = items[i].querySelector('.priority-rank');
        if (rank) {
            rank.textContent = i + 1;
        }
    }
    
    var activeStep = document.querySelector('.step-card.active');
    if (activeStep) {
        var stepId = activeStep.id;
        if (stepId === 'step1') {
            setTimeout(function() { createTimeAllocation('10'); }, 100);
        } else if (stepId === 'step2') {
            setTimeout(function() { createTimeAllocation('5'); }, 100);
        } else if (stepId === 'step3') {
            setTimeout(function() { createTimeAllocation('1'); }, 100);
        }
    }
}

// 下一步
function nextStep() {
    try {
        if (currentStep === 0) {
            var visionInput = document.getElementById('vision50');
            if (!visionInput) {
                showToast('找不到願景輸入框！', 'error');
                return;
            }
            
            var vision = visionInput.value.trim();
            if (!vision) {
                showToast('請先填寫你的五十歲願景再繼續！', 'error');
                return;
            }
            
            // 保存愿景到全局变量
            planData.vision50 = vision;
            
            var visionDisplay = document.getElementById('vision50Display');
            var visionReminder = document.getElementById('vision50Reminder');
            if (visionDisplay) visionDisplay.textContent = vision;
            if (visionReminder) visionReminder.style.display = 'block';
            
            // 隐藏header，显示progress bar
            var header = document.querySelector('.header');
            var progressContainer = document.querySelector('.progress-container');
            if (header) header.style.display = 'none';
            if (progressContainer) progressContainer.style.display = 'block';
            
            createTimeAllocation();
        } else if (currentStep === 1) {
            // 驗證第一步的時間分配
            var sliders = document.querySelectorAll('#timeAllocation10 .slider-container');
            var hasAdjustedTime = false;
            for (var i = 0; i < sliders.length; i++) {
                if (sliders[i].getValue && sliders[i].getValue() > 1) {
                    hasAdjustedTime = true;
                }
            }
            
            if (!hasAdjustedTime) {
                showToast('⏰ 請先調整你的十年時間分配！根據優先順序思考每個人生領域需要投入多少時間，這是規劃的關鍵步驟', 'error');
                return;
            }
            
            var total = calculateTotalTime();
            if (total > 168) {
                showToast('⚠️ 時間分配超過限制！目前總計 ' + total + ' 小時，一週只有 168 小時。請調整時間分配。', 'error');
                showTimeWarning(total);
                return;
            }
            if (total < 10) {
                showToast('⏰ 你的時間投入似乎過少！目前總計 ' + total + ' 小時，建議至少投入 10 小時以上。', 'error');
                return;
            }
            
            // 檢查行動計劃是否填寫
            var actionPlanInput = document.getElementById('actionPlan10');
            if (!actionPlanInput || !actionPlanInput.value.trim()) {
                showToast('📝 請填寫你的十年行動計劃再繼續！', 'error');
                return;
            }
            
            // 保存十年行動計劃
            planData.actionPlan10 = actionPlanInput.value.trim();
            
            var satisfactionCheckbox = document.getElementById('satisfaction10');
            if (!satisfactionCheckbox || !satisfactionCheckbox.checked) {
                showToast('✅ 請確認你對這個十年規劃滿意後再繼續！', 'error');
                return;
            }
            
            showToast('🎉 恭喜完成十年規劃！現在讓我們聚焦到五年計畫，十年太久，先想想這五年對你最重要的是什麼？', 'success');
        } else if (currentStep === 2) {
            // 驗證第二步的時間分配
            var sliders5 = document.querySelectorAll('#timeAllocation5 .slider-container');
            var hasAdjustedTime5 = false;
            for (var i = 0; i < sliders5.length; i++) {
                if (sliders5[i].getValue && sliders5[i].getValue() > 1) {
                    hasAdjustedTime5 = true;
                }
            }
            
            if (!hasAdjustedTime5) {
                showToast('⏰ 請先調整你的五年時間分配！根據優先順序思考每個人生領域需要投入多少時間，這是規劃的關鍵步驟', 'error');
                return;
            }
            
            var total5 = calculateTotalTime('5');
            if (total5 > 168) {
                showToast('⚠️ 時間分配超過限制！目前總計 ' + total5 + ' 小時，請調整時間分配。', 'error');
                return;
            }
            if (total5 < 10) {
                showToast('⏰ 你的時間投入似乎過少！目前總計 ' + total5 + ' 小時，建議至少投入 10 小時以上。', 'error');
                return;
            }
            
            // 檢查行動計劃是否填寫
            var actionPlan5Input = document.getElementById('actionPlan5');
            if (!actionPlan5Input || !actionPlan5Input.value.trim()) {
                showToast('📝 請填寫你的五年行動計劃再繼續！', 'error');
                return;
            }
            
            // 保存五年行動計劃
            planData.actionPlan5 = actionPlan5Input.value.trim();
            
            var satisfaction5Checkbox = document.getElementById('satisfaction5');
            if (!satisfaction5Checkbox || !satisfaction5Checkbox.checked) {
                showToast('✅ 請確認你對這個五年規劃滿意後再繼續！', 'error');
                return;
            }
            
            showToast('🚀 很棒！五年規劃完成！現在讓我們更具體一點，專注在這一年最想達成的目標！', 'success');
        } else if (currentStep === 3) {
            // 驗證第三步的時間分配
            var sliders1 = document.querySelectorAll('#timeAllocation1 .slider-container');
            var hasAdjustedTime1 = false;
            for (var i = 0; i < sliders1.length; i++) {
                if (sliders1[i].getValue && sliders1[i].getValue() > 1) {
                    hasAdjustedTime1 = true;
                }
            }
            
            if (!hasAdjustedTime1) {
                showToast('⏰ 請調整你的一年時間分配！這是最關鍵的執行年，請仔細分配每個領域的時間投入', 'error');
                return;
            }
            
            var total1 = calculateTotalTime('1');
            if (total1 > 168) {
                showToast('⚠️ 時間分配超過限制！目前總計 ' + total1 + ' 小時，請調整時間分配。', 'error');
                return;
            }
            if (total1 < 10) {
                showToast('⏰ 你的時間投入似乎過少！目前總計 ' + total1 + ' 小時，建議至少投入 10 小時以上。', 'error');
                return;
            }
            
            // 檢查行動計劃是否填寫
            var actionPlan1Input = document.getElementById('actionPlan1');
            if (!actionPlan1Input || !actionPlan1Input.value.trim()) {
                showToast('📝 請填寫你的一年行動計劃再繼續！', 'error');
                return;
            }
            
            // 保存一年行動計劃
            planData.actionPlan1 = actionPlan1Input.value.trim();
            
            var satisfaction1Checkbox = document.getElementById('satisfaction1');
            if (!satisfaction1Checkbox || !satisfaction1Checkbox.checked) {
                showToast('✅ 請確認你對這個一年規劃滿意後再繼續！', 'error');
                return;
            }
            
            planData.priorities = getPriorities();
            planData.timeAllocation = getTimeAllocation();
            planData.satisfaction = true;
            
            showToast('🎉 完整規劃完成！', 'success');
            
            // 創建完整的完成頁面
            var container = document.querySelector('.container');
            
            var currentEl = document.getElementById('step3');
            if (currentEl) {
                currentEl.classList.add('hidden');
                currentEl.classList.remove('active');
            }
            
            var existingCompletion = document.getElementById('completion');
            if (existingCompletion) {
                existingCompletion.remove();
            }
            
            var completionPage = document.createElement('div');
            completionPage.className = 'step-card active';
            completionPage.id = 'completion';
            
            // 獲取數據
            var priorities10 = getPriorities('priorities10');
            var timeAllocation10 = getTimeAllocation('10');
            var total10 = calculateTotalTime('10');
            
            var priorities5 = getPriorities('priorities5');
            var timeAllocation5 = getTimeAllocation('5');
            var total5 = calculateTotalTime('5');
            
            var priorities1 = getPriorities('priorities1');
            var timeAllocation1 = getTimeAllocation('1');
            var total11 = calculateTotalTime('1');
            
            // 生成滑條效果的優先級列表
            function makeSliderList(priorities, timeAllocation, color) {
                var list = '';
                for (var i = 0; i < priorities.length; i++) {
                    var hours = timeAllocation[priorities[i]] || 0;
                    var percentage = ((hours / 168) * 100).toFixed(1);
                    var sliderWidth = Math.min((hours / 60) * 100, 100);
                    
                    list += '<div style="background: white; border-radius: 12px; padding: 20px; margin: 10px 0; border: 2px solid #e9ecef;">' +
                        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
                        '<span style="font-weight: 600; font-size: 1.1rem;">' + (i + 1) + '. ' + priorities[i] + '</span>' +
                        '<span style="color: ' + color + '; font-weight: 700; font-size: 1.1rem;">' + hours + ' 小時 (' + percentage + '%)</span>' +
                        '</div>' +
                        '<div style="position: relative; width: 100%; height: 30px; background: #e9ecef; border-radius: 15px; overflow: hidden;">' +
                        '<div style="position: absolute; top: 0; left: 0; height: 100%; background: ' + color + '; border-radius: 15px; width: ' + sliderWidth + '%; transition: width 0.3s ease;"></div>' +
                        '<div style="position: absolute; top: 50%; left: ' + sliderWidth + '%; width: 24px; height: 24px; background: white; border: 3px solid ' + color + '; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>' +
                        '</div>' +
                        '</div>';
                }
                return list;
            }
            
            completionPage.innerHTML = 
                '<div class="step-title">' +
                    '<div class="step-number">✅</div>' +
                    '規劃完成！' +
                '</div>' +
                
                // 五十歲願景
                '<div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); border: 3px solid #4caf50; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
                '<h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 1.3rem;">🎯 你的五十歲願景</h3>' +
                '<p style="color: #1b5e20; line-height: 1.6; font-style: italic; font-size: 1.1rem;">' + planData.vision50 + '</p>' +
                '</div>' +
                
                // 十年規劃
                '<div style="background: linear-gradient(135deg, #fff8e1, #ffecb3); border: 3px solid #ffc107; border-radius: 15px; padding: 25px; margin-bottom: 20px;">' +
                '<h3 style="color: #e65100; margin-bottom: 20px; font-size: 1.3rem;">📊 你的十年規劃</h3>' +
                '<div style="margin-bottom: 15px;">' +
                '<strong style="color: #ef6c00; font-size: 1.1rem;">總投入時間：' + total10 + ' / 168 小時 (' + ((total10/168)*100).toFixed(1) + '%)</strong>' +
                '</div>' +
                makeSliderList(priorities10, timeAllocation10, '#ef6c00') +
                (planData.actionPlan10 ? '<div style="background: rgba(239, 108, 0, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;"><strong style="color: #ef6c00;">📋 十年行動計劃：</strong><br><span style="color: #ef6c00; line-height: 1.5;">' + planData.actionPlan10 + '</span></div>' : '') +
                '</div>' +
                
                // 五年規劃
                '<div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); border: 3px solid #9c27b0; border-radius: 15px; padding: 25px; margin-bottom: 20px;">' +
                '<h3 style="color: #4a148c; margin-bottom: 20px; font-size: 1.3rem;">📋 你的五年規劃</h3>' +
                '<div style="margin-bottom: 15px;">' +
                '<strong style="color: #6a1b9a; font-size: 1.1rem;">總投入時間：' + total5 + ' / 168 小時 (' + ((total5/168)*100).toFixed(1) + '%)</strong>' +
                '</div>' +
                makeSliderList(priorities5, timeAllocation5, '#6a1b9a') +
                (planData.actionPlan5 ? '<div style="background: rgba(106, 27, 154, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;"><strong style="color: #6a1b9a;">📋 五年行動計劃：</strong><br><span style="color: #6a1b9a; line-height: 1.5;">' + planData.actionPlan5 + '</span></div>' : '') +
                '</div>' +
                
                // 一年規劃
                '<div style="background: white; border: 3px solid #607d8b; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
                '<h3 style="color: #455a64; margin-bottom: 20px; font-size: 1.3rem;">🚀 你的一年規劃（重點）</h3>' +
                '<div style="margin-bottom: 20px;">' +
                '<strong style="color: #607d8b; font-size: 1.2rem;">總投入時間：' + total11 + ' / 168 小時 (' + ((total11/168)*100).toFixed(1) + '%)</strong>' +
                '</div>' +
                makeSliderList(priorities1, timeAllocation1, '#607d8b') +
                (planData.actionPlan1 ? '<div style="background: rgba(96, 125, 139, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;"><strong style="color: #607d8b;">📋 一年行動計劃：</strong><br><span style="color: #607d8b; line-height: 1.5;">' + planData.actionPlan1 + '</span></div>' : '') +
                '</div>' +
                
                // 下一步建議與三個月行動計劃
                '<div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 3px solid #2196f3; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
                '<h3 style="color: #1565c0; margin-bottom: 15px; font-size: 1.3rem;">💡 下一步建議</h3>' +
                '<ul style="color: #1976d2; line-height: 1.8; padding-left: 20px; margin-bottom: 20px;">' +
                '<li>將這個規劃保存下來，定期回顧和調整</li>' +
                '<li>專注執行一年計畫，這是最關鍵的行動指南</li>' +
                '<li>每季檢視進度，確保朝著五十歲願景前進</li>' +
                '<li>記錄實際時間分配，與規劃進行對比調整</li>' +
                '</ul>' +
                '<div style="margin-top: 25px;">' +
                '<label for="immediateAction3months" style="display: block; font-weight: 600; color: #1565c0; margin-bottom: 12px; font-size: 1.1rem;">請打上你三個月內立即可以完成的行動：</label>' +
                '<textarea id="immediateAction3months" rows="4" placeholder="例如：建立晨間運動習慣、完成線上課程、建立理財帳戶、改善工作流程..." style="width: 100%; padding: 15px; border: 2px solid #2196f3; border-radius: 10px; font-size: 1rem; font-family: inherit; resize: vertical; margin-bottom: 15px;"></textarea>' +
                '<div style="text-align: center;">' +
                '<button id="saveImmediateAction" onclick="saveImmediateAction()" style="padding: 12px 30px; background: #2196f3; color: white; border: none; border-radius: 25px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-right: 10px;">💾 儲存行動計劃</button>' +
                '<button id="editImmediateAction" onclick="editImmediateAction()" style="display: none; padding: 12px 30px; background: #ff9800; color: white; border: none; border-radius: 25px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-right: 10px;">✏️ 修改計劃</button>' +
                '<span id="saveStatus" style="display: inline-block; padding: 4px 0; color: #666; font-weight: 600; font-size: 0.9rem; margin-left: 15px;">📝 尚未儲存</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                
                // 職涯諮詢區塊
                '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 30px; margin: 40px 0; color: white; position: relative; overflow: hidden;">' +
                '<div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>' +
                '<div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>' +
                '<div style="position: relative; z-index: 2;">' +
                '<h3 style="color: white; margin-bottom: 20px; font-size: 1.4rem; text-align: center;">🌟 對你的人生與生涯有迷惘嗎？</h3>' +
                '<div style="text-align: center; margin-bottom: 25px;">' +
                '<div style="display: inline-block; margin-bottom: 15px;">' +
                '<h4 style="color: white; font-size: 1.2rem; margin: 0; font-weight: 600;">您好，我是 💼 職海中的PM旅人</h4>' +
                '<div style="width: 40px; height: 2px; background: rgba(255,255,255,0.6); margin: 8px auto;"></div>' +
                '</div>' +
                '<p style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 1rem; margin: 15px 0;">在職場的海洋中載浮載沉，我願意作為你的旅伴<br>為你點亮一盞明燈，陪你照亮職涯的每一哩路</p>' +
                '</div>' +
                '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: center; margin: 25px 0;">' +
                '<div style="text-align: center; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">' +
                '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAAlwSFlzAAALEgAACxIB0t1+/AAAADJJREFUeNrt0DEBAAAIAyDJX38QQsB4B7fQ6lUAAAAAAAAAAAAAAAAAAAAAAAAAAAD4GQPtgAAB8p3XSQAAAABJRU5ErkJggg==" alt="LINE QR Code" style="width: 120px; height: 120px; border-radius: 8px; background: #00C300; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">' +
                '<p style="color: #333; font-size: 0.8rem; margin-top: 8px; font-weight: 600;">掃描加LINE</p>' +
                '</div>' +
                '<div style="flex: 1; min-width: 280px;">' +
                '<div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px);">' +
                '<div style="text-align: center; margin-bottom: 20px;">' +
                '<p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 10px;">📚 我的職涯文章分享</p>' +
                '<a href="https://vocus.cc/tags/%E8%81%B7%E6%B5%B7%E4%B8%AD%E7%9A%84PM%E6%97%85%E4%BA%BA" target="_blank" style="color: white; text-decoration: underline; font-size: 0.9rem; opacity: 0.9;">職海中的PM旅人 - 過往文章</a>' +
                '</div>' +
                '<h4 style="color: white; margin-bottom: 15px; font-size: 1.1rem;">📞 聯絡方式</h4>' +
                '<div style="margin-bottom: 12px;">' +
                '<span style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">LINE ID：</span>' +
                '<span style="color: white; font-weight: 700; font-size: 1rem;">@tnb0485u</span>' +
                '<span style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">（第6個字是數字0）</span>' +
                '</div>' +
                '<a href="https://lin.ee/L0c0DAz" target="_blank" style="display: inline-block; background: #00C300; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: all 0.3s ease;">💬 點我直接加LINE</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">' +
                '<p style="color: rgba(255,255,255,0.9); font-size: 1rem; font-weight: 600;">🚢 期待與你在職海中一起乘風破浪！</p>' +
                '</div>' +
                '</div>' +
                '</div>' +
                
                '<div class="buttons">' +
                '<button class="btn btn-secondary" onclick="location.reload()">重新規劃</button>' +
                '<button class="btn btn-primary" onclick="downloadPlan()">下載完整規劃</button>' +
                '</div>';
            
            container.appendChild(completionPage);
            var progressFill = document.getElementById('progressFill');
            if (progressFill) {
                progressFill.style.width = '100%';
            }
            return;
        }
        
        if (currentStep < totalSteps) {
            var allSteps = document.querySelectorAll('.step-card');
            for (var i = 0; i < allSteps.length; i++) {
                allSteps[i].classList.add('hidden');
                allSteps[i].classList.remove('active');
            }
            currentStep++;
            var nextEl = document.getElementById('step' + currentStep);
            if (nextEl) {
                nextEl.classList.remove('hidden');
                setTimeout(function() {
                    nextEl.classList.add('active');
                    if (currentStep === 1) {
                        createTimeAllocation('10');
                    } else if (currentStep === 2) {
                        // 立即設置願景顯示
                        var visionDisplay2 = document.getElementById('vision50Display2');
                        var visionReminder2 = document.getElementById('vision50Reminder2');
                        if (visionDisplay2 && planData.vision50) {
                            visionDisplay2.textContent = planData.vision50;
                        }
                        if (visionReminder2) {
                            visionReminder2.style.display = 'block';
                        }
                        // 顯示第一步的規劃結果作為參考
                        showStep1Reference();
                        // 立即复制第一步的优先级
                        copyPrioritiesToNextStep('priorities10', 'priorities5');
                        // 延遲創建時間分配
                        setTimeout(function() { 
                            createTimeAllocation('5'); 
                        }, 300);
                    } else if (currentStep === 3) {
                        // 設置願景顯示
                        var visionDisplay3 = document.getElementById('vision50Display3');
                        var visionReminder3 = document.getElementById('vision50Reminder3');
                        if (visionDisplay3 && planData.vision50) {
                            visionDisplay3.textContent = planData.vision50;
                        }
                        if (visionReminder3) {
                            visionReminder3.style.display = 'block';
                        }
                        // 顯示第一步和第二步的規劃結果作為參考
                        showStep1And2Reference();
                        // 複製第二步的優先級
                        copyPrioritiesToNextStep('priorities5', 'priorities1');
                        // 創建時間分配
                        setTimeout(function() { createTimeAllocation('1'); }, 300);
                    }
                }, 100);
            }
            updateProgress();
        }
    } catch (error) {
        console.error('下一步出错:', error);
        showToast('操作出现错误，请重试', 'error');
    }
}

// 创建完成页面（備用函式）
function createCompletionPage() {
    var container = document.querySelector('.container');
    var currentEl = document.getElementById('step3');
    if (currentEl) {
        currentEl.classList.add('hidden');
        currentEl.classList.remove('active');
    }
    var existingCompletion = document.getElementById('completion');
    if (existingCompletion) {
        existingCompletion.remove();
    }
    var completionPage = document.createElement('div');
    completionPage.className = 'step-card active';
    completionPage.id = 'completion';
    // 獲取各步驟數據
    var priorities10 = getPriorities('priorities10');
    var timeAllocation10 = getTimeAllocation('10');
    var total10 = calculateTotalTime('10');
    var priorities5 = getPriorities('priorities5');
    var timeAllocation5 = getTimeAllocation('5');
    var total5 = calculateTotalTime('5');
    var priorities1 = getPriorities('priorities1');
    var timeAllocation1 = getTimeAllocation('1');
    var total1 = calculateTotalTime('1');
    // 生成各步驟結果HTML
    function generatePriorityList(priorities, timeAllocation, color) {
        var list = '';
        for (var i = 0; i < priorities.length; i++) {
            var hours = timeAllocation[priorities[i]] || 0;
            var percentage = ((hours / 168) * 100).toFixed(1);
            list += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 8px;">' +
                '<span style="font-weight: 600;">' + (i + 1) + '. ' + priorities[i] + '</span>' +
                '<span style="color: ' + color + '; font-weight: 700;">' + hours + ' 小時 (' + percentage + '%)</span>' +
                '</div>';
        }
        return list;
    }
    completionPage.innerHTML = '<div class="step-title">' +
        '<div class="step-number">✅</div>' +
        '規劃完成！' +
        '</div>' +
        '<div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); border: 3px solid #4caf50; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 1.3rem;">🎯 你的五十歲願景</h3>' +
        '<p style="color: #1b5e20; line-height: 1.6; font-style: italic; font-size: 1.1rem;">' + planData.vision50 + '</p>' +
        '</div>' +
        '<div style="background: linear-gradient(135deg, #fff8e1, #ffecb3); border: 3px solid #ffc107; border-radius: 15px; padding: 25px; margin-bottom: 20px;">' +
        '<h3 style="color: #e65100; margin-bottom: 20px; font-size: 1.3rem;">📊 你的十年規劃</h3>' +
        '<div style="margin-bottom: 15px;">' +
        '<strong style="color: #ef6c00; font-size: 1.1rem;">總投入時間：' + total10 + ' / 168 小時 (' + ((total10/168)*100).toFixed(1) + '%)</strong>' +
        '</div>' +
        generatePriorityList(priorities10, timeAllocation10, '#ef6c00') +
        (planData.actionPlan10 ? '<div style="background: rgba(239, 108, 0, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;"><strong style="color: #ef6c00;">📋 十年行動計劃：</strong><br><span style="color: #ef6c00; line-height: 1.5;">' + planData.actionPlan10 + '</span></div>' : '') +
        '</div>' +
        '<div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); border: 3px solid #9c27b0; border-radius: 15px; padding: 25px; margin-bottom: 20px;">' +
        '<h3 style="color: #4a148c; margin-bottom: 20px; font-size: 1.3rem;">📋 你的五年規劃</h3>' +
        '<div style="margin-bottom: 15px;">' +
        '<strong style="color: #6a1b9a; font-size: 1.1rem;">總投入時間：' + total5 + ' / 168 小時 (' + ((total5/168)*100).toFixed(1) + '%)</strong>' +
        '</div>' +
        generatePriorityList(priorities5, timeAllocation5, '#6a1b9a') +
        (planData.actionPlan5 ? '<div style="background: rgba(106, 27, 154, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;"><strong style="color: #6a1b9a;">📋 五年行動計劃：</strong><br><span style="color: #6a1b9a; line-height: 1.5;">' + planData.actionPlan5 + '</span></div>' : '') +
        '</div>' +
        '<div style="background: white; border: 3px solid #607d8b; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h3 style="color: #455a64; margin-bottom: 20px; font-size: 1.3rem;">🚀 你的一年規劃（重點）</h3>' +
        '<div style="margin-bottom: 20px;">' +
        '<strong style="color: #607d8b; font-size: 1.2rem;">總投入時間：' + total1 + ' / 168 小時 (' + ((total1/168)*100).toFixed(1) + '%)</strong>' +
        '</div>' +
        generatePriorityList(priorities1, timeAllocation1, '#607d8b') +
        (planData.actionPlan1 ? '<div style="background: rgba(96, 125, 139, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;"><strong style="color: #607d8b;">📋 一年行動計劃：</strong><br><span style="color: #607d8b; line-height: 1.5;">' + planData.actionPlan1 + '</span></div>' : '') +
        '</div>' +
        '<div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 3px solid #2196f3; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h3 style="color: #1565c0; margin-bottom: 15px; font-size: 1.3rem;">💡 下一步建議</h3>' +
        '<ul style="color: #1976d2; line-height: 1.8; padding-left: 20px; margin-bottom: 20px;">' +
        '<li>將這個規劃保存下來，定期回顧和調整</li>' +
        '<li>專注執行一年計畫，這是最關鍵的行動指南</li>' +
        '<li>每季檢視進度，確保朝著五十歲願景前進</li>' +
        '<li>記錄實際時間分配，與規劃進行對比調整</li>' +
        '</ul>' +
        '<div style="margin-top: 25px;">' +
        '<label for="immediateAction3months" style="display: block; font-weight: 600; color: #1565c0; margin-bottom: 12px; font-size: 1.1rem;">請打上你三個月內立即可以完成的行動：</label>' +
        '<textarea id="immediateAction3months" rows="4" placeholder="例如：建立晨間運動習慣、完成線上課程、建立理財帳戶、改善工作流程..." style="width: 100%; padding: 15px; border: 2px solid #2196f3; border-radius: 10px; font-size: 1rem; font-family: inherit; resize: vertical; margin-bottom: 15px;"></textarea>' +
        '<div style="text-align: center;">' +
        '<button id="saveImmediateAction" onclick="saveImmediateAction()" style="padding: 12px 30px; background: #2196f3; color: white; border: none; border-radius: 25px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-right: 10px;">💾 儲存行動計劃</button>' +
        '<button id="editImmediateAction" onclick="editImmediateAction()" style="display: none; padding: 12px 30px; background: #ff9800; color: white; border: none; border-radius: 25px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-right: 10px;">✏️ 修改計劃</button>' +
        '<span id="saveStatus" style="display: inline-block; padding: 4px 0; color: #666; font-weight: 600; font-size: 0.9rem; margin-left: 15px;">📝 尚未儲存</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 30px; margin: 40px 0; color: white; position: relative; overflow: hidden;">' +
        '<div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>' +
        '<div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>' +
        '<div style="position: relative; z-index: 2;">' +
        '<h3 style="color: white; margin-bottom: 20px; font-size: 1.4rem; text-align: center;">🌟 對你的人生與生涯有迷惘嗎？</h3>' +
        '<div style="text-align: center; margin-bottom: 25px;">' +
        '<div style="display: inline-block; margin-bottom: 15px;">' +
        '<h4 style="color: white; font-size: 1.2rem; margin: 0; font-weight: 600;">💼 職海中PM旅人</h4>' +
        '<div style="width: 40px; height: 2px; background: rgba(255,255,255,0.6); margin: 8px auto;"></div>' +
        '</div>' +
        '<p style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 1rem; margin: 15px 0;">在職場的海洋中載浮載沉，我願意作為你的旅伴<br>為你點亮一盞明燈，陪你照亮職涯的每一哩路</p>' +
        '</div>' +
        '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: center; margin: 25px 0;">' +
        '<div style="text-align: center; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">' +
        '<div style="width: 120px; height: 120px; background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF80NF8yKSI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgMjBIMzBWMzBIMjBWMjBaIiBmaWxsPSIjMDBDMzAwIi8+CjxwYXRoIGQ9Ik00MCAyMEg1MFYzMEg0MFYyMFoiIGZpbGw9IiMwMEMzMDAiLz4KPHN2ZyBzdHlsZT0iZm9udC1zaXplOiAxNnB4OyBjb2xvcjogIzAwQzMwMDsgZm9udC13ZWlnaHQ6IGJvbGQ7IHRleHQtYW5jaG9yOiBtaWRkbGU7IGRvbWluYW50LWJhc2VsaW5lOiBjZW50cmFsOyI+Cjx0ZXh0IHg9IjYwIiB5PSI3MCI+TElORTwvdGV4dD4KPHN2Zz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF80NF8yIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+") center/contain no-repeat; border: 2px solid #eee; border-radius: 8px; margin: 0 auto;"></div>' +
        '<p style="color: #333; font-size: 0.8rem; margin-top: 8px; font-weight: 600;">掃描加LINE</p>' +
        '</div>' +
        '<div style="flex: 1; min-width: 280px;">' +
        '<div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px);">' +
        '<h4 style="color: white; margin-bottom: 15px; font-size: 1.1rem;">📞 聯絡方式</h4>' +
        '<div style="margin-bottom: 12px;">' +
        '<span style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">LINE ID：</span>' +
        '<span style="color: white; font-weight: 700; font-size: 1rem;">@tnb0485u</span>' +
        '<span style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">（第6個字是數字0）</span>' +
        '</div>' +
        '<a href="https://lin.ee/L0c0DAz" target="_blank" style="display: inline-block; background: #00C300; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: all 0.3s ease;">💬 點我直接加LINE</a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div style="text-align: center; margin-top: 20px;">' +
        '<p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 10px;">📚 我的職涯文章分享</p>' +
        '<a href="https://vocus.cc/tags/%E8%81%B7%E6%B5%B7%E4%B8%AD%E7%9A%84PM%E6%97%85%E4%BA%BA" target="_blank" style="color: white; text-decoration: underline; font-size: 0.9rem; opacity: 0.9;">職海中的PM旅人 - 過往文章</a>' +
        '</div>' +
        '<div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">' +
        '<p style="color: rgba(255,255,255,0.9); font-size: 1rem; font-weight: 600;">🚢 期待與你在職海中一起乘風破浪！</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="buttons">' +
        '<button class="btn btn-secondary" onclick="restartPlanning()">重新規劃</button>' +
        '<button class="btn btn-primary" onclick="downloadPlan()">下載完整規劃</button>' +
        '</div>';
    container.appendChild(completionPage);
    var progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = '100%';
    }
}

function restartPlanning() {
    location.reload();
}

// 儲存三個月立即行動計劃
function saveImmediateAction() {
    var immediateActionInput = document.getElementById('immediateAction3months');
    var saveButton = document.getElementById('saveImmediateAction');
    var editButton = document.getElementById('editImmediateAction');
    var saveStatus = document.getElementById('saveStatus');
    if (!immediateActionInput || !immediateActionInput.value.trim()) {
        showToast('📝 請先填寫三個月內立即可以完成的行動！', 'error');
        return;
    }
    // 保存數據
    planData.immediateAction3months = immediateActionInput.value.trim();
    planData.immediateActionSaved = true;
    // 更新UI狀態 - 隱藏儲存按鈕，只顯示修改按鈕
    saveButton.style.display = 'none';
    editButton.style.display = 'inline-block';
    // 更新狀態指示器
    saveStatus.textContent = '✅ 已儲存';
    saveStatus.style.color = '#4caf50';
    saveStatus.style.fontWeight = '600';
    // 文本框變為只讀
    immediateActionInput.disabled = true;
    immediateActionInput.style.background = '#f8f9fa';
    immediateActionInput.style.borderColor = '#e9ecef';
    showToast('💾 三個月行動計劃已儲存！', 'success');
}

// 修改三個月立即行動計劃
function editImmediateAction() {
    var immediateActionInput = document.getElementById('immediateAction3months');
    var saveButton = document.getElementById('saveImmediateAction');
    var editButton = document.getElementById('editImmediateAction');
    var saveStatus = document.getElementById('saveStatus');
    // 恢復編輯狀態
    saveButton.style.display = 'inline-block';
    saveButton.textContent = '💾 儲存修改';
    saveButton.style.background = '#2196f3';
    editButton.style.display = 'none';
    // 更新狀態指示器
    saveStatus.textContent = '✏️ 編輯中';
    saveStatus.style.color = '#ff9800';
    saveStatus.style.fontWeight = '600';
    // 恢復文本框編輯
    immediateActionInput.disabled = false;
    immediateActionInput.style.background = 'white';
    immediateActionInput.style.borderColor = '#2196f3';
    // 聚焦到文本框
    immediateActionInput.focus();
    showToast('✏️ 現在可以修改你的三個月行動計劃', 'info');
}

function downloadPlan() {
    // 檢查是否已儲存三個月行動計劃
    if (!planData.immediateActionSaved) {
        showToast('⚠️ 請先儲存你的三個月立即行動計劃才能下載完整規劃！', 'error');
        return;
    }
    var priorities = getPriorities('priorities1');
    var timeAllocation = getTimeAllocation('1');
    var total = calculateTotalTime('1');
    var content = '=== 我的人生規劃 ===\n\n';
    content += '五十歲願景：\n' + planData.vision50 + '\n\n';
    content += '=== 十年規劃 ===\n';
    if (planData.actionPlan10) {
        content += '行動計劃：' + planData.actionPlan10 + '\n\n';
    }
    content += '=== 五年規劃 ===\n';
    if (planData.actionPlan5) {
        content += '行動計劃：' + planData.actionPlan5 + '\n\n';
    }
    content += '=== 一年規劃 ===\n';
    if (planData.actionPlan1) {
        content += '行動計劃：' + planData.actionPlan1 + '\n\n';
    }
    content += '人生領域優先順序與時間分配：\n';
    content += '總投入時間：' + total + ' / 168 小時 (' + ((total/168)*100).toFixed(1) + '%)\n\n';
    for (var i = 0; i < priorities.length; i++) {
        var hours = timeAllocation[priorities[i]] || 0;
        var percentage = ((hours / 168) * 100).toFixed(1);
        content += (i + 1) + '. ' + priorities[i] + '：' + hours + ' 小時 (' + percentage + '%)\n';
    }
    content += '\n=== 三個月立即行動 ===\n';
    content += planData.immediateAction3months + '\n';
    content += '\n規劃日期：' + new Date().toLocaleDateString('zh-TW') + '\n';
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '我的人生規劃.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 完整規劃已下載！', 'success');
}

function copyPrioritiesToNextStep(fromId, toId) {
    var fromContainer = document.getElementById(fromId);
    var toContainer = document.getElementById(toId);
    if (!fromContainer || !toContainer) {
        return;
    }
    var fromItems = fromContainer.querySelectorAll('.priority-item .priority-text');
    if (fromItems.length === 0) {
        return;
    }
    toContainer.innerHTML = '';
    for (var i = 0; i < fromItems.length; i++) {
        var priorityText = fromItems[i].textContent.trim();
        var newItem = document.createElement('div');
        newItem.className = 'priority-item';
        newItem.draggable = true;
        newItem.innerHTML = '<span class="priority-text">' + priorityText + '</span>' +
            '<div class="priority-actions">' +
            '<button class="edit-btn" onclick="editPriority(this)">✏️ 編輯</button>' +
            '<button class="cancel-btn" onclick="removePriority(this)">🗑️ 刪除</button>' +
            '<div class="priority-rank">' + (i + 1) + '</div>' +
            '</div>';
        toContainer.appendChild(newItem);
    }
    var addButton = document.createElement('button');
    addButton.className = 'add-priority-btn';
    addButton.type = 'button';
    addButton.onclick = addNewPriority;
    addButton.innerHTML = '➕ 新增人生領域';
    toContainer.appendChild(addButton);
    setTimeout(function() {
        initializeDragAndDrop();
    }, 100);
}

// 顯示第一步規劃結果作為參考（第二步使用）
function showStep1Reference() {
    var priorities = getPriorities('priorities10');
    var timeAllocation = getTimeAllocation('10');
    var total = calculateTotalTime('10');
    var summaryContainer = document.getElementById('step1Summary');
    var referenceContainer = document.getElementById('step1Reference');
    if (!summaryContainer || !referenceContainer) return;
    var summaryHTML = '<strong style="color: #ef6c00; font-size: 1.1rem;">總投入時間：' + total + ' / 168 小時 (' + ((total/168)*100).toFixed(1) + '%)</strong><br><br>';
    for (var i = 0; i < priorities.length; i++) {
        var hours = timeAllocation[priorities[i]] || 0;
        var percentage = ((hours / 168) * 100).toFixed(1);
        summaryHTML += '<div style="margin-bottom: 8px;">';
        summaryHTML += '<strong>' + (i + 1) + '. ' + priorities[i] + '：</strong> ';
        summaryHTML += hours + ' 小時 (' + percentage + '%)';
        summaryHTML += '</div>';
    }
    if (planData.actionPlan10) {
        summaryHTML += '<br><div style="background: rgba(239, 108, 0, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">';
        summaryHTML += '<strong style="color: #ef6c00;">📋 十年行動計劃：</strong><br>';
        summaryHTML += '<span style="color: #ef6c00; line-height: 1.5;">' + planData.actionPlan10 + '</span>';
        summaryHTML += '</div>';
    }
    summaryContainer.innerHTML = summaryHTML;
    referenceContainer.style.display = 'block';
}

// 顯示第一步和第二步規劃結果作為參考（第三步使用）
function showStep1And2Reference() {
    // 第一
    var priorities1 = getPriorities('priorities10');
    var timeAllocation1 = getTimeAllocation('10');
    var total1 = calculateTotalTime('10');
    var summaryContainer1 = document.getElementById('step1Summary3');
    var referenceContainer1 = document.getElementById('step1Reference3');
    if (summaryContainer1 && referenceContainer1) {
        var summaryHTML1 = '<strong style="color: #ef6c00; font-size: 1.1rem;">總投入時間：' + total1 + ' / 168 小時 (' + ((total1/168)*100).toFixed(1) + '%)</strong><br><br>';
        for (var i = 0; i < priorities1.length; i++) {
            var hours1 = timeAllocation1[priorities1[i]] || 0;
            var percentage1 = ((hours1 / 168) * 100).toFixed(1);
            summaryHTML1 += '<div style="margin-bottom: 8px;">';
            summaryHTML1 += '<strong>' + (i + 1) + '. ' + priorities1[i] + '：</strong> ';
            summaryHTML1 += hours1 + ' 小時 (' + percentage1 + '%)';
            summaryHTML1 += '</div>';
        }
        if (planData.actionPlan10) {
            summaryHTML1 += '<br><div style="background: rgba(239, 108, 0, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">';
            summaryHTML1 += '<strong style="color: #ef6c00;">📋 十年行動計劃：</strong><br>';
            summaryHTML1 += '<span style="color: #ef6c00; line-height: 1.5;">' + planData.actionPlan10 + '</span>';
            summaryHTML1 += '</div>';
        }
        summaryContainer1.innerHTML = summaryHTML1;
        referenceContainer1.style.display = 'block';
    }
    // 第二
    var priorities2 = getPriorities('priorities5');
    var timeAllocation2 = getTimeAllocation('5');
    var total2 = calculateTotalTime('5');
    var summaryContainer2 = document.getElementById('step2Summary3');
    var referenceContainer2 = document.getElementById('step2Reference3');
    if (summaryContainer2 && referenceContainer2) {
        var summaryHTML2 = '<strong style="color: #6a1b9a; font-size: 1.1rem;">總投入時間：' + total2 + ' / 168 小時 (' + ((total2/168)*100).toFixed(1) + '%)</strong><br><br>';
        for (var i = 0; i < priorities2.length; i++) {
            var hours2 = timeAllocation2[priorities2[i]] || 0;
            var percentage2 = ((hours2 / 168) * 100).toFixed(1);
            summaryHTML2 += '<div style="margin-bottom: 8px;">';
            summaryHTML2 += '<strong>' + (i + 1) + '. ' + priorities2[i] + '：</strong> ';
            summaryHTML2 += hours2 + ' 小時 (' + percentage2 + '%)';
            summaryHTML2 += '</div>';
        }
        if (planData.actionPlan5) {
            summaryHTML2 += '<br><div style="background: rgba(106, 27, 154, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">';
            summaryHTML2 += '<strong style="color: #6a1b9a;">📋 五年行動計劃：</strong><br>';
            summaryHTML2 += '<span style="color: #6a1b9a; line-height: 1.5;">' + planData.actionPlan5 + '</span>';
            summaryHTML2 += '</div>';
        }
        summaryContainer2.innerHTML = summaryHTML2;
        referenceContainer2.style.display = 'block';
    }
}

function calculateTotalTime(step) {
    step = step || '10';
    var sliders = document.querySelectorAll('#timeAllocation' + step + ' .slider-container');
    var total = 0;
    for (var i = 0; i < sliders.length; i++) {
        var value = sliders[i].getValue ? sliders[i].getValue() : 0;
        total += value;
    }
    return total;
}

function getTimeAllocation(step) {
    step = step || '10';
    var sliders = document.querySelectorAll('#timeAllocation' + step + ' .slider-container');
    var allocation = {};
    for (var i = 0; i < sliders.length; i++) {
        var priority = sliders[i].dataset.priority;
        allocation[priority] = sliders[i].getValue ? sliders[i].getValue() : 0;
    }
    return allocation;
}

function getPriorities(containerId) {
    containerId = containerId || 'priorities10';
    var items = document.querySelectorAll('#' + containerId + ' .priority-item .priority-text');
    var priorities = [];
    for (var i = 0; i < items.length; i++) {
        priorities.push(items[i].textContent.trim());
    }
    return priorities;
}

function prevStep() {
    if (currentStep > 0) {
        var allSteps = document.querySelectorAll('.step-card');
        for (var i = 0; i < allSteps.length; i++) {
            allSteps[i].classList.add('hidden');
            allSteps[i].classList.remove('active');
        }
        currentStep--;
        var prevEl = document.getElementById('step' + currentStep);
        if (prevEl) {
            prevEl.classList.remove('hidden');
            setTimeout(function() {
                prevEl.classList.add('active');
            }, 100);
        }
        updateProgress();
    }
}

function createTimeAllocation(step) {
    step = step || '10';
    var container = document.getElementById('timeAllocation' + step);
    var priorities = getPriorities('priorities' + step);
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < priorities.length; i++) {
        var timeItem = document.createElement('div');
        timeItem.className = 'time-item';
        timeItem.innerHTML = '<label>' + priorities[i] + '</label>' +
            '<div class="slider-container" data-priority="' + priorities[i] + '">' +
            '<div class="slider-fill"></div>' +
            '<div class="slider-thumb"></div>' +
            '</div>' +
            '<div class="time-display">1 小時 (0.6%)</div>';
        container.appendChild(timeItem);
        initCustomSlider(timeItem.querySelector('.slider-container'), step, 1);
    }
    updateTotalTime(step);
}

function initCustomSlider(sliderContainer, step, initialValue) {
    step = step || '10';
    initialValue = initialValue || 1;
    var thumb = sliderContainer.querySelector('.slider-thumb');
    var fill = sliderContainer.querySelector('.slider-fill');
    var display = sliderContainer.parentElement.querySelector('.time-display');
    var isDragging = false;
    var currentValue = initialValue;
    var maxValue = 60;
    function updateSlider(value) {
        value = Math.max(1, Math.min(maxValue, value));
        currentValue = value;
        var percentage = (value / maxValue) * 100;
        thumb.style.left = percentage + '%';
        fill.style.width = percentage + '%';
        var timePercentage = (value / 168 * 100).toFixed(1);
        display.textContent = value + ' 小時 (' + timePercentage + '%)';
        updateTotalTime(step);
    }
    function getValueFromPosition(clientX) {
        var rect = sliderContainer.getBoundingClientRect();
        var percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return Math.round(percentage * maxValue);
    }
    sliderContainer.addEventListener('mousedown', function(e) {
        isDragging = true;
        updateSlider(getValueFromPosition(e.clientX));
        e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            updateSlider(getValueFromPosition(e.clientX));
            e.preventDefault();
        }
    });
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    sliderContainer.addEventListener('touchstart', function(e) {
        isDragging = true;
        var touch = e.touches[0];
        updateSlider(getValueFromPosition(touch.clientX));
        e.preventDefault();
    });
    document.addEventListener('touchmove', function(e) {
        if (isDragging) {
            var touch = e.touches[0];
            updateSlider(getValueFromPosition(touch.clientX));
            e.preventDefault();
        }
    });
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
    sliderContainer.getValue = function() {
        return currentValue;
    };
    updateSlider(initialValue);
}

function updateTotalTime(step) {
    step = step || '10';
    var sliders = document.querySelectorAll('#timeAllocation' + step + ' .slider-container');
    var total = 0;
    for (var i = 0; i < sliders.length; i++) {
        var value = sliders[i].getValue ? sliders[i].getValue() : 0;
        total += value;
    }
    var totalElement = document.getElementById('totalTime' + step);
    if (totalElement) {
        totalElement.textContent = total;
        if (total > 168) {
            totalElement.parentElement.classList.add('over-limit');
        } else {
            totalElement.parentElement.classList.remove('over-limit');
        }
    }
    showTimeWarning(total, step);
}

function initializeDragAndDrop() {
    var containers = document.querySelectorAll('.priorities-container');
    for (var c = 0; c < containers.length; c++) {
        var container = containers[c];
        var items = container.querySelectorAll('.priority-item');
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', '');
                this.style.opacity = '0.5';
            });
            item.addEventListener('dragend', function(e) {
                this.style.opacity = '';
                updatePriorityRanks(this.closest('.priorities-container').id);
            });
        }
        container.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        container.addEventListener('drop', function(e) {
            e.preventDefault();
            var draggedElement = document.querySelector('.priority-item[style*="opacity: 0.5"]');
            if (draggedElement) {
                var afterElement = getDragAfterElement(this, e.clientY);
                if (afterElement == null) {
                    var addBtn = this.querySelector('.add-priority-btn');
                    this.insertBefore(draggedElement, addBtn);
                } else {
                    this.insertBefore(draggedElement, afterElement);
                }
                updatePriorityRanks(this.id);
            }
        });
    }
}

function getDragAfterElement(container, y) {
    var draggableElements = Array.from(container.querySelectorAll('.priority-item:not([style*="opacity: 0.5"])'));
    return draggableElements.reduce(function(closest, child) {
        var box = child.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    initializeDragAndDrop();
});