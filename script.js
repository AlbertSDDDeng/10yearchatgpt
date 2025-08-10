// 全域變數
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

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    initializeDragAndDrop();
});

// 下一步功能
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
            
            planData.vision50 = vision;
            
            var visionDisplay = document.getElementById('vision50Display');
            var visionReminder = document.getElementById('vision50Reminder');
            if (visionDisplay) visionDisplay.textContent = vision;
            if (visionReminder) visionReminder.style.display = 'block';
            
            var header = document.querySelector('.header');
            var progressContainer = document.querySelector('.progress-container');
            if (header) header.style.display = 'none';
            if (progressContainer) progressContainer.style.display = 'block';
            
            createTimeAllocation();
        } else if (currentStep === 1) {
            var sliders = document.querySelectorAll('#timeAllocation10 .slider-container');
            var hasAdjustedTime = false;
            for (var i = 0; i < sliders.length; i++) {
                if (sliders[i].getValue && sliders[i].getValue() > 1) {
                    hasAdjustedTime = true;
                }
            }
            
            if (!hasAdjustedTime) {
                showToast('⏰ 請先調整你的十年時間分配！', 'error');
                return;
            }
            
            var total = calculateTotalTime();
            if (total > 168) {
                showToast('⚠️ 時間分配超過限制！', 'error');
                return;
            }
            if (total < 10) {
                showToast('⏰ 你的時間投入似乎過少！', 'error');
                return;
            }
            
            var actionPlanInput = document.getElementById('actionPlan10');
            if (!actionPlanInput || !actionPlanInput.value.trim()) {
                showToast('📝 請填寫你的十年行動計劃再繼續！', 'error');
                return;
            }
            
            planData.actionPlan10 = actionPlanInput.value.trim();
            
            var satisfactionCheckbox = document.getElementById('satisfaction10');
            if (!satisfactionCheckbox || !satisfactionCheckbox.checked) {
                showToast('✅ 請確認你對這個十年規劃滿意後再繼續！', 'error');
                return;
            }
            
            showToast('🎉 恭喜完成十年規劃！', 'success');
        } else if (currentStep === 2) {
            var sliders5 = document.querySelectorAll('#timeAllocation5 .slider-container');
            var hasAdjustedTime5 = false;
            for (var i = 0; i < sliders5.length; i++) {
                if (sliders5[i].getValue && sliders5[i].getValue() > 1) {
                    hasAdjustedTime5 = true;
                }
            }
            
            if (!hasAdjustedTime5) {
                showToast('⏰ 請先調整你的五年時間分配！', 'error');
                return;
            }
            
            var total5 = calculateTotalTime('5');
            if (total5 > 168) {
                showToast('⚠️ 時間分配超過限制！', 'error');
                return;
            }
            if (total5 < 10) {
                showToast('⏰ 你的時間投入似乎過少！', 'error');
                return;
            }
            
            var actionPlan5Input = document.getElementById('actionPlan5');
            if (!actionPlan5Input || !actionPlan5Input.value.trim()) {
                showToast('📝 請填寫你的五年行動計劃再繼續！', 'error');
                return;
            }
            
            planData.actionPlan5 = actionPlan5Input.value.trim();
            
            var satisfaction5Checkbox = document.getElementById('satisfaction5');
            if (!satisfaction5Checkbox || !satisfaction5Checkbox.checked) {
                showToast('✅ 請確認你對這個五年規劃滿意後再繼續！', 'error');
                return;
            }
            
            showToast('🚀 很棒！五年規劃完成！', 'success');
        } else if (currentStep === 3) {
            var sliders1 = document.querySelectorAll('#timeAllocation1 .slider-container');
            var hasAdjustedTime1 = false;
            for (var i = 0; i < sliders1.length; i++) {
                if (sliders1[i].getValue && sliders1[i].getValue() > 1) {
                    hasAdjustedTime1 = true;
                }
            }
            
            if (!hasAdjustedTime1) {
                showToast('⏰ 請調整你的一年時間分配！', 'error');
                return;
            }
            
            var total1 = calculateTotalTime('1');
            if (total1 > 168) {
                showToast('⚠️ 時間分配超過限制！', 'error');
                return;
            }
            if (total1 < 10) {
                showToast('⏰ 你的時間投入似乎過少！', 'error');
                return;
            }
            
            var actionPlan1Input = document.getElementById('actionPlan1');
            if (!actionPlan1Input || !actionPlan1Input.value.trim()) {
                showToast('📝 請填寫你的一年行動計劃再繼續！', 'error');
                return;
            }
            
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
            
            createCompletionPage();
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
                
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                setTimeout(function() {
                    nextEl.classList.add('active');
                    if (currentStep === 1) {
                        createTimeAllocation('10');
                    } else if (currentStep === 2) {
                        var visionDisplay2 = document.getElementById('vision50Display2');
                        var visionReminder2 = document.getElementById('vision50Reminder2');
                        if (visionDisplay2 && planData.vision50) {
                            visionDisplay2.textContent = planData.vision50;
                        }
                        if (visionReminder2) {
                            visionReminder2.style.display = 'block';
                        }
                        showStep1Reference();
                        copyPrioritiesToNextStep('priorities10', 'priorities5');
                        setTimeout(function() { 
                            createTimeAllocation('5'); 
                        }, 300);
                    } else if (currentStep === 3) {
                        var visionDisplay3 = document.getElementById('vision50Display3');
                        var visionReminder3 = document.getElementById('vision50Reminder3');
                        if (visionDisplay3 && planData.vision50) {
                            visionDisplay3.textContent = planData.vision50;
                        }
                        if (visionReminder3) {
                            visionReminder3.style.display = 'block';
                        }
                        showStep1And2Reference();
                        copyPrioritiesToNextStep('priorities5', 'priorities1');
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

// 上一步功能
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
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            setTimeout(function() {
                prevEl.classList.add('active');
            }, 100);
        }
        updateProgress();
    }
}

// 更新進度條
function updateProgress() {
    var progress = (currentStep / totalSteps) * 100;
    var progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
}

// 複製優先級到下一步驟
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
    
    // 保存當前時間分配
    var savedTimeAllocation = {};
    var currentStep = fromId.replace('priorities', '');
    var sliders = document.querySelectorAll('#timeAllocation' + currentStep + ' .slider-container');
    for (var i = 0; i < sliders.length; i++) {
        var priority = sliders[i].dataset.priority;
        if (priority && sliders[i].getValue) {
            savedTimeAllocation[priority] = sliders[i].getValue();
        }
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
    
    // 保存時間分配
    window.savedTimeAllocationForNextStep = savedTimeAllocation;
    
    setTimeout(function() {
        initializeDragAndDrop();
    }, 100);
}

// 顯示第一步規劃結果
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

// 顯示第一步和第二步規劃結果
function showStep1And2Reference() {
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

// 創建完成頁面
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
    
    var priorities10 = getPriorities('priorities10');
    var timeAllocation10 = getTimeAllocation('10');
    var total10 = calculateTotalTime('10');
    
    var priorities5 = getPriorities('priorities5');
    var timeAllocation5 = getTimeAllocation('5');
    var total5 = calculateTotalTime('5');
    
    var priorities1 = getPriorities('priorities1');
    var timeAllocation1 = getTimeAllocation('1');
    var total11 = calculateTotalTime('1');
    
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
        
        '<div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); border: 3px solid #4caf50; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 1.3rem;">🎯 你的五十歲願景</h3>' +
        '<p style="color: #1b5e20; line-height: 1.6; font-style: italic; font-size: 1.1rem;">' + planData.vision50 + '</p>' +
        '</div>' +
        
        '<div style="background: linear-gradient(135deg, #fff8e1, #ffecb3); border: 3px solid #ffc107; border-radius: 15px; padding: 25px; margin-bottom: 20px;">' +
        '<h3 style="color: #e65100; margin-bottom: 20px; font-size: 1.3rem;">📊 你的十年規劃</h3>' +
        '<div style="margin-bottom: 15px;">' +
        '<strong style="color: #ef6c00; font-size: 1.1rem;">總投入時間：' + total10 + ' / 168 小時 (' + ((total10/168)*100).toFixed(1) + '%)</strong>' +
        '</div>' +
        makeSliderList(priorities10, timeAllocation10, '#ef6c00') +
        (planData.actionPlan10 ? '<div style="background: rgba(239, 108, 0, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;"><strong style="color: #ef6c00;">📋 十年行動計劃：</strong><br><span style="color: #ef6c00; line-height: 1.5;">' + planData.actionPlan10 + '</span></div>' : '') +
        '</div>' +
        
        '<div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); border: 3px solid #9c27b0; border-radius: 15px; padding: 25px; margin-bottom: 20px;">' +
        '<h3 style="color: #4a148c; margin-bottom: 20px; font-size: 1.3rem;">📋 你的五年規劃</h3>' +
        '<div style="margin-bottom: 15px;">' +
        '<strong style="color: #6a1b9a; font-size: 1.1rem;">總投入時間：' + total5 + ' / 168 小時 (' + ((total5/168)*100).toFixed(1) + '%)</strong>' +
        '</div>' +
        makeSliderList(priorities5, timeAllocation5, '#6a1b9a') +
        (planData.actionPlan5 ? '<div style="background: rgba(106, 27, 154, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;"><strong style="color: #6a1b9a;">📋 五年行動計劃：</strong><br><span style="color: #6a1b9a; line-height: 1.5;">' + planData.actionPlan5 + '</span></div>' : '') +
        '</div>' +
        
        '<div style="background: white; border: 3px solid #607d8b; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h3 style="color: #455a64; margin-bottom: 20px; font-size: 1.3rem;">🚀 你的一年規劃（重點）</h3>' +
        '<div style="margin-bottom: 20px;">' +
        '<strong style="color: #607d8b; font-size: 1.2rem;">總投入時間：' + total11 + ' / 168 小時 (' + ((total11/168)*100).toFixed(1) + '%)</strong>' +
        '</div>' +
        makeSliderList(priorities1, timeAllocation1, '#607d8b') +
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
        '<h4 style="color: white; font-size: 1.2rem; margin: 0 0 15px 0; font-weight: 600;">您好，我是職海中的PM旅人</h4>' +
        '<p style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 1rem; margin: 15px 0;">在職場的海洋中載浮載沉，我願意作為你的旅伴<br>為你點亮一盞明燈，陪你照亮職涯的每一哩路</p>' +
        '<p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin: 20px 0 10px 0;">📚 我的職涯文章分享</p>' +
        '<a href="https://vocus.cc/tags/%E8%81%B7%E6%B5%B7%E4%B8%AD%E7%9A%84PM%E6%97%85%E4%BA%BA" target="_blank" style="color: white; text-decoration: underline; font-size: 0.9rem; opacity: 0.9;">職海中的PM旅人 - 過往文章</a>' +
        '</div>' +
        '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: center; margin: 25px 0;">' +
        '<div style="text-align: center; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">' +
        '<img src="line-qrcode.png" alt="LINE QR Code" style="width: 120px; height: 120px; border-radius: 8px; display: block;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div style="width: 120px; height: 120px; background: #00C300; color: white; display: none; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; border-radius: 8px;">LINE QR</div>' +
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
        '<div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">' +
        '<p style="color: rgba(255,255,255,0.9); font-size: 1rem; font-weight: 600;">🚢 期待與你在職海中一起乘風破浪！</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        
        '<div class="buttons">' +
        '<button class="btn btn-secondary" onclick="location.reload()">重新規劃</button>' +
        '<button class="btn btn-primary" onclick="downloadPlanAsPDF()">下載完整規劃 (PNG圖片)</button>' +
        '</div>';
    
    container.appendChild(completionPage);
    var progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = '100%';
    }
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
    planData.immediateAction3months = immediateActionInput.value.trim();
    planData.immediateActionSaved = true;
    saveButton.style.display = 'none';
    editButton.style.display = 'inline-block';
    saveStatus.textContent = '✅ 已儲存';
    saveStatus.style.color = '#4caf50';
    saveStatus.style.fontWeight = '600';
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
    saveButton.style.display = 'inline-block';
    saveButton.textContent = '💾 儲存修改';
    saveButton.style.background = '#2196f3';
    editButton.style.display = 'none';
    saveStatus.textContent = '✏️ 編輯中';
    saveStatus.style.color = '#ff9800';
    saveStatus.style.fontWeight = '600';
    immediateActionInput.disabled = false;
    immediateActionInput.style.background = 'white';
    immediateActionInput.style.borderColor = '#2196f3';
    immediateActionInput.focus();
    showToast('✏️ 現在可以修改你的三個月行動計劃', 'info');
}

