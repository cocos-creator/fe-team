// iconfont 项目详情页：按分类（project_icon_name 第一段）分组展示图标
// 数据来源：/api/project/detail.json?pid=xxx，content script 与页面同域，自动携带登录 cookie
// 分组方式：移动原有 ul.block-icon-list 下的 <li> 节点（appendChild 重排，不销毁重建），保留页面自带交互
(function () {
    'use strict';

    // ==================== 配置与常量 ====================

    var STORAGE_KEY = 'iconfont-group-enabled';
    var BTN_ID = 'iconfont-group-btn';
    var GROUP_TITLE_CLASS = 'iconfont-group-title';
    var DEFAULT_GROUP_NAME = '未分组';

    // 当前 pid（从 URL projectId 解析）
    var currentPid = null;
    // 进入分组前保存的原始 <li> 顺序快照（关闭分组时按此还原；
    // iconfont 没暴露重渲染 API，只能自己存快照）
    var originalLiOrder = null;
    // 是否已应用分组（内存态，与 storage 同步）
    var groupEnabled = false;
    // 是否正在重排 DOM，防止 MutationObserver 自触发
    var isRearranging = false;
    // 上次分组应用后的 li id 顺序快照，用于检测 iconfont 自身排序变化
    var lastAppliedLiIds = null;
    var barObserver = null;

    // ==================== 日志 ====================

    function log() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[iconfont 分组]');
        console.log.apply(console, args);
    }

    function warn() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[iconfont 分组]');
        console.warn.apply(console, args);
    }

    // ==================== 数据层 ====================

    function getPidFromUrl() {
        var params = new URLSearchParams(window.location.search);
        // 实际页面参数为 projectId（驼峰），兼容 project_id
        return params.get('projectId') || params.get('project_id');
    }

    /**
     * 拉取项目图标列表
     * @param {string} pid
     * @returns {Promise<Array|null>} icons 数组；失败返回 null
     */
    async function fetchProjectDetail(pid) {
        var url = '/api/project/detail.json?pid=' + encodeURIComponent(pid) + '&t=' + Date.now() + '&ctoken=null';
        try {
            var res = await fetch(url, { credentials: 'same-origin' });
            if (!res.ok) {
                throw new Error('HTTP ' + res.status);
            }
            var json = await res.json();
            if (json.code !== 200 || !json.data) {
                throw new Error(json.message || '接口返回异常');
            }
            return json.data.icons || [];
        } catch (err) {
            warn('获取项目图标失败', err);
            return null;
        }
    }

    /**
     * 按 project_icon_name 第一段分组
     * @param {Array} icons
     * @returns {Array<{name: string, icons: Array}>} 分组数组，未分组排最后
     */
    function groupIcons(icons) {
        var map = new Map();
        icons.forEach(function (icon) {
            var fullName = icon.project_icon_name || icon.name || '';
            var groupName = fullName.indexOf('-') > -1 ? fullName.split('-')[0] : DEFAULT_GROUP_NAME;
            if (!groupName) {
                groupName = DEFAULT_GROUP_NAME;
            }
            if (!map.has(groupName)) {
                map.set(groupName, []);
            }
            map.get(groupName).push(icon);
        });
        var groups = Array.from(map.entries()).map(function (entry) {
            return { name: entry[0], icons: entry[1] };
        });
        // 未分组排最后，其余按名称排序
        groups.sort(function (a, b) {
            if (a.name === DEFAULT_GROUP_NAME) return 1;
            if (b.name === DEFAULT_GROUP_NAME) return -1;
            return a.name.localeCompare(b.name, 'zh-CN');
        });
        return groups;
    }

    // ==================== DOM 层 ====================

    function findIconList() {
        // 只接受项目详情页的图标列表；页面可能还有购物车等其他 ul.block-icon-list，不能误用
        return document.querySelector('.project-iconlist ul.block-icon-list');
    }

    /**
     * 从 li 的 class 里提取图标 id（J_icon_id_48527402 -> 48527402）
     */
    function getIconIdFromLi(li) {
        var match = li.className.match(/J_icon_id_(\d+)/);
        return match ? match[1] : null;
    }

    /**
     * 应用分组视图：重排 li，每组前面插入一个 div 标题
     * 标题用 grid-column: 1 / -1 独占一行，li 保持原有 grid 布局
     * 组的顺序来自 groupIcons（未分组最后，其余中文排序）；
     * 组内 li 顺序跟随当前 DOM 顺序，这样 iconfont 切排序方式后，组内顺序也对齐
     * @param {HTMLUListElement} ul
     * @param {Array} groups
     */
    function applyGroupedView(ul, groups) {
        if (!ul) return;
        isRearranging = true;
        try {
            // 保存原始顺序（仅第一次）
            if (!originalLiOrder) {
                originalLiOrder = Array.from(ul.querySelectorAll('li'));
            }
            // 清除旧的分组标题
            removeGroupTitles(ul);

            // 建立 id -> 组名 映射（来自接口数据）
            var idToGroup = new Map();
            groups.forEach(function (group) {
                group.icons.forEach(function (icon) {
                    idToGroup.set(String(icon.id), group.name);
                });
            });

            // 按 DOM 顺序把 li 分进组里（保证组内顺序 = iconfont 当前排序）
            // 同时记录每个 li 的 id，便于最后处理接口里没返回的"孤儿 li"
            var groupNameToLis = new Map();
            groups.forEach(function (group) {
                groupNameToLis.set(group.name, []);
            });
            var orphanLis = [];
            Array.from(ul.querySelectorAll('li')).forEach(function (li) {
                var id = getIconIdFromLi(li);
                var groupName = id && idToGroup.get(id);
                if (groupName) {
                    groupNameToLis.get(groupName).push(li);
                } else {
                    orphanLis.push(li);
                }
            });

            var fragment = document.createDocumentFragment();

            groups.forEach(function (group) {
                var lis = groupNameToLis.get(group.name);
                if (!lis || lis.length === 0) return;

                var title = document.createElement('div');
                title.className = GROUP_TITLE_CLASS;
                title.dataset.pid = currentPid;
                title.textContent = group.name + ' (' + lis.length + ')';
                fragment.appendChild(title);

                lis.forEach(function (li) {
                    fragment.appendChild(li);
                });
            });

            // 接口里没返回的 li（渲染差异）追加到最后，避免丢失
            orphanLis.forEach(function (li) {
                fragment.appendChild(li);
            });

            ul.appendChild(fragment);
            // 记录本次分组后的 li id 顺序，用于下次检测 iconfont 排序变化
            lastAppliedLiIds = Array.from(ul.querySelectorAll('li')).map(function (li) {
                return getIconIdFromLi(li);
            });
            log('已应用分组', groups.length + ' 个分类');
        } finally {
            isRearranging = false;
        }
    }

    /**
     * 对比当前 ul 中 li 顺序与上次分组后的顺序是否一致
     * 不一致说明 iconfont 自己重排了（切排序方式），需要重新分组
     */
    function isLiOrderChanged(ul) {
        if (!lastAppliedLiIds) return false;
        var currentIds = Array.from(ul.querySelectorAll('li')).map(function (li) {
            return getIconIdFromLi(li);
        });
        if (currentIds.length !== lastAppliedLiIds.length) return true;
        for (var i = 0; i < currentIds.length; i++) {
            if (currentIds[i] !== lastAppliedLiIds[i]) return true;
        }
        return false;
    }

    function removeGroupTitles(ul) {
        ul.querySelectorAll('.' + GROUP_TITLE_CLASS).forEach(function (title) {
            title.remove();
        });
    }

    /**
     * 还原为原始平铺顺序
     */
    function restoreOriginalView() {
        var ul = findIconList();
        if (!ul || !originalLiOrder) return;
        isRearranging = true;
        try {
            removeGroupTitles(ul);
            var fragment = document.createDocumentFragment();
            originalLiOrder.forEach(function (li) {
                if (li.isConnected) {
                    fragment.appendChild(li);
                }
            });
            ul.appendChild(fragment);
            originalLiOrder = null;
            lastAppliedLiIds = null;
            log('已还原原始列表');
        } finally {
            isRearranging = false;
        }
    }

    // ==================== 分组开关 ====================

    async function applyGroup() {
        if (!currentPid) {
            warn('当前页面缺少 projectId');
            return;
        }
        var requestPid = currentPid;
        var ul = findIconList();
        if (!ul) {
            warn('未找到 ul.block-icon-list');
            return;
        }
        var icons = await fetchProjectDetail(requestPid);
        if (!icons) {
            warn('接口请求失败，请确认已登录 iconfont');
            // 失败时回滚状态
            setEnabled(false, true);
            return;
        }
        if (icons.length === 0) {
            log('当前项目没有图标');
            return;
        }
        // fetch 期间用户可能又切换了项目，丢弃过期数据
        if (requestPid !== currentPid) {
            log('丢弃过期数据: 请求 pid=' + requestPid + ', 当前 pid=' + currentPid);
            return;
        }
        var groups = groupIcons(icons);
        applyGroupedView(ul, groups);
    }

    function setEnabled(enabled, silent) {
        groupEnabled = enabled;
        updateBtnState();
        saveEnabled(enabled);
        if (!silent) {
            if (enabled) {
                applyGroup();
            } else {
                restoreOriginalView();
            }
        }
    }

    // ==================== 开关按钮 ====================

    /**
     * 找到插入位置：.project-manage-bar 里最后一个 .bar-text.btn.btn-normal
     */
    function findBtnInsertAnchor() {
        var bar = document.querySelector('.project-manage-bar');
        if (!bar) return null;
        var btns = bar.querySelectorAll('.bar-text.btn.btn-normal');
        return btns.length > 0 ? btns[btns.length - 1] : null;
    }

    function createBtn() {
        if (document.getElementById(BTN_ID)) return true;
        var anchor = findBtnInsertAnchor();
        if (!anchor) return false;
        var btn = document.createElement('span');
        btn.id = BTN_ID;
        btn.className = 'bar-text btn btn-normal iconfont-group-btn';
        btn.title = '按 project_icon_name 第一段分组展示';
        btn.innerHTML = '<span class="iconfont-group-btn-text">按分类展示</span>';
        btn.addEventListener('click', function () {
            setEnabled(!groupEnabled);
        });
        anchor.parentNode.insertBefore(btn, anchor.nextSibling);
        updateBtnState();
        return true;
    }

    function ensureBtn() {
        if (document.getElementById(BTN_ID)) return;
        if (createBtn()) return;
        // bar 还没渲染，监听 bar 出现
        var bodyObserver = new MutationObserver(function () {
            if (createBtn()) {
                bodyObserver.disconnect();
            }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
        // 10 秒后停止监听
        setTimeout(function () {
            bodyObserver.disconnect();
        }, 10000);
    }

    function updateBtnState() {
        var btn = document.getElementById(BTN_ID);
        if (!btn) return;
        btn.classList.toggle('active', groupEnabled);
        btn.querySelector('.iconfont-group-btn-text').textContent = groupEnabled ? '还原列表' : '按分类展示';
    }

    // ==================== 持久化 ====================

    function saveEnabled(enabled) {
        var data = {};
        data[STORAGE_KEY] = enabled;
        chrome.storage.sync.set(data, function () {
            log('保存开关状态', enabled);
        });
    }

    function loadEnabled(callback) {
        chrome.storage.sync.get([STORAGE_KEY], function (result) {
            callback(result[STORAGE_KEY] === true);
        });
    }

    // ==================== SPA 适配 ====================

    function onRouteChange() {
        var pid = getPidFromUrl();
        if (!pid) {
            // 离开项目页：移除按钮，重置状态
            currentPid = null;
            originalLiOrder = null;
            var btn = document.getElementById(BTN_ID);
            if (btn) btn.remove();
            return;
        }
        currentPid = pid;
        ensureBtn();

        // 路由变化后列表通常重新渲染，重置快照
        originalLiOrder = null;

        if (groupEnabled) {
            delayApply();
        }
        observeBar();
    }

    /**
     * 延迟重试应用分组（等待列表渲染）
     * 3 次重试足够：observeBar 已是主力兜底，这里只是加快首次出现的体验
     */
    function delayApply() {
        [0, 500, 1500].forEach(function (time) {
            setTimeout(function () {
                if (!groupEnabled) return;
                var ul = findIconList();
                if (!ul) return;
                // 标题属于当前 pid 才认为已应用，否则重新分组
                var titles = ul.querySelectorAll('.' + GROUP_TITLE_CLASS);
                if (titles.length > 0 && titles[0].dataset.pid === String(currentPid)) return;
                applyGroup();
            }, time);
        });
    }

    /**
     * 监听 bar 父元素：切换排序/分类时 iconfont 会整体重渲染 bar 和 list，
     * 在这里统一检测按钮丢失、分组丢失和 iconfont 自身排序变化。
     */
    function observeBar() {
        var bar = document.querySelector('.project-manage-bar');
        if (!bar || !bar.parentElement) {
            setTimeout(observeBar, 500);
            return;
        }
        if (barObserver) {
            barObserver.disconnect();
        }
        var restoring = false;
        barObserver = new MutationObserver(function () {
            if (isRearranging || restoring) return;
            // 主动从 URL 读 pid，变了说明切换了项目
            var urlPid = getPidFromUrl();
            if (urlPid && urlPid !== currentPid) {
                currentPid = urlPid;
                originalLiOrder = null;
                lastAppliedLiIds = null;
            }
            var btnMissing = !document.getElementById(BTN_ID);
            var ul = findIconList();
            // 分组丢失 = 开关开 + (没标题 或 标题属于其他项目)
            // 排序变化 = 开关开 + li 顺序与上次分组结果不一致（iconfont 自己重排了）
            var groupLost = false;
            var orderChanged = false;
            if (groupEnabled && ul) {
                var titles = ul.querySelectorAll('.' + GROUP_TITLE_CLASS);
                if (titles.length === 0) {
                    groupLost = true;
                } else if (titles[0].dataset.pid !== String(currentPid)) {
                    groupLost = true;
                } else if (isLiOrderChanged(ul)) {
                    orderChanged = true;
                }
            }
            if (!btnMissing && !groupLost && !orderChanged) return;
            restoring = true;
            if (btnMissing) ensureBtn();
            if (groupLost || orderChanged) {
                // 列表被重新渲染或排序变化，重置快照后重新应用
                originalLiOrder = null;
                lastAppliedLiIds = null;
                applyGroup();
            }
            // 本次重排引发的 DOM 变化不再重复触发
            setTimeout(function () {
                restoring = false;
            }, 0);
        });
        barObserver.observe(bar.parentElement, { childList: true, subtree: true });
    }

    // ==================== 初始化 ====================

    function init() {
        loadEnabled(function (enabled) {
            groupEnabled = enabled;
            onRouteChange();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
