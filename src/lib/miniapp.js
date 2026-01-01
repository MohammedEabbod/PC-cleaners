export const miniapp = {
    // Check if running in Hylid/SuperQi environment
    isNative: () => {
        const isNative = typeof window !== 'undefined' && (window.my || window.m_y);
        // Uncomment below to debug on device if needed
        // if (!isNative) alert('Not Native Environment: window.my is undefined');
        return isNative;
    },

    // Authentication
    getAuthCode: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.getAuthCode({
                    scopes: ['auth_base', 'USER_ID'],
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                // If not native, REJECT so we know it's not working, instead of fake success
                console.warn('Not in Native SuperQi Environment');
                alert('عذراً، هذا التطبيق يعمل فقط داخل تطبيق Super Qi');
                reject(new Error('Not Native Environment'));
            }
        });
    },

    // Get Location
    getLocation: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.getLocation({
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                alert('خدمة الموقع غير متاحة في المتصفح');
                reject(new Error('Location not supported in browser'));
            }
        });
    },

    // Payment
    tradePay: (paymentUrl) => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.tradePay({
                    paymentUrl: paymentUrl,
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                alert('الدفع غير متاح في المتصفح');
                reject(new Error('Payment not supported in browser'));
            }
        });
    },

    // Scan
    scan: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.scan({
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                alert('الماسح الضوئي غير متاح');
                reject(new Error('Scan not supported'));
            }
        });
    }
};