// 下載功能
function downloadPlanAsPDF() {
    if (!planData.immediateActionSaved) {
        showToast('⚠️ 請先儲存你的三個月立即行動計劃才能下載完整規劃！', 'error');
        return;
    }
    
    var progressIndicator = document.getElementById('downloadProgress');
    if (progressIndicator) {
        progressIndicator.style.display = 'block';
    }
    
    showToast('📸 正在生成規劃圖片...', 'info');
    setTimeout(function() {
        generateImageDownload();
    }, 500);
}

// 生成圖片下載
function generateImageDownload() {
    var planContent = null;
    
    try {
        planContent = document.createElement('div');
        planContent.id = 'planContentForImage';
        planContent.style.cssText = 'position: absolute; left: -9999px; width: 1200px; padding: 40px; background: white; font-family: "Microsoft JhengHei", sans-serif; line-height: 1.6;';
        
        planContent.innerHTML = generatePlanHTML();
        document.body.appendChild(planContent);
        
        setTimeout(function() {
            if (typeof html2canvas !== 'undefined') {
                html2canvas(planContent, {
                    scale: 1.5,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: 1280,
                    height: planContent.scrollHeight + 100
                }).then(function(canvas) {
                    try {
                        canvas.toBlob(function(blob) {
                            if (blob) {
                                downloadBlob(blob);
                                cleanupAndHideProgress(planContent);
                                showToast('📸 規劃圖片已成功下載！', 'success');
                            } else {
                                throw new Error('無法生成圖片 Blob');
                            }
                        }, 'image/png', 0.95);
                    } catch (error) {
                        console.error('Canvas to blob error:', error);
                        cleanupAndFallback(planContent);
                    }
                }).catch(function(error) {
                    console.error('html2canvas error:', error);
                    cleanupAndFallback(planContent);
                });
            } else {
                console.warn('html2canvas not available');
                cleanupAndFallback(planContent);
            }
        }, 200);
        
    } catch (error) {
        console.error('Error in generateImageDownload:', error);
        cleanupAndFallback(planContent);
    }
}

