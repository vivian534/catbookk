// ============================================================
//  CatBook 数据加载器 v2.1（精简版 - 分批加载 + 无进度）
// ============================================================

// ★★★★★ 每次添加新资源时，修改下面两个配置 ★★★★★
const DATA_VERSION = '20260617';     // 改成当天日期
const MAX_PART_NUMBER = 57;          // 改成你最新的 part 文件编号
const BATCH_SIZE = 5;                // 每批同时加载 5 个

// ============================================================

window.dataset = window.dataset || [];
let loadedCount = 0;
let currentIndex = 1;
let isAllDone = false;

// 全部加载完成
function allDone() {
    if (isAllDone) return;
    isAllDone = true;
    console.log(`🎉 所有 ${MAX_PART_NUMBER} 个 part 文件加载完成，总计 ${window.dataset.length} 条`);
    if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('datasetReady'));
    }
    if (typeof window.onDatasetReady === 'function') {
        window.onDatasetReady(window.dataset);
    }
}

// 加载一批文件
function loadBatch() {
    if (isAllDone) return;

    const end = Math.min(currentIndex + BATCH_SIZE - 1, MAX_PART_NUMBER);
    let loadedInBatch = 0;
    const totalInBatch = end - currentIndex + 1;

    for (let i = currentIndex; i <= end; i++) {
        const script = document.createElement('script');
        script.src = `part_${i}.js?v=${DATA_VERSION}`;

        script.onload = () => {
            const partData = window[`_part${i}`];
            if (partData && Array.isArray(partData)) {
                window.dataset.push(...partData);
                console.log(`✅ part_${i}.js 加载完成，累计 ${window.dataset.length}`);
            } else {
                console.warn(`⚠️ part_${i}.js 数据无效`);
            }
            delete window[`_part${i}`];
            loadedCount++;
            loadedInBatch++;

            if (loadedInBatch === totalInBatch) {
                currentIndex = end + 1;
                if (currentIndex <= MAX_PART_NUMBER) {
                    setTimeout(loadBatch, 150);
                } else {
                    allDone();
                }
            }
        };

        script.onerror = () => {
            console.error(`❌ part_${i}.js 加载失败，已跳过`);
            loadedCount++;
            loadedInBatch++;

            if (loadedInBatch === totalInBatch) {
                currentIndex = end + 1;
                if (currentIndex <= MAX_PART_NUMBER) {
                    setTimeout(loadBatch, 150);
                } else {
                    allDone();
                }
            }
        };

        document.head.appendChild(script);
    }
}

// 启动加载
console.log('🔄 开始分批加载 part 文件，每批', BATCH_SIZE, '个');
loadBatch();

// 兜底：5分钟后强制启用
setTimeout(function() {
    if (!isAllDone) {
        console.warn('⏰ 加载超时，强制启用');
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new Event('datasetReady'));
        }
        isAllDone = true;
    }
}, 300000);
