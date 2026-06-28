                    activeSettingsSubTab === 'delivery' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSaveDeliverySettings,
                                className: "settings-card-premium space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: `text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`,
                                                children: "Paramètres Globaux de Livraison Estimée"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2839,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-slate-500 mt-0.5",
                                                children: "Configurez l'heure limite de commande et le délai par défaut pour les estimations."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2842,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 2838,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: `text-[10px] font-semibold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`,
                                                        children: "Heure Limite (Cutoff Hour)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2849,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        max: "23",
                                                        value: deliveryForm.cutoffHour,
                                                        onChange: (e)=>setDeliveryForm({
                                                                ...deliveryForm,
                                                                cutoffHour: Math.max(0, Math.min(23, Number(e.target.value)))
                                                            }),
                                                        className: `w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition-all ${adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500/60 text-slate-800' : 'bg-slate-950 border-slate-900 focus:border-emerald-600/50 text-slate-200'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2852,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-slate-400",
                                                        children: "Les commandes reçues après cette heure sont considérées expédiées le lendemain."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2864,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2848,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: `text-[10px] font-semibold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`,
                                                        children: "Délai Minimal par Défaut (Jours)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2870,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        value: deliveryForm.defaultDaysMin,
                                                        onChange: (e)=>setDeliveryForm({
                                                                ...deliveryForm,
                                                                defaultDaysMin: Math.max(0, Number(e.target.value))
                                                            }),
                                                        className: `w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition-all ${adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500/60 text-slate-800' : 'bg-slate-950 border-slate-900 focus:border-emerald-600/50 text-slate-200'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2873,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2869,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: `text-[10px] font-semibold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`,
                                                        children: "Délai Maximal par Défaut (Jours)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2887,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        value: deliveryForm.defaultDaysMax,
                                                        onChange: (e)=>setDeliveryForm({
                                                                ...deliveryForm,
                                                                defaultDaysMax: Math.max(0, Number(e.target.value))
                                                            }),
                                                        className: `w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition-all ${adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500/60 text-slate-800' : 'bg-slate-950 border-slate-900 focus:border-emerald-600/50 text-slate-200'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2890,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2886,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 2847,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-end pt-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer",
                                            children: "Enregistrer les paramètres globaux"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                            lineNumber: 2905,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 2904,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                lineNumber: 2837,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "settings-card-premium space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: `text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`,
                                                children: "Règles de Livraison par Ville"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2917,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-slate-500 mt-0.5",
                                                children: "Définissez des délais de livraison spécifiques pour certaines villes (ex: Casablanca 1 jour, zones éloignées 3-5 jours)."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2920,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 2916,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: handleAddCityRule,
                                        className: "grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-900/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: `text-[10px] font-semibold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`,
                                                        children: "Ville"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2927,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Ex: Casablanca",
                                                        value: cityRuleForm.city,
                                                        onChange: (e)=>setCityRuleForm({
                                                                ...cityRuleForm,
                                                                city: e.target.value
                                                            }),
                                                        className: `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${adminTheme === 'light' ? 'bg-white border-slate-200 focus:border-emerald-500/60 text-slate-800' : 'bg-slate-950 border-slate-900 focus:border-emerald-600/50 text-slate-200'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2930,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2926,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: `text-[10px] font-semibold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`,
                                                        children: "Min Jours"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2944,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        value: cityRuleForm.daysMin,
                                                        onChange: (e)=>setCityRuleForm({
                                                                ...cityRuleForm,
                                                                daysMin: Math.max(0, Number(e.target.value))
                                                            }),
                                                        className: `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${adminTheme === 'light' ? 'bg-white border-slate-200 focus:border-emerald-500/60 text-slate-800' : 'bg-slate-950 border-slate-900 focus:border-emerald-600/50 text-slate-200'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2947,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2943,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: `text-[10px] font-semibold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`,
                                                        children: "Max Jours"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2961,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        value: cityRuleForm.daysMax,
                                                        onChange: (e)=>setCityRuleForm({
                                                                ...cityRuleForm,
                                                                daysMax: Math.max(0, Number(e.target.value))
                                                            }),
                                                        className: `w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${adminTheme === 'light' ? 'bg-white border-slate-200 focus:border-emerald-500/60 text-slate-800' : 'bg-slate-950 border-slate-900 focus:border-emerald-600/50 text-slate-200'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2964,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2960,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                className: "px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer h-[38px] flex items-center justify-center gap-1",
                                                children: "Ajouter la règle"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 2977,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 2925,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `overflow-x-auto rounded-2xl border ${adminTheme === 'light' ? 'border-slate-100 bg-white' : 'border-slate-900 bg-slate-950/20'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "w-full text-left border-collapse",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: `border-b text-[10px] uppercase font-bold tracking-wider ${adminTheme === 'light' ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-slate-900/50 border-slate-900 text-slate-400'}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-3 px-4",
                                                                children: "Ville"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                lineNumber: 2994,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-3 px-4",
                                                                children: "Min Jours"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                lineNumber: 2995,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-3 px-4",
                                                                children: "Max Jours"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                lineNumber: 2996,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-3 px-4 text-right",
                                                                children: "Actions"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                lineNumber: 2997,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                        lineNumber: 2991,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                    lineNumber: 2990,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: [
                                                        (settings.deliverySettings?.cityRules || []).map((r, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: "border-b border-slate-100 last:border-b-0 text-xs text-slate-700 hover:bg-slate-50/50",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-3 px-4 font-semibold text-slate-800 dark:text-slate-200",
                                                                        children: r.city
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                        lineNumber: 3003,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-3 px-4 font-mono font-bold text-primary",
                                                                        children: [
                                                                            r.daysMin,
                                                                            " ",
                                                                            r.daysMin > 1 ? 'jours' : 'jour'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                        lineNumber: 3004,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-3 px-4 font-mono font-bold text-primary",
                                                                        children: [
                                                                            r.daysMax,
                                                                            " ",
                                                                            r.daysMax > 1 ? 'jours' : 'jour'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                        lineNumber: 3005,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-3 px-4 text-right",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>handleDeleteCityRule(idx),
                                                                            className: "p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                                className: "w-4 h-4"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                                lineNumber: 3012,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                            lineNumber: 3007,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                        lineNumber: 3006,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, idx, true, {
                                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                lineNumber: 3002,
                                                                columnNumber: 23
                                                            }, this)),
                                                        (settings.deliverySettings?.cityRules || []).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                colSpan: 4,
                                                                className: "text-center py-8 text-slate-500 text-[11px]",
                                                                children: "Aucune règle spécifique par ville. Les délais par défaut s'appliqueront à toutes les villes."
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                                lineNumber: 3019,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                            lineNumber: 3018,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                    lineNumber: 3000,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                            lineNumber: 2989,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 2986,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                lineNumber: 2915,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                        lineNumber: 2835,
                        columnNumber: 11
                    }, this),