// 下載 Blob 的輔助函數
function downloadBlob(blob) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    var now = new Date();
    var dateStr = now.getFullYear() + 
        String(now.getMonth() + 1).padStart(2, '0') + 
        String(now.getDate()).padStart(2, '0');
    
    link.download = '我的人生規劃_' + dateStr + '.png';
    link.href = url;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(function() {
        URL.revokeObjectURL(url);
    }, 100);
}

// 清理並隱藏進度條
function cleanupAndHideProgress(planContent) {
    if (planContent && document.body.contains(planContent)) {
        document.body.removeChild(planContent);
    }
    var progressIndicator = document.getElementById('downloadProgress');
    if (progressIndicator) {
        progressIndicator.style.display = 'none';
    }
}

// 清理並回退到文字版
function cleanupAndFallback(planContent) {
    cleanupAndHideProgress(planContent);
    showToast('⚠️ 圖片生成失敗，改用文字版下載...', 'warning');
    setTimeout(function() {
        fallbackTextDownload();
    }, 500);
}

// 生成規劃的 HTML 內容
function generatePlanHTML() {
    var priorities10 = getPriorities('priorities10');
    var timeAllocation10 = getTimeAllocation('10');
    var total10 = calculateTotalTime('10');
    
    var priorities5 = getPriorities('priorities5');
    var timeAllocation5 = getTimeAllocation('5');
    var total5 = calculateTotalTime('5');
    
    var priorities1 = getPriorities('priorities1');
    var timeAllocation1 = getTimeAllocation('1');
    var total1 = calculateTotalTime('1');
    
    var html = '<div style="text-align: center; margin-bottom: 40px;">' +
        '<h1 style="color: #2e7d32; font-size: 3rem; margin-bottom: 10px;">我的人生規劃</h1>' +
        '<p style="color: #666; font-size: 1.2rem;">規劃日期：' + new Date().toLocaleDateString('zh-TW') + '</p>' +
        '</div>';
    
    // 五十歲願景
    html += '<div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); border: 3px solid #4caf50; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h2 style="color: #2e7d32; margin-bottom: 15px;">🎯 五十歲願景</h2>' +
        '<p style="color: #1b5e20; line-height: 1.8; font-size: 1.1rem;">' + (planData.vision50 || '未填寫') + '</p>' +
        '</div>';
    
    // 十年規劃
    html += '<div style="background: linear-gradient(135deg, #fff8e1, #ffecb3); border: 3px solid #ffc107; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h2 style="color: #e65100; margin-bottom: 20px;">📊 十年規劃</h2>' +
        '<p style="color: #ef6c00; font-size: 1.1rem; margin-bottom: 20px;"><strong>總投入時間：' + total10 + ' / 168 小時 (' + ((total10/168)*100).toFixed(1) + '%)</strong></p>';
    
    for (var i = 0; i < priorities10.length; i++) {
        var hours10 = timeAllocation10[priorities10[i]] || 0;
        var percentage10 = ((hours10 / 168) * 100).toFixed(1);
        var sliderWidth10 = Math.min((hours10 / 60) * 100, 100);
        
        html += '<div style="margin: 15px 0; padding: 15px; background: white; border-radius: 10px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
            '<span style="font-weight: bold; color: #e65100; font-size: 1rem;">' + (i + 1) + '. ' + priorities10[i] + '</span>' +
            '<span style="color: #ef6c00; font-weight: bold;">' + hours10 + ' 小時 (' + percentage10 + '%)</span>' +
            '</div>' +
            '<div style="position: relative; width: 100%; height: 25px; background: #e9ecef; border-radius: 12px; overflow: visible;">' +
            '<div style="position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, #ffc107, #ff9800); border-radius: 12px; width: ' + sliderWidth10 + '%;"></div>' +
            '<div style="position: absolute; top: 50%; left: ' + sliderWidth10 + '%; width: 20px; height: 20px; background: white; border: 3px solid #ff9800; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>' +
            '</div>' +
            '</div>';
    }
    
    if (planData.actionPlan10) {
        html += '<div style="background: rgba(239, 108, 0, 0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">' +
            '<strong style="color: #ef6c00;">📋 十年行動計劃：</strong><br>' +
            '<span style="color: #ef6c00;">' + planData.actionPlan10 + '</span>' +
            '</div>';
    }
    html += '</div>';
    
    // 五年規劃
    html += '<div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); border: 3px solid #9c27b0; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h2 style="color: #4a148c; margin-bottom: 20px;">📋 五年規劃</h2>' +
        '<p style="color: #6a1b9a; font-size: 1.1rem; margin-bottom: 20px;"><strong>總投入時間：' + total5 + ' / 168 小時 (' + ((total5/168)*100).toFixed(1) + '%)</strong></p>';
    
    for (var i = 0; i < priorities5.length; i++) {
        var hours5 = timeAllocation5[priorities5[i]] || 0;
        var percentage5 = ((hours5 / 168) * 100).toFixed(1);
        var sliderWidth5 = Math.min((hours5 / 60) * 100, 100);
        
        html += '<div style="margin: 15px 0; padding: 15px; background: white; border-radius: 10px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
            '<span style="font-weight: bold; color: #4a148c; font-size: 1rem;">' + (i + 1) + '. ' + priorities5[i] + '</span>' +
            '<span style="color: #6a1b9a; font-weight: bold;">' + hours5 + ' 小時 (' + percentage5 + '%)</span>' +
            '</div>' +
            '<div style="position: relative; width: 100%; height: 25px; background: #e9ecef; border-radius: 12px; overflow: visible;">' +
            '<div style="position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, #9c27b0, #6a1b9a); border-radius: 12px; width: ' + sliderWidth5 + '%;"></div>' +
            '<div style="position: absolute; top: 50%; left: ' + sliderWidth5 + '%; width: 20px; height: 20px; background: white; border: 3px solid #9c27b0; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>' +
            '</div>' +
            '</div>';
    }
    
    if (planData.actionPlan5) {
        html += '<div style="background: rgba(106, 27, 154, 0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">' +
            '<strong style="color: #6a1b9a;">📋 五年行動計劃：</strong><br>' +
            '<span style="color: #6a1b9a;">' + planData.actionPlan5 + '</span>' +
            '</div>';
    }
    html += '</div>';
    
    // 一年規劃
    html += '<div style="background: white; border: 3px solid #607d8b; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
        '<h2 style="color: #455a64; margin-bottom: 20px;">🚀 一年規劃（重點執行）</h2>' +
        '<p style="color: #607d8b; font-size: 1.1rem; margin-bottom: 20px;"><strong>總投入時間：' + total1 + ' / 168 小時 (' + ((total1/168)*100).toFixed(1) + '%)</strong></p>';
    
    for (var i = 0; i < priorities1.length; i++) {
        var hours1 = timeAllocation1[priorities1[i]] || 0;
        var percentage1 = ((hours1 / 168) * 100).toFixed(1);
        var sliderWidth1 = Math.min((hours1 / 60) * 100, 100);
        
        html += '<div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
            '<span style="font-weight: bold; color: #455a64; font-size: 1rem;">' + (i + 1) + '. ' + priorities1[i] + '</span>' +
            '<span style="color: #607d8b; font-weight: bold;">' + hours1 + ' 小時 (' + percentage1 + '%)</span>' +
            '</div>' +
            '<div style="position: relative; width: 100%; height: 25px; background: #e9ecef; border-radius: 12px; overflow: visible;">' +
            '<div style="position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, #607d8b, #455a64); border-radius: 12px; width: ' + sliderWidth1 + '%;"></div>' +
            '<div style="position: absolute; top: 50%; left: ' + sliderWidth1 + '%; width: 20px; height: 20px; background: white; border: 3px solid #607d8b; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>' +
            '</div>' +
            '</div>';
    }
    
    if (planData.actionPlan1) {
        html += '<div style="background: rgba(96, 125, 139, 0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">' +
            '<strong style="color: #607d8b;">📋 一年行動計劃：</strong><br>' +
            '<span style="color: #607d8b;">' + planData.actionPlan1 + '</span>' +
            '</div>';
    }
    html += '</div>';
    
    // 三個月立即行動
    if (planData.immediateAction3months) {
        html += '<div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 3px solid #2196f3; border-radius: 15px; padding: 25px; margin-bottom: 30px;">' +
            '<h2 style="color: #1565c0; margin-bottom: 15px;">💡 三個月立即行動</h2>' +
            '<p style="color: #1976d2; line-height: 1.8;">' + planData.immediateAction3months + '</p>' +
            '</div>';
    }
    
    // 職涯諮詢資訊
    html += '<div style="background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 15px; padding: 30px; margin-top: 40px; color: white;">' +
        '<h2 style="color: white; text-align: center; margin-bottom: 20px;">🌟 對你的人生與生涯有迷惘嗎？</h2>' +
        '<div style="text-align: center;">' +
        '<h3 style="color: white; margin-bottom: 15px;">您好，我是職海中的PM旅人</h3>' +
        '<p style="color: white; line-height: 1.8; margin-bottom: 20px;">在職場的海洋中載浮載沉，我願意作為你的旅伴<br>為你點亮一盞明燈，陪你照亮職涯的每一哩路</p>' +
        '<p style="color: white; font-size: 0.9rem; margin-bottom: 10px;">📚 我的職涯文章分享</p>' +
        '<p style="color: white; text-decoration: underline; margin-bottom: 30px;">職海中的PM旅人 - 過往文章</p>' +
        '</div>' +
        '<div style="background: rgba(255,255,255,0.2); padding: 25px; border-radius: 15px; text-align: center;">' +
        '<h4 style="color: white; margin-bottom: 20px; font-size: 1.3rem;">📞 聯絡方式</h4>' +
        '<div style="background: #00C300; color: white; padding: 20px; border-radius: 15px; margin: 20px auto; max-width: 400px;">' +
        '<div style="font-size: 2rem; margin-bottom: 10px;">📱</div>' +
        '<p style="margin: 10px 0; font-size: 1.2rem; font-weight: bold;">LINE ID：@tnb0485u</p>' +
        '<p style="margin: 5px 0; font-size: 0.9rem;">（第6個字是數字0）</p>' +
        '<div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px; margin-top: 15px;">' +
        '<p style="margin: 0; font-size: 0.9rem;">掃描QR Code或直接加LINE</p>' +
        '</div>' +
        '</div>' +
        '<p style="color: white; font-size: 1rem; margin-top: 20px;">💬 點擊連結直接加LINE：https://lin.ee/L0c0DAz</p>' +
        '</div>' +
        '<p style="color: white; text-align: center; margin-top: 30px; font-size: 1.1rem; font-weight: bold;">🚢 期待與你在職海中一起乘風破浪！</p>' +
        '</div>';
    
    return html;
}

