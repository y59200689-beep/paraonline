function SettingsTab() {
    const { settings, saveSettings } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SettingsContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSettings"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$UiContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUi"])();
    const { products } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ProductsContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProducts"])();
    const { adminTheme, currentUser, auditLogs, dashboardStats, operatorsList, handleSaveCoupon, handleDeleteCoupon, handleToggleCouponActive, handleSaveBanner, handleMoveBanner, handleAddFaq, handleDeleteFaq, handleCreateOperator, handleToggleOperatorStatus, handleSaveGeneralSettings, handleSaveCourierSettings, handleSaveLoyaltySettings, handleSavePaymentSettings, handleSaveNotificationTemplates } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AdminContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAdmin"])();
    // Local UI states
    const { activeSettingsSubTab, setActiveSettingsSubTab, isAddingCoupon, setIsAddingCoupon } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$AdminUIContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAdminUI"])();
    // MFA / Security states
    const [isMfaEnabled, setIsMfaEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMfaSetupOpen, setIsMfaSetupOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mfaSecret, setMfaSecret] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [mfaQrCode, setMfaQrCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [mfaCode, setMfaCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [mfaError, setMfaError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [mfaSuccess, setMfaSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Recovery codes states
    const [mfaRecoveryCodes, setMfaRecoveryCodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isRecoveryCodesVisible, setIsRecoveryCodesVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showInitialRecoveryCodes, setShowInitialRecoveryCodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isRegeneratingCodes, setIsRegeneratingCodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [copiedAllCodes, setCopiedAllCodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Password change states
    const [oldPassword, setOldPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [newPassword, setNewPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [confirmPassword, setConfirmPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [passwordError, setPasswordError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [passwordSuccess, setPasswordSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [resettingOperatorId, setResettingOperatorId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [resettingOperatorName, setResettingOperatorName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [ownerResetPasswordVal, setOwnerResetPasswordVal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [ownerResetError, setOwnerResetError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [ownerResetSuccess, setOwnerResetSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Webhook Test states
    const [webhookTestTrigger, setWebhookTestTrigger] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('pending');
    const [webhookTestLang, setWebhookTestLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('fr');
    const [webhookTestPhone, setWebhookTestPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('0661223344');
    const [webhookTestVars, setWebhookTestVars] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        customer_name: 'Imane Bennani',
        order_id: 'PO-78421',
        tracking_link: 'https://yalidine.com/track/YAL987654',
        cart_items: 'Sérum Éclat x1',
        cart_total: '350',
        discount_code: 'RAMADAN15',
        custom_message: 'Ceci est un message de test personnalisé.'
    });
    const [webhookTestResponse, setWebhookTestResponse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isTestingWebhook, setIsTestingWebhook] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [copiedSecret, setCopiedSecret] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [copiedUrl, setCopiedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [webhookSecretVal, setWebhookSecretVal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (settings.whatsappWebhookSecret) {
            setWebhookSecretVal(settings.whatsappWebhookSecret);
        }
    }, [
        settings.whatsappWebhookSecret
    ]);
    // Local states for Homepage Layout editor
    const [showTopRated, setShowTopRated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [topRatedTitleFr, setTopRatedTitleFr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [topRatedTitleAr, setTopRatedTitleAr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [topRatedProductIds, setTopRatedProductIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showBestSellers, setShowBestSellers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [bestSellersTitleFr, setBestSellersTitleFr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [bestSellersTitleAr, setBestSellersTitleAr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [bestSellersProductIds, setBestSellersProductIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showWeeklySales, setShowWeeklySales] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [weeklySalesTitleFr, setWeeklySalesTitleFr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [weeklySalesTitleAr, setWeeklySalesTitleAr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [weeklySalesProductIds, setWeeklySalesProductIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showSummerSale, setShowSummerSale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [summerSaleProductIds, setSummerSaleProductIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [featuredProductIds, setFeaturedProductIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Search dropdown states
    const [trSearch, setTrSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [trOpen, setTrOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [trReplaceIndex, setTrReplaceIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [trReplaceSearch, setTrReplaceSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [bsSearch, setBsSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [bsOpen, setBsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bsReplaceIndex, setBsReplaceIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [bsReplaceSearch, setBsReplaceSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [wsSearch, setWsSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [wsOpen, setWsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [wsReplaceIndex, setWsReplaceIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [wsReplaceSearch, setWsReplaceSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [ssSearch, setSsSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [ssOpen, setSsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [ssReplaceIndex, setSsReplaceIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ssReplaceSearch, setSsReplaceSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [pvSearch, setPvSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [pvOpen, setPvOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pvReplaceIndex, setPvReplaceIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pvReplaceSearch, setPvReplaceSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (settings?.homepageSections) {
            const hp = settings.homepageSections;
            setShowTopRated(hp.showTopRated ?? true);
            setTopRatedTitleFr(hp.topRatedTitleFr || "Produits les Mieux Notés");
            setTopRatedTitleAr(hp.topRatedTitleAr || "المنتجات الأعلى تقييماً");
            if (hp.topRatedProductIds && hp.topRatedProductIds.length > 0) {
                setTopRatedProductIds(hp.topRatedProductIds);
            } else if (products.length > 0) {
                const liveTopRated = [
                    ...products
                ].sort((a, b)=>b.rating - a.rating).slice(0, 7).map((p)=>p.id);
                setTopRatedProductIds(liveTopRated);
            } else {
                setTopRatedProductIds([]);
            }
            setShowBestSellers(hp.showBestSellers ?? true);
            setBestSellersTitleFr(hp.bestSellersTitleFr || "Produits les Plus Vendus");
            setBestSellersTitleAr(hp.bestSellersTitleAr || "المنتجات الأكثر مبيعاً");
            if (hp.bestSellersProductIds && hp.bestSellersProductIds.length > 0) {
                setBestSellersProductIds(hp.bestSellersProductIds);
            } else if (products.length > 0) {
                const liveBestSellers = [
                    ...products
                ].sort((a, b)=>(b.reviews ?? 0) - (a.reviews ?? 0)).slice(0, 4).map((p)=>p.id);
                setBestSellersProductIds(liveBestSellers);
            } else {
                setBestSellersProductIds([]);
            }
            setShowWeeklySales(hp.showWeeklySales ?? true);
            setWeeklySalesTitleFr(hp.weeklySalesTitleFr || "Meilleures Ventes de la Semaine");
            setWeeklySalesTitleAr(hp.weeklySalesTitleAr || "أفضل المنتجات مبيعاً");
            if (hp.weeklySalesProductIds && hp.weeklySalesProductIds.length > 0) {
                setWeeklySalesProductIds(hp.weeklySalesProductIds);
            } else if (products.length > 0) {
                const liveWeeklySales = [
                    ...products
                ].sort((a, b)=>(b.reviews ?? 0) - (a.reviews ?? 0)).slice(4, 8).map((p)=>p.id);
                setWeeklySalesProductIds(liveWeeklySales);
            } else {
                setWeeklySalesProductIds([]);
            }
            setShowSummerSale(hp.showSummerSale ?? true);
            if (hp.summerSaleProductIds && hp.summerSaleProductIds.length > 0) {
                setSummerSaleProductIds(hp.summerSaleProductIds);
            } else if (products.length > 0) {
                const liveSummer = [
                    3,
                    9,
                    18,
                    108
                ].filter((id)=>products.some((p)=>p.id === id));
                setSummerSaleProductIds(liveSummer.length > 0 ? liveSummer : products.slice(0, 4).map((p)=>p.id));
            } else {
                setSummerSaleProductIds([]);
            }
            if (hp.featuredProductIds && hp.featuredProductIds.length > 0) {
                setFeaturedProductIds(hp.featuredProductIds);
            } else if (products.length > 0) {
                // Pre-populate with the first 15 products by default order (id ascending)
                const fallback = [
                    ...products
                ].sort((a, b)=>a.id - b.id).slice(0, 15).map((p)=>p.id);
                setFeaturedProductIds(fallback);
            } else {
                setFeaturedProductIds([]);
            }
        }
    }, [
        settings,
        products
    ]);
    const handleCopyText = (text, type)=>{
        navigator.clipboard.writeText(text);
        if (type === 'secret') {
            setCopiedSecret(true);
            setTimeout(()=>setCopiedSecret(false), 2000);
        } else {
            setCopiedUrl(true);
            setTimeout(()=>setCopiedUrl(false), 2000);
        }
        showToast("Copié dans le presse-papier !", 'success');
    };
    const handleGenerateSecret = ()=>{
        const newSecret = "whsec_wa_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        setWebhookSecretVal(newSecret);
        showToast("Nouveau secret généré ! N'oubliez pas d'enregistrer les modifications.", 'info');
    };
    const handleTestWebhook = async ()=>{
        setIsTestingWebhook(true);
        setWebhookTestResponse(null);
        try {
            const payload = {
                phone: webhookTestPhone,
                trigger: webhookTestTrigger,
                variables: {
                    customer_name: webhookTestVars.customer_name,
                    order_id: webhookTestVars.order_id,
                    tracking_link: webhookTestVars.tracking_link,
                    cart_items: webhookTestVars.cart_items,
                    cart_total: webhookTestVars.cart_total,
                    discount_code: webhookTestVars.discount_code,
                    custom_message: webhookTestVars.custom_message
                },
                lang: webhookTestLang
            };
            const res = await fetch('/api/webhooks/whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': webhookSecretVal
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setWebhookTestResponse({
                status: res.status,
                statusText: res.statusText,
                data
            });
            if (res.ok && data.success) {
                showToast("Webhook test exécuté avec succès !", 'success');
            } else {
                showToast(`Échec du webhook: ${data.error || 'Erreur inconnue'}`, 'error');
            }
        } catch (e) {
            setWebhookTestResponse({
                status: 500,
                statusText: 'Internal Error',
                data: {
                    error: e.message || 'Network error'
                }
            });
            showToast("Erreur réseau lors de l'envoi du webhook.", 'error');
        } finally{
            setIsTestingWebhook(false);
        }
    };
    // Fetch current user MFA state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (activeSettingsSubTab === 'security' && currentUser) {
            const fetchMfaStatus = async ()=>{
                try {
                    const res = await fetch('/api/admin/auth/me');
                    const data = await res.json();
                    if (data.success && data.user) {
                        setIsMfaEnabled(data.user.mfaEnabled === true);
                    }
                } catch (e) {
                    console.error("Error fetching MFA status:", e);
                }
            };
            fetchMfaStatus();
        }
    }, [
        activeSettingsSubTab,
        currentUser
    ]);
    const [selectedBannerIndex, setSelectedBannerIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [bannerForm, setBannerForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        tagFr: '',
        tagAr: '',
        titleFr: '',
        titleAr: '',
        descFr: '',
        descAr: '',
        ctaFr: '',
        ctaAr: '',
        bgImage: '',
        linkType: 'category',
        linkValue: ''
    });
    const [isAddingFaq, setIsAddingFaq] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [faqForm, setFaqForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        q_fr: '',
        a_fr: '',
        q_ar: '',
        a_ar: ''
    });
    const [isAddingOperator, setIsAddingOperator] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isUploading, setIsUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Gift product search pickers ─────────────────────────────────────────
    // Default gift picker
    const [defaultGiftSearch, setDefaultGiftSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [defaultGiftOpen, setDefaultGiftOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [defaultGiftId, setDefaultGiftId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(settings.dailyGiftProductId || 22);
    // Range gift picker (inside the "add range" form)
    const [rangeGiftSearch, setRangeGiftSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [rangeGiftOpen, setRangeGiftOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rangeGiftId, setRangeGiftId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Keep default gift id in sync when settings load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (settings.dailyGiftProductId) setDefaultGiftId(settings.dailyGiftProductId);
    }, [
        settings.dailyGiftProductId
    ]);
    const [notifTemplates, setNotifTemplates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [isSavingNotifTemplates, setIsSavingNotifTemplates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [paymentForm, setPaymentForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        onlinePaymentEnabled: false,
        stripeEnabled: false,
        stripePublishableKey: '',
        stripeSecretKey: '',
        stripeWebhookSecret: '',
        cmiEnabled: false,
        cmiMerchantId: '',
        cmiStoreKey: '',
        cmiApiUrl: 'https://testpayment.cmi.co.ma/fim/est3Dgate',
        testMode: true
    });
    const [automationQueue, setAutomationQueue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 'aq_1',
            type: 'abandoned_cart',
            clientName: 'Fatima Zohra',
            phone: '+212 661-492815',
            scheduledAt: new Date(Date.now() + 3600000 * 1.5).toLocaleString('fr-FR'),
            status: 'pending'
        },
        {
            id: 'aq_2',
            type: 'order_delivered',
            clientName: 'Yassine Alami',
            phone: '+212 654-889102',
            scheduledAt: new Date(Date.now() + 3600000 * 24 * 3).toLocaleString('fr-FR'),
            status: 'pending'
        },
        {
            id: 'aq_3',
            type: 'order_shipped',
            clientName: 'Meriem Bensalah',
            phone: '+212 613-228954',
            scheduledAt: new Date(Date.now() + 3600000 * 5).toLocaleString('fr-FR'),
            status: 'pending'
        }
    ]);
    // Sync notifications templates with settings when mounted or changed
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (settings?.notificationTemplates) {
            setNotifTemplates({
                pendingFr: settings.notificationTemplates.pendingFr || '',
                pendingAr: settings.notificationTemplates.pendingAr || '',
                shippedFr: settings.notificationTemplates.shippedFr || '',
                shippedAr: settings.notificationTemplates.shippedAr || '',
                deliveredFr: settings.notificationTemplates.deliveredFr || '',
                deliveredAr: settings.notificationTemplates.deliveredAr || '',
                recoveryFr: settings.notificationTemplates.recoveryFr || '',
                recoveryAr: settings.notificationTemplates.recoveryAr || ''
            });
        }
    }, [
        settings
    ]);
    // Sync payment settings when settings change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (settings?.paymentSettings) {
            setPaymentForm({
                onlinePaymentEnabled: settings.paymentSettings.onlinePaymentEnabled || false,
                stripeEnabled: settings.paymentSettings.stripeEnabled || false,
                stripePublishableKey: settings.paymentSettings.stripePublishableKey || '',
                stripeSecretKey: settings.paymentSettings.stripeSecretKey || '',
                stripeWebhookSecret: settings.paymentSettings.stripeWebhookSecret || '',
                cmiEnabled: settings.paymentSettings.cmiEnabled || false,
                cmiMerchantId: settings.paymentSettings.cmiMerchantId || '',
                cmiStoreKey: settings.paymentSettings.cmiStoreKey || '',
                cmiApiUrl: settings.paymentSettings.cmiApiUrl || 'https://testpayment.cmi.co.ma/fim/est3Dgate',
                testMode: settings.paymentSettings.testMode ?? true
            });
        }
    }, [
        settings
    ]);
    // ── Delivery settings states ───────────────────────────────────────────
    const [deliveryForm, setDeliveryForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        cutoffHour: settings.deliverySettings?.cutoffHour ?? 14,
        defaultDaysMin: settings.deliverySettings?.defaultDaysMin ?? 1,
        defaultDaysMax: settings.deliverySettings?.defaultDaysMax ?? 2
    });
    const [cityRuleForm, setCityRuleForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        city: '',
        daysMin: 1,
        daysMax: 3
    });
    // Sync delivery settings when settings change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (settings?.deliverySettings) {
            setDeliveryForm({
                cutoffHour: settings.deliverySettings.cutoffHour ?? 14,
                defaultDaysMin: settings.deliverySettings.defaultDaysMin ?? 1,
                defaultDaysMax: settings.deliverySettings.defaultDaysMax ?? 2
            });
        }
    }, [
        settings
    ]);
    // Image upload handler
    const handleImageUpload = async (e, target)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                if (target === 'banner') {
                    setBannerForm((prev)=>({
                            ...prev,
                            bgImage: data.url
                        }));
                }
                showToast('Image téléversée avec succès !', 'success');
            } else {
                showToast('Échec du téléversement: ' + data.error, 'error');
            }
        } catch (err) {
            showToast('Erreur réseau lors du téléversement.', 'error');
        } finally{
            setIsUploading(false);
        }
    };
    const handleSaveDefaultGift = async (prodId)=>{
        const prod = products.find((p)=>p.id === prodId);
        if (prod) {
            const success = await saveSettings({
                ...settings,
                dailyGiftProductId: prodId,
                dailyGiftName: prod.nameFr || prod.name || prod.title
            });
            if (success) {
                showToast("Cadeau par défaut mis à jour avec succès !", 'success');
            } else {
                showToast("Échec de la mise à jour.", 'error');
            }
        }
    };
    const handleAddGiftRange = async (e)=>{
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const min = Number(data.get('minAmount'));
        const max = Number(data.get('maxAmount'));
        const prodId = Number(data.get('productId'));
        if (isNaN(min) || isNaN(max) || isNaN(prodId) || min < 0 || max < min) {
            showToast("Veuillez saisir des montants valides.", 'error');
            return;
        }
        const prod = products.find((p)=>p.id === prodId);
        if (!prod) {
            showToast("Produit sélectionné invalide.", 'error');
            return;
        }
        const newRange = {
            minAmount: min,
            maxAmount: max,
            productId: prodId,
            productName: prod.nameFr || prod.name || prod.title
        };
        const overlap = (settings.giftRanges || []).some((r)=>min >= r.minAmount && min <= r.maxAmount || max >= r.minAmount && max <= r.maxAmount);
        if (overlap) {
            showToast("Attention: Cette tranche chevauche une tranche existante.", 'warning');
        }
        const updated = [
            ...settings.giftRanges || [],
            newRange
        ];
        const success = await saveSettings({
            ...settings,
            giftRanges: updated
        });
        if (success) {
            showToast("Tranche de cadeau ajoutée avec succès !", 'success');
            form.reset();
        } else {
            showToast("Échec de la sauvegarde.", 'error');
        }
    };
    const handleDeleteGiftRange = async (idxToDelete)=>{
        const updated = (settings.giftRanges || []).filter((_, idx)=>idx !== idxToDelete);
        const success = await saveSettings({
            ...settings,
            giftRanges: updated
        });
        if (success) {
            showToast("Tranche de cadeau supprimée.", 'success');
        } else {
            showToast("Échec de la suppression.", 'error');
        }
    };
    const handleSaveDeliverySettings = async (e)=>{
        e.preventDefault();
        const updatedDeliverySettings = {
            ...settings.deliverySettings,
            cutoffHour: Number(deliveryForm.cutoffHour),
            defaultDaysMin: Number(deliveryForm.defaultDaysMin),
            defaultDaysMax: Number(deliveryForm.defaultDaysMax),
            cityRules: settings.deliverySettings?.cityRules || []
        };
        const success = await saveSettings({
            ...settings,
            deliverySettings: updatedDeliverySettings
        });
        if (success) {
            showToast("Paramètres de livraison sauvegardés avec succès !", 'success');
        } else {
            showToast("Échec de la sauvegarde.", 'error');
        }
    };
    const handleAddCityRule = async (e)=>{
        e.preventDefault();
        if (!cityRuleForm.city.trim()) {
            showToast("Veuillez saisir un nom de ville.", 'error');
            return;
        }
        const newRule = {
            city: cityRuleForm.city.trim(),
            daysMin: Number(cityRuleForm.daysMin),
            daysMax: Number(cityRuleForm.daysMax)
        };
        const currentRules = settings.deliverySettings?.cityRules || [];
        if (currentRules.some((r)=>r.city.toLowerCase() === newRule.city.toLowerCase())) {
            showToast("Une règle pour cette ville existe déjà.", 'warning');
            return;
        }
        const updatedRules = [
            ...currentRules,
            newRule
        ];
        const updatedDeliverySettings = {
            ...settings.deliverySettings || {
                cutoffHour: 14,
                defaultDaysMin: 1,
                defaultDaysMax: 2
            },
            cityRules: updatedRules
        };
        const success = await saveSettings({
            ...settings,
            deliverySettings: updatedDeliverySettings
        });
        if (success) {
            showToast("Règle de livraison par ville ajoutée !", 'success');
            setCityRuleForm({
                city: '',
                daysMin: 1,
                daysMax: 3
            });
        } else {
            showToast("Échec de l'ajout.", 'error');
        }
    };
    const handleDeleteCityRule = async (idxToDelete)=>{
        const currentRules = settings.deliverySettings?.cityRules || [];
        const updatedRules = currentRules.filter((_, idx)=>idx !== idxToDelete);
        const updatedDeliverySettings = {
            ...settings.deliverySettings || {
                cutoffHour: 14,
                defaultDaysMin: 1,
                defaultDaysMax: 2
            },
            cityRules: updatedRules
        };
        const success = await saveSettings({
            ...settings,
            deliverySettings: updatedDeliverySettings
        });
        if (success) {
            showToast("Règle de livraison par ville supprimée.", 'success');
        } else {
            showToast("Échec de la suppression.", 'error');
        }
    };
    // Form submit handlers wrapper
    const onSaveGeneralSettings = async (e)=>{
        e.preventDefault();
        const target = e.currentTarget;
        const formData = new FormData(target);
        const values = {
            storeName: String(formData.get('storeName')),
            storePhone: String(formData.get('storePhone')),
            storeWhatsApp: String(formData.get('storeWhatsApp')),
            freeShippingThreshold: Number(formData.get('freeShippingThreshold')) || 600,
            shippingFee: Number(formData.get('shippingFee')) || 35,
            announcementFr: String(formData.get('announcementFr')),
            announcementAr: String(formData.get('announcementAr')),
            quizDiscountPercent: Number(formData.get('quizDiscountPercent')) || 15,
            lowStockThreshold: Number(formData.get('lowStockThreshold')) || 5,
            adminPasscode: String(formData.get('adminPasscode') ?? '')
        };
        const success = await handleSaveGeneralSettings(values);
        if (success) {
            showToast("Paramètres généraux sauvegardés avec succès !", 'success');
        } else {
            showToast("Échec de la sauvegarde.", 'error');
        }
    };
    const handleSaveHomepageSettings = async (e)=>{
        e.preventDefault();
        const updated = {
            ...settings,
            homepageSections: {
                showTopRated,
                topRatedTitleFr,
                topRatedTitleAr,
                topRatedProductIds,
                showBestSellers,
                bestSellersTitleFr,
                bestSellersTitleAr,
                bestSellersProductIds,
                showWeeklySales,
                weeklySalesTitleFr,
                weeklySalesTitleAr,
                weeklySalesProductIds,
                showSummerSale,
                summerSaleProductIds,
                featuredProductIds
            }
        };
        const success = await saveSettings(updated);
        if (success) {
            showToast("Mise en page de l'accueil sauvegardée !", 'success');
        } else {
            showToast("Erreur lors de la sauvegarde.", 'error');
        }
    };
    const onSaveCourierSettings = async (e)=>{
        e.preventDefault();
        const target = e.currentTarget;
        const formData = new FormData(target);
        const values = {
            courierPartner: formData.get('courierPartner') || 'yalidine',
            courierMode: formData.get('courierMode') || 'simulation',
            yalidineApiKey: String(formData.get('yalidineApiKey')),
            yalidineApiId: String(formData.get('yalidineApiId')),
            cathedisApiKey: String(formData.get('cathedisApiKey')),
            courierApiKey: String(formData.get('yalidineApiKey') || formData.get('cathedisApiKey'))
        };
        const success = await handleSaveCourierSettings(values);
        if (success) {
            showToast("Paramètres d'expéditions sauvegardés !", 'success');
        } else {
            showToast("Échec de la sauvegarde.", 'error');
        }
    };
    const onSaveLoyaltySettings = async (e)=>{
        e.preventDefault();
        const target = e.currentTarget;
        const formData = new FormData(target);
        const values = {
            loyaltyPointsPerDh: Number(formData.get('loyaltyPointsPerDh')) || 1.0,
            loyaltyBronzeMultiplier: Number(formData.get('loyaltyBronzeMultiplier')) || 1.0,
            loyaltySilverMultiplier: Number(formData.get('loyaltySilverMultiplier')) || 1.2,
            loyaltyGoldMultiplier: Number(formData.get('loyaltyGoldMultiplier')) || 1.5,
            loyaltyPlatinumMultiplier: Number(formData.get('loyaltyPlatinumMultiplier')) || 2.0
        };
        const success = await handleSaveLoyaltySettings(values);
        if (success) {
            showToast("Règles du programme fidélité enregistrées !", 'success');
        } else {
            showToast("Échec de la sauvegarde.", 'error');
        }
    };
    const onSaveNotificationTemplates = async (e)=>{
        e.preventDefault();
        setIsSavingNotifTemplates(true);
        const target = e.currentTarget;
        const formData = new FormData(target);
        const formSettings = {
            whatsappProvider: String(formData.get('whatsappProvider')),
            twilioAccountSid: String(formData.get('twilioAccountSid')),
            twilioAuthToken: String(formData.get('twilioAuthToken')),
            twilioFromNumber: String(formData.get('twilioFromNumber')),
            whatsappCloudPhoneNumberId: String(formData.get('whatsappCloudPhoneNumberId')),
            whatsappCloudAccessToken: String(formData.get('whatsappCloudAccessToken')),
            whatsappWebhookSecret: String(formData.get('whatsappWebhookSecret'))
        };
        const success = await handleSaveNotificationTemplates(formSettings, notifTemplates);
        setIsSavingNotifTemplates(false);
        if (success) {
            showToast("Modèles de notifications sauvegardés avec succès !", 'success');
        } else {
            showToast("Échec de l'enregistrement des modèles.", 'error');
        }
    };
    const handleOpenBannerEdit = (index)=>{
        if (!settings.banners || !settings.banners[index]) return;
        setSelectedBannerIndex(index);
        setBannerForm(settings.banners[index]);
    };
    const onSaveBannerSubmit = async (e)=>{
        e.preventDefault();
        if (selectedBannerIndex === null) return;
        const success = await handleSaveBanner(selectedBannerIndex, bannerForm);
        if (success) {
            setSelectedBannerIndex(null);
            showToast("Bannière modifiée avec succès !", 'success');
        } else {
            showToast("Erreur lors de la sauvegarde de la bannière.", 'error');
        }
    };
    const onAddFaqSubmit = async (e)=>{
        e.preventDefault();
        const success = await handleAddFaq(faqForm);
        if (success) {
            setIsAddingFaq(false);
            setFaqForm({
                q_fr: '',
                a_fr: '',
                q_ar: '',
                a_ar: ''
            });
            showToast("Question FAQ ajoutée !", 'success');
        } else {
            showToast("Erreur lors de l'ajout.", 'error');
        }
    };
    const onDeleteFaqClick = async (index)=>{
        if (!confirm("Voulez-vous supprimer cette question de FAQ ?")) return;
        const success = await handleDeleteFaq(index);
        if (success) {
            showToast("Question FAQ supprimée.", 'success');
        } else {
            showToast("Erreur lors de la suppression.", 'error');
        }
    };
    const onCreateOperatorSubmit = async (e)=>{
        e.preventDefault();
        const target = e.currentTarget;
        const formData = new FormData(target);
        const formValues = {
            name: String(formData.get('name')),
            username: String(formData.get('username')),
            password: String(formData.get('password')),
            role: String(formData.get('role'))
        };
        const success = await handleCreateOperator(formValues);
        if (success) {
            setIsAddingOperator(false);
            target.reset();
            showToast("Opérateur créé avec succès !", 'success');
        }
    };
    const settingsNavTabs = [
        {
            id: 'general',
            label: 'Général',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$vertical$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sliders$3e$__["Sliders"],
            color: '#6366f1'
        },
        {
            id: 'homepage',
            label: 'Mise en page',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
            color: '#8b5cf6'
        },
        {
            id: 'banners',
            label: 'Bannières',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"],
            color: '#ec4899'
        },
        {
            id: 'shipping',
            label: 'Expéditions',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"],
            color: '#f59e0b'
        },
        {
            id: 'delivery',
            label: 'Délais',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
            color: '#f97316'
        },
        {
            id: 'payment',
            label: 'Paiements',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"],
            color: '#10b981'
        },
        {
            id: 'loyalty',
            label: 'Fidélité',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"],
            color: '#eab308'
        },
        {
            id: 'gifts',
            label: 'Cadeaux',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gift$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gift$3e$__["Gift"],
            color: '#ef4444'
        },
        {
            id: 'faq',
            label: 'FAQ',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
            color: '#14b8a6'
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"],
            color: '#3b82f6'
        },
        {
            id: 'logs',
            label: 'Audit',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
            color: '#6b7280'
        },
        {
            id: 'security',
            label: 'Sécurité',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"],
            color: '#dc2626'
        },
        ...currentUser?.role === 'owner' ? [
            {
                id: 'operators',
                label: 'Opérateurs',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                color: '#7c3aed'
            }
        ] : []
    ];
    const activeTab = settingsNavTabs.find((t)=>t.id === activeSettingsSubTab);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "admin-tab-enter settings-tab-view",
        style: {
            minHeight: '100vh',
            background: adminTheme === 'light' ? '#f4f7fb' : '#02050c'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: adminTheme === 'light' ? 'linear-gradient(160deg, #f0fdf9 0%, #ecfdf5 40%, #f8f9ff 100%)' : 'linear-gradient(160deg, #020d09 0%, #030f0b 40%, #040710 100%)',
                    borderBottom: adminTheme === 'light' ? '1px solid #d1fae5' : '1px solid #091a12',
                    padding: '0 32px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            paddingTop: '28px',
                            paddingBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '13px',
                                            flexShrink: 0,
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$vertical$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sliders$3e$__["Sliders"], {
                                            style: {
                                                width: '18px',
                                                height: '18px',
                                                color: '#fff'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                            lineNumber: 837,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 831,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: '9px',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.15em',
                                                    color: '#059669',
                                                    margin: '0 0 2px 0',
                                                    lineHeight: 1
                                                },
                                                children: "Administration"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 840,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                style: {
                                                    fontSize: '19px',
                                                    fontWeight: 800,
                                                    letterSpacing: '-0.03em',
                                                    color: adminTheme === 'light' ? '#0f172a' : '#e2e8f0',
                                                    margin: 0,
                                                    lineHeight: 1.1
                                                },
                                                children: "Paramètres de la Boutique"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                                lineNumber: 843,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 839,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                lineNumber: 830,
                                columnNumber: 11
                            }, this),
                            currentUser?.role !== 'owner' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    padding: '7px 13px',
                                    background: 'rgba(245,158,11,0.08)',
                                    border: '1px solid rgba(245,158,11,0.25)',
                                    borderRadius: '10px',
                                    flexShrink: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        style: {
                                            width: '12px',
                                            height: '12px',
                                            color: '#f59e0b'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 850,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            color: '#d97706',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em'
                                        },
                                        children: "Lecture seule"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 851,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                lineNumber: 849,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                        lineNumber: 829,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '2px',
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            marginLeft: '-8px'
                        },
                        children: settingsNavTabs.map((tab)=>{
                            const Icon = tab.icon;
                            const isActive = activeSettingsSubTab === tab.id;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setActiveSettingsSubTab(tab.id);
                                    setIsAddingCoupon(false);
                                    setSelectedBannerIndex(null);
                                    setIsAddingFaq(false);
                                },
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    padding: '10px 14px 12px 14px',
                                    cursor: 'pointer',
                                    border: 'none',
                                    borderBottom: isActive ? `2.5px solid ${tab.color}` : '2.5px solid transparent',
                                    background: isActive ? adminTheme === 'light' ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.035)' : 'transparent',
                                    borderRadius: '9px 9px 0 0',
                                    transition: 'all 0.17s ease',
                                    whiteSpace: 'nowrap',
                                    outline: 'none'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '7px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            background: isActive ? tab.color : adminTheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                                            transition: 'background 0.17s ease',
                                            boxShadow: isActive ? `0 3px 10px ${tab.color}55` : 'none'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            style: {
                                                width: '11px',
                                                height: '11px',
                                                color: isActive ? '#fff' : adminTheme === 'light' ? '#94a3b8' : '#475569'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                            lineNumber: 904,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 895,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '11.5px',
                                            fontWeight: isActive ? 700 : 500,
                                            letterSpacing: '-0.01em',
                                            color: isActive ? adminTheme === 'light' ? '#0f172a' : '#e2e8f0' : adminTheme === 'light' ? '#64748b' : '#475569',
                                            transition: 'color 0.17s ease'
                                        },
                                        children: tab.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                        lineNumber: 906,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, tab.id, true, {
                                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                                lineNumber: 870,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                        lineNumber: 857,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/SettingsTab.tsx",
                lineNumber: 819,
                columnNumber: 7
            }, this),
            activeTab && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 32px',
                    background: adminTheme === 'light' ? '#ffffff' : '#06090f',
                    borderBottom: adminTheme === 'light' ? '1px solid #f1f5f9' : '1px solid #0d1117',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: activeTab.color,
                            boxShadow: `0 0 8px ${activeTab.color}88`,
                            flexShrink: 0
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                        lineNumber: 940,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '12px',
                            fontWeight: 700,
                            color: adminTheme === 'light' ? '#0f172a' : '#e2e8f0',
                            letterSpacing: '-0.01em'
                        },
                        children: activeTab.label
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                        lineNumber: 946,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '11px',
                            color: adminTheme === 'light' ? '#cbd5e1' : '#334155',
                            marginLeft: '2px'
                        },
                        children: "·"
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                        lineNumber: 949,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '11px',
                            color: adminTheme === 'light' ? '#94a3b8' : '#475569'
                        },
                        children: [
                            activeTab.id === 'general' && "Variables globales de marque et administration",
                            activeTab.id === 'homepage' && "Sections et produits de la page accueil",
                            activeTab.id === 'banners' && 'Carrousel hero de la page accueil',
                            activeTab.id === 'shipping' && 'Configuration du partenaire expedition',
                            activeTab.id === 'delivery' && 'Delais de livraison par ville et horaires',
                            activeTab.id === 'payment' && 'Passerelles de paiement Stripe et CMI',
                            activeTab.id === 'loyalty' && 'Programme de fidelite et multiplicateurs',
                            activeTab.id === 'gifts' && 'Produits cadeaux automatiques selon panier',
                            activeTab.id === 'faq' && 'Questions et reponses frequentes',
                            activeTab.id === 'notifications' && 'Modeles WhatsApp et webhooks',
                            activeTab.id === 'logs' && 'Journal audit des actions administratives',
                            activeTab.id === 'security' && 'Authentification, 2FA et gestion acces',
                            activeTab.id === 'operators' && 'Gestion des comptes operateurs et permissions'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/SettingsTab.tsx",
                        lineNumber: 950,