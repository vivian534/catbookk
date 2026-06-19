// ============================================================
//  CatBook 数据加载器 v5.0（极速首发版 - 25MB 即可搜索）
// ============================================================

const DATA_VERSION = '20260616';     // 改成当天日期
const MAX_PART_NUMBER = 4;           // 你合并成了 4 个
let loadedCount = 0;
let isEarlyReady = false;            // 是否已提前解锁搜索
let isAllDone = false;

window.dataset = window.dataset || [];

// 加载单个 part 文件
function loadPart(index) {
    const script = document.createElement('script');
    script.src = `part_${index}.js?v=${DATA_VERSION}`;

    script.onload = () => {
        const partData = window[`_part${index}`];
        if (partData && Array.isArray(partData)) {
            window.dataset.push(...partData);
            console.log(`✅ part_${index}.js 加载完成，累计 ${window.dataset.length} 条`);
        } else {
            console.warn(`⚠️ part_${index}.js 数据无效`);
        }
        delete window[`_part${index}`];
        loadedCount++;

        // ========== 🚀 核心改动：只要第一个文件加载完，就亮按钮 ==========
        if (!isEarlyReady && loadedCount >= 1) {
            isEarlyReady = true;
            console.log('⚡ 首批数据就绪（25MB），提前解锁搜索按钮！');
            // 触发页面中的 datasetReady 事件，让“立即查询”变亮
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new Event('datasetReady'));
            }
            // 修改页面提示文字
            const hint = document.getElementById('loadHint');
            if (hint) {
                hint.innerHTML = '⚡ 基础数据已就绪，剩余资源后台加载中（不影响搜索）';
                hint.style.color = '#d35400';
            }
            // 关掉顶部的 loading toast
            const toast = document.querySelector('.loading-toast[data-early="true"]');
            if (toast) {
                toast.style.opacity = '0';
                setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 500);
            }
        }

        // 检查是否全部加载完成（用于最终统计）
        if (loadedCount === MAX_PART_NUMBER) {
            allDone();
        }
    };

    script.onerror = () => {
        console.error(`❌ part_${index}.js 加载失败，已跳过`);
        loadedCount++;
        if (loadedCount === MAX_PART_NUMBER) {
            allDone();
        }
    };

    document.head.appendChild(script);
}

// 全部加载完成（最终收尾，不影响搜索功能）
function allDone() {
    if (isAllDone) return;
    isAllDone = true;
    console.log(`🎉 全部 ${MAX_PART_NUMBER} 个文件加载完成，总计 ${window.dataset.length} 条`);

    // 如果提前解锁时没触发过（兜底），这里再触发一次
    if (!isEarlyReady) {
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new Event('datasetReady'));
        }
    }

    // 更新最终提示
    const hint = document.getElementById('loadHint');
    if (hint && isEarlyReady) {
        hint.innerHTML = `✅ 全部资源加载完成（共 ${window.dataset.length} 条），可搜索`;
        hint.style.color = '#2c6e3c';
    }
}

// ========== 启动加载：一次性并行加载全部 4 个 ==========
console.log('🚀 开始并行加载 4 个数据包（25MB × 4）...');
for (let i = 1; i <= MAX_PART_NUMBER; i++) {
    loadPart(i);
}

// 兜底：万一第一个文件加载失败卡住，40秒后强制亮按钮
setTimeout(function() {
    if (!isEarlyReady) {
        console.warn('⏰ 首个文件加载超时，强制启用搜索（可能数据不全）');
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new Event('datasetReady'));
        }
        isEarlyReady = true;
    }
}, 40000);