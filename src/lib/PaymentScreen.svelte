<script>
    import { miniapp } from "./miniapp";
    import {
        user,
        selectedService,
        serviceMode,
        locationData,
        currentScreen,
        orderDetails,
    } from "./store";

    let processing = false;
    let success = false;
    let orderId = null;

    async function pay() {
        processing = true;
        try {
            // 1. Get Payment URL from Backend (as per Docs)
            const authToken = $user?.token || "mock_token_for_dev";
            let paymentUrl;

            if (miniapp.isNative()) {
                try {
                    const res = await fetch(
                        "https://its.mouamle.space/api/payment",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: authToken,
                            },
                            body: JSON.stringify({
                                amount: $selectedService.price,
                                serviceId: $selectedService.id,
                            }),
                        },
                    );
                    const data = await res.json();
                    paymentUrl = data.url;
                } catch (apiErr) {
                    console.error("Payment API Failed", apiErr);
                    alert("فشل إنشاء طلب الدفع مع السيرفر");
                    processing = false;
                    return;
                }
            } else {
                // Dev Mock URL
                paymentUrl = "https://www.wallet.com/cashier?orderId=mock_123";
            }

            // 2. Call Native Payment
            const res = await miniapp.tradePay(paymentUrl);

            console.log("Payment Result:", res);

            if (res.resultCode === "9000") {
                success = true;
                orderId = "ORD-" + Math.floor(Math.random() * 1000000);
                orderDetails.set({
                    id: orderId,
                    service: $selectedService,
                    mode: $serviceMode,
                    date: new Date().toISOString(),
                });
            } else {
                alert("Payment Failed or Cancelled");
            }
        } catch (e) {
            console.error(e);
            alert("Payment Error");
        } finally {
            processing = false;
        }
    }

    function goHome() {
        success = false;
        currentScreen.set("services");
    }
</script>

<div class="px-4 py-6 w-full max-w-md mx-auto h-full flex flex-col pt-10">
    {#if !success}
        <h2
            class="text-3xl font-bold text-white text-center mb-8 drop-shadow-md"
        >
            تأكيد الحجز
        </h2>

        <div
            class="glass-card p-8 rounded-[2rem] flex-grow mb-8 flex flex-col relative z-10 border-t border-white/20"
        >
            <div class="space-y-6">
                <div class="flex justify-between border-b border-white/10 pb-4">
                    <span class="text-gray-400 font-medium"
                        >الخدمة المختارة</span
                    >
                    <span class="font-bold text-white text-lg"
                        >{$selectedService?.name}</span
                    >
                </div>

                <div class="flex justify-between border-b border-white/10 pb-4">
                    <span class="text-gray-400 font-medium">نوع الخدمة</span>
                    <span class="font-bold text-white">
                        {$serviceMode === "home"
                            ? "🏠 خدمة منزلية"
                            : "🏢 في المركز"}
                    </span>
                </div>

                {#if $serviceMode === "home" && $locationData}
                    <div class="flex flex-col border-b border-white/10 pb-4">
                        <span class="text-gray-400 mb-2 font-medium"
                            >عنوان الاستلام</span
                        >
                        <span
                            class="text-xs text-blue-200 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 leading-relaxed"
                        >
                            {$locationData.address ||
                                $locationData.latitude +
                                    ", " +
                                    $locationData.longitude}
                        </span>
                    </div>
                {/if}

                <div class="flex justify-between pt-4 items-end">
                    <span class="text-gray-400 font-medium mb-1"
                        >المجموع الكلي</span
                    >
                    <span class="text-3xl font-bold text-blue-400"
                        >{$selectedService?.price.toLocaleString()}<span
                            class="text-sm text-gray-500 ml-1">IQD</span
                        ></span
                    >
                </div>
            </div>
        </div>

        <!-- Payment Button -->
        <div class="mt-auto mb-6">
            <button
                on:click={pay}
                disabled={processing}
                class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white w-full py-4 rounded-2xl font-bold text-xl shadow-xl shadow-blue-900/50 border border-white/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {#if processing}
                    <svg
                        class="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        ></circle>
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    جاري تأكيد الحجز...
                {:else}
                    <span>دفع وتأكيد</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 opacity-75"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                {/if}
            </button>

            <button
                on:click={() => currentScreen.set("services")}
                class="mt-4 w-full py-3 text-gray-400 hover:text-white font-medium transition-colors text-sm"
            >
                الرجوع لتعديل الطلب
            </button>
        </div>
    {:else}
        <!-- SUCCESS STATE -->
        <div
            class="flex-grow flex flex-col items-center justify-center text-center animate-fade-in py-10"
        >
            <div class="relative mb-8">
                <div
                    class="absolute inset-0 bg-green-500 rounded-full blur-[40px] opacity-20"
                ></div>
                <div
                    class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl relative z-10 border border-green-400/30"
                >
                    <svg
                        class="h-12 w-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            </div>

            <h2 class="text-3xl font-bold text-white mb-2 drop-shadow-sm">
                تم الحجز!
            </h2>
            <p class="text-gray-400 mb-10 text-lg">
                شكراً لك، طلبك قيد المعالجة الآن
            </p>

            <div
                class="glass-card p-8 rounded-3xl w-full mb-8 relative overflow-hidden border-t border-white/20"
            >
                <div
                    class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"
                ></div>

                <p
                    class="text-sm text-gray-500 mb-2 uppercase tracking-wider font-bold"
                >
                    رقم الطلب Reference
                </p>
                <p
                    class="text-3xl font-mono font-bold text-white tracking-widest mb-6 drop-shadow-md select-all"
                >
                    {orderId}
                </p>

                <div
                    class="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto"
                >
                    <!-- Simulated QR -->
                    <div
                        class="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center text-gray-500 text-[10px] font-mono border-2 border-dashed border-gray-700"
                    >
                        QR CODE AREA
                    </div>
                </div>
                <p class="mt-4 text-xs text-gray-500">
                    يرجى إبراز هذا الرمز للموظف
                </p>
            </div>

            <button
                on:click={goHome}
                class="btn-primary w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-500/20"
                >العودة للرئيسية</button
            >
        </div>
    {/if}
</div>

<style>
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>
