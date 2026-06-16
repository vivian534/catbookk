// ============================================================
//  CatBook 数据加载器 v2.0（支持缓存）
// ============================================================

// ★★★★★ 每次添加新资源时，必须修改下面两个配置 ★★★★★
// 1. DATA_VERSION：改成新的日期或数字（例如 20260620）
// 2. MAX_PART_NUMBER：改成你最新的 part 文件编号（例如 52）
// ============================================================

const DATA_VERSION = '20260614';     // 例如：20260616（每次加资源后手动改大）
const MAX_PART_NUMBER = 51;          // 当前最大的 part_*.js 编号

// ============================================================

window.dataset = window.dataset || [];
let loadedCount = 0;

// 加载所有 part 文件（使用版本号，允许浏览器和 CDN 缓存）
for (let i = 1; i <= MAX_PART_NUMBER; i++) {
    const script = document.createElement('script');
    // 关键：只加版本号，不加时间戳和随机数，让缓存生效
    script.src = `part_${i}.js?v=${DATA_VERSION}`;
    script.onload = () => {
        const partData = window[`_part${i}`];
        if (partData && Array.isArray(partData)) {
            window.dataset.push(...partData);
            console.log(`✅ part_${i}.js 加载完成，新增 ${partData.length} 条，累计 ${window.dataset.length}`);
        } else {
            console.warn(`⚠️ part_${i}.js 数据无效`);
        }
        delete window[`_part${i}`];
        loadedCount++;
        if (loadedCount === MAX_PART_NUMBER) {
            console.log(`🎉 所有 ${MAX_PART_NUMBER} 个 part 文件加载完成，总计 ${window.dataset.length} 条`);
            // ★ 触发自定义事件，通知页面数据已就绪
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new Event('datasetReady'));
            }
            if (typeof window.onDatasetReady === 'function') {
                window.onDatasetReady(window.dataset);
            }
        }
    };
    script.onerror = () => {
        console.error(`❌ part_${i}.js 加载失败`);
        loadedCount++;
        if (loadedCount === MAX_PART_NUMBER) {
            console.log(`⚠️ 部分文件加载失败，但已加载 ${window.dataset.length} 条`);
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new Event('datasetReady'));
            }
            if (typeof window.onDatasetReady === 'function') {
                window.onDatasetReady(window.dataset);
            }
        }
    };
    document.head.appendChild(script);
}