// 純文字下載
function fallbackTextDownload() {
    try {
        var textContent = generateTextPlan();
        var blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        var now = new Date();
        var dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
        
        link.download = '我的人生規劃_' + dateStr + '.txt';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        var progressIndicator = document.getElementById('downloadProgress');
        if (progressIndicator) {
            progressIndicator.style.display = 'none';
        }
        
        showToast('📄 已下載文字版規劃！', 'success');
    } catch (error) {
        console.error('Text download error:', error);
        var progressIndicator = document.getElementById('downloadProgress');
        if (progressIndicator) {
            progressIndicator.style.display = 'none';
        }
        showToast('⚠️ 下載失敗，請手動複製畫面內容', 'error');
    }
}

// 生成純文字版規劃
function generateTextPlan() {
    var content = '====================================\n';
    content += '           我的人生規劃\n';
    content += '====================================\n\n';
    
    content += '🎯 五十歲願景\n';
    content += '─────────────────────────\n';
    content += planData.vision50 + '\n\n';
    
    var priorities10 = getPriorities('priorities10');
    var timeAllocation10 = getTimeAllocation('10');
    var total10 = calculateTotalTime('10');
    
    content += '📊 十年規劃\n';
    content += '─────────────────────────\n';
    content += '總投入時間：' + total10 + ' / 168 小時 (' + ((total10/168)*100).toFixed(1) + '%)\n\n';
    content += '優先順序與時間分配：\n';
    for (var i = 0; i < priorities10.length; i++) {
        var hours = timeAllocation10[priorities10[i]] || 0;
        var percentage = ((hours / 168) * 100).toFixed(1);
        content += (i + 1) + '. ' + priorities10[i] + '：' + hours + ' 小時 (' + percentage + '%)\n';
    }
    if (planData.actionPlan10) {
        content += '\n十年行動計劃：\n' + planData.actionPlan10 + '\n';
    }
    content += '\n';
    
    var priorities5 = getPriorities('priorities5');
    var timeAllocation5 = getTimeAllocation('5');
    var total5 = calculateTotalTime('5');
    
    content += '📋 五年規劃\n';
    content += '─────────────────────────\n';
    content += '總投入時間：' + total5 + ' / 168 小時 (' + ((total5/168)*100).toFixed(1) + '%)\n\n';
    content += '優先順序與時間分配：\n';
    for (var i = 0; i < priorities5.length; i++) {
        var hours = timeAllocation5[priorities5[i]] || 0;
        var percentage = ((hours / 168) * 100).toFixed(1);
        content += (i + 1) + '. ' + priorities5[i] + '：' + hours + ' 小時 (' + percentage + '%)\n';
    }
    if (planData.actionPlan5) {
        content += '\n五年行動計劃：\n' + planData.actionPlan5 + '\n';
    }
    content += '\n';
    
    var priorities1 = getPriorities('priorities1');
    var timeAllocation1 = getTimeAllocation('1');
    var total1 = calculateTotalTime('1');
    
    content += '🚀 一年規劃（重點執行）\n';
    content += '─────────────────────────\n';
    content += '總投入時間：' + total1 + ' / 168 小時 (' + ((total1/168)*100).toFixed(1) + '%)\n\n';
    content += '優先順序與時間分配：\n';
    for (var i = 0; i < priorities1.length; i++) {
        var hours = timeAllocation1[priorities1[i]] || 0;
        var percentage = ((hours / 168) * 100).toFixed(1);
        content += (i + 1) + '. ' + priorities1[i] + '：' + hours + ' 小時 (' + percentage + '%)\n';
    }
    if (planData.actionPlan1) {
        content += '\n一年行動計劃：\n' + planData.actionPlan1 + '\n';
    }
    content += '\n';
    
    if (planData.immediateAction3months) {
        content += '💡 三個月立即行動\n';
        content += '─────────────────────────\n';
        content += planData.immediateAction3months + '\n\n';
    }
    
    content += '💡 下一步建議\n';
    content += '─────────────────────────\n';
    content += '• 將這個規劃保存下來，定期回顧和調整\n';
    content += '• 專注執行一年計畫，這是最關鍵的行動指南\n';
    content += '• 每季檢視進度，確保朝著五十歲願景前進\n';
    content += '• 記錄實際時間分配，與規劃進行對比調整\n\n';
    
    content += '🌟 對你的人生與生涯有迷惘嗎？\n';
    content += '====================================\n';
    content += '**您好，我是職海中的PM旅人**\n\n';
    content += '在職場的海洋中載浮載沉，我願意作為你的旅伴\n';
    content += '為你點亮一盞明燈，陪你照亮職涯的每一哩路\n\n';
    content += '📚 我的職涯文章分享\n';
    content += '職海中的PM旅人 - 過往文章\n';
    content += 'https://vocus.cc/tags/職海中的PM旅人\n\n';
    content += '📞 聯絡方式\n';
    content += 'LINE ID：**@tnb0485u**（第6個字是數字0）\n';
    content += '點我直接加LINE：https://lin.ee/L0c0DAz\n\n';
    content += '**🚢 期待與你在職海中一起乘風破浪！**\n\n';
    
    content += '====================================\n';
    content += '    規劃日期：' + new Date().toLocaleDateString('zh-TW') + '\n';
    content += '====================================\n';
    
    return content;
}

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

// 編輯優先級項目
function editPriority(btn) {
    var priorityItem = btn.closest('.priority-item');
    var textSpan = priorityItem.querySelector('.priority-text');
    var currentText = textSpan.textContent.trim();
    
    if (priorityItem.querySelector('input')) return;
    
    // 保存當前的時間分配值
    var activeStep = document.querySelector('.step-card.active');
    var savedValues = {};
    if (activeStep) {
        var stepId = activeStep.id;
        var step = stepId === 'step1' ? '10' : (stepId === 'step2' ? '5' : (stepId === 'step3' ? '1' : ''));
        if (step) {
            var sliders = document.querySelectorAll('#timeAllocation' + step + ' .slider-container');
            for (var i = 0; i < sliders.length; i++) {
                var priority = sliders[i].dataset.priority;
                if (priority) {
                    savedValues[priority] = sliders[i].getValue ? sliders[i].getValue() : 1;
                }
            }
        }
    }
    
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
        
        // 更新時間分配的key
        if (savedValues[currentText] !== undefined) {
            savedValues[newText] = savedValues[currentText];
            delete savedValues[currentText];
        }
        
        textSpan.textContent = newText;
        restoreDisplay();
        showToast('編輯成功！', 'success');
        
        // 重建時間分配並恢復值
        if (activeStep) {
            var stepId = activeStep.id;
            if (stepId === 'step1') {
                createTimeAllocationWithValues('10', savedValues);
            } else if (stepId === 'step2') {
                createTimeAllocationWithValues('5', savedValues);
            } else if (stepId === 'step3') {
                createTimeAllocationWithValues('1', savedValues);
            }
        }
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
    
    // 保存當前的時間分配值
    var activeStep = document.querySelector('.step-card.active');
    var savedValues = {};
    if (activeStep) {
        var stepId = activeStep.id;
        var step = stepId === 'step1' ? '10' : (stepId === 'step2' ? '5' : (stepId === 'step3' ? '1' : ''));
        if (step) {
            var sliders = document.querySelectorAll('#timeAllocation' + step + ' .slider-container');
            for (var i = 0; i < sliders.length; i++) {
                var priority = sliders[i].dataset.priority;
                if (priority && priority !== itemName) {  // 不保存被刪除項目的值
                    savedValues[priority] = sliders[i].getValue ? sliders[i].getValue() : 1;
                }
            }
        }
    }
    
    container.removeChild(priorityItem);
    updatePriorityRanks();
    
    // 重建時間分配並恢復值
    if (activeStep) {
        var stepId = activeStep.id;
        if (stepId === 'step1') {
            createTimeAllocationWithValues('10', savedValues);
        } else if (stepId === 'step2') {
            createTimeAllocationWithValues('5', savedValues);
        } else if (stepId === 'step3') {
            createTimeAllocationWithValues('1', savedValues);
        }
    }
    
    showToast('已刪除「' + itemName + '」', 'success');
}

// 新增優先級項目
function addNewPriority() {
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

// 確認新增項目
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
    
    // 保存當前的時間分配值
    var activeStep = document.querySelector('.step-card.active');
    var savedValues = {};
    if (activeStep) {
        var stepId = activeStep.id;
        var step = stepId === 'step1' ? '10' : (stepId === 'step2' ? '5' : (stepId === 'step3' ? '1' : ''));
        if (step) {
            var sliders = document.querySelectorAll('#timeAllocation' + step + ' .slider-container');
            for (var i = 0; i < sliders.length; i++) {
                var priority = sliders[i].dataset.priority;
                if (priority) {
                    savedValues[priority] = sliders[i].getValue ? sliders[i].getValue() : 1;
                }
            }
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
    
    // 給新項目設定默認值1小時
    savedValues[newText] = 1;
    
    // 重建時間分配並恢復值
    if (activeStep) {
        var stepId = activeStep.id;
        if (stepId === 'step1') {
            createTimeAllocationWithValues('10', savedValues);
        } else if (stepId === 'step2') {
            createTimeAllocationWithValues('5', savedValues);
        } else if (stepId === 'step3') {
            createTimeAllocationWithValues('1', savedValues);
        }
    }
    
    showToast('已新增「' + newText + '」', 'success');
}

// 取消新增項目
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
    
    // 保存當前的時間分配值
    var activeStep = document.querySelector('.step-card.active');
    var savedValues = {};
    if (activeStep) {
        var stepId = activeStep.id;
        var step = stepId === 'step1' ? '10' : (stepId === 'step2' ? '5' : (stepId === 'step3' ? '1' : ''));
        if (step) {
            var sliders = document.querySelectorAll('#timeAllocation' + step + ' .slider-container');
            for (var i = 0; i < sliders.length; i++) {
                var priority = sliders[i].dataset.priority;
                if (priority) {
                    savedValues[priority] = sliders[i].getValue ? sliders[i].getValue() : 1;
                }
            }
        }
    }
    
    for (var i = 0; i < items.length; i++) {
        var rank = items[i].querySelector('.priority-rank');
        if (rank) {
            rank.textContent = i + 1;
        }
    }
    
    // 重建時間分配並恢復值
    if (activeStep) {
        var stepId = activeStep.id;
        if (stepId === 'step1') {
            setTimeout(function() { createTimeAllocationWithValues('10', savedValues); }, 100);
        } else if (stepId === 'step2') {
            setTimeout(function() { createTimeAllocationWithValues('5', savedValues); }, 100);
        } else if (stepId === 'step3') {
            setTimeout(function() { createTimeAllocationWithValues('1', savedValues); }, 100);
        }
    }
}

// 創建時間分配（帶有預設值）
function createTimeAllocationWithValues(step, savedValues) {
    step = step || '10';
    savedValues = savedValues || window.savedTimeAllocationForNextStep || {};
    var container = document.getElementById('timeAllocation' + step);
    var priorities = getPriorities('priorities' + step);
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < priorities.length; i++) {
        var timeItem = document.createElement('div');
        timeItem.className = 'time-item';
        var savedValue = savedValues[priorities[i]] || 1;
        timeItem.innerHTML = '<label>' + priorities[i] + '</label>' +
            '<div class="slider-container" data-priority="' + priorities[i] + '">' +
            '<div class="slider-fill"></div>' +
            '<div class="slider-thumb"></div>' +
            '</div>' +
            '<div class="time-display">' + savedValue + ' 小時 (' + (savedValue/168*100).toFixed(1) + '%)</div>';
        container.appendChild(timeItem);
        initCustomSlider(timeItem.querySelector('.slider-container'), step, savedValue);
    }
    updateTotalTime(step);
}

// 創建時間分配
function createTimeAllocation(step) {
    step = step || '10';
    var container = document.getElementById('timeAllocation' + step);
    var priorities = getPriorities('priorities' + step);
    if (!container) return;
    
    // 如果有保存的時間分配，使用它
    var savedValues = window.savedTimeAllocationForNextStep || {};
    
    container.innerHTML = '';
    for (var i = 0; i < priorities.length; i++) {
        var timeItem = document.createElement('div');
        timeItem.className = 'time-item';
        var initialValue = savedValues[priorities[i]] || 1;
        timeItem.innerHTML = '<label>' + priorities[i] + '</label>' +
            '<div class="slider-container" data-priority="' + priorities[i] + '">' +
            '<div class="slider-fill"></div>' +
            '<div class="slider-thumb"></div>' +
            '</div>' +
            '<div class="time-display">' + initialValue + ' 小時 (' + (initialValue/168*100).toFixed(1) + '%)</div>';
        container.appendChild(timeItem);
        initCustomSlider(timeItem.querySelector('.slider-container'), step, initialValue);
    }
    updateTotalTime(step);
    
    // 清除保存的值，避免影響後續操作
    if (window.savedTimeAllocationForNextStep) {
        delete window.savedTimeAllocationForNextStep;
    }
}

// 初始化自定義滑桿
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

// 更新總時間
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

// 計算總時間
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

// 取得時間分配
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

// 取得優先級
function getPriorities(containerId) {
    containerId = containerId || 'priorities10';
    var items = document.querySelectorAll('#' + containerId + ' .priority-item .priority-text');
    var priorities = [];
    for (var i = 0; i < items.length; i++) {
        priorities.push(items[i].textContent.trim());
    }
    return priorities;
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

// 取得拖拽後的元素位置
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

// 初始化拖放功能
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